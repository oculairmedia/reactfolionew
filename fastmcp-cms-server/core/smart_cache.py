"""Smart caching with cache warming and intelligent invalidation."""

import asyncio
from typing import Any, Optional, Pattern
import re
from collections import defaultdict
from datetime import datetime, timedelta
from utils.logging import get_logger

logger = get_logger(__name__)


class SmartCache:
    """
    Enhanced cache with warming and invalidation strategies.

    Features:
    - Access tracking to identify hot keys
    - Proactive cache warming for frequently accessed resources
    - Pattern-based invalidation
    - TTL support per key
    - Statistics tracking

    Example:
        cache = SmartCache(default_ttl=300)

        # Set with TTL
        cache.set("key", value, ttl=60)

        # Get and track access
        value = cache.get("key")

        # Warm frequently accessed keys
        await cache.warm_frequently_accessed(client, threshold=10)

        # Smart invalidation
        cache.invalidate_smart("create", "projects")
    """

    def __init__(self, default_ttl: int = 300):
        """
        Initialize smart cache.

        Args:
            default_ttl: Default time-to-live in seconds
        """
        self.default_ttl = default_ttl
        self._cache: dict[str, Any] = {}
        self._expiry: dict[str, datetime] = {}
        self._access_counts: dict[str, int] = defaultdict(int)
        self._last_access: dict[str, datetime] = {}
        self._warming_tasks: dict[str, asyncio.Task] = {}
        self._lock = asyncio.Lock()

        # Statistics
        self._stats = {
            "hits": 0,
            "misses": 0,
            "sets": 0,
            "invalidations": 0,
            "warming_operations": 0,
        }

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache and track access.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        # Check expiry
        if key in self._expiry:
            if datetime.now() > self._expiry[key]:
                # Expired
                self.delete(key)
                self._stats["misses"] += 1
                return None

        # Get value
        value = self._cache.get(key)

        # Track access
        if value is not None:
            self._access_counts[key] += 1
            self._last_access[key] = datetime.now()
            self._stats["hits"] += 1
        else:
            self._stats["misses"] += 1

        return value

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """
        Set cache value with optional TTL.

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time-to-live in seconds (None = use default)
        """
        self._cache[key] = value
        self._stats["sets"] += 1

        # Set expiry
        ttl = ttl if ttl is not None else self.default_ttl
        if ttl > 0:
            self._expiry[key] = datetime.now() + timedelta(seconds=ttl)

    def delete(self, key: str) -> bool:
        """
        Delete key from cache.

        Args:
            key: Cache key

        Returns:
            True if key existed
        """
        existed = key in self._cache

        if existed:
            del self._cache[key]
            self._stats["invalidations"] += 1

        if key in self._expiry:
            del self._expiry[key]
        if key in self._access_counts:
            del self._access_counts[key]
        if key in self._last_access:
            del self._last_access[key]

        return existed

    def invalidate_pattern(self, pattern: str):
        """
        Invalidate all keys matching a pattern.

        Args:
            pattern: Regex pattern or glob-style pattern
                    (e.g., "collection:projects:*")
        """
        # Convert glob pattern to regex
        if "*" in pattern:
            regex_pattern = pattern.replace("*", ".*")
        else:
            regex_pattern = pattern

        compiled = re.compile(regex_pattern)

        # Find and delete matching keys
        keys_to_delete = [
            key for key in self._cache.keys()
            if compiled.match(key)
        ]

        for key in keys_to_delete:
            self.delete(key)

        logger.debug(
            f"Invalidated {len(keys_to_delete)} keys matching pattern",
            pattern=pattern,
        )

    def invalidate_smart(self, operation: str, collection: str):
        """
        Smart invalidation based on operation type.

        Different operations require different invalidation strategies.

        Args:
            operation: Operation that triggered invalidation
            collection: Collection that was modified
        """
        if operation in ["create", "delete", "batch_create", "batch_delete"]:
            # These operations affect collection listings
            pattern = f"collection:{collection}:*"
            self.invalidate_pattern(pattern)
            logger.debug(
                f"Invalidated collection listings",
                operation=operation,
                collection=collection,
            )

        elif operation in ["update", "batch_update"]:
            # Update affects specific documents and listings
            # Invalidate all cached collection queries
            pattern = f"collection:{collection}:*"
            self.invalidate_pattern(pattern)

        elif operation == "publish":
            # Publishing affects status filters
            pattern = f"collection:{collection}:*"
            self.invalidate_pattern(pattern)

    async def warm_frequently_accessed(
        self,
        client: Any,
        threshold: int = 10,
    ):
        """
        Proactively warm cache for frequently accessed resources.

        Args:
            client: CMSClient instance to fetch data
            threshold: Access count threshold for warming
        """
        async with self._lock:
            for key, count in self._access_counts.items():
                if count < threshold:
                    continue

                # Skip if already cached and not expired
                if key in self._cache:
                    if key not in self._expiry or datetime.now() < self._expiry[key]:
                        continue

                # Skip if already warming
                if key in self._warming_tasks:
                    task = self._warming_tasks[key]
                    if not task.done():
                        continue

                # Start warming this key
                logger.debug(f"Warming cache for hot key", key=key[:50], access_count=count)
                task = asyncio.create_task(self._warm_key(key, client))
                self._warming_tasks[key] = task
                self._stats["warming_operations"] += 1

    async def _warm_key(self, key: str, client: Any):
        """
        Warm a specific cache key.

        Args:
            key: Cache key to warm
            client: CMSClient instance
        """
        try:
            # Parse key to extract operation and params
            # Key format: "operation:param1:param2:..."
            parts = key.split(":")

            if parts[0] == "collection":
                # collection:projects:filters_hash
                collection = parts[1]
                result = await client.get_collection(
                    collection=collection,
                    use_cache=False,
                )
                self.set(key, result)
                logger.debug(f"Warmed collection cache", key=key[:50])

            elif parts[0] == "doc":
                # doc:projects:doc_id
                collection = parts[1]
                doc_id = parts[2]
                result = await client.get_document(
                    collection=collection,
                    doc_id=doc_id,
                    use_cache=False,
                )
                self.set(key, result)
                logger.debug(f"Warmed document cache", key=key[:50])

            elif parts[0] == "global":
                # global:slug
                global_slug = parts[1]
                result = await client.get_global(
                    global_slug=global_slug,
                    use_cache=False,
                )
                self.set(key, result)
                logger.debug(f"Warmed global cache", key=key[:50])

        except Exception as e:
            logger.error(f"Failed to warm cache key", key=key[:50], error=str(e))

        finally:
            # Remove from warming tasks
            if key in self._warming_tasks:
                del self._warming_tasks[key]

    def get_hot_keys(self, limit: int = 10) -> list[tuple[str, int]]:
        """
        Get most frequently accessed keys.

        Args:
            limit: Number of keys to return

        Returns:
            List of (key, access_count) tuples
        """
        sorted_keys = sorted(
            self._access_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return sorted_keys[:limit]

    def get_stats(self) -> dict:
        """
        Get cache statistics.

        Returns:
            Statistics dictionary
        """
        total_requests = self._stats["hits"] + self._stats["misses"]
        hit_rate = (
            (self._stats["hits"] / total_requests * 100)
            if total_requests > 0
            else 0
        )

        return {
            "size": len(self._cache),
            "hits": self._stats["hits"],
            "misses": self._stats["misses"],
            "hit_rate": round(hit_rate, 2),
            "sets": self._stats["sets"],
            "invalidations": self._stats["invalidations"],
            "warming_operations": self._stats["warming_operations"],
            "in_flight_warming": len([
                t for t in self._warming_tasks.values()
                if not t.done()
            ]),
        }

    def reset_stats(self):
        """Reset statistics counters."""
        self._stats = {
            "hits": 0,
            "misses": 0,
            "sets": 0,
            "invalidations": 0,
            "warming_operations": 0,
        }

    def clear(self):
        """Clear entire cache."""
        self._cache.clear()
        self._expiry.clear()
        self._access_counts.clear()
        self._last_access.clear()
        logger.info("Cache cleared")


async def cache_warming_task(cache: SmartCache, client: Any, interval: int = 300):
    """
    Background task to periodically warm cache.

    Args:
        cache: SmartCache instance
        client: CMSClient instance
        interval: Seconds between warming operations
    """
    logger.info(f"Starting cache warming task (interval: {interval}s)")

    while True:
        try:
            await asyncio.sleep(interval)
            await cache.warm_frequently_accessed(client, threshold=10)
            logger.debug("Cache warming cycle completed")

        except asyncio.CancelledError:
            logger.info("Cache warming task cancelled")
            break

        except Exception as e:
            logger.error("Error in cache warming task", error=str(e))

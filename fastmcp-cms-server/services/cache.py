"""Caching service for API responses."""

import time
from typing import Any, Optional, Dict
from config import Config
from utils.logging import get_logger

logger = get_logger(__name__)


class CacheEntry:
    """Represents a cached item with TTL."""

    def __init__(self, value: Any, ttl: int):
        """
        Initialize cache entry.

        Args:
            value: Value to cache
            ttl: Time to live in seconds
        """
        self.value = value
        self.expires_at = time.time() + ttl

    @property
    def is_valid(self) -> bool:
        """Check if cache entry is still valid."""
        return time.time() < self.expires_at


class CacheService:
    """Simple in-memory cache with TTL support."""

    def __init__(self):
        """Initialize cache service."""
        self._cache: Dict[str, CacheEntry] = {}
        self._enabled = Config.ENABLE_CACHING

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found or expired
        """
        if not self._enabled:
            return None

        entry = self._cache.get(key)
        if entry and entry.is_valid:
            logger.debug("Cache hit", key=key)
            return entry.value

        if entry:
            logger.debug("Cache entry expired", key=key)
            del self._cache[key]

        logger.debug("Cache miss", key=key)
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Set value in cache.

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (defaults to Config.CACHE_TTL)
        """
        if not self._enabled:
            return

        ttl = ttl or Config.CACHE_TTL
        self._cache[key] = CacheEntry(value, ttl)
        logger.debug("Cache set", key=key, ttl=ttl)

    def delete(self, key: str) -> None:
        """
        Delete value from cache.

        Args:
            key: Cache key
        """
        if key in self._cache:
            del self._cache[key]
            logger.debug("Cache deleted", key=key)

    def clear(self) -> None:
        """Clear all cached values."""
        self._cache.clear()
        logger.info("Cache cleared")

    def invalidate_pattern(self, pattern: str) -> None:
        """
        Invalidate all cache keys matching a pattern.

        Args:
            pattern: Pattern to match (simple string contains check)
        """
        keys_to_delete = [key for key in self._cache.keys() if pattern in key]
        for key in keys_to_delete:
            del self._cache[key]
        logger.info("Cache invalidated by pattern", pattern=pattern, count=len(keys_to_delete))

    def get_stats(self) -> dict:
        """
        Get cache statistics.

        Returns:
            Dictionary with cache stats
        """
        total = len(self._cache)
        valid = sum(1 for entry in self._cache.values() if entry.is_valid)
        expired = total - valid

        return {
            "enabled": self._enabled,
            "total_entries": total,
            "valid_entries": valid,
            "expired_entries": expired,
        }

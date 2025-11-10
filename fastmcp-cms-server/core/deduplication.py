"""Request deduplication for concurrent identical requests."""

import hashlib
import json
import asyncio
from typing import Callable, Any, TypeVar
from utils.logging import get_logger

logger = get_logger(__name__)

T = TypeVar('T')


class RequestDeduplicator:
    """
    Deduplicate concurrent requests for the same resource.

    When multiple concurrent requests are made for the same operation
    with the same parameters, only one request is executed and the
    result is shared with all waiters.

    This reduces load on the CMS and improves response times.

    Example:
        deduplicator = RequestDeduplicator()

        # Three concurrent requests for the same project
        results = await asyncio.gather(
            deduplicator.execute("get", get_handler, project_id="proj-1"),
            deduplicator.execute("get", get_handler, project_id="proj-1"),
            deduplicator.execute("get", get_handler, project_id="proj-1"),
        )
        # Only one actual request is made, result shared 3x
    """

    def __init__(self):
        """Initialize request deduplicator."""
        self._in_flight: dict[str, asyncio.Task] = {}
        self._lock = asyncio.Lock()
        self._stats = {
            "total_requests": 0,
            "deduplicated": 0,
        }

    def _make_key(self, operation: str, **params) -> str:
        """
        Generate cache key from operation and parameters.

        Args:
            operation: Operation name
            **params: Operation parameters

        Returns:
            Unique key for this operation+params combination
        """
        # Sort params to ensure consistent key generation
        param_str = json.dumps(params, sort_keys=True, default=str)
        param_hash = hashlib.md5(param_str.encode()).hexdigest()
        return f"{operation}:{param_hash}"

    async def execute(
        self,
        operation: str,
        handler: Callable[..., T],
        **params
    ) -> T:
        """
        Execute request with deduplication.

        If an identical request is already in-flight, wait for its
        result instead of making a duplicate request.

        Args:
            operation: Operation name
            handler: Async function to execute
            **params: Operation parameters

        Returns:
            Handler result
        """
        key = self._make_key(operation, **params)
        self._stats["total_requests"] += 1

        async with self._lock:
            # Check if request is already in-flight
            if key in self._in_flight:
                self._stats["deduplicated"] += 1
                logger.debug(
                    f"Deduplicating request",
                    operation=operation,
                    key_hash=key[:16],
                )
                # Wait for existing request
                task = self._in_flight[key]

        # If we found an existing request, wait for it
        if key in self._in_flight:
            return await self._in_flight[key]

        # Create new task for this request
        async with self._lock:
            # Double-check it wasn't added while we were waiting
            if key in self._in_flight:
                self._stats["deduplicated"] += 1
                return await self._in_flight[key]

            # Create new future for this request
            task = asyncio.create_task(handler(**params))
            self._in_flight[key] = task

        try:
            result = await task
            return result
        finally:
            async with self._lock:
                # Remove from in-flight
                if key in self._in_flight:
                    del self._in_flight[key]

    def get_stats(self) -> dict:
        """
        Get deduplication statistics.

        Returns:
            Statistics dictionary with:
            - total_requests: Total requests processed
            - deduplicated: Number of deduplicated requests
            - deduplication_rate: Percentage of deduplicated requests
            - in_flight: Current number of in-flight requests
        """
        total = self._stats["total_requests"]
        deduped = self._stats["deduplicated"]
        rate = (deduped / total * 100) if total > 0 else 0

        return {
            "total_requests": total,
            "deduplicated": deduped,
            "deduplication_rate": round(rate, 2),
            "in_flight": len(self._in_flight),
        }

    def reset_stats(self):
        """Reset statistics counters."""
        self._stats = {
            "total_requests": 0,
            "deduplicated": 0,
        }
        logger.debug("Request deduplication stats reset")

    async def clear(self):
        """
        Clear all in-flight requests.

        This will cancel all pending requests. Use with caution.
        """
        async with self._lock:
            for task in self._in_flight.values():
                if not task.done():
                    task.cancel()
            self._in_flight.clear()
        logger.info("Cleared all in-flight requests")

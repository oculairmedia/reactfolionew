"""Optimized connection pool for HTTP requests."""

import httpx
import asyncio
from typing import Optional
from utils.logging import get_logger
from config import Config

logger = get_logger(__name__)


class ConnectionPool:
    """
    Optimized connection pool for CMS requests.

    Features:
    - Persistent connections with keep-alive
    - HTTP/2 support for multiplexing
    - Configurable connection limits
    - Automatic connection reuse
    - Graceful shutdown

    Example:
        pool = ConnectionPool()
        client = await pool.get_client()
        response = await client.get("https://api.example.com")
        await pool.close()
    """

    def __init__(
        self,
        max_keepalive_connections: int = 20,
        max_connections: int = 100,
        keepalive_expiry: float = 30.0,
        timeout: float = 30.0,
        http2: bool = True,
    ):
        """
        Initialize connection pool.

        Args:
            max_keepalive_connections: Max connections to keep warm
            max_connections: Max total connections
            keepalive_expiry: Seconds to keep connections alive
            timeout: Request timeout in seconds
            http2: Enable HTTP/2 support
        """
        self.max_keepalive_connections = max_keepalive_connections
        self.max_connections = max_connections
        self.keepalive_expiry = keepalive_expiry
        self.timeout = timeout
        self.http2 = http2

        self._client: Optional[httpx.AsyncClient] = None
        self._lock = asyncio.Lock()
        self._request_count = 0
        self._error_count = 0

    async def get_client(self) -> httpx.AsyncClient:
        """
        Get or create shared HTTP client with optimized settings.

        Returns:
            Shared httpx.AsyncClient instance
        """
        async with self._lock:
            if self._client is None:
                logger.info(
                    "Creating HTTP client with connection pool",
                    max_keepalive=self.max_keepalive_connections,
                    max_connections=self.max_connections,
                    http2=self.http2,
                )

                # Configure connection limits
                limits = httpx.Limits(
                    max_keepalive_connections=self.max_keepalive_connections,
                    max_connections=self.max_connections,
                    keepalive_expiry=self.keepalive_expiry,
                )

                # Configure timeout
                timeout = httpx.Timeout(
                    connect=10.0,      # Connection timeout
                    read=self.timeout,  # Read timeout
                    write=10.0,        # Write timeout
                    pool=5.0,          # Pool timeout
                )

                # Create client
                self._client = httpx.AsyncClient(
                    limits=limits,
                    timeout=timeout,
                    http2=self.http2,
                    follow_redirects=True,
                    verify=True,  # Verify SSL certificates
                )

                logger.debug("HTTP client created successfully")

            return self._client

    async def request(
        self,
        method: str,
        url: str,
        **kwargs
    ) -> httpx.Response:
        """
        Make HTTP request using connection pool.

        Args:
            method: HTTP method (GET, POST, etc.)
            url: Request URL
            **kwargs: Additional arguments for request

        Returns:
            httpx.Response object
        """
        client = await self.get_client()

        try:
            self._request_count += 1
            response = await client.request(method, url, **kwargs)
            return response

        except Exception as e:
            self._error_count += 1
            logger.error(
                f"HTTP request failed",
                method=method,
                url=url[:100],
                error=str(e),
            )
            raise

    async def close(self):
        """Close connection pool and cleanup resources."""
        async with self._lock:
            if self._client:
                logger.info("Closing HTTP client connection pool")
                await self._client.aclose()
                self._client = None

                logger.debug(
                    "Connection pool closed",
                    total_requests=self._request_count,
                    errors=self._error_count,
                )

    def get_stats(self) -> dict:
        """
        Get connection pool statistics.

        Returns:
            Statistics dictionary
        """
        is_active = self._client is not None

        return {
            "active": is_active,
            "total_requests": self._request_count,
            "total_errors": self._error_count,
            "error_rate": (
                round(self._error_count / self._request_count * 100, 2)
                if self._request_count > 0
                else 0
            ),
            "config": {
                "max_keepalive_connections": self.max_keepalive_connections,
                "max_connections": self.max_connections,
                "keepalive_expiry": self.keepalive_expiry,
                "timeout": self.timeout,
                "http2": self.http2,
            },
        }

    async def health_check(self) -> bool:
        """
        Check if connection pool is healthy.

        Returns:
            True if healthy
        """
        try:
            client = await self.get_client()
            return client is not None
        except Exception:
            return False

    async def __aenter__(self):
        """Async context manager entry."""
        await self.get_client()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        # Don't close on context exit - allow reuse
        pass


# Global connection pool instance
_global_pool: Optional[ConnectionPool] = None
_pool_lock = asyncio.Lock()


async def get_global_pool() -> ConnectionPool:
    """
    Get global connection pool instance.

    Creates a singleton connection pool that can be shared across
    the application.

    Returns:
        Global ConnectionPool instance
    """
    global _global_pool

    async with _pool_lock:
        if _global_pool is None:
            logger.info("Initializing global connection pool")
            _global_pool = ConnectionPool(
                max_keepalive_connections=20,
                max_connections=100,
                keepalive_expiry=30.0,
                timeout=Config.REQUEST_TIMEOUT,
                http2=True,
            )

        return _global_pool


async def close_global_pool():
    """Close global connection pool."""
    global _global_pool

    async with _pool_lock:
        if _global_pool:
            await _global_pool.close()
            _global_pool = None
            logger.info("Global connection pool closed")

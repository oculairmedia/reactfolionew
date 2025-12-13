"""Middleware stack for operation execution."""

from typing import Callable, Any
from abc import ABC, abstractmethod
import time
import asyncio
from collections import defaultdict
from datetime import datetime, timedelta
from utils.logging import get_logger
from utils.errors import ValidationError
from services.audit import AuditService

logger = get_logger(__name__)


class RateLimitError(Exception):
    """Raised when rate limit is exceeded."""
    pass


class Middleware(ABC):
    """Base middleware class."""

    @abstractmethod
    async def process(
        self,
        operation: str,
        context: dict,
        next_handler: Callable,
        **kwargs
    ) -> dict:
        """
        Process request and call next middleware.

        Args:
            operation: Operation name
            context: Operation context/metadata
            next_handler: Next middleware in chain
            **kwargs: Operation parameters

        Returns:
            Operation result
        """
        pass


class LoggingMiddleware(Middleware):
    """Log all operations with timing."""

    async def process(
        self,
        operation: str,
        context: dict,
        next_handler: Callable,
        **kwargs
    ) -> dict:
        """Log operation execution."""
        logger.info(
            f"Starting operation: {operation}",
            collection=kwargs.get("collection"),
            doc_id=kwargs.get("doc_id") or kwargs.get("item_id"),
        )

        start = time.time()

        try:
            result = await next_handler(**kwargs)
            duration = time.time() - start

            logger.info(
                f"Completed operation: {operation}",
                duration_ms=round(duration * 1000, 2),
                success=result.get("success", True),
            )

            return result

        except Exception as e:
            duration = time.time() - start

            logger.error(
                f"Failed operation: {operation}",
                error=str(e),
                error_type=type(e).__name__,
                duration_ms=round(duration * 1000, 2),
            )
            raise


class RateLimitMiddleware(Middleware):
    """Rate limit operations using sliding window."""

    def __init__(self):
        """Initialize rate limiter."""
        self._windows: dict[str, list[datetime]] = defaultdict(list)
        self._lock = asyncio.Lock()

    async def process(
        self,
        operation: str,
        context: dict,
        next_handler: Callable,
        **kwargs
    ) -> dict:
        """Apply rate limiting."""
        # Get rate limit for this operation
        rate_limit = context.get("rate_limit")
        if not rate_limit:
            # No rate limit configured
            return await next_handler(**kwargs)

        # Check rate limit
        window_seconds = 60  # 1 minute window
        await self._check_rate_limit(operation, rate_limit, window_seconds)

        return await next_handler(**kwargs)

    async def _check_rate_limit(
        self,
        operation: str,
        limit: int,
        window_seconds: int
    ):
        """
        Check if operation is within rate limit.

        Args:
            operation: Operation name
            limit: Max requests per window
            window_seconds: Time window in seconds

        Raises:
            RateLimitError: If rate limit exceeded
        """
        async with self._lock:
            now = datetime.now()
            window_start = now - timedelta(seconds=window_seconds)

            # Get request timestamps for this operation
            timestamps = self._windows[operation]

            # Remove old timestamps outside window
            timestamps[:] = [ts for ts in timestamps if ts > window_start]

            # Check if limit exceeded
            if len(timestamps) >= limit:
                oldest = timestamps[0]
                wait_time = (oldest - window_start).total_seconds()

                raise RateLimitError(
                    f"Rate limit exceeded for {operation}: "
                    f"{limit} requests per {window_seconds}s. "
                    f"Retry after {wait_time:.1f}s"
                )

            # Add current request
            timestamps.append(now)

    def get_stats(self) -> dict:
        """Get rate limit statistics."""
        return {
            operation: len(timestamps)
            for operation, timestamps in self._windows.items()
        }

    def reset(self):
        """Reset rate limit counters."""
        self._windows.clear()


class ValidationMiddleware(Middleware):
    """Validate operation inputs."""

    async def process(
        self,
        operation: str,
        context: dict,
        next_handler: Callable,
        **kwargs
    ) -> dict:
        """Validate inputs before execution."""
        # Get validation rules for this operation
        required_params = context.get("required_params", [])
        allowed_params = context.get("allowed_params")

        # Check required parameters
        for param in required_params:
            if param not in kwargs or kwargs[param] is None:
                raise ValidationError(
                    f"Missing required parameter: {param}"
                )

        # Check for unknown parameters
        if allowed_params:
            for param in kwargs:
                if param not in allowed_params:
                    logger.warning(
                        f"Unknown parameter: {param}",
                        operation=operation,
                    )

        # Operation-specific validation
        if operation in ["batch_create", "batch_update", "batch_delete"]:
            items = kwargs.get("items", [])
            if not items:
                raise ValidationError(
                    f"Batch operation requires non-empty 'items' list"
                )
            if len(items) > 100:
                raise ValidationError(
                    f"Batch operation limited to 100 items, got {len(items)}"
                )

        return await next_handler(**kwargs)


class AuditMiddleware(Middleware):
    """Audit all operations with side effects."""

    def __init__(self, audit_service: AuditService = None):
        """Initialize audit middleware."""
        self.audit = audit_service or AuditService()

    async def process(
        self,
        operation: str,
        context: dict,
        next_handler: Callable,
        **kwargs
    ) -> dict:
        """Audit operation execution."""
        # Execute operation
        result = await next_handler(**kwargs)

        # Log audit trail for operations with side effects
        if context.get("side_effects"):
            resource_type = kwargs.get("collection") or context.get("resource_type")
            resource_id = (
                kwargs.get("doc_id")
                or kwargs.get("item_id")
                or kwargs.get("global_slug")
            )

            # Determine audit log type
            if operation in ["create", "batch_create"]:
                self.audit.log_create(
                    resource_type=resource_type,
                    resource_id=resource_id or result.get("documentId"),
                    data=kwargs.get("data"),
                    metadata={"operation": operation},
                )
            elif operation in ["update", "batch_update"]:
                self.audit.log_update(
                    resource_type=resource_type,
                    resource_id=resource_id,
                    before=kwargs.get("before"),
                    after=kwargs.get("data"),
                    metadata={"operation": operation},
                )
            elif operation in ["delete", "batch_delete"]:
                self.audit.log_delete(
                    resource_type=resource_type,
                    resource_id=resource_id,
                    data=kwargs.get("before"),
                    metadata={"operation": operation},
                )
            elif operation == "publish":
                self.audit.log_publish(
                    resource_type=resource_type,
                    resource_id=resource_id,
                    metadata={"operation": operation},
                )

        return result


class MiddlewareStack:
    """Execute operation through middleware stack."""

    def __init__(self, middlewares: list[Middleware] = None):
        """
        Initialize middleware stack.

        Args:
            middlewares: List of middleware instances
        """
        self.middlewares = middlewares or []

    def add_middleware(self, middleware: Middleware):
        """Add middleware to stack."""
        self.middlewares.append(middleware)

    async def execute(
        self,
        operation: str,
        context: dict,
        handler: Callable,
        **kwargs
    ) -> dict:
        """
        Execute operation through all middleware.

        Args:
            operation: Operation name
            context: Operation context/metadata
            handler: Final operation handler
            **kwargs: Operation parameters

        Returns:
            Operation result
        """
        async def _wrap_next(index: int, **kw):
            """Recursively wrap middleware."""
            if index >= len(self.middlewares):
                # End of middleware chain, execute handler
                return await handler(**kw)

            middleware = self.middlewares[index]
            return await middleware.process(
                operation,
                context,
                lambda **next_kw: _wrap_next(index + 1, **next_kw),
                **kw
            )

        return await _wrap_next(0, **kwargs)


def create_default_middleware_stack() -> MiddlewareStack:
    """
    Create default middleware stack with common middleware.

    Returns:
        MiddlewareStack with logging, rate limiting, validation, and audit
    """
    stack = MiddlewareStack([
        LoggingMiddleware(),
        RateLimitMiddleware(),
        ValidationMiddleware(),
        AuditMiddleware(),
    ])
    return stack

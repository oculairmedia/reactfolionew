"""Retry strategies for operations."""

from typing import Callable, Any, TypeVar
from dataclasses import dataclass
import asyncio
from utils.logging import get_logger
from utils.errors import CMSTimeoutError, CMSConnectionError

logger = get_logger(__name__)

T = TypeVar('T')


@dataclass
class RetryConfig:
    """Retry configuration for an operation."""
    max_retries: int
    backoff_factor: float
    retry_on: tuple[type[Exception], ...]
    timeout: int

    def __post_init__(self):
        """Validate configuration."""
        if self.max_retries < 0:
            raise ValueError("max_retries must be >= 0")
        if self.backoff_factor < 1:
            raise ValueError("backoff_factor must be >= 1")
        if self.timeout <= 0:
            raise ValueError("timeout must be > 0")


# Operation-specific retry configurations
RETRY_CONFIGS = {
    "create": RetryConfig(
        max_retries=3,
        backoff_factor=2.0,
        retry_on=(CMSTimeoutError, CMSConnectionError),
        timeout=30,
    ),
    "update": RetryConfig(
        max_retries=3,
        backoff_factor=2.0,
        retry_on=(CMSTimeoutError, CMSConnectionError),
        timeout=30,
    ),
    "get": RetryConfig(
        max_retries=5,  # Read operations can retry more
        backoff_factor=1.5,
        retry_on=(CMSTimeoutError, CMSConnectionError),
        timeout=15,
    ),
    "list": RetryConfig(
        max_retries=5,
        backoff_factor=1.5,
        retry_on=(CMSTimeoutError, CMSConnectionError),
        timeout=20,
    ),
    "delete": RetryConfig(
        max_retries=1,  # Destructive ops retry less
        backoff_factor=2.0,
        retry_on=(CMSTimeoutError,),  # Only retry on timeout
        timeout=30,
    ),
    "publish": RetryConfig(
        max_retries=2,
        backoff_factor=2.0,
        retry_on=(CMSTimeoutError, CMSConnectionError),
        timeout=30,
    ),
    "batch_create": RetryConfig(
        max_retries=2,
        backoff_factor=3.0,
        retry_on=(CMSTimeoutError, CMSConnectionError),
        timeout=120,  # Longer timeout for batch ops
    ),
    "batch_update": RetryConfig(
        max_retries=2,
        backoff_factor=3.0,
        retry_on=(CMSTimeoutError, CMSConnectionError),
        timeout=120,
    ),
    "batch_delete": RetryConfig(
        max_retries=1,
        backoff_factor=2.0,
        retry_on=(CMSTimeoutError,),
        timeout=120,
    ),
    "search": RetryConfig(
        max_retries=3,
        backoff_factor=2.0,
        retry_on=(CMSTimeoutError, CMSConnectionError),
        timeout=45,
    ),
    "export": RetryConfig(
        max_retries=2,
        backoff_factor=3.0,
        retry_on=(CMSTimeoutError, CMSConnectionError),
        timeout=60,
    ),
    "import": RetryConfig(
        max_retries=1,
        backoff_factor=2.0,
        retry_on=(CMSTimeoutError,),
        timeout=120,
    ),
}

# Default retry config for unknown operations
DEFAULT_RETRY_CONFIG = RetryConfig(
    max_retries=3,
    backoff_factor=2.0,
    retry_on=(CMSTimeoutError, CMSConnectionError),
    timeout=30,
)


async def execute_with_retry(
    operation: str,
    handler: Callable[..., T],
    *args,
    **kwargs
) -> T:
    """
    Execute operation with operation-specific retry logic.

    Args:
        operation: Operation name (e.g., "create", "get")
        handler: Async function to execute
        *args: Positional arguments for handler
        **kwargs: Keyword arguments for handler

    Returns:
        Handler result

    Raises:
        Exception: If all retries exhausted

    Example:
        result = await execute_with_retry(
            "create",
            create_handler,
            collection="projects",
            data={...}
        )
    """
    config = RETRY_CONFIGS.get(operation, DEFAULT_RETRY_CONFIG)

    last_exception = None

    for attempt in range(config.max_retries + 1):
        try:
            # Execute with timeout
            result = await asyncio.wait_for(
                handler(*args, **kwargs),
                timeout=config.timeout
            )

            if attempt > 0:
                logger.info(
                    f"Operation succeeded after {attempt} retries",
                    operation=operation,
                )

            return result

        except asyncio.TimeoutError as e:
            last_exception = CMSTimeoutError(
                f"Operation timed out after {config.timeout}s"
            )

        except config.retry_on as e:
            last_exception = e

        except Exception as e:
            # Don't retry on other exceptions
            logger.error(
                f"Non-retryable error in operation",
                operation=operation,
                error=str(e),
                error_type=type(e).__name__,
            )
            raise

        # Check if we should retry
        if attempt < config.max_retries:
            wait_time = config.backoff_factor ** attempt
            logger.warning(
                f"Retry {attempt + 1}/{config.max_retries}",
                operation=operation,
                error=str(last_exception),
                wait_time=wait_time,
            )
            await asyncio.sleep(wait_time)
        else:
            logger.error(
                f"All retries exhausted for operation",
                operation=operation,
                attempts=attempt + 1,
                error=str(last_exception),
            )

    # All retries exhausted
    raise last_exception


def get_retry_config(operation: str) -> RetryConfig:
    """
    Get retry configuration for an operation.

    Args:
        operation: Operation name

    Returns:
        RetryConfig for the operation
    """
    return RETRY_CONFIGS.get(operation, DEFAULT_RETRY_CONFIG)


def register_retry_config(operation: str, config: RetryConfig):
    """
    Register custom retry configuration for an operation.

    Args:
        operation: Operation name
        config: Retry configuration
    """
    RETRY_CONFIGS[operation] = config
    logger.debug(f"Registered retry config for operation: {operation}")

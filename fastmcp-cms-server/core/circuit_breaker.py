"""Circuit breaker pattern for fault tolerance."""

from enum import Enum
from datetime import datetime, timedelta
from typing import Callable, Any, TypeVar
import asyncio
from utils.logging import get_logger
from utils.errors import CMSConnectionError

logger = get_logger(__name__)

T = TypeVar('T')


class CircuitState(Enum):
    """Circuit breaker states."""
    CLOSED = "closed"        # Normal operation
    OPEN = "open"            # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing recovery


class CircuitBreakerError(Exception):
    """Raised when circuit breaker is open."""
    pass


class CircuitBreaker:
    """
    Circuit breaker for CMS operations.

    Implements the circuit breaker pattern to prevent cascading failures.
    When failures exceed threshold, the circuit "opens" and fails fast,
    giving the system time to recover.

    States:
    - CLOSED: Normal operation, requests pass through
    - OPEN: Too many failures, reject all requests
    - HALF_OPEN: Testing if system has recovered

    Example:
        breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=60)
        result = await breaker.call(some_async_function, arg1, arg2)
    """

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        success_threshold: int = 2,
    ):
        """
        Initialize circuit breaker.

        Args:
            failure_threshold: Number of failures before opening circuit
            recovery_timeout: Seconds to wait before attempting recovery
            success_threshold: Consecutive successes needed to close circuit
        """
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: datetime | None = None
        self._lock = asyncio.Lock()

    async def call(self, func: Callable[..., T], *args, **kwargs) -> T:
        """
        Execute function with circuit breaker protection.

        Args:
            func: Async function to execute
            *args: Positional arguments for function
            **kwargs: Keyword arguments for function

        Returns:
            Function result

        Raises:
            CircuitBreakerError: If circuit is open
        """
        async with self._lock:
            # Check if circuit is open
            if self.state == CircuitState.OPEN:
                if self._should_attempt_reset():
                    logger.info("Circuit breaker attempting recovery (HALF_OPEN)")
                    self.state = CircuitState.HALF_OPEN
                    self.success_count = 0
                else:
                    time_remaining = self._time_until_recovery()
                    raise CircuitBreakerError(
                        f"Circuit breaker OPEN. Retry after {time_remaining}s"
                    )

        # Execute function
        try:
            result = await func(*args, **kwargs)
            await self._on_success()
            return result

        except Exception as e:
            await self._on_failure(e)
            raise

    async def _on_success(self):
        """Handle successful call."""
        async with self._lock:
            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                logger.debug(
                    f"Circuit breaker success in HALF_OPEN: "
                    f"{self.success_count}/{self.success_threshold}"
                )

                if self.success_count >= self.success_threshold:
                    logger.info("Circuit breaker recovered, closing circuit")
                    self.state = CircuitState.CLOSED
                    self.failure_count = 0
                    self.success_count = 0
                    self.last_failure_time = None
            else:
                # Reset failure count on any success in CLOSED state
                self.failure_count = 0

    async def _on_failure(self, error: Exception):
        """Handle failed call."""
        async with self._lock:
            self.failure_count += 1
            self.last_failure_time = datetime.now()

            logger.warning(
                f"Circuit breaker failure: {self.failure_count}/{self.failure_threshold}",
                error=str(error),
                state=self.state.value,
            )

            if self.failure_count >= self.failure_threshold:
                if self.state != CircuitState.OPEN:
                    logger.error(
                        f"Circuit breaker OPENING after {self.failure_count} failures"
                    )
                self.state = CircuitState.OPEN
                self.success_count = 0

    def _should_attempt_reset(self) -> bool:
        """Check if enough time has passed to attempt recovery."""
        if self.last_failure_time is None:
            return False
        elapsed = datetime.now() - self.last_failure_time
        return elapsed > timedelta(seconds=self.recovery_timeout)

    def _time_until_recovery(self) -> int:
        """Calculate seconds until recovery attempt."""
        if self.last_failure_time is None:
            return 0
        elapsed = datetime.now() - self.last_failure_time
        remaining = timedelta(seconds=self.recovery_timeout) - elapsed
        return max(0, int(remaining.total_seconds()))

    def get_state(self) -> dict:
        """Get current circuit breaker state."""
        return {
            "state": self.state.value,
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "last_failure_time": (
                self.last_failure_time.isoformat()
                if self.last_failure_time else None
            ),
            "time_until_recovery": self._time_until_recovery() if self.state == CircuitState.OPEN else None,
        }

    async def reset(self):
        """Manually reset circuit breaker to CLOSED state."""
        async with self._lock:
            logger.info("Circuit breaker manually reset")
            self.state = CircuitState.CLOSED
            self.failure_count = 0
            self.success_count = 0
            self.last_failure_time = None

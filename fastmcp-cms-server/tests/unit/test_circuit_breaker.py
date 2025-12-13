"""Unit tests for CircuitBreaker."""

import pytest
import asyncio
from datetime import datetime, timedelta
from core.circuit_breaker import CircuitBreaker, CircuitState, CircuitBreakerError


@pytest.mark.unit
class TestCircuitBreaker:
    """Tests for CircuitBreaker."""

    @pytest.mark.asyncio
    async def test_initial_state_is_closed(self, circuit_breaker):
        """Test that circuit breaker starts in CLOSED state."""
        assert circuit_breaker.state == CircuitState.CLOSED
        assert circuit_breaker.failure_count == 0
        assert circuit_breaker.success_count == 0

    @pytest.mark.asyncio
    async def test_successful_call(self, circuit_breaker):
        """Test successful call through circuit breaker."""
        async def successful_func():
            return "success"

        result = await circuit_breaker.call(successful_func)
        assert result == "success"
        assert circuit_breaker.state == CircuitState.CLOSED
        assert circuit_breaker.failure_count == 0

    @pytest.mark.asyncio
    async def test_failed_call(self, circuit_breaker):
        """Test failed call through circuit breaker."""
        async def failing_func():
            raise ValueError("Test error")

        with pytest.raises(ValueError):
            await circuit_breaker.call(failing_func)

        assert circuit_breaker.failure_count == 1
        assert circuit_breaker.state == CircuitState.CLOSED  # Still closed (threshold = 3)

    @pytest.mark.asyncio
    async def test_circuit_opens_after_threshold_failures(self, circuit_breaker):
        """Test that circuit opens after failure threshold reached."""
        async def failing_func():
            raise ValueError("Test error")

        # Fail 3 times (threshold)
        for i in range(3):
            with pytest.raises(ValueError):
                await circuit_breaker.call(failing_func)

        # Circuit should now be OPEN
        assert circuit_breaker.state == CircuitState.OPEN
        assert circuit_breaker.failure_count == 3

    @pytest.mark.asyncio
    async def test_circuit_rejects_calls_when_open(self, circuit_breaker):
        """Test that open circuit rejects calls."""
        async def failing_func():
            raise ValueError("Test error")

        # Open the circuit
        for i in range(3):
            with pytest.raises(ValueError):
                await circuit_breaker.call(failing_func)

        # Now circuit is OPEN, should reject new calls
        async def should_not_be_called():
            pytest.fail("This should not be called")

        with pytest.raises(CircuitBreakerError) as exc_info:
            await circuit_breaker.call(should_not_be_called)

        assert "Circuit breaker OPEN" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_circuit_attempts_recovery_after_timeout(self, circuit_breaker):
        """Test that circuit attempts recovery after timeout."""
        async def failing_func():
            raise ValueError("Test error")

        # Open the circuit
        for i in range(3):
            with pytest.raises(ValueError):
                await circuit_breaker.call(failing_func)

        assert circuit_breaker.state == CircuitState.OPEN

        # Wait for recovery timeout (5 seconds)
        await asyncio.sleep(5.1)

        # Next call should transition to HALF_OPEN
        async def successful_func():
            return "success"

        result = await circuit_breaker.call(successful_func)
        assert result == "success"
        assert circuit_breaker.success_count == 1

    @pytest.mark.asyncio
    async def test_circuit_closes_after_success_threshold(self, circuit_breaker):
        """Test that circuit closes after success threshold in HALF_OPEN state."""
        async def failing_func():
            raise ValueError("Test error")

        async def successful_func():
            return "success"

        # Open the circuit
        for i in range(3):
            with pytest.raises(ValueError):
                await circuit_breaker.call(failing_func)

        # Wait for recovery
        await asyncio.sleep(5.1)

        # Succeed twice (success_threshold = 2)
        await circuit_breaker.call(successful_func)
        await circuit_breaker.call(successful_func)

        # Circuit should be CLOSED now
        assert circuit_breaker.state == CircuitState.CLOSED
        assert circuit_breaker.failure_count == 0
        assert circuit_breaker.success_count == 0

    @pytest.mark.asyncio
    async def test_circuit_reopens_on_failure_in_half_open(self, circuit_breaker):
        """Test that circuit reopens if failure occurs in HALF_OPEN state."""
        async def failing_func():
            raise ValueError("Test error")

        async def successful_func():
            return "success"

        # Open the circuit
        for i in range(3):
            with pytest.raises(ValueError):
                await circuit_breaker.call(failing_func)

        # Wait for recovery
        await asyncio.sleep(5.1)

        # One success
        await circuit_breaker.call(successful_func)

        # Then a failure
        with pytest.raises(ValueError):
            await circuit_breaker.call(failing_func)

        # Circuit should be OPEN again
        assert circuit_breaker.state == CircuitState.OPEN

    @pytest.mark.asyncio
    async def test_get_state(self, circuit_breaker):
        """Test get_state returns correct information."""
        state = circuit_breaker.get_state()

        assert state["state"] == "closed"
        assert state["failure_count"] == 0
        assert state["success_count"] == 0
        assert state["last_failure_time"] is None

    @pytest.mark.asyncio
    async def test_manual_reset(self, circuit_breaker):
        """Test manual reset of circuit breaker."""
        async def failing_func():
            raise ValueError("Test error")

        # Open the circuit
        for i in range(3):
            with pytest.raises(ValueError):
                await circuit_breaker.call(failing_func)

        assert circuit_breaker.state == CircuitState.OPEN

        # Manual reset
        await circuit_breaker.reset()

        assert circuit_breaker.state == CircuitState.CLOSED
        assert circuit_breaker.failure_count == 0
        assert circuit_breaker.success_count == 0

    @pytest.mark.asyncio
    async def test_failure_resets_on_success_in_closed_state(self, circuit_breaker):
        """Test that failure count resets on success in CLOSED state."""
        async def failing_func():
            raise ValueError("Test error")

        async def successful_func():
            return "success"

        # Fail once
        with pytest.raises(ValueError):
            await circuit_breaker.call(failing_func)
        assert circuit_breaker.failure_count == 1

        # Then succeed
        await circuit_breaker.call(successful_func)

        # Failure count should reset
        assert circuit_breaker.failure_count == 0

    @pytest.mark.asyncio
    async def test_time_until_recovery(self, circuit_breaker):
        """Test time_until_recovery calculation."""
        async def failing_func():
            raise ValueError("Test error")

        # Circuit is closed, no recovery time
        assert circuit_breaker._time_until_recovery() == 0

        # Open the circuit
        for i in range(3):
            with pytest.raises(ValueError):
                await circuit_breaker.call(failing_func)

        # Should have recovery time
        recovery_time = circuit_breaker._time_until_recovery()
        assert 0 < recovery_time <= 5  # recovery_timeout = 5

        # Wait a bit
        await asyncio.sleep(1)

        # Recovery time should decrease
        new_recovery_time = circuit_breaker._time_until_recovery()
        assert new_recovery_time < recovery_time

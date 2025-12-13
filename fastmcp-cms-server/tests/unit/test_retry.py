"""Unit tests for Retry logic."""

import pytest
import asyncio
from core.retry import RetryConfig, execute_with_retry, RETRY_CONFIGS
from utils.errors import CMSTimeoutError, CMSConnectionError


@pytest.mark.unit
class TestRetryConfig:
    """Tests for RetryConfig."""

    def test_valid_config(self):
        """Test creating valid retry config."""
        config = RetryConfig(
            max_retries=3,
            backoff_factor=2.0,
            retry_on=(Exception,),
            timeout=10,
        )
        assert config.max_retries == 3
        assert config.backoff_factor == 2.0
        assert config.timeout == 10

    def test_invalid_max_retries(self):
        """Test that negative max_retries raises error."""
        with pytest.raises(ValueError):
            RetryConfig(
                max_retries=-1,
                backoff_factor=2.0,
                retry_on=(Exception,),
                timeout=10,
            )

    def test_invalid_backoff_factor(self):
        """Test that backoff_factor < 1 raises error."""
        with pytest.raises(ValueError):
            RetryConfig(
                max_retries=3,
                backoff_factor=0.5,
                retry_on=(Exception,),
                timeout=10,
            )

    def test_invalid_timeout(self):
        """Test that timeout <= 0 raises error."""
        with pytest.raises(ValueError):
            RetryConfig(
                max_retries=3,
                backoff_factor=2.0,
                retry_on=(Exception,),
                timeout=0,
            )


@pytest.mark.unit
class TestExecuteWithRetry:
    """Tests for execute_with_retry."""

    @pytest.mark.asyncio
    async def test_successful_execution_no_retry(self):
        """Test successful execution without needing retry."""
        call_count = 0

        async def successful_func():
            nonlocal call_count
            call_count += 1
            return "success"

        result = await execute_with_retry("get", successful_func)
        assert result == "success"
        assert call_count == 1  # Called only once

    @pytest.mark.asyncio
    async def test_retry_on_connection_error(self):
        """Test retry on connection error."""
        call_count = 0

        async def failing_then_success():
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise CMSConnectionError("Connection failed")
            return "success"

        result = await execute_with_retry("get", failing_then_success)
        assert result == "success"
        assert call_count == 3  # Failed twice, succeeded on third

    @pytest.mark.asyncio
    async def test_retry_exhaustion(self):
        """Test that retry exhaustion raises last exception."""
        call_count = 0

        async def always_failing():
            nonlocal call_count
            call_count += 1
            raise CMSConnectionError("Always fails")

        with pytest.raises(CMSConnectionError):
            await execute_with_retry("get", always_failing)

        # get operation has max_retries=5
        assert call_count == 6  # Initial + 5 retries

    @pytest.mark.asyncio
    async def test_non_retryable_error_not_retried(self):
        """Test that non-retryable errors are not retried."""
        call_count = 0

        async def raises_value_error():
            nonlocal call_count
            call_count += 1
            raise ValueError("Not retryable")

        with pytest.raises(ValueError):
            await execute_with_retry("get", raises_value_error)

        assert call_count == 1  # Not retried

    @pytest.mark.asyncio
    async def test_timeout_error_is_retryable(self):
        """Test that timeout errors are retried."""
        call_count = 0

        async def timeout_then_success():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise CMSTimeoutError("Timeout")
            return "success"

        result = await execute_with_retry("get", timeout_then_success)
        assert result == "success"
        assert call_count == 2

    @pytest.mark.asyncio
    async def test_backoff_timing(self):
        """Test that backoff timing is correct."""
        call_times = []

        async def failing_func():
            call_times.append(asyncio.get_event_loop().time())
            raise CMSConnectionError("Failed")

        with pytest.raises(CMSConnectionError):
            await execute_with_retry("create", failing_func)

        # create operation has backoff_factor=2.0
        # Backoffs should be: 1s, 2s, 4s (2^0, 2^1, 2^2)
        if len(call_times) >= 3:
            diff1 = call_times[1] - call_times[0]
            diff2 = call_times[2] - call_times[1]

            # Allow some tolerance for timing
            assert 0.9 < diff1 < 1.2  # ~1 second
            assert 1.9 < diff2 < 2.2  # ~2 seconds

    @pytest.mark.asyncio
    async def test_delete_operation_limited_retries(self):
        """Test that delete operation has limited retries."""
        call_count = 0

        async def failing_delete():
            nonlocal call_count
            call_count += 1
            raise CMSTimeoutError("Timeout")

        with pytest.raises(CMSTimeoutError):
            await execute_with_retry("delete", failing_delete)

        # delete has max_retries=1
        assert call_count == 2  # Initial + 1 retry

    @pytest.mark.asyncio
    async def test_batch_operation_longer_timeout(self):
        """Test that batch operations have longer timeout."""
        async def slow_batch():
            await asyncio.sleep(0.1)
            return "success"

        result = await execute_with_retry("batch_create", slow_batch)
        assert result == "success"

    def test_retry_configs_exist(self):
        """Test that retry configs are defined for common operations."""
        assert "create" in RETRY_CONFIGS
        assert "update" in RETRY_CONFIGS
        assert "get" in RETRY_CONFIGS
        assert "list" in RETRY_CONFIGS
        assert "delete" in RETRY_CONFIGS
        assert "batch_create" in RETRY_CONFIGS
        assert "batch_update" in RETRY_CONFIGS
        assert "batch_delete" in RETRY_CONFIGS

    def test_read_operations_have_more_retries(self):
        """Test that read operations have more retries than write ops."""
        get_config = RETRY_CONFIGS["get"]
        create_config = RETRY_CONFIGS["create"]

        assert get_config.max_retries > create_config.max_retries

    def test_batch_operations_have_longer_timeout(self):
        """Test that batch operations have longer timeout."""
        create_config = RETRY_CONFIGS["create"]
        batch_create_config = RETRY_CONFIGS["batch_create"]

        assert batch_create_config.timeout > create_config.timeout

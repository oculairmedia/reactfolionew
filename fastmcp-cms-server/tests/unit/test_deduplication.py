"""Unit tests for RequestDeduplicator."""

import pytest
import asyncio
from core.deduplication import RequestDeduplicator


@pytest.mark.unit
@pytest.mark.async
class TestRequestDeduplicator:
    """Tests for RequestDeduplicator."""

    @pytest.mark.asyncio
    async def test_single_request_not_deduplicated(self, request_deduplicator):
        """Test that single request is not deduplicated."""
        call_count = 0

        async def handler():
            nonlocal call_count
            call_count += 1
            return "result"

        result = await request_deduplicator.execute("test_op", handler)
        assert result == "result"
        assert call_count == 1

        stats = request_deduplicator.get_stats()
        assert stats["total_requests"] == 1
        assert stats["deduplicated"] == 0

    @pytest.mark.asyncio
    async def test_concurrent_identical_requests_deduplicated(self, request_deduplicator):
        """Test that concurrent identical requests are deduplicated."""
        call_count = 0

        async def handler(doc_id):
            nonlocal call_count
            call_count += 1
            await asyncio.sleep(0.1)  # Simulate slow operation
            return f"result-{doc_id}"

        # Execute 5 identical concurrent requests
        tasks = [
            request_deduplicator.execute("get", handler, doc_id="test-1")
            for _ in range(5)
        ]

        results = await asyncio.gather(*tasks)

        # All should get same result
        assert all(r == "result-test-1" for r in results)

        # But handler should only be called once
        assert call_count == 1

        stats = request_deduplicator.get_stats()
        assert stats["total_requests"] == 5
        assert stats["deduplicated"] == 4  # 4 out of 5 deduplicated
        assert stats["deduplication_rate"] == 80.0

    @pytest.mark.asyncio
    async def test_different_requests_not_deduplicated(self, request_deduplicator):
        """Test that different requests are not deduplicated."""
        call_count = 0

        async def handler(doc_id):
            nonlocal call_count
            call_count += 1
            return f"result-{doc_id}"

        # Execute 3 different requests concurrently
        tasks = [
            request_deduplicator.execute("get", handler, doc_id=f"test-{i}")
            for i in range(3)
        ]

        results = await asyncio.gather(*tasks)

        # Each should have unique result
        assert len(set(results)) == 3

        # Handler should be called 3 times
        assert call_count == 3

        stats = request_deduplicator.get_stats()
        assert stats["deduplicated"] == 0

    @pytest.mark.asyncio
    async def test_sequential_identical_requests_not_deduplicated(self, request_deduplicator):
        """Test that sequential identical requests are not deduplicated."""
        call_count = 0

        async def handler(doc_id):
            nonlocal call_count
            call_count += 1
            return f"result-{doc_id}"

        # Execute 3 identical requests sequentially
        for _ in range(3):
            result = await request_deduplicator.execute("get", handler, doc_id="test-1")
            assert result == "result-test-1"

        # Each should call handler
        assert call_count == 3

        stats = request_deduplicator.get_stats()
        assert stats["deduplicated"] == 0  # Not concurrent, not deduplicated

    @pytest.mark.asyncio
    async def test_key_generation_with_different_params(self, request_deduplicator):
        """Test that different parameters generate different keys."""
        call_count = 0

        async def handler(**kwargs):
            nonlocal call_count
            call_count += 1
            return "result"

        # Different operation names
        await request_deduplicator.execute("get", handler, doc_id="test-1")
        await request_deduplicator.execute("list", handler, doc_id="test-1")

        # Different parameters
        await request_deduplicator.execute("get", handler, doc_id="test-1")
        await request_deduplicator.execute("get", handler, doc_id="test-2")

        # All should be different requests
        assert call_count == 4

    @pytest.mark.asyncio
    async def test_error_propagation(self, request_deduplicator):
        """Test that errors are properly propagated to all waiters."""
        async def failing_handler():
            raise ValueError("Test error")

        # Execute multiple concurrent requests
        tasks = [
            request_deduplicator.execute("test_op", failing_handler)
            for _ in range(3)
        ]

        # All should raise the same error
        with pytest.raises(ValueError, match="Test error"):
            await asyncio.gather(*tasks)

    @pytest.mark.asyncio
    async def test_stats_tracking(self, request_deduplicator):
        """Test that stats are tracked correctly."""
        async def handler():
            return "result"

        # Execute some requests
        await request_deduplicator.execute("op1", handler)
        await request_deduplicator.execute("op2", handler)

        # Execute concurrent identical requests
        tasks = [
            request_deduplicator.execute("op3", handler)
            for _ in range(5)
        ]
        await asyncio.gather(*tasks)

        stats = request_deduplicator.get_stats()
        assert stats["total_requests"] == 7  # 1 + 1 + 5
        assert stats["deduplicated"] == 4  # 4 out of 5 in last batch
        assert 50 < stats["deduplication_rate"] < 60

    @pytest.mark.asyncio
    async def test_reset_stats(self, request_deduplicator):
        """Test that stats can be reset."""
        async def handler():
            return "result"

        # Execute some requests
        await request_deduplicator.execute("op1", handler)
        await request_deduplicator.execute("op2", handler)

        # Reset stats
        request_deduplicator.reset_stats()

        stats = request_deduplicator.get_stats()
        assert stats["total_requests"] == 0
        assert stats["deduplicated"] == 0
        assert stats["deduplication_rate"] == 0

    @pytest.mark.asyncio
    async def test_clear_in_flight(self, request_deduplicator):
        """Test clearing in-flight requests."""
        async def slow_handler():
            await asyncio.sleep(1)
            return "result"

        # Start a request (don't await)
        task = asyncio.create_task(
            request_deduplicator.execute("op1", slow_handler)
        )

        # Wait a bit to ensure it's in-flight
        await asyncio.sleep(0.1)

        # Clear in-flight requests
        await request_deduplicator.clear()

        # Task should be cancelled
        with pytest.raises(asyncio.CancelledError):
            await task

    @pytest.mark.asyncio
    async def test_parameter_order_doesnt_matter(self, request_deduplicator):
        """Test that parameter order doesn't affect deduplication."""
        call_count = 0

        async def handler(**kwargs):
            nonlocal call_count
            call_count += 1
            await asyncio.sleep(0.1)
            return "result"

        # Execute with params in different order
        tasks = [
            request_deduplicator.execute("op", handler, a=1, b=2, c=3),
            request_deduplicator.execute("op", handler, c=3, a=1, b=2),
            request_deduplicator.execute("op", handler, b=2, c=3, a=1),
        ]

        results = await asyncio.gather(*tasks)

        # All same result
        assert all(r == "result" for r in results)

        # Handler called only once (params are sorted)
        assert call_count == 1

        stats = request_deduplicator.get_stats()
        assert stats["deduplicated"] == 2

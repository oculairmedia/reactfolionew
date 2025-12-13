"""Unit tests for Middleware components."""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock
from core.middleware import (
    Middleware,
    LoggingMiddleware,
    RateLimitMiddleware,
    ValidationMiddleware,
    AuditMiddleware,
    MiddlewareStack,
    RateLimitError,
)
from utils.errors import ValidationError
from services.audit import AuditService


@pytest.mark.unit
class TestLoggingMiddleware:
    """Tests for LoggingMiddleware."""

    @pytest.mark.asyncio
    async def test_logs_successful_operation(self):
        """Test that successful operations are logged."""
        middleware = LoggingMiddleware()

        async def next_handler(**kwargs):
            return {"success": True}

        result = await middleware.process(
            "test_op",
            {},
            next_handler,
        )

        assert result["success"] is True

    @pytest.mark.asyncio
    async def test_logs_failed_operation(self):
        """Test that failed operations are logged with errors."""
        middleware = LoggingMiddleware()

        async def failing_handler(**kwargs):
            raise ValueError("Test error")

        with pytest.raises(ValueError):
            await middleware.process(
                "test_op",
                {},
                failing_handler,
            )


@pytest.mark.unit
class TestRateLimitMiddleware:
    """Tests for RateLimitMiddleware."""

    @pytest.mark.asyncio
    async def test_no_rate_limit_passes_through(self):
        """Test that requests with no rate limit pass through."""
        middleware = RateLimitMiddleware()

        async def next_handler(**kwargs):
            return {"success": True}

        result = await middleware.process(
            "test_op",
            {},  # No rate_limit in context
            next_handler,
        )

        assert result["success"] is True

    @pytest.mark.asyncio
    async def test_rate_limit_enforcement(self):
        """Test that rate limits are enforced."""
        middleware = RateLimitMiddleware()

        async def next_handler(**kwargs):
            return {"success": True}

        context = {"rate_limit": 2}  # 2 requests per minute

        # First 2 requests should succeed
        await middleware.process("test_op", context, next_handler)
        await middleware.process("test_op", context, next_handler)

        # Third should fail
        with pytest.raises(RateLimitError):
            await middleware.process("test_op", context, next_handler)

    @pytest.mark.asyncio
    async def test_rate_limit_resets_after_window(self):
        """Test that rate limit resets after time window."""
        middleware = RateLimitMiddleware()

        async def next_handler(**kwargs):
            return {"success": True}

        context = {"rate_limit": 1}

        # First request succeeds
        await middleware.process("test_op", context, next_handler)

        # Second fails
        with pytest.raises(RateLimitError):
            await middleware.process("test_op", context, next_handler)

        # Wait for window to pass (simulate)
        middleware._windows["test_op"].clear()

        # Should succeed now
        await middleware.process("test_op", context, next_handler)

    @pytest.mark.asyncio
    async def test_different_operations_separate_limits(self):
        """Test that different operations have separate rate limits."""
        middleware = RateLimitMiddleware()

        async def next_handler(**kwargs):
            return {"success": True}

        context1 = {"rate_limit": 1}
        context2 = {"rate_limit": 1}

        # First operation limit
        await middleware.process("op1", context1, next_handler)

        # Second operation should not be affected
        await middleware.process("op2", context2, next_handler)


@pytest.mark.unit
class TestValidationMiddleware:
    """Tests for ValidationMiddleware."""

    @pytest.mark.asyncio
    async def test_validates_required_params(self):
        """Test that required parameters are validated."""
        middleware = ValidationMiddleware()

        async def next_handler(**kwargs):
            return {"success": True}

        context = {"required_params": ["collection", "data"]}

        # Missing required param
        with pytest.raises(ValidationError, match="Missing required parameter"):
            await middleware.process(
                "test_op",
                context,
                next_handler,
                collection="test",
                # data is missing
            )

        # All required params provided
        result = await middleware.process(
            "test_op",
            context,
            next_handler,
            collection="test",
            data={"foo": "bar"},
        )
        assert result["success"] is True

    @pytest.mark.asyncio
    async def test_delete_passes_through_middleware(self):
        """Test that delete operation passes through middleware (handler decides confirmation)."""
        middleware = ValidationMiddleware()

        async def next_handler(**kwargs):
            # Handler logic decides confirmation behavior
            if not kwargs.get("confirm"):
                return {"success": False, "requiresConfirmation": True}
            return {"success": True}

        # Delete without confirm - middleware passes through, handler returns confirmation needed
        result = await middleware.process(
            "delete",
            {},
            next_handler,
            doc_id="test-1",
        )
        assert result["success"] is False
        assert result["requiresConfirmation"] is True

        # Delete with confirm - handler proceeds
        result = await middleware.process(
            "delete",
            {},
            next_handler,
            doc_id="test-1",
            confirm=True,
        )
        assert result["success"] is True

    @pytest.mark.asyncio
    async def test_batch_operations_validate_items(self):
        """Test that batch operations validate items list."""
        middleware = ValidationMiddleware()

        async def next_handler(**kwargs):
            return {"success": True}

        # Empty items list
        with pytest.raises(ValidationError, match="non-empty 'items' list"):
            await middleware.process(
                "batch_create",
                {},
                next_handler,
                items=[],
            )

        # Too many items
        with pytest.raises(ValidationError, match="limited to 100 items"):
            await middleware.process(
                "batch_create",
                {},
                next_handler,
                items=[{} for _ in range(101)],
            )

        # Valid items
        result = await middleware.process(
            "batch_create",
            {},
            next_handler,
            items=[{"id": "1"}, {"id": "2"}],
        )
        assert result["success"] is True


@pytest.mark.unit
class TestAuditMiddleware:
    """Tests for AuditMiddleware."""

    @pytest.mark.asyncio
    async def test_audits_operations_with_side_effects(self):
        """Test that operations with side effects are audited."""
        audit_service = Mock(spec=AuditService)
        audit_service.log_create = Mock()

        middleware = AuditMiddleware(audit_service)

        async def next_handler(**kwargs):
            return {
                "success": True,
                "documentId": "test-1",
            }

        context = {"side_effects": True}

        await middleware.process(
            "create",
            context,
            next_handler,
            collection="projects",
            data={"id": "test-1"},
        )

        # Should have logged create
        audit_service.log_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_does_not_audit_read_operations(self):
        """Test that read-only operations are not audited."""
        audit_service = Mock(spec=AuditService)
        audit_service.log_create = Mock()

        middleware = AuditMiddleware(audit_service)

        async def next_handler(**kwargs):
            return {"success": True}

        context = {"side_effects": False}

        await middleware.process(
            "get",
            context,
            next_handler,
            collection="projects",
        )

        # Should not have logged
        audit_service.log_create.assert_not_called()


@pytest.mark.unit
class TestMiddlewareStack:
    """Tests for MiddlewareStack."""

    @pytest.mark.asyncio
    async def test_executes_middleware_in_order(self):
        """Test that middleware is executed in order."""
        execution_order = []

        class TestMiddleware1(Middleware):
            async def process(self, operation, context, next_handler, **kwargs):
                execution_order.append(1)
                result = await next_handler(**kwargs)
                execution_order.append(4)
                return result

        class TestMiddleware2(Middleware):
            async def process(self, operation, context, next_handler, **kwargs):
                execution_order.append(2)
                result = await next_handler(**kwargs)
                execution_order.append(3)
                return result

        async def final_handler(**kwargs):
            execution_order.append("handler")
            return {"success": True}

        stack = MiddlewareStack([TestMiddleware1(), TestMiddleware2()])

        await stack.execute("test_op", {}, final_handler)

        # Should execute: 1 -> 2 -> handler -> 3 -> 4
        assert execution_order == [1, 2, "handler", 3, 4]

    @pytest.mark.asyncio
    async def test_empty_stack_calls_handler_directly(self):
        """Test that empty stack calls handler directly."""
        stack = MiddlewareStack([])

        async def handler(**kwargs):
            return {"success": True}

        result = await stack.execute("test_op", {}, handler)
        assert result["success"] is True

    @pytest.mark.asyncio
    async def test_add_middleware(self):
        """Test adding middleware to stack."""
        stack = MiddlewareStack()
        assert len(stack.middlewares) == 0

        stack.add_middleware(LoggingMiddleware())
        assert len(stack.middlewares) == 1

    @pytest.mark.asyncio
    async def test_middleware_can_modify_result(self):
        """Test that middleware can modify the result."""
        class ModifyingMiddleware(Middleware):
            async def process(self, operation, context, next_handler, **kwargs):
                result = await next_handler(**kwargs)
                result["modified"] = True
                return result

        stack = MiddlewareStack([ModifyingMiddleware()])

        async def handler(**kwargs):
            return {"success": True}

        result = await stack.execute("test_op", {}, handler)
        assert result["success"] is True
        assert result["modified"] is True

    @pytest.mark.asyncio
    async def test_middleware_can_short_circuit(self):
        """Test that middleware can short-circuit the chain."""
        class ShortCircuitMiddleware(Middleware):
            async def process(self, operation, context, next_handler, **kwargs):
                # Don't call next_handler, return early
                return {"short_circuited": True}

        stack = MiddlewareStack([ShortCircuitMiddleware()])

        async def handler(**kwargs):
            pytest.fail("Handler should not be called")

        result = await stack.execute("test_op", {}, handler)
        assert result["short_circuited"] is True

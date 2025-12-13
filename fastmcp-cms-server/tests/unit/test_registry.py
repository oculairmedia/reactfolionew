"""Unit tests for OperationRegistry."""

import pytest
from unittest.mock import AsyncMock
from core.registry import OperationRegistry, OperationMetadata


@pytest.mark.unit
class TestOperationRegistry:
    """Tests for OperationRegistry."""

    @pytest.mark.asyncio
    async def test_register_operation(self, operation_registry):
        """Test registering an operation."""
        async def handler(**kwargs):
            return {"success": True}

        operation_registry.register(
            name="test_op",
            handler=handler,
            cost="low",
            side_effects=False,
            rate_limit=100,
            description="Test operation",
        )

        op = operation_registry.get_operation("test_op")
        assert op is not None
        assert op.name == "test_op"
        assert op.cost == "low"
        assert op.side_effects is False
        assert op.rate_limit == 100

    @pytest.mark.asyncio
    async def test_list_operations(self, operation_registry):
        """Test listing all registered operations."""
        async def handler(**kwargs):
            return {}

        operation_registry.register("op1", handler, "low")
        operation_registry.register("op2", handler, "medium")
        operation_registry.register("op3", handler, "high")

        ops = operation_registry.list_operations()
        assert "op1" in ops
        assert "op2" in ops
        assert "op3" in ops

    @pytest.mark.asyncio
    async def test_get_nonexistent_operation(self, operation_registry):
        """Test getting non-existent operation returns None."""
        op = operation_registry.get_operation("nonexistent")
        assert op is None

    @pytest.mark.asyncio
    async def test_execute_registered_operation(self, operation_registry):
        """Test executing a registered operation."""
        async def handler(value):
            return {"result": value * 2}

        operation_registry.register("double", handler, "low")

        result = await operation_registry.execute("double", value=5)
        assert result["result"] == 10

    @pytest.mark.asyncio
    async def test_execute_unregistered_operation_raises_error(self, operation_registry):
        """Test that executing unregistered operation raises error."""
        with pytest.raises(ValueError, match="Unknown operation"):
            await operation_registry.execute("nonexistent")

    @pytest.mark.asyncio
    async def test_get_operations_by_cost(self, operation_registry):
        """Test filtering operations by cost."""
        async def handler(**kwargs):
            return {}

        operation_registry.register("op1", handler, "low")
        operation_registry.register("op2", handler, "low")
        operation_registry.register("op3", handler, "high")

        low_cost_ops = operation_registry.get_operations_by_cost("low")
        assert len(low_cost_ops) == 2
        assert "op1" in low_cost_ops
        assert "op2" in low_cost_ops

        high_cost_ops = operation_registry.get_operations_by_cost("high")
        assert len(high_cost_ops) == 1
        assert "op3" in high_cost_ops

    @pytest.mark.asyncio
    async def test_get_dangerous_operations(self, operation_registry):
        """Test getting operations that require approval or have side effects."""
        async def handler(**kwargs):
            return {}

        operation_registry.register("safe_read", handler, "low", side_effects=False)
        operation_registry.register("delete", handler, "high", side_effects=True, requires_approval=True)
        operation_registry.register("create", handler, "medium", side_effects=True)

        dangerous = operation_registry.get_dangerous_operations()

        # delete requires approval and has side effects with "delete" in name
        assert "delete" in dangerous

    @pytest.mark.asyncio
    async def test_describe_operation(self, operation_registry):
        """Test getting detailed description of an operation."""
        async def handler(**kwargs):
            return {}

        operation_registry.register(
            name="test_op",
            handler=handler,
            cost="medium",
            side_effects=True,
            requires_approval=True,
            rate_limit=10,
            description="A test operation",
            required_params=["param1", "param2"],
        )

        description = operation_registry.describe_operation("test_op")

        assert description["name"] == "test_op"
        assert description["cost"] == "medium"
        assert description["side_effects"] is True
        assert description["requires_approval"] is True
        assert description["rate_limit"] == 10
        assert description["description"] == "A test operation"
        assert description["required_params"] == ["param1", "param2"]

    @pytest.mark.asyncio
    async def test_get_stats(self, operation_registry):
        """Test getting registry statistics."""
        async def handler(**kwargs):
            return {}

        operation_registry.register("op1", handler, "low", side_effects=False)
        operation_registry.register("op2", handler, "medium", side_effects=True, rate_limit=10)
        operation_registry.register("op3", handler, "high", requires_approval=True)

        stats = operation_registry.get_stats()

        assert stats["total_operations"] == 3
        assert stats["by_cost"]["low"] == 1
        assert stats["by_cost"]["medium"] == 1
        assert stats["by_cost"]["high"] == 1
        assert stats["with_side_effects"] == 1
        assert stats["with_rate_limits"] == 1
        assert stats["requires_approval"] == 1

    @pytest.mark.asyncio
    async def test_middleware_integration(self, operation_registry, middleware_stack):
        """Test that operations execute through middleware stack."""
        async def handler(**kwargs):
            return {"success": True}

        operation_registry.register("test_op", handler, "low")
        operation_registry.set_middleware_stack(middleware_stack)

        result = await operation_registry.execute("test_op")
        assert result["success"] is True

        stats = operation_registry.get_stats()
        assert stats["middleware_configured"] is True

    @pytest.mark.asyncio
    async def test_operation_metadata_structure(self):
        """Test OperationMetadata dataclass structure."""
        async def handler(**kwargs):
            return {}

        metadata = OperationMetadata(
            name="test",
            handler=handler,
            cost="low",
            side_effects=True,
            requires_approval=False,
            rate_limit=10,
            output_schema={"type": "object"},
            description="Test op",
            required_params=["param1"],
            allowed_params=["param1", "param2"],
            timeout=30,
            max_retries=3,
        )

        assert metadata.name == "test"
        assert metadata.cost == "low"
        assert metadata.side_effects is True
        assert metadata.rate_limit == 10
        assert metadata.timeout == 30
        assert metadata.max_retries == 3

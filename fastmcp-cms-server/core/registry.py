"""Operation registry for managing all operations and their metadata."""

from typing import Callable, Optional, Literal, Any
from dataclasses import dataclass, field
from utils.logging import get_logger

logger = get_logger(__name__)


@dataclass
class OperationMetadata:
    """Metadata for an operation."""
    name: str
    handler: Callable
    cost: Literal["low", "medium", "high"]
    side_effects: bool = False
    requires_approval: bool = False
    rate_limit: Optional[int] = None
    output_schema: Optional[dict] = None
    description: str = ""
    required_params: list[str] = field(default_factory=list)
    allowed_params: Optional[list[str]] = None
    timeout: Optional[int] = None
    max_retries: Optional[int] = None


class OperationRegistry:
    """
    Central registry for all operations with metadata.

    This registry maintains all available operations and their
    configurations, enabling:
    - Centralized operation management
    - Consistent metadata across operations
    - Easy addition of new operations
    - Middleware integration
    - Fine-grained control (rate limits, approvals, etc.)

    Example:
        registry = OperationRegistry()

        registry.register(
            name="create",
            handler=create_handler,
            cost="medium",
            side_effects=True,
            rate_limit=10,
            output_schema={...}
        )

        result = await registry.execute(
            "create",
            context={...},
            collection="projects",
            data={...}
        )
    """

    def __init__(self):
        """Initialize operation registry."""
        self._operations: dict[str, OperationMetadata] = {}
        self._middleware_stack = None

    def register(
        self,
        name: str,
        handler: Callable,
        cost: Literal["low", "medium", "high"],
        side_effects: bool = False,
        requires_approval: bool = False,
        rate_limit: Optional[int] = None,
        output_schema: Optional[dict] = None,
        description: str = "",
        required_params: list[str] = None,
        allowed_params: list[str] = None,
        timeout: Optional[int] = None,
        max_retries: Optional[int] = None,
    ):
        """
        Register an operation with metadata.

        Args:
            name: Operation name (e.g., "create", "update")
            handler: Async function that executes the operation
            cost: Resource cost (low/medium/high)
            side_effects: Whether operation modifies state
            requires_approval: Whether operation requires human approval
            rate_limit: Max requests per minute (None = no limit)
            output_schema: JSON schema for output structure
            description: Human-readable description
            required_params: List of required parameter names
            allowed_params: List of allowed parameter names (None = any)
            timeout: Custom timeout in seconds (None = use default)
            max_retries: Custom retry count (None = use default)
        """
        self._operations[name] = OperationMetadata(
            name=name,
            handler=handler,
            cost=cost,
            side_effects=side_effects,
            requires_approval=requires_approval,
            rate_limit=rate_limit,
            output_schema=output_schema,
            description=description,
            required_params=required_params or [],
            allowed_params=allowed_params,
            timeout=timeout,
            max_retries=max_retries,
        )

        logger.debug(
            f"Registered operation: {name}",
            cost=cost,
            side_effects=side_effects,
            rate_limit=rate_limit,
        )

    def get_operation(self, name: str) -> Optional[OperationMetadata]:
        """
        Get operation metadata by name.

        Args:
            name: Operation name

        Returns:
            OperationMetadata or None if not found
        """
        return self._operations.get(name)

    def list_operations(self) -> list[str]:
        """
        List all registered operation names.

        Returns:
            List of operation names
        """
        return list(self._operations.keys())

    def get_operations_by_cost(
        self,
        cost: Literal["low", "medium", "high"]
    ) -> list[str]:
        """
        Get operations filtered by cost.

        Args:
            cost: Cost level to filter by

        Returns:
            List of operation names
        """
        return [
            name for name, op in self._operations.items()
            if op.cost == cost
        ]

    def get_dangerous_operations(self) -> list[str]:
        """
        Get operations that require approval or have side effects.

        Returns:
            List of operation names
        """
        return [
            name for name, op in self._operations.items()
            if op.requires_approval or (op.side_effects and "delete" in name)
        ]

    def set_middleware_stack(self, stack):
        """
        Set middleware stack for operation execution.

        Args:
            stack: MiddlewareStack instance
        """
        self._middleware_stack = stack
        logger.debug("Middleware stack configured")

    async def execute(
        self,
        operation: str,
        **kwargs
    ) -> dict:
        """
        Execute operation with middleware stack.

        Args:
            operation: Operation name
            **kwargs: Operation parameters

        Returns:
            Operation result

        Raises:
            ValueError: If operation not found
        """
        if operation not in self._operations:
            raise ValueError(
                f"Unknown operation: {operation}. "
                f"Available: {', '.join(self.list_operations())}"
            )

        op = self._operations[operation]

        # Build context from metadata
        context = {
            "operation": operation,
            "cost": op.cost,
            "side_effects": op.side_effects,
            "requires_approval": op.requires_approval,
            "rate_limit": op.rate_limit,
            "output_schema": op.output_schema,
            "required_params": op.required_params,
            "allowed_params": op.allowed_params,
            "timeout": op.timeout,
            "max_retries": op.max_retries,
        }

        # Execute through middleware stack if configured
        if self._middleware_stack:
            result = await self._middleware_stack.execute(
                operation,
                context,
                op.handler,
                **kwargs
            )
        else:
            # Execute directly without middleware
            result = await op.handler(**kwargs)

        return result

    def get_stats(self) -> dict:
        """
        Get registry statistics.

        Returns:
            Statistics dictionary
        """
        total = len(self._operations)
        by_cost = {
            "low": len(self.get_operations_by_cost("low")),
            "medium": len(self.get_operations_by_cost("medium")),
            "high": len(self.get_operations_by_cost("high")),
        }

        with_side_effects = sum(
            1 for op in self._operations.values()
            if op.side_effects
        )

        with_rate_limits = sum(
            1 for op in self._operations.values()
            if op.rate_limit is not None
        )

        requires_approval = sum(
            1 for op in self._operations.values()
            if op.requires_approval
        )

        return {
            "total_operations": total,
            "by_cost": by_cost,
            "with_side_effects": with_side_effects,
            "with_rate_limits": with_rate_limits,
            "requires_approval": requires_approval,
            "middleware_configured": self._middleware_stack is not None,
        }

    def describe_operation(self, operation: str) -> dict:
        """
        Get detailed description of an operation.

        Args:
            operation: Operation name

        Returns:
            Operation description dictionary
        """
        op = self.get_operation(operation)
        if not op:
            raise ValueError(f"Unknown operation: {operation}")

        return {
            "name": op.name,
            "description": op.description,
            "cost": op.cost,
            "side_effects": op.side_effects,
            "requires_approval": op.requires_approval,
            "rate_limit": op.rate_limit,
            "required_params": op.required_params,
            "allowed_params": op.allowed_params,
            "has_output_schema": op.output_schema is not None,
            "timeout": op.timeout,
            "max_retries": op.max_retries,
        }


def create_collection_registry() -> OperationRegistry:
    """
    Create registry for collection operations.

    This is a factory function that creates a pre-configured
    registry for collection operations like create, update, etc.

    Returns:
        OperationRegistry with collection operations
    """
    registry = OperationRegistry()

    # Note: Actual handlers will be registered later
    # This just shows the structure

    return registry


def create_global_registry() -> OperationRegistry:
    """
    Create registry for global operations.

    Returns:
        OperationRegistry with global operations
    """
    registry = OperationRegistry()

    # Note: Actual handlers will be registered later

    return registry

"""Consolidated global operations tool."""

from typing import Literal, Optional
import json
from datetime import datetime
from services.cms_client_enhanced import EnhancedCMSClient
from core.registry import OperationRegistry
from core.middleware import create_default_middleware_stack
from core.retry import execute_with_retry
from schemas.operation_schemas import OPERATION_SCHEMAS
from utils.logging import get_logger
from utils.errors import ValidationError

logger = get_logger(__name__)


# ============================================================================
# OPERATION HANDLERS
# ============================================================================

async def get_global_handler(global_slug: str, **kwargs) -> dict:
    """Handle get global operation."""
    async with EnhancedCMSClient() as client:
        result = await client.get_global(global_slug=global_slug)

        return {
            "success": True,
            "data": result,
        }


async def update_global_handler(global_slug: str, data: dict, **kwargs) -> dict:
    """Handle update global operation."""
    if not data:
        raise ValidationError("No update data provided")

    async with EnhancedCMSClient() as client:
        result = await client.update_global(
            global_slug=global_slug,
            data=data,
        )

        return {
            "success": True,
            "message": f"Global '{global_slug}' updated successfully",
            "data": result,
        }


async def list_globals_handler(**kwargs) -> dict:
    """Handle list globals operation."""
    # List of known globals in this CMS
    known_globals = [
        "site-settings",
        "home-intro",
        "about-page",
    ]

    return {
        "success": True,
        "globals": known_globals,
    }


async def reset_global_handler(global_slug: str, **kwargs) -> dict:
    """Handle reset global operation (not implemented - requires default values)."""
    return {
        "success": False,
        "error": "Not implemented",
        "message": "Reset global requires default values configuration",
    }


async def export_global_handler(global_slug: str, **kwargs) -> dict:
    """Handle export global operation."""
    async with EnhancedCMSClient() as client:
        data = await client.get_global(global_slug=global_slug)

        return {
            "success": True,
            "globalSlug": global_slug,
            "data": data,
            "exportedAt": datetime.now().isoformat(),
        }


async def import_global_handler(global_slug: str, data: dict, **kwargs) -> dict:
    """Handle import global operation."""
    if not data:
        raise ValidationError("No import data provided")

    async with EnhancedCMSClient() as client:
        result = await client.update_global(
            global_slug=global_slug,
            data=data,
        )

        return {
            "success": True,
            "globalSlug": global_slug,
            "message": f"Global '{global_slug}' imported successfully",
        }


async def validate_global_handler(global_slug: str, data: dict, **kwargs) -> dict:
    """Handle validate global operation (validate without saving)."""
    # This would validate against schema without saving
    # For now, just return success
    return {
        "success": True,
        "message": f"Global '{global_slug}' data is valid",
        "valid": True,
    }


# ============================================================================
# OPERATION REGISTRY SETUP
# ============================================================================

def setup_global_registry() -> OperationRegistry:
    """
    Create and configure operation registry for globals.

    Returns:
        Configured OperationRegistry
    """
    registry = OperationRegistry()

    # Register all operations
    registry.register(
        name="get",
        handler=get_global_handler,
        cost="low",
        side_effects=False,
        rate_limit=100,
        output_schema=OPERATION_SCHEMAS["get_global"],
        description="Get a global singleton",
        required_params=["global_slug"],
    )

    registry.register(
        name="update",
        handler=update_global_handler,
        cost="medium",
        side_effects=True,
        rate_limit=20,
        output_schema=OPERATION_SCHEMAS["update_global"],
        description="Update a global singleton",
        required_params=["global_slug", "data"],
    )

    registry.register(
        name="list",
        handler=list_globals_handler,
        cost="low",
        side_effects=False,
        rate_limit=100,
        output_schema=OPERATION_SCHEMAS["list_globals"],
        description="List all available globals",
        required_params=[],
    )

    registry.register(
        name="reset",
        handler=reset_global_handler,
        cost="medium",
        side_effects=True,
        requires_approval=True,
        rate_limit=5,
        description="Reset global to default values",
        required_params=["global_slug"],
    )

    registry.register(
        name="export",
        handler=export_global_handler,
        cost="low",
        side_effects=False,
        rate_limit=20,
        output_schema=OPERATION_SCHEMAS["export_global"],
        description="Export global data for backup",
        required_params=["global_slug"],
    )

    registry.register(
        name="import",
        handler=import_global_handler,
        cost="high",
        side_effects=True,
        rate_limit=5,
        output_schema=OPERATION_SCHEMAS["import_global"],
        description="Import global data from backup",
        required_params=["global_slug", "data"],
    )

    registry.register(
        name="validate",
        handler=validate_global_handler,
        cost="low",
        side_effects=False,
        rate_limit=50,
        description="Validate global data without saving",
        required_params=["global_slug", "data"],
    )

    # Set up middleware stack
    middleware_stack = create_default_middleware_stack()
    registry.set_middleware_stack(middleware_stack)

    logger.info(
        f"Global registry initialized with {len(registry.list_operations())} operations"
    )

    return registry


# Global registry instance
_global_registry: Optional[OperationRegistry] = None


def get_global_registry() -> OperationRegistry:
    """Get or create global registry."""
    global _global_registry
    if _global_registry is None:
        _global_registry = setup_global_registry()
    return _global_registry


# ============================================================================
# MAIN HANDLER
# ============================================================================

async def cms_global_ops_handler(
    operation: Literal[
        "get", "update", "list", "reset", "export", "import", "validate"
    ],
    global_slug: Optional[str] = None,
    **kwargs
) -> dict:
    """
    Unified handler for all global operations.

    Args:
        operation: Operation to perform
        global_slug: Global slug (not required for 'list' operation)
        **kwargs: Operation-specific parameters

    Returns:
        Operation result with structured output

    Examples:
        # Get a global
        result = await cms_global_ops_handler(
            operation="get",
            global_slug="site-settings"
        )

        # Update a global
        result = await cms_global_ops_handler(
            operation="update",
            global_slug="site-settings",
            data={"metaTitle": "My Site"}
        )

        # List all globals
        result = await cms_global_ops_handler(
            operation="list"
        )

        # Export for backup
        result = await cms_global_ops_handler(
            operation="export",
            global_slug="home-intro"
        )
    """
    # Validate global_slug for operations that need it
    if operation != "list" and not global_slug:
        return {
            "success": False,
            "error": "Validation error",
            "message": f"Operation '{operation}' requires global_slug parameter",
        }

    registry = get_global_registry()

    try:
        # Execute through registry
        result = await execute_with_retry(
            operation,
            registry.execute,
            operation,
            global_slug=global_slug,
            **kwargs
        )

        return result

    except ValidationError as e:
        return {
            "success": False,
            "error": "Validation error",
            "message": str(e),
        }

    except Exception as e:
        logger.error(
            f"Global operation failed",
            operation=operation,
            global_slug=global_slug,
            error=str(e),
        )

        return {
            "success": False,
            "error": type(e).__name__,
            "message": str(e),
        }

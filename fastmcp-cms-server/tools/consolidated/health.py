"""Consolidated health and monitoring operations tool."""

import time
from typing import Literal, Optional
from services.cms_client_enhanced import EnhancedCMSClient
from core.registry import OperationRegistry
from core.middleware import create_default_middleware_stack
from core.connection_pool import get_global_pool
from schemas.operation_schemas import OPERATION_SCHEMAS
from utils.logging import get_logger
from config import Config

logger = get_logger(__name__)

# Server start time for uptime tracking
START_TIME = time.time()


# ============================================================================
# OPERATION HANDLERS
# ============================================================================

async def health_check_handler(**kwargs) -> dict:
    """Handle health check operation."""
    uptime = int(time.time() - START_TIME)

    async with EnhancedCMSClient() as client:
        cms_health = await client.check_health()

        return {
            "status": "healthy" if cms_health.get("cms_connected") else "degraded",
            "server": {
                "name": Config.MCP_SERVER_NAME,
                "version": Config.MCP_SERVER_VERSION,
                "uptime_seconds": uptime,
            },
            "cms": cms_health,
            "features": {
                "caching": Config.ENABLE_CACHING,
                "audit_log": Config.ENABLE_AUDIT_LOG,
                "draft_mode": Config.ENABLE_DRAFT_MODE,
            },
        }


async def metrics_handler(**kwargs) -> dict:
    """Handle metrics operation."""
    async with EnhancedCMSClient() as client:
        metrics = client.get_metrics()

        # Add connection pool metrics
        pool = await get_global_pool()
        metrics["connection_pool"] = pool.get_stats()

        return {
            "success": True,
            "metrics": metrics,
        }


async def cache_stats_handler(**kwargs) -> dict:
    """Handle cache stats operation."""
    async with EnhancedCMSClient() as client:
        cache_stats = client.cache.get_stats()

        return {
            "success": True,
            "cache": cache_stats,
        }


async def connection_status_handler(**kwargs) -> dict:
    """Handle connection status operation."""
    pool = await get_global_pool()
    pool_stats = pool.get_stats()

    async with EnhancedCMSClient() as client:
        circuit_breaker_state = client.circuit_breaker.get_state()

        return {
            "success": True,
            "connection_pool": pool_stats,
            "circuit_breaker": circuit_breaker_state,
        }


# ============================================================================
# OPERATION REGISTRY SETUP
# ============================================================================

def setup_health_registry() -> OperationRegistry:
    """
    Create and configure operation registry for health operations.

    Returns:
        Configured OperationRegistry
    """
    registry = OperationRegistry()

    # Register all operations
    registry.register(
        name="health_check",
        handler=health_check_handler,
        cost="low",
        side_effects=False,
        rate_limit=None,  # No rate limit for health checks
        output_schema=OPERATION_SCHEMAS["health_check"],
        description="Check server and CMS health status",
        required_params=[],
    )

    registry.register(
        name="metrics",
        handler=metrics_handler,
        cost="low",
        side_effects=False,
        rate_limit=100,
        output_schema=OPERATION_SCHEMAS["metrics"],
        description="Get detailed server metrics",
        required_params=[],
    )

    registry.register(
        name="cache_stats",
        handler=cache_stats_handler,
        cost="low",
        side_effects=False,
        rate_limit=100,
        description="Get cache statistics",
        required_params=[],
    )

    registry.register(
        name="connection_status",
        handler=connection_status_handler,
        cost="low",
        side_effects=False,
        rate_limit=100,
        description="Get connection pool and circuit breaker status",
        required_params=[],
    )

    # Set up middleware (but skip rate limiting for health checks)
    middleware_stack = create_default_middleware_stack()
    registry.set_middleware_stack(middleware_stack)

    logger.info(
        f"Health registry initialized with {len(registry.list_operations())} operations"
    )

    return registry


# Global registry instance
_health_registry: Optional[OperationRegistry] = None


def get_health_registry() -> OperationRegistry:
    """Get or create health registry."""
    global _health_registry
    if _health_registry is None:
        _health_registry = setup_health_registry()
    return _health_registry


# ============================================================================
# MAIN HANDLER
# ============================================================================

async def cms_health_ops_handler(
    operation: Literal[
        "health_check", "metrics", "cache_stats", "connection_status"
    ],
    **kwargs
) -> dict:
    """
    Unified handler for all health and monitoring operations.

    Args:
        operation: Operation to perform
        **kwargs: Operation-specific parameters

    Returns:
        Operation result with structured output

    Examples:
        # Basic health check
        result = await cms_health_ops_handler(
            operation="health_check"
        )

        # Get detailed metrics
        result = await cms_health_ops_handler(
            operation="metrics"
        )

        # Get cache statistics
        result = await cms_health_ops_handler(
            operation="cache_stats"
        )

        # Get connection status
        result = await cms_health_ops_handler(
            operation="connection_status"
        )
    """
    registry = get_health_registry()

    try:
        # Execute through registry
        result = await registry.execute(
            operation,
            **kwargs
        )

        return result

    except Exception as e:
        logger.error(
            f"Health operation failed",
            operation=operation,
            error=str(e),
        )

        return {
            "success": False,
            "error": type(e).__name__,
            "message": str(e),
        }

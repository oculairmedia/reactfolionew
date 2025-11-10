"""Consolidated collection operations tool."""

from typing import Literal, Optional, Any
from services.cms_client_enhanced import EnhancedCMSClient
from services.batch import (
    batch_create_documents,
    batch_update_documents,
    batch_delete_documents,
)
from core.registry import OperationRegistry
from core.middleware import create_default_middleware_stack
from core.retry import execute_with_retry
from schemas.operation_schemas import OPERATION_SCHEMAS
from utils.logging import get_logger
from utils.errors import ResourceNotFoundError, ValidationError
from config import Config

logger = get_logger(__name__)


# ============================================================================
# OPERATION HANDLERS
# ============================================================================

async def create_handler(collection: str, data: dict, draft: bool = True, **kwargs) -> dict:
    """Handle create operation."""
    async with EnhancedCMSClient() as client:
        result = await client.create_document(
            collection=collection,
            data=data,
            draft=draft,
        )

        return {
            "success": True,
            "documentId": data.get("id") or result.get("id"),
            "status": "draft" if draft else "published",
            "message": f"Document created successfully in {collection}",
            "data": result,
        }


async def update_handler(collection: str, doc_id: str, data: dict, **kwargs) -> dict:
    """Handle update operation."""
    async with EnhancedCMSClient() as client:
        result = await client.update_document(
            collection=collection,
            doc_id=doc_id,
            data=data,
        )

        return {
            "success": True,
            "documentId": doc_id,
            "message": f"Document updated successfully in {collection}",
            "data": result,
        }


async def get_handler(collection: str, doc_id: str, **kwargs) -> dict:
    """Handle get operation."""
    async with EnhancedCMSClient() as client:
        result = await client.get_document(
            collection=collection,
            doc_id=doc_id,
        )

        return {
            "success": True,
            "documentId": doc_id,
            "data": result,
        }


async def list_handler(
    collection: str,
    filters: dict = None,
    limit: int = 100,
    page: int = 1,
    **kwargs
) -> dict:
    """Handle list operation."""
    async with EnhancedCMSClient() as client:
        result = await client.get_collection(
            collection=collection,
            filters=filters or {},
            limit=limit,
            page=page,
        )

        return {
            "success": True,
            "documents": result.get("docs", []),
            "totalDocs": result.get("totalDocs", 0),
            "page": result.get("page", 1),
            "totalPages": result.get("totalPages", 1),
            "limit": result.get("limit", limit),
        }


async def delete_handler(collection: str, doc_id: str, confirm: bool = False, **kwargs) -> dict:
    """Handle delete operation."""
    if not confirm:
        return {
            "success": False,
            "requiresConfirmation": True,
            "message": "Deletion requires confirm=True",
            "documentId": doc_id,
        }

    # Check if approval is required
    if Config.REQUIRE_APPROVAL_FOR_DELETE:
        return {
            "success": False,
            "requiresApproval": True,
            "message": "Deletion requires human approval",
            "documentId": doc_id,
        }

    async with EnhancedCMSClient() as client:
        await client.delete_document(
            collection=collection,
            doc_id=doc_id,
        )

        return {
            "success": True,
            "documentId": doc_id,
            "message": f"Document deleted successfully from {collection}",
        }


async def publish_handler(collection: str, doc_id: str, require_approval: bool = False, **kwargs) -> dict:
    """Handle publish operation."""
    if Config.REQUIRE_APPROVAL_FOR_PUBLISH or require_approval:
        return {
            "success": False,
            "requiresApproval": True,
            "message": "Publishing requires human approval",
            "documentId": doc_id,
        }

    async with EnhancedCMSClient() as client:
        result = await client.update_document(
            collection=collection,
            doc_id=doc_id,
            data={"_status": "published"},
        )

        return {
            "success": True,
            "documentId": doc_id,
            "status": "published",
            "message": f"Document published successfully in {collection}",
            "data": result,
        }


async def batch_create_handler(
    collection: str,
    items: list[dict],
    draft: bool = True,
    parallel: bool = True,
    **kwargs
) -> dict:
    """Handle batch create operation."""
    return await batch_create_documents(
        collection=collection,
        items=items,
        draft=draft,
        parallel=parallel,
    )


async def batch_update_handler(
    collection: str,
    items: list[dict],
    parallel: bool = True,
    **kwargs
) -> dict:
    """Handle batch update operation."""
    return await batch_update_documents(
        collection=collection,
        items=items,
        parallel=parallel,
    )


async def batch_delete_handler(
    collection: str,
    doc_ids: list[str],
    confirm: bool = False,
    parallel: bool = True,
    **kwargs
) -> dict:
    """Handle batch delete operation."""
    return await batch_delete_documents(
        collection=collection,
        doc_ids=doc_ids,
        confirm=confirm,
        parallel=parallel,
    )


async def search_handler(
    collection: str,
    query: str,
    fields: list[str] = None,
    limit: int = 50,
    **kwargs
) -> dict:
    """Handle search operation."""
    # Build search filters
    filters = {}
    if fields:
        # Search in specific fields
        # For now, use title field as default
        filters["where[title][contains]"] = query
    else:
        # Default to title search
        filters["where[title][contains]"] = query

    async with EnhancedCMSClient() as client:
        result = await client.get_collection(
            collection=collection,
            filters=filters,
            limit=limit,
        )

        return {
            "success": True,
            "results": result.get("docs", []),
            "totalResults": result.get("totalDocs", 0),
            "query": query,
        }


async def archive_handler(collection: str, doc_id: str, **kwargs) -> dict:
    """Handle archive operation (update status to archived)."""
    async with EnhancedCMSClient() as client:
        result = await client.update_document(
            collection=collection,
            doc_id=doc_id,
            data={"_status": "archived"},
        )

        return {
            "success": True,
            "documentId": doc_id,
            "message": f"Document archived successfully in {collection}",
            "data": result,
        }


async def restore_handler(collection: str, doc_id: str, **kwargs) -> dict:
    """Handle restore operation (update status to draft)."""
    async with EnhancedCMSClient() as client:
        result = await client.update_document(
            collection=collection,
            doc_id=doc_id,
            data={"_status": "draft"},
        )

        return {
            "success": True,
            "documentId": doc_id,
            "message": f"Document restored successfully in {collection}",
            "data": result,
        }


# ============================================================================
# OPERATION REGISTRY SETUP
# ============================================================================

def setup_collection_registry() -> OperationRegistry:
    """
    Create and configure operation registry for collections.

    Returns:
        Configured OperationRegistry
    """
    registry = OperationRegistry()

    # Register all operations
    registry.register(
        name="create",
        handler=create_handler,
        cost="medium",
        side_effects=True,
        rate_limit=20,
        output_schema=OPERATION_SCHEMAS["create"],
        description="Create a new document in a collection",
        required_params=["collection", "data"],
    )

    registry.register(
        name="update",
        handler=update_handler,
        cost="medium",
        side_effects=True,
        rate_limit=20,
        output_schema=OPERATION_SCHEMAS["update"],
        description="Update an existing document",
        required_params=["collection", "doc_id", "data"],
    )

    registry.register(
        name="get",
        handler=get_handler,
        cost="low",
        side_effects=False,
        rate_limit=100,
        output_schema=OPERATION_SCHEMAS["get"],
        description="Get a document by ID",
        required_params=["collection", "doc_id"],
    )

    registry.register(
        name="list",
        handler=list_handler,
        cost="low",
        side_effects=False,
        rate_limit=50,
        output_schema=OPERATION_SCHEMAS["list"],
        description="List documents with optional filtering",
        required_params=["collection"],
    )

    registry.register(
        name="delete",
        handler=delete_handler,
        cost="high",
        side_effects=True,
        requires_approval=False,  # Uses confirm flag instead
        rate_limit=10,
        output_schema=OPERATION_SCHEMAS["delete"],
        description="Delete a document permanently",
        required_params=["collection", "doc_id", "confirm"],
    )

    registry.register(
        name="publish",
        handler=publish_handler,
        cost="medium",
        side_effects=True,
        rate_limit=15,
        output_schema=OPERATION_SCHEMAS["publish"],
        description="Publish a draft document",
        required_params=["collection", "doc_id"],
    )

    registry.register(
        name="batch_create",
        handler=batch_create_handler,
        cost="high",
        side_effects=True,
        rate_limit=5,
        output_schema=OPERATION_SCHEMAS["batch_create"],
        description="Create multiple documents in parallel",
        required_params=["collection", "items"],
        timeout=120,
    )

    registry.register(
        name="batch_update",
        handler=batch_update_handler,
        cost="high",
        side_effects=True,
        rate_limit=5,
        output_schema=OPERATION_SCHEMAS["batch_update"],
        description="Update multiple documents in parallel",
        required_params=["collection", "items"],
        timeout=120,
    )

    registry.register(
        name="batch_delete",
        handler=batch_delete_handler,
        cost="high",
        side_effects=True,
        requires_approval=False,  # Uses confirm flag
        rate_limit=2,
        output_schema=OPERATION_SCHEMAS["batch_delete"],
        description="Delete multiple documents in parallel",
        required_params=["collection", "doc_ids", "confirm"],
        timeout=120,
    )

    registry.register(
        name="search",
        handler=search_handler,
        cost="medium",
        side_effects=False,
        rate_limit=30,
        output_schema=OPERATION_SCHEMAS["search"],
        description="Search documents by query",
        required_params=["collection", "query"],
    )

    registry.register(
        name="archive",
        handler=archive_handler,
        cost="low",
        side_effects=True,
        rate_limit=20,
        output_schema=OPERATION_SCHEMAS["archive"],
        description="Archive a document",
        required_params=["collection", "doc_id"],
    )

    registry.register(
        name="restore",
        handler=restore_handler,
        cost="low",
        side_effects=True,
        rate_limit=20,
        output_schema=OPERATION_SCHEMAS["restore"],
        description="Restore an archived document",
        required_params=["collection", "doc_id"],
    )

    # Set up middleware stack
    middleware_stack = create_default_middleware_stack()
    registry.set_middleware_stack(middleware_stack)

    logger.info(
        f"Collection registry initialized with {len(registry.list_operations())} operations"
    )

    return registry


# Global registry instance
_collection_registry: Optional[OperationRegistry] = None


def get_collection_registry() -> OperationRegistry:
    """Get or create collection registry."""
    global _collection_registry
    if _collection_registry is None:
        _collection_registry = setup_collection_registry()
    return _collection_registry


# ============================================================================
# MAIN HANDLER
# ============================================================================

async def cms_collection_ops_handler(
    operation: Literal[
        "create", "update", "get", "list", "delete", "publish",
        "batch_create", "batch_update", "batch_delete",
        "search", "archive", "restore"
    ],
    collection: Literal["projects", "portfolio"],
    **kwargs
) -> dict:
    """
    Unified handler for all collection operations.

    Args:
        operation: Operation to perform
        collection: Target collection
        **kwargs: Operation-specific parameters

    Returns:
        Operation result with structured output

    Examples:
        # Create a document
        result = await cms_collection_ops_handler(
            operation="create",
            collection="projects",
            data={"id": "proj-1", "title": "My Project"},
            draft=True
        )

        # Batch create
        result = await cms_collection_ops_handler(
            operation="batch_create",
            collection="projects",
            items=[...],
            parallel=True
        )

        # Search
        result = await cms_collection_ops_handler(
            operation="search",
            collection="projects",
            query="react typescript"
        )
    """
    registry = get_collection_registry()

    try:
        # Execute through registry (includes middleware and retry logic)
        result = await execute_with_retry(
            operation,
            registry.execute,
            operation,
            collection=collection,
            **kwargs
        )

        return result

    except ResourceNotFoundError as e:
        return {
            "success": False,
            "error": "Resource not found",
            "message": str(e),
        }

    except ValidationError as e:
        return {
            "success": False,
            "error": "Validation error",
            "message": str(e),
        }

    except Exception as e:
        logger.error(
            f"Operation failed",
            operation=operation,
            collection=collection,
            error=str(e),
        )

        return {
            "success": False,
            "error": type(e).__name__,
            "message": str(e),
        }

"""FastMCP Server V2 with Consolidated Tools Architecture.

This version implements the improved functional density architecture with:
- 3 consolidated tools handling 23 operations (7.7x density improvement)
- Circuit breaker pattern for reliability
- Smart caching with proactive warming
- Connection pooling with HTTP/2
- Request deduplication
- Middleware stack for cross-cutting concerns
- Structured output schemas (MCP 2025)
"""

import time
from fastmcp import FastMCP
from typing import Optional, Any
from config import Config
from utils.logging import setup_logging, get_logger

# Import consolidated tool handlers
from tools.consolidated.collections import cms_collection_ops_handler
from tools.consolidated.globals import cms_global_ops_handler
from tools.consolidated.health import cms_health_ops_handler
from tools.consolidated.media import cms_media_ops_handler

# Import schema definitions
from schemas.operation_schemas import OPERATION_SCHEMAS

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Initialize FastMCP server
mcp = FastMCP(Config.MCP_SERVER_NAME)


# ============================================================================
# CONSOLIDATED TOOL 1: COLLECTION OPERATIONS (12 operations)
# ============================================================================

@mcp.tool()
async def cms_collection_ops(
    operation: str,
    collection: str,
    doc_id: Optional[str] = None,
    data: Optional[str] = None,
    items: Optional[str] = None,
    doc_ids: Optional[str] = None,
    filters: Optional[str] = None,
    draft: bool = True,
    confirm: bool = False,
    parallel: bool = True,
    require_approval: bool = False,
    limit: int = 100,
    page: int = 1,
    query: Optional[str] = None,
    fields: Optional[str] = None,
) -> str:
    """
    Unified tool for all collection operations.

    This tool consolidates 12 collection operations into a single interface,
    significantly reducing tool count while expanding functionality.

    Operations:
    - create: Create a new document
    - update: Update an existing document
    - get: Retrieve a document by ID
    - list: List documents with filtering and pagination
    - delete: Delete a document (requires confirm=True)
    - publish: Publish a draft document
    - batch_create: Create multiple documents at once (parallel)
    - batch_update: Update multiple documents at once (parallel)
    - batch_delete: Delete multiple documents at once (parallel)
    - search: Search documents by query
    - archive: Archive a document (set status to archived)
    - restore: Restore an archived document (set status to draft)

    Args:
        operation: Operation to perform (see above)
        collection: Target collection ("projects" or "portfolio")
        doc_id: Document ID (for update, get, delete, publish, archive, restore)
        data: Document data as JSON string (for create, update)
        items: List of items as JSON string (for batch_create, batch_update)
        doc_ids: List of document IDs as JSON string (for batch_delete)
        filters: Query filters as JSON string (for list)
        draft: Create as draft (for create, batch_create)
        confirm: Confirmation flag (for delete, batch_delete)
        parallel: Execute batch operations in parallel
        require_approval: Require human approval (for publish)
        limit: Results per page (for list)
        page: Page number (for list)
        query: Search query (for search)
        fields: Fields to search in as JSON string (for search)

    Returns:
        Operation result as JSON string with success status, data, and message

    Examples:
        # Create a document (data as JSON string)
        cms_collection_ops(
            operation="create",
            collection="projects",
            data='{"id": "proj-1", "title": "My Project"}',
            draft=True
        )

        # Get a document
        cms_collection_ops(
            operation="get",
            collection="projects",
            doc_id="proj-1"
        )

        # List with filters (filters as JSON string)
        cms_collection_ops(
            operation="list",
            collection="projects",
            filters='{"where[_status][equals]": "published"}',
            limit=50,
            page=1
        )

        # Batch create (items as JSON string)
        cms_collection_ops(
            operation="batch_create",
            collection="projects",
            items='[{"id": "proj-1", "title": "Project 1"}, {"id": "proj-2", "title": "Project 2"}]',
            parallel=True
        )

        # Search
        cms_collection_ops(
            operation="search",
            collection="projects",
            query="react typescript"
        )

        # Delete (requires confirmation)
        cms_collection_ops(
            operation="delete",
            collection="projects",
            doc_id="proj-1",
            confirm=True
        )
    """
    import json
    
    # Parse JSON string parameters
    parsed_data = json.loads(data) if data and isinstance(data, str) else data
    parsed_items = json.loads(items) if items and isinstance(items, str) else items
    parsed_doc_ids = json.loads(doc_ids) if doc_ids and isinstance(doc_ids, str) else doc_ids
    parsed_filters = json.loads(filters) if filters and isinstance(filters, str) else filters
    parsed_fields = json.loads(fields) if fields and isinstance(fields, str) else fields
    
    result = await cms_collection_ops_handler(
        operation=operation,
        collection=collection,
        doc_id=doc_id,
        data=parsed_data,
        items=parsed_items,
        doc_ids=parsed_doc_ids,
        filters=parsed_filters,
        draft=draft,
        confirm=confirm,
        parallel=parallel,
        require_approval=require_approval,
        limit=limit,
        page=page,
        query=query,
        fields=parsed_fields,
    )
    
    # Return result as JSON string for Letta compatibility
    return json.dumps(result)


# ============================================================================
# CONSOLIDATED TOOL 2: GLOBAL OPERATIONS (7 operations)
# ============================================================================

@mcp.tool()
async def cms_global_ops(
    operation: str,
    global_slug: Optional[str] = None,
    data: Optional[str] = None,
) -> str:
    """
    Unified tool for all global singleton operations.

    This tool consolidates 7 global operations into a single interface.

    Operations:
    - get: Get a global singleton
    - update: Update a global singleton
    - list: List all available globals
    - reset: Reset global to default values (requires approval)
    - export: Export global data for backup
    - import: Import global data from backup
    - validate: Validate global data without saving

    Args:
        operation: Operation to perform (see above)
        global_slug: Global identifier ("site-settings", "home-intro", "about-page")
                    Not required for 'list' operation
        data: Global data as JSON string (for update, import, validate)

    Returns:
        Operation result as JSON string with success status and data

    Examples:
        # Get global
        cms_global_ops(operation="get", global_slug="site-settings")

        # Update global (data as JSON string)
        cms_global_ops(
            operation="update",
            global_slug="site-settings",
            data='{"title": "New Site Title"}'
        )

        # List all globals
        cms_global_ops(operation="list")
    """
    import json
    
    # Parse JSON string parameter
    parsed_data = json.loads(data) if data and isinstance(data, str) else data
    
    result = await cms_global_ops_handler(
        operation=operation,
        global_slug=global_slug,
        data=parsed_data,
    )
    
    # Return result as JSON string for Letta compatibility
    return json.dumps(result)


# ============================================================================
# CONSOLIDATED TOOL 3: HEALTH & MONITORING (4 operations)
# ============================================================================

@mcp.tool()
async def cms_health_ops(
    operation: str = "health_check",
) -> str:
    """
    Unified tool for health and monitoring operations.

    This tool consolidates 4 health/monitoring operations.

    Operations:
    - health_check: Check server and CMS health status
    - metrics: Get detailed performance metrics
    - cache_stats: Get cache hit rates and statistics
    - connection_status: Get connection pool and circuit breaker status

    Args:
        operation: Operation to perform (default: "health_check")

    Returns:
        Health/metrics data as JSON string

    Examples:
        # Basic health check
        cms_health_ops(operation="health_check")

        # Detailed metrics
        cms_health_ops(operation="metrics")

        # Cache performance
        cms_health_ops(operation="cache_stats")

        # Connection status
        cms_health_ops(operation="connection_status")
    """
    import json
    
    result = await cms_health_ops_handler(
        operation=operation,
    )
    
    # Return result as JSON string for Letta compatibility
    return json.dumps(result)


# ============================================================================
# CONSOLIDATED TOOL 4: MEDIA OPERATIONS (4 operations)
# ============================================================================

@mcp.tool()
async def cms_media_ops(
    operation: str,
    source: Optional[str] = None,
    url: Optional[str] = None,
    local_path: Optional[str] = None,
    file_base64: Optional[str] = None,
    cdn_url: Optional[str] = None,
    alt: Optional[str] = None,
    caption: Optional[str] = None,
    credit: Optional[str] = None,
    media_type: Optional[str] = None,
    filename: Optional[str] = None,
    mime_type: Optional[str] = None,
    dry_run: bool = False,
    media_id: Optional[str] = None,
    filters: Optional[str] = None,
    limit: int = 50,
    page: int = 1,
) -> str:
    """
    Unified tool for media operations: uploads, CDN registration, and queries.

    Operations:
    - upload: Upload a file to the media collection
      - source: url | local_path | base64
      - requires: alt
    - register: Register a CDN URL as a media document
      - requires: cdn_url, alt
    - get: Get a single media document by ID
      - requires: media_id
    - list: List media documents with optional filters
      - optional: filters (JSON string), limit, page

    Args:
        operation: Operation to perform (upload, register, get, list)
        source: Upload source type (url, local_path, base64)
        url: Remote URL for source="url"
        local_path: Local file path for source="local_path"
        file_base64: Base64 data for source="base64"
        cdn_url: CDN URL for register operation
        alt: Alt text (required for upload/register)
        caption: Optional caption
        credit: Optional credit
        media_type: Optional type (image, video)
        filename: Optional filename override
        mime_type: Optional MIME type override
        dry_run: Validate without executing
        media_id: Media document ID for get operation
        filters: JSON string of filters for list operation
        limit: Max documents per page (default 50)
        page: Page number (default 1)

    Returns:
        Operation result as JSON string with success status and data

    Examples:
        # Upload from URL
        cms_media_ops(operation="upload", source="url", url="https://...", alt="My image")

        # Register CDN URL
        cms_media_ops(operation="register", cdn_url="https://cdn.../img.jpg", alt="CDN image")

        # Get media by ID
        cms_media_ops(operation="get", media_id="abc123")

        # List all media
        cms_media_ops(operation="list", limit=25)

        # List with filters
        cms_media_ops(operation="list", filters='{"where[source][equals]":"upload"}')
    """
    import json

    result = await cms_media_ops_handler(
        operation=operation,
        source=source,
        url=url,
        local_path=local_path,
        file_base64=file_base64,
        cdn_url=cdn_url,
        alt=alt,
        caption=caption,
        credit=credit,
        media_type=media_type,
        filename=filename,
        mime_type=mime_type,
        dry_run=dry_run,
        media_id=media_id,
        filters=filters,
        limit=limit,
        page=page,
    )

    return json.dumps(result)


# ============================================================================
# RESOURCES (Read-only endpoints)
# ============================================================================

# Resources remain unchanged from V1 for backwards compatibility
from resources.collections import (
    get_projects_resource,
    get_project_resource,
    get_portfolio_resource,
    get_site_settings_resource,
    get_home_intro_resource,
    get_about_page_resource,
)


@mcp.resource("cms://projects")
async def projects_resource() -> str:
    """List all projects. URI: cms://projects"""
    return await get_projects_resource()


@mcp.resource("cms://projects/drafts")
async def projects_drafts_resource() -> str:
    """List draft projects. URI: cms://projects/drafts"""
    return await get_projects_resource(status="draft")


@mcp.resource("cms://projects/{project_id}")
async def project_resource(project_id: str) -> str:
    """Get a specific project. URI: cms://projects/{id}"""
    return await get_project_resource(project_id)


@mcp.resource("cms://portfolio")
async def portfolio_resource() -> str:
    """List all portfolio items. URI: cms://portfolio"""
    return await get_portfolio_resource()


@mcp.resource("cms://globals/site-settings")
async def site_settings_resource() -> str:
    """Get site settings. URI: cms://globals/site-settings"""
    return await get_site_settings_resource()


@mcp.resource("cms://globals/home-intro")
async def home_intro_resource() -> str:
    """Get home intro. URI: cms://globals/home-intro"""
    return await get_home_intro_resource()


@mcp.resource("cms://globals/about-page")
async def about_page_resource() -> str:
    """Get about page. URI: cms://globals/about-page"""
    return await get_about_page_resource()


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    logger.info(
        "Starting FastMCP CMS Server V2 (Consolidated Architecture)",
        name=Config.MCP_SERVER_NAME,
        version=Config.MCP_SERVER_VERSION,
        host=Config.MCP_HOST,
        port=Config.MCP_PORT,
        tool_count=4,
        operation_count=25,
        density="6.2x",
    )

    logger.info(
        "Architecture improvements",
        circuit_breaker=True,
        smart_caching=True,
        connection_pooling=True,
        request_deduplication=True,
        middleware_stack=True,
        structured_outputs=True,
    )

    # Run server with HTTP transport for Docker deployment
    mcp.run(transport="http", host=Config.MCP_HOST, port=Config.MCP_PORT)

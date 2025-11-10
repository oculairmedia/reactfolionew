"""MCP tools for managing Portfolio collection."""

from models.portfolio import CreatePortfolioItemInput, UpdatePortfolioItemInput
from services.cms_client import CMSClient
from utils.logging import get_logger
from utils.errors import ResourceNotFoundError

logger = get_logger(__name__)


async def create_portfolio_item(input_data: CreatePortfolioItemInput) -> dict:
    """
    Create a new portfolio item.

    This tool creates a portfolio grid item with title, description,
    thumbnail, and optional video.

    Args:
        input_data: Portfolio item creation data

    Returns:
        Created portfolio item information
    """
    logger.info("Creating portfolio item", item_id=input_data.id, draft=input_data.draft)

    async with CMSClient() as client:
        try:
            # Convert to CMS format
            cms_data = input_data.to_cms_format()

            # Create portfolio item
            result = await client.create_document(
                collection="portfolio", data=cms_data, draft=input_data.draft
            )

            return {
                "success": True,
                "portfolioId": input_data.id,
                "status": "draft" if input_data.draft else "published",
                "message": f"Portfolio item '{input_data.title}' created successfully",
                "data": result,
            }

        except Exception as e:
            logger.error("Failed to create portfolio item", error=str(e))
            client.audit.log_error(
                operation="create_portfolio_item",
                resource_type="portfolio",
                error=str(e),
                resource_id=input_data.id,
            )
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to create portfolio item: {e}",
            }


async def update_portfolio_item(item_id: str, input_data: UpdatePortfolioItemInput) -> dict:
    """
    Update an existing portfolio item.

    This tool updates portfolio item details. Only provided fields
    will be updated.

    Args:
        item_id: Portfolio item ID to update
        input_data: Updated portfolio item data

    Returns:
        Updated portfolio item information
    """
    logger.info("Updating portfolio item", item_id=item_id)

    async with CMSClient() as client:
        try:
            # Convert to CMS format
            cms_data = input_data.to_cms_format()

            if not cms_data:
                return {
                    "success": False,
                    "error": "No update data provided",
                    "message": "Please provide at least one field to update",
                }

            # Update portfolio item
            result = await client.update_document(
                collection="portfolio", doc_id=item_id, data=cms_data
            )

            return {
                "success": True,
                "portfolioId": item_id,
                "message": f"Portfolio item '{item_id}' updated successfully",
                "data": result,
            }

        except ResourceNotFoundError:
            return {
                "success": False,
                "error": "Portfolio item not found",
                "message": f"Portfolio item with ID '{item_id}' does not exist",
            }
        except Exception as e:
            logger.error("Failed to update portfolio item", error=str(e))
            client.audit.log_error(
                operation="update_portfolio_item",
                resource_type="portfolio",
                error=str(e),
                resource_id=item_id,
            )
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to update portfolio item: {e}",
            }


async def get_portfolio_item(item_id: str) -> dict:
    """
    Get a specific portfolio item by ID.

    Args:
        item_id: Portfolio item ID to retrieve

    Returns:
        Portfolio item data
    """
    logger.info("Getting portfolio item", item_id=item_id)

    async with CMSClient() as client:
        try:
            result = await client.get_document(collection="portfolio", doc_id=item_id)

            return {
                "success": True,
                "portfolioId": item_id,
                "data": result,
            }

        except ResourceNotFoundError:
            return {
                "success": False,
                "error": "Portfolio item not found",
                "message": f"Portfolio item with ID '{item_id}' does not exist",
            }
        except Exception as e:
            logger.error("Failed to get portfolio item", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to get portfolio item: {e}",
            }


async def list_portfolio_items(tag: str = None, limit: int = 100, page: int = 1) -> dict:
    """
    List all portfolio items with optional filtering.

    Args:
        tag: Filter by tag (optional)
        limit: Results per page (default: 100)
        page: Page number (default: 1)

    Returns:
        List of portfolio items with pagination info
    """
    logger.info("Listing portfolio items", tag=tag, page=page)

    async with CMSClient() as client:
        try:
            # Build filters
            filters = {}
            if tag:
                filters["where[tags.tag][contains]"] = tag

            # Get portfolio items
            result = await client.get_collection(
                collection="portfolio", filters=filters, limit=limit, page=page
            )

            return {
                "success": True,
                "items": result.get("docs", []),
                "totalDocs": result.get("totalDocs", 0),
                "page": result.get("page", 1),
                "totalPages": result.get("totalPages", 1),
                "limit": result.get("limit", limit),
            }

        except Exception as e:
            logger.error("Failed to list portfolio items", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to list portfolio items: {e}",
            }


async def delete_portfolio_item(item_id: str, confirm: bool = False) -> dict:
    """
    Delete a portfolio item.

    This tool permanently deletes a portfolio item from the CMS.
    Requires explicit confirmation.

    Args:
        item_id: Portfolio item ID to delete
        confirm: Confirmation flag (must be True)

    Returns:
        Delete result
    """
    logger.info("Deleting portfolio item", item_id=item_id, confirmed=confirm)

    if not confirm:
        return {
            "success": False,
            "requiresConfirmation": True,
            "message": "Deletion requires explicit confirmation. Set confirm=True to proceed.",
            "portfolioId": item_id,
        }

    async with CMSClient() as client:
        try:
            await client.delete_document(collection="portfolio", doc_id=item_id)

            return {
                "success": True,
                "portfolioId": item_id,
                "message": f"Portfolio item '{item_id}' deleted successfully",
            }

        except ResourceNotFoundError:
            return {
                "success": False,
                "error": "Portfolio item not found",
                "message": f"Portfolio item with ID '{item_id}' does not exist",
            }
        except Exception as e:
            logger.error("Failed to delete portfolio item", error=str(e))
            client.audit.log_error(
                operation="delete_portfolio_item",
                resource_type="portfolio",
                error=str(e),
                resource_id=item_id,
            )
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to delete portfolio item: {e}",
            }

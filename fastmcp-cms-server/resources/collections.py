"""MCP resources for accessing CMS collections."""

from typing import Optional
from services.cms_client import CMSClient
from utils.logging import get_logger

logger = get_logger(__name__)


async def get_projects_resource(status: str = "all", tag: Optional[str] = None) -> str:
    """
    Get projects as a resource.

    URI: cms://projects?status={status}&tag={tag}

    Args:
        status: Filter by status (all/draft/published)
        tag: Filter by tag (optional)

    Returns:
        JSON string of projects
    """
    import json

    async with CMSClient() as client:
        try:
            filters = {}

            if status == "draft":
                filters["where[_status][equals]"] = "draft"
            elif status == "published":
                filters["where[_status][equals]"] = "published"

            if tag:
                filters["where[tags.tag][contains]"] = tag

            result = await client.get_collection(collection="projects", filters=filters)

            return json.dumps(
                {
                    "projects": result.get("docs", []),
                    "total": result.get("totalDocs", 0),
                },
                indent=2,
            )

        except Exception as e:
            logger.error("Failed to get projects resource", error=str(e))
            return json.dumps({"error": str(e)}, indent=2)


async def get_project_resource(project_id: str) -> str:
    """
    Get a specific project as a resource.

    URI: cms://projects/{id}

    Args:
        project_id: Project ID

    Returns:
        JSON string of project
    """
    import json

    async with CMSClient() as client:
        try:
            result = await client.get_document(collection="projects", doc_id=project_id)
            return json.dumps(result, indent=2)

        except Exception as e:
            logger.error("Failed to get project resource", error=str(e))
            return json.dumps({"error": str(e)}, indent=2)


async def get_portfolio_resource(tag: Optional[str] = None) -> str:
    """
    Get portfolio items as a resource.

    URI: cms://portfolio?tag={tag}

    Args:
        tag: Filter by tag (optional)

    Returns:
        JSON string of portfolio items
    """
    import json

    async with CMSClient() as client:
        try:
            filters = {}
            if tag:
                filters["where[tags.tag][contains]"] = tag

            result = await client.get_collection(collection="portfolio", filters=filters)

            return json.dumps(
                {
                    "items": result.get("docs", []),
                    "total": result.get("totalDocs", 0),
                },
                indent=2,
            )

        except Exception as e:
            logger.error("Failed to get portfolio resource", error=str(e))
            return json.dumps({"error": str(e)}, indent=2)


async def get_site_settings_resource() -> str:
    """
    Get site settings as a resource.

    URI: cms://globals/site-settings

    Returns:
        JSON string of site settings
    """
    import json

    async with CMSClient() as client:
        try:
            result = await client.get_global(global_slug="site-settings")
            return json.dumps(result, indent=2)

        except Exception as e:
            logger.error("Failed to get site settings resource", error=str(e))
            return json.dumps({"error": str(e)}, indent=2)


async def get_home_intro_resource() -> str:
    """
    Get home intro as a resource.

    URI: cms://globals/home-intro

    Returns:
        JSON string of home intro
    """
    import json

    async with CMSClient() as client:
        try:
            result = await client.get_global(global_slug="home-intro")
            return json.dumps(result, indent=2)

        except Exception as e:
            logger.error("Failed to get home intro resource", error=str(e))
            return json.dumps({"error": str(e)}, indent=2)


async def get_about_page_resource() -> str:
    """
    Get about page as a resource.

    URI: cms://globals/about-page

    Returns:
        JSON string of about page
    """
    import json

    async with CMSClient() as client:
        try:
            result = await client.get_global(global_slug="about-page")
            return json.dumps(result, indent=2)

        except Exception as e:
            logger.error("Failed to get about page resource", error=str(e))
            return json.dumps({"error": str(e)}, indent=2)

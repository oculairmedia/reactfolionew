"""Main FastMCP server for Payload CMS content publishing."""

import time
from fastmcp import FastMCP
from config import Config
from utils.logging import setup_logging, get_logger

# Import tool functions
from tools.projects import (
    create_project,
    update_project,
    get_project,
    list_projects,
    publish_project,
    delete_project,
)
from tools.portfolio import (
    create_portfolio_item,
    update_portfolio_item,
    get_portfolio_item,
    list_portfolio_items,
    delete_portfolio_item,
)
from tools.globals import (
    get_site_settings,
    update_site_settings,
    get_home_intro,
    update_home_intro,
    get_about_page,
    update_about_page,
)

# Import resource functions
from resources.collections import (
    get_projects_resource,
    get_project_resource,
    get_portfolio_resource,
    get_site_settings_resource,
    get_home_intro_resource,
    get_about_page_resource,
)

# Import models for type hints
from models.project import (
    CreateProjectInput,
    UpdateProjectInput,
    PublishProjectInput,
    ListProjectsInput,
)
from models.portfolio import CreatePortfolioItemInput, UpdatePortfolioItemInput
from models.globals import SiteSettingsInput, HomeIntroInput, AboutPageInput

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Server start time for uptime tracking
START_TIME = time.time()

# Initialize FastMCP server
mcp = FastMCP(Config.MCP_SERVER_NAME)


# ============================================================================
# PROJECT TOOLS
# ============================================================================


@mcp.tool()
async def create_project_tool(input: CreateProjectInput) -> dict:
    """
    Create a new project in the CMS.

    This tool creates a project with all required metadata, sections,
    and gallery items. Projects are created as drafts by default and
    can be published separately.

    Example:
        {
            "id": "my-portfolio-site",
            "title": "Portfolio Website",
            "client": "Personal",
            "technologies": ["React", "TypeScript"],
            "draft": true
        }
    """
    return await create_project(input)


@mcp.tool()
async def update_project_tool(project_id: str, input: UpdateProjectInput) -> dict:
    """
    Update an existing project.

    Only provided fields will be updated. Useful for making incremental
    changes to projects without replacing all data.

    Args:
        project_id: The ID of the project to update
        input: The fields to update

    Example:
        update_project_tool(
            "my-portfolio-site",
            {"title": "Updated Portfolio Website"}
        )
    """
    return await update_project(project_id, input)


@mcp.tool()
async def get_project_tool(project_id: str) -> dict:
    """
    Get a specific project by ID.

    Retrieves full project details including all sections, gallery items,
    and metadata.

    Args:
        project_id: The ID of the project to retrieve
    """
    return await get_project(project_id)


@mcp.tool()
async def list_projects_tool(input: ListProjectsInput = ListProjectsInput()) -> dict:
    """
    List all projects with optional filtering.

    Supports filtering by status (all/draft/published) and tags,
    with pagination support.

    Example:
        list_projects_tool({"status": "draft", "limit": 10})
    """
    return await list_projects(input)


@mcp.tool()
async def publish_project_tool(input: PublishProjectInput) -> dict:
    """
    Publish a draft project.

    Changes a project's status from draft to published, making it
    visible on the public website. May require approval based on
    server configuration.

    Example:
        publish_project_tool({"id": "my-portfolio-site"})
    """
    return await publish_project(input)


@mcp.tool()
async def delete_project_tool(project_id: str, confirm: bool = False) -> dict:
    """
    Delete a project permanently.

    This operation is destructive and requires explicit confirmation.
    May require human approval based on server configuration.

    Args:
        project_id: The ID of the project to delete
        confirm: Must be True to proceed with deletion

    Example:
        delete_project_tool("old-project", confirm=True)
    """
    return await delete_project(project_id, confirm)


# ============================================================================
# PORTFOLIO TOOLS
# ============================================================================


@mcp.tool()
async def create_portfolio_item_tool(input: CreatePortfolioItemInput) -> dict:
    """
    Create a new portfolio grid item.

    Portfolio items appear on the portfolio grid and link to detailed
    project pages.

    Example:
        {
            "id": "portfolio-item-1",
            "title": "Web Design",
            "description": "Modern web design",
            "img": "/media/thumb.jpg",
            "link": "/projects/my-portfolio-site",
            "tags": [{"tag": "web"}]
        }
    """
    return await create_portfolio_item(input)


@mcp.tool()
async def update_portfolio_item_tool(item_id: str, input: UpdatePortfolioItemInput) -> dict:
    """
    Update an existing portfolio item.

    Args:
        item_id: The ID of the portfolio item to update
        input: The fields to update
    """
    return await update_portfolio_item(item_id, input)


@mcp.tool()
async def get_portfolio_item_tool(item_id: str) -> dict:
    """
    Get a specific portfolio item by ID.

    Args:
        item_id: The ID of the portfolio item to retrieve
    """
    return await get_portfolio_item(item_id)


@mcp.tool()
async def list_portfolio_items_tool(
    tag: str = None, limit: int = 100, page: int = 1
) -> dict:
    """
    List all portfolio items with optional filtering.

    Args:
        tag: Filter by tag (optional)
        limit: Results per page (default: 100)
        page: Page number (default: 1)
    """
    return await list_portfolio_items(tag, limit, page)


@mcp.tool()
async def delete_portfolio_item_tool(item_id: str, confirm: bool = False) -> dict:
    """
    Delete a portfolio item permanently.

    Args:
        item_id: The ID of the portfolio item to delete
        confirm: Must be True to proceed with deletion
    """
    return await delete_portfolio_item(item_id, confirm)


# ============================================================================
# GLOBAL CONTENT TOOLS
# ============================================================================


@mcp.tool()
async def get_site_settings_tool() -> dict:
    """
    Get site-wide settings.

    Retrieves global settings including logo, meta tags, contact info,
    and social media links.
    """
    return await get_site_settings()


@mcp.tool()
async def update_site_settings_tool(input: SiteSettingsInput) -> dict:
    """
    Update site-wide settings.

    Update logo text, meta tags, contact information, social media links,
    and EmailJS configuration.

    Example:
        {
            "metaTitle": "My Portfolio",
            "contactEmail": "hello@example.com",
            "socialGithub": "https://github.com/username"
        }
    """
    return await update_site_settings(input)


@mcp.tool()
async def get_home_intro_tool() -> dict:
    """
    Get home page intro content.

    Retrieves the home page introduction including title, description,
    profile image, and animated typewriter phrases.
    """
    return await get_home_intro()


@mcp.tool()
async def update_home_intro_tool(input: HomeIntroInput) -> dict:
    """
    Update home page intro content.

    Update the hero section of the home page including animated phrases.

    Example:
        {
            "title": "Emmanuel U",
            "description": "Full Stack Developer",
            "animated": [
                {"text": "React Developer"},
                {"text": "UI/UX Designer"}
            ]
        }
    """
    return await update_home_intro(input)


@mcp.tool()
async def get_about_page_tool() -> dict:
    """
    Get about page content.

    Retrieves bio, work timeline, skills, and services.
    """
    return await get_about_page()


@mcp.tool()
async def update_about_page_tool(input: AboutPageInput) -> dict:
    """
    Update about page content.

    Update bio text, work timeline, skills list, and services offered.

    Example:
        {
            "aboutMe": "I'm a developer...",
            "skills": [
                {"name": "React", "value": 90},
                {"name": "TypeScript", "value": 85}
            ]
        }
    """
    return await update_about_page(input)


# ============================================================================
# RESOURCES
# ============================================================================


@mcp.resource("cms://projects")
async def projects_resource() -> str:
    """
    List all projects.

    URI: cms://projects
    """
    return await get_projects_resource()


@mcp.resource("cms://projects/drafts")
async def projects_drafts_resource() -> str:
    """
    List draft projects.

    URI: cms://projects/drafts
    """
    return await get_projects_resource(status="draft")


@mcp.resource("cms://projects/{project_id}")
async def project_resource(project_id: str) -> str:
    """
    Get a specific project.

    URI: cms://projects/{id}
    """
    return await get_project_resource(project_id)


@mcp.resource("cms://portfolio")
async def portfolio_resource() -> str:
    """
    List all portfolio items.

    URI: cms://portfolio
    """
    return await get_portfolio_resource()


@mcp.resource("cms://globals/site-settings")
async def site_settings_resource() -> str:
    """
    Get site settings.

    URI: cms://globals/site-settings
    """
    return await get_site_settings_resource()


@mcp.resource("cms://globals/home-intro")
async def home_intro_resource() -> str:
    """
    Get home intro.

    URI: cms://globals/home-intro
    """
    return await get_home_intro_resource()


@mcp.resource("cms://globals/about-page")
async def about_page_resource() -> str:
    """
    Get about page.

    URI: cms://globals/about-page
    """
    return await get_about_page_resource()


# ============================================================================
# HEALTH & MONITORING
# ============================================================================


@mcp.tool()
async def health_check() -> dict:
    """
    Check server and CMS health status.

    Returns health information including server uptime, CMS connectivity,
    and version information.
    """
    from services.cms_client import CMSClient

    uptime = int(time.time() - START_TIME)

    async with CMSClient() as client:
        cms_health = await client.check_health()

    return {
        "status": "healthy",
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


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    logger.info(
        "Starting FastMCP CMS Server",
        name=Config.MCP_SERVER_NAME,
        version=Config.MCP_SERVER_VERSION,
        host=Config.MCP_HOST,
        port=Config.MCP_PORT,
    )

    # Run server with HTTP transport for Docker deployment
    mcp.run(transport="http", host=Config.MCP_HOST, port=Config.MCP_PORT)

"""MCP tools for managing Global singletons."""

from models.globals import SiteSettingsInput, HomeIntroInput, AboutPageInput
from services.cms_client import CMSClient
from utils.logging import get_logger

logger = get_logger(__name__)


async def get_site_settings() -> dict:
    """
    Get site-wide settings.

    This tool retrieves global site settings including logo, meta tags,
    contact info, and social media links.

    Returns:
        Site settings data
    """
    logger.info("Getting site settings")

    async with CMSClient() as client:
        try:
            result = await client.get_global(global_slug="site-settings")

            return {
                "success": True,
                "data": result,
            }

        except Exception as e:
            logger.error("Failed to get site settings", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to get site settings: {e}",
            }


async def update_site_settings(input_data: SiteSettingsInput) -> dict:
    """
    Update site-wide settings.

    This tool updates global site settings such as logo text, meta tags,
    contact information, and social media links.

    Args:
        input_data: Site settings update data

    Returns:
        Updated site settings
    """
    logger.info("Updating site settings")

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

            # Update global
            result = await client.update_global(global_slug="site-settings", data=cms_data)

            return {
                "success": True,
                "message": "Site settings updated successfully",
                "data": result,
            }

        except Exception as e:
            logger.error("Failed to update site settings", error=str(e))
            client.audit.log_error(
                operation="update_site_settings",
                resource_type="global",
                error=str(e),
                resource_id="site-settings",
            )
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to update site settings: {e}",
            }


async def get_home_intro() -> dict:
    """
    Get home page intro content.

    This tool retrieves the home page introduction including title,
    description, profile image, and animated phrases.

    Returns:
        Home intro data
    """
    logger.info("Getting home intro")

    async with CMSClient() as client:
        try:
            result = await client.get_global(global_slug="home-intro")

            return {
                "success": True,
                "data": result,
            }

        except Exception as e:
            logger.error("Failed to get home intro", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to get home intro: {e}",
            }


async def update_home_intro(input_data: HomeIntroInput) -> dict:
    """
    Update home page intro content.

    This tool updates the home page introduction including title,
    description, profile image, and animated typewriter phrases.

    Args:
        input_data: Home intro update data

    Returns:
        Updated home intro
    """
    logger.info("Updating home intro")

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

            # Update global
            result = await client.update_global(global_slug="home-intro", data=cms_data)

            return {
                "success": True,
                "message": "Home intro updated successfully",
                "data": result,
            }

        except Exception as e:
            logger.error("Failed to update home intro", error=str(e))
            client.audit.log_error(
                operation="update_home_intro",
                resource_type="global",
                error=str(e),
                resource_id="home-intro",
            )
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to update home intro: {e}",
            }


async def get_about_page() -> dict:
    """
    Get about page content.

    This tool retrieves the about page content including bio,
    work timeline, skills, and services.

    Returns:
        About page data
    """
    logger.info("Getting about page")

    async with CMSClient() as client:
        try:
            result = await client.get_global(global_slug="about-page")

            return {
                "success": True,
                "data": result,
            }

        except Exception as e:
            logger.error("Failed to get about page", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to get about page: {e}",
            }


async def update_about_page(input_data: AboutPageInput) -> dict:
    """
    Update about page content.

    This tool updates the about page including bio text, work timeline,
    skills list, and services offered.

    Args:
        input_data: About page update data

    Returns:
        Updated about page
    """
    logger.info("Updating about page")

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

            # Update global
            result = await client.update_global(global_slug="about-page", data=cms_data)

            return {
                "success": True,
                "message": "About page updated successfully",
                "data": result,
            }

        except Exception as e:
            logger.error("Failed to update about page", error=str(e))
            client.audit.log_error(
                operation="update_about_page",
                resource_type="global",
                error=str(e),
                resource_id="about-page",
            )
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to update about page: {e}",
            }

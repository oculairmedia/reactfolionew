"""MCP tools for managing Projects collection."""

from typing import Optional
from config import Config
from models.project import (
    CreateProjectInput,
    UpdateProjectInput,
    PublishProjectInput,
    ListProjectsInput,
)
from services.cms_client import CMSClient
from utils.logging import get_logger
from utils.errors import ResourceNotFoundError, ValidationError

logger = get_logger(__name__)


async def create_project(input_data: CreateProjectInput) -> dict:
    """
    Create a new project in the CMS.

    This tool creates a project with all required metadata, sections,
    and gallery items. Projects are created as drafts by default.

    Args:
        input_data: Project creation data

    Returns:
        Created project information
    """
    logger.info("Creating project", project_id=input_data.id, draft=input_data.draft)

    async with CMSClient() as client:
        try:
            # Convert to CMS format
            cms_data = input_data.to_cms_format()

            # Create project
            result = await client.create_document(
                collection="projects", data=cms_data, draft=input_data.draft
            )

            return {
                "success": True,
                "projectId": input_data.id,
                "status": "draft" if input_data.draft else "published",
                "message": f"Project '{input_data.title}' created successfully",
                "data": result,
            }

        except Exception as e:
            logger.error("Failed to create project", error=str(e))
            client.audit.log_error(
                operation="create_project",
                resource_type="project",
                error=str(e),
                resource_id=input_data.id,
            )
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to create project: {e}",
            }


async def update_project(project_id: str, input_data: UpdateProjectInput) -> dict:
    """
    Update an existing project.

    This tool updates project details, sections, or gallery items.
    Only provided fields will be updated.

    Args:
        project_id: Project ID to update
        input_data: Updated project data

    Returns:
        Updated project information
    """
    logger.info("Updating project", project_id=project_id)

    async with CMSClient() as client:
        try:
            # Convert to CMS format
            cms_data = input_data.to_cms_format()

            if not cms_data:
                raise ValidationError("No update data provided")

            # Update project
            result = await client.update_document(
                collection="projects", doc_id=project_id, data=cms_data
            )

            return {
                "success": True,
                "projectId": project_id,
                "message": f"Project '{project_id}' updated successfully",
                "data": result,
            }

        except ResourceNotFoundError:
            return {
                "success": False,
                "error": "Project not found",
                "message": f"Project with ID '{project_id}' does not exist",
            }
        except Exception as e:
            logger.error("Failed to update project", error=str(e))
            client.audit.log_error(
                operation="update_project",
                resource_type="project",
                error=str(e),
                resource_id=project_id,
            )
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to update project: {e}",
            }


async def get_project(project_id: str) -> dict:
    """
    Get a specific project by ID.

    This tool retrieves full project details including all sections,
    gallery items, and metadata.

    Args:
        project_id: Project ID to retrieve

    Returns:
        Project data
    """
    logger.info("Getting project", project_id=project_id)

    async with CMSClient() as client:
        try:
            result = await client.get_document(collection="projects", doc_id=project_id)

            return {
                "success": True,
                "projectId": project_id,
                "data": result,
            }

        except ResourceNotFoundError:
            return {
                "success": False,
                "error": "Project not found",
                "message": f"Project with ID '{project_id}' does not exist",
            }
        except Exception as e:
            logger.error("Failed to get project", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to get project: {e}",
            }


async def list_projects(input_data: Optional[ListProjectsInput] = None) -> dict:
    """
    List all projects with optional filtering.

    This tool lists projects with pagination and filtering by status or tag.

    Args:
        input_data: List filtering options

    Returns:
        List of projects with pagination info
    """
    if input_data is None:
        input_data = ListProjectsInput()

    logger.info(
        "Listing projects",
        status=input_data.status,
        tag=input_data.tag,
        page=input_data.page,
    )

    async with CMSClient() as client:
        try:
            # Build filters
            filters = {}

            if input_data.status == "draft":
                filters["where[_status][equals]"] = "draft"
            elif input_data.status == "published":
                filters["where[_status][equals]"] = "published"

            if input_data.tag:
                filters["where[tags.tag][contains]"] = input_data.tag

            # Get projects
            result = await client.get_collection(
                collection="projects",
                filters=filters,
                limit=input_data.limit,
                page=input_data.page,
            )

            return {
                "success": True,
                "projects": result.get("docs", []),
                "totalDocs": result.get("totalDocs", 0),
                "page": result.get("page", 1),
                "totalPages": result.get("totalPages", 1),
                "limit": result.get("limit", input_data.limit),
            }

        except Exception as e:
            logger.error("Failed to list projects", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to list projects: {e}",
            }


async def publish_project(input_data: PublishProjectInput) -> dict:
    """
    Publish a draft project.

    This tool changes a project's status from draft to published,
    making it visible on the public website.

    Args:
        input_data: Publish options

    Returns:
        Publish result
    """
    logger.info(
        "Publishing project",
        project_id=input_data.id,
        require_approval=input_data.requireApproval,
    )

    # Check if approval is required
    if Config.REQUIRE_APPROVAL_FOR_PUBLISH or input_data.requireApproval:
        return {
            "success": False,
            "requiresApproval": True,
            "message": "Publishing requires human approval. Please review and approve manually.",
            "projectId": input_data.id,
        }

    async with CMSClient() as client:
        try:
            # Update status to published
            result = await client.update_document(
                collection="projects",
                doc_id=input_data.id,
                data={"_status": "published"},
            )

            # Log publish action
            client.audit.log_publish(
                resource_type="project",
                resource_id=input_data.id,
                metadata={"requireApproval": input_data.requireApproval},
            )

            return {
                "success": True,
                "projectId": input_data.id,
                "status": "published",
                "message": f"Project '{input_data.id}' published successfully",
                "data": result,
            }

        except ResourceNotFoundError:
            return {
                "success": False,
                "error": "Project not found",
                "message": f"Project with ID '{input_data.id}' does not exist",
            }
        except Exception as e:
            logger.error("Failed to publish project", error=str(e))
            client.audit.log_error(
                operation="publish_project",
                resource_type="project",
                error=str(e),
                resource_id=input_data.id,
            )
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to publish project: {e}",
            }


async def delete_project(project_id: str, confirm: bool = False) -> dict:
    """
    Delete a project.

    This tool permanently deletes a project from the CMS.
    Requires explicit confirmation.

    Args:
        project_id: Project ID to delete
        confirm: Confirmation flag (must be True)

    Returns:
        Delete result
    """
    logger.info("Deleting project", project_id=project_id, confirmed=confirm)

    if not confirm:
        return {
            "success": False,
            "requiresConfirmation": True,
            "message": "Deletion requires explicit confirmation. Set confirm=True to proceed.",
            "projectId": project_id,
        }

    # Check if approval is required
    if Config.REQUIRE_APPROVAL_FOR_DELETE:
        return {
            "success": False,
            "requiresApproval": True,
            "message": "Deletion requires human approval. Please delete manually from admin panel.",
            "projectId": project_id,
        }

    async with CMSClient() as client:
        try:
            await client.delete_document(collection="projects", doc_id=project_id)

            return {
                "success": True,
                "projectId": project_id,
                "message": f"Project '{project_id}' deleted successfully",
            }

        except ResourceNotFoundError:
            return {
                "success": False,
                "error": "Project not found",
                "message": f"Project with ID '{project_id}' does not exist",
            }
        except Exception as e:
            logger.error("Failed to delete project", error=str(e))
            client.audit.log_error(
                operation="delete_project",
                resource_type="project",
                error=str(e),
                resource_id=project_id,
            )
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to delete project: {e}",
            }

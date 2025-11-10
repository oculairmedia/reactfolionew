"""Pydantic models for Project collection."""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator
from utils.validation import validate_id, validate_url, sanitize_html


class ProjectTag(BaseModel):
    """Project tag model."""

    tag: str = Field(..., description="Tag name")


class ProjectHero(BaseModel):
    """Project hero image/video model."""

    type: Literal["image", "video"] = Field(..., description="Hero media type")
    imageUrl: Optional[str] = Field(None, description="Hero image URL")
    videoUrl: Optional[str] = Field(None, description="Hero video URL")
    alt: Optional[str] = Field(None, description="Alt text for accessibility")

    @field_validator("imageUrl", "videoUrl")
    @classmethod
    def validate_urls(cls, v):
        """Validate URLs."""
        if v:
            return validate_url(v)
        return v


class ProjectSection(BaseModel):
    """Project content section model."""

    title: Optional[str] = Field(None, description="Section title")
    content: str = Field(..., description="Section content")
    layout: Literal["full-width", "two-column"] = Field(
        "full-width", description="Section layout"
    )

    @field_validator("content")
    @classmethod
    def sanitize_content(cls, v):
        """Sanitize HTML content."""
        return sanitize_html(v)


class ProjectGalleryItem(BaseModel):
    """Project gallery item model."""

    type: Literal["image", "video"] = Field(..., description="Gallery item type")
    url: str = Field(..., description="Media URL")
    caption: Optional[str] = Field(None, description="Media caption")
    width: Literal["full", "half"] = Field("full", description="Display width")

    @field_validator("url")
    @classmethod
    def validate_url_field(cls, v):
        """Validate URL."""
        return validate_url(v)


class ProjectMetadata(BaseModel):
    """Project metadata model."""

    client: str = Field(..., description="Client name")
    date: Optional[str] = Field(None, description="Project date (YYYY-MM-DD)")
    role: Optional[str] = Field(None, description="Your role in the project")
    technologies: List[str] = Field(default_factory=list, description="Technologies used")


class CreateProjectInput(BaseModel):
    """Input model for creating a project."""

    id: str = Field(..., description="Unique project ID (URL slug)")
    title: str = Field(..., description="Project title")
    subtitle: Optional[str] = Field(None, description="Project subtitle")
    client: str = Field(..., description="Client name")
    date: Optional[str] = Field(None, description="Project date (YYYY-MM-DD)")
    role: Optional[str] = Field(None, description="Your role in the project")
    technologies: List[str] = Field(..., description="Technologies used")
    tags: Optional[List[ProjectTag]] = Field(
        default_factory=list, description="Project tags for categorization"
    )
    hero: Optional[ProjectHero] = Field(None, description="Hero image or video")
    sections: Optional[List[ProjectSection]] = Field(
        default_factory=list, description="Project content sections"
    )
    gallery: Optional[List[ProjectGalleryItem]] = Field(
        default_factory=list, description="Gallery images/videos"
    )
    draft: bool = Field(True, description="Create as draft (requires publishing)")

    @field_validator("id")
    @classmethod
    def validate_id_field(cls, v):
        """Validate project ID."""
        return validate_id(v)

    def to_cms_format(self) -> dict:
        """Convert to CMS API format."""
        data = {
            "id": self.id,
            "title": self.title,
            "metadata": {
                "client": self.client,
                "date": self.date,
                "role": self.role,
                "technologies": self.technologies,
            },
        }

        if self.subtitle:
            data["subtitle"] = self.subtitle

        if self.tags:
            data["tags"] = [tag.dict() for tag in self.tags]

        if self.hero:
            data["hero"] = self.hero.dict()

        if self.sections:
            data["sections"] = [section.dict() for section in self.sections]

        if self.gallery:
            data["gallery"] = [item.dict() for item in self.gallery]

        return data


class UpdateProjectInput(BaseModel):
    """Input model for updating a project."""

    title: Optional[str] = Field(None, description="Project title")
    subtitle: Optional[str] = Field(None, description="Project subtitle")
    client: Optional[str] = Field(None, description="Client name")
    date: Optional[str] = Field(None, description="Project date (YYYY-MM-DD)")
    role: Optional[str] = Field(None, description="Your role")
    technologies: Optional[List[str]] = Field(None, description="Technologies used")
    tags: Optional[List[ProjectTag]] = Field(None, description="Project tags")
    hero: Optional[ProjectHero] = Field(None, description="Hero image or video")
    sections: Optional[List[ProjectSection]] = Field(None, description="Content sections")
    gallery: Optional[List[ProjectGalleryItem]] = Field(None, description="Gallery items")

    def to_cms_format(self) -> dict:
        """Convert to CMS API format."""
        data = {}

        if self.title is not None:
            data["title"] = self.title

        if self.subtitle is not None:
            data["subtitle"] = self.subtitle

        # Build metadata object if any metadata fields are present
        metadata = {}
        if self.client is not None:
            metadata["client"] = self.client
        if self.date is not None:
            metadata["date"] = self.date
        if self.role is not None:
            metadata["role"] = self.role
        if self.technologies is not None:
            metadata["technologies"] = self.technologies

        if metadata:
            data["metadata"] = metadata

        if self.tags is not None:
            data["tags"] = [tag.dict() for tag in self.tags]

        if self.hero is not None:
            data["hero"] = self.hero.dict()

        if self.sections is not None:
            data["sections"] = [section.dict() for section in self.sections]

        if self.gallery is not None:
            data["gallery"] = [item.dict() for item in self.gallery]

        return data


class PublishProjectInput(BaseModel):
    """Input model for publishing a project."""

    id: str = Field(..., description="Project ID to publish")
    requireApproval: bool = Field(
        False, description="Flag for human approval before publishing"
    )

    @field_validator("id")
    @classmethod
    def validate_id_field(cls, v):
        """Validate project ID."""
        return validate_id(v)


class ListProjectsInput(BaseModel):
    """Input model for listing projects."""

    status: Literal["all", "draft", "published"] = Field("all", description="Filter by status")
    tag: Optional[str] = Field(None, description="Filter by tag")
    limit: int = Field(100, description="Results per page", ge=1, le=100)
    page: int = Field(1, description="Page number", ge=1)

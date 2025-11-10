"""Pydantic models for Portfolio collection."""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from utils.validation import validate_id, validate_url


class PortfolioTag(BaseModel):
    """Portfolio tag model."""

    tag: str = Field(..., description="Tag name")


class CreatePortfolioItemInput(BaseModel):
    """Input model for creating a portfolio item."""

    id: str = Field(..., description="Unique portfolio item ID (URL slug)")
    title: str = Field(..., description="Portfolio item title")
    description: str = Field(..., description="Portfolio item description")
    img: str = Field(..., description="Thumbnail image URL")
    link: Optional[str] = Field(None, description="Link to detailed project page")
    date: Optional[str] = Field(None, description="Project date (YYYY-MM-DD)")
    isVideo: bool = Field(False, description="Whether this item has a video")
    video: Optional[str] = Field(None, description="Video URL (if isVideo is true)")
    tags: Optional[List[PortfolioTag]] = Field(
        default_factory=list, description="Tags for categorization"
    )
    draft: bool = Field(True, description="Create as draft (requires publishing)")

    @field_validator("id")
    @classmethod
    def validate_id_field(cls, v):
        """Validate portfolio item ID."""
        return validate_id(v)

    @field_validator("img", "link", "video")
    @classmethod
    def validate_urls(cls, v):
        """Validate URLs."""
        if v:
            return validate_url(v)
        return v

    def to_cms_format(self) -> dict:
        """Convert to CMS API format."""
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "img": self.img,
            "isVideo": self.isVideo,
        }

        if self.link:
            data["link"] = self.link

        if self.date:
            data["date"] = self.date

        if self.video:
            data["video"] = self.video

        if self.tags:
            data["tags"] = [tag.dict() for tag in self.tags]

        return data


class UpdatePortfolioItemInput(BaseModel):
    """Input model for updating a portfolio item."""

    title: Optional[str] = Field(None, description="Portfolio item title")
    description: Optional[str] = Field(None, description="Portfolio item description")
    img: Optional[str] = Field(None, description="Thumbnail image URL")
    link: Optional[str] = Field(None, description="Link to detailed project page")
    date: Optional[str] = Field(None, description="Project date (YYYY-MM-DD)")
    isVideo: Optional[bool] = Field(None, description="Whether this item has a video")
    video: Optional[str] = Field(None, description="Video URL")
    tags: Optional[List[PortfolioTag]] = Field(None, description="Tags for categorization")

    @field_validator("img", "link", "video")
    @classmethod
    def validate_urls(cls, v):
        """Validate URLs."""
        if v:
            return validate_url(v)
        return v

    def to_cms_format(self) -> dict:
        """Convert to CMS API format."""
        data = {}

        if self.title is not None:
            data["title"] = self.title

        if self.description is not None:
            data["description"] = self.description

        if self.img is not None:
            data["img"] = self.img

        if self.link is not None:
            data["link"] = self.link

        if self.date is not None:
            data["date"] = self.date

        if self.isVideo is not None:
            data["isVideo"] = self.isVideo

        if self.video is not None:
            data["video"] = self.video

        if self.tags is not None:
            data["tags"] = [tag.dict() for tag in self.tags]

        return data

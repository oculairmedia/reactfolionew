"""Pydantic models for Global singletons."""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from utils.validation import validate_email, validate_url


class SiteSettingsInput(BaseModel):
    """Input model for updating site settings."""

    logoText: Optional[str] = Field(None, description="Logo text")
    metaTitle: Optional[str] = Field(None, description="Meta title for SEO")
    metaDescription: Optional[str] = Field(None, description="Meta description for SEO")
    contactEmail: Optional[str] = Field(None, description="Contact email address")
    contactDescription: Optional[str] = Field(None, description="Contact form description")
    emailJsServiceId: Optional[str] = Field(None, description="EmailJS service ID")
    emailJsTemplateId: Optional[str] = Field(None, description="EmailJS template ID")
    emailJsPublicKey: Optional[str] = Field(None, description="EmailJS public key")
    socialGithub: Optional[str] = Field(None, description="GitHub profile URL")
    socialFacebook: Optional[str] = Field(None, description="Facebook profile URL")
    socialLinkedin: Optional[str] = Field(None, description="LinkedIn profile URL")
    socialTwitter: Optional[str] = Field(None, description="Twitter/X profile URL")

    @field_validator("contactEmail")
    @classmethod
    def validate_email_field(cls, v):
        """Validate email."""
        if v:
            return validate_email(v)
        return v

    @field_validator("socialGithub", "socialFacebook", "socialLinkedin", "socialTwitter")
    @classmethod
    def validate_urls(cls, v):
        """Validate URLs."""
        if v:
            return validate_url(v)
        return v

    def to_cms_format(self) -> dict:
        """Convert to CMS API format."""
        data = {}

        # Meta group
        meta = {}
        if self.metaTitle is not None:
            meta["title"] = self.metaTitle
        if self.metaDescription is not None:
            meta["description"] = self.metaDescription
        if meta:
            data["meta"] = meta

        # Contact group
        contact = {}
        if self.contactEmail is not None:
            contact["email"] = self.contactEmail
        if self.contactDescription is not None:
            contact["description"] = self.contactDescription
        if self.emailJsServiceId is not None:
            contact["emailJsServiceId"] = self.emailJsServiceId
        if self.emailJsTemplateId is not None:
            contact["emailJsTemplateId"] = self.emailJsTemplateId
        if self.emailJsPublicKey is not None:
            contact["emailJsPublicKey"] = self.emailJsPublicKey
        if contact:
            data["contact"] = contact

        # Social group
        social = {}
        if self.socialGithub is not None:
            social["github"] = self.socialGithub
        if self.socialFacebook is not None:
            social["facebook"] = self.socialFacebook
        if self.socialLinkedin is not None:
            social["linkedin"] = self.socialLinkedin
        if self.socialTwitter is not None:
            social["twitter"] = self.socialTwitter
        if social:
            data["social"] = social

        if self.logoText is not None:
            data["logoText"] = self.logoText

        return data


class AnimatedPhrase(BaseModel):
    """Animated typewriter phrase model."""

    text: str = Field(..., description="Phrase text")


class HomeIntroInput(BaseModel):
    """Input model for updating home intro."""

    title: Optional[str] = Field(None, description="Intro title")
    description: Optional[str] = Field(None, description="Intro description")
    profileImageUrl: Optional[str] = Field(None, description="Profile image URL")
    animated: Optional[List[AnimatedPhrase]] = Field(
        None, description="Animated typewriter phrases"
    )

    @field_validator("profileImageUrl")
    @classmethod
    def validate_url_field(cls, v):
        """Validate URL."""
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

        if self.profileImageUrl is not None:
            data["profileImageUrl"] = self.profileImageUrl

        if self.animated is not None:
            data["animated"] = [phrase.dict() for phrase in self.animated]

        return data


class TimelineItem(BaseModel):
    """Timeline item model."""

    jobtitle: str = Field(..., description="Job title")
    where: str = Field(..., description="Company/organization name")
    date: str = Field(..., description="Date range")


class Skill(BaseModel):
    """Skill model."""

    name: str = Field(..., description="Skill name")
    value: int = Field(..., description="Skill level (0-100)", ge=0, le=100)


class Service(BaseModel):
    """Service model."""

    title: str = Field(..., description="Service title")
    description: str = Field(..., description="Service description")


class AboutPageInput(BaseModel):
    """Input model for updating about page."""

    title: Optional[str] = Field(None, description="About page title")
    aboutMe: Optional[str] = Field(None, description="About me text")
    timeline: Optional[List[TimelineItem]] = Field(None, description="Work timeline")
    skills: Optional[List[Skill]] = Field(None, description="Skills list")
    services: Optional[List[Service]] = Field(None, description="Services offered")

    def to_cms_format(self) -> dict:
        """Convert to CMS API format."""
        data = {}

        if self.title is not None:
            data["title"] = self.title

        if self.aboutMe is not None:
            data["aboutMe"] = self.aboutMe

        if self.timeline is not None:
            data["timeline"] = [item.dict() for item in self.timeline]

        if self.skills is not None:
            data["skills"] = [skill.dict() for skill in self.skills]

        if self.services is not None:
            data["services"] = [service.dict() for service in self.services]

        return data

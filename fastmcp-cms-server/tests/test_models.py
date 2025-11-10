"""Tests for Pydantic models."""

import pytest
from pydantic import ValidationError
from models.project import CreateProjectInput, ProjectHero, ProjectSection
from models.portfolio import CreatePortfolioItemInput
from models.globals import SiteSettingsInput


def test_create_project_input_valid():
    """Test valid project creation input."""
    data = CreateProjectInput(
        id="test-project",
        title="Test Project",
        client="Test Client",
        technologies=["Python", "FastMCP"],
    )

    assert data.id == "test-project"
    assert data.title == "Test Project"
    assert data.draft is True  # Default value


def test_create_project_input_invalid_id():
    """Test project creation with invalid ID."""
    with pytest.raises(ValidationError):
        CreateProjectInput(
            id="Invalid ID",  # Spaces not allowed
            title="Test",
            client="Client",
            technologies=["Tech"],
        )


def test_project_hero_valid():
    """Test valid project hero."""
    hero = ProjectHero(
        type="image",
        imageUrl="https://example.com/image.jpg",
        alt="Hero image",
    )

    assert hero.type == "image"
    assert hero.imageUrl == "https://example.com/image.jpg"


def test_project_section():
    """Test project section with HTML sanitization."""
    section = ProjectSection(
        title="Overview",
        content='<p>Content</p><script>alert("xss")</script>',
        layout="full-width",
    )

    # Content should be sanitized
    assert "<script>" not in section.content


def test_create_portfolio_item_valid():
    """Test valid portfolio item creation."""
    data = CreatePortfolioItemInput(
        id="portfolio-1",
        title="Portfolio Item",
        description="Description",
        img="/media/image.jpg",
    )

    assert data.id == "portfolio-1"
    assert data.isVideo is False  # Default value


def test_site_settings_input():
    """Test site settings update."""
    settings = SiteSettingsInput(
        metaTitle="My Site",
        contactEmail="test@example.com",
        socialGithub="https://github.com/user",
    )

    cms_data = settings.to_cms_format()

    assert cms_data["meta"]["title"] == "My Site"
    assert cms_data["contact"]["email"] == "test@example.com"
    assert cms_data["social"]["github"] == "https://github.com/user"

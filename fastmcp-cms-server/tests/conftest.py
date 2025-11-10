"""Pytest configuration and fixtures."""

import pytest
import os

# Set test environment variables
os.environ["CMS_API_URL"] = "http://localhost:3001/api"
os.environ["CMS_ADMIN_EMAIL"] = "test@example.com"
os.environ["CMS_ADMIN_PASSWORD"] = "test_password"
os.environ["ENABLE_AUDIT_LOG"] = "false"  # Disable audit logging in tests


@pytest.fixture
def mock_project_data():
    """Mock project data for testing."""
    return {
        "id": "test-project",
        "title": "Test Project",
        "subtitle": "A test project",
        "metadata": {
            "client": "Test Client",
            "date": "2025-11",
            "role": "Developer",
            "technologies": ["Python", "FastMCP"],
        },
        "tags": [{"tag": "test"}],
        "sections": [
            {
                "title": "Overview",
                "content": "Project overview",
                "layout": "full-width",
            }
        ],
    }


@pytest.fixture
def mock_portfolio_data():
    """Mock portfolio data for testing."""
    return {
        "id": "portfolio-1",
        "title": "Portfolio Item",
        "description": "Test portfolio item",
        "img": "/media/image.jpg",
        "isVideo": False,
        "tags": [{"tag": "web"}],
    }

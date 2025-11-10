"""Tests for validation utilities."""

import pytest
from utils.validation import (
    validate_id,
    sanitize_html,
    validate_url,
    validate_email,
    validate_date,
)
from utils.errors import ValidationError


def test_validate_id_success():
    """Test valid ID validation."""
    assert validate_id("my-project-123") == "my-project-123"
    assert validate_id("test") == "test"
    assert validate_id("a-b-c-1-2-3") == "a-b-c-1-2-3"


def test_validate_id_invalid():
    """Test invalid ID validation."""
    with pytest.raises(ValidationError):
        validate_id("")

    with pytest.raises(ValidationError):
        validate_id("My Project")  # Contains space

    with pytest.raises(ValidationError):
        validate_id("project_123")  # Contains underscore

    with pytest.raises(ValidationError):
        validate_id("PROJECT")  # Uppercase


def test_sanitize_html():
    """Test HTML sanitization."""
    # Remove script tags
    result = sanitize_html('<p>Hello</p><script>alert("xss")</script>')
    assert "<script>" not in result
    assert "alert" not in result

    # Remove event handlers
    result = sanitize_html('<div onclick="alert()">Click</div>')
    assert "onclick" not in result

    # Remove javascript: protocol
    result = sanitize_html('<a href="javascript:alert()">Link</a>')
    assert "javascript:" not in result


def test_validate_url():
    """Test URL validation."""
    assert validate_url("https://example.com") == "https://example.com"
    assert validate_url("http://localhost:3000") == "http://localhost:3000"
    assert validate_url("/path/to/resource") == "/path/to/resource"

    # Reject dangerous protocols
    with pytest.raises(ValidationError):
        validate_url("javascript:alert()")

    with pytest.raises(ValidationError):
        validate_url("data:text/html,<script>alert()</script>")


def test_validate_email():
    """Test email validation."""
    assert validate_email("test@example.com") == "test@example.com"
    assert validate_email("user.name@domain.co.uk") == "user.name@domain.co.uk"

    with pytest.raises(ValidationError):
        validate_email("")

    with pytest.raises(ValidationError):
        validate_email("invalid-email")

    with pytest.raises(ValidationError):
        validate_email("@example.com")


def test_validate_date():
    """Test date validation."""
    assert validate_date("2025-11-10") == "2025-11-10"
    assert validate_date("") == ""

    with pytest.raises(ValidationError):
        validate_date("11/10/2025")

    with pytest.raises(ValidationError):
        validate_date("2025-11-10T12:00:00")

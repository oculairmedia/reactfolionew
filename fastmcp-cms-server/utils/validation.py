"""Input validation and sanitization utilities."""

import re
from typing import Any
from utils.errors import ValidationError


def validate_id(id_value: str) -> str:
    """
    Validate and sanitize an ID string.
    IDs must be lowercase, alphanumeric with hyphens.

    Args:
        id_value: The ID to validate

    Returns:
        The validated ID

    Raises:
        ValidationError: If ID is invalid
    """
    if not id_value:
        raise ValidationError("ID cannot be empty")

    if not re.match(r"^[a-z0-9-]+$", id_value):
        raise ValidationError(
            "ID must contain only lowercase letters, numbers, and hyphens"
        )

    if len(id_value) > 100:
        raise ValidationError("ID must be 100 characters or less")

    return id_value


def sanitize_html(content: str) -> str:
    """
    Sanitize HTML content to prevent XSS attacks.

    Args:
        content: The content to sanitize

    Returns:
        Sanitized content
    """
    if not content:
        return content

    # Remove script tags and their content
    content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)

    # Remove event handlers
    content = re.sub(r'\s*on\w+\s*=\s*["\'][^"\']*["\']', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*on\w+\s*=\s*[^>\s]+', '', content, flags=re.IGNORECASE)

    # Remove javascript: protocol
    content = re.sub(r'javascript:', '', content, flags=re.IGNORECASE)

    return content


def validate_url(url: str) -> str:
    """
    Validate URL format.

    Accepts:
    - Absolute URLs: https://example.com/path
    - Protocol-relative URLs: //example.com/path
    - Relative paths: /path/to/resource
    - Localhost URLs: http://localhost:3000

    Args:
        url: The URL to validate

    Returns:
        The validated URL

    Raises:
        ValidationError: If URL is invalid
    """
    if not url:
        return url

    # Check for dangerous protocols first
    if re.match(r'^(javascript|data|vbscript):', url, re.IGNORECASE):
        raise ValidationError(f"Unsafe URL protocol: {url}")

    # Allow relative paths starting with /
    if url.startswith('/'):
        # Validate it's a reasonable path (no dangerous characters)
        if re.match(r'^/[\w./-]*$', url):
            return url
        raise ValidationError(f"Invalid relative path: {url}")

    # Basic URL validation for absolute URLs
    url_pattern = re.compile(
        r'^(https?://)?'  # http:// or https://
        r'([a-zA-Z0-9.-]+)'  # domain
        r'(:\d+)?'  # optional port
        r'(/.*)?$'  # path
    )

    if not url_pattern.match(url):
        raise ValidationError(f"Invalid URL format: {url}")

    return url


def validate_email(email: str) -> str:
    """
    Validate email format.

    Args:
        email: The email to validate

    Returns:
        The validated email

    Raises:
        ValidationError: If email is invalid
    """
    if not email:
        raise ValidationError("Email cannot be empty")

    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

    if not email_pattern.match(email):
        raise ValidationError(f"Invalid email format: {email}")

    return email


def validate_date(date_str: str) -> str:
    """
    Validate date format (YYYY-MM-DD).

    Args:
        date_str: The date string to validate

    Returns:
        The validated date string

    Raises:
        ValidationError: If date format is invalid
    """
    if not date_str:
        return date_str

    date_pattern = re.compile(r'^\d{4}-\d{2}-\d{2}$')

    if not date_pattern.match(date_str):
        raise ValidationError(f"Invalid date format (expected YYYY-MM-DD): {date_str}")

    return date_str

"""Custom exceptions for FastMCP CMS Server."""


class CMSError(Exception):
    """Base exception for CMS-related errors."""
    pass


class AuthenticationError(CMSError):
    """Raised when authentication fails."""
    pass


class AuthorizationError(CMSError):
    """Raised when user lacks permission for an operation."""
    pass


class ValidationError(CMSError):
    """Raised when input validation fails."""
    pass


class ResourceNotFoundError(CMSError):
    """Raised when a requested resource is not found."""
    pass


class RateLimitError(CMSError):
    """Raised when rate limit is exceeded."""
    pass


class CMSConnectionError(CMSError):
    """Raised when CMS connection fails."""
    pass


class CMSTimeoutError(CMSError):
    """Raised when CMS request times out."""
    pass

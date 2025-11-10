"""Configuration management for FastMCP CMS Server."""

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Application configuration from environment variables."""

    # CMS Configuration
    CMS_API_URL: str = os.getenv("CMS_API_URL", "http://localhost:3001/api")
    CMS_ADMIN_EMAIL: str = os.getenv("CMS_ADMIN_EMAIL", "")
    CMS_ADMIN_PASSWORD: str = os.getenv("CMS_ADMIN_PASSWORD", "")

    # Server Configuration
    MCP_SERVER_NAME: str = os.getenv("MCP_SERVER_NAME", "CMS Publisher")
    MCP_SERVER_VERSION: str = os.getenv("MCP_SERVER_VERSION", "1.0.0")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    AUDIT_LOG_PATH: str = os.getenv("AUDIT_LOG_PATH", "./logs/audit.log")

    # HTTP Server Configuration
    MCP_HOST: str = os.getenv("MCP_HOST", "0.0.0.0")
    MCP_PORT: int = int(os.getenv("MCP_PORT", "8000"))

    # Performance Configuration
    TOKEN_CACHE_TTL: int = int(os.getenv("TOKEN_CACHE_TTL", "900"))
    REQUEST_TIMEOUT: int = int(os.getenv("REQUEST_TIMEOUT", "30"))
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
    RETRY_BACKOFF: int = int(os.getenv("RETRY_BACKOFF", "2"))

    # Security Configuration
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))
    REQUIRE_APPROVAL_FOR_PUBLISH: bool = os.getenv("REQUIRE_APPROVAL_FOR_PUBLISH", "false").lower() == "true"
    REQUIRE_APPROVAL_FOR_DELETE: bool = os.getenv("REQUIRE_APPROVAL_FOR_DELETE", "true").lower() == "true"

    # Features
    ENABLE_CACHING: bool = os.getenv("ENABLE_CACHING", "true").lower() == "true"
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "300"))
    ENABLE_AUDIT_LOG: bool = os.getenv("ENABLE_AUDIT_LOG", "true").lower() == "true"
    ENABLE_DRAFT_MODE: bool = os.getenv("ENABLE_DRAFT_MODE", "true").lower() == "true"

    @classmethod
    def validate(cls) -> None:
        """Validate required configuration."""
        if not cls.CMS_ADMIN_EMAIL:
            raise ValueError("CMS_ADMIN_EMAIL is required")
        if not cls.CMS_ADMIN_PASSWORD:
            raise ValueError("CMS_ADMIN_PASSWORD is required")
        if not cls.CMS_API_URL:
            raise ValueError("CMS_API_URL is required")

    @classmethod
    def ensure_log_directory(cls) -> None:
        """Ensure log directory exists."""
        if cls.ENABLE_AUDIT_LOG:
            log_path = Path(cls.AUDIT_LOG_PATH)
            log_path.parent.mkdir(parents=True, exist_ok=True)


# Validate configuration on import
Config.validate()
Config.ensure_log_directory()

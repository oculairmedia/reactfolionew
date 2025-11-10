"""Authentication service for Payload CMS."""

import time
from typing import Optional
import httpx
from config import Config
from utils.logging import get_logger
from utils.errors import AuthenticationError, CMSConnectionError

logger = get_logger(__name__)


class AuthService:
    """Handle authentication with Payload CMS."""

    def __init__(self, email: str, password: str, base_url: str):
        """
        Initialize authentication service.

        Args:
            email: Admin email
            password: Admin password
            base_url: CMS API base URL
        """
        self.email = email
        self.password = password
        self.base_url = base_url
        self._token: Optional[str] = None
        self._token_expires_at: Optional[float] = None
        self._user_info: Optional[dict] = None

    @property
    def is_authenticated(self) -> bool:
        """Check if currently authenticated with valid token."""
        if not self._token or not self._token_expires_at:
            return False
        return time.time() < self._token_expires_at

    @property
    def token(self) -> Optional[str]:
        """Get current authentication token."""
        return self._token if self.is_authenticated else None

    @property
    def user_info(self) -> Optional[dict]:
        """Get authenticated user information."""
        return self._user_info if self.is_authenticated else None

    async def authenticate(self, force: bool = False) -> str:
        """
        Authenticate with CMS and get JWT token.

        Args:
            force: Force re-authentication even if token is valid

        Returns:
            JWT token

        Raises:
            AuthenticationError: If authentication fails
            CMSConnectionError: If connection to CMS fails
        """
        if not force and self.is_authenticated:
            logger.debug("Using cached authentication token")
            return self._token

        logger.info("Authenticating with CMS", email=self.email)

        try:
            async with httpx.AsyncClient(timeout=Config.REQUEST_TIMEOUT) as client:
                response = await client.post(
                    f"{self.base_url}/users/login",
                    json={"email": self.email, "password": self.password},
                )

                if response.status_code == 401:
                    logger.error("Authentication failed - invalid credentials")
                    raise AuthenticationError("Invalid email or password")

                if response.status_code != 200:
                    logger.error(
                        "Authentication failed",
                        status_code=response.status_code,
                        response=response.text,
                    )
                    raise AuthenticationError(
                        f"Authentication failed with status {response.status_code}"
                    )

                data = response.json()
                self._token = data.get("token")
                self._user_info = data.get("user")

                if not self._token:
                    raise AuthenticationError("No token received from CMS")

                # Set token expiration (default to cache TTL from config)
                self._token_expires_at = time.time() + Config.TOKEN_CACHE_TTL

                logger.info(
                    "Authentication successful",
                    user_id=self._user_info.get("id") if self._user_info else None,
                    expires_in=Config.TOKEN_CACHE_TTL,
                )

                return self._token

        except httpx.RequestError as e:
            logger.error("Connection error during authentication", error=str(e))
            raise CMSConnectionError(f"Failed to connect to CMS: {e}")

    async def refresh_if_needed(self) -> str:
        """
        Refresh token if it's close to expiration.

        Returns:
            JWT token (current or refreshed)
        """
        if not self._token_expires_at:
            return await self.authenticate()

        # Refresh if less than 2 minutes remaining
        time_remaining = self._token_expires_at - time.time()
        if time_remaining < 120:
            logger.info("Token expiring soon, refreshing", time_remaining=time_remaining)
            return await self.authenticate(force=True)

        return self._token

    def invalidate(self) -> None:
        """Invalidate current authentication token."""
        logger.info("Invalidating authentication token")
        self._token = None
        self._token_expires_at = None
        self._user_info = None

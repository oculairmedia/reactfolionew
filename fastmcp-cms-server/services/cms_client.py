"""Main CMS client service for interacting with Payload CMS."""

import asyncio
from typing import Any, Dict, List, Optional
import httpx
from config import Config
from services.auth import AuthService
from services.cache import CacheService
from services.audit import AuditService
from utils.logging import get_logger
from utils.errors import (
    CMSConnectionError,
    CMSTimeoutError,
    ResourceNotFoundError,
    AuthenticationError,
)

logger = get_logger(__name__)


class CMSClient:
    """Client for interacting with Payload CMS API."""

    def __init__(
        self,
        base_url: str = Config.CMS_API_URL,
        email: str = Config.CMS_ADMIN_EMAIL,
        password: str = Config.CMS_ADMIN_PASSWORD,
    ):
        """
        Initialize CMS client.

        Args:
            base_url: CMS API base URL
            email: Admin email
            password: Admin password
        """
        self.base_url = base_url.rstrip("/")
        self.auth = AuthService(email, password, self.base_url)
        self.cache = CacheService()
        self.audit = AuditService()
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        """Async context manager entry."""
        self._client = httpx.AsyncClient(timeout=Config.REQUEST_TIMEOUT)
        await self.auth.authenticate()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self._client:
            await self._client.aclose()

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if not self._client:
            self._client = httpx.AsyncClient(timeout=Config.REQUEST_TIMEOUT)
        return self._client

    async def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authentication token."""
        token = await self.auth.refresh_if_needed()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        retry_count: int = 0,
    ) -> Dict[str, Any]:
        """
        Make HTTP request to CMS with retry logic.

        Args:
            method: HTTP method
            endpoint: API endpoint
            data: Request body data
            params: Query parameters
            retry_count: Current retry attempt

        Returns:
            Response data

        Raises:
            CMSConnectionError: If connection fails
            CMSTimeoutError: If request times out
            ResourceNotFoundError: If resource not found
            AuthenticationError: If authentication fails
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        client = await self._get_client()
        headers = await self._get_headers()

        try:
            logger.debug(
                "CMS request",
                method=method,
                endpoint=endpoint,
                params=params,
            )

            response = await client.request(
                method=method,
                url=url,
                json=data,
                params=params,
                headers=headers,
            )

            # Handle authentication errors
            if response.status_code == 401:
                if retry_count < 1:
                    logger.warning("Authentication failed, refreshing token")
                    await self.auth.authenticate(force=True)
                    return await self._request(method, endpoint, data, params, retry_count + 1)
                raise AuthenticationError("Authentication failed")

            # Handle not found
            if response.status_code == 404:
                raise ResourceNotFoundError(f"Resource not found: {endpoint}")

            # Handle other errors
            if response.status_code >= 400:
                error_msg = f"CMS request failed with status {response.status_code}"
                logger.error(
                    error_msg,
                    method=method,
                    endpoint=endpoint,
                    status_code=response.status_code,
                    response=response.text[:500],
                )
                raise CMSConnectionError(error_msg)

            return response.json()

        except httpx.TimeoutException as e:
            logger.error("Request timeout", endpoint=endpoint, error=str(e))
            if retry_count < Config.MAX_RETRIES:
                wait_time = Config.RETRY_BACKOFF ** retry_count
                logger.info(f"Retrying in {wait_time}s", retry_count=retry_count + 1)
                await asyncio.sleep(wait_time)
                return await self._request(method, endpoint, data, params, retry_count + 1)
            raise CMSTimeoutError(f"Request timeout after {Config.MAX_RETRIES} retries")

        except httpx.RequestError as e:
            logger.error("Connection error", endpoint=endpoint, error=str(e))
            if retry_count < Config.MAX_RETRIES:
                wait_time = Config.RETRY_BACKOFF ** retry_count
                logger.info(f"Retrying in {wait_time}s", retry_count=retry_count + 1)
                await asyncio.sleep(wait_time)
                return await self._request(method, endpoint, data, params, retry_count + 1)
            raise CMSConnectionError(f"Connection failed after {Config.MAX_RETRIES} retries: {e}")

    async def get_collection(
        self,
        collection: str,
        filters: Optional[Dict] = None,
        limit: int = 100,
        page: int = 1,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Get collection documents with pagination and filtering.

        Args:
            collection: Collection name
            filters: Filter criteria (where clauses)
            limit: Results per page
            page: Page number (1-indexed)
            use_cache: Whether to use cache

        Returns:
            Collection response with docs, pagination, etc.
        """
        params = {"limit": limit, "page": page}

        # Add filters
        if filters:
            for key, value in filters.items():
                params[key] = value

        # Check cache
        cache_key = f"collection:{collection}:{str(params)}"
        if use_cache:
            cached = self.cache.get(cache_key)
            if cached:
                return cached

        # Make request
        response = await self._request("GET", f"/{collection}", params=params)

        # Cache result
        if use_cache:
            self.cache.set(cache_key, response)

        return response

    async def get_document(
        self,
        collection: str,
        doc_id: str,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Get a specific document by ID.

        Args:
            collection: Collection name
            doc_id: Document ID
            use_cache: Whether to use cache

        Returns:
            Document data
        """
        # Check cache
        cache_key = f"doc:{collection}:{doc_id}"
        if use_cache:
            cached = self.cache.get(cache_key)
            if cached:
                return cached

        # Make request using where filter
        response = await self._request(
            "GET",
            f"/{collection}",
            params={"where[id][equals]": doc_id, "limit": 1},
        )

        if not response.get("docs"):
            raise ResourceNotFoundError(f"Document not found: {collection}/{doc_id}")

        doc = response["docs"][0]

        # Cache result
        if use_cache:
            self.cache.set(cache_key, doc)

        return doc

    async def create_document(
        self,
        collection: str,
        data: Dict[str, Any],
        draft: bool = True,
    ) -> Dict[str, Any]:
        """
        Create a new document in a collection.

        Args:
            collection: Collection name
            data: Document data
            draft: Create as draft (if draft mode enabled)

        Returns:
            Created document
        """
        # Add draft status if enabled
        if Config.ENABLE_DRAFT_MODE and draft:
            data["_status"] = "draft"

        response = await self._request("POST", f"/{collection}", data=data)

        # Invalidate cache
        self.cache.invalidate_pattern(f"collection:{collection}")

        # Audit log
        doc_id = response.get("id") or response.get("doc", {}).get("id")
        self.audit.log_create(
            resource_type=collection,
            resource_id=doc_id,
            data=data,
            metadata={"draft": draft},
        )

        logger.info(
            "Document created",
            collection=collection,
            doc_id=doc_id,
            draft=draft,
        )

        return response.get("doc", response)

    async def update_document(
        self,
        collection: str,
        doc_id: str,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Update an existing document.

        Args:
            collection: Collection name
            doc_id: Document ID
            data: Updated data

        Returns:
            Updated document
        """
        # Get current document for audit log
        try:
            before = await self.get_document(collection, doc_id, use_cache=False)
        except ResourceNotFoundError:
            before = None

        # Update via PATCH to the specific document
        # Payload expects PATCH to /collection/id
        response = await self._request("PATCH", f"/{collection}/{doc_id}", data=data)

        # Invalidate cache
        self.cache.delete(f"doc:{collection}:{doc_id}")
        self.cache.invalidate_pattern(f"collection:{collection}")

        # Audit log
        self.audit.log_update(
            resource_type=collection,
            resource_id=doc_id,
            before=before,
            after=data,
        )

        logger.info("Document updated", collection=collection, doc_id=doc_id)

        return response.get("doc", response)

    async def delete_document(
        self,
        collection: str,
        doc_id: str,
    ) -> bool:
        """
        Delete a document.

        Args:
            collection: Collection name
            doc_id: Document ID

        Returns:
            True if deleted successfully
        """
        # Get current document for audit log
        try:
            doc_data = await self.get_document(collection, doc_id, use_cache=False)
        except ResourceNotFoundError:
            doc_data = None

        await self._request("DELETE", f"/{collection}/{doc_id}")

        # Invalidate cache
        self.cache.delete(f"doc:{collection}:{doc_id}")
        self.cache.invalidate_pattern(f"collection:{collection}")

        # Audit log
        self.audit.log_delete(
            resource_type=collection,
            resource_id=doc_id,
            data=doc_data,
        )

        logger.info("Document deleted", collection=collection, doc_id=doc_id)

        return True

    async def get_global(
        self,
        global_slug: str,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Get a global singleton.

        Args:
            global_slug: Global slug (e.g., "site-settings")
            use_cache: Whether to use cache

        Returns:
            Global data
        """
        # Check cache
        cache_key = f"global:{global_slug}"
        if use_cache:
            cached = self.cache.get(cache_key)
            if cached:
                return cached

        response = await self._request("GET", f"/globals/{global_slug}")

        # Cache result
        if use_cache:
            self.cache.set(cache_key, response)

        return response

    async def update_global(
        self,
        global_slug: str,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Update a global singleton.

        Args:
            global_slug: Global slug
            data: Updated data

        Returns:
            Updated global data
        """
        # Get current global for audit log
        try:
            before = await self.get_global(global_slug, use_cache=False)
        except Exception:
            before = None

        response = await self._request("POST", f"/globals/{global_slug}", data=data)

        # Invalidate cache
        self.cache.delete(f"global:{global_slug}")

        # Audit log
        self.audit.log_update(
            resource_type="global",
            resource_id=global_slug,
            before=before,
            after=data,
        )

        logger.info("Global updated", global_slug=global_slug)

        return response

    async def check_health(self) -> Dict[str, Any]:
        """
        Check CMS health status.

        Returns:
            Health status information
        """
        try:
            response = await self._request("GET", "/health")
            return {
                "cms_connected": True,
                "cms_status": response.get("status", "ok"),
                **response,
            }
        except Exception as e:
            logger.error("Health check failed", error=str(e))
            return {
                "cms_connected": False,
                "error": str(e),
            }

    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

"""Enhanced CMS client with all reliability and performance improvements."""

import asyncio
import os
from typing import Any, Dict, Optional
from config import Config
from services.auth import AuthService
from services.audit import AuditService
from core.circuit_breaker import CircuitBreaker
from core.smart_cache import SmartCache
from core.connection_pool import get_global_pool, ConnectionPool
from core.deduplication import RequestDeduplicator
from utils.logging import get_logger
from utils.errors import (
    CMSConnectionError,
    CMSTimeoutError,
    ResourceNotFoundError,
    AuthenticationError,
)

logger = get_logger(__name__)


class EnhancedCMSClient:
    """
    Enhanced CMS client with reliability and performance features.

    Features:
    - Circuit breaker for fault tolerance
    - Smart caching with warming
    - Connection pooling with HTTP/2
    - Request deduplication
    - Comprehensive error handling

    Example:
        async with EnhancedCMSClient() as client:
            result = await client.get_document("projects", "proj-1")
    """

    def __init__(
        self,
        base_url: str = Config.CMS_API_URL,
        email: str = Config.CMS_ADMIN_EMAIL,
        password: str = Config.CMS_ADMIN_PASSWORD,
    ):
        """
        Initialize enhanced CMS client.

        Args:
            base_url: CMS API base URL
            email: Admin email
            password: Admin password
        """
        self.base_url = base_url.rstrip("/")
        self.auth = AuthService(email, password, self.base_url)
        self.audit = AuditService()

        # Enhanced features
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=5,
            recovery_timeout=60,
            success_threshold=2,
        )
        self.cache = SmartCache(default_ttl=Config.CACHE_TTL)
        self.deduplicator = RequestDeduplicator()

        self._connection_pool: Optional[ConnectionPool] = None

    async def __aenter__(self):
        """Async context manager entry."""
        # Get global connection pool
        self._connection_pool = await get_global_pool()
        await self.auth.authenticate()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        # Don't close global pool
        pass

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
        Make HTTP request with circuit breaker protection.

        Args:
            method: HTTP method
            endpoint: API endpoint
            data: Request body data
            params: Query parameters
            retry_count: Current retry attempt

        Returns:
            Response data
        """
        # Wrap request in circuit breaker
        return await self.circuit_breaker.call(
            self._do_request,
            method,
            endpoint,
            data,
            params,
            retry_count,
        )

    async def _do_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        retry_count: int = 0,
    ) -> Dict[str, Any]:
        """
        Execute HTTP request.

        Args:
            method: HTTP method
            endpoint: API endpoint
            data: Request body data
            params: Query parameters
            retry_count: Current retry attempt

        Returns:
            Response data
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = await self._get_headers()

        if self._connection_pool is None:
            self._connection_pool = await get_global_pool()

        try:
            logger.debug(
                "CMS request",
                method=method,
                endpoint=endpoint,
                params=params,
            )

            # Use connection pool
            assert self._connection_pool is not None
            response = await self._connection_pool.request(
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

        except Exception as e:
            if not isinstance(e, (CMSConnectionError, CMSTimeoutError, ResourceNotFoundError, AuthenticationError)):
                logger.error("Request error", endpoint=endpoint, error=str(e))
                raise CMSConnectionError(f"Request failed: {e}")
            raise

    async def get_collection(
        self,
        collection: str,
        filters: Optional[Dict] = None,
        limit: int = 100,
        page: int = 1,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Get collection documents with caching and deduplication.

        Args:
            collection: Collection name
            filters: Filter criteria
            limit: Results per page
            page: Page number
            use_cache: Whether to use cache

        Returns:
            Collection response
        """
        params = {"limit": limit, "page": page}

        # Add filters
        if filters:
            for key, value in filters.items():
                params[key] = value

        # Check cache
        cache_key = f"collection:{collection}:{str(params)}"
        if use_cache and Config.ENABLE_CACHING:
            cached = self.cache.get(cache_key)
            if cached:
                return cached

        # Execute with deduplication
        async def _fetch():
            response = await self._request("GET", f"/{collection}", params=params)
            if use_cache and Config.ENABLE_CACHING:
                self.cache.set(cache_key, response)
            return response

        return await self.deduplicator.execute(
            f"get_collection:{collection}",
            _fetch,
        )

    async def get_document(
        self,
        collection: str,
        doc_id: str,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Get document with caching and deduplication.

        Args:
            collection: Collection name
            doc_id: Document ID
            use_cache: Whether to use cache

        Returns:
            Document data
        """
        # Check cache
        cache_key = f"doc:{collection}:{doc_id}"
        if use_cache and Config.ENABLE_CACHING:
            cached = self.cache.get(cache_key)
            if cached:
                return cached

        # Execute with deduplication
        async def _fetch():
            response = await self._request(
                "GET",
                f"/{collection}",
                params={"where[id][equals]": doc_id, "limit": 1},
            )

            if not response.get("docs"):
                raise ResourceNotFoundError(f"Document not found: {collection}/{doc_id}")

            doc = response["docs"][0]

            if use_cache and Config.ENABLE_CACHING:
                self.cache.set(cache_key, doc)

            return doc

        return await self.deduplicator.execute(
            f"get_document:{collection}:{doc_id}",
            _fetch,
        )

    async def create_document(
        self,
        collection: str,
        data: Dict[str, Any],
        draft: bool = True,
    ) -> Dict[str, Any]:
        """
        Create document with cache invalidation.

        Args:
            collection: Collection name
            data: Document data
            draft: Create as draft

        Returns:
            Created document
        """
        # Add draft status if enabled
        if Config.ENABLE_DRAFT_MODE and draft:
            data["_status"] = "draft"

        response = await self._request("POST", f"/{collection}", data=data)

        # Invalidate cache
        if Config.ENABLE_CACHING:
            self.cache.invalidate_smart("create", collection)

        # Audit log
        doc_id = response.get("id") or response.get("doc", {}).get("id")
        if Config.ENABLE_AUDIT_LOG:
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
        Update document with cache invalidation.

        Args:
            collection: Collection name
            doc_id: Document ID
            data: Updated data

        Returns:
            Updated document
        """
        # Get current document for audit log
        before = None
        if Config.ENABLE_AUDIT_LOG:
            try:
                before = await self.get_document(collection, doc_id, use_cache=False)
            except ResourceNotFoundError:
                pass

        # Update document
        response = await self._request("PATCH", f"/{collection}/{doc_id}", data=data)

        # Invalidate cache
        if Config.ENABLE_CACHING:
            self.cache.delete(f"doc:{collection}:{doc_id}")
            self.cache.invalidate_smart("update", collection)

        # Audit log
        if Config.ENABLE_AUDIT_LOG:
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
        Delete document with cache invalidation.

        Args:
            collection: Collection name
            doc_id: Document ID

        Returns:
            True if deleted successfully
        """
        # Get current document for audit log
        doc_data = None
        if Config.ENABLE_AUDIT_LOG:
            try:
                doc_data = await self.get_document(collection, doc_id, use_cache=False)
            except ResourceNotFoundError:
                pass

        await self._request("DELETE", f"/{collection}/{doc_id}")

        # Invalidate cache
        if Config.ENABLE_CACHING:
            self.cache.delete(f"doc:{collection}:{doc_id}")
            self.cache.invalidate_smart("delete", collection)

        # Audit log
        if Config.ENABLE_AUDIT_LOG:
            self.audit.log_delete(
                resource_type=collection,
                resource_id=doc_id,
                data=doc_data,
            )

        logger.info("Document deleted", collection=collection, doc_id=doc_id)

        return True

    async def upload_media_file_path(
        self,
        local_path: str,
        filename: Optional[str] = None,
        mime_type: Optional[str] = None,
        fields: Optional[Dict[str, Any]] = None,
        retry_count: int = 0,
    ) -> Dict[str, Any]:
        """Upload a media file via multipart/form-data to the media collection."""
        if not os.path.exists(local_path):
            raise ResourceNotFoundError(f"File not found: {local_path}")

        upload_filename = filename or os.path.basename(local_path)

        async def _upload() -> Dict[str, Any]:
            token = await self.auth.refresh_if_needed()
            headers = {
                "Authorization": f"Bearer {token}",
            }

            form_fields: Dict[str, str] = {}
            if fields:
                for key, value in fields.items():
                    if value is None:
                        continue
                    form_fields[key] = str(value)

            url = f"{self.base_url}/media"

            logger.debug(
                "CMS media upload request",
                endpoint="/media",
                filename=upload_filename,
                mime_type=mime_type,
            )

            if self._connection_pool is None:
                self._connection_pool = await get_global_pool()

            with open(local_path, "rb") as file_handle:
                assert self._connection_pool is not None
                response = await self._connection_pool.request(
                    method="POST",
                    url=url,
                    headers=headers,
                    data=form_fields,
                    files={
                        "file": (
                            upload_filename,
                            file_handle,
                            mime_type or "application/octet-stream",
                        )
                    },
                )

            if response.status_code == 401:
                if retry_count < 1:
                    logger.warning("Authentication failed during upload, refreshing token")
                    await self.auth.authenticate(force=True)
                    return await self.upload_media_file_path(
                        local_path=local_path,
                        filename=filename,
                        mime_type=mime_type,
                        fields=fields,
                        retry_count=retry_count + 1,
                    )
                raise AuthenticationError("Authentication failed")

            if response.status_code >= 400:
                error_msg = f"CMS media upload failed with status {response.status_code}"
                logger.error(
                    error_msg,
                    endpoint="/media",
                    status_code=response.status_code,
                    response=response.text[:500],
                )
                raise CMSConnectionError(error_msg)

            result = response.json()

            if Config.ENABLE_CACHING:
                self.cache.invalidate_smart("create", "media")

            media_id = result.get("id") or result.get("doc", {}).get("id")
            if Config.ENABLE_AUDIT_LOG:
                self.audit.log_create(
                    resource_type="media",
                    resource_id=media_id,
                    data={
                        **(fields or {}),
                        "filename": upload_filename,
                        "mime_type": mime_type,
                    },
                    metadata={"local_path": local_path},
                )

            logger.info("Media uploaded", media_id=media_id, filename=upload_filename)

            return result.get("doc", result)

        try:
            return await self.circuit_breaker.call(_upload)
        except Exception as e:
            if not isinstance(e, (CMSConnectionError, CMSTimeoutError, ResourceNotFoundError, AuthenticationError)):
                logger.error("Upload error", error=str(e), filename=upload_filename)
                raise CMSConnectionError(f"Upload failed: {e}")
            raise

    async def get_global(
        self,
        global_slug: str,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Get global singleton with caching.

        Args:
            global_slug: Global slug
            use_cache: Whether to use cache

        Returns:
            Global data
        """
        # Check cache
        cache_key = f"global:{global_slug}"
        if use_cache and Config.ENABLE_CACHING:
            cached = self.cache.get(cache_key)
            if cached:
                return cached

        response = await self._request("GET", f"/globals/{global_slug}")

        # Cache result
        if use_cache and Config.ENABLE_CACHING:
            self.cache.set(cache_key, response)

        return response

    async def update_global(
        self,
        global_slug: str,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Update global singleton with cache invalidation.

        Args:
            global_slug: Global slug
            data: Updated data

        Returns:
            Updated global data
        """
        # Get current global for audit log
        before = None
        if Config.ENABLE_AUDIT_LOG:
            try:
                before = await self.get_global(global_slug, use_cache=False)
            except Exception:
                pass

        response = await self._request("POST", f"/globals/{global_slug}", data=data)

        # Invalidate cache
        if Config.ENABLE_CACHING:
            self.cache.delete(f"global:{global_slug}")

        # Audit log
        if Config.ENABLE_AUDIT_LOG:
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

    def get_metrics(self) -> dict:
        """
        Get client metrics.

        Returns:
            Metrics dictionary
        """
        return {
            "cache": self.cache.get_stats(),
            "circuit_breaker": self.circuit_breaker.get_state(),
            "request_deduplication": self.deduplicator.get_stats(),
            "connection_pool": (
                self._connection_pool.get_stats()
                if self._connection_pool else {}
            ),
        }

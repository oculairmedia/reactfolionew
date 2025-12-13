"""Consolidated media operations tool.

Supports:
- upload: upload file to Payload media collection (multipart/form-data)
- register: register a CDN URL as a media document (no upload)
- get: retrieve a single media document by ID
- list: list/search media documents with filters

Sources for upload:
- url | local_path | base64
"""

from __future__ import annotations

import base64
import json
import mimetypes
import os
import tempfile
from typing import Literal, Optional, Any, Union

import httpx

from services.cms_client_enhanced import EnhancedCMSClient
from core.registry import OperationRegistry
from core.middleware import create_default_middleware_stack
from core.retry import execute_with_retry
from schemas.operation_schemas import OPERATION_SCHEMAS
from utils.logging import get_logger
from utils.errors import ValidationError

logger = get_logger(__name__)


# ============================================================================
# TEMP FILE HELPERS
# ============================================================================


def _new_temp_filepath(filename_hint: Optional[str] = None) -> str:
    suffix = ""
    if filename_hint:
        _, ext = os.path.splitext(filename_hint)
        suffix = ext

    fd, path = tempfile.mkstemp(prefix="cms_media_", suffix=suffix)
    os.close(fd)
    return path


def _parse_data_url_or_base64(value: str) -> tuple[bytes, Optional[str]]:
    """Return (bytes, mime_type)."""
    if value.startswith("data:"):
        # data:<mime>;base64,<data>
        header, encoded = value.split(",", 1)
        mime = header[5:]
        if ";" in mime:
            mime = mime.split(";", 1)[0]
        return base64.b64decode(encoded), mime or None

    return base64.b64decode(value), None


def _truncate(text: str, limit: int = 500) -> str:
    return text if len(text) <= limit else text[:limit]


# ============================================================================
# OPERATION HANDLERS
# ============================================================================


async def media_upload_handler(
    source: Literal["url", "local_path", "base64"],
    alt: str,
    caption: Optional[str] = None,
    credit: Optional[str] = None,
    media_type: Optional[str] = None,
    url: Optional[str] = None,
    local_path: Optional[str] = None,
    file_base64: Optional[str] = None,
    filename: Optional[str] = None,
    mime_type: Optional[str] = None,
    dry_run: bool = False,
    **kwargs,
) -> dict:
    if not alt:
        raise ValidationError("alt is required for media uploads")

    source_url: Optional[str] = None
    source_path: Optional[str] = None
    source_base64: Optional[str] = None

    if source == "url":
        if not url:
            raise ValidationError("url is required when source='url'")
        source_url = url
    elif source == "local_path":
        if not local_path:
            raise ValidationError("local_path is required when source='local_path'")
        source_path = local_path
    elif source == "base64":
        if not file_base64:
            raise ValidationError("file_base64 is required when source='base64'")
        source_base64 = file_base64
    else:
        raise ValidationError(f"Unknown upload source: {source}")

    fields: dict[str, Any] = {
        "alt": alt,
        "caption": caption,
        "credit": credit,
        "media_type": media_type,
    }

    if dry_run:
        return {
            "success": True,
            "operation": "upload",
            "message": "Dry run: media upload validated",
            "mediaId": None,
            "data": None,
            "meta": {
                "source": source,
                "filename": filename,
                "mime_type": mime_type,
                "usedTempFile": False,
            },
        }

    temp_path: Optional[str] = None
    used_temp = False

    try:
        upload_path = source_path
        inferred_filename = filename
        inferred_mime = mime_type

        if source == "url":
            assert source_url is not None

            used_temp = True
            inferred_filename = (
                inferred_filename
                or os.path.basename(source_url.split("?", 1)[0])
                or "download"
            )
            temp_path = _new_temp_filepath(inferred_filename)

            async with httpx.AsyncClient(follow_redirects=True, timeout=60) as client:
                async with client.stream("GET", source_url) as response:
                    response.raise_for_status()
                    content_type = response.headers.get("content-type")
                    if not inferred_mime and content_type:
                        inferred_mime = content_type.split(";", 1)[0].strip() or None

                    with open(temp_path, "wb") as out:
                        async for chunk in response.aiter_bytes():
                            out.write(chunk)

            upload_path = temp_path

        elif source == "base64":
            assert source_base64 is not None

            used_temp = True
            payload, decoded_mime = _parse_data_url_or_base64(source_base64)
            if not inferred_mime and decoded_mime:
                inferred_mime = decoded_mime

            inferred_filename = inferred_filename or "upload.bin"
            temp_path = _new_temp_filepath(inferred_filename)
            with open(temp_path, "wb") as out:
                out.write(payload)
            upload_path = temp_path

        else:
            # local_path
            assert source_path is not None

            if not os.path.exists(source_path):
                raise ValidationError(f"File not found: {source_path}")

            if not inferred_filename:
                inferred_filename = os.path.basename(source_path)

        if not inferred_mime and inferred_filename:
            guessed, _ = mimetypes.guess_type(inferred_filename)
            inferred_mime = guessed or None

        assert upload_path is not None

        async with EnhancedCMSClient() as cms:
            result = await cms.upload_media_file_path(
                local_path=upload_path,
                filename=inferred_filename,
                mime_type=inferred_mime,
                fields=fields,
            )

        media_id = result.get("id")

        return {
            "success": True,
            "operation": "upload",
            "message": "Media uploaded successfully",
            "mediaId": media_id,
            "data": result,
            "meta": {
                "source": source,
                "filename": inferred_filename,
                "mime_type": inferred_mime,
                "usedTempFile": used_temp,
            },
        }

    except httpx.HTTPError as e:
        return {
            "success": False,
            "operation": "upload",
            "error": type(e).__name__,
            "message": _truncate(str(e)),
        }

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                logger.warning("Failed to remove temp file", temp_path=temp_path)


async def media_register_handler(
    cdn_url: str,
    alt: str,
    caption: Optional[str] = None,
    credit: Optional[str] = None,
    media_type: Optional[str] = None,
    dry_run: bool = False,
    **kwargs,
) -> dict:
    if not cdn_url:
        raise ValidationError("cdn_url is required for register")
    if not alt:
        raise ValidationError("alt is required for register")

    if dry_run:
        return {
            "success": True,
            "operation": "register",
            "message": "Dry run: media register validated",
            "mediaId": None,
            "data": None,
            "meta": {"source": "cdn_url"},
        }

    data: dict[str, Any] = {
        "cdn_url": cdn_url,
        "alt": alt,
        "caption": caption,
        "credit": credit,
        "media_type": media_type,
    }

    async with EnhancedCMSClient() as cms:
        created = await cms.create_document(collection="media", data=data, draft=False)

    media_id = created.get("id")

    return {
        "success": True,
        "operation": "register",
        "message": "Media registered successfully",
        "mediaId": media_id,
        "data": created,
        "meta": {"source": "cdn_url"},
    }


async def media_get_handler(
    media_id: str,
    **kwargs,
) -> dict:
    """Get a single media document by ID."""
    if not media_id:
        raise ValidationError("media_id is required for get operation")

    async with EnhancedCMSClient() as cms:
        result = await cms.get_document(collection="media", doc_id=media_id)

    return {
        "success": True,
        "operation": "get",
        "message": "Media retrieved successfully",
        "mediaId": media_id,
        "data": result,
    }


async def media_list_handler(
    filters: Optional[Union[str, dict]] = None,
    limit: int = 50,
    page: int = 1,
    **kwargs,
) -> dict:
    """List media documents with optional filters.
    
    Args:
        filters: JSON string or dict of filters (e.g. {"where[source][equals]": "upload"})
        limit: Max documents per page (default 50)
        page: Page number (default 1)
    """
    # Parse filters if provided as JSON string
    parsed_filters: dict = {}
    if filters:
        if isinstance(filters, str):
            try:
                parsed_filters = json.loads(filters)
            except json.JSONDecodeError as e:
                raise ValidationError(f"Invalid filters JSON: {e}")
        else:
            parsed_filters = filters

    async with EnhancedCMSClient() as cms:
        result = await cms.get_collection(
            collection="media",
            filters=parsed_filters,
            limit=limit,
            page=page,
        )

    return {
        "success": True,
        "operation": "list",
        "message": f"Found {result.get('totalDocs', 0)} media documents",
        "documents": result.get("docs", []),
        "totalDocs": result.get("totalDocs", 0),
        "page": result.get("page", page),
        "totalPages": result.get("totalPages", 1),
        "limit": result.get("limit", limit),
    }


# ============================================================================
# OPERATION REGISTRY SETUP
# ============================================================================


def setup_media_registry() -> OperationRegistry:
    registry = OperationRegistry()

    registry.register(
        name="upload",
        handler=media_upload_handler,
        cost="high",
        side_effects=True,
        rate_limit=10,
        output_schema=OPERATION_SCHEMAS["media_upload"],
        description="Upload a media file (supports local_path/url/base64)",
        required_params=["source", "alt"],
    )

    registry.register(
        name="register",
        handler=media_register_handler,
        cost="medium",
        side_effects=True,
        rate_limit=20,
        output_schema=OPERATION_SCHEMAS["media_register"],
        description="Register a CDN URL as media (no upload)",
        required_params=["cdn_url", "alt"],
    )

    registry.register(
        name="get",
        handler=media_get_handler,
        cost="low",
        side_effects=False,
        rate_limit=100,
        output_schema=OPERATION_SCHEMAS.get("media_get"),
        description="Get a single media document by ID",
        required_params=["media_id"],
    )

    registry.register(
        name="list",
        handler=media_list_handler,
        cost="low",
        side_effects=False,
        rate_limit=50,
        output_schema=OPERATION_SCHEMAS.get("media_list"),
        description="List media documents with optional filters",
        required_params=[],
    )

    middleware_stack = create_default_middleware_stack()
    registry.set_middleware_stack(middleware_stack)

    logger.info(
        f"Media registry initialized with {len(registry.list_operations())} operations"
    )

    return registry


_media_registry: Optional[OperationRegistry] = None


def get_media_registry() -> OperationRegistry:
    global _media_registry
    if _media_registry is None:
        _media_registry = setup_media_registry()
    return _media_registry


# ============================================================================
# MAIN HANDLER
# ============================================================================


async def cms_media_ops_handler(
    operation: Literal["upload", "register", "get", "list"],
    **kwargs,
) -> dict:
    registry = get_media_registry()

    try:
        result = await execute_with_retry(
            operation,
            registry.execute,
            operation,
            **kwargs,
        )
        return result

    except ValidationError as e:
        return {
            "success": False,
            "operation": operation,
            "error": "Validation error",
            "message": str(e),
        }

    except Exception as e:
        logger.error(
            "Media operation failed",
            operation=operation,
            error=str(e),
        )
        return {
            "success": False,
            "operation": operation,
            "error": type(e).__name__,
            "message": str(e),
        }

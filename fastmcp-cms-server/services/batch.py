"""Batch operations for efficient multi-document processing."""

import asyncio
from typing import Any
from services.cms_client import CMSClient
from utils.logging import get_logger

logger = get_logger(__name__)


async def batch_create_documents(
    collection: str,
    items: list[dict],
    draft: bool = True,
    parallel: bool = True,
    client: CMSClient = None,
) -> dict:
    """
    Create multiple documents in a single operation.

    Args:
        collection: Target collection
        items: List of documents to create
        draft: Create as drafts
        parallel: Execute requests in parallel
        client: Optional CMSClient instance (creates new if None)

    Returns:
        Batch operation result with success/failure for each item

    Example:
        result = await batch_create_documents(
            collection="projects",
            items=[
                {"id": "proj-1", "title": "Project 1"},
                {"id": "proj-2", "title": "Project 2"},
            ],
            parallel=True
        )
    """
    results = []
    errors = []

    # Use provided client or create new one
    if client:
        should_close = False
        cms_client = client
    else:
        should_close = True
        cms_client = CMSClient()
        await cms_client.__aenter__()

    try:
        if parallel:
            # Execute all creates in parallel
            logger.info(
                f"Batch creating {len(items)} documents in parallel",
                collection=collection,
            )

            tasks = [
                cms_client.create_document(
                    collection=collection,
                    data=item,
                    draft=draft,
                )
                for item in items
            ]

            # Gather results with error handling
            responses = await asyncio.gather(
                *tasks,
                return_exceptions=True
            )

            for i, response in enumerate(responses):
                if isinstance(response, Exception):
                    errors.append({
                        "index": i,
                        "item": items[i],
                        "error": str(response),
                    })
                else:
                    results.append(response)

        else:
            # Execute sequentially (safer for order-dependent ops)
            logger.info(
                f"Batch creating {len(items)} documents sequentially",
                collection=collection,
            )

            for i, item in enumerate(items):
                try:
                    result = await cms_client.create_document(
                        collection=collection,
                        data=item,
                        draft=draft,
                    )
                    results.append(result)

                except Exception as e:
                    errors.append({
                        "index": i,
                        "item": item,
                        "error": str(e),
                    })

    finally:
        if should_close:
            await cms_client.__aexit__(None, None, None)

    logger.info(
        f"Batch create completed",
        collection=collection,
        total=len(items),
        successful=len(results),
        failed=len(errors),
    )

    return {
        "success": len(errors) == 0,
        "totalRequested": len(items),
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors,
    }


async def batch_update_documents(
    collection: str,
    items: list[dict],  # Each item: {"id": "...", "data": {...}}
    parallel: bool = True,
    client: CMSClient = None,
) -> dict:
    """
    Update multiple documents in a single operation.

    Args:
        collection: Target collection
        items: List of updates, each with "id" and "data" keys
        parallel: Execute requests in parallel
        client: Optional CMSClient instance

    Returns:
        Batch operation result

    Example:
        result = await batch_update_documents(
            collection="projects",
            items=[
                {"id": "proj-1", "data": {"title": "Updated Title"}},
                {"id": "proj-2", "data": {"title": "Another Update"}},
            ]
        )
    """
    results = []
    errors = []

    # Use provided client or create new one
    if client:
        should_close = False
        cms_client = client
    else:
        should_close = True
        cms_client = CMSClient()
        await cms_client.__aenter__()

    try:
        if parallel:
            logger.info(
                f"Batch updating {len(items)} documents in parallel",
                collection=collection,
            )

            tasks = [
                cms_client.update_document(
                    collection=collection,
                    doc_id=item["id"],
                    data=item["data"],
                )
                for item in items
            ]

            responses = await asyncio.gather(
                *tasks,
                return_exceptions=True
            )

            for i, response in enumerate(responses):
                if isinstance(response, Exception):
                    errors.append({
                        "index": i,
                        "item": items[i],
                        "error": str(response),
                    })
                else:
                    results.append(response)

        else:
            logger.info(
                f"Batch updating {len(items)} documents sequentially",
                collection=collection,
            )

            for i, item in enumerate(items):
                try:
                    result = await cms_client.update_document(
                        collection=collection,
                        doc_id=item["id"],
                        data=item["data"],
                    )
                    results.append(result)

                except Exception as e:
                    errors.append({
                        "index": i,
                        "item": item,
                        "error": str(e),
                    })

    finally:
        if should_close:
            await cms_client.__aexit__(None, None, None)

    logger.info(
        f"Batch update completed",
        collection=collection,
        total=len(items),
        successful=len(results),
        failed=len(errors),
    )

    return {
        "success": len(errors) == 0,
        "totalRequested": len(items),
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors,
    }


async def batch_delete_documents(
    collection: str,
    doc_ids: list[str],
    confirm: bool = False,
    parallel: bool = True,
    client: CMSClient = None,
) -> dict:
    """
    Delete multiple documents in a single operation.

    Args:
        collection: Target collection
        doc_ids: List of document IDs to delete
        confirm: Must be True to proceed
        parallel: Execute requests in parallel
        client: Optional CMSClient instance

    Returns:
        Batch operation result

    Example:
        result = await batch_delete_documents(
            collection="projects",
            doc_ids=["proj-1", "proj-2", "proj-3"],
            confirm=True
        )
    """
    if not confirm:
        return {
            "success": False,
            "requiresConfirmation": True,
            "message": "Batch deletion requires confirm=True",
            "totalRequested": len(doc_ids),
            "successful": 0,
            "failed": 0,
            "results": [],
            "errors": [],
        }

    results = []
    errors = []

    # Use provided client or create new one
    if client:
        should_close = False
        cms_client = client
    else:
        should_close = True
        cms_client = CMSClient()
        await cms_client.__aenter__()

    try:
        if parallel:
            logger.info(
                f"Batch deleting {len(doc_ids)} documents in parallel",
                collection=collection,
            )

            tasks = [
                cms_client.delete_document(
                    collection=collection,
                    doc_id=doc_id,
                )
                for doc_id in doc_ids
            ]

            responses = await asyncio.gather(
                *tasks,
                return_exceptions=True
            )

            for i, response in enumerate(responses):
                doc_id = doc_ids[i]
                if isinstance(response, Exception):
                    errors.append({
                        "index": i,
                        "doc_id": doc_id,
                        "error": str(response),
                    })
                else:
                    results.append({"doc_id": doc_id, "deleted": True})

        else:
            logger.info(
                f"Batch deleting {len(doc_ids)} documents sequentially",
                collection=collection,
            )

            for i, doc_id in enumerate(doc_ids):
                try:
                    await cms_client.delete_document(
                        collection=collection,
                        doc_id=doc_id,
                    )
                    results.append({"doc_id": doc_id, "deleted": True})

                except Exception as e:
                    errors.append({
                        "index": i,
                        "doc_id": doc_id,
                        "error": str(e),
                    })

    finally:
        if should_close:
            await cms_client.__aexit__(None, None, None)

    logger.info(
        f"Batch delete completed",
        collection=collection,
        total=len(doc_ids),
        successful=len(results),
        failed=len(errors),
    )

    return {
        "success": len(errors) == 0,
        "totalRequested": len(doc_ids),
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors,
    }

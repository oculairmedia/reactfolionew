"""Unit tests for batch operations."""

import pytest
from unittest.mock import AsyncMock, patch
from services.batch import (
    batch_create_documents,
    batch_update_documents,
    batch_delete_documents,
)


@pytest.mark.unit
@pytest.mark.async
class TestBatchCreate:
    """Tests for batch_create_documents."""

    @pytest.mark.asyncio
    async def test_batch_create_parallel_success(self, mock_cms_client, batch_items):
        """Test parallel batch create with all successes."""
        result = await batch_create_documents(
            collection="projects",
            items=batch_items,
            parallel=True,
            client=mock_cms_client,
        )

        assert result["success"] is True
        assert result["totalRequested"] == 5
        assert result["successful"] == 5
        assert result["failed"] == 0
        assert len(result["results"]) == 5
        assert len(result["errors"]) == 0

    @pytest.mark.asyncio
    async def test_batch_create_sequential_success(self, mock_cms_client, batch_items):
        """Test sequential batch create with all successes."""
        result = await batch_create_documents(
            collection="projects",
            items=batch_items,
            parallel=False,
            client=mock_cms_client,
        )

        assert result["success"] is True
        assert result["totalRequested"] == 5
        assert result["successful"] == 5
        assert result["failed"] == 0

    @pytest.mark.asyncio
    async def test_batch_create_with_some_failures(self, batch_items):
        """Test batch create with some items failing."""
        client = AsyncMock()

        async def create_with_failures(collection, data, draft):
            # Fail on items with even index
            if int(data["id"].split("-")[1]) % 2 == 0:
                raise ValueError(f"Failed to create {data['id']}")
            return {"id": data["id"], "title": data["title"]}

        client.create_document = AsyncMock(side_effect=create_with_failures)
        client.__aenter__ = AsyncMock(return_value=client)
        client.__aexit__ = AsyncMock(return_value=None)

        result = await batch_create_documents(
            collection="projects",
            items=batch_items,
            parallel=True,
            client=client,
        )

        assert result["success"] is False
        assert result["totalRequested"] == 5
        assert result["successful"] == 3  # items 1, 3, 5
        assert result["failed"] == 2  # items 2, 4
        assert len(result["errors"]) == 2

    @pytest.mark.asyncio
    async def test_batch_create_creates_client_if_not_provided(self, batch_items):
        """Test that batch_create creates client if not provided."""
        with patch('services.batch.CMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.create_document = AsyncMock(return_value={"id": "test"})
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await batch_create_documents(
                collection="projects",
                items=batch_items[:2],  # Just 2 items for speed
                parallel=True,
                client=None,  # Not provided
            )

            # Should have created client
            MockClient.assert_called_once()

    @pytest.mark.asyncio
    async def test_batch_create_draft_flag(self, mock_cms_client, batch_items):
        """Test that draft flag is passed correctly."""
        await batch_create_documents(
            collection="projects",
            items=batch_items[:2],
            draft=False,  # Published
            client=mock_cms_client,
        )

        # Check that create_document was called with draft=False
        calls = mock_cms_client.create_document.call_args_list
        for call in calls:
            assert call[1]["draft"] is False


@pytest.mark.unit
@pytest.mark.async
class TestBatchUpdate:
    """Tests for batch_update_documents."""

    @pytest.mark.asyncio
    async def test_batch_update_parallel_success(self, mock_cms_client):
        """Test parallel batch update with all successes."""
        items = [
            {"id": f"item-{i}", "data": {"title": f"Updated {i}"}}
            for i in range(1, 4)
        ]

        result = await batch_update_documents(
            collection="projects",
            items=items,
            parallel=True,
            client=mock_cms_client,
        )

        assert result["success"] is True
        assert result["totalRequested"] == 3
        assert result["successful"] == 3
        assert result["failed"] == 0

    @pytest.mark.asyncio
    async def test_batch_update_with_failures(self):
        """Test batch update with some failures."""
        client = AsyncMock()

        async def update_with_failures(collection, doc_id, data):
            if doc_id == "item-2":
                raise ValueError("Failed to update")
            return {"id": doc_id}

        client.update_document = AsyncMock(side_effect=update_with_failures)
        client.__aenter__ = AsyncMock(return_value=client)
        client.__aexit__ = AsyncMock(return_value=None)

        items = [
            {"id": "item-1", "data": {"title": "Update 1"}},
            {"id": "item-2", "data": {"title": "Update 2"}},  # Will fail
            {"id": "item-3", "data": {"title": "Update 3"}},
        ]

        result = await batch_update_documents(
            collection="projects",
            items=items,
            client=client,
        )

        assert result["success"] is False
        assert result["successful"] == 2
        assert result["failed"] == 1


@pytest.mark.unit
@pytest.mark.async
class TestBatchDelete:
    """Tests for batch_delete_documents."""

    @pytest.mark.asyncio
    async def test_batch_delete_requires_confirmation(self, mock_cms_client):
        """Test that batch delete requires confirmation."""
        doc_ids = ["item-1", "item-2", "item-3"]

        result = await batch_delete_documents(
            collection="projects",
            doc_ids=doc_ids,
            confirm=False,  # Not confirmed
            client=mock_cms_client,
        )

        assert result["success"] is False
        assert result["requiresConfirmation"] is True
        assert result["successful"] == 0

        # Client should not have been called
        mock_cms_client.delete_document.assert_not_called()

    @pytest.mark.asyncio
    async def test_batch_delete_with_confirmation(self, mock_cms_client):
        """Test batch delete with confirmation."""
        doc_ids = ["item-1", "item-2", "item-3"]

        result = await batch_delete_documents(
            collection="projects",
            doc_ids=doc_ids,
            confirm=True,  # Confirmed
            client=mock_cms_client,
        )

        assert result["success"] is True
        assert result["totalRequested"] == 3
        assert result["successful"] == 3
        assert result["failed"] == 0

    @pytest.mark.asyncio
    async def test_batch_delete_with_failures(self):
        """Test batch delete with some failures."""
        client = AsyncMock()

        async def delete_with_failures(collection, doc_id):
            if doc_id == "item-2":
                raise ValueError("Failed to delete")
            return True

        client.delete_document = AsyncMock(side_effect=delete_with_failures)
        client.__aenter__ = AsyncMock(return_value=client)
        client.__aexit__ = AsyncMock(return_value=None)

        doc_ids = ["item-1", "item-2", "item-3"]

        result = await batch_delete_documents(
            collection="projects",
            doc_ids=doc_ids,
            confirm=True,
            client=client,
        )

        assert result["success"] is False
        assert result["successful"] == 2
        assert result["failed"] == 1
        assert len(result["errors"]) == 1

    @pytest.mark.asyncio
    async def test_batch_delete_parallel_vs_sequential(self, mock_cms_client):
        """Test parallel vs sequential execution."""
        doc_ids = ["item-1", "item-2"]

        # Parallel
        result_parallel = await batch_delete_documents(
            collection="projects",
            doc_ids=doc_ids,
            confirm=True,
            parallel=True,
            client=mock_cms_client,
        )

        # Sequential
        result_sequential = await batch_delete_documents(
            collection="projects",
            doc_ids=doc_ids,
            confirm=True,
            parallel=False,
            client=mock_cms_client,
        )

        # Both should succeed
        assert result_parallel["success"] is True
        assert result_sequential["success"] is True

"""Integration tests for cms_collection_ops tool."""

import pytest
from unittest.mock import patch, AsyncMock
from tools.consolidated.collections import cms_collection_ops_handler


@pytest.mark.integration
class TestCollectionsToolIntegration:
    """Integration tests for collections tool."""

    @pytest.mark.asyncio
    async def test_create_operation(self, mock_project_data):
        """Test create operation end-to-end."""
        with patch('tools.consolidated.collections.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.create_document = AsyncMock(return_value={"id": "test-1"})
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_collection_ops_handler(
                operation="create",
                collection="projects",
                data=mock_project_data,
                draft=True,
            )

            assert result["success"] is True
            assert "documentId" in result
            assert result["status"] == "draft"

    @pytest.mark.asyncio
    async def test_get_operation(self):
        """Test get operation end-to-end."""
        with patch('tools.consolidated.collections.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.get_document = AsyncMock(return_value={
                "id": "test-1",
                "title": "Test Project",
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_collection_ops_handler(
                operation="get",
                collection="projects",
                doc_id="test-1",
            )

            assert result["success"] is True
            assert result["documentId"] == "test-1"
            assert result["data"]["title"] == "Test Project"

    @pytest.mark.asyncio
    async def test_list_operation(self):
        """Test list operation end-to-end."""
        with patch('tools.consolidated.collections.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.get_collection = AsyncMock(return_value={
                "docs": [{"id": "1"}, {"id": "2"}],
                "totalDocs": 2,
                "page": 1,
                "totalPages": 1,
                "limit": 100,
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_collection_ops_handler(
                operation="list",
                collection="projects",
                limit=50,
                page=1,
            )

            assert result["success"] is True
            assert len(result["documents"]) == 2
            assert result["totalDocs"] == 2

    @pytest.mark.asyncio
    async def test_update_operation(self):
        """Test update operation end-to-end."""
        with patch('tools.consolidated.collections.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.update_document = AsyncMock(return_value={
                "id": "test-1",
                "title": "Updated",
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_collection_ops_handler(
                operation="update",
                collection="projects",
                doc_id="test-1",
                data={"title": "Updated"},
            )

            assert result["success"] is True
            assert result["documentId"] == "test-1"

    @pytest.mark.asyncio
    async def test_delete_without_confirmation(self):
        """Test delete operation without confirmation fails."""
        result = await cms_collection_ops_handler(
            operation="delete",
            collection="projects",
            doc_id="test-1",
            confirm=False,
        )

        assert result["success"] is False
        assert result["requiresConfirmation"] is True

    @pytest.mark.asyncio
    async def test_delete_with_confirmation(self):
        """Test delete operation with confirmation."""
        with patch('tools.consolidated.collections.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.delete_document = AsyncMock(return_value=True)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            # Also need to patch Config
            with patch('tools.consolidated.collections.Config') as MockConfig:
                MockConfig.REQUIRE_APPROVAL_FOR_DELETE = False

                result = await cms_collection_ops_handler(
                    operation="delete",
                    collection="projects",
                    doc_id="test-1",
                    confirm=True,
                )

                assert result["success"] is True

    @pytest.mark.asyncio
    async def test_publish_operation(self):
        """Test publish operation."""
        with patch('tools.consolidated.collections.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.update_document = AsyncMock(return_value={
                "id": "test-1",
                "_status": "published",
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            with patch('tools.consolidated.collections.Config') as MockConfig:
                MockConfig.REQUIRE_APPROVAL_FOR_PUBLISH = False

                result = await cms_collection_ops_handler(
                    operation="publish",
                    collection="projects",
                    doc_id="test-1",
                )

                assert result["success"] is True
                assert result["status"] == "published"

    @pytest.mark.asyncio
    async def test_batch_create_operation(self, batch_items):
        """Test batch create operation."""
        with patch('tools.consolidated.collections.batch_create_documents') as mock_batch:
            mock_batch.return_value = {
                "success": True,
                "totalRequested": len(batch_items),
                "successful": len(batch_items),
                "failed": 0,
                "results": batch_items,
                "errors": [],
            }

            result = await cms_collection_ops_handler(
                operation="batch_create",
                collection="projects",
                items=batch_items,
                parallel=True,
            )

            assert result["success"] is True
            assert result["successful"] == len(batch_items)

    @pytest.mark.asyncio
    async def test_search_operation(self):
        """Test search operation."""
        with patch('tools.consolidated.collections.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.get_collection = AsyncMock(return_value={
                "docs": [{"id": "1", "title": "React Project"}],
                "totalDocs": 1,
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_collection_ops_handler(
                operation="search",
                collection="projects",
                query="react",
            )

            assert result["success"] is True
            assert result["query"] == "react"
            assert len(result["results"]) == 1

    @pytest.mark.asyncio
    async def test_archive_operation(self):
        """Test archive operation."""
        with patch('tools.consolidated.collections.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.update_document = AsyncMock(return_value={
                "id": "test-1",
                "_status": "archived",
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_collection_ops_handler(
                operation="archive",
                collection="projects",
                doc_id="test-1",
            )

            assert result["success"] is True

    @pytest.mark.asyncio
    async def test_restore_operation(self):
        """Test restore operation."""
        with patch('tools.consolidated.collections.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.update_document = AsyncMock(return_value={
                "id": "test-1",
                "_status": "draft",
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_collection_ops_handler(
                operation="restore",
                collection="projects",
                doc_id="test-1",
            )

            assert result["success"] is True

    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test that errors are handled gracefully."""
        with patch('tools.consolidated.collections.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.get_document = AsyncMock(side_effect=Exception("CMS Error"))
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_collection_ops_handler(
                operation="get",
                collection="projects",
                doc_id="test-1",
            )

            assert result["success"] is False
            assert "error" in result
            assert "message" in result

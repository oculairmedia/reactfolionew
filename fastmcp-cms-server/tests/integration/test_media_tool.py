"""Integration tests for cms_media_ops tool."""

import pytest
from unittest.mock import patch, AsyncMock

from tools.consolidated.media import cms_media_ops_handler


@pytest.mark.integration
class TestMediaToolIntegration:
    """Integration tests for media tool."""

    @pytest.mark.asyncio
    async def test_upload_local_path_success(self, tmp_path):
        file_path = tmp_path / "example.png"
        file_path.write_bytes(b"fake")

        with patch("tools.consolidated.media.EnhancedCMSClient") as MockClient:
            mock_client = AsyncMock()
            mock_client.upload_media_file_path = AsyncMock(return_value={"id": "m1"})
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_media_ops_handler(
                operation="upload",
                source="local_path",
                local_path=str(file_path),
                alt="Alt text",
            )

            assert result["success"] is True
            assert result["operation"] == "upload"
            assert result["mediaId"] == "m1"
            assert result["meta"]["source"] == "local_path"
            assert result["meta"]["usedTempFile"] is False

    @pytest.mark.asyncio
    async def test_upload_missing_alt_validation(self, tmp_path):
        file_path = tmp_path / "example.png"
        file_path.write_bytes(b"fake")

        result = await cms_media_ops_handler(
            operation="upload",
            source="local_path",
            local_path=str(file_path),
            alt="",
        )

        assert result["success"] is False
        assert result["error"] == "Validation error"

    @pytest.mark.asyncio
    async def test_upload_missing_source_field_validation(self):
        result = await cms_media_ops_handler(
            operation="upload",
            source="local_path",
            local_path=None,
            alt="Alt",
        )

        assert result["success"] is False
        assert result["error"] == "Validation error"

    @pytest.mark.asyncio
    async def test_register_success(self):
        with patch("tools.consolidated.media.EnhancedCMSClient") as MockClient:
            mock_client = AsyncMock()
            mock_client.create_document = AsyncMock(return_value={"id": "m2"})
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_media_ops_handler(
                operation="register",
                cdn_url="https://cdn.example.com/file.png",
                alt="Alt",
            )

            assert result["success"] is True
            assert result["operation"] == "register"
            assert result["mediaId"] == "m2"
            assert result["meta"]["source"] == "cdn_url"

            mock_client.create_document.assert_awaited_once()
            _args, kwargs = mock_client.create_document.call_args
            assert kwargs["collection"] == "media"
            assert kwargs["draft"] is False
            assert kwargs["data"]["cdn_url"] == "https://cdn.example.com/file.png"

    @pytest.mark.asyncio
    async def test_register_missing_url_validation(self):
        result = await cms_media_ops_handler(
            operation="register",
            cdn_url="",
            alt="Alt",
        )

        assert result["success"] is False
        assert result["error"] == "Validation error"

    # =========================================================================
    # Stage 2: Get and List operations
    # =========================================================================

    @pytest.mark.asyncio
    async def test_get_success(self):
        """Test get operation returns media document."""
        with patch("tools.consolidated.media.EnhancedCMSClient") as MockClient:
            mock_client = AsyncMock()
            mock_client.get_document = AsyncMock(return_value={
                "id": "media-123",
                "alt": "Test image",
                "filename": "test.jpg",
                "mimeType": "image/jpeg",
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_media_ops_handler(
                operation="get",
                media_id="media-123",
            )

            assert result["success"] is True
            assert result["operation"] == "get"
            assert result["mediaId"] == "media-123"
            assert result["data"]["alt"] == "Test image"
            mock_client.get_document.assert_awaited_once_with(
                collection="media",
                doc_id="media-123",
            )

    @pytest.mark.asyncio
    async def test_get_missing_media_id_validation(self):
        """Test get operation requires media_id."""
        result = await cms_media_ops_handler(
            operation="get",
            media_id="",
        )

        assert result["success"] is False
        assert "media_id" in result["message"].lower() or "required" in result["message"].lower()

    @pytest.mark.asyncio
    async def test_list_success(self):
        """Test list operation returns paginated media documents."""
        with patch("tools.consolidated.media.EnhancedCMSClient") as MockClient:
            mock_client = AsyncMock()
            mock_client.get_collection = AsyncMock(return_value={
                "docs": [
                    {"id": "m1", "alt": "Image 1"},
                    {"id": "m2", "alt": "Image 2"},
                ],
                "totalDocs": 2,
                "page": 1,
                "totalPages": 1,
                "limit": 50,
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_media_ops_handler(
                operation="list",
                limit=50,
                page=1,
            )

            assert result["success"] is True
            assert result["operation"] == "list"
            assert len(result["documents"]) == 2
            assert result["totalDocs"] == 2
            assert result["page"] == 1
            mock_client.get_collection.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_list_with_filters(self):
        """Test list operation with JSON filters."""
        with patch("tools.consolidated.media.EnhancedCMSClient") as MockClient:
            mock_client = AsyncMock()
            mock_client.get_collection = AsyncMock(return_value={
                "docs": [{"id": "m1", "source": "upload"}],
                "totalDocs": 1,
                "page": 1,
                "totalPages": 1,
                "limit": 25,
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_media_ops_handler(
                operation="list",
                filters='{"where[source][equals]": "upload"}',
                limit=25,
            )

            assert result["success"] is True
            assert result["totalDocs"] == 1
            # Verify filters were passed
            _args, kwargs = mock_client.get_collection.call_args
            assert kwargs["filters"] == {"where[source][equals]": "upload"}

    @pytest.mark.asyncio
    async def test_list_with_dict_filters(self):
        """Test list operation with dict filters (not JSON string)."""
        with patch("tools.consolidated.media.EnhancedCMSClient") as MockClient:
            mock_client = AsyncMock()
            mock_client.get_collection = AsyncMock(return_value={
                "docs": [],
                "totalDocs": 0,
                "page": 1,
                "totalPages": 1,
                "limit": 50,
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_media_ops_handler(
                operation="list",
                filters={"where[media_type][equals]": "video"},
            )

            assert result["success"] is True
            _args, kwargs = mock_client.get_collection.call_args
            assert kwargs["filters"] == {"where[media_type][equals]": "video"}

    @pytest.mark.asyncio
    async def test_list_invalid_json_filters(self):
        """Test list operation with invalid JSON filters."""
        result = await cms_media_ops_handler(
            operation="list",
            filters="{invalid json}",
        )

        assert result["success"] is False
        assert "json" in result["message"].lower()

    @pytest.mark.asyncio
    async def test_list_pagination(self):
        """Test list operation pagination parameters."""
        with patch("tools.consolidated.media.EnhancedCMSClient") as MockClient:
            mock_client = AsyncMock()
            mock_client.get_collection = AsyncMock(return_value={
                "docs": [{"id": "m5"}],
                "totalDocs": 100,
                "page": 3,
                "totalPages": 10,
                "limit": 10,
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_media_ops_handler(
                operation="list",
                limit=10,
                page=3,
            )

            assert result["success"] is True
            assert result["page"] == 3
            assert result["totalPages"] == 10
            assert result["limit"] == 10
            _args, kwargs = mock_client.get_collection.call_args
            assert kwargs["limit"] == 10
            assert kwargs["page"] == 3

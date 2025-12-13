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

"""Integration tests for cms_global_ops tool."""

import pytest
from unittest.mock import patch, AsyncMock
from tools.consolidated.globals import cms_global_ops_handler


@pytest.mark.integration
class TestGlobalsToolIntegration:
    """Integration tests for globals tool."""

    @pytest.mark.asyncio
    async def test_get_global(self, mock_global_data):
        """Test get global operation."""
        with patch('tools.consolidated.globals.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.get_global = AsyncMock(return_value=mock_global_data)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_global_ops_handler(
                operation="get",
                global_slug="site-settings",
            )

            assert result["success"] is True
            assert result["data"]["metaTitle"] == "Test Site"

    @pytest.mark.asyncio
    async def test_update_global(self):
        """Test update global operation."""
        with patch('tools.consolidated.globals.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.update_global = AsyncMock(return_value={
                "metaTitle": "Updated Site",
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_global_ops_handler(
                operation="update",
                global_slug="site-settings",
                data={"metaTitle": "Updated Site"},
            )

            assert result["success"] is True
            assert "message" in result

    @pytest.mark.asyncio
    async def test_list_globals(self):
        """Test list globals operation."""
        result = await cms_global_ops_handler(
            operation="list",
        )

        assert result["success"] is True
        assert "globals" in result
        assert isinstance(result["globals"], list)
        assert "site-settings" in result["globals"]
        assert "home-intro" in result["globals"]
        assert "about-page" in result["globals"]

    @pytest.mark.asyncio
    async def test_export_global(self):
        """Test export global operation."""
        with patch('tools.consolidated.globals.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.get_global = AsyncMock(return_value={
                "metaTitle": "Test Site",
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_global_ops_handler(
                operation="export",
                global_slug="site-settings",
            )

            assert result["success"] is True
            assert result["globalSlug"] == "site-settings"
            assert "data" in result
            assert "exportedAt" in result

    @pytest.mark.asyncio
    async def test_import_global(self):
        """Test import global operation."""
        with patch('tools.consolidated.globals.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.update_global = AsyncMock(return_value={})
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            import_data = {"metaTitle": "Imported Site"}

            result = await cms_global_ops_handler(
                operation="import",
                global_slug="site-settings",
                data=import_data,
            )

            assert result["success"] is True
            assert result["globalSlug"] == "site-settings"

    @pytest.mark.asyncio
    async def test_validate_global(self):
        """Test validate global operation."""
        result = await cms_global_ops_handler(
            operation="validate",
            global_slug="site-settings",
            data={"metaTitle": "Test"},
        )

        assert result["success"] is True
        assert result["valid"] is True

    @pytest.mark.asyncio
    async def test_missing_global_slug(self):
        """Test that get operation without global_slug returns error."""
        result = await cms_global_ops_handler(
            operation="get",
            global_slug=None,
        )

        assert result["success"] is False
        assert "error" in result

    @pytest.mark.asyncio
    async def test_list_does_not_require_slug(self):
        """Test that list operation doesn't require global_slug."""
        result = await cms_global_ops_handler(
            operation="list",
        )

        # Should succeed without global_slug
        assert result["success"] is True

    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test error handling in global operations."""
        with patch('tools.consolidated.globals.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.get_global = AsyncMock(side_effect=Exception("CMS Error"))
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_global_ops_handler(
                operation="get",
                global_slug="site-settings",
            )

            assert result["success"] is False
            assert "error" in result

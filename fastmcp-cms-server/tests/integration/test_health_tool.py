"""Integration tests for cms_health_ops tool."""

import pytest
from unittest.mock import patch, AsyncMock
from tools.consolidated.health import cms_health_ops_handler


@pytest.mark.integration
class TestHealthToolIntegration:
    """Integration tests for health tool."""

    @pytest.mark.asyncio
    async def test_health_check_healthy(self):
        """Test health check when everything is healthy."""
        with patch('tools.consolidated.health.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.check_health = AsyncMock(return_value={
                "cms_connected": True,
                "cms_status": "ok",
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_health_ops_handler(
                operation="health_check",
            )

            assert result["status"] == "healthy"
            assert "server" in result
            assert "cms" in result
            assert "features" in result
            assert result["cms"]["cms_connected"] is True

    @pytest.mark.asyncio
    async def test_health_check_degraded(self):
        """Test health check when CMS is not connected."""
        with patch('tools.consolidated.health.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.check_health = AsyncMock(return_value={
                "cms_connected": False,
                "error": "Connection failed",
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_health_ops_handler(
                operation="health_check",
            )

            assert result["status"] == "degraded"
            assert result["cms"]["cms_connected"] is False

    @pytest.mark.asyncio
    async def test_metrics_operation(self):
        """Test metrics operation."""
        with patch('tools.consolidated.health.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.get_metrics = AsyncMock(return_value={
                "cache": {"hits": 100, "misses": 20},
                "circuit_breaker": {"state": "closed"},
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            with patch('tools.consolidated.health.get_global_pool') as mock_pool_func:
                mock_pool = AsyncMock()
                mock_pool.get_stats = AsyncMock(return_value={
                    "active": True,
                    "total_requests": 500,
                })
                mock_pool_func.return_value = mock_pool

                result = await cms_health_ops_handler(
                    operation="metrics",
                )

                assert result["success"] is True
                assert "metrics" in result

    @pytest.mark.asyncio
    async def test_cache_stats_operation(self):
        """Test cache stats operation."""
        with patch('tools.consolidated.health.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.cache = AsyncMock()
            mock_client.cache.get_stats = AsyncMock(return_value={
                "size": 100,
                "hits": 500,
                "misses": 100,
                "hit_rate": 83.33,
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_health_ops_handler(
                operation="cache_stats",
            )

            assert result["success"] is True
            assert "cache" in result
            assert result["cache"]["hit_rate"] > 0

    @pytest.mark.asyncio
    async def test_connection_status_operation(self):
        """Test connection status operation."""
        with patch('tools.consolidated.health.get_global_pool') as mock_pool_func:
            mock_pool = AsyncMock()
            mock_pool.get_stats = AsyncMock(return_value={
                "active": True,
                "total_requests": 1000,
                "total_errors": 10,
                "error_rate": 1.0,
            })
            mock_pool_func.return_value = mock_pool

            with patch('tools.consolidated.health.EnhancedCMSClient') as MockClient:
                mock_client = AsyncMock()
                mock_client.circuit_breaker = AsyncMock()
                mock_client.circuit_breaker.get_state = AsyncMock(return_value={
                    "state": "closed",
                    "failure_count": 0,
                })
                mock_client.__aenter__ = AsyncMock(return_value=mock_client)
                mock_client.__aexit__ = AsyncMock(return_value=None)
                MockClient.return_value = mock_client

                result = await cms_health_ops_handler(
                    operation="connection_status",
                )

                assert result["success"] is True
                assert "connection_pool" in result
                assert "circuit_breaker" in result

    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test error handling in health operations."""
        with patch('tools.consolidated.health.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.check_health = AsyncMock(side_effect=Exception("Health check failed"))
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_health_ops_handler(
                operation="health_check",
            )

            assert result["success"] is False
            assert "error" in result

    @pytest.mark.asyncio
    async def test_server_info_in_health_check(self):
        """Test that server info is included in health check."""
        with patch('tools.consolidated.health.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.check_health = AsyncMock(return_value={
                "cms_connected": True,
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_health_ops_handler(
                operation="health_check",
            )

            assert "server" in result
            assert "name" in result["server"]
            assert "version" in result["server"]
            assert "uptime_seconds" in result["server"]
            assert result["server"]["uptime_seconds"] >= 0

    @pytest.mark.asyncio
    async def test_features_info_in_health_check(self):
        """Test that features info is included in health check."""
        with patch('tools.consolidated.health.EnhancedCMSClient') as MockClient:
            mock_client = AsyncMock()
            mock_client.check_health = AsyncMock(return_value={
                "cms_connected": True,
            })
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            MockClient.return_value = mock_client

            result = await cms_health_ops_handler(
                operation="health_check",
            )

            assert "features" in result
            assert "caching" in result["features"]
            assert "audit_log" in result["features"]
            assert "draft_mode" in result["features"]

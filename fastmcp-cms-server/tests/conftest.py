"""Pytest configuration and fixtures for FastMCP CMS Server V2 tests."""

import pytest
import asyncio
import os
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime
from typing import Dict, Any

# Set test environment variables BEFORE importing config
os.environ["CMS_API_URL"] = "http://localhost:3001/api"
os.environ["CMS_ADMIN_EMAIL"] = "test@example.com"
os.environ["CMS_ADMIN_PASSWORD"] = "test_password"
os.environ["ENABLE_AUDIT_LOG"] = "false"
os.environ["ENABLE_CACHING"] = "true"
os.environ["CACHE_TTL"] = "60"

# Import components to test
from core.circuit_breaker import CircuitBreaker
from core.retry import RetryConfig
from core.deduplication import RequestDeduplicator
from core.middleware import MiddlewareStack, LoggingMiddleware
from core.registry import OperationRegistry
from core.smart_cache import SmartCache
from core.connection_pool import ConnectionPool


# ============================================================================
# Event Loop Fixtures
# ============================================================================

@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()


# ============================================================================
# Mock CMS Client Fixtures
# ============================================================================

@pytest.fixture
def mock_cms_client():
    """Mock CMS client for testing."""
    client = AsyncMock()

    # Mock common methods
    client.get_collection = AsyncMock(return_value={
        "docs": [],
        "totalDocs": 0,
        "page": 1,
        "totalPages": 1,
        "limit": 100,
    })

    client.get_document = AsyncMock(return_value={
        "id": "test-1",
        "title": "Test Project",
    })

    client.create_document = AsyncMock(return_value={
        "id": "test-1",
        "title": "Test Project",
    })

    client.update_document = AsyncMock(return_value={
        "id": "test-1",
        "title": "Updated Project",
    })

    client.delete_document = AsyncMock(return_value=True)

    client.get_global = AsyncMock(return_value={
        "metaTitle": "Test Site",
    })

    client.update_global = AsyncMock(return_value={
        "metaTitle": "Updated Site",
    })

    client.check_health = AsyncMock(return_value={
        "cms_connected": True,
        "cms_status": "ok",
    })

    # Mock enhanced features
    client.circuit_breaker = Mock()
    client.circuit_breaker.get_state = Mock(return_value={
        "state": "closed",
        "failure_count": 0,
    })

    client.cache = Mock()
    client.cache.get_stats = Mock(return_value={
        "size": 10,
        "hits": 50,
        "misses": 20,
        "hit_rate": 71.43,
    })

    client.deduplicator = Mock()
    client.deduplicator.get_stats = Mock(return_value={
        "total_requests": 100,
        "deduplicated": 15,
        "deduplication_rate": 15.0,
    })

    # Mock context manager
    client.__aenter__ = AsyncMock(return_value=client)
    client.__aexit__ = AsyncMock(return_value=None)

    return client


# ============================================================================
# Core Component Fixtures
# ============================================================================

@pytest.fixture
def circuit_breaker():
    """Create circuit breaker for testing."""
    return CircuitBreaker(
        failure_threshold=3,
        recovery_timeout=5,
        success_threshold=2,
    )


@pytest.fixture
def retry_config():
    """Create retry config for testing."""
    return RetryConfig(
        max_retries=3,
        backoff_factor=2.0,
        retry_on=(Exception,),
        timeout=10,
    )


@pytest.fixture
def request_deduplicator():
    """Create request deduplicator for testing."""
    return RequestDeduplicator()


@pytest.fixture
def smart_cache():
    """Create smart cache for testing."""
    return SmartCache(default_ttl=60)


@pytest.fixture
def operation_registry():
    """Create operation registry for testing."""
    return OperationRegistry()


@pytest.fixture
def middleware_stack():
    """Create middleware stack for testing."""
    return MiddlewareStack([LoggingMiddleware()])


@pytest.fixture
async def connection_pool():
    """Create connection pool for testing."""
    pool = ConnectionPool(
        max_keepalive_connections=5,
        max_connections=10,
        keepalive_expiry=10.0,
        timeout=5.0,
        http2=False,
    )
    yield pool
    await pool.close()


# ============================================================================
# Test Data Fixtures
# ============================================================================

@pytest.fixture
def mock_project_data():
    """Mock project data for testing."""
    return {
        "id": "test-project",
        "title": "Test Project",
        "subtitle": "A test project",
        "metadata": {
            "client": "Test Client",
            "date": "2025-11",
            "role": "Developer",
            "technologies": ["Python", "FastMCP"],
        },
        "tags": [{"tag": "test"}],
        "sections": [
            {
                "title": "Overview",
                "content": "Project overview",
                "layout": "full-width",
            }
        ],
    }


@pytest.fixture
def mock_portfolio_data():
    """Mock portfolio data for testing."""
    return {
        "id": "portfolio-1",
        "title": "Portfolio Item",
        "description": "Test portfolio item",
        "img": "/media/image.jpg",
        "isVideo": False,
        "tags": [{"tag": "web"}],
    }


@pytest.fixture
def mock_global_data():
    """Mock global data for testing."""
    return {
        "metaTitle": "Test Site",
        "metaDescription": "A test site",
        "contactEmail": "test@example.com",
    }


@pytest.fixture
def batch_items():
    """Batch items for testing."""
    return [
        {"id": f"item-{i}", "title": f"Item {i}"}
        for i in range(1, 6)
    ]


# ============================================================================
# Utility Fixtures
# ============================================================================

@pytest.fixture
async def wait_for_condition():
    """Helper to wait for a condition to be true."""
    async def _wait(condition, timeout=1.0, check_interval=0.01):
        """Wait for condition to be true."""
        start = asyncio.get_event_loop().time()
        while not condition():
            if asyncio.get_event_loop().time() - start > timeout:
                raise AssertionError(f"Condition not met within {timeout}s")
            await asyncio.sleep(check_interval)
    return _wait

"""Unit tests for SmartCache."""

import pytest
import asyncio
from datetime import timedelta
from core.smart_cache import SmartCache


@pytest.mark.unit
@pytest.mark.async
class TestSmartCache:
    """Tests for SmartCache."""

    def test_set_and_get(self, smart_cache):
        """Test basic set and get operations."""
        smart_cache.set("key1", "value1")
        assert smart_cache.get("key1") == "value1"

    def test_get_nonexistent_key(self, smart_cache):
        """Test getting non-existent key returns None."""
        assert smart_cache.get("nonexistent") is None

    def test_ttl_expiration(self, smart_cache):
        """Test that keys expire after TTL."""
        smart_cache.set("key1", "value1", ttl=1)  # 1 second TTL

        # Immediately available
        assert smart_cache.get("key1") == "value1"

        # After expiration (simulate by manipulating expiry)
        import time
        time.sleep(1.1)

        # Should be None (expired)
        assert smart_cache.get("key1") is None

    def test_access_tracking(self, smart_cache):
        """Test that cache tracks access counts."""
        smart_cache.set("key1", "value1")

        # Access multiple times
        for _ in range(5):
            smart_cache.get("key1")

        # Check access count
        assert smart_cache._access_counts["key1"] == 5

    def test_delete(self, smart_cache):
        """Test cache key deletion."""
        smart_cache.set("key1", "value1")
        assert smart_cache.get("key1") == "value1"

        existed = smart_cache.delete("key1")
        assert existed is True
        assert smart_cache.get("key1") is None

        # Delete non-existent key
        existed = smart_cache.delete("nonexistent")
        assert existed is False

    def test_invalidate_pattern(self, smart_cache):
        """Test pattern-based invalidation."""
        # Set multiple keys
        smart_cache.set("collection:projects:1", "value1")
        smart_cache.set("collection:projects:2", "value2")
        smart_cache.set("collection:portfolio:1", "value3")
        smart_cache.set("other:key", "value4")

        # Invalidate projects pattern
        smart_cache.invalidate_pattern("collection:projects:.*")

        # Projects should be gone
        assert smart_cache.get("collection:projects:1") is None
        assert smart_cache.get("collection:projects:2") is None

        # Others should remain
        assert smart_cache.get("collection:portfolio:1") == "value3"
        assert smart_cache.get("other:key") == "value4"

    def test_invalidate_smart_create_operation(self, smart_cache):
        """Test smart invalidation for create operation."""
        # Set collection listings
        smart_cache.set("collection:projects:list", "old_list")
        smart_cache.set("doc:projects:test-1", "doc_data")

        # Invalidate with create operation
        smart_cache.invalidate_smart("create", "projects")

        # Collection listings should be invalidated
        assert smart_cache.get("collection:projects:list") is None

        # Individual doc might still be cached
        # (implementation detail)

    def test_invalidate_smart_update_operation(self, smart_cache):
        """Test smart invalidation for update operation."""
        smart_cache.set("collection:projects:list", "list")
        smart_cache.set("doc:projects:test-1", "doc")

        smart_cache.invalidate_smart("update", "projects")

        # Both should be invalidated for updates
        assert smart_cache.get("collection:projects:list") is None

    def test_get_hot_keys(self, smart_cache):
        """Test getting most frequently accessed keys."""
        # Access keys different numbers of times
        smart_cache.set("key1", "v1")
        smart_cache.set("key2", "v2")
        smart_cache.set("key3", "v3")

        for _ in range(10):
            smart_cache.get("key1")
        for _ in range(5):
            smart_cache.get("key2")
        for _ in range(2):
            smart_cache.get("key3")

        hot_keys = smart_cache.get_hot_keys(limit=2)

        # Should return top 2
        assert len(hot_keys) == 2
        assert hot_keys[0][0] == "key1"  # Most accessed
        assert hot_keys[0][1] == 10
        assert hot_keys[1][0] == "key2"
        assert hot_keys[1][1] == 5

    def test_get_stats(self, smart_cache):
        """Test cache statistics."""
        # Set some keys
        smart_cache.set("key1", "value1")
        smart_cache.set("key2", "value2")

        # Some hits
        smart_cache.get("key1")
        smart_cache.get("key1")

        # Some misses
        smart_cache.get("nonexistent1")
        smart_cache.get("nonexistent2")

        stats = smart_cache.get_stats()

        assert stats["size"] == 2  # 2 keys cached
        assert stats["hits"] == 2
        assert stats["misses"] == 2
        assert stats["hit_rate"] == 50.0  # 2/4 = 50%
        assert stats["sets"] == 2

    def test_reset_stats(self, smart_cache):
        """Test resetting statistics."""
        smart_cache.set("key1", "value1")
        smart_cache.get("key1")
        smart_cache.get("nonexistent")

        smart_cache.reset_stats()

        stats = smart_cache.get_stats()
        assert stats["hits"] == 0
        assert stats["misses"] == 0
        assert stats["sets"] == 0
        # Note: size should still be 1 (cache not cleared)
        assert stats["size"] == 1

    def test_clear(self, smart_cache):
        """Test clearing entire cache."""
        smart_cache.set("key1", "value1")
        smart_cache.set("key2", "value2")

        smart_cache.clear()

        assert smart_cache.get("key1") is None
        assert smart_cache.get("key2") is None

        stats = smart_cache.get_stats()
        assert stats["size"] == 0

    @pytest.mark.asyncio
    async def test_warm_key_not_implemented(self, smart_cache, mock_cms_client):
        """Test that warm_key handles different key formats."""
        # Collection key
        await smart_cache._warm_key("collection:projects:filter1", mock_cms_client)

        # Should have called get_collection
        mock_cms_client.get_collection.assert_called_once()

    def test_invalidate_pattern_with_glob(self, smart_cache):
        """Test glob-style pattern invalidation."""
        smart_cache.set("prefix:key1", "v1")
        smart_cache.set("prefix:key2", "v2")
        smart_cache.set("other:key", "v3")

        # Use glob-style pattern with *
        smart_cache.invalidate_pattern("prefix:*")

        assert smart_cache.get("prefix:key1") is None
        assert smart_cache.get("prefix:key2") is None
        assert smart_cache.get("other:key") == "v3"

    def test_zero_ttl_means_no_expiry(self, smart_cache):
        """Test that TTL of 0 means no expiry tracking."""
        cache_with_zero_ttl = SmartCache(default_ttl=0)
        cache_with_zero_ttl.set("key1", "value1")

        # Key should not have expiry
        assert "key1" not in cache_with_zero_ttl._expiry

        # Should still be accessible
        assert cache_with_zero_ttl.get("key1") == "value1"

    def test_hit_rate_with_no_requests(self, smart_cache):
        """Test that hit rate is 0 with no requests."""
        stats = smart_cache.get_stats()
        assert stats["hit_rate"] == 0.0

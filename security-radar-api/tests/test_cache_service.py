"""
Unit tests for CacheService
"""

import pytest
import os
from src.cache_service import CacheService


class TestCacheService:
    """Tests for CacheService class."""

    def test_cache_initialization(self, temp_cache_db):
        """Test that cache service initializes correctly."""
        cache = CacheService(db_path=temp_cache_db)
        assert os.path.exists(temp_cache_db)

    def test_generate_key(self, cache_service):
        """Test cache key generation."""
        key1 = cache_service.generate_key("FileZilla", "Tim Kosse")
        key2 = cache_service.generate_key("FileZilla", "Tim Kosse")
        key3 = cache_service.generate_key("FileZilla", "Different Vendor")

        # Same inputs should generate same key
        assert key1 == key2

        # Different inputs should generate different keys
        assert key1 != key3

        # Keys should be consistent format (SHA256 hex)
        assert len(key1) == 64
        assert all(c in '0123456789abcdef' for c in key1)

    def test_generate_key_normalization(self, cache_service):
        """Test that keys are normalized (case-insensitive)."""
        key1 = cache_service.generate_key("FileZilla", "Tim Kosse")
        key2 = cache_service.generate_key("FILEZILLA", "TIM KOSSE")
        key3 = cache_service.generate_key("filezilla", "tim kosse")

        assert key1 == key2 == key3

    def test_set_and_get(self, cache_service):
        """Test storing and retrieving from cache."""
        cache_key = "test_key_123"
        test_data = {
            "product_name": "Test Product",
            "score": 85,
            "description": "Test assessment"
        }

        # Store data
        result = cache_service.set(
            cache_key=cache_key,
            assessment_data=test_data,
            product_name="Test Product"
        )
        assert result is True

        # Retrieve data
        cached_data = cache_service.get(cache_key)
        assert cached_data is not None
        assert cached_data["product_name"] == "Test Product"
        assert cached_data["score"] == 85
        assert cached_data["description"] == "Test assessment"

    def test_get_nonexistent_key(self, cache_service):
        """Test retrieving a non-existent key returns None."""
        result = cache_service.get("nonexistent_key_12345")
        assert result is None

    def test_cache_metadata(self, cache_service):
        """Test that cache includes metadata."""
        cache_key = "test_meta_key"
        test_data = {"test": "data"}

        cache_service.set(
            cache_key=cache_key,
            assessment_data=test_data,
            product_name="Test"
        )

        cached_data = cache_service.get(cache_key)
        assert "_cache_metadata" in cached_data
        assert "cached_at" in cached_data["_cache_metadata"]
        assert "access_count" in cached_data["_cache_metadata"]

    def test_access_count_increment(self, cache_service):
        """Test that access count increments."""
        cache_key = "test_access_key"
        test_data = {"test": "data"}

        cache_service.set(
            cache_key=cache_key,
            assessment_data=test_data,
            product_name="Test"
        )

        # First access
        cached1 = cache_service.get(cache_key)
        count1 = cached1["_cache_metadata"]["access_count"]

        # Second access
        cached2 = cache_service.get(cache_key)
        count2 = cached2["_cache_metadata"]["access_count"]

        assert count2 > count1

    def test_list_all(self, cache_service):
        """Test listing all cached items."""
        # Add multiple items
        for i in range(5):
            cache_service.set(
                cache_key=f"key_{i}",
                assessment_data={"index": i},
                product_name=f"Product {i}"
            )

        # List all
        items = cache_service.list_all(limit=10, offset=0)
        assert len(items) == 5
        assert all("cache_key" in item for item in items)
        assert all("product_name" in item for item in items)

    def test_list_all_pagination(self, cache_service):
        """Test pagination in list_all."""
        # Add multiple items
        for i in range(10):
            cache_service.set(
                cache_key=f"key_{i}",
                assessment_data={"index": i},
                product_name=f"Product {i}"
            )

        # Get first page
        page1 = cache_service.list_all(limit=3, offset=0)
        assert len(page1) == 3

        # Get second page
        page2 = cache_service.list_all(limit=3, offset=3)
        assert len(page2) == 3

        # Ensure different results
        page1_keys = {item["cache_key"] for item in page1}
        page2_keys = {item["cache_key"] for item in page2}
        assert page1_keys != page2_keys

    def test_search_by_product(self, cache_service):
        """Test searching cache by product name."""
        # Add items with different names
        cache_service.set("key1", {"test": "data"}, product_name="FileZilla")
        cache_service.set("key2", {"test": "data"}, product_name="WinSCP")
        cache_service.set("key3", {"test": "data"}, product_name="FileZilla Pro")

        # Search for FileZilla
        results = cache_service.search_by_product("FileZilla")
        assert len(results) >= 2

        product_names = [r["product_name"] for r in results]
        assert "FileZilla" in product_names
        assert "FileZilla Pro" in product_names

    def test_get_stats(self, cache_service):
        """Test cache statistics."""
        # Add some items
        for i in range(3):
            cache_service.set(
                cache_key=f"key_{i}",
                assessment_data={"index": i},
                product_name=f"Product {i}"
            )

        stats = cache_service.get_stats()
        assert stats["total_entries"] == 3
        assert "oldest_entry" in stats
        assert "newest_entry" in stats

    def test_update_existing_key(self, cache_service):
        """Test updating an existing cache entry."""
        cache_key = "update_test_key"

        # First entry
        cache_service.set(
            cache_key=cache_key,
            assessment_data={"version": 1},
            product_name="Test Product"
        )

        # Update with new data
        cache_service.set(
            cache_key=cache_key,
            assessment_data={"version": 2},
            product_name="Test Product Updated"
        )

        # Retrieve and verify
        cached = cache_service.get(cache_key)
        assert cached["version"] == 2

    def test_clear_old_entries(self, cache_service):
        """Test clearing old cache entries."""
        # Add some items
        for i in range(5):
            cache_service.set(
                cache_key=f"key_{i}",
                assessment_data={"index": i},
                product_name=f"Product {i}"
            )

        # Clear entries older than 30 days (should clear none)
        deleted_count = cache_service.clear_old_entries(days=30)

        # Since we just added them, none should be deleted
        assert deleted_count == 0

        # Verify all items still exist
        stats = cache_service.get_stats()
        assert stats["total_entries"] == 5

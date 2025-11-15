"""
Integration tests for end-to-end workflows
"""

import pytest
import asyncio
from src.models import AssessmentRequest
from src.assessor import SecurityAssessor
from src.cache_service import CacheService


class TestEndToEndAssessment:
    """End-to-end integration tests."""

    @pytest.mark.asyncio
    async def test_complete_assessment_workflow(self, cache_service, assessor):
        """Test complete workflow from request to cached response."""
        # Create request
        request = AssessmentRequest(
            product_name="FileZilla",
            company_name="Tim Kosse",
            sha1="e94803128b6368b5c2c876a782b1e88346356844"
        )

        # Perform assessment
        result = await assessor.assess(request)

        # Verify result
        assert result.product_name == "FileZilla"
        assert result.vendor.name == "Tim Kosse"
        assert result.category is not None
        assert result.trust_score.score >= 0
        assert result.trust_score.score <= 100
        assert result.cache_key is not None

        # Store in cache
        cache_key = assessor.generate_cache_key(request)
        cache_service.set(
            cache_key=cache_key,
            assessment_data=result.model_dump(),
            product_name=request.product_name,
            company_name=request.company_name,
            sha1=request.sha1
        )

        # Retrieve from cache
        cached = cache_service.get(cache_key)
        assert cached is not None
        assert cached["product_name"] == "FileZilla"

    @pytest.mark.asyncio
    async def test_multiple_assessments_workflow(self, cache_service, assessor, sample_requests):
        """Test assessing multiple products and caching them."""
        results = []

        for request in sample_requests:
            # Assess
            result = await assessor.assess(request)
            results.append(result)

            # Cache
            cache_key = assessor.generate_cache_key(request)
            cache_service.set(
                cache_key=cache_key,
                assessment_data=result.model_dump(),
                product_name=request.product_name,
                company_name=request.company_name,
                sha1=request.sha1
            )

        # Verify all results
        assert len(results) == len(sample_requests)

        # Verify all cached
        for request in sample_requests:
            cache_key = assessor.generate_cache_key(request)
            cached = cache_service.get(cache_key)
            assert cached is not None

    @pytest.mark.asyncio
    async def test_cache_hit_workflow(self, cache_service, assessor, sample_request):
        """Test that subsequent requests use cache."""
        cache_key = assessor.generate_cache_key(sample_request)

        # First assessment
        result1 = await assessor.assess(sample_request)

        # Store in cache
        cache_service.set(
            cache_key=cache_key,
            assessment_data=result1.model_dump(),
            product_name=sample_request.product_name,
            company_name=sample_request.company_name
        )

        # Retrieve from cache
        cached = cache_service.get(cache_key)
        assert cached is not None

        # Verify metadata shows it was cached
        assert "_cache_metadata" in cached
        assert "access_count" in cached["_cache_metadata"]


class TestAPIEndToEnd:
    """End-to-end API tests."""

    def test_api_assess_and_retrieve(self, client):
        """Test full API workflow: assess, cache, retrieve."""
        # Step 1: Perform assessment
        payload = {
            "product_name": "E2E Test Product",
            "company_name": "Test Vendor"
        }
        assess_response = client.post("/assess", json=payload)
        assert assess_response.status_code == 200

        assessment = assess_response.json()
        cache_key = assessment["cache_key"]

        # Step 2: Retrieve from cache
        cache_response = client.get(f"/cache/{cache_key}")
        assert cache_response.status_code == 200

        cached_assessment = cache_response.json()
        assert cached_assessment["product_name"] == "E2E Test Product"

        # Step 3: Verify in cache list
        list_response = client.get("/cache")
        assert list_response.status_code == 200

        cache_list = list_response.json()
        assert cache_list["total"] > 0

    def test_api_multiple_products_workflow(self, client):
        """Test assessing multiple products through API."""
        products = [
            {"product_name": "Product A", "company_name": "Vendor A"},
            {"product_name": "Product B", "company_name": "Vendor B"},
            {"product_name": "Product C", "company_name": "Vendor C"}
        ]

        cache_keys = []

        # Assess all products
        for product in products:
            response = client.post("/assess", json=product)
            assert response.status_code == 200

            data = response.json()
            cache_keys.append(data["cache_key"])

        # Verify all are cached
        for cache_key in cache_keys:
            response = client.get(f"/cache/{cache_key}")
            assert response.status_code == 200

        # Verify cache list contains all
        list_response = client.get("/cache")
        cache_list = list_response.json()
        assert cache_list["total"] >= len(products)

    def test_api_force_refresh(self, client):
        """Test force refresh bypasses cache."""
        payload = {
            "product_name": "Refresh Test Product",
            "force_refresh": False
        }

        # First request
        response1 = client.post("/assess", json=payload)
        assert response1.status_code == 200
        data1 = response1.json()

        # Second request with force_refresh
        payload["force_refresh"] = True
        response2 = client.post("/assess", json=payload)
        assert response2.status_code == 200
        data2 = response2.json()

        # Both should succeed
        assert data1["product_name"] == data2["product_name"]


class TestCacheIntegration:
    """Integration tests for cache functionality."""

    def test_cache_persistence(self, temp_cache_db):
        """Test that cache persists across service instances."""
        # Create first cache instance
        cache1 = CacheService(db_path=temp_cache_db)
        cache1.set(
            cache_key="persist_test",
            assessment_data={"test": "data"},
            product_name="Test Product"
        )

        # Create second cache instance with same DB
        cache2 = CacheService(db_path=temp_cache_db)
        cached = cache2.get("persist_test")

        assert cached is not None
        assert cached["test"] == "data"

    def test_cache_search_integration(self, cache_service):
        """Test searching across multiple cached items."""
        # Add multiple items
        products = [
            ("key1", "FileZilla Client", "FileZilla"),
            ("key2", "FileZilla Server", "FileZilla"),
            ("key3", "WinSCP", "WinSCP"),
            ("key4", "FileZilla Pro", "FileZilla")
        ]

        for key, name, product in products:
            cache_service.set(
                cache_key=key,
                assessment_data={"name": name},
                product_name=product
            )

        # Search for FileZilla
        results = cache_service.search_by_product("FileZilla")
        assert len(results) >= 3

        # Verify all FileZilla products found
        found_products = [r["product_name"] for r in results]
        assert "FileZilla" in found_products


class TestErrorRecovery:
    """Integration tests for error handling and recovery."""

    def test_api_recovers_from_invalid_request(self, client):
        """Test that API recovers after invalid request."""
        # Send invalid request
        invalid_response = client.post("/assess", json={})
        assert invalid_response.status_code == 422

        # Send valid request - should work
        valid_response = client.post("/assess", json={"product_name": "Test"})
        assert valid_response.status_code == 200

    @pytest.mark.asyncio
    async def test_assessor_handles_missing_data(self, assessor):
        """Test assessor handles requests with minimal data."""
        request = AssessmentRequest(product_name="MinimalTest")

        # Should not crash
        result = await assessor.assess(request)
        assert result.product_name == "MinimalTest"
        assert result.vendor.name == "Unknown"

"""
Integration tests for FastAPI endpoints
"""

import pytest
from fastapi import status


class TestRootEndpoint:
    """Tests for root endpoint."""

    def test_root_endpoint(self, client):
        """Test GET / returns API information."""
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert "service" in data
        assert "version" in data
        assert "endpoints" in data
        assert data["service"] == "AI Security Assessor"


class TestHealthEndpoint:
    """Tests for health check endpoint."""

    def test_health_check(self, client):
        """Test GET /health returns healthy status."""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["status"] == "healthy"


class TestAssessEndpoint:
    """Tests for POST /assess endpoint."""

    def test_assess_minimal_request(self, client):
        """Test assessment with minimal request data."""
        payload = {
            "product_name": "FileZilla"
        }
        response = client.post("/assess", json=payload)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["product_name"] == "FileZilla"
        assert "trust_score" in data
        assert "vendor" in data
        assert "category" in data

    def test_assess_full_request(self, client):
        """Test assessment with complete request data."""
        payload = {
            "product_name": "FileZilla",
            "company_name": "Tim Kosse",
            "url": "https://filezilla-project.org",
            "sha1": "e94803128b6368b5c2c876a782b1e88346356844",
            "force_refresh": False
        }
        response = client.post("/assess", json=payload)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["product_name"] == "FileZilla"
        assert data["vendor"]["name"] == "Tim Kosse"
        assert "trust_score" in data
        assert data["trust_score"]["score"] >= 0
        assert data["trust_score"]["score"] <= 100

    def test_assess_missing_required_field(self, client):
        """Test assessment fails with missing required field."""
        payload = {}
        response = client.post("/assess", json=payload)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_assess_response_structure(self, client):
        """Test that response has all expected fields."""
        payload = {"product_name": "Slack"}
        response = client.post("/assess", json=payload)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        # Required fields
        assert "product_name" in data
        assert "vendor" in data
        assert "category" in data
        assert "description" in data
        assert "usage_description" in data
        assert "cve_trends" in data
        assert "compliance" in data
        assert "trust_score" in data
        assert "alternatives" in data
        assert "citations" in data
        assert "assessment_timestamp" in data
        assert "cache_key" in data

        # Trust score structure
        trust_score = data["trust_score"]
        assert "score" in trust_score
        assert "confidence" in trust_score
        assert "rationale" in trust_score

    def test_assess_multiple_products(self, client):
        """Test assessing multiple different products."""
        products = ["FileZilla", "1Password", "Slack"]

        for product in products:
            payload = {"product_name": product}
            response = client.post("/assess", json=payload)
            assert response.status_code == status.HTTP_200_OK

            data = response.json()
            assert data["product_name"] == product

    def test_assess_caching(self, client):
        """Test that assessments are cached."""
        payload = {"product_name": "TestProduct123"}

        # First request
        response1 = client.post("/assess", json=payload)
        assert response1.status_code == status.HTTP_200_OK
        data1 = response1.json()
        cache_key = data1["cache_key"]

        # Get from cache
        cache_response = client.get(f"/cache/{cache_key}")
        assert cache_response.status_code == status.HTTP_200_OK
        cached_data = cache_response.json()
        assert cached_data["product_name"] == "TestProduct123"


class TestCacheEndpoints:
    """Tests for cache-related endpoints."""

    def test_get_cached_assessment(self, client):
        """Test retrieving a cached assessment."""
        # First create an assessment
        payload = {"product_name": "CacheTest"}
        response = client.post("/assess", json=payload)
        data = response.json()
        cache_key = data["cache_key"]

        # Retrieve from cache
        cache_response = client.get(f"/cache/{cache_key}")
        assert cache_response.status_code == status.HTTP_200_OK

        cached_data = cache_response.json()
        assert cached_data["product_name"] == "CacheTest"

    def test_get_nonexistent_cache_entry(self, client):
        """Test retrieving non-existent cache entry returns 404."""
        response = client.get("/cache/nonexistent_key_12345")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_list_cached_assessments(self, client):
        """Test listing cached assessments."""
        # Create some assessments first
        for i in range(3):
            payload = {"product_name": f"Product{i}"}
            client.post("/assess", json=payload)

        # List cache
        response = client.get("/cache")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert "total" in data
        assert "limit" in data
        assert "offset" in data
        assert "assessments" in data
        assert isinstance(data["assessments"], list)

    def test_list_cached_with_pagination(self, client):
        """Test pagination in cache listing."""
        # Create multiple assessments
        for i in range(5):
            payload = {"product_name": f"PaginationTest{i}"}
            client.post("/assess", json=payload)

        # Get first page
        response1 = client.get("/cache?limit=2&offset=0")
        assert response1.status_code == status.HTTP_200_OK
        data1 = response1.json()
        assert data1["limit"] == 2
        assert data1["offset"] == 0

        # Get second page
        response2 = client.get("/cache?limit=2&offset=2")
        assert response2.status_code == status.HTTP_200_OK
        data2 = response2.json()
        assert data2["limit"] == 2
        assert data2["offset"] == 2


class TestFileUploadEndpoint:
    """Tests for file upload endpoint."""

    def test_file_upload_endpoint_exists(self, client):
        """Test that file upload endpoint exists."""
        # Create a simple CSV content
        csv_content = b"company_name,product_name,sha1\nTest Company,Test Product,abc123"

        response = client.post(
            "/assess/file",
            files={"file": ("test.csv", csv_content, "text/csv")}
        )

        # Should not error (may return not implemented message)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_501_NOT_IMPLEMENTED]


class TestCORSMiddleware:
    """Tests for CORS middleware."""

    def test_api_accessible(self, client):
        """Test that API is accessible (CORS middleware doesn't break requests)."""
        # Simple test to verify CORS middleware doesn't break normal operations
        response = client.get("/")
        assert response.status_code == 200
        # If CORS middleware is misconfigured, this would fail


class TestErrorHandling:
    """Tests for error handling."""

    def test_invalid_json(self, client):
        """Test handling of invalid JSON."""
        response = client.post(
            "/assess",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_invalid_method(self, client):
        """Test invalid HTTP method."""
        response = client.put("/assess")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

"""
Pytest configuration and fixtures for AI Security Assessor tests
"""

import pytest
import os
import tempfile
from fastapi.testclient import TestClient

from src.main import app
from src.cache_service import CacheService
from src.assessor import SecurityAssessor
from src.models import AssessmentRequest


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def temp_cache_db():
    """Create a temporary cache database for testing."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.db', delete=False) as f:
        db_path = f.name

    yield db_path

    # Cleanup
    if os.path.exists(db_path):
        os.remove(db_path)


@pytest.fixture
def cache_service(temp_cache_db):
    """Create a cache service with temporary database."""
    return CacheService(db_path=temp_cache_db)


@pytest.fixture
def assessor(cache_service):
    """Create a security assessor instance."""
    return SecurityAssessor(cache_service)


@pytest.fixture
def sample_request():
    """Create a sample assessment request."""
    return AssessmentRequest(
        product_name="FileZilla",
        company_name="Tim Kosse",
        sha1="e94803128b6368b5c2c876a782b1e88346356844",
        url="https://filezilla-project.org"
    )


@pytest.fixture
def sample_requests():
    """Create multiple sample assessment requests."""
    return [
        AssessmentRequest(
            product_name="FileZilla",
            company_name="Tim Kosse",
            sha1="e94803128b6368b5c2c876a782b1e88346356844"
        ),
        AssessmentRequest(
            product_name="1Password",
            company_name="1Password",
            sha1="e5ee385388b5fa57cc8374102d779d3c9849a57f"
        ),
        AssessmentRequest(
            product_name="Slack",
            company_name="Slack Technologies Inc.",
            sha1="f53f36c766c615f665dd00de30dc12d2ed4195b9"
        )
    ]

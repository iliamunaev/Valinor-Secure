"""
Pytest configuration and fixtures for AI Security Assessor tests
"""

import pytest
import os
import tempfile
import json
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from src.main import app
from src.cache_service import CacheService
from src.assessor import SecurityAssessor
from src.models import AssessmentRequest

# Set environment variable to indicate we're in test mode
os.environ["TESTING"] = "true"
os.environ["ENABLE_REQUEST_LOGGING"] = "false"  # Disable logging during tests


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


@pytest.fixture
def mock_llm_response():
    """Create a mock LLM response that matches the expected format."""
    return json.dumps({
        "vendor": {
            "name": "Test Vendor",
            "website": "https://example.com",
            "country": "United States",
            "founded": "2020",
            "reputation_summary": "Test vendor with good reputation"
        },
        "category": "Communication",
        "description": "Test software for security assessment",
        "usage_description": "Used for testing purposes",
        "cve_trends": {
            "total_cves": 5,
            "critical_count": 1,
            "high_count": 2,
            "medium_count": 2,
            "low_count": 0,
            "recent_cves": [
                {
                    "id": "CVE-2024-12345",
                    "severity": "High",
                    "description": "Test vulnerability"
                }
            ],
            "trend_summary": "Moderate CVE history with responsive patching"
        },
        "incidents": [
            {
                "date": "2024-01-15",
                "description": "Test security incident",
                "severity": "Medium",
                "source_type": "Public Disclosure",
                "source_url": "https://example.com/incident",
                "source_title": "Security Incident Report"
            }
        ],
        "compliance": {
            "soc2_compliant": True,
            "iso_certified": True,
            "gdpr_compliant": True,
            "data_processing_location": "United States",
            "encryption_at_rest": True,
            "encryption_in_transit": True,
            "data_retention_policy": "Data retained for 90 days",
            "notes": "Compliant with major security standards"
        },
        "deployment_model": "Cloud",
        "admin_controls": "Full admin controls available including user management and security settings",
        "trust_score": {
            "score": 75,
            "confidence": "Medium",
            "rationale": "Good security posture with some areas for improvement",
            "risk_factors": ["Past security incidents", "Some unpatched CVEs"],
            "positive_factors": ["SOC2 compliant", "Strong encryption", "Active security team"]
        },
        "alternatives": [
            {
                "product_name": "Alternative Software",
                "vendor": "Alternative Vendor",
                "rationale": "Similar functionality with stronger security track record",
                "trust_score": 85
            }
        ],
        "citations": [
            {
                "url": "https://example.com/security",
                "source_type": "Vendor Stated",
                "title": "Security Documentation",
                "date": "2024-01-01",
                "description": "Official security documentation"
            },
            {
                "url": "https://cve.mitre.org",
                "source_type": "CVE Database",
                "title": "CVE Database",
                "date": "2024-02-01",
                "description": "CVE vulnerability database"
            }
        ]
    })


@pytest.fixture
def mock_llm_call(mock_llm_response):
    """Mock the LLM API call to return a pre-defined response."""
    async def _mock_call_llm(self, model: str, prompt: str) -> str:
        """Mock implementation that returns test data instantly."""
        return mock_llm_response

    return _mock_call_llm


@pytest.fixture(autouse=True)
def mock_assessor_llm(monkeypatch, mock_llm_call):
    """
    Automatically mock the LLM calls in SecurityAssessor for all tests.
    This fixture runs automatically for every test (autouse=True).
    """
    # Patch the _call_llm method to use our mock
    monkeypatch.setattr(
        "src.assessor.SecurityAssessor._call_llm",
        mock_llm_call
    )
    return mock_llm_call

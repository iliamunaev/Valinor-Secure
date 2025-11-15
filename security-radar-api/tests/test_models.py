"""
Unit tests for Pydantic models
"""

import pytest
from datetime import datetime
from pydantic import ValidationError

from src.models import (
    AssessmentRequest,
    AssessmentResponse,
    VendorInfo,
    SoftwareCategory,
    CVETrend,
    ComplianceInfo,
    TrustScore,
    AlternativeSuggestion,
    CitationSource,
    SourceType
)


class TestAssessmentRequest:
    """Tests for AssessmentRequest model."""

    def test_valid_request_minimal(self):
        """Test creating a minimal valid request."""
        request = AssessmentRequest(product_name="FileZilla")
        assert request.product_name == "FileZilla"
        assert request.company_name is None
        assert request.url is None
        assert request.sha1 is None
        assert request.force_refresh is False

    def test_valid_request_full(self):
        """Test creating a complete request."""
        request = AssessmentRequest(
            product_name="FileZilla",
            company_name="Tim Kosse",
            url="https://filezilla-project.org",
            sha1="e94803128b6368b5c2c876a782b1e88346356844",
            force_refresh=True
        )
        assert request.product_name == "FileZilla"
        assert request.company_name == "Tim Kosse"
        assert request.url == "https://filezilla-project.org"
        assert request.sha1 == "e94803128b6368b5c2c876a782b1e88346356844"
        assert request.force_refresh is True

    def test_missing_required_field(self):
        """Test that missing product_name raises validation error."""
        with pytest.raises(ValidationError):
            AssessmentRequest()


class TestVendorInfo:
    """Tests for VendorInfo model."""

    def test_vendor_info_creation(self):
        """Test creating vendor info."""
        vendor = VendorInfo(
            name="Test Vendor",
            website="https://example.com",
            country="USA",
            founded="2020",
            reputation_summary="Good reputation"
        )
        assert vendor.name == "Test Vendor"
        assert vendor.website == "https://example.com"
        assert vendor.country == "USA"
        assert vendor.founded == "2020"
        assert vendor.reputation_summary == "Good reputation"


class TestTrustScore:
    """Tests for TrustScore model."""

    def test_valid_trust_score(self):
        """Test creating a valid trust score."""
        score = TrustScore(
            score=75,
            confidence="High",
            rationale="Well established product",
            risk_factors=["Known CVEs"],
            positive_factors=["Active development", "Security certifications"]
        )
        assert score.score == 75
        assert score.confidence == "High"
        assert len(score.risk_factors) == 1
        assert len(score.positive_factors) == 2

    def test_score_range_validation(self):
        """Test that score must be between 0 and 100."""
        # Valid scores
        TrustScore(score=0, confidence="Low", rationale="Test")
        TrustScore(score=100, confidence="High", rationale="Test")

        # Invalid scores
        with pytest.raises(ValidationError):
            TrustScore(score=-1, confidence="Low", rationale="Test")

        with pytest.raises(ValidationError):
            TrustScore(score=101, confidence="High", rationale="Test")


class TestCVETrend:
    """Tests for CVETrend model."""

    def test_cve_trend_creation(self):
        """Test creating CVE trend data."""
        cve = CVETrend(
            total_cves=10,
            critical_count=2,
            high_count=3,
            medium_count=4,
            low_count=1,
            recent_cves=[{"id": "CVE-2023-1234", "severity": "HIGH"}],
            trend_summary="Moderate vulnerabilities"
        )
        assert cve.total_cves == 10
        assert cve.critical_count == 2
        assert cve.high_count == 3
        assert cve.medium_count == 4
        assert cve.low_count == 1
        assert len(cve.recent_cves) == 1

    def test_cve_trend_defaults(self):
        """Test default values for CVE trend."""
        cve = CVETrend()
        assert cve.total_cves == 0
        assert cve.critical_count == 0
        assert cve.high_count == 0
        assert cve.medium_count == 0
        assert cve.low_count == 0
        assert cve.recent_cves == []
        assert cve.trend_summary == "Insufficient public evidence"


class TestComplianceInfo:
    """Tests for ComplianceInfo model."""

    def test_compliance_info_creation(self):
        """Test creating compliance information."""
        compliance = ComplianceInfo(
            soc2_compliant=True,
            iso_certified=True,
            gdpr_compliant=True,
            data_processing_location="EU",
            encryption_at_rest=True,
            encryption_in_transit=True,
            data_retention_policy="90 days",
            notes="Fully compliant"
        )
        assert compliance.soc2_compliant is True
        assert compliance.iso_certified is True
        assert compliance.gdpr_compliant is True
        assert compliance.data_processing_location == "EU"
        assert compliance.encryption_at_rest is True
        assert compliance.encryption_in_transit is True
        assert compliance.data_retention_policy == "90 days"
        assert compliance.notes == "Fully compliant"


class TestCitationSource:
    """Tests for CitationSource model."""

    def test_citation_creation(self):
        """Test creating a citation source."""
        citation = CitationSource(
            url="https://example.com/security",
            source_type=SourceType.VENDOR_STATED,
            title="Security Documentation",
            date="2024-01-01",
            description="Vendor's security page"
        )
        assert citation.url == "https://example.com/security"
        assert citation.source_type == SourceType.VENDOR_STATED
        assert citation.title == "Security Documentation"
        assert citation.date == "2024-01-01"
        assert citation.description == "Vendor's security page"


class TestSoftwareCategory:
    """Tests for SoftwareCategory enum."""

    def test_category_values(self):
        """Test that all expected categories exist."""
        expected_categories = [
            "FILE_SHARING",
            "GENAI_TOOL",
            "PASSWORD_MANAGER",
            "COMPRESSION_UTILITY",
            "REMOTE_ACCESS",
            "COMMUNICATION",
            "SECURITY_TOOL"
        ]
        for category in expected_categories:
            assert hasattr(SoftwareCategory, category)

    def test_category_string_values(self):
        """Test category string representations."""
        assert SoftwareCategory.FILE_SHARING == "File Sharing"
        assert SoftwareCategory.PASSWORD_MANAGER == "Password Manager"
        assert SoftwareCategory.REMOTE_ACCESS == "Remote Access"


class TestAssessmentResponse:
    """Tests for AssessmentResponse model."""

    def test_complete_response_creation(self):
        """Test creating a complete assessment response."""
        response = AssessmentResponse(
            product_name="FileZilla",
            vendor=VendorInfo(name="Tim Kosse", reputation_summary="Good"),
            category=SoftwareCategory.FILE_SHARING,
            description="FTP client",
            usage_description="File transfers",
            cve_trends=CVETrend(),
            compliance=ComplianceInfo(),
            trust_score=TrustScore(score=70, confidence="Medium", rationale="Test"),
            assessment_timestamp=datetime.utcnow()
        )
        assert response.product_name == "FileZilla"
        assert response.vendor.name == "Tim Kosse"
        assert response.category == SoftwareCategory.FILE_SHARING
        assert response.trust_score.score == 70
        assert isinstance(response.assessment_timestamp, datetime)

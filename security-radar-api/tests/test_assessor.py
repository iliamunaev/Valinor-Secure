"""
Unit tests for SecurityAssessor
"""

import pytest
from src.assessor import SecurityAssessor
from src.models import SoftwareCategory


class TestSecurityAssessor:
    """Tests for SecurityAssessor class."""

    def test_assessor_initialization(self, cache_service):
        """Test that assessor initializes correctly."""
        assessor = SecurityAssessor(cache_service)
        assert assessor.cache_service == cache_service

    def test_generate_cache_key(self, assessor, sample_request):
        """Test cache key generation from request."""
        key = assessor.generate_cache_key(sample_request)
        assert isinstance(key, str)
        assert len(key) == 64  # SHA256 hex length

    def test_generate_cache_key_consistency(self, assessor, sample_request):
        """Test that same request generates same cache key."""
        key1 = assessor.generate_cache_key(sample_request)
        key2 = assessor.generate_cache_key(sample_request)
        assert key1 == key2

    @pytest.mark.asyncio
    async def test_assess_basic(self, assessor, sample_request):
        """Test basic assessment functionality."""
        result = await assessor.assess(sample_request)

        # Verify response structure
        assert result.product_name == sample_request.product_name
        assert result.vendor.name == sample_request.company_name
        assert result.category is not None
        assert result.trust_score is not None
        assert result.cve_trends is not None
        assert result.compliance is not None
        assert result.cache_key is not None

    @pytest.mark.asyncio
    async def test_assess_sets_cache_key(self, assessor, sample_request):
        """Test that assessment includes cache key."""
        result = await assessor.assess(sample_request)
        expected_key = assessor.generate_cache_key(sample_request)
        assert result.cache_key == expected_key

    @pytest.mark.asyncio
    async def test_assess_multiple_products(self, assessor, sample_requests):
        """Test assessing multiple different products."""
        results = []
        for request in sample_requests:
            result = await assessor.assess(request)
            results.append(result)

        # Verify all assessments completed
        assert len(results) == len(sample_requests)

        # Verify each has unique cache key
        cache_keys = [r.cache_key for r in results]
        assert len(cache_keys) == len(set(cache_keys))  # All unique


class TestSoftwareClassification:
    """Tests for software classification logic."""

    def test_classify_password_manager(self, assessor):
        """Test classification of password managers."""
        assert assessor._classify_software("1Password") == SoftwareCategory.PASSWORD_MANAGER
        assert assessor._classify_software("LastPass") == SoftwareCategory.PASSWORD_MANAGER
        assert assessor._classify_software("KeePass") == SoftwareCategory.PASSWORD_MANAGER
        assert assessor._classify_software("Dashlane") == SoftwareCategory.PASSWORD_MANAGER

    def test_classify_compression_utility(self, assessor):
        """Test classification of compression utilities."""
        assert assessor._classify_software("7-Zip") == SoftwareCategory.COMPRESSION_UTILITY
        assert assessor._classify_software("WinRAR") == SoftwareCategory.COMPRESSION_UTILITY
        assert assessor._classify_software("PeaZip") == SoftwareCategory.COMPRESSION_UTILITY
        assert assessor._classify_software("Bandizip") == SoftwareCategory.COMPRESSION_UTILITY

    def test_classify_file_sharing(self, assessor):
        """Test classification of file sharing tools."""
        assert assessor._classify_software("FileZilla") == SoftwareCategory.FILE_SHARING
        assert assessor._classify_software("WinSCP") == SoftwareCategory.FILE_SHARING

    def test_classify_remote_access(self, assessor):
        """Test classification of remote access tools."""
        assert assessor._classify_software("TeamViewer") == SoftwareCategory.REMOTE_ACCESS
        assert assessor._classify_software("AnyDesk") == SoftwareCategory.REMOTE_ACCESS
        assert assessor._classify_software("VNC Server") == SoftwareCategory.REMOTE_ACCESS

    def test_classify_communication(self, assessor):
        """Test classification of communication tools."""
        assert assessor._classify_software("Slack") == SoftwareCategory.COMMUNICATION
        assert assessor._classify_software("Zoom") == SoftwareCategory.COMMUNICATION
        assert assessor._classify_software("Discord") == SoftwareCategory.COMMUNICATION
        assert assessor._classify_software("Skype") == SoftwareCategory.COMMUNICATION

    def test_classify_development_tool(self, assessor):
        """Test classification of development tools."""
        assert assessor._classify_software("Postman") == SoftwareCategory.DEVELOPMENT_TOOL
        assert assessor._classify_software("Insomnia") == SoftwareCategory.DEVELOPMENT_TOOL

    def test_classify_security_tool(self, assessor):
        """Test classification of security tools."""
        assert assessor._classify_software("Malwarebytes") == SoftwareCategory.SECURITY_TOOL
        assert assessor._classify_software("VeraCrypt") == SoftwareCategory.SECURITY_TOOL
        assert assessor._classify_software("BitLocker") == SoftwareCategory.SECURITY_TOOL

    def test_classify_virtualization(self, assessor):
        """Test classification of virtualization tools."""
        assert assessor._classify_software("VirtualBox") == SoftwareCategory.VIRTUALIZATION
        assert assessor._classify_software("QEMU") == SoftwareCategory.VIRTUALIZATION

    def test_classify_office_suite(self, assessor):
        """Test classification of office suites."""
        assert assessor._classify_software("WPS Office") == SoftwareCategory.OFFICE_SUITE

    def test_classify_gaming(self, assessor):
        """Test classification of gaming platforms."""
        assert assessor._classify_software("Steam Client") == SoftwareCategory.GAMING
        assert assessor._classify_software("Origin") == SoftwareCategory.GAMING

    def test_classify_backup_storage(self, assessor):
        """Test classification of backup/storage tools."""
        assert assessor._classify_software("Dropbox") == SoftwareCategory.BACKUP_STORAGE
        assert assessor._classify_software("OneDrive") == SoftwareCategory.BACKUP_STORAGE

    def test_classify_browser(self, assessor):
        """Test classification of browsers."""
        assert assessor._classify_software("Tor Browser") == SoftwareCategory.BROWSER

    def test_classify_unknown(self, assessor):
        """Test classification of unknown software."""
        assert assessor._classify_software("UnknownSoftwareXYZ123") == SoftwareCategory.OTHER

    def test_classify_case_insensitive(self, assessor):
        """Test that classification is case-insensitive."""
        assert assessor._classify_software("FILEZILLA") == SoftwareCategory.FILE_SHARING
        assert assessor._classify_software("filezilla") == SoftwareCategory.FILE_SHARING
        assert assessor._classify_software("FileZilla") == SoftwareCategory.FILE_SHARING


class TestTrustScoreCalculation:
    """Tests for trust score calculation logic."""

    def test_calculate_trust_score_baseline(self, assessor):
        """Test baseline trust score calculation."""
        score = assessor._calculate_trust_score(
            cve_count=0,
            critical_cves=0,
            has_incidents=False,
            compliance_score=50
        )
        assert score == 50  # Base score

    def test_calculate_trust_score_with_cves(self, assessor):
        """Test trust score decreases with CVEs."""
        baseline = assessor._calculate_trust_score(0, 0, False, 50)
        with_cves = assessor._calculate_trust_score(5, 0, False, 50)
        assert with_cves < baseline

    def test_calculate_trust_score_with_critical_cves(self, assessor):
        """Test trust score decreases more with critical CVEs."""
        with_cves = assessor._calculate_trust_score(5, 0, False, 50)
        with_critical = assessor._calculate_trust_score(5, 2, False, 50)
        assert with_critical < with_cves

    def test_calculate_trust_score_with_incidents(self, assessor):
        """Test trust score decreases with incidents."""
        without_incidents = assessor._calculate_trust_score(0, 0, False, 50)
        with_incidents = assessor._calculate_trust_score(0, 0, True, 50)
        assert with_incidents < without_incidents

    def test_calculate_trust_score_with_compliance(self, assessor):
        """Test trust score increases with good compliance."""
        low_compliance = assessor._calculate_trust_score(0, 0, False, 30)
        high_compliance = assessor._calculate_trust_score(0, 0, False, 80)
        assert high_compliance > low_compliance

    def test_calculate_trust_score_bounds(self, assessor):
        """Test that trust score stays within 0-100 bounds."""
        # Very bad scenario
        very_bad = assessor._calculate_trust_score(100, 50, True, 0)
        assert 0 <= very_bad <= 100

        # Very good scenario
        very_good = assessor._calculate_trust_score(0, 0, False, 100)
        assert 0 <= very_good <= 100

    def test_calculate_trust_score_returns_int(self, assessor):
        """Test that trust score returns an integer."""
        score = assessor._calculate_trust_score(5, 2, False, 50)
        assert isinstance(score, int)

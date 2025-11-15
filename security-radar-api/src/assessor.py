"""
Security Assessor service - Core assessment logic
"""

from typing import Optional
from datetime import datetime
import hashlib

from .models import (
    AssessmentRequest,
    AssessmentResponse,
    VendorInfo,
    SoftwareCategory,
    CVETrend,
    ComplianceInfo,
    TrustScore,
    AlternativeSuggestion,
    CitationSource,
    SourceType,
    IncidentReport
)
from .cache_service import CacheService


class SecurityAssessor:
    """
    Core security assessment engine.

    This is a placeholder implementation that returns basic assessments.
    In a full implementation, this would:
    - Query CVE databases
    - Fetch vendor security pages
    - Analyze compliance documentation
    - Search for security incidents
    - Generate trust scores based on multiple signals
    """

    def __init__(self, cache_service: CacheService):
        """Initialize the assessor with cache service."""
        self.cache_service = cache_service

    def generate_cache_key(self, request: AssessmentRequest) -> str:
        """Generate cache key from request."""
        return self.cache_service.generate_key(
            product_name=request.product_name,
            company_name=request.company_name,
            sha1=request.sha1,
            url=request.url
        )

    async def assess(self, request: AssessmentRequest) -> AssessmentResponse:
        """
        Perform comprehensive security assessment.

        This is a skeleton implementation that returns a basic structure.
        A full implementation would include:
        1. Entity resolution via web search
        2. CVE database queries
        3. CISA KEV checks
        4. Vendor security page analysis
        5. Compliance documentation review
        6. Incident/breach history search
        7. Trust score calculation
        """

        # Generate cache key
        cache_key = self.generate_cache_key(request)

        # Basic vendor info
        vendor = VendorInfo(
            name=request.company_name or "Unknown",
            website=request.url,
            reputation_summary="Insufficient public evidence for comprehensive assessment"
        )

        # Default category classification
        category = self._classify_software(request.product_name)

        # Basic CVE trends (placeholder)
        cve_trends = CVETrend(
            total_cves=0,
            critical_count=0,
            high_count=0,
            medium_count=0,
            low_count=0,
            recent_cves=[],
            trend_summary="Insufficient public evidence - no CVE data available"
        )

        # Compliance info (placeholder)
        compliance = ComplianceInfo(
            soc2_compliant=None,
            iso_certified=None,
            gdpr_compliant=None,
            data_processing_location=None,
            encryption_at_rest=None,
            encryption_in_transit=None,
            data_retention_policy=None,
            notes="Insufficient public evidence for compliance assessment"
        )

        # Trust score (conservative default)
        trust_score = TrustScore(
            score=50,
            confidence="Low",
            rationale="Insufficient public evidence for comprehensive trust assessment. This is a placeholder score.",
            risk_factors=["Limited public security documentation"],
            positive_factors=[]
        )

        # Build response
        assessment = AssessmentResponse(
            product_name=request.product_name,
            vendor=vendor,
            category=category,
            description=f"{request.product_name} - Security assessment pending full implementation",
            usage_description="Usage information requires web research and documentation analysis",
            cve_trends=cve_trends,
            incidents=[],
            compliance=compliance,
            deployment_model="Unknown",
            admin_controls="Requires product documentation review",
            trust_score=trust_score,
            alternatives=[],
            citations=[
                CitationSource(
                    source_type=SourceType.VENDOR_STATED,
                    title="Assessment Note",
                    description="This is a skeleton implementation. Full assessment requires integration with CVE databases, vendor security pages, and compliance documentation."
                )
            ],
            assessment_timestamp=datetime.utcnow(),
            cache_key=cache_key
        )

        return assessment

    def _classify_software(self, product_name: str) -> SoftwareCategory:
        """
        Classify software into taxonomy categories.

        This is a simple keyword-based classifier.
        A full implementation would use more sophisticated methods.
        """
        product_lower = product_name.lower()

        # Keyword mapping
        keywords = {
            SoftwareCategory.PASSWORD_MANAGER: ["password", "keepass", "1password", "lastpass", "dashlane"],
            SoftwareCategory.COMPRESSION_UTILITY: ["zip", "7-zip", "winrar", "peazip", "bandizip"],
            SoftwareCategory.FILE_SHARING: ["filezilla", "ftp", "winscp"],
            SoftwareCategory.REMOTE_ACCESS: ["teamviewer", "anydesk", "vnc", "rdp", "supremo", "ammyy"],
            SoftwareCategory.COMMUNICATION: ["slack", "skype", "zoom", "discord", "teams"],
            SoftwareCategory.DEVELOPMENT_TOOL: ["git", "postman", "insomnia", "atom", "ultraedit"],
            SoftwareCategory.SECURITY_TOOL: ["malwarebytes", "hitmanpro", "antispyware", "veracrypt", "bitlocker", "cryptomator"],
            SoftwareCategory.MEDIA_PLAYER: ["vlc", "gom", "potplayer", "wavpad"],
            SoftwareCategory.VIRTUALIZATION: ["virtualbox", "vmware", "qemu"],
            SoftwareCategory.OFFICE_SUITE: ["office", "wps", "docuworks"],
            SoftwareCategory.GAMING: ["steam", "origin", "ubisoft", "gog", "riot", "plarium"],
            SoftwareCategory.BACKUP_STORAGE: ["dropbox", "onedrive", "backup"],
            SoftwareCategory.BROWSER: ["chrome", "firefox", "edge", "tor browser"],
        }

        for category, terms in keywords.items():
            if any(term in product_lower for term in terms):
                return category

        return SoftwareCategory.OTHER

    def _calculate_trust_score(self, cve_count: int, critical_cves: int,
                               has_incidents: bool, compliance_score: int) -> int:
        """
        Calculate trust score based on multiple factors.

        Args:
            cve_count: Total CVE count
            critical_cves: Number of critical CVEs
            has_incidents: Whether there are known incidents
            compliance_score: Compliance rating (0-100)

        Returns:
            Trust score (0-100)
        """
        # Start with base score
        score = 50

        # Adjust for CVEs
        if cve_count > 0:
            score -= min(cve_count * 2, 20)
            score -= min(critical_cves * 5, 20)

        # Adjust for incidents
        if has_incidents:
            score -= 15

        # Adjust for compliance
        score += (compliance_score - 50) * 0.3

        # Clamp to valid range
        return max(0, min(100, int(score)))

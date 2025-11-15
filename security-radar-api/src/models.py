"""
Pydantic models for the AI Security Assessor API
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class SoftwareCategory(str, Enum):
    """Software taxonomy categories"""
    FILE_SHARING = "File Sharing"
    GENAI_TOOL = "GenAI Tool"
    SAAS_CRM = "SaaS CRM"
    ENDPOINT_AGENT = "Endpoint Agent"
    PASSWORD_MANAGER = "Password Manager"
    COMPRESSION_UTILITY = "Compression Utility"
    REMOTE_ACCESS = "Remote Access"
    DEVELOPMENT_TOOL = "Development Tool"
    COMMUNICATION = "Communication"
    SECURITY_TOOL = "Security Tool"
    MEDIA_PLAYER = "Media Player"
    VIRTUALIZATION = "Virtualization"
    OFFICE_SUITE = "Office Suite"
    GAMING = "Gaming"
    BACKUP_STORAGE = "Backup/Storage"
    BROWSER = "Browser"
    OTHER = "Other"


class SourceType(str, Enum):
    """Types of information sources"""
    VENDOR_STATED = "Vendor Stated"
    INDEPENDENT = "Independent"
    CERT = "CERT"
    CVE_DATABASE = "CVE Database"
    CISA_KEV = "CISA KEV"
    SOC2 = "SOC2"
    ISO = "ISO"
    BUG_BOUNTY = "Bug Bounty"
    PUBLIC_DISCLOSURE = "Public Disclosure"


class CitationSource(BaseModel):
    """Citation information for claims"""
    url: Optional[str] = None
    source_type: SourceType
    title: str
    date: Optional[str] = None
    description: Optional[str] = None


class CVETrend(BaseModel):
    """CVE trend summary"""
    total_cves: int = Field(default=0, description="Total number of CVEs")
    critical_count: int = Field(default=0, description="Number of critical CVEs")
    high_count: int = Field(default=0, description="Number of high severity CVEs")
    medium_count: int = Field(default=0, description="Number of medium severity CVEs")
    low_count: int = Field(default=0, description="Number of low severity CVEs")
    recent_cves: List[Dict[str, str]] = Field(default_factory=list, description="Recent notable CVEs")
    trend_summary: str = Field(default="Insufficient public evidence", description="Overall trend description")


class IncidentReport(BaseModel):
    """Security incident or abuse signal"""
    date: Optional[str] = None
    description: str
    severity: str
    source: CitationSource


class ComplianceInfo(BaseModel):
    """Compliance and data handling information"""
    soc2_compliant: Optional[bool] = None
    iso_certified: Optional[bool] = None
    gdpr_compliant: Optional[bool] = None
    data_processing_location: Optional[str] = None
    encryption_at_rest: Optional[bool] = None
    encryption_in_transit: Optional[bool] = None
    data_retention_policy: Optional[str] = None
    notes: str = Field(default="Insufficient public evidence")


class TrustScore(BaseModel):
    """Trust/Risk score with rationale"""
    score: int = Field(ge=0, le=100, description="Trust score from 0-100")
    confidence: str = Field(description="Confidence level: High, Medium, Low")
    rationale: str = Field(description="Explanation of the score")
    risk_factors: List[str] = Field(default_factory=list)
    positive_factors: List[str] = Field(default_factory=list)


class AlternativeSuggestion(BaseModel):
    """Safer alternative product suggestion"""
    product_name: str
    vendor: str
    rationale: str
    trust_score: Optional[int] = None


class VendorInfo(BaseModel):
    """Resolved vendor identity"""
    name: str
    website: Optional[str] = None
    country: Optional[str] = None
    founded: Optional[str] = None
    reputation_summary: str = Field(default="Insufficient public evidence")


class AssessmentRequest(BaseModel):
    """Request model for application assessment"""
    product_name: str = Field(..., description="Name of the software product")
    company_name: Optional[str] = Field(None, description="Vendor/company name")
    url: Optional[str] = Field(None, description="Product or vendor URL")
    sha1: Optional[str] = Field(None, description="SHA-1 hash of binary")
    force_refresh: bool = Field(default=False, description="Force refresh from cache")

    class Config:
        json_schema_extra = {
            "example": {
                "product_name": "FileZilla",
                "company_name": "Tim Kosse",
                "sha1": "e94803128b6368b5c2c876a782b1e88346356844"
            }
        }


class AssessmentResponse(BaseModel):
    """Comprehensive security assessment response"""
    # Entity Resolution
    product_name: str
    vendor: VendorInfo

    # Classification
    category: SoftwareCategory
    description: str

    # Security Posture
    usage_description: str
    cve_trends: CVETrend
    incidents: List[IncidentReport] = Field(default_factory=list)
    compliance: ComplianceInfo

    # Deployment & Admin Controls
    deployment_model: Optional[str] = Field(None, description="Cloud/On-premise/Hybrid")
    admin_controls: Optional[str] = Field(None, description="Available admin controls")

    # Trust Score
    trust_score: TrustScore

    # Alternatives
    alternatives: List[AlternativeSuggestion] = Field(default_factory=list)

    # Citations
    citations: List[CitationSource] = Field(default_factory=list)

    # Metadata
    assessment_timestamp: datetime = Field(default_factory=datetime.utcnow)
    cache_key: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "product_name": "FileZilla",
                "vendor": {
                    "name": "Tim Kosse",
                    "website": "https://filezilla-project.org",
                    "reputation_summary": "Long-standing open-source FTP client developer"
                },
                "category": "File Sharing",
                "description": "Free FTP client for file transfers",
                "usage_description": "Used for transferring files via FTP/SFTP protocols",
                "trust_score": {
                    "score": 65,
                    "confidence": "Medium",
                    "rationale": "Established open-source project with some security concerns",
                    "risk_factors": ["Past bundled adware concerns"],
                    "positive_factors": ["Open source", "Long history", "Active development"]
                }
            }
        }

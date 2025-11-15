"""
Security Assessor service - Core assessment logic
"""

from typing import Optional
from datetime import datetime
import hashlib
import json
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

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
from .config import settings
from .request_logger import get_logger
import time


class SecurityAssessor:
    """
    Core security assessment engine.

    Uses LLM APIs to generate comprehensive security assessments.
    This implementation:
    - Uses OpenAI or Anthropic APIs based on model selection
    - Generates detailed security assessments
    - Analyzes CVE trends, compliance, and trust scores
    - Provides alternative suggestions
    """

    def __init__(self, cache_service: CacheService):
        """Initialize the assessor with cache service."""
        self.cache_service = cache_service
        self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        self.anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None
        self.logger = get_logger() if settings.enable_request_logging else None

    def generate_cache_key(self, request: AssessmentRequest) -> str:
        """Generate cache key from request."""
        return self.cache_service.generate_key(
            product_name=request.product_name,
            company_name=request.company_name,
            sha1=request.sha1,
            url=request.url
        )

    async def assess(self, request: AssessmentRequest, request_id: Optional[str] = None) -> AssessmentResponse:
        """
        Perform comprehensive security assessment using LLM APIs.

        This implementation:
        1. Determines which LLM to use based on model parameter
        2. Generates comprehensive assessment using LLM
        3. Parses structured response
        4. Returns complete security assessment
        """

        # Generate cache key
        cache_key = self.generate_cache_key(request)

        # Determine which model to use
        model = request.model or settings.llm_model

        # Create the assessment prompt
        prompt = self._create_assessment_prompt(request)

        # Call the appropriate LLM and log the interaction
        start_time = time.time()
        llm_response = await self._call_llm(model, prompt)
        duration_ms = (time.time() - start_time) * 1000

        # Log LLM interaction if logging is enabled
        if self.logger and request_id:
            self.logger.log_llm_interaction(
                request_id=request_id,
                model=model,
                prompt=prompt,
                response=llm_response,
                duration_ms=duration_ms
            )

        # Parse the LLM response and create assessment
        assessment = self._parse_llm_response(llm_response, request, cache_key)

        return assessment

    def _create_assessment_prompt(self, request: AssessmentRequest) -> str:
        """Create a comprehensive assessment prompt for the LLM."""
        prompt = f"""You are a cybersecurity expert conducting a comprehensive security assessment for software used in an enterprise environment.

Product Information:
- Product Name: {request.product_name}
- Company/Vendor: {request.company_name or 'Unknown'}
- URL: {request.url or 'Not provided'}
- SHA1 Hash: {request.sha1 or 'Not provided'}

Please provide a comprehensive security assessment in JSON format with the following structure:

{{
  "vendor": {{
    "name": "Vendor name",
    "website": "Vendor website URL",
    "country": "Country of origin",
    "founded": "Year founded or null",
    "reputation_summary": "Brief vendor reputation summary"
  }},
  "category": "Software category from: File Sharing, GenAI Tool, SaaS CRM, Endpoint Agent, Password Manager, Compression Utility, Remote Access, Development Tool, Communication, Security Tool, Media Player, Virtualization, Office Suite, Gaming, Backup/Storage, Browser, Other",
  "description": "Brief product description",
  "usage_description": "How this product is typically used",
  "cve_trends": {{
    "total_cves": 0,
    "critical_count": 0,
    "high_count": 0,
    "medium_count": 0,
    "low_count": 0,
    "recent_cves": [
      {{
        "id": "CVE-YYYY-XXXXX",
        "severity": "Critical/High/Medium/Low",
        "description": "Brief description"
      }}
    ],
    "trend_summary": "Overall CVE trend analysis"
  }},
  "incidents": [
    {{
      "date": "YYYY-MM-DD",
      "description": "Incident description",
      "severity": "Critical/High/Medium/Low",
      "source_type": "Public Disclosure",
      "source_url": "URL",
      "source_title": "Source title"
    }}
  ],
  "compliance": {{
    "soc2_compliant": true/false/null,
    "iso_certified": true/false/null,
    "gdpr_compliant": true/false/null,
    "data_processing_location": "Location or null",
    "encryption_at_rest": true/false/null,
    "encryption_in_transit": true/false/null,
    "data_retention_policy": "Policy description or null",
    "notes": "Additional compliance notes"
  }},
  "deployment_model": "Cloud/On-premise/Hybrid/Unknown",
  "admin_controls": "Description of available admin controls",
  "trust_score": {{
    "score": 0-100,
    "confidence": "High/Medium/Low",
    "rationale": "Explanation of the score",
    "risk_factors": ["Risk factor 1", "Risk factor 2"],
    "positive_factors": ["Positive factor 1", "Positive factor 2"]
  }},
  "alternatives": [
    {{
      "product_name": "Alternative product name",
      "vendor": "Vendor",
      "rationale": "Why this is a safer alternative",
      "trust_score": 0-100
    }}
  ],
  "citations": [
    {{
      "url": "Source URL",
      "source_type": "Vendor Stated/Independent/CERT/CVE Database/etc.",
      "title": "Source title",
      "date": "YYYY-MM-DD or null",
      "description": "Brief description"
    }}
  ]
}}

Important guidelines:
1. Provide accurate, factual information based on your knowledge
2. For trust scores, consider: CVE history, security incidents, vendor reputation, compliance certifications, update frequency
3. If information is uncertain, indicate with null values or "Unknown"
4. Include relevant citations for key claims
5. Be objective and balanced in your assessment
6. Focus on enterprise security concerns

Return ONLY the JSON object, no additional text or explanation."""
        return prompt

    async def _call_llm(self, model: str, prompt: str) -> str:
        """Call the appropriate LLM based on the model name."""
        # Determine if it's an Anthropic or OpenAI model
        is_anthropic = any(x in model.lower() for x in ['claude', 'anthropic'])

        if is_anthropic:
            if not self.anthropic_client:
                raise ValueError("Anthropic API key not configured")

            # Call Anthropic API
            response = await self.anthropic_client.messages.create(
                model=model,
                max_tokens=4096,
                temperature=settings.llm_temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.content[0].text
        else:
            if not self.openai_client:
                raise ValueError("OpenAI API key not configured")

            # Call OpenAI API
            response = await self.openai_client.chat.completions.create(
                model=model,
                temperature=settings.llm_temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content

    def _parse_llm_response(self, llm_response: str, request: AssessmentRequest, cache_key: str) -> AssessmentResponse:
        """Parse the LLM JSON response and create an AssessmentResponse."""
        try:
            # Parse JSON response
            data = json.loads(llm_response)

            # Build vendor info
            vendor_data = data.get("vendor", {})
            vendor = VendorInfo(
                name=vendor_data.get("name", request.company_name or "Unknown"),
                website=vendor_data.get("website"),
                country=vendor_data.get("country"),
                founded=vendor_data.get("founded"),
                reputation_summary=vendor_data.get("reputation_summary", "Insufficient public evidence")
            )

            # Parse category
            category_str = data.get("category", "Other")
            try:
                category = SoftwareCategory(category_str)
            except ValueError:
                category = self._classify_software(request.product_name)

            # Parse CVE trends
            cve_data = data.get("cve_trends", {})
            cve_trends = CVETrend(
                total_cves=cve_data.get("total_cves", 0),
                critical_count=cve_data.get("critical_count", 0),
                high_count=cve_data.get("high_count", 0),
                medium_count=cve_data.get("medium_count", 0),
                low_count=cve_data.get("low_count", 0),
                recent_cves=cve_data.get("recent_cves", []),
                trend_summary=cve_data.get("trend_summary", "No CVE data available")
            )

            # Parse compliance
            compliance_data = data.get("compliance", {})
            compliance = ComplianceInfo(
                soc2_compliant=compliance_data.get("soc2_compliant"),
                iso_certified=compliance_data.get("iso_certified"),
                gdpr_compliant=compliance_data.get("gdpr_compliant"),
                data_processing_location=compliance_data.get("data_processing_location"),
                encryption_at_rest=compliance_data.get("encryption_at_rest"),
                encryption_in_transit=compliance_data.get("encryption_in_transit"),
                data_retention_policy=compliance_data.get("data_retention_policy"),
                notes=compliance_data.get("notes", "Insufficient public evidence")
            )

            # Parse trust score
            trust_data = data.get("trust_score", {})
            trust_score = TrustScore(
                score=trust_data.get("score", 50),
                confidence=trust_data.get("confidence", "Low"),
                rationale=trust_data.get("rationale", "Assessment based on available information"),
                risk_factors=trust_data.get("risk_factors", []),
                positive_factors=trust_data.get("positive_factors", [])
            )

            # Parse incidents
            incidents = []
            for incident_data in data.get("incidents", []):
                source_data = CitationSource(
                    url=incident_data.get("source_url"),
                    source_type=SourceType.PUBLIC_DISCLOSURE,
                    title=incident_data.get("source_title", "Security Incident"),
                    date=incident_data.get("date"),
                    description=incident_data.get("description")
                )
                incident = IncidentReport(
                    date=incident_data.get("date"),
                    description=incident_data.get("description", ""),
                    severity=incident_data.get("severity", "Unknown"),
                    source=source_data
                )
                incidents.append(incident)

            # Parse alternatives
            alternatives = []
            for alt_data in data.get("alternatives", []):
                alternative = AlternativeSuggestion(
                    product_name=alt_data.get("product_name", ""),
                    vendor=alt_data.get("vendor", ""),
                    rationale=alt_data.get("rationale", ""),
                    trust_score=alt_data.get("trust_score")
                )
                alternatives.append(alternative)

            # Parse citations
            citations = []
            for citation_data in data.get("citations", []):
                try:
                    source_type = SourceType(citation_data.get("source_type", "Independent"))
                except ValueError:
                    source_type = SourceType.INDEPENDENT

                citation = CitationSource(
                    url=citation_data.get("url"),
                    source_type=source_type,
                    title=citation_data.get("title", "Source"),
                    date=citation_data.get("date"),
                    description=citation_data.get("description")
                )
                citations.append(citation)

            # Build complete assessment
            assessment = AssessmentResponse(
                product_name=request.product_name,
                vendor=vendor,
                category=category,
                description=data.get("description", f"{request.product_name} security assessment"),
                usage_description=data.get("usage_description", "Usage information not available"),
                cve_trends=cve_trends,
                incidents=incidents,
                compliance=compliance,
                deployment_model=data.get("deployment_model"),
                admin_controls=data.get("admin_controls"),
                trust_score=trust_score,
                alternatives=alternatives,
                citations=citations,
                assessment_timestamp=datetime.utcnow(),
                cache_key=cache_key
            )

            return assessment

        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # If parsing fails, return a minimal assessment with error info
            return AssessmentResponse(
                product_name=request.product_name,
                vendor=VendorInfo(
                    name=request.company_name or "Unknown",
                    website=request.url,
                    reputation_summary="Assessment parsing error"
                ),
                category=self._classify_software(request.product_name),
                description=f"Error parsing LLM response: {str(e)}",
                usage_description="Unable to generate assessment",
                cve_trends=CVETrend(
                    total_cves=0,
                    critical_count=0,
                    high_count=0,
                    medium_count=0,
                    low_count=0,
                    recent_cves=[],
                    trend_summary="Assessment error"
                ),
                incidents=[],
                compliance=ComplianceInfo(
                    soc2_compliant=None,
                    iso_certified=None,
                    gdpr_compliant=None,
                    data_processing_location=None,
                    encryption_at_rest=None,
                    encryption_in_transit=None,
                    data_retention_policy=None,
                    notes="Assessment error"
                ),
                deployment_model="Unknown",
                admin_controls="Unknown",
                trust_score=TrustScore(
                    score=50,
                    confidence="Low",
                    rationale=f"Error generating assessment: {str(e)}",
                    risk_factors=["Assessment error"],
                    positive_factors=[]
                ),
                alternatives=[],
                citations=[
                    CitationSource(
                        source_type=SourceType.VENDOR_STATED,
                        title="Assessment Error",
                        description=f"Failed to parse LLM response: {str(e)}"
                    )
                ],
                assessment_timestamp=datetime.utcnow(),
                cache_key=cache_key
            )

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

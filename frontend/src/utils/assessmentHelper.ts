import { API_ENDPOINTS } from '../config/api';

interface AssessmentRequest {
  product_name: string;
  company_name?: string;
  url?: string;
  model?: string;
}

interface TrustScore {
  score: number;
  confidence: string;
  rationale: string;
  risk_factors: string[];
  positive_factors: string[];
}

interface VendorInfo {
  name: string;
  website?: string;
  country?: string;
  founded?: string;
  reputation_summary: string;
}

interface CVETrend {
  total_cves: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  trend_summary: string;
}

interface ComplianceInfo {
  soc2_compliant: boolean;
  iso_certified: boolean;
  gdpr_compliant: boolean;
  encryption_at_rest: boolean;
  encryption_in_transit: boolean;
  notes: string;
}

interface AssessmentResponse {
  product_name: string;
  vendor: VendorInfo;
  category: string;
  description: string;
  usage_description: string;
  cve_trends: CVETrend;
  compliance: ComplianceInfo;
  trust_score: TrustScore;
  assessment_timestamp: string;
}

/**
 * Parse user message to extract assessment request details
 */
export function parseAssessmentRequest(message: string): AssessmentRequest | null {
  const messageLower = message.toLowerCase();

  // Check if message is asking for an assessment
  const assessmentKeywords = ['assess', 'analyze', 'evaluate', 'check', 'review', 'security'];
  const hasAssessmentIntent = assessmentKeywords.some(keyword => messageLower.includes(keyword));

  if (!hasAssessmentIntent) {
    return null;
  }

  // Extract product name - common patterns
  const patterns = [
    // Match: "check facebook.com" or "check Slack"
    /(?:assess|analyze|evaluate|check|review)\s+([a-zA-Z0-9][a-zA-Z0-9\s\.\-]+?)(?:\s+for|\s+security|\s*$)/i,
    /(?:what|how)\s+(?:about|is)\s+([a-zA-Z0-9][a-zA-Z0-9\s\.\-]+?)(?:\s+security|\?|\s*$)/i,
    /security\s+(?:of|for)\s+([a-zA-Z0-9][a-zA-Z0-9\s\.\-]+?)(?:\?|\s*$)/i,
  ];

  let productName = '';
  let companyName = '';

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      productName = match[1].trim();
      break;
    }
  }

  // If no pattern matched, look for words (capitalized or lowercase domains)
  if (!productName) {
    // Try to find a domain-like pattern first
    const domainMatch = message.match(/\b([a-z0-9]+(?:\.[a-z0-9]+)+)\b/i);
    if (domainMatch) {
      productName = domainMatch[1];
    } else {
      // Fall back to capitalized words
      const capitalizedWords = message.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g);
      if (capitalizedWords && capitalizedWords.length > 0) {
        productName = capitalizedWords[0];
      }
    }
  }

  if (!productName) {
    return null;
  }

  return {
    product_name: productName,
    company_name: companyName || undefined,
    // Model will be set by user selection in ChatPanel
  };
}

/**
 * Call the security radar API to assess a product
 * Falls back to mock endpoint if the real API fails
 */
export async function assessProduct(request: AssessmentRequest): Promise<AssessmentResponse> {
  // Try the real security-radar-api
  const response = await fetch(API_ENDPOINTS.SECURITY_RADAR_ASSESS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || `API error: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * Format assessment response into readable chat message
 */
export function formatAssessmentResponse(assessment: AssessmentResponse): string {
  const trustScoreEmoji = assessment.trust_score.score >= 80 ? '✅' :
                         assessment.trust_score.score >= 60 ? '⚠️' : '❌';

  const lines: string[] = [
    `## Security Assessment: ${assessment.product_name}`,
    '',
    `**Vendor**: ${assessment.vendor.name}`,
    assessment.vendor.website ? `**Website**: ${assessment.vendor.website}` : '',
    `**Category**: ${assessment.category}`,
    '',
    `### ${trustScoreEmoji} Trust Score: ${assessment.trust_score.score}/100`,
    `**Confidence**: ${assessment.trust_score.confidence}`,
    '',
    `**Rationale**: ${assessment.trust_score.rationale}`,
    '',
  ];

  if (assessment.trust_score.positive_factors.length > 0) {
    lines.push('**Positive Factors**:');
    assessment.trust_score.positive_factors.forEach(factor => {
      lines.push(`• ${factor}`);
    });
    lines.push('');
  }

  if (assessment.trust_score.risk_factors.length > 0) {
    lines.push('**Risk Factors**:');
    assessment.trust_score.risk_factors.forEach(factor => {
      lines.push(`• ${factor}`);
    });
    lines.push('');
  }

  // CVE Information
  if (assessment.cve_trends.total_cves > 0) {
    lines.push('### CVE Trends');
    lines.push(`**Total CVEs**: ${assessment.cve_trends.total_cves}`);
    if (assessment.cve_trends.critical_count > 0) {
      lines.push(`• Critical: ${assessment.cve_trends.critical_count}`);
    }
    if (assessment.cve_trends.high_count > 0) {
      lines.push(`• High: ${assessment.cve_trends.high_count}`);
    }
    if (assessment.cve_trends.medium_count > 0) {
      lines.push(`• Medium: ${assessment.cve_trends.medium_count}`);
    }
    lines.push('');
  }

  // Compliance
  lines.push('### Compliance');
  lines.push(`• SOC2: ${assessment.compliance.soc2_compliant ? '✓' : '✗'}`);
  lines.push(`• ISO Certified: ${assessment.compliance.iso_certified ? '✓' : '✗'}`);
  lines.push(`• GDPR Compliant: ${assessment.compliance.gdpr_compliant ? '✓' : '✗'}`);
  lines.push(`• Encryption at Rest: ${assessment.compliance.encryption_at_rest ? '✓' : '✗'}`);
  lines.push(`• Encryption in Transit: ${assessment.compliance.encryption_in_transit ? '✓' : '✗'}`);
  lines.push('');

  lines.push(`*Assessment generated at ${new Date(assessment.assessment_timestamp).toLocaleString()}*`);

  return lines.filter(line => line !== '').join('\n');
}

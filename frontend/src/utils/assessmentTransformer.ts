/**
 * Transforms security-radar-api assessment response to MainContent format
 */

interface SecurityRadarAssessment {
  product_name: string;
  vendor: {
    name: string;
    website?: string;
    country?: string;
    founded?: string;
    reputation_summary: string;
  };
  category: string;
  description: string;
  usage_description: string;
  cve_trends: {
    total_cves: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    trend_summary: string;
    recent_cves?: Array<{
      id: string;
      severity: string;
      description: string;
    }>;
  };
  incidents: Array<{
    date: string;
    description: string;
    severity: string;
    source_type: string;
    source_url?: string;
    source_title?: string;
  }>;
  compliance: {
    soc2_compliant: boolean;
    iso_certified: boolean;
    gdpr_compliant: boolean;
    data_processing_location?: string;
    encryption_at_rest: boolean;
    encryption_in_transit: boolean;
    data_retention_policy?: string;
    notes: string;
  };
  deployment_model?: string;
  admin_controls?: string;
  trust_score: {
    score: number;
    confidence: string;
    rationale: string;
    risk_factors: string[];
    positive_factors: string[];
  };
  alternatives?: Array<{
    product_name: string;
    vendor: string;
    rationale: string;
    trust_score: number;
  }>;
  citations: Array<{
    url?: string;
    source_type: string;
    title: string;
    date?: string;
    description?: string;
  }>;
  assessment_timestamp: string;
  cache_key?: string;
}

interface MainContentFormat {
  meta: {
    generated_at: string;
    mode: string;
    input: string;
    llm_model: string;
  };
  entity: {
    product_name: string;
    vendor_name: string;
    vendor_website: string;
  };
  classification: {
    category: string;
    delivery_model: string;
    short_description: string;
  };
  summary: {
    trust_score: number;
    risk_level: string;
    confidence: string;
    key_points: string[];
  };
  cve: {
    count_last_12m: number;
    max_cvss: number;
    cisa_kev: {
      has_kev: boolean;
      kev_cves: string[];
    };
    comment: string;
  };
  incidents: {
    known_incidents_last_24m: string;
    items: any[];
    comment: string;
  };
  data_compliance: {
    data_types: string[];
    dpa_available: string;
    soc2: string;
    iso27001: string;
    data_location: string;
  };
  controls: {
    sso: string;
    mfa: string;
    rbac: string;
    audit_logs: string;
  };
  alternatives: Array<{
    product_name: string;
    vendor_name: string;
    trust_score: number;
    risk_level: string;
    why_safer: string[];
  }>;
  sources: Array<{
    id: number;
    type: string;
    title: string;
    url: string;
  }>;
}

/**
 * Calculate risk level from trust score
 */
function getRiskLevel(trustScore: number): string {
  if (trustScore >= 80) return 'Low';
  if (trustScore >= 60) return 'Medium';
  return 'High';
}

/**
 * Extract max CVSS from CVE data (approximation from severity counts)
 */
function estimateMaxCVSS(cve_trends: SecurityRadarAssessment['cve_trends']): number {
  if (cve_trends.critical_count > 0) return 9.0;
  if (cve_trends.high_count > 0) return 8.2;
  if (cve_trends.medium_count > 0) return 5.5;
  if (cve_trends.low_count > 0) return 3.0;
  return 0;
}

/**
 * Generate key points from assessment data
 */
function generateKeyPoints(assessment: SecurityRadarAssessment): string[] {
  const points: string[] = [];

  // Trust score point
  points.push(`Trust score: ${assessment.trust_score.score}/100 with ${assessment.trust_score.confidence.toLowerCase()} confidence.`);

  // CVE point
  if (assessment.cve_trends.total_cves > 0) {
    points.push(
      `${assessment.cve_trends.total_cves} CVEs identified (Critical: ${assessment.cve_trends.critical_count}, ` +
      `High: ${assessment.cve_trends.high_count}, Medium: ${assessment.cve_trends.medium_count}).`
    );
  } else {
    points.push('No known CVEs in recent history.');
  }

  // Compliance point
  const compliances = [];
  if (assessment.compliance.soc2_compliant) compliances.push('SOC2');
  if (assessment.compliance.iso_certified) compliances.push('ISO 27001');
  if (assessment.compliance.gdpr_compliant) compliances.push('GDPR');

  if (compliances.length > 0) {
    points.push(`Compliant with: ${compliances.join(', ')}.`);
  }

  // Incidents point
  if (assessment.incidents.length === 0) {
    points.push('No major public security incidents reported.');
  } else {
    points.push(`${assessment.incidents.length} security incident(s) reported.`);
  }

  return points;
}

/**
 * Parse admin controls from text description
 */
function parseAdminControls(adminControls?: string): {
  sso: string;
  mfa: string;
  rbac: string;
  audit_logs: string;
} {
  if (!adminControls) {
    return {
      sso: 'Unknown',
      mfa: 'Unknown',
      rbac: 'Unknown',
      audit_logs: 'Unknown',
    };
  }

  const text = adminControls.toLowerCase();

  return {
    sso: text.includes('sso') || text.includes('single sign') ? 'Yes' : 'Unknown',
    mfa: text.includes('mfa') || text.includes('multi-factor') || text.includes('2fa') ? 'Yes' : 'Unknown',
    rbac: text.includes('rbac') || text.includes('role-based') || text.includes('user management') ? 'Yes' : 'Unknown',
    audit_logs: text.includes('audit') || text.includes('logs') ? 'Yes' : 'Unknown',
  };
}

/**
 * Transform security-radar-api response to MainContent format
 */
export function transformAssessmentResponse(
  assessment: SecurityRadarAssessment,
  model: string = 'mock'
): MainContentFormat {
  const riskLevel = getRiskLevel(assessment.trust_score.score);
  const maxCVSS = estimateMaxCVSS(assessment.cve_trends);
  const keyPoints = generateKeyPoints(assessment);
  const controls = parseAdminControls(assessment.admin_controls);

  return {
    meta: {
      generated_at: assessment.assessment_timestamp,
      mode: 'online',
      input: assessment.vendor.website || assessment.product_name,
      llm_model: model,
    },
    entity: {
      product_name: assessment.product_name,
      vendor_name: assessment.vendor.name,
      vendor_website: assessment.vendor.website || `https://www.${assessment.product_name.toLowerCase().replace(/\s+/g, '')}.com`,
    },
    classification: {
      category: assessment.category,
      delivery_model: assessment.deployment_model || 'Cloud',
      short_description: assessment.description,
    },
    summary: {
      trust_score: assessment.trust_score.score,
      risk_level: riskLevel,
      confidence: assessment.trust_score.confidence,
      key_points: keyPoints,
    },
    cve: {
      count_last_12m: assessment.cve_trends.total_cves,
      max_cvss: maxCVSS,
      cisa_kev: {
        has_kev: false, // Security-radar-api doesn't track KEV separately
        kev_cves: [],
      },
      comment: assessment.cve_trends.trend_summary,
    },
    incidents: {
      known_incidents_last_24m: assessment.incidents.length > 0 ? 'Yes' : 'No',
      items: assessment.incidents,
      comment: assessment.incidents.length > 0
        ? `${assessment.incidents.length} incident(s) identified in available data.`
        : 'No major public incidents identified in recent history.',
    },
    data_compliance: {
      data_types: ['Customer data', 'Business data'], // Generic placeholder
      dpa_available: assessment.compliance.gdpr_compliant ? 'Yes' : 'Unknown',
      soc2: assessment.compliance.soc2_compliant ? 'Yes' : 'No',
      iso27001: assessment.compliance.iso_certified ? 'Yes' : 'No',
      data_location: assessment.compliance.data_processing_location || 'Unknown',
    },
    controls: controls,
    alternatives: (assessment.alternatives || []).map(alt => ({
      product_name: alt.product_name,
      vendor_name: alt.vendor,
      trust_score: alt.trust_score,
      risk_level: getRiskLevel(alt.trust_score),
      why_safer: [alt.rationale],
    })),
    sources: assessment.citations.map((citation, index) => ({
      id: index + 1,
      type: citation.source_type.toLowerCase().replace('_', ' '),
      title: citation.title,
      url: citation.url || '#',
    })),
  };
}

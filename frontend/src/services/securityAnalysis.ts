import { SecurityAnalysisAPI, SecurityAnalysis } from './api';

// Example function to send your specific data
export async function sendSecurityAnalysisData() {
  const analysisData: SecurityAnalysis = {
    meta: {
      generated_at: "2025-11-15T10:05:23Z",
      mode: "online",
      input: "https://app.acmecloud.example",
      llm_model: "gpt-4.1-mini"
    },
    entity: {
      product_name: "AcmeCloud CRM",
      vendor_name: "AcmeCloud Inc.",
      vendor_website: "https://www.acmecloud.example"
    },
    classification: {
      category: "SaaS – CRM",
      delivery_model: "SaaS",
      short_description: "AcmeCloud CRM is a cloud-based customer relationship management tool for small and mid-sized businesses."
    },
    summary: {
      trust_score: 68,
      risk_level: "Medium",
      confidence: "Medium",
      key_points: [
        "Public security page and basic vulnerability disclosure program are available. [1]",
        "Several medium/high CVEs in the last 12 months, but no KEV-listed vulnerabilities. [2][3]",
        "SOC 2 Type II declared; ISO27001 status not clearly documented. [1]",
        "SSO and RBAC supported; audit logs can be exported. [1]"
      ]
    },
    cve: {
      count_last_12m: 4,
      max_cvss: 8.2,
      cisa_kev: {
        has_kev: false,
        kev_cves: []
      },
      comment: "Moderate vulnerability history with some high-severity issues but no known KEV-listed vulnerabilities in the last 12 months."
    },
    incidents: {
      known_incidents_last_24m: "No",
      items: [],
      comment: "No major public incidents identified in the last 24 months based on open-source searches. Data may be incomplete."
    },
    data_compliance: {
      data_types: [
        "PII (names, emails, phone numbers)",
        "Business customer records"
      ],
      dpa_available: "Yes",
      soc2: "Yes",
      iso27001: "Unknown",
      data_location: "US/EU (mixed, limited EU residency options)"
    },
    controls: {
      sso: "Yes",
      mfa: "Yes",
      rbac: "Yes",
      audit_logs: "Yes"
    },
    alternatives: [
      {
        product_name: "SafeCloud CRM",
        vendor_name: "SafeCloud Ltd.",
        trust_score: 78,
        risk_level: "Low",
        why_safer: [
          "Fewer recent CVEs and no high-severity issues in the last 12 months. [4][5]",
          "SOC2 and ISO27001 both declared with public summaries. [4]",
          "Clear EU data residency and stronger privacy posture. [5]"
        ]
      }
    ],
    sources: [
      {
        id: 1,
        type: "vendor",
        title: "AcmeCloud Security & Trust Center",
        url: "https://www.acmecloud.example/security"
      },
      {
        id: 2,
        type: "independent",
        title: "CVE entries for \"AcmeCloud CRM\"",
        url: "https://cve.example.org/?vendor=acmecloud&product=crm"
      },
      {
        id: 3,
        type: "independent",
        title: "CISA KEV search for \"AcmeCloud\"",
        url: "https://www.cisa.gov/known-exploited-vulnerabilities"
      },
      {
        id: 4,
        type: "vendor",
        title: "SafeCloud Trust Center",
        url: "https://trust.safecloud.example"
      },
      {
        id: 5,
        type: "independent",
        title: "SafeCloud CRM security/compliance review",
        url: "https://example.com/safecloud-review"
      }
    ]
  };

  try {
    const result = await SecurityAnalysisAPI.sendAnalysis(analysisData);
    console.log('Analysis sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to send analysis:', error);
    throw error;
  }
}

// Generic function to send any security analysis data
export async function sendCustomAnalysis(data: SecurityAnalysis) {
  try {
    const result = await SecurityAnalysisAPI.sendAnalysis(data);
    console.log('Custom analysis sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to send custom analysis:', error);
    throw error;
  }
}

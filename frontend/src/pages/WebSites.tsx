import { useState } from 'react';
import BasePageLayout from '../layouts/BasePageLayout';
import WebSitesReport from '../components/WebSitesReport';
import ChatPanel from '../components/ChatPanel';

interface SecurityData {
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
    items: unknown[];
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

export default function WebSites() {
  const [assessmentData, setAssessmentData] = useState<SecurityData | null>(null);
  const [isTeamSelected, setIsTeamSelected] = useState(true);

  return (
    <BasePageLayout showTeamMembers={isTeamSelected}>
      {/* Chat Panel */}
      <ChatPanel
        onAssessmentComplete={setAssessmentData}
        isTeamSelected={isTeamSelected}
        onTeamSelectedChange={setIsTeamSelected}
      />

      {/* Main Content */}
      <WebSitesReport assessmentData={assessmentData} />
    </BasePageLayout>
  );
}
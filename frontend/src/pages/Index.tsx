import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import ChatPanel from '../components/ChatPanel';
import Header from '../components/Header';
import Networks from './Networks';
import { ThemeProvider } from '../contexts/ThemeContext';

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

export default function Index() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [assessmentData, setAssessmentData] = useState<SecurityData | null>(null);
  const [activePage, setActivePage] = useState<string>('websites');

  const handleNavigate = (page: string) => {
    setActivePage(page);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        {/* Global Header */}
        <Header />

        {/* Main Layout - use fixed height calculation */}
        <div className="flex fixed top-16 left-0 right-0 bottom-0">
          {/* Sidebar */}
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onNavigate={handleNavigate}
            activePage={activePage}
          />

          {/* Conditional Content based on active page */}
          {activePage === 'websites' ? (
            <>
              {/* Chat Panel */}
              <ChatPanel
                isSidebarCollapsed={isSidebarCollapsed}
                onAssessmentComplete={setAssessmentData}
              />

              {/* Main Content */}
              <MainContent assessmentData={assessmentData} />
            </>
          ) : activePage === 'networks' ? (
            <Networks />
          ) : null}
        </div>
      </div>
    </ThemeProvider>
  );
}
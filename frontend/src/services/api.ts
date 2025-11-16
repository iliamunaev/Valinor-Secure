// TypeScript interfaces for the security analysis data
export interface SecurityAnalysisMeta {
  generated_at: string;
  mode: string;
  input: string;
  llm_model: string;
}

export interface Entity {
  product_name: string;
  vendor_name: string;
  vendor_website: string;
}

export interface Classification {
  category: string;
  delivery_model: string;
  short_description: string;
}

export interface Summary {
  trust_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: 'Low' | 'Medium' | 'High';
  key_points: string[];
}

export interface CVE {
  count_last_12m: number;
  max_cvss: number;
  cisa_kev: {
    has_kev: boolean;
    kev_cves: string[];
  };
  comment: string;
}

export interface Incidents {
  known_incidents_last_24m: string;
  items: any[];
  comment: string;
}

export interface DataCompliance {
  data_types: string[];
  dpa_available: string;
  soc2: string;
  iso27001: string;
  data_location: string;
}

export interface Controls {
  sso: string;
  mfa: string;
  rbac: string;
  audit_logs: string;
}

export interface Alternative {
  product_name: string;
  vendor_name: string;
  trust_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  why_safer: string[];
}

export interface Source {
  id: number;
  type: 'vendor' | 'independent';
  title: string;
  url: string;
}

export interface SecurityAnalysis {
  meta: SecurityAnalysisMeta;
  entity: Entity;
  classification: Classification;
  summary: Summary;
  cve: CVE;
  incidents: Incidents;
  data_compliance: DataCompliance;
  controls: Controls;
  alternatives: Alternative[];
  sources: Source[];
}

// API service for backend communication
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');

export class SecurityAnalysisAPI {

  static async sendAnalysis(analysisData: SecurityAnalysis): Promise<SecurityAnalysis> {
    try {
      const response = await fetch(`${API_BASE_URL}/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending analysis to backend:', error);
      throw error;
    }
  }

  static async getInputExample(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/input`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching input example:', error);
      throw error;
    }
  }

  static async assessWebsite(url: string): Promise<SecurityAnalysis> {
    try {
      const response = await fetch(`${API_BASE_URL}/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error assessing website:', error);
      throw error;
    }
  }
}

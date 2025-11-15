import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

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

interface MainContentProps {
  assessmentData?: SecurityData | null;
}

const MainContent: React.FC<MainContentProps> = ({ assessmentData: propAssessmentData }) => {
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);

  // Update security data when prop changes
  useEffect(() => {
    if (propAssessmentData) {
      setSecurityData(propAssessmentData);
    }
  }, [propAssessmentData]);

  useEffect(() => {
    // Only load fallback data if no assessment data is provided
    if (propAssessmentData) return;

    // Load the security data from the JSON file
    const loadSecurityData = async () => {
      try {
        const response = await fetch('/uploads/payload.json');
        const data = await response.json();
        setSecurityData(data);
      } catch (error) {
        console.error('Error loading security data:', error);
        // Fallback to hardcoded data if file not accessible
        const fallbackData: SecurityData = {
          "meta": {
            "generated_at": "2025-11-15T10:05:23Z",
            "mode": "online",
            "input": "https://app.acmecloud.example",
            "llm_model": "gpt-4.1-mini"
          },
          "entity": {
            "product_name": "AcmeCloud CRM",
            "vendor_name": "AcmeCloud Inc.",
            "vendor_website": "https://www.acmecloud.example"
          },
          "classification": {
            "category": "SaaS – CRM",
            "delivery_model": "SaaS",
            "short_description": "AcmeCloud CRM is a cloud-based customer relationship management tool for small and mid-sized businesses."
          },
          "summary": {
            "trust_score": 68,
            "risk_level": "Medium",
            "confidence": "Medium",
            "key_points": [
              "Public security page and basic vulnerability disclosure program are available. [1]",
              "Several medium/high CVEs in the last 12 months, but no KEV-listed vulnerabilities. [2][3]",
              "SOC 2 Type II declared; ISO27001 status not clearly documented. [1]",
              "SSO and RBAC supported; audit logs can be exported. [1]"
            ]
          },
          "cve": {
            "count_last_12m": 4,
            "max_cvss": 8.2,
            "cisa_kev": {
              "has_kev": false,
              "kev_cves": []
            },
            "comment": "Moderate vulnerability history with some high-severity issues but no known KEV-listed vulnerabilities in the last 12 months."
          },
          "incidents": {
            "known_incidents_last_24m": "No",
            "items": [],
            "comment": "No major public incidents identified in the last 24 months based on open-source searches. Data may be incomplete."
          },
          "data_compliance": {
            "data_types": [
              "PII (names, emails, phone numbers)",
              "Business customer records"
            ],
            "dpa_available": "Yes",
            "soc2": "Yes",
            "iso27001": "Unknown",
            "data_location": "US/EU (mixed, limited EU residency options)"
          },
          "controls": {
            "sso": "Yes",
            "mfa": "Yes",
            "rbac": "Yes",
            "audit_logs": "Yes"
          },
          "alternatives": [
            {
              "product_name": "SafeCloud CRM",
              "vendor_name": "SafeCloud Ltd.",
              "trust_score": 78,
              "risk_level": "Low",
              "why_safer": [
                "Fewer recent CVEs and no high-severity issues in the last 12 months. [4][5]",
                "SOC2 and ISO27001 both declared with public summaries. [4]",
                "Clear EU data residency and stronger privacy posture. [5]"
              ]
            }
          ],
          "sources": [
            {
              "id": 1,
              "type": "vendor",
              "title": "AcmeCloud Security & Trust Center",
              "url": "https://www.acmecloud.example/security"
            },
            {
              "id": 2,
              "type": "independent",
              "title": "CVE entries for \"AcmeCloud CRM\"",
              "url": "https://cve.example.org/?vendor=acmecloud&product=crm"
            },
            {
              "id": 3,
              "type": "independent",
              "title": "CISA KEV search for \"AcmeCloud\"",
              "url": "https://www.cisa.gov/known-exploited-vulnerabilities"
            },
            {
              "id": 4,
              "type": "vendor",
              "title": "SafeCloud Trust Center",
              "url": "https://trust.safecloud.example"
            },
            {
              "id": 5,
              "type": "independent",
              "title": "SafeCloud CRM security/compliance review",
              "url": "https://reviews.example.org/safecloud-crm-security"
            }
          ]
        };
        setSecurityData(fallbackData);
      }
    };

    loadSecurityData();
  }, [propAssessmentData]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'yes': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'no': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'unknown': return <Info className="w-4 h-4 text-gray-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!securityData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading security report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 transition-colors duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-500" />
              Security Assessment Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {securityData.entity.product_name} by {securityData.entity.vendor_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generated: {new Date(securityData.meta.generated_at).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mode: {securityData.meta.mode} | Model: {securityData.meta.llm_model}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trust Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {securityData.summary.trust_score}
                  </div>
                  <div className="flex-1">
                    <Progress value={securityData.summary.trust_score} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">out of 100</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getRiskColor(securityData.summary.risk_level)} px-3 py-1`}>
                    {securityData.summary.risk_level}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Confidence: {securityData.summary.confidence}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">CVE Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Last 12 months:</span>
                    <span className="font-semibold">{securityData.cve.count_last_12m} CVEs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Max CVSS:</span>
                    <span className="font-semibold text-orange-600">{securityData.cve.max_cvss}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">CISA KEV:</span>
                    <span className={`font-semibold ${securityData.cve.cisa_kev.has_kev ? 'text-red-600' : 'text-green-600'}`}>
                      {securityData.cve.cisa_kev.has_kev ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Name</label>
                      <p className="font-semibold">{securityData.entity.product_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendor</label>
                      <p className="font-semibold">{securityData.entity.vendor_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                      <p className="font-semibold">{securityData.classification.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Model</label>
                      <p className="font-semibold">{securityData.classification.delivery_model}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{securityData.classification.short_description}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Security Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {securityData.summary.key_points.map((point, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="vulnerabilities" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>CVE Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{securityData.cve.count_last_12m}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">CVEs (12 months)</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{securityData.cve.max_cvss}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Max CVSS Score</div>
                      </div>
                    </div>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{securityData.cve.comment}</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Incidents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-sm font-medium">Known Incidents (24 months)</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {securityData.incidents.known_incidents_last_24m}
                        </Badge>
                      </div>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{securityData.incidents.comment}</AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Compliance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Types Handled</label>
                      <div className="mt-2 space-y-1">
                        {securityData.data_compliance.data_types.map((type, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-1">{type}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Location</label>
                      <p className="font-semibold">{securityData.data_compliance.data_location}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getComplianceIcon(securityData.data_compliance.dpa_available)}
                        <span className="font-medium">DPA Available</span>
                      </div>
                      <Badge variant={securityData.data_compliance.dpa_available === 'Yes' ? 'default' : 'destructive'}>
                        {securityData.data_compliance.dpa_available}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getComplianceIcon(securityData.data_compliance.soc2)}
                        <span className="font-medium">SOC 2</span>
                      </div>
                      <Badge variant={securityData.data_compliance.soc2 === 'Yes' ? 'default' : 'destructive'}>
                        {securityData.data_compliance.soc2}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getComplianceIcon(securityData.data_compliance.iso27001)}
                        <span className="font-medium">ISO 27001</span>
                      </div>
                      <Badge variant={securityData.data_compliance.iso27001 === 'Yes' ? 'default' : 'secondary'}>
                        {securityData.data_compliance.iso27001}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="controls" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Controls</CardTitle>
                  <CardDescription>Available security features and controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="flex justify-center mb-2">
                        {getComplianceIcon(securityData.controls.sso)}
                      </div>
                      <div className="font-medium">SSO</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{securityData.controls.sso}</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="flex justify-center mb-2">
                        {getComplianceIcon(securityData.controls.mfa)}
                      </div>
                      <div className="font-medium">MFA</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{securityData.controls.mfa}</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="flex justify-center mb-2">
                        {getComplianceIcon(securityData.controls.rbac)}
                      </div>
                      <div className="font-medium">RBAC</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{securityData.controls.rbac}</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="flex justify-center mb-2">
                        {getComplianceIcon(securityData.controls.audit_logs)}
                      </div>
                      <div className="font-medium">Audit Logs</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{securityData.controls.audit_logs}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alternatives" className="space-y-6">
              <div className="space-y-4">
                {securityData.alternatives.map((alt, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{alt.product_name}</CardTitle>
                          <CardDescription>{alt.vendor_name}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{alt.trust_score}</div>
                          <Badge className={getRiskColor(alt.risk_level)}>
                            {alt.risk_level} Risk
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h4 className="font-medium mb-2">Why this alternative is safer:</h4>
                        <ul className="space-y-2">
                          {alt.why_safer.map((reason, reasonIndex) => (
                            <li key={reasonIndex} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Sources & References</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityData.sources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">[{source.id}] {source.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{source.type} source</div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default MainContent;
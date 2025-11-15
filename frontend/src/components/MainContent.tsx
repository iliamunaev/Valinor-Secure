import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { ExternalLink, Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { getScanHistory } from '../api/get/getScanHistory';

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

const MainContent: React.FC = () => {
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);

  useEffect(() => {
    // Load the security data from your backend
    const loadSecurityData = async () => {
      try {
        const data = await getScanHistory(); // Use your existing backend API
        console.log('Security data loaded from backend:', data);
        setSecurityData(data);
      } catch (error) {
        console.error('Error loading security data:', error);
        // Fallback to hardcoded data if backend not available
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
  }, []);

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
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading security assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-white">
          Security Assessment Report
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-900">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-100">Trust Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-cyan-400">
                    {securityData.summary.trust_score}
                  </div>
                  <div className="flex-1">
                    <Progress value={securityData.summary.trust_score} className="h-2" />
                    <p className="text-xs text-gray-400 mt-1">out of 100</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-100">Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getRiskColor(securityData.summary.risk_level)} px-3 py-1`}>
                    {securityData.summary.risk_level}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    Confidence: {securityData.summary.confidence}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-100">CVE Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Last 12 months:</span>
                    <span className="font-semibold text-gray-100">{securityData.cve.count_last_12m} CVEs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Max CVSS:</span>
                    <span className="font-semibold text-orange-400">{securityData.cve.max_cvss}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">CISA KEV:</span>
                    <span className={`font-semibold ${securityData.cve.cisa_kev.has_kev ? 'text-red-400' : 'text-green-400'}`}>
                      {securityData.cve.cisa_kev.has_kev ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 border-gray-700 gap-4 mb-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Product Name</label>
                      <p className="font-semibold text-gray-100">{securityData.entity.product_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Vendor</label>
                      <p className="font-semibold text-gray-100">{securityData.entity.vendor_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Category</label>
                      <p className="font-semibold text-gray-100">{securityData.classification.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Delivery Model</label>
                      <p className="font-semibold text-gray-100">{securityData.classification.delivery_model}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Description</label>
                      <p className="text-sm text-gray-300">{securityData.classification.short_description}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Key Security Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {securityData.summary.key_points.map((point, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-300">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="vulnerabilities" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">CVE Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-orange-400">{securityData.cve.count_last_12m}</div>
                        <div className="text-sm text-gray-400">CVEs (12 months)</div>
                      </div>
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-red-400">{securityData.cve.max_cvss}</div>
                        <div className="text-sm text-gray-400">Max CVSS Score</div>
                      </div>
                    </div>
                    <Alert className="bg-gray-700 border-gray-600">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <AlertDescription className="text-gray-300">{securityData.cve.comment}</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Security Incidents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-100">Known Incidents (24 months)</span>
                        <Badge className="bg-green-800 text-green-200">
                          {securityData.incidents.known_incidents_last_24m}
                        </Badge>
                      </div>
                      <Alert className="bg-gray-700 border-gray-600">
                        <Info className="h-4 w-4 text-cyan-400" />
                        <AlertDescription className="text-gray-300">{securityData.incidents.comment}</AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Data Compliance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Data Types Handled</label>
                      <div className="mt-2 space-y-1">
                        {securityData.data_compliance.data_types.map((type, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-1 border-gray-600 text-gray-300">{type}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Data Location</label>
                      <p className="font-semibold text-gray-100">{securityData.data_compliance.data_location}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Certifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-600 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getComplianceIcon(securityData.data_compliance.dpa_available)}
                        <span className="font-medium text-gray-100">DPA Available</span>
                      </div>
                      <Badge variant={securityData.data_compliance.dpa_available === 'Yes' ? 'default' : 'destructive'} className="bg-cyan-800 text-cyan-200">
                        {securityData.data_compliance.dpa_available}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-600 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getComplianceIcon(securityData.data_compliance.soc2)}
                        <span className="font-medium text-gray-100">SOC 2</span>
                      </div>
                      <Badge variant={securityData.data_compliance.soc2 === 'Yes' ? 'default' : 'destructive'} className="bg-cyan-800 text-cyan-200">
                        {securityData.data_compliance.soc2}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-600 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getComplianceIcon(securityData.data_compliance.iso27001)}
                        <span className="font-medium text-gray-100">ISO 27001</span>
                      </div>
                      <Badge variant={securityData.data_compliance.iso27001 === 'Yes' ? 'default' : 'secondary'} className="bg-gray-600 text-gray-200">
                        {securityData.data_compliance.iso27001}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="controls" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Security Controls</CardTitle>
                  <CardDescription className="text-gray-400">Available security features and controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border border-gray-600 bg-gray-700 rounded-lg">
                      <div className="flex justify-center mb-2">
                        {getComplianceIcon(securityData.controls.sso)}
                      </div>
                      <div className="font-medium text-gray-100">SSO</div>
                      <div className="text-sm text-gray-400">{securityData.controls.sso}</div>
                    </div>
                    <div className="text-center p-4 border border-gray-600 bg-gray-700 rounded-lg">
                      <div className="flex justify-center mb-2">
                        {getComplianceIcon(securityData.controls.mfa)}
                      </div>
                      <div className="font-medium text-gray-100">MFA</div>
                      <div className="text-sm text-gray-400">{securityData.controls.mfa}</div>
                    </div>
                    <div className="text-center p-4 border border-gray-600 bg-gray-700 rounded-lg">
                      <div className="flex justify-center mb-2">
                        {getComplianceIcon(securityData.controls.rbac)}
                      </div>
                      <div className="font-medium text-gray-100">RBAC</div>
                      <div className="text-sm text-gray-400">{securityData.controls.rbac}</div>
                    </div>
                    <div className="text-center p-4 border border-gray-600 bg-gray-700 rounded-lg">
                      <div className="flex justify-center mb-2">
                        {getComplianceIcon(securityData.controls.audit_logs)}
                      </div>
                      <div className="font-medium text-gray-100">Audit Logs</div>
                      <div className="text-sm text-gray-400">{securityData.controls.audit_logs}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alternatives" className="space-y-6">
              <div className="space-y-4">
                {securityData.alternatives.map((alt, index) => (
                  <Card key={index} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-gray-100">{alt.product_name}</CardTitle>
                          <CardDescription className="text-gray-400">{alt.vendor_name}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-cyan-400">{alt.trust_score}</div>
                          <Badge className={getRiskColor(alt.risk_level)}>
                            {alt.risk_level} Risk
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h4 className="font-medium mb-2 text-gray-100">Why this alternative is safer:</h4>
                        <ul className="space-y-2">
                          {alt.why_safer.map((reason, reasonIndex) => (
                            <li key={reasonIndex} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-300">{reason}</span>
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
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Sources & References</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityData.sources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-3 border border-gray-600 bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-100">[{source.id}] {source.title}</div>
                      <div className="text-sm text-gray-400 capitalize">{source.type} source</div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900">
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
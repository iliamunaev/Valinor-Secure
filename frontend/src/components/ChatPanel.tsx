import React, { useState, useEffect } from 'react';
import { parseAssessmentRequest, assessProduct } from '../utils/assessmentHelper';
import { transformAssessmentResponse } from '../utils/assessmentTransformer';
import { API_ENDPOINTS } from '../config/api';

interface SecurityData {
  meta: any;
  entity: any;
  classification: any;
  summary: any;
  cve: any;
  incidents: any;
  data_compliance: any;
  controls: any;
  alternatives: any[];
  sources: any[];
}

interface ChatPanelProps {
  onAssessmentComplete?: (data: SecurityData) => void;
  isTeamSelected?: boolean;
  onTeamSelectedChange?: (isTeamSelected: boolean) => void;
}

interface AssessmentHistoryItem {
  id: string;
  productName: string;
  timestamp: string;
  status: 'loading' | 'success' | 'error';
  trustScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  assessmentData?: SecurityData;
}

// Available LLM models
type ModelConfig = {
  id: string;
  name: string;
  provider: string;
};

const mockHistoryData = {
    "status": "success",
    "history": [
        {
            "id": "1763268626863",
            "productName": "Google",
            "trustScore": 85,
            "riskLevel": "Low",
            "assessmentData": {
                "meta": {
                    "generated_at": "2025-11-16T04:50:44.394764",
                    "mode": "online",
                    "input": "https://www.google.com",
                    "llm_model": "gpt-4"
                },
                "entity": {
                    "product_name": "Google",
                    "vendor_name": "Google",
                    "vendor_website": "https://www.google.com"
                },
                "classification": {
                    "category": "Browser",
                    "delivery_model": "Cloud",
                    "short_description": "Google Chrome is a web browser developed by Google. It is designed for efficiency and ease of use."
                },
                "summary": {
                    "trust_score": 85,
                    "risk_level": "Low",
                    "confidence": "High",
                    "key_points": [
                        "Trust score: 85/100 with high confidence.",
                        "1000 CVEs identified (Critical: 100, High: 200, Medium: 300).",
                        "Compliant with: SOC2, ISO 27001, GDPR.",
                        "1 security incident(s) reported."
                    ]
                },
                "cve": {
                    "count_last_12m": 1000,
                    "max_cvss": 9,
                    "cisa_kev": {
                        "has_kev": false,
                        "kev_cves": []
                    },
                    "comment": "Google Chrome has a moderate number of CVEs, but Google is proactive in patching vulnerabilities."
                },
                "incidents": {
                    "known_incidents_last_24m": "Yes",
                    "items": [
                        {
                            "date": "2021-06-09",
                            "description": "Google Chrome zero-day vulnerability exploited in the wild.",
                            "severity": "High",
                            "source": {
                                "url": "https://chromereleases.googleblog.com/2021/06/stable-channel-update-for-desktop_9.html",
                                "source_type": "Public Disclosure",
                                "title": "Stable Channel Update for Desktop",
                                "date": "2021-06-09",
                                "description": "Google Chrome zero-day vulnerability exploited in the wild."
                            }
                        }
                    ],
                    "comment": "1 incident(s) identified in available data."
                },
                "data_compliance": {
                    "data_types": [
                        "Customer data",
                        "Business data"
                    ],
                    "dpa_available": "Yes",
                    "soc2": "Yes",
                    "iso27001": "Yes",
                    "data_location": "Global"
                },
                "controls": {
                    "sso": "Unknown",
                    "mfa": "Unknown",
                    "rbac": "Yes",
                    "audit_logs": "Unknown"
                },
                "alternatives": [
                    {
                        "product_name": "Mozilla Firefox",
                        "vendor_name": "Mozilla",
                        "trust_score": 90,
                        "risk_level": "Low",
                        "why_safer": [
                            "Firefox has a strong security record and is open source, allowing for greater transparency."
                        ]
                    }
                ],
                "sources": [
                    {
                        "id": 1,
                        "type": "vendor stated",
                        "title": "Stable Channel Update for Desktop",
                        "url": "https://chromereleases.googleblog.com/2021/06/stable-channel-update-for-desktop_9.html"
                    }
                ]
            },
            "timestamp": "2025-11-16T04:50:44.412967"
        },
        {
            "id": "1763268568179",
            "productName": "Zoom",
            "trustScore": 75,
            "riskLevel": "Medium",
            "assessmentData": {
                "meta": {
                    "generated_at": "2025-11-16T04:50:06.775200",
                    "mode": "online",
                    "input": "https://zoom.us/",
                    "llm_model": "gpt-4"
                },
                "entity": {
                    "product_name": "Zoom",
                    "vendor_name": "Zoom Video Communications",
                    "vendor_website": "https://zoom.us/"
                },
                "classification": {
                    "category": "Communication",
                    "delivery_model": "Cloud",
                    "short_description": "Zoom is a cloud-based video conferencing service used for virtual meetings, webinars, and collaborative tasks."
                },
                "summary": {
                    "trust_score": 75,
                    "risk_level": "Medium",
                    "confidence": "Medium",
                    "key_points": [
                        "Trust score: 75/100 with medium confidence.",
                        "10 CVEs identified (Critical: 2, High: 3, Medium: 4).",
                        "Compliant with: SOC2, ISO 27001, GDPR.",
                        "1 security incident(s) reported."
                    ]
                },
                "cve": {
                    "count_last_12m": 10,
                    "max_cvss": 9,
                    "cisa_kev": {
                        "has_kev": false,
                        "kev_cves": []
                    },
                    "comment": "Zoom has a moderate number of CVEs, with a mix of severity levels. The company has been responsive in patching identified vulnerabilities."
                },
                "incidents": {
                    "known_incidents_last_24m": "Yes",
                    "items": [
                        {
                            "date": "2020-04-01",
                            "description": "Zoom faced a 'Zoombombing' incident where uninvited attendees broke into and disrupted meetings.",
                            "severity": "Medium",
                            "source": {
                                "url": "https://www.fbi.gov/contact-us/field-offices/boston/news/press-releases/fbi-warns-of-teleconferencing-and-online-classroom-hijacking-during-covid-19-pandemic",
                                "source_type": "Public Disclosure",
                                "title": "FBI Warns of Teleconferencing and Online Classroom Hijacking during COVID-19 Pandemic",
                                "date": "2020-04-01",
                                "description": "Zoom faced a 'Zoombombing' incident where uninvited attendees broke into and disrupted meetings."
                            }
                        }
                    ],
                    "comment": "1 incident(s) identified in available data."
                },
                "data_compliance": {
                    "data_types": [
                        "Customer data",
                        "Business data"
                    ],
                    "dpa_available": "Yes",
                    "soc2": "Yes",
                    "iso27001": "Yes",
                    "data_location": "United States"
                },
                "controls": {
                    "sso": "Unknown",
                    "mfa": "Unknown",
                    "rbac": "Yes",
                    "audit_logs": "Unknown"
                },
                "alternatives": [
                    {
                        "product_name": "Microsoft Teams",
                        "vendor_name": "Microsoft",
                        "trust_score": 85,
                        "risk_level": "Low",
                        "why_safer": [
                            "Microsoft Teams has a strong security framework and is integrated with Office 365, providing a comprehensive solution for enterprise communication."
                        ]
                    }
                ],
                "sources": [
                    {
                        "id": 1,
                        "type": "cve database",
                        "title": "Zoom Vulnerabilities",
                        "url": "https://www.cvedetails.com/vulnerability-list/vendor_id-12998/Zoom.html"
                    },
                    {
                        "id": 2,
                        "type": "public disclosure",
                        "title": "FBI Warns of Teleconferencing and Online Classroom Hijacking during COVID-19 Pandemic",
                        "url": "https://www.fbi.gov/contact-us/field-offices/boston/news/press-releases/fbi-warns-of-teleconferencing-and-online-classroom-hijacking-during-covid-19-pandemic"
                    }
                ]
            },
            "timestamp": "2025-11-16T04:50:06.800234"
        },
        {
            "id": "1763268541984",
            "productName": "Aagon GmbH",
            "trustScore": 0,
            "riskLevel": "High",
            "assessmentData": {
                "meta": {
                    "generated_at": "2025-11-16T04:49:10.654090",
                    "mode": "online",
                    "input": "Not provided",
                    "llm_model": "gpt-4"
                },
                "entity": {
                    "product_name": "Aagon GmbH",
                    "vendor_name": "Unknown",
                    "vendor_website": "Not provided"
                },
                "classification": {
                    "category": "Other",
                    "delivery_model": "Unknown",
                    "short_description": "Aagon GmbH is a software product with unknown functionalities."
                },
                "summary": {
                    "trust_score": 0,
                    "risk_level": "High",
                    "confidence": "Low",
                    "key_points": [
                        "Trust score: 0/100 with low confidence.",
                        "No known CVEs in recent history.",
                        "No major public security incidents reported."
                    ]
                },
                "cve": {
                    "count_last_12m": 0,
                    "max_cvss": 0,
                    "cisa_kev": {
                        "has_kev": false,
                        "kev_cves": []
                    },
                    "comment": "Unknown"
                },
                "incidents": {
                    "known_incidents_last_24m": "No",
                    "items": [],
                    "comment": "No major public incidents identified in recent history."
                },
                "data_compliance": {
                    "data_types": [
                        "Customer data",
                        "Business data"
                    ],
                    "dpa_available": "Unknown",
                    "soc2": "No",
                    "iso27001": "No",
                    "data_location": "Unknown"
                },
                "controls": {
                    "sso": "Unknown",
                    "mfa": "Unknown",
                    "rbac": "Unknown",
                    "audit_logs": "Unknown"
                },
                "alternatives": [],
                "sources": []
            },
            "timestamp": "2025-11-16T04:49:10.678524"
        },
        {
            "id": "1763265392051",
            "productName": "Movavi Video Converter",
            "trustScore": 70,
            "riskLevel": "Medium",
            "assessmentData": {
                "meta": {
                    "generated_at": "2025-11-16T03:56:54.632018",
                    "mode": "online",
                    "input": "https://www.movavi.com/",
                    "llm_model": "gpt-4"
                },
                "entity": {
                    "product_name": "Movavi Video Converter",
                    "vendor_name": "Movavi",
                    "vendor_website": "https://www.movavi.com/"
                },
                "classification": {
                    "category": "Media Player",
                    "delivery_model": "On-premise",
                    "short_description": "Movavi Video Converter is a multimedia conversion software that supports a wide range of formats."
                },
                "summary": {
                    "trust_score": 70,
                    "risk_level": "Medium",
                    "confidence": "Medium",
                    "key_points": [
                        "Trust score: 70/100 with medium confidence.",
                        "No known CVEs in recent history.",
                        "No major public security incidents reported."
                    ]
                },
                "cve": {
                    "count_last_12m": 0,
                    "max_cvss": 0,
                    "cisa_kev": {
                        "has_kev": false,
                        "kev_cves": []
                    },
                    "comment": "No known CVEs associated with this product."
                },
                "incidents": {
                    "known_incidents_last_24m": "No",
                    "items": [],
                    "comment": "No major public incidents identified in recent history."
                },
                "data_compliance": {
                    "data_types": [
                        "Customer data",
                        "Business data"
                    ],
                    "dpa_available": "Unknown",
                    "soc2": "No",
                    "iso27001": "No",
                    "data_location": "Unknown"
                },
                "controls": {
                    "sso": "Unknown",
                    "mfa": "Unknown",
                    "rbac": "Unknown",
                    "audit_logs": "Unknown"
                },
                "alternatives": [
                    {
                        "product_name": "HandBrake",
                        "vendor_name": "HandBrake Community",
                        "trust_score": 85,
                        "risk_level": "Low",
                        "why_safer": [
                            "HandBrake is an open-source video converter with a transparent development process and a community that actively addresses security issues."
                        ]
                    }
                ],
                "sources": [
                    {
                        "id": 1,
                        "type": "vendor stated",
                        "title": "Movavi Official Website",
                        "url": "https://www.movavi.com/"
                    }
                ]
            },
            "timestamp": "2025-11-16T03:56:54.655519"
        }
    ],
    "count": 4
};

const MODELS: ModelConfig[] = [
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
];

const ChatPanel: React.FC<ChatPanelProps> = ({
  onAssessmentComplete,
  isTeamSelected: isTeamSelectedProp = true,
  onTeamSelectedChange
}) => {
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedModel, setSelectedModel] = useState(MODELS[1]); // Default to GPT-4
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const isTeamSelected = isTeamSelectedProp;
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [showUserTooltip, setShowUserTooltip] = useState(false);
  const [showTeamTooltip, setShowTeamTooltip] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showModelDropdown && !target.closest('.model-dropdown')) {
        setShowModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelDropdown]);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = mockHistoryData;
        // const response = await fetch(API_ENDPOINTS.HISTORY_GET);
        {// if (response.ok) {
          // const data = await response.json();
          if (data.status === 'success' && data.history) {
            // Convert backend format to frontend format
            const history: AssessmentHistoryItem[] = data.history.map((item: any) => ({
              id: item.id,
              productName: item.productName,
              timestamp: new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              status: 'success' as const,
              trustScore: item.trustScore,
              riskLevel: item.riskLevel,
              assessmentData: item.assessmentData
            }));
            setAssessmentHistory(history);
          }
        }
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const currentInput = inputValue;
      setInputValue('');

      // Check if this is an assessment request
      const assessmentRequest = parseAssessmentRequest(currentInput);

      if (!assessmentRequest) {
        // Not an assessment request - ignore or show error
        return;
      }

      // Override model with user's selection
      assessmentRequest.model = selectedModel.id;

      // Add to history as loading
      const historyItem: AssessmentHistoryItem = {
        id: Date.now().toString(),
        productName: assessmentRequest.product_name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'loading'
      };

      setAssessmentHistory(prev => [historyItem, ...prev]);
      setIsLoading(true);

      try {
        // Call security-radar-api for assessment
        const assessment = await assessProduct(assessmentRequest);

        // Transform assessment data
        const transformedData = transformAssessmentResponse(assessment, assessmentRequest.model || 'mock');

        // Update history item to success with risk level and assessment data
        setAssessmentHistory(prev =>
          prev.map(item =>
            item.id === historyItem.id
              ? {
                  ...item,
                  status: 'success' as const,
                  trustScore: transformedData.summary.trust_score,
                  riskLevel: transformedData.summary.risk_level as 'Low' | 'Medium' | 'High',
                  assessmentData: transformedData
                }
              : item
          )
        );

        // Set as selected and pass assessment data to parent for display in MainContent
        setSelectedId(historyItem.id);
        if (onAssessmentComplete) {
          onAssessmentComplete(transformedData);
        }

        // Save to persistent history
        try {
          await fetch(API_ENDPOINTS.HISTORY_SAVE, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: historyItem.id,
              productName: assessmentRequest.product_name,
              trustScore: transformedData.summary.trust_score,
              riskLevel: transformedData.summary.risk_level,
              assessmentData: transformedData
            })
          });
        } catch (error) {
          console.error('Error saving to history:', error);
        }
      } catch (error) {
        console.error('Error processing assessment:', error);

        // Update history item to error
        setAssessmentHistory(prev =>
          prev.map(item =>
            item.id === historyItem.id
              ? { ...item, status: 'error' as const }
              : item
          )
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/30';
      case 'high':
        return 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30';
      default:
        return 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/30';
    }
  };

  const getRiskBadgeColor = (riskLevel?: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleHistoryItemClick = (item: AssessmentHistoryItem) => {
    if (item.status === 'success' && item.assessmentData && onAssessmentComplete) {
      setSelectedId(item.id);
      onAssessmentComplete(item.assessmentData);
    }
  };

  const handleDeleteHistory = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // Prevent triggering the item click

    try {
      // Delete from backend
      const response = await fetch(`${API_ENDPOINTS.HISTORY_DELETE}/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete history item');
      }

      // Remove from local state
      setAssessmentHistory(prev => prev.filter(item => item.id !== itemId));

      // Clear selection if the deleted item was selected
      if (selectedId === itemId) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const handleAddButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type (CSV or text files)
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload to CSV endpoint
      const response = await fetch(API_ENDPOINTS.CSV_INPUT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      console.log('File upload result:', result);

      // Optionally trigger assessments for uploaded products
      // You can implement batch assessment logic here
      alert(`File uploaded successfully! Found ${result.products?.length || 0} products.`);

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-96 transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assessment History</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recent security checks</p>
      </div>

      {/* Assessment History List */}
      <div className="flex-1 overflow-y-scroll p-4 space-y-2 custom-scrollbar">
        {isLoadingHistory && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Loading history...</p>
          </div>
        )}

        {!isLoadingHistory && assessmentHistory.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No assessments yet</p>
            <p className="text-xs mt-2">Type "Check [Product]" to start</p>
          </div>
        )}

        {!isLoadingHistory && assessmentHistory.map((item) => (
          <div
            key={item.id}
            onClick={() => handleHistoryItemClick(item)}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              item.status === 'success' ? 'cursor-pointer hover:shadow-md' : ''
            } ${
              selectedId === item.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            } ${
              item.status === 'loading'
                ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30'
                : item.status === 'error'
                ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30'
                : getRiskColor(item.riskLevel)
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {item.status === 'loading' && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {item.status === 'error' && (
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Check {item.productName}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</p>
                  {item.status === 'success' && item.trustScore !== undefined && (
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getRiskBadgeColor(item.riskLevel)}`}>
                        {item.riskLevel}
                      </span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {item.trustScore}/100
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Delete button */}
              <button
                onClick={(e) => handleDeleteHistory(e, item.id)}
                className="ml-2 p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Delete assessment"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
        {/* Input Area */}
        <div className="flex-1 relative mb-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Check [Company/Product Name]"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,application/vnd.ms-excel"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Add button - File Upload */}
            <button
              onClick={handleAddButtonClick}
              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Upload CSV file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>

            {/* Team/Group button */}
            <div className="relative">
              <button
                onClick={() => {
                  if (onTeamSelectedChange) {
                    onTeamSelectedChange(true);
                  }
                  setIsUserSelected(false);
                }}
                onMouseEnter={() => setShowTeamTooltip(true)}
                onMouseLeave={() => setShowTeamTooltip(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isTeamSelected
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>

              {/* Custom Tooltip */}
              {showTeamTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap pointer-events-none z-50">
                  Team
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>

            {/* User button */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserSelected(true);
                  if (onTeamSelectedChange) {
                    onTeamSelectedChange(false);
                  }
                }}
                onMouseEnter={() => setShowUserTooltip(true)}
                onMouseLeave={() => setShowUserTooltip(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isUserSelected
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Custom Tooltip */}
              {showUserTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap pointer-events-none z-50">
                  Engineer
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Model Selector Dropdown */}
            <div className="relative model-dropdown">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <span>{selectedModel.name}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showModelDropdown && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        selectedModel.id === model.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-gray-500 dark:text-gray-400">{model.provider}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send/Submit button */}
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
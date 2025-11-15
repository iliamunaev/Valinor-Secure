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
  isSidebarCollapsed: boolean;
  onAssessmentComplete?: (data: SecurityData) => void;
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

const MODELS: ModelConfig[] = [
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
];

const ChatPanel: React.FC<ChatPanelProps> = ({ isSidebarCollapsed, onAssessmentComplete }) => {
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedModel, setSelectedModel] = useState(MODELS[1]); // Default to GPT-4
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isTeamSelected, setIsTeamSelected] = useState(false);
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
        const response = await fetch(API_ENDPOINTS.HISTORY_GET);
        if (response.ok) {
          const data = await response.json();
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
            placeholder="How's it going? Ask the team to..."
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
                  setIsTeamSelected(true);
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
                  setIsTeamSelected(false);
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
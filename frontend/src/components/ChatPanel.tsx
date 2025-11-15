import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { parseAssessmentRequest, assessProduct, formatAssessmentResponse } from '../utils/assessmentHelper';
import { transformAssessmentResponse } from '../utils/assessmentTransformer';

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
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isSidebarCollapsed, onAssessmentComplete }) => {
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

        // Update history item to success
        setAssessmentHistory(prev =>
          prev.map(item =>
            item.id === historyItem.id
              ? { ...item, status: 'success' as const }
              : item
          )
        );

        // Transform and pass assessment data to parent for display in MainContent
        if (onAssessmentComplete) {
          const transformedData = transformAssessmentResponse(assessment, assessmentRequest.model || 'mock');
          onAssessmentComplete(transformedData);
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-96 transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assessment History</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recent security checks</p>
      </div>

      {/* Assessment History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {assessmentHistory.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No assessments yet</p>
            <p className="text-xs mt-2">Type "Check [Product]" to start</p>
          </div>
        )}

        {assessmentHistory.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              item.status === 'success'
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : item.status === 'error'
                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {item.status === 'loading' && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {item.status === 'success' && (
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="flex items-end space-x-2">
          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Check Cloudflare, Check Slack, Check Zoom..."
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
        </div>
        
        {/* Bottom toolbar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
          <div className="flex items-center space-x-4">
            <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Claude Sonnet 4</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <button className="p-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l3-3m0 0l3 3m-3-3v6m0-6V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
import { useState } from 'react';
import { ScanHistory } from '../App';
import { HistoryItem } from './HistoryItem';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Link as LinkIcon } from 'lucide-react';
import { getScanHistory } from "../api/get/getScanHistory";
import { IconButton } from '../ui/icon-button';

// AI Agents configuration
export const AI_AGENTS = [
  {
    id: "gpt",
    // name: "GPT-4",
    icon: "/assets/chatgpt.png"
  },
  {
    id: "claude",
    // name: "Claude",
    icon: "/assets/cloude.png"
  },
  {
    id: "deepseek",
    // name: "DeepSeek",
    icon: "/assets/deepseek.png"
  }
];

interface InspectionPanelProps {
  scanHistory: ScanHistory[];
  setScanHistory: (data: ScanHistory[]) => void;
  onScan?: (url: string) => void;
}

export function InspectionPanel({ scanHistory, setScanHistory, onScan }: InspectionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('gpt'); // Default to GPT-4

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getScanHistory();
      console.log("Assessment report:", data);
      
      // Convert assessment data to scan history format
      if (data && data.meta && data.summary) {
        const riskLevelMap: { [key: string]: 'safe' | 'warning' | 'critical' } = {
          'Low': 'safe',
          'Medium': 'warning',
          'High': 'critical'
        };

        const scanEntry: ScanHistory = {
          id: Date.now().toString(),
          url: data.meta.input || 'https://app.acmecloud.example',
          securityLevel: riskLevelMap[data.summary.risk_level] || 'warning',
          timestamp: new Date(data.meta.generated_at || Date.now()),
          score: data.summary.trust_score || 68
        };

        setScanHistory([scanEntry]);
        console.log("Scan history updated:", [scanEntry]);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    if (urlInput.trim() && onScan) {
      const url = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
      console.log("Scanning URL:", url, "with agent:", selectedAgent);
      
      // You can pass the selected agent to your onScan function if needed
      // For now, we'll just call onScan with the URL
      onScan(url);
      setUrlInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <div className="w-96 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-white">Website Inspector</h2>
      </div>
      
      {/* AI Agent Selection */}
      <div className="p-4 border-b border-gray-800">
          <div className="flex gap-3 justify-center">
            {AI_AGENTS.map((agent) => (
              <IconButton
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                isActive={selectedAgent === agent.id}
                className="p-0"
              >
                <img 
                  src={agent.icon}
                  alt={agent.id}
                  className="w-8 h-8 object-contain"
                />
              </IconButton>
            ))}
          </div>
      </div>

      {/* URL Input Section */}
      <div className="p-4 border-b border-gray-800">
        {/* URL Input */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <LinkIcon className="w-4 h-4" />
            </div>
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter website URL"
              className="pl-10 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
            />
          </div>
          
          <Button
            onClick={handleScan}
            disabled={!urlInput.trim()}
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            Scan Website
          </Button>
        </div>
        {/* <Button
          onClick={loadHistory}
          disabled={loading}
          className="w-full"
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Loading..." : "Load Scan History"}
        </Button> */}
      </div>

      {/* History Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-gray-400 mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-cyan-500 rounded-full" />
          Scan History
        </h3>
        
        <div className="space-y-3">
          {scanHistory.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </div>

        {scanHistory.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No scan history yet</p>
            <p className="mt-1">Enter a URL above or load history</p>
          </div>
        )}
        
        {loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3"></div>
            <p>Loading scan history...</p>
          </div>
        )}
      </div>
    </div>
  );
}

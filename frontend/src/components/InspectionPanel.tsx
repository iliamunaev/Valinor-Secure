import { useState } from 'react';
import { ScanHistory } from '../App';
import { HistoryItem } from './HistoryItem';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Link as LinkIcon } from 'lucide-react';

interface InspectionPanelProps {
  scanHistory: ScanHistory[];
  onScan: (url: string) => void;
}

export function InspectionPanel({ scanHistory, onScan }: InspectionPanelProps) {
  const [urlInput, setUrlInput] = useState('');

  const handleScan = () => {
    if (urlInput.trim()) {
      const url = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
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
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-cyan-400 mb-4">Website Inspector</h2>
        
        {/* URL Input */}
        <div className="space-y-3">
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
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <Search className="w-4 h-4 mr-2" />
            Scan Website
          </Button>
        </div>
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

        {scanHistory.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No scans yet</p>
            <p className="mt-1">Enter a URL above to start</p>
          </div>
        )}
      </div>
    </div>
  );
}

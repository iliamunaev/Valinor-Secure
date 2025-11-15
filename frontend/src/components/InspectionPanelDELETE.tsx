import { useState } from 'react';
import { ScanHistory } from '../App';
import { HistoryItem } from './HistoryItem';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';
import { getScanHistory } from "../api/get/getScanHistory";

interface InspectionPanelProps {
  scanHistory: ScanHistory[];
  setScanHistory: (data: ScanHistory[]) => void;
}

export function InspectionPanel({ scanHistory, setScanHistory }: InspectionPanelProps) {
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getScanHistory();
	  console.log("Assessment report:", data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 bg-gray-900 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-cyan-400 mb-4">Website Inspector</h2>

        <Button
          onClick={loadHistory}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Loading..." : "Load Scan History"}
        </Button>
      </div>

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
            <p className="mt-1">Press the button above to load</p>
          </div>
        )}
      </div>
    </div>
  );
}

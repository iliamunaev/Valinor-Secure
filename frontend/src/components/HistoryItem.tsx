import { ScanHistory } from '../App';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Shield, AlertTriangle, AlertCircle, ExternalLink } from 'lucide-react';

interface HistoryItemProps {
  item: ScanHistory;
}

export function HistoryItem({ item }: HistoryItemProps) {
  const getSecurityConfig = (level: ScanHistory['securityLevel']) => {
    switch (level) {
      case 'safe':
        return {
          icon: Shield,
          label: 'Safe',
          badgeClass: 'bg-green-500/10 text-green-400 border-green-500/20',
          iconClass: 'text-green-400',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          label: 'Warning',
          badgeClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
          iconClass: 'text-yellow-400',
        };
      case 'critical':
        return {
          icon: AlertCircle,
          label: 'Critical',
          badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
          iconClass: 'text-red-400',
        };
    }
  };

  const config = getSecurityConfig(item.securityLevel);
  const Icon = config.icon;

  const formatUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-gray-100 truncate mb-1">{formatUrl(item.url)}</p>
          <p className="text-gray-500">{getTimeAgo(item.timestamp)}</p>
        </div>
        <Icon className={`w-5 h-5 shrink-0 ml-2 ${config.iconClass}`} />
      </div>

      <div className="flex items-center justify-between">
        <Badge className={`${config.badgeClass} border`}>
          {config.label} • {item.score}/100
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-7 px-2"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Details
        </Button>
      </div>
    </div>
  );
}

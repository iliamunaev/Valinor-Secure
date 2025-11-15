import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
// import { InspectionPanelDELETE} from './components/InspectionPanelDELETE';
import { InspectionPanel} from './components/InspectionPanel';
import { assess } from "./api/send/sendScan";
import { getScanHistory } from './api/get/getScanHistory';
import { API_URL } from "./config";
import { getUserId } from "./api/send/user";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ScanHistory {
  id: string;
  url: string;
  securityLevel: 'safe' | 'warning' | 'critical';
  timestamp: Date;
  score: number;
}

export interface Post {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: Date;
  likes: number;
  reposts: number;
  replies: number;
}

export default function App() {
  const [activeNav, setActiveNav] = useState<'apps' | 'websites'>('websites');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your cybersecurity AI assistant. How can I help you secure your digital assets today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
  ]);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);

  // Load scan history from backend on component mount
  useEffect(() => {
    const loadScanHistory = async () => {
      try {
        console.log("Loading scan history from backend...");
        const assessmentData = await getScanHistory();
        console.log("Assessment data received:", assessmentData);
        
        // Convert ASSESS_EXAMPLE data to scan history format
        if (assessmentData && assessmentData.meta && assessmentData.summary) {
          const riskLevelMap: { [key: string]: 'safe' | 'warning' | 'critical' } = {
            'Low': 'safe',
            'Medium': 'warning',
            'High': 'critical'
          };

          const scanEntry: ScanHistory = {
            id: '1',
            url: assessmentData.meta.input || 'https://app.acmecloud.example',
            securityLevel: riskLevelMap[assessmentData.summary.risk_level] || 'warning',
            timestamp: new Date(assessmentData.meta.generated_at || Date.now()),
            score: assessmentData.summary.trust_score || 68
          };

          setScanHistory([scanEntry]);
          console.log("Scan history updated:", [scanEntry]);
        } else {
          console.log("No valid assessment data found, using empty scan history");
          setScanHistory([]);
        }
      } catch (error) {
        console.error("Failed to load scan history:", error);
        // Set empty array on error instead of hardcoded data
        setScanHistory([]);
      }
    };

    loadScanHistory();
  }, []); // Empty dependency array - load once on mount

  const handleScan = async (url: string) => {
    try {
      console.log("Scanning URL:", url);
      // You can add your scan logic here
      // For now, let's add it to scan history as a placeholder
      const newScan: ScanHistory = {
        id: Date.now().toString(),
        url: url,
        securityLevel: 'safe',
        timestamp: new Date(),
        score: 85
      };
      
      setScanHistory(prev => [newScan, ...prev]);
    } catch (error) {
      console.error("Scan failed:", error);
    }
  };

  const handleSendMessage = async (url: string, model: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: url,
      timestamp: new Date(),
    }]);
  
    try {
      const data = await assess(url, model);
  
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: JSON.stringify(data, null, 2),
        timestamp: new Date(),
      }]);
  
    } catch (err) {
      console.error("Scan failed", err);
    }
  };
  
  
  // const handleSendMessage = (content: string) => {
  //   const userMessage: Message = {
  //     id: Date.now().toString(),
  //     role: 'user',
  //     content,
  //     timestamp: new Date(),
  //   };
    
  //   setMessages([...messages, userMessage]);

  //   // Simulate AI response
  //   setTimeout(() => {
  //     const assistantMessage: Message = {
  //       id: (Date.now() + 1).toString(),
  //       role: 'assistant',
  //       content: 'I\'ve analyzed your query. Based on current threat intelligence, I recommend implementing multi-factor authentication and regular security audits for your infrastructure.',
  //       timestamp: new Date(),
  //     };
  //     setMessages((prev) => [...prev, assistantMessage]);
  //   }, 1000);
  // };

  // const handleScan = (url: string) => {
  //   const securityLevels: Array<'safe' | 'warning' | 'critical'> = ['safe', 'warning', 'critical'];
  //   const randomLevel = securityLevels[Math.floor(Math.random() * securityLevels.length)];
  //   const score = randomLevel === 'safe' ? 85 + Math.floor(Math.random() * 15) : 
  //                 randomLevel === 'warning' ? 50 + Math.floor(Math.random() * 35) :
  //                 Math.floor(Math.random() * 50);
    
  //   const newScan: ScanHistory = {
  //     id: Date.now().toString(),
  //     url,
  //     securityLevel: randomLevel,
  //     timestamp: new Date(),
  //     score,
  //   };
    
  //   setScanHistory([newScan, ...scanHistory]);
  // };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="flex h-screen overflow-hidden">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
        
        <div className="flex-1 flex overflow-hidden">
        {/* <ChatPanel messages={messages} onSendMessage={handleSendMessage} /> */}
          {/* <InspectionPanel scanHistory={scanHistory}/> */}
          <div className="flex-1 flex overflow-hidden">
          {/* <InspectionPanelDELETE 
            scanHistory={scanHistory}
            setScanHistory={setScanHistory}
           /> */}
          <InspectionPanel
            scanHistory={scanHistory}
            setScanHistory={setScanHistory}
            onScan={handleScan}
           />
          {/* <ChatPanel messages={messages} onSendMessage={handleSendMessage} /> */}
</div>
        </div>
      </div>
    </div>
  );
}

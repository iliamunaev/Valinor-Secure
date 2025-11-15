import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { InspectionPanel } from './components/InspectionPanel';

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
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([
    {
      id: '1',
      url: 'https://github.com',
      securityLevel: 'safe',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      score: 98,
    },
    {
      id: '2',
      url: 'https://suspicious-site.com',
      securityLevel: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      score: 65,
    },
    {
      id: '3',
      url: 'https://malicious-example.net',
      securityLevel: 'critical',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      score: 23,
    },
    {
      id: '4',
      url: 'https://google.com',
      securityLevel: 'safe',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      score: 99,
    },
  ]);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'ve analyzed your query. Based on current threat intelligence, I recommend implementing multi-factor authentication and regular security audits for your infrastructure.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleScan = (url: string) => {
    const securityLevels: Array<'safe' | 'warning' | 'critical'> = ['safe', 'warning', 'critical'];
    const randomLevel = securityLevels[Math.floor(Math.random() * securityLevels.length)];
    const score = randomLevel === 'safe' ? 85 + Math.floor(Math.random() * 15) : 
                  randomLevel === 'warning' ? 50 + Math.floor(Math.random() * 35) :
                  Math.floor(Math.random() * 50);
    
    const newScan: ScanHistory = {
      id: Date.now().toString(),
      url,
      securityLevel: randomLevel,
      timestamp: new Date(),
      score,
    };
    
    setScanHistory([newScan, ...scanHistory]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="flex h-screen overflow-hidden">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
        
        <div className="flex-1 flex overflow-hidden">
          <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
          <InspectionPanel scanHistory={scanHistory} onScan={handleScan} />
        </div>
      </div>
    </div>
  );
}

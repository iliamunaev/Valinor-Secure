import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import ChatPanel from '../components/ChatPanel';
import Header from '../components/Header';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function Index() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        {/* Global Header */}
        <Header />
        
        {/* Main Layout */}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          />
          
          {/* Chat Panel */}
          <ChatPanel isSidebarCollapsed={isSidebarCollapsed} />
          
          {/* Main Content */}
          <MainContent />
        </div>
      </div>
    </ThemeProvider>
  );
}
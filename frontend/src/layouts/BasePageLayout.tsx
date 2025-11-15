import { useState, ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ThemeProvider } from '../contexts/ThemeContext';

interface BasePageLayoutProps {
  children: ReactNode;
  showTeamMembers?: boolean;
}

const BasePageLayout: React.FC<BasePageLayoutProps> = ({
  children,
  showTeamMembers = true
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        {/* Global Header */}
        <Header showTeamMembers={showTeamMembers} />

        {/* Main Layout - use fixed height calculation */}
        <div className="flex fixed top-16 left-0 right-0 bottom-0">
          {/* Sidebar */}
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          {/* Page Content */}
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default BasePageLayout;

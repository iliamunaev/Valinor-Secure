import React from 'react';
import ThemeToggle from './ThemeToggle';
import TeamSelector from './TeamSelector';

const Header: React.FC = () => {
  return (
    <div className="w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 transition-colors duration-200">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 bg-[transparent] opacity-100">Valinor-Secure</h1>
      </div>
      <div className="flex items-center space-x-4">
        <TeamSelector />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;

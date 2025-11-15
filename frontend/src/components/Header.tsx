import React from 'react';
import ThemeToggle from './ThemeToggle';
import TeamSelector from './TeamSelector';

// Team members data
const teamMembers = [
  { id: 1, name: 'Mike', color: 'bg-orange-400', initials: 'M' },
  { id: 2, name: 'Jake', color: 'bg-blue-400', initials: 'J' },
  { id: 3, name: 'Sam', color: 'bg-purple-400', initials: 'S' },
];

interface HeaderProps {
  showTeamMembers: boolean;
}

const Header: React.FC<HeaderProps> = ({ showTeamMembers }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 transition-colors duration-200">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 bg-[transparent] opacity-100">Valinor-Secure</h1>
      </div>
      <div className="flex items-center space-x-4">

        {/* Team Members Display */}

        <div className="flex items-center -space-x-2">
        {teamMembers.map((member, index) => (
          <div
            key={member.id}
            className="relative group"
            style={{ zIndex: teamMembers.length - index }}
            title={member.name}
          >
            <div className={`w-10 h-10 ${member.color} rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-white dark:border-gray-900 hover:scale-110 transition-transform cursor-pointer`}>
              {member.initials}
            </div>
          </div>
        ))}
        </div>

        <TeamSelector />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;

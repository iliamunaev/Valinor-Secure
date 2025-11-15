import React from 'react';
import ThemeToggle from './ThemeToggle';
import TeamSelector from './TeamSelector';

// Team members data
const teamMembers = [
  { id: 3, name: 'Sam', role: 'Leader', color: 'bg-purple-400', initials: 'S' },
  { id: 1, name: 'Mike', role: 'Analyst', color: 'bg-orange-400', initials: 'M' },
  { id: 2, name: 'Jake', role: 'Tester', color: 'bg-blue-400', initials: 'J' },
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

        {/* Team Members Display - Only show when isTeamSelected is true */}
        {showTeamMembers && (
          <div className="flex items-center -space-x-2">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className="relative group"
              style={{ zIndex: teamMembers.length - index }}
            >
              {/* Team Member Avatar */}
              <div className={`w-10 h-10 ${member.color} rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-white dark:border-gray-900 hover:scale-110 transition-all duration-200 cursor-pointer`}>
                {member.initials}
              </div>

              {/* Tooltip - Below avatar (arrow pointing down) */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                {/* Arrow pointing down */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-px">
                  <div className="border-8 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
                </div>
                <div className="bg-gray-900 dark:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
                  {member.name} : {member.role}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        <TeamSelector />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;

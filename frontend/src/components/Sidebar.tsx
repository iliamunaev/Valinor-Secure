import { Globe, Grid3x3 } from 'lucide-react';

interface SidebarProps {
  activeNav: 'apps' | 'websites';
  onNavChange: (nav: 'apps' | 'websites') => void;
}

export function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const navItems = [
    { id: 'apps' as const, label: 'Apps', icon: Grid3x3 },
    { id: 'websites' as const, label: 'Websites', icon: Globe },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white rounded" />
          </div>
          <div>
            <h1 className="text-cyan-400">Valinor</h1>
            <p className="text-gray-400">Security Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Threat Level</span>
            <span className="text-green-400">Low</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

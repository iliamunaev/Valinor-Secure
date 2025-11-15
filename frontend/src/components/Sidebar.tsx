import { Globe, Grid3x3 } from 'lucide-react';

interface SidebarProps {
  activeNav: 'apps' | 'websites';
  onNavChange: (nav: 'apps' | 'websites') => void;
  className?: string;
}

export function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const navItems = [
    { id: 'apps' as const, label: 'Apps', icon: Grid3x3 },
    { id: 'websites' as const, label: 'Websites', icon: Globe },
  ];

  return (
    <div className="w-68 bg-gray-900 border-r border-[#3a3f46] flex flex-col pr-5">
      <div className="p-6 border-b border-gray-800 mr-5 text-center">
        <div className="flex items-center gap-2 mr-4">
			<img 
			  src="public/assets/logo.png" 
			  alt="Logo"
			  className="w-20 h-20 rounded-lg object-cover"
			/>
	          <div className="text-right">
	            <h1 className="text-[#0fe4f1]">Valinor</h1>
	            <p className="text-gray-400">Security Dashboard</p>
	          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 justify-end pt-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={` w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all ${
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

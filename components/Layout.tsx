
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBack?: () => void;
  lastSaved?: Date | null;
  barName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onBack, lastSaved, barName }) => {
  const tabs = [
    { id: 'workers', label: 'Staff', icon: 'fa-users' },
    { id: 'requirements', label: 'Needs', icon: 'fa-clipboard-list' },
    { id: 'schedule', label: 'Schedule', icon: 'fa-calendar-alt' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
                title="Back to Establishments"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            )}
            <div className="flex items-center space-x-3 border-l border-slate-700 pl-4">
              <div className="bg-amber-500 p-1.5 rounded-lg">
                <i className="fas fa-beer text-slate-900 text-sm"></i>
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight uppercase">{barName || 'BarShift Master'}</h1>
                {lastSaved && (
                  <p className="text-[9px] text-gray-500 font-medium">
                    Auto-saved {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <nav className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md text-xs font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-900'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <i className={`fas ${tab.icon} text-[10px]`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500 space-y-2 sm:space-y-0 uppercase font-black tracking-widest">
          <p>&copy; 2024 BarShift Master</p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Encrypted Local Storage</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span>Gemini 3 Pro Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;


import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
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
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <i className="fas fa-beer text-slate-900 text-xl"></i>
            </div>
            <h1 className="text-xl font-bold tracking-tight">BarShift Master</h1>
          </div>
          
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-900'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <i className={`fas ${tab.icon}`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-xs text-gray-500">
          <p>&copy; 2024 BarShift Master - Smart Scheduling</p>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Gemini AI Optimization Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

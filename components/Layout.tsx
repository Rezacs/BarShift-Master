
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBack?: () => void;
  lastSaved?: Date | null;
  barName?: string;
  user?: User;
  onLogout?: () => void;
  onEditProfile?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onBack, 
  lastSaved, 
  barName, 
  user, 
  onLogout,
  onEditProfile 
}) => {
  const tabs = [
    { id: 'workers', label: 'Staff', icon: 'fa-users' },
    { id: 'tags', label: 'Roles', icon: 'fa-tags' },
    { id: 'requirements', label: 'Needs', icon: 'fa-clipboard-list' },
    { id: 'schedule', label: 'Schedule', icon: 'fa-calendar-alt' },
  ];

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {onBack && (
              <button 
                type="button"
                onClick={onBack}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-all text-slate-400 hover:text-white border border-slate-700"
                title="Back to Establishments"
              >
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
            )}
            <div className="flex items-center space-x-4 border-l border-slate-800 pl-6">
              <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/20">
                <i className="fas fa-beer text-slate-900 text-base"></i>
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight uppercase leading-none">{barName || 'BarShift Master'}</h1>
                {lastSaved && (
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Sync: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {activeTab !== '' && (
              <nav className="hidden md:flex items-center space-x-1 bg-slate-950/50 p-1 rounded-2xl border border-slate-800">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab.id
                        ? 'bg-amber-50 text-slate-950 shadow-lg'
                        : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <i className={`fas ${tab.icon} text-[10px]`}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            )}

            {user && (
              <div className="flex items-center space-x-4 border-l border-slate-800 pl-6">
                <div className="text-right hidden lg:block">
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Manager</p>
                  <p className="text-[11px] font-black text-amber-500 tracking-tight truncate max-w-[100px]">@{user.username}</p>
                </div>
                <div className="flex gap-2 relative z-[70]">
                  <button 
                    type="button"
                    onClick={onEditProfile}
                    className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-amber-500 hover:border-amber-500/50 transition-all flex items-center justify-center cursor-pointer"
                    aria-label="Account Settings"
                    title="Account Settings"
                  >
                    <i className="fas fa-user-circle text-sm"></i>
                  </button>
                  <button 
                    type="button"
                    onClick={handleLogoutClick}
                    className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                    aria-label="Logout Session"
                    title="Logout Session"
                  >
                    <i className="fas fa-power-off text-sm"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-[9px] text-gray-400 space-y-4 sm:space-y-0 uppercase font-black tracking-[0.2em]">
          <p>&copy; 2024 BarShift Master • Intelligent Rostering</p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5">
              <span className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              <span>Secure Local Data</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
              <span>Gemini AI Connected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

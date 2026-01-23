
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import StaffList from './components/StaffList';
import RequirementsGrid from './components/RequirementsGrid';
import ScheduleView from './components/ScheduleView';
import BarManager from './components/BarManager';
import Auth from './components/Auth';
import ProfileModal from './components/ProfileModal';
import { Worker, DayOfWeek, StaffingRequirement, ScheduleEntry, Bar, User } from './types';
import { DAYS, getHoursForDay } from './constants';
import { GeminiScheduler } from './services/geminiService';

const AUTH_STORAGE_KEY = 'bar_shift_master_session';
const USERS_STORAGE_KEY = 'bar_shift_master_users';
const DATA_STORAGE_PREFIX = 'bar_shift_master_user_';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [bars, setBars] = useState<Bar[]>([]);
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('workers');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const savedData = localStorage.getItem(`${DATA_STORAGE_PREFIX}${currentUser.id}_bars`);
      if (savedData) {
        try {
          setBars(JSON.parse(savedData));
          setLastSaved(new Date());
        } catch (e) {
          console.error("Failed to parse bars", e);
        }
      } else {
        setBars([]);
      }
    } else {
      setBars([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && bars.length > 0) {
      localStorage.setItem(`${DATA_STORAGE_PREFIX}${currentUser.id}_bars`, JSON.stringify(bars));
      setLastSaved(new Date());
    }
  }, [bars, currentUser]);

  const currentBar = bars.find(b => b.id === selectedBarId);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
    setSelectedBarId(null);
    setActiveTab('workers');
  };

  const handleUpdateUser = (updatedUser: User) => {
    const allUsersStr = localStorage.getItem(USERS_STORAGE_KEY);
    if (allUsersStr) {
      const allUsers: User[] = JSON.parse(allUsersStr);
      const updatedList = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));
    }
    setCurrentUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const handleAddBar = (bar: Bar) => setBars(prev => [...prev, bar]);
  
  const handleUpdateBar = (updatedBar: Bar) => {
    setBars(prev => prev.map(b => b.id === updatedBar.id ? updatedBar : b));
  };

  const handleDeleteBar = (id: string) => {
    if (window.confirm("Permanently delete this establishment?")) {
      setBars(prev => {
        const updated = prev.filter(b => b.id !== id);
        if (currentUser) {
          localStorage.setItem(`${DATA_STORAGE_PREFIX}${currentUser.id}_bars`, JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  const updateCurrentBar = (updates: Partial<Bar>) => {
    if (!selectedBarId) return;
    setBars(prev => prev.map(b => b.id === selectedBarId ? { ...b, ...updates } : b));
  };

  const handleAddWorker = (worker: Worker) => {
    if (!currentBar) return;
    updateCurrentBar({ workers: [...currentBar.workers, worker] });
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    if (!currentBar) return;
    updateCurrentBar({ workers: currentBar.workers.map(w => w.id === updatedWorker.id ? updatedWorker : w) });
  };

  const handleRemoveWorker = (id: string) => {
    if (!currentBar || !window.confirm("Delete this staff profile?")) return;
    updateCurrentBar({
      workers: currentBar.workers.filter(w => w.id !== id),
      schedule: currentBar.schedule.filter(s => s.workerId !== id)
    });
  };

  const handleUpdateRequirement = (day: DayOfWeek, hour: number, count: number) => {
    if (!selectedBarId) return;
    setBars(prev => prev.map(b => {
      if (b.id !== selectedBarId) return b;
      const existingIdx = b.requirements.findIndex(r => r.day === day && r.hour === hour);
      let newReqs;
      if (existingIdx > -1) {
        newReqs = b.requirements.map((r, i) => i === existingIdx ? { ...r, neededCount: count } : r);
      } else {
        newReqs = [...b.requirements, { day, hour, neededCount: count }];
      }
      return { ...b, requirements: newReqs };
    }));
  };

  const handleUpdateRequirementsBulk = (updates: { day: DayOfWeek, hour: number, count: number }[]) => {
    if (!selectedBarId) return;
    setBars(prev => prev.map(b => {
      if (b.id !== selectedBarId) return b;
      let newReqs = [...b.requirements];
      updates.forEach(({ day, hour, count }) => {
        const existingIdx = newReqs.findIndex(r => r.day === day && r.hour === hour);
        if (existingIdx > -1) {
          newReqs[existingIdx] = { ...newReqs[existingIdx], neededCount: count };
        } else {
          newReqs.push({ day, hour, neededCount: count });
        }
      });
      return { ...b, requirements: newReqs };
    }));
  };

  const handleToggleScheduleEntry = (workerId: string, day: DayOfWeek, hour: number) => {
    if (!currentBar) return;
    const isAssigned = currentBar.schedule.some(s => s.workerId === workerId && s.day === day && s.hour === hour);
    
    let newSchedule;
    if (isAssigned) {
      newSchedule = currentBar.schedule.filter(s => !(s.workerId === workerId && s.day === day && s.hour === hour));
    } else {
      newSchedule = [...currentBar.schedule, { workerId, day, hour }];
    }
    updateCurrentBar({ schedule: newSchedule });
  };

  const generateSchedule = async () => {
    if (!currentBar || currentBar.workers.length === 0) return;
    setIsGenerating(true);
    try {
      const scheduler = new GeminiScheduler();
      const newSchedule = await scheduler.generateSchedule(currentBar.workers, currentBar.requirements, currentBar.operatingHours);
      updateCurrentBar({ schedule: newSchedule });
      setActiveTab('schedule');
    } catch (error) {
      alert("AI failed to compile schedule. Ensure requirements and staff numbers are compatible.");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = () => {
    if (!currentBar || currentBar.schedule.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,Day,Hour,Worker Name\n";
    DAYS.forEach(day => {
      const hours = getHoursForDay(currentBar.operatingHours[day]);
      hours.forEach(hour => {
        const staff = currentBar.schedule.filter(s => s.day === day && s.hour === hour);
        staff.forEach(s => {
          const w = currentBar.workers.find(worker => worker.id === s.workerId);
          if (w) csvContent += `${day},${hour}:00,${w.name}\n`;
        });
      });
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${currentBar.name}_schedule.csv`);
    link.click();
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <>
      {!selectedBarId ? (
        <Layout 
          user={currentUser} 
          onLogout={handleLogout} 
          onEditProfile={() => setShowProfileModal(true)} 
          activeTab="" 
          setActiveTab={() => {}}
        >
          <BarManager 
            bars={bars} 
            onAddBar={handleAddBar} 
            onUpdateBar={handleUpdateBar}
            onSelectBar={setSelectedBarId} 
            onDeleteBar={handleDeleteBar} 
          />
        </Layout>
      ) : (
        <Layout 
          user={currentUser} 
          onLogout={handleLogout} 
          onEditProfile={() => setShowProfileModal(true)} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onBack={() => setSelectedBarId(null)} 
          lastSaved={lastSaved}
          barName={currentBar?.name}
        >
          <div className="animate-in fade-in duration-500">
            {activeTab === 'workers' && (
              <StaffList 
                workers={currentBar.workers} 
                onAddWorker={handleAddWorker} 
                onUpdateWorker={handleUpdateWorker}
                onRemoveWorker={handleRemoveWorker} 
              />
            )}
            {activeTab === 'requirements' && (
              <RequirementsGrid 
                requirements={currentBar.requirements} 
                onUpdateRequirement={handleUpdateRequirement} 
                onUpdateRequirementsBulk={handleUpdateRequirementsBulk}
                totalWorkers={currentBar.workers.length}
                operatingHours={currentBar.operatingHours}
              />
            )}
            {activeTab === 'schedule' && (
              <ScheduleView 
                workers={currentBar.workers} 
                requirements={currentBar.requirements} 
                schedule={currentBar.schedule}
                isGenerating={isGenerating}
                onGenerate={generateSchedule}
                onExport={exportToCSV}
                operatingHours={currentBar.operatingHours}
                onToggleEntry={handleToggleScheduleEntry}
              />
            )}
          </div>
        </Layout>
      )}

      {showProfileModal && (
        <ProfileModal 
          user={currentUser} 
          onClose={() => setShowProfileModal(false)}
          onUpdate={handleUpdateUser}
        />
      )}
    </>
  );
};

export default App;

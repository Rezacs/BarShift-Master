
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import StaffList from './components/StaffList';
import TagManager from './components/TagManager';
import RequirementsGrid from './components/RequirementsGrid';
import ScheduleView from './components/ScheduleView';
import BarManager from './components/BarManager';
import Auth from './components/Auth';
import ProfileModal from './components/ProfileModal';
import { Worker, DayOfWeek, StaffingRequirement, ScheduleEntry, Bar, User, Tag } from './types';
import { DAYS, getHoursForDay } from './constants';
import { GeminiScheduler } from './services/geminiService';

const AUTH_STORAGE_KEY = 'bar_shift_master_session';
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
  const [aiError, setAiError] = useState<{title: string, message: string} | null>(null);

  useEffect(() => {
    if (currentUser) {
      const savedData = localStorage.getItem(`${DATA_STORAGE_PREFIX}${currentUser.id}_bars`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // Migrate old bars without tags
          const migrated = parsed.map((b: any) => ({
            ...b,
            tags: b.tags || [],
            workers: b.workers.map((w: any) => ({ ...w, tagIds: w.tagIds || [] }))
          }));
          setBars(migrated);
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
    setCurrentUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const handleAddBar = (bar: Bar) => setBars(prev => [...prev, bar]);
  const handleUpdateBar = (updatedBar: Bar) => setBars(prev => prev.map(b => b.id === updatedBar.id ? updatedBar : b));
  
  const handleDeleteBar = (id: string) => {
    if (window.confirm("Permanently delete this establishment?")) {
      setBars(prev => prev.filter(b => b.id !== id));
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
      schedule: currentBar.schedule.filter(s => s.workerId !== id),
      requirements: currentBar.requirements.map(r => ({
        ...r,
        mandatoryWorkerIds: r.mandatoryWorkerIds?.filter(mid => mid !== id) || []
      }))
    });
  };

  const handleAddTag = (tag: Tag) => {
    if (!currentBar) return;
    updateCurrentBar({ tags: [...currentBar.tags, tag] });
  };

  const handleUpdateTag = (updatedTag: Tag) => {
    if (!currentBar) return;
    updateCurrentBar({ tags: currentBar.tags.map(t => t.id === updatedTag.id ? updatedTag : t) });
  };

  const handleRemoveTag = (id: string) => {
    if (!currentBar || !window.confirm("Delete this role/skill tag? It will be removed from all staff.")) return;
    updateCurrentBar({
      tags: currentBar.tags.filter(t => t.id !== id),
      workers: currentBar.workers.map(w => ({
        ...w,
        tagIds: w.tagIds.filter(tid => tid !== id)
      }))
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
        newReqs = [...b.requirements, { day, hour, neededCount: count, mandatoryWorkerIds: [] }];
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
          newReqs.push({ day, hour, neededCount: count, mandatoryWorkerIds: [] });
        }
      });
      return { ...b, requirements: newReqs };
    }));
  };

  const handleToggleMandatoryWorker = (day: DayOfWeek, hour: number, workerId: string) => {
    if (!selectedBarId || !currentBar) return;
    setBars(prev => prev.map(b => {
      if (b.id !== selectedBarId) return b;
      const reqIdx = b.requirements.findIndex(r => r.day === day && r.hour === hour);
      let newReqs = [...b.requirements];
      let newSchedule = [...b.schedule];
      if (reqIdx > -1) {
        const req = newReqs[reqIdx];
        const mandatoryIds = req.mandatoryWorkerIds || [];
        const isAlreadyMandatory = mandatoryIds.includes(workerId);
        if (isAlreadyMandatory) {
          newReqs[reqIdx] = { ...req, mandatoryWorkerIds: mandatoryIds.filter(id => id !== workerId) };
          newSchedule = newSchedule.filter(s => !(s.workerId === workerId && s.day === day && s.hour === hour));
        } else {
          const updatedMandatory = [...mandatoryIds, workerId];
          newReqs[reqIdx] = { 
            ...req, 
            mandatoryWorkerIds: updatedMandatory,
            neededCount: Math.max(req.neededCount, updatedMandatory.length)
          };
          if (!newSchedule.some(s => s.workerId === workerId && s.day === day && s.hour === hour)) {
            newSchedule.push({ workerId, day, hour });
          }
        }
      } else {
        newReqs.push({ day, hour, neededCount: 1, mandatoryWorkerIds: [workerId] });
        newSchedule.push({ workerId, day, hour });
      }
      return { ...b, requirements: newReqs, schedule: newSchedule };
    }));
  };

  const handleToggleScheduleEntry = (workerId: string, day: DayOfWeek, hour: number) => {
    if (!currentBar) return;
    const isAssigned = currentBar.schedule.some(s => s.workerId === workerId && s.day === day && s.hour === hour);
    let newSchedule = isAssigned 
      ? currentBar.schedule.filter(s => !(s.workerId === workerId && s.day === day && s.hour === hour))
      : [...currentBar.schedule, { workerId, day, hour }];
    updateCurrentBar({ schedule: newSchedule });
  };

  const generateSchedule = async () => {
    if (!currentBar || currentBar.workers.length === 0) return;
    
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    }

    setIsGenerating(true);
    setAiError(null);

    try {
      const scheduler = new GeminiScheduler();
      const newSchedule = await scheduler.generateSchedule(currentBar.workers, currentBar.requirements, currentBar.operatingHours);
      updateCurrentBar({ schedule: newSchedule });
      setActiveTab('schedule');
    } catch (error: any) {
      console.error("AI Generation Error Details:", error);
      let title = "Generation Failed";
      let message = error.message || "An unknown technical error occurred during AI processing.";
      
      if (message.includes("quota") || message.includes("429")) {
        title = "Resource Quota Exceeded";
        message = "Your API project has run out of credits or reached its daily request limit. Please check your billing at ai.google.dev or try switching to Gemini Flash.";
      } else if (message.includes("entity was not found")) {
        title = "API Connection Error";
        message = "The selected API Key could not be found. Please try re-selecting your key in the API Studio dialog.";
      }
      
      setAiError({ title, message: `${message}\n\nTechnical Trace: ${error.stack || 'No stack trace available'}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyErrorToClipboard = () => {
    if (aiError) {
      navigator.clipboard.writeText(`Title: ${aiError.title}\nDetails: ${aiError.message}`);
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
    link.setAttribute("download", `${currentBar.name.replace(/\s+/g, '_')}_schedule.csv`);
    link.click();
  };

  if (!currentUser) return <Auth onLogin={handleLogin} />;

  return (
    <>
      {!selectedBarId ? (
        <Layout user={currentUser} onLogout={handleLogout} onEditProfile={() => setShowProfileModal(true)} activeTab="" setActiveTab={() => {}}>
          <BarManager bars={bars} onAddBar={handleAddBar} onUpdateBar={handleUpdateBar} onSelectBar={setSelectedBarId} onDeleteBar={handleDeleteBar} />
        </Layout>
      ) : (
        <Layout user={currentUser} onLogout={handleLogout} onEditProfile={() => setShowProfileModal(true)} activeTab={activeTab} setActiveTab={setActiveTab} onBack={() => setSelectedBarId(null)} lastSaved={lastSaved} barName={currentBar?.name}>
          <div className="animate-in fade-in duration-500">
            {activeTab === 'workers' && (
              <StaffList workers={currentBar.workers} tags={currentBar.tags} onAddWorker={handleAddWorker} onUpdateWorker={handleUpdateWorker} onRemoveWorker={handleRemoveWorker} />
            )}
            {activeTab === 'tags' && (
              <TagManager tags={currentBar.tags} onAddTag={handleAddTag} onUpdateTag={handleUpdateTag} onRemoveTag={handleRemoveTag} />
            )}
            {activeTab === 'requirements' && (
              <RequirementsGrid 
                requirements={currentBar.requirements} workers={currentBar.workers}
                onUpdateRequirement={handleUpdateRequirement} onUpdateRequirementsBulk={handleUpdateRequirementsBulk}
                onToggleMandatoryWorker={handleToggleMandatoryWorker} totalWorkers={currentBar.workers.length}
                operatingHours={currentBar.operatingHours}
              />
            )}
            {activeTab === 'schedule' && (
              <ScheduleView 
                workers={currentBar.workers} requirements={currentBar.requirements} schedule={currentBar.schedule}
                isGenerating={isGenerating} onGenerate={generateSchedule} onExport={exportToCSV}
                operatingHours={currentBar.operatingHours} onToggleEntry={handleToggleScheduleEntry}
              />
            )}
          </div>
        </Layout>
      )}

      {showProfileModal && <ProfileModal user={currentUser} onClose={() => setShowProfileModal(false)} onUpdate={handleUpdateUser} />}

      {/* AI Error Diagnostic Modal */}
      {aiError && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-red-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-red-500 p-8 text-white flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
                <h2 className="text-xl font-black uppercase tracking-widest">{aiError.title}</h2>
              </div>
              <button onClick={() => setAiError(null)} className="hover:bg-red-600 w-10 h-10 rounded-full flex items-center justify-center transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-8">
              <p className="text-slate-500 text-sm mb-4 font-bold uppercase tracking-wider">Diagnostic Information:</p>
              <div className="bg-slate-900 rounded-2xl p-6 mb-6">
                <pre className="text-amber-400 text-xs font-mono whitespace-pre-wrap break-all max-h-60 overflow-y-auto custom-scrollbar">
                  {aiError.message}
                </pre>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={copyErrorToClipboard}
                  className="flex-1 bg-amber-500 text-slate-900 font-black py-4 rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center space-x-2 uppercase text-xs tracking-widest shadow-lg shadow-amber-500/10"
                >
                  <i className="fas fa-copy"></i>
                  <span>Copy Technical Details</span>
                </button>
                <button 
                  onClick={() => setAiError(null)}
                  className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;

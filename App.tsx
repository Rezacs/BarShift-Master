
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import StaffList from './components/StaffList';
import RequirementsGrid from './components/RequirementsGrid';
import ScheduleView from './components/ScheduleView';
import BarManager from './components/BarManager';
import { Worker, DayOfWeek, StaffingRequirement, ScheduleEntry, Bar } from './types';
import { DAYS, getHoursForDay } from './constants';
import { GeminiScheduler } from './services/geminiService';

const STORAGE_KEY = 'bar_shift_master_multi_v1';

const getInitialBars = (): Bar[] => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error("Failed to parse saved bars", e);
    }
  }
  return [];
};

const App: React.FC = () => {
  const [bars, setBars] = useState<Bar[]>(getInitialBars());
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('workers');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(bars.length > 0 ? new Date() : null);

  const currentBar = bars.find(b => b.id === selectedBarId);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bars));
    setLastSaved(new Date());
  }, [bars]);

  // Actions for Bars
  const handleAddBar = (bar: Bar) => setBars(prev => [...prev, bar]);
  
  const handleUpdateBar = (updatedBar: Bar) => {
    setBars(prev => prev.map(b => b.id === updatedBar.id ? updatedBar : b));
  };

  const handleDeleteBar = (id: string) => {
    if (window.confirm("Are you sure? All data for this bar will be lost.")) {
      setBars(prev => prev.filter(b => b.id !== id));
    }
  };

  const updateCurrentBar = (updates: Partial<Bar>) => {
    if (!selectedBarId) return;
    setBars(prev => prev.map(b => b.id === selectedBarId ? { ...b, ...updates } : b));
  };

  // Actions for Staff/Requirements/Schedule (scoped to current bar)
  const handleAddWorker = (worker: Worker) => {
    if (!currentBar) return;
    updateCurrentBar({ workers: [...currentBar.workers, worker] });
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    if (!currentBar) return;
    updateCurrentBar({ workers: currentBar.workers.map(w => w.id === updatedWorker.id ? updatedWorker : w) });
  };

  const handleRemoveWorker = (id: string) => {
    if (!currentBar || !window.confirm("Remove this staff member?")) return;
    updateCurrentBar({
      workers: currentBar.workers.filter(w => w.id !== id),
      schedule: currentBar.schedule.filter(s => s.workerId !== id)
    });
  };

  const handleUpdateRequirement = (day: DayOfWeek, hour: number, count: number) => {
    if (!currentBar) return;
    const existing = currentBar.requirements.find(r => r.day === day && r.hour === hour);
    let newReqs;
    if (existing) {
      newReqs = currentBar.requirements.map(r => (r.day === day && r.hour === hour) ? { ...r, neededCount: count } : r);
    } else {
      newReqs = [...currentBar.requirements, { day, hour, neededCount: count }];
    }
    updateCurrentBar({ requirements: newReqs });
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
      alert("Scheduling failed. Try again.");
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

  if (!selectedBarId) {
    return (
      <BarManager 
        bars={bars} 
        onAddBar={handleAddBar} 
        onUpdateBar={handleUpdateBar}
        onSelectBar={setSelectedBarId} 
        onDeleteBar={handleDeleteBar} 
      />
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onBack={() => setSelectedBarId(null)} 
      lastSaved={lastSaved}
      barName={currentBar?.name}
    >
      <div className="animate-in fade-in duration-500">
        {activeTab === 'workers' && currentBar && (
          <StaffList 
            workers={currentBar.workers} 
            onAddWorker={handleAddWorker} 
            onUpdateWorker={handleUpdateWorker}
            onRemoveWorker={handleRemoveWorker} 
          />
        )}
        {activeTab === 'requirements' && currentBar && (
          <RequirementsGrid 
            requirements={currentBar.requirements} 
            onUpdateRequirement={handleUpdateRequirement} 
            totalWorkers={currentBar.workers.length}
            operatingHours={currentBar.operatingHours}
          />
        )}
        {activeTab === 'schedule' && currentBar && (
          <ScheduleView 
            workers={currentBar.workers} 
            requirements={currentBar.requirements} 
            schedule={currentBar.schedule}
            isGenerating={isGenerating}
            onGenerate={generateSchedule}
            onExport={exportToCSV}
            operatingHours={currentBar.operatingHours}
          />
        )}
      </div>
    </Layout>
  );
};

export default App;

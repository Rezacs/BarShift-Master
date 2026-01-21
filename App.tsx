
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import StaffList from './components/StaffList';
import RequirementsGrid from './components/RequirementsGrid';
import ScheduleView from './components/ScheduleView';
import { Worker, DayOfWeek, StaffingRequirement, ScheduleEntry } from './types';
import { DAYS, HOURS } from './constants';
import { GeminiScheduler } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workers');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [requirements, setRequirements] = useState<StaffingRequirement[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize requirements
  useEffect(() => {
    const initialReqs: StaffingRequirement[] = [];
    DAYS.forEach(day => {
      HOURS.forEach(hour => {
        initialReqs.push({ day, hour, neededCount: 0 });
      });
    });
    setRequirements(initialReqs);
  }, []);

  const handleAddWorker = (worker: Worker) => {
    setWorkers(prev => [...prev, worker]);
  };

  const handleRemoveWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    setSchedule(prev => prev.filter(s => s.workerId !== id));
  };

  const handleUpdateRequirement = (day: DayOfWeek, hour: number, count: number) => {
    setRequirements(prev => prev.map(r => 
      (r.day === day && r.hour === hour) ? { ...r, neededCount: count } : r
    ));
  };

  const generateSchedule = async () => {
    if (workers.length === 0) return;
    
    setIsGenerating(true);
    try {
      const scheduler = new GeminiScheduler();
      const newSchedule = await scheduler.generateSchedule(workers, requirements);
      setSchedule(newSchedule);
      setActiveTab('schedule');
    } catch (error) {
      alert("Scheduling failed. Please check your console and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = () => {
    if (schedule.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,Day,Hour,Worker Name\n";
    
    DAYS.forEach(day => {
      HOURS.forEach(hour => {
        const staff = schedule.filter(s => s.day === day && s.hour === hour);
        staff.forEach(s => {
          const w = workers.find(worker => worker.id === s.workerId);
          if (w) {
            csvContent += `${day},${hour}:00,${w.name}\n`;
          }
        });
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bar_schedule_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in duration-500">
        {activeTab === 'workers' && (
          <StaffList 
            workers={workers} 
            onAddWorker={handleAddWorker} 
            onRemoveWorker={handleRemoveWorker} 
          />
        )}
        {activeTab === 'requirements' && (
          <RequirementsGrid 
            requirements={requirements} 
            onUpdateRequirement={handleUpdateRequirement} 
            totalWorkers={workers.length}
          />
        )}
        {activeTab === 'schedule' && (
          <ScheduleView 
            workers={workers} 
            requirements={requirements} 
            schedule={schedule}
            isGenerating={isGenerating}
            onGenerate={generateSchedule}
            onExport={exportToCSV}
          />
        )}
      </div>
    </Layout>
  );
};

export default App;


import React, { useState } from 'react';
import { Worker, StaffingRequirement, ScheduleEntry, DayOfWeek, OperatingHours } from '../types';
// Removed unused HOURS from import to resolve the missing member error
import { DAYS, formatHour, getHoursForDay } from '../constants';

interface ScheduleViewProps {
  workers: Worker[];
  requirements: StaffingRequirement[];
  schedule: ScheduleEntry[];
  isGenerating: boolean;
  onGenerate: () => void;
  onExport: () => void;
  operatingHours: Record<DayOfWeek, OperatingHours>;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ 
  workers, 
  requirements, 
  schedule, 
  isGenerating,
  onGenerate,
  onExport,
  operatingHours
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'individual'>('overview');

  const getStaffForSlot = (day: DayOfWeek, hour: number) => {
    return schedule
      .filter(s => s.day === day && s.hour === hour)
      .map(s => workers.find(w => w.id === s.workerId))
      .filter((w): w is Worker => !!w);
  };

  const getWorkerShiftsForDay = (workerId: string, day: DayOfWeek) => {
    return schedule
      .filter(s => s.workerId === workerId && s.day === day)
      .sort((a, b) => a.hour - b.hour);
  };

  const getDayStaffCount = (day: DayOfWeek, hour: number) => {
    return requirements.find(r => r.day === day && r.hour === hour)?.neededCount || 0;
  };

  const isEmpty = schedule.length === 0;
  // Maintaining internal hour tracking for the grid view
  const allHours = Array.from({length: 24}, (_, i) => i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Schedule</h2>
          <p className="text-gray-500">AI optimized roster for your establishment.</p>
        </div>
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => setViewMode('overview')}
            className={`px-4 py-1.5 text-xs font-black uppercase tracking-tight rounded-md transition-all ${viewMode === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Bar Overview
          </button>
          <button 
            onClick={() => setViewMode('individual')}
            className={`px-4 py-1.5 text-xs font-black uppercase tracking-tight rounded-md transition-all ${viewMode === 'individual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Staff View
          </button>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onGenerate}
            disabled={isGenerating || workers.length === 0}
            className={`px-6 py-2 rounded-xl font-black uppercase tracking-widest text-xs flex items-center space-x-2 transition-all ${
              isGenerating || workers.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
            }`}
          >
            {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
            <span>{isGenerating ? 'Analyzing...' : 'Auto-Generate'}</span>
          </button>
          <button
            onClick={onExport}
            disabled={isEmpty}
            className={`px-6 py-2 rounded-xl font-black uppercase tracking-widest text-xs flex items-center space-x-2 transition-all ${
              isEmpty ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white text-slate-900 border border-gray-300 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <i className="fas fa-download"></i>
            <span>Export</span>
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-24 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-300 mb-6">
            <i className="fas fa-calendar-alt text-3xl"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-900">No Active Schedule</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">Generate a schedule to see staff distribution across operating hours.</p>
        </div>
      ) : viewMode === 'overview' ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-4 text-xs font-black uppercase sticky left-0 bg-slate-900 z-10 w-24 border-r border-slate-800">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="p-4 text-xs font-black uppercase text-center min-w-[150px] border-l border-slate-800">
                      {day.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allHours.map(hour => {
                  const isOpenAnywhere = DAYS.some(d => {
                    const config = operatingHours[d];
                    return hour >= config.open && hour <= config.close;
                  });

                  if (!isOpenAnywhere) return null;

                  return (
                    <tr key={hour} className="group hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-xs font-bold text-slate-400 bg-white sticky left-0 border-r border-slate-100">
                        {formatHour(hour)}
                      </td>
                      {DAYS.map(day => {
                        const config = operatingHours[day];
                        const isOpen = hour >= config.open && hour <= config.close;
                        const staff = getStaffForSlot(day, hour);
                        const needed = getDayStaffCount(day, hour);
                        const isUnderstaffed = isOpen && staff.length < needed;
                        
                        return (
                          <td key={day} className={`p-2 align-top border-l border-slate-50 ${!isOpen ? 'bg-slate-50/50' : isUnderstaffed && needed > 0 ? 'bg-red-50/30' : ''}`}>
                            {isOpen ? (
                              <div className="space-y-1">
                                {staff.map(w => (
                                  <div key={w.id} className={`text-[10px] border rounded px-1.5 py-1 shadow-sm truncate ${w.isFlexible ? 'bg-slate-100 border-slate-300 text-slate-500 italic' : 'bg-white border-slate-200 font-bold text-slate-700'}`}>
                                    {w.name}
                                  </div>
                                ))}
                                {isUnderstaffed && needed > 0 && (
                                  <div className="text-[9px] text-red-500 font-black bg-white rounded px-1.5 py-1 border border-red-200 flex items-center justify-center space-x-1 animate-pulse uppercase">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>Missing {needed - staff.length}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-4 flex items-center justify-center">
                                <span className="text-[9px] text-slate-300 font-black uppercase tracking-tighter">Closed</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {workers.map(worker => {
            const workerShifts = schedule.filter(s => s.workerId === worker.id);
            if (workerShifts.length === 0) return null;
            return (
              <div key={worker.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-none">{worker.name}</h3>
                      {worker.isFlexible && <span className="text-[9px] bg-amber-100 px-2 py-0.5 rounded-full font-black text-amber-700 uppercase tracking-widest mt-1 inline-block">Backup</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block uppercase font-black tracking-widest mb-1">Weekly Target</span>
                    <span className="text-xl font-black text-amber-600">{workerShifts.length}h</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {DAYS.map(day => {
                      const dayShifts = getWorkerShiftsForDay(worker.id, day);
                      if (dayShifts.length === 0) return null;
                      return (
                        <div key={day} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <span className="text-xs font-black uppercase text-slate-500 w-24">{day}</span>
                          <div className="flex-1 text-right">
                            <span className="text-sm font-black text-slate-800">
                              {formatHour(dayShifts[0].hour)} — {formatHour(dayShifts[dayShifts.length - 1].hour + 1)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-bold">{dayShifts.length} Hours Shift</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScheduleView;

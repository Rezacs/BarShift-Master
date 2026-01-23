
import React, { useState } from 'react';
import { Worker, StaffingRequirement, ScheduleEntry, DayOfWeek, OperatingHours } from '../types';
import { DAYS, formatHour } from '../constants';

interface ScheduleViewProps {
  workers: Worker[];
  requirements: StaffingRequirement[];
  schedule: ScheduleEntry[];
  isGenerating: boolean;
  onGenerate: () => void;
  onExport: () => void;
  operatingHours: Record<DayOfWeek, OperatingHours>;
  onToggleEntry: (workerId: string, day: DayOfWeek, hour: number) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ 
  workers, 
  requirements, 
  schedule, 
  isGenerating,
  onGenerate,
  onExport,
  operatingHours,
  onToggleEntry
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'individual'>('overview');
  const [activePicker, setActivePicker] = useState<{day: DayOfWeek, hour: number} | null>(null);

  const getStaffForSlot = (day: DayOfWeek, hour: number) => {
    return schedule
      .filter(s => s.day === day && s.hour === hour)
      .map(s => workers.find(w => w.id === s.workerId))
      .filter((w): w is Worker => !!w);
  };

  const getDayStaffCount = (day: DayOfWeek, hour: number) => {
    return requirements.find(r => r.day === day && r.hour === hour)?.neededCount || 0;
  };

  const isEmpty = schedule.length === 0;
  const allHours = Array.from({length: 24}, (_, i) => i);

  const Picker = ({ day, hour }: { day: DayOfWeek, hour: number }) => {
    const currentStaffIds = getStaffForSlot(day, hour).map(w => w.id);
    const availableStaff = workers.filter(w => !currentStaffIds.includes(w.id));

    return (
      <div className="absolute z-[100] mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 min-w-[180px] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[10px] font-black uppercase text-slate-400">Available Staff</span>
          <button onClick={() => setActivePicker(null)} className="text-slate-300 hover:text-slate-600 transition-colors"><i className="fas fa-times"></i></button>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-1">
          {availableStaff.length === 0 ? (
            <p className="text-[10px] text-slate-400 italic p-2">All staff assigned</p>
          ) : availableStaff.map(w => (
            <button
              key={w.id}
              onClick={() => {
                onToggleEntry(w.id, day, hour);
                setActivePicker(null);
              }}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                <span>{w.name}</span>
              </div>
              <i className="fas fa-plus text-[8px] opacity-0 group-hover:opacity-100 transition-opacity text-amber-500"></i>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Roster</h2>
          <p className="text-slate-500 text-sm">Balanced & optimized for 8h max shifts.</p>
        </div>
        <div className="flex bg-[#E3E3E8]/50 p-1 rounded-2xl border border-slate-200/50">
          <button 
            onClick={() => setViewMode('overview')}
            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setViewMode('individual')}
            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'individual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            By Worker
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onGenerate}
            disabled={isGenerating || workers.length === 0}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
            <span>{isGenerating ? 'Computing...' : 'AI Generate'}</span>
          </button>
          <button
            onClick={onExport}
            disabled={isEmpty}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30"
          >
            <i className="fas fa-download"></i>
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 py-24 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-6">
            <i className="fas fa-calendar-alt text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Roster Empty</h3>
          <p className="text-slate-400 text-sm mt-2">Use the AI Generate button to create a balanced schedule.</p>
        </div>
      ) : viewMode === 'overview' ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest sticky left-0 bg-slate-900 z-10 w-24 border-r border-slate-800">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="p-4 text-[10px] font-black uppercase tracking-widest text-center min-w-[150px] border-l border-slate-800">
                      {day.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allHours.map(hour => {
                  const isOpenAnywhere = DAYS.some(d => {
                    const config = operatingHours[d];
                    return hour >= config.open && hour < config.close;
                  });

                  if (!isOpenAnywhere) return null;

                  return (
                    <tr key={hour} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-xs font-black text-slate-900 bg-white sticky left-0 border-r border-slate-100 flex items-center justify-between">
                        <span>{formatHour(hour)}</span>
                      </td>
                      {DAYS.map(day => {
                        const config = operatingHours[day];
                        const isOpen = hour >= config.open && hour < config.close;
                        const staff = getStaffForSlot(day, hour);
                        const needed = getDayStaffCount(day, hour);
                        const isUnderstaffed = isOpen && staff.length < needed;
                        const isPickerActive = activePicker?.day === day && activePicker?.hour === hour;
                        
                        return (
                          <td key={day} className={`p-3 align-top border-l border-slate-50 ${!isOpen ? 'bg-slate-50/50' : isUnderstaffed && needed > 0 ? 'bg-red-50/20' : ''}`}>
                            {isOpen ? (
                              <div className="relative">
                                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                                  {staff.map(w => (
                                    <div 
                                      key={w.id} 
                                      className={`group/tag inline-flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-[10px] font-black transition-all shadow-sm text-white`}
                                      style={{ backgroundColor: w.color, borderColor: 'rgba(0,0,0,0.1)' }}
                                    >
                                      <span className="truncate">{w.name}</span>
                                      <button 
                                        onClick={() => onToggleEntry(w.id, day, hour)}
                                        className="opacity-0 group-hover/tag:opacity-100 transition-opacity hover:scale-125"
                                      >
                                        <i className="fas fa-times-circle"></i>
                                      </button>
                                    </div>
                                  ))}
                                  
                                  <button 
                                    onClick={() => setActivePicker(isPickerActive ? null : {day, hour})}
                                    className={`w-8 h-8 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                                      isPickerActive ? 'bg-amber-100 border-amber-300 text-amber-600' : 'border-slate-100 text-slate-300 hover:border-slate-300 hover:text-slate-500'
                                    }`}
                                  >
                                    <i className={`fas ${isPickerActive ? 'fa-times' : 'fa-plus'} text-[10px]`}></i>
                                  </button>
                                </div>

                                {isPickerActive && <Picker day={day} hour={hour} />}

                                {isUnderstaffed && needed > 0 && !isPickerActive && (
                                  <div className="mt-2 text-[9px] text-red-500 font-black uppercase tracking-tighter flex items-center gap-1">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <span>Missing {needed - staff.length}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="py-2 flex justify-center opacity-20">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Off</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {workers.map(worker => {
            const workerShifts = schedule.filter(s => s.workerId === worker.id);
            if (workerShifts.length === 0) return null;
            return (
              <div key={worker.id} className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden hover:shadow-xl transition-all">
                <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-sm"
                      style={{ backgroundColor: worker.color }}
                    >
                      {worker.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{worker.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Personnel Detail</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-500">{workerShifts.length}h</span>
                    <span className="text-[10px] text-slate-300 font-black uppercase block tracking-widest">Weekly</span>
                  </div>
                </div>
                <div className="p-8 space-y-3">
                  {DAYS.map(day => {
                    const dayShifts = schedule.filter(s => s.workerId === worker.id && s.day === day).sort((a,b) => a.hour - b.hour);
                    if (dayShifts.length === 0) return null;
                    return (
                      <div key={day} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{day}</span>
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-800">
                            {formatHour(dayShifts[0].hour)} — {formatHour(dayShifts[dayShifts.length - 1].hour + 1)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{dayShifts.length} Hours Shift</span>
                        </div>
                      </div>
                    );
                  })}
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

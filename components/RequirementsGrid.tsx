
import React, { useState } from 'react';
import { DayOfWeek, StaffingRequirement, OperatingHours, Worker } from '../types';
import { DAYS, formatHour, getHoursForDay } from '../constants';

interface RequirementsGridProps {
  requirements: StaffingRequirement[];
  workers: Worker[];
  onUpdateRequirement: (day: DayOfWeek, hour: number, count: number) => void;
  onUpdateRequirementsBulk: (updates: { day: DayOfWeek, hour: number, count: number }[]) => void;
  onToggleMandatoryWorker: (day: DayOfWeek, hour: number, workerId: string) => void;
  totalWorkers: number;
  operatingHours: Record<DayOfWeek, OperatingHours>;
}

const RequirementsGrid: React.FC<RequirementsGridProps> = ({ 
  requirements, 
  workers,
  onUpdateRequirement, 
  onUpdateRequirementsBulk,
  onToggleMandatoryWorker,
  totalWorkers, 
  operatingHours 
}) => {
  const [activePicker, setActivePicker] = useState<{ day: DayOfWeek, hour: number } | null>(null);

  const getRequirement = (day: DayOfWeek, hour: number) => {
    return requirements.find(r => r.day === day && r.hour === hour);
  };

  const handleIncrement = (day: DayOfWeek, hour: number, currentCount: number) => {
    if (currentCount < totalWorkers) {
      onUpdateRequirement(day, hour, currentCount + 1);
    }
  };

  const bulkIncrementCol = (day: DayOfWeek) => {
    const hours = getHoursForDay(operatingHours[day]);
    const updates = hours.map(hour => {
      const req = getRequirement(day, hour);
      const current = req?.neededCount || 0;
      return {
        day,
        hour,
        count: Math.min(totalWorkers, current + 1)
      };
    });
    onUpdateRequirementsBulk(updates);
  };

  const bulkIncrementRow = (hour: number) => {
    const updates: { day: DayOfWeek, hour: number, count: number }[] = [];
    DAYS.forEach(day => {
      const config = operatingHours[day];
      const isOpen = hour >= config.open && hour < config.close;
      if (isOpen) {
        const req = getRequirement(day, hour);
        const current = req?.neededCount || 0;
        updates.push({
          day,
          hour,
          count: Math.min(totalWorkers, current + 1)
        });
      }
    });
    onUpdateRequirementsBulk(updates);
  };

  const WorkerPicker = ({ day, hour, currentIds }: { day: DayOfWeek, hour: number, currentIds: string[] }) => {
    return (
      <div className="absolute z-[100] mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 min-w-[160px] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Assign Mandatory</span>
          <button onClick={() => setActivePicker(null)} className="text-slate-300 hover:text-slate-600"><i className="fas fa-times"></i></button>
        </div>
        <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar">
          {workers.map(w => {
            const isSelected = currentIds.includes(w.id);
            return (
              <button
                key={w.id}
                onClick={() => onToggleMandatoryWorker(day, hour, w.id)}
                className={`w-full text-left p-2 rounded-xl text-[10px] font-bold flex items-center justify-between transition-all ${
                  isSelected ? 'bg-amber-50 text-amber-700' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                  <span className="truncate max-w-[80px]">{w.name}</span>
                </div>
                {isSelected && <i className="fas fa-check text-[8px]"></i>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const allHours = Array.from({length: 24}, (_, i) => i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staffing Needs</h2>
          <p className="text-slate-500 text-sm">Define headcount and <span className="text-amber-600 font-bold">mandatory staff</span> per hour.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">Total Staff</span>
            <span className="text-xl font-black text-slate-900">{totalWorkers} Available</span>
          </div>
          <div className="h-8 w-px bg-slate-100"></div>
          <div className="flex -space-x-2">
            {workers.slice(0, 5).map((w, i) => (
              <div key={w.id} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: w.color }}>
                {w.name.charAt(0)}
              </div>
            ))}
            {totalWorkers > 5 && <div className="text-[8px] font-black text-amber-600 ml-3">+{totalWorkers - 5}</div>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest sticky left-0 bg-slate-900 z-10 w-32 border-r border-slate-800">
                  Global Time
                </th>
                {DAYS.map(day => (
                  <th key={day} className="p-4 text-[10px] font-black uppercase tracking-widest text-center group border-l border-slate-800">
                    <div className="flex flex-col items-center space-y-3">
                      <span className="text-slate-400">{day.substring(0, 3)}</span>
                      <button 
                        onClick={() => bulkIncrementCol(day)}
                        className="w-8 h-8 bg-slate-800 hover:bg-amber-500 text-white rounded-xl transition-all flex items-center justify-center shadow-lg group-hover:scale-110"
                      >
                        <i className="fas fa-plus text-[10px]"></i>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allHours.map(hour => {
                const isOpenAnywhere = DAYS.some(d => {
                  const config = operatingHours[d];
                  return hour >= config.open && hour < config.close;
                });

                if (!isOpenAnywhere) return null;

                return (
                  <tr key={hour} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 bg-white sticky left-0 border-r border-slate-100 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{formatHour(hour)}</span>
                        <button
                          onClick={() => bulkIncrementRow(hour)}
                          className="w-6 h-6 bg-slate-100 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                        >
                          <i className="fas fa-plus text-[8px]"></i>
                        </button>
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const config = operatingHours[day];
                      const isOpen = hour >= config.open && hour < config.close;
                      const req = getRequirement(day, hour);
                      const count = req?.neededCount || 0;
                      const mandatoryIds = req?.mandatoryWorkerIds || [];
                      const isPickerActive = activePicker?.day === day && activePicker?.hour === hour;
                      
                      return (
                        <td key={day} className={`p-3 align-top border-l border-slate-50/50 ${!isOpen ? 'bg-slate-50/30' : ''}`}>
                          {isOpen ? (
                            <div className="flex flex-col items-center space-y-3">
                              {/* Headcount Control */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => onUpdateRequirement(day, hour, Math.max(0, count - 1))}
                                  className="w-5 h-5 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                >
                                  <i className="fas fa-minus text-[7px]"></i>
                                </button>
                                
                                <div className={`w-8 h-8 flex items-center justify-center text-xs font-black rounded-xl transition-all ${
                                  count > 0 
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-inner' 
                                    : 'text-slate-300 border border-transparent'
                                }`}>
                                  {count}
                                </div>

                                <button
                                  onClick={() => handleIncrement(day, hour, count)}
                                  className="w-5 h-5 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:bg-green-50 hover:text-green-600 transition-all"
                                >
                                  <i className="fas fa-plus text-[7px]"></i>
                                </button>
                              </div>

                              {/* Mandatory Staff Section */}
                              <div className="w-full relative">
                                <div className="flex flex-wrap justify-center gap-1 min-h-[20px]">
                                  {mandatoryIds.map(id => {
                                    const w = workers.find(worker => worker.id === id);
                                    if (!w) return null;
                                    return (
                                      <button
                                        key={id}
                                        onClick={() => onToggleMandatoryWorker(day, hour, id)}
                                        className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[7px] font-black text-white shadow-sm hover:scale-110 transition-transform"
                                        style={{ backgroundColor: w.color }}
                                        title={`Required: ${w.name}`}
                                      >
                                        {w.name.charAt(0)}
                                      </button>
                                    );
                                  })}
                                  <button 
                                    onClick={() => setActivePicker(isPickerActive ? null : { day, hour })}
                                    className={`w-5 h-5 rounded-full border border-dashed flex items-center justify-center transition-all ${
                                      isPickerActive ? 'bg-amber-100 border-amber-300 text-amber-500' : 'border-slate-200 text-slate-300 hover:border-slate-400 hover:text-slate-500'
                                    }`}
                                  >
                                    <i className={`fas ${isPickerActive ? 'fa-times' : 'fa-user-plus'} text-[7px]`}></i>
                                  </button>
                                </div>
                                {isPickerActive && <WorkerPicker day={day} hour={hour} currentIds={mandatoryIds} />}
                              </div>
                            </div>
                          ) : (
                            <div className="py-2 flex justify-center opacity-20">
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Off</span>
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
    </div>
  );
};

export default RequirementsGrid;

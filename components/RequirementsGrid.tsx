
import React from 'react';
import { DayOfWeek, StaffingRequirement, OperatingHours } from '../types';
import { DAYS, formatHour, getHoursForDay } from '../constants';

interface RequirementsGridProps {
  requirements: StaffingRequirement[];
  onUpdateRequirement: (day: DayOfWeek, hour: number, count: number) => void;
  totalWorkers: number;
  operatingHours: Record<DayOfWeek, OperatingHours>;
}

const RequirementsGrid: React.FC<RequirementsGridProps> = ({ requirements, onUpdateRequirement, totalWorkers, operatingHours }) => {
  const getRequirement = (day: DayOfWeek, hour: number) => {
    return requirements.find(r => r.day === day && r.hour === hour)?.neededCount || 0;
  };

  const handleIncrement = (day: DayOfWeek, hour: number, currentCount: number) => {
    if (currentCount < totalWorkers) {
      onUpdateRequirement(day, hour, currentCount + 1);
    }
  };

  const bulkIncrementCol = (day: DayOfWeek) => {
    const hours = getHoursForDay(operatingHours[day]);
    hours.forEach(hour => {
      const current = getRequirement(day, hour);
      if (current < totalWorkers) {
        onUpdateRequirement(day, hour, current + 1);
      }
    });
  };

  const bulkIncrementRow = (hour: number) => {
    DAYS.forEach(day => {
      const config = operatingHours[day];
      const isOpen = hour >= config.open && hour <= config.close;
      if (isOpen) {
        const current = getRequirement(day, hour);
        if (current < totalWorkers) {
          onUpdateRequirement(day, hour, current + 1);
        }
      }
    });
  };

  // Build the vertical axis: union of all operating hours
  const allHours = Array.from({length: 24}, (_, i) => i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staffing Needs</h2>
          <p className="text-slate-500 text-sm">Set required headcount per hour. Use the <i className="fas fa-plus-circle text-amber-500"></i> buttons for bulk updates.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">Total Staff</span>
            <span className="text-xl font-black text-slate-900">{totalWorkers} Available</span>
          </div>
          <div className="h-8 w-px bg-slate-100"></div>
          <div className="flex -space-x-2">
            {Array.from({length: Math.min(5, totalWorkers)}).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">
                {i + 1}
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
                        title={`Increase all ${day} requirements`}
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
                  return hour >= config.open && hour <= config.close;
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
                          title="Increase this hour for all days"
                        >
                          <i className="fas fa-plus text-[8px]"></i>
                        </button>
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const config = operatingHours[day];
                      const isOpen = hour >= config.open && hour <= config.close;
                      const count = getRequirement(day, hour);
                      
                      return (
                        <td key={day} className={`p-3 text-center border-l border-slate-50/50 ${!isOpen ? 'bg-slate-50/30' : ''}`}>
                          {isOpen ? (
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => onUpdateRequirement(day, hour, Math.max(0, count - 1))}
                                className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                              >
                                <i className="fas fa-minus text-[8px]"></i>
                              </button>
                              
                              <div className={`w-10 h-10 flex items-center justify-center text-sm font-black rounded-xl transition-all ${
                                count > 0 
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-inner' 
                                  : 'text-slate-300 border border-transparent'
                              }`}>
                                {count}
                              </div>

                              <button
                                onClick={() => handleIncrement(day, hour, count)}
                                className={`w-6 h-6 flex items-center justify-center rounded-lg border transition-all shadow-sm ${
                                  count >= totalWorkers 
                                    ? 'bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed' 
                                    : 'bg-white border-slate-200 text-slate-400 hover:bg-green-50 hover:text-green-600 hover:border-green-200'
                                }`}
                              >
                                <i className="fas fa-plus text-[8px]"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="py-2">
                              <span className="text-[9px] text-slate-200 font-black uppercase tracking-tighter select-none">Closed</span>
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
      
      <div className="flex items-center space-x-2 bg-amber-50 p-4 rounded-2xl border border-amber-100">
        <i className="fas fa-lightbulb text-amber-500"></i>
        <p className="text-xs text-amber-700 font-medium">
          <strong>Tip:</strong> The row buttons appear when you hover over the "Global Time" labels. They help you quickly set staffing for peak rushes like happy hour.
        </p>
      </div>
    </div>
  );
};

export default RequirementsGrid;

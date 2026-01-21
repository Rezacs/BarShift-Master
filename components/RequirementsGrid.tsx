
import React from 'react';
import { DayOfWeek, StaffingRequirement } from '../types';
import { HOURS, DAYS, formatHour } from '../constants';

interface RequirementsGridProps {
  requirements: StaffingRequirement[];
  onUpdateRequirement: (day: DayOfWeek, hour: number, count: number) => void;
  totalWorkers: number;
}

const RequirementsGrid: React.FC<RequirementsGridProps> = ({ requirements, onUpdateRequirement, totalWorkers }) => {
  const getRequirement = (day: DayOfWeek, hour: number) => {
    return requirements.find(r => r.day === day && r.hour === hour)?.neededCount || 0;
  };

  const handleIncrement = (day: DayOfWeek, hour: number, currentCount: number) => {
    if (currentCount < totalWorkers) {
      onUpdateRequirement(day, hour, currentCount + 1);
    }
  };

  const bulkIncrementRow = (hour: number) => {
    DAYS.forEach(day => {
      const current = getRequirement(day, hour);
      if (current < totalWorkers) {
        onUpdateRequirement(day, hour, current + 1);
      }
    });
  };

  const bulkIncrementCol = (day: DayOfWeek) => {
    HOURS.forEach(hour => {
      const current = getRequirement(day, hour);
      if (current < totalWorkers) {
        onUpdateRequirement(day, hour, current + 1);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staffing Needs</h2>
          <p className="text-gray-500">Set required headcount per hour</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase block tracking-widest">Max Allowed</span>
          <span className="text-xl font-bold text-slate-900">{totalWorkers} Workers Available</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 text-[10px] font-black uppercase text-center border-r border-slate-800">Bulk</th>
                <th className="p-3 text-xs font-bold uppercase sticky left-0 bg-slate-900 z-10 w-24">Hour</th>
                {DAYS.map(day => (
                  <th key={day} className="p-3 text-xs font-bold uppercase text-center group">
                    <div className="flex flex-col items-center space-y-2">
                      <span>{day.substring(0, 3)}</span>
                      <button 
                        onClick={() => bulkIncrementCol(day)}
                        className="w-5 h-5 bg-slate-700 hover:bg-amber-500 text-white rounded transition-colors flex items-center justify-center"
                        title="Increment whole day"
                      >
                        <i className="fas fa-arrow-down text-[8px]"></i>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {HOURS.map(hour => (
                <tr key={hour} className="hover:bg-amber-50/50 transition-colors">
                  <td className="p-1 text-center border-r border-gray-100">
                    <button 
                      onClick={() => bulkIncrementRow(hour)}
                      className="w-5 h-5 bg-gray-100 hover:bg-amber-500 text-gray-400 hover:text-white rounded transition-colors flex items-center justify-center mx-auto"
                      title="Increment whole hour"
                    >
                      <i className="fas fa-arrow-right text-[8px]"></i>
                    </button>
                  </td>
                  <td className="p-3 text-xs font-bold text-gray-500 bg-white sticky left-0 border-r border-gray-100">
                    {formatHour(hour)}
                  </td>
                  {DAYS.map(day => {
                    const count = getRequirement(day, hour);
                    return (
                      <td key={day} className="p-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onUpdateRequirement(day, hour, Math.max(0, count - 1))}
                            className="w-5 h-5 flex items-center justify-center rounded bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                            <i className="fas fa-minus text-[8px]"></i>
                          </button>
                          <div className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${count > 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'text-gray-300'}`}>
                            {count}
                          </div>
                          <button
                            onClick={() => handleIncrement(day, hour, count)}
                            className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${count >= totalWorkers ? 'bg-gray-50 text-gray-200 cursor-not-allowed' : 'bg-gray-50 text-gray-400 hover:bg-green-100 hover:text-green-600'}`}
                          >
                            <i className="fas fa-plus text-[8px]"></i>
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center space-x-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
        <i className="fas fa-shield-alt text-amber-500"></i>
        <p className="text-sm text-amber-700 font-medium">
          Smart Lock: Staffing needs are capped at your total staff size ({totalWorkers}) to prevent over-scheduling.
        </p>
      </div>
    </div>
  );
};

export default RequirementsGrid;

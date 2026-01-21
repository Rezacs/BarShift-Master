
import React from 'react';
import { Worker, StaffingRequirement, ScheduleEntry, DayOfWeek } from '../types';
import { HOURS, DAYS, formatHour } from '../constants';

interface ScheduleViewProps {
  workers: Worker[];
  requirements: StaffingRequirement[];
  schedule: ScheduleEntry[];
  isGenerating: boolean;
  onGenerate: () => void;
  onExport: () => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ 
  workers, 
  requirements, 
  schedule, 
  isGenerating,
  onGenerate,
  onExport
}) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Schedule</h2>
          <p className="text-gray-500">AI-optimized hourly assignments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onGenerate}
            disabled={isGenerating || workers.length === 0}
            className={`px-6 py-2 rounded-lg font-bold flex items-center space-x-2 transition-all ${
              isGenerating || workers.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md'
            }`}
          >
            {isGenerating ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-magic"></i>
            )}
            <span>{isGenerating ? 'Computing...' : 'Auto-Generate'}</span>
          </button>
          
          <button
            onClick={onExport}
            disabled={isEmpty}
            className={`px-6 py-2 rounded-lg font-bold flex items-center space-x-2 transition-all ${
              isEmpty
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white text-slate-900 border border-gray-300 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <i className="fas fa-download"></i>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-400 mb-4">
            <i className="fas fa-calendar-check text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Schedule Generated</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Once you've added staff and set your hourly needs, click "Auto-Generate" to create an AI-optimized schedule.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-4 text-xs font-bold uppercase sticky left-0 bg-slate-900 z-10 w-24">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="p-4 text-xs font-bold uppercase text-center min-w-[150px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {HOURS.map(hour => (
                  <tr key={hour} className="group hover:bg-indigo-50 transition-colors">
                    <td className="p-4 text-xs font-bold text-gray-500 bg-white sticky left-0 border-r border-gray-100">
                      {formatHour(hour)}
                    </td>
                    {DAYS.map(day => {
                      const staff = getStaffForSlot(day, hour);
                      const needed = getDayStaffCount(day, hour);
                      const isUnderstaffed = staff.length < needed;
                      
                      return (
                        <td key={day} className={`p-2 vertical-top ${isUnderstaffed && needed > 0 ? 'bg-red-50' : ''}`}>
                          <div className="space-y-1">
                            {staff.map(w => (
                              <div key={w.id} className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 shadow-sm truncate">
                                <span className="font-bold text-slate-700">{w.name}</span>
                              </div>
                            ))}
                            {staff.length === 0 && needed === 0 && (
                              <div className="text-[10px] text-gray-300 text-center py-1">-</div>
                            )}
                            {isUnderstaffed && needed > 0 && (
                              <div className="text-[10px] text-red-500 font-bold bg-white/50 rounded px-1 py-0.5 border border-red-100 flex items-center justify-center space-x-1">
                                <i className="fas fa-exclamation-triangle"></i>
                                <span>Missing {needed - staff.length}</span>
                              </div>
                            )}
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
      )}
    </div>
  );
};

export default ScheduleView;


import React, { useState } from 'react';
import { Worker, DayOfWeek, DayConstraint } from '../types';
import { HOURS, formatHour } from '../constants';

interface StaffListProps {
  workers: Worker[];
  onAddWorker: (worker: Worker) => void;
  onRemoveWorker: (id: string) => void;
}

const StaffList: React.FC<StaffListProps> = ({ workers, onAddWorker, onRemoveWorker }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [possibleStart, setPossibleStart] = useState(4);
  const [possibleEnd, setPossibleEnd] = useState(20);
  const [preferredStart, setPreferredStart] = useState(8);
  const [preferredEnd, setPreferredEnd] = useState(16);
  const [preferredDaysCount, setPreferredDaysCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Validation: Preferred must be within possible
    const finalPrefStart = Math.max(possibleStart, preferredStart);
    const finalPrefEnd = Math.min(possibleEnd, preferredEnd);

    const newWorker: Worker = {
      id: crypto.randomUUID(),
      name,
      possibleStart,
      possibleEnd,
      preferredStart: finalPrefStart,
      preferredEnd: finalPrefEnd,
      preferredDaysCount,
      constraints: {},
    };

    onAddWorker(newWorker);
    setName('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Roster</h2>
          <p className="text-gray-500">Manage availability and preferences</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
          <span>{showForm ? 'Cancel' : 'Add Staff'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>
            
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Limits</h4>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Possible Start</label>
                <select value={possibleStart} onChange={(e) => setPossibleStart(parseInt(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm">
                  {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Possible End</label>
                <select value={possibleEnd} onChange={(e) => setPossibleEnd(parseInt(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm">
                  {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 bg-amber-50 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest">Preferences</h4>
              <div>
                <label className="block text-xs font-semibold text-amber-700 mb-1">Preferred Start</label>
                <select value={preferredStart} onChange={(e) => setPreferredStart(parseInt(e.target.value))} className="w-full px-3 py-1.5 border border-amber-200 rounded-md text-sm bg-white">
                  {HOURS.filter(h => h >= possibleStart && h <= possibleEnd).map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-700 mb-1">Preferred End</label>
                <select value={preferredEnd} onChange={(e) => setPreferredEnd(parseInt(e.target.value))} className="w-full px-3 py-1.5 border border-amber-200 rounded-md text-sm bg-white">
                  {HOURS.filter(h => h >= possibleStart && h <= possibleEnd).map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Workload</h4>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">Target Days Per Week</label>
                <input 
                  type="number" 
                  min="1" 
                  max="7" 
                  value={preferredDaysCount} 
                  onChange={(e) => setPreferredDaysCount(parseInt(e.target.value))} 
                  className="w-full px-3 py-1.5 border border-blue-200 rounded-md text-sm bg-white"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="bg-amber-500 text-slate-900 font-bold px-6 py-2 rounded-lg hover:bg-amber-400 transition-colors shadow-sm">
              Register Worker
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map((worker) => (
          <div key={worker.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-gray-200">
                  {worker.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{worker.name}</h3>
                  <div className="flex items-center space-x-1 text-[10px] text-blue-600 font-bold uppercase tracking-tight">
                    <i className="fas fa-calendar-day"></i>
                    <span>{worker.preferredDaysCount} days/wk target</span>
                  </div>
                </div>
              </div>
              <button onClick={() => onRemoveWorker(worker.id)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-[10px] bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="block text-gray-400 font-bold uppercase mb-1">Possible Range</span>
                  <span className="text-gray-700 font-medium">{formatHour(worker.possibleStart)} - {formatHour(worker.possibleEnd)}</span>
                </div>
                <div className="text-[10px] bg-amber-50 p-2 rounded border border-amber-100">
                  <span className="block text-amber-400 font-bold uppercase mb-1">Preferred Range</span>
                  <span className="text-amber-700 font-medium">{formatHour(worker.preferredStart)} - {formatHour(worker.preferredEnd)}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Availability Constraints</span>
                {Object.keys(worker.constraints).length === 0 ? (
                  <p className="text-[10px] text-gray-400 italic mt-1">No daily overrides set</p>
                ) : (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(Object.entries(worker.constraints) as [string, DayConstraint][]).map(([day, cons]) => (
                      <span key={day} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded-full">
                        {day}: {cons.maxHour ? `Ends ${formatHour(cons.maxHour)}` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {workers.length === 0 && !showForm && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
            <i className="fas fa-users-slash text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No staff added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffList;

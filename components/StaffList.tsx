
import React, { useState, useEffect } from 'react';
import { Worker, DayOfWeek, DayConstraint } from '../types';
import { HOURS, DAYS, formatHour, WORKER_COLORS } from '../constants';

interface StaffListProps {
  workers: Worker[];
  onAddWorker: (worker: Worker) => void;
  onUpdateWorker: (worker: Worker) => void;
  onRemoveWorker: (id: string) => void;
}

const StaffList: React.FC<StaffListProps> = ({ workers, onAddWorker, onUpdateWorker, onRemoveWorker }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [possibleStart, setPossibleStart] = useState(4);
  const [possibleEnd, setPossibleEnd] = useState(20);
  const [preferredStart, setPreferredStart] = useState(8);
  const [preferredEnd, setPreferredEnd] = useState(16);
  const [preferredDaysCount, setPreferredDaysCount] = useState<number | string>(0);
  const [preferredDays, setPreferredDays] = useState<DayOfWeek[]>([]);
  const [unavailableDays, setUnavailableDays] = useState<DayOfWeek[]>([]);
  const [isFlexible, setIsFlexible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');

  const resetForm = () => {
    setName('');
    setPossibleStart(4);
    setPossibleEnd(20);
    setPreferredStart(8);
    setPreferredEnd(16);
    setPreferredDaysCount(0);
    setPreferredDays([]);
    setUnavailableDays([]);
    setIsFlexible(false);
    setSelectedColor('');
    setEditingWorkerId(null);
    setShowForm(false);
  };

  const handleEditClick = (worker: Worker) => {
    setName(worker.name);
    setPossibleStart(worker.possibleStart);
    setPossibleEnd(worker.possibleEnd);
    setPreferredStart(worker.preferredStart);
    setPreferredEnd(worker.preferredEnd);
    setPreferredDaysCount(worker.preferredDaysCount);
    setPreferredDays(worker.preferredDays || []);
    setUnavailableDays(worker.unavailableDays || []);
    setIsFlexible(worker.isFlexible || false);
    setSelectedColor(worker.color);
    setEditingWorkerId(worker.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDayInList = (day: DayOfWeek, list: DayOfWeek[], setList: (d: DayOfWeek[]) => void) => {
    setList(list.includes(day) ? list.filter(d => d !== day) : [...list, day]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    let finalColor = '';
    let priority = workers.length;

    if (editingWorkerId) {
      const existing = workers.find(w => w.id === editingWorkerId);
      finalColor = selectedColor || (existing ? existing.color : WORKER_COLORS[workers.length % WORKER_COLORS.length]);
      priority = existing ? existing.priority : workers.length;
    } else {
      const usedColors = workers.map(w => w.color);
      const firstUnused = WORKER_COLORS.find(c => !usedColors.includes(c));
      finalColor = firstUnused || WORKER_COLORS[workers.length % WORKER_COLORS.length];
    }

    const workerData: Worker = {
      id: editingWorkerId || crypto.randomUUID(),
      name,
      color: finalColor,
      priority,
      possibleStart,
      possibleEnd,
      preferredStart: isFlexible ? possibleStart : Math.max(possibleStart, preferredStart),
      preferredEnd: isFlexible ? possibleEnd : Math.min(possibleEnd, preferredEnd),
      preferredDaysCount: isFlexible ? 0 : Number(preferredDaysCount),
      preferredDays: isFlexible ? [] : preferredDays,
      unavailableDays,
      isFlexible,
      constraints: editingWorkerId ? (workers.find(w => w.id === editingWorkerId)?.constraints || {}) : {},
    };

    if (editingWorkerId) {
      onUpdateWorker(workerData);
    } else {
      onAddWorker(workerData);
    }
    resetForm();
  };

  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    const sorted = [...workers].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sorted.length) return;

    const tempPriority = sorted[index].priority;
    sorted[index].priority = sorted[newIdx].priority;
    sorted[newIdx].priority = tempPriority;

    onUpdateWorker(sorted[index]);
    onUpdateWorker(sorted[newIdx]);
  };

  const sortedWorkers = [...workers].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  return (
    <div className="space-y-12 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Roster</h2>
          <p className="text-gray-500">Manage availability and preferences</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
          <span className="font-bold">{showForm ? 'Cancel' : 'Add Staff'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">
              {editingWorkerId ? `Editing Profile: ${name}` : 'Create New Staff Profile'}
            </h3>
            
            <label className="flex items-center space-x-3 cursor-pointer group bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-amber-400 transition-all">
              <input 
                type="checkbox" 
                checked={isFlexible} 
                onChange={(e) => setIsFlexible(e.target.checked)}
                className="w-4 h-4 text-amber-500 focus:ring-amber-500 rounded cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">Backup / On-Call Worker</span>
                <span className="text-[10px] text-slate-500 italic leading-none">No preferences, fill-in only</span>
              </div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-slate-900"
                required
              />
            </div>

            {editingWorkerId && (
              <div className="col-span-full bg-slate-50 p-5 rounded-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Update Worker Profile Color</label>
                <div className="flex flex-wrap gap-2.5">
                  {WORKER_COLORS.slice(0, 15).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-9 h-9 rounded-full border-4 transition-all hover:scale-110 shadow-sm ${selectedColor === color ? 'border-slate-900 scale-105' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Hours</h4>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Possible Start</label>
                <select 
                  value={possibleStart} 
                  onChange={(e) => setPossibleStart(parseInt(e.target.value))} 
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                >
                  {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Possible End</label>
                <select 
                  value={possibleEnd} 
                  onChange={(e) => setPossibleEnd(parseInt(e.target.value))} 
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                >
                  {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 bg-red-50 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest">Unavailability</h4>
              <div>
                <label className="block text-xs font-semibold text-red-700 mb-2">Days Worker CANNOT Work</label>
                <div className="flex flex-wrap gap-1">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDayInList(day, unavailableDays, setUnavailableDays)}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                        unavailableDays.includes(day)
                          ? 'bg-red-600 border-red-600 text-white shadow-sm'
                          : 'bg-white border-red-200 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!isFlexible && (
              <>
                <div className="space-y-4 bg-amber-50 p-4 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest">Preferences</h4>
                  <div>
                    <label className="block text-xs font-semibold text-amber-700 mb-1">Preferred Start</label>
                    <select 
                      value={preferredStart} 
                      onChange={(e) => setPreferredStart(parseInt(e.target.value))} 
                      className="w-full px-3 py-1.5 border border-amber-200 rounded-md text-sm bg-white"
                    >
                      {HOURS.filter(h => h >= possibleStart && h <= possibleEnd).map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-700 mb-1">Preferred End</label>
                    <select 
                      value={preferredEnd} 
                      onChange={(e) => setPreferredEnd(parseInt(e.target.value))} 
                      className="w-full px-3 py-1.5 border border-amber-200 rounded-md text-sm bg-white"
                    >
                      {HOURS.filter(h => h >= possibleStart && h <= possibleEnd).map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4 bg-blue-50 p-4 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Workload</h4>
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Target Days Per Week</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="7" 
                      value={preferredDaysCount} 
                      onChange={(e) => setPreferredDaysCount(e.target.value)} 
                      className="w-full px-3 py-1.5 border border-blue-200 rounded-md text-sm bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-2">Specific Preferred Days</label>
                    <div className="flex flex-wrap gap-1">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDayInList(day, preferredDays, setPreferredDays)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                            preferredDays.includes(day)
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-100'
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3 border-t border-gray-100 pt-6">
            <button 
              type="button" 
              onClick={resetForm}
              className="px-6 py-2 rounded-lg font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="bg-amber-500 text-slate-900 font-bold px-6 py-2 rounded-lg hover:bg-amber-400 transition-colors shadow-sm">
              {editingWorkerId ? 'Save Changes' : 'Register Worker'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map((worker) => (
          <div key={worker.id} className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow group relative bg-white ${worker.isFlexible ? 'border-dashed border-slate-300' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border text-white transition-colors shadow-sm`}
                  style={{ backgroundColor: worker.color, borderColor: 'rgba(0,0,0,0.1)' }}
                >
                  {worker.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{worker.name}</h3>
                  {worker.isFlexible ? (
                    <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tighter">Backup Member</span>
                  ) : (
                    <div className="flex items-center space-x-1 text-[10px] text-blue-600 font-bold uppercase tracking-tight">
                      <i className="fas fa-calendar-day"></i>
                      <span>{worker.preferredDaysCount > 0 ? `${worker.preferredDaysCount} days/wk target` : 'No weekly target'}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <button 
                  type="button"
                  onClick={() => handleEditClick(worker)} 
                  className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Edit Staff"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  type="button"
                  onClick={() => onRemoveWorker(worker.id)} 
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete Staff"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-[10px] bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="block text-gray-400 font-bold uppercase mb-1">Global Avail.</span>
                  <span className="text-gray-700 font-bold">{formatHour(worker.possibleStart)} - {formatHour(worker.possibleEnd)}</span>
                </div>
                {!worker.isFlexible && (
                  <div className="text-[10px] bg-amber-50 p-2 rounded border border-amber-100">
                    <span className="block text-amber-400 font-bold uppercase mb-1">Pref. Hours</span>
                    <span className="text-amber-700 font-bold">{formatHour(worker.preferredStart)} - {formatHour(worker.preferredEnd)}</span>
                  </div>
                )}
                {worker.isFlexible && (
                  <div className="text-[10px] bg-slate-50 p-2 rounded border border-slate-100 flex items-center justify-center italic text-slate-400 font-bold">
                    Backup Mode
                  </div>
                )}
              </div>

              {/* Day Constraints Display */}
              <div className="space-y-3 pt-2 border-t border-gray-50">
                <div>
                  <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <i className="fas fa-ban"></i> Cannot Work
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {worker.unavailableDays && worker.unavailableDays.length > 0 ? (
                      worker.unavailableDays.map(day => (
                        <span key={day} className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[8px] font-black rounded border border-red-100 uppercase">
                          {day.substring(0, 3)}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] text-gray-300 italic font-medium">None restricted</span>
                    )}
                  </div>
                </div>

                {!worker.isFlexible && (
                  <div>
                    <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <i className="fas fa-star"></i> Preferred Days
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {worker.preferredDays && worker.preferredDays.length > 0 ? (
                        worker.preferredDays.map(day => (
                          <span key={day} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded border border-blue-100 uppercase">
                            {day.substring(0, 3)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-gray-300 italic font-medium">No preferred days</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {workers.length === 0 && !showForm && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
            <i className="fas fa-users-slash text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No staff registered.</p>
          </div>
        )}
      </div>

      {workers.length > 0 && (
        <div className="mt-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Staff Hour Priority Ranking</h3>
              <p className="text-slate-500 text-sm mt-1">Reorder workers to set their desired workload. Workers at the top are prioritized for more hours.</p>
            </div>
            <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
              AI Scheduling Weight
            </div>
          </div>

          <div className="space-y-3">
            {sortedWorkers.map((worker, index) => (
              <div 
                key={worker.id} 
                className="flex items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100 group shadow-sm"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-inner border border-slate-200">
                  <span className="text-slate-400 font-black text-sm">#{index + 1}</span>
                </div>
                
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-md border border-white/20"
                  style={{ backgroundColor: worker.color }}
                >
                  {worker.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <span className="text-base font-black text-slate-900">{worker.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {worker.isFlexible ? 'Flexible/Backup' : 'Core Staff'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMovePriority(index, 'up')}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-500/50 transition-all flex items-center justify-center disabled:opacity-20"
                  >
                    <i className="fas fa-chevron-up text-xs"></i>
                  </button>
                  <button 
                    type="button"
                    disabled={index === sortedWorkers.length - 1}
                    onClick={() => handleMovePriority(index, 'down')}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-500/50 transition-all flex items-center justify-center disabled:opacity-20"
                  >
                    <i className="fas fa-chevron-down text-xs"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <i className="fas fa-info-circle text-slate-400"></i>
            <p className="text-[10px] text-slate-500 font-medium italic">
              The priority order above directly informs the AI during schedule generation. It will attempt to give more hours to top-ranked workers before utilizing those further down the list.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;


import React, { useState } from 'react';
import { Worker, DayOfWeek, Tag } from '../types';
import { HOURS, DAYS, formatHour, WORKER_COLORS } from '../constants';

interface StaffListProps {
  workers: Worker[];
  tags: Tag[];
  onAddWorker: (worker: Worker) => void;
  onUpdateWorker: (worker: Worker) => void;
  onRemoveWorker: (id: string) => void;
}

const StaffList: React.FC<StaffListProps> = ({ workers, tags, onAddWorker, onUpdateWorker, onRemoveWorker }) => {
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
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

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
    setSelectedTagIds([]);
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
    setSelectedTagIds(worker.tagIds || []);
    setEditingWorkerId(worker.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDayInList = (day: DayOfWeek, list: DayOfWeek[], setList: (d: DayOfWeek[]) => void) => {
    setList(list.includes(day) ? list.filter(d => d !== day) : [...list, day]);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
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
      tagIds: selectedTagIds
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
          <p className="text-gray-500">Manage availability and roles</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center space-x-2"
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
          <span>{showForm ? 'Cancel' : 'Add Staff'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">
              {editingWorkerId ? `Edit ${name}` : 'Register New Staff'}
            </h3>
            
            <label className="flex items-center space-x-3 cursor-pointer group bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all">
              <input 
                type="checkbox" 
                checked={isFlexible} 
                onChange={(e) => setIsFlexible(e.target.checked)}
                className="w-4 h-4 text-amber-500 focus:ring-amber-500 rounded cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Backup Personnel</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Fills gaps only</span>
              </div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Staff Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none bg-white text-slate-900 font-bold text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Assign Roles (Multiple Allowed)</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        selectedTagIds.includes(tag.id)
                          ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <i className="fas fa-tag mr-2 opacity-50"></i>
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-[10px] text-slate-300 italic">No roles defined. Go to "Roles" tab to create some.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/50">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Profile Identity</label>
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
            
            <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-200/50">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shift Windows</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase mb-1 ml-1">Earliest</label>
                  <select value={possibleStart} onChange={(e) => setPossibleStart(parseInt(e.target.value))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-white">
                    {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase mb-1 ml-1">Latest</label>
                  <select value={possibleEnd} onChange={(e) => setPossibleEnd(parseInt(e.target.value))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-white">
                    {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-red-50 p-6 rounded-3xl border border-red-100">
              <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Unavailability</h4>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDayInList(day, unavailableDays, setUnavailableDays)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black border uppercase tracking-widest transition-all ${
                      unavailableDays.includes(day)
                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/20'
                        : 'bg-white border-red-200 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {!isFlexible && (
              <>
                <div className="space-y-4 bg-amber-50 p-6 rounded-3xl border border-amber-100">
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Ideal Hours</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-amber-700 uppercase mb-1 ml-1">Start</label>
                      <select value={preferredStart} onChange={(e) => setPreferredStart(parseInt(e.target.value))} className="w-full px-4 py-2 border border-amber-200 rounded-xl text-xs font-bold bg-white">
                        {HOURS.filter(h => h >= possibleStart && h <= possibleEnd).map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-amber-700 uppercase mb-1 ml-1">End</label>
                      <select value={preferredEnd} onChange={(e) => setPreferredEnd(parseInt(e.target.value))} className="w-full px-4 py-2 border border-amber-200 rounded-xl text-xs font-bold bg-white">
                        {HOURS.filter(h => h >= possibleStart && h <= possibleEnd).map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Weekly Load</h4>
                  <div>
                    <input 
                      type="number" min="0" max="7" 
                      value={preferredDaysCount} onChange={(e) => setPreferredDaysCount(e.target.value)} 
                      className="w-full px-4 py-3 border border-blue-200 rounded-2xl text-xs font-black bg-white"
                      placeholder="Days per week target"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDayInList(day, preferredDays, setPreferredDays)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black border uppercase tracking-widest transition-all ${
                          preferredDays.includes(day)
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-10 flex justify-end gap-4 border-t border-slate-50 pt-8">
            <button type="button" onClick={resetForm} className="px-8 py-3 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs hover:text-slate-600 transition-colors">Discard</button>
            <button type="submit" className="bg-slate-900 text-white font-black px-12 py-3 rounded-2xl hover:bg-slate-800 transition-all shadow-xl text-xs uppercase tracking-widest">
              {editingWorkerId ? 'Confirm Updates' : 'Add to Roster'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {workers.map((worker) => (
          <div key={worker.id} className={`p-8 rounded-[2.5rem] border shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all group relative bg-white ${worker.isFlexible ? 'border-dashed border-slate-300' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white transition-colors shadow-lg shadow-current/10 border border-white/20`}
                  style={{ backgroundColor: worker.color }}
                >
                  {worker.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight tracking-tight">{worker.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {worker.isFlexible && (
                      <span className="text-[8px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">Backup</span>
                    )}
                    {worker.tagIds?.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span key={tag.id} className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full" style={{ backgroundColor: `${tag.color}15`, color: tag.color, border: `1px solid ${tag.color}30` }}>
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditClick(worker)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all flex items-center justify-center" title="Edit Profile">
                  <i className="fas fa-edit text-xs"></i>
                </button>
                <button onClick={() => onRemoveWorker(worker.id)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center" title="Remove Profile">
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1.5">Max Reach</span>
                  <span className="text-slate-700 font-black text-[11px]">{formatHour(worker.possibleStart)} - {formatHour(worker.possibleEnd)}</span>
                </div>
                {!worker.isFlexible && (
                  <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                    <span className="block text-[8px] text-amber-500 font-black uppercase tracking-widest mb-1.5">Preferred</span>
                    <span className="text-amber-700 font-black text-[11px]">{formatHour(worker.preferredStart)} - {formatHour(worker.preferredEnd)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div>
                  <h4 className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fas fa-ban text-[8px]"></i> Unavailable
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {worker.unavailableDays && worker.unavailableDays.length > 0 ? (
                      worker.unavailableDays.map(day => (
                        <span key={day} className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black rounded border border-red-100 uppercase">
                          {day.substring(0, 3)}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] text-slate-300 italic font-bold">No restrictions</span>
                    )}
                  </div>
                </div>

                {!worker.isFlexible && (
                  <div>
                    <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="fas fa-heart text-[8px]"></i> Preferred Days
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {worker.preferredDays && worker.preferredDays.length > 0 ? (
                        worker.preferredDays.map(day => (
                          <span key={day} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded border border-blue-100 uppercase">
                            {day.substring(0, 3)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-slate-300 italic font-bold">No preferences</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {workers.length > 0 && (
        <div className="mt-12 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Staff Priority Weighting</h3>
              <p className="text-slate-500 text-sm mt-1">Order by desired shift priority. Higher positions are allocated hours first.</p>
            </div>
            <div className="bg-amber-100 text-amber-700 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
              AI Scheduling Context
            </div>
          </div>

          <div className="space-y-3">
            {sortedWorkers.map((worker, index) => (
              <div key={worker.id} className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100 hover:shadow-md group">
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-inner border border-slate-200">
                  <span className="text-slate-400 font-black text-sm">#{index + 1}</span>
                </div>
                
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white shadow-md border border-white/20" style={{ backgroundColor: worker.color }}>
                  {worker.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <span className="text-lg font-black text-slate-900 tracking-tight">{worker.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    {worker.tagIds?.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span key={tag.id} className="text-[8px] font-black uppercase tracking-widest opacity-60" style={{ color: tag.color }}>
                          • {tag.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" disabled={index === 0} onClick={() => handleMovePriority(index, 'up')} className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-all flex items-center justify-center disabled:opacity-20 shadow-sm">
                    <i className="fas fa-chevron-up text-xs"></i>
                  </button>
                  <button type="button" disabled={index === sortedWorkers.length - 1} onClick={() => handleMovePriority(index, 'down')} className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-all flex items-center justify-center disabled:opacity-20 shadow-sm">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;

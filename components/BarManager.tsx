
import React, { useState, useEffect } from 'react';
import { Bar, DayOfWeek, OperatingHours } from '../types';
import { DAYS, formatHour, DEFAULT_OPERATING_HOURS } from '../constants';

interface BarManagerProps {
  bars: Bar[];
  onAddBar: (bar: Bar) => void;
  onUpdateBar: (bar: Bar) => void;
  onSelectBar: (barId: string) => void;
  onDeleteBar: (barId: string) => void;
}

const BarManager: React.FC<BarManagerProps> = ({ bars, onAddBar, onUpdateBar, onSelectBar, onDeleteBar }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingBarId, setEditingBarId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  // Standard (Global) hours
  const [globalOpen, setGlobalOpen] = useState(DEFAULT_OPERATING_HOURS.open);
  const [globalClose, setGlobalClose] = useState(DEFAULT_OPERATING_HOURS.close);
  
  // Tracking which days have exceptions
  const [exceptions, setExceptions] = useState<Partial<Record<DayOfWeek, OperatingHours>>>({});

  const toggleException = (day: DayOfWeek) => {
    setExceptions(prev => {
      const newExceptions = { ...prev };
      if (newExceptions[day]) {
        delete newExceptions[day];
      } else {
        newExceptions[day] = { open: globalOpen, close: globalClose };
      }
      return newExceptions;
    });
  };

  const updateExceptionHour = (day: DayOfWeek, field: 'open' | 'close', value: number) => {
    setExceptions(prev => ({
      ...prev,
      [day]: { ...prev[day]!, [field]: value }
    }));
  };

  const handleEditClick = (bar: Bar) => {
    setName(bar.name);
    setAddress(bar.address);
    setCity(bar.city);
    setPhotoUrl(bar.photoUrl);
    
    // Attempt to deduce global vs exceptions
    // We'll use Monday as the base "global" assumption
    const base = bar.operatingHours[DayOfWeek.Monday];
    setGlobalOpen(base.open);
    setGlobalClose(base.close);
    
    const newExceptions: Partial<Record<DayOfWeek, OperatingHours>> = {};
    DAYS.forEach(day => {
      const hours = bar.operatingHours[day];
      if (hours.open !== base.open || hours.close !== base.close) {
        newExceptions[day] = hours;
      }
    });
    setExceptions(newExceptions);
    
    setEditingBarId(bar.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !city) return;

    // Build the final 7-day schedule
    const finalOperatingHours = DAYS.reduce((acc, day) => {
      acc[day] = exceptions[day] || { open: globalOpen, close: globalClose };
      return acc;
    }, {} as Record<DayOfWeek, OperatingHours>);

    if (editingBarId) {
      const existingBar = bars.find(b => b.id === editingBarId);
      if (existingBar) {
        onUpdateBar({
          ...existingBar,
          name,
          address,
          city,
          photoUrl: photoUrl || `https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80`,
          operatingHours: finalOperatingHours,
        });
      }
    } else {
      // Fix: Add missing tags property to match Bar interface defined in types.ts
      const newBar: Bar = {
        id: crypto.randomUUID(),
        name,
        address,
        city,
        photoUrl: photoUrl || `https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80`,
        operatingHours: finalOperatingHours,
        workers: [],
        requirements: [],
        schedule: [],
        tags: []
      };
      onAddBar(newBar);
    }
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setCity('');
    setPhotoUrl('');
    setGlobalOpen(DEFAULT_OPERATING_HOURS.open);
    setGlobalClose(DEFAULT_OPERATING_HOURS.close);
    setExceptions({});
    setEditingBarId(null);
    setShowForm(false);
  };

  const hourOptions = Array.from({ length: 24 }).map((_, i) => (
    <option key={i} value={i}>{formatHour(i)}</option>
  ));

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Establishments</h1>
          <p className="text-slate-500 mt-2">Manage multiple locations and staff schedules.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition-all shadow-lg flex items-center space-x-2"
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
          <span>{showForm ? 'Cancel' : 'Register New Bar'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: General Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                <i className="fas fa-info-circle text-amber-500"></i>
                <span>{editingBarId ? 'Edit Establishment' : 'General Information'}</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Bar Name</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white text-slate-900 transition-all font-medium" placeholder="The Midnight Lounge" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">City</label>
                    <input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white text-slate-900 transition-all font-medium" placeholder="London" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Address</label>
                    <input required type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white text-slate-900 transition-all font-medium" placeholder="123 Night St." />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Photo URL</label>
                  <input type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white text-slate-900 transition-all font-medium" placeholder="https://unsplash.com/..." />
                </div>

                {photoUrl && (
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner group animate-in zoom-in-95 duration-200">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Image Preview</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Time Settings */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                <i className="fas fa-clock text-amber-500"></i>
                <span>Operating Hours</span>
              </h3>

              {/* Standard Hours Block */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Standard Hours (Default)</span>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Applied to all days</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Opens At</label>
                    <select value={globalOpen} onChange={e => setGlobalOpen(parseInt(e.target.value))} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none bg-white text-slate-900 font-bold appearance-none">
                      {hourOptions}
                    </select>
                  </div>
                  <div className="pt-4 text-slate-300">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Closes At</label>
                    <select value={globalClose} onChange={e => setGlobalClose(parseInt(e.target.value))} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none bg-white text-slate-900 font-bold appearance-none">
                      {hourOptions}
                    </select>
                  </div>
                </div>
              </div>

              {/* Exceptions Toggle List */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Add Daily Exceptions</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAYS.map(day => {
                    const hasException = !!exceptions[day];
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleException(day)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${
                          hasException 
                            ? 'bg-amber-100 border-amber-300 text-amber-700 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    )
                  })}
                </div>

                {/* Exception Details */}
                <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  {(Object.entries(exceptions) as [DayOfWeek, OperatingHours][]).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between bg-white border border-amber-200 p-3 rounded-2xl animate-in slide-in-from-left-2 duration-200 shadow-sm">
                      <span className="text-xs font-black text-amber-600 uppercase">{day}</span>
                      <div className="flex items-center space-x-2">
                        <select 
                          value={hours.open} 
                          onChange={e => updateExceptionHour(day, 'open', parseInt(e.target.value))} 
                          className="text-[10px] border border-slate-200 rounded-lg p-1 font-bold bg-white"
                        >
                          {hourOptions}
                        </select>
                        <span className="text-slate-300 text-[10px]">to</span>
                        <select 
                          value={hours.close} 
                          onChange={e => updateExceptionHour(day, 'close', parseInt(e.target.value))} 
                          className="text-[10px] border border-slate-200 rounded-lg p-1 font-bold bg-white"
                        >
                          {hourOptions}
                        </select>
                      </div>
                    </div>
                  ))}
                  {Object.keys(exceptions).length === 0 && (
                    <p className="text-center py-6 text-[10px] text-slate-300 italic font-medium">No exceptions added. All days follow standard hours.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={resetForm}
              className="px-8 py-3 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs hover:text-slate-600 transition-colors"
            >
              Discard Changes
            </button>
            <button 
              type="submit" 
              className="bg-slate-900 text-white font-black px-12 py-3 rounded-2xl hover:bg-slate-800 transition-all shadow-xl text-xs uppercase tracking-widest"
            >
              {editingBarId ? 'Update Establishment' : 'Complete Registration'}
            </button>
          </div>
        </form>
      )}

      {/* Bar Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bars.map(bar => (
          <div key={bar.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl transition-all group flex flex-col h-full hover:-translate-y-1 duration-300">
            <div className="relative h-56">
              <img src={bar.photoUrl} alt={bar.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{bar.name}</h3>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">
                      <i className="fas fa-map-marker-alt text-amber-500 mr-1.5"></i> 
                      {bar.city}, {bar.address}
                    </p>
                  </div>
                  <div className="bg-amber-500 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                    {bar.workers.length} Staff
                  </div>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(bar);
                  }}
                  className="w-10 h-10 bg-white/10 hover:bg-amber-500 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md border border-white/20"
                >
                  <i className="fas fa-pencil-alt text-xs"></i>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBar(bar.id);
                  }}
                  className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md border border-white/20"
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="grid grid-cols-1 gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Typical Hours</span>
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                   <i className="far fa-clock text-slate-400"></i>
                   <span>{formatHour(bar.operatingHours[DayOfWeek.Monday].open)} to {formatHour(bar.operatingHours[DayOfWeek.Monday].close)}</span>
                   {Object.keys(bar.operatingHours).some(d => bar.operatingHours[d as DayOfWeek].open !== bar.operatingHours[DayOfWeek.Monday].open) && (
                     <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 ml-auto">Varies</span>
                   )}
                </div>
              </div>

              <button
                onClick={() => onSelectBar(bar.id)}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-lg group/btn"
              >
                <span className="uppercase text-xs tracking-widest">Enter Dashboard</span>
                <i className="fas fa-arrow-right text-[10px] group-hover/btn:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </div>
        ))}

        {bars.length === 0 && !showForm && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-inner">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 relative">
               <i className="fas fa-store text-4xl text-slate-200"></i>
               <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-4 border-white">
                 <i className="fas fa-plus text-[10px] text-white"></i>
               </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900">Establishment Roster Empty</h3>
            <p className="text-slate-500 mt-2 text-sm font-medium">Create your first venue profile to begin AI scheduling.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="mt-8 text-amber-600 font-black text-xs uppercase tracking-widest hover:text-amber-700 transition-colors"
            >
              Get Started Now <i className="fas fa-arrow-right ml-1"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarManager;

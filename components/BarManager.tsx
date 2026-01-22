
import React, { useState } from 'react';
import { Bar, DayOfWeek, OperatingHours } from '../types';
import { DAYS, formatHour, DEFAULT_OPERATING_HOURS } from '../constants';

interface BarManagerProps {
  bars: Bar[];
  onAddBar: (bar: Bar) => void;
  onSelectBar: (barId: string) => void;
  onDeleteBar: (barId: string) => void;
}

const BarManager: React.FC<BarManagerProps> = ({ bars, onAddBar, onSelectBar, onDeleteBar }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [operatingHours, setOperatingHours] = useState<Record<DayOfWeek, OperatingHours>>(
    DAYS.reduce((acc, day) => ({ ...acc, [day]: { ...DEFAULT_OPERATING_HOURS } }), {} as Record<DayOfWeek, OperatingHours>)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !city) return;

    const newBar: Bar = {
      id: crypto.randomUUID(),
      name,
      address,
      city,
      photoUrl: photoUrl || `https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80`,
      operatingHours,
      workers: [],
      requirements: [],
      schedule: []
    };

    onAddBar(newBar);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setCity('');
    setPhotoUrl('');
    setShowForm(false);
  };

  const updateHour = (day: DayOfWeek, field: 'open' | 'close', value: number) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Establishments</h1>
          <p className="text-slate-500 mt-2">Manage multiple locations and staff schedules.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition-all shadow-lg flex items-center space-x-2"
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
          <span>{showForm ? 'Cancel' : 'Register New Bar'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mb-12 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">General Information</h3>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bar Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="The Midnight Lounge" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                  <input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="London" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                  <input required type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="123 Night St." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Photo URL (Optional)</label>
                <input type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Operating Hours</h3>
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                {DAYS.map(day => (
                  <div key={day} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-sm font-bold text-slate-700 w-24">{day}</span>
                    <div className="flex items-center space-x-2">
                      <select value={operatingHours[day].open} onChange={e => updateHour(day, 'open', parseInt(e.target.value))} className="text-xs border rounded p-1">
                        {Array.from({length: 24}).map((_, i) => <option key={i} value={i}>{formatHour(i)}</option>)}
                      </select>
                      <span className="text-slate-400 text-xs">to</span>
                      <select value={operatingHours[day].close} onChange={e => updateHour(day, 'close', parseInt(e.target.value))} className="text-xs border rounded p-1">
                        {Array.from({length: 24}).map((_, i) => <option key={i} value={i}>{formatHour(i)}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button type="submit" className="bg-slate-900 text-white font-bold px-10 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg">
              Create Establishment
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bars.map(bar => (
          <div key={bar.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col h-full">
            <div className="relative h-48">
              <img src={bar.photoUrl} alt={bar.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-2xl font-black text-white">{bar.name}</h3>
                <p className="text-white/80 text-xs font-medium"><i className="fas fa-map-marker-alt mr-1"></i> {bar.city}, {bar.address}</p>
              </div>
              <button 
                onClick={() => onDeleteBar(bar.id)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
              >
                <i className="fas fa-trash-alt text-xs"></i>
              </button>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                  <span>Current Staff</span>
                  <span className="text-amber-600">{bar.workers.length} Members</span>
                </div>
                <div className="flex -space-x-2">
                  {bar.workers.slice(0, 5).map(w => (
                    <div key={w.id} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {w.name.charAt(0)}
                    </div>
                  ))}
                  {bar.workers.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-amber-700">
                      +{bar.workers.length - 5}
                    </div>
                  )}
                  {bar.workers.length === 0 && <span className="text-[10px] text-slate-400 italic">No staff yet</span>}
                </div>
              </div>
              <button
                onClick={() => onSelectBar(bar.id)}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Manage & Schedule</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        ))}
        {bars.length === 0 && !showForm && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-store-slash text-3xl text-slate-300"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Establishments Found</h3>
            <p className="text-slate-500 mt-2">Start by registering your first bar or restaurant.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarManager;

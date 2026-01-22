
import React, { useState } from 'react';
import { User } from '../types';
import { COUNTRY_CODES } from '../constants';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [countryCode, setCountryCode] = useState(user.countryCode || COUNTRY_CODES[0].code);
  const [password, setPassword] = useState(user.password || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !phone) {
      setError('All contact fields are required');
      return;
    }
    onUpdate({
      ...user,
      username,
      email,
      phone,
      countryCode,
      password
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all border border-white/10"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
          
          <div className="flex items-center space-x-6 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <i className="fas fa-user-gear text-slate-900 text-3xl"></i>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight leading-none">Security Center</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Personalize your credentials</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase p-4 rounded-2xl flex items-center gap-3">
              <i className="fas fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input 
                required
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-900 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Email</label>
              <input 
                required
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-900 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verified Phone</label>
            <div className="flex gap-3">
              <div className="w-[120px] relative">
                <select 
                  value={countryCode} 
                  onChange={e => setCountryCode(e.target.value)}
                  className="w-full h-full pl-5 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-amber-500 transition-all font-black text-xs appearance-none cursor-pointer"
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"></i>
              </div>
              <input 
                required
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-900 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Password</label>
            <div className="relative group">
              <i className="fas fa-key absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors"></i>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-900 text-sm"
                placeholder="Leave blank to keep current"
              />
            </div>
            <p className="text-[9px] text-slate-400 italic ml-1 mt-1">For security, avoid using simple or recurring sequences.</p>
          </div>

          <div className="pt-8 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors"
            >
              Discard
            </button>
            <button 
              type="submit"
              className="flex-[2] bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 uppercase text-[10px] tracking-[0.2em]"
            >
              Commit Updates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;

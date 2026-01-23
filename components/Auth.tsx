
import React, { useState } from 'react';
import { User } from '../types';
import { COUNTRY_CODES } from '../constants';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].code);
  const [error, setError] = useState('');

  const getUsers = (): User[] => {
    const data = localStorage.getItem('bar_shift_master_users');
    return data ? JSON.parse(data) : [];
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsers();

    if (isLogin) {
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid');
      }
    } else {
      if (!username || !password || !email || !phone) {
        setError('Required');
        return;
      }
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        setError('Exists');
        return;
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        password,
        email,
        phone,
        countryCode
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('bar_shift_master_users', JSON.stringify(updatedUsers));
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F7] p-4 font-[-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="w-full max-w-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Minimal Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-[1.25rem] shadow-xl mb-4">
            <i className="fas fa-beer text-amber-500 text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">BarShift</h1>
        </div>

        {/* Minimal iOS Style Form */}
        <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-white">
          
          {/* Segmented Control */}
          <div className="flex bg-[#E3E3E8]/50 p-1 rounded-2xl mb-8 border border-white/50">
            <button 
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="text-red-500 text-[10px] font-bold uppercase text-center animate-in shake-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <input 
                required
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full px-5 py-4 bg-slate-100/50 border border-transparent rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-200 outline-none transition-all placeholder:text-slate-300"
                placeholder="User"
              />

              {!isLogin && (
                <>
                  <input 
                    required
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-100/50 border border-transparent rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-200 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Email"
                  />

                  <div className="flex gap-2">
                    <select 
                      value={countryCode} 
                      onChange={e => setCountryCode(e.target.value)}
                      className="w-16 px-2 py-4 bg-slate-100/50 border border-transparent rounded-2xl text-slate-900 text-xs font-bold outline-none"
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code}>{c.flag}</option>
                      ))}
                    </select>
                    <input 
                      required
                      type="tel" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      className="flex-1 px-5 py-4 bg-slate-100/50 border border-transparent rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-200 outline-none transition-all placeholder:text-slate-300"
                      placeholder="Phone"
                    />
                  </div>
                </>
              )}

              <input 
                required
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-100/50 border border-transparent rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-200 outline-none transition-all placeholder:text-slate-300"
                placeholder="Password"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] mt-6 text-sm flex items-center justify-center"
            >
              Continue
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-slate-300 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest"
            >
              {isLogin ? "Join" : "Back"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

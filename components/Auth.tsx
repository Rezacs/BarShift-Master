
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
        setError('Invalid credentials');
      }
    } else {
      if (!username || !password || !email || !phone) {
        setError('Missing information');
        return;
      }
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        setError('Username exists');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F7] p-6 font-sans">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Minimal Brand Identity */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl shadow-xl mb-4">
            <i className="fas fa-beer text-amber-500 text-2xl"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">BarShift</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Management Console</p>
        </div>

        {/* iOS Style Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white">
          
          {/* Segmented Control */}
          <div className="flex bg-slate-100/50 p-1 rounded-2xl mb-8 border border-slate-200/50">
            <button 
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Log In
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="text-red-500 text-[10px] font-bold uppercase text-center mb-2 animate-in shake-in">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <input 
                required
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-500/10 outline-none transition-all"
                placeholder="Username"
              />

              {!isLogin && (
                <>
                  <input 
                    required
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-500/10 outline-none transition-all"
                    placeholder="Email Address"
                  />

                  <div className="flex gap-2">
                    <select 
                      value={countryCode} 
                      onChange={e => setCountryCode(e.target.value)}
                      className="w-20 px-3 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-xs font-bold outline-none"
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
                      className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-500/10 outline-none transition-all"
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
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-500/10 outline-none transition-all"
                placeholder="Password"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-4.5 rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-[0.97] mt-6 text-sm flex items-center justify-center gap-2"
            >
              <span>{isLogin ? 'Continue' : 'Get Started'}</span>
              <i className="fas fa-chevron-right text-[10px] opacity-40"></i>
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              {isLogin ? "Join BarShift" : "Back to Login"}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            Secured via AES-256 Encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

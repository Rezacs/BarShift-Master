
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
        setError('Invalid username or password');
      }
    } else {
      if (!username || !password || !email || !phone) {
        setError('All fields are required');
        return;
      }
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        setError('Username already taken');
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2.5rem] shadow-2xl shadow-amber-500/20 mb-8 rotate-12 hover:rotate-0 transition-all duration-500">
            <i className="fas fa-beer text-slate-900 text-4xl"></i>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">BarShift</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Staff Management AI</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[3rem] border border-slate-800/50 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="flex bg-slate-950/40 p-1.5 rounded-2xl mb-10 border border-slate-800/50">
            <button 
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isLogin ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${!isLogin ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider p-4 rounded-2xl flex items-center gap-3 animate-in shake-in">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Username</label>
              <div className="relative group">
                <i className="fas fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors"></i>
                <input 
                  required
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-white placeholder:text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-sm"
                  placeholder="manager_name"
                  autoComplete="username"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Email</label>
                  <div className="relative group">
                    <i className="fas fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors"></i>
                    <input 
                      required
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-white placeholder:text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Identification</label>
                  <div className="flex gap-2">
                    <div className="w-[110px] relative group">
                      <select 
                        value={countryCode} 
                        onChange={e => setCountryCode(e.target.value)}
                        className="w-full h-full pl-4 pr-10 py-4.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-white outline-none focus:border-amber-500 transition-all font-black text-xs appearance-none cursor-pointer"
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code} className="bg-slate-900 text-white py-2">
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <i className="fas fa-caret-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 pointer-events-none transition-colors"></i>
                    </div>
                    <div className="flex-1 relative group">
                      <i className="fas fa-phone-alt absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors"></i>
                      <input 
                        required
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)}
                        className="w-full pl-14 pr-6 py-4.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-white placeholder:text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-sm"
                        placeholder="555-0199"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative group">
                <i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors"></i>
                <input 
                  required
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-white placeholder:text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-sm"
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-amber-500 text-slate-950 font-black py-5 rounded-[1.5rem] hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10 mt-6 uppercase text-[11px] tracking-[0.25em] flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <span>{isLogin ? 'Access Console' : 'Initialize Account'}</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
              {isLogin ? "New establishment?" : "Existing member?"}
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="ml-2 text-amber-500 hover:text-amber-400 transition-colors underline underline-offset-4"
              >
                {isLogin ? 'Register Venue' : 'Sign In Now'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

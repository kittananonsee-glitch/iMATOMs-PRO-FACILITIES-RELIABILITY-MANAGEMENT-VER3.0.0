
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234');
  const [email, setEmail] = useState('');
  const [building, setBuilding] = useState('ViMUT');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Load current users from localStorage
    const usersStr = localStorage.getItem('imatoms_users');
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];

    // Ensure admin exists
    const adminExists = users.some(u => u.username === 'admin');
    if (!adminExists) {
      users.push({
        id: 'admin-1',
        username: 'admin',
        password: 'admin1234',
        role: 'admin',
        building: 'all',
        status: 'approved',
        email: 'admin@imatoms.pro'
      });
      localStorage.setItem('imatoms_users', JSON.stringify(users));
    }

    if (isRegistering) {
      if (!username || !email || !password) {
        setError('Please fill in all required fields.');
        return;
      }
      
      const userExists = users.some(u => u.username === username || u.email === email);
      if (userExists) {
        setError('Username or Email already exists.');
        return;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        email,
        password,
        building,
        role: 'user',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('imatoms_users', JSON.stringify(users));
      
      setSuccess('Registration successful! Please wait for administrator approval.');
      setIsRegistering(false);
      return;
    }

    // Login logic
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      if (foundUser.status === 'pending') {
        setError('Your account is pending approval by an administrator.');
      } else if (foundUser.status === 'rejected') {
        setError('Your registration has been rejected. Contact support.');
      } else {
        onLogin(foundUser);
      }
    } else {
      setError('Invalid credentials. Hint: admin / admin1234');
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-gradient-to-b from-[#0a0e17] via-[#0f1629] to-[#0a0e17]">
      <div className="w-full max-w-md cyber-card p-8 rounded-2xl shadow-2xl transition-all duration-500">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center mb-4 animate-pulse">
            <i className="fa-solid fa-atom text-4xl text-white"></i>
          </div>
          <h1 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">iMATOMs</h1>
          <p className="text-sm mt-1 text-white/60">Mobilization System v3.1</p>
        </div>

        <div className="flex mb-6 bg-black/20 rounded-xl p-1 border border-white/5">
          <button 
            onClick={() => { setIsRegistering(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${!isRegistering ? 'bg-cyan-500/20 text-cyan-400 shadow-inner' : 'text-white/40 hover:text-white'}`}
          >
            Login
          </button>
          <button 
            onClick={() => { setIsRegistering(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${isRegistering ? 'bg-purple-500/20 text-purple-400 shadow-inner' : 'text-white/40 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/60">Username</label>
            <input 
              type="text" 
              className="cyber-input w-full p-4 rounded-xl text-sm" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required 
            />
          </div>

          {isRegistering && (
            <div className="animate-fadeIn">
              <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/60">Email Address</label>
              <input 
                type="email" 
                className="cyber-input w-full p-4 rounded-xl text-sm" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required 
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/60">Password</label>
            <input 
              type="password" 
              className="cyber-input w-full p-4 rounded-xl text-sm" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required 
            />
          </div>

          {isRegistering && (
            <div className="animate-fadeIn">
              <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/60">Building Response</label>
              <select 
                className="cyber-input w-full p-4 rounded-xl text-sm appearance-none"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              >
                <option value="ViMUT">ViMUT Hospital</option>
                <option value="VTH">ViMUT-Theptarin (VTH)</option>
                <option value="Phahonyothin">ViMUT Phahonyothin</option>
              </select>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>{error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs">
              <i className="fa-solid fa-circle-check mr-2"></i>{success}
            </div>
          )}

          <button 
            type="submit" 
            className={`w-full py-4 text-sm font-black uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
              isRegistering 
              ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20' 
              : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20'
            }`}
          >
            {isRegistering ? 'Create Account' : 'Access System'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
            Authorized Personnel Only<br/>
            &copy; 2024 iMATOMs Mobilization Suite
          </p>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default Login;


import React, { useState, useEffect } from 'react';
import { AppView, User, AnalyticsAlertHistory } from '../types';

interface MainDashboardProps {
  user: User;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ user, onNavigate, onLogout }) => {
  const [time, setTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const checkStatus = () => {
      const usersStr = localStorage.getItem('imatoms_users');
      if (usersStr) {
        const users: User[] = JSON.parse(usersStr);
        setPendingCount(users.filter(u => u.status === 'pending').length);
      }
      const alertHistoryStr = localStorage.getItem('ai_analytics_history');
      if (alertHistoryStr) {
        const history: AnalyticsAlertHistory[] = JSON.parse(alertHistoryStr);
        setActiveAlertCount(history.filter(h => !h.resolvedAt).length);
      }
    };
    checkStatus();
    const statusTimer = setInterval(checkStatus, 3000);
    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  const Sidebar = () => (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      <nav className={`fixed inset-y-0 left-0 w-72 bg-[#0a0e17] border-r border-[#00f5ff]/10 z-[70] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-4 overflow-y-auto no-scrollbar pb-10">
          <div className="mb-8 p-3 flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 leading-tight">iMATOMs</h1>
              <p className="text-[11px] text-white/40 uppercase tracking-widest truncate">Mobilization System</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 active:scale-90 transition-transform">
              <i className="fa-solid fa-xmark text-cyan-400 text-lg"></i>
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-400/60 px-4 py-2 font-black">Main Hub</div>
            <NavItem icon="fa-atom" label="iMATOMs Pro" active onClick={() => setIsSidebarOpen(false)} />
            <NavItem icon="fa-mobile-screen" label="Mobile Apps Hub" onClick={() => onNavigate(AppView.MOBILE_APPS)} />
            <NavItem icon="fa-display" label="Dashboard Monitor" onClick={() => onNavigate(AppView.DASHBOARD_MONITOR)} />
            <NavItem icon="fa-brain" label="AI Analytics" alertCount={activeAlertCount} onClick={() => onNavigate(AppView.AI_ANALYTICS)} />
            
            <div className="h-px bg-white/5 my-4"></div>
            
            <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-400/60 px-4 py-2 font-black">Operations</div>
            <NavItem icon="fa-cube" label="Asset Database" onClick={() => onNavigate(AppView.ASSET)} />
            <NavItem icon="fa-wrench" label="Work Order" onClick={() => onNavigate(AppView.WORK_ORDER)} />
            <NavItem icon="fa-calendar" label="PPM Schedule" onClick={() => onNavigate(AppView.PPM)} />
            <NavItem icon="fa-boxes-stacked" label="Inventory" onClick={() => onNavigate(AppView.INVENTORY)} />

            {user.role === 'admin' && (
              <>
                <div className="h-px bg-white/5 my-4"></div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-400/60 px-4 py-2 font-black">Administration</div>
                <NavItem icon="fa-user-shield" label="Admin Setup" alertCount={pendingCount} onClick={() => onNavigate(AppView.ADMIN)} />
              </>
            )}
          </div>

          <div className="mt-auto pt-6 space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-lg shadow-lg">
                <i className="fa-solid fa-user"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-white">{user.username}</p>
                <p className="text-[10px] text-cyan-400 uppercase font-black truncate">{user.role}</p>
              </div>
              <button onClick={onLogout} className="text-red-400 text-lg p-2 hover:bg-red-500/10 rounded-xl transition-all active:scale-90">
                <i className="fa-solid fa-sign-out-alt"></i>
              </button>
            </div>
            <div className="p-4 text-center border border-white/10 rounded-2xl bg-black/40 shadow-inner">
              <div className="font-display text-xl text-cyan-400 leading-none">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <p className="text-[10px] text-white/30 uppercase mt-1 tracking-widest">{time.toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );

  return (
    <div className="flex h-full bg-[#0a0e17] overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-8 lg:p-12 no-scrollbar pb-24 lg:pb-12 w-full">
        <div className="max-w-7xl mx-auto flex flex-col h-full">
          {/* Mobile-Friendly Header */}
          <header className="flex items-center justify-between mb-8 lg:mb-14">
            <div className="flex items-center gap-4 min-w-0">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-all shadow-lg"
              >
                <i className="fa-solid fa-bars-staggered text-cyan-400 text-lg"></i>
              </button>
              <div className="min-w-0">
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase tracking-tight truncate leading-tight">
                  iMATOMs Pro
                </h2>
                <p className="text-white/40 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] mt-0.5 truncate">Total Operations Management</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">System Live</span>
            </div>
          </header>

          {/* Module Grid - Responsive columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-12">
            <ModuleCard 
              icon="fa-mobile-screen" 
              title="Mobile Hub" 
              desc="AppSheet Field Entry & Records" 
              color="purple"
              onClick={() => onNavigate(AppView.MOBILE_APPS)}
            />
            <ModuleCard 
              icon="fa-display" 
              title="Dashboard Monitor" 
              desc="Looker Studio & Solar Analytics" 
              color="blue"
              onClick={() => onNavigate(AppView.DASHBOARD_MONITOR)}
            />
            <ModuleCard 
              icon="fa-cube" 
              title="Asset Database" 
              desc="Asset Control & History (Ver32)" 
              color="emerald"
              onClick={() => onNavigate(AppView.ASSET)}
            />
            <ModuleCard 
              icon="fa-wrench" 
              title="Work Order" 
              desc="Service Requests System (Ver35)" 
              color="orange"
              onClick={() => onNavigate(AppView.WORK_ORDER)}
            />
            <ModuleCard 
              icon="fa-brain" 
              title="AI Analytics" 
              desc="Real-time Anomaly Detection" 
              color="cyan"
              isAlert={activeAlertCount > 0}
              onClick={() => onNavigate(AppView.AI_ANALYTICS)}
            />
            <ModuleCard 
              icon="fa-calendar-check" 
              title="PPM Schedule" 
              desc="Preventive Maintenance Plan" 
              color="pink"
              onClick={() => onNavigate(AppView.PPM)}
            />
          </div>

          {/* Operations Summary */}
          <section className="mt-auto pt-6">
            <div className="flex items-center gap-3 mb-6">
               <h3 className="font-display text-[11px] sm:text-xs uppercase tracking-[0.3em] text-cyan-400 whitespace-nowrap">
                  OPERATIONS MONITORING
               </h3>
               <div className="flex-1 h-px bg-cyan-400/10"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
               <SnapshotCard label="Chiller Eff." value="0.78" status="normal" />
               <SnapshotCard label="Current Load" value="482" status="warning" />
               <SnapshotCard label="VSD Freq." value="50.2" status="normal" />
               <SnapshotCard label="System Temp" value="26.1" status="danger" />
            </div>
          </section>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, alertCount }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group active:scale-[0.98] ${
      active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-cyan-400/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
      <i className={`fa-solid ${icon} text-base`}></i>
    </div>
    <span className="text-[14px] sm:text-[15px] font-bold tracking-wide">{label}</span>
    {alertCount > 0 && (
      <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center animate-pulse shadow-lg shadow-red-500/20">
        {alertCount}
      </span>
    )}
  </button>
);

const ModuleCard = ({ icon, title, desc, color, onClick, isAlert }: any) => {
  const colorMap: any = {
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-400 hover:border-purple-500/50 shadow-purple-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500/50 shadow-emerald-500/5',
    orange: 'border-orange-500/20 bg-orange-500/5 text-orange-400 hover:border-orange-500/50 shadow-orange-500/5',
    cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:border-cyan-500/50 shadow-cyan-500/5',
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-400 hover:border-blue-500/50 shadow-blue-500/5',
    pink: 'border-pink-500/20 bg-pink-500/5 text-pink-400 hover:border-pink-500/50 shadow-pink-500/5'
  };

  return (
    <div 
      onClick={onClick}
      className={`cyber-card p-6 sm:p-7 rounded-[2rem] border transition-all active:scale-[0.98] cursor-pointer group relative overflow-hidden ${colorMap[color]} ${isAlert ? 'ring-2 ring-red-500/50 animate-pulse' : 'shadow-xl'}`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-all shadow-inner">
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <i className="fa-solid fa-chevron-right text-xs opacity-20 group-hover:translate-x-1 group-hover:opacity-100 transition-all"></i>
      </div>
      <h3 className="font-display text-[17px] sm:text-lg font-bold text-white mb-2 leading-tight">{title}</h3>
      <p className="text-[13px] text-white/40 leading-relaxed font-medium">{desc}</p>
    </div>
  );
};

const SnapshotCard = ({ label, value, status }: any) => {
  const statusColors: any = {
    normal: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    warning: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
    danger: 'text-red-400 border-red-500/20 bg-red-500/5'
  };
  return (
    <div className={`p-4 sm:p-5 rounded-2xl border ${statusColors[status]} transition-all flex flex-col justify-center items-center text-center shadow-lg`}>
      <p className="text-[10px] sm:text-[11px] uppercase font-black tracking-widest opacity-40 mb-2 truncate w-full">{label}</p>
      <p className="text-lg sm:text-2xl font-display font-black leading-none">{value}</p>
    </div>
  );
};

export default MainDashboard;

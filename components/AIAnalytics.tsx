
import React, { useState, useEffect, useRef } from 'react';
import { User, AnalyticsConfig, AnalyticsSignal, AnalyticsAlertHistory } from '../types';

interface AIAnalyticsProps {
  onBack: () => void;
  user: User;
}

const DEFAULT_CONFIGS: AnalyticsConfig[] = [
  { id: 'xray-temp', name: 'X-RAY Temp Monitoring', unit: '°C', min: 20, max: 28, standard: 24, appUrl: 'https://www.appsheet.com/start/0788eed4-99c2-4cf0-9dca-26d6f8cc077f' },
  { id: 'daily-energy', name: 'Daily Energy Usage', unit: 'kW', min: 200, max: 1000, standard: 500, appUrl: 'https://www.appsheet.com/start/629bda75-2fe2-48a0-b7e4-2834750d7483' },
  { id: 'vsd-freq', name: 'VSD Frequency Monitor', unit: 'Hz', min: 20, max: 55, standard: 50, appUrl: 'https://www.appsheet.com/start/7cedd341-6b86-41a3-97cc-cb7ce5c995d5' },
  { id: 'iaq-co2', name: 'IAQ CO2 Level', unit: 'ppm', min: 350, max: 1000, standard: 600, appUrl: 'https://www.appsheet.com/start/6e3db8a9-a3f0-4b54-aad4-f07424fbcf9e' },
  { id: 'chiller-eff', name: 'Chiller Efficiency', unit: 'kW/TR', min: 0.5, max: 0.9, standard: 0.7, appUrl: 'https://www.appsheet.com/start/0682c57a-71aa-4b05-8349-ae5e148fdcc8' },
];

const AIAnalytics: React.FC<AIAnalyticsProps> = ({ onBack, user }) => {
  const [configs, setConfigs] = useState<AnalyticsConfig[]>([]);
  const [signals, setSignals] = useState<Record<string, AnalyticsSignal>>({});
  const [history, setHistory] = useState<AnalyticsAlertHistory[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'monitor' | 'config' | 'history'>('monitor');
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [correctionModal, setCorrectionModal] = useState<AnalyticsAlertHistory | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const beeperIntervalRef = useRef<number | null>(null);

  // Initialize data
  useEffect(() => {
    const savedConfigs = localStorage.getItem('ai_analytics_configs');
    const savedHistory = localStorage.getItem('ai_analytics_history');
    
    if (savedConfigs) {
      setConfigs(JSON.parse(savedConfigs));
    } else {
      setConfigs(DEFAULT_CONFIGS);
      localStorage.setItem('ai_analytics_configs', JSON.stringify(DEFAULT_CONFIGS));
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('ai_analytics_history', JSON.stringify(history));
  }, [history]);

  // Save configs
  useEffect(() => {
    if (configs.length > 0) localStorage.setItem('ai_analytics_configs', JSON.stringify(configs));
  }, [configs]);

  // Simulated Signal Stream
  useEffect(() => {
    const interval = setInterval(() => {
      const newSignals: Record<string, AnalyticsSignal> = {};
      let alertsFound = 0;

      configs.forEach(config => {
        // Random drift around standard
        const randomFactor = (Math.random() - 0.5) * (config.max - config.min) * 0.1;
        const drift = (Math.random() > 0.95) ? (Math.random() > 0.5 ? config.max * 0.15 : -config.max * 0.15) : 0;
        const value = Number((config.standard + randomFactor + drift).toFixed(2));
        
        const isAlert = value > config.max || value < config.min;
        if (isAlert) alertsFound++;

        newSignals[config.id] = {
          configId: config.id,
          currentValue: value,
          status: isAlert ? 'alert' : 'normal',
          timestamp: new Date().toISOString()
        };

        // If newly alerting, log it
        if (isAlert) {
          const alreadyLogged = history.some(h => h.configId === config.id && !h.resolvedAt && (Date.now() - new Date(h.timestamp).getTime()) < 60000);
          if (!alreadyLogged) {
            const newAlert: AnalyticsAlertHistory = {
              id: `alert-${Date.now()}`,
              configId: config.id,
              signalName: config.name,
              value: value,
              thresholdType: value > config.max ? 'MAX' : 'MIN',
              thresholdValue: value > config.max ? config.max : config.min,
              timestamp: new Date().toISOString()
            };
            setHistory(prev => [newAlert, ...prev]);
          }
        }
      });

      setSignals(newSignals);
      setActiveAlertCount(alertsFound);
    }, 3000);

    return () => clearInterval(interval);
  }, [configs, history]);

  // Audio Beeper Logic
  useEffect(() => {
    if (activeAlertCount > 0 && !isMuted) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (!beeperIntervalRef.current) {
        beeperIntervalRef.current = window.setInterval(() => {
          if (audioCtxRef.current) {
            const osc = audioCtxRef.current.createOscillator();
            const gain = audioCtxRef.current.createGain();
            osc.connect(gain);
            gain.connect(audioCtxRef.current.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, audioCtxRef.current.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtxRef.current.currentTime + 0.1);
          }
        }, 1000);
      }
    } else {
      if (beeperIntervalRef.current) {
        clearInterval(beeperIntervalRef.current);
        beeperIntervalRef.current = null;
      }
    }

    return () => {
      if (beeperIntervalRef.current) clearInterval(beeperIntervalRef.current);
    };
  }, [activeAlertCount, isMuted]);

  const handleClearHistory = (e: React.FormEvent) => {
    e.preventDefault();
    const password = (e.target as any).password.value;
    if (password === 'Clear123') {
      setHistory([]);
      setIsClearingHistory(false);
    } else {
      alert('Incorrect Admin Password');
    }
  };

  const saveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionModal) return;
    const correctionText = (e.target as any).correction.value;
    const updated = history.map(h => h.id === correctionModal.id ? { ...h, correction: correctionText, resolvedAt: new Date().toISOString() } : h);
    setHistory(updated);
    setCorrectionModal(null);
  };

  const updateConfig = (configId: string, field: keyof AnalyticsConfig, value: string) => {
    const updated = configs.map(c => c.id === configId ? { ...c, [field]: Number(value) } : c);
    setConfigs(updated);
  };

  return (
    <div className={`flex h-full overflow-hidden transition-colors duration-500 ${activeAlertCount > 0 ? 'bg-red-900/10' : 'bg-[#0a0e27]'}`}>
      {/* Sidebar */}
      <nav className="w-64 border-r border-cyan-500/20 bg-black/40 flex flex-col p-4 shrink-0">
        <div className="mb-10 px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border transition-all ${activeAlertCount > 0 ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-cyan-500/20 text-cyan-400 border-cyan-400/40'}`}>
              <i className="fa-solid fa-brain"></i>
            </div>
            <h1 className="font-display text-xl font-bold text-cyan-400 uppercase">AI Analytics</h1>
          </div>
          <p className="text-[10px] text-white/40 tracking-widest uppercase italic">Mobilization Intelligence</p>
        </div>

        <div className="flex-1 space-y-1">
          <SideItem icon="fa-gauge-high" label="Real-time Monitor" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} />
          <SideItem icon="fa-sliders" label="Threshold Setup" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
          <SideItem icon="fa-clock-rotate-left" label="Alert History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </div>

        <div className="mt-auto space-y-4">
          {activeAlertCount > 0 && (
             <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${isMuted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-bounce'}`}
             >
                <i className={`fa-solid ${isMuted ? 'fa-volume-mute' : 'fa-bell'}`}></i>
                {isMuted ? 'Alert Muted' : 'Mute Warning'}
             </button>
          )}

          <div className="pt-4 border-t border-white/5">
            <button onClick={onBack} className="flex items-center gap-3 p-3 w-full text-white/40 hover:text-white transition-all group">
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 lg:p-12 no-scrollbar">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-white">
              System Health Monitor
            </h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">AI-Powered Anomaly Detection</p>
          </div>
          <div className="flex items-center gap-4">
             {activeAlertCount > 0 && (
               <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase animate-pulse">
                 {activeAlertCount} Signals Out of Bounds
               </div>
             )}
             <div className="bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-mono text-cyan-400">
               {new Date().toLocaleTimeString()}
             </div>
          </div>
        </header>

        {activeTab === 'monitor' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {configs.map(config => {
              const signal = signals[config.id];
              const isAlert = signal?.status === 'alert';
              return (
                <div 
                   key={config.id} 
                   className={`cyber-card p-6 rounded-2xl border-2 transition-all ${isAlert ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse' : 'border-white/5'}`}
                >
                   <div className="flex justify-between items-start mb-4">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{config.name}</div>
                      <a href={config.appUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-white transition-colors">
                        <i className="fa-solid fa-external-link text-xs"></i>
                      </a>
                   </div>
                   
                   <div className="flex items-baseline gap-2 mb-6">
                      <span className={`text-4xl font-display font-black ${isAlert ? 'text-red-400' : 'text-white'}`}>{signal?.currentValue ?? '--'}</span>
                      <span className="text-xs text-white/40 font-bold">{config.unit}</span>
                   </div>

                   <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                      <div className="absolute inset-y-0 left-[20%] right-[20%] bg-emerald-500/20 border-x border-emerald-500/30"></div>
                      <div 
                        className={`absolute inset-y-0 left-0 transition-all duration-1000 ${isAlert ? 'bg-red-500' : 'bg-cyan-400'}`}
                        style={{ width: `${Math.min(100, (signal?.currentValue / (config.max * 1.5)) * 100)}%` }}
                      ></div>
                   </div>

                   <div className="grid grid-cols-3 gap-2">
                      <MiniMetric label="MIN" value={config.min} />
                      <MiniMetric label="STD" value={config.standard} highlight />
                      <MiniMetric label="MAX" value={config.max} />
                   </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'config' && (
           <div className="space-y-6 animate-fadeIn">
             <div className="cyber-card rounded-2xl overflow-hidden border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40 border-b border-white/10">
                      <th className="px-6 py-4">Signal Name</th>
                      <th className="px-6 py-4">Min Limit</th>
                      <th className="px-6 py-4">Standard</th>
                      <th className="px-6 py-4">Max Limit</th>
                      <th className="px-6 py-4">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {configs.map(config => (
                      <tr key={config.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-white text-sm">{config.name}</td>
                        <td className="px-6 py-4">
                           <input 
                             type="number" 
                             className="w-20 cyber-input p-2 rounded-lg text-xs"
                             value={config.min}
                             onChange={(e) => updateConfig(config.id, 'min', e.target.value)}
                           />
                        </td>
                        <td className="px-6 py-4">
                           <input 
                             type="number" 
                             className="w-20 cyber-input p-2 rounded-lg text-xs font-bold text-emerald-400"
                             value={config.standard}
                             onChange={(e) => updateConfig(config.id, 'standard', e.target.value)}
                           />
                        </td>
                        <td className="px-6 py-4">
                           <input 
                             type="number" 
                             className="w-20 cyber-input p-2 rounded-lg text-xs"
                             value={config.max}
                             onChange={(e) => updateConfig(config.id, 'max', e.target.value)}
                           />
                        </td>
                        <td className="px-6 py-4 text-xs text-white/40 uppercase">{config.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
             <p className="text-[10px] text-white/30 italic">* Settings are automatically synchronized with central intelligence processor.</p>
           </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
             <div className="flex justify-between items-center">
                <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest">Critical Alert History</h3>
                {user.role === 'admin' && (
                  <button 
                    onClick={() => setIsClearingHistory(true)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                  >
                    Clear History
                  </button>
                )}
             </div>
             
             <div className="cyber-card rounded-2xl overflow-hidden border-white/5">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40 border-b border-white/10">
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Signal</th>
                      <th className="px-6 py-4">Detected Value</th>
                      <th className="px-6 py-4">Trigger</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center opacity-20 italic">No historical alerts recorded.</td>
                      </tr>
                    ) : (
                      history.map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-[10px] text-white/40 font-mono">
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-white">{item.signalName}</td>
                          <td className="px-6 py-4 font-black text-red-400">{item.value}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                              {item.thresholdType}: {item.thresholdValue}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                             {item.resolvedAt ? (
                               <span className="text-[10px] text-emerald-400 font-bold uppercase"><i className="fa-solid fa-check-circle mr-1"></i> Corrected</span>
                             ) : (
                               <span className="text-[10px] text-yellow-400 font-bold uppercase animate-pulse"><i className="fa-solid fa-exclamation-triangle mr-1"></i> Awaiting Correction</span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                             {!item.resolvedAt ? (
                               <button 
                                 onClick={() => setCorrectionModal(item)}
                                 className="px-4 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all"
                               >
                                 Add Action
                               </button>
                             ) : (
                               <button 
                                 title={item.correction}
                                 className="text-white/20 hover:text-white transition-colors"
                               >
                                 <i className="fa-solid fa-info-circle"></i>
                               </button>
                             )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
             </div>
          </div>
        )}
      </main>

      {/* History Deletion Modal */}
      {isClearingHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="cyber-card p-8 rounded-2xl w-full max-w-sm border-red-500/40">
              <h3 className="font-display text-lg text-red-400 mb-6 uppercase tracking-widest">Admin Clearance</h3>
              <p className="text-sm text-white/60 mb-6">Sensitive operation. Please enter admin password to delete history logs.</p>
              <form onSubmit={handleClearHistory} className="space-y-4">
                 <input 
                   type="password" 
                   name="password" 
                   required 
                   placeholder="Admin Password"
                   className="w-full cyber-input rounded-xl p-4 text-sm" 
                   autoFocus
                 />
                 <div className="flex gap-4">
                    <button type="submit" className="flex-1 py-4 bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-red-500">Confirm Clear</button>
                    <button type="button" onClick={() => setIsClearingHistory(false)} className="px-6 py-4 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Correction Modal */}
      {correctionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="cyber-card p-8 rounded-2xl w-full max-w-md border-cyan-500/40">
             <h3 className="font-display text-lg text-cyan-400 mb-6 uppercase tracking-widest">Corrective Action</h3>
             <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase font-black">Anomaly Details</p>
                <p className="text-sm font-bold text-white">{correctionModal.signalName}</p>
                <p className="text-lg font-black text-red-400">{correctionModal.value} (Limit: {correctionModal.thresholdValue})</p>
             </div>
             <form onSubmit={saveCorrection} className="space-y-4">
                <div>
                   <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/40">Solution Description</label>
                   <textarea 
                     name="correction" 
                     required 
                     placeholder="State the actions taken to normalize the signal..."
                     className="w-full cyber-input rounded-xl p-4 text-sm h-32 resize-none"
                   ></textarea>
                </div>
                <div className="flex gap-4">
                   <button type="submit" className="flex-1 py-4 bg-cyan-600 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-cyan-400">Save Action</button>
                   <button type="button" onClick={() => setCorrectionModal(null)} className="px-6 py-4 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

const MiniMetric: React.FC<{ label: string, value: number, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`p-2 rounded-lg text-center ${highlight ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5'}`}>
     <p className="text-[8px] text-white/30 uppercase font-black mb-1">{label}</p>
     <p className={`text-xs font-bold ${highlight ? 'text-emerald-400' : 'text-white/60'}`}>{value}</p>
  </div>
);

const SideItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,245,255,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
  >
    <i className={`fa-solid ${icon} w-5 text-center text-sm`}></i>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

export default AIAnalytics;

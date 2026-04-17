import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  UrbanContext, 
  PredictionPoint, 
  fuseSensoryData, 
  generate12HForecast, 
  INTERVENTIONS 
} from '../../lib/urban_data';
import { StationReading } from '../../lib/types';
import { useLang } from '../../contexts/LanguageContext';
import clsx from 'clsx';

interface Props {
  station: StationReading;
  onClose: () => void;
  isLight?: boolean;
}

export function UrbanCommandCenter({ station, onClose, isLight = false }: Props) {
  const { t } = useLang();
  const [context, setContext] = useState<UrbanContext | null>(null);
  const [forecast, setForecast] = useState<PredictionPoint[]>([]);
  const [activeInterventions, setActiveInterventions] = useState<string[]>([]);
  const [logs, setLogs] = useState<{ id: string; msg: string; status: 'pending' | 'verified' | 'executed' }[]>([]);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const textPrim = isLight ? "#1a202c" : "#f8fafc";
  const textMuted = isLight ? "#718096" : "#94a3b8";
  const panelBg = isLight ? "rgba(255, 255, 255, 0.9)" : "rgba(15, 23, 42, 0.9)";
  const borderColor = isLight ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";

  useEffect(() => {
    fuseSensoryData(station).then(ctx => {
      setContext(ctx);
      setForecast(generate12HForecast(ctx));
    });
  }, [station]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const adjustedForecast = useMemo(() => {
    if (!forecast.length) return [];
    let totalImpact = 0;
    activeInterventions.forEach(id => {
      const intervention = INTERVENTIONS.find(i => i.id === id);
      if (intervention) totalImpact += intervention.impact;
    });

    return forecast.map((p, idx) => ({
      ...p,
      aqi: Math.max(20, p.aqi - (totalImpact * (idx / 12 + 0.5))),
    }));
  }, [forecast, activeInterventions]);

  const addLog = (msg: string, status: 'pending' | 'verified' | 'executed' = 'pending') => {
    const id = Math.random().toString(36).substring(7);
    setLogs(prev => [...prev, { id, msg, status }]);
    return id;
  };

  const handleInterventionToggle = (id: string) => {
    if (activeInterventions.includes(id)) {
      setActiveInterventions(prev => prev.filter(v => v !== id));
      addLog(`DEACTIVATING PROTOCOL: ${id.toUpperCase()}`, 'executed');
    } else {
      setIsVerifying(id);
      addLog(`REQUESTING COMMAND AUTHORIZATION: ${id.toUpperCase()}`, 'pending');
    }
  };

  const verifyIntervention = () => {
    if (!isVerifying) return;
    const id = isVerifying;
    setActiveInterventions(prev => [...prev, id]);
    setLogs(prev => prev.map(l => l.msg.includes(id.toUpperCase()) ? { ...l, status: 'verified' } : l));
    addLog(`PROTOCOL VERIFIED. EXECUTING IN ${station.station_name}...`, 'executed');
    setIsVerifying(null);
  };

  if (!context) return (
    <div className="fixed inset-0 z-[200] backdrop-blur-3xl flex items-center justify-center bg-black/40">
       <div className="font-mono text-white animate-pulse">{t('systemStatus')}...</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] backdrop-blur-2xl bg-slate-900/60 flex flex-col p-6 overflow-hidden select-none animate-fadeIn">
      
      {/* ── HEADER ─────────────────────── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            Urban <span className="text-indigo-400">Intelligence</span> Control
          </h1>
          <div className="flex gap-4 mt-1">
             <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
               {t('systemStatus')}: Nominal
             </div>
             <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
               // Node: {station.station_id} // Zone: {station.zone}
             </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="px-6 py-2 rounded-full bg-white/10 hover:bg-rose-500 text-white transition-all text-xs font-black uppercase tracking-widest border border-white/10"
        >
          [ {t('minimize').toUpperCase()} ]
        </button>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* ── LEFT: SENSORY MATRIX ────────────────── */}
        <div className="col-span-3 rounded-3xl p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar border"
             style={{ background: panelBg, borderColor: borderColor }}>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
            {t('govDashboard')}
          </div>
          
          <div className="space-y-5">
            <SensoryRow label={t('aqi').toUpperCase()} value={context.aqi} color="#ef4444" isLight={isLight} />
            <SensoryRow label={t('pm25_label').toUpperCase()} value={`${context.pm25} µg/m³`} isLight={isLight} />
            <SensoryRow label="TRAFFIC DENSITY" value={`${(context.traffic * 100).toFixed(1)}%`} progress={context.traffic} color="#3b82f6" isLight={isLight} />
            <SensoryRow label="SATELLITE PLUME" value={`${(context.satelliteIndex * 100).toFixed(1)}%`} progress={context.satelliteIndex} color="#8b5cf6" isLight={isLight} />
            <SensoryRow label={t('windDirection').toUpperCase()} value={`${context.windSpeed}m/s @ ${context.windDir}°`} isLight={isLight} />
          </div>
          
          <div className="mt-auto pt-6 border-t border-white/5 space-y-1">
             <div className="text-[10px] opacity-40 uppercase font-bold text-white">Ingestion cadence: 400ms</div>
             <div className="text-[10px] opacity-40 uppercase font-bold text-emerald-400">OpenWeather Stream: ACTIVE</div>
          </div>
        </div>

        {/* ── CENTER: PREDICTIVE ENGINE ───────────── */}
        <div className="col-span-6 flex flex-col gap-6 min-h-0">
          <div className="flex-1 rounded-3xl p-6 flex flex-col relative overflow-hidden border"
               style={{ background: panelBg, borderColor: borderColor }}>
             
             <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Spatiotemporal Prediction [12H_GRID]</div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white opacity-20" />
                      <span className="text-[10px] uppercase font-bold text-white opacity-60">Status Quo</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[10px] uppercase font-bold text-indigo-400">Projected (Sim)</span>
                   </div>
                </div>
             </div>

             <div className="flex-1 min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={adjustedForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} domain={[0, 500]} />
                    <RechartsTooltip 
                      contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '11px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="aqi" 
                      stroke="#818cf8" 
                      strokeWidth={3} 
                      fill="url(#colorAqi)" 
                      animationDuration={1000} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="h-48 rounded-3xl p-6 overflow-hidden flex flex-col border"
               style={{ background: panelBg, borderColor: borderColor }}>
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 pb-2 border-b border-white/5">
                Command Terminal [Execution_Log]
             </div>
             <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[11px] space-y-2" ref={scrollRef}>
                {logs.map(log => (
                  <div key={log.id} className={clsx(
                    "flex gap-3",
                    log.status === 'pending' ? 'text-amber-400' : log.status === 'verified' ? 'text-indigo-400 font-bold' : 'text-slate-300'
                  )}>
                    <span className="opacity-30 tracking-tighter">[{log.status.toUpperCase()}]</span>
                    <span className="leading-relaxed">{log.msg}</span>
                  </div>
                ))}
                {logs.length === 0 && <div className="text-slate-500 italic opacity-50">Waiting for system signals...</div>}
             </div>
          </div>
        </div>

        {/* ── RIGHT: DIGITAL TWIN SIMULATOR ────────── */}
        <div className="col-span-3 rounded-3xl p-6 flex flex-col gap-6 border"
             style={{ background: panelBg, borderColor: borderColor }}>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">
            Protocol Interventions
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
            {INTERVENTIONS.map(i => (
              <div key={i.id} onClick={() => handleInterventionToggle(i.id)} className={clsx(
                "group p-4 rounded-2xl cursor-pointer transition-all border",
                activeInterventions.includes(i.id) 
                  ? "bg-indigo-500 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]" 
                  : "bg-white/5 border-white/5 hover:border-white/20"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <span className={clsx("text-[11px] font-black uppercase", activeInterventions.includes(i.id) ? "text-white" : "text-slate-300")}>
                    {i.title}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">AQI ↓{i.impact}</span>
                </div>
                <div className="h-1 w-full bg-black/20 rounded-full overflow-hidden">
                  <div className={clsx("h-full transition-all duration-500", activeInterventions.includes(i.id) ? "bg-white" : "bg-indigo-500")} 
                       style={{ width: `${(i.impact / 80) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* VERIFICATION DIALOG */}
          {isVerifying && (
            <div className="border-2 border-amber-500/50 bg-amber-500/10 p-5 rounded-2xl animate-pulse flex flex-col gap-4">
               <div className="text-[11px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-lg">⚠️</span> Authorization Required
               </div>
               <div className="text-[10px] text-slate-300 leading-relaxed uppercase">
                 Infrastructural change protocol detected. 
                 Operator confirmation sequence initiated.
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={verifyIntervention}
                    className="flex-1 bg-amber-500 text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-colors"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => { setIsVerifying(null); addLog(`PROTOCOL ABORTED BY OPERATOR`, 'executed'); }}
                    className="flex-1 bg-white/10 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-colors"
                  >
                    Abort
                  </button>
               </div>
            </div>
          )}

          {!isVerifying && (
            <div className="h-32 bg-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 opacity-50">
               <div className="text-[10px] uppercase font-black mb-3 text-slate-400">Biometric Authority Token</div>
               <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                     <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
               </div>
            </div>
          )}
        </div>

      </div>

      <div className="mt-8 pt-4 border-t border-white/5 flex justify-between text-[10px] font-bold tracking-widest opacity-30 uppercase text-white">
         <div>Core System: v.U.I_8.4 // Encryption: ACTIVE // Network: SECURE</div>
         <div>© 2026 Urban Precision Systems // Authorized Command View</div>
      </div>
    </div>
  );
}

function SensoryRow({ label, value, progress, color = "#fff", isLight }: { label: string; value: string | number; progress?: number; color?: string; isLight: boolean }) {
  const textColor = isLight ? "text-slate-900" : "text-white";
  return (
    <div className="flex flex-col gap-2">
       <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold opacity-50 text-white uppercase tracking-wider">{label}</span>
          <span className={clsx("text-sm font-black italic", textColor)} style={{ color: progress ? color : undefined }}>{value}</span>
       </div>
       {progress !== undefined && (
         <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-700" style={{ width: `${progress * 100}%`, background: color }} />
         </div>
       )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  Tooltip as RechartsTooltip
} from 'recharts';
import { useLang } from '../../contexts/LanguageContext';
import { StationReading } from '../../lib/types';
import { colorFor } from '../../lib/aqi';
import clsx from 'clsx';

interface Props {
  reading: StationReading;
  isLight: boolean;
  onCommandProtocol: () => void;
}

export function DecisionIntelligenceSystem({ reading, isLight, onCommandProtocol }: Props) {
  const { t } = useLang();
  
  // States for Simulation
  const [trafficReduction, setTrafficReduction] = useState(0); // 0 to 100%
  const [industryReduction, setIndustryReduction] = useState(0); // 0 to 100%
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  // Toggle states for blocks
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    reasoner: false,
    source: false,
    radar: false,
    sim: false,
    policies: false,
    neural: false
  });

  const toggleBlock = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const textPrim = isLight ? "#1a202c" : "#f8fafc";
  const textMuted = isLight ? "#718096" : "#94a3b8";
  const cardBg = isLight ? "rgba(255,255,255,0.7)" : "rgba(27,29,36,0.7)";
  const border = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)";

  // logic for source breakdown based on pollutants
  const sourceData = useMemo(() => {
    return [
      { name: 'Traffic', value: Math.round((reading.co / 2 + reading.pm25 / 4) * 1.5), color: '#3b82f6', icon: '🚗' },
      { name: 'Industry', value: Math.round((reading.so2 * 2 + reading.no2) * 0.8), color: '#ef4444', icon: '🏭' },
      { name: 'Dust', value: Math.round((reading.pm10 - reading.pm25) * 1.2), color: '#d97706', icon: '🏗️' },
      { name: 'Weather', value: Math.round(Math.max(5, (100 - (reading.temp / 40) * 20))), color: '#8b5cf6', icon: '💨' },
    ];
  }, [reading]);

  // Simulation Logic
  const simulatedAQI = useMemo(() => {
    let reduction = 0;
    reduction += (trafficReduction / 100) * (sourceData[0].value / 250) * 100;
    reduction += (industryReduction / 100) * (sourceData[1].value / 250) * 80;
    return Math.max(20, Math.round(reading.aqi - reduction));
  }, [reading.aqi, trafficReduction, industryReduction, sourceData]);

  const delta = reading.aqi - simulatedAQI;
  const healthImpact = delta > 50 ? 'Lowers Acute Risk by 40%' : delta > 20 ? 'Reduces ER visits by 15%' : 'Minimal Impact';

  return (
    <div className="flex flex-col gap-3 animate-fadeIn pb-10">
      
      {/* ── 0. REGION OVERVIEW (Integrated AQI) ── */}
      <div 
        className="rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all"
        style={{ background: cardBg, borderColor: border }}
      >
        <div className="flex justify-between items-start mb-3">
           <div>
              <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: textMuted }}>{t('airQualityIndex')}</div>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black" style={{ color: colorFor(reading.aqi) }}>{reading.aqi}</span>
                 <span className="text-xs font-bold" style={{ color: textMuted }}>AQI</span>
              </div>
           </div>
           <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase" style={{ background: colorFor(reading.aqi) + '22', color: colorFor(reading.aqi), border: `1px solid ${colorFor(reading.aqi)}44` }}>
              {reading.station_name}
           </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
           {[
             { label: 'PM2.5', val: reading.pm25 },
             { label: 'PM10', val: reading.pm10 },
             { label: 'NO2', val: reading.no2 },
             { label: 'SO2', val: reading.so2 }
           ].map(stat => (
             <div key={stat.label} className="flex flex-col items-center p-1.5 rounded-xl transition-colors hover:bg-white/5" style={{ border: `1px solid ${border}` }}>
                <span className="text-[8px] font-bold uppercase opacity-60" style={{ color: textMuted }}>{stat.label}</span>
                <span className="text-[12px] font-black" style={{ color: textPrim }}>{stat.val.toFixed(0)}</span>
             </div>
           ))}
        </div>
      </div>
      
      {/* ── 1. PREDICTIVE REASONER ── */}
      <Block 
        id="reasoner"
        title={t('aiReasoning')}
        icon="🧠"
        collapsed={collapsed.reasoner}
        onToggle={() => toggleBlock('reasoner')}
        cardBg={cardBg}
        border={border}
        textMuted={textMuted}
        minimizeLabel={t('minimize')}
        expandLabel={t('expand')}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
               <span className="text-sm">🔮</span>
            </div>
            <div>
               <p className="text-[13px] font-bold leading-snug" style={{ color: textPrim }}>
                 Target AQI: <span className="text-rose-500 font-black">{Math.round(reading.aqi * 1.15)}</span> in 3h
               </p>
               <p className="text-[11px] mt-1" style={{ color: textMuted }}>
                 Cause: <span className="text-sky-500 font-bold">Traffic Surge</span> + <span className="text-amber-600 font-bold">Wind Drop</span>
               </p>
            </div>
          </div>
          
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
             <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">{t('deepInsight')}</div>
             <p className="text-[11px] font-medium leading-[1.4]" style={{ color: textPrim }}>
               Stagnation in Zone 4 detected. Particulates are not dispersing due to local inversion.
             </p>
          </div>
        </div>
      </Block>

      {/* ── 2. SOURCE-LEVEL INTELLIGENCE ── */}
      <Block 
        id="source"
        title={t('sourceAttribution')}
        icon="🎯"
        collapsed={collapsed.source}
        onToggle={() => toggleBlock('source')}
        cardBg={cardBg}
        border={border}
        textMuted={textMuted}
        minimizeLabel={t('minimize')}
        expandLabel={t('expand')}
      >
        <div className="text-[10px] font-bold mb-3 opacity-60" style={{ color: textMuted }}>{t('sourceIndustry')}</div>
        <div className="h-[130px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%" cy="50%"
                innerRadius={30} outerRadius={50}
                paddingAngle={5}
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-[12px] font-black" style={{ color: textPrim }}>AQI</span>
             <span className="text-[9px] font-bold" style={{ color: textMuted }}>{reading.aqi}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
           {sourceData.map(s => (
             <div key={s.name} className="flex items-center gap-2">
                <span className="text-[10px]">{s.icon}</span>
                <div className="flex-1">
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase" style={{ color: textMuted }}>{s.name}</span>
                      <span className="text-[9px] font-black" style={{ color: s.color }}>{s.value}%</span>
                   </div>
                   <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color }} />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </Block>

      {/* ── 3. RADAR FUSION ── */}
      <Block 
        id="radar"
        title={t('radarFusion')}
        icon="🌐"
        collapsed={collapsed.radar}
        onToggle={() => toggleBlock('radar')}
        cardBg={cardBg}
        border={border}
        textMuted={textMuted}
        minimizeLabel={t('minimize')}
        expandLabel={t('expand')}
      >
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
              { subject: 'Traffic', A: 80 },
              { subject: 'Weather', A: 65 },
              { subject: 'Satellite', A: 90 },
              { subject: 'Ground', A: 70 },
              { subject: 'Industry', A: 50 },
            ]}>
              <PolarGrid stroke={isLight ? "#e2e8f0" : "#334155"} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: textMuted, fontSize: 8, fontWeight: 'bold' }} />
              <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-1">
           <span className="text-[9px] font-bold py-1 px-2 rounded-lg bg-indigo-500/10 text-indigo-500">
             {t('contextSatellite')}
           </span>
        </div>
      </Block>

      {/* ── 4. DIGITAL TWIN SIMULATOR ── */}
      <Block 
        id="sim"
        title={t('digitalTwin')}
        icon="🧪"
        collapsed={collapsed.sim}
        onToggle={() => toggleBlock('sim')}
        cardBg={cardBg}
        border={border}
        textMuted={textMuted}
        minimizeLabel={t('minimize')}
        expandLabel={t('expand')}
      >
        <div className="space-y-4">
           <div>
              <div className="flex justify-between mb-1">
                 <label className="text-[11px] font-bold" style={{ color: textPrim }}>{t('reduceTrafficBtn')}</label>
                 <span className="text-[11px] font-black text-indigo-500">-{trafficReduction}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={trafficReduction}
                onChange={(e) => setTrafficReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
           </div>

           <div>
              <div className="flex justify-between mb-1">
                 <label className="text-[11px] font-bold" style={{ color: textPrim }}>{t('industrialOutput')}</label>
                 <span className="text-[11px] font-black text-rose-500">-{industryReduction}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={industryReduction}
                onChange={(e) => setIndustryReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
           </div>

           <div className="p-3 rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/5 mt-2">
              <div className="flex items-center justify-between">
                 <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">{t('simulatedOutcome')}</div>
                    <div className="flex items-baseline gap-2 mt-1">
                       <span className="text-2xl font-black" style={{ color: colorFor(simulatedAQI) }}>{simulatedAQI}</span>
                       <span className="text-xs font-bold text-emerald-500">↓ {delta} pts</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[9px] font-bold opacity-60 uppercase">{t('confidence')}</div>
                    <div className="text-[12px] font-black">98.4%</div>
                 </div>
              </div>
           </div>
        </div>
      </Block>

      {/* ── 5. AUTONOMOUS DIRECTIVES ── */}
      <Block 
        id="policies"
        title={t('smartAlerts')}
        icon="🛡️"
        collapsed={collapsed.policies}
        onToggle={() => toggleBlock('policies')}
        cardBg={cardBg}
        border={border}
        textMuted={textMuted}
        minimizeLabel={t('minimize')}
        expandLabel={t('expand')}
      >
        <div className="space-y-2">
           {[
             { id: 'p1', title: 'Odd-Even Implementation', type: 'Traffic', impact: '-40' },
             { id: 'p2', title: 'Construction Ban', type: 'Dust', impact: '-25' },
             { id: 'p3', title: 'School Closure', type: 'Health', impact: 'N/A' },
           ].map(policy => (
             <button 
               key={policy.id}
               onClick={() => setActivePolicy(activePolicy === policy.id ? null : policy.id)}
               className={clsx(
                 "w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between",
                 activePolicy === policy.id ? "bg-emerald-500 border-emerald-600 shadow-lg" : "bg-white/5 border-transparent hover:border-slate-300"
               )}
             >
                <div>
                   <div className={clsx("text-[11px] font-black", activePolicy === policy.id ? "text-white" : textPrim)}>
                      {policy.title}
                   </div>
                   <div className={clsx("text-[9px] font-bold opacity-70", activePolicy === policy.id ? "text-emerald-100" : textMuted)}>
                      {policy.type} • {policy.impact} AQI
                   </div>
                </div>
             </button>
           ))}
        </div>
        <button className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-black text-[11px] shadow-lg transition-all">
           {t('executePolicies')}
        </button>
      </Block>

      {/* ── 6. NEURAL SYNC ── */}
      <Block 
        id="neural"
        title="Neural Engine Sync"
        icon="🧠"
        collapsed={collapsed.neural}
        onToggle={() => toggleBlock('neural')}
        cardBg={cardBg}
        border={border}
        textMuted={textMuted}
        minimizeLabel={t('minimize')}
        expandLabel={t('expand')}
      >
        <div className="space-y-3">
           <div className="flex justify-between items-center text-[9px] font-black uppercase opacity-60" style={{ color: textMuted }}>
              <span>AI System Status</span>
              <span className="text-emerald-500 animate-pulse">99.8% Sync</span>
           </div>
           
           {/* Rolling Ticker */}
           <div className="h-[32px] overflow-hidden relative font-mono text-[9px] px-2 py-1.5 rounded-lg bg-black/20" style={{ color: textPrim }}>
             <div className="flex flex-col gap-1.5 animate-rollLog">
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                   <span>SYNCING SATELLITE TILE 44A... DONE</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                   <span>CALIBRATING SENSOR_GRID_IND02... OK</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                   <span>RECALIBRATING DISPERSAL V2...</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                   <span>FETCHING CROSS-VALIDATION... 76%</span>
                </div>
                {/* Loop items for smooth transition */}
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                   <span>SYNCING SATELLITE TILE 44A... DONE</span>
                </div>
             </div>
           </div>

           <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: '99.8%' }} />
           </div>
        </div>
      </Block>

      <button 
        onClick={onCommandProtocol}
        className="w-full py-2.5 rounded-xl border border-white bg-black text-white font-mono text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-2xl mt-2"
      >
         ◽ URBAN COMMAND [PROTOCOL_B]
      </button>

    </div>
  );
}

// ── Block Component Helper ────────────────────────────────────────────────
function Block({ 
  id, title, icon, collapsed, onToggle, 
  cardBg, border, textMuted, minimizeLabel, expandLabel, children 
}: { 
  id: string; title: string; icon: string; collapsed: boolean; onToggle: () => void;
  cardBg: string; border: string; textMuted: string; minimizeLabel: string; expandLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl backdrop-blur-xl border shadow-xl overflow-hidden transition-all duration-300"
      style={{ background: cardBg, borderColor: border, maxHeight: collapsed ? '48px' : '600px' }}>
      
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: textMuted }}>
           <span>{icon}</span> {title}
        </div>
        <button 
          className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border border-current opacity-40 hover:opacity-100 transition-opacity"
          style={{ color: textMuted }}
        >
          {collapsed ? expandLabel : minimizeLabel}
        </button>
      </div>

      <div className={clsx("px-4 pb-4 animate-fadeIn", collapsed && "hidden")}>
        {children}
      </div>
    </div>
  );
}

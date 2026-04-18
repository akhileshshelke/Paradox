import { useMemo, useState, useRef, useEffect } from "react";
import { useLang } from "./contexts/LanguageContext";

import { AQICard } from "./components/AQICard";
import { WeatherCard } from "./components/WeatherCard";
import { AIPredictionPanel } from "./components/AIPredictionPanel";
import { UnifiedMap } from "./components/UnifiedMap";
import { Navbar } from "./components/Navbar";
import { RankingSection } from "./components/RankingSection";
import { CmdKModal } from "./components/CmdKModal";
import { CityDrillDownModal } from "./components/CityDrillDownModal";
import { useForecast } from "./hooks/useForecast";
import { useLiveAQI } from "./hooks/useLiveAQI";
import { bandFor } from "./lib/aqi";
import { DecisionIntelligenceSystem } from "./components/decision/DecisionIntelligenceSystem";
import { UrbanCommandCenter } from "./components/command/UrbanCommandCenter";

// ── Ambient background config per theme ──────────────────────────────
const AMBIENT_LIGHT = {
  bg: "linear-gradient(135deg, #e8f4fd, #dbeafe, #ede9fe, #e8f4fd)",
  orb1: "rgba(56,189,248,0.18)",
  orb2: "rgba(139,92,246,0.12)",
  orb3: "rgba(16,185,129,0.10)",
};
const AMBIENT_DARK = {
  bg: "linear-gradient(135deg, #0f1117, #111827, #130f1e, #0f1117)",
  orb1: "rgba(56,189,248,0.12)",
  orb2: "rgba(139,92,246,0.10)",
  orb3: "rgba(16,185,129,0.08)",
};

// ── AQI Scale (for fullscreen map) ─────────────────────────────────
const AQI_SCALE = [
  { label: "Good", range: "0–50", color: "#00b050" },
  { label: "Satisfactory", range: "51–100", color: "#92d050" },
  { label: "Moderate", range: "101–200", color: "#ffcc00" },
  { label: "Poor", range: "201–300", color: "#ff7c00" },
  { label: "Very Poor", range: "301–400", color: "#ff0000" },
  { label: "Severe", range: "401+", color: "#7030a0" },
];

function AQIScaleLegend() {
  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[250] flex items-center gap-2 md:gap-5 px-8 md:px-10 py-4 md:py-5 rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.4)] bg-[#0a0c12]/95 backdrop-blur-3xl border border-white/10">
      {AQI_SCALE.map((s) => (
        <div key={s.label} className="flex flex-col items-center gap-2 px-3 md:px-4 border-r border-white/5 last:border-0">
          <div className="w-6 h-2 md:w-8 md:h-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 20px ${s.color}80` }} />
          <span className="text-[10px] md:text-[12px] font-black text-white/90 whitespace-nowrap tracking-[0.1em] uppercase">{s.label}</span>
          <span className="hidden md:block text-[11px] font-black text-white/30 tracking-tight leading-none">{s.range}</span>
        </div>
      ))}
    </div>
  );
}

function defaultSelected(stations: Record<string, any>): string | null {
  const list = Object.values(stations) as any[];
  if (!list.length) return null;
  list.sort((a, b) => b.aqi - a.aqi);
  return list[0].station_id;
}

export default function App() {
  const { t } = useLang();
  const live = useLiveAQI();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [mapTheme, setMapTheme] = useState<"dark" | "light">("light");
  const [isDSSMode, setIsDSSMode] = useState(false);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<string>("overview");

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const stationList = useMemo(() => Object.values(live.stations), [live.stations]);

  const filtered = query.trim().length > 1
    ? stationList
      .filter(
        (s) =>
          s.station_name.toLowerCase().includes(query.toLowerCase()) ||
          s.zone.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8)
    : [];

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const isLight = mapTheme === "light";
  const ambient = isLight ? AMBIENT_LIGHT : AMBIENT_DARK;

  const effectiveSelected = selectedId ?? defaultSelected(live.stations);
  const selected = effectiveSelected ? live.stations[effectiveSelected] ?? null : null;
  const { forecast } = useForecast(effectiveSelected);

  return (
    <div
      className="min-h-screen w-screen overflow-x-hidden font-sans flex flex-col relative"
      style={{ background: isLight ? "#e8f4fd" : "#0f1117", overflow: "hidden" }}
    >
      {/* Ambient animated background */}
      <div className="ambient-bg absolute inset-0 z-0 pointer-events-none" style={{ background: ambient.bg, opacity: 0.85 }} />
      <div className="ambient-orb z-0" style={{ width: 600, height: 600, background: ambient.orb1, top: "-10%", right: "5%" }} />
      <div className="ambient-orb-alt z-0" style={{ width: 500, height: 500, background: ambient.orb2, bottom: "5%", left: "-5%" }} />
      <div className="ambient-orb z-0" style={{ width: 400, height: 400, background: ambient.orb3, top: "40%", left: "40%", animationDelay: "-8s" }} />
      <div className="relative z-10 flex flex-col flex-1">
        {/* ── 1. Sticky Navbar ── */}
        <Navbar
          regime={live.regime}
          connected={live.connected}
          lastTickAt={live.lastTickAt}
          stations={stationList}
          selectedId={effectiveSelected}
          onSelect={setSelectedId}
          mapTheme={mapTheme}
          onThemeToggle={() => setMapTheme((p) => (p === "dark" ? "light" : "dark"))}
          isDSSMode={isDSSMode}
          onDSSToggle={() => setIsDSSMode(!isDSSMode)}
          viewMode={viewMode}
          onViewMode={setViewMode}
          query={query}
          onQueryChange={setQuery}
          filteredStations={filtered}
        />

        {/* Fullscreen Map View */}
        {isMapFullscreen ? (
          <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900 animate-fadeIn">
            {/* Prominent Back Button */}
            <div className="absolute top-8 left-8 z-[210]">
              <button
                onClick={() => setIsMapFullscreen(false)}
                className="group px-7 py-3.5 bg-white text-slate-900 text-[13px] font-black uppercase tracking-widest rounded-2xl shadow-2xl flex items-center gap-3 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all border border-slate-100"
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center transition-transform group-hover:-rotate-90">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                Exit Map View
              </button>
            </div>

            <div className="flex-1 relative z-0">
              <UnifiedMap stations={live.stations} selectedId={effectiveSelected} onSelect={setSelectedId} mapTheme={mapTheme} />
            </div>
            <AQIScaleLegend />
          </div>
        ) : (
          <>

            <main className="max-w-7xl mx-auto w-full p-4 lg:p-6 pt-24 flex flex-col gap-6 flex-1 relative z-10">

              {/* ── Overview ── */}
              {viewMode === "overview" && (
                <div className="flex flex-col gap-6 animate-fadeIn">

                  {/* Top row: AQI card (left) + compact map (right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      {selected ? (
                        <AQICard
                          reading={selected}
                          onExpand={() => setShowDrillDown(true)}
                          isLight={isLight}
                          isMinimized={false}
                          onToggleMinimize={() => { }}
                        />
                      ) : (
                        <div className="h-64 flex flex-col items-center justify-center rounded-3xl"
                          style={{ border: `2px dashed ${isLight ? "#cbd5e1" : "#334155"}`, background: isLight ? "rgba(255,255,255,0.5)" : "rgba(20,22,30,0.5)" }}>
                          <div className="text-4xl mb-3">🌍</div>
                          <p className="text-sm font-bold" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>Search for a city or station above</p>
                        </div>
                      )}
                    </div>

                    {/* Compact map preview */}
                    <div className="lg:col-span-1">
                      <div className="w-full aspect-square relative rounded-3xl overflow-hidden shadow-xl border group"
                        style={{ borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }}>
                        <div className="absolute inset-0 z-0">
                          <UnifiedMap stations={live.stations} selectedId={effectiveSelected} onSelect={setSelectedId} mapTheme={mapTheme} />
                        </div>
                        <div className="absolute top-3 left-3 z-10 pointer-events-none">
                          <div className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm"
                            style={{ background: isLight ? "rgba(255,255,255,0.92)" : "rgba(15,23,42,0.92)", color: isLight ? "#0f172a" : "#f8fafc" }}>
                            India AQI Map
                          </div>
                        </div>
                        <button
                          onClick={() => setIsMapFullscreen(true)}
                          className="absolute inset-0 w-full h-full bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 z-20 backdrop-blur-[2px]"
                          aria-label="Expand Map to Fullscreen"
                        >
                          <div className="px-4 py-2 bg-white text-slate-900 text-[12px] font-black uppercase tracking-widest rounded-full shadow-2xl flex items-center gap-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            Expand
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Full-width Pollutant Breakdown */}
                  {selected && (
                    <PollutantCard reading={selected} isLight={isLight} />
                  )}
                </div>
              )}

              {viewMode === "forecast" && !selected && (
                <div className="h-64 flex flex-col items-center justify-center rounded-3xl animate-fadeIn" style={{ border: `2px dashed ${isLight ? "#cbd5e1" : "#334155"}` }}>
                  <div className="text-4xl mb-3">📈</div>
                  <p className="text-sm font-bold" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>Search for a location in the navbar to view forecasts</p>
                </div>
              )}

              {viewMode === "forecast" && selected && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <div className="w-full">
                    <AIPredictionPanel
                      latest={selected}
                      forecast={forecast}
                      isLight={isLight}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                    <div className="lg:col-span-1">
                      <MergedSmartSuggestions
                        reading={selected}
                        recommendations={live.recommendations}
                        isLight={isLight}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      {isDSSMode ? (
                        <DecisionIntelligenceSystem
                          reading={selected}
                          isLight={isLight}
                          onCommandProtocol={() => setIsCommandMode(true)}
                        />
                      ) : (
                        <div className="h-full rounded-2xl flex items-center justify-center p-6 text-center border" style={{ background: isLight ? "#f8fafc" : "#1e293b", borderColor: isLight ? "#e2e8f0" : "#334155" }}>
                          <div>
                            <span className="text-3xl mb-3 block">🏛️</span>
                            <h3 className="text-sm font-bold mb-1" style={{ color: isLight ? "#334155" : "#cbd5e1" }}>Decision Support System</h3>
                            <p className="text-xs" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>Enable DSS PRO in the top navigation to view predictive urban analytics & simulation.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {viewMode === "rankings" && (
                <div className="animate-fadeIn">
                  <RankingSection stations={stationList} onSelect={(id) => { setSelectedId(id); setViewMode("overview"); window.scrollTo({ top: 0, behavior: "smooth" }); }} isLight={isLight} />
                </div>
              )}

              {viewMode === "about" && (
                <div className="animate-fadeIn pb-12">
                  <AboutSection isLight={isLight} />
                </div>
              )}
            </main>
          </>
        )}

        {/* ── Modals ── */}
        <CmdKModal stations={stationList} onSelect={setSelectedId} />
        {showDrillDown && selected && (
          <CityDrillDownModal
            reading={selected}
            forecast={forecast}
            onClose={() => setShowDrillDown(false)}
          />
        )}

        {isCommandMode && selected && (
          <UrbanCommandCenter
            station={selected}
            onClose={() => setIsCommandMode(false)}
          />
        )}

        {/* ── Footer ── */}
        <footer
          className="mt-auto py-6 px-6 text-center"
          style={{
            borderTop: `1px solid ${isLight ? "#e2e8f0" : "#3f4354"}`,
            background: isLight ? "#f8fafc" : "#1b1d24",
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21.5c-4.418 0-8-3.582-8-8 0-4.418 8-11.5 8-11.5s8 7.082 8 11.5c0 4.418-3.582 8-8 8z" />
                </svg>
              </div>
              <span className="text-[12px] font-bold" style={{ color: isLight ? "#1a202c" : "#f8fafc" }}>
                Air Quality Intelligence
              </span>
              <span className="text-[11px]" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>
                · Real-time urban air analytics
              </span>
            </div>
            <div className="text-[11px] font-medium" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>
              Data refreshes every 60s · India NAQI Standard · Not for medical use
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ── Inline sub-components ─────────────────────────────────────────────────

function PollutantCard({ reading, isLight }: { reading: any; isLight: boolean }) {
  const pollutants = [
    { name: "PM2.5", value: reading.pm25, unit: "µg/m³", max: 120, color: "#0284c7", icon: "🔵", safe: 25 },
    { name: "PM10", value: reading.pm10, unit: "µg/m³", max: 250, color: "#7c3aed", icon: "🟣", safe: 50 },
    { name: "NO₂", value: reading.no2, unit: "µg/m³", max: 180, color: "#d97706", icon: "🟠", safe: 40 },
    { name: "SO₂", value: reading.so2, unit: "µg/m³", max: 80, color: "#e11d48", icon: "🔴", safe: 20 },
    { name: "CO", value: reading.co, unit: "mg/m³", max: 10, color: "#16a34a", icon: "🟢", safe: 2 },
    { name: "O₃", value: reading.o3, unit: "µg/m³", max: 180, color: "#0891b2", icon: "🩵", safe: 60 },
  ];

  const border = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)";
  const textPrim = isLight ? "#0f172a" : "#f1f5f9";
  const textMuted = isLight ? "#64748b" : "#94a3b8";
  const panelBg = isLight ? "rgba(255,255,255,0.90)" : "rgba(20,22,30,0.90)";
  const cellBg = isLight ? "rgba(248,250,252,0.95)" : "rgba(30,34,45,0.95)";

  return (
    <div className="rounded-3xl p-6"
      style={{ background: panelBg, backdropFilter: "blur(20px)", border: `1px solid ${border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: "rgba(2,132,199,0.10)", border: "1px solid rgba(2,132,199,0.18)" }}>
          🧪
        </div>
        <div>
          <div className="text-[11px] font-black uppercase tracking-widest" style={{ color: textMuted }}>Pollutant Breakdown</div>
          <div className="text-[15px] font-bold" style={{ color: textPrim }}>Real-time concentrations</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(2,132,199,0.08)", color: "#0284c7", border: "1px solid rgba(2,132,199,0.15)" }}>
            Live · Updated now
          </span>
        </div>
      </div>

      {/* 3-column symmetric grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {pollutants.map((p) => {
          const pct = Math.min(100, (p.value / p.max) * 100);
          const isSafe = p.value <= p.safe;
          return (
            <div key={p.name}
              className="rounded-2xl p-4 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{ background: cellBg, border: `1px solid ${border}`, flex: "1 1 0" }}>
              {/* Top: icon + name + badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm leading-none">{p.icon}</span>
                  <span className="text-[11px] font-black tracking-tight" style={{ color: textPrim }}>{p.name}</span>
                </div>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase leading-tight"
                  style={{ background: isSafe ? "#16a34a14" : p.color + "14", color: isSafe ? "#16a34a" : p.color, border: `1px solid ${isSafe ? "#16a34a20" : p.color + "25"}` }}>
                  {isSafe ? "OK" : "High"}
                </span>
              </div>
              {/* Value */}
              <div className="flex items-baseline gap-1">
                <span className="text-[26px] font-black leading-none tracking-tight" style={{ color: p.color }}>{p.value.toFixed(1)}</span>
                <span className="text-[10px] font-medium" style={{ color: textMuted }}>{p.unit}</span>
              </div>
              {/* Progress bar */}
              <div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isLight ? "#e2e8f0" : "#2d3748" }}>
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${p.color}70, ${p.color})` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px]" style={{ color: textMuted }}>0</span>
                  <span className="text-[8px]" style={{ color: textMuted }}>{p.max}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MergedSmartSuggestions({
  reading,
  recommendations,
  isLight,
}: {
  reading: any;
  recommendations: any[];
  isLight: boolean;
}) {
  const relevant = reading
    ? recommendations.filter((r) => !r.station_id || r.station_id === reading.station_id).slice(0, 3)
    : recommendations.slice(0, 3);

  const border = isLight ? "#e2e8f0" : "#3f4354";
  const textPrim = isLight ? "#1a202c" : "#f8fafc";
  const textMuted = isLight ? "#718096" : "#94a3b8";

  const ACTION_META: Record<string, { icon: string; color: string }> = {
    traffic: { icon: "🚗", color: "#d97706" },
    industry: { icon: "🏭", color: "#64748b" },
    health: { icon: "❤️", color: "#e11d48" },
    school: { icon: "🏫", color: "#0284c7" },
    advisory: { icon: "📢", color: "#16a34a" },
  };

  const aqi = reading?.aqi ?? 0;
  const pm25 = reading?.pm25 ?? 0;

  const tip =
    aqi > 300 ? { icon: "🚫", text: "Impose odd-even traffic restrictions immediately. All sensitive groups must stay indoors." }
      : aqi > 250 ? { icon: "🚗", text: "Enforce traffic diversion on hotspot corridors. Suspend construction activities." }
        : aqi > 200 ? { icon: "🏗️", text: "Restrict dust-generating construction. Consider water sprinklers on roads." }
          : aqi > 150 ? { icon: "😷", text: "Wear N95 masks when outdoors. Limit prolonged physical activity." }
            : pm25 > 60 ? { icon: "💨", text: "High PM2.5 levels — use air purifiers indoors and limit outdoor exposure." }
              : { icon: "✅", text: "Air quality is acceptable. Good time for outdoor activities and exercise." };

  return (
    <div
      className="rounded-3xl p-6 flex flex-col gap-5 h-full"
      style={{
        background: isLight ? "#ffffff" : "#1b1d24",
        border: `1px solid ${border}`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: border }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg bg-sky-50 border border-sky-100">💡</div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: textPrim }}>Smart Suggestions</h3>
          <p className="text-[11px] font-medium" style={{ color: textMuted }}>Integrated AI Health & Policy Guidance</p>
        </div>
      </div>

      <div className="flex-1 space-y-5">
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: textMuted }}>Primary Advisory</div>
          <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: isLight ? "#f0f9ff" : "#0c1a2e", border: "1px solid #bae6fd" }}>
            <span className="text-2xl flex-shrink-0">{tip.icon}</span>
            <p className="text-[13px] font-bold leading-relaxed" style={{ color: isLight ? "#0369a1" : "#7dd3fc" }}>
              {tip.text}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: textMuted }}>
              Active Directives
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: isLight ? "#f1f5f9" : "#334155", color: textMuted }}>
              {relevant.length} tasks
            </span>
          </div>

          {relevant.length === 0 ? (
            <div className="text-center py-6 rounded-2xl border border-dashed" style={{ borderColor: border }}>
              <span className="text-2xl opacity-50 block mb-2">🍃</span>
              <p className="text-[12px] font-medium" style={{ color: textMuted }}>No active policy directives needed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relevant.map((r) => {
                const meta = ACTION_META[r.action_type] ?? ACTION_META.advisory;
                return (
                  <div key={r.id} className="p-3 rounded-xl transition-all hover:-translate-y-0.5" style={{ background: isLight ? "#f8fafc" : "#25272e", border: `1px solid ${border}` }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">{meta.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: meta.color }}>
                        {r.action_type}
                      </span>
                      <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-sm" style={{ background: meta.color + "18", color: meta.color }}>
                        PRIORITY {r.urgency.toFixed(0)}
                      </span>
                    </div>
                    <p className="text-[12px] font-semibold leading-snug" style={{ color: textPrim }}>{r.title}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AboutSection({ isLight }: { isLight: boolean }) {
  const bg = isLight ? "bg-gradient-to-br from-sky-50 to-indigo-50" : "bg-gradient-to-br from-slate-900 to-[#121418]";
  const border = isLight ? "border-sky-100" : "border-slate-800";
  const textPrim = isLight ? "text-slate-800" : "text-white";
  const textMuted = isLight ? "text-slate-500" : "text-slate-400";

  return (
    <div className={`rounded-3xl p-8 lg:p-12 border shadow-2xl ${bg} ${border}`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21.5c-4.418 0-8-3.582-8-8 0-4.418 8-11.5 8-11.5s8 7.082 8 11.5c0 4.418-3.582 8-8 8z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21.5V10" />
          </svg>
        </div>

        <h1 className={`text-4xl lg:text-5xl font-black tracking-tight mb-4 ${textPrim}`}>
          Air Quality <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Intelligence</span>
        </h1>

        <p className={`text-lg lg:text-xl font-medium leading-relaxed max-w-2xl mb-12 ${textMuted}`}>
          An advanced digital twin and analytics platform designed to monitor, simulate, and mitigate urban air pollution through real-time data and AI-driven forecasting.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {[
            {
              icon: "📡",
              title: "Real-Time Tracking",
              desc: "Aggregates sensory data from multiple stations to provide up-to-the-minute AQI insights.",
            },
            {
              icon: "📈",
              title: "AI Forecasting",
              desc: "Predicts future pollution trends using machine learning to inform proactive decision-making.",
            },
            {
              icon: "🏛️",
              title: "Decision Support",
              desc: "Simulates policy interventions like traffic diversions to quantify their environmental impact.",
            },
          ].map((feat, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-800/50 border-slate-700 shadow-xl"}`}>
              <div className="text-3xl mb-4">{feat.icon}</div>
              <h3 className={`text-[15px] font-black tracking-wide uppercase mb-2 ${textPrim}`}>{feat.title}</h3>
              <p className={`text-[13px] font-medium leading-relaxed ${textMuted}`}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import type { StationReading } from "../lib/types";
import type { Regime } from "../lib/types";
import { useLang } from "../contexts/LanguageContext";

interface Props {
  regime: Regime;
  connected: boolean;
  lastTickAt: string | null;
  stations: StationReading[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  mapTheme: "dark" | "light";
  onThemeToggle: () => void;
  isDSSMode: boolean;
  onDSSToggle: () => void;
  viewMode: string;
  onViewMode: (mode: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
  filteredStations: StationReading[];
}

export function Navbar({
  regime,
  connected,
  stations,
  onSelect,
  selectedId,
  mapTheme,
  onThemeToggle,
  isDSSMode,
  onDSSToggle,
  viewMode,
  onViewMode,
  query,
  onQueryChange,
  filteredStations,
}: Props) {
  const { t } = useLang();
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  const navBg = isLight
    ? "bg-white/80 border-b border-slate-200"
    : "bg-[#1b1d24]/80 border-b border-[#3f4354]";

  const textColor = isLight ? "text-slate-700" : "text-slate-200";
  const mutedColor = isLight ? "text-slate-400" : "text-slate-500";
  const logoText = isLight ? "text-slate-800" : "text-white";

  return (
    <header
      className={`sticky top-0 z-[100] backdrop-blur-xl transition-all duration-300 ${navBg} font-sans`}
    >
      <div className="flex items-center justify-between px-4 md:px-6 h-[72px] max-w-screen-2xl mx-auto gap-4">

        {/* ── Logo + Tabs (Left) ── */}
        <div className="flex items-center gap-8 flex-shrink-0">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); onViewMode("overview"); }}
            id="nav-logo"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 transition-transform group-hover:scale-105">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21.5c-4.418 0-8-3.582-8-8 0-4.418 8-11.5 8-11.5s8 7.082 8 11.5c0 4.418-3.582 8-8 8z" />
              </svg>
            </div>
            <div className="hidden xl:flex flex-col leading-none">
              <span className={`text-lg font-black tracking-tight ${logoText}`}>
                Air<span className="text-teal-500">Quality</span>
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {[
              { label: "Overview", id: "overview", icon: "⊞" },
              { label: t("navForecast"), id: "forecast", icon: "📈" },
              { label: t("navRankings"), id: "rankings", icon: "🏆" },
            ].map((item) => {
              const isActive = viewMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onViewMode(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="px-3 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 flex items-center gap-2 group"
                  style={{
                    background: isActive ? (isLight ? "#f1f5f9" : "#2d2f38") : "transparent",
                    color: isActive ? (isLight ? "#0f172a" : "white") : isLight ? "#475569" : "#94a3b8",
                  }}
                >
                  <span className="opacity-70">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Search Bar (Center) ── */}
        <div className="flex-1 max-w-2xl relative mx-4" ref={searchRef}>
          <div className={`flex items-center gap-4 px-6 py-2.5 rounded-2xl border transition-all duration-500 shadow-sm ${
            isLight 
              ? "bg-slate-100/50 border-transparent focus-within:bg-white focus-within:border-sky-400 focus-within:shadow-xl focus-within:shadow-sky-500/5" 
              : "bg-[#25272e] border-transparent focus-within:bg-[#2d2f38] focus-within:border-sky-500 focus-within:shadow-xl focus-within:shadow-sky-500/10"
          }`}>
            <svg className={`w-5 h-5 flex-shrink-0 ${isLight ? "text-slate-400" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className={`flex-1 bg-transparent text-[15px] font-bold outline-none placeholder:font-semibold ${isLight ? "text-slate-800 placeholder:text-slate-400" : "text-white placeholder:text-slate-500"}`}
              placeholder="Search station, city or urban zone..."
              value={query}
              onChange={(e) => { onQueryChange(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
            />
            {query && (
              <button onClick={() => { onQueryChange(""); setShowResults(false); }}>
                <svg className="w-4 h-4 opacity-40 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {showResults && filteredStations.length > 0 && (
            <div className={`absolute top-full mt-2 left-0 right-0 z-[120] rounded-2xl shadow-2xl border overflow-hidden animate-fadeIn ${isLight ? "bg-white border-slate-200" : "bg-[#1b1d24] border-[#3f4354]"}`}>
              {filteredStations.map((s) => (
                <button
                  key={s.station_id}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all ${
                    isLight ? "hover:bg-slate-50" : "hover:bg-white/5"
                  } ${selectedId === s.station_id ? (isLight ? "bg-sky-50" : "bg-sky-900/20") : ""}`}
                  onClick={() => { onSelect(s.station_id); onQueryChange(""); setShowResults(false); }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs" 
                      style={{ background: aqiColor(s.aqi) + '20', color: aqiColor(s.aqi) }}>
                      {s.aqi}
                    </div>
                    <div>
                      <div className={`text-[14px] font-bold ${isLight ? "text-slate-800" : "text-white"}`}>{s.station_name}</div>
                      <div className="text-[11px] font-semibold opacity-50 uppercase tracking-wider">{s.zone.replace("_", " ")}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Controls (Right) ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
              isLight ? "bg-white border-slate-200 text-slate-500 hover:border-sky-400 shadow-sm" : "bg-[#25272e] border-[#3f4354] text-slate-400 hover:border-sky-500 shadow-lg shadow-black/20"
            }`}
          >
            {mapTheme === "light" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeWidth={2} /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth={2} /></svg>
            )}
          </button>

          {/* DSS Toggle */}
          <button
            onClick={onDSSToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black transition-all border ${
              isDSSMode
                ? "bg-sky-500 border-sky-600 text-white shadow-lg shadow-sky-500/20"
                : isLight ? "bg-white border-slate-200 text-slate-600 hover:border-sky-400" : "bg-[#25272e] border-[#3f4354] text-slate-400 hover:border-sky-500"
            }`}
          >
            <span className="hidden xl:inline">{isDSSMode ? "DSS ACTIVE" : "DSS PRO"}</span>
            <span className="xl:hidden">🏛️</span>
          </button>
        </div>

      </div>
    </header>
  );
}

function aqiColor(aqi: number): string {
  if (aqi <= 50) return "#00b050";
  if (aqi <= 100) return "#92d050";
  if (aqi <= 200) return "#ffcc00";
  if (aqi <= 300) return "#ff7c00";
  if (aqi <= 400) return "#ff0000";
  return "#7030a0";
}

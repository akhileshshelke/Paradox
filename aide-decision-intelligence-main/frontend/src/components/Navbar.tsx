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
}

const AQI_STANDARDS = ["US AQI", "India NAQI", "WHO", "CN AQI"];

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
}: Props) {
  const { t } = useLang();
  const [aqiStd, setAqiStd] = useState("India NAQI");
  const [showAqiDd, setShowAqiDd] = useState(false);

  useEffect(() => {
    function outside(e: MouseEvent) {
      setShowAqiDd(false);
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

        {/* ── Logo (Left) ── */}
        <div
          className="flex items-center gap-3 flex-shrink-0 cursor-pointer group"
          onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); onViewMode("overview"); }}
          id="nav-logo"
        >
          <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 transition-transform group-hover:scale-105">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21.5c-4.418 0-8-3.582-8-8 0-4.418 8-11.5 8-11.5s8 7.082 8 11.5c0 4.418-3.582 8-8 8z" />
            </svg>
          </div>
          <div className="hidden md:flex flex-col leading-none">
            <span className={`text-lg font-black tracking-tight ${logoText}`}>
              Air<span className="text-teal-500">Quality</span>
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-widest ${mutedColor} mt-0.5`}>
              Intelligence
            </span>
          </div>
        </div>

        {/* ── Tabs (Center) ── */}
        <nav className="flex items-center gap-1">
          {[
            { label: "Overview", id: "overview", icon: "⊞" },
            { label: t("navForecast"), id: "forecast", icon: "📈" },
            { label: t("navRankings"), id: "rankings", icon: "🏆" },
            { label: t("navAbout"), id: "about", icon: "ℹ" },
          ].map((item) => {
            const isActive = viewMode === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => { onViewMode(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="relative px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 flex items-center gap-2 group"
                style={{
                  background: isActive
                    ? "#0284c7"
                    : "transparent",
                  color: isActive ? "white" : isLight ? "#475569" : "#94a3b8",
                  boxShadow: isActive ? "0 4px 12px rgba(2,132,199,0.3)" : "none",
                }}
              >
                <span className="text-[12px] opacity-70">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: isLight ? "rgba(2,132,199,0.06)" : "rgba(2,132,199,0.12)" }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Controls (Right) ── */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* AQI Std dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowAqiDd((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                isLight ? "bg-white border-slate-200 text-slate-600 hover:border-sky-400" : "bg-[#25272e] border-[#3f4354] text-slate-300 hover:border-sky-500"
              }`}
            >
              {aqiStd}
              <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAqiDd && (
              <div className={`absolute top-full mt-1 right-0 z-50 rounded-xl shadow-2xl border min-w-[130px] animate-fadeIn ${isLight ? "bg-white border-slate-200" : "bg-[#25272e] border-[#3f4354]"}`}>
                {AQI_STANDARDS.map((s) => (
                  <button key={s} className={`w-full px-4 py-2 text-[11px] font-bold text-left transition-colors ${textColor} ${s === aqiStd ? "bg-sky-500/10 text-sky-500" : isLight ? "hover:bg-slate-50" : "hover:bg-[#2d2f38]"}`}
                    onClick={() => { setAqiStd(s); setShowAqiDd(false); }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
              isLight ? "bg-white border-slate-200 text-slate-500 hover:border-sky-400" : "bg-[#25272e] border-[#3f4354] text-slate-400 hover:border-sky-500"
            }`}
          >
            {mapTheme === "light" ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeWidth={2} /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth={2} /></svg>
            )}
          </button>

          {/* DSS Toggle */}
          <button
            onClick={onDSSToggle}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[11px] font-black transition-all border ${
              isDSSMode
                ? "bg-sky-500 border-sky-600 text-white shadow-lg shadow-sky-500/20"
                : isLight ? "bg-white border-slate-200 text-slate-600 hover:border-sky-400" : "bg-[#25272e] border-[#3f4354] text-slate-400 hover:border-sky-500"
            }`}
          >
            <span className="text-sm">🏛️</span>
            <span className="hidden xl:inline">{isDSSMode ? "DSS ACTIVE" : "DSS PRO"}</span>
          </button>

          {/* Live Indicator */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold border ${connected ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/20" : "text-red-500 bg-red-500/5 border-red-500/20"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            {connected ? "LIVE" : "OFFLINE"}
          </div>

          {/* Login */}
          <button className="hidden sm:block px-5 py-2 rounded-xl text-[13px] font-bold bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20 transition-all active:scale-95">
            Login
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

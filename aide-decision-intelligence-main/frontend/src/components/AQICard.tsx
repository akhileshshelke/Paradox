import { useEffect, useState } from "react";
import type { StationReading } from "../lib/types";
import { bandFor } from "../lib/aqi";
import { useLang } from "../contexts/LanguageContext";

interface Props {
  reading: StationReading;
  onExpand?: () => void;
  isLight?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: (e: React.MouseEvent) => void;
}

export function AQICard({ reading, onExpand, isLight = true, isMinimized = false, onToggleMinimize }: Props) {
  const { t } = useLang();
  const b = bandFor(reading.aqi);
  const [bumped, setBumped] = useState(false);
  const [prevAqi, setPrevAqi] = useState(reading.aqi);

  useEffect(() => {
    if (reading.aqi !== prevAqi) {
      setBumped(true);
      setPrevAqi(reading.aqi);
      setTimeout(() => setBumped(false), 400);
    }
  }, [reading.aqi, prevAqi]);

  const panelBg = isLight ? "rgba(255,255,255,0.95)" : "rgba(24,26,34,0.96)";
  const textPrimary = isLight ? "#0f172a" : "#f8fafc";
  const textSecondary = isLight ? "#64748b" : "#94a3b8";
  const borderColor = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const cellBg = isLight ? "rgba(248,250,252,0.8)" : "rgba(255,255,255,0.03)";

  if (isMinimized) {
    return (
      <div
        id="aqi-card-minimized"
        onClick={onToggleMinimize}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer hover:scale-105 transition-all animate-fadeIn"
        style={{ background: panelBg, backdropFilter: "blur(20px)", border: `1px solid ${borderColor}`, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
      >
        <div className="w-1.5 h-8 rounded-full" style={{ background: b.color }} />
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: textSecondary }}>AQI</span>
          <span className="text-2xl font-black leading-none" style={{ color: b.color }}>{reading.aqi}</span>
        </div>
        <div className="ml-auto text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider" style={{ background: b.color + '15', color: b.color }}>{b.label}</div>
      </div>
    );
  }

  const pollutants = [
    { name: "PM2.5", val: reading.pm25, unit: "µg/m³", max: 120, safe: 25 },
    { name: "PM10", val: reading.pm10, unit: "µg/m³", max: 250, safe: 50 },
    { name: "NO₂", val: reading.no2, unit: "µg/m³", max: 180, safe: 40 },
    { name: "O₃", val: reading.o3, unit: "µg/m³", max: 180, safe: 60 },
    { name: "CO", val: reading.co, unit: "mg/m³", max: 10, safe: 2 },
  ];

  return (
    <div
      id="aqi-card-panel"
      className="rounded-[32px] overflow-hidden animate-slideInLeft relative group"
      style={{
        background: panelBg,
        backdropFilter: "blur(32px) saturate(200%)",
        border: `1px solid ${borderColor}`,
        boxShadow: "0 32px 80px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.05)",
      }}
    >
      {/* Visual Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: b.color }} />

      <div className="p-7 md:p-8">
        {/* Header: Location + Expand */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${b.color}, ${b.color}dd)`, color: 'white' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight mb-1" style={{ color: textPrimary }}>
                {reading.station_name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                  style={{ background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)", color: textSecondary }}>
                  {reading.zone.replace("_", " ")}
                </span>
                <span className="w-1 h-1 rounded-full" style={{ background: textSecondary, opacity: 0.3 }} />
                <span className="text-[12px] font-semibold" style={{ color: textSecondary }}>
                  Refreshed {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onExpand?.()}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg group/btn"
            style={{ background: isLight ? "#fff" : "#2a2d3a", border: `1px solid ${borderColor}` }}
          >
            <svg className="w-5 h-5 transition-transform group-hover/btn:rotate-12" style={{ color: b.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {/* Main AQI Section */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-12 mb-10">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[12px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: textSecondary }}>
              Current Index
            </span>
            <div className="relative">
              <span
                id="aqi-number"
                className={`font-black tracking-tighter leading-none block ${bumped ? "animate-numberBump" : ""}`}
                style={{
                  fontSize: "clamp(96px, 12vw, 130px)",
                  color: b.color,
                  filter: `drop-shadow(0 0 30px ${b.color}40)`,
                }}
              >
                {reading.aqi}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full md:w-auto">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="text-3xl font-black tracking-tight" style={{ color: b.color }}>{b.label}</div>
                <div className="h-6 w-[2px]" style={{ background: borderColor }} />
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold" style={{ color: textSecondary }}>Condition</span>
                  <span className="text-[14px] font-black uppercase" style={{ color: textPrimary }}>Live Status</span>
                </div>
              </div>
              <p className="text-[13px] font-medium leading-relaxed max-w-sm text-center md:text-left" style={{ color: textSecondary }}>
                Air quality is considered {b.label.toLowerCase()} for the majority of the population in this area.
              </p>
            </div>
          </div>
        </div>

        {/* Pollutant Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {pollutants.map((p) => {
            const isSafe = p.val <= p.safe;
            const statusLabel = p.val > p.max ? "Hazardous" : p.val > p.safe * 2 ? "High" : p.val > p.safe ? "Moderate" : "Low";
            const statusColor = p.val > p.max ? "#7030a0" : p.val > p.safe * 2 ? "#ef4444" : p.val > p.safe ? "#f59e0b" : "#10b981";

            return (
              <div
                key={p.name}
                className="p-4 rounded-[24px] border transition-all hover:shadow-md"
                style={{ background: cellBg, borderColor: borderColor }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: textSecondary }}>{p.name}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase"
                    style={{ background: statusColor + '15', color: statusColor, border: `1px solid ${statusColor}30` }}>
                    {statusLabel}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black" style={{ color: textPrimary }}>{p.val.toFixed(1)}</span>
                  <span className="text-[10px] font-bold" style={{ color: textSecondary }}>{p.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Source + Attribution */}
        <div className="flex items-center justify-between pt-6" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: textSecondary }}>
              Source: {reading.source === "synthetic" ? "Simulated Urban Node" : reading.source}
            </span>
          </div>
          <button
            onClick={() => onExpand?.()}
            className="group flex items-center gap-2 text-[12px] font-black uppercase tracking-wider transition-all"
            style={{ color: b.color }}
          >
            Detailed Analytics
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}


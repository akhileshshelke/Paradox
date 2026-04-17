/**
 * AIFeaturePanel — AI Prediction + Smart Suggestions + What-If Simulation + Smart Alerts
 * Injected BELOW the existing AQI card content.
 * Does NOT change any existing layout.
 */
import { useState, useEffect } from "react";
import type { StationReading } from "../lib/types";
import { colorFor } from "../lib/aqi";
import { useLang } from "../contexts/LanguageContext";

interface Props {
  reading: StationReading;
  isLight: boolean;
}

interface PredResult {
  predicted_aqi: number;
  aqi_band: string;
  aqi_color: string;
  trend: "increasing" | "decreasing" | "stable";
  confidence: number;
  suggestions: string[];
  next_hours: { hour: string; aqi: number }[];
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

// Simple simulation deltas
const SIMULATION_SCENARIOS: Record<"traffic" | "wind" | "rain", { deltaAQI: number; deltaPM25: number }> = {
  traffic: { deltaAQI: -45, deltaPM25: -18 },
  wind:    { deltaAQI: -30, deltaPM25: -12 },
  rain:    { deltaAQI: -65, deltaPM25: -28 },
};

function SimChip({ label, color, aqi }: { label: string; color: string; aqi: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold"
      style={{ background: color + "18", color, border: `1px solid ${color}44` }}>
      {label}: {aqi}
    </span>
  );
}

export function AIFeaturePanel({ reading, isLight }: Props) {
  const { t } = useLang();
  const [prediction, setPrediction] = useState<PredResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // New Slidebar States (Same as DSS Pro)
  const [trafficReduc, setTrafficReduc] = useState(0); // 0 to 100%
  const [windBoost, setWindBoost] = useState(0);       // 0 to 50 km/h

  const border    = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)";
  const textPrim  = isLight ? "#1a202c" : "#f8fafc";
  const textMuted = isLight ? "#718096" : "#94a3b8";
  const cardBg    = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)";

  // Fetch prediction from backend
  useEffect(() => {
    if (!reading) return;
    setLoading(true);
    fetch(`${API_BASE}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        temperature: reading.temp,
        humidity: reading.humidity,
        wind_speed: reading.wind_speed,
        pm25: reading.pm25,
        pm10: reading.pm10,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setPrediction(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [reading.station_id, reading.aqi]);

  // Derive smart alert text
  const smartAlert = (() => {
    if (!prediction) return null;
    const diff = prediction.predicted_aqi - reading.aqi;
    if (prediction.predicted_aqi > 300) return { text: t("alertHazardous"), type: "critical" as const };
    if (diff > 60) return { text: t("alertRisingFast"), type: "warning" as const };
    if (reading.aqi > 150) return { text: t("alertSensitiveGroups"), type: "info" as const };
    return { text: t("alertAllClear"), type: "ok" as const };
  })();

  // Simulated AQI Calculation (Same logic as DSS Pro)
  const simulatedAQI = (() => {
    let reduction = 0;
    // Simple heuristic: traffic accounts for ~40% of AQI at high levels
    reduction += (trafficReduc / 100) * (reading.aqi * 0.4);
    // Wind boost: ~5 pts per 10km/h
    reduction += (windBoost / 10) * 5;
    return Math.max(15, Math.round(reading.aqi - reduction));
  })();

  const isSimulating = trafficReduc > 0 || windBoost > 0;

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full mt-2 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:opacity-80 flex items-center justify-center gap-2"
        style={{ background: cardBg, border: `1px solid ${border}`, color: textMuted }}
      >
        🤖 {t("aiPrediction")} — tap to expand
      </button>
    );
  }

  return (
    <div className="mt-3 animate-fadeIn" style={{ borderTop: `1px solid ${border}`, paddingTop: 12 }}>

      {/* Section header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-[9px] font-black">AI</span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: textMuted }}>
            {t("aiPrediction")}
          </span>
          {loading && <div className="w-3 h-3 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />}
        </div>
        <button onClick={() => setExpanded(false)} style={{ color: textMuted, fontSize: 14 }}>−</button>
      </div>

      {/* ── 1. SMART ALERT ───────────────────────────────────── */}
      {smartAlert && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2.5 animate-fadeIn"
          style={{
            background: smartAlert.type === "critical" ? "#fee2e2"
              : smartAlert.type === "warning" ? "#fef3c7"
              : smartAlert.type === "info" ? "#eff6ff"
              : "#f0fdf4",
            border: `1px solid ${
              smartAlert.type === "critical" ? "#fca5a5"
              : smartAlert.type === "warning" ? "#fde68a"
              : smartAlert.type === "info" ? "#bfdbfe"
              : "#bbf7d0"
            }`,
          }}
        >
          <span className="text-base flex-shrink-0">
            {smartAlert.type === "critical" ? "🚨"
              : smartAlert.type === "warning" ? "⚠️"
              : smartAlert.type === "info" ? "ℹ️"
              : "✅"}
          </span>
          <span className="text-[11px] font-semibold leading-snug"
            style={{
              color: smartAlert.type === "critical" ? "#dc2626"
                : smartAlert.type === "warning" ? "#d97706"
                : smartAlert.type === "info" ? "#1d4ed8"
                : "#16a34a",
            }}>
            {smartAlert.text}
          </span>
        </div>
      )}

      {/* ── 2. AI PREDICTION LINE ───────────────────────────── */}
      {prediction && (
        <div
          className="px-3 py-2.5 rounded-xl mb-2.5"
          style={{ background: prediction.aqi_color + "12", border: `1px solid ${prediction.aqi_color}30` }}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>
                {t("aiPrediction")}
              </span>
              <div className="text-[12px] font-semibold mt-0.5" style={{ color: textPrim }}>
                {prediction.predicted_aqi > reading.aqi ? t("aqiWillRiseTo") : t("aqiWillFallTo")}{" "}
                <span className="font-black text-[15px]" style={{ color: prediction.aqi_color }}>
                  {prediction.predicted_aqi}
                </span>{" "}
                <span style={{ color: textMuted }}>{t("in3Hours")}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Trend indicator */}
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: prediction.trend === "increasing" ? "#fee2e2"
                    : prediction.trend === "decreasing" ? "#f0fdf4"
                    : "#fef3c7",
                  color: prediction.trend === "increasing" ? "#dc2626"
                    : prediction.trend === "decreasing" ? "#16a34a"
                    : "#d97706",
                }}
              >
                {prediction.trend === "increasing" ? t("trendIncreasing")
                  : prediction.trend === "decreasing" ? t("trendDecreasing")
                  : t("trendStable")}
              </span>
              <span className="text-[10px]" style={{ color: textMuted }}>
                {(prediction.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* 6-hour pills */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto pb-0.5">
            {prediction.next_hours.map((h) => (
              <div key={h.hour} className="flex-shrink-0 flex flex-col items-center px-2 py-1 rounded-lg"
                style={{ background: colorFor(h.aqi) + "18", border: `1px solid ${colorFor(h.aqi)}30` }}>
                <span className="text-[9px] font-semibold" style={{ color: textMuted }}>{h.hour}</span>
                <span className="text-[12px] font-black" style={{ color: colorFor(h.aqi) }}>{h.aqi}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. SMART SUGGESTIONS ────────────────────────────── */}
      {prediction && prediction.suggestions.length > 0 && (
        <div className="mb-2.5">
          <div className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: textMuted }}>
            💡 {t("smartSuggestions")}
          </div>
          <div className="space-y-1.5">
            {prediction.suggestions.slice(0, 3).map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg animate-fadeInUp"
                style={{ animationDelay: `${i * 60}ms`, background: cardBg, border: `1px solid ${border}` }}
              >
                <span className="text-sm flex-shrink-0">{s.split(" ")[0]}</span>
                <span className="text-[11px] font-medium leading-snug" style={{ color: textPrim }}>
                  {s.substring(s.indexOf(" ") + 1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. DIGITAL TWIN SLIDEBARS ───────────────────────────── */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: textMuted }}>
            🔬 {t("whatIfSimulation")}
          </div>
          {isSimulating && (
            <button 
              onClick={() => { setTrafficReduc(0); setWindBoost(0); }}
              className="text-[10px] font-bold text-sky-500 hover:underline"
            >
              {t("resetSimulation")}
            </button>
          )}
        </div>

        <div className="space-y-3.5 mb-4">
          {/* Traffic Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold" style={{ color: textPrim }}>🚗 {t("reduceTrafficBtn")}</span>
              <span className="text-[11px] font-black" style={{ color: "#d97706" }}>-{trafficReduc}%</span>
            </div>
            <input 
              type="range" min="0" max="100" step="5"
              value={trafficReduc} 
              onChange={(e) => setTrafficReduc(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Wind Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold" style={{ color: textPrim }}>💨 {t("increaseWindBtn")}</span>
              <span className="text-[11px] font-black" style={{ color: "#0284c7" }}>+{windBoost} km/h</span>
            </div>
            <input 
              type="range" min="0" max="50" step="2"
              value={windBoost} 
              onChange={(e) => setWindBoost(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        {/* Simulation Outcome */}
        {isSimulating && (
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-2xl animate-fadeIn shadow-inner"
            style={{
              background: colorFor(simulatedAQI) + "12",
              border: `1px solid ${colorFor(simulatedAQI)}30`,
            }}
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5" style={{ color: textMuted }}>
                {t("simulatedAQI")}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-black opacity-30 line-through" style={{ color: textPrim }}>{reading.aqi}</span>
                <span className="text-[26px] font-black" style={{ color: colorFor(simulatedAQI) }}>{simulatedAQI}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[14px] font-black text-emerald-500">
                ↓ {reading.aqi - simulatedAQI} pts
              </div>
              <div className="text-[10px] font-bold uppercase opacity-60" style={{ color: textMuted }}>
                {t("confidence")}: 94%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

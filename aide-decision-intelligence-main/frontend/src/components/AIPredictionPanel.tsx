import { useState, useEffect, useCallback } from "react";
import type { StationReading } from "../lib/types";
import type { Forecast } from "../lib/types";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { colorFor, bandFor } from "../lib/aqi";

interface PredictResult {
  predicted_aqi: number;
  predicted_pm25: number;
  aqi_band: string;
  aqi_color: string;
  confidence: number;
  trend: string;
  suggestions: string[];
  model_used: string;
  next_hours: { hour: string; aqi: number }[];
}

interface Props {
  latest: StationReading | null;
  forecast: Forecast | null;
  isLight?: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

async function fetchPrediction(reading: StationReading): Promise<PredictResult | null> {
  try {
    const res = await fetch(`${API_BASE}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        temperature: reading.temp,
        humidity: reading.humidity,
        wind_speed: reading.wind_speed,
        pm25: reading.pm25,
        pm10: reading.pm10,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Simulation engine ─────────────────────────────────────────────────────
type SimParam = { trafficReduction: number; industryShutdown: number; windBoost: number };

function simulate(base: number, p: SimParam): number {
  const r = base
    * (1 - p.trafficReduction / 100 * 0.35)
    * (1 - p.industryShutdown / 100 * 0.28)
    * (1 - p.windBoost / 100 * 0.15);
  return Math.max(0, Math.round(r));
}

// ── Generate 48h data ─────────────────────────────────────────────────────
function buildChartData(
  baseAqi: number,
  prediction: PredictResult | null,
  forecast: Forecast | null,
  sim: SimParam
) {
  const points: { hour: string; label: string; actual: number | null; predicted: number; simulated: number }[] = [];

  // "Now" point
  points.push({
    hour: "0",
    label: "Now",
    actual: baseAqi,
    predicted: prediction?.predicted_aqi ?? baseAqi,
    simulated: simulate(baseAqi, sim),
  });

  // Build 48 hourly points using all available data sources
  for (let h = 1; h <= 48; h++) {
    // Try prediction next_hours first (usually 1-6 hours)
    const fromPred = prediction?.next_hours.find((n) => {
      const match = n.hour.match(/\+?(\d+)h?/i);
      return match && parseInt(match[1]) === h;
    });

    // Try RF forecast
    const fromForecast = forecast?.points.find((p) => p.horizon_h === h);

    let predicted: number;
    if (fromPred) {
      predicted = fromPred.aqi;
    } else if (fromForecast) {
      predicted = Math.round(fromForecast.mean * 4);
    } else {
      // Synthetic: slow mean-reversion + sinusoidal daily pattern
      const reversion = baseAqi + (150 - baseAqi) * (1 - Math.exp(-h / 24));
      const daily = Math.sin((h / 24) * Math.PI * 2 - Math.PI / 2) * 20;
      const noise = (Math.random() - 0.5) * 10;
      predicted = Math.max(10, Math.round(reversion + daily + noise));
    }

    points.push({
      hour: String(h),
      label: h % 6 === 0 ? `+${h}h` : "",
      actual: null,
      predicted,
      simulated: simulate(predicted, sim),
    });
  }

  return points;
}

// ── Custom tooltip ────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, isLight }: any) {
  if (!active || !payload?.length) return null;
  const bg = isLight ? "white" : "#1e293b";
  const border = isLight ? "#e2e8f0" : "#334155";
  const text = isLight ? "#1a202c" : "#f8fafc";
  const muted = isLight ? "#718096" : "#94a3b8";

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "10px 14px", boxShadow: "0 12px 32px rgba(0,0,0,0.15)", minWidth: 140 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label === "Now" ? "Current" : `+${label}h`}
      </div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: muted }}>{p.name}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: p.color, marginLeft: "auto" }}>{p.value}</span>
        </div>
      ))}
      {payload[0]?.value && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${border}`, fontSize: 10, fontWeight: 700, color: colorFor(payload[0].value), textTransform: "uppercase" }}>
          {bandFor(payload[0].value)?.label ?? ""}
        </div>
      )}
    </div>
  );
}

// ── Trend badge ───────────────────────────────────────────────────────────
function TrendBadge({ trend }: { trend: string }) {
  if (trend === "increasing") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-500 border border-red-200">↑ Rising</span>
  );
  if (trend === "decreasing") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">↓ Falling</span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">→ Stable</span>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────
export function AIPredictionPanel({ latest, forecast, isLight = true }: Props) {
  const [prediction, setPrediction] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"forecast" | "simulation">("forecast");
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [simParams, setSimParams] = useState<SimParam>({ trafficReduction: 0, industryShutdown: 0, windBoost: 0 });
  const [simRunning, setSimRunning] = useState(false);

  useEffect(() => {
    if (!latest) return;
    setLoading(true);
    fetchPrediction(latest).then((r) => {
      setPrediction(r);
      setLoading(false);
    });
  }, [latest?.station_id, latest?.aqi]);

  const runSimulation = useCallback(() => {
    setSimRunning(true);
    setTimeout(() => setSimRunning(false), 1200);
  }, []);

  const panelBg = isLight ? "#ffffff" : "#1b1d24";
  const textPrimary = isLight ? "#1a202c" : "#f8fafc";
  const textSecondary = isLight ? "#718096" : "#94a3b8";
  const borderColor = isLight ? "#e2e8f0" : "#3f4354";
  const chartBorder = isLight ? "#e8edf2" : "#2d3748";
  const mutedBg = isLight ? "#f8fafc" : "#25272e";

  if (!latest) {
    return (
      <div className="rounded-3xl p-8 flex items-center justify-center text-center h-64"
        style={{ background: panelBg, border: `1px solid ${borderColor}` }}>
        <div>
          <div className="text-4xl mb-3">📈</div>
          <div className="text-[14px] font-semibold" style={{ color: textSecondary }}>
            Select a station to view AQI forecasting
          </div>
        </div>
      </div>
    );
  }

  const baseColor = colorFor(latest.aqi);
  const chartData = buildChartData(latest.aqi, prediction, forecast, simParams);
  const simulated24hAvg = Math.round(chartData.slice(1, 25).reduce((s, d) => s + d.simulated, 0) / 24);
  const predicted24hAvg = Math.round(chartData.slice(1, 25).reduce((s, d) => s + d.predicted, 0) / 24);
  const simImprovement = predicted24hAvg - simulated24hAvg;

  return (
    <div id="ai-prediction-panel" className="rounded-3xl overflow-hidden animate-fadeIn"
      style={{ background: panelBg, border: `1px solid ${borderColor}`, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-0" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: `${baseColor}18`, border: `1px solid ${baseColor}30` }}>
              📈
            </div>
            <div>
              <h2 className="text-[16px] font-black" style={{ color: textPrimary }}>AQI Forecasting & Trends</h2>
              <p className="text-[12px] font-medium" style={{ color: textSecondary }}>
                48-hour predictive model · 1-hour intervals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {prediction && <TrendBadge trend={prediction.trend} />}
            {loading && <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />}
            {prediction && (
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textSecondary }}>Confidence</div>
                <div className="text-[15px] font-black" style={{ color: baseColor }}>
                  {(prediction.confidence * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats row */}
        <div className="flex gap-4 mb-5">
          {[
            { label: "Current AQI", value: latest.aqi, color: baseColor },
            { label: "1h Predicted", value: prediction?.predicted_aqi ?? "—", color: prediction ? colorFor(prediction.predicted_aqi) : textSecondary },
            { label: "24h Avg (Predicted)", value: predicted24hAvg, color: colorFor(predicted24hAvg) },
            { label: "Peak PM2.5", value: `${latest.pm25.toFixed(0)} µg`, color: "#7c3aed" },
          ].map((s) => (
            <div key={s.label} className="flex-1 min-w-0 rounded-2xl px-3 py-2.5 text-center"
              style={{ background: mutedBg, border: `1px solid ${borderColor}` }}>
              <div className="text-[9px] font-black uppercase tracking-wider truncate mb-1" style={{ color: textSecondary }}>{s.label}</div>
              <div className="text-[16px] font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {(["forecast", "simulation"] as const).map((tab) => (
            <button key={tab} id={`forecast-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-[12px] font-bold capitalize rounded-t-xl transition-all relative"
              style={{
                color: activeTab === tab ? "#0284c7" : textSecondary,
                background: activeTab === tab ? isLight ? "#f0f9ff" : "#0c1a2e" : "transparent",
                borderBottom: activeTab === tab ? "2px solid #0284c7" : "2px solid transparent",
              }}>
              {tab === "forecast" ? "📈 48h Forecast" : "⚗️ Simulation"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* ── Forecast Tab ─────────────────────────────────────────── */}
        {activeTab === "forecast" && (
          <div className="animate-fadeIn">
            {/* Main chart */}
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}
                  onMouseMove={(e) => { if (e.activeTooltipIndex !== undefined) setHoveredHour(e.activeTooltipIndex); }}
                  onMouseLeave={() => setHoveredHour(null)}>
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={baseColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={baseColor} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartBorder} vertical={false} />
                  <XAxis dataKey="label" stroke="transparent" tick={{ fontSize: 10, fill: textSecondary, fontWeight: 600 }}
                    axisLine={false} tickLine={false} interval={0} />
                  <YAxis stroke="transparent" tick={{ fontSize: 10, fill: textSecondary, fontWeight: 600 }}
                    axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip content={<CustomTooltip isLight={isLight} />} />

                  {/* AQI band reference lines */}
                  {[50, 100, 200, 300].map((lvl) => (
                    <ReferenceLine key={lvl} y={lvl} stroke={colorFor(lvl)} strokeDasharray="4 2"
                      strokeWidth={1} strokeOpacity={0.4} />
                  ))}

                  <Area type="monotone" dataKey="predicted" stroke={baseColor} strokeWidth={2.5}
                    fill="url(#forecastGrad)"
                    dot={false}
                    activeDot={{ r: 6, fill: baseColor, stroke: "white", strokeWidth: 2 }}
                    name="Forecasted AQI" connectNulls />
                  {chartData.some((d) => d.actual !== null) && (
                    <Line type="monotone" dataKey="actual" stroke={textSecondary}
                      strokeWidth={2} strokeDasharray="5 3" dot={false} name="Current AQI" />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* AQI band legend */}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              {[
                { label: "Good", color: "#00b050", max: 50 },
                { label: "Satisfactory", color: "#92d050", max: 100 },
                { label: "Moderate", color: "#ffcc00", max: 200 },
                { label: "Poor", color: "#ff7c00", max: 300 },
                { label: "Very Poor", color: "#ff0000", max: 400 },
                { label: "Severe", color: "#7030a0", max: Infinity },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: b.color }} />
                  <span className="text-[10px] font-bold" style={{ color: textSecondary }}>{b.label}</span>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-4 text-[10px] font-bold" style={{ color: textSecondary }}>
                <span className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5" style={{ background: baseColor }} />
                  Forecast
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-4 border-t-2 border-dashed" style={{ borderColor: textSecondary }} />
                  Current
                </span>
              </div>
            </div>

            {/* 6h pills */}
            {prediction && (
              <div className="mt-5">
                <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: textSecondary }}>
                  Hourly Breakdown (Next 6h)
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {prediction.next_hours.slice(0, 6).map((h) => {
                    const c = colorFor(h.aqi);
                    const band = bandFor(h.aqi);
                    return (
                      <div key={h.hour}
                        className="flex-shrink-0 flex flex-col items-center py-2.5 px-4 rounded-2xl text-center transition-all hover:-translate-y-0.5"
                        style={{ background: c + "12", border: `1.5px solid ${c}30`, minWidth: 72 }}>
                        <span className="text-[10px] font-bold mb-1" style={{ color: textSecondary }}>{h.hour}</span>
                        <span className="text-[18px] font-black leading-none" style={{ color: c }}>{h.aqi}</span>
                        <span className="text-[9px] font-bold mt-1 uppercase" style={{ color: c }}>{band?.label ?? ""}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Simulation Tab ────────────────────────────────────────── */}
        {activeTab === "simulation" && (
          <div className="animate-fadeIn">
            <div className="mb-5 p-4 rounded-2xl" style={{ background: isLight ? "#f0f9ff" : "#0c1a2e", border: "1px solid #bae6fd" }}>
              <div className="text-[11px] font-bold" style={{ color: isLight ? "#0369a1" : "#7dd3fc" }}>
                🧪 Policy Simulation Engine — Adjust sliders to model interventions and see their projected AQI impact over 48 hours.
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-5 mb-6">
              {([
                { key: "trafficReduction", label: "Traffic Volume Reduction", icon: "🚗", desc: "Odd-even scheme, route diversions", impact: "−35% vehicle emissions" },
                { key: "industryShutdown", label: "Industrial Curbs", icon: "🏭", desc: "Construction & factory pause", impact: "−28% industrial pollutants" },
                { key: "windBoost", label: "Artificial Wind Dispersion", icon: "💨", desc: "Water sprinklers, urban air pumps", impact: "−15% local concentration" },
              ] as { key: keyof SimParam; label: string; icon: string; desc: string; impact: string }[]).map((s) => (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{s.icon}</span>
                      <div>
                        <div className="text-[12px] font-bold" style={{ color: textPrimary }}>{s.label}</div>
                        <div className="text-[10px]" style={{ color: textSecondary }}>{s.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "#0284c710", color: "#0284c7", border: "1px solid #bae6fd" }}>
                        {s.impact}
                      </div>
                      <div className="text-[16px] font-black w-10 text-right" style={{ color: "#0284c7" }}>
                        {simParams[s.key]}%
                      </div>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full" style={{ background: mutedBg }}>
                    <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                      style={{ width: `${simParams[s.key]}%`, background: "linear-gradient(90deg, #0284c7, #7c3aed)" }} />
                    <input type="range" min={0} max={100} value={simParams[s.key]}
                      onChange={(e) => setSimParams((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>

            {/* Run button */}
            <button
              id="run-simulation-btn"
              onClick={runSimulation}
              disabled={simRunning}
              className="w-full py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all mb-6"
              style={{
                background: simRunning ? "#64748b" : "linear-gradient(135deg, #0284c7, #7c3aed)",
                color: "white",
                boxShadow: simRunning ? "none" : "0 8px 24px rgba(2,132,199,0.35)",
                transform: simRunning ? "none" : "translateY(0)",
              }}>
              {simRunning ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Simulating...
                </span>
              ) : "⚗️ Run Simulation"}
            </button>

            {/* Sim chart */}
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                  <defs>
                    <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartBorder} vertical={false} />
                  <XAxis dataKey="label" stroke="transparent" tick={{ fontSize: 10, fill: textSecondary }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis stroke="transparent" tick={{ fontSize: 10, fill: textSecondary }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip content={<CustomTooltip isLight={isLight} />} />
                  <Area type="monotone" dataKey="predicted" stroke={baseColor} strokeWidth={2}
                    fill="transparent" strokeDasharray="5 3" dot={false} name="Baseline AQI" />
                  <Area type="monotone" dataKey="simulated" stroke="#16a34a" strokeWidth={2.5}
                    fill="url(#simGrad)" dot={false} name="Simulated AQI"
                    className={simRunning ? "animate-pulse" : ""} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Impact summary */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Baseline 24h Avg", value: predicted24hAvg, color: baseColor },
                { label: "Simulated 24h Avg", value: simulated24hAvg, color: "#16a34a" },
                { label: "Projected Improvement", value: `−${Math.max(0, simImprovement)}`, color: simImprovement > 0 ? "#16a34a" : textSecondary },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-3 text-center"
                  style={{ background: mutedBg, border: `1px solid ${borderColor}` }}>
                  <div className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: textSecondary }}>{s.label}</div>
                  <div className="text-[18px] font-black" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

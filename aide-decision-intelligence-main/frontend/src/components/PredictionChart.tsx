import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { colorFor } from "../lib/aqi";
import type { Forecast, StationReading } from "../lib/types";

interface Props {
  latest: StationReading | null;
  forecast: Forecast | null;
}

export function PredictionChart({ latest, forecast }: Props) {
  if (!latest) {
    return (
      <div className="h-full w-full bg-white/70 rounded-xl p-4 border border-sky-100 flex flex-col justify-center items-center text-center">
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Predictive Model</div>
        <div className="text-sm font-semibold text-sky-800">Select a structural node to run AI prediction matrix.</div>
      </div>
    );
  }

  const points = [
    { hour: "now", mean: latest.pm25, lower: latest.pm25, upper: latest.pm25 },
    ...(forecast?.points ?? []).map((p) => ({
      hour: `+${p.horizon_h}h`,
      mean: p.mean,
      lower: p.lower,
      upper: p.upper,
    })),
  ];

  const currentColor = colorFor(latest.aqi);

  return (
    <div className="h-full w-full bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-sm border border-sky-100 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Forecast PM2.5</div>
          <div className="text-base font-black text-slate-800 tracking-tight">{latest.station_name}</div>
        </div>
        <div className="flex items-center gap-2">
          {forecast && (
            <span className="chip border-sky-200 text-sky-700 bg-sky-50 shadow-sm">
              <span className="opacity-70 mr-1">Model</span>
              <span className="font-bold">{forecast.model}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 mt-2 text-xs font-sans font-semibold">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={currentColor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={currentColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #bae6fd",
                borderRadius: "8px",
                fontFamily: "Inter, sans-serif",
                fontWeight: "bold",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
              labelStyle={{ color: "#475569" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: "10px" }} iconType="circle" />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#band)"
              name="upper 95%"
              isAnimationActive={true}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#ffffff"
              name="lower 95%"
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="mean"
              stroke={currentColor}
              strokeWidth={3}
              dot={{ r: 5, fill: "#fff", stroke: currentColor, strokeWidth: 2 }}
              activeDot={{ r: 7, fill: currentColor }}
              name="mean"
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

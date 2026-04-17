import type { StationReading, Forecast } from "../lib/types";
import { PredictionChart } from "./PredictionChart";
import { PollutantBreakdown } from "./PollutantBreakdown";

interface Props {
  reading: StationReading;
  forecast: Forecast | null;
  onClose: () => void;
}

export function CityDrillDownModal({ reading, forecast, onClose }: Props) {
  if (!reading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 md:p-8 backdrop-blur-md text-[#f8fafc] font-sans">
      <div className="w-full max-w-7xl h-full flex flex-col border border-[#3f4354] rounded-2xl overflow-hidden bg-[#121418] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="p-5 border-b border-[#2a2d36] bg-[#1a1c22] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-black tracking-tight text-[#38bdf8] uppercase">
              {reading.station_name}
            </span>
            <span className="text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              ZONE: {reading.zone.toUpperCase()}
            </span>
            <span className="text-[#94a3b8] bg-[#1b1d24] border border-[#3f4354] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              ID: {reading.station_id}
            </span>
          </div>
          <button 
            className="text-[#94a3b8] hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-all font-bold group flex gap-2 items-center"
            onClick={onClose}
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            CLOSE
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-hidden min-h-0 bg-[#121418]">
          <div className="md:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-[#1b1d24] rounded-xl p-6 border border-[#2a2d36] shadow-sm flex flex-col h-[320px]">
              <div className="text-[#94a3b8] text-xs font-bold uppercase tracking-widest mb-4">Live Environment Metrics</div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-[#24262b] rounded-lg p-3 flex flex-col justify-center"><div className="text-[10px] uppercase font-bold text-[#64748b] mb-1">Temperature</div><div className="text-2xl font-black text-[#f8fafc]">{reading.temp}°C</div></div>
                <div className="bg-[#24262b] rounded-lg p-3 flex flex-col justify-center"><div className="text-[10px] uppercase font-bold text-[#64748b] mb-1">Humidity</div><div className="text-2xl font-black text-[#f8fafc]">{reading.humidity}%</div></div>
                <div className="bg-[#24262b] rounded-lg p-3 flex flex-col justify-center"><div className="text-[10px] uppercase font-bold text-[#64748b] mb-1">Wind Speed</div><div className="text-2xl font-black text-[#f8fafc]">{reading.wind_speed} <span className="text-sm font-semibold text-[#94a3b8]">m/s</span></div></div>
                <div className="bg-[#24262b] rounded-lg p-3 flex flex-col justify-center"><div className="text-[10px] uppercase font-bold text-[#64748b] mb-1">Wind Direction</div><div className="text-2xl font-black text-[#f8fafc]">{reading.wind_dir}°</div></div>
              </div>
            </div>
            <div className="flex-1 min-h-[300px]">
             <PollutantBreakdown reading={reading} />
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col h-full bg-[#1b1d24] rounded-xl border border-[#2a2d36] shadow-sm p-6 overflow-hidden">
            <div className="flex-1 min-h-[400px]">
              <PredictionChart latest={reading} forecast={forecast} />
            </div>
            <div className="mt-6 pt-4 border-t border-[#2a2d36] flex justify-between items-center text-xs font-semibold text-[#94a3b8]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2ecc71]"></span>
                Hybrid AI Ensemble Model Active
              </span>
              <span>Last Calibration: {(new Date()).toTimeString().split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

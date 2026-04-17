import type { StationReading } from "../lib/types";

interface Props {
  reading: StationReading;
}

export function PollutantBreakdown({ reading }: Props) {
  const pollutants = [
    { label: "PM2.5", value: reading.pm25, max: 250 },
    { label: "PM10", value: reading.pm10, max: 430 },
    { label: "NO2", value: reading.no2, max: 280 },
    { label: "SO2", value: reading.so2, max: 160 },
    { label: "O3", value: reading.o3, max: 168 },
    { label: "CO", value: reading.co, max: 34 },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-sm border border-sky-100 flex flex-col h-full font-sans">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-sky-100 pb-3 mb-4">
        Pollutant Matrix
      </div>
      <div className="grid grid-cols-2 gap-6">
        {pollutants.map(p => {
          const pct = Math.min(100, Math.max(0, (p.value / p.max) * 100));
          return (
            <div key={p.label} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">{p.label}</span>
                <span className="text-sm text-sky-900 font-black">{p.value.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-slate-100 w-full relative rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500 rounded-full" 
                  style={{ width: `${pct}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

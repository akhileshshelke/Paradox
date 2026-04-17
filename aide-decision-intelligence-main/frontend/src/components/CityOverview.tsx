import type { StationReading } from "../lib/types";

interface Props {
  reading: StationReading;
}

export function CityOverview({ reading }: Props) {
  if (!reading) return null;
  
  // Basic mock mappings
  const isSunny = reading.temp > 20;
  const weatherText = isSunny ? "Sunny" : "Cloudy";

  return (
    <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-white font-sans flex flex-col justify-between h-[180px] shadow-lg relative overflow-hidden">
      {/* Decorative arrow button top right */}
      <button className="absolute top-4 right-4 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
      </button>

      <div className="flex justify-between items-center z-10 w-full pl-2 pr-8 mt-2">
        <div className="flex items-center gap-3">
           <div className="text-4xl">
             {isSunny ? "🌤️" : "☁️"}
           </div>
           <div className="flex items-start gap-1">
             <span className="text-4xl font-black">{reading.temp.toFixed(0)}</span>
             <span className="text-xl font-bold mt-1">°C</span>
           </div>
        </div>
        <div className="text-lg font-bold">
           {weatherText}
        </div>
      </div>

      <div className="flex items-center justify-between z-10 w-full mt-auto pt-4 border-t border-white/10">
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center gap-1 text-[11px] text-white/50 uppercase font-bold mb-1">
            <span>💧</span> Humidity
          </div>
          <div className="text-sm font-bold">{reading.humidity.toFixed(0)} %</div>
        </div>
        <div className="w-px h-8 bg-white/10"></div>
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center gap-1 text-[11px] text-white/50 uppercase font-bold mb-1">
            <span>💨</span> Wind Speed
          </div>
          <div className="text-sm font-bold">{reading.wind_speed.toFixed(1)} km/h</div>
        </div>
        <div className="w-px h-8 bg-white/10"></div>
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center gap-1 text-[11px] text-white/50 uppercase font-bold mb-1">
            <span>☀️</span> UV Index
          </div>
          <div className="text-sm font-bold">{((reading.temp / 10) * 1.5).toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}

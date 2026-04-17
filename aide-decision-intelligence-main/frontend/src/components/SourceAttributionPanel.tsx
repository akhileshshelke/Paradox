import { useLang } from "../contexts/LanguageContext";
import { StationReading } from "../lib/types";

export function SourceAttributionPanel({ reading, isLight }: { reading: StationReading; isLight: boolean }) {
  const { t } = useLang();

  // Mock attribution logic:
  // - High CO + PM2.5 = Traffic
  // - High SO2 + NO2 = Industrial
  // - High PM10 = Construction/Dust
  const total = reading.pm25 + reading.pm10 + reading.no2 + reading.so2 + reading.co;
  
  const traffic    = Math.round(( (reading.co / 2.0) + (reading.pm25 / 100) ) / 2 * 100);
  const industrial = Math.round(( (reading.so2 / 40) + (reading.no2 / 80) ) / 2 * 100);
  const dust       = Math.max(0, 100 - traffic - industrial);

  const sources = [
    { label: t("trafficEmissions"), value: Math.min(60, traffic), color: "#3b82f6", icon: "🚗" },
    { label: t("industrialOutput"), value: Math.min(50, industrial), color: "#64748b", icon: "🏭" },
    { label: t("dustConstruction"), value: Math.max(10, dust), color: "#d97706", icon: "🏗️" },
  ];

  // Normalize to 100
  const sum = sources.reduce((a, b) => a + b.value, 0);
  sources.forEach(s => s.value = Math.round((s.value / sum) * 100));

  return (
    <div className="rounded-2xl p-4" style={{ 
      background: isLight ? "#ffffff" : "#1b1d24",
      border: isLight ? "1px solid #e2e8f0" : "1px solid #3f4354"
    }}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">
        🧭 {t("sourceAttribution")}
      </div>
      <div className="space-y-4">
        {sources.map(s => (
          <div key={s.label}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[12px] font-bold flex items-center gap-2" style={{ color: isLight ? "#1a202c" : "#f8fafc" }}>
                <span>{s.icon}</span> {s.label}
              </span>
              <span className="text-[12px] font-black" style={{ color: s.color }}>{s.value}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: isLight ? "#f1f5f9" : "#25272e" }}>
              <div 
                className="h-full rounded-full transition-all duration-1000" 
                style={{ width: `${s.value}%`, background: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
        <p className="text-[11px] font-medium leading-relaxed opacity-70">
          AI Analysis: Primary contributor is <span className="font-bold underline">{sources.sort((a,b)=>b.value-a.value)[0].label}</span>. 
          Implementing localized restrictions can reduce AQI by ~{Math.round(reading.aqi * 0.15)} points.
        </p>
      </div>
    </div>
  );
}

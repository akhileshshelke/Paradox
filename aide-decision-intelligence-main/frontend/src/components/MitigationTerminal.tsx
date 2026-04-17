import { useEffect, useState, useRef } from "react";
import type { Alert, Recommendation, StationReading } from "../lib/types";

export function MitigationTerminal({
  reading,
  alerts,
  recommendations,
}: {
  reading: StationReading | null;
  alerts: Alert[];
  recommendations: Recommendation[];
}) {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reading) return;
    
    const newLogs: string[] = [
      `> SYS_UPDATE: Station [${reading.station_name}] selected.`,
      `> METRICS: AQI ${reading.aqi} | PM2.5 ${reading.pm25} | NO2 ${reading.no2}`,
    ];

    if (reading.aqi > 300) {
      newLogs.push(`> [!] CRITICAL WARNING: SEVERE SMOG DETECTED.`);
      newLogs.push(`> INITIATING PROTOCOL: Reroute heavy traffic. Dispatch water sweepers.`);
    } else if (reading.aqi > 200) {
      newLogs.push(`> [!] ADVISORY: POOR AIR QUALITY.`);
      newLogs.push(`> INITIATING PROTOCOL: Issue public health warning.`);
    }

    const localAlerts = alerts.filter(a => a.station_id === reading.station_id);
    localAlerts.forEach(a => newLogs.push(`> [SYS_ALERT] ${a.severity.toUpperCase()}: ${a.message}`));

    setLogs((prev) => [...prev.slice(-20), ...newLogs]);
  }, [reading, alerts]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full w-full bg-slate-50/80 backdrop-blur-md p-4 flex flex-col font-mono text-xs rounded-xl shadow-inner border border-sky-100">
      <div className="text-sky-800 flex justify-between uppercase tracking-widest border-b border-sky-100 mb-2 pb-2 font-bold">
        <span>AI_MITIGATION_TERMINAL // LOG_OUTPUT</span>
        <span className="text-emerald-500">ACTIVE</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-2">
        {logs.map((log, i) => {
          const isWarning = log.includes("[!]");
          return (
            <div key={i} className={`${isWarning ? "text-rose-600 font-bold bg-rose-50/50 p-1 rounded" : "text-slate-600 border-l border-slate-300 pl-2"}`}>
              {log}
            </div>
          );
        })}
      </div>
    </div>
  );
}

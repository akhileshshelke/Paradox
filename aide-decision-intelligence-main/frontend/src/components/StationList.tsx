import clsx from "clsx";
import { colorFor } from "../lib/aqi";
import type { StationReading } from "../lib/types";

interface Props {
  stations: StationReading[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function StationList({ stations, selectedId, onSelect }: Props) {
  const sorted = [...stations].sort((a, b) => b.aqi - a.aqi);
  return (
    <div className="h-full flex flex-col font-sans">
      <ul className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {sorted.map((s) => {
          const active = selectedId === s.station_id;
          return (
            <li key={s.station_id}>
              <button
                onClick={() => onSelect(s.station_id)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all border",
                  active
                    ? "bg-sky-50 border-sky-300 text-sky-900 font-bold shadow-sm"
                    : "bg-white border-slate-100 hover:border-sky-200 hover:bg-slate-50 text-slate-600 font-semibold",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: colorFor(s.aqi) }}
                  />
                  <span className="truncate max-w-[150px] text-left">{s.station_name}</span>
                </span>
                <span className="font-bold whitespace-nowrap bg-white/50 px-2 rounded-full border border-slate-100" style={{ color: colorFor(s.aqi) }}>
                  AQI {s.aqi}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

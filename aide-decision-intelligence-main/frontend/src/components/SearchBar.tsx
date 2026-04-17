import { useState, useMemo } from "react";
import type { StationReading } from "../lib/types";

interface Props {
  stations: StationReading[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export function SearchBar({ stations, onSelect, selectedId }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (!query) return [];
    const lower = query.toLowerCase();
    return stations
      .filter((s) => s.station_name.toLowerCase().includes(lower) || s.zone?.toLowerCase().includes(lower))
      .slice(0, 5);
  }, [stations, query]);

  return (
    <div className="relative w-64">
      <div className="flex items-center bg-black border border-cmd-border px-3 py-1.5 focus-within:border-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cmd-muted mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="square" strokeMiterlimit="10" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          className="bg-transparent border-none text-sm text-cmd-text w-full focus:outline-none placeholder-cmd-muted"
          placeholder="LOCATE SECTOR [CTRL+K]..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
      </div>
      
      {focused && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-cmd-border z-50">
          {results.map((r) => (
            <div
              key={r.station_id}
              className="px-3 py-2 cursor-pointer hover:bg-cmd-panel border-b border-cmd-border/50 last:border-b-0 flex justify-between"
              onClick={() => {
                onSelect(r.station_id);
                setQuery("");
              }}
            >
              <span className="text-sm font-mono truncate">{r.station_name}</span>
              <span className="text-xs text-cmd-muted ml-2">{r.aqi} AQI</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

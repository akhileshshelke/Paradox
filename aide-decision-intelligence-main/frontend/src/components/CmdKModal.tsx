import { useEffect, useState, useRef } from "react";
import type { StationReading } from "../lib/types";
import { colorFor } from "../lib/aqi";

interface Props {
  stations: StationReading[];
  onSelect: (id: string) => void;
}

export function CmdKModal({ stations, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = stations
    .filter(
      (s) =>
        s.station_name.toLowerCase().includes(search.toLowerCase()) ||
        s.station_id.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 10);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-start justify-center pt-32 backdrop-blur-sm font-sans px-4">
      <div className="bg-[#1b1d24] border border-[#2a2d36] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden text-[#f8fafc]">
        <div className="p-4 border-b border-[#2a2d36] flex items-center gap-3 bg-[#17181e]">
          <svg className="w-5 h-5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-[#f8fafc] placeholder-[#64748b] font-semibold text-lg"
            placeholder="Search Global Node Directory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered.length > 0) {
                onSelect(filtered[0].station_id);
                setIsOpen(false);
              }
            }}
          />
          <kbd className="bg-[#24262b] text-[10px] font-bold px-2 py-1 rounded-md text-[#94a3b8] border border-[#3f4354]">ESC</kbd>
        </div>

        {filtered.length > 0 ? (
          <div className="flex flex-col py-2 max-h-[400px] overflow-y-auto custom-scrollbar bg-[#121418]">
            {filtered.map((station) => (
              <button
                key={station.station_id}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-[#1b1d24] transition-colors border-l-4 border-transparent hover:border-[#38bdf8] focus:bg-[#1b1d24] focus:outline-none"
                onClick={() => {
                  onSelect(station.station_id);
                  setIsOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="text-[#f8fafc] font-bold text-base">{station.station_name}</span>
                  <span className="text-[#64748b] text-xs font-semibold mt-1">ID: {station.station_id} | ZONE: {station.zone}</span>
                </div>
                <div className="flex items-center gap-3 bg-[#17181b] px-3 py-1.5 rounded-lg border border-[#2a2d36] shadow-sm">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">SYS_AQI</span>
                  <span style={{ color: colorFor(station.aqi) }} className="font-black text-xl w-10 text-right">
                    {station.aqi}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-[#64748b] font-bold bg-[#121418]">No nodes matching query. Try another search.</div>
        )}
      </div>
    </div>
  );
}

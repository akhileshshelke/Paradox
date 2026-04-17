import type { StationReading } from "../lib/types";
import { LeafletTwin } from "./LeafletTwin";

interface Props {
  stations: Record<string, StationReading>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  mapTheme: "dark" | "light";
}

export function UnifiedMap({ stations, selectedId, onSelect, mapTheme }: Props) {
  const list = Object.values(stations) as StationReading[];
  return (
    <LeafletTwin
      stations={list}
      selectedId={selectedId}
      onSelect={onSelect}
      mapTheme={mapTheme}
    />
  );
}

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { StationReading } from "../lib/types";
import { colorFor, bandFor } from "../lib/aqi";
import { useLang } from "../contexts/LanguageContext";
import { t } from "../lib/i18n";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

// ── India dataset station type ────────────────────────────────────────────
interface IndiaStation {
  station: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  aqi: number;
  band: string;
  color: string;
  pm25: number | null;
  pm10: number | null;
  no2: number;
  so2: number;
  co: number;
  o3: number;
}

// ── Auto-pan to selected station ──────────────────────────────────────────
function MapFocuser({ selected }: { selected: StationReading | null }) {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 9), {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selected?.station_id, map]);
  return null;
}

// ── Track zoom level ──────────────────────────────────────────────────────
function ZoomListener({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMapEvents({
    zoom() {
      onZoom(map.getZoom());
    }
  });
  useEffect(() => {
    onZoom(map.getZoom());
  }, [map, onZoom]);
  return null;
}

// ── India Dataset Markers (small dots) ────────────────────────────────────
function IndiaDatasetMarkers({
  stations,
  onSelect,
  isLight,
}: {
  stations: IndiaStation[];
  onSelect: (s: IndiaStation) => void;
  isLight: boolean;
}) {
  const { t } = useLang();
  return (
    <>
      {stations.map((s, i) => {
        const icon = L.divIcon({
          html: `
            <div title="${s.city} - AQI ${s.aqi}" style="
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: ${s.color};
              border: 2px solid rgba(255,255,255,0.85);
              box-shadow: 0 2px 6px ${s.color}66;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              font-weight: 900;
              color: rgba(255,255,255,0.9);
              font-family: 'Inter', sans-serif;
              cursor: pointer;
              transition: transform 0.2s;
            "></div>
          `,
          className: "",
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        return (
          <Marker
            key={`india-${i}`}
            position={[s.lat, s.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(s) }}
          >
            <Tooltip direction="top" offset={[0, -12]} opacity={1} permanent={false}>
              <div style={{
                background: isLight ? "white" : "#1b1d24",
                border: `1.5px solid ${s.color}`,
                borderRadius: 12,
                padding: "8px 12px",
                minWidth: 140,
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                fontFamily: "'Inter', sans-serif",
                animation: "fadeInScale 0.18s ease",
              }}>
                <div style={{ borderBottom: `2px solid ${s.color}`, paddingBottom: 4, marginBottom: 6 }}>
                  <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.state}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isLight ? "#1a202c" : "#f8fafc", marginTop: 1 }}>{s.city}</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.aqi}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: s.color, background: s.color + "18", padding: "1px 5px", borderRadius: 5, display: "inline-block", marginTop: 2 }}>{s.band}</div>
                  </div>
                  {s.pm25 !== null && (
                    <div>
                      <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: 600 }}>{t("pm25_label")}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isLight ? "#1a202c" : "#f8fafc" }}>{s.pm25} µg/m³</div>
                    </div>
                  )}
                </div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}

// ── Live Station Markers (larger, from WebSocket) ─────────────────────────
function LiveAQIMarkers({
  readings,
  selectedId,
  onSelect,
  isLight,
  zoomLevel,
}: {
  readings: StationReading[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLight: boolean;
  zoomLevel: number;
}) {
  const { t } = useLang();
  return (
    <>
      {readings.map((r) => {
        const band = bandFor(r.aqi);
        const color = band.color;
        const isSelected = selectedId === r.station_id;
        const baseSize = zoomLevel < 6 ? 24 : zoomLevel < 8 ? 32 : 40;
        const size = isSelected ? baseSize * 1.3 : baseSize;
        const fontSize = zoomLevel < 6 ? 8 : zoomLevel < 8 ? 10 : (isSelected ? 14 : 12);

        const iconHtml = `
          <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
            ${isSelected ? `
              <div style="position:absolute;inset:-6px;border-radius:50%;animation:pulse 1.5s ease-out infinite;border:2px solid ${color}55;background:${color}18;"></div>
              <div style="position:absolute;inset:-12px;border-radius:50%;animation:pulse 1.5s ease-out 0.5s infinite;border:1px solid ${color}33;"></div>
            ` : ""}
            <div style="
              width:${size}px;height:${size}px;border-radius:50%;
              background:${color};
              display:flex;align-items:center;justify-content:center;
              font-weight:900;color:white;font-size:${fontSize}px;
              font-family:'Inter',sans-serif;
              box-shadow:0 4px 16px ${color}66,0 0 0 ${isSelected ? 3 : 2}px rgba(255,255,255,0.9);
              border:${isSelected ? 3 : 2}px solid rgba(255,255,255,0.95);
              cursor:pointer;
              z-index:2;
            ">${r.aqi}</div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        return (
          <Marker
            key={r.station_id}
            position={[r.lat, r.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(r.station_id) }}
            zIndexOffset={isSelected ? 1000 : 100}
          >
            <Tooltip direction="top" offset={[0, -size / 2 - 4]} opacity={1} permanent={false}>
              <div style={{
                background: isLight ? "white" : "#1b1d24",
                border: `1.5px solid ${color}`,
                borderRadius: 16,
                padding: "10px 14px",
                minWidth: 170,
                boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
                fontFamily: "'Inter', sans-serif",
              }}>
                <div style={{ height: 3, background: color, borderRadius: "2px 2px 0 0", marginTop: -10, marginLeft: -14, marginRight: -14, marginBottom: 8 }} />
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
                  🔴 {t("live")} · {r.zone.replace("_", " ")}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isLight ? "#1a202c" : "#f8fafc", marginBottom: 8 }}>{r.station_name}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>{t("aqi")}</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{r.aqi}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color, background: color + "18", padding: "2px 6px", borderRadius: 6, display: "inline-block", marginTop: 4 }}>{band.label}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div>
                      <div style={{ fontSize: 9, color: "#94a3b8" }}>{t("pm25_label")}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isLight ? "#1a202c" : "#f8fafc" }}>{r.pm25.toFixed(1)} µg/m³</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "#94a3b8" }}>{t("temperature")}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isLight ? "#1a202c" : "#f8fafc" }}>{r.temp.toFixed(0)}°C · {r.humidity.toFixed(0)}% RH</div>
                    </div>
                  </div>
                </div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}

// ── Legend overlay ────────────────────────────────────────────────────────
function MapLegend({ isLight, datasetCount, liveCount }: { isLight: boolean; datasetCount: number; liveCount: number }) {
  const { t } = useLang();
  return (
    <div
      className="absolute bottom-3 left-3 z-[1000] rounded-xl overflow-hidden"
      style={{
        background: isLight ? "rgba(255,255,255,0.92)" : "rgba(27,29,36,0.92)",
        backdropFilter: "blur(12px)",
        border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        padding: "8px 12px",
        minWidth: 160,
      }}
    >
      <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: isLight ? "#718096" : "#94a3b8" }}>
        {t("indiaAqiMap")}
      </div>
      {[
        { color: "#00b050", label: `${t("good")} (0–50)`,         dot: 8 },
        { color: "#92d050", label: `${t("satisfactory")} (51–100)`, dot: 8 },
        { color: "#ffcc00", label: `${t("moderate")} (101–200)`,  dot: 8 },
        { color: "#ff7c00", label: `${t("poor")} (201–300)`,      dot: 8 },
        { color: "#ff0000", label: `${t("veryPoor")} (301–400)`, dot: 8 },
        { color: "#7030a0", label: `${t("severe")} (401+)`,       dot: 8 },
      ].map((b) => (
        <div key={b.label} className="flex items-center gap-1.5 mb-1">
          <div className="rounded-full flex-shrink-0" style={{ width: b.dot, height: b.dot, background: b.color }} />
          <span className="text-[10px] font-medium" style={{ color: isLight ? "#4a5568" : "#94a3b8" }}>{b.label}</span>
        </div>
      ))}
      <div className="mt-2 pt-2 flex flex-col gap-0.5" style={{ borderTop: isLight ? "1px solid #e2e8f0" : "1px solid #3f4354" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-sky-500 border-2 border-white flex-shrink-0" />
          <span className="text-[10px]" style={{ color: isLight ? "#4a5568" : "#94a3b8" }}>{t("liveNodes")} ({liveCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-400 border border-white flex-shrink-0" />
          <span className="text-[10px]" style={{ color: isLight ? "#4a5568" : "#94a3b8" }}>{t("dataset")} ({datasetCount})</span>
        </div>
      </div>
    </div>
  );
}

// ── Selected dataset station info panel ───────────────────────────────────
function DatasetStationBanner({
  station,
  onClose,
  isLight,
}: {
  station: IndiaStation | null;
  onClose: () => void;
  isLight: boolean;
}) {
  if (!station) return null;
  return (
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] rounded-xl overflow-hidden animate-fadeIn"
      style={{
        background: isLight ? "rgba(255,255,255,0.95)" : "rgba(27,29,36,0.95)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${station.color}66`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        pointerEvents: "auto",
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 900, color: station.color }}>{station.aqi}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: isLight ? "#1a202c" : "#f8fafc" }}>{station.city}, {station.state}</div>
        <div style={{ fontSize: 10, color: "#94a3b8" }}>{station.band} · {station.station.substring(0, 40)}</div>
      </div>
      <button onClick={onClose} style={{ marginLeft: 8, color: "#94a3b8", fontSize: 18, lineHeight: 1 }}>✕</button>
    </div>
  );
}

// ── Tile configs ──────────────────────────────────────────────────────────
const TILE_URLS = {
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark:  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

// ── India Bounds ──────────────────────────────────────────────────────────
const INDIA_BOUNDS: L.LatLngBoundsExpression = [
  [6.5, 68.0], // Southwest
  [36.5, 97.5] // Northeast
];

// ── Main LeafletTwin ──────────────────────────────────────────────────────
export function LeafletTwin({
  stations,
  selectedId,
  onSelect,
  mapTheme = "light",
}: {
  stations: StationReading[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  mapTheme?: "dark" | "light";
}) {
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [indiaStations, setIndiaStations] = useState<IndiaStation[]>([]);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<IndiaStation | null>(null);

  const selected = selectedId ? stations.find((s) => s.station_id === selectedId) ?? null : null;
  const isLight = mapTheme === "light";
  const [zoomLevel, setZoomLevel] = useState(5);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Load India dataset from backend ─────────────────────────────────────
  useEffect(() => {
    setLoadingDataset(true);
    fetch(`${API_BASE}/api/india-aqi`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setIndiaStations(data))
      .catch(() => setIndiaStations([]))
      .finally(() => setLoadingDataset(false));
  }, []);

  const handleDatasetSelect = useCallback((s: IndiaStation) => {
    setSelectedDataset(s);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center"
        style={{ background: isLight ? "#f0f4f8" : "#121212" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        key={mapTheme}
        center={[21.5, 82.5]}
        zoom={5}
        minZoom={5}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url={TILE_URLS[mapTheme]}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        <ZoomListener onZoom={setZoomLevel} />

        {/* Heatmap Layer - show when zoomed out */}
        {zoomLevel < 8 && (
          <HeatmapLayer
            points={indiaStations.map(s => [s.lat, s.lng, s.aqi])}
            longitudeExtractor={(m: any) => m[1]}
            latitudeExtractor={(m: any) => m[0]}
            intensityExtractor={(m: any) => m[2]}
            radius={25}
            blur={15}
            max={400}
            gradient={{
              0.1: "#00b050",
              0.2: "#92d050",
              0.4: "#ffcc00",
              0.6: "#ff7c00",
              0.8: "#ff0000",
              1.0: "#7030a0"
            }}
          />
        )}

        {/* India dataset stations (409 from CSV) - show when zoomed in */}
        {zoomLevel >= 8 && (
          <IndiaDatasetMarkers
            stations={indiaStations}
            onSelect={handleDatasetSelect}
            isLight={isLight}
          />
        )}

        {/* Live WebSocket stations (larger, with number) */}
        {zoomLevel >= 8 && (
          <LiveAQIMarkers
            readings={stations}
            selectedId={selectedId}
            onSelect={onSelect}
            isLight={isLight}
            zoomLevel={zoomLevel}
          />
        )}

        <MapFocuser selected={selected} />
      </MapContainer>

      {/* Loading dataset indicator */}
      {loadingDataset && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
          style={{ background: "rgba(255,255,255,0.9)", color: "#0284c7", border: "1px solid #bae6fd", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          {t("loadingDataset")}
        </div>
      )}

      {/* Dataset station selected banner */}
      {selectedDataset && !loadingDataset && (
        <DatasetStationBanner
          station={selectedDataset}
          onClose={() => setSelectedDataset(null)}
          isLight={isLight}
        />
      )}

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 z-[1000] text-[10px] px-2 py-0.5 rounded-md"
        style={{
          background: isLight ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.6)",
          color: isLight ? "#94a3b8" : "#64748b",
        }}>
        © CARTO · CPCB Data · Air Quality Index
      </div>

      {/* Leaflet CSS overrides */}
      <style>{`
        .leaflet-container {
          background: ${isLight ? "#e8ecf0" : "#121212"} !important;
          font-family: 'Inter', sans-serif !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
          border-radius: 14px !important;
          overflow: hidden;
          margin: 16px !important;
        }
        .leaflet-control-zoom a {
          background: ${isLight ? "white" : "#25272e"} !important;
          color: ${isLight ? "#374151" : "#e2e8f0"} !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          font-weight: 600 !important;
        }
        .leaflet-control-zoom a:hover {
          background: ${isLight ? "#f0f9ff" : "#2d2f38"} !important;
          color: #0284c7 !important;
        }
        .aqi-popup .leaflet-popup-content-wrapper {
          background: transparent !important; border: none !important;
          box-shadow: none !important; padding: 0 !important;
        }
        .aqi-popup .leaflet-popup-tip-container { display: none !important; }
        .aqi-popup .leaflet-popup-content { margin: 0 !important; }
        @keyframes pulse {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

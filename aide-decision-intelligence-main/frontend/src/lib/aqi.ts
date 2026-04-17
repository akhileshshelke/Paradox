// Mirror of backend/app/services/aqi_bands.py — keep in sync.

export type AQIBand =
  | "good"
  | "satisfactory"
  | "moderate"
  | "poor"
  | "very_poor"
  | "severe";

export const AQI_BANDS: { lo: number; hi: number; name: AQIBand; color: string; label: string }[] = [
  { lo: 0,   hi: 50,    name: "good",         color: "#00b050", label: "Good" },
  { lo: 51,  hi: 100,   name: "satisfactory", color: "#92d050", label: "Satisfactory" },
  { lo: 101, hi: 200,   name: "moderate",     color: "#ffcc00", label: "Moderate" },
  { lo: 201, hi: 300,   name: "poor",         color: "#ff7c00", label: "Poor" },
  { lo: 301, hi: 400,   name: "very_poor",    color: "#ff0000", label: "Very Poor" },
  { lo: 401, hi: 10000, name: "severe",       color: "#7030a0", label: "Severe" },
];

export function bandFor(aqi: number) {
  return AQI_BANDS.find((b) => aqi >= b.lo && aqi <= b.hi) ?? AQI_BANDS[AQI_BANDS.length - 1];
}

export function colorFor(aqi: number) {
  return bandFor(aqi).color;
}

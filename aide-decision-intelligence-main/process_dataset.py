"""
Converts the raw AQI.csv into a per-station aggregated JSON file
that is served by the /api/india-aqi endpoint.

Run once:  python process_dataset.py
Output:    backend/app/data/india_aqi_stations.json
"""
import csv
import json
import math
from collections import defaultdict
from pathlib import Path

CSV_PATH = Path("data/AQI.csv")
OUT_PATH = Path("backend/app/data/india_aqi_stations.json")
OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

def pm25_to_aqi(pm25: float) -> int:
    """India NAQI piecewise linear PM2.5 → AQI."""
    bp = [
        (0,   30,  0,  50),
        (30,  60,  51, 100),
        (60,  90,  101,200),
        (90,  120, 201,300),
        (120, 250, 301,400),
        (250, 380, 401,500),
    ]
    for c_lo, c_hi, i_lo, i_hi in bp:
        if c_lo <= pm25 <= c_hi:
            return int(((i_hi - i_lo) / (c_hi - c_lo)) * (pm25 - c_lo) + i_lo)
    return 500 if pm25 > 380 else 0

def pm10_to_aqi(pm10: float) -> int:
    bp = [
        (0,   50,  0,   50),
        (50,  100, 51,  100),
        (100, 250, 101, 200),
        (250, 350, 201, 300),
        (350, 430, 301, 400),
        (430, 600, 401, 500),
    ]
    for c_lo, c_hi, i_lo, i_hi in bp:
        if c_lo <= pm10 <= c_hi:
            return int(((i_hi - i_lo) / (c_hi - c_lo)) * (pm10 - c_lo) + i_lo)
    return 500 if pm10 > 600 else 0

def aqi_band(aqi: int) -> str:
    if aqi <= 50:   return "Good"
    if aqi <= 100:  return "Satisfactory"
    if aqi <= 200:  return "Moderate"
    if aqi <= 300:  return "Poor"
    if aqi <= 400:  return "Very Poor"
    return "Severe"

def aqi_color(aqi: int) -> str:
    if aqi <= 50:   return "#00b050"
    if aqi <= 100:  return "#92d050"
    if aqi <= 200:  return "#ffcc00"
    if aqi <= 300:  return "#ff7c00"
    if aqi <= 400:  return "#ff0000"
    return "#7030a0"

# ── aggregate per station ─────────────────────────────────────────────────
stations = defaultdict(lambda: {
    "pm25": [], "pm10": [], "no2": [], "so2": [], "co": [], "o3": [],
})
meta = {}

with open(CSV_PATH, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        key = row["station"].strip()
        if not row["latitude"] or not row["longitude"]:
            continue
        try:
            lat = float(row["latitude"])
            lng = float(row["longitude"])
            val = float(row["pollutant_avg"])
        except ValueError:
            continue

        # Only keep rows inside rough India bounding box
        if not (6 < lat < 38 and 67 < lng < 98):
            continue

        if key not in meta:
            meta[key] = {
                "city":  row["city"].replace("_", " ").title(),
                "state": row["state"].replace("_", " ").title(),
                "lat":   lat,
                "lng":   lng,
            }

        pid = row["pollutant_id"].strip()
        if pid == "PM2.5":
            stations[key]["pm25"].append(val)
        elif pid == "PM10":
            stations[key]["pm10"].append(val)
        elif pid == "NO2":
            stations[key]["no2"].append(val)
        elif pid == "SO2":
            stations[key]["so2"].append(val)
        elif pid == "CO":
            stations[key]["co"].append(val)
        elif pid == "OZONE":
            stations[key]["o3"].append(val)

# ── build output ──────────────────────────────────────────────────────────
out = []
for station_name, polls in stations.items():
    m = meta.get(station_name)
    if not m:
        continue

    avg_pm25 = sum(polls["pm25"]) / len(polls["pm25"]) if polls["pm25"] else None
    avg_pm10 = sum(polls["pm10"]) / len(polls["pm10"]) if polls["pm10"] else None
    avg_no2  = sum(polls["no2"])  / len(polls["no2"])  if polls["no2"]  else 0
    avg_so2  = sum(polls["so2"])  / len(polls["so2"])  if polls["so2"]  else 0
    avg_co   = sum(polls["co"])   / len(polls["co"])   if polls["co"]   else 0
    avg_o3   = sum(polls["o3"])   / len(polls["o3"])   if polls["o3"]   else 0

    # Derive AQI
    aqi = None
    if avg_pm25 is not None:
        aqi = pm25_to_aqi(avg_pm25)
    elif avg_pm10 is not None:
        aqi = pm10_to_aqi(avg_pm10)
    if aqi is None:
        continue

    out.append({
        "station":  station_name[:60],
        "city":     m["city"],
        "state":    m["state"],
        "lat":      round(m["lat"], 5),
        "lng":      round(m["lng"], 5),
        "aqi":      min(500, max(0, aqi)),
        "band":     aqi_band(aqi),
        "color":    aqi_color(aqi),
        "pm25":     round(avg_pm25, 1) if avg_pm25 is not None else None,
        "pm10":     round(avg_pm10, 1) if avg_pm10 is not None else None,
        "no2":      round(avg_no2, 1),
        "so2":      round(avg_so2, 1),
        "co":       round(avg_co, 1),
        "o3":       round(avg_o3, 1),
    })

out.sort(key=lambda x: x["aqi"], reverse=True)
print(f"Processed {len(out)} stations")

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)

print(f"Written to {OUT_PATH}")
print(f"AQI range: {min(x['aqi'] for x in out)} – {max(x['aqi'] for x in out)}")

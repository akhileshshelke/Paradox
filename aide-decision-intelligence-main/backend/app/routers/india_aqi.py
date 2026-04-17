"""
/api/india-aqi  — serves the pre-processed dataset from AQI.csv
Returns all 400+ monitoring stations across India with AQI, coordinates, pollutants.
"""
import json
from pathlib import Path
from functools import lru_cache
from fastapi import APIRouter

router = APIRouter(prefix="/india-aqi", tags=["india-aqi"])

DATA_FILE = Path(__file__).parent.parent / "data" / "india_aqi_stations.json"


@lru_cache(maxsize=1)
def _load_stations() -> list[dict]:
    if DATA_FILE.exists():
        with open(DATA_FILE, encoding="utf-8") as f:
            return json.load(f)
    return []


@router.get("")
async def get_india_aqi():
    """Returns all India AQI stations from the CPCB dataset."""
    return _load_stations()


@router.get("/summary")
async def get_summary():
    stations = _load_stations()
    if not stations:
        return {"total": 0}
    aqis = [s["aqi"] for s in stations]
    bands = {}
    for s in stations:
        bands[s["band"]] = bands.get(s["band"], 0) + 1
    return {
        "total": len(stations),
        "avg_aqi": round(sum(aqis) / len(aqis)),
        "max_aqi": max(aqis),
        "min_aqi": min(aqis),
        "bands": bands,
        "most_polluted": sorted(stations, key=lambda x: x["aqi"], reverse=True)[:5],
        "cleanest": sorted(stations, key=lambda x: x["aqi"])[:5],
    }

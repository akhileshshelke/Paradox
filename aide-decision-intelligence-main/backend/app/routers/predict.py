"""
/api/predict  — simple ML endpoint for AQI prediction from weather inputs.

Takes: temperature, humidity, wind_speed
Returns: predicted AQI + band + smart suggestions
"""
from __future__ import annotations

import logging
from typing import Optional

import numpy as np
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

log = logging.getLogger(__name__)

router = APIRouter(prefix="/predict", tags=["predict"])


class PredictRequest(BaseModel):
    temperature: float = Field(..., ge=-20, le=60, description="Temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Humidity in %")
    wind_speed: float = Field(..., ge=0, le=100, description="Wind speed in km/h")
    pm25: Optional[float] = Field(None, ge=0, description="PM2.5 µg/m³ if available")
    pm10: Optional[float] = Field(None, ge=0, description="PM10 µg/m³ if available")


class PredictResponse(BaseModel):
    predicted_aqi: int
    predicted_pm25: float
    aqi_band: str
    aqi_color: str
    confidence: float
    trend: str  # "increasing", "decreasing", "stable"
    suggestions: list[str]
    model_used: str
    next_hours: list[dict]  # [{"hour": "+1h", "aqi": 145}, ...]


AQI_BANDS = [
    (0, 50, "Good", "#00b050"),
    (51, 100, "Satisfactory", "#92d050"),
    (101, 200, "Moderate", "#ffff00"),
    (201, 300, "Poor", "#ff7c00"),
    (301, 400, "Very Poor", "#ff0000"),
    (401, 500, "Severe", "#7030a0"),
]


def _band_for(aqi: int) -> tuple[str, str]:
    for lo, hi, label, color in AQI_BANDS:
        if lo <= aqi <= hi:
            return label, color
    return "Severe", "#7030a0"


def _generate_suggestions(aqi: int, pm25: float, pm10: float, wind_speed: float) -> list[str]:
    suggestions = []
    if aqi > 300:
        suggestions.append("🚫 Impose odd-even traffic restrictions immediately.")
        suggestions.append("🏭 Halt industrial activity in affected zones.")
        suggestions.append("🏫 Recommend school closure and remote learning.")
        suggestions.append("😷 All outdoor activities strictly prohibited.")
    elif aqi > 250:
        suggestions.append("🚗 Enforce traffic diversion on hotspot corridors.")
        suggestions.append("🏗️ Suspend construction & demolition activities.")
        suggestions.append("😷 Sensitive groups should stay indoors.")
    elif aqi > 200:
        suggestions.append("🏗️ Restrict construction dust-generating activities.")
        suggestions.append("🚗 Encourage work-from-home to reduce traffic.")
        suggestions.append("🌿 Consider deploying water sprinklers on roads.")
    elif aqi > 150:
        suggestions.append("😷 Wear N95 masks when outdoors for prolonged periods.")
        suggestions.append("🚶 Limit outdoor exercise; prefer indoor workouts.")
    elif aqi > 100:
        suggestions.append("⚠️ Sensitive groups (children, elderly) limit outdoor time.")
        suggestions.append("🪟 Keep windows closed during peak traffic hours.")
    else:
        suggestions.append("✅ Air quality is acceptable. Enjoy outdoor activities.")
        suggestions.append("🌱 Great day for parks and outdoor exercise.")

    if pm25 > 60:
        suggestions.append("💨 High PM2.5 — use air purifiers indoors.")
    if wind_speed < 5:
        suggestions.append("🌬️ Low wind speed — pollutants accumulating. Monitor closely.")
    return suggestions[:4]


@router.post("", response_model=PredictResponse)
async def predict_aqi(body: PredictRequest, request: Request):
    """
    AI-powered AQI prediction from weather inputs.
    Uses the ML model if loaded, else falls back to a physics-based heuristic.
    """
    inference = getattr(request.app.state, "inference", None)
    ingest = getattr(request.app.state, "ingest", None)

    # Try ML model path first
    model_used = "heuristic"
    predicted_aqi = None
    predicted_pm25 = None

    if inference is not None and inference.rf is not None and inference.scaler is not None:
        try:
            # Build a minimal feature vector — wind/temp/humidity are always available
            # Use a single-row feature approach with defaults for missing cols
            feature_cols = inference.feature_cols
            base_row = {col: 0.0 for col in feature_cols}
            base_row["temp"] = body.temperature
            base_row["humidity"] = body.humidity
            base_row["wind_speed"] = body.wind_speed
            if body.pm25 is not None:
                base_row["pm25"] = body.pm25
            if body.pm10 is not None:
                base_row["pm10"] = body.pm10

            X = np.array([[base_row.get(c, 0.0) for c in feature_cols]])
            X_scaled = inference.scaler.transform(X)
            pred = inference.rf.predict(X_scaled)[0]  # (3,) → [+1h, +3h, +6h]
            predicted_pm25 = float(pred[0])
            # Convert PM2.5 to AQI (linear approx based on WHO / India NAQI)
            predicted_aqi = int(_pm25_to_aqi(predicted_pm25))
            model_used = "random_forest"
        except Exception as e:
            log.warning("ML predict failed, using heuristic: %r", e)

    if predicted_aqi is None:
        # Physics-based heuristic: high temp + low wind + high humidity → bad AQI
        predicted_pm25 = (
            30
            + max(0, 25 - body.wind_speed) * 3
            + max(0, body.humidity - 40) * 0.5
            + max(0, body.temperature - 15) * 1.2
        )
        if body.pm25 is not None:
            predicted_pm25 = (predicted_pm25 + body.pm25) / 2
        predicted_aqi = int(_pm25_to_aqi(predicted_pm25))

    band, color = _band_for(predicted_aqi)

    # Simple trend from current vs predicted
    current_pm25 = body.pm25 or predicted_pm25
    if predicted_pm25 > current_pm25 * 1.05:
        trend = "increasing"
    elif predicted_pm25 < current_pm25 * 0.95:
        trend = "decreasing"
    else:
        trend = "stable"

    # Next 6h forecasts with decay/growth
    multipliers = {"increasing": [1.0, 1.1, 1.2, 1.35, 1.5, 1.65],
                   "decreasing": [1.0, 0.92, 0.82, 0.72, 0.63, 0.55],
                   "stable":     [1.0, 0.98, 1.02, 0.99, 1.01, 1.00]}[trend]
    next_hours = [
        {"hour": f"+{i+1}h", "aqi": max(0, min(500, int(predicted_aqi * m)))}
        for i, m in enumerate(multipliers)
    ]

    suggestions = _generate_suggestions(
        predicted_aqi,
        predicted_pm25,
        body.pm10 or predicted_pm25 * 1.6,
        body.wind_speed,
    )

    return PredictResponse(
        predicted_aqi=predicted_aqi,
        predicted_pm25=round(predicted_pm25, 1),
        aqi_band=band,
        aqi_color=color,
        confidence=0.87 if model_used == "random_forest" else 0.72,
        trend=trend,
        suggestions=suggestions,
        model_used=model_used,
        next_hours=next_hours,
    )


@router.get("/hourly/{station_id}")
async def predict_hourly(station_id: str, request: Request):
    """Returns 6-hour AQI forecast for a specific station."""
    ingest = getattr(request.app.state, "ingest", None)
    inference = getattr(request.app.state, "inference", None)

    if ingest is None:
        raise HTTPException(503, "Service not ready")

    history = ingest.history(station_id)
    if not history:
        raise HTTPException(404, f"Station '{station_id}' not found")

    latest = history[-1]
    fc = None
    if inference is not None:
        fc = inference.forecast(history)

    if fc is not None:
        next_hours = [
            {"hour": f"+{p.horizon_h}h", "aqi": max(0, min(500, int(_pm25_to_aqi(p.mean))))}
            for p in fc.points
        ]
    else:
        next_hours = [
            {"hour": f"+{i+1}h", "aqi": max(0, min(500, int(latest.aqi * (1 + (i * 0.05)))))}
            for i in range(6)
        ]

    return {
        "station_id": station_id,
        "current_aqi": latest.aqi,
        "next_hours": next_hours,
        "model": fc.model if fc else "synthetic",
    }


def _pm25_to_aqi(pm25: float) -> float:
    """Linear piecewise PM2.5 → AQI (India NAQI scale)."""
    breakpoints = [
        (0, 30, 0, 50),
        (30, 60, 51, 100),
        (60, 90, 101, 200),
        (90, 120, 201, 300),
        (120, 250, 301, 400),
        (250, 380, 401, 500),
    ]
    for c_lo, c_hi, i_lo, i_hi in breakpoints:
        if c_lo <= pm25 <= c_hi:
            return ((i_hi - i_lo) / (c_hi - c_lo)) * (pm25 - c_lo) + i_lo
    return 500

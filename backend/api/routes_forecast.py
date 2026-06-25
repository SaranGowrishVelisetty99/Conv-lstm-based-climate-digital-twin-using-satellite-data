import datetime

import numpy as np
from fastapi import APIRouter, HTTPException

from backend.data.preprocessor import load_input_sequence
from backend.core.inference import predict_single, rolling_forecast
from backend.data.schemas import (
    RollingForecastResponse, ForecastResult, SinglePredictionResponse,
)
from backend.core.config import FORECAST_DAYS, TIMESTEPS, GRID_ROWS, GRID_COLS

router = APIRouter(prefix="/api/forecast", tags=["forecast"])


@router.post("/predict", response_model=SinglePredictionResponse)
def predict_single_endpoint():
    seq = load_input_sequence(timesteps=TIMESTEPS)
    pred = predict_single(seq)
    today = datetime.date.today().isoformat()
    return SinglePredictionResponse(
        location="Andhra Pradesh",
        date=today,
        rainfall=pred[:, :, 0].tolist(),
        max_temp=pred[:, :, 1].tolist(),
        min_temp=pred[:, :, 2].tolist(),
    )


@router.post("/rolling", response_model=RollingForecastResponse)
def rolling_forecast_endpoint(days: int = FORECAST_DAYS):
    if days < 1 or days > 30:
        raise HTTPException(400, "days must be between 1 and 30")
    seq = load_input_sequence(timesteps=TIMESTEPS)
    forecasts = rolling_forecast(seq, days=days)
    today = datetime.date.today().isoformat()
    return RollingForecastResponse(
        location="Andhra Pradesh",
        start_date=today,
        forecasts=[ForecastResult(**f) for f in forecasts],
    )


@router.get("/latest")
def get_latest_forecast():
    seq = load_input_sequence(timesteps=TIMESTEPS)
    forecasts = rolling_forecast(seq, days=FORECAST_DAYS)
    today = datetime.date.today().isoformat()
    return {
        "location": "Andhra Pradesh",
        "start_date": today,
        "forecasts": forecasts,
    }

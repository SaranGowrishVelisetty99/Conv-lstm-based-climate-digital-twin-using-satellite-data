import datetime

import numpy as np
from fastapi import APIRouter, Query

from backend.data.preprocessor import load_input_sequence
from backend.evaluation.metrics import all_metrics
from backend.core.config import GRID_ROWS, GRID_COLS, TIMESTEPS

router = APIRouter(prefix="/api/data", tags=["data"])


@router.get("/latest")
def get_latest_data():
    seq = load_input_sequence(timesteps=1)
    return {
        "date": datetime.date.today().isoformat(),
        "rainfall": seq[0, :, :, 0].tolist(),
        "max_temp": seq[0, :, :, 1].tolist(),
        "min_temp": seq[0, :, :, 2].tolist(),
    }


@router.get("/historical")
def get_historical(
    variable: str = Query("rainfall", pattern="^(rainfall|max_temp|min_temp)$"),
    lat: float = Query(16.0, ge=12.5, le=19.5),
    lon: float = Query(80.0, ge=77.0, le=84.5),
    days: int = Query(30, ge=1, le=365),
):
    seq = load_input_sequence(timesteps=days)
    var_idx = {"rainfall": 0, "max_temp": 1, "min_temp": 2}[variable]
    grid_lat = int((lat - 12.5) / (7.0 / GRID_ROWS))
    grid_lon = int((lon - 77.0) / (7.5 / GRID_COLS))
    grid_lat = min(grid_lat, GRID_ROWS - 1)
    grid_lon = min(grid_lon, GRID_COLS - 1)
    values = seq[:, grid_lat, grid_lon, var_idx].tolist()
    dates = [
        (datetime.date.today() - datetime.timedelta(days=days - 1 - i)).isoformat()
        for i in range(days)
    ]
    return {
        "variable": variable,
        "lat": lat,
        "lon": lon,
        "data": [{"date": d, "value": v} for d, v in zip(dates, values)],
    }

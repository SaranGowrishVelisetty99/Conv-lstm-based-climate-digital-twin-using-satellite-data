import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
MODEL_PATH = BASE_DIR / "convlstm_model.keras"

GRID_ROWS = 24
GRID_COLS = 32
TIMESTEPS = 30
NUM_CHANNELS = 3

RAIN_MIN, RAIN_MAX = 0.0, 500.0
TMAX_MIN, TMAX_MAX = -10.0, 50.0
TMIN_MIN, TMIN_MAX = -15.0, 45.0

AP_BOUNDS = {
    "lat_min": 12.5, "lat_max": 19.5,
    "lon_min": 77.0, "lon_max": 84.5,
}

FORECAST_DAYS = 7

CHANNEL_NAMES = ["rainfall", "max_temp", "min_temp"]

NORM_PARAMS = {
    "rainfall": {"min": RAIN_MIN, "max": RAIN_MAX},
    "max_temp": {"min": TMAX_MIN, "max": TMAX_MAX},
    "min_temp": {"min": TMIN_MIN, "max": TMIN_MAX},
}

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

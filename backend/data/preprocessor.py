import json

import numpy as np
import xarray as xr
from scipy.interpolate import RegularGridInterpolator

from backend.core.config import (
    GRID_ROWS, GRID_COLS, AP_BOUNDS, PROCESSED_DIR,
)


def crop_to_ap(ds: xr.Dataset, lat_name="lat", lon_name="lon"):
    return ds.sel(**{
        lat_name: slice(AP_BOUNDS["lat_min"], AP_BOUNDS["lat_max"]),
        lon_name: slice(AP_BOUNDS["lon_min"], AP_BOUNDS["lon_max"]),
    })

def make_ap_grid():
    lat = np.linspace(AP_BOUNDS["lat_min"], AP_BOUNDS["lat_max"], GRID_ROWS)
    lon = np.linspace(AP_BOUNDS["lon_min"], AP_BOUNDS["lon_max"], GRID_COLS)
    return lat, lon

def regrid_to_24x32(ds: xr.Dataset, var: str, lat_name="lat", lon_name="lon") -> np.ndarray:
    target_lat, target_lon = make_ap_grid()
    data = ds[var].values
    src_lat = ds[lat_name].values
    src_lon = ds[lon_name].values
    interp = RegularGridInterpolator((src_lat, src_lon), data, bounds_error=False, fill_value=None)
    mg = np.meshgrid(target_lon, target_lat, indexing="xy")
    pts = np.column_stack([mg[1].ravel(), mg[0].ravel()])
    regridded = interp(pts).reshape(GRID_ROWS, GRID_COLS)
    return regridded

def stack_channels(rain: np.ndarray, tmax: np.ndarray, tmin: np.ndarray) -> np.ndarray:
    return np.stack([rain, tmax, tmin], axis=-1)

def generate_sample_sequence(
    rain_mean=5.0, rain_std=10.0,
    tmax_mean=32.0, tmax_std=5.0,
    tmin_mean=22.0, tmin_std=4.0,
    timesteps=30,
):
    np.random.seed(42)
    seq = np.zeros((timesteps, GRID_ROWS, GRID_COLS, 3), dtype=np.float32)
    for t in range(timesteps):
        seq[t, :, :, 0] = np.random.exponential(rain_mean, (GRID_ROWS, GRID_COLS))
        seq[t, :, :, 1] = tmax_mean + np.random.normal(0, tmax_std, (GRID_ROWS, GRID_COLS))
        seq[t, :, :, 2] = tmin_mean + np.random.normal(0, tmin_std, (GRID_ROWS, GRID_COLS))
    return seq


def load_input_sequence(timesteps=30) -> np.ndarray:
    filepath = PROCESSED_DIR / "andhra_pradesh_sample.json"
    if not filepath.exists():
        return generate_sample_sequence(timesteps=timesteps)

    with open(filepath) as f:
        dataset = json.load(f)

    entries = dataset["data"]
    n = min(timesteps, len(entries))
    recent = entries[-n:]

    seq = np.zeros((timesteps, GRID_ROWS, GRID_COLS, 3), dtype=np.float32)
    offset = timesteps - n
    for i, entry in enumerate(recent):
        seq[offset + i, :, :, 0] = entry["rainfall"]
        seq[offset + i, :, :, 1] = entry["max_temp"]
        seq[offset + i, :, :, 2] = entry["min_temp"]

    return seq

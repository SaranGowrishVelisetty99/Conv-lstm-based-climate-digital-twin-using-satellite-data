import numpy as np

from backend.core.model_loader import get_model
from backend.core.config import (
    GRID_ROWS, GRID_COLS, TIMESTEPS, NUM_CHANNELS,
    FORECAST_DAYS, NORM_PARAMS,
)


def normalize(data: np.ndarray, var_name: str) -> np.ndarray:
    p = NORM_PARAMS[var_name]
    return (data - p["min"]) / (p["max"] - p["min"])

def denormalize(data: np.ndarray, var_name: str) -> np.ndarray:
    p = NORM_PARAMS[var_name]
    return data * (p["max"] - p["min"]) + p["min"]

def normalize_tensor(tensor: np.ndarray) -> np.ndarray:
    out = np.zeros_like(tensor, dtype=np.float32)
    for c, name in enumerate(["rainfall", "max_temp", "min_temp"]):
        out[..., c] = normalize(tensor[..., c], name)
    return out.astype(np.float32)

def denormalize_tensor(tensor: np.ndarray) -> np.ndarray:
    out = np.zeros_like(tensor, dtype=np.float32)
    for c, name in enumerate(["rainfall", "max_temp", "min_temp"]):
        out[..., c] = denormalize(tensor[..., c], name)
    return out.astype(np.float32)

def predict_single(input_seq: np.ndarray) -> np.ndarray:
    model = get_model()
    normed = normalize_tensor(input_seq)
    inputs = normed[np.newaxis, ...]
    pred = model.predict(inputs, verbose=0)
    return denormalize_tensor(pred[0])

def rolling_forecast(
    initial_seq: np.ndarray,
    days: int = FORECAST_DAYS,
) -> list[dict]:
    model = get_model()
    current_window = normalize_tensor(initial_seq.copy()).astype(np.float32)
    predictions = []

    for day in range(days):
        inputs = current_window[np.newaxis, ...]
        next_norm = model.predict(inputs, verbose=0)[0]
        next_denorm = denormalize_tensor(next_norm)

        predictions.append({
            "day": day + 1,
            "rainfall": next_denorm[:, :, 0].tolist(),
            "max_temp": next_denorm[:, :, 1].tolist(),
            "min_temp": next_denorm[:, :, 2].tolist(),
        })

        current_window = np.roll(current_window, shift=-1, axis=0)
        current_window[-1] = next_norm

    return predictions

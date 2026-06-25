from typing import Optional

import numpy as np

from backend.core.config import (
    GRID_ROWS, GRID_COLS, TIMESTEPS, NORM_PARAMS,
    FORECAST_DAYS,
)
from backend.core.inference import (
    normalize_tensor, denormalize_tensor, rolling_forecast,
)


class WhatIfEngine:
    def __init__(self):
        pass

    def apply_perturbation(
        self,
        base_input: np.ndarray,
        temperature_delta: float = 0.0,
        rainfall_delta: float = 0.0,
        mode: str = "uniform",
        mask: Optional[np.ndarray] = None,
    ) -> np.ndarray:
        perturbed = base_input.copy().astype(np.float32)
        tmax_norm = temperature_delta / (NORM_PARAMS["max_temp"]["max"] - NORM_PARAMS["max_temp"]["min"])
        tmin_norm = temperature_delta / (NORM_PARAMS["min_temp"]["max"] - NORM_PARAMS["min_temp"]["min"])
        rain_norm = rainfall_delta  # rainfall_delta is fractional, multiply by current values

        if mode == "uniform":
            perturbed[:, :, :, 0] *= (1.0 + rain_norm)
            perturbed[:, :, :, 1] += tmax_norm
            perturbed[:, :, :, 2] += tmin_norm
        elif mode == "spatial_mask" and mask is not None:
            perturbed[:, mask, 0] *= (1.0 + rain_norm)
            perturbed[:, mask, 1] += tmax_norm
            perturbed[:, mask, 2] += tmin_norm
        elif mode == "seasonal":
            perturbed[:, :, :, 0] *= (1.0 + rain_norm)
            perturbed[:, :, :, 1] += tmax_norm
            perturbed[:, :, :, 2] += tmin_norm

        return np.clip(perturbed, 0.0, 1.0)

    def run_simulation(
        self,
        base_seq: np.ndarray,
        temperature_delta: float = 0.0,
        rainfall_delta: float = 0.0,
        mode: str = "uniform",
        days: int = FORECAST_DAYS,
    ) -> list[dict]:
        base_norm = normalize_tensor(base_seq)
        perturbed_norm = self.apply_perturbation(
            base_norm, temperature_delta, rainfall_delta, mode
        )
        return rolling_forecast(denormalize_tensor(perturbed_norm), days=days)

    def run_scenario(
        self,
        base_seq: np.ndarray,
        scenario: dict,
        days: int = FORECAST_DAYS,
    ) -> list[dict]:
        temp = scenario.get("temperature", 0.0)
        rain = scenario.get("rainfall", 0.0)
        mode = scenario.get("mode", "uniform")
        return self.run_simulation(base_seq, temp, rain, mode, days)

import numpy as np


def compute_rmse(pred: np.ndarray, obs: np.ndarray) -> float:
    return float(np.sqrt(np.mean((pred - obs) ** 2)))

def compute_mae(pred: np.ndarray, obs: np.ndarray) -> float:
    return float(np.mean(np.abs(pred - obs)))

def compute_bias(pred: np.ndarray, obs: np.ndarray) -> float:
    return float(np.mean(pred - obs))

def compute_r_squared(pred: np.ndarray, obs: np.ndarray) -> float:
    ss_res = np.sum((obs - pred) ** 2)
    ss_tot = np.sum((obs - np.mean(obs)) ** 2)
    if ss_tot == 0:
        return 1.0
    return float(1.0 - ss_res / ss_tot)

def all_metrics(pred: np.ndarray, obs: np.ndarray) -> dict:
    return {
        "rmse": compute_rmse(pred, obs),
        "mae": compute_mae(pred, obs),
        "bias": compute_bias(pred, obs),
        "r_squared": compute_r_squared(pred, obs),
        "n_samples": int(pred.size),
    }

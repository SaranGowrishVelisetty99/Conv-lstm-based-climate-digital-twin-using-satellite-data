import numpy as np
from fastapi import APIRouter

from backend.core.model_loader import model_info
from backend.data.preprocessor import load_input_sequence
from backend.core.inference import predict_single
from backend.evaluation.metrics import all_metrics
from backend.data.schemas import ValidationMetrics
from backend.core.config import TIMESTEPS

router = APIRouter(prefix="/api/validation", tags=["validation"])


@router.get("/metrics")
def get_metrics():
    seq = load_input_sequence(timesteps=TIMESTEPS + 1)
    obs = seq[1:]  # observed = shifted by 1
    pred = np.zeros_like(obs)
    for t in range(TIMESTEPS):
        pred[t] = predict_single(seq[t:t + TIMESTEPS])
    metrics = all_metrics(pred, obs)
    return {"metrics": metrics}


@router.get("/compare")
def get_comparison():
    seq = load_input_sequence(timesteps=TIMESTEPS + 1)
    pred = predict_single(seq[:-1])
    obs = seq[-1]
    return {
        "rainfall": {
            "predicted": pred[:, :, 0].tolist(),
            "observed": obs[:, :, 0].tolist(),
        },
        "max_temp": {
            "predicted": pred[:, :, 1].tolist(),
            "observed": obs[:, :, 1].tolist(),
        },
        "min_temp": {
            "predicted": pred[:, :, 2].tolist(),
            "observed": obs[:, :, 2].tolist(),
        },
    }

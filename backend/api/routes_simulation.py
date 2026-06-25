import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException

from backend.data.preprocessor import load_input_sequence
from backend.simulation.whatif import WhatIfEngine
from backend.simulation.scenarios import list_scenarios, get_scenario
from backend.data.schemas import PerturbationRequest, ScenarioRunRequest, ScenarioInfo
from backend.core.config import TIMESTEPS

router = APIRouter(prefix="/api/simulation", tags=["simulation"])
engine = WhatIfEngine()


@router.post("/whatif")
def run_whatif(req: PerturbationRequest):
    base_seq = load_input_sequence(timesteps=TIMESTEPS)
    results = engine.run_simulation(
        base_seq,
        temperature_delta=req.temperature_delta,
        rainfall_delta=req.rainfall_delta,
        mode=req.mode,
    )
    return {
        "scenario": "custom",
        "parameters": {
            "temperature_delta": req.temperature_delta,
            "rainfall_delta": req.rainfall_delta,
            "mode": req.mode,
        },
        "base_date": req.base_date or datetime.date.today().isoformat(),
        "forecasts": results,
    }


@router.get("/scenarios")
def get_scenarios():
    return {"scenarios": list_scenarios()}


@router.post("/scenario/{name}")
def run_scenario(name: str, req: Optional[ScenarioRunRequest] = None):
    scenario = get_scenario(name)
    if scenario is None:
        raise HTTPException(404, f"Scenario '{name}' not found")
    base_seq = load_input_sequence(timesteps=TIMESTEPS)
    results = engine.run_scenario(base_seq, scenario)
    return {
        "scenario": name,
        "name": scenario["name"],
        "description": scenario["description"],
        "parameters": {
            "temperature": scenario["temperature"],
            "rainfall": scenario["rainfall"],
            "mode": scenario["mode"],
        },
        "base_date": (req.base_date if req else None) or datetime.date.today().isoformat(),
        "forecasts": results,
    }

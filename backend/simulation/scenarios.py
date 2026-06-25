SCENARIOS = {
    "rcp45": {
        "name": "RCP 4.5 (Moderate Emissions)",
        "description": "Temperature +1.8°C, Rainfall +5% by 2100",
        "temperature": 1.8,
        "rainfall": 0.05,
        "mode": "seasonal",
    },
    "rcp85": {
        "name": "RCP 8.5 (High Emissions)",
        "description": "Temperature +3.7°C, Rainfall +10% by 2100",
        "temperature": 3.7,
        "rainfall": 0.10,
        "mode": "seasonal",
    },
    "extreme_heat": {
        "name": "Extreme Heat Wave",
        "description": "Temperature +5°C uniform over region",
        "temperature": 5.0,
        "rainfall": 0.0,
        "mode": "uniform",
    },
    "drought": {
        "name": "Severe Drought",
        "description": "Rainfall -40%, Temperature +2°C",
        "temperature": 2.0,
        "rainfall": -0.40,
        "mode": "uniform",
    },
    "heavy_monsoon": {
        "name": "Excess Monsoon",
        "description": "Rainfall +50%",
        "temperature": 0.0,
        "rainfall": 0.50,
        "mode": "uniform",
    },
}


def list_scenarios() -> list[dict]:
    return [
        {"id": k, "name": v["name"], "description": v["description"]}
        for k, v in SCENARIOS.items()
    ]

def get_scenario(name: str):
    return SCENARIOS.get(name)

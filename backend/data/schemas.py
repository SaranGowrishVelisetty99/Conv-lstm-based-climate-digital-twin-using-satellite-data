from datetime import date
from pydantic import BaseModel, Field
from typing import Optional


class GridData(BaseModel):
    rainfall: list[list[float]]
    max_temp: list[list[float]]
    min_temp: list[list[float]]
    date: str

class ForecastResult(BaseModel):
    day: int
    rainfall: list[list[float]]
    max_temp: list[list[float]]
    min_temp: list[list[float]]

class RollingForecastResponse(BaseModel):
    location: str
    start_date: str
    forecasts: list[ForecastResult]

class SinglePredictionResponse(BaseModel):
    location: str
    date: str
    rainfall: list[list[float]]
    max_temp: list[list[float]]
    min_temp: list[list[float]]

class PerturbationRequest(BaseModel):
    temperature_delta: float = Field(default=0.0, ge=-10.0, le=10.0, description="°C change")
    rainfall_delta: float = Field(default=0.0, ge=-1.0, le=2.0, description="fractional change (-1 to +2)")
    base_date: Optional[str] = None
    mode: str = Field(default="uniform", pattern="^(uniform|spatial_mask|seasonal)$")

class ScenarioRunRequest(BaseModel):
    base_date: Optional[str] = None

class ScenarioInfo(BaseModel):
    name: str
    description: str

class ValidationMetrics(BaseModel):
    rmse: float
    mae: float
    bias: float
    r_squared: float
    n_samples: int

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    input_shape: Optional[list] = None
    output_shape: Optional[list] = None

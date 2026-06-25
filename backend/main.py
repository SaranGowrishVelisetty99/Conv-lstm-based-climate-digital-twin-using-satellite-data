from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.model_loader import load_model, model_info
from backend.api.routes_forecast import router as forecast_router
from backend.api.routes_simulation import router as simulation_router
from backend.api.routes_data import router as data_router
from backend.api.routes_validation import router as validation_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


app = FastAPI(
    title="AI Digital Twin - India Climate (Andhra Pradesh)",
    description="AI-Powered Digital Twin of India's Climate using ConvLSTM predictions",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast_router)
app.include_router(simulation_router)
app.include_router(data_router)
app.include_router(validation_router)


@app.get("/api/health")
def health():
    info = model_info()
    return {
        "status": "ok",
        "model_loaded": True,
        "input_shape": info["input_shape"],
        "output_shape": info["output_shape"],
    }

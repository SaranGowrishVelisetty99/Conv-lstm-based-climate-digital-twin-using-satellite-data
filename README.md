# AI Digital Twin — India Climate (Andhra Pradesh)

AI-powered digital twin that models and predicts climate variables for Andhra Pradesh, India, using a ConvLSTM deep learning model on a 24×32 km grid.

## Features

- **7-Day Rolling Forecasts** — Auto-regressive ConvLSTM predictions with day-by-day navigation
- **What-If Simulation** — Explore climate scenarios by perturbing temperature (±5°C) and rainfall (±100%)
- **Predefined Scenarios** — RCP 4.5, RCP 8.5, Extreme Heat, Drought, Excess Monsoon
- **Animated Weather Maps** — Canvas-based maps with aspect-ratio-preserving viewport, rainfall particles, heat shimmer effects, and district labels. Also includes a Leaflet interactive map view.
- **Historical Data Explorer** — Time series charts for any variable at any grid point (dedicated page at `/historical`)
- **Model Validation** — RMSE, MAE, bias, R² metrics with predicted-vs-observed comparison (dedicated page at `/validation`)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Python 3.10+, FastAPI, TensorFlow 2.15+, Uvicorn |
| ML Model | ConvLSTM (24×32×3 input, 30-timestep window) |
| Maps | Custom Canvas rendering + Leaflet (OSM) |
| Charts | Recharts |
| Infrastructure | Docker, Docker Compose |

## Project Structure

```
├── backend/
│   ├── main.py                     # FastAPI app, CORS, router registration
│   ├── requirements.txt            # Python dependencies
│   ├── api/
│   │   ├── routes_forecast.py      # /api/forecast/* endpoints
│   │   ├── routes_simulation.py    # /api/simulation/* endpoints
│   │   ├── routes_data.py          # /api/data/* endpoints
│   │   └── routes_validation.py    # /api/validation/* endpoints
│   ├── core/
│   │   ├── config.py               # Grid, bounds, normalization constants
│   │   ├── model_loader.py         # TensorFlow model singleton loader
│   │   └── inference.py            # Normalization, predict, rolling forecast
│   ├── data/
│   │   ├── preprocessor.py         # Cropping, regridding, data loading
│   │   └── schemas.py              # Pydantic request/response models
│   ├── simulation/
│   │   ├── whatif.py               # Perturbation engine
│   │   └── scenarios.py            # Predefined scenario definitions
│   └── evaluation/
│       └── metrics.py              # RMSE, MAE, bias, R²
│
├── frontend/
│   ├── next.config.ts              # Next.js config with API rewrites
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   │   ├── page.tsx            # Main dashboard
│   │   │   ├── layout.tsx          # Root layout (navbar + theme)
│   │   │   ├── forecast/           # 7-day forecast page
│   │   │   ├── simulation/         # What-if page
│   │   │   ├── historical/         # Historical data page
│   │   │   └── validation/         # Model validation page
│   │   ├── components/             # React components
│   │   │   ├── WeatherMap.tsx      # Canvas animated map (aspect-ratio preserved via viewport)
│   │   │   ├── MapView.tsx         # Leaflet interactive map
│   │   │   ├── MapViewWrapper.tsx  # Dynamic import wrapper (disables SSR for Leaflet)
│   │   │   ├── Navbar.tsx          # Side navigation
│   │   │   ├── StatsCard.tsx       # Stat display card
│   │   │   ├── ScenarioPanel.tsx   # Scenario controls
│   │   │   ├── TimeSlider.tsx      # Forecast day slider
│   │   │   ├── VariableSelector.tsx# Rain/temp toggle
│   │   │   ├── ForecastPanel.tsx   # 7-day summary grid
│   │   │   └── MetricsChart.tsx    # Recharts wrapper
│   │   ├── hooks/                  # React hooks
│   │   │   ├── useForecast.ts      # Forecast data fetching
│   │   │   └── useSimulation.ts    # Simulation state management
│   │   └── lib/
│   │       ├── api.ts              # API client + TypeScript interfaces
│   │       ├── geo.ts              # Grid/boundary utilities
│   │       ├── colors.ts           # Color scales
│   │       ├── apOutline.ts        # State boundary polygon
│   │       └── apDistricts.ts      # District boundary data
│   └── package.json
│
├── data/
│   ├── raw/                        # IMD NetCDF downloads
│   └── processed/
│       └── andhra_pradesh_sample.json  # 365-day synthetic dataset
│
├── scripts/
│   ├── download_data.py            # Download IMD gridded data
│   └── generate_sample_data.py     # Generate synthetic AP climate data
│
├── convlstm_model.keras            # Pre-trained ConvLSTM model
├── docker-compose.yml              # Docker orchestration
├── Dockerfile.backend              # Backend image
└── Dockerfile.frontend             # Frontend image (multi-stage)
```

## Getting Started

### Prerequisites

- Node.js 22+ and npm
- Python 3.10+ and pip
- A TensorFlow-compatible environment (CPU or CUDA GPU)

### Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Generate sample data
python scripts/generate_sample_data.py

# Start the backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at **http://localhost:3000**. API requests to `/api/*` are proxied to `http://localhost:8000` via Next.js rewrites.

### Run Both Together

```bash
# From project root (requires concurrently)
npm run dev:all
```

### Docker

```bash
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check with model info |
| **Forecast** | | |
| `/api/forecast/predict` | POST | Single-step prediction |
| `/api/forecast/rolling` | POST | Multi-day rolling forecast (1–30 days) |
| `/api/forecast/latest` | GET | Latest 7-day forecast |
| **Simulation** | | |
| `/api/simulation/whatif` | POST | Custom perturbation |
| `/api/simulation/scenarios` | GET | List predefined scenarios |
| `/api/simulation/scenario/{name}` | POST | Run a named scenario |
| **Data** | | |
| `/api/data/latest` | GET | Latest observed data |
| `/api/data/historical` | GET | Historical time series |
| **Validation** | | |
| `/api/validation/metrics` | GET | RMSE, MAE, bias, R² |
| `/api/validation/compare` | GET | Predicted vs observed comparison |

### What-If Request Body

```json
{
  "temperature_delta": 2.0,
  "rainfall_delta": 0.1,
  "mode": "uniform"
}
```

### Predefined Scenarios

| ID | Name | Temp Δ | Rain Δ | Mode |
|---|---|---|---|---|
| `rcp45` | RCP 4.5 (Moderate Emissions) | +1.8°C | +5% | seasonal |
| `rcp85` | RCP 8.5 (High Emissions) | +3.7°C | +10% | seasonal |
| `extreme_heat` | Extreme Heat Wave | +5.0°C | — | uniform |
| `drought` | Severe Drought | +2.0°C | -40% | uniform |
| `heavy_monsoon` | Excess Monsoon | — | +50% | uniform |

## Data Pipeline

```
IMD NetCDF → crop_to_ap() → regrid_to_24x32() → stack_channels()
                                                      │
                                                      ▼
                                              (30, 24, 32, 3) tensor
                                                      │
                                                      ▼
                                        normalize_tensor() → model.predict() → denormalize_tensor()
                                                      │
                                                      ▼
                                        rolling_forecast() (7-day auto-regressive)
                                                      │
                                                      ▼
                                              JSON → Frontend
```

Without real IMD data, `load_input_sequence()` in `backend/data/preprocessor.py` reads from `data/processed/andhra_pradesh_sample.json` (365 days of synthetic data generated by `scripts/generate_sample_data.py`). If the JSON file is also missing, it falls back to `generate_sample_sequence()` which produces random data on the fly.

## Configuration

**Backend** (`backend/core/config.py`):

| Parameter | Value |
|---|---|
| Grid | 24 rows × 32 columns |
| Input window | 30 timesteps |
| Forecast horizon | 7 days |
| AP lat bounds | 12.5°N – 19.5°N |
| AP lon bounds (backend `config.py`) | 77.0°E – 84.5°E |
| AP lon bounds (frontend `geo.ts`) | 76.7°E – 84.8°E |
| Rain normalization | [0, 500] mm/day |
| Temp normalization | [-10, 50]°C / [-15, 45]°C |

**Frontend** (`frontend/.env`):

| Variable | Default |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` |

### Map Rendering

The `WeatherMap` canvas component automatically preserves the geographic aspect ratio of Andhra Pradesh (`(lon_span) / (lat_span) ≈ 1.157`). When the canvas dimensions don't match this ratio, it computes a centered viewport and fills the remaining area with the background gradient — eliminating stretched map content regardless of container size. The map height is computed from `width / MAP_ASPECT` when no fixed height is provided, making each map perfectly fill its card. `MAP_ASPECT` is derived from `AP_BOUNDS` in `src/lib/geo.ts`. Rainfall cells show animated falling particles; temperature cells show a heat shimmer pulse effect.

## License

MIT

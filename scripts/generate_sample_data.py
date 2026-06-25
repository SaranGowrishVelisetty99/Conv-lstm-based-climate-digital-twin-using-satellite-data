import numpy as np
from pathlib import Path
import json

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
GRID_ROWS, GRID_COLS = 24, 32
RAIN_MEAN, RAIN_SCALE = 5.0, 10.0
TMAX_MEAN, TMAX_STD = 33.0, 4.0
TMIN_MEAN, TMIN_STD = 22.0, 3.0


def generate_sample_date(date_str: str, seed: int | None = None):
    if seed is not None:
        np.random.seed(seed)
    rain = np.random.exponential(RAIN_MEAN, (GRID_ROWS, GRID_COLS))
    tmax = TMAX_MEAN + np.random.normal(0, TMAX_STD, (GRID_ROWS, GRID_COLS))
    tmin = TMIN_MEAN + np.random.normal(0, TMIN_STD, (GRID_ROWS, GRID_COLS))
    return {
        "date": date_str,
        "rainfall": rain.tolist(),
        "max_temp": tmax.tolist(),
        "min_temp": tmin.tolist(),
    }


def generate_dataset(start_date: str = "2024-01-01", days: int = 365):
    from datetime import datetime, timedelta
    start = datetime.strptime(start_date, "%Y-%m-%d")
    dates = [(start + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]
    dataset = [generate_sample_date(d, seed=i) for i, d in enumerate(dates)]
    return dataset


def main():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    print("Generating sample data for Andhra Pradesh...")
    data = generate_dataset(days=365)
    out_path = PROCESSED_DIR / "andhra_pradesh_sample.json"
    with open(out_path, "w") as f:
        json.dump({"region": "Andhra Pradesh", "grid_rows": GRID_ROWS, "grid_cols": GRID_COLS, "data": data}, f)
    print(f"Saved {len(data)} days of sample data to {out_path}")


if __name__ == "__main__":
    main()

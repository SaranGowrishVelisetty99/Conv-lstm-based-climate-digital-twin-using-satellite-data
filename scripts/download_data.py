import argparse
import requests
from pathlib import Path

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"

IMD_RAIN_URL = "https://www.imdpune.gov.in/cmpg/Griddata/Rainfall_25_Bin.html"
IMD_TMAX_URL = "https://imdpune.gov.in/cmpg/Griddata/Max_1_Bin.html"
IMD_TMIN_URL = "https://www.imdpune.gov.in/cmpg/Griddata/Min_1_Bin.html"


def download_file(url: str, dest: Path):
    print(f"Downloading {url} -> {dest}")
    resp = requests.get(url, stream=True, timeout=120)
    resp.raise_for_status()
    dest.parent.mkdir(parents=True, exist_ok=True)
    with open(dest, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"Saved {dest} ({dest.stat().st_size / 1024:.1f} KB)")


def download_imd_rainfall(year: int):
    raw_dir = RAW_DIR / "imd" / "rainfall" / str(year)
    raw_dir.mkdir(parents=True, exist_ok=True)
    dest = raw_dir / f"rainfall_{year}.nc"
    if not dest.exists():
        download_file(IMD_RAIN_URL, dest)
    else:
        print(f"Already exists: {dest}")


def download_imd_temperature(year: int, var: str):
    raw_dir = RAW_DIR / "imd" / var / str(year)
    raw_dir.mkdir(parents=True, exist_ok=True)
    url = IMD_TMAX_URL if var == "tmax" else IMD_TMIN_URL
    dest = raw_dir / f"{var}_{year}.nc"
    if not dest.exists():
        download_file(url, dest)
    else:
        print(f"Already exists: {dest}")


def main():
    parser = argparse.ArgumentParser(description="Download IMD climate data for Digital Twin")
    parser.add_argument("--year", type=int, default=2023, help="Year to download")
    parser.add_argument("--all", action="store_true", help="Download all datasets")
    parser.add_argument("--rain", action="store_true", help="Download rainfall")
    parser.add_argument("--temp", action="store_true", help="Download temperature")
    args = parser.parse_args()

    if args.all:
        download_imd_rainfall(args.year)
        download_imd_temperature(args.year, "tmax")
        download_imd_temperature(args.year, "tmin")
    else:
        if args.rain:
            download_imd_rainfall(args.year)
        if args.temp:
            download_imd_temperature(args.year, "tmax")
            download_imd_temperature(args.year, "tmin")

    print("Download complete.")


if __name__ == "__main__":
    main()

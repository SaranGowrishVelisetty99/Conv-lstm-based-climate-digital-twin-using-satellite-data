export interface Bounds {
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
}

export const AP_BOUNDS: Bounds = {
  lat_min: 12.5,
  lat_max: 19.5,
  lon_min: 76.7,
  lon_max: 84.8,
};

export const GRID_ROWS = 24;
export const GRID_COLS = 32;

export function gridToLatLng(row: number, col: number): [number, number] {
  const lat = AP_BOUNDS.lat_min + (row + 0.5) * (AP_BOUNDS.lat_max - AP_BOUNDS.lat_min) / GRID_ROWS;
  const lng = AP_BOUNDS.lon_min + (col + 0.5) * (AP_BOUNDS.lon_max - AP_BOUNDS.lon_min) / GRID_COLS;
  return [lat, lng];
}

export function latLngToGrid(lat: number, lng: number): [number, number] {
  const row = Math.floor((lat - AP_BOUNDS.lat_min) / (AP_BOUNDS.lat_max - AP_BOUNDS.lat_min) * GRID_ROWS);
  const col = Math.floor((lng - AP_BOUNDS.lon_min) / (AP_BOUNDS.lon_max - AP_BOUNDS.lon_min) * GRID_COLS);
  return [
    Math.max(0, Math.min(GRID_ROWS - 1, row)),
    Math.max(0, Math.min(GRID_COLS - 1, col)),
  ];
}

export const AP_DISTRICTS = [
  "Srikakulam", "Vizianagaram", "Visakhapatnam", "East Godavari",
  "West Godavari", "Krishna", "Guntur", "Prakasam",
  "Sri Potti Sriramulu Nellore", "Kurnool", "Anantapur",
  "YSR Kadapa", "Chittoor",
];

export const DISTRICT_CENTERS: Record<string, [number, number]> = {
  "Srikakulam": [18.3, 83.9],
  "Vizianagaram": [18.1, 83.4],
  "Visakhapatnam": [17.7, 83.2],
  "East Godavari": [17.0, 82.1],
  "West Godavari": [16.7, 81.5],
  "Krishna": [16.2, 80.8],
  "Guntur": [16.3, 80.5],
  "Prakasam": [15.5, 79.9],
  "Sri Potti Sriramulu Nellore": [14.5, 79.9],
  "Kurnool": [15.8, 78.0],
  "Anantapur": [14.7, 77.6],
  "YSR Kadapa": [14.5, 78.8],
  "Chittoor": [13.2, 79.1],
};

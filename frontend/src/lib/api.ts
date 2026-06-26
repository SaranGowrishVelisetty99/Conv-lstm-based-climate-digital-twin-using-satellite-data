const isServer = typeof window === 'undefined';
const API_BASE = isServer
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  : '';

const api = {
  async get(url: string, opts?: { params?: Record<string, unknown> }) {
    const base = API_BASE || '';
    let fullUrl = `${base}${url}`;
    if (opts?.params) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(opts.params)) qs.set(k, String(v));
      fullUrl += `?${qs.toString()}`;
    }
    const res = await fetch(fullUrl);
    if (!res.ok) throw new Error(`${url} → ${res.status} ${res.statusText}`);
    return { data: await res.json() };
  },
  async post(url: string, body?: unknown, opts?: { params?: Record<string, unknown> }) {
    const base = API_BASE || '';
    let fullUrl = `${base}${url}`;
    if (opts?.params) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(opts.params)) qs.set(k, String(v));
      fullUrl += `?${qs.toString()}`;
    }
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${url} → ${res.status} ${res.statusText}`);
    return { data: await res.json() };
  },
};

export async function waitForBackend(
  maxRetries = 30,
  interval = 1000,
  onRetry?: (attempt: number) => void
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${API_BASE || ''}/api/health`);
      if (res.ok) return;
      onRetry?.(i + 1);
    } catch {
      onRetry?.(i + 1);
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error('Backend did not become available');
}

export interface ForecastDay {
  day: number;
  rainfall: number[][];
  max_temp: number[][];
  min_temp: number[][];
}

export interface RollingForecastResponse {
  location: string;
  start_date: string;
  forecasts: ForecastDay[];
}

export interface SinglePrediction {
  location: string;
  date: string;
  rainfall: number[][];
  max_temp: number[][];
  min_temp: number[][];
}

export interface ScenarioInfo {
  id: string;
  name: string;
  description: string;
}

export interface WhatIfRequest {
  temperature_delta: number;
  rainfall_delta: number;
  mode?: string;
  base_date?: string;
}

export interface ScenarioRunResponse {
  scenario: string;
  name?: string;
  description?: string;
  parameters: Record<string, number | string>;
  base_date: string;
  forecasts: ForecastDay[];
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
}

export interface HistoricalResponse {
  variable: string;
  lat: number;
  lon: number;
  data: HistoricalDataPoint[];
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  input_shape?: number[];
  output_shape?: number[];
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await api.get('/api/health');
  return res.data;
}

export async function getLatestForecast(): Promise<RollingForecastResponse> {
  const res = await api.get('/api/forecast/latest');
  return res.data;
}

export async function postWeatherForecast(): Promise<SinglePrediction> {
  const res = await api.post('/api/forecast/predict');
  return res.data;
}

export async function postRollingForecast(days = 7): Promise<RollingForecastResponse> {
  const res = await api.post('/api/forecast/rolling', null, { params: { days } });
  return res.data;
}

export async function getLatestData(): Promise<{
  date: string;
  rainfall: number[][];
  max_temp: number[][];
  min_temp: number[][];
}> {
  const res = await api.get('/api/data/latest');
  return res.data;
}

export async function getHistoricalData(
  variable: string,
  lat = 16.0,
  lon = 80.0,
  days = 30
): Promise<HistoricalResponse> {
  const res = await api.get('/api/data/historical', {
    params: { variable, lat, lon, days },
  });
  return res.data;
}

export async function listScenarios(): Promise<{ scenarios: ScenarioInfo[] }> {
  const res = await api.get('/api/simulation/scenarios');
  return res.data;
}

export async function runWhatIf(req: WhatIfRequest): Promise<ScenarioRunResponse> {
  const res = await api.post('/api/simulation/whatif', req);
  return res.data;
}

export async function runScenario(
  name: string,
  baseDate?: string
): Promise<ScenarioRunResponse> {
  const res = await api.post(`/api/simulation/scenario/${name}`, {
    base_date: baseDate || null,
  });
  return res.data;
}

export async function getValidationMetrics(): Promise<{
  metrics: { rmse: number; mae: number; bias: number; r_squared: number; n_samples: number };
}> {
  const res = await api.get('/api/validation/metrics');
  return res.data;
}

export async function getComparisonData(): Promise<{
  rainfall: { predicted: number[][]; observed: number[][] };
  max_temp: { predicted: number[][]; observed: number[][] };
  min_temp: { predicted: number[][]; observed: number[][] };
}> {
  const res = await api.get('/api/validation/compare');
  return res.data;
}



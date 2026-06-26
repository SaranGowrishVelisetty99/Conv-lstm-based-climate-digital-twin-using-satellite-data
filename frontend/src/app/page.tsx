'use client';

import { useEffect, useState, useCallback } from 'react';
import { getLatestForecast, getLatestData, getHealth, waitForBackend, type RollingForecastResponse, type ForecastDay } from '@/lib/api';
import { useSimulation } from '@/hooks/useSimulation';
import WeatherMap from '@/components/WeatherMap';
import StatsCard from '@/components/StatsCard';
import VariableSelector from '@/components/VariableSelector';
import TimeSlider from '@/components/TimeSlider';
import ScenarioPanel from '@/components/ScenarioPanel';

const VARIABLES = [
  { id: 'rainfall', label: 'Rainfall', unit: 'mm/day' },
  { id: 'max_temp', label: 'Max Temp', unit: '°C' },
  { id: 'min_temp', label: 'Min Temp', unit: '°C' },
];

function avg(data: number[][]) {
  const flat = data.flat();
  return flat.reduce((a, b) => a + b, 0) / flat.length;
}

function SectionDivider({ label, emoji }: { label: string; emoji?: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      {emoji && <span className="text-xs">{emoji}</span>}
      <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
    </div>
  );
}

export default function Dashboard() {
  const [forecast, setForecast] = useState<RollingForecastResponse | null>(null);
  const [baseline, setBaseline] = useState<{ rainfall: number[][]; max_temp: number[][]; min_temp: number[][] } | null>(null);
  const [variable, setVariable] = useState('rainfall');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [health, setHealth] = useState<{ status: string; model_loaded: boolean } | null>(null);

  const {
    result: simResult, baseline: simBaseline, scenarios, loading: simLoading, error: simError,
    loadScenarios, fetchBaseline: simFetchBaseline, runCustomSimulation, runNamedScenario,
  } = useSimulation();

  const [simViewMode, setSimViewMode] = useState<'baseline' | 'perturbed' | 'difference'>('perturbed');

  useEffect(() => {
    let mounted = true;
    waitForBackend()
      .then(() => Promise.all([getLatestForecast(), getLatestData(), getHealth()]))
      .then(([f, d, h]) => {
        if (!mounted) return;
        setForecast(f); setBaseline(d); setHealth(h);
      }).catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'Failed to load data');
      }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => { loadScenarios(); simFetchBaseline(); }, [loadScenarios, simFetchBaseline]);

  const todayData = baseline ? { rainfall: avg(baseline.rainfall), max_temp: avg(baseline.max_temp), min_temp: avg(baseline.min_temp) } : null;
  const currentDay: ForecastDay | null = forecast?.forecasts?.[activeDay] ?? null;

  const getGrid = () => {
    if (!baseline && !forecast) return null;
    const src = baseline ?? forecast?.forecasts?.[0] ?? null;
    if (!src) return null;
    return variable === 'rainfall' ? src.rainfall : variable === 'max_temp' ? src.max_temp : src.min_temp;
  };

  const getForecastGrid = () => {
    if (!currentDay) return getGrid();
    return variable === 'rainfall' ? currentDay.rainfall : variable === 'max_temp' ? currentDay.max_temp : currentDay.min_temp;
  };

  const getSimGrid = () => {
    const src = simViewMode === 'baseline' ? simBaseline : simResult;
    if (!src?.forecasts?.[0]) return null;
    const d = src.forecasts[0];
    return variable === 'rainfall' ? d.rainfall : variable === 'max_temp' ? d.max_temp : d.min_temp;
  };

  const computeDiffGrid = () => {
    if (!simResult?.forecasts?.[0] || !simBaseline?.forecasts?.[0]) return null;
    const p = variable === 'rainfall' ? simResult.forecasts[0].rainfall : variable === 'max_temp' ? simResult.forecasts[0].max_temp : simResult.forecasts[0].min_temp;
    const base = variable === 'rainfall' ? simBaseline.forecasts[0].rainfall : variable === 'max_temp' ? simBaseline.forecasts[0].max_temp : simBaseline.forecasts[0].min_temp;
    return p.map((row, i) => row.map((val, j) => val - base[i][j]));
  };

  const simResultAvg = simResult?.forecasts?.[0]
    ? avg(variable === 'rainfall' ? simResult.forecasts[0].rainfall : variable === 'max_temp' ? simResult.forecasts[0].max_temp : simResult.forecasts[0].min_temp)
    : 0;
  const baseAvg = simBaseline?.forecasts?.[0] ? avg(variable === 'rainfall' ? simBaseline.forecasts[0].rainfall : variable === 'max_temp' ? simBaseline.forecasts[0].max_temp : simBaseline.forecasts[0].min_temp) : 0;

  const handleCustom = useCallback((td: number, rd: number) => {
    runCustomSimulation({ temperature_delta: td, rainfall_delta: rd, mode: 'uniform' });
  }, [runCustomSimulation]);

  const handleScenario = useCallback((name: string) => {
    runNamedScenario(name);
  }, [runNamedScenario]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-lg">Loading climate data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-red-400 text-lg font-medium">Connection Error</p>
          <p className="text-slate-400 text-sm">{error}</p>
          <p className="text-slate-500 text-xs mt-2">
            Make sure the backend is running: <code className="bg-slate-800 px-2 py-0.5 rounded">python -m uvicorn backend.main:app --port 8000</code>
          </p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-medium text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div id="overview" className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Andhra Pradesh Climate Twin</h1>
          <p className="text-slate-400 text-xs mt-0.5">ConvLSTM-based predictions at 24×32 km grid resolution</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${health?.model_loaded ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm' : 'bg-red-400'}`} />
          <span className="text-slate-500">{health?.model_loaded ? 'Model Online' : 'Offline'}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">7-day rolling</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-1">
        <StatsCard title="Rainfall Today" value={todayData ? `${todayData.rainfall.toFixed(1)} mm` : '—'} subtitle="Observed average" icon="🌧" color="cyan" />
        <StatsCard title="Max Temp" value={todayData ? `${todayData.max_temp.toFixed(1)}°C` : '—'} subtitle="Observed average" icon="☀" color="amber" />
        <StatsCard title="Min Temp" value={todayData ? `${todayData.min_temp.toFixed(1)}°C` : '—'} subtitle="Observed average" icon="🌙" color="violet" />
        <StatsCard title="D+1 Forecast" value={currentDay ? `${avg(variable === 'rainfall' ? currentDay.rainfall : variable === 'max_temp' ? currentDay.max_temp : currentDay.min_temp).toFixed(1)} ${variable === 'rainfall' ? 'mm' : '°C'}` : '—'} subtitle={`${VARIABLES.find(v => v.id === variable)?.label}`} icon="📈" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="bg-slate-900 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>🌤</span>
              <span>Weather Watch</span>
            </h2>
            <VariableSelector variables={VARIABLES} active={variable} onChange={setVariable} />
          </div>
          <WeatherMap data={getGrid()} variable={variable} title="Current Conditions" />
        </div>

        <div id="forecast" className="bg-slate-900 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>📅</span>
              <span>D+{activeDay + 1} Forecast</span>
            </h2>
            <VariableSelector variables={VARIABLES} active={variable} onChange={setVariable} />
          </div>
          <WeatherMap data={getForecastGrid()} variable={variable} title={`D+${activeDay + 1}`} />
          <div className="px-3 pb-2 pt-1">
            <TimeSlider days={forecast?.forecasts?.length ?? 7} activeDay={activeDay} onChange={setActiveDay} />
          </div>
        </div>
      </div>

      <SectionDivider label="What-If Simulation" emoji="🔮" />
      <div id="simulation" className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="bg-slate-900 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <div className="flex gap-1">
              {(['baseline', 'perturbed', 'difference'] as const).map((mode) => (
                <button key={mode} onClick={() => setSimViewMode(mode)}
                  className={`px-2.5 py-1 text-[10px] rounded-lg font-bold transition-all duration-200 ${simViewMode === mode ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                  {mode === 'baseline' ? '📊 Normal' : mode === 'perturbed' ? '🔮 Changed' : '⚖️ Difference'}
                </button>
              ))}
              <VariableSelector variables={VARIABLES} active={variable} onChange={setVariable} />
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              {simResult && (
                <span className="text-slate-400">
                  Δ: <span className={simResultAvg - baseAvg > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {(simResultAvg - baseAvg > 0 ? '+' : '')}{(simResultAvg - baseAvg).toFixed(2)}
                  </span>
                </span>
              )}
            </div>
          </div>
          {simLoading ? (
            <div className="flex items-center justify-center" style={{ height: 'calc(100% - 32px)' }}>
              <div className="text-center space-y-2">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-xs">Running simulation...</p>
              </div>
            </div>
          ) : (
            <WeatherMap data={simViewMode === 'difference' ? computeDiffGrid() : getSimGrid()} variable={variable} title={simViewMode === 'difference' ? 'Change vs Baseline' : 'Simulation Output'} />
          )}
          {simError && <p className="text-red-400 text-[10px] px-3 pb-1">{simError}</p>}
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-800">
          <ScenarioPanel scenarios={scenarios} onRunCustom={handleCustom} onRunScenario={handleScenario} loading={simLoading} />
        </div>
      </div>

      <div className="h-2" />
    </div>
  );
}

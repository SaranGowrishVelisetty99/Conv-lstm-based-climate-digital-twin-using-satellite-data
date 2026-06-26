'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import WeatherMap from '@/components/WeatherMap';
import ScenarioPanel from '@/components/ScenarioPanel';
import StatsCard from '@/components/StatsCard';
import VariableSelector from '@/components/VariableSelector';

const VARIABLES = [
  { id: 'rainfall', label: 'Rainfall', unit: 'mm/day' },
  { id: 'max_temp', label: 'Max Temp', unit: '°C' },
  { id: 'min_temp', label: 'Min Temp', unit: '°C' },
];

export default function SimulationPage() {
  const {
    result, baseline, scenarios, loading, error,
    loadScenarios, fetchBaseline, runCustomSimulation, runNamedScenario,
  } = useSimulation();

  const [variable, setVariable] = useState('rainfall');
  const [viewMode, setViewMode] = useState<'baseline' | 'perturbed' | 'difference'>('perturbed');

  useEffect(() => { loadScenarios(); fetchBaseline(); }, [loadScenarios, fetchBaseline]);

  const handleCustom = useCallback((tempDelta: number, rainDelta: number) => {
    runCustomSimulation({ temperature_delta: tempDelta, rainfall_delta: rainDelta, mode: 'uniform' });
  }, [runCustomSimulation]);

  const handleScenario = useCallback((name: string) => {
    runNamedScenario(name);
  }, [runNamedScenario]);

  const getActiveGrid = () => {
    const src = viewMode === 'baseline' ? baseline : result;
    if (!src?.forecasts?.[0]) return null;
    const d = src.forecasts[0];
    return variable === 'rainfall' ? d.rainfall : variable === 'max_temp' ? d.max_temp : d.min_temp;
  };

  const computeDiffGrid = () => {
    if (!baseline?.forecasts?.[0] || !result?.forecasts?.[0]) return null;
    const base = baseline.forecasts[0];
    const pert = result.forecasts[0];
    const get = (d: typeof base, v: string) => v === 'rainfall' ? d.rainfall : v === 'max_temp' ? d.max_temp : d.min_temp;
    const b = get(base, variable);
    const p = get(pert, variable);
    return b.map((row, i) => row.map((val, j) => p[i][j] - val));
  };

  const avg = (d: number[][] | null) => {
    if (!d) return 0;
    const flat = d.flat();
    return flat.reduce((a, b) => a + b, 0) / flat.length;
  };

  const resultAvg = result?.forecasts?.[0]
    ? (variable === 'rainfall' ? avg(result.forecasts[0].rainfall) :
       variable === 'max_temp' ? avg(result.forecasts[0].max_temp) :
       avg(result.forecasts[0].min_temp))
    : 0;

  const baseAvg = baseline?.forecasts?.[0]
    ? (variable === 'rainfall' ? avg(baseline.forecasts[0].rainfall) :
       variable === 'max_temp' ? avg(baseline.forecasts[0].max_temp) :
       avg(baseline.forecasts[0].min_temp))
    : 0;

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">🔮 What-If Simulation</h1>
        <p className="text-slate-400 text-xs mt-0.5">See how climate changes affect Andhra Pradesh — tweak temperature & rainfall to explore scenarios</p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-800/50 rounded-lg px-3 py-2 text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5">
        <StatsCard title="Baseline Avg" value={baseAvg ? `${baseAvg.toFixed(1)} ${variable === 'rainfall' ? 'mm' : '°C'}` : '—'} subtitle="Unperturbed forecast" icon="📊" color="cyan" />
        <StatsCard title="Perturbed Avg" value={resultAvg ? `${resultAvg.toFixed(1)} ${variable === 'rainfall' ? 'mm' : '°C'}` : '—'} subtitle={result?.scenario === 'custom' ? 'Custom Δ' : result?.name ?? 'Run a scenario'} icon="⚡" color={result ? 'amber' : 'cyan'} />
        <StatsCard title="Net Change" value={result ? `${(resultAvg - baseAvg).toFixed(2)} ${variable === 'rainfall' ? 'mm' : '°C'}` : '—'} subtitle={result ? (resultAvg - baseAvg > 0 ? 'Increase ↑' : 'Decrease ↓') : 'Run a scenario'} icon="↗" color={result ? (resultAvg - baseAvg > 0 ? 'rose' : 'emerald') : 'cyan'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2 bg-slate-900 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <div className="flex gap-1">
              {(['baseline', 'perturbed', 'difference'] as const).map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`px-2.5 py-1 text-[10px] rounded-lg font-bold transition-all duration-200 ${viewMode === mode ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                  {mode === 'baseline' ? '📊 Normal' : mode === 'perturbed' ? '🔮 Changed' : '⚖️ Difference'}
                </button>
              ))}
            </div>
            <VariableSelector variables={VARIABLES} active={variable} onChange={setVariable} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center" style={{ height: 'calc(100% - 32px)' }}>
              <div className="text-center space-y-2">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-xs">Running simulation...</p>
              </div>
            </div>
          ) : (
            <WeatherMap
              data={viewMode === 'difference' ? computeDiffGrid() : getActiveGrid()}
              variable={variable}
              title={viewMode === 'baseline' ? 'Baseline' : viewMode === 'perturbed' ? 'Perturbed' : 'Change (Perturbed − Baseline)'}
            />
          )}
        </div>

        <div className="bg-slate-900 rounded-lg border border-slate-800">
          <ScenarioPanel scenarios={scenarios} onRunCustom={handleCustom} onRunScenario={handleScenario} loading={loading} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { getValidationMetrics, getComparisonData, waitForBackend } from '@/lib/api';
import MetricsChart from '@/components/MetricsChart';
import StatsCard from '@/components/StatsCard';
import WeatherMap from '@/components/WeatherMap';
import VariableSelector from '@/components/VariableSelector';

const VARIABLES = [
  { id: 'rainfall', label: 'Rainfall', unit: 'mm/day' },
  { id: 'max_temp', label: 'Max Temp', unit: '°C' },
  { id: 'min_temp', label: 'Min Temp', unit: '°C' },
];

export default function ValidationPage() {
  const [metrics, setMetrics] = useState<{
    rmse: number; mae: number; bias: number; r_squared: number; n_samples: number;
  } | null>(null);
  const [comparison, setComparison] = useState<{
    predicted: number[][]; observed: number[][];
  } | null>(null);
  const [variable, setVariable] = useState('rainfall');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    waitForBackend()
      .then(() => Promise.all([
        getValidationMetrics(),
        getComparisonData(),
      ]))
      .then(([m, c]) => {
        setMetrics(m.metrics);
        const key = variable as 'rainfall' | 'max_temp' | 'min_temp';
        setComparison({ predicted: c[key].predicted, observed: c[key].observed });
      }).catch((e: Error) => {
        setError(e.message || 'Failed to load validation data');
      }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [variable]);

  const scatterData = comparison
    ? comparison.predicted.flat().slice(0, 500).map((p, i) => ({
        label: String(i),
        predicted: p,
        observed: comparison.observed.flat().slice(0, 500)[i] ?? 0,
      }))
    : [];

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-lg">Computing validation metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg font-medium">Validation Error</p>
          <p className="text-slate-400 text-sm">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-medium text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">✅ Model Validation</h1>
        <p className="text-slate-400 text-xs mt-0.5">How accurate are our predictions? Compare AI forecasts against real observations</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <StatsCard title="RMSE" value={metrics ? metrics.rmse.toFixed(3) : '—'} subtitle="Lower is better" icon="✓" color={metrics && metrics.rmse < 10 ? 'emerald' : 'amber'} />
        <StatsCard title="MAE" value={metrics ? metrics.mae.toFixed(3) : '—'} subtitle="Mean absolute error" icon="✓" color="cyan" />
        <StatsCard title="R² Score" value={metrics ? metrics.r_squared.toFixed(3) : '—'} subtitle="Closer to 1 is better" icon="↗" color={metrics && metrics.r_squared > 0.5 ? 'emerald' : 'amber'} />
        <StatsCard title="Bias" value={metrics ? metrics.bias.toFixed(3) : '—'} subtitle="Systematic offset" icon="⚖" color="violet" />
      </div>

      <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">🎯 Predicted vs Observed</h2>
          <VariableSelector variables={VARIABLES} active={variable} onChange={setVariable} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-white font-bold mb-2 flex items-center gap-1.5">🤖 AI Prediction</h3>
            <WeatherMap data={comparison?.predicted ?? null} variable={variable} height={300} />
          </div>
          <div>
            <h3 className="text-sm text-white font-bold mb-2 flex items-center gap-1.5">📡 Real Observation</h3>
            <WeatherMap data={comparison?.observed ?? null} variable={variable} height={300} />
          </div>
        </div>
      </div>

      <MetricsChart type="line" data={scatterData.slice(0, 100)} xKey="label"
        lines={[{ key: 'predicted', color: '#06b6d4', name: 'Predicted' }, { key: 'observed', color: '#f59e0b', name: 'Observed' }]}
        title="Predicted vs Observed (Sample Points)" height={300} />
    </div>
  );
}

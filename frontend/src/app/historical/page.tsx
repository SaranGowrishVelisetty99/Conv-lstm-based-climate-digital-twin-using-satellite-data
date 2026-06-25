'use client';

import { useEffect, useState } from 'react';
import { getHistoricalData, type HistoricalResponse } from '@/lib/api';
import MetricsChart from '@/components/MetricsChart';
import StatsCard from '@/components/StatsCard';
import VariableSelector from '@/components/VariableSelector';
import { AP_BOUNDS } from '@/lib/geo';

const VARIABLES = [
  { id: 'rainfall', label: 'Rainfall', unit: 'mm/day' },
  { id: 'max_temp', label: 'Max Temp', unit: '°C' },
  { id: 'min_temp', label: 'Min Temp', unit: '°C' },
];

export default function HistoricalPage() {
  const [variable, setVariable] = useState('rainfall');
  const [data, setData] = useState<HistoricalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState(16.0);
  const [lon, setLon] = useState(80.0);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getHistoricalData(variable, lat, lon, 60)
      .then(setData)
      .catch((e: Error) => setError(e.message || 'Failed to load historical data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [variable, lat, lon]);

  const chartData = data?.data.map((d) => ({ label: d.date.slice(5), value: d.value })) ?? [];

  const avg = data?.data.length ? (data.data.reduce((s, d) => s + d.value, 0) / data.data.length).toFixed(1) : '—';
  const max = data?.data.length ? Math.max(...data.data.map((d) => d.value)).toFixed(1) : '—';
  const min = data?.data.length ? Math.min(...data.data.map((d) => d.value)).toFixed(1) : '—';

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-lg">Loading historical data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg font-medium">Data Error</p>
          <p className="text-slate-400 text-sm">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-white font-medium text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Historical Data Explorer</h1>
        <p className="text-slate-400 text-sm mt-1">Browse past observations from IMD gridded datasets</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="60-Day Avg" value={`${avg} ${variable === 'rainfall' ? 'mm' : '°C'}`} subtitle={variable} icon="📊" color="cyan" />
        <StatsCard title="Maximum" value={`${max} ${variable === 'rainfall' ? 'mm' : '°C'}`} subtitle="Peak value" icon="▲" color="rose" />
        <StatsCard title="Minimum" value={`${min} ${variable === 'rainfall' ? 'mm' : '°C'}`} subtitle="Lowest value" icon="▼" color="emerald" />
      </div>

      <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Location & Variable</h2>
          <VariableSelector variables={VARIABLES} active={variable} onChange={setVariable} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Latitude ({AP_BOUNDS.lat_min} – {AP_BOUNDS.lat_max})</label>
            <input type="number" min={AP_BOUNDS.lat_min} max={AP_BOUNDS.lat_max} step="0.1" value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value))}
              className="bg-slate-800 text-white px-3 py-1.5 rounded-lg w-full border border-slate-700" />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Longitude ({AP_BOUNDS.lon_min} – {AP_BOUNDS.lon_max})</label>
            <input type="number" min={AP_BOUNDS.lon_min} max={AP_BOUNDS.lon_max} step="0.1" value={lon}
              onChange={(e) => setLon(parseFloat(e.target.value))}
              className="bg-slate-800 text-white px-3 py-1.5 rounded-lg w-full border border-slate-700" />
          </div>
        </div>
      </div>

      <MetricsChart type="line" data={chartData} xKey="label"
        lines={[{ key: 'value', color: '#06b6d4', name: VARIABLES.find(v => v.id === variable)?.label ?? variable }]}
        title={`60-Day ${VARIABLES.find(v => v.id === variable)?.label} Time Series`} height={300} />
    </div>
  );
}

'use client';

import { useForecast } from '@/hooks/useForecast';
import WeatherMap from '@/components/WeatherMap';
import VariableSelector from '@/components/VariableSelector';
import TimeSlider from '@/components/TimeSlider';
import ForecastPanel from '@/components/ForecastPanel';
import StatsCard from '@/components/StatsCard';
import { useState } from 'react';

const VARIABLES = [
  { id: 'rainfall', label: 'Rainfall', unit: 'mm/day' },
  { id: 'max_temp', label: 'Max Temp', unit: '°C' },
  { id: 'min_temp', label: 'Min Temp', unit: '°C' },
];

export default function ForecastPage() {
  const { forecast, baseline, loading, error, activeDay, setActiveDay, currentDay, refetch } = useForecast();
  const [variable, setVariable] = useState('rainfall');

  const getGrid = () => {
    if (activeDay === -1 && baseline) {
      return variable === 'rainfall' ? baseline.rainfall : variable === 'max_temp' ? baseline.max_temp : baseline.min_temp;
    }
    if (!currentDay) return null;
    return variable === 'rainfall' ? currentDay.rainfall : variable === 'max_temp' ? currentDay.max_temp : currentDay.min_temp;
  };

  const range = (() => {
    const grid = getGrid();
    if (!grid) return { min: 0, max: 100 };
    const flat = grid.flat();
    return { min: Math.min(...flat), max: Math.max(...flat) };
  })();

  if (loading && !forecast) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-lg">Generating 7-day forecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg font-medium">Forecast Error</p>
          <p className="text-slate-400 text-sm">{error}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-medium text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-lg font-bold text-white">7-Day Forecast</h1>
        <p className="text-slate-400 text-[10px] mt-0.5">ConvLSTM-based rolling predictions for Andhra Pradesh</p>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <StatsCard title="Forecast Days" value={forecast?.forecasts?.length ?? 0} subtitle="Rolling auto-regressive" icon="📅" color="cyan" />
        <StatsCard title="Resolution" value="24×32 km" subtitle="Grid cells" icon="🗺" color="violet" />
        <StatsCard title="Active Day" value={`D+${activeDay + 1}`} subtitle={variable === 'rainfall' ? `${range.min.toFixed(1)}–${range.max.toFixed(1)} mm` : `${range.min.toFixed(1)}–${range.max.toFixed(1)}°C`} icon="📍" color="amber" />
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <h2 className="text-xs font-semibold text-white">
            {activeDay === -1 ? 'Baseline' : `Day +${activeDay + 1}`}
          </h2>
          <VariableSelector variables={VARIABLES} active={variable} onChange={setVariable} />
        </div>
        <WeatherMap data={getGrid()} variable={variable} title={`${VARIABLES.find(v => v.id === variable)?.label} — D+${activeDay + 1}`} />
        <div className="px-3 pb-2 pt-1">
          <TimeSlider days={forecast?.forecasts?.length ?? 7} activeDay={activeDay} onChange={setActiveDay} />
        </div>
      </div>

      {forecast?.forecasts && (
        <ForecastPanel forecasts={forecast.forecasts} activeDay={activeDay} variable={variable} />
      )}
    </div>
  );
}

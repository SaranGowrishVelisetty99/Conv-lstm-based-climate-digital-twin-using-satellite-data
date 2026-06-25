'use client';

import { ForecastDay } from '@/lib/api';

interface ForecastPanelProps {
  forecasts: ForecastDay[];
  activeDay: number;
  variable: string;
}

export default function ForecastPanel({
  forecasts,
  activeDay,
  variable,
}: ForecastPanelProps) {
  const varLabel = variable === 'rainfall' ? 'Rainfall' : variable === 'max_temp' ? 'Max Temp' : 'Min Temp';

  const computeStats = (day: ForecastDay) => {
    const data =
      variable === 'rainfall'
        ? day.rainfall
        : variable === 'max_temp'
        ? day.max_temp
        : day.min_temp;
    const flat = data.flat();
    return {
      min: Math.min(...flat).toFixed(1),
      max: Math.max(...flat).toFixed(1),
      avg: (flat.reduce((a, b) => a + b, 0) / flat.length).toFixed(1),
    };
  };

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold text-white uppercase tracking-wider">7-Day {varLabel} Forecast</h3>
      <div className="grid grid-cols-7 gap-1">
        {forecasts.map((day, idx) => {
          const stats = computeStats(day);
          const selected = idx === activeDay;
          return (
            <div
              key={day.day}
              className={`p-1 rounded text-center text-[10px] ${
                selected ? 'bg-cyan-600 text-white ring-1 ring-cyan-300' : 'bg-slate-700 text-slate-200'
              }`}
            >
              <div className="font-medium">D+{day.day}</div>
              <div className="opacity-60">{stats.avg}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

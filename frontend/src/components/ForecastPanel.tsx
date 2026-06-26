'use client';

import { ForecastDay } from '@/lib/api';

interface ForecastPanelProps {
  forecasts: ForecastDay[];
  activeDay: number;
  variable: string;
}

const VAR_META: Record<string, { emoji: string; label: string; unit: string }> = {
  rainfall: { emoji: '\uD83C\uDF27\uFE0F', label: 'Rainfall', unit: 'mm' },
  max_temp: { emoji: '\uD83D\uDD25', label: 'Max Temp', unit: '\u00B0C' },
  min_temp: { emoji: '\u2744\uFE0F', label: 'Min Temp', unit: '\u00B0C' },
};

function getBarColor(val: number, variable: string): string {
  if (variable === 'rainfall') {
    if (val > 20) return 'bg-cyan-400';
    if (val > 10) return 'bg-cyan-500';
    if (val > 5) return 'bg-cyan-600';
    return 'bg-cyan-700/50';
  }
  if (variable === 'max_temp') {
    if (val > 40) return 'bg-red-400';
    if (val > 35) return 'bg-orange-400';
    if (val > 30) return 'bg-amber-400';
    if (val > 25) return 'bg-yellow-400';
    return 'bg-blue-400';
  }
  if (val > 25) return 'bg-amber-400';
  if (val > 20) return 'bg-yellow-400';
  if (val > 15) return 'bg-blue-400';
  return 'bg-blue-600';
}

export default function ForecastPanel({
  forecasts,
  activeDay,
  variable,
}: ForecastPanelProps) {
  const meta = VAR_META[variable] ?? VAR_META.rainfall;
  const isRain = variable === 'rainfall';

  const computeStats = (day: ForecastDay) => {
    const data =
      variable === 'rainfall'
        ? day.rainfall
        : variable === 'max_temp'
        ? day.max_temp
        : day.min_temp;
    const flat = data.flat();
    const avg = flat.reduce((a, b) => a + b, 0) / flat.length;
    return {
      min: Math.min(...flat),
      max: Math.max(...flat),
      avg,
    };
  };

  const allAvgs = forecasts.map((d) => computeStats(d).avg);
  const maxAvg = Math.max(...allAvgs) || 1;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
        <span>{meta.emoji}</span>
        <span>7-Day {meta.label}</span>
      </h3>
      <div className="grid grid-cols-7 gap-1.5">
        {forecasts.map((day, idx) => {
          const stats = computeStats(day);
          const selected = idx === activeDay;
          const barH = Math.max(8, (stats.avg / maxAvg) * 60);
          const barColor = getBarColor(stats.avg, variable);
          return (
            <div
              key={day.day}
              className={`rounded-xl overflow-hidden transition-all duration-200 ${
                selected
                  ? 'bg-cyan-600/20 ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              <div className="p-1.5 text-center">
                <div className="text-[10px] font-bold text-white">D+{day.day}</div>
                <div className="flex items-end justify-center gap-0.5 h-16 mt-1">
                  <div
                    className={`w-4 rounded-t-sm ${barColor} transition-all duration-300`}
                    style={{ height: `${barH}px`, minHeight: '4px' }}
                  />
                </div>
                <div className="text-[11px] font-extrabold text-white mt-1">
                  {stats.avg.toFixed(1)}
                </div>
                <div className="text-[8px] text-slate-400">
                  {stats.min.toFixed(1)}–{stats.max.toFixed(1)} {meta.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

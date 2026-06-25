'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimeSliderProps {
  days: number;
  activeDay: number;
  onChange: (day: number) => void;
  labels?: string[];
}

export default function TimeSlider({
  days,
  activeDay,
  onChange,
  labels,
}: TimeSliderProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      <button
        onClick={() => onChange(Math.max(0, activeDay - 1))}
        disabled={activeDay === 0}
        className="p-1 rounded bg-slate-700 text-white disabled:opacity-30 hover:bg-slate-600"
      >
        <ChevronLeft size={14} />
      </button>
      <div className="flex-1 flex items-center gap-0.5">
        {Array.from({ length: days }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
              i === activeDay
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {labels?.[i] ?? `D+${i + 1}`}
          </button>
        ))}
      </div>
      <button
        onClick={() => onChange(Math.min(days - 1, activeDay + 1))}
        disabled={activeDay === days - 1}
        className="p-1 rounded bg-slate-700 text-white disabled:opacity-30 hover:bg-slate-600"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

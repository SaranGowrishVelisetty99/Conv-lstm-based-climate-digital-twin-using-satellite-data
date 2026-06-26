'use client';

import { useState } from 'react';
import { ScenarioInfo } from '@/lib/api';

interface ScenarioPanelProps {
  scenarios: ScenarioInfo[];
  onRunCustom: (tempDelta: number, rainDelta: number) => void;
  onRunScenario: (name: string) => void;
  loading: boolean;
}

export default function ScenarioPanel({
  scenarios,
  onRunCustom,
  onRunScenario,
  loading,
}: ScenarioPanelProps) {
  const [tempDelta, setTempDelta] = useState(0);
  const [rainDelta, setRainDelta] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState('');

  return (
    <div className="p-2 space-y-2">
      <div>
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-1.5">Scenarios</h3>
        <div className="grid grid-cols-2 gap-1">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedScenario(s.id);
                onRunScenario(s.id);
              }}
              className={`p-1.5 rounded text-left text-xs transition-colors ${
                selectedScenario === s.id
                  ? 'bg-cyan-600 text-white ring-1 ring-cyan-300'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              <div className="font-medium leading-tight">{s.name}</div>
              <div className="opacity-70 leading-tight mt-0.5">{s.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-700 pt-1.5">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-1.5">Custom</h3>
        <div className="space-y-1.5">
          <div>
            <label className="text-xs text-slate-300 block mb-0.5">
              Temp: <span className="text-cyan-400 font-bold">{tempDelta > 0 ? '+' : ''}{tempDelta}°C</span>
            </label>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.5"
              value={tempDelta}
              onChange={(e) => setTempDelta(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-3"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-5°C</span><span>+5°C</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-300 block mb-0.5">
              Rain: <span className="text-cyan-400 font-bold">{rainDelta > 0 ? '+' : ''}{rainDelta * 100}%</span>
            </label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={rainDelta}
              onChange={(e) => setRainDelta(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-3"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-100%</span><span>+100%</span>
            </div>
          </div>
          <button
            onClick={() => onRunCustom(tempDelta, rainDelta)}
            disabled={loading}
            className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-medium rounded text-xs transition-colors"
          >
            {loading ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>
    </div>
  );
}

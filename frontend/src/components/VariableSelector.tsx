'use client';

const VAR_ICONS: Record<string, string> = {
  rainfall: '\uD83C\uDF27\uFE0F',
  max_temp: '\uD83D\uDD25',
  min_temp: '\u2744\uFE0F',
};

interface VariableSelectorProps {
  variables: { id: string; label: string; unit: string }[];
  active: string;
  onChange: (v: string) => void;
}

export default function VariableSelector({
  variables,
  active,
  onChange,
}: VariableSelectorProps) {
  return (
    <div className="flex gap-1">
      {variables.map((v) => {
        const isActive = active === v.id;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-all duration-200 flex items-center gap-1 ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600 hover:text-white border border-slate-600/50'
            }`}
          >
            <span>{VAR_ICONS[v.id] ?? ''}</span>
            <span>{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}

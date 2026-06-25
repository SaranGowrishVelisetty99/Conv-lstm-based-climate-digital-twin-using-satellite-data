'use client';

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
      {variables.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
            active === v.id
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

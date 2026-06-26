'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: 'cyan' | 'amber' | 'emerald' | 'rose' | 'violet';
}

const colorMap: Record<string, { border: string; bg: string; bar: string; text: string }> = {
  cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/8', bar: 'bg-cyan-400', text: 'text-cyan-300' },
  amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/8', bar: 'bg-amber-400', text: 'text-amber-300' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/8', bar: 'bg-emerald-400', text: 'text-emerald-300' },
  rose: { border: 'border-rose-500/30', bg: 'bg-rose-500/8', bar: 'bg-rose-400', text: 'text-rose-300' },
  violet: { border: 'border-violet-500/30', bg: 'bg-violet-500/8', bar: 'bg-violet-400', text: 'text-violet-300' },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'cyan',
}: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden relative`}>
      <div className={`h-0.5 w-full ${c.bar} opacity-60`} />
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium truncate">{title}</p>
            <p className="text-base font-extrabold text-white truncate mt-0.5 tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{subtitle}</p>
            )}
          </div>
          {icon && <span className="text-base opacity-70 shrink-0 mt-0.5">{icon}</span>}
        </div>
      </div>
    </div>
  );
}

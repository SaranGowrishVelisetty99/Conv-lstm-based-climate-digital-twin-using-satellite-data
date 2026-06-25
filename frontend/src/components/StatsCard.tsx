'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: 'cyan' | 'amber' | 'emerald' | 'rose' | 'violet';
}

const colorMap = {
  cyan: 'border-cyan-500 bg-cyan-500/10',
  amber: 'border-amber-500 bg-amber-500/10',
  emerald: 'border-emerald-500 bg-emerald-500/10',
  rose: 'border-rose-500 bg-rose-500/10',
  violet: 'border-violet-500 bg-violet-500/10',
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'cyan',
}: StatsCardProps) {
  return (
    <div className={`rounded-lg border ${colorMap[color]} p-2`}>
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="text-[9px] text-slate-400 uppercase tracking-wider truncate">{title}</p>
          <p className="text-sm font-bold text-white truncate">{value}</p>
          {subtitle && (
            <p className="text-[9px] text-slate-500 truncate leading-tight">{subtitle}</p>
          )}
        </div>
        {icon && <span className="text-sm opacity-60 shrink-0 mt-0.5">{icon}</span>}
      </div>
    </div>
  );
}

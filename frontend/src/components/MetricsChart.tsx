'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MetricsChartProps {
  type: 'line' | 'bar';
  data: { label: string; value?: number; predicted?: number; observed?: number }[];
  xKey: string;
  yKey?: string;
  lines?: { key: string; color: string; name: string }[];
  bars?: { key: string; color: string; name: string }[];
  title?: string;
  height?: number;
}

export default function MetricsChart({
  type,
  data,
  xKey,
  lines,
  bars,
  title,
  height = 250,
}: MetricsChartProps) {
  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #475569',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '12px',
    padding: '8px 12px',
  };

  return (
    <div className="bg-slate-800/80 rounded-xl border border-slate-700/30 p-4 shadow-lg">
      {title && <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">📊 {title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' && lines ? (
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xKey} stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            {lines.map((l) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                stroke={l.color}
                name={l.name}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        ) : bars ? (
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xKey} stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            {bars.map((b) => (
              <Bar key={b.key} dataKey={b.key} fill={b.color} name={b.name} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        ) : null}
      </ResponsiveContainer>
    </div>
  );
}

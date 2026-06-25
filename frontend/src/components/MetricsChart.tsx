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
  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      {title && <h4 className="text-sm font-medium text-white mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' && lines ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xKey} stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            {lines.map((l) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                stroke={l.color}
                name={l.name}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xKey} stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            {bars?.map((b) => (
              <Bar key={b.key} dataKey={b.key} fill={b.color} name={b.name} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

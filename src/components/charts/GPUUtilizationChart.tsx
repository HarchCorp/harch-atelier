'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface GPUData {
  hour: string;
  casablanca: number;
  dakhla: number;
  marrakech: number;
  tangier: number;
  oujda: number;
}

interface HubConfig {
  name: keyof GPUData;
  color: string;
}

const hubs: HubConfig[] = [
  { name: 'casablanca', color: '#8B9DAF' },
  { name: 'dakhla', color: '#6B9F6B' },
  { name: 'marrakech', color: '#4A5D6E' },
  { name: 'tangier', color: '#A0524B' },
  { name: 'oujda', color: '#666666' },
];

function generateData(): GPUData[] {
  const data: GPUData[] = [];
  for (let h = 0; h < 24; h++) {
    const hour = `${h.toString().padStart(2, '0')}:00`;
    // Sine wave patterns with different phases and amplitudes per hub
    const base = 40;
    const casablanca = Math.round(base + 30 * Math.sin((h - 6) * (Math.PI / 12)) + Math.random() * 5);
    const dakhla = Math.round(base + 25 * Math.sin((h - 4) * (Math.PI / 12)) + Math.random() * 5);
    const marrakech = Math.round(base + 20 * Math.sin((h - 8) * (Math.PI / 12)) + Math.random() * 5);
    const tangier = Math.round(base + 28 * Math.sin((h - 2) * (Math.PI / 12)) + Math.random() * 5);
    const oujda = Math.round(base + 22 * Math.sin((h - 10) * (Math.PI / 12)) + Math.random() * 5);

    data.push({
      hour,
      casablanca: Math.max(5, Math.min(95, casablanca)),
      dakhla: Math.max(5, Math.min(95, dakhla)),
      marrakech: Math.max(5, Math.min(95, marrakech)),
      tangier: Math.max(5, Math.min(95, tangier)),
      oujda: Math.max(5, Math.min(95, oujda)),
    });
  }
  return data;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  const t = useTranslations('charts');
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-surface-4 px-3 py-2 shadow-xl">
      <p className="font-[family-name:var(--font-space-mono)] mb-1 text-xs text-txt-secondary">
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2 w-2 shrink-0 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-[family-name:var(--font-space-mono)] text-xs text-txt-secondary">
            {t('gpuUtilization.' + entry.name)}:
          </span>
          <span className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-white">
            {entry.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function GPUUtilizationChart() {
  const t = useTranslations('charts');
  const data = useMemo(() => generateData(), []);

  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-surface-3 p-6">
      <div className="mb-4">
        <h3 className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-white">
          {t('gpuUtilization.title')}
        </h3>
        <p className="font-[family-name:var(--font-space-mono)] text-xs text-txt-dim">
          {t('gpuUtilization.subtitle')}
        </p>
      </div>
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {hubs.map((hub) => (
                <linearGradient
                  key={hub.name}
                  id={`gradient-${hub.name}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={hub.color}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor={hub.color}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis
              dataKey="hour"
              tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-space-mono)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-space-mono)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            {hubs.map((hub) => (
              <Area
                key={hub.name}
                type="monotone"
                dataKey={hub.name}
                stroke={hub.color}
                strokeWidth={1.5}
                fill={`url(#gradient-${hub.name})`}
                stackId="1"
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

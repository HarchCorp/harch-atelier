'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface CarbonData {
  quarter: string;
  intensity: number;
}

const rawData: CarbonData[] = [
  { quarter: '24 Q1', intensity: 120 },
  { quarter: '24 Q2', intensity: 95 },
  { quarter: '24 Q3', intensity: 78 },
  { quarter: '24 Q4', intensity: 65 },
  { quarter: '25 Q1', intensity: 58 },
  { quarter: '25 Q2', intensity: 52 },
  { quarter: '25 Q3', intensity: 49 },
  { quarter: '25 Q4', intensity: 47 },
];

const GLOBAL_AVG = 450;

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-surface-4 px-3 py-2 shadow-xl">
      <p className="font-[family-name:var(--font-space-mono)] text-xs text-txt-secondary">
        {label}
      </p>
      <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-white">
        {payload[0].value} gCO₂/kWh
      </p>
    </div>
  );
}

export function CarbonIntensityChart() {
  const t = useTranslations('charts');
  const data = useMemo(() => rawData, []);

  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-surface-3 p-6">
      <div className="mb-4">
        <h3 className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-white">
          {t('carbonIntensity.title')}
        </h3>
        <p className="font-[family-name:var(--font-space-mono)] text-xs text-txt-dim">
          {t('carbonIntensity.subtitle')}
        </p>
      </div>
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(139,157,175,0.3)" />
                <stop offset="100%" stopColor="rgba(139,157,175,0)" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis
              dataKey="quarter"
              tick={{ fill: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-space-mono)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-space-mono)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={GLOBAL_AVG}
              stroke="#A0524B"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: t('carbonIntensity.globalAvg'),
                position: 'right',
                fill: '#A0524B',
                fontSize: 10,
                fontFamily: 'var(--font-space-mono)',
              }}
            />
            <Area
              type="monotone"
              dataKey="intensity"
              stroke="#8B9DAF"
              strokeWidth={2.5}
              fill="url(#carbonGradient)"
              dot={{ r: 4, fill: '#8B9DAF', stroke: '#141414', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#A0B3C5', stroke: '#141414', strokeWidth: 2 }}
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

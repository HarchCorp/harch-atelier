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

interface RevenueData {
  year: string;
  revenue: number;
  projected: number;
}

const rawData: RevenueData[] = [
  { year: '2022', revenue: 120, projected: 120 },
  { year: '2023', revenue: 280, projected: 280 },
  { year: '2024', revenue: 540, projected: 540 },
  { year: '2025', revenue: 0, projected: 890 },
  { year: '2026', revenue: 0, projected: 1400 },
  { year: '2027', revenue: 0, projected: 2200 },
];

const AREA_FILL = '#8B9DAF';
const AREA_PROJECTED = 'rgba(139,157,175,0.3)';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  const t = useTranslations('charts');
  if (!active || !payload?.length || !label) return null;
  const isProjected = label >= '2025';
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-surface-4 px-3 py-2 shadow-xl">
      <p className="font-[family-name:var(--font-space-mono)] text-xs text-txt-secondary">
        FY {label} {isProjected && `(${t('revenue.projected')})`}
      </p>
      {payload.map((entry, i) => (
        <p key={i} className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-white">
          ${entry.value}M
        </p>
      ))}
    </div>
  );
}

export function RevenueChart() {
  const t = useTranslations('charts');
  const data = useMemo(() => rawData, []);

  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-surface-3 p-6">
      <div className="mb-4">
        <h3 className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-white">
          {t('revenue.title')}
        </h3>
        <p className="font-[family-name:var(--font-space-mono)] text-xs text-txt-dim">
          {t('revenue.subtitle')} — FY2022–FY2027
        </p>
      </div>
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-[2px] bg-[#8B9DAF]" />
          <span className="text-[10px] text-txt-dim font-[family-name:var(--font-space-mono)]">{t('revenue.actual')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-[2px] border-t border-dashed border-[#8B9DAF]" />
          <span className="text-[10px] text-txt-dim font-[family-name:var(--font-space-mono)]">{t('revenue.projected')}</span>
        </div>
      </div>
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={AREA_FILL} stopOpacity={0.2} />
                <stop offset="95%" stopColor={AREA_FILL} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={AREA_FILL} stopOpacity={0.08} />
                <stop offset="95%" stopColor={AREA_FILL} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis
              dataKey="year"
              tick={{ fill: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-space-mono)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-space-mono)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={AREA_FILL}
              strokeWidth={2}
              fill="url(#revenueGrad)"
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
              dot={{ fill: AREA_FILL, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: AREA_FILL, stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="projected"
              stroke={AREA_FILL}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              fill="url(#projectedGrad)"
              animationBegin={300}
              animationDuration={1200}
              animationEasing="ease-out"
              dot={{ fill: AREA_FILL, r: 2, strokeWidth: 0, opacity: 0.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

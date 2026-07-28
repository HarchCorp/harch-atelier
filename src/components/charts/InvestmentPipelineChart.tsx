'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

interface InvestmentData {
  vertical: string;
  value: number;
}

const rawData: InvestmentData[] = [
  { vertical: 'intelligence', value: 800 },
  { vertical: 'energy', value: 600 },
  { vertical: 'technology', value: 400 },
  { vertical: 'cement', value: 200 },
  { vertical: 'mining', value: 200 },
  { vertical: 'agri', value: 150 },
  { vertical: 'water', value: 150 },
  { vertical: 'finance', value: 100 },
];

const BAR_FILL = '#8B9DAF';
const BAR_HOVER_FILL = '#A0B3C5';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: InvestmentData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  const t = useTranslations('charts');
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-surface-4 px-3 py-2 shadow-xl">
      <p className="font-[family-name:var(--font-space-mono)] text-xs text-txt-secondary">
        {t('investmentPipeline.' + data.vertical)}
      </p>
      <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-white">
        ${data.value}M
      </p>
    </div>
  );
}

export function InvestmentPipelineChart() {
  const t = useTranslations('charts');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = useMemo(() => rawData, []);

  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-surface-3 p-6">
      <div className="mb-4">
        <h3 className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-white">
          {t('investmentPipeline.title')}
        </h3>
        <p className="font-[family-name:var(--font-space-mono)] text-xs text-txt-dim">
          {t('investmentPipeline.subtitle')}
        </p>
      </div>
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-space-mono)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}M`}
            />
            <YAxis
              type="category"
              dataKey="vertical"
              tick={{ fill: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-space-mono)' }}
              axisLine={false}
              tickLine={false}
              width={80}
              tickFormatter={(value: string) => t('investmentPipeline.' + value)}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={hoveredIndex === index ? BAR_HOVER_FILL : BAR_FILL}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v: number) => `$${v}M`}
                style={{
                  fill: 'var(--text-secondary)',
                  fontSize: 11,
                  fontFamily: 'var(--font-space-mono)',
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

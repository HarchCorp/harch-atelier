'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

interface EnergyData {
  name: string;
  value: number;
  color: string;
}

const rawData: EnergyData[] = [
  { name: 'solar', value: 45, color: '#8B9DAF' },
  { name: 'wind', value: 30, color: '#6B9F6B' },
  { name: 'greenHydrogen', value: 15, color: '#4A5D6E' },
  { name: 'grid', value: 10, color: '#333333' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: EnergyData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  const t = useTranslations('charts');
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-surface-4 px-3 py-2 shadow-xl">
      <p className="font-[family-name:var(--font-space-mono)] text-xs text-txt-secondary">
        {t('energyMix.' + data.name)}
      </p>
      <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-white">
        {data.value}%
      </p>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  const t = useTranslations('charts');
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-[family-name:var(--font-space-mono)] text-xs text-txt-secondary">
            {t('energyMix.' + entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function EnergyMixChart() {
  const t = useTranslations('charts');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = useMemo(() => rawData, []);

  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-surface-3 p-6">
      <div className="mb-4">
        <h3 className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-white">
          {t('energyMix.title')}
        </h3>
        <p className="font-[family-name:var(--font-space-mono)] text-xs text-txt-dim">
          {t('energyMix.subtitle')}
        </p>
      </div>
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-out"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="none"
                  style={{
                    transform:
                      activeIndex === index ? 'scale(1.06)' : 'scale(1)',
                    transformOrigin: 'center',
                    transition: 'transform 0.2s ease-out',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {/* Center text */}
            <text
              x="50%"
              y="40%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize={22}
              fontWeight="bold"
              fontFamily="var(--font-space-mono)"
            >
              2GW+
            </text>
            <text
              x="50%"
              y="52%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#666666"
              fontSize={10}
              fontFamily="var(--font-space-mono)"
            >
              {t('energyMix.totalPipeline')}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

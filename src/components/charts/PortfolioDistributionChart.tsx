'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

interface PortfolioData {
  name: string;
  value: number;
  color: string;
}

const rawData: PortfolioData[] = [
  { name: 'intelligence', value: 800, color: '#8B9DAF' },
  { name: 'energy', value: 600, color: '#6B9F6B' },
  { name: 'technology', value: 400, color: '#7888A8' },
  { name: 'cement', value: 200, color: '#A89878' },
  { name: 'mining', value: 200, color: '#A87878' },
  { name: 'agri', value: 150, color: '#6BAF6B' },
  { name: 'water', value: 150, color: '#6888A8' },
  { name: 'finance', value: 100, color: '#8B9DAF' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PortfolioData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  const t = useTranslations('charts');
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const total = rawData.reduce((sum, d) => sum + d.value, 0);
  const pct = ((data.value / total) * 100).toFixed(1);
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-surface-4 px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
        <p className="font-[family-name:var(--font-space-mono)] text-xs text-txt-secondary">
          {t('portfolioDistribution.' + data.name)}
        </p>
      </div>
      <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-white">
        ${data.value}M <span className="text-txt-dim text-xs">({pct}%)</span>
      </p>
    </div>
  );
}

export function PortfolioDistributionChart() {
  const t = useTranslations('charts');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const data = useMemo(() => rawData, []);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-surface-3 p-6">
      <div className="mb-4">
        <h3 className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-white">
          {t('portfolioDistribution.title')}
        </h3>
        <p className="font-[family-name:var(--font-space-mono)] text-xs text-txt-dim">
          {t('portfolioDistribution.subtitle')} — ${total}M deployed
        </p>
      </div>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div style={{ width: 260, height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={hoveredIndex === index ? entry.color : entry.color}
                    opacity={hoveredIndex !== null && hoveredIndex !== index ? 0.4 : 1}
                    stroke="transparent"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ transition: 'opacity 0.2s ease', cursor: 'pointer' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2 min-w-0">
          {data.map((entry, i) => {
            const pct = ((entry.value / total) * 100).toFixed(0);
            return (
              <div
                key={entry.name}
                className={`flex items-center gap-2 py-1.5 px-2 rounded transition-all cursor-default ${hoveredIndex === i ? 'bg-white/5' : ''}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-[11px] text-txt-secondary truncate flex-1">{t('portfolioDistribution.' + entry.name)}</span>
                <span className="text-[11px] font-bold text-white stat-mono flex-shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

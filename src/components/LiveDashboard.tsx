'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Metric {
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  sparkline?: number[];
  decimals?: number;
}

interface LiveDashboardProps {
  metrics: Metric[];
  title?: string;
}

/**
 * useCountUp — Animated counter hook that NEVER shows "0" on initial render.
 *
 * Strategy:
 * 1. SSR/initial render: Show the target value (correct, no flash)
 * 2. On client mount: Keep showing the target value
 * 3. When isInView becomes true: Start animation from 0 → target
 * 4. During animation: Update React state via useState (NOT direct DOM)
 * 5. After animation completes: State holds the target value
 *
 * The key insight: We use `hasStarted` ref to ensure the animation
 * only starts once, and we only update state from the animation loop,
 * never resetting to 0 outside of the animation's first frame.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  decimals: number = 0,
) {
  // Start with the target value so SSR and initial render show correct value
  const [displayValue, setDisplayValue] = useState<number>(target);
  const hasStarted = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive || hasStarted.current) return;
    hasStarted.current = true;

    let startTime: number | null = null;
    const duration = 2000;
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = eased * target;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, target, decimals]);

  // Format the display value
  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return { formatted };
}

function SparklineChart({ data, color = '#8B9DAF' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 30;
  const h = 12;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="opacity-50"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') {
    return <ArrowUp size={10} className="text-[#4A7B5F]" />;
  }
  if (trend === 'down') {
    return <ArrowDown size={10} className="text-[#A0524B]" />;
  }
  return <Minus size={10} className="text-white/25" />;
}

export default function LiveDashboard({ metrics, title }: LiveDashboardProps) {
  const t = useTranslations('liveDashboard');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const [liveMetrics, setLiveMetrics] = useState<Metric[]>(metrics);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Update timestamp
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live fluctuations every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics((prev) =>
        prev.map((m) => {
          const fluctuation = m.value * (Math.random() * 0.04 - 0.02); // ±1-2%
          const newVal = m.value + fluctuation;
          return {
            ...m,
            value: m.decimals ? parseFloat(newVal.toFixed(m.decimals)) : Math.round(newVal),
          };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [metrics]);

  return (
    <div
      ref={containerRef}
      className="relative bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden max-w-full"
    >
      <div className="p-4 md:p-6">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-[0.2em] text-white/25">
            {title || t('liveMetrics')}
          </span>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-[6px] h-[6px] rounded-full bg-[#4A7B5F]"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-[0.15em] text-[#4A7B5F]">
              {t('live')}
            </span>
          </div>
        </div>

        {/* Metric cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {liveMetrics.map((metric, i) => (
            <MetricCard
              key={metric.label}
              metric={metric}
              index={i}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between gap-2 flex-wrap">
          <span className="font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-[0.15em] text-white/15">
            {t('lastUpdated')} {lastUpdated}
          </span>
          <span className="font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-[0.1em] text-white/10">
            {t('refresh5s')}
          </span>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  metric,
  index,
  isInView,
}: {
  metric: Metric;
  index: number;
  isInView: boolean;
}) {
  const { formatted } = useCountUp(metric.value, isInView, metric.decimals || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.6,
        delay: 0.3 + index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-lg p-3 md:p-4 min-w-0"
    >
      {/* Label */}
      <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-[0.15em] text-white/25 mb-2">
        {metric.label}
      </p>

      {/* Value row */}
      <div className="flex items-baseline gap-1 mb-2">
        <span
          className="stat-mono text-xl md:text-2xl lg:text-3xl font-bold text-white"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatted}
        </span>
        {metric.unit && (
          <span className="text-[11px] text-white/40 font-medium">{metric.unit}</span>
        )}
      </div>

      {/* Trend + Sparkline row */}
      <div className="flex items-center justify-between">
        {metric.trend && <TrendIndicator trend={metric.trend} />}
        {metric.sparkline && <SparklineChart data={metric.sparkline} />}
        {!metric.trend && !metric.sparkline && <div />}
      </div>
    </motion.div>
  );
}

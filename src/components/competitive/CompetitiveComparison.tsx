'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FadeIn } from '@/components/ui/motion';
import { useTranslations } from 'next-intl';

/* ─── Types ─── */
export interface MetricComparison {
  label: string;
  harchValue: string;
  competitorValue: string;
  unit?: string;
  note?: string;
  /** Whether Harch wins on this metric (for accent indicator) */
  harchWins?: boolean;
  /** Optional numeric value for visual bar comparison */
  harchNumeric?: number;
  competitorNumeric?: number;
  /** Max value for bar scaling */
  barMax?: number;
  /** Lower is better (e.g., carbon intensity, cost) */
  lowerIsBetter?: boolean;
}

export interface Competitor {
  name: string;
  country: string;
  logo?: string;
  founded?: string;
  revenue?: string;
  metrics: MetricComparison[];
  verdict: string;
}

export interface CompetitiveComparisonProps {
  title?: string;
  subtitle?: string;
  accentColor: string;
  sectionLabel?: string;
  competitors: Competitor[];
  harchName?: string;
}

/* ─── Dominance Score Ring ─── */
function DominanceRing({ wins, total, accentColor, t }: { wins: number; total: number; accentColor: string; t: any }) {
  const percentage = Math.round((wins / total) * 100);
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div className="flex items-center gap-3">
      <svg ref={ref} width="64" height="64" viewBox="0 0 64 64" className="flex-shrink-0">
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="32" cy="32" r="28" fill="none"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isInView ? strokeDashoffset : circumference}
          transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
        <text x="32" y="32" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="14" fontWeight="700" fontFamily="var(--font-space-mono)">
          {percentage}
        </text>
      </svg>
      <div>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: accentColor }}>
          {t('dominanceScore')}
        </p>
        <p className="text-[12px] text-[#999999]">
          {t('metricsWon', { wins, total })}
        </p>
      </div>
    </div>
  );
}

/* ─── Visual Comparison Bar ─── */
function ComparisonBar({ harchNumeric, competitorNumeric, barMax, lowerIsBetter, accentColor, t }: { harchNumeric: number; competitorNumeric: number; barMax: number; lowerIsBetter?: boolean; accentColor: string; t: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const harchPct = Math.min((harchNumeric / barMax) * 100, 100);
  const compPct = Math.min((competitorNumeric / barMax) * 100, 100);
  const harchWins = lowerIsBetter ? harchNumeric < competitorNumeric : harchNumeric > competitorNumeric;

  return (
    <div ref={ref} className="mt-1.5 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-[#666666] w-10 text-right flex-shrink-0">{t('harchBar')}</span>
        <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-[1.5s] ease-out"
            style={{
              width: isInView ? `${harchPct}%` : '0%',
              backgroundColor: harchWins ? accentColor : 'rgba(255,255,255,0.2)',
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-[#666666] w-10 text-right flex-shrink-0">{t('compBar')}</span>
        <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-[1.5s] ease-out"
            style={{
              width: isInView ? `${compPct}%` : '0%',
              backgroundColor: !harchWins ? accentColor : 'rgba(255,255,255,0.15)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function CompetitiveComparison({
  title,
  subtitle,
  accentColor,
  sectionLabel,
  competitors,
  harchName,
}: CompetitiveComparisonProps) {
  const t = useTranslations('competitive');

  // Calculate overall stats
  const totalMetrics = competitors.reduce((sum, c) => sum + c.metrics.length, 0);
  const totalWins = competitors.reduce((sum, c) => sum + c.metrics.filter(m => m.harchWins !== false).length, 0);
  const overallWinRate = totalMetrics > 0 ? Math.round((totalWins / totalMetrics) * 100) : 0;
  const resolvedHarchName = harchName || 'Harch';

  return (
    <section className="py-28 md:py-36 bg-[#121212]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <FadeIn>
          <p className="section-label mb-4" style={{ color: accentColor }}>
            {sectionLabel || t('competitiveLandscape')}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
            {title || t('competitiveLandscape')}
          </h2>
          <div className="accent-line mb-6" />
          {subtitle && (
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-8">
              {subtitle}
            </p>
          )}
        </FadeIn>

        {/* Overall Dominance Banner */}
        <FadeIn delay={0.05}>
          <div className="mb-12 p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl md:text-6xl font-bold text-white stat-mono">{overallWinRate}%</p>
                  <p className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-bold mt-1">{t('winRate')}</p>
                </div>
                <div className="h-12 w-px bg-[rgba(255,255,255,0.06)] hidden md:block" />
                <div>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: accentColor }}>
                    {t('harchDominance', { name: resolvedHarchName })}
                  </p>
                  <p className="text-[14px] text-white font-semibold mt-1">
                    {t('metricsWonAcross', { wins: totalWins, total: totalMetrics, count: competitors.length })}
                  </p>
                  <p className="text-[12px] text-[#666666] mt-0.5">
                    {t('everyDimension')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {competitors.map((comp) => {
                  const compWins = comp.metrics.filter(m => m.harchWins !== false).length;
                  const compRate = Math.round((compWins / comp.metrics.length) * 100);
                  return (
                    <div key={comp.name} className="text-center px-3">
                      <p className="text-lg font-bold text-white stat-mono">{compRate}%</p>
                      <p className="text-[9px] text-[#666666] max-w-[80px] truncate">{comp.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Competitor Cards */}
        <div className="space-y-6">
          {competitors.map((competitor, i) => {
            const compWins = competitor.metrics.filter(m => m.harchWins !== false).length;
            return (
              <FadeIn key={competitor.name} delay={i * 0.08}>
                <div className="card p-6 md:p-8">
                  {/* Competitor Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: accentColor }}
                      />
                      <h3 className="text-lg font-bold text-white">{competitor.name}</h3>
                      <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] uppercase tracking-wider">
                        {competitor.country}
                      </span>
                      {competitor.founded && (
                        <span className="text-[10px] text-[#555555]">
                          {t('est')} {competitor.founded}
                        </span>
                      )}
                      {competitor.revenue && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.04)] text-[#666666]">
                          {t('rev')} {competitor.revenue}
                        </span>
                      )}
                    </div>
                    <DominanceRing wins={compWins} total={competitor.metrics.length} accentColor={accentColor} t={t} />
                  </div>

                  {/* Metrics Table */}
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)]">
                          <th className="text-left text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] px-4 py-3 w-[30%]">
                            {t('metric')}
                          </th>
                          <th className="text-left text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] px-4 py-3 w-[30%]">
                            {resolvedHarchName}
                          </th>
                          <th className="text-left text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] px-4 py-3 w-[30%]">
                            {competitor.name}
                          </th>
                          <th className="text-center text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] px-4 py-3 w-[10%]">
                            {t('edge')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {competitor.metrics.map((metric) => {
                          const hasBars = metric.harchNumeric !== undefined && metric.competitorNumeric !== undefined && metric.barMax !== undefined;
                          return (
                            <tr
                              key={metric.label}
                              className="border-b border-[rgba(255,255,255,0.03)] last:border-0"
                            >
                              <td className="px-4 py-3 text-[13px] text-[#999999]">
                                {metric.label}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {metric.harchWins !== false && (
                                    <span
                                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: accentColor }}
                                    />
                                  )}
                                  <span className="text-[13px] font-bold text-white stat-mono">
                                    {metric.harchValue}
                                    {metric.unit && (
                                      <span className="text-[#999999] font-normal ml-1">
                                        {metric.unit}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[13px] text-[#999999] stat-mono">
                                {metric.competitorValue}
                                {metric.unit && (
                                  <span className="text-[#666666] ml-1">{metric.unit}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {metric.harchWins !== false ? (
                                  <span
                                    className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold"
                                    style={{
                                      backgroundColor: `${accentColor}15`,
                                      color: accentColor,
                                    }}
                                  >
                                    {t('win')}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold bg-[rgba(255,255,255,0.04)] text-[#666666]">
                                    {t('loss')}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Visual Bars for numeric metrics */}
                  {competitor.metrics.some(m => m.harchNumeric !== undefined) && (
                    <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.04)]">
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">
                        {t('visualComparison')}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {competitor.metrics
                          .filter(m => m.harchNumeric !== undefined && m.competitorNumeric !== undefined && m.barMax !== undefined)
                          .map((metric) => (
                            <div key={metric.label} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[11px] text-[#999999]">{metric.label}</span>
                                <span className="text-[10px] font-bold" style={{ color: accentColor }}>
                                  {metric.lowerIsBetter
                                    ? t('pctBetter', { pct: Math.round((1 - (metric.harchNumeric! / metric.competitorNumeric!)) * 100) })
                                    : t('pctMore', { pct: Math.round(((metric.harchNumeric! - metric.competitorNumeric!) / metric.competitorNumeric!) * 100) })
                                  }
                                </span>
                              </div>
                              <ComparisonBar
                                harchNumeric={metric.harchNumeric!}
                                competitorNumeric={metric.competitorNumeric!}
                                barMax={metric.barMax!}
                                lowerIsBetter={metric.lowerIsBetter}
                                accentColor={accentColor}
                                t={t}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Verdict */}
                  <div
                    className="mt-6 px-5 py-4 rounded-lg"
                    style={{
                      borderLeft: `3px solid ${accentColor}`,
                      backgroundColor: `${accentColor}08`,
                    }}
                  >
                    <p className="text-[13px] text-[#CCCCCC] leading-[1.7]">
                      <span
                        className="font-bold font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-wider mr-2"
                        style={{ color: accentColor }}
                      >
                        {t('verdict')}
                      </span>
                      {competitor.verdict}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

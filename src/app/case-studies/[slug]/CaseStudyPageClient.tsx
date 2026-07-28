'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  Clock,
  Factory,
  Landmark,
  Zap,
  Building2,
  Quote,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { FadeIn } from '@/components/ui/motion';
import { caseStudies, getCaseStudyBySlug } from '@/data/case-studies';

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════════════════ */
function AnimatedMetric({ value, label, change }: { value: string; label: string; change?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const numericPart = value.replace(/[^0-9.]/g, '');
  const prefix = value.match(/^[^0-9]*/)?.[0] || '';
  const suffix = value.replace(/^[^0-9]*[0-9.]+/, '');
  const numericValue = parseFloat(numericPart) || 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center p-6"
    >
      <p className="stat-mono text-3xl md:text-4xl lg:text-[44px] font-bold text-white mb-2">
        {prefix}
        <AnimatedNumber value={numericValue} active={isInView} />
        {suffix}
      </p>
      <p className="text-[11px] text-[#666666] uppercase tracking-[0.1em] mb-1">{label}</p>
      {change && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.05em] uppercase text-[#4A7B5F]">
          <TrendingUp size={10} />
          {change}
        </span>
      )}
    </motion.div>
  );
}

function AnimatedNumber({ value, active }: { value: number; active: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active || value === 0) return;
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * value;
      setDisplay(
        value % 1 !== 0 ? parseFloat(current.toFixed(1)) : Math.floor(current)
      );
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [value, active]);

  if (!active) return <span>0</span>;
  return <span>{display.toLocaleString()}</span>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */
const typeIcons: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  Industrial: Factory,
  Government: Landmark,
  Energy: Zap,
  Infrastructure: Building2,
};

const typeColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  Industrial: {
    bg: 'rgba(74,123,95,0.08)',
    border: 'rgba(74,123,95,0.2)',
    text: '#4A7B5F',
    accent: '#4A7B5F',
  },
  Government: {
    bg: 'rgba(139,157,175,0.08)',
    border: 'rgba(139,157,175,0.2)',
    text: '#8B9DAF',
    accent: '#8B9DAF',
  },
  Energy: {
    bg: 'rgba(180,140,80,0.08)',
    border: 'rgba(180,140,80,0.2)',
    text: '#B48C50',
    accent: '#B48C50',
  },
  Infrastructure: {
    bg: 'rgba(110,130,160,0.08)',
    border: 'rgba(110,130,160,0.2)',
    text: '#6E82A0',
    accent: '#6E82A0',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function CaseStudyPageClient({ slug }: { slug: string }) {
  const cs = getCaseStudyBySlug(slug);

  if (!cs) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Case Study Not Found</h1>
          <p className="text-[#999999] mb-8">The case study you are looking for does not exist.</p>
          <Link href="/case-studies" className="inline-flex items-center gap-2 text-sm font-semibold text-[#999999] hover:text-white transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Case Studies
          </Link>
        </div>
      </div>
    );
  }

  const Icon = typeIcons[cs.type] || Factory;
  const colors = typeColors[cs.type] || typeColors.Industrial;
  const otherStudies = caseStudies.filter(c => c.slug !== slug);

  return (
    <div className="bg-[#0A0A0A]">

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-[#0A0A0A] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={cs.heroImage}
            alt={cs.title}
            fill
            className="object-cover opacity-15"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-[#0A0A0A]/80 to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <Link href="/case-studies" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#999999] hover:text-white transition-colors mb-8 group">
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              Back to Case Studies
            </Link>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-[0.12em] uppercase"
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              >
                <Icon size={10} />
                {cs.type}
              </span>
              <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                <MapPin size={10} />
                {cs.location}
              </span>
              <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                <Clock size={10} />
                {cs.duration}
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.1] mb-4">
              {cs.title}
            </h1>
            <div className="accent-line mb-6" />
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="text-[16px] text-[#CCCCCC] leading-[1.7] max-w-3xl mb-4">{cs.subtitle}</p>
            <p className="text-[13px] text-[#666666] font-[family-name:var(--font-space-mono)]">{cs.client}</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ RESULTS GRID ═══ */}
      <section className="py-16 md:py-24 bg-[#0A0A0A]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Results</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-12">Impact Delivered</h2>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden bg-[#111111]">
            {cs.results.map((r, i) => (
              <div
                key={r.label}
                className="relative p-6 md:p-8 border-r border-b border-[rgba(255,255,255,0.04)] last:border-r-0 even:last:border-r-0"
                style={{
                  borderRight: i < cs.results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <p className="stat-mono text-2xl md:text-3xl font-bold text-white mb-1">{r.value}</p>
                <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em] mb-1">{r.label}</p>
                {r.change && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold tracking-[0.05em] uppercase text-[#4A7B5F]">
                    <CheckCircle2 size={8} />
                    {r.change}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CHALLENGE ═══ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4" style={{ color: '#A0524B' }}>01 / Challenge</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-8">The Problem</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="text-[15px] text-[#CCCCCC] leading-[1.9] space-y-6">
              {cs.challenge.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SOLUTION ═══ */}
      <section className="py-20 md:py-28 bg-[#0A0A0A]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4" style={{ color: colors.text }}>02 / Solution</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-8">Our Approach</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="text-[15px] text-[#CCCCCC] leading-[1.9] space-y-6">
              {cs.solution.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ IMPLEMENTATION TIMELINE ═══ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4" style={{ color: colors.text }}>03 / Timeline</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-16">Implementation</h2>
          </FadeIn>

          <div className="relative">
            {/* Vertical Line */}
            <div
              className="absolute left-[15px] md:left-[19px] top-2 bottom-2 w-px"
              style={{ background: `linear-gradient(to bottom, ${colors.accent}, ${colors.accent}33, transparent)` }}
            />

            <div className="space-y-10">
              {cs.timeline.map((phase, i) => (
                <FadeIn key={phase.phase} delay={i * 0.1}>
                  <div className="relative pl-12 md:pl-14">
                    {/* Dot */}
                    <div
                      className="absolute left-[10px] md:left-[14px] top-1.5 w-[11px] h-[11px] rounded-full border-2"
                      style={{
                        borderColor: colors.accent,
                        background: i === 0 ? colors.accent : '#0D0D0D',
                      }}
                    />

                    {/* Phase Header */}
                    <div className="flex flex-wrap items-baseline gap-3 mb-3">
                      <h3 className="text-[15px] font-bold text-white">{phase.phase}</h3>
                      <span className="text-[11px] font-[family-name:var(--font-space-mono)]" style={{ color: colors.text }}>
                        {phase.months}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[14px] text-[#999999] leading-[1.75]">{phase.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER METRICS TABLE ═══ */}
      <section className="py-20 md:py-28 bg-[#0A0A0A]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">04 / Metrics</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-12">Before &amp; After</h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="border border-[rgba(255,255,255,0.06)] rounded-xl overflow-x-auto">
              <table className="data-table min-w-[500px] md:min-w-0">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Before</th>
                    <th>After</th>
                    <th className="hidden md:table-cell">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {cs.metrics.map((m) => {
                    const beforeNum = parseFloat(m.before.replace(/[^0-9.]/g, ''));
                    const afterNum = parseFloat(m.after.replace(/[^0-9.]/g, ''));
                    const isImprovement = afterNum < beforeNum || m.after.includes('%') && parseInt(m.after) < parseInt(m.before) || m.after.startsWith('<') || m.after === '0' || m.after === '0t (renewable)' || m.after.includes('$0') || m.after === '100%';

                    return (
                      <tr key={m.metric}>
                        <td className="text-[13px] text-white font-semibold">{m.metric}</td>
                        <td className="text-[13px] text-[#999999] font-[family-name:var(--font-space-mono)]">{m.before}</td>
                        <td className="text-[13px] text-white font-[family-name:var(--font-space-mono)] font-semibold">{m.after}</td>
                        <td className="hidden md:table-cell">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4A7B5F]">
                            <TrendingDown size={10} />
                            Improved
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ QUOTE ═══ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[800px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="relative card overflow-hidden py-10 md:py-14">
              {/* Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: colors.accent }} />

              <Quote size={32} className="text-[rgba(139,157,175,0.15)] mb-6" strokeWidth={1.5} />

              <blockquote className="text-[15px] md:text-[17px] text-[#CCCCCC] leading-[1.8] mb-8 italic">
                &ldquo;{cs.quote.text}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white"
                  style={{ background: colors.accent }}
                >
                  {cs.quote.author.charAt(0)}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">{cs.quote.author}</p>
                  <p className="text-[12px] text-[#999999]">{cs.quote.title}, {cs.quote.org}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CTAs ═══ */}
      <section className="py-20 md:py-28 bg-[#0A0A0A]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 border-t border-b border-[rgba(255,255,255,0.06)]">
              <Link
                href="/case-studies"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#999999] hover:text-white transition-colors group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to Case Studies
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-white text-black text-[13px] font-semibold tracking-[0.02em] hover:bg-[#E5E5E5] transition-colors"
              >
                Request a Briefing
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ OTHER CASE STUDIES ═══ */}
      {otherStudies.length > 0 && (
        <section className="py-20 md:py-28 bg-[#0D0D0D]">
          <div className="max-w-[900px] mx-auto px-6 md:px-12">
            <FadeIn>
              <p className="section-label mb-4 text-[#8B9DAF]">More</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-8">Other Case Studies</h2>
            </FadeIn>
            <div className="space-y-2">
              {otherStudies.map((other) => {
                const OtherIcon = typeIcons[other.type] || Factory;
                const otherColors = typeColors[other.type] || typeColors.Industrial;
                return (
                  <FadeIn key={other.slug}>
                    <Link href={`/case-studies/${other.slug}`} className="vertical-row group block p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold tracking-[0.12em] uppercase"
                          style={{
                            background: otherColors.bg,
                            border: `1px solid ${otherColors.border}`,
                            color: otherColors.text,
                          }}
                        >
                          <OtherIcon size={8} />
                          {other.type}
                        </span>
                        <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">
                          {other.location}
                        </span>
                      </div>
                      <h3 className="text-[16px] font-bold text-white group-hover:text-[#CCCCCC] transition-colors leading-snug">
                        {other.title}
                      </h3>
                      <p className="text-[13px] text-[#999999] leading-relaxed mt-1 line-clamp-2">{other.subtitle}</p>
                    </Link>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

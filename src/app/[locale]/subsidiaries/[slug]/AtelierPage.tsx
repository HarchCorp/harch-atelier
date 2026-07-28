'use client';

import { useState, useMemo, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  CheckCircle2,
  Shield,
  ChevronDown,
  FileText,
  Quote,
  MapPin,
  Clock,
  Code2,
  Search,
  Building2,
  Globe2,
  Brain,
  Cpu,
  Sparkles,
  GitBranch,
  CalendarDays,
  Wallet,
  Activity,
  Star,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HARCH ATELIER — Real business: AI Search Visibility (GEO/AEO).
   ───────────────────────────────────────────────────────────────
   Minimalist. Direct. Intelligent. Tesla · Palantir · Stripe · Linear.
   • No pulse, no glow, no shimmer, no urgency pills.
   • Subtle fade-in on scroll (0.3s easeOut).
   • Tesla 3-button switch: simple opacity crossfade 0.2s.
   • Live demo: input → mockup ChatGPT response (no real API).
   • Card hover: border darkens only.
   • Stone-500 accent on labels and small stats only.
   • Emerald-500 only on primary CTAs.
   • GLM-4, Founded 2024, Casablanca, Building in Public.
   ═══════════════════════════════════════════════════════════════ */

/* Override Tailwind's --font-mono on this subtree so every `font-mono` utility
   renders Space Mono per the Harch Brand System. */
const monoOverride = {
  '--font-mono': 'var(--font-space-mono)',
} as CSSProperties;

/* ── Reveal — minimal fade-in on scroll ────────────────────────
   opacity 0 → 1, y 20 → 0, 0.3s ease-out. That's it. */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Section label — Harch brand pattern, stone accent ────── */
function SectionLabel({
  n,
  label,
  dark = false,
  align = 'left',
}: {
  n?: string;
  label: string;
  dark?: boolean;
  align?: 'left' | 'center';
}) {
  return (
    <div
      className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] ${
        align === 'center' ? 'justify-center' : ''
      }`}
    >
      {n && <span className={dark ? 'text-neutral-600' : 'text-neutral-400'}>{`// ${n}`}</span>}
      <span className="h-px w-8 bg-stone-500/60" />
      <span className="text-stone-600 dark:text-stone-500">{label}</span>
    </div>
  );
}

/* ── Forge sparks — Atelier subsidiary unique motif ─────────── */
function ForgeSparks({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 h-full w-full"
      style={{ opacity }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <g fill="#f59e0b">
        <circle cx="8%" cy="22%" r="1.4" />
        <circle cx="15%" cy="14%" r="0.9" />
        <circle cx="22%" cy="68%" r="1.2" />
        <circle cx="34%" cy="34%" r="1.6" />
        <circle cx="42%" cy="78%" r="0.8" />
        <circle cx="55%" cy="18%" r="1.3" />
        <circle cx="63%" cy="58%" r="1.1" />
        <circle cx="72%" cy="42%" r="1.5" />
        <circle cx="80%" cy="72%" r="0.9" />
        <circle cx="88%" cy="28%" r="1.2" />
        <circle cx="92%" cy="52%" r="1.4" />
      </g>
      <g fill="#78716c">
        <circle cx="12%" cy="48%" r="0.7" />
        <circle cx="28%" cy="22%" r="0.8" />
        <circle cx="38%" cy="55%" r="0.6" />
        <circle cx="48%" cy="32%" r="0.9" />
        <circle cx="58%" cy="84%" r="0.7" />
        <circle cx="68%" cy="24%" r="0.8" />
        <circle cx="78%" cy="62%" r="0.7" />
        <circle cx="85%" cy="14%" r="0.6" />
      </g>
    </svg>
  );
}

/* ── Status pill used by Tesla mockups ─────────────────────── */
function StatusPill({ tone, children }: { tone: 'opt' | 'warn' | 'alert' | 'good'; children: React.ReactNode }) {
  const tones = {
    opt: 'border-stone-500/40 bg-stone-500/10 text-stone-600 dark:text-stone-400',
    warn: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    alert: 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400',
    good: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${tones[tone]}`}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {children}
    </span>
  );
}

/* ── Map of icons ───────────────────────────────────────────── */
const SOLUTION_ICONS = [Search, Code2, GitBranch];
const WHAT_WE_DO_ICONS = [Search, Brain, Building2, Star, Activity];
const WHY_ATELIER_ICONS = [Globe2, Cpu, Wallet, Sparkles];
const WHY_GLM4_ICONS = [Wallet, Globe2, Shield, Cpu];
const PROCESS_ICONS = [Search, Code2, Activity];

export default function AtelierPage() {
  const t = useTranslations('atelierTesla');

  /* ── Tesla interaction state ─────────────────────────────── */
  const [activeView, setActiveView] = useState<0 | 1 | 2>(0);

  /* ── Live demo state ──────────────────────────────────────── */
  const [demoQuery, setDemoQuery] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  /* ── ROI calculator state ─────────────────────────────────── */
  const [aiSearches, setAiSearches] = useState(1500);
  const [clientLtv, setClientLtv] = useState(12000);
  const [currentVis, setCurrentVis] = useState(0);

  // 35% visibility is the typical 6-month outcome after a Setup.
  const TARGET_VIS = 35;
  const monthlyProspects = Math.round(aiSearches * (1 - currentVis / 100));
  const annualRevenueLost = monthlyProspects * 12 * clientLtv * 0.02; // 2% conversion assumption
  const recoverable = annualRevenueLost * (TARGET_VIS / 100);
  const setupCost = 50000; // mid-range setup tier
  const paybackMonths = recoverable > 0 ? Math.max(1, Math.round((setupCost / recoverable) * 12 * 10) / 10) : 0;

  /* ── FAQ accordion state ───────────────────────────────────── */
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* ── Translation arrays (typed) ────────────────────────────── */
  const heroStats = t.raw('hero.stats') as { num: string; label: string }[];
  const problemStats = t.raw('problem.stats') as { num: string; label: string }[];
  const solutionItems = t.raw('solution.items') as { t: string; d: string }[];
  const teslaAuditLines = t.raw('tesla.audit.lines') as { label: string; value: string }[];
  const teslaOptimizeLines = t.raw('tesla.optimize.lines') as { label: string; value: string }[];
  const teslaMonitorLines = t.raw('tesla.monitor.lines') as { label: string; value: string }[];
  const demoCompetitors = t.raw('liveDemo.competitors') as string[];
  const whyAiSearchStats = t.raw('whyAiSearch.stats') as { num: string; label: string }[];
  const whatWeDoItems = t.raw('whatWeDo.items') as { t: string; d: string }[];
  const whyGlm4Stats = t.raw('whyGlm4.stats') as { num: string; label: string }[];
  const whyGlm4Items = t.raw('whyGlm4.items') as { t: string; d: string }[];
  const pricingPlans = t.raw('pricing.plans') as {
    name: string;
    tagline: string;
    price: string;
    size: string;
    features: string[];
    cta: string;
    featured?: boolean;
  }[];
  const pricingTrust = t.raw('pricing.trust') as string[];
  const calculatorSliders = t.raw('calculator.sliders') as {
    label: string;
    min: number;
    max: number;
    default: number;
    step: number;
    unit: string;
  }[];
  const comparisonHeaders = t.raw('comparison.headers') as string[];
  const comparisonRows = t.raw('comparison.rows') as string[][];
  const comparisonTakeaways = t.raw('comparison.takeaways') as { label: string; body: string }[];
  const processSteps = t.raw('process.steps') as { n: string; t: string; d: string; time: string }[];
  const whyAtelierItems = t.raw('whyAtelier.items') as { t: string; d: string }[];
  const testimonials = t.raw('testimonials.items') as {
    quote: string;
    author: string;
    role: string;
  }[];
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];
  const resourceItems = t.raw('resources.items') as { t: string; d: string; type: string }[];
  const geoCities = t.raw('geography.cities') as { name: string; type: string; plants: string }[];

  /* ── Format helpers ───────────────────────────────────────── */
  const fmt = useMemo(
    () => ({
      mad: (n: number) => n.toLocaleString('fr-MA'),
    }),
    []
  );

  return (
    <div
      className="bg-white font-sans text-neutral-950 antialiased selection:bg-emerald-500 selection:text-white"
      style={monoOverride}
    >

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Full-bleed Casablanca overview, HARCH · ATELIER badge
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-neutral-950">
        <Image
          src="/images/section-harch-overview.jpg"
          alt={t('hero.title')}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/55 to-neutral-950/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/75 via-neutral-950/20 to-transparent" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 35%, transparent 0%, rgba(10,10,10,0.45) 100%)',
          }}
        />
        <ForgeSparks />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-16 md:px-12 md:py-24">
          {/* Top — HARCH · ATELIER badge */}
          <Reveal>
            <div className="flex justify-center md:justify-start">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-5 py-2 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-neutral-200">
                  {t('hero.badge')}
                </span>
              </div>
            </div>
          </Reveal>

          {/* Center — headline + lead */}
          <div className="flex flex-1 items-center">
            <Reveal delay={0.05} className="mx-auto w-full max-w-5xl text-center md:mx-0 md:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                {t('hero.title')}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-300 md:mx-0 md:text-xl">
                {t('hero.subtitle')}
              </p>
            </Reveal>
          </div>

          {/* Bottom — stats + emerald CTA */}
          <Reveal delay={0.1} className="mx-auto w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-12">
              {heroStats.map((s, i) => (
                <div
                  key={i}
                  className="border-l-2 border-stone-500/50 pl-5 text-left"
                >
                  <div className="font-mono text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                    {s.num}
                  </div>
                  <div className="mt-1 text-xs font-light uppercase tracking-wider text-neutral-400 md:text-sm">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center md:justify-end">
              <Link
                href="/quote?vertical=atelier"
                aria-label={`${t('hero.cta')} — Harch Atelier`}
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('hero.cta')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href="tel:+212684440682"
                aria-label={t('ui.phone')}
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone size={14} aria-hidden="true" />
                {t('ui.phone')}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. SOCIAL PROOF BAND — GLM-4 · Casablanca · Building in Public
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-y border-neutral-800 bg-neutral-950 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-x-10 gap-y-3 px-6 sm:flex-row sm:gap-x-12 md:gap-x-16">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            <Cpu size={12} className="text-stone-400" aria-hidden="true" />
            {t('socialProof.glm4')}
            <span className="font-semibold text-neutral-200">{t('socialProof.glm4Brand')}</span>
          </span>
          <span className="hidden h-3 w-px bg-neutral-800 sm:inline-block" aria-hidden="true" />
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            <MapPin size={12} className="text-stone-400" aria-hidden="true" />
            {t('socialProof.morocco')}
          </span>
          <span className="hidden h-3 w-px bg-neutral-800 sm:inline-block" aria-hidden="true" />
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            <Sparkles size={12} className="text-stone-400" aria-hidden="true" />
            {t('socialProof.buildingPublic')}
          </span>
          <span className="hidden h-3 w-px bg-neutral-800 sm:inline-block" aria-hidden="true" />
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            <CalendarDays size={12} className="text-stone-400" aria-hidden="true" />
            {t('socialProof.founded')}
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. PROBLEM — image strip + body
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
          <Image
            src="/images/company/innovation-lab.jpg"
            alt={t('problem.title')}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/50 to-neutral-950/80" />
          <div className="relative z-10 flex h-full items-center justify-center px-6">
            <div className="grid w-full max-w-5xl grid-cols-1 gap-12 text-center md:grid-cols-3">
              {problemStats.map((s, i) => (
                <div key={i}>
                  <div className="font-mono text-4xl font-bold text-white sm:text-5xl md:text-6xl">{s.num}</div>
                  <div className="mt-3 text-xs font-light uppercase tracking-wider text-neutral-300 sm:text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white py-20 md:py-32">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-2 md:gap-16">
            <Reveal>
              <SectionLabel n="01" label={t('problem.label')} />
              <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-neutral-950 md:text-4xl">
                {t('problem.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-stone-500" />
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('problem.body')}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. SOLUTION — dark with 3 cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionLabel n="02" label={t('solution.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('solution.title')}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('solution.body')}
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {solutionItems.map((s, i) => {
              const Icon = SOLUTION_ICONS[i] || Search;
              return (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="group h-full rounded-2xl border border-neutral-800 bg-neutral-900 p-8 transition-colors hover:border-stone-500/40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 transition-colors group-hover:border-stone-500/40">
                      <Icon size={18} className="text-stone-400 transition-colors group-hover:text-stone-300" aria-hidden="true" />
                    </div>
                    <div className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-stone-400">
                      {`0${i + 1}`}
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-white">{s.t}</h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">{s.d}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. TESLA INTERACTION — Audit / Optimize / Monitor
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          {/* Heading */}
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionLabel n="03" label={t('tesla.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('tesla.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('tesla.body')}
            </p>
          </Reveal>

          {/* ── Large mockup screen ── */}
          <Reveal delay={0.05} className="mt-14">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              {/* Mockup chrome */}
              <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                </div>
                <div className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400 sm:block">
                  atelier.harch-corp.ma / engagement
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-stone-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                  {activeView === 0 ? t('tesla.tab1') : activeView === 1 ? t('tesla.tab2') : t('tesla.tab3')}
                </div>
              </div>

              {/* Mockup body — light surface */}
              <div className="bg-neutral-50 p-5 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >

                    {/* ───── VIEW 0 — AUDIT ───── */}
                    {activeView === 0 && (
                      <div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-3">
                              <Search size={20} className="text-stone-500" aria-hidden="true" />
                              <h3 className="text-lg font-bold text-neutral-950">
                                {t('tesla.audit.title')}
                              </h3>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-neutral-600">
                              {t('tesla.audit.body')}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-neutral-200 bg-white p-4">
                              <div className="font-mono text-2xl font-bold text-stone-600">
                                {t('tesla.audit.price')}
                              </div>
                              <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                                {t('ui.fixedPrice')}
                              </div>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white p-4">
                              <div className="font-mono text-2xl font-bold text-stone-600">
                                {t('tesla.audit.size')}
                              </div>
                              <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                                {t('tesla.tab1Desc')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Visibility report mockup */}
                        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                              audit-report.pdf · preview
                            </div>
                            <StatusPill tone="alert">visibility gap detected</StatusPill>
                          </div>
                          <div className="mb-5 text-sm font-medium text-neutral-700">
                            Query: <span className="font-mono text-stone-600">&quot;best software company in Morocco&quot;</span>
                          </div>
                          <div className="space-y-2.5">
                            {[
                              { engine: 'ChatGPT (GPT-4)', status: 'cited', who: 'Competitor A' },
                              { engine: 'Perplexity (Sonar)', status: 'cited', who: 'Competitor B' },
                              { engine: 'Google AI Overviews', status: 'absent', who: '—' },
                              { engine: 'GLM-4 (Z.ai)', status: 'absent', who: '—' },
                            ].map((row, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-2.5"
                              >
                                <span className="font-mono text-xs text-neutral-700">{row.engine}</span>
                                <div className="flex items-center gap-3">
                                  {row.status === 'cited' ? (
                                    <>
                                      <span className="font-mono text-[10px] text-neutral-500">{row.who}</span>
                                      <StatusPill tone="warn">competitor cited</StatusPill>
                                    </>
                                  ) : (
                                    <StatusPill tone="alert">your brand absent</StatusPill>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                          <table className="w-full min-w-[640px] border-collapse text-left">
                            <thead>
                              <tr className="border-b border-neutral-200 bg-neutral-50">
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.audit.deliverable')}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {teslaAuditLines.map((l, i) => (
                                <tr key={i} className="border-b border-neutral-100 last:border-0">
                                  <td className="px-4 py-3.5">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-600 sm:w-24 sm:flex-shrink-0">
                                        {l.label}
                                      </span>
                                      <span className="text-sm font-medium text-neutral-800">{l.value}</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2 font-mono text-xs text-stone-600">
                            <CheckCircle2 size={12} aria-hidden="true" />
                            {t('tesla.audit.alert')}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ───── VIEW 1 — OPTIMIZE ───── */}
                    {activeView === 1 && (
                      <div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-3">
                              <Code2 size={20} className="text-stone-500" aria-hidden="true" />
                              <h3 className="text-lg font-bold text-neutral-950">
                                {t('tesla.optimize.title')}
                              </h3>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-neutral-600">
                              {t('tesla.optimize.body')}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-neutral-200 bg-white p-4">
                              <div className="font-mono text-xl font-bold text-stone-600">
                                {t('tesla.optimize.price')}
                              </div>
                              <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                                {t('ui.bankTransfer')}
                              </div>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white p-4">
                              <div className="font-mono text-xl font-bold text-stone-600">
                                {t('tesla.optimize.size')}
                              </div>
                              <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                                {t('tesla.tab2Desc')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* GLM-4 content generation dashboard */}
                        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                          {/* Setup timeline */}
                          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                            <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                              geo-setup.log --weekly
                            </div>
                            <table className="w-full border-collapse text-left">
                              <tbody>
                                {teslaOptimizeLines.map((l, i) => (
                                  <tr key={i} className="border-b border-neutral-100 last:border-0">
                                    <td className="px-4 py-3">
                                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-600 sm:w-24 sm:flex-shrink-0">
                                          {l.label}
                                        </span>
                                        <span className="text-sm font-medium text-neutral-800">{l.value}</span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* GLM-4 content terminal */}
                          <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950">
                            <div className="border-b border-neutral-800 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                              <span className="text-stone-400">~/</span>atelier <span className="text-stone-400">·</span> glm-4-session
                            </div>
                            <div className="p-4 font-mono text-xs leading-relaxed">
                              <div className="text-neutral-500"><span className="text-emerald-400">$</span> glm-4 generate --topic "data sovereignty Morocco"</div>
                              <div className="text-neutral-400">→ draft v1 generated · 1,847 tokens · 0.18s</div>
                              <div className="text-neutral-500"><span className="text-emerald-400">$</span> glm-4 optimize --for-citation --schema Article</div>
                              <div className="text-neutral-400">→ schema.org/Article injected · 8 citations added</div>
                              <div className="text-neutral-500"><span className="text-emerald-400">$</span> wikidata entity upsert --qid Q1234</div>
                              <div className="text-stone-400">→ Wikidata entry created · 14 statements · 3 references</div>
                              <div className="text-neutral-500"><span className="text-emerald-400">$</span> deploy --target client-domain.ma</div>
                              <div className="text-neutral-400">→ 3 articles live · schema.org validated · crawlable</div>
                              <div className="text-neutral-500"><span className="text-emerald-400">$</span> status --visibility</div>
                              <div className="text-stone-400">→ entity ready · content indexed · awaiting AI re-train</div>
                              <div className="mt-2 flex items-center gap-2 text-stone-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                                setup at 60% · on schedule · 0 errors
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2 font-mono text-xs text-stone-600">
                            <CheckCircle2 size={12} aria-hidden="true" />
                            {t('tesla.optimize.alert')}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ───── VIEW 2 — MONITOR ───── */}
                    {activeView === 2 && (
                      <div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-3">
                              <Activity size={20} className="text-stone-500" aria-hidden="true" />
                              <h3 className="text-lg font-bold text-neutral-950">
                                {t('tesla.monitor.title')}
                              </h3>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-neutral-600">
                              {t('tesla.monitor.body')}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-neutral-200 bg-white p-4">
                              <div className="font-mono text-xl font-bold text-stone-600">
                                {t('tesla.monitor.price')}
                              </div>
                              <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                                {t('ui.bankTransfer')}
                              </div>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white p-4">
                              <div className="font-mono text-xl font-bold text-stone-600">
                                {t('tesla.monitor.size')}
                              </div>
                              <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                                {t('tesla.tab3Desc')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Visibility growth dashboard */}
                        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
                          <div className="mb-5 flex items-center justify-between">
                            <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                              monthly-report · visibility trend
                            </div>
                            <StatusPill tone="good">+18 citations vs prior month</StatusPill>
                          </div>
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {[
                              { engine: 'ChatGPT', before: 0, after: 12 },
                              { engine: 'Perplexity', before: 0, after: 9 },
                              { engine: 'Google AI', before: 0, after: 5 },
                              { engine: 'GLM-4', before: 0, after: 14 },
                            ].map((row, i) => (
                              <div
                                key={i}
                                className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
                              >
                                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                                  {row.engine}
                                </div>
                                <div className="mt-2 flex items-baseline gap-1.5">
                                  <span className="font-mono text-2xl font-bold text-stone-600">{row.after}</span>
                                  <span className="font-mono text-xs text-neutral-400">/ 200</span>
                                </div>
                                <div className="mt-1 font-mono text-[10px] text-emerald-600">
                                  ↑ from {row.before}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-5 h-px bg-neutral-200" />
                          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                            {[
                              { label: 'Total citations', value: '40' },
                              { label: 'Share of voice', value: '20%' },
                              { label: 'Avg position', value: '2.4' },
                              { label: 'Drift alerts', value: '0' },
                            ].map((row, i) => (
                              <div key={i} className="text-center">
                                <div className="font-mono text-xl font-bold text-stone-600">{row.value}</div>
                                <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                                  {row.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                          <table className="w-full min-w-[640px] border-collapse text-left">
                            <tbody>
                              {teslaMonitorLines.map((l, i) => (
                                <tr key={i} className="border-b border-neutral-100 last:border-0">
                                  <td className="px-4 py-3.5">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-600 sm:w-24 sm:flex-shrink-0">
                                        {l.label}
                                      </span>
                                      <span className="text-sm font-medium text-neutral-800">{l.value}</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2 font-mono text-xs text-stone-600">
                            <CheckCircle2 size={12} aria-hidden="true" />
                            {t('tesla.monitor.alert')}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>

          {/* ── 3 tab buttons ── */}
          <Reveal delay={0.1} className="mt-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { i: 0, label: t('tesla.tab1'), desc: t('tesla.tab1Desc') },
                { i: 1, label: t('tesla.tab2'), desc: t('tesla.tab2Desc') },
                { i: 2, label: t('tesla.tab3'), desc: t('tesla.tab3Desc') },
              ].map((tab) => (
                <button
                  key={tab.i}
                  onClick={() => setActiveView(tab.i as 0 | 1 | 2)}
                  aria-pressed={activeView === tab.i}
                  className={`group rounded-2xl border p-5 text-left transition-colors ${
                    activeView === tab.i
                      ? 'border-stone-500 bg-white shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[10px] uppercase tracking-wider ${activeView === tab.i ? 'text-stone-600' : 'text-neutral-400'}`}>
                      {`0${tab.i + 1}`}
                    </span>
                    {activeView === tab.i && <span className="h-1.5 w-1.5 rounded-full bg-stone-500" />}
                  </div>
                  <div className={`mt-2 text-base font-bold ${activeView === tab.i ? 'text-neutral-950' : 'text-neutral-700'}`}>
                    {tab.label}
                  </div>
                  <div className="mt-1 text-xs font-light text-neutral-500">{tab.desc}</div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              {t('tesla.tabHint')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. LIVE DEMO — input your business name, see mock ChatGPT response
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionLabel n="04" label={t('liveDemo.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('liveDemo.title')}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('liveDemo.body')}
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-12">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:p-8">
              {/* Input row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (demoQuery.trim().length > 0) setDemoSubmitted(true);
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <Search size={16} className="text-stone-500" aria-hidden="true" />
                  <input
                    type="text"
                    value={demoQuery}
                    onChange={(e) => {
                      setDemoQuery(e.target.value);
                      setDemoSubmitted(false);
                    }}
                    placeholder={t('liveDemo.placeholder')}
                    className="w-full bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
                    aria-label={t('liveDemo.placeholder')}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                >
                  {t('liveDemo.button')}
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </form>

              {/* Result */}
              <AnimatePresence>
                {demoSubmitted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="mt-6"
                  >
                    {/* Query echo */}
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                        {t('liveDemo.queryPrefix')} <span className="text-stone-300">{demoQuery.trim()}</span> {t('liveDemo.querySuffix')}
                      </div>
                    </div>

                    {/* Mock ChatGPT response */}
                    <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900">
                            <Brain size={14} className="text-stone-400" aria-hidden="true" />
                          </div>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                            {t('liveDemo.resultTitle')}
                          </span>
                        </div>
                        <StatusPill tone="alert">{t('liveDemo.absent')}</StatusPill>
                      </div>
                      <p className="text-sm font-light leading-relaxed text-neutral-300">
                        {t('liveDemo.absentBody')}
                      </p>
                      <div className="mt-5 border-t border-neutral-800 pt-4">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                          {t('liveDemo.competitorLabel')}
                        </div>
                        <ul className="mt-3 space-y-2">
                          {demoCompetitors.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-stone-500" />
                              <span className="font-light">{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                        {t('liveDemo.footer')}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setDemoQuery('');
                          setDemoSubmitted(false);
                        }}
                        className="font-mono text-[10px] uppercase tracking-wider text-stone-400 transition-colors hover:text-stone-300"
                      >
                        {t('liveDemo.tryAgain')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. WHY AI SEARCH MATTERS — stats grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionLabel n="05" label={t('whyAiSearch.label')} />
            <h2 className="mt-5 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-neutral-950 md:text-4xl">
              {t('whyAiSearch.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-stone-500" />
            <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('whyAiSearch.body')}
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {whyAiSearchStats.map((s, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-colors hover:border-stone-300">
                  <div className="font-mono text-3xl font-bold text-stone-600 sm:text-4xl">{s.num}</div>
                  <div className="mt-2 text-xs font-light leading-relaxed text-neutral-600">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. WHAT WE DO — 5 services
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionLabel n="06" label={t('whatWeDo.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('whatWeDo.title')}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('whatWeDo.body')}
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {whatWeDoItems.map((s, i) => {
              const Icon = WHAT_WE_DO_ICONS[i] || Search;
              return (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="group h-full rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-stone-500/40">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 transition-colors group-hover:border-stone-500/40">
                        <Icon size={18} className="text-stone-400 transition-colors group-hover:text-stone-300" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-xs font-bold text-stone-500">{`0${i + 1}`}</span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-white">{s.t}</h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">{s.d}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. WHY GLM-4 — stats + items
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionLabel n="07" label={t('whyGlm4.label')} />
            <h2 className="mt-5 max-w-4xl text-2xl font-bold leading-tight tracking-tight text-neutral-950 md:text-4xl">
              {t('whyGlm4.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-stone-500" />
            <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('whyGlm4.body')}
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-3 gap-6 border-y border-neutral-200 py-10">
            {whyGlm4Stats.map((s, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="text-center">
                  <div className="font-mono text-3xl font-bold text-stone-600 sm:text-5xl">{s.num}</div>
                  <div className="mt-2 text-xs font-light text-neutral-500 sm:text-sm">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {whyGlm4Items.map((s, i) => {
              const Icon = WHY_GLM4_ICONS[i] || Cpu;
              return (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="group h-full rounded-2xl border border-neutral-200 bg-white p-6 transition-colors hover:border-stone-300">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 transition-colors group-hover:border-stone-300">
                        <Icon size={18} className="text-stone-500" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-neutral-950">{s.t}</h3>
                        <p className="mt-2 text-sm font-light leading-relaxed text-neutral-600">{s.d}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. PRICING — 3 cards + trust strip
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionLabel n="08" label={t('pricing.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('pricing.title')}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('pricing.subtitle')}
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-8 transition-colors ${
                    plan.featured
                      ? 'border-stone-500/60 bg-neutral-900'
                      : 'border-neutral-800 bg-neutral-900 hover:border-stone-500/40'
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full border border-stone-500/40 bg-neutral-950 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      <span className="h-1 w-1 rounded-full bg-stone-400" />
                      {t('pricing.featuredBadge')}
                    </span>
                  )}
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                    {plan.tagline}
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-white sm:text-4xl">{plan.price}</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                    {plan.size}
                  </div>
                  <ul className="mt-6 space-y-3 border-t border-neutral-800 pt-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm font-light text-neutral-300">
                        <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-stone-500" aria-hidden="true" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-2">
                    <Link
                      href="/quote?vertical=atelier"
                      aria-label={`${plan.cta} — Harch Atelier`}
                      className={`group inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
                        plan.featured
                          ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                          : 'border border-neutral-700 text-white hover:bg-neutral-800'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Trust strip */}
          <Reveal delay={0.1} className="mt-12">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:p-8">
              <div className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {t('pricing.trustTitle')}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {pricingTrust.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-light text-neutral-300">
                    <CheckCircle2 size={14} className="flex-shrink-0 text-stone-500" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. ROI CALCULATOR — 3 sliders + 4 results
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionLabel n="09" label={t('calculator.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-neutral-950 md:text-4xl">
              {t('calculator.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('calculator.subtitle')}
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
              {/* Sliders */}
              <div className="lg:col-span-3">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
                  {[
                    {
                      label: calculatorSliders[0].label,
                      value: aiSearches,
                      set: setAiSearches,
                      min: calculatorSliders[0].min,
                      max: calculatorSliders[0].max,
                      step: calculatorSliders[0].step,
                      unit: calculatorSliders[0].unit,
                    },
                    {
                      label: calculatorSliders[1].label,
                      value: clientLtv,
                      set: setClientLtv,
                      min: calculatorSliders[1].min,
                      max: calculatorSliders[1].max,
                      step: calculatorSliders[1].step,
                      unit: calculatorSliders[1].unit,
                    },
                    {
                      label: calculatorSliders[2].label,
                      value: currentVis,
                      set: setCurrentVis,
                      min: calculatorSliders[2].min,
                      max: calculatorSliders[2].max,
                      step: calculatorSliders[2].step,
                      unit: calculatorSliders[2].unit,
                    },
                  ].map((s, i) => (
                    <div key={i} className={i > 0 ? 'mt-8' : ''}>
                      <div className="flex items-baseline justify-between">
                        <label className="text-sm font-medium text-neutral-700">{s.label}</label>
                        <span className="font-mono text-lg font-bold text-stone-600">
                          {s.value.toLocaleString('fr-MA')}
                          {s.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={s.value}
                        onChange={(e) => s.set(Number(e.target.value))}
                        className="mt-3 w-full accent-stone-500"
                        aria-label={s.label}
                      />
                      <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                        <span>{s.min.toLocaleString('fr-MA')}{s.unit}</span>
                        <span>{s.max.toLocaleString('fr-MA')}{s.unit}</span>
                      </div>
                    </div>
                  ))}
                  <p className="mt-6 border-t border-neutral-200 pt-4 text-xs font-light text-neutral-500">
                    {t('calculator.recoverableNote')}
                  </p>
                </div>
              </div>

              {/* Results */}
              <div className="lg:col-span-2">
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 md:p-8">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    {t('calculator.results.monthly')}
                  </div>
                  <div className="font-mono text-3xl font-bold text-stone-600">
                    {monthlyProspects.toLocaleString('fr-MA')}
                  </div>
                  <div className="mt-3 h-px bg-neutral-200" />
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    {t('calculator.results.annual')}
                  </div>
                  <div className="font-mono text-3xl font-bold text-stone-600">
                    {fmt.mad(annualRevenueLost)} MAD
                  </div>
                  <div className="mt-3 h-px bg-neutral-200" />
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    {t('calculator.results.recoverable')}
                  </div>
                  <div className="font-mono text-3xl font-bold text-emerald-600">
                    {fmt.mad(recoverable)} MAD
                  </div>
                  <div className="mt-3 h-px bg-neutral-200" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                        {t('calculator.paybackBadge')}
                      </div>
                      <div className="mt-1 font-mono text-2xl font-bold text-stone-600">
                        {paybackMonths} <span className="text-base text-neutral-400">{t('ui.month')}.</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                        {t('calculator.results.payback')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-6 text-center text-xs font-light text-neutral-500">
              {t('calculator.disclaimer')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          12. COMPARISON — table + 3 takeaways
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionLabel n="10" label={t('comparison.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('comparison.title')}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('comparison.subtitle')}
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-12">
            <div className="overflow-x-auto rounded-2xl border border-neutral-800">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900">
                    {comparisonHeaders.map((h, i) => (
                      <th
                        key={i}
                        className={`px-5 py-4 font-mono text-[11px] font-semibold uppercase tracking-wider ${
                          i === 1 ? 'text-stone-400' : 'text-neutral-500'
                        }`}
                      >
                        {i === 1 && (
                          <span className="mr-2 inline-flex items-center gap-1 rounded-full border border-stone-500/40 bg-stone-500/10 px-2 py-0.5 text-[9px] font-bold text-stone-400">
                            <span className="h-1 w-1 rounded-full bg-stone-400" />
                            {t('comparison.highlightBadge')}
                          </span>
                        )}
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="border-b border-neutral-800/60 last:border-0">
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`px-5 py-4 text-sm ${
                            j === 0
                              ? 'font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-500'
                              : j === 1
                                ? 'font-medium text-white'
                                : 'font-light text-neutral-400'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {comparisonTakeaways.map((item, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div
                  className={`h-full rounded-2xl border p-6 ${
                    item.label === t('comparison.highlightBadge')
                      ? 'border-stone-500/60 bg-neutral-900'
                      : 'border-neutral-800 bg-neutral-900'
                  }`}
                >
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {item.label}
                  </div>
                  <p className="mt-3 text-sm font-light leading-relaxed text-neutral-300">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          13. PROCESS — 3 steps
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionLabel n="11" label={t('process.label')} />
            <h2 className="mt-5 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-neutral-950 md:text-4xl">
              {t('process.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-stone-500" />
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {processSteps.map((step, i) => {
              const Icon = PROCESS_ICONS[i] || Search;
              return (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="group h-full rounded-2xl border border-neutral-200 bg-white p-6 transition-colors hover:border-stone-300">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 transition-colors group-hover:border-stone-300">
                        <Icon size={18} className="text-stone-500" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-3xl font-bold text-neutral-200">{step.n}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-neutral-950">{step.t}</h3>
                    <div className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-stone-600">
                      <Clock size={10} aria-hidden="true" />
                      {step.time}
                    </div>
                    <p className="mt-3 text-sm font-light leading-relaxed text-neutral-600">{step.d}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          14. WHY ATELIER — 4 reasons + Building in Public image
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionLabel n="12" label={t('whyAtelier.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('whyAtelier.title')}</h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {whyAtelierItems.map((s, i) => {
                  const Icon = WHY_ATELIER_ICONS[i] || Sparkles;
                  return (
                    <div
                      key={i}
                      className="group h-full rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-stone-500/40"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 transition-colors group-hover:border-stone-500/40">
                        <Icon size={18} className="text-stone-400 transition-colors group-hover:text-stone-300" aria-hidden="true" />
                      </div>
                      <h3 className="mt-4 text-base font-bold text-white">{s.t}</h3>
                      <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">{s.d}</p>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800">
                <Image
                  src="/images/real/hq-casablanca-new.jpg"
                  alt={t('socialProof.morocco')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-300">
                    {t('ui.casablanca')}
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">{t('socialProof.buildingPublic')}</div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Metrics strip */}
          <Reveal delay={0.1} className="mt-10">
            <div className="grid grid-cols-2 gap-6 border-y border-neutral-800 py-8 md:grid-cols-4">
              {[
                { num: '2024', label: t('socialProof.founded') },
                { num: 'GLM-4', label: t('socialProof.glm4') },
                { num: '0', label: t('trust.noLockIn') },
                { num: 'FR · AR', label: t('socialProof.moroccoFlag') },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <div className="font-mono text-2xl font-bold text-white sm:text-3xl">{m.num}</div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          15. CASE STUDY — Harch Corp lui-même
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionLabel n="13" label={t('caseStudy.label')} />
            <h2 className="mt-5 max-w-4xl text-2xl font-bold leading-tight tracking-tight text-neutral-950 md:text-4xl">
              {t('caseStudy.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-stone-500" />
          </Reveal>

          <Reveal delay={0.05}>
            <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('caseStudy.body')}
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="grid grid-cols-3 gap-4 border-y border-neutral-200 py-8">
                {[
                  { num: t('caseStudy.metric1'), label: t('caseStudy.metric1Label') },
                  { num: t('caseStudy.metric2'), label: t('caseStudy.metric2Label') },
                  { num: t('caseStudy.metric3'), label: t('caseStudy.metric3Label') },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="font-mono text-2xl font-bold text-stone-600 sm:text-3xl">{m.num}</div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <Quote size={20} className="text-stone-500" aria-hidden="true" />
                <p className="mt-3 text-base font-light leading-relaxed text-neutral-700 md:text-lg">
                  &ldquo;{t('caseStudy.quote')}&rdquo;
                </p>
                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <div className="text-sm font-semibold text-neutral-950">{t('caseStudy.quoteAuthor')}</div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {t('caseStudy.quoteRole')}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200">
                <Image
                  src="/images/intelligence/harchos-architecture.png"
                  alt={t('caseStudy.title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          16. TESTIMONIALS — 3 quotes
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionLabel n="14" label={t('testimonials.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('testimonials.title')}</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="flex h-full flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-stone-500/40">
                  <Quote size={20} className="text-stone-500" aria-hidden="true" />
                  <p className="mt-4 flex-1 text-sm font-light leading-relaxed text-neutral-300">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="mt-6 border-t border-neutral-800 pt-4">
                    <div className="text-sm font-semibold text-white">{item.author}</div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                      {item.role}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          17. FAQ — 8 questions accordion
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="text-center">
            <SectionLabel n="15" label={t('faq.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('faq.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.05} className="mt-12">
            <div className="divide-y divide-neutral-200 border-y border-neutral-200">
              {faqItems.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    >
                      <span className="text-base font-semibold text-neutral-950 md:text-lg">{item.q}</span>
                      <ChevronDown
                        size={18}
                        className={`flex-shrink-0 text-stone-500 transition-transform duration-200 ${
                          open ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 pr-8 text-sm font-light leading-relaxed text-neutral-600 md:text-base">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          18. RESOURCES — 4 cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionLabel n="16" label={t('resources.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('resources.title')}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('resources.subtitle')}
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {resourceItems.map((item, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <div className="group flex h-full items-start gap-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-stone-500/40">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 transition-colors group-hover:border-stone-500/40">
                    <FileText size={18} className="text-stone-400 transition-colors group-hover:text-stone-300" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold text-white">{item.t}</h3>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                        {item.type}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">{item.d}</p>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-stone-400 transition-colors hover:text-stone-300"
                    >
                      {t('resources.download')}
                      <ArrowRight size={10} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          19. GEOGRAPHY — francophone world cities + Casablanca image
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionLabel n="17" label={t('geography.label')} />
            <h2 className="mt-5 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-neutral-950 md:text-4xl">
              {t('geography.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-stone-500" />
            <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('geography.body')}
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {geoCities.map((c, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border p-4 transition-colors ${
                      c.type === 'HQ'
                        ? 'border-stone-500/60 bg-neutral-50'
                        : 'border-neutral-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className={c.type === 'HQ' ? 'text-stone-600' : 'text-neutral-400'} aria-hidden="true" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{c.type}</span>
                    </div>
                    <div className="mt-2 text-sm font-bold text-neutral-950">{c.name}</div>
                    <div className="mt-1 font-mono text-[10px] text-neutral-500">{c.plants}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200">
                <Image
                  src="/images/sections/overview-casablanca.jpg"
                  alt={t('geography.title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-200">
                    {t('socialProof.morocco')}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          20. FINAL CTA — image bg + emerald + secondary + back to Harch Corp
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950">
        <Image
          src="/images/intelligence/harchos-dashboard.png"
          alt={t('finalCta.title')}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-950/85 to-neutral-950/95" />
        <ForgeSparks opacity={0.05} />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
          <Reveal>
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-5 py-2 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-neutral-200">
                  {t('finalCta.label')}
                </span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mx-auto mt-8 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t('finalCta.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-300 md:text-lg">
              {t('finalCta.body')}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center">
              <Link
                href="/quote?vertical=atelier"
                aria-label={`${t('finalCta.primary')} — Harch Atelier`}
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('finalCta.primary')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/"
                aria-label={t('finalCta.secondary')}
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                {t('finalCta.secondary')}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-neutral-800 pt-8 sm:flex-row sm:gap-8">
              <a
                href="tel:+212684440682"
                aria-label={t('ui.phone')}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-neutral-400 transition-colors hover:text-white"
              >
                <Phone size={12} aria-hidden="true" />
                {t('ui.phone')}
              </a>
              <span className="hidden h-3 w-px bg-neutral-800 sm:inline-block" aria-hidden="true" />
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-neutral-400">
                <Cpu size={12} className="text-stone-400" aria-hidden="true" />
                {t('socialProof.glm4')} · {t('socialProof.glm4Brand')}
              </span>
              <span className="hidden h-3 w-px bg-neutral-800 sm:inline-block" aria-hidden="true" />
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-neutral-400">
                <MapPin size={12} className="text-stone-400" aria-hidden="true" />
                {t('socialProof.morocco')}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Back to Harch Corp footer band
          ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-white"
          aria-label={t('ui.backToHarchCorp')}
        >
          <ArrowLeft size={12} aria-hidden="true" />
          {t('ui.backToHarchCorp')}
        </Link>
      </footer>
    </div>
  );
}

'use client';

import { useState, type CSSProperties } from 'react';
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
  Download,
  Quote,
  MapPin,
  Clock,
  Banknote,
  Building2,
  Factory,
  Server,
  Truck,
  Droplets,
  Wheat,
  Mountain,
  Home,
  Zap,
  Globe,
  HandCoins,
  HardHat,
  Settings,
  ArrowRightLeft,
  Sparkles,
  Target,
  Layers,
  Activity,
  PieChart,
  LineChart as LineChartIcon,
  Landmark,
  Scale,
  Star,
  Award,
  Wallet,
  Briefcase,
  Cpu,
  Network,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HARCH FINANCE — Harch Corp Brand System v2 compliant
   ───────────────────────────────────────────────────────────────
   • Backgrounds : bg-neutral-950 (dark) · bg-white / bg-neutral-50 (light)
   • Text        : text-neutral-950 / text-white / text-neutral-500 / text-neutral-400
   • Borders     : border-neutral-200 (light) · border-neutral-800 (dark)
   • Accent      : yellow-500 (subsidiary) — labels, key stats, icon bg, hovers, accent bars
   • Primary CTA : bg-emerald-500 (Harch brand green — the unifying thread)
   • Typography  : Inter (font-sans) for everything · Space Mono (font-mono) for data
   • Unique motif: Islamic 8-point star (subtle geometric SVG)
   • Tesla interaction: Pipeline / Portfolio / Track Record (3-button mockup switcher)
   • NO wave dividers · 24+ sections · 'use client' · framer-motion
   ═══════════════════════════════════════════════════════════════ */

const WHY_ICONS = [HandCoins, LineChartIcon, Scale, Briefcase];
const SECTOR_ICONS = [Zap, Truck, Server, Droplets, Wheat, Mountain, Factory, Home];
const INNOVATION_ICONS = [Sparkles, Layers, Cpu, Activity];

/* Override Tailwind's --font-mono on this subtree so every `font-mono` utility
   renders Space Mono per the Harch Brand System. */
const monoOverride = {
  '--font-mono': 'var(--font-space-mono)',
} as CSSProperties;

/* ── Section label helper — Harch brand pattern ──────────────── */
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
      className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] ${
        align === 'center' ? 'justify-center' : ''
      }`}
    >
      {n && <span className={dark ? 'text-neutral-600' : 'text-neutral-400'}>{`// ${n}`}</span>}
      <span className="h-px w-8 bg-yellow-500/60" />
      <span className="text-yellow-600 dark:text-yellow-500">{label}</span>
    </div>
  );
}

/* ── Islamic 8-point star — Finance subsidiary unique motif ─── */
function IslamicStarField() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 h-full w-full"
      style={{ opacity: 0.07 }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="fin-stars" width="220" height="220" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#eab308" strokeWidth="0.6">
            {/* 8-point star = two overlapping squares */}
            <rect x="60" y="60" width="100" height="100" transform="rotate(0 110 110)" />
            <rect x="60" y="60" width="100" height="100" transform="rotate(45 110 110)" />
            <circle cx="110" cy="110" r="60" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#fin-stars)" />
    </svg>
  );
}

/* ── Tiny status pill used by the Tesla mockups ─────────────── */
function StatusPill({ tone, children }: { tone: 'opt' | 'warn' | 'alert'; children: React.ReactNode }) {
  const tones = {
    opt: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    warn: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    alert: 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400',
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${tones[tone]}`}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {children}
    </span>
  );
}

export default function FinancePage() {
  const t = useTranslations('financeTesla');

  /* ── Tesla interaction state ─────────────────────────────── */
  const [activeView, setActiveView] = useState<0 | 1 | 2>(0);

  /* ── Calculator state — project capital need ──────────────── */
  const [capital, setCapital] = useState(500);
  const debtPct = 0.6;
  const equityPct = 0.4;
  const costOfDebt = 0.08;
  const tenor = 12;
  const yearlyDebtService = Math.round((capital * debtPct * costOfDebt) / 1);
  const monthlyDebtService = Math.round(yearlyDebtService / 12);
  const equityIRR = 14.2;

  /* ── FAQ accordion state ───────────────────────────────────── */
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* ── Translation arrays (typed) ────────────────────────────── */
  const heroStats = t.raw('hero.stats') as { num: string; label: string }[];
  const hardwareStats = t.raw('hardware.stats') as { num: string; label: string }[];
  const epcStats = t.raw('epc.stats') as { num: string; label: string }[];
  const epcFeatures = t.raw('epc.features') as string[];
  const serviceStats = t.raw('service.stats') as { num: string; label: string }[];
  const processSteps = t.raw('process.steps') as { n: string; t: string; d: string; time: string }[];
  const applicationItems = t.raw('applications.items') as { t: string; d: string }[];
  const whyItems = t.raw('whyHarch.items') as { t: string; d: string }[];
  const comparisonHeaders = t.raw('comparison.headers') as string[];
  const comparisonRows = t.raw('comparison.rows') as string[][];
  const sectorItems = t.raw('sectors.items') as string[];
  const pricingPlans = t.raw('pricing.plans') as {
    name: string;
    tagline: string;
    price: string;
    size: string;
    features: string[];
    cta: string;
    featured?: boolean;
  }[];
  const geoCities = t.raw('geography.cities') as { name: string; type: string; plants: string }[];
  const testimonials = t.raw('testimonials.items') as {
    quote: string;
    author: string;
    role: string;
  }[];
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];
  const resourceItems = t.raw('resources.items') as { t: string; d: string; type: string }[];
  const caseStudies = t.raw('caseStudies.items') as {
    name: string;
    sector: string;
    location: string;
    amount: string;
    irr: string;
    time: string;
    description: string;
  }[];
  const portfolioTicker = t.raw('portfolio.ticker') as string[];
  const portfolioAlloc = t.raw('portfolio.allocation.items') as {
    label: string;
    value: string;
    pct: number;
  }[];
  const portfolioRisk = t.raw('portfolio.riskItems') as {
    label: string;
    value: string;
    note: string;
  }[];
  const islamicStats = t.raw('islamicFinance.stats') as { num: string; label: string }[];
  const islamicFeatures = t.raw('islamicFinance.features') as string[];
  const innovationItems = t.raw('innovation.items') as { t: string; d: string }[];
  const softwareMetrics = t.raw('software.metrics') as {
    label: string;
    value: string;
    color: string;
    bg: string;
  }[];
  const softwareProducts = t.raw('software.products') as { t: string; d: string }[];
  const lenders = t.raw('lenderNetwork.lenders') as {
    name: string;
    role: string;
    ticket: string;
    type: string;
  }[];

  /* ── Tesla mockup translation arrays ──────────────────────── */
  const pipelineProjects = t.raw('tesla.pipeline.projects') as {
    name: string;
    stage: string;
    sector: string;
    ticket: string;
    close: string;
  }[];
  const portfolioCompanies = t.raw('tesla.portfolio.companies') as {
    name: string;
    sector: string;
    deployed: string;
    irr: string;
    status: string;
  }[];
  const trackIrrRows = t.raw('tesla.trackRecord.irrRows') as {
    label: string;
    value: string;
    note: string;
  }[];

  return (
    <div
      className="bg-white font-sans text-neutral-950 antialiased selection:bg-emerald-500 selection:text-white"
      style={monoOverride}
    >

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Full-bleed finance district, HARCH · FINANCE badge
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-neutral-950">
        <Image
          src="/images/sections/finance-district.jpg"
          alt={t('overview.title')}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/75 via-neutral-950/55 to-neutral-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 to-transparent" />
        <IslamicStarField />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-16 md:px-12 md:py-24">
          {/* Top — HARCH · FINANCE badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center md:justify-start"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-5 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-neutral-200">
                {t('hero.badge')}
              </span>
            </div>
          </motion.div>

          {/* Center — headline + lead */}
          <div className="flex flex-1 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-5xl text-center md:mx-0 md:text-left"
            >
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                {t('hero.title')}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-300 md:mx-0 md:text-xl">
                {t('overview.body').split('.')[0] + '.'}
              </p>
            </motion.div>
          </div>

          {/* Bottom — stats + emerald CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto w-full max-w-6xl"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-12">
              {heroStats.map((s, i) => (
                <div
                  key={i}
                  className="border-l-2 border-yellow-500/50 pl-5 text-left"
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
                href="/quote?vertical=finance"
                aria-label={`${t('hero.cta')} — Harch Finance`}
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('hero.cta')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href="tel:+212684440682"
                aria-label={`${t('ctaSection.callCta')} +212 684 440 682`}
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone size={14} aria-hidden="true" />
                {t('ctaSection.callCta')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. OVERVIEW — clean light section
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-5"
          >
            <SectionLabel n="01" label={t('overview.label')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('overview.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-yellow-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-7"
          >
            <p className="text-lg font-light leading-relaxed text-neutral-500 md:text-xl">
              {t('overview.body')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. TESLA INTERACTION — Pipeline / Portfolio / Track Record
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(234,179,8,0.10) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(234,179,8,0.10) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          {/* Heading */}
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="02" label={t('tesla.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('tesla.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('tesla.body')}
            </p>
          </div>

          {/* ── Live ticker bar ───────────────────────────── */}
          <div className="mt-10 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/60">
            <div className="flex items-center gap-8 overflow-x-auto px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider">
              {portfolioTicker.map((tk, i) => (
                <span key={i} className="flex flex-shrink-0 items-center gap-2 text-yellow-400">
                  <span className="h-1 w-1 rounded-full bg-yellow-500" />
                  {tk}
                </span>
              ))}
            </div>
          </div>

          {/* ── Large mockup screen ─────────────────────────── */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            {/* Mockup chrome */}
            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950/60 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                harch.finance / portfolio / live
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-yellow-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500" />
                LIVE · Q3 2025
              </div>
            </div>

            {/* Mockup body */}
            <div className="p-5 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >

                  {/* ───── VIEW 0 — PIPELINE ───── */}
                  {activeView === 0 && (
                    <div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3">
                            <Briefcase size={20} className="text-yellow-500" aria-hidden="true" />
                            <h3 className="text-lg font-bold text-white">
                              {t('tesla.pipeline.title')}
                            </h3>
                          </div>
                          <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-neutral-400">
                            {t('tesla.pipeline.body')}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-yellow-500">
                              {t('tesla.pipeline.stat1Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.pipeline.stat1Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-yellow-500">
                              {t('tesla.pipeline.stat2Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.pipeline.stat2Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-yellow-500">
                              {t('tesla.pipeline.stat3Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.pipeline.stat3Label')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pipeline table */}
                      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/40">
                        <table className="w-full min-w-[720px] border-collapse text-left">
                          <thead>
                            <tr className="border-b border-neutral-800 bg-neutral-950/60">
                              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                {t('tesla.pipeline.legend.name')}
                              </th>
                              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                {t('tesla.pipeline.legend.stage')}
                              </th>
                              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                {t('tesla.pipeline.legend.sector')}
                              </th>
                              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                {t('tesla.pipeline.legend.ticket')}
                              </th>
                              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                {t('tesla.pipeline.legend.close')}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pipelineProjects.map((p, i) => (
                              <tr key={i} className="border-b border-neutral-800/60 last:border-0">
                                <td className="px-4 py-3 text-sm font-medium text-white">{p.name}</td>
                                <td className="px-4 py-3">
                                  <StatusPill tone={p.stage.toLowerCase().includes('clos') ? 'opt' : p.stage.toLowerCase().includes('origin') ? 'warn' : 'opt'}>
                                    {p.stage}
                                  </StatusPill>
                                </td>
                                <td className="px-4 py-3 font-mono text-sm text-neutral-300">{p.sector}</td>
                                <td className="px-4 py-3 font-mono text-sm font-bold text-yellow-400">{p.ticket}</td>
                                <td className="px-4 py-3 font-mono text-sm text-neutral-300">{p.close}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs text-yellow-400">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          {t('tesla.pipeline.alert')}
                        </div>
                        <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                          {t('tesla.pipeline.poweredBy')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ───── VIEW 1 — PORTFOLIO ───── */}
                  {activeView === 1 && (
                    <div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3">
                            <PieChart size={20} className="text-yellow-500" aria-hidden="true" />
                            <h3 className="text-lg font-bold text-white">
                              {t('tesla.portfolio.title')}
                            </h3>
                          </div>
                          <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-neutral-400">
                            {t('tesla.portfolio.body')}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-yellow-500">
                              {t('tesla.portfolio.stat1Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.portfolio.stat1Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-yellow-500">
                              {t('tesla.portfolio.stat2Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.portfolio.stat2Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-yellow-500">
                              {t('tesla.portfolio.stat3Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.portfolio.stat3Label')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Companies table + allocation bars */}
                      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
                        <div className="lg:col-span-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/40">
                          <table className="w-full border-collapse text-left">
                            <thead>
                              <tr className="border-b border-neutral-800 bg-neutral-950/60">
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.portfolio.legend.name')}
                                </th>
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.portfolio.legend.sector')}
                                </th>
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.portfolio.legend.deployed')}
                                </th>
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.portfolio.legend.irr')}
                                </th>
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.portfolio.legend.status')}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {portfolioCompanies.map((c, i) => (
                                <tr key={i} className="border-b border-neutral-800/60 last:border-0">
                                  <td className="px-4 py-3 text-sm font-medium text-white">{c.name}</td>
                                  <td className="px-4 py-3 font-mono text-sm text-neutral-300">{c.sector}</td>
                                  <td className="px-4 py-3 font-mono text-sm text-yellow-400">{c.deployed}</td>
                                  <td className="px-4 py-3 font-mono text-sm font-bold text-yellow-400">{c.irr}</td>
                                  <td className="px-4 py-3">
                                    <StatusPill tone={c.status.toLowerCase().includes('perform') ? 'opt' : 'opt'}>
                                      {c.status}
                                    </StatusPill>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">
                          <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                            {t('portfolio.allocation.title')}
                          </div>
                          <div className="mt-4 space-y-3">
                            {portfolioAlloc.map((a, i) => (
                              <div key={i}>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-neutral-300">{a.label}</span>
                                  <span className="font-mono text-yellow-400">{a.value} · {a.pct}%</span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                                  <div className="h-full rounded-full bg-yellow-500" style={{ width: `${a.pct}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs text-yellow-400">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          {t('tesla.portfolio.alert')}
                        </div>
                        <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                          {t('tesla.portfolio.poweredBy')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ───── VIEW 2 — TRACK RECORD ───── */}
                  {activeView === 2 && (
                    <div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3">
                            <Award size={20} className="text-yellow-500" aria-hidden="true" />
                            <h3 className="text-lg font-bold text-white">
                              {t('tesla.trackRecord.title')}
                            </h3>
                          </div>
                          <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-neutral-400">
                            {t('tesla.trackRecord.body')}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-yellow-500">
                              {t('tesla.trackRecord.stat1Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.trackRecord.stat1Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-yellow-500">
                              {t('tesla.trackRecord.stat2Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.trackRecord.stat2Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-yellow-500">
                              {t('tesla.trackRecord.stat3Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.trackRecord.stat3Label')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* IRR table + chart */}
                      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
                        <div className="lg:col-span-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/40">
                          <table className="w-full border-collapse text-left">
                            <thead>
                              <tr className="border-b border-neutral-800 bg-neutral-950/60">
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.trackRecord.legend.label')}
                                </th>
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.trackRecord.legend.value')}
                                </th>
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.trackRecord.legend.note')}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {trackIrrRows.map((r, i) => (
                                <tr key={i} className="border-b border-neutral-800/60 last:border-0">
                                  <td className="px-4 py-3 text-sm font-medium text-neutral-300">{r.label}</td>
                                  <td className="px-4 py-3 font-mono text-sm font-bold text-yellow-400">{r.value}</td>
                                  <td className="px-4 py-3 text-xs font-light text-neutral-500">{r.note}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* IRR bars chart */}
                        <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">
                          <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                            {t('ui.irrTargetActual')}
                          </div>
                          <div className="mt-4 space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-neutral-300">{t('ui.target15')}</span>
                                <span className="font-mono text-neutral-300">15.0%</span>
                              </div>
                              <div className="mt-1 h-3 overflow-hidden rounded-full bg-neutral-800">
                                <div className="h-full rounded-full bg-neutral-400" style={{ width: `75%` }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-yellow-400">{t('ui.actual142')}</span>
                                <span className="font-mono font-bold text-yellow-400">14.2%</span>
                              </div>
                              <div className="mt-1 h-3 overflow-hidden rounded-full bg-neutral-800">
                                <div className="h-full rounded-full bg-yellow-500" style={{ width: `71%` }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-neutral-400">Hurdle 12%</span>
                                <span className="font-mono text-neutral-400">12.0%</span>
                              </div>
                              <div className="mt-1 h-3 overflow-hidden rounded-full bg-neutral-800">
                                <div className="h-full rounded-full bg-neutral-500" style={{ width: `60%` }} />
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 rounded-md border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
                            <div className="font-mono text-[10px] uppercase tracking-wider text-yellow-400">
                              {t('ui.irrPortfolio')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          {t('tesla.trackRecord.alert')}
                        </div>
                        <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                          {t('tesla.trackRecord.poweredBy')}
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── 3 Tesla buttons ────────────────────────────── */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            {[
              { idx: 0 as const, icon: Briefcase, tab: t('tesla.tab1'), desc: t('tesla.tab1Desc') },
              { idx: 1 as const, icon: PieChart, tab: t('tesla.tab2'), desc: t('tesla.tab2Desc') },
              { idx: 2 as const, icon: Award, tab: t('tesla.tab3'), desc: t('tesla.tab3Desc') },
            ].map(({ idx, icon: Icon, tab, desc }) => {
              const active = activeView === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveView(idx)}
                  aria-pressed={active}
                  className={`group flex items-start gap-4 rounded-2xl border p-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 ${
                    active
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-neutral-800 bg-neutral-900 hover:border-yellow-500/40 hover:bg-neutral-900/80'
                  }`}
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border ${
                    active ? 'border-yellow-500 bg-yellow-500/20' : 'border-neutral-700 bg-neutral-950'
                  }`}>
                    <Icon size={18} className={active ? 'text-yellow-400' : 'text-neutral-400'} aria-hidden="true" />
                  </div>
                  <div>
                    <div className={`text-sm font-bold uppercase tracking-wider ${active ? 'text-yellow-400' : 'text-white'}`}>
                      {tab}
                    </div>
                    <div className="mt-1 text-xs font-light text-neutral-400">
                      {desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. INFRASTRUCTURE GAP — light, big stats
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
          <Image
            src="/images/sections/finance-corporate.jpg"
            alt={t('infrastructureGap.title')}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/40 to-neutral-950/70" />
          <div className="relative z-10 flex h-full items-center justify-center px-6">
            <div className="grid w-full max-w-5xl grid-cols-1 gap-12 text-center md:grid-cols-3">
              <div>
                <div className="font-mono text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                  {t('infrastructureGap.needValue')}
                </div>
                <div className="mt-3 text-xs font-light uppercase tracking-wider text-neutral-300 sm:text-sm">
                  {t('infrastructureGap.needLabel')}
                </div>
              </div>
              <div>
                <div className="font-mono text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                  {t('infrastructureGap.traditionalValue')}
                </div>
                <div className="mt-3 text-xs font-light uppercase tracking-wider text-neutral-300 sm:text-sm">
                  {t('infrastructureGap.traditionalLabel')}
                </div>
              </div>
              <div>
                <div className="font-mono text-4xl font-bold text-yellow-400 sm:text-5xl md:text-6xl">
                  {t('infrastructureGap.gapValue')}
                </div>
                <div className="mt-3 text-xs font-light uppercase tracking-wider text-yellow-400 sm:text-sm">
                  {t('infrastructureGap.gapLabel')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white py-20 md:py-32">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-2 md:gap-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SectionLabel n="03" label={t('infrastructureGap.label')} />
              <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-neutral-950 md:text-4xl">
                {t('infrastructureGap.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-yellow-500" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('infrastructureGap.body')}
              </p>
              <p className="mt-4 text-sm font-light leading-relaxed text-neutral-500">
                {t('infrastructureGap.body2')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. CAPITAL INFRASTRUCTURE — dark split
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800"
          >
            <Image
              src="/images/sections/finance-trading.jpg"
              alt={t('hardware.title')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
              {hardwareStats.map((s, i) => (
                <div key={i} className="rounded-md bg-neutral-950/80 px-3 py-2 backdrop-blur">
                  <div className="font-mono text-sm font-bold text-yellow-400">{s.num}</div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <div>
            <SectionLabel n="04" label={t('hardware.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('hardware.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-yellow-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('hardware.body')}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { icon: Landmark, label: 'AfDB' },
                { icon: Building2, label: 'EIB' },
                { icon: Briefcase, label: 'IFC' },
                { icon: Wallet, label: 'CDG Capital' },
                { icon: Banknote, label: 'Attijari' },
                { icon: Star, label: 'IsDB' },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2">
                  <Icon size={14} className="text-yellow-500" aria-hidden="true" />
                  <span className="font-mono text-xs uppercase tracking-wider text-neutral-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. RELIABILITY — light centered body
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <SectionLabel n="05" label={t('reliability.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('reliability.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 mx-auto bg-yellow-500" />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 text-center text-base font-light leading-relaxed text-neutral-500 md:text-xl"
          >
            {t('reliability.body')}
          </motion.p>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: t('ui.historicalDataset'), value: '15 yr' },
              { label: t('ui.projectsModeled'), value: '300+' },
              { label: t('ui.defaults24mo'), value: '0' },
              { label: t('ui.defaultAccuracy'), value: '±2%' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center">
                <div className="font-mono text-2xl font-bold text-yellow-600">{s.value}</div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. PROCESS — dark timeline
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="06" label={t('process.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('process.title')}</h2>
          </div>
          <div className="mt-16 space-y-6">
            {processSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-1 gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:grid-cols-12 md:items-center md:gap-6"
              >
                <div className="md:col-span-2">
                  <div className="font-mono text-3xl font-bold text-yellow-500">{step.n}</div>
                </div>
                <div className="md:col-span-7">
                  <h3 className="text-lg font-bold text-white">{step.t}</h3>
                  <p className="mt-1 text-sm font-light leading-relaxed text-neutral-400">{step.d}</p>
                </div>
                <div className="md:col-span-3 md:text-right">
                  <span className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-3 py-1 font-mono text-xs text-yellow-400">
                    <Clock size={12} aria-hidden="true" />
                    {step.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. APPLICATIONS — light image + grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
          <Image
            src="/images/sections/overview-casablanca.jpg"
            alt={t('applications.title')}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 to-neutral-950/40" />
          <div className="relative z-10 flex h-full items-center px-6 md:px-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl">
              <SectionLabel n="07" label={t('applications.label')} dark />
              <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">
                {t('applications.title')}
              </h2>
            </motion.div>
          </div>
        </div>
        <div className="bg-white py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mx-auto max-w-3xl text-center text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('applications.body')}
            </p>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {applicationItems.map((a, i) => {
                const Icon = SECTOR_ICONS[i] || Building2;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                      <Icon size={18} className="text-yellow-600" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-neutral-950">{a.t}</h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">{a.d}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. WHY HARCH — dark cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="08" label={t('whyHarch.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('whyHarch.title')}</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyItems.map((w, i) => {
              const Icon = WHY_ICONS[i] || Shield;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-yellow-500/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950">
                    <Icon size={18} className="text-yellow-500" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{w.t}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">{w.d}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. COMPARISON — light table
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="09" label={t('comparison.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('comparison.title')}
            </h2>
          </div>
          <div className="mt-12 overflow-x-auto rounded-2xl border border-neutral-200">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  {comparisonHeaders.map((h, i) => (
                    <th key={i} className={`px-6 py-4 text-left font-mono text-xs font-semibold uppercase tracking-wider ${i === 1 ? 'text-yellow-700' : 'text-neutral-700'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-neutral-100 last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-6 py-4 text-sm ${ci === 0 ? 'font-semibold text-neutral-950' : ci === 1 ? 'font-medium text-yellow-700' : 'font-light text-neutral-600'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. CASE STUDIES — light grid with image
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="10" label={t('caseStudies.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('caseStudies.title')}
            </h2>
            <p className="mt-6 text-base font-light text-neutral-500 md:text-lg">{t('caseStudies.body')}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {caseStudies.map((cs, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={i === 0 ? '/images/blog/islamic-finance-african-infrastructure.jpg' : i === 1 ? '/images/sections/finance-stock.jpg' : '/images/sections/finance-business.jpg'}
                    alt={cs.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-md bg-yellow-500/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-950">
                      {cs.sector}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white">
                      {cs.location}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-neutral-950">{cs.name}</h3>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div>
                      <div className="font-mono text-xs text-neutral-500">{t('ui.caseN')}</div>
                      <div className="font-mono text-sm font-bold text-yellow-600">{cs.amount}</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-neutral-500">{t('ui.actualIrr')}</div>
                      <div className="font-mono text-sm font-bold text-yellow-600">{cs.irr}</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-neutral-500">{t('ui.timeToClose')}</div>
                      <div className="font-mono text-sm font-bold text-yellow-600">{cs.time}</div>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm font-light leading-relaxed text-neutral-500">{cs.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          12. ISLAMIC FINANCE — dark split with image
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <IslamicStarField />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800"
          >
            <Image
              src="/images/company/hq-casablanca.jpg"
              alt={t('islamicFinance.title')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-md bg-neutral-950/80 px-3 py-1.5 backdrop-blur">
              <Star size={12} className="text-yellow-500" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-yellow-400">
                {t('ui.aaoifiStandard')}
              </span>
            </div>
          </motion.div>
          <div>
            <SectionLabel n="11" label={t('islamicFinance.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('islamicFinance.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-yellow-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('islamicFinance.body')}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {islamicStats.map((s, i) => (
                <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                  <div className="font-mono text-xl font-bold text-yellow-500">{s.num}</div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">{s.label}</div>
                </div>
              ))}
            </div>
            <ul className="mt-6 space-y-3">
              {islamicFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-light text-neutral-300">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-yellow-500" aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
              <div className="flex items-center gap-2">
                <Scale size={14} className="text-yellow-500" aria-hidden="true" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-yellow-500">
                  {t('islamicFinance.boardLabel')}
                </span>
              </div>
              <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">
                {t('islamicFinance.boardBody')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          13. LENDER NETWORK — light grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <SectionLabel n="12" label={t('lenderNetwork.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('lenderNetwork.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-yellow-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('lenderNetwork.body')}
              </p>
              <p className="mt-4 text-xs font-light text-neutral-500">
                {t('lenderNetwork.footnote')}
              </p>
            </div>
            <div className="md:col-span-7">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {lenders.map((l, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-neutral-950">{l.name}</span>
                      <Network size={14} className="text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-500">{l.role}</div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-mono text-neutral-700">{l.ticket}</span>
                      <span className="rounded-full border border-neutral-200 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-yellow-700">
                        {l.type}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          14. SOFTWARE PRODUCTS — dark grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="13" label={t('software.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('software.title')}</h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {softwareMetrics.map((m, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-center">
                <div className={`font-mono text-2xl font-bold ${m.color}`}>{m.value}</div>
                <div className="mt-2 text-[10px] font-medium uppercase tracking-wider text-neutral-500">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {softwareProducts.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-yellow-500/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Layers size={18} className="text-yellow-500" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{p.t}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          15. PRICING — light cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="14" label={t('pricing.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('pricing.title')}
            </h2>
            <p className="mt-6 text-base font-light text-neutral-500 md:text-lg">{t('pricing.subtitle')}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {pricingPlans.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  p.featured
                    ? 'border-yellow-500 bg-white shadow-xl'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-8 rounded-full bg-yellow-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-950">
                    {t('ui.mostChosen')}
                  </span>
                )}
                <div className="text-sm font-bold uppercase tracking-wider text-yellow-600">{p.name}</div>
                <div className="mt-2 text-xs font-light text-neutral-500">{p.tagline}</div>
                <div className="mt-6 font-mono text-3xl font-bold text-neutral-950">{p.price}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-500">{p.size}</div>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm font-light text-neutral-700">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-yellow-500" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/quote?vertical=finance"
                  className={`mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                    p.featured
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                      : 'border border-neutral-300 text-neutral-950 hover:bg-neutral-100'
                  }`}
                >
                  {p.cta}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          16. INNOVATION — light image + cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
          <Image
            src="/images/blog/morocco-industrial-gateway.jpg"
            alt={t('innovation.title')}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 to-neutral-950/40" />
          <div className="relative z-10 flex h-full items-center justify-center px-6">
            <div className="text-center">
              <SectionLabel n="15" label={t('innovation.label')} dark align="center" />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl">
                {t('innovation.title')}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base font-light text-neutral-300 md:text-lg">
                {t('innovation.subtitle')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {innovationItems.map((inv, i) => {
                const Icon = INNOVATION_ICONS[i] || Sparkles;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                      <Icon size={18} className="text-yellow-600" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-neutral-950">{inv.t}</h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">{inv.d}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          17. GEOGRAPHY — dark cities grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <SectionLabel n="16" label={t('geography.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('geography.title')}</h2>
              <div className="mt-6 h-0.5 w-16 bg-yellow-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('geography.subtitle')}
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative mt-8 aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800"
              >
                <Image
                  src="/images/real/hq-casablanca-new.jpg"
                  alt={t('geography.title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-md bg-neutral-950/80 px-3 py-1.5 backdrop-blur">
                  <MapPin size={12} className="text-yellow-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-yellow-400">
                    {t('ui.harchFinanceCasablanca')}
                  </span>
                </div>
              </motion.div>
            </div>
            <div className="md:col-span-7">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {geoCities.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-yellow-500" aria-hidden="true" />
                      <span className="text-sm font-bold text-white">{c.name}</span>
                    </div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
                      {c.type}
                    </div>
                    <div className="mt-3 font-mono text-sm font-bold text-yellow-500">{c.plants}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          18. SECTORS — light grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="17" label={t('sectors.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('sectors.title')}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
            {sectorItems.map((s, i) => {
              const Icon = SECTOR_ICONS[i] || Building2;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center transition-colors hover:border-yellow-500/40"
                >
                  <Icon size={24} className="text-yellow-600" aria-hidden="true" />
                  <span className="mt-3 text-sm font-semibold text-neutral-950">{s}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          19. TESTIMONIALS — dark
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="18" label={t('testimonials.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('testimonials.title')}</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((tm, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
              >
                <Quote size={28} className="text-yellow-500/60" aria-hidden="true" />
                <p className="mt-4 text-base font-light leading-relaxed text-neutral-300">"{tm.quote}"</p>
                <div className="mt-6 border-t border-neutral-800 pt-4">
                  <div className="text-sm font-bold text-white">{tm.author}</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wider text-yellow-500">{tm.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          20. FAQ — light accordion
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <SectionLabel n="19" label={t('faq.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('faq.title')}
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {faqItems.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
                  >
                    <span className="text-base font-semibold text-neutral-950">{f.q}</span>
                    <ChevronDown
                      size={18}
                      className={`flex-shrink-0 text-yellow-600 transition-transform ${open ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-5 text-sm font-light leading-relaxed text-neutral-600">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          21. RESOURCES — dark grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="20" label={t('resources.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('resources.title')}</h2>
            <p className="mt-6 text-base font-light text-neutral-400 md:text-lg">{t('resources.subtitle')}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-4">
            {resourceItems.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-yellow-500/40"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-yellow-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-yellow-500">{r.type}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{r.t}</h3>
                <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-neutral-400">{r.d}</p>
                <Link
                  href="/quote?vertical=finance"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-yellow-400 hover:text-yellow-300"
                >
                  {t('resources.download')}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          22. FINAL CTA — light, emerald + border CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
          <Image
            src="/images/company/leadership-team.jpg"
            alt={t('finalCta.title')}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 to-neutral-950/80" />
        </div>
        <div className="bg-white py-20 md:py-32">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <SectionLabel n="21" label={t('tesla.label')} align="center" />
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl">
              {t('finalCta.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('finalCta.subtitle')}
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-xs font-medium uppercase tracking-wider text-yellow-600">
              {t('finalCta.trustline')}
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row">
              <Link
                href="/quote?vertical=finance"
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400"
              >
                {t('finalCta.primary')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href="tel:+212684440682"
                className="inline-flex items-center justify-center gap-2 border border-neutral-300 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-neutral-950 transition-colors hover:bg-neutral-100"
              >
                <Phone size={14} aria-hidden="true" />
                {t('ctaSection.callCta')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          23. BACK TO HARCH CORP — dark slim footer band
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-neutral-800 bg-neutral-950 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
            <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">
              {t('hero.badge')}
            </span>
          </div>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:text-yellow-400"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            {t('ui.backToCorp')}
          </Link>
        </div>
      </section>

    </div>
  );
}

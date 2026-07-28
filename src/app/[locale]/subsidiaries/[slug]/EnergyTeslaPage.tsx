'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  Shield,
  Sun,
  Wind,
  Gauge,
  Beaker,
  Globe,
  Building2,
  Hotel,
  Wheat,
  Server,
  Factory,
  Truck,
  Siren,
  ChevronDown,
  Sparkles,
  Quote,
  MapPin,
  Clock,
  TrendingDown,
  Battery,
  Workflow,
  HandCoins,
  HardHat,
  Settings,
  ArrowRightLeft,
  Radio,
  Plug,
  LineChart,
  ThermometerSun,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Zap,
  Sun as SunIcon,
  ArrowUpRight,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HARCH ENERGY — Tesla-level rebuild (v5)
   Minimalist · Premium · Interactive · Patrick Jane elegance

   Design system v2 compliant:
   • Accent: emerald-500 (labels, stats, icons — never backgrounds)
   • Backgrounds: neutral-950 / white / neutral-50 / neutral-900 only
   • Fonts: Inter (sans) + Space Mono (mono)
   • Hero: text-4xl sm:text-6xl lg:text-7xl, sun-ray motif at 7% opacity
   • NO wave dividers (those are Water only)
   • 17 sections, 12 unique photos, zero repeats
   • Tesla-style 3-button interaction (Charging / Optimization / Monitoring)
   ═══════════════════════════════════════════════════════════════ */

const SECTOR_ICONS = [Building2, Factory, Wheat, Hotel, Siren, Server, Truck, ThermometerSun];
const WHY_ICONS = [Shield, HandCoins, Settings, Globe];
const FLOW_ICONS = [HandCoins, HardHat, Settings, ArrowRightLeft];
const DISPATCH_ICONS: Record<string, typeof Sun> = {
  sun: SunIcon,
  battery: Battery,
  plug: Plug,
  arrow: ArrowUpRight,
};

/* ── Section label helper — Harch brand pattern ────────────────── */
function SectionLabel({
  n,
  label,
  dark = false,
  center = false,
}: {
  n?: string;
  label: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] ${
        center ? 'justify-center' : ''
      }`}
    >
      {n && <span className={dark ? 'text-neutral-600' : 'text-neutral-400'}>{`// ${n}`}</span>}
      <span className="h-px w-8 bg-emerald-500/60" />
      <span className="text-emerald-500">{label}</span>
    </div>
  );
}

/* ── Sun-ray radiating lines — Energy subsidiary unique motif ────
   Subtle radial lines from top-right corner. 7% opacity per design
   system. Drawn with SVG so it scales cleanly to any viewport. */
function SunRayField() {
  return (
    <svg
      className="pointer-events-none absolute right-0 top-0 h-full w-full"
      style={{ opacity: 0.07 }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id="energy-rays" cx="85%" cy="15%" r="80%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g stroke="url(#energy-rays)" strokeWidth="1" fill="none">
        <line x1="85%" y1="15%" x2="0%" y2="0%" />
        <line x1="85%" y1="15%" x2="0%" y2="25%" />
        <line x1="85%" y1="15%" x2="0%" y2="55%" />
        <line x1="85%" y1="15%" x2="0%" y2="85%" />
        <line x1="85%" y1="15%" x2="20%" y2="100%" />
        <line x1="85%" y1="15%" x2="55%" y2="100%" />
        <line x1="85%" y1="15%" x2="90%" y2="100%" />
      </g>
    </svg>
  );
}

/* ── Compact sun accent for light sections (top-right corner) ──── */
function SunAccent() {
  return (
    <svg
      className="pointer-events-none absolute right-6 top-6 h-12 w-12 text-emerald-500/10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

/* ── Browser chrome wrapper (used by the Tesla interaction dashboards) ── */
function BrowserChrome({
  url,
  pill,
  pillTone = 'emerald',
  children,
}: {
  url: string;
  pill: string;
  pillTone?: 'emerald' | 'amber';
  children: React.ReactNode;
}) {
  const pillClass =
    pillTone === 'amber'
      ? 'text-amber-400'
      : 'text-emerald-500';
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-950/60 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
        </div>
        <div className="ml-4 flex-1 rounded-md bg-neutral-950/60 px-3 py-1 font-mono text-xs text-neutral-400">
          {url}
        </div>
        <div
          className={`flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider ${pillClass}`}
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                pillTone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
              } opacity-75`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                pillTone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </span>
          {pill}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── TESLA INTERACTION: 3 dashboards ───────────────────────────── */

function ChargingDashboard({
  eyebrow,
  headline,
  subtitle,
  bigValue,
  bigUnit,
  bigLabel,
  chartLabel,
  chartHours,
  chartBars,
  footerStats,
  statusPill,
}: any & {
  // no-op, types resolved at call site
}) {
  const max = Math.max(...chartBars, 1);
  return (
    <div className="aspect-[16/10] bg-neutral-950 p-5 md:p-8">
      <div className="flex flex-col gap-6 h-full">
        {/* Top — eyebrow + headline + big metric */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500">
              {eyebrow}
            </div>
            <div className="mt-1 text-lg font-bold text-white md:text-xl">{headline}</div>
            <div className="mt-1 text-xs font-light text-neutral-500">{subtitle}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-4xl font-bold text-emerald-400 md:text-5xl">
              {bigValue}
              <span className="ml-1 text-2xl md:text-3xl">{bigUnit}</span>
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {bigLabel}
            </div>
          </div>
        </div>

        {/* Middle — bar chart */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {chartLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {statusPill}
            </span>
          </div>
          <div className="mt-3 flex flex-1 items-end gap-2 border-b border-neutral-800 pb-2">
            {chartBars.map((h: number, i: number) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <motion.div
                    className="w-full rounded-t-sm bg-gradient-to-t from-emerald-500/30 to-emerald-500"
                    initial={{ height: 0 }}
                    animate={{ height: `${(h / max) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                  {chartHours[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — 3 footer stats */}
        <div className="grid grid-cols-3 gap-3">
          {footerStats.map((s: { label: string; value: string }, i: number) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2"
            >
              <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                {s.label}
              </div>
              <div className="mt-1 font-mono text-sm font-bold text-white md:text-base">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OptimizationDashboard({
  eyebrow,
  headline,
  subtitle,
  bigValue,
  bigUnit,
  bigLabel,
  dispatch,
  logLabel,
  log,
  strategyPill,
}: any) {
  return (
    <div className="aspect-[16/10] bg-neutral-950 p-5 md:p-8">
      <div className="flex flex-col gap-6 h-full">
        {/* Top */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500">
              {eyebrow}
            </div>
            <div className="mt-1 text-lg font-bold text-white md:text-xl">{headline}</div>
            <div className="mt-1 text-xs font-light text-neutral-500">{subtitle}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-4xl font-bold text-emerald-400 md:text-5xl">
              {bigValue}
              <span className="ml-1 text-2xl md:text-3xl">{bigUnit}</span>
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {bigLabel}
            </div>
          </div>
        </div>

        {/* Middle — dispatch flow (4 boxes with arrows) */}
        <div className="flex-1 flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Dispatch · live
          </span>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {dispatch.map((d: { label: string; value: string; icon: string }, i: number) => {
              const Icon = DISPATCH_ICONS[d.icon] || SunIcon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative rounded-xl border border-neutral-800 bg-neutral-900 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
                      <Icon size={14} className="text-emerald-500" />
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                      {d.label}
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-base font-bold text-white md:text-lg">
                    {d.value}
                  </div>
                  {i < dispatch.length - 1 && (
                    <ArrowRight
                      size={12}
                      className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-neutral-700 md:block"
                      aria-hidden="true"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom — decision log */}
        <div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {logLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              {strategyPill}
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            {log.map((entry: { time: string; action: string; tag: string }, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-1.5"
              >
                <span className="font-mono text-[10px] font-semibold text-emerald-500">
                  {entry.time}
                </span>
                <span className="flex-1 text-xs font-light text-neutral-300">{entry.action}</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                  {entry.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonitoringDashboard({
  eyebrow,
  headline,
  subtitle,
  bigValue,
  bigUnit,
  bigLabel,
  plantsLabel,
  plants,
  alertsLabel,
  alerts,
  opsPill,
}: any) {
  return (
    <div className="aspect-[16/10] bg-neutral-950 p-5 md:p-8">
      <div className="flex flex-col gap-6 h-full">
        {/* Top */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500">
              {eyebrow}
            </div>
            <div className="mt-1 text-lg font-bold text-white md:text-xl">{headline}</div>
            <div className="mt-1 text-xs font-light text-neutral-500">{subtitle}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-4xl font-bold text-emerald-400 md:text-5xl">
              {bigValue}
              <span className="ml-1 text-2xl md:text-3xl">{bigUnit}</span>
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {bigLabel}
            </div>
          </div>
        </div>

        {/* Middle — plant status grid */}
        <div className="flex-1 flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            {plantsLabel}
          </span>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
            {plants.map((p: { name: string; capacity: string; status: string }, i: number) => {
              const isWatch = p.status === 'watch';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`rounded-lg border px-3 py-2 ${
                    isWatch
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-neutral-800 bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isWatch ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span className="flex-1 truncate text-xs font-semibold text-white">
                      {p.name}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-neutral-500">{p.capacity}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom — alert queue */}
        <div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {alertsLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              {opsPill}
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            {alerts.map((a: { time: string; text: string; tag: string }, i: number) => {
              const isWatch = a.tag !== 'RESOLVED' && a.tag !== 'RÉSOLU';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center gap-3 rounded-md border px-3 py-1.5 ${
                    isWatch
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-neutral-800 bg-neutral-900/60'
                  }`}
                >
                  <span className="font-mono text-[10px] font-semibold text-neutral-400">
                    {a.time}
                  </span>
                  <span className="flex-1 text-xs font-light text-neutral-300">{a.text}</span>
                  <span
                    className={`font-mono text-[9px] uppercase tracking-wider ${
                      isWatch ? 'text-amber-400' : 'text-neutral-500'
                    }`}
                  >
                    {a.tag}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function EnergyTeslaPage() {
  const t = useTranslations('energyTesla');

  /* Calculator state — monthly ONEE bill in MAD */
  const [demand, setDemand] = useState(50000);
  const harchMonthly = Math.round(demand * 0.42);
  const oneeMonthly = demand;
  const saveMonthly = oneeMonthly - harchMonthly;
  const save15yr = Math.round((saveMonthly * 12 * 15) / 1_000_000);

  /* FAQ accordion state */
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* Tesla interaction state — 0 = Charging, 1 = Optimization, 2 = Monitoring */
  const [activeTab, setActiveTab] = useState(0);

  /* ── Translation arrays (typed) ─────────────────────────── */
  const heroStats = [
    { num: t('hero.stat1Value'), label: t('hero.stat1Label') },
    { num: t('hero.stat2Value'), label: t('hero.stat2Label') },
    { num: t('hero.stat3Value'), label: t('hero.stat3Label') },
  ];
  const hardwareStats = [
    { num: t('hardware.stat1Value'), label: t('hardware.stat1Label') },
    { num: t('hardware.stat2Value'), label: t('hardware.stat2Label') },
    { num: t('hardware.stat3Value'), label: t('hardware.stat3Label') },
  ];
  const solarProcessSteps = t.raw('solarProcess.steps') as {
    n: string;
    t: string;
    d: string;
    time: string;
  }[];
  const windStats = t.raw('windPower.stats') as { num: string; label: string }[];
  const windSpecs = t.raw('windPower.specs') as { name: string; value: string }[];
  const hydrogenSteps = t.raw('hydrogen.steps') as { n: string; t: string; d: string }[];
  const hydrogenStats = t.raw('hydrogen.stats') as { num: string; label: string }[];
  const whyItems = t.raw('whyHarch.items') as { t: string; d: string }[];
  const comparisonHeaders = t.raw('comparison.headers') as string[];
  const comparisonRows = t.raw('comparison.rows') as string[][];
  const sectorItems = t.raw('sectors.items') as string[];
  const applicationItems = t.raw('applications.items') as { title: string; desc: string }[];
  const geoCities = t.raw('geography.cities') as {
    name: string;
    type: string;
    plants: string;
  }[];
  const caseStudies = t.raw('caseStudies.items') as {
    name: string;
    type: string;
    result: string;
    metric: string;
  }[];
  const flowSteps = t.raw('service.flowSteps') as { label: string; desc: string }[];
  const serviceStats = t.raw('service.stats') as { num: string; label: string }[];
  const testimonials = t.raw('testimonials.items') as {
    quote: string;
    author: string;
    role: string;
  }[];
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];

  /* Tesla interaction data */
  const teslaTabs = t.raw('teslaInteraction.tabs') as {
    id: string;
    label: string;
    aria: string;
  }[];
  const chargingData = t.raw('teslaInteraction.charging');
  const optimizationData = t.raw('teslaInteraction.optimization');
  const monitoringData = t.raw('teslaInteraction.monitoring');

  return (
    <div className="bg-white font-sans text-neutral-950 antialiased selection:bg-emerald-500 selection:text-white scroll-smooth">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Full-screen, big headline, sun-ray motif
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-neutral-950">
        <Image
          src="/images/hero-energy.jpg"
          alt={t('hero.heroImageAlt')}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/45 to-neutral-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 to-transparent" />
        <SunRayField />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-16 md:px-12 md:py-24">
          {/* Top — HARCH ENERGY badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center md:justify-start"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-5 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
                {t('hero.lead')}
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
                  className="border-l-2 border-emerald-500/50 pl-5 text-left"
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
                href="/quote?vertical=energy"
                aria-label={`${t('hero.cta')} — Harch Energy`}
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('hero.cta')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href="tel:+212684440682"
                aria-label={`${t('ctaSection.callCta')} +212 684 440 682`}
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone size={14} aria-hidden="true" />
                {t('ctaSection.callCta')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. OVERVIEW — Minimalist two-column, lots of whitespace
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-40">
        <SunAccent />
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
            <div className="mt-6 h-0.5 w-16 bg-emerald-500" />
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
          3. TESLA INTERACTION — 3 buttons + changing dashboard
             Tesla Model S-style switcher. Three distinct HTML/CSS
             dashboards swap with AnimatePresence.
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="02" label={t('teslaInteraction.label')} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('teslaInteraction.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-emerald-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('teslaInteraction.subtitle')}
            </p>
          </div>

          {/* Big dashboard screen — changes with tab */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div
                  key="charging"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <BrowserChrome
                    url={`${t('teslaInteraction.url')}/charging`}
                    pill={chargingData.statusPill}
                  >
                    <ChargingDashboard {...chargingData} />
                  </BrowserChrome>
                </motion.div>
              )}
              {activeTab === 1 && (
                <motion.div
                  key="optimization"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <BrowserChrome
                    url={`${t('teslaInteraction.url')}/optimization`}
                    pill={optimizationData.strategyPill}
                  >
                    <OptimizationDashboard {...optimizationData} />
                  </BrowserChrome>
                </motion.div>
              )}
              {activeTab === 2 && (
                <motion.div
                  key="monitoring"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <BrowserChrome
                    url={`${t('teslaInteraction.url')}/monitoring`}
                    pill={monitoringData.opsPill}
                  >
                    <MonitoringDashboard {...monitoringData} />
                  </BrowserChrome>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 3 buttons at the bottom — the Tesla switcher */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {teslaTabs.map((tab, i) => {
              const isActive = activeTab === i;
              const Icon = i === 0 ? Sun : i === 1 ? Sparkles : Activity;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  aria-label={tab.aria}
                  aria-pressed={isActive}
                  className={`group flex items-center gap-4 rounded-2xl border px-6 py-5 text-left transition-colors active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                    isActive
                      ? 'border-emerald-500/60 bg-emerald-500/10'
                      : 'border-neutral-800 bg-neutral-900 hover:border-emerald-500/40 hover:bg-neutral-800'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-1 transition-colors ${
                      isActive
                        ? 'bg-emerald-500 text-white ring-emerald-500'
                        : 'bg-neutral-800 text-emerald-500 ring-neutral-700'
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div
                      className={`font-mono text-[10px] uppercase tracking-wider ${
                        isActive ? 'text-emerald-400' : 'text-neutral-500'
                      }`}
                    >
                      {`0${i + 1}`}
                    </div>
                    <div
                      className={`mt-0.5 text-base font-bold ${
                        isActive ? 'text-white' : 'text-neutral-300'
                      }`}
                    >
                      {tab.label}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className={`transition-transform ${
                      isActive
                        ? 'text-emerald-400 translate-x-0'
                        : 'text-neutral-600 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. HARDWARE — Solar panels + inverters, big image right
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <SunAccent />
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-6"
            >
              <SectionLabel n="03" label={t('hardware.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('hardware.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-emerald-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('hardware.body')}
              </p>
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {hardwareStats.map((s, i) => (
                  <div key={i} className="border-l-2 border-emerald-500/50 pl-4">
                    <div className="font-mono text-2xl font-bold text-emerald-600 md:text-3xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-xs font-light text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-6"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                <Image
                  src="/images/sections/energy-solar.jpg"
                  alt={t('hardware.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/30 to-transparent" />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 backdrop-blur-md">
                  <Sun size={12} className="text-emerald-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
                    {t('ui.tier1')} · Jinko / LONGi
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. WIND POWER — Full-bleed image with overlay text
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-neutral-950">
        <Image
          src="/images/sections/energy-wind-farm.jpg"
          alt={t('windPower.title')}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/55 to-neutral-950/20" />
        <div className="relative z-10 flex h-full items-center px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <SectionLabel n="04" label={t('windPower.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl">
              {t('windPower.title')}
            </h2>
            <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-neutral-300 md:text-lg">
              {t('windPower.body')}
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {windStats.map((s, i) => (
                <div key={i} className="border-l-2 border-emerald-500/50 pl-4">
                  <div className="font-mono text-2xl font-bold text-emerald-500 md:text-3xl">
                    {s.num}
                  </div>
                  <div className="mt-1 text-xs font-light text-neutral-400">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. WIND SPECS — Dark continuation with portrait + spec sheet
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-5"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-800">
                <Image
                  src="/images/sections/energy-wind.jpg"
                  alt={t('windPower.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    <Wind size={12} aria-hidden="true" />
                    {t('ui.tier1')}
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7"
            >
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950/60 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Gauge size={16} className="text-emerald-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                      {t('windPower.label')} — Spec sheet
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    4.5 MW · IEC IIA
                  </span>
                </div>
                <dl className="divide-y divide-neutral-800">
                  {windSpecs.map((spec, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <dt className="text-xs font-light uppercase tracking-wider text-neutral-500">
                        {spec.name}
                      </dt>
                      <dd className="font-mono text-sm font-semibold text-white">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. HYDROGEN — Dark with bg image, 4-step process
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/sections/energy-hydrogen.jpg"
            alt=""
            fill
            className="object-cover opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-950/85 to-neutral-950/95" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="05" label={t('hydrogen.label')} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('hydrogen.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('hydrogen.body')}
            </p>
          </div>

          {/* 4-step process — desktop horizontal */}
          <div className="mt-16 hidden lg:block">
            <div className="relative">
              <svg
                className="absolute left-0 right-0 top-12 h-1 w-full"
                preserveAspectRatio="none"
                viewBox="0 0 1000 4"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="flowGradEnergy" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="2" x2="1000" y2="2" stroke="url(#flowGradEnergy)" strokeWidth="2" />
              </svg>
              <div className="grid grid-cols-4 gap-4">
                {hydrogenSteps.map((step, i) => {
                  const Icon = [Sun, Beaker, Sparkles, Workflow][i] || Sparkles;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12 }}
                      className="relative text-center"
                    >
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 ring-1 ring-emerald-500/30">
                        <Icon size={32} className="text-emerald-500" />
                      </div>
                      <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">
                        {step.n}
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-white">{step.t}</h3>
                      <p className="mt-3 text-sm font-light leading-relaxed text-neutral-400">
                        {step.d}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile vertical */}
          <div className="mt-12 lg:hidden">
            <div className="space-y-8">
              {hydrogenSteps.map((step, i) => {
                const Icon = [Sun, Beaker, Sparkles, Workflow][i] || Sparkles;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-5"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 ring-1 ring-emerald-500/30">
                        <Icon size={24} className="text-emerald-500" />
                      </div>
                      {i < hydrogenSteps.length - 1 && (
                        <div className="mt-2 h-full w-px flex-1 bg-gradient-to-b from-emerald-500/40 to-transparent" />
                      )}
                    </div>
                    <div className="pb-8">
                      <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">
                        {step.n}
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-white">{step.t}</h3>
                      <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">
                        {step.d}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 border-t border-neutral-800 pt-12 sm:grid-cols-3">
            {hydrogenStats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-mono text-4xl font-bold text-emerald-500 md:text-5xl">
                  {s.num}
                </div>
                <div className="mt-2 text-xs font-light uppercase tracking-wider text-neutral-400">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. HYDROGEN PLANT BANNER — Full-bleed image with caption
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-neutral-950">
        <Image
          src="/images/sections/energy-hydrogen-plant.jpg"
          alt={t('hydrogen.title')}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-neutral-950/30" />
        <div className="relative z-10 flex h-full items-end px-6 pb-16 md:px-12 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              <MapPin size={10} aria-hidden="true" />
              Dakhla · Morocco
            </div>
            <h3 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">
              {t('hydrogen.title')}
            </h3>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-neutral-300 md:text-base">
              {t('hydrogen.body').split('.')[0]}.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. EPC / FINANCING — Dark, 4-step BOT flow
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="06" label={t('service.label')} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('service.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-emerald-500" />
            <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('service.body')}
            </p>
          </div>

          {/* Visual flow: Invest → Build → Operate → Transfer */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {flowSteps.map((step, i) => {
              const Icon = FLOW_ICONS[i] || ArrowRightLeft;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="relative rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-neutral-800 hover:shadow-lg hover:shadow-emerald-500/5 md:p-8"
                >
                  {i < 3 && (
                    <div className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500 text-white lg:flex">
                      <ArrowRight size={12} />
                    </div>
                  )}
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
                    <Icon size={22} className="text-emerald-500" />
                  </div>
                  <div className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">{step.label}</h3>
                  <p className="mt-2 text-xs font-light text-neutral-400">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-neutral-800 pt-12 sm:grid-cols-3">
            {serviceStats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-mono text-3xl font-bold text-emerald-500 md:text-4xl">
                  {s.num}
                </div>
                <div className="mt-1 text-xs font-light uppercase tracking-wider text-neutral-400">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. CALCULATOR — Interactive savings slider, big typography
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionLabel n="07" label={t('calculator.label')} center />
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
            {t('calculator.title')}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base font-light text-neutral-500 md:text-lg">
            {t('calculator.subtitle')}
          </p>

          <div className="mx-auto mt-12 max-w-xl">
            <div className="mb-3 flex items-baseline justify-between text-left">
              <span className="text-sm font-light text-neutral-500">
                {t('calculator.billLabel')}
              </span>
              <span className="font-mono text-2xl font-bold text-emerald-600 md:text-3xl">
                {demand.toLocaleString('fr-FR')} MAD
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="500000"
              step="1000"
              value={demand}
              onChange={(e) => setDemand(parseInt(e.target.value))}
              className="w-full accent-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              aria-label={t('calculator.billLabel')}
              aria-valuetext={`${demand.toLocaleString('fr-FR')} MAD`}
            />
            <div className="mt-2 flex justify-between font-mono text-[10px] font-light uppercase tracking-wider text-neutral-400">
              <span>5 000 MAD</span>
              <span>500 000 MAD</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-colors hover:border-neutral-300">
              <div className="font-mono text-xs font-light uppercase tracking-wider text-neutral-500">
                {t('calculator.monthlyLabel')}
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-emerald-600 md:text-4xl">
                {harchMonthly.toLocaleString('fr-FR')}
              </div>
              <div className="mt-1 font-mono text-[10px] font-light uppercase tracking-wider text-emerald-600">
                {t('calculator.harchLabel')}
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="font-mono text-xs font-light uppercase tracking-wider text-neutral-500">
                {t('calculator.oneeLabel')}
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-neutral-400 line-through md:text-4xl">
                {oneeMonthly.toLocaleString('fr-FR')}
              </div>
              <div className="mt-1 font-mono text-[10px] font-light uppercase tracking-wider text-neutral-500">
                {comparisonHeaders[2]}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6">
              <div className="font-mono text-xs font-light uppercase tracking-wider text-emerald-700">
                {t('calculator.save25Label')}
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-emerald-700 md:text-4xl">
                {save15yr}M
              </div>
              <div className="mt-1 flex items-center justify-center gap-1 font-mono text-[10px] font-light uppercase tracking-wider text-emerald-700">
                <TrendingDown size={10} aria-hidden="true" />
                {t('calculator.savingsLabel')}
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs font-light text-neutral-400">{t('calculator.disclaimer')}</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. PROCESS TIMELINE — Light, 6-step installation
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-50 py-24 md:py-32">
        <SunAccent />
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <SectionLabel n="08" label={t('solarProcess.label')} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('solarProcess.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-emerald-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('solarProcess.body')}
            </p>
          </div>
          <div className="mt-16">
            {solarProcessSteps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-8 border-b border-neutral-200 py-8 last:border-0"
              >
                <div className="flex-shrink-0 font-mono text-4xl font-bold text-emerald-500/40 md:text-5xl">
                  {item.n}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-4">
                    <h3 className="text-xl font-bold text-neutral-950 md:text-2xl">{item.t}</h3>
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      {item.time}
                    </span>
                  </div>
                  <p className="mt-2 font-light leading-relaxed text-neutral-500 md:text-lg">
                    {item.d}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          12. APPLICATIONS — Dark with bg image, 5 items + sectors grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/real/energy-wind-turbines.jpg"
            alt=""
            fill
            className="object-cover opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel n="09" label={t('applications.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
                {t('applications.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-emerald-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('applications.body')}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {applicationItems.map((item, i) => (
                <div key={i} className="border-b border-neutral-800 pb-6 last:border-0">
                  <h3 className="text-base font-bold text-white md:text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Sectors grid — 8 icons */}
          <div className="mt-20 border-t border-neutral-800 pt-12">
            <div className="text-center">
              <SectionLabel n="10" label={t('sectors.label')} dark center />
              <h3 className="mt-5 text-xl font-bold tracking-tight text-white md:text-2xl">
                {t('sectors.title')}
              </h3>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {sectorItems.map((s, i) => {
                const Icon = SECTOR_ICONS[i] || Building2;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-neutral-800 hover:shadow-lg hover:shadow-emerald-500/5 md:p-8"
                  >
                    <Icon className="mx-auto mb-4 h-10 w-10 text-emerald-500 transition-transform group-hover:scale-110" />
                    <div className="font-semibold text-white md:text-lg">{s}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          13. WHY HARCH — Light, 4 reason cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <SectionLabel n="11" label={t('whyHarch.label')} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('whyHarch.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-emerald-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('whyHarch.body')}
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {whyItems.map((item, i) => {
              const Icon = WHY_ICONS[i] || Shield;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg md:p-8"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
                      <Icon size={20} className="text-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-950 md:text-xl">{item.t}</h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">
                      {item.d}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          14. COMPARISON TABLE — Dark, full lifecycle table
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-24 text-white md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <SectionLabel n="12" label={t('comparison.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('comparison.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-emerald-500" />
            <p className="mt-4 text-base font-light text-neutral-400 md:text-lg">
              {t('comparison.body')}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 overflow-hidden rounded-2xl border border-neutral-800"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-neutral-900">
                    {comparisonHeaders.map((h, i) => (
                      <th
                        key={i}
                        className={`px-4 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-wider ${
                          i === 1
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : i === 0
                              ? 'text-white'
                              : 'text-neutral-500'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, ri) => (
                    <tr
                      key={ri}
                      className="border-t border-neutral-800 transition-colors hover:bg-neutral-900/60"
                    >
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className={`px-4 py-4 text-sm ${
                            ci === 0
                              ? 'font-semibold text-white'
                              : ci === 1
                                ? 'font-mono font-bold text-emerald-400 bg-emerald-500/5'
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
          </motion.div>

          <p className="mt-4 text-xs font-light text-neutral-600">{t('calculator.disclaimer')}</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          15. CASE STUDIES — Light, 3 project cards with photos
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <SectionLabel n="13" label={t('caseStudies.label')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('caseStudies.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-emerald-500" />
            <p className="mt-4 text-base font-light text-neutral-500 md:text-lg">
              {t('caseStudies.subtitle')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {caseStudies.map((cs, i) => {
              const photoSrcs = [
                '/images/blog/solar-energy-benchmark-morocco.jpg',
                '/images/blog/green-hydrogen-morocco.jpg',
                '/images/blog/energy-2gw-pipeline.jpg',
              ];
              return (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={photoSrcs[i]}
                      alt={`${cs.name} — ${cs.type}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                      {cs.metric}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                      {cs.type}
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-neutral-950">{cs.name}</h3>
                    <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-neutral-500">
                      {cs.result}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          16. GEOGRAPHY — Dark, Morocco city cards + 2 showcase photos
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="14" label={t('geography.label')} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('geography.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-emerald-500" />
            <p className="mt-6 text-base font-light text-neutral-400 md:text-lg">
              {t('geography.subtitle')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {geoCities.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-neutral-800 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-xs font-light text-neutral-400">{c.type}</div>
                  <div className="mt-1 font-mono text-xs font-semibold text-emerald-500">
                    {c.plants}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Morocco showcase strip — two photos, never repeated */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { src: '/images/sections/overview-casablanca.jpg', label: 'Casablanca' },
              { src: '/images/sections/overview-construction.jpg', label: 'Dakhla Construction' },
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-neutral-800"
              >
                <Image
                  src={img.src}
                  alt={`Harch Energy installation in ${img.label}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
                  <MapPin size={12} className="text-emerald-400" aria-hidden="true" />
                  {img.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          17. TESTIMONIALS — Light, 3 quote cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <SectionLabel n="15" label={t('testimonials.label')} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('testimonials.title')}
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {testimonials.map((tm, i) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Quote className="h-8 w-8 text-emerald-500/40" />
                <blockquote className="mt-4 flex-1 font-light leading-relaxed text-neutral-700">
                  &ldquo;{tm.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-neutral-100 pt-4">
                  <div className="font-bold text-neutral-950">{tm.author}</div>
                  <div className="text-sm font-light text-neutral-500">{tm.role}</div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          18. FAQ — Dark, accordion with emerald accent
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-24 text-white md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <SectionLabel n="16" label={t('faq.label')} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('faq.title')}
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-xl border bg-neutral-900 transition-colors ${
                  openFaq === i
                    ? 'border-emerald-500/40'
                    : 'border-neutral-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-neutral-800/60 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  id={`energy-faq-button-${i}`}
                  aria-expanded={openFaq === i}
                  aria-controls={`energy-faq-panel-${i}`}
                >
                  <span className="font-semibold text-white">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-emerald-500 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                      id={`energy-faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`energy-faq-button-${i}`}
                    >
                      <p className="px-5 pb-5 text-sm font-light leading-relaxed text-neutral-400">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          19. FINAL CTA — Full-bleed, emerald CTA + Back to Harch Corp
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950">
        <Image
          src="/images/real/energy-power-grid.jpg"
          alt=""
          fill
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-950/85 to-neutral-950/70" />
        <SunRayField />

        <div className="relative mx-auto max-w-5xl px-6 py-24 text-white md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            {/* HARCH ENERGY badge — reprise of hero badge */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-4 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-neutral-200">
                {t('hero.badge')}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
              {t('finalCta.title')}
            </h2>
            <p className="mt-6 text-base font-light text-neutral-300 md:text-xl">
              {t('finalCta.subtitle')}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {/* Primary CTA — emerald (Harch brand green) */}
              <Link
                href="/quote?vertical=energy"
                aria-label={`${t('finalCta.primary')} — Harch Energy`}
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('finalCta.primary')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href="tel:+212684440682"
                aria-label={`${t('finalCta.secondary')} +212 684 440 682`}
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone size={16} aria-hidden="true" />
                {t('finalCta.secondary')}
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs font-light text-neutral-400">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-emerald-500" aria-hidden="true" />
                {t('ctaSection.quoteBody')}
              </div>
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-emerald-500" aria-hidden="true" />
                {t('ctaSection.callBody')}
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-emerald-500" aria-hidden="true" />
                {t('ui.harchCorpBacking')}
              </div>
            </div>

            {/* "Back to Harch Corp" link — brand anchor */}
            <div className="mt-12 border-t border-neutral-800 pt-6">
              <Link
                href="/"
                aria-label={t('ui.backToHarchCorp')}
                className="group inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ArrowLeft
                  size={14}
                  className="transition-transform group-hover:-translate-x-1"
                  aria-hidden="true"
                />
                {t('ui.backToHarchCorp')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

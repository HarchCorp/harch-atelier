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
  CheckCircle2,
  Shield,
  Droplets,
  Waves,
  Activity,
  Gauge,
  Beaker,
  QrCode,
  Cpu,
  Globe,
  Leaf,
  Building2,
  Hotel,
  Wheat,
  Server,
  Factory,
  Truck,
  Siren,
  ChevronDown,
  FileText,
  Download,
  Sparkles,
  Quote,
  MapPin,
  Clock,
  TrendingDown,
  Wind,
  Sun,
  Battery,
  Workflow,
  HandCoins,
  HardHat,
  Settings,
  ArrowRightLeft,
  AlertTriangle,
  Radio,
  Zap,
  CircleDot,
  Cog,
  FlaskConical,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HARCH WATER — Tesla-level rebuild (Design System V2)
   Accent: cyan-500 · Primary CTA: emerald-500 (Harch green)
   Inter for type · Space Mono for data · Neutral palette only
   Wave dividers (Water's UNIQUE visual detail) · 3-button Tesla
   dashboard switches Desalination ↔ Distribution ↔ Quality.
   ═══════════════════════════════════════════════════════════════ */

const SECTOR_ICONS = [Building2, Droplets, Wheat, Factory, Hotel, Siren, Server, Truck];
const WHY_ICONS = [Cpu, Shield, HandCoins, Globe];
const INNO_ICONS = [Sparkles, Sun, Droplets, Workflow];
const PROCESS_ICONS = [Waves, Workflow, Beaker, Droplets, Activity];
const APPLICATION_ICONS = [Building2, Factory, Wheat, Battery, Siren];

/* ── Section label helper — Harch brand pattern ────────────────── */
function SectionLabel({
  n,
  label,
  dark = false,
}: {
  n?: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
      {n && <span className={dark ? 'text-neutral-600' : 'text-neutral-400'}>{`// ${n}`}</span>}
      <span className="h-px w-8 bg-cyan-500/60" />
      <span className="text-cyan-500">{label}</span>
    </div>
  );
}

/* ── Wave divider — Water's UNIQUE visual detail ───────────────── */
function WaveDivider({
  className = '',
  fill = 'white',
  flip = false,
}: {
  className?: string;
  fill?: string;
  flip?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 w-full overflow-hidden leading-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className={`relative block h-[60px] w-full ${flip ? 'rotate-180' : ''}`}
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,32 C180,8 360,56 540,32 C720,8 900,56 1080,32 C1260,8 1440,32 1440,32 L1440,60 L0,60 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

/* ── Subtle droplet accent — small icon decoration ─────────────── */
function DropletAccent() {
  return (
    <svg
      className="pointer-events-none absolute right-6 top-6 h-10 w-10 text-cyan-500/15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2c-4.5 6-7 9.5-7 13a7 7 0 0 0 14 0c0-3.5-2.5-7-7-13z" />
    </svg>
  );
}

/* ── Module-scope types + helpers (no state, no re-render reset) ── */
type Stat = { num: string; label: string };
type Titled = { t: string; d: string };
type Param = { name: string; spec: string; live: string; status: string };
type Metric = { label: string; value: string };

const STATUS_MAP: Record<string, { dot: string; text: string; label: string }> = {
  ok: { dot: 'bg-emerald-500', text: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'OK' },
  warn: { dot: 'bg-amber-500', text: 'text-amber-700 bg-amber-50 border-amber-200', label: 'WARN' },
  alert: { dot: 'bg-red-500', text: 'text-red-700 bg-red-50 border-red-200', label: 'ALERT' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.ok;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}

function MetricCard({ m }: { m: Metric }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-[10px] font-light uppercase tracking-wider text-neutral-500">{m.label}</div>
      <div className="mt-1.5 font-mono text-xl font-bold text-cyan-500 md:text-2xl">{m.value}</div>
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((m, i) => <MetricCard key={i} m={m} />)}
    </div>
  );
}

/* ── Centered section header — used across many sections ─────── */
function CenteredHeader({
  n, label, title, body, dark = false,
}: { n: string; label: string; title: string; body?: string; dark?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
      <div className="flex items-center justify-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
        <span className={dark ? 'text-neutral-600' : 'text-neutral-400'}>{`// ${n}`}</span>
        <span className="h-px w-8 bg-cyan-500/60" />
        <span className="text-cyan-500">{label}</span>
      </div>
      <h2 className={`mt-5 text-2xl font-bold tracking-tight md:text-4xl ${dark ? 'text-white' : 'text-neutral-950'}`}>{title}</h2>
      <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
      {body && (
        <p className={`mt-6 text-base font-light leading-relaxed md:text-lg ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>{body}</p>
      )}
    </motion.div>
  );
}

export default function WaterPage() {
  const t = useTranslations('waterTesla');

  /* ── State: Tesla tab, calculator, FAQ ───────────────────── */
  const [activeTab, setActiveTab] = useState<'desal' | 'dist' | 'quality'>('desal');
  const [demand, setDemand] = useState(1000);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const harchMonthly = demand * 30 * 8;
  const tankerMonthly = demand * 30 * 25;
  const save15yr = Math.round(((tankerMonthly - harchMonthly) * 12 * 15) / 1_000_000);

  /* ── Translation arrays (typed) ───────────────────────────── */
  const heroStats = t.raw('hero.stats') as Stat[];
  const hardwareStats = t.raw('hardware.stats') as Stat[];
  const serviceStats = t.raw('service.stats') as Stat[];
  const energyStats = t.raw('energyEfficiency.stats') as Stat[];
  const energySources = t.raw('energyEfficiency.sources') as { name: string; share: string }[];
  const desalSteps = t.raw('desalinationProcess.steps') as { n: string; t: string; d: string }[];
  const aiItems = t.raw('aiNetwork.items') as Titled[];
  const aiStats = t.raw('aiNetwork.stats') as Stat[];
  const qualityParams = t.raw('qualityMonitoring.params') as Param[];
  const softwareProducts = t.raw('software.products') as Titled[];
  const dashboardMetrics = t.raw('software.metrics') as { label: string; value: string; color: string; bg: string }[];
  const processSteps = t.raw('process.steps') as { n: string; t: string; d: string; time: string }[];
  const applicationItems = t.raw('applications.items') as Titled[];
  const whyItems = t.raw('whyHarch.items') as Titled[];
  const comparisonRows = t.raw('comparison.rows') as string[][];
  const comparisonHeaders = t.raw('comparison.headers') as string[];
  const sectorItems = t.raw('sectors.items') as string[];
  const pricingPlans = t.raw('pricing.plans') as {
    name: string; tagline: string; price: string; size: string; features: string[]; cta: string; featured?: boolean;
  }[];
  const innoItems = t.raw('innovation.items') as Titled[];
  const geoCities = t.raw('geography.cities') as { name: string; type: string; plants: string }[];
  const testimonials = t.raw('testimonials.items') as { quote: string; author: string; role: string }[];
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];
  const resourceItems = t.raw('resources.items') as { t: string; d: string; type: string }[];
  const emergencyItems = t.raw('emergencyResponse.items') as Titled[];
  const emergencyTimeline = t.raw('emergencyResponse.timeline') as { hour: string; t: string; d: string }[];
  const flowSteps = t.raw('service.flowSteps') as { label: string; desc: string }[];
  const teslaDesalMetrics = t.raw('tesla.desal.metrics') as Metric[];
  const teslaDesalStages = t.raw('tesla.desal.stages') as { n: string; label: string; value: string; status: string }[];
  const teslaDesalBars = t.raw('tesla.desal.chartBars') as string[];
  const teslaDistMetrics = t.raw('tesla.dist.metrics') as Metric[];
  const teslaDistZones = t.raw('tesla.dist.zones') as { name: string; pressure: string; leaks: string; status: string }[];
  const teslaQualityMetrics = t.raw('tesla.quality.metrics') as Metric[];
  const teslaQualityParams = t.raw('tesla.quality.params') as Param[];


  return (
    <div className="bg-white text-neutral-900 scroll-smooth">
      {/* ═══════════════════════════════════════════════════════════
          1. HERO — full-bleed image, big title, wave divider bottom
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden bg-neutral-950">
        <Image
          src="/images/sections/water-desal-plant.jpg"
          alt={t('hero.heroImageAlt')}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/50 to-neutral-950/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 to-transparent" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-28 pb-40 text-white">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{duration: 0.6}} className="max-w-3xl">
            {/* HARCH WATER badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-sm">
              <Droplets size={14} className="text-cyan-500" />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
                {t('hero.badge')}
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              {t('hero.title')}
            </h1>
            <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-neutral-300 md:text-lg">
              {t('overview.body').split('.')[0] + '.'}
            </p>

            {/* CTAs — primary emerald-500, secondary white border */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/quote"
                aria-label={`${t('hero.cta')} — Harch Water`}
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('hero.cta')}
                <ArrowRight size={16} />
              </Link>
              <a
                href="tel:+212684440682"
                aria-label={`${t('ctaSection.callCta')} +212 684 440 682`}
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone size={16} />
                {t('ctaSection.callCta')}
              </a>
            </div>
          </motion.div>

          {/* Hero stats — bottom row, mono numbers */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{duration: 0.6, delay: 0.2}} className="mt-20 grid max-w-4xl grid-cols-1 gap-6 border-t border-white/10 pt-10 sm:grid-cols-3">
            {heroStats.map((s, i) => (
              <div key={i}>
                <div className="font-mono text-3xl font-bold text-cyan-500 md:text-4xl">{s.num}</div>
                <div className="mt-2 text-xs font-light uppercase tracking-wider text-neutral-400">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Wave divider bottom — Water's unique detail */}
        <WaveDivider className="bottom-0" fill="#ffffff" />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. OVERVIEW — light, intro
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-7">
              <SectionLabel n="01" label={t('overview.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('overview.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-600 md:text-lg">
                {t('overview.body')}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{delay: 0.15}} className="md:col-span-5">
              <div className="grid grid-cols-2 gap-4">
                {aiStats.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 transition-colors hover:border-cyan-500/40"
                  >
                    <div className="font-mono text-2xl font-bold text-cyan-500 md:text-3xl">{s.num}</div>
                    <div className="mt-1 text-xs font-light text-neutral-600">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. TESLA INTERACTION — 3 buttons switch a large dashboard
          Desalination / Distribution / Quality
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
              <span className="text-neutral-600">{'// 02'}</span>
              <span className="h-px w-8 bg-cyan-500/60" />
              <span className="text-cyan-500">{t('tesla.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('tesla.title')}</h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('tesla.body')}
            </p>
          </motion.div>

          {/* LARGE DASHBOARD MOCKUP — switches on tab */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mt-12 max-w-6xl">
            <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
              {/* Browser-style header */}
              <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                  </div>
                  <div className="ml-3 hidden items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1 sm:flex">
                    <Shield size={12} className="text-emerald-500" />
                    <span className="font-mono text-xs text-neutral-400">{t('ui.dashboardUrl')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  {t('tesla.liveLabel')}
                </div>
              </div>

              {/* Dashboard body — switches via AnimatePresence */}
              <div className="relative bg-neutral-950 p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {/* ── DESALINATION VIEW ────────────────────────────── */}
                  {activeTab === 'desal' && (
                    <motion.div key="desal" initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -12}} transition={{duration: 0.3}}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <div className="font-mono text-xs uppercase tracking-wider text-cyan-500">
                            {t('tesla.ctaDesal')}
                          </div>
                          <div className="mt-1 text-lg font-bold text-white md:text-xl">
                            {t('tesla.desal.subtitle')}
                          </div>
                        </div>
                        <StatusPill status="ok" />
                      </div>

                      {/* KPI metrics grid */}
                      <MetricGrid metrics={teslaDesalMetrics} />

                      {/* Output bar chart */}
                      <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                            {t('tesla.desal.chartLabel')}
                          </div>
                          <div className="font-mono text-xs text-neutral-500">24h</div>
                        </div>
                        <div className="mt-5 flex h-32 items-end gap-2">
                          {teslaDesalBars.map((b, i) => {
                            const h = parseInt(b, 10);
                            const maxBar = 31;
                            return (
                              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(h / maxBar) * 100}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/40 to-cyan-500">
                                <div className="mt-[-18px] text-center font-mono text-[10px] text-neutral-500">{b}</div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Live stages */}
                      <div className="mt-6">
                        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                          {t('tesla.desal.stagesLabel')}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                          {teslaDesalStages.map((s, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-neutral-800 bg-neutral-900 p-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-bold text-cyan-500">{s.n}</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                              </div>
                              <div className="mt-2 text-xs font-semibold text-white">{s.label}</div>
                              <div className="mt-1 font-mono text-xs text-neutral-400">{s.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── DISTRIBUTION VIEW ────────────────────────────── */}
                  {activeTab === 'dist' && (
                    <motion.div key="dist" initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -12}} transition={{duration: 0.3}}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <div className="font-mono text-xs uppercase tracking-wider text-cyan-500">
                            {t('tesla.ctaDist')}
                          </div>
                          <div className="mt-1 text-lg font-bold text-white md:text-xl">
                            {t('tesla.dist.subtitle')}
                          </div>
                        </div>
                        <StatusPill status="warn" />
                      </div>

                      {/* KPI metrics grid */}
                      <MetricGrid metrics={teslaDistMetrics} />

                      {/* Live network map */}
                      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
                          <svg
                            className="absolute inset-0 h-full w-full opacity-20"
                            aria-hidden="true"
                          >
                            <defs>
                              <pattern id="grid-cyan" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid-cyan)" />
                          </svg>
                          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" aria-hidden="true">
                            {/* Connection lines */}
                            {[
                              [80, 80, 200, 150],
                              [200, 150, 320, 90],
                              [200, 150, 320, 220],
                              [80, 80, 120, 200],
                              [120, 200, 200, 150],
                              [320, 90, 360, 180],
                              [320, 220, 280, 260],
                            ].map((line, i) => (
                              <line
                                key={i}
                                x1={line[0]}
                                y1={line[1]}
                                x2={line[2]}
                                y2={line[3]}
                                stroke="#06b6d4"
                                strokeWidth="1.5"
                                strokeOpacity="0.5"
                              />
                            ))}
                            {/* Pulsing nodes */}
                            {[
                              [80, 80, 14, 'ok'],
                              [120, 200, 10, 'warn'],
                              [200, 150, 18, 'ok'],
                              [320, 90, 12, 'ok'],
                              [320, 220, 10, 'alert'],
                              [360, 180, 8, 'ok'],
                              [280, 260, 8, 'ok'],
                            ].map((n, i) => {
                              const fillMap: Record<string, string> = {
                                ok: '#10b981',
                                warn: '#f59e0b',
                                alert: '#ef4444',
                              };
                              return (
                                <g key={i}>
                                  <circle
                                    cx={n[0]}
                                    cy={n[1]}
                                    r={n[2] as number}
                                    fill={fillMap[n[3] as string] || '#06b6d4'}
                                    fillOpacity="0.15"
                                    stroke={fillMap[n[3] as string] || '#06b6d4'}
                                    strokeWidth="1.5"
                                  />
                                  <circle
                                    cx={n[0]}
                                    cy={n[1]}
                                    r={(n[2] as number) / 2}
                                    fill={fillMap[n[3] as string] || '#06b6d4'}
                                  >
                                    <animate
                                      attributeName="opacity"
                                      values="1;0.4;1"
                                      dur="2s"
                                      begin={`${i * 0.3}s`}
                                      repeatCount="indefinite"
                                    />
                                  </circle>
                                </g>
                              );
                            })}
                          </svg>
                          <div className="absolute left-4 top-4 rounded-lg border border-neutral-800 bg-neutral-950/80 px-3 py-1.5 backdrop-blur-sm">
                            <div className="text-[10px] font-light uppercase tracking-wider text-neutral-500">
                              {t('tesla.dist.mapLabel')}
                            </div>
                          </div>
                        </div>

                        {/* Pressure zones list */}
                        <div className="space-y-2">
                          {teslaDistZones.map((z, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-3"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-semibold text-white">{z.name}</div>
                                <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-neutral-400">
                                  <span className="inline-flex items-center gap-1">
                                    <Gauge size={11} className="text-cyan-500" /> {z.pressure}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <AlertTriangle size={11} className="text-amber-500" /> {z.leaks}
                                  </span>
                                </div>
                              </div>
                              <StatusPill status={z.status} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── QUALITY VIEW ─────────────────────────────────── */}
                  {activeTab === 'quality' && (
                    <motion.div key="quality" initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -12}} transition={{duration: 0.3}}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <div className="font-mono text-xs uppercase tracking-wider text-cyan-500">
                            {t('tesla.ctaQuality')}
                          </div>
                          <div className="mt-1 text-lg font-bold text-white md:text-xl">
                            {t('tesla.quality.subtitle')}
                          </div>
                        </div>
                        <StatusPill status="ok" />
                      </div>

                      {/* KPI metrics grid */}
                      <MetricGrid metrics={teslaQualityMetrics} />

                      {/* Params grid + anomaly timeline */}
                      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                            {t('tesla.quality.paramsLabel')}
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {teslaQualityParams.map((p, i) => (
                              <div
                                key={i}
                                className="rounded-lg border border-neutral-800 bg-neutral-900 p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Beaker size={13} className="text-cyan-500" />
                                    <span className="text-xs font-semibold text-white">{p.name}</span>
                                  </div>
                                  <StatusPill status={p.status} />
                                </div>
                                <div className="mt-2 flex items-baseline justify-between">
                                  <div className="font-mono text-base font-bold text-cyan-500">{p.live}</div>
                                  <div className="font-mono text-[10px] text-neutral-500">{p.spec}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Anomaly timeline */}
                        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                            {t('tesla.quality.timelineLabel')}
                          </div>
                          <div className="mt-5 flex h-32 items-end gap-1">
                            {Array.from({ length: 24 }).map((_, i) => {
                              const isAnomaly = i === 7 || i === 14;
                              const height = isAnomaly ? 90 : 8 + ((i * 7) % 18);
                              return (
                                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.4, delay: i * 0.03 }} className={`flex-1 rounded-t ${isAnomaly ? 'bg-amber-500' : 'bg-cyan-500/30'}`} />
                              );
                            })}
                          </div>
                          <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-neutral-500">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>now</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer label */}
              <div className="border-t border-neutral-800 bg-neutral-950 px-5 py-3">
                <div className="flex items-center justify-between font-mono text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-2">
                    <CircleDot size={12} className="text-emerald-500" />
                    {activeTab === 'desal' && t('tesla.desal.footerLabel')}
                    {activeTab === 'dist' && t('tesla.dist.footerLabel')}
                    {activeTab === 'quality' && t('tesla.quality.footerLabel')}
                  </span>
                  <span className="hidden sm:inline">{t('ui.harchCorpBacking')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── 3 BUTTONS — switch the dashboard ─────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
            {(
              [
                { id: 'desal', label: t('tesla.ctaDesal'), Icon: Waves },
                { id: 'dist', label: t('tesla.ctaDist'), Icon: Radio },
                { id: 'quality', label: t('tesla.ctaQuality'), Icon: Beaker },
              ] as const
            ).map((btn) => {
              const isActive = activeTab === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setActiveTab(btn.id)}
                  aria-pressed={isActive}
                  className={`inline-flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-colors active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 ${
                    isActive
                      ? 'bg-cyan-500 text-white'
                      : 'border border-neutral-700 text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <btn.Icon size={16} />
                  {btn.label}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. DESALINATION PROCESS — light, 5-stage flow
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <CenteredHeader n="03" label={t('desalinationProcess.label')} title={t('desalinationProcess.title')} body={t('desalinationProcess.body')} />

          {/* Flow grid — responsive: vertical on mobile, horizontal on lg */}
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {desalSteps.map((step, i) => {
              const Icon = PROCESS_ICONS[i] || Waves;
              return (
                <motion.div key={i} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: i * 0.08}} className="relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 ring-1 ring-cyan-500/30">
                    <Icon size={22} className="text-cyan-500" />
                  </div>
                  <div className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-cyan-500">
                    {step.n}
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-neutral-950">{step.t}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-neutral-600">{step.d}</p>
                  {i < desalSteps.length - 1 && (
                    <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-neutral-300 lg:block">
                      <ArrowRight size={18} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Flow rate callout */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 flex flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:flex-row sm:gap-8">
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-cyan-500" />
              <span className="font-mono text-sm font-medium uppercase tracking-wider text-neutral-700">
                {t('desalinationProcess.flowLabel')}
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-neutral-950 md:text-3xl">
              {t('desalinationProcess.flowValue')}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. AI NETWORK — dark, live network visualization
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-5">
              <SectionLabel n="04" label={t('aiNetwork.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
                {t('aiNetwork.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('aiNetwork.body')}
              </p>

              {/* Stats grid — key numbers in cyan accent */}
              <div className="mt-10 grid grid-cols-2 gap-4">
                {aiStats.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-cyan-500/40"
                  >
                    <div className="font-mono text-2xl font-bold text-cyan-500 md:text-3xl">{s.num}</div>
                    <div className="mt-1 text-xs font-light text-neutral-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Network visualization */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="md:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    {t('aiNetwork.liveLabel')}
                  </div>
                </div>
                <div className="relative aspect-[4/3] bg-neutral-950">
                  <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden="true">
                    <defs>
                      <pattern id="grid-net" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-net)" />
                  </svg>
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" aria-hidden="true">
                    {[
                      [80, 80, 200, 150],
                      [200, 150, 320, 90],
                      [200, 150, 320, 220],
                      [80, 80, 120, 200],
                      [120, 200, 200, 150],
                      [320, 90, 360, 180],
                      [320, 220, 280, 260],
                    ].map((line, i) => (
                      <motion.line key={i} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1 }} />
                    ))}
                    {[
                      [80, 80, 14],
                      [120, 200, 10],
                      [200, 150, 18],
                      [320, 90, 12],
                      [320, 220, 10],
                      [360, 180, 8],
                      [280, 260, 8],
                    ].map((n, i) => (
                      <g key={i}>
                        <motion.circle cx={n[0]} cy={n[1]} r={n[2]} fill="#06b6d4" fillOpacity="0.2" stroke="#06b6d4" strokeWidth="1.5" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.3 }} />
                        <motion.circle cx={n[0]} cy={n[1]} r={n[2] / 2} fill="#06b6d4" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                      </g>
                    ))}
                  </svg>
                  <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { label: t('aiNetwork.nodes'), value: '1,247' },
                      { label: t('aiNetwork.leaks'), value: '3' },
                      { label: t('aiNetwork.pressure'), value: '4.2 bar' },
                      { label: t('aiNetwork.flow'), value: '547k m³' },
                    ].map((m, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-neutral-800 bg-neutral-950/80 p-2 backdrop-blur-sm"
                      >
                        <div className="font-mono text-sm font-bold text-cyan-500 sm:text-base">{m.value}</div>
                        <div className="text-[10px] font-light uppercase tracking-wider text-neutral-500">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute left-4 top-4 rounded-lg border border-neutral-800 bg-neutral-950/80 px-3 py-1.5 backdrop-blur-sm">
                    <div className="text-[10px] font-light uppercase tracking-wider text-neutral-500">
                      {t('aiNetwork.zoneLabel')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* AI items grid */}
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {aiItems.map((item, i) => (
              <motion.div key={i} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: i * 0.1}} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-neutral-800 hover:shadow-lg hover:shadow-cyan-500/5 md:p-8">
                <h3 className="text-lg font-bold text-white md:text-xl">{item.t}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-neutral-400">{item.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. QUALITY MONITORING — light, params + QR code
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-50 py-20 md:py-32">
        <DropletAccent />
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-7">
              <SectionLabel n="05" label={t('qualityMonitoring.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('qualityMonitoring.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-600 md:text-lg">
                {t('qualityMonitoring.body')}
              </p>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {qualityParams.map((p, i) => (
                  <motion.div key={i} initial={{opacity: 0, y: 15}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: i * 0.08}} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Beaker size={16} className="text-cyan-500" />
                        <span className="font-semibold text-neutral-950">{p.name}</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {p.status === 'ok' ? 'OK' : p.status}
                      </span>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <div className="font-mono text-2xl font-bold text-cyan-500">{p.live}</div>
                        <div className="text-[11px] font-light uppercase tracking-wider text-neutral-500">
                          {t('ui.liveReadingSuffix')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-light text-neutral-500">Spec</div>
                        <div className="font-mono text-xs font-semibold text-neutral-700">{p.spec}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 text-xs text-neutral-500">
                <span className="font-mono font-bold text-cyan-500">{t('qualityMonitoring.certCount')}</span>
                <span>{t('qualityMonitoring.certLabel')}</span>
              </div>
            </motion.div>

            {/* QR report card */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="md:col-span-5">
              <div className="sticky top-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <QrCode size={16} className="text-cyan-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-950">
                      {t('qualityMonitoring.reportLabel')}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    {t('ui.liveStatus')}
                  </span>
                </div>
                <div className="p-6">
                  <div className="mx-auto grid max-w-[200px] grid-cols-8 gap-0.5 rounded-lg bg-white p-3 ring-1 ring-neutral-200">
                    {Array.from({ length: 64 }).map((_, i) => {
                      const seed = (i * 7 + 13) % 11;
                      const filled = seed > 4;
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-sm ${filled ? 'bg-neutral-950' : 'bg-transparent'}`}
                        />
                      );
                    })}
                  </div>
                  <p className="mt-6 text-center text-sm font-light leading-relaxed text-neutral-600">
                    {t('qualityMonitoring.reportBody')}
                  </p>
                  <div className="mt-6 rounded-xl bg-neutral-50 p-4 text-center">
                    <div className="font-mono text-xs text-neutral-500">{t('ui.qrLotLabel')}</div>
                    <div className="mt-1 text-xs font-light text-neutral-500">{t('ui.qrTimestamp')}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. SOFTWARE DASHBOARD — dark, live metrics mockup
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
              <span className="text-neutral-600">{'// 06'}</span>
              <span className="h-px w-8 bg-cyan-500/60" />
              <span className="text-cyan-500">{t('software.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('software.title')}</h2>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            {/* Browser chrome */}
            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
              </div>
              <div className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1">
                <Shield size={12} className="text-emerald-500" />
                <span className="font-mono text-xs text-neutral-400">{t('ui.dashboardUrl')}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {t('ui.liveStatus')}
              </div>
            </div>
            {/* Dashboard body */}
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-cyan-500">{t('software.brandLabel')}</div>
                  <div className="mt-1 text-lg font-bold text-white">{t('software.plantLabel')}</div>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <button className="rounded-md bg-cyan-500/20 px-3 py-1 text-cyan-500">{t('ui.today')}</button>
                  <button className="rounded-md px-3 py-1 text-neutral-500 hover:text-neutral-300">{t('ui.sevenDay')}</button>
                  <button className="rounded-md px-3 py-1 text-neutral-500 hover:text-neutral-300">{t('ui.thirtyDay')}</button>
                </div>
              </div>
              {/* Metric cards */}
              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {dashboardMetrics.map((m, i) => (
                  <motion.div key={i} initial={{opacity: 0, y: 15}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: i * 0.1}} className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="text-[10px] font-light uppercase tracking-wider text-neutral-500">{m.label}</div>
                    <div className="mt-1.5 font-mono text-2xl font-bold text-cyan-500">{m.value}</div>
                    <div className="mt-3 flex h-6 items-end gap-0.5">
                      {Array.from({ length: 14 }).map((_, j) => (
                        <div key={j} className={`flex-1 rounded-sm ${m.bg}`} style={{ height: `${20 + ((j * 13) % 80)}%`, opacity: 0.4 + (j / 14) * 0.6 }} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Software products grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {softwareProducts.map((p, i) => (
              <motion.div key={i} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: i * 0.1}} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-cyan-500/40 md:p-8">
                <Cog size={22} className="text-cyan-500" />
                <h3 className="mt-4 text-lg font-bold text-white">{p.t}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-neutral-400">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. HARDWARE — dark, image + stats overlay
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-6">
              <SectionLabel n="07" label={t('hardware.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('hardware.title')}</h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('hardware.body')}
              </p>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {hardwareStats.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-cyan-500/40"
                  >
                    <div className="font-mono text-xl font-bold text-cyan-500 md:text-2xl">{s.num}</div>
                    <div className="mt-1 text-xs font-light text-neutral-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800">
                <Image
                  src="/images/sections/comp-water-plant.jpg"
                  alt={t('hardware.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-cyan-500">
                    <Cog size={14} />
                    <span>HARCH WATER · PLANT STACK</span>
                  </div>
                  <div className="mt-2 text-sm font-light text-neutral-300">
                    Sulzer HP pumps · Toray SWRO · ERI turbines
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. RELIABILITY — dark, image + body
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-900 text-white">
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800">
                <Image
                  src="/images/sections/water-control-room.jpg"
                  alt={t('reliability.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950/70 to-transparent" />
              </div>
            </div>
            <div className="md:col-span-6">
              <SectionLabel n="08" label={t('reliability.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('reliability.title')}</h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('reliability.body')}
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { num: '99.5%', label: 'Network uptime SLA' },
                  { num: 'N+1', label: 'Critical path redundancy' },
                  { num: '24/7', label: 'Control room monitoring' },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="font-mono text-xl font-bold text-cyan-500 md:text-2xl">{s.num}</div>
                    <div className="mt-1 text-[11px] font-light text-neutral-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. SERVICE / BOT-BOO — light, flow steps + stats
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 mb-6">
                <Image
                  src="/images/real/water-pipes.jpg"
                  alt={t('service.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-cyan-500">{t('service.label')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="text-neutral-400">{'// 09'}</span>
                <span className="h-px w-8 bg-cyan-500/60" />
                <span className="text-cyan-500">{t('service.label')}</span>
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('service.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-600 md:text-lg">
                {t('service.body')}
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {serviceStats.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:border-cyan-500/40"
                  >
                    <div className="font-mono text-xl font-bold text-cyan-500 md:text-2xl">{s.num}</div>
                    <div className="mt-1 text-[11px] font-light text-neutral-600">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Flow steps vertical */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{delay: 0.15}} className="md:col-span-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {flowSteps.map((step, i) => {
                  const Icon = [HandCoins, HardHat, Settings, Droplets][i] || HandCoins;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
                          <Icon size={18} className="text-cyan-500" />
                        </div>
                        <span className="font-mono text-xs font-bold text-cyan-500">0{i + 1}</span>
                      </div>
                      <h3 className="mt-4 text-base font-bold text-neutral-950">{step.label}</h3>
                      <p className="mt-2 text-sm font-light text-neutral-600">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. ENERGY EFFICIENCY — dark, energy sources chart
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        {/* Background accent image */}
        <Image
          src="/images/real/water-desalination.jpg"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover opacity-10"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/90 to-neutral-950" />
        <div className="relative mx-auto max-w-7xl px-6">
          <CenteredHeader n="10" label={t('energyEfficiency.label')} title={t('energyEfficiency.title')} body={t('energyEfficiency.body')} dark />

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-7">
              <div className="grid grid-cols-2 gap-4">
                {energyStats.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-cyan-500/40"
                  >
                    <div className="font-mono text-3xl font-bold text-cyan-500 md:text-4xl">{s.num}</div>
                    <div className="mt-2 text-xs font-light text-neutral-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Energy sources bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{delay: 0.15}} className="md:col-span-5">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <div className="flex items-center gap-2">
                  <Leaf size={16} className="text-cyan-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {t('energyEfficiency.sourceLabel')}
                  </span>
                </div>
                <div className="mt-4 text-xs font-mono text-neutral-500">{t('ui.renewableLabel')}</div>
                {/* Stacked energy bar */}
                <div className="mt-3 flex h-3 overflow-hidden rounded-full">
                  <div className="bg-amber-500" style={{ width: '52%' }} />
                  <div className="bg-cyan-500" style={{ width: '38%' }} />
                  <div className="bg-emerald-500" style={{ width: '10%' }} />
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { name: energySources[0]?.name || 'Solar PV', share: energySources[0]?.share || '52%', dot: 'bg-amber-500', icon: Sun },
                    { name: energySources[1]?.name || 'Wind', share: energySources[1]?.share || '38%', dot: 'bg-cyan-500', icon: Wind },
                    { name: energySources[2]?.name || 'Hydro storage', share: energySources[2]?.share || '10%', dot: 'bg-emerald-500', icon: Battery },
                  ].map((src, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <src.icon size={14} className="text-neutral-400" />
                        <span className="text-sm font-light text-neutral-300">{src.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${src.dot}`} />
                        <span className="font-mono text-sm font-bold text-white">{src.share}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          12. COMPARISON — light, table vs tanker trucks
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <CenteredHeader n="11" label={t('comparison.label')} title={t('comparison.title')} />

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-950 text-white">
                  {comparisonHeaders.map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider ${
                        i === 1 ? 'text-cyan-500' : 'text-neutral-400'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-neutral-200 last:border-0">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-5 py-4 text-sm ${
                          j === 0
                            ? 'font-semibold text-neutral-950'
                            : j === 1
                              ? 'font-mono text-cyan-500'
                              : 'font-light text-neutral-500'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          13. PRICING — light, 3 supply plans
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <CenteredHeader n="12" label={t('pricing.label')} title={t('pricing.title')} body={t('pricing.subtitle')} />

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {pricingPlans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative flex flex-col rounded-2xl border p-8 ${plan.featured ? 'border-emerald-500 bg-neutral-950 text-white shadow-xl' : 'border-neutral-200 bg-white text-neutral-950'}`}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    ★ {t('pricing.featuredBadge')}
                  </div>
                )}
                <div className="font-mono text-xs uppercase tracking-wider text-cyan-500">{plan.tagline}</div>
                <h3 className="mt-2 text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4 font-mono text-3xl font-bold">{plan.price}</div>
                <div className={`mt-2 text-xs ${plan.featured ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {plan.size}
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm font-light">
                      <CheckCircle2
                        size={16}
                        className={`mt-0.5 flex-shrink-0 ${plan.featured ? 'text-emerald-400' : 'text-cyan-500'}`}
                      />
                      <span className={plan.featured ? 'text-neutral-300' : 'text-neutral-700'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/quote"
                  className={`mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    plan.featured
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400 focus-visible:outline-emerald-500'
                      : 'border border-neutral-300 text-neutral-950 hover:bg-neutral-100 focus-visible:outline-neutral-400'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          14. INNOVATION — dark, 4 items
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <CenteredHeader n="13" label={t('innovation.label')} title={t('innovation.title')} body={t('innovation.subtitle')} dark />

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
            {innoItems.map((item, i) => {
              const Icon = INNO_ICONS[i] || Sparkles;
              const heroImage = i === 0 ? '/images/real/water-reservoir.jpg' : null;
              return (
                <motion.div key={i} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: i * 0.1}} className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5">
                  {heroImage && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image src={heroImage} alt={item.t} fill className="object-cover opacity-60" sizes="(min-width: 768px) 50vw, 100vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                      <div className="absolute left-6 top-6">
                        <Icon size={28} className="text-cyan-500" />
                      </div>
                    </div>
                  )}
                  {!heroImage && <div className="p-8"><Icon size={28} className="text-cyan-500" /></div>}
                  <div className="p-8 pt-4">
                    <h3 className="text-xl font-bold">{item.t}</h3>
                    <p className="mt-3 text-sm font-light leading-relaxed text-neutral-400">{item.d}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          15. EMERGENCY RESPONSE — dark, timeline + items
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-900 py-20 text-white md:py-32">
        {/* Background image overlay */}
        <Image
          src="/images/blog/water-loss-ai-reduction.jpg"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover opacity-10"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/80 via-neutral-900/90 to-neutral-900" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
              <span className="text-neutral-600">{'// 14'}</span>
              <span className="h-px w-8 bg-cyan-500/60" />
              <span className="text-cyan-500">{t('emergencyResponse.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('emergencyResponse.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('emergencyResponse.body')}
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-4">
            {emergencyTimeline.map((step, i) => (
              <motion.div key={i} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: i * 0.1}} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-cyan-500" />
                  <span className="font-mono text-xs font-bold text-cyan-500">{step.hour}</span>
                </div>
                <h3 className="mt-3 text-base font-bold text-white">{step.t}</h3>
                <p className="mt-2 text-xs font-light leading-relaxed text-neutral-400">{step.d}</p>
              </motion.div>
            ))}
          </div>

          {/* Emergency items grid */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {emergencyItems.map((item, i) => {
              const Icon = [Siren, Truck, Droplets, Shield][i] || AlertTriangle;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 transition-colors hover:border-cyan-500/40"
                >
                  <Icon size={20} className="text-cyan-500" />
                  <h3 className="mt-3 text-sm font-bold text-white">{item.t}</h3>
                  <p className="mt-2 text-xs font-light text-neutral-400">{item.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          16. CASE STUDIES — dark, Casablanca image + body
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-32">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800">
            <Image
              src="/images/sections/water-desal.jpg"
              alt={t('caseStudies.title')}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="font-mono text-xs uppercase tracking-wider text-cyan-500">
                Casablanca · Plant #002
              </div>
              <div className="mt-1 text-lg font-bold text-white">547,000 m³/day delivered</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col justify-center">
            <div className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
              <span className="text-neutral-600">{'// 15'}</span>
              <span className="h-px w-8 bg-cyan-500/60" />
              <span className="text-cyan-500">{t('caseStudies.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('caseStudies.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('caseStudies.body')}
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { num: '31% → 8%', label: 'Network losses' },
                { num: '99.7%', label: 'Uptime' },
                { num: '-84%', label: 'Complaints' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                  <div className="font-mono text-base font-bold text-cyan-500 md:text-lg">{s.num}</div>
                  <div className="mt-1 text-[11px] font-light text-neutral-400">{s.label}</div>
                </div>
              ))}
            </div>
            <Link
              href="/quote"
              aria-label={`${t('ctaSection.quoteCta')} — Harch Water`}
              className="mt-8 inline-flex w-fit items-center gap-2 bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              {t('ctaSection.quoteCta')}
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          17. TESTIMONIALS — light, 3 quotes
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <CenteredHeader n="16" label={t('testimonials.label')} title={t('testimonials.title')} />

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {testimonials.map((item, i) => (
              <motion.div key={i} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: i * 0.1}} className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
                <Quote size={24} className="text-cyan-500" />
                <p className="mt-4 flex-1 text-sm font-light leading-relaxed text-neutral-700">
                  “{item.quote}”
                </p>
                <div className="mt-6 border-t border-neutral-200 pt-4">
                  <div className="text-sm font-bold text-neutral-950">{item.author}</div>
                  <div className="mt-1 text-xs font-light text-neutral-500">{item.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          18. CALCULATOR — dark, interactive slider
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <CenteredHeader n="17" label={t('calculator.label')} title={t('calculator.title')} body={t('calculator.subtitle')} dark />

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:p-10">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{t('calculator.billLabel')}</label>
            <div className="mt-3 flex items-baseline gap-2">
              <input type="number" value={demand} onChange={(e) => setDemand(Math.max(1, Number(e.target.value)))} aria-label={t('calculator.billLabel')} className="bg-transparent font-mono text-4xl font-bold text-cyan-500 focus:outline-none md:text-5xl" />
              <span className="font-mono text-sm text-neutral-500">m³/day</span>
            </div>
            <input type="range" min="100" max="50000" step="100" value={demand} onChange={(e) => setDemand(Number(e.target.value))} aria-label={t('calculator.billLabel')} className="mt-6 w-full accent-cyan-500" />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: t('calculator.harchLabel'), value: `${harchMonthly.toLocaleString()} MAD`, cls: 'border-neutral-800 bg-neutral-950 text-cyan-500' },
                { label: t('calculator.tankerLabel'), value: `${tankerMonthly.toLocaleString()} MAD`, cls: 'border-neutral-800 bg-neutral-950 text-neutral-300' },
                { label: t('calculator.savingsLabel'), value: `${save15yr.toLocaleString()}M MAD`, cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500' },
              ].map((c, i) => (
                <div key={i} className={`rounded-xl border p-5 ${c.cls}`}>
                  <div className="text-[10px] font-light uppercase tracking-wider text-neutral-500">{c.label}</div>
                  <div className="mt-1 font-mono text-xl font-bold md:text-2xl">{c.value}</div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs font-light text-neutral-500">{t('calculator.disclaimer')}</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          19. GEOGRAPHY — light, 9 city cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-200">
                <Image
                  src="/images/real/water-desalination-new.jpg"
                  alt={t('geography.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="font-mono text-xs uppercase tracking-wider text-cyan-500">9 plants · 200M m³/yr</div>
                  <div className="mt-1 text-lg font-bold">Morocco · West Africa</div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{delay: 0.1}} className="md:col-span-7">
              <div className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="text-neutral-400">{'// 18'}</span>
                <span className="h-px w-8 bg-cyan-500/60" />
                <span className="text-cyan-500">{t('geography.label')}</span>
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('geography.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-600 md:text-lg">
                {t('geography.subtitle')}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {geoCities.map((city, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:border-cyan-500/40"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-cyan-500" />
                      <span className="text-xs font-bold text-neutral-950">{city.name}</span>
                    </div>
                    <div className="mt-2 text-[11px] font-light text-neutral-600">{city.type}</div>
                    <div className="mt-1 font-mono text-[10px] text-neutral-500">{city.plants}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          20. PROCESS — light, 5-step timeline
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-200">
                <Image
                  src="/images/sections/comp-water-pipes.jpg"
                  alt={t('process.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 30vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-cyan-500">{t('process.label')}</div>
                  <div className="mt-1 text-base font-bold">24 months · fixed-price EPC</div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{delay: 0.1}} className="md:col-span-8">
              <div className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="text-neutral-400">{'// 19'}</span>
                <span className="h-px w-8 bg-cyan-500/60" />
                <span className="text-cyan-500">{t('process.label')}</span>
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('process.title')}
              </h2>
              <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {processSteps.map((step, i) => (
                  <motion.div key={i} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: i * 0.1}} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="font-mono text-xs font-bold text-cyan-500">{step.n}</div>
                    <h3 className="mt-2 text-sm font-bold text-neutral-950">{step.t}</h3>
                    <p className="mt-2 text-xs font-light leading-relaxed text-neutral-600">{step.d}</p>
                    <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-neutral-400">{step.time}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          21. SECTORS — dark, 8 sector pills
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <SectionLabel n="20" label={t('sectors.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('sectors.title')}</h2>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {sectorItems.map((s, i) => {
              const Icon = SECTOR_ICONS[i % SECTOR_ICONS.length];
              return (
                <motion.div key={i} initial={{opacity: 0, y: 15}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: (i % 4) * 0.08}} className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-neutral-800 hover:shadow-lg hover:shadow-cyan-500/5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-950">
                    <Icon size={18} className="text-cyan-500" />
                  </div>
                  <span className="text-sm font-semibold">{s}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          22. APPLICATIONS — dark, 5 cards + image
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-900 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-5">
              <div className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="text-neutral-600">{'// 21'}</span>
                <span className="h-px w-8 bg-cyan-500/60" />
                <span className="text-cyan-500">{t('applications.label')}</span>
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('applications.title')}</h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('applications.body')}
              </p>
              <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800">
                <Image
                  src="/images/sections/water-dam.jpg"
                  alt={t('applications.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{delay: 0.15}} className="md:col-span-7">
              <div className="space-y-4">
                {applicationItems.map((item, i) => {
                  const Icon = APPLICATION_ICONS[i] || Droplets;
                  return (
                    <div key={i} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 ring-1 ring-cyan-500/30">
                          <Icon size={18} className="text-cyan-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold">{item.t}</h3>
                          <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">{item.d}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          23. WHY HARCH — light, 4 reasons
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-200">
                <Image
                  src="/images/sections/water-control.jpg"
                  alt={t('whyHarch.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 30vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-cyan-500">{t('whyHarch.label')}</div>
                  <div className="mt-1 text-base font-bold">4 reasons · Harch Water</div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{delay: 0.1}} className="md:col-span-8">
              <div className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="text-neutral-400">{'// 22'}</span>
                <span className="h-px w-8 bg-cyan-500/60" />
                <span className="text-cyan-500">{t('whyHarch.label')}</span>
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('whyHarch.title')}
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {whyItems.map((item, i) => {
                  const Icon = WHY_ICONS[i] || Shield;
                  return (
                    <motion.div key={i} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: i * 0.1}} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-lg">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-cyan-500/30">
                        <Icon size={18} className="text-cyan-500" />
                      </div>
                      <h3 className="mt-3 text-base font-bold text-neutral-950">{item.t}</h3>
                      <p className="mt-2 text-sm font-light leading-relaxed text-neutral-600">{item.d}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          24. FAQ — light, accordion
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
              <span className="text-neutral-400">{'// 23'}</span>
              <span className="h-px w-8 bg-cyan-500/60" />
              <span className="text-cyan-500">{t('faq.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('faq.title')}
            </h2>
          </motion.div>

          <div className="mt-12 space-y-3">
            {faqItems.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-water-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-neutral-50 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                  >
                    <span className="text-base font-bold text-neutral-950">{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`flex-shrink-0 text-cyan-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div id={`faq-water-${i}`} role="region" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                        <p className="px-6 pb-6 text-sm font-light leading-relaxed text-neutral-600">{item.a}</p>
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
          25. RESOURCES — light, 4 download cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <CenteredHeader n="24" label={t('resources.label')} title={t('resources.title')} body={t('resources.subtitle')} />

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
            {resourceItems.map((r, i) => (
              <motion.div key={i} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{ once: true }} transition={{delay: i * 0.1}} className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-colors hover:border-cyan-500/40">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-cyan-500" />
                    <h3 className="text-base font-bold text-neutral-950">{r.t}</h3>
                  </div>
                  <p className="mt-2 text-sm font-light leading-relaxed text-neutral-600">{r.d}</p>
                  <div className="mt-3 font-mono text-[11px] text-neutral-500">{r.type}</div>
                </div>
                <button
                  type="button"
                  aria-label={`${t('resources.download')} — ${r.t}`}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:border-cyan-500 hover:text-cyan-500 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                >
                  <Download size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          26. FINAL CTA — dark, wave divider top, back to Harch Corp
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        {/* Wave divider top — Water's unique detail */}
        <WaveDivider className="top-0" fill="#ffffff" flip />
        {/* Full-bleed background image */}
        <Image
          src="/images/blog/desalination-ai-optimization.jpg"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/70 to-neutral-950/90" />

        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5">
              <Droplets size={14} className="text-cyan-500" />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
                {t('hero.badge')}
              </span>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t('finalCta.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('finalCta.subtitle')}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
              <Link
                href="/quote"
                aria-label={`${t('finalCta.primary')} — Harch Water`}
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('finalCta.primary')}
                <ArrowRight size={16} />
              </Link>
              <a
                href="tel:+212684440682"
                aria-label={`${t('finalCta.secondary')} +212 684 440 682`}
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone size={16} />
                {t('finalCta.secondary')}
              </a>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-2">
              <div className="text-left">
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan-500">
                  {t('ctaSection.quoteCta')}
                </div>
                <div className="mt-2 text-sm font-light text-neutral-400">{t('ctaSection.quoteBody')}</div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan-500">
                  {t('ctaSection.callCta')}
                </div>
                <div className="mt-2 text-sm font-light text-neutral-400">{t('ctaSection.callBody')}</div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3 font-mono text-xs text-neutral-500">
              <Shield size={14} className="text-emerald-500" />
              {t('ui.harchCorpBacking')}
            </div>

            <Link
              href="/"
              aria-label={t('ui.backToHarchCorp')}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-cyan-500 transition-colors hover:text-cyan-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
            >
              <ArrowLeft size={14} />
              {t('ui.backToHarchCorp')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

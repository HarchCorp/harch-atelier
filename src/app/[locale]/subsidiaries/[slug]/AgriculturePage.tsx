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
  Droplets,
  Plane,
  Cpu,
  Sparkles,
  Leaf,
  Wheat,
  Sprout,
  Sun,
  MapPin,
  ChevronDown,
  FileText,
  Download,
  Quote,
  Radio,
  Thermometer,
  Zap,
  ShoppingBag,
  Tractor,
  Users,
  Bell,
  Activity,
  Microscope,
  Boxes,
  Beaker,
  Globe,
  HandCoins,
  HardHat,
  Settings,
  ArrowRightLeft,
  Clock,
  Battery,
  Target,
  Layers,
  Wifi,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HARCH AGRI — Harch Corp Brand System v2 compliant
   ───────────────────────────────────────────────────────────────
   • Backgrounds : bg-neutral-950 (dark) · bg-white / bg-neutral-50 (light)
   • Text        : text-neutral-950 / text-white / text-neutral-500 / text-neutral-400
   • Borders     : border-neutral-200 (light) · border-neutral-800 (dark)
   • Accent      : lime-500 (subsidiary) — labels, key stats, icon bg, hovers, accent bars
   • Primary CTA : bg-emerald-500 (Harch brand green — the unifying thread)
   • Typography  : Inter (font-sans) for everything · Space Mono (font-mono) for data
   • Unique motif: growth vine (organic SVG curve with leaves)
   • Tesla interaction: Sensors / Drones / AI Advisory (3-button mockup switcher)
   • NO wave dividers · 24+ sections · 'use client' · framer-motion
   ═══════════════════════════════════════════════════════════════ */

const JOURNEY_ICONS = [Microscope, Radio, Plane, Cpu, Tractor, ShoppingBag];
const WHY_ICONS = [Cpu, Shield, HandCoins, Globe];
const SECTOR_ICONS = [Wheat, Sprout, Leaf, Droplets, Sun, Boxes, Users, Activity];
const FLOW_ICONS = [HandCoins, HardHat, Settings, ArrowRightLeft];

/* Override Tailwind's --font-mono on this subtree so every `font-mono` utility
   renders Space Mono per the Harch Brand System. */
const monoOverride = {
  '--font-mono': 'var(--font-space-mono)',
} as CSSProperties;

/* ── Premium easing — tesla.com-style spring-out cubic-bezier.
   Used for Tesla tab transitions, card lifts, and AnimatePresence. */
const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

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
      <span className="h-px w-8 bg-lime-500/60" />
      <span className="text-lime-600 dark:text-lime-500">{label}</span>
    </div>
  );
}

/* ── Growth vine — Agriculture subsidiary unique motif ──────── */
function GrowthVine() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 h-full w-full"
      style={{ opacity: 0.08 }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0 100% C 15% 70%, 25% 85%, 35% 55% S 55% 35%, 70% 50% S 90% 25%, 100% 15%"
        stroke="#84cc16"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M5% 100% C 20% 80%, 30% 92%, 42% 65% S 60% 50%, 75% 60% S 92% 40%, 100% 30%"
        stroke="#65a30d"
        strokeWidth="0.8"
        fill="none"
      />
      <g fill="#84cc16">
        <ellipse cx="22%" cy="78%" rx="4" ry="2" transform="rotate(-30 22% 78%)" />
        <ellipse cx="48%" cy="52%" rx="4" ry="2" transform="rotate(20 48% 52%)" />
        <ellipse cx="72%" cy="48%" rx="4" ry="2" transform="rotate(-15 72% 48%)" />
        <ellipse cx="90%" cy="22%" rx="4" ry="2" transform="rotate(35 90% 22%)" />
      </g>
    </svg>
  );
}

/* ── Subtle leaf decoration — sparing lime accent ───────────── */
function LeafAccent() {
  return (
    <svg
      className="pointer-events-none absolute right-6 top-6 h-12 w-12 text-lime-500/10"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3c.5.12 1 .18 1.29.18C19 19.5 22 11 22 6c-1 1-3 2-5 2z" />
    </svg>
  );
}

/* ── Tiny status pill used by the Tesla mockups ─────────────── */
function StatusPill({ tone, children }: { tone: 'opt' | 'warn' | 'alert'; children: React.ReactNode }) {
  const tones = {
    opt: 'border-lime-500/40 bg-lime-500/10 text-lime-700 dark:text-lime-400',
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

export default function AgriculturePage() {
  const t = useTranslations('agriTesla');

  /* ── Tesla interaction state ─────────────────────────────── */
  const [activeView, setActiveView] = useState<0 | 1 | 2>(0);

  /* ── Calculator state — hectares under management ─────────── */
  const [hectares, setHectares] = useState(10);
  const baselineYield = 2.4; // t/ha baseline
  const improvedYield = baselineYield * 1.24; // +24%
  const pricePerTonne = 4200; // MAD/tonne average
  const monthlyExtra = Math.round(
    ((improvedYield - baselineYield) * hectares * pricePerTonne) / 12,
  );
  const yearlyExtra = monthlyExtra * 12;
  const fiveYearExtra = Math.round((yearlyExtra * 5) / 1000); // in k MAD

  /* ── FAQ accordion state ───────────────────────────────────── */
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* ── Translation arrays (typed) ────────────────────────────── */
  const heroStats = t.raw('hero.stats') as { num: string; label: string }[];
  const tickerItems = t.raw('ticker.items') as { num: string; label: string }[];
  const journeySteps = t.raw('journey.steps') as { n: string; t: string; d: string }[];
  const hardwareStats = t.raw('hardware.stats') as { num: string; label: string }[];
  const droneStats = t.raw('drones.stats') as { num: string; label: string }[];
  const droneBullets = t.raw('drones.bullets') as string[];
  const apolloStats = t.raw('apollo.stats') as { num: string; label: string }[];
  const verticalStats = t.raw('vertical.stats') as { num: string; label: string }[];
  const verticalCrops = t.raw('vertical.crops') as string[];
  const aiStats = t.raw('aiAdvisory.stats') as { num: string; label: string }[];
  const aggroStats = t.raw('agronomists.stats') as { num: string; label: string }[];
  const marketStats = t.raw('markets.stats') as { num: string; label: string }[];
  const financeStats = t.raw('financing.stats') as { num: string; label: string }[];
  const financePartners = t.raw('financing.partners') as string[];
  const softwareMetrics = t.raw('software.metrics') as {
    label: string;
    value: string;
    color: string;
    bg: string;
  }[];
  const softwareProducts = t.raw('software.products') as { t: string; d: string }[];
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
  const flowSteps = t.raw('service.flowSteps') as { label: string; desc: string }[];

  /* ── Tesla mockup translation arrays ──────────────────────── */
  const sensorZones = t.raw('tesla.sensors.zones') as {
    name: string;
    moisture: string;
    npk: string;
    ph: string;
    ec: string;
    status: string;
  }[];
  const droneFleet = t.raw('tesla.drones.fleet') as {
    id: string;
    status: string;
    mission: string;
    battery: string;
    alt: string;
  }[];
  const aiRecs = t.raw('tesla.aiAdvisory.recommendations') as {
    zone: string;
    action: string;
    reason: string;
    confidence: string;
  }[];

  return (
    <div
      className="bg-white font-sans text-neutral-950 antialiased selection:bg-emerald-500 selection:text-white"
      style={monoOverride}
    >

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Full-bleed aerial, neutral overlay, HARCH · AGRI badge
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-neutral-950">
        <Image
          src="/images/sections/agri-green-crops-aerial.jpg"
          alt={t('hero.heroImageAlt')}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/45 to-neutral-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 to-transparent" />
        <GrowthVine />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-16 md:px-12 md:py-24">
          {/* Top — HARCH · AGRI badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center md:justify-start"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-5 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-500" />
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
                  className="border-l-2 border-lime-500/50 pl-5 text-left"
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
                href="/quote?vertical=agriculture"
                aria-label={`${t('hero.cta')} — Harch Agri`}
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
          2. OVERVIEW — clean light section, leaf accent
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <LeafAccent />
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
            <div className="mt-6 h-0.5 w-16 bg-lime-500" />
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
          3. TESLA INTERACTION — Sensors / Drones / AI Advisory
              3 buttons that switch a large mockup screen.
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(132,204,22,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(132,204,22,0.10) 0%, transparent 50%)',
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

          {/* ── Large mockup screen ─────────────────────────── */}
          <div className="mt-14 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            {/* Mockup chrome */}
            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950/60 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-lime-500/60" />
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                harch.agri / ops / live
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-lime-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-500" />
                LIVE
              </div>
            </div>

            {/* Mockup body */}
            <div className="p-5 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.38, ease: EASE_PREMIUM }}
                >

                  {/* ───── VIEW 0 — SENSORS ───── */}
                  {activeView === 0 && (
                    <div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3">
                            <Radio size={20} className="text-lime-500" aria-hidden="true" />
                            <h3 className="text-lg font-bold text-white">
                              {t('tesla.sensors.title')}
                            </h3>
                          </div>
                          <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-neutral-400">
                            {t('tesla.sensors.body')}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-lime-500">
                              {t('tesla.sensors.stat1Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.sensors.stat1Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-lime-500">
                              {t('tesla.sensors.stat2Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.sensors.stat2Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-lime-500">
                              {t('tesla.sensors.stat3Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.sensors.stat3Label')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sensor zones table */}
                      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/40">
                        <table className="w-full min-w-[640px] border-collapse text-left">
                          <thead>
                            <tr className="border-b border-neutral-800 bg-neutral-950/60">
                              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                {t('tesla.sensors.legend.zone')}
                              </th>
                              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                {t('tesla.sensors.legend.moisture')}
                              </th>
                              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                {t('tesla.sensors.legend.npk')}
                              </th>
                              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                {t('tesla.sensors.legend.ph')}
                              </th>
                              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                {t('tesla.sensors.legend.ec')}
                              </th>
                              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                {t('tesla.sensors.legend.status')}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sensorZones.map((z, i) => (
                              <tr key={i} className="border-b border-neutral-800/60 last:border-0">
                                <td className="px-4 py-3 text-sm font-medium text-white">{z.name}</td>
                                <td className="px-4 py-3 font-mono text-sm text-lime-400">{z.moisture}</td>
                                <td className="px-4 py-3 font-mono text-sm text-neutral-300">{z.npk}</td>
                                <td className="px-4 py-3 font-mono text-sm text-neutral-300">{z.ph}</td>
                                <td className="px-4 py-3 font-mono text-sm text-neutral-300">{z.ec}</td>
                                <td className="px-4 py-3">
                                  <StatusPill tone={z.status.toLowerCase().includes('alert') ? 'alert' : z.status.toLowerCase().includes('irrigate') ? 'warn' : 'opt'}>
                                    {z.status}
                                  </StatusPill>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
                          <Bell size={12} aria-hidden="true" />
                          {t('tesla.sensors.alert')}
                        </div>
                        <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                          {t('tesla.sensors.poweredBy')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ───── VIEW 1 — DRONES ───── */}
                  {activeView === 1 && (
                    <div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3">
                            <Plane size={20} className="text-lime-500" aria-hidden="true" />
                            <h3 className="text-lg font-bold text-white">
                              {t('tesla.drones.title')}
                            </h3>
                          </div>
                          <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-neutral-400">
                            {t('tesla.drones.body')}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-lime-500">
                              {t('tesla.drones.stat1Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.drones.stat1Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-lime-500">
                              {t('tesla.drones.stat2Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.drones.stat2Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-2xl font-bold text-lime-500">
                              {t('tesla.drones.stat3Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.drones.stat3Label')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Drone fleet grid + mini map */}
                      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Fleet table */}
                        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/40">
                          <table className="w-full border-collapse text-left">
                            <thead>
                              <tr className="border-b border-neutral-800 bg-neutral-950/60">
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.drones.legend.id')}
                                </th>
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.drones.legend.status')}
                                </th>
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.drones.legend.mission')}
                                </th>
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.drones.legend.battery')}
                                </th>
                                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  {t('tesla.drones.legend.alt')}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {droneFleet.map((d, i) => (
                                <tr key={i} className="border-b border-neutral-800/60 last:border-0">
                                  <td className="px-4 py-3 font-mono text-sm font-bold text-lime-400">{d.id}</td>
                                  <td className="px-4 py-3">
                                    <StatusPill tone={d.status.toLowerCase().includes('charge') ? 'warn' : 'opt'}>
                                      {d.status}
                                    </StatusPill>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-neutral-300">{d.mission}</td>
                                  <td className="px-4 py-3 font-mono text-sm text-neutral-300">{d.battery}</td>
                                  <td className="px-4 py-3 font-mono text-sm text-neutral-300">{d.alt}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mini map */}
                        <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/40 sm:aspect-[4/3] lg:aspect-square">
                          <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
                            <defs>
                              <pattern id="agri-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#262626" strokeWidth="0.5" />
                              </pattern>
                              <pattern id="agri-fields" width="80" height="80" patternUnits="userSpaceOnUse">
                                <rect width="80" height="80" fill="#0a0a0a" />
                                <rect width="38" height="38" fill="#13210a" />
                                <rect x="42" y="42" width="38" height="38" fill="#13210a" />
                              </pattern>
                            </defs>
                            <rect width="400" height="400" fill="url(#agri-fields)" />
                            <rect width="400" height="400" fill="url(#agri-grid)" />
                            {/* Field contours */}
                            <path d="M 50 80 Q 120 60 200 90 T 350 100" stroke="#3f3f1a" strokeWidth="1" fill="none" opacity="0.6" />
                            <path d="M 30 200 Q 130 180 230 220 T 380 230" stroke="#3f3f1a" strokeWidth="1" fill="none" opacity="0.6" />
                            <path d="M 60 320 Q 160 300 240 330 T 370 340" stroke="#3f3f1a" strokeWidth="1" fill="none" opacity="0.6" />

                            {/* Drone paths */}
                            <path d="M 60 80 Q 180 60 300 100" stroke="#84cc16" strokeWidth="1.5" fill="none" strokeDasharray="4 4" opacity="0.7" />
                            <path d="M 80 280 Q 200 260 320 300" stroke="#84cc16" strokeWidth="1.5" fill="none" strokeDasharray="4 4" opacity="0.7" />

                            {/* Drone markers */}
                            <g>
                              <circle cx="300" cy="100" r="10" fill="#84cc16" />
                              <circle cx="300" cy="100" r="18" fill="none" stroke="#84cc16" strokeWidth="1" opacity="0.4" className="animate-pulse" />
                              <text x="316" y="104" fill="#84cc16" fontSize="10" fontFamily="monospace" fontWeight="bold">AG-01</text>
                            </g>
                            <g>
                              <circle cx="160" cy="190" r="8" fill="#f59e0b" />
                              <circle cx="160" cy="190" r="14" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
                              <text x="176" y="194" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">AG-02</text>
                            </g>
                            <g>
                              <circle cx="220" cy="290" r="10" fill="#84cc16" />
                              <circle cx="220" cy="290" r="18" fill="none" stroke="#84cc16" strokeWidth="1" opacity="0.4" className="animate-pulse" />
                              <text x="236" y="294" fill="#84cc16" fontSize="10" fontFamily="monospace" fontWeight="bold">AG-03</text>
                            </g>
                          </svg>
                          <div className="absolute left-3 top-3 rounded-md bg-neutral-950/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-300 backdrop-blur">
                            Fleet map · Casablanca pivot
                          </div>
                          <div className="absolute bottom-3 right-3 rounded-md bg-neutral-950/80 px-2 py-1 font-mono text-[10px] text-lime-500 backdrop-blur">
                            3 units · 2 airborne
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
                          <Battery size={12} aria-hidden="true" />
                          {t('tesla.drones.alert')}
                        </div>
                        <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                          {t('tesla.drones.poweredBy')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ───── VIEW 2 — AI ADVISORY ───── */}
                  {activeView === 2 && (
                    <div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3">
                            <Sparkles size={20} className="text-lime-500" aria-hidden="true" />
                            <h3 className="text-lg font-bold text-white">
                              {t('tesla.aiAdvisory.title')}
                            </h3>
                          </div>
                          <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-neutral-400">
                            {t('tesla.aiAdvisory.body')}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-xl font-bold text-lime-500">
                              {t('tesla.aiAdvisory.stat1Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.aiAdvisory.stat1Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-xl font-bold text-lime-500">
                              {t('tesla.aiAdvisory.stat2Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.aiAdvisory.stat2Label')}
                            </div>
                          </div>
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                            <div className="font-mono text-xl font-bold text-lime-500">
                              {t('tesla.aiAdvisory.stat3Value')}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                              {t('tesla.aiAdvisory.stat3Label')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations list */}
                      <div className="mt-6 space-y-3">
                        {aiRecs.map((r, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 transition-colors hover:border-lime-500/40"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-lime-500">
                                    {r.zone}
                                  </span>
                                  <span className="text-sm font-semibold text-white">{r.action}</span>
                                </div>
                                <p className="mt-1 text-xs font-light text-neutral-400">{r.reason}</p>
                              </div>
                              <div className="flex items-center gap-3 sm:flex-shrink-0">
                                <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-neutral-800 sm:block">
                                  <div
                                    className="h-full rounded-full bg-lime-500"
                                    style={{ width: r.confidence.replace('%', '').replace(',', '').trim() + '%' }}
                                  />
                                </div>
                                <span className="font-mono text-xs font-bold text-lime-400">
                                  {r.confidence}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs text-lime-400">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          {t('tesla.aiAdvisory.alert')}
                        </div>
                        <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                          {t('tesla.aiAdvisory.poweredBy')}
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
              { idx: 0 as const, icon: Radio, tab: t('tesla.tab1'), desc: t('tesla.tab1Desc') },
              { idx: 1 as const, icon: Plane, tab: t('tesla.tab2'), desc: t('tesla.tab2Desc') },
              { idx: 2 as const, icon: Sparkles, tab: t('tesla.tab3'), desc: t('tesla.tab3Desc') },
            ].map(({ idx, icon: Icon, tab, desc }) => {
              const active = activeView === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveView(idx)}
                  aria-pressed={active}
                  aria-label={tab}
                  className={`group relative flex items-start gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 active:scale-[0.98] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500 ${
                    active
                      ? 'border-lime-500 bg-lime-500/10 shadow-lg shadow-lime-500/10'
                      : 'border-neutral-800 bg-neutral-900 hover:border-lime-500/40 hover:bg-neutral-900/80 hover:shadow-md hover:shadow-lime-500/5'
                  }`}
                >
                  {/* Sliding top accent — premium tesla.com detail */}
                  {active && (
                    <motion.span
                      layoutId="teslaTabAccent-agri"
                      className="absolute inset-x-0 top-0 h-0.5 bg-lime-500"
                      transition={{ duration: 0.32, ease: EASE_PREMIUM }}
                      aria-hidden="true"
                    />
                  )}
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    active ? 'border-lime-500 bg-lime-500/20' : 'border-neutral-700 bg-neutral-950 group-hover:border-lime-500/40'
                  }`}>
                    <Icon size={18} className={active ? 'text-lime-400' : 'text-neutral-400'} aria-hidden="true" />
                  </div>
                  <div>
                    <div className={`font-mono text-[10px] uppercase tracking-wider ${active ? 'text-lime-400' : 'text-neutral-500'}`}>
                      {`0${idx + 1}`} / 03
                    </div>
                    <div className={`mt-0.5 text-sm font-bold uppercase tracking-wider ${active ? 'text-lime-400' : 'text-white'}`}>
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
          4. JOURNEY — dark, 6-step flow diagram (soil to shelf)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="03" label={t('journey.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('journey.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('journey.body')}
            </p>
          </div>

          {/* Flow diagram */}
          <div className="mt-16 md:mt-20">
            {/* Desktop horizontal flow */}
            <div className="hidden lg:block">
              <div className="relative">
                <svg
                  className="absolute left-0 right-0 top-12 h-1 w-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 1000 4"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="agriFlowGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#84cc16" stopOpacity="0.15" />
                      <stop offset="50%" stopColor="#84cc16" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#84cc16" stopOpacity="0.15" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="2" x2="1000" y2="2" stroke="url(#agriFlowGrad)" strokeWidth="2" />
                </svg>
                <div className="grid grid-cols-6 gap-4">
                  {journeySteps.map((step, i) => {
                    const Icon = JOURNEY_ICONS[i] || Microscope;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative text-center"
                      >
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-neutral-200 bg-white ring-1 ring-lime-500/30">
                          <Icon size={32} className="text-lime-500" aria-hidden="true" />
                        </div>
                        <div className="font-mono text-xs font-bold uppercase tracking-wider text-lime-600">
                          {step.n}
                        </div>
                        <h3 className="mt-2 text-lg font-bold text-neutral-950">{step.t}</h3>
                        <p className="mt-3 text-sm font-light leading-relaxed text-neutral-500">
                          {step.d}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile vertical flow */}
            <div className="space-y-6 lg:hidden">
              {journeySteps.map((step, i) => {
                const Icon = JOURNEY_ICONS[i] || Microscope;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-5 rounded-2xl border border-neutral-200 bg-white p-5"
                  >
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 ring-1 ring-lime-500/30">
                      <Icon size={22} className="text-lime-500" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold uppercase tracking-wider text-lime-600">
                        {step.n}
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-neutral-950">{step.t}</h3>
                      <p className="mt-1 text-sm font-light leading-relaxed text-neutral-500">
                        {step.d}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. HARDWARE — IoT sensors with image stats
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
          <Image
            src="/images/sections/agri-iot-sensor.jpg"
            alt={t('hardware.title')}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-neutral-950/30 to-neutral-950/60" />
          <div className="relative z-10 flex h-full items-center justify-center px-6">
            <div className="grid w-full max-w-5xl grid-cols-1 gap-12 text-center md:grid-cols-3">
              {hardwareStats.map((s, i) => (
                <div key={i}>
                  <div className="font-mono text-4xl font-bold text-white sm:text-5xl md:text-6xl">{s.num}</div>
                  <div className="mt-3 text-xs font-light uppercase tracking-wider text-neutral-300 sm:text-sm md:text-base">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white py-20 md:py-32">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-2 md:gap-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SectionLabel n="04" label={t('hardware.label')} />
              <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-neutral-950 md:text-4xl">
                {t('hardware.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-lime-500" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('hardware.body')}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { icon: Droplets, label: 'Moisture' },
                  { icon: Beaker, label: 'N-P-K' },
                  { icon: Thermometer, label: 'pH' },
                  { icon: Zap, label: 'EC' },
                  { icon: Sun, label: 'Solar' },
                  { icon: Wifi, label: '4G LTE' },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2">
                    <Icon size={14} className="text-lime-500" aria-hidden="true" />
                    <span className="font-mono text-xs uppercase tracking-wider text-neutral-700">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. DRONES — dark split with image + bullets
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
              src="/images/sections/agri-drone-hightech.jpg"
              alt={t('drones.title')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-md bg-neutral-950/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-lime-400 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
                AG-01 · Airborne
              </span>
              <span className="rounded-md bg-neutral-950/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-300 backdrop-blur">
                NDVI · 120 m
              </span>
            </div>
          </motion.div>
          <div>
            <SectionLabel n="05" label={t('drones.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('drones.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-lime-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('drones.body')}
            </p>
            <ul className="mt-8 space-y-3">
              {droneBullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-light text-neutral-300">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-lime-500" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {droneStats.map((s, i) => (
                <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                  <div className="font-mono text-xl font-bold text-lime-500">{s.num}</div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. APOLLO HARVEST — light split with image
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:gap-16">
          <div className="order-2 md:order-1">
            <SectionLabel n="06" label={t('apollo.label')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('apollo.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-lime-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('apollo.body')}
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {apolloStats.map((s, i) => (
                <div key={i} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="font-mono text-xl font-bold text-lime-600">{s.num}</div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/quote?vertical=agriculture"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-950 underline-offset-4 hover:underline"
            >
              {t('hardware.learnMore')}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-1 aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 md:order-2"
          >
            <Image
              src="/images/sections/agri-apollo-harvest.jpg"
              alt={t('apollo.title')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. VERTICAL FARMING — dark split
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
              src="/images/sections/agri-vertical-interior.jpg"
              alt={t('vertical.title')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2">
              {verticalStats.map((s, i) => (
                <div key={i} className="rounded-md bg-neutral-950/70 px-3 py-2 backdrop-blur">
                  <div className="font-mono text-sm font-bold text-lime-400">{s.num}</div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <div>
            <SectionLabel n="07" label={t('vertical.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('vertical.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-lime-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('vertical.body')}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {verticalCrops.map((c, i) => (
                <span
                  key={i}
                  className="rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-lime-400"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                {t('reliabilityExtra.tempLabel')}
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-lime-500">
                {t('reliabilityExtra.tempValue')}
              </div>
              <p className="mt-2 text-xs font-light text-neutral-400">
                {t('reliabilityExtra.warantyLabel')}: {t('reliabilityExtra.warantyValue')} · {t('reliabilityExtra.ipLabel')}: {t('reliabilityExtra.ipValue')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. AI ADVISORY + AGRONOMISTS — light 2-col
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <SectionLabel n="08" label={t('aiAdvisory.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('aiAdvisory.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-lime-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('aiAdvisory.body')}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {aiStats.map((s, i) => (
                  <div key={i} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="font-mono text-xl font-bold text-lime-600">{s.num}</div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <SectionLabel n="09" label={t('agronomists.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('agronomists.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-lime-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('agronomists.body')}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {aggroStats.map((s, i) => (
                  <div key={i} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="font-mono text-xl font-bold text-lime-600">{s.num}</div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. MARKETS & FINANCING — dark split
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <SectionLabel n="10" label={t('markets.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('markets.title')}</h2>
              <div className="mt-6 h-0.5 w-16 bg-lime-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('markets.body')}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {marketStats.map((s, i) => (
                  <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                    <div className="font-mono text-xl font-bold text-lime-500">{s.num}</div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionLabel n="11" label={t('financing.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('financing.title')}</h2>
              <div className="mt-6 h-0.5 w-16 bg-lime-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('financing.body')}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {financeStats.map((s, i) => (
                  <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                    <div className="font-mono text-xl font-bold text-lime-500">{s.num}</div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {financePartners.map((p, i) => (
                  <span key={i} className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium uppercase tracking-wider text-neutral-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. SOFTWARE PRODUCTS — light grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="12" label={t('software.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('software.title')}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {softwareMetrics.map((m, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-center">
                <div className={`font-mono text-2xl font-bold ${m.color}`}>{m.value}</div>
                <div className="mt-2 text-[10px] font-medium uppercase tracking-wider text-neutral-500">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {softwareProducts.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-colors hover:border-lime-500/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-500/10">
                  <Layers size={18} className="text-lime-600" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-neutral-950">{p.t}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          12. PROCESS — dark timeline
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="13" label={t('process.label')} dark align="center" />
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
                  <div className="font-mono text-3xl font-bold text-lime-500">{step.n}</div>
                </div>
                <div className="md:col-span-7">
                  <h3 className="text-lg font-bold text-white">{step.t}</h3>
                  <p className="mt-1 text-sm font-light leading-relaxed text-neutral-400">{step.d}</p>
                </div>
                <div className="md:col-span-3 md:text-right">
                  <span className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-3 py-1 font-mono text-xs text-lime-400">
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
          13. APPLICATIONS — light grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
          <Image
            src="/images/real/agri-precision.jpg"
            alt={t('applications.title')}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 to-neutral-950/30" />
          <div className="relative z-10 flex h-full items-center px-6 md:px-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl">
              <SectionLabel n="14" label={t('applications.label')} dark />
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
              {applicationItems.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-500/10">
                    <Target size={18} className="text-lime-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-neutral-950">{a.t}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">{a.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          14. WHY HARCH — dark cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="15" label={t('whyHarch.label')} dark align="center" />
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
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-lime-500/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950">
                    <Icon size={18} className="text-lime-500" aria-hidden="true" />
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
          15. COMPARISON — light table
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="16" label={t('comparison.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('comparison.title')}
            </h2>
          </div>
          <div className="mt-12 overflow-x-auto rounded-2xl border border-neutral-200">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  {comparisonHeaders.map((h, i) => (
                    <th key={i} className="px-6 py-4 text-left font-mono text-xs font-semibold uppercase tracking-wider text-neutral-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-neutral-100 last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-6 py-4 text-sm ${ci === 0 ? 'font-semibold text-neutral-950' : 'font-light text-neutral-600'}`}>
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
          16. CASE STUDIES — split with image + stats
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:gap-16">
          <div>
            <SectionLabel n="17" label={t('caseStudies.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('caseStudiesExtra.title1')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-lime-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('caseStudiesExtra.body1')}
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="font-mono text-2xl font-bold text-lime-500">{t('caseStudiesExtra.stat1a')}</div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                  {t('caseStudiesExtra.stat1aLabel')}
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="font-mono text-2xl font-bold text-lime-500">{t('caseStudiesExtra.stat1b')}</div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                  {t('caseStudiesExtra.stat1bLabel')}
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="font-mono text-2xl font-bold text-lime-500">{t('caseStudiesExtra.stat1c')}</div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                  {t('caseStudiesExtra.stat1cLabel')}
                </div>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800"
          >
            <Image
              src="/images/blog/precision-agriculture-senegal.jpg"
              alt={t('caseStudiesExtra.title1')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
            <div className="absolute bottom-4 left-4 rounded-md bg-neutral-950/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-lime-400 backdrop-blur">
              Senegal · 1,240 ha
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          17. SECTORS — light grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="18" label={t('sectors.label')} align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('sectors.title')}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
            {sectorItems.map((s, i) => {
              const Icon = SECTOR_ICONS[i] || Wheat;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center transition-colors hover:border-lime-500/40"
                >
                  <Icon size={24} className="text-lime-600" aria-hidden="true" />
                  <span className="mt-3 text-sm font-semibold text-neutral-950">{s}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          18. PRICING — light cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="19" label={t('pricing.label')} align="center" />
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
                    ? 'border-lime-500 bg-white shadow-xl'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-8 rounded-full bg-lime-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {t('pricing.featuredBadge')}
                  </span>
                )}
                <div className="text-sm font-bold uppercase tracking-wider text-lime-600">{p.name}</div>
                <div className="mt-2 text-xs font-light text-neutral-500">{p.tagline}</div>
                <div className="mt-6 font-mono text-4xl font-bold text-neutral-950">{p.price}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-500">{p.size}</div>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm font-light text-neutral-700">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-lime-500" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/quote?vertical=agriculture"
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
          19. INNOVATION — dark image + stats
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
          <Image
            src="/images/sections/comp-agri-green.jpg"
            alt={t('innovation.title')}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 to-neutral-950/40" />
          <div className="relative z-10 flex h-full items-center justify-center px-6">
            <div className="text-center">
              <SectionLabel n="20" label={t('innovation.label')} dark align="center" />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl">
                {t('innovation.title')}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base font-light text-neutral-300 md:text-lg">
                {t('innovation.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          20. GEOGRAPHY — light cities grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <SectionLabel n="21" label={t('geography.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('geography.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-lime-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('geography.subtitle')}
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative mt-8 aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200"
              >
                <Image
                  src="/images/real/agri-greenhouse.jpg"
                  alt={t('geography.title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
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
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-lime-600" aria-hidden="true" />
                      <span className="text-sm font-bold text-neutral-950">{c.name}</span>
                    </div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
                      {c.type}
                    </div>
                    <div className="mt-3 font-mono text-lg font-bold text-lime-600">{c.plants}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          21. TESTIMONIALS — dark
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="22" label={t('testimonials.label')} dark align="center" />
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
                <Quote size={28} className="text-lime-500/60" aria-hidden="true" />
                <p className="mt-4 text-base font-light leading-relaxed text-neutral-300">"{tm.quote}"</p>
                <div className="mt-6 border-t border-neutral-800 pt-4">
                  <div className="text-sm font-bold text-white">{tm.author}</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wider text-lime-500">{tm.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          22. FAQ — light accordion
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <SectionLabel n="23" label={t('faq.label')} align="center" />
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
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500"
                  >
                    <span className="text-base font-semibold text-neutral-950">{f.q}</span>
                    <ChevronDown
                      size={18}
                      className={`flex-shrink-0 text-lime-600 transition-transform ${open ? 'rotate-180' : ''}`}
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
          23. RESOURCES — dark grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="24" label={t('resources.label')} dark align="center" />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('resources.title')}</h2>
            <p className="mt-6 text-base font-light text-neutral-400 md:text-lg">{t('resources.subtitle')}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {resourceItems.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-lime-500/40"
              >
                <div className="flex items-center gap-2">
                  {r.type === 'PDF' ? <FileText size={14} className="text-lime-500" aria-hidden="true" /> : <Download size={14} className="text-lime-500" aria-hidden="true" />}
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-lime-500">{r.type}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{r.t}</h3>
                <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-neutral-400">{r.d}</p>
                <Link
                  href="/quote?vertical=agriculture"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-lime-400 hover:text-lime-300"
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
          24. FINAL CTA — light, emerald + border CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionLabel n="25" label={t('tesla.label')} align="center" />
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl">
            {t('finalCta.title')}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
            {t('finalCta.subtitle')}
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row">
            <Link
              href="/quote?vertical=agriculture"
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
      </section>

      {/* ═══════════════════════════════════════════════════════════
          25. BACK TO HARCH CORP — dark slim footer band
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-neutral-800 bg-neutral-950 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-500" />
            <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">
              {t('hero.badge')}
            </span>
          </div>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:text-lime-400"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            {t('ui.backToCorp')}
          </Link>
        </div>
      </section>

    </div>
  );
}

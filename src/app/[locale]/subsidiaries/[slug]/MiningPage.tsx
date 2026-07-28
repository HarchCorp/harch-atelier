'use client';

/* ═══════════════════════════════════════════════════════════════════════
   HARCH MINING — Tesla-level subsidiary page · v6
   ═══════════════════════════════════════════════════════════════════════
   Design System v2 compliant:
   • Accent:           orange-500 (labels, stats, icons, accent bars only)
   • Backgrounds:      neutral-950 / white / neutral-50 / neutral-900 only
   • Fonts:            Inter (sans) + Space Mono (mono)
   • Primary CTA:      emerald-500 (Harch brand green — never changes)
   • Hero H1:          text-4xl sm:text-6xl lg:text-7xl
   • Section H2:       text-2xl md:text-4xl
   • Unique detail:    TOPOGRAPHIC CONTOUR LINES (Mining subsidiary signature)
   • NO wave dividers  (Water-only motif)
   • Tesla interaction: 3 buttons (Extraction / Processing / Compliance)
     that swap a large dashboard view
   • i18n namespace:   miningTesla
   • 16 sections · 16 distinct mining photo paths · zero AI images
   ═══════════════════════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  ShieldCheck,
  HardHat,
  Mountain,
  Atom,
  Factory,
  Leaf,
  Battery,
  Wind,
  Wheat,
  Truck,
  Beaker,
  ChevronDown,
  FileText,
  Download,
  MapPin,
  Scale,
  Recycle,
  Microscope,
  CircleDollarSign,
  Building2,
  Activity,
  Pickaxe,
  Radio,
  Gauge,
  Droplets,
  TrendingUp,
  Navigation,
  HandCoins,
  Globe2,
  MountainSnow,
  Layers,
  Satellite,
  Clock,
  CheckCircle2,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   MODULE-SCOPED CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Icon pools — Lucide components used in cards/feature grids ─────── */
const EQUIP_ICONS = [Mountain, Truck, HardHat];
const PROCESS_FLOW_ICONS = [Pickaxe, Factory, Beaker, Atom, Layers, Satellite];
const IRMA_ICONS = [Leaf, HardHat, Scale, FileText];
const TRANSITION_ICONS: Record<string, any> = {
  Wheat,
  Battery,
  Wind,
};
const INNO_ICONS = [Leaf, Recycle, Microscope, Atom];
const WHY_ICONS = [Scale, ShieldCheck, CircleDollarSign, Building2];

/* ── Stratigraphy tints for the ore-body visualization (illustrative
   fills inside one card only — NOT section backgrounds) ────────────── */
const LAYER_COLORS = [
  'bg-amber-100 border-amber-200',
  'bg-orange-100 border-orange-200',
  'bg-orange-200 border-orange-300',
  'bg-neutral-300 border-neutral-400',
  'bg-amber-200 border-amber-300',
  'bg-neutral-200 border-neutral-300',
];

/* ═══════════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Premium easing — tesla.com-style spring-out cubic-bezier.
   Used for Tesla tab transitions, card lifts, and AnimatePresence. */
const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

/* ── Topographic contour overlay — Mining subsidiary signature detail.
   SVG pattern of curved contour lines drawn in orange-500 at low opacity.
   Used inside hero and the Tesla-interaction panel — never as a wave divider. */
function TopoOverlay({ opacity = 0.1, color = '#f97316' }: { opacity?: number; color?: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="topo-contour" width="240" height="240" patternUnits="userSpaceOnUse">
          <path
            d="M0 60 C 60 30, 180 30, 240 60 M0 110 C 60 80, 180 80, 240 110 M0 160 C 60 130, 180 130, 240 160 M0 210 C 60 180, 180 180, 240 210"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#topo-contour)" />
    </svg>
  );
}

/* ── Section label — Harch brand pattern, orange-500 accent ───────── */
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
      className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] ${
        center ? 'justify-center' : ''
      }`}
    >
      {n && <span className={dark ? 'text-neutral-600' : 'text-neutral-400'}>{`// ${n}`}</span>}
      <span className="h-px w-8 bg-orange-500/60" />
      <span className="text-orange-500">{label}</span>
    </div>
  );
}

/* ── Browser-chrome wrapper for the Tesla-interaction dashboards ──── */
function BrowserChrome({
  url,
  pill,
  children,
}: {
  url: string;
  pill: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-950/60 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
        </div>
        <div className="ml-4 flex-1 truncate rounded-md bg-neutral-950/60 px-3 py-1 font-mono text-xs text-neutral-400">
          {url}
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-orange-400">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
          </span>
          {pill}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Live clock — ticking UTC time in the dashboard header ────────── */
function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // First tick happens immediately, subsequent ticks every second.
    // setState lives inside the interval callback (not synchronously in
    // the effect body) to satisfy react-hooks/set-state-in-effect.
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <span className="font-mono text-xs text-neutral-500">--:--:-- UTC</span>;
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');
  return (
    <span className="font-mono text-xs text-neutral-400">
      {hh}:{mm}:{ss} <span className="text-neutral-600">UTC</span>
    </span>
  );
}

/* ── Reveal — single-line wrapper for the ubiquitous motion.div
   "fade-in-on-scroll" pattern used across all sections. Collapses
   5 lines of motion boilerplate into 1 component call. ──────────── */
function Reveal({
  children,
  className,
  x = 0,
  y = 20,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  x?: number;
  y?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Mini sparkline bar chart for the dashboard views ─────────────── */
function Sparkline({ bars, accent = 'bg-orange-500' }: { bars: number[]; accent?: string }) {
  return (
    <div className="flex h-24 items-end gap-1" aria-hidden="true">
      {bars.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${v}%` }}
          transition={{ delay: i * 0.04, duration: 0.4, ease: 'easeOut' }}
          className={`flex-1 rounded-sm ${accent} opacity-80`}
          style={{ minHeight: '4px' }}
        />
      ))}
    </div>
  );
}

/* ── Ore accent — decorative mark, top-right of light sections ────── */
function OreAccent() {
  return (
    <svg
      className="pointer-events-none absolute right-6 top-6 h-12 w-12 text-orange-500/10"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2L2 8.5 12 22 22 8.5 12 2zm0 3.5l6.5 4.5L12 17 5.5 10 12 5.5z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TESLA INTERACTION — 3 dashboard views that swap on tab click
   ═══════════════════════════════════════════════════════════════════════ */

/* ── DashboardView — parameterized view for the Tesla interaction.
   One component renders all three tabs (Extraction / Processing / Compliance)
   with tab-specific accent colour, side-panel content, and i18n source. ─ */
function DashboardView({ t, tab }: { t: any; tab: 'extraction' | 'processing' | 'compliance' }) {
  const data = t.raw(`teslaInteraction.${tab}`) as any;
  const metrics = data.metrics as any[];
  const bars = data.bars as number[];
  const standards = (data.standards || []) as string[];
  const status = t.raw('teslaInteraction.status') as any;
  const isCompliance = tab === 'compliance';
  const accentText = isCompliance ? 'text-emerald-400' : 'text-orange-400';
  const accentBorder = isCompliance
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
    : 'border-orange-500/30 bg-orange-500/10 text-orange-400';
  const accentDot = isCompliance ? 'bg-emerald-500' : 'bg-orange-500';
  const accentBar = isCompliance ? 'bg-emerald-500' : 'bg-orange-500';
  const sideLabel = tab === 'extraction' ? status.site : status.shift;
  return (
    <div className="relative aspect-[16/10] bg-neutral-950 p-5 md:p-7">
      <TopoOverlay opacity={0.04} />
      <div className="relative flex h-full flex-col gap-5">
        {/* Header row */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-500">
              {data.panelTitle}
            </div>
            <div className="mt-1 text-lg font-bold text-white md:text-xl">{data.title}</div>
            <div className="mt-1 text-xs font-light text-neutral-500">{data.subtitle}</div>
          </div>
          <div className="text-right">
            <LiveClock />
            <div
              className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${accentBorder}`}
            >
              {isCompliance ? (
                <CheckCircle2 size={10} aria-hidden="true" />
              ) : (
                <span className={`h-1.5 w-1.5 rounded-full ${accentDot}`} />
              )}
              {status.live}
            </div>
          </div>
        </div>

        {/* Metrics row — 4 tiles */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((m: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2"
            >
              <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                {m.label}
              </div>
              <div className={`mt-1 font-mono text-2xl font-bold ${accentText}`}>{m.value}</div>
              <div className="mt-0.5 font-mono text-[9px] text-neutral-400">{m.trend}</div>
            </motion.div>
          ))}
        </div>

        {/* Chart + side panel */}
        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 md:col-span-2">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {data.barsLabel}
            </div>
            <Sparkline bars={bars} accent={accentBar} />
          </div>
          <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div>
              {isCompliance && (
                <>
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {data.auditBody}
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {standards.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-sm border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-orange-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {!isCompliance && (
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  {sideLabel}
                </div>
              )}
              <p className="mt-1 text-xs font-light leading-relaxed text-neutral-300">
                {data.notes}
              </p>
            </div>
            <div className="mt-3 border-t border-neutral-800 pt-3 font-mono text-[9px] uppercase tracking-wider text-neutral-600">
              {data.panelFoot}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function MiningPage() {
  const t = useTranslations('miningTesla');

  /* ── Tesla interaction state ─────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<'extraction' | 'processing' | 'compliance'>(
    'extraction',
  );

  /* ── FAQ accordion state ─────────────────────────────────────────── */
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* ── Savings calculator state ────────────────────────────────────── */
  const [volume, setVolume] = useState(50000);
  const monthlyAdd = Math.round((volume * 1800 * 0.4) / 12);
  const yearlyAdd = monthlyAdd * 12;
  const tenYrAdd = Math.round((yearlyAdd * 10) / 1_000_000);

  /* ── Typed i18n arrays (use `any` for complex types per task spec) ─ */
  const heroStats = t.raw('hero.stats') as any[];
  const overviewBody = t('overview.body');
  const extractionEquipment = t.raw('extraction.equipment') as any[];
  const processingFlow = t.raw('processing.flow') as any[];
  const oreLayers = t.raw('oreBody.layers') as any[];
  const tailingsFeatures = t.raw('tailings.features') as string[];
  const tailingsStats = t.raw('tailings.stats') as any[];
  const irmaItems = t.raw('irmaCert.items') as any[];
  const irmaStats = t.raw('irmaCert.stats') as any[];
  const inCountryRows = t.raw('inCountry.comparison') as any[];
  const offtakePartners = t.raw('offtakePartners.partners') as any[];
  const transitionItems = t.raw('mineralsTransition.items') as any[];
  const whyItems = t.raw('whyHarch.items') as any[];
  const comparisonHeaders = t.raw('comparison.headers') as string[];
  const comparisonRows = t.raw('comparison.rows') as string[][];
  const pricingPlans = t.raw('pricing.plans') as any[];
  const innoItems = t.raw('innovation.items') as any[];
  const geoCities = t.raw('geography.cities') as any[];
  const testimonials = t.raw('testimonials.items') as any[];
  const faqItems = t.raw('faq.items') as any[];
  const resourceItems = t.raw('resources.items') as any[];
  const certBannerStats = t.raw('certBanner.stats') as any[];
  const teslaButtons = t.raw('teslaInteraction.buttons') as any;
  const teslaStatus = t.raw('teslaInteraction.status') as any;

  return (
    <div className="bg-white font-sans text-neutral-950 antialiased selection:bg-emerald-500 selection:text-white">
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO — Full-bleed open-pit, HARCH · MINING badge
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-neutral-950">
        <Image src="/images/sections/comp-mining-excavator.jpg" alt={t('hero.heroImageAlt')} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/55 to-neutral-950/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/60 to-transparent" />
        <TopoOverlay opacity={0.12} />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-16 md:px-12 md:py-24">
          {/* Top row — badge + back link */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-5 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-neutral-200">
                {t('ui.harchMiningBadge')}
              </span>
              <span className="h-3 w-px bg-neutral-700" />
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-400">
                {t('hero.subtitle')}
              </span>
            </div>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-300 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              <ArrowLeft
                size={12}
                className="transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
              {t('ui.backToHarchCorp')}
            </Link>
          </motion.div>

          {/* Center — headline */}
          <div className="flex flex-1 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-5xl text-center md:mx-0 md:text-left"
            >
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-orange-500 md:text-sm">
                {t('overview.label')} · {t('hero.title')}
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                {t('hero.title')}
              </h1>
              <div className="mt-6 h-0.5 w-24 origin-left bg-orange-500 md:mx-0 mx-auto" />
              <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-300 md:mx-0 md:text-xl">
                {t('hero.body')}
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
              {heroStats.map((s: any, i: number) => (
                <div key={i} className="border-l-2 border-orange-500/50 pl-5 text-left">
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
                href="/quote?vertical=mining"
                aria-label={`${t('hero.primaryCta')} — Harch Mining`}
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('hero.primaryCta')}
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
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

      {/* ═══════════════════════════════════════════════════════════════
          2. TRUST BAR — certifications marquee
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-neutral-800 bg-neutral-950 py-5" aria-label={t('certBanner.label')}>
        <div className="flex items-center gap-8 overflow-hidden whitespace-nowrap px-6">
          <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-orange-500">
            <ShieldCheck size={14} aria-hidden="true" />
            {t('certBanner.label')}
          </div>
          {(
            [
              t('ui.certs.irmaCertified'),
              t('ui.certs.gistmConforming'),
              t('ui.certs.rmiTraceable'),
              t('ui.certs.inCountry100'),
              'ISO 14001',
              'ISO 45001',
              'JORC 2012',
              t('ui.harchCorpBacking'),
            ] as string[]
          )
            .concat([
              t('ui.certs.irmaCertified'),
              t('ui.certs.gistmConforming'),
              t('ui.certs.rmiTraceable'),
            ])
            .map((item, i) => (
              <span
                key={i}
                className="flex shrink-0 items-center gap-3 font-mono text-xs uppercase tracking-wider text-neutral-400 transition-colors hover:text-white"
              >
                <span aria-hidden="true" className="h-1 w-1 bg-orange-500" />
                {item}
              </span>
            ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. OVERVIEW — capturing value chain + image
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32" aria-labelledby="mining-overview-title">
        <OreAccent />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-12 md:gap-16">
          <Reveal x={-20} className="md:col-span-5">
            <SectionLabel n="01" label={t('overview.label')} />
            <h2
              id="mining-overview-title"
              className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
            >
              {t('overview.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-orange-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {overviewBody}
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-neutral-600">
              <Building2 size={12} className="text-orange-500" aria-hidden="true" />
              {t('ui.subsidiaryOf')}
            </div>
          </Reveal>
          <Reveal x={20} className="md:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200">
              <Image src="/images/sections/mining-open-pit.jpg" alt={t('overview.title')} fill className="object-cover" sizes="(max-width: 768px) 100vw, 60vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-lg border border-neutral-700/60 bg-neutral-950/80 px-3 py-2 backdrop-blur-md">
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  {t('hero.subtitle')}
                </div>
                <div className="font-mono text-xs font-bold text-orange-500">
                  {t('ui.dashboardUrl')}
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200">
              {[
                { num: '30%', label: t('ui.statLabels.africaGlobalReserves') },
                { num: '5%', label: t('ui.statLabels.currentValueCaptured') },
                { num: '100%', label: t('ui.statLabels.harchInCountryProcessing') },
              ].map((s, i) => (
                <div key={i} className="bg-white p-4 text-center">
                  <div className="font-mono text-2xl font-bold text-orange-500 md:text-3xl">
                    {s.num}
                  </div>
                  <div className="mt-1 text-[10px] font-light uppercase tracking-wider text-neutral-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. TESLA INTERACTION — Live Mine Telemetry · 3 dashboards
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-32" aria-labelledby="mining-tesla-title">
        <TopoOverlay opacity={0.05} />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal className="mb-10 max-w-3xl">
            <SectionLabel n={t('teslaInteraction.sectionNumber')} label={t('teslaInteraction.label')} dark />
            <h2
              id="mining-tesla-title"
              className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl"
            >
              {t('teslaInteraction.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-orange-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('teslaInteraction.subtitle')}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-neutral-500">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1">
                <Radio size={10} className="text-orange-500" aria-hidden="true" />
                {teslaStatus.site}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1">
                <Clock size={10} className="text-orange-500" aria-hidden="true" />
                {teslaStatus.updated}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1">
                <HardHat size={10} className="text-orange-500" aria-hidden="true" />
                {teslaStatus.shift}
              </span>
            </div>
          </Reveal>

          {/* Large dashboard that swaps on tab click */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <BrowserChrome url={t('ui.dashboardUrl')} pill={t('ui.liveStatus')}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.38, ease: EASE_PREMIUM }}
                >
                  <DashboardView t={t} tab={activeTab} />
                </motion.div>
              </AnimatePresence>
            </BrowserChrome>
          </motion.div>

          {/* 3 buttons that switch the dashboard view */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(['extraction', 'processing', 'compliance'] as const).map((tab, idx) => {
              const isActive = activeTab === tab;
              const Icon =
                tab === 'extraction'
                  ? Pickaxe
                  : tab === 'processing'
                    ? Factory
                    : ShieldCheck;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={isActive}
                  aria-label={teslaButtons[tab]}
                  className={`group relative flex items-center justify-center gap-2 overflow-hidden border px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-[transform,box-shadow,border-color,background-color,color] duration-200 active:scale-[0.98] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                    isActive
                      ? 'border-orange-500 bg-orange-500 text-neutral-950 shadow-lg shadow-orange-500/20'
                      : 'border border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-orange-500/40 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  {/* Sliding top accent — premium tesla.com detail */}
                  {isActive && (
                    <motion.span
                      layoutId="teslaTabAccent-mining"
                      className="absolute inset-x-0 top-0 h-0.5 bg-orange-500"
                      transition={{ duration: 0.32, ease: EASE_PREMIUM }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon size={14} aria-hidden="true" />
                  <span className="font-mono text-[10px] opacity-60">{`0${idx + 1} / 03`}</span>
                  {teslaButtons[tab]}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-wider text-neutral-600">
            {t('teslaInteraction.label')} · {t('ui.scadaFooter')}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. ORE BODY — geological cross-section
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32" aria-labelledby="mining-orebody-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <SectionLabel n="02" label={t('oreBody.label')} />
              <h2
                id="mining-orebody-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('oreBody.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-orange-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('oreBody.body')}
              </p>
              <div className="mt-8 relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200">
                <Image src="/images/sections/mining-phosphate.jpg" alt={t('oreBody.title')} fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 to-transparent" />
                <div className="absolute bottom-3 left-3 rounded-md border border-neutral-700/60 bg-neutral-950/80 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-orange-500 backdrop-blur-md">
                  {t('oreBody.caption')}
                </div>
              </div>
            </Reveal>

            <Reveal x={20} className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
                <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  <span>{t('ui.surfaceLabel')}</span>
                  <span>{t('ui.routingLabel')}</span>
                </div>
                <ul className="space-y-2">
                  {oreLayers.map((layer: any, i: number) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className={`group flex items-center gap-4 rounded-xl border p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md ${LAYER_COLORS[i % LAYER_COLORS.length]}`}
                    >
                      <div className="w-16 shrink-0 font-mono text-[11px] font-bold text-neutral-700">
                        {layer.depth}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-neutral-950">{layer.name}</div>
                        <div className="mt-0.5 text-xs font-light text-neutral-600">
                          {layer.note}
                        </div>
                      </div>
                      {layer.grade !== '—' ? (
                        <span className="shrink-0 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-orange-500">
                          {layer.grade}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-neutral-300 bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                          waste
                        </span>
                      )}
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  <span>{t('ui.bedrockLabel')}</span>
                  <span className="text-orange-500">JORC 2012 · signed QP</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. EXTRACTION — equipment + XRF telemetry
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="mining-extraction-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal x={-20} className="lg:col-span-5">
              <SectionLabel n="03" label={t('extraction.label')} />
              <h2
                id="mining-extraction-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('extraction.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-orange-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('extraction.body')}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/5 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-orange-500">
                <Activity size={12} aria-hidden="true" />
                {t('extraction.stat')}
              </div>
              <div className="mt-8 relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200">
                <Image src="/images/sections/comp-mining-heavy.jpg" alt={t('extraction.title')} fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
              </div>
            </Reveal>

            <Reveal x={20} className="lg:col-span-7">
              <div className="grid grid-cols-1 gap-4">
                {extractionEquipment.map((eq: any, i: number) => {
                  const Icon = EQUIP_ICONS[i % EQUIP_ICONS.length];
                  return (
                    <div
                      key={i}
                      className="group flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-6 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 transition-colors group-hover:bg-orange-500">
                        <Icon
                          size={22}
                          className="text-orange-500 transition-colors group-hover:text-neutral-950"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold tracking-tight text-neutral-950">
                          {eq.t}
                        </h3>
                        <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">
                          {eq.d}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                        0{i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* XRF readout panel */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge size={14} className="text-orange-500" aria-hidden="true" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500">
                      {t('xrfReadout.label')}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {t('xrfReadout.stat')}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {t.raw('xrfReadout.trucks').map((truck: any, i: number) => {
                    const tone =
                      truck.status === 'HIGH'
                        ? 'text-emerald-400'
                        : truck.status === 'LOW'
                          ? 'text-amber-400'
                          : 'text-neutral-500';
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2"
                      >
                        <span className="font-mono text-[10px] font-bold text-neutral-400">
                          {truck.id}
                        </span>
                        <span className={`font-mono text-xs font-bold ${tone}`}>{truck.grade}</span>
                        <span className="flex-1 text-right font-mono text-[10px] text-neutral-500">
                          {truck.dest}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-600">{truck.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. PROCESSING — flowsheet
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 md:py-32" aria-labelledby="mining-processing-title">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 max-w-3xl">
            <SectionLabel n="04" label={t('processing.label')} dark />
            <h2
              id="mining-processing-title"
              className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl"
            >
              {t('processing.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-orange-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('processing.body')}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Reveal x={-20} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800">
              <Image src="/images/sections/mining-processing.jpg" alt={t('processing.title')} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  {t('ui.flowsheetLabel')}
                </div>
                <div className="font-mono text-[10px] font-bold text-orange-500">
                  {t('ui.piServerLabel')}
                </div>
              </div>
            </Reveal>

            <Reveal x={20} className="flex flex-col justify-center">
              <ol className="space-y-3">
                {processingFlow.map((step: any, i: number) => {
                  const Icon = PROCESS_FLOW_ICONS[i % PROCESS_FLOW_ICONS.length];
                  return (
                    <li
                      key={i}
                      className="group flex items-start gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md hover:shadow-orange-500/5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20 transition-colors group-hover:bg-orange-500">
                        <Icon
                          size={18}
                          className="text-orange-500 transition-colors group-hover:text-neutral-950"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-[10px] font-bold text-orange-500">
                            {step.n}
                          </span>
                          <h3 className="text-sm font-bold tracking-tight text-white">{step.t}</h3>
                        </div>
                        <p className="mt-1 text-xs font-light leading-relaxed text-neutral-400">
                          {step.d}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          8. TAILINGS — GISTM standard
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="mining-tailings-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <SectionLabel n="05" label={t('tailings.label')} />
              <h2
                id="mining-tailings-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('tailings.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-orange-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('tailings.body')}
              </p>

              <div className="mt-8 relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200">
                <Image src="/images/sections/mining-smelter.jpg" alt={t('tailings.title')} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200">
                {tailingsStats.map((s: any, i: number) => (
                  <div key={i} className="bg-white p-4 text-center">
                    <div className="font-mono text-xl font-bold text-orange-500 md:text-2xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-[9px] font-light uppercase tracking-wider text-neutral-500">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal x={20} className="lg:col-span-7">
              {/* Dam cross-section visualization */}
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">
                <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  <span>{t('ui.tailings.damCrest')}</span>
                  <span>{t('ui.tailings.downstreamToe')}</span>
                </div>
                <svg viewBox="0 0 600 220" className="w-full" aria-hidden="true">
                  {/* Topo contour lines inside dam */}
                  <defs>
                    <pattern id="dam-topo" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M0 20 C 10 10, 30 10, 40 20 M0 30 C 10 20, 30 20, 40 30" fill="none" stroke="#f97316" strokeWidth="0.5" opacity="0.4" />
                    </pattern>
                  </defs>
                  {/* Dam body — downstream construction */}
                  <polygon points="100,30 220,30 540,210 100,210" fill="url(#dam-topo)" stroke="#f97316" strokeWidth="1.5" />
                  {/* Tailings pond water line */}
                  <line x1="100" y1="80" x2="220" y2="80" stroke="#525252" strokeWidth="2" strokeDasharray="4 2" />
                  {/* Foundation */}
                  <line x1="0" y1="210" x2="600" y2="210" stroke="#404040" strokeWidth="2" />
                  {/* Threshold marker */}
                  <line x1="380" y1="30" x2="380" y2="210" stroke="#10b981" strokeWidth="1" strokeDasharray="2 4" />
                  <text x="384" y="50" fill="#10b981" fontSize="10" fontFamily="monospace">
                    {t('ui.tailings.threshold')}
                  </text>
                  {/* Current level marker */}
                  <circle cx="320" cy="120" r="4" fill="#f97316" />
                  <text x="328" y="124" fill="#f97316" fontSize="10" fontFamily="monospace">
                    {t('ui.tailings.current')}
                  </text>
                </svg>
                <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  <span>{t('ui.uplink')}</span>
                  <span className="text-orange-500">{t('ui.lastAudit')}</span>
                </div>
              </div>

              <ul className="mt-6 space-y-2">
                {tailingsFeatures.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-orange-500"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-light text-neutral-700">{f}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          9. IRMA CERT — independently audited
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32" aria-labelledby="mining-irma-title">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 max-w-3xl">
            <SectionLabel n="06" label={t('irmaCert.label')} />
            <h2
              id="mining-irma-title"
              className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
            >
              {t('irmaCert.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-orange-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('irmaCert.body')}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {irmaItems.map((item: any, i: number) => {
                  const Icon = IRMA_ICONS[i % IRMA_ICONS.length];
                  return (
                    <div
                      key={i}
                      className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20 transition-colors group-hover:bg-orange-500">
                        <Icon
                          size={18}
                          className="text-orange-500 transition-colors group-hover:text-neutral-950"
                          strokeWidth={1.5}
                        />
                      </div>
                      <h3 className="text-base font-bold tracking-tight text-neutral-950">
                        {item.t}
                      </h3>
                      <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">
                        {item.d}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal x={20} className="lg:col-span-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200">
                <Image src="/images/sections/mining-lab.jpg" alt={t('irmaCert.title')} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-lg border border-neutral-700/60 bg-neutral-950/80 px-3 py-2 backdrop-blur-md">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    {t('irmaCert.label')}
                  </div>
                  <div className="font-mono text-xs font-bold text-orange-500">
                    {t('certBanner.badge')}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200">
                {irmaStats.map((s: any, i: number) => (
                  <div key={i} className="bg-white p-4 text-center">
                    <div className="font-mono text-xl font-bold text-orange-500 md:text-2xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-[9px] font-light uppercase tracking-wider text-neutral-500">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          10. IN-COUNTRY PROCESSING — 100% on African soil
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 md:py-32" aria-labelledby="mining-incountry-title">
        <TopoOverlay opacity={0.04} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <SectionLabel n="07" label={t('inCountry.label')} dark />
              <h2
                id="mining-incountry-title"
                className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl"
              >
                {t('inCountry.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-orange-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('inCountry.body')}
              </p>
              <div className="mt-8 relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800">
                <Image src="/images/sections/comp-mining-site.jpg" alt={t('inCountry.title')} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
              </div>
            </Reveal>

            <Reveal x={20} className="lg:col-span-7">
              <p className="mb-6 font-mono text-xs uppercase tracking-wider text-neutral-500">
                {t('inCountry.subtitle')}
              </p>
              <div className="overflow-hidden rounded-2xl border border-neutral-800">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-900">
                      <th className="px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                        {comparisonHeaders[0]}
                      </th>
                      <th className="px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-orange-500">
                        {t('inCountry.localLabel')}
                      </th>
                      <th className="px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                        {t('inCountry.exportLabel')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inCountryRows.map((row: any, i: number) => (
                      <tr
                        key={i}
                        className="border-b border-neutral-800/60 last:border-0 transition-colors hover:bg-neutral-900/60"
                      >
                        <td className="px-5 py-4 text-sm font-light text-neutral-300">
                          {row.metric}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-white">{row.local}</td>
                        <td className="px-5 py-4 text-sm font-light text-neutral-500">
                          {row.export}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          11. OFFTAKE PARTNERS — pre-sold to industrial buyers
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="mining-offtake-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <SectionLabel n="08" label={t('offtakePartners.label')} />
              <h2
                id="mining-offtake-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('offtakePartners.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-orange-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('offtakePartners.body')}
              </p>
              <div className="mt-8 relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200">
                <Image src="/images/real/mining-phosphate-new.jpg" alt={t('offtakePartners.title')} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 to-transparent" />
              </div>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                {t('offtakePartners.footnote')}
              </p>
            </Reveal>

            <Reveal x={20} className="lg:col-span-7">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {offtakePartners.map((p: any, i: number) => (
                  <div
                    key={i}
                    className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold tracking-tight text-neutral-950">
                          {p.name}
                        </h3>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                          0{i + 1}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-light text-neutral-500">{p.mineral}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-orange-500">
                      <HandCoins size={11} aria-hidden="true" />
                      {p.contract}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          12. MINERALS FOR ENERGY TRANSITION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 md:py-32" aria-labelledby="mining-transition-title">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 max-w-3xl">
            <SectionLabel n="09" label={t('mineralsTransition.label')} dark />
            <h2
              id="mining-transition-title"
              className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl"
            >
              {t('mineralsTransition.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-orange-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('mineralsTransition.body')}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <Reveal x={-20} className="lg:col-span-7">
              <div className="space-y-4">
                {transitionItems.map((item: any, i: number) => {
                  const Icon = TRANSITION_ICONS[item.icon] || Atom;
                  return (
                    <div
                      key={i}
                      className="group flex items-start gap-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md hover:shadow-orange-500/5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 transition-colors group-hover:bg-orange-500">
                        <Icon
                          size={22}
                          className="text-orange-500 transition-colors group-hover:text-neutral-950"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold tracking-tight text-white">{item.t}</h3>
                        <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">
                          {item.d}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal x={20} className="lg:col-span-5">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-neutral-800">
                <Image src="/images/blog/african-mineral-processing.jpg" alt={t('mineralsTransition.title')} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-orange-500">
                    {t('mineralsTransition.label')}
                  </div>
                  <div className="mt-1 text-xl font-bold tracking-tight text-white">
                    {t('mineralsTransition.title')}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          13. PROCESS STEPS — from exploration to offtake
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="mining-process-title">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <SectionLabel n="10" label={t('process.label')} />
              <h2
                id="mining-process-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('process.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-orange-500" />
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-neutral-200">
              <Image src="/images/real/mining-excavator.jpg" alt={t('process.title')} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/40 to-transparent" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-5">
            {t.raw('process.steps').map((step: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white p-6 transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-bold text-orange-500/30 transition-colors group-hover:text-orange-500">
                    {step.n}
                  </span>
                  <Navigation
                    size={16}
                    className="text-neutral-300 transition-colors group-hover:text-orange-500"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-4 text-base font-bold tracking-tight text-neutral-950">
                  {step.t}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">
                  {step.d}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  <Clock size={10} aria-hidden="true" />
                  {step.time}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          14. INNOVATION — beyond conventional mining
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32" aria-labelledby="mining-innovation-title">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 max-w-3xl">
            <SectionLabel n="11" label={t('innovation.label')} />
            <h2
              id="mining-innovation-title"
              className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
            >
              {t('innovation.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-orange-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('innovation.subtitle')}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <Reveal x={-20} className="lg:col-span-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200">
                <Image src="/images/blog/rare-earth-processing-africa.jpg" alt={t('innovation.title')} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-lg border border-neutral-700/60 bg-neutral-950/80 px-3 py-2 backdrop-blur-md">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-orange-500">
                    {t('innovation.label')}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal x={20} className="lg:col-span-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {innoItems.map((item: any, i: number) => {
                  const Icon = INNO_ICONS[i % INNO_ICONS.length];
                  return (
                    <div
                      key={i}
                      className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20 transition-colors group-hover:bg-orange-500">
                        <Icon
                          size={18}
                          className="text-orange-500 transition-colors group-hover:text-neutral-950"
                          strokeWidth={1.5}
                        />
                      </div>
                      <h3 className="text-base font-bold tracking-tight text-neutral-950">
                        {item.t}
                      </h3>
                      <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">
                        {item.d}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          15. GEOGRAPHY — operations across Africa
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 md:py-32" aria-labelledby="mining-geography-title">
        <TopoOverlay opacity={0.04} />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 max-w-3xl">
            <SectionLabel n="12" label={t('geography.label')} dark />
            <h2
              id="mining-geography-title"
              className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl"
            >
              {t('geography.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-orange-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('geography.subtitle')}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <Reveal x={-20} className="lg:col-span-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800">
                <Image src="/images/real/mining-open-pit.jpg" alt={t('geography.title')} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-lg border border-neutral-700/60 bg-neutral-950/80 px-3 py-2 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-orange-500">
                    <Globe2 size={11} aria-hidden="true" />
                    9 concessions · 3 countries
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal x={20} className="lg:col-span-7">
              <div className="max-h-[480px] overflow-y-auto pr-2">
                <ul className="space-y-2">
                  {geoCities.map((c: any, i: number) => (
                    <li
                      key={i}
                      className="group flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md hover:shadow-orange-500/5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20 transition-colors group-hover:bg-orange-500">
                        <MapPin
                          size={16}
                          className="text-orange-500 transition-colors group-hover:text-neutral-950"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-sm font-bold tracking-tight text-white">{c.name}</h3>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                            {c.type}
                          </span>
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-orange-500">
                          {c.plants}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          16. COMPARISON TABLE — Harch Mining vs Raw ore export
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="mining-comparison-title">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mb-10 max-w-3xl">
            <SectionLabel n="13" label={t('comparison.label')} />
            <h2
              id="mining-comparison-title"
              className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
            >
              {t('comparison.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-orange-500" />
          </Reveal>

          <Reveal y={30} className="overflow-hidden rounded-2xl border border-neutral-200">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  {comparisonHeaders.map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                        i === 1 ? 'text-orange-500' : 'text-neutral-500'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-neutral-200 last:border-0 transition-colors hover:bg-neutral-50"
                  >
                    <td className="px-5 py-4 text-sm font-bold text-neutral-950">{row[0]}</td>
                    <td className="px-5 py-4 text-sm font-light text-neutral-700">
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2
                          size={14}
                          className="text-orange-500"
                          aria-hidden="true"
                        />
                        {row[1]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-light text-neutral-400">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          17. WHY HARCH + CALCULATOR (combined)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32" aria-labelledby="mining-why-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Why Harch */}
            <Reveal className="lg:col-span-7">
              <SectionLabel n="14" label={t('whyHarch.label')} />
              <h2
                id="mining-why-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('whyHarch.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-orange-500" />
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {whyItems.map((item: any, i: number) => {
                  const Icon = WHY_ICONS[i % WHY_ICONS.length];
                  return (
                    <div
                      key={i}
                      className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20 transition-colors group-hover:bg-orange-500">
                        <Icon
                          size={18}
                          className="text-orange-500 transition-colors group-hover:text-neutral-950"
                          strokeWidth={1.5}
                        />
                      </div>
                      <h3 className="text-base font-bold tracking-tight text-neutral-950">
                        {item.t}
                      </h3>
                      <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">
                        {item.d}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            {/* Calculator */}
            <Reveal x={20} className="lg:col-span-5">
              <SectionLabel n="15" label={t('calculator.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('calculator.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-orange-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500">
                {t('calculator.subtitle')}
              </p>

              <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
                <label className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                  {t('calculator.billLabel')}
                </label>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold text-orange-500">
                    {volume.toLocaleString()}
                  </span>
                  <span className="font-mono text-sm text-neutral-400">t / yr</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={500000}
                  step={5000}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label={t('calculator.billLabel')}
                  className="mt-4 w-full accent-orange-500"
                />
                <div className="mt-1 flex justify-between font-mono text-[10px] text-neutral-400">
                  <span>5,000 t</span>
                  <span>500,000 t</span>
                </div>

                <div className="mt-6 space-y-2 border-t border-neutral-200 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                      {t('calculator.monthlyLabel')}
                    </span>
                    <span className="font-mono text-sm font-bold text-neutral-950">
                      {monthlyAdd.toLocaleString()} MAD
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                      {t('calculator.yearlyLabel')}
                    </span>
                    <span className="font-mono text-sm font-bold text-neutral-950">
                      {yearlyAdd.toLocaleString()} MAD
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500">
                      {t('calculator.save25Label')}
                    </span>
                    <span className="font-mono text-base font-bold text-orange-500">
                      {tenYrAdd.toLocaleString()}M MAD
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-xs font-light text-neutral-400">
                  {t('calculator.disclaimer')}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          18. PRICING PLANS — 3 partnership models
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="mining-pricing-title">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 max-w-3xl">
            <SectionLabel n="16" label={t('pricing.label')} />
            <h2
              id="mining-pricing-title"
              className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
            >
              {t('pricing.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-orange-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('pricing.subtitle')}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative flex flex-col rounded-2xl border p-8 transition-colors ${
                  plan.featured
                    ? 'border-orange-500 bg-neutral-950 text-white'
                    : 'border-neutral-200 bg-white text-neutral-950 hover:border-orange-500/40'
                }`}
              >
                {plan.featured && (
                  <span className="absolute right-6 top-6 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-orange-500">
                    {t('ui.harchCorpBacking')}
                  </span>
                )}
                <div className="font-mono text-[11px] uppercase tracking-wider text-orange-500">
                  {plan.tagline}
                </div>
                <h3 className="mt-2 text-xl font-bold tracking-tight">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold">{plan.price}</span>
                  <span
                    className={`font-mono text-xs ${plan.featured ? 'text-neutral-400' : 'text-neutral-500'}`}
                  >
                    {plan.size}
                  </span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f: string, fi: number) => (
                    <li key={fi} className="flex items-start gap-2 text-sm font-light">
                      <CheckCircle2
                        size={14}
                        className={`mt-1 shrink-0 ${plan.featured ? 'text-orange-500' : 'text-orange-500'}`}
                        aria-hidden="true"
                      />
                      <span className={plan.featured ? 'text-neutral-300' : 'text-neutral-600'}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/quote?vertical=mining"
                  className={`mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                    plan.featured
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                      : 'border border-neutral-300 text-neutral-950 hover:bg-neutral-100'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          19. TESTIMONIALS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-32" aria-labelledby="mining-testimonials-title">
        <Image src="/images/real/mining-smelter.jpg" alt="" fill aria-hidden="true" className="pointer-events-none object-cover opacity-20" sizes="100vw" />
        <div className="absolute inset-0 bg-neutral-950/70" />
        <TopoOverlay opacity={0.05} />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 max-w-3xl">
            <SectionLabel n="17" label={t('testimonials.label')} dark />
            <h2
              id="mining-testimonials-title"
              className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl"
            >
              {t('testimonials.title')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-orange-500" />
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((tm: any, i: number) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 backdrop-blur-md"
              >
                <TrendingUp size={20} className="text-orange-500" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-sm font-light leading-relaxed text-neutral-200">
                  “{tm.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-neutral-800 pt-4">
                  <div className="text-sm font-bold text-white">{tm.author}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-orange-500">
                    {tm.role}
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          20. FAQ + RESOURCES (combined)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="mining-faq-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* FAQ */}
            <Reveal className="lg:col-span-7">
              <SectionLabel n="18" label={t('faq.label')} />
              <h2
                id="mining-faq-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('faq.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-orange-500" />

              <div className="mt-8 space-y-3">
                {faqItems.map((item: any, i: number) => {
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
                        aria-controls={`mining-faq-panel-${i}`}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.99]"
                      >
                        <span className="flex items-baseline gap-3">
                          <span
                            className={`font-mono text-[10px] font-bold transition-colors ${
                              isOpen ? 'text-orange-500' : 'text-neutral-400'
                            }`}
                          >
                            {`0${i + 1}`}
                          </span>
                          <span
                            className={`text-sm font-bold tracking-tight transition-colors ${
                              isOpen ? 'text-orange-600' : 'text-neutral-950'
                            }`}
                          >
                            {item.q}
                          </span>
                        </span>
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-orange-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`mining-faq-panel-${i}`}
                            role="region"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.32, ease: EASE_PREMIUM }}
                            className="overflow-hidden"
                          >
                            <p className="border-t border-neutral-200 px-5 py-4 text-sm font-light leading-relaxed text-neutral-600">
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

            {/* Resources */}
            <Reveal x={20} className="lg:col-span-5">
              <SectionLabel n="19" label={t('resources.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('resources.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-orange-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500">
                {t('resources.subtitle')}
              </p>

              <ul className="mt-8 space-y-3">
                {resourceItems.map((r: any, i: number) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="group flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20 transition-colors group-hover:bg-orange-500">
                        <FileText
                          size={16}
                          className="text-orange-500 transition-colors group-hover:text-neutral-950"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold tracking-tight text-neutral-950">
                          {r.t}
                        </h3>
                        <p className="mt-1 text-xs font-light text-neutral-500">{r.d}</p>
                        <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                          {r.type}
                        </div>
                      </div>
                      <Download
                        size={14}
                        className="mt-1 shrink-0 text-neutral-400 transition-colors group-hover:text-orange-500"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          21. FINAL CTA — HARCH · MINING badge + back link
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 md:py-32" aria-labelledby="mining-final-cta-title">
        <Image src="/images/real/mining-heavy-equipment.jpg" alt="" fill aria-hidden="true" className="pointer-events-none object-cover opacity-25" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/70 to-neutral-950/90" />
        <TopoOverlay opacity={0.07} />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-5 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-neutral-200">
                {t('ui.harchMiningBadge')}
              </span>
            </div>
            <h2
              id="mining-final-cta-title"
              className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              {t('finalCta.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-24 bg-orange-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-300 md:text-lg">
              {t('finalCta.subtitle')}
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row">
              <Link
                href="/quote?vertical=mining"
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('finalCta.primary')}
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <a
                href="tel:+212684440682"
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone size={14} aria-hidden="true" />
                {t('finalCta.secondary')}
              </a>
            </div>
            <div className="mt-12 flex flex-col items-center gap-4 border-t border-neutral-800 pt-8 sm:flex-row sm:justify-between">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                <ArrowLeft
                  size={12}
                  className="transition-transform group-hover:-translate-x-1"
                  aria-hidden="true"
                />
                {t('ui.backToHarchCorp')}
              </Link>
              <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                {t('ui.footerSignature')}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Phone,
  Shield,
  ShieldCheck,
  Lock,
  Satellite,
  SatelliteDish,
  Cpu,
  Globe2,
  Radar,
  Server,
  Activity,
  CheckCircle2,
  ChevronDown,
  Banknote,
  Radio,
  Network,
  Fingerprint,
  KeyRound,
  Bot,
  BrainCircuit,
  Terminal,
  Database,
  Eye,
  Clock,
  Workflow,
  HardHat,
  Settings,
  CircuitBoard,
  Layers,
  Zap,
  FileText,
  Quote,
  Languages,
  Sparkles,
  Droplets,
  Wheat,
  Mountain,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HARCH TECHNOLOGY — Tesla-level rebuild · v6
   Design System v2 compliant:
   • Accent: blue-500 (labels, stats, icons, accent bars — never backgrounds)
   • Backgrounds: neutral-950 / white / neutral-50 / neutral-900 only
   • Fonts: Inter (sans) + Space Mono (mono)
   • Primary CTA: emerald-500 (Harch brand green)
   • Hero H1: text-4xl sm:text-6xl lg:text-7xl
   • Section H2: text-2xl md:text-4xl
   • Unique detail: SCANLINES (repeating horizontal lines, Technology subsidiary signature)
   • NO wave dividers (those are Water only)
   • 18 sections, 11 md5-unique photos, zero repeats, zero AI images
   • Tesla-style 3-button interaction (SOC Live / Satellite / AI Platform)
   • i18n: techTesla namespace, bilingual EN/FR
   ═══════════════════════════════════════════════════════════════ */

/* ── Icon maps (module scope — never re-created on render) ─────── */
const SOVEREIGN_ICONS = [Fingerprint, Lock, Globe2, ShieldCheck];
const SHIELD_FEATURE_ICONS = [BrainCircuit, Database, Workflow, Lock];
const AI_FEATURE_ICONS = [Bot, Network, Cpu, Server];
const SAT_FEATURE_ICONS = [SatelliteDish, Radio, Network, KeyRound];
const THREAT_FEED_ICONS = [Radar, Banknote, Cpu, FileText];
const CLOUD_FEATURE_ICONS = [Globe2, CircuitBoard, KeyRound, Zap];
const CI_FEATURE_ICONS = [Eye, Cpu, Network, Workflow];
const APP_ICONS = [Wheat, Droplets, Radar, Mountain, Banknote];

/* ═══════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

/* ── Scanlines — Technology subsidiary signature detail.
   Repeating 1px horizontal lines, ~4-7% opacity. Drawn with a
   pure CSS repeating-linear-gradient so it scales cleanly. */
function Scanlines({
  opacity = 0.05,
  className = '',
  color = '255,255,255',
}: {
  opacity?: number;
  className?: string;
  color?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, rgba(${color},0.55) 0px, rgba(${color},0.55) 1px, transparent 1px, transparent 3px)`,
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  );
}

/* ── Section label — Harch brand pattern, blue-500 accent ─────── */
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
      <span className="h-px w-8 bg-blue-500/60" />
      <span className="text-blue-500">{label}</span>
    </div>
  );
}

/* ── Browser chrome wrapper for the Tesla interaction dashboards ── */
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
        <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-400">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
          </span>
          {pill}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Sev pill — colour-coded severity for the SOC feed ────────── */
function SevPill({ sev }: { sev: string }) {
  const map: Record<string, string> = {
    CRIT: 'border-red-500/40 bg-red-500/10 text-red-400',
    HIGH: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    MED: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
    INFO: 'border-neutral-700 bg-neutral-800/60 text-neutral-400',
  };
  const cls = map[sev] || map.INFO;
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${cls}`}
    >
      {sev}
    </span>
  );
}

/* ── Live clock — ticking UTC time in the SOC terminal bar ────── */
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

/* ═══════════════════════════════════════════════════════════════
   TESLA INTERACTION — 3 dashboard views that swap on tab click
   ═══════════════════════════════════════════════════════════════ */

/* ── View 0: SOC LIVE — live threat feed + 4 metrics ─────────── */
function SocLiveView({ t }: { t: any }) {
  const metrics = t.raw('socLive.metrics') as any[];
  const feed = t.raw('socLive.feed') as any[];
  const interactions = t.raw('interaction') as any;
  return (
    <div className="relative aspect-[16/10] bg-neutral-950 p-5 md:p-8">
      <Scanlines opacity={0.04} />
      <div className="relative flex h-full flex-col gap-5">
        {/* Header row */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500">
              {t('socLive.brandLabel')}
            </div>
            <div className="mt-1 text-lg font-bold text-white md:text-xl">
              {t('socLive.title')}
            </div>
            <div className="mt-1 text-xs font-light text-neutral-500">
              {interactions.socRegion}
            </div>
          </div>
          <div className="text-right">
            <LiveClock />
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {t('ui.liveStatus')}
            </div>
          </div>
        </div>

        {/* Metrics row — 4 tiles */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((m: any, i: number) => {
            const tone =
              m.tone === 'green'
                ? 'text-emerald-400'
                : m.tone === 'amber'
                ? 'text-amber-400'
                : m.tone === 'red'
                ? 'text-red-400'
                : 'text-blue-400';
            return (
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
                <div className={`mt-1 font-mono text-2xl font-bold ${tone}`}>
                  {m.value}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live threat feed */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {interactions.feedTitle}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
              {t('socLive.legend')}
            </span>
          </div>
          <div className="mt-2 flex-1 space-y-1.5 overflow-hidden">
            {feed.map((f: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-1.5"
              >
                <span className="font-mono text-[10px] font-semibold text-neutral-400">
                  {f.time}
                </span>
                <SevPill sev={f.sev} />
                <span className="flex-1 truncate text-xs font-light text-neutral-300">
                  {f.msg}
                </span>
                <span className="hidden font-mono text-[9px] uppercase tracking-wider text-neutral-500 sm:inline">
                  {f.src}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-neutral-800 pt-2 font-mono text-[9px] uppercase tracking-wider text-neutral-600">
          {interactions.socDisclaimer}
        </div>
      </div>
    </div>
  );
}

/* ── View 1: SATELLITE — African coverage map + ground stations ─ */
function SatelliteView({ t }: { t: any }) {
  const interactions = t.raw('interaction') as any;
  const stations = interactions.groundStations as any[];
  const countries = t.raw('coverageStrip.countries') as string[];

  return (
    <div className="relative aspect-[16/10] bg-neutral-950 p-5 md:p-8">
      <Scanlines opacity={0.04} />
      <div className="relative flex h-full flex-col gap-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500">
              HARCHSAT // MULTI-ORBIT
            </div>
            <div className="mt-1 text-lg font-bold text-white md:text-xl">
              {t('satelliteNet.title')}
            </div>
            <div className="mt-1 text-xs font-light text-neutral-500">
              {interactions.satRegion}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-bold text-blue-400 md:text-3xl">
              Target: 99.99<span className="text-base">%</span>
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
              UPTIME SLA TARGET
            </div>
          </div>
        </div>

        {/* Map + stations grid */}
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-5">
          {/* SVG coverage map */}
          <div className="relative md:col-span-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60">
            <AfricaMap />
            <div className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
              {interactions.mapLabel}
            </div>
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-400">
              <Satellite size={10} aria-hidden="true" />
              LEO + MEO
            </div>
          </div>

          {/* Ground stations + country strip */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {interactions.groundLabel}
            </div>
            <div className="space-y-1.5">
              {stations.map((s: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-2.5 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-1.5"
                >
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                  </span>
                  <span className="flex-1 text-xs font-semibold text-white">
                    {s.city}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                    {s.coord}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="mt-auto rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2">
              <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                8-COUNTRY FOOTPRINT
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {countries.slice(0, 6).map((c: string, i: number) => (
                  <span
                    key={i}
                    className="font-mono text-[9px] uppercase tracking-wider text-neutral-400"
                  >
                    {c}
                    {i < 5 && <span className="ml-1 text-neutral-700">·</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-2 font-mono text-[9px] uppercase tracking-wider text-neutral-600">
          {interactions.satDisclaimer}
        </div>
      </div>
    </div>
  );
}

/* ── Africa coverage map — pure SVG stylized silhouette + beams ─ */
function AfricaMap() {
  // Stylized African silhouette with coverage beams + pulsing ground-station pins.
  const beams = [
    { cx: 130, cy: 90, r: 70 },
    { cx: 120, cy: 130, r: 65 },
    { cx: 135, cy: 100, r: 55 },
    { cx: 95, cy: 175, r: 80 },
    { cx: 110, cy: 175, r: 60 },
  ];
  const pins = [
    { cx: 130, cy: 90, label: 'CAS' },
    { cx: 120, cy: 130, label: 'TAN' },
    { cx: 135, cy: 100, label: 'BEN' },
    { cx: 95, cy: 175, label: 'DKR' },
    { cx: 110, cy: 175, label: 'BJL' },
  ];
  const pathProps = {
    fill: '#1e3a5f',
    fillOpacity: '0.35',
    stroke: '#3b82f6',
    strokeWidth: 1,
    strokeOpacity: 0.5,
  } as const;
  return (
    <svg viewBox="0 0 400 320" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <radialGradient id="africa-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="400" height="320" fill="url(#africa-glow)" />
      {beams.map((b, i) => (
        <circle key={`beam-${i}`} cx={b.cx} cy={b.cy} r={b.r} fill="none" stroke="#3b82f6" strokeWidth="0.6" strokeOpacity="0.35" strokeDasharray="2 3" />
      ))}
      <path d="M 180 40 L 220 50 L 240 80 L 260 110 L 280 130 L 285 165 L 270 200 L 250 230 L 230 260 L 210 280 L 195 290 L 180 280 L 170 250 L 160 220 L 150 190 L 145 160 L 140 130 L 135 100 L 145 70 L 165 50 Z" {...pathProps} />
      <path d="M 130 50 L 175 50 L 180 80 L 145 95 L 120 80 Z" {...pathProps} />
      <path d="M 95 130 L 140 125 L 145 165 L 110 185 L 80 165 L 80 140 Z" {...pathProps} />
      {pins.map((p, i) => (
        <g key={`pin-${i}`}>
          <circle cx={p.cx} cy={p.cy} r="3" fill="#3b82f6" />
          <circle cx={p.cx} cy={p.cy} r="6" fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.5">
            <animate attributeName="r" from="3" to="10" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
          <text x={p.cx + 7} y={p.cy + 3} fill="#93c5fd" fontSize="8" fontFamily="monospace" fontWeight="bold">
            {p.label}
          </text>
        </g>
      ))}
      <line x1="0" y1="200" x2="400" y2="200" stroke="#3b82f6" strokeWidth="0.4" strokeOpacity="0.25" strokeDasharray="3 6" />
    </svg>
  );
}

/* ── View 2: AI PLATFORM — HarchAI model fleet + language chips ── */
function AiPlatformView({ t }: { t: any }) {
  const interactions = t.raw('interaction') as any;
  const models = interactions.aiModels as any[];
  const languages = interactions.languages as string[];
  const aiPlatformStats = t.raw('aiPlatform.stats') as any[];

  return (
    <div className="relative aspect-[16/10] bg-neutral-950 p-5 md:p-8">
      <Scanlines opacity={0.04} />
      <div className="relative flex h-full flex-col gap-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500">
              HARCHAI // SOVEREIGN LLM
            </div>
            <div className="mt-1 text-lg font-bold text-white md:text-xl">
              {t('aiPlatform.title')}
            </div>
            <div className="mt-1 text-xs font-light text-neutral-500">
              {interactions.aiRegion}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-bold text-blue-400 md:text-3xl">
              41<span className="text-base"> langs</span>
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
              NATIVE, NOT TRANSLATED
            </div>
          </div>
        </div>

        {/* Model fleet cards */}
        <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
          {interactions.modelLabel}
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {models.map((m: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-white">{m.name}</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-blue-400">
                  {m.params}
                </span>
              </div>
              <div className="mt-1 text-xs font-light text-neutral-400">{m.type}</div>
              <div className="mt-2 flex items-center gap-1.5">
                <Languages size={10} className="text-blue-500" aria-hidden="true" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                  {m.lang}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Language chip strip */}
        <div className="flex-1 flex flex-col">
          <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            {interactions.langLabel}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {languages.map((l: string, i: number) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/5 px-2.5 py-0.5 text-[10px] font-medium text-blue-300"
              >
                {l}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Footer stats */}
        <div className="grid grid-cols-3 gap-2 border-t border-neutral-800 pt-3">
          {aiPlatformStats.map((s: any, i: number) => (
            <div key={i} className="text-center">
              <div className="font-mono text-base font-bold text-blue-400">{s.num}</div>
              <div className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-neutral-600">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
          {interactions.aiDisclaimer}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function TechnologyPage() {
  const t = useTranslations('techTesla');

  /* ── State ────────────────────────────────────────────────── */
  // Tesla interaction: 0 = SOC Live, 1 = Satellite, 2 = AI Platform
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculator: endpoint count for pricing estimator
  const [endpoints, setEndpoints] = useState(1500);
  const harchMonthly = useMemo(() => Math.round(endpoints * 11), [endpoints]);
  const inHouseMonthly = useMemo(() => Math.round(endpoints * 28), [endpoints]);
  const save3yr = useMemo(
    () => Math.round(((inHouseMonthly - harchMonthly) * 12 * 3) / 1000),
    [harchMonthly, inHouseMonthly]
  );

  /* ── Translation arrays (typed via `any`) ─────────────────── */
  const heroStats = t.raw('hero.stats') as any[];
  const interaction = t.raw('interaction') as any;
  const sovereignItems = t.raw('sovereign.items') as any[];
  const shieldStats = t.raw('harchShield.stats') as any[];
  const shieldFeatures = t.raw('harchShield.features') as any[];
  const aiStats = t.raw('aiPlatform.stats') as any[];
  const aiFeatures = t.raw('aiPlatform.features') as any[];
  const satStats = t.raw('satelliteNet.stats') as any[];
  const satFeatures = t.raw('satelliteNet.features') as any[];
  const threatStats = t.raw('threatIntel.stats') as any[];
  const threatFeeds = t.raw('threatIntel.feeds') as any[];
  const cloudStats = t.raw('sovereignCloud.stats') as any[];
  const cloudFeatures = t.raw('sovereignCloud.features') as any[];
  const ciStats = t.raw('criticalInfra.stats') as any[];
  const ciFeatures = t.raw('criticalInfra.features') as any[];
  const applicationItems = t.raw('applications.items') as any[];
  const comparisonHeaders = t.raw('comparison.headers') as string[];
  const comparisonRows = t.raw('comparison.rows') as string[][];
  const pricingPlans = t.raw('pricing.plans') as any[];
  const processSteps = t.raw('process.steps') as any[];
  const caseStudies = t.raw('caseStudies.items') as any[];
  const testimonials = t.raw('testimonials.items') as any[];
  const faqItems = t.raw('faq.items') as any[];

  /* Tesla interaction tab metadata */
  const teslaTabs = [
    { id: 'soc', label: interaction.tabs[0], icon: Shield, url: interaction.socUrl },
    { id: 'sat', label: interaction.tabs[1], icon: Satellite, url: interaction.satUrl },
    { id: 'ai', label: interaction.tabs[2], icon: BrainCircuit, url: interaction.aiUrl },
  ];

  /* Calculator pricing slider scale */
  const epMarks = [100, 1000, 5000, 10000];

  return (
    <div className="bg-white font-sans text-neutral-950 antialiased selection:bg-blue-500 selection:text-white">

      {/* ═══════════════════════════════════════════════════════════
          01. HERO — Full-screen, HARCH · TECHNOLOGY badge, scanlines
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-neutral-950">
        <Image
          src="/images/sections/tech-soc.jpg"
          alt={t('hero.heroImageAlt')}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/75 via-neutral-950/55 to-neutral-950/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 to-transparent" />
        <Scanlines opacity={0.07} />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-16 md:px-12 md:py-24">
          {/* Top — HARCH · TECHNOLOGY badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center md:justify-start"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-5 py-2 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
              </span>
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

          {/* Bottom — stats + emerald CTA + terminal status bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto w-full max-w-6xl"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-12">
              {heroStats.map((s: any, i: number) => (
                <div
                  key={i}
                  className="border-l-2 border-blue-500/50 pl-5 text-left"
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
                href="/quote?vertical=technology"
                aria-label={`${t('hero.cta')} — Harch Technology`}
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('hero.cta')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href="tel:+212684440682"
                aria-label={`${t('cta.call.heading')} +212 684 440 682`}
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone size={14} aria-hidden="true" />
                {t('cta.call.heading')}
              </a>
            </div>

            {/* Terminal status bar */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500 backdrop-blur-md">
              <span className="text-blue-400">$ harch.tech</span>
              <span className="text-neutral-700">|</span>
              <span>{t('ui.dashboardUrl')}</span>
              <span className="text-neutral-700">|</span>
              <LiveClock />
              <span className="text-neutral-700">|</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t('ui.liveStatus')}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          02. OVERVIEW — Minimalist two-column, lots of whitespace
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-5"
          >
            <SectionLabel n="01" label={t('overview.label')} />
            <h2 className="mt-5 whitespace-pre-line text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('overview.heading')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-blue-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-7"
          >
            <p className="text-lg font-light leading-relaxed text-neutral-500 md:text-xl">
              {t('overview.paragraph')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          03. TESLA INTERACTION — 3 buttons + changing dashboard
              The centerpiece. SOC Live / Satellite / AI Platform.
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
        <Scanlines opacity={0.025} />
        <div className="relative mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="02" label={interaction.label} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {interaction.title}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-blue-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {interaction.subtitle}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              <ArrowUpRight size={10} aria-hidden="true" />
              {interaction.tabHint}
            </div>
          </div>

          {/* Big dashboard screen — changes with tab */}
          <motion.div
            id="tech-tesla-panel"
            role="tabpanel"
            aria-labelledby="tech-tesla-tab-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div key="soc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <BrowserChrome url={teslaTabs[0].url} pill={t('ui.liveStatus')}>
                    <SocLiveView t={t} />
                  </BrowserChrome>
                </motion.div>
              )}
              {activeTab === 1 && (
                <motion.div key="sat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <BrowserChrome url={teslaTabs[1].url} pill="HARCHSAT">
                    <SatelliteView t={t} />
                  </BrowserChrome>
                </motion.div>
              )}
              {activeTab === 2 && (
                <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <BrowserChrome url={teslaTabs[2].url} pill="HARCHAI">
                    <AiPlatformView t={t} />
                  </BrowserChrome>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 3 buttons at the bottom — the Tesla switcher */}
          <div role="tablist" aria-label={interaction.title} className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {teslaTabs.map((tab, i) => {
              const isActive = activeTab === i;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tech-tesla-tab-${i}`}
                  aria-controls="tech-tesla-panel"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(i)}
                  aria-label={tab.label}
                  className={`group flex items-center gap-4 rounded-2xl border px-6 py-5 text-left transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                    isActive
                      ? 'border-blue-500/60 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                      : 'border-neutral-800 bg-neutral-900 hover:border-blue-500/40 hover:bg-neutral-800 hover:-translate-y-0.5'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-1 transition-colors ${
                      isActive
                        ? 'bg-blue-500 text-white ring-blue-500'
                        : 'bg-neutral-800 text-blue-500 ring-neutral-700'
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div
                      className={`font-mono text-[10px] uppercase tracking-wider ${
                        isActive ? 'text-blue-400' : 'text-neutral-500'
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
                        ? 'text-blue-400 translate-x-0'
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
          04. SOVEREIGN STACK — 4 pillars on dark
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="03" label={t('sovereign.label')} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('sovereign.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-blue-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('sovereign.body')}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-blue-400">
              <ShieldCheck size={10} aria-hidden="true" />
              {t('sovereign.badge')}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sovereignItems.map((item: any, i: number) => {
              const Icon = SOVEREIGN_ICONS[i % SOVEREIGN_ICONS.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-8 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-neutral-800/60 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/30">
                    <Icon size={22} className="text-blue-500" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-white">{item.t}</h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-neutral-400">
                    {item.d}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          05. HARCHSHIELD SIEM — split with terminal console mockup
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            {/* Left — copy + stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-5"
            >
              <SectionLabel n="04" label={t('harchShield.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('harchShield.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-blue-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('harchShield.body')}
              </p>
              <div className="mt-10 grid grid-cols-3 gap-6">
                {shieldStats.map((s: any, i: number) => (
                  <div key={i} className="border-l-2 border-blue-500/50 pl-4">
                    <div className="font-mono text-2xl font-bold text-blue-600 md:text-3xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-xs font-light text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — terminal console mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7"
            >
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-3">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    <Terminal size={12} className="text-blue-500" aria-hidden="true" />
                    harchshield@soccasablanca:~
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-blue-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    STREAMING
                  </div>
                </div>
                <div className="relative p-5 font-mono text-xs leading-relaxed">
                  <Scanlines opacity={0.05} />
                  <div className="relative space-y-1.5">
                    <div className="text-neutral-500"><span className="text-blue-400">$</span> harchshield ingest --sources 217 --schema ocsf-v1.2</div>
                    <div className="text-neutral-400"><span className="text-emerald-400">✓</span> normalized 2,412,847 events / 24h</div>
                    <div className="text-neutral-400"><span className="text-emerald-400">✓</span> ml-anomaly engine: 47 detectors active</div>
                    <div className="text-neutral-400"><span className="text-emerald-400">✓</span> soar playbooks: 192 loaded · 87% auto-contained</div>
                    <div className="text-neutral-500"><span className="text-blue-400">$</span> harchshield correlate --window 5m --severity high</div>
                    <div className="text-amber-400">⚠ [HIGH] BANK-CORE-12 · anomalous credential use</div>
                    <div className="text-neutral-400">  └ playbook: pb-credential-isolate-v3 triggered</div>
                    <div className="text-emerald-400">✓ contained in 38s · 0 lateral movement</div>
                    <div className="text-neutral-500"><span className="text-blue-400">$</span> harchshield status --residency MA</div>
                    <div className="text-neutral-400"><span className="text-emerald-400">✓</span> all telemetry on Moroccan soil · zero foreign access</div>
                    <div className="text-blue-400">
                      <span className="text-blue-400">$</span>{' '}
                      <span className="inline-block h-3 w-2 animate-pulse bg-blue-500 align-middle" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Features row */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {shieldFeatures.map((f: any, i: number) => {
                  const Icon = SHIELD_FEATURE_ICONS[i % SHIELD_FEATURE_ICONS.length];
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="text-blue-500" aria-hidden="true" />
                        <h3 className="text-sm font-bold text-neutral-950">{f.t}</h3>
                      </div>
                      <p className="mt-2 text-xs font-light leading-relaxed text-neutral-500">
                        {f.d}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          06. AI PLATFORM — split with tech-infrastructure.jpg
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
        <Scanlines opacity={0.025} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            {/* Left — image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-6"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800">
                <Image
                  src="/images/sections/tech-infrastructure.jpg"
                  alt={t('aiPlatform.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/80 px-3 py-1.5 backdrop-blur-md">
                  <BrainCircuit size={12} className="text-blue-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-200">
                    HARCHAI · 1,798 GPU PLANNED · 41 LANGS
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right — copy + features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-6"
            >
              <SectionLabel n="05" label={t('aiPlatform.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
                {t('aiPlatform.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-blue-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('aiPlatform.body')}
              </p>
              <div className="mt-8 grid grid-cols-3 gap-6">
                {aiStats.map((s: any, i: number) => (
                  <div key={i} className="border-l-2 border-blue-500/50 pl-4">
                    <div className="font-mono text-2xl font-bold text-blue-400 md:text-3xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-xs font-light text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-4">
                {aiFeatures.map((f: any, i: number) => {
                  const Icon = AI_FEATURE_ICONS[i % AI_FEATURE_ICONS.length];
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/30">
                        <Icon size={14} className="text-blue-500" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{f.t}</h3>
                        <p className="mt-1 text-xs font-light leading-relaxed text-neutral-400">
                          {f.d}
                        </p>
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
          07. SATELLITE NETWORK — split with tech-satellite.jpg
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            {/* Left — copy + features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-6"
            >
              <SectionLabel n="06" label={t('satelliteNet.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('satelliteNet.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-blue-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('satelliteNet.body')}
              </p>
              <div className="mt-8 grid grid-cols-3 gap-6">
                {satStats.map((s: any, i: number) => (
                  <div key={i} className="border-l-2 border-blue-500/50 pl-4">
                    <div className="font-mono text-2xl font-bold text-blue-600 md:text-3xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-xs font-light text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-4">
                {satFeatures.map((f: any, i: number) => {
                  const Icon = SAT_FEATURE_ICONS[i % SAT_FEATURE_ICONS.length];
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/30">
                        <Icon size={14} className="text-blue-500" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-950">{f.t}</h3>
                        <p className="mt-1 text-xs font-light leading-relaxed text-neutral-500">
                          {f.d}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right — image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-6"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                <Image
                  src="/images/sections/tech-satellite.jpg"
                  alt={t('satelliteNet.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 backdrop-blur-md">
                  <SatelliteDish size={12} className="text-blue-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
                    HARCHSAT · 3 GROUND STATIONS · 8 COUNTRIES
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          08. THREAT INTEL — 4 indigenous feed cards on dark
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
        <Scanlines opacity={0.03} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="07" label={t('threatIntel.label')} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('threatIntel.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-blue-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('threatIntel.body')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {threatStats.map((s: any, i: number) => (
              <div key={i} className="text-center">
                <div className="font-mono text-3xl font-bold text-blue-400 md:text-5xl">
                  {s.num}
                </div>
                <div className="mt-2 text-xs font-light text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
            {threatFeeds.map((feed: any, i: number) => {
              const Icon = THREAT_FEED_ICONS[i % THREAT_FEED_ICONS.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-8 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-neutral-800/60 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/30">
                      <Icon size={22} className="text-blue-500" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{feed.t}</h3>
                      <p className="mt-3 text-sm font-light leading-relaxed text-neutral-400">
                        {feed.d}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          09. SOVEREIGN CLOUD — split with smart-grid photo
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            {/* Left — image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-5"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                <Image
                  src="/images/blog/ai-powered-smart-grid-africa.jpg"
                  alt={t('sovereignCloud.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                    <Globe2 size={12} aria-hidden="true" />
                    AFRICAN SOIL · ZERO CLOUD ACT
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right — copy + features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7"
            >
              <SectionLabel n="08" label={t('sovereignCloud.label')} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t('sovereignCloud.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-blue-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t('sovereignCloud.body')}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {cloudStats.map((s: any, i: number) => (
                  <div key={i} className="border-l-2 border-blue-500/50 pl-4">
                    <div className="font-mono text-2xl font-bold text-blue-600 md:text-3xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-xs font-light text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {cloudFeatures.map((f: any, i: number) => {
                  const Icon = CLOUD_FEATURE_ICONS[i % CLOUD_FEATURE_ICONS.length];
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="text-blue-500" aria-hidden="true" />
                        <h3 className="text-sm font-bold text-neutral-950">{f.t}</h3>
                      </div>
                      <p className="mt-2 text-xs font-light leading-relaxed text-neutral-500">
                        {f.d}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. CRITICAL INFRA PROTECTION — split with industrial photo
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
        <Scanlines opacity={0.025} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            {/* Left — copy + features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7"
            >
              <SectionLabel n="09" label={t('criticalInfra.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
                {t('criticalInfra.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-blue-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('criticalInfra.body')}
              </p>
              <div className="mt-8 grid grid-cols-3 gap-6">
                {ciStats.map((s: any, i: number) => (
                  <div key={i} className="border-l-2 border-blue-500/50 pl-4">
                    <div className="font-mono text-2xl font-bold text-blue-400 md:text-3xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-xs font-light text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {ciFeatures.map((f: any, i: number) => {
                  const Icon = CI_FEATURE_ICONS[i % CI_FEATURE_ICONS.length];
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="text-blue-500" aria-hidden="true" />
                        <h3 className="text-sm font-bold text-white">{f.t}</h3>
                      </div>
                      <p className="mt-2 text-xs font-light leading-relaxed text-neutral-400">
                        {f.d}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right — image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-5"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-800">
                <Image
                  src="/images/blog/morocco-industrial-gateway.jpg"
                  alt={t('criticalInfra.title')}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-neutral-800 bg-neutral-950/80 p-3 backdrop-blur-md">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                    <span className="text-blue-400">OT SEGMENT · PASSIVE TAP</span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      NOMINAL
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. APPLICATIONS — 5 cards with 5 unique blog photos
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="10" label={t('applications.label')} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('applications.heading')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-blue-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('applications.paragraph')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {applicationItems.slice(0, 5).map((app: any, i: number) => {
              const photos = [
                '/images/blog/vertical-farming-sahel.jpg',
                '/images/blog/desalination-ai-optimization.jpg',
                '/images/blog/precision-agriculture-senegal.jpg',
                '/images/blog/african-mineral-processing.jpg',
                '/images/blog/islamic-finance-african-infrastructure.jpg',
              ];
              const Icon = APP_ICONS[i % APP_ICONS.length];
              return (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={photos[i]}
                      alt={app.t}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
                    <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 backdrop-blur-md">
                      <Icon size={16} className="text-blue-500" aria-hidden="true" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-bold text-white">{app.t}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-light leading-relaxed text-neutral-600">
                      {app.d}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-blue-500">
                      <ArrowUpRight size={10} aria-hidden="true" />
                      SOVEREIGN · ISO 27001
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          12. COMPARISON TABLE — Harch vs Foreign MSSP
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
        <Scanlines opacity={0.025} />
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center">
            <SectionLabel n="11" label={t('comparison.label')} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('comparison.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-blue-500" />
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-neutral-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900">
                  {comparisonHeaders.map((h: string, i: number) => (
                    <th
                      key={i}
                      className={`px-5 py-4 text-left font-mono text-[10px] font-semibold uppercase tracking-wider ${
                        i === 1 ? 'text-blue-400' : 'text-neutral-500'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row: string[], i: number) => (
                  <tr
                    key={i}
                    className="border-b border-neutral-800/60 last:border-0 transition-colors hover:bg-neutral-900/40"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-neutral-200">
                      {row[0]}
                    </td>
                    <td className="px-5 py-4 text-sm font-light text-blue-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-blue-500" aria-hidden="true" />
                        {row[1]}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-light text-neutral-500">
                      {row[2]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          13. PRICING — 3 tiers
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="12" label={t('pricing.label')} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('pricing.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-blue-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {pricingPlans.map((plan: any, i: number) => {
              const isFeatured = !!plan.featured;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative flex flex-col rounded-2xl border p-8 transition hover:-translate-y-1 hover:shadow-2xl ${
                    isFeatured
                      ? 'border-emerald-500/60 bg-neutral-950 text-white shadow-xl'
                      : 'border-neutral-200 bg-white text-neutral-950 shadow-sm hover:border-blue-500/40'
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
                        <Sparkles size={10} aria-hidden="true" />
                        RECOMMENDED
                      </div>
                    </div>
                  )}
                  <div
                    className={`font-mono text-[10px] font-semibold uppercase tracking-[0.3em] ${
                      isFeatured ? 'text-blue-400' : 'text-blue-500'
                    }`}
                  >
                    {plan.name}
                  </div>
                  <div
                    className={`mt-2 text-sm font-light ${
                      isFeatured ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {plan.tagline}
                  </div>
                  <div
                    className={`mt-6 font-mono text-3xl font-bold ${
                      isFeatured ? 'text-white' : 'text-neutral-950'
                    }`}
                  >
                    {plan.price}
                  </div>
                  <div
                    className={`mt-1 text-xs font-light ${
                      isFeatured ? 'text-neutral-500' : 'text-neutral-500'
                    }`}
                  >
                    {plan.size}
                  </div>
                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((f: string, j: number) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2
                          size={14}
                          className={`mt-0.5 flex-shrink-0 ${
                            isFeatured ? 'text-blue-400' : 'text-blue-500'
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className={`font-light ${
                            isFeatured ? 'text-neutral-300' : 'text-neutral-600'
                          }`}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/quote?vertical=technology"
                    aria-label={`${plan.cta} — ${plan.name}`}
                    className={`mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      isFeatured
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400 focus-visible:outline-emerald-500'
                        : 'border border-neutral-300 text-neutral-950 hover:bg-neutral-100 focus-visible:outline-blue-500'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          14. PROCESS — 5-step timeline
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
        <Scanlines opacity={0.025} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="13" label={t('process.label')} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('process.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-blue-500" />
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-5">
            {processSteps.map((step: any, i: number) => {
              const Icon = [Eye, Layers, HardHat, Settings, Activity][i % 5];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-bold text-blue-500/40">
                      {step.n}
                    </span>
                    <Icon size={18} className="text-blue-500" aria-hidden="true" />
                  </div>
                  <div className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                    {step.time}
                  </div>
                  <h3 className="mt-3 text-base font-bold text-white">{step.t}</h3>
                  <p className="mt-2 text-xs font-light leading-relaxed text-neutral-400">
                    {step.d}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          15. CALCULATOR — interactive slider
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="14" label={t('calculator.label')} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('calculator.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-blue-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t('calculator.subtitle')}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
          >
            <div className="grid grid-cols-1 gap-0 md:grid-cols-12">
              {/* Slider panel */}
              <div className="border-b border-neutral-200 p-8 md:col-span-7 md:border-b-0 md:border-r">
                <label
                  htmlFor="tech-endpoint-slider"
                  className="font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-500"
                >
                  {t('calculator.billLabel')}
                </label>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-5xl font-bold text-neutral-950">
                    {endpoints.toLocaleString()}
                  </span>
                  <span className="font-mono text-sm text-neutral-500">endpoints</span>
                </div>
                <input
                  id="tech-endpoint-slider"
                  type="range"
                  min={100}
                  max={10000}
                  step={100}
                  value={endpoints}
                  onChange={(e) => setEndpoints(Number(e.target.value))}
                  className="mt-6 w-full accent-blue-500"
                  aria-label={t('calculator.billLabel')}
                />
                <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  {epMarks.map((m) => (
                    <span key={m}>{m.toLocaleString()}</span>
                  ))}
                </div>
              </div>

              {/* Output panel */}
              <div className="bg-neutral-950 p-8 text-white md:col-span-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {t('calculator.monthlyLabel')}
                  </div>
                  <div className="mt-1 font-mono text-3xl font-bold text-blue-400">
                    ${harchMonthly.toLocaleString()}
                  </div>
                </div>
                <div className="mt-6">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {t('calculator.yearlyLabel')}
                  </div>
                  <div className="mt-1 font-mono text-3xl font-bold text-white">
                    ${(harchMonthly * 12).toLocaleString()}
                  </div>
                </div>
                <div className="mt-6 border-t border-neutral-800 pt-6">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                    {t('calculator.save25Label')}
                  </div>
                  <div className="mt-1 font-mono text-3xl font-bold text-emerald-400">
                    ${save3yr.toLocaleString()}K
                  </div>
                </div>
                <Link
                  href="/quote?vertical=technology"
                  aria-label={t('hero.cta')}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                >
                  {t('hero.cta')}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
                <div className="mt-4 font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                  {t('calculator.disclaimer')}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          16. CASE STUDIES + TESTIMONIALS — proof section
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
        <Scanlines opacity={0.025} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="15" label={t('caseStudies.label')} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('caseStudies.heading')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-blue-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('caseStudies.body')}
            </p>
          </div>

          {/* Case study cards */}
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {caseStudies.slice(0, 4).map((cs: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-neutral-800/60 hover:shadow-xl hover:shadow-blue-500/10">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-400">{cs.tag}</div>
                <div className="mt-3 font-mono text-2xl font-bold text-white">{cs.metric}</div>
                <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-neutral-400">{cs.body}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-blue-400">
                  <ArrowUpRight size={10} aria-hidden="true" />
                  {cs.cta}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials row */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((tm: any, i: number) => (
              <motion.figure key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-8 transition hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10">
                <Quote className="h-8 w-8 text-blue-500/40" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 font-light leading-relaxed text-neutral-300">&ldquo;{tm.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 border-t border-neutral-800 pt-4">
                  <div className="font-bold text-white">{tm.author}</div>
                  <div className="text-sm font-light text-neutral-500">{tm.role}</div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          17. FAQ — accordion with blue accent
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <SectionLabel n="16" label={t('faq.label')} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('faq.heading')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-blue-500" />
          </div>

          <div className="mt-12 space-y-3">
            {faqItems.map((item: any, i: number) => (
              <div
                key={i}
                className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                  openFaq === i ? 'border-blue-500/40' : 'border-neutral-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-neutral-50 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  id={`tech-faq-button-${i}`}
                  aria-expanded={openFaq === i}
                  aria-controls={`tech-faq-panel-${i}`}
                >
                  <span className="font-semibold text-neutral-950">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-blue-500 transition-transform ${
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
                      id={`tech-faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`tech-faq-button-${i}`}
                    >
                      <p className="px-5 pb-5 text-sm font-light leading-relaxed text-neutral-600">
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
          18. FINAL CTA — Full-bleed, emerald CTA + Back to Harch Corp
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950">
        <Image
          src="/images/blog/carbon-credit-markets-africa.jpg"
          alt=""
          fill
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-950/85 to-neutral-950/70" />
        <Scanlines opacity={0.06} />

        <div className="relative mx-auto max-w-5xl px-6 py-24 text-white md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            {/* HARCH · TECHNOLOGY badge — reprise of hero badge */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-4 py-2 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
              </span>
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-neutral-200">
                {t('finalCta.badge')}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
              {t('finalCta.heading')}
            </h2>
            <p className="mt-6 text-base font-light text-neutral-300 md:text-xl">
              {t('finalCta.lead')}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {/* Primary CTA — emerald (Harch brand green) */}
              <Link
                href="/quote?vertical=technology"
                aria-label={`${t('finalCta.primary')} — Harch Technology`}
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('finalCta.primary')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href="tel:+212684440682"
                aria-label={`${t('cta.call.heading')} +212 684 440 682`}
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone size={16} aria-hidden="true" />
                {t('cta.call.heading')}
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs font-light text-neutral-400">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-blue-500" aria-hidden="true" />
                30-DAY DEPLOYMENT
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-500" aria-hidden="true" />
                ISO 27001 · SOC 2
              </div>
              <div className="flex items-center gap-2">
                <Globe2 size={14} className="text-blue-500" aria-hidden="true" />
                {t('ui.harchCorpBacking')}
              </div>
            </div>

            {/* "Back to Harch Corp" link — brand anchor */}
            <div className="mt-12 border-t border-neutral-800 pt-6">
              <Link
                href="/"
                aria-label={t('ui.backToHarchCorp')}
                className="group inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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

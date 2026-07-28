'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { CountUp } from '@/components/ui/motion';
import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Building2,
  Cpu,
  Sun,
  HardHat,
  Pickaxe,
  Wheat,
  Droplets,
  Landmark,
  Shield,
  Banknote,
  Layers,
  Activity,
  Globe2,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRightLeft,
  CircuitBoard,
  Network,
  Boxes,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HARCH CORP PLATFORM — Harch Corp Brand System compliant
   Platform / group-level page → accent = emerald-500 (Harch brand green)
   Primary CTA: emerald-500 · Inter + Space Mono only · neutral palette
   14 sections · full i18n (en/fr) · real photos only
   Unique page detail: Ecosystem constellation (8-node graph)
   ═══════════════════════════════════════════════════════════════ */

const SUBSIDIARY_ICONS = [
  Cpu,           // Intelligence
  Building2,     // Cement
  Sun,           // Energy
  CircuitBoard,  // Technology
  Pickaxe,       // Mining
  Wheat,         // Agriculture
  Droplets,      // Water
  Landmark,      // Finance
];

const PILLAR_ICONS = [Banknote, HardHat, CircuitBoard, Activity];
const WHY_ICONS = [Banknote, Shield, Globe2, Sun, CheckCircle2, Layers, Cpu, Clock];
const SW_ICONS = [Boxes, Network, Layers]; // HarchOS, HarchLink, Combined

/* Parse i18n stat string into CountUp props.
   Examples: "8" → {num:8}; "$2.4B" → {$,2.4,B,1}; "24,700+" → {"",24700,"+",0} */
function parseStatNum(s: string): { prefix: string; num: number; suffix: string; decimals: number } {
  const m = s.match(/^([^\d]*)([\d.,]+)([^\d]*)$/);
  if (!m) return { prefix: '', num: 0, suffix: s, decimals: 0 };
  const prefix = m[1];
  const rawNum = m[2].replace(/,/g, '');
  const suffix = m[3];
  const decimals = rawNum.includes('.') ? rawNum.split('.')[1].length : 0;
  return { prefix, num: parseFloat(rawNum), suffix, decimals };
}

/* Ecosystem constellation — unique Platform page visual detail.
   8 subsidiary nodes arranged in a circle around a central HARCH node.
   Subtle pulse + connecting lines that brighten on hover. */
function EcosystemConstellation() {
  // 8 nodes positioned in a circle (r=130) around (200,200)
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return { x: 200 + Math.cos(angle) * 130, y: 200 + Math.sin(angle) * 130, i };
  });
  const accents = ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#84cc16', '#06b6d4', '#eab308'];
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-full w-full"
      role="img"
      aria-label="Harch Corp ecosystem — 8 subsidiaries orbiting the parent"
    >
      <defs>
        <radialGradient id="eco-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Spokes from core to each node */}
      {nodes.map((n) => (
        <line
          key={`spoke-${n.i}`}
          x1="200"
          y1="200"
          x2={n.x}
          y2={n.y}
          stroke="#10b981"
          strokeOpacity="0.18"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
      ))}
      {/* Concentric rings */}
      <circle cx="200" cy="200" r="130" fill="none" stroke="#10b981" strokeOpacity="0.10" strokeWidth="1" />
      <circle cx="200" cy="200" r="80" fill="none" stroke="#10b981" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 4" />
      {/* Core glow */}
      <circle cx="200" cy="200" r="60" fill="url(#eco-core)" />
      {/* Core node */}
      <circle cx="200" cy="200" r="22" fill="#0a0a0a" stroke="#10b981" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="6" fill="#10b981">
        <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <text x="200" y="248" textAnchor="middle" fontFamily="'Space Mono', monospace" fontSize="10" fontWeight="700" fill="#10b981">
        HARCH
      </text>
      {/* 8 satellite nodes */}
      {nodes.map((n) => (
        <g key={`node-${n.i}`}>
          <circle cx={n.x} cy={n.y} r="18" fill="#0a0a0a" stroke={accents[n.i]} strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r="5" fill={accents[n.i]} fillOpacity="0.85">
            <animate
              attributeName="opacity"
              values="0.85;0.4;0.85"
              dur="2.8s"
              begin={`${n.i * 0.25}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
    </svg>
  );
}

/* Accent color helper for subsidiary cards (per-subsidiary accent dot) */
function accentClasses(accent: string) {
  switch (accent) {
    case 'violet':
      return { dot: 'bg-violet-500', text: 'text-violet-500', ring: 'group-hover:border-violet-500' };
    case 'amber':
      return { dot: 'bg-amber-500', text: 'text-amber-500', ring: 'group-hover:border-amber-500' };
    case 'emerald':
      return { dot: 'bg-emerald-500', text: 'text-emerald-500', ring: 'group-hover:border-emerald-500' };
    case 'blue':
      return { dot: 'bg-blue-500', text: 'text-blue-500', ring: 'group-hover:border-blue-500' };
    case 'orange':
      return { dot: 'bg-orange-600', text: 'text-orange-600', ring: 'group-hover:border-orange-600' };
    case 'lime':
      return { dot: 'bg-lime-500', text: 'text-lime-500', ring: 'group-hover:border-lime-500' };
    case 'cyan':
      return { dot: 'bg-cyan-500', text: 'text-cyan-500', ring: 'group-hover:border-cyan-500' };
    case 'yellow':
      return { dot: 'bg-yellow-500', text: 'text-yellow-500', ring: 'group-hover:border-yellow-500' };
    default:
      return { dot: 'bg-emerald-500', text: 'text-emerald-500', ring: 'group-hover:border-emerald-500' };
  }
}

/* Reusable section label pattern — emerald accent bar + uppercase label */
function SectionLabel({
  children,
  variant = 'light',
}: {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-px w-8 bg-emerald-500" aria-hidden="true" />
      <p
        className={`font-mono text-xs font-semibold uppercase tracking-[0.25em] ${
          variant === 'dark' ? 'text-emerald-500' : 'text-emerald-600'
        }`}
      >
        {children}
      </p>
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function PlatformDemoPage() {
  const t = useTranslations('platformDemo');

  /* Calculator state — capital need in USD millions */
  const [capex, setCapex] = useState(500);
  // Simplified model: bigger deals → higher IRR up to a cap; jobs scale linearly
  const irr = Math.min(17.5, 11 + (capex / 5000) * 6).toFixed(1);
  const jobs = Math.round((capex * 18) / 100) * 100; // ~18 jobs per $1M, rounded to 100

  /* FAQ accordion state */
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* Tesla-style 3-button interaction — Software layer (HarchOS / HarchLink / Combined) */
  const [swTab, setSwTab] = useState<0 | 1 | 2>(0);

  /* Translation arrays (typed casts of t.raw()) */
  const statsItems = t.raw('stats.items') as { num: string; label: string }[];
  const thesisPillars = t.raw('thesis.pillars') as { t: string; d: string }[];
  const subsidiaryItems = t.raw('subsidiaries.items') as {
    name: string;
    href: string;
    desc: string;
    accent: string;
  }[];
  const integrationFlows = t.raw('integration.flows') as {
    from: string;
    to: string;
    desc: string;
  }[];
  const geoCountries = t.raw('geography.countries') as {
    name: string;
    role: string;
    image: string;
  }[];
  const softwareProducts = t.raw('software.products') as { name: string; desc: string }[];
  const softwareMetrics = t.raw('software.metrics') as { value: string; label: string }[];
  const pipelineHeaders = t.raw('pipeline.headers') as string[];
  const pipelineRows = t.raw('pipeline.rows') as string[][];
  const roadmapPhases = t.raw('roadmap.phases') as {
    phase: string;
    period: string;
    title: string;
    target: string;
    actions: string[];
  }[];
  const whyItems = t.raw('why.items') as { t: string; d: string }[];
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];

  return (
    <div className="bg-white text-neutral-950 antialiased">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — HARCH · PLATFORM badge, visible H1, emerald CTA
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative flex min-h-screen w-full items-center overflow-hidden bg-neutral-950"
        aria-labelledby="platform-hero-title"
      >
        <Image
          src="/images/sections/overview-casablanca.jpg"
          alt={t('hero.subtitle')}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Neutral-950 overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/60 to-neutral-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
          {/* HARCH · PLATFORM badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900/80 px-4 py-2 backdrop-blur-sm"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-white">
              {t('hero.badge')}
            </span>
            <span className="hidden h-3 w-px bg-neutral-700 sm:block" />
            <span className="hidden font-mono text-[10px] uppercase tracking-wider text-neutral-500 sm:block">
              {t('ui.harchCorpSa')}
            </span>
          </motion.div>

          {/* Visible H1 — no opacity:0 hide, fully visible at SSR */}
          <motion.h1
            id="platform-hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-5xl font-sans text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {t('hero.titleLine1')}
            <br />
            {t('hero.titleLine2')}
            <br />
            <span className="text-emerald-500">{t('hero.titleAccent')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 max-w-2xl font-sans text-base font-normal leading-relaxed text-neutral-300 md:text-lg"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Link
              href="/subsidiaries"
              aria-label={t('hero.primaryCta')}
              className="group inline-flex min-h-[52px] items-center justify-center gap-2 bg-emerald-500 px-8 py-4 font-sans text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              {t('hero.primaryCta')}
              <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/"
              aria-label={t('hero.secondaryCta')}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 border border-neutral-700 px-8 py-4 font-sans text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-900 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t('hero.secondaryCta')}
            </Link>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            {t('hero.scrollHint')}
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. STATS — 4 KPIs on dark
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="border-b border-neutral-800 bg-neutral-950 py-16 text-white md:py-20"
        aria-labelledby="platform-stats-title"
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 id="platform-stats-title" className="sr-only">
            {t('stats.label')}
          </h2>
          <p className="mb-10 font-mono text-xs uppercase tracking-[0.25em] text-emerald-500">
            {t('stats.label')}
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {statsItems.map((s, i) => {
              const parsed = parseStatNum(s.num);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative"
                >
                  <div className="absolute -left-3 top-1 h-12 w-px bg-emerald-500/0 transition-colors duration-300 group-hover:bg-emerald-500/60" aria-hidden="true" />
                  <div className="font-mono text-4xl font-bold tracking-tight text-white tabular-nums md:text-6xl">
                    <CountUp
                      to={parsed.num}
                      prefix={parsed.prefix}
                      suffix={parsed.suffix}
                      decimals={parsed.decimals}
                      duration={2.2}
                    />
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-wider text-neutral-500">
                    {s.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. THE PLATFORM THESIS — narrative + 4 pillars (light)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="bg-white py-20 text-neutral-950 md:py-32"
        aria-labelledby="platform-thesis-title"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp} className="mb-14 max-w-3xl">
            <SectionLabel variant="light">{t('thesis.label')}</SectionLabel>
            <h2
              id="platform-thesis-title"
              className="font-sans text-3xl font-bold leading-tight tracking-tight text-neutral-950 md:text-5xl"
            >
              {t('thesis.title')}
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-neutral-500 md:text-lg">
              {t('thesis.body')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {thesisPillars.map((p, i) => {
              const Icon = PILLAR_ICONS[i] || Shield;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex gap-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 md:p-8"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 transition-transform duration-300 group-hover:scale-110">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-sans text-lg font-bold tracking-tight text-neutral-950">
                      {p.t}
                    </h3>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-neutral-500">{p.d}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. SUBSIDIARIES GRID — 8 cards with per-subsidiary accent (light)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="bg-neutral-50 py-20 text-neutral-950 md:py-32"
        aria-labelledby="platform-subs-title"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp} className="mb-12 max-w-3xl">
            <SectionLabel variant="light">{t('subsidiaries.label')}</SectionLabel>
            <h2
              id="platform-subs-title"
              className="font-sans text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl"
            >
              {t('subsidiaries.title')}
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-neutral-500 md:text-lg">
              {t('subsidiaries.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {subsidiaryItems.map((s, i) => {
              const Icon = SUBSIDIARY_ICONS[i] || Building2;
              const ac = accentClasses(s.accent);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={s.href}
                    aria-label={`${s.name} — ${s.desc}`}
                    className={`group relative block h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-900/5 ${ac.ring} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500`}
                  >
                    {/* Accent top-bar that fades in on hover */}
                    <span
                      className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 transition-transform duration-300 group-hover:scale-110 ${ac.text}`}>
                        <Icon size={18} aria-hidden="true" />
                      </div>
                      <span className={`h-2 w-2 rounded-full transition-transform duration-300 group-hover:scale-125 ${ac.dot}`} aria-hidden="true" />
                    </div>
                    <h3 className="font-sans text-lg font-bold tracking-tight text-neutral-950">
                      {s.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs tabular-nums text-neutral-500">{s.desc}</p>
                    <div className="mt-4 inline-flex items-center gap-1 font-sans text-sm font-semibold text-emerald-600">
                      {t('ui.explore')}
                      <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. VERTICAL INTEGRATION — flow diagram (dark)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="platform-integration-title"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            {/* LEFT — narrative + flows */}
            <motion.div {...fadeUp} className="md:col-span-7">
              <SectionLabel variant="dark">{t('integration.label')}</SectionLabel>
              <h2
                id="platform-integration-title"
                className="font-sans text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl"
              >
                {t('integration.title')}
              </h2>
              <p className="mt-6 font-sans text-base leading-relaxed text-neutral-400 md:text-lg">
                {t('integration.subtitle')}
              </p>

              <div className="mt-10 space-y-3">
                {integrationFlows.map((flow, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="group grid grid-cols-1 gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition-[border-color,background-color] duration-300 hover:border-emerald-500/30 hover:bg-neutral-800/60 md:grid-cols-12 md:items-center md:gap-4 md:p-6"
                  >
                    <div className="flex flex-wrap items-center gap-2 md:col-span-5">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-emerald-500 ring-1 ring-emerald-500/20">
                        {flow.from}
                      </span>
                      <ArrowRightLeft size={14} className="text-neutral-500 transition-colors duration-300 group-hover:text-emerald-500" aria-hidden="true" />
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-emerald-500 ring-1 ring-emerald-500/20">
                        {flow.to}
                      </span>
                    </div>
                    <p className="font-sans text-sm leading-relaxed text-neutral-400 md:col-span-7">
                      {flow.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — ecosystem constellation (unique Platform visual detail) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-5"
            >
              <div className="relative mx-auto aspect-square w-full max-w-sm">
                {/* Glow backdrop */}
                <div
                  className="absolute inset-0 rounded-full opacity-50 blur-3xl"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.18) 0%, transparent 60%)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative h-full w-full">
                  <EcosystemConstellation />
                </div>
              </div>
              <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                8 subsidiaries · 1 balance sheet
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. GEOGRAPHY — 5 country cards with real photos (light)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="bg-white py-20 text-neutral-950 md:py-32"
        aria-labelledby="platform-geo-title"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp} className="mb-14 max-w-3xl">
            <SectionLabel variant="light">{t('geography.label')}</SectionLabel>
            <h2
              id="platform-geo-title"
              className="font-sans text-3xl font-bold leading-tight tracking-tight text-neutral-950 md:text-5xl"
            >
              {t('geography.title')}
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-neutral-500 md:text-lg">
              {t('geography.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {geoCountries.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-900/5"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-500" aria-hidden="true" />
                    <span className="font-sans text-sm font-bold text-white">{c.name}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="font-sans text-sm leading-relaxed text-neutral-500">{c.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. SOFTWARE LAYER — HarchOS + HarchLink (dark)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="platform-software-title"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp} className="mb-12 max-w-3xl">
            <SectionLabel variant="dark">{t('software.label')}</SectionLabel>
            <h2
              id="platform-software-title"
              className="font-sans text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl"
            >
              {t('software.title')}
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-neutral-400 md:text-lg">
              {t('software.subtitle')}
            </p>
          </motion.div>

          {/* Tesla-style 3-button interaction — HarchOS / HarchLink / Combined */}
          <div className="mb-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {([
              { key: 0 as const, label: softwareProducts[0]?.name ?? 'HarchOS', desc: 'Workload orchestrator', icon: SW_ICONS[0] },
              { key: 1 as const, label: softwareProducts[1]?.name ?? 'HarchLink', desc: 'Field-asset mesh', icon: SW_ICONS[1] },
              { key: 2 as const, label: 'Combined', desc: 'Both products', icon: SW_ICONS[2] },
            ]).map((tab) => {
              const Icon = tab.icon;
              const isActive = swTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSwTab(tab.key)}
                  aria-pressed={isActive}
                  aria-label={`${isActive ? 'Showing' : 'Show'} ${tab.label}`}
                  className={`group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl border px-5 py-3 text-left transition-[border-color,background-color,transform] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 active:scale-[0.98] ${
                    isActive
                      ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-500/20 ring-1 ring-emerald-500/40'
                        : 'bg-neutral-800 group-hover:bg-neutral-700'
                    }`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? 'text-emerald-400' : 'text-neutral-400'}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="flex flex-col">
                    <span
                      className={`font-sans text-xs font-semibold leading-tight transition-colors ${
                        isActive ? 'text-white' : 'text-neutral-300'
                      }`}
                    >
                      {tab.label}
                    </span>
                    <span
                      className={`font-mono text-[10px] leading-tight transition-colors ${
                        isActive ? 'text-emerald-400/80' : 'text-neutral-500'
                      }`}
                    >
                      {tab.desc}
                    </span>
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="sw-tab-dot"
                      className="ml-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mockup screen — content changes per tab */}
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/40">
            <AnimatePresence mode="wait">
              <motion.div
                key={swTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* HarchOS view */}
                {swTab === 0 && (
                  <div className="p-8 md:p-10">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                        <Boxes size={22} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-sans text-xl font-bold tracking-tight text-white">{softwareProducts[0]?.name}</h3>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-500">/01 — orchestrator</p>
                      </div>
                    </div>
                    <p className="font-sans text-sm leading-relaxed text-neutral-400 md:text-base">{softwareProducts[0]?.desc}</p>
                    {/* Mini dashboard tiles */}
                    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {softwareMetrics.slice(0, 4).map((m, i) => (
                        <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                          <div className="font-mono text-lg font-bold tabular-nums text-emerald-500">{m.value}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* HarchLink view */}
                {swTab === 1 && (
                  <div className="p-8 md:p-10">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                        <Network size={22} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-sans text-xl font-bold tracking-tight text-white">{softwareProducts[1]?.name}</h3>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-500">/02 — telemetry mesh</p>
                      </div>
                    </div>
                    <p className="font-sans text-sm leading-relaxed text-neutral-400 md:text-base">{softwareProducts[1]?.desc}</p>
                    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {softwareMetrics.slice(0, 4).map((m, i) => (
                        <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                          <div className="font-mono text-lg font-bold tabular-nums text-emerald-500">{m.value}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Combined view */}
                {swTab === 2 && (
                  <div className="p-8 md:p-10">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                        <Layers size={22} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-sans text-xl font-bold tracking-tight text-white">HarchOS + HarchLink</h3>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-500">/03 — full stack</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {softwareProducts.map((p, i) => (
                        <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                              {i === 0 ? <Boxes size={16} aria-hidden="true" /> : <Network size={16} aria-hidden="true" />}
                            </div>
                            <h4 className="font-sans text-sm font-bold tracking-tight text-white">{p.name}</h4>
                          </div>
                          <p className="mt-2 font-sans text-xs leading-relaxed text-neutral-400">{p.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {softwareMetrics.map((m, i) => (
                        <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                          <div className="font-mono text-lg font-bold tabular-nums text-emerald-500">{m.value}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-neutral-800 pt-10 md:grid-cols-4">
            {softwareMetrics.map((m, i) => {
              const parsed = parseStatNum(m.value);
              const isPureNumber = !isNaN(parsed.num) && parsed.num > 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="font-mono text-3xl font-bold tabular-nums text-emerald-500 md:text-4xl">
                    {isPureNumber ? (
                      <CountUp
                        to={parsed.num}
                        prefix={parsed.prefix}
                        suffix={parsed.suffix}
                        decimals={parsed.decimals}
                        duration={2}
                      />
                    ) : (
                      m.value
                    )}
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-wider text-neutral-500">
                    {m.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. PHOTO BREAK — overview-port.jpg parallax (dark image)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative h-[60vh] w-full overflow-hidden bg-neutral-950"
        aria-label={t('ui.harchCorpSa')}
      >
        <Image
          src="/images/sections/overview-port.jpg"
          alt={t('ui.harchCorpSa')}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/60 to-neutral-950/30" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-emerald-500">
              {t('ui.livePipeline')}
            </p>
            <p className="font-sans text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">
              {t('pipeline.title')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. INVESTMENT PIPELINE — table (light)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="bg-white py-20 text-neutral-950 md:py-32"
        aria-labelledby="platform-pipeline-title"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp} className="mb-12 max-w-3xl">
            <SectionLabel variant="light">{t('pipeline.label')}</SectionLabel>
            <h2
              id="platform-pipeline-title"
              className="font-sans text-3xl font-bold leading-tight tracking-tight text-neutral-950 md:text-5xl"
            >
              {t('pipeline.title')}
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-neutral-500 md:text-lg">
              {t('pipeline.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-2xl border border-neutral-200"
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-neutral-50">
                  <tr>
                    {pipelineHeaders.map((h, i) => (
                      <th
                        key={i}
                        className="border-b border-neutral-200 px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-500 md:px-6 md:py-4"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pipelineRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50"
                    >
                      <td className="px-4 py-4 font-sans text-sm font-semibold text-neutral-950 md:px-6">
                        {row[0]}
                      </td>
                      <td className="px-4 py-4 font-sans text-sm text-neutral-500 md:px-6">{row[1]}</td>
                      <td className="px-4 py-4 font-mono text-sm font-bold text-emerald-600 md:px-6">
                        {row[2]}
                      </td>
                      <td className="px-4 py-4 md:px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                            row[3] === 'Mandated' || row[3] === 'Mandaté'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : row[3] === 'Structuring' || row[3] === 'Structuration'
                              ? 'bg-yellow-500/10 text-yellow-600'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              row[3] === 'Mandated' || row[3] === 'Mandaté'
                                ? 'bg-emerald-500'
                                : row[3] === 'Structuring' || row[3] === 'Structuration'
                                ? 'bg-yellow-500'
                                : 'bg-neutral-400'
                            }`}
                          />
                          {row[3]}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-sans text-sm text-neutral-500 md:px-6">{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3">
              <p className="font-sans text-xs text-neutral-500">{t('pipeline.footnote')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. ROADMAP — 4 phases (dark)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="platform-roadmap-title"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp} className="mb-14 max-w-3xl">
            <SectionLabel variant="dark">{t('roadmap.label')}</SectionLabel>
            <h2
              id="platform-roadmap-title"
              className="font-sans text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl"
            >
              {t('roadmap.title')}
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-neutral-400 md:text-lg">
              {t('roadmap.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {roadmapPhases.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div className="mb-5 flex items-baseline justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-500">
                    {p.phase} · {p.period}
                  </span>
                  <span className="font-mono text-2xl font-bold tabular-nums text-white">{p.target}</span>
                </div>
                <h3 className="mb-4 font-sans text-xl font-bold tracking-tight text-white">
                  {p.title}
                </h3>
                <ul className="space-y-2">
                  {p.actions.map((action, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2
                        size={14}
                        className="mt-1 flex-shrink-0 text-emerald-500"
                        aria-hidden="true"
                      />
                      <span className="font-sans text-sm text-neutral-400">{action}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. WHY HARCH PLATFORM — 8 advantages (light)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="bg-neutral-50 py-20 text-neutral-950 md:py-32"
        aria-labelledby="platform-why-title"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp} className="mb-14 max-w-3xl">
            <SectionLabel variant="light">{t('why.label')}</SectionLabel>
            <h2
              id="platform-why-title"
              className="font-sans text-3xl font-bold leading-tight tracking-tight text-neutral-950 md:text-5xl"
            >
              {t('why.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {whyItems.map((item, i) => {
              const Icon = WHY_ICONS[i] || Shield;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="flex gap-5 rounded-2xl border border-neutral-200 bg-white p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 md:p-8"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-sans text-lg font-bold tracking-tight text-neutral-950">
                      {item.t}
                    </h3>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-neutral-500">{item.d}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          12. QUICK CALCULATOR — capex → IRR + jobs (dark)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="platform-calc-title"
      >
        <div className="mx-auto max-w-4xl px-6">
          <motion.div {...fadeUp} className="mb-12 max-w-3xl">
            <SectionLabel variant="dark">{t('calculator.label')}</SectionLabel>
            <h2
              id="platform-calc-title"
              className="font-sans text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl"
            >
              {t('calculator.title')}
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-neutral-400 md:text-lg">
              {t('calculator.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 md:p-12"
          >
            <div className="mb-8">
              <div className="mb-3 flex items-baseline justify-between">
                <label
                  htmlFor="capex-slider"
                  className="font-mono text-xs uppercase tracking-wider text-neutral-500"
                >
                  {t('calculator.capexLabel')}
                </label>
                <span className="font-mono text-2xl font-bold text-emerald-500">
                  ${capex}M
                </span>
              </div>
              <input
                id="capex-slider"
                type="range"
                min={50}
                max={5000}
                step={50}
                value={capex}
                onChange={(e) => setCapex(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-800 accent-emerald-500"
                aria-valuetext={`$${capex} million`}
              />
              <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                <span>$50M</span>
                <span>$5,000M</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 border-t border-neutral-800 pt-8 sm:grid-cols-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                  {t('calculator.irrLabel')}
                </p>
                <p className="mt-2 font-mono text-4xl font-bold tabular-nums text-emerald-500 md:text-5xl">
                  {irr}%
                </p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                  {t('calculator.jobsLabel')}
                </p>
                <p className="mt-2 font-mono text-4xl font-bold tabular-nums text-white md:text-5xl">
                  {jobs.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/quote?vertical=platform"
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 bg-emerald-500 px-8 py-4 font-sans text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('calculator.cta')}
                <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          13. FAQ — accordion (light)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="bg-white py-20 text-neutral-950 md:py-32"
        aria-labelledby="platform-faq-title"
      >
        <div className="mx-auto max-w-3xl px-6">
          <motion.div {...fadeUp} className="mb-12">
            <SectionLabel variant="light">{t('faq.label')}</SectionLabel>
            <h2
              id="platform-faq-title"
              className="font-sans text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl"
            >
              {t('faq.title')}
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  >
                    <span className="font-sans text-base font-semibold text-neutral-950 md:text-lg">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`flex-shrink-0 text-emerald-600 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 font-sans text-sm leading-relaxed text-neutral-500 md:text-base">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          14. FINAL CTA — emerald primary + Back to Harch Corp (dark)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-neutral-950"
        aria-labelledby="platform-cta-title"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/sections/overview-construction.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/60" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-24 text-white md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-emerald-500" aria-hidden="true" />
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-500">
                {t('finalCta.label')}
              </p>
            </div>
            <h2
              id="platform-cta-title"
              className="font-sans text-3xl font-bold leading-tight tracking-tight text-white md:text-6xl"
            >
              {t('finalCta.title')}
            </h2>
            <p className="mt-6 font-sans text-base font-normal leading-relaxed text-neutral-400 md:text-lg">
              {t('finalCta.subtitle')}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/quote?vertical=platform"
                aria-label={t('finalCta.primary')}
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 bg-emerald-500 px-8 py-4 font-sans text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('finalCta.primary')}
                <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/subsidiaries"
                aria-label={t('finalCta.secondary')}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 border border-neutral-700 px-8 py-4 font-sans text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-900 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {t('finalCta.secondary')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-8 font-sans text-xs text-neutral-500">{t('ui.harchCorpSa')}</p>

            {/* Back to Harch Corp — Harch brand signature */}
            <Link
              href="/"
              className="mt-10 inline-flex items-center gap-2 font-sans text-sm text-neutral-500 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              {t('finalCta.backToCorp')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

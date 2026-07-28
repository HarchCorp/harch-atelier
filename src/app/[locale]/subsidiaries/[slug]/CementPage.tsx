'use client';

/* ═══════════════════════════════════════════════════════════════════════
   HARCH CEMENT — Tesla-level subsidiary page · v6 rebuild
   ═══════════════════════════════════════════════════════════════════════
   Design System v2 compliant:
   • Accent: amber-500 (Cement subsidiary) — labels, stats, icons, bars
   • Backgrounds: neutral-950 / white / neutral-50 / neutral-900 only
   • Fonts: Inter (sans) + Space Mono (mono / data)
   • Primary CTA: bg-emerald-500 (Harch brand green — never changes)
   • Secondary CTA: border border-neutral-300 text-neutral-950 hover:bg-neutral-100
   • Hero H1: text-4xl sm:text-6xl lg:text-7xl
   • Section H2: text-2xl md:text-4xl
   • Unique detail: INDUSTRIAL DOTTED GRID (radial-gradient 32px lattice,
     amber dots at low opacity) — Cement subsidiary signature
   • NO wave dividers (those are Water-only)
   • Tesla-style interaction: 3 buttons (Production / Quality / Logistics)
     that swap a large dashboard — the centerpiece
   • i18n namespace: cementTesla (EN/FR already populated)
   • 12 unique photos (zero AI, zero repeats within the page)
   • 18 sections
   ═══════════════════════════════════════════════════════════════════════ */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Phone,
  CheckCircle2,
  Shield,
  ShieldCheck,
  Mountain,
  Flame,
  Factory,
  Truck,
  Package,
  PackageCheck,
  Boxes,
  Ship,
  Cpu,
  QrCode,
  Banknote,
  Clock,
  MapPin,
  Wrench,
  Leaf,
  Recycle,
  Atom,
  FileText,
  Download,
  Quote,
  Building2,
  Construction,
  HardHat,
  Layers,
  CircuitBoard,
  Globe2,
  ChevronDown,
  Settings,
  Radio,
  Activity,
  Gauge,
  Thermometer,
  Beaker,
  Navigation,
  Route,
  Warehouse,
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Database,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   ICON POOLS — module scope, tree-shakeable, never re-created on render
   ═══════════════════════════════════════════════════════════════════════ */
const PROCESS_ICONS = [Mountain, Wrench, Flame, CircuitBoard, Boxes, Truck];
const CHAIN_ICONS = [Mountain, Factory, Ship, Truck, PackageCheck];
const WHY_ICONS = [Shield, Banknote, Clock, QrCode];
const APP_ICONS = [HardHat, Layers, Construction, Atom, Building2];
const INNO_ICONS = [Leaf, Atom, Recycle, CircuitBoard];
const PRODUCTION_VIEW_ICONS = [Gauge, Thermometer, Activity, Atom];
const QUALITY_VIEW_ICONS = [Gauge, Clock, Activity, Beaker];
const LOGISTICS_VIEW_ICONS = [CheckCircle2, Clock, Navigation, Route];

/* ═══════════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Premium easing — tesla.com-style spring-out cubic-bezier.
   Used for Tesla tab transitions, card lifts, and AnimatePresence. */
const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

/* ── Industrial dotted grid — Cement subsidiary UNIQUE visual detail.
   Drawn with a radial-gradient lattice of amber dots. Pure CSS so it
   scales cleanly. Used at low opacity (3–8%) as a background texture. */
function IndustrialGrid({
  opacity = 0.06,
  className = '',
  color = '245,158,11', // amber-500
  size = 32,
}: {
  opacity?: number;
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage: `radial-gradient(circle, rgba(${color},0.9) 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

/* ── Section label — Harch brand pattern, amber-500 accent ─────────── */
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
      {n && (
        <span className={dark ? 'text-neutral-600' : 'text-neutral-400'}>{`// ${n}`}</span>
      )}
      <span className="h-px w-8 bg-amber-500/60" />
      <span className="text-amber-500">{label}</span>
    </div>
  );
}

/* ── Browser chrome wrapper for the Tesla interaction dashboards ───── */
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
        <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-400">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          {pill}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Cement triangle accent — sparing amber mark on photo overlays ── */
function CementAccent({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute right-6 top-6 h-10 w-10 text-amber-500/20 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2L2 22h20L12 2zm0 4l7.53 14H4.47L12 6z" />
    </svg>
  );
}

/* ── Trend pill — colour-coded trend for metric tiles ──────────────── */
function TrendPill({ trend }: { trend: string }) {
  const isUp = trend.startsWith('+');
  const isFlat = trend === '0%' || trend === '0';
  const Icon = isFlat ? Activity : isUp ? TrendingUp : TrendingDown;
  const cls = isFlat
    ? 'border-neutral-700 bg-neutral-800/60 text-neutral-400'
    : isUp
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
    : 'border-red-500/30 bg-red-500/10 text-red-400';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${cls}`}
    >
      <Icon size={9} aria-hidden="true" />
      {trend}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TESLA INTERACTION — 3 dashboard views that swap on tab click.
   This is the centerpiece. Production / Quality / Logistics.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── View 1: PRODUCTION — kiln telemetry, 12-bar hourly output ─────── */
function ProductionView({ t }: { t: any }) {
  const metrics = t.raw('teslaInteraction.production.metrics') as any[];
  const bars = t.raw('teslaInteraction.production.bars') as number[];
  const prod = t.raw('teslaInteraction.production') as any;
  const status = t.raw('teslaInteraction.status') as any;

  const maxBar = Math.max(...bars, 1);

  return (
    <div className="relative aspect-[16/10] bg-neutral-950 p-5 md:p-8">
      <IndustrialGrid opacity={0.04} />
      <div className="relative flex h-full flex-col gap-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500">
              {t('ui.harchCementBadge')}
            </div>
            <div className="mt-1 text-lg font-bold text-white md:text-xl">{prod.title}</div>
            <div className="mt-1 text-xs font-light text-neutral-500">{prod.subtitle}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-bold text-amber-400 md:text-3xl">
              1,420<span className="text-base"> t</span>
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
              {t('ui.today')} · KILN #1
            </div>
          </div>
        </div>

        {/* 4 metric tiles */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((m: any, i: number) => {
            const Icon = PRODUCTION_VIEW_ICONS[i % PRODUCTION_VIEW_ICONS.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <Icon size={11} className="text-amber-500" aria-hidden="true" />
                  <TrendPill trend={m.trend} />
                </div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                  {m.label}
                </div>
                <div className="mt-0.5 font-mono text-lg font-bold text-white">{m.value}</div>
              </motion.div>
            );
          })}
        </div>

        {/* 12-bar hourly output chart */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {prod.barsLabel}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">
              {prod.kilnStatus}
            </span>
          </div>
          <div className="mt-3 flex flex-1 items-end gap-1.5">
            {bars.map((b: number, i: number) => {
              const h = Math.max(6, Math.round((b / maxBar) * 100));
              const isPeak = b === maxBar;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
                  className={`flex-1 rounded-sm ${
                    isPeak ? 'bg-amber-500' : 'bg-neutral-700 hover:bg-amber-500/60'
                  }`}
                  style={{ minHeight: 4 }}
                  title={`${i + 1}h ago · ${b} t`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            <span>-12h</span>
            <span>-6h</span>
            <span>now</span>
          </div>
        </div>

        {/* Footer / notes */}
        <div className="grid grid-cols-1 gap-3 border-t border-neutral-800 pt-3 md:grid-cols-3">
          <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            {prod.panelTitle}
          </div>
          <div className="text-xs font-light text-neutral-400">{prod.notes}</div>
          <div className="text-right font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            {prod.panelFoot}
          </div>
        </div>
      </div>
      {/* Operator signature bottom-right */}
      <div className="pointer-events-none absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-wider text-neutral-700">
        {status.operator}
      </div>
    </div>
  );
}

/* ── View 2: QUALITY — EN 196-1 lab, 12-bar 28d strength trend ─────── */
function QualityView({ t }: { t: any }) {
  const metrics = t.raw('teslaInteraction.quality.metrics') as any[];
  const bars = t.raw('teslaInteraction.quality.bars') as number[];
  const standards = t.raw('teslaInteraction.quality.standards') as string[];
  const qual = t.raw('teslaInteraction.quality') as any;
  const certMock = t.raw('ui.certificateMock') as any;

  const maxBar = Math.max(...bars, 1);

  return (
    <div className="relative aspect-[16/10] bg-neutral-950 p-5 md:p-8">
      <IndustrialGrid opacity={0.04} />
      <div className="relative flex h-full flex-col gap-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500">
              {t('ui.harchCementBadge')} · EN 196-1 LAB
            </div>
            <div className="mt-1 text-lg font-bold text-white md:text-xl">{qual.title}</div>
            <div className="mt-1 text-xs font-light text-neutral-500">{qual.subtitle}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-bold text-amber-400 md:text-3xl">
              42.8<span className="text-base"> MPa</span>
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
              {certMock.batchNumber}
            </div>
          </div>
        </div>

        {/* 4 metric tiles */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((m: any, i: number) => {
            const Icon = QUALITY_VIEW_ICONS[i % QUALITY_VIEW_ICONS.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <Icon size={11} className="text-amber-500" aria-hidden="true" />
                  <TrendPill trend={m.trend} />
                </div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                  {m.label}
                </div>
                <div className="mt-0.5 font-mono text-lg font-bold text-white">{m.value}</div>
              </motion.div>
            );
          })}
        </div>

        {/* 12-bar 28-day strength trend + standards panel */}
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-5">
          <div className="flex flex-col md:col-span-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {qual.barsLabel}
            </div>
            <div className="mt-3 flex flex-1 items-end gap-1.5">
              {bars.map((b: number, i: number) => {
                const h = Math.max(6, Math.round((b / maxBar) * 100));
                const isPeak = b === maxBar;
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
                    className={`flex-1 rounded-sm ${
                      isPeak ? 'bg-amber-500' : 'bg-neutral-700 hover:bg-amber-500/60'
                    }`}
                    style={{ minHeight: 4 }}
                    title={`batch ${i + 1} · ${b} MPa`}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-wider text-neutral-600">
              <span>batch 1</span>
              <span>batch 6</span>
              <span>batch 12</span>
            </div>
          </div>

          {/* Standards + test count */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
              <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                {t('ui.certifications')}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {standards.map((s: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-sm border border-amber-500/30 bg-amber-500/5 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
              <div className="font-mono text-2xl font-bold text-emerald-400">247</div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                {qual.testCount}
              </div>
            </div>
          </div>
        </div>

        {/* Footer / notes */}
        <div className="grid grid-cols-1 gap-3 border-t border-neutral-800 pt-3 md:grid-cols-3">
          <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            {qual.panelTitle}
          </div>
          <div className="text-xs font-light text-neutral-400">{qual.notes}</div>
          <div className="text-right font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            {qual.panelFoot}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── View 3: LOGISTICS — truck GPS map + delivery zones ─────────────── */
function LogisticsView({ t }: { t: any }) {
  const metrics = t.raw('teslaInteraction.logistics.metrics') as any[];
  const trucks = t.raw('teslaInteraction.logistics.trucks') as any[];
  const log = t.raw('teslaInteraction.logistics') as any;
  const zones = t.raw('ui.deliveryZones') as any;

  const zoneList = [
    { key: 'gambia', city: zones.gambia, time: zones.gambiaTime, note: zones.gambiaNote },
    { key: 'sSenegal', city: zones.sSenegal, time: zones.sSenegalTime, note: zones.sSenegalNote },
    {
      key: 'guineaBissau',
      city: zones.guineaBissau,
      time: zones.guineaBissauTime,
      note: zones.guineaBissauNote,
    },
  ];

  return (
    <div className="relative aspect-[16/10] bg-neutral-950 p-5 md:p-8">
      <IndustrialGrid opacity={0.04} />
      <div className="relative flex h-full flex-col gap-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500">
              {t('ui.harchCementBadge')} · GPS FLEET
            </div>
            <div className="mt-1 text-lg font-bold text-white md:text-xl">{log.title}</div>
            <div className="mt-1 text-xs font-light text-neutral-500">{log.subtitle}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-bold text-amber-400 md:text-3xl">
              42<span className="text-base"> trucks</span>
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
              {t('ui.onTime')} {t('ui.onTimeValue')}
            </div>
          </div>
        </div>

        {/* 4 metric tiles */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((m: any, i: number) => {
            const Icon = LOGISTICS_VIEW_ICONS[i % LOGISTICS_VIEW_ICONS.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <Icon size={11} className="text-amber-500" aria-hidden="true" />
                  <TrendPill trend={m.trend} />
                </div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                  {m.label}
                </div>
                <div className="mt-0.5 font-mono text-lg font-bold text-white">{m.value}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Live fleet list + delivery zones */}
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          {/* Live trucks */}
          <div className="flex flex-col">
            <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {t('ui.fleetLabels.fleetSize')} · {t('ui.fleetValues.trucks')}
            </div>
            <div className="mt-2 space-y-1.5">
              {trucks.map((tr: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-1.5"
                >
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-amber-400">
                    {tr.id}
                  </span>
                  <span className="flex-1 truncate text-xs font-light text-neutral-300">
                    {tr.dest}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    ETA {tr.eta}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-white">{tr.load}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Delivery zones */}
          <div className="flex flex-col">
            <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {t('ui.deliveryZonesHeader')}
            </div>
            <div className="mt-2 space-y-2">
              {zoneList.map((z, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{z.city}</span>
                    <span className="font-mono text-[10px] font-semibold text-amber-400">
                      {z.time}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] font-light text-neutral-500">{z.note}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-1 gap-3 border-t border-neutral-800 pt-3 md:grid-cols-3">
          <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            {log.panelTitle}
          </div>
          <div className="text-xs font-light text-neutral-400">{t('ui.fleetDescriptions.fleet')}</div>
          <div className="text-right font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            {log.panelFoot}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function CementPage() {
  const t = useTranslations('cementTesla');

  /* ── State ─────────────────────────────────────────────────────── */
  // Tesla interaction: 'production' | 'quality' | 'logistics'
  const [activeTab, setActiveTab] = useState<'production' | 'quality' | 'logistics'>('production');

  // Cement type interactive selector
  const [activeType, setActiveType] = useState(0);

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Savings calculator
  const [annualTons, setAnnualTons] = useState(5000);
  const pricePerTonImported = 1200;
  const savingPerTon = useMemo(() => Math.round(pricePerTonImported * 0.3), []);
  const monthlySaving = useMemo(() => Math.round((annualTons * savingPerTon) / 12), [annualTons, savingPerTon]);
  const yearlySaving = useMemo(() => annualTons * savingPerTon, [annualTons, savingPerTon]);
  const tenYearSaving = useMemo(() => yearlySaving * 10, [yearlySaving]);

  /* ── Translation arrays — typed via `any` for complex shapes ───── */
  const heroStats: any[] = t.raw('hero.stats');
  const trustItems: string[] = t.raw('trustBar.items');
  const quarryStages: any[] = t.raw('quarryToBag.stages');
  const kilnStats: any[] = t.raw('kiln.stats');
  const kilnSpecs: any[] = t.raw('kiln.specs');
  const kilnFuelSources: any[] = t.raw('kiln.fuelSources');
  const labStats: any[] = t.raw('qualityLab.stats');
  const labStandards: string[] = t.raw('qualityLab.standards');
  const viChain: any[] = t.raw('verticalIntegration.chain');
  const viBenefits: any[] = t.raw('verticalIntegration.benefits');
  const gambiaStats: any[] = t.raw('gambiaPlant.stats');
  const gambiaTimeline: any[] = t.raw('gambiaPlant.timeline');
  const cementTypes: any[] = t.raw('cementTypes.types');
  const applicationItems: any[] = t.raw('applications.items');
  const whyItems: any[] = t.raw('whyHarch.items');
  const comparisonHeaders: string[] = t.raw('comparison.headers');
  const comparisonRows: string[][] = t.raw('comparison.rows');
  const pricingPlans: any[] = t.raw('pricing.plans');
  const innoItems: any[] = t.raw('innovation.items');
  const geoCities: any[] = t.raw('geography.cities');
  const testimonials: any[] = t.raw('testimonials.items');
  const faqItems: any[] = t.raw('faq.items');
  const resourceItems: any[] = t.raw('resources.items');
  const caseItems: any[] = t.raw('caseStudiesFull.items');

  /* ── Tesla tab metadata ────────────────────────────────────────── */
  const teslaButtons: any = t.raw('teslaInteraction.buttons');
  const teslaStatus: any = t.raw('teslaInteraction.status');
  const teslaSectionN: string = t('teslaInteraction.sectionNumber');
  const teslaTabs = [
    { id: 'production' as const, label: teslaButtons.production, Icon: Flame },
    { id: 'quality' as const, label: teslaButtons.quality, Icon: Beaker },
    { id: 'logistics' as const, label: teslaButtons.logistics, Icon: Truck },
  ];

  /* ── Calculator marks ──────────────────────────────────────────── */
  const tonMarks = [500, 2000, 5000, 15000, 30000];

  return (
    <main className="min-h-screen bg-white font-sans text-neutral-950 antialiased selection:bg-amber-500/20">

      {/* ═══════════════════════════════════════════════════════════════
          01. HERO — full-bleed photo, HARCH · CEMENT badge, Back link
          ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-neutral-950"
        aria-labelledby="cement-hero-title"
      >
        <Image
          src="/images/sections/comp-cement-mixer.jpg"
          alt={t('hero.title')}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/50 to-neutral-950/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 to-transparent" />
        <IndustrialGrid opacity={0.05} />

        {/* Top bar — HARCH · CEMENT badge + Back to Harch Corp link */}
        <div className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-neutral-950/50 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
            </span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
              {t('ui.harchCementBadge')}
            </span>
          </motion.div>

          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-neutral-950/50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md transition-colors hover:bg-white/10"
          >
            <ArrowLeft
              size={12}
              className="transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            {t('ui.backToHarchCorp')}
          </Link>
        </div>

        {/* Center — headline + lead */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-amber-500">
              <span className="h-px w-8 bg-amber-500/60" />
              {t('hero.subtitle')}
            </div>
            <h1
              id="cement-hero-title"
              className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              {t('hero.title')}
            </h1>
            <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-300 md:text-lg">
              {t('hero.body')}
            </p>
          </motion.div>
        </div>

        {/* Bottom — stats + emerald CTA + secondary CTA + terminal bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="relative z-20 mx-auto w-full max-w-7xl px-6 pb-16 md:pb-20"
        >
          {/* Stats */}
          <div className="grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {heroStats.map((s: any, i: number) => (
              <div key={i} className="border-l-2 border-amber-500/40 pl-4">
                <div className="font-mono text-2xl font-bold text-amber-400 md:text-4xl">{s.num}</div>
                <div className="mt-1 text-[11px] font-light uppercase tracking-wider text-neutral-400 md:text-xs">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <Link
              href="/quote?vertical=cement"
              className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-[transform,background-color,box-shadow] duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              {t('hero.primaryCta')}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <a
              href="#tesla"
              className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-[transform,background-color] duration-200 hover:bg-white/10 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {t('hero.scrollCta')}
            </a>
          </div>

          {/* Terminal status bar */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500 backdrop-blur-md">
            <span className="text-amber-400">$ harch.cement</span>
            <span className="text-neutral-700">|</span>
            <span>{t('ui.dashboardUrl')}</span>
            <span className="text-neutral-700">|</span>
            <span>{teslaStatus.updated}</span>
            <span className="text-neutral-700">|</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t('ui.liveStatus')}
            </span>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          02. TRUST BAR — certifications marquee (light)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-neutral-200 bg-white py-6" aria-label="Certifications">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6">
          {trustItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500"
            >
              <CheckCircle2 size={12} className="text-amber-500" strokeWidth={2} aria-hidden="true" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          03. OVERVIEW — image + body + 3 mini-stats (light)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="cement-overview-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm"
            >
              <Image
                src="/images/sections/cement-quarry-aerial.jpg"
                alt={t('overview.title')}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950/30 to-transparent" />
              <CementAccent />
              <div className="absolute bottom-4 left-4 rounded-lg border border-neutral-200/40 bg-white/85 px-3 py-2 backdrop-blur-md">
                <div className="font-mono text-[10px] uppercase tracking-wider text-amber-500">
                  {t('ui.geoPin')}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <SectionLabel n="01" label={t('overview.label')} />
              <h2
                id="cement-overview-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('overview.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-amber-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-600 md:text-lg">
                {t('overview.body')}
              </p>

              {/* 3 inline stats */}
              <div className="mt-10 grid grid-cols-3 gap-6">
                <div>
                  <div className="font-mono text-2xl font-bold text-amber-500 md:text-3xl">8%</div>
                  <div className="mt-1 text-[11px] font-light uppercase tracking-wider text-neutral-500">
                    {t('ui.statLabels.annualDemandGrowth')}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-amber-500 md:text-3xl">60%</div>
                  <div className="mt-1 text-[11px] font-light uppercase tracking-wider text-neutral-500">
                    {t('ui.statLabels.currentlyImported')}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-amber-500 md:text-3xl">-30%</div>
                  <div className="mt-1 text-[11px] font-light uppercase tracking-wider text-neutral-500">
                    {t('ui.statLabels.costSavingVsImport')}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          04. QUARRY TO BAG — vertical integration 6-stage (dark)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="cement-quarry-title"
      >
        <IndustrialGrid opacity={0.03} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="02" label={t('quarryToBag.label')} dark center />
            <h2
              id="cement-quarry-title"
              className="mt-5 text-2xl font-bold tracking-tight md:text-4xl"
            >
              {t('quarryToBag.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-amber-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('quarryToBag.subtitle')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {quarryStages.map((stage: any, i: number) => {
              const Icon = PROCESS_ICONS[i % PROCESS_ICONS.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-neutral-800/60 hover:shadow-md hover:shadow-amber-500/5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-amber-500">{stage.n}</span>
                    <Icon size={18} className="text-amber-500" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">{stage.t}</h3>
                  <p className="mt-2 text-xs font-light leading-relaxed text-neutral-400">
                    {stage.d}
                  </p>
                  <div className="mt-4 border-t border-neutral-800 pt-3 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {stage.meta}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          05. KILN — large feature with specs + fuel sources (light)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="cement-kiln-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel n="03" label={t('kiln.label')} />
              <h2
                id="cement-kiln-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('kiln.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-amber-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-600 md:text-lg">
                {t('kiln.body')}
              </p>

              {/* Kiln stats */}
              <div className="mt-8 grid grid-cols-3 gap-6">
                {kilnStats.map((s: any, i: number) => (
                  <div key={i} className="border-l-2 border-amber-500/40 pl-4">
                    <div className="font-mono text-2xl font-bold text-amber-500 md:text-3xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-[11px] font-light uppercase tracking-wider text-neutral-500">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Fuel mix bars */}
              <div className="mt-10">
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  {t('ui.kilnFuelMix')}
                </div>
                <div className="mt-3 space-y-3">
                  {kilnFuelSources.map((f: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs">
                        <span className="font-light text-neutral-700">{f.name}</span>
                        <span className="font-mono font-semibold text-amber-500">{f.share}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: f.share }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full rounded-full bg-amber-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Kiln image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                <Image
                  src="/images/sections/cement-kiln.jpg"
                  alt={t('kiln.title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 to-transparent" />
                <CementAccent />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-neutral-200/40 bg-white/85 px-3 py-1.5 backdrop-blur-md">
                  <Flame size={12} className="text-amber-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
                    {t('ui.certificateMock.strength28d')} · KHD 4-STAGE
                  </span>
                </div>
              </div>

              {/* Spec table */}
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <div className="font-mono text-[10px] uppercase tracking-wider text-amber-500">
                  {t('ui.specSheet')}
                </div>
                <div className="mt-4 divide-y divide-neutral-200">
                  {kilnSpecs.map((spec: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <span className="text-xs font-light text-neutral-600">{spec.k}</span>
                      <span className="font-mono text-xs font-semibold text-neutral-950">
                        {spec.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          06. TESLA INTERACTION — Production / Quality / Logistics
              The CENTERPIECE. 3 buttons that swap the dashboard.
          ═══════════════════════════════════════════════════════════════ */}
      <section
        id="tesla"
        className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="cement-tesla-title"
      >
        <IndustrialGrid opacity={0.025} />
        <div className="relative mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n={teslaSectionN} label={t('teslaInteraction.label')} dark center />
            <h2
              id="cement-tesla-title"
              className="mt-5 text-2xl font-bold tracking-tight md:text-4xl"
            >
              {t('teslaInteraction.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-amber-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('teslaInteraction.subtitle')}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              <ArrowUpRight size={10} aria-hidden="true" />
              {teslaStatus.live} · {teslaStatus.plant}
            </div>
          </div>

          {/* Big dashboard screen — changes with tab */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'production' && (
                <motion.div
                  key="production"
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.38, ease: EASE_PREMIUM }}
                >
                  <BrowserChrome url={t('ui.dashboardUrl')} pill={teslaStatus.live}>
                    <ProductionView t={t} />
                  </BrowserChrome>
                </motion.div>
              )}
              {activeTab === 'quality' && (
                <motion.div
                  key="quality"
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.38, ease: EASE_PREMIUM }}
                >
                  <BrowserChrome url={t('ui.dashboardUrl')} pill={teslaStatus.live}>
                    <QualityView t={t} />
                  </BrowserChrome>
                </motion.div>
              )}
              {activeTab === 'logistics' && (
                <motion.div
                  key="logistics"
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.38, ease: EASE_PREMIUM }}
                >
                  <BrowserChrome url={t('ui.dashboardUrl')} pill={teslaStatus.live}>
                    <LogisticsView t={t} />
                  </BrowserChrome>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 3 buttons at the bottom — the Tesla switcher */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {teslaTabs.map((tab, i) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-label={tab.label}
                  aria-pressed={isActive}
                  className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border px-6 py-5 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 active:scale-[0.98] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                    isActive
                      ? 'border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                      : 'border-neutral-800 bg-neutral-900 hover:border-amber-500/40 hover:bg-neutral-800 hover:shadow-md hover:shadow-amber-500/5'
                  }`}
                >
                  {/* Sliding top accent — premium tesla.com detail */}
                  {isActive && (
                    <motion.span
                      layoutId="teslaTabAccent-cement"
                      className="absolute inset-x-0 top-0 h-0.5 bg-amber-500"
                      transition={{ duration: 0.32, ease: EASE_PREMIUM }}
                      aria-hidden="true"
                    />
                  )}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-1 transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-white ring-amber-500'
                        : 'bg-neutral-800 text-amber-500 ring-neutral-700 group-hover:ring-amber-500/40'
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div
                      className={`font-mono text-[10px] uppercase tracking-wider ${
                        isActive ? 'text-amber-400' : 'text-neutral-500'
                      }`}
                    >
                      {`0${i + 1}`} / 03
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
                        ? 'text-amber-400 translate-x-0'
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

      {/* ═══════════════════════════════════════════════════════════════
          07. QUALITY LAB — 3 stats + standards (light)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="cement-quality-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel n="06" label={t('qualityLab.label')} />
              <h2
                id="cement-quality-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('qualityLab.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-amber-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-600 md:text-lg">
                {t('qualityLab.body')}
              </p>

              {/* Lab stats */}
              <div className="mt-8 grid grid-cols-3 gap-6">
                {labStats.map((s: any, i: number) => (
                  <div key={i} className="border-l-2 border-amber-500/40 pl-4">
                    <div className="font-mono text-2xl font-bold text-amber-500 md:text-3xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-[11px] font-light uppercase tracking-wider text-neutral-500">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Certificate mock */}
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 ring-1 ring-amber-500/30">
                      <QrCode size={14} className="text-amber-500" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-amber-500">
                        {t('ui.certificateMock.coaLabel')} {t('ui.certificateMock.coaNumber')}
                      </div>
                      <div className="font-mono text-xs font-semibold text-neutral-950">
                        {t('ui.certificateMock.batchNumber')}
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 size={20} className="text-emerald-500" aria-hidden="true" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
                  {[
                    { k: t('ui.certificateMock.type'), v: 'CEM I 42.5N' },
                    { k: t('ui.certificateMock.strength28d'), v: '42.8 MPa' },
                    { k: t('ui.certificateMock.initialSet'), v: '142 min' },
                    { k: t('ui.certificateMock.blaine'), v: '378 m²/kg' },
                    { k: t('ui.certificateMock.so3'), v: '2.8%' },
                    { k: t('ui.certificateMock.lossOnIgnition'), v: '1.4%' },
                    { k: t('ui.certificateMock.chloride'), v: '0.012%' },
                    { k: t('ui.certificateMock.soundnessMm'), v: '0.8 mm' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <span className="text-[11px] font-light text-neutral-500">{row.k}</span>
                      <span className="font-mono text-xs font-semibold text-neutral-950">
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-neutral-200 pt-3">
                  <ShieldCheck size={12} className="text-amber-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {t('ui.certificateMock.scanTrace')}
                  </span>
                </div>
              </div>

              {/* Standards badges */}
              <div className="flex flex-wrap gap-2">
                {labStandards.map((std, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-700"
                  >
                    <CheckCircle2 size={10} className="text-amber-500" aria-hidden="true" />
                    {std}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          08. CEMENT TYPES — interactive 5-type selector (dark)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="cement-types-title"
      >
        <IndustrialGrid opacity={0.03} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="07" label={t('cementTypes.label')} dark center />
            <h2
              id="cement-types-title"
              className="mt-5 text-2xl font-bold tracking-tight md:text-4xl"
            >
              {t('cementTypes.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-amber-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('cementTypes.subtitle')}
            </p>
          </div>

          {/* Type selector chips */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {cementTypes.map((ct: any, i: number) => {
              const isActive = activeType === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveType(i)}
                  aria-label={ct.code}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-[transform,background-color,border-color,color] duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                    isActive
                      ? 'border-amber-500/60 bg-amber-500/10 text-amber-400'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-amber-500/40 hover:text-amber-400'
                  }`}
                >
                  {ct.code}
                </button>
              );
            })}
          </div>

          {/* Active type detail card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-10 grid grid-cols-1 gap-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 md:grid-cols-2 lg:p-12"
            >
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-500">
                  {cementTypes[activeType].code}
                </div>
                <h3 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                  {cementTypes[activeType].name}
                </h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-neutral-400 md:text-base">
                  {cementTypes[activeType].desc}
                </p>
                <div className="mt-8">
                  <Link
                    href="/quote?vertical=cement"
                    className="group inline-flex items-center gap-2 bg-emerald-500 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-[transform,background-color] duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    {t('hero.primaryCta')}
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                    {t('ui.cementTypeLabels.strength')}
                  </div>
                  <div className="mt-2 font-mono text-lg font-bold text-amber-400">
                    {cementTypes[activeType].strength}
                  </div>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                    {t('ui.cementTypeLabels.setting')}
                  </div>
                  <div className="mt-2 font-mono text-lg font-bold text-amber-400">
                    {cementTypes[activeType].setting}
                  </div>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                    {t('ui.cementTypeLabels.typicalUses')}
                  </div>
                  <div className="mt-2 text-xs font-light text-neutral-300">
                    {cementTypes[activeType].uses}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          09. GAMBIA PLANT — Banjul plant details + timeline (light)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="cement-gambia-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-24"
            >
              <SectionLabel n="08" label={t('gambiaPlant.label')} />
              <h2
                id="cement-gambia-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('gambiaPlant.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-amber-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-600 md:text-lg">
                {t('gambiaPlant.body')}
              </p>

              {/* Plant stats */}
              <div className="mt-8 grid grid-cols-2 gap-6">
                {gambiaStats.map((s: any, i: number) => (
                  <div key={i} className="border-l-2 border-amber-500/40 pl-4">
                    <div className="font-mono text-2xl font-bold text-amber-500 md:text-3xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-[11px] font-light uppercase tracking-wider text-neutral-500">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Image */}
              <div className="mt-8 relative aspect-[16/10] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                <Image
                  src="/images/sections/cement-factory.jpg"
                  alt={t('gambiaPlant.title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                <CementAccent />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-neutral-200/40 bg-white/85 px-3 py-1.5 backdrop-blur-md">
                  <MapPin size={12} className="text-amber-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
                    {t('ui.banjulPortDistance')} · {t('ui.totalSiteAreaValue')}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                {t('ui.plantOnline')} · {t('ui.plantOnlineDate')}
              </div>
              <div className="relative mt-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-neutral-200">
                {gambiaTimeline.map((tl: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="relative pl-10"
                  >
                    <div className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-amber-500/40 bg-white">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                    </div>
                    <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-500">
                      {tl.q}
                    </div>
                    <div className="mt-1 text-sm font-light leading-relaxed text-neutral-600 md:text-base">
                      {tl.t}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          10. WHY HARCH — 4 differentiator cards (dark, with photo)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="cement-why-title"
      >
        <IndustrialGrid opacity={0.025} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800"
            >
              <Image
                src="/images/sections/comp-cement-const.jpg"
                alt={t('whyHarch.title')}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
              <CementAccent />
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/80 px-3 py-1.5 backdrop-blur-md">
                <Building2 size={12} className="text-amber-500" aria-hidden="true" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-200">
                  {t('ui.harchCorpBacking')} · {t('ui.capitalization')}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel n="09" label={t('whyHarch.label')} dark />
              <h2
                id="cement-why-title"
                className="mt-5 text-2xl font-bold tracking-tight md:text-4xl"
              >
                {t('whyHarch.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-amber-500" />

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {whyItems.map((item: any, i: number) => {
                  const Icon = WHY_ICONS[i % WHY_ICONS.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-neutral-800/60 hover:shadow-md hover:shadow-amber-500/5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30 transition-transform group-hover:scale-105">
                        <Icon size={16} className="text-amber-500" aria-hidden="true" />
                      </div>
                      <h3 className="mt-4 text-sm font-bold text-white">{item.t}</h3>
                      <p className="mt-2 text-xs font-light leading-relaxed text-neutral-400">
                        {item.d}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          11. VERTICAL INTEGRATION — chain + benefits (light)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="cement-vi-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="10" label={t('verticalIntegration.label')} center />
            <h2
              id="cement-vi-title"
              className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
            >
              {t('verticalIntegration.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-amber-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-600 md:text-lg">
              {t('verticalIntegration.body')}
            </p>
          </div>

          {/* Chain — 5 nodes with connector */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-5">
            {viChain.map((node: any, i: number) => {
              const Icon = CHAIN_ICONS[i % CHAIN_ICONS.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative rounded-2xl border border-neutral-200 bg-neutral-50 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-amber-500">
                      {`0${i + 1}`}
                    </span>
                    <Icon size={18} className="text-amber-500" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-neutral-950">{node.t}</h3>
                  <p className="mt-2 text-xs font-light leading-relaxed text-neutral-600">
                    {node.d}
                  </p>
                  {/* Connector arrow */}
                  {i < viChain.length - 1 && (
                    <ArrowRight
                      size={14}
                      className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-amber-500/60 md:block"
                      aria-hidden="true"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Benefits — 4 cards */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {viBenefits.map((b: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-md"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/30 transition-transform group-hover:scale-105">
                  <CheckCircle2 size={14} className="text-amber-500" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-neutral-950">{b.t}</h3>
                <p className="mt-2 text-xs font-light leading-relaxed text-neutral-600">{b.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          12. COMPARISON — Harch vs Imported table (dark)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="cement-comparison-title"
      >
        <IndustrialGrid opacity={0.025} />
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="11" label={t('comparison.label')} dark center />
            <h2
              id="cement-comparison-title"
              className="mt-5 text-2xl font-bold tracking-tight md:text-4xl"
            >
              {t('comparison.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-amber-500" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/50">
                  <th className="px-6 py-4 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    {comparisonHeaders[0]}
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                    {comparisonHeaders[1]}
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    {comparisonHeaders[2]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-neutral-800/50 last:border-0 transition-colors hover:bg-neutral-800/30"
                  >
                    <td className="px-6 py-4 text-sm font-light text-neutral-400">{row[0]}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-amber-500" aria-hidden="true" />
                        {row[1]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-light text-neutral-500">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          13. APPLICATIONS — 5 use cases (light, with photo)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="cement-apps-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-24"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                <Image
                  src="/images/sections/cement-industrial.jpg"
                  alt={t('applications.title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                <CementAccent />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-neutral-200/40 bg-white/85 px-3 py-1.5 backdrop-blur-md">
                  <Construction size={12} className="text-amber-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
                    {t('ui.harchCementBadge')} · 42.5N
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel n="12" label={t('applications.label')} />
              <h2
                id="cement-apps-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('applications.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-amber-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-600 md:text-lg">
                {t('applications.body')}
              </p>

              <div className="mt-8 space-y-4">
                {applicationItems.map((app: any, i: number) => {
                  const Icon = APP_ICONS[i % APP_ICONS.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="group flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30 transition-transform group-hover:scale-105">
                        <Icon size={16} className="text-amber-500" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-neutral-950">{app.t}</h3>
                        <p className="mt-1.5 text-xs font-light leading-relaxed text-neutral-600">
                          {app.d}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          14. INNOVATION — LC3, carbon capture, geopolymer (dark)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="cement-innovation-title"
      >
        <IndustrialGrid opacity={0.03} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="13" label={t('innovation.label')} dark center />
            <h2
              id="cement-innovation-title"
              className="mt-5 text-2xl font-bold tracking-tight md:text-4xl"
            >
              {t('innovation.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-amber-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('innovation.subtitle')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {innoItems.map((item: any, i: number) => {
              const Icon = INNO_ICONS[i % INNO_ICONS.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-neutral-800/60 hover:shadow-md hover:shadow-amber-500/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30 transition-transform group-hover:scale-105">
                    <Icon size={20} className="text-amber-500" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-base font-bold text-white">{item.t}</h3>
                  <p className="mt-3 text-xs font-light leading-relaxed text-neutral-400">
                    {item.d}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Decorative banner with photo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mt-12 overflow-hidden rounded-2xl border border-neutral-800"
          >
            <div className="relative aspect-[21/9]">
              <Image
                src="/images/sections/cement-quarry.jpg"
                alt={t('innovation.title')}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 to-neutral-950/30" />
              <IndustrialGrid opacity={0.06} />
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-xl px-8 md:px-12">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500">
                    {t('innovation.label')}
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-white md:text-2xl">
                    {t('innovation.subtitle')}
                  </h3>
                  <Link
                    href="/quote?vertical=cement"
                    className="mt-6 inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
                  >
                    {t('hero.secondaryCta')}
                    <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          15. CALCULATOR — savings simulator with slider (light)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="cement-calc-title">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="14" label={t('calculator.label')} center />
            <h2
              id="cement-calc-title"
              className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
            >
              {t('calculator.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-amber-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-600 md:text-lg">
              {t('calculator.subtitle')}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 md:p-12"
          >
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {/* Slider side */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="annual-tons"
                    className="font-mono text-[10px] uppercase tracking-wider text-neutral-500"
                  >
                    {t('calculator.billLabel')}
                  </label>
                  <div className="font-mono text-2xl font-bold text-amber-500">
                    {annualTons.toLocaleString()}<span className="ml-1 text-sm font-normal text-neutral-500">t</span>
                  </div>
                </div>
                <input
                  id="annual-tons"
                  type="range"
                  min={500}
                  max={30000}
                  step={500}
                  value={annualTons}
                  onChange={(e) => setAnnualTons(Number(e.target.value))}
                  className="mt-4 w-full accent-amber-500"
                  aria-label={t('calculator.billLabel')}
                />
                <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  {tonMarks.map((m) => (
                    <span key={m}>{m.toLocaleString()}t</span>
                  ))}
                </div>
              </div>

              {/* Results side */}
              <div className="space-y-4">
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {t('calculator.monthlyLabel')}
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold text-neutral-950 md:text-3xl">
                    {monthlySaving.toLocaleString()}<span className="ml-1 text-sm font-normal text-neutral-500">MAD</span>
                  </div>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-amber-500">
                    {t('calculator.yearlyLabel')}
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold text-amber-500 md:text-3xl">
                    {yearlySaving.toLocaleString()}<span className="ml-1 text-sm font-normal text-neutral-500">MAD</span>
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-600">
                    {t('calculator.save25Label')}
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 md:text-3xl">
                    {tenYearSaving.toLocaleString()}<span className="ml-1 text-sm font-normal text-neutral-500">MAD</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-6">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="max-w-md text-xs font-light text-neutral-500">
                  {t('calculator.disclaimer')}
                </p>
                <Link
                  href="/quote?vertical=cement"
                  className="group inline-flex items-center gap-2 bg-emerald-500 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-[transform,background-color] duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {t('hero.primaryCta')}
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          16. GEOGRAPHY — production & distribution map (dark)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="cement-geo-title"
      >
        <IndustrialGrid opacity={0.025} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel n="15" label={t('geography.label')} dark />
              <h2
                id="cement-geo-title"
                className="mt-5 text-2xl font-bold tracking-tight md:text-4xl"
              >
                {t('geography.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-amber-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('geography.subtitle')}
              </p>

              {/* Country summary cards */}
              <div className="mt-8 space-y-3">
                {geoCities.slice(0, 6).map((city: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/30">
                      <MapPin size={14} className="text-amber-500" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{city.name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                        {city.type}
                      </div>
                    </div>
                    <div className="font-mono text-xs font-semibold text-amber-400">
                      {city.plants}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800"
            >
              <Image
                src="/images/real/cement-construction.jpg"
                alt={t('geography.title')}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />
              <IndustrialGrid opacity={0.05} />

              {/* Delivery zones overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="font-mono text-[10px] uppercase tracking-wider text-amber-500">
                  {t('ui.deliveryZonesHeader')}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950/80 px-3 py-2 backdrop-blur-md">
                    <div className="font-mono text-[10px] font-bold text-amber-400">
                      {t('ui.deliveryZones.gambiaTime')}
                    </div>
                    <div className="mt-1 text-[11px] font-light text-neutral-300">
                      {t('ui.deliveryZones.gambia')}
                    </div>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950/80 px-3 py-2 backdrop-blur-md">
                    <div className="font-mono text-[10px] font-bold text-amber-400">
                      {t('ui.deliveryZones.sSenegalTime')}
                    </div>
                    <div className="mt-1 text-[11px] font-light text-neutral-300">
                      {t('ui.deliveryZones.sSenegal')}
                    </div>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950/80 px-3 py-2 backdrop-blur-md">
                    <div className="font-mono text-[10px] font-bold text-amber-400">
                      {t('ui.deliveryZones.guineaBissauTime')}
                    </div>
                    <div className="mt-1 text-[11px] font-light text-neutral-300">
                      {t('ui.deliveryZones.guineaBissau')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          17. TESTIMONIALS — 3 testimonials (light, with photo banner)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="cement-testimonials-title">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 lg:items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-4"
            >
              <SectionLabel n="16" label={t('testimonials.label')} />
              <h2
                id="cement-testimonials-title"
                className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
              >
                {t('testimonials.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-amber-500" />

              <div className="mt-8 relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                <Image
                  src="/images/real/cement-factory.jpg"
                  alt={t('testimonials.title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 to-transparent" />
                <CementAccent />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-neutral-200/40 bg-white/85 px-3 py-1.5 backdrop-blur-md">
                  <Quote size={12} className="text-amber-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
                    {t('ui.harchCementBadge')}
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="lg:col-span-8 space-y-6">
              {testimonials.map((tm: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 md:p-8 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Quote size={20} className="text-amber-500" aria-hidden="true" />
                  <p className="mt-4 text-base font-light leading-relaxed text-neutral-700 md:text-lg">
                    &ldquo;{tm.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-neutral-200 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/30">
                      <HardHat size={16} className="text-amber-500" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-neutral-950">{tm.author}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                        {tm.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          18. CASE STUDIES — 3 full case studies (dark, with photo)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="cement-cases-title"
      >
        <IndustrialGrid opacity={0.03} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="17" label={t('caseStudies.label')} dark center />
            <h2
              id="cement-cases-title"
              className="mt-5 text-2xl font-bold tracking-tight md:text-4xl"
            >
              {t('caseStudies.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-amber-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('caseStudies.body')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {caseItems.map((cs: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10"
              >
                {/* Header strip with case label */}
                <div className="relative aspect-[16/9] overflow-hidden border-b border-neutral-800">
                  <Image
                    src={
                      i === 0
                        ? '/images/real/cement-industrial.jpg'
                        : i === 1
                        ? '/images/real/cement-kiln.jpg'
                        : '/images/real/cement-quarry.jpg'
                    }
                    alt={cs.t}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/80 px-3 py-1 backdrop-blur-md">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                      {t('ui.caseLabel')} {`0${i + 1}`}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white">{cs.t}</h3>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                      <MapPin size={10} aria-hidden="true" />
                      {cs.loc}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 px-3 py-2">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                        {t('ui.caseStudyLabels.year')}
                      </div>
                      <div className="mt-0.5 font-mono text-sm font-bold text-amber-400">
                        {cs.year}
                      </div>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 px-3 py-2">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                        {t('ui.caseStudyLabels.volume')}
                      </div>
                      <div className="mt-0.5 font-mono text-sm font-bold text-amber-400">
                        {cs.tons}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-light leading-relaxed text-neutral-400">
                    {cs.summary}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          19. FAQ — accordion (light)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32" aria-labelledby="cement-faq-title">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <SectionLabel n="18" label={t('faq.label')} center />
            <h2
              id="cement-faq-title"
              className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl"
            >
              {t('faq.title')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-amber-500" />
          </div>

          <div className="mt-12 space-y-3">
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
                    aria-controls={`cement-faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`font-mono text-[10px] font-bold transition-colors ${
                          isOpen ? 'text-amber-500' : 'text-neutral-400'
                        }`}
                      >
                        {`0${i + 1}`}
                      </span>
                      <span
                        className={`text-sm font-bold transition-colors md:text-base ${
                          isOpen ? 'text-amber-600' : 'text-neutral-950'
                        }`}
                      >
                        {item.q}
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={`flex-shrink-0 text-amber-500 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`cement-faq-panel-${i}`}
                        role="region"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: EASE_PREMIUM }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-neutral-200 px-6 py-4 pl-12 text-sm font-light leading-relaxed text-neutral-600">
                          {item.a}
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

      {/* ═══════════════════════════════════════════════════════════════
          20. RESOURCES — downloads (dark, with photo)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="cement-resources-title"
      >
        <IndustrialGrid opacity={0.025} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-24"
            >
              <SectionLabel n="19" label={t('resources.label')} dark />
              <h2
                id="cement-resources-title"
                className="mt-5 text-2xl font-bold tracking-tight md:text-4xl"
              >
                {t('resources.title')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-amber-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('resources.subtitle')}
              </p>

              <div className="mt-8 relative aspect-[16/10] overflow-hidden rounded-2xl border border-neutral-800">
                <Image
                  src="/images/newsroom/cement-permits-gambia.jpg"
                  alt={t('resources.title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 to-transparent" />
                <CementAccent />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/80 px-3 py-1.5 backdrop-blur-md">
                  <FileText size={12} className="text-amber-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-200">
                    {t('ui.harchCementBadge')} · {t('ui.estYear')}
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              {resourceItems.map((r: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group flex items-start gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-neutral-800/60 hover:shadow-md hover:shadow-amber-500/5"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30 transition-transform group-hover:scale-105">
                    <FileText size={16} className="text-amber-500" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{r.t}</h3>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                        {r.type}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-light leading-relaxed text-neutral-400">
                      {r.d}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition-[transform,border-color,color] duration-200 hover:border-amber-500/40 hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 active:scale-[0.92]"
                    aria-label={t('resources.download')}
                  >
                    <Download size={14} aria-hidden="true" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          21. FINAL CTA — emerald CTA + phone (dark, with photo banner)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32"
        aria-labelledby="cement-final-cta-title"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/newsroom/investment-pipeline-announcement.jpg"
            alt=""
            fill
            className="object-cover opacity-30"
            sizes="100vw"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/85 to-neutral-950" />
        </div>
        <IndustrialGrid opacity={0.05} />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-amber-500/5 px-4 py-1.5 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-400">
                {t('ui.harchCementBadge')}
              </span>
            </div>

            <h2
              id="cement-final-cta-title"
              className="mt-8 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
            >
              {t('finalCta.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-300 md:text-lg">
              {t('finalCta.subtitle')}
            </p>

            {/* Final CTA stats */}
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
              <div className="border-t border-neutral-800 pt-4">
                <div className="font-mono text-2xl font-bold text-amber-400">48h</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  {t('ui.finalCtaStats.quoteTurnaround')}
                </div>
              </div>
              <div className="border-t border-neutral-800 pt-4">
                <div className="font-mono text-2xl font-bold text-amber-400">50 kg</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  {t('ui.finalCtaStats.freeSampleBag')}
                </div>
              </div>
              <div className="border-t border-neutral-800 pt-4">
                <div className="font-mono text-2xl font-bold text-amber-400">12 mo</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  {t('ui.finalCtaStats.priceLock')}
                </div>
              </div>
              <div className="border-t border-neutral-800 pt-4">
                <div className="font-mono text-2xl font-bold text-amber-400">ISO 9001</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  {t('ui.finalCtaStats.qualitySystem')}
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-stretch justify-center gap-4 sm:flex-row">
              <Link
                href="/quote?vertical=cement"
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('finalCta.primary')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href="tel:+212684440682"
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
              >
                <Phone size={14} aria-hidden="true" />
                {t('finalCta.secondary')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          22. FOOTER — sign-off with industrial grid (dark, sticky bottom)
          ═══════════════════════════════════════════════════════════════ */}
      <footer className="relative mt-auto overflow-hidden bg-neutral-950 py-12 text-white">
        <IndustrialGrid opacity={0.04} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/30">
                <Building2 size={16} className="text-amber-500" aria-hidden="true" />
              </div>
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
                  {t('ui.harchCementBadge')}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                  {t('ui.footerSignature')}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-amber-400"
              >
                <ArrowLeft
                  size={12}
                  className="transition-transform group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
                {t('ui.backToHarchCorp')}
              </Link>
              <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                {t('ui.casablancaMorocco')}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                {t('ui.capitalization')}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-900 pt-6 text-center font-mono text-[10px] uppercase tracking-wider text-neutral-700">
            {t('ui.subsidiaryOf')} · © {new Date().getFullYear()} Harch Corp
          </div>
        </div>
      </footer>
    </main>
  );
}

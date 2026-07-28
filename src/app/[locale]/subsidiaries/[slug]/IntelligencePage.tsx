'use client';

/* ═══════════════════════════════════════════════════════════════
   HARCH · INTELLIGENCE — Sovereign AI Compute Landing Page (v5)
   Harch Corp Design System V2 compliant:
     · bg-neutral-950 (dark) · bg-white / bg-neutral-50 (light)
     · Accent (Intelligence): violet-500 — labels, key stats, icons, hovers
     · Brand thread: emerald-500 — primary CTAs, renewable/carbon presence
     · Inter (font-sans) for display/body · Space Mono (font-mono) for data
     · UNIQUE DETAIL: circuit traces (subtle SVG) — Intelligence motif
     · NO wave dividers (those belong to Water subsidiary only)
     · TESLA INTERACTION: 3 buttons (Compute / Storage / Inference) swap
       a large live dashboard mockup. Centerpiece of the page.
     · 'use client' · useTranslations('intelTesla') · EN + FR
   ═══════════════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Phone, ShieldCheck, Cpu, Zap, Activity, Server,
  Leaf, Wind, Sun, Lock, CheckCircle2, ChevronDown, FileText, Download,
  Sparkles, Quote, MapPin, CircuitBoard, Cable, GitBranch, Rocket,
  Beaker, ShoppingBag, Film, Atom, Clock, Radio, TrendingDown, Database,
  Network, HardHat, Settings, ArrowRightLeft, AlertTriangle, Layers, Globe2,
} from 'lucide-react';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SECTOR_ICONS = [Cpu, Activity, Leaf, ShieldCheck, Beaker, ShoppingBag, Film, Lock] as const;
const INNO_ICONS = [Sparkles, CircuitBoard, Atom, Rocket] as const;
const WHY_ICONS = [ShieldCheck, Leaf, TrendingDown, Server] as const;
const DEPLOY_ICONS = [HardHat, Settings, Network, ArrowRightLeft, Rocket] as const;
const TESLA_TAB_ICONS = [Cpu, Database, Zap] as const;

/* Geography card photos — indexed by city name (photos are not translated) */
const GEO_PHOTOS: Record<string, string> = {
  Dakhla: '/images/sections/intelligence-rack.jpg',
  Casablanca: '/images/real/intel-control-room.jpg',
  Tanger: '/images/intelligence/harchos-tanger.png',
  Dakar: '/images/sections/intelligence-server-room.jpg',
};

/* ═══════════════════════════════════════════════════════════════
   Reusable bits — Harch-branded, Intelligence accent = violet
   ═══════════════════════════════════════════════════════════════ */

function SectionLabel({ n, label, dark = false }: { n?: string; label: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
      {n && <span className={dark ? 'text-neutral-600' : 'text-neutral-400'}>{`// ${n}`}</span>}
      <span className="h-px w-8 bg-violet-500/60" />
      <span className="text-violet-500">{label}</span>
    </div>
  );
}

/* Circuit-trace lines — Intelligence subsidiary UNIQUE motif.
   PCB-style geometric traces with via pads. NOT a wave divider. */
function CircuitTrace({ dense = false }: { dense?: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: dense ? 0.14 : 0.09 }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <g stroke="#8b5cf6" strokeWidth="1" fill="none">
        <path d="M0 25% L18% 25% L22% 20% L42% 20% L46% 30% L62% 30% L66% 18% L100% 18%" />
        <path d="M0 55% L12% 55% L16% 60% L34% 60% L38% 50% L58% 50% L62% 65% L78% 65% L82% 48% L100% 48%" />
        <path d="M0 82% L24% 82% L28% 75% L48% 75% L52% 88% L70% 88% L74% 72% L100% 72%" />
        {dense && (
          <>
            <path d="M0 38% L30% 38% L34% 42% L56% 42% L60% 36% L100% 36%" />
            <path d="M0 68% L20% 68% L24% 64% L44% 64% L48% 70% L66% 70% L70% 60% L100% 60%" />
          </>
        )}
      </g>
      <g fill="#8b5cf6">
        <circle cx="18%" cy="25%" r="2.5" /><circle cx="42%" cy="20%" r="2.5" />
        <circle cx="62%" cy="30%" r="2.5" /><circle cx="12%" cy="55%" r="2.5" />
        <circle cx="34%" cy="60%" r="2.5" /><circle cx="58%" cy="50%" r="2.5" />
        <circle cx="78%" cy="65%" r="2.5" /><circle cx="24%" cy="82%" r="2.5" />
        <circle cx="48%" cy="75%" r="2.5" /><circle cx="70%" cy="88%" r="2.5" />
        {dense && (
          <>
            <circle cx="34%" cy="42%" r="2" /><circle cx="60%" cy="36%" r="2" />
            <circle cx="48%" cy="70%" r="2" /><circle cx="70%" cy="60%" r="2" />
          </>
        )}
      </g>
    </svg>
  );
}

function ChipAccent() {
  return (
    <svg className="pointer-events-none absolute right-6 top-6 h-12 w-12 text-violet-500/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
    </svg>
  );
}

function TerminalWindow({ title, children, accent = 'violet' }: { title: string; children: React.ReactNode; accent?: 'violet' | 'emerald' }) {
  const headerColor = { violet: 'text-violet-400', emerald: 'text-emerald-400' }[accent];
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <span className={`ml-3 font-mono text-xs ${headerColor}`}>{title}</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">live</span>
      </div>
      <div className="font-mono text-xs leading-relaxed sm:text-sm">{children}</div>
    </div>
  );
}

/* Sparkline bars — shared across Tesla dashboard metric cards */
function SparklineBars({ values, bg, delay = 0 }: { values: number[]; bg: string; delay?: number }) {
  return (
    <div className="mt-auto flex h-12 items-end gap-1 pt-3">
      {values.map((h, j) => (
        <motion.div
          key={j}
          className={`flex-1 rounded-sm ${bg}`}
          style={{ opacity: 0.4 }}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ delay: delay + j * 0.04, duration: 0.4 }}
        />
      ))}
    </div>
  );
}

/* MetricCard — shared by all 3 Tesla dashboard views */
function MetricCard({ label, value, bg, text, spark, delay }: { label: string; value: string; bg: string; text: string; spark: number[]; delay: number }) {
  return (
    <div className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900 p-3 md:p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-light uppercase tracking-wider text-neutral-500 md:text-xs">{label}</span>
        <span className={`h-2 w-2 rounded-full ${bg} animate-pulse`} />
      </div>
      <div className={`mt-2 font-mono text-lg font-bold ${text} md:text-2xl`}>{value}</div>
      <SparklineBars values={spark} bg={bg} delay={delay} />
    </div>
  );
}

/* DashboardBanner — shared image header for each Tesla view */
function DashboardBanner({ src, alt, badge, Icon }: { src: string; alt: string; badge: string; Icon: typeof Cpu }) {
  return (
    <div className="relative h-32 overflow-hidden border-b border-neutral-800 sm:h-40">
      <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
      <div className="absolute bottom-3 left-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-violet-400" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300 sm:text-xs">{badge}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TESLA DASHBOARD VIEWS — Compute / Storage / Inference
   Each is a full mockup that swaps when the user clicks a tab.
   ═══════════════════════════════════════════════════════════════ */

const VIOLET = { bg: 'bg-violet-400', text: 'text-violet-300' };
const EMERALD = { bg: 'bg-emerald-400', text: 'text-emerald-300' };

/* View 1: COMPUTE — GPU utilization dashboard */
function ComputeView({
  rack, metrics, badge, imageAlt, rackLabel, readyLabel, terminalTitle, codeLines, tick, t,
}: {
  rack: { id: string; util: number; temp: string; status: string }[];
  metrics: { label: string; value: string }[];
  badge: string; imageAlt: string; rackLabel: string; readyLabel: string;
  terminalTitle: string; codeLines: string[]; tick: number;
  t: (k: string) => string;
}) {
  const cardColors = [VIOLET, VIOLET, EMERALD, EMERALD];
  return (
    <motion.div key="compute" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}>
      <DashboardBanner src="/images/intelligence/harchos-gpu-cluster.png" alt={imageAlt} badge={badge} Icon={CircuitBoard} />
      <div className="bg-neutral-950 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((m, i) => (
            <MetricCard key={i} label={m.label} value={m.value} bg={cardColors[i % 4].bg} text={cardColors[i % 4].text} spark={[40, 65, 50, 75, 60, 85, 70, 95, 80, 90]} delay={i * 0.1} />
          ))}
        </div>

        {/* GPU rack visualization — 8 nodes with live util bars */}
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-violet-400" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-violet-400">{rackLabel}</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">{readyLabel}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {rack.map((node, i) => {
              const utilColor = node.util > 80 ? 'bg-emerald-400' : node.util > 50 ? 'bg-violet-400' : 'bg-neutral-600';
              const liveUtil = Math.max(20, Math.min(99, node.util + (tick % 7) - 3));
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-lg border border-neutral-800 bg-neutral-900 p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400">{node.id}</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${node.status === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} aria-hidden="true" />
                  </div>
                  <div className="mt-2 flex h-16 items-end rounded bg-neutral-950 p-1">
                    <motion.div className={`w-full rounded-sm ${utilColor}`} initial={{ height: 0 }} animate={{ height: `${liveUtil}%` }} transition={{ duration: 0.6, delay: i * 0.06 }} />
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] text-violet-300">{liveUtil}%</div>
                  <div className="font-mono text-[9px] text-neutral-500">{node.temp}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Terminal provisioning log */}
        <div className="mt-4">
          <TerminalWindow title={terminalTitle} accent="violet">
            <div className="overflow-x-auto bg-neutral-950 p-4">
              {codeLines.map((line, i) => {
                const isCmd = line.startsWith('$');
                const isOk = line.includes('ok') || line.includes('verified') || line.includes('nominal');
                return (
                  <div key={i} className={`whitespace-pre ${isCmd ? 'text-violet-300' : isOk ? 'text-emerald-400' : 'text-neutral-400'}`}>
                    {line}
                    {isCmd && i === codeLines.length - 1 && <span className="ml-1 inline-block h-3 w-2 animate-pulse bg-violet-400 align-middle" />}
                  </div>
                );
              })}
            </div>
          </TerminalWindow>
        </div>

        {/* Telemetry footer */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-violet-300">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            {t('ui.scaleEvent')}
            <span className="font-mono text-lg font-bold text-white">87.4<span className="text-xs font-normal text-neutral-500">{t('ui.secondsSuffix')}</span></span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{t('ui.kubectlPrompt')}</span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-emerald-400">{t('ui.podsReady')}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* View 2: STORAGE — capacity, IOPS, replication topology */
function StorageView({
  metrics, badge, imageAlt, tiersLabel, replicationLabel, tiers, zones,
}: {
  metrics: { label: string; value: string }[];
  badge: string; imageAlt: string; tiersLabel: string; replicationLabel: string;
  tiers: { name: string; cap: string; used: number; note: string }[];
  zones: { name: string; status: string; lag: string }[];
}) {
  const cardColors = [VIOLET, VIOLET, EMERALD, EMERALD];
  return (
    <motion.div key="storage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}>
      <DashboardBanner src="/images/intelligence/harchos-fibre.png" alt={imageAlt} badge={badge} Icon={Cable} />
      <div className="bg-neutral-950 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((m, i) => (
            <MetricCard key={i} label={m.label} value={m.value} bg={cardColors[i % 4].bg} text={cardColors[i % 4].text} spark={[55, 62, 58, 70, 65, 78, 72, 84, 80, 88]} delay={i * 0.1} />
          ))}
        </div>

        {/* Storage tiers — capacity bars */}
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-violet-400" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-violet-400">{tiersLabel}</span>
          </div>
          <div className="space-y-4">
            {tiers.map((tier, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-sm font-semibold text-white">{tier.name}</span>
                    <span className="font-mono text-xs text-neutral-500">{tier.cap}</span>
                  </div>
                  <span className="font-mono text-xs text-violet-300">{tier.used}% used</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400" initial={{ width: 0 }} animate={{ width: `${tier.used}%` }} transition={{ duration: 0.8, delay: i * 0.1, ease: EASE_OUT_EXPO }} />
                </div>
                <div className="mt-1.5 font-mono text-[10px] text-neutral-500">{tier.note}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Replication topology — 3 zones */}
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-violet-400" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-violet-400">{replicationLabel}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {zones.map((z, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-white">{z.name}</span>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                </div>
                <div className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">{z.status}</div>
                <div className="mt-0.5 font-mono text-[10px] text-neutral-500">lag {z.lag}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* View 3: INFERENCE — endpoints, latency, deploy log */
function InferenceView({
  metrics, badge, imageAlt, endpointsLabel, endpointHeaders, endpointRows, deployLabel, deployLines,
}: {
  metrics: { label: string; value: string }[];
  badge: string; imageAlt: string; endpointsLabel: string;
  endpointHeaders: string[]; endpointRows: string[][];
  deployLabel: string; deployLines: string[];
}) {
  const cardColors = [VIOLET, EMERALD, EMERALD, VIOLET];
  return (
    <motion.div key="inference" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}>
      <DashboardBanner src="/images/intelligence/harchos-ops-center.png" alt={imageAlt} badge={badge} Icon={Activity} />
      <div className="bg-neutral-950 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((m, i) => (
            <MetricCard key={i} label={m.label} value={m.value} bg={cardColors[i % 4].bg} text={cardColors[i % 4].text} spark={[30, 48, 42, 60, 52, 68, 58, 74, 66, 82]} delay={i * 0.1} />
          ))}
        </div>

        {/* Live endpoints table */}
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-violet-400" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-violet-400">{endpointsLabel}</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">● 24/24 live</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800">
                  {endpointHeaders.map((h, i) => (
                    <th key={i} className={`px-2 py-2 font-mono text-[10px] uppercase tracking-wider ${i === 0 ? 'text-neutral-500' : 'text-violet-400'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {endpointRows.map((row, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="border-b border-neutral-900 last:border-0 hover:bg-neutral-900/50">
                    {row.map((cell, j) => {
                      const isEndpoint = j === 0;
                      const isStatus = j === row.length - 1;
                      return (
                        <td key={j} className={`px-2 py-2.5 font-mono ${isEndpoint ? 'text-violet-300' : isStatus ? 'text-emerald-400' : 'text-neutral-400'}`}>
                          {isStatus ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              </span>
                              {cell}
                            </span>
                          ) : cell}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deployment log */}
        <div className="mt-4">
          <TerminalWindow title={deployLabel} accent="emerald">
            <div className="overflow-x-auto bg-neutral-950 p-4">
              {deployLines.map((line, i) => {
                const isCmd = line.startsWith('$');
                const isLive = line.includes('live');
                return (
                  <div key={i} className={`whitespace-pre ${isCmd ? 'text-violet-300' : isLive ? 'text-emerald-400' : 'text-neutral-400'}`}>
                    {line}
                    {isCmd && i === deployLines.length - 1 && <span className="ml-1 inline-block h-3 w-2 animate-pulse bg-violet-400 align-middle" />}
                  </div>
                );
              })}
            </div>
          </TerminalWindow>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export default function IntelligencePage() {
  const t = useTranslations('intelTesla');

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [teslaView, setTeslaView] = useState<0 | 1 | 2>(0);
  const [gpuHours, setGpuHours] = useState(2000);
  const monthlyHarch = Math.round(gpuHours * 1.8);
  const monthlyAws = Math.round(gpuHours * 3.5);
  const save3yr = (monthlyAws - monthlyHarch) * 12 * 3;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => (n + 1) % 100), 1500);
    return () => clearInterval(id);
  }, []);

  /* Translation arrays (typed) */
  const heroStats = t.raw('hero.stats') as { num: string; label: string }[];
  const sovereignLaws = t.raw('sovereignAi.laws') as { code: string; name: string; desc: string }[];
  const gpuSpecHeaders = t.raw('gpuCluster.specHeaders') as string[];
  const gpuSpecRows = t.raw('gpuCluster.specRows') as string[][];
  const gpuCodeLines = t.raw('gpuCluster.codeLines') as string[];
  const africanLanguages = t.raw('africanLlms.languages') as string[];
  const africanModels = t.raw('africanLlms.models') as { name: string; size: string; lang: string; notes: string }[];
  const hubLegend = t.raw('hubs.mapLegend') as { color: string; label: string; count: string }[];
  const hubCables = t.raw('hubs.cables') as string[];
  const carbonStats = t.raw('carbonFootprint.stats') as { num: string; label: string }[];
  const deploymentSteps = t.raw('deploymentFlow.steps') as { n: string; t: string; code: string; d: string }[];
  const comparisonHeaders = t.raw('comparison.headers') as string[];
  const comparisonRows = t.raw('comparison.rows') as string[][];
  const processSteps = t.raw('process.steps') as { n: string; t: string; d: string; time: string }[];
  const pricingPlans = t.raw('pricing.plans') as { name: string; tagline: string; price: string; size: string; features: string[]; cta: string; featured?: boolean }[];
  const innoItems = t.raw('innovation.items') as { t: string; d: string }[];
  const applicationItems = t.raw('applications.items') as { t: string; d: string }[];
  const whyItems = t.raw('whyHarch.items') as { t: string; d: string }[];
  const testimonials = t.raw('testimonials.items') as { quote: string; author: string; role: string }[];
  const faqItems = t.raw('faq.items') as { q: string; a?: string; d?: string }[];
  const resourceItems = t.raw('resources.items') as { t: string; d: string; type: string }[];
  const geoCities = t.raw('geography.cities') as { name: string; type: string; plants: string }[];
  const sectorItems = t.raw('sectors.items') as string[];
  const dashboardRack = t.raw('dashboard.rack') as { id: string; util: number; temp: string; status: string }[];
  const hardwareStats = t.raw('hardware.stats') as { num: string; label: string }[];

  /* Tesla dashboard data */
  const teslaTabs = t.raw('teslaDashboard.tabs') as string[];
  const teslaHints = [t('ui.teslaComputeHint'), t('ui.teslaStorageHint'), t('ui.teslaInferenceHint')];
  const compute = {
    metrics: t.raw('teslaDashboard.compute.metrics') as { label: string; value: string }[],
    badge: t('teslaDashboard.compute.badge'),
    imageAlt: t('teslaDashboard.compute.imageAlt'),
    rackLabel: t('teslaDashboard.compute.rackLabel'),
    readyLabel: t('teslaDashboard.compute.readyLabel'),
    terminalTitle: t('teslaDashboard.compute.terminalTitle'),
    codeLines: t.raw('teslaDashboard.compute.codeLines') as string[],
  };
  const storage = {
    metrics: t.raw('teslaDashboard.storage.metrics') as { label: string; value: string }[],
    badge: t('teslaDashboard.storage.badge'),
    imageAlt: t('teslaDashboard.storage.imageAlt'),
    tiersLabel: t('teslaDashboard.storage.tiersLabel'),
    replicationLabel: t('teslaDashboard.storage.replicationLabel'),
    tiers: t.raw('teslaDashboard.storage.tiers') as { name: string; cap: string; used: number; note: string }[],
    zones: t.raw('teslaDashboard.storage.zones') as { name: string; status: string; lag: string }[],
  };
  const inference = {
    metrics: t.raw('teslaDashboard.inference.metrics') as { label: string; value: string }[],
    badge: t('teslaDashboard.inference.badge'),
    imageAlt: t('teslaDashboard.inference.imageAlt'),
    endpointsLabel: t('teslaDashboard.inference.endpointsLabel'),
    endpointHeaders: t.raw('teslaDashboard.inference.endpointHeaders') as string[],
    endpointRows: t.raw('teslaDashboard.inference.endpointRows') as string[][],
    deployLabel: t('teslaDashboard.inference.deployLabel'),
    deployLines: t.raw('teslaDashboard.inference.deployLines') as string[],
  };

  return (
    <div className="bg-white font-sans text-neutral-950 antialiased selection:bg-violet-500 selection:text-white">

      {/* ═══════════ 1. HERO ═══════════ */}
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-neutral-950">
        <Image src="/images/intelligence/harchos-hero.png" alt={t('hero.heroImageAlt')} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/55 to-neutral-950/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.15),_transparent_55%)]" />
        <CircuitTrace dense />
        <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.4) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)' }} />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-16 md:px-12 md:py-24">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center gap-3 md:items-start">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-5 py-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
              </span>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-neutral-200">{t('ui.harchIntelligence')}</span>
              <span className="h-3 w-px bg-neutral-700" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400">{t('ui.casablancaDakhlaDakar')}</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">{t('hero.badge')}</span>
          </motion.div>

          <div className="flex flex-1 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE_OUT_EXPO }} className="mx-auto max-w-5xl text-center md:mx-0 md:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">{t('hero.title')}</h1>
              <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-300 md:mx-0 md:text-xl">{t('hero.subtitle')}</p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: EASE_OUT_EXPO }} className="mx-auto w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-12">
              {heroStats.map((s, i) => (
                <div key={i} className="border-l-2 border-violet-500/50 pl-5 text-left">
                  <div className="font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl" style={{ textShadow: '0 0 24px rgba(139,92,246,0.5)' }}>{s.num}</div>
                  <div className="mt-1 text-xs font-light uppercase tracking-wider text-neutral-400 md:text-sm">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center md:justify-end">
              <Link href="/quote?vertical=intelligence" aria-label={`${t('finalCta.primary')} — Harch Intelligence`} className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">
                {t('finalCta.primary')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a href="tel:+212684440682" aria-label={`${t('finalCta.secondary')} ${t('ui.callCta')}`} className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <Phone size={14} aria-hidden="true" />
                {t('finalCta.secondary')}
              </a>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
      </section>

      {/* ═══════════ 2. OVERVIEW ═══════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <ChipAccent />
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-12 md:gap-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }} className="md:col-span-5">
            <SectionLabel n="01" label={t('overview.label')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('overview.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }} className="md:col-span-7">
            <p className="text-lg font-light leading-relaxed text-neutral-500 md:text-xl">{t('overview.body')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {(t.raw('ui.hubTags') as string[]).map((hub, i) => (
                <span key={i} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-mono text-xs text-neutral-700">{hub}</span>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="mx-auto mt-16 max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }} className="relative h-[40vh] min-h-[280px] overflow-hidden rounded-2xl border border-neutral-200">
            <Image src="/images/sections/intelligence-exterior.jpg" alt={t('overview.exteriorAlt')} fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-transparent to-transparent" />
            <div className="absolute left-6 top-6 max-w-md text-white">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300">{t('ui.facilityTag')}</div>
              <div className="mt-2 font-mono text-xl font-bold">{t('ui.dakhlaFlagship')}</div>
              <div className="mt-1 text-sm font-light text-neutral-300">{t('ui.dakhlaDetail')}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 3. SOVEREIGN AI ═══════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139,92,246,0.10) 0%, transparent 50%)' }} />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:gap-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}>
            <SectionLabel n="02" label={t('sovereignAi.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('sovereignAi.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">{t('sovereignAi.body')}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-wider text-neutral-500">
              <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />{t('ui.law09_08')}</span>
              <span className="text-neutral-700">·</span>
              <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />{t('ui.sovereignByDesign')}</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_EXPO }} className="space-y-3">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-violet-400">{t('sovereignAi.lawTitle')}</p>
            {sovereignLaws.map((law, i) => (
              <div key={i} className="group flex items-start gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-neutral-800/60 hover:shadow-lg hover:shadow-violet-500/5">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/5 font-mono text-[10px] font-bold text-violet-300">{law.code}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{law.name}</span>
                    {(law.code === 'US-CLOUD' || law.code === 'GDPR-ART49') && (
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">{t('ui.lawPass')}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-light leading-relaxed text-neutral-400">{law.desc}</p>
                </div>
                <ShieldCheck className="mt-1 h-4 w-4 flex-shrink-0 text-violet-400/60" aria-hidden="true" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 4. TESLA DASHBOARD — 3 buttons swap a large dashboard ═══════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="absolute inset-0">
          <Image src="/images/intelligence/harchos-dashboard.png" alt="" fill className="object-cover opacity-15" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/95 via-neutral-950/90 to-neutral-950/95" />
        </div>
        <CircuitTrace />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-600">{'// 03'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('teslaDashboard.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('teslaDashboard.title')}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">{t('teslaDashboard.body')}</p>
          </div>

          {/* Large dashboard mockup — swaps on tab click */}
          <motion.div id="intel-tesla-panel" role="tabpanel" aria-labelledby="intel-tesla-tab-0" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_OUT_EXPO }} className="mt-16 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-950/60 px-4 py-3">
              <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-neutral-700" /><div className="h-3 w-3 rounded-full bg-neutral-700" /><div className="h-3 w-3 rounded-full bg-neutral-700" /></div>
              <div className="ml-4 flex-1 rounded-md bg-neutral-950/60 px-3 py-1 font-mono text-xs text-neutral-400">{t('ui.dashboardUrl')}</div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {t('ui.liveStatus')}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {teslaView === 0 && (
                <ComputeView rack={dashboardRack} metrics={compute.metrics} badge={compute.badge} imageAlt={compute.imageAlt} rackLabel={compute.rackLabel} readyLabel={compute.readyLabel} terminalTitle={compute.terminalTitle} codeLines={compute.codeLines} tick={tick} t={t} />
              )}
              {teslaView === 1 && (
                <StorageView metrics={storage.metrics} badge={storage.badge} imageAlt={storage.imageAlt} tiersLabel={storage.tiersLabel} replicationLabel={storage.replicationLabel} tiers={storage.tiers} zones={storage.zones} />
              )}
              {teslaView === 2 && (
                <InferenceView metrics={inference.metrics} badge={inference.badge} imageAlt={inference.imageAlt} endpointsLabel={inference.endpointsLabel} endpointHeaders={inference.endpointHeaders} endpointRows={inference.endpointRows} deployLabel={inference.deployLabel} deployLines={inference.deployLines} />
              )}
            </AnimatePresence>
          </motion.div>

          {/* 3 Tesla-style buttons — swap the dashboard above */}
          <div className="mt-8">
            <div role="tablist" aria-label={t('ui.teslaSwitchAria')} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {teslaTabs.map((tab, i) => {
                const Icon = TESLA_TAB_ICONS[i];
                const active = teslaView === i;
                return (
                  <button key={i} type="button" role="tab" aria-selected={active} aria-controls="intel-tesla-panel" id={`intel-tesla-tab-${i}`} onClick={() => setTeslaView(i as 0 | 1 | 2)} className={`group flex items-center gap-4 rounded-xl border p-5 text-left transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${active ? 'border-violet-500/60 bg-violet-500/10 shadow-lg shadow-violet-500/10' : 'border-neutral-800 bg-neutral-900 hover:border-violet-500/30 hover:bg-neutral-800/60 hover:-translate-y-0.5'}`}>
                    <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${active ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40' : 'bg-neutral-800 text-neutral-400 group-hover:text-violet-300'}`}>
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className={`flex items-center gap-2 font-mono text-xs uppercase tracking-wider ${active ? 'text-violet-300' : 'text-neutral-400'}`}>
                        <span>{t('ui.teslaViewLabel')} {String(i + 1).padStart(2, '0')}</span>
                        {active && <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" /></span>}
                      </div>
                      <div className={`mt-1 text-base font-bold ${active ? 'text-white' : 'text-neutral-200'}`}>{tab}</div>
                      <div className="mt-0.5 text-xs font-light text-neutral-500">{teslaHints[i]}</div>
                    </div>
                    <ArrowRight size={16} className={`flex-shrink-0 transition-transform ${active ? 'translate-x-1 text-violet-400' : 'text-neutral-600'}`} aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            {/* Live status strip — reinforces the "live dashboard" feel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-neutral-500"
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                {t('ui.liveStatus')}
              </span>
              <span className="text-neutral-700">·</span>
              <span className="text-violet-400">{t('ui.dakhlaFlagship')}</span>
              <span className="text-neutral-700">·</span>
              <span>{t('ui.nodesReady')}</span>
              <span className="text-neutral-700">·</span>
              <span className="text-emerald-400">{t('ui.renewable100')}</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 5. HARDWARE — full-bleed image + stats panel ═══════════ */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-neutral-950">
          <Image src="/images/intelligence/harchos-architecture.png" alt={t('hardware.title')} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/80 via-neutral-950/50 to-neutral-950/20" />
          <div className="relative z-10 flex h-full items-center px-6 md:px-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }} className="max-w-2xl">
              <SectionLabel n="04" label={t('hardware.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl">{t('hardware.title')}</h2>
              <div className="mt-6 h-0.5 w-16 bg-violet-500" />
              <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-neutral-300 md:text-lg">{t('hardware.body')}</p>
            </motion.div>
          </div>
        </div>
        <div className="bg-neutral-950 py-16 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {hardwareStats.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="border-l-2 border-violet-500/50 pl-6">
                  <div className="font-mono text-3xl font-bold text-violet-400 md:text-4xl">{s.num}</div>
                  <div className="mt-2 text-sm font-light leading-relaxed text-neutral-400">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 6. GPU CLUSTER — spec table + terminal ═══════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <ChipAccent />
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-3xl">
            <SectionLabel n="05" label={t('gpuCluster.label')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('gpuCluster.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">{t('gpuCluster.body')}</p>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950 text-white">
                    {gpuSpecHeaders.map((h, i) => (
                      <th key={i} className={`px-4 py-3 font-mono text-xs uppercase tracking-wider ${i === 0 ? 'text-neutral-500' : 'text-violet-400'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gpuSpecRows.map((row, i) => (
                    <tr key={i} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50">
                      {row.map((cell, j) => (
                        <td key={j} className={`px-4 py-3 font-mono ${j === 0 ? 'text-xs font-semibold uppercase tracking-wider text-neutral-950' : 'text-neutral-600'}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }} className="mt-6">
            <TerminalWindow title={t('gpuCluster.codeLabel')} accent="violet">
              <div className="overflow-x-auto bg-neutral-950 p-4">
                {gpuCodeLines.map((line, i) => {
                  const isCmd = line.startsWith('$');
                  const isPrompt = line.startsWith('ubuntu@');
                  const isOk = line.includes('ok') || line.includes('ready');
                  return (
                    <div key={i} className={`whitespace-pre ${isCmd ? 'text-violet-300' : isPrompt ? 'text-violet-300' : isOk ? 'text-emerald-400' : 'text-neutral-400'}`}>
                      {line}
                      {isCmd && i === gpuCodeLines.length - 1 && <span className="ml-1 inline-block h-3 w-2 animate-pulse bg-violet-400 align-middle" />}
                    </div>
                  );
                })}
              </div>
            </TerminalWindow>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 7. AFRICAN LLMs ═══════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="absolute inset-0">
          <Image src="/images/blog/sovereign-ai-infrastructure.jpg" alt="" fill className="object-cover opacity-20" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-950/85 to-neutral-950/95" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-3xl">
            <SectionLabel n="06" label={t('africanLlms.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('africanLlms.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">{t('africanLlms.body')}</p>
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 flex flex-wrap gap-2">
            {africanLanguages.map((lang, i) => (
              <span key={i} className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 font-mono text-xs text-emerald-300">{lang}</span>
            ))}
            <span className="rounded-full border border-neutral-800 bg-neutral-950/60 px-3 py-1.5 font-mono text-xs text-neutral-500">{t('ui.moreLanguagesSuffix')}</span>
          </motion.div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {africanModels.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT_EXPO }} className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:-translate-y-1 hover:border-violet-500/40 hover:bg-neutral-800 hover:shadow-xl hover:shadow-violet-500/10">
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-violet-500/10 blur-2xl transition-all group-hover:bg-violet-500/20" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-400">{m.size}</span>
                    <GitBranch className="h-3.5 w-3.5 text-violet-400/60" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 font-mono text-base font-semibold text-white">{m.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-emerald-300/80">{m.lang}</p>
                  <p className="mt-3 text-xs font-light leading-relaxed text-neutral-400">{m.notes}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 8. RELIABILITY — full-bleed ops center ═══════════ */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-neutral-950">
          <Image src="/images/intelligence/harchos-ops-center.png" alt={t('reliability.title')} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/60 to-neutral-950/30" />
          <div className="relative z-10 flex h-full items-center px-6 md:px-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }} className="max-w-2xl">
              <SectionLabel n="07" label={t('reliability.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl">{t('reliability.title')}</h2>
              <div className="mt-6 h-0.5 w-16 bg-violet-500" />
              <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-neutral-300 md:text-lg">{t('reliability.body')}</p>
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-emerald-300">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {t('ui.operationsCenter')}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 9. 5 HUBS — mesh map + cables panel ═══════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-3xl">
            <SectionLabel n="08" label={t('hubs.label')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('hubs.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">{t('hubs.body')}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }} className="lg:col-span-7">
              <div className="relative h-[420px] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950">
                <Image src="/images/intelligence/harchos-mesh-map.png" alt={t('hubs.title')} fill className="object-cover opacity-80" sizes="(max-width: 1024px) 100vw, 58vw" />
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/40 to-neutral-950/70" />
                {[
                  { top: '52%', left: '38%', label: 'Dakhla' },
                  { top: '38%', left: '46%', label: 'Casablanca' },
                  { top: '24%', left: '52%', label: 'Tanger' },
                  { top: '48%', left: '22%', label: 'Dakar' },
                  { top: '62%', left: '30%', label: 'Abidjan' },
                ].map((pin, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: pin.top, left: pin.left }}>
                    <div className="relative">
                      <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-violet-500 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-violet-500 ring-2 ring-violet-500/30" />
                    </div>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-wider text-violet-300">{pin.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                {hubLegend.map((leg, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-xs text-neutral-600">
                    <span className={`h-2 w-2 rounded-full ${leg.color === 'violet' ? 'bg-violet-500' : 'bg-emerald-500'}`} />
                    <span>{leg.label}</span>
                    <span className="text-neutral-400">· {leg.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_EXPO }} className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="relative h-32 overflow-hidden border-b border-neutral-200">
                  <Image src="/images/sections/intelligence-cable.jpg" alt={t('ui.submarineFabric')} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 41vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <Cable className="h-4 w-4 text-violet-500" aria-hidden="true" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-600">{t('ui.submarineFabric')}</span>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {hubCables.map((cable, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-500" />
                        <span className="font-mono text-xs leading-relaxed text-neutral-600">{cable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 10. CARBON FOOTPRINT — energy mix panel + stats ═══════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(139,92,246,0.10) 0%, transparent 50%)' }} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-3xl">
            <SectionLabel n="09" label={t('carbonFootprint.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('carbonFootprint.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">{t('carbonFootprint.body')}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
              {carbonStats.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5">
                  <div className="flex items-center gap-2">
                    {i % 2 === 0 ? <Leaf className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Zap className="h-4 w-4 text-violet-400" aria-hidden="true" />}
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{t('ui.energyMixLive')}</span>
                  </div>
                  <div className={`mt-3 font-mono text-3xl font-bold md:text-4xl ${i % 2 === 0 ? 'text-emerald-400' : 'text-violet-400'}`}>{s.num}</div>
                  <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">{s.label}</p>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_EXPO }} className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                <div className="relative h-32 overflow-hidden border-b border-neutral-800">
                  <Image src="/images/intelligence/harchos-energy-mix.png" alt={t('ui.energyMixLive')} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 41vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <Sun className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300">{t('ui.renewableLabel')}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Sun className="h-4 w-4 text-emerald-400" aria-hidden="true" /><span className="font-mono text-xs text-neutral-300">{t('ui.solarLabel')}</span></div>
                      <Wind className="h-4 w-4 text-violet-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-800">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" initial={{ width: 0 }} whileInView={{ width: '62%' }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE_OUT_EXPO }} />
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Wind className="h-4 w-4 text-violet-400" aria-hidden="true" /><span className="font-mono text-xs text-neutral-300">{t('ui.windLabel')}</span></div>
                      <Database className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-800">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400" initial={{ width: 0 }} whileInView={{ width: '38%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2, ease: EASE_OUT_EXPO }} />
                    </div>
                  </div>
                  <div className="mt-6 border-t border-neutral-800 pt-4 font-mono text-[10px] uppercase tracking-wider text-neutral-500">{t('ui.energyMixLive')}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 11. COMPARISON — table with violet Harch column highlight ═══════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 10'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('comparison.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('comparison.title')}</h2>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950 text-white">
                  {comparisonHeaders.map((h, i) => (
                    <th key={i} className={`px-5 py-4 font-mono text-xs uppercase tracking-wider ${i === 1 ? 'bg-violet-500/10 text-violet-400' : i === 0 ? 'text-neutral-500' : 'text-neutral-400'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50">
                    {row.map((cell, j) => (
                      <td key={j} className={`px-5 py-4 ${j === 1 ? 'bg-violet-500/5 font-mono text-sm font-semibold text-violet-700' : j === 0 ? 'font-medium text-neutral-950' : 'font-mono text-sm text-neutral-500'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 12. PRICING — 3 tiers ═══════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-3xl">
            <SectionLabel n="11" label={t('pricing.label')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('pricing.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-4 text-base font-light text-neutral-500 md:text-lg">{t('pricing.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT_EXPO }} className={`relative flex flex-col rounded-2xl border p-8 transition-all ${plan.featured ? 'border-emerald-500 bg-white shadow-lg md:-translate-y-2' : 'border-neutral-200 bg-white hover:border-violet-500/40 hover:shadow-md'}`}>
                {plan.featured && <div className="absolute -top-3 left-8 rounded-full bg-emerald-500 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">{t('pricing.featuredBadge')}</div>}
                <div className="mb-2 font-mono text-xs uppercase tracking-wider text-violet-600">{plan.name}</div>
                <div className="text-sm font-light text-neutral-500">{plan.tagline}</div>
                <div className="mt-4 font-mono text-2xl font-bold text-neutral-950 md:text-3xl">{plan.price}</div>
                <div className="mt-1 text-xs font-light text-neutral-500">{plan.size}</div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 size={16} className={`mt-0.5 flex-shrink-0 ${plan.featured ? 'text-emerald-500' : 'text-violet-500'}`} aria-hidden="true" />
                      <span className="font-light text-neutral-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/quote?vertical=intelligence" aria-label={`${plan.cta} — ${plan.name}`} className={`mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${plan.featured ? 'bg-emerald-500 text-white hover:bg-emerald-400 focus-visible:outline-emerald-500' : 'border border-neutral-300 text-neutral-950 hover:bg-neutral-100 focus-visible:outline-violet-500'}`}>
                  {plan.cta}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 13. INNOVATION — dark bg, 4 cards ═══════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="absolute inset-0">
          <Image src="/images/blog/carbon-aware-gpu-cloud.jpg" alt="" fill className="object-cover opacity-15" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/95 via-neutral-950/90 to-neutral-950/95" />
        </div>
        <CircuitTrace />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-3xl">
            <SectionLabel n="12" label={t('innovation.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('innovation.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">{t('innovation.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {innoItems.map((item, i) => {
              const Icon = INNO_ICONS[i % INNO_ICONS.length];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT_EXPO }} className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-8 transition hover:-translate-y-1 hover:border-violet-500/40 hover:bg-neutral-800 hover:shadow-xl hover:shadow-violet-500/10">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/5 blur-3xl transition-all group-hover:bg-violet-500/15" />
                  <div className="relative">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/30">
                      <Icon size={22} className="text-violet-400" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold md:text-xl">{item.t}</h3>
                    <p className="mt-3 text-sm font-light leading-relaxed text-neutral-400">{item.d}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ 14. CASE STUDIES — full-bleed image + CTA overlay ═══════════ */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-neutral-950">
          <Image src="/images/real/intel-server-room.jpg" alt={t('caseStudies.title')} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/70 to-neutral-950/40" />
          <div className="relative z-10 flex h-full items-center justify-center px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }} className="mx-auto max-w-3xl text-center text-white">
              <SectionLabel n="13" label={t('caseStudies.label')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('caseStudies.title')}</h2>
              <div className="mx-auto mt-6 h-0.5 w-16 bg-violet-500" />
              <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-neutral-300 md:text-lg">{t('caseStudies.body')}</p>
              <Link href="/quote?vertical=intelligence" aria-label={`${t('finalCta.primary')} — Harch Intelligence`} className="group mt-8 inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">
                {t('finalCta.primary')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 15. TESTIMONIALS — 3 quote cards ═══════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-3xl">
            <SectionLabel n="14" label={t('testimonials.label')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('testimonials.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((tm, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT_EXPO }} className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl">
                <Quote className="h-8 w-8 text-violet-500/40" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-base font-light leading-relaxed text-neutral-700">&ldquo;{tm.quote}&rdquo;</blockquote>
                <div className="mt-6 border-t border-neutral-200 pt-4">
                  <div className="font-semibold text-neutral-950">{tm.author}</div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-wider text-violet-600">{tm.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 16. DEPLOYMENT FLOW — 5 steps + terminal ═══════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-3xl">
            <SectionLabel n="15" label={t('deploymentFlow.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('deploymentFlow.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">{t('deploymentFlow.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              {deploymentSteps.map((step, i) => {
                const Icon = DEPLOY_ICONS[i % DEPLOY_ICONS.length];
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="group flex gap-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-neutral-800/60 hover:shadow-lg hover:shadow-violet-500/5">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/30">
                      <Icon size={20} className="text-violet-400" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-xs font-bold text-violet-400">{step.n}</span>
                        <h3 className="text-base font-bold md:text-lg">{step.t}</h3>
                      </div>
                      <p className="mt-1 text-sm font-light leading-relaxed text-neutral-400">{step.d}</p>
                      <div className="mt-3 rounded-md bg-neutral-950/60 px-3 py-1.5 font-mono text-[11px] text-violet-300">{step.code}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }} className="lg:sticky lg:top-8 lg:self-start">
              <TerminalWindow title={t('deploymentFlow.codeHeader')} accent="emerald">
                <div className="bg-neutral-950 p-4">
                  {deploymentSteps.map((step, i) => (
                    <div key={i} className="mb-3">
                      <div className="font-mono text-xs text-violet-300">{step.code}</div>
                      <div className="mt-1 font-mono text-xs text-neutral-500">{t('ui.stepLabel')} {step.n} — {step.t}</div>
                    </div>
                  ))}
                  <div className="mt-4 flex items-center gap-2 border-t border-neutral-800 pt-3 font-mono text-xs text-emerald-400">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    {t('ui.modelDeployed')}
                  </div>
                </div>
              </TerminalWindow>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 17. CALCULATOR — interactive GPU cost slider ═══════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 16'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('calculator.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('calculator.title')}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light text-neutral-500 md:text-lg">{t('calculator.subtitle')}</p>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm md:p-12">
            <label htmlFor="intel-gpu-hours" className="block font-mono text-xs uppercase tracking-wider text-neutral-500">{t('calculator.gpuHrMo')}</label>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="font-mono text-4xl font-bold text-violet-600 md:text-5xl">{gpuHours.toLocaleString()}</span>
              <span className="font-mono text-sm text-neutral-500">GPU-hr / mo</span>
            </div>
            <input id="intel-gpu-hours" type="range" min={100} max={20000} step={100} value={gpuHours} onChange={(e) => setGpuHours(Number(e.target.value))} className="mt-6 w-full accent-violet-500" aria-label={t('calculator.gpuHrMo')} />
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              <span>{t('calculator.rangeMin')}</span>
              <span>{t('calculator.rangeMid')}</span>
              <span>{t('calculator.rangeMax')}</span>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-6">
                <div className="font-mono text-[10px] uppercase tracking-wider text-violet-600">{t('calculator.harchLabel')}</div>
                <div className="mt-2 font-mono text-2xl font-bold text-violet-700 md:text-3xl">${monthlyHarch.toLocaleString()}</div>
                <div className="mt-1 font-mono text-xs text-neutral-500">{t('calculator.billLabel')}</div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{t('calculator.awsLabel')}</div>
                <div className="mt-2 font-mono text-2xl font-bold text-neutral-400 line-through md:text-3xl">${monthlyAws.toLocaleString()}</div>
                <div className="mt-1 font-mono text-xs text-neutral-500">{t('calculator.vsUsCloud')}</div>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-600">{t('calculator.saveLabel')}</div>
                <div className="mt-2 font-mono text-2xl font-bold text-emerald-700 md:text-3xl">${save3yr.toLocaleString()}</div>
                <div className="mt-1 font-mono text-xs text-neutral-500">3-yr · {t('calculator.saveLabel')}</div>
              </div>
            </div>
            <p className="mt-6 text-xs font-light text-neutral-400">{t('calculator.disclaimer')}</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 18. SECTORS — 8-icon grid ═══════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-3xl">
            <SectionLabel n="17" label={t('sectors.label')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('sectors.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {sectorItems.map((sector, i) => {
              const Icon = SECTOR_ICONS[i % SECTOR_ICONS.length];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="group rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl">
                  <Icon className="mx-auto mb-4 h-10 w-10 text-violet-500 transition-transform group-hover:scale-110" aria-hidden="true" />
                  <div className="font-semibold text-neutral-950 md:text-lg">{sector}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ 19. APPLICATIONS — dark with circuit traces, 5 items ═══════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <CircuitTrace />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:gap-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}>
            <SectionLabel n="18" label={t('applications.label')} dark />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('applications.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">{t('applications.body')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }} className="space-y-6">
            {applicationItems.map((item, i) => (
              <div key={i} className="group flex items-start gap-4 border-b border-neutral-800 pb-6 last:border-0">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/30 font-mono text-xs font-bold text-violet-400">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white md:text-lg">{item.t}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">{item.d}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 20. WHY HARCH — dark, 4 icon cards ═══════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-600">{'// 19'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('whyHarch.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">{t('whyHarch.title')}</h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {whyItems.map((item, i) => {
              const Icon = WHY_ICONS[i % WHY_ICONS.length];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT_EXPO }} className="flex gap-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:-translate-y-1 hover:border-violet-500/40 hover:bg-neutral-800 hover:shadow-xl hover:shadow-violet-500/10 md:p-8">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/30">
                      <Icon size={20} className="text-violet-400" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold md:text-xl">{item.t}</h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-neutral-400">{item.d}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ 21. PROCESS TIMELINE — light, 5-step ═══════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 20'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('process.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('process.title')}</h2>
          </div>
          <div className="mt-16">
            {processSteps.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }} className="flex gap-8 border-b border-neutral-200 py-8 last:border-0">
                <div className="flex-shrink-0 font-mono text-4xl font-bold text-violet-500/40 md:text-5xl">{item.n}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-4">
                    <h3 className="text-xl font-bold text-neutral-950 md:text-2xl">{item.t}</h3>
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-violet-600">{item.time}</span>
                  </div>
                  <p className="mt-2 font-light leading-relaxed text-neutral-500 md:text-lg">{item.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 22. FAQ — light, accordion ═══════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 21'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('faq.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('faq.title')}</h2>
          </div>
          <div className="mt-12 space-y-3">
            {faqItems.map((item, i) => {
              const answer = item.a ?? item.d ?? '';
              const isOpen = openFaq === i;
              return (
                <div key={i} className={`overflow-hidden rounded-xl border bg-white transition-colors ${isOpen ? 'border-violet-500/40 shadow-sm' : 'border-neutral-200'}`}>
                  <button type="button" onClick={() => setOpenFaq(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-neutral-50 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500" id={`intel-faq-button-${i}`} aria-expanded={isOpen} aria-controls={`intel-faq-panel-${i}`}>
                    <span className="font-semibold text-neutral-950">{item.q}</span>
                    <ChevronDown size={20} className={`flex-shrink-0 text-violet-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden" id={`intel-faq-panel-${i}`} role="region" aria-labelledby={`intel-faq-button-${i}`}>
                        <p className="px-5 pb-5 font-light leading-relaxed text-neutral-500">{answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ 23. RESOURCES — light, download cards ═══════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <SectionLabel n="22" label={t('resources.label')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('resources.title')}</h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-4 text-base font-light text-neutral-500 md:text-lg">{t('resources.subtitle')}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {resourceItems.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }} className="group flex items-start gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/20">
                  <FileText size={22} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-neutral-950">{r.t}</h3>
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-xs font-medium text-neutral-600">{r.type}</span>
                  </div>
                  <p className="mt-2 text-sm font-light text-neutral-500">{r.d}</p>
                  <button type="button" aria-label={`${t('resources.download')} — ${r.t}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500">
                    <Download size={14} aria-hidden="true" />
                    {t('resources.download')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 24. GEOGRAPHY — hub cards with photos ═══════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 23'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('geography.label')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">{t('geography.title')}</h2>
            <p className="mt-6 text-base font-light text-neutral-500 md:text-lg">{t('geography.subtitle')}</p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {geoCities.map((c, i) => {
              const isPlanned = c.type.toLowerCase().includes('planning');
              const photo = GEO_PHOTOS[c.name];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className={`group overflow-hidden rounded-2xl border transition hover:-translate-y-1 hover:shadow-xl ${isPlanned ? 'border-neutral-200 bg-neutral-50 opacity-70 hover:opacity-100' : 'border-neutral-200 bg-white hover:border-violet-500/40'}`}>
                  {photo && !isPlanned ? (
                    <div className="relative h-32 overflow-hidden border-b border-neutral-200">
                      <Image src={photo} alt={c.name} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                      <div className="absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300">{c.name}</div>
                    </div>
                  ) : (
                    <div className={`flex h-32 items-center justify-center border-b ${isPlanned ? 'border-neutral-200 bg-neutral-100' : 'border-neutral-200 bg-neutral-50'}`}>
                      <MapPin size={28} className={isPlanned ? 'text-neutral-400' : 'text-violet-500'} aria-hidden="true" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="font-bold text-neutral-950">{c.name}</div>
                    <div className="text-xs font-light text-neutral-500">{c.type}</div>
                    <div className={`mt-2 font-mono text-xs font-semibold ${isPlanned ? 'text-neutral-500' : 'text-violet-600'}`}>{c.plants}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ 24. FINAL CTA — full-bleed image + circuit traces + Back to Harch Corp ═══════════ */}
      <section className="relative overflow-hidden bg-neutral-950">
        <div className="absolute inset-0">
          <Image src="/images/intelligence/harchos-facility-night.png" alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/60" />
        </div>
        <CircuitTrace dense />
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.4) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)' }} />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-white md:py-40">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }} className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-4 py-2 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
              </span>
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-neutral-200">{t('ui.harchIntelligence')}</span>
            </div>
            <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300">{t('finalCta.subtitle')}</span>
            <h2 className="text-2xl font-bold tracking-tight md:text-4xl">{t('finalCta.title')}</h2>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/quote?vertical=intelligence" aria-label={`${t('finalCta.primary')} — Harch Intelligence`} className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">
                {t('finalCta.primary')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a href="tel:+212684440682" aria-label={`${t('finalCta.secondary')} ${t('ui.callCta')}`} className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <Phone size={16} aria-hidden="true" />
                {t('finalCta.secondary')}
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs font-light text-neutral-400">
              <div className="flex items-center gap-2"><Clock size={14} className="text-violet-400" aria-hidden="true" />{t('ui.h100FromRate')}</div>
              <div className="flex items-center gap-2"><Radio size={14} className="text-violet-400" aria-hidden="true" />{t('ui.slaUptime')}</div>
              <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-violet-400" aria-hidden="true" />{t('ui.law09_08')}</div>
              <div className="flex items-center gap-2"><Leaf size={14} className="text-emerald-400" aria-hidden="true" />{t('ui.renewable100')}</div>
              <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-emerald-400" aria-hidden="true" />{t('ui.harchCorpBacking')}</div>
            </div>
            <div className="mt-12 border-t border-neutral-800 pt-6">
              <Link href="/" aria-label={t('ui.backToHarchCorp')} className="group inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                {t('ui.backToHarchCorp')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer accent line — violet subsidiary accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
    </div>
  );
}

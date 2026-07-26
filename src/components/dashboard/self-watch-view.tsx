"use client";

/**
 * Harch Atelier — Self Watch View (Figma-grade rework · task 28-figma-self)
 *
 * Personal command center for the SELF role (S. Bauer). The MOST polished view
 * in the platform — a Linear / Vercel-quality personal intelligence landing.
 *
 * Built entirely on the shared design-system primitives (`PanelCard`, `StatTile`,
 * `MetricRing`, `Tag`, `MiniSparkline`, `StaggerGrid`, `EmptyState`,
 * `PanelHeader`, `ProgressBar`). Self accent = cyan throughout (hero glow,
 * KPI icon chips, pinned-card primary stripe, accent rails on every panel).
 *
 * Data + logic unchanged from V19.0 (src/lib/self-data.ts). Props signature
 * `(onSelect, onSelectEvent, onSelectEntity)` preserved so the existing
 * `EntityProfileDialog` + `RiskEventDrawer` work without modification.
 */

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import {
  Sparkles,
  BellPlus,
  PlusCircle,
  Download,
  AlertTriangle,
  Landmark,
  TrendingUp,
  Leaf,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ChevronRight,
  Lock,
  ExternalLink,
  RefreshCw,
  Newspaper,
  Star,
  Pin,
  Clock,
  Radio,
  type LucideIcon,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WatchlistSignals } from "./watchlist-signals";
import { ActivityFeed } from "./activity-feed";
import { useRiskStore } from "@/lib/risk-store";
import {
  selfUser,
  pinnedEntities,
  personalAlerts,
  personalAlertSummary,
  savedViews,
  quickActions,
  selfKpis,
  heroSummaryChips,
  greeting,
  type PersonalAlert,
  type SelfKpi,
  type SelfSavedView,
  type QuickAction,
  type PinnedEntity,
  type SavedViewIcon,
  type QuickActionIcon,
} from "@/lib/self-data";
import { severityColor, type RiskEvent, type Severity } from "@/lib/mock-data";
import { sectorChipTint, type Entity } from "@/lib/entities-data";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  MetricRing,
  Tag,
  StaggerGrid,
  EmptyState,
  MiniSparkline,
  motionVariants,
  type RoleAccent,
} from "../sections/design-system";

/* ------------------------------------------------------------------ */
/*  Types + constants                                                  */
/* ------------------------------------------------------------------ */

interface SelfWatchViewProps {
  onSelect: (e: RiskEvent) => void;
  onSelectEvent: (eventId: string) => void;
  onSelectEntity: (entity: string) => void;
}

const SELF_ACCENT: RoleAccent = "cyan";

/** Local container variants — slightly slower stagger for a more cinematic entrance. */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = motionVariants.item;

/** Self-tinted sparkline stroke per KPI semantic (kept from V19). */
const kpiSparkColor: Record<string, string> = {
  "My Tracked Entities": "#0891b2", // cyan-600
  "My Open Alerts": "#e11d48", // rose-600
  "My Saved Views": "#8b5cf6", // violet-500
  "My Activity Today": "#10b981", // emerald-500
};

const kpiIcon: Record<string, LucideIcon> = {
  "My Tracked Entities": Pin,
  "My Open Alerts": AlertTriangle,
  "My Saved Views": Star,
  "My Activity Today": Activity,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Premium 380ms mount skeleton gate (kept from V19). */
function useReady(ms = 380) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const id = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(id);
  }, [ms]);
  return ready;
}

/** Sentiment text tint (emerald/amber/rose by delta). */
function sentimentTint(delta: number): { text: string; ring: string; bg: string } {
  if (delta >= 0)
    return { text: "text-emerald-700", ring: "ring-emerald-200", bg: "bg-emerald-50" };
  if (delta >= -2)
    return { text: "text-amber-700", ring: "ring-amber-200", bg: "bg-amber-50" };
  return { text: "text-rose-700", ring: "ring-rose-200", bg: "bg-rose-50" };
}

/** Risk-ring tone — INVERTED from MetricRing's auto (high score = rose = risky). */
function riskTone(score: number): "rose" | "amber" | "emerald" {
  if (score >= 70) return "rose";
  if (score >= 50) return "amber";
  return "emerald";
}

/** Priority stripe color for pinned-entity cards. */
const priorityStripe: Record<PinnedEntity["priority"], string> = {
  primary: "bg-cyan-500",
  watching: "bg-amber-400",
  context: "bg-slate-300",
};

const priorityTagTone: Record<PinnedEntity["priority"], "cyan" | "amber" | "slate"> = {
  primary: "cyan",
  watching: "amber",
  context: "slate",
};

/** Saved-view icon resolver. */
const savedViewIcon: Record<SavedViewIcon, LucideIcon> = {
  "alert-triangle": AlertTriangle,
  landmark: Landmark,
  "trending-up": TrendingUp,
  leaf: Leaf,
};

/** Quick-action icon resolver. */
const quickActionIcon: Record<QuickActionIcon, LucideIcon> = {
  "plus-circle": PlusCircle,
  "bell-plus": BellPlus,
  download: Download,
};

/** Severity → Tag tone. */
function severityTagTone(s: Severity): "negative" | "warning" | "neutral" {
  if (s === "critical") return "negative";
  if (s === "high") return "warning";
  if (s === "medium") return "warning";
  return "neutral";
}

/* ------------------------------------------------------------------ */
/*  Hero banner — glassmorphism + animated glow + premium avatar       */
/* ------------------------------------------------------------------ */

function HeroBanner() {
  const chipTone: Record<string, string> = {
    neutral: "bg-white/10 text-slate-200 ring-white/15",
    positive: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30",
    negative: "bg-rose-500/15 text-rose-200 ring-rose-500/30",
    warning: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
  };

  const lastLoginLabel = (() => {
    const d = new Date(selfUser.lastLogin);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  })();

  return (
    <motion.div variants={itemVariants}>
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 p-5 text-white shadow-lg shadow-slate-900/5 sm:p-6">
        {/* Animated glassmorphism glow layers */}
        <motion.div
          className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-500/25 blur-3xl"
          animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-16 left-1/4 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl"
          animate={{ opacity: [0.4, 0.65, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Slow diagonal shimmer sweep */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, rgba(34,211,238,0.18) 50%, transparent 65%)",
          }}
          animate={{ x: ["-30%", "130%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
        />
        <div className="absolute right-1/3 top-1/2 h-24 w-24 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            {/* Premium avatar with breathing ring */}
            <div className="relative shrink-0">
              <motion.span
                className="absolute inset-0 rounded-2xl ring-2 ring-cyan-400/60"
                animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.08, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-base font-bold ring-1 ring-white/25">
                {selfUser.initials}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[20px] font-bold leading-tight tracking-tight">
                  {greeting()}, {selfUser.name.split(" ").pop()}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200 ring-1 ring-white/15">
                  <Sparkles className="h-3 w-3" />
                  Personal workspace
                </span>
              </div>
              <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-slate-300">
                Your private command center — pinned entities, personal alert digest, saved
                views, and today&apos;s activity. Self-tinted cyan, isolated from the shared
                Operations Console.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last login {lastLoginLabel} · {selfUser.tz}
                </span>
                <span className="hidden items-center gap-1 sm:inline-flex">
                  <Lock className="h-3 w-3" />
                  Private to {selfUser.email}
                </span>
              </div>
            </div>
          </div>

          {/* Summary chips with tooltips + LIVE pulse */}
          <div className="flex flex-wrap items-center gap-2">
            {heroSummaryChips.map((chip) => (
              <Tooltip key={chip.label}>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "tabular inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 backdrop-blur-sm transition-transform hover:scale-[1.03] cursor-default",
                      chipTone[chip.tone],
                    )}
                  >
                    {chip.value === "LIVE" ? (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                      </span>
                    ) : null}
                    {chip.label}: <span className="tabular">{chip.value}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {chip.label} summary · {chip.value}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Personal KPI row — 4 StatTiles + MiniSparkline + delta + hint      */
/* ------------------------------------------------------------------ */

function PersonalKpiRow() {
  return (
    <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {selfKpis.map((kpi) => {
        const good = kpi.invertDelta ? kpi.delta < 0 : kpi.delta >= 0;
        const deltaTone: "positive" | "negative" = good ? "positive" : "negative";
        const deltaStr = `${kpi.delta > 0 ? "+" : ""}${kpi.delta}`;
        const Icon = kpiIcon[kpi.label] ?? Activity;
        return (
          <motion.div key={kpi.label} variants={itemVariants}>
            <StatTile
              label={kpi.label}
              value={kpi.display}
              delta={deltaStr}
              deltaTone={deltaTone}
              icon={Icon}
              accent={SELF_ACCENT}
              hint={kpi.hint}
            >
              <div className="flex items-center justify-between gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="tabular inline-flex cursor-help items-center gap-0.5 text-[10px] font-medium text-slate-400">
                      {good ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-rose-600" />
                      )}
                      Δ vs prior
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Δ vs prior period · {kpi.invertDelta ? "lower is better" : "higher is better"}
                  </TooltipContent>
                </Tooltip>
                <MiniSparkline data={kpi.spark} color={kpiSparkColor[kpi.label]} width={120} height={28} />
              </div>
            </StatTile>
          </motion.div>
        );
      })}
    </StaggerGrid>
  );
}

/* ------------------------------------------------------------------ */
/*  Pinned entity card — PanelCard + MetricRing + MiniSparkline        */
/* ------------------------------------------------------------------ */

function PinnedEntityCard({
  pinned,
  onSelectEntity,
}: {
  pinned: PinnedEntity;
  onSelectEntity: (entity: string) => void;
}) {
  const e: Entity | undefined = pinned.entity;

  if (!e) {
    return (
      <motion.div variants={itemVariants}>
        <PanelCard accent={SELF_ACCENT} className="h-full p-4">
          <EmptyState
            icon={Pin}
            title={`Entity ${pinned.entityId} not found`}
            description="This pinned entity is no longer available in the directory."
            accent={SELF_ACCENT}
          />
        </PanelCard>
      </motion.div>
    );
  }

  const sectorTint = sectorChipTint[e.sector] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  const news = e.lastNews[0];
  const snt = sentimentTint(e.sentiment);
  const rTone = riskTone(e.riskScore);
  const sentimentIconColor =
    e.sentiment >= 0 ? "text-emerald-600" : e.sentiment >= -2 ? "text-amber-600" : "text-rose-600";

  return (
    <motion.div variants={itemVariants} className="h-full">
      <motion.button
        type="button"
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        onClick={() => onSelectEntity(e.name)}
        aria-label={`Open ${e.name} profile`}
        className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-md shadow-slate-900/5 transition-colors duration-200 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-900/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40"
      >
        {/* Priority stripe — widens on hover */}
        <span
          className={cn(
            "absolute left-0 top-0 h-full w-1 transition-all duration-300 group-hover:w-1.5",
            priorityStripe[pinned.priority],
          )}
          aria-hidden
        />

        {/* Header: name/ticker/sector + risk ring */}
        <div className="flex items-start justify-between gap-2 pl-1.5">
          <div className="min-w-0">
            <span className="block truncate text-[13px] font-bold text-slate-900">{e.name}</span>
            <div className="mt-0.5 flex items-center gap-1.5">
              {e.ticker ? (
                <span className="tabular rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {e.ticker}
                </span>
              ) : null}
              <span
                className={cn(
                  "inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold ring-1 ring-inset",
                  sectorTint,
                )}
              >
                {e.sector}
              </span>
            </div>
          </div>
          <MetricRing value={e.riskScore} size={44} stroke={4} tone={rTone} sublabel="risk" />
        </div>

        {/* Sentiment delta + 7d spark */}
        <div className="mt-3 flex items-end justify-between gap-2 pl-1.5">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Sentiment
            </div>
            <div className={cn("tabular text-[14px] font-bold", snt.text)}>
              {e.sentiment > 0 ? "+" : ""}
              {e.sentiment}
            </div>
          </div>
          <MiniSparkline data={e.sparkline.slice(-12)} color="#0891b2" width={84} height={24} />
        </div>

        {/* Top recent headline */}
        {news ? (
          <div className="mt-2.5 flex items-start gap-1.5 rounded-md bg-slate-50 p-2 pl-2.5">
            <Newspaper className={cn("mt-0.5 h-3 w-3 shrink-0", sentimentIconColor)} aria-hidden />
            <div className="min-w-0">
              <p className="line-clamp-2 text-[10px] leading-snug text-slate-600">{news.title}</p>
              <p className="tabular mt-0.5 text-[9px] text-slate-400">
                {news.outlet} · {news.date}
              </p>
            </div>
          </div>
        ) : null}

        {/* Footer: priority tag + open affordance */}
        <div className="mt-2.5 flex items-center justify-between pl-1.5">
          <Tag tone={priorityTagTone[pinned.priority]} size="xs" icon={Pin}>
            {pinned.priority}
          </Tag>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-400 transition-colors group-hover:text-cyan-700">
            Open
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>

        {/* sr-only pin note */}
        <span className="sr-only">
          Pin note: {pinned.note}. Pinned on {pinned.pinnedAt}.
        </span>
      </motion.button>
    </motion.div>
  );
}

function PinnedEntitiesSection({
  onSelectEntity,
}: {
  onSelectEntity: (entity: string) => void;
}) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-2.5">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-bold tracking-tight text-slate-900">Pinned Entities</h3>
          <p className="text-[11px] text-slate-500">
            Your personal shortlist · click any card to open its profile
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() =>
                toast.info("Manage pinned entities", {
                  description: "Drag to reorder · long-press to unpin from your workspace.",
                })
              }
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
            >
              <RefreshCw className="h-3 w-3" />
              Manage pins
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Reorder or remove pinned entities</TooltipContent>
        </Tooltip>
      </div>
      <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pinnedEntities.map((p) => (
          <PinnedEntityCard key={p.entityId} pinned={p} onSelectEntity={onSelectEntity} />
        ))}
      </StaggerGrid>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Alerts digest — PanelCard + pulsing dots + SLA Tag + quick-ack     */
/* ------------------------------------------------------------------ */

function SeverityBadge({ count, tone }: { count: number; tone: "critical" | "high" | "medium" }) {
  const tagTone: Record<typeof tone, "negative" | "warning" | "neutral"> = {
    critical: "negative",
    high: "warning",
    medium: "warning",
  };
  const label: Record<typeof tone, string> = { critical: "crit", high: "high", medium: "med" };
  return (
    <Tag tone={tagTone[tone]} size="xs">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {count} {label[tone]}
    </Tag>
  );
}

function AlertsDigest({
  alerts,
  onAcknowledge,
}: {
  alerts: PersonalAlert[];
  onAcknowledge: (a: PersonalAlert) => void;
}) {
  return (
    <PanelCard accent={SELF_ACCENT} hover={false} className="h-full">
      <PanelHeader
        title="My Alerts Digest"
        subtitle={`Personal subset · ${personalAlertSummary.total} actionable · ${personalAlertSummary.unack} unacknowledged`}
        icon={AlertTriangle}
        accent={SELF_ACCENT}
        action={
          <div className="flex shrink-0 items-center gap-1.5">
            <SeverityBadge count={personalAlertSummary.critical} tone="critical" />
            <SeverityBadge count={personalAlertSummary.high} tone="high" />
            <SeverityBadge count={personalAlertSummary.medium} tone="medium" />
          </div>
        }
      />
      <div className="harch-scroll max-h-[360px] flex-1 overflow-y-auto p-1.5">
        {alerts.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No personal alerts"
            description="You're all caught up. New threshold breaches will surface here."
            accent={SELF_ACCENT}
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {alerts.map((a) => {
              const sc = severityColor[a.severity];
              return (
                <li
                  key={a.sourceAlertId}
                  className={cn(
                    "group flex items-start gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-slate-50",
                    a.acknowledged && "opacity-60",
                  )}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "mt-1 h-2 w-2 shrink-0 rounded-full",
                          sc.dot,
                          !a.acknowledged && "animate-pulse",
                        )}
                        aria-hidden
                      />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {a.severity} severity · {a.acknowledged ? "acknowledged" : "unacknowledged"}
                    </TooltipContent>
                  </Tooltip>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-medium text-slate-800">
                        {a.title}
                      </span>
                      <span className="tabular shrink-0 text-[10px] text-slate-400">
                        {a.relativeTime}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                      <span className="font-medium text-slate-600">{a.entity}</span>
                      <span className="text-slate-300">·</span>
                      <span className="capitalize">{a.pillar}</span>
                      <span className="text-slate-300">·</span>
                      <Tag tone={a.slaMinutes < 0 ? "negative" : "neutral"} size="xs" icon={Clock}>
                        {a.slaMinutes < 0
                          ? `${Math.abs(a.slaMinutes)}m breach`
                          : `${a.slaMinutes}m SLA`}
                      </Tag>
                      <Tag tone={severityTagTone(a.severity)} size="xs">
                        {a.severity}
                      </Tag>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onAcknowledge(a)}
                        disabled={a.acknowledged}
                        className={cn(
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all",
                          a.acknowledged
                            ? "cursor-not-allowed border-emerald-200 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                        )}
                        aria-label={a.acknowledged ? "Already acknowledged" : "Acknowledge alert"}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {a.acknowledged ? "Acknowledged" : "Quick-acknowledge"}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <footer className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
        Sourced from the shared alert queue · 6 personal items · auto-refreshes every 4–7s
      </footer>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick actions panel — PanelCard + 3 shortcut buttons               */
/* ------------------------------------------------------------------ */

function QuickActionsPanel({ actions }: { actions: QuickAction[] }) {
  return (
    <PanelCard accent={SELF_ACCENT} hover={false} className="h-full">
      <PanelHeader
        title="Quick Actions"
        subtitle="Personal shortcuts · workspace-scoped"
        icon={Sparkles}
        accent={SELF_ACCENT}
        action={<Tag tone="cyan" size="xs">Self</Tag>}
      />
      <div className="flex flex-col gap-1.5 p-2">
        {actions.map((a) => {
          const Icon = quickActionIcon[a.icon];
          return (
            <button
              key={a.id}
              type="button"
              onClick={() =>
                toast.success(`Opening “${a.label}”`, {
                  description: a.description,
                })
              }
              className="group flex items-start gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left transition-all hover:border-slate-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40"
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-slate-200 transition-transform group-hover:scale-105",
                  a.tint,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="truncate text-[12px] font-semibold text-slate-800">
                    {a.label}
                  </span>
                  <ChevronRight className="h-3 w-3 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-cyan-600" />
                </div>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500">
                  {a.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <footer className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
        Actions are workspace-scoped · visible only to {selfUser.name}
      </footer>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Saved views row — PanelCard + 4 preset cards                       */
/* ------------------------------------------------------------------ */

function SavedViewsRow({ views }: { views: SelfSavedView[] }) {
  return (
    <PanelCard accent={SELF_ACCENT} hover={false}>
      <PanelHeader
        title="Saved Views"
        subtitle="Personal presets · click to load a filtered workspace"
        icon={Star}
        accent={SELF_ACCENT}
        action={
          <button
            type="button"
            onClick={() =>
              toast.info("Save current filters as a view", {
                description:
                  "Use the bookmark icon in the toolbar to save the active filter set.",
              })
            }
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
          >
            <Star className="h-3 w-3" />
            New
          </button>
        }
      />
      <StaggerGrid className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 xl:grid-cols-4">
        {views.map((v) => {
          const Icon = savedViewIcon[v.icon];
          return (
            <motion.button
              key={v.id}
              type="button"
              variants={itemVariants}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              onClick={() =>
                toast.success(`Loading view “${v.name}”`, {
                  description: v.description,
                })
              }
              className="group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-inset",
                    v.tint,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="tabular text-[9px] font-medium uppercase tracking-wide text-slate-400">
                  {v.lastOpened}
                </span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-bold text-slate-900">{v.name}</div>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500">
                  {v.description}
                </p>
              </div>
              <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400">
                <span className="tabular inline-flex items-center gap-1">
                  <Pin className="h-2.5 w-2.5" />
                  {v.entityCount} entities
                </span>
                <span className="inline-flex items-center gap-0.5 font-medium text-slate-400 transition-colors group-hover:text-cyan-700">
                  Load
                  <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </motion.button>
          );
        })}
      </StaggerGrid>
      <footer className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
        Presets are personal · sync across devices when workspace sync is enabled
      </footer>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Watchlist + Activity — reuse existing components, wrapped          */
/* ------------------------------------------------------------------ */

function ReusedPanel({ children }: { children: React.ReactNode }) {
  // Wrap the reused WatchlistSignals / ActivityFeed components in a motion.div
  // so they participate in the cascade entrance. They already ship with
  // ChartCard chrome (rounded border + shadow + header) so they read as
  // PanelCards visually.
  return <motion.div variants={itemVariants} className="h-full">{children}</motion.div>;
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton — shimmer blocks matching the new layout          */
/* ------------------------------------------------------------------ */

function ShimmerBlock({ className }: { className: string }) {
  return <Skeleton className={cn("rounded-2xl", className)} />;
}

function SelfWatchSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading personal workspace">
      <ShimmerBlock className="h-[136px] w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerBlock key={i} className="h-[152px] w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerBlock key={i} className="h-[236px] w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ShimmerBlock className="h-[400px] w-full xl:col-span-2" />
        <ShimmerBlock className="h-[400px] w-full xl:col-span-1" />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ShimmerBlock className="h-[360px] w-full" />
        <ShimmerBlock className="h-[360px] w-full" />
      </div>
      <ShimmerBlock className="h-[220px] w-full" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main view                                                          */
/* ------------------------------------------------------------------ */

export function SelfWatchView({
  onSelect: _onSelect,
  onSelectEvent: _onSelectEvent,
  onSelectEntity,
}: SelfWatchViewProps) {
  const ready = useReady(380);
  const logActivity = useRiskStore((s) => s.logActivity);

  const handleAcknowledge = React.useCallback(
    (a: PersonalAlert) => {
      logActivity(
        "acknowledge",
        `Acknowledged “${a.title}”`,
        `${a.sourceAlertId} · ${a.entity}`,
      );
      toast.success(`Acknowledged “${a.title}”`, {
        description: `${a.entity} · ${a.pillar} · SLA ${a.slaMinutes}m`,
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      });
    },
    [logActivity],
  );

  if (!ready) return <SelfWatchSkeleton />;

  return (
    <TooltipProvider delayDuration={150}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5"
      >
        <HeroBanner />

        <PersonalKpiRow />

        <PinnedEntitiesSection onSelectEntity={onSelectEntity} />

        {/* Alerts digest + quick actions */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <AlertsDigest alerts={personalAlerts} onAcknowledge={handleAcknowledge} />
          </motion.div>
          <motion.div variants={itemVariants} className="xl:col-span-1">
            <QuickActionsPanel actions={quickActions} />
          </motion.div>
        </div>

        {/* Watchlist + activity (reused components) */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <ReusedPanel>
            <WatchlistSignals />
          </ReusedPanel>
          <ReusedPanel>
            <ActivityFeed />
          </ReusedPanel>
        </div>

        {/* Saved views row */}
        <motion.div variants={itemVariants}>
          <SavedViewsRow views={savedViews} />
        </motion.div>

        {/* Footer microcopy */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-[10px] text-slate-500"
        >
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Personalized for {selfUser.name} · {pinnedEntities.length} pinned ·{" "}
            <span className="tabular">{personalAlertSummary.unack}</span> unacknowledged ·{" "}
            <span className="tabular">{savedViews.length}</span> saved views
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ExternalLink className="h-3 w-3" />
            Self workspace · isolated from shared Operations Console
          </span>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}

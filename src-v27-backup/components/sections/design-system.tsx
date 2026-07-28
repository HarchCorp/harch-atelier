"use client";

/**
 * Harch Atelier — Figma-grade design system (V14.0)
 *
 * A premium, cohesive component layer that every role's sections import. Think
 * of this as the "design system" a Figma file would specify: consistent tokens,
 * spacing, elevation, motion, and a small set of polished primitives.
 *
 * Design principles:
 *  - Token-driven: every color/spacing/radius comes from a typed map.
 *  - Role-tinted: each account type has an accent that flows through heroes,
 *    KPIs, active states, and chart strokes.
 *  - Layered elevation: subtle shadow + ring combos for depth.
 *  - Motion-aware: entrance + hover micro-interactions via framer-motion.
 *  - Dense but breathable: information-rich without feeling cramped.
 *
 * Agents: IMPORT from here, do NOT modify this file. Compose these primitives
 * to build your role's sections.
 */
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { AccountType } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */

/** Per-role accent palette. Each role's hero, KPIs, and active charts use these. */
export type RoleAccent =
  | "slate"
  | "emerald"
  | "violet"
  | "amber"
  | "rose"
  | "cyan";

export const roleAccent: Record<AccountType, RoleAccent> = {
  admin: "slate",
  trader: "emerald",
  legal: "violet",
  market: "amber",
  pr: "rose",
  self: "cyan",
};

/** Token map: accent → concrete Tailwind classes for every surface. */
export interface AccentTokens {
  /** Solid bg (e.g. for avatar fills). */
  solid: string;
  /** Soft bg (e.g. KPI icon chip). */
  soft: string;
  /** Soft text. */
  softText: string;
  /** Strong text. */
  text: string;
  /** Ring color. */
  ring: string;
  /** Gradient stops for heroes (from / via / to). */
  heroFrom: string;
  heroVia: string;
  /** Accent blur for hero glow. */
  glow: string;
  /** Chart stroke color (hex). */
  stroke: string;
  /** Border tint. */
  border: string;
  /** Tab/badge active bg. */
  chipBg: string;
  chipText: string;
}

export const accentTokens: Record<RoleAccent, AccentTokens> = {
  slate: {
    solid: "bg-slate-800",
    soft: "bg-slate-100",
    softText: "text-slate-600",
    text: "text-slate-700",
    ring: "ring-slate-300",
    heroFrom: "from-slate-900",
    heroVia: "via-slate-800",
    glow: "bg-slate-400/20",
    stroke: "#475569",
    border: "border-slate-200",
    chipBg: "bg-slate-100",
    chipText: "text-slate-700",
  },
  emerald: {
    solid: "bg-emerald-600",
    soft: "bg-emerald-50",
    softText: "text-emerald-700",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    heroFrom: "from-slate-900",
    heroVia: "via-emerald-950",
    glow: "bg-emerald-500/20",
    stroke: "#059669",
    border: "border-emerald-200",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-700",
  },
  violet: {
    solid: "bg-violet-700",
    soft: "bg-violet-50",
    softText: "text-violet-700",
    text: "text-violet-700",
    ring: "ring-violet-200",
    heroFrom: "from-slate-900",
    heroVia: "via-violet-950",
    glow: "bg-violet-500/20",
    stroke: "#7c3aed",
    border: "border-violet-200",
    chipBg: "bg-violet-50",
    chipText: "text-violet-700",
  },
  amber: {
    solid: "bg-amber-600",
    soft: "bg-amber-50",
    softText: "text-amber-700",
    text: "text-amber-700",
    ring: "ring-amber-200",
    heroFrom: "from-slate-900",
    heroVia: "via-amber-950",
    glow: "bg-amber-500/20",
    stroke: "#d97706",
    border: "border-amber-200",
    chipBg: "bg-amber-50",
    chipText: "text-amber-700",
  },
  rose: {
    solid: "bg-rose-600",
    soft: "bg-rose-50",
    softText: "text-rose-700",
    text: "text-rose-700",
    ring: "ring-rose-200",
    heroFrom: "from-slate-900",
    heroVia: "via-rose-950",
    glow: "bg-rose-500/20",
    stroke: "#e11d48",
    border: "border-rose-200",
    chipBg: "bg-rose-50",
    chipText: "text-rose-700",
  },
  cyan: {
    solid: "bg-cyan-600",
    soft: "bg-cyan-50",
    softText: "text-cyan-700",
    text: "text-cyan-700",
    ring: "ring-cyan-200",
    heroFrom: "from-slate-900",
    heroVia: "via-cyan-950",
    glow: "bg-cyan-500/20",
    stroke: "#0891b2",
    border: "border-cyan-200",
    chipBg: "bg-cyan-50",
    chipText: "text-cyan-700",
  },
};

/** Elevation tokens — layered shadow + ring combos. */
export const elevation = {
  flat: "shadow-none",
  card: "shadow-sm",
  raised: "shadow-md",
  floating: "shadow-lg shadow-slate-900/5",
} as const;

/** Motion variants for staggered entrances. */
export const motionVariants = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.02 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  },
  hoverLift: {
    rest: { y: 0 },
    hover: { y: -3, transition: { type: "spring" as const, stiffness: 400, damping: 25 } },
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Premium primitives                                                  */
/* ------------------------------------------------------------------ */

/**
 * PanelCard — the Figma-grade replacement for ad-hoc bordered divs.
 * Premium chrome: layered shadow, hover lift, optional accent rail.
 */
export function PanelCard({
  children,
  className,
  accent,
  hover = true,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Show a 3px accent rail on the left edge. */
  accent?: RoleAccent;
  hover?: boolean;
  /** Stagger delay (seconds) for entrance animation. */
  delay?: number;
}) {
  const tokens = accent ? accentTokens[accent] : null;
  return (
    <motion.div
      variants={motionVariants.item}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      whileHover={hover ? { y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } } : undefined}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white",
        elevation.raised,
        hover && "transition-shadow duration-200 hover:shadow-lg hover:shadow-slate-900/5 hover:border-slate-300",
        className,
      )}
    >
      {tokens ? (
        <span className={cn("absolute inset-y-0 left-0 w-[3px]", tokens.solid)} aria-hidden />
      ) : null}
      {children}
    </motion.div>
  );
}

/**
 * PanelHeader — consistent card header with title, subtitle, action slot.
 * Premium typography: 11px uppercase tracking-wider title + 11px subtitle.
 */
export function PanelHeader({
  title,
  subtitle,
  action,
  icon: Icon,
  accent,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  accent?: RoleAccent;
  className?: string;
}) {
  const tokens = accent ? accentTokens[accent] : null;
  return (
    <header className={cn("flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3", className)}>
      <div className="flex min-w-0 items-center gap-2">
        {Icon ? (
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", tokens?.soft ?? "bg-slate-100")}>
            <Icon className={cn("h-3.5 w-3.5", tokens?.softText ?? "text-slate-500")} />
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="card-title truncate">{title}</h3>
          {subtitle ? <p className="mt-0.5 truncate text-[11px] text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/**
 * MetricRing — circular SVG gauge for a 0-100 score. Premium stroke animation.
 */
export function MetricRing({
  value,
  size = 80,
  stroke = 7,
  label,
  sublabel,
  tone = "auto",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  /** auto = color by value (rose<40, amber<70, emerald≥70). */
  tone?: "auto" | "rose" | "amber" | "emerald" | "slate" | "cyan";
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const auto = v < 40 ? "rose" : v < 70 ? "amber" : "emerald";
  const t = tone === "auto" ? auto : tone;
  const colorMap = {
    rose: "#e11d48",
    amber: "#f59e0b",
    emerald: "#10b981",
    slate: "#475569",
    cyan: "#0891b2",
  };
  const color = colorMap[t];
  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-[16px] font-bold leading-none text-slate-900">{Math.round(v)}</span>
        {sublabel ? <span className="mt-0.5 text-[8px] font-medium uppercase tracking-wide text-slate-400">{sublabel}</span> : null}
      </div>
      {label ? <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</span> : null}
    </div>
  );
}

/**
 * StatTile — premium KPI tile with icon chip, value, delta, sparkline slot.
 */
export function StatTile({
  label,
  value,
  unit,
  delta,
  deltaTone = "auto",
  icon: Icon,
  accent,
  hint,
  children,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaTone?: "auto" | "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  accent?: RoleAccent;
  hint?: string;
  /** Optional sparkline / mini chart below the value. */
  children?: React.ReactNode;
}) {
  const tokens = accent ? accentTokens[accent] : null;
  const tone = deltaTone === "auto"
    ? delta && delta.startsWith("-") ? "negative" : "positive"
    : deltaTone;
  const deltaClass = {
    positive: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    negative: "bg-rose-50 text-rose-700 ring-rose-200",
    neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  }[tone];
  return (
    <PanelCard accent={accent} className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon ? (
            <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", tokens?.soft ?? "bg-slate-100")}>
              <Icon className={cn("h-3.5 w-3.5", tokens?.softText ?? "text-slate-500")} />
            </span>
          ) : null}
          <span className="card-title">{label}</span>
        </div>
        {delta ? (
          <span className={cn("tabular inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ring-1", deltaClass)}>
            {delta}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="tabular text-[22px] font-bold leading-none text-slate-900">{value}</span>
        {unit ? <span className="text-[11px] font-medium text-slate-400">{unit}</span> : null}
      </div>
      {children ? <div className="mt-2">{children}</div> : null}
      {hint ? <p className="mt-1.5 text-[10px] text-slate-400">{hint}</p> : null}
    </PanelCard>
  );
}

/**
 * Tag — premium pill badge with tone variants.
 */
export function Tag({
  children,
  tone = "neutral",
  size = "sm",
  icon: Icon,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "positive" | "negative" | "warning" | "info" | RoleAccent;
  size?: "xs" | "sm";
  icon?: LucideIcon;
}) {
  const toneClass: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-600 ring-slate-200",
    positive: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    negative: "bg-rose-50 text-rose-700 ring-rose-200",
    warning: "bg-amber-50 text-amber-700 ring-amber-200",
    info: "bg-sky-50 text-sky-700 ring-sky-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  };
  const sizeClass = size === "xs" ? "px-1 py-px text-[9px]" : "px-1.5 py-0.5 text-[10px]";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded font-semibold uppercase tracking-wide ring-1", sizeClass, toneClass[tone])}>
      {Icon ? <Icon className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} /> : null}
      {children}
    </span>
  );
}

/**
 * ProgressBar — premium horizontal bar with optional threshold marker.
 */
export function ProgressBar({
  value,
  max = 100,
  tone = "emerald",
  height = 6,
  showLabel = false,
  threshold,
}: {
  value: number;
  max?: number;
  tone?: "emerald" | "rose" | "amber" | "sky" | "violet" | "slate";
  height?: number;
  showLabel?: boolean;
  /** 0-100, draws a vertical threshold line. */
  threshold?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const toneClass: Record<string, string> = {
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    sky: "bg-sky-500",
    violet: "bg-violet-500",
    slate: "bg-slate-500",
  };
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 overflow-hidden rounded-full bg-slate-100" style={{ height }}>
        <motion.div
          className={cn("h-full rounded-full", toneClass[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        {threshold != null ? (
          <span
            className="absolute top-0 h-full w-px bg-slate-400/60"
            style={{ left: `${Math.max(0, Math.min(100, threshold))}%` }}
          />
        ) : null}
      </div>
      {showLabel ? (
        <span className="tabular w-10 text-right text-[10px] font-semibold text-slate-500">{Math.round(pct)}%</span>
      ) : null}
    </div>
  );
}

/**
 * Divider — premium section divider with optional label.
 */
export function Divider({ label, className }: { label?: string; className?: string }) {
  if (!label) return <hr className={cn("border-slate-100", className)} />;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <hr className="flex-1 border-slate-100" />
      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</span>
      <hr className="flex-1 border-slate-100" />
    </div>
  );
}

/**
 * EmptyState — premium empty-state with icon, title, description, action.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  accent = "slate",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  accent?: RoleAccent;
}) {
  const tokens = accentTokens[accent];
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", tokens.soft)}>
        <Icon className={cn("h-6 w-6", tokens.softText)} />
      </span>
      <div>
        <p className="text-[13px] font-semibold text-slate-700">{title}</p>
        {description ? <p className="mt-1 text-[11px] text-slate-400">{description}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

/**
 * StaggerGrid — motion container that staggers its children's entrance.
 * Wrap a grid of PanelCards / StatTiles with this for a premium cascade.
 */
export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={motionVariants.container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * MiniSparkline — pure-SVG sparkline with gradient fill. Premium + lightweight.
 */
export function MiniSparkline({
  data,
  color,
  width = 120,
  height = 32,
  fillOpacity = 0.15,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fillOpacity?: number;
}) {
  const id = React.useId();
  const stroke = color ?? "#0ea5e9";
  if (data.length < 2) return <svg width={width} height={height} />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / range) * (height - 2) - 1).toFixed(1)}`);
  const areaPts = `0,${height} ${pts.join(" ")} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${id})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** Helper: get accent tokens for a role. */
export function getAccent(role: AccountType): AccentTokens {
  return accentTokens[roleAccent[role]];
}

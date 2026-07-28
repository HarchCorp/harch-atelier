/**
 * Harch Atelier — Self-role personalization dataset (V19.0 self role)
 *
 * Deterministic, strictly-typed mock data for the personalized SELF-role
 * landing dashboard. The "self" role (S. Bauer) gets a personal command
 * center instead of the generic EnterpriseGrid. This dataset aggregates
 * references to existing entities / alerts and adds personalization layers
 * (pinned entities with notes, personal alert selection, saved-view
 * presets, personal KPI series).
 *
 * Conventions:
 *   - Deterministic seeded PRNG (mulberry32) so first paint is stable.
 *   - REUSES entity ids (HRCH / ATW / OCP / IAM) from `./entities-data`.
 *   - REUSES alert ids from `./admin-data`'s alertQueue (subset of 6).
 *   - No `any`. All exports carry strict interfaces.
 *   - Self tint = cyan-700 (matches TopBar accountMeta for `self`).
 */

import { findEntity, type Entity } from "./entities-data";
import { alertQueue } from "./admin-data";
import type { RiskPillar, Severity } from "./mock-data";

/* ------------------------------------------------------------------ */
/*  Deterministic PRNG                                                 */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20251118);

/** Build a 12-point sparkline ending at a target with bounded volatility. */
function buildSpark(end: number, volPct: number, points = 12): number[] {
  const out: number[] = [];
  let p = end * (1 - volPct * 0.4);
  for (let i = 0; i < points; i++) {
    const shock = (rng() - 0.5) * end * volPct;
    p = Math.max(0.5, p + shock + (end - p) * 0.22);
    out.push(Math.round(p * 100) / 100);
  }
  out[points - 1] = end;
  return out;
}

/* ------------------------------------------------------------------ */
/*  Self user (the analyst behind the dashboard)                       */
/* ------------------------------------------------------------------ */

export interface SelfUser {
  name: string;
  initials: string;
  role: string;
  email: string;
  /** ISO timestamp of the most recent login. */
  lastLogin: string;
  /** Human timezone label. */
  tz: string;
  /** Workspace tint (cyan-700 — matches TopBar). */
  tint: string;
  /** Workspace accent key used by SectionHeader-style heroes. */
  accent: "cyan";
}

export const selfUser: SelfUser = {
  name: "S. Bauer",
  initials: "SB",
  role: "Self Service",
  email: "s.bauer@harchcorp.ma",
  lastLogin: "2025-11-18T08:14:00Z",
  tz: "Africa/Casablanca (GMT+1)",
  tint: "bg-cyan-700",
  accent: "cyan",
};

/* ------------------------------------------------------------------ */
/*  Pinned entities (the analyst's personal watch shortlist)           */
/* ------------------------------------------------------------------ */

export interface PinnedEntity {
  /** Entity id — references entities-data.entityDirectory. */
  entityId: string;
  /** Resolved Entity object (or undefined if missing). */
  entity: Entity | undefined;
  /** Personal note explaining why this entity is pinned. */
  note: string;
  /** ISO short date when the pin was added. */
  pinnedAt: string;
  /** Personal priority tag. */
  priority: "primary" | "watching" | "context";
}

export const pinnedEntityIds: string[] = ["HRCH", "ATW", "OCP", "IAM"];

export const pinnedEntities: PinnedEntity[] = [
  {
    entityId: "HRCH",
    entity: findEntity("HRCH"),
    note: "Monitored self · Q4 inquiry + cyber claim tracking",
    pinnedAt: "2025-11-12",
    priority: "primary",
  },
  {
    entityId: "ATW",
    entity: findEntity("ATW"),
    note: "Banking peer · earnings readout + AMMC fine follow-up",
    pinnedAt: "2025-11-10",
    priority: "watching",
  },
  {
    entityId: "OCP",
    entity: findEntity("OCP"),
    note: "Phosphate cycle · green hydrogen capex signal",
    pinnedAt: "2025-11-08",
    priority: "context",
  },
  {
    entityId: "IAM",
    entity: findEntity("IAM"),
    note: "Telecom · 5G launch + interconnect dispute",
    pinnedAt: "2025-11-06",
    priority: "watching",
  },
];

/* ------------------------------------------------------------------ */
/*  Personal alerts — a 6-item subset of the admin alertQueue          */
/* ------------------------------------------------------------------ */

export interface PersonalAlert {
  /** Mirrors the source alert id from admin-data.alertQueue. */
  sourceAlertId: string;
  /** Short title for the personal digest. */
  title: string;
  /** Entity name (free-text label, mirrors alertQueue.entity). */
  entity: string;
  pillar: RiskPillar;
  severity: Severity;
  /** ISO timestamp. */
  triggeredAt: string;
  /** SLA minutes remaining (negative = breach). */
  slaMinutes: number;
  /** Trigger rule description. */
  rule: string;
  /** Pre-computed relative-time label for first paint. */
  relativeTime: string;
  /** Whether the analyst has acknowledged it in their personal digest. */
  acknowledged: boolean;
}

function toRelativeLabel(iso: string, now = new Date("2025-11-18T09:00:00Z")): string {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/**
 * Pick the 6 most actionable alerts (open / breach / assigned) from the
 * shared alertQueue and tag them as personal-digest items. We exclude
 * resolved alerts since they're noise in a personal digest.
 */
export const personalAlerts: PersonalAlert[] = alertQueue
  .filter((a) => a.status !== "resolved")
  .slice(0, 6)
  .map((a, i) => ({
    sourceAlertId: a.id,
    title: a.rule,
    entity: a.entity,
    pillar: a.pillar,
    severity: a.severity,
    triggeredAt: a.triggeredAt,
    slaMinutes: a.slaMinutes,
    rule: a.rule,
    relativeTime: toRelativeLabel(a.triggeredAt),
    acknowledged: i >= 4, // last 2 are already acknowledged in this digest
  }));

export const personalAlertSummary = {
  total: personalAlerts.length,
  critical: personalAlerts.filter((a) => a.severity === "critical").length,
  high: personalAlerts.filter((a) => a.severity === "high").length,
  medium: personalAlerts.filter((a) => a.severity === "medium").length,
  low: personalAlerts.filter((a) => a.severity === "low").length,
  unack: personalAlerts.filter((a) => !a.acknowledged).length,
};

/* ------------------------------------------------------------------ */
/*  Saved views — personal presets the analyst has curated             */
/* ------------------------------------------------------------------ */

export type SavedViewIcon = "alert-triangle" | "landmark" | "trending-up" | "leaf";

export interface SelfSavedView {
  id: string;
  name: string;
  description: string;
  icon: SavedViewIcon;
  /** Number of entities the view surfaces. */
  entityCount: number;
  filterPillar: RiskPillar | "all";
  /** Relative-time label for when the view was last opened. */
  lastOpened: string;
  /** Tailwind tint classes for the icon chip. */
  tint: string;
}

export const savedViews: SelfSavedView[] = [
  {
    id: "sv-crisis",
    name: "Crisis Watch",
    description: "Critical + high severity, last 24h, all pillars",
    icon: "alert-triangle",
    entityCount: 6,
    filterPillar: "all",
    lastOpened: "2h ago",
    tint: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  {
    id: "sv-banks",
    name: "Banking Peers",
    description: "ATW · BOA · BCP · CIH peer benchmark",
    icon: "landmark",
    entityCount: 4,
    filterPillar: "Financial",
    lastOpened: "yesterday",
    tint: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  {
    id: "sv-casa",
    name: "Casablanca Movers",
    description: "Casablanca-HQ entities · 7-day risk movers",
    icon: "trending-up",
    entityCount: 9,
    filterPillar: "all",
    lastOpened: "3d ago",
    tint: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    id: "sv-esg",
    name: "ESG Watch",
    description: "ESG pillar signals across portfolio",
    icon: "leaf",
    entityCount: 5,
    filterPillar: "ESG",
    lastOpened: "5d ago",
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
];

/* ------------------------------------------------------------------ */
/*  Quick actions — the analyst's personal shortcut bar               */
/* ------------------------------------------------------------------ */

export type QuickActionIcon = "plus-circle" | "bell-plus" | "download";

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: QuickActionIcon;
  tint: string;
}

export const quickActions: QuickAction[] = [
  {
    id: "qa-add-entity",
    label: "Add entity to watch",
    description: "Search the directory and start tracking an entity.",
    icon: "plus-circle",
    tint: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
  {
    id: "qa-create-alert",
    label: "Create alert rule",
    description: "Define a threshold and get notified on breach.",
    icon: "bell-plus",
    tint: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    id: "qa-export-digest",
    label: "Export my digest",
    description: "Download today's personalized digest as PDF.",
    icon: "download",
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
];

/* ------------------------------------------------------------------ */
/*  Personal KPI series — 4 cards with sparklines                      */
/* ------------------------------------------------------------------ */

export interface SelfKpi {
  label: string;
  value: number;
  /** Display-formatted value (e.g. "16", "6 open"). */
  display: string;
  /** Delta vs prior period (positive = good unless invertDelta). */
  delta: number;
  invertDelta: boolean;
  /** 12-point sparkline. */
  spark: number[];
  /** Sparkline stroke color (hex). */
  sparkColor: string;
  /** Tailwind accent for the icon chip. */
  accent: string;
  hint: string;
}

/** Tracked-entities count mirrors entities-data watchlistSummary.total. */
export const selfKpis: SelfKpi[] = [
  {
    label: "My Tracked Entities",
    value: 16,
    display: "16",
    delta: 2,
    invertDelta: false,
    spark: buildSpark(16, 0.12),
    sparkColor: "#0e7490", // cyan-700
    accent: "bg-cyan-50 text-cyan-700",
    hint: "Pinned + watchlist · synced with entity directory",
  },
  {
    label: "My Open Alerts",
    value: 6,
    display: "6 open",
    delta: -2,
    invertDelta: true,
    spark: buildSpark(6, 0.18),
    sparkColor: "#e11d48", // rose-600
    accent: "bg-rose-50 text-rose-700",
    hint: "2 critical · 2 high · 1 medium · 1 low · 4 unack",
  },
  {
    label: "My Saved Views",
    value: 4,
    display: "4",
    delta: 1,
    invertDelta: false,
    spark: buildSpark(4, 0.1),
    sparkColor: "#8b5cf6", // violet-500
    accent: "bg-violet-50 text-violet-700",
    hint: "Personal presets · Crisis / Banking / Casa / ESG",
  },
  {
    label: "My Activity Today",
    value: 7,
    display: "7 actions",
    delta: 3,
    invertDelta: false,
    spark: buildSpark(7, 0.2),
    sparkColor: "#10b981", // emerald-500
    accent: "bg-emerald-50 text-emerald-700",
    hint: "Acks · escalations · saved-view loads · exports",
  },
];

/* ------------------------------------------------------------------ */
/*  Hero summary chips — quick at-a-glance badges                      */
/* ------------------------------------------------------------------ */

export interface HeroSummaryChip {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "negative" | "warning";
}

export const heroSummaryChips: HeroSummaryChip[] = [
  { label: "Pinned", value: "4", tone: "neutral" },
  { label: "Unack alerts", value: "4", tone: "negative" },
  { label: "Watchlisted", value: "16", tone: "neutral" },
  { label: "Live signals", value: "LIVE", tone: "positive" },
];

/* ------------------------------------------------------------------ */
/*  Formatters                                                         */
/* ------------------------------------------------------------------ */

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/** Friendly greeting based on the analyst's local hour. */
export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

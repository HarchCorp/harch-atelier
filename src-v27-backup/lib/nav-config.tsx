"use client";
/**
 * Harch Atelier — Master navigation catalog (V13.0)
 *
 * The "huge database" of every navigable surface in the platform. Each role
 * (admin / trader / legal / market / self / pr) then selects which categories
 * to expose via `navByRole`. This is the single source of truth for the left
 * sidebar, the command palette, and breadcrumbs.
 *
 * Pattern: master catalog → limit/expand per role → apply calculations per role
 * (calculations live in the section components themselves, not here).
 */
import {
  LayoutDashboard,
  Radar,
  Activity,
  Grid3x3,
  Newspaper,
  Smile,
  PieChart,
  AlertTriangle,
  Eye,
  ListChecks,
  Bell,
  TrendingUp,
  Landmark,
  BarChart3,
  CandlestickChart,
  Briefcase,
  Coins,
  Globe2,
  PiggyBank,
  ShieldAlert,
  Gauge,
  Scale,
  Lock,
  Wallet,
  Leaf,
  Megaphone,
  Gavel,
  FileWarning,
  ScrollText,
  MessageSquare,
  Mail,
  Star,
  Building2,
  Users,
  Network,
  Flag,
  Settings,
  UserCog,
  Database,
  Plug,
  CreditCard,
  LineChart,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { AccountType } from "@/lib/mock-data";

export type BadgeTone = "danger" | "warn" | "info" | "neutral" | "success";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Optional count badge. */
  badge?: { text: string; tone: BadgeTone };
  /** Short description shown in tooltips / command palette. */
  hint?: string;
}

export interface NavCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

/** Universal dashboard — always shown, always first. */
export const universalDashboardItem: NavItem = {
  id: "dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
  hint: "Universal overview — risk, coverage, sentiment at a glance.",
};

/* ------------------------------------------------------------------ */
/*  MASTER CATALOG                                                     */
/*  Every navigable surface in the platform. Roles select subsets.     */
/* ------------------------------------------------------------------ */

export const masterCatalog: NavCategory[] = [
  {
    id: "intelligence",
    label: "Intelligence",
    icon: Radar,
    items: [
      { id: "intel-overview", label: "Overview", icon: Activity, hint: "Composite risk index + headline KPIs." },
      { id: "intel-risk-matrix", label: "Risk Matrix", icon: Grid3x3, hint: "Frequency vs media-impact scatter." },
      { id: "intel-coverage", label: "Media Coverage", icon: Newspaper, hint: "30-day positive/negative coverage." },
      { id: "intel-sentiment", label: "Sentiment Trend", icon: Smile, hint: "12-month sentiment split." },
      { id: "intel-sov", label: "Share of Voice", icon: PieChart, hint: "Target vs competitors article share." },
      { id: "intel-events", label: "Risk Events", icon: AlertTriangle, badge: { text: "14", tone: "warn" }, hint: "Materialised risk events, triageable." },
      { id: "intel-watchlist", label: "Watchlist", icon: Eye, hint: "Tracked entities + live signals." },
      { id: "intel-activity", label: "Activity Feed", icon: ListChecks, hint: "Analyst + system event stream." },
      { id: "intel-alerts", label: "Alerts", icon: Bell, badge: { text: "3", tone: "danger" }, hint: "Threshold breaches awaiting triage." },
    ],
  },
  {
    id: "markets",
    label: "Markets & Trading",
    icon: TrendingUp,
    items: [
      { id: "mkt-bvc", label: "Bourse de Casablanca", icon: Landmark, hint: "BVC indices, movers, session data." },
      { id: "mkt-indices", label: "Indices", icon: BarChart3, hint: "MASI, MASI 20, sector indices." },
      { id: "mkt-equities", label: "Equities", icon: CandlestickChart, hint: "Moroccan listed equities + screener." },
      { id: "mkt-positions", label: "Positions", icon: Briefcase, hint: "HarchCorp open positions + P&L." },
      { id: "mkt-fx", label: "FX & Rates", icon: Coins, hint: "MAD crosses + key rates." },
      { id: "mkt-commodities", label: "Commodities", icon: Globe2, hint: "Energy, metals, softs exposure." },
      { id: "mkt-fixed-income", label: "Fixed Income", icon: PiggyBank, hint: "Bonds, T-bills, yield curve." },
    ],
  },
  {
    id: "risk",
    label: "Risk & Compliance",
    icon: ShieldAlert,
    items: [
      { id: "risk-overview", label: "Risk Overview", icon: Gauge, hint: "6-pillar risk score breakdown." },
      { id: "risk-regulatory", label: "Regulatory", icon: Scale, hint: "AMMC, BCBS, AMO obligations." },
      { id: "risk-cyber", label: "Cyber", icon: Lock, hint: "Threat intel + incident posture." },
      { id: "risk-financial", label: "Financial", icon: Wallet, hint: "Credit, liquidity, market risk." },
      { id: "risk-esg", label: "ESG", icon: Leaf, hint: "Environmental, social, governance." },
      { id: "risk-geo", label: "Geopolitical", icon: Globe2, hint: "Sanctions, trade, regional risk." },
      { id: "risk-rep", label: "Reputational", icon: Megaphone, hint: "Brand + executive reputation." },
      { id: "risk-matters", label: "Legal Matters", icon: Gavel, hint: "Open matters + counsel tracking." },
      { id: "risk-holds", label: "Hold Notices", icon: FileWarning, hint: "Litigation hold notices." },
      { id: "risk-audit", label: "Audit Log", icon: ScrollText, hint: "Immutable platform audit trail." },
    ],
  },
  {
    id: "comms",
    label: "Communications",
    icon: Megaphone,
    items: [
      { id: "comms-overview", label: "Comms Overview", icon: Activity, hint: "Reputation + sentiment pulse." },
      { id: "comms-sentiment", label: "Sentiment", icon: Smile, hint: "Tone across outlets + social." },
      { id: "comms-sov", label: "Share of Voice", icon: PieChart, hint: "Owned vs earned vs competitors." },
      { id: "comms-coverage", label: "Coverage", icon: Newspaper, hint: "Article-level coverage feed." },
      { id: "comms-campaigns", label: "Campaigns", icon: Mail, hint: "Active PR campaigns + ROI." },
      { id: "comms-reputation", label: "Reputation Score", icon: Star, hint: "Net reputation + NPS proxy." },
      { id: "comms-press", label: "Press Releases", icon: FileText, hint: "Draft + published releases." },
      { id: "comms-social", label: "Social Listening", icon: MessageSquare, hint: "Real-time social mentions." },
    ],
  },
  {
    id: "entities",
    label: "Entities",
    icon: Building2,
    items: [
      { id: "ent-directory", label: "Directory", icon: Building2, hint: "All monitored entities." },
      { id: "ent-moroccan", label: "Moroccan Companies", icon: Flag, hint: "Casablanca-listed + private MA cos." },
      { id: "ent-profiles", label: "Profiles", icon: Users, hint: "Deep entity dossiers." },
      { id: "ent-peers", label: "Peer Groups", icon: Network, hint: "Competitor / peer benchmarking." },
      { id: "ent-watchlist", label: "Watchlist", icon: Eye, hint: "Tracked entities + signals." },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    icon: Settings,
    items: [
      { id: "admin-users", label: "Users & Roles", icon: UserCog, hint: "IdP, RBAC, provisioning." },
      { id: "admin-sources", label: "Data Sources", icon: Database, hint: "Ingestion pipelines + health." },
      { id: "admin-integrations", label: "Integrations", icon: Plug, hint: "BVC, Bloomberg, GLM, etc." },
      { id: "admin-billing", label: "Billing", icon: CreditCard, hint: "Plan, usage, invoices." },
      { id: "admin-settings", label: "Settings", icon: Settings, hint: "Workspace + preferences." },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  PER-ROLE SELECTION                                                 */
/*  Each role sees a curated subset of the master catalog.             */
/* ------------------------------------------------------------------ */

export const navByRole: Record<AccountType, string[]> = {
  admin: ["intelligence", "markets", "risk", "comms", "entities", "admin"],
  trader: ["markets", "intelligence", "risk", "entities"],
  legal: ["risk", "intelligence", "entities"],
  market: ["intelligence", "markets", "comms", "entities"],
  self: ["intelligence", "entities"],
  pr: ["comms", "intelligence", "entities"],
};

/** Returns the resolved nav (categories + items) for a given role. */
export function resolveNav(role: AccountType): {
  dashboard: NavItem;
  categories: NavCategory[];
} {
  const ids = navByRole[role] ?? [];
  const categories = ids
    .map((id) => masterCatalog.find((c) => c.id === id))
    .filter((c): c is NavCategory => Boolean(c));
  return { dashboard: universalDashboardItem, categories };
}

/** Flatten every navigable item (for the command palette / search). */
export function flattenNav(role: AccountType): {
  category: string;
  item: NavItem;
}[] {
  const { dashboard, categories } = resolveNav(role);
  const flat: { category: string; item: NavItem }[] = [
    { category: "Dashboard", item: dashboard },
  ];
  for (const c of categories) {
    for (const item of c.items) {
      flat.push({ category: c.label, item });
    }
  }
  return flat;
}

/** Find a nav item by id across the master catalog (used for titles/breadcrumbs). */
export function findNavItem(itemId: string): {
  category?: NavCategory;
  item: NavItem;
} | null {
  if (itemId === universalDashboardItem.id) {
    return { item: universalDashboardItem };
  }
  for (const c of masterCatalog) {
    const found = c.items.find((i) => i.id === itemId);
    if (found) return { category: c, item: found };
  }
  return null;
}

/** Tone → Tailwind classes for sidebar badges. */
export const badgeToneClass: Record<BadgeTone, string> = {
  danger: "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30",
  warn: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30",
  info: "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30",
  success: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30",
  neutral: "bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/30",
};

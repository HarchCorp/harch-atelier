"use client";

/**
 * Harch Atelier — Section registry + placeholder (V13.0)
 *
 * Maps every navigable section id → metadata (title, description, category,
 * planned widgets). The universal `dashboard` section renders the existing
 * Enterprise/Trader grid. Every other section renders a polished placeholder
 * scaffold that downstream role-agents will replace with real content.
 *
 * Agent contract: to fill in a section, create a component and register it in
 * `sectionComponents` below. Keep the same surface signature:
 *   (props: SectionComponentProps) => JSX.Element
 */
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Construction,
  ChevronRight,
  Sparkles,
  type LucideIcon,
  Boxes,
  LineChart,
  Table2,
  Map,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { findNavItem } from "@/lib/nav-config";
import type { AccountType, RiskEvent } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Section metadata (titles / descriptions / planned widgets)         */
/* ------------------------------------------------------------------ */

export interface SectionMeta {
  id: string;
  title: string;
  description: string;
  /** Planned widget skeleton — shown in the placeholder to telegraph intent. */
  planned: { icon: LucideIcon; label: string }[];
}

const sectionMeta: Record<string, SectionMeta> = {
  dashboard: {
    id: "dashboard",
    title: "Dashboard",
    description: "Universal overview — risk, coverage, sentiment at a glance.",
    planned: [],
  },
  // Intelligence
  "intel-overview": {
    id: "intel-overview",
    title: "Intelligence Overview",
    description: "Composite risk index + headline KPIs across every monitored entity.",
    planned: [
      { icon: Gauge, label: "Composite Risk Index" },
      { icon: LineChart, label: "Risk trend (30d)" },
      { icon: Boxes, label: "Pillar breakdown" },
      { icon: Table2, label: "Top movers" },
    ],
  },
  "intel-risk-matrix": {
    id: "intel-risk-matrix",
    title: "Risk Matrix",
    description: "Frequency vs media-impact scatter — bubble size = article volume.",
    planned: [
      { icon: Map, label: "Quadrant scatter" },
      { icon: Table2, label: "Signal table" },
    ],
  },
  "intel-coverage": {
    id: "intel-coverage",
    title: "Media Coverage",
    description: "30-day positive / negative coverage across 1,840 sources.",
    planned: [{ icon: LineChart, label: "Stacked area" }, { icon: Table2, label: "Outlet table" }],
  },
  "intel-sentiment": {
    id: "intel-sentiment",
    title: "Sentiment Trend",
    description: "12-month positive vs negative sentiment split, GLM-4 classified.",
    planned: [{ icon: LineChart, label: "12m sentiment" }],
  },
  "intel-sov": {
    id: "intel-sov",
    title: "Share of Voice",
    description: "Target vs competitor article share, by outlet tier.",
    planned: [{ icon: Boxes, label: "Donut + bars" }],
  },
  "intel-events": {
    id: "intel-events",
    title: "Risk Events",
    description: "Materialised risk events, triageable by severity and pillar.",
    planned: [{ icon: Table2, label: "Events table" }],
  },
  "intel-watchlist": {
    id: "intel-watchlist",
    title: "Watchlist",
    description: "Tracked entities with live signal pulses.",
    planned: [{ icon: Table2, label: "Signals grid" }],
  },
  "intel-activity": {
    id: "intel-activity",
    title: "Activity Feed",
    description: "Analyst + system event stream across the workspace.",
    planned: [{ icon: Table2, label: "Timeline" }],
  },
  "intel-alerts": {
    id: "intel-alerts",
    title: "Alerts",
    description: "Threshold breaches awaiting analyst triage.",
    planned: [{ icon: Table2, label: "Alerts queue" }],
  },
  // Markets
  "mkt-bvc": {
    id: "mkt-bvc",
    title: "Bourse de Casablanca",
    description: "MASI indices, session movers, and Casablanca-listed equities.",
    planned: [
      { icon: Gauge, label: "MASI / MASI 20" },
      { icon: LineChart, label: "Index chart" },
      { icon: Table2, label: "Top movers" },
    ],
  },
  "mkt-indices": {
    id: "mkt-indices",
    title: "Indices",
    description: "Moroccan All Shares + sector indices performance.",
    planned: [{ icon: LineChart, label: "Index heatmap" }],
  },
  "mkt-equities": {
    id: "mkt-equities",
    title: "Equities",
    description: "Moroccan listed equities screener — Attijariwafa, Maroc Telecom, etc.",
    planned: [{ icon: Table2, label: "Screener" }],
  },
  "mkt-positions": {
    id: "mkt-positions",
    title: "Positions",
    description: "HarchCorp open positions with mark-to-market P&L.",
    planned: [{ icon: Table2, label: "Position blotter" }],
  },
  "mkt-fx": {
    id: "mkt-fx",
    title: "FX & Rates",
    description: "MAD crosses (EUR/MAD, USD/MAD) + Bank Al-Maghrib key rates.",
    planned: [{ icon: LineChart, label: "FX board" }],
  },
  "mkt-commodities": {
    id: "mkt-commodities",
    title: "Commodities",
    description: "Energy, metals, and softs exposure relevant to HarchCorp.",
    planned: [{ icon: LineChart, label: "Commodities board" }],
  },
  "mkt-fixed-income": {
    id: "mkt-fixed-income",
    title: "Fixed Income",
    description: "Moroccan T-bills, corporate bonds, yield curve.",
    planned: [{ icon: LineChart, label: "Yield curve" }],
  },
  // Risk
  "risk-overview": {
    id: "risk-overview",
    title: "Risk Overview",
    description: "6-pillar risk score breakdown — Regulatory, Cyber, Financial, ESG, Geo, Reputational.",
    planned: [{ icon: Boxes, label: "Pillar bars" }],
  },
  "risk-regulatory": {
    id: "risk-regulatory",
    title: "Regulatory Risk",
    description: "AMMC, BCBS, AMO obligations and filing posture.",
    planned: [{ icon: Table2, label: "Obligations register" }],
  },
  "risk-cyber": {
    id: "risk-cyber",
    title: "Cyber Risk",
    description: "Threat intel feed + incident response posture.",
    planned: [{ icon: Table2, label: "Threat feed" }],
  },
  "risk-financial": {
    id: "risk-financial",
    title: "Financial Risk",
    description: "Credit, liquidity, and market risk metrics.",
    planned: [{ icon: Gauge, label: "VaR / liquidity" }],
  },
  "risk-esg": {
    id: "risk-esg",
    title: "ESG Risk",
    description: "Environmental, social, governance disclosure posture.",
    planned: [{ icon: Boxes, label: "E/S/G scores" }],
  },
  "risk-geo": {
    id: "risk-geo",
    title: "Geopolitical Risk",
    description: "Sanctions, trade, and regional exposure.",
    planned: [{ icon: Map, label: "Geo heatmap" }],
  },
  "risk-rep": {
    id: "risk-rep",
    title: "Reputational Risk",
    description: "Brand and executive reputation monitoring.",
    planned: [{ icon: Gauge, label: "Reputation index" }],
  },
  "risk-matters": {
    id: "risk-matters",
    title: "Legal Matters",
    description: "Open legal matters with counsel tracking.",
    planned: [{ icon: Table2, label: "Matters register" }],
  },
  "risk-holds": {
    id: "risk-holds",
    title: "Hold Notices",
    description: "Active litigation hold notices.",
    planned: [{ icon: Table2, label: "Holds register" }],
  },
  "risk-audit": {
    id: "risk-audit",
    title: "Audit Log",
    description: "Immutable platform audit trail.",
    planned: [{ icon: Table2, label: "Audit table" }],
  },
  // Comms
  "comms-overview": {
    id: "comms-overview",
    title: "Communications Overview",
    description: "Reputation + sentiment pulse for the comms desk.",
    planned: [{ icon: Gauge, label: "Reputation score" }],
  },
  "comms-sentiment": {
    id: "comms-sentiment",
    title: "Sentiment",
    description: "Tone across outlets and social channels.",
    planned: [{ icon: LineChart, label: "Sentiment trend" }],
  },
  "comms-sov": {
    id: "comms-sov",
    title: "Share of Voice",
    description: "Owned vs earned vs competitor share.",
    planned: [{ icon: Boxes, label: "SoV donut" }],
  },
  "comms-coverage": {
    id: "comms-coverage",
    title: "Coverage",
    description: "Article-level coverage feed.",
    planned: [{ icon: Table2, label: "Coverage feed" }],
  },
  "comms-campaigns": {
    id: "comms-campaigns",
    title: "Campaigns",
    description: "Active PR campaigns with ROI tracking.",
    planned: [{ icon: Table2, label: "Campaign tracker" }],
  },
  "comms-reputation": {
    id: "comms-reputation",
    title: "Reputation Score",
    description: "Net reputation score + NPS proxy.",
    planned: [{ icon: Gauge, label: "Net rep score" }],
  },
  "comms-press": {
    id: "comms-press",
    title: "Press Releases",
    description: "Draft and published press releases.",
    planned: [{ icon: Table2, label: "Release library" }],
  },
  "comms-social": {
    id: "comms-social",
    title: "Social Listening",
    description: "Real-time social mentions across platforms.",
    planned: [{ icon: Table2, label: "Mentions feed" }],
  },
  // Entities
  "ent-directory": {
    id: "ent-directory",
    title: "Entity Directory",
    description: "All monitored entities — public, private, peer.",
    planned: [{ icon: Table2, label: "Entity table" }],
  },
  "ent-moroccan": {
    id: "ent-moroccan",
    title: "Moroccan Companies",
    description: "Casablanca-listed + private Moroccan corporates.",
    planned: [{ icon: Table2, label: "MA company list" }],
  },
  "ent-profiles": {
    id: "ent-profiles",
    title: "Entity Profiles",
    description: "Deep entity dossiers — financials, risk, news.",
    planned: [{ icon: Boxes, label: "Profile cards" }],
  },
  "ent-peers": {
    id: "ent-peers",
    title: "Peer Groups",
    description: "Competitor / peer benchmarking.",
    planned: [{ icon: Boxes, label: "Peer matrix" }],
  },
  "ent-watchlist": {
    id: "ent-watchlist",
    title: "Entity Watchlist",
    description: "Tracked entities with live signals.",
    planned: [{ icon: Table2, label: "Watchlist grid" }],
  },
  // Admin
  "admin-users": {
    id: "admin-users",
    title: "Users & Roles",
    description: "Identity provider, RBAC, provisioning.",
    planned: [{ icon: Table2, label: "User table" }],
  },
  "admin-sources": {
    id: "admin-sources",
    title: "Data Sources",
    description: "Ingestion pipelines + health metrics.",
    planned: [{ icon: Table2, label: "Source health" }],
  },
  "admin-integrations": {
    id: "admin-integrations",
    title: "Integrations",
    description: "BVC, Bloomberg, GLM, and downstream connectors.",
    planned: [{ icon: Boxes, label: "Integration cards" }],
  },
  "admin-billing": {
    id: "admin-billing",
    title: "Billing",
    description: "Plan, usage, and invoices.",
    planned: [{ icon: Table2, label: "Usage + invoices" }],
  },
  "admin-settings": {
    id: "admin-settings",
    title: "Settings",
    description: "Workspace + user preferences.",
    planned: [{ icon: Boxes, label: "Settings panels" }],
  },
};

export function getSectionMeta(id: string): SectionMeta {
  return (
    sectionMeta[id] ?? {
      id,
      title: id,
      description: "",
      planned: [],
    }
  );
}

/* ------------------------------------------------------------------ */
/*  Placeholder — polished scaffold for unbuilt sections               */
/* ------------------------------------------------------------------ */

export interface SectionComponentProps {
  accountType: AccountType;
  onSelect: (e: RiskEvent) => void;
  onSelectEvent: (id: string) => void;
  onSelectEntity: (entity: string) => void;
}

export function SectionPlaceholder({
  sectionId,
  accountType,
}: {
  sectionId: string;
  accountType: AccountType;
}) {
  const meta = getSectionMeta(sectionId);
  const nav = findNavItem(sectionId);
  const categoryName = nav?.category?.label ?? "Section";
  const PlannedIcon = nav?.item.icon ?? Construction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-5"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <Link href="#dashboard" className="hover:text-slate-700">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-500">{categoryName}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-slate-700">{meta.title}</span>
      </nav>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              <PlannedIcon className="h-5 w-5 text-emerald-300" />
            </span>
            <div>
              <h2 className="text-[20px] font-bold tracking-tight">{meta.title}</h2>
              <p className="text-[12px] text-slate-300">{meta.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300 ring-1 ring-amber-500/25">
              <Construction className="h-3 w-3" />
              Scaffolded — role-agent pending
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
              <Sparkles className="h-3 w-3 text-emerald-300" />
              Workspace: {accountType}
            </span>
          </div>
        </div>
      </div>

      {/* Planned widget grid */}
      {meta.planned.length > 0 ? (
        <div>
          <p className="card-title mb-2">Planned widgets</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {meta.planned.map((w) => {
              const Icon = w.icon;
              return (
                <div
                  key={w.label}
                  className="group relative flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 transition-colors hover:border-slate-400 hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[12px] font-medium text-slate-700">{w.label}</span>
                  <span className="text-[10px] text-slate-400">Awaiting build</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Skeleton preview — telegraphs the future layout */}
      <div>
        <p className="card-title mb-2">Layout preview</p>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
                i === 2 && "xl:col-span-2",
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-3 w-28 rounded bg-slate-200" />
                <div className="h-5 w-5 rounded bg-slate-100" />
              </div>
              <div className="flex items-end gap-1.5">
                {[40, 65, 50, 80, 55, 72, 60, 90, 48, 68].map((h, j) => (
                  <div
                    key={j}
                    className="flex-1 rounded-t bg-slate-100"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-2.5 w-full rounded bg-slate-100" />
                <div className="h-2.5 w-2/3 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

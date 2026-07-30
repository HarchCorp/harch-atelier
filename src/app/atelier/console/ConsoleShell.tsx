"use client";

import React, { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import BrandBadge from "@/components/BrandBadge";
import { C as TOKENS } from "../components/tokens";
import { BrandMonitorDashboard } from "./views/BrandMonitorDashboard";
import { CompetitorIntelDashboard } from "./views/CompetitorIntelDashboard";

// ═══════════════════════════════════════════════════════════════
//  HARCHIQ CONSOLE — Shell (CONSOLE-V3)
//
//  Visual layout matches EXACTLY the `DashboardMockup` component
//  from src/app/atelier/AtelierHome.tsx (lines 1713-2208).
//
//  Architecture:
//    • Top bar : BrandBadge + Search + Tier switcher + Bell + Avatar
//    • 3-column grid : Sidebar (200px) · Main (1fr) · Right (280px)
//    • Responsive : ≤1024px hides right panel · ≤900px hides sidebar
//
//  APIs consumed (kept intact):
//    • GET /api/console/weather  → score, breakdown, company name
//    • GET /api/console/neighbors → competitors (Neighbors view)
//
//  Auth is handled in page.tsx (server-side getServerSession).
// ═══════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS (mirror of AtelierHome.tsx local C) ─────────────
// `C` from tokens.ts has only the DS V2 base keys. We extend it with
// legacy aliases (surface, sage, textPrimary, …) so the mockup JSX
// renders with the exact same colors as the landing page.
const C = {
  ...TOKENS,
  surface: TOKENS.bg,             // bg-white
  surfaceAlt: TOKENS.bgHover,     // bg-neutral-100
  borderLight: TOKENS.border,     // border-neutral-200
  textPrimary: TOKENS.text,       // text-neutral-950
  textSecondary: TOKENS.textBody, // text-neutral-600
  textFaint: TOKENS.textOnDarkBody, // neutral-400
  accentDark: TOKENS.accentHover, // stone-600
  sage: TOKENS.accent,            // stone-500
  sageBright: TOKENS.accentBright,// stone-400
  sageDark: TOKENS.accentHover,   // stone-600
  sageBg: "rgba(120,113,108,0.08)",
  red: TOKENS.danger,
  redBg: TOKENS.dangerBg,
  neutral: TOKENS.textMuted,
  neutralBg: "rgba(115,115,115,0.10)",
};

const FONT = {
  sans: C.fontSans, // Inter
  mono: C.fontMono, // Space Mono
};

const SHADOW = {
  card: C.shadowSm,
  cardHover: C.shadowMd,
  hero: C.shadowMd,
  deep: C.shadowMd,
};

// ─── DATA (copied verbatim from AtelierHome.tsx) ───────────────────

// 30-day sentiment series (positive + neutral + negative = 100 each day)
const SENTIMENT_30D = {
  positive: [62, 64, 63, 66, 65, 68, 67, 69, 71, 70, 68, 66, 67, 69, 71, 73, 72, 70, 68, 66, 65, 67, 69, 71, 73, 74, 72, 70, 68, 68],
  neutral:  [25, 24, 23, 22, 24, 22, 23, 21, 20, 22, 23, 24, 22, 21, 20, 19, 20, 22, 24, 25, 24, 23, 21, 20, 19, 18, 20, 22, 23, 22],
  negative: [13, 12, 14, 12, 11, 10, 10, 10,  9,  8,  9, 10, 11, 10,  9,  8,  8,  8,  8,  9, 11, 10, 10,  9,  8,  8,  8,  8,  9, 10],
};

// Top topics for dashboard right panel
const TOPICS = [
  { name: "Frais bancaires", positive: 42, negative: 48, mentions: 89, risk: true },
  { name: "Service client", positive: 71, negative: 18, mentions: 67, risk: false },
  { name: "Application mobile", positive: 65, negative: 22, mentions: 54, risk: false },
  { name: "Taux de crédit", positive: 55, negative: 30, mentions: 41, risk: false },
  { name: "Réseau d'agences", positive: 73, negative: 15, mentions: 38, risk: false },
];

// ─── SVG PATH HELPERS (copied from AtelierHome.tsx) ────────────────

function buildLinePath(data: number[], w: number, h: number, max = 100): string {
  const step = w / (data.length - 1);
  return data
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildAreaPath(data: number[], w: number, h: number, max = 100): string {
  const step = w / (data.length - 1);
  const line = data
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return `${line} L ${w.toFixed(1)} ${h.toFixed(1)} L 0 ${h.toFixed(1)} Z`;
}

// ─── SVG ICONS (copied verbatim from AtelierHome.tsx) ──────────────

function IconMonitor({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconChart({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 3 3 5-5" />
    </svg>
  );
}

function IconUsers({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconReport({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );
}

function IconSearch({ size = 16, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── MOCKUP SUB-COMPONENTS (copied verbatim from AtelierHome.tsx) ──

function ChartLegend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "2px",
          background: color,
        }}
      />
      <span style={{ fontSize: "11px", color: C.textSecondary, fontFamily: FONT.sans }}>
        {label}
      </span>
    </div>
  );
}

function SentimentLineChart() {
  const w = 600;
  const h = 220;
  const padding = { top: 10, right: 10, bottom: 10, left: 30 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  return (
    <svg
      width="100%"
      height="220"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.sage} stopOpacity="0.15" />
          <stop offset="100%" stopColor={C.sage} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((y) => {
        const yPos = padding.top + chartH - (y / 100) * chartH;
        return (
          <g key={y}>
            <line
              x1={padding.left}
              y1={yPos}
              x2={w - padding.right}
              y2={yPos}
              stroke={C.borderLight}
              strokeWidth="1"
              strokeDasharray={y === 0 ? "0" : "2,3"}
            />
            <text
              x={padding.left - 8}
              y={yPos + 3}
              fontSize="9"
              fontFamily={FONT.mono}
              fill={C.textMuted}
              textAnchor="end"
            >
              {y}
            </text>
          </g>
        );
      })}

      {/* Positive area */}
      <path
        d={buildAreaPath(SENTIMENT_30D.positive, chartW, chartH, 100)}
        fill="url(#posGrad)"
        transform={`translate(${padding.left}, ${padding.top})`}
      />

      {/* Lines */}
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        <path
          d={buildLinePath(SENTIMENT_30D.positive, chartW, chartH, 100)}
          fill="none"
          stroke={C.sage}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={buildLinePath(SENTIMENT_30D.neutral, chartW, chartH, 100)}
          fill="none"
          stroke={C.neutral}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0"
          opacity="0.7"
        />
        <path
          d={buildLinePath(SENTIMENT_30D.negative, chartW, chartH, 100)}
          fill="none"
          stroke={C.red}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />

        {/* End dots */}
        <circle
          cx={chartW}
          cy={chartH - (SENTIMENT_30D.positive[SENTIMENT_30D.positive.length - 1] / 100) * chartH}
          r="3"
          fill={C.sage}
        />
        <circle
          cx={chartW}
          cy={chartH - (SENTIMENT_30D.neutral[SENTIMENT_30D.neutral.length - 1] / 100) * chartH}
          r="2.5"
          fill={C.neutral}
        />
        <circle
          cx={chartW}
          cy={chartH - (SENTIMENT_30D.negative[SENTIMENT_30D.negative.length - 1] / 100) * chartH}
          r="2.5"
          fill={C.red}
        />
      </g>
    </svg>
  );
}

function DashMiniStat({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        boxShadow: SHADOW.card,
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span
          style={{
            fontSize: "22px",
            fontWeight: 700,
            fontFamily: FONT.mono,
            color: C.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: positive ? C.sage : C.red,
            fontWeight: 600,
          }}
        >
          {positive ? "↑" : "↓"} {change}
        </span>
      </div>
    </div>
  );
}

function TopicRow({
  topic,
}: {
  topic: { name: string; positive: number; negative: number; mentions: number; risk: boolean };
}) {
  return (
    <div
      style={{
        marginBottom: "16px",
        paddingBottom: "16px",
        borderBottom: `1px solid ${C.borderLight}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {topic.risk && (
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: C.red,
                display: "inline-block",
              }}
            />
          )}
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: C.textPrimary,
            }}
          >
            {topic.name}
          </span>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.textMuted,
          }}
        >
          {topic.mentions} mentions
        </span>
      </div>
      {/* Sentiment bar */}
      <div
        style={{
          display: "flex",
          height: "6px",
          borderRadius: "3px",
          overflow: "hidden",
          background: C.borderLight,
        }}
      >
        <div style={{ width: `${topic.positive}%`, background: C.sage }} />
        <div
          style={{
            width: `${100 - topic.positive - topic.negative}%`,
            background: C.neutral,
          }}
        />
        <div style={{ width: `${topic.negative}%`, background: C.red }} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
          fontSize: "10px",
          fontFamily: FONT.mono,
        }}
      >
        <span style={{ color: C.sage }}>{topic.positive}% pos</span>
        <span style={{ color: C.red }}>{topic.negative}% neg</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CONSOLE-SPECIFIC STATE & TYPES
// ═══════════════════════════════════════════════════════════════

type AccountType = "decouverte" | "veille" | "investor";

interface AccountTier {
  id: AccountType;
  label: string;
  tagline: string;
  price: string;
}

const ACCOUNT_TIERS: AccountTier[] = [
  { id: "decouverte", label: "Discovery", tagline: "Essential monitoring", price: "5K MAD / month" },
  { id: "veille",     label: "Watch",     tagline: "With neighbors",     price: "15K MAD / month" },
  { id: "investor",   label: "Investor",  tagline: "Full access",        price: "50K+ MAD / month" },
];

// Sidebar nav items — visual style matches DashboardMockup.
// `id` is the route key (drives main area content switching).
// Nav items differ per accountType:
//   enterprise: Monitoring / Sentiment / Competitors / Alerts / Reports
//   trader:     Watchlist / Sentiment→Price / AI Alpha / Alerts / Pre-Market
//   investor:   Portfolios / DD Dossiers / ESG / Risks / Reports
type NavId = "monitoring" | "sentiment" | "competitors" | "alerts" | "reports"
  | "watchlist" | "sentiment-price" | "ai-alpha" | "pre-market"
  | "portfolios" | "dossiers" | "esg" | "risks";

interface NavItem {
  id: NavId;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

function buildNavItems(activeId: NavId, accountType: "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha"): NavItem[] {
  const iconColor = (id: NavId) => activeId === id ? C.sage : C.textMuted;

  if (accountType === "harch-alpha") {
    return [
      { id: "watchlist",       label: "Watchlist",       icon: <IconMonitor size={16} color={iconColor("watchlist")} /> },
      { id: "sentiment-price", label: "Sentiment→Price", icon: <IconChart size={16}  color={iconColor("sentiment-price")} /> },
      { id: "ai-alpha",        label: "AI Alpha",        icon: <IconUsers size={16}  color={iconColor("ai-alpha")} /> },
      { id: "alerts",          label: "Alerts",          icon: <BellIcon size={16}   color={iconColor("alerts")} />, badge: "3" },
      { id: "pre-market",      label: "Pre-Market",      icon: <IconReport size={16} color={iconColor("pre-market")} /> },
    ];
  }

  if (accountType === "investment-bank") {
    return [
      { id: "portfolios", label: "Portfolios", icon: <IconMonitor size={16} color={iconColor("portfolios")} /> },
      { id: "dossiers",   label: "DD Dossiers", icon: <IconReport size={16} color={iconColor("dossiers")} /> },
      { id: "esg",        label: "ESG Screen",  icon: <IconChart size={16}  color={iconColor("esg")} /> },
      { id: "risks",      label: "Risk Map",    icon: <IconUsers size={16}  color={iconColor("risks")} /> },
      { id: "alerts",     label: "Alerts",      icon: <BellIcon size={16}   color={iconColor("alerts")} /> },
    ];
  }

  // enterprise (default)
  return [
    { id: "monitoring",  label: "Monitoring",  icon: <IconMonitor size={16} color={iconColor("monitoring")} /> },
    { id: "sentiment",   label: "Sentiment",   icon: <IconChart size={16}  color={iconColor("sentiment")} /> },
    { id: "competitors", label: "Competitors", icon: <IconUsers size={16}  color={iconColor("competitors")} /> },
    { id: "alerts",      label: "Alerts",      icon: <BellIcon size={16}   color={iconColor("alerts")} />, badge: "3" },
    { id: "reports",     label: "Reports",     icon: <IconReport size={16} color={iconColor("reports")} /> },
  ];
}

// Default nav order per accountType
function defaultNavOrder(accountType: "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha"): NavId[] {
  if (accountType === "harch-alpha") return ["watchlist", "sentiment-price", "ai-alpha", "alerts", "pre-market"];
  if (accountType === "investment-bank") return ["portfolios", "dossiers", "esg", "risks", "alerts"];
  return ["monitoring", "sentiment", "competitors", "alerts", "reports"];
}

// Default active nav per accountType
function defaultActiveNav(accountType: "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha"): NavId {
  if (accountType === "harch-alpha") return "watchlist";
  if (accountType === "investment-bank") return "portfolios";
  return "monitoring";
}

// Bell icon for the sidebar (without the red dot — keeps the muted look
// of IconMonitor/IconChart). The top-bar bell keeps the badge.
function BellIcon({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ─── WEATHER API SHAPE ─────────────────────────────────────────────
// Mirrors what /api/console/weather returns (see src/app/api/console/weather/route.ts).
interface WeatherSignal {
  time: string;
  source: string;
  title: string;
  weight: "strong" | "medium" | "low";
}
interface WeatherSource {
  name: string;
  articles: number;
  sentiment: string;
}
interface WeatherData {
  score: number;
  trend: "up" | "down" | "stable";
  trendValue: string;
  sky: string;
  skyDescription: string;
  breakdown: { positive: number; neutral: number; negative: number };
  sources: WeatherSource[];
  todaySignals: WeatherSignal[];
  companyName?: string;
  loading: boolean;
}

const DEFAULT_WEATHER: WeatherData = {
  score: 67,
  trend: "up",
  trendValue: "+2 pts vs last week",
  sky: "Partly cloudy",
  skyDescription: "Overall positive sentiment, with a few areas of attention.",
  breakdown: { positive: 58, neutral: 27, negative: 15 },
  sources: [
    { name: "Hespress",  articles: 142, sentiment: "positive" },
    { name: "Le360",     articles:  89, sentiment: "neutral"  },
    { name: "Medias24",  articles:  67, sentiment: "positive" },
    { name: "TelQuel",   articles:  45, sentiment: "negative" },
  ],
  todaySignals: [
    { time: "07:00", source: "Hespress",  title: "Positive article on your latest press release", weight: "strong" },
    { time: "09:32", source: "Twitter/X", title: "Influencer mention (12K followers)",            weight: "medium" },
    { time: "14:15", source: "TelQuel",   title: "Question on your ESG governance",               weight: "low"    },
  ],
  loading: true,
};

// ─── NEIGHBORS API SHAPE (kept from previous ConsoleShell) ─────────
interface Neighbor {
  id: string;
  name: string;
  sector: string;
  rank: 1 | 2 | 3;
  reputationScore: number;
  yourScore: number;
  delta: number;
  recentMoves: {
    title: string;
    date: string;
    impactLevel: 1 | 2 | 3;
    impactDescription: string;
  }[];
}

const MOCK_NEIGHBORS: Neighbor[] = [
  {
    id: "n1",
    name: "Attijariwafa Bank",
    sector: "Banking",
    rank: 1,
    reputationScore: 84,
    yourScore: 67,
    delta: 17,
    recentMoves: [
      {
        title: "Q2 results announcement — record net income",
        date: "2 days ago",
        impactLevel: 3,
        impactDescription: "Rank 1 neighbor. Strong positive coverage may overshadow your Q2 narrative. Consider timing your next announcement around theirs.",
      },
      {
        title: "New mobile banking app launch",
        date: "1 week ago",
        impactLevel: 2,
        impactDescription: "Digital transformation narrative. If you have a similar product, expect comparison articles.",
      },
    ],
  },
  {
    id: "n2",
    name: "Bank of Africa",
    sector: "Banking",
    rank: 1,
    reputationScore: 72,
    yourScore: 67,
    delta: 5,
    recentMoves: [
      {
        title: "Nigeria market entry (Prestige Bank acquisition)",
        date: "3 weeks ago",
        impactLevel: 3,
        impactDescription: "Pan-African expansion story. If you don't have a comparable Africa narrative, you'll be perceived as local-only.",
      },
    ],
  },
  {
    id: "n3",
    name: "CIH Bank",
    sector: "Banking",
    rank: 2,
    reputationScore: 68,
    yourScore: 67,
    delta: 1,
    recentMoves: [
      {
        title: "Fintech partnership with Chinese operator",
        date: "5 days ago",
        impactLevel: 2,
        impactDescription: "Rank 2 neighbor. Innovation narrative but smaller market share. Watch for analyst comparisons.",
      },
    ],
  },
  {
    id: "n4",
    name: "Société Générale Maroc",
    sector: "Banking",
    rank: 2,
    reputationScore: 58,
    yourScore: 67,
    delta: -9,
    recentMoves: [
      {
        title: "Parent company headwinds in France",
        date: "2 weeks ago",
        impactLevel: 1,
        impactDescription: "Rank 2 neighbor in decline. Your positive trajectory stands out by contrast — leverage this in comms.",
      },
    ],
  },
  {
    id: "n5",
    name: "Banque Centrale Populaire",
    sector: "Banking",
    rank: 3,
    reputationScore: 71,
    yourScore: 67,
    delta: 4,
    recentMoves: [
      {
        title: "Cooperative model anniversary event",
        date: "1 month ago",
        impactLevel: 1,
        impactDescription: "Rank 3 neighbor. Different business model, low direct comparison risk.",
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
//  PAGE STYLES (responsive grid for the 3-column layout)
//  Same breakpoints as AtelierHome.tsx pageStyles.
// ═══════════════════════════════════════════════════════════════

const pageStyles = `
  .dash-layout {
    grid-template-columns: 200px 1fr 280px;
  }

  /* ≤1024px : hide right panel, narrow sidebar */
  @media (max-width: 1024px) {
    .dash-layout { grid-template-columns: 180px 1fr; }
    .dash-right { display: none; }
  }

  /* ≤900px : single column, hide sidebar */
  @media (max-width: 900px) {
    .dash-layout { grid-template-columns: 1fr; }
    .dash-sidebar { display: none; }
  }

  /* ≤640px : stack mini stats */
  @media (max-width: 640px) {
    .dash-mini-stats { grid-template-columns: 1fr; }
  }

  /* Mobile drawer for sidebar (only when explicitly toggled open) */
  @media (max-width: 900px) {
    .dash-sidebar.console-drawer {
      display: block !important;
      position: fixed;
      top: 56px;
      left: 0;
      bottom: 0;
      width: 260px;
      max-width: 85vw;
      z-index: 60;
      transform: translateX(-100%);
      transition: transform 0.25s ease;
      overflow-y: auto;
      box-shadow: 4px 0 24px rgba(0,0,0,0.08);
    }
    .dash-sidebar.console-drawer[data-open="true"] {
      transform: translateX(0);
    }
    .console-mobile-overlay { display: block !important; }
  }
  @media (min-width: 901px) {
    .console-mobile-overlay { display: none !important; }
    .console-hamburger { display: none !important; }
  }

  /* Hover affordance on sidebar items is handled inline.
     The .section-actions visibility rule below is kept for future use. */
  .console-nav-item .nav-handle { opacity: 0; transition: opacity 0.15s; }
  .console-nav-item:hover .nav-handle { opacity: 0.4; }
`;

// ═══════════════════════════════════════════════════════════════
//  OFFER THEMES — each offer has its own personality
// ═══════════════════════════════════════════════════════════════

interface OfferTheme {
  accent: string;
  accentBg: string;
  label: string;
  tagline: string;
  welcome: (name: string, company: string) => string;
  vibe: string;
}

const OFFER_THEMES: Record<string, OfferTheme> = {
  "brand-monitor": {
    accent: "#059669",
    accentBg: "rgba(5,150,105,0.08)",
    label: "Brand Monitor",
    tagline: "Your reputation, monitored 24/7",
    welcome: (name, company) => `Good morning, ${name}. Here's what they're saying about ${company} today.`,
    vibe: "calm",
  },
  "market-competitor": {
    accent: "#d97706",
    accentBg: "rgba(217,119,6,0.10)",
    label: "Competitor Intel",
    tagline: "Know your rivals' every move",
    welcome: (name, company) => `${name}, your competitors moved overnight. Here's the delta.`,
    vibe: "aggressive",
  },
  "investment-bank": {
    accent: "#1e3a5f",
    accentBg: "rgba(30,58,95,0.06)",
    label: "Investor Desk",
    tagline: "Due diligence, certified",
    welcome: (name, _company) => `${name}, 2 holdings crossed the risk threshold. Review required.`,
    vibe: "cold",
  },
  "harch-alpha": {
    accent: "#0891b2",
    accentBg: "rgba(8,145,178,0.10)",
    label: "Alpha Desk",
    tagline: "Be first. Be fast. Be right.",
    welcome: (name, _company) => `${name}, pre-market brief 07:00. 1 divergence detected on IAM.`,
    vibe: "raw",
  },
};

function getOfferTheme(accountType: string): OfferTheme {
  return OFFER_THEMES[accountType] || OFFER_THEMES["brand-monitor"];
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function ConsoleShell({
  accountType = "brand-monitor",
  userName,
  userEmail,
}: {
  accountType?: "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha";
  userName?: string | null;
  userEmail?: string | null;
}) {
  const theme = getOfferTheme(accountType);
  const initials = getInitials(userName);
  const displayName = userName?.split(" ")[0] || "User";
  const companyName = "OCP Group"; // TODO: from session.user.companyId → Company.name

  // Tier switcher (admin only — hidden from regular users)
  const [tier, setTier] = useState<AccountType>("decouverte");

  // Active nav item (drives main-area content) — default depends on accountType
  const [activeNav, setActiveNav] = useState<NavId>(defaultActiveNav(accountType));

  // Sidebar order — supports drag&drop reordering, default per accountType
  const [navOrder, setNavOrder] = useState<NavId[]>(defaultNavOrder(accountType));
  const [draggedId, setDraggedId] = useState<NavId | null>(null);

  // Mobile drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Weather data (live from /api/console/weather)
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/console/weather");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data || data.error) return;

        setWeather({
          score: data.score ?? DEFAULT_WEATHER.score,
          trend: data.trend ?? "stable",
          trendValue: data.trendValue ?? "",
          sky: data.sky ?? "Unknown",
          skyDescription: data.skyDescription ?? "",
          breakdown: data.breakdown ?? DEFAULT_WEATHER.breakdown,
          sources: (data.mainSources ?? []).map((s: WeatherSource) => ({
            name: s.name,
            articles: s.articles,
            sentiment: s.sentiment,
          })),
          todaySignals: (data.todaySignals ?? []).map((s: WeatherSignal) => ({
            time: s.time,
            source: s.source,
            title: s.title,
            weight: s.weight,
          })),
          companyName: data.company?.name,
          loading: false,
        });
      } catch {
        if (!cancelled) setWeather((prev) => ({ ...prev, loading: false }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Drag&drop reorder handlers (kept from previous ConsoleShell)
  const onDragStart = (id: NavId) => setDraggedId(id);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (targetId: NavId) => {
    if (!draggedId || draggedId === targetId) return;
    setNavOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(draggedId);
      const to = next.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      next.splice(from, 1);
      next.splice(to, 0, draggedId);
      return next;
    });
    setDraggedId(null);
  };

  const orderedNavItems: NavItem[] = navOrder
    .map((id) => buildNavItems(activeNav, accountType).find((n) => n.id === id))
    .filter((n): n is NavItem => n !== null);

  return (
    <div style={{ minHeight: "100vh", background: C.surfaceAlt, fontFamily: FONT.sans }}>
      {/* Mobile overlay for drawer */}
      {mobileMenuOpen && (
        <div
          className="console-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 50,
            display: "none",
          }}
        />
      )}

      <DashboardTopBar
        tier={tier}
        onTierChange={setTier}
        onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
        mobileMenuOpen={mobileMenuOpen}
        accountType={accountType}
        isAdmin={false}
        theme={theme}
        initials={initials}
        displayName={displayName}
        userEmail={userEmail}
        companyName={companyName}
      />

      {/* 3-column dashboard layout (matches DashboardMockup exactly) */}
      <div
        className="dash-layout"
        style={{
          display: "grid",
          minHeight: "calc(100vh - 56px)",
        }}
      >
        <DashboardSidebar
          items={orderedNavItems}
          activeId={activeNav}
          onSelect={(id) => {
            setActiveNav(id);
            setMobileMenuOpen(false);
          }}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          draggedId={draggedId}
          tier={tier}
          mobileOpen={mobileMenuOpen}
        />

        <DashboardMain
          activeNav={activeNav}
          weather={weather}
          tier={tier}
          accountType={accountType}
          theme={theme}
          displayName={displayName}
          companyName={companyName}
        />

        <DashboardRightPanel />
      </div>

      <style>{pageStyles}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TOP BAR
//  Reproduces the DashboardMockup top bar verbatim, plus the tier
//  switcher and mobile hamburger from the previous ConsoleShell.
// ═══════════════════════════════════════════════════════════════

function DashboardTopBar({
  tier,
  onTierChange,
  onMobileMenuToggle,
  mobileMenuOpen,
  accountType,
  isAdmin,
  theme,
  initials,
  displayName,
  userEmail,
  companyName,
}: {
  tier: AccountType;
  onTierChange: (t: AccountType) => void;
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
  accountType: "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha";
  isAdmin: boolean;
  theme: OfferTheme;
  initials: string;
  displayName: string;
  userEmail?: string | null;
  companyName: string;
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "12px 20px",
        borderBottom: `1px solid ${C.border}`,
        background: C.surface,
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Mobile hamburger (hidden ≥901px via CSS) */}
      <button
        onClick={onMobileMenuToggle}
        className="console-hamburger"
        style={{
          display: "none",
          flexDirection: "column",
          gap: "3px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "6px",
        }}
        aria-label="Menu"
      >
        <span style={{ width: "18px", height: "1.5px", background: C.text, transition: "transform 0.2s", transform: mobileMenuOpen ? "translateY(4.5px) rotate(45deg)" : "none" }} />
        <span style={{ width: "18px", height: "1.5px", background: C.text, opacity: mobileMenuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
        <span style={{ width: "18px", height: "1.5px", background: C.text, transition: "transform 0.2s", transform: mobileMenuOpen ? "translateY(-4.5px) rotate(-45deg)" : "none" }} />
      </button>

      {/* BrandBadge — HARCH | Atelier, but the founder calls it "HarchIQ Console".
          We render the BrandBadge (matches mockup) and tag it with the Console label. */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <BrandBadge subsidiary="Atelier" size="sm" theme="light" />
        <span
          style={{
            fontSize: "10px",
            fontFamily: FONT.mono,
            color: theme.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            borderLeft: `1px solid ${C.border}`,
            paddingLeft: "10px",
          }}
          className="console-iq-label"
        >
          {theme.label}
        </span>
      </div>

      {/* Search bar — exact copy of the mockup */}
      <div
        style={{
          flex: 1,
          maxWidth: "320px",
          height: "32px",
          background: C.surfaceAlt,
          border: `1px solid ${C.border}`,
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "0 12px",
        }}
        className="console-search"
      >
        <IconSearch size={14} color={C.textMuted} />
        <span style={{ fontSize: "12px", color: C.textFaint, fontFamily: FONT.sans }}>
          Search mentions, topics, competitors…
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Tier switcher — ADMIN ONLY (for testing/previewing different tiers).
          Regular users never see this. */}
      {isAdmin && (
        <div
          className="console-tier-switcher"
          style={{
            display: "flex",
            gap: "0",
            border: `1px solid ${C.border}`,
            borderRadius: "4px",
            overflow: "hidden",
            background: C.surfaceAlt,
          }}
          title="Admin preview only — users can't switch tiers"
        >
          {ACCOUNT_TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTierChange(t.id)}
              style={{
                padding: "8px 12px",
                background: tier === t.id ? C.text : "transparent",
                color: tier === t.id ? C.surface : C.textSecondary,
                border: "none",
                fontFamily: FONT.sans,
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                letterSpacing: "0.02em",
              }}
              title={t.tagline}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Notification bell with red "3" badge — exact copy of the mockup */}
      <div style={{ position: "relative", cursor: "pointer" }} title="3 new alerts">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: C.red,
            color: C.textOnDark,
            fontSize: "9px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT.mono,
          }}
        >
          3
        </span>
      </div>

      {/* Logout button */}
      <button
        onClick={() => signOut({ callbackUrl: "/atelier/login", redirect: true })}
        style={{
          padding: "6px 12px",
          background: "transparent",
          border: `1px solid ${C.border}`,
          borderRadius: "4px",
          color: C.textSecondary,
          fontFamily: FONT.sans,
          fontSize: "11px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
        title="Sign out"
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span className="console-logout-label">Sign out</span>
      </button>

      {/* User avatar — dynamic initials from real name */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: theme.accent,
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: FONT.sans,
        }}
        title={userEmail ? `${displayName} · ${userEmail}` : displayName}
      >
        {initials}
      </div>

      {/* Responsive hide for narrow screens */}
      <style>{`
        @media (max-width: 768px) {
          .console-iq-label { display: none !important; }
          .console-search { display: none !important; }
          .console-tier-switcher { display: none !important; }
          .console-logout-label { display: none !important; }
        }
      `}</style>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SIDEBAR
//  Visual style matches DashboardMockup exactly (icon + label + badge,
//  sage active tint + 2px left border). Adds drag&drop reordering.
// ═══════════════════════════════════════════════════════════════

interface SidebarProps {
  items: NavItem[];
  activeId: NavId;
  onSelect: (id: NavId) => void;
  onDragStart: (id: NavId) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: NavId) => void;
  draggedId: NavId | null;
  tier: AccountType;
  mobileOpen: boolean;
}

function DashboardSidebar(props: SidebarProps) {
  const currentTier = ACCOUNT_TIERS.find((t) => t.id === props.tier)!;

  return (
    <aside
      className={`dash-sidebar console-drawer${props.mobileOpen ? "" : ""}`}
      data-open={props.mobileOpen ? "true" : "false"}
      style={{
        background: C.surfaceAlt,
        borderRight: `1px solid ${C.border}`,
        padding: "20px 0",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "0 20px",
          marginBottom: "12px",
        }}
      >
        Navigation
      </div>

      {props.items.map((item) => {
        const isActive = item.id === props.activeId;
        const isDragged = item.id === props.draggedId;
        return (
          <div
            key={item.id}
            draggable
            onDragStart={() => props.onDragStart(item.id)}
            onDragOver={props.onDragOver}
            onDrop={() => props.onDrop(item.id)}
            onClick={() => props.onSelect(item.id)}
            className="console-nav-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? C.sage : C.textSecondary,
              background: isActive ? C.sageBg : "transparent",
              borderLeft: isActive ? `2px solid ${C.sage}` : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
              position: "relative",
              opacity: isDragged ? 0.4 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                e.currentTarget.style.color = C.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = C.textSecondary;
              }
            }}
            title={`Drag to reorder · ${item.label}`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "10px",
                  fontWeight: 700,
                  fontFamily: FONT.mono,
                  color: C.textOnDark,
                  background: C.red,
                  padding: "2px 6px",
                  borderRadius: "8px",
                }}
              >
                {item.badge}
              </span>
            )}
            {/* Drag handle — visible on hover, decorative */}
            <span
              className="nav-handle"
              style={{
                position: "absolute",
                right: "6px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "10px",
                color: C.textMuted,
                fontFamily: FONT.mono,
                pointerEvents: "none",
              }}
              aria-hidden
            >
              ⋮⋮
            </span>
          </div>
        );
      })}

      {/* Sidebar footer — Plan card (matches mockup) */}
      <div style={{ marginTop: "32px", padding: "0 20px" }}>
        <div
          style={{
            padding: "14px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            Plan
          </div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.textPrimary }}>
            {currentTier.label}
          </div>
          <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px" }}>
            {currentTier.price}
          </div>
          <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>
            28 days remaining
          </div>
          <a
            href="/atelier/pricing"
            style={{
              display: "block",
              marginTop: "10px",
              fontSize: "12px",
              color: C.sage,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Upgrade →
          </a>
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN AREA
//  Default view = Sentiment Analysis (matches mockup verbatim).
//  Switches to NeighborsView when "competitors" is active (reuses
//  the existing /api/console/neighbors fetch).
// ═══════════════════════════════════════════════════════════════

function DashboardMain({
  activeNav,
  weather,
  tier,
  accountType,
  theme,
  displayName,
  companyName,
}: {
  activeNav: NavId;
  weather: WeatherData;
  tier: AccountType;
  accountType: "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha";
  theme: OfferTheme;
  displayName: string;
  companyName: string;
}) {
  // Harch Alpha — trader console
  if (accountType === "harch-alpha") {
    return <TraderView activeNav={activeNav} theme={theme} displayName={displayName} />;
  }

  // Investment Bank — investor console
  if (accountType === "investment-bank") {
    return <InvestorView activeNav={activeNav} theme={theme} displayName={displayName} />;
  }

  // Market & Competitor — enterprise + competitor intel
  if (accountType === "market-competitor") {
    if (activeNav === "competitors") {
      return <NeighborsView tier={tier} theme={theme} />;
    }
    if (activeNav === "alerts") {
      return <PlaceholderView title="Crisis alerts" subtitle="Real-time WhatsApp + dashboard alerts when competitors make a move or negative sentiment spikes." theme={theme} />;
    }
    if (activeNav === "reports") {
      return <PlaceholderView title="Monthly reports" subtitle="Board-ready PDFs with your reputation + competitor benchmark." theme={theme} />;
    }
    return <CompetitorIntelDashboard userName={displayName} userEmail={null} companyName={companyName} sector="Banking" />;
  }

  // Brand Monitor — default enterprise console
  if (activeNav === "competitors") {
    return <PlaceholderView title="Competitor tracking" subtitle="Upgrade to Market & Competitor Intel to track up to 10 direct competitors with the Neighbor Index." theme={theme} />;
  }
  if (activeNav === "alerts") {
    return <PlaceholderView title="Crisis alerts" subtitle="Real-time WhatsApp alerts when negative sentiment spikes on your brand." theme={theme} />;
  }
  if (activeNav === "reports") {
    return <PlaceholderView title="Monthly reports" subtitle="Board-ready PDFs delivered the 1st of each month." theme={theme} />;
  }
  return <BrandMonitorDashboard userName={displayName} userEmail={null} companyName={companyName} />;
}

// ═══════════════════════════════════════════════════════════════
//  BRAND MONITOR VIEW — calm, panoramic, "your reputation today"
//  Tone: reassuring, personal, "here's what they're saying about YOU"
// ═══════════════════════════════════════════════════════════════

function BrandMonitorView({
  weather,
  theme,
  displayName,
  companyName,
}: {
  weather: WeatherData;
  theme: OfferTheme;
  displayName: string;
  companyName: string;
}) {
  const welcomeMsg = theme.welcome(displayName, companyName);
  const score = weather.score || 67;
  const skyColor = score >= 70 ? theme.accent : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="dash-main" style={{ padding: "24px", background: C.surface, overflowX: "hidden" }}>
      {/* Welcome banner */}
      <div style={{ padding: "16px 20px", background: theme.accentBg, borderRadius: "8px", marginBottom: "24px", borderLeft: `3px solid ${theme.accent}` }}>
        <div style={{ fontSize: "15px", fontWeight: 600, color: C.textPrimary, lineHeight: 1.5 }}>
          {welcomeMsg}
        </div>
      </div>

      {/* Page title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
            {companyName}
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>
            Reputation Weather
          </h3>
        </div>
      </div>

      {/* Score widget */}
      <div style={{ padding: "32px 24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", marginBottom: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "24px", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: FONT.mono, fontSize: "clamp(48px, 10vw, 72px)", fontWeight: 700, color: skyColor, lineHeight: 1, letterSpacing: "-0.04em" }}>
            {score}
          </div>
          <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "8px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            / 100
          </div>
        </div>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 600, color: C.textPrimary, marginBottom: "8px", letterSpacing: "-0.01em" }}>
            {weather.sky || "Partly cloudy"}
          </div>
          <div style={{ fontSize: "14px", color: C.textSecondary, lineHeight: 1.5, marginBottom: "12px" }}>
            {weather.skyDescription || "Overall positive sentiment, with a few areas of attention."}
          </div>
          <div style={{ fontSize: "12px", fontFamily: FONT.mono, color: weather.trend === "up" ? theme.accent : weather.trend === "down" ? "#ef4444" : C.textMuted }}>
            {weather.trend === "up" ? "↑" : weather.trend === "down" ? "↓" : "→"} {weather.trendValue}
          </div>
        </div>
      </div>

      {/* Breakdown bar */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
          Sentiment breakdown
        </div>
        <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", background: C.surfaceAlt, marginBottom: "12px" }}>
          <div style={{ width: `${weather.breakdown?.positive ?? 58}%`, background: theme.accent }} />
          <div style={{ width: `${weather.breakdown?.neutral ?? 27}%`, background: C.border }} />
          <div style={{ width: `${weather.breakdown?.negative ?? 15}%`, background: "#ef4444" }} />
        </div>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "12px", fontFamily: FONT.mono }}>
          <span style={{ color: theme.accent }}>
            <span style={{ fontWeight: 700 }}>{weather.breakdown?.positive ?? 58}%</span>
            <span style={{ color: C.textMuted, marginLeft: "6px" }}>positive</span>
          </span>
          <span style={{ color: C.textSecondary }}>
            <span style={{ fontWeight: 700 }}>{weather.breakdown?.neutral ?? 27}%</span>
            <span style={{ color: C.textMuted, marginLeft: "6px" }}>neutral</span>
          </span>
          <span style={{ color: "#ef4444" }}>
            <span style={{ fontWeight: 700 }}>{weather.breakdown?.negative ?? 15}%</span>
            <span style={{ color: C.textMuted, marginLeft: "6px" }}>negative</span>
          </span>
        </div>
      </div>

      {/* Today's signals */}
      {weather.todaySignals && weather.todaySignals.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Today's signals
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {weather.todaySignals.map((signal, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: FONT.mono, fontSize: "12px", color: C.textMuted, minWidth: "48px" }}>{signal.time}</span>
                <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: theme.accent, minWidth: "80px" }}>{signal.source}</span>
                <span style={{ fontSize: "14px", color: C.textPrimary, flex: 1, minWidth: "200px" }}>{signal.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MARKET & COMPETITOR VIEW — aggressive, comparative, "you vs them"
//  Tone: competitive, "here's where you're winning, here's where you're losing"
// ═══════════════════════════════════════════════════════════════

function MarketCompetitorView({
  weather,
  theme,
  displayName,
  companyName,
}: {
  weather: WeatherData;
  theme: OfferTheme;
  displayName: string;
  companyName: string;
}) {
  const welcomeMsg = theme.welcome(displayName, companyName);
  const yourScore = weather.score || 67;

  return (
    <div className="dash-main" style={{ padding: "24px", background: C.surface, overflowX: "hidden" }}>
      {/* Welcome banner — aggressive tone */}
      <div style={{ padding: "16px 20px", background: theme.accentBg, borderRadius: "8px", marginBottom: "24px", borderLeft: `3px solid ${theme.accent}` }}>
        <div style={{ fontSize: "15px", fontWeight: 600, color: C.textPrimary, lineHeight: 1.5 }}>
          {welcomeMsg}
        </div>
        <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "6px" }}>
          You're tracking 5 competitors in the Banking sector
        </div>
      </div>

      {/* Page title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: theme.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
            {companyName} vs Competitors
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>
            Competitive Position
          </h3>
        </div>
      </div>

      {/* Your score vs average */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "20px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: theme.accent, lineHeight: 1 }}>
            {yourScore}
          </div>
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Your score
          </div>
        </div>
        <div style={{ padding: "20px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: C.textMuted, lineHeight: 1 }}>
            71
          </div>
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Sector average
          </div>
        </div>
        <div style={{ padding: "20px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: yourScore >= 71 ? theme.accent : "#ef4444", lineHeight: 1 }}>
            {yourScore >= 71 ? "+" : ""}{yourScore - 71}
          </div>
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            vs sector
          </div>
        </div>
      </div>

      {/* Competitive landscape */}
      <div>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
          Competitive landscape
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { name: "Attijariwafa Bank", score: 84, delta: yourScore - 84, trend: "stable" },
            { name: "Bank of Africa", score: 72, delta: yourScore - 72, trend: "up" },
            { name: `${companyName} (You)`, score: yourScore, delta: 0, trend: weather.trend, isYou: true },
            { name: "CIH Bank", score: 68, delta: yourScore - 68, trend: "stable" },
            { name: "Société Générale Maroc", score: 58, delta: yourScore - 58, trend: "down" },
          ].sort((a, b) => b.score - a.score).map((comp, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "12px 16px",
              background: comp.isYou ? theme.accentBg : C.surface,
              border: `1px solid ${comp.isYou ? theme.accent : C.border}`,
              borderRadius: "6px",
              flexWrap: "wrap",
            }}>
              <span style={{ fontFamily: FONT.mono, fontSize: "14px", fontWeight: 700, color: C.textMuted, minWidth: "24px" }}>#{i + 1}</span>
              <span style={{ fontSize: "14px", fontWeight: comp.isYou ? 700 : 500, color: comp.isYou ? theme.accent : C.textPrimary, flex: 1, minWidth: "200px" }}>
                {comp.name}
              </span>
              <div style={{ width: "120px", height: "6px", background: C.surfaceAlt, borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${comp.score}%`, height: "100%", background: comp.isYou ? theme.accent : C.textMuted }} />
              </div>
              <span style={{ fontFamily: FONT.mono, fontSize: "16px", fontWeight: 700, color: C.textPrimary, minWidth: "40px", textAlign: "right" }}>
                {comp.score}
              </span>
              <span style={{ fontFamily: FONT.mono, fontSize: "12px", color: comp.delta > 0 ? theme.accent : comp.delta < 0 ? "#ef4444" : C.textMuted, minWidth: "50px", textAlign: "right" }}>
                {comp.delta > 0 ? "+" : ""}{comp.delta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <div style={{ marginTop: "24px", padding: "16px 20px", background: C.surfaceAlt, borderRadius: "8px", fontSize: "13px", color: C.textSecondary, lineHeight: 1.5 }}>
        <strong style={{ color: theme.accent, fontFamily: FONT.mono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Competitor moves
        </strong>
        <br />
        Click "Competitors" in the sidebar to see detailed moves, impact levels, and the Neighbor Index for each rival.
      </div>
    </div>
  );
}

// ─── Sentiment view (legacy, used by chart) ──────────────────────
// Mirrors the DashboardMockup main area verbatim. The company name and
// the "Avg sentiment" stat are wired to /api/console/weather.
function SentimentView({ weather }: { weather: WeatherData }) {
  const companyName = weather.companyName ?? "Bank of Africa";
  const avgSentiment = weather.score ? `${weather.score}%` : "68%";
  const mentionsPerDay = weather.sources.reduce((sum, s) => sum + s.articles, 0);
  const mentionsLabel = mentionsPerDay > 0 ? String(Math.max(1, Math.round(mentionsPerDay / 30))) : "47";

  return (
    <div
      className="dash-main"
      style={{
        padding: "24px",
        background: C.surface,
      }}
    >
      {/* Page title + filter pills */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            {companyName}
          </div>
          <h3
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: C.textPrimary,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Sentiment Analysis
          </h3>
        </div>
        {/* Filter pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["7 days", "30 days", "90 days"].map((range, i) => (
            <span
              key={range}
              style={{
                fontSize: "12px",
                fontFamily: FONT.mono,
                padding: "6px 12px",
                borderRadius: "3px",
                border: `1px solid ${i === 1 ? C.sage : C.border}`,
                background: i === 1 ? C.sageBg : C.surface,
                color: i === 1 ? C.sage : C.textSecondary,
                cursor: "pointer",
                fontWeight: i === 1 ? 600 : 500,
              }}
            >
              {range}
            </span>
          ))}
        </div>
      </div>

      {/* Chart card */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "6px",
          padding: "20px",
          boxShadow: SHADOW.card,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.textPrimary }}>
            Sentiment over time
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: "16px" }}>
            <ChartLegend color={C.sage} label="Positive" />
            <ChartLegend color={C.neutral} label="Neutral" />
            <ChartLegend color={C.red} label="Negative" />
          </div>
        </div>

        {/* SVG line chart (mock data — wiring to live series comes later) */}
        <SentimentLineChart />

        {/* X-axis labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
            padding: "0 4px",
          }}
        >
          {["Jul 1", "Jul 8", "Jul 15", "Jul 22", "Jul 29"].map((d) => (
            <span
              key={d}
              style={{
                fontSize: "10px",
                fontFamily: FONT.mono,
                color: C.textMuted,
              }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Mini stats — "Avg sentiment" wired to /api/console/weather */}
      <div
        className="dash-mini-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "12px",
          marginTop: "16px",
        }}
      >
        <DashMiniStat label="Avg sentiment" value={avgSentiment} change="+4.2" positive />
        <DashMiniStat label="Mentions / day" value={mentionsLabel} change="+12" positive />
        <DashMiniStat label="AI citations" value="12" change="+3" positive />
      </div>

      {/* Live breakdown card — uses /api/console/weather breakdown.
          This card is NOT in the landing-page mockup; it's a Console-only
          addition that surfaces the real sentiment breakdown. Kept minimal
          so it doesn't break the mockup visual. */}
      {!weather.loading && weather.breakdown && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px 20px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            boxShadow: SHADOW.card,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 600, color: C.textPrimary }}>
              Today's bulletin
            </div>
            <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>
              {weather.sky} · {weather.trend === "up" ? "↑" : weather.trend === "down" ? "↓" : "→"} {weather.trendValue}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              height: "8px",
              borderRadius: "4px",
              overflow: "hidden",
              background: C.borderLight,
              marginBottom: "8px",
            }}
          >
            <div style={{ width: `${weather.breakdown.positive}%`, background: C.sage }} />
            <div style={{ width: `${weather.breakdown.neutral}%`, background: C.neutral }} />
            <div style={{ width: `${weather.breakdown.negative}%`, background: C.red }} />
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "11px", fontFamily: FONT.mono }}>
            <span style={{ color: C.sage }}>
              <strong>{weather.breakdown.positive}%</strong>
              <span style={{ color: C.textMuted, marginLeft: "4px" }}>positive</span>
            </span>
            <span style={{ color: C.textSecondary }}>
              <strong>{weather.breakdown.neutral}%</strong>
              <span style={{ color: C.textMuted, marginLeft: "4px" }}>neutral</span>
            </span>
            <span style={{ color: C.red }}>
              <strong>{weather.breakdown.negative}%</strong>
              <span style={{ color: C.textMuted, marginLeft: "4px" }}>negative</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Placeholder for Alerts / Reports views ────────────────────────
// ═══════════════════════════════════════════════════════════════
//  TRADER VIEW — Assets + sentiment-price correlation
//  Different content from enterprise console. Traders monitor ASSETS
//  (stocks, crypto, fx, commodities), not company reputation.
// ═══════════════════════════════════════════════════════════════

interface TraderAsset {
  id: string;
  ticker: string;
  name: string;
  assetType: string;
  exchange: string | null;
  company: { slug: string; name: string; sector: string } | null;
  latestPrice: number | null;
  latestChange: number | null;
  latestSentiment: number | null;
  sentimentArticleCount: number;
}

function TraderView({ activeNav, theme, displayName }: { activeNav: NavId; theme: OfferTheme; displayName: string }) {
  const [assets, setAssets] = useState<TraderAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [correlation, setCorrelation] = useState<{
    correlation: number;
    direction: string;
    interpretation: string;
    dataPoints: number;
    window: string;
  } | null>(null);
  const [corrLoading, setCorrLoading] = useState(false);
  const [traderStats, setTraderStats] = useState<{
    totalAssets: number;
    avgSentiment: number;
    topMover: { ticker: string; name: string; change: number } | null;
    topGainer: { ticker: string; name: string; changePct: number } | null;
    topLoser: { ticker: string; name: string; changePct: number } | null;
    typeBreakdown: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [assetsRes, statsRes] = await Promise.all([
          fetch("/api/trader/assets"),
          fetch("/api/trader/stats"),
        ]);
        if (assetsRes.ok) {
          const data = await assetsRes.json();
          if (data.assets) {
            setAssets(data.assets);
            if (data.assets.length > 0) {
              setSelectedTicker(data.assets[0].ticker);
            }
          }
        }
        if (statsRes.ok) {
          setTraderStats(await statsRes.json());
        }
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedTicker) return;
    setCorrLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/trader/assets/${selectedTicker}/correlation?window=30`);
        if (!res.ok) return;
        const data = await res.json();
        setCorrelation(data);
      } catch {
        // ignore
      }
      setCorrLoading(false);
    })();
  }, [selectedTicker]);

  if (loading) {
    return <div style={{ padding: "48px 32px", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>Loading assets…</div>;
  }

  const typeColors: Record<string, string> = {
    stock: C.cta,
    crypto: C.warning,
    fx: C.accent,
    commodity: C.danger,
    index: C.textMuted,
  };

  // Nav-based content switching for trader
  if (activeNav === "ai-alpha") {
    return (
      <div className="dash-main" style={{ padding: "24px", background: C.bg, overflowX: "hidden" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>AI Alpha Signals</div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>AI Engine Visibility</h3>
        </div>
        <div style={{ padding: "48px 32px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
          Tracks how ChatGPT, Perplexity, Gemini, and Claude cite your watchlist assets on prompts like "best stock Morocco 2026".
          <br /><span style={{ color: C.accent, marginTop: "8px", display: "inline-block" }}>Coming soon — uses AIVisibility model on asset-queries.</span>
        </div>
      </div>
    );
  }
  if (activeNav === "pre-market") {
    return (
      <div className="dash-main" style={{ padding: "24px", background: C.bg, overflowX: "hidden" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Pre-Market Brief · 7:00 AM</div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>Today's Market Weather</h3>
        </div>
        <div style={{ padding: "48px 32px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
          Daily pre-market brief delivered via WhatsApp at 7:00 AM Casa time.
          <br />Top 3 sentiment movers, BAM/AMMC regulatory signals, divergence alerts, MASI opening forecast.
          <br /><span style={{ color: C.accent, marginTop: "8px", display: "inline-block" }}>Coming soon — WhatsApp Daily Digest integration.</span>
        </div>
      </div>
    );
  }
  if (activeNav === "alerts") {
    return (
      <div className="dash-main" style={{ padding: "24px", background: C.bg, overflowX: "hidden" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Double-Trigger Alerts</div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>Alert Rules</h3>
        </div>
        <div style={{ padding: "48px 32px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
          Create rules that trigger only when 2 conditions are met simultaneously (e.g. sentiment -10pts AND price -3% in 24h).
          <br /><span style={{ color: C.accent, marginTop: "8px", display: "inline-block" }}>Coming soon — AlertRule model already in schema.</span>
        </div>
      </div>
    );
  }

  // Default: watchlist + correlation view
  return (
    <div className="dash-main" style={{ padding: "24px", background: C.bg, overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
            {assets.length} assets tracked
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
            Market Monitor
          </h3>
        </div>
      </div>

      {/* KPI strip */}
      {traderStats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "1px", background: C.border, border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden", marginBottom: "24px" }}>
          <KpiCell label="Assets tracked" value={traderStats.totalAssets} />
          <KpiCell label="Avg sentiment" value={traderStats.avgSentiment.toFixed(2)} color={traderStats.avgSentiment > 0.1 ? C.cta : traderStats.avgSentiment < -0.1 ? C.danger : C.textMuted} />
          {traderStats.topGainer && <KpiCell label="Top gainer" value={`${traderStats.topGainer.ticker} +${traderStats.topGainer.changePct.toFixed(1)}%`} color={C.cta} />}
          {traderStats.topLoser && <KpiCell label="Top loser" value={`${traderStats.topLoser.ticker} ${traderStats.topLoser.changePct.toFixed(1)}%`} color={C.danger} />}
          {traderStats.topMover && <KpiCell label="Sentiment mover" value={`${traderStats.topMover.ticker} ${traderStats.topMover.change > 0 ? "+" : ""}${traderStats.topMover.change.toFixed(2)}`} color={traderStats.topMover.change > 0 ? C.cta : C.danger} />}
        </div>
      )}

      {/* Assets table */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden", marginBottom: "24px" }}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "500px" }}>
            <thead>
              <tr style={{ background: C.bgSubtle }}>
                <th style={thStyle}>Ticker</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Type</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Price</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Change</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelectedTicker(a.ticker)}
                  style={{
                    borderTop: `1px solid ${C.border}`,
                    cursor: "pointer",
                    background: selectedTicker === a.ticker ? C.bgSubtle : "transparent",
                    transition: "background 0.1s",
                  }}
                >
                  <td style={{ padding: "10px 16px", fontFamily: C.fontMono, fontWeight: 700, color: C.text }}>{a.ticker}</td>
                  <td style={{ padding: "10px 16px", color: C.text }}>{a.name}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "2px 6px", borderRadius: "2px", background: `${typeColors[a.assetType] || C.textMuted}15`, color: typeColors[a.assetType] || C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {a.assetType}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: C.fontMono, color: C.text }}>
                    {a.latestPrice ? a.latestPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: C.fontMono, color: a.latestChange !== null ? (a.latestChange > 0 ? C.cta : a.latestChange < 0 ? C.danger : C.textMuted) : C.textMuted }}>
                    {a.latestChange !== null ? `${a.latestChange > 0 ? "+" : ""}${a.latestChange}%` : "—"}
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: C.fontMono, color: a.latestSentiment !== null ? (a.latestSentiment > 0.1 ? C.cta : a.latestSentiment < -0.1 ? C.danger : C.textMuted) : C.textMuted }}>
                    {a.latestSentiment !== null ? a.latestSentiment.toFixed(2) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correlation card — the KILLER FEATURE */}
      {selectedTicker && (
        <div style={{ padding: "24px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
                Sentiment → Price Correlation
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>
                {selectedTicker} · 30-day window
              </div>
            </div>
            {correlation && !corrLoading && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "32px", fontWeight: 800, fontFamily: C.fontMono, color: Math.abs(correlation.correlation) > 0.5 ? C.cta : Math.abs(correlation.correlation) > 0.3 ? C.warning : C.textMuted }}>
                  {correlation.correlation.toFixed(2)}
                </div>
                <div style={{ fontSize: "10px", fontFamily: C.fontMono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Pearson r · {correlation.dataPoints} data points
                </div>
              </div>
            )}
          </div>

          {corrLoading ? (
            <div style={{ color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px", padding: "24px 0" }}>Computing correlation…</div>
          ) : correlation ? (
            <div>
              <div style={{ padding: "16px", background: C.bgSubtle, borderRadius: "4px", fontSize: "14px", color: C.textBody, lineHeight: 1.6, marginBottom: "16px" }}>
                <strong style={{ color: correlation.direction === "positive" ? C.cta : C.danger, fontFamily: C.fontMono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {correlation.direction === "positive" ? "Positive correlation" : "Negative correlation"}
                </strong>
                <br />
                {correlation.interpretation}
              </div>
              <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, lineHeight: 1.6 }}>
                This is HarchIQ&apos;s killer feature for traders: no competitor offers sentiment-to-price correlation for Moroccan BVC stocks. The correlation is computed daily between article sentiment scores and price changes over a 30-day rolling window.
              </div>
            </div>
          ) : (
            <div style={{ color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px", padding: "24px 0" }}>Select an asset to see correlation.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  INVESTOR VIEW — Portfolio roll-up + DD dossiers
// ═══════════════════════════════════════════════════════════════

interface InvestorPortfolio {
  id: string;
  name: string;
  description: string | null;
  holdingCount: number;
  avgReputation: number | null;
  totalHighRisks: number;
  holdings: {
    id: string;
    weight: number;
    company: { slug: string; name: string; sector: string; reputationScore: number | null; highRisks: number } | null;
    asset: { ticker: string; name: string; latestPrice: number | null } | null;
  }[];
}

function InvestorView({ activeNav, theme, displayName }: { activeNav: NavId; theme: OfferTheme; displayName: string }) {
  const [portfolios, setPortfolios] = useState<InvestorPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [invStats, setInvStats] = useState<{
    portfolios: number;
    holdings: number;
    companiesTracked: number;
    avgReputation: number | null;
    totalHighRisks: number;
    dossiers: { total: number; ready: number; draft: number };
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [portRes, statsRes] = await Promise.all([
          fetch("/api/investor/portfolios"),
          fetch("/api/investor/stats"),
        ]);
        if (portRes.ok) {
          const data = await portRes.json();
          if (data.portfolios) setPortfolios(data.portfolios);
        }
        if (statsRes.ok) {
          setInvStats(await statsRes.json());
        }
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div style={{ padding: "48px 32px", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>Loading portfolios…</div>;
  }

  // Nav-based content switching for investor
  if (activeNav === "dossiers") {
    return (
      <div className="dash-main" style={{ padding: "24px", background: C.bg, overflowX: "hidden" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Due Diligence Dossiers</div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>DD Report Generator</h3>
        </div>
        <div style={{ padding: "48px 32px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
          Generate board-ready PDF dossiers (50-100 pages) for any tracked company.
          <br />Includes: financial overview, media sentiment, AI visibility, risk assessment, ESG screening, geopolitical exposure.
          <br /><span style={{ color: C.accent, marginTop: "8px", display: "inline-block" }}>Coming soon — uses existing dossier-generator pipeline.</span>
        </div>
      </div>
    );
  }
  if (activeNav === "esg") {
    return (
      <div className="dash-main" style={{ padding: "24px", background: C.bg, overflowX: "hidden" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>ESG & Controversy Screening</div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>Sustainability Screening</h3>
        </div>
        <div style={{ padding: "48px 32px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
          SFDR Article 8/9 alignment, controversy detection, environmental risk scoring.
          <br />Built on RiskAssessment data (Environmental + Regulatory categories).
          <br /><span style={{ color: C.accent, marginTop: "8px", display: "inline-block" }}>Coming soon.</span>
        </div>
      </div>
    );
  }
  if (activeNav === "risks") {
    return (
      <div className="dash-main" style={{ padding: "24px", background: C.bg, overflowX: "hidden" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Risk Map</div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>Geopolitical + Operational Risks</h3>
        </div>
        <div style={{ padding: "48px 32px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
          Cross-portfolio risk heatmap: environmental, operational, regulatory, labor, reputational.
          <br />Per-country exposure (Morocco, Senegal, Côte d'Ivoire, Tunisia, etc.).
          <br /><span style={{ color: C.accent, marginTop: "8px", display: "inline-block" }}>Coming soon.</span>
        </div>
      </div>
    );
  }
  if (activeNav === "alerts") {
    return (
      <div className="dash-main" style={{ padding: "24px", background: C.bg, overflowX: "hidden" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Portfolio Alerts</div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>Risk Threshold Alerts</h3>
        </div>
        <div style={{ padding: "48px 32px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
          Get notified when a portfolio company's reputation drops below threshold, when a high-risk event is detected, or when AI visibility changes.
          <br /><span style={{ color: C.accent, marginTop: "8px", display: "inline-block" }}>Coming soon.</span>
        </div>
      </div>
    );
  }

  // Default: portfolio overview
  return (
    <div className="dash-main" style={{ padding: "24px", background: C.bg, overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
          {portfolios.length} portfolio{portfolios.length !== 1 ? "s" : ""}
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
          Portfolio Overview
        </h3>
      </div>

      {/* KPI strip */}
      {invStats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))", gap: "1px", background: C.border, border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden", marginBottom: "24px" }}>
          <KpiCell label="Portfolios" value={invStats.portfolios} />
          <KpiCell label="Holdings" value={invStats.holdings} />
          <KpiCell label="Companies" value={invStats.companiesTracked} />
          <KpiCell label="Avg reputation" value={invStats.avgReputation ?? "—"} color={invStats.avgReputation ? (invStats.avgReputation >= 70 ? C.cta : invStats.avgReputation >= 50 ? C.warning : C.danger) : C.textMuted} />
          <KpiCell label="High risks" value={invStats.totalHighRisks} color={invStats.totalHighRisks > 0 ? C.danger : C.cta} />
          <KpiCell label="DD dossiers" value={invStats.dossiers.total} sub={`${invStats.dossiers.ready} ready · ${invStats.dossiers.draft} draft`} />
        </div>
      )}

      {portfolios.length === 0 ? (
        <div style={{ padding: "48px 32px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
          No portfolios yet. Ask your admin to create one.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {portfolios.map((p) => (
            <div key={p.id} style={{ border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden" }}>
              {/* Portfolio header */}
              <div style={{ padding: "16px 20px", background: C.bgSubtle, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>{p.description}</div>}
                </div>
                <div style={{ display: "flex", gap: "24px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: C.fontMono, color: p.avgReputation ? (p.avgReputation >= 70 ? C.cta : p.avgReputation >= 50 ? C.warning : C.danger) : C.textMuted }}>
                      {p.avgReputation ?? "—"}
                    </div>
                    <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase", letterSpacing: "0.1em" }}>Avg reputation</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: C.fontMono, color: p.totalHighRisks > 0 ? C.danger : C.cta }}>
                      {p.totalHighRisks}
                    </div>
                    <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase", letterSpacing: "0.1em" }}>High risks</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: C.fontMono, color: C.text }}>
                      {p.holdingCount}
                    </div>
                    <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase", letterSpacing: "0.1em" }}>Holdings</div>
                  </div>
                </div>
              </div>

              {/* Holdings table */}
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "400px" }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      <th style={thStyle}>Company</th>
                      <th style={thStyle}>Sector</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Weight</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Reputation</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>High risks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.holdings.map((h) => (
                      <tr key={h.id} style={{ borderTop: `1px solid ${C.border}` }}>
                        <td style={{ padding: "10px 16px", fontWeight: 600, color: C.text }}>
                          {h.company?.name || h.asset?.name || "—"}
                        </td>
                        <td style={{ padding: "10px 16px", color: C.textMuted, fontFamily: C.fontMono, fontSize: "12px" }}>
                          {h.company?.sector || "—"}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: C.fontMono, color: C.text }}>
                          {(h.weight * 100).toFixed(0)}%
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: C.fontMono, color: h.company?.reputationScore ? (h.company.reputationScore >= 70 ? C.cta : h.company.reputationScore >= 50 ? C.warning : C.danger) : C.textMuted }}>
                          {h.company?.reputationScore ?? "—"}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: C.fontMono, color: h.company && h.company.highRisks > 0 ? C.danger : C.textMuted }}>
                          {h.company?.highRisks ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DD Dossiers placeholder */}
      <div style={{ marginTop: "32px", padding: "24px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>Due Diligence Dossiers</div>
        <div style={{ fontSize: "13px", color: C.textMuted, fontFamily: C.fontMono }}>
          Generate board-ready PDF dossiers (50-100 pages) for any tracked company.
          <br />Coming soon — uses the existing dossier-generator pipeline.
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "left" as const,
  fontFamily: "'Space Mono', monospace",
  fontSize: "10px",
  color: "#737373",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontWeight: 600,
};

function KpiCell({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#ffffff", padding: "16px 20px" }}>
      <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: "'Space Mono', monospace", color: color || "#0a0a0a", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "9px", color: "#737373", fontFamily: "'Space Mono', monospace", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: "9px", color: "#737373", fontFamily: "'Space Mono', monospace", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

function PlaceholderView({ title, subtitle, theme }: { title: string; subtitle: string; theme: OfferTheme }) {
  return (
    <div
      className="dash-main"
      style={{ padding: "24px", background: C.surface }}
    >
      <div
        style={{
          fontSize: "11px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        HarchIQ Console
      </div>
      <h3
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: C.textPrimary,
          margin: "0 0 8px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: C.textSecondary, lineHeight: 1.5, margin: "0 0 24px", maxWidth: "520px" }}>
        {subtitle}
      </p>
      <div
        style={{
          padding: "48px 32px",
          border: `1px dashed ${C.border}`,
          borderRadius: "6px",
          textAlign: "center",
          color: C.textMuted,
          fontFamily: FONT.mono,
          fontSize: "12px",
        }}
      >
        Section under construction.
        <br />
        <span style={{ color: C.sage, marginTop: "8px", display: "inline-block" }}>
          {title} will be available in the next iteration.
        </span>
      </div>
    </div>
  );
}

// ─── Neighbors view (kept from previous ConsoleShell, restyled) ────
// Lives in the main area when "Competitors" is active in the sidebar.
function NeighborsView({ tier, theme }: { tier: AccountType; theme: OfferTheme }) {
  const [neighbors, setNeighbors] = useState<Neighbor[]>(MOCK_NEIGHBORS);
  const [yourScore, setYourScore] = useState<number>(67);
  const [loading, setLoading] = useState(true);
  const [selectedNeighbor, setSelectedNeighbor] = useState<string | null>(null);
  const [filterRank, setFilterRank] = useState<1 | 2 | 3 | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/console/neighbors");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data || data.error) return;

        if (data.neighbors && data.neighbors.length > 0) {
          setNeighbors(data.neighbors);
          setYourScore(data.company?.yourScore ?? 67);
          setSelectedNeighbor(data.neighbors[0].id);
        }
        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Loading state — minimal so it doesn't fight the mockup aesthetic
  if (loading && neighbors.length === 0) {
    return (
      <div className="dash-main" style={{ padding: "24px", background: C.surface }}>
        <div style={{ color: C.textMuted, fontFamily: FONT.mono, fontSize: "12px" }}>
          Loading neighbors…
        </div>
      </div>
    );
  }

  const filteredNeighbors = filterRank
    ? neighbors.filter((n) => n.rank === filterRank)
    : neighbors;

  const selected = neighbors.find((n) => n.id === selectedNeighbor) ?? neighbors[0];

  const rankLabel = (rank: 1 | 2 | 3) => {
    if (rank === 1) return "Rank 1 — Direct";
    if (rank === 2) return "Rank 2 — Indirect";
    return "Rank 3 — Peripheral";
  };

  const rankColor = (rank: 1 | 2 | 3) => {
    if (rank === 1) return C.red;
    if (rank === 2) return C.warning;
    return C.textMuted;
  };

  const impactColor = (level: 1 | 2 | 3) => {
    if (level === 3) return C.red;
    if (level === 2) return C.warning;
    return C.textMuted;
  };

  const impactLabel = (level: 1 | 2 | 3) => {
    if (level === 3) return "High impact";
    if (level === 2) return "Medium impact";
    return "Low impact";
  };

  return (
    <div className="dash-main" style={{ padding: "24px", background: C.surface, overflowX: "hidden" }}>
      <div
        style={{
          fontSize: "11px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        Competitor benchmarking
      </div>
      <h3
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: C.textPrimary,
          margin: "0 0 8px",
          letterSpacing: "-0.02em",
        }}
      >
        Your neighbors
      </h3>
      <p style={{ fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono, marginBottom: "20px" }}>
        {neighbors.length} competitors tracked · Neighbor Index active
      </p>

      {/* Rank filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          onClick={() => setFilterRank(null)}
          style={{
            padding: "6px 12px",
            background: filterRank === null ? C.text : "transparent",
            color: filterRank === null ? C.surface : C.textSecondary,
            border: `1px solid ${filterRank === null ? C.text : C.border}`,
            borderRadius: "4px",
            fontFamily: FONT.mono,
            fontSize: "11px",
            cursor: "pointer",
            letterSpacing: "0.05em",
          }}
        >
          All ({neighbors.length})
        </button>
        {[1, 2, 3].map((r) => {
          const count = neighbors.filter((n) => n.rank === r).length;
          const isActive = filterRank === r;
          const rc = rankColor(r as 1 | 2 | 3);
          return (
            <button
              key={r}
              onClick={() => setFilterRank(r as 1 | 2 | 3)}
              style={{
                padding: "6px 12px",
                background: isActive ? rc : "transparent",
                color: isActive ? C.textOnDark : C.textSecondary,
                border: `1px solid ${isActive ? rc : C.border}`,
                borderRadius: "4px",
                fontFamily: FONT.mono,
                fontSize: "11px",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              Rank {r} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "20px" }}>
        {/* Neighbors list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
            Tracked neighbors
          </div>
          {filteredNeighbors.map((n) => {
            const isSelected = n.id === selectedNeighbor;
            return (
              <button
                key={n.id}
                onClick={() => setSelectedNeighbor(n.id)}
                style={{
                  padding: "14px 16px",
                  background: isSelected ? C.surfaceAlt : C.surface,
                  border: `1px solid ${isSelected ? C.sage : C.border}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: C.textPrimary }}>
                    {n.name}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: FONT.mono,
                      padding: "2px 6px",
                      borderRadius: "2px",
                      background: `${rankColor(n.rank)}15`,
                      color: rankColor(n.rank),
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    R{n.rank}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", fontFamily: FONT.mono }}>
                  <span style={{ color: C.textMuted }}>Score: <span style={{ color: C.textPrimary, fontWeight: 700 }}>{n.reputationScore}</span></span>
                  <span style={{ color: n.delta > 0 ? C.red : n.delta < 0 ? C.sage : C.textMuted }}>
                    {n.delta > 0 ? "+" : ""}{n.delta} vs you
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected neighbor detail */}
        <div style={{ minWidth: 0 }}>
          {selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ padding: "20px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px", boxShadow: SHADOW.card }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.02em" }}>
                      {selected.name}
                    </div>
                    <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "4px" }}>
                      {selected.sector} · {rankLabel(selected.rank)}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: FONT.mono,
                      padding: "4px 10px",
                      borderRadius: "2px",
                      background: `${rankColor(selected.rank)}15`,
                      color: rankColor(selected.rank),
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Rank {selected.rank}
                  </span>
                </div>

                {/* Score bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontFamily: FONT.mono, marginBottom: "4px" }}>
                      <span style={{ color: C.textMuted }}>Their score</span>
                      <span style={{ color: C.textPrimary, fontWeight: 700 }}>{selected.reputationScore}</span>
                    </div>
                    <div style={{ height: "6px", background: C.surfaceAlt, borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${selected.reputationScore}%`, height: "100%", background: rankColor(selected.rank) }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontFamily: FONT.mono, marginBottom: "4px" }}>
                      <span style={{ color: C.textMuted }}>Your score</span>
                      <span style={{ color: C.textPrimary, fontWeight: 700 }}>{selected.yourScore}</span>
                    </div>
                    <div style={{ height: "6px", background: C.surfaceAlt, borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${selected.yourScore}%`, height: "100%", background: C.sage }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "14px", padding: "10px 12px", background: selected.delta > 0 ? C.redBg : selected.delta < 0 ? C.successBg : C.surfaceAlt, borderRadius: "4px", fontSize: "12px", lineHeight: 1.5 }}>
                  <strong style={{ color: selected.delta > 0 ? C.red : selected.delta < 0 ? C.sage : C.textSecondary, fontFamily: FONT.mono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {selected.delta > 0 ? "They're ahead" : selected.delta < 0 ? "You're ahead" : "Tied"}
                  </strong>
                  <span style={{ color: C.textSecondary, marginLeft: "8px" }}>
                    by {Math.abs(selected.delta)} points
                  </span>
                </div>
              </div>

              {/* Recent moves */}
              <div>
                <div style={{ fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px" }}>
                  Recent moves ({selected.recentMoves.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selected.recentMoves.map((move, i) => (
                    <div key={i} style={{ padding: "14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px", borderLeft: `3px solid ${impactColor(move.impactLevel)}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: C.textPrimary, flex: 1, minWidth: "200px" }}>
                          {move.title}
                        </div>
                        <span
                          style={{
                            fontSize: "10px",
                            fontFamily: FONT.mono,
                            padding: "3px 8px",
                            borderRadius: "2px",
                            background: `${impactColor(move.impactLevel)}15`,
                            color: impactColor(move.impactLevel),
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            flexShrink: 0,
                          }}
                        >
                          {impactLabel(move.impactLevel)}
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono, marginBottom: "6px" }}>
                        {move.date}
                      </div>
                      <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.5 }}>
                        {move.impactDescription}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tier gate */}
      {tier === "decouverte" && (
        <div style={{ marginTop: "20px", padding: "14px 18px", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", color: C.textSecondary, lineHeight: 1.5 }}>
          <strong style={{ color: C.textPrimary, fontFamily: FONT.mono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Discovery tier ·
          </strong>{" "}
          You're seeing sample data. Upgrade to Watch tier to track your real neighbors with the Neighbor Index.
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RIGHT PANEL
//  Exact copy of the DashboardMockup right column:
//   • Top 5 Topics (5 × TopicRow)
//   • AI Visibility mini card (ChatGPT / Perplexity / Gemini)
// ═══════════════════════════════════════════════════════════════

function DashboardRightPanel() {
  return (
    <div
      className="dash-right"
      style={{
        background: C.surfaceAlt,
        borderLeft: `1px solid ${C.border}`,
        padding: "24px 20px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}
      >
        Top 5 Topics
      </div>

      {TOPICS.map((topic, i) => (
        <TopicRow key={i} topic={topic} />
      ))}

      {/* AI visibility mini card */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.textMuted,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          AI Visibility
        </div>
        <div style={{ fontSize: "13px", color: C.textSecondary, marginBottom: "12px" }}>
          <strong style={{ color: C.textPrimary }}>&laquo; meilleure banque Maroc &raquo;</strong>
        </div>
        {[
          { engine: "ChatGPT",    rank: "#2", change: "↑ 1" },
          { engine: "Perplexity", rank: "#3", change: "—"   },
          { engine: "Gemini",     rank: "#4", change: "↓ 1" },
        ].map((ai) => (
          <div
            key={ai.engine}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: `1px solid ${C.borderLight}`,
              fontSize: "12px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <span style={{ color: C.textSecondary, fontFamily: FONT.sans }}>
              {ai.engine}
            </span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontWeight: 700,
                  color: C.textPrimary,
                }}
              >
                {ai.rank}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  color: ai.change.startsWith("↑")
                    ? C.sage
                    : ai.change.startsWith("↓")
                    ? C.red
                    : C.textMuted,
                }}
              >
                {ai.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

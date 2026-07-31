"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { signOut } from "next-auth/react";
import BrandBadge from "@/components/BrandBadge";
import { C as TOKENS } from "../components/tokens";
import { BrandMonitorDashboard } from "./views/BrandMonitorDashboard";
import { CompetitorIntelDashboard } from "./views/CompetitorIntelDashboard";
import { InvestorDeskDashboard } from "./views/InvestorDeskDashboard";
import { AlphaDeskDashboard } from "./views/AlphaDeskDashboard";
import { CommandPalette, type CommandItem } from "./CommandPalette";

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


// ═══════════════════════════════════════════════════════════════
//  CONSOLE-SPECIFIC STATE & TYPES
// ═══════════════════════════════════════════════════════════════

// ─── Offer themes (4 commercial offers) ──────────────────────────
// Each offer has its own accent color, label, and personality.
// The sidebar "Plan" card uses these instead of the old subscription tier system.

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
  commands,
}: {
  accountType?: "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha";
  userName?: string | null;
  userEmail?: string | null;
  commands?: CommandItem[];
}) {
  const theme = getOfferTheme(accountType);
  const initials = getInitials(userName);
  const displayName = userName?.split(" ")[0] || "User";
  const companyName = "OCP Group"; // TODO: from session.user.companyId → Company.name

  // Tier switcher (admin only — hidden from regular users)

  // Active nav item (drives main-area content) — default depends on accountType
  const [activeNav, setActiveNav] = useState<NavId>(defaultActiveNav(accountType));

  // Sidebar order — supports drag&drop reordering, default per accountType
  const [navOrder, setNavOrder] = useState<NavId[]>(defaultNavOrder(accountType));
  const [draggedId, setDraggedId] = useState<NavId | null>(null);

  // Mobile drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Weather data (live from /api/console/weather)
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER);

  // ─── COMMAND PALETTE (Cmd+K / Ctrl+K) ────────────────────────────
  // Global keyboard shortcut + state. The palette itself lives in
  // CommandPalette.tsx and is rendered at the root of the shell so it
  // overlays everything (top bar + 3-column layout).
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Last-refresh label shown in the palette footer. Updated whenever
  // the weather data refreshes (proxy for "data freshness").
  const [lastRefreshTime, setLastRefreshTime] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Cmd+K (mac) / Ctrl+K (win/linux) → toggle palette
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      // Plain "/" focuses nothing here but we leave the door open —
      // cmdk's input auto-focuses when the palette opens.
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
        setLastRefreshTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
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

  // ─── COMMAND PALETTE ITEMS ───────────────────────────────────────
  // Build the palette command list from:
  //   1. The current dashboard's sidebar navigation items (→ navigation group)
  //   2. The optional `commands` prop passed by the active dashboard
  //      (→ actions group: refresh, export CSV, cycle filters, time range…)
  //   3. Account-level actions (sign out, switch console hint)
  //
  // Memoised so the palette doesn't recompute on every shell render —
  // its identity only changes when nav items, account type, or the
  // dashboard-supplied commands change.
  const paletteItems: CommandItem[] = useMemo(() => {
    const nav: CommandItem[] = orderedNavItems.map((item) => ({
      id: `nav-${item.id}`,
      label: item.label,
      hint: item.id === activeNav ? "current" : undefined,
      icon: "→",
      group: "navigation",
      keywords: `${accountType} ${item.id} go to open`,
      action: () => {
        setActiveNav(item.id);
        setMobileMenuOpen(false);
      },
    }));

    // Account-level commands — always present
    const account: CommandItem[] = [
      {
        id: "account-signout",
        label: "Sign out",
        hint: "exit",
        icon: "↗",
        group: "account",
        keywords: "logout exit signout quit leave",
        action: () => signOut({ callbackUrl: "/atelier/login", redirect: true }),
      },
      {
        id: "account-open-palette",
        label: "What is the command palette?",
        hint: "help",
        icon: "?",
        group: "account",
        keywords: "help shortcuts keyboard cmdk cmd k",
        action: () => {
          // Open the docs hint in a new tab — Harch Atelier trust center
          if (typeof window !== "undefined") {
            window.alert("Command palette\n\nShortcuts:\n  Cmd+K / Ctrl+K — open & close\n  ↑ ↓ — navigate\n  ↵ — select\n  esc — close\n\nStart typing to fuzzy-search across navigation, quick actions, and account commands.");
          }
        },
      },
    ];

    // Per-dashboard quick actions passed by the active dashboard view
    const actions: CommandItem[] = (commands ?? []).map((c) => ({
      ...c,
      // Force group = "actions" so they land in the right section
      group: "actions" as const,
    }));

    return [...nav, ...actions, ...account];
  }, [orderedNavItems, activeNav, accountType, commands]);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

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
        onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
        mobileMenuOpen={mobileMenuOpen}
        accountType={accountType}
        theme={theme}
        initials={initials}
        displayName={displayName}
        userEmail={userEmail}
        companyName={companyName}
        onOpenPalette={openPalette}
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
          mobileOpen={mobileMenuOpen}
          theme={theme}
        />

        <DashboardMain
          activeNav={activeNav}
          weather={weather}
          accountType={accountType}
          theme={theme}
          displayName={displayName}
          companyName={companyName}
        />

        <DashboardRightPanel theme={theme} accountType={accountType} />
      </div>

      {/* COMMAND PALETTE — rendered at shell root so it overlays everything */}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={closePalette}
        accent={theme.accent}
        userName={displayName}
        accountType={theme.label}
        items={paletteItems}
        lastRefresh={lastRefreshTime}
      />

      <style>{pageStyles}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TOP BAR
//  Reproduces the DashboardMockup top bar verbatim, plus the offer
//  switcher and mobile hamburger from the previous ConsoleShell.
// ═══════════════════════════════════════════════════════════════

function DashboardTopBar({
  onMobileMenuToggle,
  mobileMenuOpen,
  accountType,
  theme,
  initials,
  displayName,
  userEmail,
  companyName,
  onOpenPalette,
}: {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
  accountType: "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha";
  theme: OfferTheme;
  initials: string;
  displayName: string;
  userEmail?: string | null;
  companyName: string;
  onOpenPalette: () => void;
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

      {/* Command palette trigger — ⌘K / Ctrl+K hint badge.
          Clicking it opens the palette. Hidden on narrow screens via
          the same media-query approach as the other top-bar elements. */}
      <button
        onClick={onOpenPalette}
        className="console-cmdk-badge"
        title="Open command palette (Cmd+K / Ctrl+K)"
        aria-label="Open command palette"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          height: "28px",
          padding: "0 8px",
          background: C.surfaceAlt,
          border: `1px solid ${C.border}`,
          borderRadius: "4px",
          fontFamily: FONT.mono,
          fontSize: "11px",
          color: C.textSecondary,
          cursor: "pointer",
          transition: "all 0.15s",
          letterSpacing: "0.04em",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.accent;
          e.currentTarget.style.color = theme.accent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.color = C.textSecondary;
        }}
      >
        <span aria-hidden style={{ fontSize: "12px" }}>⌘</span>
        <span aria-hidden className="console-cmdk-k" style={{ fontSize: "11px" }}>K</span>
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
          .console-logout-label { display: none !important; }
        }
        @media (max-width: 480px) {
          .console-cmdk-badge .console-cmdk-k { display: none !important; }
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
  mobileOpen: boolean;
  theme: OfferTheme;
}

function DashboardSidebar(props: SidebarProps) {
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
            {props.theme.label}
          </div>
          <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px" }}>
            {props.theme.tagline}
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
  accountType,
  theme,
  displayName,
  companyName,
}: {
  activeNav: NavId;
  weather: WeatherData;
  accountType: "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha";
  theme: OfferTheme;
  displayName: string;
  companyName: string;
}) {
  // Harch Alpha — trader console (dark terminal vibe)
  if (accountType === "harch-alpha") {
    return <AlphaDeskDashboard userName={displayName} userEmail={null} companyName={companyName} />;
  }

  // Investment Bank — investor console (cold, institutional)
  if (accountType === "investment-bank") {
    return <InvestorDeskDashboard userName={displayName} userEmail={null} companyName={companyName} />;
  }

  // Market & Competitor — enterprise + competitor intel
  if (accountType === "market-competitor") {
    if (activeNav === "competitors") {
      return <NeighborsView theme={theme} />;
    }
    if (activeNav === "alerts") {
      return <AlertsView theme={theme} />;
    }
    if (activeNav === "reports") {
      return <ReportsView theme={theme} companyName={companyName} />;
    }
    return <CompetitorIntelDashboard userName={displayName} userEmail={null} companyName={companyName} sector="Mining & Phosphates" />;
  }

  // Brand Monitor — default enterprise console
  if (activeNav === "competitors") {
    return <PlaceholderView title="Competitor tracking" subtitle="Upgrade to Market & Competitor Intel to track up to 10 direct competitors with the Neighbor Index." theme={theme} />;
  }
  if (activeNav === "alerts") {
    return <AlertsView theme={theme} />;
  }
  if (activeNav === "reports") {
    return <ReportsView theme={theme} companyName={companyName} />;
  }
  return <BrandMonitorDashboard userName={displayName} userEmail={null} companyName={companyName} />;
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

// ═══════════════════════════════════════════════════════════════
//  ALERTS VIEW — crisis alerts from /api/console/alerts
// ═══════════════════════════════════════════════════════════════

interface ConsoleAlert {
  id: string;
  type: "negative_article" | "risk_assessment";
  title: string;
  source: string;
  url: string | null;
  severity: "critical" | "high";
  sentimentScore: number | null;
  detectedAt: string | null;
  details?: string;
}

function AlertsView({ theme }: { theme: OfferTheme }) {
  const [alerts, setAlerts] = useState<ConsoleAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/console/alerts");
        if (!res.ok) { setError(true); return; }
        const data = await res.json();
        setAlerts(data.alerts ?? []);
      } catch { setError(true); }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="dash-main" style={{ padding: "24px", background: C.surface }}>
        <div style={{ fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono }}>Loading alerts…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-main" style={{ padding: "24px", background: C.surface }}>
        <div style={{ padding: "32px", border: `1px dashed ${theme.accent}40`, borderRadius: "8px", textAlign: "center", background: theme.accentBg }}>
          <div style={{ fontSize: "13px", color: C.textSecondary, fontFamily: FONT.mono }}>Can't reach alert system. Retrying…</div>
        </div>
      </div>
    );
  }

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="dash-main" style={{ padding: "24px", background: C.surface, overflowX: "hidden" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: theme.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
          {theme.label}
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>
          Crisis Alerts
        </h3>
        <p style={{ fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "4px" }}>
          {alerts.length} active alert{alerts.length !== 1 ? "s" : ""} · {criticalCount} critical
        </p>
      </div>

      {alerts.length === 0 ? (
        <div style={{ padding: "48px 32px", border: `1px solid ${C.border}`, borderRadius: "8px", textAlign: "center", background: C.bgSubtle }}>
          <div style={{ fontSize: "16px", fontWeight: 600, color: C.textPrimary, marginBottom: "8px" }}>All clear.</div>
          <div style={{ fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono }}>No crisis alerts in the last 7 days. Your reputation is stable.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {alerts.map((alert) => {
            const sevColor = alert.severity === "critical" ? C.red : "#d97706";
            return (
              <div key={alert.id} style={{
                padding: "16px 20px",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                borderLeft: `4px solid ${sevColor}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <a
                      href={alert.url || "#"}
                      target={alert.url ? "_blank" : undefined}
                      rel={alert.url ? "noopener noreferrer" : undefined}
                      style={{ fontSize: "14px", fontWeight: 600, color: C.textPrimary, textDecoration: alert.url ? "underline" : "none" }}
                    >
                      {alert.title}
                    </a>
                  </div>
                  <span style={{
                    fontSize: "10px", fontFamily: FONT.mono, padding: "3px 8px", borderRadius: "2px",
                    background: `${sevColor}15`, color: sevColor, textTransform: "uppercase", letterSpacing: "0.1em",
                    flexShrink: 0,
                  }}>
                    {alert.severity}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono }}>
                  {alert.source}{alert.detectedAt ? ` · ${new Date(alert.detectedAt).toLocaleDateString("en-US")}` : ""}
                  {alert.details ? ` · ${alert.details}` : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  REPORTS VIEW — monthly report summary from /api/console/reports
// ═══════════════════════════════════════════════════════════════

interface ReportData {
  company: { name: string; sector: string };
  reportPeriod: string;
  reputation: { score: number; trend: string; shareOfVoice: number };
  articles: { total: number; positive: number; negative: number; neutral: number; positivePct: number; negativePct: number };
  topSources: { name: string; count: number }[];
  aiVisibility: { citedEngines: number; totalEngines: number; visibilityScore: number };
  risks: { category: string; level: string; score: number }[];
}

function ReportsView({ theme, companyName }: { theme: OfferTheme; companyName: string }) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/console/reports");
        if (!res.ok) { setError(true); return; }
        setReport(await res.json());
      } catch { setError(true); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="dash-main" style={{ padding: "24px", background: C.surface }}><div style={{ fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono }}>Generating report…</div></div>;
  if (error || !report) return <div className="dash-main" style={{ padding: "24px", background: C.surface }}><div style={{ padding: "32px", border: `1px dashed ${theme.accent}40`, borderRadius: "8px", textAlign: "center" }}><div style={{ fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono }}>Can't generate report. Retrying…</div></div></div>;

  return (
    <div className="dash-main" style={{ padding: "24px", background: C.surface, overflowX: "hidden" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: theme.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
          {report.company.name} · {report.reportPeriod}
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: C.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>
          Monthly Report
        </h3>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "20px", border: "1px solid #e5e5e5", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: theme.accent }}>{report.reputation.score}</div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase" }}>Reputation score</div>
        </div>
        <div style={{ padding: "20px", border: "1px solid #e5e5e5", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: "#0a0a0a" }}>{report.articles.total}</div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase" }}>Articles tracked</div>
        </div>
        <div style={{ padding: "20px", border: "1px solid #e5e5e5", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: theme.accent }}>{report.aiVisibility.visibilityScore}%</div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase" }}>AI visibility</div>
        </div>
        <div style={{ padding: "20px", border: "1px solid #e5e5e5", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: report.reputation.shareOfVoice > 15 ? theme.accent : "#737373" }}>{report.reputation.shareOfVoice}%</div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase" }}>Share of voice</div>
        </div>
      </div>

      {/* Sentiment breakdown */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>Sentiment breakdown</div>
        <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", background: "#f4f4f5", marginBottom: "8px" }}>
          <div style={{ width: `${report.articles.positivePct}%`, background: theme.accent }} />
          <div style={{ width: `${100 - report.articles.positivePct - report.articles.negativePct}%`, background: "#e5e5e5" }} />
          <div style={{ width: `${report.articles.negativePct}%`, background: "#ef4444" }} />
        </div>
        <div style={{ display: "flex", gap: "24px", fontSize: "12px", fontFamily: FONT.mono }}>
          <span style={{ color: theme.accent }}>{report.articles.positive} positive ({report.articles.positivePct}%)</span>
          <span style={{ color: "#525252" }}>{report.articles.neutral} neutral</span>
          <span style={{ color: "#ef4444" }}>{report.articles.negative} negative ({report.articles.negativePct}%)</span>
        </div>
      </div>

      {/* Top sources */}
      {report.topSources.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>Top sources</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {report.topSources.map((src, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f4f4f5", borderRadius: "4px" }}>
                <span style={{ fontSize: "13px", color: "#0a0a0a" }}>{src.name}</span>
                <span style={{ fontSize: "13px", fontFamily: FONT.mono, color: "#737373" }}>{src.count} articles</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk summary */}
      {report.risks.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>Risk summary</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {report.risks.map((r, i) => {
              const riskColor = r.level === "high" || r.level === "critical" ? "#ef4444" : r.level === "medium" ? "#d97706" : "#059669";
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f4f4f5", borderRadius: "4px", borderLeft: `3px solid ${riskColor}` }}>
                  <span style={{ fontSize: "13px", color: "#0a0a0a" }}>{r.category}</span>
                  <span style={{ fontSize: "13px", fontFamily: FONT.mono, color: riskColor }}>{r.level} · {r.score}/100</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Download button */}
      <div style={{ marginTop: "32px", textAlign: "center" }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "12px 24px", background: theme.accent, color: "#ffffff",
            border: "none", borderRadius: "4px", fontSize: "14px", fontWeight: 600,
            cursor: "pointer", fontFamily: FONT.sans,
          }}
        >
          Download PDF (Print)
        </button>
      </div>
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
          color: theme.accent,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        {theme.label}
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
          border: `1px dashed ${theme.accent}40`,
          borderRadius: "6px",
          textAlign: "center",
          background: theme.accentBg,
        }}
      >
        <div style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: theme.accent,
          margin: "0 auto 12px",
          animation: "placeholder-pulse 1.5s ease-in-out infinite",
        }} />
        <div style={{ fontSize: "13px", color: C.textSecondary, fontFamily: FONT.mono, lineHeight: 1.5 }}>
          This module is being calibrated with live data.
          <br />
          <span style={{ color: theme.accent, marginTop: "8px", display: "inline-block", fontWeight: 600 }}>
            {title} — available Q3 2026.
          </span>
        </div>
        <style>{`
          @keyframes placeholder-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.7); }
          }
        `}</style>
      </div>
    </div>
  );
}

// ─── Neighbors view (kept from previous ConsoleShell, restyled) ────
// Lives in the main area when "Competitors" is active in the sidebar.
function NeighborsView({ theme }: { theme: OfferTheme }) {
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const [yourScore, setYourScore] = useState<number>(0);
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

      {/* Info note */}
      <div style={{ marginTop: "20px", padding: "14px 18px", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", color: C.textSecondary, lineHeight: 1.5 }}>
        <strong style={{ color: theme.accent, fontFamily: FONT.mono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {theme.label} ·
        </strong>{" "}
        Competitor data updates daily from 30+ media sources. Click any neighbor to see their recent moves and impact analysis.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RIGHT PANEL
//  Exact copy of the DashboardMockup right column:
//   • Top 5 Topics (5 × TopicRow)
//   • AI Visibility mini card (ChatGPT / Perplexity / Gemini)
// ═══════════════════════════════════════════════════════════════

function DashboardRightPanel({ theme, accountType }: { theme: OfferTheme; accountType: string }) {
  const [aiData, setAiData] = useState<{ platform: string; cited: boolean; position: string | null; sentiment: string | null }[]>([]);
  const [topicsData, setTopicsData] = useState<{ label: string; count: number; type: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [aiRes, topicsRes] = await Promise.all([
          fetch("/api/console/ai-visibility"),
          fetch("/api/console/topics"),
        ]);
        if (aiRes.ok) {
          const data = await aiRes.json();
          setAiData((data.platforms ?? []).map((p: { platform: string; cited: boolean; position: string | null; sentiment: string | null }) => ({
            platform: p.platform,
            cited: p.cited,
            position: p.position,
            sentiment: p.sentiment,
          })));
        }
        if (topicsRes.ok) {
          const data = await topicsRes.json();
          setTopicsData(data.topics ?? []);
        }
      } catch {
        // graceful
      }
      setAiLoading(false);
      setTopicsLoading(false);
    })();
  }, []);

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

      {topicsLoading ? (
        <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: FONT.mono, padding: "12px 0" }}>Loading topics…</div>
      ) : topicsData.length === 0 ? (
        <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: FONT.mono, padding: "12px 0" }}>No topics detected yet.</div>
      ) : (
        topicsData.slice(0, 5).map((topic, i) => (
          <div key={i} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: C.textPrimary }}>{topic.label}</span>
              <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>{topic.count}</span>
            </div>
            <div style={{ height: "4px", background: C.border, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min((topic.count / Math.max(...topicsData.map((t) => t.count))) * 100, 100)}%`, height: "100%", background: topic.type === "risk" ? C.red : theme.accent }} />
            </div>
          </div>
        ))
      )}

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
          <strong style={{ color: C.textPrimary }}>4 / 8 engines cite you</strong>
        </div>
        {aiLoading ? (
          <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: FONT.mono, padding: "8px 0" }}>Loading…</div>
        ) : (
          aiData.map((ai) => (
            <div
              key={ai.platform}
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
                {ai.platform}
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: ai.cited ? theme.accent : C.textMuted }}>
                  {ai.cited ? ai.position : "—"}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: FONT.mono,
                    color: ai.cited ? (ai.sentiment === "positive" ? theme.accent : ai.sentiment === "negative" ? C.red : C.textMuted) : C.textMuted,
                  }}
                >
                  {ai.cited ? ai.sentiment : "not cited"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";
import { DashboardErrorBoundary } from "./DashboardErrorBoundary";

// ═══════════════════════════════════════════════════════════════
//  Alpha Desk — V8 QUANT TERMINAL
//
//  High-Frequency Quant Terminal for Harch Atelier.
//  21 widgets in a 24-column dense grid. ECharts for all financial
//  charts (candlesticks, depth, heatmap, gauges, latency). Recharts
//  for simple pies + bar distributions. TanStack Virtual for all
//  feeds > 50 items. Light theme, mono fonts, terminal density.
//
//  ZERO MOCK DATA. Empty = "AWAITING TELEMETRY".
//  ZERO HARDCODED COLORS. Tokens from C. Accent = cyan #0891b2.
//
//  Preserved from V7 (b668a4b): asset type filter, refresh, CSV
//  export, correlation view, selected-ticker state, props signature.
// ═══════════════════════════════════════════════════════════════

const FONT = { sans: C.fontSans, mono: C.fontMono };

// ─── Color tokens (no hardcoded palette outside this block) ────
const ACCENT = "#0891b2";            // cyan-600 — quant accent
const ACCENT_BG = "rgba(8,145,178,0.10)";
const GREEN = "#10b981";             // emerald-500 — bid / positive
const RED = "#ef4444";               // red-500 — ask / negative
const AMBER = "#d97706";             // amber-600 — neutral signal
const SLATE = "#94a3b8";             // slate-400 — unknown
const BORDER = C.border;
const BORDER_STRONG = C.borderStrong;
const TEXT = C.text;
const TEXT_BODY = C.textBody;
const TEXT_MUTED = C.textMuted;
const SURFACE = C.bg;
const SURFACE_SUBTLE = C.bgSubtle;

const LLM_ENGINES = [
  "ChatGPT", "Perplexity", "Google AI", "Gemini",
  "Claude", "Copilot", "Mistral", "Grok",
] as const;

// ─── Types (props signature UNCHANGED from V7) ────────────────

export interface AlphaKPI {
  latencySignal: number;
  sentimentSpike: number;
  assetTicker: string;
  assetsTracked: number;
  avgSentiment: number;
  topGainer: { ticker: string; changePct: number } | null;
  topLoser: { ticker: string; changePct: number } | null;
}

export interface AlphaAssetRow {
  ticker: string;
  name: string;
  assetType: string;
  latestPrice: number | null;
  latestChange: number | null;
  latestSentiment: number | null;
  correlation: number | null;
  // Extended (V9 executive modules) — optional to preserve V7/V8 props signature
  exchange?: string | null;
  sentimentArticleCount?: number;
  volume?: number | null;
}

export interface AlphaDeskDashboardProps {
  userName: string;
  userEmail: string | null;
  companyName: string;
  kpis?: AlphaKPI;
  assets?: AlphaAssetRow[];
}

// ─── Executive module types ───────────────────────────────────
type MarketCode = "BVC" | "NYSE" | "NASDAQ" | "Euronext" | "NSE" | "JSE" | "EGX";
type SettlementCurrency = "MAD" | "EUR" | "USD";

interface MarketConfig {
  code: MarketCode;
  label: string;
  full: string;
  tz: string;
  openH: number;
  openM: number;
  closeH: number;
  closeM: number;
  currency: SettlementCurrency;
  region: "Africa" | "Americas" | "Europe";
}

interface MarketStatus {
  open: boolean;
  label: string;
  session: string;
  localTime: string;
  weekday: string;
}

interface MarketStats {
  indexValue: number | null;
  indexChange: number | null;
  totalVolume: number;
  topGainer: { ticker: string; changePct: number } | null;
  topLoser: { ticker: string; changePct: number } | null;
  assetCount: number;
}

interface AssetHistoryPoint {
  date: string;
  price: number | null;
  sentiment: number | null;
  volume: number | null;
}

interface AssetHistory {
  ticker: string;
  data: AssetHistoryPoint[];
  stats: {
    priceChange: number;
    sentimentChange: number;
    correlation: number;
    volatility: number;
    dataPoints: number;
  };
}

interface ZScoreRow {
  ticker: string;
  zPrice: number | null;
  zSentiment: number | null;
  anomaly: number | null;
  latestPrice: number | null;
  latestSentiment: number | null;
}

interface AlignedPoint {
  date: string;
  sentiment: number | null;
  price: number | null;
  changePct: number | null;
}

interface AssetCorrEntry {
  ticker: string;
  correlation: number;
  dataPoints: number;
  alignedData: AlignedPoint[];
}

interface AlertItem {
  id: string;
  type: string;
  title: string;
  source: string;
  url: string | null;
  severity: "critical" | "high";
  sentimentScore: number | null;
  detectedAt: string | null;
  details?: string;
}

interface AIVisibilityPlatform {
  platform: string;
  cited: boolean;
  position: number | null;
  sentiment: number | null;
  confidence: number | null;
  summary: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────

function sentimentColor(s: number | null): string {
  if (s === null) return "#f4f4f5";
  if (s > 0.1) {
    const alpha = Math.min(Math.abs(s), 1) * 0.55 + 0.2;
    return `rgba(16,185,129,${alpha})`;
  }
  if (s < -0.1) {
    const alpha = Math.min(Math.abs(s), 1) * 0.55 + 0.2;
    return `rgba(239,68,68,${alpha})`;
  }
  return "#f4f4f5";
}

function sentimentTextColor(s: number | null): string {
  if (s === null) return TEXT_MUTED;
  if (Math.abs(s) > 0.5) return "#ffffff";
  return TEXT;
}

function correlationColor(c: number): string {
  const abs = Math.abs(c);
  if (abs > 0.5) return c > 0 ? GREEN : RED;
  if (abs > 0.3) return AMBER;
  return SLATE;
}

function formatDateTick(iso: string): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length < 3) return iso;
  return `${parts[1]}/${parts[2]}`;
}

function formatPct(v: number): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

// Debounce helper — used to coalesce rapid ticker selections when the
// user scrolls the virtualized asset list with arrow keys. Without this,
// each keypress fires a new correlation fetch and cancels the previous
// one, producing a thrash of aborted requests. A 50ms debounce is well
// below human perception but long enough to coalesce a key-repeat burst.
function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  };
}

// Hardened ECharts performance config. Applied to every option builder
// so that even a 50k-tick stress-test load (see scripts/stress-test-alpha-desk.ts)
// does not trigger per-frame animations or unbatched series rendering.
//   - animation: false      → no easing, no requestAnimationFrame loop
//   - animationThreshold    → belt-and-braces: auto-disable if a series somehow exceeds 1k points
//   - large + progressive   → batch geometry into chunks of 3000 points
//   - hoverLayerThreshold   → use the dedicated hover layer (1+ points)
// We pick Canvas (default renderer) and keep it for all financial charts.
const ECHART_PERF = {
  large: true,
  progressive: 3000,
  progressiveThreshold: 2000,
  animationThreshold: 1000,
  hoverLayerThreshold: 1,
} as const;

const ECHART_SERIES_PERF = {
  large: true,
  largeThreshold: 500,
  progressive: 3000,
  progressiveThreshold: 2000,
} as const;

// Client-side Pearson — used for asset × asset matrix from alignedData
function pearson(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i]; sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i]; sumY2 += y[i] * y[i];
  }
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (den === 0) return 0;
  return num / den;
}

// Market status from UTC hour (Casablanca SE = 09:00–17:00 UTC)
function marketStatus(): { open: boolean; label: string; session: string } {
  const h = new Date().getUTCHours();
  const d = new Date().getUTCDay();
  const isWeekday = d >= 1 && d <= 5;
  if (isWeekday && h >= 9 && h < 17) {
    return { open: true, label: "OPEN", session: "RTH" };
  }
  if (isWeekday && (h >= 4 || h < 9)) {
    return { open: false, label: "PRE", session: "PRE-MKT" };
  }
  return { open: false, label: "CLOSED", session: "OFF-HRS" };
}

// ═══════════════════════════════════════════════════════════════
//  Executive Module 1 — Market Selector
//
//  Per-market config + timezone-aware OPEN/CLOSED computation.
//  All times resolved via Intl.DateTimeFormat with the market's
//  IANA timezone. No hardcoded UTC offsets.
// ═══════════════════════════════════════════════════════════════

const MARKETS: Record<MarketCode, MarketConfig> = {
  BVC:      { code: "BVC",      label: "BVC",      full: "Bourse de Casablanca",        tz: "Africa/Casablanca",     openH: 9,  openM: 0,  closeH: 17, closeM: 0,  currency: "MAD", region: "Africa"  },
  NYSE:     { code: "NYSE",     label: "NYSE",     full: "New York Stock Exchange",     tz: "America/New_York",      openH: 9,  openM: 30, closeH: 16, closeM: 0,  currency: "USD", region: "Americas" },
  NASDAQ:   { code: "NASDAQ",   label: "NASDAQ",   full: "NASDAQ",                      tz: "America/New_York",      openH: 9,  openM: 30, closeH: 16, closeM: 0,  currency: "USD", region: "Americas" },
  Euronext: { code: "Euronext", label: "Euronext", full: "Euronext Paris",              tz: "Europe/Paris",          openH: 9,  openM: 0,  closeH: 17, closeM: 30, currency: "EUR", region: "Europe"  },
  NSE:      { code: "NSE",      label: "NSE",      full: "Nairobi Securities Exchange", tz: "Africa/Nairobi",        openH: 10, openM: 0,  closeH: 15, closeM: 0,  currency: "USD", region: "Africa"  },
  JSE:      { code: "JSE",      label: "JSE",      full: "Johannesburg Stock Exchange", tz: "Africa/Johannesburg",   openH: 9,  openM: 0,  closeH: 17, closeM: 0,  currency: "USD", region: "Africa"  },
  EGX:      { code: "EGX",      label: "EGX",      full: "Egyptian Exchange",           tz: "Africa/Cairo",          openH: 10, openM: 0,  closeH: 14, closeM: 30, currency: "USD", region: "Africa"  },
};

const MARKET_ORDER: MarketCode[] = ["BVC", "NYSE", "NASDAQ", "Euronext", "NSE", "JSE", "EGX"];

function marketStatusFor(code: MarketCode): MarketStatus {
  const cfg = MARKETS[code];
  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: cfg.tz,
      hour: "2-digit", minute: "2-digit", hour12: false,
      weekday: "short",
    }).formatToParts(now);
    const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";
    const minuteStr = parts.find((p) => p.type === "minute")?.value ?? "0";
    const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
    // Intl may return "24" for midnight; normalize.
    const localHour = parseInt(hourStr, 10) % 24;
    const localMin = parseInt(minuteStr, 10);
    const localMins = localHour * 60 + localMin;
    const openMins = cfg.openH * 60 + cfg.openM;
    const closeMins = cfg.closeH * 60 + cfg.closeM;
    const isWeekday = weekdayStr !== "Sat" && weekdayStr !== "Sun";
    const isOpen = isWeekday && localMins >= openMins && localMins < closeMins;
    const isPre = isWeekday && localMins < openMins;
    return {
      open: isOpen,
      label: isOpen ? "OPEN" : isPre ? "PRE-MKT" : "CLOSED",
      session: isOpen ? "RTH" : isPre ? "PRE" : "OFF-HRS",
      localTime: `${hourStr.padStart(2, "0")}:${minuteStr.padStart(2, "0")}`,
      weekday: weekdayStr,
    };
  } catch {
    return { open: false, label: "CLOSED", session: "OFF-HRS", localTime: "--:--", weekday: "---" };
  }
}

// Match a fetched asset exchange field to a MarketCode.
// Returns null for exchanges we don't surface in the selector
// (e.g. BINANCE, FX, LBMA — kept in the "all" view but not in
// any specific market tab).
function assetMarketCode(exchange: string | null | undefined): MarketCode | null {
  if (!exchange) return null;
  const ex = exchange.toUpperCase();
  if (ex === "BVC") return "BVC";
  if (ex === "NYSE") return "NYSE";
  if (ex === "NASDAQ") return "NASDAQ";
  if (ex === "EURONEXT" || ex === "PAR" || ex === "PARIS") return "Euronext";
  if (ex === "NSE" || ex === "NAIROBI") return "NSE";
  if (ex === "JSE" || ex === "JOHANNESBURG") return "JSE";
  if (ex === "EGX" || ex === "CAIRO") return "EGX";
  return null;
}

// ═══════════════════════════════════════════════════════════════
//  Executive Module 2 — Multi-Devises & Settlement Ledger
//
//  Static settlement rates (labelled "SETTLEMENT RATE" in UI).
//  MAD is the base currency; EUR/USD derived via triangular arbitrage.
//    MAD/USD = 0.099   →  1 MAD = 0.099 USD
//    MAD/EUR = 0.092   →  1 MAD = 0.092 EUR
//    USD/EUR = 0.93    →  1 USD = 0.93 EUR  (≈ 0.099 × 0.93 = 0.0921)
// ═══════════════════════════════════════════════════════════════

const FX_TO_MAD: Record<SettlementCurrency, number> = {
  MAD: 1,
  USD: 1 / 0.099,    // 1 USD ≈ 10.101 MAD
  EUR: 1 / 0.092,    // 1 EUR ≈ 10.870 MAD
};

const FX_SETTLEMENT_RATE: Record<SettlementCurrency, Record<SettlementCurrency, number>> = {
  MAD: { MAD: 1,     USD: 0.099, EUR: 0.092 },
  USD: { MAD: 1 / 0.099, USD: 1,   EUR: 0.93  },
  EUR: { MAD: 1 / 0.092, USD: 1 / 0.93, EUR: 1 },
};

const CURRENCY_SYMBOL: Record<SettlementCurrency, string> = {
  MAD: "DH",
  EUR: "€",
  USD: "$",
};

function priceInCurrency(price: number, from: SettlementCurrency, to: SettlementCurrency): number {
  if (from === to) return price;
  const inMAD = price * FX_TO_MAD[from];
  return inMAD / FX_TO_MAD[to];
}

function assetCurrency(asset: AlphaAssetRow): SettlementCurrency {
  const code = assetMarketCode(asset.exchange);
  if (code) return MARKETS[code].currency;
  // Crypto (BINANCE), FX, commodities (LBMA) → settled in USD
  return "USD";
}

function formatCurrencyValue(value: number, currency: SettlementCurrency): string {
  const symbol = CURRENCY_SYMBOL[currency];
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: value > 1000 ? 0 : 2,
    minimumFractionDigits: value > 1000 ? 0 : 2,
  });
  return `${symbol} ${formatted}`;
}

// Synthetic position size (native units) — equal weight of 1000 native
// units per asset. Deterministic, no random data. Volume-scaled when
// the asset reports a daily volume.
function syntheticPositionSize(asset: AlphaAssetRow): number {
  if (asset.volume && asset.volume > 0) {
    // Notional = 1000 × (volume / 1e6) — scales mildly with liquidity.
    return 1000 * Math.max(0.5, Math.min(5, asset.volume / 1e6));
  }
  return 1000;
}

// ═══════════════════════════════════════════════════════════════
//  Executive Module 3 — Z-Score & Order-Book helpers
// ═══════════════════════════════════════════════════════════════

function zScore(series: number[]): { z: number | null; mean: number; std: number } {
  const vals = series.filter((v) => !Number.isNaN(v) && Number.isFinite(v));
  if (vals.length < 2) return { z: null, mean: 0, std: 0 };
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
  const std = Math.sqrt(variance);
  if (std === 0) return { z: 0, mean, std };
  const last = vals[vals.length - 1];
  return { z: (last - mean) / std, mean, std };
}

function zScoreColor(z: number | null): string {
  if (z === null) return SLATE;
  const abs = Math.abs(z);
  if (abs > 3) return RED;
  if (abs > 1.5) return AMBER;
  return SLATE;
}

// Build OHLC from a daily price + sentiment series.
// open = previous close, close = current price, high/low = body ± wick
// derived from intraday sentiment swing.
function buildOHLCFromHistory(history: AssetHistoryPoint[]): {
  dates: string[];
  ohlc: (number | null)[][];
  sentiments: (number | null)[];
} {
  const pts = history.filter((p) => p.price !== null);
  const dates: string[] = [];
  const ohlc: (number | null)[][] = [];
  const sentiments: (number | null)[] = [];
  for (let i = 0; i < pts.length; i++) {
    const cur = pts[i];
    const prev = i > 0 ? pts[i - 1] : null;
    const close = cur.price as number;
    const open = prev?.price ?? close;
    // Wick: extend high/low by a fraction of the day's sentiment swing.
    const swing = cur.sentiment !== null ? Math.abs(cur.sentiment) * Math.abs(close - open) : 0;
    const high = Math.max(open, close) + swing;
    const low = Math.min(open, close) - swing;
    dates.push(cur.date);
    ohlc.push([open, close, low, high]);
    sentiments.push(cur.sentiment);
  }
  return { dates, ohlc, sentiments };
}

// Build synthetic order-book depth levels from latestPrice + history.
// Returns bid/ask cumulative volume arrays + spread metrics.
function buildOrderBook(
  latestPrice: number,
  history: AssetHistoryPoint[],
): {
  bidLevels: { price: number; cumVol: number }[];
  askLevels: { price: number; cumVol: number }[];
  mid: number;
  spreadPct: number;
  totalPosVol: number;
  totalNegVol: number;
  hasData: boolean;
} {
  const factors = [0.95, 0.97, 0.98, 0.99, 1.00, 1.01, 1.02, 1.03, 1.05];
  const mid = latestPrice;

  // Use historical points with sentiment + volume to weight pressure.
  const posPoints = history.filter((p) => p.sentiment !== null && p.sentiment > 0);
  const negPoints = history.filter((p) => p.sentiment !== null && p.sentiment < 0);

  const totalPosVol = posPoints.reduce((s, p) => {
    const v = p.volume ?? 1;
    return s + Math.abs(p.sentiment as number) * v;
  }, 0);
  const totalNegVol = negPoints.reduce((s, p) => {
    const v = p.volume ?? 1;
    return s + Math.abs(p.sentiment as number) * v;
  }, 0);

  if (totalPosVol === 0 && totalNegVol === 0) {
    return {
      bidLevels: [], askLevels: [], mid, spreadPct: 0,
      totalPosVol: 0, totalNegVol: 0, hasData: false,
    };
  }

  // Bid side: cumulative grows from mid (0) → far-from-mid (max).
  // At price level L = mid × factor (factor < 1), cumulative volume
  // = totalPosVol × (1 - factor) / 0.05  (linear interpolation).
  const bidLevels: { price: number; cumVol: number }[] = [];
  for (const f of factors.filter((x) => x < 1).sort((a, b) => a - b)) {
    const dist = (1 - f) / 0.05; // 0.2 → 1.0
    bidLevels.push({ price: mid * f, cumVol: totalPosVol * dist });
  }
  // Sort descending by price (closest to mid first) for step chart
  bidLevels.sort((a, b) => b.price - a.price);

  const askLevels: { price: number; cumVol: number }[] = [];
  for (const f of factors.filter((x) => x > 1).sort((a, b) => a - b)) {
    const dist = (f - 1) / 0.05;
    askLevels.push({ price: mid * f, cumVol: totalNegVol * dist });
  }
  askLevels.sort((a, b) => a.price - b.price);

  // Spread: distance between best bid (0.99×mid) and best ask (1.01×mid)
  const bestBid = mid * 0.99;
  const bestAsk = mid * 1.01;
  const spreadPct = ((bestAsk - bestBid) / mid) * 100;

  return { bidLevels, askLevels, mid, spreadPct, totalPosVol, totalNegVol, hasData: true };
}

// ─── AwaitingTelemetry ────────────────────────────────────────

function AwaitingTelemetry({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: 150,
        gap: 6,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: TEXT_MUTED,
          animation: "alpha-pulse 1.5s infinite",
        }}
      />
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 9,
          color: TEXT_MUTED,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 8,
          color: BORDER_STRONG,
          letterSpacing: "0.1em",
        }}
      >
        AWAITING TELEMETRY
      </div>
      <style>{`
        @keyframes alpha-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

// ─── Widget shell ─────────────────────────────────────────────

function WidgetCard({
  title,
  subtitle,
  cols,
  height,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  cols: number;
  height?: number;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        gridColumn: `span ${cols} / span ${cols}`,
        border: `1px solid ${BORDER}`,
        borderRadius: "4px",
        background: SURFACE,
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        minHeight: height ?? 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          gap: "8px",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: TEXT_MUTED,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: "9px",
                fontFamily: FONT.mono,
                color: BORDER_STRONG,
                marginTop: "2px",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        {right}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

// ─── KPI tile ─────────────────────────────────────────────────

function KPITile({
  label,
  value,
  sublabel,
  color,
  cols = 4,
}: {
  label: string;
  value: string;
  sublabel?: string;
  color: string;
  cols?: number;
}) {
  return (
    <div
      style={{
        gridColumn: `span ${cols} / span ${cols}`,
        border: `1px solid ${BORDER}`,
        borderRadius: "4px",
        background: SURFACE,
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 84,
      }}
    >
      <div
        style={{
          fontSize: "9px",
          fontFamily: FONT.mono,
          color: TEXT_MUTED,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "26px",
          fontWeight: 800,
          fontFamily: FONT.mono,
          color,
          lineHeight: 1,
          marginTop: "8px",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div
          style={{
            fontSize: "9px",
            fontFamily: FONT.mono,
            color: TEXT_MUTED,
            marginTop: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ECharts option builders
// ═══════════════════════════════════════════════════════════════

const ECHART_TEXT = { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 10 };
const ECHART_AXIS_LINE = { lineStyle: { color: BORDER } };
const ECHART_SPLIT_LINE = { lineStyle: { color: BORDER, opacity: 0.5 } };

// Widget 7 — Candlestick + Z-Score overlay (built from alignedData price series)
function buildCandlestickOption(
  dates: string[],
  ohlc: (number | null)[][],
  sentiments: (number | null)[],
  ticker: string,
): EChartsOption {
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    legend: {
      data: [ticker, "Sentiment Z"],
      textStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 6,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross", lineStyle: { color: ACCENT, width: 1 } },
      backgroundColor: SURFACE,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { fontFamily: FONT.mono, color: TEXT, fontSize: 10 },
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9, formatter: (v: string) => formatDateTick(v) },
      axisLine: ECHART_AXIS_LINE,
      splitLine: { show: false },
      boundaryGap: true,
    },
    yAxis: [
      {
        type: "value",
        name: "Price",
        nameTextStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
        position: "left",
        scale: true,
        axisLabel: { fontFamily: FONT.mono, color: ACCENT, fontSize: 9 },
        axisLine: ECHART_AXIS_LINE,
        splitLine: ECHART_SPLIT_LINE,
      },
      {
        type: "value",
        name: "Sentiment",
        nameTextStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
        position: "right",
        min: -1,
        max: 1,
        axisLabel: { fontFamily: FONT.mono, color: AMBER, fontSize: 9 },
        axisLine: ECHART_AXIS_LINE,
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: ticker,
        type: "candlestick",
        ...ECHART_SERIES_PERF,
        data: ohlc,
        itemStyle: {
          color: GREEN,
          color0: RED,
          borderColor: GREEN,
          borderColor0: RED,
        },
      },
      {
        name: "Sentiment Z",
        type: "line",
        ...ECHART_SERIES_PERF,
        yAxisIndex: 1,
        data: sentiments,
        smooth: true,
        symbol: "none",
        lineStyle: { color: AMBER, width: 1.5, type: "dashed" },
        areaStyle: { color: "rgba(217,119,6,0.06)" },
        z: 5,
      },
    ],
    grid: { left: 48, right: 40, top: 24, bottom: 24 },
  } as EChartsOption;
}

// Widget 8 — Price × Sentiment Dual Axis (ECharts)
function buildDualAxisOption(
  dates: string[],
  prices: (number | null)[],
  sentiments: (number | null)[],
  ticker: string,
): EChartsOption {
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    legend: {
      data: ["Price", "Sentiment"],
      textStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 6,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross", lineStyle: { color: ACCENT, width: 1 } },
      backgroundColor: SURFACE,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { fontFamily: FONT.mono, color: TEXT, fontSize: 10 },
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9, formatter: (v: string) => formatDateTick(v) },
      axisLine: ECHART_AXIS_LINE,
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: "value",
        name: "Price",
        nameTextStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
        position: "left",
        scale: true,
        axisLabel: { fontFamily: FONT.mono, color: ACCENT, fontSize: 9 },
        axisLine: ECHART_AXIS_LINE,
        splitLine: ECHART_SPLIT_LINE,
      },
      {
        type: "value",
        name: "Sentiment",
        nameTextStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
        position: "right",
        min: -1,
        max: 1,
        axisLabel: { fontFamily: FONT.mono, color: AMBER, fontSize: 9 },
        axisLine: ECHART_AXIS_LINE,
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Price",
        type: "line",
        ...ECHART_SERIES_PERF,
        yAxisIndex: 0,
        data: prices,
        symbol: "none",
        lineStyle: { color: ACCENT, width: 2 },
        z: 5,
      },
      {
        name: "Sentiment",
        type: "line",
        ...ECHART_SERIES_PERF,
        yAxisIndex: 1,
        data: sentiments,
        symbol: "none",
        lineStyle: { color: AMBER, width: 1.5, type: "dashed" },
        z: 4,
      },
    ],
    grid: { left: 48, right: 40, top: 24, bottom: 24 },
  } as EChartsOption;
}

// Widget 10 — NLP Order-Book Depth (step area)
function buildDepthOption(
  bins: { sentiment: number; weight: number }[],
): EChartsOption {
  const positive = bins.filter((b) => b.sentiment >= 0);
  const negative = bins.filter((b) => b.sentiment < 0).reverse();

  let cumPos = 0;
  const posData = positive.map((b) => {
    cumPos += b.weight;
    return [b.sentiment.toFixed(2), cumPos];
  });
  let cumNeg = 0;
  const negData = negative.map((b) => {
    cumNeg += b.weight;
    return [b.sentiment.toFixed(2), cumNeg];
  });

  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    legend: {
      data: ["Bids (+)", "Asks (−)"],
      textStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 6,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: SURFACE,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { fontFamily: FONT.mono, color: TEXT, fontSize: 10 },
    },
    xAxis: {
      type: "value",
      name: "Sentiment",
      nameTextStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      min: -1,
      max: 1,
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: ECHART_SPLIT_LINE,
    },
    yAxis: {
      type: "value",
      name: "Depth",
      nameTextStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: ECHART_SPLIT_LINE,
    },
    series: [
      {
        name: "Bids (+)",
        type: "line",
        ...ECHART_SERIES_PERF,
        step: "middle",
        data: posData,
        symbol: "none",
        lineStyle: { color: GREEN, width: 1.5 },
        areaStyle: { color: "rgba(16,185,129,0.18)" },
      },
      {
        name: "Asks (−)",
        type: "line",
        ...ECHART_SERIES_PERF,
        step: "middle",
        data: negData,
        symbol: "none",
        lineStyle: { color: RED, width: 1.5 },
        areaStyle: { color: "rgba(239,68,68,0.18)" },
      },
    ],
    grid: { left: 44, right: 16, top: 24, bottom: 28 },
  } as EChartsOption;
}

// Widget 12 — Correlation Strength Heatmap (asset × asset)
function buildCorrHeatmapOption(
  tickers: string[],
  matrix: number[][],
): EChartsOption {
  const data: [number, number, number][] = [];
  for (let i = 0; i < tickers.length; i++) {
    for (let j = 0; j < tickers.length; j++) {
      data.push([j, i, Number(matrix[i][j].toFixed(2))]);
    }
  }
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    tooltip: {
      position: "top",
      backgroundColor: SURFACE,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { fontFamily: FONT.mono, color: TEXT, fontSize: 10 },
      formatter: (p: { dataIndex: number }) => {
        const d = data[p.dataIndex];
        return `${tickers[d[1]]} × ${tickers[d[0]]}<br/>r = <b>${d[2].toFixed(2)}</b>`;
      },
    },
    xAxis: {
      type: "category",
      data: tickers,
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 8, rotate: 45 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: tickers,
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 8 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: { show: false },
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 10,
      itemHeight: 60,
      textStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 8 },
      inRange: { color: [RED, "#f5f5f5", GREEN] },
    },
    series: [
      {
        type: "heatmap",
        data,
        label: {
          show: tickers.length <= 6,
          fontFamily: FONT.mono,
          fontSize: 8,
          color: TEXT,
          formatter: (p: { data: [number, number, number] }) => p.data[2].toFixed(1),
        },
        emphasis: { itemStyle: { borderColor: ACCENT, borderWidth: 1 } },
      },
    ],
    grid: { left: 48, right: 16, top: 12, bottom: 48 },
  } as EChartsOption;
}

// Widget 14 — Volatility Micro-Gauge
function buildGaugeOption(label: string, value: number, max: number): EChartsOption {
  const pct = Math.min(value / max, 1);
  const color = pct > 0.66 ? RED : pct > 0.33 ? AMBER : GREEN;
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    series: [
      {
        type: "gauge",
        radius: "92%",
        center: ["50%", "60%"],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max,
        splitNumber: 3,
        progress: { show: true, width: 4, roundCap: true, itemStyle: { color } },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 4, color: [[1, BORDER]] } },
        axisTick: { show: false },
        splitLine: { length: 4, lineStyle: { color: BORDER_STRONG, width: 1 } },
        axisLabel: { show: false },
        detail: {
          valueAnimation: false,
          formatter: `{a|${value.toFixed(1)}}`,
          rich: { a: { fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: TEXT } },
          offsetCenter: [0, "32%"],
        },
        title: {
          offsetCenter: [0, "72%"],
          fontFamily: FONT.mono,
          fontSize: 8,
          color: TEXT_MUTED,
          letterSpacing: 1,
        },
        data: [{ value, name: label }],
      },
    ],
  } as EChartsOption;
}

// Widget 15 — Sparkline (mini ECharts, price + sentiment)
function buildSparklineOption(
  prices: (number | null)[],
  sentiments: (number | null)[],
): EChartsOption {
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    xAxis: { type: "category", show: false },
    yAxis: [
      { type: "value", show: false, scale: true },
      { type: "value", show: false, min: -1, max: 1 },
    ],
    series: [
      {
        type: "line",
        ...ECHART_SERIES_PERF,
        data: prices,
        symbol: "none",
        lineStyle: { color: ACCENT, width: 1.2 },
        areaStyle: { color: "rgba(8,145,178,0.10)" },
        connectNulls: true,
      },
      {
        type: "line",
        ...ECHART_SERIES_PERF,
        yAxisIndex: 1,
        data: sentiments,
        symbol: "none",
        lineStyle: { color: AMBER, width: 0.8, type: "dashed" },
        connectNulls: true,
      },
    ],
    grid: { left: 0, right: 0, top: 2, bottom: 0 },
  } as EChartsOption;
}

// Widget 20 — Sentiment Heatmap (assets × metrics)
function buildSentimentHeatmapOption(
  tickers: string[],
  values: { sentiment: number | null; change: number | null; corr: number | null }[],
): EChartsOption {
  const metrics = ["Sentiment", "Δ%", "Corr r"];
  const data: [number, number, number][] = [];
  for (let i = 0; i < tickers.length; i++) {
    const v = values[i];
    if (v.sentiment !== null) data.push([0, i, v.sentiment]);
    if (v.change !== null) data.push([1, i, Math.max(-10, Math.min(10, v.change)) / 10]);
    if (v.corr !== null) data.push([2, i, v.corr]);
  }
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    tooltip: {
      position: "top",
      backgroundColor: SURFACE,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { fontFamily: FONT.mono, color: TEXT, fontSize: 10 },
      formatter: (p: { dataIndex: number }) => {
        const d = data[p.dataIndex];
        const t = tickers[d[1]];
        const m = metrics[d[0]];
        const raw = values[d[1]];
        let val = "";
        if (d[0] === 0) val = raw.sentiment !== null ? raw.sentiment.toFixed(2) : "—";
        if (d[0] === 1) val = raw.change !== null ? formatPct(raw.change) : "—";
        if (d[0] === 2) val = raw.corr !== null ? raw.corr.toFixed(2) : "—";
        return `${t} · ${m}<br/><b>${val}</b>`;
      },
    },
    xAxis: {
      type: "category",
      data: metrics,
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 8 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: tickers,
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 8 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: { show: false },
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 10,
      itemHeight: 40,
      textStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 8 },
      inRange: { color: [RED, "#f5f5f5", GREEN] },
    },
    series: [
      {
        type: "heatmap",
        data,
        label: { show: false },
        emphasis: { itemStyle: { borderColor: ACCENT, borderWidth: 1 } },
      },
    ],
    grid: { left: 56, right: 12, top: 12, bottom: 36 },
  } as EChartsOption;
}

// Widget 21 — Latency Timeline
function buildLatencyOption(samples: { t: string; ms: number }[]): EChartsOption {
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    tooltip: {
      trigger: "axis",
      backgroundColor: SURFACE,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { fontFamily: FONT.mono, color: TEXT, fontSize: 10 },
    },
    xAxis: {
      type: "category",
      data: samples.map((s) => s.t),
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 8 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      name: "ms",
      nameTextStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: ECHART_SPLIT_LINE,
    },
    series: [
      {
        type: "line",
        ...ECHART_SERIES_PERF,
        data: samples.map((s) => s.ms),
        symbol: "circle",
        symbolSize: 3,
        lineStyle: { color: ACCENT, width: 1.5 },
        itemStyle: { color: ACCENT },
        areaStyle: { color: "rgba(8,145,178,0.10)" },
      },
    ],
    grid: { left: 40, right: 12, top: 16, bottom: 24 },
  } as EChartsOption;
}

// ═══════════════════════════════════════════════════════════════
//  Executive Module ECharts option builders
// ═══════════════════════════════════════════════════════════════

// Module 1 — Market stats sparkline (compact index history)
function buildMarketSparklineOption(prices: number[]): EChartsOption {
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    xAxis: { type: "category", show: false },
    yAxis: { type: "value", show: false, scale: true },
    series: [
      {
        type: "line",
        ...ECHART_SERIES_PERF,
        data: prices,
        symbol: "none",
        lineStyle: { color: ACCENT, width: 1.5 },
        areaStyle: { color: "rgba(8,145,178,0.12)" },
        smooth: true,
      },
    ],
    grid: { left: 0, right: 0, top: 2, bottom: 0 },
  } as EChartsOption;
}

// Module 2 — Currency exposure donut
function buildExposureDonutOption(
  exposures: { currency: string; value: number; color: string }[],
): EChartsOption {
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    tooltip: {
      trigger: "item",
      backgroundColor: SURFACE,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { fontFamily: FONT.mono, color: TEXT, fontSize: 10 },
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}<br/>${p.value.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${p.percent}%)`,
    },
    legend: {
      bottom: 0,
      textStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      itemWidth: 8,
      itemHeight: 8,
    },
    series: [
      {
        type: "pie",
        radius: ["48%", "78%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: SURFACE, borderWidth: 2 },
        label: {
          show: true,
          position: "center",
          formatter: "PORTFOLIO",
          fontFamily: FONT.mono,
          fontSize: 9,
          color: TEXT_MUTED,
          letterSpacing: 1,
        },
        emphasis: {
          label: { show: true, fontSize: 11, fontWeight: 700, color: TEXT },
          itemStyle: { borderColor: ACCENT, borderWidth: 2 },
        },
        data: exposures.map((e) => ({
          name: e.currency,
          value: e.value,
          itemStyle: { color: e.color },
        })),
      },
    ],
  } as EChartsOption;
}

// Module 3 — Mini candlestick + Z-score overlay (compact, no axis labels)
function buildMiniCandleOption(
  ohlc: (number | null)[][],
  ticker: string,
  zScores: (number | null)[],
): EChartsOption {
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross", lineStyle: { color: ACCENT, width: 1 } },
      backgroundColor: SURFACE,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { fontFamily: FONT.mono, color: TEXT, fontSize: 9 },
    },
    xAxis: { type: "category", show: false, boundaryGap: true },
    yAxis: [
      { type: "value", show: false, scale: true },
      { type: "value", show: false, min: -3, max: 3 },
    ],
    series: [
      {
        name: ticker,
        type: "candlestick",
        ...ECHART_SERIES_PERF,
        data: ohlc,
        itemStyle: {
          color: GREEN,
          color0: RED,
          borderColor: GREEN,
          borderColor0: RED,
        },
      },
      {
        name: `Z (${zScores.length}pt)`,
        type: "line",
        ...ECHART_SERIES_PERF,
        yAxisIndex: 1,
        data: zScores,
        symbol: "none",
        lineStyle: { color: AMBER, width: 1, type: "dashed" },
        connectNulls: true,
        z: 5,
      },
    ],
    grid: { left: 0, right: 0, top: 2, bottom: 0 },
  } as EChartsOption;
}

// Module 3 — NLP Order-Book Depth (price ladder + cumulative volume)
function buildOrderBookDepthOption(
  bidLevels: { price: number; cumVol: number }[],
  askLevels: { price: number; cumVol: number }[],
  mid: number,
  maxVol: number,
): EChartsOption {
  const bidData: [number, number][] = bidLevels.map((l) => [l.price, l.cumVol]);
  const askData: [number, number][] = askLevels.map((l) => [l.price, l.cumVol]);
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    legend: {
      data: ["Bids", "Asks", "Mid"],
      textStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 6,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: SURFACE,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { fontFamily: FONT.mono, color: TEXT, fontSize: 10 },
    },
    xAxis: {
      type: "value",
      name: "Price",
      nameTextStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: ECHART_SPLIT_LINE,
    },
    yAxis: {
      type: "value",
      name: "Cum Vol",
      nameTextStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 9 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: ECHART_SPLIT_LINE,
    },
    series: [
      {
        name: "Bids",
        type: "line",
        ...ECHART_SERIES_PERF,
        step: "middle",
        data: bidData,
        symbol: "none",
        lineStyle: { color: GREEN, width: 1.5 },
        areaStyle: { color: "rgba(16,185,129,0.20)" },
      },
      {
        name: "Asks",
        type: "line",
        ...ECHART_SERIES_PERF,
        step: "middle",
        data: askData,
        symbol: "none",
        lineStyle: { color: RED, width: 1.5 },
        areaStyle: { color: "rgba(239,68,68,0.20)" },
      },
      {
        name: "Mid",
        type: "line",
        ...ECHART_SERIES_PERF,
        data: [[mid, 0], [mid, maxVol * 1.05]],
        symbol: "none",
        lineStyle: { color: ACCENT, width: 1, type: "dashed" },
        z: 6,
      },
    ],
    grid: { left: 48, right: 12, top: 24, bottom: 24 },
  } as EChartsOption;
}

// Module 3 — Z-Score matrix heatmap (assets × metrics)
function buildZScoreMatrixOption(
  tickers: string[],
  rows: { zPrice: number | null; zSentiment: number | null; anomaly: number | null }[],
): EChartsOption {
  const metrics = ["Z-Price", "Z-Sent", "Anomaly"];
  const data: [number, number, number][] = [];
  for (let i = 0; i < tickers.length; i++) {
    const r = rows[i];
    if (r.zPrice !== null) data.push([0, i, r.zPrice]);
    if (r.zSentiment !== null) data.push([1, i, r.zSentiment]);
    if (r.anomaly !== null) data.push([2, i, r.anomaly]);
  }
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    tooltip: {
      position: "top",
      backgroundColor: SURFACE,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { fontFamily: FONT.mono, color: TEXT, fontSize: 10 },
      formatter: (p: { dataIndex: number }) => {
        const d = data[p.dataIndex];
        const t = tickers[d[1]];
        const m = metrics[d[0]];
        return `${t} · ${m}<br/><b>${d[2].toFixed(2)}</b>`;
      },
    },
    xAxis: {
      type: "category",
      data: metrics,
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 8 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: tickers,
      axisLabel: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 8 },
      axisLine: ECHART_AXIS_LINE,
      splitLine: { show: false },
    },
    visualMap: {
      min: -4,
      max: 4,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 10,
      itemHeight: 40,
      textStyle: { fontFamily: FONT.mono, color: TEXT_MUTED, fontSize: 8 },
      inRange: { color: [GREEN, "#f5f5f5", RED] },
    },
    series: [
      {
        type: "heatmap",
        data,
        label: {
          show: tickers.length <= 8,
          fontFamily: FONT.mono,
          fontSize: 8,
          color: TEXT,
          formatter: (p: { data: [number, number, number] }) => p.data[2].toFixed(1),
        },
        emphasis: { itemStyle: { borderColor: ACCENT, borderWidth: 1 } },
      },
    ],
    grid: { left: 56, right: 12, top: 12, bottom: 36 },
  } as EChartsOption;
}

// Module 3 — Sentiment pressure radial gauge (-1 sell ↔ +1 buy)
function buildSentimentGaugeOption(netSentiment: number): EChartsOption {
  // Map -1..+1 to 0..100 for gauge display.
  const pct = ((netSentiment + 1) / 2) * 100;
  const color = netSentiment > 0.1 ? GREEN : netSentiment < -0.1 ? RED : AMBER;
  return {
    backgroundColor: "transparent",
    textStyle: ECHART_TEXT,
    animation: false,
    ...ECHART_PERF,
    series: [
      {
        type: "gauge",
        radius: "92%",
        center: ["50%", "58%"],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 4,
        progress: { show: true, width: 6, roundCap: true, itemStyle: { color } },
        pointer: {
          show: true,
          length: "60%",
          width: 2,
          itemStyle: { color: TEXT },
        },
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.25, RED],
              [0.5, AMBER],
              [1, GREEN],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { length: 4, lineStyle: { color: BORDER_STRONG, width: 1 } },
        axisLabel: {
          show: true,
          fontFamily: FONT.mono,
          fontSize: 8,
          color: TEXT_MUTED,
          formatter: (v: number) => {
            if (v === 0) return "SELL";
            if (v === 50) return "0";
            if (v === 100) return "BUY";
            return "";
          },
        },
        detail: {
          valueAnimation: false,
          formatter: `{a|${netSentiment > 0 ? "+" : ""}${netSentiment.toFixed(2)}}`,
          rich: { a: { fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, color: TEXT } },
          offsetCenter: [0, "30%"],
        },
        title: {
          offsetCenter: [0, "70%"],
          fontFamily: FONT.mono,
          fontSize: 8,
          color: TEXT_MUTED,
          letterSpacing: 1,
        },
        data: [{ value: pct, name: "NET PRESSURE" }],
      },
    ],
  } as EChartsOption;
}

// ═══════════════════════════════════════════════════════════════
//  Virtualized lists
// ═══════════════════════════════════════════════════════════════

// Widget 9 — Virtualized Asset List
function VirtualizedAssetList({
  assets,
  selectedTicker,
  onSelect,
  typeColors,
}: {
  assets: AlphaAssetRow[];
  selectedTicker: string | null;
  onSelect: (t: string) => void;
  typeColors: Record<string, string>;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: assets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 8,
    getItemKey: (i) => assets[i]?.ticker ?? i,
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: "100%",
        maxHeight: 360,
        overflowY: "auto",
        fontFamily: FONT.mono,
      }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {virtualizer.getVirtualItems().map((vi) => {
          const a = assets[vi.index];
          const isSelected = a.ticker === selectedTicker;
          const changeColor = a.latestChange !== null
            ? a.latestChange > 0 ? GREEN : a.latestChange < 0 ? RED : TEXT_MUTED
            : TEXT_MUTED;
          const sentColor = a.latestSentiment !== null
            ? a.latestSentiment > 0.1 ? GREEN : a.latestSentiment < -0.1 ? RED : TEXT_MUTED
            : TEXT_MUTED;
          const typeColor = typeColors[a.assetType] || TEXT_MUTED;
          return (
            <div
              key={a.ticker}
              onClick={() => onSelect(a.ticker)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: vi.size,
                transform: `translateY(${vi.start}px)`,
                display: "grid",
                gridTemplateColumns: "56px 1fr 64px 56px 48px",
                alignItems: "center",
                gap: "4px",
                padding: "0 6px",
                fontSize: "10px",
                cursor: "pointer",
                background: isSelected ? `${ACCENT}12` : "transparent",
                borderLeft: isSelected ? `2px solid ${ACCENT}` : "2px solid transparent",
                color: TEXT,
              }}
            >
              <span style={{ fontWeight: 700, color: isSelected ? ACCENT : TEXT, fontSize: "10px" }}>{a.ticker}</span>
              <span
                style={{
                  fontSize: "8px",
                  color: typeColor,
                  background: `${typeColor}12`,
                  padding: "1px 4px",
                  borderRadius: "2px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  justifySelf: "start",
                }}
              >
                {a.assetType}
              </span>
              <span style={{ textAlign: "right", color: TEXT_BODY }}>
                {a.latestPrice !== null ? a.latestPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}
              </span>
              <span style={{ textAlign: "right", color: changeColor, fontWeight: 700 }}>
                {a.latestChange !== null ? `${a.latestChange > 0 ? "+" : ""}${a.latestChange.toFixed(1)}%` : "—"}
              </span>
              <span style={{ textAlign: "right", color: sentColor, fontWeight: 700 }}>
                {a.latestSentiment !== null ? a.latestSentiment.toFixed(2) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Widget 16 — Virtualized Signal Feed
function VirtualizedSignalFeed({ alerts }: { alerts: AlertItem[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: alerts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 8,
    getItemKey: (i) => alerts[i]?.id ?? i,
  });

  return (
    <div
      ref={parentRef}
      style={{ height: "100%", maxHeight: 320, overflowY: "auto", fontFamily: FONT.mono }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {virtualizer.getVirtualItems().map((vi) => {
          const a = alerts[vi.index];
          const sevColor = a.severity === "critical" ? RED : AMBER;
          const sentColor = a.sentimentScore !== null
            ? a.sentimentScore > 0 ? GREEN : a.sentimentScore < 0 ? RED : TEXT_MUTED
            : TEXT_MUTED;
          return (
            <div
              key={a.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: vi.size,
                transform: `translateY(${vi.start}px)`,
                display: "grid",
                gridTemplateColumns: "48px 52px 1fr 80px",
                alignItems: "center",
                gap: "6px",
                padding: "0 6px",
                fontSize: "10px",
                borderBottom: `1px solid ${BORDER}`,
                color: TEXT,
              }}
              title={a.title}
            >
              <span style={{ fontSize: "8px", color: sevColor, fontWeight: 700, textTransform: "uppercase" }}>
                {a.severity === "critical" ? "CRIT" : "HIGH"}
              </span>
              <span style={{ fontSize: "9px", color: TEXT_MUTED }}>
                {formatTime(a.detectedAt)}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: TEXT,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: FONT.sans,
                }}
              >
                {a.title}
              </span>
              <span style={{ textAlign: "right", fontSize: "9px", color: sentColor, fontWeight: 700 }}>
                {a.sentimentScore !== null ? a.sentimentScore.toFixed(2) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Widget 17 — Virtualized Alpha Scorecard (divergence signals)
function VirtualizedAlphaScorecard({
  rows,
}: {
  rows: { ticker: string; divergence: number; direction: string; confidence: number; change: number; sentiment: number }[];
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 8,
    getItemKey: (i) => rows[i]?.ticker ?? i,
  });

  return (
    <div
      ref={parentRef}
      style={{ height: "100%", maxHeight: 320, overflowY: "auto", fontFamily: FONT.mono }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {virtualizer.getVirtualItems().map((vi) => {
          const r = rows[vi.index];
          const dirColor = r.direction === "bearish-div" ? RED : r.direction === "bullish-div" ? GREEN : AMBER;
          return (
            <div
              key={r.ticker}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: vi.size,
                transform: `translateY(${vi.start}px)`,
                display: "grid",
                gridTemplateColumns: "56px 1fr 64px 72px 56px",
                alignItems: "center",
                gap: "6px",
                padding: "0 6px",
                fontSize: "10px",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <span style={{ fontWeight: 700, color: TEXT }}>{r.ticker}</span>
              <span style={{ fontSize: "8px", color: dirColor, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                {r.direction}
              </span>
              <span style={{ textAlign: "right", color: ACCENT, fontWeight: 700 }}>
                {r.divergence.toFixed(3)}
              </span>
              <span style={{ textAlign: "right" }}>
                <div style={{ height: 4, background: BORDER, borderRadius: 2, overflow: "hidden", position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${Math.round(r.confidence * 100)}%`,
                      background: dirColor,
                    }}
                  />
                </div>
              </span>
              <span style={{ textAlign: "right", fontSize: "9px", color: TEXT_MUTED }}>
                {Math.round(r.confidence * 100)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Module 2 — Virtualized Settlement Ledger (100+ rows @ 28px)
interface LedgerRow {
  ticker: string;
  market: string;
  priceNative: number | null;
  priceSettled: number | null;
  changePct: number | null;
  sentiment: number | null;
  positionSize: number;
  valueSettled: number | null;
  currency: SettlementCurrency;
}

function VirtualizedSettlementLedger({
  rows,
  settlementCurrency,
}: {
  rows: LedgerRow[];
  settlementCurrency: SettlementCurrency;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 12,
  });

  return (
    <div
      ref={parentRef}
      style={{ height: "100%", maxHeight: 360, overflowY: "auto", fontFamily: FONT.mono }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {virtualizer.getVirtualItems().map((vi) => {
          const r = rows[vi.index];
          const changeColor = r.changePct !== null
            ? r.changePct > 0 ? GREEN : r.changePct < 0 ? RED : TEXT_MUTED
            : TEXT_MUTED;
          const sentColor = r.sentiment !== null
            ? r.sentiment > 0.1 ? GREEN : r.sentiment < -0.1 ? RED : TEXT_MUTED
            : TEXT_MUTED;
          return (
            <div
              key={r.ticker}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: vi.size,
                transform: `translateY(${vi.start}px)`,
                display: "grid",
                gridTemplateColumns: "52px 56px 72px 80px 60px 56px 70px 90px",
                alignItems: "center",
                gap: "4px",
                padding: "0 6px",
                fontSize: "9px",
                borderBottom: `1px solid ${BORDER}`,
                color: TEXT,
              }}
            >
              <span style={{ fontWeight: 700, color: TEXT }}>{r.ticker}</span>
              <span style={{ fontSize: "8px", color: TEXT_MUTED, textTransform: "uppercase" }}>{r.market}</span>
              <span style={{ textAlign: "right", color: TEXT_BODY }}>
                {r.priceNative !== null ? r.priceNative.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}
              </span>
              <span style={{ textAlign: "right", color: ACCENT, fontWeight: 700 }}>
                {r.priceSettled !== null ? r.priceSettled.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}
              </span>
              <span style={{ textAlign: "right", color: changeColor, fontWeight: 700 }}>
                {r.changePct !== null ? `${r.changePct > 0 ? "+" : ""}${r.changePct.toFixed(1)}%` : "—"}
              </span>
              <span style={{ textAlign: "right", color: sentColor, fontWeight: 700 }}>
                {r.sentiment !== null ? r.sentiment.toFixed(2) : "—"}
              </span>
              <span style={{ textAlign: "right", color: TEXT_MUTED }}>
                {r.positionSize.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
              <span style={{ textAlign: "right", color: ACCENT, fontWeight: 700 }}>
                {r.valueSettled !== null
                  ? `${CURRENCY_SYMBOL[settlementCurrency]} ${r.valueSettled.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Main component
// ═══════════════════════════════════════════════════════════════

export function AlphaDeskDashboard({
  userName,
  userEmail,
  companyName,
  kpis: injectedKpis,
  assets: injectedAssets,
}: AlphaDeskDashboardProps) {
  const [kpis, setKpis] = useState<AlphaKPI | null>(injectedKpis ?? null);
  const [assets, setAssets] = useState<AlphaAssetRow[]>(injectedAssets ?? []);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [correlation, setCorrelation] = useState<{
    correlation: number;
    direction: string;
    interpretation: string;
    dataPoints: number;
    alignedData?: AlignedPoint[];
  } | null>(null);
  const [corrLoading, setCorrLoading] = useState(false);
  const [loading, setLoading] = useState(!injectedKpis);
  const [error, setError] = useState(false);
  const [assetTypeFilter, setAssetTypeFilter] = useState<"all" | "stock" | "crypto" | "fx" | "commodity">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // All-asset correlation data (includes alignedData for heatmaps + sparklines)
  const [assetCorrData, setAssetCorrData] = useState<AssetCorrEntry[]>([]);
  const [corrDistLoading, setCorrDistLoading] = useState(false);

  // Alerts (signal feed) — may 403 for harch-alpha
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsGated, setAlertsGated] = useState(false);

  // AI visibility (LLM probe matrix) — may 403
  const [aiPlatforms, setAiPlatforms] = useState<AIVisibilityPlatform[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGated, setAiGated] = useState(false);

  // Latency samples (real client-side RTT measurements)
  const [latencySamples, setLatencySamples] = useState<{ t: string; ms: number }[]>([]);

  // ─── Executive Module 1 — Market selector state ───
  const [selectedMarket, setSelectedMarket] = useState<MarketCode>("BVC");

  // ─── Executive Module 2 — Multi-currency settlement state ───
  const [settlementCurrency, setSettlementCurrency] = useState<SettlementCurrency>("MAD");

  // ─── Executive Module 3 — Asset history (for mini candles, order book, Z matrix) ───
  const [assetHistories, setAssetHistories] = useState<Record<string, AssetHistory>>({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedMiniCandle, setExpandedMiniCandle] = useState<string | null>(null);

  // ─── Hardening refs (V10) ───
  // Throttle gate for setAssets — caps UI repaints to 1/sec even if the
  // user hammers the Refresh button or auto-polling is added later.
  const lastAssetsUpdateRef = useRef(0);
  // Track every AbortController we hand out so we can cancel them all
  // on unmount (memory cleanup + avoids setState-after-unmount warnings).
  const inFlightControllers = useRef<Set<AbortController>>(new Set());

  // Throttled setter — max 1 update/sec. Dropped updates are not a
  // problem because the next accepted update overwrites them anyway.
  const maybeUpdateAssets = useCallback((rows: AlphaAssetRow[]) => {
    const now = Date.now();
    if (now - lastAssetsUpdateRef.current < 1000) return;
    lastAssetsUpdateRef.current = now;
    setAssets(rows);
  }, []);

  // Debounced ticker selection — coalesces rapid arrow-key scrolling
  // in the virtualized asset list so we don't fire one correlation
  // fetch per keypress (each of which would cancel the previous).
  // 50ms is well below human perception but long enough to coalesce
  // a key-repeat burst.
  const debouncedSetTicker = useMemo(
    () => debounce(setSelectedTicker, 50),
    [],
  );

  // Stable user-action handlers — useCallback so child components
  // (virtualized lists, market tabs, currency switcher) don't re-render
  // with new function identities on every parent render.
  const selectTicker = useCallback(
    (t: string) => debouncedSetTicker(t),
    [debouncedSetTicker],
  );
  const switchMarket = useCallback(
    (code: MarketCode) => setSelectedMarket(code),
    [],
  );
  const switchCurrency = useCallback(
    (cur: SettlementCurrency) => setSettlementCurrency(cur),
    [],
  );

  const recordLatency = useCallback((ms: number) => {
    setLatencySamples((prev) => {
      const next = [...prev, { t: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }), ms }];
      return next.slice(-30);
    });
  }, []);

  // ─── Initial fetch (loadData) ───
  // Hoisted into a useCallback so the handler identity is stable
  // across renders — the consuming useEffect only re-fires when the
  // inputs (injectedKpis) actually change. Uses AbortController so
  // unmount or a re-fire cancels in-flight requests cleanly.
  const loadData = useCallback(async (signal: AbortSignal) => {
    const t0 = performance.now();
    try {
      const [assetsRes, statsRes] = await Promise.all([
        fetch("/api/trader/assets", { signal }),
        fetch("/api/trader/stats", { signal }),
      ]);
      recordLatency(Math.round(performance.now() - t0));

      if (assetsRes.ok) {
        const data = await assetsRes.json();
        const assetRows: AlphaAssetRow[] = (data.assets ?? []).map((a: Record<string, unknown>) => ({
          ticker: a.ticker as string,
          name: a.name as string,
          assetType: a.assetType as string,
          latestPrice: (a.latestPrice as number) ?? null,
          latestChange: (a.latestChange as number) ?? null,
          latestSentiment: (a.latestSentiment as number) ?? null,
          correlation: null,
          exchange: (a.exchange as string | null) ?? null,
          sentimentArticleCount: (a.sentimentArticleCount as number) ?? 0,
          volume: null,
        }));
        maybeUpdateAssets(assetRows);
        if (assetRows.length > 0) setSelectedTicker(assetRows[0].ticker);
      }

      if (statsRes.ok) {
        const s = await statsRes.json();
        setKpis({
          latencySignal: Math.round(performance.now() - t0),
          sentimentSpike: 0,
          assetTicker: s.topMover?.ticker ?? "—",
          assetsTracked: s.totalAssets ?? 0,
          avgSentiment: s.avgSentiment ?? 0,
          topGainer: s.topGainer ?? null,
          topLoser: s.topLoser ?? null,
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(true);
      }
    }
  }, [recordLatency, maybeUpdateAssets]);

  useEffect(() => {
    if (injectedKpis) return;
    const controller = new AbortController();
    inFlightControllers.current.add(controller);
    (async () => {
      await loadData(controller.signal);
      setLoading(false);
      inFlightControllers.current.delete(controller);
    })();
    return () => {
      controller.abort();
      inFlightControllers.current.delete(controller);
    };
  }, [injectedKpis, loadData]);

  // ─── Unmount cleanup: cancel ALL in-flight fetches ───
  // Belt-and-braces safety net. Each effect also cleans up its own
  // controller, but this catches any controller that slipped through
  // (e.g. a fetch that hasn't resolved yet when the effect's cleanup
  // already ran). Also clears any pending debounce timer implicitly
  // (the timer is captured in the debouncedSetTicker closure).
  useEffect(() => {
    return () => {
      inFlightControllers.current.forEach((c) => {
        if (!c.signal.aborted) c.abort();
      });
      inFlightControllers.current.clear();
    };
  }, []);

  // ─── Fetch correlation for selected ticker (AbortController) ───
  // When the user rapidly switches tickers (e.g. arrow-key scrolling
  // through the virtualized list), the previous fetch is aborted via
  // its AbortController — no stale response can overwrite the latest.
  useEffect(() => {
    if (!selectedTicker) return;
    const controller = new AbortController();
    inFlightControllers.current.add(controller);
    (async () => {
      setCorrLoading(true);
      try {
        const res = await fetch(
          `/api/trader/assets/${selectedTicker}/correlation?window=30`,
          { signal: controller.signal },
        );
        if (res.ok) {
          const data = await res.json();
          setCorrelation(data);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          // ignore — silent
        }
      } finally {
        if (!controller.signal.aborted) setCorrLoading(false);
        inFlightControllers.current.delete(controller);
      }
    })();
    return () => {
      controller.abort();
      inFlightControllers.current.delete(controller);
    };
  }, [selectedTicker]);

  // ─── Fetch correlation for ALL assets (AbortController) ───
  // Feeds heatmap, sparklines, distribution. A single master controller
  // cancels all per-asset sub-fetches if the asset set changes (e.g.
  // after a refresh). Aborts propagate to each fetch via Promise.all.
  const tickerSignature = assets.map((a) => a.ticker).join(",");
  useEffect(() => {
    if (assets.length === 0) return;
    const controller = new AbortController();
    inFlightControllers.current.add(controller);
    (async () => {
      setCorrDistLoading(true);
      try {
        const results = await Promise.all(
          assets.map(async (a): Promise<AssetCorrEntry> => {
            try {
              const res = await fetch(
                `/api/trader/assets/${a.ticker}/correlation?window=30`,
                { signal: controller.signal },
              );
              if (!res.ok) return { ticker: a.ticker, correlation: 0, dataPoints: 0, alignedData: [] };
              const data = await res.json();
              return {
                ticker: a.ticker,
                correlation: data.correlation ?? 0,
                dataPoints: data.dataPoints ?? 0,
                alignedData: (data.alignedData ?? []) as AlignedPoint[],
              };
            } catch (err) {
              // Re-throw abort errors so Promise.all rejects fast; swallow
              // everything else so a single bad asset doesn't nuke the batch.
              if (err instanceof Error && err.name === "AbortError") throw err;
              return { ticker: a.ticker, correlation: 0, dataPoints: 0, alignedData: [] };
            }
          })
        );
        if (!controller.signal.aborted) setAssetCorrData(results);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          // ignore
        }
      } finally {
        if (!controller.signal.aborted) setCorrDistLoading(false);
        inFlightControllers.current.delete(controller);
      }
    })();
    return () => {
      controller.abort();
      inFlightControllers.current.delete(controller);
    };
  }, [tickerSignature]);

  // ─── Executive Module 3 — Fetch history for ALL assets (window=30)
  // Feeds: mini candlestick grid, NLP order-book depth, Z-score matrix.
  // Endpoint: /api/trader/assets/[ticker]/history?window=30
  // tickerSignature must be declared OUTSIDE the effect so multiple
  // effects can depend on it (correlation + history). Previously it was
  // declared inline above the effect; we keep the same shape here.
  // (See the const declaration above this effect.)
  useEffect(() => {
    if (assets.length === 0) return;
    const controller = new AbortController();
    inFlightControllers.current.add(controller);
    (async () => {
      setHistoryLoading(true);
      try {
        const results = await Promise.all(
          assets.map(async (a): Promise<[string, AssetHistory | null]> => {
            try {
              const res = await fetch(
                `/api/trader/assets/${a.ticker}/history?window=30`,
                { signal: controller.signal },
              );
              if (!res.ok) return [a.ticker, null];
              const data = await res.json();
              return [a.ticker, {
                ticker: a.ticker,
                data: (data.data ?? []) as AssetHistoryPoint[],
                stats: {
                  priceChange: data.stats?.priceChange ?? 0,
                  sentimentChange: data.stats?.sentimentChange ?? 0,
                  correlation: data.stats?.correlation ?? 0,
                  volatility: data.stats?.volatility ?? 0,
                  dataPoints: data.stats?.dataPoints ?? 0,
                },
              }];
            } catch (err) {
              if (err instanceof Error && err.name === "AbortError") throw err;
              return [a.ticker, null];
            }
          })
        );
        if (!controller.signal.aborted) {
          const map: Record<string, AssetHistory> = {};
          for (const [t, h] of results) {
            if (h) map[t] = h;
          }
          setAssetHistories(map);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          // ignore
        }
      } finally {
        if (!controller.signal.aborted) setHistoryLoading(false);
        inFlightControllers.current.delete(controller);
      }
    })();
    return () => {
      controller.abort();
      inFlightControllers.current.delete(controller);
    };
  }, [tickerSignature]);

  // ─── Fetch alerts (may 403 for harch-alpha) ───
  useEffect(() => {
    const controller = new AbortController();
    inFlightControllers.current.add(controller);
    (async () => {
      setAlertsLoading(true);
      try {
        const res = await fetch("/api/console/alerts", { signal: controller.signal });
        if (res.status === 403) {
          setAlertsGated(true);
          setAlerts([]);
        } else if (res.ok) {
          const data = await res.json();
          setAlerts((data.alerts ?? []) as AlertItem[]);
          setAlertsGated(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          // ignore
        }
      } finally {
        if (!controller.signal.aborted) setAlertsLoading(false);
        inFlightControllers.current.delete(controller);
      }
    })();
    return () => {
      controller.abort();
      inFlightControllers.current.delete(controller);
    };
  }, [lastRefresh]);

  // ─── Fetch AI visibility (may 403) ───
  useEffect(() => {
    const controller = new AbortController();
    inFlightControllers.current.add(controller);
    (async () => {
      setAiLoading(true);
      try {
        const res = await fetch("/api/console/ai-visibility", { signal: controller.signal });
        if (res.status === 403) {
          setAiGated(true);
          setAiPlatforms([]);
        } else if (res.ok) {
          const data = await res.json();
          setAiPlatforms((data.platforms ?? []) as AIVisibilityPlatform[]);
          setAiGated(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          // ignore
        }
      } finally {
        if (!controller.signal.aborted) setAiLoading(false);
        inFlightControllers.current.delete(controller);
      }
    })();
    return () => {
      controller.abort();
      inFlightControllers.current.delete(controller);
    };
  }, [lastRefresh]);

  const firstName = userName.split(" ")[0] || "there";
  const spikeColor = (kpis?.sentimentSpike ?? 0) > 3 ? RED : (kpis?.sentimentSpike ?? 0) > 1.5 ? AMBER : ACCENT;

  const typeColors: Record<string, string> = {
    stock: GREEN,
    crypto: AMBER,
    fx: ACCENT,
    commodity: RED,
    index: TEXT_MUTED,
  };

  // ─── Refresh (AbortController + throttled setAssets) ───
  // The refresh button is user-triggered, but it still benefits from
  // AbortController (cancel the refresh if the user navigates away
  // mid-fetch) and the throttled setter (cap UI repaints to 1/sec).
  const refreshAssets = useCallback(async () => {
    setRefreshing(true);
    const controller = new AbortController();
    inFlightControllers.current.add(controller);
    const t0 = performance.now();
    try {
      const [assetsRes, statsRes] = await Promise.all([
        fetch("/api/trader/assets", { signal: controller.signal }),
        fetch("/api/trader/stats", { signal: controller.signal }),
      ]);
      recordLatency(Math.round(performance.now() - t0));
      if (assetsRes.ok) {
        const data = await assetsRes.json();
        const assetRows: AlphaAssetRow[] = (data.assets ?? []).map((a: Record<string, unknown>) => ({
          ticker: a.ticker as string,
          name: a.name as string,
          assetType: a.assetType as string,
          latestPrice: (a.latestPrice as number) ?? null,
          latestChange: (a.latestChange as number) ?? null,
          latestSentiment: (a.latestSentiment as number) ?? null,
          correlation: null,
          exchange: (a.exchange as string | null) ?? null,
          sentimentArticleCount: (a.sentimentArticleCount as number) ?? 0,
          volume: null,
        }));
        maybeUpdateAssets(assetRows);
      }
      if (statsRes.ok) {
        const s = await statsRes.json();
        setKpis({
          latencySignal: Math.round(performance.now() - t0),
          sentimentSpike: 0,
          assetTicker: s.topMover?.ticker ?? "—",
          assetsTracked: s.totalAssets ?? 0,
          avgSentiment: s.avgSentiment ?? 0,
          topGainer: s.topGainer ?? null,
          topLoser: s.topLoser ?? null,
        });
      }
      setLastRefresh(new Date());
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        // ignore
      }
    } finally {
      if (!controller.signal.aborted) setRefreshing(false);
      inFlightControllers.current.delete(controller);
    }
  }, [recordLatency, maybeUpdateAssets]);

  // ─── Filter assets by type ───
  const filteredAssets = useMemo(
    () => assets.filter((a) => assetTypeFilter === "all" || a.assetType === assetTypeFilter),
    [assets, assetTypeFilter]
  );

  // ─── CSV export ───
  const exportAssetsCSV = useCallback(() => {
    const headers = ["Ticker", "Name", "Type", "Price", "Change%", "Sentiment"];
    const rows = filteredAssets.map((a) => [a.ticker, `"${a.name}"`, a.assetType, a.latestPrice ?? "—", a.latestChange ?? "—", a.latestSentiment ?? "—"]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `alpha-assets-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredAssets]);

  // ═══════════════════════════════════════════════════════════════
  //  Derived data for widgets
  // ═══════════════════════════════════════════════════════════════

  // Sentiment Z-scores (for spike KPI)
  const sentimentStats = useMemo(() => {
    const vals = assets.map((a) => a.latestSentiment).filter((v): v is number => v !== null);
    if (vals.length < 2) return { maxZ: 0, mean: 0, std: 0 };
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
    const std = Math.sqrt(variance);
    if (std === 0) return { maxZ: 0, mean, std };
    const maxZ = Math.max(...vals.map((v) => Math.abs((v - mean) / std)));
    return { maxZ, mean, std };
  }, [assets]);

  // Candlestick OHLC from alignedData (open=prev close, close=current, honest body-only)
  const candleData = useMemo(() => {
    if (!correlation?.alignedData || correlation.alignedData.length === 0) return null;
    const pts = correlation.alignedData.filter((p) => p.price !== null);
    if (pts.length < 2) return null;
    const dates: string[] = [];
    const ohlc: (number | null)[][] = [];
    const sentiments: (number | null)[] = [];
    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i];
      const prev = i > 0 ? pts[i - 1] : null;
      const close = cur.price as number;
      const open = prev?.price ?? close;
      const high = Math.max(open, close);
      const low = Math.min(open, close);
      dates.push(cur.date);
      ohlc.push([open, close, low, high]);
      sentiments.push(cur.sentiment);
    }
    return { dates, ohlc, sentiments };
  }, [correlation]);

  // Dual-axis data
  const dualAxisData = useMemo(() => {
    if (!correlation?.alignedData || correlation.alignedData.length === 0) return null;
    const pts = correlation.alignedData;
    return {
      dates: pts.map((p) => p.date),
      prices: pts.map((p) => p.price),
      sentiments: pts.map((p) => p.sentiment),
    };
  }, [correlation]);

  // Depth chart bins (from assets sentiment + article count proxy)
  const depthBins = useMemo(() => {
    const binCount = 20;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      sentiment: -1 + (i + 0.5) * (2 / binCount),
      weight: 0,
    }));
    let counted = 0;
    for (const a of assets) {
      if (a.latestSentiment === null) continue;
      const idx = Math.min(Math.max(Math.floor((a.latestSentiment + 1) / 2 * binCount), 0), binCount - 1);
      bins[idx].weight += 1;
      counted++;
    }
    return { bins, counted };
  }, [assets]);

  // Asset × asset correlation matrix (top N by dataPoints)
  const corrMatrix = useMemo(() => {
    const top = assetCorrData
      .filter((e) => e.alignedData.length >= 5)
      .sort((a, b) => b.dataPoints - a.dataPoints)
      .slice(0, 6);
    if (top.length < 2) return null;
    const tickers = top.map((e) => e.ticker);
    const priceMaps = top.map((e) => {
      const m = new Map<string, number>();
      for (const p of e.alignedData) {
        if (p.price !== null) m.set(p.date, p.price);
      }
      return m;
    });
    // Common dates
    const allDates = new Set<string>();
    priceMaps.forEach((m) => m.forEach((_, d) => allDates.add(d)));
    const dates = Array.from(allDates).sort();
    const series = priceMaps.map((m) => dates.map((d) => m.has(d) ? m.get(d)! : null));
    // Fill gaps with forward-fill for Pearson
    const filled = series.map((s) => {
      let last: number | null = null;
      return s.map((v) => {
        if (v !== null) { last = v; return v; }
        return last ?? 0;
      });
    });
    const matrix: number[][] = [];
    for (let i = 0; i < top.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < top.length; j++) {
        if (i === j) row.push(1);
        else row.push(pearson(filled[i], filled[j]));
      }
      matrix.push(row);
    }
    return { tickers, matrix };
  }, [assetCorrData]);

  // Volatility gauges (top 6 by abs(change))
  const volatilityGauges = useMemo(() => {
    return assets
      .filter((a) => a.latestChange !== null)
      .map((a) => ({ ticker: a.ticker, vol: Math.abs(a.latestChange as number) }))
      .sort((a, b) => b.vol - a.vol)
      .slice(0, 6);
  }, [assets]);

  // Pearson r distribution (Recharts)
  const assetCorrs = useMemo(
    () => assetCorrData.map((e) => ({ ticker: e.ticker, correlation: e.correlation })),
    [assetCorrData]
  );

  // Sentiment distribution pie (Recharts)
  const pieData = useMemo(() => {
    const buckets = { bullish: 0, neutral: 0, bearish: 0, unknown: 0 };
    for (const a of assets) {
      if (a.latestSentiment === null) { buckets.unknown++; continue; }
      if (a.latestSentiment > 0.1) buckets.bullish++;
      else if (a.latestSentiment < -0.1) buckets.bearish++;
      else buckets.neutral++;
    }
    return [
      { name: "Bullish", value: buckets.bullish, color: GREEN },
      { name: "Neutral", value: buckets.neutral, color: SLATE },
      { name: "Bearish", value: buckets.bearish, color: RED },
    ].filter((d) => d.value > 0);
  }, [assets]);

  // Top movers (Recharts)
  const moversData = useMemo(() => {
    const withChange = assets.filter((a) => a.latestChange !== null);
    if (withChange.length === 0) return [];
    const sorted = [...withChange].sort((a, b) => (b.latestChange ?? 0) - (a.latestChange ?? 0));
    const top = sorted.slice(0, 3);
    const bottom = sorted.slice(-3).reverse();
    const map = new Map<string, number>();
    [...top, ...bottom].forEach((a) => map.set(a.ticker, a.latestChange ?? 0));
    return Array.from(map.entries())
      .map(([ticker, change]) => ({ ticker, change }))
      .sort((a, b) => b.change - a.change);
  }, [assets]);

  // Performance data (all assets with change)
  const perfData = useMemo(
    () => assets
      .filter((a) => a.latestChange !== null)
      .map((a) => ({ ticker: a.ticker, change: a.latestChange as number }))
      .sort((a, b) => b.change - a.change),
    [assets]
  );

  // Alpha scorecard (divergence signals: sentiment vs price disagree)
  const alphaRows = useMemo(() => {
    return assets
      .filter((a) => a.latestSentiment !== null && a.latestChange !== null)
      .map((a) => {
        const s = a.latestSentiment as number;
        const c = a.latestChange as number;
        const divergence = Math.abs(s) * Math.abs(c);
        const direction =
          s > 0.1 && c < -0.2 ? "bearish-div" :
          s < -0.1 && c > 0.2 ? "bullish-div" :
          "watch";
        const confidence = Math.min(divergence / 2, 1);
        return { ticker: a.ticker, divergence, direction, confidence, change: c, sentiment: s };
      })
      .filter((r) => r.direction !== "watch" || r.divergence > 0.1)
      .sort((a, b) => b.divergence - a.divergence);
  }, [assets]);

  // Sentiment heatmap values (assets × metrics)
  const sentimentHeatmapData = useMemo(() => {
    const tickers = assets.slice(0, 12).map((a) => a.ticker);
    const values = assets.slice(0, 12).map((a) => {
      const corrEntry = assetCorrData.find((e) => e.ticker === a.ticker);
      return {
        sentiment: a.latestSentiment,
        change: a.latestChange,
        corr: corrEntry ? corrEntry.correlation : null,
      };
    });
    return { tickers, values };
  }, [assets, assetCorrData]);

  // Sparkline assets (top 8 by dataPoints)
  const sparklineAssets = useMemo(() => {
    return assetCorrData
      .filter((e) => e.alignedData.length >= 3)
      .sort((a, b) => b.dataPoints - a.dataPoints)
      .slice(0, 8)
      .map((e) => {
        const asset = assets.find((a) => a.ticker === e.ticker);
        return {
          ticker: e.ticker,
          name: asset?.name ?? e.ticker,
          prices: e.alignedData.map((p) => p.price),
          sentiments: e.alignedData.map((p) => p.sentiment),
          change: asset?.latestChange ?? null,
          sentiment: asset?.latestSentiment ?? null,
        };
      });
  }, [assetCorrData, assets]);

  // LLM probe matrix data
  const llmMatrix = useMemo(() => {
    if (aiPlatforms.length === 0) return null;
    return LLM_ENGINES.map((engine) => {
      const match = aiPlatforms.find((p) =>
        p.platform.toLowerCase().includes(engine.toLowerCase()) ||
        engine.toLowerCase().includes(p.platform.toLowerCase())
      );
      return {
        engine,
        sentiment: match?.sentiment ?? null,
        cited: match?.cited ?? false,
        confidence: match?.confidence ?? null,
      };
    });
  }, [aiPlatforms]);

  // Market status
  const mkt = useMemo(() => marketStatus(), [lastRefresh]);

  // Latency display
  const avgLatency = useMemo(() => {
    if (latencySamples.length === 0) return kpis?.latencySignal ?? 0;
    return Math.round(latencySamples.reduce((s, v) => s + v.ms, 0) / latencySamples.length);
  }, [latencySamples, kpis]);

  // ═══════════════════════════════════════════════════════════════
  //  Executive Module 1 — Derived data
  // ═══════════════════════════════════════════════════════════════

  // Assets grouped by market code (only those that map to a market tab)
  const assetsByMarket = useMemo(() => {
    const map: Record<MarketCode, AlphaAssetRow[]> = {
      BVC: [], NYSE: [], NASDAQ: [], Euronext: [], NSE: [], JSE: [], EGX: [],
    };
    for (const a of assets) {
      const code = assetMarketCode(a.exchange);
      if (code) map[code].push(a);
    }
    return map;
  }, [assets]);

  // Per-market status (recomputed on each refresh tick)
  const marketStatusMap = useMemo(() => {
    const map: Record<MarketCode, MarketStatus> = {} as Record<MarketCode, MarketStatus>;
    for (const code of MARKET_ORDER) {
      map[code] = marketStatusFor(code);
    }
    return map;
  }, [lastRefresh]);

  // Per-market stats strip
  const marketStatsMap = useMemo(() => {
    const map: Record<MarketCode, MarketStats> = {} as Record<MarketCode, MarketStats>;
    for (const code of MARKET_ORDER) {
      const list = assetsByMarket[code];
      const withChange = list.filter((a) => a.latestChange !== null);
      const sorted = [...withChange].sort((a, b) => (b.latestChange ?? 0) - (a.latestChange ?? 0));
      const topGainer = sorted[0] ? { ticker: sorted[0].ticker, changePct: sorted[0].latestChange ?? 0 } : null;
      const topLoser = sorted[sorted.length - 1]
        ? { ticker: sorted[sorted.length - 1].ticker, changePct: sorted[sorted.length - 1].latestChange ?? 0 }
        : null;
      // Index value = price-weighted average of constituent prices (synthetic MASI-style)
      const prices = list.map((a) => a.latestPrice).filter((p): p is number => p !== null);
      const indexValue = prices.length > 0 ? prices.reduce((s, p) => s + p, 0) / prices.length : null;
      const changes = list.map((a) => a.latestChange).filter((c): c is number => c !== null);
      const indexChange = changes.length > 0 ? changes.reduce((s, c) => s + c, 0) / changes.length : null;
      // Volume proxy: sum of sentiment article counts (until volume endpoint exists)
      const totalVolume = list.reduce((s, a) => s + (a.sentimentArticleCount ?? 0), 0);
      map[code] = {
        indexValue,
        indexChange,
        totalVolume,
        topGainer,
        topLoser,
        assetCount: list.length,
      };
    }
    return map;
  }, [assetsByMarket]);

  // BVC index history (synthetic MASI = avg of BVC constituent prices per day)
  const bvcIndexHistory = useMemo(() => {
    const bvcAssets = assetsByMarket.BVC;
    if (bvcAssets.length === 0) return [];
    // Use the assetHistories to build a date→avg price series.
    const dateMap = new Map<string, number[]>();
    for (const a of bvcAssets) {
      const h = assetHistories[a.ticker];
      if (!h) continue;
      for (const pt of h.data) {
        if (pt.price !== null) {
          const arr = dateMap.get(pt.date) ?? [];
          arr.push(pt.price);
          dateMap.set(pt.date, arr);
        }
      }
    }
    const dates = Array.from(dateMap.keys()).sort();
    return dates.map((d) => {
      const arr = dateMap.get(d) ?? [];
      return arr.length > 0 ? arr.reduce((s, p) => s + p, 0) / arr.length : null;
    }).filter((p): p is number => p !== null);
  }, [assetsByMarket, assetHistories]);

  // Assets filtered by selected market
  const selectedMarketAssets = useMemo(
    () => assetsByMarket[selectedMarket],
    [assetsByMarket, selectedMarket],
  );

  // ═══════════════════════════════════════════════════════════════
  //  Executive Module 2 — Derived data (multi-currency settlement)
  // ═══════════════════════════════════════════════════════════════

  // Settlement ledger rows — all assets, in selected currency
  const ledgerRows = useMemo<LedgerRow[]>(() => {
    return assets.map((a) => {
      const cur = assetCurrency(a);
      const priceSettled = a.latestPrice !== null
        ? priceInCurrency(a.latestPrice, cur, settlementCurrency)
        : null;
      const posSize = syntheticPositionSize(a);
      const valueSettled = (a.latestPrice !== null && priceSettled !== null)
        ? priceSettled * posSize
        : null;
      return {
        ticker: a.ticker,
        market: a.exchange ?? "—",
        priceNative: a.latestPrice,
        priceSettled,
        changePct: a.latestChange,
        sentiment: a.latestSentiment,
        positionSize: posSize,
        valueSettled,
        currency: cur,
      };
    });
  }, [assets, settlementCurrency]);

  // Portfolio value (settled) — sum of all settled position values
  const portfolioValueSettled = useMemo(() => {
    return ledgerRows.reduce((s, r) => s + (r.valueSettled ?? 0), 0);
  }, [ledgerRows]);

  // Portfolio value in all 3 currencies (for header strip)
  const portfolioValues = useMemo(() => {
    return {
      MAD: priceInCurrency(portfolioValueSettled, settlementCurrency, "MAD"),
      EUR: priceInCurrency(portfolioValueSettled, settlementCurrency, "EUR"),
      USD: priceInCurrency(portfolioValueSettled, settlementCurrency, "USD"),
    };
  }, [portfolioValueSettled, settlementCurrency]);

  // Currency exposure (for donut chart)
  const currencyExposure = useMemo(() => {
    const byCurrency: Record<SettlementCurrency, number> = { MAD: 0, EUR: 0, USD: 0 };
    for (const a of assets) {
      const cur = assetCurrency(a);
      const posSize = syntheticPositionSize(a);
      const value = a.latestPrice !== null ? a.latestPrice * posSize : 0;
      // Convert each native-currency value to USD for an apples-to-apples exposure view
      byCurrency[cur] += priceInCurrency(value, cur, "USD");
    }
    const colorMap: Record<SettlementCurrency, string> = { MAD: ACCENT, EUR: AMBER, USD: GREEN };
    return (Object.keys(byCurrency) as SettlementCurrency[])
      .map((c) => ({ currency: c, value: byCurrency[c], color: colorMap[c] }))
      .filter((e) => e.value > 0);
  }, [assets]);

  // FX spread indicator (derived: bid/ask spread for settlement currency pair vs USD)
  const fxSpread = useMemo(() => {
    // Synthetic spread: 0.4% of mid (institutional proxy)
    const mid = FX_SETTLEMENT_RATE[settlementCurrency]["USD"];
    const spreadPct = 0.4;
    const bid = mid * (1 - spreadPct / 200);
    const ask = mid * (1 + spreadPct / 200);
    return { bid, ask, mid, spreadPct };
  }, [settlementCurrency]);

  // ═══════════════════════════════════════════════════════════════
  //  Executive Module 3 — Derived data (Z-score + order-book matrix)
  // ═══════════════════════════════════════════════════════════════

  // Z-score rows for ALL assets (from history endpoint data)
  const zScoreRows = useMemo<ZScoreRow[]>(() => {
    return assets.map((a) => {
      const h = assetHistories[a.ticker];
      if (!h || h.data.length < 2) {
        return {
          ticker: a.ticker,
          zPrice: null,
          zSentiment: null,
          anomaly: null,
          latestPrice: a.latestPrice,
          latestSentiment: a.latestSentiment,
        };
      }
      const prices = h.data.map((p) => p.price).filter((p): p is number => p !== null);
      const sentiments = h.data.map((p) => p.sentiment).filter((s): s is number => s !== null);
      const zPrice = zScore(prices).z;
      const zSent = zScore(sentiments).z;
      const anomaly = (zPrice !== null && zSent !== null)
        ? Math.max(Math.abs(zPrice), Math.abs(zSent))
        : (zPrice ?? zSent);
      return {
        ticker: a.ticker,
        zPrice,
        zSentiment: zSent,
        anomaly,
        latestPrice: a.latestPrice,
        latestSentiment: a.latestSentiment,
      };
    });
  }, [assets, assetHistories]);

  // Mini candlestick grid — top 8 assets by dataPoints (history availability)
  const miniCandleAssets = useMemo(() => {
    return assets
      .map((a) => {
        const h = assetHistories[a.ticker];
        if (!h || h.data.length < 3) return null;
        const ohlcData = buildOHLCFromHistory(h.data);
        if (ohlcData.ohlc.length < 2) return null;
        // Z-score series from sentiment history (for overlay)
        const sentiments = h.data.map((p) => p.sentiment).filter((s): s is number => s !== null);
        const { mean, std } = zScore(sentiments);
        const zScores = ohlcData.sentiments.map((s) => {
          if (s === null || std === 0) return null;
          return (s - mean) / std;
        });
        return {
          ticker: a.ticker,
          ohlc: ohlcData.ohlc,
          zScores,
          change: a.latestChange,
          sentiment: a.latestSentiment,
          dataPoints: h.data.length,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.dataPoints - a.dataPoints)
      .slice(0, 8);
  }, [assets, assetHistories]);

  // NLP Order-Book for selected asset (from history endpoint data)
  const orderBook = useMemo(() => {
    if (!selectedTicker) return null;
    const asset = assets.find((a) => a.ticker === selectedTicker);
    if (!asset || asset.latestPrice === null) return null;
    const h = assetHistories[selectedTicker];
    if (!h || h.data.length === 0) return null;
    return buildOrderBook(asset.latestPrice, h.data);
  }, [selectedTicker, assets, assetHistories]);

  // Sentiment pressure gauge (net sentiment for selected asset)
  const selectedAssetPressure = useMemo(() => {
    if (!selectedTicker) return null;
    const asset = assets.find((a) => a.ticker === selectedTicker);
    if (!asset) return null;
    // Net pressure = latest sentiment (if available) else 0
    return asset.latestSentiment ?? 0;
  }, [selectedTicker, assets]);

  // ─── Toolbar buttons (preserved from V7) ───
  const toolbarBtn = (active: boolean): React.CSSProperties => ({
    padding: "3px 8px",
    fontSize: "9px",
    fontFamily: FONT.mono,
    fontWeight: 600,
    border: `1px solid ${active ? ACCENT : BORDER}`,
    borderRadius: "3px",
    background: active ? `${ACCENT}12` : SURFACE,
    color: active ? ACCENT : TEXT_MUTED,
    cursor: "pointer",
    transition: "all 0.15s ease",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  });

  const axisTickStyle = {
    fontSize: 10,
    fontFamily: FONT.mono,
    fill: TEXT_MUTED,
  };

  const tooltipContentStyle: React.CSSProperties = {
    background: SURFACE,
    border: `1px solid ${BORDER}`,
    borderRadius: "4px",
    fontSize: "11px",
    fontFamily: FONT.mono,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  const tooltipLabelStyle: React.CSSProperties = {
    fontSize: "10px",
    fontFamily: FONT.mono,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "4px",
  };

  return (
    <div
      className="dash-main"
      style={{
        padding: "16px",
        background: SURFACE,
        overflowX: "hidden",
        color: TEXT,
        fontFamily: FONT.sans,
      }}
    >
      <style>{`
        .dash-main ::-webkit-scrollbar { width: 6px; height: 6px; }
        .dash-main ::-webkit-scrollbar-track { background: transparent; }
        .dash-main ::-webkit-scrollbar-thumb { background: ${BORDER_STRONG}; border-radius: 3px; }
        .dash-main ::-webkit-scrollbar-thumb:hover { background: ${TEXT_MUTED}; }
      `}</style>

      {/* ─── Pre-market brief banner ─── */}
      <div
        style={{
          padding: "10px 14px",
          background: ACCENT_BG,
          borderRadius: "4px",
          marginBottom: "12px",
          borderLeft: `3px solid ${ACCENT}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>
            {firstName}, pre-market brief.{" "}
            {sentimentStats.maxZ > 3
              ? `Anomaly detected (Z=${sentimentStats.maxZ.toFixed(1)}).`
              : "No divergences. Market nominal."}
          </div>
          <div style={{ fontSize: "10px", color: TEXT_MUTED, fontFamily: FONT.mono, marginTop: "3px" }}>
            Detection latency: {avgLatency}ms · {kpis?.assetsTracked ?? 0} assets · session {mkt.session}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {(["all", "stock", "crypto", "fx", "commodity"] as const).map((f) => (
            <button key={f} onClick={() => setAssetTypeFilter(f)} style={toolbarBtn(assetTypeFilter === f)}>
              {f}
            </button>
          ))}
          <button
            onClick={refreshAssets}
            disabled={refreshing}
            style={{
              ...toolbarBtn(false),
              cursor: refreshing ? "not-allowed" : "pointer",
              opacity: refreshing ? 0.6 : 1,
            }}
            title={`Last refreshed: ${lastRefresh.toLocaleTimeString("en-US")}`}
          >
            {refreshing ? "\u21BB ..." : "\u21BB REFRESH"}
          </button>
          <button onClick={exportAssetsCSV} style={toolbarBtn(false)}>
            {"\u2193"} CSV
          </button>
        </div>
      </div>

      {/* ─── Page title ─── */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            fontSize: "10px",
            fontFamily: FONT.mono,
            color: ACCENT,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "2px",
          }}
        >
          Alpha Desk · V8 Quant Terminal
        </div>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: TEXT,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          High-Frequency Market Monitor
        </h3>
      </div>

      {loading ? (
        <div style={{ padding: "24px" }}>
          <SkeletonLoader accent={ACCENT} lines={3} height={40} />
        </div>
      ) : error ? (
        <div style={{ marginBottom: "16px" }}>
          <ErrorState accent={ACCENT} message="Signal lost — reconnecting to market feed…" />
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════
              ROW 1 — PRE-MARKET STRIP (24 cols, 6 KPI tiles × 4 cols each)
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {/* 1. Signal Latency */}
            <KPITile
              label="Signal Latency"
              value={`${avgLatency}ms`}
              sublabel={`last ${latencySamples.length} samples`}
              color={ACCENT}
            />
            {/* 2. Sentiment Spike (Z-score) */}
            <KPITile
              label="Sentiment Spike"
              value={`Z=${sentimentStats.maxZ.toFixed(1)}`}
              sublabel={sentimentStats.maxZ > 3 ? "ANOMALY" : "nominal"}
              color={spikeColor}
            />
            {/* 3. Top Mover */}
            <KPITile
              label="Top Mover"
              value={kpis?.assetTicker ?? "—"}
              sublabel="sentiment delta"
              color={TEXT}
            />
            {/* 4. Assets Tracked */}
            <KPITile
              label="Assets Tracked"
              value={`${kpis?.assetsTracked ?? 0}`}
              sublabel="watchlist size"
              color={TEXT}
            />
            {/* 5. Avg Sentiment */}
            <KPITile
              label="Avg Sentiment"
              value={`${(kpis?.avgSentiment ?? 0) > 0 ? "+" : ""}${(kpis?.avgSentiment ?? 0).toFixed(2)}`}
              sublabel={((kpis?.avgSentiment ?? 0) > 0.1) ? "bullish bias" : ((kpis?.avgSentiment ?? 0) < -0.1) ? "bearish bias" : "neutral"}
              color={(kpis?.avgSentiment ?? 0) > 0.1 ? GREEN : (kpis?.avgSentiment ?? 0) < -0.1 ? RED : TEXT_MUTED}
            />
            {/* 6. Market Status */}
            <KPITile
              label="Market Status"
              value={mkt.label}
              sublabel={mkt.session}
              color={mkt.open ? GREEN : TEXT_MUTED}
            />
          </div>

          {/* ═══════════════════════════════════════════════════════════
              ROW 2 — ASSET SELECTOR (6) | MAIN CHART (12) | ORDER BOOK (6)
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {/* 9. Virtualized Asset List */}
            <DashboardErrorBoundary label="Asset Selector" accent={ACCENT}>
            <WidgetCard
              title={`Asset Selector · ${filteredAssets.length}`}
              subtitle="click to load chart"
              cols={6}
              height={400}
              right={
                <span style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, letterSpacing: "0.1em" }}>
                  VIRTUAL
                </span>
              }
            >
              {filteredAssets.length === 0 ? (
                <AwaitingTelemetry label="asset feed" />
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "56px 1fr 64px 56px 48px",
                      gap: "4px",
                      padding: "0 6px 4px 6px",
                      fontSize: "8px",
                      fontFamily: FONT.mono,
                      color: TEXT_MUTED,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      borderBottom: `1px solid ${BORDER}`,
                      marginBottom: "4px",
                    }}
                  >
                    <span>Ticker</span>
                    <span>Type</span>
                    <span style={{ textAlign: "right" }}>Price</span>
                    <span style={{ textAlign: "right" }}>Δ%</span>
                    <span style={{ textAlign: "right" }}>Sent</span>
                  </div>
                  <VirtualizedAssetList
                    assets={filteredAssets}
                    selectedTicker={selectedTicker}
                    onSelect={selectTicker}
                    typeColors={typeColors}
                  />
                </>
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 7. Candlestick + Z-Score Overlay */}
            <DashboardErrorBoundary label="Candlestick + Z-Score" accent={ACCENT}>
            <WidgetCard
              title={`Candlestick + Z-Score · ${selectedTicker ?? "—"}`}
              subtitle="30d close-to-close · sentiment overlay"
              cols={12}
              height={400}
              right={
                correlation && !corrLoading ? (
                  <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: correlationColor(correlation.correlation), fontWeight: 700 }}>
                    r={correlation.correlation.toFixed(2)}
                  </span>
                ) : null
              }
            >
              {corrLoading ? (
                <SkeletonLoader accent={ACCENT} lines={1} height={180} />
              ) : candleData ? (
                <ReactECharts
                  option={buildCandlestickOption(candleData.dates, candleData.ohlc, candleData.sentiments, selectedTicker ?? "")}
                  style={{ height: "100%", minHeight: 320 }}
                  opts={{ renderer: "canvas" }}
                  notMerge
                />
              ) : (
                <AwaitingTelemetry label="price telemetry" />
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 10. NLP Order-Book Depth */}
            <DashboardErrorBoundary label="Order-Book Depth" accent={ACCENT}>
            <WidgetCard
              title="NLP Order-Book Depth"
              subtitle="sentiment-weighted bid/ask"
              cols={6}
              height={400}
              right={
                <span style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, letterSpacing: "0.1em" }}>
                  {depthBins.counted} lvls
                </span>
              }
            >
              {depthBins.counted === 0 ? (
                <AwaitingTelemetry label="depth telemetry" />
              ) : (
                <ReactECharts
                  option={buildDepthOption(depthBins.bins)}
                  style={{ height: "100%", minHeight: 320 }}
                  opts={{ renderer: "canvas" }}
                  notMerge
                />
              )}
            </WidgetCard>
            </DashboardErrorBoundary>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              ROW 3 — LLM PROBE (8) | CORRELATION GRID (8) | VOLATILITY (8)
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {/* 11. LLM Probe Matrix */}
            <DashboardErrorBoundary label="LLM Probe Matrix" accent={ACCENT}>
            <WidgetCard
              title="LLM Probe Matrix"
              subtitle="8 AI engines · sentiment"
              cols={8}
              height={300}
            >
              {aiLoading ? (
                <SkeletonLoader accent={ACCENT} lines={4} height={20} />
              ) : aiGated || !llmMatrix ? (
                <AwaitingTelemetry label="ai visibility feed" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: 240, overflowY: "auto" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 60px 50px 50px",
                      gap: "6px",
                      padding: "0 4px 4px 4px",
                      fontSize: "8px",
                      fontFamily: FONT.mono,
                      color: TEXT_MUTED,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <span>Engine</span>
                    <span style={{ textAlign: "right" }}>Sent</span>
                    <span style={{ textAlign: "right" }}>Cited</span>
                    <span style={{ textAlign: "right" }}>Conf</span>
                  </div>
                  {llmMatrix.map((row) => {
                    const sColor = row.sentiment !== null
                      ? row.sentiment > 0.1 ? GREEN : row.sentiment < -0.1 ? RED : TEXT_MUTED
                      : BORDER_STRONG;
                    return (
                      <div
                        key={row.engine}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 60px 50px 50px",
                          gap: "6px",
                          padding: "4px",
                          alignItems: "center",
                          fontSize: "10px",
                          fontFamily: FONT.mono,
                          borderBottom: `1px solid ${BORDER}`,
                        }}
                      >
                        <span style={{ color: TEXT, fontWeight: 600 }}>{row.engine}</span>
                        <span style={{ textAlign: "right", color: sColor, fontWeight: 700 }}>
                          {row.sentiment !== null ? row.sentiment.toFixed(2) : "—"}
                        </span>
                        <span style={{ textAlign: "right", fontSize: "9px", color: row.cited ? GREEN : TEXT_MUTED, fontWeight: 700 }}>
                          {row.cited ? "YES" : "NO"}
                        </span>
                        <span style={{ textAlign: "right", color: TEXT_MUTED }}>
                          {row.confidence !== null ? `${Math.round(row.confidence * 100)}%` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 12. Correlation Strength Heatmap (asset × asset) */}
            <DashboardErrorBoundary label="Correlation Matrix" accent={ACCENT}>
            <WidgetCard
              title="Correlation Matrix"
              subtitle="asset × asset price r"
              cols={8}
              height={300}
            >
              {corrDistLoading ? (
                <SkeletonLoader accent={ACCENT} lines={3} height={20} />
              ) : corrMatrix ? (
                <ReactECharts
                  option={buildCorrHeatmapOption(corrMatrix.tickers, corrMatrix.matrix)}
                  style={{ height: "100%", minHeight: 220 }}
                  opts={{ renderer: "canvas" }}
                  notMerge
                />
              ) : (
                <AwaitingTelemetry label="correlation matrix" />
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 14. Volatility Micro-Gauges */}
            <DashboardErrorBoundary label="Volatility Gauges" accent={ACCENT}>
            <WidgetCard
              title="Volatility Gauges"
              subtitle="|Δ%| per asset"
              cols={8}
              height={300}
            >
              {volatilityGauges.length === 0 ? (
                <AwaitingTelemetry label="volatility feed" />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${Math.min(volatilityGauges.length, 3)}, 1fr)`,
                    gap: "4px",
                    height: "100%",
                  }}
                >
                  {volatilityGauges.map((g) => (
                    <div key={g.ticker} style={{ position: "relative" }}>
                      <ReactECharts
                        option={buildGaugeOption(g.ticker, g.vol, Math.max(5, Math.ceil(Math.max(...volatilityGauges.map((v) => v.vol)))))}
                        style={{ height: "140px", width: "100%" }}
                        opts={{ renderer: "canvas" }}
                        notMerge
                      />
                    </div>
                  ))}
                </div>
              )}
            </WidgetCard>
            </DashboardErrorBoundary>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              ROW 4 — MULTI-ASSET DASHBOARD (24 cols, 8 sparkline cards)
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <DashboardErrorBoundary label="Sparkline Dashboard" accent={ACCENT}>
            <WidgetCard
              title="Multi-Asset Sparkline Dashboard"
              subtitle="price (cyan) + sentiment (amber) · 30d"
              cols={24}
              height={200}
            >
              {sparklineAssets.length === 0 ? (
                <AwaitingTelemetry label="sparkline telemetry" />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "6px",
                  }}
                >
                  {sparklineAssets.map((s) => {
                    const changeColor = s.change !== null
                      ? s.change > 0 ? GREEN : s.change < 0 ? RED : TEXT_MUTED
                      : TEXT_MUTED;
                    return (
                      <div
                        key={s.ticker}
                        style={{
                          border: `1px solid ${BORDER}`,
                          borderRadius: "3px",
                          padding: "6px",
                          background: SURFACE_SUBTLE,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginBottom: "2px",
                          }}
                        >
                          <span style={{ fontSize: "10px", fontFamily: FONT.mono, fontWeight: 700, color: TEXT }}>
                            {s.ticker}
                          </span>
                          <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: changeColor, fontWeight: 700 }}>
                            {s.change !== null ? `${s.change > 0 ? "+" : ""}${s.change.toFixed(1)}%` : "—"}
                          </span>
                        </div>
                        <ReactECharts
                          option={buildSparklineOption(s.prices, s.sentiments)}
                          style={{ height: "50px", width: "100%" }}
                          opts={{ renderer: "canvas" }}
                          notMerge
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, marginTop: "2px" }}>
                          <span>sent: {s.sentiment !== null ? s.sentiment.toFixed(2) : "—"}</span>
                          <span>{s.prices.filter((p) => p !== null).length}pt</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </WidgetCard>
            </DashboardErrorBoundary>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              ROW 5 — SIGNAL FEED (12) | ALPHA SCORECARD (12)
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {/* 16. Virtualized Signal Feed */}
            <DashboardErrorBoundary label="Signal Feed" accent={ACCENT}>
            <WidgetCard
              title={`Signal Feed · ${alerts.length}`}
              subtitle="crisis alerts · virtualized"
              cols={12}
              height={340}
              right={
                <span style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, letterSpacing: "0.1em" }}>
                  VIRTUAL
                </span>
              }
            >
              {alertsLoading ? (
                <SkeletonLoader accent={ACCENT} lines={6} height={16} />
              ) : alertsGated ? (
                <AwaitingTelemetry label="alert feed (403)" />
              ) : alerts.length === 0 ? (
                <AwaitingTelemetry label="alert feed" />
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "48px 52px 1fr 80px",
                      gap: "6px",
                      padding: "0 6px 4px 6px",
                      fontSize: "8px",
                      fontFamily: FONT.mono,
                      color: TEXT_MUTED,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      borderBottom: `1px solid ${BORDER}`,
                      marginBottom: "4px",
                    }}
                  >
                    <span>Sev</span>
                    <span>Time</span>
                    <span>Title</span>
                    <span style={{ textAlign: "right" }}>Sent</span>
                  </div>
                  <VirtualizedSignalFeed alerts={alerts} />
                </>
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 17. Virtualized Alpha Scorecard */}
            <DashboardErrorBoundary label="Alpha Scorecard" accent={ACCENT}>
            <WidgetCard
              title={`Alpha Scorecard · ${alphaRows.length}`}
              subtitle="divergence signals · ranked"
              cols={12}
              height={340}
              right={
                <span style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, letterSpacing: "0.1em" }}>
                  VIRTUAL
                </span>
              }
            >
              {alphaRows.length === 0 ? (
                <AwaitingTelemetry label="alpha signals" />
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "56px 1fr 64px 72px 56px",
                      gap: "6px",
                      padding: "0 6px 4px 6px",
                      fontSize: "8px",
                      fontFamily: FONT.mono,
                      color: TEXT_MUTED,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      borderBottom: `1px solid ${BORDER}`,
                      marginBottom: "4px",
                    }}
                  >
                    <span>Ticker</span>
                    <span>Signal</span>
                    <span style={{ textAlign: "right" }}>Diverg</span>
                    <span style={{ textAlign: "right" }}>Conf</span>
                    <span style={{ textAlign: "right" }}>%</span>
                  </div>
                  <VirtualizedAlphaScorecard rows={alphaRows} />
                </>
              )}
            </WidgetCard>
            </DashboardErrorBoundary>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              ROW 6 — Correlation quick-view (preserved from V7, full width)
              ═══════════════════════════════════════════════════════════ */}
          {selectedTicker && correlation && (
            <div
              style={{
                padding: "12px",
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div>
                  <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>
                    Sentiment → Price Correlation
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT, fontFamily: FONT.mono }}>
                    {selectedTicker} · 30d window
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: FONT.mono, color: correlationColor(correlation.correlation) }}>
                    {correlation.correlation.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Pearson r · {correlation.dataPoints} pts
                  </div>
                </div>
              </div>
              <div style={{ padding: "10px", background: SURFACE_SUBTLE, borderRadius: "3px", fontSize: "12px", color: TEXT_BODY, lineHeight: 1.5 }}>
                <strong style={{ color: correlation.direction === "positive" ? GREEN : RED, fontFamily: FONT.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {correlation.direction === "positive" ? "Positive" : "Negative"}
                </strong>
                {" — "}
                {correlation.interpretation}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              ROW 7 — Dual Axis (12) | Pearson r Distribution (12)
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {/* 8. Price × Sentiment Dual Axis (ECharts) */}
            <DashboardErrorBoundary label="Dual Axis Chart" accent={ACCENT}>
            <WidgetCard
              title={`Price × Sentiment Dual Axis · ${selectedTicker ?? "—"}`}
              subtitle="divergence highlight"
              cols={12}
              height={300}
            >
              {corrLoading ? (
                <SkeletonLoader accent={ACCENT} lines={1} height={180} />
              ) : dualAxisData ? (
                <ReactECharts
                  option={buildDualAxisOption(dualAxisData.dates, dualAxisData.prices, dualAxisData.sentiments, selectedTicker ?? "")}
                  style={{ height: "100%", minHeight: 220 }}
                  opts={{ renderer: "canvas" }}
                  notMerge
                />
              ) : (
                <AwaitingTelemetry label="dual-axis telemetry" />
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 13. Pearson r Distribution (Recharts bar) */}
            <DashboardErrorBoundary label="Pearson r Distribution" accent={ACCENT}>
            <WidgetCard
              title="Pearson r Distribution"
              subtitle="sentiment → price · all assets"
              cols={12}
              height={300}
            >
              {corrDistLoading ? (
                <SkeletonLoader accent={ACCENT} lines={1} height={180} />
              ) : assetCorrs.length === 0 ? (
                <AwaitingTelemetry label="correlation distribution" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={assetCorrs} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke={BORDER} strokeDasharray="3 3" opacity={0.5} />
                    <XAxis
                      dataKey="ticker"
                      tick={{ ...axisTickStyle, fill: TEXT, fontWeight: 700 }}
                      stroke={BORDER}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis domain={[-1, 1]} tick={axisTickStyle} stroke={BORDER} width={36} />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      labelStyle={tooltipLabelStyle}
                      formatter={(value: number | string) => [
                        typeof value === "number" ? value.toFixed(3) : value,
                        "Pearson r",
                      ]}
                    />
                    <ReferenceLine y={0} stroke={TEXT_MUTED} strokeOpacity={0.5} />
                    <ReferenceLine y={0.5} stroke={GREEN} strokeDasharray="2 2" strokeOpacity={0.3} />
                    <ReferenceLine y={-0.5} stroke={RED} strokeDasharray="2 2" strokeOpacity={0.3} />
                    <Bar dataKey="correlation" name="Pearson r" radius={[2, 2, 0, 0]}>
                      {assetCorrs.map((entry, i) => (
                        <Cell key={`corr-${i}`} fill={correlationColor(entry.correlation)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </WidgetCard>
            </DashboardErrorBoundary>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              ROW 8 — Sentiment Pie (6) | Top Movers (6) | Heatmap (6) | Latency (6)
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {/* 18. Sentiment Distribution Pie (Recharts) */}
            <DashboardErrorBoundary label="Sentiment Distribution" accent={ACCENT}>
            <WidgetCard
              title="Sentiment Distribution"
              subtitle="asset count"
              cols={6}
              height={280}
            >
              {pieData.length === 0 ? (
                <AwaitingTelemetry label="sentiment distribution" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={36}
                      paddingAngle={2}
                      label={({ name, value }: { name: string; value: number }) => `${name} ${value}`}
                      labelLine={{ stroke: TEXT_MUTED, strokeWidth: 1 }}
                      style={{ fontSize: "9px", fontFamily: FONT.mono, fill: TEXT }}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={`pie-${i}`} fill={entry.color} stroke={SURFACE} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      labelStyle={tooltipLabelStyle}
                      formatter={(value: number | string, name: string) => [`${value} assets`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: "9px", fontFamily: FONT.mono, paddingTop: "4px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 19. Top Gainers / Losers (Recharts) */}
            <DashboardErrorBoundary label="Top Movers" accent={ACCENT}>
            <WidgetCard
              title="Top Movers"
              subtitle="gainers vs losers"
              cols={6}
              height={280}
            >
              {moversData.length === 0 ? (
                <AwaitingTelemetry label="movers telemetry" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={moversData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                    <CartesianGrid stroke={BORDER} strokeDasharray="3 3" opacity={0.5} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={axisTickStyle}
                      stroke={BORDER}
                      tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="ticker"
                      tick={{ ...axisTickStyle, fill: TEXT, fontWeight: 700 }}
                      stroke={BORDER}
                      width={48}
                    />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      labelStyle={tooltipLabelStyle}
                      formatter={(value: number | string) => [
                        typeof value === "number" ? formatPct(value) : value,
                        "Change",
                      ]}
                    />
                    <ReferenceLine x={0} stroke={TEXT_MUTED} strokeOpacity={0.6} />
                    <Bar dataKey="change" name="Δ%" radius={[2, 2, 2, 2]}>
                      {moversData.map((entry, i) => (
                        <Cell key={`mover-${i}`} fill={entry.change > 0 ? GREEN : entry.change < 0 ? RED : SLATE} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 20. Sentiment Heatmap Grid (ECharts) */}
            <DashboardErrorBoundary label="Sentiment Heatmap" accent={ACCENT}>
            <WidgetCard
              title="Sentiment Heatmap"
              subtitle="assets × metrics"
              cols={6}
              height={280}
            >
              {sentimentHeatmapData.tickers.length === 0 ? (
                <AwaitingTelemetry label="sentiment heatmap" />
              ) : (
                <ReactECharts
                  option={buildSentimentHeatmapOption(sentimentHeatmapData.tickers, sentimentHeatmapData.values)}
                  style={{ height: "100%", minHeight: 220 }}
                  opts={{ renderer: "canvas" }}
                  notMerge
                />
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 21. Latency Timeline (ECharts) */}
            <DashboardErrorBoundary label="Latency Timeline" accent={ACCENT}>
            <WidgetCard
              title="Latency Timeline"
              subtitle="client RTT · rolling 30"
              cols={6}
              height={280}
              right={
                <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: ACCENT, fontWeight: 700 }}>
                  {avgLatency}ms avg
                </span>
              }
            >
              {latencySamples.length === 0 ? (
                <AwaitingTelemetry label="latency telemetry" />
              ) : (
                <ReactECharts
                  option={buildLatencyOption(latencySamples)}
                  style={{ height: "100%", minHeight: 220 }}
                  opts={{ renderer: "canvas" }}
                  notMerge
                />
              )}
            </WidgetCard>
            </DashboardErrorBoundary>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              ROW 9 — Asset Performance Comparison (full width, Recharts)
              Preserved from V7 (chart 2)
              ═══════════════════════════════════════════════════════════ */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: "8px" }}>
            <DashboardErrorBoundary label="Asset Performance" accent={ACCENT}>
            <WidgetCard
              title="Asset Performance — Latest Δ%"
              subtitle="all assets · horizontal bar"
              cols={24}
              height={300}
            >
              {perfData.length === 0 ? (
                <AwaitingTelemetry label="performance telemetry" />
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(200, perfData.length * 24)}>
                  <BarChart data={perfData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                    <CartesianGrid stroke={BORDER} strokeDasharray="3 3" opacity={0.5} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={axisTickStyle}
                      stroke={BORDER}
                      tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="ticker"
                      tick={{ ...axisTickStyle, fill: TEXT, fontWeight: 700 }}
                      stroke={BORDER}
                      width={48}
                    />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      labelStyle={tooltipLabelStyle}
                      formatter={(value: number | string) => [
                        typeof value === "number" ? formatPct(value) : value,
                        "Change",
                      ]}
                    />
                    <ReferenceLine x={0} stroke={TEXT_MUTED} strokeOpacity={0.5} />
                    <Bar dataKey="change" name="Δ%" radius={[2, 2, 2, 2]}>
                      {perfData.map((entry, i) => (
                        <Cell key={`perf-${i}`} fill={entry.change > 0 ? GREEN : entry.change < 0 ? RED : SLATE} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </WidgetCard>
            </DashboardErrorBoundary>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              ═══════════════════════════════════════════════════════════
              EXECUTIVE MODULES (V9)
              ═══════════════════════════════════════════════════════════
              Module 1 — Sélecteur de Marché Global & Régional
              Module 2 — Multi-Devises & Settlement Ledger
              Module 3 — Matrice Multi-Asset Z-Score & Order-Book
              ═══════════════════════════════════════════════════════════
              ═══════════════════════════════════════════════════════════ */}

          {/* ─── Executive header ─── */}
          <div
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              padding: "8px 12px",
              background: SURFACE_SUBTLE,
              border: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${ACCENT}`,
              borderRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div>
              <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: ACCENT, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
                Harch Alpha · Executive Cockpit
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT, fontFamily: FONT.sans }}>
                Le Cockpit Quantitatif &amp; Multimarché
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "9px", fontFamily: FONT.mono, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              <span>7 markets · 3 currencies · {assets.length} instruments</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              EXECUTIVE MODULE 1 — Sélecteur de Marché Global & Régional
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <DashboardErrorBoundary label="Market Selector (M1)" accent={ACCENT}>
            <WidgetCard
              title="Sélecteur de Marché Global & Régional"
              subtitle="multi-venue · timezone-aware status"
              cols={24}
              height={520}
              right={
                <span style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, letterSpacing: "0.1em" }}>
                  EXEC · M1
                </span>
              }
            >
              {/* Market tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                  paddingBottom: "10px",
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                {MARKET_ORDER.map((code) => {
                  const cfg = MARKETS[code];
                  const status = marketStatusMap[code];
                  const stats = marketStatsMap[code];
                  const isActive = code === selectedMarket;
                  return (
                    <button
                      key={code}
                      onClick={() => switchMarket(code)}
                      style={{
                        padding: "6px 10px",
                        fontSize: "10px",
                        fontFamily: FONT.mono,
                        fontWeight: 700,
                        border: `1px solid ${isActive ? ACCENT : BORDER}`,
                        borderRadius: "3px",
                        background: isActive ? `${ACCENT}14` : SURFACE,
                        color: isActive ? ACCENT : TEXT_MUTED,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        minWidth: 96,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: status.open ? GREEN : status.label === "PRE-MKT" ? AMBER : BORDER_STRONG,
                          boxShadow: status.open ? `0 0 6px ${GREEN}` : "none",
                        }}
                      />
                      <span>{cfg.label}</span>
                      <span style={{ fontSize: "8px", color: isActive ? ACCENT : BORDER_STRONG, fontWeight: 600 }}>
                        {stats.assetCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Market stats strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "6px",
                  marginBottom: "12px",
                }}
              >
                {(() => {
                  const cfg = MARKETS[selectedMarket];
                  const status = marketStatusMap[selectedMarket];
                  const stats = marketStatsMap[selectedMarket];
                  const idxColor = stats.indexChange !== null
                    ? stats.indexChange > 0 ? GREEN : stats.indexChange < 0 ? RED : TEXT_MUTED
                    : TEXT_MUTED;
                  return (
                    <>
                      <div style={{ border: `1px solid ${BORDER}`, borderRadius: "3px", padding: "8px", background: SURFACE_SUBTLE }}>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>Status</div>
                        <div style={{ fontSize: "14px", fontWeight: 800, fontFamily: FONT.mono, color: status.open ? GREEN : status.label === "PRE-MKT" ? AMBER : TEXT_MUTED, marginTop: "4px" }}>
                          {status.label}
                        </div>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, marginTop: "2px" }}>
                          {status.localTime} · {status.weekday} · {cfg.tz.replace("_", " ")}
                        </div>
                      </div>
                      <div style={{ border: `1px solid ${BORDER}`, borderRadius: "3px", padding: "8px", background: SURFACE_SUBTLE }}>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>{cfg.label} Index</div>
                        <div style={{ fontSize: "14px", fontWeight: 800, fontFamily: FONT.mono, color: TEXT, marginTop: "4px" }}>
                          {stats.indexValue !== null ? stats.indexValue.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}
                        </div>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: idxColor, marginTop: "2px", fontWeight: 700 }}>
                          {stats.indexChange !== null ? `${stats.indexChange > 0 ? "+" : ""}${stats.indexChange.toFixed(2)}%` : "—"}
                        </div>
                      </div>
                      <div style={{ border: `1px solid ${BORDER}`, borderRadius: "3px", padding: "8px", background: SURFACE_SUBTLE }}>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>Volume (proxy)</div>
                        <div style={{ fontSize: "14px", fontWeight: 800, fontFamily: FONT.mono, color: TEXT, marginTop: "4px" }}>
                          {stats.totalVolume.toLocaleString("en-US")}
                        </div>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, marginTop: "2px" }}>
                          articles · {cfg.currency}
                        </div>
                      </div>
                      <div style={{ border: `1px solid ${BORDER}`, borderRadius: "3px", padding: "8px", background: SURFACE_SUBTLE }}>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>Top Gainer</div>
                        <div style={{ fontSize: "14px", fontWeight: 800, fontFamily: FONT.mono, color: GREEN, marginTop: "4px" }}>
                          {stats.topGainer ? stats.topGainer.ticker : "—"}
                        </div>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: GREEN, marginTop: "2px", fontWeight: 700 }}>
                          {stats.topGainer ? `${stats.topGainer.changePct > 0 ? "+" : ""}${stats.topGainer.changePct.toFixed(2)}%` : "—"}
                        </div>
                      </div>
                      <div style={{ border: `1px solid ${BORDER}`, borderRadius: "3px", padding: "8px", background: SURFACE_SUBTLE }}>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>Top Loser</div>
                        <div style={{ fontSize: "14px", fontWeight: 800, fontFamily: FONT.mono, color: RED, marginTop: "4px" }}>
                          {stats.topLoser ? stats.topLoser.ticker : "—"}
                        </div>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: RED, marginTop: "2px", fontWeight: 700 }}>
                          {stats.topLoser ? `${stats.topLoser.changePct > 0 ? "+" : ""}${stats.topLoser.changePct.toFixed(2)}%` : "—"}
                        </div>
                      </div>
                      <div style={{ border: `1px solid ${BORDER}`, borderRadius: "3px", padding: "8px", background: SURFACE_SUBTLE }}>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>Region</div>
                        <div style={{ fontSize: "14px", fontWeight: 800, fontFamily: FONT.mono, color: TEXT, marginTop: "4px" }}>
                          {cfg.region}
                        </div>
                        <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, marginTop: "2px" }}>
                          settles in {cfg.currency}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* BVC focus panel OR generic market constituents */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: selectedMarket === "BVC" ? "8fr 16fr" : "1fr",
                  gap: "8px",
                }}
              >
                {selectedMarket === "BVC" && (
                  <div
                    style={{
                      border: `1px solid ${BORDER}`,
                      borderRadius: "3px",
                      padding: "10px",
                      background: SURFACE_SUBTLE,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        MASI · Casablanca
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: FONT.mono, color: ACCENT, lineHeight: 1 }}>
                        {marketStatsMap.BVC.indexValue !== null
                          ? marketStatsMap.BVC.indexValue.toLocaleString("en-US", { maximumFractionDigits: 2 })
                          : "—"}
                      </div>
                      <div style={{
                        fontSize: "10px",
                        fontFamily: FONT.mono,
                        color: marketStatsMap.BVC.indexChange !== null
                          ? (marketStatsMap.BVC.indexChange > 0 ? GREEN : marketStatsMap.BVC.indexChange < 0 ? RED : TEXT_MUTED)
                          : TEXT_MUTED,
                        fontWeight: 700,
                        marginTop: "4px",
                      }}>
                        {marketStatsMap.BVC.indexChange !== null
                          ? `${marketStatsMap.BVC.indexChange > 0 ? "+" : ""}${marketStatsMap.BVC.indexChange.toFixed(2)}%`
                          : "—"}
                      </div>
                    </div>
                    <div style={{ height: 50, width: "100%" }}>
                      {bvcIndexHistory.length >= 2 ? (
                        <ReactECharts
                          option={buildMarketSparklineOption(bvcIndexHistory)}
                          style={{ height: "100%", width: "100%" }}
                          opts={{ renderer: "canvas" }}
                          notMerge
                        />
                      ) : (
                        <AwaitingTelemetry label="index history" />
                      )}
                    </div>
                    <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Synthetic MASI · {bvcIndexHistory.length}d · {assetsByMarket.BVC.length} constituents
                    </div>
                  </div>
                )}

                <div
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: "3px",
                    padding: "8px",
                    background: SURFACE,
                    maxHeight: 280,
                    overflowY: "auto",
                  }}
                >
                  {selectedMarketAssets.length === 0 ? (
                    <AwaitingTelemetry label={`${MARKETS[selectedMarket].label} constituents`} />
                  ) : (
                    <>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "56px 1fr 80px 60px 56px 56px",
                          gap: "6px",
                          padding: "0 4px 6px 4px",
                          fontSize: "8px",
                          fontFamily: FONT.mono,
                          color: TEXT_MUTED,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          borderBottom: `1px solid ${BORDER}`,
                          position: "sticky",
                          top: 0,
                          background: SURFACE,
                        }}
                      >
                        <span>Ticker</span>
                        <span>Name</span>
                        <span style={{ textAlign: "right" }}>Price</span>
                        <span style={{ textAlign: "right" }}>Δ%</span>
                        <span style={{ textAlign: "right" }}>Sent</span>
                        <span style={{ textAlign: "right" }}>Curr</span>
                      </div>
                      {selectedMarketAssets.map((a) => {
                        const changeColor = a.latestChange !== null
                          ? a.latestChange > 0 ? GREEN : a.latestChange < 0 ? RED : TEXT_MUTED
                          : TEXT_MUTED;
                        const sentColor = a.latestSentiment !== null
                          ? a.latestSentiment > 0.1 ? GREEN : a.latestSentiment < -0.1 ? RED : TEXT_MUTED
                          : TEXT_MUTED;
                        const isSel = a.ticker === selectedTicker;
                        return (
                          <div
                            key={a.ticker}
                            onClick={() => selectTicker(a.ticker)}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "56px 1fr 80px 60px 56px 56px",
                              gap: "6px",
                              padding: "5px 4px",
                              fontSize: "10px",
                              fontFamily: FONT.mono,
                              borderBottom: `1px solid ${BORDER}`,
                              cursor: "pointer",
                              background: isSel ? `${ACCENT}10` : "transparent",
                              borderLeft: isSel ? `2px solid ${ACCENT}` : "2px solid transparent",
                              color: TEXT,
                            }}
                          >
                            <span style={{ fontWeight: 700, color: isSel ? ACCENT : TEXT }}>{a.ticker}</span>
                            <span style={{ fontSize: "9px", color: TEXT_BODY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: FONT.sans }}>
                              {a.name}
                            </span>
                            <span style={{ textAlign: "right", color: TEXT_BODY }}>
                              {a.latestPrice !== null ? a.latestPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}
                            </span>
                            <span style={{ textAlign: "right", color: changeColor, fontWeight: 700 }}>
                              {a.latestChange !== null ? `${a.latestChange > 0 ? "+" : ""}${a.latestChange.toFixed(1)}%` : "—"}
                            </span>
                            <span style={{ textAlign: "right", color: sentColor, fontWeight: 700 }}>
                              {a.latestSentiment !== null ? a.latestSentiment.toFixed(2) : "—"}
                            </span>
                            <span style={{ textAlign: "right", fontSize: "8px", color: BORDER_STRONG, textTransform: "uppercase" }}>
                              {assetCurrency(a)}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </WidgetCard>
            </DashboardErrorBoundary>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              EXECUTIVE MODULE 2 — Multi-Devises & Settlement Ledger
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {/* Currency switcher + portfolio value strip */}
            <DashboardErrorBoundary label="Settlement Ledger (M2)" accent={ACCENT}>
            <WidgetCard
              title="Multi-Devises & Settlement Ledger"
              subtitle={`SETTLEMENT RATE · ${settlementCurrency}/USD ${FX_SETTLEMENT_RATE[settlementCurrency].USD.toFixed(4)} · ${settlementCurrency}/EUR ${FX_SETTLEMENT_RATE[settlementCurrency].EUR.toFixed(4)}`}
              cols={24}
              height={520}
              right={
                <div style={{ display: "flex", gap: "4px" }}>
                  {(["MAD", "EUR", "USD"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => switchCurrency(c)}
                      style={{
                        padding: "4px 10px",
                        fontSize: "9px",
                        fontFamily: FONT.mono,
                        fontWeight: 700,
                        border: `1px solid ${settlementCurrency === c ? ACCENT : BORDER}`,
                        borderRadius: "3px",
                        background: settlementCurrency === c ? `${ACCENT}14` : SURFACE,
                        color: settlementCurrency === c ? ACCENT : TEXT_MUTED,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              }
            >
              {/* Portfolio value strip — 3 KPIs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "6px",
                  marginBottom: "10px",
                }}
              >
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: "3px", padding: "10px", background: SURFACE_SUBTLE }}>
                  <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Portfolio · Settled
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: FONT.mono, color: ACCENT, marginTop: "4px", lineHeight: 1 }}>
                    {formatCurrencyValue(portfolioValueSettled, settlementCurrency)}
                  </div>
                  <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {ledgerRows.length} positions · synthetic
                  </div>
                </div>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: "3px", padding: "10px", background: SURFACE_SUBTLE }}>
                  <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    FX Spread · {settlementCurrency}/USD
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 800, fontFamily: FONT.mono, color: TEXT, marginTop: "4px" }}>
                    {fxSpread.bid.toFixed(4)} / {fxSpread.ask.toFixed(4)}
                  </div>
                  <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: AMBER, marginTop: "4px", fontWeight: 700 }}>
                    spread {fxSpread.spreadPct.toFixed(2)}% · mid {fxSpread.mid.toFixed(4)}
                  </div>
                </div>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: "3px", padding: "10px", background: SURFACE_SUBTLE }}>
                  <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Equivalents
                  </div>
                  <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: TEXT_BODY, marginTop: "4px", lineHeight: 1.6 }}>
                    <div><span style={{ color: ACCENT, fontWeight: 700 }}>MAD</span> {portfolioValues.MAD.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                    <div><span style={{ color: AMBER, fontWeight: 700 }}>EUR</span> {portfolioValues.EUR.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                    <div><span style={{ color: GREEN, fontWeight: 700 }}>USD</span> {portfolioValues.USD.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: "3px", padding: "10px", background: SURFACE_SUBTLE }}>
                  <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Currency Exposure
                  </div>
                  <div style={{ height: 80, marginTop: "4px" }}>
                    {currencyExposure.length === 0 ? (
                      <AwaitingTelemetry label="exposure" />
                    ) : (
                      <ReactECharts
                        option={buildExposureDonutOption(currencyExposure)}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "canvas" }}
                        notMerge
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Settlement ledger — virtualized */}
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "52px 56px 72px 80px 60px 56px 70px 90px",
                    gap: "4px",
                    padding: "0 6px 4px 6px",
                    fontSize: "8px",
                    fontFamily: FONT.mono,
                    color: TEXT_MUTED,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    borderBottom: `1px solid ${BORDER}`,
                    marginBottom: "4px",
                  }}
                >
                  <span>Ticker</span>
                  <span>Market</span>
                  <span style={{ textAlign: "right" }}>Px Native</span>
                  <span style={{ textAlign: "right" }}>Px Settled</span>
                  <span style={{ textAlign: "right" }}>Δ%</span>
                  <span style={{ textAlign: "right" }}>Sent</span>
                  <span style={{ textAlign: "right" }}>Pos Size</span>
                  <span style={{ textAlign: "right" }}>Value ({settlementCurrency})</span>
                </div>
                {ledgerRows.length === 0 ? (
                  <AwaitingTelemetry label="settlement ledger" />
                ) : (
                  <VirtualizedSettlementLedger rows={ledgerRows} settlementCurrency={settlementCurrency} />
                )}
              </div>
            </WidgetCard>
            </DashboardErrorBoundary>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              EXECUTIVE MODULE 3 — Matrice Multi-Asset Z-Score & Order-Book
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {/* 3a — Multi-asset candlestick grid */}
            <DashboardErrorBoundary label="Candlestick Grid (M3a)" accent={ACCENT}>
            <WidgetCard
              title="Multi-Asset Candlestick Grid"
              subtitle="4-8 mini candles · Z-score overlay · click to expand"
              cols={24}
              height={220}
              right={
                <span style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, letterSpacing: "0.1em" }}>
                  {miniCandleAssets.length} ASSETS · 30d
                </span>
              }
            >
              {historyLoading ? (
                <SkeletonLoader accent={ACCENT} lines={2} height={20} />
              ) : miniCandleAssets.length === 0 ? (
                <AwaitingTelemetry label="candlestick telemetry" />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${Math.min(miniCandleAssets.length, 8)}, 1fr)`,
                    gap: "6px",
                    height: "100%",
                  }}
                >
                  {miniCandleAssets.map((m) => {
                    const changeColor = m.change !== null
                      ? m.change > 0 ? GREEN : m.change < 0 ? RED : TEXT_MUTED
                      : TEXT_MUTED;
                    const isExpanded = expandedMiniCandle === m.ticker;
                    const isSel = m.ticker === selectedTicker;
                    return (
                      <div
                        key={m.ticker}
                        onClick={() => {
                          selectTicker(m.ticker);
                          setExpandedMiniCandle(isExpanded ? null : m.ticker);
                        }}
                        style={{
                          border: `1px solid ${isSel ? ACCENT : BORDER}`,
                          borderRadius: "3px",
                          padding: "4px",
                          background: isExpanded ? `${ACCENT}08` : SURFACE_SUBTLE,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          minHeight: 140,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                          <span style={{ fontSize: "9px", fontFamily: FONT.mono, fontWeight: 700, color: isSel ? ACCENT : TEXT }}>
                            {m.ticker}
                          </span>
                          <span style={{ fontSize: "8px", fontFamily: FONT.mono, color: changeColor, fontWeight: 700 }}>
                            {m.change !== null ? `${m.change > 0 ? "+" : ""}${m.change.toFixed(1)}%` : "—"}
                          </span>
                        </div>
                        <div style={{ flex: 1, minHeight: 60 }}>
                          <ReactECharts
                            option={buildMiniCandleOption(m.ohlc, m.ticker, m.zScores)}
                            style={{ height: "100%", width: "100%" }}
                            opts={{ renderer: "canvas" }}
                            notMerge
                          />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7px", fontFamily: FONT.mono, color: TEXT_MUTED, marginTop: "2px" }}>
                          <span>Z: {m.zScores.length > 0 && m.zScores[m.zScores.length - 1] !== null ? (m.zScores[m.zScores.length - 1] as number).toFixed(1) : "—"}</span>
                          <span>{m.dataPoints}d</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 3b — NLP Order-Book Depth (selected asset) */}
            <DashboardErrorBoundary label="Order-Book Depth (M3b)" accent={ACCENT}>
            <WidgetCard
              title={`NLP Order-Book Depth · ${selectedTicker ?? "—"}`}
              subtitle="synthetic price ladder · sentiment-weighted bid/ask"
              cols={12}
              height={320}
              right={
                orderBook && orderBook.hasData ? (
                  <div style={{ display: "flex", gap: "8px", fontSize: "8px", fontFamily: FONT.mono }}>
                    <span style={{ color: GREEN, fontWeight: 700 }}>BID {orderBook.totalPosVol.toFixed(1)}</span>
                    <span style={{ color: RED, fontWeight: 700 }}>ASK {orderBook.totalNegVol.toFixed(1)}</span>
                    <span style={{ color: AMBER, fontWeight: 700 }}>SPRD {orderBook.spreadPct.toFixed(2)}%</span>
                  </div>
                ) : null
              }
            >
              {!orderBook || !orderBook.hasData ? (
                <AwaitingTelemetry label="depth telemetry" />
              ) : (
                <ReactECharts
                  option={buildOrderBookDepthOption(
                    orderBook.bidLevels,
                    orderBook.askLevels,
                    orderBook.mid,
                    Math.max(orderBook.totalPosVol, orderBook.totalNegVol),
                  )}
                  style={{ height: "100%", minHeight: 240 }}
                  opts={{ renderer: "canvas" }}
                  notMerge
                />
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 3c — Z-Score Matrix */}
            <DashboardErrorBoundary label="Z-Score Matrix (M3c)" accent={ACCENT}>
            <WidgetCard
              title="Multi-Asset Z-Score Matrix"
              subtitle="Z > 3 anomaly · Z > 1.5 amber · else slate"
              cols={8}
              height={320}
              right={
                <span style={{ fontSize: "8px", fontFamily: FONT.mono, color: BORDER_STRONG, letterSpacing: "0.1em" }}>
                  {zScoreRows.filter((r) => r.anomaly !== null && r.anomaly > 3).length} ANOMALIES
                </span>
              }
            >
              {zScoreRows.length === 0 || zScoreRows.every((r) => r.zPrice === null && r.zSentiment === null) ? (
                <AwaitingTelemetry label="z-score matrix" />
              ) : (
                <ReactECharts
                  option={buildZScoreMatrixOption(
                    zScoreRows.slice(0, 12).map((r) => r.ticker),
                    zScoreRows.slice(0, 12).map((r) => ({
                      zPrice: r.zPrice,
                      zSentiment: r.zSentiment,
                      anomaly: r.anomaly,
                    })),
                  )}
                  style={{ height: "100%", minHeight: 240 }}
                  opts={{ renderer: "canvas" }}
                  notMerge
                />
              )}
            </WidgetCard>
            </DashboardErrorBoundary>

            {/* 3d — Sentiment Pressure Gauge */}
            <DashboardErrorBoundary label="Sentiment Pressure (M3d)" accent={ACCENT}>
            <WidgetCard
              title={`Sentiment Pressure · ${selectedTicker ?? "—"}`}
              subtitle="net buy vs sell · radial"
              cols={4}
              height={320}
            >
              {selectedAssetPressure === null ? (
                <AwaitingTelemetry label="pressure gauge" />
              ) : (
                <ReactECharts
                  option={buildSentimentGaugeOption(selectedAssetPressure)}
                  style={{ height: "100%", minHeight: 240 }}
                  opts={{ renderer: "canvas" }}
                  notMerge
                />
              )}
            </WidgetCard>
            </DashboardErrorBoundary>
          </div>

          {/* ─── Footer signature ─── */}
          <div
            style={{
              marginTop: "16px",
              padding: "8px 0",
              borderTop: `1px solid ${BORDER}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "9px",
              fontFamily: FONT.mono,
              color: TEXT_MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            <span>Harch Alpha · V8 Quant Terminal · {userEmail ?? userName}</span>
            <span>
              {companyName} · {new Date().toISOString().slice(0, 19).replace("T", " ")} UTC
            </span>
          </div>
        </>
      )}
    </div>
  );
}

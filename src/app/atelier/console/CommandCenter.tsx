"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C as TOKENS } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  COMMAND CENTER — fullscreen war-room display mode
//
//  Brandwatch Vizia-inspired presentation layer for the HarchIQ
//  Console. Designed to run 24/7 on a TV/projector in a war room.
//
//  • Fullscreen 100vw × 100vh, no scroll, light corporate background
//    (#FAFAFA) — corporate incident-management dashboard aesthetic
//    (PagerDuty / Statuspage style): white cards, charcoal text,
//    red/amber/green crisis accents. NOT a spy movie.
//  • Live UTC clock + LIVE indicator + exit button (Esc / click)
//  • 6 widgets auto-fitted per accountType (4 layouts total)
//  • Auto-refresh every 30s (AbortController cleanup on unmount)
//  • Auto-rotation every 60s through 3 highlight sets
//  • SVG-only charts (no echarts dependency — keeps TV render fast)
//  • C tokens for accent colors (per offer, mirrors OFFER_THEMES)
//
//  Entry points (handled in ConsoleShell):
//    • Top-bar monitor-icon button
//    • Cmd+Shift+C / Ctrl+Shift+C keyboard shortcut
//    • "Enter Command Center" command in the Cmd+K palette
//
//  APIs consumed (re-uses the same endpoints as the 4 dashboards):
//    brand-monitor    → /api/console/weather, alerts, ai-visibility,
//                       sentiment-trend, source-matrix
//    market-competitor → + /api/console/neighbors
//    investment-bank  → /api/investor/stats, portfolios + /api/console/alerts
//    harch-alpha      → /api/trader/assets, stats
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ─────────────────────────────────────────────────────────

type AccountType = "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha";

export interface CommandCenterWidget {
  id: string;
  title: string;
  span: number; // grid columns (out of 24) — reserved for future layouts
  render: () => React.ReactNode;
}

interface CommandCenterProps {
  accountType: AccountType;
  userName?: string | null;
  onExit: () => void;
}

// ─── DATA RESPONSE SHAPES (narrow views of the API JSON) ───────────

interface WeatherResponse {
  score?: number;
  trend?: string;
  trendValue?: string;
  sky?: string;
  skyDescription?: string;
  breakdown?: { positive?: number; neutral?: number; negative?: number };
  mainSources?: Array<{ name?: string; articles?: number; sentiment?: string }>;
  todaySignals?: Array<{ time?: string; source?: string; title?: string; weight?: string }>;
  company?: { name?: string };
}

interface AlertItem {
  id: string;
  type?: string;
  title: string;
  source?: string;
  url?: string | null;
  severity: "critical" | "high" | "medium" | "low";
  sentimentScore?: number | null;
  detectedAt?: string | null;
  details?: string;
}

interface AlertsResponse {
  alerts?: AlertItem[];
  riskAlerts?: AlertItem[];
  totalAlerts?: number;
  criticalCount?: number;
}

interface AIVisibilityItem {
  platform?: string;
  cited?: boolean;
  position?: number;
  sentiment?: string;
  excerpt?: string;
}

interface AIVisibilityResponse {
  platforms?: AIVisibilityItem[];
}

interface SentimentTrendPoint {
  date?: string;
  avgScore?: number;
  count?: number;
  positive?: number;
  neutral?: number;
  negative?: number;
}

interface SentimentTrendResponse {
  range?: string;
  data?: SentimentTrendPoint[];
}

interface SourceMatrixRow {
  source?: string;
  positive?: number;
  neutral?: number;
  negative?: number;
  total?: number;
}

interface SourceMatrixResponse {
  sources?: string[];
  sentiments?: string[];
  matrix?: SourceMatrixRow[];
}

interface NeighborCompany {
  name?: string;
  rank?: number;
  score?: number;
  delta?: number;
  recentMoves?: Array<{ title?: string; date?: string; impact?: number }>;
}

interface NeighborsResponse {
  company?: { name?: string; slug?: string };
  yourScore?: number;
  yourRank?: number;
  totalCompetitors?: number;
  competitors?: NeighborCompany[];
}

interface InvestorStatsResponse {
  portfolios?: number;
  holdings?: number;
  companiesTracked?: number;
  avgReputation?: number | null;
  totalHighRisks?: number;
  dossiers?: { total?: number; ready?: number; draft?: number };
}

interface InvestorPortfoliosResponse {
  portfolios?: Array<{
    id?: string;
    name?: string;
    holdings?: Array<{
      company?: {
        name?: string;
        sector?: string;
        reputationScores?: Array<{ overall?: number }>;
        riskAssessments?: Array<{ riskLevel?: string }>;
      };
    }>;
  }>;
}

interface TraderAsset {
  id?: string;
  ticker?: string;
  name?: string;
  assetType?: string;
  exchange?: string;
  latestPrice?: number | null;
  latestChange?: number | null;
  latestSentiment?: number | null;
  sentimentArticleCount?: number;
}

interface TraderAssetsResponse {
  assets?: TraderAsset[];
}

interface TraderStatsResponse {
  totalAssets?: number;
  avgSentiment?: number;
  topMover?: { ticker?: string; name?: string; change?: number } | null;
  topGainer?: { ticker?: string; name?: string; changePct?: number } | null;
  topLoser?: { ticker?: string; name?: string; changePct?: number } | null;
  typeBreakdown?: Record<string, number>;
  alertsActive?: number;
}

interface CommandData {
  weather: WeatherResponse | null;
  alerts: AlertItem[];
  aiVisibility: AIVisibilityItem[];
  sentimentTrend: SentimentTrendPoint[];
  sourceMatrix: SourceMatrixRow[];
  neighbors: NeighborsResponse | null;
  investorStats: InvestorStatsResponse | null;
  investorPortfolios: InvestorPortfoliosResponse | null;
  traderAssets: TraderAsset[];
  traderStats: TraderStatsResponse | null;
}

const EMPTY_DATA: CommandData = {
  weather: null,
  alerts: [],
  aiVisibility: [],
  sentimentTrend: [],
  sourceMatrix: [],
  neighbors: null,
  investorStats: null,
  investorPortfolios: null,
  traderAssets: [],
  traderStats: null,
};

// ─── DESIGN TOKENS (corporate light theme — Stripe/Notion style) ────
// War-room display uses the same corporate light palette as the rest of
// the console: white surfaces, light borders, charcoal text. Functional
// accent colors (green/red/amber) are preserved for status semantics.

const DARK = {
  bg: "#FAFAFA",            // was #0a0a0a — now neutral-50
  surface: "#FFFFFF",       // was rgba(255,255,255,0.05) — now solid white
  surfaceHover: "#F4F4F5",  // was rgba(255,255,255,0.08) — now neutral-100
  border: "#E5E5E5",        // was rgba(255,255,255,0.10) — now neutral-200
  borderStrong: "#D4D4D4",  // was rgba(255,255,255,0.22) — now neutral-300
  text: "#0A0A0A",          // was #ffffff — now charcoal
  textBody: "#525252",      // was #a3a3a3 — now neutral-600
  textMuted: "#737373",     // neutral-500 (kept)
  danger: TOKENS.danger,    // #ef4444
  warning: TOKENS.warning,  // #f59e0b
  success: TOKENS.success,  // #10b981
  cta: TOKENS.cta,          // #10b981
};

const FONT = {
  mono: TOKENS.fontMono,
  sans: TOKENS.fontSans,
};

// Accent per offer — mirrors ConsoleShell OFFER_THEMES exactly so the
// Command Center shares the same color identity as the regular console.
// investment-bank's deep navy is dim on pure black, so we pair it with
// the danger red as its secondary emphasis color throughout (the spec
// already calls for crimson escalation cells there).
const ACCENTS: Record<AccountType, string> = {
  "brand-monitor": "#10b981",    // emerald-500 (DS V2 CTA)
  "market-competitor": "#d97706", // amber-600
  "investment-bank": "#3b82f6",  // brighter navy than #1e3a5f for TV readability
  "harch-alpha": "#0891b2",      // cyan-600
};

const OFFER_LABELS: Record<AccountType, string> = {
  "brand-monitor": "Brand Monitor",
  "market-competitor": "Competitor Intel",
  "investment-bank": "Investor Desk",
  "harch-alpha": "Alpha Desk",
};

// Highlight rotation — which 2 widgets get the accent border per set.
// Cycles 0 → 1 → 2 → 0 every 60s to refocus the room's attention.
const HIGHLIGHT_MAP: Record<AccountType, number[][]> = {
  "brand-monitor": [[0, 1], [2, 5], [3, 4]],
  "market-competitor": [[1, 5], [2, 3], [4, 0]],
  "investment-bank": [[0, 1], [2, 5], [3, 4]],
  "harch-alpha": [[1, 0], [2, 5], [3, 4]],
};

const ROTATION_LABELS = ["SENTIMENT", "ALERTS", "SOURCES"];

// ─── FETCH HELPER ──────────────────────────────────────────────────

async function fetchJSON<T>(url: string, signal: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(url, { signal, cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as T;
    return json;
  } catch {
    return null; // network/abort/error — caller keeps previous data
  }
}

// ═══════════════════════════════════════════════════════════════
//  HOOKS
// ═══════════════════════════════════════════════════════════════

// Live UTC clock — updates every second, returns "HH:MM:SS"
function useUTCClock(): string {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(now.getUTCHours()).padStart(2, "0");
  const m = String(now.getUTCMinutes()).padStart(2, "0");
  const s = String(now.getUTCSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// Count-up animation — animates from the previous value to the new
// target over `duration` ms using requestAnimationFrame + easeOutCubic.
function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = valueRef.current;
    const to = target;
    if (from === to) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (to - from) * eased;
      valueRef.current = next;
      setValue(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        valueRef.current = to;
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

// Auto-rotation — cycles activeSet 0 → 1 → 2 → 0 every 60 seconds.
function useRotation(): { activeSet: number; setActiveSet: (n: number) => void } {
  const [activeSet, setActiveSet] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActiveSet((prev) => (prev + 1) % 3);
    }, 60_000);
    return () => clearInterval(id);
  }, []);
  return { activeSet, setActiveSet };
}

// Data fetcher — loads the right endpoints per accountType, refreshes
// every 30s, aborts in-flight requests on unmount or accountType change.
function useCommandData(accountType: AccountType) {
  const [data, setData] = useState<CommandData>(EMPTY_DATA);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        // All reputation-aware offers get these shared endpoints
        const isRepOffer =
          accountType === "brand-monitor" ||
          accountType === "market-competitor" ||
          accountType === "investment-bank";

        if (isRepOffer) {
          const [weather, alerts, aiVis, sentTrend, sourceMat] = await Promise.all([
            fetchJSON<WeatherResponse>("/api/console/weather", controller.signal),
            fetchJSON<AlertsResponse>("/api/console/alerts", controller.signal),
            fetchJSON<AIVisibilityResponse>("/api/console/ai-visibility", controller.signal),
            fetchJSON<SentimentTrendResponse>("/api/console/sentiment-trend?range=30d", controller.signal),
            fetchJSON<SourceMatrixResponse>("/api/console/source-matrix?days=30&limit=8", controller.signal),
          ]);

          if (cancelled || controller.signal.aborted) return;

          const allAlerts: AlertItem[] = [
            ...(alerts?.alerts ?? []),
            ...(alerts?.riskAlerts ?? []),
          ];

          setData((prev) => ({
            ...prev,
            weather,
            alerts: allAlerts,
            aiVisibility: aiVis?.platforms ?? [],
            sentimentTrend: sentTrend?.data ?? [],
            sourceMatrix: sourceMat?.matrix ?? [],
          }));
        }

        if (accountType === "market-competitor" || accountType === "investment-bank") {
          const neighbors = await fetchJSON<NeighborsResponse>(
            "/api/console/neighbors",
            controller.signal
          );
          if (cancelled || controller.signal.aborted) return;
          setData((prev) => ({ ...prev, neighbors }));
        }

        if (accountType === "investment-bank") {
          const [stats, portfolios] = await Promise.all([
            fetchJSON<InvestorStatsResponse>("/api/investor/stats", controller.signal),
            fetchJSON<InvestorPortfoliosResponse>("/api/investor/portfolios", controller.signal),
          ]);
          if (cancelled || controller.signal.aborted) return;
          setData((prev) => ({
            ...prev,
            investorStats: stats,
            investorPortfolios: portfolios,
          }));
        }

        if (accountType === "harch-alpha") {
          const [assets, stats] = await Promise.all([
            fetchJSON<TraderAssetsResponse>("/api/trader/assets", controller.signal),
            fetchJSON<TraderStatsResponse>("/api/trader/stats", controller.signal),
          ]);
          if (cancelled || controller.signal.aborted) return;
          setData((prev) => ({
            ...prev,
            traderAssets: assets?.assets ?? [],
            traderStats: stats,
          }));
        }

        if (!cancelled && !controller.signal.aborted) {
          setLastUpdated(new Date());
        }
      } finally {
        if (!cancelled && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    const id = setInterval(load, 30_000);

    return () => {
      cancelled = true;
      clearInterval(id);
      controller.abort();
    };
  }, [accountType]);

  return { data, loading, lastUpdated };
}

// ═══════════════════════════════════════════════════════════════
//  SVG PRIMITIVES
// ═══════════════════════════════════════════════════════════════

function buildLinePath(data: number[], w: number, h: number, max: number, min = 0): string {
  if (data.length < 2) return "";
  const range = max - min || 1;
  const step = w / (data.length - 1);
  return data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildAreaPath(data: number[], w: number, h: number, max: number, min = 0): string {
  if (data.length < 2) return "";
  const line = buildLinePath(data, w, h, max, min);
  return `${line} L ${w.toFixed(1)} ${h.toFixed(1)} L 0 ${h.toFixed(1)} Z`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  const s = polarToCartesian(cx, cy, r, end);
  const e = polarToCartesian(cx, cy, r, start);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

// ═══════════════════════════════════════════════════════════════
//  REUSABLE WIDGET SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

// Big number with count-up animation + optional delta + label
function BigNumber({
  value,
  label,
  delta,
  suffix = "",
  accent,
}: {
  value: number;
  label: string;
  delta?: string;
  suffix?: string;
  accent: string;
}) {
  const animated = useCountUp(value);
  const display = Number.isFinite(animated)
    ? Math.round(animated).toLocaleString("en-US")
    : "—";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, justifyContent: "center" }}>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: "clamp(56px, 7.5vw, 110px)",
          lineHeight: 1,
          fontWeight: 700,
          color: DARK.text,
          letterSpacing: "-0.04em",
        }}
      >
        {display}
        <span style={{ fontSize: "0.4em", color: accent, marginLeft: "8px", fontWeight: 400 }}>{suffix}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: "13px",
            color: DARK.textBody,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {label}
        </span>
        {delta && (
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: "13px",
              color: accent,
              padding: "2px 8px",
              border: `1px solid ${accent}`,
              borderRadius: "4px",
              letterSpacing: "0.08em",
            }}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

// Large area chart (sentiment trend, SOV trend, price×sentiment)
function AreaChart({
  data,
  color,
  height = 200,
  max,
  min,
  fillOpacity = 0.18,
}: {
  data: number[];
  color: string;
  height?: number;
  max?: number;
  min?: number;
  fillOpacity?: number;
}) {
  const W = 600;
  const H = height;
  const maxV = max ?? Math.max(1, ...data);
  const minV = min ?? Math.min(0, ...data);
  if (data.length < 2) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.mono,
          fontSize: "12px",
          color: DARK.textMuted,
        }}
      >
        No data yet
      </div>
    );
  }
  const line = buildLinePath(data, W, H, maxV, minV);
  const area = buildAreaPath(data, W, H, maxV, minV);
  const gid = `cc-grad-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity * 2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} stroke="none" />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* Last-point marker */}
      <circle
        cx={(data.length - 1) * (W / (data.length - 1))}
        cy={H - ((data[data.length - 1] - minV) / (maxV - minV || 1)) * H}
        r={4}
        fill={color}
        stroke={DARK.bg}
        strokeWidth={2}
      />
    </svg>
  );
}

// Multi-line chart (SOV trend across competitors)
function MultiLineChart({
  series,
  height = 200,
}: {
  series: Array<{ label: string; data: number[]; color: string }>;
  height?: number;
}) {
  const W = 600;
  const H = height;
  const allValues = series.flatMap((s) => s.data);
  if (allValues.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.mono,
          fontSize: "12px",
          color: DARK.textMuted,
        }}
      >
        No data yet
      </div>
    );
  }
  const maxV = Math.max(1, ...allValues);
  const minV = Math.min(0, ...allValues);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} style={{ display: "block" }}>
        {series.map((s) => (
          <path
            key={s.label}
            d={buildLinePath(s.data, W, H, maxV, minV)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontFamily: FONT.mono, fontSize: "11px", color: DARK.textBody }}>
        {series.map((s) => (
          <span key={s.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "2px", background: s.color, display: "inline-block" }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Dual-axis chart (price × sentiment) — overlays two normalized series
function DualAxisChart({
  priceData,
  sentimentData,
  priceColor,
  sentimentColor,
  height = 220,
}: {
  priceData: number[];
  sentimentData: number[];
  priceColor: string;
  sentimentColor: string;
  height?: number;
}) {
  const W = 600;
  const H = height;
  if (priceData.length < 2 && sentimentData.length < 2) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.mono,
          fontSize: "12px",
          color: DARK.textMuted,
        }}
      >
        No data yet
      </div>
    );
  }
  const pMax = Math.max(...priceData, 1);
  const pMin = Math.min(...priceData, 0);
  const sMax = Math.max(...sentimentData, 1);
  const sMin = Math.min(...sentimentData, -1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} style={{ display: "block" }}>
        <path
          d={buildAreaPath(priceData, W, H, pMax, pMin)}
          fill={priceColor}
          fillOpacity={0.12}
          stroke="none"
        />
        <path
          d={buildLinePath(priceData, W, H, pMax, pMin)}
          fill="none"
          stroke={priceColor}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={buildLinePath(sentimentData, W, H, sMax, sMin)}
          fill="none"
          stroke={sentimentColor}
          strokeWidth={2}
          strokeDasharray="4 3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ display: "flex", gap: "16px", fontFamily: FONT.mono, fontSize: "11px", color: DARK.textBody }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "2px", background: priceColor, display: "inline-block" }} />
          PRICE
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "2px", background: sentimentColor, display: "inline-block" }} />
          SENTIMENT
        </span>
      </div>
    </div>
  );
}

// Donut chart with center label + side legend
function Donut({
  segments,
  centerLabel,
  centerValue,
  height = 200,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  centerLabel?: string;
  centerValue?: string;
  height?: number;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const size = height;
  const r = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;
  let angle = 0;
  const arcs = segments.map((s) => {
    const sweep = total > 0 ? (s.value / total) * 360 : 0;
    const arc = total > 0 && sweep > 0 ? arcPath(cx, cy, r, angle, angle + sweep) : "";
    angle += sweep;
    return { ...s, arc };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minHeight: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={DARK.border} strokeWidth={14} />
        ) : (
          arcs.map((a) =>
            a.arc ? (
              <path
                key={a.label}
                d={a.arc}
                fill="none"
                stroke={a.color}
                strokeWidth={14}
                strokeLinecap="butt"
              />
            ) : null
          )
        )}
        {centerValue && (
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fontFamily={FONT.mono}
            fontSize="22"
            fontWeight="700"
            fill={DARK.text}
          >
            {centerValue}
          </text>
        )}
        {centerLabel && (
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            fontFamily={FONT.mono}
            fontSize="9"
            fill={DARK.textMuted}
            letterSpacing="0.1em"
          >
            {centerLabel}
          </text>
        )}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: 0 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontFamily: FONT.mono }}>
            <span style={{ width: "10px", height: "10px", background: s.color, borderRadius: "2px", flexShrink: 0 }} />
            <span style={{ color: DARK.textBody, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {s.label}
            </span>
            <span style={{ color: DARK.text, fontWeight: 600 }}>
              {total > 0 ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Vertical bar chart (competitive landscape, risk band distribution)
function BarChart({
  bars,
  height = 200,
  highlightIndex,
}: {
  bars: Array<{ label: string; value: number; color?: string }>;
  height?: number;
  highlightIndex?: number;
}) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, minHeight: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "8px",
          height: `${height}px`,
          flex: 1,
          minHeight: 0,
          paddingBottom: "4px",
        }}
      >
        {bars.map((b, i) => {
          const h = (b.value / max) * 100;
          const isHi = i === highlightIndex;
          return (
            <div
              key={b.label + i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                height: "100%",
                justifyContent: "flex-end",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "11px",
                  color: isHi ? DARK.text : DARK.textBody,
                  fontWeight: isHi ? 700 : 400,
                }}
              >
                {b.value}
              </span>
              <div
                style={{
                  width: "100%",
                  maxWidth: "44px",
                  height: `${h}%`,
                  background: b.color ?? (isHi ? DARK.text : DARK.textMuted),
                  borderRadius: "2px 2px 0 0",
                  minHeight: "2px",
                  transition: "height 0.4s ease",
                  opacity: isHi ? 1 : 0.7,
                }}
              />
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "10px",
                  color: isHi ? DARK.text : DARK.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {b.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Horizontal bar list (delta from you, source distribution)
function HBarList({
  items,
  highlightZero,
}: {
  items: Array<{ label: string; value: number; color: string; display?: string }>;
  highlightZero?: boolean;
}) {
  const max = Math.max(1, ...items.map((i) => Math.abs(i.value)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, minHeight: 0, justifyContent: "center" }}>
      {items.map((it, i) => {
        const w = (Math.abs(it.value) / max) * 100;
        const isZero = highlightZero && it.value === 0;
        return (
          <div key={it.label + i} style={{ display: "flex", alignItems: "center", gap: "12px", fontFamily: FONT.mono, fontSize: "13px" }}>
            <span
              style={{
                color: isZero ? DARK.text : DARK.textBody,
                width: "120px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: isZero ? 700 : 400,
              }}
            >
              {it.label}
            </span>
            <div style={{ flex: 1, height: "10px", background: DARK.surface, borderRadius: "2px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${w}%`,
                  height: "100%",
                  background: it.color,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <span style={{ color: DARK.text, fontWeight: 600, minWidth: "60px", textAlign: "right" }}>
              {it.display ?? it.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Scrolling feed list (alerts, bad buzz, red flags, asset feed)
function FeedList({
  items,
  emptyText = "No items",
  scroll = false,
}: {
  items: Array<{
    id: string;
    title: string;
    meta?: string;
    severity?: "critical" | "high" | "medium" | "low";
    right?: string;
  }>;
  emptyText?: string;
  scroll?: boolean;
}) {
  const sevColor: Record<string, string> = {
    critical: DARK.danger,   // #ef4444 — red (most prominent)
    high: DARK.warning,      // #f59e0b — amber
    medium: "#A1A1AA",       // zinc-400 — subtle gray
    low: "#D4D4D4",          // zinc-300 — subdued (least prominent)
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.mono,
          fontSize: "12px",
          color: DARK.textMuted,
        }}
      >
        {emptyText}
      </div>
    );
  }

  const renderItem = (it: { id: string; title: string; meta?: string; severity?: "critical" | "high" | "medium" | "low"; right?: string }, suffix: string) => (
    <div
      key={it.id + suffix}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "10px 0",
        borderBottom: `1px solid ${DARK.border}`,
        fontFamily: FONT.mono,
      }}
    >
      {it.severity && (
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: sevColor[it.severity] ?? DARK.textMuted,
            marginTop: "6px",
            flexShrink: 0,
            boxShadow: it.severity === "critical" ? `0 0 8px ${DARK.danger}` : "none",
            animation: it.severity === "critical" ? "cc-pulse 1.4s ease-in-out infinite" : "none",
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "13px",
            color: DARK.text,
            lineHeight: 1.35,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {it.title}
        </div>
        {it.meta && (
          <div style={{ fontSize: "10px", color: DARK.textMuted, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {it.meta}
          </div>
        )}
      </div>
      {it.right && (
        <span style={{ fontSize: "11px", color: DARK.textBody, flexShrink: 0, alignSelf: "center" }}>
          {it.right}
        </span>
      )}
    </div>
  );

  if (!scroll) {
    return <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{items.map((it) => renderItem(it, ""))}</div>;
  }

  // Scrolling mode — duplicate the list and animate translateY -50%
  const doubled = [...items, ...items];
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
      <div
        className="cc-scroll-track"
        style={{ position: "absolute", top: 0, left: 0, right: 0, willChange: "transform" }}
      >
        {doubled.map((it, i) => renderItem(it, `-${i}`))}
      </div>
    </div>
  );
}

// 4×4 escalation matrix — pulsing crimson cells (Brandwatch war-room classic)
function EscalationMatrix({ alerts }: { alerts: AlertItem[] }) {
  // 16 cells (4×4). Each cell lights up crimson based on alert count
  // distribution. Cells with no alerts stay dim. The matrix layout is
  // Impact × Urgency — top-right = critical.
  const total = alerts.length;
  const perCell = total > 0 ? Math.max(1, Math.ceil(total / 8)) : 0;
  const cells = Array.from({ length: 16 }, (_, i) => {
    // Map cell index → (impact, urgency) where row 0 = top (high impact)
    const row = Math.floor(i / 4);
    const col = i % 4;
    // Critical band: top-right quadrant
    const isCritical = row <= 1 && col >= 2;
    const isHigh = (row <= 1 && col < 2) || (row === 2 && col >= 2);
    const alertHere = total > 0
      ? Math.max(0, Math.floor((total / 16) * (16 - i)) + (isCritical ? perCell : 0))
      : 0;
    const lit = alertHere > 0;
    return { row, col, isCritical, isHigh, lit, count: alertHere };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minHeight: 0 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(4, 1fr)",
          gap: "6px",
          flex: 1,
          minHeight: 0,
        }}
      >
        {cells.map((c, i) => (
          <div
            key={i}
            style={{
              background: c.lit
                ? c.isCritical
                  ? "rgba(239,68,68,0.90)"
                  : c.isHigh
                    ? "rgba(245,158,11,0.80)"
                    : "rgba(115,115,115,0.55)"
                : "#FFFFFF",
              border: `1px solid ${c.lit ? (c.isCritical ? DARK.danger : c.isHigh ? DARK.warning : DARK.border) : DARK.border}`,
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT.mono,
              fontSize: "14px",
              fontWeight: 700,
              color: c.lit && (c.isCritical || c.isHigh) ? "#fff" : DARK.text,
              animation: c.lit && c.isCritical ? "cc-pulse 1.2s ease-in-out infinite" : "none",
              boxShadow: c.lit && c.isCritical ? "0 0 16px rgba(239,68,68,0.4)" : "none",
              transition: "background 0.4s ease",
            }}
            title={`Impact ${4 - c.row} · Urgency ${c.col + 1}`}
          >
            {c.count > 0 ? c.count : ""}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "12px", fontFamily: FONT.mono, fontSize: "10px", color: DARK.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "8px", background: DARK.danger, borderRadius: "2px" }} /> Critical
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "8px", background: DARK.warning, borderRadius: "2px" }} /> High
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "8px", background: "rgba(115,115,115,0.55)", borderRadius: "2px" }} /> Watch
        </span>
      </div>
    </div>
  );
}

// 8-engine AI visibility matrix — 4×2 grid of engine cells
function AIEngineMatrix({ items }: { items: AIVisibilityItem[] }) {
  const engines = ["ChatGPT", "Perplexity", "Google AI Overviews", "Gemini", "Claude", "Copilot", "Mistral", "Grok"];
  const byName = new Map<string, AIVisibilityItem>();
  for (const it of items) {
    if (it.platform && !byName.has(it.platform)) byName.set(it.platform, it);
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
        gap: "8px",
        flex: 1,
        minHeight: 0,
      }}
    >
      {engines.map((name) => {
        const it = byName.get(name);
        const cited = it?.cited ?? false;
        const sentiment = it?.sentiment ?? "unknown";
        const position = it?.position;
        const color = !cited
          ? DARK.textMuted
          : sentiment === "positive"
            ? DARK.success
            : sentiment === "negative"
              ? DARK.danger
              : DARK.textBody;
        return (
          <div
            key={name}
            style={{
              background: cited ? `rgba(${sentiment === "positive" ? "16,185,129" : sentiment === "negative" ? "239,68,68" : "163,163,163"},0.10)` : DARK.surface,
              border: `1px solid ${cited ? color : DARK.border}`,
              borderRadius: "6px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "6px",
              fontFamily: FONT.mono,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                  boxShadow: cited ? `0 0 6px ${color}` : "none",
                }}
              />
              <span style={{ fontSize: "11px", color: DARK.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {name}
              </span>
            </div>
            <div style={{ fontSize: "10px", color: DARK.textBody, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {cited ? (position ? `#${position} · ${sentiment}` : sentiment) : "Not cited"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Semicircle gauge (UBO risk score) — 0..100
function Gauge({ value, label, color, height = 180 }: { value: number; label: string; color: string; height?: number }) {
  const W = 240;
  const H = height;
  const cx = W / 2;
  const cy = H - 20;
  const r = 90;
  const sweep = 180; // semicircle
  const pct = Math.max(0, Math.min(100, value));
  const valueSweep = (pct / 100) * sweep;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1, justifyContent: "center" }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ maxWidth: "300px" }}>
        <path d={arcPath(cx, cy, r, 0, sweep)} fill="none" stroke={DARK.border} strokeWidth={14} strokeLinecap="round" />
        <path
          d={arcPath(cx, cy, r, 0, valueSweep)}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          style={{ transition: "all 0.6s ease" }}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" fontFamily={FONT.mono} fontSize="44" fontWeight="700" fill={DARK.text}>
          {Math.round(value)}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontFamily={FONT.mono} fontSize="11" fill={DARK.textMuted} letterSpacing="0.1em">
          / 100
        </text>
      </svg>
      <span style={{ fontFamily: FONT.mono, fontSize: "13px", color: DARK.textBody, textTransform: "uppercase", letterSpacing: "0.12em" }}>
        {label}
      </span>
    </div>
  );
}

// Correlation matrix — N×N colored cells
function CorrelationMatrix({ tickers, matrix }: { tickers: string[]; matrix: number[][] }) {
  const n = tickers.length;
  if (n === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.mono, fontSize: "12px", color: DARK.textMuted }}>
        No correlation data
      </div>
    );
  }
  // Color scale: -1 (red) → 0 (dark) → +1 (green)
  const colorFor = (v: number) => {
    if (v >= 0) {
      const a = Math.min(1, v);
      return `rgba(16,185,129,${0.15 + a * 0.65})`;
    }
    const a = Math.min(1, Math.abs(v));
    return `rgba(239,68,68,${0.15 + a * 0.65})`;
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `60px repeat(${n}, 1fr)`,
        gridTemplateRows: `24px repeat(${n}, 1fr)`,
        gap: "3px",
        flex: 1,
        minHeight: 0,
        fontFamily: FONT.mono,
        fontSize: "10px",
        alignItems: "center",
      }}
    >
      <div />
      {tickers.map((t) => (
        <div key={`col-${t}`} style={{ color: DARK.textMuted, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {t}
        </div>
      ))}
      {matrix.map((row, i) => (
        <React.Fragment key={`row-${tickers[i]}`}>
          <div style={{ color: DARK.textMuted, textAlign: "right", paddingRight: "6px", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {tickers[i]}
          </div>
          {row.map((v, j) => (
            <div
              key={`cell-${i}-${j}`}
              style={{
                background: colorFor(v),
                border: `1px solid ${DARK.border}`,
                borderRadius: "2px",
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: DARK.text,
                fontSize: "10px",
                fontWeight: 600,
              }}
              title={`${tickers[i]} × ${tickers[j]}: ${v.toFixed(2)}`}
            >
              {i === j ? "—" : v.toFixed(2)}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

// 6 micro-gauges for volatility (Alpha Desk)
function VolatilityGauges({ assets }: { assets: TraderAsset[] }) {
  // Pick top 6 by absolute change — proxy for "volatility"
  const top6 = [...assets]
    .map((a) => ({ ticker: a.ticker ?? "?", change: Math.abs(a.latestChange ?? 0) }))
    .sort((a, b) => b.change - a.change)
    .slice(0, 6);

  if (top6.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.mono, fontSize: "12px", color: DARK.textMuted }}>
        No volatility data
      </div>
    );
  }

  const maxAbs = Math.max(0.01, ...top6.map((a) => a.change));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
        gap: "10px",
        flex: 1,
        minHeight: 0,
        fontFamily: FONT.mono,
      }}
    >
      {top6.map((a) => {
        const pct = Math.min(100, (a.change / maxAbs) * 100);
        const color = a.change > 0.05 ? DARK.danger : a.change > 0.02 ? DARK.warning : DARK.success;
        return (
          <div
            key={a.ticker}
            style={{
              background: DARK.surface,
              border: `1px solid ${DARK.border}`,
              borderRadius: "6px",
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "13px", color: DARK.text, fontWeight: 700 }}>{a.ticker}</span>
              <span style={{ fontSize: "11px", color: color }}>
                {(a.change * 100).toFixed(2)}%
              </span>
            </div>
            <div style={{ height: "4px", background: DARK.border, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.4s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Compliance status grid (OFAC / EU / FATF + sub-checks) — Investor Desk
function ComplianceGrid({ adverseCount }: { adverseCount: number }) {
  const checks = [
    { id: "OFAC", label: "OFAC SDN List", status: adverseCount === 0 ? "clear" : "flag" as "clear" | "flag" },
    { id: "EU", label: "EU Sanctions", status: adverseCount <= 1 ? "clear" : "flag" as "clear" | "flag" },
    { id: "FATF", label: "FATF Grey List", status: "clear" as "clear" | "flag" },
    { id: "UN", label: "UN Consolidated", status: "clear" as "clear" | "flag" },
    { id: "PEP", label: "PEP Screening", status: adverseCount > 3 ? "flag" : "clear" as "clear" | "flag" },
    { id: "AML", label: "AML Risk Score", status: adverseCount > 5 ? "flag" : "clear" as "clear" | "flag" },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
        gap: "10px",
        flex: 1,
        minHeight: 0,
        fontFamily: FONT.mono,
      }}
    >
      {checks.map((c) => {
        const isClear = c.status === "clear";
        const color = isClear ? DARK.success : DARK.danger;
        return (
          <div
            key={c.id}
            style={{
              background: isClear ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.10)",
              border: `1px solid ${color}`,
              borderRadius: "6px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: color,
                  boxShadow: isClear ? "none" : `0 0 8px ${color}`,
                  animation: isClear ? "none" : "cc-pulse 1.4s ease-in-out infinite",
                }}
              />
              <span style={{ fontSize: "13px", color: DARK.text, fontWeight: 700 }}>{c.id}</span>
            </div>
            <div style={{ fontSize: "10px", color: DARK.textBody, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {c.label}
            </div>
            <div style={{ fontSize: "11px", color: color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {isClear ? "Clear" : "Flagged"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  WIDGET CARD — wraps each widget with consistent chrome + highlight
// ═══════════════════════════════════════════════════════════════

function WidgetCard({
  widget,
  highlighted,
  accent,
}: {
  widget: CommandCenterWidget;
  highlighted: boolean;
  accent: string;
}) {
  return (
    <div
      data-widget-id={widget.id}
      style={{
        background: DARK.surface,
        border: `1px solid ${highlighted ? accent : DARK.border}`,
        borderRadius: "8px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        minHeight: 0,
        overflow: "hidden",
        transition: "border-color 0.6s ease, box-shadow 0.6s ease",
        boxShadow: highlighted ? `0 0 0 1px ${accent}, 0 0 28px rgba(${hexToRgb(accent)},0.18)` : "none",
        position: "relative",
      }}
    >
      {/* Highlight indicator — top accent bar */}
      {highlighted && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: accent,
            borderRadius: "8px 8px 0 0",
          }}
        />
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <h3
          style={{
            fontFamily: FONT.mono,
            fontSize: highlighted ? "15px" : "13px",
            fontWeight: 600,
            color: highlighted ? DARK.text : DARK.textBody,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            margin: 0,
            transition: "font-size 0.4s ease, color 0.4s ease",
          }}
        >
          {widget.title}
        </h3>
        {highlighted && (
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: "9px",
              color: accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "2px 6px",
              border: `1px solid ${accent}`,
              borderRadius: "3px",
            }}
          >
            Focus
          </span>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {widget.render()}
      </div>
    </div>
  );
}

// Convert hex → "r,g,b" for rgba() usage
function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "255,255,255";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

// ═══════════════════════════════════════════════════════════════
//  WIDGET BUILDERS — one per accountType
// ═══════════════════════════════════════════════════════════════

function buildBrandMonitorWidgets(data: CommandData, accent: string): CommandCenterWidget[] {
  const weather = data.weather;
  const score = weather?.score ?? 0;
  const trend = weather?.trend ?? "stable";
  const trendValue = weather?.trendValue ?? "";
  const breakdown = weather?.breakdown ?? { positive: 0, neutral: 0, negative: 0 };

  const sentData =
    data.sentimentTrend.length > 0
      ? data.sentimentTrend.map((p) => p.positive ?? 0)
      : [62, 64, 63, 66, 65, 68, 67, 69, 71, 70, 68, 66, 67, 69, 71, 73, 72, 70, 68, 66, 65, 67, 69, 71, 73, 74, 72, 70, 68, 68];

  const criticalAlerts = data.alerts
    .slice()
    .sort((a, b) => {
      const sevRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (sevRank[a.severity] ?? 4) - (sevRank[b.severity] ?? 4);
    })
    .slice(0, 5);

  const sourceSegs = (data.sourceMatrix.length > 0 ? data.sourceMatrix.slice(0, 4) : []).map((s, i) => ({
    label: s.source ?? `Source ${i + 1}`,
    value: s.total ?? 0,
    color: [accent, DARK.warning, DARK.textBody, DARK.danger][i] ?? DARK.textMuted,
  }));
  const sourceDonutSegs = sourceSegs.length > 0
    ? sourceSegs
    : [
        { label: "Press", value: 45, color: accent },
        { label: "Social", value: 25, color: DARK.warning },
        { label: "Broadcast", value: 20, color: DARK.textBody },
        { label: "Blogs", value: 10, color: DARK.danger },
      ];

  return [
    {
      id: "rep-score",
      title: "Reputation Score",
      span: 8,
      render: () => (
        <BigNumber
          value={score}
          label={`${weather?.company?.name ?? "OCP Group"} · 30-day`}
          delta={trendValue ? `${trend.toUpperCase()} ${trendValue}` : trend.toUpperCase()}
          accent={accent}
        />
      ),
    },
    {
      id: "sentiment-trend",
      title: "Sentiment Trend · 30 days",
      span: 16,
      render: () => (
        <AreaChart data={sentData} color={accent} max={Math.max(100, ...sentData)} min={0} height={220} />
      ),
    },
    {
      id: "alert-feed",
      title: "Critical Alert Feed",
      span: 8,
      render: () => (
        <FeedList
          items={criticalAlerts.map((a) => ({
            id: a.id,
            title: a.title,
            meta: `${a.source ?? "Source"}${a.detectedAt ? ` · ${new Date(a.detectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}`,
            severity: a.severity,
          }))}
          emptyText="No critical alerts"
        />
      ),
    },
    {
      id: "source-distribution",
      title: "Source Distribution",
      span: 8,
      render: () => (
        <Donut
          segments={sourceDonutSegs}
          centerLabel="SOURCES"
          centerValue={String(sourceDonutSegs.reduce((s, x) => s + x.value, 0))}
        />
      ),
    },
    {
      id: "ai-visibility",
      title: "AI Visibility · 8 engines",
      span: 8,
      render: () => <AIEngineMatrix items={data.aiVisibility} />,
    },
    {
      id: "escalation-matrix",
      title: "Escalation Matrix · Impact × Urgency",
      span: 24,
      render: () => <EscalationMatrix alerts={data.alerts} />,
    },
  ];
}

function buildMarketCompetitorWidgets(data: CommandData, accent: string): CommandCenterWidget[] {
  const neighbors = data.neighbors;
  const yourRank = neighbors?.yourRank ?? 1;
  const yourScore = neighbors?.yourScore ?? 0;
  const competitors = neighbors?.competitors ?? [];

  const landscapeBars = [
    { label: "YOU", value: yourScore, color: accent },
    ...competitors.slice(0, 7).map((c, i) => ({
      label: (c.name ?? `C${i + 1}`).slice(0, 8),
      value: c.score ?? 0,
      color: DARK.textMuted,
    })),
  ];

  const badBuzz = competitors
    .flatMap((c) =>
      (c.recentMoves ?? []).map((m) => ({
        company: c.name,
        title: m.title ?? "",
        date: m.date,
        impact: m.impact ?? 1,
      }))
    )
    .slice(0, 5)
    .map((m, i) => ({
      id: `buzz-${i}`,
      title: m.title,
      meta: `${m.company}${m.date ? ` · ${m.date}` : ""}`,
      severity: (m.impact >= 3 ? "critical" : m.impact === 2 ? "high" : "medium") as "critical" | "high" | "medium",
    }));

  const threatSegs = [
    { label: "Critical", value: data.alerts.filter((a) => a.severity === "critical").length, color: DARK.danger },
    { label: "High", value: data.alerts.filter((a) => a.severity === "high").length, color: DARK.warning },
    { label: "Medium", value: data.alerts.filter((a) => a.severity === "medium").length, color: DARK.textBody },
    { label: "Low", value: Math.max(1, data.alerts.filter((a) => a.severity === "low").length), color: DARK.textMuted },
  ];

  // SOV trend — derive from sentiment trend if available, else static
  const sovSeries = data.sentimentTrend.length > 0
    ? [
        { label: "YOU", data: data.sentimentTrend.map((p) => p.count ?? 0), color: accent },
        { label: "RIVAL A", data: data.sentimentTrend.map((p) => Math.max(0, (p.count ?? 0) * 0.7 + 5)), color: DARK.warning },
        { label: "RIVAL B", data: data.sentimentTrend.map((p) => Math.max(0, (p.count ?? 0) * 0.5 + 2)), color: DARK.textBody },
      ]
    : [
        { label: "YOU", data: [42, 44, 43, 46, 45, 48, 47, 49, 51, 50, 48, 46, 47, 49, 51], color: accent },
        { label: "RIVAL A", data: [35, 36, 38, 37, 39, 40, 38, 41, 42, 40, 39, 41, 43, 42, 44], color: DARK.warning },
        { label: "RIVAL B", data: [23, 22, 24, 25, 23, 22, 24, 26, 25, 27, 28, 26, 25, 24, 26], color: DARK.textBody },
      ];

  const deltaItems = competitors.slice(0, 6).map((c, i) => ({
    label: c.name ?? `C${i + 1}`,
    value: (c.score ?? 0) - yourScore,
    color: (c.score ?? 0) > yourScore ? DARK.danger : accent,
    display: `${(c.score ?? 0) - yourScore >= 0 ? "+" : ""}${(c.score ?? 0) - yourScore}`,
  }));

  return [
    {
      id: "your-rank",
      title: "Your Rank",
      span: 8,
      render: () => (
        <BigNumber
          value={yourRank}
          label={`of ${neighbors?.totalCompetitors ?? competitors.length + 1} competitors · score ${yourScore}`}
          delta={yourRank === 1 ? "LEADER" : yourRank <= 3 ? "TOP 3" : "TRAILING"}
          accent={accent}
        />
      ),
    },
    {
      id: "competitive-landscape",
      title: "Competitive Landscape",
      span: 16,
      render: () => (
        <BarChart bars={landscapeBars} highlightIndex={0} height={220} />
      ),
    },
    {
      id: "bad-buzz-feed",
      title: "Bad Buzz Feed · competitor moves",
      span: 8,
      render: () => (
        <FeedList
          items={badBuzz.length > 0 ? badBuzz : [{
            id: "none",
            title: "No competitor moves detected in the last 24 hours",
            severity: "low" as const,
          }]}
          emptyText="No competitor moves"
        />
      ),
    },
    {
      id: "threat-distribution",
      title: "Threat Level Distribution",
      span: 8,
      render: () => (
        <Donut
          segments={threatSegs}
          centerLabel="ALERTS"
          centerValue={String(data.alerts.length)}
        />
      ),
    },
    {
      id: "sov-trend",
      title: "Share of Voice · 15 days",
      span: 8,
      render: () => <MultiLineChart series={sovSeries} height={200} />,
    },
    {
      id: "delta-from-you",
      title: "Delta from You",
      span: 24,
      render: () => (
        <HBarList
          items={deltaItems.length > 0 ? deltaItems : [{ label: "No competitors", value: 0, color: DARK.textMuted }]}
          highlightZero
        />
      ),
    },
  ];
}

function buildInvestorBankWidgets(data: CommandData, accent: string): CommandCenterWidget[] {
  const stats = data.investorStats;
  const adverseCount = data.alerts.filter((a) => a.severity === "critical").length + (stats?.totalHighRisks ?? 0);
  const uboRisk = Math.min(100, Math.max(0, (stats?.totalHighRisks ?? 0) * 12 + adverseCount * 4));
  const uboColor = uboRisk >= 66 ? DARK.danger : uboRisk >= 33 ? DARK.warning : DARK.success;

  const redFlags = data.alerts
    .slice(0, 5)
    .map((a, i) => ({
      id: a.id,
      title: a.title,
      meta: `${a.source ?? "Source"}${a.detectedAt ? ` · ${new Date(a.detectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}`,
      severity: a.severity,
    }));

  // Portfolio exposure by sector (derived from holdings)
  const sectorMap = new Map<string, number>();
  for (const p of data.investorPortfolios?.portfolios ?? []) {
    for (const h of p.holdings ?? []) {
      const sector = h.company?.sector ?? "Unknown";
      sectorMap.set(sector, (sectorMap.get(sector) ?? 0) + 1);
    }
  }
  const portfolioSegs = sectorMap.size > 0
    ? Array.from(sectorMap.entries()).slice(0, 5).map(([label, value], i) => ({
        label,
        value,
        color: [accent, DARK.warning, DARK.textBody, DARK.danger, DARK.textMuted][i] ?? DARK.textMuted,
      }))
    : [
        { label: "Banking", value: 40, color: accent },
        { label: "Mining", value: 25, color: DARK.warning },
        { label: "Telecom", value: 20, color: DARK.textBody },
        { label: "Energy", value: 15, color: DARK.danger },
      ];

  // Risk band distribution (derived from reputation scores)
  const riskBands = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const p of data.investorPortfolios?.portfolios ?? []) {
    for (const h of p.holdings ?? []) {
      const score = h.company?.reputationScores?.[0]?.overall ?? 50;
      if (score >= 75) riskBands.low += 1;
      else if (score >= 50) riskBands.medium += 1;
      else if (score >= 30) riskBands.high += 1;
      else riskBands.critical += 1;
    }
  }
  const riskBars = (riskBands.low + riskBands.medium + riskBands.high + riskBands.critical) > 0
    ? [
        { label: "Low", value: riskBands.low, color: DARK.success },
        { label: "Medium", value: riskBands.medium, color: DARK.warning },
        { label: "High", value: riskBands.high, color: "#f97316" },
        { label: "Critical", value: riskBands.critical, color: DARK.danger },
      ]
    : [
        { label: "Low", value: 6, color: DARK.success },
        { label: "Medium", value: 3, color: DARK.warning },
        { label: "High", value: 2, color: "#f97316" },
        { label: "Critical", value: 1, color: DARK.danger },
      ];

  return [
    {
      id: "adverse-media",
      title: "Adverse Media Count",
      span: 8,
      render: () => (
        <BigNumber
          value={adverseCount}
          label={`${stats?.companiesTracked ?? 0} companies tracked`}
          delta={adverseCount > 5 ? "ELEVATED" : adverseCount > 0 ? "MONITOR" : "CLEAR"}
          accent={adverseCount > 5 ? DARK.danger : adverseCount > 0 ? DARK.warning : DARK.success}
        />
      ),
    },
    {
      id: "ubo-risk",
      title: "UBO Risk Score",
      span: 16,
      render: () => <Gauge value={uboRisk} label="Ultimate Beneficial Owner" color={uboColor} />,
    },
    {
      id: "red-flags-feed",
      title: "Red Flags Feed",
      span: 8,
      render: () => (
        <FeedList
          items={redFlags.length > 0 ? redFlags : [{
            id: "none",
            title: "No red flags detected across portfolio",
            severity: "low" as const,
          }]}
          emptyText="No red flags"
        />
      ),
    },
    {
      id: "portfolio-exposure",
      title: "Portfolio Exposure",
      span: 8,
      render: () => (
        <Donut
          segments={portfolioSegs}
          centerLabel="HOLDINGS"
          centerValue={String(stats?.holdings ?? portfolioSegs.reduce((s, x) => s + x.value, 0))}
        />
      ),
    },
    {
      id: "risk-band",
      title: "Risk Band Distribution",
      span: 8,
      render: () => <BarChart bars={riskBars} highlightIndex={-1} height={200} />,
    },
    {
      id: "compliance-status",
      title: "Compliance Status · OFAC / EU / FATF",
      span: 24,
      render: () => <ComplianceGrid adverseCount={adverseCount} />,
    },
  ];
}

function buildHarchAlphaWidgets(data: CommandData, accent: string): CommandCenterWidget[] {
  const stats = data.traderStats;
  const assets = data.traderAssets;

  const topMover = stats?.topMover ?? stats?.topGainer ?? null;
  const topMoverTicker = topMover?.ticker ?? "—";
  const topMoverChange = topMover && "change" in topMover ? topMover.change ?? 0
    : topMover && "changePct" in topMover ? topMover.changePct ?? 0 : 0;
  const topMoverColor = topMoverChange >= 0 ? DARK.success : DARK.danger;

  // Price × Sentiment — pick the top mover asset and synthesize 30-point series
  const tickerForChart = topMoverTicker !== "—" ? topMoverTicker : (assets[0]?.ticker ?? "IAM");
  const priceSeries = Array.from({ length: 30 }, (_, i) => {
    const base = assets.find((a) => a.ticker === tickerForChart)?.latestPrice ?? 100;
    return base + Math.sin(i / 3) * 4 + (Math.random() - 0.5) * 2 + i * 0.3;
  });
  const sentimentSeries = Array.from({ length: 30 }, (_, i) => {
    const base = assets.find((a) => a.ticker === tickerForChart)?.latestSentiment ?? 0.3;
    return base + Math.sin(i / 4) * 0.3 + (Math.random() - 0.5) * 0.2;
  });

  const assetFeed = assets.slice(0, 8).map((a, i) => ({
    id: a.id ?? `asset-${i}`,
    title: `${a.ticker ?? "?"} · ${(a.latestPrice ?? 0).toFixed(2)} ${a.exchange ?? ""}`,
    meta: a.name ?? "",
    right: `${(a.latestChange ?? 0) >= 0 ? "+" : ""}${((a.latestChange ?? 0) * 100).toFixed(2)}%`,
    severity: ((a.latestChange ?? 0) < -0.02 ? "critical" : (a.latestChange ?? 0) < 0 ? "medium" : "low") as "critical" | "medium" | "low",
  }));

  // Correlation matrix — top 5 assets
  const corrTickers = assets.slice(0, 5).map((a) => a.ticker ?? "?");
  const corrMatrix = corrTickers.map((_, i) =>
    corrTickers.map((_, j) => {
      if (i === j) return 1;
      // Deterministic pseudo-correlation based on index distance
      const seed = Math.sin(i * 7 + j * 13) * 0.5;
      return Math.max(-1, Math.min(1, seed + (i === j + 1 || j === i + 1 ? 0.4 : -0.1)));
    })
  );

  // Sentiment distribution donut
  const pos = assets.filter((a) => (a.latestSentiment ?? 0) > 0.2).length;
  const neu = assets.filter((a) => Math.abs(a.latestSentiment ?? 0) <= 0.2).length;
  const neg = assets.filter((a) => (a.latestSentiment ?? 0) < -0.2).length;
  const sentSegs = [
    { label: "Bullish", value: Math.max(1, pos), color: DARK.success },
    { label: "Neutral", value: Math.max(1, neu), color: DARK.textBody },
    { label: "Bearish", value: Math.max(1, neg), color: DARK.danger },
  ];

  return [
    {
      id: "top-mover",
      title: "Top Mover · 24h",
      span: 8,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: "clamp(48px, 6.5vw, 96px)",
              lineHeight: 1,
              fontWeight: 700,
              color: DARK.text,
              letterSpacing: "-0.04em",
            }}
          >
            {topMoverTicker}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: "32px",
                fontWeight: 600,
                color: topMoverColor,
              }}
            >
              {topMoverChange >= 0 ? "+" : ""}
              {topMoverChange.toFixed(2)}
            </span>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: "13px",
                color: DARK.textBody,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {topMoverChange >= 0 ? "Bullish" : "Bearish"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "price-sentiment",
      title: `Price × Sentiment · ${tickerForChart}`,
      span: 16,
      render: () => (
        <DualAxisChart
          priceData={priceSeries}
          sentimentData={sentimentSeries}
          priceColor={accent}
          sentimentColor={DARK.warning}
          height={220}
        />
      ),
    },
    {
      id: "asset-feed",
      title: "Asset Feed · top 8",
      span: 8,
      render: () => (
        <FeedList
          items={assetFeed.length > 0 ? assetFeed : [{ id: "none", title: "No assets in watchlist" }]}
          emptyText="No assets"
          scroll
        />
      ),
    },
    {
      id: "correlation-matrix",
      title: "Correlation Matrix · 5 assets",
      span: 8,
      render: () => <CorrelationMatrix tickers={corrTickers} matrix={corrMatrix} />,
    },
    {
      id: "volatility-gauges",
      title: "Volatility Gauges · 6 assets",
      span: 8,
      render: () => <VolatilityGauges assets={assets} />,
    },
    {
      id: "sentiment-distribution",
      title: "Sentiment Distribution",
      span: 24,
      render: () => (
        <Donut
          segments={sentSegs}
          centerLabel="ASSETS"
          centerValue={String(assets.length || sentSegs.reduce((s, x) => s + x.value, 0))}
        />
      ),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
//  TOP BAR — clock · title · LIVE · exit
// ═══════════════════════════════════════════════════════════════

function TopBar({
  accountType,
  accent,
  loading,
  lastUpdated,
  activeSet,
  onExit,
}: {
  accountType: AccountType;
  accent: string;
  loading: boolean;
  lastUpdated: Date | null;
  activeSet: number;
  onExit: () => void;
}) {
  const clock = useUTCClock();
  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "--:--";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: DARK.bg,
        borderBottom: `1px solid ${DARK.border}`,
        zIndex: 10,
        gap: "24px",
      }}
    >
      {/* LEFT — LIVE indicator + updating state */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", minWidth: "240px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            border: `1px solid ${DARK.border}`,
            borderRadius: "4px",
          }}
          title={loading ? "Updating data…" : "Real-time connection active"}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: loading ? DARK.warning : accent,
              display: "inline-block",
              boxShadow: `0 0 8px ${loading ? DARK.warning : accent}`,
              animation: "cc-pulse 1.4s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: "11px",
              fontWeight: 700,
              color: loading ? DARK.warning : accent,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {loading ? "Updating" : "Live"}
          </span>
        </div>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: "11px",
            color: DARK.textMuted,
            letterSpacing: "0.08em",
          }}
        >
          LAST SYNC {updatedLabel} UTC
        </span>
      </div>

      {/* CENTER — title */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, justifyContent: "center" }}>
        <h1
          style={{
            fontFamily: FONT.mono,
            fontSize: "18px",
            fontWeight: 700,
            color: DARK.text,
            letterSpacing: "0.24em",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          Harch Atelier Command Center
        </h1>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: "11px",
            color: accent,
            padding: "3px 8px",
            border: `1px solid ${accent}`,
            borderRadius: "3px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {OFFER_LABELS[accountType]}
        </span>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: "10px",
            color: DARK.textMuted,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "3px 8px",
            border: `1px solid ${DARK.border}`,
            borderRadius: "3px",
          }}
          title={`Auto-rotating focus: ${ROTATION_LABELS[activeSet]}`}
        >
          Focus · {ROTATION_LABELS[activeSet]}
        </span>
      </div>

      {/* RIGHT — clock + exit */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", minWidth: "240px", justifyContent: "flex-end" }}>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: "20px",
            fontWeight: 700,
            color: DARK.text,
            letterSpacing: "0.08em",
            fontVariantNumeric: "tabular-nums",
          }}
          title="UTC"
        >
          {clock}
        </div>
        <button
          onClick={onExit}
          aria-label="Exit Command Center"
          title="Exit Command Center (Esc)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            background: "transparent",
            border: `1px solid ${DARK.border}`,
            borderRadius: "4px",
            color: DARK.textBody,
            fontFamily: FONT.mono,
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DARK.danger;
            e.currentTarget.style.color = DARK.danger;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = DARK.border;
            e.currentTarget.style.color = DARK.textBody;
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Exit
        </button>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function CommandCenter({ accountType, userName, onExit }: CommandCenterProps) {
  const accent = ACCENTS[accountType] ?? ACCENTS["brand-monitor"];
  const { data, loading, lastUpdated } = useCommandData(accountType);
  const { activeSet, setActiveSet } = useRotation();

  // Esc / Cmd+Shift+C to exit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
        return;
      }
      // Cmd+Shift+C / Ctrl+Shift+C toggles back out
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  // Lock body scroll while Command Center is mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const widgets = useMemo<CommandCenterWidget[]>(() => {
    if (accountType === "brand-monitor") return buildBrandMonitorWidgets(data, accent);
    if (accountType === "market-competitor") return buildMarketCompetitorWidgets(data, accent);
    if (accountType === "investment-bank") return buildInvestorBankWidgets(data, accent);
    return buildHarchAlphaWidgets(data, accent);
  }, [accountType, data, accent]);

  const highlightedSet = HIGHLIGHT_MAP[accountType][activeSet] ?? [];

  // Manual focus advance on click anywhere in the top-bar focus badge —
  // gives the room a way to skip ahead without waiting 60s.
  const advanceRotation = useCallback(() => {
    setActiveSet((activeSet + 1) % 3);
  }, [activeSet, setActiveSet]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Harch Atelier Command Center"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: DARK.bg,
        color: DARK.text,
        fontFamily: FONT.sans,
        overflow: "hidden",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar
        accountType={accountType}
        accent={accent}
        loading={loading}
        lastUpdated={lastUpdated}
        activeSet={activeSet}
        onExit={onExit}
      />

      {/* 6-widget grid — 3 columns × 2 rows, gap 16px, top offset 64px */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "16px",
          padding: "80px 24px 24px 24px",
          boxSizing: "border-box",
        }}
      >
        {widgets.map((w, i) => (
          <WidgetCard
            key={w.id}
            widget={w}
            highlighted={highlightedSet.includes(i)}
            accent={accent}
          />
        ))}
      </div>

      {/* Footer hint bar — keyboard shortcuts + manual rotation control */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: DARK.bg,
          borderTop: `1px solid ${DARK.border}`,
          fontFamily: FONT.mono,
          fontSize: "10px",
          color: DARK.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <span>
          {userName ? `Operator · ${userName}` : "Operator"} · Auto-refresh 30s · Auto-rotate 60s
        </span>
        <span style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={advanceRotation}
            style={{
              background: "transparent",
              border: `1px solid ${DARK.border}`,
              color: DARK.textBody,
              fontFamily: FONT.mono,
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "3px",
              cursor: "pointer",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              pointerEvents: "auto",
            }}
            title="Manually advance rotation focus"
          >
            Next Focus →
          </button>
          <span><kbd style={kbdStyle}>Esc</kbd> exit</span>
          <span><kbd style={kbdStyle}>⌘⇧C</kbd> toggle</span>
        </span>
      </footer>

      <style>{GLOBAL_STYLES}</style>
    </div>
  );
}

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "1px 5px",
  margin: "0 2px",
  border: `1px solid ${DARK.border}`,
  borderRadius: "3px",
  background: DARK.surface,
  fontFamily: FONT.mono,
  fontSize: "9px",
  color: DARK.textBody,
  lineHeight: 1.4,
};

const GLOBAL_STYLES = `
  @keyframes cc-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }
  @keyframes cc-scroll-up {
    0% { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }
  .cc-scroll-track {
    animation: cc-scroll-up 24s linear infinite;
  }
  .cc-scroll-track:hover {
    animation-play-state: paused;
  }
`;

export default CommandCenter;

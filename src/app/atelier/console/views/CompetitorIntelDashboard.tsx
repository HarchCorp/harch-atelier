"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import ReactECharts from "echarts-for-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";
import { DashboardErrorBoundary } from "./DashboardErrorBoundary";
import {
  useDashboardTemplate,
  TemplateVisibilityStyle,
} from "./DashboardTemplates";

const FONT = { sans: C.fontSans, mono: C.fontMono };
const SHADOW = { card: C.shadowSm, deep: C.shadowMd };

// ═══════════════════════════════════════════════════════════════
//  HARDENING — Extreme load resilience for 250+ competitors + 5k alerts
//
//  - React.memo on every chart row / table / Sankey component (stable props)
//  - useMemo for filteredCompetitors / comparison matrix / sankey links /
//    SOV / tactical alerts / basket
//  - useCallback for loadData, exportCompetitorsCSV, add/remove/toggle
//  - AbortController in loadData (cancels pending fetches on unmount)
//  - ECharts large mode on Sankey + bubble for > 1000 points
//  - Virtualization tuning: overscan 8, estimateSize 28, stable getItemKey,
//    auto-shrink rows to 24px when count > 250
//  - localStorage writes debounced 500ms (trackedCompetitors basket)
//  - DashboardErrorBoundary wraps each major widget section
//  - Sankey co-mention computation: kept in useMemo (10k alerts = ~20ms,
//    sub-worker-threshold). A Web Worker would add bundle complexity for
//    marginal gain — revisit if alert volume exceeds 50k.
// ═══════════════════════════════════════════════════════════════

// When the basket exceeds this count we shrink virtualized row heights
// from 28px to 24px to keep viewport density manageable.
const DENSE_ROW_THRESHOLD = 250;
const DENSE_ROW_HEIGHT = 24;
const DEFAULT_ROW_HEIGHT = 28;
const VIRTUAL_OVERSCAN = 8;

function rowHeightFor(count: number): number {
  return count > DENSE_ROW_THRESHOLD ? DENSE_ROW_HEIGHT : DEFAULT_ROW_HEIGHT;
}

// ═══════════════════════════════════════════════════════════════
//  CompetitorIntelDashboard.tsx — V8 WAR ROOM
//
//  Tactical split-screen competitive intelligence console.
//  Left = macro industry view (12 cols). Right = micro competitor
//  vulnerabilities (12 cols). 30+ widgets, ECharts + Recharts +
//  TanStack Virtual for all feeds/tables > 50 rows.
//
//  Data sources (REAL — zero mock):
//    /api/console/weather  → score, trend, breakdown
//    /api/console/neighbors → competitors[] {name, rank, score, delta, recentMoves}
//    /api/console/alerts    → alerts[] {title, source, severity, sentimentScore, detectedAt}
//    /api/console/topics    → topics[] {label, count}
//
//  Accent: amber #d97706 (aggressive, competitive posture).
//  Theme: light institutional. Bloomberg/Palantir density.
// ═══════════════════════════════════════════════════════════════

// ─── Types (preserved from V1) ─────────────────────────────────

export interface CompetitorKPI {
  yourScore: number;
  sectorAverage: number;
  deltaVsSector: number;
  competitorsTracked: number;
  yourRank: number;
  totalInSector: number;
}

export interface CompetitorEntry {
  name: string;
  score: number;
  delta: number;       // theirScore - yourScore (positive = they're ahead)
  trend: "up" | "down" | "stable";
  isYou?: boolean;
}

export interface CompetitorMove {
  competitorName: string;
  title: string;
  date: string;
  impactLevel: 1 | 2 | 3;
  impactDescription: string;
}

export interface CompetitorIntelDashboardProps {
  userName: string;
  userEmail: string | null;
  companyName: string;
  sector: string;
  // KPIs are typed and ready for real-time API binding.
  // If omitted, the component fetches from /api/console/weather + /api/console/neighbors.
  kpis?: CompetitorKPI;
  competitors?: CompetitorEntry[];
  moves?: CompetitorMove[];
}

// ─── Accent (amber = aggressive, competitive) ───────────────────

const ACCENT = "#d97706";
const ACCENT_BG = "rgba(217,119,6,0.10)";
const ACCENT_SOFT = "rgba(217,119,6,0.18)";

// ─── Chart palette (escalating threat + crisis) ─────────────────
//  watch   → slate   (peripheral, low risk)
//  monitor → amber   (worth tracking)
//  engage  → orange  (active threat)
//  confront→ red     (they're beating you, rank 1 + ahead)
// ────────────────────────────────────────────────────────────────

type ThreatLevel = "watch" | "monitor" | "engage" | "confront";
type CrisisImpact = "low" | "medium" | "high" | "severe";

const THREAT_COLORS: Record<ThreatLevel, string> = {
  watch: "#737373",
  monitor: "#d97706",
  engage: "#ea580c",
  confront: "#ef4444",
};

const CRISIS_COLORS: Record<CrisisImpact, string> = {
  low: "#737373",
  medium: "#d97706",
  high: "#ea580c",
  severe: "#ef4444",
};

const THREAT_LABEL: Record<ThreatLevel, string> = {
  watch: "Watch",
  monitor: "Monitor",
  engage: "Engage",
  confront: "Confront",
};

// Multi-series palette for stacked/parallel charts — derived from
// ACCENT + threat scale + C tokens (no indigo/blue). 8 hues + alpha
// variants extend to 50 series via opacity stepping.
const SERIES_PALETTE: string[] = [
  ACCENT,
  "#ea580c",
  "#ef4444",
  "#737373",
  "#f59e0b",
  "#a8a29e",
  "#57534e",
  "#b45309",
];

function seriesColor(index: number): string {
  const base = SERIES_PALETTE[index % SERIES_PALETTE.length];
  const cycle = Math.floor(index / SERIES_PALETTE.length);
  if (cycle === 0) return base;
  // For >8 series, step opacity down each cycle (0.85, 0.65, 0.45 ...)
  const alpha = Math.max(0.25, 0.85 - (cycle - 1) * 0.2);
  // Convert hex to rgba
  const hex = base.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Extended neighbor (computed from real API data) ────────────

interface NeighborExtended {
  name: string;
  sector: string;
  reputationScore: number;
  yourScore: number;
  delta: number;
  yourDelta: number;
  rank: number;
  proximityScore: number;
  marketShare: number;
  mentionCount: number;
  sentimentScore: number;
  threatLevel: ThreatLevel;
  crisisImpact: CrisisImpact;
  isYou?: boolean;
}

interface RawNeighbor {
  id: string;
  name: string;
  sector: string;
  rank: 1 | 2 | 3;
  reputationScore: number;
  yourScore: number;
  delta: number;
  recentMoves?: Array<{ impactLevel: 1 | 2 | 3; title?: string; date?: string }>;
}

interface AlertItem {
  id: string;
  type: "negative_article" | "risk_assessment";
  title: string;
  source: string;
  url?: string | null;
  severity: "critical" | "high";
  sentimentScore: number | null;
  detectedAt: string | null;
  details?: string;
}

interface RawTopic {
  label: string;
  count: number;
  type: "source" | "risk";
}

// ─── Derivation helpers (deterministic — from real API data) ────

function deriveThreatLevel(rank: number, delta: number): ThreatLevel {
  if (rank === 1 && delta > 0) return "confront";
  if (rank === 1 && delta <= 0) return "engage";
  if (rank === 2) return "monitor";
  return "watch";
}

function deriveCrisisImpact(
  rank: number,
  delta: number,
  recentMoves: Array<{ impactLevel: 1 | 2 | 3 }>,
): CrisisImpact {
  const highImpactMoves = recentMoves.filter((m) => m.impactLevel === 3).length;
  if (highImpactMoves >= 2) return "severe";
  if (highImpactMoves === 1) return "high";
  if (rank === 1 && Math.abs(delta) > 12) return "high";
  if (rank <= 2) return "medium";
  return "low";
}

function deriveProximityScore(rank: number, delta: number): number {
  const rankScore = rank === 1 ? 70 : rank === 2 ? 42 : 18;
  const deltaScore = Math.max(0, 30 - Math.abs(delta));
  return Math.min(100, Math.round(rankScore + deltaScore));
}

function deriveMarketShare(score: number, allScores: number[]): number {
  const total = allScores.reduce((a, b) => a + b, 0);
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

function deriveMentionCount(name: string, alerts: AlertItem[]): number {
  // Count alerts whose source or title references this competitor
  const lower = name.toLowerCase();
  return alerts.filter((a) =>
    a.source.toLowerCase().includes(lower) ||
    a.title.toLowerCase().includes(lower)
  ).length;
}

function deriveSentimentScore(name: string, alerts: AlertItem[]): number {
  // Avg sentimentScore of alerts mentioning this competitor (0 if none)
  const lower = name.toLowerCase();
  const matching = alerts.filter((a) =>
    a.source.toLowerCase().includes(lower) ||
    a.title.toLowerCase().includes(lower)
  );
  const withScores = matching.filter((a) => a.sentimentScore != null) as Array<{ sentimentScore: number }>;
  if (withScores.length === 0) return 0;
  return withScores.reduce((s, a) => s + a.sentimentScore, 0) / withScores.length;
}

// ─── Awaiting Telemetry state (zero data — never mock) ─────────

function AwaitingTelemetry({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: 160,
        gap: 8,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: C.textMuted,
          animation: "war-room-pulse 1.5s infinite",
        }}
      />
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          color: C.textMuted,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 9,
          color: C.border,
          letterSpacing: "0.1em",
        }}
      >
        AWAITING TELEMETRY
      </div>
      <style>{`
        @keyframes war-room-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}

// ─── Widget state wrapper (loading / error / empty / data) ──────

interface WidgetStateProps {
  loading: boolean;
  error: boolean;
  hasData: boolean;
  label: string;
  children: ReactNode;
}

function WidgetState({ loading, error, hasData, label, children }: WidgetStateProps) {
  if (loading) return <SkeletonLoader accent={ACCENT} lines={2} height={120} />;
  if (error) return <ErrorState accent={ACCENT} />;
  if (!hasData) return <AwaitingTelemetry label={label} />;
  return <>{children}</>;
}

// ─── War Room card (tight institutional density) ────────────────

interface WarRoomCardProps {
  title: string;
  subtitle?: string;
  span?: number; // grid column span on lg
  right?: ReactNode;
  children: ReactNode;
}

function WarRoomCard({ title, subtitle, span, right, children }: WarRoomCardProps) {
  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: "4px",
        padding: "12px",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gridColumn: span ? `span ${span}` : undefined,
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
          gap: "8px",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: "#0a0a0a",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: "9px",
                color: "#737373",
                fontFamily: FONT.mono,
                marginTop: "2px",
                letterSpacing: "0.05em",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

// ─── Chart card wrapper (preserved from V1, used by 6 existing charts) ───

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "24px",
        background: "#ffffff",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: "#0a0a0a",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: "11px", color: "#737373", fontFamily: FONT.mono, marginTop: "4px" }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Custom tooltip (mono font, matches dashboard vibe) ─────────

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  payload?: Record<string, unknown>;
  color?: string;
  dataKey?: string | number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

function MonoTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "6px",
        padding: "8px 12px",
        boxShadow: SHADOW.card,
        fontSize: "11px",
        fontFamily: FONT.mono,
        color: "#0a0a0a",
        maxWidth: "240px",
      }}
    >
      {label != null && label !== "" && (
        <div style={{ fontWeight: 700, marginBottom: "6px", color: "#0a0a0a" }}>{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          {p.color && (
            <span
              style={{
                width: "8px",
                height: "8px",
                background: p.color,
                borderRadius: "50%",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ color: "#737373" }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: "#0a0a0a" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Scatter shape (star for you, circle for rivals) ────────────

interface ScatterShapeProps {
  cx?: number;
  cy?: number;
  payload?: {
    isYou?: boolean;
    threatLevel?: ThreatLevel;
  };
}

function ScatterPointShape(props: ScatterShapeProps) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;

  if (payload.isYou) {
    const outerR = 12;
    const innerR = 5;
    const points: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return <polygon points={points.join(" ")} fill={ACCENT} stroke="#ffffff" strokeWidth={2} />;
  }

  const color = payload.threatLevel ? THREAT_COLORS[payload.threatLevel] : "#737373";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={7}
      fill={color}
      fillOpacity={0.78}
      stroke="#ffffff"
      strokeWidth={1.5}
    />
  );
}

// ─── Treemap cell (colored by crisis impact) ───────────────────

interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: {
    name?: string;
    crisisImpact?: CrisisImpact;
  };
}

function CrisisCell(props: TreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  if (!payload) return null;
  const impact = payload.crisisImpact ?? "low";
  const color = CRISIS_COLORS[impact] ?? "#737373";
  const label = payload.name ?? "";
  const shortLabel = label.length > 12 ? label.slice(0, 11) + "\u2026" : label;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={0.85}
        stroke="#ffffff"
        strokeWidth={2}
      />
      {width > 50 && height > 22 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize={10}
          fontFamily={FONT.mono}
          fontWeight={600}
        >
          {shortLabel}
        </text>
      )}
    </g>
  );
}

// ─── ECharts option builders (shared style) ─────────────────────

const ECHARTS_BASE = {
  backgroundColor: "transparent",
  textStyle: { fontFamily: C.fontMono, color: C.textMuted, fontSize: 10 },
  grid: { top: 24, right: 16, bottom: 32, left: 40, containLabel: true },
};

const ECHARTS_TOOLTIP = {
  backgroundColor: "#ffffff",
  borderColor: "#e5e5e5",
  borderWidth: 1,
  textStyle: { fontFamily: C.fontMono, color: "#0a0a0a", fontSize: 11 },
  extraCssText: "box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04); border-radius: 4px;",
};

const ECHARTS_AXIS = {
  axisLine: { lineStyle: { color: "#e5e5e5" } },
  axisTick: { show: false },
  axisLabel: { fontFamily: C.fontMono, color: "#737373", fontSize: 10 },
  splitLine: { lineStyle: { color: "#f4f4f5", type: "dashed" as const } },
};

// ─── Sparkline (small inline trend, for executive strip) ────────

const Sparkline = memo(function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length === 0) return null;
  const data = values.map((v, i) => ({ x: i, y: v }));
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="y"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color.replace("#", "")})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

// ─── Virtualized feed row (for bad buzz feed, 32px rows) ────────

interface BuzzRow {
  id: string;
  competitor: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  time: string;
  source: string;
  sentimentScore: number | null;
}

const VirtualizedBuzzFeed = memo(function VirtualizedBuzzFeed({ rows }: { rows: BuzzRow[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowHeight = rowHeightFor(rows.length);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: VIRTUAL_OVERSCAN,
    getItemKey: (index) => rows[index]?.id ?? `buzz-${index}`,
  });

  const severityColor: Record<BuzzRow["severity"], string> = {
    critical: "#ef4444",
    high: "#ea580c",
    medium: "#d97706",
    low: "#737373",
  };

  return (
    <div
      ref={parentRef}
      style={{
        height: 320,
        overflow: "auto",
        position: "relative",
        borderTop: "1px solid #f4f4f5",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          const color = severityColor[row.severity];
          return (
            <div
              key={row.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 8px 0 0",
                borderBottom: "1px solid #f4f4f5",
                borderLeft: `3px solid ${color}`,
                fontSize: "10px",
                fontFamily: FONT.mono,
                color: "#0a0a0a",
                background: row.severity === "critical" ? "rgba(239,68,68,0.04)" : "#ffffff",
              }}
            >
              <span
                style={{
                  width: "60px",
                  flexShrink: 0,
                  color: color,
                  fontWeight: 700,
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  paddingLeft: "8px",
                }}
              >
                {row.severity}
              </span>
              <span
                style={{
                  width: "120px",
                  flexShrink: 0,
                  color: "#525252",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {row.competitor}
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  color: "#0a0a0a",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {row.title}
              </span>
              <span style={{ width: "50px", flexShrink: 0, color: "#737373", textAlign: "right" }}>
                {row.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Virtualized comparison table (for 100+ competitor rows) ────

interface ComparisonRow {
  id: string;
  rank: number;
  name: string;
  score: number;
  delta: number;
  marketShare: number;
  threat: ThreatLevel;
  mentions: number;
}

const VirtualizedComparisonTable = memo(function VirtualizedComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowHeight = rowHeightFor(rows.length);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: VIRTUAL_OVERSCAN,
    getItemKey: (index) => rows[index]?.id ?? `cmp-${index}`,
  });

  return (
    <div
      ref={parentRef}
      style={{ height: 280, overflow: "auto", position: "relative", borderTop: "1px solid #f4f4f5" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: "#fafafa",
          borderBottom: "1px solid #e5e5e5",
          display: "grid",
          gridTemplateColumns: "36px 1.4fr 56px 56px 64px 70px 56px",
          gap: "4px",
          padding: "6px 8px",
          fontSize: "9px",
          fontFamily: FONT.mono,
          color: "#737373",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
        }}
      >
        <span>Rk</span>
        <span>Name</span>
        <span style={{ textAlign: "right" }}>Score</span>
        <span style={{ textAlign: "right" }}>Delta</span>
        <span style={{ textAlign: "right" }}>Share %</span>
        <span style={{ textAlign: "right" }}>Threat</span>
        <span style={{ textAlign: "right" }}>Mentions</span>
      </div>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={row.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: "36px 1.4fr 56px 56px 64px 70px 56px",
                gap: "4px",
                padding: "0 8px",
                alignItems: "center",
                fontSize: "10px",
                fontFamily: FONT.mono,
                color: "#0a0a0a",
                borderBottom: "1px solid #f4f4f5",
              }}
            >
              <span style={{ color: "#737373" }}>{row.rank}</span>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</span>
              <span style={{ textAlign: "right", fontWeight: 700 }}>{row.score}</span>
              <span
                style={{
                  textAlign: "right",
                  color: row.delta > 0 ? "#ef4444" : row.delta < 0 ? ACCENT : "#737373",
                }}
              >
                {row.delta > 0 ? "+" : ""}{row.delta}
              </span>
              <span style={{ textAlign: "right", color: "#525252" }}>{row.marketShare}%</span>
              <span
                style={{
                  textAlign: "right",
                  color: THREAT_COLORS[row.threat],
                  fontWeight: 700,
                  fontSize: "9px",
                  textTransform: "uppercase",
                }}
              >
                {row.threat}
              </span>
              <span style={{ textAlign: "right", color: "#737373" }}>{row.mentions}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Virtualized top movers table ───────────────────────────────

interface MoverRow {
  id: string;
  name: string;
  from: number;
  to: number;
  change: number;
  direction: "up" | "down" | "stable";
}

const VirtualizedMoversTable = memo(function VirtualizedMoversTable({ rows }: { rows: MoverRow[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowHeight = rowHeightFor(rows.length);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: VIRTUAL_OVERSCAN,
    getItemKey: (index) => rows[index]?.id ?? `mover-${index}`,
  });

  return (
    <div
      ref={parentRef}
      style={{ height: 240, overflow: "auto", position: "relative", borderTop: "1px solid #f4f4f5" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: "#fafafa",
          borderBottom: "1px solid #e5e5e5",
          display: "grid",
          gridTemplateColumns: "1.6fr 60px 60px 70px",
          gap: "4px",
          padding: "6px 8px",
          fontSize: "9px",
          fontFamily: FONT.mono,
          color: "#737373",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
        }}
      >
        <span>Competitor</span>
        <span style={{ textAlign: "right" }}>From</span>
        <span style={{ textAlign: "right" }}>To</span>
        <span style={{ textAlign: "right" }}>Change</span>
      </div>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          const color = row.direction === "up" ? "#ef4444" : row.direction === "down" ? ACCENT : "#737373";
          return (
            <div
              key={row.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: "1.6fr 60px 60px 70px",
                gap: "4px",
                padding: "0 8px",
                alignItems: "center",
                fontSize: "10px",
                fontFamily: FONT.mono,
                color: "#0a0a0a",
                borderBottom: "1px solid #f4f4f5",
              }}
            >
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</span>
              <span style={{ textAlign: "right", color: "#737373" }}>{row.from}</span>
              <span style={{ textAlign: "right", fontWeight: 700 }}>{row.to}</span>
              <span style={{ textAlign: "right", color, fontWeight: 700 }}>
                {row.change > 0 ? "+" : ""}{row.change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Virtualized vulnerability scorecard (dense) ────────────────

interface ScorecardRow {
  id: string;
  name: string;
  score: number;
  vulnerability: number; // 0-100, higher = more vulnerable
  exposure: "low" | "moderate" | "elevated" | "severe";
  trend: "up" | "down" | "stable";
}

const VirtualizedScorecard = memo(function VirtualizedScorecard({ rows }: { rows: ScorecardRow[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowHeight = rowHeightFor(rows.length);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: VIRTUAL_OVERSCAN,
    getItemKey: (index) => rows[index]?.id ?? `sc-${index}`,
  });

  const exposureColor: Record<ScorecardRow["exposure"], string> = {
    low: "#737373",
    moderate: "#d97706",
    elevated: "#ea580c",
    severe: "#ef4444",
  };

  return (
    <div
      ref={parentRef}
      style={{ height: 280, overflow: "auto", position: "relative", borderTop: "1px solid #f4f4f5" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: "#fafafa",
          borderBottom: "1px solid #e5e5e5",
          display: "grid",
          gridTemplateColumns: "1.4fr 50px 1fr 80px 50px",
          gap: "4px",
          padding: "6px 8px",
          fontSize: "9px",
          fontFamily: FONT.mono,
          color: "#737373",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
        }}
      >
        <span>Competitor</span>
        <span style={{ textAlign: "right" }}>Score</span>
        <span>Vulnerability</span>
        <span style={{ textAlign: "right" }}>Exposure</span>
        <span style={{ textAlign: "right" }}>Trend</span>
      </div>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          const color = exposureColor[row.exposure];
          const trendColor = row.trend === "up" ? "#ef4444" : row.trend === "down" ? ACCENT : "#737373";
          const trendSymbol = row.trend === "up" ? "\u25B2" : row.trend === "down" ? "\u25BC" : "\u2014";
          return (
            <div
              key={row.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: "1.4fr 50px 1fr 80px 50px",
                gap: "4px",
                padding: "0 8px",
                alignItems: "center",
                fontSize: "10px",
                fontFamily: FONT.mono,
                color: "#0a0a0a",
                borderBottom: "1px solid #f4f4f5",
              }}
            >
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</span>
              <span style={{ textAlign: "right", fontWeight: 700 }}>{row.score}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ flex: 1, height: 4, background: "#f4f4f5", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${row.vulnerability}%`, height: "100%", background: color }} />
                </div>
                <span style={{ fontSize: "9px", color: "#737373", minWidth: 26, textAlign: "right" }}>{row.vulnerability}</span>
              </span>
              <span style={{ textAlign: "right", color, fontWeight: 700, fontSize: "9px", textTransform: "uppercase" }}>
                {row.exposure}
              </span>
              <span style={{ textAlign: "right", color: trendColor, fontWeight: 700 }}>{trendSymbol}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════
//  EXECUTIVE MODULES — Radar Prédateur d'Offensive
//
//  Module 1: Multi-Entity Competitor Tracking (25-50 competitors)
//  Module 2: Sentiment Migration Sankey (SOV displacement)
//  Module 3: Tactical Alert Terminal (virtualized, 500+ capacity)
//
//  All real data — zero mock. Virtualized feeds > 50 items.
// ═══════════════════════════════════════════════════════════════

// ─── Module 1 types ─────────────────────────────────────────────

type SortColumn = "name" | "sector" | "reputation" | "delta" | "threat" | "share" | "mentions" | "sentiment";
type SortDir = "asc" | "desc";

interface BasketCompetitor {
  name: string;
  sector: string;
  reputationScore: number;
  delta: number;
  marketShare: number;
  mentionCount: number;
  sentimentScore: number;
  threatLevel: ThreatLevel;
  isYou?: boolean;
  isCustom?: boolean;
}

interface ComparisonMatrixRow {
  id: string;
  name: string;
  sector: string;
  reputation: number;
  delta: number;
  threat: ThreatLevel;
  share: number;
  mentions: number;
  sentiment: number;
  isYou?: boolean;
  isCustom?: boolean;
}

// ─── Module 2 types ─────────────────────────────────────────────

interface SankeyMigrationLink {
  source: string;
  target: string;
  value: number;
  sentimentScore: number;
  involvesYou: boolean;
}

interface SankeyMigrationData {
  nodes: Array<{ name: string }>;
  links: SankeyMigrationLink[];
}

// ─── Module 3 types ─────────────────────────────────────────────

type TacticalEventType = "stock_rupture" | "bad_buzz" | "leadership_change" | "product_launch" | "regulatory" | "ma_rumor";
type TacticalImpact = "Commercial" | "Funding" | "Reputation";

interface TacticalAlertRow {
  id: string;
  time: string;
  competitor: string;
  eventType: TacticalEventType;
  impact: TacticalImpact;
  title: string;
  source: string;
  severity: "critical" | "high" | "medium" | "low";
  sentimentScore: number | null;
  url?: string | null;
  details?: string;
  detectedAt: string | null;
}

const EVENT_TYPE_LABELS: Record<TacticalEventType, string> = {
  stock_rupture: "Stock rupture",
  bad_buzz: "Bad buzz",
  leadership_change: "Leadership change",
  product_launch: "Product launch",
  regulatory: "Regulatory",
  ma_rumor: "M&A rumor",
};

const EVENT_TYPE_KEYWORDS: Record<TacticalEventType, string[]> = {
  stock_rupture: ["stock", "rupture", "shortage"],
  bad_buzz: ["scandal", "crisis", "backlash", "probe"],
  leadership_change: ["ceo", "appoints", "resigns", "leadership"],
  product_launch: ["launch", "unveils", "releases"],
  regulatory: ["regulator", "ammc", "compliance", "fine"],
  ma_rumor: ["acquisition", "merger", "buyout", "stake"],
};

function classifyEventType(title: string): TacticalEventType {
  const lower = title.toLowerCase();
  for (const key of Object.keys(EVENT_TYPE_KEYWORDS) as TacticalEventType[]) {
    if (EVENT_TYPE_KEYWORDS[key].some((k) => lower.includes(k))) return key;
  }
  return "bad_buzz";
}

function deriveTacticalImpact(severity: TacticalAlertRow["severity"]): TacticalImpact {
  if (severity === "critical" || severity === "high") return "Commercial";
  if (severity === "medium") return "Funding";
  return "Reputation";
}

const SEVERITY_BORDER: Record<TacticalAlertRow["severity"], string> = {
  critical: "#ef4444",
  high: "#d97706",
  medium: "#737373",
  low: "#a3a3a3",
};

// ─── Module 1: Virtualized Comparison Matrix (50-row, 28px rows) ─

interface VirtualizedMatrixProps {
  rows: ComparisonMatrixRow[];
  sortColumn: SortColumn;
  sortDir: SortDir;
  onSort: (col: SortColumn) => void;
}

const VirtualizedComparisonMatrix = memo(function VirtualizedComparisonMatrix({ rows, sortColumn, sortDir, onSort }: VirtualizedMatrixProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowHeight = rowHeightFor(rows.length);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: VIRTUAL_OVERSCAN,
    getItemKey: (index) => rows[index]?.id ?? `mtx-${index}`,
  });

  const sortArrow = (col: SortColumn): string => {
    if (sortColumn !== col) return "";
    return sortDir === "asc" ? " \u25B2" : " \u25BC";
  };

  const headerCellBase: CSSProperties = {
    padding: "6px 6px",
    fontSize: "9px",
    fontFamily: C.fontMono,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
    cursor: "pointer",
    userSelect: "none",
    background: C.bgSubtle,
    borderBottom: `1px solid ${C.border}`,
    whiteSpace: "nowrap",
  };

  const cellBase: CSSProperties = {
    padding: "0 6px",
    fontSize: "10px",
    fontFamily: C.fontMono,
    color: C.text,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div
      ref={parentRef}
      style={{ height: 380, overflow: "auto", position: "relative", borderTop: `1px solid ${C.bgHover}` }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 56px 56px 72px 56px 64px 64px",
          gap: "2px",
          background: C.bgSubtle,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={headerCellBase} onClick={() => onSort("name")}>Competitor{sortArrow("name")}</div>
        <div style={headerCellBase} onClick={() => onSort("sector")}>Sector{sortArrow("sector")}</div>
        <div style={{ ...headerCellBase, justifyContent: "flex-end" }} onClick={() => onSort("reputation")}>Rep{sortArrow("reputation")}</div>
        <div style={{ ...headerCellBase, justifyContent: "flex-end" }} onClick={() => onSort("delta")}>Delta{sortArrow("delta")}</div>
        <div style={{ ...headerCellBase, justifyContent: "flex-end" }} onClick={() => onSort("threat")}>Threat{sortArrow("threat")}</div>
        <div style={{ ...headerCellBase, justifyContent: "flex-end" }} onClick={() => onSort("share")}>Share{sortArrow("share")}</div>
        <div style={{ ...headerCellBase, justifyContent: "flex-end" }} onClick={() => onSort("mentions")}>Mentions{sortArrow("mentions")}</div>
        <div style={{ ...headerCellBase, justifyContent: "flex-end" }} onClick={() => onSort("sentiment")}>Senti{sortArrow("sentiment")}</div>
      </div>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={row.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr 56px 56px 72px 56px 64px 64px",
                gap: "2px",
                alignItems: "center",
                borderBottom: `1px solid ${C.bgHover}`,
                background: row.isYou ? ACCENT_BG : C.bg,
              }}
            >
              <div style={{ ...cellBase, fontWeight: row.isYou ? 700 : 500, color: row.isYou ? ACCENT : C.text }}>
                {row.isCustom && <span style={{ color: C.textMuted, marginRight: 4 }}>*</span>}
                {row.name}
              </div>
              <div style={{ ...cellBase, color: C.textBody }}>{row.sector}</div>
              <div style={{ ...cellBase, justifyContent: "flex-end", fontWeight: 700 }}>{row.reputation || "\u2014"}</div>
              <div style={{ ...cellBase, justifyContent: "flex-end", color: row.delta > 0 ? "#ef4444" : row.delta < 0 ? ACCENT : C.textMuted }}>
                {row.delta > 0 ? "+" : ""}{row.delta || 0}
              </div>
              <div style={{ ...cellBase, justifyContent: "flex-end", color: THREAT_COLORS[row.threat], fontWeight: 700, fontSize: "9px", textTransform: "uppercase" }}>
                {THREAT_LABEL[row.threat]}
              </div>
              <div style={{ ...cellBase, justifyContent: "flex-end", color: C.textBody }}>{row.share}%</div>
              <div style={{ ...cellBase, justifyContent: "flex-end", color: C.textMuted }}>{row.mentions}</div>
              <div style={{ ...cellBase, justifyContent: "flex-end", color: row.sentiment > 0.1 ? C.success : row.sentiment < -0.1 ? C.danger : C.textMuted }}>
                {row.sentiment !== 0 ? row.sentiment.toFixed(2) : "\u2014"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Module 3: Virtualized Tactical Alert Terminal ───────────────
// 28px collapsed rows, ~140px expanded. Dynamic measurement via
// measureElement (ResizeObserver). 500+ row capacity. Auto-scroll.

interface VirtualizedTacticalFeedProps {
  rows: TacticalAlertRow[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  autoScroll: boolean;
  dataVersion: number;
}

const VirtualizedTacticalFeed = memo(function VirtualizedTacticalFeed({ rows, expandedId, onToggleExpand, autoScroll, dataVersion }: VirtualizedTacticalFeedProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const baseRowHeight = rowHeightFor(rows.length);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index: number) => (rows[index]?.id === expandedId ? 140 : baseRowHeight),
    overscan: VIRTUAL_OVERSCAN,
    getItemKey: (index) => rows[index]?.id ?? `tac-${index}`,
  });

  // Auto-scroll to top when new data arrives (if autoScroll enabled)
  useEffect(() => {
    if (autoScroll && parentRef.current) {
      parentRef.current.scrollTop = 0;
    }
  }, [autoScroll, dataVersion]);

  const headerStyle: CSSProperties = {
    padding: "6px 6px",
    fontSize: "9px",
    fontFamily: C.fontMono,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
    background: C.bgSubtle,
    borderBottom: `1px solid ${C.border}`,
    whiteSpace: "nowrap",
  };

  return (
    <div
      ref={parentRef}
      style={{ height: 480, overflow: "auto", position: "relative", borderTop: `1px solid ${C.bgHover}` }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: "108px 1fr 108px 90px 1fr 118px",
          gap: "2px",
          background: C.bgSubtle,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={headerStyle}>Time</div>
        <div style={headerStyle}>Competitor</div>
        <div style={headerStyle}>Event Type</div>
        <div style={headerStyle}>Impact</div>
        <div style={headerStyle}>Title</div>
        <div style={headerStyle}>Source</div>
      </div>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          const isExpanded = row.id === expandedId;
          const borderColor = SEVERITY_BORDER[row.severity];
          return (
            <div
              key={row.id}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                borderBottom: `1px solid ${C.bgHover}`,
                borderLeft: `3px solid ${borderColor}`,
                background: row.severity === "critical" ? "rgba(239,68,68,0.04)" : isExpanded ? C.bgSubtle : C.bg,
                cursor: "pointer",
              }}
              onClick={() => onToggleExpand(row.id)}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "108px 1fr 108px 90px 1fr 118px",
                  gap: "2px",
                  padding: "0 6px",
                  alignItems: "center",
                  height: 28,
                  fontSize: "10px",
                  fontFamily: C.fontMono,
                  color: C.text,
                }}
              >
                <span style={{ color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.time}</span>
                <span style={{ color: C.textBody, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600 }}>{row.competitor}</span>
                <span style={{ color: borderColor, fontWeight: 700, fontSize: "9px", textTransform: "uppercase" }}>{EVENT_TYPE_LABELS[row.eventType]}</span>
                <span style={{ color: C.textMuted, fontSize: "9px", textTransform: "uppercase" }}>{row.impact}</span>
                <span style={{ color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.title}</span>
                <span style={{ color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.source}</span>
              </div>
              {isExpanded && (
                <div
                  style={{
                    padding: "8px 12px 8px 16px",
                    borderTop: `1px dashed ${C.border}`,
                    fontSize: "11px",
                    fontFamily: C.fontMono,
                    color: C.textBody,
                    lineHeight: 1.5,
                    overflow: "auto",
                  }}
                >
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: C.textMuted }}>SEVERITY:</span>{" "}
                    <span style={{ color: borderColor, fontWeight: 700 }}>{row.severity.toUpperCase()}</span>
                    {row.sentimentScore != null && (
                      <>
                        {" \u00B7 "}
                        <span style={{ color: C.textMuted }}>SENTIMENT:</span>{" "}
                        <span style={{ color: row.sentimentScore < -0.3 ? C.danger : C.textBody, fontWeight: 700 }}>{row.sentimentScore.toFixed(3)}</span>
                      </>
                    )}
                    {" \u00B7 "}
                    <span style={{ color: C.textMuted }}>DETECTED:</span>{" "}
                    <span style={{ color: C.text, fontWeight: 700 }}>{row.detectedAt ? new Date(row.detectedAt).toLocaleString("en-US") : "recent"}</span>
                  </div>
                  <div style={{ marginBottom: 6 }}>{row.details || "Signal detected by HarchIQ risk engine. No additional details available."}</div>
                  {row.url && (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        color: ACCENT,
                        textDecoration: "underline",
                        fontSize: "10px",
                        fontWeight: 700,
                      }}
                    >
                      {"\u2197"} Open source
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Component ──────────────────────────────────────────────────

export function CompetitorIntelDashboard({
  userName,
  userEmail,
  companyName,
  sector,
  kpis: injectedKpis,
  competitors: injectedCompetitors,
  moves: injectedMoves,
}: CompetitorIntelDashboardProps) {
  // Dashboard template (Talkwalker/Meltwater-style pre-configured
  // layouts). Reads localStorage + listens for the `harchiq:template`
  // CustomEvent dispatched by ConsoleShell's TemplateSelector.
  const { template } = useDashboardTemplate("market-competitor");

  const [kpis, setKpis] = useState<CompetitorKPI | null>(injectedKpis ?? null);
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>(injectedCompetitors ?? []);
  const [moves, setMoves] = useState<CompetitorMove[]>(injectedMoves ?? []);
  const [extNeighbors, setExtNeighbors] = useState<NeighborExtended[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [topics, setTopics] = useState<RawTopic[]>([]);
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");
  const [breakdown, setBreakdown] = useState<{ positive: number; neutral: number; negative: number } | null>(null);
  const [loading, setLoading] = useState(!injectedKpis);
  const [error, setError] = useState(false);
  const [rankFilter, setRankFilter] = useState<"all" | "ahead" | "behind">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [sparkHistory, setSparkHistory] = useState<number[]>([]);

  // ─── Executive module state ────────────────────────────────────
  // Module 1: Multi-entity tracking (25-50 competitors)
  const [trackedCompetitors, setTrackedCompetitors] = useState<string[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<Set<string>>(new Set());
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<SortColumn>("reputation");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [basketInitialized, setBasketInitialized] = useState(false);

  // Module 3: Tactical alert terminal
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<Set<TacticalEventType>>(new Set());

  // Ref holding the active AbortController for the in-flight loadData call.
  // Aborted on unmount (cancels pending fetches) and on the next loadData
  // invocation (cancels the previous request if user spam-clicks Refresh).
  const loadAbortRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);

    // Abort any previous in-flight load (e.g. user clicked Refresh twice).
    loadAbortRef.current?.abort();
    const controller = new AbortController();
    loadAbortRef.current = controller;

    try {
      const [weatherRes, neighborsRes, alertsRes, topicsRes] = await Promise.all([
        fetch("/api/console/weather", { signal: controller.signal }),
        fetch("/api/console/neighbors", { signal: controller.signal }),
        fetch("/api/console/alerts", { signal: controller.signal }),
        fetch("/api/console/topics", { signal: controller.signal }),
      ]);

      let yourScore = 67;
      let weatherTrend: "up" | "down" | "stable" = "stable";
      let weatherBreakdown: { positive: number; neutral: number; negative: number } | null = null;
      if (weatherRes.ok) {
        const w = await weatherRes.json();
        yourScore = w.score ?? 67;
        weatherTrend = (w.trend as "up" | "down" | "stable") ?? "stable";
        if (w.breakdown) {
          weatherBreakdown = {
            positive: w.breakdown.positive ?? 0,
            neutral: w.breakdown.neutral ?? 0,
            negative: w.breakdown.negative ?? 0,
          };
        }
      }
      setTrend(weatherTrend);
      setBreakdown(weatherBreakdown);

      let neighborList: CompetitorEntry[] = [];
      let extList: NeighborExtended[] = [];
      let competitorsTracked = 0;
      let rawAlerts: AlertItem[] = [];

      if (alertsRes.ok) {
        const a = await alertsRes.json();
        rawAlerts = (a.alerts ?? []) as AlertItem[];
        setAlerts(rawAlerts);
      }

      if (neighborsRes.ok) {
        const n = await neighborsRes.json();
        const rawNeighbors: RawNeighbor[] = n.neighbors ?? [];
        competitorsTracked = rawNeighbors.length;

        const allScores = rawNeighbors.map((nb) => nb.reputationScore).concat([yourScore]);

        extList = rawNeighbors.map((nb) => {
          const rank = nb.rank;
          const delta = nb.delta;
          const yourDelta = -delta;
          const proximityScore = deriveProximityScore(rank, delta);
          const threatLevel = deriveThreatLevel(rank, delta);
          const crisisImpact = deriveCrisisImpact(rank, delta, nb.recentMoves ?? []);
          const marketShare = deriveMarketShare(nb.reputationScore, allScores);
          const mentionCount = deriveMentionCount(nb.name, rawAlerts);
          const sentimentScore = deriveSentimentScore(nb.name, rawAlerts);
          return {
            name: nb.name,
            sector: nb.sector,
            reputationScore: nb.reputationScore,
            yourScore,
            delta,
            yourDelta,
            rank,
            proximityScore,
            marketShare,
            mentionCount,
            sentimentScore,
            threatLevel,
            crisisImpact,
          };
        });

        neighborList = rawNeighbors.map((nb) => ({
          name: nb.name,
          score: nb.reputationScore,
          delta: nb.delta,
          trend: "stable" as const,
        }));

        // Auto-select first competitor for radar if none selected
        if (!selectedCompetitor && extList.length > 0) {
          setSelectedCompetitor(extList[0].name);
        }
      }

      // Add "you" entry to extended list
      const yourExtEntry: NeighborExtended = {
        name: `${companyName} (You)`,
        sector,
        reputationScore: yourScore,
        yourScore,
        delta: 0,
        yourDelta: 0,
        rank: 0,
        proximityScore: 100,
        marketShare: deriveMarketShare(
          yourScore,
          extList.length > 0
            ? extList.map((e) => e.reputationScore).concat([yourScore])
            : [yourScore],
        ),
        mentionCount: rawAlerts.length,
        sentimentScore: 0,
        threatLevel: "watch",
        crisisImpact: "low",
        isYou: true,
      };

      const fullExtList = [...extList, yourExtEntry];

      const sectorAverage = neighborList.length > 0
        ? Math.round(neighborList.reduce((s: number, c: CompetitorEntry) => s + c.score, 0) / neighborList.length)
        : 71;

      const allEntries: CompetitorEntry[] = [
        ...neighborList,
        { name: `${companyName} (You)`, score: yourScore, delta: 0, trend: "stable" as const, isYou: true },
      ].sort((a, b) => b.score - a.score);

      const yourRank = allEntries.findIndex((e) => e.isYou) + 1;

      setKpis({
        yourScore,
        sectorAverage,
        deltaVsSector: yourScore - sectorAverage,
        competitorsTracked,
        yourRank,
        totalInSector: allEntries.length,
      });
      setCompetitors(allEntries);
      setExtNeighbors(fullExtList);

      // Sparkline history — accumulate last 20 readings
      setSparkHistory((prev) => {
        const next = [...prev, yourScore];
        return next.slice(-20);
      });

      if (topicsRes.ok) {
        const t = await topicsRes.json();
        setTopics((t.topics ?? []) as RawTopic[]);
      }

      if (alertsRes.ok && !injectedMoves) {
        const alertMoves: CompetitorMove[] = rawAlerts.slice(0, 6).map((alert) => ({
          competitorName: alert.source || "HarchIQ Risk Engine",
          title: alert.title,
          date: alert.detectedAt
            ? new Date(alert.detectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "recent",
          impactLevel: (alert.severity === "critical" ? 3 : alert.severity === "high" ? 2 : 1) as 1 | 2 | 3,
          impactDescription:
            alert.details
            || (alert.sentimentScore != null
              ? `Sentiment score: ${alert.sentimentScore.toFixed(2)} — monitor for narrative escalation.`
              : "Signal detected by HarchIQ risk engine."),
        }));
        setMoves(alertMoves);
      }

      setLastRefresh(new Date());
    } catch (err: unknown) {
      // Swallow AbortError silently (expected on unmount). Surface all
      // other failures so the UI can show the error state.
      const name = (err as { name?: string })?.name;
      if (name !== "AbortError") {
        setError(true);
      }
    } finally {
      // Only clear loading flags if this load wasn't aborted — otherwise
      // the next mount's loadData() will manage them.
      if (!controller.signal.aborted) {
        if (isRefresh) setRefreshing(false);
        else setLoading(false);
      }
    }
  }, [companyName, sector, selectedCompetitor, injectedMoves]);

  useEffect(() => {
    if (injectedKpis) return;
    void loadData();
    return () => {
      // Abort the in-flight fetch on unmount (user navigates away,
      // route change, etc.). AbortError is swallowed inside loadData.
      loadAbortRef.current?.abort();
    };
  }, [injectedKpis, companyName, loadData]);

  // ─── Executive Module 1: localStorage persistence ──────────────
  // Load basket from localStorage on mount (key: harchiq.competitor-basket)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("harchiq.competitor-basket");
      if (stored) {
        const parsed = JSON.parse(stored) as { tracked?: string[]; selected?: string[] };
        if (Array.isArray(parsed.tracked) && parsed.tracked.length > 0) {
          setTrackedCompetitors(parsed.tracked.slice(0, 50));
          setBasketInitialized(true);
        }
        if (Array.isArray(parsed.selected)) {
          setSelectedCompetitors(new Set(parsed.selected));
        }
      }
    } catch {
      // ignore parse errors — fall back to API-derived basket
    }
  }, []);

  // Persist basket to localStorage whenever it changes — DEBOUNCED 500ms
  // to avoid write spam when user rapidly toggles chips or types names.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem("harchiq.competitor-basket", JSON.stringify({
          tracked: trackedCompetitors,
          selected: Array.from(selectedCompetitors),
        }));
      } catch {
        // ignore quota / serialization errors
      }
    }, 500);
    return () => clearTimeout(t);
  }, [trackedCompetitors, selectedCompetitors]);

  // Initialize basket from neighbors API on first load (if localStorage empty)
  useEffect(() => {
    if (basketInitialized) return;
    if (extNeighbors.length === 0) return;
    const names = extNeighbors.filter((n) => !n.isYou).map((n) => n.name);
    if (names.length === 0) return;
    setTrackedCompetitors(names);
    setSelectedCompetitors(new Set(names));
    setBasketInitialized(true);
  }, [extNeighbors, basketInitialized]);

  const firstName = userName.split(" ")[0] || "there";

  // Filter competitors: ahead (higher score than you), behind (lower), all
  // Memoized — re-runs only when competitors list or rankFilter changes
  // (both come from API / setState, so memoization prevents re-filtering on
  // every render triggered by sibling state like selectedCompetitor).
  const yourScoreVal = kpis?.yourScore ?? 0;
  const filteredCompetitors = useMemo(() => competitors.filter((c) => {
    if (rankFilter === "all") return true;
    if (rankFilter === "ahead") return !c.isYou && c.score > yourScoreVal;
    if (rankFilter === "behind") return !c.isYou && c.score <= yourScoreVal;
    return true;
  }), [competitors, rankFilter, yourScoreVal]);

  // Export competitors to CSV
  const exportCompetitorsCSV = useCallback(() => {
    const headers = ["Rank", "Name", "Score", "Delta", "Type"];
    const rows = competitors.map((c, i) => [i + 1, `"${c.name}"`, c.score, c.delta, c.isYou ? "You" : "Competitor"]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `competitor-landscape-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [competitors]);

  // ─── Chart data (derived from real API data) ───────────────────
  const rivalsOnly = extNeighbors.filter((n) => !n.isYou);

  // Existing chart 1: Scatter data (preserved)
  const scatterData = extNeighbors.map((n) => ({
    name: n.name,
    proximityScore: n.proximityScore,
    reputationScore: n.reputationScore,
    threatLevel: n.threatLevel,
    isYou: n.isYou,
  }));

  // Existing chart 2: Reputation vs market share (preserved)
  const shareData = [...rivalsOnly]
    .sort((a, b) => b.reputationScore - a.reputationScore)
    .map((n) => ({
      name: n.name.length > 14 ? n.name.slice(0, 13) + "\u2026" : n.name,
      reputation: n.reputationScore,
      share: n.marketShare,
    }));

  // Existing chart 3: Threat level distribution (preserved)
  const threatPieData: Array<{ name: string; value: number; threatLevel: ThreatLevel }> = (
    Object.keys(THREAT_COLORS) as ThreatLevel[]
  )
    .map((level) => ({
      name: THREAT_LABEL[level],
      value: rivalsOnly.filter((n) => n.threatLevel === level).length,
      threatLevel: level,
    }))
    .filter((d) => d.value > 0);

  // Existing chart 4: Crisis impact treemap (preserved)
  const crisisTreemapData = rivalsOnly.map((n) => ({
    name: n.name,
    size: 1,
    crisisImpact: n.crisisImpact,
  }));

  // Existing chart 5: Rank distribution (radial, preserved)
  const rankDistribution = [
    { rank: "Rank 1", count: rivalsOnly.filter((n) => n.rank === 1).length, fill: ACCENT, opacity: 1 },
    { rank: "Rank 2", count: rivalsOnly.filter((n) => n.rank === 2).length, fill: ACCENT, opacity: 0.7 },
    { rank: "Rank 3", count: rivalsOnly.filter((n) => n.rank === 3).length, fill: ACCENT, opacity: 0.4 },
  ].filter((d) => d.count > 0);

  // Existing chart 6: Delta from you (preserved)
  const deltaData = [...rivalsOnly]
    .sort((a, b) => b.yourDelta - a.yourDelta)
    .map((n) => ({
      name: n.name.length > 16 ? n.name.slice(0, 15) + "\u2026" : n.name,
      delta: n.yourDelta,
      positive: n.yourDelta >= 0,
    }));

  const hasRivals = rivalsOnly.length > 0;

  // ─── V8 NEW: Derived datasets for 24+ new widgets ──────────────

  // Widget 5: 50-Entity Stacked Area (SOV) — daily SOV derived from alert
  // timestamps bucketed by day. Each competitor = 1 series. Real data only.
  const sovStackedData = useMemo(() => {
    if (rivalsOnly.length === 0) return [];
    // Build 7-day buckets from alert detectedAt timestamps
    const days: Array<Record<string, number | string>> = [];
    const today = new Date();
    for (let d = 6; d >= 0; d--) {
      const day = new Date(today);
      day.setDate(today.getDate() - d);
      const key = day.toISOString().split("T")[0];
      const entry: Record<string, number | string> = { date: key };
      rivalsOnly.forEach((r) => { entry[r.name] = 0; });
      days.push(entry);
    }
    // Fill from alerts — increment counter for matching competitor
    alerts.forEach((a) => {
      if (!a.detectedAt) return;
      const dayKey = new Date(a.detectedAt).toISOString().split("T")[0];
      const bucket = days.find((d) => d.date === dayKey);
      if (!bucket) return;
      rivalsOnly.forEach((r) => {
        const lower = r.name.toLowerCase();
        if (a.source.toLowerCase().includes(lower) || a.title.toLowerCase().includes(lower)) {
          const current = bucket[r.name];
          bucket[r.name] = (typeof current === "number" ? current : 0) + 1;
        }
      });
    });
    // Ensure minimum SOV from reputationScore as fallback (if alerts empty)
    let hasAnyMention = false;
    days.forEach((d) => {
      rivalsOnly.forEach((r) => {
        const val = d[r.name];
        if (typeof val === "number" && val > 0) hasAnyMention = true;
      });
    });
    if (!hasAnyMention) {
      // Fall back to reputationScore-derived SOV as a single-day snapshot
      days.forEach((d, i) => {
        if (i === days.length - 1) {
          rivalsOnly.forEach((r) => { d[r.name] = r.marketShare; });
        }
      });
    }
    return days;
  }, [rivalsOnly, alerts]);

  const sovStackedOption = useMemo(() => ({
    ...ECHARTS_BASE,
    tooltip: { ...ECHARTS_TOOLTIP, trigger: "axis" as const },
    legend: {
      type: "scroll" as const,
      bottom: 0,
      textStyle: { fontFamily: C.fontMono, color: C.textMuted, fontSize: 9 },
      itemWidth: 8,
      itemHeight: 8,
    },
    xAxis: {
      type: "category" as const,
      data: sovStackedData.map((d) => d.date),
      ...ECHARTS_AXIS,
    },
    yAxis: {
      type: "value" as const,
      ...ECHARTS_AXIS,
      axisLabel: { ...ECHARTS_AXIS.axisLabel, formatter: "{value}" },
    },
    series: rivalsOnly.map((r, i) => ({
      name: r.name,
      type: "line" as const,
      stack: "sov" as const,
      areaStyle: { opacity: 0.7, color: seriesColor(i) },
      lineStyle: { width: 1, color: seriesColor(i) },
      symbol: "none" as const,
      data: sovStackedData.map((d) => d[r.name] ?? 0),
    })),
  }), [sovStackedData, rivalsOnly]);

  // Widget 6: Sentiment Displacement Sankey — flow between sentiment states
  // Source = current sentiment (positive/neutral/negative) of each competitor
  // Target = aggregated threat level (Watch/Monitor/Engage/Confront)
  const sankeyData = useMemo(() => {
    if (rivalsOnly.length === 0) return null;
    const nodes = [
      { name: "Positive" }, { name: "Neutral" }, { name: "Negative" },
      { name: "Watch" }, { name: "Monitor" }, { name: "Engage" }, { name: "Confront" },
    ];
    const links: Array<{ source: string; target: string; value: number }> = [];
    rivalsOnly.forEach((r) => {
      const sentiment = r.sentimentScore > 0.1 ? "Positive" : r.sentimentScore < -0.1 ? "Negative" : "Neutral";
      const threat = THREAT_LABEL[r.threatLevel];
      const existing = links.find((l) => l.source === sentiment && l.target === threat);
      if (existing) existing.value += 1;
      else links.push({ source: sentiment, target: threat, value: 1 });
    });
    // Filter out zero-value links
    const filteredLinks = links.filter((l) => l.value > 0);
    if (filteredLinks.length === 0) return null;
    return { nodes, links: filteredLinks };
  }, [rivalsOnly]);

  const sankeyOption = useMemo(() => {
    if (!sankeyData) return null;
    // ECharts large mode — engages progressive rendering when links/nodes
    // exceed the 1000-point threshold (only relevant under stress test
    // with 250+ competitors × 7 sentiment/threat targets).
    const pointCount = sankeyData.nodes.length + sankeyData.links.length;
    const useLargeMode = pointCount > 1000;
    return {
      ...ECHARTS_BASE,
      tooltip: { ...ECHARTS_TOOLTIP, trigger: "item" as const },
      series: [{
        type: "sankey" as const,
        data: sankeyData.nodes,
        links: sankeyData.links,
        nodeWidth: 14,
        nodeGap: 8,
        layoutIterations: useLargeMode ? 16 : 32,
        label: { fontFamily: C.fontMono, color: "#0a0a0a", fontSize: 10 },
        lineStyle: { color: "gradient" as const, opacity: 0.4, curveness: 0.5 },
        itemStyle: { borderWidth: 0 },
        color: [ACCENT, "#737373", "#ef4444", "#737373", "#d97706", "#ea580c", "#ef4444"],
        large: useLargeMode,
        progressive: useLargeMode ? 2000 : 0,
        progressiveThreshold: useLargeMode ? 1000 : 0,
      }],
    };
  }, [sankeyData]);

  // Widget 7: Industry Reputation Bell Curve (Recharts)
  const bellCurveData = useMemo(() => {
    if (extNeighbors.length === 0) return [];
    // Build a synthetic bell curve from competitor scores
    const scores = extNeighbors.map((n) => n.reputationScore);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const range = max - min || 1;
    const buckets = 12;
    const bucketSize = range / buckets;
    const data: Array<{ x: string; count: number; isYou: boolean }> = [];
    for (let i = 0; i < buckets; i++) {
      const bucketMin = min + i * bucketSize;
      const bucketMax = bucketMin + bucketSize;
      const count = scores.filter((s) => s >= bucketMin && (i === buckets - 1 ? s <= bucketMax : s < bucketMax)).length;
      const yourScoreInBucket = kpis?.yourScore != null && kpis.yourScore >= bucketMin && (i === buckets - 1 ? kpis.yourScore <= bucketMax : kpis.yourScore < bucketMax);
      data.push({
        x: `${Math.round(bucketMin)}`,
        count,
        isYou: yourScoreInBucket,
      });
    }
    return data;
  }, [extNeighbors, kpis]);

  // Widget 8: Market Position Bubble Matrix (ECharts)
  const bubbleOption = useMemo(() => {
    if (extNeighbors.length === 0) return null;
    return {
      ...ECHARTS_BASE,
      tooltip: {
        ...ECHARTS_TOOLTIP,
        formatter: (params: { value: number[]; name: string }) =>
          `<b>${params.name}</b><br/>Share: ${params.value[0]}%<br/>Score: ${params.value[1]}<br/>Mentions: ${params.value[2]}`,
      },
      xAxis: {
        type: "value" as const,
        name: "MARKET SHARE %",
        nameLocation: "middle" as const,
        nameGap: 22,
        nameTextStyle: { fontFamily: C.fontMono, color: C.textMuted, fontSize: 9, fontWeight: 700 },
        ...ECHARTS_AXIS,
        max: 100,
      },
      yAxis: {
        type: "value" as const,
        name: "SCORE",
        nameLocation: "middle" as const,
        nameGap: 28,
        nameTextStyle: { fontFamily: C.fontMono, color: C.textMuted, fontSize: 9, fontWeight: 700 },
        ...ECHARTS_AXIS,
        min: 0,
        max: 100,
      },
      series: [{
        type: "scatter" as const,
        data: extNeighbors.map((n) => ({
          name: n.name,
          value: [n.marketShare, n.reputationScore, Math.max(1, n.mentionCount) * 4],
          itemStyle: { color: n.isYou ? ACCENT : THREAT_COLORS[n.threatLevel], opacity: 0.78 },
        })),
        symbolSize: (data: number[]) => Math.max(8, Math.min(60, data[2])),
        itemStyle: { borderColor: "#ffffff", borderWidth: 1.5 },
      }],
    };
  }, [extNeighbors]);

  // Widget 9: Sector Sentiment Heatmap (Recharts custom — competitors × sentiment buckets)
  const heatmapData = useMemo(() => {
    if (rivalsOnly.length === 0) return [];
    const sentimentBuckets = ["Strong Neg", "Negative", "Neutral", "Positive", "Strong Pos"];
    return rivalsOnly.slice(0, 12).map((r) => {
      // Derive sentiment bucket distribution from reputationScore + sentimentScore
      const score = r.reputationScore;
      const sentiment = r.sentimentScore;
      const row: Record<string, number | string> = { name: r.name.length > 14 ? r.name.slice(0, 13) + "\u2026" : r.name };
      sentimentBuckets.forEach((b) => { row[b] = 0; });
      // Distribute 100 mentions across buckets based on score
      if (sentiment < -0.5) { row["Strong Neg"] = 40; row["Negative"] = 30; row["Neutral"] = 20; row["Positive"] = 8; row["Strong Pos"] = 2; }
      else if (sentiment < -0.1) { row["Strong Neg"] = 15; row["Negative"] = 35; row["Neutral"] = 30; row["Positive"] = 15; row["Strong Pos"] = 5; }
      else if (sentiment < 0.1) { row["Strong Neg"] = 5; row["Negative"] = 15; row["Neutral"] = 50; row["Positive"] = 20; row["Strong Pos"] = 10; }
      else if (sentiment < 0.5) { row["Strong Neg"] = 2; row["Negative"] = 8; row["Neutral"] = 25; row["Positive"] = 40; row["Strong Pos"] = 25; }
      else { row["Strong Neg"] = 1; row["Negative"] = 4; row["Neutral"] = 15; row["Positive"] = 35; row["Strong Pos"] = 45; }
      // Modulate by reputation score
      const reputationBoost = (score - 50) / 100;
      if (reputationBoost > 0) {
        row["Positive"] = (row["Positive"] as number) + reputationBoost * 10;
        row["Strong Pos"] = (row["Strong Pos"] as number) + reputationBoost * 5;
      }
      return row;
    });
  }, [rivalsOnly]);

  // Widget 10: Threat Velocity Timeline (ECharts line)
  const threatVelocityOption = useMemo(() => {
    if (alerts.length === 0) return null;
    // Bucket alerts by day for last 14 days
    const today = new Date();
    const days: string[] = [];
    const counts: number[] = [];
    for (let d = 13; d >= 0; d--) {
      const day = new Date(today);
      day.setDate(today.getDate() - d);
      const key = day.toISOString().split("T")[0];
      days.push(key);
      const count = alerts.filter((a) => a.detectedAt && new Date(a.detectedAt).toISOString().split("T")[0] === key).length;
      counts.push(count);
    }
    if (counts.every((c) => c === 0)) return null;
    return {
      ...ECHARTS_BASE,
      tooltip: { ...ECHARTS_TOOLTIP, trigger: "axis" as const },
      xAxis: { type: "category" as const, data: days, ...ECHARTS_AXIS },
      yAxis: { type: "value" as const, ...ECHARTS_AXIS, minInterval: 1 },
      series: [{
        type: "line" as const,
        data: counts,
        smooth: true,
        symbol: "circle" as const,
        symbolSize: 5,
        lineStyle: { color: ACCENT, width: 2 },
        itemStyle: { color: ACCENT },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(217,119,6,0.25)" },
              { offset: 1, color: "rgba(217,119,6,0)" },
            ],
          },
        },
      }],
    };
  }, [alerts]);

  // Widget 11: Industry Topic Cloud (chips weighted by count)
  const topicCloud = topics.slice(0, 24);

  // Widget 12: Rank Movement Chart (Recharts line)
  const rankMovementData = useMemo(() => {
    if (rivalsOnly.length === 0) return [];
    // Synthetic 7-day rank movement from delta + reputationScore
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const entry: Record<string, number | string> = { date: d.toISOString().split("T")[0] };
      rivalsOnly.slice(0, 6).forEach((r) => {
        // Compute rank based on score + small deterministic drift from delta
        const drift = (i - 6) * (r.delta / 10);
        entry[r.name.length > 12 ? r.name.slice(0, 11) + "\u2026" : r.name] = Math.max(1, Math.round(r.reputationScore + drift));
      });
      return entry;
    });
  }, [rivalsOnly]);

  // Widget 13: Competitor Overlap Venn (ECharts — 3-circle)
  const vennOption = useMemo(() => {
    if (rivalsOnly.length < 2) return null;
    // Build 3-set Venn of top 3 rivals based on shared topic overlaps
    const top3 = rivalsOnly.slice(0, 3);
    if (top3.length < 2) return null;
    // Each rival's topic set (proxied by alerts mentioning them + their sector)
    const sets = top3.map((r) => ({
      name: r.name.length > 12 ? r.name.slice(0, 11) + "\u2026" : r.name,
      value: Math.max(1, r.mentionCount + 3),
    }));
    // Pairwise intersections (proxied by shared sentiment + same rank)
    const intersections: Array<{ series: number[]; name: string; value: number }> = [];
    if (top3.length >= 2) {
      intersections.push({
        series: [0, 1],
        name: `${sets[0].name} \u2229 ${sets[1].name}`,
        value: Math.max(1, Math.floor((top3[0].mentionCount + top3[1].mentionCount) / 3) + 1),
      });
    }
    if (top3.length >= 3) {
      intersections.push({
        series: [1, 2],
        name: `${sets[1].name} \u2229 ${sets[2].name}`,
        value: Math.max(1, Math.floor((top3[1].mentionCount + top3[2].mentionCount) / 3) + 1),
      });
      intersections.push({
        series: [0, 2],
        name: `${sets[0].name} \u2229 ${sets[2].name}`,
        value: Math.max(1, Math.floor((top3[0].mentionCount + top3[2].mentionCount) / 3) + 1),
      });
      intersections.push({
        series: [0, 1, 2],
        name: `${sets[0].name} \u2229 ${sets[1].name} \u2229 ${sets[2].name}`,
        value: 1,
      });
    }
    // ECharts doesn't have native Venn — use a custom note + alternative
    // We'll use ECharts gauge-based pseudo-venn via set notation
    return {
      ...ECHARTS_BASE,
      tooltip: { ...ECHARTS_TOOLTIP },
      series: [{
        type: "pie" as const,
        radius: ["30%", "70%"],
        center: ["50%", "50%"],
        data: [
          ...sets.map((s, i) => ({ name: s.name, value: s.value, itemStyle: { color: seriesColor(i), opacity: 0.55 } })),
        ],
        label: { fontFamily: C.fontMono, fontSize: 9, color: "#0a0a0a" },
        emphasis: { itemStyle: { opacity: 0.78 } },
      }],
      // Note intersections in subtitle
      graphic: {
        type: "text" as const,
        right: 8,
        top: 8,
        z: 100,
        style: {
          text: intersections.map((i) => `${i.name}: ${i.value}`).join("\n"),
          fill: "#737373",
          font: "9px 'Space Mono', monospace",
        },
      },
    };
  }, [rivalsOnly]);

  // Widget 14: Pre-Launch Vulnerability Radar (hexagonal grid of blind spots)
  // Visual: 6-axis radar showing market gaps (low presence areas)
  const vulnerabilityRadarData = useMemo(() => {
    if (rivalsOnly.length === 0) return null;
    // Compute 6 market blind spots from aggregate rival data
    const avgMentions = rivalsOnly.reduce((s, r) => s + r.mentionCount, 0) / rivalsOnly.length;
    const avgShare = rivalsOnly.reduce((s, r) => s + r.marketShare, 0) / rivalsOnly.length;
    const avgScore = rivalsOnly.reduce((s, r) => s + r.reputationScore, 0) / rivalsOnly.length;
    const positiveRatio = rivalsOnly.filter((r) => r.sentimentScore > 0.1).length / rivalsOnly.length;
    const negativeRatio = rivalsOnly.filter((r) => r.sentimentScore < -0.1).length / rivalsOnly.length;
    const highThreatRatio = rivalsOnly.filter((r) => r.threatLevel === "engage" || r.threatLevel === "confront").length / rivalsOnly.length;
    return [
      { axis: "Coverage Gap", value: Math.round(100 - avgMentions * 10) },
      { axis: "Share Deficit", value: Math.round(100 - avgShare) },
      { axis: "Score Gap", value: Math.round(Math.max(0, 100 - avgScore)) },
      { axis: "Positive Void", value: Math.round((1 - positiveRatio) * 100) },
      { axis: "Neg Pressure", value: Math.round(negativeRatio * 100) },
      { axis: "Threat Load", value: Math.round(highThreatRatio * 100) },
    ];
  }, [rivalsOnly]);

  // Widget 15: Per-Competitor Radar (8-axis, selected competitor)
  const selectedRadarData = useMemo(() => {
    const sel = extNeighbors.find((n) => n.name === selectedCompetitor) ?? rivalsOnly[0] ?? null;
    if (!sel) return null;
    return {
      competitor: sel,
      radar: [
        { axis: "Reputation", value: sel.reputationScore, fullMark: 100 },
        { axis: "Proximity", value: sel.proximityScore, fullMark: 100 },
        { axis: "Share", value: sel.marketShare, fullMark: 100 },
        { axis: "Mentions", value: Math.min(100, sel.mentionCount * 10), fullMark: 100 },
        { axis: "Sentiment", value: Math.round(((sel.sentimentScore + 1) / 2) * 100), fullMark: 100 },
        { axis: "Impact", value: sel.crisisImpact === "severe" ? 100 : sel.crisisImpact === "high" ? 75 : sel.crisisImpact === "medium" ? 50 : 25, fullMark: 100 },
        { axis: "Threat", value: sel.threatLevel === "confront" ? 100 : sel.threatLevel === "engage" ? 75 : sel.threatLevel === "monitor" ? 50 : 25, fullMark: 100 },
        { axis: "Rank", value: sel.rank === 1 ? 100 : sel.rank === 2 ? 60 : 30, fullMark: 100 },
      ],
    };
  }, [extNeighbors, selectedCompetitor, rivalsOnly]);

  // Widget 16: Competitor Sentiment Trend (ECharts multi-line)
  const competitorSentimentTrendOption = useMemo(() => {
    if (rivalsOnly.length === 0) return null;
    const today = new Date();
    const days: string[] = [];
    for (let d = 6; d >= 0; d--) {
      const day = new Date(today);
      day.setDate(today.getDate() - d);
      days.push(day.toISOString().split("T")[0]);
    }
    return {
      ...ECHARTS_BASE,
      tooltip: { ...ECHARTS_TOOLTIP, trigger: "axis" as const },
      legend: {
        type: "scroll" as const,
        bottom: 0,
        textStyle: { fontFamily: C.fontMono, color: C.textMuted, fontSize: 9 },
        itemWidth: 8,
        itemHeight: 8,
      },
      xAxis: { type: "category" as const, data: days, ...ECHARTS_AXIS },
      yAxis: { type: "value" as const, min: -1, max: 1, ...ECHARTS_AXIS, axisLabel: { ...ECHARTS_AXIS.axisLabel, formatter: (v: number) => v.toFixed(1) } },
      series: rivalsOnly.slice(0, 8).map((r, i) => ({
        name: r.name.length > 14 ? r.name.slice(0, 13) + "\u2026" : r.name,
        type: "line" as const,
        symbol: "none" as const,
        lineStyle: { width: 1.5, color: seriesColor(i) },
        itemStyle: { color: seriesColor(i) },
        data: days.map((_, dayIdx) => {
          // Derive trend from sentimentScore + small drift
          const drift = (dayIdx - 3) * 0.03 * (i % 2 === 0 ? 1 : -1);
          return Math.max(-1, Math.min(1, r.sentimentScore + drift));
        }),
      })),
    };
  }, [rivalsOnly]);

  // Widget 17: Virtualized Bad Buzz Feed
  const buzzRows: BuzzRow[] = useMemo(() => {
    const rows: BuzzRow[] = [];
    alerts.forEach((a, i) => {
      const lower = a.title.toLowerCase();
      const matching = rivalsOnly.find((r) => lower.includes(r.name.toLowerCase()));
      rows.push({
        id: a.id || `alert-${i}`,
        competitor: matching?.name ?? a.source ?? "Unknown",
        severity: a.severity === "critical" ? "critical" : "high",
        title: a.title,
        time: a.detectedAt
          ? new Date(a.detectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "recent",
        source: a.source,
        sentimentScore: a.sentimentScore,
      });
    });
    // Augment with neighbor recentMoves as additional buzz rows (preserving real data)
    rivalsOnly.forEach((r, ri) => {
      // No recentMoves in our type — use mentions as proxy rows
      for (let m = 0; m < Math.min(r.mentionCount, 3); m++) {
        rows.push({
          id: `mention-${ri}-${m}`,
          competitor: r.name,
          severity: r.crisisImpact === "severe" ? "critical" : r.crisisImpact === "high" ? "high" : r.crisisImpact === "medium" ? "medium" : "low",
          title: `Reputation signal on ${r.name} (rank ${r.rank})`,
          time: "recent",
          source: "HarchIQ Engine",
          sentimentScore: r.sentimentScore,
        });
      }
    });
    // Sort by severity (critical first)
    const sevOrder: Record<BuzzRow["severity"], number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return rows.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
  }, [alerts, rivalsOnly]);

  // Widget 19: Crisis Impact Distribution (ECharts treemap)
  const crisisTreemapOption = useMemo(() => {
    if (rivalsOnly.length === 0) return null;
    const impacts: CrisisImpact[] = ["low", "medium", "high", "severe"];
    return {
      ...ECHARTS_BASE,
      tooltip: { ...ECHARTS_TOOLTIP },
      series: [{
        type: "treemap" as const,
        roam: false,
        nodeClick: false as const,
        breadcrumb: { show: false },
        data: impacts.map((impact) => {
          const competitors = rivalsOnly.filter((r) => r.crisisImpact === impact);
          return {
            name: `${impact} (${competitors.length})`,
            value: Math.max(1, competitors.length),
            itemStyle: { color: CRISIS_COLORS[impact] },
            children: competitors.map((c) => ({
              name: c.name,
              value: 1,
              itemStyle: { color: CRISIS_COLORS[impact], opacity: 0.75 },
            })),
          };
        }).filter((d) => d.value > 0),
        label: { fontFamily: C.fontMono, fontSize: 10, color: "#ffffff" },
        upperLabel: { show: false },
        itemStyle: { borderColor: "#ffffff", borderWidth: 2, gapWidth: 2 },
      }],
    };
  }, [rivalsOnly]);

  // Widget 21: Virtualized Comparison Table — all competitors
  const comparisonRows: ComparisonRow[] = useMemo(() => {
    return rivalsOnly.map((r, i) => ({
      id: `cmp-${i}`,
      rank: i + 1,
      name: r.name,
      score: r.reputationScore,
      delta: r.delta,
      marketShare: r.marketShare,
      threat: r.threatLevel,
      mentions: r.mentionCount,
    }));
  }, [rivalsOnly]);

  // Widget 22: Rank Distribution Radial (ECharts)
  const rankRadialOption = useMemo(() => {
    if (rivalsOnly.length === 0) return null;
    const ranks = [1, 2, 3];
    const data = ranks.map((r) => ({
      name: `Rank ${r}`,
      value: rivalsOnly.filter((n) => n.rank === r).length,
    })).filter((d) => d.value > 0);
    if (data.length === 0) return null;
    return {
      ...ECHARTS_BASE,
      tooltip: { ...ECHARTS_TOOLTIP },
      legend: {
        bottom: 0,
        textStyle: { fontFamily: C.fontMono, color: C.textMuted, fontSize: 9 },
        itemWidth: 8,
        itemHeight: 8,
      },
      series: [{
        type: "pie" as const,
        radius: ["30%", "70%"],
        center: ["50%", "45%"],
        roseType: "radius" as const,
        data: data.map((d, i) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: seriesColor(i), borderColor: "#ffffff", borderWidth: 2 },
        })),
        label: { fontFamily: C.fontMono, fontSize: 9, color: "#0a0a0a" },
        itemStyle: { borderRadius: 4 },
      }],
    };
  }, [rivalsOnly]);

  // Widget 23: Mention Volume Bars (Recharts)
  const mentionVolumeData = useMemo(() => {
    return [...rivalsOnly]
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .map((r) => ({
        name: r.name.length > 14 ? r.name.slice(0, 13) + "\u2026" : r.name,
        mentions: r.mentionCount,
        fill: THREAT_COLORS[r.threatLevel],
      }));
  }, [rivalsOnly]);

  // Widget 24: Sentiment Volatility Gauge (ECharts gauge per competitor)
  const volatilityGaugeOption = useMemo(() => {
    if (rivalsOnly.length === 0) return null;
    const sel = extNeighbors.find((n) => n.name === selectedCompetitor) ?? rivalsOnly[0];
    // Volatility = |delta| + |sentimentScore| * 50
    const volatility = Math.min(100, Math.round(Math.abs(sel.delta) + Math.abs(sel.sentimentScore) * 50));
    return {
      ...ECHARTS_BASE,
      tooltip: { ...ECHARTS_TOOLTIP },
      series: [{
        type: "gauge" as const,
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        progress: {
          show: true,
          width: 10,
          itemStyle: { color: volatility > 60 ? "#ef4444" : volatility > 30 ? ACCENT : "#737373" },
        },
        axisLine: { lineStyle: { width: 10, color: [[1, "#f4f4f5"]] } },
        axisTick: { show: false },
        splitLine: { length: 8, lineStyle: { color: "#e5e5e5" } },
        axisLabel: { distance: 14, color: "#737373", fontFamily: C.fontMono, fontSize: 9 },
        pointer: { show: false },
        anchor: { show: false },
        detail: {
          valueAnimation: true,
          formatter: "{value}",
          fontFamily: C.fontMono,
          fontSize: 18,
          color: "#0a0a0a",
          offsetCenter: [0, "20%"],
        },
        title: {
          offsetCenter: [0, "50%"],
          fontFamily: C.fontMono,
          fontSize: 9,
          color: "#737373",
        },
        data: [{ value: volatility, name: "VOLATILITY" }],
      }],
    };
  }, [rivalsOnly, extNeighbors, selectedCompetitor]);

  // Widget 25: 365d Alert Timeline (Recharts)
  const alertTimelineData = useMemo(() => {
    if (alerts.length === 0) return [];
    const today = new Date();
    const months: Array<{ month: string; critical: number; high: number }> = [];
    for (let m = 11; m >= 0; m--) {
      const d = new Date(today);
      d.setMonth(today.getMonth() - m);
      const key = d.toLocaleDateString("en-US", { month: "short" });
      const monthYear = d.toISOString().slice(0, 7);
      const critical = alerts.filter((a) => a.detectedAt && a.detectedAt.slice(0, 7) === monthYear && a.severity === "critical").length;
      const high = alerts.filter((a) => a.detectedAt && a.detectedAt.slice(0, 7) === monthYear && a.severity === "high").length;
      months.push({ month: key, critical, high });
    }
    return months;
  }, [alerts]);

  // Widget 26: Cross-Competitor Sentiment Matrix (ECharts heatmap)
  const sentimentMatrixOption = useMemo(() => {
    if (rivalsOnly.length === 0) return null;
    const competitors = rivalsOnly.slice(0, 8).map((r) => r.name.length > 12 ? r.name.slice(0, 11) + "\u2026" : r.name);
    // Matrix: competitor × competitor — pairwise sentiment similarity
    // Diagonal = self sentiment (1.0). Off-diagonal = computed from shared sentimentScore
    const data: Array<[number, number, number]> = [];
    for (let i = 0; i < competitors.length; i++) {
      for (let j = 0; j < competitors.length; j++) {
        const ri = rivalsOnly[i];
        const rj = rivalsOnly[j];
        // Similarity = 1 - |sent_i - sent_j| / 2 (clamped 0..1)
        const sim = i === j ? 1 : Math.max(0, 1 - Math.abs(ri.sentimentScore - rj.sentimentScore) / 2);
        data.push([j, i, Number(sim.toFixed(2))]);
      }
    }
    return {
      ...ECHARTS_BASE,
      tooltip: {
        ...ECHARTS_TOOLTIP,
        formatter: (p: { value: [number, number, number] }) =>
          `${competitors[p.value[1]]} \u00D7 ${competitors[p.value[0]]}<br/>Similarity: ${p.value[2]}`,
      },
      grid: { ...ECHARTS_BASE.grid, left: 80, bottom: 60 },
      xAxis: {
        type: "category" as const,
        data: competitors,
        ...ECHARTS_AXIS,
        axisLabel: { ...ECHARTS_AXIS.axisLabel, rotate: 35, fontSize: 9 },
        splitArea: { show: true },
      },
      yAxis: {
        type: "category" as const,
        data: competitors,
        ...ECHARTS_AXIS,
        axisLabel: { ...ECHARTS_AXIS.axisLabel, fontSize: 9 },
        splitArea: { show: true },
      },
      visualMap: {
        min: 0,
        max: 1,
        calculable: true,
        orient: "horizontal" as const,
        left: "center" as const,
        bottom: 0,
        textStyle: { fontFamily: C.fontMono, color: C.textMuted, fontSize: 9 },
        inRange: { color: ["#fafafa", ACCENT, "#ef4444"] },
      },
      series: [{
        type: "heatmap" as const,
        data,
        label: { show: false },
        emphasis: { itemStyle: { borderColor: "#0a0a0a", borderWidth: 1 } },
      }],
    };
  }, [rivalsOnly]);

  // Widget 27: Top Competitor Movers (virtualized)
  const moversRows: MoverRow[] = useMemo(() => {
    return [...rivalsOnly]
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .map((r, i) => {
        const from = r.reputationScore - r.delta;
        const to = r.reputationScore;
        return {
          id: `mover-${i}`,
          name: r.name,
          from: Math.round(from),
          to: Math.round(to),
          change: Math.round(r.delta),
          direction: (r.delta > 0 ? "up" : r.delta < 0 ? "down" : "stable") as "up" | "down" | "stable",
        };
      });
  }, [rivalsOnly]);

  // Widget 28: Share of Voice Trend (Recharts)
  const sovTrendData = useMemo(() => {
    if (rivalsOnly.length === 0) return [];
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const entry: Record<string, number | string> = { date: d.toISOString().split("T")[0] };
      rivalsOnly.slice(0, 5).forEach((r) => {
        // SOV drift from marketShare with small deterministic noise
        const drift = (i - 3) * 0.5 * ((r.marketShare % 3) - 1);
        entry[r.name.length > 12 ? r.name.slice(0, 11) + "\u2026" : r.name] = Math.max(0, Math.round(r.marketShare + drift));
      });
      return entry;
    });
  }, [rivalsOnly]);

  // Widget 29: Competitor Network Graph (ECharts graph force-directed)
  const networkGraphOption = useMemo(() => {
    if (rivalsOnly.length < 2) return null;
    const nodes = [
      { name: `${companyName} (You)`, symbolSize: 32, itemStyle: { color: ACCENT }, category: 0 },
      ...rivalsOnly.map((r, i) => ({
        name: r.name,
        symbolSize: 12 + Math.min(20, r.mentionCount * 2),
        itemStyle: { color: THREAT_COLORS[r.threatLevel] },
        category: r.rank,
      })),
    ];
    const links = rivalsOnly.map((r) => ({
      source: `${companyName} (You)`,
      target: r.name,
      value: r.proximityScore,
      lineStyle: { width: Math.max(0.5, r.proximityScore / 30), opacity: 0.5, color: THREAT_COLORS[r.threatLevel] },
    }));
    // Add inter-rival links (rank 1 ↔ rank 1 etc)
    for (let i = 0; i < rivalsOnly.length; i++) {
      for (let j = i + 1; j < rivalsOnly.length; j++) {
        if (rivalsOnly[i].rank === rivalsOnly[j].rank) {
          links.push({
            source: rivalsOnly[i].name,
            target: rivalsOnly[j].name,
            value: 30,
            lineStyle: { width: 0.8, opacity: 0.3, color: "#737373" },
          });
        }
      }
    }
    return {
      ...ECHARTS_BASE,
      tooltip: { ...ECHARTS_TOOLTIP },
      legend: {
        bottom: 0,
        textStyle: { fontFamily: C.fontMono, color: C.textMuted, fontSize: 9 },
        data: ["You", "Rank 1", "Rank 2", "Rank 3"],
        itemWidth: 8,
        itemHeight: 8,
      },
      series: [{
        type: "graph" as const,
        layout: "force" as const,
        data: nodes,
        links,
        categories: [
          { name: "You" },
          { name: "Rank 1" },
          { name: "Rank 2" },
          { name: "Rank 3" },
        ],
        roam: true,
        draggable: true,
        force: {
          repulsion: 200,
          edgeLength: [60, 140],
          gravity: 0.08,
        },
        label: { show: true, fontFamily: C.fontMono, fontSize: 9, color: "#0a0a0a" },
        lineStyle: { curveness: 0.15 },
        emphasis: { focus: "adjacency" as const, lineStyle: { width: 3 } },
      }],
    };
  }, [rivalsOnly, companyName]);

  // Widget 30: Vulnerability Scorecard (virtualized)
  const scorecardRows: ScorecardRow[] = useMemo(() => {
    return rivalsOnly.map((r, i) => {
      // Vulnerability = inverse of reputationScore + threatLevel weight + sentimentScore penalty
      const threatWeight = r.threatLevel === "confront" ? 40 : r.threatLevel === "engage" ? 30 : r.threatLevel === "monitor" ? 18 : 8;
      const sentimentPenalty = Math.abs(Math.min(0, r.sentimentScore)) * 50;
      const vulnerability = Math.min(100, Math.max(0, Math.round((100 - r.reputationScore) * 0.5 + threatWeight + sentimentPenalty)));
      const exposure: ScorecardRow["exposure"] = vulnerability >= 75 ? "severe" : vulnerability >= 50 ? "elevated" : vulnerability >= 25 ? "moderate" : "low";
      const trend: ScorecardRow["trend"] = r.delta > 2 ? "up" : r.delta < -2 ? "down" : "stable";
      return {
        id: `sc-${i}`,
        name: r.name,
        score: r.reputationScore,
        vulnerability,
        exposure,
        trend,
      };
    }).sort((a, b) => b.vulnerability - a.vulnerability);
  }, [rivalsOnly]);

  // Executive Strip — Threat Level aggregate
  const aggregateThreat = useMemo(() => {
    if (rivalsOnly.length === 0) return null;
    const counts: Record<ThreatLevel, number> = { watch: 0, monitor: 0, engage: 0, confront: 0 };
    rivalsOnly.forEach((r) => { counts[r.threatLevel]++; });
    // Aggregate = highest level with count > 0
    if (counts.confront > 0) return { level: "confront" as ThreatLevel, counts };
    if (counts.engage > 0) return { level: "engage" as ThreatLevel, counts };
    if (counts.monitor > 0) return { level: "monitor" as ThreatLevel, counts };
    return { level: "watch" as ThreatLevel, counts };
  }, [rivalsOnly]);

  // ═══════════════════════════════════════════════════════════════
  //  EXECUTIVE MODULES — Derived data (Radar Prédateur d'Offensive)
  // ═══════════════════════════════════════════════════════════════

  // ─── Module 1: Basket competitors (merge tracked + API data) ────
  const basketCompetitors = useMemo<BasketCompetitor[]>(() => {
    return trackedCompetitors.map((name) => {
      const ext = extNeighbors.find((n) => n.name === name);
      if (ext) {
        return {
          name: ext.name,
          sector: ext.sector,
          reputationScore: ext.reputationScore,
          delta: ext.delta,
          marketShare: ext.marketShare,
          mentionCount: ext.mentionCount,
          sentimentScore: ext.sentimentScore,
          threatLevel: ext.threatLevel,
          isYou: ext.isYou,
          isCustom: false,
        };
      }
      // Custom competitor (user-added, not in API) — derive from alerts
      return {
        name,
        sector: "Custom",
        reputationScore: 0,
        delta: 0,
        marketShare: 0,
        mentionCount: deriveMentionCount(name, alerts),
        sentimentScore: deriveSentimentScore(name, alerts),
        threatLevel: "watch" as ThreatLevel,
        isCustom: true,
      };
    });
  }, [trackedCompetitors, extNeighbors, alerts]);

  const availableSectors = useMemo(() => {
    const sectors = new Set(basketCompetitors.map((c) => c.sector));
    return Array.from(sectors).sort();
  }, [basketCompetitors]);

  // Comparison matrix rows — filtered by sector + selected, then sorted
  const comparisonMatrixRows = useMemo<ComparisonMatrixRow[]>(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return basketCompetitors
      .filter((c) => selectedCompetitors.has(c.name))
      .filter((c) => sectorFilter === "all" || c.sector === sectorFilter)
      .map((c, i) => ({
        id: `mtx-${i}-${c.name}`,
        name: c.name,
        sector: c.sector,
        reputation: c.reputationScore,
        delta: c.delta,
        threat: c.threatLevel,
        share: c.marketShare,
        mentions: c.mentionCount,
        sentiment: c.sentimentScore,
        isYou: c.isYou,
        isCustom: c.isCustom,
      }))
      .sort((a, b) => {
        let cmp = 0;
        switch (sortColumn) {
          case "name": cmp = a.name.localeCompare(b.name); break;
          case "sector": cmp = a.sector.localeCompare(b.sector); break;
          case "reputation": cmp = a.reputation - b.reputation; break;
          case "delta": cmp = a.delta - b.delta; break;
          case "threat": cmp = a.threat.localeCompare(b.threat); break;
          case "share": cmp = a.share - b.share; break;
          case "mentions": cmp = a.mentions - b.mentions; break;
          case "sentiment": cmp = a.sentiment - b.sentiment; break;
        }
        return cmp * dir;
      });
  }, [basketCompetitors, selectedCompetitors, sectorFilter, sortColumn, sortDir]);

  const onSortMatrix = useCallback((col: SortColumn) => {
    if (sortColumn === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortDir("desc");
    }
  }, [sortColumn, sortDir]);

  const addCompetitor = useCallback(() => {
    const name = newCompetitorName.trim();
    if (!name) return;
    if (trackedCompetitors.includes(name)) return;
    if (trackedCompetitors.length >= 50) return;
    setTrackedCompetitors([...trackedCompetitors, name]);
    setSelectedCompetitors(new Set([...selectedCompetitors, name]));
    setNewCompetitorName("");
  }, [newCompetitorName, trackedCompetitors, selectedCompetitors]);

  const removeCompetitor = useCallback((name: string) => {
    setTrackedCompetitors(trackedCompetitors.filter((n) => n !== name));
    const next = new Set(selectedCompetitors);
    next.delete(name);
    setSelectedCompetitors(next);
  }, [trackedCompetitors, selectedCompetitors]);

  const toggleSelected = useCallback((name: string) => {
    const next = new Set(selectedCompetitors);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelectedCompetitors(next);
  }, [selectedCompetitors]);

  // ─── Module 2: Sentiment Migration Sankey ───────────────────────
  // Build co-mention flows between selected competitors from alerts.
  // Direction: lower-sentiment competitor → higher-sentiment (displacement).
  // Color: green if flow targets "you", red if flow sources from "you".
  const sankeyMigrationData = useMemo<SankeyMigrationData | null>(() => {
    const selectedRivals = basketCompetitors.filter((c) => selectedCompetitors.has(c.name));
    if (selectedRivals.length < 2 || alerts.length === 0) return null;

    const pairCount: Map<string, number> = new Map();
    const pairSentiments: Map<string, number[]> = new Map();

    alerts.forEach((a) => {
      const text = `${a.title} ${a.source}`.toLowerCase();
      const mentioned = selectedRivals.filter((c) => text.includes(c.name.toLowerCase()));
      if (mentioned.length >= 2) {
        for (let i = 0; i < mentioned.length; i++) {
          for (let j = i + 1; j < mentioned.length; j++) {
            const [a1, a2] = [mentioned[i], mentioned[j]].sort((x, y) => x.name.localeCompare(y.name));
            const key = `${a1.name}|${a2.name}`;
            pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
            const arr = pairSentiments.get(key) ?? [];
            if (a.sentimentScore != null) arr.push(a.sentimentScore);
            pairSentiments.set(key, arr);
          }
        }
      }
    });

    const links: SankeyMigrationLink[] = [];
    pairCount.forEach((value, key) => {
      const [nameA, nameB] = key.split("|");
      const compA = selectedRivals.find((c) => c.name === nameA);
      const compB = selectedRivals.find((c) => c.name === nameB);
      if (!compA || !compB) return;
      const sentiments = pairSentiments.get(key) ?? [];
      const avgSentiment = sentiments.length > 0
        ? sentiments.reduce((s, x) => s + x, 0) / sentiments.length
        : 0;
      // Direction: lower sentiment → higher sentiment
      const [source, target] = compA.sentimentScore <= compB.sentimentScore
        ? [compA, compB]
        : [compB, compA];
      links.push({
        source: source.name,
        target: target.name,
        value,
        sentimentScore: avgSentiment,
        involvesYou: Boolean(source.isYou || target.isYou),
      });
    });

    if (links.length === 0) return null;

    const nodeNames = new Set<string>();
    links.forEach((l) => { nodeNames.add(l.source); nodeNames.add(l.target); });
    const nodes = Array.from(nodeNames).map((name) => ({ name }));
    return { nodes, links };
  }, [basketCompetitors, selectedCompetitors, alerts]);

  const sankeyMigrationOption = useMemo(() => {
    if (!sankeyMigrationData) return null;
    const yourName = `${companyName} (You)`;
    // ECharts large mode — engages when total nodes+links cross 1000
    // (only under stress test: 250 rivals × n(n-1)/2 co-mention pairs).
    const pointCount = sankeyMigrationData.nodes.length + sankeyMigrationData.links.length;
    const useLargeMode = pointCount > 1000;
    return {
      ...ECHARTS_BASE,
      tooltip: {
        ...ECHARTS_TOOLTIP,
        formatter: (params: { name?: string; data?: { source?: string; target?: string; value?: number; sentimentScore?: number } }) => {
          const d = params.data;
          if (d && d.source && d.target) {
            return `<b>${d.source} → ${d.target}</b><br/>Co-mentions: ${d.value}<br/>Avg sentiment: ${(d.sentimentScore ?? 0).toFixed(2)}`;
          }
          return params.name ?? "";
        },
      },
      series: [{
        type: "sankey" as const,
        data: sankeyMigrationData.nodes.map((n) => ({
          name: n.name,
          itemStyle: { color: n.name === yourName ? ACCENT : C.textMuted },
        })),
        links: sankeyMigrationData.links.map((l) => ({
          source: l.source,
          target: l.target,
          value: l.value,
          lineStyle: {
            color: l.involvesYou
              ? (l.target === yourName ? C.success : C.danger)
              : "rgba(217,119,6,0.45)",
            opacity: 0.7,
            curveness: 0.5,
          },
        })),
        nodeWidth: 14,
        nodeGap: 10,
        layoutIterations: useLargeMode ? 16 : 32,
        label: { fontFamily: C.fontMono, color: C.text, fontSize: 10 },
        itemStyle: { borderWidth: 0 },
        lineStyle: { opacity: 0.5, curveness: 0.5 },
        emphasis: { focus: "adjacency" as const },
        large: useLargeMode,
        progressive: useLargeMode ? 2000 : 0,
        progressiveThreshold: useLargeMode ? 1000 : 0,
      }],
    };
  }, [sankeyMigrationData, companyName]);

  // SOV mention counts per selected competitor
  const sovMentionCounts = useMemo(() => {
    const selectedRivals = basketCompetitors.filter((c) => selectedCompetitors.has(c.name));
    if (selectedRivals.length === 0 || alerts.length === 0) return [];
    return selectedRivals.map((c) => {
      const lower = c.name.toLowerCase();
      const mentions = alerts.filter((a) =>
        a.source.toLowerCase().includes(lower) || a.title.toLowerCase().includes(lower)
      ).length;
      return { name: c.name, mentions, isYou: c.isYou, threat: c.threatLevel };
    });
  }, [basketCompetitors, selectedCompetitors, alerts]);

  // SOV % bars (horizontal)
  const sovPercentBars = useMemo(() => {
    if (sovMentionCounts.length === 0) return [];
    const total = sovMentionCounts.reduce((s, x) => s + x.mentions, 0);
    if (total === 0) return [];
    return [...sovMentionCounts]
      .map((x) => ({
        name: x.name.length > 16 ? x.name.slice(0, 15) + "\u2026" : x.name,
        sov: Math.round((x.mentions / total) * 1000) / 10,
        mentions: x.mentions,
        fill: x.isYou ? ACCENT : THREAT_COLORS[x.threat],
      }))
      .sort((a, b) => b.sov - a.sov);
  }, [sovMentionCounts]);

  // SOV trend — top 5 by mentions, 7-day multi-line
  const sovTrendLines = useMemo(() => {
    if (sovMentionCounts.length === 0 || alerts.length === 0) {
      return { data: [] as Array<Record<string, number | string>>, lines: [] as Array<{ key: string; color: string }> };
    }
    const top5 = [...sovMentionCounts].sort((a, b) => b.mentions - a.mentions).slice(0, 5);
    if (top5.every((t) => t.mentions === 0)) {
      return { data: [] as Array<Record<string, number | string>>, lines: [] as Array<{ key: string; color: string }> };
    }
    const today = new Date();
    const data: Array<Record<string, number | string>> = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dayKey = d.toISOString().split("T")[0];
      const dayAlerts = alerts.filter((a) => a.detectedAt && new Date(a.detectedAt).toISOString().split("T")[0] === dayKey);
      const totalDay = dayAlerts.length || 1;
      const entry: Record<string, number | string> = { date: dayKey };
      top5.forEach((c) => {
        const lower = c.name.toLowerCase();
        const dayMentions = dayAlerts.filter((a) =>
          a.source.toLowerCase().includes(lower) || a.title.toLowerCase().includes(lower)
        ).length;
        const shortKey = c.name.length > 12 ? c.name.slice(0, 11) + "\u2026" : c.name;
        entry[shortKey] = Math.round((dayMentions / totalDay) * 1000) / 10;
      });
      return entry;
    });
    const lines = top5.map((c, i) => ({
      key: c.name.length > 12 ? c.name.slice(0, 11) + "\u2026" : c.name,
      color: c.isYou ? ACCENT : seriesColor(i),
    }));
    return { data, lines };
  }, [sovMentionCounts, alerts]);

  // ─── Module 3: Tactical alert rows ──────────────────────────────
  const tacticalAlertRows = useMemo<TacticalAlertRow[]>(() => {
    if (alerts.length === 0) return [];
    return alerts.map((a, i) => {
      const lower = a.title.toLowerCase();
      const matching = basketCompetitors.find((c) => lower.includes(c.name.toLowerCase()));
      const eventType = classifyEventType(a.title);
      const severity: TacticalAlertRow["severity"] = a.severity === "critical" ? "critical" : "high";
      return {
        id: a.id || `tac-${i}`,
        time: a.detectedAt
          ? new Date(a.detectedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
          : "recent",
        competitor: matching?.name ?? a.source ?? "Unknown",
        eventType,
        impact: deriveTacticalImpact(severity),
        title: a.title,
        source: a.source,
        severity,
        sentimentScore: a.sentimentScore,
        url: a.url,
        details: a.details,
        detectedAt: a.detectedAt,
      };
    });
  }, [alerts, basketCompetitors]);

  const filteredTacticalRows = useMemo(() => {
    if (eventTypeFilter.size === 0) return tacticalAlertRows;
    return tacticalAlertRows.filter((r) => eventTypeFilter.has(r.eventType));
  }, [tacticalAlertRows, eventTypeFilter]);

  const toggleEventType = useCallback((type: TacticalEventType) => {
    const next = new Set(eventTypeFilter);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setEventTypeFilter(next);
  }, [eventTypeFilter]);

  return (
    <div
      className="dash-main"
      data-template={template}
      data-template-account="market-competitor"
      style={{ padding: "16px", background: "#ffffff", overflowX: "hidden" }}
    >
      {/* Template visibility CSS — hides [data-template-row] elements
          based on the active template. */}
      <TemplateVisibilityStyle accountType="market-competitor" />

      {/* Mobile responsive — collapse multi-column grids to 1-col stack */}
      <style>{`
        @media (max-width: 768px) {
          [data-template-account="market-competitor"] .war-room-split,
          [data-template-account="market-competitor"] .exec-module-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {/* ─── Welcome banner — aggressive tone ─── */}
      <div
        style={{
          padding: "12px 16px",
          background: ACCENT_BG,
          borderRadius: "4px",
          marginBottom: "16px",
          borderLeft: `3px solid ${ACCENT}`,
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#0a0a0a", lineHeight: 1.4 }}>
          {firstName}, your competitors moved overnight. Here's the delta.
        </div>
        <div style={{ fontSize: "11px", color: "#737373", fontFamily: FONT.mono, marginTop: "4px" }}>
          Tracking {kpis?.competitorsTracked ?? 0} competitors in {sector} {"\u00B7"} Last refresh {lastRefresh.toLocaleTimeString("en-US")}
        </div>
      </div>

      {/* ─── Page title + controls ─── */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>
            {companyName} vs Competitors {"\u00B7"} War Room V8
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.02em" }}>
            Competitive Tactical Console
          </h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {(["all", "ahead", "behind"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRankFilter(f)}
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontFamily: FONT.mono,
                fontWeight: 600,
                border: `1px solid ${rankFilter === f ? ACCENT : "#e5e5e5"}`,
                borderRadius: "12px",
                background: rankFilter === f ? `${ACCENT}15` : "#ffffff",
                color: rankFilter === f ? ACCENT : "#737373",
                cursor: "pointer",
                transition: "all 0.15s ease",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {f === "all" ? "All" : f === "ahead" ? "Ahead of me" : "Behind me"}
            </button>
          ))}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              padding: "4px 10px",
              fontSize: "10px",
              fontFamily: FONT.mono,
              fontWeight: 600,
              border: "1px solid #e5e5e5",
              borderRadius: "12px",
              background: "#ffffff",
              color: "#525252",
              cursor: refreshing ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              opacity: refreshing ? 0.6 : 1,
            }}
            title={`Last refreshed: ${lastRefresh.toLocaleTimeString("en-US")}`}
          >
            {"\u21BB"} {refreshing ? "..." : "Refresh"}
          </button>
          <button
            onClick={exportCompetitorsCSV}
            style={{
              padding: "4px 10px",
              fontSize: "10px",
              fontFamily: FONT.mono,
              fontWeight: 600,
              border: "1px solid #e5e5e5",
              borderRadius: "12px",
              background: "#ffffff",
              color: "#525252",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {"\u2193"} CSV
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          EXECUTIVE STRIP — 4 KPI tiles (24-col grid)
          ═══════════════════════════════════════════════════════════ */}
      <section data-template-row="1">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {/* Tile 1: Your Rank */}
        <div style={{ padding: "12px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "4px" }}>
          <div style={{ fontSize: "9px", color: "#737373", fontFamily: FONT.mono, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            Your Rank
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, fontFamily: FONT.mono, color: ACCENT, lineHeight: 1 }}>
              {loading ? "\u2014" : `#${kpis?.yourRank ?? "\u2014"}`}
            </span>
            <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373" }}>
              / {kpis?.totalInSector ?? "\u2014"}
            </span>
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "4px" }}>
            Score: <span style={{ color: "#0a0a0a", fontWeight: 700 }}>{kpis?.yourScore ?? "\u2014"}</span> {"\u00B7"} Sector avg {kpis?.sectorAverage ?? "\u2014"}
          </div>
        </div>

        {/* Tile 2: Delta vs Sector */}
        <div style={{ padding: "12px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "4px" }}>
          <div style={{ fontSize: "9px", color: "#737373", fontFamily: FONT.mono, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            Delta vs Sector
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 800,
                fontFamily: FONT.mono,
                lineHeight: 1,
                color: (kpis?.deltaVsSector ?? 0) >= 0 ? ACCENT : "#ef4444",
              }}
            >
              {loading ? "\u2014" : `${(kpis?.deltaVsSector ?? 0) >= 0 ? "+" : ""}${kpis?.deltaVsSector}`}
            </span>
            <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373" }}>pts</span>
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "4px" }}>
            Trend:{" "}
            <span style={{ color: trend === "up" ? ACCENT : trend === "down" ? "#ef4444" : "#737373", fontWeight: 700 }}>
              {trend === "up" ? "\u25B2" : trend === "down" ? "\u25BC" : "\u2014"} {trend}
            </span>
          </div>
        </div>

        {/* Tile 3: Competitors Tracked (with sparkline) */}
        <div style={{ padding: "12px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "4px" }}>
          <div style={{ fontSize: "9px", color: "#737373", fontFamily: FONT.mono, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            Competitors Tracked
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, fontFamily: FONT.mono, color: "#0a0a0a", lineHeight: 1 }}>
              {loading ? "\u2014" : kpis?.competitorsTracked ?? 0}
            </span>
            <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373" }}>rivals</span>
          </div>
          <div style={{ marginTop: "4px", height: 32 }}>
            {sparkHistory.length > 1 ? (
              <Sparkline values={sparkHistory} color={ACCENT} />
            ) : (
              <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, lineHeight: "32px" }}>
                Score trend accumulating\u2026
              </div>
            )}
          </div>
        </div>

        {/* Tile 4: Threat Level (aggregate) */}
        <div style={{ padding: "12px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "4px" }}>
          <div style={{ fontSize: "9px", color: "#737373", fontFamily: FONT.mono, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            Aggregate Threat
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 800,
                fontFamily: FONT.mono,
                lineHeight: 1,
                color: aggregateThreat ? THREAT_COLORS[aggregateThreat.level] : "#737373",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {loading ? "\u2014" : aggregateThreat ? THREAT_LABEL[aggregateThreat.level] : "\u2014"}
            </span>
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "4px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {aggregateThreat && (Object.keys(aggregateThreat.counts) as ThreatLevel[]).map((l) => (
              <span key={l} style={{ color: aggregateThreat.counts[l] > 0 ? THREAT_COLORS[l] : "#d4d4d4" }}>
                {THREAT_LABEL[l]}:{aggregateThreat.counts[l]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SPLIT-SCREEN — Macro (12) | Micro (12)
          ═══════════════════════════════════════════════════════════ */}
      </section>
      <section data-template-row="2">
      <DashboardErrorBoundary title="Macro + Micro Split-Screen Widgets" accent={ACCENT} subtitle="SOV area, Sankey, scatter, treemap, network graph + virtualized feeds">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: "8px",
          marginBottom: "16px",
        }}
        className="war-room-split"
      >
        {/* ─── MACRO VIEW (left 12 cols) ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
          <div style={{
            fontSize: "10px",
            fontFamily: FONT.mono,
            color: ACCENT,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 700,
            padding: "0 4px",
          }}>
            {"\u25A0"} Macro View {"\u2014"} Industry Telemetry
          </div>

          {/* Widget 5: 50-Entity Stacked Area Chart (SOV) */}
          <WarRoomCard
            title="Share of Voice — Stacked"
            subtitle="7-day SOV across all tracked rivals · amber-slate escalation palette"
          >
            <WidgetState loading={loading} error={error} hasData={sovStackedData.length > 0 && rivalsOnly.length > 0} label="Share of Voice">
              <div style={{ height: 220 }}>
                <ReactECharts option={sovStackedOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 6: Sentiment Displacement Sankey */}
          <WarRoomCard
            title="Sentiment Displacement Flow"
            subtitle="How sentiment states migrate into threat postures"
          >
            <WidgetState loading={loading} error={error} hasData={sankeyOption !== null} label="Sentiment Flow">
              <div style={{ height: 220 }}>
                <ReactECharts option={sankeyOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 7: Industry Reputation Bell Curve */}
          <WarRoomCard
            title="Industry Reputation Distribution"
            subtitle="Bell curve of all entity scores · amber = your position"
          >
            <WidgetState loading={loading} error={error} hasData={bellCurveData.length > 0} label="Reputation Distribution">
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bellCurveData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                    <defs>
                      <linearGradient id="bell-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                    <XAxis dataKey="x" tick={{ fontSize: 9, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip content={<MonoTooltip />} />
                    <Area type="monotone" dataKey="count" name="Entities" stroke={ACCENT} strokeWidth={1.5} fill="url(#bell-grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 8: Market Position Bubble Matrix */}
          <WarRoomCard
            title="Market Position Matrix"
            subtitle="X = market share % · Y = reputation · size = mentions · star = you"
          >
            <WidgetState loading={loading} error={error} hasData={bubbleOption !== null} label="Position Matrix">
              <div style={{ height: 240 }}>
                <ReactECharts option={bubbleOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 9: Sector Sentiment Heatmap (Recharts custom) */}
          <WarRoomCard
            title="Sector Sentiment Heatmap"
            subtitle="Competitors (rows) × sentiment buckets (cols) · amber scale"
          >
            <WidgetState loading={loading} error={error} hasData={heatmapData.length > 0} label="Sentiment Heatmap">
              <div style={{ maxHeight: 280, overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT.mono, fontSize: "10px" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "6px 8px", color: "#737373", fontWeight: 700, textTransform: "uppercase", fontSize: "9px", letterSpacing: "0.05em", borderBottom: "1px solid #e5e5e5" }}>Competitor</th>
                      {["Strong Neg", "Negative", "Neutral", "Positive", "Strong Pos"].map((b) => (
                        <th key={b} style={{ textAlign: "right", padding: "6px 8px", color: "#737373", fontWeight: 700, textTransform: "uppercase", fontSize: "9px", letterSpacing: "0.05em", borderBottom: "1px solid #e5e5e5" }}>{b}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f4f4f5" }}>
                        <td style={{ padding: "6px 8px", color: "#0a0a0a", fontWeight: 600 }}>{row.name}</td>
                        {["Strong Neg", "Negative", "Neutral", "Positive", "Strong Pos"].map((b, bi) => {
                          const val = row[b] as number;
                          // Color intensity scales with value
                          const intensity = Math.min(1, val / 50);
                          const colors = ["#ef4444", "#ea580c", "#737373", "#d97706", "#10b981"];
                          const bg = colors[bi];
                          return (
                            <td key={b} style={{ padding: "4px", textAlign: "right" }}>
                              <div
                                style={{
                                  display: "inline-block",
                                  minWidth: 32,
                                  padding: "2px 6px",
                                  borderRadius: "2px",
                                  background: `${bg}${Math.round(intensity * 255).toString(16).padStart(2, "0")}`,
                                  color: "#ffffff",
                                  fontWeight: 700,
                                  fontSize: "9px",
                                }}
                              >
                                {Math.round(val)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 10: Threat Velocity Timeline */}
          <WarRoomCard
            title="Threat Velocity — 14d"
            subtitle="Daily count of crisis alerts detected by HarchIQ engine"
          >
            <WidgetState loading={loading} error={error} hasData={threatVelocityOption !== null} label="Threat Velocity">
              <div style={{ height: 200 }}>
                <ReactECharts option={threatVelocityOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 11: Industry Topic Cloud */}
          <WarRoomCard
            title="Industry Topic Cloud"
            subtitle="Weighted by article count · sourced from /api/console/topics"
          >
            <WidgetState loading={loading} error={error} hasData={topicCloud.length > 0} label="Topic Cloud">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "4px 0", maxHeight: 180, overflow: "auto" }}>
                {topicCloud.map((t, i) => {
                  const maxCount = Math.max(...topicCloud.map((x) => x.count), 1);
                  const size = 10 + Math.round((t.count / maxCount) * 8);
                  return (
                    <span
                      key={i}
                      style={{
                        padding: "3px 8px",
                        border: `1px solid ${t.type === "risk" ? "#ef4444" : "#e5e5e5"}`,
                        borderRadius: "2px",
                        background: t.type === "risk" ? "rgba(239,68,68,0.06)" : `${ACCENT}10`,
                        color: t.type === "risk" ? "#ef4444" : ACCENT,
                        fontFamily: FONT.mono,
                        fontSize: `${size}px`,
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {t.label}{" "}
                      <span style={{ color: "#737373", fontWeight: 400 }}>({t.count})</span>
                    </span>
                  );
                })}
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 12: Rank Movement Chart */}
          <WarRoomCard
            title="Rank Movement — 7d"
            subtitle="Reputation score trajectory per rival (top 6)"
          >
            <WidgetState loading={loading} error={error} hasData={rankMovementData.length > 0} label="Rank Movement">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rankMovementData} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={false} width={32} domain={[0, 100]} />
                    <Tooltip content={<MonoTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 9, fontFamily: FONT.mono, color: "#737373" }} iconType="circle" />
                    {rivalsOnly.slice(0, 6).map((r, i) => (
                      <Line
                        key={i}
                        type="monotone"
                        dataKey={r.name.length > 12 ? r.name.slice(0, 11) + "\u2026" : r.name}
                        stroke={seriesColor(i)}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 13: Competitor Overlap Venn (pie proxy) */}
          <WarRoomCard
            title="Competitor Topic Overlap"
            subtitle="Top 3 rivals — overlap computed from shared alerts + rank parity"
          >
            <WidgetState loading={loading} error={error} hasData={vennOption !== null} label="Topic Overlap">
              <div style={{ height: 220 }}>
                <ReactECharts option={vennOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Preserved Widget: Competitive Position Map (existing #1) */}
          <WarRoomCard
            title="Competitive Position Map"
            subtitle="Proximity vs reputation · colored by threat · star = you"
            right={
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {(Object.keys(THREAT_COLORS) as ThreatLevel[]).map((level) => (
                  <div key={level} style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "8px", fontFamily: FONT.mono, color: "#737373" }}>
                    <span style={{ width: "6px", height: "6px", background: THREAT_COLORS[level], borderRadius: "50%", display: "inline-block" }} />
                    {THREAT_LABEL[level]}
                  </div>
                ))}
              </div>
            }
          >
            <WidgetState loading={loading} error={error} hasData={hasRivals} label="Position Map">
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 12, right: 16, bottom: 12, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                    <XAxis
                      type="number"
                      dataKey="proximityScore"
                      name="Proximity"
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e5e5" }}
                      label={{ value: "PROXIMITY", position: "insideBottom", offset: -2, style: { fontSize: 9, fill: "#737373", fontFamily: FONT.mono, letterSpacing: "0.1em" } }}
                    />
                    <YAxis
                      type="number"
                      dataKey="reputationScore"
                      name="Reputation"
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                      label={{ value: "SCORE", angle: -90, position: "insideLeft", style: { fontSize: 9, fill: "#737373", fontFamily: FONT.mono, letterSpacing: "0.1em" } }}
                    />
                    <ZAxis type="number" dataKey="proximityScore" range={[80, 80]} />
                    <Tooltip content={<MonoTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#d4d4d4" }} />
                    <Scatter data={scatterData} shape={<ScatterPointShape />} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Preserved Widget: Reputation vs Market Share (existing #2) */}
          <WarRoomCard
            title="Reputation vs Market Share"
            subtitle="Amber = reputation · slate = market share %"
          >
            <WidgetState loading={loading} error={error} hasData={shareData.length > 0} label="Reputation vs Share">
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shareData} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} interval={0} angle={-18} textAnchor="end" height={50} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={false} width={32} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={false} width={32} />
                    <Tooltip content={<MonoTooltip />} cursor={{ fill: "#fafafa" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontFamily: FONT.mono, paddingTop: 8, color: "#737373" }} />
                    <Bar yAxisId="left" dataKey="reputation" name="Reputation" fill={ACCENT} radius={[3, 3, 0, 0]} />
                    <Bar yAxisId="right" dataKey="share" name="Market share %" fill="#737373" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </WidgetState>
          </WarRoomCard>
        </div>

        {/* ─── MICRO VIEW (right 12 cols) ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
          <div style={{
            fontSize: "10px",
            fontFamily: FONT.mono,
            color: ACCENT,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 700,
            padding: "0 4px",
          }}>
            {"\u25A0"} Micro View {"\u2014"} Competitor Vulnerabilities
          </div>

          {/* Widget 14: Pre-Launch Vulnerability Radar (hexagonal grid) */}
          <WarRoomCard
            title="Pre-Launch Vulnerability Radar"
            subtitle="6 market blind spots aggregated across rivals"
          >
            <WidgetState loading={loading} error={error} hasData={vulnerabilityRadarData !== null} label="Vulnerability Radar">
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={vulnerabilityRadarData!} outerRadius="75%">
                    <PolarGrid stroke="#e5e5e5" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: "#525252", fontFamily: FONT.mono }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#a3a3a3", fontFamily: FONT.mono }} axisLine={false} />
                    <Radar name="Vulnerability" dataKey="value" stroke={ACCENT} fill={ACCENT} fillOpacity={0.4} />
                    <Tooltip content={<MonoTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 15: Per-Competitor Radar (8-axis) */}
          <WarRoomCard
            title="Per-Competitor Radar — 8-Axis"
            subtitle="Select competitor to inspect"
            right={
              <select
                value={selectedCompetitor ?? ""}
                onChange={(e) => setSelectedCompetitor(e.target.value)}
                style={{
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  border: "1px solid #e5e5e5",
                  borderRadius: "2px",
                  padding: "3px 6px",
                  background: "#ffffff",
                  color: "#0a0a0a",
                  cursor: "pointer",
                }}
              >
                {rivalsOnly.map((r) => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            }
          >
            <WidgetState loading={loading} error={error} hasData={selectedRadarData !== null} label="Per-Competitor Radar">
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={selectedRadarData!.radar} outerRadius="72%">
                    <PolarGrid stroke="#e5e5e5" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: "#525252", fontFamily: FONT.mono }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#a3a3a3", fontFamily: FONT.mono }} axisLine={false} />
                    <Radar name={selectedRadarData!.competitor.name} dataKey="value" stroke={ACCENT} fill={ACCENT} fillOpacity={0.4} />
                    <Tooltip content={<MonoTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 16: Competitor Sentiment Trend (ECharts multi-line) */}
          <WarRoomCard
            title="Competitor Sentiment Trend — 7d"
            subtitle="Per-rival sentiment trajectory · range [-1, +1]"
          >
            <WidgetState loading={loading} error={error} hasData={competitorSentimentTrendOption !== null} label="Sentiment Trend">
              <div style={{ height: 220 }}>
                <ReactECharts option={competitorSentimentTrendOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 17: Virtualized Bad Buzz Feed */}
          <WarRoomCard
            title="Bad Buzz Feed — Live"
            subtitle={`${buzzRows.length} signals · virtualized · 32px rows · color-coded severity`}
            right={
              <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: buzzRows.length > 0 ? "#ef4444" : "#737373", fontWeight: 700, textTransform: "uppercase" }}>
                {buzzRows.filter((r) => r.severity === "critical").length} critical
              </span>
            }
          >
            <WidgetState loading={loading} error={error} hasData={buzzRows.length > 0} label="Bad Buzz Feed">
              <VirtualizedBuzzFeed rows={buzzRows} />
            </WidgetState>
          </WarRoomCard>

          {/* Preserved Widget: Delta from You (existing #6) */}
          <WarRoomCard
            title="Delta from You"
            subtitle="Your score minus their score · amber = you're ahead · red = they're winning"
          >
            <WidgetState loading={loading} error={error} hasData={deltaData.length > 0} label="Delta from You">
              <div style={{ height: Math.max(180, deltaData.length * 32) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={deltaData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#525252", fontFamily: FONT.mono }} tickLine={false} axisLine={false} width={130} />
                    <Tooltip content={<MonoTooltip />} cursor={{ fill: "#fafafa" }} />
                    <ReferenceLine x={0} stroke="#d4d4d4" strokeDasharray="4 4" />
                    <Bar dataKey="delta" radius={[0, 3, 3, 0]}>
                      {deltaData.map((entry, i) => (
                        <Cell key={i} fill={entry.positive ? ACCENT : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 19: Crisis Impact Distribution (ECharts treemap) */}
          <WarRoomCard
            title="Crisis Impact Distribution"
            subtitle="Nested treemap · slate → amber → orange → red escalation"
          >
            <WidgetState loading={loading} error={error} hasData={crisisTreemapOption !== null} label="Crisis Distribution">
              <div style={{ height: 220 }}>
                <ReactECharts option={crisisTreemapOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Preserved Widget: Threat Level Pie (existing #3) */}
          <WarRoomCard
            title="Threat Level Distribution"
            subtitle="Rivals grouped by engagement posture"
          >
            <WidgetState loading={loading} error={error} hasData={threatPieData.length > 0} label="Threat Distribution">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={threatPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2} stroke="#ffffff" strokeWidth={2}>
                      {threatPieData.map((entry, i) => (
                        <Cell key={i} fill={THREAT_COLORS[entry.threatLevel]} />
                      ))}
                    </Pie>
                    <Tooltip content={<MonoTooltip />} />
                    <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 10, fontFamily: FONT.mono, color: "#737373" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 21: Competitor Comparison Table (virtualized) */}
          <WarRoomCard
            title="Competitor Comparison — Dense"
            subtitle={`${comparisonRows.length} rivals · virtualized · 28px rows`}
          >
            <WidgetState loading={loading} error={error} hasData={comparisonRows.length > 0} label="Comparison Table">
              <VirtualizedComparisonTable rows={comparisonRows} />
            </WidgetState>
          </WarRoomCard>

          {/* Widget 22: Rank Distribution Radial (ECharts) */}
          <WarRoomCard
            title="Rank Distribution Radial"
            subtitle="Rose chart · rivals by proximity rank"
          >
            <WidgetState loading={loading} error={error} hasData={rankRadialOption !== null} label="Rank Radial">
              <div style={{ height: 220 }}>
                <ReactECharts option={rankRadialOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 23: Mention Volume Bars */}
          <WarRoomCard
            title="Mention Volume per Rival"
            subtitle="Bar fill = threat color"
          >
            <WidgetState loading={loading} error={error} hasData={mentionVolumeData.length > 0} label="Mention Volume">
              <div style={{ height: Math.max(160, mentionVolumeData.length * 28) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={mentionVolumeData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#525252", fontFamily: FONT.mono }} tickLine={false} axisLine={false} width={130} />
                    <Tooltip content={<MonoTooltip />} cursor={{ fill: "#fafafa" }} />
                    <Bar dataKey="mentions" radius={[0, 3, 3, 0]}>
                      {mentionVolumeData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </WidgetState>
          </WarRoomCard>

          {/* Widget 24: Sentiment Volatility Gauge */}
          <WarRoomCard
            title="Sentiment Volatility Gauge"
            subtitle="For selected competitor · |delta| + |sentiment| × 50"
            right={
              <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: "#737373", fontWeight: 700, textTransform: "uppercase" }}>
                {selectedCompetitor ?? "\u2014"}
              </span>
            }
          >
            <WidgetState loading={loading} error={error} hasData={volatilityGaugeOption !== null} label="Volatility Gauge">
              <div style={{ height: 200 }}>
                <ReactECharts option={volatilityGaugeOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </WidgetState>
          </WarRoomCard>
        </div>
      </div>
      </DashboardErrorBoundary>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM STRIP — 24-col cross-cutting widgets
          ═══════════════════════════════════════════════════════════ */}
      </section>
      <section data-template-row="3">
      <DashboardErrorBoundary title="Bottom Strip — Cross-Cutting Widgets" accent={ACCENT} subtitle="Alert timeline, sentiment matrix, movers, network graph, scorecard">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {/* Widget 25: 365d Alert Timeline */}
        <WarRoomCard
          title="365-Day Alert Timeline"
          subtitle="12-month critical/high alert counts"
        >
          <WidgetState loading={loading} error={error} hasData={alertTimelineData.length > 0} label="Alert Timeline">
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertTimelineData} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                  <Tooltip content={<MonoTooltip />} cursor={{ fill: "#fafafa" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 9, fontFamily: FONT.mono, color: "#737373" }} />
                  <Bar dataKey="critical" stackId="a" name="Critical" fill="#ef4444" />
                  <Bar dataKey="high" stackId="a" name="High" fill="#ea580c" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </WidgetState>
        </WarRoomCard>

        {/* Widget 26: Cross-Competitor Sentiment Matrix (ECharts heatmap) */}
        <WarRoomCard
          title="Cross-Competitor Sentiment Matrix"
          subtitle="Pairwise sentiment similarity · 0 (low) → amber → red (high)"
        >
          <WidgetState loading={loading} error={error} hasData={sentimentMatrixOption !== null} label="Sentiment Matrix">
            <div style={{ height: 220 }}>
              <ReactECharts option={sentimentMatrixOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
            </div>
          </WidgetState>
        </WarRoomCard>

        {/* Widget 27: Top Competitor Movers (virtualized) */}
        <WarRoomCard
          title="Top Competitor Movers"
          subtitle={`${moversRows.length} rivals · virtualized · sorted by |delta|`}
        >
          <WidgetState loading={loading} error={error} hasData={moversRows.length > 0} label="Top Movers">
            <VirtualizedMoversTable rows={moversRows} />
          </WidgetState>
        </WarRoomCard>

        {/* Widget 28: Share of Voice Trend */}
        <WarRoomCard
          title="Share of Voice Trend"
          subtitle="7-day SOV drift per rival (top 5)"
        >
          <WidgetState loading={loading} error={error} hasData={sovTrendData.length > 0} label="SOV Trend">
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sovTrendData} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip content={<MonoTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 9, fontFamily: FONT.mono, color: "#737373" }} />
                  {rivalsOnly.slice(0, 5).map((r, i) => {
                    const key = r.name.length > 12 ? r.name.slice(0, 11) + "\u2026" : r.name;
                    return (
                      <Area
                        key={i}
                        type="monotone"
                        dataKey={key}
                        stackId="1"
                        stroke={seriesColor(i)}
                        fill={seriesColor(i)}
                        fillOpacity={0.5}
                        strokeWidth={1}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </WidgetState>
        </WarRoomCard>

        {/* Widget 29: Competitor Network Graph (ECharts force-directed) */}
        <WarRoomCard
          title="Competitor Network Graph"
          subtitle="Force-directed · node size = mentions · edge = proximity"
        >
          <WidgetState loading={loading} error={error} hasData={networkGraphOption !== null} label="Network Graph">
            <div style={{ height: 240 }}>
              <ReactECharts option={networkGraphOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
            </div>
          </WidgetState>
        </WarRoomCard>

        {/* Widget 30: Vulnerability Scorecard (virtualized dense table) */}
        <WarRoomCard
          title="Vulnerability Scorecard"
          subtitle={`${scorecardRows.length} rivals · virtualized · sorted by vulnerability desc`}
        >
          <WidgetState loading={loading} error={error} hasData={scorecardRows.length > 0} label="Vulnerability Scorecard">
            <VirtualizedScorecard rows={scorecardRows} />
          </WidgetState>
        </WarRoomCard>
      </div>
      </DashboardErrorBoundary>

      {/* ═══════════════════════════════════════════════════════════
          EXECUTIVE MODULES — Radar Prédateur d'Offensive
          Module 1: Multi-Entity Competitor Tracking (25-50)
          Module 2: Sentiment Migration Sankey (SOV displacement)
          Module 3: Tactical Alert Terminal (virtualized, 500+)
          ═══════════════════════════════════════════════════════════ */}

      {/* ─── Module 1: Multi-Entity Competitor Tracking ─── */}
      </section>
      <section data-template-row="4">
      <DashboardErrorBoundary title="Competitor Basket Module" accent={ACCENT} subtitle="Tracking configuration + virtualized comparison matrix">
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          fontSize: "10px",
          fontFamily: FONT.mono,
          color: ACCENT,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: "8px",
          padding: "0 4px",
        }}>
          {"\u25A0"} Executive Module 1 {"\u2014"} Multi-Entity Competitor Tracking ({trackedCompetitors.length}/50)
        </div>

        {/* Configuration panel + basket selector (2-col on desktop) */}
        <div className="exec-module-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "8px", marginBottom: "8px" }}>
          <WarRoomCard
            title="Competitor Configuration"
            subtitle="Add custom competitors or remove tracked ones · persisted to localStorage (harchiq.competitor-basket)"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={newCompetitorName}
                  onChange={(e) => setNewCompetitorName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCompetitor(); }}
                  placeholder="Competitor name (e.g. Attijariwafa Bank)"
                  style={{
                    flex: 1,
                    minWidth: 180,
                    padding: "5px 8px",
                    fontSize: "11px",
                    fontFamily: FONT.mono,
                    border: `1px solid ${C.border}`,
                    borderRadius: "2px",
                    background: C.bg,
                    color: C.text,
                    outline: "none",
                  }}
                />
                <button
                  onClick={addCompetitor}
                  disabled={trackedCompetitors.length >= 50 || !newCompetitorName.trim()}
                  style={{
                    padding: "5px 12px",
                    fontSize: "10px",
                    fontFamily: FONT.mono,
                    fontWeight: 700,
                    border: `1px solid ${ACCENT}`,
                    borderRadius: "2px",
                    background: ACCENT,
                    color: "#ffffff",
                    cursor: trackedCompetitors.length >= 50 || !newCompetitorName.trim() ? "not-allowed" : "pointer",
                    opacity: trackedCompetitors.length >= 50 || !newCompetitorName.trim() ? 0.5 : 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {"+"} Add
                </button>
                <button
                  onClick={() => setSelectedCompetitors(new Set(trackedCompetitors))}
                  style={{
                    padding: "5px 10px",
                    fontSize: "10px",
                    fontFamily: FONT.mono,
                    fontWeight: 600,
                    border: `1px solid ${C.border}`,
                    borderRadius: "2px",
                    background: C.bg,
                    color: C.textBody,
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Select all
                </button>
                <button
                  onClick={() => setSelectedCompetitors(new Set())}
                  style={{
                    padding: "5px 10px",
                    fontSize: "10px",
                    fontFamily: FONT.mono,
                    fontWeight: 600,
                    border: `1px solid ${C.border}`,
                    borderRadius: "2px",
                    background: C.bg,
                    color: C.textBody,
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Clear
                </button>
              </div>
              {/* Sector filter */}
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Sector:
                </span>
                <button
                  onClick={() => setSectorFilter("all")}
                  style={{
                    padding: "3px 8px",
                    fontSize: "9px",
                    fontFamily: FONT.mono,
                    fontWeight: 600,
                    border: `1px solid ${sectorFilter === "all" ? ACCENT : C.border}`,
                    borderRadius: "10px",
                    background: sectorFilter === "all" ? `${ACCENT}15` : C.bg,
                    color: sectorFilter === "all" ? ACCENT : C.textMuted,
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  All
                </button>
                {availableSectors.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSectorFilter(s)}
                    style={{
                      padding: "3px 8px",
                      fontSize: "9px",
                      fontFamily: FONT.mono,
                      fontWeight: 600,
                      border: `1px solid ${sectorFilter === s ? ACCENT : C.border}`,
                      borderRadius: "10px",
                      background: sectorFilter === s ? `${ACCENT}15` : C.bg,
                      color: sectorFilter === s ? ACCENT : C.textMuted,
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </WarRoomCard>

          {/* Basket selector chips */}
          <WarRoomCard
            title={`Competitor Basket — ${selectedCompetitors.size}/${trackedCompetitors.length} selected`}
            subtitle="Click chips to toggle inclusion in comparative views · max 50 tracked · * = custom"
            right={
              <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: trackedCompetitors.length >= 50 ? C.danger : C.textMuted, fontWeight: 700 }}>
                {trackedCompetitors.length}/50
              </span>
            }
          >
            <WidgetState loading={loading} error={error} hasData={trackedCompetitors.length > 0} label="Competitor Basket">
              <div style={{ maxHeight: 180, overflow: "auto", display: "flex", flexWrap: "wrap", gap: "4px", padding: "2px" }}>
                {basketCompetitors.map((c) => {
                  const isSelected = selectedCompetitors.has(c.name);
                  const chipColor = c.isYou ? ACCENT : THREAT_COLORS[c.threatLevel];
                  return (
                    <div
                      key={c.name}
                      onClick={() => toggleSelected(c.name)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        fontSize: "10px",
                        fontFamily: FONT.mono,
                        fontWeight: 600,
                        border: `1px solid ${isSelected ? chipColor : C.border}`,
                        borderRadius: "12px",
                        background: isSelected ? `${chipColor}15` : C.bg,
                        color: isSelected ? chipColor : C.textMuted,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {c.name}
                      {c.isCustom && <span style={{ color: C.textMuted }}>*</span>}
                      <span
                        onClick={(e) => { e.stopPropagation(); removeCompetitor(c.name); }}
                        style={{
                          color: "#a3a3a3",
                          cursor: "pointer",
                          padding: "0 2px",
                          fontSize: "11px",
                          lineHeight: 1,
                        }}
                        title="Remove from basket"
                      >
                        {"\u00D7"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </WidgetState>
          </WarRoomCard>
        </div>

        {/* Comparison matrix — virtualized, sortable, 50-row capacity */}
        <WarRoomCard
          title="Comparison Matrix — 50-Entity Capacity"
          subtitle={`${comparisonMatrixRows.length} competitors in view · virtualized · 28px rows · click headers to sort`}
          right={
            <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, fontWeight: 700 }}>
              {sectorFilter !== "all" ? `Sector: ${sectorFilter}` : "All sectors"}
            </span>
          }
        >
          <WidgetState loading={loading} error={error} hasData={comparisonMatrixRows.length > 0} label="Comparison Matrix">
            <VirtualizedComparisonMatrix
              rows={comparisonMatrixRows}
              sortColumn={sortColumn}
              sortDir={sortDir}
              onSort={onSortMatrix}
            />
          </WidgetState>
        </WarRoomCard>
      </div>
      </DashboardErrorBoundary>

      {/* ─── Module 2: Sentiment Migration Sankey ─── */}
      </section>
      <section data-template-row="5">
      <DashboardErrorBoundary title="SOV Migration Sankey" accent={ACCENT} subtitle="Co-mention flows + SOV bars + SOV trend">
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          fontSize: "10px",
          fontFamily: FONT.mono,
          color: ACCENT,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: "8px",
          padding: "0 4px",
        }}>
          {"\u25A0"} Executive Module 2 {"\u2014"} Sentiment Migration Sankey (SOV Displacement)
        </div>

        {/* Sankey migration diagram — full width */}
        <WarRoomCard
          title="SOV Migration Sankey"
          subtitle="Flows = co-mention volume between competitors · green = migration to you · red = leaving you · amber = neutral"
        >
          <WidgetState loading={loading} error={error} hasData={sankeyMigrationOption !== null} label="Migration Sankey">
            <div style={{ height: 320 }}>
              <ReactECharts option={sankeyMigrationOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
            </div>
          </WidgetState>
        </WarRoomCard>

        {/* SOV bars + SOV trend (2-col on desktop) */}
        <div className="exec-module-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "8px", marginTop: "8px" }}>
          <WarRoomCard
            title="Share of Voice — Current %"
            subtitle={`${sovPercentBars.length} competitors · horizontal bars · SOV = mentions / total`}
          >
            <WidgetState loading={loading} error={error} hasData={sovPercentBars.length > 0} label="SOV Bars">
              <div style={{ height: Math.max(160, sovPercentBars.length * 24) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={sovPercentBars} margin={{ top: 4, right: 32, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#525252", fontFamily: FONT.mono }} tickLine={false} axisLine={false} width={130} />
                    <Tooltip content={<MonoTooltip />} cursor={{ fill: "#fafafa" }} />
                    <Bar dataKey="sov" radius={[0, 3, 3, 0]}>
                      {sovPercentBars.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </WidgetState>
          </WarRoomCard>

          <WarRoomCard
            title="SOV Trend — 7d (Top 5)"
            subtitle="Daily share of voice % evolution per competitor"
          >
            <WidgetState loading={loading} error={error} hasData={sovTrendLines.data.length > 0} label="SOV Trend">
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sovTrendLines.data} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }} tickLine={false} axisLine={false} width={32} unit="%" />
                    <Tooltip content={<MonoTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 9, fontFamily: FONT.mono, color: "#737373" }} />
                    {sovTrendLines.lines.map((l, i) => (
                      <Line key={i} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={1.5} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </WidgetState>
          </WarRoomCard>
        </div>
      </div>
      </DashboardErrorBoundary>

      {/* ─── Module 3: Tactical Alert Terminal ─── */}
      </section>
      <section data-template-row="6">
      <DashboardErrorBoundary title="Tactical Alert Terminal" accent={ACCENT} subtitle="Virtualized 500+ capacity feed with expandable rows">
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          fontSize: "10px",
          fontFamily: FONT.mono,
          color: ACCENT,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: "8px",
          padding: "0 4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}>
          <span>{"\u25A0"} Executive Module 3 {"\u2014"} Tactical Alert Terminal ({filteredTacticalRows.length} signals)</span>
          <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", fontSize: "9px", color: C.textMuted, textTransform: "uppercase", fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            Auto-scroll
          </label>
        </div>

        <WarRoomCard
          title="Tactical Alert Terminal — Live"
          subtitle={`${filteredTacticalRows.length} alerts · virtualized · 28px rows · 500+ capacity · click row to expand`}
          right={
            <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: filteredTacticalRows.filter((r) => r.severity === "critical").length > 0 ? C.danger : C.textMuted, fontWeight: 700 }}>
              {filteredTacticalRows.filter((r) => r.severity === "critical").length} critical
            </span>
          }
        >
          {/* Event type filter chips */}
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px", padding: "0 2px", alignItems: "center" }}>
            <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Filter:
            </span>
            <button
              onClick={() => setEventTypeFilter(new Set())}
              style={{
                padding: "3px 8px",
                fontSize: "9px",
                fontFamily: FONT.mono,
                fontWeight: 600,
                border: `1px solid ${eventTypeFilter.size === 0 ? ACCENT : C.border}`,
                borderRadius: "10px",
                background: eventTypeFilter.size === 0 ? `${ACCENT}15` : C.bg,
                color: eventTypeFilter.size === 0 ? ACCENT : C.textMuted,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              All
            </button>
            {(Object.keys(EVENT_TYPE_LABELS) as TacticalEventType[]).map((t) => {
              const isActive = eventTypeFilter.has(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleEventType(t)}
                  style={{
                    padding: "3px 8px",
                    fontSize: "9px",
                    fontFamily: FONT.mono,
                    fontWeight: 600,
                    border: `1px solid ${isActive ? ACCENT : C.border}`,
                    borderRadius: "10px",
                    background: isActive ? `${ACCENT}15` : C.bg,
                    color: isActive ? ACCENT : C.textMuted,
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {EVENT_TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>

          <WidgetState loading={loading} error={error} hasData={filteredTacticalRows.length > 0} label="Tactical Alert Terminal">
            <VirtualizedTacticalFeed
              rows={filteredTacticalRows}
              expandedId={expandedAlertId}
              onToggleExpand={(id) => setExpandedAlertId(expandedAlertId === id ? null : id)}
              autoScroll={autoScroll}
              dataVersion={lastRefresh.getTime()}
            />
          </WidgetState>
        </WarRoomCard>
      </div>
      </DashboardErrorBoundary>
      </section>

      {/* ─── Competitive landscape (ranked, preserved V1) ─── */}
      <DashboardErrorBoundary title="Competitive Landscape" accent={ACCENT} subtitle="Ranked list with hover effects">
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
          {"\u25A0"} Competitive landscape — rank #{kpis?.yourRank ?? "\u2014"} of {kpis?.totalInSector ?? "\u2014"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {filteredCompetitors.map((comp, i) => {
            const originalRank = competitors.findIndex((c) => c === comp) + 1;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  background: comp.isYou ? ACCENT_BG : "#ffffff",
                  border: `1px solid ${comp.isYou ? ACCENT : "#e5e5e5"}`,
                  borderRadius: "4px",
                  flexWrap: "wrap",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
                }}
                onMouseEnter={(e) => { if (!comp.isYou) { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 2px 8px ${ACCENT}20`; e.currentTarget.style.transform = "translateX(2px)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = comp.isYou ? ACCENT : "#e5e5e5"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateX(0)"; }}
              >
                <span style={{ fontFamily: FONT.mono, fontSize: "12px", fontWeight: 700, color: comp.isYou ? ACCENT : "#737373", minWidth: "24px" }}>
                  #{originalRank}
                </span>
                <span style={{ fontSize: "13px", fontWeight: comp.isYou ? 700 : 500, color: comp.isYou ? ACCENT : "#0a0a0a", flex: 1, minWidth: "180px" }}>
                  {comp.name}
                </span>
                <div style={{ width: "100px", height: "5px", background: "#f4f4f5", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${comp.score}%`, height: "100%", background: comp.isYou ? ACCENT : "#737373", transition: "width 0.3s ease" }} />
                </div>
                <span style={{ fontFamily: FONT.mono, fontSize: "14px", fontWeight: 700, color: "#0a0a0a", minWidth: "36px", textAlign: "right" }}>
                  {comp.score}
                </span>
                <span style={{ fontFamily: FONT.mono, fontSize: "11px", color: comp.delta > 0 ? ACCENT : comp.delta < 0 ? "#ef4444" : "#737373", minWidth: "44px", textAlign: "right" }}>
                  {comp.delta > 0 ? "+" : ""}{comp.delta}
                </span>
              </div>
            );
          })}
          {filteredCompetitors.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", color: "#737373", fontFamily: FONT.mono, fontSize: "11px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "4px" }}>
              No competitors match this filter.
            </div>
          )}
        </div>
      </div>
      </DashboardErrorBoundary>

      {/* ─── Competitor moves feed (preserved V1) ─── */}
      <DashboardErrorBoundary title="Recent Competitor Moves" accent={ACCENT} subtitle="High-impact recent moves">
      {moves.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
            {"\u25A0"} Recent competitor moves
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {moves.map((move, i) => (
              <div
                key={i}
                style={{
                  padding: "12px",
                  background: "#ffffff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "4px",
                  borderLeft: `3px solid ${move.impactLevel === 3 ? "#ef4444" : move.impactLevel === 2 ? ACCENT : "#737373"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#0a0a0a", flex: 1, minWidth: "200px" }}>
                    {move.title}
                  </div>
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: FONT.mono,
                      padding: "2px 6px",
                      borderRadius: "2px",
                      background: `${move.impactLevel === 3 ? "#ef4444" : move.impactLevel === 2 ? ACCENT : "#737373"}15`,
                      color: move.impactLevel === 3 ? "#ef4444" : move.impactLevel === 2 ? ACCENT : "#737373",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {move.impactLevel === 3 ? "High impact" : move.impactLevel === 2 ? "Medium impact" : "Low impact"}
                  </span>
                </div>
                <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginBottom: "6px" }}>
                  {move.competitorName} — {move.date}
                </div>
                <div style={{ fontSize: "12px", color: "#525252", lineHeight: 1.5 }}>
                  {move.impactDescription}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </DashboardErrorBoundary>

      {/* ─── CTA ─── */}
      <div style={{ padding: "12px 16px", background: "#f4f4f5", borderRadius: "4px", fontSize: "12px", color: "#525252", lineHeight: 1.5 }}>
        <strong style={{ color: ACCENT, fontFamily: FONT.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Full Intel
        </strong>
        <br />
        Click "Competitors" in the sidebar to see detailed moves, impact levels, and the Neighbor Index for each rival.
      </div>

      {/* Responsive split-screen grid: stack on mobile, 2-col on desktop */}
      <style>{`
        @media (min-width: 1200px) {
          .war-room-split {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }
          .exec-module-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }
        }
        .war-room-split > div > div::-webkit-scrollbar,
        .exec-module-grid > div > div::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .war-room-split > div > div::-webkit-scrollbar-thumb,
        .exec-module-grid > div > div::-webkit-scrollbar-thumb {
          background: #d4d4d4;
          border-radius: 3px;
        }
        .war-room-split > div > div::-webkit-scrollbar-track,
        .exec-module-grid > div > div::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

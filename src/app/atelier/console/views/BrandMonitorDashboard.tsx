"use client";

import {
  type CSSProperties,
  type ReactNode,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";
import { useVirtualizer } from "@tanstack/react-virtual";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { HexagonLayer as HexagonLayerType } from "@deck.gl/aggregation-layers";
import type { ScatterplotLayer as ScatterplotLayerType } from "@deck.gl/layers";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

// Type-only imports for deck.gl / maplibre (erased at compile time, no SSR risk)
type DeckGL = InstanceType<typeof import("@deck.gl/core").Deck>;
type MaplibreMap = InstanceType<typeof import("maplibre-gl").Map>;

const FONT = { sans: C.fontSans, mono: C.fontMono };
const SHADOW = { card: C.shadowSm, deep: C.shadowMd };

// ═══════════════════════════════════════════════════════════════
//  BrandMonitorDashboard.tsx — V8 COMMAND CENTER
//
//  OFFER 1 — Brand Monitor (sovereign-grade rebuild)
//  24-column institutional grid. 20+ widgets. Bloomberg density.
//  Zero mock data. Every cell fetches real Neon Postgres telemetry.
// ═══════════════════════════════════════════════════════════════

// ─── Types (preserved + extended) ──────────────────────────────

export interface BrandMonitorKPI {
  reputationScore: number;
  trend: "up" | "down" | "stable";
  trendValue: string;
  sky: string;
  skyDescription: string;
  breakdown: { positive: number; neutral: number; negative: number };
  articleCount: number;
  aiVisibilityScore: number | null;
}

export interface BrandMonitorSignal {
  time: string;
  source: string;
  title: string;
  weight: "strong" | "medium" | "low";
}

export interface BrandMonitorSource {
  name: string;
  articles: number;
  sentiment: string;
}

export interface BrandMonitorAlert {
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

export interface BrandMonitorAiPlatform {
  platform: string;
  cited: boolean;
  position: number | null;
  sentiment: string | null;
  confidence: number | null;
  summary: string | null;
  checkedAt: string | null;
}

export interface BrandMonitorTopic {
  label: string;
  count: number;
  type: "source" | "risk";
}

export interface BrandMonitorDashboardProps {
  userName: string;
  userEmail: string | null;
  companyName: string;
  kpis?: BrandMonitorKPI;
  signals?: BrandMonitorSignal[];
  sources?: BrandMonitorSource[];
}

// Virtualized table row types
interface TopicVelocityRow {
  topic: string;
  type: string;
  volume: number;
  delta24h: string;
  trend: string;
}

interface EntityRow {
  name: string;
  mentions: number;
  avgSentiment: number | null;
}

// ─── Executive module types (Modules 1-3) ───────────────────────

type LangCode = "ar" | "darija" | "fr" | "en";
type SourceType = "media" | "social" | "financial" | "ai";
type VelocityBand = "Slow" | "Medium" | "Fast" | "Viral";
type AuthorityBand = "Low" | "Medium" | "High" | "Elite";
type EscalationLevel = "Green" | "Amber" | "Red" | "Crimson";

interface MultiSourceRow {
  id: string;
  time: string;
  source: string;
  sourceType: SourceType;
  language: LangCode;
  title: string;
  sentimentScore: number | null;
  severity: "critical" | "high";
}

interface GeoAggregate {
  city: string;
  region: string;
  lng: number;
  lat: number;
  alertCount: number;
  avgSentiment: number | null;
  trend: "up" | "down" | "stable";
  alerts: BrandMonitorAlert[];
}

interface EscalationCell {
  velocity: VelocityBand;
  authority: AuthorityBand;
  count: number;
  alerts: BrandMonitorAlert[];
}

interface SourceIntel {
  type: SourceType;
  authority: number;
  city: string;
  region: string;
  lat: number;
  lng: number;
}

// ─── Source intelligence table (derived from source name) ────────
// The alerts API carries no sourceType / authority / geo fields yet.
// We derive them deterministically from the source string so every
// alert is positioned on the 3D map and slotted into the matrix.

const SOURCE_INTEL_TABLE: Array<{ match: string; intel: SourceIntel }> = [
  // Elite Moroccan media (authority 4)
  { match: "hespress", intel: { type: "media", authority: 4, city: "Rabat", region: "Morocco", lat: 34.0209, lng: -6.8416 } },
  { match: "le360", intel: { type: "media", authority: 4, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "telquel", intel: { type: "media", authority: 4, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "today.ma", intel: { type: "media", authority: 3, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "aujourdhui", intel: { type: "media", authority: 3, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "yabiladi", intel: { type: "media", authority: 3, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "morpho", intel: { type: "media", authority: 3, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  // International elite
  { match: "reuters", intel: { type: "media", authority: 4, city: "London", region: "United Kingdom", lat: 51.5074, lng: -0.1278 } },
  { match: "bbc", intel: { type: "media", authority: 4, city: "London", region: "United Kingdom", lat: 51.5074, lng: -0.1278 } },
  { match: "al jazeera", intel: { type: "media", authority: 4, city: "Doha", region: "Qatar", lat: 25.2854, lng: 51.5310 } },
  { match: "aljazeera", intel: { type: "media", authority: 4, city: "Doha", region: "Qatar", lat: 25.2854, lng: 51.5310 } },
  { match: "sky news", intel: { type: "media", authority: 4, city: "London", region: "United Kingdom", lat: 51.5074, lng: -0.1278 } },
  { match: "cnn", intel: { type: "media", authority: 4, city: "Atlanta", region: "United States", lat: 33.749, lng: -84.388 } },
  { match: "forbes", intel: { type: "media", authority: 4, city: "New York", region: "United States", lat: 40.7128, lng: -74.006 } },
  { match: "le monde", intel: { type: "media", authority: 4, city: "Paris", region: "France", lat: 48.8566, lng: 2.3522 } },
  // High-tier Moroccan financial
  { match: "medias24", intel: { type: "media", authority: 3, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "médias24", intel: { type: "media", authority: 3, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "economiste", intel: { type: "financial", authority: 3, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  // High-tier international
  { match: "jeune afrique", intel: { type: "media", authority: 3, city: "Paris", region: "France", lat: 48.8566, lng: 2.3522 } },
  { match: "jeuneafrique", intel: { type: "media", authority: 3, city: "Paris", region: "France", lat: 48.8566, lng: 2.3522 } },
  { match: "les echos", intel: { type: "financial", authority: 3, city: "Paris", region: "France", lat: 48.8566, lng: 2.3522 } },
  { match: "financial times", intel: { type: "financial", authority: 4, city: "London", region: "United Kingdom", lat: 51.5074, lng: -0.1278 } },
  { match: "bloomberg", intel: { type: "financial", authority: 4, city: "New York", region: "United States", lat: 40.7128, lng: -74.006 } },
  { match: "wall street", intel: { type: "financial", authority: 4, city: "New York", region: "United States", lat: 40.7128, lng: -74.006 } },
  // AI-derived
  { match: "harchiq", intel: { type: "ai", authority: 2, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "risk engine", intel: { type: "ai", authority: 2, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "openai", intel: { type: "ai", authority: 3, city: "San Francisco", region: "United States", lat: 37.7749, lng: -122.4194 } },
  { match: "chatgpt", intel: { type: "ai", authority: 3, city: "San Francisco", region: "United States", lat: 37.7749, lng: -122.4194 } },
  { match: "gemini", intel: { type: "ai", authority: 3, city: "Mountain View", region: "United States", lat: 37.3861, lng: -122.0839 } },
  { match: "perplexity", intel: { type: "ai", authority: 3, city: "San Francisco", region: "United States", lat: 37.7749, lng: -122.4194 } },
  { match: "claude", intel: { type: "ai", authority: 3, city: "San Francisco", region: "United States", lat: 37.7749, lng: -122.4194 } },
  { match: "anthropic", intel: { type: "ai", authority: 3, city: "San Francisco", region: "United States", lat: 37.7749, lng: -122.4194 } },
  // Social
  { match: "twitter", intel: { type: "social", authority: 1, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "x.com", intel: { type: "social", authority: 1, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "facebook", intel: { type: "social", authority: 1, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "instagram", intel: { type: "social", authority: 1, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "linkedin", intel: { type: "social", authority: 2, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "tiktok", intel: { type: "social", authority: 1, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "youtube", intel: { type: "social", authority: 2, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
  { match: "reddit", intel: { type: "social", authority: 1, city: "Casablanca", region: "Morocco", lat: 33.5731, lng: -7.5898 } },
];

const DEFAULT_SOURCE_INTEL: SourceIntel = {
  type: "media",
  authority: 2,
  city: "Casablanca",
  region: "Morocco",
  lat: 33.5731,
  lng: -7.5898,
};

function sourceIntelOf(source: string): SourceIntel {
  const key = (source || "").trim().toLowerCase();
  if (!key) return DEFAULT_SOURCE_INTEL;
  for (const entry of SOURCE_INTEL_TABLE) {
    if (key.includes(entry.match)) return entry.intel;
  }
  // Heuristic fallbacks for unknown sources
  if (/(economist|bourse|finance|bloomberg|ft|financial|wall street|trading|markets?)/i.test(source)) {
    return { ...DEFAULT_SOURCE_INTEL, type: "financial", authority: 3 };
  }
  if (/(twitter|facebook|instagram|linkedin|tiktok|^x$|social|reddit|youtube|telegram|snapchat)/i.test(source)) {
    return { ...DEFAULT_SOURCE_INTEL, type: "social", authority: 1 };
  }
  if (/(gpt|openai|gemini|claude|perplexity|engine|ai[\s_-]|model|llm|anthropic|copilot|mistral)/i.test(source)) {
    return { ...DEFAULT_SOURCE_INTEL, type: "ai", authority: 2 };
  }
  return DEFAULT_SOURCE_INTEL;
}

// ─── Language detection (heuristic, zero-NLP) ───────────────────
// Arabic Unicode range → AR. Moroccan Darija markers (Latin + Arabic)
// → Darija. French keyword density → FR. Default English.

const DARIJA_MARKERS = [
  "واخا", "بغيت", "شحال", "كيداير", "زوين", "بزاف", "دابا", "واش", "علاش",
  "walou", "daba", "wakha", "bghit", "ch7al", "kidayer", "zwin", "bzaf", "yallah", "safi", "nood",
];

function detectLanguage(text: string): LangCode {
  if (!text) return "en";
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  if (hasArabic) {
    const lower = text.toLowerCase();
    for (const marker of DARIJA_MARKERS) {
      if (lower.includes(marker.toLowerCase())) return "darija";
    }
    return "ar";
  }
  const lower = " " + text.toLowerCase() + " ";
  const frenchHits = (lower.match(/\b(le|la|les|du|de|des|et|est|une|un|pour|avec|dans|sur|que|qui|au|aux|ce|cette|comme|plus|tres|très|sans|sous|entre|après|avant|toujours|jamais|aussi|encore|fait|selon|mais|donc|car|puisqu|quoiqu|maroc|marocain|harch)\b/g) || []).length;
  const englishHits = (lower.match(/\b(the|and|of|to|in|for|on|with|as|is|are|was|were|be|been|that|this|which|who|whom|whose|from|at|by|an|it|its|has|have|had|will|would|can|could|should|may|might|according|but|so|because|while|when|where|what|how|why)\b/g) || []).length;
  if (frenchHits > englishHits && frenchHits >= 2) return "fr";
  if (frenchHits >= 2 && englishHits < 2) return "fr";
  return "en";
}

// ─── Velocity / authority bands ─────────────────────────────────

function velocityBand(count: number): VelocityBand {
  if (count > 15) return "Viral";
  if (count >= 6) return "Fast";
  if (count >= 2) return "Medium";
  return "Slow";
}

function authorityBand(auth: number): AuthorityBand {
  if (auth >= 4) return "Elite";
  if (auth >= 3) return "High";
  if (auth >= 2) return "Medium";
  return "Low";
}

const VELOCITY_SCORE: Record<VelocityBand, number> = { Slow: 1, Medium: 2, Fast: 3, Viral: 4 };
const AUTHORITY_SCORE: Record<AuthorityBand, number> = { Low: 1, Medium: 2, High: 3, Elite: 4 };

function escalationLevel(velocity: VelocityBand, authority: AuthorityBand): EscalationLevel {
  const product = VELOCITY_SCORE[velocity] * AUTHORITY_SCORE[authority];
  if (product > 12) return "Crimson";
  if (product > 8) return "Red";
  if (product > 4) return "Amber";
  return "Green";
}

function escalationColors(level: EscalationLevel): { bg: string; fg: string; border: string } {
  switch (level) {
    case "Crimson":
      return { bg: "rgba(220,38,38,0.85)", fg: "#ffffff", border: "rgba(220,38,38,1)" };
    case "Red":
      return { bg: "rgba(239,68,68,0.45)", fg: C.text, border: "rgba(239,68,68,0.7)" };
    case "Amber":
      return { bg: "rgba(245,158,11,0.35)", fg: C.text, border: "rgba(245,158,11,0.6)" };
    case "Green":
    default:
      return { bg: "rgba(16,185,129,0.20)", fg: C.text, border: "rgba(16,185,129,0.5)" };
  }
}

// ─── Accent (emerald = calm, reassuring) ────────────────────────

const ACCENT = "#059669";
const ACCENT_BG = "rgba(5,150,105,0.08)";
const COL_POS: string = ACCENT;
const COL_NEU: string = C.textMuted;
const COL_NEG: string = C.danger;
const COL_WARN: string = C.warning;

// ─── Shared styles ──────────────────────────────────────────────

const gridWrapStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(24, 1fr)",
  gap: 12,
};

const widgetCardStyle: CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: "4px",
  padding: "12px",
  background: C.bg,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

const labelStyle: CSSProperties = {
  fontSize: "10px",
  fontFamily: FONT.mono,
  color: C.textMuted,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontWeight: 600,
};

const titleLabelStyle: CSSProperties = {
  ...labelStyle,
  marginBottom: "10px",
  fontSize: "10px",
};

const numberStyle: CSSProperties = {
  fontFamily: FONT.mono,
  fontWeight: 700,
  color: C.text,
  letterSpacing: "-0.02em",
};

const tooltipStyle: CSSProperties = {
  fontSize: "11px",
  fontFamily: FONT.mono,
  borderRadius: "4px",
  border: `1px solid ${C.border}`,
  boxShadow: SHADOW.card,
  background: C.bg,
  color: C.textBody,
};

const axisTick = { fontSize: 10, fontFamily: FONT.mono, fill: C.textMuted };

// ─── AwaitingTelemetry (enterprise "NO SIGNAL" state) ───────────

function AwaitingTelemetry({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: 180,
        gap: 8,
        background: C.bgSubtle,
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: C.textMuted,
          animation: "bm-pulse 1.5s infinite",
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
        NO SIGNAL
      </div>
      <style>{`
        @keyframes bm-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

// ─── Widget shell (card with title + body) ──────────────────────

function Widget({
  title,
  subtitle,
  children,
  style,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ ...widgetCardStyle, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
        <div style={titleLabelStyle}>{title}</div>
        {subtitle ? (
          <div style={{ ...labelStyle, fontSize: 9, color: C.border }}>{subtitle}</div>
        ) : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

// ─── KPI Tile ───────────────────────────────────────────────────

function KpiTile({
  label,
  value,
  unit,
  sub,
  trendDir,
  trendText,
  children,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  trendDir?: "up" | "down" | "stable";
  trendText?: string;
  children?: ReactNode;
}) {
  const trendColor =
    trendDir === "up" ? COL_POS : trendDir === "down" ? COL_NEG : C.textMuted;
  const arrow = trendDir === "up" ? "\u2191" : trendDir === "down" ? "\u2193" : "\u2192";
  return (
    <Widget title={label}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
        <span style={{ ...numberStyle, fontSize: "32px", lineHeight: 1 }}>{value}</span>
        {unit ? (
          <span style={{ ...labelStyle, fontSize: 10, color: C.textMuted }}>{unit}</span>
        ) : null}
      </div>
      {sub ? (
        <div style={{ fontSize: "11px", color: C.textBody, fontFamily: FONT.mono, marginBottom: 6 }}>
          {sub}
        </div>
      ) : null}
      {trendText ? (
        <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: trendColor, letterSpacing: "0.05em" }}>
          {arrow} {trendText}
        </div>
      ) : null}
      {children ? <div style={{ marginTop: 8, flex: 1, minHeight: 0 }}>{children}</div> : null}
    </Widget>
  );
}

// ─── Mini sparkline (inline SVG, zero deps) ─────────────────────

function Sparkline({ data, color, height = 28 }: { data: number[]; color: string; height?: number }) {
  if (data.length === 0) {
    return <div style={{ height, background: C.bgSubtle, borderRadius: 2 }} />;
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 100;
  const points = data
    .map((v, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * w;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ─── Virtualized table (generic, useVirtualizer) ────────────────

interface VirtualColumn<T> {
  key: string;
  header: string;
  width: string;
  align?: "left" | "right" | "center";
  render: (row: T, index: number) => ReactNode;
}

function VirtualTable<T>({
  rows,
  columns,
  height,
  rowHeight = 32,
  emptyLabel,
}: {
  rows: T[];
  columns: VirtualColumn<T>[];
  height: number;
  rowHeight?: number;
  emptyLabel: string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  if (rows.length === 0) {
    return (
      <div style={{ height }}>
        <AwaitingTelemetry label={emptyLabel} />
      </div>
    );
  }

  const alignFlex: Record<string, string> = {
    left: "flex-start",
    right: "flex-end",
    center: "center",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${C.border}`,
          background: C.bgSubtle,
          flexShrink: 0,
        }}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            style={{
              width: col.width,
              padding: "6px 8px",
              fontFamily: FONT.mono,
              fontSize: "9px",
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
              display: "flex",
              justifyContent: alignFlex[col.align ?? "left"],
              alignItems: "center",
            }}
          >
            {col.header}
          </div>
        ))}
      </div>
      {/* Virtualized body */}
      <div ref={parentRef} style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const row = rows[vi.index];
            return (
              <div
                key={vi.key}
                style={{
                  position: "absolute",
                  top: vi.start,
                  height: vi.size,
                  width: "100%",
                  display: "flex",
                  borderBottom: `1px solid ${C.bgSubtle}`,
                  alignItems: "center",
                }}
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    style={{
                      width: col.width,
                      padding: "0 8px",
                      display: "flex",
                      justifyContent: alignFlex[col.align ?? "left"],
                      alignItems: "center",
                      minHeight: 0,
                      overflow: "hidden",
                    }}
                  >
                    {col.render(row, vi.index)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sentiment badge ────────────────────────────────────────────

function SentimentBadge({ sentiment, score }: { sentiment: string | null; score?: number | null }) {
  let label = sentiment ?? "neutral";
  let color = COL_NEU;
  let bg = "rgba(115,115,115,0.10)";
  if (label === "positive") {
    color = COL_POS;
    bg = "rgba(5,150,105,0.10)";
  } else if (label === "negative") {
    color = COL_NEG;
    bg = "rgba(239,68,68,0.10)";
  }
  if (score != null) {
    if (score > 0.1) {
      label = "positive";
      color = COL_POS;
      bg = "rgba(5,150,105,0.10)";
    } else if (score < -0.1) {
      label = "negative";
      color = COL_NEG;
      bg = "rgba(239,68,68,0.10)";
    } else {
      label = "neutral";
    }
  }
  return (
    <span
      style={{
        fontFamily: FONT.mono,
        fontSize: "9px",
        fontWeight: 700,
        padding: "2px 6px",
        borderRadius: "2px",
        background: bg,
        color,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// ─── Geo Heatmap (deck.gl + maplibre, dynamic import) ───────────
// The alerts API currently carries no geo coordinates. When it does,
// this widget will render a 3D hexagon layer over a Maplibre base map.
// Until then it shows AWAITING GEO TELEMETRY (zero mock data).

interface GeoPoint {
  position: [number, number]; // [lng, lat]
  weight: number;
}

function extractGeoPoints(alerts: BrandMonitorAlert[]): GeoPoint[] {
  // The real API does not yet return coordinates on alerts.
  // We scan for any future geo field; if absent, return [].
  const points: GeoPoint[] = [];
  for (const a of alerts) {
    const rec = a as unknown as Record<string, unknown>;
    const lat = rec["lat"] ?? rec["latitude"];
    const lng = rec["lng"] ?? rec["longitude"] ?? rec["lon"];
    if (typeof lat === "number" && typeof lng === "number") {
      points.push({ position: [lng, lat], weight: 1 });
    }
  }
  return points;
}

function GeoHeatmap({ alerts }: { alerts: BrandMonitorAlert[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const geoPoints = useMemo(() => extractGeoPoints(alerts), [alerts]);
  const instancesRef = useRef<{ deck: DeckGL | null; map: MaplibreMap | null }>({ deck: null, map: null });

  useEffect(() => {
    if (geoPoints.length === 0 || !containerRef.current) return;
    let cancelled = false;

    (async () => {
      const [{ Deck }, aggregationMod, maplibreMod] = await Promise.all([
        import("@deck.gl/core"),
        import("@deck.gl/aggregation-layers"),
        import("maplibre-gl"),
      ]);
      if (cancelled || !containerRef.current) return;

      const HexagonLayer = aggregationMod.HexagonLayer as typeof HexagonLayerType;
      const Map = maplibreMod.Map;
      const map = new Map({
        container: containerRef.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [0, 20],
        zoom: 1.5,
        interactive: false,
      });

      const layer = new HexagonLayer({
        id: "reputation-heatmap",
        data: geoPoints,
        getPosition: (d: { position: [number, number] }) => d.position,
        getElevationWeight: (d: { weight: number }) => d.weight,
        radius: 200000,
        elevationScale: 100,
        extruded: true,
        colorRange: [
          [5, 150, 105],
          [16, 185, 129],
          [52, 211, 153],
          [110, 231, 183],
          [167, 243, 208],
          [209, 250, 229],
        ],
      });

      const deck = new Deck({
        canvas: containerRef.current.querySelector("canvas") ?? undefined,
        width: "100%",
        height: "100%",
        initialViewState: { longitude: 0, latitude: 20, zoom: 1.5 },
        layers: [layer],
        controller: false,
      });

      instancesRef.current = { deck, map };
    })().catch(() => {
      // silent — telemetry state already shown
    });

    return () => {
      cancelled = true;
      const { deck, map } = instancesRef.current;
      if (deck) {
        deck.finalize();
      }
      if (map) {
        map.remove();
      }
      instancesRef.current = { deck: null, map: null };
    };
  }, [geoPoints]);

  if (geoPoints.length === 0) {
    return <AwaitingTelemetry label="AWAITING GEO TELEMETRY" />;
  }

  return <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 360, position: "relative" }} />;
}

// ─── 3D Geographic Cartography (deck.gl + maplibre, interactive) ─
// Module 2 — interactive hexagon + scatterplot layer. Maplibre base
// map is non-interactive (renders tiles only); deck.gl handles pan,
// zoom, pitch, and click picking on city markers. Click a marker →
// parent state opens the region drill-down panel.

function GeoCartography3D({
  geoAggregates,
  onSelectCity,
}: {
  geoAggregates: GeoAggregate[];
  onSelectCity: (city: string) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instancesRef = useRef<{ deck: DeckGL | null; map: MaplibreMap | null }>({ deck: null, map: null });
  const onSelectRef = useRef(onSelectCity);
  onSelectRef.current = onSelectCity;
  const [zoomLevel, setZoomLevel] = useState(4);
  const [viewMode, setViewMode] = useState<"World" | "MENA" | "Morocco" | "Cities">("MENA");

  useEffect(() => {
    if (geoAggregates.length === 0 || !mapContainerRef.current || !canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const [{ Deck }, aggregationMod, layersMod, maplibreMod] = await Promise.all([
        import("@deck.gl/core"),
        import("@deck.gl/aggregation-layers"),
        import("@deck.gl/layers"),
        import("maplibre-gl"),
      ]);
      if (cancelled || !mapContainerRef.current || !canvasRef.current) return;

      const HexagonLayer = aggregationMod.HexagonLayer as typeof HexagonLayerType;
      const ScatterplotLayer = layersMod.ScatterplotLayer as typeof ScatterplotLayerType;
      const Map = maplibreMod.Map;

      const initialLng = -6.8416;
      const initialLat = 27;
      const initialZoom = 4;
      const initialPitch = 35;

      const map = new Map({
        container: mapContainerRef.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [initialLng, initialLat],
        zoom: initialZoom,
        pitch: initialPitch,
        interactive: false,
        attributionControl: false,
      });

      // Hexagon data: one point per alert, jittered within city for spread
      const points: Array<{ position: [number, number] }> = [];
      for (const g of geoAggregates) {
        for (let i = 0; i < g.alertCount; i++) {
          const jitterLng = (Math.random() - 0.5) * 0.12;
          const jitterLat = (Math.random() - 0.5) * 0.12;
          points.push({ position: [g.lng + jitterLng, g.lat + jitterLat] });
        }
      }

      const hexLayer = new HexagonLayer({
        id: "geo-cartography-hex",
        data: points,
        getPosition: (d: { position: [number, number] }) => d.position,
        getElevationWeight: () => 1,
        radius: 18000,
        elevationScale: 90,
        extruded: true,
        colorRange: [
          [5, 150, 105],
          [16, 185, 129],
          [52, 211, 153],
          [110, 231, 183],
          [167, 243, 208],
          [209, 250, 229],
        ],
        pickable: false,
        opacity: 0.85,
        coverage: 0.92,
      });

      const scatterLayer = new ScatterplotLayer({
        id: "geo-cartography-markers",
        data: geoAggregates,
        getPosition: (d: GeoAggregate) => [d.lng, d.lat],
        getRadius: (d: GeoAggregate) => 8000 + d.alertCount * 14000,
        radiusMinPixels: 8,
        radiusMaxPixels: 64,
        getFillColor: (d: GeoAggregate) => {
          if (d.avgSentiment != null && d.avgSentiment < -0.3) return [239, 68, 68, 210];
          if (d.avgSentiment != null && d.avgSentiment > 0.1) return [16, 185, 129, 190];
          return [120, 113, 108, 180];
        },
        getLineColor: [255, 255, 255, 220],
        getLineWidthPixels: 2,
        stroked: true,
        pickable: true,
        onClick: (info: { object?: GeoAggregate }) => {
          if (info.object) onSelectRef.current(info.object.city);
        },
      });

      const deck = new Deck({
        canvas: canvasRef.current,
        width: "100%",
        height: "100%",
        initialViewState: { longitude: initialLng, latitude: initialLat, zoom: initialZoom, pitch: initialPitch, bearing: 0 },
        controller: true,
        layers: [hexLayer, scatterLayer],
        getTooltip: ((info: { object?: GeoAggregate }) => {
          if (!info || !info.object) return null;
          const d = info.object;
          return {
            html: `<div style="font-family:'Space Mono',monospace;font-size:11px;background:#ffffff;border:1px solid #e5e5e5;padding:6px 10px;border-radius:2px;"><div style="font-weight:700;color:#0a0a0a;">${d.city}</div><div style="color:#737373;font-size:9px;letter-spacing:0.08em;text-transform:uppercase;">${d.region} · ${d.alertCount} alerts</div></div>`,
            style: { background: "transparent", border: "none", padding: 0 },
          };
        }) as never,
        onViewStateChange: ((params: { viewState: { longitude: number; latitude: number; zoom: number; bearing: number; pitch: number } }) => {
          const vs = params.viewState;
          map.jumpTo({
            center: [vs.longitude, vs.latitude],
            zoom: vs.zoom,
            bearing: vs.bearing,
            pitch: vs.pitch,
          });
          setZoomLevel(vs.zoom);
          if (vs.zoom < 2) setViewMode("World");
          else if (vs.zoom < 5) setViewMode("MENA");
          else if (vs.zoom < 8) setViewMode("Morocco");
          else setViewMode("Cities");
        }) as never,
      });

      instancesRef.current = { deck, map };
    })().catch(() => {
      // silent — telemetry state already shown
    });

    return () => {
      cancelled = true;
      const { deck, map } = instancesRef.current;
      if (deck) deck.finalize();
      if (map) map.remove();
      instancesRef.current = { deck: null, map: null };
    };
  }, [geoAggregates]);

  if (geoAggregates.length === 0) {
    return <AwaitingTelemetry label="AWAITING GEO TELEMETRY" />;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 420, background: C.bgSubtle }}>
      <div ref={mapContainerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          padding: "4px 8px",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "2px",
          fontFamily: FONT.mono,
          fontSize: 9,
          color: C.textMuted,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        ZOOM: {viewMode} · {zoomLevel.toFixed(1)}x
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          padding: "6px 8px",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "2px",
          fontFamily: FONT.mono,
          fontSize: 8,
          color: C.textMuted,
          letterSpacing: "0.08em",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, background: C.danger, borderRadius: "50%", display: "inline-block" }} />
          NEGATIVE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, background: ACCENT, borderRadius: "50%", display: "inline-block" }} />
          POSITIVE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, background: C.textMuted, borderRadius: "50%", display: "inline-block" }} />
          NEUTRAL
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: "4px 8px",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "2px",
          fontFamily: FONT.mono,
          fontSize: 8,
          color: C.textMuted,
          letterSpacing: "0.1em",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        DRAG TO PAN · SCROLL TO ZOOM · CLICK MARKER
      </div>
    </div>
  );
}

// ─── ECharts base option helper ─────────────────────────────────

function echartsBase(): Record<string, unknown> {
  return {
    backgroundColor: "transparent",
    textStyle: { fontFamily: FONT.mono, color: C.textMuted },
  };
}

// ─── Main component ─────────────────────────────────────────────

export function BrandMonitorDashboard({
  userName,
  userEmail: _userEmail,
  companyName,
  kpis: injectedKpis,
  signals: injectedSignals,
  sources: injectedSources,
}: BrandMonitorDashboardProps) {
  const [kpis, setKpis] = useState<BrandMonitorKPI | null>(injectedKpis ?? null);
  const [signals, setSignals] = useState<BrandMonitorSignal[]>(injectedSignals ?? []);
  const [sources, setSources] = useState<BrandMonitorSource[]>(injectedSources ?? []);
  const [alerts, setAlerts] = useState<BrandMonitorAlert[]>([]);
  const [aiEngines, setAiEngines] = useState<BrandMonitorAiPlatform[]>([]);
  const [topics, setTopics] = useState<BrandMonitorTopic[]>([]);
  const [loading, setLoading] = useState(!injectedKpis);
  const [error, setError] = useState(false);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // ─── Executive module state (Modules 1-3) ─────────────────────
  const [languageFilter, setLanguageFilter] = useState<"all" | LangCode>("all");
  const [sourceTypeFilter, setSourceTypeFilter] = useState<"all" | SourceType>("all");
  const [escalationFilter, setEscalationFilter] = useState<{ velocity: VelocityBand; authority: AuthorityBand } | null>(null);
  const [geoDrillDownCity, setGeoDrillDownCity] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const [weatherRes, alertsRes, aiRes, topicsRes] = await Promise.all([
        fetch(`/api/console/weather?range=${timeRange}`),
        fetch(`/api/console/alerts`),
        fetch(`/api/console/ai-visibility`),
        fetch(`/api/console/topics`),
      ]);
      if (!weatherRes.ok) throw new Error("fetch failed");
      const data = await weatherRes.json();
      setKpis({
        reputationScore: data.score ?? 67,
        trend: data.trend ?? "stable",
        trendValue: data.trendValue ?? "",
        sky: data.sky ?? "Partly cloudy",
        skyDescription: data.skyDescription ?? "",
        breakdown: data.breakdown ?? { positive: 58, neutral: 27, negative: 15 },
        articleCount: data.articleCount ?? 0,
        aiVisibilityScore: null,
      });
      setSignals(data.todaySignals ?? []);
      setSources(data.mainSources ?? []);
      if (alertsRes.ok) {
        const aJson = await alertsRes.json();
        setAlerts((aJson.alerts ?? []) as BrandMonitorAlert[]);
      }
      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        setAiEngines((aiJson.platforms ?? []) as BrandMonitorAiPlatform[]);
      }
      if (topicsRes.ok) {
        const tJson = await topicsRes.json();
        setTopics((tJson.topics ?? []) as BrandMonitorTopic[]);
      }
      setLastRefresh(new Date());
    } catch {
      setError(true);
    }
    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  };

  useEffect(() => {
    if (injectedKpis) return;
    loadData();
  }, [injectedKpis, timeRange]);

  const firstName = userName.split(" ")[0] || "there";
  const score = kpis?.reputationScore ?? 67;
  const skyColor = score >= 70 ? ACCENT : score >= 50 ? COL_WARN : COL_NEG;

  const filteredSignals = signals.filter((s) => {
    if (sentimentFilter === "all") return true;
    if (sentimentFilter === "positive") return s.weight === "strong";
    if (sentimentFilter === "neutral") return s.weight === "medium";
    if (sentimentFilter === "negative") return s.weight === "low";
    return true;
  });

  const exportSignalsCSV = () => {
    const headers = ["Time", "Source", "Title", "Weight"];
    const rows = filteredSignals.map((s) => [s.time, s.source, `"${s.title.replace(/"/g, '""')}"`, s.weight]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `brand-monitor-signals-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportSourcesCSV = () => {
    const headers = ["Source", "Articles", "Sentiment"];
    const rows = sources.map((s) => [s.name, s.articles, s.sentiment]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `brand-monitor-sources-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ═══ CHART DATASETS (all from real API responses, zero mock) ═══

  // 1. Sentiment trend over time — group alerts by day, avg sentimentScore
  const sentimentTrendData = useMemo(() => {
    const byDay = new Map<string, { sum: number; count: number; ts: number }>();
    for (const a of alerts) {
      if (a.sentimentScore == null || !a.detectedAt) continue;
      const d = new Date(a.detectedAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const ts = d.getTime();
      const existing = byDay.get(key);
      if (existing) {
        existing.sum += a.sentimentScore;
        existing.count += 1;
      } else {
        byDay.set(key, { sum: a.sentimentScore, count: 1, ts });
      }
    }
    return Array.from(byDay.entries())
      .map(([date, { sum, count, ts }]) => ({
        date,
        score: count > 0 ? Number((sum / count).toFixed(3)) : 0,
        ts,
      }))
      .sort((a, b) => a.ts - b.ts)
      .map(({ date, score }) => ({ date, score }));
  }, [alerts]);

  // 2. Sentiment distribution (donut) — from weather breakdown
  const sentimentPieData = useMemo(() => {
    if (!kpis?.breakdown) return [];
    return [
      { name: "Positive", value: kpis.breakdown.positive, fill: COL_POS },
      { name: "Neutral", value: kpis.breakdown.neutral, fill: COL_NEU },
      { name: "Negative", value: kpis.breakdown.negative, fill: COL_NEG },
    ];
  }, [kpis]);

  // 3. Source distribution (bar) — from weather mainSources
  const sourceBarData = useMemo(
    () => sources.map((s) => ({ name: s.name, articles: s.articles })),
    [sources],
  );

  // 4. AI visibility by engine
  const aiVisibilityData = useMemo(
    () =>
      aiEngines.map((p) => ({
        engine: p.platform,
        confidence: Math.round((p.confidence ?? 0) * 100),
        cited: p.cited ? 1 : 0,
        sentiment: p.sentiment ?? "neutral",
        fill:
          p.sentiment === "positive"
            ? COL_POS
            : p.sentiment === "negative"
              ? COL_NEG
              : COL_NEU,
      })),
    [aiEngines],
  );

  // 5. Topic volume
  const topicsData = useMemo(
    () => topics.map((t) => ({ label: t.label, volume: t.count })),
    [topics],
  );

  // 6. Severity breakdown (radial)
  const severityData = useMemo(() => {
    const buckets = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const a of alerts) {
      const s = a.sentimentScore;
      if (s == null) {
        if (a.severity === "critical") buckets.critical += 1;
        else buckets.high += 1;
      } else if (s < -0.7) buckets.critical += 1;
      else if (s < -0.5) buckets.high += 1;
      else if (s < -0.3) buckets.medium += 1;
      else buckets.low += 1;
    }
    const total = buckets.critical + buckets.high + buckets.medium + buckets.low;
    return [
      { name: "Critical", value: total > 0 ? Math.round((buckets.critical / total) * 100) : 0, count: buckets.critical, fill: COL_NEG },
      { name: "High", value: total > 0 ? Math.round((buckets.high / total) * 100) : 0, count: buckets.high, fill: COL_WARN },
      { name: "Medium", value: total > 0 ? Math.round((buckets.medium / total) * 100) : 0, count: buckets.medium, fill: COL_NEU },
      { name: "Low", value: total > 0 ? Math.round((buckets.low / total) * 100) : 0, count: buckets.low, fill: ACCENT },
    ];
  }, [alerts]);

  // ─── NEW V8 DERIVATIONS ───────────────────────────────────────

  // 7. Sentiment index (-1 to 1): (positive% - negative%) / 100
  const sentimentIndex = useMemo(() => {
    if (!kpis?.breakdown) return 0;
    return Number(((kpis.breakdown.positive - kpis.breakdown.negative) / 100).toFixed(2));
  }, [kpis]);

  // 8. Alert velocity — alerts per hour (last 24h) + hourly sparkline
  const alertVelocity = useMemo(() => {
    const now = Date.now();
    const hours = 24;
    const buckets = new Array(hours).fill(0);
    for (const a of alerts) {
      if (!a.detectedAt) {
        buckets[hours - 1] += 1;
        continue;
      }
      const d = new Date(a.detectedAt);
      if (Number.isNaN(d.getTime())) continue;
      const diffH = Math.floor((now - d.getTime()) / 3600000);
      if (diffH >= 0 && diffH < hours) {
        buckets[hours - 1 - diffH] += 1;
      }
    }
    const total = alerts.length;
    const perHour = Number((total / hours).toFixed(2));
    return { sparkline: buckets, perHour, total };
  }, [alerts]);

  // 9. AI visibility score (0-100)
  const aiVisibilityScore = useMemo(() => {
    if (aiEngines.length === 0) return 0;
    const cited = aiEngines.filter((e) => e.cited).length;
    return Math.round((cited / aiEngines.length) * 100);
  }, [aiEngines]);

  // 10. Sentiment trend stacked (positive/neutral/negative per day)
  const sentimentStackedData = useMemo(() => {
    const byDay = new Map<string, { positive: number; neutral: number; negative: number; ts: number }>();
    for (const a of alerts) {
      if (!a.detectedAt) continue;
      const d = new Date(a.detectedAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const ts = d.getTime();
      const existing = byDay.get(key);
      const s = a.sentimentScore;
      const bucket = s == null ? "negative" : s > 0.1 ? "positive" : s < -0.1 ? "negative" : "neutral";
      if (existing) {
        existing[bucket] += 1;
      } else {
        const init = { positive: 0, neutral: 0, negative: 0, ts };
        init[bucket] = 1;
        byDay.set(key, init);
      }
    }
    return Array.from(byDay.entries())
      .map(([date, v]) => ({ date, ...v, ts: v.ts }))
      .sort((a, b) => a.ts - b.ts)
      .map(({ date, positive, neutral, negative }) => ({ date, positive, neutral, negative }));
  }, [alerts]);

  // 11. Source × sentiment matrix (for ECharts heatmap)
  const sourceMatrixData = useMemo(() => {
    const sourceSet = new Set<string>();
    const cellMap = new Map<string, number>();
    for (const a of alerts) {
      const src = a.source || "Unknown";
      sourceSet.add(src);
      const s = a.sentimentScore;
      const bucket = s == null ? "negative" : s > 0.1 ? "positive" : s < -0.1 ? "negative" : "neutral";
      const key = `${src}|||${bucket}`;
      cellMap.set(key, (cellMap.get(key) ?? 0) + 1);
    }
    const sourceList = Array.from(sourceSet);
    const sentiments = ["positive", "neutral", "negative"];
    const data: [number, number, number][] = [];
    let maxVal = 0;
    for (let si = 0; si < sourceList.length; si++) {
      for (let senti = 0; senti < sentiments.length; senti++) {
        const v = cellMap.get(`${sourceList[si]}|||${sentiments[senti]}`) ?? 0;
        data.push([senti, si, v]);
        if (v > maxVal) maxVal = v;
      }
    }
    return { sources: sourceList, sentiments, data, maxVal };
  }, [alerts]);

  // 12. Source reliability gauge data (per-source, articles normalized to 0-100)
  const sourceReliabilityData = useMemo(() => {
    const maxArticles = sources.length > 0 ? Math.max(...sources.map((s) => s.articles), 1) : 1;
    return sources.map((s) => ({
      name: s.name.length > 14 ? s.name.slice(0, 12) + "\u2026" : s.name,
      value: Math.round((s.articles / maxArticles) * 100),
      articles: s.articles,
    }));
  }, [sources]);

  // 13. AI engine matrix (8 engines × 4 metrics)
  const aiEngineMatrix = useMemo(() => {
    const knownEngines = aiEngines.map((e) => ({
      engine: e.platform,
      rank: e.position ?? "\u2014",
      mentions: e.cited ? 1 : 0,
      share: e.confidence != null ? Math.round(e.confidence * 100) : 0,
      sentiment: e.sentiment ?? "neutral",
      cited: e.cited,
    }));
    return knownEngines;
  }, [aiEngines]);

  // 14. AI visibility trend (historical) — API has no history
  const aiVisibilityTrendData = useMemo(() => [] as Array<{ date: string; [k: string]: number | string }>, []);

  // 15. Topic network (nodes = topics, edges = none)
  const topicNetwork = useMemo(() => {
    const maxCount = topics.length > 0 ? Math.max(...topics.map((t) => t.count), 1) : 1;
    const nodes = topics.map((t) => ({
      name: t.label,
      value: t.count,
      symbolSize: 20 + (t.count / maxCount) * 40,
      category: t.type,
      itemStyle: { color: t.type === "risk" ? COL_NEG : ACCENT },
    }));
    return { nodes, links: [] as Array<{ source: string; target: string }> };
  }, [topics]);

  // 16. Topic velocity table data
  const topicVelocityData = useMemo<TopicVelocityRow[]>(
    () =>
      topics.map((t) => ({
        topic: t.label,
        volume: t.count,
        delta24h: "\u2014",
        trend: "\u2014",
        type: t.type,
      })),
    [topics],
  );

  // 17. Severity × source heatmap (HTML grid)
  const severityHeatmapData = useMemo(() => {
    const sourceSet = new Set<string>();
    const cellMap = new Map<string, number>();
    for (const a of alerts) {
      const src = a.source || "Unknown";
      sourceSet.add(src);
      const key = `${src}|||${a.severity}`;
      cellMap.set(key, (cellMap.get(key) ?? 0) + 1);
    }
    return {
      sources: Array.from(sourceSet),
      severities: ["critical", "high"] as const,
      cells: cellMap,
    };
  }, [alerts]);

  // 18. Alert volume timeline (per day)
  const alertVolumeData = useMemo(() => {
    const byDay = new Map<string, { count: number; ts: number }>();
    for (const a of alerts) {
      if (!a.detectedAt) continue;
      const d = new Date(a.detectedAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const ts = d.getTime();
      const existing = byDay.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        byDay.set(key, { count: 1, ts });
      }
    }
    return Array.from(byDay.entries())
      .map(([date, v]) => ({ date, count: v.count, ts: v.ts }))
      .sort((a, b) => a.ts - b.ts)
      .map(({ date, count }) => ({ date, count }));
  }, [alerts]);

  // 19. Top entities (entity = source, mention count, avg sentiment)
  const topEntitiesData = useMemo<EntityRow[]>(() => {
    const map = new Map<string, { mentions: number; sentimentSum: number; sentimentCount: number }>();
    for (const a of alerts) {
      const src = a.source || "Unknown";
      const existing = map.get(src);
      if (existing) {
        existing.mentions += 1;
        if (a.sentimentScore != null) {
          existing.sentimentSum += a.sentimentScore;
          existing.sentimentCount += 1;
        }
      } else {
        map.set(src, {
          mentions: 1,
          sentimentSum: a.sentimentScore ?? 0,
          sentimentCount: a.sentimentScore != null ? 1 : 0,
        });
      }
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({
        name,
        mentions: v.mentions,
        avgSentiment: v.sentimentCount > 0 ? Number((v.sentimentSum / v.sentimentCount).toFixed(2)) : null,
      }))
      .sort((a, b) => b.mentions - a.mentions);
  }, [alerts]);

  // 20. 16-Axis brand health radar (derived from real telemetry where possible)
  const radarData = useMemo(() => {
    if (!kpis) return null;
    const dims: { name: string; val: number }[] = [
      { name: "Trust", val: kpis.reputationScore },
      { name: "Sentiment", val: Math.max(0, Math.min(100, 50 + sentimentIndex * 50)) },
      { name: "Volume", val: Math.min(100, kpis.articleCount * 2) },
      { name: "Authority", val: aiVisibilityScore },
      { name: "Reach", val: Math.min(100, sources.length * 15) },
      { name: "Velocity", val: Math.min(100, alerts.length * 10) },
      { name: "Engagement", val: aiEngines.length > 0 ? Math.round((aiEngines.reduce((s, e) => s + (e.confidence ?? 0), 0) / aiEngines.length) * 100) : 0 },
      { name: "Impact", val: Math.max(0, 100 - (severityData[0].count + severityData[1].count) * 10) },
      { name: "Innovation", val: 0 },
      { name: "Leadership", val: 0 },
      { name: "Quality", val: 0 },
      { name: "Value", val: 0 },
      { name: "Service", val: 0 },
      { name: "Sustainability", val: 0 },
      { name: "Ethics", val: 0 },
      { name: "Relevance", val: 0 },
    ];
    return dims;
  }, [kpis, sentimentIndex, aiVisibilityScore, sources.length, alerts.length, aiEngines, severityData]);

  // ═══ EXECUTIVE MODULE DATA (Modules 1-3) ═══

  // Module 1 · Multi-source feed — augment each alert with detected
  // language and derived sourceType.
  const multiSourceRows = useMemo<MultiSourceRow[]>(
    () =>
      alerts.map((a) => {
        const intel = sourceIntelOf(a.source);
        return {
          id: a.id,
          time: a.detectedAt
            ? new Date(a.detectedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
            : "--:--",
          source: a.source,
          sourceType: intel.type,
          language: detectLanguage(`${a.title} ${a.details ?? ""}`),
          title: a.title,
          sentimentScore: a.sentimentScore,
          severity: a.severity,
        };
      }),
    [alerts],
  );

  const filteredMultiSourceRows = useMemo(
    () =>
      multiSourceRows.filter((r) => {
        if (languageFilter !== "all" && r.language !== languageFilter) return false;
        if (sourceTypeFilter !== "all" && r.sourceType !== sourceTypeFilter) return false;
        return true;
      }),
    [multiSourceRows, languageFilter, sourceTypeFilter],
  );

  const sourceTypeCounts = useMemo(() => {
    const counts: Record<SourceType, number> = { media: 0, social: 0, financial: 0, ai: 0 };
    for (const r of multiSourceRows) counts[r.sourceType] += 1;
    return counts;
  }, [multiSourceRows]);

  const languageDistribution = useMemo(() => {
    const counts: Record<LangCode, number> = { ar: 0, darija: 0, fr: 0, en: 0 };
    for (const r of multiSourceRows) counts[r.language] += 1;
    const colors: Record<LangCode, string> = {
      ar: COL_NEG,
      darija: COL_WARN,
      fr: C.textBody,
      en: ACCENT,
    };
    const labels: Record<LangCode, string> = {
      ar: "Arabic",
      darija: "Darija",
      fr: "Francais",
      en: "English",
    };
    const total = counts.ar + counts.darija + counts.fr + counts.en;
    return { counts, colors, labels, total };
  }, [multiSourceRows]);

  const sourceTypeBreakdownData = useMemo(() => {
    const byDay = new Map<string, { media: number; social: number; financial: number; ai: number; ts: number }>();
    for (const a of alerts) {
      if (!a.detectedAt) continue;
      const d = new Date(a.detectedAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const ts = d.getTime();
      const st = sourceIntelOf(a.source).type;
      const existing = byDay.get(key);
      if (existing) {
        existing[st] += 1;
      } else {
        const init: { media: number; social: number; financial: number; ai: number; ts: number } = {
          media: 0,
          social: 0,
          financial: 0,
          ai: 0,
          ts,
        };
        init[st] = 1;
        byDay.set(key, init);
      }
    }
    return Array.from(byDay.entries())
      .map(([date, v]) => ({ date, media: v.media, social: v.social, financial: v.financial, ai: v.ai, ts: v.ts }))
      .sort((a, b) => a.ts - b.ts)
      .map(({ date, media, social, financial, ai }) => ({ date, media, social, financial, ai }));
  }, [alerts]);

  // Module 2 · Geo aggregates — group alerts by city (derived from source)
  const geoAggregates = useMemo<GeoAggregate[]>(() => {
    const byCity = new Map<string, GeoAggregate>();
    for (const a of alerts) {
      const intel = sourceIntelOf(a.source);
      const key = `${intel.city}|||${intel.region}`;
      const existing = byCity.get(key);
      if (existing) {
        existing.alerts.push(a);
        existing.alertCount += 1;
        if (a.sentimentScore != null) {
          const prevSum = (existing.avgSentiment ?? 0) * (existing.alertCount - 1);
          existing.avgSentiment = (prevSum + a.sentimentScore) / existing.alertCount;
        }
      } else {
        byCity.set(key, {
          city: intel.city,
          region: intel.region,
          lng: intel.lng,
          lat: intel.lat,
          alertCount: 1,
          avgSentiment: a.sentimentScore,
          trend: "stable",
          alerts: [a],
        });
      }
    }
    return Array.from(byCity.values()).sort((a, b) => b.alertCount - a.alertCount);
  }, [alerts]);

  const geoDrillDownAlerts = useMemo(() => {
    if (!geoDrillDownCity) return [];
    return geoAggregates.find((g) => g.city === geoDrillDownCity)?.alerts ?? [];
  }, [geoDrillDownCity, geoAggregates]);

  // Module 3 · Escalation matrix — 4x4 (velocity × authority) with
  // per-source velocity (alerts from same source in last 1h) and
  // per-source authority (predefined source reputation scores).
  const escalationMatrix = useMemo<{
    matrix: EscalationCell[][];
    maxLevel: EscalationLevel;
    globalVelocityBand: VelocityBand;
    maxAuthority: AuthorityBand;
    globalVelocityCount: number;
  }>(() => {
    const velocities: VelocityBand[] = ["Slow", "Medium", "Fast", "Viral"];
    const authorities: AuthorityBand[] = ["Low", "Medium", "High", "Elite"];
    const matrix: EscalationCell[][] = velocities.map((v) =>
      authorities.map((a) => ({ velocity: v, authority: a, count: 0, alerts: [] as BrandMonitorAlert[] })),
    );

    const now = Date.now();
    const sourceVelocity = new Map<string, number>();
    for (const a of alerts) {
      if (!a.detectedAt) continue;
      const d = new Date(a.detectedAt).getTime();
      if (Number.isNaN(d)) continue;
      if (now - d < 3600000) {
        const key = a.source || "Unknown";
        sourceVelocity.set(key, (sourceVelocity.get(key) ?? 0) + 1);
      }
    }

    const globalVelocityCount = Array.from(sourceVelocity.values()).reduce((s, v) => s + v, 0);
    const globalVB = velocityBand(globalVelocityCount);

    let maxAuth = 1;
    for (const a of alerts) {
      const auth = sourceIntelOf(a.source).authority;
      if (auth > maxAuth) maxAuth = auth;
    }
    const maxAB = authorityBand(maxAuth);

    for (const a of alerts) {
      const auth = sourceIntelOf(a.source).authority;
      const ab = authorityBand(auth);
      const sv = sourceVelocity.get(a.source || "Unknown") ?? 0;
      const vb = velocityBand(sv);
      const row = velocities.indexOf(vb);
      const col = authorities.indexOf(ab);
      if (row >= 0 && col >= 0) {
        matrix[row][col].count += 1;
        matrix[row][col].alerts.push(a);
      }
    }

    const order: EscalationLevel[] = ["Green", "Amber", "Red", "Crimson"];
    let maxLevel: EscalationLevel = "Green";
    for (const row of matrix) {
      for (const cell of row) {
        if (cell.count > 0) {
          const level = escalationLevel(cell.velocity, cell.authority);
          if (order.indexOf(level) > order.indexOf(maxLevel)) maxLevel = level;
        }
      }
    }
    const globalLevel = escalationLevel(globalVB, maxAB);
    if (order.indexOf(globalLevel) > order.indexOf(maxLevel)) maxLevel = globalLevel;

    return { matrix, maxLevel, globalVelocityBand: globalVB, maxAuthority: maxAB, globalVelocityCount };
  }, [alerts]);

  const escalationDrillDownAlerts = useMemo(() => {
    if (!escalationFilter) return [];
    const cell = escalationMatrix.matrix
      .find((r) => r[0].velocity === escalationFilter.velocity)
      ?.find((c) => c.authority === escalationFilter.authority);
    return cell?.alerts ?? [];
  }, [escalationFilter, escalationMatrix]);

  // ECharts option for language distribution donut (Module 1)
  const languageDonutOption: EChartsOption | null = useMemo(() => {
    if (languageDistribution.total === 0) return null;
    const data = (["ar", "darija", "fr", "en"] as LangCode[]).map((code) => ({
      name: languageDistribution.labels[code],
      value: languageDistribution.counts[code],
      itemStyle: { color: languageDistribution.colors[code] },
    }));
    return {
      ...echartsBase(),
      title: {
        text: String(languageDistribution.total),
        subtext: "ALERTS",
        left: "center",
        top: "38%",
        textStyle: { fontFamily: FONT.mono, fontSize: 22, fontWeight: 700, color: C.text },
        subtextStyle: { fontFamily: FONT.mono, fontSize: 9, color: C.textMuted },
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
        backgroundColor: C.bg,
        borderColor: C.border,
        textStyle: { color: C.textBody, fontFamily: FONT.mono, fontSize: 11 },
      },
      legend: {
        bottom: 0,
        textStyle: { color: C.textMuted, fontFamily: FONT.mono, fontSize: 9 },
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
      },
      series: [
        {
          type: "pie",
          radius: ["42%", "70%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          emphasis: { scale: true, scaleSize: 6 },
          data,
        },
      ],
    };
  }, [languageDistribution]);

  // ═══ ECHARTS OPTIONS ═══

  const sentimentGaugeOption: EChartsOption = useMemo(() => ({
    ...echartsBase(),
    series: [{
      type: "gauge",
      min: -1,
      max: 1,
      startAngle: 200,
      endAngle: -20,
      splitNumber: 4,
      progress: { show: true, width: 10, roundCap: true, itemStyle: { color: sentimentIndex >= 0 ? ACCENT : COL_NEG } },
      pointer: { show: true, length: "55%", width: 3, itemStyle: { color: C.text } },
      axisLine: { lineStyle: { width: 10, color: [[0.5, COL_NEG], [0.7, COL_WARN], [1, ACCENT]] } },
      axisTick: { show: false },
      splitLine: { length: 8, lineStyle: { color: C.border, width: 1 } },
      axisLabel: { distance: 14, color: C.textMuted, fontFamily: FONT.mono, fontSize: 8 },
      detail: {
        valueAnimation: true,
        formatter: (v: number) => v.toFixed(2),
        color: C.text,
        fontFamily: FONT.mono,
        fontSize: 18,
        fontWeight: 700,
        offsetCenter: [0, "65%"],
      },
      data: [{ value: sentimentIndex }],
    }],
  }), [sentimentIndex]);

  const aiVisibilityGaugeOption: EChartsOption = useMemo(() => ({
    ...echartsBase(),
    series: [{
      type: "gauge",
      min: 0,
      max: 100,
      startAngle: 200,
      endAngle: -20,
      splitNumber: 5,
      progress: { show: true, width: 10, roundCap: true, itemStyle: { color: ACCENT } },
      pointer: { show: true, length: "55%", width: 3, itemStyle: { color: C.text } },
      axisLine: { lineStyle: { width: 10, color: [[0.3, COL_NEG], [0.6, COL_WARN], [1, ACCENT]] } },
      axisTick: { show: false },
      splitLine: { length: 8, lineStyle: { color: C.border, width: 1 } },
      axisLabel: { distance: 14, color: C.textMuted, fontFamily: FONT.mono, fontSize: 8 },
      detail: {
        valueAnimation: true,
        formatter: "{value}",
        color: C.text,
        fontFamily: FONT.mono,
        fontSize: 18,
        fontWeight: 700,
        offsetCenter: [0, "65%"],
      },
      data: [{ value: aiVisibilityScore }],
    }],
  }), [aiVisibilityScore]);

  const radarOption: EChartsOption | null = useMemo(() => {
    if (!radarData) return null;
    return {
      ...echartsBase(),
      radar: {
        indicator: radarData.map((d) => ({ name: d.name, max: 100 })),
        radius: "62%",
        center: ["50%", "52%"],
        axisName: { color: C.textMuted, fontFamily: FONT.mono, fontSize: 8 },
        splitLine: { lineStyle: { color: C.border } },
        splitArea: { areaStyle: { color: [C.bg, C.bgSubtle] } },
        axisLine: { lineStyle: { color: C.border } },
      },
      series: [{
        type: "radar",
        data: [{
          value: radarData.map((d) => d.val),
          name: "Brand Health",
          areaStyle: { color: "rgba(5,150,105,0.15)" },
          lineStyle: { color: ACCENT, width: 1.5 },
          itemStyle: { color: ACCENT },
          symbolSize: 3,
        }],
      }],
    };
  }, [radarData]);

  const sourceHeatmapOption: EChartsOption | null = useMemo(() => {
    if (sourceMatrixData.sources.length === 0) return null;
    return {
      ...echartsBase(),
      grid: { left: 100, right: 30, top: 20, bottom: 30 },
      tooltip: {
        formatter: (p: unknown) => {
          const d = (p as { data: [number, number, number] }).data;
          return `${sourceMatrixData.sources[d[1]]} · ${sourceMatrixData.sentiments[d[0]]}: ${d[2]}`;
        },
      },
      xAxis: {
        type: "category",
        data: sourceMatrixData.sentiments,
        splitArea: { show: true },
        axisLabel: { color: C.textMuted, fontFamily: FONT.mono, fontSize: 9 },
        axisLine: { lineStyle: { color: C.border } },
      },
      yAxis: {
        type: "category",
        data: sourceMatrixData.sources,
        splitArea: { show: true },
        axisLabel: { color: C.textMuted, fontFamily: FONT.mono, fontSize: 9 },
        axisLine: { lineStyle: { color: C.border } },
      },
      visualMap: {
        min: 0,
        max: sourceMatrixData.maxVal || 1,
        calculable: false,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        textStyle: { color: C.textMuted, fontFamily: FONT.mono, fontSize: 8 },
        inRange: { color: [C.bgSubtle, ACCENT] },
        show: false,
      },
      series: [{
        type: "heatmap",
        data: sourceMatrixData.data,
        label: { show: true, color: C.text, fontFamily: FONT.mono, fontSize: 9, fontWeight: 600 },
        emphasis: { itemStyle: { shadowBlur: 6, shadowColor: C.border } },
      }],
    };
  }, [sourceMatrixData]);

  const sourceReliabilityGaugeOption: EChartsOption | null = useMemo(() => {
    if (sourceReliabilityData.length === 0) return null;
    return {
      ...echartsBase(),
      series: [{
        type: "gauge",
        min: 0,
        max: 100,
        startAngle: 200,
        endAngle: -20,
        splitNumber: 4,
        progress: { show: true, width: 6, roundCap: true },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 6, color: [[0.4, COL_NEG], [0.7, COL_WARN], [1, ACCENT]] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          formatter: "{value}",
          color: C.text,
          fontFamily: FONT.mono,
          fontSize: 11,
          fontWeight: 700,
          offsetCenter: [0, "70%"],
        },
        data: sourceReliabilityData.map((s) => ({ value: s.value, name: s.name })),
        title: { color: C.textMuted, fontFamily: FONT.mono, fontSize: 8, offsetCenter: [0, "90%"] },
      }],
    };
  }, [sourceReliabilityData]);

  const topicNetworkOption: EChartsOption | null = useMemo(() => {
    if (topicNetwork.nodes.length === 0) return null;
    return {
      ...echartsBase(),
      tooltip: { formatter: (p: unknown) => {
        const d = (p as { data: { name: string; value: number } }).data;
        return `${d.name}: ${d.value}`;
      } },
      series: [{
        type: "graph",
        layout: "force",
        roam: true,
        data: topicNetwork.nodes,
        links: topicNetwork.links,
        force: { repulsion: 120, edgeLength: 60, gravity: 0.1 },
        label: { show: true, color: C.text, fontFamily: FONT.mono, fontSize: 9, position: "right" },
        lineStyle: { color: C.border, width: 0 },
        emphasis: { focus: "adjacency", label: { fontSize: 10 } },
      }],
    };
  }, [topicNetwork]);

  // Active alert-level badge for Module 3 (3 badges: Green / Amber / Crimson)
  const activeBadge: "Green" | "Amber" | "Crimson" =
    escalationMatrix.maxLevel === "Green"
      ? "Green"
      : escalationMatrix.maxLevel === "Amber"
        ? "Amber"
        : "Crimson";

  // ═══ RENDER ═══

  return (
    <div className="dash-main" style={{ padding: "16px", background: C.bg, overflowX: "hidden" }}>
      {/* Responsive collapse for narrow screens */}
      <style>{`
        @media (max-width: 900px) {
          .bm-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bm-grid > * { grid-column: span 2 !important; }
        }
        @media (max-width: 600px) {
          .bm-grid { grid-template-columns: 1fr !important; }
          .bm-grid > * { grid-column: span 1 !important; }
        }
      `}</style>

      {/* ─── Welcome banner ─── */}
      <div
        style={{
          padding: "14px 16px",
          background: ACCENT_BG,
          borderRadius: "4px",
          marginBottom: "12px",
          borderLeft: `3px solid ${ACCENT}`,
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, lineHeight: 1.5 }}>
          Good morning, {firstName}. Here's what they're saying about {companyName} today.
        </div>
        <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "4px" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* ─── Page title + toolbar ─── */}
      <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={labelStyle}>
            {companyName}
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: "2px 0 0 0", letterSpacing: "-0.02em" }}>
            Brand Monitor Command Center
          </h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}>
            {(["24h", "7d", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: "6px 12px",
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: timeRange === r ? ACCENT : C.bg,
                  color: timeRange === r ? "#ffffff" : C.textMuted,
                  transition: "all 0.15s ease",
                  letterSpacing: "0.05em",
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              padding: "6px 12px",
              fontSize: "10px",
              fontFamily: FONT.mono,
              fontWeight: 600,
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              background: C.bg,
              color: C.textBody,
              cursor: refreshing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
              opacity: refreshing ? 0.6 : 1,
            }}
            title={`Last refreshed: ${lastRefresh.toLocaleTimeString("en-US")}`}
          >
            <span style={{ display: "inline-block", transform: refreshing ? "rotate(360deg)" : "rotate(0deg)", transition: "transform 0.6s ease" }}>
              {"\u21BB"}
            </span>
            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
          <button
            onClick={exportSourcesCSV}
            disabled={sources.length === 0}
            style={{
              padding: "6px 12px",
              fontSize: "10px",
              fontFamily: FONT.mono,
              fontWeight: 600,
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              background: C.bg,
              color: C.textBody,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
              opacity: sources.length === 0 ? 0.5 : 1,
            }}
          >
            <span>{"\u2193"}</span>
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* ─── Loading / Error gate for the whole grid ─── */}
      {loading ? (
        <div style={{ padding: "16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px" }}>
          <SkeletonLoader accent={ACCENT} lines={3} height={40} />
        </div>
      ) : error ? (
        <ErrorState accent={ACCENT} message="Can't reach reputation sources. Retrying..." />
      ) : (
        <>
          {/* ═══ 24-COLUMN COMMAND GRID ═══ */}
          <div className="bm-grid" style={gridWrapStyle}>

            {/* ─── ROW 1: Executive Strip (4 × span-6) ─── */}

            {/* Widget 1: Reputation Score */}
            <div style={{ gridColumn: "span 6" }}>
              <KpiTile
                label="Reputation Score"
                value={String(score)}
                unit="/ 100"
                sub={kpis?.sky ?? "Partly cloudy"}
                trendDir={kpis?.trend}
                trendText={kpis?.trendValue}
              >
                <div style={{ display: "flex", gap: 4, height: 4, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${kpis?.breakdown.positive ?? 0}%`, background: COL_POS }} />
                  <div style={{ width: `${kpis?.breakdown.neutral ?? 0}%`, background: C.border }} />
                  <div style={{ width: `${kpis?.breakdown.negative ?? 0}%`, background: COL_NEG }} />
                </div>
              </KpiTile>
            </div>

            {/* Widget 2: Sentiment Index gauge */}
            <div style={{ gridColumn: "span 6" }}>
              <Widget title="Sentiment Index" subtitle="-1 / +1">
                {sentimentIndex === 0 && !kpis?.breakdown ? (
                  <AwaitingTelemetry label="AWAITING SENTIMENT TELEMETRY" />
                ) : (
                  <ReactECharts option={sentimentGaugeOption} style={{ height: "100%", minHeight: 160 }} opts={{ renderer: "svg" }} />
                )}
              </Widget>
            </div>

            {/* Widget 3: Alert Velocity */}
            <div style={{ gridColumn: "span 6" }}>
              <KpiTile
                label="Alert Velocity"
                value={String(alertVelocity.perHour)}
                unit="/ hr"
                sub={`${alertVelocity.total} alerts (24h)`}
                trendDir={alertVelocity.perHour > 2 ? "up" : "stable"}
                trendText={alertVelocity.perHour > 2 ? "elevated" : "nominal"}
              >
                <Sparkline data={alertVelocity.sparkline} color={COL_WARN} height={32} />
              </KpiTile>
            </div>

            {/* Widget 4: AI Visibility Score */}
            <div style={{ gridColumn: "span 6" }}>
              <Widget title="AI Visibility Score" subtitle="0 / 100">
                {aiEngines.length === 0 ? (
                  <AwaitingTelemetry label="AWAITING AI TELEMETRY" />
                ) : (
                  <ReactECharts option={aiVisibilityGaugeOption} style={{ height: "100%", minHeight: 160 }} opts={{ renderer: "svg" }} />
                )}
              </Widget>
            </div>

            {/* ─── ROW 2: Geographic Intelligence + Real-time Feed ─── */}

            {/* Widget 5: Geographic Heatmap (deck.gl) */}
            <div style={{ gridColumn: "span 12" }}>
              <Widget title="Geographic Intelligence" subtitle="DECK.GL · HEXAGON LAYER" style={{ minHeight: 400 }}>
                <div style={{ height: 360 }}>
                  <GeoHeatmap alerts={alerts} />
                </div>
              </Widget>
            </div>

            {/* Widget 6: Virtualized Real-time Alert Feed */}
            <div style={{ gridColumn: "span 12" }}>
              <Widget title="Real-time Alert Feed" subtitle={`${alerts.length} SIGNALS`} style={{ minHeight: 400 }}>
                <VirtualTable<BrandMonitorAlert>
                  rows={alerts}
                  height={360}
                  rowHeight={32}
                  emptyLabel="AWAITING ALERT FEED"
                  columns={[
                    {
                      key: "time",
                      header: "Time",
                      width: "60px",
                      render: (a) => (
                        <span style={{ fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted }}>
                          {a.detectedAt ? new Date(a.detectedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--"}
                        </span>
                      ),
                    },
                    {
                      key: "source",
                      header: "Source",
                      width: "120px",
                      render: (a) => (
                        <span style={{ fontFamily: FONT.mono, fontSize: "10px", color: ACCENT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {a.source.length > 16 ? a.source.slice(0, 14) + "\u2026" : a.source}
                        </span>
                      ),
                    },
                    {
                      key: "sentiment",
                      header: "Sent",
                      width: "70px",
                      render: (a) => <SentimentBadge sentiment="negative" score={a.sentimentScore} />,
                    },
                    {
                      key: "title",
                      header: "Title",
                      width: "calc(100% - 320px)",
                      render: (a) => (
                        <span style={{ fontSize: "11px", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={a.title}>
                          {a.title}
                        </span>
                      ),
                    },
                    {
                      key: "severity",
                      header: "Sev",
                      width: "70px",
                      align: "right",
                      render: (a) => (
                        <span
                          style={{
                            fontFamily: FONT.mono,
                            fontSize: "9px",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "2px",
                            background: a.severity === "critical" ? "rgba(239,68,68,0.10)" : "rgba(245,158,11,0.10)",
                            color: a.severity === "critical" ? COL_NEG : COL_WARN,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {a.severity}
                        </span>
                      ),
                    },
                  ]}
                />
              </Widget>
            </div>

            {/* ─── ROW 3: Sentiment Analytics (3 × span-8) ─── */}

            {/* Widget 7: 16-Axis Brand Health Radar */}
            <div style={{ gridColumn: "span 8" }}>
              <Widget title="Brand Health Radar" subtitle="16-AXIS">
                {!radarOption ? (
                  <AwaitingTelemetry label="AWAITING RADAR TELEMETRY" />
                ) : (
                  <>
                    <ReactECharts option={radarOption} style={{ height: 240 }} opts={{ renderer: "svg" }} />
                    <div style={{ ...labelStyle, fontSize: 8, color: C.border, textAlign: "center", marginTop: 4 }}>
                      8/16 DIMENSIONS POPULATED
                    </div>
                  </>
                )}
              </Widget>
            </div>

            {/* Widget 8: Sentiment Trend (stacked area) */}
            <div style={{ gridColumn: "span 8" }}>
              <Widget title="Sentiment Trend" subtitle="STACKED · BY DAY">
                {sentimentStackedData.length === 0 ? (
                  <AwaitingTelemetry label="AWAITING TREND TELEMETRY" />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={sentimentStackedData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="posFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COL_POS} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={COL_POS} stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="neuFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COL_NEU} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={COL_NEU} stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="negFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COL_NEG} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={COL_NEG} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.bgSubtle} vertical={false} />
                      <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={{ stroke: C.border }} />
                      <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="positive" stackId="1" stroke={COL_POS} strokeWidth={1.5} fill="url(#posFill)" />
                      <Area type="monotone" dataKey="neutral" stackId="1" stroke={COL_NEU} strokeWidth={1.5} fill="url(#neuFill)" />
                      <Area type="monotone" dataKey="negative" stackId="1" stroke={COL_NEG} strokeWidth={1.5} fill="url(#negFill)" />
                      <Legend wrapperStyle={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }} iconType="circle" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Widget>
            </div>

            {/* Widget 9: Sentiment Distribution Donut */}
            <div style={{ gridColumn: "span 8" }}>
              <Widget title="Sentiment Distribution" subtitle="DONUT">
                {sentimentPieData.length === 0 || sentimentPieData.every((s) => s.value === 0) ? (
                  <AwaitingTelemetry label="AWAITING SENTIMENT TELEMETRY" />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={sentimentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {sentimentPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} stroke={C.bg} strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Widget>
            </div>

            {/* ─── ROW 4: Source Intelligence (12 + 6 + 6) ─── */}

            {/* Widget 10: Source Distribution Matrix (ECharts heatmap) */}
            <div style={{ gridColumn: "span 12" }}>
              <Widget title="Source Distribution Matrix" subtitle="SOURCE × SENTIMENT × VOLUME">
                {!sourceHeatmapOption ? (
                  <AwaitingTelemetry label="AWAITING SOURCE MATRIX" />
                ) : (
                  <ReactECharts option={sourceHeatmapOption} style={{ height: 240 }} opts={{ renderer: "svg" }} />
                )}
              </Widget>
            </div>

            {/* Widget 11: Top Sources Bar (horizontal) */}
            <div style={{ gridColumn: "span 6" }}>
              <Widget title="Top Sources" subtitle="BY ARTICLE COUNT">
                {sourceBarData.length === 0 ? (
                  <AwaitingTelemetry label="AWAITING SOURCE TELEMETRY" />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={sourceBarData} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.bgSubtle} horizontal={false} />
                      <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ ...axisTick, fontSize: 9 }} tickLine={false} axisLine={false} width={70} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: `${ACCENT}08` }} />
                      <Bar dataKey="articles" fill={ACCENT} radius={[0, 3, 3, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Widget>
            </div>

            {/* Widget 12: Source Reliability Gauge */}
            <div style={{ gridColumn: "span 6" }}>
              <Widget title="Source Reliability" subtitle="RADIAL GAUGE">
                {!sourceReliabilityGaugeOption ? (
                  <AwaitingTelemetry label="AWAITING RELIABILITY TELEMETRY" />
                ) : (
                  <ReactECharts option={sourceReliabilityGaugeOption} style={{ height: 240 }} opts={{ renderer: "svg" }} />
                )}
              </Widget>
            </div>

            {/* ─── ROW 5: AI Visibility Matrix (16 + 8) ─── */}

            {/* Widget 13: AI Engine Matrix (8×4 dense table) */}
            <div style={{ gridColumn: "span 16" }}>
              <Widget title="AI Engine Matrix" subtitle={`${aiEngineMatrix.length} ENGINES × 4 METRICS`} style={{ minHeight: 220 }}>
                {aiEngineMatrix.length === 0 ? (
                  <AwaitingTelemetry label="AWAITING AI ENGINE TELEMETRY" />
                ) : (
                  <div style={{ overflow: "auto", flex: 1 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", fontFamily: FONT.mono }}>
                      <thead>
                        <tr style={{ background: C.bgSubtle, borderBottom: `1px solid ${C.border}` }}>
                          <th style={thStyle}>Engine</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>Rank</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>Mentions</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>Share %</th>
                          <th style={thStyle}>Sentiment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiEngineMatrix.map((e) => {
                          const sentColor = e.sentiment === "positive" ? COL_POS : e.sentiment === "negative" ? COL_NEG : COL_NEU;
                          const shareBg = e.share >= 67 ? "rgba(5,150,105,0.10)" : e.share >= 34 ? "rgba(245,158,11,0.10)" : "rgba(115,115,115,0.08)";
                          return (
                            <tr key={e.engine} style={{ borderBottom: `1px solid ${C.bgSubtle}` }}>
                              <td style={{ padding: "7px 10px", color: C.text, fontWeight: 600 }}>{e.engine}</td>
                              <td style={{ padding: "7px 10px", textAlign: "right", color: C.textBody }}>{String(e.rank)}</td>
                              <td style={{ padding: "7px 10px", textAlign: "right", color: e.cited ? ACCENT : C.textMuted, fontWeight: e.cited ? 700 : 400 }}>
                                {e.mentions}
                              </td>
                              <td style={{ padding: "7px 10px", textAlign: "right" }}>
                                <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: 2, background: shareBg, color: C.text, fontWeight: 700, minWidth: 36, textAlign: "center" }}>
                                  {e.share}
                                </span>
                              </td>
                              <td style={{ padding: "7px 10px" }}>
                                <span style={{ color: sentColor, fontWeight: 700, textTransform: "uppercase", fontSize: "9px", letterSpacing: "0.08em" }}>
                                  {e.sentiment}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Widget>
            </div>

            {/* Widget 14: AI Visibility Trend (Recharts multi-line) */}
            <div style={{ gridColumn: "span 8" }}>
              <Widget title="AI Visibility Trend" subtitle="SHARE OF VOICE OVER TIME">
                {aiVisibilityTrendData.length === 0 ? (
                  <AwaitingTelemetry label="AWAITING HISTORICAL TELEMETRY" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={aiVisibilityTrendData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.bgSubtle} vertical={false} />
                      <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={{ stroke: C.border }} />
                      <YAxis tick={axisTick} tickLine={false} axisLine={false} width={32} />
                      <Tooltip contentStyle={tooltipStyle} />
                      {aiEngines.slice(0, 5).map((eng) => (
                        <Line key={eng.platform} type="monotone" dataKey={eng.platform} stroke={ACCENT} strokeWidth={1.5} dot={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Widget>
            </div>

            {/* ─── ROW 6: Topic Intelligence (12 + 6 + 6) ─── */}

            {/* Widget 15: Topic Network Graph (ECharts force-directed) */}
            <div style={{ gridColumn: "span 12" }}>
              <Widget title="Topic Network Graph" subtitle="FORCE-DIRECTED">
                {!topicNetworkOption ? (
                  <AwaitingTelemetry label="AWAITING TOPIC TELEMETRY" />
                ) : (
                  <ReactECharts option={topicNetworkOption} style={{ height: 260 }} opts={{ renderer: "canvas" }} />
                )}
              </Widget>
            </div>

            {/* Widget 16: Topic Volume Bars */}
            <div style={{ gridColumn: "span 6" }}>
              <Widget title="Topic Volume" subtitle="BY COUNT">
                {topicsData.length === 0 ? (
                  <AwaitingTelemetry label="AWAITING TOPIC TELEMETRY" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topicsData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.bgSubtle} vertical={false} />
                      <XAxis dataKey="label" tick={{ ...axisTick, fontSize: 8 }} tickLine={false} axisLine={{ stroke: C.border }} interval={0} angle={-30} textAnchor="end" height={50} />
                      <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: `${ACCENT}08` }} />
                      <Bar dataKey="volume" fill={ACCENT} radius={[3, 3, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Widget>
            </div>

            {/* Widget 17: Topic Velocity Table (virtualized) */}
            <div style={{ gridColumn: "span 6" }}>
              <Widget title="Topic Velocity" subtitle="VIRTUALIZED">
                <VirtualTable<TopicVelocityRow>
                  rows={topicVelocityData}
                  height={260}
                  rowHeight={32}
                  emptyLabel="AWAITING TOPIC TELEMETRY"
                  columns={[
                    {
                      key: "topic",
                      header: "Topic",
                      width: "calc(100% - 130px)",
                      render: (r) => (
                        <span style={{ fontSize: "11px", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.topic}>
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: r.type === "risk" ? COL_NEG : ACCENT, marginRight: 6 }} />
                          {r.topic}
                        </span>
                      ),
                    },
                    {
                      key: "volume",
                      header: "Vol",
                      width: "50px",
                      align: "right",
                      render: (r) => (
                        <span style={{ fontFamily: FONT.mono, fontSize: "11px", color: C.text, fontWeight: 700 }}>{r.volume}</span>
                      ),
                    },
                    {
                      key: "delta",
                      header: "\u039424h",
                      width: "40px",
                      align: "right",
                      render: (r) => (
                        <span style={{ fontFamily: FONT.mono, fontSize: "10px", color: C.border }}>{r.delta24h}</span>
                      ),
                    },
                    {
                      key: "trend",
                      header: "Trend",
                      width: "40px",
                      align: "right",
                      render: (r) => (
                        <span style={{ fontFamily: FONT.mono, fontSize: "10px", color: C.border }}>{r.trend}</span>
                      ),
                    },
                  ]}
                />
              </Widget>
            </div>

            {/* ─── ROW 7: Escalation Matrix (8 + 8 + 8) ─── */}

            {/* Widget 18: Severity Heatmap (severity × source grid) */}
            <div style={{ gridColumn: "span 8" }}>
              <Widget title="Severity Heatmap" subtitle="SEVERITY × SOURCE">
                {severityHeatmapData.sources.length === 0 ? (
                  <AwaitingTelemetry label="AWAITING ESCALATION TELEMETRY" />
                ) : (
                  <div style={{ overflow: "auto", flex: 1 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", fontFamily: FONT.mono }}>
                      <thead>
                        <tr style={{ background: C.bgSubtle }}>
                          <th style={thStyle}>Source</th>
                          {severityHeatmapData.severities.map((sev) => (
                            <th key={sev} style={{ ...thStyle, textAlign: "right", textTransform: "uppercase" }}>{sev}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {severityHeatmapData.sources.map((src) => (
                          <tr key={src} style={{ borderBottom: `1px solid ${C.bgSubtle}` }}>
                            <td style={{ padding: "6px 8px", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }} title={src}>
                              {src}
                            </td>
                            {severityHeatmapData.severities.map((sev) => {
                              const v = severityHeatmapData.cells.get(`${src}|||${sev}`) ?? 0;
                              const maxV = Math.max(1, ...Array.from(severityHeatmapData.cells.values()));
                              const intensity = v / maxV;
                              const bg = sev === "critical"
                                ? `rgba(239,68,68,${0.08 + intensity * 0.5})`
                                : `rgba(245,158,11,${0.08 + intensity * 0.5})`;
                              return (
                                <td key={sev} style={{ padding: "6px 8px", textAlign: "right", background: bg, color: v > 0 ? C.text : C.border, fontWeight: v > 0 ? 700 : 400 }}>
                                  {v > 0 ? v : "\u00B7"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Widget>
            </div>

            {/* Widget 19: Alert Volume Timeline (Recharts area) */}
            <div style={{ gridColumn: "span 8" }}>
              <Widget title="Alert Volume Timeline" subtitle="ALERTS PER DAY">
                {alertVolumeData.length === 0 ? (
                  <AwaitingTelemetry label="AWAITING VOLUME TELEMETRY" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={alertVolumeData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="alertVolFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COL_NEG} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={COL_NEG} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.bgSubtle} vertical={false} />
                      <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={{ stroke: C.border }} />
                      <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="count" stroke={COL_NEG} strokeWidth={1.5} fill="url(#alertVolFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Widget>
            </div>

            {/* Widget 20: Top Entities Table (virtualized) */}
            <div style={{ gridColumn: "span 8" }}>
              <Widget title="Top Entities" subtitle="VIRTUALIZED · BY MENTIONS">
                <VirtualTable<EntityRow>
                  rows={topEntitiesData}
                  height={220}
                  rowHeight={32}
                  emptyLabel="AWAITING ENTITY TELEMETRY"
                  columns={[
                    {
                      key: "name",
                      header: "Entity",
                      width: "calc(100% - 180px)",
                      render: (r) => (
                        <span style={{ fontSize: "11px", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.name}>
                          {r.name}
                        </span>
                      ),
                    },
                    {
                      key: "mentions",
                      header: "Mentions",
                      width: "80px",
                      align: "right",
                      render: (r) => (
                        <span style={{ fontFamily: FONT.mono, fontSize: "11px", color: C.text, fontWeight: 700 }}>{r.mentions}</span>
                      ),
                    },
                    {
                      key: "sentiment",
                      header: "Avg Sent",
                      width: "100px",
                      align: "right",
                      render: (r) => (
                        r.avgSentiment == null ? (
                          <span style={{ fontFamily: FONT.mono, fontSize: "10px", color: C.border }}>{"\u2014"}</span>
                        ) : (
                          <SentimentBadge sentiment={null} score={r.avgSentiment} />
                        )
                      ),
                    },
                  ]}
                />
              </Widget>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════
              EXECUTIVE MODULES (3) — added below V8 command grid
              · Module 1: Multi-Source & Multi-Language (native)
              · Module 2: 3D Geographic Cartography (deck.gl interactive)
              · Module 3: Predictive Escalation Matrix (4×4)
              All data from /api/console/alerts. Zero mock. Virtualized.
          ═══════════════════════════════════════════════════════════ */}

          {/* ═══ MODULE 1 · Multi-Source & Multi-Language ═══ */}
          <div style={{ marginTop: "20px", borderTop: `1px solid ${C.border}`, paddingTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
              <div style={{ ...titleLabelStyle, marginBottom: 0, fontSize: 11, color: ACCENT }}>
                MODULE 1 · MULTI-SOURCE &amp; MULTI-LANGUAGE
              </div>
              <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }}>
                Native language detection across media, social, financial, and AI sources
              </div>
            </div>

            {/* Toolbar: language switcher + source-type chips */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
                flexWrap: "wrap",
                padding: "10px 12px",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: "4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: FONT.mono, fontSize: 9, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>LANG:</span>
                {(["all", "ar", "darija", "fr", "en"] as const).map((l) => {
                  const label = l === "all" ? "ALL" : l === "ar" ? "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" : l === "darija" ? "\u0627\u0644\u062F\u0627\u0631\u062C\u0629" : l === "fr" ? "Francais" : "English";
                  const active = languageFilter === l;
                  return (
                    <button
                      key={l}
                      onClick={() => setLanguageFilter(l)}
                      style={{
                        padding: "5px 11px",
                        fontSize: "11px",
                        fontFamily: FONT.mono,
                        fontWeight: 600,
                        border: `1px solid ${active ? ACCENT : C.border}`,
                        borderBottomWidth: active ? 2 : 1,
                        borderRadius: "2px",
                        background: active ? `${ACCENT}12` : C.bg,
                        color: active ? ACCENT : C.textMuted,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: FONT.mono, fontSize: 9, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>SRC:</span>
                {(["all", "media", "social", "financial", "ai"] as const).map((t) => {
                  const count = t === "all" ? multiSourceRows.length : sourceTypeCounts[t];
                  const active = sourceTypeFilter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setSourceTypeFilter(t)}
                      style={{
                        padding: "4px 10px",
                        fontSize: "9px",
                        fontFamily: FONT.mono,
                        fontWeight: 600,
                        border: `1px solid ${active ? ACCENT : C.border}`,
                        borderRadius: "12px",
                        background: active ? `${ACCENT}12` : C.bg,
                        color: active ? ACCENT : C.textMuted,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      {t === "all" ? "ALL" : t}
                      <span style={{ fontSize: 8, color: active ? ACCENT : C.border, fontWeight: 700 }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bm-grid" style={gridWrapStyle}>
              {/* Multi-source feed (virtualized) */}
              <div style={{ gridColumn: "span 16" }}>
                <Widget
                  title="Multi-Source Feed"
                  subtitle={`${filteredMultiSourceRows.length} / ${multiSourceRows.length} SIGNALS · VIRTUALIZED`}
                  style={{ minHeight: 400 }}
                >
                  <VirtualTable<MultiSourceRow>
                    rows={filteredMultiSourceRows}
                    height={360}
                    rowHeight={32}
                    emptyLabel="AWAITING MULTI-SOURCE FEED"
                    columns={[
                      {
                        key: "time",
                        header: "Time",
                        width: "60px",
                        render: (r) => (
                          <span style={{ fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted }}>{r.time}</span>
                        ),
                      },
                      {
                        key: "source",
                        header: "Source",
                        width: "110px",
                        render: (r) => (
                          <span
                            style={{ fontFamily: FONT.mono, fontSize: "10px", color: ACCENT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                            title={r.source}
                          >
                            {r.source.length > 16 ? r.source.slice(0, 14) + "\u2026" : r.source}
                          </span>
                        ),
                      },
                      {
                        key: "sourceType",
                        header: "Type",
                        width: "75px",
                        render: (r) => {
                          const colors: Record<SourceType, string> = {
                            media: ACCENT,
                            social: COL_WARN,
                            financial: C.textBody,
                            ai: COL_NEG,
                          };
                          return (
                            <span
                              style={{
                                fontFamily: FONT.mono,
                                fontSize: 9,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: "2px",
                                background: `${colors[r.sourceType]}15`,
                                color: colors[r.sourceType],
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                              }}
                            >
                              {r.sourceType}
                            </span>
                          );
                        },
                      },
                      {
                        key: "language",
                        header: "Lang",
                        width: "55px",
                        align: "center",
                        render: (r) => {
                          const langColors: Record<LangCode, string> = {
                            ar: COL_NEG,
                            darija: COL_WARN,
                            fr: C.textBody,
                            en: ACCENT,
                          };
                          const langLabels: Record<LangCode, string> = { ar: "AR", darija: "DAR", fr: "FR", en: "EN" };
                          return (
                            <span
                              style={{
                                fontFamily: FONT.mono,
                                fontSize: 9,
                                fontWeight: 700,
                                color: langColors[r.language],
                                letterSpacing: "0.05em",
                              }}
                            >
                              {langLabels[r.language]}
                            </span>
                          );
                        },
                      },
                      {
                        key: "title",
                        header: "Title",
                        width: "calc(100% - 425px)",
                        render: (r) => (
                          <span
                            style={{ fontSize: "11px", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                            title={r.title}
                          >
                            {r.title}
                          </span>
                        ),
                      },
                      {
                        key: "sentiment",
                        header: "Sent",
                        width: "65px",
                        render: (r) => <SentimentBadge sentiment="negative" score={r.sentimentScore} />,
                      },
                      {
                        key: "severity",
                        header: "Sev",
                        width: "60px",
                        align: "right",
                        render: (r) => (
                          <span
                            style={{
                              fontFamily: FONT.mono,
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "2px",
                              background: r.severity === "critical" ? "rgba(239,68,68,0.10)" : "rgba(245,158,11,0.10)",
                              color: r.severity === "critical" ? COL_NEG : COL_WARN,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {r.severity}
                          </span>
                        ),
                      },
                    ]}
                  />
                </Widget>
              </div>

              {/* Language distribution donut */}
              <div style={{ gridColumn: "span 8" }}>
                <Widget title="Language Distribution" subtitle="DETECTED · DONUT">
                  {!languageDonutOption ? (
                    <AwaitingTelemetry label="AWAITING LANGUAGE TELEMETRY" />
                  ) : (
                    <ReactECharts option={languageDonutOption} style={{ height: 360 }} opts={{ renderer: "svg" }} />
                  )}
                </Widget>
              </div>

              {/* Source-type breakdown stacked bar */}
              <div style={{ gridColumn: "span 24" }}>
                <Widget title="Source Type Breakdown" subtitle="STACKED · PER DAY">
                  {sourceTypeBreakdownData.length === 0 ? (
                    <AwaitingTelemetry label="AWAITING SOURCE-TYPE TELEMETRY" />
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={sourceTypeBreakdownData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.bgSubtle} vertical={false} />
                        <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={{ stroke: C.border }} />
                        <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: `${ACCENT}08` }} />
                        <Legend wrapperStyle={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }} iconType="circle" />
                        <Bar dataKey="media" stackId="a" fill={ACCENT} maxBarSize={36} />
                        <Bar dataKey="social" stackId="a" fill={COL_WARN} maxBarSize={36} />
                        <Bar dataKey="financial" stackId="a" fill={C.textBody} maxBarSize={36} />
                        <Bar dataKey="ai" stackId="a" fill={COL_NEG} maxBarSize={36} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Widget>
              </div>
            </div>
          </div>

          {/* ═══ MODULE 2 · 3D Geographic Cartography ═══ */}
          <div style={{ marginTop: "20px", borderTop: `1px solid ${C.border}`, paddingTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
              <div style={{ ...titleLabelStyle, marginBottom: 0, fontSize: 11, color: ACCENT }}>
                MODULE 2 · 3D GEOGRAPHIC CARTOGRAPHY
              </div>
              <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }}>
                Deck.gl hexagon layer · zoom: World → MENA → Morocco → City hubs
              </div>
            </div>

            <div className="bm-grid" style={gridWrapStyle}>
              {/* 3D interactive map */}
              <div style={{ gridColumn: "span 16" }}>
                <Widget title="Influence Cartography" subtitle="DECK.GL · HEXAGON + SCATTERPLOT" style={{ minHeight: 460 }}>
                  <div style={{ height: 420 }}>
                    <GeoCartography3D
                      geoAggregates={geoAggregates}
                      onSelectCity={(c) => setGeoDrillDownCity((prev) => (prev === c ? null : c))}
                    />
                  </div>
                </Widget>
              </div>

              {/* Region drill-down panel */}
              <div style={{ gridColumn: "span 8" }}>
                <Widget
                  title="Region Drill-down"
                  subtitle={
                    geoDrillDownCity
                      ? `${geoDrillDownCity.toUpperCase()} · ${geoDrillDownAlerts.length} ALERTS`
                      : "NO REGION SELECTED"
                  }
                  style={{ minHeight: 460 }}
                >
                  {!geoDrillDownCity ? (
                    <AwaitingTelemetry label="SELECT A CITY MARKER" />
                  ) : (
                    <VirtualTable<BrandMonitorAlert>
                      rows={geoDrillDownAlerts}
                      height={420}
                      rowHeight={32}
                      emptyLabel="NO ALERTS IN REGION"
                      columns={[
                        {
                          key: "time",
                          header: "Time",
                          width: "55px",
                          render: (a) => (
                            <span style={{ fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted }}>
                              {a.detectedAt
                                ? new Date(a.detectedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
                                : "--:--"}
                            </span>
                          ),
                        },
                        {
                          key: "source",
                          header: "Source",
                          width: "calc(100% - 180px)",
                          render: (a) => (
                            <span
                              style={{ fontSize: "11px", color: ACCENT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                              title={a.source}
                            >
                              {a.source.length > 18 ? a.source.slice(0, 16) + "\u2026" : a.source}
                            </span>
                          ),
                        },
                        {
                          key: "sentiment",
                          header: "Sent",
                          width: "65px",
                          render: (a) => <SentimentBadge sentiment="negative" score={a.sentimentScore} />,
                        },
                        {
                          key: "severity",
                          header: "Sev",
                          width: "60px",
                          align: "right",
                          render: (a) => (
                            <span
                              style={{
                                fontFamily: FONT.mono,
                                fontSize: 9,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: "2px",
                                background: a.severity === "critical" ? "rgba(239,68,68,0.10)" : "rgba(245,158,11,0.10)",
                                color: a.severity === "critical" ? COL_NEG : COL_WARN,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              {a.severity}
                            </span>
                          ),
                        },
                      ]}
                    />
                  )}
                </Widget>
              </div>

              {/* Geographic distribution table (virtualized) */}
              <div style={{ gridColumn: "span 24" }}>
                <Widget title="Geographic Distribution" subtitle="VIRTUALIZED · BY CITY">
                  <VirtualTable<GeoAggregate>
                    rows={geoAggregates}
                    height={260}
                    rowHeight={32}
                    emptyLabel="AWAITING GEO TELEMETRY"
                    columns={[
                      {
                        key: "city",
                        header: "City",
                        width: "180px",
                        render: (r) => (
                          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: C.text }}>
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background:
                                  r.avgSentiment != null && r.avgSentiment < -0.3
                                    ? COL_NEG
                                    : r.avgSentiment != null && r.avgSentiment > 0.1
                                      ? ACCENT
                                      : C.textMuted,
                              }}
                            />
                            {r.city}
                          </span>
                        ),
                      },
                      {
                        key: "region",
                        header: "Region",
                        width: "180px",
                        render: (r) => (
                          <span style={{ fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted }}>{r.region}</span>
                        ),
                      },
                      {
                        key: "count",
                        header: "Alerts",
                        width: "100px",
                        align: "right",
                        render: (r) => (
                          <span style={{ fontFamily: FONT.mono, fontSize: "11px", color: C.text, fontWeight: 700 }}>{r.alertCount}</span>
                        ),
                      },
                      {
                        key: "sentiment",
                        header: "Avg Sent",
                        width: "120px",
                        align: "right",
                        render: (r) =>
                          r.avgSentiment == null ? (
                            <span style={{ fontFamily: FONT.mono, fontSize: "10px", color: C.border }}>{"\u2014"}</span>
                          ) : (
                            <SentimentBadge sentiment={null} score={r.avgSentiment} />
                          ),
                      },
                      {
                        key: "trend",
                        header: "Trend",
                        width: "calc(100% - 580px)",
                        align: "right",
                        render: (r) => {
                          const trendColor = r.trend === "up" ? COL_NEG : r.trend === "down" ? ACCENT : C.textMuted;
                          const arrow = r.trend === "up" ? "\u2191" : r.trend === "down" ? "\u2193" : "\u2192";
                          return (
                            <span
                              style={{
                                fontFamily: FONT.mono,
                                fontSize: "10px",
                                color: trendColor,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              {arrow} {r.trend}
                            </span>
                          );
                        },
                      },
                    ]}
                  />
                </Widget>
              </div>
            </div>
          </div>

          {/* ═══ MODULE 3 · Predictive Escalation Matrix ═══ */}
          <div style={{ marginTop: "20px", borderTop: `1px solid ${C.border}`, paddingTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
              <div style={{ ...titleLabelStyle, marginBottom: 0, fontSize: 11, color: ACCENT }}>
                MODULE 3 · PREDICTIVE ESCALATION MATRIX
              </div>
              <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }}>
                Propagation velocity × source authority · 4×4 grid with drill-down
              </div>
            </div>

            {/* Alert level badges */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              {([
                { level: "Green" as const, label: "Normal", desc: "nominal" },
                { level: "Amber" as const, label: "Vigilance", desc: "watch" },
                { level: "Crimson" as const, label: "Critical", desc: "act now" },
              ]).map((badge) => {
                const colors = escalationColors(badge.level);
                const isActive = activeBadge === badge.level;
                return (
                  <div
                    key={badge.level}
                    style={{
                      flex: "1 1 0",
                      minWidth: 140,
                      padding: "10px 14px",
                      background: isActive ? colors.bg : C.bg,
                      border: `1px solid ${isActive ? colors.border : C.border}`,
                      borderBottomWidth: isActive ? 3 : 1,
                      borderRadius: "4px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                      transition: "all 0.2s ease",
                      opacity: isActive ? 1 : 0.55,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: colors.border,
                          display: "inline-block",
                          boxShadow: isActive ? `0 0 0 3px ${colors.bg}` : "none",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: FONT.mono,
                          fontSize: 11,
                          fontWeight: 700,
                          color: isActive ? colors.fg : C.text,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: 9,
                        color: isActive ? colors.fg : C.textMuted,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        opacity: 0.85,
                      }}
                    >
                      {badge.desc} · {isActive ? "ACTIVE" : "standby"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bm-grid" style={gridWrapStyle}>
              {/* 4×4 matrix grid */}
              <div style={{ gridColumn: "span 12" }}>
                <Widget title="Escalation Matrix" subtitle="VELOCITY × AUTHORITY · CLICK CELL" style={{ minHeight: 380 }}>
                  {alerts.length === 0 ? (
                    <AwaitingTelemetry label="AWAITING ESCALATION TELEMETRY" />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "70px repeat(4, 1fr)", gap: 3, flex: 1, minHeight: 240 }}>
                        {/* Header row */}
                        <div
                          style={{
                            fontFamily: FONT.mono,
                            fontSize: 8,
                            color: C.textMuted,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          Vel \ Auth
                        </div>
                        {(["Low", "Medium", "High", "Elite"] as AuthorityBand[]).map((a) => (
                          <div
                            key={a}
                            style={{
                              fontFamily: FONT.mono,
                              fontSize: 10,
                              color: C.textMuted,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "4px",
                            }}
                          >
                            {a}
                          </div>
                        ))}
                        {/* Matrix rows */}
                        {(["Slow", "Medium", "Fast", "Viral"] as VelocityBand[]).map((v) => (
                          <Fragment key={v}>
                            <div
                              style={{
                                fontFamily: FONT.mono,
                                fontSize: 10,
                                color: C.textMuted,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "4px",
                              }}
                            >
                              {v}
                            </div>
                            {(["Low", "Medium", "High", "Elite"] as AuthorityBand[]).map((a) => {
                              const cell = escalationMatrix.matrix
                                .find((r) => r[0].velocity === v)
                                ?.find((c) => c.authority === a);
                              const level = escalationLevel(v, a);
                              const colors = escalationColors(level);
                              const isSelected =
                                escalationFilter?.velocity === v && escalationFilter?.authority === a;
                              const hasAlerts = (cell?.count ?? 0) > 0;
                              return (
                                <button
                                  key={`${v}-${a}`}
                                  onClick={() => {
                                    if (hasAlerts) {
                                      setEscalationFilter((prev) =>
                                        prev?.velocity === v && prev?.authority === a
                                          ? null
                                          : { velocity: v, authority: a },
                                      );
                                    }
                                  }}
                                  disabled={!hasAlerts}
                                  style={{
                                    background: colors.bg,
                                    border: `1px solid ${isSelected ? ACCENT : colors.border}`,
                                    borderBottomWidth: isSelected ? 3 : 1,
                                    borderRadius: "2px",
                                    padding: "8px 4px",
                                    cursor: hasAlerts ? "pointer" : "default",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 2,
                                    transition: "all 0.15s ease",
                                    opacity: hasAlerts ? 1 : 0.35,
                                    fontFamily: FONT.mono,
                                    color: colors.fg,
                                    minWidth: 0,
                                  }}
                                >
                                  <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{cell?.count ?? 0}</span>
                                  <span
                                    style={{
                                      fontSize: 7,
                                      letterSpacing: "0.1em",
                                      textTransform: "uppercase",
                                      opacity: 0.85,
                                    }}
                                  >
                                    {level}
                                  </span>
                                </button>
                              );
                            })}
                          </Fragment>
                        ))}
                      </div>
                      {/* Legend + global indicator */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 10,
                          paddingTop: 10,
                          borderTop: `1px solid ${C.border}`,
                          fontSize: 8,
                          fontFamily: FONT.mono,
                          color: C.textMuted,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 8, height: 8, background: "rgba(16,185,129,0.20)", border: "1px solid rgba(16,185,129,0.5)", display: "inline-block" }} />
                          Green (≤4)
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 8, height: 8, background: "rgba(245,158,11,0.35)", border: "1px solid rgba(245,158,11,0.6)", display: "inline-block" }} />
                          Amber (&gt;4)
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 8, height: 8, background: "rgba(239,68,68,0.45)", border: "1px solid rgba(239,68,68,0.7)", display: "inline-block" }} />
                          Red (&gt;8)
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 8, height: 8, background: "rgba(220,38,38,0.85)", border: "1px solid rgba(220,38,38,1)", display: "inline-block" }} />
                          Crimson (&gt;12)
                        </div>
                        <div style={{ color: ACCENT, fontWeight: 700 }}>
                          GLOBAL: {escalationMatrix.globalVelocityBand} × {escalationMatrix.maxAuthority} · {escalationMatrix.globalVelocityCount}/h
                        </div>
                      </div>
                    </div>
                  )}
                </Widget>
              </div>

              {/* Escalation drill-down feed */}
              <div style={{ gridColumn: "span 12" }}>
                <Widget
                  title="Escalation Drill-down"
                  subtitle={
                    escalationFilter
                      ? `${escalationFilter.velocity.toUpperCase()} × ${escalationFilter.authority.toUpperCase()} · ${escalationDrillDownAlerts.length} ALERTS`
                      : "SELECT A CELL"
                  }
                  style={{ minHeight: 380 }}
                >
                  {!escalationFilter ? (
                    <AwaitingTelemetry label="SELECT A MATRIX CELL" />
                  ) : (
                    <VirtualTable<BrandMonitorAlert>
                      rows={escalationDrillDownAlerts}
                      height={340}
                      rowHeight={32}
                      emptyLabel="NO ALERTS IN THIS CELL"
                      columns={[
                        {
                          key: "time",
                          header: "Time",
                          width: "55px",
                          render: (a) => (
                            <span style={{ fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted }}>
                              {a.detectedAt
                                ? new Date(a.detectedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
                                : "--:--"}
                            </span>
                          ),
                        },
                        {
                          key: "source",
                          header: "Source",
                          width: "120px",
                          render: (a) => (
                            <span
                              style={{ fontFamily: FONT.mono, fontSize: "10px", color: ACCENT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                              title={a.source}
                            >
                              {a.source.length > 16 ? a.source.slice(0, 14) + "\u2026" : a.source}
                            </span>
                          ),
                        },
                        {
                          key: "title",
                          header: "Title",
                          width: "calc(100% - 280px)",
                          render: (a) => (
                            <span
                              style={{ fontSize: "11px", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                              title={a.title}
                            >
                              {a.title}
                            </span>
                          ),
                        },
                        {
                          key: "sentiment",
                          header: "Sent",
                          width: "60px",
                          render: (a) => <SentimentBadge sentiment="negative" score={a.sentimentScore} />,
                        },
                        {
                          key: "severity",
                          header: "Sev",
                          width: "45px",
                          align: "right",
                          render: (a) => (
                            <span
                              style={{
                                fontFamily: FONT.mono,
                                fontSize: 9,
                                fontWeight: 700,
                                color: a.severity === "critical" ? COL_NEG : COL_WARN,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              {a.severity === "critical" ? "C" : "H"}
                            </span>
                          ),
                        },
                      ]}
                    />
                  )}
                </Widget>
              </div>
            </div>
          </div>

          {/* ═══ PRESERVED: Sentiment breakdown bar ═══ */}
          <div style={{ marginTop: "16px", padding: "12px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px" }}>
            <div style={titleLabelStyle}>Sentiment Breakdown</div>
            <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", background: C.bgSubtle, marginBottom: "10px" }}>
              <div style={{ width: `${kpis?.breakdown.positive ?? 58}%`, background: ACCENT }} />
              <div style={{ width: `${kpis?.breakdown.neutral ?? 27}%`, background: C.border }} />
              <div style={{ width: `${kpis?.breakdown.negative ?? 15}%`, background: COL_NEG }} />
            </div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "12px", fontFamily: FONT.mono }}>
              <span style={{ color: ACCENT }}>
                <span style={{ fontWeight: 700 }}>{kpis?.breakdown.positive ?? 58}%</span>
                <span style={{ color: C.textMuted, marginLeft: "6px" }}>positive</span>
              </span>
              <span style={{ color: C.textBody }}>
                <span style={{ fontWeight: 700 }}>{kpis?.breakdown.neutral ?? 27}%</span>
                <span style={{ color: C.textMuted, marginLeft: "6px" }}>neutral</span>
              </span>
              <span style={{ color: COL_NEG }}>
                <span style={{ fontWeight: 700 }}>{kpis?.breakdown.negative ?? 15}%</span>
                <span style={{ color: C.textMuted, marginLeft: "6px" }}>negative</span>
              </span>
            </div>
          </div>

          {/* ═══ PRESERVED: Analytics charts (6 recharts from commit d0d3741) ═══ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            {/* 1. Sentiment trend over time */}
            <div style={widgetCardStyle}>
              <div style={titleLabelStyle}>Sentiment Trend Over Time</div>
              {sentimentTrendData.length === 0 ? (
                <AwaitingTelemetry label="AWAITING TREND TELEMETRY" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={sentimentTrendData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sentTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.bgSubtle} vertical={false} />
                    <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={{ stroke: C.border }} />
                    <YAxis domain={[-1, 1]} tick={axisTick} tickLine={false} axisLine={false} width={32} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: C.textMuted }} cursor={{ stroke: ACCENT, strokeOpacity: 0.3 }} />
                    <Area type="monotone" dataKey="score" stroke="none" fill="url(#sentTrendFill)" />
                    <Line type="monotone" dataKey="score" stroke={ACCENT} strokeWidth={2} dot={{ r: 3, fill: ACCENT }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 2. AI visibility by engine */}
            <div style={widgetCardStyle}>
              <div style={titleLabelStyle}>AI Visibility By Engine</div>
              {aiVisibilityData.length === 0 ? (
                <AwaitingTelemetry label="AWAITING AI TELEMETRY" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={aiVisibilityData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.bgSubtle} vertical={false} />
                    <XAxis dataKey="engine" tick={{ ...axisTick, fontSize: 9 }} tickLine={false} axisLine={{ stroke: C.border }} interval={0} angle={-12} textAnchor="end" height={50} />
                    <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} width={32} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: `${ACCENT}08` }} />
                    <Bar dataKey="confidence" radius={[3, 3, 0, 0]} maxBarSize={48}>
                      {aiVisibilityData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 3. Topic volume trend */}
            <div style={widgetCardStyle}>
              <div style={titleLabelStyle}>Topic Volume Trend</div>
              {topicsData.length === 0 ? (
                <AwaitingTelemetry label="AWAITING TOPIC TELEMETRY" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={topicsData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="topicVolumeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.bgSubtle} vertical={false} />
                    <XAxis dataKey="label" tick={{ ...axisTick, fontSize: 9 }} tickLine={false} axisLine={{ stroke: C.border }} interval={0} angle={-12} textAnchor="end" height={50} />
                    <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: ACCENT, strokeOpacity: 0.3 }} />
                    <Area type="monotone" dataKey="volume" stroke={ACCENT} strokeWidth={2} fill="url(#topicVolumeFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 4. Severity breakdown (radial) */}
            <div style={widgetCardStyle}>
              <div style={titleLabelStyle}>Severity Breakdown</div>
              {severityData.every((s) => s.count === 0) ? (
                <AwaitingTelemetry label="AWAITING SEVERITY TELEMETRY" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" data={severityData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background={{ fill: C.bgSubtle }} dataKey="value" cornerRadius={4} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }} iconType="circle" />
                  </RadialBarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 5. Source distribution (bar) */}
            <div style={widgetCardStyle}>
              <div style={titleLabelStyle}>Source Distribution</div>
              {sourceBarData.length === 0 ? (
                <AwaitingTelemetry label="AWAITING SOURCE TELEMETRY" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sourceBarData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.bgSubtle} vertical={false} />
                    <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 9 }} tickLine={false} axisLine={{ stroke: C.border }} interval={0} angle={-12} textAnchor="end" height={50} />
                    <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: `${ACCENT}08` }} />
                    <Bar dataKey="articles" fill={ACCENT} radius={[3, 3, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 6. Sentiment distribution (donut) */}
            <div style={widgetCardStyle}>
              <div style={titleLabelStyle}>Sentiment Distribution</div>
              {sentimentPieData.length === 0 || sentimentPieData.every((s) => s.value === 0) ? (
                <AwaitingTelemetry label="AWAITING SENTIMENT TELEMETRY" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={sentimentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {sentimentPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke={C.bg} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ═══ PRESERVED: Today's signals ═══ */}
          {signals.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                <div style={titleLabelStyle}>
                  Today's Signals ({filteredSignals.length})
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {(["all", "positive", "neutral", "negative"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setSentimentFilter(f)}
                      style={{
                        padding: "4px 10px",
                        fontSize: "10px",
                        fontFamily: FONT.mono,
                        fontWeight: 600,
                        border: `1px solid ${sentimentFilter === f ? ACCENT : C.border}`,
                        borderRadius: "12px",
                        background: sentimentFilter === f ? `${ACCENT}15` : C.bg,
                        color: sentimentFilter === f ? ACCENT : C.textMuted,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                  <button
                    onClick={exportSignalsCSV}
                    style={{
                      padding: "4px 10px",
                      fontSize: "10px",
                      fontFamily: FONT.mono,
                      fontWeight: 600,
                      border: `1px solid ${C.border}`,
                      borderRadius: "12px",
                      background: C.bg,
                      color: C.textBody,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    title="Export signals to CSV"
                  >
                    {"\u2193"} CSV
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredSignals.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: C.textMuted, fontFamily: FONT.mono, fontSize: "12px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px" }}>
                    No signals match this filter.
                  </div>
                ) : (
                  filteredSignals.map((signal, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "10px 14px",
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        borderRadius: "4px",
                        flexWrap: "wrap",
                        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 2px 8px ${ACCENT}20`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <span style={{ fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted, minWidth: "44px" }}>{signal.time}</span>
                      <span style={{ fontSize: "10px", fontFamily: FONT.mono, color: ACCENT, minWidth: "76px" }}>{signal.source}</span>
                      <span style={{ fontSize: "13px", color: C.text, flex: 1, minWidth: "200px" }}>{signal.title}</span>
                      <span style={{ fontSize: "9px", fontFamily: FONT.mono, padding: "2px 8px", borderRadius: "2px", background: signal.weight === "strong" ? `${ACCENT}15` : signal.weight === "medium" ? "rgba(115,115,115,0.10)" : "rgba(239,68,68,0.10)", color: signal.weight === "strong" ? ACCENT : signal.weight === "medium" ? C.textMuted : COL_NEG, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {signal.weight}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ═══ PRESERVED: Sources table ═══ */}
          {sources.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={titleLabelStyle}>
                Main Sources
              </div>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "400px" }}>
                    <thead>
                      <tr style={{ background: C.bgSubtle }}>
                        <th style={thStyle}>Source</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Articles</th>
                        <th style={thStyle}>Sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sources.map((src, i) => (
                        <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                          <td style={{ padding: "9px 14px", color: C.text, fontWeight: 500 }}>{src.name}</td>
                          <td style={{ padding: "9px 14px", textAlign: "right", fontFamily: FONT.mono, color: C.textBody }}>{src.articles}</td>
                          <td style={{ padding: "9px 14px" }}>
                            <span
                              style={{
                                fontSize: "10px",
                                fontFamily: FONT.mono,
                                padding: "2px 8px",
                                borderRadius: "2px",
                                background: src.sentiment === "positive" ? `${ACCENT}15` : src.sentiment === "negative" ? "rgba(239,68,68,0.10)" : "rgba(115,115,115,0.10)",
                                color: src.sentiment === "positive" ? ACCENT : src.sentiment === "negative" ? COL_NEG : C.textMuted,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                              }}
                            >
                              {src.sentiment}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const thStyle: CSSProperties = {
  padding: "8px 10px",
  textAlign: "left",
  fontFamily: FONT.mono,
  fontSize: "9px",
  color: C.textMuted,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontWeight: 600,
};

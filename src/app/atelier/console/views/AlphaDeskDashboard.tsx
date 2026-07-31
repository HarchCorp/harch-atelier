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
}

export interface AlphaDeskDashboardProps {
  userName: string;
  userEmail: string | null;
  companyName: string;
  kpis?: AlphaKPI;
  assets?: AlphaAssetRow[];
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
        yAxisIndex: 0,
        data: prices,
        symbol: "none",
        lineStyle: { color: ACCENT, width: 2 },
        z: 5,
      },
      {
        name: "Sentiment",
        type: "line",
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
        step: "middle",
        data: posData,
        symbol: "none",
        lineStyle: { color: GREEN, width: 1.5 },
        areaStyle: { color: "rgba(16,185,129,0.18)" },
      },
      {
        name: "Asks (−)",
        type: "line",
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
    xAxis: { type: "category", show: false },
    yAxis: [
      { type: "value", show: false, scale: true },
      { type: "value", show: false, min: -1, max: 1 },
    ],
    series: [
      {
        type: "line",
        data: prices,
        symbol: "none",
        lineStyle: { color: ACCENT, width: 1.2 },
        areaStyle: { color: "rgba(8,145,178,0.10)" },
        connectNulls: true,
      },
      {
        type: "line",
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
    overscan: 10,
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

  const recordLatency = useCallback((ms: number) => {
    setLatencySamples((prev) => {
      const next = [...prev, { t: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }), ms }];
      return next.slice(-30);
    });
  }, []);

  // ─── Initial fetch ───
  useEffect(() => {
    if (injectedKpis) return;
    (async () => {
      const t0 = performance.now();
      try {
        const [assetsRes, statsRes] = await Promise.all([
          fetch("/api/trader/assets"),
          fetch("/api/trader/stats"),
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
          }));
          setAssets(assetRows);
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
      } catch {
        setError(true);
      }
      setLoading(false);
    })();
  }, [injectedKpis, recordLatency]);

  // ─── Fetch correlation for selected ticker ───
  useEffect(() => {
    if (!selectedTicker) return;
    let cancelled = false;
    (async () => {
      setCorrLoading(true);
      try {
        const res = await fetch(`/api/trader/assets/${selectedTicker}/correlation?window=30`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          setCorrelation(data);
        }
      } catch {
        // ignore
      }
      if (!cancelled) setCorrLoading(false);
    })();
    return () => { cancelled = true; };
  }, [selectedTicker]);

  // ─── Fetch correlation for ALL assets (feeds heatmap, sparklines, distribution) ───
  const tickerSignature = assets.map((a) => a.ticker).join(",");
  useEffect(() => {
    if (assets.length === 0) return;
    let cancelled = false;
    (async () => {
      setCorrDistLoading(true);
      try {
        const results = await Promise.all(
          assets.map(async (a): Promise<AssetCorrEntry> => {
            try {
              const res = await fetch(`/api/trader/assets/${a.ticker}/correlation?window=30`);
              if (!res.ok) return { ticker: a.ticker, correlation: 0, dataPoints: 0, alignedData: [] };
              const data = await res.json();
              return {
                ticker: a.ticker,
                correlation: data.correlation ?? 0,
                dataPoints: data.dataPoints ?? 0,
                alignedData: (data.alignedData ?? []) as AlignedPoint[],
              };
            } catch {
              return { ticker: a.ticker, correlation: 0, dataPoints: 0, alignedData: [] };
            }
          })
        );
        if (!cancelled) setAssetCorrData(results);
      } catch {
        // ignore
      }
      if (!cancelled) setCorrDistLoading(false);
    })();
    return () => { cancelled = true; };
  }, [tickerSignature]);

  // ─── Fetch alerts (may 403 for harch-alpha) ───
  useEffect(() => {
    (async () => {
      setAlertsLoading(true);
      try {
        const res = await fetch("/api/console/alerts");
        if (res.status === 403) {
          setAlertsGated(true);
          setAlerts([]);
        } else if (res.ok) {
          const data = await res.json();
          setAlerts((data.alerts ?? []) as AlertItem[]);
          setAlertsGated(false);
        }
      } catch {
        // ignore
      }
      setAlertsLoading(false);
    })();
  }, [lastRefresh]);

  // ─── Fetch AI visibility (may 403) ───
  useEffect(() => {
    (async () => {
      setAiLoading(true);
      try {
        const res = await fetch("/api/console/ai-visibility");
        if (res.status === 403) {
          setAiGated(true);
          setAiPlatforms([]);
        } else if (res.ok) {
          const data = await res.json();
          setAiPlatforms((data.platforms ?? []) as AIVisibilityPlatform[]);
          setAiGated(false);
        }
      } catch {
        // ignore
      }
      setAiLoading(false);
    })();
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

  // ─── Refresh ───
  const refreshAssets = useCallback(async () => {
    setRefreshing(true);
    const t0 = performance.now();
    try {
      const [assetsRes, statsRes] = await Promise.all([
        fetch("/api/trader/assets"),
        fetch("/api/trader/stats"),
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
        }));
        setAssets(assetRows);
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
    } catch {
      // ignore
    }
    setRefreshing(false);
  }, [recordLatency]);

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
                    onSelect={setSelectedTicker}
                    typeColors={typeColors}
                  />
                </>
              )}
            </WidgetCard>

            {/* 7. Candlestick + Z-Score Overlay */}
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

            {/* 10. NLP Order-Book Depth */}
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

            {/* 12. Correlation Strength Heatmap (asset × asset) */}
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

            {/* 14. Volatility Micro-Gauges */}
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

            {/* 17. Virtualized Alpha Scorecard */}
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

            {/* 13. Pearson r Distribution (Recharts bar) */}
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

            {/* 19. Top Gainers / Losers (Recharts) */}
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

            {/* 20. Sentiment Heatmap Grid (ECharts) */}
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

            {/* 21. Latency Timeline (ECharts) */}
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
          </div>

          {/* ═══════════════════════════════════════════════════════════
              ROW 9 — Asset Performance Comparison (full width, Recharts)
              Preserved from V7 (chart 2)
              ═══════════════════════════════════════════════════════════ */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: "8px" }}>
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

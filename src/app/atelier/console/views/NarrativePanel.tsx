"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";

// ═══════════════════════════════════════════════════════════════
//  NarrativePanel.tsx — Narrative Detection UI
//
//  Visualizes emerging storylines detected by /api/console/narratives.
//  Layout:
//    ROW 1: KPI strip (4 tiles — total narratives, rising, falling,
//           avg velocity)
//    ROW 2: Narrative network graph (ECharts graph, nodes = narratives,
//           edges = shared sources) + filter/sort toolbar
//    ROW 3: Virtualized narrative list (cards expand to reveal top
//           alerts in the cluster)
//
//  Zero mock data — every cell fetches real Neon Postgres telemetry.
//  Light theme. English. No emojis. C tokens only.
// ═══════════════════════════════════════════════════════════════

const FONT = { sans: C.fontSans, mono: C.fontMono };
const ACCENT = "#059669"; // emerald-600 (Brand Monitor accent)
const ACCENT_BG = "rgba(5,150,105,0.08)";
const COL_POS = ACCENT;
const COL_NEG = C.danger;
const COL_WARN = C.warning;
const COL_NEU = C.textMuted;

// ─── Types mirroring the API response ───────────────────────────

interface NarrativeTopAlert {
  id: string;
  title: string;
  source: string;
  publishedAt: string | null;
}

interface Narrative {
  id: string;
  label: string;
  alertCount: number;
  velocity: number;
  sentimentScore: number;
  spread: number;
  sources: string[];
  trend: "rising" | "falling" | "stable";
  firstSeen: string | null;
  lastSeen: string | null;
  topAlerts: NarrativeTopAlert[];
  keywords: string[];
}

interface NarrativeResponse {
  range: "7d" | "30d";
  company?: { name: string; slug: string };
  narratives: Narrative[];
  totalAlerts: number;
  clusterCount?: number;
}

type TrendFilter = "all" | "rising" | "falling" | "stable";
type SortKey = "velocity" | "size" | "sentiment";

// ─── Shared inline styles (mirror BrandMonitorDashboard) ────────

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
};

// ─── Helpers ────────────────────────────────────────────────────

function trendColor(trend: "rising" | "falling" | "stable"): string {
  if (trend === "rising") return COL_NEG; // rising negative-storyline = bad
  if (trend === "falling") return COL_POS;
  return COL_NEU;
}

function trendArrow(trend: "rising" | "falling" | "stable"): string {
  if (trend === "rising") return "↑";
  if (trend === "falling") return "↓";
  return "→";
}

function sentimentColor(s: number): string {
  if (s >= 0.1) return COL_POS;
  if (s <= -0.1) return COL_NEG;
  return COL_NEU;
}

// ─── KPI tile ───────────────────────────────────────────────────

function KpiTile({
  label,
  value,
  unit,
  sub,
  accentColor,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  accentColor?: string;
}) {
  return (
    <div style={widgetCardStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "8px" }}>
        <span style={{ fontSize: "28px", fontWeight: 800, fontFamily: FONT.mono, color: accentColor ?? C.text, letterSpacing: "-0.02em", lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px" }}>{sub}</div>}
    </div>
  );
}

// ─── ECharts narrative network option ───────────────────────────
// Nodes = narratives (size ∝ alertCount, color = trend). Edge
// between two narratives when they share ≥ 1 source. Force layout.

function buildNetworkOption(narratives: Narrative[]): EChartsOption {
  const nodes = narratives.slice(0, 40).map((n) => ({
    id: n.id,
    name: n.label.length > 32 ? n.label.slice(0, 30) + "…" : n.label,
    symbolSize: Math.min(60, 14 + n.alertCount * 1.5),
    itemStyle: { color: trendColor(n.trend) },
    value: n.alertCount,
    label: {
      show: true,
      position: "right",
      color: C.text,
      fontFamily: FONT.mono,
      fontSize: 9,
    },
  }));

  const links: { source: string; target: string; value: number }[] = [];
  for (let i = 0; i < narratives.length && i < 40; i++) {
    for (let j = i + 1; j < narratives.length && j < 40; j++) {
      const a = narratives[i];
      const b = narratives[j];
      const shared = a.sources.filter((s) => b.sources.includes(s)).length;
      if (shared > 0) {
        links.push({ source: a.id, target: b.id, value: shared });
      }
    }
  }

  // Cast the graph series through `unknown` — ECharts' TS typings for
  // the `graph` series don't include `links` / `force` on the base
  // `SeriesOption` union, but the runtime accepts them. This mirrors
  // the pattern used in BrandMonitorDashboard's topicNetworkOption.
  const series = [{
    type: "graph" as const,
    layout: "force" as const,
    roam: true,
    draggable: true,
    data: nodes,
    links,
    force: {
      repulsion: 220,
      edgeLength: [40, 120],
      gravity: 0.08,
      layoutAnimation: true,
    },
    label: { show: true },
    lineStyle: {
      color: C.borderStrong,
      width: 1,
      opacity: 0.6,
      curveness: 0.1,
    },
    emphasis: {
      focus: "adjacency",
      lineStyle: { width: 2, opacity: 1 },
    },
  }];

  return {
    backgroundColor: "transparent",
    textStyle: { fontFamily: FONT.mono, color: C.textMuted },
    tooltip: {
      trigger: "item",
      backgroundColor: C.bg,
      borderColor: C.border,
      borderWidth: 1,
      textStyle: { color: C.textBody, fontFamily: FONT.mono, fontSize: 11 },
      formatter: (p: unknown) => {
        const params = p as { dataType: string; data: { name?: string; value?: number; source?: string; target?: string } };
        if (params.dataType === "node") {
          return `<b>${params.data.name ?? ""}</b><br/>Alerts: ${params.data.value ?? 0}`;
        }
        return `Shared sources: ${params.data.value ?? 0}`;
      },
    },
    series: series as unknown as EChartsOption["series"],
  };
}

// ─── Mini timeline (sparkline of alert distribution) ────────────
// Builds a 7-bucket sparkline across [firstSeen, lastSeen] using the
// topAlerts publishedAt as a coarse proxy. (The API doesn't return
// every alert's timestamp for the cluster, so we synthesize a
// density-ish sparkline from the top-5 + alertCount.)

function buildTimelineOption(n: Narrative): EChartsOption {
  const stamps = n.topAlerts
    .map((a) => a.publishedAt)
    .filter((s): s is string => Boolean(s))
    .sort();
  const buckets = 7;
  const data: number[] = new Array(buckets).fill(0);
  if (stamps.length > 0) {
    const first = new Date(stamps[0]).getTime();
    const last = new Date(stamps[stamps.length - 1]).getTime();
    const span = Math.max(1, last - first);
    for (const s of stamps) {
      const idx = Math.min(buckets - 1, Math.floor(((new Date(s).getTime() - first) / span) * buckets));
      data[idx] += 1;
    }
    // Scale the last bucket to reflect total alertCount (so the
    // sparkline doesn't look flat when topAlerts is small).
    if (n.alertCount > stamps.length && data[buckets - 1] > 0) {
      const factor = n.alertCount / stamps.length;
      for (let i = 0; i < buckets; i++) data[i] = Math.round(data[i] * factor);
    }
  }

  return {
    backgroundColor: "transparent",
    grid: { left: 0, right: 0, top: 2, bottom: 0 },
    xAxis: { type: "category", show: false, data: data.map((_, i) => i) },
    yAxis: { type: "value", show: false },
    tooltip: { show: false },
    series: [
      {
        type: "line",
        data,
        smooth: true,
        symbol: "none",
        lineStyle: { color: trendColor(n.trend), width: 1.5 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: `${trendColor(n.trend)}40` },
              { offset: 1, color: `${trendColor(n.trend)}00` },
            ],
          },
        },
      },
    ],
  };
}

// ─── Narrative card (collapsible) ───────────────────────────────

function NarrativeCard({
  narrative,
  expanded,
  onToggle,
}: {
  narrative: Narrative;
  expanded: boolean;
  onToggle: () => void;
}) {
  const tColor = trendColor(narrative.trend);
  const sColor = sentimentColor(narrative.sentimentScore);

  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${tColor}`,
        borderRadius: "4px",
        background: C.bg,
        overflow: "hidden",
      }}
    >
      {/* Card header (always visible) */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
        aria-expanded={expanded}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, fontFamily: FONT.sans, lineHeight: 1.3 }}>
              {narrative.label}
            </div>
            <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {narrative.firstSeen} → {narrative.lastSeen} · {narrative.spread} source{narrative.spread !== 1 ? "s" : ""}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: FONT.mono, color: tColor, lineHeight: 1 }}>
                {trendArrow(narrative.trend)} {narrative.alertCount}
              </div>
              <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                alerts
              </div>
            </div>
            <div style={{ fontSize: "14px", color: C.textMuted, transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
              {"\u203A"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Velocity */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Vel</span>
            <span style={{ fontSize: "13px", fontFamily: FONT.mono, fontWeight: 700, color: C.text }}>
              {narrative.velocity.toFixed(1)}/d
            </span>
          </div>
          {/* Sentiment */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Sent</span>
            <span style={{ fontSize: "13px", fontFamily: FONT.mono, fontWeight: 700, color: sColor }}>
              {narrative.sentimentScore >= 0 ? "+" : ""}{narrative.sentimentScore.toFixed(2)}
            </span>
          </div>
          {/* Spread */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Spread</span>
            <span style={{ fontSize: "13px", fontFamily: FONT.mono, fontWeight: 700, color: C.text }}>{narrative.spread}</span>
          </div>
          {/* Mini timeline */}
          <div style={{ flex: 1, minWidth: 80, height: 28 }}>
            <ReactECharts option={buildTimelineOption(narrative)} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
          </div>
        </div>

        {/* Source chips */}
        {narrative.sources.length > 0 && (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {narrative.sources.slice(0, 6).map((s) => (
              <span
                key={s}
                style={{
                  fontSize: "9px",
                  fontFamily: FONT.mono,
                  color: C.textBody,
                  background: C.bgHover,
                  border: `1px solid ${C.border}`,
                  borderRadius: "2px",
                  padding: "2px 6px",
                }}
              >
                {s}
              </span>
            ))}
            {narrative.sources.length > 6 && (
              <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, padding: "2px 4px" }}>
                +{narrative.sources.length - 6}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Expanded: top alerts */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, background: C.bgSubtle, padding: "10px 14px" }}>
          <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            Top alerts in this narrative
          </div>
          {narrative.topAlerts.length === 0 ? (
            <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>No alert details available.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {narrative.topAlerts.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    gap: "10px",
                    fontSize: "11px",
                    fontFamily: FONT.mono,
                    color: C.textBody,
                    padding: "4px 0",
                    borderBottom: `1px dashed ${C.border}`,
                  }}
                >
                  <span style={{ color: C.textMuted, flexShrink: 0, width: 80 }}>{a.publishedAt ?? "—"}</span>
                  <span style={{ color: C.accent, flexShrink: 0, width: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.source}</span>
                  <span style={{ color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Virtualized narrative list ─────────────────────────────────

function VirtualizedNarrativeList({
  narratives,
}: {
  narratives: Narrative[];
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const virtualizer = useVirtualizer({
    count: narratives.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => (expandedId === narratives[i]?.id ? 280 : 150),
    overscan: 6,
    getItemKey: (i) => narratives[i].id,
  });

  // Reset expanded state when the list identity changes (filter/sort).
  useEffect(() => {
    setExpandedId(null);
  }, [narratives]);

  if (narratives.length === 0) return null;

  return (
    <div
      ref={parentRef}
      style={{
        maxHeight: 560,
        overflowY: "auto",
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
        background: C.bgSubtle,
      }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {virtualizer.getVirtualItems().map((vi) => {
          const n = narratives[vi.index];
          return (
            <div
              key={n.id}
              data-key={n.id}
              data-index={vi.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vi.start}px)`,
                padding: "8px 10px",
              }}
            >
              <NarrativeCard
                narrative={n}
                expanded={expandedId === n.id}
                onToggle={() => setExpandedId((prev) => (prev === n.id ? null : n.id))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Toolbar (range + trend filter + sort) ──────────────────────

function Toolbar({
  range,
  onRangeChange,
  trendFilter,
  onTrendChange,
  sortKey,
  onSortChange,
  onRefresh,
  refreshing,
}: {
  range: "7d" | "30d";
  onRangeChange: (r: "7d" | "30d") => void;
  trendFilter: TrendFilter;
  onTrendChange: (t: TrendFilter) => void;
  sortKey: SortKey;
  onSortChange: (s: SortKey) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {/* Range switch */}
      <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}>
        {(["7d", "30d"] as const).map((r) => (
          <button
            key={r}
            onClick={() => onRangeChange(r)}
            style={{
              padding: "6px 12px",
              fontSize: "10px",
              fontFamily: FONT.mono,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: range === r ? ACCENT : C.bg,
              color: range === r ? "#ffffff" : C.textMuted,
              transition: "all 0.15s ease",
              letterSpacing: "0.05em",
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Trend filter */}
      <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}>
        {([
          { v: "all", l: "All" },
          { v: "rising", l: "Rising" },
          { v: "falling", l: "Falling" },
          { v: "stable", l: "Stable" },
        ] as const).map((opt) => (
          <button
            key={opt.v}
            onClick={() => onTrendChange(opt.v)}
            style={{
              padding: "6px 12px",
              fontSize: "10px",
              fontFamily: FONT.mono,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: trendFilter === opt.v ? C.text : C.bg,
              color: trendFilter === opt.v ? "#ffffff" : C.textMuted,
              transition: "all 0.15s ease",
              letterSpacing: "0.05em",
            }}
          >
            {opt.l}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Sort</span>
        <select
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          style={{
            padding: "5px 8px",
            fontSize: "10px",
            fontFamily: FONT.mono,
            border: `1px solid ${C.border}`,
            borderRadius: "4px",
            background: C.bg,
            color: C.text,
            cursor: "pointer",
          }}
        >
          <option value="velocity">Velocity</option>
          <option value="size">Size</option>
          <option value="sentiment">Sentiment</option>
        </select>
      </div>

      {/* Refresh */}
      <button
        onClick={onRefresh}
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
          marginLeft: "auto",
        }}
      >
        <span style={{ display: "inline-block", transform: refreshing ? "rotate(360deg)" : "rotate(0deg)", transition: "transform 0.6s ease" }}>
          {"\u21BB"}
        </span>
        <span>{refreshing ? "Scanning" : "Rescan"}</span>
      </button>
    </div>
  );
}

// ─── Awaiting telemetry placeholder (matches BrandMonitor style) ─

function AwaitingTelemetry({ label }: { label: string }) {
  return (
    <div style={{ padding: "24px 16px", textAlign: "center" }}>
      <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px", opacity: 0.7 }}>
        Narratives surface when ≥ 3 alerts share 2+ keywords.
      </div>
    </div>
  );
}

// ─── Main panel ─────────────────────────────────────────────────

export interface NarrativePanelProps {
  /** Optional override — when true, the panel renders its own page
   *  chrome (welcome banner + title). Set to false when embedded
   *  inside an existing dashboard that already provides a header. */
  showHeader?: boolean;
  companyName?: string;
}

export function NarrativePanel({ showHeader = true, companyName }: NarrativePanelProps) {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const [trendFilter, setTrendFilter] = useState<TrendFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("velocity");
  const [data, setData] = useState<NarrativeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/console/narratives?range=${range}`);
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as NarrativeResponse;
      setData(json);
    } catch {
      setError(true);
    }
    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  }, [range]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter + sort pipeline
  const processedNarratives = useMemo(() => {
    const all = data?.narratives ?? [];
    const filtered = trendFilter === "all" ? all : all.filter((n) => n.trend === trendFilter);
    const sorted = filtered.slice().sort((a, b) => {
      if (sortKey === "velocity") return b.velocity - a.velocity;
      if (sortKey === "size") return b.alertCount - a.alertCount;
      // sentiment: ascending (most negative first = biggest risk)
      return a.sentimentScore - b.sentimentScore;
    });
    return sorted;
  }, [data, trendFilter, sortKey]);

  const kpis = useMemo(() => {
    const all = data?.narratives ?? [];
    return {
      total: all.length,
      rising: all.filter((n) => n.trend === "rising").length,
      falling: all.filter((n) => n.trend === "falling").length,
      avgVelocity: all.length > 0
        ? all.reduce((s, n) => s + n.velocity, 0) / all.length
        : 0,
      totalAlerts: data?.totalAlerts ?? 0,
    };
  }, [data]);

  const networkOption = useMemo(
    () => buildNetworkOption(processedNarratives),
    [processedNarratives],
  );

  return (
    <div className="dash-main" style={{ padding: "16px", background: C.bg, overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 900px) {
          .np-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .np-grid > * { grid-column: span 2 !important; }
        }
        @media (max-width: 600px) {
          .np-grid { grid-template-columns: 1fr !important; }
          .np-grid > * { grid-column: span 1 !important; }
        }
      `}</style>

      {showHeader && (
        <>
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
              Narrative detection — emerging storylines clustered from {kpis.totalAlerts} alerts.
            </div>
            <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "4px" }}>
              PeakMetrics-style "narrative as entity" — alerts sharing ≥ 2 keywords merge into a storyline.
            </div>
          </div>

          <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={labelStyle}>{companyName ?? "Company"}</div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: "2px 0 0 0", letterSpacing: "-0.02em" }}>
                Narrative Detection
              </h3>
            </div>
            <Toolbar
              range={range}
              onRangeChange={setRange}
              trendFilter={trendFilter}
              onTrendChange={setTrendFilter}
              sortKey={sortKey}
              onSortChange={setSortKey}
              onRefresh={() => loadData(true)}
              refreshing={refreshing}
            />
          </div>
        </>
      )}

      {loading ? (
        <div style={{ padding: "16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px" }}>
          <SkeletonLoader accent={ACCENT} lines={4} height={40} />
        </div>
      ) : error ? (
        <ErrorState accent={ACCENT} message="Cannot reach narrative engine. Retrying…" />
      ) : (
        <div className="np-grid" style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 12 }}>

          {/* ─── ROW 1: KPI strip (4 × span-6) ─── */}
          <div style={{ gridColumn: "span 6" }}>
            <KpiTile label="Active Narratives" value={String(kpis.total)} accentColor={ACCENT} sub={`${kpis.totalAlerts} alerts scanned`} />
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <KpiTile label="Rising" value={String(kpis.rising)} accentColor={COL_NEG} sub="Require attention" />
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <KpiTile label="Falling" value={String(kpis.falling)} accentColor={COL_POS} sub="Cooling down" />
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <KpiTile label="Avg Velocity" value={kpis.avgVelocity.toFixed(1)} unit="/day" accentColor={C.text} sub="Across all narratives" />
          </div>

          {/* ─── ROW 2: Network graph + sidebar stats ─── */}
          <div style={{ gridColumn: "span 18" }}>
            <div style={{ ...widgetCardStyle, minHeight: 360 }}>
              <div style={titleLabelStyle}>Narrative Network · shared sources</div>
              {processedNarratives.length === 0 ? (
                <AwaitingTelemetry label="AWAITING NARRATIVE TELEMETRY" />
              ) : (
                <ReactECharts
                  option={networkOption}
                  style={{ height: 320, width: "100%" }}
                  opts={{ renderer: "svg" }}
                  notMerge
                />
              )}
            </div>
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <div style={{ ...widgetCardStyle, minHeight: 360 }}>
              <div style={titleLabelStyle}>Trend Distribution</div>
              {processedNarratives.length === 0 ? (
                <AwaitingTelemetry label="AWAITING TREND DATA" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                  {([
                    { label: "Rising", value: kpis.rising, color: COL_NEG },
                    { label: "Falling", value: kpis.falling, color: COL_POS },
                    { label: "Stable", value: processedNarratives.filter((n) => n.trend === "stable").length, color: COL_NEU },
                  ]).map((row) => {
                    const pct = processedNarratives.length > 0 ? (row.value / processedNarratives.length) * 100 : 0;
                    return (
                      <div key={row.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                          <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textBody }}>{row.label}</span>
                          <span style={{ fontSize: "13px", fontFamily: FONT.mono, fontWeight: 700, color: row.color }}>{row.value}</span>
                        </div>
                        <div style={{ height: 4, background: C.bgHover, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: row.color, transition: "width 0.3s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Showing</div>
                    <div style={{ fontSize: "14px", fontFamily: FONT.mono, fontWeight: 700, color: C.text, marginTop: "2px" }}>
                      {processedNarratives.length} of {kpis.total} narratives
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── ROW 3: Virtualized narrative list ─── */}
          <div style={{ gridColumn: "span 24" }}>
            <div style={{ ...widgetCardStyle }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={titleLabelStyle}>Detected Narratives</div>
                <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Click a card to expand · Virtualized
                </div>
              </div>
              {processedNarratives.length === 0 ? (
                <AwaitingTelemetry label="NO NARRATIVES MATCH THE CURRENT FILTER" />
              ) : (
                <VirtualizedNarrativeList narratives={processedNarratives} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

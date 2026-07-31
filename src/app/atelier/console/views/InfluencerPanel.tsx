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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";

// ═══════════════════════════════════════════════════════════════
//  InfluencerPanel.tsx — Influencer Scoring UI
//
//  Visualizes top influencers (sources) detected by
//  /api/console/influencers. Layout:
//    ROW 1: KPI strip (4 tiles — total sources, elite tier count,
//           avg influence score, total mentions)
//    ROW 2: Horizontal bar chart of influence scores (top 15) +
//           scatter plot (reach vs sentiment impact, bubble size =
//           consistency)
//    ROW 3: Virtualized influencer table (sortable) + authority
//           tier filter chips
//
//  Zero mock data — every cell fetches real Neon Postgres telemetry.
//  Light theme. English. No emojis. C tokens only.
// ═══════════════════════════════════════════════════════════════

const FONT = { sans: C.fontSans, mono: C.fontMono };
const ACCENT = "#059669";
const ACCENT_BG = "rgba(5,150,105,0.08)";
const COL_POS = ACCENT;
const COL_NEG = C.danger;
const COL_WARN = C.warning;
const COL_NEU = C.textMuted;

// ─── Types mirroring the API response ───────────────────────────

type Tier = "elite" | "high" | "medium" | "low";
type Trend = "up" | "down" | "stable";

interface Influencer {
  source: string;
  mentionCount: number;
  reachScore: number;
  sentimentImpact: number;
  authorityTier: Tier;
  consistency: number;
  influenceScore: number;
  avgSentiment: number;
  trend: Trend;
  lastMention: string | null;
}

interface InfluencerResponse {
  range: "7d" | "30d";
  company?: { name: string; slug: string };
  influencers: Influencer[];
  totalMentions: number;
  sourceCount?: number;
}

type SortColumn = "influenceScore" | "mentionCount" | "reachScore" | "consistency" | "avgSentiment";
type SortDir = "asc" | "desc";

// ─── Shared inline styles ───────────────────────────────────────

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

// ─── Tier colors ────────────────────────────────────────────────
// Elite = highest authority → ACCENT (emerald).
// High = secondary → stone-500 (Atelier accent).
// Medium = muted → textMuted.
// Low = faint → border.

function tierColor(tier: Tier): string {
  switch (tier) {
    case "elite": return ACCENT;
    case "high": return C.accent;
    case "medium": return COL_WARN;
    case "low": return COL_NEU;
  }
}

function tierBg(tier: Tier): string {
  switch (tier) {
    case "elite": return ACCENT_BG;
    case "high": return "rgba(120,113,108,0.12)";
    case "medium": return "rgba(245,158,11,0.10)";
    case "low": return "rgba(115,115,115,0.08)";
  }
}

function trendColor(trend: Trend): string {
  if (trend === "up") return COL_NEG; // rising negative coverage = bad
  if (trend === "down") return COL_POS;
  return COL_NEU;
}

function trendArrow(trend: Trend): string {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "→";
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

// ─── Tooltip formatter for Recharts ─────────────────────────────

interface BarDatum {
  source: string;
  influenceScore: number;
  tier: Tier;
}

interface ScatterDatum {
  source: string;
  reachScore: number;
  sentimentImpact: number;
  consistency: number;
  influenceScore: number;
  tier: Tier;
}

function ScatterTooltipContent({ active, payload }: {
  active?: boolean;
  payload?: { payload: ScatterDatum }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: "4px",
      padding: "8px 10px",
      fontFamily: FONT.mono,
      fontSize: "10px",
      color: C.textBody,
      boxShadow: C.shadowSm,
    }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: "4px" }}>{d.source}</div>
      <div>Reach: <b style={{ color: C.text }}>{d.reachScore}</b></div>
      <div>Sentiment impact: <b style={{ color: C.text }}>{d.sentimentImpact.toFixed(2)}</b></div>
      <div>Consistency: <b style={{ color: C.text }}>{(d.consistency * 100).toFixed(0)}%</b></div>
      <div>Influence: <b style={{ color: ACCENT }}>{d.influenceScore}</b></div>
      <div style={{ marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.08em", color: tierColor(d.tier) }}>{d.tier}</div>
    </div>
  );
}

function BarTooltipContent({ active, payload }: {
  active?: boolean;
  payload?: { payload: BarDatum }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: "4px",
      padding: "8px 10px",
      fontFamily: FONT.mono,
      fontSize: "10px",
      color: C.textBody,
      boxShadow: C.shadowSm,
    }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: "4px" }}>{d.source}</div>
      <div>Influence: <b style={{ color: ACCENT }}>{d.influenceScore}</b></div>
      <div style={{ textTransform: "uppercase", letterSpacing: "0.08em", color: tierColor(d.tier) }}>{d.tier}</div>
    </div>
  );
}

// ─── Virtualized sortable influencer table ──────────────────────

const COLUMNS: { key: SortColumn; label: string; width: number; align: "left" | "right" }[] = [
  { key: "influenceScore", label: "Influence", width: 90, align: "right" },
  { key: "mentionCount", label: "Mentions", width: 80, align: "right" },
  { key: "reachScore", label: "Reach", width: 70, align: "right" },
  { key: "consistency", label: "Consist.", width: 80, align: "right" },
  { key: "avgSentiment", label: "Avg Sent", width: 80, align: "right" },
];

function VirtualizedInfluencerTable({
  rows,
  sortColumn,
  sortDir,
  onSort,
}: {
  rows: Influencer[];
  sortColumn: SortColumn;
  sortDir: SortDir;
  onSort: (col: SortColumn) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 12,
    getItemKey: (i) => rows[i].source,
  });

  if (rows.length === 0) return null;

  const headerCellStyle: CSSProperties = {
    padding: "8px 10px",
    fontFamily: FONT.mono,
    fontSize: "9px",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: 600,
    borderBottom: `1px solid ${C.border}`,
    background: C.bgSubtle,
    cursor: "pointer",
    userSelect: "none",
  };

  return (
    <div
      ref={parentRef}
      style={{
        maxHeight: 480,
        overflowY: "auto",
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
        background: C.bg,
      }}
    >
      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 2 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ ...headerCellStyle, width: 200, textAlign: "left" }}>Source</th>
              <th style={{ ...headerCellStyle, width: 80, textAlign: "left" }}>Tier</th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => onSort(col.key)}
                  style={{
                    ...headerCellStyle,
                    width: col.width,
                    textAlign: col.align,
                    color: sortColumn === col.key ? ACCENT : C.textMuted,
                  }}
                >
                  {col.label}
                  {sortColumn === col.key && (sortDir === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
              <th style={{ ...headerCellStyle, width: 80, textAlign: "right" }}>Trend</th>
              <th style={{ ...headerCellStyle, width: 100, textAlign: "right" }}>Last Seen</th>
            </tr>
          </thead>
        </table>
      </div>
      {/* Virtualized body — uses a tall absolute-positioned container
          with absolutely-positioned rows for correct scroll math. */}
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {virtualizer.getVirtualItems().map((vi) => {
          const r = rows[vi.index];
          return (
            <div
              key={r.source}
              data-index={vi.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vi.start}px)`,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <tbody>
                  <tr style={{ height: 36 }}>
                    <td style={{ padding: "0 10px", fontFamily: FONT.mono, fontSize: "11px", color: C.text, width: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.source}
                    </td>
                    <td style={{ padding: "0 10px", width: 80 }}>
                      <span style={{
                        display: "inline-block",
                        padding: "2px 6px",
                        borderRadius: "2px",
                        fontSize: "9px",
                        fontFamily: FONT.mono,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: tierColor(r.authorityTier),
                        background: tierBg(r.authorityTier),
                        border: `1px solid ${tierColor(r.authorityTier)}40`,
                      }}>
                        {r.authorityTier}
                      </span>
                    </td>
                    <td style={{ padding: "0 10px", fontFamily: FONT.mono, fontSize: "12px", fontWeight: 700, color: ACCENT, textAlign: "right", width: 90 }}>
                      {r.influenceScore}
                    </td>
                    <td style={{ padding: "0 10px", fontFamily: FONT.mono, fontSize: "11px", color: C.textBody, textAlign: "right", width: 80 }}>
                      {r.mentionCount}
                    </td>
                    <td style={{ padding: "0 10px", fontFamily: FONT.mono, fontSize: "11px", color: C.textBody, textAlign: "right", width: 70 }}>
                      {r.reachScore}
                    </td>
                    <td style={{ padding: "0 10px", fontFamily: FONT.mono, fontSize: "11px", color: C.textBody, textAlign: "right", width: 80 }}>
                      {(r.consistency * 100).toFixed(0)}%
                    </td>
                    <td style={{
                      padding: "0 10px",
                      fontFamily: FONT.mono,
                      fontSize: "11px",
                      fontWeight: 600,
                      color: r.avgSentiment >= 0.1 ? COL_POS : r.avgSentiment <= -0.1 ? COL_NEG : COL_NEU,
                      textAlign: "right",
                      width: 80,
                    }}>
                      {r.avgSentiment >= 0 ? "+" : ""}{r.avgSentiment.toFixed(2)}
                    </td>
                    <td style={{ padding: "0 10px", fontFamily: FONT.mono, fontSize: "12px", fontWeight: 700, color: trendColor(r.trend), textAlign: "right", width: 80 }}>
                      {trendArrow(r.trend)}
                    </td>
                    <td style={{ padding: "0 10px", fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted, textAlign: "right", width: 100 }}>
                      {r.lastMention ?? "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Toolbar (range + tier filter chips) ────────────────────────

function Toolbar({
  range,
  onRangeChange,
  activeTiers,
  onToggleTier,
  onRefresh,
  refreshing,
}: {
  range: "7d" | "30d";
  onRangeChange: (r: "7d" | "30d") => void;
  activeTiers: Set<Tier>;
  onToggleTier: (t: Tier) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
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

      {/* Tier filter chips */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: "4px" }}>Tier</span>
        {(["elite", "high", "medium", "low"] as const).map((t) => {
          const active = activeTiers.has(t);
          return (
            <button
              key={t}
              onClick={() => onToggleTier(t)}
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontFamily: FONT.mono,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                border: `1px solid ${active ? tierColor(t) : C.border}`,
                borderRadius: "12px",
                background: active ? tierBg(t) : C.bg,
                color: active ? tierColor(t) : C.textMuted,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

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
        <span>{refreshing ? "Scoring" : "Rescore"}</span>
      </button>
    </div>
  );
}

// ─── Awaiting telemetry ─────────────────────────────────────────

function AwaitingTelemetry({ label }: { label: string }) {
  return (
    <div style={{ padding: "24px 16px", textAlign: "center" }}>
      <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px", opacity: 0.7 }}>
        Scores compute once at least one source has mentioned the company.
      </div>
    </div>
  );
}

// ─── Main panel ─────────────────────────────────────────────────

export interface InfluencerPanelProps {
  showHeader?: boolean;
  companyName?: string;
}

export function InfluencerPanel({ showHeader = true, companyName }: InfluencerPanelProps) {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const [activeTiers, setActiveTiers] = useState<Set<Tier>>(new Set(["elite", "high", "medium", "low"]));
  const [sortColumn, setSortColumn] = useState<SortColumn>("influenceScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [data, setData] = useState<InfluencerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/console/influencers?range=${range}`);
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as InfluencerResponse;
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

  const toggleTier = useCallback((t: Tier) => {
    setActiveTiers((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      // Never allow all tiers to be deselected — fall back to all.
      if (next.size === 0) return new Set(["elite", "high", "medium", "low"]);
      return next;
    });
  }, []);

  const onSort = useCallback((col: SortColumn) => {
    if (col === sortColumn) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDir("desc");
    }
  }, [sortColumn]);

  // Filter + sort
  const processed = useMemo(() => {
    const all = data?.influencers ?? [];
    const filtered = all.filter((i) => activeTiers.has(i.authorityTier));
    const sorted = filtered.slice().sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = a[sortColumn];
      const bv = b[sortColumn];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return sorted;
  }, [data, activeTiers, sortColumn, sortDir]);

  const kpis = useMemo(() => {
    const all = data?.influencers ?? [];
    const elite = all.filter((i) => i.authorityTier === "elite").length;
    const avg = all.length > 0
      ? Math.round(all.reduce((s, i) => s + i.influenceScore, 0) / all.length)
      : 0;
    return {
      sourceCount: all.length,
      eliteCount: elite,
      avgInfluence: avg,
      totalMentions: data?.totalMentions ?? 0,
    };
  }, [data]);

  // Bar chart data: top 15 by influence score (regardless of filter,
  // so the chart always shows the most influential sources).
  const barData = useMemo<BarDatum[]>(() => {
    const all = data?.influencers ?? [];
    return all.slice(0, 15).map((i) => ({
      source: i.source.length > 18 ? i.source.slice(0, 16) + "…" : i.source,
      influenceScore: i.influenceScore,
      tier: i.authorityTier,
    }));
  }, [data]);

  // Scatter data: reach (x) vs sentimentImpact (y), bubble size =
  // consistency. Filtered by tier selection so the scatter reflects
  // the active filter.
  const scatterData = useMemo<ScatterDatum[]>(() => {
    return processed.map((i) => ({
      source: i.source,
      reachScore: i.reachScore,
      sentimentImpact: i.sentimentImpact,
      consistency: i.consistency,
      influenceScore: i.influenceScore,
      tier: i.authorityTier,
    }));
  }, [processed]);

  return (
    <div className="dash-main" style={{ padding: "16px", background: C.bg, overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 900px) {
          .ip-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ip-grid > * { grid-column: span 2 !important; }
        }
        @media (max-width: 600px) {
          .ip-grid { grid-template-columns: 1fr !important; }
          .ip-grid > * { grid-column: span 1 !important; }
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
              Influencer scoring — {kpis.sourceCount} sources ranked across {kpis.totalMentions} mentions.
            </div>
            <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "4px" }}>
              Klear/Meltwater-style score: reach × sentiment impact × consistency.
            </div>
          </div>

          <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={labelStyle}>{companyName ?? "Company"}</div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: "2px 0 0 0", letterSpacing: "-0.02em" }}>
                Influencer Scoring
              </h3>
            </div>
            <Toolbar
              range={range}
              onRangeChange={setRange}
              activeTiers={activeTiers}
              onToggleTier={toggleTier}
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
        <ErrorState accent={ACCENT} message="Cannot reach influencer scorer. Retrying…" />
      ) : (
        <div className="ip-grid" style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 12 }}>

          {/* ─── ROW 1: KPI strip ─── */}
          <div style={{ gridColumn: "span 6" }}>
            <KpiTile label="Tracked Sources" value={String(kpis.sourceCount)} accentColor={ACCENT} sub={`${kpis.totalMentions} mentions scanned`} />
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <KpiTile label="Elite Tier" value={String(kpis.eliteCount)} accentColor={ACCENT} sub="Top 3 by volume" />
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <KpiTile label="Avg Influence" value={String(kpis.avgInfluence)} unit="/ 100" accentColor={C.text} sub="Across all sources" />
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <KpiTile label="Showing" value={String(processed.length)} unit={`/ ${kpis.sourceCount}`} accentColor={C.accent} sub="Tier-filtered" />
          </div>

          {/* ─── ROW 2: Bar chart + Scatter plot ─── */}
          <div style={{ gridColumn: "span 12" }}>
            <div style={{ ...widgetCardStyle, minHeight: 340 }}>
              <div style={titleLabelStyle}>Influence Score · Top 15 Sources</div>
              {barData.length === 0 ? (
                <AwaitingTelemetry label="AWAITING INFLUENCE TELEMETRY" />
              ) : (
                <div style={{ height: 300, width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      layout="vertical"
                      margin={{ top: 4, right: 12, bottom: 4, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" stroke={C.border} horizontal={false} />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontFamily: FONT.mono, fontSize: 10, fill: C.textMuted }}
                        axisLine={{ stroke: C.border }}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="source"
                        width={120}
                        tick={{ fontFamily: FONT.mono, fontSize: 10, fill: C.textBody }}
                        axisLine={{ stroke: C.border }}
                        tickLine={false}
                      />
                      <Tooltip cursor={{ fill: C.bgHover }} content={<BarTooltipContent />} />
                      <Bar dataKey="influenceScore" radius={[0, 2, 2, 0]} barSize={14}>
                        {barData.map((d, i) => (
                          <Cell key={i} fill={tierColor(d.tier)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div style={{ gridColumn: "span 12" }}>
            <div style={{ ...widgetCardStyle, minHeight: 340 }}>
              <div style={titleLabelStyle}>Reach × Sentiment Impact · Bubble = Consistency</div>
              {scatterData.length === 0 ? (
                <AwaitingTelemetry label="AWAITING SCATTER TELEMETRY" />
              ) : (
                <div style={{ height: 300, width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 8, right: 16, bottom: 16, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" stroke={C.border} />
                      <XAxis
                        type="number"
                        dataKey="reachScore"
                        name="Reach"
                        domain={[0, 100]}
                        tick={{ fontFamily: FONT.mono, fontSize: 10, fill: C.textMuted }}
                        axisLine={{ stroke: C.border }}
                        tickLine={false}
                        label={{ value: "Reach", position: "insideBottom", offset: -8, style: { fontFamily: FONT.mono, fontSize: 9, fill: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" } }}
                      />
                      <YAxis
                        type="number"
                        dataKey="sentimentImpact"
                        name="Sentiment Impact"
                        domain={[-1, 1]}
                        tick={{ fontFamily: FONT.mono, fontSize: 10, fill: C.textMuted }}
                        axisLine={{ stroke: C.border }}
                        tickLine={false}
                        label={{ value: "Sentiment Impact", angle: -90, position: "insideLeft", offset: 16, style: { fontFamily: FONT.mono, fontSize: 9, fill: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" } }}
                      />
                      <ZAxis type="number" dataKey="consistency" range={[40, 400]} name="Consistency" />
                      <Tooltip cursor={{ strokeDasharray: "3 3", stroke: C.border }} content={<ScatterTooltipContent />} />
                      <Scatter data={scatterData}>
                        {scatterData.map((d, i) => (
                          <Cell key={i} fill={tierColor(d.tier)} fillOpacity={0.75} stroke={tierColor(d.tier)} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* ─── ROW 3: Virtualized influencer table ─── */}
          <div style={{ gridColumn: "span 24" }}>
            <div style={{ ...widgetCardStyle }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={titleLabelStyle}>Influencer Leaderboard</div>
                <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Click a column to sort · Virtualized
                </div>
              </div>
              {processed.length === 0 ? (
                <AwaitingTelemetry label="NO SOURCES MATCH THE CURRENT FILTER" />
              ) : (
                <VirtualizedInfluencerTable
                  rows={processed}
                  sortColumn={sortColumn}
                  sortDir={sortDir}
                  onSort={onSort}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

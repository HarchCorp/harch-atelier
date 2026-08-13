"use client";

// ═══════════════════════════════════════════════════════════════
//  SovTrendsGenerator — Skill 32
//
//  Popup: Share of Voice evolution over 30 / 90 / 365 days.
//  • Toggle 30j / 90j / 365j (re-fetches the API on each switch).
//  • Multi-line inline SVG chart: sage line for "you", gray lines
//    for competitors (up to 4).
//  • Red dots on the chart mark bascule days (when your SOV
//    crossed a competitor's).
//  • Summary stat cards: SOV moyen · SOV pic · Tendance · Bascules.
//  • Competitor legend with color swatches.
//  • Bascule events list (chronological, from → to).
//  • Export PDF via window.print() (print CSS hides the chrome).
//
//  Same popup pattern as BriefingGenerator / EmailDigestGenerator.
//  White / sage / charcoal · Space Mono + Inter · Lucide · FR · NO emojis.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle,
  BarChart3, Activity, TrendingUp, TrendingDown, Minus,
  ArrowRight, RefreshCw, Percent,
} from "lucide-react";

// ─── Design tokens (white / sage / charcoal) ────────────────────
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";
const GRID = "#F0F0F0";

// Gray shades for competitors (distinguishable but always
// subordinate to the sage "you" line).
const COMPETITOR_COLORS = ["#A8A8A8", "#888888", "#686868", "#484848"];
const BASCULE_RED = "#EF4444";

// ─── Types ──────────────────────────────────────────────────────
type RangeKey = "30d" | "90d" | "365d";

interface SovDay {
  date: string;
  you: number;
  competitors: Array<{ name: string; count: number }>;
}

interface Bascule {
  date: string;
  event: "bascule";
  fromCompany: string;
  toCompany: string;
}

interface SovSummary {
  avgSOV: number;
  peakSOV: number;
  trend: number;
  basculeCount: number;
}

interface SovTrendsResponse {
  youName: string;
  range: RangeKey;
  source: "neon" | "empty";
  days: SovDay[];
  bascules: Bascule[];
  summary: SovSummary;
}

// ─── Range toggle options ───────────────────────────────────────
const RANGES: Array<{ key: RangeKey; label: string; sub: string }> = [
  { key: "30d",  label: "30 jours",  sub: "1 mois" },
  { key: "90d",  label: "90 jours",  sub: "3 mois" },
  { key: "365d", label: "365 jours", sub: "1 an"   },
];

const REVEAL_STEPS = [
  { id: "stats",   delay: 200 },
  { id: "chart",   delay: 400 },
  { id: "legend",  delay: 600 },
  { id: "bascules", delay: 800 },
];

// ─── Date helpers (UTC-stable so SSR/CSR don't drift) ───────────
function formatTick(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit", month: "2-digit", timeZone: "UTC",
    });
  } catch {
    return iso.slice(5);
  }
}

function formatDateLong(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

// ─── Chart geometry ─────────────────────────────────────────────
const CHART_W = 820;
const CHART_H = 320;
const PAD_LEFT = 44;
const PAD_RIGHT = 16;
const PAD_TOP = 20;
const PAD_BOTTOM = 36;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;

function xFor(i: number, n: number): number {
  if (n <= 1) return PAD_LEFT + PLOT_W / 2;
  return PAD_LEFT + (i / (n - 1)) * PLOT_W;
}

function yFor(sov: number): number {
  // sov in 0..100 → y in [PAD_TOP + PLOT_H .. PAD_TOP]
  return PAD_TOP + PLOT_H - (sov / 100) * PLOT_H;
}

function buildPath(values: number[]): string {
  if (values.length === 0) return "";
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i, values.length).toFixed(1)} ${yFor(v).toFixed(1)}`)
    .join(" ");
}

// ─── Main component ─────────────────────────────────────────────

export function SovTrendsGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SovTrendsResponse | null>(null);
  const [range, setRange] = useState<RangeKey>("30d");
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // ─── Fetch the SOV series for the active range ────────────────
  const generate = useCallback(async (r: RangeKey) => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisible(new Set());
    setHoveredDay(null);
    try {
      const res = await fetch("/api/console/sov-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ range: r }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }
      const payload: SovTrendsResponse = await res.json();
      setData(payload);
      setLoading(false);
      for (const step of REVEAL_STEPS) {
        setTimeout(() => {
          setVisible((prev) => new Set(prev).add(step.id));
        }, step.delay);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void generate(range);
  }, [range, generate]);

  const handleRangeChange = (r: RangeKey) => {
    if (r === range || loading) return;
    setRange(r);
  };

  const handleExportPdf = useCallback(() => {
    window.print();
  }, []);

  // ─── Derived chart series (client-side mirror of the server SOV) ─
  const series = useMemo(() => {
    if (!data || data.days.length === 0) {
      return { you: [] as number[], comps: [] as Array<{ name: string; color: string; values: number[] }> };
    }
    const you = data.days.map((d) => {
      const total = d.you + d.competitors.reduce((s, c) => s + c.count, 0);
      return total > 0 ? (d.you / total) * 100 : 0;
    });
    const compNames = data.days[0]?.competitors.map((c) => c.name) ?? [];
    const comps = compNames.map((name, idx) => ({
      name,
      color: COMPETITOR_COLORS[idx % COMPETITOR_COLORS.length],
      values: data.days.map((d) => {
        const total = d.you + d.competitors.reduce((s, c) => s + c.count, 0);
        const c = d.competitors.find((x) => x.name === name);
        const cCount = c?.count ?? 0;
        return total > 0 ? (cCount / total) * 100 : 0;
      }),
    }));
    return { you, comps };
  }, [data]);

  // Unique bascule dates → red dot positions on the chart.
  const basculeMarkers = useMemo(() => {
    if (!data || data.days.length === 0) return [] as Array<{ date: string; index: number; sov: number }>;
    const uniqDates = Array.from(new Set(data.bascules.map((b) => b.date)));
    return uniqDates
      .map((date) => {
        const index = data.days.findIndex((d) => d.date === date);
        if (index < 0) return null;
        return { date, index, sov: series.you[index] ?? 0 };
      })
      .filter((x): x is { date: string; index: number; sov: number } => x !== null);
  }, [data, series.you]);

  // X-axis tick indices (≈6 evenly spaced).
  const tickIndices = useMemo(() => {
    if (!data || data.days.length === 0) return [] as number[];
    const n = data.days.length;
    if (n <= 6) return Array.from({ length: n }, (_, i) => i);
    const step = Math.floor(n / 5);
    const ticks: number[] = [];
    for (let i = 0; i < n; i += step) ticks.push(i);
    if (ticks[ticks.length - 1] !== n - 1) ticks.push(n - 1);
    return ticks;
  }, [data]);

  const isEmpty = !loading && !error && (!data || data.days.length === 0 || data.source === "empty");
  const trendIcon = !data ? null :
    data.summary.trend > 0.1 ? <TrendingUp size={16} style={{ color: POSITIVE }} /> :
    data.summary.trend < -0.1 ? <TrendingDown size={16} style={{ color: NEGATIVE }} /> :
    <Minus size={16} style={{ color: TEXT_MUTED }} />;
  const trendColor = !data ? TEXT_MUTED :
    data.summary.trend > 0.1 ? POSITIVE :
    data.summary.trend < -0.1 ? NEGATIVE : TEXT_MUTED;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,10,10,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%", maxWidth: 960, maxHeight: "92vh",
          background: "#FFFFFF", borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header bar ─── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
            gap: 12, flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <BarChart3 size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
              Tendances SOV
            </span>
            {loading && (
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace",
              }}>
                <Loader2 size={11} className="animate-spin" /> Chargement...
              </span>
            )}
            {data && !loading && (
              <span style={{
                fontSize: 10, fontFamily: "'Space Mono', monospace",
                color: SAGE, textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "2px 6px", background: SAGE_BG, borderRadius: 3,
                border: `1px solid ${SAGE_BORDER}`,
              }}>
                {data.youName}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Range toggle */}
            <div style={{
              display: "flex", padding: 2,
              background: "#FFFFFF", border: `1px solid ${BORDER}`,
              borderRadius: 6,
            }}>
              {RANGES.map((r) => {
                const active = r.key === range;
                return (
                  <button
                    key={r.key}
                    onClick={() => handleRangeChange(r.key)}
                    disabled={loading}
                    style={{
                      padding: "4px 10px",
                      background: active ? CHARCOAL : "transparent",
                      color: active ? "#FFFFFF" : TEXT_BODY,
                      border: "none", borderRadius: 4,
                      fontSize: 11, fontWeight: 600, fontFamily: "'Space Mono', monospace",
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "all 120ms ease",
                      opacity: loading ? 0.6 : 1,
                    }}
                    title={r.sub}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => void generate(range)}
              disabled={loading || !data}
              title="Régénérer"
              style={{
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 6,
                cursor: loading || !data ? "not-allowed" : "pointer",
                color: TEXT_MUTED,
                opacity: loading || !data ? 0.5 : 1,
              }}
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleExportPdf}
              disabled={loading || !data}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: loading || !data ? BORDER : CHARCOAL,
                color: loading || !data ? TEXT_MUTED : "#FFFFFF",
                border: "none", borderRadius: 6,
                fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                cursor: loading || !data ? "not-allowed" : "pointer",
              }}
            >
              <Download size={13} /> Export PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none",
                cursor: "pointer", color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div
          id="sov-trends-document"
          style={{
            flex: 1, overflowY: "auto",
            padding: "24px 28px",
            fontFamily: "'Inter', sans-serif", color: CHARCOAL,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2 size={32} style={{ color: SAGE, animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>
                Collecte des mentions sur {range === "30d" ? "30 jours" : range === "90d" ? "90 jours" : "365 jours"}...
              </p>
            </div>
          )}

          {error && !loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: NEGATIVE }} />
              <p style={{ marginTop: 12, fontSize: 14, color: NEGATIVE }}>{error}</p>
              <button
                onClick={() => void generate(range)}
                style={{
                  marginTop: 16, padding: "8px 16px",
                  background: CHARCOAL, color: "#FFFFFF",
                  border: "none", borderRadius: 6,
                  fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {isEmpty && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <BarChart3 size={32} style={{ color: TEXT_MUTED }} />
              <p style={{ marginTop: 12, fontSize: 14, color: TEXT_MUTED }}>
                Aucune donnée de mentions sur la période sélectionnée.
              </p>
              <p style={{ marginTop: 4, fontSize: 12, color: TEXT_MUTED }}>
                Aucun concurrent détecté dans votre secteur, ou aucun article publié.
              </p>
            </div>
          )}

          {data && !loading && !error && !isEmpty && (
            <>
              {/* ─── Summary stat cards ─── */}
              <AnimatePresence>
                {visible.has("stats") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 12, marginBottom: 24,
                    }}
                  >
                    <StatCard
                      label="SOV moyen"
                      value={`${data.summary.avgSOV.toFixed(1)}%`}
                      icon={<Percent size={14} />}
                    />
                    <StatCard
                      label="SOV pic"
                      value={`${data.summary.peakSOV.toFixed(1)}%`}
                      icon={<Activity size={14} />}
                      accent={SAGE}
                    />
                    <StatCard
                      label="Tendance"
                      value={`${data.summary.trend > 0 ? "+" : ""}${data.summary.trend.toFixed(1)} pp`}
                      icon={trendIcon}
                      accent={trendColor}
                    />
                    <StatCard
                      label="Bascules"
                      value={String(data.summary.basculeCount)}
                      icon={<ArrowRight size={14} />}
                      accent={data.summary.basculeCount > 0 ? BASCULE_RED : undefined}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Chart ─── */}
              <AnimatePresence>
                {visible.has("chart") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24, padding: 20,
                      background: "#FAFAFA", borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginBottom: 12, flexWrap: "wrap", gap: 8,
                    }}>
                      <div style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED, textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}>
                        Évolution de la part de voix ({RANGES.find((r) => r.key === range)?.label})
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 10, color: BASCULE_RED,
                        fontFamily: "'Space Mono', monospace",
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: BASCULE_RED, display: "inline-block",
                        }} />
                        Bascule
                      </div>
                    </div>

                    <svg
                      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                      width="100%"
                      height={CHART_H * 0.85}
                      style={{ display: "block" }}
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Horizontal grid lines (0/25/50/75/100 %) */}
                      {[0, 25, 50, 75, 100].map((pct) => {
                        const y = yFor(pct);
                        return (
                          <g key={pct}>
                            <line
                              x1={PAD_LEFT} y1={y}
                              x2={CHART_W - PAD_RIGHT} y2={y}
                              stroke={GRID} strokeWidth={1}
                              strokeDasharray={pct === 0 ? "0" : "2 3"}
                            />
                            <text
                              x={PAD_LEFT - 8} y={y + 3}
                              textAnchor="end"
                              fontSize={10}
                              fontFamily="'Space Mono', monospace"
                              fill={TEXT_MUTED}
                            >
                              {pct}%
                            </text>
                          </g>
                        );
                      })}

                      {/* X-axis tick labels */}
                      {tickIndices.map((i) => {
                        const d = data.days[i];
                        if (!d) return null;
                        return (
                          <text
                            key={`tick-${i}`}
                            x={xFor(i, data.days.length)}
                            y={CHART_H - PAD_BOTTOM + 18}
                            textAnchor="middle"
                            fontSize={10}
                            fontFamily="'Space Mono', monospace"
                            fill={TEXT_MUTED}
                          >
                            {formatTick(d.date)}
                          </text>
                        );
                      })}

                      {/* Competitor lines (drawn first so "you" stays on top) */}
                      {series.comps.map((c, idx) => (
                        <path
                          key={`comp-${idx}`}
                          d={buildPath(c.values)}
                          fill="none"
                          stroke={c.color}
                          strokeWidth={1.5}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          opacity={0.85}
                        />
                      ))}

                      {/* You line (sage, thicker) */}
                      <path
                        d={buildPath(series.you)}
                        fill="none"
                        stroke={SAGE}
                        strokeWidth={2.25}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />

                      {/* Bascule markers — red dots on the "you" line */}
                      {basculeMarkers.map((m) => (
                        <g key={`basc-${m.date}`}>
                          {/* Vertical guide line */}
                          <line
                            x1={xFor(m.index, data.days.length)}
                            y1={PAD_TOP}
                            x2={xFor(m.index, data.days.length)}
                            y2={PAD_TOP + PLOT_H}
                            stroke={BASCULE_RED}
                            strokeWidth={1}
                            strokeDasharray="2 3"
                            opacity={0.4}
                          />
                          {/* Dot with white halo so it pops against the line */}
                          <circle
                            cx={xFor(m.index, data.days.length)}
                            cy={yFor(m.sov)}
                            r={5.5}
                            fill="#FFFFFF"
                            stroke={BASCULE_RED}
                            strokeWidth={2}
                          />
                          <circle
                            cx={xFor(m.index, data.days.length)}
                            cy={yFor(m.sov)}
                            r={2}
                            fill={BASCULE_RED}
                          />
                        </g>
                      ))}

                      {/* Hover interaction layer (invisible wide rects per day) */}
                      {data.days.map((d, i) => (
                        <rect
                          key={`hover-${d.date}`}
                          x={xFor(i, data.days.length) - (PLOT_W / Math.max(1, data.days.length)) / 2}
                          y={PAD_TOP}
                          width={PLOT_W / Math.max(1, data.days.length)}
                          height={PLOT_H}
                          fill="transparent"
                          style={{ cursor: "crosshair" }}
                          onMouseEnter={() => setHoveredDay(i)}
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      ))}

                      {/* Hover tooltip */}
                      {hoveredDay !== null && data.days[hoveredDay] && (
                        <HoverTooltip
                          day={data.days[hoveredDay]}
                          index={hoveredDay}
                          total={data.days.length}
                          youSOV={series.you[hoveredDay] ?? 0}
                          compSeries={series.comps.map((c) => ({
                            name: c.name,
                            color: c.color,
                            sov: c.values[hoveredDay] ?? 0,
                          }))}
                        />
                      )}
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Legend ─── */}
              <AnimatePresence>
                {visible.has("legend") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24, display: "flex",
                      gap: 16, flexWrap: "wrap",
                      padding: "12px 16px",
                      background: "#FFFFFF",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 6,
                    }}
                  >
                    <LegendItem
                      color={SAGE}
                      label={data.youName}
                      bold
                    />
                    {series.comps.map((c, idx) => (
                      <LegendItem
                        key={`leg-${idx}`}
                        color={c.color}
                        label={c.name}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Bascule events list ─── */}
              <AnimatePresence>
                {visible.has("bascules") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
                    }}>
                      <ArrowRight size={12} style={{ color: BASCULE_RED }} />
                      <span style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED, textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}>
                        Bascules détectés ({data.bascules.length})
                      </span>
                    </div>
                    {data.bascules.length === 0 ? (
                      <div style={{
                        padding: "16px 20px",
                        background: "#FAFAFA", borderRadius: 6,
                        border: `1px solid ${BORDER}`,
                        fontSize: 12, color: TEXT_MUTED, fontStyle: "italic",
                      }}>
                        Aucune bascule sur la période — votre part de voix n&apos;a pas croisé celle d&apos;un concurrent.
                      </div>
                    ) : (
                      <div style={{
                        display: "flex", flexDirection: "column", gap: 6,
                      }}>
                        {data.bascules.map((b, i) => {
                          const youCrossedUp = b.toCompany === data.youName;
                          return (
                            <div
                              key={`basc-${i}`}
                              style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 14px",
                                background: "#FFFFFF",
                                border: `1px solid ${BORDER}`,
                                borderRadius: 6,
                                borderLeft: `3px solid ${youCrossedUp ? SAGE : BASCULE_RED}`,
                              }}
                            >
                              <span style={{
                                fontSize: 10, fontFamily: "'Space Mono', monospace",
                                color: TEXT_MUTED, textTransform: "uppercase",
                                letterSpacing: "0.06em", minWidth: 110,
                              }}>
                                {formatTick(b.date)}
                              </span>
                              <span style={{
                                fontSize: 11, color: TEXT_MUTED,
                                fontFamily: "'Space Mono', monospace", minWidth: 90,
                              }}>
                                {b.fromCompany}
                              </span>
                              <ArrowRight
                                size={13}
                                style={{
                                  color: youCrossedUp ? SAGE : BASCULE_RED,
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{
                                fontSize: 11, color: youCrossedUp ? SAGE : CHARCOAL,
                                fontFamily: "'Space Mono', monospace", fontWeight: 600,
                                minWidth: 90,
                              }}>
                                {b.toCompany}
                              </span>
                              <span style={{
                                fontSize: 11, color: youCrossedUp ? SAGE : TEXT_MUTED,
                                marginLeft: "auto",
                              }}>
                                {youCrossedUp
                                  ? "Vous avez pris l&apos;avance"
                                  : "Vous avez perdu l&apos;avance"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div style={{
                      marginTop: 12, padding: "10px 14px",
                      background: SAGE_BG, borderRadius: 6,
                      border: `1px solid ${SAGE_BORDER}`,
                      fontSize: 11, color: TEXT_BODY, lineHeight: 1.5,
                    }}>
                      Une bascule est détectée lorsque votre part de voix franchit celle d&apos;un concurrent entre deux jours consécutifs (les jours sans publication sont ignorés pour éviter les faux signaux).
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          body * { visibility: hidden; }
          #sov-trends-document, #sov-trends-document * { visibility: visible; }
          #sov-trends-document { position: absolute; left: 0; top: 0; width: 100%; padding: 32px 40px; overflow: visible !important; }
        }
      `}</style>
    </div>
  );
}

// ─── StatCard ───────────────────────────────────────────────────
function StatCard({
  label, value, icon, accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div style={{
      padding: "14px 16px",
      background: "#FFFFFF",
      border: `1px solid ${BORDER}`,
      borderRadius: 8,
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 10, fontFamily: "'Space Mono', monospace",
        color: TEXT_MUTED, textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        <span style={{ color: accent ?? TEXT_MUTED, display: "flex", alignItems: "center" }}>
          {icon}
        </span>
        {label}
      </div>
      <div style={{
        fontSize: 22, fontWeight: 700, color: accent ?? CHARCOAL,
        fontFamily: "'Space Mono', monospace", letterSpacing: "-0.01em",
      }}>
        {value}
      </div>
    </div>
  );
}

// ─── LegendItem ─────────────────────────────────────────────────
function LegendItem({
  color, label, bold,
}: {
  color: string;
  label: string;
  bold?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 10, height: 3, borderRadius: 2,
        background: color, display: "inline-block",
      }} />
      <span style={{
        fontSize: 11, color: bold ? CHARCOAL : TEXT_BODY,
        fontWeight: bold ? 600 : 400,
        fontFamily: "'Inter', sans-serif",
        maxWidth: 180,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }} title={label}>
        {label}
        {bold && (
          <span style={{
            marginLeft: 4, fontSize: 9, color: SAGE,
            fontFamily: "'Space Mono', monospace", textTransform: "uppercase",
          }}>
            vous
          </span>
        )}
      </span>
    </div>
  );
}

// ─── HoverTooltip (in-chart) ────────────────────────────────────
function HoverTooltip({
  day, index, total, youSOV, compSeries,
}: {
  day: SovDay;
  index: number;
  total: number;
  youSOV: number;
  compSeries: Array<{ name: string; color: string; sov: number }>;
}) {
  const x = xFor(index, total);
  // Keep tooltip on-screen: flip horizontally if near right edge.
  const tooltipW = 200;
  const tooltipH = 18 + 14 + (1 + compSeries.length) * 16;
  const flipRight = x > CHART_W - PAD_RIGHT - tooltipW - 8;
  const tx = flipRight ? x - tooltipW - 12 : x + 12;
  const ty = Math.max(PAD_TOP + 4, Math.min(PAD_TOP + PLOT_H - tooltipH - 4, yFor(youSOV) - tooltipH / 2));

  return (
    <g pointerEvents="none">
      {/* Vertical hover guide */}
      <line
        x1={x} y1={PAD_TOP}
        x2={x} y2={PAD_TOP + PLOT_H}
        stroke={CHARCOAL} strokeWidth={1} strokeDasharray="2 3" opacity={0.35}
      />
      {/* Tooltip card */}
      <rect
        x={tx} y={ty}
        width={tooltipW} height={tooltipH}
        rx={4} ry={4}
        fill="#FFFFFF" stroke={BORDER} strokeWidth={1}
      />
      <text
        x={tx + 10} y={ty + 16}
        fontSize={10} fontFamily="'Space Mono', monospace"
        fill={TEXT_MUTED}
      >
        {formatDateLong(day.date)}
      </text>
      {/* You row */}
      <circle cx={tx + 12} cy={ty + 34} r={3} fill={SAGE} />
      <text
        x={tx + 22} y={ty + 37}
        fontSize={11} fontFamily="'Inter', sans-serif" fontWeight={600}
        fill={CHARCOAL}
      >
        {day.you} art · {youSOV.toFixed(1)}%
      </text>
      {/* Competitor rows */}
      {compSeries.map((c, i) => {
        const comp = day.competitors[i];
        const count = comp?.count ?? 0;
        return (
          <g key={`tt-comp-${i}`}>
            <circle cx={tx + 12} cy={ty + 34 + (i + 1) * 16} r={3} fill={c.color} />
            <text
              x={tx + 22} y={ty + 37 + (i + 1) * 16}
              fontSize={10} fontFamily="'Inter', sans-serif"
              fill={TEXT_BODY}
            >
              {count} art · {c.sov.toFixed(1)}% · {c.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

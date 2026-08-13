"use client";

// ═══════════════════════════════════════════════════════════════
//  SentimentTimelineGenerator — Skill 11
//
//  A 24-hour (or 7-day) hourly sentiment evolution chart. Inline
//  SVG bar chart, current hour pulse, peak/trough annotations,
//  anomaly red dots, 24h/7j toggle, summary stats, export PDF.
//
//  Pipeline:
//    1. On mount, POST /api/console/sentiment-timeline { mode }
//    2. API returns buckets + summary (peak, trough, anomalies)
//    3. Sections reveal one-by-one (200ms stagger)
//    4. Toggle 24h / 7j re-POSTs and re-reveals
//
//  Design system (non-negotiable):
//    • White #FFFFFF bg, sage #4A7B5F accents, charcoal #0A0A0A text
//    • Space Mono headers, Inter body, Lucide icons, NO emojis, French
//    • Same popup pattern as BriefingGenerator
// ═══════════════════════════════════════════════════════════════

import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";

// ─── DESIGN TOKENS ─────────────────────────────────────────────
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.20)";
const CHARCOAL = "#0A0A0A";
const WHITE = "#FFFFFF";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const NEGATIVE = "#EF4444";
const NEUTRAL_GRAY = "#D4D4D4";
const LIGHT_GRAY = "#E5E5E5";

// Chart geometry — fixed viewBox, scales responsively via CSS.
const CHART_W = 640;
const CHART_H = 200;
const CHART_PAD_TOP = 16;
const CHART_PAD_BOTTOM = 28; // x-axis labels
const CHART_PAD_LEFT = 4;
const CHART_PAD_RIGHT = 4;
const PLOT_W = CHART_W - CHART_PAD_LEFT - CHART_PAD_RIGHT;
const PLOT_H = CHART_H - CHART_PAD_TOP - CHART_PAD_BOTTOM;

// ─── TYPES ─────────────────────────────────────────────────────
type DominantSentiment = "positive" | "neutral" | "negative" | "none";
type TimelineMode = "24h" | "7j";

interface SentimentBucket {
  hour: number;
  label: string;
  articleCount: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  dominantSentiment: DominantSentiment;
  isAnomaly: boolean;
  isPeak: boolean;
  isTrough: boolean;
  isCurrent: boolean;
}

interface Summary {
  totalArticles: number;
  avgSentimentScore: number;
  dominantSentiment: DominantSentiment;
  trend: "rising" | "falling" | "stable";
  peak: { hour: number; label: string; count: number } | null;
  trough: { hour: number; label: string; count: number } | null;
  anomalies: Array<{ hour: number; label: string; count: number; zScore: number }>;
}

interface TimelineData {
  meta: {
    companyName: string;
    mode: TimelineMode;
    generatedAt: string;
    windowStart: string;
    windowEnd: string;
  };
  buckets: SentimentBucket[];
  summary: Summary;
}

// ─── SECTIONS (200ms staggered reveal) ─────────────────────────
const SECTIONS = [
  { id: "header", delay: 200 },
  { id: "stats", delay: 400 },
  { id: "chart", delay: 600 },
  { id: "annotations", delay: 800 },
  { id: "actions", delay: 1000 },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

// ─── HELPERS ───────────────────────────────────────────────────
function barColor(d: DominantSentiment): string {
  switch (d) {
    case "positive":
      return SAGE;
    case "negative":
      return NEGATIVE;
    case "neutral":
      return NEUTRAL_GRAY;
    default:
      return LIGHT_GRAY;
  }
}

function sentimentWord(d: DominantSentiment): string {
  switch (d) {
    case "positive":
      return "positif";
    case "negative":
      return "négatif";
    case "neutral":
      return "neutre";
    default:
      return "—";
  }
}

function trendWord(t: Summary["trend"]): string {
  switch (t) {
    case "rising":
      return "en hausse";
    case "falling":
      return "en baisse";
    default:
      return "stable";
  }
}

function generatedDateLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── COMPONENT ─────────────────────────────────────────────────
export function SentimentTimelineGenerator({
  onClose,
}: {
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TimelineData | null>(null);
  const [mode, setMode] = useState<TimelineMode>("24h");
  const [visibleSections, setVisibleSections] = useState<Set<SectionId>>(
    new Set(),
  );
  const [generating, setGenerating] = useState(true);
  const [hoveredBucket, setHoveredBucket] = useState<number | null>(null);

  const generate = useCallback(
    async (m: TimelineMode) => {
      setLoading(true);
      setError(null);
      setData(null);
      setVisibleSections(new Set());
      setGenerating(true);
      setHoveredBucket(null);
      try {
        const res = await fetch("/api/console/sentiment-timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: m }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = (await res.json()) as TimelineData;
        setData(payload);
        setLoading(false);
        for (const section of SECTIONS) {
          setTimeout(() => {
            setVisibleSections((prev) => {
              const next = new Set(prev);
              next.add(section.id);
              return next;
            });
            if (section.id === "actions") setGenerating(false);
          }, section.delay);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Échec");
        setLoading(false);
        setGenerating(false);
      }
    },
    [],
  );

  useEffect(() => {
    void generate(mode);
  }, [generate, mode]);

  const handleModeToggle = (m: TimelineMode) => {
    if (m === mode) return;
    setMode(m);
  };

  // ─── Derived chart values ───────────────────────────────────
  const buckets = data?.buckets ?? [];
  const maxCount = Math.max(1, ...buckets.map((b) => b.articleCount));
  const barGap = buckets.length > 12 ? 2 : 8;
  const barW =
    buckets.length > 0
      ? (PLOT_W - barGap * (buckets.length - 1)) / buckets.length
      : 0;

  const summary = data?.summary;
  const isPdfReady = !!data && !generating;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(10,10,10,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          background: WHITE,
          borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header bar ─────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Activity size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: CHARCOAL,
              }}
            >
              Timeline de Sentiment — 24h
            </span>
            {generating && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: SAGE,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                <Loader2 size={11} className="animate-spin" /> Génération...
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              disabled={!isPdfReady}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: !isPdfReady ? BORDER : CHARCOAL,
                color: !isPdfReady ? TEXT_MUTED : WHITE,
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: !isPdfReady ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Body ───────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 36px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: CHARCOAL,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2
                size={32}
                style={{
                  color: SAGE,
                  animation: "spin 1s linear infinite",
                }}
              />
              <p
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: TEXT_MUTED,
                }}
              >
                Collecte de la timeline sentiment en cours...
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: NEGATIVE }} />
              <p
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: NEGATIVE,
                }}
              >
                {error}
              </p>
              <button
                onClick={() => generate(mode)}
                style={{
                  marginTop: 16,
                  padding: "8px 16px",
                  background: CHARCOAL,
                  color: WHITE,
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {data && (
            <div id="sentiment-timeline-document">
              {/* ─── Section: Header ─────────────────────── */}
              <AnimatePresence>
                {visibleSections.has("header") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Calendar size={14} style={{ color: SAGE }} />
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "'Space Mono', monospace",
                          color: SAGE,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {generatedDateLabel(data.meta.generatedAt)}
                      </span>
                    </div>
                    <h1
                      style={{
                        fontSize: 26,
                        fontWeight: 700,
                        margin: 0,
                        color: CHARCOAL,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Timeline de Sentiment — {data.meta.companyName}
                    </h1>
                    <p
                      style={{
                        fontSize: 13,
                        color: TEXT_MUTED,
                        marginTop: 4,
                      }}
                    >
                      Évolution horaire du sentiment ·{" "}
                      {data.meta.mode === "24h" ? "24 heures" : "7 jours"} ·
                      basé sur {summary?.totalArticles ?? 0} articles
                    </p>

                    {/* 24h / 7j toggle */}
                    <div
                      style={{
                        display: "inline-flex",
                        marginTop: 14,
                        padding: 3,
                        background: "#F5F5F5",
                        borderRadius: 6,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      {(["24h", "7j"] as TimelineMode[]).map((m) => {
                        const active = mode === m;
                        return (
                          <button
                            key={m}
                            onClick={() => handleModeToggle(m)}
                            style={{
                              padding: "6px 14px",
                              background: active ? CHARCOAL : "transparent",
                              color: active ? WHITE : TEXT_MUTED,
                              border: "none",
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "'Space Mono', monospace",
                              letterSpacing: "0.04em",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {m === "24h" ? "24 Heures" : "7 Jours"}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Section: Summary stats ──────────────── */}
              <AnimatePresence>
                {visibleSections.has("stats") && summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24,
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 12,
                    }}
                  >
                    <StatCard
                      label="Articles"
                      value={String(summary.totalArticles)}
                      hint={
                        data.meta.mode === "24h"
                          ? "sur 24 heures"
                          : "sur 7 jours"
                      }
                    />
                    <StatCard
                      label="Sentiment moyen"
                      value={
                        summary.avgSentimentScore > 0
                          ? `+${summary.avgSentimentScore.toFixed(2)}`
                          : summary.avgSentimentScore.toFixed(2)
                      }
                      hint={sentimentWord(summary.dominantSentiment)}
                      tone={
                        summary.avgSentimentScore > 0.05
                          ? "positive"
                          : summary.avgSentimentScore < -0.05
                            ? "negative"
                            : "neutral"
                      }
                    />
                    <StatCard
                      label="Tendance"
                      value={trendWord(summary.trend)}
                      hint="premier vs dernier tiers"
                      icon={
                        summary.trend === "rising" ? (
                          <TrendingUp size={14} style={{ color: SAGE }} />
                        ) : summary.trend === "falling" ? (
                          <TrendingDown size={14} style={{ color: NEGATIVE }} />
                        ) : (
                          <Minus size={14} style={{ color: TEXT_MUTED }} />
                        )
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Section: Chart ───────────────────────── */}
              <AnimatePresence>
                {visibleSections.has("chart") && data && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24,
                      padding: 20,
                      background: "#FAFAFA",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Volume par {data.meta.mode === "24h" ? "heure" : "jour"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          fontSize: 11,
                          color: TEXT_MUTED,
                        }}
                      >
                        <LegendDot color={SAGE} label="Positif" />
                        <LegendDot color={NEUTRAL_GRAY} label="Neutre" />
                        <LegendDot color={NEGATIVE} label="Négatif" />
                      </div>
                    </div>

                    <svg
                      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                      width="100%"
                      height={CHART_H}
                      style={{ display: "block" }}
                    >
                      {/* baseline */}
                      <line
                        x1={CHART_PAD_LEFT}
                        y1={CHART_PAD_TOP + PLOT_H}
                        x2={CHART_W - CHART_PAD_RIGHT}
                        y2={CHART_PAD_TOP + PLOT_H}
                        stroke={BORDER}
                        strokeWidth={1}
                      />

                      {buckets.map((b, i) => {
                        const x =
                          CHART_PAD_LEFT + i * (barW + barGap);
                        const h =
                          b.articleCount === 0
                            ? 1
                            : Math.max(
                                2,
                                (b.articleCount / maxCount) * PLOT_H,
                              );
                        const y =
                          CHART_PAD_TOP + PLOT_H - h;
                        const color = barColor(b.dominantSentiment);
                        const isHovered = hoveredBucket === i;
                        return (
                          <g
                            key={i}
                            onMouseEnter={() => setHoveredBucket(i)}
                            onMouseLeave={() => setHoveredBucket(null)}
                            style={{ cursor: "pointer" }}
                          >
                            {/* invisible wider hit target */}
                            <rect
                              x={x - barGap / 2}
                              y={CHART_PAD_TOP}
                              width={barW + barGap}
                              height={PLOT_H}
                              fill="transparent"
                            />
                            {/* the bar */}
                            <rect
                              x={x}
                              y={y}
                              width={barW}
                              height={h}
                              fill={color}
                              opacity={
                                b.articleCount === 0
                                  ? 0.4
                                  : isHovered
                                    ? 1
                                    : 0.85
                              }
                              rx={buckets.length > 12 ? 1 : 2}
                            />
                            {/* current-hour pulse outline */}
                            {b.isCurrent && (
                              <rect
                                x={x - 1.5}
                                y={y - 1.5}
                                width={barW + 3}
                                height={h + 3}
                                fill="none"
                                stroke={SAGE}
                                strokeWidth={1.5}
                                rx={buckets.length > 12 ? 2 : 3}
                                style={{
                                  animation:
                                    "stl-pulse 1.6s ease-in-out infinite",
                                }}
                              />
                            )}
                            {/* peak marker — small triangle on top */}
                            {b.isPeak && (
                              <polygon
                                points={`${x + barW / 2 - 4},${y - 6} ${x + barW / 2 + 4},${y - 6} ${x + barW / 2},${y - 1}`}
                                fill={SAGE}
                              />
                            )}
                            {/* trough marker — small inverted triangle below */}
                            {b.isTrough && (
                              <polygon
                                points={`${x + barW / 2 - 4},${y + h + 1} ${x + barW / 2 + 4},${y + h + 1} ${x + barW / 2},${y + h + 6}`}
                                fill={TEXT_MUTED}
                              />
                            )}
                            {/* anomaly red dot above the bar */}
                            {b.isAnomaly && (
                              <circle
                                cx={x + barW / 2}
                                cy={Math.max(CHART_PAD_TOP + 4, y - 12)}
                                r={4}
                                fill={NEGATIVE}
                                stroke={WHITE}
                                strokeWidth={1}
                              />
                            )}
                            {/* x-axis label */}
                            <text
                              x={x + barW / 2}
                              y={CHART_H - 10}
                              textAnchor="middle"
                              fontSize={buckets.length > 12 ? 8 : 10}
                              fill={b.isCurrent ? SAGE : TEXT_MUTED}
                              fontFamily="'Space Mono', monospace"
                              fontWeight={b.isCurrent ? 700 : 400}
                            >
                              {b.label}
                            </text>
                            {/* count label on hover or peak */}
                            {(isHovered || b.isPeak) && b.articleCount > 0 && (
                              <text
                                x={x + barW / 2}
                                y={y - (b.isAnomaly ? 22 : 8)}
                                textAnchor="middle"
                                fontSize={10}
                                fill={CHARCOAL}
                                fontFamily="'Space Mono', monospace"
                                fontWeight={600}
                              >
                                {b.articleCount}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>

                    {/* tooltip detail under chart */}
                    <div
                      style={{
                        marginTop: 8,
                        minHeight: 28,
                        padding: "6px 10px",
                        background: hoveredBucket !== null ? WHITE : "transparent",
                        border:
                          hoveredBucket !== null
                            ? `1px solid ${BORDER}`
                            : "1px solid transparent",
                        borderRadius: 4,
                        fontSize: 12,
                        color: TEXT_BODY,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      {hoveredBucket !== null ? (
                        <>
                          <span
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              fontWeight: 700,
                              color: CHARCOAL,
                            }}
                          >
                            {buckets[hoveredBucket].label}
                          </span>
                          <span>
                            {buckets[hoveredBucket].articleCount} article
                            {buckets[hoveredBucket].articleCount > 1
                              ? "s"
                              : ""}
                          </span>
                          <span style={{ color: SAGE }}>
                            {buckets[hoveredBucket].positivePct}% positif
                          </span>
                          <span style={{ color: TEXT_MUTED }}>
                            {buckets[hoveredBucket].neutralPct}% neutre
                          </span>
                          <span style={{ color: NEGATIVE }}>
                            {buckets[hoveredBucket].negativePct}% négatif
                          </span>
                        </>
                      ) : (
                        <span
                          style={{
                            color: TEXT_MUTED,
                            fontFamily: "'Space Mono', monospace",
                            fontSize: 11,
                          }}
                        >
                          Survoler une barre pour le détail
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Section: Annotations ────────────────── */}
              <AnimatePresence>
                {visibleSections.has("annotations") && summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    {summary.peak && (
                      <AnnotationRow
                        icon={<TrendingUp size={14} style={{ color: SAGE }} />}
                        label="Pic"
                        text={`Pic à ${summary.peak.label} : ${summary.peak.count} article${summary.peak.count > 1 ? "s" : ""}`}
                        tone="positive"
                      />
                    )}
                    {summary.trough && (
                      <AnnotationRow
                        icon={<TrendingDown size={14} style={{ color: TEXT_MUTED }} />}
                        label="Creux"
                        text={`Creux à ${summary.trough.label} : ${summary.trough.count} article${summary.trough.count > 1 ? "s" : ""}`}
                        tone="neutral"
                      />
                    )}
                    {summary.anomalies.length > 0 ? (
                      summary.anomalies.map((a, i) => (
                        <AnnotationRow
                          key={i}
                          icon={<AlertCircle size={14} style={{ color: NEGATIVE }} />}
                          label={`Anomalie (z=${a.zScore})`}
                          text={`Volume inhabituel à ${a.label} : ${a.count} articles — écart > 2σ`}
                          tone="negative"
                        />
                      ))
                    ) : (
                      <AnnotationRow
                        icon={<Clock size={14} style={{ color: TEXT_MUTED }} />}
                        label="Anomalies"
                        text="Aucune anomalie détectée — distribution conforme à la moyenne."
                        tone="neutral"
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Section: Actions ─────────────────────── */}
              <AnimatePresence>
                {visibleSections.has("actions") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex",
                      gap: 8,
                      paddingTop: 16,
                      borderTop: `1px solid ${BORDER}`,
                    }}
                  >
                    <button
                      onClick={() => window.print()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 20px",
                        background: CHARCOAL,
                        color: WHITE,
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <Download size={14} /> Exporter PDF
                    </button>
                    <button
                      onClick={() => generate(mode)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 16px",
                        background: "transparent",
                        color: TEXT_BODY,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <RefreshCw size={14} /> Régénérer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {generating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 16,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: SAGE,
                      animation: "pulse 1s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: SAGE,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    Construction de la timeline...
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Global styles: spin + pulse + print ───────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes stl-pulse {
          0%, 100% { opacity: 1; stroke-width: 1.5; }
          50%      { opacity: 0.5; stroke-width: 2.5; }
        }
        @media print {
          body * { visibility: hidden; }
          #sentiment-timeline-document,
          #sentiment-timeline-document * { visibility: visible; }
          #sentiment-timeline-document {
            position: absolute;
            left: 0; top: 0; width: 100%; padding: 32px;
          }
        }
      `}</style>
    </div>
  );
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────

function StatCard({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
}) {
  const toneColor =
    tone === "positive"
      ? SAGE
      : tone === "negative"
        ? NEGATIVE
        : CHARCOAL;
  return (
    <div
      style={{
        padding: 14,
        background: WHITE,
        borderRadius: 8,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontFamily: "'Space Mono', monospace",
          color: TEXT_MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 22,
          fontWeight: 700,
          color: toneColor,
          lineHeight: 1,
        }}
      >
        {icon}
        <span>{value}</span>
      </div>
      {hint && (
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            color: TEXT_MUTED,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "'Space Mono', monospace",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          background: color,
          borderRadius: 2,
        }}
      />
      {label}
    </span>
  );
}

function AnnotationRow({
  icon,
  label,
  text,
  tone,
}: {
  icon: ReactNode;
  label: string;
  text: string;
  tone: "positive" | "negative" | "neutral";
}) {
  const bg =
    tone === "negative"
      ? "rgba(239,68,68,0.06)"
      : tone === "positive"
        ? SAGE_BG
        : "#FAFAFA";
  const borderColor =
    tone === "negative"
      ? "rgba(239,68,68,0.20)"
      : tone === "positive"
        ? SAGE_BORDER
        : BORDER;
  const labelColor =
    tone === "negative" ? NEGATIVE : tone === "positive" ? SAGE : TEXT_MUTED;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 6,
      }}
    >
      {icon}
      <span
        style={{
          fontSize: 11,
          fontFamily: "'Space Mono', monospace",
          color: labelColor,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
          minWidth: 110,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: CHARCOAL,
          flex: 1,
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── DESIGN TOKEN EXPORT (for callers who want to match the look) ─
export const SENTIMENT_TIMELINE_TOKENS = {
  SAGE,
  CHARCOAL,
  WHITE,
  NEGATIVE,
  NEUTRAL_GRAY,
} as const;

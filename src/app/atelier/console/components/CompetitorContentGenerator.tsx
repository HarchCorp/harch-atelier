"use client";

// ═══════════════════════════════════════════════════════════════
//  <CompetitorContentGenerator />
//
//  Skill 15 — Competitor Content Analysis.
//  Shows what competitors are publishing and how their coverage
//  compares. Popup pattern identical to BriefingGenerator /
//  CompetitorMatrixGenerator:
//    - fixed overlay, sage/charcoal/white palette
//    - sections fade in one-by-one via framer-motion
//    - window.print() for PDF export with a print-only stylesheet
//
//  Layout (top → bottom):
//    1. Header bar (icon + title + PDF + close)
//    2. Document body:
//       a. Title block (date, "Contenu Concurrents", sector + window)
//       b. Competitor selector tabs (one per competitor)
//       c. Stats row: article count · frequency · sentiment badge
//       d. Keyword chips (top 8 per competitor)
//       e. 3 recent article cards (title, source, date, sentiment)
//       f. SOV donut (SVG, animated stroke-dashoffset)
//       g. BarChart: posting frequency comparison across ALL comps
//       h. Actions: Exporter PDF · Régénérer
//
//  Design system: White #FFFFFF bg, sage #4A7B5F accents,
//  charcoal #0A0A0A text, Space Mono labels, Inter body,
//  Lucide icons, NO emojis, French. framer-motion entrances.
// ═══════════════════════════════════════════════════════════════

import {
  useState,
  useEffect,
  useCallback,
  type ComponentType,
  type CSSProperties,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Newspaper,
  BarChart3,
  Hash,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Calendar,
} from "lucide-react";

const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";

interface RecentArticle {
  title: string;
  source: string;
  date: string | null;
  url: string;
  sentiment: string;
}

interface CompetitorContent {
  name: string;
  articleCount: number;
  frequency: number;
  avgSentiment: number;
  topKeywords: string[];
  recentArticles: RecentArticle[];
  sov: number;
}

interface CompetitorContentData {
  competitors: CompetitorContent[];
  meta?: { sector?: string | null; generatedAt?: string };
}

type IconType = ComponentType<{ size?: number; style?: CSSProperties }>;

const SECTIONS = [
  { id: "header", delay: 150 },
  { id: "tabs", delay: 300 },
  { id: "stats", delay: 450 },
  { id: "keywords", delay: 600 },
  { id: "articles", delay: 750 },
  { id: "sov", delay: 900 },
  { id: "chart", delay: 1050 },
  { id: "actions", delay: 1200 },
];

// ─── Sentiment helpers ─────────────────────────────────────────
function sentimentBadge(value: number): {
  color: string;
  label: string;
  Icon: IconType;
} {
  if (value > 0.15)
    return { color: POSITIVE, label: "positif", Icon: TrendingUp };
  if (value < -0.15)
    return { color: NEGATIVE, label: "negatif", Icon: TrendingDown };
  return { color: TEXT_MUTED, label: "neutre", Icon: Minus };
}

function sentimentColor(label: string): string {
  if (label === "positive") return POSITIVE;
  if (label === "negative") return NEGATIVE;
  return TEXT_MUTED;
}

function sentimentFR(label: string): string {
  if (label === "positive") return "positif";
  if (label === "negative") return "negatif";
  return "neutre";
}

function formatDate(iso: string | null): string {
  if (!iso) return "Date inconnue";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Date inconnue";
  }
}

// ─── SOV donut (pure SVG, animated via framer-motion) ──────────
function SovDonut({ value, name }: { value: number; name: string }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = c - (clamped / 100) * c;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg
        width={140}
        height={140}
        viewBox="0 0 140 140"
        aria-label={`Part de voix ${value} pourcent`}
      >
        <circle
          cx={70}
          cy={70}
          r={r}
          fill="none"
          stroke={BORDER}
          strokeWidth={10}
        />
        <g transform="rotate(-90 70 70)">
          <motion.circle
            cx={70}
            cy={70}
            r={r}
            fill="none"
            stroke={SAGE}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </g>
        <text
          x={70}
          y={66}
          textAnchor="middle"
          style={{
            fontSize: 26,
            fontWeight: 700,
            fill: CHARCOAL,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {value}%
        </text>
        <text
          x={70}
          y={86}
          textAnchor="middle"
          style={{
            fontSize: 10,
            fill: TEXT_MUTED,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.08em",
          }}
        >
          SOV
        </text>
      </svg>
      <div>
        <div
          style={{
            fontSize: 10,
            fontFamily: "'Space Mono', monospace",
            color: TEXT_MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Part de voix
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: CHARCOAL,
            marginTop: 4,
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>
          vs secteur · 30 derniers jours
        </div>
      </div>
    </div>
  );
}

// ─── Frequency BarChart (all competitors, animated bars) ───────
function FrequencyChart({ data }: { data: CompetitorContent[] }) {
  const maxFreq = Math.max(...data.map((d) => d.frequency), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => {
        const pct = (d.frequency / maxFreq) * 100;
        return (
          <div
            key={`${d.name}-${i}`}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div
              style={{
                width: 140,
                fontSize: 12,
                color: CHARCOAL,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={d.name}
            >
              {d.name}
            </div>
            <div
              style={{
                flex: 1,
                height: 22,
                background: "#FAFAFA",
                borderRadius: 4,
                border: `1px solid ${BORDER}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.08 }}
                style={{ height: "100%", background: SAGE, borderRadius: 3 }}
              />
            </div>
            <div
              style={{
                width: 72,
                textAlign: "right",
                fontSize: 12,
                fontFamily: "'Space Mono', monospace",
                color: TEXT_BODY,
              }}
            >
              {d.frequency.toFixed(1)}/sem
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  Icon,
}: {
  label: string;
  value: string;
  sub?: { text: string; color: string };
  Icon: IconType;
}) {
  return (
    <div
      style={{
        padding: 16,
        background: "#FAFAFA",
        borderRadius: 8,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <Icon size={12} style={{ color: SAGE }} />
        <span
          style={{
            fontSize: 10,
            fontFamily: "'Space Mono', monospace",
            color: TEXT_MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: CHARCOAL,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: sub.color, marginTop: 4 }}>
          {sub.text}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Main popup component
// ═══════════════════════════════════════════════════════════════
export function CompetitorContentGenerator({
  onClose,
}: {
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CompetitorContentData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(),
  );
  const [generating, setGenerating] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setActiveTab(0);
    setVisibleSections(new Set());
    setGenerating(true);
    try {
      const res = await fetch("/api/console/competitor-content", {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload: CompetitorContentData = await res.json();
      setData(payload);
      setLoading(false);
      for (const section of SECTIONS) {
        setTimeout(() => {
          setVisibleSections((prev) => new Set(prev).add(section.id));
          if (section.id === "actions") setGenerating(false);
        }, section.delay);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false);
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    void generate();
  }, [generate]);

  const competitors = data?.competitors ?? [];
  const current = competitors[activeTab];

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
          maxWidth: 920,
          maxHeight: "92vh",
          background: "#FFFFFF",
          borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header bar ─────────────────────────────────────── */}
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
            <Newspaper size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Contenu Concurrents
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
              disabled={generating || !data}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: generating || !data ? BORDER : CHARCOAL,
                color: generating || !data ? TEXT_MUTED : "#FFFFFF",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: generating || !data ? "not-allowed" : "pointer",
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
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Document body ──────────────────────────────────── */}
        <div
          id="competitor-content-document"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 32px",
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
                Collecte des publications concurrentes...
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
                onClick={generate}
                style={{
                  marginTop: 16,
                  padding: "8px 16px",
                  background: CHARCOAL,
                  color: "#FFFFFF",
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
            <div>
              {/* (a) Title block */}
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
                        {new Date().toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
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
                      Contenu Concurrents
                    </h1>
                    <p
                      style={{
                        fontSize: 13,
                        color: TEXT_MUTED,
                        marginTop: 4,
                      }}
                    >
                      Analyse éditoriale · {competitors.length} concurrents
                      {data.meta?.sector
                        ? ` · secteur ${data.meta.sector.toLowerCase()}`
                        : ""}
                      {" · 30 derniers jours"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* (b) Competitor selector tabs */}
              <AnimatePresence>
                {visibleSections.has("tabs") && competitors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex",
                      gap: 4,
                      marginBottom: 24,
                      borderBottom: `1px solid ${BORDER}`,
                      overflowX: "auto",
                    }}
                  >
                    {competitors.map((c, i) => {
                      const active = i === activeTab;
                      return (
                        <button
                          key={`${c.name}-${i}`}
                          onClick={() => setActiveTab(i)}
                          style={{
                            padding: "10px 14px",
                            background: "transparent",
                            border: "none",
                            borderBottom: active
                              ? `2px solid ${SAGE}`
                              : "2px solid transparent",
                            color: active ? SAGE : TEXT_MUTED,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            whiteSpace: "nowrap",
                            marginBottom: -1,
                          }}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {current && (
                <>
                  {/* (c) Stats row */}
                  <AnimatePresence mode="wait">
                    {visibleSections.has("stats") && (
                      <motion.div
                        key={`stats-${activeTab}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 12,
                          marginBottom: 24,
                        }}
                      >
                        <StatCard
                          label="Articles (30j)"
                          value={String(current.articleCount)}
                          Icon={Newspaper}
                        />
                        <StatCard
                          label="Fréquence"
                          value={`${current.frequency.toFixed(1)}/sem`}
                          Icon={BarChart3}
                        />
                        {(() => {
                          const s = sentimentBadge(current.avgSentiment);
                          const sign =
                            current.avgSentiment > 0
                              ? `+${current.avgSentiment.toFixed(2)}`
                              : current.avgSentiment.toFixed(2);
                          return (
                            <StatCard
                              label="Sentiment moyen"
                              value={sign}
                              sub={{ text: s.label, color: s.color }}
                              Icon={s.Icon}
                            />
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* (d) Keyword chips */}
                  <AnimatePresence mode="wait">
                    {visibleSections.has("keywords") &&
                      current.topKeywords.length > 0 && (
                        <motion.div
                          key={`kw-${activeTab}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          style={{ marginBottom: 24 }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 10,
                            }}
                          >
                            <Hash size={12} style={{ color: SAGE }} />
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: "'Space Mono', monospace",
                                color: TEXT_MUTED,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                              }}
                            >
                              Mots-clés dominants
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            {current.topKeywords.map((k, i) => (
                              <span
                                key={`${k}-${i}`}
                                style={{
                                  padding: "5px 11px",
                                  background: SAGE_BG,
                                  border: `1px solid ${SAGE_BORDER}`,
                                  borderRadius: 4,
                                  fontSize: 12,
                                  color: SAGE,
                                  fontFamily: "'Space Mono', monospace",
                                }}
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* (e) Recent article cards */}
                  <AnimatePresence mode="wait">
                    {visibleSections.has("articles") &&
                      current.recentArticles.length > 0 && (
                        <motion.div
                          key={`art-${activeTab}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          style={{ marginBottom: 24 }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 10,
                            }}
                          >
                            <Newspaper size={12} style={{ color: SAGE }} />
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: "'Space Mono', monospace",
                                color: TEXT_MUTED,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                              }}
                            >
                              Articles récents
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                            }}
                          >
                            {current.recentArticles.map((a, i) => {
                              const sc = sentimentColor(a.sentiment);
                              return (
                                <div
                                  key={`${a.url}-${i}`}
                                  style={{
                                    padding: 14,
                                    background: "#FFFFFF",
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 8,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 6,
                                  }}
                                >
                                  <a
                                    href={a.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 600,
                                      color: CHARCOAL,
                                      textDecoration: "none",
                                      display: "flex",
                                      alignItems: "start",
                                      gap: 6,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    <span style={{ flex: 1 }}>{a.title}</span>
                                    <ExternalLink
                                      size={12}
                                      style={{
                                        color: TEXT_MUTED,
                                        flexShrink: 0,
                                        marginTop: 2,
                                      }}
                                    />
                                  </a>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                      fontSize: 11,
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: TEXT_BODY,
                                        fontWeight: 500,
                                      }}
                                    >
                                      {a.source}
                                    </span>
                                    <span style={{ color: BORDER }}>·</span>
                                    <span style={{ color: TEXT_MUTED }}>
                                      {formatDate(a.date)}
                                    </span>
                                    <span
                                      style={{
                                        marginLeft: "auto",
                                        padding: "2px 8px",
                                        borderRadius: 3,
                                        background: `${sc}14`,
                                        color: sc,
                                        fontWeight: 600,
                                        fontSize: 10,
                                        fontFamily: "'Space Mono', monospace",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                      }}
                                    >
                                      {sentimentFR(a.sentiment)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* (f) SOV donut */}
                  <AnimatePresence mode="wait">
                    {visibleSections.has("sov") && (
                      <motion.div
                        key={`sov-${activeTab}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          marginBottom: 24,
                          padding: 20,
                          background: "#FAFAFA",
                          borderRadius: 8,
                          border: `1px solid ${BORDER}`,
                        }}
                      >
                        <SovDonut value={current.sov} name={current.name} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* (g) BarChart — posting frequency comparison */}
              <AnimatePresence>
                {visibleSections.has("chart") && competitors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24,
                      padding: 20,
                      background: "#FFFFFF",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 14,
                      }}
                    >
                      <BarChart3 size={12} style={{ color: SAGE }} />
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Fréquence de publication · comparaison
                      </span>
                    </div>
                    <FrequencyChart data={competitors} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* (h) Actions */}
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
                        color: "#FFFFFF",
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
                      onClick={generate}
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
                    Rédaction en cours...
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } @media print { body * { visibility: hidden; } #competitor-content-document, #competitor-content-document * { visibility: visible; } #competitor-content-document { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; } }`}</style>
    </div>
  );
}

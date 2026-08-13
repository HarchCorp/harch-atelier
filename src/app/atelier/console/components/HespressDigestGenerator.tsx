"use client";

// ═══════════════════════════════════════════════════════════════
//  Skill 4 — Hespress Comment Digest Generator
//
//  Popup delivering the REAL pulse of Morocco through Hespress
//  comments. Sections appear one-by-one via framer-motion:
//    a. Header (Pulse Hespress + company + date)
//    b. Stats bar (articles · comments · % positif)
//    c. Language breakdown (FR / AR / Darija pie)
//    d. Top 5 negative comments (red accent)
//    e. Top 5 positive comments (sage accent)
//    f. Trending topics (sage chips)
//    g. Export PDF button
//
//  Design system: white #FFFFFF, sage #4A7B5F, charcoal #0A0A0A,
//  Space Mono headers, Inter body, Lucide icons, French, no emojis.
//  Same popup pattern as BriefingGenerator.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, MessageSquare,
  TrendingDown, TrendingUp, ThumbsUp, Tag, Calendar,
  Newspaper, RefreshCw, Activity,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE) ────────────────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";
const AMBER = "#F59E0B";
const NEGATIVE_BG = "rgba(239,68,68,0.06)";
const NEGATIVE_BORDER = "rgba(239,68,68,0.2)";
const AMBER_BG = "rgba(245,158,11,0.1)";

// ─── Types (mirror route.ts) ───────────────────────────────────
interface DigestComment {
  id: string;
  text: string;
  author: string;
  likes: number;
  language: "fr" | "ar" | "darija" | "mixed";
  sentiment: "positive" | "neutral" | "negative" | null;
  articleTitle: string;
  articleUrl: string;
}

interface HespressDigest {
  meta: {
    companyName: string;
    sector: string | null;
    generatedAt: string;
    date: string;
  };
  stats: {
    articleCount: number;
    commentCount: number;
    positivePct: number;
    neutralPct: number;
    negativePct: number;
  };
  languageBreakdown: {
    fr: number;
    ar: number;
    darija: number;
    mixed: number;
  };
  topArticles: Array<{
    title: string;
    url: string;
    category: string | null;
    publishedAt: string | null;
    commentCount: number;
    sentiment: { positive: number; neutral: number; negative: number };
  }>;
  topComments: DigestComment[];
  topNegative: DigestComment[];
  topPositive: DigestComment[];
  trendingTopics: Array<{ term: string; count: number }>;
}

// ─── Section reveal schedule ───────────────────────────────────
const SECTIONS = [
  { id: "header", delay: 200 },
  { id: "stats", delay: 400 },
  { id: "language", delay: 600 },
  { id: "negative", delay: 800 },
  { id: "positive", delay: 1000 },
  { id: "topics", delay: 1200 },
  { id: "actions", delay: 1400 },
];

// ─── Language badge styling ────────────────────────────────────
function languageBadgeStyle(lang: DigestComment["language"]): {
  bg: string;
  color: string;
  label: string;
} {
  switch (lang) {
    case "darija":
      return { bg: AMBER_BG, color: AMBER, label: "Darija" };
    case "ar":
      return { bg: SAGE_BG, color: SAGE, label: "AR" };
    case "fr":
      return { bg: SAGE_BG, color: SAGE, label: "FR" };
    default:
      return { bg: BORDER, color: TEXT_MUTED, label: "Mixte" };
  }
}

function sentimentDot(sentiment: DigestComment["sentiment"]): string {
  if (sentiment === "positive") return POSITIVE;
  if (sentiment === "negative") return NEGATIVE;
  return TEXT_MUTED;
}

// ─── Component ─────────────────────────────────────────────────
export function HespressDigestGenerator({
  onClose,
  companyName,
}: {
  onClose: () => void;
  companyName?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HespressDigest | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(),
  );
  const [generating, setGenerating] = useState(true);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleSections(new Set());
    setGenerating(true);

    try {
      const res = await fetch("/api/console/hespress-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyName ? { companyName } : {}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const digest: HespressDigest = await res.json();
      setData(digest);
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
  }, [companyName]);

  useEffect(() => {
    void generate();
  }, [generate]);

  // ─── Compute language pie segments ──────────────────────────
  const langTotal = data
    ? data.languageBreakdown.fr +
      data.languageBreakdown.ar +
      data.languageBreakdown.darija +
      data.languageBreakdown.mixed
    : 0;
  const frPct = langTotal > 0 ? (data!.languageBreakdown.fr / langTotal) * 100 : 0;
  const arPct = langTotal > 0 ? (data!.languageBreakdown.ar / langTotal) * 100 : 0;
  const darijaPct =
    langTotal > 0 ? (data!.languageBreakdown.darija / langTotal) * 100 : 0;
  const mixedPct =
    langTotal > 0 ? (data!.languageBreakdown.mixed / langTotal) * 100 : 0;

  const pieGradient = `conic-gradient(
    ${SAGE} 0% ${frPct}%,
    ${CHARCOAL} ${frPct}% ${frPct + arPct}%,
    ${AMBER} ${frPct + arPct}% ${frPct + arPct + darijaPct}%,
    ${BORDER} ${frPct + arPct + darijaPct}% 100%
  )`;

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
        {/* ─── Header bar ─── */}
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
            <MessageSquare size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Pulse Hespress
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
                <Loader2 size={11} className="animate-spin" /> Scraping...
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
                color: generating || !data ? TEXT_MUTED : WHITE,
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
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Document body ─── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 40px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: CHARCOAL,
          }}
        >
          {/* Loading state — scraping takes 30-60s */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2
                size={32}
                style={{ color: SAGE, animation: "spin 1s linear infinite" }}
              />
              <p
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: CHARCOAL,
                  fontWeight: 600,
                }}
              >
                Scraping Hespress en cours...
              </p>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: TEXT_MUTED,
                  maxWidth: 360,
                  margin: "8px auto 0",
                }}
              >
                Collecte des articles et commentaires depuis hespress.com —
                opération pouvant prendre 30 à 60 secondes.
              </p>
            </div>
          )}

          {/* Error state */}
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

          {/* Data populated */}
          {data && (
            <div id="hespress-digest-document">
              {/* ─── (a) Header ─── */}
              <AnimatePresence>
                {visibleSections.has("header") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 28 }}
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
                        {data.meta.date}
                      </span>
                    </div>
                    <h1
                      style={{
                        fontSize: 26,
                        fontWeight: 700,
                        margin: 0,
                        color: CHARCOAL,
                        letterSpacing: "-0.02em",
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      Pulse Hespress — {data.meta.companyName}
                    </h1>
                    <p
                      style={{
                        fontSize: 13,
                        color: TEXT_MUTED,
                        marginTop: 6,
                      }}
                    >
                      Analyse des commentaires Hespress ·{" "}
                      {data.meta.sector ?? "secteur non précisé"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── (b) Stats bar ─── */}
              <AnimatePresence>
                {visibleSections.has("stats") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24,
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 8,
                      padding: 16,
                      background: "#FAFAFA",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <StatCell
                      icon={<Newspaper size={13} />}
                      label="Articles"
                      value={String(data.stats.articleCount)}
                    />
                    <StatCell
                      icon={<MessageSquare size={13} />}
                      label="Commentaires"
                      value={String(data.stats.commentCount)}
                    />
                    <StatCell
                      icon={<TrendingUp size={13} />}
                      label="Positif"
                      value={`${data.stats.positivePct}%`}
                      color={POSITIVE}
                    />
                    <StatCell
                      icon={<TrendingDown size={13} />}
                      label="Négatif"
                      value={`${data.stats.negativePct}%`}
                      color={NEGATIVE}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty-state: no Hespress articles found */}
              {data.stats.articleCount === 0 && visibleSections.has("stats") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginBottom: 24,
                    padding: 24,
                    textAlign: "center",
                    background: SAGE_BG,
                    borderRadius: 8,
                    border: "1px solid rgba(74,123,95,0.2)",
                  }}
                >
                  <Activity
                    size={28}
                    style={{
                      color: SAGE,
                      margin: "0 auto",
                    }}
                  />
                  <p
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      color: CHARCOAL,
                      fontWeight: 600,
                    }}
                  >
                    Aucun article Hespress mentionnant « {data.meta.companyName}{" "}
                    » trouvé.
                  </p>
                  <p
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: TEXT_MUTED,
                    }}
                  >
                    Réessayez plus tard ou avec un nom d'entreprise alternatif.
                  </p>
                </motion.div>
              )}

              {/* ─── (c) Language breakdown (pie) ─── */}
              <AnimatePresence>
                {visibleSections.has("language") &&
                  langTotal > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginBottom: 24 }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 12,
                        }}
                      >
                        Répartition linguistique
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 24,
                        }}
                      >
                        {/* Pie via conic-gradient */}
                        <div
                          style={{
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            background: pieGradient,
                            flexShrink: 0,
                            position: "relative",
                            boxShadow: `inset 0 0 0 4px ${WHITE}`,
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              inset: "30%",
                              borderRadius: "50%",
                              background: WHITE,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: CHARCOAL,
                                fontFamily: "'Space Mono', monospace",
                                lineHeight: 1,
                              }}
                            >
                              {langTotal}
                            </span>
                            <span
                              style={{
                                fontSize: 9,
                                color: TEXT_MUTED,
                                marginTop: 2,
                              }}
                            >
                              comm.
                            </span>
                          </div>
                        </div>
                        {/* Legend */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            flex: 1,
                          }}
                        >
                          <LangLegend
                            color={SAGE}
                            label="Français"
                            count={data.languageBreakdown.fr}
                            pct={Math.round(frPct)}
                          />
                          <LangLegend
                            color={CHARCOAL}
                            label="Arabe"
                            count={data.languageBreakdown.ar}
                            pct={Math.round(arPct)}
                          />
                          <LangLegend
                            color={AMBER}
                            label="Darija"
                            count={data.languageBreakdown.darija}
                            pct={Math.round(darijaPct)}
                            highlight
                          />
                          <LangLegend
                            color={BORDER}
                            label="Mixte"
                            count={data.languageBreakdown.mixed}
                            pct={Math.round(mixedPct)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* ─── (d) Top 5 negative comments ─── */}
              <AnimatePresence>
                {visibleSections.has("negative") &&
                  data.topNegative.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
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
                        <TrendingDown size={13} style={{ color: NEGATIVE }} />
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "'Space Mono', monospace",
                            color: NEGATIVE,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontWeight: 700,
                          }}
                        >
                          Top 5 commentaires négatifs
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {data.topNegative.map((c) => (
                          <CommentCard
                            key={`neg-${c.id}`}
                            comment={c}
                            accent={NEGATIVE}
                            accentBg={NEGATIVE_BG}
                            accentBorder={NEGATIVE_BORDER}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* ─── (e) Top 5 positive comments ─── */}
              <AnimatePresence>
                {visibleSections.has("positive") &&
                  data.topPositive.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
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
                        <TrendingUp size={13} style={{ color: SAGE }} />
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "'Space Mono', monospace",
                            color: SAGE,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontWeight: 700,
                          }}
                        >
                          Top 5 commentaires positifs
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {data.topPositive.map((c) => (
                          <CommentCard
                            key={`pos-${c.id}`}
                            comment={c}
                            accent={SAGE}
                            accentBg={SAGE_BG}
                            accentBorder="rgba(74,123,95,0.2)"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* ─── (f) Trending topics (sage chips) ─── */}
              <AnimatePresence>
                {visibleSections.has("topics") &&
                  data.trendingTopics.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
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
                        <Tag size={13} style={{ color: SAGE }} />
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "'Space Mono', monospace",
                            color: TEXT_MUTED,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontWeight: 700,
                          }}
                        >
                          Sujets émergents ({data.trendingTopics.length})
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        {data.trendingTopics.map((t, i) => (
                          <span
                            key={`topic-${i}`}
                            style={{
                              padding: "5px 11px",
                              background: SAGE_BG,
                              border: "1px solid rgba(74,123,95,0.15)",
                              borderRadius: 4,
                              fontSize: 12,
                              color: SAGE,
                              fontFamily: "'Space Mono', monospace",
                              fontWeight: 600,
                            }}
                          >
                            {t.term} · {t.count}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* ─── (g) Export PDF button ─── */}
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
                      <RefreshCw size={14} /> Actualiser
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generating indicator (after data load, during re-reveal) */}
              {generating && data && (
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
                    Construction du digest...
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Print styles: only the digest document prints */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media print {
          body * { visibility: hidden; }
          #hespress-digest-document,
          #hespress-digest-document * { visibility: visible; }
          #hespress-digest-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function StatCell({
  icon,
  label,
  value,
  color = CHARCOAL,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          color: TEXT_MUTED,
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 10,
            fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          color,
          fontFamily: "'Space Mono', monospace",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function LangLegend({
  color,
  label,
  count,
  pct,
  highlight = false,
}: {
  color: string;
  label: string;
  count: number;
  pct: number;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          color: CHARCOAL,
          fontWeight: highlight ? 700 : 500,
        }}
      >
        {label}
        {highlight && (
          <span
            style={{
              marginLeft: 6,
              padding: "1px 6px",
              background: AMBER_BG,
              color: AMBER,
              fontSize: 9,
              fontFamily: "'Space Mono', monospace",
              borderRadius: 3,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Spécial
          </span>
        )}
      </span>
      <span style={{ color: TEXT_MUTED, marginLeft: "auto" }}>
        {count} · {pct}%
      </span>
    </div>
  );
}

function CommentCard({
  comment,
  accent,
  accentBg,
  accentBorder,
}: {
  comment: DigestComment;
  accent: string;
  accentBg: string;
  accentBorder: string;
}) {
  const lang = languageBadgeStyle(comment.language);
  const dotColor = sentimentDot(comment.sentiment);

  return (
    <div
      style={{
        padding: "10px 12px",
        background: accentBg,
        borderRadius: 6,
        border: `1px solid ${accentBorder}`,
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: CHARCOAL,
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {comment.text}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 8,
          flexWrap: "wrap",
        }}
      >
        {/* Sentiment dot */}
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
          }}
          title={
            comment.sentiment
              ? `Sentiment: ${comment.sentiment}`
              : "Sentiment: inconnu"
          }
        />
        {/* Language badge */}
        <span
          style={{
            padding: "1px 7px",
            background: lang.bg,
            color: lang.color,
            fontSize: 10,
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            borderRadius: 3,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {lang.label}
        </span>
        {/* Author */}
        <span
          style={{
            fontSize: 11,
            color: TEXT_MUTED,
          }}
        >
          {comment.author}
        </span>
        {/* Likes */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 11,
            color: TEXT_BODY,
            marginLeft: "auto",
            fontWeight: 600,
          }}
        >
          <ThumbsUp size={11} style={{ color: accent }} />
          {comment.likes}
        </span>
      </div>
    </div>
  );
}

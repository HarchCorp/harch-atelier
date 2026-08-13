"use client";

// ═══════════════════════════════════════════════════════════════
//  CrisisBriefingGenerator
//
//  A live document — not chat. When the user clicks "Générer le
//  dossier crise", the popup opens, the API compiles a structured
//  crisis dossier (timeline, impact, actors, actions), and the
//  sections appear one-by-one (200ms delay each).
//
//  Same popup pattern as BriefingGenerator (fixed overlay, scale
//  entrance, sections fade-in with framer-motion), but the accent
//  palette is RED / AMBER, not sage — this is a crisis tool.
//
//  6 sections, in order:
//    a. "Alerte Crise" header (red accent if crisisScore > 50)
//    b. Timeline (first signal → escalation → current state)
//    c. Impact assessment (sentiment shift, mention velocity, reach)
//    d. Key actors (sources, journalists, influencers)
//    e. Recommended actions (3-5 action items, checkboxes)
//    f. Export buttons (PDF, copy)
//
//  Print CSS at the bottom isolates #crisis-document for window.print()
//  so the PDF export is clean (no overlay chrome).
//
//  Skill ID: SKILL-2-CRISIS-BRIEFING
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, AlertOctagon,
  Clock, TrendingDown, Gauge, Users, Target, Flag,
  CheckSquare, Square, Copy, FileText, ExternalLink,
  RefreshCw, Zap, Radio, Link2,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE per spec) ───────────────────
const WHITE = "#FFFFFF";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";

// Crisis palette — red/amber instead of sage
const CRITICAL = "#DC2626";        // red-600 — crisisScore > 50
const CRITICAL_BG = "rgba(220,38,38,0.06)";
const CRITICAL_BORDER = "rgba(220,38,38,0.2)";
const AMBER = "#F59E0B";           // amber-500 — warning
const AMBER_BG = "rgba(245,158,11,0.06)";
const AMBER_BORDER = "rgba(245,158,11,0.2)";
const SAGE = "#4A7B5F";            // sage — only for the "safe" state
const SAGE_BG = "rgba(74,123,95,0.08)";

// ─── Types — mirrors CrisisBriefingResponse from route.ts ──────

interface CrisisBriefingData {
  meta: {
    companyName: string;
    sector: string | null;
    ticker: string | null;
    generatedAt: string;
    date: string;
    window: string;
    crisisScore: number;
    level: "normal" | "elevated" | "high" | "critical" | "safe";
    totalArticles7d: number;
    negativeArticles7d: number;
  };
  timeline: Array<{
    phase: "first_signal" | "escalation" | "current";
    time: string;
    timestamp: number | null;
    label: string;
    description: string;
    source: string;
    sentiment: number | null;
    severity: "critical" | "high" | "medium" | "low";
    url: string | null;
  }>;
  impact: {
    sentimentShift: number;
    recentAvgSentiment: number | null;
    baselineAvgSentiment: number | null;
    mentionVelocity: number;
    baselineVelocity: number;
    velocityMultiplier: number;
    reach: number;
    uniqueSources: number;
    negativeShare: number;
    peakDay: { date: string; count: number } | null;
  };
  actors: Array<{
    name: string;
    type: "source" | "journalist" | "influencer";
    mentionCount: number;
    avgSentiment: number | null;
    reachScore: number;
    authorityTier: "elite" | "high" | "medium" | "low";
    lastMention: string | null;
    url?: string | null;
  }>;
  actions: Array<{
    id: string;
    priority: "critical" | "high" | "medium";
    title: string;
    description: string;
    done: boolean;
  }>;
  recommendation: string;
  factors: Array<{
    key: string;
    label: string;
    description: string;
    score: number;
    weight: number;
  }>;
}

const SECTIONS = [
  { id: "header", delay: 200 },
  { id: "timeline", delay: 400 },
  { id: "impact", delay: 600 },
  { id: "actors", delay: 800 },
  { id: "actions", delay: 1000 },
  { id: "export", delay: 1200 },
];

// ─── Component ──────────────────────────────────────────────────

export function CrisisBriefingGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CrisisBriefingData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);
  const [doneActions, setDoneActions] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true); setError(null); setData(null);
    setVisibleSections(new Set()); setGenerating(true);
    setDoneActions(new Set()); setCopied(false);
    try {
      const res = await fetch("/api/console/crisis-briefing", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const dossier = (await res.json()) as CrisisBriefingData;
      setData(dossier); setLoading(false);
      for (const section of SECTIONS) {
        setTimeout(() => {
          setVisibleSections((prev) => new Set(prev).add(section.id));
          if (section.id === "export") setGenerating(false);
        }, section.delay);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false); setGenerating(false);
    }
  }, []);

  useEffect(() => { void generate(); }, [generate]);

  // ─── Crisis palette helper (red/amber/sage by level) ─────────
  function palette() {
    if (!data) return { accent: AMBER, accentBg: AMBER_BG, accentBorder: AMBER_BORDER, label: "—" };
    const level = data.meta.level;
    if (level === "critical" || level === "high")
      return { accent: CRITICAL, accentBg: CRITICAL_BG, accentBorder: CRITICAL_BORDER, label: levelLabel(level) };
    if (level === "elevated")
      return { accent: AMBER, accentBg: AMBER_BG, accentBorder: AMBER_BORDER, label: levelLabel(level) };
    return { accent: SAGE, accentBg: SAGE_BG, accentBorder: "rgba(74,123,95,0.2)", label: levelLabel(level) };
  }

  function toggleAction(id: string) {
    setDoneActions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyToClipboard() {
    if (!data) return;
    const text = renderPlainText(data);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing — clipboard may be blocked
    }
  }

  const pal = palette();

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,10,10,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%", maxWidth: 720, maxHeight: "90vh",
          background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header bar ─── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertOctagon size={18} style={{ color: pal.accent }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>Dossier Crise</span>
            {generating && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: pal.accent, fontFamily: "'Space Mono', monospace" }}>
                <Loader2 size={11} className="animate-spin" /> Compilation...
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              disabled={generating || !data}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                background: generating || !data ? BORDER : CHARCOAL,
                color: generating || !data ? TEXT_MUTED : WHITE,
                border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: generating || !data ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none", cursor: "pointer", color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Document body ─── */}
        <div
          style={{
            flex: 1, overflowY: "auto", padding: "32px 40px",
            fontFamily: "'Inter', system-ui, sans-serif", color: CHARCOAL,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2 size={32} style={{ color: pal.accent, animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>
                Compilation du dossier crise en cours...
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: CRITICAL }} />
              <p style={{ marginTop: 12, fontSize: 14, color: CRITICAL }}>{error}</p>
              <button
                onClick={generate}
                style={{
                  marginTop: 16, padding: "8px 16px", background: CHARCOAL, color: WHITE,
                  border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {data && (
            <div id="crisis-document">
              {/* ── a. "Alerte Crise" header ── */}
              <AnimatePresence>
                {visibleSections.has("header") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 32 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <AlertTriangle size={14} style={{ color: pal.accent }} />
                      <span
                        style={{
                          fontSize: 11, fontFamily: "'Space Mono', monospace", color: pal.accent,
                          textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
                        }}
                      >
                        Alerte Crise · {pal.label}
                      </span>
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: CHARCOAL, letterSpacing: "-0.02em" }}>
                      Dossier Crise — {data.meta.companyName}
                    </h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                      {data.meta.date} · Fenêtre {data.meta.window} · {data.meta.negativeArticles7d} articles négatifs / {data.meta.totalArticles7d} total
                    </p>

                    {/* Crisis score card */}
                    <div
                      style={{
                        marginTop: 16, padding: 20, borderRadius: 12,
                        background: pal.accentBg, border: `1px solid ${pal.accentBorder}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace", color: pal.accent,
                          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700,
                        }}
                      >
                        Score de Crise
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span
                          style={{
                            fontSize: 48, fontWeight: 700, color: pal.accent, lineHeight: 1,
                          }}
                        >
                          {data.meta.crisisScore}
                        </span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: pal.accent }}>
                            {pal.label}
                          </div>
                          <span style={{ fontSize: 12, color: TEXT_MUTED }}>/ 100</span>
                        </div>
                      </div>

                      {/* Factor mini-bars */}
                      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                        {data.factors.slice(0, 5).map((f) => (
                          <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 11, color: TEXT_BODY, minWidth: 130, fontFamily: "'Space Mono', monospace" }}>
                              {f.label}
                            </span>
                            <div style={{ flex: 1, height: 4, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ width: `${f.score}%`, height: "100%", background: pal.accent }} />
                            </div>
                            <span style={{ fontSize: 11, color: TEXT_MUTED, minWidth: 28, textAlign: "right" }}>
                              {f.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── b. Timeline ── */}
              <AnimatePresence>
                {visibleSections.has("timeline") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
                      }}
                    >
                      Chronologie · Premier signal → Escalade → État actuel
                    </div>

                    {data.timeline.length === 0 ? (
                      <p style={{ fontSize: 13, color: TEXT_MUTED, padding: "12px 0" }}>
                        Aucun signal négatif sur la fenêtre. Maintenir la veille.
                      </p>
                    ) : (
                      <div style={{ position: "relative", paddingLeft: 24 }}>
                        {/* Vertical line */}
                        <div
                          style={{
                            position: "absolute", left: 8, top: 8, bottom: 8, width: 2,
                            background: BORDER,
                          }}
                        />
                        {data.timeline.map((evt, i) => {
                          const sevColor =
                            evt.severity === "critical" ? CRITICAL :
                            evt.severity === "high" ? "#EF4444" :
                            evt.severity === "medium" ? AMBER : TEXT_MUTED;
                          const phaseLabel =
                            evt.phase === "first_signal" ? "Premier signal" :
                            evt.phase === "escalation" ? "Escalade" : "État actuel";
                          return (
                            <div key={i} style={{ position: "relative", marginBottom: 16, paddingBottom: i < data.timeline.length - 1 ? 16 : 0 }}>
                              {/* Dot */}
                              <div
                                style={{
                                  position: "absolute", left: -23, top: 4, width: 12, height: 12,
                                  borderRadius: "50%", background: WHITE,
                                  border: `3px solid ${sevColor}`,
                                }}
                              />
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <Clock size={12} style={{ color: sevColor }} />
                                <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: sevColor, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                                  {phaseLabel}
                                </span>
                                <span style={{ fontSize: 11, color: TEXT_MUTED }}>· {evt.time}</span>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, marginBottom: 2 }}>
                                {evt.url ? (
                                  <a href={evt.url} target="_blank" rel="noopener noreferrer" style={{ color: CHARCOAL, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    {evt.label}
                                    <ExternalLink size={11} style={{ color: TEXT_MUTED }} />
                                  </a>
                                ) : evt.label}
                              </div>
                              <p style={{ fontSize: 12, color: TEXT_BODY, margin: 0, lineHeight: 1.5 }}>
                                {evt.description}
                              </p>
                              <div style={{ marginTop: 4, fontSize: 11, color: TEXT_MUTED }}>
                                Source: {evt.source}
                                {evt.sentiment !== null && (
                                  <span style={{ marginLeft: 8, color: sevColor }}>
                                    ● Sentiment {evt.sentiment.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── c. Impact assessment ── */}
              <AnimatePresence>
                {visibleSections.has("impact") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
                      }}
                    >
                      Évaluation de l'impact
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {/* Sentiment shift */}
                      <div style={{ padding: 16, background: "#FAFAFA", borderRadius: 8, border: `1px solid ${BORDER}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                          <TrendingDown size={14} style={{ color: data.impact.sentimentShift < 0 ? CRITICAL : SAGE }} />
                          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Shift sentiment
                          </span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: data.impact.sentimentShift < 0 ? CRITICAL : SAGE }}>
                          {data.impact.sentimentShift < 0 ? "" : "+"}
                          {Math.round(data.impact.sentimentShift * 100)}
                        </div>
                        <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                          {data.impact.recentAvgSentiment !== null ? `Récent ${data.impact.recentAvgSentiment.toFixed(2)}` : "—"}
                          {" / "}
                          {data.impact.baselineAvgSentiment !== null ? `Base ${data.impact.baselineAvgSentiment.toFixed(2)}` : "—"}
                        </div>
                      </div>

                      {/* Mention velocity */}
                      <div style={{ padding: 16, background: "#FAFAFA", borderRadius: 8, border: `1px solid ${BORDER}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                          <Gauge size={14} style={{ color: data.impact.velocityMultiplier >= 2 ? CRITICAL : data.impact.velocityMultiplier >= 1.5 ? AMBER : SAGE }} />
                          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Vélocité mentions
                          </span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: data.impact.velocityMultiplier >= 2 ? CRITICAL : data.impact.velocityMultiplier >= 1.5 ? AMBER : CHARCOAL }}>
                          {data.impact.mentionVelocity.toFixed(2)}<span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 400 }}>/h</span>
                        </div>
                        <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                          {data.impact.velocityMultiplier > 0 && (
                            <span style={{ color: data.impact.velocityMultiplier >= 2 ? CRITICAL : AMBER, fontWeight: 600 }}>
                              {data.impact.velocityMultiplier}× baseline
                            </span>
                          )}
                          {data.impact.peakDay && (
                            <span style={{ marginLeft: 8 }}>
                              Pic: {data.impact.peakDay.date} ({data.impact.peakDay.count})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reach */}
                      <div style={{ padding: 16, background: "#FAFAFA", borderRadius: 8, border: `1px solid ${BORDER}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                          <Zap size={14} style={{ color: AMBER }} />
                          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Portée estimée
                          </span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: CHARCOAL }}>
                          {formatReach(data.impact.reach)}
                        </div>
                        <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                          {data.impact.uniqueSources} source(s) unique(s)
                        </div>
                      </div>

                      {/* Negative share */}
                      <div style={{ padding: 16, background: "#FAFAFA", borderRadius: 8, border: `1px solid ${BORDER}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                          <Target size={14} style={{ color: data.impact.negativeShare > 0.4 ? CRITICAL : AMBER }} />
                          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Part négative
                          </span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: data.impact.negativeShare > 0.4 ? CRITICAL : AMBER }}>
                          {Math.round(data.impact.negativeShare * 100)}%
                        </div>
                        <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                          sur {data.meta.totalArticles7d} articles 7j
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── d. Key actors ── */}
              <AnimatePresence>
                {visibleSections.has("actors") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
                      }}
                    >
                      Acteurs clés · Sources, journalistes, influenceurs
                    </div>

                    {data.actors.length === 0 ? (
                      <p style={{ fontSize: 13, color: TEXT_MUTED, padding: "12px 0" }}>
                        Aucun acteur identifié sur la fenêtre.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {data.actors.map((actor, i) => {
                          const Icon = actor.type === "influencer" ? Users : actor.type === "journalist" ? Radio : Link2;
                          return (
                            <div
                              key={`${actor.type}-${actor.name}-${i}`}
                              style={{
                                display: "flex", alignItems: "center", gap: 12, padding: 12,
                                background: "#FAFAFA", borderRadius: 8, border: `1px solid ${BORDER}`,
                              }}
                            >
                              <div
                                style={{
                                  width: 32, height: 32, borderRadius: 6,
                                  background: tierColor(actor.authorityTier),
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: WHITE, flexShrink: 0,
                                }}
                              >
                                <Icon size={16} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {actor.name}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                                      textTransform: "uppercase", letterSpacing: "0.08em",
                                      padding: "2px 6px", background: WHITE, borderRadius: 3, border: `1px solid ${BORDER}`,
                                    }}
                                  >
                                    {actor.type === "influencer" ? "Influenceur" : actor.type === "journalist" ? "Journaliste" : "Source"}
                                  </span>
                                </div>
                                <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>
                                  {actor.mentionCount > 0 && <span>{actor.mentionCount} mentions · </span>}
                                  <span>Tier {actor.authorityTier}</span>
                                  {actor.avgSentiment !== null && (
                                    <span style={{ marginLeft: 6, color: actor.avgSentiment < -0.3 ? CRITICAL : TEXT_MUTED }}>
                                      ● Sent. {actor.avgSentiment.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: tierColor(actor.authorityTier) }}>
                                  {actor.reachScore}
                                </div>
                                <div style={{ fontSize: 9, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace" }}>REACH</div>
                              </div>
                              {actor.url && (
                                <a
                                  href={actor.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: TEXT_MUTED, display: "flex", alignItems: "center", flexShrink: 0 }}
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── e. Recommended actions ── */}
              <AnimatePresence>
                {visibleSections.has("actions") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
                      }}
                    >
                      Actions recommandées · Plan de réponse
                    </div>

                    <div
                      style={{
                        padding: 16, background: pal.accentBg, borderRadius: 8,
                        border: `1px solid ${pal.accentBorder}`, marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace", color: pal.accent,
                          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700,
                        }}
                      >
                        Recommandation HarchIQ
                      </div>
                      <p style={{ fontSize: 13, color: CHARCOAL, lineHeight: 1.6, margin: 0 }}>
                        {data.recommendation}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {data.actions.map((action) => {
                        const isDone = doneActions.has(action.id);
                        const prColor = action.priority === "critical" ? CRITICAL : action.priority === "high" ? AMBER : TEXT_MUTED;
                        return (
                          <button
                            key={action.id}
                            onClick={() => toggleAction(action.id)}
                            style={{
                              display: "flex", alignItems: "start", gap: 10, padding: 12,
                              background: isDone ? "#FAFAFA" : WHITE,
                              border: `1px solid ${BORDER}`, borderRadius: 8,
                              cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                              transition: "background 0.15s",
                            }}
                          >
                            {isDone ? (
                              <CheckSquare size={18} style={{ color: SAGE, flexShrink: 0, marginTop: 1 }} />
                            ) : (
                              <Square size={18} style={{ color: prColor, flexShrink: 0, marginTop: 1 }} />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                <span
                                  style={{
                                    fontSize: 13, fontWeight: 600, color: CHARCOAL,
                                    textDecoration: isDone ? "line-through" : "none",
                                    opacity: isDone ? 0.6 : 1,
                                  }}
                                >
                                  {action.title}
                                </span>
                                <span
                                  style={{
                                    fontSize: 9, fontFamily: "'Space Mono', monospace",
                                    color: prColor, textTransform: "uppercase", letterSpacing: "0.08em",
                                    padding: "2px 6px", background: WHITE, borderRadius: 3, border: `1px solid ${prColor}`,
                                    fontWeight: 700,
                                  }}
                                >
                                  {action.priority === "critical" ? "P1" : action.priority === "high" ? "P2" : "P3"}
                                </span>
                              </div>
                              <p style={{ fontSize: 12, color: TEXT_BODY, margin: 0, lineHeight: 1.5, opacity: isDone ? 0.6 : 1 }}>
                                {action.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── f. Export buttons ── */}
              <AnimatePresence>
                {visibleSections.has("export") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex", gap: 8, paddingTop: 16,
                      borderTop: `1px solid ${BORDER}`,
                    }}
                  >
                    <button
                      onClick={() => window.print()}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                        background: CHARCOAL, color: WHITE, border: "none", borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <Download size={14} /> Exporter PDF
                    </button>
                    <button
                      onClick={copyToClipboard}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                        background: "transparent", color: copied ? SAGE : TEXT_BODY,
                        border: `1px solid ${BORDER}`, borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <Copy size={14} /> {copied ? "Copié" : "Copier"}
                    </button>
                    <button
                      onClick={generate}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                        background: "transparent", color: TEXT_BODY,
                        border: `1px solid ${BORDER}`, borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                        marginLeft: "auto",
                      }}
                    >
                      <RefreshCw size={14} /> Régénérer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {generating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: pal.accent, animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: 11, color: pal.accent, fontFamily: "'Space Mono', monospace" }}>
                    Rédaction en cours...
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        @media print {
          body * { visibility: hidden; }
          #crisis-document, #crisis-document * { visibility: visible; }
          #crisis-document {
            position: absolute; left: 0; top: 0; width: 100%; padding: 40px;
          }
          /* Hide interactive buttons in PDF export */
          #crisis-document button { display: none !important; }
          /* Force white background for print */
          #crisis-document { background: ${WHITE} !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function levelLabel(level: string): string {
  switch (level) {
    case "critical": return "Critique";
    case "high": return "Élevé";
    case "elevated": return "Modéré";
    case "normal": return "Normal";
    case "safe": return "Sûr";
    default: return "—";
  }
}

function tierColor(tier: string): string {
  switch (tier) {
    case "elite": return CRITICAL;
    case "high": return "#EF4444";
    case "medium": return AMBER;
    default: return TEXT_MUTED;
  }
}

function formatReach(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function renderPlainText(d: CrisisBriefingData): string {
  const lines: string[] = [];
  lines.push(`DOSSIER CRISE — ${d.meta.companyName}`);
  lines.push(`${d.meta.date} · Fenêtre ${d.meta.window}`);
  lines.push(`Score de crise: ${d.meta.crisisScore}/100 (${levelLabel(d.meta.level)})`);
  lines.push(`Articles 7j: ${d.meta.totalArticles7d} total · ${d.meta.negativeArticles7d} négatifs`);
  lines.push("");
  lines.push("─ CHRONOLOGIE ─");
  for (const evt of d.timeline) {
    const phase = evt.phase === "first_signal" ? "Premier signal" : evt.phase === "escalation" ? "Escalade" : "État actuel";
    lines.push(`[${phase}] ${evt.time} — ${evt.label}`);
    lines.push(`  ${evt.description}`);
    lines.push(`  Source: ${evt.source}${evt.sentiment !== null ? ` · Sentiment: ${evt.sentiment.toFixed(2)}` : ""}`);
    if (evt.url) lines.push(`  URL: ${evt.url}`);
  }
  lines.push("");
  lines.push("─ IMPACT ─");
  lines.push(`Shift sentiment: ${Math.round(d.impact.sentimentShift * 100)} pts (récent ${d.impact.recentAvgSentiment ?? "—"} / base ${d.impact.baselineAvgSentiment ?? "—"})`);
  lines.push(`Vélocité: ${d.impact.mentionVelocity.toFixed(2)}/h (${d.impact.velocityMultiplier}× baseline)`);
  lines.push(`Portée estimée: ${formatReach(d.impact.reach)} · ${d.impact.uniqueSources} sources`);
  lines.push(`Part négative: ${Math.round(d.impact.negativeShare * 100)}%`);
  if (d.impact.peakDay) lines.push(`Pic: ${d.impact.peakDay.date} (${d.impact.peakDay.count} articles)`);
  lines.push("");
  lines.push("─ ACTEURS CLÉS ─");
  for (const a of d.actors) {
    lines.push(`• ${a.name} [${a.type}] — reach ${a.reachScore} · tier ${a.authorityTier}${a.mentionCount > 0 ? ` · ${a.mentionCount} mentions` : ""}`);
  }
  lines.push("");
  lines.push("─ ACTIONS RECOMMANDÉES ─");
  for (const a of d.actions) {
    lines.push(`[${a.priority.toUpperCase()}] ${a.title}`);
    lines.push(`  ${a.description}`);
  }
  lines.push("");
  lines.push("─ RECOMMANDATION HARCHIQ ─");
  lines.push(d.recommendation);
  lines.push("");
  lines.push(`Généré par HarchIQ — ${d.meta.generatedAt}`);
  return lines.join("\n");
}

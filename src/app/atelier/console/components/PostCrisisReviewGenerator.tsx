"use client";

// ═══════════════════════════════════════════════════════════════
//  PostCrisisReviewGenerator
//
//  Skill 30 — Post-Crisis Review.
//
//  A live document — not chat. When the user opens the popup, the
//  API compiles a structured post-mortem (timeline, impact, lessons,
//  prevention plan) over the last 30 days, and the sections appear
//  one-by-one (200ms delay each).
//
//  Same popup pattern as BriefingGenerator (fixed overlay, scale
//  entrance, sections fade-in with framer-motion). Palette is
//  white / sage / charcoal (NON-NEGOTIABLE per spec).
//
//  6 sections, in order:
//    a. Header (company, crisis window)
//    b. Timeline chronologique verticale (premier signal → pic → résolution)
//    c. Impact assessment — 4 stat cards (chute sentiment, pic mentions,
//       portée touchée, durée jours)
//    d. Lessons learned — liste éditable (inline textarea + catégorie +
//       suppression + ajout)
//    e. Prevention plan — action items avec badges priorité P1/P2/P3,
//       owner + échéance
//    f. Export buttons (PDF, copy, regenerate)
//
//  Print CSS at the bottom isolates #post-crisis-document for
//  window.print() so the PDF export is clean (no overlay chrome).
//  Interactive buttons are hidden in print.
//
//  Skill ID: SKILL-30-POST-CRISIS
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle,
  Clock, TrendingDown, Gauge, Radio, Plus, Trash2,
  Copy, FileText, RefreshCw, ShieldCheck, ClipboardList,
  Lightbulb, Calendar, AlertOctagon, CheckCircle2,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE per spec) ───────────────────
const WHITE = "#FFFFFF";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.20)";
const AMBER = "#F59E0B";
const AMBER_BG = "rgba(245,158,11,0.06)";
const AMBER_BORDER = "rgba(245,158,11,0.20)";
const CRITICAL = "#DC2626";
const CRITICAL_BG = "rgba(220,38,38,0.06)";
const CRITICAL_BORDER = "rgba(220,38,38,0.20)";
const FAINT = "#FAFAFA";

// ─── Types — mirrors PostCrisisResponse from route.ts ──────────

type TimelineSeverity = "critical" | "high" | "medium" | "low" | "info";
type LessonCategory = "detection" | "communication" | "veille" | "process" | "gouvernance";
type PreventionPriority = "critical" | "high" | "medium";

interface PostCrisisData {
  meta: {
    companyName: string;
    sector: string | null;
    ticker: string | null;
    generatedAt: string;
    date: string;
    window: string;
    crisisDetected: boolean;
    crisisStart: string | null;
    crisisEnd: string | null;
  };
  timeline: Array<{
    date: string;
    timestamp: number | null;
    event: string;
    severity: TimelineSeverity;
  }>;
  impact: {
    sentimentDrop: number;
    baselineSentiment: number | null;
    crisisSentiment: number | null;
    mentionPeak: number;
    mentionPeakDate: string | null;
    reachAffected: number;
    uniqueSources: number;
    durationDays: number;
    totalNegative30d: number;
    totalArticles30d: number;
    velocityMultiplier: number;
  };
  lessons: Array<{
    id: string;
    text: string;
    category: LessonCategory;
  }>;
  preventionPlan: Array<{
    action: string;
    priority: PreventionPriority;
    owner: string;
    deadline: string;
    deadlineLabel: string;
  }>;
  recommendation: string;
  sentimentTrend: Array<{ date: string; sentiment: number | null; negativeCount: number }>;
}

interface EditableLesson {
  id: string;
  text: string;
  category: LessonCategory;
}

const SECTIONS = [
  { id: "header", delay: 200 },
  { id: "timeline", delay: 400 },
  { id: "impact", delay: 600 },
  { id: "lessons", delay: 800 },
  { id: "prevention", delay: 1000 },
  { id: "actions", delay: 1200 },
];

const CATEGORY_LABELS: Record<LessonCategory, string> = {
  detection: "Détection",
  communication: "Communication",
  veille: "Veille",
  process: "Processus",
  gouvernance: "Gouvernance",
};

const CATEGORY_OPTIONS: LessonCategory[] = [
  "detection", "communication", "veille", "process", "gouvernance",
];

// ─── Component ──────────────────────────────────────────────────

export function PostCrisisReviewGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PostCrisisData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);
  const [lessons, setLessons] = useState<EditableLesson[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleSections(new Set());
    setGenerating(true);
    setLessons([]);
    setCopied(false);
    try {
      const res = await fetch("/api/console/post-crisis", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const review = (await res.json()) as PostCrisisData;
      setData(review);
      // Snapshot lessons into editable local state
      setLessons(review.lessons.map((l) => ({ ...l })));
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

  // ─── Lesson editing handlers ──────────────────────────────────
  function updateLessonText(id: string, text: string) {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, text } : l)));
  }
  function updateLessonCategory(id: string, category: LessonCategory) {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, category } : l)));
  }
  function addLesson() {
    const newId = `lesson-new-${Date.now()}`;
    setLessons((prev) => [
      ...prev,
      { id: newId, text: "Nouvelle leçon apprise — décrire le constat et l'action corrective.", category: "process" },
    ]);
  }
  function removeLesson(id: string) {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  }

  // ─── Copy-to-clipboard handler ───────────────────────────────
  async function copyToClipboard() {
    if (!data) return;
    const text = renderPlainText(data, lessons);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked — silent fail
    }
  }

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
          width: "100%", maxWidth: 760, maxHeight: "90vh",
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
            padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, background: FAINT,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
              Revue Post-Crise
            </span>
            {generating && (
              <span style={{
                display: "flex", alignItems: "center", gap: 4, fontSize: 11,
                color: SAGE, fontFamily: "'Space Mono', monospace",
              }}>
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
              <Loader2 size={32} style={{ color: SAGE, animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>
                Compilation de la revue post-crise en cours...
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
            <div id="post-crisis-document">
              {/* ── a. Header ── */}
              <AnimatePresence>
                {visibleSections.has("header") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 32 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Calendar size={14} style={{ color: SAGE }} />
                      <span style={{
                        fontSize: 11, fontFamily: "'Space Mono', monospace", color: SAGE,
                        textTransform: "uppercase", letterSpacing: "0.08em",
                      }}>
                        {data.meta.date}
                      </span>
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: CHARCOAL, letterSpacing: "-0.02em" }}>
                      Revue Post-Crise — {data.meta.companyName}
                    </h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                      Fenêtre {data.meta.window} · {data.impact.totalNegative30d} articles négatifs / {data.impact.totalArticles30d} total
                    </p>

                    {/* Crisis window card */}
                    <div
                      style={{
                        marginTop: 16, padding: 16, borderRadius: 8,
                        background: data.meta.crisisDetected ? SAGE_BG : FAINT,
                        border: `1px solid ${data.meta.crisisDetected ? SAGE_BORDER : BORDER}`,
                      }}
                    >
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
                      }}>
                        {data.meta.crisisDetected ? (
                          <AlertOctagon size={14} style={{ color: SAGE }} />
                        ) : (
                          <CheckCircle2 size={14} style={{ color: SAGE }} />
                        )}
                        <span style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace", color: SAGE,
                          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
                        }}>
                          {data.meta.crisisDetected ? "Crise détectée" : "Aucune crise détectée"}
                        </span>
                      </div>
                      {data.meta.crisisDetected ? (
                        <p style={{ fontSize: 13, color: CHARCOAL, margin: 0, lineHeight: 1.5 }}>
                          Fenêtre de crise identifiée : <strong>{data.meta.crisisStart}</strong>
                          {" → "}
                          <strong>{data.meta.crisisEnd}</strong> · durée {data.impact.durationDays} jour(s)
                        </p>
                      ) : (
                        <p style={{ fontSize: 13, color: CHARCOAL, margin: 0, lineHeight: 1.5 }}>
                          La fenêtre de 30 jours est restée nominale. Ce document constitue votre preuve de diligence réputationnelle.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── b. Timeline (vertical) ── */}
              <AnimatePresence>
                {visibleSections.has("timeline") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    <div style={{
                      fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                      textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
                    }}>
                      Chronologie · Premier signal → Escalade → Pic → Résolution
                    </div>

                    {data.timeline.length === 0 ? (
                      <p style={{ fontSize: 13, color: TEXT_MUTED, padding: "12px 0" }}>
                        Aucun événement négatif sur la fenêtre de 30 jours.
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
                          const sevColor = severityColor(evt.severity);
                          return (
                            <div
                              key={i}
                              style={{
                                position: "relative",
                                marginBottom: i < data.timeline.length - 1 ? 16 : 0,
                                paddingBottom: i < data.timeline.length - 1 ? 16 : 0,
                              }}
                            >
                              {/* Dot */}
                              <div
                                style={{
                                  position: "absolute", left: -23, top: 4, width: 12, height: 12,
                                  borderRadius: "50%", background: WHITE,
                                  border: `3px solid ${sevColor}`,
                                }}
                              />
                              <div style={{
                                display: "flex", alignItems: "center", gap: 8, marginBottom: 4,
                              }}>
                                <Clock size={12} style={{ color: sevColor }} />
                                <span style={{
                                  fontSize: 11, fontFamily: "'Space Mono', monospace", color: sevColor,
                                  textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
                                }}>
                                  {severityLabel(evt.severity)}
                                </span>
                                <span style={{ fontSize: 11, color: TEXT_MUTED }}>· {evt.date}</span>
                              </div>
                              <p style={{
                                fontSize: 13, color: CHARCOAL, margin: 0, lineHeight: 1.5,
                              }}>
                                {evt.event}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── c. Impact assessment — 4 stat cards ── */}
              <AnimatePresence>
                {visibleSections.has("impact") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    <div style={{
                      fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                      textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
                    }}>
                      Évaluation de l&apos;impact
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {/* Sentiment drop */}
                      <StatCard
                        icon={<TrendingDown size={14} style={{ color: data.impact.sentimentDrop > 0.1 ? CRITICAL : SAGE }} />}
                        label="Chute de sentiment"
                        value={data.impact.sentimentDrop > 0 ? `-${Math.round(data.impact.sentimentDrop * 100)}` : `${Math.round(data.impact.sentimentDrop * 100)}`}
                        valueColor={data.impact.sentimentDrop > 0.1 ? CRITICAL : SAGE}
                        unit="pts"
                        sub={
                          data.impact.baselineSentiment !== null && data.impact.crisisSentiment !== null
                            ? `Base ${data.impact.baselineSentiment.toFixed(2)} → Crise ${data.impact.crisisSentiment.toFixed(2)}`
                            : "Données insuffisantes"
                        }
                      />

                      {/* Mention peak */}
                      <StatCard
                        icon={<Gauge size={14} style={{ color: data.impact.mentionPeak >= 5 ? CRITICAL : data.impact.mentionPeak >= 2 ? AMBER : SAGE }} />}
                        label="Pic de mentions"
                        value={String(data.impact.mentionPeak)}
                        valueColor={data.impact.mentionPeak >= 5 ? CRITICAL : data.impact.mentionPeak >= 2 ? AMBER : CHARCOAL}
                        unit="art./jour"
                        sub={
                          data.impact.mentionPeakDate
                            ? `Le ${formatDateShort(data.impact.mentionPeakDate)} · ${data.impact.uniqueSources} source(s)`
                            : `${data.impact.uniqueSources} source(s) unique(s)`
                        }
                      />

                      {/* Reach affected */}
                      <StatCard
                        icon={<Radio size={14} style={{ color: AMBER }} />}
                        label="Portée touchée"
                        value={formatReach(data.impact.reachAffected)}
                        valueColor={CHARCOAL}
                        unit=""
                        sub={`${data.impact.totalNegative30d} articles négatifs sur 30j`}
                      />

                      {/* Duration */}
                      <StatCard
                        icon={<Clock size={14} style={{ color: data.impact.durationDays > 7 ? CRITICAL : data.impact.durationDays > 3 ? AMBER : SAGE }} />}
                        label="Durée de la crise"
                        value={String(data.impact.durationDays)}
                        valueColor={data.impact.durationDays > 7 ? CRITICAL : data.impact.durationDays > 3 ? AMBER : SAGE}
                        unit="jours"
                        sub={
                          data.impact.velocityMultiplier > 0
                            ? `Vélocité ${data.impact.velocityMultiplier}× baseline`
                            : "Vélocité nominale"
                        }
                      />
                    </div>

                    {/* Sentiment trend sparkline */}
                    {data.sentimentTrend.length > 0 && (
                      <div style={{ marginTop: 12, padding: 12, background: FAINT, borderRadius: 8, border: `1px solid ${BORDER}` }}>
                        <div style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
                        }}>
                          Tendance sentiment · 30 jours
                        </div>
                        <Sparkline trend={data.sentimentTrend} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── d. Lessons learned (editable) ── */}
              <AnimatePresence>
                {visibleSections.has("lessons") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginBottom: 12,
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <Lightbulb size={14} style={{ color: SAGE }} />
                        <span style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                          textTransform: "uppercase", letterSpacing: "0.1em",
                        }}>
                          Leçons apprises · Éditable
                        </span>
                      </div>
                      <button
                        onClick={addLesson}
                        className="no-print"
                        style={{
                          display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                          background: SAGE_BG, color: SAGE, border: `1px solid ${SAGE_BORDER}`,
                          borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <Plus size={12} /> Ajouter
                      </button>
                    </div>

                    {lessons.length === 0 ? (
                      <p style={{ fontSize: 13, color: TEXT_MUTED, padding: "12px 0" }}>
                        Aucune leçon documentée. Cliquez sur « Ajouter » pour créer une entrée.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            style={{
                              padding: 12, background: FAINT, borderRadius: 8,
                              border: `1px solid ${BORDER}`,
                            }}
                          >
                            <div style={{
                              display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                            }}>
                              <select
                                value={lesson.category}
                                onChange={(e) => updateLessonCategory(lesson.id, e.target.value as LessonCategory)}
                                className="no-print"
                                style={{
                                  fontSize: 10, fontFamily: "'Space Mono', monospace",
                                  textTransform: "uppercase", letterSpacing: "0.08em",
                                  padding: "3px 8px", background: WHITE,
                                  color: SAGE, border: `1px solid ${SAGE_BORDER}`,
                                  borderRadius: 4, fontWeight: 700, cursor: "pointer",
                                }}
                              >
                                {CATEGORY_OPTIONS.map((c) => (
                                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                                ))}
                              </select>
                              {/* Print-only category badge (hidden on screen) */}
                              <span
                                className="print-only"
                                style={{
                                  fontSize: 10, fontFamily: "'Space Mono', monospace",
                                  textTransform: "uppercase", letterSpacing: "0.08em",
                                  padding: "3px 8px", background: WHITE,
                                  color: SAGE, border: `1px solid ${SAGE_BORDER}`,
                                  borderRadius: 4, fontWeight: 700,
                                }}
                              >
                                {CATEGORY_LABELS[lesson.category]}
                              </span>
                              <button
                                onClick={() => removeLesson(lesson.id)}
                                className="no-print"
                                style={{
                                  marginLeft: "auto", width: 24, height: 24,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  background: "transparent", border: "none", cursor: "pointer",
                                  color: TEXT_MUTED,
                                }}
                                title="Supprimer cette leçon"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <textarea
                              value={lesson.text}
                              onChange={(e) => updateLessonText(lesson.id, e.target.value)}
                              className="lesson-textarea no-print"
                              style={{
                                width: "100%", minHeight: 60, resize: "vertical",
                                fontSize: 13, color: CHARCOAL, lineHeight: 1.5,
                                background: WHITE, border: `1px solid ${BORDER}`,
                                borderRadius: 4, padding: 8, fontFamily: "inherit",
                              }}
                            />
                            {/* Print-only static text */}
                            <p className="print-only" style={{
                              fontSize: 13, color: CHARCOAL, lineHeight: 1.5, margin: 0,
                            }}>
                              {lesson.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── e. Prevention plan ── */}
              <AnimatePresence>
                {visibleSections.has("prevention") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6, marginBottom: 12,
                    }}>
                      <ClipboardList size={14} style={{ color: SAGE }} />
                      <span style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                        textTransform: "uppercase", letterSpacing: "0.1em",
                      }}>
                        Plan de prévention · Actions correctives
                      </span>
                    </div>

                    {/* Recommendation banner */}
                    <div
                      style={{
                        padding: 16, background: SAGE_BG, borderRadius: 8,
                        border: `1px solid ${SAGE_BORDER}`, marginBottom: 12,
                      }}
                    >
                      <div style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace", color: SAGE,
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700,
                      }}>
                        Synthèse HarchIQ
                      </div>
                      <p style={{ fontSize: 13, color: CHARCOAL, lineHeight: 1.6, margin: 0 }}>
                        {data.recommendation}
                      </p>
                    </div>

                    {/* Prevention action items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {data.preventionPlan.map((item, i) => {
                        const prColor = item.priority === "critical" ? CRITICAL : item.priority === "high" ? AMBER : SAGE;
                        const prBg = item.priority === "critical" ? CRITICAL_BG : item.priority === "high" ? AMBER_BG : SAGE_BG;
                        const prBorder = item.priority === "critical" ? CRITICAL_BORDER : item.priority === "high" ? AMBER_BORDER : SAGE_BORDER;
                        const prLabel = item.priority === "critical" ? "P1" : item.priority === "high" ? "P2" : "P3";
                        return (
                          <div
                            key={i}
                            style={{
                              display: "flex", alignItems: "start", gap: 12, padding: 12,
                              background: prBg, borderRadius: 8, border: `1px solid ${prBorder}`,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10, fontFamily: "'Space Mono', monospace",
                                color: prColor, textTransform: "uppercase", letterSpacing: "0.08em",
                                padding: "3px 8px", background: WHITE, borderRadius: 4,
                                border: `1px solid ${prColor}`, fontWeight: 700, flexShrink: 0,
                              }}
                            >
                              {prLabel}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, color: CHARCOAL, margin: 0, lineHeight: 1.5 }}>
                                {item.action}
                              </p>
                              <div style={{
                                display: "flex", alignItems: "center", gap: 12, marginTop: 6,
                                fontSize: 11, color: TEXT_MUTED, flexWrap: "wrap",
                              }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <FileText size={11} /> {item.owner}
                                </span>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <Calendar size={11} /> {item.deadlineLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── f. Export buttons ── */}
              <AnimatePresence>
                {visibleSections.has("actions") && (
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", background: SAGE,
                    animation: "pulse 1s infinite",
                  }} />
                  <span style={{
                    fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace",
                  }}>
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

        .print-only { display: none; }

        @media print {
          body * { visibility: hidden; }
          #post-crisis-document, #post-crisis-document * { visibility: visible; }
          #post-crisis-document {
            position: absolute; left: 0; top: 0; width: 100%; padding: 40px;
          }
          /* Hide interactive elements in PDF export */
          #post-crisis-document .no-print { display: none !important; }
          /* Show print-only static text for lessons */
          #post-crisis-document .print-only { display: inline-block !important; }
          #post-crisis-document p.print-only { display: block !important; }
          /* Force white background for print */
          #post-crisis-document { background: ${WHITE} !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function StatCard({
  icon, label, value, valueColor, unit, sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
  unit: string;
  sub: string;
}) {
  return (
    <div style={{
      padding: 16, background: FAINT, borderRadius: 8, border: `1px solid ${BORDER}`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
      }}>
        {icon}
        <span style={{
          fontSize: 11, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: valueColor }}>
        {value}
        {unit && <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 400, marginLeft: 4 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
        {sub}
      </div>
    </div>
  );
}

function Sparkline({ trend }: { trend: Array<{ date: string; sentiment: number | null; negativeCount: number }> }) {
  // Render a tiny inline SVG sparkline of the negative-count trend.
  // Width 100%, fixed height 40px. Y-scale = max negativeCount.
  const width = 100;
  const height = 40;
  const maxNeg = Math.max(1, ...trend.map((d) => d.negativeCount));

  // Build polyline points (x = index, y = negCount inverted)
  const points = trend
    .map((d, i) => {
      const x = (i / Math.max(1, trend.length - 1)) * width;
      const y = height - (d.negativeCount / maxNeg) * (height - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  // Peak marker
  let peakIdx = 0;
  let peakCount = 0;
  trend.forEach((d, i) => {
    if (d.negativeCount > peakCount) {
      peakCount = d.negativeCount;
      peakIdx = i;
    }
  });
  const peakX = (peakIdx / Math.max(1, trend.length - 1)) * width;
  const peakY = height - (peakCount / maxNeg) * (height - 4) - 2;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ flex: 1, height: 40, width: "100%" }}
      >
        {/* Baseline */}
        <line
          x1="0" y1={height - 2} x2={width} y2={height - 2}
          stroke={BORDER} strokeWidth="0.5"
        />
        {/* Trend line */}
        <polyline
          points={points}
          fill="none"
          stroke={peakCount >= 5 ? CRITICAL : peakCount >= 2 ? AMBER : SAGE}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Peak dot */}
        {peakCount > 0 && (
          <circle
            cx={peakX} cy={peakY} r="1.5"
            fill={peakCount >= 5 ? CRITICAL : peakCount >= 2 ? AMBER : SAGE}
          />
        )}
      </svg>
      <div style={{ fontSize: 10, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace", flexShrink: 0, textAlign: "right" }}>
        <div>pic: {peakCount}</div>
        <div>30j</div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function severityColor(sev: TimelineSeverity): string {
  switch (sev) {
    case "critical": return CRITICAL;
    case "high": return "#EF4444";
    case "medium": return AMBER;
    case "low": return SAGE;
    case "info": return TEXT_MUTED;
    default: return TEXT_MUTED;
  }
}

function severityLabel(sev: TimelineSeverity): string {
  switch (sev) {
    case "critical": return "Critique";
    case "high": return "Élevé";
    case "medium": return "Modéré";
    case "low": return "Faible";
    case "info": return "Info";
    default: return "—";
  }
}

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}

function formatReach(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function renderPlainText(d: PostCrisisData, lessons: EditableLesson[]): string {
  const lines: string[] = [];
  lines.push(`REVUE POST-CRISE — ${d.meta.companyName}`);
  lines.push(`${d.meta.date} · Fenêtre ${d.meta.window}`);
  lines.push(
    d.meta.crisisDetected
      ? `Crise détectée : ${d.meta.crisisStart} → ${d.meta.crisisEnd} · durée ${d.impact.durationDays} jour(s)`
      : "Aucune crise détectée sur la fenêtre.",
  );
  lines.push("");

  lines.push("─ CHRONOLOGIE ─");
  for (const evt of d.timeline) {
    lines.push(`[${severityLabel(evt.severity)}] ${evt.date} — ${evt.event}`);
  }
  lines.push("");

  lines.push("─ IMPACT ─");
  lines.push(`Chute de sentiment: ${Math.round(d.impact.sentimentDrop * 100)} pts (base ${d.impact.baselineSentiment ?? "—"} / crise ${d.impact.crisisSentiment ?? "—"})`);
  lines.push(`Pic de mentions: ${d.impact.mentionPeak} articles/jour${d.impact.mentionPeakDate ? ` le ${formatDateShort(d.impact.mentionPeakDate)}` : ""}`);
  lines.push(`Portée touchée: ${formatReach(d.impact.reachAffected)} · ${d.impact.uniqueSources} source(s) unique(s)`);
  lines.push(`Durée: ${d.impact.durationDays} jour(s) · Vélocité ${d.impact.velocityMultiplier}× baseline`);
  lines.push(`Total: ${d.impact.totalNegative30d} articles négatifs / ${d.impact.totalArticles30d} sur 30j`);
  lines.push("");

  lines.push("─ LEÇONS APPRISES ─");
  for (const l of lessons) {
    lines.push(`[${CATEGORY_LABELS[l.category]}] ${l.text}`);
  }
  lines.push("");

  lines.push("─ PLAN DE PRÉVENTION ─");
  for (const p of d.preventionPlan) {
    const prLabel = p.priority === "critical" ? "P1" : p.priority === "high" ? "P2" : "P3";
    lines.push(`[${prLabel}] ${p.action}`);
    lines.push(`  Owner: ${p.owner} · Échéance: ${p.deadlineLabel}`);
  }
  lines.push("");

  lines.push("─ SYNTHÈSE HARCHIQ ─");
  lines.push(d.recommendation);
  lines.push("");
  lines.push(`Généré par HarchIQ — ${d.meta.generatedAt}`);
  return lines.join("\n");
}

"use client";

// ═══════════════════════════════════════════════════════════════
//  AiVisibilityReportGenerator — Skill 13: AI Visibility Report
//
//  Popup deliverable showing how 9 LLMs (ChatGPT, Claude, Gemini,
//  Perplexity, Copilot, Mistral, Grok, Llama, GLM) perceive and
//  cite the brand. NOT chat. A structured one-page report.
//
//  Pipeline:
//    1. On mount → POST /api/console/ai-visibility-report
//    2. API returns { engines, overallScore, trend, narrativeSummary }
//    3. Sections reveal one-by-one (200ms cadence) with AnimatePresence
//    4. Footer: Export PDF (window.print) + Régénérer
//
//  Sections (in reveal order):
//    a. Header — title + date
//    b. Overall score gauge (0-100, sage>70, amber 50-70, red<50)
//    c. Trend indicator (vs last month)
//    d. 9 engine cards in a 3×3 grid
//    e. Comparison bar chart (one horizontal bar per engine)
//    f. Narrative summary paragraph
//    g. Actions (Export PDF / Régénérer)
//
//  Design system (non-negotiable):
//    • White #FFFFFF bg, sage #4A7B5F accents, charcoal #0A0A0A text
//    • Space Mono headers, Inter body, Lucide icons, NO emojis, French
//    • Same popup pattern as BriefingGenerator
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  Sparkles, TrendingUp, TrendingDown, Minus, Calendar,
  CheckCircle2, XCircle,
} from "lucide-react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.20)";
const CHARCOAL = "#0A0A0A";
const WHITE = "#FFFFFF";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";
const AMBER = "#F59E0B";
const SPACE_MONO = "'Space Mono', ui-monospace, monospace";
const INTER = "'Inter', system-ui, -apple-system, sans-serif";

// ─── TYPES (mirror API response) ─────────────────────────────────
interface Engine {
  name: string;
  cited: boolean;
  rank: number | null;
  confidence: number; // 0-1
  sentiment: string | null;
  mentions: number;
  lastChecked: string | null;
  visibilityScore: number;
}

interface ReportMeta {
  companyName: string;
  sector: string | null;
  generatedAt: string;
  date: string;
}

interface ReportData {
  meta: ReportMeta;
  engines: Engine[];
  overallScore: number;
  trend: number;
  narrativeSummary: string;
  totalCited: number;
  totalEngines: number;
}

const SECTIONS = [
  { id: "header", delay: 200 },
  { id: "gauge", delay: 400 },
  { id: "trend", delay: 600 },
  { id: "engines", delay: 800 },
  { id: "chart", delay: 1100 },
  { id: "narrative", delay: 1400 },
  { id: "actions", delay: 1600 },
] as const;

// ─── COMPONENT ───────────────────────────────────────────────────
export function AiVisibilityReportGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleSections(new Set());
    setGenerating(true);
    try {
      const res = await fetch("/api/console/ai-visibility-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const report = (await res.json()) as ReportData;
      setData(report);
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
        {/* ─── Header bar ─────────────────────────────────────────── */}
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
            <Sparkles size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, fontFamily: INTER }}>
              Visibilité IA
            </span>
            {generating && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: SAGE,
                  fontFamily: SPACE_MONO,
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
                color: generating || !data ? TEXT_MUTED : WHITE,
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: generating || !data ? "not-allowed" : "pointer",
                fontFamily: INTER,
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

        {/* ─── Body ──────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 40px",
            fontFamily: INTER,
            color: CHARCOAL,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2
                size={32}
                style={{ color: SAGE, animation: "spin 1s linear infinite" }}
              />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>
                Interrogation des moteurs IA en cours...
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: NEGATIVE }} />
              <p style={{ marginTop: 12, fontSize: 14, color: NEGATIVE }}>{error}</p>
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
                  fontFamily: INTER,
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {data && (
            <div id="ai-visibility-document">
              {/* ── a. Header ─────────────────────────────────── */}
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
                          fontFamily: SPACE_MONO,
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
                        lineHeight: 1.2,
                      }}
                    >
                      Visibilité IA — Comment les LLMs vous perçoivent
                    </h1>
                    <p
                      style={{
                        fontSize: 13,
                        color: TEXT_MUTED,
                        marginTop: 6,
                      }}
                    >
                      {data.meta.companyName}
                      {data.meta.sector ? ` · ${data.meta.sector}` : ""} ·{" "}
                      {data.totalCited}/{data.totalEngines} moteurs citent la marque
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── b. Overall score gauge ────────────────────── */}
              <AnimatePresence>
                {visibleSections.has("gauge") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 20,
                      padding: 24,
                      background: "#FAFAFA",
                      borderRadius: 10,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontFamily: SPACE_MONO,
                        color: TEXT_MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 12,
                      }}
                    >
                      Score global de visibilité IA
                    </div>
                    <Gauge value={data.overallScore} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── c. Trend indicator ────────────────────────── */}
              <AnimatePresence>
                {visibleSections.has("trend") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <TrendBadge trend={data.trend} />
                    <span style={{ fontSize: 12, color: TEXT_MUTED }}>
                      vs mois précédent — basé sur le nombre de citations détectées
                      sur les 30 derniers jours.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── d. Engine cards grid ──────────────────────── */}
              <AnimatePresence>
                {visibleSections.has("engines") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 28 }}
                  >
                    <SectionLabel>Moteurs IA analysés</SectionLabel>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 10,
                      }}
                    >
                      {data.engines.map((engine) => (
                        <EngineCard key={engine.name} engine={engine} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── e. Comparison bar chart ──────────────────── */}
              <AnimatePresence>
                {visibleSections.has("chart") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 28 }}
                  >
                    <SectionLabel>Comparaison de visibilité par moteur</SectionLabel>
                    <div
                      style={{
                        padding: 20,
                        background: "#FAFAFA",
                        borderRadius: 10,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      {data.engines.map((engine) => (
                        <BarRow key={engine.name} engine={engine} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── f. Narrative summary ─────────────────────── */}
              <AnimatePresence>
                {visibleSections.has("narrative") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24,
                      padding: 18,
                      background: SAGE_BG,
                      borderRadius: 10,
                      border: `1px solid ${SAGE_BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontFamily: SPACE_MONO,
                        color: SAGE,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 10,
                        fontWeight: 700,
                      }}
                    >
                      Synthèse narrative
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: CHARCOAL,
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {data.narrativeSummary}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── g. Actions ────────────────────────────────── */}
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
                        fontFamily: INTER,
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
                        fontFamily: INTER,
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
                      fontFamily: SPACE_MONO,
                    }}
                  >
                    Analyse en cours...
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
        @keyframes barGrow { from { width: 0; } }
        @media print {
          body * { visibility: hidden; }
          #ai-visibility-document, #ai-visibility-document * { visibility: visible; }
          #ai-visibility-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 32px;
          }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontFamily: SPACE_MONO,
        color: TEXT_MUTED,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const color = v >= 70 ? SAGE : v >= 50 ? AMBER : NEGATIVE;
  const label = v >= 70 ? "Forte" : v >= 50 ? "Modérée" : v > 0 ? "Faible" : "Aucune donnée";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: 84, height: 84 }}>
        <svg width="84" height="84" viewBox="0 0 84 84">
          <circle
            cx="42"
            cy="42"
            r="36"
            fill="none"
            stroke={BORDER}
            strokeWidth="6"
          />
          <circle
            cx="42"
            cy="42"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(v / 100) * 2 * Math.PI * 36} ${2 * Math.PI * 36}`}
            transform="rotate(-90 42 42)"
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 700,
            color: CHARCOAL,
            fontFamily: SPACE_MONO,
          }}
        >
          {v}
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color,
            fontFamily: INTER,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>
          / 100 — moyenne pondérée sur {v >= 70 ? "excellente" : v >= 50 ? "correcte" : "à améliorer"} présence IA
        </div>
      </div>
    </div>
  );
}

function TrendBadge({ trend }: { trend: number }) {
  const isUp = trend > 0;
  const isDown = trend < 0;
  const color = isUp ? POSITIVE : isDown ? NEGATIVE : TEXT_MUTED;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const label = isUp ? `+${trend} pts` : isDown ? `${trend} pts` : "Stable";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        background: `${color}14`,
        borderRadius: 6,
        border: `1px solid ${color}33`,
        fontSize: 13,
        fontWeight: 700,
        color,
        fontFamily: SPACE_MONO,
      }}
    >
      <Icon size={14} /> {label}
    </span>
  );
}

function EngineCard({ engine }: { engine: Engine }) {
  const sentimentColor =
    engine.sentiment && /pos/i.test(engine.sentiment)
      ? POSITIVE
      : engine.sentiment && /neg/i.test(engine.sentiment)
      ? NEGATIVE
      : TEXT_MUTED;
  const sentimentLabel =
    engine.sentiment && /pos/i.test(engine.sentiment)
      ? "Positif"
      : engine.sentiment && /neg/i.test(engine.sentiment)
      ? "Négatif"
      : engine.sentiment && /neu/i.test(engine.sentiment)
      ? "Neutre"
      : "N/A";

  return (
    <div
      style={{
        padding: 12,
        background: engine.cited ? WHITE : "#FAFAFA",
        borderRadius: 8,
        border: `1px solid ${engine.cited ? SAGE_BORDER : BORDER}`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: CHARCOAL,
            fontFamily: INTER,
          }}
        >
          {engine.name}
        </span>
        {engine.cited ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: "2px 6px",
              background: `${SAGE}14`,
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 700,
              color: SAGE,
              fontFamily: SPACE_MONO,
            }}
          >
            <CheckCircle2 size={10} /> Cité
          </span>
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: "2px 6px",
              background: `${TEXT_MUTED}14`,
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 700,
              color: TEXT_MUTED,
              fontFamily: SPACE_MONO,
            }}
          >
            <XCircle size={10} /> Absent
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 11,
          color: TEXT_MUTED,
          fontFamily: SPACE_MONO,
        }}
      >
        <span>
          Rang :{" "}
          <span style={{ color: CHARCOAL, fontWeight: 700 }}>
            {engine.rank !== null ? `#${engine.rank}` : "—"}
          </span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: sentimentColor,
              display: "inline-block",
            }}
          />
          {sentimentLabel}
        </span>
      </div>
      <div
        style={{
          fontSize: 10,
          color: TEXT_MUTED,
          fontFamily: SPACE_MONO,
        }}
      >
        {engine.lastChecked ? relativeTimeFr(engine.lastChecked) : "Jamais vérifié"}
        {engine.cited && engine.mentions > 0 ? ` · ${engine.mentions} mention(s) 30j` : ""}
      </div>
    </div>
  );
}

function BarRow({ engine }: { engine: Engine }) {
  const pct = Math.max(2, Math.min(100, engine.visibilityScore));
  const color = engine.visibilityScore >= 70 ? SAGE : engine.visibilityScore >= 50 ? AMBER : engine.visibilityScore > 0 ? NEGATIVE : BORDER;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "5px 0",
      }}
    >
      <span
        style={{
          width: 90,
          fontSize: 12,
          fontWeight: 600,
          color: CHARCOAL,
          fontFamily: INTER,
          flexShrink: 0,
        }}
      >
        {engine.name}
      </span>
      <div
        style={{
          flex: 1,
          height: 14,
          background: BORDER,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 4,
            transition: "width 0.9s ease",
            animation: "barGrow 0.9s ease",
          }}
        />
      </div>
      <span
        style={{
          width: 32,
          textAlign: "right",
          fontSize: 12,
          fontWeight: 700,
          color: engine.cited ? CHARCOAL : TEXT_MUTED,
          fontFamily: SPACE_MONO,
        }}
      >
        {engine.cited ? engine.visibilityScore : "—"}
      </span>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────

function relativeTimeFr(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const dayMs = 86_400_000;
  const days = Math.floor(diffMs / dayMs);
  if (days <= 0) return "Vérifié aujourd'hui";
  if (days === 1) return "Vérifié hier";
  if (days < 30) return `Vérifié il y a ${days} jours`;
  const months = Math.floor(days / 30);
  if (months === 1) return "Vérifié il y a 1 mois";
  return `Vérifié il y a ${months} mois`;
}

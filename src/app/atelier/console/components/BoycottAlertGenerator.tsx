"use client";

// ═══════════════════════════════════════════════════════════════
//  BoycottAlertGenerator — Skill 8
//
//  Boycott Early Warning System. When the user clicks "Alerte
//  Boycott", the popup opens, the API scrapes Hespress comments +
//  Google News for boycott signals, and 7 sections appear one by
//  one (200ms stagger):
//
//    a. Header — "Alerte Boycott" + company name + score gauge
//    b. Level indicator — safe/watch/warning/critical with icon
//    c. Velocity chart — 7-day sparkline of boycott mentions
//    d. Signals feed — top 10 boycott signals with source + date
//    e. Hashtags — detected boycott hashtags as chips
//    f. Recommendation — contextual action plan (sage box)
//    g. Export + "Activer le Mode Crise" button (→ crisis skill)
//
//  Same popup pattern as BriefingGenerator/CrisisBriefingGenerator
//  (fixed overlay, scale entrance, framer-motion section reveal).
//  Accent palette is RED / AMBER — this is a WARNING tool, not a
//  sage "all good" tool. Sage is reserved for the "safe" state and
//  for the recommendation box (sage = action plan, distinct from
//  the red "danger" alert).
//
//  Design system: white #FFFFFF, sage #4A7B5F, charcoal #0A0A0A,
//  Space Mono headers, Inter body, Lucide icons, French, no emojis.
//
//  Skill ID: SKILL-8-BOYCOTT-ALERT
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, ShieldAlert,
  TrendingUp, TrendingDown, Minus, Hash,
  RefreshCw, Zap, ShieldCheck, Activity, MessageSquare,
  Radio, FileWarning,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE per spec) ───────────────────
const WHITE = "#FFFFFF";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.2)";

// Warning palette — red/amber/orange spectrum
const CRITICAL = "#DC2626";           // red-600 — level critical, score > 60
const CRITICAL_BG = "rgba(220,38,38,0.06)";
const CRITICAL_BORDER = "rgba(220,38,38,0.2)";
const WARNING = "#EA580C";            // orange-600 — level warning
const WARNING_BG = "rgba(234,88,12,0.06)";
const WARNING_BORDER = "rgba(234,88,12,0.2)";
const AMBER = "#F59E0B";              // amber-500 — level watch
const AMBER_BG = "rgba(245,158,11,0.06)";
const AMBER_BORDER = "rgba(245,158,11,0.2)";

// ─── Types — mirrors BoycottAlertResponse from route.ts ────────

interface BoycottSignal {
  source: string;
  text: string;
  date: string | null;
  sentiment: "positive" | "neutral" | "negative";
  platform: "hespress" | "google-news";
}

interface BoycottVelocity {
  today24h: number;
  last7d: number;
  trend: "rising" | "stable" | "falling";
  dailyCounts: Array<{ date: string; count: number }>;
  multiplier: number;
}

interface BoycottHashtag {
  tag: string;
  count: number;
  sentiment: "positive" | "neutral" | "negative";
}

type BoycottLevel = "safe" | "watch" | "warning" | "critical";

interface BoycottAlertData {
  companyName: string;
  generatedAt: string;
  date: string;
  boycottScore: number;
  level: BoycottLevel;
  signals: BoycottSignal[];
  velocity: BoycottVelocity;
  hashtags: BoycottHashtag[];
  recommendation: string;
  stats: {
    hespressArticles: number;
    hespressComments: number;
    googleNewsArticles: number;
    boycottMentions: number;
    negativeShare: number;
  };
}

// ─── Section reveal sequence ───────────────────────────────────
const SECTIONS = [
  { id: "header",         delay: 200 },
  { id: "level",          delay: 400 },
  { id: "velocity",       delay: 600 },
  { id: "signals",        delay: 800 },
  { id: "hashtags",       delay: 1000 },
  { id: "recommendation", delay: 1200 },
  { id: "actions",        delay: 1400 },
];

// ─── Component ─────────────────────────────────────────────────

interface BoycottAlertGeneratorProps {
  onClose: () => void;
  /**
   * Optional — fired when the user clicks "Activer le Mode Crise".
   * The parent console page should swap this popup for the
   * CrisisBriefingGenerator (Skill 2). If undefined, the button is
   * hidden (no-op) — useful when the crisis skill isn't wired in.
   */
  onActivateCrisis?: () => void;
}

export function BoycottAlertGenerator({ onClose, onActivateCrisis }: BoycottAlertGeneratorProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BoycottAlertData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true); setError(null); setData(null);
    setVisibleSections(new Set()); setGenerating(true);
    setCopied(false);
    try {
      const res = await fetch("/api/console/boycott-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const alert = (await res.json()) as BoycottAlertData;
      setData(alert); setLoading(false);
      for (const section of SECTIONS) {
        setTimeout(() => {
          setVisibleSections((prev) => new Set(prev).add(section.id));
          if (section.id === "actions") setGenerating(false);
        }, section.delay);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false); setGenerating(false);
    }
  }, []);

  useEffect(() => { void generate(); }, [generate]);

  async function copyToClipboard() {
    if (!data) return;
    const text = renderPlainText(data);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked — silent no-op
    }
  }

  function handleActivateCrisis() {
    onActivateCrisis?.();
    onClose();
  }

  // ─── Palette by level ─────────────────────────────────────
  function palette() {
    if (!data) return { accent: AMBER, accentBg: AMBER_BG, accentBorder: AMBER_BORDER };
    const lvl = data.level;
    if (lvl === "critical") return { accent: CRITICAL, accentBg: CRITICAL_BG, accentBorder: CRITICAL_BORDER };
    if (lvl === "warning")  return { accent: WARNING,  accentBg: WARNING_BG,  accentBorder: WARNING_BORDER  };
    if (lvl === "watch")    return { accent: AMBER,    accentBg: AMBER_BG,    accentBorder: AMBER_BORDER    };
    return { accent: SAGE, accentBg: SAGE_BG, accentBorder: SAGE_BORDER };
  }

  /**
   * Gauge colour — per spec, red if score > 60. Below 60, follows
   * the level palette (sage → amber → orange → red at the bands).
   */
  function gaugeColor(): string {
    if (!data) return AMBER;
    if (data.boycottScore > 60) return CRITICAL;
    if (data.boycottScore >= 50) return WARNING;
    if (data.boycottScore >= 25) return AMBER;
    return SAGE;
  }

  const pal = palette();
  const gaugeCol = gaugeColor();

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
            <ShieldAlert size={18} style={{ color: pal.accent }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>Alerte Boycott</span>
            {generating && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: pal.accent, fontFamily: "'Space Mono', monospace" }}>
                <Loader2 size={11} className="animate-spin" /> Scan Hespress + Google News...
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
                Scan des commentaires Hespress et Google News en cours...
              </p>
              <p style={{ marginTop: 4, fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace" }}>
                Peut prendre 30-60 secondes
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
            <div id="boycott-document">
              {/* ── a. Header — company name + score gauge ── */}
              <AnimatePresence>
                {visibleSections.has("header") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <FileWarning size={14} style={{ color: pal.accent }} />
                      <span
                        style={{
                          fontSize: 11, fontFamily: "'Space Mono', monospace", color: pal.accent,
                          textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
                        }}
                      >
                        Alerte Boycott · {data.date}
                      </span>
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: CHARCOAL, letterSpacing: "-0.02em" }}>
                      Boycott Watch — {data.companyName}
                    </h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                      {data.stats.boycottMentions} mentions boycott · {data.stats.hespressComments} commentaires Hespress · {data.stats.googleNewsArticles} articles Google News
                    </p>

                    {/* Score gauge */}
                    <div
                      style={{
                        marginTop: 16, padding: 20, borderRadius: 12,
                        background: pal.accentBg, border: `1px solid ${pal.accentBorder}`,
                        display: "flex", alignItems: "center", gap: 24,
                      }}
                    >
                      <BoycottGauge score={data.boycottScore} color={gaugeCol} />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 10, fontFamily: "'Space Mono', monospace", color: pal.accent,
                            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontWeight: 700,
                          }}
                        >
                          Score de boycott
                        </div>
                        <div style={{ fontSize: 13, color: TEXT_BODY, lineHeight: 1.5, marginBottom: 6 }}>
                          Score composite basé sur la fréquence des mots-clés boycott, la vélocité 24h vs 7j, et la part de sentiment négatif.
                        </div>
                        <div style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace" }}>
                          {data.stats.boycottMentions} signaux · {Math.round(data.stats.negativeShare * 100)}% négatif · {data.velocity.multiplier}× vélocité
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── b. Level indicator ── */}
              <AnimatePresence>
                {visibleSections.has("level") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
                      }}
                    >
                      Niveau d'alerte
                    </div>
                    <LevelIndicator level={data.level} score={data.boycottScore} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── c. Velocity chart (7-day sparkline) ── */}
              <AnimatePresence>
                {visibleSections.has("velocity") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                          textTransform: "uppercase", letterSpacing: "0.1em",
                        }}
                      >
                        Vélocité · 7 derniers jours
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: TEXT_MUTED }}>
                        {data.velocity.trend === "rising" && <TrendingUp size={12} style={{ color: CRITICAL }} />}
                        {data.velocity.trend === "falling" && <TrendingDown size={12} style={{ color: SAGE }} />}
                        {data.velocity.trend === "stable" && <Minus size={12} style={{ color: TEXT_MUTED }} />}
                        <span
                          style={{
                            fontFamily: "'Space Mono', monospace", fontWeight: 700,
                            color: data.velocity.trend === "rising" ? CRITICAL : data.velocity.trend === "falling" ? SAGE : TEXT_MUTED,
                            textTransform: "uppercase", letterSpacing: "0.05em",
                          }}
                        >
                          {data.velocity.trend === "rising" ? "En hausse" : data.velocity.trend === "falling" ? "En baisse" : "Stable"}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: 16, background: "#FAFAFA", borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      <Sparkline points={data.velocity.dailyCounts} color={CRITICAL} />

                      <div
                        style={{
                          marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
                        }}
                      >
                        <VelocityStat
                          icon={<Activity size={12} />}
                          label="24 heures"
                          value={data.velocity.today24h}
                          color={data.velocity.today24h > 0 ? CRITICAL : TEXT_MUTED}
                        />
                        <VelocityStat
                          icon={<MessageSquare size={12} />}
                          label="7 jours"
                          value={data.velocity.last7d}
                          color={data.velocity.last7d > 0 ? AMBER : TEXT_MUTED}
                        />
                        <VelocityStat
                          icon={<Zap size={12} />}
                          label="Vélocité"
                          value={`${data.velocity.multiplier}×`}
                          color={data.velocity.multiplier >= 2 ? CRITICAL : data.velocity.multiplier >= 1.5 ? AMBER : TEXT_MUTED}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── d. Signals feed ── */}
              <AnimatePresence>
                {visibleSections.has("signals") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
                      }}
                    >
                      Signaux boycott · Top {Math.min(10, data.signals.length)}
                    </div>

                    {data.signals.length === 0 ? (
                      <div
                        style={{
                          padding: 20, background: SAGE_BG, borderRadius: 8,
                          border: `1px solid ${SAGE_BORDER}`, textAlign: "center",
                        }}
                      >
                        <ShieldCheck size={20} style={{ color: SAGE, margin: "0 auto 8px" }} />
                        <p style={{ fontSize: 13, color: SAGE, fontWeight: 600, margin: 0 }}>
                          Aucun signal boycott détecté
                        </p>
                        <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4, marginBottom: 0 }}>
                          Aucun commentaire Hespress ni article Google News ne contient les mots-clés boycott sur la fenêtre analysée.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {data.signals.map((sig, i) => (
                          <SignalRow key={`sig-${i}`} signal={sig} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── e. Hashtags ── */}
              <AnimatePresence>
                {visibleSections.has("hashtags") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
                      }}
                    >
                      Hashtags détectés
                    </div>

                    {data.hashtags.length === 0 ? (
                      <p style={{ fontSize: 13, color: TEXT_MUTED, padding: "8px 0", margin: 0 }}>
                        Aucun hashtag boycott identifié. Les commentaires restent au stade du chatter non structuré.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {data.hashtags.map((h, i) => {
                          const chipColor =
                            h.sentiment === "negative" ? CRITICAL :
                            h.sentiment === "positive" ? SAGE : AMBER;
                          const chipBg =
                            h.sentiment === "negative" ? CRITICAL_BG :
                            h.sentiment === "positive" ? SAGE_BG : AMBER_BG;
                          const chipBorder =
                            h.sentiment === "negative" ? CRITICAL_BORDER :
                            h.sentiment === "positive" ? SAGE_BORDER : AMBER_BORDER;
                          return (
                            <span
                              key={`tag-${i}`}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "5px 10px", background: chipBg, border: `1px solid ${chipBorder}`,
                                borderRadius: 4, fontSize: 12, color: chipColor, fontWeight: 600,
                                fontFamily: "'Space Mono', monospace",
                              }}
                            >
                              <Hash size={11} />
                              {h.tag.replace(/^#/, "")}
                              <span style={{ opacity: 0.7, fontWeight: 400 }}>· {h.count}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {data.hashtags.some((h) => h.sentiment === "positive") && (
                      <p style={{ fontSize: 11, color: SAGE, marginTop: 10, fontFamily: "'Space Mono', monospace" }}>
                        ● Hashtags verts = contre-narratif positif détecté
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── f. Recommendation (sage box) ── */}
              <AnimatePresence>
                {visibleSections.has("recommendation") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        padding: 16, background: SAGE_BG, borderRadius: 8,
                        border: `1px solid ${SAGE_BORDER}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace", color: SAGE,
                          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700,
                          display: "flex", alignItems: "center", gap: 6,
                        }}
                      >
                        <ShieldCheck size={12} /> Plan d'action HarchIQ
                      </div>
                      <p style={{ fontSize: 13, color: CHARCOAL, lineHeight: 1.6, margin: 0 }}>
                        {data.recommendation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── g. Export + Mode Crise ── */}
              <AnimatePresence>
                {visibleSections.has("actions") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex", gap: 8, paddingTop: 16, flexWrap: "wrap",
                      borderTop: `1px solid ${BORDER}`,
                    }}
                  >
                    {onActivateCrisis && data.level !== "safe" && (
                      <button
                        onClick={handleActivateCrisis}
                        style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                          background: CRITICAL, color: WHITE, border: "none", borderRadius: 8,
                          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                          boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
                        }}
                      >
                        <ShieldAlert size={14} /> Activer le Mode Crise
                      </button>
                    )}
                    <button
                      onClick={() => window.print()}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
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
                      {copied ? "Copié" : "Copier"}
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
                      <RefreshCw size={14} /> Re-scanner
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {generating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: pal.accent, animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: 11, color: pal.accent, fontFamily: "'Space Mono', monospace" }}>
                    Compilation de l'alerte...
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
          #boycott-document, #boycott-document * { visibility: visible; }
          #boycott-document {
            position: absolute; left: 0; top: 0; width: 100%; padding: 40px;
          }
          /* Hide interactive buttons in PDF export */
          #boycott-document button { display: none !important; }
          /* Force white background for print */
          #boycott-document { background: ${WHITE} !important; }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════

// ─── Score gauge (semicircular arc, 0-100) ────────────────────
function BoycottGauge({ score, color }: { score: number; color: string }) {
  // SVG semicircle, 180° arc from left to right. Arc length ~110 units
  // for the path we use; we render the colored progress on top.
  const size = 96;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * radius; // semicircle only
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const dashOffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
      {/* Background arc (grey) */}
      <path
        d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
        fill="none"
        stroke="#F0F0F0"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Progress arc (colored) */}
      <path
        d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
      />
      {/* Numeric score */}
      <text
        x={size / 2}
        y={size / 2 - 2}
        textAnchor="middle"
        fontSize={28}
        fontWeight={700}
        fill={color}
        fontFamily="'Space Mono', monospace"
      >
        {score}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 12}
        textAnchor="middle"
        fontSize={9}
        fill={TEXT_MUTED}
        fontFamily="'Space Mono', monospace"
        letterSpacing="0.1em"
      >
        / 100
      </text>
    </svg>
  );
}

// ─── Level indicator (4-step bar with active highlight) ───────
function LevelIndicator({ level, score }: { level: BoycottLevel; score: number }) {
  const steps: Array<{
    key: BoycottLevel;
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: typeof ShieldCheck;
  }> = [
    { key: "safe",     label: "Sûr",     color: SAGE,     bg: SAGE_BG,     border: SAGE_BORDER,     icon: ShieldCheck },
    { key: "watch",    label: "Veille",  color: AMBER,    bg: AMBER_BG,    border: AMBER_BORDER,    icon: Activity },
    { key: "warning",  label: "Alerte",  color: WARNING,  bg: WARNING_BG,  border: WARNING_BORDER,  icon: AlertTriangle },
    { key: "critical", label: "Critique",color: CRITICAL, bg: CRITICAL_BG, border: CRITICAL_BORDER, icon: ShieldAlert },
  ];

  const activeIdx = steps.findIndex((s) => s.key === level);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
      {steps.map((step, i) => {
        const active = i === activeIdx;
        const passed = i < activeIdx;
        const Icon = step.icon;
        return (
          <div
            key={step.key}
            style={{
              padding: "10px 8px", borderRadius: 8,
              background: active ? step.bg : passed ? "#FAFAFA" : WHITE,
              border: `1px solid ${active ? step.border : passed ? BORDER : BORDER}`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              opacity: active ? 1 : passed ? 0.7 : 0.5,
              transition: "all 0.2s",
              position: "relative",
            }}
          >
            <Icon
              size={16}
              style={{
                color: active ? step.color : passed ? step.color : TEXT_MUTED,
              }}
            />
            <span
              style={{
                fontSize: 11, fontWeight: 700,
                color: active ? step.color : passed ? step.color : TEXT_MUTED,
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}
            >
              {step.label}
            </span>
            {active && (
              <span style={{ fontSize: 9, color: step.color, fontFamily: "'Space Mono', monospace" }}>
                {score}/100
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sparkline (7-day boycott mentions, red line) ─────────────
function Sparkline({
  points,
  color,
}: {
  points: Array<{ date: string; count: number }>;
  color: string;
}) {
  // Render a polyline + dots across the 7 daily counts.
  // Width 100%, height 60. X evenly distributed; Y scaled to max.
  const width = 600;
  const height = 60;
  const padX = 12;
  const padY = 8;

  if (points.length === 0) return null;

  const max = Math.max(1, ...points.map((p) => p.count));
  const stepX = (width - 2 * padX) / Math.max(1, points.length - 1);

  const coords = points.map((p, i) => {
    const x = padX + i * stepX;
    const y = padY + (height - 2 * padY) * (1 - p.count / max);
    return { x, y, count: p.count, date: p.date };
  });

  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  // Day labels — short French weekday abbreviations.
  const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <svg width="100%" height={height + 18} viewBox={`0 0 ${width} ${height + 18}`} preserveAspectRatio="none">
      {/* Baseline */}
      <line
        x1={padX}
        y1={height - padY + 1}
        x2={width - padX}
        y2={height - padY + 1}
        stroke="#F0F0F0"
        strokeWidth={1}
      />
      {/* Area fill under the line (subtle red) */}
      <path
        d={`${path} L ${coords[coords.length - 1].x.toFixed(1)} ${height - padY + 1} L ${coords[0].x.toFixed(1)} ${height - padY + 1} Z`}
        fill="rgba(220,38,38,0.06)"
        stroke="none"
      />
      {/* The line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {coords.map((c, i) => (
        <g key={`pt-${i}`}>
          <circle cx={c.x} cy={c.y} r={3} fill={color} />
          {c.count > 0 && (
            <text
              x={c.x}
              y={c.y - 8}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill={color}
              fontFamily="'Space Mono', monospace"
            >
              {c.count}
            </text>
          )}
          {/* Day label below */}
          <text
            x={c.x}
            y={height + 4}
            textAnchor="middle"
            fontSize={9}
            fill={TEXT_MUTED}
            fontFamily="'Space Mono', monospace"
            letterSpacing="0.05em"
          >
            {dayLabels[i] ?? ""}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Velocity stat card (3-up inside the velocity block) ──────
function VelocityStat({
  icon, label, value, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: 10, background: WHITE, borderRadius: 6,
        border: `1px solid ${BORDER}`,
        display: "flex", flexDirection: "column", gap: 2,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4, color: TEXT_MUTED }}>
        {icon}
        <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "'Space Mono', monospace" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Signal row (one boycott mention) ─────────────────────────
function SignalRow({ signal }: { signal: BoycottSignal }) {
  const sentColor =
    signal.sentiment === "negative" ? CRITICAL :
    signal.sentiment === "positive" ? SAGE : AMBER;
  const Icon = signal.platform === "google-news" ? Radio : MessageSquare;
  const dateStr = signal.date
    ? new Date(signal.date).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      })
    : "—";

  return (
    <div
      style={{
        padding: "10px 12px", background: "#FAFAFA", borderRadius: 8,
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${sentColor}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: TEXT_MUTED }}>
          <Icon size={11} />
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>
            {signal.platform === "google-news" ? "Google News" : "Hespress"}
          </span>
          <span style={{ fontSize: 11, color: TEXT_MUTED }}>· {signal.source}</span>
        </div>
        <span style={{ fontSize: 10, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace" }}>
          {dateStr}
        </span>
      </div>
      <p style={{ fontSize: 13, color: CHARCOAL, margin: 0, lineHeight: 1.5 }}>
        <span style={{ color: sentColor, fontWeight: 700, marginRight: 4 }}>
          {signal.sentiment === "negative" ? "●" : signal.sentiment === "positive" ? "●" : "●"}
        </span>
        {signal.text}
      </p>
    </div>
  );
}

// ─── Plain-text renderer (for clipboard copy) ─────────────────
function renderPlainText(d: BoycottAlertData): string {
  const lines: string[] = [];
  lines.push(`ALERTE BOYCOTT — ${d.companyName}`);
  lines.push(`${d.date}`);
  lines.push(`Score: ${d.boycottScore}/100 (niveau: ${d.level})`);
  lines.push("");
  lines.push("─ VELOCITÉ ─");
  lines.push(`24h: ${d.velocity.today24h} · 7j: ${d.velocity.last7d} · tendance: ${d.velocity.trend} · multiplicateur: ${d.velocity.multiplier}×`);
  lines.push("Par jour:");
  for (const b of d.velocity.dailyCounts) lines.push(`  ${b.date}: ${b.count}`);
  lines.push("");
  lines.push(`─ SIGNAUX (${d.signals.length}) ─`);
  for (const s of d.signals) {
    const dt = s.date ? new Date(s.date).toLocaleString("fr-FR") : "—";
    lines.push(`[${s.platform}] ${s.source} · ${dt} · ${s.sentiment}`);
    lines.push(`  ${s.text}`);
  }
  lines.push("");
  lines.push(`─ HASHTAGS (${d.hashtags.length}) ─`);
  for (const h of d.hashtags) {
    lines.push(`${h.tag} · ${h.count} · ${h.sentiment}`);
  }
  lines.push("");
  lines.push("─ PLAN D'ACTION ─");
  lines.push(d.recommendation);
  lines.push("");
  lines.push(`Généré par HarchIQ — ${d.generatedAt}`);
  return lines.join("\n");
}

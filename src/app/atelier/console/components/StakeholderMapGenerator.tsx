"use client";

// ═══════════════════════════════════════════════════════════════
//  StakeholderMapGenerator
//
//  Skill 9 — Cartographie des Parties Prenantes.
//  An interactive scatter chart mapping 8 stakeholder categories
//  by Influence (1-5) × Sentiment (-1..+1), with bubble size =
//  engagement level.
//
//  Same popup pattern as BriefingGenerator (fixed overlay, scale
//  entrance, sections fade-in with framer-motion). Sage palette —
//  this is a strategic tool, not a crisis tool.
//
//  Layout:
//    a. Header bar — "Cartographie des Parties Prenantes"
//    b. Inline SVG scatter chart (no recharts):
//       - X axis: Influence (1-5, left → right)
//       - Y axis: Sentiment (négatif bas, positif haut)
//       - Bubble size = engagement
//       - 8 bubbles, color-coded by quadrant
//         (sage = alliés, amber = à surveiller,
//          charcoal = neutres, red = risques)
//       - Hover: tooltip with category + details
//       - Quadrant labels: Alliés (TR), À surveiller (TL),
//         Neutres (BR), Risques (BL)
//       - Quadrant bg tints: sage top-right, red bottom-left
//       - Bubbles animate in one-by-one (200ms delay each)
//    c. Stakeholder list below: 8 cards (icon, influence stars,
//       sentiment dot, engagement bar)
//    d. Export PDF (window.print with isolated print CSS)
//
//  Skill ID: SKILL-9-STAKEHOLDER-MAP
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw, Copy,
  Landmark, Scale, Newspaper, TrendingUp, Users, UserCheck,
  Globe, Swords, Star,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE per spec) ───────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.10)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const CHARCOAL_BG = "rgba(10,10,10,0.04)";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const AMBER = "#F59E0B";
const AMBER_BG = "rgba(245,158,11,0.08)";
const RED = "#DC2626";
const RED_BG = "rgba(220,38,38,0.08)";
const RED_BORDER = "rgba(220,38,38,0.20)";

// ─── Types — mirrors StakeholderMapResponse from route.ts ──────

type Category =
  | "Gouvernement"
  | "Régulateurs"
  | "Médias"
  | "Investisseurs"
  | "Employés"
  | "Clients"
  | "ONG"
  | "Concurrents";

interface StakeholderRow {
  category: Category;
  influence: number;       // 1-5
  sentiment: number;       // -1..1
  engagement: number;      // 0-100
  contact: string;
  lastInteraction: string;
  description: string;
}

interface StakeholderMapData {
  stakeholders: StakeholderRow[];
  meta: {
    companyName: string;
    sector: string | null;
    generatedAt: string;
    windowDays: number;
    source: "real" | "demo";
  };
}

// ─── SVG geometry ──────────────────────────────────────────────
//
// viewBox: 0 0 520 360
// Plot area: x [60, 500], y [30, 300]
//   - X axis: influence 1..5 → x = 60 + (inf-1)/4 * 440
//   - Y axis: sentiment -1..+1 → y = 165 - sentiment * 135
//     (so +1 = top y=30, 0 = middle y=165, -1 = bottom y=300)
// Axis labels area: bottom 30px (300→330), left 60px (0→60)
//
const VB_W = 520;
const VB_H = 360;
const PLOT_X0 = 60;
const PLOT_X1 = 500;
const PLOT_Y0 = 30;
const PLOT_Y1 = 300;
const PLOT_W = PLOT_X1 - PLOT_X0;
const PLOT_H = PLOT_Y1 - PLOT_Y0;
const PLOT_MID_Y = (PLOT_Y0 + PLOT_Y1) / 2; // 165
const PLOT_MID_X = PLOT_X0 + (PLOT_W * (3 - 1)) / 4; // inf=3 → 280

function xForInfluence(inf: number): number {
  return PLOT_X0 + ((inf - 1) / 4) * PLOT_W;
}
function yForSentiment(s: number): number {
  return PLOT_MID_Y - s * (PLOT_H / 2);
}
function radiusForEngagement(eng: number): number {
  // 8 → 30 px radius for engagement 0 → 100
  return 8 + (eng / 100) * 22;
}

// ─── Quadrant + color logic ────────────────────────────────────
// A bubble's color reflects its quadrant — this is the spec's
// "color-coded by category (sage, charcoal, amber, red)" palette.

type Quadrant = "allies" | "surveiller" | "neutres" | "risques";

function quadrantFor(s: StakeholderRow): Quadrant {
  const isHighInfluence = s.influence >= 3;
  const isPositive = s.sentiment >= 0;
  if (isPositive && isHighInfluence) return "allies";
  if (isPositive && !isHighInfluence) return "surveiller";
  if (!isPositive && isHighInfluence) return "neutres";
  return "risques";
}

function colorForQuadrant(q: Quadrant): string {
  switch (q) {
    case "allies": return SAGE;
    case "surveiller": return AMBER;
    case "neutres": return CHARCOAL;
    case "risques": return RED;
  }
}

const QUADRANT_LABELS: Record<Quadrant, string> = {
  allies: "Alliés",
  surveiller: "À surveiller",
  neutres: "Neutres",
  risques: "Risques",
};

const QUADRANT_DESC: Record<Quadrant, string> = {
  allies: "Forte influence · sentiment positif",
  surveiller: "Faible influence · sentiment positif",
  neutres: "Forte influence · sentiment négatif",
  risques: "Faible influence · sentiment négatif",
};

// ─── Icon per category ─────────────────────────────────────────
function iconForCategory(cat: Category) {
  switch (cat) {
    case "Gouvernement": return Landmark;
    case "Régulateurs": return Scale;
    case "Médias": return Newspaper;
    case "Investisseurs": return TrendingUp;
    case "Employés": return Users;
    case "Clients": return UserCheck;
    case "ONG": return Globe;
    case "Concurrents": return Swords;
  }
}

// ─── Component ─────────────────────────────────────────────────

export function StakeholderMapGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StakeholderMapData | null>(null);
  const [visibleBubbles, setVisibleBubbles] = useState<Set<number>>(new Set());
  const [cardsVisible, setCardsVisible] = useState(false);
  const [generating, setGenerating] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleBubbles(new Set());
    setCardsVisible(false);
    setGenerating(true);
    setHovered(null);
    setCopied(false);
    try {
      const res = await fetch("/api/console/stakeholder-map", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as StakeholderMapData;
      setData(json);
      setLoading(false);
      // Bubbles animate in one-by-one, 200ms delay each.
      json.stakeholders.forEach((_, i) => {
        setTimeout(() => {
          setVisibleBubbles((prev) => new Set(prev).add(i));
        }, 200 + i * 200);
      });
      // After all bubbles, cards fade in.
      setTimeout(() => {
        setCardsVisible(true);
        setGenerating(false);
      }, 200 + json.stakeholders.length * 200 + 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false);
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    void generate();
  }, [generate]);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
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
      // Clipboard may be blocked — silent fallback
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,10,10,0.6)", backdropFilter: "blur(4px)",
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
          width: "100%", maxWidth: 880, maxHeight: "92vh",
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
            padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Scale size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, fontFamily: "'Space Mono', monospace" }}>
              Cartographie des Parties Prenantes
            </span>
            {generating && (
              <span
                style={{
                  display: "flex", alignItems: "center", gap: 4, fontSize: 11,
                  color: SAGE, fontFamily: "'Space Mono', monospace",
                }}
              >
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
                cursor: generating || !data ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, display: "flex", alignItems: "center",
                justifyContent: "center", background: "transparent", border: "none",
                cursor: "pointer", color: TEXT_MUTED,
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
              <Loader2
                size={32}
                style={{ color: SAGE, animation: "spin 1s linear infinite" }}
              />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>
                Collecte des signaux parties prenantes en cours...
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: RED }} />
              <p style={{ marginTop: 12, fontSize: 14, color: RED }}>{error}</p>
              <button
                onClick={generate}
                style={{
                  marginTop: 16, padding: "8px 16px", background: CHARCOAL,
                  color: WHITE, border: "none", borderRadius: 6, fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {data && (
            <div id="stakeholder-document">
              {/* ── a. Header + meta ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 24 }}
              >
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                  }}
                >
                  <Scale size={14} style={{ color: SAGE }} />
                  <span
                    style={{
                      fontSize: 11, fontFamily: "'Space Mono', monospace", color: SAGE,
                      textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
                    }}
                  >
                    Cartographie stratégique · Fenêtre {data.meta.windowDays}j
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: 26, fontWeight: 700, margin: 0, color: CHARCOAL,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Parties Prenantes — {data.meta.companyName}
                </h1>
                <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                  {data.meta.sector ? `Secteur ${data.meta.sector} · ` : ""}
                  {data.stakeholders.length} catégories analysées · Influence × Sentiment × Engagement
                </p>
              </motion.div>

              {/* ── b. Scatter chart ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  marginBottom: 32,
                  padding: 16,
                  background: "#FAFAFA",
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                      textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
                    }}
                  >
                    Influence × Sentiment
                  </span>
                  <span style={{ fontSize: 11, color: TEXT_MUTED }}>
                    Taille = engagement
                  </span>
                </div>

                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${VB_W} ${VB_H}`}
                  width="100%"
                  style={{ display: "block", maxHeight: 380 }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* ── Quadrant background tints ── */}
                  {/* Top-right: sage tint (Alliés) */}
                  <rect
                    x={PLOT_MID_X} y={PLOT_Y0}
                    width={PLOT_X1 - PLOT_MID_X} height={PLOT_MID_Y - PLOT_Y0}
                    fill={SAGE_BG}
                  />
                  {/* Bottom-left: red tint (Risques) */}
                  <rect
                    x={PLOT_X0} y={PLOT_MID_Y}
                    width={PLOT_MID_X - PLOT_X0} height={PLOT_Y1 - PLOT_MID_Y}
                    fill={RED_BG}
                  />
                  {/* Top-left: amber tint (À surveiller) — subtle */}
                  <rect
                    x={PLOT_X0} y={PLOT_Y0}
                    width={PLOT_MID_X - PLOT_X0} height={PLOT_MID_Y - PLOT_Y0}
                    fill={AMBER_BG}
                  />
                  {/* Bottom-right: charcoal tint (Neutres) — subtle */}
                  <rect
                    x={PLOT_MID_X} y={PLOT_MID_Y}
                    width={PLOT_X1 - PLOT_MID_X} height={PLOT_Y1 - PLOT_MID_Y}
                    fill={CHARCOAL_BG}
                  />

                  {/* ── Quadrant labels ── */}
                  <text
                    x={PLOT_X1 - 8} y={PLOT_Y0 + 16}
                    textAnchor="end"
                    style={{
                      fontSize: 11, fontFamily: "'Space Mono', monospace",
                      fontWeight: 700, fill: SAGE, textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Alliés
                  </text>
                  <text
                    x={PLOT_X0 + 8} y={PLOT_Y0 + 16}
                    textAnchor="start"
                    style={{
                      fontSize: 11, fontFamily: "'Space Mono', monospace",
                      fontWeight: 700, fill: AMBER, textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    À surveiller
                  </text>
                  <text
                    x={PLOT_X1 - 8} y={PLOT_Y1 - 8}
                    textAnchor="end"
                    style={{
                      fontSize: 11, fontFamily: "'Space Mono', monospace",
                      fontWeight: 700, fill: CHARCOAL, textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Neutres
                  </text>
                  <text
                    x={PLOT_X0 + 8} y={PLOT_Y1 - 8}
                    textAnchor="start"
                    style={{
                      fontSize: 11, fontFamily: "'Space Mono', monospace",
                      fontWeight: 700, fill: RED, textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Risques
                  </text>

                  {/* ── Axes ── */}
                  {/* X axis line */}
                  <line
                    x1={PLOT_X0} y1={PLOT_Y1} x2={PLOT_X1} y2={PLOT_Y1}
                    stroke={BORDER} strokeWidth={1}
                  />
                  {/* Y axis line */}
                  <line
                    x1={PLOT_X0} y1={PLOT_Y0} x2={PLOT_X0} y2={PLOT_Y1}
                    stroke={BORDER} strokeWidth={1}
                  />
                  {/* Mid lines (influence=3, sentiment=0) — dashed */}
                  <line
                    x1={PLOT_MID_X} y1={PLOT_Y0} x2={PLOT_MID_X} y2={PLOT_Y1}
                    stroke={BORDER} strokeWidth={1} strokeDasharray="3,3"
                  />
                  <line
                    x1={PLOT_X0} y1={PLOT_MID_Y} x2={PLOT_X1} y2={PLOT_MID_Y}
                    stroke={BORDER} strokeWidth={1} strokeDasharray="3,3"
                  />

                  {/* ── X axis ticks + labels (Influence 1..5) ── */}
                  {[1, 2, 3, 4, 5].map((inf) => {
                    const x = xForInfluence(inf);
                    return (
                      <g key={`xtick-${inf}`}>
                        <line
                          x1={x} y1={PLOT_Y1} x2={x} y2={PLOT_Y1 + 5}
                          stroke={TEXT_MUTED} strokeWidth={1}
                        />
                        <text
                          x={x} y={PLOT_Y1 + 18}
                          textAnchor="middle"
                          style={{
                            fontSize: 10, fontFamily: "'Space Mono', monospace",
                            fill: TEXT_MUTED,
                          }}
                        >
                          {inf}
                        </text>
                      </g>
                    );
                  })}
                  {/* X axis title */}
                  <text
                    x={(PLOT_X0 + PLOT_X1) / 2} y={VB_H - 4}
                    textAnchor="middle"
                    style={{
                      fontSize: 10, fontFamily: "'Space Mono', monospace",
                      fill: TEXT_BODY, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.1em",
                    }}
                  >
                    Influence →
                  </text>

                  {/* ── Y axis ticks + labels (Sentiment -1..+1) ── */}
                  {[-1, -0.5, 0, 0.5, 1].map((s) => {
                    const y = yForSentiment(s);
                    const label =
                      s === 1 ? "+1" :
                      s === -1 ? "-1" :
                      s === 0 ? "0" :
                      s > 0 ? `+${s}` : `${s}`;
                    return (
                      <g key={`ytick-${s}`}>
                        <line
                          x1={PLOT_X0 - 5} y1={y} x2={PLOT_X0} y2={y}
                          stroke={TEXT_MUTED} strokeWidth={1}
                        />
                        <text
                          x={PLOT_X0 - 8} y={y + 3}
                          textAnchor="end"
                          style={{
                            fontSize: 10, fontFamily: "'Space Mono', monospace",
                            fill: TEXT_MUTED,
                          }}
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}
                  {/* Y axis title (rotated) */}
                  <text
                    x={-((PLOT_Y0 + PLOT_Y1) / 2)}
                    y={14}
                    textAnchor="middle"
                    transform="rotate(-90)"
                    style={{
                      fontSize: 10, fontFamily: "'Space Mono', monospace",
                      fill: TEXT_BODY, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.1em",
                    }}
                  >
                    Sentiment →
                  </text>

                  {/* ── Bubbles ── */}
                  {data.stakeholders.map((s, i) => {
                    const cx = xForInfluence(s.influence);
                    const cy = yForSentiment(s.sentiment);
                    const r = radiusForEngagement(s.engagement);
                    const q = quadrantFor(s);
                    const color = colorForQuadrant(q);
                    const visible = visibleBubbles.has(i);
                    const isHovered = hovered === i;
                    return (
                      <motion.g
                        key={s.category}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={
                          visible
                            ? { opacity: 1, scale: 1 }
                            : { opacity: 0, scale: 0 }
                        }
                        transition={{ duration: 0.4, ease: "backOut" }}
                        style={{ cursor: "pointer", transformOrigin: `${cx}px ${cy}px` }}
                      >
                        {/* Hover halo */}
                        {isHovered && (
                          <circle
                            cx={cx} cy={cy} r={r + 6}
                            fill="none" stroke={color} strokeWidth={1.5}
                            opacity={0.4}
                          />
                        )}
                        <circle
                          cx={cx} cy={cy} r={r}
                          fill={color}
                          fillOpacity={isHovered ? 0.95 : 0.78}
                          stroke={color}
                          strokeWidth={1.5}
                          onMouseEnter={() => setHovered(i)}
                          style={{ transition: "fill-opacity 0.15s" }}
                        />
                        {/* Category initial inside bubble (if room) */}
                        {r >= 14 && (
                          <text
                            x={cx} y={cy + 4}
                            textAnchor="middle"
                            style={{
                              fontSize: 10,
                              fontFamily: "'Space Mono', monospace",
                              fontWeight: 700,
                              fill: WHITE,
                              pointerEvents: "none",
                            }}
                          >
                            {s.category.charAt(0)}
                          </text>
                        )}
                      </motion.g>
                    );
                  })}
                </svg>

                {/* ── Hover tooltip (HTML overlay) ── */}
                {hovered !== null && data.stakeholders[hovered] && (
                  <div
                    style={{
                      position: "absolute",
                      left: Math.min(mousePos.x + 16, 600),
                      top: Math.max(mousePos.y - 40, 0),
                      pointerEvents: "none",
                      background: CHARCOAL,
                      color: WHITE,
                      padding: "10px 12px",
                      borderRadius: 6,
                      fontSize: 11,
                      maxWidth: 260,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                      zIndex: 10,
                    }}
                  >
                    {(() => {
                      const s = data.stakeholders[hovered];
                      const q = quadrantFor(s);
                      const color = colorForQuadrant(q);
                      return (
                        <>
                          <div
                            style={{
                              display: "flex", alignItems: "center", gap: 6,
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: color, display: "inline-block",
                              }}
                            />
                            <span
                              style={{
                                fontWeight: 700, fontFamily: "'Space Mono', monospace",
                                fontSize: 12,
                              }}
                            >
                              {s.category}
                            </span>
                            <span
                              style={{
                                fontSize: 9, color: "rgba(255,255,255,0.6)",
                                fontFamily: "'Space Mono', monospace",
                                textTransform: "uppercase", letterSpacing: "0.08em",
                                marginLeft: "auto",
                              }}
                            >
                              {QUADRANT_LABELS[q]}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                              gap: 8, marginBottom: 6,
                              fontFamily: "'Space Mono', monospace",
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>INFLUENCE</div>
                              <div style={{ fontSize: 12, fontWeight: 700 }}>{s.influence}/5</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>SENTIMENT</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color }}>
                                {s.sentiment > 0 ? "+" : ""}{s.sentiment.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>ENGAGEMENT</div>
                              <div style={{ fontSize: 12, fontWeight: 700 }}>{s.engagement}%</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>
                            Contact: {s.contact}
                          </div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                            {s.description}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* ── Legend ── */}
                <div
                  style={{
                    display: "flex", flexWrap: "wrap", gap: 12,
                    marginTop: 12, paddingTop: 12,
                    borderTop: `1px solid ${BORDER}`,
                    fontSize: 10, fontFamily: "'Space Mono', monospace",
                    color: TEXT_MUTED,
                  }}
                >
                  {(Object.keys(QUADRANT_LABELS) as Quadrant[]).map((q) => (
                    <div key={q} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: colorForQuadrant(q),
                          display: "inline-block",
                        }}
                      />
                      <span style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {QUADRANT_LABELS[q]}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ── c. Stakeholder list (8 cards) ── */}
              <AnimatePresence>
                {cardsVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED, textTransform: "uppercase",
                        letterSpacing: "0.1em", marginBottom: 12, fontWeight: 700,
                      }}
                    >
                      Détail par catégorie · {data.stakeholders.length} parties prenantes
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                        gap: 12, marginBottom: 24,
                      }}
                    >
                      {data.stakeholders.map((s, i) => {
                        const Icon = iconForCategory(s.category);
                        const q = quadrantFor(s);
                        const color = colorForQuadrant(q);
                        return (
                          <motion.div
                            key={s.category}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            style={{
                              padding: 14,
                              background: "#FAFAFA",
                              borderRadius: 8,
                              border: `1px solid ${BORDER}`,
                              borderLeft: `3px solid ${color}`,
                            }}
                          >
                            {/* Top row: icon + category + quadrant tag */}
                            <div
                              style={{
                                display: "flex", alignItems: "center", gap: 10,
                                marginBottom: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 30, height: 30, borderRadius: 6,
                                  background: color,
                                  display: "flex", alignItems: "center",
                                  justifyContent: "center", color: WHITE, flexShrink: 0,
                                }}
                              >
                                <Icon size={15} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: 13, fontWeight: 700, color: CHARCOAL,
                                  }}
                                >
                                  {s.category}
                                </div>
                                <div
                                  style={{
                                    fontSize: 10, color: TEXT_MUTED,
                                    fontFamily: "'Space Mono', monospace",
                                    textTransform: "uppercase", letterSpacing: "0.05em",
                                  }}
                                >
                                  {QUADRANT_LABELS[q]}
                                </div>
                              </div>
                              {/* Sentiment dot */}
                              <div
                                style={{
                                  display: "flex", alignItems: "center", gap: 4,
                                  fontSize: 10, color: TEXT_MUTED,
                                  fontFamily: "'Space Mono', monospace",
                                }}
                                title="Sentiment"
                              >
                                <span
                                  style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: color, display: "inline-block",
                                  }}
                                />
                                {s.sentiment > 0 ? "+" : ""}{s.sentiment.toFixed(2)}
                              </div>
                            </div>

                            {/* Influence stars */}
                            <div
                              style={{
                                display: "flex", alignItems: "center", gap: 8,
                                marginBottom: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 9, color: TEXT_MUTED,
                                  fontFamily: "'Space Mono', monospace",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em", minWidth: 64,
                                }}
                              >
                                Influence
                              </span>
                              <div style={{ display: "flex", gap: 2 }}>
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star
                                    key={n}
                                    size={11}
                                    fill={n <= s.influence ? color : "none"}
                                    strokeWidth={1.5}
                                    style={{
                                      color: n <= s.influence ? color : BORDER,
                                    }}
                                  />
                                ))}
                              </div>
                              <span
                                style={{
                                  fontSize: 10, color: TEXT_BODY,
                                  fontFamily: "'Space Mono', monospace",
                                  marginLeft: "auto",
                                }}
                              >
                                {s.influence}/5
                              </span>
                            </div>

                            {/* Engagement bar */}
                            <div
                              style={{
                                display: "flex", alignItems: "center", gap: 8,
                                marginBottom: 10,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 9, color: TEXT_MUTED,
                                  fontFamily: "'Space Mono', monospace",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em", minWidth: 64,
                                }}
                              >
                                Engagement
                              </span>
                              <div
                                style={{
                                  flex: 1, height: 4, background: BORDER,
                                  borderRadius: 2, overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${s.engagement}%`,
                                    height: "100%", background: color,
                                    transition: "width 0.6s ease-out",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: 10, color: TEXT_BODY,
                                  fontFamily: "'Space Mono', monospace", minWidth: 28,
                                  textAlign: "right",
                                }}
                              >
                                {s.engagement}%
                              </span>
                            </div>

                            {/* Contact + last interaction */}
                            <div
                              style={{
                                fontSize: 11, color: TEXT_BODY, lineHeight: 1.4,
                                marginBottom: 4,
                              }}
                            >
                              <span style={{ color: TEXT_MUTED }}>Contact: </span>
                              {s.contact}
                            </div>
                            <div
                              style={{
                                fontSize: 10, color: TEXT_MUTED,
                                fontFamily: "'Space Mono', monospace",
                              }}
                            >
                              Dernière interaction: {formatDate(s.lastInteraction)}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* ── d. Export buttons ── */}
                    <div
                      style={{
                        display: "flex", gap: 8, paddingTop: 16,
                        borderTop: `1px solid ${BORDER}`,
                      }}
                    >
                      <button
                        onClick={() => window.print()}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "10px 20px", background: CHARCOAL, color: WHITE,
                          border: "none", borderRadius: 8, fontSize: 13,
                          fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        <Download size={14} /> Exporter PDF
                      </button>
                      <button
                        onClick={copyToClipboard}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "10px 16px", background: "transparent",
                          color: copied ? SAGE : TEXT_BODY,
                          border: `1px solid ${BORDER}`, borderRadius: 8,
                          fontSize: 13, fontWeight: 600, cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <Copy size={14} /> {copied ? "Copié" : "Copier"}
                      </button>
                      <button
                        onClick={generate}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "10px 16px", background: "transparent",
                          color: TEXT_BODY, border: `1px solid ${BORDER}`,
                          borderRadius: 8, fontSize: 13, fontWeight: 600,
                          cursor: "pointer", fontFamily: "inherit",
                          marginLeft: "auto",
                        }}
                      >
                        <RefreshCw size={14} /> Régénérer
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {generating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, marginTop: 16,
                  }}
                >
                  <div
                    style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: SAGE, animation: "pulse 1s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11, color: SAGE,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    Cartographie en cours...
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
          #stakeholder-document, #stakeholder-document * {
            visibility: visible;
          }
          #stakeholder-document {
            position: absolute; left: 0; top: 0; width: 100%; padding: 40px;
          }
          /* Hide interactive buttons in PDF export */
          #stakeholder-document button { display: none !important; }
          /* Force white background for print */
          #stakeholder-document { background: ${WHITE} !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (iso === "—" || !iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return iso;
  }
}

function renderPlainText(d: StakeholderMapData): string {
  const lines: string[] = [];
  lines.push(`CARTOGRAPHIE DES PARTIES PRENANTES — ${d.meta.companyName}`);
  lines.push(`Secteur: ${d.meta.sector ?? "—"} · Fenêtre: ${d.meta.windowDays}j`);
  lines.push(`Généré le: ${new Date(d.meta.generatedAt).toLocaleString("fr-FR")}`);
  lines.push("");
  lines.push("─ MATRICE INFLUENCE × SENTIMENT ─");
  for (const s of d.stakeholders) {
    const q = quadrantFor(s);
    lines.push(`• ${s.category} [${QUADRANT_LABELS[q]}]`);
    lines.push(`  Influence: ${s.influence}/5 · Sentiment: ${s.sentiment > 0 ? "+" : ""}${s.sentiment.toFixed(2)} · Engagement: ${s.engagement}%`);
    lines.push(`  Contact: ${s.contact}`);
    lines.push(`  Dernière interaction: ${formatDate(s.lastInteraction)}`);
    lines.push(`  ${s.description}`);
  }
  lines.push("");
  lines.push("─ LÉGENDE QUADRANTS ─");
  for (const q of ["allies", "surveiller", "neutres", "risques"] as Quadrant[]) {
    lines.push(`  ${QUADRANT_LABELS[q]} — ${QUADRANT_DESC[q]}`);
  }
  lines.push("");
  lines.push(`Généré par HarchIQ — ${d.meta.generatedAt}`);
  return lines.join("\n");
}

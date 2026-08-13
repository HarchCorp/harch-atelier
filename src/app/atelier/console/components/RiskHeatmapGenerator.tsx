"use client";

// ═══════════════════════════════════════════════════════════════
//  RiskHeatmapGenerator
//
//  Skill 10 — Matrice des Risques (5×5).
//  An interactive Probability × Impact heat map with risk dots
//  placed on the grid. Hover reveals a tooltip; click expands the
//  detail panel below.
//
//  Same popup pattern as BriefingGenerator (fixed overlay, scale
//  entrance, sections fade-in one by one with framer-motion).
//  White / sage / charcoal palette — strategic tool, not crisis.
//
//  Layout:
//    a. Header bar — "Matrice des Risques"
//    b. Summary strip — total / critical / high / avg score
//    c. 5×5 CSS grid:
//       - X axis (columns): Probabilité 1 → 5 (left → right)
//       - Y axis (rows):    Impact 5 → 1    (top → bottom)
//       - Cell background = severity tint (sage / amber / red)
//       - Risk dots overlaid at [probability, impact]
//       - Hover dot = tooltip
//       - Click dot = expand detail panel
//    d. Legend strip (severity colour scale)
//    e. Detail panel (AnimatePresence) — full risk sheet
//    f. Footer actions — Export PDF · Régénérer
//
//  Skill ID: SKILL-10-RISK-HEATMAP
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw, Copy,
  ShieldAlert, Scale, Globe2, Factory, Leaf, Newspaper,
  TrendingUp, TrendingDown, Minus, UserSquare2,
  CalendarClock, FileText, ChevronRight,
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
const AMBER_BG = "rgba(245,158,11,0.10)";
const AMBER_BG_STRONG = "rgba(245,158,11,0.22)";
const AMBER_BORDER = "rgba(245,158,11,0.30)";
const RED = "#DC2626";
const RED_BG = "rgba(220,38,38,0.10)";
const RED_BG_STRONG = "rgba(220,38,38,0.22)";
const RED_BORDER = "rgba(220,38,38,0.25)";

// ─── Types — mirrors RiskHeatmapResponse from route.ts ─────────

type RiskCategory =
  | "Géopolitique"
  | "Réglementaire"
  | "Réputationnel"
  | "Opérationnel"
  | "ESG";

type RiskSeverity = "low" | "medium" | "high" | "critical";

interface RiskRow {
  id: string;
  category: RiskCategory;
  label: string;
  probability: number;       // 1-5
  impact: number;            // 1-5
  owner: string;
  deadline: string;          // ISO date
  mitigation: string;
  trajectory: "rising" | "stable" | "falling";
  lastEvent: string;         // ISO date or "—"
  articleCount: number;
  severity: RiskSeverity;
}

interface RiskHeatmapData {
  risks: RiskRow[];
  meta: {
    companyName: string;
    sector: string | null;
    generatedAt: string;
    windowDays: number;
    source: "real" | "demo";
  };
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    avgScore: number;
  };
}

// ─── Severity / colour helpers ─────────────────────────────────
//
// Cell background is derived from score = probability × impact
// (1-25). Four tiers aligned with the data-model severities:

function severityForScore(score: number): RiskSeverity {
  if (score >= 20) return "critical";
  if (score >= 12) return "high";
  if (score >= 6) return "medium";
  return "low";
}

function cellBgForSeverity(s: RiskSeverity): string {
  switch (s) {
    case "critical": return RED_BG_STRONG;
    case "high":     return AMBER_BG_STRONG;
    case "medium":   return AMBER_BG;
    case "low":      return SAGE_BG;
  }
}

function cellBorderForSeverity(s: RiskSeverity): string {
  switch (s) {
    case "critical": return RED_BORDER;
    case "high":     return AMBER_BORDER;
    case "medium":   return "rgba(245,158,11,0.15)";
    case "low":      return SAGE_BORDER;
  }
}

function dotColorForSeverity(s: RiskSeverity): string {
  switch (s) {
    case "critical": return RED;
    case "high":     return AMBER;
    case "medium":   return AMBER;
    case "low":      return SAGE;
  }
}

const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  low: "Faible",
  medium: "Modéré",
  high: "Élevé",
  critical: "Critique",
};

// ─── Icon per category (Lucide, no emojis) ─────────────────────
//
// Declared as a single component that switches on the category to
// avoid the react-hooks/static-components lint rule (which fires
// when a capitalized variable is assigned inside a function body).
// All five icons are imported at module scope — stable references.

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

function CategoryIcon({
  category, size, color, style,
}: { category: RiskCategory } & IconProps) {
  switch (category) {
    case "Géopolitique":  return <Globe2 size={size} color={color} style={style} />;
    case "Réglementaire": return <Scale size={size} color={color} style={style} />;
    case "Réputationnel": return <Newspaper size={size} color={color} style={style} />;
    case "Opérationnel":  return <Factory size={size} color={color} style={style} />;
    case "ESG":           return <Leaf size={size} color={color} style={style} />;
  }
}

/**
 * Render a Lucide icon for a risk trajectory (rising / stable /
 * falling). Same pattern as CategoryIcon — stable component, no
 * per-render component creation.
 */
function TrajectoryIconComponent({
  trajectory, size, style,
}: { trajectory: RiskRow["trajectory"] } & IconProps) {
  switch (trajectory) {
    case "rising":  return <TrendingUp size={size} style={style} />;
    case "falling": return <TrendingDown size={size} style={style} />;
    case "stable":  return <Minus size={size} style={style} />;
  }
}

// ─── Sections reveal cadence (BriefingGenerator pattern) ──────
const SECTIONS = [
  { id: "header",   delay: 200 },
  { id: "summary",  delay: 400 },
  { id: "matrix",   delay: 600 },
  { id: "legend",   delay: 900 },
  { id: "details",  delay: 1100 },
  { id: "actions",  delay: 1300 },
];

// ─── Component ─────────────────────────────────────────────────

export function RiskHeatmapGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RiskHeatmapData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const gridRef = useRef<HTMLDivElement | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleSections(new Set());
    setGenerating(true);
    setHovered(null);
    setSelected(null);
    setCopied(false);
    try {
      const res = await fetch("/api/console/risk-heatmap", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as RiskHeatmapData;
      setData(json);
      setLoading(false);
      // Reveal sections one-by-one (BriefingGenerator pattern).
      for (const section of SECTIONS) {
        setTimeout(() => {
          setVisibleSections((prev) => new Set(prev).add(section.id));
          if (section.id === "actions") setGenerating(false);
        }, section.delay);
      }
      // Auto-select the highest-severity risk so the detail panel
      // is never empty on first paint.
      const topIdx = json.risks
        .map((r, i) => ({ r, i }))
        .sort(
          (a, b) =>
            b.r.probability * b.r.impact - a.r.probability * a.r.impact,
        )[0]?.i;
      if (topIdx != null) setSelected(topIdx);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false);
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    void generate();
  }, [generate]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
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

  // ─── Render ────────────────────────────────────────────────
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
          width: "100%", maxWidth: 920, maxHeight: "92vh",
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
            <ShieldAlert size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14, fontWeight: 700, color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Matrice des Risques
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
            flex: 1, overflowY: "auto", padding: "28px 36px",
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
                Collecte des risques et signaux corrélés en cours...
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
            <div id="risk-heatmap-document">
              <AnimatePresence>
                {visibleSections.has("header") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 20 }}
                  >
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                      }}
                    >
                      <CalendarClock size={14} style={{ color: SAGE }} />
                      <span
                        style={{
                          fontSize: 11, fontFamily: "'Space Mono', monospace",
                          color: SAGE, textTransform: "uppercase",
                          letterSpacing: "0.08em", fontWeight: 700,
                        }}
                      >
                        Cartographie des risques · Fenêtre {data.meta.windowDays}j
                      </span>
                    </div>
                    <h1
                      style={{
                        fontSize: 26, fontWeight: 700, margin: 0, color: CHARCOAL,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Matrice Probabilité × Impact — {data.meta.companyName}
                    </h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                      {data.meta.sector ? `Secteur ${data.meta.sector} · ` : ""}
                      {data.risks.length} catégories stratégiques · Notation 1 à 5 sur chaque axe
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("summary") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24,
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 8,
                    }}
                  >
                    <SummaryStat
                      label="Risques totaux"
                      value={String(data.summary.total)}
                      color={CHARCOAL}
                    />
                    <SummaryStat
                      label="Critiques"
                      value={String(data.summary.critical)}
                      color={data.summary.critical > 0 ? RED : TEXT_MUTED}
                    />
                    <SummaryStat
                      label="Élevés"
                      value={String(data.summary.high)}
                      color={data.summary.high > 0 ? AMBER : TEXT_MUTED}
                    />
                    <SummaryStat
                      label="Score moyen"
                      value={data.summary.avgScore.toFixed(1)}
                      suffix="/ 25"
                      color={SAGE}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("matrix") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 20,
                      padding: 20,
                      background: "#FAFAFA",
                      borderRadius: 12,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED, textTransform: "uppercase",
                          letterSpacing: "0.1em", fontWeight: 700,
                        }}
                      >
                        Probabilité × Impact
                      </span>
                      <span style={{ fontSize: 11, color: TEXT_MUTED }}>
                        Cliquez un point pour la fiche détaillée
                      </span>
                    </div>

                    {/* Grid wrapper — Y axis label on the left,
                        grid in the middle, X axis label on the right. */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "24px 1fr",
                        gridTemplateRows: "1fr 24px",
                        gap: 8,
                      }}
                    >
                      {/* Y axis label (rotated, vertical) */}
                      <div
                        style={{
                          gridColumn: 1, gridRow: 1,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED, textTransform: "uppercase",
                          letterSpacing: "0.1em", fontWeight: 700,
                          writingMode: "vertical-rl", transform: "rotate(180deg)",
                        }}
                      >
                        Impact
                      </div>

                      {/* The 5×5 grid + dots overlay */}
                      <div
                        ref={gridRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          gridColumn: 2, gridRow: 1, position: "relative",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gridTemplateRows: "repeat(5, 1fr)",
                            gap: 4,
                            aspectRatio: "5 / 5",
                            width: "100%",
                          }}
                        >
                          {/* Render 25 cells. Row index 0 = Impact 5 (top),
                              row index 4 = Impact 1 (bottom). */}
                          {Array.from({ length: 5 }).map((_, rowIdx) => {
                            const impact = 5 - rowIdx; // 5..1
                            return Array.from({ length: 5 }).map((_, colIdx) => {
                              const probability = colIdx + 1; // 1..5
                              const score = probability * impact;
                              const sev = severityForScore(score);
                              const cellKey = `${impact}-${probability}`;
                              return (
                                <div
                                  key={cellKey}
                                  style={{
                                    background: cellBgForSeverity(sev),
                                    border: `1px solid ${cellBorderForSeverity(sev)}`,
                                    borderRadius: 6,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 10,
                                    fontFamily: "'Space Mono', monospace",
                                    color: TEXT_MUTED,
                                    position: "relative",
                                    transition: "transform 120ms ease",
                                  }}
                                  title={`P=${probability} · I=${impact} · ${SEVERITY_LABEL[sev]}`}
                                >
                                  <span style={{ opacity: 0.6 }}>{score}</span>
                                </div>
                              );
                            });
                          })}
                        </div>

                        {/* Dots overlay — absolutely positioned at the
                            centre of each risk's [probability, impact]
                            cell. Multiple risks landing on the same cell
                            are stacked with a small offset. */}
                        <div
                          style={{
                            position: "absolute", inset: 0,
                            pointerEvents: "none",
                          }}
                        >
                          {/* Group risks by cell so we can offset siblings */}
                          {groupRisksByCell(data.risks).map(
                            ({ probability, impact, items }) => {
                              // Cell centre fractions (probability 1..5 →
                              // 10%, 30%, 50%, 70%, 90%; same for impact
                              // but impact is plotted bottom→top so flip).
                              const xPct = ((probability - 0.5) / 5) * 100;
                              const yPct = ((5.5 - impact) / 5) * 100;
                              return items.map((entry) => {
                                const { risk, idx, offset } = entry;
                                const dotColor = dotColorForSeverity(risk.severity);
                                const isHovered = hovered === idx;
                                const isSelected = selected === idx;
                                const iconSize = isHovered || isSelected ? 18 : 15;
                                return (
                                  <motion.button
                                    key={risk.id}
                                    initial={{ opacity: 0, scale: 0.4 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                      delay: 0.6 + idx * 0.08,
                                      type: "spring", stiffness: 320, damping: 22,
                                    }}
                                    onMouseEnter={() => setHovered(idx)}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelected(idx);
                                    }}
                                    style={{
                                      position: "absolute",
                                      left: `calc(${xPct}% + ${offset.x}px)`,
                                      top: `calc(${yPct}% + ${offset.y}px)`,
                                      transform: "translate(-50%, -50%)",
                                      width: isHovered || isSelected ? 36 : 30,
                                      height: isHovered || isSelected ? 36 : 30,
                                      borderRadius: "50%",
                                      background: WHITE,
                                      border: `2px solid ${dotColor}`,
                                      boxShadow: isSelected
                                        ? `0 0 0 4px ${dotColor}33, 0 4px 12px rgba(0,0,0,0.15)`
                                        : isHovered
                                          ? `0 0 0 2px ${dotColor}22, 0 4px 10px rgba(0,0,0,0.12)`
                                          : "0 2px 6px rgba(0,0,0,0.10)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      padding: 0,
                                      pointerEvents: "auto",
                                      transition:
                                        "width 140ms ease, height 140ms ease, box-shadow 140ms ease",
                                    }}
                                    aria-label={`Risque ${risk.category}`}
                                  >
                                    <CategoryIcon
                                      category={risk.category}
                                      size={iconSize}
                                      color={dotColor}
                                    />
                                  </motion.button>
                                );
                              });
                            },
                          )}
                        </div>

                        {/* Tooltip */}
                        {hovered != null && data.risks[hovered] && (
                          <RiskTooltip
                            risk={data.risks[hovered]}
                            x={mousePos.x}
                            y={mousePos.y}
                          />
                        )}
                      </div>

                      {/* Bottom-left corner spacer */}
                      <div style={{ gridColumn: 1, gridRow: 2 }} />

                      {/* X axis label */}
                      <div
                        style={{
                          gridColumn: 2, gridRow: 2,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED, textTransform: "uppercase",
                          letterSpacing: "0.1em", fontWeight: 700,
                        }}
                      >
                        Probabilité
                      </div>
                    </div>

                    {/* Axis tick labels (1..5 on each side) */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "24px 1fr",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      {/* Y ticks: 5..1 top→bottom */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateRows: "repeat(5, 1fr)",
                          gap: 4,
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED, textAlign: "center",
                        }}
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <div
                            key={n}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            {n}
                          </div>
                        ))}
                      </div>
                      {/* X ticks: 1..5 left→right */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(5, 1fr)",
                          gap: 4,
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED, textAlign: "center",
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div key={n} style={{ textAlign: "center" }}>{n}</div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("legend") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24,
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <LegendChip color={SAGE_BG} border={SAGE_BORDER} label="Faible" hint="1-5" />
                    <LegendChip color={AMBER_BG} border="rgba(245,158,11,0.15)" label="Modéré" hint="6-11" />
                    <LegendChip color={AMBER_BG_STRONG} border={AMBER_BORDER} label="Élevé" hint="12-19" />
                    <LegendChip color={RED_BG_STRONG} border={RED_BORDER} label="Critique" hint="20-25" />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("details") && selected != null && data.risks[selected] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{ marginBottom: 24 }}
                  >
                    <RiskDetailCard risk={data.risks[selected]} />
                  </motion.div>
                )}
              </AnimatePresence>

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
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 20px", background: CHARCOAL,
                        color: WHITE, border: "none", borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        fontFamily: "inherit",
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
          #risk-heatmap-document, #risk-heatmap-document * {
            visibility: visible;
          }
          #risk-heatmap-document {
            position: absolute; left: 0; top: 0; width: 100%; padding: 40px;
          }
          #risk-heatmap-document button { display: none !important; }
          #risk-heatmap-document { background: ${WHITE} !important; }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════

function SummaryStat({
  label, value, color, suffix,
}: {
  label: string;
  value: string;
  color: string;
  suffix?: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: WHITE,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>
          {value}
        </span>
        {suffix && (
          <span style={{ fontSize: 11, color: TEXT_MUTED }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function LegendChip({
  color, border, label, hint,
}: {
  color: string;
  border: string;
  label: string;
  hint: string;
}) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px", background: WHITE,
        border: `1px solid ${BORDER}`, borderRadius: 6,
      }}
    >
      <span
        style={{
          width: 14, height: 14, borderRadius: 4,
          background: color, border: `1px solid ${border}`,
          display: "inline-block",
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
        }}
      >
        {hint}
      </span>
    </div>
  );
}

function RiskTooltip({
  risk, x, y,
}: {
  risk: RiskRow;
  x: number;
  y: number;
}) {
  // Tooltip is positioned relative to the grid wrapper. We flip
  // above/right when the cursor is near the right or bottom edge so
  // it never gets clipped.
  const dotColor = dotColorForSeverity(risk.severity);
  const flipX = x > 360;
  const flipY = y > 220;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${flipX ? "-105%" : "12px"}, ${flipY ? "-105%" : "12px"})`,
        maxWidth: 240,
        padding: "10px 12px",
        background: CHARCOAL,
        color: WHITE,
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.20)",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
        }}
      >
        <CategoryIcon category={risk.category} size={13} color={dotColor} />
        <span
          style={{
            fontSize: 12, fontWeight: 700, color: WHITE,
          }}
        >
          {risk.category}
        </span>
        <span
          style={{
            marginLeft: "auto", fontSize: 9, fontWeight: 700,
            fontFamily: "'Space Mono', monospace", textTransform: "uppercase",
            letterSpacing: "0.08em", color: dotColor,
          }}
        >
          {SEVERITY_LABEL[risk.severity]}
        </span>
      </div>
      <div
        style={{
          fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.4,
        }}
      >
        P = {risk.probability}/5 · I = {risk.impact}/5 · score {risk.probability * risk.impact}
      </div>
      <div
        style={{
          marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.85)",
          lineHeight: 1.4,
        }}
      >
        {risk.label}
      </div>
      <div
        style={{
          marginTop: 6, display: "flex", alignItems: "center", gap: 4,
          fontSize: 10, color: "rgba(255,255,255,0.55)",
        }}
      >
        <ChevronRight size={11} /> Cliquer pour la fiche détaillée
      </div>
    </div>
  );
}

function RiskDetailCard({ risk }: { risk: RiskRow }) {
  const dotColor = dotColorForSeverity(risk.severity);
  const trajectoryLabel =
    risk.trajectory === "rising"
      ? "En hausse"
      : risk.trajectory === "falling"
        ? "En baisse"
        : "Stable";
  const trajectoryColor =
    risk.trajectory === "rising"
      ? RED
      : risk.trajectory === "falling"
        ? SAGE
        : TEXT_MUTED;

  return (
    <div
      style={{
        padding: 20,
        background: WHITE,
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: cellBgForSeverity(risk.severity),
            border: `1px solid ${cellBorderForSeverity(risk.severity)}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <CategoryIcon category={risk.category} size={16} color={dotColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
              {risk.category}
            </span>
            <span
              style={{
                padding: "2px 8px", borderRadius: 4,
                background: cellBgForSeverity(risk.severity),
                color: dotColor, fontSize: 10, fontWeight: 700,
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}
            >
              {SEVERITY_LABEL[risk.severity]}
            </span>
          </div>
          <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>
            {risk.label}
          </div>
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 11, color: trajectoryColor, fontWeight: 600,
          }}
        >
          <TrajectoryIconComponent trajectory={risk.trajectory} size={13} />
          {trajectoryLabel}
        </div>
      </div>

      {/* Probability × Impact mini-bars */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16,
        }}
      >
        <AxisBar label="Probabilité" value={risk.probability} max={5} color={SAGE} />
        <AxisBar label="Impact" value={risk.impact} max={5} color={dotColor} />
      </div>

      {/* Meta grid: owner, deadline, last event, article count */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16,
        }}
      >
        <MetaRow
          icon={<UserSquare2 size={11} style={{ color: TEXT_MUTED }} />}
          label="Responsable"
          value={risk.owner}
        />
        <MetaRow
          icon={<CalendarClock size={11} style={{ color: TEXT_MUTED }} />}
          label="Échéance"
          value={formatDate(risk.deadline)}
        />
        <MetaRow
          icon={<FileText size={11} style={{ color: TEXT_MUTED }} />}
          label="Dernier signal"
          value={formatDate(risk.lastEvent)}
        />
        <MetaRow
          icon={<Newspaper size={11} style={{ color: TEXT_MUTED }} />}
          label="Articles corrélés"
          value={String(risk.articleCount)}
        />
      </div>

      {/* Mitigation */}
      <div
        style={{
          padding: 14, background: SAGE_BG, borderRadius: 8,
          border: `1px solid ${SAGE_BORDER}`,
        }}
      >
        <div
          style={{
            display: "flex", alignItems: "center", gap: 6, marginBottom: 6,
          }}
        >
          <ShieldAlert size={13} style={{ color: SAGE }} />
          <span
            style={{
              fontSize: 10, fontFamily: "'Space Mono', monospace", color: SAGE,
              textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
            }}
          >
            Plan d'atténuation
          </span>
        </div>
        <p
          style={{
            fontSize: 13, color: CHARCOAL, lineHeight: 1.6, margin: 0,
          }}
        >
          {risk.mitigation}
        </p>
      </div>
    </div>
  );
}

function AxisBar({
  label, value, max, color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
            textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 11, color: CHARCOAL, fontWeight: 600 }}>
          {value} / {max}
        </span>
      </div>
      <div
        style={{
          display: "flex", gap: 3,
        }}
      >
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 6, borderRadius: 2,
              background: i < value ? color : CHARCOAL_BG,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MetaRow({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "#FAFAFA",
        borderRadius: 8,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          display: "flex", alignItems: "center", gap: 5, marginBottom: 4,
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
            textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ fontSize: 12, color: CHARCOAL, fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════════

interface GroupedRisk {
  risk: RiskRow;
  idx: number;
  offset: { x: number; y: number };
}

interface GroupedCell {
  probability: number;
  impact: number;
  items: GroupedRisk[];
}

/**
 * Group risks that share the same [probability, impact] cell so we
 * can offset siblings rather than perfectly overlap them. The first
 * risk in a cell sits at the centre; each subsequent risk is nudged
 * by ~14px around the centre in a small clockwise fan.
 */
function groupRisksByCell(risks: RiskRow[]): GroupedCell[] {
  const map = new Map<string, GroupedCell>();
  risks.forEach((risk, idx) => {
    const key = `${risk.probability}-${risk.impact}`;
    if (!map.has(key)) {
      map.set(key, {
        probability: risk.probability,
        impact: risk.impact,
        items: [],
      });
    }
    map.get(key)!.items.push({ risk, idx, offset: { x: 0, y: 0 } });
  });
  // Apply per-cell offsets.
  const fan = [
    { x: 0, y: 0 },
    { x: 14, y: -10 },
    { x: -14, y: -10 },
    { x: 14, y: 10 },
    { x: -14, y: 10 },
    { x: 0, y: -18 },
    { x: 0, y: 18 },
  ];
  for (const cell of map.values()) {
    cell.items.forEach((item, i) => {
      item.offset = fan[i % fan.length];
    });
  }
  return Array.from(map.values());
}

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

function renderPlainText(d: RiskHeatmapData): string {
  const lines: string[] = [];
  lines.push(`MATRICE DES RISQUES — ${d.meta.companyName}`);
  lines.push(`Secteur: ${d.meta.sector ?? "—"} · Fenêtre: ${d.meta.windowDays}j`);
  lines.push(`Généré le: ${new Date(d.meta.generatedAt).toLocaleString("fr-FR")}`);
  lines.push("");
  lines.push("─ SYNTHÈSE ─");
  lines.push(`Risques totaux: ${d.summary.total}`);
  lines.push(`Critiques: ${d.summary.critical} · Élevés: ${d.summary.high} · Modérés: ${d.summary.medium} · Faibles: ${d.summary.low}`);
  lines.push(`Score moyen: ${d.summary.avgScore.toFixed(1)} / 25`);
  lines.push("");
  lines.push("─ MATRICE PROBABILITÉ × IMPACT ─");
  for (const r of d.risks) {
    const score = r.probability * r.impact;
    lines.push(`• ${r.category} [${SEVERITY_LABEL[r.severity]}] — score ${score}`);
    lines.push(`  ${r.label}`);
    lines.push(`  Probabilité: ${r.probability}/5 · Impact: ${r.impact}/5`);
    lines.push(`  Responsable: ${r.owner}`);
    lines.push(`  Échéance: ${formatDate(r.deadline)}`);
    lines.push(`  Dernier signal: ${formatDate(r.lastEvent)}`);
    lines.push(`  Articles corrélés: ${r.articleCount}`);
    lines.push(`  Trajectoire: ${r.trajectory}`);
    lines.push(`  Atténuation: ${r.mitigation}`);
    lines.push("");
  }
  lines.push(`Généré par HarchIQ — ${d.meta.generatedAt}`);
  return lines.join("\n");
}

"use client";

// ═══════════════════════════════════════════════════════════════
//  <CompetitorMatrixGenerator />
//
//  Skill 3 — Competitor Matrix.
//  Visual 5×5 comparison grid (NOT a table): rows = metrics,
//  cols = companies (you + 4 competitors). Color-coded cells:
//    sage  = you win on this axis vs this competitor
//    amber = tie (within ±5 pts tolerance)
//    red   = you lose
//
//  Pattern: same fixed-overlay popup as BriefingGenerator —
//  sections appear one by one (header → matrix → legend →
//  summary → actions). Grid cells animate in via a diagonal
//  sweep (delay ∝ row + col).
//
//  Design system: White #FFFFFF bg, sage #4A7B5F accents,
//  charcoal #0A0A0A text, Space Mono headers, Inter body,
//  Lucide icons, NO emojis, French. framer-motion entrances.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle,
  RefreshCw, Grid3x3, Trophy,
} from "lucide-react";

const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.35)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const AMBER = "#F59E0B";
const AMBER_BG = "rgba(245,158,11,0.12)";
const AMBER_BORDER = "rgba(245,158,11,0.35)";
const RED = "#EF4444";
const RED_BG = "rgba(239,68,68,0.10)";
const RED_BORDER = "rgba(239,68,68,0.30)";

// Tolerance band (in points on a 0-100 scale) below which two
// companies are considered tied on a metric.
const TOLERANCE = 5;

interface CompetitorRow {
  name: string;
  score: number;
  sentiment: number;
  sov: number;
  aiVisibility: number;
  reach: number;
}

interface MatrixData {
  yourCompany: CompetitorRow;
  competitors: CompetitorRow[];
  meta?: { sector: string | null; generatedAt: string };
}

type MetricKey = "score" | "sentiment" | "sov" | "aiVisibility" | "reach";

const METRICS: Array<{ key: MetricKey; label: string; unit: string }> = [
  { key: "score", label: "Score", unit: "/100" },
  { key: "sentiment", label: "Sentiment", unit: "%" },
  { key: "sov", label: "Part de voix", unit: "%" },
  { key: "aiVisibility", label: "Visibilité IA", unit: "%" },
  { key: "reach", label: "Portée", unit: "/100" },
];

type CellStatus = "win" | "tie" | "lose" | "self";

const CELL_STYLE: Record<
  CellStatus,
  { bg: string; fg: string; border: string }
> = {
  win: { bg: SAGE_BG, fg: SAGE, border: SAGE_BORDER },
  tie: { bg: AMBER_BG, fg: AMBER, border: AMBER_BORDER },
  lose: { bg: RED_BG, fg: RED, border: RED_BORDER },
  self: { bg: "#FAFAFA", fg: CHARCOAL, border: BORDER },
};

function cellStatus(
  yourValue: number,
  theirValue: number,
  isYou: boolean,
): CellStatus {
  if (isYou) return "self";
  const diff = yourValue - theirValue;
  if (diff >= TOLERANCE) return "win";
  if (diff <= -TOLERANCE) return "lose";
  return "tie";
}

const SECTIONS = [
  { id: "header", delay: 150 },
  { id: "matrix", delay: 350 },
  { id: "legend", delay: 1400 },
  { id: "summary", delay: 1600 },
  { id: "actions", delay: 1800 },
];

export function CompetitorMatrixGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MatrixData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(),
  );
  const [generating, setGenerating] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleSections(new Set());
    setGenerating(true);
    setHoveredCell(null);
    try {
      const res = await fetch("/api/console/competitor-matrix", {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload: MatrixData = await res.json();
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

  // 5 columns = yourCompany + top 4 competitors (the route already
  // caps competitors at 4, but slice defensively in case of overshoot).
  const columns: Array<CompetitorRow & { isYou: boolean }> = data
    ? [
        { ...data.yourCompany, isYou: true },
        ...data.competitors.slice(0, 4).map((c) => ({ ...c, isYou: false })),
      ]
    : [];

  // Summary: how many of the 5 metrics your company leads outright
  // (your value ≥ every competitor's value on that axis).
  const winsCount = data
    ? METRICS.filter((m) => {
        const yourVal = data.yourCompany[m.key];
        const allVals = columns.map((c) => c[m.key]);
        const maxVal = Math.max(...allVals);
        return yourVal >= maxVal;
      }).length
    : 0;

  const summaryVerdict =
    winsCount >= 4
      ? "position dominante."
      : winsCount >= 3
        ? "avance solide."
        : winsCount >= 2
          ? "parité concurrentielle."
          : "retard à combler.";

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
        {/* Header bar */}
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
            <Grid3x3 size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Matrice Compétitive
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
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 40px",
            fontFamily: "'Inter', system-ui, sans-serif",
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
                Construction de la matrice...
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
            <div id="matrix-document">
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
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "'Space Mono', monospace",
                          color: SAGE,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Comparaison sectorielle · 30 jours
                      </span>
                    </div>
                    <h1
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        margin: 0,
                        color: CHARCOAL,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Matrice — {data.yourCompany.name}
                    </h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                      {data.meta?.sector
                        ? `Secteur : ${data.meta.sector}`
                        : "Secteur non précisé"}
                      {` · ${columns.length} entreprises comparées sur 5 axes`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("matrix") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    {/* Column headers */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `140px repeat(${columns.length}, 1fr)`,
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <div />
                      {columns.map((col, ci) => (
                        <motion.div
                          key={`col-${ci}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + ci * 0.05 }}
                          title={col.name}
                          style={{
                            textAlign: "center",
                            padding: "8px 6px",
                            fontSize: 12,
                            fontWeight: col.isYou ? 700 : 600,
                            color: col.isYou ? SAGE : CHARCOAL,
                            fontFamily: "'Space Mono', monospace",
                            borderBottom: col.isYou
                              ? `2px solid ${SAGE}`
                              : `1px solid ${BORDER}`,
                            background: col.isYou ? SAGE_BG : "transparent",
                            borderRadius: 4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {col.isYou ? "● " : ""}
                          {col.name}
                        </motion.div>
                      ))}
                    </div>

                    {/* 5 metric rows × 5 company columns */}
                    {METRICS.map((metric, ri) => {
                      const yourVal = data.yourCompany[metric.key];
                      return (
                        <div
                          key={metric.key}
                          style={{
                            display: "grid",
                            gridTemplateColumns: `140px repeat(${columns.length}, 1fr)`,
                            gap: 6,
                            marginBottom: 6,
                          }}
                        >
                          {/* Row label */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "0 8px",
                              fontSize: 11,
                              fontWeight: 600,
                              color: TEXT_BODY,
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {metric.label}
                            <span
                              style={{
                                marginLeft: 4,
                                fontSize: 10,
                                color: TEXT_MUTED,
                                fontFamily: "'Space Mono', monospace",
                              }}
                            >
                              {metric.unit}
                            </span>
                          </div>

                          {/* Cells */}
                          {columns.map((col, ci) => {
                            const val = col[metric.key];
                            const status = cellStatus(yourVal, val, col.isYou);
                            const style = CELL_STYLE[status];
                            // Diagonal sweep: delay grows with (row + col).
                            const delay = 0.15 + (ri + ci) * 0.06;
                            const isHovered =
                              hoveredCell?.row === ri &&
                              hoveredCell?.col === ci;
                            return (
                              <motion.div
                                key={`cell-${ri}-${ci}`}
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay, duration: 0.25 }}
                                onMouseEnter={() =>
                                  setHoveredCell({ row: ri, col: ci })
                                }
                                onMouseLeave={() => setHoveredCell(null)}
                                style={{
                                  position: "relative",
                                  padding: "14px 8px",
                                  textAlign: "center",
                                  background: style.bg,
                                  color: style.fg,
                                  border: `1px solid ${style.border}`,
                                  borderRadius: 6,
                                  cursor: "default",
                                  outline: isHovered
                                    ? `2px solid ${style.fg}`
                                    : "none",
                                  outlineOffset: 1,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    fontFamily: "'Space Mono', monospace",
                                  }}
                                >
                                  {val}
                                </span>

                                {/* Tooltip with exact values */}
                                {isHovered && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                      position: "absolute",
                                      bottom: "100%",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      marginBottom: 6,
                                      padding: "6px 10px",
                                      background: CHARCOAL,
                                      color: "#FFFFFF",
                                      fontSize: 11,
                                      borderRadius: 4,
                                      whiteSpace: "nowrap",
                                      pointerEvents: "none",
                                      zIndex: 10,
                                      fontFamily: "'Space Mono', monospace",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                    }}
                                  >
                                    {col.isYou ? (
                                      <span>
                                        {col.name} : {val}
                                        {metric.unit}
                                      </span>
                                    ) : (
                                      <span>
                                        {col.name} : {val}
                                        {metric.unit} · Vous : {yourVal}
                                        {metric.unit} · Δ{" "}
                                        {val > yourVal ? "+" : ""}
                                        {val - yourVal}
                                      </span>
                                    )}
                                  </motion.div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("legend") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 20,
                      display: "flex",
                      gap: 16,
                      fontSize: 11,
                      color: TEXT_MUTED,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          background: SAGE_BG,
                          border: `1px solid ${SAGE_BORDER}`,
                          borderRadius: 3,
                        }}
                      />
                      Vous gagnez
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          background: AMBER_BG,
                          border: `1px solid ${AMBER_BORDER}`,
                          borderRadius: 3,
                        }}
                      />
                      Égalité (±{TOLERANCE} pts)
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          background: RED_BG,
                          border: `1px solid ${RED_BORDER}`,
                          borderRadius: 3,
                        }}
                      />
                      Vous perdez
                    </span>
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
                      padding: 16,
                      background: SAGE_BG,
                      borderRadius: 8,
                      border: "1px solid rgba(74,123,95,0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Trophy size={20} style={{ color: SAGE }} />
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: "'Space Mono', monospace",
                          color: SAGE,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontWeight: 700,
                        }}
                      >
                        Synthèse
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          color: CHARCOAL,
                          margin: 0,
                          marginTop: 2,
                        }}
                      >
                        {`Vous gagnez sur `}
                        <span style={{ fontWeight: 700, color: SAGE }}>
                          {`${winsCount}/5 axes`}
                        </span>
                        {` — ${summaryVerdict}`}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                    Calcul des écarts...
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } @media print { body * { visibility: hidden; } #matrix-document, #matrix-document * { visibility: visible; } #matrix-document { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; } }`}</style>
    </div>
  );
}

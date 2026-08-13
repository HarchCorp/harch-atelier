"use client";

// ═══════════════════════════════════════════════════════════════
//  EsgScorecardGenerator
//
//  Skill 18 — Tableau de bord ESG.
//  3 piliers (Environnemental / Social / Gouvernance) × 4
//  sous-métriques chacun, radar 3 axes, benchmark sectoriel,
//  recommandation stratégique HarchIQ.
//
//  Même motif de popup que BriefingGenerator :
//    • overlay fixe avec backdrop blur
//    • entrée en scale (framer-motion)
//    • sections révélées une à une (AnimatePresence)
//    • barre d'actions : Export PDF (window.print) · Régénérer
//    • CSS print isolant #esg-document
//
//  Palette : Blanc / Sage / Charcoal — outil stratégique, pas crise.
//  Typographie : Space Mono (labels techniques), Inter (corps).
//  Icônes : Lucide. Aucun emoji.
//
//  Structure du corps :
//    a. En-tête — date + entreprise + secteur
//    b. Bande synthèse — Score global / Benchmark / Secteur / Tendance
//    c. Radar 3 axes (SVG inline) — polygone score + polygone benchmark
//    d. 3 cartes piliers (E/S/G) avec jauge circulaire + tendance +
//       sous-métriques repliables (12 barres au total, marqueur
//       benchmark sur chaque barre)
//    e. Encart recommandation HarchIQ
//    f. Actions — Export PDF · Régénérer
//
//  Skill ID : SKILL-18-ESG
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  Leaf, Users, Scale, TrendingUp, TrendingDown, Minus,
  ChevronDown, Calendar, Target,
} from "lucide-react";

// ─── Design tokens (non négociables) ──────────────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BG_STRONG = "rgba(74,123,95,0.16)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const AMBER = "#F59E0B";
const AMBER_BG = "rgba(245,158,11,0.10)";
const AMBER_BORDER = "rgba(245,158,11,0.30)";
const RED = "#DC2626";
const RED_BG = "rgba(220,38,38,0.08)";
const RED_BORDER = "rgba(220,38,38,0.25)";
const POSITIVE = "#10B981";

// ─── Types — miroir de EsgScorecardResponse (route.ts) ────────

type EsgPillarName = "Environnemental" | "Social" | "Gouvernance";

interface EsgSubMetric {
  name: string;
  score: number;        // 0-100
  benchmark: number;    // 0-100
}

interface EsgPillar {
  name: EsgPillarName;
  score: number;        // 0-100
  trend: number;        // -10..+10
  subMetrics: EsgSubMetric[];
}

interface EsgScorecardData {
  pillars: EsgPillar[];
  overallScore: number;
  benchmarkSector: string;
  recommendation: string;
  meta: {
    companyName: string;
    sector: string;
    generatedAt: string;
    windowDays: number;
    source: "real" | "demo";
  };
}

// ─── Couleur de score (4 paliers) ─────────────────────────────
//
// ≥ 75 : sage (solide)
// ≥ 60 : charcoal neutre (correct)
// ≥ 45 : amber (vigilance)
// < 45 : red (fragile)
function colorForScore(n: number): string {
  if (n >= 75) return SAGE;
  if (n >= 60) return CHARCOAL;
  if (n >= 45) return AMBER;
  return RED;
}

function bgForScore(n: number): string {
  if (n >= 75) return SAGE_BG;
  if (n >= 60) return "rgba(10,10,10,0.04)";
  if (n >= 45) return AMBER_BG;
  return RED_BG;
}

function borderForScore(n: number): string {
  if (n >= 75) return SAGE_BORDER;
  if (n >= 60) return BORDER;
  if (n >= 45) return AMBER_BORDER;
  return RED_BORDER;
}

// ─── Icône par pilier (Lucide, stable, sans emoji) ───────────
//
// Composant unique qui switch sur le nom du pilier — évite la
// règle lint react-hooks/static-components qui se déclenche quand
// une variable capitalisée est assignée dans un corps de fonction.
function PillarIcon({
  name, size, color, style,
}: { name: EsgPillarName } & {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  switch (name) {
    case "Environnemental": return <Leaf size={size} color={color} style={style} />;
    case "Social":           return <Users size={size} color={color} style={style} />;
    case "Gouvernance":      return <Scale size={size} color={color} style={style} />;
  }
}

// ─── Icône de tendance (↑ / ↓ / —) ───────────────────────────
function TrendIcon({
  trend, size, style,
}: { trend: number } & {
  size?: number;
  style?: React.CSSProperties;
}) {
  if (trend > 0) return <TrendingUp size={size} style={style} />;
  if (trend < 0) return <TrendingDown size={size} style={style} />;
  return <Minus size={size} style={style} />;
}

// ─── Cadence de révélation des sections (motif BriefingGenerator)
const SECTIONS = [
  { id: "header",      delay: 200 },
  { id: "summary",     delay: 400 },
  { id: "radar",       delay: 600 },
  { id: "pillars",     delay: 850 },
  { id: "recommend",   delay: 1100 },
  { id: "actions",     delay: 1300 },
];

// ═══════════════════════════════════════════════════════════════
//  Composant principal
// ═══════════════════════════════════════════════════════════════

export function EsgScorecardGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EsgScorecardData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);
  // Sous-métriques repliables par pilier. Par défaut : tous dépliés
  // pour que l'analyste voie les 12 barres dès la première peinture.
  const [expanded, setExpanded] = useState<Record<EsgPillarName, boolean>>({
    Environnemental: true,
    Social: true,
    Gouvernance: true,
  });

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleSections(new Set());
    setGenerating(true);
    try {
      const res = await fetch("/api/console/esg-scorecard", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as EsgScorecardData;
      setData(json);
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

  function togglePillar(name: EsgPillarName) {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
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
          width: "100%", maxWidth: 960, maxHeight: "92vh",
          background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Barre d'en-tête ─── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Leaf size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14, fontWeight: 700, color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Tableau ESG
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
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Corps du document ─── */}
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
                Collecte des signaux ESG (articles, commentaires, risques, régulateurs)...
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
            <div id="esg-document">
              {/* ─── A. En-tête ─── */}
              <AnimatePresence>
                {visibleSections.has("header") && (
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
                      <Calendar size={14} style={{ color: SAGE }} />
                      <span
                        style={{
                          fontSize: 11, fontFamily: "'Space Mono', monospace",
                          color: SAGE, textTransform: "uppercase",
                          letterSpacing: "0.08em", fontWeight: 700,
                        }}
                      >
                        Évaluation ESG · Fenêtre {data.meta.windowDays}j
                      </span>
                    </div>
                    <h1
                      style={{
                        fontSize: 26, fontWeight: 700, margin: 0, color: CHARCOAL,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Tableau de Bord ESG — {data.meta.companyName}
                    </h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                      Secteur : {data.benchmarkSector} · 3 piliers · 12 sous-métriques · Benchmark sectoriel intégré
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── B. Bande synthèse ─── */}
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
                      label="Score ESG global"
                      value={String(data.overallScore)}
                      suffix="/ 100"
                      color={colorForScore(data.overallScore)}
                    />
                    <SummaryStat
                      label="Benchmark secteur"
                      value={String(overallBenchmark(data))}
                      suffix="/ 100"
                      color={TEXT_MUTED}
                    />
                    <SummaryStat
                      label="Écart vs secteur"
                      value={(data.overallScore - overallBenchmark(data) >= 0 ? "+" : "") + (data.overallScore - overallBenchmark(data))}
                      suffix="pts"
                      color={data.overallScore - overallBenchmark(data) >= 0 ? POSITIVE : RED}
                    />
                    <SummaryStat
                      label="Tendance moyenne"
                      value={(avgTrend(data) >= 0 ? "+" : "") + avgTrend(data)}
                      suffix="pts"
                      color={avgTrend(data) > 0 ? POSITIVE : avgTrend(data) < 0 ? RED : TEXT_MUTED}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── C. Radar 3 axes ─── */}
              <AnimatePresence>
                {visibleSections.has("radar") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24, padding: 20, background: "#FAFAFA",
                      borderRadius: 12, border: `1px solid ${BORDER}`,
                      display: "flex", gap: 20, alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <RadarChart data={data} />
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div
                        style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED, textTransform: "uppercase",
                          letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10,
                        }}
                      >
                        Légende du radar
                      </div>
                      <LegendRow
                        color={SAGE}
                        label={data.meta.companyName}
                        sublabel="Votre score"
                        filled
                      />
                      <LegendRow
                        color={CHARCOAL}
                        label={`Benchmark ${data.benchmarkSector}`}
                        sublabel="Moyenne sectorielle"
                        dashed
                      />
                      <div
                        style={{
                          marginTop: 12, paddingTop: 12,
                          borderTop: `1px solid ${BORDER}`,
                          fontSize: 12, color: TEXT_BODY, lineHeight: 1.5,
                        }}
                      >
                        Le polygone sage représente votre performance par pilier. Le polygone
                        charbon pointillé représente la moyenne sectorielle. Plus le
                        polygone sage s'étend vers l'extérieur, plus votre performance ESG
                        est solide.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── D. Cartes piliers (E/S/G) ─── */}
              <AnimatePresence>
                {visibleSections.has("pillars") && (
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
                    {data.pillars.map((pillar) => (
                      <PillarCard
                        key={pillar.name}
                        pillar={pillar}
                        expanded={expanded[pillar.name]}
                        onToggle={() => togglePillar(pillar.name)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── E. Recommandation ─── */}
              <AnimatePresence>
                {visibleSections.has("recommend") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24, padding: 16, background: SAGE_BG,
                      borderRadius: 8, border: "1px solid rgba(74,123,95,0.20)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
                      }}
                    >
                      <Target size={14} style={{ color: SAGE }} />
                      <span
                        style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: SAGE, textTransform: "uppercase",
                          letterSpacing: "0.1em", fontWeight: 700,
                        }}
                      >
                        Recommandation HarchIQ
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 14, color: CHARCOAL, lineHeight: 1.6, margin: 0,
                      }}
                    >
                      {data.recommendation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── F. Actions ─── */}
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
                        padding: "10px 20px", background: CHARCOAL, color: WHITE,
                        border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <Download size={14} /> Exporter PDF
                    </button>
                    <button
                      onClick={generate}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 16px", background: "transparent",
                        color: TEXT_BODY, border: `1px solid ${BORDER}`,
                        borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
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
                    Rédaction en cours...
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── CSS : animations + impression ─── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media print {
          body * { visibility: hidden; }
          #esg-document, #esg-document * { visibility: visible; }
          #esg-document {
            position: absolute; left: 0; top: 0;
            width: 100%; padding: 40px;
          }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Sous-composants
// ═══════════════════════════════════════════════════════════════

// ─── Stat synthétique (bande du haut) ─────────────────────────
function SummaryStat({
  label, value, suffix, color,
}: {
  label: string;
  value: string;
  suffix?: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px", background: "#FAFAFA", borderRadius: 8,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>
          {value}
        </span>
        {suffix && (
          <span style={{ fontSize: 11, color: TEXT_MUTED }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── Radar 3 axes (SVG inline) ────────────────────────────────
//
// SVG 360x320. Centre (180, 160). Rayon max 110.
// 3 axes à -90° (haut, E), 30° (bas-droite, S), 150° (bas-gauche, G).
// 4 anneaux de référence (25/50/75/100).
// Polygone score (sage rempli) + polygone benchmark (charbon pointillé).
function RadarChart({ data }: { data: EsgScorecardData }) {
  const size = 360;
  const cx = 180;
  const cy = 160;
  const maxR = 110;

  // Angles des 3 axes (en radians, coordonnées SVG — y vers le bas).
  const angles = [
    -Math.PI / 2,           // -90° → haut → Environnemental
    Math.PI / 6,            //  30° → bas-droite → Social
    (5 * Math.PI) / 6,      // 150° → bas-gauche → Gouvernance
  ];

  // Points du polygone score
  const scorePts = data.pillars.map((p, i) => {
    const r = (p.score / 100) * maxR;
    return {
      x: cx + r * Math.cos(angles[i]),
      y: cy + r * Math.sin(angles[i]),
    };
  });

  // Points du polygone benchmark (moyenne des 4 sous-métriques benchmark
  // de chaque pilier — == benchmark du pilier tel que renvoyé par l'API).
  const benchPts = data.pillars.map((p, i) => {
    const bench = p.subMetrics.length > 0
      ? p.subMetrics.reduce((s, m) => s + m.benchmark, 0) / p.subMetrics.length
      : 60;
    const r = (bench / 100) * maxR;
    return {
      x: cx + r * Math.cos(angles[i]),
      y: cy + r * Math.sin(angles[i]),
    };
  });

  const scorePolyStr = scorePts.map((p) => `${p.x},${p.y}`).join(" ");
  const benchPolyStr = benchPts.map((p) => `${p.x},${p.y}`).join(" ");

  // Étiquettes des axes (positionnées légèrement au-delà du rayon max).
  const labels = data.pillars.map((p, i) => {
    const r = maxR + 28;
    const x = cx + r * Math.cos(angles[i]);
    const y = cy + r * Math.sin(angles[i]);
    return { x, y, name: p.name, score: p.score };
  });

  return (
    <svg
      width={size}
      height={size - 40}
      viewBox={`0 0 ${size} ${size - 40}`}
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Anneaux de référence (25, 50, 75, 100) */}
      {[25, 50, 75, 100].map((v) => {
        const r = (v / 100) * maxR;
        // Triangle reliant les 3 sommets à ce niveau — on dessine un
        // triangle dont les sommets sont aux 3 angles, à la distance r.
        const pts = angles.map((a) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`).join(" ");
        return (
          <polygon
            key={v}
            points={pts}
            fill="none"
            stroke="#E5E5E5"
            strokeWidth={1}
            strokeDasharray={v === 100 ? "none" : "2,3"}
          />
        );
      })}

      {/* Axes radiaux (du centre vers chaque sommet) */}
      {angles.map((a, i) => {
        const x = cx + maxR * Math.cos(a);
        const y = cy + maxR * Math.sin(a);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#E5E5E5"
            strokeWidth={1}
          />
        );
      })}

      {/* Polygone benchmark (charbon pointillé) */}
      <polygon
        points={benchPolyStr}
        fill="rgba(10,10,10,0.04)"
        stroke={CHARCOAL}
        strokeWidth={1.5}
        strokeDasharray="4,4"
      />

      {/* Polygone score (sage rempli) */}
      <polygon
        points={scorePolyStr}
        fill="rgba(74,123,95,0.22)"
        stroke={SAGE}
        strokeWidth={2}
      />

      {/* Sommets du polygone score (points) */}
      {scorePts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill={SAGE}
          stroke={WHITE}
          strokeWidth={1.5}
        />
      ))}

      {/* Étiquettes des axes */}
      {labels.map((l, i) => (
        <g key={i}>
          <text
            x={l.x}
            y={l.y - 4}
            textAnchor="middle"
            fontFamily="'Space Mono', monospace"
            fontSize={10}
            fontWeight={700}
            fill={CHARCOAL}
            letterSpacing="0.04em"
          >
            {l.name.toUpperCase().slice(0, 4)}
          </text>
          <text
            x={l.x}
            y={l.y + 9}
            textAnchor="middle"
            fontFamily="'Inter', sans-serif"
            fontSize={13}
            fontWeight={700}
            fill={colorForScore(l.score)}
          >
            {l.score}
          </text>
        </g>
      ))}

      {/* Score global au centre */}
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        fontFamily="'Inter', sans-serif"
        fontSize={24}
        fontWeight={700}
        fill={CHARCOAL}
      >
        {data.overallScore}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize={8}
        fill={TEXT_MUTED}
        letterSpacing="0.1em"
      >
        ESG GLOBAL
      </text>
    </svg>
  );
}

// ─── Ligne de légende du radar ────────────────────────────────
function LegendRow({
  color, label, sublabel, filled, dashed,
}: {
  color: string;
  label: string;
  sublabel: string;
  filled?: boolean;
  dashed?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
      }}
    >
      <svg width={22} height={12} style={{ flexShrink: 0 }}>
        {filled ? (
          <rect
            x={0}
            y={3}
            width={22}
            height={6}
            fill={color}
            opacity={0.3}
          />
        ) : null}
        <line
          x1={0}
          y1={6}
          x2={22}
          y2={6}
          stroke={color}
          strokeWidth={2}
          strokeDasharray={dashed ? "3,3" : "none"}
        />
      </svg>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
          {label}
        </span>
        <span style={{ fontSize: 10, color: TEXT_MUTED }}>{sublabel}</span>
      </div>
    </div>
  );
}

// ─── Carte d'un pilier (E/S/G) ────────────────────────────────
//
// Jauge circulaire SVG (80×80) + tendance + liste repliable de
// 4 sous-métriques (barres horizontales avec marqueur benchmark).
function PillarCard({
  pillar, expanded, onToggle,
}: {
  pillar: EsgPillar;
  expanded: boolean;
  onToggle: () => void;
}) {
  const scoreColor = colorForScore(pillar.score);
  const trendColor = pillar.trend > 0 ? POSITIVE : pillar.trend < 0 ? RED : TEXT_MUTED;

  return (
    <div
      style={{
        padding: 16, background: WHITE, borderRadius: 12,
        border: `1px solid ${borderForScore(pillar.score)}`,
        display: "flex", flexDirection: "column",
      }}
    >
      {/* En-tête de carte : icône + nom + jauge circulaire */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: bgForScore(pillar.score),
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <PillarIcon name={pillar.name} size={16} color={scoreColor} />
          </div>
          <span
            style={{
              fontSize: 12, fontWeight: 700, color: CHARCOAL,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {pillar.name}
          </span>
        </div>
        <CircularGauge score={pillar.score} color={scoreColor} />
      </div>

      {/* Tendance */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 4,
          marginBottom: 12, fontSize: 12,
        }}
      >
        <TrendIcon trend={pillar.trend} size={14} style={{ color: trendColor }} />
        <span style={{ color: trendColor, fontWeight: 600 }}>
          {pillar.trend > 0 ? `+${pillar.trend}` : pillar.trend} pts
        </span>
        <span style={{ color: TEXT_MUTED, fontSize: 11 }}>· 30 derniers jours</span>
      </div>

      {/* Bouton repli */}
      <button
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 10px", background: "#FAFAFA", border: `1px solid ${BORDER}`,
          borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
          fontSize: 11, fontWeight: 600, color: TEXT_BODY,
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace", textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {pillar.subMetrics.length} sous-métriques
        </span>
        <ChevronDown
          size={14}
          style={{
            color: TEXT_MUTED,
            transition: "transform 200ms ease",
            transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
      </button>

      {/* Liste repliable des sous-métriques */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
              {pillar.subMetrics.map((m) => (
                <SubMetricBar key={m.name} metric={m} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Jauge circulaire (SVG) ───────────────────────────────────
//
// Cercle de fond gris + arc coloré proportionnel au score.
// Texte central : score / 100.
function CircularGauge({ score, color }: { score: number; color: string }) {
  const size = 60;
  const stroke = 5;
  const r = 24;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#F0F0F0"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Inter', sans-serif"
        fontSize={14}
        fontWeight={700}
        fill={color}
      >
        {score}
      </text>
    </svg>
  );
}

// ─── Barre de sous-métrique ───────────────────────────────────
//
// Ligne : nom (gauche) + score (droite)
// Barre : fond gris + remplissage coloré + marqueur vertical benchmark.
function SubMetricBar({ metric }: { metric: EsgSubMetric }) {
  const diff = metric.score - metric.benchmark;
  const diffColor = diff >= 0 ? POSITIVE : RED;
  const fillColor = colorForScore(metric.score);

  return (
    <div>
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 11, color: CHARCOAL, fontWeight: 500 }}>
          {metric.name}
        </span>
        <span
          style={{
            fontSize: 11, fontFamily: "'Space Mono', monospace",
            color: fillColor, fontWeight: 700,
          }}
        >
          {metric.score}
          <span style={{ color: TEXT_MUTED, fontWeight: 400 }}> / {metric.benchmark}</span>
        </span>
      </div>
      <div
        style={{
          position: "relative", height: 8, background: "#F0F0F0",
          borderRadius: 4, overflow: "visible",
        }}
      >
        {/* Remplissage score */}
        <div
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${metric.score}%`, background: fillColor,
            borderRadius: 4,
            transition: "width 400ms ease",
          }}
        />
        {/* Marqueur benchmark (ligne verticale) */}
        <div
          style={{
            position: "absolute",
            left: `calc(${metric.benchmark}% - 1px)`,
            top: -2,
            bottom: -2,
            width: 2,
            background: CHARCOAL,
            borderRadius: 1,
          }}
          title={`Benchmark : ${metric.benchmark}`}
        />
      </div>
      <div
        style={{
          marginTop: 3, fontSize: 10, color: diffColor,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {diff >= 0 ? `+${diff}` : diff} pts vs benchmark
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Helpers de calcul (côté client)
// ═══════════════════════════════════════════════════════════════

/** Benchmark global = moyenne des benchmarks des sous-métriques. */
function overallBenchmark(data: EsgScorecardData): number {
  const all = data.pillars.flatMap((p) => p.subMetrics.map((m) => m.benchmark));
  if (all.length === 0) return 60;
  return Math.round(all.reduce((s, v) => s + v, 0) / all.length);
}

/** Tendance moyenne = moyenne des tendances des 3 piliers. */
function avgTrend(data: EsgScorecardData): number {
  if (data.pillars.length === 0) return 0;
  return Math.round(
    data.pillars.reduce((s, p) => s + p.trend, 0) / data.pillars.length,
  );
}

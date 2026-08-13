"use client";

// ═══════════════════════════════════════════════════════════════
//  NarrativeTrackerGenerator — popup Trajectoire Narrative
//
//  Affiche les 5 récits dominants (clusters de mots-clés) extraits
//  des articles 30 jours, leur force (0-100), leur sentiment, leur
//  volume, leur vélocité, et leur position dans le cycle de vie
//  (émergence → croissance → pic → déclin).
//
//  Composants :
//    • En-tête — date + entreprise + secteur + volume total.
//    • Diagramme de cycle de vie — 4 étapes avec compteurs.
//    • Contrôles de tri — Force / Vélocité / Articles.
//    • Cartes narratives — label, jauge de force, badge de trend
//      avec icône, stats, sparkline temporelle, sentiment.
//    • Actions — Exporter PDF (window.print) + Régénérer.
//
//  Pattern : même structure que BriefingGenerator (motion.div overlay
//  + scale 0.96→1 + AnimatePresence SECTIONS stagger + print CSS
//  isolation de #narrative-document).
//
//  Skill ID : SKILL-24-NARRATIVE
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle,
  Sprout, TrendingUp, Activity, TrendingDown,
  Calendar, Newspaper, Filter, ArrowRight,
  RefreshCw, FileText, Clock,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE) ───────────────────────────
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";
const AMBER = "#F59E0B";

// ─── Types miroir du route.ts ─────────────────────────────────
type NarrativeTrend = "emerging" | "growing" | "peak" | "declining";
type NarrativeSentiment = "positive" | "neutral" | "negative";

interface Narrative {
  label: string;
  strength: number;
  sentiment: NarrativeSentiment;
  articleCount: number;
  firstSeen: string;
  lastSeen: string;
  trend: NarrativeTrend;
  velocity: number;
  timeline: number[];
}

interface NarrativeTrackerData {
  narratives: Narrative[];
  meta: {
    companyName: string;
    sector: string;
    generatedAt: string;
    windowDays: number;
    totalArticles: number;
    source: "real" | "demo";
  };
}

// ─── Sections reveal (stagger) ───────────────────────────────
const SECTIONS = [
  { id: "header", delay: 200 },
  { id: "lifecycle", delay: 380 },
  { id: "sort", delay: 540 },
  { id: "cards", delay: 700 },
  { id: "actions", delay: 900 },
];

// ─── Helpers UI ───────────────────────────────────────────────

type SortKey = "strength" | "velocity" | "articleCount";

const SORT_LABELS: Record<SortKey, string> = {
  strength: "Force",
  velocity: "Vélocité",
  articleCount: "Articles",
};

function trendConfig(trend: NarrativeTrend): {
  label: string;
  icon: typeof Sprout;
  color: string;
  bg: string;
  border: string;
} {
  switch (trend) {
    case "emerging":
      return { label: "Émergence", icon: Sprout, color: AMBER, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" };
    case "growing":
      return { label: "Croissance", icon: TrendingUp, color: POSITIVE, bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)" };
    case "peak":
      return { label: "Pic", icon: Activity, color: SAGE, bg: SAGE_BG, border: SAGE_BORDER };
    case "declining":
      return { label: "Déclin", icon: TrendingDown, color: NEGATIVE, bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)" };
  }
}

function sentimentConfig(s: NarrativeSentiment): { label: string; color: string } {
  switch (s) {
    case "positive": return { label: "Positif", color: POSITIVE };
    case "negative": return { label: "Négatif", color: NEGATIVE };
    case "neutral":  return { label: "Neutre", color: TEXT_MUTED };
  }
}

function strengthColor(score: number): string {
  if (score >= 70) return SAGE;
  if (score >= 40) return AMBER;
  return NEGATIVE;
}

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  } catch {
    return "—";
  }
}

function formatDateLong(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "—";
  }
}

// ─── Sparkline (6 buckets × 5 jours) ──────────────────────────
function Sparkline({ timeline, color }: { timeline: number[]; color: string }) {
  const width = 132;
  const height = 36;
  const padX = 4;
  const padY = 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const max = Math.max(1, ...timeline);
  const stepX = timeline.length > 1 ? innerW / (timeline.length - 1) : 0;

  const points = timeline.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + innerH - (v / max) * innerH;
    return { x, y, v };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Surface sous la courbe (fermeture en bas à droite puis bas à gauche)
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padY + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padY + innerH).toFixed(1)} Z`
    : "";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {areaD && <path d={areaD} fill={color} opacity={0.1} />}
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 2.8 : 1.6}
          fill={color}
          opacity={i === points.length - 1 ? 1 : 0.5}
        />
      ))}
    </svg>
  );
}

// ─── Diagramme de cycle de vie ────────────────────────────────
const LIFECYCLE_STAGES: Array<{ key: NarrativeTrend; label: string; icon: typeof Sprout }> = [
  { key: "emerging", label: "Émergence", icon: Sprout },
  { key: "growing", label: "Croissance", icon: TrendingUp },
  { key: "peak", label: "Pic", icon: Activity },
  { key: "declining", label: "Déclin", icon: TrendingDown },
];

function LifecycleDiagram({ narratives }: { narratives: Narrative[] }) {
  const counts = useMemo(() => {
    const m: Record<NarrativeTrend, number> = { emerging: 0, growing: 0, peak: 0, declining: 0 };
    for (const n of narratives) m[n.trend] += 1;
    return m;
  }, [narratives]);

  const total = narratives.length;

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0, width: "100%" }}>
      {LIFECYCLE_STAGES.map((stage, i) => {
        const count = counts[stage.key];
        const isActive = count > 0;
        const Icon = stage.icon;
        const tc = trendConfig(stage.key);
        return (
          <div key={stage.key} style={{ display: "flex", alignItems: "stretch", flex: 1 }}>
            <div
              style={{
                flex: 1,
                padding: "14px 10px",
                background: isActive ? tc.bg : "#FAFAFA",
                border: `1px solid ${isActive ? tc.border : BORDER}`,
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: isActive ? tc.color : "#FFFFFF",
                  border: `1.5px solid ${isActive ? tc.color : BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isActive ? "#FFFFFF" : TEXT_MUTED,
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {count}
              </div>
              <Icon size={13} style={{ color: isActive ? tc.color : TEXT_MUTED }} />
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'Space Mono', monospace",
                  color: isActive ? CHARCOAL : TEXT_MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                {stage.label}
              </span>
            </div>
            {i < LIFECYCLE_STAGES.length - 1 && (
              <div style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
                <ArrowRight size={14} style={{ color: BORDER === "#F0F0F0" ? "#D4D4D4" : TEXT_MUTED }} />
              </div>
            )}
          </div>
        );
      })}
      <div style={{ display: "flex", alignItems: "center", marginLeft: 12 }}>
        <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {total} récit{total > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

// ─── Carte narrative ──────────────────────────────────────────
function NarrativeCard({ narrative, index }: { narrative: Narrative; index: number }) {
  const tc = trendConfig(narrative.trend);
  const TrendIcon = tc.icon;
  const sc = sentimentConfig(narrative.sentiment);
  const sColor = strengthColor(narrative.strength);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 60 }}
      style={{
        padding: 16,
        background: "#FFFFFF",
        borderRadius: 10,
        border: `1px solid ${BORDER}`,
        marginBottom: 12,
      }}
    >
      {/* Ligne 1 : label + badge trend */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontFamily: "'Space Mono', monospace",
                color: TEXT_MUTED,
                background: "#FAFAFA",
                padding: "2px 6px",
                borderRadius: 3,
                border: `1px solid ${BORDER}`,
              }}
            >
              #{String(index + 1).padStart(2, "0")}
            </span>
            <Newspaper size={13} style={{ color: SAGE }} />
          </div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: CHARCOAL,
              margin: 0,
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
            }}
          >
            {narrative.label}
          </h3>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 10px",
            background: tc.bg,
            border: `1px solid ${tc.border}`,
            borderRadius: 6,
            flexShrink: 0,
          }}
        >
          <TrendIcon size={12} style={{ color: tc.color }} />
          <span
            style={{
              fontSize: 10,
              fontFamily: "'Space Mono', monospace",
              color: tc.color,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
            }}
          >
            {tc.label}
          </span>
        </div>
      </div>

      {/* Ligne 2 : jauge de force */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Force du récit
          </span>
          <span style={{ fontSize: 13, fontFamily: "'Space Mono', monospace", color: sColor, fontWeight: 700 }}>
            {narrative.strength}<span style={{ fontSize: 10, color: TEXT_MUTED, fontWeight: 400 }}> /100</span>
          </span>
        </div>
        <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${narrative.strength}%` }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.06, ease: "easeOut" }}
            style={{ height: "100%", background: sColor, borderRadius: 3 }}
          />
        </div>
      </div>

      {/* Ligne 3 : stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1.4fr",
          gap: 10,
          padding: "10px 0",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
            Articles
          </div>
          <div style={{ fontSize: 15, fontFamily: "'Space Mono', monospace", color: CHARCOAL, fontWeight: 700 }}>
            {narrative.articleCount}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
            Sentiment
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.color, display: "inline-block" }} />
            <span style={{ fontSize: 12, fontFamily: "'Inter', sans-serif", color: sc.color, fontWeight: 600 }}>
              {sc.label}
            </span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
            Vélocité
          </div>
          <div style={{
            fontSize: 13,
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            color: narrative.velocity > 0 ? POSITIVE : narrative.velocity < 0 ? NEGATIVE : TEXT_MUTED,
          }}>
            {narrative.velocity > 0 ? "+" : ""}{narrative.velocity}<span style={{ fontSize: 9, color: TEXT_MUTED, fontWeight: 400 }}> /sem</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2, display: "flex", alignItems: "center", gap: 3 }}>
            <Clock size={9} /> Période
          </div>
          <div style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: CHARCOAL, fontWeight: 600 }}>
            {formatDateShort(narrative.firstSeen)} → {formatDateShort(narrative.lastSeen)}
          </div>
        </div>
      </div>

      {/* Ligne 4 : sparkline */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Trajectoire 30 jours
          </div>
          <Sparkline timeline={narrative.timeline} color={tc.color} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Pic journalier
          </span>
          <span style={{ fontSize: 13, fontFamily: "'Space Mono', monospace", color: CHARCOAL, fontWeight: 700 }}>
            {Math.max(...narrative.timeline, 0)} <span style={{ fontSize: 9, color: TEXT_MUTED, fontWeight: 400 }}>art/5j</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Composant principal ──────────────────────────────────────
export function NarrativeTrackerGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NarrativeTrackerData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("strength");

  const generate = useCallback(async () => {
    setLoading(true); setError(null); setData(null);
    setVisibleSections(new Set()); setGenerating(true);
    try {
      const res = await fetch("/api/console/narrative-tracker", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: NarrativeTrackerData = await res.json();
      setData(json); setLoading(false);
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

  const sortedNarratives = useMemo(() => {
    if (!data?.narratives) return [];
    const arr = [...data.narratives];
    arr.sort((a, b) => {
      if (sortKey === "strength") return b.strength - a.strength;
      if (sortKey === "velocity") return b.velocity - a.velocity;
      return b.articleCount - a.articleCount;
    });
    return arr;
  }, [data, sortKey]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,10,10,0.6)",
        backdropFilter: "blur(4px)",
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
          width: "100%", maxWidth: 920, maxHeight: "90vh",
          background: "#FFFFFF", borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Activity size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
              Trajectoire Narrative
            </span>
            {generating && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace" }}>
                <Loader2 size={11} className="animate-spin" /> Génération...
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              disabled={generating || !data}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: generating || !data ? BORDER : CHARCOAL,
                color: generating || !data ? TEXT_MUTED : "#FFFFFF",
                border: "none", borderRadius: 6,
                fontSize: 12, fontWeight: 600,
                cursor: generating || !data ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none", cursor: "pointer",
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
            flex: 1, overflowY: "auto",
            padding: "32px 40px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: CHARCOAL,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2 size={32} style={{ color: SAGE, animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>
                Analyse des récits en cours...
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
                  marginTop: 16, padding: "8px 16px",
                  background: CHARCOAL, color: "#FFFFFF",
                  border: "none", borderRadius: 6,
                  fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {data && (
            <div id="narrative-document">
              {/* ─── En-tête ─── */}
              <AnimatePresence>
                {visibleSections.has("header") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 28 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Calendar size={14} style={{ color: SAGE }} />
                      <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: SAGE, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {formatDateLong(data.meta.generatedAt)}
                      </span>
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: CHARCOAL, letterSpacing: "-0.02em" }}>
                      Trajectoire Narrative — {data.meta.companyName}
                    </h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 6 }}>
                      Secteur {data.meta.sector} · {data.narratives.length} récits actifs · {data.meta.totalArticles} articles analysés sur {data.meta.windowDays} jours
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Diagramme de cycle de vie ─── */}
              <AnimatePresence>
                {visibleSections.has("lifecycle") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 28 }}
                  >
                    <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                      Cycle de vie des récits
                    </div>
                    <LifecycleDiagram narratives={data.narratives} />
                    <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 10, lineHeight: 1.5 }}>
                      Distribution des {data.narratives.length} récits dominants à travers les 4 phases du cycle médiatique. La position indique le stade d'évolution actuel de chaque narratif.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Contrôles de tri ─── */}
              <AnimatePresence>
                {visibleSections.has("sort") && data.narratives.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}
                  >
                    <Filter size={13} style={{ color: TEXT_MUTED }} />
                    <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>
                      Trier par
                    </span>
                    {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => {
                      const active = sortKey === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSortKey(key)}
                          style={{
                            padding: "5px 12px",
                            background: active ? CHARCOAL : "transparent",
                            color: active ? "#FFFFFF" : TEXT_BODY,
                            border: `1px solid ${active ? CHARCOAL : BORDER}`,
                            borderRadius: 6,
                            fontSize: 11,
                            fontFamily: "'Space Mono', monospace",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {SORT_LABELS[key]}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Cartes narratives ─── */}
              <AnimatePresence>
                {visibleSections.has("cards") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    {sortedNarratives.length === 0 && (
                      <div style={{ padding: "40px 20px", textAlign: "center", background: "#FAFAFA", borderRadius: 8, border: `1px solid ${BORDER}` }}>
                        <FileText size={28} style={{ color: TEXT_MUTED, marginBottom: 8 }} />
                        <p style={{ fontSize: 13, color: TEXT_BODY, margin: 0 }}>
                          Aucun récit détecté sur les {data.meta.windowDays} derniers jours.
                        </p>
                        <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                          La collecte d'articles est peut-être récente — relancez l'analyse dans quelques jours.
                        </p>
                      </div>
                    )}
                    {sortedNarratives.map((n, i) => (
                      <NarrativeCard key={n.label} narrative={n} index={i} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Actions ─── */}
              <AnimatePresence>
                {visibleSections.has("actions") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}
                  >
                    <button
                      onClick={() => window.print()}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 20px",
                        background: CHARCOAL, color: "#FFFFFF",
                        border: "none", borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <Download size={14} /> Exporter PDF
                    </button>
                    <button
                      onClick={generate}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 16px",
                        background: "transparent", color: TEXT_BODY,
                        border: `1px solid ${BORDER}`, borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
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
                  style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: SAGE, animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace" }}>
                    Analyse des trajectoires en cours...
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
          #narrative-document, #narrative-document * { visibility: visible; }
          #narrative-document {
            position: absolute; left: 0; top: 0; width: 100%; padding: 40px;
          }
        }
      `}</style>
    </div>
  );
}

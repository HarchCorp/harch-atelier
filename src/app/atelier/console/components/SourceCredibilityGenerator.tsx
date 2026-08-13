"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  Newspaper, Landmark, TrendingUp, Banknote, Globe,
  ChevronDown, Search, Plus, ShieldCheck, Calendar,
  FileBarChart,
} from "lucide-react";

// ─── Design tokens (matches BriefingGenerator) ─────────────────
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";
const AMBER = "#F59E0B";

// ─── Types (mirrors API response) ──────────────────────────────
type CredibilityTier = "Vérifié" | "Fiable" | "À vérifier" | "Non fiable";

interface SourceCredibilityFactor {
  authority: number;
  editorial: number;
  factCheck: number;
  transparency: number;
}

interface SourceCredibilityRow {
  name: string;
  type: string;
  credibility: number;
  tier: CredibilityTier;
  factors: SourceCredibilityFactor;
  articleCount: number;
  lastArticleDate: string | null;
}

interface SourceCredibilityMeta {
  companyName: string;
  sector: string | null;
  generatedAt: string;
  windowDays: number;
  totalSources: number;
  avgCredibility: number;
  tierCounts: Record<CredibilityTier, number>;
}

interface SourceCredibilityResponse {
  sources: SourceCredibilityRow[];
  meta: SourceCredibilityMeta;
}

// ─── Tier visuals ──────────────────────────────────────────────
const TIER_CONFIG: Record<
  CredibilityTier,
  { bg: string; color: string; border: string }
> = {
  "Vérifié":    { bg: "rgba(74,123,95,0.12)",  color: SAGE,     border: "rgba(74,123,95,0.28)" },
  "Fiable":     { bg: "rgba(74,123,95,0.06)",  color: "#5A8F6B", border: "rgba(74,123,95,0.16)" },
  "À vérifier": { bg: "rgba(245,158,11,0.12)", color: AMBER,    border: "rgba(245,158,11,0.28)" },
  "Non fiable": { bg: "rgba(239,68,68,0.10)",  color: NEGATIVE, border: "rgba(239,68,68,0.26)" },
};

const TIER_FILTERS: Array<"Tous" | CredibilityTier> = [
  "Tous", "Vérifié", "Fiable", "À vérifier", "Non fiable",
];

const RANGE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "30d",  label: "30 jours" },
  { value: "90d",  label: "90 jours" },
  { value: "365d", label: "12 mois" },
];

// ─── Helpers ───────────────────────────────────────────────────

function scoreColor(n: number): string {
  if (n >= 65) return SAGE;
  if (n >= 45) return AMBER;
  return NEGATIVE;
}

function typeIcon(type: string) {
  switch (type) {
    case "regulatory": return Landmark;
    case "market":     return TrendingUp;
    case "financial":  return Banknote;
    case "media":      return Newspaper;
    default:           return Globe;
  }
}

function typeLabel(type: string): string {
  switch (type) {
    case "regulatory": return "Réglementaire";
    case "market":     return "Marché";
    case "financial":  return "Financier";
    case "media":      return "Média";
    default:           return "Source";
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatGeneratedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Component ─────────────────────────────────────────────────

export function SourceCredibilityGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceCredibilityRow[]>([]);
  const [meta, setMeta] = useState<SourceCredibilityMeta | null>(null);
  const [tierFilter, setTierFilter] = useState<"Tous" | CredibilityTier>("Tous");
  const [range, setRange] = useState<string>("90d");
  const [search, setSearch] = useState("");
  const [newSource, setNewSource] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const generate = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/console/source-credibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ range }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SourceCredibilityResponse = await res.json();
      setSources(data.sources);
      setMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { void generate(); }, [generate]);

  // When `highlighted` is set, scroll the matching row into view.
  useEffect(() => {
    if (!highlighted) return;
    const el = rowRefs.current.get(highlighted);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const t = setTimeout(() => setHighlighted(null), 2200);
    return () => clearTimeout(t);
  }, [highlighted]);

  const toggleExpand = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const evaluateNewSource = async () => {
    const name = newSource.trim();
    if (!name) return;
    setEvaluating(true); setError(null);
    try {
      const res = await fetch("/api/console/source-credibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: name, range }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SourceCredibilityResponse = await res.json();
      if (data.sources.length === 0) {
        setError("Source introuvable.");
        return;
      }
      const evaluated = data.sources[0];
      setSources((prev) => {
        const idx = prev.findIndex(
          (r) => r.name.toLowerCase() === evaluated.name.toLowerCase(),
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = evaluated;
          next.sort((a, b) => b.credibility - a.credibility);
          return next;
        }
        const next = [evaluated, ...prev];
        next.sort((a, b) => b.credibility - a.credibility);
        return next;
      });
      // Update meta totals if present.
      if (data.meta) {
        setMeta((prev) => prev ? {
          ...prev,
          totalSources: data.meta.totalSources,
          avgCredibility: data.meta.avgCredibility,
          tierCounts: data.meta.tierCounts,
          generatedAt: data.meta.generatedAt,
        } : data.meta);
      }
      setHighlighted(evaluated.name);
      setExpanded((prev) => new Set(prev).add(evaluated.name));
      setNewSource("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'évaluation");
    } finally {
      setEvaluating(false);
    }
  };

  // ─── Derived list (filtered + searched) ─────────────────────
  const filteredSources = sources.filter((s) => {
    if (tierFilter !== "Tous" && s.tier !== tierFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!s.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const avgScore = meta?.avgCredibility ?? 0;

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
          background: "#FFFFFF", borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header bar ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
              Crédibilité des sources
            </span>
            {(loading || evaluating) && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace" }}>
                <Loader2 size={11} className="animate-spin" />
                {evaluating ? "Évaluation..." : "Chargement..."}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              disabled={loading || !sources.length}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: loading || !sources.length ? BORDER : CHARCOAL,
                color: loading || !sources.length ? TEXT_MUTED : "#FFFFFF",
                border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: loading || !sources.length ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, display: "flex", alignItems: "center",
                justifyContent: "center", background: "transparent",
                border: "none", cursor: "pointer", color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Body ──────────────────────────────────────────── */}
        <div
          id="source-credibility-document"
          style={{
            flex: 1, overflowY: "auto",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: CHARCOAL,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2 size={32} style={{ color: SAGE, animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>
                Collecte des sources en cours...
              </p>
            </div>
          )}

          {error && !loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: NEGATIVE }} />
              <p style={{ marginTop: 12, fontSize: 14, color: NEGATIVE }}>{error}</p>
              <button
                onClick={generate}
                style={{
                  marginTop: 16, padding: "8px 16px",
                  background: CHARCOAL, color: "#FFFFFF",
                  border: "none", borderRadius: 6, fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && meta && (
            <>
              {/* ─── Summary header ─────────────────────────── */}
              <div style={{ padding: "24px 28px 16px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Calendar size={14} style={{ color: SAGE }} />
                  <span style={{
                    fontSize: 11, fontFamily: "'Space Mono', monospace",
                    color: SAGE, textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>
                    {formatGeneratedAt(meta.generatedAt)} · fenêtre {meta.windowDays}j
                  </span>
                </div>
                <h1 style={{
                  fontSize: 22, fontWeight: 700, margin: 0,
                  color: CHARCOAL, letterSpacing: "-0.02em",
                }}>
                  Score de crédibilité — {meta.companyName}
                </h1>
                <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>
                  {meta.totalSources} source(s) évaluée(s) · moyenne {avgScore}/100
                </p>

                {/* Avg score bar */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{
                      fontSize: 10, fontFamily: "'Space Mono', monospace",
                      color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em",
                    }}>
                      Crédibilité moyenne
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: scoreColor(avgScore),
                      fontFamily: "'Space Mono', monospace",
                    }}>
                      {avgScore} / 100
                    </span>
                  </div>
                  <div style={{ height: 6, background: "#EFEFEF", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      width: `${avgScore}%`, height: "100%",
                      background: scoreColor(avgScore),
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              </div>

              {/* ─── Toolbar: filters + search + range ─────── */}
              <div style={{
                padding: "14px 28px", borderBottom: `1px solid ${BORDER}`,
                background: "#FAFAFA",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                {/* Tier filter pills */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {TIER_FILTERS.map((t) => {
                    const active = tierFilter === t;
                    const count = t === "Tous"
                      ? sources.length
                      : meta.tierCounts[t as CredibilityTier];
                    const cfg = t === "Tous" ? null : TIER_CONFIG[t as CredibilityTier];
                    return (
                      <button
                        key={t}
                        onClick={() => setTierFilter(t)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "5px 11px", fontSize: 11, fontWeight: 600,
                          fontFamily: "inherit",
                          background: active
                            ? (cfg ? cfg.bg : SAGE_BG)
                            : "#FFFFFF",
                          color: active
                            ? (cfg ? cfg.color : SAGE)
                            : TEXT_MUTED,
                          border: `1px solid ${active
                            ? (cfg ? cfg.border : "rgba(74,123,95,0.25)")
                            : BORDER}`,
                          borderRadius: 999, cursor: "pointer",
                        }}
                      >
                        {t}
                        <span style={{
                          fontSize: 10, opacity: 0.8,
                          fontFamily: "'Space Mono', monospace",
                        }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search + range + new source evaluator */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 10px", background: "#FFFFFF",
                    border: `1px solid ${BORDER}`, borderRadius: 6,
                    flex: "1 1 180px", minWidth: 180,
                  }}>
                    <Search size={13} style={{ color: TEXT_MUTED }} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Rechercher une source..."
                      style={{
                        border: "none", outline: "none", background: "transparent",
                        fontSize: 12, color: CHARCOAL, fontFamily: "inherit",
                        flex: 1, minWidth: 0,
                      }}
                    />
                  </div>

                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    style={{
                      padding: "6px 10px", fontSize: 12, fontFamily: "inherit",
                      background: "#FFFFFF", color: CHARCOAL,
                      border: `1px solid ${BORDER}`, borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    {RANGE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Evaluate a new source */}
                <div style={{
                  display: "flex", gap: 8, alignItems: "center",
                  padding: "10px 12px",
                  background: SAGE_BG,
                  border: "1px solid rgba(74,123,95,0.20)",
                  borderRadius: 6,
                }}>
                  <Plus size={14} style={{ color: SAGE, flexShrink: 0 }} />
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void evaluateNewSource(); }}
                    placeholder="Évaluer une nouvelle source (nom ou domaine)..."
                    style={{
                      border: "none", outline: "none", background: "transparent",
                      fontSize: 12, color: CHARCOAL, fontFamily: "inherit",
                      flex: 1, minWidth: 0,
                    }}
                  />
                  <button
                    onClick={evaluateNewSource}
                    disabled={!newSource.trim() || evaluating}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "5px 10px", fontSize: 11, fontWeight: 600,
                      fontFamily: "inherit",
                      background: !newSource.trim() || evaluating ? BORDER : SAGE,
                      color: !newSource.trim() || evaluating ? TEXT_MUTED : "#FFFFFF",
                      border: "none", borderRadius: 4,
                      cursor: !newSource.trim() || evaluating ? "not-allowed" : "pointer",
                    }}
                  >
                    {evaluating ? <Loader2 size={11} className="animate-spin" /> : <ShieldCheck size={11} />}
                    Évaluer
                  </button>
                </div>
              </div>

              {/* ─── Source list ────────────────────────────── */}
              <div style={{ padding: "8px 0 16px" }}>
                {filteredSources.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <FileBarChart size={28} style={{ color: TEXT_MUTED }} />
                    <p style={{ marginTop: 10, fontSize: 13, color: TEXT_MUTED }}>
                      Aucune source ne correspond à ce filtre.
                    </p>
                  </div>
                )}

                <AnimatePresence>
                  {filteredSources.map((s, i) => {
                    const Icon = typeIcon(s.type);
                    const cfg = TIER_CONFIG[s.tier];
                    const isExpanded = expanded.has(s.name);
                    const isHighlighted = highlighted === s.name;
                    return (
                      <motion.div
                        key={s.name}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.4) }}
                        ref={(el) => {
                          if (el) rowRefs.current.set(s.name, el);
                          else rowRefs.current.delete(s.name);
                        }}
                        style={{
                          margin: "0 16px", marginBottom: 8,
                          padding: 0, background: "#FFFFFF",
                          border: `1px solid ${isHighlighted ? cfg.border : BORDER}`,
                          borderRadius: 8,
                          boxShadow: isHighlighted
                            ? `0 0 0 2px ${cfg.border}`
                            : "none",
                          transition: "box-shadow 0.3s, border-color 0.3s",
                          overflow: "hidden",
                        }}
                      >
                        {/* Compact row */}
                        <div
                          onClick={() => toggleExpand(s.name)}
                          style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "12px 14px", cursor: "pointer",
                          }}
                        >
                          {/* Type icon */}
                          <div style={{
                            width: 32, height: 32, flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: SAGE_BG, borderRadius: 6,
                            color: SAGE,
                          }}>
                            <Icon size={16} />
                          </div>

                          {/* Name + meta */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13, fontWeight: 600, color: CHARCOAL,
                              whiteSpace: "nowrap", overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}>
                              {s.name}
                            </div>
                            <div style={{
                              display: "flex", gap: 10, marginTop: 2,
                              fontSize: 11, color: TEXT_MUTED,
                            }}>
                              <span>{typeLabel(s.type)}</span>
                              <span>{s.articleCount} article{s.articleCount > 1 ? "s" : ""}</span>
                              <span style={{
                                display: "inline-flex", alignItems: "center", gap: 3,
                              }}>
                                <Calendar size={10} />
                                {formatDate(s.lastArticleDate)}
                              </span>
                            </div>
                          </div>

                          {/* Score bar */}
                          <div style={{ width: 120, flexShrink: 0 }}>
                            <div style={{
                              display: "flex", justifyContent: "space-between",
                              marginBottom: 3,
                            }}>
                              <span style={{
                                fontSize: 9, fontFamily: "'Space Mono', monospace",
                                color: TEXT_MUTED, textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}>
                                Score
                              </span>
                              <span style={{
                                fontSize: 11, fontWeight: 700,
                                color: scoreColor(s.credibility),
                                fontFamily: "'Space Mono', monospace",
                              }}>
                                {s.credibility}
                              </span>
                            </div>
                            <div style={{
                              height: 5, background: "#EFEFEF",
                              borderRadius: 3, overflow: "hidden",
                            }}>
                              <div style={{
                                width: `${s.credibility}%`, height: "100%",
                                background: scoreColor(s.credibility),
                                transition: "width 0.6s ease",
                              }} />
                            </div>
                          </div>

                          {/* Tier badge */}
                          <span style={{
                            padding: "3px 9px", fontSize: 10, fontWeight: 700,
                            fontFamily: "'Space Mono', monospace",
                            background: cfg.bg, color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                            borderRadius: 999, flexShrink: 0,
                            whiteSpace: "nowrap",
                          }}>
                            {s.tier}
                          </span>

                          {/* Expand chevron */}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ flexShrink: 0, color: TEXT_MUTED }}
                          >
                            <ChevronDown size={16} />
                          </motion.div>
                        </div>

                        {/* Expandable factor breakdown */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              style={{ overflow: "hidden" }}
                            >
                              <div style={{
                                padding: "14px 16px 16px",
                                borderTop: `1px solid ${BORDER}`,
                                background: "#FAFAFA",
                              }}>
                                <div style={{
                                  fontSize: 10, fontFamily: "'Space Mono', monospace",
                                  color: TEXT_MUTED, textTransform: "uppercase",
                                  letterSpacing: "0.1em", marginBottom: 10,
                                }}>
                                  Décomposition des facteurs
                                </div>
                                <FactorBar
                                  label="Autorité"
                                  description="Volume de couverture et poids institutionnel"
                                  value={s.factors.authority}
                                />
                                <FactorBar
                                  label="Éditorial"
                                  description="Équilibre des sentiments (positif / neutre / négatif)"
                                  value={s.factors.editorial}
                                />
                                <FactorBar
                                  label="Vérification"
                                  description="Pertinence moyenne et complétude du traitement NLP"
                                  value={s.factors.factCheck}
                                />
                                <FactorBar
                                  label="Transparence"
                                  description="Récence de publication et labellisation linguistique"
                                  value={s.factors.transparency}
                                  last
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* ─── Footer actions ────────────────────────── */}
              <div style={{
                display: "flex", gap: 8, padding: "14px 28px",
                borderTop: `1px solid ${BORDER}`, background: "#FFFFFF",
              }}>
                <button
                  onClick={() => window.print()}
                  disabled={!sources.length}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "9px 18px", background: CHARCOAL, color: "#FFFFFF",
                    border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: !sources.length ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <Download size={13} /> Exporter PDF
                </button>
                <button
                  onClick={generate}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "9px 16px", background: "transparent",
                    color: TEXT_BODY, border: `1px solid ${BORDER}`,
                    borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <RefreshCw size={13} /> Régénérer
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          body * { visibility: hidden; }
          #source-credibility-document,
          #source-credibility-document * { visibility: visible; }
          #source-credibility-document {
            position: absolute; left: 0; top: 0; width: 100%;
            overflow: visible !important; max-height: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Factor bar sub-component ──────────────────────────────────

function FactorBar({
  label, description, value, last,
}: {
  label: string;
  description: string;
  value: number;
  last?: boolean;
}) {
  const color = scoreColor(value);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: last ? "8px 0 0" : "8px 0",
      borderBottom: last ? "none" : `1px solid ${BORDER}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: CHARCOAL,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 10, color: TEXT_MUTED, marginTop: 1,
        }}>
          {description}
        </div>
      </div>
      <div style={{ width: 140, flexShrink: 0 }}>
        <div style={{
          display: "flex", justifyContent: "flex-end", marginBottom: 3,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color,
            fontFamily: "'Space Mono', monospace",
          }}>
            {value}
          </span>
        </div>
        <div style={{
          height: 4, background: "#E5E5E5",
          borderRadius: 2, overflow: "hidden",
        }}>
          <div style={{
            width: `${value}%`, height: "100%",
            background: color,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>
    </div>
  );
}

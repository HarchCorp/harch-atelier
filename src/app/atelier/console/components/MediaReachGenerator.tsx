"use client";

// ═══════════════════════════════════════════════════════════════
//  MediaReachGenerator
//
//  Skill 16 — Media Reach Calculator.
//
//  A standalone strategic calculator popup. The analyst drags:
//    - an articles count slider (1..200)
//    - four source-mix sliders (national / régional / spécialisé /
//      blog) that always sum to 100% via proportional normalisation
//
//  The popup calls POST /api/console/media-reach on every change
//  (debounced 150 ms) and renders:
//    a. Header bar — "Calculateur de Portée Média" + PDF + close
//    b. Title strip — Portée média — {companyName}
//    c. Four big-number stat cards — Reach / AVE / Engagement /
//       Paid equivalent
//    d. Two-column body:
//       - Left:  input sliders + preset chips
//       - Right: SVG donut + breakdown table
//    e. Saved-scenarios comparison panel (collapsible)
//    f. Footer — Sauvegarder scénario · Comparer scénarios · Export PDF
//
//  Same popup pattern as BriefingGenerator (fixed overlay, scale
//  entrance, framer-motion). White / sage / charcoal palette,
//  Space Mono for labels, Inter for body, Lucide icons only.
//
//  Skill ID: SKILL-16-MEDIA-REACH
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  Calculator, Newspaper, Building2, Microscope, Globe,
  Save, GitCompare, Trash2, Eye, EyeOff, RotateCcw,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE per spec) ───────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_DARK = "#2F5240";
const SAGE_BG = "rgba(74,123,95,0.10)";
const SAGE_BG_STRONG = "rgba(74,123,95,0.18)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const CHARCOAL_BG = "rgba(10,10,10,0.04)";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const AMBER = "#D97706";
const AMBER_BG = "rgba(217,119,6,0.10)";

// Per-tier colour scale (sage monochrome + amber accent for blogs).
// Matches the legend swatches, donut slices, and table tier dots.
const TIER_COLORS: Record<SourceTierKey, string> = {
  national: SAGE,
  regional: SAGE_DARK,
  specialise: "#94B8A4",   // pale sage
  blog: AMBER,
};

const TIER_LABELS: Record<SourceTierKey, string> = {
  national: "Presse nationale",
  regional: "Presse régionale",
  specialise: "Presse spécialisée",
  blog: "Blogs & influence",
};

const TIER_ORDER: SourceTierKey[] = [
  "national", "regional", "specialise", "blog",
];

// ─── Types — mirrors MediaReachResponse from route.ts ──────────

type SourceTierKey = "national" | "regional" | "specialise" | "blog";

interface SourceMix {
  national: number;
  regional: number;
  specialise: number;
  blog: number;
}

interface MediaReachBreakdownRow {
  tier: string;
  articles: number;
  audience: number;
  reach: number;
  ave: number;
}

interface MediaReachData {
  meta: {
    companyName: string;
    sector: string;
    generatedAt: string;
    articles: number;
    sourceMix: SourceMix;
    prMultiplier: number;
  };
  totalReach: number;
  aveMAD: number;
  engagementEst: number;
  paidEquivalent: number;
  breakdown: MediaReachBreakdownRow[];
}

// ─── Presets (one-click source mixes) ──────────────────────────
//
// Each preset is a balanced starting point. The user can then drag
// individual sliders to fine-tune. The four presets cover the most
// common PR scenarios we see in the field.

interface Preset {
  id: string;
  label: string;
  mix: SourceMix;
}

const PRESETS: Preset[] = [
  {
    id: "equilibre",
    label: "Équilibré",
    mix: { national: 25, regional: 25, specialise: 25, blog: 25 },
  },
  {
    id: "national",
    label: "National-major",
    mix: { national: 50, regional: 20, specialise: 20, blog: 10 },
  },
  {
    id: "specialise",
    label: "Spécialisé-major",
    mix: { national: 15, regional: 15, specialise: 55, blog: 15 },
  },
  {
    id: "blog",
    label: "Blog-major",
    mix: { national: 10, regional: 15, specialise: 15, blog: 60 },
  },
  {
    id: "regional",
    label: "Régional-major",
    mix: { national: 15, regional: 55, specialise: 15, blog: 15 },
  },
];

// ─── Saved-scenario payload (localStorage) ─────────────────────
//
// We persist enough of the calculation result that the compare
// panel can render side-by-side without re-calling the API. The
// payload is intentionally small — name + inputs + the 4 KPIs.

interface SavedScenario {
  id: string;
  name: string;
  articles: number;
  sourceMix: SourceMix;
  totalReach: number;
  aveMAD: number;
  engagementEst: number;
  paidEquivalent: number;
  createdAt: string;   // ISO
}

const STORAGE_KEY = "harchiq.media-reach.scenarios";
const MAX_SCENARIOS = 8;

// ─── Defaults (initial slider state) ───────────────────────────
const DEFAULT_ARTICLES = 50;
const DEFAULT_MIX: SourceMix = {
  national: 40, regional: 20, specialise: 25, blog: 15,
};

// ─── Component ─────────────────────────────────────────────────

export function MediaReachGenerator({ onClose }: { onClose: () => void }) {
  const [articles, setArticles] = useState<number>(DEFAULT_ARTICLES);
  const [sourceMix, setSourceMix] = useState<SourceMix>(DEFAULT_MIX);
  const [data, setData] = useState<MediaReachData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [computing, setComputing] = useState<boolean>(false);

  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [showCompare, setShowCompare] = useState<boolean>(false);
  const [scenarioName, setScenarioName] = useState<string>("");
  const [justSaved, setJustSaved] = useState<boolean>(false);

  const requestSeq = useRef<number>(0);

  // ─── Initial mount: hydrate saved scenarios from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedScenario[];
        if (Array.isArray(parsed)) setScenarios(parsed);
      }
    } catch {
      // Corrupt or unavailable — start with an empty list.
    }
  }, []);

  // ─── Fetch the calculation from the API ─────────────────────
  const compute = useCallback(async () => {
    const seq = ++requestSeq.current;
    setComputing(true);
    setError(null);
    try {
      const res = await fetch("/api/console/media-reach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles, sourceMix }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as MediaReachData;
      // Drop stale responses (older in-flight fetches that resolved
      // out of order — happens when the user drags quickly).
      if (seq !== requestSeq.current) return;
      setData(json);
      setLoading(false);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false);
    } finally {
      if (seq === requestSeq.current) setComputing(false);
    }
  }, [articles, sourceMix]);

  // ─── Debounced auto-recalc on slider change ─────────────────
  useEffect(() => {
    const t = setTimeout(() => { void compute(); }, 150);
    return () => clearTimeout(t);
  }, [compute]);

  // ─── Slider handlers ────────────────────────────────────────

  /**
   * Adjust one source-mix slider. The other three are rescaled
   * proportionally so the four always sum to 100. Rounding drift
   * is patched onto the largest remaining slice.
   */
  function handleMixChange(key: SourceTierKey, newValue: number) {
    setSourceMix((prev) => {
      const v = Math.max(0, Math.min(100, Math.round(newValue)));
      const others = TIER_ORDER.filter((k) => k !== key);
      const remaining = 100 - v;
      const oldOthersSum = others.reduce((s, k) => s + prev[k], 0);

      const next: SourceMix = { ...prev, [key]: v };

      if (oldOthersSum === 0) {
        // All others were zero — split remaining equally.
        const each = Math.floor(remaining / others.length);
        const remainder = remaining - each * others.length;
        others.forEach((k, i) => {
          next[k] = each + (i < remainder ? 1 : 0);
        });
      } else {
        others.forEach((k) => {
          next[k] = Math.round((prev[k] / oldOthersSum) * remaining);
        });
        // Patch rounding drift onto the largest other slice.
        const sum =
          next.national + next.regional + next.specialise + next.blog;
        const drift = 100 - sum;
        if (drift !== 0) {
          const largest = others.reduce(
            (a, b) => (next[a] >= next[b] ? a : b),
            others[0],
          );
          next[largest] = Math.max(0, next[largest] + drift);
        }
      }
      return next;
    });
  }

  function applyPreset(p: Preset) {
    setSourceMix({ ...p.mix });
  }

  function resetScenario() {
    setArticles(DEFAULT_ARTICLES);
    setSourceMix(DEFAULT_MIX);
  }

  // ─── Save / delete / clear scenarios ────────────────────────

  function persistScenarios(list: SavedScenario[]) {
    setScenarios(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage full or unavailable — keep in-memory copy only.
    }
  }

  function saveScenario() {
    if (!data) return;
    const name =
      scenarioName.trim() ||
      `Scénario ${scenarios.length + 1} — ${articles} art.`;
    const scenario: SavedScenario = {
      id: `scn-${Date.now()}`,
      name,
      articles: data.meta.articles,
      sourceMix: data.meta.sourceMix,
      totalReach: data.totalReach,
      aveMAD: data.aveMAD,
      engagementEst: data.engagementEst,
      paidEquivalent: data.paidEquivalent,
      createdAt: new Date().toISOString(),
    };
    // Cap at MAX_SCENARIOS — drop the oldest.
    const next = [scenario, ...scenarios].slice(0, MAX_SCENARIOS);
    persistScenarios(next);
    setScenarioName("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  }

  function deleteScenario(id: string) {
    persistScenarios(scenarios.filter((s) => s.id !== id));
  }

  function loadScenario(s: SavedScenario) {
    setArticles(s.articles);
    setSourceMix(s.sourceMix);
    setShowCompare(false);
  }

  function clearScenarios() {
    persistScenarios([]);
  }

  // ─── Derived display values ─────────────────────────────────

  const mixSum =
    sourceMix.national +
    sourceMix.regional +
    sourceMix.specialise +
    sourceMix.blog;

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
        {/* ─── Header bar ─── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Calculator size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14, fontWeight: 700, color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Calculateur de Portée Média
            </span>
            {computing && (
              <span
                style={{
                  display: "flex", alignItems: "center", gap: 4, fontSize: 11,
                  color: SAGE, fontFamily: "'Space Mono', monospace",
                }}
              >
                <Loader2 size={11} className="animate-spin" /> Calcul...
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              disabled={!data}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                background: !data ? BORDER : CHARCOAL,
                color: !data ? TEXT_MUTED : WHITE,
                border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: !data ? "not-allowed" : "pointer",
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
            flex: 1, overflowY: "auto", padding: "24px 32px",
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
                Initialisation du calculateur...
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: AMBER }} />
              <p style={{ marginTop: 12, fontSize: 14, color: AMBER }}>{error}</p>
              <button
                onClick={() => void compute()}
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
            <div id="media-reach-document">
              {/* ─── Title strip ─── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 20 }}
              >
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                  }}
                >
                  <Globe size={13} style={{ color: SAGE }} />
                  <span
                    style={{
                      fontSize: 11, fontFamily: "'Space Mono', monospace",
                      color: SAGE, textTransform: "uppercase",
                      letterSpacing: "0.08em", fontWeight: 700,
                    }}
                  >
                    Modèle stratégique · ×{data.meta.prMultiplier.toFixed(1)} PR multiplier
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: 24, fontWeight: 700, margin: 0, color: CHARCOAL,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Portée média — {data.meta.companyName}
                </h1>
                <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                  Secteur {data.meta.sector || "—"} · {data.meta.articles} articles ·
                  {" "}mix {data.meta.sourceMix.national}/{data.meta.sourceMix.regional}/
                  {data.meta.sourceMix.specialise}/{data.meta.sourceMix.blog}
                </p>
              </motion.div>

              {/* ─── Big-number stat cards ─── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  marginBottom: 24,
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                }}
              >
                <BigStat
                  label="Portée totale"
                  value={formatCompact(data.totalReach)}
                  sub="lecteurs nets"
                  color={SAGE}
                />
                <BigStat
                  label="AVE"
                  value={formatCompact(data.aveMAD)}
                  sub={`MAD · ×${data.meta.prMultiplier.toFixed(1)} PR`}
                  color={CHARCOAL}
                />
                <BigStat
                  label="Engagement est."
                  value={formatCompact(data.engagementEst)}
                  sub="interactions"
                  color={SAGE_DARK}
                />
                <BigStat
                  label="Équiv. payant"
                  value={formatCompact(data.paidEquivalent)}
                  sub="MAD · hors PR"
                  color={AMBER}
                />
              </motion.div>

              {/* ─── Two-column: inputs (left) / donut+table (right) ─── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                  marginBottom: 24,
                }}
              >
                {/* ── Left column: sliders ── */}
                <div
                  style={{
                    padding: 18,
                    background: "#FAFAFA",
                    borderRadius: 10,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED, textTransform: "uppercase",
                        letterSpacing: "0.1em", fontWeight: 700,
                      }}
                    >
                      Scénario d&apos;entrée
                    </span>
                    <button
                      onClick={resetScenario}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        padding: "3px 8px", background: WHITE,
                        border: `1px solid ${BORDER}`, borderRadius: 4,
                        fontSize: 10, color: TEXT_BODY, cursor: "pointer",
                        fontFamily: "inherit", fontWeight: 600,
                      }}
                    >
                      <RotateCcw size={10} /> Réinitialiser
                    </button>
                  </div>

                  {/* Articles slider */}
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 12, fontWeight: 600, color: CHARCOAL,
                        }}
                      >
                        Nombre d&apos;articles
                      </label>
                      <span
                        style={{
                          fontSize: 13, fontWeight: 700, color: SAGE,
                          fontFamily: "'Space Mono', monospace",
                        }}
                      >
                        {articles}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={200}
                      step={1}
                      value={articles}
                      onChange={(e) => setArticles(Number(e.target.value))}
                      style={{ ...sliderStyle, accentColor: SAGE }}
                    />
                    <div
                      style={{
                        display: "flex", justifyContent: "space-between",
                        marginTop: 2, fontSize: 10, color: TEXT_MUTED,
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      <span>1</span><span>200</span>
                    </div>
                  </div>

                  {/* Mix sliders */}
                  <div
                    style={{
                      fontSize: 10, fontFamily: "'Space Mono', monospace",
                      color: TEXT_MUTED, textTransform: "uppercase",
                      letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}
                  >
                    <span>Répartition des sources</span>
                    <span style={{ color: mixSum === 100 ? SAGE : AMBER }}>
                      Total {mixSum}%
                    </span>
                  </div>

                  {TIER_ORDER.map((key) => (
                    <MixSlider
                      key={key}
                      tierKey={key}
                      value={sourceMix[key]}
                      onChange={(v) => handleMixChange(key, v)}
                    />
                  ))}

                  {/* Presets */}
                  <div
                    style={{
                      marginTop: 16, paddingTop: 14,
                      borderTop: `1px solid ${BORDER}`,
                      display: "flex", flexWrap: "wrap", gap: 6,
                    }}
                  >
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => applyPreset(p)}
                        style={{
                          padding: "5px 10px", background: WHITE,
                          border: `1px solid ${BORDER}`, borderRadius: 4,
                          fontSize: 11, color: TEXT_BODY, cursor: "pointer",
                          fontFamily: "inherit", fontWeight: 600,
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Right column: donut + table ── */}
                <div
                  style={{
                    padding: 18,
                    background: "#FAFAFA",
                    borderRadius: 10,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10, fontFamily: "'Space Mono', monospace",
                      color: TEXT_MUTED, textTransform: "uppercase",
                      letterSpacing: "0.1em", fontWeight: 700, marginBottom: 14,
                    }}
                  >
                    Répartition & synthèse par tier
                  </div>

                  <div
                    style={{
                      display: "flex", gap: 18, alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <DonutChart
                      slices={TIER_ORDER.map((k) => ({
                        label: TIER_LABELS[k],
                        value: sourceMix[k],
                        color: TIER_COLORS[k],
                      }))}
                      total={data.meta.articles}
                      totalLabel="articles"
                    />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      {TIER_ORDER.map((k) => (
                        <div
                          key={k}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            fontSize: 12,
                          }}
                        >
                          <span
                            style={{
                              width: 10, height: 10, borderRadius: 2,
                              background: TIER_COLORS[k], display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: TEXT_BODY, flex: 1 }}>{TIER_LABELS[k]}</span>
                          <span
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              color: CHARCOAL, fontWeight: 700,
                            }}
                          >
                            {sourceMix[k]}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breakdown table */}
                  <BreakdownTable rows={data.breakdown} />
                </div>
              </div>

              {/* ─── Compare scenarios panel ─── */}
              <AnimatePresence>
                {showCompare && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: 24, overflow: "hidden" }}
                  >
                    <ComparePanel
                      scenarios={scenarios}
                      current={data}
                      onLoad={loadScenario}
                      onDelete={deleteScenario}
                      onClear={clearScenarios}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Footer actions ─── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  display: "flex", gap: 8, alignItems: "center",
                  paddingTop: 16, borderTop: `1px solid ${BORDER}`,
                  flexWrap: "wrap",
                }}
              >
                {/* Save scenario inline form */}
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="Nom du scénario (optionnel)"
                  style={{
                    padding: "8px 12px", background: WHITE,
                    border: `1px solid ${BORDER}`, borderRadius: 8,
                    fontSize: 12, color: CHARCOAL, fontFamily: "inherit",
                    width: 200, outline: "none",
                  }}
                />
                <button
                  onClick={saveScenario}
                  disabled={!data}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", background: justSaved ? SAGE : CHARCOAL,
                    color: WHITE, border: "none", borderRadius: 8,
                    fontSize: 12, fontWeight: 600, cursor: !data ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <Save size={13} /> {justSaved ? "Sauvegardé" : "Sauvegarder scénario"}
                </button>
                <button
                  onClick={() => setShowCompare((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", background: showCompare ? SAGE_BG : "transparent",
                    color: showCompare ? SAGE : TEXT_BODY,
                    border: `1px solid ${showCompare ? SAGE_BORDER : BORDER}`,
                    borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {showCompare ? <EyeOff size={13} /> : <GitCompare size={13} />}
                  Comparer scénarios
                  {scenarios.length > 0 && (
                    <span
                      style={{
                        marginLeft: 4, padding: "1px 6px",
                        background: showCompare ? SAGE : CHARCOAL_BG,
                        color: showCompare ? WHITE : TEXT_BODY,
                        borderRadius: 4, fontSize: 10, fontWeight: 700,
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      {scenarios.length}
                    </span>
                  )}
                </button>
                <div style={{ flex: 1 }} />
                <button
                  onClick={() => void compute()}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", background: "transparent",
                    color: TEXT_BODY, border: `1px solid ${BORDER}`,
                    borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <RefreshCw size={13} /> Recalculer
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", background: SAGE,
                    color: WHITE, border: "none", borderRadius: 8,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <Download size={13} /> Exporter PDF
                </button>
              </motion.div>

              {computing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, marginTop: 12,
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
                    Recalcul en cours...
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
          #media-reach-document, #media-reach-document * {
            visibility: visible;
          }
          #media-reach-document {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 32px;
          }
          #media-reach-document button { display: none !important; }
          #media-reach-document input { display: none !important; }
          #media-reach-document { background: ${WHITE} !important; }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════

// ─── Inline slider style object (reused by every range input) ──
//
// We rely on the browser's native range control + `accentColor` for
// per-tier theming. This avoids fragile vendor-prefixed thumb CSS
// and keeps the slider fully accessible (keyboard, screen-reader).
const sliderStyle: React.CSSProperties = {
  width: "100%",
  height: 4,
  outline: "none",
  cursor: "pointer",
};

// ─── Big-stat card (one of the four hero numbers) ─────────────
function BigStat({
  label, value, sub, color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: WHITE,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontSize: 26, fontWeight: 700, color, lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </span>
      </div>
      <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 4 }}>
        {sub}
      </div>
    </div>
  );
}

// ─── Source-mix slider row (one per tier) ─────────────────────
//
// Combines a tier icon, label, current %, and the range input.
function MixSlider({
  tierKey, value, onChange,
}: {
  tierKey: SourceTierKey;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <TierIcon tierKey={tierKey} size={12} color={TIER_COLORS[tierKey]} />
          <label style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
            {TIER_LABELS[tierKey]}
          </label>
        </div>
        <span
          style={{
            fontSize: 12, fontWeight: 700, color: TIER_COLORS[tierKey],
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ...sliderStyle, accentColor: TIER_COLORS[tierKey] }}
      />
    </div>
  );
}

// ─── Tier icon (Lucide, no emojis) ────────────────────────────
//
// Stable per-tier icon — switches on the key rather than building
// a component inline (which would trip the static-elements lint).
function TierIcon({
  tierKey, size, color, style,
}: {
  tierKey: SourceTierKey;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  switch (tierKey) {
    case "national":
      return <Newspaper size={size} color={color} style={style} />;
    case "regional":
      return <Building2 size={size} color={color} style={style} />;
    case "specialise":
      return <Microscope size={size} color={color} style={style} />;
    case "blog":
      return <Globe size={size} color={color} style={style} />;
  }
}

// ─── Donut chart (SVG, no charting lib) ───────────────────────
//
// Four stroke-dasharray slices around a single circle. The total
// (article count) is rendered in the centre. Empty slices (value 0)
// contribute nothing — the donut gracefully handles a 100% single-
// tier scenario.
function DonutChart({
  slices, total, totalLabel,
}: {
  slices: Array<{ label: string; value: number; color: string }>;
  total: number;
  totalLabel: string;
}) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const sum = slices.reduce((s, x) => s + x.value, 0);

  let offset = 0;
  const arcs = slices.map((s, i) => {
    const fraction = sum > 0 ? s.value / sum : 0;
    const dash = fraction * circumference;
    const el = (
      <circle
        key={i}
        cx={72}
        cy={72}
        r={radius}
        fill="none"
        stroke={s.color}
        strokeWidth={14}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 72 72)"
        strokeLinecap="butt"
      />
    );
    offset += dash;
    return el;
  });

  return (
    <svg
      viewBox="0 0 144 144"
      width={132}
      height={132}
      style={{ flexShrink: 0 }}
    >
      {/* Track ring */}
      <circle
        cx={72} cy={72} r={radius}
        fill="none" stroke={BORDER} strokeWidth={14}
      />
      {arcs}
      {/* Centre label */}
      <text
        x={72} y={68}
        textAnchor="middle"
        style={{
          fontSize: 22, fontWeight: 700, fill: CHARCOAL,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {total}
      </text>
      <text
        x={72} y={86}
        textAnchor="middle"
        style={{
          fontSize: 8, fill: TEXT_MUTED,
          fontFamily: "'Space Mono', monospace",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}
      >
        {totalLabel}
      </text>
    </svg>
  );
}

// ─── Breakdown table ──────────────────────────────────────────
//
// One row per tier (matched by tier label, in canonical order)
// plus a totals row at the bottom. Tier order is fixed to match
// the slider/donut order so the analyst's eye can scan vertically.
function BreakdownTable({ rows }: { rows: MediaReachBreakdownRow[] }) {
  // Re-order rows to canonical tier order (the API may return them
  // in any order — though currently it returns national→blog).
  const ordered = TIER_ORDER.map((k) => {
    const label = TIER_LABELS[k];
    return rows.find((r) => r.tier === label) ?? null;
  }).filter((r): r is MediaReachBreakdownRow => r != null);

  const totals = ordered.reduce(
    (acc, r) => {
      acc.articles += r.articles;
      acc.audience += r.audience;
      acc.reach += r.reach;
      acc.ave += r.ave;
      return acc;
    },
    { articles: 0, audience: 0, reach: 0, ave: 0 },
  );

  return (
    <div
      style={{
        borderRadius: 8, overflow: "hidden",
        border: `1px solid ${BORDER}`,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 0.8fr 1fr 1fr 1fr",
          background: WHITE, padding: "8px 10px",
          fontSize: 9, fontFamily: "'Space Mono', monospace",
          color: TEXT_MUTED, textTransform: "uppercase",
          letterSpacing: "0.08em", fontWeight: 700,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <span>Tier</span>
        <span style={{ textAlign: "right" }}>Articles</span>
        <span style={{ textAlign: "right" }}>Audience</span>
        <span style={{ textAlign: "right" }}>Portée</span>
        <span style={{ textAlign: "right" }}>AVE MAD</span>
      </div>

      {/* Tier rows */}
      {ordered.map((r, i) => {
        const tierKey = TIER_ORDER.find(
          (k) => TIER_LABELS[k] === r.tier,
        );
        const color = tierKey ? TIER_COLORS[tierKey] : SAGE;
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 0.8fr 1fr 1fr 1fr",
              padding: "8px 10px",
              background: i % 2 === 0 ? "#FAFAFA" : WHITE,
              fontSize: 11, color: CHARCOAL,
              alignItems: "center",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8, height: 8, borderRadius: 2,
                  background: color, display: "inline-block", flexShrink: 0,
                }}
              />
              {r.tier}
            </span>
            <span style={{ textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
              {r.articles}
            </span>
            <span style={{ textAlign: "right", fontFamily: "'Space Mono', monospace", color: TEXT_BODY }}>
              {formatCompact(r.audience)}
            </span>
            <span style={{ textAlign: "right", fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>
              {formatCompact(r.reach)}
            </span>
            <span style={{ textAlign: "right", fontFamily: "'Space Mono', monospace", color: SAGE, fontWeight: 700 }}>
              {formatCompact(r.ave)}
            </span>
          </div>
        );
      })}

      {/* Totals row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 0.8fr 1fr 1fr 1fr",
          padding: "9px 10px",
          background: SAGE_BG,
          borderTop: `1px solid ${SAGE_BORDER}`,
          fontSize: 11, fontWeight: 700, color: CHARCOAL,
          alignItems: "center",
        }}
      >
        <span style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Total
        </span>
        <span style={{ textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
          {totals.articles}
        </span>
        <span style={{ textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
          {formatCompact(totals.audience)}
        </span>
        <span style={{ textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
          {formatCompact(totals.reach)}
        </span>
        <span style={{ textAlign: "right", fontFamily: "'Space Mono', monospace", color: SAGE }}>
          {formatCompact(totals.ave)}
        </span>
      </div>
    </div>
  );
}

// ─── Compare panel (saved scenarios side-by-side) ─────────────
//
// Renders every saved scenario as a compact row with its inputs
// (articles + mix), the four KPIs, and load / delete actions.
// Includes the current scenario at the top if data is present.
function ComparePanel({
  scenarios, current, onLoad, onDelete, onClear,
}: {
  scenarios: SavedScenario[];
  current: MediaReachData | null;
  onLoad: (s: SavedScenario) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  // Build a unified "current" row from the live data so the panel
  // shows what the analyst is looking at right now.
  const currentRow: SavedScenario | null = current
    ? {
        id: "current",
        name: "Scénario courant",
        articles: current.meta.articles,
        sourceMix: current.meta.sourceMix,
        totalReach: current.totalReach,
        aveMAD: current.aveMAD,
        engagementEst: current.engagementEst,
        paidEquivalent: current.paidEquivalent,
        createdAt: current.meta.generatedAt,
      }
    : null;

  const rows: SavedScenario[] = currentRow
    ? [currentRow, ...scenarios]
    : scenarios;

  return (
    <div
      style={{
        padding: 16, background: WHITE,
        borderRadius: 10, border: `1px solid ${SAGE_BORDER}`,
      }}
    >
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <GitCompare size={14} style={{ color: SAGE }} />
          <span
            style={{
              fontSize: 11, fontFamily: "'Space Mono', monospace",
              color: SAGE, textTransform: "uppercase",
              letterSpacing: "0.1em", fontWeight: 700,
            }}
          >
            Comparatif de scénarios
          </span>
        </div>
        {scenarios.length > 0 && (
          <button
            onClick={onClear}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 8px", background: "transparent",
              border: `1px solid ${BORDER}`, borderRadius: 4,
              fontSize: 10, color: TEXT_BODY, cursor: "pointer",
              fontFamily: "inherit", fontWeight: 600,
            }}
          >
            <Trash2 size={10} /> Vider
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p
          style={{
            fontSize: 12, color: TEXT_MUTED, margin: 0, padding: "12px 0",
            textAlign: "center",
          }}
        >
          Aucun scénario sauvegardé. Ajustez les curseurs puis cliquez sur
          « Sauvegarder scénario » pour démarrer un comparatif.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%", borderCollapse: "collapse",
              fontSize: 11, fontFamily: "'Inter', sans-serif",
            }}
          >
            <thead>
              <tr
                style={{
                  fontSize: 9, color: TEXT_MUTED,
                  fontFamily: "'Space Mono', monospace",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  fontWeight: 700,
                }}
              >
                <th style={thStyle}>Scénario</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Articles</th>
                <th style={thStyle}>Mix (N/R/S/B)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Portée</th>
                <th style={{ ...thStyle, textAlign: "right" }}>AVE MAD</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Engag.</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Équiv. payant</th>
                <th style={thStyle}> </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const isCurrent = s.id === "current";
                return (
                  <tr
                    key={s.id}
                    style={{
                      borderTop: `1px solid ${BORDER}`,
                      background: isCurrent ? SAGE_BG : "transparent",
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700, color: CHARCOAL }}>
                      {s.name}
                      {isCurrent && (
                        <span
                          style={{
                            marginLeft: 6, padding: "1px 5px",
                            background: SAGE, color: WHITE, borderRadius: 3,
                            fontSize: 8, fontFamily: "'Space Mono', monospace",
                            textTransform: "uppercase", letterSpacing: "0.06em",
                          }}
                        >
                          actuel
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
                      {s.articles}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: "'Space Mono', monospace", color: TEXT_BODY, fontSize: 10 }}>
                      {s.sourceMix.national}/{s.sourceMix.regional}/
                      {s.sourceMix.specialise}/{s.sourceMix.blog}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontFamily: "'Space Mono', monospace", color: SAGE, fontWeight: 600 }}>
                      {formatCompact(s.totalReach)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
                      {formatCompact(s.aveMAD)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
                      {formatCompact(s.engagementEst)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
                      {formatCompact(s.paidEquivalent)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {!isCurrent && (
                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                          <button
                            onClick={() => onLoad(s)}
                            title="Charger ce scénario"
                            style={{
                              width: 22, height: 22, display: "flex",
                              alignItems: "center", justifyContent: "center",
                              background: WHITE, border: `1px solid ${BORDER}`,
                              borderRadius: 4, cursor: "pointer", color: SAGE,
                            }}
                          >
                            <Eye size={11} />
                          </button>
                          <button
                            onClick={() => onDelete(s.id)}
                            title="Supprimer"
                            style={{
                              width: 22, height: 22, display: "flex",
                              alignItems: "center", justifyContent: "center",
                              background: WHITE, border: `1px solid ${BORDER}`,
                              borderRadius: 4, cursor: "pointer", color: TEXT_MUTED,
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Shared table cell styles ─────────────────────────────────
const thStyle: React.CSSProperties = {
  padding: "6px 8px", textAlign: "left", fontWeight: 700,
};
const tdStyle: React.CSSProperties = {
  padding: "8px 8px", color: CHARCOAL, verticalAlign: "middle",
};

// ═══════════════════════════════════════════════════════════════
//  Formatting helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Compact human-readable number: 1.2M, 450K, 1234.
 * Used for the big-stat cards, donut centre, and table cells so
 * the analyst can scan without parsing long digit strings.
 */
function formatCompact(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return v >= 10 ? `${Math.round(v)}M` : `${v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return v >= 10 ? `${Math.round(v)}K` : `${v.toFixed(1)}K`;
  }
  return String(Math.round(n));
}

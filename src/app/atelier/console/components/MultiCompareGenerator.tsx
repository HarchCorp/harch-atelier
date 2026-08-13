"use client";

// ═══════════════════════════════════════════════════════════════
//  MultiCompareGenerator
//
//  Skill 33 — Tableau de comparaison multi-clients (plan Agence).
//
//  Popup comparing up to 5 agency sub-clients side-by-side across
//  9 metrics. Mirrors the BriefingGenerator / EmailDigestGenerator
//  popup pattern (fixed overlay, scale entrance, sections fade-in
//  with framer-motion, print CSS isolation for PDF export).
//
//  Flow:
//    1. On mount → fetch agency clients list (GET /api/agency/clients)
//       → render the checkbox selector (max 5).
//    2. User picks 1-5 clients → click "Comparer" → POST
//       /api/console/multi-compare { clientIds } → render the matrix.
//    3. Matrix view: summary bar + 9-row × N-col comparison table
//       (best=sage, worst=amber) + radar overlay (6 axes, all
//       selected clients superimposed) + footer actions.
//    4. "Sauvegarder la vue" → persists the selected clientIds +
//       a label to localStorage (no DB writes — popups stay portable).
//    5. "Export PDF" → window.print() with print CSS isolating
//       #multi-compare-document.
//
//  Design tokens: white / sage / charcoal, Space Mono (mono labels),
//  Inter (body), Lucide icons, NO emojis. All labels in French.
//
//  Skill ID: SKILL-33-MULTI-COMPARE
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Check,
  Square,
  Minus,
  TrendingUp,
  Award,
  AlertOctagon,
  Save,
  ArrowRight,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// ─── Design tokens (NON-NEGOTIABLE per spec) ───────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const AMBER = "#F59E0B";
const AMBER_BG = "rgba(245,158,11,0.08)";
const AMBER_BORDER = "rgba(245,158,11,0.25)";

// Distinct colors for the radar overlay (1 line per client).
// Sage + charcoal anchor the palette; the others keep lines separable
// when up to 5 clients are superimposed.
const CLIENT_COLORS = [
  SAGE,        // sage — primary client
  CHARCOAL,    // charcoal — secondary
  "#2563EB",   // blue
  "#7C3AED",   // violet
  "#DC2626",   // red
];

// ─── Types — mirrors MultiCompareResponse from route.ts ────────

interface ClientMetrics {
  id: string;
  name: string;
  companyId: string;
  sector: string | null;
  planTier: string;
  score: number;
  sentiment: number;
  mentions: number;
  crisisAlerts: number;
  health: number;
  mrr: number;
  plan: string;
  retention: number;
  harchiqUsage: number;
  bestAxis: string | null;
  worstAxis: string | null;
}

interface PerformerSummary {
  id: string;
  name: string;
  health: number;
  score: number;
}

interface RadarPoint {
  axis: string;
  [clientId: string]: string | number;
}

interface MultiCompareData {
  clients: ClientMetrics[];
  bestPerformer: PerformerSummary | null;
  worstPerformer: PerformerSummary | null;
  radarData: RadarPoint[];
  meta: {
    agencyName: string;
    generatedAt: string;
    clientCount: number;
    source: "neon" | "empty";
  };
}

interface AgencyClientOption {
  id: string;
  displayName: string;
  companyId: string;
  status: string;
  company: { name: string; sector: string | null } | null;
}

interface Feedback {
  type: "success" | "error" | "info";
  message: string;
}

// ─── Section reveal schedule (matrix view) ──────────────────────
const REVEAL_STEPS = [
  { id: "summary", delay: 150 },
  { id: "table",   delay: 350 },
  { id: "radar",   delay: 550 },
  { id: "actions", delay: 750 },
];

// ─── 9 metric rows (label + accessor + formatter) ──────────────
interface MetricRow {
  key: keyof Pick<
    ClientMetrics,
    | "score" | "sentiment" | "mentions" | "crisisAlerts"
    | "health" | "mrr" | "plan" | "retention" | "harchiqUsage"
  >;
  label: string;
  format: (v: number | string) => string;
  // higher = better (true) → best gets sage. lower = better (false) →
  // best gets sage (i.e. the minimum). Used to colour best/worst cells.
  higherIsBetter: boolean;
  // For some metrics (plan), comparison is not numeric — skip the
  // best/worst highlight for those.
  comparable: boolean;
}

const METRIC_ROWS: MetricRow[] = [
  { key: "score",        label: "Score de réputation", format: (v) => `${v}/100`,        higherIsBetter: true,  comparable: true },
  { key: "sentiment",    label: "Sentiment positif",   format: (v) => `${v}%`,           higherIsBetter: true,  comparable: true },
  { key: "mentions",     label: "Mentions (7j)",       format: (v) => String(v),         higherIsBetter: true,  comparable: true },
  { key: "crisisAlerts", label: "Alertes crise (30j)", format: (v) => String(v),         higherIsBetter: false, comparable: true },
  { key: "health",       label: "Santé globale",       format: (v) => `${v}/100`,        higherIsBetter: true,  comparable: true },
  { key: "mrr",          label: "MRR (MAD)",           format: (v) => formatMAD(Number(v)), higherIsBetter: true,  comparable: true },
  { key: "plan",         label: "Plan",                format: (v) => String(v),         higherIsBetter: true,  comparable: false },
  { key: "retention",    label: "Rétention",           format: (v) => `${v}/100`,        higherIsBetter: true,  comparable: true },
  { key: "harchiqUsage", label: "Usage HarchIQ",       format: (v) => String(v),         higherIsBetter: true,  comparable: true },
];

// ─── Formatting helpers ────────────────────────────────────────

/** Format a number as a MAD price (thousand separator). */
function formatMAD(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString("fr-FR");
}

/** Format the generated-at timestamp as "13 août 2026 — 09:42". */
function formatGeneratedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Truncate a client name for the radar legend (max 18 chars). */
function shortName(name: string): string {
  if (name.length <= 18) return name;
  return name.slice(0, 16) + "…";
}

// ─── Component ─────────────────────────────────────────────────

const STORAGE_KEY = "harchiq.multi-compare.savedViews";

interface SavedView {
  id: string;
  label: string;
  clientIds: string[];
  savedAt: string;
}

export function MultiCompareGenerator({
  onClose,
}: {
  onClose: () => void;
}) {
  // Step state: "select" → pick clients; "matrix" → show comparison.
  const [step, setStep] = useState<"select" | "matrix">("select");
  const [clientsList, setClientsList] = useState<AgencyClientOption[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MultiCompareData | null>(null);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // ─── Fetch agency clients list on mount ────────────────────────
  const loadClients = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/agency/clients", { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const list: AgencyClientOption[] = (payload.clients ?? []).map(
        (c: {
          id: string;
          displayName: string;
          companyId: string;
          status: string;
          company: { name: string; sector: string | null } | null;
        }) => ({
          id: c.id,
          displayName: c.displayName || c.company?.name || "Client",
          companyId: c.companyId,
          status: c.status,
          company: c.company,
        }),
      );
      setClientsList(list);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Échec du chargement.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  // Auto-dismiss feedback after 4s.
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  // ─── Toggle a client checkbox (max 5) ──────────────────────────
  const toggleClient = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 5) return prev; // hard cap
        next.add(id);
      }
      return next;
    });
  }, []);

  // ─── Run the comparison ────────────────────────────────────────
  const compare = useCallback(async () => {
    if (selected.size === 0) return;
    setLoading(true);
    setError(null);
    setData(null);
    setVisible(new Set());
    setFeedback(null);
    try {
      const res = await fetch("/api/console/multi-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientIds: Array.from(selected) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const payload: MultiCompareData = await res.json();
      setData(payload);
      setStep("matrix");
      setLoading(false);
      for (const s of REVEAL_STEPS) {
        setTimeout(() => {
          setVisible((prev) => new Set(prev).add(s.id));
        }, s.delay);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false);
    }
  }, [selected]);

  // ─── Reset back to the selector ────────────────────────────────
  const backToSelect = useCallback(() => {
    setStep("select");
    setData(null);
    setError(null);
    setVisible(new Set());
  }, []);

  // ─── Save the current view to localStorage ─────────────────────
  const saveView = useCallback(() => {
    if (!data || data.clients.length === 0) return;
    try {
      const existing: SavedView[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? "[]",
      );
      const view: SavedView = {
        id: `view-${Date.now()}`,
        label: `${data.clients.length} clients — ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`,
        clientIds: data.clients.map((c) => c.id),
        savedAt: new Date().toISOString(),
      };
      const next = [view, ...existing].slice(0, 10); // keep last 10
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setFeedback({
        type: "success",
        message: `Vue sauvegardée — ${data.clients.length} clients (${view.label}).`,
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Impossible de sauvegarder la vue (localStorage indisponible).",
      });
    }
  }, [data]);

  // ─── Derived: best/worst per metric row ────────────────────────
  // Returns a map: rowKey → { bestId, worstId } (or null if not comparable
  // or there's only one client).
  const extremes = useMemo(() => {
    const map = new Map<string, { bestId: string; worstId: string } | null>();
    if (!data || data.clients.length < 2) {
      for (const row of METRIC_ROWS) map.set(row.key, null);
      return map;
    }
    for (const row of METRIC_ROWS) {
      if (!row.comparable) {
        map.set(row.key, null);
        continue;
      }
      let bestId = data.clients[0]!.id;
      let worstId = data.clients[0]!.id;
      let bestVal = numericValue(data.clients[0]!, row.key);
      let worstVal = bestVal;
      for (const c of data.clients.slice(1)) {
        const v = numericValue(c, row.key);
        if (row.higherIsBetter) {
          if (v > bestVal) { bestVal = v; bestId = c.id; }
          if (v < worstVal) { worstVal = v; worstId = c.id; }
        } else {
          if (v < bestVal) { bestVal = v; bestId = c.id; }
          if (v > worstVal) { worstVal = v; worstId = c.id; }
        }
      }
      // Only flag extremes if they actually differ (otherwise everything
      // is "best" AND "worst" simultaneously — meaningless).
      if (bestVal === worstVal) {
        map.set(row.key, null);
      } else {
        map.set(row.key, { bestId, worstId });
      }
    }
    return map;
  }, [data]);

  // ─── Derived: radar data shaped for recharts ───────────────────
  // The route already returns radarData with one row per axis and one
  // numeric key per clientId. We pass it through unchanged to recharts.
  const radarData = data?.radarData ?? [];

  // ─── Derived: average score across selected clients ────────────
  const avgScore = useMemo(() => {
    if (!data || data.clients.length === 0) return 0;
    const sum = data.clients.reduce((s, c) => s + c.score, 0);
    return Math.round(sum / data.clients.length);
  }, [data]);

  const avgHealth = useMemo(() => {
    if (!data || data.clients.length === 0) return 0;
    const sum = data.clients.reduce((s, c) => s + c.health, 0);
    return Math.round(sum / data.clients.length);
  }, [data]);

  const totalMrr = useMemo(() => {
    if (!data) return 0;
    return data.clients.reduce((s, c) => s + c.mrr, 0);
  }, [data]);

  // ═══════════════════════════════════════════════════════════════
  //  Render
  // ═══════════════════════════════════════════════════════════════

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
          maxWidth: step === "matrix" ? 1080 : 720,
          maxHeight: "90vh",
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
        {/* ─── Header bar ─────────────────────────────────────── */}
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
            <Layers size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: CHARCOAL,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Comparaison Multi-Clients
            </span>
            {loading && (
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
                <Loader2 size={11} className="animate-spin" /> Comparaison...
              </span>
            )}
            {data && step === "matrix" && (
              <span
                style={{
                  fontSize: 11,
                  color: TEXT_MUTED,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                · {data.meta.agencyName}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {step === "matrix" && (
              <button
                onClick={backToSelect}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "transparent",
                  color: TEXT_BODY,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                <RefreshCw size={13} /> Sélection
              </button>
            )}
            <button
              onClick={() => window.print()}
              disabled={step !== "matrix" || !data}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: step !== "matrix" || !data ? BORDER : CHARCOAL,
                color: step !== "matrix" || !data ? TEXT_MUTED : WHITE,
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: step !== "matrix" || !data ? "not-allowed" : "pointer",
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

        {/* ─── Body ──────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: step === "matrix" ? "24px 28px" : "32px 40px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: CHARCOAL,
          }}
        >
          {/* ───────── Step 1: client selector ───────── */}
          {step === "select" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: "'Space Mono', monospace",
                    color: SAGE,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 6,
                    fontWeight: 700,
                  }}
                >
                  Étape 1 — Sélection
                </div>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    margin: 0,
                    color: CHARCOAL,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Choisissez les clients à comparer
                </h1>
                <p
                  style={{
                    fontSize: 13,
                    color: TEXT_MUTED,
                    marginTop: 4,
                  }}
                >
                  Sélectionnez 1 à 5 clients. La comparaison portera sur
                  9 métriques de réputation, performance et fidélisation.
                </p>
              </div>

              {/* Selection counter + max-5 hint */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: SAGE_BG,
                  border: `1px solid ${SAGE_BORDER}`,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Check size={14} style={{ color: SAGE }} />
                  <span
                    style={{
                      fontSize: 12,
                      color: SAGE,
                      fontWeight: 600,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {selected.size} / 5 sélectionnés
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: TEXT_MUTED,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  Maximum 5 clients par comparaison
                </span>
              </div>

              {/* Loading / error / list */}
              {listLoading && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Loader2
                    size={24}
                    style={{
                      color: SAGE,
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      color: TEXT_MUTED,
                    }}
                  >
                    Chargement des clients...
                  </p>
                </div>
              )}

              {listError && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <AlertTriangle size={28} style={{ color: AMBER }} />
                  <p
                    style={{
                      marginTop: 10,
                      fontSize: 13,
                      color: AMBER,
                    }}
                  >
                    {listError}
                  </p>
                  <button
                    onClick={loadClients}
                    style={{
                      marginTop: 14,
                      padding: "8px 16px",
                      background: CHARCOAL,
                      color: WHITE,
                      border: "none",
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {!listLoading && !listError && clientsList.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Layers size={28} style={{ color: TEXT_MUTED }} />
                  <p
                    style={{
                      marginTop: 10,
                      fontSize: 13,
                      color: TEXT_MUTED,
                    }}
                  >
                    Aucun client actif dans votre agence pour le moment.
                  </p>
                </div>
              )}

              {!listLoading && !listError && clientsList.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  {clientsList.map((c) => {
                    const isSel = selected.has(c.id);
                    const disabled = !isSel && selected.size >= 5;
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleClient(c.id)}
                        disabled={disabled}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 14px",
                          background: isSel ? SAGE_BG : WHITE,
                          border: `1px solid ${isSel ? SAGE_BORDER : disabled ? BORDER : BORDER}`,
                          borderRadius: 8,
                          cursor: disabled ? "not-allowed" : "pointer",
                          textAlign: "left",
                          opacity: disabled ? 0.5 : 1,
                          transition: "all 0.15s ease",
                          fontFamily: "inherit",
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            border: `1.5px solid ${isSel ? SAGE : TEXT_MUTED}`,
                            background: isSel ? SAGE : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {isSel && <Check size={12} style={{ color: WHITE }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: CHARCOAL,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.displayName}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: TEXT_MUTED,
                              fontFamily: "'Space Mono', monospace",
                              marginTop: 2,
                            }}
                          >
                            {c.company?.sector ?? "—"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Compare button */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  paddingTop: 16,
                  borderTop: `1px solid ${BORDER}`,
                }}
              >
                <button
                  onClick={compare}
                  disabled={selected.size === 0 || loading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    background:
                      selected.size === 0 || loading ? BORDER : CHARCOAL,
                    color: selected.size === 0 || loading ? TEXT_MUTED : WHITE,
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor:
                      selected.size === 0 || loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Comparaison...
                    </>
                  ) : (
                    <>
                      Comparer {selected.size > 0 && `(${selected.size})`}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
                {selected.size > 0 && (
                  <button
                    onClick={() => setSelected(new Set())}
                    disabled={loading}
                    style={{
                      padding: "10px 16px",
                      background: "transparent",
                      color: TEXT_BODY,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              {error && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 14px",
                    background: AMBER_BG,
                    border: `1px solid ${AMBER_BORDER}`,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={14} style={{ color: AMBER }} />
                  <span style={{ fontSize: 12, color: AMBER }}>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* ───────── Step 2: matrix view ───────── */}
          {step === "matrix" && data && (
            <div id="multi-compare-document">
              <AnimatePresence>
                {visible.has("summary") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    {/* Title + generated-at */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "'Space Mono', monospace",
                          color: SAGE,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontWeight: 700,
                        }}
                      >
                        Comparaison
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED,
                        }}
                      >
                        · {formatGeneratedAt(data.meta.generatedAt)}
                      </span>
                    </div>
                    <h1
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        margin: 0,
                        color: CHARCOAL,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {data.clients.length} clients — score moyen {avgScore}/100
                    </h1>

                    {/* Summary bar: 4 KPI tiles */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 8,
                        marginTop: 16,
                      }}
                    >
                      <SummaryTile
                        label="Clients"
                        value={String(data.clients.length)}
                      />
                      <SummaryTile
                        label="Score moyen"
                        value={`${avgScore}`}
                        sub="/ 100"
                        color={avgScore >= 70 ? SAGE : avgScore >= 50 ? AMBER : "#EF4444"}
                      />
                      <SummaryTile
                        label="Santé moyenne"
                        value={`${avgHealth}`}
                        sub="/ 100"
                        color={avgHealth >= 70 ? SAGE : avgHealth >= 50 ? AMBER : "#EF4444"}
                      />
                      <SummaryTile
                        label="MRR total"
                        value={formatMAD(totalMrr)}
                        sub="MAD"
                      />
                    </div>

                    {/* Best / worst performer pills */}
                    {data.bestPerformer && data.worstPerformer && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <PerformerPill
                          icon={Award}
                          tone="sage"
                          label="Meilleur performeur"
                          name={data.bestPerformer.name}
                          detail={`Santé ${data.bestPerformer.health} · Score ${data.bestPerformer.score}`}
                        />
                        <PerformerPill
                          icon={AlertOctagon}
                          tone="amber"
                          label="À surveiller"
                          name={data.worstPerformer.name}
                          detail={`Santé ${data.worstPerformer.health} · Score ${data.worstPerformer.score}`}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visible.has("table") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 28 }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 8,
                      }}
                    >
                      Tableau comparatif — 9 métriques
                    </div>
                    <ComparisonTable
                      clients={data.clients}
                      extremes={extremes}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        marginTop: 8,
                        fontSize: 10,
                        color: TEXT_MUTED,
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      <span>
                        <span style={{ color: SAGE }}>■</span> meilleur
                      </span>
                      <span>
                        <span style={{ color: AMBER }}>■</span> à surveiller
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visible.has("radar") && radarData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 8,
                      }}
                    >
                      Profil radar — 6 axes normalisés (0-100)
                    </div>
                    <div
                      style={{
                        padding: 16,
                        background: "#FAFAFA",
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      <div style={{ width: "100%", height: 340 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="72%"
                            data={radarData}
                          >
                            <PolarGrid
                              stroke={BORDER}
                              strokeDasharray="2 3"
                            />
                            <PolarAngleAxis
                              dataKey="axis"
                              tick={{
                                fill: TEXT_BODY,
                                fontSize: 11,
                                fontFamily: "'Space Mono', monospace",
                              }}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 100]}
                              tick={{
                                fill: TEXT_MUTED,
                                fontSize: 9,
                                fontFamily: "'Space Mono', monospace",
                              }}
                              axisLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: WHITE,
                                border: `1px solid ${BORDER}`,
                                borderRadius: 6,
                                fontSize: 12,
                                fontFamily: "'Space Mono', monospace",
                              }}
                              labelStyle={{ color: CHARCOAL, fontWeight: 700 }}
                            />
                            <Legend
                              wrapperStyle={{
                                fontSize: 11,
                                fontFamily: "'Inter', sans-serif",
                                paddingTop: 8,
                              }}
                              formatter={(value: string) =>
                                shortName(clientNameById(data.clients, value))
                              }
                            />
                            {data.clients.map((c, idx) => (
                              <Radar
                                key={c.id}
                                name={c.id}
                                dataKey={c.id}
                                stroke={CLIENT_COLORS[idx % CLIENT_COLORS.length]}
                                strokeWidth={2}
                                fill={CLIENT_COLORS[idx % CLIENT_COLORS.length]}
                                fillOpacity={0.12}
                                animationBegin={idx * 200}
                                animationDuration={900}
                                animationEasing="ease-out"
                              />
                            ))}
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visible.has("actions") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex",
                      gap: 8,
                      paddingTop: 16,
                      borderTop: `1px solid ${BORDER}`,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={saveView}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 16px",
                        background: SAGE,
                        color: WHITE,
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <Save size={14} /> Sauvegarder la vue
                    </button>
                    <button
                      onClick={() => window.print()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 16px",
                        background: CHARCOAL,
                        color: WHITE,
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <Download size={14} /> Export PDF
                    </button>
                    <button
                      onClick={backToSelect}
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
                      <RefreshCw size={14} /> Nouvelle sélection
                    </button>

                    {feedback && (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          color:
                            feedback.type === "success"
                              ? SAGE
                              : feedback.type === "error"
                              ? "#EF4444"
                              : TEXT_MUTED,
                          fontFamily: "'Space Mono', monospace",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {feedback.type === "success" ? (
                          <Check size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}
                        {feedback.message}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {loading && (
                <div
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
                    Calcul des métriques en cours...
                  </span>
                </div>
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
          #multi-compare-document,
          #multi-compare-document * { visibility: visible; }
          #multi-compare-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════

/** Pull a numeric value out of a ClientMetrics row for a given metric key. */
function numericValue(
  c: ClientMetrics,
  key: MetricRow["key"],
): number {
  const v = c[key];
  return typeof v === "number" ? v : 0;
}

/** Resolve a clientId to its display name (for the radar legend). */
function clientNameById(
  clients: ClientMetrics[],
  id: string,
): string {
  return clients.find((c) => c.id === id)?.name ?? id;
}

/** A single KPI tile in the summary bar. */
function SummaryTile({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "#FAFAFA",
        borderRadius: 8,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontFamily: "'Space Mono', monospace",
          color: TEXT_MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: color ?? CHARCOAL,
            lineHeight: 1.1,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {value}
        </span>
        {sub && (
          <span
            style={{
              fontSize: 10,
              color: TEXT_MUTED,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

/** A pill badge for the best/worst performer summary. */
function PerformerPill({
  icon: Icon,
  tone,
  label,
  name,
  detail,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  tone: "sage" | "amber";
  label: string;
  name: string;
  detail: string;
}) {
  const isSage = tone === "sage";
  const fg = isSage ? SAGE : AMBER;
  const bg = isSage ? SAGE_BG : AMBER_BG;
  const border = isSage ? SAGE_BORDER : AMBER_BORDER;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        flex: "1 1 auto",
        minWidth: 0,
      }}
    >
      <Icon size={16} style={{ color: fg, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 9,
            fontFamily: "'Space Mono', monospace",
            color: fg,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: CHARCOAL,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: TEXT_MUTED,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}

/**
 * The 9-row × N-col comparison table.
 * Best cell per row is highlighted sage; worst is amber.
 * When a row has a non-comparable metric (e.g. "Plan"), cells render
 * as plain text with no highlight.
 */
function ComparisonTable({
  clients,
  extremes,
}: {
  clients: ClientMetrics[];
  extremes: Map<string, { bestId: string; worstId: string } | null>;
}) {
  // Build column widths: 1 label column + N client columns (equal).
  const labelCol = "32%";
  const clientCol = `${Math.floor(68 / clients.length)}%`;

  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        overflow: "hidden",
        background: WHITE,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          background: "#FAFAFA",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div
          style={{
            width: labelCol,
            padding: "10px 12px",
            fontSize: 10,
            fontFamily: "'Space Mono', monospace",
            color: TEXT_MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          Métrique
        </div>
        {clients.map((c, idx) => (
          <div
            key={c.id}
            style={{
              width: clientCol,
              padding: "10px 12px",
              fontSize: 12,
              fontWeight: 700,
              color: CHARCOAL,
              borderLeft: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              gap: 6,
              minWidth: 0,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: CLIENT_COLORS[idx % CLIENT_COLORS.length],
                flexShrink: 0,
              }}
            />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {c.name}
            </span>
          </div>
        ))}
      </div>

      {/* Metric rows */}
      {METRIC_ROWS.map((row, rowIdx) => {
        const ext = extremes.get(row.key) ?? null;
        return (
          <div
            key={row.key}
            style={{
              display: "flex",
              borderBottom:
                rowIdx < METRIC_ROWS.length - 1
                  ? `1px solid ${BORDER}`
                  : "none",
            }}
          >
            <div
              style={{
                width: labelCol,
                padding: "10px 12px",
                fontSize: 12,
                color: TEXT_BODY,
                fontWeight: 600,
                background: "#FCFCFC",
              }}
            >
              {row.label}
            </div>
            {clients.map((c) => {
              const isBest = ext?.bestId === c.id;
              const isWorst = ext?.worstId === c.id;
              const bg = isBest
                ? SAGE_BG
                : isWorst
                ? AMBER_BG
                : "transparent";
              const fg = isBest
                ? SAGE
                : isWorst
                ? AMBER
                : CHARCOAL;
              return (
                <div
                  key={c.id}
                  style={{
                    width: clientCol,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: fg,
                    background: bg,
                    borderLeft: `1px solid ${BORDER}`,
                    fontFamily: "'Space Mono', monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {isBest && <Check size={11} style={{ color: SAGE }} />}
                  {isWorst && <Minus size={11} style={{ color: AMBER }} />}
                  <span>
                    {row.format(c[row.key] as number | string)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

"use client";

// ═══════════════════════════════════════════════════════════════
//  ApiKeyManagerGenerator
//
//  Skill 29 — Gestionnaire de clés API (Enterprise / Agency).
//  Génère, révoque et surveille les clés Bearer `harch_*`.
//
//  Même motif de popup que BriefingGenerator / GeoHeatmapGenerator :
//    • overlay fixe avec backdrop blur
//    • entrée en scale (framer-motion)
//    • sections révélées une à une (AnimatePresence)
//    • barre d'actions : Export PDF (window.print) · Régénérer
//    • CSS print isolant #api-keys-document
//
//  Palette : Blanc / Sage / Charcoal — outil stratégique, pas crise.
//  Typographie : Space Mono (labels techniques, clés, code curl),
//                Inter (corps).
//  Icônes : Lucide uniquement. Aucun emoji.
//
//  Structure du corps :
//    a. En-tête — date + entreprise + ID entreprise
//    b. Bande synthèse — Total / Actives / Révoquées / Limite
//    c. Formulaire "Générer une clé" — nom + sélecteur palier
//    d. Tableau des clés — nom, clé masquée, créée, dernière
//       utilisation, appels, statut, actions (détail, révoquer)
//    e. Snippet de documentation — exemple curl
//    f. Actions — Export PDF · Régénérer
//
//  Modale détail clé (ouverte au clic sur une ligne ou après création) :
//    • Clé complète (UNE SEULE FOIS à la création) + bouton copier
//    • Avertissement de sécurité
//    • Carte palier de rate limit
//    • Carte consommation — compteur + jauge + mini-graphe 14 jours
//    • Bouton Révoquer (avec confirmation)
//
//  Skill ID : SKILL-29-API-KEYS
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  Key, Plus, Copy, Check, Ban, Clock, Activity,
  FileCode, Shield, ChevronRight, Calendar, Trash2,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const RED = "#DC2626";
const RED_BG = "rgba(220,38,38,0.08)";
const RED_BORDER = "rgba(220,38,38,0.25)";
const AMBER = "#D97706";
const AMBER_BG = "rgba(217,119,6,0.08)";
const AMBER_BORDER = "rgba(217,119,6,0.25)";
const GRAY_NEUTRAL = "#9CA3AF";
const GRAY_NEUTRAL_BG = "rgba(156,163,175,0.12)";

// ─── Types — miroir du route.ts ───────────────────────────────

type KeyStatus = "active" | "expired" | "revoked";

interface ManagedApiKey {
  id: string;
  name: string;
  maskedKey: string;
  prefix: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  status: KeyStatus;
  rateLimitId: string;
  rateLimitLabel: string;
  requestsPerMonth: number;
  usageCount: number;
  usageHistory: number[];
  owner: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  } | null;
  revokedAt: string | null;
  expiresAt: string | null;
}

interface RateLimitPreset {
  id: string;
  label: string;
  requestsPerHour: number;
  requestsPerMonth: number;
  description: string;
}

interface ApiKeysListResponse {
  keys: ManagedApiKey[];
  total: number;
  active: number;
  revoked: number;
  expired: number;
  limit: number;
  rateLimits: RateLimitPreset[];
  meta: {
    companyName: string;
    companyId: string;
    generatedAt: string;
  };
}

interface ApiKeyCreatedResponse {
  key: string;
  keyId: string;
  name: string;
  prefix: string | null;
  rateLimitId: string;
  rateLimitLabel: string;
  createdAt: string;
  warning: string;
  curlExample: string;
}

// ─── Cadence de révélation des sections ──────────────────────
const SECTIONS = [
  { id: "header",  delay: 150 },
  { id: "summary", delay: 300 },
  { id: "create",  delay: 450 },
  { id: "table",   delay: 600 },
  { id: "docs",    delay: 800 },
  { id: "actions", delay: 950 },
];

// ─── Helpers de formatage ────────────────────────────────────

function formatNumber(n: number): string {
  if (n < 0) return "—";
  return n.toLocaleString("fr-FR");
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function relativeTime(iso: string | null): string {
  if (!iso) return "jamais";
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diffMin = Math.floor((now - then) / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `il y a ${diffH} h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 30) return `il y a ${diffD} j`;
    return formatDate(iso);
  } catch {
    return "—";
  }
}

// ─── Couleurs de statut ──────────────────────────────────────
function statusColor(s: KeyStatus): string {
  if (s === "active") return SAGE;
  if (s === "revoked") return RED;
  return AMBER;
}
function statusBg(s: KeyStatus): string {
  if (s === "active") return SAGE_BG;
  if (s === "revoked") return RED_BG;
  return AMBER_BG;
}
function statusBorder(s: KeyStatus): string {
  if (s === "active") return SAGE_BORDER;
  if (s === "revoked") return RED_BORDER;
  return AMBER_BORDER;
}
function statusLabel(s: KeyStatus): string {
  if (s === "active") return "Active";
  if (s === "revoked") return "Révoquée";
  return "Expirée";
}

// ═══════════════════════════════════════════════════════════════
//  Composant principal
// ═══════════════════════════════════════════════════════════════

export function ApiKeyManagerGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiKeysListResponse | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  // Formulaire de génération
  const [formName, setFormName] = useState("");
  const [formRateLimitId, setFormRateLimitId] = useState("standard");
  const [formError, setFormError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Modale détail (clé sélectionnée dans le tableau)
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);

  // Clé nouvellement créée — plaintext affiché UNE FOIS
  const [newlyCreated, setNewlyCreated] = useState<{
    plaintext: string;
    keyId: string;
    warning: string;
    curlExample: string;
  } | null>(null);

  // Révocation en cours (per-key loading)
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  // ─── Fetch initial ───────────────────────────────────────
  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/console/api-keys-manager", { method: "GET" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as ApiKeysListResponse;
      setData(json);
      // Seed le sélecteur avec le premier palier dispo si data.rateLimits est présent
      if (json.rateLimits.length > 0 && !json.rateLimits.some((r) => r.id === formRateLimitId)) {
        setFormRateLimitId(json.rateLimits[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du chargement");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchKeys();
    // Révélation échelonnée des sections (motif BriefingGenerator)
    for (const section of SECTIONS) {
      setTimeout(() => {
        setVisibleSections((prev) => new Set(prev).add(section.id));
      }, section.delay);
    }
  }, [fetchKeys]);

  // ─── Génération de clé ────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setFormError(null);
    if (!formName.trim() || formName.trim().length < 3) {
      setFormError("Le nom doit contenir au moins 3 caractères.");
      return;
    }
    if (formName.trim().length > 64) {
      setFormError("Le nom ne peut pas dépasser 64 caractères.");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/console/api-keys-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim(), rateLimitId: formRateLimitId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const created = (await res.json()) as ApiKeyCreatedResponse;

      // Reset form
      setFormName("");
      // Ouvre la modale détail avec la clé en clair
      setNewlyCreated({
        plaintext: created.key,
        keyId: created.keyId,
        warning: created.warning,
        curlExample: created.curlExample,
      });
      setSelectedKeyId(created.keyId);

      // Rafraîchit la liste
      await fetchKeys();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Échec de la génération");
    } finally {
      setGenerating(false);
    }
  }, [formName, formRateLimitId, fetchKeys]);

  // ─── Révocation ───────────────────────────────────────────
  const handleRevoke = useCallback(
    async (keyId: string) => {
      setRevokingId(keyId);
      try {
        const res = await fetch(`/api/console/api-keys-manager?id=${encodeURIComponent(keyId)}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        setConfirmRevokeId(null);
        // Si la clé révoquée est sélectionnée, on ferme la modale détail
        // (sauf si c'est la clé nouvellement créée — cas impossible en pratique)
        if (selectedKeyId === keyId) {
          setSelectedKeyId(null);
          setNewlyCreated(null);
        }
        await fetchKeys();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Échec de la révocation");
      } finally {
        setRevokingId(null);
      }
    },
    [fetchKeys, selectedKeyId],
  );

  // ─── Clé sélectionnée (détail) ────────────────────────────
  const selectedKey = useMemo<ManagedApiKey | null>(() => {
    if (!data || !selectedKeyId) return null;
    return data.keys.find((k) => k.id === selectedKeyId) ?? null;
  }, [data, selectedKeyId]);

  // ─── Stats synthèse ───────────────────────────────────────
  const stats = useMemo(() => {
    if (!data) return { total: 0, active: 0, revoked: 0, expired: 0, limit: 0, used: 0 };
    return {
      total: data.total,
      active: data.active,
      revoked: data.revoked,
      expired: data.expired,
      limit: data.limit,
      used: data.active, // clés utilisées = clés actives
    };
  }, [data]);

  // ─── Render ───────────────────────────────────────────────
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
          width: "100%", maxWidth: 1100, maxHeight: "92vh",
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
            <Key size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14, fontWeight: 700, color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Gestionnaire de Clés API
            </span>
            {loading && (
              <span
                style={{
                  display: "flex", alignItems: "center", gap: 4, fontSize: 11,
                  color: SAGE, fontFamily: "'Space Mono', monospace",
                }}
              >
                <Loader2 size={11} className="animate-spin" /> Chargement...
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              disabled={loading || !data}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                background: loading || !data ? BORDER : CHARCOAL,
                color: loading || !data ? TEXT_MUTED : WHITE,
                border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: loading || !data ? "not-allowed" : "pointer",
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

        {/* ─── Corps ─── */}
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
                Récupération des clés API de votre entreprise...
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: RED }} />
              <p style={{ marginTop: 12, fontSize: 14, color: RED }}>{error}</p>
              <button
                onClick={fetchKeys}
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
            <div id="api-keys-document">
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
                        Console Enterprise · Gestion des accès API
                      </span>
                    </div>
                    <h1
                      style={{
                        fontSize: 26, fontWeight: 700, margin: 0, color: CHARCOAL,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Clés API — {data.meta.companyName}
                    </h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                      {data.total} clé{data.total > 1 ? "s" : ""} au total ·
                      {" "}{data.active} active{data.active > 1 ? "s" : ""} ·
                      {" "}Limite {data.limit} par entreprise ·
                      {" "}<span style={{ fontFamily: "'Space Mono', monospace" }}>
                        {data.meta.companyId}
                      </span>
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
                      label="Total clés"
                      value={String(stats.total)}
                      color={CHARCOAL}
                    />
                    <SummaryStat
                      label="Actives"
                      value={String(stats.active)}
                      color={SAGE}
                    />
                    <SummaryStat
                      label="Révoquées"
                      value={String(stats.revoked)}
                      color={stats.revoked > 0 ? RED : TEXT_MUTED}
                    />
                    <SummaryStat
                      label="Quota entreprise"
                      value={`${stats.active} / ${stats.limit}`}
                      color={stats.active >= stats.limit ? RED : TEXT_BODY}
                      pulse={stats.active >= stats.limit}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── C. Formulaire "Générer une clé" ─── */}
              <AnimatePresence>
                {visibleSections.has("create") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24, padding: 20, background: "#FAFAFA",
                      borderRadius: 8, border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 6, marginBottom: 14,
                      }}
                    >
                      <Plus size={14} style={{ color: SAGE }} />
                      <span
                        style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: SAGE, textTransform: "uppercase",
                          letterSpacing: "0.1em", fontWeight: 700,
                        }}
                      >
                        Générer une nouvelle clé
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(220px, 1fr) 1fr",
                        gap: 16, alignItems: "start",
                      }}
                    >
                      {/* Nom de la clé */}
                      <div>
                        <label
                          htmlFor="api-key-name"
                          style={{
                            display: "block", fontSize: 11, fontWeight: 600,
                            color: TEXT_BODY, marginBottom: 6,
                          }}
                        >
                          Nom de la clé
                        </label>
                        <input
                          id="api-key-name"
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Ex. Dashboard BI — Production"
                          maxLength={64}
                          style={{
                            width: "100%", padding: "10px 12px",
                            background: WHITE, color: CHARCOAL,
                            border: `1px solid ${BORDER}`, borderRadius: 6,
                            fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif",
                            outline: "none",
                            transition: "border 150ms ease",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = SAGE)}
                          onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
                        />
                        <p style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 4 }}>
                          3 à 64 caractères. Le nom apparaîtra dans le tableau et les logs d'audit.
                        </p>
                      </div>

                      {/* Sélecteur de palier */}
                      <div>
                        <label
                          style={{
                            display: "block", fontSize: 11, fontWeight: 600,
                            color: TEXT_BODY, marginBottom: 6,
                          }}
                        >
                          Palier de rate limit
                        </label>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 6,
                          }}
                        >
                          {data.rateLimits.map((rl) => {
                            const selected = formRateLimitId === rl.id;
                            return (
                              <button
                                key={rl.id}
                                type="button"
                                onClick={() => setFormRateLimitId(rl.id)}
                                title={rl.description}
                                style={{
                                  padding: "8px 6px",
                                  background: selected ? SAGE_BG : WHITE,
                                  border: `1px solid ${selected ? SAGE_BORDER : BORDER}`,
                                  borderRadius: 6, cursor: "pointer",
                                  fontFamily: "inherit",
                                  transition: "all 150ms ease",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 11, fontWeight: 700,
                                    color: selected ? SAGE : CHARCOAL,
                                    marginBottom: 2,
                                  }}
                                >
                                  {rl.label}
                                </div>
                                <div
                                  style={{
                                    fontSize: 9, color: TEXT_MUTED,
                                    fontFamily: "'Space Mono', monospace",
                                  }}
                                >
                                  {rl.requestsPerHour < 0
                                    ? "∞ / h"
                                    : `${formatNumber(rl.requestsPerHour)} / h`}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <p style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 4 }}>
                          {data.rateLimits.find((r) => r.id === formRateLimitId)?.description}
                        </p>
                      </div>
                    </div>

                    {formError && (
                      <div
                        style={{
                          marginTop: 12, padding: "8px 12px",
                          background: RED_BG, border: `1px solid ${RED_BORDER}`,
                          borderRadius: 6, fontSize: 12, color: RED,
                          display: "flex", alignItems: "center", gap: 6,
                        }}
                      >
                        <AlertTriangle size={12} />
                        {formError}
                      </div>
                    )}

                    <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                      <button
                        onClick={handleGenerate}
                        disabled={generating || stats.active >= stats.limit}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "9px 18px",
                          background: generating || stats.active >= stats.limit ? BORDER : CHARCOAL,
                          color: generating || stats.active >= stats.limit ? TEXT_MUTED : WHITE,
                          border: "none", borderRadius: 6,
                          fontSize: 12, fontWeight: 600, cursor: generating || stats.active >= stats.limit ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {generating ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Key size={13} />
                        )}
                        {generating ? "Génération..." : "Générer la clé"}
                      </button>
                      {stats.active >= stats.limit && (
                        <span
                          style={{
                            alignSelf: "center", fontSize: 11, color: RED,
                            fontFamily: "'Space Mono', monospace",
                          }}
                        >
                          Quota atteint — révoquez une clé pour en générer une nouvelle.
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── D. Tableau des clés ─── */}
              <AnimatePresence>
                {visibleSections.has("table") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    <div
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED, textTransform: "uppercase",
                        letterSpacing: "0.1em", fontWeight: 700,
                        marginBottom: 10,
                      }}
                    >
                      Clés existantes — {data.total} entrée{data.total > 1 ? "s" : ""}
                    </div>

                    {data.keys.length === 0 ? (
                      <div
                        style={{
                          padding: "40px 20px", textAlign: "center",
                          background: "#FAFAFA", borderRadius: 8,
                          border: `1px dashed ${BORDER}`,
                        }}
                      >
                        <Key size={28} style={{ color: TEXT_MUTED }} />
                        <p style={{ marginTop: 12, fontSize: 13, color: TEXT_BODY, fontWeight: 600 }}>
                          Aucune clé API enregistrée
                        </p>
                        <p style={{ marginTop: 4, fontSize: 12, color: TEXT_MUTED }}>
                          Utilisez le formulaire ci-dessus pour générer votre première clé.
                        </p>
                      </div>
                    ) : (
                      <div
                        style={{
                          border: `1px solid ${BORDER}`, borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        {/* En-tête tableau */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(140px, 1.4fr) minmax(160px, 1.6fr) 100px 120px 90px 90px 80px",
                            gap: 0, background: "#FAFAFA",
                            borderBottom: `1px solid ${BORDER}`,
                            fontSize: 10, fontFamily: "'Space Mono', monospace",
                            color: TEXT_MUTED, textTransform: "uppercase",
                            letterSpacing: "0.08em", fontWeight: 700,
                          }}
                        >
                          <Th>Nom</Th>
                          <Th>Clé</Th>
                          <Th>Créée</Th>
                          <Th>Dernière util.</Th>
                          <Th align="right">Appels</Th>
                          <Th>Statut</Th>
                          <Th align="center">Actions</Th>
                        </div>

                        {/* Lignes tableau */}
                        {data.keys.map((k) => (
                          <KeyRow
                            key={k.id}
                            k={k}
                            onSelect={() => {
                              setSelectedKeyId(k.id);
                              setNewlyCreated(null);
                            }}
                            onRevoke={() => setConfirmRevokeId(k.id)}
                            revoking={revokingId === k.id}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── E. Snippet de documentation ─── */}
              <AnimatePresence>
                {visibleSections.has("docs") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24, padding: 16, background: "#FAFAFA",
                      borderRadius: 8, border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
                      }}
                    >
                      <FileCode size={14} style={{ color: SAGE }} />
                      <span
                        style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: SAGE, textTransform: "uppercase",
                          letterSpacing: "0.1em", fontWeight: 700,
                        }}
                      >
                        Documentation — exemple d'appel
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: TEXT_BODY, marginBottom: 10, lineHeight: 1.5 }}>
                      Toutes les routes <code style={{
                        padding: "1px 4px", background: WHITE, borderRadius: 3,
                        fontFamily: "'Space Mono', monospace", fontSize: 11, color: SAGE,
                        border: `1px solid ${BORDER}`,
                      }}>/api/v1/*</code> acceptent une clé Bearer dans l'en-tête
                      {" "}<code style={{
                        padding: "1px 4px", background: WHITE, borderRadius: 3,
                        fontFamily: "'Space Mono', monospace", fontSize: 11, color: SAGE,
                        border: `1px solid ${BORDER}`,
                      }}>Authorization</code>. Remplacez <code style={{
                        padding: "1px 4px", background: WHITE, borderRadius: 3,
                        fontFamily: "'Space Mono', monospace", fontSize: 11, color: SAGE,
                        border: `1px solid ${BORDER}`,
                      }}>harch_votre_cle</code> par la clé générée ci-dessus.
                    </p>
                    <CurlSnippet
                      snippet={`curl -X GET \\\n  -H "Authorization: Bearer harch_votre_cle" \\\n  -H "Content-Type: application/json" \\\n  "https://harch.atelier/api/v1/reputation"`}
                    />
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
                      onClick={fetchKeys}
                      disabled={loading}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 16px", background: "transparent",
                        color: TEXT_BODY, border: `1px solid ${BORDER}`,
                        borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <RefreshCw size={14} /> Actualiser
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Modale détail (par-dessus le popup principal) ─── */}
      <AnimatePresence>
        {selectedKey && (
          <KeyDetailModal
            k={selectedKey}
            newlyCreated={newlyCreated}
            revoking={revokingId === selectedKey.id}
            onClose={() => {
              setSelectedKeyId(null);
              setNewlyCreated(null);
            }}
            onRevoke={() => setConfirmRevokeId(selectedKey.id)}
          />
        )}
      </AnimatePresence>

      {/* ─── Modale de confirmation de révocation ─── */}
      <AnimatePresence>
        {confirmRevokeId && (
          <RevokeConfirmModal
            keyName={data?.keys.find((k) => k.id === confirmRevokeId)?.name ?? ""}
            keyPrefix={data?.keys.find((k) => k.id === confirmRevokeId)?.prefix ?? ""}
            revoking={revokingId === confirmRevokeId}
            onConfirm={() => void handleRevoke(confirmRevokeId)}
            onCancel={() => setConfirmRevokeId(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── CSS : animations + impression ─── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media print {
          body * { visibility: hidden; }
          #api-keys-document, #api-keys-document * { visibility: visible; }
          #api-keys-document {
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

// ─── Cellule d'en-tête de tableau ────────────────────────────
function Th({
  children, align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        textAlign: align,
        display: "flex",
        alignItems: "center",
        justifyContent:
          align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
      }}
    >
      {children}
    </div>
  );
}

// ─── Ligne de tableau (clé) ──────────────────────────────────
function KeyRow({
  k, onSelect, onRevoke, revoking,
}: {
  k: ManagedApiKey;
  onSelect: () => void;
  onRevoke: () => void;
  revoking: boolean;
}) {
  const sColor = statusColor(k.status);
  const sBg = statusBg(k.status);
  const sBorder = statusBorder(k.status);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(140px, 1.4fr) minmax(160px, 1.6fr) 100px 120px 90px 90px 80px",
        gap: 0, borderBottom: `1px solid ${BORDER}`,
        transition: "background 120ms ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Nom */}
      <div
        style={{
          padding: "12px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}
        onClick={onSelect}
      >
        <ChevronRight size={12} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL }}>
          {k.name}
        </span>
      </div>

      {/* Clé masquée */}
      <div
        style={{
          padding: "12px", cursor: "pointer",
          display: "flex", alignItems: "center",
        }}
        onClick={onSelect}
      >
        <code
          style={{
            fontSize: 11, fontFamily: "'Space Mono', monospace",
            color: TEXT_BODY, letterSpacing: "0.02em",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: "100%",
          }}
        >
          {k.maskedKey}
        </code>
      </div>

      {/* Créée */}
      <div
        style={{ padding: "12px", cursor: "pointer", display: "flex", alignItems: "center" }}
        onClick={onSelect}
      >
        <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace" }}>
          {formatDate(k.createdAt)}
        </span>
      </div>

      {/* Dernière utilisation */}
      <div
        style={{
          padding: "12px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4,
        }}
        onClick={onSelect}
      >
        <Clock size={11} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: TEXT_MUTED }}>
          {relativeTime(k.lastUsedAt)}
        </span>
      </div>

      {/* Appels */}
      <div
        style={{
          padding: "12px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
        }}
        onClick={onSelect}
      >
        <span
          style={{
            fontSize: 12, fontWeight: 600, color: CHARCOAL,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {formatNumber(k.usageCount)}
        </span>
      </div>

      {/* Statut */}
      <div
        style={{ padding: "12px", cursor: "pointer", display: "flex", alignItems: "center" }}
        onClick={onSelect}
      >
        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", background: sBg, border: `1px solid ${sBorder}`,
            borderRadius: 4, fontSize: 10, fontWeight: 700, color: sColor,
            fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sColor }} />
          {statusLabel(k.status)}
        </span>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: "8px 6px", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {k.status === "revoked" ? (
          <span style={{ fontSize: 10, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace" }}>
            —
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRevoke();
            }}
            disabled={revoking}
            title="Révoquer"
            aria-label={`Révoquer la clé ${k.name}`}
            style={{
              width: 28, height: 28, display: "flex", alignItems: "center",
              justifyContent: "center", background: "transparent",
              border: `1px solid ${BORDER}`, borderRadius: 4, cursor: "pointer",
              color: RED, transition: "all 120ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = RED_BG;
              e.currentTarget.style.borderColor = RED_BORDER;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = BORDER;
            }}
          >
            {revoking ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Ban size={13} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Stat synthétique ────────────────────────────────────────
function SummaryStat({
  label, value, color, pulse,
}: {
  label: string;
  value: string;
  color: string;
  pulse?: boolean;
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
        <span
          style={{
            fontSize: 22, fontWeight: 700, color, lineHeight: 1,
            fontFamily: "'Space Mono', monospace",
            animation: pulse ? "pulse 1s infinite" : "none",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Snippet curl avec bouton copier ─────────────────────────
function CurlSnippet({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // navigator.clipboard peut échouer en iframe ou sans HTTPS
      setCopied(false);
    }
  }, [snippet]);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={handleCopy}
        style={{
          position: "absolute", top: 8, right: 8,
          display: "flex", alignItems: "center", gap: 4,
          padding: "4px 8px", background: WHITE,
          border: `1px solid ${BORDER}`, borderRadius: 4,
          fontSize: 10, fontWeight: 600, color: copied ? SAGE : TEXT_BODY,
          cursor: "pointer", fontFamily: "'Space Mono', monospace",
          transition: "all 120ms ease",
        }}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? "Copié" : "Copier"}
      </button>
      <pre
        style={{
          margin: 0, padding: "12px 16px", background: CHARCOAL,
          borderRadius: 6, overflow: "auto",
          fontFamily: "'Space Mono', monospace", fontSize: 11,
          color: "#E5E5E5", lineHeight: 1.6,
        }}
      >
        <code>{snippet}</code>
      </pre>
    </div>
  );
}

// ─── Modale détail clé ───────────────────────────────────────
function KeyDetailModal({
  k, newlyCreated, revoking, onClose, onRevoke,
}: {
  k: ManagedApiKey;
  newlyCreated: {
    plaintext: string;
    keyId: string;
    warning: string;
    curlExample: string;
  } | null;
  revoking: boolean;
  onClose: () => void;
  onRevoke: () => void;
}) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const showPlaintext = newlyCreated && newlyCreated.keyId === k.id;

  const handleCopyKey = useCallback(async () => {
    if (!newlyCreated) return;
    try {
      await navigator.clipboard.writeText(newlyCreated.plaintext);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 1800);
    } catch {
      setCopiedKey(false);
    }
  }, [newlyCreated]);

  const handleCopyCurl = useCallback(async () => {
    if (!newlyCreated) return;
    try {
      await navigator.clipboard.writeText(newlyCreated.curlExample);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 1800);
    } catch {
      setCopiedCurl(false);
    }
  }, [newlyCreated]);

  const sColor = statusColor(k.status);
  const sBg = statusBg(k.status);
  const sBorder = statusBorder(k.status);

  // Calcul de consommation vs quota mensuel
  const monthlyLimit = k.requestsPerMonth;
  const consumptionPct =
    monthlyLimit < 0 || monthlyLimit === 0
      ? 0
      : Math.min(100, Math.round((k.usageCount / monthlyLimit) * 100));

  // Données du graphe 14 jours
  const usageMax = Math.max(1, ...k.usageHistory);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 210,
        background: "rgba(10,10,10,0.7)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22 }}
        style={{
          width: "100%", maxWidth: 640, maxHeight: "90vh",
          background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête modale */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <Key size={16} style={{ color: SAGE, flexShrink: 0 }} />
            <span
              style={{
                fontSize: 13, fontWeight: 700, color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {k.name}
            </span>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 6px", background: sBg, border: `1px solid ${sBorder}`,
                borderRadius: 3, fontSize: 9, fontWeight: 700, color: sColor,
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase", letterSpacing: "0.06em",
                flexShrink: 0,
              }}
            >
              {statusLabel(k.status)}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, display: "flex", alignItems: "center",
              justifyContent: "center", background: "transparent", border: "none",
              cursor: "pointer", color: TEXT_MUTED, flexShrink: 0,
            }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corps modale */}
        <div
          style={{
            flex: 1, overflowY: "auto", padding: "20px 24px",
            fontFamily: "'Inter', system-ui, sans-serif", color: CHARCOAL,
          }}
        >
          {/* ─── Clé complète (UNE SEULE FOIS) ─── */}
          {showPlaintext && newlyCreated && (
            <div
              style={{
                marginBottom: 18, padding: 14,
                background: SAGE_BG, borderRadius: 8,
                border: `1px solid ${SAGE_BORDER}`,
              }}
            >
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
                }}
              >
                <Shield size={12} style={{ color: SAGE }} />
                <span
                  style={{
                    fontSize: 10, fontFamily: "'Space Mono', monospace",
                    color: SAGE, textTransform: "uppercase",
                    letterSpacing: "0.1em", fontWeight: 700,
                  }}
                >
                  Clé complète — visible une seule fois
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={handleCopyKey}
                  style={{
                    position: "absolute", top: 6, right: 6,
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "4px 8px", background: WHITE,
                    border: `1px solid ${SAGE_BORDER}`, borderRadius: 4,
                    fontSize: 10, fontWeight: 600, color: copiedKey ? SAGE : TEXT_BODY,
                    cursor: "pointer", fontFamily: "'Space Mono', monospace",
                    transition: "all 120ms ease",
                  }}
                >
                  {copiedKey ? <Check size={11} /> : <Copy size={11} />}
                  {copiedKey ? "Copié" : "Copier"}
                </button>
                <pre
                  style={{
                    margin: 0, padding: "10px 14px", background: WHITE,
                    borderRadius: 6, border: `1px solid ${SAGE_BORDER}`,
                    overflow: "auto",
                    fontFamily: "'Space Mono', monospace", fontSize: 11,
                    color: CHARCOAL, lineHeight: 1.6,
                    wordBreak: "break-all", whiteSpace: "pre-wrap",
                  }}
                >
                  <code>
                    {revealed
                      ? newlyCreated.plaintext
                      : "•".repeat(newlyCreated.plaintext.length)}
                  </code>
                </pre>
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={() => setRevealed((r) => !r)}
                  style={{
                    padding: "4px 10px", background: "transparent",
                    border: `1px solid ${SAGE_BORDER}`, borderRadius: 4,
                    fontSize: 10, fontWeight: 600, color: SAGE,
                    cursor: "pointer", fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {revealed ? "Masquer" : "Révéler"}
                </button>
                <span style={{ fontSize: 10, color: SAGE, fontStyle: "italic" }}>
                  {newlyCreated.warning}
                </span>
              </div>
            </div>
          )}

          {/* ─── Carte rate limit ─── */}
          <div
            style={{
              marginBottom: 14, padding: 12,
              background: "#FAFAFA", borderRadius: 8,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div
              style={{
                fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Palier de rate limit
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL }}>
                {k.rateLimitLabel}
              </span>
              <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace" }}>
                {monthlyLimit < 0
                  ? "Illimité"
                  : `${formatNumber(k.requestsPerMonth)} requêtes / mois`}
              </span>
            </div>
          </div>

          {/* ─── Carte consommation ─── */}
          <div
            style={{
              marginBottom: 14, padding: 12,
              background: "#FAFAFA", borderRadius: 8,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                  textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <Activity size={11} />
                Consommation cumulée
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  style={{
                    fontSize: 16, fontWeight: 700, color: CHARCOAL,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {formatNumber(k.usageCount)}
                </span>
                <span style={{ fontSize: 10, color: TEXT_MUTED }}>
                  {monthlyLimit < 0 ? "/ ∞" : `/ ${formatNumber(monthlyLimit)}`}
                </span>
              </div>
            </div>

            {/* Jauge */}
            <div
              style={{
                height: 6, background: BORDER, borderRadius: 3,
                overflow: "hidden", marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: `${consumptionPct}%`, height: "100%",
                  background: consumptionPct >= 90 ? RED : consumptionPct >= 70 ? AMBER : SAGE,
                  transition: "width 300ms ease",
                }}
              />
            </div>

            {/* Mini-graphe 14 jours */}
            <div
              style={{
                fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
                marginBottom: 6,
              }}
            >
              Activité — 14 derniers jours
            </div>
            <UsageChart history={k.usageHistory} max={usageMax} />
          </div>

          {/* ─── Métadonnées ─── */}
          <div
            style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 8, marginBottom: 14,
            }}
          >
            <MetaItem
              label="Créée le"
              value={formatDateTime(k.createdAt)}
              icon={<Calendar size={11} style={{ color: TEXT_MUTED }} />}
            />
            <MetaItem
              label="Dernière utilisation"
              value={formatDateTime(k.lastUsedAt)}
              icon={<Clock size={11} style={{ color: TEXT_MUTED }} />}
            />
            <MetaItem
              label="Propriétaire"
              value={k.owner ? (k.owner.name ?? k.owner.email) : "—"}
              icon={<Key size={11} style={{ color: TEXT_MUTED }} />}
            />
            <MetaItem
              label="Prefix"
              value={k.prefix ?? "—"}
              icon={<FileCode size={11} style={{ color: TEXT_MUTED }} />}
              mono
            />
          </div>

          {/* ─── Exemple curl (si clé nouvellement créée) ─── */}
          {showPlaintext && newlyCreated && (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                  textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
                  marginBottom: 6, display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <FileCode size={11} />
                Premier appel — exemple curl
              </div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={handleCopyCurl}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "4px 8px", background: WHITE,
                    border: `1px solid ${BORDER}`, borderRadius: 4,
                    fontSize: 10, fontWeight: 600, color: copiedCurl ? SAGE : TEXT_BODY,
                    cursor: "pointer", fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {copiedCurl ? <Check size={11} /> : <Copy size={11} />}
                  {copiedCurl ? "Copié" : "Copier"}
                </button>
                <pre
                  style={{
                    margin: 0, padding: "12px 16px", background: CHARCOAL,
                    borderRadius: 6, overflow: "auto",
                    fontFamily: "'Space Mono', monospace", fontSize: 11,
                    color: "#E5E5E5", lineHeight: 1.6,
                  }}
                >
                  <code>{newlyCreated.curlExample}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Pied de modale — Révoquer */}
        {k.status !== "revoked" && (
          <div
            style={{
              padding: "12px 20px", borderTop: `1px solid ${BORDER}`,
              background: "#FAFAFA", display: "flex", justifyContent: "flex-end",
            }}
          >
            <button
              onClick={onRevoke}
              disabled={revoking}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", background: revoking ? BORDER : WHITE,
                color: revoking ? TEXT_MUTED : RED,
                border: `1px solid ${revoking ? BORDER : RED_BORDER}`,
                borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: revoking ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "all 120ms ease",
              }}
              onMouseEnter={(e) => {
                if (!revoking) {
                  e.currentTarget.style.background = RED_BG;
                  e.currentTarget.style.borderColor = RED;
                }
              }}
              onMouseLeave={(e) => {
                if (!revoking) {
                  e.currentTarget.style.background = WHITE;
                  e.currentTarget.style.borderColor = RED_BORDER;
                }
              }}
            >
              {revoking ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
              {revoking ? "Révocation..." : "Révoquer la clé"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Mini-graphe d'usage 14 jours ────────────────────────────
//  CSS-only bar chart, hauteur fixe 50px. Chaque barre = 1 jour.
//  Barres à 0 affichées en gris clair pour montrer la continuité
//  temporelle ; barres > 0 en sage.
function UsageChart({ history, max }: { history: number[]; max: number }) {
  const days = history.length;
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-end", gap: 2,
        height: 50, padding: "4px 0",
      }}
    >
      {history.map((v, i) => {
        const h = max > 0 ? Math.max(2, (v / max) * 100) : 2;
        const isZero = v === 0;
        return (
          <div
            key={i}
            title={`Jour ${days - (days - i)} : ${v} appel${v > 1 ? "s" : ""}`}
            style={{
              flex: 1, height: `${h}%`,
              background: isZero ? GRAY_NEUTRAL_BG : SAGE,
              borderRadius: "2px 2px 0 0",
              minHeight: 2,
              transition: "height 200ms ease",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Métadonnée (carte détail) ───────────────────────────────
function MetaItem({
  label, value, icon, mono,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        padding: "10px 12px", background: "#FAFAFA", borderRadius: 6,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
          marginBottom: 4, display: "flex", alignItems: "center", gap: 4,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontSize: 12, fontWeight: 600, color: CHARCOAL,
          fontFamily: mono ? "'Space Mono', monospace" : "'Inter', system-ui, sans-serif",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Modale de confirmation de révocation ────────────────────
function RevokeConfirmModal({
  keyName, keyPrefix, revoking, onConfirm, onCancel,
}: {
  keyName: string;
  keyPrefix: string;
  revoking: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 220,
        background: "rgba(10,10,10,0.7)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        style={{
          width: "100%", maxWidth: 420, background: WHITE,
          borderRadius: 12, border: `1px solid ${BORDER}`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: RED_BG, border: `1px solid ${RED_BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={16} style={{ color: RED }} />
            </div>
            <span
              style={{
                fontSize: 14, fontWeight: 700, color: CHARCOAL,
              }}
            >
              Révoquer cette clé ?
            </span>
          </div>
          <p style={{ fontSize: 12, color: TEXT_BODY, lineHeight: 1.6, marginBottom: 8 }}>
            Vous êtes sur le point de révoquer la clé
            {" "}<strong style={{ color: CHARCOAL }}>{keyName}</strong>
            {" "}<code style={{
              padding: "1px 4px", background: "#FAFAFA", borderRadius: 3,
              fontFamily: "'Space Mono', monospace", fontSize: 11, color: TEXT_MUTED,
              border: `1px solid ${BORDER}`,
            }}>{keyPrefix}…</code>.
          </p>
          <p style={{ fontSize: 11, color: RED, lineHeight: 1.6 }}>
            Cette action est irréversible. Tous les appels API effectués avec cette
            clé seront immédiatement rejetés (401 Unauthorized). Les logs d'audit
            conservent la trace de la clé pour conformité Loi 09-08.
          </p>
        </div>
        <div
          style={{
            padding: "12px 20px", borderTop: `1px solid ${BORDER}`,
            background: "#FAFAFA", display: "flex", justifyContent: "flex-end", gap: 8,
          }}
        >
          <button
            onClick={onCancel}
            disabled={revoking}
            style={{
              padding: "8px 16px", background: WHITE, color: TEXT_BODY,
              border: `1px solid ${BORDER}`, borderRadius: 6,
              fontSize: 12, fontWeight: 600, cursor: revoking ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={revoking}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", background: revoking ? BORDER : RED, color: WHITE,
              border: "none", borderRadius: 6,
              fontSize: 12, fontWeight: 600,
              cursor: revoking ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {revoking ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Ban size={12} />
            )}
            {revoking ? "Révocation..." : "Confirmer la révocation"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

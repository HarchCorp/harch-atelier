"use client";

// ═══════════════════════════════════════════════════════════════
//  InfluencerTrackerGenerator
//
//  Skill 23 — Suivi des Influenceurs.
//  Top 20 influenceurs avec métriques d'engagement, portée,
//  sentiment et ROI (return-on-influence estimé).
//
//  Même motif de popup que BriefingGenerator / EsgScorecardGenerator :
//    • overlay fixe avec backdrop blur
//    • entrée en scale (framer-motion)
//    • sections révélées une à une (AnimatePresence)
//    • barre d'actions : Export PDF (window.print) · Régénérer
//    • CSS print isolant #influencer-document
//
//  Palette : Blanc / Sage / Charcoal — outil stratégique, pas crise.
//  Typographie : Space Mono (labels techniques), Inter (corps).
//  Icônes : Lucide. Aucun emoji.
//
//  Structure du corps :
//    a. En-tête — date + entreprise + secteur + fenêtre 30j
//    b. Bande synthèse — Total influenceurs / Portée cumulée /
//       Engagement moyen / Sentiment dominant
//    c. Contrôles de tri — 4 boutons (Portée / Engagement /
//       Sentiment / Mentions) avec mise en évidence du tri actif
//    d. Diagramme en barres — Top 10 comparaison selon la métrique
//       de tri courante (SVG inline horizontal)
//    e. Grille de cartes influenceurs — avatar initiales, nom,
//       handle, icône plateforme, abonnés, jauge d'engagement,
//       point de sentiment, compteur de mentions, dernière mention
//    f. Formulaire « Ajouter manuellement » — nom / handle /
//       plateforme / abonnés / engagement. Ajoute en tête de liste
//       (badge « Manuel »).
//    g. Encart recommandation HarchIQ
//    h. Actions — Export PDF · Régénérer
//
//  Skill ID : SKILL-23-INFLUENCER
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  Twitter, Linkedin, Instagram, Youtube, Facebook,
  Newspaper, Music2, Users, TrendingUp, TrendingDown, Minus,
  Calendar, Target, UserPlus, BarChart3, Award, CircleDot,
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
const POSITIVE_BG = "rgba(16,185,129,0.10)";

// ─── Types — miroir de InfluencerTrackerResponse (route.ts) ───

type InfluencerSentiment = "positive" | "neutral" | "negative";

interface InfluencerTrackerRow {
  name: string;
  handle: string;
  platform: string;
  followers: number;
  engagementRate: number;
  sentiment: InfluencerSentiment;
  mentionCount: number;
  lastMention: string | null;
  reachScore: number;
  influenceScore: number;
}

interface InfluencerTrackerData {
  influencers: InfluencerTrackerRow[];
  meta: {
    companyName: string;
    sector: string;
    generatedAt: string;
    windowDays: number;
    source: "real" | "demo";
    totalScanned: number;
    catalogCount: number;
    derivedCount: number;
  };
}

// ─── Type de tri ─────────────────────────────────────────────
type SortKey = "reach" | "engagement" | "sentiment" | "mentions";

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "reach",       label: "Portée" },
  { key: "engagement",  label: "Engagement" },
  { key: "sentiment",   label: "Sentiment" },
  { key: "mentions",    label: "Mentions" },
];

// ─── Helpers ─────────────────────────────────────────────────

function sentimentColor(s: InfluencerSentiment): string {
  if (s === "positive") return POSITIVE;
  if (s === "negative") return RED;
  return TEXT_MUTED;
}

function sentimentLabel(s: InfluencerSentiment): string {
  if (s === "positive") return "Positif";
  if (s === "negative") return "Négatif";
  return "Neutre";
}

// Valeur numérique d'une ligne selon la clé de tri — utilisée pour
// le tri décroissant ET pour la longueur des barres du diagramme.
function sortValue(row: InfluencerTrackerRow, key: SortKey): number {
  switch (key) {
    case "reach":      return row.reachScore;
    case "engagement": return row.engagementRate;
    case "mentions":   return row.mentionCount;
    case "sentiment":  // positive = 1, neutral = 0, negative = -1
      return row.sentiment === "positive" ? 1 : row.sentiment === "negative" ? -1 : 0;
  }
}

// Étiquette + suffixe pour la métrique triée (affichée en bout de barre).
function sortMetricLabel(row: InfluencerTrackerRow, key: SortKey): string {
  switch (key) {
    case "reach":      return `${row.reachScore} / 100`;
    case "engagement": return `${row.engagementRate.toFixed(1)} %`;
    case "mentions":   return `${row.mentionCount}`;
    case "sentiment":  return sentimentLabel(row.sentiment);
  }
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")} M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")} K`;
  return String(n);
}

// Initiales pour l'avatar — 1 ou 2 lettres majuscules.
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ─── Icône de plateforme (Lucide) ────────────────────────────
function PlatformIcon({
  platform, size, color, style,
}: { platform: string } & {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  switch (platform) {
    case "twitter":   return <Twitter   size={size} color={color} style={style} />;
    case "linkedin":  return <Linkedin  size={size} color={color} style={style} />;
    case "instagram": return <Instagram size={size} color={color} style={style} />;
    case "youtube":   return <Youtube   size={size} color={color} style={style} />;
    case "tiktok":    return <Music2    size={size} color={color} style={style} />;
    case "facebook":  return <Facebook  size={size} color={color} style={style} />;
    case "press":
    default:          return <Newspaper size={size} color={color} style={style} />;
  }
}

// ─── Cadence de révélation des sections (motif BriefingGenerator)
const SECTIONS = [
  { id: "header",    delay: 200 },
  { id: "summary",   delay: 400 },
  { id: "controls",  delay: 600 },
  { id: "chart",     delay: 800 },
  { id: "grid",      delay: 1050 },
  { id: "manual",    delay: 1300 },
  { id: "recommend", delay: 1500 },
  { id: "actions",   delay: 1700 },
];

// ═══════════════════════════════════════════════════════════════
//  Composant principal
// ═══════════════════════════════════════════════════════════════

export function InfluencerTrackerGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InfluencerTrackerData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);

  // Tri courant — change l'ordre des cartes et la métrique affichée
  // dans le diagramme en barres.
  const [sortKey, setSortKey] = useState<SortKey>("reach");

  // Influenceurs ajoutés manuellement (état local — pas persisté).
  const [manualAdds, setManualAdds] = useState<InfluencerTrackerRow[]>([]);

  // Formulaire d'ajout manuel
  const [formOpen, setFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formHandle, setFormHandle] = useState("");
  const [formPlatform, setFormPlatform] = useState<string>("press");
  const [formFollowers, setFormFollowers] = useState("");
  const [formEngagement, setFormEngagement] = useState("");

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleSections(new Set());
    setGenerating(true);
    setManualAdds([]);
    setFormOpen(false);
    try {
      const res = await fetch("/api/console/influencer-tracker", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as InfluencerTrackerData;
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

  // Liste combinée : ajouts manuels en tête + données serveur.
  // Le tri s'applique sur l'ensemble.
  const allRows: InfluencerTrackerRow[] = useMemo(() => {
    const combined = [...manualAdds, ...(data?.influencers ?? [])];
    return combined.slice().sort((a, b) => sortValue(b, sortKey) - sortValue(a, sortKey));
  }, [manualAdds, data, sortKey]);

  // Top 10 pour le diagramme en barres (déjà trié ci-dessus).
  const chartRows = allRows.slice(0, 10);

  // Soumission du formulaire d'ajout manuel — valide et prépend.
  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = formName.trim();
    if (!name) return;
    const followers = parseInt(formFollowers || "0", 10) || 0;
    const engagement = parseFloat(formEngagement || "0") || 0;
    const platform = formPlatform || "press";
    const handle = formHandle.trim() || `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30)}`;
    const newRow: InfluencerTrackerRow = {
      name,
      handle,
      platform,
      followers,
      engagementRate: Math.min(15, Math.max(0.1, engagement)),
      sentiment: "neutral",
      mentionCount: 0,
      lastMention: new Date().toISOString().slice(0, 10),
      reachScore: Math.min(100, Math.round(Math.log10(Math.max(10, followers)) * 18)),
      influenceScore: Math.min(100, Math.round(40 + Math.log10(Math.max(10, followers)) * 12 + engagement * 2)),
    };
    setManualAdds((prev) => [newRow, ...prev]);
    setFormName("");
    setFormHandle("");
    setFormPlatform("press");
    setFormFollowers("");
    setFormEngagement("");
    setFormOpen(false);
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
          width: "100%", maxWidth: 1080, maxHeight: "92vh",
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
            <Users size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14, fontWeight: 700, color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Suivi des Influenceurs
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
                Collecte des signaux d'influence (catalogue, articles, commentaires)...
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
            <div id="influencer-document">
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
                        Suivi d'influence · Fenêtre {data.meta.windowDays}j
                      </span>
                    </div>
                    <h1
                      style={{
                        fontSize: 26, fontWeight: 700, margin: 0, color: CHARCOAL,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Top 20 Influenceurs — {data.meta.companyName}
                    </h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                      Secteur : {data.meta.sector || "Général"} · Catalogue {data.meta.catalogCount} · Dérivés {data.meta.derivedCount} · Corpus analysé : {data.meta.totalScanned} signaux
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
                      label="Influenceurs suivis"
                      value={String(data.influencers.length)}
                      suffix="/ 20"
                      color={SAGE}
                    />
                    <SummaryStat
                      label="Portée cumulée"
                      value={formatFollowers(
                        data.influencers.reduce((s, i) => s + i.followers, 0),
                      )}
                      suffix="abonnés"
                      color={CHARCOAL}
                    />
                    <SummaryStat
                      label="Engagement moyen"
                      value={(
                        data.influencers.length > 0
                          ? data.influencers.reduce((s, i) => s + i.engagementRate, 0) / data.influencers.length
                          : 0
                      ).toFixed(1)}
                      suffix="%"
                      color={AMBER}
                    />
                    <SummaryStat
                      label="Sentiment dominant"
                      value={dominantSentimentLabel(data.influencers)}
                      color={dominantSentimentColor(data.influencers)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── C. Contrôles de tri ─── */}
              <AnimatePresence>
                {visibleSections.has("controls") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 20, display: "flex", alignItems: "center",
                      gap: 10, flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED, textTransform: "uppercase",
                        letterSpacing: "0.1em", fontWeight: 700,
                      }}
                    >
                      Trier par
                    </span>
                    {SORT_OPTIONS.map((opt) => {
                      const active = sortKey === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => setSortKey(opt.key)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "6px 12px",
                            background: active ? SAGE : WHITE,
                            color: active ? WHITE : TEXT_BODY,
                            border: `1px solid ${active ? SAGE : BORDER}`,
                            borderRadius: 6, fontSize: 12, fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit",
                            transition: "all 150ms",
                          }}
                        >
                          {opt.key === "reach" && <BarChart3 size={12} />}
                          {opt.key === "engagement" && <CircleDot size={12} />}
                          {opt.key === "sentiment" && <Award size={12} />}
                          {opt.key === "mentions" && <Users size={12} />}
                          {opt.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── D. Diagramme en barres — Top 10 ─── */}
              <AnimatePresence>
                {visibleSections.has("chart") && chartRows.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24, padding: 20, background: "#FAFAFA",
                      borderRadius: 12, border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED, textTransform: "uppercase",
                        letterSpacing: "0.1em", fontWeight: 700, marginBottom: 12,
                      }}
                    >
                      Top 10 — comparaison · {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
                    </div>
                    <ComparisonChart rows={chartRows} sortKey={sortKey} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── E. Grille de cartes influenceurs ─── */}
              <AnimatePresence>
                {visibleSections.has("grid") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    <div
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED, textTransform: "uppercase",
                          letterSpacing: "0.1em", fontWeight: 700,
                        }}
                      >
                        Cartes influenceurs ({allRows.length})
                      </div>
                    </div>
                    {allRows.length === 0 ? (
                      <div
                        style={{
                          padding: 32, textAlign: "center",
                          background: "#FAFAFA", borderRadius: 8,
                          border: `1px solid ${BORDER}`, color: TEXT_MUTED,
                          fontSize: 13,
                        }}
                      >
                        Aucun influenceur détecté sur la fenêtre {data.meta.windowDays} jours.
                        Lancez une collecte ciblée ou ajoutez manuellement un influenceur ci-dessous.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                          gap: 12,
                        }}
                      >
                        {allRows.map((row, idx) => (
                          <InfluencerCard
                            key={`${row.handle}-${idx}`}
                            row={row}
                            rank={idx + 1}
                            isManual={idx < manualAdds.length}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── F. Ajouter manuellement ─── */}
              <AnimatePresence>
                {visibleSections.has("manual") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24, padding: 16, background: WHITE,
                      borderRadius: 8, border: `1px solid ${BORDER}`,
                    }}
                  >
                    <button
                      onClick={() => setFormOpen((v) => !v)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", padding: 0, background: "transparent",
                        border: "none", cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <span
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          fontSize: 12, fontWeight: 700, color: SAGE,
                          fontFamily: "'Space Mono', monospace", textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        <UserPlus size={14} /> Ajouter manuellement
                      </span>
                      <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace" }}>
                        {formOpen ? "Masquer" : "Déplier"}
                      </span>
                    </button>
                    {formOpen && (
                      <form
                        onSubmit={handleManualSubmit}
                        style={{
                          marginTop: 16, display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)", gap: 10,
                        }}
                      >
                        <FormField label="Nom">
                          <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Ex. Salma El Fassi"
                            required
                            style={inputStyle}
                          />
                        </FormField>
                        <FormField label="Identifiant">
                          <input
                            type="text"
                            value={formHandle}
                            onChange={(e) => setFormHandle(e.target.value)}
                            placeholder="@salma_dircom"
                            style={inputStyle}
                          />
                        </FormField>
                        <FormField label="Plateforme">
                          <select
                            value={formPlatform}
                            onChange={(e) => setFormPlatform(e.target.value)}
                            style={inputStyle}
                          >
                            <option value="press">Presse</option>
                            <option value="twitter">Twitter / X</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="instagram">Instagram</option>
                            <option value="youtube">YouTube</option>
                            <option value="tiktok">TikTok</option>
                            <option value="facebook">Facebook</option>
                          </select>
                        </FormField>
                        <FormField label="Abonnés">
                          <input
                            type="number"
                            value={formFollowers}
                            onChange={(e) => setFormFollowers(e.target.value)}
                            placeholder="28000"
                            min={0}
                            style={inputStyle}
                          />
                        </FormField>
                        <FormField label="Taux d'engagement (%)">
                          <input
                            type="number"
                            value={formEngagement}
                            onChange={(e) => setFormEngagement(e.target.value)}
                            placeholder="4.2"
                            min={0}
                            max={100}
                            step={0.1}
                            style={inputStyle}
                          />
                        </FormField>
                        <div
                          style={{
                            display: "flex", alignItems: "flex-end",
                          }}
                        >
                          <button
                            type="submit"
                            style={{
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "8px 16px", background: SAGE, color: WHITE,
                              border: "none", borderRadius: 6, fontSize: 12,
                              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                              width: "100%", justifyContent: "center",
                            }}
                          >
                            <UserPlus size={13} /> Ajouter à la liste
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── G. Recommandation HarchIQ ─── */}
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
                      {buildRecommendation(data.influencers, data.meta.companyName)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── H. Actions ─── */}
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
                    Compilation en cours...
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
          #influencer-document, #influencer-document * { visibility: visible; }
          #influencer-document {
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

// ─── Style d'input partagé ───────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  fontFamily: "'Inter', sans-serif",
  color: CHARCOAL,
  background: WHITE,
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  outline: "none",
};

// ─── Champ de formulaire avec label ──────────────────────────
function FormField({
  label, children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "flex", flexDirection: "column", gap: 4,
        fontSize: 10, fontFamily: "'Space Mono', monospace",
        color: TEXT_MUTED, textTransform: "uppercase",
        letterSpacing: "0.08em", fontWeight: 700,
      }}
    >
      {label}
      {children}
    </label>
  );
}

// ─── Stat synthétique (bande du haut) ────────────────────────
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

// ─── Carte influenceur ───────────────────────────────────────
//
//  Mise en page :
//    [Avatar initiales] [Nom + Handle + Icône plateforme]
//                       [Abonnés · Mentions · Dernière mention]
//    [Jauge d'engagement horizontale]
//    [Pied : point de sentiment + label · Influence score]
function InfluencerCard({
  row, rank, isManual,
}: {
  row: InfluencerTrackerRow;
  rank: number;
  isManual: boolean;
}) {
  const sColor = sentimentColor(row.sentiment);
  // Largeur de la jauge d'engagement relative à 15% (max pratiqué).
  const engWidth = Math.min(100, (row.engagementRate / 15) * 100);

  return (
    <div
      style={{
        padding: 14, background: WHITE, borderRadius: 10,
        border: `1px solid ${BORDER}`,
        display: "flex", flexDirection: "column", gap: 10,
        position: "relative",
      }}
    >
      {/* Rang + badge manuel */}
      <div
        style={{
          position: "absolute", top: 10, right: 10,
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        {isManual && (
          <span
            style={{
              fontSize: 9, fontFamily: "'Space Mono', monospace",
              color: SAGE, background: SAGE_BG,
              padding: "2px 6px", borderRadius: 3,
              textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
            }}
          >
            Manuel
          </span>
        )}
        <span
          style={{
            fontSize: 10, fontFamily: "'Space Mono', monospace",
            color: TEXT_MUTED, fontWeight: 700,
          }}
        >
          #{rank}
        </span>
      </div>

      {/* En-tête carte */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {/* Avatar initiales */}
        <div
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: SAGE_BG_STRONG, color: SAGE,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace",
            flexShrink: 0,
          }}
        >
          {initials(row.name)}
        </div>
        {/* Nom + handle + plateforme */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 14, fontWeight: 700, color: CHARCOAL,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {row.name}
          </div>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, color: TEXT_MUTED,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            <PlatformIcon platform={row.platform} size={11} color={SAGE} />
            <span
              style={{
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}
            >
              {row.handle}
            </span>
          </div>
        </div>
      </div>

      {/* Métriques clés */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6,
          padding: "8px 0", borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <Metric label="Abonnés" value={formatFollowers(row.followers)} />
        <Metric label="Mentions" value={String(row.mentionCount)} />
        <Metric
          label="Dernière"
          value={row.lastMention ? row.lastMention.slice(5) : "—"}
        />
      </div>

      {/* Jauge d'engagement */}
      <div>
        <div
          style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 9, fontFamily: "'Space Mono', monospace",
            color: TEXT_MUTED, textTransform: "uppercase",
            letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4,
          }}
        >
          <span>Engagement</span>
          <span style={{ color: SAGE }}>{row.engagementRate.toFixed(1)} %</span>
        </div>
        <div
          style={{
            height: 6, background: SAGE_BG, borderRadius: 3, overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${engWidth}%`, height: "100%",
              background: SAGE, borderRadius: 3,
              transition: "width 400ms ease",
            }}
          />
        </div>
      </div>

      {/* Pied : sentiment + score d'influence */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Point de sentiment */}
          <span
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: sColor, display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 11, color: sColor, fontWeight: 600,
            }}
          >
            {sentimentLabel(row.sentiment)}
          </span>
        </div>
        <div
          style={{
            display: "flex", alignItems: "baseline", gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 9, fontFamily: "'Space Mono', monospace",
              color: TEXT_MUTED, textTransform: "uppercase",
              letterSpacing: "0.08em", fontWeight: 700,
            }}
          >
            Influence
          </span>
          <span
            style={{
              fontSize: 18, fontWeight: 700, color: CHARCOAL,
              fontFamily: "'Space Mono', monospace", lineHeight: 1,
            }}
          >
            {row.influenceScore}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Petite métrique (grille 3 colonnes dans la carte) ──────
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 9, fontFamily: "'Space Mono', monospace",
          color: TEXT_MUTED, textTransform: "uppercase",
          letterSpacing: "0.08em", fontWeight: 700, marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13, fontWeight: 600, color: CHARCOAL,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Diagramme en barres — Top 10 comparaison ────────────────
//
//  SVG inline. 10 barres horizontales, hauteur fixe 22px, gap 8px.
//  Largeur barre = (valeur / max) * 100% de la zone traçable.
//  Étiquette nom à gauche, valeur à droite.
function ComparisonChart({
  rows, sortKey,
}: {
  rows: InfluencerTrackerRow[];
  sortKey: SortKey;
}) {
  const max = Math.max(1, ...rows.map((r) => sortValue(r, sortKey)));
  // Largeur de la zone nom (gauche) — 140px fixes.
  const labelW = 140;
  // Largeur de la zone valeur (droite) — 90px fixes.
  const valueW = 90;
  // Largeur totale du SVG = 100% via viewBox + width 100%.
  const vbW = 640;
  const vbH = rows.length * 30 + 8;
  const barZoneW = vbW - labelW - valueW - 16;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${vbW} ${vbH}`}
      style={{ display: "block", maxHeight: 360 }}
    >
      {rows.map((row, i) => {
        const v = sortValue(row, sortKey);
        const barW = Math.max(2, (v / max) * barZoneW);
        const y = i * 30 + 4;
        const sColor = sentimentColor(row.sentiment);
        // Couleur de barre : SAGE par défaut, ou couleur de sentiment
        // si le tri actif est "sentiment".
        const barColor = sortKey === "sentiment" ? sColor : SAGE;
        return (
          <g key={`${row.handle}-${i}`}>
            {/* Nom + icône plateforme */}
            <foreignObject x={0} y={y} width={labelW} height={22}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, color: CHARCOAL, fontWeight: 600,
                  whiteSpace: "nowrap", overflow: "hidden",
                }}
              >
                <PlatformIcon
                  platform={row.platform}
                  size={11}
                  color={SAGE}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  {row.name}
                </span>
              </div>
            </foreignObject>
            {/* Barre */}
            <rect
              x={labelW}
              y={y + 3}
              width={barW}
              height={16}
              rx={3}
              fill={barColor}
              opacity={0.85}
            />
            {/* Track de fond */}
            <rect
              x={labelW}
              y={y + 3}
              width={barZoneW}
              height={16}
              rx={3}
              fill="none"
              stroke={BORDER}
              strokeWidth={1}
            />
            {/* Valeur */}
            <text
              x={labelW + barZoneW + 8}
              y={y + 15}
              fontSize={11}
              fontFamily="'Space Mono', monospace"
              fontWeight={700}
              fill={CHARCOAL}
            >
              {sortMetricLabel(row, sortKey)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Helpers pour la bande synthèse ──────────────────────────

function dominantSentimentLabel(rows: InfluencerTrackerRow[]): string {
  if (rows.length === 0) return "—";
  const counts = { positive: 0, neutral: 0, negative: 0 };
  for (const r of rows) counts[r.sentiment] += 1;
  const max = Math.max(counts.positive, counts.neutral, counts.negative);
  if (counts.positive === max) return "Positif";
  if (counts.negative === max) return "Négatif";
  return "Neutre";
}

function dominantSentimentColor(rows: InfluencerTrackerRow[]): string {
  const label = dominantSentimentLabel(rows);
  if (label === "Positif") return POSITIVE;
  if (label === "Négatif") return RED;
  return TEXT_MUTED;
}

// ─── Recommandation stratégique ──────────────────────────────

function buildRecommendation(
  rows: InfluencerTrackerRow[],
  companyName: string,
): string {
  if (rows.length === 0) {
    return `Pas assez de signaux d'influence détectés pour ${companyName} sur la fenêtre 30 jours. Lancez une collecte ciblée (Twitter, LinkedIn, presse marocaine) pendant 7 jours, puis régénérez ce tableau de bord pour obtenir un classement exploitable.`;
  }
  const top = rows[0];
  const negative = rows.filter((r) => r.sentiment === "negative");
  const positive = rows.filter((r) => r.sentiment === "positive");
  const fmtFollowers = formatFollowers(top.followers);

  if (top.sentiment === "positive") {
    return `Influenceur numéro 1 : ${top.name} (${fmtFollowers} abonnés, ${top.mentionCount} mentions, sentiment positif). Capitaliser sur cette voix — proposer un partenariat ou un échange de contenu. ${positive.length} influenceur(s) positif(s) identifié(s) au total, opportunité de campagne d'ambassadeurs.`;
  }
  if (top.sentiment === "negative") {
    return `Vigilance — ${top.name} (${fmtFollowers} abonnés, ${top.mentionCount} mentions négatives) domine le classement. Activer la cellule de crise, préparer une réponse publique sous 48 h. ${negative.length} influenceur(s) négatif(s) au total — cartographier les relais et prioriser les plus fortes portées.`;
  }
  return `Top influenceur : ${top.name} (${fmtFollowers} abonnés, ${top.mentionCount} mentions, sentiment neutre). Engager une veille rapprochée — identifier les déclencheurs potentiels de bascule (positif ou négatif). ${positive.length} positif(s) · ${negative.length} négatif(s) — équilibre fragile à surveiller.`;
}

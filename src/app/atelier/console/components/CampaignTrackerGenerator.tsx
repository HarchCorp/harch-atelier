"use client";

// ═══════════════════════════════════════════════════════════════
//  CampaignTrackerGenerator
//
//  Skill 28 — Suivi des Campagnes marketing & influence.
//
//  Même motif de popup que BriefingGenerator / InfluencerTrackerGenerator :
//    • overlay fixe avec backdrop blur
//    • entrée en scale (framer-motion)
//    • sections révélées une à une (AnimatePresence)
//    • barre d'actions : Export PDF (window.print) · Régénérer
//    • CSS print isolant #campaign-tracker-document
//
//  Palette : Blanc / Sage / Charcoal — outil stratégique, pas crise.
//  Typographie : Space Mono (labels techniques), Inter (corps).
//  Icônes : Lucide. Aucun emoji.
//
//  Structure du corps :
//    a. En-tête — titre + date + note
//    b. Bande agrégat — Total campagnes / Budget cumulé MAD /
//       ROI moyen / Portée cumulée
//    c. Barre d'outils — filtre statut (Tous / Actives /
//       Planifiées / Terminées) + bouton « Nouvelle campagne »
//    d. Grille de cartes campagnes — nom, badge statut, jauge de
//       progression, budget, ROI, dates, bouton « Détail »
//    e. Formulaire « Nouvelle campagne » — nom, marque,
//       influenceur, dates, budget. POST vers
//       /api/console/campaign-tracker pour normalisation serveur
//       (id, status, progressPct, métriques dérivées), puis
//       persisté dans localStorage.
//    f. Modal de détail — statistiques détaillées, BarChart SVG
//       de l'engagement quotidien sur les 14 derniers jours
//       (borné à la fenêtre de campagne), calculateur ROI
//       (revenu généré MAD → ROI%).
//
//  Persistance : localStorage côté client, clé
//  `harchiq.campaign-tracker.v1`. Le serveur ne stocke rien.
//
//  Skill ID : SKILL-28-CAMPAIGN
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  Megaphone, Calendar, Wallet, TrendingUp, TrendingDown, Minus,
  Plus, BarChart3, Eye, Trash2, Percent, Clock,
  PlayCircle, PauseCircle, CheckCircle2, Building2, User,
  Info, Calculator,
} from "lucide-react";

// ─── Design tokens (non négociables) ──────────────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
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

// ─── Types — miroir de Campaign (route.ts) ────────────────────

type CampaignStatus = "active" | "scheduled" | "completed";

interface Campaign {
  id: string;
  name: string;
  brand: string;
  influencer: string;
  status: CampaignStatus;
  startDate: string;        // YYYY-MM-DD
  endDate: string;          // YYYY-MM-DD
  budgetMAD: number;
  reach: number;
  engagementRate: number;   // 0..100
  roiPct: number;           // %
  progressPct: number;      // 0..100
  createdAt: string;        // ISO 8601
}

type StatusFilter = "all" | CampaignStatus;

// ─── Constantes ───────────────────────────────────────────────

const STORAGE_KEY = "harchiq.campaign-tracker.v1";
const STORAGE_INIT_KEY = "harchiq.campaign-tracker.v1.initialized";

const SECTIONS = [
  { id: "header", delay: 200 },
  { id: "strip", delay: 350 },
  { id: "toolbar", delay: 500 },
  { id: "cards", delay: 650 },
];

// ─── Helpers de formatage ─────────────────────────────────────

function formatMAD(n: number): string {
  // 1 250 000 MAD -> "1 250 000" (espaces insécables).
  const rounded = Math.round(n);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}

function formatPercent(n: number, decimals = 1): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(decimals)}%`;
}

function formatFrDate(iso: string): string {
  // YYYY-MM-DD -> "12 mars 2025"
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const months = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc.",
  ];
  const day = parseInt(m[3], 10);
  const monthIdx = parseInt(m[2], 10) - 1;
  const year = parseInt(m[1], 10);
  if (monthIdx < 0 || monthIdx > 11) return iso;
  return `${day} ${months[monthIdx]} ${year}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysFromNowISO(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// ─── Seed démo (3 campagnes marocaines) ───────────────────────
//
// Chargée UNE seule fois au premier mount si localStorage est vide
// et que le flag `STORAGE_INIT_KEY` n'existe pas. Ensuite la liste
// appartient à l'utilisateur : il peut supprimer, ajouter, vider.

function buildDemoCampaigns(): Campaign[] {
  return [
    {
      id: "demo-camp-1",
      name: "Lancement Collection Aïd",
      brand: "Marjane",
      influencer: "@soukaina.berkani",
      status: "active",
      startDate: daysFromNowISO(-8),
      endDate: daysFromNowISO(7),
      budgetMAD: 250000,
      reach: 850000,
      engagementRate: 4.8,
      roiPct: 18.5,
      progressPct: 55,
      createdAt: daysFromNowISO(-10) + "T09:00:00.000Z",
    },
    {
      id: "demo-camp-2",
      name: "Pré-lancement Ramadan Pack",
      brand: "Attijariwafa Bank",
      influencer: "@younes.bengelloun",
      status: "scheduled",
      startDate: daysFromNowISO(5),
      endDate: daysFromNowISO(35),
      budgetMAD: 480000,
      reach: 1500000,
      engagementRate: 3.2,
      roiPct: -2.0,
      progressPct: 0,
      createdAt: daysFromNowISO(-3) + "T14:00:00.000Z",
    },
    {
      id: "demo-camp-3",
      name: "Tour du Maroc — Sponsoring",
      brand: "OCP Group",
      influencer: "@nawal.elmoutawakel",
      status: "completed",
      startDate: daysFromNowISO(-45),
      endDate: daysFromNowISO(-10),
      budgetMAD: 620000,
      reach: 2100000,
      engagementRate: 6.1,
      roiPct: 42.3,
      progressPct: 100,
      createdAt: daysFromNowISO(-50) + "T08:00:00.000Z",
    },
  ];
}

// ─── Série d'engagement quotidien (BarChart) ──────────────────
//
// Génère N points (défaut 14) bornés à la fenêtre de campagne.
// Déterministe : hash simple sur l'id de la campagne, LCG pour la
// variance. Permet un graphique stable entre re-renders.

function buildDailyEngagement(
  campaign: Campaign,
  windowDays = 14,
): Array<{ day: string; label: string; value: number }> {
  let seed = 0;
  for (let i = 0; i < campaign.id.length; i++) {
    seed = (seed * 31 + campaign.id.charCodeAt(i)) | 0;
  }
  function next(): number {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  const base = campaign.engagementRate;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const points: Array<{ day: string; label: string; value: number }> = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    // skip en dehors de la fenêtre de campagne
    if (iso < campaign.startDate || iso > campaign.endDate) continue;
    const variance = (next() - 0.5) * (base * 0.7);
    const v = Math.max(0, base + variance);
    const label = `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    points.push({ day: iso, label, value: Math.round(v * 100) / 100 });
  }
  return points;
}

// ═══════════════════════════════════════════════════════════════
//  Composant principal
// ═══════════════════════════════════════════════════════════════

export function CampaignTrackerGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Formulaire « Nouvelle campagne »
  const [formOpen, setFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formInfluencer, setFormInfluencer] = useState("");
  const [formStart, setFormStart] = useState(todayISO());
  const [formEnd, setFormEnd] = useState(daysFromNowISO(14));
  const [formBudget, setFormBudget] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal de détail
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);

  // ─── Chargement initial : lire localStorage ───────────────
  const loadFromStorage = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const initialized = window.localStorage.getItem(STORAGE_INIT_KEY);
      if (!raw) {
        // Premier lancement : on peuple avec 3 campagnes démo.
        if (!initialized) {
          const demo = buildDemoCampaigns();
          setCampaigns(demo);
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
            window.localStorage.setItem(STORAGE_INIT_KEY, "1");
          } catch {
            // localStorage plein ou désactivé — on ignore.
          }
        }
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        setCampaigns([]);
        return;
      }
      // Validation légère — on ne fait pas confiance au contenu.
      const valid: Campaign[] = [];
      for (const item of parsed) {
        if (!item || typeof item !== "object") continue;
        const c = item as Record<string, unknown>;
        if (
          typeof c.id === "string" &&
          typeof c.name === "string" &&
          typeof c.brand === "string" &&
          typeof c.influencer === "string" &&
          (c.status === "active" || c.status === "scheduled" || c.status === "completed") &&
          typeof c.startDate === "string" &&
          typeof c.endDate === "string" &&
          typeof c.budgetMAD === "number" &&
          typeof c.reach === "number" &&
          typeof c.engagementRate === "number" &&
          typeof c.roiPct === "number" &&
          typeof c.progressPct === "number" &&
          typeof c.createdAt === "string"
        ) {
          valid.push(c as unknown as Campaign);
        }
      }
      setCampaigns(valid);
    } catch {
      setCampaigns([]);
    }
  }, []);

  const persistToStorage = useCallback((list: Campaign[]) => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // localStorage peut être plein ou désactivé — on ignore.
    }
  }, []);

  // ─── Cycle de vie : mount + cadence ───────────────────────
  useEffect(() => {
    loadFromStorage();
    setLoading(false);
    setError(null);
    for (const section of SECTIONS) {
      setTimeout(() => {
        setVisibleSections((prev) => new Set(prev).add(section.id));
      }, section.delay);
    }
  }, [loadFromStorage]);

  // ─── Réinitialiser le formulaire ──────────────────────────
  const resetForm = useCallback(() => {
    setFormName("");
    setFormBrand("");
    setFormInfluencer("");
    setFormStart(todayISO());
    setFormEnd(daysFromNowISO(14));
    setFormBudget("");
  }, []);

  // ─── Sauvegarder une nouvelle campagne ────────────────────
  const saveCampaign = useCallback(async () => {
    const name = formName.trim();
    const brand = formBrand.trim();
    const influencer = formInfluencer.trim();
    const budgetNum = Number(formBudget);

    if (!name) {
      setError("Veuillez saisir un nom de campagne.");
      return;
    }
    if (!brand) {
      setError("Veuillez saisir une marque.");
      return;
    }
    if (!influencer) {
      setError("Veuillez saisir un influenceur.");
      return;
    }
    if (!formStart || !formEnd) {
      setError("Veuillez saisir les dates de début et de fin.");
      return;
    }
    if (formEnd <= formStart) {
      setError("La date de fin doit être postérieure à la date de début.");
      return;
    }
    if (!Number.isFinite(budgetNum) || budgetNum <= 0) {
      setError("Veuillez saisir un budget valide (nombre positif en MAD).");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/console/campaign-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brand,
          influencer,
          startDate: formStart,
          endDate: formEnd,
          budgetMAD: budgetNum,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const saved = (await res.json()) as Campaign;
      const next = [saved, ...campaigns];
      setCampaigns(next);
      persistToStorage(next);
      resetForm();
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }, [
    formName, formBrand, formInfluencer, formStart, formEnd, formBudget,
    campaigns, persistToStorage, resetForm,
  ]);

  // ─── Supprimer une campagne ───────────────────────────────
  const deleteCampaign = useCallback((id: string) => {
    const next = campaigns.filter((c) => c.id !== id);
    setCampaigns(next);
    persistToStorage(next);
    setDetailCampaign((prev) => (prev && prev.id === id ? null : prev));
  }, [campaigns, persistToStorage]);

  // ─── Filtrage par statut ──────────────────────────────────
  const filteredCampaigns = useMemo(() => {
    if (statusFilter === "all") return campaigns;
    return campaigns.filter((c) => c.status === statusFilter);
  }, [campaigns, statusFilter]);

  // ─── Agrégats ─────────────────────────────────────────────
  const aggregates = useMemo(() => {
    const total = campaigns.length;
    const totalBudget = campaigns.reduce((s, c) => s + c.budgetMAD, 0);
    const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
    const avgRoi = total > 0
      ? campaigns.reduce((s, c) => s + c.roiPct, 0) / total
      : 0;
    return { total, totalBudget, totalReach, avgRoi };
  }, [campaigns]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,10,10,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
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
            <Megaphone size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
              Suivi des Campagnes
            </span>
            {loading && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace" }}>
                <Loader2 size={11} className="animate-spin" /> Chargement...
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: loading ? BORDER : CHARCOAL,
                color: loading ? TEXT_MUTED : WHITE,
                border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none", cursor: "pointer", color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Corps du document ─── */}
        <div
          id="campaign-tracker-document"
          style={{
            flex: 1, overflowY: "auto", padding: "28px 32px",
            fontFamily: "'Inter', system-ui, sans-serif", color: CHARCOAL,
          }}
        >
          {error && (
            <div style={{
              marginBottom: 16, padding: 12, background: RED_BG,
              borderRadius: 8, border: `1px solid ${RED_BORDER}`,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <AlertTriangle size={14} style={{ color: RED, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: RED, flex: 1 }}>{error}</span>
              <button
                onClick={() => setError(null)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: RED, fontSize: 11, fontFamily: "'Space Mono', monospace",
                }}
              >
                Fermer
              </button>
            </div>
          )}

          <AnimatePresence>
            {visibleSections.has("header") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 24 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Calendar size={14} style={{ color: SAGE }} />
                  <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: SAGE, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {formatFrDate(todayISO())}
                  </span>
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: CHARCOAL, letterSpacing: "-0.02em" }}>
                  Campagnes marketing &amp; influence
                </h1>
                <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                  Suivi ROI · portée · engagement · {campaigns.length} campagne{campaigns.length > 1 ? "s" : ""} au total
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── B. Bande agrégat ─── */}
          <AnimatePresence>
            {visibleSections.has("strip") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: 24, display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
                }}
              >
                <SummaryStat
                  label="Campagnes"
                  value={String(aggregates.total)}
                  icon={<Megaphone size={13} />}
                  color={SAGE}
                />
                <SummaryStat
                  label="Budget cumulé"
                  value={formatMAD(aggregates.totalBudget)}
                  suffix="MAD"
                  icon={<Wallet size={13} />}
                  color={CHARCOAL}
                />
                <SummaryStat
                  label="Portée cumulée"
                  value={formatCompact(aggregates.totalReach)}
                  icon={<User size={13} />}
                  color={CHARCOAL}
                />
                <SummaryStat
                  label="ROI moyen"
                  value={formatPercent(aggregates.avgRoi, 1)}
                  icon={aggregates.avgRoi >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  color={aggregates.avgRoi >= 0 ? POSITIVE : RED}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── C. Barre d'outils (filtre statut) ─── */}
          <AnimatePresence>
            {visibleSections.has("toolbar") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: 16, display: "flex",
                  alignItems: "center", justifyContent: "space-between",
                  gap: 12, flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <FilterChip
                    label="Tous"
                    active={statusFilter === "all"}
                    onClick={() => setStatusFilter("all")}
                    count={campaigns.length}
                  />
                  <FilterChip
                    label="Actives"
                    active={statusFilter === "active"}
                    onClick={() => setStatusFilter("active")}
                    count={campaigns.filter((c) => c.status === "active").length}
                    dotColor={SAGE}
                  />
                  <FilterChip
                    label="Planifiées"
                    active={statusFilter === "scheduled"}
                    onClick={() => setStatusFilter("scheduled")}
                    count={campaigns.filter((c) => c.status === "scheduled").length}
                    dotColor={AMBER}
                  />
                  <FilterChip
                    label="Terminées"
                    active={statusFilter === "completed"}
                    onClick={() => setStatusFilter("completed")}
                    count={campaigns.filter((c) => c.status === "completed").length}
                    dotColor={TEXT_MUTED}
                  />
                </div>
                <button
                  onClick={() => setFormOpen((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", background: SAGE, color: WHITE,
                    border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <Plus size={13} /> Nouvelle campagne
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── D. Formulaire « Nouvelle campagne » ─── */}
          <AnimatePresence>
            {formOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  marginBottom: 16, padding: 16, background: "#FAFAFA",
                  borderRadius: 8, border: `1px solid ${BORDER}`,
                  overflow: "hidden",
                }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginBottom: 12,
                }}>
                  <Plus size={13} style={{ color: SAGE }} />
                  <span style={{
                    fontSize: 10, fontFamily: "'Space Mono', monospace",
                    color: SAGE, textTransform: "uppercase",
                    letterSpacing: "0.1em", fontWeight: 700,
                  }}>
                    Nouvelle campagne
                  </span>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void saveCampaign();
                  }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
                  }}
                >
                  <FormField label="Nom de la campagne">
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex. Lancement Collection Aïd"
                      required
                      style={inputStyle}
                    />
                  </FormField>
                  <FormField label="Marque">
                    <input
                      type="text"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      placeholder="Ex. Marjane"
                      required
                      style={inputStyle}
                    />
                  </FormField>
                  <FormField label="Influenceur">
                    <input
                      type="text"
                      value={formInfluencer}
                      onChange={(e) => setFormInfluencer(e.target.value)}
                      placeholder="Ex. @salma_dircom"
                      required
                      style={inputStyle}
                    />
                  </FormField>
                  <FormField label="Date de début">
                    <input
                      type="date"
                      value={formStart}
                      onChange={(e) => setFormStart(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </FormField>
                  <FormField label="Date de fin">
                    <input
                      type="date"
                      value={formEnd}
                      onChange={(e) => setFormEnd(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </FormField>
                  <FormField label="Budget (MAD)">
                    <input
                      type="number"
                      value={formBudget}
                      onChange={(e) => setFormBudget(e.target.value)}
                      placeholder="250000"
                      min={1}
                      step={100}
                      required
                      style={inputStyle}
                    />
                  </FormField>
                  <div style={{
                    gridColumn: "1 / -1", display: "flex", gap: 8,
                    justifyContent: "flex-end", marginTop: 4,
                  }}>
                    <button
                      type="button"
                      onClick={() => { resetForm(); setFormOpen(false); }}
                      style={{
                        padding: "8px 14px", background: "transparent",
                        color: TEXT_BODY, border: `1px solid ${BORDER}`,
                        borderRadius: 6, fontSize: 12, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 16px", background: saving ? BORDER : CHARCOAL,
                        color: saving ? TEXT_MUTED : WHITE,
                        border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                        cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
                      }}
                    >
                      {saving
                        ? <><Loader2 size={13} className="animate-spin" /> Enregistrement...</>
                        : <><Plus size={13} /> Créer la campagne</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── E. Grille de cartes campagnes ─── */}
          <AnimatePresence>
            {visibleSections.has("cards") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {filteredCampaigns.length === 0 ? (
                  <div style={{
                    padding: "48px 24px", textAlign: "center",
                    background: "#FAFAFA", borderRadius: 8,
                    border: `1px dashed ${BORDER}`,
                  }}>
                    <Megaphone size={28} style={{ color: TEXT_MUTED, marginBottom: 8 }} />
                    <p style={{ fontSize: 13, color: TEXT_BODY, margin: 0 }}>
                      {campaigns.length === 0
                        ? "Aucune campagne suivie pour le moment."
                        : "Aucune campagne ne correspond à ce filtre."}
                    </p>
                    <p style={{ fontSize: 12, color: TEXT_MUTED, margin: "4px 0 0" }}>
                      Cliquez sur « Nouvelle campagne » pour commencer.
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: 12,
                  }}>
                    {filteredCampaigns.map((c) => (
                      <CampaignCard
                        key={c.id}
                        campaign={c}
                        onOpenDetail={() => setDetailCampaign(c)}
                        onDelete={() => deleteCampaign(c.id)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pied — mention stockage */}
          <div style={{
            marginTop: 24, paddingTop: 16, borderTop: `1px solid ${BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, flexWrap: "wrap",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace",
            }}>
              <Info size={12} />
              <span>Stockage : localStorage · Clé : {STORAGE_KEY}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => window.print()}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", background: CHARCOAL, color: WHITE,
                  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <Download size={14} /> Exporter PDF
              </button>
              <button
                onClick={() => { loadFromStorage(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", background: "transparent", color: TEXT_BODY,
                  border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13,
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <RefreshCw size={14} /> Rafraîchir
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── F. Modal de détail (overlay) ─── */}
      <AnimatePresence>
        {detailCampaign && (
          <CampaignDetailModal
            campaign={detailCampaign}
            onClose={() => setDetailCampaign(null)}
            onDelete={() => deleteCampaign(detailCampaign.id)}
          />
        )}
      </AnimatePresence>

      {/* ─── CSS : animations + impression ─── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media print {
          body * { visibility: hidden; }
          #campaign-tracker-document, #campaign-tracker-document * {
            visibility: visible;
          }
          #campaign-tracker-document {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 32px; max-height: none; overflow: visible;
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
  label, value, suffix, icon, color,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px", background: "#FAFAFA", borderRadius: 8,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 6,
        fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
        textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
      }}>
        <span style={{ color, display: "flex", alignItems: "center" }}>{icon}</span>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>
          {value}
        </span>
        {suffix && (
          <span style={{ fontSize: 11, color: TEXT_MUTED }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── Pastille de filtre statut ───────────────────────────────
function FilterChip({
  label, active, onClick, count, dotColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 999,
        background: active ? SAGE_BG : WHITE,
        border: `1px solid ${active ? SAGE_BORDER : BORDER}`,
        color: active ? SAGE : TEXT_BODY,
        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {dotColor && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: dotColor,
          display: "inline-block",
        }} />
      )}
      {label}
      <span style={{
        fontSize: 10, color: active ? SAGE : TEXT_MUTED,
        fontFamily: "'Space Mono', monospace",
      }}>
        {count}
      </span>
    </button>
  );
}

// ─── Carte de campagne ───────────────────────────────────────
//
//  Mise en page :
//    [En-tête : nom · bouton voir détail]
//    [Badge statut · jauge de progression]
//    [Métriques : Budget · ROI · Portée · Engagement]
//    [Pied : dates · bouton supprimer]
function CampaignCard({
  campaign, onOpenDetail, onDelete,
}: {
  campaign: Campaign;
  onOpenDetail: () => void;
  onDelete: () => void;
}) {
  const statusMeta = statusVisual(campaign.status);
  const roiColor = campaign.roiPct >= 0 ? POSITIVE : RED;

  return (
    <div style={{
      padding: 16, background: WHITE, borderRadius: 8,
      border: `1px solid ${BORDER}`,
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      {/* En-tête */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 8,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: CHARCOAL, lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {campaign.name}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 4, marginTop: 4,
            fontSize: 11, color: TEXT_MUTED,
          }}>
            <Building2 size={11} /> {campaign.brand}
            <span style={{ color: BORDER }}>·</span>
            <User size={11} /> {campaign.influencer}
          </div>
        </div>
        <button
          onClick={onOpenDetail}
          title="Voir le détail"
          style={{
            width: 28, height: 28, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: `1px solid ${BORDER}`,
            borderRadius: 6, cursor: "pointer", color: TEXT_BODY,
          }}
        >
          <Eye size={13} />
        </button>
      </div>

      {/* Badge statut + jauge progression */}
      <div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: 999,
          background: statusMeta.bg, border: `1px solid ${statusMeta.border}`,
          fontSize: 10, fontWeight: 700, color: statusMeta.color,
          fontFamily: "'Space Mono', monospace", textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          {statusMeta.icon}
          {statusMeta.label}
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 10, color: TEXT_MUTED, marginBottom: 4,
            fontFamily: "'Space Mono', monospace",
          }}>
            <span>Progression</span>
            <span style={{ color: CHARCOAL, fontWeight: 700 }}>{campaign.progressPct}%</span>
          </div>
          <div style={{
            height: 6, background: BORDER, borderRadius: 3, overflow: "hidden",
          }}>
            <div style={{
              width: `${campaign.progressPct}%`, height: "100%",
              background: statusMeta.bar, transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Métriques */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8,
      }}>
        <CardMetric
          label="Budget"
          value={formatMAD(campaign.budgetMAD)}
          suffix="MAD"
          icon={<Wallet size={11} />}
        />
        <CardMetric
          label="ROI"
          value={formatPercent(campaign.roiPct, 1)}
          icon={campaign.roiPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          color={roiColor}
        />
        <CardMetric
          label="Portée"
          value={formatCompact(campaign.reach)}
          icon={<User size={11} />}
        />
        <CardMetric
          label="Engagement"
          value={`${campaign.engagementRate.toFixed(1)}%`}
          icon={<Percent size={11} />}
        />
      </div>

      {/* Pied */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 10, borderTop: `1px solid ${BORDER}`,
        fontSize: 11, color: TEXT_MUTED, gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Calendar size={11} />
          <span>
            {formatFrDate(campaign.startDate)} — {formatFrDate(campaign.endDate)}
          </span>
        </div>
        <button
          onClick={onDelete}
          title="Supprimer"
          style={{
            width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: "none", cursor: "pointer",
            color: TEXT_MUTED,
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Métrique compacte (carte) ───────────────────────────────
function CardMetric({
  label, value, suffix, icon, color,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div style={{
      padding: "8px 10px", background: "#FAFAFA", borderRadius: 6,
      border: `1px solid ${BORDER}`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 4, marginBottom: 3,
        fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
        textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
      }}>
        {icon}{label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{
          fontSize: 14, fontWeight: 700, color: color ?? CHARCOAL, lineHeight: 1,
        }}>
          {value}
        </span>
        {suffix && (
          <span style={{ fontSize: 10, color: TEXT_MUTED }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── Visuel par statut ───────────────────────────────────────
function statusVisual(status: CampaignStatus): {
  label: string;
  color: string;
  bg: string;
  border: string;
  bar: string;
  icon: React.ReactNode;
} {
  switch (status) {
    case "active":
      return {
        label: "Active",
        color: SAGE,
        bg: SAGE_BG,
        border: SAGE_BORDER,
        bar: SAGE,
        icon: <PlayCircle size={10} />,
      };
    case "scheduled":
      return {
        label: "Planifiée",
        color: AMBER,
        bg: AMBER_BG,
        border: AMBER_BORDER,
        bar: AMBER,
        icon: <Clock size={10} />,
      };
    case "completed":
      return {
        label: "Terminée",
        color: TEXT_MUTED,
        bg: "#FAFAFA",
        border: BORDER,
        bar: TEXT_MUTED,
        icon: <CheckCircle2 size={10} />,
      };
  }
}

// ═══════════════════════════════════════════════════════════════
//  Modal de détail — statistiques + BarChart + calculateur ROI
// ═══════════════════════════════════════════════════════════════

function CampaignDetailModal({
  campaign, onClose, onDelete,
}: {
  campaign: Campaign;
  onClose: () => void;
  onDelete: () => void;
}) {
  const engagementSeries = useMemo(
    () => buildDailyEngagement(campaign, 14),
    [campaign],
  );

  // Calculateur ROI : revenu généré MAD -> ROI%
  // Valeur initiale = revenu impliqué par le roiPct serveur.
  const initialRevenue = useMemo(() => {
    return Math.round(campaign.budgetMAD * (1 + campaign.roiPct / 100));
  }, [campaign]);

  const [revenueInput, setRevenueInput] = useState<string>(String(initialRevenue));
  const revenueNum = Number(revenueInput) || 0;
  const computedRoi = campaign.budgetMAD > 0
    ? ((revenueNum - campaign.budgetMAD) / campaign.budgetMAD) * 100
    : 0;
  const computedProfit = revenueNum - campaign.budgetMAD;
  const computedRoiColor = computedRoi >= 0 ? POSITIVE : RED;

  const daysTotal = Math.max(
    1,
    Math.round(
      (new Date(campaign.endDate).getTime() -
        new Date(campaign.startDate).getTime()) /
        (24 * 60 * 60 * 1000),
    ),
  );
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const startD = new Date(campaign.startDate + "T00:00:00Z");
  const endD = new Date(campaign.endDate + "T00:00:00Z");
  const daysElapsed = Math.max(
    0,
    Math.min(daysTotal, Math.round((today.getTime() - startD.getTime()) / (24 * 60 * 60 * 1000))),
  );
  const daysRemaining = Math.max(0, Math.round((endD.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));

  const statusMeta = statusVisual(campaign.status);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 210,
        background: "rgba(10,10,10,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          width: "100%", maxWidth: 760, maxHeight: "92vh",
          background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête modal */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
          background: "#FAFAFA",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <Megaphone size={16} style={{ color: SAGE, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: CHARCOAL,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {campaign.name}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 4, marginTop: 2,
                fontSize: 11, color: TEXT_MUTED,
              }}>
                <Building2 size={10} /> {campaign.brand}
                <span style={{ color: BORDER }}>·</span>
                <User size={10} /> {campaign.influencer}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={onDelete}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "6px 10px", background: "transparent", color: RED,
                border: `1px solid ${RED_BORDER}`, borderRadius: 6,
                fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Trash2 size={12} /> Supprimer
            </button>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none", cursor: "pointer", color: TEXT_MUTED,
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Corps modal */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 24px",
          fontFamily: "'Inter', system-ui, sans-serif", color: CHARCOAL,
        }}>
          {/* Badge statut + dates */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, marginBottom: 16, flexWrap: "wrap",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px", borderRadius: 999,
              background: statusMeta.bg, border: `1px solid ${statusMeta.border}`,
              fontSize: 10, fontWeight: 700, color: statusMeta.color,
              fontFamily: "'Space Mono', monospace", textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              {statusMeta.icon}{statusMeta.label}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace",
            }}>
              <Calendar size={12} />
              {formatFrDate(campaign.startDate)} — {formatFrDate(campaign.endDate)}
              <span style={{ color: BORDER }}>·</span>
              <span>{daysTotal} jours</span>
            </div>
          </div>

          {/* Jauge de progression */}
          <div style={{
            marginBottom: 20, padding: 12, background: "#FAFAFA",
            borderRadius: 8, border: `1px solid ${BORDER}`,
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", marginBottom: 6,
              fontSize: 10, fontFamily: "'Space Mono', monospace",
              color: TEXT_MUTED, textTransform: "uppercase",
              letterSpacing: "0.08em", fontWeight: 700,
            }}>
              <span>Progression temporelle</span>
              <span style={{ color: CHARCOAL }}>{campaign.progressPct}%</span>
            </div>
            <div style={{
              height: 8, background: BORDER, borderRadius: 4, overflow: "hidden",
            }}>
              <div style={{
                width: `${campaign.progressPct}%`, height: "100%",
                background: statusMeta.bar, transition: "width 0.4s ease",
              }} />
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", marginTop: 6,
              fontSize: 11, color: TEXT_MUTED,
            }}>
              <span>{daysElapsed} jours écoulés</span>
              <span>{daysRemaining} jours restants</span>
            </div>
          </div>

          {/* Grille de stats détaillées */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8, marginBottom: 20,
          }}>
            <DetailStat
              label="Budget"
              value={formatMAD(campaign.budgetMAD)}
              suffix="MAD"
              icon={<Wallet size={11} />}
            />
            <DetailStat
              label="Portée"
              value={formatMAD(campaign.reach)}
              icon={<User size={11} />}
            />
            <DetailStat
              label="Engagement"
              value={`${campaign.engagementRate.toFixed(2)}%`}
              icon={<Percent size={11} />}
            />
            <DetailStat
              label="ROI estimé"
              value={formatPercent(campaign.roiPct, 1)}
              icon={campaign.roiPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              color={campaign.roiPct >= 0 ? POSITIVE : RED}
            />
          </div>

          {/* BarChart — engagement quotidien */}
          <div style={{
            marginBottom: 20, padding: 16, background: WHITE,
            borderRadius: 8, border: `1px solid ${BORDER}`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, marginBottom: 12,
            }}>
              <BarChart3 size={13} style={{ color: SAGE }} />
              <span style={{
                fontSize: 10, fontFamily: "'Space Mono', monospace",
                color: SAGE, textTransform: "uppercase",
                letterSpacing: "0.1em", fontWeight: 700,
              }}>
                Engagement quotidien (14 derniers jours)
              </span>
            </div>
            {engagementSeries.length === 0 ? (
              <div style={{
                padding: 24, textAlign: "center",
                fontSize: 12, color: TEXT_MUTED,
              }}>
                La campagne n'est pas encore active — aucune donnée d'engagement.
              </div>
            ) : (
              <EngagementBarChart points={engagementSeries} />
            )}
          </div>

          {/* Calculateur ROI */}
          <div style={{
            padding: 16, background: SAGE_BG, borderRadius: 8,
            border: `1px solid ${SAGE_BORDER}`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, marginBottom: 12,
            }}>
              <Calculator size={13} style={{ color: SAGE }} />
              <span style={{
                fontSize: 10, fontFamily: "'Space Mono', monospace",
                color: SAGE, textTransform: "uppercase",
                letterSpacing: "0.1em", fontWeight: 700,
              }}>
                Calculateur ROI
              </span>
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
            }}>
              <div>
                <label style={{
                  display: "flex", flexDirection: "column", gap: 4,
                  fontSize: 10, fontFamily: "'Space Mono', monospace",
                  color: TEXT_MUTED, textTransform: "uppercase",
                  letterSpacing: "0.08em", fontWeight: 700,
                }}>
                  Revenu généré (MAD)
                  <input
                    type="number"
                    value={revenueInput}
                    onChange={(e) => setRevenueInput(e.target.value)}
                    min={0}
                    step={1000}
                    style={{
                      ...inputStyle,
                      background: WHITE,
                      border: `1px solid ${SAGE_BORDER}`,
                    }}
                  />
                </label>
                <div style={{
                  marginTop: 8, fontSize: 11, color: TEXT_MUTED, lineHeight: 1.5,
                }}>
                  Budget investi : <strong style={{ color: CHARCOAL }}>{formatMAD(campaign.budgetMAD)} MAD</strong>
                  <br />
                  Bénéfice net :{" "}
                  <strong style={{
                    color: computedProfit >= 0 ? POSITIVE : RED,
                  }}>
                    {computedProfit >= 0 ? "+" : ""}{formatMAD(computedProfit)} MAD
                  </strong>
                </div>
              </div>
              <div style={{
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: 12, background: WHITE, borderRadius: 8,
                border: `1px solid ${SAGE_BORDER}`,
              }}>
                <div style={{
                  fontSize: 10, fontFamily: "'Space Mono', monospace",
                  color: TEXT_MUTED, textTransform: "uppercase",
                  letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6,
                }}>
                  ROI calculé
                </div>
                <div style={{
                  display: "flex", alignItems: "baseline", gap: 4,
                }}>
                  <span style={{
                    fontSize: 32, fontWeight: 700, color: computedRoiColor, lineHeight: 1,
                  }}>
                    {formatPercent(computedRoi, 1)}
                  </span>
                </div>
                <div style={{
                  fontSize: 11, color: TEXT_MUTED, marginTop: 6,
                }}>
                  Formule : (revenu − budget) / budget × 100
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Stat détaillé (modal) ───────────────────────────────────
function DetailStat({
  label, value, suffix, icon, color,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div style={{
      padding: "10px 12px", background: "#FAFAFA", borderRadius: 8,
      border: `1px solid ${BORDER}`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 4, marginBottom: 6,
        fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
        textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
      }}>
        {icon}{label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{
          fontSize: 16, fontWeight: 700, color: color ?? CHARCOAL, lineHeight: 1,
        }}>
          {value}
        </span>
        {suffix && (
          <span style={{ fontSize: 10, color: TEXT_MUTED }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── BarChart SVG inline (engagement quotidien) ──────────────
//
// Rendu : SVG ~ 320×120. Axes implicites. Pas de dépendance
// externe (pas de Recharts) — autonomie maximale, contrôle fin
// du style sage/charcoal.
function EngagementBarChart({
  points,
}: {
  points: Array<{ day: string; label: string; value: number }>;
}) {
  const W = 640;
  const H = 160;
  const padL = 32;
  const padR = 12;
  const padT = 12;
  const padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const max = Math.max(...points.map((p) => p.value), 0.1);
  const barW = points.length > 0 ? innerW / points.length : 0;
  // On laisse un peu d'air entre les barres.
  const barGap = Math.min(4, barW * 0.2);
  const barDrawW = Math.max(2, barW - barGap);

  // Paliers de l'axe Y : 0, max/2, max.
  const yTicks = [0, max / 2, max];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      role="img"
      aria-label="Engagement quotidien"
      style={{ display: "block", maxWidth: "100%" }}
    >
      {/* Axe Y horizontal */}
      {yTicks.map((t, i) => {
        const y = padT + innerH - (t / max) * innerH;
        return (
          <g key={i}>
            <line
              x1={padL} y1={y} x2={W - padR} y2={y}
              stroke={i === 0 ? BORDER : "#FAFAFA"}
              strokeWidth={i === 0 ? 1 : 1}
            />
            <text
              x={padL - 6} y={y + 3}
              textAnchor="end" fontSize={9}
              fontFamily="'Space Mono', monospace"
              fill={TEXT_MUTED}
            >
              {t.toFixed(1)}%
            </text>
          </g>
        );
      })}

      {/* Barres */}
      {points.map((p, i) => {
        const x = padL + i * barW + barGap / 2;
        const h = (p.value / max) * innerH;
        const y = padT + innerH - h;
        // Couleur de la barre : sage par défaut, plus foncée si valeur
        // au-dessus de la moyenne.
        const avg = points.reduce((s, q) => s + q.value, 0) / points.length;
        const fill = p.value >= avg ? SAGE : "rgba(74,123,95,0.45)";
        return (
          <g key={p.day}>
            <rect
              x={x} y={y} width={barDrawW} height={Math.max(1, h)}
              fill={fill} rx={2}
            />
            {/* Label date tous les 2 points (évite la surcharge) */}
            {i % 2 === 0 && (
              <text
                x={x + barDrawW / 2} y={H - 8}
                textAnchor="middle" fontSize={8}
                fontFamily="'Space Mono', monospace"
                fill={TEXT_MUTED}
              >
                {p.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Ligne moyenne */}
      {points.length > 0 && (
        <g>
          {(() => {
            const avg = points.reduce((s, q) => s + q.value, 0) / points.length;
            const y = padT + innerH - (avg / max) * innerH;
            return (
              <>
                <line
                  x1={padL} y1={y} x2={W - padR} y2={y}
                  stroke={AMBER} strokeWidth={1} strokeDasharray="3,3"
                />
                <text
                  x={W - padR} y={y - 4}
                  textAnchor="end" fontSize={9}
                  fontFamily="'Space Mono', monospace"
                  fill={AMBER}
                >
                  moy {avg.toFixed(1)}%
                </text>
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
}

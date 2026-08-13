"use client";

// ═══════════════════════════════════════════════════════════════
//  SentimentHeatmapGenerator
//
//  Skill 27 — Carte de Chaleur Sentiment (calendrier).
//  Grille façon GitHub (7 jours × 13 ou 26 semaines) montrant le
//  sentiment quotidien de la presse couvrant l'entreprise :
//    • chaque cellule = un jour,
//    • couleur de base par sentiment (rouge / gris / sage),
//    • intensité (alpha) proportionnelle au volume d'articles,
//    • survol → tooltip (date, compte, sentiment %),
//    • clic → bandeau détail jour (top 3 articles du jour).
//
//  Même motif de popup que BriefingGenerator / GeoHeatmapGenerator :
//    • overlay fixe avec backdrop blur
//    • entrée en scale (framer-motion)
//    • sections révélées une à une (AnimatePresence)
//    • barre d'actions : Export PDF (window.print) · Régénérer
//    • CSS print isolant #sentiment-heatmap-document
//
//  Palette : Blanc / Sage / Charcoal — outil stratégique, pas crise.
//  Typographie : Space Mono (labels techniques, dates, scores),
//                Inter (corps).
//  Icônes : Lucide uniquement. Aucun emoji.
//
//  Structure du corps :
//    a. En-tête — date + entreprise + secteur + fenêtre N semaines
//    b. Bande synthèse — Articles / Jours actifs /
//       Sentiment moyen / Pic journalier
//    c. Toggle segmenté 13 semaines / 26 semaines
//    d. [si jour sélectionné] Bandeau détail jour
//       (top 3 articles cliquables)
//    e. Grille — 7 jours (lignes) × N semaines (colonnes)
//       · étiquettes mois en haut
//       · étiquettes jours (Lun..Dim) à gauche
//       · tooltip au survol
//    f. Légende — sage/gris/rouge + échelle d'intensité
//    g. Actions — Exporter PDF · Régénérer
//
//  Skill ID : SKILL-27-SENT-HEATMAP
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  Calendar, Layers, ExternalLink, TrendingUp, TrendingDown, Minus,
  Newspaper,
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
const RED = "#DC2626";
const RED_BG = "rgba(220,38,38,0.08)";
const RED_BORDER = "rgba(220,38,38,0.25)";
const GRAY_NEUTRAL = "#9CA3AF";
const GRAY_NEUTRAL_BG = "rgba(156,163,175,0.12)";
const GRAY_NEUTRAL_BORDER = "rgba(156,163,175,0.35)";
const EMPTY_CELL_BG = "#FAFAFA";

// ─── Types — miroir de SentimentHeatmapResponse (route.ts) ────

type DominantSentiment = "positif" | "neutre" | "négatif";

interface SentimentBucket {
  date: string;                 // YYYY-MM-DD
  articleCount: number;
  sentimentScore: number | null;  // -1..+1
  dominantSentiment: DominantSentiment | null;
}

interface SentimentHeatmapMeta {
  companyName: string;
  sector: string;
  generatedAt: string;
  weeks: number;
  startDate: string;
  endDate: string;
  totalArticles: number;
  activeDays: number;
  source: "real" | "demo";
}

interface SentimentHeatmapData {
  buckets: SentimentBucket[];
  meta: SentimentHeatmapMeta;
}

interface DayDetailArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
  sentimentLabel: string | null;
  sentimentScore: number | null;
}

interface DayDetail {
  date: string;
  articleCount: number;
  sentimentScore: number | null;
  dominantSentiment: DominantSentiment | null;
  articles: DayDetailArticle[];
}

// ─── Constantes d'affichage ──────────────────────────────────
const WEEKS_SHORT = 13;
const WEEKS_LONG = 26;

// Étiquettes jours — semaine commence lundi (convention FR).
const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

// Étiquettes mois abrégées (français).
const MONTH_LABELS = [
  "Janv", "Févr", "Mars", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sept", "Oct", "Nov", "Déc",
] as const;

// ─── Helpers chaleur ─────────────────────────────────────────
//  Identique au palier de GeoHeatmapGenerator pour rester
//  cohérent à travers la console :
//    sentimentScore >= +0.20  →  "positif"  (sage)
//    sentimentScore >= -0.10  →  "neutre"   (gris)
//    sentimentScore <  -0.10  →  "négatif"  (rouge)
//    null / 0 articles        →  null       (cellule vide)
function heatClassFromDominant(d: DominantSentiment | null): "positive" | "neutral" | "negative" | "empty" {
  if (d === "positif") return "positive";
  if (d === "négatif") return "negative";
  if (d === "neutre") return "neutral";
  return "empty";
}

function heatColor(d: DominantSentiment | null): string {
  const c = heatClassFromDominant(d);
  if (c === "positive") return SAGE;
  if (c === "negative") return RED;
  if (c === "neutral") return GRAY_NEUTRAL;
  return EMPTY_CELL_BG;
}

/** Couleur de fond d'une cellule, en combinant le sentiment
 *  dominant (teinte) et le volume d'articles (intensité alpha).
 *  Les jours sans article reçoivent un gris très pâle. */
function cellBackground(
  bucket: SentimentBucket,
  maxCount: number,
): string {
  if (bucket.articleCount === 0) return EMPTY_CELL_BG;
  // alpha entre 0.20 (1 article, faible) et 1.0 (max articles).
  const ratio = maxCount > 0 ? bucket.articleCount / maxCount : 0;
  const alpha = 0.20 + 0.80 * Math.min(1, Math.max(0, ratio));
  const c = heatClassFromDominant(bucket.dominantSentiment);
  if (c === "positive") return `rgba(74,123,95,${alpha.toFixed(2)})`;
  if (c === "negative") return `rgba(220,38,38,${alpha.toFixed(2)})`;
  if (c === "neutral") return `rgba(156,163,175,${alpha.toFixed(2)})`;
  return EMPTY_CELL_BG;
}

function dominantLabel(d: DominantSentiment | null): string {
  if (d === "positif") return "Positif";
  if (d === "négatif") return "Négatif";
  if (d === "neutre") return "Neutre";
  return "—";
}

// ─── Formatage date (français, sans Intl pour éviter les
//     ponctuations automatiques comme "lun. 15 janv.") ────────

const WEEKDAY_FULL = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

/** Retourne l'index jour-de-semaine en convention lundi=0..dimanche=6. */
function mondayDow(date: Date): number {
  // JS getDay : dimanche=0..samedi=6. On décale pour lundi=0.
  return (date.getUTCDay() + 6) % 7;
}

/** Parse "YYYY-MM-DD" en Date UTC. */
function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

/** Formate "YYYY-MM-DD" en "Lun 15 Jan 2025" (français court). */
function fmtDateFr(ymd: string): string {
  const d = parseYmd(ymd);
  const wd = WEEKDAY_FULL[mondayDow(d)];
  const day = d.getUTCDate();
  const mo = MONTH_LABELS[d.getUTCMonth()];
  const yr = d.getUTCFullYear();
  return `${wd} ${day} ${mo} ${yr}`;
}

/** Formate "YYYY-MM-DD" en "15 Jan 2025" (sans weekday). */
function fmtDateFrShort(ymd: string): string {
  const d = parseYmd(ymd);
  const day = d.getUTCDate();
  const mo = MONTH_LABELS[d.getUTCMonth()];
  const yr = d.getUTCFullYear();
  return `${day} ${mo} ${yr}`;
}

/** Formate un score -1..+1 en " 45%" / "-30%" / " 0%". */
function fmtPct(score: number | null): string {
  if (score == null) return "—";
  const v = Math.round(score * 100);
  const sign = v > 0 ? "+" : v < 0 ? "" : " ";
  return `${sign}${v}%`;
}

/** Formate un score -1..+1 en "+0.45" / "-0.30" / " 0.00". */
function fmtScore(score: number | null): string {
  if (score == null) return "—";
  const sign = score > 0 ? "+" : score < 0 ? "" : " ";
  return `${sign}${score.toFixed(2)}`;
}

// ─── Icône de tendance ───────────────────────────────────────
function TrendIcon({
  value, size, style,
}: {
  value: number | null;
  size?: number;
  style?: React.CSSProperties;
}) {
  if (value == null) return <Minus size={size} style={style} />;
  if (value > 0.05) return <TrendingUp size={size} style={style} />;
  if (value < -0.05) return <TrendingDown size={size} style={style} />;
  return <Minus size={size} style={style} />;
}

// ─── Cadence de révélation des sections ──────────────────────
const SECTIONS = [
  { id: "header",       delay: 200 },
  { id: "summary",      delay: 400 },
  { id: "toggle",       delay: 550 },
  { id: "day-detail",   delay: 700 },
  { id: "grid",         delay: 850 },
  { id: "legend",       delay: 1050 },
  { id: "actions",      delay: 1250 },
];

type WeekMode = typeof WEEKS_SHORT | typeof WEEKS_LONG;

// ═══════════════════════════════════════════════════════════════
//  Composant principal
// ═══════════════════════════════════════════════════════════════

export function SentimentHeatmapGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SentimentHeatmapData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);

  // Fenêtre courante : 13 semaines par défaut, basculable à 26.
  const [weeks, setWeeks] = useState<WeekMode>(WEEKS_SHORT);

  // Jour sélectionné (YYYY-MM-DD) pour le bandeau détail.
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
  const [dayDetailLoading, setDayDetailLoading] = useState(false);

  // Cellule survolée pour le tooltip : on garde la position
  // (relative au conteneur du document) + le bucket.
  const [hovered, setHovered] = useState<
    | { x: number; y: number; bucket: SentimentBucket }
    | null
  >(null);

  // Référence au conteneur du document (pour positionner le
  // tooltip en absolu relativement à lui).
  const docRef = useRef<HTMLDivElement | null>(null);

  // ─── Génération de la heatmap ────────────────────────────
  const generate = useCallback(async (mode: WeekMode) => {
    setLoading(true);
    setError(null);
    setData(null);
    setSelectedDate(null);
    setDayDetail(null);
    setHovered(null);
    setVisibleSections(new Set());
    setGenerating(true);
    try {
      const res = await fetch("/api/console/sentiment-heatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeks: mode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as SentimentHeatmapData;
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
    void generate(weeks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Bascule 13 / 26 semaines ────────────────────────────
  function handleWeeksChange(mode: WeekMode) {
    if (mode === weeks) return;
    setWeeks(mode);
    void generate(mode);
  }

  // ─── Clic sur une cellule → charge le détail du jour ────
  const loadDayDetail = useCallback(async (date: string) => {
    setSelectedDate(date);
    setDayDetail(null);
    setDayDetailLoading(true);
    try {
      const res = await fetch("/api/console/sentiment-heatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { dayDetail: DayDetail };
      setDayDetail(json.dayDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec détail jour");
    } finally {
      setDayDetailLoading(false);
    }
  }, []);

  function handleCellClick(bucket: SentimentBucket) {
    if (bucket.articleCount === 0) return; // cellule vide : non cliquable
    if (selectedDate === bucket.date) {
      // Re-clic sur la cellule déjà sélectionnée → ferme le bandeau.
      setSelectedDate(null);
      setDayDetail(null);
      return;
    }
    void loadDayDetail(bucket.date);
  }

  // ─── Stats dérivées pour la bande synthèse ───────────────
  const stats = useMemo(() => {
    if (!data) return { total: 0, active: 0, avg: null as number | null, peak: 0 };
    let total = 0;
    let active = 0;
    let sum = 0;
    let sumCount = 0;
    let peak = 0;
    for (const b of data.buckets) {
      total += b.articleCount;
      if (b.articleCount > 0) active += 1;
      if (b.articleCount > peak) peak = b.articleCount;
      if (b.sentimentScore != null) {
        sum += b.sentimentScore;
        sumCount += 1;
      }
    }
    const avg = sumCount > 0 ? Math.round((sum / sumCount) * 1000) / 1000 : null;
    return { total, active, avg, peak };
  }, [data]);

  // ─── Volume max pour le calcul d'intensité ────────────────
  const maxCount = useMemo(() => {
    if (!data) return 0;
    let m = 0;
    for (const b of data.buckets) if (b.articleCount > m) m = b.articleCount;
    return m;
  }, [data]);

  // ─── Calcul de la structure de grille ─────────────────────
  //  On dérive du premier bucket :
  //    firstBucketDow = index lundi=0 du premier jour (0..6)
  //    leadingPad = firstBucketDow cellules vides à mettre en
  //                 haut de la première colonne (jours avant le
  //                 début de la fenêtre,alignés à la semaine).
  //    totalWeekCols = ceil((buckets.length + leadingPad) / 7)
  //  Chaque bucket i est placé à :
  //    colonne = floor((i + leadingPad) / 7) + 1  (1-indexé, hors label)
  //    ligne   = dayOfWeek(bucket.date) + 2       (lundi=2..dimanche=8)
  const grid = useMemo(() => {
    if (!data || data.buckets.length === 0) {
      return {
        leadingPad: 0,
        totalWeekCols: 0,
        placements: [] as Array<{ bucket: SentimentBucket; col: number; row: number }>,
        monthMarks: [] as Array<{ col: number; label: string }>,
      };
    }
    const first = data.buckets[0];
    const firstDow = mondayDow(parseYmd(first.date));
    const leadingPad = firstDow;
    const totalCells = data.buckets.length + leadingPad;
    const totalWeekCols = Math.ceil(totalCells / 7);

    const placements = data.buckets.map((bucket, i) => {
      const adj = i + leadingPad;
      const col = Math.floor(adj / 7) + 1; // 1-indexed (hors label col)
      // On utilise la vraie date pour la ligne — robuste même si
      // la séquence n'est pas strictement consécutive.
      const row = mondayDow(parseYmd(bucket.date)) + 2; // 2..8
      return { bucket, col, row };
    });

    // Étiquettes mois : pour chaque colonne, on regarde le
    // premier bucket de la colonne. Si son mois diffère de la
    // colonne précédente, on place un label mois en haut.
    const monthMarks: Array<{ col: number; label: string }> = [];
    let prevMonth = -1;
    for (let c = 1; c <= totalWeekCols; c++) {
      // Trouver le premier bucket de cette colonne.
      const firstInCol = placements.find((p) => p.col === c);
      if (!firstInCol) continue;
      const m = parseYmd(firstInCol.bucket.date).getUTCMonth();
      if (m !== prevMonth) {
        monthMarks.push({ col: c, label: MONTH_LABELS[m] });
        prevMonth = m;
      }
    }

    return { leadingPad, totalWeekCols, placements, monthMarks };
  }, [data]);

  // ─── Positionnement du tooltip ────────────────────────────
  //  On stocke les coordonnées clientX/clientY au mouseenter et
  //  on convertit en coordonnées relatives au conteneur docRef.
  function handleCellEnter(e: React.MouseEvent, bucket: SentimentBucket) {
    if (!docRef.current) return;
    const rect = docRef.current.getBoundingClientRect();
    setHovered({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      bucket,
    });
  }

  function handleCellMove(e: React.MouseEvent) {
    if (!docRef.current || !hovered) return;
    const rect = docRef.current.getBoundingClientRect();
    setHovered((prev) =>
      prev
        ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top }
        : prev,
    );
  }

  // ─── Render ──────────────────────────────────────────────
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
            <Calendar size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14, fontWeight: 700, color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Carte de Chaleur Sentiment
            </span>
            {generating && (
              <span
                style={{
                  display: "flex", alignItems: "center", gap: 4, fontSize: 11,
                  color: SAGE, fontFamily: "'Space Mono', monospace",
                }}
              >
                <Loader2 size={11} className="animate-spin" /> Collecte...
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
          ref={docRef}
          style={{
            flex: 1, overflowY: "auto", padding: "28px 36px",
            fontFamily: "'Inter', system-ui, sans-serif", color: CHARCOAL,
            position: "relative",
          }}
          onMouseMove={handleCellMove}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2
                size={32}
                style={{ color: SAGE, animation: "spin 1s linear infinite" }}
              />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>
                Agrégation du sentiment quotidien (13 semaines, 91 jours)...
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: RED }} />
              <p style={{ marginTop: 12, fontSize: 14, color: RED }}>{error}</p>
              <button
                onClick={() => generate(weeks)}
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
            <div id="sentiment-heatmap-document">
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
                        Veille sentiment · Fenêtre {data.meta.weeks} semaines
                      </span>
                    </div>
                    <h1
                      style={{
                        fontSize: 26, fontWeight: 700, margin: 0, color: CHARCOAL,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Carte de Chaleur — {data.meta.companyName}
                    </h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                      Secteur : {data.meta.sector} ·
                      {" "}{fmtDateFrShort(data.meta.startDate)} → {fmtDateFrShort(data.meta.endDate)} ·
                      {" "}Source : {data.meta.source === "demo" ? "démo" : "réelle"}
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
                      label="Articles total"
                      value={String(stats.total)}
                      color={CHARCOAL}
                    />
                    <SummaryStat
                      label="Jours actifs"
                      value={`${stats.active} / ${data.meta.weeks * 7}`}
                      color={SAGE}
                    />
                    <SummaryStat
                      label="Sentiment moyen"
                      value={stats.avg == null ? "—" : fmtScore(stats.avg)}
                      color={
                        stats.avg == null
                          ? TEXT_MUTED
                          : stats.avg >= 0.2
                            ? SAGE
                            : stats.avg < -0.1
                              ? RED
                              : GRAY_NEUTRAL
                      }
                      icon={<TrendIcon value={stats.avg} size={12} style={{ color: "inherit" }} />}
                    />
                    <SummaryStat
                      label="Pic journalier"
                      value={String(stats.peak)}
                      color={TEXT_BODY}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── C. Toggle 13 / 26 semaines ─── */}
              <AnimatePresence>
                {visibleSections.has("toggle") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 20,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 16, flexWrap: "wrap",
                    }}
                  >
                    <div
                      role="tablist"
                      aria-label="Sélection de la fenêtre temporelle"
                      style={{
                        display: "inline-flex", padding: 4,
                        background: "#FAFAFA", border: `1px solid ${BORDER}`,
                        borderRadius: 8, gap: 4,
                      }}
                    >
                      <ToggleButton
                        active={weeks === WEEKS_SHORT}
                        onClick={() => handleWeeksChange(WEEKS_SHORT)}
                        icon={<Calendar size={14} />}
                        label="13 semaines"
                      />
                      <ToggleButton
                        active={weeks === WEEKS_LONG}
                        onClick={() => handleWeeksChange(WEEKS_LONG)}
                        icon={<Layers size={14} />}
                        label="26 semaines"
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 11, color: TEXT_MUTED,
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      {data.buckets.length} jours · {grid.totalWeekCols} colonnes
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── D. Bandeau détail jour (si sélectionné) ─── */}
              <AnimatePresence>
                {visibleSections.has("day-detail") && selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    style={{ marginBottom: 20, overflow: "hidden" }}
                  >
                    <DayDetailBanner
                      date={selectedDate}
                      detail={dayDetail}
                      loading={dayDetailLoading}
                      onClose={() => {
                        setSelectedDate(null);
                        setDayDetail(null);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── E. Grille heatmap ─── */}
              <AnimatePresence>
                {visibleSections.has("grid") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    <HeatmapGrid
                      buckets={data.buckets}
                      grid={grid}
                      maxCount={maxCount}
                      selectedDate={selectedDate}
                      onCellEnter={handleCellEnter}
                      onCellLeave={() => setHovered(null)}
                      onCellClick={handleCellClick}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── F. Légende ─── */}
              <AnimatePresence>
                {visibleSections.has("legend") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24, padding: 14, background: "#FAFAFA",
                      borderRadius: 8, border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
                      }}
                    >
                      <Layers size={12} style={{ color: TEXT_MUTED }} />
                      <span
                        style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED, textTransform: "uppercase",
                          letterSpacing: "0.1em", fontWeight: 700,
                        }}
                      >
                        Légende — sentiment et intensité
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex", flexWrap: "wrap", gap: 16,
                        alignItems: "center", fontSize: 12,
                      }}
                    >
                      <LegendItem color={SAGE} label="Positif" hint="sentiment ≥ +0.20" />
                      <LegendItem color={GRAY_NEUTRAL} label="Neutre" hint="-0.10 ≤ sentiment < +0.20" />
                      <LegendItem color={RED} label="Négatif" hint="sentiment < -0.10" />
                      <IntensityScale maxCount={maxCount} />
                    </div>
                    <div
                      style={{
                        marginTop: 10, paddingTop: 10,
                        borderTop: `1px solid ${BORDER}`,
                        fontSize: 11, color: TEXT_MUTED, lineHeight: 1.5,
                      }}
                    >
                      Intensité (alpha) proportionnelle au nombre d'articles publiés dans la journée (pic = {maxCount}).
                      Cellules vides = aucun article ce jour. Cliquez une cellule active pour voir le top 3 des articles du jour.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── G. Actions ─── */}
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
                      onClick={() => generate(weeks)}
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
                    Agrégation en cours...
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>

      </motion.div>

      {/* ─── Tooltip (absolu, hors motion.div pour éviter le
           clipping par overflow:hidden) ─── */}
      <AnimatePresence>
        {hovered && hovered.bucket.articleCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "fixed",
              left: hovered.x + docOffsetLeft(docRef.current),
              top: hovered.y + docOffsetTop(docRef.current) - 8,
              transform: "translate(-50%, -100%)",
              background: CHARCOAL, color: WHITE,
              padding: "8px 12px", borderRadius: 6,
              fontSize: 11, fontFamily: "'Space Mono', monospace",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              pointerEvents: "none", zIndex: 300,
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {fmtDateFr(hovered.bucket.date)}
            </div>
            <div style={{ display: "flex", gap: 10, opacity: 0.95 }}>
              <span>{hovered.bucket.articleCount} article{hovered.bucket.articleCount > 1 ? "s" : ""}</span>
              <span style={{ color: heatColor(hovered.bucket.dominantSentiment) }}>
                {fmtPct(hovered.bucket.sentimentScore)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CSS : animations + impression ─── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media print {
          body * { visibility: hidden; }
          #sentiment-heatmap-document, #sentiment-heatmap-document * { visibility: visible; }
          #sentiment-heatmap-document {
            position: absolute; left: 0; top: 0;
            width: 100%; padding: 40px;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Helpers de positionnement du tooltip ────────────────────
//  Le tooltip est rendu en `position: fixed` (hors du motion.div
//  qui a overflow:hidden). hovered.x/y sont les coordonnées
//  relatives au conteneur docRef (le corps du document). On
//  ajoute l'offset du conteneur pour obtenir la position écran.
function docOffsetLeft(el: HTMLDivElement | null): number {
  if (!el) return 0;
  return el.getBoundingClientRect().left;
}
function docOffsetTop(el: HTMLDivElement | null): number {
  if (!el) return 0;
  return el.getBoundingClientRect().top;
}

// ═══════════════════════════════════════════════════════════════
//  Sous-composants
// ═══════════════════════════════════════════════════════════════

// ─── Stat synthétique (bande du haut) ─────────────────────────
function SummaryStat({
  label, value, color, icon,
}: {
  label: string;
  value: string;
  color: string;
  icon?: React.ReactNode;
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
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 22, fontWeight: 700, color, lineHeight: 1,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {icon}
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Bouton de toggle segmenté ────────────────────────────────
function ToggleButton({
  active, onClick, icon, label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 14px",
        background: active ? CHARCOAL : "transparent",
        color: active ? WHITE : TEXT_BODY,
        border: "none", borderRadius: 6,
        fontSize: 12, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit",
        transition: "background 150ms ease, color 150ms ease",
      }}
    >
      {icon}
      <span style={{ fontFamily: "'Space Mono', monospace" }}>{label}</span>
    </button>
  );
}

// ─── Grille heatmap (7 jours × N semaines) ────────────────────
interface GridInfo {
  leadingPad: number;
  totalWeekCols: number;
  placements: Array<{ bucket: SentimentBucket; col: number; row: number }>;
  monthMarks: Array<{ col: number; label: string }>;
}

function HeatmapGrid({
  buckets, grid, maxCount, selectedDate,
  onCellEnter, onCellLeave, onCellClick,
}: {
  buckets: SentimentBucket[];
  grid: GridInfo;
  maxCount: number;
  selectedDate: string | null;
  onCellEnter: (e: React.MouseEvent, bucket: SentimentBucket) => void;
  onCellLeave: () => void;
  onCellClick: (bucket: SentimentBucket) => void;
}) {
  // Largeurs de colonnes : 30px (label jours) + totalWeekCols × 14px.
  // Hauteurs de lignes : 18px (label mois) + 7 × 14px.
  const labelColW = 32;
  const cellW = 14;
  const monthRowH = 18;
  const cellH = 14;
  const gap = 3;

  // On construit explicitement grid-template-columns / rows pour
  // pouvoir positionner chaque cellule avec grid-column/grid-row.
  const colTemplate = `${labelColW}px repeat(${grid.totalWeekCols}, ${cellW}px)`;
  const rowTemplate = `${monthRowH}px repeat(7, ${cellH}px)`;

  // Map date → placement pour retrouver rapidement.
  const placementByDate = new Map<string, { col: number; row: number }>();
  for (const p of grid.placements) {
    placementByDate.set(p.bucket.date, { col: p.col, row: p.row });
  }

  return (
    <div>
      <div
        style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
          marginBottom: 10,
        }}
      >
        Calendrier sentiment — {buckets.length} jours
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: colTemplate,
          gridTemplateRows: rowTemplate,
          gap: `${gap}px`,
          width: "fit-content",
        }}
      >
        {/* Case coin haut-gauche (vide) */}
        <div style={{ gridColumn: 1, gridRow: 1 }} />

        {/* Étiquettes mois (ligne 1) */}
        {grid.monthMarks.map((m) => (
          <div
            key={`month-${m.col}`}
            style={{
              gridColumn: m.col + 1, gridRow: 1,
              fontSize: 10, fontFamily: "'Space Mono', monospace",
              color: TEXT_MUTED, fontWeight: 700,
              display: "flex", alignItems: "flex-end",
              paddingBottom: 2, whiteSpace: "nowrap",
            }}
          >
            {m.label}
          </div>
        ))}

        {/* Étiquettes jours (colonne 1) */}
        {DAY_LABELS.map((lbl, i) => (
          <div
            key={`day-${lbl}`}
            style={{
              gridColumn: 1, gridRow: i + 2,
              fontSize: 10, fontFamily: "'Space Mono', monospace",
              color: TEXT_MUTED, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "flex-end",
              paddingRight: 6,
            }}
          >
            {lbl}
          </div>
        ))}

        {/* Cellules vides de padding (haut de la première colonne) */}
        {Array.from({ length: grid.leadingPad }).map((_, i) => (
          <div
            key={`pad-${i}`}
            style={{
              gridColumn: 2, gridRow: i + 2,
              background: "transparent",
              borderRadius: 2,
            }}
            aria-hidden
          />
        ))}

        {/* Cellules bucket */}
        {grid.placements.map(({ bucket, col, row }) => {
          const bg = cellBackground(bucket, maxCount);
          const isSelected = selectedDate === bucket.date;
          const isEmpty = bucket.articleCount === 0;
          const border = isSelected
            ? `2px solid ${CHARCOAL}`
            : `1px solid ${isSelected ? CHARCOAL : BORDER}`;
          return (
            <button
              key={bucket.date}
              onMouseEnter={(e) => onCellEnter(e, bucket)}
              onMouseLeave={onCellLeave}
              onClick={() => onCellClick(bucket)}
              disabled={isEmpty}
              aria-label={`${fmtDateFr(bucket.date)} — ${bucket.articleCount} article(s), sentiment ${fmtPct(bucket.sentimentScore)}`}
              title={
                isEmpty
                  ? `${fmtDateFr(bucket.date)} — aucun article`
                  : `${fmtDateFr(bucket.date)} — ${bucket.articleCount} article(s), ${fmtPct(bucket.sentimentScore)}`
              }
              style={{
                gridColumn: col + 1,
                gridRow: row,
                width: cellW,
                height: cellH,
                background: bg,
                border,
                borderRadius: 2,
                cursor: isEmpty ? "default" : "pointer",
                padding: 0,
                transition: "transform 120ms ease, box-shadow 120ms ease",
                transform: isSelected ? "scale(1.25)" : "scale(1)",
                boxShadow: isSelected
                  ? "0 0 0 1px rgba(10,10,10,0.4), 0 2px 6px rgba(0,0,0,0.18)"
                  : "none",
              }}
            />
          );
        })}

        {/* Cellules vides de fin (si la dernière colonne n'est pas
            complète — typiquement quand aujourd'hui n'est pas un
            dimanche). Elles garantissent que la grille reste
            rectangulaire visuellement. */}
        {(() => {
          // Calcule combien de cellules manquent pour remplir la
          // dernière colonne.
          const filled = grid.leadingPad + buckets.length;
          const totalCells = grid.totalWeekCols * 7;
          const trailing = totalCells - filled;
          const lastCol = grid.totalWeekCols;
          // Position de départ : filled - leadingPad + 2 (première
          // cellule libre en haut de la dernière colonne).
          const startRow = (filled % 7) + 2;
          return Array.from({ length: Math.max(0, trailing) }).map((_, i) => (
            <div
              key={`trail-${i}`}
              style={{
                gridColumn: lastCol + 1,
                gridRow: startRow + i,
                background: "transparent",
                borderRadius: 2,
              }}
              aria-hidden
            />
          ));
        })()}
      </div>

      {/* Note sous la grille */}
      <div
        style={{
          marginTop: 12, fontSize: 10,
          fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
        }}
      >
        Semaine commence lundi · Dernière colonne = semaine courante.
      </div>
    </div>
  );
}

// ─── Bandeau détail jour ──────────────────────────────────────
function DayDetailBanner({
  date, detail, loading, onClose,
}: {
  date: string;
  detail: DayDetail | null;
  loading: boolean;
  onClose: () => void;
}) {
  // Si détail pas encore chargé, on affiche juste le header avec
  // un loader. Sinon on prend les stats du détail (qui inclut le
  // total compte + score moyen + dominant).
  const count = detail?.articleCount ?? 0;
  const score = detail?.sentimentScore ?? null;
  const dominant = detail?.dominantSentiment ?? null;
  const c = heatColor(dominant);
  const label = dominantLabel(dominant);
  const bannerBg =
    dominant === "positif"
      ? SAGE_BG
      : dominant === "négatif"
        ? RED_BG
        : dominant === "neutre"
          ? GRAY_NEUTRAL_BG
          : "#FAFAFA";
  const bannerBorder =
    dominant === "positif"
      ? SAGE_BORDER
      : dominant === "négatif"
        ? RED_BORDER
        : dominant === "neutre"
          ? GRAY_NEUTRAL_BORDER
          : BORDER;

  return (
    <div
      style={{
        padding: "14px 18px",
        background: bannerBg,
        borderRadius: 10,
        border: `1px solid ${bannerBorder}`,
      }}
    >
      {/* Ligne d'en-tête du bandeau */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 18,
          flexWrap: "wrap", marginBottom: detail && detail.articles.length > 0 ? 14 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
          <Calendar size={20} style={{ color: c }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: CHARCOAL }}>
              {fmtDateFr(date)}
            </div>
            <div
              style={{
                fontSize: 10, fontFamily: "'Space Mono', monospace",
                color: TEXT_MUTED, marginTop: 2,
              }}
            >
              {count} article{count > 1 ? "s" : ""} ce jour
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: TEXT_MUTED }}>
            <Loader2 size={14} className="animate-spin" />
            <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
              Chargement...
            </span>
          </div>
        ) : (
          <>
            <DetailStat
              label="Sentiment"
              value={fmtScore(score)}
              color={c}
              icon={<TrendIcon value={score} size={12} style={{ color: c }} />}
            />
            <div
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                gap: 2, minWidth: 70,
              }}
            >
              <span
                style={{
                  fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                  textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
                }}
              >
                Catégorie
              </span>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 600, color: c,
                }}
              >
                <span
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: c, display: "inline-block",
                  }}
                />
                {label}
              </span>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          aria-label="Fermer le détail jour"
          style={{
            width: 28, height: 28, display: "flex", alignItems: "center",
            justifyContent: "center", background: "transparent",
            border: `1px solid ${BORDER}`, borderRadius: 6, cursor: "pointer",
            color: TEXT_MUTED,
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Top 3 articles */}
      {!loading && detail && detail.articles.length > 0 && (
        <div
          style={{
            display: "flex", flexDirection: "column", gap: 8,
            paddingTop: 12, borderTop: `1px solid ${bannerBorder}`,
          }}
        >
          <div
            style={{
              fontSize: 10, fontFamily: "'Space Mono', monospace",
              color: TEXT_MUTED, textTransform: "uppercase",
              letterSpacing: "0.1em", fontWeight: 700,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Newspaper size={11} /> Top {detail.articles.length} articles
          </div>
          {detail.articles.map((a) => {
            const dot = heatColor(
              labelToDominantLocal(a.sentimentLabel) ??
                (a.sentimentScore == null
                  ? null
                  : a.sentimentScore >= 0.2
                    ? "positif"
                    : a.sentimentScore < -0.1
                      ? "négatif"
                      : "neutre"),
            );
            return (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "8px 10px", background: WHITE,
                  borderRadius: 6, border: `1px solid ${BORDER}`,
                  textDecoration: "none", color: CHARCOAL,
                  cursor: "pointer",
                  transition: "border 150ms ease",
                }}
              >
                <span
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: dot, flexShrink: 0, marginTop: 5,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12, fontWeight: 600, color: CHARCOAL,
                      overflow: "hidden", textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      lineHeight: 1.35,
                    }}
                  >
                    {a.title}
                  </div>
                  <div
                    style={{
                      marginTop: 4, display: "flex",
                      alignItems: "center", gap: 8, flexWrap: "wrap",
                      fontSize: 10, fontFamily: "'Space Mono', monospace",
                      color: TEXT_MUTED,
                    }}
                  >
                    <span>{a.source}</span>
                    {a.sentimentLabel && (
                      <span style={{ color: dot }}>
                        {a.sentimentLabel}
                        {a.sentimentScore != null ? ` (${fmtScore(a.sentimentScore)})` : ""}
                      </span>
                    )}
                  </div>
                </div>
                <ExternalLink size={12} style={{ color: TEXT_MUTED, flexShrink: 0, marginTop: 4 }} />
              </a>
            );
          })}
        </div>
      )}

      {!loading && detail && detail.articles.length === 0 && (
        <div
          style={{
            paddingTop: 12, borderTop: `1px solid ${bannerBorder}`,
            fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace",
          }}
        >
          Aucun article détaillé disponible pour ce jour.
        </div>
      )}
    </div>
  );
}

// Helper local pour normaliser un sentimentLabel (FR/EN) en
// DominantSentiment — miroir de labelToDominant côté serveur.
function labelToDominantLocal(label: string | null): DominantSentiment | null {
  if (!label) return null;
  const l = label.toLowerCase().trim();
  if (l === "positif" || l === "positive" || l === "pos") return "positif";
  if (l === "neutre" || l === "neutral" || l === "neu") return "neutre";
  if (l === "négatif" || l === "negatif" || l === "negative" || l === "neg") return "négatif";
  return null;
}

function DetailStat({
  label, value, color, icon,
}: {
  label: string;
  value: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, minWidth: 70 }}>
      <span
        style={{
          fontSize: 9, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 16, fontWeight: 700, color, lineHeight: 1,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {icon}
        {value}
      </span>
    </div>
  );
}

// ─── Légende ─────────────────────────────────────────────────
function LegendItem({
  color, label, hint,
}: {
  color: string;
  label: string;
  hint: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 12, height: 12, borderRadius: "50%",
          background: color, flexShrink: 0,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL }}>{label}</span>
        <span
          style={{
            fontSize: 10, color: TEXT_MUTED,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {hint}
        </span>
      </div>
    </div>
  );
}

// ─── Échelle d'intensité (5 pastilles de gradient) ───────────
//  Montre comment le volume d'articles module l'opacité de la
//  couleur de sentiment. De gauche (clair, 1 article) à droite
//  (saturé, pic = maxCount).
function IntensityScale({ maxCount }: { maxCount: number }) {
  const baseRgb = "74,123,95"; // sage — on montre l'échelle sur la teinte positive
  const steps = [0.20, 0.40, 0.60, 0.80, 1.0];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        {steps.map((a) => (
          <span
            key={a}
            style={{
              width: 12, height: 12, borderRadius: 2,
              background: `rgba(${baseRgb},${a})`,
              display: "inline-block",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL }}>Intensité</span>
        <span
          style={{
            fontSize: 10, color: TEXT_MUTED,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          1 → {maxCount || "max"} articles
        </span>
      </div>
    </div>
  );
}

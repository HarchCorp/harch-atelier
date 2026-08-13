"use client";

// ═══════════════════════════════════════════════════════════════
//  GeoHeatmapGenerator
//
//  Skill 25 — Carte de Chaleur Géographique.
//  Montre d'où viennent les mentions :
//    • Vue Maroc — grille CSS de cartes villes (couleur de chaleur).
//    • Vue International — 8 cartes marchés francophones
//      (MA, FR, BE, CH, CA, TN, SN, CI).
//
//  Même motif de popup que BriefingGenerator / EsgScorecardGenerator :
//    • overlay fixe avec backdrop blur
//    • entrée en scale (framer-motion)
//    • sections révélées une à une (AnimatePresence)
//    • barre d'actions : Export PDF (window.print) · Régénérer
//    • CSS print isolant #geo-heatmap-document
//
//  Palette : Blanc / Sage / Charcoal — outil stratégique, pas crise.
//  Typographie : Space Mono (labels techniques, codes ISO, lat/lng),
//                Inter (corps).
//  Icônes : Lucide uniquement. Aucun emoji.
//
//  Structure du corps :
//    a. En-tête — date + entreprise + secteur + fenêtre 30j
//    b. Bande synthèse — Mentions totales / Marchés actifs /
//       Villes actives / Crises détectées
//    c. Toggle segmenté Maroc / International
//    d. [si ville sélectionnée] Bannière détail ville
//    e. Contenu principal :
//         - Vue Maroc → grille cartes villes (couleur de chaleur)
//         - Vue International → grille 8 cartes marchés (code ISO,
//           mentions, dot sentiment, drapeau crise)
//    f. Légende — sage = positif, gris = neutre, rouge = négatif
//    g. Actions — Export PDF · Régénérer
//
//  Skill ID : SKILL-25-GEO-HEATMAP
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  MapPin, Globe, TrendingUp, TrendingDown, Minus,
  Calendar, Layers,
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

// ─── Types — miroir de GeoHeatmapResponse (route.ts) ──────────

interface GeoCity {
  name: string;
  lat: number;
  lng: number;
  mentionCount: number;
  avgSentiment: number | null; // -1..+1
}

interface GeoMarket {
  code: string;          // ISO-2 : MA, FR, BE, CH, CA, TN, SN, CI
  name: string;
  mentions: number;
  sentiment: number | null;
  crisisFlag: boolean;
}

interface GeoHeatmapMeta {
  companyName: string;
  sector: string;
  generatedAt: string;
  windowDays: number;
  source: "real" | "demo";
}

interface GeoHeatmapData {
  cities: GeoCity[];
  markets: GeoMarket[];
  meta: GeoHeatmapMeta;
}

// ─── Helpers chaleur ─────────────────────────────────────────
//  Classification sentiment → 3 paliers, alignés sur la légende :
//    avgSentiment >= +0.20  →  "positive"  (sage)
//    avgSentiment >= -0.10  →  "neutral"   (gris)
//    avgSentiment <  -0.10  →  "negative"  (rouge)
//    null / undefined       →  "neutral"
type HeatClass = "positive" | "neutral" | "negative";

function heatClass(s: number | null): HeatClass {
  if (s == null) return "neutral";
  if (s >= 0.2) return "positive";
  if (s >= -0.1) return "neutral";
  return "negative";
}

function heatColor(s: number | null): string {
  const c = heatClass(s);
  if (c === "positive") return SAGE;
  if (c === "negative") return RED;
  return GRAY_NEUTRAL;
}

function heatBg(s: number | null): string {
  const c = heatClass(s);
  if (c === "positive") return SAGE_BG;
  if (c === "negative") return RED_BG;
  return GRAY_NEUTRAL_BG;
}

function heatBorder(s: number | null): string {
  const c = heatClass(s);
  if (c === "positive") return SAGE_BORDER;
  if (c === "negative") return RED_BORDER;
  return GRAY_NEUTRAL_BORDER;
}

function heatLabel(s: number | null): string {
  const c = heatClass(s);
  if (c === "positive") return "Positif";
  if (c === "negative") return "Négatif";
  return "Neutre";
}

// ─── Icône de tendance (↑ / ↓ / —) ───────────────────────────
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

// ─── Formatage lat/lng (Space Mono) ──────────────────────────
function fmtCoord(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(4)}°`;
}

// ─── Cadence de révélation des sections (motif BriefingGenerator)
const SECTIONS = [
  { id: "header",        delay: 200 },
  { id: "summary",       delay: 400 },
  { id: "toggle",        delay: 550 },
  { id: "city-detail",   delay: 700 },
  { id: "grid",          delay: 850 },
  { id: "legend",        delay: 1050 },
  { id: "actions",       delay: 1250 },
];

type ViewMode = "maroc" | "international";

// ═══════════════════════════════════════════════════════════════
//  Composant principal
// ═══════════════════════════════════════════════════════════════

export function GeoHeatmapGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GeoHeatmapData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);
  // Vue courante : Maroc (grille villes) par défaut.
  const [view, setView] = useState<ViewMode>("maroc");
  // Ville sélectionnée pour le détail (null = aucune sélection).
  const [selectedCity, setSelectedCity] = useState<GeoCity | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setSelectedCity(null);
    setVisibleSections(new Set());
    setGenerating(true);
    try {
      const res = await fetch("/api/console/geo-heatmap", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as GeoHeatmapData;
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

  // ─── Calculs dérivés pour la bande synthèse ──────────────
  const totalMentions = data
    ? data.markets.reduce((s, m) => s + m.mentions, 0)
    : 0;
  const activeMarkets = data
    ? data.markets.filter((m) => m.mentions > 0).length
    : 0;
  const activeCities = data
    ? data.cities.filter((c) => c.mentionCount > 0).length
    : 0;
  const crisisCount = data
    ? data.markets.filter((m) => m.crisisFlag).length
    : 0;

  // ─── Quand on change de vue, on désélectionne la ville ───
  function handleViewChange(v: ViewMode) {
    setView(v);
    setSelectedCity(null);
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
          width: "100%", maxWidth: 1000, maxHeight: "92vh",
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
            <MapPin size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14, fontWeight: 700, color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Carte de Chaleur Géo
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
                Géolocalisation des mentions (articles 30 jours, 8 marchés francophones)...
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
            <div id="geo-heatmap-document">
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
                        Veille géographique · Fenêtre {data.meta.windowDays}j
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
                      Secteur : {data.meta.sector} · {data.cities.length} villes marocaines ·
                      {" "}8 marchés francophones · Source : {data.meta.source === "demo" ? "démo" : "réelle"}
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
                      label="Mentions totales"
                      value={String(totalMentions)}
                      color={CHARCOAL}
                    />
                    <SummaryStat
                      label="Marchés actifs"
                      value={`${activeMarkets} / 8`}
                      color={SAGE}
                    />
                    <SummaryStat
                      label="Villes actives"
                      value={String(activeCities)}
                      color={TEXT_BODY}
                    />
                    <SummaryStat
                      label="Crises détectées"
                      value={String(crisisCount)}
                      color={crisisCount > 0 ? RED : TEXT_MUTED}
                      pulse={crisisCount > 0}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── C. Toggle Maroc / International ─── */}
              <AnimatePresence>
                {visibleSections.has("toggle") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 20 }}
                  >
                    <div
                      role="tablist"
                      aria-label="Sélection de la vue géographique"
                      style={{
                        display: "inline-flex", padding: 4,
                        background: "#FAFAFA", border: `1px solid ${BORDER}`,
                        borderRadius: 8, gap: 4,
                      }}
                    >
                      <ToggleButton
                        active={view === "maroc"}
                        onClick={() => handleViewChange("maroc")}
                        icon={<MapPin size={14} />}
                        label="Maroc"
                      />
                      <ToggleButton
                        active={view === "international"}
                        onClick={() => handleViewChange("international")}
                        icon={<Globe size={14} />}
                        label="International"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── D. Bannière détail ville (si sélectionnée) ─── */}
              <AnimatePresence>
                {visibleSections.has("city-detail") && selectedCity && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    style={{ marginBottom: 20, overflow: "hidden" }}
                  >
                    <CityDetailBanner
                      city={selectedCity}
                      onClose={() => setSelectedCity(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── E. Contenu principal (grille) ─── */}
              <AnimatePresence>
                {visibleSections.has("grid") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    {view === "maroc" ? (
                      <MoroccoGrid
                        cities={data.cities}
                        selectedCity={selectedCity}
                        onSelect={setSelectedCity}
                      />
                    ) : (
                      <InternationalGrid markets={data.markets} />
                    )}
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
                        Légende — couleur de chaleur
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12,
                      }}
                    >
                      <LegendItem color={SAGE} label="Positif" hint="sentiment ≥ +0.20" />
                      <LegendItem color={GRAY_NEUTRAL} label="Neutre" hint="-0.10 ≤ sentiment < +0.20" />
                      <LegendItem color={RED} label="Négatif" hint="sentiment < -0.10" />
                    </div>
                    <div
                      style={{
                        marginTop: 10, paddingTop: 10,
                        borderTop: `1px solid ${BORDER}`,
                        fontSize: 11, color: TEXT_MUTED, lineHeight: 1.5,
                      }}
                    >
                      Crise marché : ≥ 3 mentions et sentiment ≤ -0.30 sur la fenêtre {data.meta.windowDays}j.
                      Coordonnées WGS-84 (centre-ville). Sources : Article.source géocodé via le geo-mapper HarchIQ.
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
                    Géocodage en cours...
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
          #geo-heatmap-document, #geo-heatmap-document * { visibility: visible; }
          #geo-heatmap-document {
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
            animation: pulse ? "pulse 1s infinite" : "none",
          }}
        >
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

// ─── Bannière détail ville ────────────────────────────────────
function CityDetailBanner({
  city, onClose,
}: {
  city: GeoCity;
  onClose: () => void;
}) {
  const c = heatColor(city.avgSentiment);
  const label = heatLabel(city.avgSentiment);

  return (
    <div
      style={{
        padding: "14px 18px",
        background: heatBg(city.avgSentiment),
        borderRadius: 10,
        border: `1px solid ${heatBorder(city.avgSentiment)}`,
        display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 180 }}>
        <MapPin size={20} style={{ color: c }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: CHARCOAL }}>
            {city.name}
          </div>
          <div
            style={{
              fontSize: 10, fontFamily: "'Space Mono', monospace",
              color: TEXT_MUTED, marginTop: 2,
            }}
          >
            {fmtCoord(city.lat)} · {fmtCoord(city.lng)}
          </div>
        </div>
      </div>

      <DetailStat
        label="Mentions"
        value={String(city.mentionCount)}
        color={CHARCOAL}
      />
      <DetailStat
        label="Sentiment"
        value={city.avgSentiment == null ? "—" : city.avgSentiment.toFixed(2)}
        color={c}
        icon={<TrendIcon value={city.avgSentiment} size={12} style={{ color: c }} />}
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

      <button
        onClick={onClose}
        aria-label="Fermer le détail ville"
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
  );
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

// ─── Grille Maroc — cartes villes ────────────────────────────
//  CSS grid responsive : auto-fit minmax(160px, 1fr). Chaque carte
//  a une couleur de fond/bordure basée sur le sentiment moyen.
//  Cliquable → ouvre la bannière détail.
function MoroccoGrid({
  cities, selectedCity, onSelect,
}: {
  cities: GeoCity[];
  selectedCity: GeoCity | null;
  onSelect: (c: GeoCity) => void;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
          marginBottom: 10,
        }}
      >
        Villes marocaines — {cities.length} localités
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 10,
        }}
      >
        {cities.map((city) => {
          const isSelected =
            selectedCity?.name === city.name &&
            selectedCity?.lat === city.lat;
          const bg = heatBg(city.avgSentiment);
          const border = isSelected ? CHARCOAL : heatBorder(city.avgSentiment);
          const dot = heatColor(city.avgSentiment);
          return (
            <button
              key={`${city.name}-${city.lat}`}
              onClick={() => onSelect(city)}
              style={{
                textAlign: "left", padding: "12px 14px",
                background: bg, border: `1px solid ${border}`,
                borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
                transition: "border 150ms ease, transform 150ms ease",
                transform: isSelected ? "scale(1.02)" : "scale(1)",
                boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL }}>
                  {city.name}
                </span>
                <span
                  style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: dot, flexShrink: 0,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 10, fontFamily: "'Space Mono', monospace",
                  color: TEXT_MUTED, marginBottom: 8,
                }}
              >
                {fmtCoord(city.lat)} · {fmtCoord(city.lng)}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  style={{
                    fontSize: 20, fontWeight: 700, color: CHARCOAL, lineHeight: 1,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {city.mentionCount}
                </span>
                <span style={{ fontSize: 10, color: TEXT_MUTED }}>mentions</span>
              </div>
              <div
                style={{
                  marginTop: 4, fontSize: 10,
                  fontFamily: "'Space Mono', monospace",
                  color: dot,
                }}
              >
                {city.avgSentiment == null
                  ? "sentiment —"
                  : `sentiment ${city.avgSentiment >= 0 ? "+" : ""}${city.avgSentiment.toFixed(2)}`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Grille International — 8 cartes marchés ─────────────────
function InternationalGrid({ markets }: { markets: GeoMarket[] }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
          marginBottom: 10,
        }}
      >
        Marchés francophones — 8 pays
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
        }}
      >
        {markets.map((m) => (
          <MarketCard key={m.code} market={m} />
        ))}
      </div>
    </div>
  );
}

function MarketCard({ market }: { market: GeoMarket }) {
  const dot = heatColor(market.sentiment);
  const bg = heatBg(market.sentiment);
  const border = market.crisisFlag
    ? RED_BORDER
    : heatBorder(market.sentiment);
  const cardBg = market.crisisFlag ? RED_BG : bg;

  return (
    <div
      style={{
        padding: "14px 12px",
        background: cardBg, border: `1px solid ${border}`,
        borderRadius: 8, position: "relative",
      }}
    >
      {/* Drapeau crise (coin haut-droit) */}
      {market.crisisFlag && (
        <div
          style={{
            position: "absolute", top: 8, right: 8,
            display: "flex", alignItems: "center", gap: 3,
            padding: "2px 6px",
            background: RED, borderRadius: 4,
            fontSize: 8, fontWeight: 700, color: WHITE,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}
          title="Crise détectée — couverture négative soutenue"
        >
          <AlertTriangle size={9} />
          Crise
        </div>
      )}

      {/* Code ISO-2 en placeholder de drapeau */}
      <div
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 36, height: 26, marginBottom: 10,
          background: WHITE, border: `1px solid ${BORDER}`,
          borderRadius: 4,
          fontSize: 12, fontWeight: 700, color: CHARCOAL,
          fontFamily: "'Space Mono', monospace",
          letterSpacing: "0.08em",
        }}
        aria-label={`Code pays ${market.code}`}
      >
        {market.code}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, marginBottom: 8 }}>
        {market.name}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
        <span
          style={{
            fontSize: 22, fontWeight: 700, color: CHARCOAL, lineHeight: 1,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {market.mentions}
        </span>
        <span style={{ fontSize: 10, color: TEXT_MUTED }}>mentions</span>
      </div>

      <div
        style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 11, color: dot,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        <span
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: dot, flexShrink: 0,
          }}
        />
        <TrendIcon value={market.sentiment} size={11} style={{ color: dot }} />
        <span>
          {market.sentiment == null
            ? "—"
            : `${market.sentiment >= 0 ? "+" : ""}${market.sentiment.toFixed(2)}`}
        </span>
      </div>
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



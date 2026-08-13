"use client";

// ═══════════════════════════════════════════════════════════════
//  ComexReportGenerator — Skill 5: Weekly COMEX Report
//
//  Board-ready 4-page PDF popup. Same pattern as BriefingGenerator
//  but expanded into 4 A4-style pages, framer-motion reveal with
//  350ms stagger (slower = more dramatic), and a print stylesheet
//  that maps each section to a real A4 page.
//
//  Design system (non-negotiable):
//    • White #FFFFFF bg, sage #4A7B5F accents, charcoal #0A0A0A text
//    • Space Mono headers, Inter body, Lucide icons, NO emojis, French
//    • Each "page" separated by a thin sage divider
//    • "Page X / 4" indicator + Export PDF (window.print)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  TrendingUp, TrendingDown, Minus,
  FileText, Calendar, BarChart3, Trophy, ListChecks,
  ArrowRight, Clock, Sparkles, Target, ShieldAlert,
} from "lucide-react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.20)";
const CHARCOAL = "#0A0A0A";
const WHITE = "#FFFFFF";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";
const AMBER = "#F59E0B";
const SPACE_MONO = "'Space Mono', ui-monospace, monospace";
const INTER = "'Inter', system-ui, -apple-system, sans-serif";

// Competitor donut palette — anchored on sage, rotates through
// muted earth tones so it stays on-brand.
const DONUT_PALETTE = [
  SAGE,
  "#1e3a5f",
  "#8b6914",
  "#a0524b",
  "#78716c",
];

// ─── TYPES ───────────────────────────────────────────────────────
type Priority = "P0" | "P1" | "P2" | "P3";
type Momentum = "rising" | "falling" | "stable";

interface ComexData {
  meta: {
    companyName: string;
    sector: string | null;
    generatedAt: string;
    weekLabel: string;
    plan: string;
  };
  executiveSummary: {
    score: number;
    scoreTrend: number;
    sentimentIndex: number;
    totalMentions: number;
    mentions30d: number;
    summary: string;
  };
  tendance: {
    sparkline: Array<{ date: string; value: number }>;
    delta: number;
    narratives: Array<{
      label: string;
      momentum: Momentum;
      sentiment: number;
      volume: number;
    }>;
  };
  competitorAnalysis: {
    competitors: Array<{
      name: string;
      shareOfVoice: number;
      mentions: number;
      sentiment: number;
      isYou: boolean;
    }>;
    totalMentions: number;
    yourRank: number;
    yourShare: number;
  };
  recommendations: Array<{
    priority: Priority;
    title: string;
    description: string;
    deadlineDays: number;
  }>;
}

// ─── PAGE REVEAL SEQUENCE ────────────────────────────────────────
// 350ms stagger (slower than BriefingGenerator's 200ms = more
// dramatic, board-room reveal cadence).
const PAGES = [
  { id: "executive", delay: 250 },
  { id: "tendance", delay: 600 },
  { id: "concurrents", delay: 950 },
  { id: "recommandations", delay: 1300 },
] as const;

const PAGE_META: Record<string, { number: number; title: string; subtitle: string; Icon: typeof FileText }> = {
  executive: { number: 1, title: "Synthèse Exécutive", subtitle: "Vue d'ensemble & KPIs", Icon: FileText },
  tendance: { number: 2, title: "Tendance 30 Jours", subtitle: "Évolution du sentiment & narratifs", Icon: BarChart3 },
  concurrents: { number: 3, title: "Analyse Concurrentielle", subtitle: "Part de voix & positionnement", Icon: Trophy },
  recommandations: { number: 4, title: "Recommandations", subtitle: "Plan d'action prioritisé", Icon: ListChecks },
};

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function ComexReportGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ComexData | null>(null);
  const [visiblePages, setVisiblePages] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisiblePages(new Set());
    setGenerating(true);
    try {
      const res = await fetch("/api/console/comex-report", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const report: ComexData = await res.json();
      setData(report);
      setLoading(false);
      for (const page of PAGES) {
        setTimeout(() => {
          setVisiblePages((prev) => new Set(prev).add(page.id));
          if (page.id === "recommandations") setGenerating(false);
        }, page.delay);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la génération");
      setLoading(false);
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    void generate();
  }, [generate]);

  const currentPageNum = Math.max(0, ...PAGES.filter((p) => visiblePages.has(p.id)).map((p) => PAGE_META[p.id].number));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(10,10,10,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: 860,
          maxHeight: "92vh",
          background: WHITE,
          borderRadius: 14,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 24px 72px rgba(0,0,0,0.20)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── HEADER BAR ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 22px",
            borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: SAGE_BG,
                border: `1px solid ${SAGE_BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={16} style={{ color: SAGE }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, fontFamily: INTER }}>
                Rapport COMEX Hebdomadaire
              </span>
              <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: SPACE_MONO }}>
                {data?.meta.weekLabel ?? "—"}
              </span>
            </div>
            {generating && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  color: SAGE,
                  fontFamily: SPACE_MONO,
                  marginLeft: 8,
                  padding: "3px 8px",
                  background: SAGE_BG,
                  borderRadius: 4,
                }}
              >
                <Loader2 size={11} className="animate-spin" />
                Génération
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Page indicator */}
            <span
              style={{
                fontSize: 11,
                fontFamily: SPACE_MONO,
                color: data ? CHARCOAL : TEXT_MUTED,
                padding: "4px 10px",
                background: data ? SAGE_BG : "#F5F5F5",
                borderRadius: 4,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              Page {data ? currentPageNum : 0} / 4
            </span>
            <button
              onClick={() => window.print()}
              disabled={generating || !data}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: generating || !data ? BORDER : CHARCOAL,
                color: generating || !data ? TEXT_MUTED : WHITE,
                border: "none",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                cursor: generating || !data ? "not-allowed" : "pointer",
                fontFamily: INTER,
              }}
            >
              <Download size={13} />
              Exporter PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: TEXT_MUTED,
              }}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── DOCUMENT BODY ─── */}
        <div
          id="comex-document"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "36px 44px",
            fontFamily: INTER,
            color: CHARCOAL,
            background: WHITE,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Loader2
                size={36}
                style={{ color: SAGE, animation: "comex-spin 1s linear infinite" }}
              />
              <p style={{ marginTop: 18, fontSize: 14, color: TEXT_MUTED }}>
                Collecte des données hebdomadaires en cours...
              </p>
              <p style={{ marginTop: 4, fontSize: 11, color: TEXT_MUTED, fontFamily: SPACE_MONO }}>
                Brand Health · Sentiment 30j · Topics · Sources · Crisis · SOV
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <AlertTriangle size={32} style={{ color: NEGATIVE }} />
              <p style={{ marginTop: 12, fontSize: 14, color: NEGATIVE, fontWeight: 600 }}>
                {error}
              </p>
              <button
                onClick={generate}
                style={{
                  marginTop: 18,
                  padding: "9px 18px",
                  background: CHARCOAL,
                  color: WHITE,
                  border: "none",
                  borderRadius: 7,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: INTER,
                  fontWeight: 600,
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {data && (
            <>
              {/* ─── PAGE 1: EXECUTIVE SUMMARY ─── */}
              <AnimatePresence>
                {visiblePages.has("executive") && (
                  <motion.section
                    key="executive"
                    className="comex-page"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    <PageHeader pageKey="executive" weekLabel={data.meta.weekLabel} companyName={data.meta.companyName} />
                    <h1
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        margin: "16px 0 6px",
                        color: CHARCOAL,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.15,
                      }}
                    >
                      Rapport de Réputation — {data.meta.companyName}
                    </h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, margin: "0 0 28px" }}>
                      Synthèse hebdomadaire pour le COMEX · {data.executiveSummary.mentions30d.toLocaleString("fr-FR")} mentions sur 30 jours ·{" "}
                      {data.executiveSummary.totalMentions.toLocaleString("fr-FR")} au total
                    </p>

                    {/* KPI cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
                      <KpiCard
                        label="Score Réputation"
                        value={data.executiveSummary.score.toString()}
                        unit="/ 100"
                        trend={data.executiveSummary.scoreTrend}
                        accent={SAGE}
                      />
                      <KpiCard
                        label="Indice Sentiment"
                        value={(data.executiveSummary.sentimentIndex >= 0 ? "+" : "") + data.executiveSummary.sentimentIndex.toString()}
                        unit="-100 → +100"
                        sentimentIndex={data.executiveSummary.sentimentIndex}
                        accent={SAGE}
                      />
                      <KpiCard
                        label="Mentions 30j"
                        value={data.executiveSummary.mentions30d.toLocaleString("fr-FR")}
                        unit={`${data.executiveSummary.totalMentions.toLocaleString("fr-FR")} total`}
                        accent={SAGE}
                      />
                    </div>

                    {/* Summary paragraph */}
                    <div
                      style={{
                        padding: "18px 20px",
                        background: "#FAFAFA",
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: SPACE_MONO,
                          color: SAGE,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          marginBottom: 10,
                          fontWeight: 700,
                        }}
                      >
                        Synthèse Dircom
                      </div>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: CHARCOAL, margin: 0 }}>
                        {data.executiveSummary.summary}
                      </p>
                    </div>

                    <PageFooter pageNum={1} />
                  </motion.section>
                )}
              </AnimatePresence>

              <PageDivider visible={visiblePages.has("executive") && visiblePages.has("tendance")} />

              {/* ─── PAGE 2: TENDANCE 30 JOURS ─── */}
              <AnimatePresence>
                {visiblePages.has("tendance") && (
                  <motion.section
                    key="tendance"
                    className="comex-page"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    <PageHeader pageKey="tendance" weekLabel={data.meta.weekLabel} companyName={data.meta.companyName} />

                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "16px 0 22px" }}>
                      <div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: CHARCOAL, letterSpacing: "-0.01em" }}>
                          Évolution du sentiment
                        </h2>
                        <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>
                          Moyenne quotidienne · score agrégé -1 → +1
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {data.tendance.delta > 0 ? (
                          <TrendingUp size={14} style={{ color: POSITIVE }} />
                        ) : data.tendance.delta < 0 ? (
                          <TrendingDown size={14} style={{ color: NEGATIVE }} />
                        ) : (
                          <Minus size={14} style={{ color: TEXT_MUTED }} />
                        )}
                        <span
                          style={{
                            fontSize: 13,
                            fontFamily: SPACE_MONO,
                            fontWeight: 700,
                            color:
                              data.tendance.delta > 0 ? POSITIVE : data.tendance.delta < 0 ? NEGATIVE : TEXT_MUTED,
                          }}
                        >
                          {data.tendance.delta > 0 ? "+" : ""}
                          {data.tendance.delta.toFixed(2)}
                        </span>
                        <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: SPACE_MONO }}>delta 30j</span>
                      </div>
                    </div>

                    {/* Sparkline chart */}
                    <div
                      style={{
                        padding: "20px 20px 12px",
                        background: "#FAFAFA",
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                        marginBottom: 28,
                      }}
                    >
                      <Sparkline values={data.tendance.sparkline.map((p) => p.value)} />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 8,
                          fontSize: 10,
                          fontFamily: SPACE_MONO,
                          color: TEXT_MUTED,
                        }}
                      >
                        <span>J-30</span>
                        <span>J-20</span>
                        <span>J-10</span>
                        <span>Aujourd'hui</span>
                      </div>
                    </div>

                    {/* Top narratives */}
                    <div style={{ fontSize: 10, fontFamily: SPACE_MONO, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10, fontWeight: 700 }}>
                      Narratifs dominants (7j)
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {data.tendance.narratives.map((n, i) => (
                        <NarrativeRow key={i} index={i + 1} narrative={n} />
                      ))}
                      {data.tendance.narratives.length === 0 && (
                        <div style={{ padding: "16px", background: "#FAFAFA", borderRadius: 6, fontSize: 13, color: TEXT_MUTED }}>
                          Collecte de narratifs en cours. Disponible sous 24-48h.
                        </div>
                      )}
                    </div>

                    <PageFooter pageNum={2} />
                  </motion.section>
                )}
              </AnimatePresence>

              <PageDivider visible={visiblePages.has("tendance") && visiblePages.has("concurrents")} />

              {/* ─── PAGE 3: ANALYSE CONCURRENTIELLE ─── */}
              <AnimatePresence>
                {visiblePages.has("concurrents") && (
                  <motion.section
                    key="concurrents"
                    className="comex-page"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    <PageHeader pageKey="concurrents" weekLabel={data.meta.weekLabel} companyName={data.meta.companyName} />

                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "16px 0 22px" }}>
                      <div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: CHARCOAL, letterSpacing: "-0.01em" }}>
                          Part de voix — secteur
                        </h2>
                        <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>
                          {data.competitorAnalysis.competitors.length} acteurs analysés · {data.competitorAnalysis.totalMentions.toLocaleString("fr-FR")} mentions sectorielles
                        </p>
                      </div>
                      <div
                        style={{
                          padding: "6px 12px",
                          background: SAGE_BG,
                          borderRadius: 6,
                          border: `1px solid ${SAGE_BORDER}`,
                          textAlign: "right",
                        }}
                      >
                        <div style={{ fontSize: 10, fontFamily: SPACE_MONO, color: SAGE, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                          Votre rang
                        </div>
                        <div style={{ fontSize: 18, fontFamily: SPACE_MONO, fontWeight: 700, color: SAGE, lineHeight: 1.2 }}>
                          #{data.competitorAnalysis.yourRank || "—"}
                          <span style={{ fontSize: 11, color: TEXT_MUTED }}> / {data.competitorAnalysis.competitors.length}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
                      {/* Competitor bars */}
                      <div>
                        <div style={{ fontSize: 10, fontFamily: SPACE_MONO, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, fontWeight: 700 }}>
                          Mentions par acteur (30j)
                        </div>
                        <CompetitorBars competitors={data.competitorAnalysis.competitors} />
                      </div>

                      {/* SOV donut */}
                      <div>
                        <div style={{ fontSize: 10, fontFamily: SPACE_MONO, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, fontWeight: 700 }}>
                          Part de voix
                        </div>
                        <DonutChart competitors={data.competitorAnalysis.competitors} yourShare={data.competitorAnalysis.yourShare} />
                      </div>
                    </div>

                    <PageFooter pageNum={3} />
                  </motion.section>
                )}
              </AnimatePresence>

              <PageDivider visible={visiblePages.has("concurrents") && visiblePages.has("recommandations")} />

              {/* ─── PAGE 4: RECOMMANDATIONS ─── */}
              <AnimatePresence>
                {visiblePages.has("recommandations") && (
                  <motion.section
                    key="recommandations"
                    className="comex-page"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    <PageHeader pageKey="recommandations" weekLabel={data.meta.weekLabel} companyName={data.meta.companyName} />

                    <div style={{ margin: "16px 0 22px" }}>
                      <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: CHARCOAL, letterSpacing: "-0.01em" }}>
                        Plan d'action prioritisé
                      </h2>
                      <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>
                        {data.recommendations.length} recommandations · classées par priorité P0 → P3 · échéances court terme
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {data.recommendations.map((rec, i) => (
                        <RecommendationCard key={i} index={i + 1} recommendation={rec} />
                      ))}
                      {data.recommendations.length === 0 && (
                        <div style={{ padding: "20px", background: SAGE_BG, borderRadius: 8, fontSize: 14, color: SAGE }}>
                          Aucune action prioritaire requise. Maintenir la veille continue.
                        </div>
                      )}
                    </div>

                    {/* Footer actions */}
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        paddingTop: 24,
                        marginTop: 24,
                        borderTop: `1px solid ${BORDER}`,
                      }}
                    >
                      <button
                        onClick={() => window.print()}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "11px 22px",
                          background: CHARCOAL,
                          color: WHITE,
                          border: "none",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: INTER,
                        }}
                      >
                        <Download size={14} />
                        Exporter le rapport PDF
                      </button>
                      <button
                        onClick={generate}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "11px 18px",
                          background: "transparent",
                          color: TEXT_BODY,
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: INTER,
                        }}
                      >
                        <RefreshCw size={14} />
                        Régénérer
                      </button>
                    </div>

                    <PageFooter pageNum={4} />
                  </motion.section>
                )}
              </AnimatePresence>

              {generating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: SAGE,
                      animation: "comex-pulse 1.2s infinite",
                    }}
                  />
                  <span style={{ fontSize: 11, color: SAGE, fontFamily: SPACE_MONO }}>
                    Rédaction des sections suivantes...
                  </span>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>

      <style>{PRINT_CSS}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════

function PageHeader({
  pageKey,
  weekLabel,
  companyName,
}: {
  pageKey: string;
  weekLabel: string;
  companyName: string;
}) {
  const meta = PAGE_META[pageKey];
  const { Icon } = meta;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 14,
        borderBottom: `2px solid ${SAGE}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: SAGE,
            color: WHITE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: SPACE_MONO,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {meta.number}
        </div>
        <Icon size={16} style={{ color: SAGE }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, fontFamily: INTER }}>
            {meta.title}
          </span>
          <span style={{ fontSize: 10, color: TEXT_MUTED, fontFamily: SPACE_MONO }}>
            {meta.subtitle}
          </span>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 10, fontFamily: SPACE_MONO, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {companyName}
        </div>
        <div style={{ fontSize: 10, fontFamily: SPACE_MONO, color: SAGE }}>{weekLabel}</div>
      </div>
    </div>
  );
}

function PageDivider({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="comex-page-divider"
      style={{
        margin: "20px -44px",
        height: 1,
        background: `linear-gradient(to right, transparent, ${SAGE}40, transparent)`,
      }}
    />
  );
}

function PageFooter({ pageNum }: { pageNum: number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 32,
        paddingTop: 12,
        borderTop: `1px solid ${BORDER}`,
        fontSize: 10,
        fontFamily: SPACE_MONO,
        color: TEXT_MUTED,
      }}
    >
      <span>HarchIQ · Rapport COMEX · Document confidentiel</span>
      <span>
        Page {pageNum} / 4
      </span>
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  trend,
  sentimentIndex,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  trend?: number;
  sentimentIndex?: number;
  accent: string;
}) {
  const isSentiment = typeof sentimentIndex === "number";
  const sentimentColor =
    sentimentIndex !== undefined
      ? sentimentIndex > 5
        ? POSITIVE
        : sentimentIndex < -5
          ? NEGATIVE
          : AMBER
      : accent;

  return (
    <div
      style={{
        padding: "16px 18px",
        background: "#FAFAFA",
        borderRadius: 8,
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${sentimentColor}`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontFamily: SPACE_MONO,
          color: TEXT_MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: CHARCOAL,
            lineHeight: 1,
            fontFamily: INTER,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </span>
        {trend !== undefined && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              fontSize: 12,
              fontFamily: SPACE_MONO,
              fontWeight: 700,
              color: trend > 0 ? POSITIVE : trend < 0 ? NEGATIVE : TEXT_MUTED,
            }}
          >
            {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {trend > 0 ? "+" : ""}
            {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 6, fontFamily: SPACE_MONO }}>{unit}</div>
    </div>
  );
}

function NarrativeRow({
  index,
  narrative,
}: {
  index: number;
  narrative: { label: string; momentum: Momentum; sentiment: number; volume: number };
}) {
  const MomentumIcon = narrative.momentum === "rising" ? TrendingUp : narrative.momentum === "falling" ? TrendingDown : Minus;
  const momentumColor = narrative.momentum === "rising" ? POSITIVE : narrative.momentum === "falling" ? NEGATIVE : TEXT_MUTED;
  const momentumLabel = narrative.momentum === "rising" ? "Hausse" : narrative.momentum === "falling" ? "Baisse" : "Stable";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 14px",
        background: "#FAFAFA",
        borderRadius: 7,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: WHITE,
          border: `1px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontFamily: SPACE_MONO,
          fontWeight: 700,
          color: SAGE,
          flexShrink: 0,
        }}
      >
        {index}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL, fontFamily: INTER, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {narrative.label}
        </div>
        <div style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: SPACE_MONO, marginTop: 2 }}>
          {narrative.volume} mentions · sentiment {narrative.sentiment.toFixed(2)}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", background: WHITE, borderRadius: 4, border: `1px solid ${BORDER}` }}>
        <MomentumIcon size={12} style={{ color: momentumColor }} />
        <span style={{ fontSize: 11, fontFamily: SPACE_MONO, fontWeight: 700, color: momentumColor }}>{momentumLabel}</span>
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const width = 720;
  const height = 120;
  const padding = 6;

  if (values.length === 0) {
    return (
      <div style={{ width: "100%", height, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_MUTED, fontSize: 12 }}>
        Collecte en cours
      </div>
    );
  }

  // Filter to non-zero for min/max calc, fallback to [-1, 1]
  const nonzero = values.filter((v) => v !== 0);
  const min = nonzero.length > 0 ? Math.min(...nonzero) : -1;
  const max = nonzero.length > 0 ? Math.max(...nonzero) : 1;
  const range = max - min || 2;
  // Pad range by 10% so the line doesn't touch edges
  const padRange = range * 0.1;
  const yMin = min - padRange;
  const yMax = max + padRange;
  const yRange = yMax - yMin;

  const stepX = (width - padding * 2) / Math.max(1, values.length - 1);
  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    // Map value (could be 0 = no data) to y. Treat 0 as midpoint of the band.
    const yVal = v === 0 ? (yMin + yMax) / 2 : v;
    const y = padding + (1 - (yVal - yMin) / yRange) * (height - padding * 2);
    return { x, y, raw: v };
  });

  // Line path (skip zero values to avoid flattening the curve)
  const linePath = points
    .filter((p) => p.raw !== 0)
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  // Zero baseline
  const zeroY = padding + (1 - (0 - yMin) / yRange) * (height - padding * 2);

  // Area path
  const areaPath =
    linePath && points.filter((p) => p.raw !== 0).length > 0
      ? `${linePath} L${points.filter((p) => p.raw !== 0)[points.filter((p) => p.raw !== 0).length - 1].x.toFixed(2)},${(height - padding).toFixed(2)} L${points.filter((p) => p.raw !== 0)[0].x.toFixed(2)},${(height - padding).toFixed(2)} Z`
      : "";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id="comex-spark-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SAGE} stopOpacity={0.25} />
          <stop offset="100%" stopColor={SAGE} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* zero baseline */}
      <line
        x1={padding}
        y1={zeroY}
        x2={width - padding}
        y2={zeroY}
        stroke={BORDER}
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      {/* area */}
      {areaPath && <path d={areaPath} fill="url(#comex-spark-gradient)" />}
      {/* line */}
      {linePath && (
        <path d={linePath} fill="none" stroke={SAGE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      )}
    </svg>
  );
}

function CompetitorBars({
  competitors,
}: {
  competitors: Array<{ name: string; shareOfVoice: number; mentions: number; sentiment: number; isYou: boolean }>;
}) {
  const maxMentions = Math.max(...competitors.map((c) => c.mentions), 1);

  if (competitors.length === 0) {
    return (
      <div style={{ padding: "20px", background: "#FAFAFA", borderRadius: 7, fontSize: 13, color: TEXT_MUTED }}>
        Aucun concurrent sectoriel détecté. Le benchmark sera disponible après collecte.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {competitors.map((c, i) => {
        const widthPct = (c.mentions / maxMentions) * 100;
        const barColor = c.isYou ? SAGE : DONUT_PALETTE[i % DONUT_PALETTE.length];
        const sentimentColor = c.sentiment > 0.05 ? POSITIVE : c.sentiment < -0.05 ? NEGATIVE : TEXT_MUTED;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: c.isYou ? 700 : 500,
                  color: c.isYou ? SAGE : CHARCOAL,
                  fontFamily: INTER,
                }}
              >
                {c.name}
                {c.isYou && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 9,
                      fontFamily: SPACE_MONO,
                      padding: "2px 6px",
                      background: SAGE_BG,
                      borderRadius: 3,
                      color: SAGE,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Vous
                  </span>
                )}
              </span>
              <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: SPACE_MONO }}>
                {c.mentions.toLocaleString("fr-FR")} · {c.shareOfVoice.toFixed(1)}%
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 8, background: "#F0F0F0", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    background: barColor,
                    borderRadius: 4,
                    transition: "width 0.6s ease-out",
                  }}
                />
              </div>
              <span style={{ fontSize: 10, color: sentimentColor, fontFamily: SPACE_MONO, minWidth: 42, textAlign: "right" }}>
                {c.sentiment > 0 ? "+" : ""}
                {c.sentiment.toFixed(2)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({
  competitors,
  yourShare,
}: {
  competitors: Array<{ name: string; shareOfVoice: number; isYou: boolean }>;
  yourShare: number;
}) {
  const size = 180;
  const radius = 70;
  const stroke = 22;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Normalize share-of-voice (they may not sum to 100 if some companies have 0 mentions)
  const totalShare = competitors.reduce((s, c) => s + c.shareOfVoice, 0) || 1;
  const normalized = competitors.map((c) => ({
    ...c,
    pct: (c.shareOfVoice / totalShare) * 100,
  }));

  let offset = 0;
  const segments = normalized.map((c, i) => {
    const dash = (c.pct / 100) * circumference;
    const seg = {
      key: i,
      color: c.isYou ? SAGE : DONUT_PALETTE[i % DONUT_PALETTE.length],
      dash,
      offset: -offset,
      name: c.name,
      pct: c.pct,
      isYou: c.isYou,
    };
    offset += dash;
    return seg;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* background ring */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#F0F0F0" strokeWidth={stroke} />
          {segments.map((s) => (
            <circle
              key={s.key}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={s.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 700, color: SAGE, fontFamily: SPACE_MONO, lineHeight: 1 }}>
            {yourShare.toFixed(1)}%
          </div>
          <div style={{ fontSize: 9, color: TEXT_MUTED, fontFamily: SPACE_MONO, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>
            Votre SOV
          </div>
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", justifyContent: "center", maxWidth: 220 }}>
        {segments.map((s) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span
              style={{
                fontSize: 10,
                fontFamily: INTER,
                color: s.isYou ? SAGE : TEXT_BODY,
                fontWeight: s.isYou ? 700 : 500,
              }}
            >
              {s.name.length > 14 ? s.name.slice(0, 12) + "…" : s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({
  index,
  recommendation,
}: {
  index: number;
  recommendation: { priority: Priority; title: string; description: string; deadlineDays: number };
}) {
  const priorityConfig: Record<Priority, { bg: string; border: string; text: string; label: string }> = {
    P0: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.30)", text: NEGATIVE, label: "Critique" },
    P1: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.30)", text: AMBER, label: "Élevée" },
    P2: { bg: SAGE_BG, border: SAGE_BORDER, text: SAGE, label: "Moyenne" },
    P3: { bg: "rgba(113,113,122,0.08)", border: "rgba(113,113,122,0.25)", text: TEXT_MUTED, label: "Standard" },
  };
  const cfg = priorityConfig[recommendation.priority];
  const PriorityIcon = recommendation.priority === "P0" ? ShieldAlert : recommendation.priority === "P1" ? AlertTriangle : recommendation.priority === "P2" ? Target : Sparkles;

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "16px 18px",
        background: "#FAFAFA",
        borderRadius: 9,
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${cfg.text}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: cfg.text,
        }}
      >
        <PriorityIcon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontFamily: SPACE_MONO,
              fontWeight: 700,
              color: cfg.text,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              padding: "2px 7px",
              borderRadius: 4,
              letterSpacing: "0.05em",
            }}
          >
            {recommendation.priority} · {cfg.label}
          </span>
          <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: SPACE_MONO }}>
            #{index}
          </span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, fontFamily: INTER, marginBottom: 4 }}>
          {recommendation.title}
        </div>
        <p style={{ fontSize: 12, color: TEXT_BODY, lineHeight: 1.55, margin: 0 }}>
          {recommendation.description}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 12px",
          background: WHITE,
          borderRadius: 6,
          border: `1px solid ${BORDER}`,
          minWidth: 90,
          flexShrink: 0,
        }}
      >
        <Clock size={12} style={{ color: SAGE, marginBottom: 4 }} />
        <span style={{ fontSize: 9, fontFamily: SPACE_MONO, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Échéance
        </span>
        <span style={{ fontSize: 12, fontFamily: SPACE_MONO, color: SAGE, fontWeight: 700, marginTop: 2 }}>
          {formatDeadline(recommendation.deadlineDays)}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function formatDeadline(days: number): string {
  if (days <= 1) return "Sous 24h";
  if (days <= 7) return `Sous ${days}j`;
  if (days <= 30) return `Sous ${Math.round(days / 7)} sem.`;
  return `Sous ${Math.round(days / 30)} mois`;
}

// ═══════════════════════════════════════════════════════════════
//  PRINT CSS — each .comex-page = 1 A4 page
// ═══════════════════════════════════════════════════════════════

const PRINT_CSS = `
@keyframes comex-spin { to { transform: rotate(360deg); } }
@keyframes comex-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

@media print {
  @page { size: A4; margin: 0; }

  body * { visibility: hidden !important; }
  #comex-document, #comex-document * { visibility: visible !important; }

  #comex-document {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 210mm !important;
    max-height: none !important;
    padding: 0 !important;
    overflow: visible !important;
    background: ${WHITE} !important;
    display: block !important;
  }

  .comex-page {
    width: 210mm !important;
    min-height: 297mm !important;
    padding: 18mm 16mm !important;
    page-break-after: always !important;
    break-after: page !important;
    box-sizing: border-box !important;
    background: ${WHITE} !important;
    opacity: 1 !important;
    transform: none !important;
  }

  .comex-page:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }

  .comex-page-divider { display: none !important; }
}
`;

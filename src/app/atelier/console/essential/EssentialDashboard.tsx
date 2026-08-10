"use client";

// ════════════════════════════════════════════════════════════════════
//  EssentialDashboard — Plan "Essentiel" (PME)
//
//  ULTIMATE single-screen monitoring dashboard — 10 must-have sections
//  from brainstorm-essentiel-pro.md:
//
//    1. Score de Réputation (GaugeChart) — semi-circular gauge + trend
//    2. Top 3 Alertes — 3 most critical alerts (severity tiles)
//    3. Tendance Sentiment 7 jours (LineChart) — 3-series daily trend
//    4. Dernières Mentions — 5 most recent articles feed
//    5. Snapshot Visibilité IA — 3 LLM cards (ChatGPT, Perplexity, Gemini)
//    6. Résumé Hebdo IA — HarchIQ-generated weekly summary + regenerate
//    7. Diversité Sources (BarChart) — top 10 sources by article count
//    8. Position Harch 100 — company's rank in the monthly Harch 100
//    9. Actions Rapides — 4 quick action buttons (CSV, Ask, H100, Demo)
//   10. Upsell Pro — sage-tinted banner with "Découvrir Pro →" CTA
//
//  Design:
//   • C.* design tokens (white surfaces, emerald-500 CTA, charcoal text)
//   • Each section: white card, 12px radius, 1px border, 24px padding
//   • 24px gap between sections (Tailwind gap-6)
//   • 2-column grid: sections 3+4, 5+6, 7+8 (collapses to 1-col on mobile)
//   • French throughout, mobile-first responsive
//   • Real API data only — "—" when empty, skeletons while loading
//   • Charts imported from ../Charts.tsx (GaugeChart, LineChart, BarChart)
//
//  Data sources (all real, no mock):
//   • /api/console/brand-health          (score, trend, sentiment)
//   • /api/console/crisis-alerts         (alerts + articles)
//   • /api/console/sentiment-trend       (7d sentiment + company name)
//   • /api/console/ai-visibility         (LLM rankings)
//   • /api/console/insights             (weekly AI summary)
//   • /api/console/source-distribution  (source diversity)
//   • /api/harch100/latest              (Harch 100 ranking)
//   • /api/console/export-csv           (CSV download trigger)
//
//  Task ID: BUILD-1
// ════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { signOut } from "next-auth/react";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Bell,
  Download,
  MessageSquare,
  BarChart3,
  Sparkles,
  RefreshCw,
  LogOut,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { C } from "../../components/tokens";
import { GaugeChart, LineChart, BarChart, type LinePoint, type BarDatum } from "../Charts";

// ─── TYPES ────────────────────────────────────────────────────────────

interface BrandHealth {
  score: number;
  trend: number;
  sentiment: { positive: number; neutral: number; negative: number };
  shareOfVoice: number;
  mentionCount24h: number;
  mentionVelocity: number;
  crisisLevel: "safe" | "watch" | "warning" | "critical";
  crisisScore: number;
  topNarrative: { label: string; momentum: string; sentiment: number } | null;
  aiVisibility: Array<{ engine: string; score: number }>;
  recommendation: string;
  lastUpdated: string;
  source?: string;
}

interface CrisisAlert {
  id: string;
  severity: "watch" | "warning" | "critical";
  title: string;
  summary: string;
  source: string;
  sourceType: "media" | "social" | "whatsapp" | "regulatory";
  language: string;
  timestamp: number;
  acknowledged: boolean;
}

interface InsightItem {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  confidence: number;
  action: string;
  persona: string;
  generatedAt: string;
}

interface SourceRow {
  name: string;
  count: number;
  color: string;
  type: "media" | "social";
}

interface SentimentDay {
  date: string;
  avgScore: number;
  count: number;
  positive: number;
  neutral: number;
  negative: number;
}

interface AiVisibilityEngine {
  platform: string;
  cited: boolean;
  position: string | null;
  sentiment: string | null;
  confidence: number;
  summary: string | null;
  checkedAt: string;
}

interface Harch100Ranking {
  rank: number;
  companyId: string;
  companyName: string;
  sector: string;
  reputationScore: number;
  totalArticles: number;
  negativeCount: number;
  positiveCount: number;
}

interface Harch100Snapshot {
  id: string;
  period: string;
  rankings: Harch100Ranking[];
  generatedAt: string;
  publishedAt: string | null;
}

// ─── HELPERS ──────────────────────────────────────────────────────────

function fmtRelative(ts: number | string | undefined): string {
  if (!ts) return "—";
  const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `il y a ${days} j`;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function fmtDayShort(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" });
}

function fmtPeriod(period: string): string {
  // "2026-08" → "août 2026"
  if (!period || !/^\d{4}-\d{2}$/.test(period)) return period || "—";
  const [y, m] = period.split("-");
  const months = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const mi = parseInt(m, 10) - 1;
  if (mi < 0 || mi > 11) return period;
  return `${months[mi]} ${y}`;
}

function fmtNumber(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function severityColor(sev: string): string {
  if (sev === "critical") return C.danger;
  if (sev === "warning" || sev === "high") return C.warning;
  if (sev === "watch" || sev === "medium") return C.accent;
  return C.success;
}

function severityBg(sev: string): string {
  if (sev === "critical") return C.dangerBg;
  if (sev === "warning" || sev === "high") return C.warningBg;
  return "rgba(120,113,108,0.08)";
}

function severityLabel(sev: string): string {
  if (sev === "critical") return "Critique";
  if (sev === "warning" || sev === "high") return "Alerte";
  if (sev === "watch") return "Veille";
  return "OK";
}

// Match the user's company name against Harch 100 rankings.
// Case-insensitive, trims whitespace, also matches on slug-ish forms.
function findCompanyRank(
  rankings: Harch100Ranking[],
  companyName: string | undefined,
): Harch100Ranking | null {
  if (!rankings || rankings.length === 0 || !companyName) return null;
  const target = companyName.trim().toLowerCase();
  // Exact match first
  let match = rankings.find((r) => r.companyName.trim().toLowerCase() === target);
  if (match) return match;
  // Substring match (one contains the other)
  match = rankings.find(
    (r) =>
      r.companyName.toLowerCase().includes(target) ||
      target.includes(r.companyName.toLowerCase()),
  );
  return match ?? null;
}

// ─── PRIMITIVE: Card ──────────────────────────────────────────────────

function Card({
  title,
  subtitle,
  badge,
  children,
  className = "",
  bodyClassName = "",
  headerRight,
  style,
}: {
  title?: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerRight?: React.ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section
      className={`bg-white rounded-[12px] ${className}`}
      style={{
        backgroundColor: C.bg,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        boxShadow: C.shadowSm,
        ...style,
      }}
    >
      {(title || headerRight) && (
        <header
          className="flex items-start justify-between gap-3 px-6 pt-5 pb-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="min-w-0">
            {title && (
              <h3
                className="text-[15px] font-semibold leading-tight"
                style={{ color: C.text, fontFamily: C.fontSans }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[12px] mt-0.5" style={{ color: C.textMuted }}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {badge && (
              <span
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(120,113,108,0.10)",
                  color: C.accentHover,
                  fontFamily: C.fontMono,
                  letterSpacing: "0.06em",
                }}
              >
                {badge}
              </span>
            )}
            {headerRight}
          </div>
        </header>
      )}
      <div className={bodyClassName || "p-6"}>{children}</div>
    </section>
  );
}

// ─── PRIMITIVE: EmptyState ────────────────────────────────────────────

function EmptyState({ label, height = 120 }: { label: string; height?: number }) {
  return (
    <div className="py-8 text-center flex flex-col items-center justify-center" style={{ minHeight: height }}>
      <div
        className="w-10 h-10 mb-2 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "rgba(120,113,108,0.10)" }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="7" stroke={C.accent} strokeWidth="1.4" />
          <path d="M9 5 V9 M9 12 V12.5" stroke={C.accent} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[12px]" style={{ color: C.textMuted }}>
        {label}
      </p>
    </div>
  );
}

// ─── PRIMITIVE: Skeleton ──────────────────────────────────────────────

function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ backgroundColor: "rgba(120,113,108,0.08)", ...style }}
    />
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────

function DashboardHeader({
  lastUpdated,
  alertCount,
}: {
  lastUpdated: string | null;
  alertCount: number;
}) {
  return (
    <header
      className="sticky top-0 z-30 mb-6 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4"
      style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(16,185,129,0.10)",
                color: C.cta,
                fontFamily: C.fontMono,
              }}
            >
              Plan Essentiel
            </span>
            <span
              className="text-[11px] hidden sm:inline"
              style={{ color: C.textMuted, fontFamily: C.fontMono }}
            >
              Surveillance 24/7 · Maroc & Afrique
            </span>
          </div>
          <h1
            className="text-[22px] sm:text-[26px] font-bold tracking-tight leading-tight"
            style={{ color: C.text, fontFamily: C.fontSans }}
          >
            Tableau de bord réputation
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div
              className="text-[10px] uppercase tracking-wider"
              style={{ color: C.textMuted, fontFamily: C.fontMono }}
            >
              Dernière maj
            </div>
            <div className="text-[12px]" style={{ color: C.textBody, fontFamily: C.fontMono }}>
              {lastUpdated ?? "—"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/atelier/login" })}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            style={{ border: `1px solid ${C.borderStrong}`, color: C.textBody }}
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
      {alertCount > 0 && (
        <div
          className="mt-3 flex items-center gap-2 text-[12px]"
          style={{ color: alertCount >= 3 ? C.danger : C.warning }}
        >
          <Bell size={13} />
          <span>
            <strong style={{ fontFamily: C.fontMono }}>{alertCount}</strong> alerte{alertCount > 1 ? "s" : ""} active{alertCount > 1 ? "s" : ""} · traiter en priorité
          </span>
        </div>
      )}
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════
//  SECTION 1 — Score de Réputation (GaugeChart)
// ════════════════════════════════════════════════════════════════════

function ScoreReputationSection({
  health,
  isLoading,
}: {
  health: BrandHealth | null;
  isLoading: boolean;
}) {
  const score = health?.score ?? 0;
  const trend = health?.trend ?? 0;
  const trendUp = trend > 0;
  const trendDown = trend < 0;

  const zoneLabel =
    score >= 70 ? "Solide" : score >= 40 ? "À surveiller" : "Critique";
  const zoneColor =
    score >= 70 ? C.success : score >= 40 ? C.warning : C.danger;

  return (
    <Card
      title="Score de réputation"
      subtitle="Synthèse temps réel — sentiment, visibilité, crises"
      badge={health?.source === "demo" ? "Démo" : "Live"}
      bodyClassName="p-6"
      headerRight={
        <a
          href="/atelier/console/brand-monitor"
          className="text-[12px] font-medium hover:underline inline-flex items-center gap-1"
          style={{ color: C.cta }}
        >
          Voir le détail
          <ChevronRight size={13} />
        </a>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Gauge — spans 2 cols on desktop */}
        <div className="lg:col-span-2 flex justify-center">
          {isLoading ? (
            <Skeleton style={{ width: "100%", maxWidth: 460, height: 220 }} />
          ) : (
            <div style={{ width: "100%", maxWidth: 460 }}>
              <GaugeChart
                value={score}
                max={100}
                label="Score global / 100"
                height={220}
              />
            </div>
          )}
        </div>

        {/* Trend + zone + narrative */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton style={{ height: 60 }} />
              <Skeleton style={{ height: 40 }} />
              <Skeleton style={{ height: 40 }} />
            </>
          ) : (
            <>
              {/* Trend */}
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: trendUp
                    ? "rgba(16,185,129,0.06)"
                    : trendDown
                    ? "rgba(239,68,68,0.06)"
                    : "rgba(120,113,108,0.06)",
                  border: `1px solid ${trendUp ? C.success + "30" : trendDown ? C.danger + "30" : C.border}`,
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: C.textMuted, fontFamily: C.fontMono }}
                >
                  Variation
                </div>
                <div className="flex items-baseline gap-2">
                  {trendUp ? (
                    <TrendingUp size={18} style={{ color: C.success }} />
                  ) : trendDown ? (
                    <TrendingDown size={18} style={{ color: C.danger }} />
                  ) : (
                    <Minus size={18} style={{ color: C.accent }} />
                  )}
                  <span
                    className="text-[22px] font-bold tabular-nums"
                    style={{
                      color: trendUp ? C.success : trendDown ? C.danger : C.accent,
                      fontFamily: C.fontMono,
                    }}
                  >
                    {trend >= 0 ? "+" : ""}
                    {trend.toFixed(1)}
                  </span>
                  <span className="text-[11px]" style={{ color: C.textMuted }}>
                    pts vs semaine dernière
                  </span>
                </div>
              </div>

              {/* Zone label */}
              <div>
                <div
                  className="text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: C.textMuted, fontFamily: C.fontMono }}
                >
                  Statut
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: zoneColor }}
                  />
                  <span
                    className="text-[16px] font-semibold"
                    style={{ color: zoneColor, fontFamily: C.fontSans }}
                  >
                    {zoneLabel}
                  </span>
                </div>
              </div>

              {/* Narrative */}
              {health?.topNarrative && (
                <div>
                  <div
                    className="text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: C.textMuted, fontFamily: C.fontMono }}
                  >
                    Narrative dominant
                  </div>
                  <p className="text-[13px] font-medium leading-snug" style={{ color: C.text }}>
                    {health.topNarrative.label}
                  </p>
                  <div
                    className="text-[11px] mt-1 flex items-center gap-2"
                    style={{ color: C.textMuted, fontFamily: C.fontMono }}
                  >
                    <span>Momentum: {health.topNarrative.momentum}</span>
                    <span>·</span>
                    <span>Sentiment: {health.topNarrative.sentiment.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  SECTION 2 — Top 3 Alertes
// ════════════════════════════════════════════════════════════════════

function TopAlertsSection({
  alerts,
  isLoading,
}: {
  alerts: CrisisAlert[];
  isLoading: boolean;
}) {
  // Sort by severity (critical > warning > watch) then by timestamp desc
  const sevRank = (s: string) => (s === "critical" ? 3 : s === "warning" ? 2 : s === "watch" ? 1 : 0);
  const top = useMemo(
    () =>
      [...alerts]
        .sort((a, b) => sevRank(b.severity) - sevRank(a.severity) || b.timestamp - a.timestamp)
        .slice(0, 3),
    [alerts],
  );

  return (
    <Card
      title="Top 3 alertes"
      subtitle="Critiques et prioritaires — à traiter immédiatement"
      badge={top.length > 0 ? `${top.length} actives` : "—"}
      bodyClassName="p-6"
      headerRight={
        <a
          href="/atelier/console/brand-monitor"
          className="text-[12px] font-medium hover:underline inline-flex items-center gap-1"
          style={{ color: C.cta }}
        >
          Voir toutes les alertes
          <ChevronRight size={13} />
        </a>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 120 }} />
          ))}
        </div>
      ) : top.length === 0 ? (
        <EmptyState label="Aucune alerte active — tout est sous contrôle" height={120} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {top.map((a) => {
            const color = severityColor(a.severity);
            const bg = severityBg(a.severity);
            return (
              <article
                key={a.id}
                className="rounded-xl p-4 transition-all hover:translate-y-[-1px]"
                style={{
                  backgroundColor: bg,
                  border: `1px solid ${color}30`,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium"
                    style={{ backgroundColor: color, color: "white", fontFamily: C.fontMono }}
                  >
                    {a.severity === "critical" && <AlertTriangle size={10} />}
                    {severityLabel(a.severity)}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: C.textMuted, fontFamily: C.fontMono }}
                  >
                    {fmtRelative(a.timestamp)}
                  </span>
                </div>
                <p
                  className="text-[13px] font-medium leading-snug mb-2 line-clamp-2"
                  style={{ color: C.text }}
                >
                  {a.title}
                </p>
                <div
                  className="text-[11px] flex items-center gap-1.5"
                  style={{ color: C.textMuted, fontFamily: C.fontMono }}
                >
                  <span className="truncate">{a.source || "—"}</span>
                  {a.language && (
                    <>
                      <span>·</span>
                      <span className="uppercase">{a.language}</span>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  SECTION 3 — Tendance Sentiment 7 jours (LineChart)
// ════════════════════════════════════════════════════════════════════

function SentimentTrendSection({
  data,
  isLoading,
}: {
  data: SentimentDay[];
  isLoading: boolean;
}) {
  // Build LinePoint[] for the multi-series chart.
  // 3 series: positive (green), neutral (gray), negative (red).
  const chartData: LinePoint[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d) => ({
      date: d.date,
      series: [
        { name: "Positif", value: d.positive, color: C.success },
        { name: "Neutre", value: d.neutral, color: C.accent },
        { name: "Négatif", value: d.negative, color: C.danger },
      ],
    }));
  }, [data]);

  // Last 7 days summary
  const last7 = data.slice(-7);
  const totalPos = last7.reduce((s, d) => s + d.positive, 0);
  const totalNeg = last7.reduce((s, d) => s + d.negative, 0);
  const totalNeu = last7.reduce((s, d) => s + d.neutral, 0);
  const total = totalPos + totalNeg + totalNeu || 1;

  return (
    <Card
      title="Tendance sentiment · 7 jours"
      subtitle="Volume quotidien par polarité"
      badge="7 jours"
      bodyClassName="p-6"
    >
      {isLoading ? (
        <Skeleton style={{ height: 240 }} />
      ) : chartData.length < 2 ? (
        <EmptyState label="Pas assez de données de sentiment sur 7 jours" height={200} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div
                className="text-[10px] uppercase tracking-wider mb-0.5"
                style={{ color: C.textMuted, fontFamily: C.fontMono }}
              >
                Positif
              </div>
              <div
                className="text-[18px] font-bold tabular-nums"
                style={{ color: C.success, fontFamily: C.fontMono }}
              >
                {Math.round((totalPos / total) * 100)}%
              </div>
              <div className="text-[10px]" style={{ color: C.textMuted }}>
                {fmtNumber(totalPos)} mentions
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-[10px] uppercase tracking-wider mb-0.5"
                style={{ color: C.textMuted, fontFamily: C.fontMono }}
              >
                Neutre
              </div>
              <div
                className="text-[18px] font-bold tabular-nums"
                style={{ color: C.accent, fontFamily: C.fontMono }}
              >
                {Math.round((totalNeu / total) * 100)}%
              </div>
              <div className="text-[10px]" style={{ color: C.textMuted }}>
                {fmtNumber(totalNeu)} mentions
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-[10px] uppercase tracking-wider mb-0.5"
                style={{ color: C.textMuted, fontFamily: C.fontMono }}
              >
                Négatif
              </div>
              <div
                className="text-[18px] font-bold tabular-nums"
                style={{ color: C.danger, fontFamily: C.fontMono }}
              >
                {Math.round((totalNeg / total) * 100)}%
              </div>
              <div className="text-[10px]" style={{ color: C.textMuted }}>
                {fmtNumber(totalNeg)} mentions
              </div>
            </div>
          </div>
          <LineChart data={chartData} height={240} />
          <div
            className="text-[10px] mt-2 text-center"
            style={{ color: C.textMuted, fontFamily: C.fontMono }}
          >
            {fmtDayShort(last7[0]?.date)} → {fmtDayShort(last7[last7.length - 1]?.date)} · {fmtNumber(total)} mentions au total
          </div>
        </>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  SECTION 4 — Dernières Mentions (article feed)
// ════════════════════════════════════════════════════════════════════

function LastMentionsSection({
  alerts,
  isLoading,
}: {
  alerts: CrisisAlert[];
  isLoading: boolean;
}) {
  // 5 most recent articles (sorted by timestamp desc)
  const top = useMemo(
    () => [...alerts].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5),
    [alerts],
  );

  return (
    <Card
      title="Dernières mentions"
      subtitle="5 articles les plus récents vous citant"
      badge="Live"
      bodyClassName="p-0"
      headerRight={
        <a
          href="/atelier/console/brand-monitor"
          className="text-[12px] font-medium hover:underline inline-flex items-center gap-1"
          style={{ color: C.cta }}
        >
          Voir tous les articles
          <ChevronRight size={13} />
        </a>
      }
    >
      <div className="max-h-[420px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} style={{ height: 56 }} />
            ))}
          </div>
        ) : top.length === 0 ? (
          <div className="p-5">
            <EmptyState label="Aucune mention récente" height={120} />
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: C.border }}>
            {top.map((a) => {
              const sev =
                a.severity === "critical"
                  ? "critical"
                  : a.severity === "warning"
                  ? "warning"
                  : "watch";
              return (
                <li
                  key={a.id}
                  className="px-5 py-3 hover:bg-[rgba(120,113,108,0.04)] transition-colors"
                  style={{ borderColor: C.border }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 inline-flex items-center text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium shrink-0"
                      style={{
                        backgroundColor: severityBg(sev),
                        color: severityColor(sev),
                        fontFamily: C.fontMono,
                      }}
                    >
                      {severityLabel(sev)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div
                        className="flex items-center gap-2 text-[11px] mb-0.5"
                        style={{ color: C.textMuted, fontFamily: C.fontMono }}
                      >
                        <span className="truncate">{a.source || "—"}</span>
                        <span>·</span>
                        <span>{fmtRelative(a.timestamp)}</span>
                        {a.language && (
                          <>
                            <span>·</span>
                            <span className="uppercase">{a.language}</span>
                          </>
                        )}
                      </div>
                      <p
                        className="text-[13px] font-medium leading-snug line-clamp-2"
                        style={{ color: C.text }}
                      >
                        {a.title}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  SECTION 5 — Snapshot Visibilité IA (3 LLM cards)
// ════════════════════════════════════════════════════════════════════

const TARGET_LLMS = ["ChatGPT", "Perplexity", "Gemini"] as const;

function AIVisibilitySection({
  engines,
  isLoading,
}: {
  engines: AiVisibilityEngine[] | null;
  isLoading: boolean;
}) {
  // Pick the 3 target LLMs (ChatGPT, Perplexity, Gemini).
  // If a target LLM is not present in the response, show an "Non cité" placeholder card.
  const cards = useMemo(() => {
    if (!engines) return [];
    return TARGET_LLMS.map((name) => {
      const exact = engines.find((e) => e.platform.toLowerCase() === name.toLowerCase());
      if (exact) return { name, engine: exact, missing: false as const };
      // Fuzzy match (e.g. "ChatGPT-4" or "Perplexity AI")
      const fuzzy = engines.find(
        (e) =>
          e.platform.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(e.platform.toLowerCase()),
      );
      if (fuzzy) return { name, engine: fuzzy, missing: false as const };
      return { name, engine: null, missing: true as const };
    });
  }, [engines]);

  return (
    <Card
      title="Visibilité IA"
      subtitle="Ce que les moteurs IA disent de vous"
      badge={engines && engines.length > 0 ? `${engines.filter((e) => e.cited).length}/${engines.length} moteurs` : "—"}
      bodyClassName="p-6"
      headerRight={
        <a
          href="/atelier/console/brand-monitor"
          className="text-[12px] font-medium hover:underline inline-flex items-center gap-1"
          style={{ color: C.cta }}
        >
          Voir le détail complet
          <ChevronRight size={13} />
        </a>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 130 }} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState label="Aucune donnée IA disponible" height={130} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cards.map(({ name, engine, missing }) => {
            const cited = engine?.cited ?? false;
            const position = engine?.position ?? null;
            const sentiment = engine?.sentiment ?? null;
            const sentimentLabel =
              sentiment === "positive" ? "Positif" : sentiment === "negative" ? "Négatif" : sentiment === "neutral" ? "Neutre" : "—";
            const sentimentColor =
              sentiment === "positive" ? C.success : sentiment === "negative" ? C.danger : C.accent;

            return (
              <article
                key={name}
                className="rounded-xl p-4 transition-all hover:translate-y-[-1px]"
                style={{
                  backgroundColor: missing ? C.bgSubtle : cited ? "rgba(16,185,129,0.04)" : "rgba(245,158,11,0.04)",
                  border: `1px solid ${missing ? C.border : cited ? C.success + "30" : C.warning + "30"}`,
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[13px] font-semibold" style={{ color: C.text }}>
                    {name}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium"
                    style={{
                      backgroundColor: missing
                        ? "rgba(120,113,108,0.10)"
                        : cited
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(245,158,11,0.12)",
                      color: missing ? C.textMuted : cited ? C.success : C.warning,
                      fontFamily: C.fontMono,
                    }}
                  >
                    {missing ? "N/A" : cited ? "Cité" : "Non cité"}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 mb-1.5">
                  <span
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: C.textMuted, fontFamily: C.fontMono }}
                  >
                    Position
                  </span>
                  <span
                    className="text-[18px] font-bold tabular-nums"
                    style={{ color: C.text, fontFamily: C.fontMono }}
                  >
                    {position ? `#${position}` : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span style={{ color: C.textMuted }}>Sentiment</span>
                  <span
                    className="font-medium"
                    style={{ color: missing ? C.textMuted : sentimentColor }}
                  >
                    {sentimentLabel}
                  </span>
                </div>

                {engine?.confidence !== undefined && engine.confidence > 0 && (
                  <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                    <div className="flex items-center justify-between text-[10px]" style={{ color: C.textMuted }}>
                      <span className="uppercase tracking-wider" style={{ fontFamily: C.fontMono }}>
                        Confiance
                      </span>
                      <span style={{ fontFamily: C.fontMono, color: C.text }}>
                        {Math.round(engine.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  SECTION 6 — Résumé Hebdo IA (HarchIQ insight)
// ════════════════════════════════════════════════════════════════════

function WeeklyAISummarySection({
  insight,
  isLoading,
  onRegenerate,
  regenerating,
}: {
  insight: InsightItem | null;
  isLoading: boolean;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  return (
    <Card
      title="Résumé hebdo IA"
      subtitle="Synthèse générée par HarchIQ à partir de vos données"
      badge="GenAI"
      bodyClassName="p-6"
      headerRight={
        <span
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: "rgba(16,185,129,0.10)",
            color: C.cta,
            fontFamily: C.fontMono,
          }}
        >
          <Sparkles size={10} />
          HarchIQ AI
        </span>
      }
    >
      {isLoading || regenerating ? (
        <div className="space-y-2 animate-pulse">
          <Skeleton style={{ height: 16, width: "60%" }} />
          <Skeleton style={{ height: 12, width: "100%" }} />
          <Skeleton style={{ height: 12, width: "92%" }} />
          <Skeleton style={{ height: 12, width: "78%" }} />
          <Skeleton style={{ height: 12, width: "85%" }} />
        </div>
      ) : !insight ? (
        <EmptyState label="Synthèse hebdomadaire en préparation — régénérez pour forcer" height={140} />
      ) : (
        <div>
          <div className="flex items-start gap-2 mb-2">
            <span
              className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium shrink-0"
              style={{
                backgroundColor: severityBg(insight.severity),
                color: severityColor(insight.severity),
                fontFamily: C.fontMono,
              }}
            >
              {insight.severity === "critical" ? "Critique" : insight.severity === "warning" ? "Alerte" : "Info"}
            </span>
            <h4 className="text-[14px] font-semibold leading-tight" style={{ color: C.text }}>
              {insight.title}
            </h4>
          </div>
          <p className="text-[13px] leading-relaxed mb-3" style={{ color: C.textBody }}>
            {insight.body}
          </p>
          {insight.action && (
            <div
              className="text-[12px] px-3 py-2 rounded-lg mb-3"
              style={{
                backgroundColor: "rgba(16,185,129,0.06)",
                borderLeft: `2px solid ${C.cta}`,
                color: C.text,
              }}
            >
              <span className="font-medium" style={{ color: C.cta }}>
                Action recommandée :{" "}
              </span>
              {insight.action}
            </div>
          )}
          <div
            className="flex items-center justify-between pt-3 gap-2"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <span className="text-[11px]" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
              Confiance {Math.round((insight.confidence ?? 0) * 100)}% · {fmtRelative(insight.generatedAt)}
            </span>
            <button
              type="button"
              onClick={onRegenerate}
              className="text-[12px] font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
              style={{
                border: `1px solid ${C.borderStrong}`,
                color: C.text,
                backgroundColor: C.bg,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = C.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = C.bg;
              }}
            >
              <RefreshCw size={13} className={regenerating ? "animate-spin" : ""} />
              Régénérer
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  SECTION 7 — Diversité Sources (BarChart)
// ════════════════════════════════════════════════════════════════════

function SourceDiversitySection({
  sources,
  total,
  isLoading,
}: {
  sources: SourceRow[];
  total: number;
  isLoading: boolean;
}) {
  // Build BarDatum[] from sources (up to 10).
  const chartData: BarDatum[] = useMemo(() => {
    if (!sources || sources.length === 0) return [];
    return sources.slice(0, 10).map((s) => ({
      label: s.name,
      value: s.count,
      color: s.type === "social" ? C.warning : C.cta,
    }));
  }, [sources]);

  return (
    <Card
      title="Diversité des sources"
      subtitle="Top sources par volume d'articles · 30 derniers jours"
      badge={total > 0 ? `${fmtNumber(total)} articles` : "—"}
      bodyClassName="p-6"
      headerRight={
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: "rgba(120,113,108,0.10)",
            color: C.accentHover,
            fontFamily: C.fontMono,
          }}
        >
          20+ sources surveillées
        </span>
      }
    >
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 20 }} />
          ))}
        </div>
      ) : chartData.length === 0 ? (
        <EmptyState label="Aucune source détectée pour le moment" height={180} />
      ) : (
        <BarChart data={chartData} height={Math.min(360, chartData.length * 36 + 8)} />
      )}
      <div
        className="mt-3 pt-3 text-[11px] flex items-center gap-3"
        style={{ borderTop: `1px solid ${C.border}`, color: C.textMuted }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: C.cta }} />
          Médias
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: C.warning }} />
          Social
        </span>
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  SECTION 8 — Position Harch 100
// ════════════════════════════════════════════════════════════════════

function Harch100Section({
  snapshot,
  companyName,
  isLoading,
}: {
  snapshot: Harch100Snapshot | null;
  companyName: string | undefined;
  isLoading: boolean;
}) {
  const rank = useMemo(
    () => findCompanyRank(snapshot?.rankings ?? [], companyName),
    [snapshot, companyName],
  );

  const rankNum = rank?.rank ?? null;
  const period = snapshot?.period ? fmtPeriod(snapshot.period) : "—";
  const totalRanked = snapshot?.rankings?.length ?? 0;

  // Percentile (top X%)
  const percentile =
    rankNum && totalRanked > 0
      ? Math.round((rankNum / totalRanked) * 100)
      : null;

  return (
    <Card
      title="Position Harch 100"
      subtitle="Classement mensuel des entreprises marocaines"
      badge={snapshot?.publishedAt ? "Publié" : "Brouillon"}
      bodyClassName="p-6"
      headerRight={
        <a
          href="/atelier/harch-100"
          className="text-[12px] font-medium hover:underline inline-flex items-center gap-1"
          style={{ color: C.cta }}
        >
          Voir le classement
          <ChevronRight size={13} />
        </a>
      }
    >
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <Skeleton style={{ height: 80 }} />
          <Skeleton style={{ height: 40 }} />
        </div>
      ) : (
        <div>
          <div className="flex items-end gap-3 mb-4">
            <div
              className="text-[64px] font-bold leading-none tabular-nums"
              style={{
                color: rankNum && rankNum <= 10 ? C.cta : rankNum && rankNum <= 50 ? C.text : C.accent,
                fontFamily: C.fontMono,
              }}
            >
              {rankNum ? `#${rankNum}` : "—"}
            </div>
            <div className="pb-2">
              <div className="text-[14px] font-medium" style={{ color: C.text }}>
                au Maroc
              </div>
              <div className="text-[11px]" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
                {period}
              </div>
            </div>
          </div>

          {rank ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: C.bgSubtle, border: `1px solid ${C.border}` }}
                >
                  <div
                    className="text-[10px] uppercase tracking-wider mb-0.5"
                    style={{ color: C.textMuted, fontFamily: C.fontMono }}
                  >
                    Score réputation
                  </div>
                  <div
                    className="text-[18px] font-bold tabular-nums"
                    style={{ color: C.text, fontFamily: C.fontMono }}
                  >
                    {rank.reputationScore}
                  </div>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: C.bgSubtle, border: `1px solid ${C.border}` }}
                >
                  <div
                    className="text-[10px] uppercase tracking-wider mb-0.5"
                    style={{ color: C.textMuted, fontFamily: C.fontMono }}
                  >
                    Articles analysés
                  </div>
                  <div
                    className="text-[18px] font-bold tabular-nums"
                    style={{ color: C.text, fontFamily: C.fontMono }}
                  >
                    {fmtNumber(rank.totalArticles)}
                  </div>
                </div>
              </div>
              <div
                className="text-[11px] flex items-center justify-between"
                style={{ color: C.textMuted, fontFamily: C.fontMono }}
              >
                <span>Secteur : {rank.sector || "—"}</span>
                {percentile !== null && <span>Top {percentile}%</span>}
              </div>
            </>
          ) : (
            <div
              className="rounded-lg p-4 text-center"
              style={{ backgroundColor: C.bgSubtle, border: `1px solid ${C.border}` }}
            >
              <p className="text-[13px] font-medium mb-1" style={{ color: C.text }}>
                {companyName ? `${companyName} — hors classement` : "Entreprise non classée"}
              </p>
              <p className="text-[11px]" style={{ color: C.textMuted }}>
                {totalRanked > 0
                  ? `Le classement actuel couvre ${totalRanked} entreprises.`
                  : "Aucun classement publié pour le moment."}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  SECTION 9 — Actions Rapides
// ════════════════════════════════════════════════════════════════════

function QuickActionsSection() {
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      // The endpoint streams a CSV directly — navigate to it to trigger download.
      window.location.href = "/api/console/export-csv?type=articles&days=90";
    } finally {
      // Reset after a short delay (the navigation itself doesn't unload the SPA).
      setTimeout(() => setExporting(false), 1200);
    }
  }, [exporting]);

  const actions: Array<{
    label: string;
    description: string;
    icon: React.ReactNode;
    onClick?: () => void;
    href?: string;
    primary?: boolean;
    disabled?: boolean;
  }> = [
    {
      label: "Exporter CSV",
      description: "Téléchargez vos articles (90 j)",
      icon: <Download size={18} />,
      onClick: handleExportCSV,
      disabled: exporting,
    },
    {
      label: "Demander à HarchIQ",
      description: "Posez une question à l'IA",
      icon: <MessageSquare size={18} />,
      href: "/atelier/ask-harchiq",
    },
    {
      label: "Voir Harch 100",
      description: "Classement mensuel Maroc",
      icon: <BarChart3 size={18} />,
      href: "/atelier/harch-100",
    },
    {
      label: "Demander une démo Pro",
      description: "Passez à Pro (upsell)",
      icon: <Sparkles size={18} />,
      href: "/atelier/pricing#pro",
      primary: true,
    },
  ];

  return (
    <Card
      title="Actions rapides"
      subtitle="Raccourcis pour gagner du temps"
      bodyClassName="p-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((a) => {
          const content = (
            <>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors"
                style={{
                  backgroundColor: a.primary ? C.cta : "rgba(120,113,108,0.08)",
                  color: a.primary ? "white" : C.text,
                }}
              >
                {a.icon}
              </div>
              <div
                className="text-[13px] font-semibold mb-0.5"
                style={{ color: C.text }}
              >
                {a.label}
              </div>
              <div className="text-[11px]" style={{ color: C.textMuted }}>
                {a.description}
              </div>
            </>
          );

          const baseStyle: CSSProperties = {
            display: "block",
            padding: 16,
            borderRadius: 12,
            border: `1px solid ${a.primary ? C.cta + "40" : C.border}`,
            backgroundColor: a.primary ? "rgba(16,185,129,0.04)" : C.bg,
            cursor: a.disabled ? "wait" : "pointer",
            transition: "all 0.15s ease",
            textAlign: "left",
            width: "100%",
          };

          if (a.href) {
            return (
              <a
                key={a.label}
                href={a.href}
                style={baseStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = C.shadowMd;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {content}
              </a>
            );
          }

          return (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              disabled={a.disabled}
              style={baseStyle}
              onMouseEnter={(e) => {
                if (!a.disabled) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = C.shadowMd;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {content}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  SECTION 10 — Upsell Pro
// ════════════════════════════════════════════════════════════════════

function UpsellProBanner() {
  return (
    <section
      className="rounded-[12px] p-6 sm:p-8"
      style={{
        backgroundColor: "rgba(16,185,129,0.06)",
        border: `1px solid ${C.cta}30`,
        borderRadius: 12,
        backgroundImage:
          "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(74,123,95,0.06) 100%)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="max-w-[640px]">
          <div
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider mb-2 px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "rgba(16,185,129,0.15)",
              color: C.cta,
              fontFamily: C.fontMono,
            }}
          >
            <Sparkles size={11} />
            Plan Pro
          </div>
          <h3
            className="text-[18px] sm:text-[22px] font-bold leading-tight mb-2"
            style={{ color: C.text, fontFamily: C.fontSans }}
          >
            Passez à Pro pour le benchmarking concurrentiel, les rapports personnalisés et 200 questions HarchIQ/jour
          </h3>
          <p className="text-[13px] leading-relaxed" style={{ color: C.textBody }}>
            Débloquez le benchmarking 5+ concurrents, les rapports PDF board-ready,
            les alertes WhatsApp 24/7, la matrix linguistique Darija/MSA/Français, l'API & MCP.
          </p>
        </div>
        <div className="shrink-0">
          <a
            href="/atelier/pricing#pro"
            className="inline-flex items-center gap-2 text-[13px] font-semibold px-5 py-3 rounded-lg transition-all hover:translate-y-[-1px]"
            style={{
              backgroundColor: C.text,
              color: "white",
              boxShadow: C.shadowSm,
            }}
          >
            Découvrir Pro
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════

export function EssentialDashboard() {
  // ─── STATE ─────────────────────────────────────────────────────────
  const [health, setHealth] = useState<BrandHealth | null>(null);
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [sentiment, setSentiment] = useState<SentimentDay[]>([]);
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);
  const [aiEngines, setAiEngines] = useState<AiVisibilityEngine[] | null>(null);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [sourceTotal, setSourceTotal] = useState(0);
  const [harch100, setHarch100] = useState<Harch100Snapshot | null>(null);

  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingSentiment, setLoadingSentiment] = useState(true);
  const [loadingAi, setLoadingAi] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loadingSources, setLoadingSources] = useState(true);
  const [loadingHarch100, setLoadingHarch100] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // ─── DATA FETCHING ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const stamp = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    async function fetchAll() {
      const tasks: Array<Promise<void>> = [
        // 1. Brand health
        fetch("/api/console/brand-health")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((d: BrandHealth) => {
            if (!cancelled) {
              setHealth(d);
              setLoadingHealth(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoadingHealth(false);
          }),

        // 2. Crisis alerts (used for both top alerts + article feed)
        fetch("/api/console/crisis-alerts")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((d: { alerts: CrisisAlert[] }) => {
            if (!cancelled) {
              setAlerts(d.alerts ?? []);
              setLoadingAlerts(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoadingAlerts(false);
          }),

        // 3. Sentiment trend (7d) — also gives us the company name
        fetch("/api/console/sentiment-trend?range=7d")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((d: { data: SentimentDay[]; company?: { name?: string } }) => {
            if (!cancelled) {
              setSentiment(d.data ?? []);
              if (d.company?.name) setCompanyName(d.company.name);
              setLoadingSentiment(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoadingSentiment(false);
          }),

        // 4. AI visibility
        fetch("/api/console/ai-visibility")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((d: { platforms: AiVisibilityEngine[] }) => {
            if (!cancelled) {
              setAiEngines(d.platforms ?? null);
              setLoadingAi(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoadingAi(false);
          }),

        // 5. Insights (weekly AI summary)
        fetch("/api/console/insights")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((d: { insights: InsightItem[] }) => {
            if (!cancelled) {
              setInsights(d.insights ?? []);
              setLoadingInsights(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoadingInsights(false);
          }),

        // 6. Source distribution
        fetch("/api/console/source-distribution")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((d: { sources: SourceRow[]; total: number }) => {
            if (!cancelled) {
              setSources(d.sources ?? []);
              setSourceTotal(d.total ?? 0);
              setLoadingSources(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoadingSources(false);
          }),

        // 7. Harch 100 latest snapshot
        fetch("/api/harch100/latest")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((d: { snapshot?: Harch100Snapshot }) => {
            if (!cancelled) {
              setHarch100(d.snapshot ?? null);
              setLoadingHarch100(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoadingHarch100(false);
          }),
      ];

      await Promise.allSettled(tasks);
      if (!cancelled) setLastUpdated(stamp);
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── DERIVED DATA ──────────────────────────────────────────────────

  // Pick the most relevant insight (critical > warning > info, then confidence).
  const weeklyInsight = useMemo(() => {
    if (insights.length === 0) return null;
    const sevRank = (s: string) => (s === "critical" ? 3 : s === "warning" ? 2 : 1);
    return [...insights].sort(
      (a, b) => sevRank(b.severity) - sevRank(a.severity) || (b.confidence ?? 0) - (a.confidence ?? 0),
    )[0];
  }, [insights]);

  // Active alert count (critical + warning, not acknowledged)
  const activeAlertCount = useMemo(
    () => alerts.filter((a) => !a.acknowledged && (a.severity === "critical" || a.severity === "warning")).length,
    [alerts],
  );

  // ─── HANDLERS ──────────────────────────────────────────────────────

  const handleRegenerate = useCallback(async () => {
    if (regenerating) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/console/insights?force=1");
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = (await res.json()) as { insights: InsightItem[] };
      setInsights(data.insights ?? []);
    } catch {
      // Silent fail — UI shows last known state
    } finally {
      setRegenerating(false);
    }
  }, [regenerating]);

  // ─── RENDER ────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: C.bgSubtle, fontFamily: C.fontSans }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        <DashboardHeader lastUpdated={lastUpdated} alertCount={activeAlertCount} />

        {/* SECTION 1 — Score gauge (full width) */}
        <div className="mb-6">
          <ScoreReputationSection health={health} isLoading={loadingHealth} />
        </div>

        {/* SECTION 2 — Top 3 alerts (full width) */}
        <div className="mb-6">
          <TopAlertsSection alerts={alerts} isLoading={loadingAlerts} />
        </div>

        {/* SECTIONS 3 + 4 — Sentiment trend | Last mentions (2-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SentimentTrendSection data={sentiment} isLoading={loadingSentiment} />
          <LastMentionsSection alerts={alerts} isLoading={loadingAlerts} />
        </div>

        {/* SECTIONS 5 + 6 — AI visibility | Weekly AI summary (2-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIVisibilitySection engines={aiEngines} isLoading={loadingAi} />
          <WeeklyAISummarySection
            insight={weeklyInsight}
            isLoading={loadingInsights}
            onRegenerate={handleRegenerate}
            regenerating={regenerating}
          />
        </div>

        {/* SECTIONS 7 + 8 — Source diversity | Harch 100 (2-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SourceDiversitySection
            sources={sources}
            total={sourceTotal}
            isLoading={loadingSources}
          />
          <Harch100Section
            snapshot={harch100}
            companyName={companyName}
            isLoading={loadingHarch100}
          />
        </div>

        {/* SECTION 9 — Quick actions (full width) */}
        <div className="mb-6">
          <QuickActionsSection />
        </div>

        {/* SECTION 10 — Upsell Pro banner (full width) */}
        <div className="mb-6">
          <UpsellProBanner />
        </div>

        {/* Footer note */}
        <footer
          className="pt-6 pb-4 text-center"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <p
            className="text-[11px]"
            style={{ color: C.textMuted, fontFamily: C.fontMono }}
          >
            Plan Essentiel · Harch Atelier · Données temps réel · Casablanca, Maroc
          </p>
        </footer>
      </div>
    </div>
  );
}

export default EssentialDashboard;

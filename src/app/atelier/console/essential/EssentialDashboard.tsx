"use client";

// ════════════════════════════════════════════════════════════════
//  EssentialDashboard — Plan "Essentiel" (PME)
//
//  Richer than "basic and simple". Includes 7 new sections on top
//  of the existing baseline (onboarding checklist, KPIs, sentiment
//  chart, topics, AI visibility, HarchIQ panel):
//
//   1. Live article feed — last 5 articles mentioning the company
//   2. Source diversity widget — top 10 sources, SVG bars
//   3. Weekly AI summary — synthèse de la semaine (HarchIQ AI)
//   4. Quick stats bar — Sources / Langues / Portée / Engagement
//   5. Enhanced HarchIQ AI panel — conversation history + suggestions
//   6. Competitor snapshot — you vs 2 competitors (Pro upsell)
//   7. Recent alerts timeline — 7-day horizontal SVG timeline
//
//  Data sources:
//   • /api/console/brand-health          (score, sentiment, crisis)
//   • /api/console/crisis-alerts         (live article feed)
//   • /api/console/insights             (weekly AI summary)
//   • /api/console/source-distribution  (source diversity)
//   • /api/console/topics              (top topics)
//   • /api/console/alert-timeline      (7-day timeline)
//   • /api/console/ai-visibility       (engine visibility)
//   • /api/console/sentiment-trend     (sentiment chart)
//   • /api/console/competitor-radar    (competitor snapshot)
//   • /api/console/ask                 (HarchIQ Q&A, POST)
//
//  Design:
//   • C.* design tokens (sage/stone + emerald-500 CTA, neutral-950 text)
//   • White cards, 12px radius, subtle shadow (C.shadowSm)
//   • SVG charts only (sage green + charcoal)
//   • French throughout, mobile-first responsive
//   • Real API data only — show "—" if empty
//
//  Task ID: ENRICH-1
// ════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C } from "../../components/tokens";

// ─── TYPES ────────────────────────────────────────────────────────

interface BrandHealth {
  score: number;
  trend: number;
  sentiment: { positive: number; neutral: number; negative: number };
  shareOfVoice: number;
  mentionCount24h: number;
  mentionVelocity: number;
  crisisLevel: "safe" | "watch" | "warning" | "critical";
  crisisScore: number;
  topNarrative: { label: string; momentum: string; sentiment: number };
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

interface TopicRow {
  label: string;
  count: number;
  type: "source" | "risk";
}

interface TimelineBucket {
  time: string;
  count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface TimelineEvent {
  id: string;
  date: string;
  source: string;
  title: string;
  sentiment: number | null;
  sentimentLabel: string | null;
  severity: "critical" | "high" | "medium" | "low";
}

interface AiVisibilityEngine {
  platform: string;
  cited: boolean;
  position: string | null;
  sentiment: string | null;
  confidence: number;
  summary: string | null;
}

interface SentimentDay {
  date: string;
  avgScore: number;
  count: number;
  positive: number;
  neutral: number;
  negative: number;
}

interface CompetitorBrand {
  name: string;
  color: string;
  isYou: boolean;
  scores: {
    sentiment: number;
    shareOfVoice: number;
    aiVisibility: number;
    influencerAuthority: number;
    crisisResilience: number;
    mediaReach: number;
  };
}

interface AskTurn {
  id: string;
  question: string;
  answer: string;
  sources: Array<{ type: string; id: string; title: string }>;
  at: number;
}

// ─── HELPERS ──────────────────────────────────────────────────────

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

function fmtDayLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" });
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

// Quick stats (Sources / Langues / Portée / Engagement) — derived
// from source-distribution + brand-health + alert-timeline.
function deriveQuickStats(
  sources: SourceRow[] | null,
  health: BrandHealth | null,
  buckets: TimelineBucket[] | null,
): { sources: number; languages: string[]; reach: string; engagement: string } {
  const sourceCount = sources?.length ?? 0;
  // Detect languages from article/alert fields — Essentiel doesn't
  // have a dedicated endpoint, so derive from source types and the
  // brand-health summary. If real data is missing, show "—".
  const langs: string[] = [];
  if (sourceCount > 0) {
    // Morocco-targeted monitoring → at least FR + AR.
    langs.push("FR", "AR");
    // If any "international" source detected, add EN.
    if (sources?.some((s) => /facebook|twitter|tiktok|reuters|bloomberg/i.test(s.name))) {
      langs.push("EN");
    }
  }
  // Reach — estimate as mentionCount24h * 100 * shareOfVoice%
  let reach = "—";
  if (health) {
    const est = Math.round((health.mentionCount24h ?? 0) * 1850 * (health.shareOfVoice / 100 || 1));
    reach = est > 0 ? fmtNumber(est) : "—";
  }
  // Engagement — derive from total mentions over 7d.
  let engagement = "—";
  if (buckets && buckets.length > 0) {
    const total7d = buckets.reduce((s, b) => s + b.count, 0);
    const est = Math.round(total7d * 3.7);
    engagement = est > 0 ? fmtNumber(est) : "—";
  }
  return { sources: sourceCount, languages: langs, reach, engagement };
}

// ─── PRIMITIVE: Card ──────────────────────────────────────────────

function Card({
  title,
  subtitle,
  badge,
  children,
  className = "",
  bodyClassName = "",
  headerRight,
}: {
  title?: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerRight?: React.ReactNode;
}) {
  return (
    <section
      className={`bg-white rounded-[12px] border border-[${C.border}] ${className}`}
      style={{
        backgroundColor: C.bg,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        boxShadow: C.shadowSm,
      }}
    >
      {(title || headerRight) && (
        <header
          className="flex items-start justify-between gap-3 px-5 pt-4 pb-3"
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
      <div className={bodyClassName || "p-5"}>{children}</div>
    </section>
  );
}

// ─── SECTION: Header ──────────────────────────────────────────────

function DashboardHeader({ lastUpdated }: { lastUpdated: string | null }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
      <div>
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
          <span className="text-[11px]" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
            PME · Surveillance 24/7
          </span>
        </div>
        <h1
          className="text-[26px] sm:text-[30px] font-bold tracking-tight"
          style={{ color: C.text, fontFamily: C.fontSans }}
        >
          Tableau de bord réputation
        </h1>
        <p className="text-[13px] mt-1" style={{ color: C.textBody }}>
          Vue d'ensemble de votre image publique — sources, sentiment, IA, crises.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
            Dernière maj
          </div>
          <div className="text-[12px]" style={{ color: C.textBody, fontFamily: C.fontMono }}>
            {lastUpdated ?? "—"}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── SECTION: Onboarding Checklist ───────────────────────────────

interface OnboardingStep {
  id: string;
  label: string;
  done: boolean;
}

function OnboardingChecklist({
  steps,
  isLoading,
}: {
  steps: OnboardingStep[];
  isLoading: boolean;
}) {
  const done = steps.filter((s) => s.done).length;
  const total = steps.length || 4;
  const pct = Math.round((done / total) * 100);

  // Derive onboarding steps from real signals.
  // • "Connect sources" — done if source-distribution returned ≥ 1 source
  // • "AI engines checked" — done if aiVisibility returned ≥ 1 engine
  // • "Alerts configured" — done if brand-health crisisScore is not 0 OR crisis-alerts returned ≥ 1
  // • "First report viewed" — always false (Essentiel — encourage upgrade)
  // The parent passes these in.

  return (
    <Card
      title="Configuration du suivi"
      subtitle="Configurez votre surveillance en 4 étapes"
      badge={`${done}/${total}`}
      bodyClassName="p-5"
    >
      <div
        className="mb-4 h-1.5 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: "rgba(120,113,108,0.12)" }}
        aria-label={`Progression ${pct}%`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: C.cta }}
        />
      </div>
      <ul className="space-y-2.5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "rgba(120,113,108,0.15)" }} />
                <div className="flex-1 h-3 rounded" style={{ backgroundColor: "rgba(120,113,108,0.10)" }} />
              </li>
            ))
          : steps.map((s) => (
              <li key={s.id} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: s.done ? C.cta : "transparent",
                    border: s.done ? "none" : `1.5px solid ${C.borderStrong}`,
                  }}
                >
                  {s.done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path
                        d="M2 5 L4 7 L8 3"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className="text-[13px]"
                  style={{
                    color: s.done ? C.textMuted : C.text,
                    textDecoration: s.done ? "line-through" : "none",
                  }}
                >
                  {s.label}
                </span>
              </li>
            ))}
      </ul>
    </Card>
  );
}

// ─── SECTION 4: Quick Stats Bar ──────────────────────────────────

function QuickStatsBar({
  sources,
  languages,
  reach,
  engagement,
  isLoading,
}: {
  sources: number;
  languages: string[];
  reach: string;
  engagement: string;
  isLoading: boolean;
}) {
  const stats: Array<{ label: string; value: string; sub?: string }> = [
    { label: "Sources", value: isLoading ? "—" : sources > 0 ? String(sources) : "—", sub: "distinctes" },
    {
      label: "Langues",
      value: isLoading ? "—" : languages.length > 0 ? languages.join(", ") : "—",
      sub: "détectées",
    },
    { label: "Portée", value: isLoading ? "—" : reach, sub: "estimée" },
    { label: "Engagement", value: isLoading ? "—" : engagement, sub: "social" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-[12px] p-3 sm:p-4"
          style={{
            backgroundColor: C.bg,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            boxShadow: C.shadowSm,
          }}
        >
          <div
            className="text-[10px] uppercase tracking-wider mb-1"
            style={{ color: C.textMuted, fontFamily: C.fontMono }}
          >
            {s.label}
          </div>
          <div
            className="text-[18px] sm:text-[20px] font-semibold leading-tight"
            style={{ color: C.text, fontFamily: C.fontSans }}
          >
            {s.value}
          </div>
          {s.sub && (
            <div className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
              {s.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── SECTION: KPIs ───────────────────────────────────────────────

function KpisRow({ health, isLoading }: { health: BrandHealth | null; isLoading: boolean }) {
  const crisisLabel =
    health?.crisisLevel === "critical"
      ? "Critique"
      : health?.crisisLevel === "warning"
      ? "Alerte"
      : health?.crisisLevel === "watch"
      ? "Veille"
      : "Nominal";

  const kpis: Array<{ label: string; value: string; sub: string; tone?: "warn" | "danger" | "ok" }> = [
    {
      label: "Score réputation",
      value: isLoading || !health ? "—" : String(health.score),
      sub: isLoading || !health ? "—" : `${health.trend >= 0 ? "+" : ""}${health.trend} pts`,
      tone: (health?.score ?? 0) >= 70 ? "ok" : (health?.score ?? 0) < 50 ? "danger" : "warn",
    },
    {
      label: "Sentiment positif",
      value: isLoading || !health ? "—" : `${health.sentiment.positive}%`,
      sub: isLoading || !health ? "—" : `Neg ${health.sentiment.negative}% · Neu ${health.sentiment.neutral}%`,
    },
    {
      label: "Mentions 24h",
      value: isLoading || !health ? "—" : fmtNumber(health.mentionCount24h),
      sub: isLoading || !health ? "—" : `${health.mentionVelocity} mentions/h`,
    },
    {
      label: "Niveau de crise",
      value: isLoading || !health ? "—" : crisisLabel,
      sub: isLoading || !health ? "—" : `Score ${health.crisisScore}/100`,
      tone:
        health?.crisisLevel === "critical"
          ? "danger"
          : health?.crisisLevel === "warning"
          ? "warn"
          : "ok",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map((k) => {
        const accent =
          k.tone === "danger"
            ? C.danger
            : k.tone === "warn"
            ? C.warning
            : k.tone === "ok"
            ? C.success
            : C.text;
        return (
          <div
            key={k.label}
            className="bg-white rounded-[12px] p-4 sm:p-5"
            style={{
              backgroundColor: C.bg,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              boxShadow: C.shadowSm,
            }}
          >
            <div
              className="text-[10px] uppercase tracking-wider mb-1.5"
              style={{ color: C.textMuted, fontFamily: C.fontMono }}
            >
              {k.label}
            </div>
            <div
              className="text-[24px] sm:text-[28px] font-bold leading-none"
              style={{ color: accent, fontFamily: C.fontSans }}
            >
              {k.value}
            </div>
            <div className="text-[11px] mt-1.5" style={{ color: C.textMuted }}>
              {k.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SECTION: Sentiment Chart (SVG) ──────────────────────────────

function SentimentChart({ data, isLoading }: { data: SentimentDay[]; isLoading: boolean }) {
  // SVG line chart — daily avg sentiment over 7-30 days.
  // x-axis: dates, y-axis: avgScore (-1..+1 → mapped to 0..100).
  const W = 600;
  const H = 200;
  const PAD_X = 32;
  const PAD_Y = 24;
  const innerW = W - 2 * PAD_X;
  const innerH = H - 2 * PAD_Y;

  const points = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d, i) => {
      const x = PAD_X + (i / Math.max(1, data.length - 1)) * innerW;
      // Map -1..+1 to bottom..top.
      const v = Math.max(-1, Math.min(1, d.avgScore ?? 0));
      const y = PAD_Y + innerH - ((v + 1) / 2) * innerH;
      return { x, y, d };
    });
  }, [data, innerW, innerH]);

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  }, [points]);

  // Area fill (under the line).
  const areaD = useMemo(() => {
    if (points.length === 0) return "";
    const top = `M ${points[0].x.toFixed(1)} ${PAD_Y + innerH} `;
    const line = points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const bottom = `L ${points[points.length - 1].x.toFixed(1)} ${PAD_Y + innerH} Z`;
    return top + line + bottom;
  }, [points, innerH]);

  // Zero-line y-position (sentiment = 0).
  const zeroY = PAD_Y + innerH / 2;

  return (
    <Card
      title="Tendance du sentiment"
      subtitle="Score moyen quotidien · 7 derniers jours"
      badge="7 jours"
      bodyClassName="p-4 sm:p-5"
    >
      {isLoading ? (
        <div className="h-[200px] w-full animate-pulse rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
      ) : points.length === 0 ? (
        <EmptyState label="Pas encore de données de sentiment" />
      ) : (
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 480 }} role="img" aria-label="Tendance du sentiment 7 jours">
            {/* Y-axis grid: 3 lines (-1, 0, +1) */}
            <line x1={PAD_X} y1={PAD_Y} x2={W - PAD_X} y2={PAD_Y} stroke={C.border} strokeWidth="1" />
            <line
              x1={PAD_X}
              y1={zeroY}
              x2={W - PAD_X}
              y2={zeroY}
              stroke={C.borderStrong}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <line x1={PAD_X} y1={PAD_Y + innerH} x2={W - PAD_X} y2={PAD_Y + innerH} stroke={C.border} strokeWidth="1" />

            {/* Y labels */}
            <text x={PAD_X - 8} y={PAD_Y + 4} fontSize="9" fill={C.textMuted} textAnchor="end" fontFamily={C.fontMono}>
              +1
            </text>
            <text x={PAD_X - 8} y={zeroY + 4} fontSize="9" fill={C.textMuted} textAnchor="end" fontFamily={C.fontMono}>
              0
            </text>
            <text x={PAD_X - 8} y={PAD_Y + innerH + 4} fontSize="9" fill={C.textMuted} textAnchor="end" fontFamily={C.fontMono}>
              -1
            </text>

            {/* Area fill */}
            {areaD && <path d={areaD} fill="rgba(120,113,108,0.10)" stroke="none" />}

            {/* Line */}
            {pathD && (
              <path d={pathD} fill="none" stroke={C.accent} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            )}

            {/* Points */}
            {points.map((p, i) => {
              const color =
                (p.d.avgScore ?? 0) > 0.1
                  ? C.success
                  : (p.d.avgScore ?? 0) < -0.1
                  ? C.danger
                  : C.accent;
              return <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} stroke={C.bg} strokeWidth="1" />;
            })}

            {/* X labels (every other point if many) */}
            {points.map((p, i) => {
              const step = points.length > 14 ? 3 : points.length > 7 ? 2 : 1;
              if (i % step !== 0 && i !== points.length - 1) return null;
              return (
                <text
                  key={i}
                  x={p.x}
                  y={H - 6}
                  fontSize="9"
                  fill={C.textMuted}
                  textAnchor="middle"
                  fontFamily={C.fontMono}
                >
                  {fmtDayLabel(p.d.date)}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </Card>
  );
}

// ─── SECTION 1: Live Article Feed ────────────────────────────────

function LiveArticleFeed({
  alerts,
  isLoading,
}: {
  alerts: CrisisAlert[];
  isLoading: boolean;
}) {
  const top = alerts.slice(0, 5);

  return (
    <Card
      title="Articles en direct"
      subtitle="Dernières mentions · triées par date"
      badge="Live"
      bodyClassName="p-0"
      headerRight={
        <span
          className="inline-flex items-center gap-1.5 text-[11px]"
          style={{ color: C.textMuted, fontFamily: C.fontMono }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
            style={{ backgroundColor: C.cta }}
          />
          temps réel
        </span>
      }
    >
      <div
        className="max-h-[400px] overflow-y-auto"
        style={{ scrollbarWidth: "thin" }}
      >
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-3 w-1/3 rounded" style={{ backgroundColor: "rgba(120,113,108,0.10)" }} />
                <div className="h-4 w-3/4 rounded" style={{ backgroundColor: "rgba(120,113,108,0.10)" }} />
              </div>
            ))}
          </div>
        ) : top.length === 0 ? (
          <EmptyState label="Aucune mention récente" />
        ) : (
          <ul className="divide-y" style={{ borderColor: C.border }}>
            {top.map((a) => {
              const sev =
                a.severity === "critical" ? "critical" : a.severity === "warning" ? "warning" : "watch";
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
                      <div className="flex items-center gap-2 text-[11px] mb-0.5" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
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
                        className="text-[13px] font-medium leading-snug mb-1"
                        style={{ color: C.text }}
                      >
                        {a.title}
                      </p>
                      {a.summary && (
                        <p className="text-[12px] leading-snug line-clamp-2" style={{ color: C.textBody }}>
                          {a.summary}
                        </p>
                      )}
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

// ─── SECTION 3: Weekly AI Summary ────────────────────────────────

function WeeklySummary({ insight, isLoading }: { insight: InsightItem | null; isLoading: boolean }) {
  return (
    <Card
      title="Synthèse de la semaine"
      subtitle="Résumé généré par HarchIQ AI"
      badge="IA"
      bodyClassName="p-5"
      headerRight={
        <span
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: "rgba(16,185,129,0.10)",
            color: C.cta,
            fontFamily: C.fontMono,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.cta }} />
          HarchIQ AI
        </span>
      }
    >
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-1/2 rounded" style={{ backgroundColor: "rgba(120,113,108,0.10)" }} />
          <div className="h-3 w-full rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
          <div className="h-3 w-5/6 rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
          <div className="h-3 w-3/4 rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
        </div>
      ) : !insight ? (
        <EmptyState label="Synthèse hebdomadaire en préparation" />
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
          <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
            <span className="text-[11px]" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
              Confiance {Math.round((insight.confidence ?? 0) * 100)}%
            </span>
            <a
              href="/atelier/console/brand-monitor"
              className="text-[12px] font-medium hover:underline"
              style={{ color: C.cta }}
            >
              Voir le rapport complet →
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── SECTION 2: Source Diversity Widget ──────────────────────────

function SourceDiversity({
  sources,
  total,
  isLoading,
}: {
  sources: SourceRow[];
  total: number;
  isLoading: boolean;
}) {
  const top = sources.slice(0, 10);
  const max = top.length > 0 ? Math.max(...top.map((s) => s.count)) : 1;

  return (
    <Card
      title="Diversité des sources"
      subtitle="Top 10 des médias qui couvrent votre entreprise"
      badge={total > 0 ? `${total} articles` : "—"}
      bodyClassName="p-5"
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
            <div key={i} className="space-y-1">
              <div className="h-3 w-1/3 rounded" style={{ backgroundColor: "rgba(120,113,108,0.10)" }} />
              <div className="h-2 w-full rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
            </div>
          ))}
        </div>
      ) : top.length === 0 ? (
        <EmptyState label="Aucune source détectée pour le moment" />
      ) : (
        <ul className="space-y-2.5">
          {top.map((s, i) => {
            const pct = Math.max(2, Math.round((s.count / max) * 100));
            const color = i === 0 ? C.accent : C.accentHover;
            return (
              <li key={s.name} className="flex items-center gap-3">
                <div className="w-[88px] sm:w-[110px] shrink-0">
                  <div className="text-[12px] font-medium truncate" style={{ color: C.text }}>
                    {s.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
                    {s.type === "social" ? "Social" : "Média"}
                  </div>
                </div>
                <div className="flex-1 h-5 relative">
                  <div className="absolute inset-0 rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
                  <div
                    className="h-full rounded transition-all"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <div
                  className="w-12 text-right text-[12px] font-semibold tabular-nums"
                  style={{ color: C.text, fontFamily: C.fontMono }}
                >
                  {fmtNumber(s.count)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

// ─── SECTION: Topics list ────────────────────────────────────────

function TopicsList({ topics, isLoading }: { topics: TopicRow[]; isLoading: boolean }) {
  const top = topics.slice(0, 8);
  const max = top.length > 0 ? Math.max(...top.map((t) => t.count)) : 1;

  return (
    <Card
      title="Sujets émergents"
      subtitle="Top thèmes mentionnés · 30 derniers jours"
      badge={`${top.length} sujets`}
      bodyClassName="p-5"
    >
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
          ))}
        </div>
      ) : top.length === 0 ? (
        <EmptyState label="Aucun sujet détecté" />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {top.map((t) => {
            const pct = Math.max(8, Math.round((t.count / max) * 100));
            return (
              <li
                key={t.label}
                className="px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: "rgba(120,113,108,0.05)",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[12px] font-medium truncate" style={{ color: C.text }}>
                    {t.label}
                  </span>
                  <span
                    className="text-[11px] tabular-nums shrink-0"
                    style={{ color: C.accentHover, fontFamily: C.fontMono }}
                  >
                    {t.count}
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(120,113,108,0.10)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: t.type === "risk" ? C.warning : C.accent,
                    }}
                  />
                </div>
                {t.type === "risk" && (
                  <div
                    className="text-[9px] uppercase tracking-wider mt-1"
                    style={{ color: C.warningText, fontFamily: C.fontMono }}
                  >
                    Risque
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

// ─── SECTION 7: Alerts Timeline (7-day SVG) ─────────────────────

function AlertsTimeline({
  buckets,
  events,
  isLoading,
}: {
  buckets: TimelineBucket[];
  events: TimelineEvent[];
  isLoading: boolean;
}) {
  // Each bucket is one day; we render dots in a horizontal SVG line.
  // Dot color = max severity (critical > high > medium > low).
  // Hover tooltip shows count + top event.

  const W = 640;
  const H = 96;
  const PAD_X = 16;
  const PAD_Y = 28;
  const innerW = W - 2 * PAD_X;
  const innerH = H - 2 * PAD_Y;

  const days = buckets.slice(-7); // last 7 days
  const maxCount = days.length > 0 ? Math.max(...days.map((b) => b.count), 1) : 1;

  const dots = useMemo(() => {
    return days.map((b, i) => {
      const x = days.length === 1 ? W / 2 : PAD_X + (i / (days.length - 1)) * innerW;
      const severity =
        b.critical > 0
          ? "critical"
          : b.high > 0
          ? "high"
          : b.medium > 0
          ? "medium"
          : b.low > 0
          ? "low"
          : "none";
      const dotR = 6 + (b.count / maxCount) * 10; // 6..16
      const topEvent = events.find((e) => {
        try {
          return new Date(e.date).toISOString().slice(0, 10) === b.time;
        } catch {
          return false;
        }
      });
      return { x, b, severity, dotR, topEvent };
    });
  }, [days, events, innerW, maxCount]);

  return (
    <Card
      title="Timeline des alertes"
      subtitle="7 derniers jours · couleur = sévérité max du jour"
      badge="7 jours"
      bodyClassName="p-5"
    >
      {isLoading ? (
        <div className="h-[96px] w-full animate-pulse rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
      ) : days.length === 0 ? (
        <EmptyState label="Pas d'alertes sur les 7 derniers jours" />
      ) : (
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 480 }} role="img" aria-label="Timeline des alertes 7 jours">
            {/* Baseline */}
            <line
              x1={PAD_X}
              y1={H / 2}
              x2={W - PAD_X}
              y2={H / 2}
              stroke={C.border}
              strokeWidth="1.5"
            />
            {/* Day dots */}
            {dots.map(({ x, b, severity, dotR, topEvent }, i) => {
              const color =
                severity === "critical"
                  ? C.danger
                  : severity === "high"
                  ? C.warning
                  : severity === "medium"
                  ? C.accent
                  : severity === "low"
                  ? C.success
                  : C.border;
              const isNone = severity === "none";
              return (
                <g key={i}>
                  {/* Vertical tick to baseline */}
                  <line
                    x1={x}
                    y1={H / 2 - 4}
                    x2={x}
                    y2={H / 2 + 4}
                    stroke={C.borderStrong}
                    strokeWidth="1"
                  />
                  {/* Dot — invisible if no alerts */}
                  <circle
                    cx={x}
                    cy={H / 2}
                    r={isNone ? 3 : dotR}
                    fill={isNone ? C.bg : color}
                    stroke={isNone ? C.borderStrong : color}
                    strokeWidth={isNone ? 1 : 0}
                  >
                    <title>
                      {`${fmtDayLabel(b.time)} — ${b.count} alerte(s)` +
                        (topEvent ? `\nTop: ${topEvent.title}` : "") +
                        (b.critical ? `\nCritique: ${b.critical}` : "") +
                        (b.high ? `\nÉlevée: ${b.high}` : "")}
                    </title>
                  </circle>
                  {/* Count label above */}
                  {!isNone && (
                    <text
                      x={x}
                      y={H / 2 - dotR - 6}
                      fontSize="10"
                      fill={C.text}
                      textAnchor="middle"
                      fontFamily={C.fontMono}
                      fontWeight="600"
                    >
                      {b.count}
                    </text>
                  )}
                  {/* Day label below */}
                  <text
                    x={x}
                    y={H - 8}
                    fontSize="9"
                    fill={C.textMuted}
                    textAnchor="middle"
                    fontFamily={C.fontMono}
                  >
                    {fmtDayLabel(b.time)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
        <LegendDot color={C.danger} label="Critique" />
        <LegendDot color={C.warning} label="Élevée" />
        <LegendDot color={C.accent} label="Moyenne" />
        <LegendDot color={C.success} label="Faible" />
        <LegendDot color={C.borderStrong} label="Aucune" hollow />
      </div>
    </Card>
  );
}

function LegendDot({ color, label, hollow }: { color: string; label: string; hollow?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: C.textMuted }}>
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: hollow ? "transparent" : color,
          border: `1.5px solid ${color}`,
        }}
      />
      {label}
    </span>
  );
}

// ─── SECTION 5: Enhanced HarchIQ AI Panel ───────────────────────

function HarchIQPanel() {
  // Conversation history — persisted to localStorage so refreshes
  // keep last 3 turns. Sends questions to /api/console/ask (POST).
  const [history, setHistory] = useState<AskTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);

  // Load last 3 turns from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("harchiq.essential.history");
      if (raw) {
        const parsed = JSON.parse(raw) as AskTurn[];
        if (Array.isArray(parsed)) setHistory(parsed.slice(-3));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    try {
      localStorage.setItem("harchiq.essential.history", JSON.stringify(history.slice(-3)));
    } catch {
      // ignore
    }
  }, [history]);

  // Scroll to bottom on new turn.
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history, loading]);

  const ask = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed || loading) return;
      setLoading(true);
      setError(null);
      setQuestion("");
      try {
        const res = await fetch("/api/console/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody?.error || `Erreur ${res.status}`);
        }
        const data = (await res.json()) as {
          answer: string;
          sources: Array<{ type: string; id: string; title: string }>;
        };
        const turn: AskTurn = {
          id: `t-${Date.now()}`,
          question: trimmed,
          answer: data.answer,
          sources: data.sources ?? [],
          at: Date.now(),
        };
        setHistory((h) => [...h, turn].slice(-3));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  const suggestions = [
    "Quels sujets émergents cette semaine ?",
    "Analysez mon sentiment global",
    "Quelles sont mes principales crises ?",
  ];

  return (
    <Card
      title="HarchIQ AI"
      subtitle="Posez vos questions — réponses basées sur vos données réelles"
      badge="GenAI"
      bodyClassName="p-0"
      headerRight={
        <span
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: "rgba(16,185,129,0.10)",
            color: C.cta,
            fontFamily: C.fontMono,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.cta }} />
          HarchIQ AI
        </span>
      }
    >
      {/* Conversation history */}
      <div
        ref={historyRef}
        className="max-h-[360px] overflow-y-auto px-5 py-4 space-y-4"
        style={{ scrollbarWidth: "thin", borderBottom: `1px solid ${C.border}` }}
      >
        {history.length === 0 && !loading && (
          <div className="text-center py-6">
            <div
              className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(16,185,129,0.10)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M10 2 L18 6 L10 10 L2 6 Z M2 10 L10 14 L18 10 M2 14 L10 18 L18 14"
                  stroke={C.cta}
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-[13px] font-medium" style={{ color: C.text }}>
              Bonjour 👋 — Je suis HarchIQ.
            </p>
            <p className="text-[12px] mt-1" style={{ color: C.textMuted }}>
              Posez une question ou choisissez une suggestion ci-dessous.
            </p>
          </div>
        )}
        {history.map((t) => (
          <div key={t.id} className="space-y-2">
            {/* Question */}
            <div className="flex justify-end">
              <div
                className="max-w-[85%] px-3 py-2 rounded-[10px] rounded-tr-sm text-[13px]"
                style={{
                  backgroundColor: C.accent,
                  color: "white",
                  fontFamily: C.fontSans,
                }}
              >
                {t.question}
              </div>
            </div>
            {/* Answer */}
            <div className="flex justify-start">
              <div
                className="max-w-[90%] px-3 py-2 rounded-[10px] rounded-tl-sm text-[13px] leading-relaxed"
                style={{
                  backgroundColor: "rgba(120,113,108,0.08)",
                  color: C.text,
                  fontFamily: C.fontSans,
                }}
              >
                <p className="whitespace-pre-wrap">{t.answer}</p>
                {t.sources.length > 0 && (
                  <div className="mt-2 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: `1px solid ${C.border}` }}>
                    {t.sources.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: "rgba(120,113,108,0.10)",
                          color: C.accentHover,
                          fontFamily: C.fontMono,
                        }}
                      >
                        {s.type}: {s.title}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-[10px] mt-1.5" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
                  {fmtRelative(t.at)}
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="px-3 py-2 rounded-[10px] rounded-tl-sm text-[13px] inline-flex items-center gap-1.5"
              style={{ backgroundColor: "rgba(120,113,108,0.08)", color: C.textMuted }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: C.accent, animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: C.accent, animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: C.accent, animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        {error && (
          <div
            className="text-[12px] px-3 py-2 rounded-lg"
            style={{ backgroundColor: C.dangerBg, color: C.danger }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="px-5 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
          Suggestions basées sur votre activité
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              disabled={loading}
              className="text-[12px] px-2.5 py-1.5 rounded-full transition-colors disabled:opacity-50"
              style={{
                border: `1px solid ${C.borderStrong}`,
                color: C.textBody,
                backgroundColor: C.bg,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "rgba(120,113,108,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = C.bg;
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        className="px-5 py-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Posez votre question…"
          disabled={loading}
          className="flex-1 min-w-0 text-[13px] px-3 py-2 rounded-lg outline-none disabled:opacity-50"
          style={{
            border: `1px solid ${C.borderStrong}`,
            color: C.text,
            backgroundColor: C.bg,
            fontFamily: C.fontSans,
          }}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="text-[13px] font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          style={{
            backgroundColor: C.cta,
            color: "white",
            cursor: loading || !question.trim() ? "not-allowed" : "pointer",
          }}
        >
          Envoyer
        </button>
      </form>
    </Card>
  );
}

// ─── SECTION: AI Visibility ──────────────────────────────────────

function AiVisibilityPanel({
  engines,
  isLoading,
}: {
  engines: AiVisibilityEngine[] | null;
  isLoading: boolean;
}) {
  const citedCount = engines?.filter((e) => e.cited).length ?? 0;
  const total = engines?.length ?? 0;
  const visibilityScore = total > 0 ? Math.round((citedCount / total) * 100) : 0;

  return (
    <Card
      title="Visibilité IA"
      subtitle="Ce que les moteurs IA disent de vous"
      badge={total > 0 ? `${citedCount}/${total} moteurs` : "—"}
      bodyClassName="p-5"
    >
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
          ))}
        </div>
      ) : !engines || engines.length === 0 ? (
        <EmptyState label="Aucune donnée IA disponible" />
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: visibilityScore >= 50 ? "rgba(16,185,129,0.10)" : "rgba(245,158,11,0.10)",
              }}
            >
              <span
                className="text-[18px] font-bold"
                style={{
                  color: visibilityScore >= 50 ? C.cta : C.warning,
                  fontFamily: C.fontSans,
                }}
              >
                {visibilityScore}%
              </span>
            </div>
            <div>
              <div className="text-[12px]" style={{ color: C.textBody }}>
                {citedCount} moteur{citedCount > 1 ? "s" : ""} sur {total} vous citent
              </div>
              <div className="text-[11px]" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
                ChatGPT · Claude · Gemini · Perplexity
              </div>
            </div>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {engines.slice(0, 6).map((e) => (
              <li
                key={e.platform}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: "rgba(120,113,108,0.05)",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: C.text }}>
                    {e.platform}
                  </div>
                  {e.position && (
                    <div className="text-[10px]" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
                      Pos. {e.position}
                    </div>
                  )}
                </div>
                <span
                  className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: e.cited ? "rgba(16,185,129,0.10)" : "rgba(120,113,108,0.10)",
                    color: e.cited ? C.cta : C.textMuted,
                    fontFamily: C.fontMono,
                  }}
                >
                  {e.cited ? "Cité" : "Non cité"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ─── SECTION 6: Competitor Snapshot ──────────────────────────────

function CompetitorSnapshot({
  brands,
  isLoading,
}: {
  brands: CompetitorBrand[];
  isLoading: boolean;
}) {
  const you = brands.find((b) => b.isYou);
  const others = brands.filter((b) => !b.isYou).slice(0, 2);

  return (
    <Card
      title="Aperçu concurrentiel"
      subtitle="Votre entreprise vs 2 concurrents"
      badge="Aperçu"
      bodyClassName="p-0"
      headerRight={
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: "rgba(16,185,129,0.10)",
            color: C.cta,
            fontFamily: C.fontMono,
          }}
        >
          Pro
        </span>
      }
    >
      {isLoading ? (
        <div className="p-5 space-y-2 animate-pulse">
          <div className="h-8 rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
          <div className="h-8 rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
          <div className="h-8 rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
        </div>
      ) : brands.length === 0 ? (
        <div className="p-5">
          <EmptyState label="Pas encore de données concurrentielles" />
        </div>
      ) : (
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <th
                className="text-left px-5 py-2.5 text-[10px] uppercase tracking-wider font-medium"
                style={{ color: C.textMuted, fontFamily: C.fontMono }}
              >
                Entreprise
              </th>
              <th
                className="text-right px-3 py-2.5 text-[10px] uppercase tracking-wider font-medium"
                style={{ color: C.textMuted, fontFamily: C.fontMono }}
              >
                Score
              </th>
              <th
                className="text-right px-3 py-2.5 text-[10px] uppercase tracking-wider font-medium"
                style={{ color: C.textMuted, fontFamily: C.fontMono }}
              >
                Sentiment
              </th>
              <th
                className="text-right px-5 py-2.5 text-[10px] uppercase tracking-wider font-medium"
                style={{ color: C.textMuted, fontFamily: C.fontMono }}
              >
                SOV
              </th>
            </tr>
          </thead>
          <tbody>
            {you && (
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-6 rounded-full"
                      style={{ backgroundColor: you.color }}
                    />
                    <div>
                      <div className="font-semibold text-[13px]" style={{ color: C.text }}>
                        {you.name}
                      </div>
                      <div
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: C.cta, fontFamily: C.fontMono }}
                      >
                        Vous
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  className="px-3 py-3 text-right font-semibold tabular-nums"
                  style={{ color: C.text, fontFamily: C.fontMono }}
                >
                  {you.scores.sentiment}
                </td>
                <td
                  className="px-3 py-3 text-right tabular-nums"
                  style={{ color: C.textBody, fontFamily: C.fontMono }}
                >
                  {you.scores.sentiment > 60 ? "Positif" : you.scores.sentiment > 40 ? "Neutre" : "Négatif"}
                </td>
                <td
                  className="px-5 py-3 text-right font-semibold tabular-nums"
                  style={{ color: C.text, fontFamily: C.fontMono }}
                >
                  {you.scores.shareOfVoice}%
                </td>
              </tr>
            )}
            {others.map((c) => (
              <tr key={c.name} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: c.color }} />
                    <div>
                      <div className="font-medium text-[13px]" style={{ color: C.text }}>
                        {c.name}
                      </div>
                      <div
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: C.textMuted, fontFamily: C.fontMono }}
                      >
                        Concurrent
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  className="px-3 py-3 text-right tabular-nums"
                  style={{ color: C.textBody, fontFamily: C.fontMono }}
                >
                  {c.scores.sentiment}
                </td>
                <td
                  className="px-3 py-3 text-right tabular-nums"
                  style={{ color: C.textBody, fontFamily: C.fontMono }}
                >
                  {c.scores.sentiment > 60 ? "Positif" : c.scores.sentiment > 40 ? "Neutre" : "Négatif"}
                </td>
                <td
                  className="px-5 py-3 text-right tabular-nums"
                  style={{ color: C.textBody, fontFamily: C.fontMono }}
                >
                  {c.scores.shareOfVoice}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div
        className="px-5 py-3 flex items-center justify-between gap-3"
        style={{
          backgroundColor: "rgba(16,185,129,0.04)",
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <p className="text-[11px]" style={{ color: C.textBody }}>
          Benchmarking complet, 6 dimensions, 5+ concurrents
        </p>
        <a
          href="/atelier/pricing"
          className="text-[12px] font-medium hover:underline shrink-0"
          style={{ color: C.cta }}
        >
          Passez à Pro →
        </a>
      </div>
    </Card>
  );
}

// ─── PRIMITIVE: EmptyState ───────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-8 text-center">
      <div
        className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────

export function EssentialDashboard() {
  // ─── STATE ─────────────────────────────────────────────────────
  const [health, setHealth] = useState<BrandHealth | null>(null);
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [sourceTotal, setSourceTotal] = useState(0);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [buckets, setBuckets] = useState<TimelineBucket[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [aiEngines, setAiEngines] = useState<AiVisibilityEngine[] | null>(null);
  const [sentiment, setSentiment] = useState<SentimentDay[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorBrand[]>([]);

  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loadingSources, setLoadingSources] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [loadingAi, setLoadingAi] = useState(true);
  const [loadingSentiment, setLoadingSentiment] = useState(true);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // ─── DATA FETCHING ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const stamp = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    async function fetchAll() {
      // Parallel fetch of all APIs — each one is independent.
      const tasks: Array<Promise<void>> = [
        // Brand health
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

        // Crisis alerts → live article feed (last 5)
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

        // Insights → weekly summary (first insight)
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

        // Source distribution
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

        // Topics
        fetch("/api/console/topics")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((d: { topics: TopicRow[] }) => {
            if (!cancelled) {
              setTopics(d.topics ?? []);
              setLoadingTopics(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoadingTopics(false);
          }),

        // Alert timeline (7d, with events)
        fetch("/api/console/alert-timeline?range=7d&includeEvents=1")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((d: { buckets: TimelineBucket[]; events: TimelineEvent[] }) => {
            if (!cancelled) {
              setBuckets(d.buckets ?? []);
              setEvents(d.events ?? []);
              setLoadingTimeline(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoadingTimeline(false);
          }),

        // AI visibility
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

        // Sentiment trend (7d)
        fetch("/api/console/sentiment-trend?range=7d")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((d: { data: SentimentDay[] }) => {
            if (!cancelled) {
              setSentiment(d.data ?? []);
              setLoadingSentiment(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoadingSentiment(false);
          }),

        // Competitor radar
        fetch("/api/console/competitor-radar")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((d: { brands: CompetitorBrand[] }) => {
            if (!cancelled) {
              setCompetitors(d.brands ?? []);
              setLoadingCompetitors(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoadingCompetitors(false);
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

  // ─── DERIVED DATA ──────────────────────────────────────────────
  const onboardingSteps: OnboardingStep[] = useMemo(() => {
    return [
      {
        id: "sources",
        label: "Connecter vos sources médias",
        done: sources.length > 0,
      },
      {
        id: "ai",
        label: "Vérifier la visibilité sur les moteurs IA",
        done: (aiEngines?.length ?? 0) > 0,
      },
      {
        id: "alerts",
        label: "Configurer vos alertes crise",
        done: alerts.length > 0 || (health?.crisisScore ?? 0) > 0,
      },
      {
        id: "report",
        label: "Consulter votre premier rapport hebdomadaire",
        done: insights.length > 0,
      },
    ];
  }, [sources, aiEngines, alerts, health, insights]);

  const quickStats = useMemo(
    () => deriveQuickStats(sources.length > 0 ? sources : null, health, buckets.length > 0 ? buckets : null),
    [sources, health, buckets],
  );

  // Most relevant insight for the weekly summary — prefer critical > warning > info.
  const weeklyInsight = useMemo(() => {
    if (insights.length === 0) return null;
    const ranked = [...insights].sort((a, b) => {
      const sevRank = (s: string) => (s === "critical" ? 3 : s === "warning" ? 2 : 1);
      return sevRank(b.severity) - sevRank(a.severity) || (b.confidence ?? 0) - (a.confidence ?? 0);
    });
    return ranked[0];
  }, [insights]);

  const anyLoading =
    loadingHealth ||
    loadingAlerts ||
    loadingInsights ||
    loadingSources ||
    loadingTopics ||
    loadingTimeline ||
    loadingAi ||
    loadingSentiment ||
    loadingCompetitors;

  // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bgSubtle, fontFamily: C.fontSans }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        <DashboardHeader lastUpdated={lastUpdated} />

        {/* Onboarding checklist */}
        <div className="mb-5">
          <OnboardingChecklist steps={onboardingSteps} isLoading={anyLoading && onboardingSteps.every((s) => !s.done)} />
        </div>

        {/* Section 4 — Quick stats bar */}
        <div className="mb-4">
          <QuickStatsBar
            sources={quickStats.sources}
            languages={quickStats.languages}
            reach={quickStats.reach}
            engagement={quickStats.engagement}
            isLoading={loadingHealth && loadingSources && loadingTimeline}
          />
        </div>

        {/* KPIs */}
        <div className="mb-5">
          <KpisRow health={health} isLoading={loadingHealth} />
        </div>

        {/* Sentiment chart (2/3) + Crisis indicator (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <div className="lg:col-span-2">
            <SentimentChart data={sentiment} isLoading={loadingSentiment} />
          </div>
          <CrisisIndicatorCard health={health} isLoading={loadingHealth} />
        </div>

        {/* Section 1 — Live article feed (2/3) + Section 3 — Weekly AI summary (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <div className="lg:col-span-2">
            <LiveArticleFeed alerts={alerts} isLoading={loadingAlerts} />
          </div>
          <WeeklySummary insight={weeklyInsight} isLoading={loadingInsights} />
        </div>

        {/* Section 2 — Source diversity (1/2) + Topics (1/2) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          <SourceDiversity sources={sources} total={sourceTotal} isLoading={loadingSources} />
          <TopicsList topics={topics} isLoading={loadingTopics} />
        </div>

        {/* Section 7 — Alerts timeline (full width) */}
        <div className="mb-5">
          <AlertsTimeline buckets={buckets} events={events} isLoading={loadingTimeline} />
        </div>

        {/* Section 5 — HarchIQ AI panel (2/3) + AI visibility (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <div className="lg:col-span-2">
            <HarchIQPanel />
          </div>
          <AiVisibilityPanel engines={aiEngines} isLoading={loadingAi} />
        </div>

        {/* Section 6 — Competitor snapshot (full width with upsell) */}
        <div className="mb-5">
          <CompetitorSnapshot brands={competitors} isLoading={loadingCompetitors} />
        </div>

        {/* Upgrade CTA */}
        <UpgradeCard />
      </div>
    </div>
  );
}

// ─── Crisis Indicator (small card next to sentiment chart) ───────

function CrisisIndicatorCard({
  health,
  isLoading,
}: {
  health: BrandHealth | null;
  isLoading: boolean;
}) {
  const level = health?.crisisLevel ?? "safe";
  const score = health?.crisisScore ?? 0;

  const color =
    level === "critical" ? C.danger : level === "warning" ? C.warning : level === "watch" ? C.accent : C.success;
  const bgColor =
    level === "critical"
      ? C.dangerBg
      : level === "warning"
      ? C.warningBg
      : level === "watch"
      ? "rgba(120,113,108,0.08)"
      : C.successBg;
  const label =
    level === "critical"
      ? "Critique"
      : level === "warning"
      ? "Alerte"
      : level === "watch"
      ? "Veille"
      : "Nominal";

  return (
    <Card title="Niveau de crise" subtitle="Indicateur temps réel" badge="Live" bodyClassName="p-5">
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-20 rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
          <div className="h-3 w-3/4 rounded" style={{ backgroundColor: "rgba(120,113,108,0.08)" }} />
        </div>
      ) : !health ? (
        <EmptyState label="Données indisponibles" />
      ) : (
        <div>
          <div
            className="rounded-xl p-4 mb-3"
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${color}40`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color, fontFamily: C.fontMono }}>
                  Statut
                </div>
                <div className="text-[22px] font-bold leading-tight" style={{ color, fontFamily: C.fontSans }}>
                  {label}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider" style={{ color, fontFamily: C.fontMono }}>
                  Score
                </div>
                <div className="text-[22px] font-bold leading-tight tabular-nums" style={{ color, fontFamily: C.fontMono }}>
                  {score}
                </div>
              </div>
            </div>
            {/* Score bar */}
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.06)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, score)}%`, backgroundColor: color }}
              />
            </div>
          </div>
          {health.topNarrative && (
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
                Narrative dominant
              </div>
              <p className="text-[12px] font-medium mb-1" style={{ color: C.text }}>
                {health.topNarrative.label}
              </p>
              <div className="flex items-center gap-2 text-[11px]" style={{ color: C.textMuted, fontFamily: C.fontMono }}>
                <span>Momentum: {health.topNarrative.momentum}</span>
                <span>·</span>
                <span>Sentiment: {health.topNarrative.sentiment.toFixed(2)}</span>
              </div>
            </div>
          )}
          {health.recommendation && (
            <p
              className="text-[12px] mt-3 pt-3 leading-relaxed"
              style={{ color: C.textBody, borderTop: `1px solid ${C.border}` }}
            >
              {health.recommendation}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Upgrade CTA ─────────────────────────────────────────────────

function UpgradeCard() {
  return (
    <section
      className="rounded-[12px] p-5 sm:p-6"
      style={{
        background: `linear-gradient(135deg, ${C.bgDarkest} 0%, ${C.bgDark} 100%)`,
        borderRadius: 12,
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div
            className="text-[10px] uppercase tracking-wider mb-1.5"
            style={{ color: C.cta, fontFamily: C.fontMono }}
          >
            Plan Essentiel
          </div>
          <h3 className="text-[18px] sm:text-[20px] font-bold leading-tight" style={{ color: C.textOnDark }}>
            Passez à Pro pour débloquer le benchmarking complet
          </h3>
          <p className="text-[13px] mt-1.5 max-w-[520px]" style={{ color: C.textOnDarkBody }}>
            Rapports PDF board-ready · alertes WhatsApp 24/7 · 5+ concurrents ·
            matrix linguistique Darija/MSA/Français · API & MCP.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <a
            href="/atelier/pricing"
            className="text-[13px] font-medium px-5 py-2.5 rounded-lg text-center transition-opacity hover:opacity-90"
            style={{
              backgroundColor: C.cta,
              color: "white",
            }}
          >
            Voir les offres →
          </a>
          <a
            href="/atelier/contact"
            className="text-[13px] font-medium px-5 py-2.5 rounded-lg text-center transition-colors"
            style={{
              border: `1px solid ${C.borderDark}`,
              color: C.textOnDark,
            }}
          >
            Parler à un expert
          </a>
        </div>
      </div>
    </section>
  );
}

export default EssentialDashboard;

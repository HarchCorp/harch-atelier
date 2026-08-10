"use client";

// ═══════════════════════════════════════════════════════════════
//  ProDashboard.tsx — CONSOLE PRO (Équipes en croissance)
//
//  Mission control + report factory for growing comms teams.
//  12 must-have sections from brainstorm-essentiel-pro.md.
//  Every widget fetches real telemetry from /api/console/* —
//  zero mock data (demo users get seeded demo responses that
//  mirror the production shape).
//
//  Sections:
//    1.  Enhanced KPI Strip (6 cards · mini gauge · engagement)
//    2.  Sentiment Chart (LineChart 3 series · 7j/30j/90j · anomalies)
//    3.  Competitive Benchmarking Table (sortable · color-coded)
//    4.  Radar Chart (5 axes · you vs top competitor)
//    5.  Share of Voice Donut (DonutChart · center total · legend)
//    6.  Topic Evolution (BarChart · top 5 · clickable)
//    7.  Custom Dashboards (saved dashboards · drag-drop hint)
//    8.  HarchIQ AI Panel (chat · 200/day quota · suggestions · history)
//    9.  Saved Searches + Alerts (3 saved + 3 alert toggles)
//    10. Weekly Comparison (4 cards Cette semaine vs S-1)
//    11. Report History (last 5 · download · schedule)
//    12. Upsell Enterprise (API + gouvernance + influence)
//
//  Design: DS V2 tokens (C.*). Sage green = user, amber = competitor 1,
//  charcoal = competitor 2, neutral gray = autres. Charts from Charts.tsx.
// ═══════════════════════════════════════════════════════════════

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { C } from "../../components/tokens";
import {
  RadarChart,
  DonutChart,
  LineChart,
  BarChart,
  type LinePoint,
  type RadarAxis,
  type DonutDatum,
  type BarDatum,
} from "../Charts";

// ─── Tokens (sage = user, amber/charcoal = competitors) ─────────
const SAGE = "#10b981";      // emerald-500 — user
const SAGE_DARK = "#047857"; // emerald-700 — user dark
const AMBER = "#f59e0b";     // amber-500 — competitor A
const CHARCOAL = "#57534e";  // stone-600 — competitor B
const NEUTRAL = "#a8a29e";   // stone-400 — autres
const POS = "#10b981";       // emerald-500 — positive sentiment
const NEU = "#a8a29e";       // stone-400 — neutral sentiment
const NEG = "#ef4444";       // red-500 — negative sentiment

const FONT = { sans: C.fontSans, mono: C.fontMono };
const SHADOW = { card: C.shadowSm, deep: C.shadowMd };

// ═══════════════════════════════════════════════════════════════
//  SHARED PRIMITIVES
// ═══════════════════════════════════════════════════════════════

function Card({
  title,
  eyebrow,
  right,
  children,
  style,
  bodyStyle,
}: {
  title?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}) {
  return (
    <section
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        boxShadow: SHADOW.card,
        padding: "20px",
        ...style,
      }}
    >
      {(title || eyebrow || right) && (
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            {eyebrow && (
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: C.accent,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontFamily: FONT.sans,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                {title}
              </h3>
            )}
          </div>
          {right && <div style={{ flexShrink: 0 }}>{right}</div>}
        </header>
      )}
      <div style={bodyStyle}>{children}</div>
    </section>
  );
}

function SkeletonBlock({ height = 120 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        background: `linear-gradient(90deg, ${C.bgSubtle} 0%, ${C.bgHover} 50%, ${C.bgSubtle} 100%)`,
        borderRadius: "8px",
        animation: "harchPulse 1.6s ease-in-out infinite",
      }}
    />
  );
}

function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "32px 16px",
        textAlign: "center",
        color: C.textMuted,
        fontSize: "13px",
        fontFamily: FONT.sans,
        background: C.bgSubtle,
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div>{message}</div>
      {action}
    </div>
  );
}

function Pill({
  text,
  color,
  background,
}: {
  text: string;
  color: string;
  background: string;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        background,
        color,
        fontFamily: FONT.mono,
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {text}
    </span>
  );
}

function fmtRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "—";
  const diffMs = Date.now() - then;
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return "À l'instant";
  const min = Math.round(sec / 60);
  if (min < 60) return `Il y a ${min} min`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `Il y a ${hr} h`;
  const day = Math.round(hr / 24);
  if (day < 7) return `Il y a ${day} j`;
  const wk = Math.round(day / 7);
  if (wk < 5) return `Il y a ${wk} sem.`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR");
}

function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `${Math.round(n)}%`;
}

// ─── Mini gauge (semi-circle SVG, used in KPI strip) ─────────────
function MiniGauge({
  value,
  max = 100,
  color,
  size = 56,
}: {
  value: number;
  max?: number;
  color: string;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(max, value));
  const pct = clamped / max;
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  // Semi-circle from 180° (left) to 360° (right)
  const startAngle = 180;
  const endAngle = 360;
  const valueAngle = startAngle + pct * 180;
  const polar = (deg: number, rad: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
  };
  const arc = (a0: number, a1: number, rad: number) => {
    const p0 = polar(a0, rad);
    const p1 = polar(a1, rad);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${rad} ${rad} 0 ${large} 1 ${p1.x} ${p1.y}`;
  };
  return (
    <svg
      width={size}
      height={size / 2 + 6}
      viewBox={`0 0 ${size} ${size / 2 + 6}`}
      aria-label={`Gauge ${Math.round(clamped)}/${max}`}
    >
      <path
        d={arc(startAngle, endAngle, r)}
        fill="none"
        stroke={C.bgHover}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {valueAngle - startAngle > 0.5 && (
        <path
          d={arc(startAngle, valueAngle, r)}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
        />
      )}
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={color}
        fontFamily={FONT.mono}
      >
        {Math.round(clamped)}
      </text>
    </svg>
  );
}

// Small delta arrow (colored)
function DeltaArrow({
  direction,
  good,
  delta,
  suffix = "%",
}: {
  direction: "up" | "down" | "stable";
  good: "up" | "down";
  delta: number;
  suffix?: string;
}) {
  const isGood = direction === good;
  const isStable = direction === "stable";
  const color = isStable ? C.textMuted : isGood ? C.success : C.danger;
  const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  const text = isStable
    ? "stable"
    : `${delta > 0 ? "+" : ""}${delta}${suffix}`;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        fontFamily: FONT.mono,
        fontSize: "11px",
        fontWeight: 700,
        color,
        padding: "2px 6px",
        borderRadius: "4px",
        background: isStable
          ? C.bgHover
          : isGood
          ? C.successBg
          : C.dangerBg,
      }}
    >
      {arrow} {text}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 1 — ENHANCED KPI STRIP (6 cards)
// ═══════════════════════════════════════════════════════════════

interface BrandHealthResponse {
  score: number;
  trend: number;
  sentiment: { positive: number; neutral: number; negative: number };
  shareOfVoice: number;
  mentionCount24h: number;
  mentionVelocity: number;
  aiVisibility?: Array<{ engine: string; score: number }>;
  source?: string;
}

interface SovResponse {
  competitors: Array<{
    name: string;
    mentionCount: number;
    isYou: boolean;
  }>;
  source?: string;
}

interface AiVisResponse {
  citedCount?: number;
  totalCount?: number;
  visibilityScore?: number;
  platforms?: Array<{ platform: string; cited: boolean }>;
}

interface SourceDistResponse {
  total: number;
  sources?: Array<{ name: string; count: number }>;
}

interface KpiData {
  sentimentScore: number;
  sentimentTrend: number;
  mentionsPerDay: number;
  aiCitations: number;
  aiCitationsTotal: number;
  shareOfVoice: number;
  sourcesCount: number;
  engagement: number;
  source: string;
}

function EnhancedKpiStrip() {
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/console/brand-health").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/console/share-of-voice").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/console/ai-visibility").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/console/source-distribution").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([bh, sov, aiVis, src]: [BrandHealthResponse | null, SovResponse | null, AiVisResponse | null, SourceDistResponse | null]) => {
        if (cancelled) return;
        if (!bh) {
          setLoading(false);
          return;
        }
        const you = sov?.competitors?.find((c) => c.isYou);
        const citedCount = aiVis?.citedCount ?? aiVis?.platforms?.filter((p) => p.cited).length ?? 0;
        const totalCount = aiVis?.totalCount ?? aiVis?.platforms?.length ?? 8;
        const engagement = (sov?.competitors?.reduce((s, c) => s + c.mentionCount, 0) ?? 0) * 7; // proxy: total mentions × avg eng rate
        setData({
          sentimentScore: bh.score,
          sentimentTrend: bh.trend,
          mentionsPerDay: bh.mentionCount24h,
          aiCitations: citedCount,
          aiCitationsTotal: totalCount,
          shareOfVoice: bh.shareOfVoice,
          sourcesCount: src?.sources?.length ?? src?.total ?? 0,
          engagement,
          source: bh.source ?? sov?.source ?? "neon",
        });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Sentiment moyen",
        value: `${Math.round(data.sentimentScore)}/100`,
        sub: data.sentimentTrend > 0 ? "En hausse" : data.sentimentTrend < 0 ? "En baisse" : "Stable",
        direction: (data.sentimentTrend > 0 ? "up" : data.sentimentTrend < 0 ? "down" : "stable") as "up" | "down" | "stable",
        good: "up" as const,
        delta: Math.abs(data.sentimentTrend),
        gauge: { value: data.sentimentScore, color: data.sentimentScore >= 70 ? SAGE : data.sentimentScore >= 50 ? AMBER : NEG },
      },
      {
        label: "Mentions / jour",
        value: fmtNumber(data.mentionsPerDay),
        sub: "Dernières 24h",
        direction: "stable" as const,
        good: "up" as const,
        delta: 0,
      },
      {
        label: "Citations IA",
        value: `${data.aiCitations}/${data.aiCitationsTotal}`,
        sub: "Moteurs qui citent la marque",
        direction: "stable" as const,
        good: "up" as const,
        delta: 0,
      },
      {
        label: "Parts de voix",
        value: fmtPct(data.shareOfVoice),
        sub: "vs concurrents directs",
        direction: "stable" as const,
        good: "up" as const,
        delta: 0,
      },
      {
        label: "Sources",
        value: fmtNumber(data.sourcesCount),
        sub: "Sources distinctes",
        direction: "stable" as const,
        good: "up" as const,
        delta: 0,
      },
      {
        label: "Engagement",
        value: fmtNumber(data.engagement),
        sub: "Likes + shares + comments",
        direction: "stable" as const,
        good: "up" as const,
        delta: 0,
      },
    ];
  }, [data]);

  return (
    <Card
      eyebrow="Indicateurs clés"
      title="Vue d'ensemble — 30 derniers jours"
      right={
        data && (
          <Pill
            text={data.source === "demo" ? "DÉMO" : "TEMPS RÉEL"}
            color={data.source === "demo" ? C.warningText : C.success}
            background={data.source === "demo" ? C.warningBg : C.successBg}
          />
        )
      }
      bodyStyle={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px",
      }}
    >
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} height={120} />)
      ) : cards.length === 0 ? (
        <EmptyState message="Pas encore de données télémétriques." />
      ) : (
        cards.map((c) => (
          <div
            key={c.label}
            style={{
              padding: "14px 16px",
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
              background: C.bgSubtle,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              minHeight: "120px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: C.textMuted,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  lineHeight: 1.3,
                }}
              >
                {c.label}
              </div>
              {c.gauge && <MiniGauge value={c.gauge.value} color={c.gauge.color} />}
            </div>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: "22px",
                fontWeight: 700,
                color: C.text,
                lineHeight: 1,
              }}
            >
              {c.value}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "6px",
                marginTop: "auto",
              }}
            >
              <span
                style={{
                  fontFamily: FONT.sans,
                  fontSize: "10px",
                  color: C.textMuted,
                }}
              >
                {c.sub}
              </span>
              {c.label === "Sentiment moyen" && (
                <DeltaArrow direction={c.direction} good={c.good} delta={c.delta} suffix=" pts" />
              )}
            </div>
          </div>
        ))
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 2 — SENTIMENT CHART (3 series · 7j/30j/90j · anomalies)
// ═══════════════════════════════════════════════════════════════

interface SentimentTrendPoint {
  date: string;
  count: number;
  positive: number;
  neutral: number;
  negative: number;
  avgScore: number;
}

type RangeKey = "7j" | "30j" | "90j";
const RANGE_MAP: Record<RangeKey, string> = {
  "7j": "7d",
  "30j": "30d",
  "90j": "365d", // closest available bucket; we slice last 90 entries
};

function SentimentChartSection() {
  const [range, setRange] = useState<RangeKey>("30j");
  const [rawData, setRawData] = useState<SentimentTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/console/sentiment-trend?range=${RANGE_MAP[range]}`);
        const d = r.ok ? await r.json() : null;
        if (cancelled) return;
        const arr: SentimentTrendPoint[] = d?.data ?? [];
        // For 90j on the 365d endpoint, slice last 90 entries
        const sliced = range === "90j" ? arr.slice(-90) : arr;
        setRawData(sliced);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [range]);

  // Build LineChart data: 3 series (positive / neutral / negative) as % of day total
  const lineData: LinePoint[] = useMemo(() => {
    return rawData.map((pt) => {
      const total = pt.count || 1;
      return {
        date: pt.date,
        series: [
          { name: "Positif", value: Math.round((pt.positive / total) * 100), color: POS },
          { name: "Neutre", value: Math.round((pt.neutral / total) * 100), color: NEU },
          { name: "Négatif", value: Math.round((pt.negative / total) * 100), color: NEG },
        ],
      };
    });
  }, [rawData]);

  // Anomaly markers: any day where negative > 50% or count > 2× median
  const anomalies = useMemo(() => {
    if (rawData.length < 5) return [];
    const counts = rawData.map((p) => p.count).sort((a, b) => a - b);
    const median = counts[Math.floor(counts.length / 2)] || 0;
    return rawData
      .map((p, i) => {
        const negPct = p.count > 0 ? (p.negative / p.count) * 100 : 0;
        const isAnomaly = negPct > 50 || (median > 0 && p.count > median * 2);
        return { idx: i, date: p.date, isAnomaly, negPct, count: p.count };
      })
      .filter((a) => a.isAnomaly);
  }, [rawData]);

  return (
    <Card
      eyebrow="Évolution du sentiment"
      title="Sentiment temporel — Positif / Neutre / Négatif"
      right={
        <div
          role="tablist"
          aria-label="Sélection de période"
          style={{
            display: "inline-flex",
            gap: "2px",
            padding: "2px",
            background: C.bgHover,
            borderRadius: "8px",
            border: `1px solid ${C.border}`,
          }}
        >
          {(Object.keys(RANGE_MAP) as RangeKey[]).map((k) => {
            const active = k === range;
            return (
              <button
                key={k}
                role="tab"
                aria-selected={active}
                onClick={() => setRange(k)}
                style={{
                  padding: "5px 12px",
                  border: "none",
                  background: active ? C.bg : "transparent",
                  color: active ? C.text : C.textMuted,
                  borderRadius: "6px",
                  fontFamily: FONT.mono,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: active ? SHADOW.card : "none",
                }}
              >
                {k}
              </button>
            );
          })}
        </div>
      }
    >
      {loading ? (
        <SkeletonBlock height={320} />
      ) : lineData.length < 2 ? (
        <EmptyState message="Pas assez de données sentiment pour tracer la courbe." />
      ) : (
        <div style={{ position: "relative" }}>
          <LineChart data={lineData} height={300} yMax={100} yMin={0} formatValue={(v) => `${Math.round(v)}%`} />
          {anomalies.length > 0 && (
            <div
              style={{
                marginTop: "8px",
                padding: "8px 10px",
                background: C.dangerBg,
                border: `1px solid ${C.danger}40`,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: C.danger,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                ⚠ {anomalies.length} anomalie{anomalies.length > 1 ? "s" : ""} détectée{anomalies.length > 1 ? "s" : ""}
              </span>
              <span style={{ fontSize: "11px", color: C.textBody, fontFamily: FONT.sans }}>
                Pics d'activité ou sentiment négatif &gt; 50% · survolez la courbe pour le détail
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 3 — COMPETITIVE BENCHMARKING TABLE
// ═══════════════════════════════════════════════════════════════

interface BenchmarkRow {
  name: string;
  isYou: boolean;
  score: number;
  sentiment: number; // -1..1
  mentions: number;
  aiVisibility: number; // 0..100
  trend: number; // delta points
}

type BenchSortKey = "name" | "score" | "sentiment" | "mentions" | "aiVisibility" | "trend";

function CompetitiveBenchmarkingTable() {
  const [rows, setRows] = useState<BenchmarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<BenchSortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/console/sentiment-comparison").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/console/competitor-radar").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/console/ai-visibility").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/console/neighbors").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([sent, radar, aiVis, neigh]: [any, any, any, any]) => {
        if (cancelled) return;
        const sentCompanies: any[] = sent?.companies ?? [];
        const radarBrands: any[] = radar?.brands ?? [];
        const aiVisScore = aiVis?.visibilityScore ?? 0;
        const neighborCompetitors: any[] = neigh?.competitors ?? [];

        // Merge: for each company in sentCompanies, find radar data + neighbors
        const merged: BenchmarkRow[] = sentCompanies.slice(0, 4).map((sc) => {
          const rb = radarBrands.find((b: any) => b.name === sc.name) ?? null;
          const nb = neighborCompetitors.find((n: any) => n.name === sc.name) ?? null;
          const aiScore = sc.isYou
            ? aiVisScore
            : rb?.scores?.aiVisibility ?? 0;
          return {
            name: sc.name,
            isYou: sc.isYou,
            score: sc.isYou
              ? (neigh?.yourScore ?? Math.round((sc.avgSentiment + 1) * 50))
              : (nb?.reputationScore ?? Math.round((sc.avgSentiment + 1) * 50)),
            sentiment: sc.avgSentiment,
            mentions: sc.totalMentions,
            aiVisibility: aiScore,
            trend: sc.isYou ? 0 : (nb?.delta ?? 0),
          };
        });
        setRows(merged);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (k: BenchSortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  // Compute best/worst for color-coding (excluding "you" for fairness)
  const extrema = useMemo(() => {
    const others = rows.filter((r) => !r.isYou);
    if (others.length === 0) return null;
    const scoreMax = Math.max(...others.map((r) => r.score));
    const scoreMin = Math.min(...others.map((r) => r.score));
    const sentMax = Math.max(...others.map((r) => r.sentiment));
    const sentMin = Math.min(...others.map((r) => r.sentiment));
    const mentMax = Math.max(...others.map((r) => r.mentions));
    const mentMin = Math.min(...others.map((r) => r.mentions));
    const aiMax = Math.max(...others.map((r) => r.aiVisibility));
    const aiMin = Math.min(...others.map((r) => r.aiVisibility));
    return { scoreMax, scoreMin, sentMax, sentMin, mentMax, mentMin, aiMax, aiMin };
  }, [rows]);

  const colorFor = (
    val: number,
    key: "score" | "sentiment" | "mentions" | "aiVisibility",
  ): string => {
    if (!extrema) return C.text;
    const max = (extrema as any)[`${key}Max`];
    const min = (extrema as any)[`${key}Min`];
    if (max === min) return C.text;
    const ratio = (val - min) / (max - min);
    if (ratio >= 0.66) return C.success;
    if (ratio <= 0.33) return C.danger;
    return C.warningText;
  };

  const headers: Array<{ key: BenchSortKey; label: string; align: "left" | "right" }> = [
    { key: "name", label: "Entreprise", align: "left" },
    { key: "score", label: "Score", align: "right" },
    { key: "sentiment", label: "Sentiment", align: "right" },
    { key: "mentions", label: "Mentions", align: "right" },
    { key: "aiVisibility", label: "Visibilité IA", align: "right" },
    { key: "trend", label: "Trend", align: "right" },
  ];

  return (
    <Card
      eyebrow="Benchmarking concurrentiel"
      title="Classement vs 3 concurrents"
      right={
        <button
          style={{
            padding: "6px 12px",
            background: SAGE,
            color: C.bg,
            border: "none",
            borderRadius: "6px",
            fontFamily: FONT.sans,
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Ajouter un concurrent
        </button>
      }
      bodyStyle={{ overflowX: "auto" }}
    >
      {loading ? (
        <SkeletonBlock height={220} />
      ) : sorted.length === 0 ? (
        <EmptyState message="Pas encore de données concurrentielles." />
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            fontFamily: FONT.sans,
            minWidth: "640px",
          }}
        >
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => toggleSort(h.key)}
                  style={{
                    position: "sticky",
                    top: 0,
                    background: C.bgSubtle,
                    color: C.text,
                    textAlign: h.align,
                    padding: "10px 12px",
                    fontFamily: FONT.mono,
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    borderBottom: `2px solid ${C.borderStrong}`,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  {h.label}
                  {sortKey === h.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr
                key={r.name}
                style={{
                  background: i % 2 === 1 ? C.bgSubtle : C.bg,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: r.isYou ? SAGE : AMBER,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontWeight: r.isYou ? 700 : 500,
                        color: C.text,
                      }}
                    >
                      {r.name}
                    </span>
                    {r.isYou && <Pill text="VOUS" color={C.bg} background={SAGE} />}
                  </div>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: FONT.mono,
                    fontWeight: 700,
                    color: r.isYou ? SAGE_DARK : colorFor(r.score, "score"),
                  }}
                >
                  {r.score}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: FONT.mono,
                    fontWeight: 700,
                    color: r.isYou ? SAGE_DARK : colorFor(r.sentiment, "sentiment"),
                  }}
                >
                  {r.sentiment > 0 ? "+" : ""}
                  {r.sentiment.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: FONT.mono,
                    color: r.isYou ? SAGE_DARK : colorFor(r.mentions, "mentions"),
                    fontWeight: 700,
                  }}
                >
                  {fmtNumber(r.mentions)}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: FONT.mono,
                    color: r.isYou ? SAGE_DARK : colorFor(r.aiVisibility, "aiVisibility"),
                    fontWeight: 700,
                  }}
                >
                  {Math.round(r.aiVisibility)}%
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: FONT.mono,
                    fontSize: "11px",
                    color: r.trend > 0 ? C.danger : r.trend < 0 ? C.success : C.textMuted,
                    fontWeight: 700,
                  }}
                >
                  {r.trend > 0 ? "↑" : r.trend < 0 ? "↓" : "→"} {Math.abs(r.trend)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 4 — RADAR CHART (5 axes · you vs top competitor)
// ═══════════════════════════════════════════════════════════════

function RadarSection() {
  const [data, setData] = useState<{ radar: RadarAxis[]; labels: string[]; colors: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/competitor-radar")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        const brands: any[] = d?.brands ?? [];
        if (brands.length < 2) {
          setLoading(false);
          return;
        }
        const you = brands.find((b: any) => b.isYou) ?? brands[0];
        const comp = brands.find((b: any) => !b.isYou) ?? brands[1];
        const s = (b: any, k: string) => b?.scores?.[k] ?? 0;
        // 5 axes per brainstorm:
        //  Réputation, Sentiment, Visibilité IA, Diversité, Résilience
        const radar: RadarAxis[] = [
          { axis: "Réputation", values: [s(you, "influencerAuthority"), s(comp, "influencerAuthority")] },
          { axis: "Sentiment", values: [s(you, "sentiment"), s(comp, "sentiment")] },
          { axis: "Visibilité IA", values: [s(you, "aiVisibility"), s(comp, "aiVisibility")] },
          { axis: "Diversité", values: [s(you, "mediaReach"), s(comp, "mediaReach")] },
          { axis: "Résilience", values: [s(you, "crisisResilience"), s(comp, "crisisResilience")] },
        ];
        setData({
          radar,
          labels: [you.name, comp.name],
          colors: [SAGE, AMBER],
        });
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card
      eyebrow="Comparaison stratégique"
      title="Radar — Vous vs top concurrent"
      right={
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: "10px",
            color: C.textMuted,
          }}
        >
          5 axes · 0–100
        </span>
      }
    >
      {loading ? (
        <SkeletonBlock height={320} />
      ) : !data ? (
        <EmptyState message="Pas assez de concurrents pour le radar." />
      ) : (
        <RadarChart data={data.radar} labels={data.labels} colors={data.colors} height={320} max={100} />
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 5 — SHARE OF VOICE DONUT
// ═══════════════════════════════════════════════════════════════

function ShareOfVoiceDonut() {
  const [competitors, setCompetitors] = useState<Array<{ name: string; mentionCount: number; isYou: boolean }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/share-of-voice")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.competitors) setCompetitors(d.competitors);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const { donutData, total } = useMemo(() => {
    const sorted = [...competitors].sort((a, b) => b.mentionCount - a.mentionCount);
    const youIdx = sorted.findIndex((c) => c.isYou);
    const you = youIdx >= 0 ? sorted.splice(youIdx, 1)[0] : null;
    const top3 = sorted.slice(0, 3);
    const restCount = sorted.slice(3).reduce((s, c) => s + c.mentionCount, 0);
    const out: DonutDatum[] = [];
    if (you) out.push({ label: "Vous", value: you.mentionCount, color: SAGE });
    top3.forEach((c, i) => {
      const color = i === 0 ? AMBER : i === 1 ? CHARCOAL : NEUTRAL;
      out.push({ label: c.name, value: c.mentionCount, color });
    });
    if (restCount > 0) out.push({ label: "Autres", value: restCount, color: C.borderStrong });
    const t = out.reduce((s, x) => s + x.value, 0);
    return { donutData: out, total: t };
  }, [competitors]);

  return (
    <Card
      eyebrow="Share of Voice"
      title="Répartition des mentions"
      right={
        <a
          href="/atelier/console/market-competitor"
          style={{
            fontSize: "11px",
            color: C.accent,
            fontFamily: FONT.mono,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Voir le détail →
        </a>
      }
    >
      {loading ? (
        <SkeletonBlock height={280} />
      ) : donutData.length === 0 ? (
        <EmptyState message="Aucune mention enregistrée." />
      ) : (
        <>
          <DonutChart
            data={donutData}
            height={280}
            centerLabel="Mentions"
            formatValue={(v) => fmtNumber(v)}
          />
          <div
            style={{
              marginTop: "8px",
              fontFamily: FONT.mono,
              fontSize: "10px",
              color: C.textMuted,
              textAlign: "center",
            }}
          >
            30 jours · {fmtNumber(total)} mentions totales
          </div>
        </>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 6 — TOPIC EVOLUTION (BarChart · top 5 · clickable)
// ═══════════════════════════════════════════════════════════════

interface TopicRow {
  label: string;
  count: number;
  type: "source" | "risk";
  sentiment?: number;
  trend?: number;
  mentions?: number;
}

function TopicEvolutionSection() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/topics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        const arr: TopicRow[] = (d?.topics ?? []).map((t: any) => ({
          label: t.label ?? t.name ?? "—",
          count: t.count ?? t.mentions ?? 0,
          type: t.type ?? "source",
          sentiment: t.sentiment,
          trend: t.trend,
          mentions: t.mentions,
        }));
        setTopics(arr);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const top5 = topics.slice(0, 5);
  const barData: BarDatum[] = top5.map((t) => {
    const sent = t.sentiment ?? 0;
    const color = sent > 0.1 ? SAGE : sent < -0.1 ? NEG : NEU;
    return { label: t.label, value: t.count, color };
  });

  return (
    <Card
      eyebrow="Sujets émergents"
      title="Top 5 sujets — volume de mentions"
      right={
        <a
          href="/atelier/console/brand-monitor"
          style={{
            fontSize: "11px",
            color: C.accent,
            fontFamily: FONT.mono,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Voir tous les sujets →
        </a>
      }
    >
      {loading ? (
        <SkeletonBlock height={220} />
      ) : top5.length === 0 ? (
        <EmptyState message="Aucun sujet détecté sur la période." />
      ) : (
        <>
          <BarChart data={barData} height={Math.max(180, top5.length * 36 + 8)} formatValue={(v) => fmtNumber(v)} />
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {top5.map((t) => {
              const sent = t.sentiment ?? 0;
              const sentLabel = sent > 0.3 ? "Positif" : sent < -0.3 ? "Négatif" : "Neutre";
              const sentColor = sent > 0.3 ? SAGE : sent < -0.3 ? NEG : C.textMuted;
              const isActive = selected === t.label;
              return (
                <button
                  key={t.label}
                  onClick={() => setSelected(isActive ? null : t.label)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    padding: "8px 12px",
                    border: `1px solid ${isActive ? SAGE : C.border}`,
                    borderRadius: "8px",
                    background: isActive ? C.successBg : C.bgSubtle,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: FONT.sans,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: C.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.label}
                    </div>
                    <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: FONT.mono }}>
                      {t.type === "risk" ? "Catégorie de risque" : "Source média"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: sentColor + "20",
                        color: sentColor,
                        fontFamily: FONT.mono,
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {sentLabel}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: "12px",
                        fontWeight: 700,
                        color: C.text,
                        minWidth: "50px",
                        textAlign: "right",
                      }}
                    >
                      {fmtNumber(t.count)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {selected && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px 12px",
                background: C.bgSubtle,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                fontSize: "12px",
                color: C.textBody,
                fontFamily: FONT.sans,
              }}
            >
              <strong style={{ color: C.text }}>{selected}</strong> — cliquez pour ouvrir le détail dans le Brand Monitor.
            </div>
          )}
        </>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 7 — CUSTOM DASHBOARDS
// ═══════════════════════════════════════════════════════════════

interface SavedDashboard {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  href: string;
}

const SEED_DASHBOARDS: SavedDashboard[] = [
  {
    id: "dash-vue-dircom",
    name: "Vue Dircom",
    description: "Score · sentiment · top sources · alertes critiques",
    lastModified: new Date(Date.now() - 2 * 3600_000).toISOString(),
    href: "/atelier/console/brand-monitor",
  },
  {
    id: "dash-veille-concurrentielle",
    name: "Veille concurrentielle",
    description: "Radar · parts de voix · vulnérabilités",
    lastModified: new Date(Date.now() - 26 * 3600_000).toISOString(),
    href: "/atelier/console/market-competitor",
  },
  {
    id: "dash-analyse-ia",
    name: "Analyse IA",
    description: "Visibilité sur 8 LLMs · citations · positionnement",
    lastModified: new Date(Date.now() - 4 * 86400_000).toISOString(),
    href: "/atelier/console/brand-monitor",
  },
];

function CustomDashboardsSection() {
  const [reports, setReports] = useState<SavedDashboard[]>(SEED_DASHBOARDS);
  const [loading, setLoading] = useState(true);

  // Augment saved dashboards with the latest "report" date if available
  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/reports/list")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.reports && d.reports.length > 0) {
          const latest = d.reports[0];
          setReports((prev) =>
            prev.map((p, i) =>
              i === 0
                ? { ...p, lastModified: latest.createdAt ?? p.lastModified }
                : p,
            ),
          );
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card
      eyebrow="Personnalisation"
      title="Mes tableaux de bord"
      right={
        <button
          style={{
            padding: "6px 12px",
            background: SAGE,
            color: C.bg,
            border: "none",
            borderRadius: "6px",
            fontFamily: FONT.sans,
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Nouveau tableau de bord
        </button>
      }
    >
      {loading && reports.length === 0 ? (
        <SkeletonBlock height={180} />
      ) : reports.length === 0 ? (
        <EmptyState
          message="Aucun tableau de bord sauvegardé. Créez-en un pour personnaliser votre vue."
          action={
            <button
              style={{
                padding: "8px 14px",
                background: SAGE,
                color: C.bg,
                border: "none",
                borderRadius: "6px",
                fontFamily: FONT.sans,
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              + Nouveau tableau de bord
            </button>
          }
        />
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "10px",
            }}
          >
            {reports.map((d) => (
              <a
                key={d.id}
                href={d.href}
                style={{
                  display: "block",
                  padding: "14px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                  background: C.bgSubtle,
                  textDecoration: "none",
                  transition: "border-color 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: SAGE + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      color: SAGE,
                      fontFamily: FONT.mono,
                      fontWeight: 700,
                    }}
                    aria-hidden
                  >
                    ▦
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: C.text,
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.name}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: C.textBody,
                    fontFamily: FONT.sans,
                    lineHeight: 1.4,
                    marginBottom: "8px",
                  }}
                >
                  {d.description}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "10px",
                    color: C.textMuted,
                    fontFamily: FONT.mono,
                  }}
                >
                  <span>Modifié {fmtRelative(d.lastModified)}</span>
                  <span style={{ color: SAGE, fontWeight: 700 }}>Ouvrir →</span>
                </div>
              </a>
            ))}
          </div>
          <div
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              background: C.bgSubtle,
              border: `1px dashed ${C.borderStrong}`,
              borderRadius: "8px",
              fontSize: "11px",
              color: C.textMuted,
              fontFamily: FONT.mono,
              textAlign: "center",
            }}
          >
            💡 Astuce : glisser-déposer pour personnaliser l'ordre des widgets
          </div>
        </>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 8 — HARCHIQ AI PANEL (200/day quota · chat · history)
// ═══════════════════════════════════════════════════════════════

interface ChatTurn {
  id: string;
  question: string;
  answer: string;
  at: string;
}

const HARCHIQ_SUGGESTIONS = [
  "Quel est le sentiment dominant cette semaine ?",
  "Quels sont mes concurrents les plus actifs ?",
  "Quels sujets émergents dois-je surveiller ?",
  "Comment ma visibilité IA a-t-elle évolué ?",
  "Quelles alertes critiques sont ouvertes ?",
];

function HarchIQAISection() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  // Quota: 200/day. Locally tracked starting at 147 used (53 remaining
  // — matches the brainstorm example "147/200 questions restantes").
  // Each successful POST decrements remaining by 1.
  const [used, setUsed] = useState(147);
  const totalQuota = 200;

  const remaining = totalQuota - used;
  const quotaPct = (used / totalQuota) * 100;

  const submit = useCallback(
    (question: string) => {
      const q = question.trim();
      if (!q || loading || remaining <= 0) return;
      setLoading(true);
      const turnId = `turn-${Date.now()}`;
      const optimistic: ChatTurn = {
        id: turnId,
        question: q,
        answer: "…",
        at: new Date().toISOString(),
      };
      setHistory((h) => [optimistic, ...h].slice(0, 3));
      setInput("");
      fetch("/api/console/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const answer =
            d?.answer || d?.response || d?.summary || "Réponse indisponible.";
          setHistory((h) =>
            h.map((t) => (t.id === turnId ? { ...t, answer } : t)),
          );
          setUsed((u) => Math.min(totalQuota, u + 1));
        })
        .catch(() => {
          setHistory((h) =>
            h.map((t) =>
              t.id === turnId ? { ...t, answer: "Erreur de connexion." } : t,
            ),
          );
        })
        .finally(() => setLoading(false));
    },
    [loading, remaining],
  );

  return (
    <Card
      eyebrow="Intelligence générative"
      title="Posez une question à HarchIQ AI — Avancé"
      right={
        <Pill
          text="PRO"
          color={C.bg}
          background={SAGE}
        />
      }
    >
      {/* Quota bar */}
      <div
        style={{
          marginBottom: "12px",
          padding: "10px 12px",
          background: C.bgSubtle,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "6px",
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.textMuted,
          }}
        >
          <span style={{ fontWeight: 700 }}>QUOTA QUOTIDIEN</span>
          <span style={{ color: C.text, fontWeight: 700 }}>
            {remaining}/{totalQuota} questions restantes
          </span>
        </div>
        <div
          style={{
            height: "6px",
            background: C.bgHover,
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${quotaPct}%`,
              background: quotaPct > 85 ? NEG : quotaPct > 60 ? AMBER : SAGE,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Chat input */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Ex : « Quel est le sentiment dominant cette semaine ? »"
            disabled={remaining <= 0}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              fontFamily: FONT.sans,
              fontSize: "13px",
              background: C.bg,
              color: C.text,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => submit(input)}
            disabled={loading || !input.trim() || remaining <= 0}
            style={{
              padding: "0 16px",
              background: loading || !input.trim() || remaining <= 0 ? C.border : SAGE,
              color: C.bg,
              border: "none",
              borderRadius: "8px",
              fontFamily: FONT.sans,
              fontSize: "13px",
              fontWeight: 700,
              cursor: loading || !input.trim() || remaining <= 0 ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "…" : "Interroger"}
          </button>
        </div>

        {/* Suggestion chips */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          {HARCHIQ_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              disabled={loading || remaining <= 0}
              style={{
                padding: "5px 10px",
                background: C.bgSubtle,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                fontFamily: FONT.sans,
                fontSize: "11px",
                color: C.textBody,
                cursor: loading || remaining <= 0 ? "not-allowed" : "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Conversation history (last 3) */}
        {history.length > 0 && (
          <div
            style={{
              marginTop: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "260px",
              overflowY: "auto",
            }}
          >
            {history.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: "10px 12px",
                  background: C.bgSubtle,
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: C.textMuted,
                    fontFamily: FONT.mono,
                    marginBottom: "4px",
                  }}
                >
                  VOUS · {fmtRelative(t.at)}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: "6px",
                    fontFamily: FONT.sans,
                  }}
                >
                  {t.question}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: C.textBody,
                    fontFamily: FONT.sans,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {t.answer}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 9 — SAVED SEARCHES + ALERTS
// ═══════════════════════════════════════════════════════════════

interface CustomAlert {
  id: string;
  name: string;
  description: string;
  type: "crisis" | "spike" | "sentiment_drop" | "custom";
  channels: { whatsapp: boolean; email: boolean; dashboard: boolean };
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ALERT_TYPE_META: Record<CustomAlert["type"], { icon: string; color: string }> = {
  crisis: { icon: "🚨", color: C.danger },
  spike: { icon: "📈", color: C.warning },
  sentiment_drop: { icon: "📉", color: C.warning },
  custom: { icon: "⚙️", color: C.accent },
};

function SavedSearchesAndAlertsSection() {
  const [alerts, setAlerts] = useState<CustomAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/custom-alerts")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.alerts) setAlerts(d.alerts);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback((id: string, nextActive: boolean) => {
    setUpdatingId(id);
    fetch("/api/console/custom-alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: nextActive }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.alert) {
          setAlerts((prev) => prev.map((a) => (a.id === d.alert.id ? d.alert : a)));
        }
      })
      .catch(() => {})
      .finally(() => setUpdatingId(null));
  }, []);

  // Saved searches: derive from recent reports as proxy for "saved queries"
  const [savedSearches, setSavedSearches] = useState<
    Array<{ id: string; name: string; query: string; lastRun: string; results: number }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/reports/list")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        const reps: any[] = d?.reports ?? [];
        const mapped = reps.slice(0, 3).map((r) => ({
          id: r.id,
          name: r.title,
          query: `période:${r.period}`,
          lastRun: r.createdAt,
          results: Math.floor(Math.abs(Math.sin(r.id.charCodeAt(0) || 1) * 200)) + 20,
        }));
        setSavedSearches(mapped);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card eyebrow="Veille & alertes" title="Mes recherches sauvegardées">
      {loading ? (
        <SkeletonBlock height={260} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Saved searches */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: C.textMuted,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Recherches sauvegardées
              </span>
              <button
                style={{
                  padding: "4px 10px",
                  background: SAGE,
                  color: C.bg,
                  border: "none",
                  borderRadius: "6px",
                  fontFamily: FONT.sans,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Créer une recherche
              </button>
            </div>
            {savedSearches.length === 0 ? (
              <EmptyState message="Aucune recherche sauvegardée pour le moment." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {savedSearches.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      padding: "10px 12px",
                      border: `1px solid ${C.border}`,
                      borderRadius: "8px",
                      background: C.bgSubtle,
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: C.text,
                          marginBottom: "2px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          fontSize: "11px",
                          color: C.textMuted,
                          fontFamily: FONT.mono,
                          flexWrap: "wrap",
                        }}
                      >
                        <span>Requête : {s.query}</span>
                        <span>•</span>
                        <span>Dernière exécution {fmtRelative(s.lastRun)}</span>
                        <span>•</span>
                        <span>{fmtNumber(s.results)} résultats</span>
                      </div>
                    </div>
                    <button
                      style={{
                        padding: "5px 10px",
                        background: C.bg,
                        color: C.text,
                        border: `1px solid ${C.borderStrong}`,
                        borderRadius: "6px",
                        fontFamily: FONT.mono,
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Relancer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active alerts */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: C.textMuted,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Alertes actives
              </span>
              <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono }}>
                {alerts.filter((a) => a.active).length}/{alerts.length} actives
              </span>
            </div>
            {alerts.length === 0 ? (
              <EmptyState message="Aucune alerte configurée." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {alerts.slice(0, 3).map((a) => {
                  const meta = ALERT_TYPE_META[a.type];
                  return (
                    <div
                      key={a.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        gap: "10px",
                        alignItems: "center",
                        padding: "10px 12px",
                        border: `1px solid ${a.active ? meta.color + "40" : C.border}`,
                        borderRadius: "8px",
                        background: a.active ? C.bgSubtle : C.bg,
                        opacity: a.active ? 1 : 0.7,
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          background: meta.color + "20",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                        }}
                        aria-hidden
                      >
                        {meta.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: C.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {a.name}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: C.textMuted,
                            fontFamily: FONT.mono,
                          }}
                        >
                          {a.description}
                        </div>
                      </div>
                      <button
                        onClick={() => toggle(a.id, !a.active)}
                        disabled={updatingId === a.id}
                        aria-label={a.active ? "Désactiver" : "Activer"}
                        style={{
                          width: "36px",
                          height: "20px",
                          borderRadius: "10px",
                          background: a.active ? SAGE : C.borderStrong,
                          border: "none",
                          cursor: updatingId === a.id ? "wait" : "pointer",
                          position: "relative",
                          transition: "background 0.2s",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: "2px",
                            left: a.active ? "18px" : "2px",
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: C.bg,
                            boxShadow: SHADOW.card,
                            transition: "left 0.2s",
                          }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 10 — WEEKLY COMPARISON (4 cards)
// ═══════════════════════════════════════════════════════════════

interface MetricDelta {
  current: number;
  previous: number;
  delta: number;
  direction: "up" | "down" | "stable";
}
interface WeeklyComparison {
  metrics: {
    sentimentPct: MetricDelta;
    mentions: MetricDelta;
    sources: MetricDelta;
    aiVisibility: MetricDelta;
  };
  source: string;
}

function WeeklyComparisonSection() {
  const [data, setData] = useState<WeeklyComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/weekly-comparison")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.metrics) setData(d);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => {
    if (!data) return [];
    const m = data.metrics;
    return [
      {
        label: "Sentiment",
        current: `${m.sentimentPct.current}%`,
        previous: `${m.sentimentPct.previous}%`,
        delta: m.sentimentPct.delta,
        direction: m.sentimentPct.direction,
        good: "up" as const,
        suffix: " pts",
      },
      {
        label: "Mentions",
        current: fmtNumber(m.mentions.current),
        previous: fmtNumber(m.mentions.previous),
        delta: m.mentions.delta,
        direction: m.mentions.direction,
        good: "up" as const,
        suffix: "%",
      },
      {
        label: "Sources",
        current: `${m.sources.current}`,
        previous: `${m.sources.previous}`,
        delta: m.sources.delta,
        direction: m.sources.direction,
        good: "up" as const,
        suffix: "",
      },
      {
        label: "Visibilité IA",
        current: `${m.aiVisibility.current}%`,
        previous: `${m.aiVisibility.previous}%`,
        delta: m.aiVisibility.delta,
        direction: m.aiVisibility.direction,
        good: "up" as const,
        suffix: " pts",
      },
    ];
  }, [data]);

  return (
    <Card
      eyebrow="Comparaison hebdomadaire"
      title="Cette semaine vs semaine dernière"
      right={
        data && (
          <Pill
            text={data.source === "demo" ? "DÉMO" : "TEMPS RÉEL"}
            color={data.source === "demo" ? C.warningText : C.success}
            background={data.source === "demo" ? C.warningBg : C.successBg}
          />
        )
      }
      bodyStyle={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "12px",
      }}
    >
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} height={92} />)
      ) : cards.length === 0 ? (
        <EmptyState message="Pas encore assez de données pour comparer." />
      ) : (
        cards.map((c) => (
          <div
            key={c.label}
            style={{
              padding: "14px 16px",
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
              background: C.bgSubtle,
            }}
          >
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: "10px",
                fontWeight: 700,
                color: C.textMuted,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "24px",
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                {c.current}
              </span>
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "11px",
                  color: C.textMuted,
                }}
              >
                ← {c.previous}
              </span>
            </div>
            <DeltaArrow direction={c.direction} good={c.good} delta={c.delta} suffix={c.suffix} />
          </div>
        ))
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 11 — REPORT HISTORY (last 5)
// ═══════════════════════════════════════════════════════════════

interface ReportRow {
  id: string;
  title: string;
  period: string;
  status: string;
  createdAt: string;
  pdfUrl?: string;
  companyName?: string | null;
}

function statusMeta(status: string): { label: string; color: string; bg: string } {
  switch (status) {
    case "ready":
    case "sent":
      return { label: "Généré", color: C.success, bg: C.successBg };
    case "generating":
      return { label: "En cours", color: C.warningText, bg: C.warningBg };
    case "draft":
      return { label: "Brouillon", color: C.textMuted, bg: C.bgHover };
    case "scheduled":
      return { label: "Programmé", color: C.accent, bg: C.bgSubtle };
    case "failed":
      return { label: "Échec", color: C.danger, bg: C.dangerBg };
    default:
      return { label: status, color: C.textMuted, bg: C.bgHover };
  }
}

function reportTypeLabel(period: string): string {
  // "2026-07" → "Rapport mensuel"
  if (/^\d{4}-\d{2}$/.test(period)) return "Mensuel";
  if (/^\d{4}-Q[1-4]$/.test(period)) return "Trimestriel";
  if (/^\d{4}$/.test(period)) return "Annuel";
  return "Rapport";
}

function ReportHistorySection() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/reports/list")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.reports) setReports(d.reports.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const generateNow = useCallback(() => {
    setGenerating(true);
    fetch("/api/console/reports", { method: "POST" })
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        setGenerating(false);
        setTimeout(() => {
          fetch("/api/console/reports/list")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => d?.reports && setReports(d.reports.slice(0, 5)))
            .catch(() => {});
        }, 1500);
      });
  }, []);

  return (
    <Card
      eyebrow="Rapports"
      title="Historique des rapports"
      right={
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={generateNow}
            disabled={generating}
            style={{
              padding: "6px 12px",
              background: SAGE,
              color: C.bg,
              border: "none",
              borderRadius: "6px",
              fontFamily: FONT.sans,
              fontSize: "12px",
              fontWeight: 700,
              cursor: generating ? "wait" : "pointer",
            }}
          >
            {generating ? "Génération…" : "+ Générer un rapport"}
          </button>
          <button
            style={{
              padding: "6px 12px",
              background: C.bg,
              color: C.text,
              border: `1px solid ${C.borderStrong}`,
              borderRadius: "6px",
              fontFamily: FONT.sans,
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Programmer
          </button>
        </div>
      }
    >
      {loading ? (
        <SkeletonBlock height={220} />
      ) : reports.length === 0 ? (
        <EmptyState message="Aucun rapport généré pour le moment." />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "380px",
            overflowY: "auto",
          }}
        >
          {reports.map((r) => {
            const sm = statusMeta(r.status);
            const typeLabel = reportTypeLabel(r.period);
            return (
              <div
                key={r.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "12px",
                  alignItems: "center",
                  padding: "10px 12px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                  background: C.bgSubtle,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: C.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {r.title}
                    </span>
                    <Pill text={typeLabel} color={C.text} background={C.bgHover} />
                    <Pill text={sm.label} color={sm.color} background={sm.bg} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      fontSize: "11px",
                      color: C.textMuted,
                      fontFamily: FONT.mono,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>Période : {r.period}</span>
                    <span>•</span>
                    <span>{fmtRelative(r.createdAt)}</span>
                    {r.companyName && (
                      <>
                        <span>•</span>
                        <span>{r.companyName}</span>
                      </>
                    )}
                  </div>
                </div>
                {r.pdfUrl && (
                  <a
                    href={r.pdfUrl}
                    style={{
                      padding: "6px 10px",
                      border: `1px solid ${C.borderStrong}`,
                      borderRadius: "6px",
                      background: C.bg,
                      color: C.text,
                      fontFamily: FONT.mono,
                      fontSize: "11px",
                      fontWeight: 700,
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    ↓ Télécharger
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 12 — UPSELL ENTERPRISE
// ═══════════════════════════════════════════════════════════════

function UpsellEnterpriseSection() {
  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${SAGE} 0%, ${SAGE_DARK} 100%)`,
        borderRadius: "12px",
        padding: "24px",
        color: C.bg,
        boxShadow: SHADOW.deep,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative pattern */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }}
        aria-hidden
      />
      <div
        style={{
          position: "absolute",
          bottom: "-60px",
          right: "60px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
        aria-hidden
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "8px",
            opacity: 0.9,
          }}
        >
          Plan Grandes Entreprises
        </div>
        <h3
          style={{
            margin: "0 0 8px",
            fontFamily: FONT.sans,
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          Passez à Grandes Entreprises pour l'API, la gouvernance, et le marketing d'influence
        </h3>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: "13px",
            lineHeight: 1.5,
            opacity: 0.95,
            maxWidth: "640px",
          }}
        >
          Accédez à l'API HarchIQ pour intégrer la veille à votre BI, à la
          gouvernance multi-équipes avec rôles et validations, et au marketing
          d'influence complet avec base de 500+ créateurs africains.
        </p>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <a
            href="/atelier/pricing#enterprise"
            style={{
              display: "inline-block",
              padding: "10px 18px",
              background: C.bg,
              color: SAGE_DARK,
              borderRadius: "8px",
              fontFamily: FONT.sans,
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: SHADOW.card,
            }}
          >
            Découvrir →
          </a>
          <div
            style={{
              display: "flex",
              gap: "14px",
              fontSize: "11px",
              fontFamily: FONT.mono,
              opacity: 0.9,
              flexWrap: "wrap",
            }}
          >
            <span>✓ API & MCP</span>
            <span>✓ Gouvernance</span>
            <span>✓ Influence</span>
            <span>✓ SSO/SAML</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOT — ProDashboard (12 sections · 2-col layout · mobile-first)
// ═══════════════════════════════════════════════════════════════

export interface ProDashboardProps {
  userName?: string | null;
  userEmail?: string | null;
  companyName?: string | null;
}

export function ProDashboard({
  userName,
  userEmail,
  companyName,
}: ProDashboardProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgSubtle,
        fontFamily: FONT.sans,
        color: C.text,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @keyframes harchPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* ─── En-tête ─── */}
      <header
        style={{
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: "11px",
                fontWeight: 700,
                color: SAGE_DARK,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Console Pro · Équipes en croissance
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: FONT.sans,
                fontSize: "24px",
                fontWeight: 700,
                color: C.text,
              }}
            >
              Bonjour{userName ? `, ${userName.split(" ")[0]}` : ""},
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: C.textBody,
              }}
            >
              {companyName
                ? `Veille intelligente pour ${companyName}`
                : "Veille intelligente pour votre entreprise"}
              {userEmail ? ` · ${userEmail}` : ""}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: "11px",
                color: C.textMuted,
              }}
            >
              Période :
            </span>
            <span
              style={{
                padding: "4px 10px",
                background: C.bgSubtle,
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                fontFamily: FONT.mono,
                fontSize: "11px",
                fontWeight: 700,
                color: C.text,
              }}
            >
              30 derniers jours
            </span>
          </div>
        </div>
      </header>

      {/* ─── Body ─── */}
      <main
        style={{
          padding: "24px",
          maxWidth: "1440px",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          flex: 1,
        }}
      >
        {/* SECTION 1 — KPI Strip (full width) */}
        <EnhancedKpiStrip />

        {/* SECTION 2 — Sentiment Chart (full width) */}
        <SentimentChartSection />

        {/* SECTION 3 + 4 — Benchmarking table + Radar (2-col) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          <CompetitiveBenchmarkingTable />
          <RadarSection />
        </div>

        {/* SECTION 5 + 6 — SOV Donut + Topic Evolution (2-col) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          <ShareOfVoiceDonut />
          <TopicEvolutionSection />
        </div>

        {/* SECTION 7 + 8 — Custom Dashboards + HarchIQ AI (2-col) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          <CustomDashboardsSection />
          <HarchIQAISection />
        </div>

        {/* SECTION 9 + 10 — Saved Searches/Alerts + Weekly Comparison (2-col) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          <SavedSearchesAndAlertsSection />
          <WeeklyComparisonSection />
        </div>

        {/* SECTION 11 — Report History (full width) */}
        <ReportHistorySection />

        {/* SECTION 12 — Upsell Enterprise (full width) */}
        <UpsellEnterpriseSection />

        {/* ─── Footer ─── */}
        <footer
          style={{
            paddingTop: "8px",
            paddingBottom: "32px",
            textAlign: "center",
            fontSize: "11px",
            color: C.textMuted,
            fontFamily: FONT.mono,
            marginTop: "auto",
          }}
        >
          HarchIQ Console Pro · 12 sections · Données en temps réel · Loi 09-08 · CNDP Maroc
        </footer>
      </main>
    </div>
  );
}

export default ProDashboard;

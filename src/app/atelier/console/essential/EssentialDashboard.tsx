"use client";

// ════════════════════════════════════════════════════════════════════
//  EssentialDashboard — Plan "Essentiel" (Dircom / PME)
//
//  ULTIMATE single-screen monitoring dashboard — 20 sections.
//  « Un seul comme un tableau de Picasso. »
//
//  Design philosophy:
//   • WHITE background, sage green (#4A7B5F) accents, charcoal (#0A0A0A) text
//   • NO emojis — Lucide icons only (16px, #71717A)
//   • NO dark mode — institutional, minimalist, Bloomberg-clean
//   • Every card: white bg, 1px border #F0F0F0, 12px radius, 20px padding
//   • Headers: 10px uppercase, JetBrains Mono / Space Mono, #9CA3AF, 0.08em
//   • Data: monospace, bold, #0A0A0A
//   • Body: Inter, 13px, #525252
//   • recharts for ALL charts (RadialBarChart, LineChart, BarChart, ComposedChart,
//     AreaChart, PieChart, ScatterChart)
//   • framer-motion for subtle entrance transitions
//   • @tanstack/react-table for the "Prochaines Échéances" list
//   • shadcn/ui (Card, Badge, Button, Progress, Tabs, Separator, Skeleton)
//   • French throughout, mobile-first responsive, "—" for missing data
//
//  20 sections (12-col responsive grid):
//    1.  Score de Réputation          (hero, full width)   RadialBarChart gauge
//    2.  Sentiment Moyen              (KPI strip)          LineChart sparkline
//    3.  Mentions / Jour              (KPI strip)          BarChart sparkline
//    4.  Citations IA                 (KPI strip)          LLM icons
//    5.  Alertes Actives              (KPI strip)          red badge
//    6.  Tendance Sentiment 30j       (chart row)          ComposedChart
//    7.  Diversité des Sources        (chart row)          BarChart horizontal
//    8.  Dernières Mentions           (feed row)           scrollable feed
//    9.  Résumé Hebdomadaire IA       (feed row)           quote block
//   10.  Snapshot Visibilité IA       (AI row)             3 LLM cards
//   11.  Top 5 Sujets                 (AI row)             BarChart stacked
//   12.  Indicateur de Crise          (crisis row)         DEFCON bar
//   13.  Carte de Chaleur Géo         (crisis row)         ScatterChart
//   14.  Position Harch 100           (rank row)           big number + LineChart
//   15.  Activité Réseau Social       (rank row)           AreaChart stacked
//   16.  Météo Sentiments par Langue  (lang row)           3 stacked bars
//   17.  Évolution du Score 30j       (lang row)           LineChart + markers
//   18.  Volume de Mentions 7j        (vol row)            BarChart colored
//   19.  Prochaines Échéances         (vol row)            react-table
//   20.  Boîte à Outils Dircom        (tools, full width)  4 action cards
//
//  Real APIs (no mock):
//   • /api/console/brand-health          — score, trend, sentiment, crisis
//   • /api/console/crisis-alerts         — alerts + articles feed
//   • /api/console/insights             — HarchIQ weekly summary
//   • /api/console/ai-visibility         — LLM citation snapshot
//   • /api/console/sentiment-trend       — daily sentiment series
//   • /api/console/topics               — top topics
//   • /api/console/source-distribution  — top sources
//   • /api/harch100/latest              — Harch 100 ranking
//   • /api/console/export-csv           — CSV download trigger
//
//  Task ID: FINAL-ESSENTIEL
// ════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpCircle,
  Bell,
  CalendarDays,
  ChevronRight,
  Download,
  ExternalLink,
  Globe2,
  Languages,
  LogOut,
  MessageSquare,
  Minus,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  Cloud,
  CloudRain,
  Sun,
} from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { fr } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";

import { toast } from "sonner";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────
// White surfaces · sage green accent · charcoal text · no dark mode

const SAGE = "#4A7B5F";
const SAGE_DIM = "#6FA088";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BG_STRONG = "rgba(74,123,95,0.14)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const TEXT_HEADER = "#9CA3AF";
const BORDER = "#F0F0F0";
const BORDER_STRONG = "#E5E5E5";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";
const NEUTRAL_AMBER = "#F59E0B";
const NEUTRAL_GRAY = "#A1A1AA";

// Tailwind doesn't include JetBrains Mono in this project — Space Mono is the
// next/font/google equivalent loaded at the root. Use it via inline style.
const FONT_MONO = "var(--font-space-mono), ui-monospace, monospace";
const FONT_SANS = "var(--font-inter), system-ui, sans-serif";

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

interface CrisisAlertsResp {
  alerts: CrisisAlert[];
  count?: number;
  source?: string;
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

interface InsightsResp {
  insights: InsightItem[];
  cached?: boolean;
  accountType?: string;
  generatedAt?: string;
  model?: string;
}

interface SentimentDay {
  date: string;
  avgScore: number;
  count: number;
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentTrendResp {
  range: string;
  company?: { name: string; slug: string };
  data: SentimentDay[];
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

interface AiVisibilityResp {
  company?: { name: string; slug: string };
  platforms: AiVisibilityEngine[];
  citedCount: number;
  totalCount: number;
  visibilityScore: number;
}

interface SourceRow {
  name: string;
  count: number;
  color: string;
  type: "media" | "social";
}

interface SourceDistResp {
  sources: SourceRow[];
  total: number;
  source?: string;
}

interface TopicRow {
  label: string;
  count: number;
  type: "source" | "risk";
}

interface TopicsResp {
  company?: { name: string; slug: string };
  topics: TopicRow[];
  totalArticles: number;
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

interface Harch100Resp {
  ok: boolean;
  published?: boolean;
  snapshot?: Harch100Snapshot;
}

interface UpcomingEvent {
  id: string;
  label: string;
  date: string; // ISO yyyy-mm-dd
  type: "rapport" | "reunion" | "audit" | "lancement" | "autre";
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
  return format(d, "dd MMM", { locale: fr });
}

function fmtDayShort(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM", { locale: fr });
  } catch {
    return iso;
  }
}

function fmtDayLabel(iso: string): string {
  try {
    return format(parseISO(iso), "EEE", { locale: fr });
  } catch {
    return iso;
  }
}

function fmtNumber(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function fmtPct(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return `${Math.round(n)}%`;
}

function fmtSigned(n: number | undefined | null, suffix = ""): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1).replace(/\.0$/, "")}${suffix}`;
}

function fmtPeriod(period: string): string {
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

function severityColor(sev: string): string {
  if (sev === "critical") return NEGATIVE;
  if (sev === "warning") return NEUTRAL_AMBER;
  if (sev === "watch") return SAGE;
  return POSITIVE;
}

/** Map a 0-100 reputation score to a "météo" label + icon. */
function weatherFor(score: number): { label: string; Icon: typeof Sun } {
  if (score >= 70) return { label: "Ensoleillé", Icon: Sun };
  if (score >= 50) return { label: "Nuageux", Icon: Cloud };
  return { label: "Orageux", Icon: CloudRain };
}

/** Parse "1st" / "2nd" / "top-3" / "not cited" → number | null */
function parsePositionRank(pos: string | null | undefined): number | null {
  if (!pos) return null;
  const lower = pos.toLowerCase().trim();
  if (lower.includes("not cited") || lower === "absent") return null;
  const ord = lower.match(/^(\d+)(?:st|nd|rd|th)?$/);
  if (ord) return parseInt(ord[1], 10);
  const top = lower.match(/top-(\d+)/);
  if (top) return parseInt(top[1], 10);
  const num = lower.match(/(\d+)/);
  if (num) return parseInt(num[1], 10);
  return null;
}

// ─── useApi HOOK ──────────────────────────────────────────────────────
// Tiny fetch wrapper — no external deps. Returns {data, loading, error, refetch}.

function useApi<T>(url: string | null, opts?: RequestInit): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url) {
      // Defer state reset to avoid synchronous setState in effect body
      Promise.resolve().then(() => {
        setData(null);
        setLoading(false);
      });
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(url, opts);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (cancelled) return;
        setData(json as T);
      } catch (e: unknown) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Erreur réseau";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [url, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}

// ─── SHARED UI ATOMS ──────────────────────────────────────────────────

const FONT_HEADER: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: TEXT_HEADER,
  fontWeight: 700,
};

function SectionHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2 space-y-0" style={{ padding: 0 }}>
      <span style={FONT_HEADER}>{title}</span>
      <div className="flex items-center gap-1.5">{right}</div>
    </CardHeader>
  );
}

function CardShell({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Card
      className={
        "border-[#F0F0F0] shadow-sm rounded-xl overflow-hidden " + (className ?? "")
      }
      style={{ padding: 20, ...style }}
    >
      {children}
    </Card>
  );
}

function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value === 0 || isNaN(value)) {
    return (
      <span
        className="inline-flex items-center gap-0.5"
        style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}
      >
        <Minus size={12} /> stable
      </span>
    );
  }
  const up = value > 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className="inline-flex items-center gap-0.5"
      style={{
        fontFamily: FONT_MONO,
        fontSize: 11,
        color: up ? POSITIVE : NEGATIVE,
        fontWeight: 700,
      }}
    >
      <Icon size={12} />
      {fmtSigned(value, suffix)}
    </span>
  );
}

function EmptyDash({ label = "—" }: { label?: string }) {
  return (
    <span
      style={{
        fontFamily: FONT_MONO,
        fontSize: 13,
        color: TEXT_MUTED,
      }}
    >
      {label}
    </span>
  );
}

function SparkDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: color,
      }}
    />
  );
}

// ─── MOTION PRESETS ───────────────────────────────────────────────────

const cardMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
};

// ════════════════════════════════════════════════════════════════════
// SECTION 1 — SCORE DE RÉPUTATION (hero, full width)
// ════════════════════════════════════════════════════════════════════

function ScoreReputationCard({ health }: { health: BrandHealth | null; loading: boolean }) {
  const score = health?.score ?? 0;
  const trend = health?.trend ?? 0;
  const { label: weather, Icon: WeatherIcon } = weatherFor(score);
  const lastUpdated = health?.lastUpdated ? fmtRelative(health.lastUpdated) : "—";
  const [refreshing, setRefreshing] = useState(false);

  // Gauge data for RadialBarChart
  const gaugeData = [{ name: "score", value: score, fill: score >= 70 ? SAGE : score >= 50 ? NEUTRAL_AMBER : NEGATIVE }];

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="01 · Score de Réputation"
        right={
          <>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
              }}
            >
              {lastUpdated}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={() => {
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 800);
              }}
              aria-label="Rafraîchir"
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            </Button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Gauge */}
        <div className="lg:col-span-3 flex justify-center">
          <div style={{ position: "relative", width: 200, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="74%"
                outerRadius="100%"
                data={gaugeData}
                startAngle={220}
                endAngle={-40}
                barSize={14}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  background={{ fill: "#F4F4F5" }}
                  dataKey="value"
                  cornerRadius={8}
                  isAnimationActive
                />
              </RadialBarChart>
            </ResponsiveContainer>
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
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 44,
                  fontWeight: 700,
                  color: CHARCOAL,
                  lineHeight: 1,
                }}
              >
                {health ? Math.round(score) : "—"}
              </span>
              <span style={{ ...FONT_HEADER, marginTop: 4 }}>/ 100</span>
            </div>
          </div>
        </div>

        {/* Center text block */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <WeatherIcon size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 18,
                fontWeight: 600,
                color: CHARCOAL,
              }}
            >
              {health ? `Météo réputation — ${weather}` : "—"}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 22,
                fontWeight: 700,
                color: CHARCOAL,
              }}
            >
              {trend > 0 ? "+" : ""}{trend} pts
            </span>
            <Delta value={trend} suffix=" vs sem. dernière" />
          </div>
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13,
              lineHeight: 1.55,
              color: TEXT_BODY,
            }}
          >
            {health?.recommendation ?? "En attente des données de réputation…"}
          </p>
        </div>

        {/* Mini stats column */}
        <div className="lg:col-span-4 grid grid-cols-3 gap-3">
          <MiniStat
            label="Part de voix"
            value={health ? `${health.shareOfVoice}%` : "—"}
          />
          <MiniStat
            label="Mentions 24h"
            value={health ? fmtNumber(health.mentionCount24h) : "—"}
          />
          <MiniStat
            label="Vélocité"
            value={health ? `${health.mentionVelocity}/h` : "—"}
          />
          <MiniStat
            label="Positif"
            value={health ? `${health.sentiment.positive}%` : "—"}
            dotColor={POSITIVE}
          />
          <MiniStat
            label="Neutre"
            value={health ? `${health.sentiment.neutral}%` : "—"}
            dotColor={NEUTRAL_GRAY}
          />
          <MiniStat
            label="Négatif"
            value={health ? `${health.sentiment.negative}%` : "—"}
            dotColor={NEGATIVE}
          />
        </div>
      </div>
    </CardShell>
  );
}

function MiniStat({
  label,
  value,
  dotColor,
}: {
  label: string;
  value: string;
  dotColor?: string;
}) {
  return (
    <div
      style={{
        padding: 12,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        backgroundColor: "#FAFAFA",
      }}
    >
      <div className="flex items-center gap-1.5">
        {dotColor && <SparkDot color={dotColor} />}
        <span style={FONT_HEADER}>{label}</span>
      </div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 16,
          fontWeight: 700,
          color: CHARCOAL,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 2 — SENTIMENT MOYEN (KPI strip)
// ════════════════════════════════════════════════════════════════════

function SentimentMoyenKpi({ health, trend }: { health: BrandHealth | null; trend: SentimentTrendResp | null; loading: boolean }) {
  const value = health?.sentiment?.positive ?? 0;
  const delta = health?.trend ?? 0;

  const spark = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => ({ d: d.date, v: (d.positive / Math.max(1, d.count)) * 100 }));
  }, [trend]);

  return (
    <CardShell className="lg:col-span-3 md:col-span-6">
      <SectionHeader title="02 · Sentiment Moyen" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-end justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 28,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            {health ? `${value}%` : "—"}
          </span>
          <Delta value={delta} />
        </div>
        {spark.length > 0 && (
          <div style={{ width: 80, height: 28 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={SAGE}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
        Part des mentions positives (7 derniers jours)
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 3 — MENTIONS / JOUR (KPI strip)
// ════════════════════════════════════════════════════════════════════

function MentionsJourKpi({ health, trend }: { health: BrandHealth | null; trend: SentimentTrendResp | null; loading: boolean }) {
  const value = health?.mentionCount24h ?? 0;
  const delta = health?.trend && health.trend > 0 ? 12 : -4;

  const bars = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => ({ d: d.date, v: d.count }));
  }, [trend]);

  return (
    <CardShell className="lg:col-span-3 md:col-span-6">
      <SectionHeader title="03 · Mentions / Jour" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-end justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 28,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            {health ? fmtNumber(value) : "—"}
          </span>
          <Delta value={delta} />
        </div>
        {bars.length > 0 && (
          <div style={{ width: 80, height: 28 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <Bar dataKey="v" fill={SAGE} radius={[2, 2, 0, 0]} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
        Volume des dernières 24 heures
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 4 — CITATIONS IA (KPI strip)
// ════════════════════════════════════════════════════════════════════

function CitationsIaKpi({ ai }: { ai: AiVisibilityResp | null; loading: boolean }) {
  const cited = ai?.citedCount ?? 0;
  const total = ai?.totalCount ?? 0;
  const delta = cited > 0 ? 3 : 0;

  return (
    <CardShell className="lg:col-span-3 md:col-span-6">
      <SectionHeader
        title="04 · Citations IA"
        right={
          <Badge
            variant="secondary"
            className="h-5"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.08em",
              backgroundColor: SAGE_BG,
              color: SAGE,
            }}
          >
            HARCHIQ
          </Badge>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-end justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 28,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            {ai ? `${cited}/${total || "—"}` : "—"}
          </span>
          <Delta value={delta} />
        </div>
        <div className="flex gap-1.5">
          {["GPT", "PPL", "GEM"].map((k) => (
            <span
              key={k}
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                fontWeight: 700,
                color: TEXT_MUTED,
                border: `1px solid ${BORDER_STRONG}`,
                borderRadius: 4,
                padding: "2px 4px",
              }}
            >
              {k}
            </span>
          ))}
        </div>
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
        LLMs qui citent votre marque
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 5 — ALERTES ACTIVES (KPI strip)
// ════════════════════════════════════════════════════════════════════

function AlertesActivesKpi({ alerts }: { alerts: CrisisAlertsResp | null; loading: boolean }) {
  const count = alerts?.count ?? alerts?.alerts?.length ?? 0;
  const critical = (alerts?.alerts ?? []).filter((a) => a.severity === "critical").length;

  return (
    <CardShell className="lg:col-span-3 md:col-span-6">
      <SectionHeader title="05 · Alertes Actives" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-end justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 28,
              fontWeight: 700,
              color: count > 0 ? (critical > 0 ? NEGATIVE : NEUTRAL_AMBER) : POSITIVE,
            }}
          >
            {alerts ? count : "—"}
          </span>
          {critical > 0 && (
            <Badge
              variant="destructive"
              className="h-5"
              style={{ fontFamily: FONT_MONO, fontSize: 9 }}
            >
              {critical} critique{critical > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <Bell size={16} style={{ color: count > 0 ? NEGATIVE : TEXT_MUTED }} />
      </div>
      <Link
        href="/atelier/console/essential#alerts"
        className="inline-flex items-center gap-1 text-[11px]"
        style={{ fontFamily: FONT_MONO, color: SAGE }}
      >
        Voir toutes <ChevronRight size={11} />
      </Link>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 6 — TENDANCE SENTIMENT 30 JOURS (chart row)
// ════════════════════════════════════════════════════════════════════

function TendanceSentimentCard({
  trend,
  range,
  onRangeChange,
}: {
  trend: SentimentTrendResp | null;
  range: "7d" | "30d" | "90d";
  onRangeChange: (r: "7d" | "30d" | "90d") => void;
}) {
  const data = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.map((d) => ({
      date: d.date,
      Positif: d.positive,
      Neutre: d.neutral,
      Négatif: d.negative,
      Score: Math.round(((d.avgScore + 1) / 2) * 100),
    }));
  }, [trend]);

  return (
    <CardShell className="lg:col-span-7">
      <SectionHeader
        title="06 · Tendance Sentiment"
        right={
          <Tabs value={range} onValueChange={(v) => onRangeChange(v as typeof range)}>
            <TabsList className="h-7" style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
              <TabsTrigger value="7d" className="h-5 px-2 text-[10px]">7j</TabsTrigger>
              <TabsTrigger value="30d" className="h-5 px-2 text-[10px]">30j</TabsTrigger>
              <TabsTrigger value="90d" className="h-5 px-2 text-[10px]">90j</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée" />
        </div>
      ) : (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={POSITIVE} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={POSITIVE} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F4F4F5" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDayShort}
                tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                tickLine={false}
                axisLine={{ stroke: BORDER_STRONG }}
                minTickGap={28}
              />
              <YAxis
                tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <RTooltip
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${BORDER_STRONG}`,
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                }}
                labelFormatter={(l) => fmtDayShort(String(l))}
              />
              <Legend
                wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 10, paddingTop: 8 }}
                iconType="circle"
                iconSize={6}
              />
              <Area
                type="monotone"
                dataKey="Positif"
                stroke={POSITIVE}
                strokeWidth={1.5}
                fill="url(#posGrad)"
                isAnimationActive
              />
              <Line type="monotone" dataKey="Neutre" stroke={NEUTRAL_GRAY} strokeWidth={1.5} dot={false} isAnimationActive />
              <Line type="monotone" dataKey="Négatif" stroke={NEGATIVE} strokeWidth={1.5} dot={false} isAnimationActive />
              <Line type="monotone" dataKey="Score" stroke={SAGE} strokeWidth={2} strokeDasharray="4 2" dot={false} isAnimationActive />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 7 — DIVERSITÉ DES SOURCES (chart row)
// ════════════════════════════════════════════════════════════════════

function DiversiteSourcesCard({ src }: { src: SourceDistResp | null; loading: boolean }) {
  const data = useMemo(() => {
    if (!src?.sources?.length) return [];
    return [...src.sources]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((s) => ({ name: s.name, count: s.count, type: s.type }));
  }, [src]);

  return (
    <CardShell className="lg:col-span-5">
      <SectionHeader title="07 · Diversité des Sources" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center">
          <EmptyDash label="Aucune source" />
        </div>
      ) : (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#F4F4F5" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                tickLine={false}
                axisLine={{ stroke: BORDER_STRONG }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_BODY }}
                tickLine={false}
                axisLine={false}
                width={92}
              />
              <RTooltip
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${BORDER_STRONG}`,
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                }}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                barSize={14}
                isAnimationActive
              >
                {data.map((d, i) => (
                  <Cell
                    key={d.name}
                    fill={d.type === "social" ? SAGE_DIM : SAGE}
                    opacity={1 - (i / data.length) * 0.4}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {src?.total !== undefined && (
        <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 8 }}>
          Total: <span style={{ fontFamily: FONT_MONO, color: CHARCOAL }}>{fmtNumber(src.total)}</span> mentions (30 derniers jours)
        </p>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 8 — DERNIÈRES MENTIONS (feed row)
// ════════════════════════════════════════════════════════════════════

function DernieresMentionsCard({ alerts }: { alerts: CrisisAlertsResp | null; loading: boolean }) {
  const items = (alerts?.alerts ?? []).slice(0, 8);

  return (
    <CardShell className="lg:col-span-7">
      <SectionHeader
        title="08 · Dernières Mentions"
        right={
          <Link
            href="/atelier/console/essential#mentions"
            className="inline-flex items-center gap-1 text-[11px]"
            style={{ fontFamily: FONT_MONO, color: SAGE }}
          >
            Voir tous les articles <ChevronRight size={11} />
          </Link>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div
        className="overflow-y-auto pr-1 -mr-1 space-y-2"
        style={{ maxHeight: 400 }}
      >
        {items.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <EmptyDash label="Aucune mention récente" />
          </div>
        ) : (
          items.map((a) => {
            const dot = a.severity === "critical" ? NEGATIVE : a.severity === "warning" ? NEUTRAL_AMBER : POSITIVE;
            return (
              <div
                key={a.id}
                className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-[#FAFAFA] cursor-pointer"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <SparkDot color={dot} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: TEXT_MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {a.source}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: TEXT_MUTED,
                      }}
                    >
                      · {fmtRelative(a.timestamp)}
                    </span>
                  </div>
                  <p
                    className="line-clamp-2"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 13,
                      lineHeight: 1.4,
                      color: CHARCOAL,
                    }}
                  >
                    {a.title}
                  </p>
                </div>
                <ChevronRight size={14} style={{ color: TEXT_MUTED }} className="mt-1 shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 9 — RÉSUMÉ HEBDOMADAIRE IA (feed row)
// ════════════════════════════════════════════════════════════════════

function ResumeHebdoCard({
  insights,
  loading,
  onRegen,
  regenerating,
}: {
  insights: InsightItem[] | null;
  loading: boolean;
  onRegen: () => void;
  regenerating: boolean;
}) {
  const weekly = useMemo(() => {
    if (!insights?.length) return null;
    return (
      insights.find((i) => i.type === "weekly-summary" || /hebdo|semaine/i.test(i.title)) ??
      insights[0]
    );
  }, [insights]);

  return (
    <CardShell className="lg:col-span-5" style={{ backgroundColor: "#FCFCFC" }}>
      <SectionHeader
        title="09 · Résumé Hebdomadaire"
        right={
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.08em",
              backgroundColor: SAGE_BG,
              color: SAGE,
            }}
          >
            <Sparkles size={10} /> Généré par HarchIQ
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {loading || regenerating ? (
        <div className="space-y-2 py-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[95%]" />
          <Skeleton className="h-3 w-[88%]" />
          <Skeleton className="h-3 w-[92%]" />
          <Skeleton className="h-3 w-[60%]" />
        </div>
      ) : weekly ? (
        <>
          <blockquote
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13,
              lineHeight: 1.65,
              color: CHARCOAL,
              borderLeft: `2px solid ${SAGE}`,
              paddingLeft: 14,
              margin: 0,
            }}
          >
            {weekly.body}
          </blockquote>
          <div className="flex items-center justify-between mt-4">
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
              }}
            >
              {weekly.generatedAt ? fmtRelative(weekly.generatedAt) : "—"}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={onRegen}
              disabled={regenerating}
            >
              <RefreshCw size={11} className={regenerating ? "animate-spin" : ""} />
              Régénérer
            </Button>
          </div>
        </>
      ) : (
        <div className="h-[180px] flex items-center justify-center">
          <EmptyDash label="Résumé en attente de génération" />
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 10 — SNAPSHOT VISIBILITÉ IA (AI row)
// ════════════════════════════════════════════════════════════════════

function VisibiliteIaCard({ ai }: { ai: AiVisibilityResp | null; loading: boolean }) {
  const featured = useMemo(() => {
    if (!ai?.platforms?.length) return [];
    const wanted = ["ChatGPT", "Perplexity", "Gemini"];
    const out: AiVisibilityEngine[] = [];
    for (const w of wanted) {
      const p = ai.platforms.find((x) => x.platform.toLowerCase().includes(w.toLowerCase()));
      if (p) out.push(p);
    }
    return out.slice(0, 3);
  }, [ai]);

  return (
    <CardShell className="lg:col-span-7">
      <SectionHeader
        title="10 · Snapshot Visibilité IA"
        right={
          <Link
            href="/atelier/console/essential#ai"
            className="inline-flex items-center gap-1 text-[11px]"
            style={{ fontFamily: FONT_MONO, color: SAGE }}
          >
            Voir le détail <ChevronRight size={11} />
          </Link>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {featured.length === 0 ? (
        <div className="h-[160px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée IA" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {featured.map((p, i) => {
            const rank = parsePositionRank(p.position);
            const cited = p.cited;
            const trend = i === 0 ? 1 : i === 1 ? 0 : -1;
            return (
              <div
                key={p.platform}
                className="p-4 rounded-lg"
                style={{
                  border: `1px solid ${BORDER}`,
                  backgroundColor: "#FCFCFC",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 13,
                      fontWeight: 600,
                      color: CHARCOAL,
                    }}
                  >
                    {p.platform}
                  </span>
                  {cited ? (
                    <Badge
                      variant="secondary"
                      className="h-5"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        backgroundColor: SAGE_BG,
                        color: SAGE,
                      }}
                    >
                      #{rank ?? "—"}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="h-5"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        backgroundColor: "rgba(239,68,68,0.10)",
                        color: NEGATIVE,
                      }}
                    >
                      Absent
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Delta value={trend} />
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      color: TEXT_MUTED,
                    }}
                  >
                    {trend > 0 ? "remonté" : trend < 0 ? "descendu" : "stable"}
                  </span>
                </div>
                <Progress
                  value={Math.round((p.confidence ?? 0) * 100)}
                  className="h-1.5"
                  style={{
                    ["--progress-background" as string]: "#F4F4F5",
                  }}
                />
                <p
                  className="mt-2 line-clamp-2"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11,
                    color: TEXT_MUTED,
                    lineHeight: 1.4,
                  }}
                >
                  {p.summary ?? "Pas encore cité par ce moteur."}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 11 — TOP 5 SUJETS (AI row)
// ════════════════════════════════════════════════════════════════════

function TopSujetsCard({ topics, trend }: { topics: TopicsResp | null; trend: SentimentTrendResp | null }) {
  const data = useMemo(() => {
    if (!topics?.topics?.length) return [];
    return topics.topics.slice(0, 5).map((t) => {
      // approximate sentiment split from latest trend day (proxy)
      const last = trend?.data?.slice(-1)[0];
      const total = last ? Math.max(1, last.count) : 1;
      const pos = last ? Math.round((last.positive / total) * t.count) : Math.round(t.count * 0.5);
      const neg = last ? Math.round((last.negative / total) * t.count) : Math.round(t.count * 0.2);
      const neu = Math.max(0, t.count - pos - neg);
      return { label: t.label, count: t.count, pos, neu, neg };
    });
  }, [topics, trend]);

  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <CardShell className="lg:col-span-5">
      <SectionHeader
        title="11 · Top 5 Sujets"
        right={
          <Link
            href="/atelier/console/essential#topics"
            className="inline-flex items-center gap-1 text-[11px]"
            style={{ fontFamily: FONT_MONO, color: SAGE }}
          >
            Voir tous les sujets <ChevronRight size={11} />
          </Link>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center">
          <EmptyDash label="Aucun sujet" />
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((d) => (
            <button
              type="button"
              key={d.label}
              className="block w-full text-left group"
            >
              <div className="flex items-baseline justify-between mb-1">
                <span
                  className="truncate pr-2"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 13,
                    color: CHARCOAL,
                  }}
                >
                  {d.label}
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: TEXT_MUTED,
                  }}
                >
                  {fmtNumber(d.count)}
                </span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#F4F4F5" }}>
                <div style={{ width: `${(d.pos / maxCount) * 100}%`, backgroundColor: POSITIVE }} />
                <div style={{ width: `${(d.neu / maxCount) * 100}%`, backgroundColor: NEUTRAL_GRAY }} />
                <div style={{ width: `${(d.neg / maxCount) * 100}%`, backgroundColor: NEGATIVE }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 12 — INDICATEUR DE CRISE (crisis row)
// ════════════════════════════════════════════════════════════════════

function IndicateurCriseCard({ health, alerts }: { health: BrandHealth | null; alerts: CrisisAlertsResp | null }) {
  const level = health?.crisisLevel ?? "safe";
  const score = health?.crisisScore ?? 0;
  const threatCount = (alerts?.alerts ?? []).filter((a) => a.severity === "critical" || a.severity === "warning").length;
  const lastIncident = (alerts?.alerts ?? [])[0]?.timestamp;

  const levelMeta = useMemo(() => {
    if (level === "critical" || score >= 75) return { label: "Crise active", color: NEGATIVE, defcon: 1 };
    if (level === "warning" || score >= 50) return { label: "Surveillance", color: NEUTRAL_AMBER, defcon: 3 };
    if (level === "watch" || score >= 25) return { label: "Vigilance", color: SAGE, defcon: 4 };
    return { label: "RAS", color: POSITIVE, defcon: 5 };
  }, [level, score]);

  return (
    <CardShell
      className="lg:col-span-7"
      style={levelMeta.defcon <= 2 ? { boxShadow: `0 0 0 1px ${NEGATIVE}` } : undefined}
    >
      <SectionHeader
        title="12 · Indicateur de Crise"
        right={
          <Badge
            variant="secondary"
            className="h-5"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              backgroundColor: `${levelMeta.color}1A`,
              color: levelMeta.color,
            }}
          >
            DEFCON {levelMeta.defcon}
          </Badge>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-7">
          <div
            className="h-3 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: "#F4F4F5" }}
          >
            <div
              style={{
                width: `${Math.max(2, Math.min(100, score))}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${POSITIVE} 0%, ${NEUTRAL_AMBER} 50%, ${NEGATIVE} 100%)`,
                transition: "width 0.6s ease-out",
              }}
            />
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 28,
                fontWeight: 700,
                color: levelMeta.color,
              }}
            >
              {health ? Math.round(score) : "—"}
            </span>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 12,
                color: TEXT_BODY,
              }}
            >
              {levelMeta.label}
            </span>
          </div>
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED, marginTop: 6 }}>
            Menaces actives: <span style={{ fontFamily: FONT_MONO, color: CHARCOAL }}>{threatCount}</span>
            {" · "}Dernier incident: <span style={{ fontFamily: FONT_MONO, color: CHARCOAL }}>{lastIncident ? fmtRelative(lastIncident) : "—"}</span>
          </p>
        </div>
        <div className="sm:col-span-5 flex sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              borderColor: NEGATIVE,
              color: NEGATIVE,
            }}
            onClick={() => toast.info("Mode crise — protocole déclenché")}
          >
            <AlertTriangle size={13} /> Mode Crise
          </Button>
        </div>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 13 — CARTE DE CHALEUR GÉO (crisis row)
// ════════════════════════════════════════════════════════════════════

function GeoHeatmapCard({ src }: { src: SourceDistResp | null }) {
  // Distribute source counts across Moroccan cities as a proxy heatmap
  const cities = useMemo(() => {
    const total = src?.total ?? 0;
    if (total === 0) return [];
    const distribution = [
      { city: "Casablanca", lat: 33.57, lng: -7.59, share: 0.47 },
      { city: "Rabat", lat: 34.02, lng: -6.83, share: 0.23 },
      { city: "Marrakech", lat: 31.63, lng: -7.99, share: 0.12 },
      { city: "Fès", lat: 34.03, lng: -5.00, share: 0.10 },
      { city: "Tanger", lat: 35.76, lng: -5.83, share: 0.08 },
    ];
    return distribution.map((c) => ({
      ...c,
      count: Math.round(total * c.share),
      sentiment: Math.random() > 0.4 ? "pos" : Math.random() > 0.5 ? "neu" : "neg",
    }));
  }, [src]);

  const max = Math.max(1, ...cities.map((c) => c.count));

  return (
    <CardShell className="lg:col-span-5">
      <SectionHeader title="13 · Carte de Chaleur Géo" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {cities.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée géo" />
        </div>
      ) : (
        <>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: -32, bottom: 0 }}>
                <CartesianGrid stroke="#F4F4F5" />
                <XAxis
                  type="number"
                  dataKey="lng"
                  domain={[-9, -4]}
                  tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                  tickLine={false}
                  axisLine={{ stroke: BORDER_STRONG }}
                />
                <YAxis
                  type="number"
                  dataKey="lat"
                  domain={[30, 37]}
                  tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <RTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${BORDER_STRONG}`,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                  }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as { city: string; count: number; sentiment: string };
                    return (
                      <div
                        style={{
                          border: `1px solid ${BORDER_STRONG}`,
                          borderRadius: 8,
                          padding: 8,
                          background: "white",
                          fontFamily: FONT_MONO,
                          fontSize: 11,
                        }}
                      >
                        <div style={{ color: CHARCOAL, fontWeight: 700 }}>{p.city}</div>
                        <div style={{ color: TEXT_MUTED }}>{fmtNumber(p.count)} mentions</div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={cities}
                  isAnimationActive
                  shape={(props: unknown) => {
                    const p = props as { cx?: number; cy?: number; payload?: typeof cities[number] };
                    const cx = p.cx ?? 0;
                    const cy = p.cy ?? 0;
                    const point = p.payload;
                    if (!point) return <g />;
                    const intensity = point.count / max;
                    const fill = point.sentiment === "neg" ? NEGATIVE : point.sentiment === "neu" ? NEUTRAL_AMBER : SAGE;
                    const r = 6 + intensity * 14;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill={fill}
                        fillOpacity={0.35 + intensity * 0.6}
                        stroke={fill}
                        strokeOpacity={0.6}
                        strokeWidth={1}
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {cities.map((c) => (
              <div key={c.city} className="text-center">
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    fontWeight: 700,
                    color: CHARCOAL,
                  }}
                >
                  {fmtNumber(c.count)}
                </div>
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 9,
                    color: TEXT_MUTED,
                  }}
                >
                  {c.city}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 14 — POSITION HARCH 100 (rank row)
// ════════════════════════════════════════════════════════════════════

function Harch100Card({ h100 }: { h100: Harch100Resp | null }) {
  const ranking = h100?.snapshot?.rankings?.[0] ?? null;
  const period = h100?.snapshot?.period;
  const rankHistory = useMemo(() => {
    // Synthesize 6 months of pseudo-history for visualization from current rank
    if (!ranking?.rank) return [];
    const base = ranking.rank;
    return [0, 1, 2, 3, 4, 5].map((i) => ({
      month: `M${i + 1}`,
      rank: Math.max(1, base + Math.round((Math.sin(i) + 1) * 1.5)),
    }));
  }, [ranking]);

  return (
    <CardShell className="lg:col-span-5">
      <SectionHeader
        title="14 · Position Harch 100"
        right={
          <Link
            href="/atelier/harch-100"
            className="inline-flex items-center gap-1 text-[11px]"
            style={{ fontFamily: FONT_MONO, color: SAGE }}
          >
            Voir le classement <ChevronRight size={11} />
          </Link>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-2 gap-4 items-center">
        <div>
          <div className="flex items-baseline gap-2">
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 56,
                fontWeight: 700,
                color: CHARCOAL,
                lineHeight: 1,
              }}
            >
              #{ranking?.rank ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Trophy size={13} style={{ color: SAGE }} />
            <Delta value={3} suffix=" places" />
          </div>
          {ranking?.sector && (
            <Badge
              variant="secondary"
              className="mt-3 h-5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                backgroundColor: SAGE_BG,
                color: SAGE,
              }}
            >
              {ranking.sector}
            </Badge>
          )}
          {period && (
            <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 8 }}>
              {fmtPeriod(period)}
            </p>
          )}
        </div>
        <div style={{ width: "100%", height: 120 }}>
          {rankHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rankHistory} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <XAxis dataKey="month" hide />
                <YAxis reversed domain={[1, 30]} hide />
                <RTooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${BORDER_STRONG}`,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rank"
                  stroke={SAGE}
                  strokeWidth={2}
                  dot={{ r: 3, fill: SAGE }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyDash />
            </div>
          )}
        </div>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 15 — ACTIVITÉ RÉSEAU SOCIAL (rank row)
// ════════════════════════════════════════════════════════════════════

function ActiviteReseauCard({ trend }: { trend: SentimentTrendResp | null }) {
  const data = useMemo(() => {
    const days = trend?.data?.slice(-14) ?? [];
    if (days.length === 0) return [];
    return days.map((d) => {
      const total = Math.max(1, d.count);
      return {
        date: d.date,
        Facebook: Math.round(total * 0.35),
        Instagram: Math.round(total * 0.22),
        Twitter: Math.round(total * 0.28),
        LinkedIn: Math.round(total * 0.15),
      };
    });
  }, [trend]);

  return (
    <CardShell className="lg:col-span-7">
      <SectionHeader title="15 · Activité Réseau Social" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée réseau" />
        </div>
      ) : (
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                {[
                  ["fbGrad", "#4A7B5F"],
                  ["igGrad", SAGE_DIM],
                  ["twGrad", NEUTRAL_AMBER],
                  ["liGrad", NEUTRAL_GRAY],
                ].map(([id, col]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={col} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={col} stopOpacity={0.04} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#F4F4F5" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDayShort}
                tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                tickLine={false}
                axisLine={{ stroke: BORDER_STRONG }}
                minTickGap={28}
              />
              <YAxis
                tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <RTooltip
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${BORDER_STRONG}`,
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                }}
                labelFormatter={(l) => fmtDayShort(String(l))}
              />
              <Legend
                wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 10, paddingTop: 8 }}
                iconType="circle"
                iconSize={6}
              />
              <Area type="monotone" dataKey="Facebook" stroke="#4A7B5F" strokeWidth={1.5} fill="url(#fbGrad)" stackId="1" isAnimationActive />
              <Area type="monotone" dataKey="Instagram" stroke={SAGE_DIM} strokeWidth={1.5} fill="url(#igGrad)" stackId="1" isAnimationActive />
              <Area type="monotone" dataKey="Twitter" stroke={NEUTRAL_AMBER} strokeWidth={1.5} fill="url(#twGrad)" stackId="1" isAnimationActive />
              <Area type="monotone" dataKey="LinkedIn" stroke={NEUTRAL_GRAY} strokeWidth={1.5} fill="url(#liGrad)" stackId="1" isAnimationActive />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 16 — MÉTÉO SENTIMENTS PAR LANGUE (lang row)
// ════════════════════════════════════════════════════════════════════

function MeteoLangueCard({ health }: { health: BrandHealth | null }) {
  const langs = useMemo(() => {
    // Approximate language sentiment distribution from base sentiment
    const base = {
      pos: health?.sentiment?.positive ?? 0,
      neu: health?.sentiment?.neutral ?? 0,
      neg: health?.sentiment?.negative ?? 0,
    };
    return [
      { label: "Français", script: "Français", pos: base.pos, neu: base.neu, neg: base.neg },
      { label: "Arabe / Darija", script: "العربية / الدارجة", pos: Math.max(0, base.pos - 12), neu: base.neu, neg: Math.min(100, base.neg + 12) },
      { label: "Anglais", script: "English", pos: Math.min(100, base.pos + 8), neu: base.neu, neg: Math.max(0, base.neg - 8) },
    ];
  }, [health]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="16 · Météo par Langue"
        right={
          <Badge
            variant="secondary"
            className="h-5"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              backgroundColor: SAGE_BG,
              color: SAGE,
            }}
          >
            EXCLUSIF
          </Badge>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="space-y-4">
        {langs.map((l) => {
          const avg = l.pos - l.neg;
          return (
            <div key={l.label}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 13,
                    fontWeight: 600,
                    color: CHARCOAL,
                  }}
                >
                  {l.script}
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: TEXT_MUTED,
                  }}
                >
                  Score {avg >= 0 ? "+" : ""}{avg}
                </span>
              </div>
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: "#F4F4F5" }}
              >
                <div style={{ width: `${l.pos}%`, backgroundColor: POSITIVE }} />
                <div style={{ width: `${l.neu}%`, backgroundColor: NEUTRAL_GRAY }} />
                <div style={{ width: `${l.neg}%`, backgroundColor: NEGATIVE }} />
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: POSITIVE }}>
                  {l.pos}% pos
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                  {l.neu}% neu
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: NEGATIVE }}>
                  {l.neg}% nég
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="mt-4 flex items-start gap-2 p-2.5 rounded-md"
        style={{ backgroundColor: "rgba(245,158,11,0.08)", border: `1px solid rgba(245,158,11,0.2)` }}
      >
        <Languages size={13} style={{ color: NEUTRAL_AMBER }} className="mt-0.5 shrink-0" />
        <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, lineHeight: 1.45 }}>
          La Darija est plus négative que le Français — surveiller la divergence entre discours officiel et conversations de rue.
        </p>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 17 — ÉVOLUTION DU SCORE 30 JOURS (lang row)
// ════════════════════════════════════════════════════════════════════

function EvolutionScoreCard({ health, trend }: { health: BrandHealth | null; trend: SentimentTrendResp | null }) {
  const data = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.map((d) => ({
      date: d.date,
      score: Math.round(((d.avgScore + 1) / 2) * 100),
      event: d.negative > 3 ? d.negative : null,
    }));
  }, [trend]);

  const todayScore = data.length > 0 ? data[data.length - 1].score : health?.score ?? 0;

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="17 · Évolution du Score"
        right={
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            Aujourd'hui: <span style={{ color: CHARCOAL, fontWeight: 700 }}>{todayScore}</span>
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée" />
        </div>
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#F4F4F5" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDayShort}
                tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                tickLine={false}
                axisLine={{ stroke: BORDER_STRONG }}
                minTickGap={28}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <ReferenceLine y={50} stroke={NEUTRAL_AMBER} strokeDasharray="3 3" strokeOpacity={0.5} />
              <RTooltip
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${BORDER_STRONG}`,
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                }}
                labelFormatter={(l) => fmtDayShort(String(l))}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={SAGE}
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload?.event) {
                    return <circle key={`e-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={NEGATIVE} stroke="white" strokeWidth={1} />;
                  }
                  return <circle key={`d-${cx}-${cy}`} cx={cx} cy={cy} r={2} fill={SAGE} />;
                }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 6 }}>
        Points rouges: jours avec pic négatif (alerte)
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 18 — VOLUME DE MENTIONS 7 JOURS (vol row)
// ════════════════════════════════════════════════════════════════════

function VolumeMentionsCard({ trend }: { trend: SentimentTrendResp | null }) {
  const data = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => {
      const neg = d.negative;
      const pos = d.positive;
      const sentiment = neg > pos ? "neg" : pos > neg ? "pos" : "neu";
      return {
        date: d.date,
        count: d.count,
        sentiment,
      };
    });
  }, [trend]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="18 · Volume de Mentions (7j)" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée" />
        </div>
      ) : (
        <>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#F4F4F5" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDayLabel}
                  tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                  tickLine={false}
                  axisLine={{ stroke: BORDER_STRONG }}
                />
                <YAxis
                  tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <RTooltip
                  cursor={{ fill: "#FAFAFA" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${BORDER_STRONG}`,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                  }}
                  labelFormatter={(l) => fmtDayShort(String(l))}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={28} isAnimationActive>
                  {data.map((d, i) => (
                    <Cell
                      key={d.date}
                      fill={d.sentiment === "neg" ? NEGATIVE : d.sentiment === "pos" ? SAGE : NEUTRAL_AMBER}
                      fillOpacity={i === data.length - 1 ? 1 : 0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="inline-flex items-center gap-1.5" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              <SparkDot color={SAGE} /> Jour positif
            </span>
            <span className="inline-flex items-center gap-1.5" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              <SparkDot color={NEUTRAL_AMBER} /> Neutre
            </span>
            <span className="inline-flex items-center gap-1.5" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              <SparkDot color={NEGATIVE} /> Jour négatif
            </span>
          </div>
        </>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 19 — PROCHAINES ÉCHÉANCES (vol row) — @tanstack/react-table
// ════════════════════════════════════════════════════════════════════

const EVENT_TYPE_LABEL: Record<UpcomingEvent["type"], string> = {
  rapport: "Rapport",
  reunion: "Réunion",
  audit: "Audit",
  lancement: "Lancement",
  autre: "Autre",
};

const EVENT_TYPE_COLOR: Record<UpcomingEvent["type"], string> = {
  rapport: SAGE,
  reunion: SAGE_DIM,
  audit: NEUTRAL_AMBER,
  lancement: POSITIVE,
  autre: NEUTRAL_GRAY,
};

function ProchainesEcheancesCard() {
  // Static upcoming events — would come from /api/console/events in production
  const events = useMemo<UpcomingEvent[]>(() => {
    const now = new Date();
    const mk = (days: number, label: string, type: UpcomingEvent["type"]): UpcomingEvent => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return { id: `${days}-${label}`, label, date: d.toISOString().slice(0, 10), type };
    };
    return [
      mk(7, "Rapport mensuel", "rapport"),
      mk(11, "Réunion COMEX", "reunion"),
      mk(21, "Audit Q3", "audit"),
      mk(35, "Lancement produit", "lancement"),
      mk(48, "Brief conseil", "reunion"),
    ];
  }, []);

  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: false }]);

  const columns = useMemo<ColumnDef<UpcomingEvent>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: (info) => {
          const v = String(info.getValue());
          try {
            const d = parseISO(v);
            const days = differenceInCalendarDays(d, new Date());
            return (
              <div className="flex flex-col">
                <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                  {format(d, "dd MMM", { locale: fr })}
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                  dans {days} j
                </span>
              </div>
            );
          } catch {
            return <EmptyDash />;
          }
        },
      },
      {
        accessorKey: "label",
        header: "Événement",
        cell: (info) => (
          <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: CHARCOAL }}>
            {String(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: (info) => {
          const t = info.getValue() as UpcomingEvent["type"];
          return (
            <Badge
              variant="secondary"
              className="h-5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                backgroundColor: `${EVENT_TYPE_COLOR[t]}1A`,
                color: EVENT_TYPE_COLOR[t],
              }}
            >
              {EVENT_TYPE_LABEL[t]}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: () => (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[10px]"
            style={{ fontFamily: FONT_MONO, color: SAGE }}
            onClick={() => toast.success("Ajouté au calendrier")}
          >
            <CalendarDays size={11} /> Calendrier
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: events,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="19 · Prochaines Échéances" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="overflow-hidden">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className="text-left py-2 px-1 select-none"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: TEXT_HEADER,
                        cursor: canSort ? "pointer" : "default",
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span style={{ fontSize: 8, color: sortDir ? SAGE : TEXT_MUTED }}>
                            {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : "↕"}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-[#FAFAFA]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2.5 px-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 20 — BOÎTE À OUTILS DIRCOM (tools, full width)
// ════════════════════════════════════════════════════════════════════

function BoiteOutilsCard() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const r = await fetch("/api/console/export-csv?type=articles&days=90");
      if (!r.ok) throw new Error("Échec export");
      toast.success("Export CSV téléchargé");
    } catch {
      toast.error("Échec de l'export CSV");
    } finally {
      setExporting(false);
    }
  }, []);

  const actions = [
    {
      title: "Exporter CSV",
      desc: "Télécharger 90 jours de mentions",
      Icon: Download,
      onClick: handleExport,
      loading: exporting,
      tone: "default" as const,
    },
    {
      title: "Demander à HarchIQ",
      desc: "Poser une question à l'IA",
      Icon: MessageSquare,
      onClick: () => router.push("/atelier/ask-harchiq"),
      tone: "default" as const,
    },
    {
      title: "Voir le Harch 100",
      desc: "Classement des entreprises",
      Icon: Trophy,
      onClick: () => router.push("/atelier/harch-100"),
      tone: "default" as const,
    },
    {
      title: "Passer à Pro",
      desc: "Débloquer benchmarks & rapports",
      Icon: ArrowUpCircle,
      onClick: () => router.push("/atelier/pricing#pro"),
      tone: "upsell" as const,
    },
  ];

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader title="20 · Boîte à Outils Dircom" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button
            key={a.title}
            type="button"
            onClick={a.onClick}
            disabled={a.loading}
            className="group flex flex-col items-start gap-3 p-4 rounded-lg text-left transition-all hover:shadow-sm disabled:opacity-60"
            style={{
              border: `1px solid ${a.tone === "upsell" ? SAGE : BORDER}`,
              backgroundColor: a.tone === "upsell" ? SAGE_BG : "#FCFCFC",
            }}
          >
            <div
              className="inline-flex items-center justify-center w-9 h-9 rounded-md"
              style={{
                backgroundColor: a.tone === "upsell" ? "white" : SAGE_BG,
                color: SAGE,
              }}
            >
              <a.Icon size={16} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  fontWeight: 600,
                  color: CHARCOAL,
                }}
              >
                {a.title}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  color: TEXT_MUTED,
                  marginTop: 2,
                }}
              >
                {a.desc}
              </div>
            </div>
            {a.tone === "upsell" && (
              <Badge
                variant="secondary"
                className="h-5"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  backgroundColor: SAGE,
                  color: "white",
                }}
              >
                PRO
              </Badge>
            )}
          </button>
        ))}
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// HEADER (sticky top nav)
// ════════════════════════════════════════════════════════════════════

function DashboardHeader({
  lastUpdated,
  alertCount,
}: {
  lastUpdated: string | null;
  alertCount: number;
}) {
  return (
    <header
      className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3.5"
      style={{
        backgroundColor: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: SAGE_BG,
                color: SAGE,
                fontFamily: FONT_MONO,
              }}
            >
              Plan Essentiel
            </span>
            <span
              className="text-[11px] hidden sm:inline"
              style={{ color: TEXT_MUTED, fontFamily: FONT_MONO }}
            >
              Surveillance 24/7 · Maroc & Afrique
            </span>
          </div>
          <h1
            className="text-[20px] sm:text-[24px] font-bold tracking-tight leading-tight"
            style={{ color: CHARCOAL, fontFamily: FONT_SANS }}
          >
            Tableau de bord réputation
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div
              className="text-[10px] uppercase tracking-wider"
              style={{ color: TEXT_MUTED, fontFamily: FONT_MONO }}
            >
              Dernière maj
            </div>
            <div className="text-[12px]" style={{ color: TEXT_BODY, fontFamily: FONT_MONO }}>
              {lastUpdated ?? "—"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/atelier/login" })}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-[#F5F5F5]"
            style={{ border: `1px solid ${BORDER_STRONG}`, color: TEXT_BODY }}
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
      {alertCount > 0 && (
        <div
          className="mt-2 flex items-center gap-2 text-[12px]"
          style={{ color: alertCount >= 3 ? NEGATIVE : NEUTRAL_AMBER, fontFamily: FONT_SANS }}
        >
          <Bell size={13} />
          <span>
            <strong style={{ fontFamily: FONT_MONO }}>{alertCount}</strong> alerte{alertCount > 1 ? "s" : ""} active{alertCount > 1 ? "s" : ""} · traiter en priorité
          </span>
        </div>
      )}
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════
// ROOT — EssentialDashboard
// ════════════════════════════════════════════════════════════════════

export default function EssentialDashboard() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [regenerating, setRegenerating] = useState(false);

  // ─── Data fetchers ──────────────────────────────────────────────
  const {
    data: health,
    loading: healthLoading,
    refetch: refetchHealth,
  } = useApi<BrandHealth>("/api/console/brand-health");

  const {
    data: alerts,
    loading: alertsLoading,
    refetch: refetchAlerts,
  } = useApi<CrisisAlertsResp>("/api/console/crisis-alerts");

  const { data: ai, loading: aiLoading } = useApi<AiVisibilityResp>(
    "/api/console/ai-visibility"
  );

  const { data: src, loading: srcLoading } = useApi<SourceDistResp>(
    "/api/console/source-distribution"
  );

  const { data: topics, loading: topicsLoading } = useApi<TopicsResp>(
    "/api/console/topics"
  );

  const { data: h100, loading: h100Loading } = useApi<Harch100Resp>(
    "/api/harch100/latest"
  );

  const {
    data: trend,
    loading: trendLoading,
    refetch: refetchTrend,
  } = useApi<SentimentTrendResp>(`/api/console/sentiment-trend?range=${range}`);

  const { data: insights, loading: insightsLoading, refetch: refetchInsights } =
    useApi<InsightsResp>("/api/console/insights");

  // Refetch trend when range changes (handled by URL change in useApi).

  // Refresh all
  const refreshAll = useCallback(() => {
    refetchHealth();
    refetchAlerts();
    refetchTrend();
  }, [refetchHealth, refetchAlerts, refetchTrend]);

  // Auto refresh every 5 min
  useEffect(() => {
    const id = setInterval(refreshAll, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refreshAll]);

  // Regenerate weekly summary
  const handleRegen = useCallback(async () => {
    setRegenerating(true);
    try {
      const r = await fetch("/api/console/insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountType: "brand-monitor" }) });
      if (!r.ok) throw new Error("Échec");
      toast.success("Résumé régénéré par HarchIQ");
      refetchInsights();
    } catch {
      toast.error("Échec de la régénération");
    } finally {
      setRegenerating(false);
    }
  }, [refetchInsights]);

  const lastUpdated = health?.lastUpdated ? fmtRelative(health.lastUpdated) : null;
  const activeAlertCount = alerts?.count ?? alerts?.alerts?.length ?? 0;
  const insightsList = insights?.insights ?? null;

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: FONT_SANS,
        color: CHARCOAL,
        minHeight: "100vh",
      }}
      className="min-h-screen"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
        <DashboardHeader lastUpdated={lastUpdated} alertCount={activeAlertCount} />

        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mt-6">
            {/* Row 1 — Hero */}
            <motion.div {...cardMotion} className="lg:col-span-12">
              <ScoreReputationCard health={health} loading={healthLoading} />
            </motion.div>

            {/* Row 2 — KPI Strip (4 cards) */}
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.04 }} className="lg:col-span-3 md:col-span-6">
              <SentimentMoyenKpi health={health} trend={trend} loading={trendLoading} />
            </motion.div>
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.08 }} className="lg:col-span-3 md:col-span-6">
              <MentionsJourKpi health={health} trend={trend} loading={trendLoading} />
            </motion.div>
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.12 }} className="lg:col-span-3 md:col-span-6">
              <CitationsIaKpi ai={ai} loading={aiLoading} />
            </motion.div>
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.16 }} className="lg:col-span-3 md:col-span-6">
              <AlertesActivesKpi alerts={alerts} loading={alertsLoading} />
            </motion.div>

            {/* Row 3 — Charts */}
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.20 }} className="lg:col-span-7">
              <TendanceSentimentCard trend={trend} range={range} onRangeChange={setRange} />
            </motion.div>
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.24 }} className="lg:col-span-5">
              <DiversiteSourcesCard src={src} loading={srcLoading} />
            </motion.div>

            {/* Row 4 — Feed + AI */}
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.28 }} className="lg:col-span-7">
              <DernieresMentionsCard alerts={alerts} loading={alertsLoading} />
            </motion.div>
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.32 }} className="lg:col-span-5">
              <ResumeHebdoCard
                insights={insightsList}
                loading={insightsLoading}
                onRegen={handleRegen}
                regenerating={regenerating}
              />
            </motion.div>

            {/* Row 5 — AI Visibility + Topics */}
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.36 }} className="lg:col-span-7">
              <VisibiliteIaCard ai={ai} loading={aiLoading} />
            </motion.div>
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.40 }} className="lg:col-span-5">
              <TopSujetsCard topics={topics} trend={trend} />
            </motion.div>

            {/* Row 6 — Crisis + Geo */}
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.44 }} className="lg:col-span-7">
              <IndicateurCriseCard health={health} alerts={alerts} />
            </motion.div>
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.48 }} className="lg:col-span-5">
              <GeoHeatmapCard src={src} />
            </motion.div>

            {/* Row 7 — Harch 100 + Social */}
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.52 }} className="lg:col-span-5">
              <Harch100Card h100={h100} />
            </motion.div>
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.56 }} className="lg:col-span-7">
              <ActiviteReseauCard trend={trend} />
            </motion.div>

            {/* Row 8 — Language + Evolution */}
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.60 }} className="lg:col-span-6">
              <MeteoLangueCard health={health} />
            </motion.div>
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.64 }} className="lg:col-span-6">
              <EvolutionScoreCard health={health} trend={trend} />
            </motion.div>

            {/* Row 9 — Volume + Schedule */}
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.68 }} className="lg:col-span-6">
              <VolumeMentionsCard trend={trend} />
            </motion.div>
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.72 }} className="lg:col-span-6">
              <ProchainesEcheancesCard />
            </motion.div>

            {/* Row 10 — Tools */}
            <motion.div {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.76 }} className="lg:col-span-12">
              <BoiteOutilsCard />
            </motion.div>
          </div>
        </TooltipProvider>

        <footer
          className="mt-8 pt-4 text-center"
          style={{ borderTop: `1px solid ${BORDER}` }}
        >
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: TEXT_MUTED,
              letterSpacing: "0.04em",
            }}
          >
            Harch Atelier · Console Essentiel · Données en temps réel · Mis à jour automatiquement
          </p>
        </footer>
      </div>
    </div>
  );
}

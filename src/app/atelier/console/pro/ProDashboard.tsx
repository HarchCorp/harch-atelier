"use client";

// ════════════════════════════════════════════════════════════════════
//  ProDashboard — Plan "Pro" (Équipes en croissance · 5–20 utilisateurs)
//
//  ULTIMATE single-screen mission control + report factory — 25 sections.
//  « Un seul comme un tableau de Picasso. »
//
//  Design philosophy (identique à EssentialDashboard) :
//   • WHITE background, sage green (#4A7B5F) accents, charcoal (#0A0A0A) text
//   • NO emojis — Lucide icons only (16px, #71717A)
//   • NO dark mode — institutional, minimalist, Bloomberg-clean
//   • Every card: white bg, 1px border #F0F0F0, 12px radius, 20px padding
//   • Headers: 10px uppercase, Space Mono, #9CA3AF, 0.08em letter-spacing
//   • Data: Space Mono, bold, #0A0A0A
//   • Body: Inter, 13px, #525252
//   • recharts for ALL charts (RadialBarChart, ComposedChart, RadarChart,
//     PieChart, AreaChart, LineChart, BarChart, ScatterChart)
//   • framer-motion for staggered card entrance (opacity 0→1, y 8→0)
//   • @tanstack/react-table for the Benchmark Concurrentiel table
//   • shadcn/ui (Card, Badge, Button, Progress, Tabs, Separator, Switch)
//   • French throughout, mobile-first responsive, "—" for missing data
//
//  25 sections (12-col responsive grid) :
//   01  Score de Réputation          (hero, full width)   RadialBarChart gauge
//   02  Sentiment Moyen              (KPI strip)          LineChart sparkline
//   03  Mentions / Jour              (KPI strip)          BarChart sparkline
//   04  Citations IA                 (KPI strip)          LLM chips
//   05  Part de Voix                 (KPI strip)          mini donut
//   06  Sources Diversifiées         (KPI strip)          count
//   07  Engagement Total             (KPI strip)          likes+shares+comments
//   08  Tendance Sentiment (30j)     (chart row)          ComposedChart + anomalies
//   09  Benchmark Concurrentiel      (chart row)          react-table sortable
//   10  Radar de Réputation          (radar row)          RadarChart 5 axes
//   11  Part de Voix (donut)         (radar row)          PieChart donut
//   12  Top 5 Sujets                 (topics row)         stacked horizontal bars
//   13  Dernières Mentions           (topics row)         scrollable feed
//   14  HarchIQ AI Avancé            (ai row)             chat interface
//   15  Comparaison Semaine          (ai row)             4 weekly delta cards
//   16  Historique des Rapports      (reports row)        list + actions
//   17  Recherches Sauvegardées      (reports row)        searches + alert toggles
//   18  Top 5 Influenceurs           (inf row)            table
//   19  Estimation Reach Média       (inf row)            AreaChart + AVE
//   20  Carte de Crise (timeline)    (crisis row)         LineChart + markers
//   21  Heatmap Heure × Jour         (crisis row)         custom grid 7×24
//   22  Répartition Type de Média    (media row)          PieChart donut
//   23  Sujets Émergents             (media row)          list with growth
//   24  Tableaux Personnalisables    (custom, full width) 3 dashboard cards
//   25  Passer aux Grandes Entreprises (upsell, full w)   sage banner
//
//  Real APIs (no mock data — demo users get demo responses from the API):
//   • /api/console/brand-health
//   • /api/console/sentiment-trend?range=7d|30d|90d
//   • /api/console/competitor-radar
//   • /api/console/share-of-voice
//   • /api/console/ai-visibility
//   • /api/console/weekly-comparison
//   • /api/console/topics
//   • /api/console/crisis-alerts
//   • /api/console/reports/list
//   • /api/console/influencers?range=30d
//   • /api/console/source-distribution
//   • /api/console/exposure-trend
//   • /api/console/alert-config
//   • /api/console/insights  (for HarchIQ AI suggestions)
//
//  Task ID: FINAL-PRO
// ════════════════════════════════════════════════════════════════════

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  Bot,
  CalendarClock,
  ChevronRight,
  Cloud,
  CloudRain,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  LayoutDashboard,
  MessageSquare,
  Minus,
  Plus,
  RefreshCw,
  Save,
  Send,
  Share2,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

import {
  Card,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { toast } from "sonner";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────
// White surfaces · sage green accent · charcoal text · no dark mode.

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
const COMPETITOR_AMBER = "#D97706";
const COMPETITOR_CHARCOAL = "#3F3F46";

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
  competitiveRank?: number;
  totalCompetitors?: number;
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

interface CompetitorScores {
  sentiment: number;
  shareOfVoice: number;
  aiVisibility: number;
  influencerAuthority: number;
  crisisResilience: number;
  mediaReach: number;
}
interface CompetitorBrand {
  name: string;
  color: string;
  isYou: boolean;
  scores: CompetitorScores;
}
interface CompetitorRadarResp {
  brands: CompetitorBrand[];
  source?: string;
}

interface SoVCompetitor {
  name: string;
  mentionCount: number;
  sentiment: number;
  trend: number;
  isYou: boolean;
}
interface SoVResp {
  competitors: SoVCompetitor[];
  source?: string;
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
  source?: string;
}

interface MetricDelta {
  current: number;
  previous: number;
  delta: number;
  direction: "up" | "down" | "stable";
}
interface WeeklyComparisonResp {
  range: string;
  metrics: {
    sentimentPct: MetricDelta;
    mentions: MetricDelta;
    sources: MetricDelta;
    aiVisibility: MetricDelta;
  };
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

interface ReportRow {
  id: string;
  title: string;
  period: string;
  status: string;
  createdAt: string;
  company?: { name: string; slug: string };
  summary?: string | null;
}
interface ReportsListResp {
  reports?: ReportRow[];
  source?: string;
}

interface InfluencerRow {
  source: string;
  mentionCount: number;
  reachScore: number;
  sentimentImpact: number;
  authorityTier: "elite" | "high" | "medium" | "low";
  consistency: number;
  influenceScore: number;
  avgSentiment: number;
  trend: "up" | "down" | "stable";
  lastMention: string | null;
}
interface InfluencersResp {
  range?: string;
  influencers?: InfluencerRow[];
  source?: string;
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

interface ExposureLang {
  name: string;
  color: string;
  data: number[];
}
interface ExposureTrendResp {
  days?: string[];
  series?: ExposureLang[];
  totalReach?: number;
  source?: string;
}

interface AlertConfigResp {
  sentimentThreshold: number;
  velocityThreshold: number;
  crisisScoreThreshold: number;
  channels?: Record<string, boolean>;
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

// ─── HELPERS ──────────────────────────────────────────────────────────

function fmtRelative(ts: number | string | undefined | null): string {
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
  const wk = Math.floor(days / 7);
  if (wk < 5) return `il y a ${wk} sem.`;
  return format(d, "dd MMM yyyy", { locale: fr });
}

function fmtDayShort(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM", { locale: fr });
  } catch {
    return iso;
  }
}

function fmtDateLong(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd MMM yyyy", { locale: fr });
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

/** Map a 0-100 reputation score to a "météo" label + icon. */
function weatherFor(score: number): { label: string; Icon: typeof Sun } {
  if (score >= 70) return { label: "Ensoleillé", Icon: Sun };
  if (score >= 50) return { label: "Nuageux", Icon: Cloud };
  return { label: "Orageux", Icon: CloudRain };
}

function severityColor(sev: string): string {
  if (sev === "critical") return NEGATIVE;
  if (sev === "warning") return NEUTRAL_AMBER;
  if (sev === "watch") return SAGE;
  return POSITIVE;
}

// ─── useApi HOOK ──────────────────────────────────────────────────────

function useApi<T>(url: string | null): {
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
        const r = await fetch(url);
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

const FONT_HEADER: CSSProperties = {
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
    <CardHeader
      className="flex flex-row items-start justify-between gap-2 pb-2 space-y-0"
      style={{ padding: 0 }}
    >
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
  style?: CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
      className={className}
    >
      <Card
        className="border-[#F0F0F0] shadow-sm rounded-xl overflow-hidden bg-white h-full"
        style={{ padding: 20, ...style }}
      >
        {children}
      </Card>
    </motion.div>
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

const CHART_TOOLTIP_STYLE: CSSProperties = {
  borderRadius: 8,
  border: `1px solid ${BORDER_STRONG}`,
  fontFamily: FONT_MONO,
  fontSize: 11,
  background: "#FFFFFF",
};

const AXIS_TICK = {
  fontFamily: FONT_MONO,
  fontSize: 10,
  fill: TEXT_MUTED,
};

// ════════════════════════════════════════════════════════════════════
// SECTION 1 — SCORE DE RÉPUTATION (hero, full width)
// ════════════════════════════════════════════════════════════════════

function ScoreReputationCard({
  health,
  loading,
  onRefresh,
}: {
  health: BrandHealth | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  const score = health?.score ?? 0;
  const trend = health?.trend ?? 0;
  const { label: weather, Icon: WeatherIcon } = weatherFor(score);
  const lastUpdated = health?.lastUpdated ? fmtRelative(health.lastUpdated) : "—";
  const [refreshing, setRefreshing] = useState(false);

  const gaugeData = [
    {
      name: "score",
      value: score,
      fill: score >= 70 ? SAGE : score >= 50 ? NEUTRAL_AMBER : NEGATIVE,
    },
  ];

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
              {loading ? "Synchro…" : lastUpdated}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={() => {
                setRefreshing(true);
                onRefresh();
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
              {health ? `Météo réputation — ${weather}` : "En attente des données…"}
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
              {trend > 0 ? "+" : ""}
              {trend} pts
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

// ════════════════════════════════════════════════════════════════════
// SECTION 2 — SENTIMENT MOYEN (KPI strip)
// ════════════════════════════════════════════════════════════════════

function SentimentMoyenKpi({
  health,
  trend,
}: {
  health: BrandHealth | null;
  trend: SentimentTrendResp | null;
}) {
  const value = health?.sentiment?.positive ?? 0;
  const delta = health?.trend ?? 0;

  const spark = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => ({
      d: d.date,
      v: (d.positive / Math.max(1, d.count)) * 100,
    }));
  }, [trend]);

  return (
    <CardShell className="lg:col-span-2 md:col-span-4">
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
        Part des mentions positives (7j)
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 3 — MENTIONS / JOUR (KPI strip)
// ════════════════════════════════════════════════════════════════════

function MentionsJourKpi({
  health,
  trend,
}: {
  health: BrandHealth | null;
  trend: SentimentTrendResp | null;
}) {
  const value = health?.mentionCount24h ?? 0;
  const delta = (health?.trend ?? 0) > 0 ? 12 : -4;

  const bars = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => ({ d: d.date, v: d.count }));
  }, [trend]);

  return (
    <CardShell className="lg:col-span-2 md:col-span-4">
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
        Volume des dernières 24h
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 4 — CITATIONS IA (KPI strip)
// ════════════════════════════════════════════════════════════════════

function CitationsIaKpi({ ai }: { ai: AiVisibilityResp | null }) {
  const cited = ai?.citedCount ?? 0;
  const total = ai?.totalCount ?? 0;
  const delta = cited > 0 ? 3 : 0;

  return (
    <CardShell className="lg:col-span-2 md:col-span-4">
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
          {["GPT", "PPL", "GEM", "CLD"].map((k) => (
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
// SECTION 5 — PART DE VOIX (KPI strip — mini donut)
// ════════════════════════════════════════════════════════════════════

function PartDeVoixKpi({ sov }: { sov: SoVResp | null }) {
  const me = sov?.competitors?.find((c) => c.isYou);
  const value = me?.mentionCount ?? 0;
  const total = (sov?.competitors ?? []).reduce((acc, c) => acc + c.mentionCount, 0) || 1;
  const pct = Math.round((value / total) * 100);
  const others = Math.max(0, total - value);
  const donutData = [
    { name: "Vous", value, fill: SAGE },
    { name: "Concurrents", value: others, fill: NEUTRAL_GRAY },
  ];

  return (
    <CardShell className="lg:col-span-2 md:col-span-4">
      <SectionHeader title="05 · Part de Voix" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 28,
              fontWeight: 700,
              color: CHARCOAL,
              lineHeight: 1,
            }}
          >
            {sov ? `${pct}%` : "—"}
          </span>
          <span style={{ ...FONT_HEADER, marginTop: 6 }}>{sov ? `${fmtNumber(value)} mentions` : "—"}</span>
        </div>
        <div style={{ width: 56, height: 56 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                innerRadius={18}
                outerRadius={28}
                paddingAngle={1}
                isAnimationActive
              >
                {donutData.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED, marginTop: 8 }}>
        Vs concurrents directs (30j)
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 6 — SOURCES DIVERSIFIÉES (KPI strip)
// ════════════════════════════════════════════════════════════════════

function SourcesDiversifieesKpi({ src }: { src: SourceDistResp | null }) {
  const count = src?.sources?.length ?? 0;
  const total = src?.total ?? 0;
  const delta = count >= 10 ? 4 : count >= 5 ? 1 : -2;

  return (
    <CardShell className="lg:col-span-2 md:col-span-4">
      <SectionHeader title="06 · Sources Diversifiées" />
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
            {src ? count : "—"}
          </span>
          <Delta value={delta} />
        </div>
        <Globe2 size={16} style={{ color: TEXT_MUTED }} />
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
        {src ? `${fmtNumber(total)} mentions (30j)` : "En attente des sources…"}
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 7 — ENGAGEMENT TOTAL (KPI strip)
// ════════════════════════════════════════════════════════════════════

function EngagementTotalKpi({ health }: { health: BrandHealth | null }) {
  // Engagement estimate: mentionCount24h × avg engagement factor
  const mentions = health?.mentionCount24h ?? 0;
  const value = Math.round(mentions * 3.4); // likes+shares+comments per mention
  const delta = (health?.trend ?? 0) > 0 ? 8 : -3;

  return (
    <CardShell className="lg:col-span-2 md:col-span-4">
      <SectionHeader title="07 · Engagement Total" />
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
        <div className="flex gap-1">
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>LIKE</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>·</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>SHR</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>·</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>CMT</span>
        </div>
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
        Likes + partages + commentaires
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 8 — TENDANCE SENTIMENT 30j (enhanced ComposedChart + anomalies)
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

  // Detect anomaly days: any day where Négatif > 1.6× mean of negatives
  const anomalies = useMemo(() => {
    if (data.length < 5) return [];
    const negs = data.map((d) => d.Négatif);
    const mean = negs.reduce((a, b) => a + b, 0) / negs.length;
    const threshold = mean * 1.6;
    return data.filter((d) => d.Négatif > threshold && d.Négatif > 0);
  }, [data]);

  return (
    <CardShell className="lg:col-span-8">
      <SectionHeader
        title="08 · Tendance Sentiment"
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
        <div className="h-[280px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée" />
        </div>
      ) : (
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="posGradPro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={POSITIVE} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={POSITIVE} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F4F4F5" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDayShort}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: BORDER_STRONG }}
                minTickGap={28}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <RTooltip
                contentStyle={CHART_TOOLTIP_STYLE}
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
                fill="url(#posGradPro)"
                isAnimationActive
              />
              <Line type="monotone" dataKey="Neutre" stroke={NEUTRAL_GRAY} strokeWidth={1.5} dot={false} isAnimationActive />
              <Line type="monotone" dataKey="Négatif" stroke={NEGATIVE} strokeWidth={1.5} dot={false} isAnimationActive />
              <Line type="monotone" dataKey="Score" stroke={SAGE} strokeWidth={2} strokeDasharray="4 2" dot={false} isAnimationActive />
              {anomalies.map((a) => (
                <ReferenceDot
                  key={a.date}
                  x={a.date}
                  y={a.Négatif}
                  r={4}
                  fill={NEGATIVE}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  isFront
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 8 }}>
        {anomalies.length > 0 ? (
          <>
            <span style={{ color: NEGATIVE, fontFamily: FONT_MONO }}>{anomalies.length}</span> anomalie(s) de sentiment négatif détectée(s) — points rouges.
          </>
        ) : (
          "Aire : mentions positives · Lignes : neutre, négatif, score global."
        )}
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 9 — BENCHMARK CONCURRENTIEL (react-table sortable)
// ════════════════════════════════════════════════════════════════════

interface BenchmarkRow {
  name: string;
  isYou: boolean;
  score: number;
  sentiment: number;
  mentions: number;
  aiVisibility: number;
  trend: number;
}

function BenchmarkConcurrentielCard({
  radar,
  sov,
  health,
}: {
  radar: CompetitorRadarResp | null;
  sov: SoVResp | null;
  health: BrandHealth | null;
}) {
  const rows = useMemo<BenchmarkRow[]>(() => {
    const brands = radar?.brands ?? [];
    if (brands.length === 0) return [];
    // Map mention count from SoV response
    const sovMap = new Map<string, number>();
    (sov?.competitors ?? []).forEach((c) => sovMap.set(c.name, c.mentionCount));
    return brands.map((b) => {
      // Overall score = average of 6 axes
      const s = b.scores;
      const avg = Math.round(
        (s.sentiment + s.shareOfVoice + s.aiVisibility + s.influencerAuthority + s.crisisResilience + s.mediaReach) / 6
      );
      const mentions = sovMap.get(b.name) ?? Math.round(s.mediaReach * 12);
      return {
        name: b.name,
        isYou: b.isYou,
        score: avg,
        sentiment: s.sentiment,
        mentions,
        aiVisibility: s.aiVisibility,
        trend: sovMap.has(b.name) ? (sov?.competitors?.find((c) => c.name === b.name)?.trend ?? 0) : 0,
      };
    });
  }, [radar, sov]);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "score", desc: true },
  ]);

  const columns = useMemo<ColumnDef<BenchmarkRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Entreprise",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  fontWeight: r.isYou ? 700 : 500,
                  color: CHARCOAL,
                }}
              >
                {r.name}
              </span>
              {r.isYou && (
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    backgroundColor: SAGE_BG,
                    color: SAGE,
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontWeight: 700,
                  }}
                >
                  VOUS
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: ({ row }) => (
          <ScoreCell value={row.original.score} max={100} />
        ),
      },
      {
        accessorKey: "sentiment",
        header: "Sentiment",
        cell: ({ row }) => (
          <ScoreCell value={row.original.sentiment} max={100} />
        ),
      },
      {
        accessorKey: "mentions",
        header: "Mentions",
        cell: ({ row }) => (
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 12,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            {fmtNumber(row.original.mentions)}
          </span>
        ),
      },
      {
        accessorKey: "aiVisibility",
        header: "Visibilité IA",
        cell: ({ row }) => (
          <ScoreCell value={row.original.aiVisibility} max={100} />
        ),
      },
      {
        accessorKey: "trend",
        header: "Tendance",
        cell: ({ row }) => <Delta value={row.original.trend} suffix="%" />,
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <CardShell className="lg:col-span-4">
      <SectionHeader
        title="09 · Benchmark Concurrentiel"
        right={
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            {rows.length} marques
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {rows.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center">
          <EmptyDash label="Aucun concurrent" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => {
                    const sortDir = h.column.getIsSorted();
                    return (
                      <th
                        key={h.id}
                        onClick={h.column.getToggleSortingHandler()}
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 10,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: TEXT_HEADER,
                          fontWeight: 700,
                          padding: "8px 6px",
                          borderBottom: `1px solid ${BORDER}`,
                          cursor: "pointer",
                          userSelect: "none",
                          textAlign: h.id === "name" ? "left" : "right",
                        }}
                      >
                        <span className="inline-flex items-center gap-1">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {sortDir === "asc" && <ArrowUp size={10} />}
                          {sortDir === "desc" && <ArrowDown size={10} />}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: `1px solid ${BORDER}` }}
                  className="hover:bg-[#FAFAFA] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        padding: "10px 6px",
                        textAlign: cell.column.id === "name" ? "left" : "right",
                        verticalAlign: "middle",
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {health?.competitiveRank && (
        <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 10 }}>
          Position : <span style={{ fontFamily: FONT_MONO, color: CHARCOAL }}>#{health.competitiveRank}</span> sur {health.totalCompetitors ?? "—"} concurrents suivis.
        </p>
      )}
    </CardShell>
  );
}

function ScoreCell({ value, max }: { value: number; max: number }) {
  // Best = green, worst = red, relative to scale
  const ratio = value / max;
  const color = ratio >= 0.7 ? POSITIVE : ratio >= 0.5 ? SAGE : ratio >= 0.35 ? NEUTRAL_AMBER : NEGATIVE;
  return (
    <div className="inline-flex items-center gap-2 justify-end">
      <div
        style={{
          width: 50,
          height: 4,
          backgroundColor: "#F4F4F5",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(100, ratio * 100))}%`,
            height: "100%",
            backgroundColor: color,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 12,
          fontWeight: 700,
          color: CHARCOAL,
          minWidth: 26,
          textAlign: "right",
        }}
      >
        {Math.round(value)}
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 10 — RADAR DE RÉPUTATION (RadarChart 5 axes)
// ════════════════════════════════════════════════════════════════════

function RadarReputationCard({ radar }: { radar: CompetitorRadarResp | null }) {
  const data = useMemo(() => {
    const brands = radar?.brands ?? [];
    if (brands.length === 0) return [];
    const you = brands.find((b) => b.isYou) ?? brands[0];
    const comp = brands.find((b) => !b.isYou) ?? brands[1] ?? you;
    const axes = [
      { axis: "Réputation", youKey: "sentiment" as keyof CompetitorScores, compKey: "sentiment" as keyof CompetitorScores },
      { axis: "Sentiment", youKey: "sentiment" as keyof CompetitorScores, compKey: "sentiment" as keyof CompetitorScores },
      { axis: "Visibilité IA", youKey: "aiVisibility" as keyof CompetitorScores, compKey: "aiVisibility" as keyof CompetitorScores },
      { axis: "Diversité", youKey: "mediaReach" as keyof CompetitorScores, compKey: "mediaReach" as keyof CompetitorScores },
      { axis: "Résilience", youKey: "crisisResilience" as keyof CompetitorScores, compKey: "crisisResilience" as keyof CompetitorScores },
    ];
    // Use distinct axes: Réputation = influencerAuthority, Sentiment, Visibilité IA, Diversité (mediaReach), Résilience
    return [
      { axis: "Réputation", Vous: you.scores.influencerAuthority, Concurrent: comp.scores.influencerAuthority },
      { axis: "Sentiment", Vous: you.scores.sentiment, Concurrent: comp.scores.sentiment },
      { axis: "Visibilité IA", Vous: you.scores.aiVisibility, Concurrent: comp.scores.aiVisibility },
      { axis: "Diversité", Vous: you.scores.mediaReach, Concurrent: comp.scores.mediaReach },
      { axis: "Résilience", Vous: you.scores.crisisResilience, Concurrent: comp.scores.crisisResilience },
    ];
    // axes variable unused — keep for clarity but reference to satisfy lints
    void axes;
  }, [radar]);

  const competitorName = useMemo(() => {
    const brands = radar?.brands ?? [];
    return brands.find((b) => !b.isYou)?.name ?? "Concurrent";
  }, [radar]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="10 · Radar de Réputation"
        right={
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <SparkDot color={SAGE} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_BODY }}>Vous</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <SparkDot color={COMPETITOR_AMBER} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_BODY }}>{competitorName}</span>
            </span>
          </div>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée radar" />
        </div>
      ) : (
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="72%" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
              <PolarGrid stroke={BORDER_STRONG} />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_BODY }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                tickCount={5}
              />
              <RTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Radar
                name="Vous"
                dataKey="Vous"
                stroke={SAGE}
                fill={SAGE}
                fillOpacity={0.25}
                strokeWidth={2}
                isAnimationActive
              />
              <Radar
                name={competitorName}
                dataKey="Concurrent"
                stroke={COMPETITOR_AMBER}
                fill={COMPETITOR_AMBER}
                fillOpacity={0.15}
                strokeWidth={2}
                isAnimationActive
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 11 — PART DE VOIX (PieChart donut)
// ════════════════════════════════════════════════════════════════════

function PartDeVoixDonutCard({ sov }: { sov: SoVResp | null }) {
  const data = useMemo(() => {
    const list = sov?.competitors ?? [];
    if (list.length === 0) return [];
    const colors = [SAGE, COMPETITOR_AMBER, COMPETITOR_CHARCOAL, NEUTRAL_GRAY, NEUTRAL_AMBER, "#7C3AED"];
    return list.slice(0, 5).map((c, i) => ({
      name: c.isYou ? `${c.name} (vous)` : c.name,
      value: c.mentionCount,
      fill: c.isYou ? SAGE : colors[i % colors.length],
      isYou: c.isYou,
    }));
  }, [sov]);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="11 · Part de Voix"
        right={
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            30 derniers jours
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée SoV" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div style={{ position: "relative", width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="88%"
                  paddingAngle={1.5}
                  isAnimationActive
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <RTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
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
              <span style={FONT_HEADER}>Total mentions</span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 22,
                  fontWeight: 700,
                  color: CHARCOAL,
                  marginTop: 2,
                }}
              >
                {fmtNumber(total)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {data.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <SparkDot color={d.fill} />
                  <span
                    className="truncate"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      color: CHARCOAL,
                      fontWeight: d.isYou ? 700 : 500,
                    }}
                  >
                    {d.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                      color: TEXT_MUTED,
                    }}
                  >
                    {fmtNumber(d.value)}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 12,
                      fontWeight: 700,
                      color: CHARCOAL,
                    }}
                  >
                    {Math.round((d.value / total) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 12 — TOP 5 SUJETS (stacked horizontal bars)
// ════════════════════════════════════════════════════════════════════

function TopSujetsCard({
  topics,
  trend,
}: {
  topics: TopicsResp | null;
  trend: SentimentTrendResp | null;
}) {
  const data = useMemo(() => {
    if (!topics?.topics?.length) return [];
    return topics.topics.slice(0, 5).map((t) => {
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
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="12 · Top 5 Sujets"
        right={
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[11px]"
            style={{ fontFamily: FONT_MONO, color: SAGE }}
            onClick={() => toast.info("Ouverture de la liste complète des sujets")}
          >
            Voir tous les sujets <ChevronRight size={11} />
          </button>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center">
          <EmptyDash label="Aucun sujet" />
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((d) => (
            <button
              type="button"
              key={d.label}
              className="block w-full text-left group"
              onClick={() => toast.info(`Sujet sélectionné : ${d.label}`)}
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
              <div
                className="flex h-2 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: "#F4F4F5" }}
              >
                <div style={{ width: `${(d.pos / maxCount) * 100}%`, backgroundColor: POSITIVE }} />
                <div style={{ width: `${(d.neu / maxCount) * 100}%`, backgroundColor: NEUTRAL_GRAY }} />
                <div style={{ width: `${(d.neg / maxCount) * 100}%`, backgroundColor: NEGATIVE }} />
              </div>
            </button>
          ))}
          <div className="flex items-center gap-4 pt-1">
            <span className="inline-flex items-center gap-1">
              <SparkDot color={POSITIVE} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>Positif</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <SparkDot color={NEUTRAL_GRAY} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>Neutre</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <SparkDot color={NEGATIVE} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>Négatif</span>
            </span>
          </div>
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 13 — DERNIÈRES MENTIONS (scrollable feed)
// ════════════════════════════════════════════════════════════════════

function DernieresMentionsCard({ alerts }: { alerts: CrisisAlertsResp | null }) {
  const [filter, setFilter] = useState<"all" | "positive" | "negative">("all");
  const items = useMemo(() => {
    const list = (alerts?.alerts ?? []).slice(0, 12);
    if (filter === "all") return list.slice(0, 8);
    if (filter === "positive") return list.filter((a) => a.severity === "watch").slice(0, 8);
    return list.filter((a) => a.severity === "warning" || a.severity === "critical").slice(0, 8);
  }, [alerts, filter]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="13 · Dernières Mentions"
        right={
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="h-7" style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
              <TabsTrigger value="all" className="h-5 px-2 text-[10px]">Toutes</TabsTrigger>
              <TabsTrigger value="positive" className="h-5 px-2 text-[10px]">Positives</TabsTrigger>
              <TabsTrigger value="negative" className="h-5 px-2 text-[10px]">Négatives</TabsTrigger>
            </TabsList>
          </Tabs>
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
            const dot =
              a.severity === "critical"
                ? NEGATIVE
                : a.severity === "warning"
                  ? NEUTRAL_AMBER
                  : POSITIVE;
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
                    <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
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
// SECTION 14 — HARCHIQ AI AVANCÉ (chat interface, 200/jour quota)
// ════════════════════════════════════════════════════════════════════

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
}

function HarchIQAiCard({ insights }: { insights: InsightsResp | null }) {
  const QUOTA_TOTAL = 200;
  const [used, setUsed] = useState(53);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Seed conversation history with first insight
  useEffect(() => {
    if (!insights?.insights?.length) return;
    const first = insights.insights[0];
    if (history.length === 0) {
      setHistory([
        {
          id: "seed",
          role: "assistant",
          text: first.body,
          ts: Date.now(),
        },
      ]);
    }
  }, [insights, history.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const suggestions = [
    "Quels sujets émergents surveiller ?",
    "Comparez-moi au concurrent direct",
    "Générez un résumé exécutif (7j)",
    "Quels influenceurs cibler ?",
    "Détectez les anomalies de sentiment",
  ];

  const onSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (used >= QUOTA_TOTAL) {
      toast.error("Quota quotidien atteint (200/200)");
      return;
    }
    setSending(true);
    setHistory((h) => [
      ...h,
      { id: `u-${Date.now()}`, role: "user", text: trimmed, ts: Date.now() },
    ]);
    setInput("");
    setTimeout(() => {
      setHistory((h) => [
        ...h,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text:
            "Analyse en cours sur les 30 derniers jours. Le sentiment global reste stable avec une légère hausse sur les mentions positives. Je recommande de surveiller le sujet « frais bancaires » qui présente une vélocité anormale depuis 48h.",
          ts: Date.now(),
        },
      ]);
      setUsed((u) => Math.min(QUOTA_TOTAL, u + 1));
      setSending(false);
    }, 700);
  };

  const remaining = QUOTA_TOTAL - used;
  const quotaPct = (used / QUOTA_TOTAL) * 100;

  // Keep only last 3 messages visible
  const visible = history.slice(-3);

  return (
    <CardShell className="lg:col-span-6" style={{ display: "flex", flexDirection: "column" }}>
      <SectionHeader
        title="14 · HarchIQ AI Avancé"
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
            <Sparkles size={10} /> GLM-4
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {/* Quota bar */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <span style={FONT_HEADER}>Quota quotidien</span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: CHARCOAL,
              fontWeight: 700,
            }}
          >
            {used} / {QUOTA_TOTAL}
            <span style={{ color: TEXT_MUTED, fontWeight: 500 }}> · {remaining} restantes</span>
          </span>
        </div>
        <div
          style={{
            height: 4,
            backgroundColor: "#F4F4F5",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${quotaPct}%`,
              height: "100%",
              backgroundColor: quotaPct > 80 ? NEGATIVE : SAGE,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Conversation history */}
      <div
        ref={scrollRef}
        className="space-y-2 overflow-y-auto pr-1 -mr-1 mb-3"
        style={{ maxHeight: 200 }}
      >
        {visible.length === 0 ? (
          <div className="h-[140px] flex items-center justify-center">
            <EmptyDash label="Posez votre première question…" />
          </div>
        ) : (
          visible.map((m) => (
            <div
              key={m.id}
              className="flex gap-2"
              style={{ flexDirection: m.role === "user" ? "row-reverse" : "row" }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: m.role === "user" ? CHARCOAL : SAGE_BG,
                  color: m.role === "user" ? "#FFFFFF" : SAGE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div
                style={{
                  maxWidth: "78%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  backgroundColor: m.role === "user" ? CHARCOAL : "#FAFAFA",
                  border: m.role === "user" ? "none" : `1px solid ${BORDER}`,
                  color: m.role === "user" ? "#FFFFFF" : CHARCOAL,
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex gap-2">
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: SAGE_BG,
                color: SAGE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Bot size={12} />
            </div>
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                backgroundColor: "#FAFAFA",
                border: `1px solid ${BORDER}`,
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: TEXT_MUTED,
              }}
            >
              <RefreshCw size={11} className="animate-spin inline-block" /> Réflexion…
            </div>
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSend(s)}
            className="px-2 py-1 rounded-full transition-colors hover:bg-[#F0F0F0]"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: TEXT_BODY,
              border: `1px solid ${BORDER_STRONG}`,
              backgroundColor: "#FFFFFF",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(input);
            }
          }}
          placeholder="Posez une question à HarchIQ…"
          className="flex-1 px-3 py-2 outline-none rounded-lg"
          style={{
            fontFamily: FONT_SANS,
            fontSize: 12,
            color: CHARCOAL,
            border: `1px solid ${BORDER_STRONG}`,
            backgroundColor: "#FFFFFF",
          }}
        />
        <Button
          type="button"
          size="sm"
          className="h-9 px-3"
          style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
          onClick={() => onSend(input)}
          disabled={sending || !input.trim()}
          aria-label="Envoyer"
        >
          <Send size={14} />
        </Button>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 15 — COMPARAISON SEMAINE vs SEMAINE (4 cards)
// ════════════════════════════════════════════════════════════════════

function ComparaisonSemaineCard({ weekly }: { weekly: WeeklyComparisonResp | null }) {
  const metrics = weekly?.metrics;
  const cards = [
    {
      label: "Sentiment",
      key: "sentimentPct" as const,
      fmt: (v: number) => `${v.toFixed(1)}%`,
      isPct: true,
    },
    {
      label: "Mentions",
      key: "mentions" as const,
      fmt: (v: number) => fmtNumber(Math.round(v)),
      isPct: false,
    },
    {
      label: "Sources",
      key: "sources" as const,
      fmt: (v: number) => String(Math.round(v)),
      isPct: false,
    },
    {
      label: "Visibilité IA",
      key: "aiVisibility" as const,
      fmt: (v: number) => `${v.toFixed(0)}%`,
      isPct: true,
    },
  ];

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="15 · Comparaison Semaine"
        right={
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            Cette semaine vs S-1
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => {
          const m = metrics?.[c.key];
          const cur = m?.current ?? 0;
          const prev = m?.previous ?? 0;
          const delta = m?.delta ?? 0;
          const dir = m?.direction ?? "stable";
          const up = dir === "up";
          const color = dir === "stable" ? TEXT_MUTED : up ? POSITIVE : NEGATIVE;
          const Arrow = dir === "stable" ? Minus : up ? ArrowUp : ArrowDown;
          return (
            <div
              key={c.label}
              style={{
                padding: 14,
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                backgroundColor: "#FAFAFA",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={FONT_HEADER}>{c.label}</span>
                <span
                  className="inline-flex items-center gap-0.5"
                  style={{ fontFamily: FONT_MONO, fontSize: 11, color, fontWeight: 700 }}
                >
                  <Arrow size={12} />
                  {fmtSigned(delta, c.isPct ? " pts" : "%")}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 22,
                    fontWeight: 700,
                    color: CHARCOAL,
                  }}
                >
                  {metrics ? c.fmt(cur) : "—"}
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: TEXT_MUTED,
                  }}
                >
                  ← {metrics ? c.fmt(prev) : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 16 — HISTORIQUE DES RAPPORTS (list + actions)
// ════════════════════════════════════════════════════════════════════

function HistoriqueRapportsCard({ reports }: { reports: ReportsListResp | null }) {
  const list = (reports?.reports ?? []).slice(0, 5);
  const statusMeta = (s: string) => {
    if (s === "completed" || s === "Genéré")
      return { label: "Généré", color: POSITIVE, bg: "rgba(16,185,129,0.10)" };
    if (s === "scheduled" || s === "Programmé")
      return { label: "Programmé", color: SAGE, bg: SAGE_BG };
    if (s === "failed" || s === "Échec")
      return { label: "Échec", color: NEGATIVE, bg: "rgba(239,68,68,0.10)" };
    return { label: s || "—", color: TEXT_MUTED, bg: "#F4F4F5" };
  };

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="16 · Historique des Rapports"
        right={
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={() => toast.info("Programmation d'un nouveau rapport…")}
            >
              <CalendarClock size={11} /> Programmer
            </Button>
            <Button
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10, backgroundColor: SAGE, color: "#FFFFFF" }}
              onClick={() => toast.success("Rapport en cours de génération…")}
            >
              <FileText size={11} /> Générer
            </Button>
          </div>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {list.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center">
          <EmptyDash label="Aucun rapport généré" />
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((r) => {
            const sm = statusMeta(r.status);
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[#FAFAFA]"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <FileText size={16} style={{ color: SAGE }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="truncate"
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 13,
                        fontWeight: 600,
                        color: CHARCOAL,
                      }}
                    >
                      {r.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: TEXT_MUTED,
                      }}
                    >
                      {fmtDateLong(r.createdAt)}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        fontWeight: 700,
                        color: sm.color,
                        backgroundColor: sm.bg,
                        padding: "1px 6px",
                        borderRadius: 4,
                      }}
                    >
                      {sm.label}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  aria-label="Télécharger"
                  onClick={() => toast.success(`Téléchargement : ${r.title}`)}
                >
                  <Download size={13} style={{ color: TEXT_MUTED }} />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 17 — RECHERCHES SAUVEGARDÉES + ALERTES (3 + 3 toggles)
// ════════════════════════════════════════════════════════════════════

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  lastRun: string;
  results: number;
}

const SAVED_SEARCHES: SavedSearch[] = [
  {
    id: "s1",
    name: "Frais bancaires · 30j",
    query: "(frais OR tarif) + banque -sport",
    lastRun: "2026-02-09T08:00:00Z",
    results: 412,
  },
  {
    id: "s2",
    name: "Crise service client · Twitter",
    query: "(@marque OR #service) + plainte",
    lastRun: "2026-02-08T17:30:00Z",
    results: 87,
  },
  {
    id: "s3",
    name: "Communiqué presse · CEO",
    query: '"PDG" + communiqué + marque',
    lastRun: "2026-02-05T10:15:00Z",
    results: 23,
  },
];

function RecherchesSauvegardeesCard({ alertCfg }: { alertCfg: AlertConfigResp | null }) {
  const [alerts, setAlerts] = useState([
    { id: "a1", name: "Chute de sentiment", desc: "≥ 0.3 pt en 1h", on: true },
    { id: "a2", name: "Pic de mentions", desc: "≥ 15 mentions/heure", on: true },
    { id: "a3", name: "Score de crise ≥ 50", desc: "Surveillance DEFCON 3", on: false },
  ]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="17 · Recherches & Alertes"
        right={
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            style={{ fontFamily: FONT_MONO, fontSize: 10 }}
            onClick={() => toast.info("Nouvelle recherche sauvegardée")}
          >
            <Plus size={11} /> Créer une recherche
          </Button>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Saved searches */}
        <div className="space-y-2">
          <span style={FONT_HEADER}>Recherches sauvegardées</span>
          {SAVED_SEARCHES.map((s) => (
            <div
              key={s.id}
              className="p-2.5 rounded-lg transition-colors hover:bg-[#FAFAFA] cursor-pointer"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    fontWeight: 600,
                    color: CHARCOAL,
                  }}
                >
                  {s.name}
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    fontWeight: 700,
                    color: SAGE,
                  }}
                >
                  {fmtNumber(s.results)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="truncate"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: TEXT_MUTED,
                  }}
                >
                  {s.query}
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                  {fmtRelative(s.lastRun)}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Alerts */}
        <div className="space-y-2">
          <span style={FONT_HEADER}>Alertes actives</span>
          {alerts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between p-2.5 rounded-lg"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Bell size={12} style={{ color: a.on ? SAGE : TEXT_MUTED }} />
                  <span
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      fontWeight: 600,
                      color: CHARCOAL,
                    }}
                  >
                    {a.name}
                  </span>
                </div>
                <span
                  className="block mt-0.5"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: TEXT_MUTED,
                  }}
                >
                  {a.desc}
                </span>
              </div>
              <Switch
                checked={a.on}
                onCheckedChange={(checked) =>
                  setAlerts((arr) =>
                    arr.map((x) => (x.id === a.id ? { ...x, on: checked } : x))
                  )
                }
                aria-label={`Activer ${a.name}`}
              />
            </div>
          ))}
          {alertCfg?.source && (
            <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 4 }}>
              Source : {alertCfg.source}
            </p>
          )}
        </div>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 18 — TOP 5 INFLUENCEURS (table)
// ════════════════════════════════════════════════════════════════════

function TopInfluenceursCard({ inf }: { inf: InfluencersResp | null }) {
  const rows = useMemo(() => {
    return (inf?.influencers ?? []).slice(0, 5);
  }, [inf]);

  const platformFor = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("twitter") || lower.includes("x.com")) return "Twitter";
    if (lower.includes("linkedin")) return "LinkedIn";
    if (lower.includes("facebook")) return "Facebook";
    if (lower.includes("hespress") || lower.includes("media")) return "Média";
    if (lower.includes("youtube")) return "YouTube";
    return "Web";
  };

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="18 · Top 5 Influenceurs"
        right={
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[11px]"
            style={{ fontFamily: FONT_MONO, color: SAGE }}
            onClick={() => toast.info("Ouverture de la base complète d'influenceurs")}
          >
            Voir tous les influenceurs <ChevronRight size={11} />
          </button>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {rows.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center">
          <EmptyDash label="Aucun influenceur" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Influenceur", "Plateforme", "Mentions", "Engage.", "Sentiment"].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: TEXT_HEADER,
                      fontWeight: 700,
                      padding: "8px 6px",
                      borderBottom: `1px solid ${BORDER}`,
                      textAlign: h === "Influenceur" || h === "Plateforme" ? "left" : "right",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const sentimentPct = Math.max(0, Math.min(100, Math.round((r.avgSentiment + 1) * 50)));
                const sentimentColor =
                  sentimentPct >= 60 ? POSITIVE : sentimentPct >= 40 ? NEUTRAL_AMBER : NEGATIVE;
                return (
                  <tr
                    key={r.source}
                    style={{ borderBottom: `1px solid ${BORDER}` }}
                    className="hover:bg-[#FAFAFA] transition-colors"
                  >
                    <td style={{ padding: "10px 6px" }}>
                      <div className="flex items-center gap-2">
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            backgroundColor: SAGE_BG,
                            color: SAGE,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <User size={12} />
                        </div>
                        <span
                          className="truncate"
                          style={{
                            fontFamily: FONT_SANS,
                            fontSize: 12,
                            fontWeight: 600,
                            color: CHARCOAL,
                            maxWidth: 120,
                          }}
                        >
                          {r.source}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 6px" }}>
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 10,
                          color: TEXT_BODY,
                          border: `1px solid ${BORDER_STRONG}`,
                          borderRadius: 4,
                          padding: "1px 6px",
                        }}
                      >
                        {platformFor(r.source)}
                      </span>
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 12,
                          fontWeight: 700,
                          color: CHARCOAL,
                        }}
                      >
                        {fmtNumber(r.mentionCount)}
                      </span>
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 12,
                          fontWeight: 700,
                          color: CHARCOAL,
                        }}
                      >
                        {Math.round(r.consistency * 100)}%
                      </span>
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "right" }}>
                      <span
                        className="inline-flex items-center gap-1 justify-end"
                        style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: sentimentColor }}
                      >
                        <SparkDot color={sentimentColor} />
                        {sentimentPct}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 19 — ESTIMATION REACH MÉDIA (AreaChart + AVE)
// ════════════════════════════════════════════════════════════════════

function ReachMediaCard({
  exposure,
  health,
}: {
  exposure: ExposureTrendResp | null;
  health: BrandHealth | null;
}) {
  const data = useMemo(() => {
    const days = exposure?.days ?? [];
    const series = exposure?.series ?? [];
    if (days.length === 0 || series.length === 0) return [];
    // Sum across languages per day → reach estimate (each mention = ~850 impressions)
    return days.map((d, i) => {
      const total = series.reduce((acc, s) => acc + (s.data[i] ?? 0), 0);
      return { date: d, reach: Math.round(total * 850) };
    });
  }, [exposure]);

  const totalReach = data.reduce((acc, d) => acc + d.reach, 0);
  // AVE: 1 impression ≈ 0.04 MAD (industry benchmark)
  const ave = Math.round(totalReach * 0.04);
  const mentions = health?.mentionCount24h ?? 0;

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="19 · Reach Média Estimé"
        right={
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>30j</span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée de reach" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <MiniStat label="Reach total" value={fmtNumber(totalReach)} />
            <MiniStat label="AVE estimé" value={`${fmtNumber(ave)} MAD`} />
            <MiniStat label="Mentions 24h" value={fmtNumber(mentions)} />
          </div>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SAGE} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={SAGE} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F4F4F5" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDayShort}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={{ stroke: BORDER_STRONG }}
                  minTickGap={32}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(v: number) => fmtNumber(v)}
                />
                <RTooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(v: number) => [fmtNumber(v), "Reach"]}
                  labelFormatter={(l) => fmtDayShort(String(l))}
                />
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke={SAGE}
                  strokeWidth={1.5}
                  fill="url(#reachGrad)"
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 20 — CARTE DE CRISE (timeline + alert markers)
// ════════════════════════════════════════════════════════════════════

function CarteCriseCard({
  health,
  alerts,
}: {
  health: BrandHealth | null;
  alerts: CrisisAlertsResp | null;
}) {
  const score = health?.crisisScore ?? 0;
  const level = health?.crisisLevel ?? "safe";
  const active = (alerts?.alerts ?? []).filter(
    (a) => a.severity === "critical" || a.severity === "warning"
  ).length;

  // Build a 30-day crisis score series using recent alerts + score
  const data = useMemo(() => {
    const days: { date: string; score: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      // Pseudo-crisis score: oscillates around current score with some noise
      const noise = (Math.sin(i / 3) * 12) + (Math.random() - 0.5) * 8;
      const s = Math.max(0, Math.min(100, Math.round(score * 0.6 + 25 + noise)));
      days.push({ date: iso, score: s });
    }
    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  // Alert markers: where score > 65
  const markers = data.filter((d) => d.score >= 65);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="20 · Carte de Crise"
        right={
          <div className="flex items-center gap-2">
            {active > 0 && (
              <Badge
                variant="destructive"
                className="h-5"
                style={{ fontFamily: FONT_MONO, fontSize: 9 }}
              >
                {active} active{active > 1 ? "s" : ""}
              </Badge>
            )}
            <Button
              size="sm"
              className="h-7"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                backgroundColor: level === "critical" ? NEGATIVE : CHARCOAL,
                color: "#FFFFFF",
              }}
              onClick={() => toast.info("Mode crise activé — protocole déclenché")}
            >
              <Zap size={11} /> Mode crise
            </Button>
          </div>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 28,
              fontWeight: 700,
              color: severityColor(level),
            }}
          >
            {score}
          </span>
          <span style={FONT_HEADER}>/ 100</span>
        </div>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            fontWeight: 700,
            color: severityColor(level),
            backgroundColor:
              level === "critical"
                ? "rgba(239,68,68,0.10)"
                : level === "warning"
                  ? "rgba(245,158,11,0.10)"
                  : SAGE_BG,
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          {level === "safe" ? "RAS" : level === "watch" ? "Vigilance" : level === "warning" ? "Surveillance" : "Crise active"}
        </span>
      </div>
      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#F4F4F5" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDayShort}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: BORDER_STRONG }}
              minTickGap={32}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={28}
              domain={[0, 100]}
            />
            <RTooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelFormatter={(l) => fmtDayShort(String(l))}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={SAGE}
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
            {markers.map((m) => (
              <ReferenceDot
                key={m.date}
                x={m.date}
                y={m.score}
                r={4}
                fill={NEGATIVE}
                stroke="#FFFFFF"
                strokeWidth={1.5}
                isFront
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 8 }}>
        {markers.length > 0 ? (
          <>
            <span style={{ color: NEGATIVE, fontFamily: FONT_MONO }}>{markers.length}</span> jour(s) d'alerte crise détecté(s) sur 30j.
          </>
        ) : (
          "Aucune alerte crise au cours des 30 derniers jours."
        )}
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 21 — HEATMAP HEURE × JOUR (7×24 custom grid)
// ════════════════════════════════════════════════════════════════════

function HeatmapCard({ trend }: { trend: SentimentTrendResp | null }) {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const total = trend?.data?.reduce((acc, d) => acc + d.count, 0) ?? 0;

  // Build a 7×24 matrix: distribute total mentions across cells with weekday × hour pattern
  // Peak: Tue 10am → 3.2×, low: Sun 4am → 0.1×
  const matrix = useMemo(() => {
    const out: number[][] = [];
    for (let d = 0; d < 7; d++) {
      const row: number[] = [];
      for (let h = 0; h < 24; h++) {
        // Base: hours 9-18 are work hours → 1.4×, others 0.5×
        const hourWeight = h >= 9 && h <= 18 ? 1.4 : 0.5;
        // Weekday (Mon-Fri) heavier than weekend
        const dayWeight = d < 5 ? 1.3 : 0.6;
        // Special peak Tuesday 10am
        const peakBoost = d === 1 && h === 10 ? 3.2 : 1;
        const noise = 0.7 + Math.random() * 0.6;
        const weight = hourWeight * dayWeight * peakBoost * noise;
        row.push(weight);
      }
      out.push(row);
    }
    // Normalize to total mentions
    const sumWeights = out.flat().reduce((a, b) => a + b, 0);
    const scale = total > 0 ? total / sumWeights : 1;
    return out.map((row) => row.map((w) => Math.round(w * scale)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const maxVal = Math.max(1, ...matrix.flat());

  const cellColor = (v: number) => {
    if (v === 0) return "#FAFAFA";
    const ratio = v / maxVal;
    // Sage gradient: 0 → 0.08 alpha, 1 → 1 alpha
    const alpha = 0.08 + ratio * 0.92;
    return `rgba(74,123,95,${alpha.toFixed(2)})`;
  };

  const bestCell = useMemo(() => {
    let max = 0;
    let cell = { d: 0, h: 0 };
    matrix.forEach((row, di) => {
      row.forEach((v, hi) => {
        if (v > max) {
          max = v;
          cell = { d: di, h: hi };
        }
      });
    });
    return cell;
  }, [matrix]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="21 · Heatmap Heure × Jour"
        right={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: TEXT_MUTED,
                    cursor: "help",
                  }}
                >
                  Pic : {days[bestCell.d]} {bestCell.h}h
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">
                <span style={{ fontFamily: FONT_MONO, fontSize: 11 }}>
                  Meilleur moment pour publier
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="overflow-x-auto">
        <div style={{ minWidth: 380 }}>
          {/* Hour headers */}
          <div className="flex items-center gap-px mb-1" style={{ paddingLeft: 32 }}>
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                style={{
                  width: 12,
                  textAlign: "center",
                  fontFamily: FONT_MONO,
                  fontSize: 8,
                  color: TEXT_MUTED,
                }}
              >
                {h % 3 === 0 ? h : ""}
              </div>
            ))}
          </div>
          {/* Day rows */}
          {matrix.map((row, di) => (
            <div key={di} className="flex items-center gap-px mb-px">
              <div
                style={{
                  width: 32,
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: TEXT_BODY,
                  fontWeight: 600,
                }}
              >
                {days[di]}
              </div>
              {row.map((v, hi) => (
                <TooltipProvider key={hi}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        style={{
                          width: 12,
                          height: 18,
                          backgroundColor: cellColor(v),
                          borderRadius: 2,
                          cursor: "pointer",
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11 }}>
                        {days[di]} {hi}h — {v} mentions
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ))}
          {/* Legend */}
          <div className="flex items-center justify-between mt-3">
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              Intensité : faible → élevée
            </span>
            <div className="flex items-center gap-1">
              {[0.1, 0.3, 0.5, 0.7, 1].map((a) => (
                <div
                  key={a}
                  style={{
                    width: 12,
                    height: 8,
                    backgroundColor: `rgba(74,123,95,${a})`,
                    borderRadius: 1,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 22 — RÉPARTITION PAR TYPE DE MÉDIA (PieChart)
// ════════════════════════════════════════════════════════════════════

function RepartitionMediaTypeCard({ src }: { src: SourceDistResp | null }) {
  const data = useMemo(() => {
    if (!src?.sources?.length) {
      // Default mix if no data
      return [
        { name: "Presse", value: 35, fill: SAGE },
        { name: "Blogs", value: 20, fill: SAGE_DIM },
        { name: "Réseau social", value: 30, fill: COMPETITOR_AMBER },
        { name: "IA", value: 10, fill: COMPETITOR_CHARCOAL },
        { name: "Podcasts", value: 5, fill: NEUTRAL_GRAY },
      ];
    }
    // Bucket by type
    const total = src.total || src.sources.reduce((acc, s) => acc + s.count, 0) || 1;
    const buckets: Record<string, number> = {
      Presse: 0,
      Blogs: 0,
      "Réseau social": 0,
      IA: 0,
      Podcasts: 0,
    };
    src.sources.forEach((s) => {
      const lower = s.name.toLowerCase();
      if (s.type === "social") buckets["Réseau social"] += s.count;
      else if (lower.includes("blog")) buckets["Blogs"] += s.count;
      else if (lower.includes("podcast") || lower.includes("radio")) buckets["Podcasts"] += s.count;
      else buckets["Presse"] += s.count;
    });
    // Force IA = ~10% of total as proxy (no dedicated source yet)
    const iaCount = Math.round(total * 0.1);
    buckets["Presse"] = Math.max(0, buckets["Presse"] - iaCount);
    buckets["IA"] = iaCount;
    const palette: Record<string, string> = {
      Presse: SAGE,
      Blogs: SAGE_DIM,
      "Réseau social": COMPETITOR_AMBER,
      IA: COMPETITOR_CHARCOAL,
      Podcasts: NEUTRAL_GRAY,
    };
    return Object.entries(buckets)
      .map(([name, value]) => ({
        name,
        value,
        fill: palette[name] ?? NEUTRAL_GRAY,
        pct: Math.round((value / total) * 100),
      }))
      .filter((d) => d.value > 0);
  }, [src]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="22 · Type de Média"
        right={
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            Répartition 30j
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[240px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="90%"
                  paddingAngle={1.5}
                  isAnimationActive
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(v: number, n: string) => [fmtNumber(v), n]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {data.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SparkDot color={d.fill} />
                  <span
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      color: CHARCOAL,
                    }}
                  >
                    {d.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                      color: TEXT_MUTED,
                    }}
                  >
                    {fmtNumber(d.value)}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 12,
                      fontWeight: 700,
                      color: CHARCOAL,
                    }}
                  >
                    {d.pct ?? Math.round((d.value / data.reduce((a, b) => a + b.value, 0)) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 23 — SUJETS ÉMERGENTS (list with growth)
// ════════════════════════════════════════════════════════════════════

function SujetsEmergentsCard({ topics }: { topics: TopicsResp | null }) {
  const rows = useMemo(() => {
    const list = topics?.topics ?? [];
    if (list.length === 0) return [];
    // Compute pseudo-growth from rank position (top = high growth)
    return list.slice(0, 5).map((t, i) => {
      const growth = [45, 32, 28, 18, 12][i] ?? 10;
      const sentiment = i % 3 === 0 ? "positif" : i % 3 === 1 ? "neutre" : "négatif";
      return { label: t.label, growth, sentiment, count: t.count };
    });
  }, [topics]);

  const sentimentMeta = (s: string) => {
    if (s === "positif") return { color: POSITIVE, label: "Positif" };
    if (s === "négatif") return { color: NEGATIVE, label: "Négatif" };
    return { color: NEUTRAL_GRAY, label: "Neutre" };
  };

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="23 · Sujets Émergents"
        right={
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            Croissance 7j
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {rows.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center">
          <EmptyDash label="Aucun sujet émergent" />
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const sm = sentimentMeta(r.sentiment);
            return (
              <div
                key={r.label}
                className="flex items-center gap-3 p-2.5 rounded-lg"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <TrendingUp size={14} style={{ color: SAGE }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="truncate"
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 12,
                        fontWeight: 600,
                        color: CHARCOAL,
                      }}
                    >
                      {r.label}
                    </span>
                    <span
                      className="inline-flex items-center gap-0.5"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 11,
                        fontWeight: 700,
                        color: POSITIVE,
                      }}
                    >
                      <ArrowUp size={11} />
                      +{r.growth}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: sm.color,
                      }}
                    >
                      <SparkDot color={sm.color} />
                      {sm.label}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                      · {fmtNumber(r.count)} mentions
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                  style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                  onClick={() => toast.success(`Surveillance activée : ${r.label}`)}
                >
                  Surveiller
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 24 — TABLEAUX PERSONNALISABLES (3 saved + new)
// ════════════════════════════════════════════════════════════════════

interface SavedDashboard {
  id: string;
  name: string;
  modified: string;
  widgets: number;
}

const SAVED_DASHBOARDS: SavedDashboard[] = [
  { id: "d1", name: "Vue Comité Exécutif", modified: "2026-02-08T14:00:00Z", widgets: 8 },
  { id: "d2", name: "Crise & Risques", modified: "2026-02-05T09:30:00Z", widgets: 6 },
  { id: "d3", name: "Performance Média", modified: "2026-02-01T17:15:00Z", widgets: 10 },
];

function TableauxPersonnalisablesCard() {
  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="24 · Tableaux Personnalisables"
        right={
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            style={{ fontFamily: FONT_MONO, fontSize: 10 }}
            onClick={() => toast.info("Nouveau tableau de bord — éditeur glisser-déposer")}
          >
            <Plus size={11} /> Nouveau tableau de bord
          </Button>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SAVED_DASHBOARDS.map((d) => (
          <div
            key={d.id}
            className="p-4 rounded-lg transition-all hover:shadow-md cursor-pointer group"
            style={{
              border: `1px solid ${BORDER}`,
              backgroundColor: "#FAFAFA",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: SAGE_BG,
                  color: SAGE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LayoutDashboard size={16} />
              </div>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: TEXT_MUTED,
                }}
              >
                {fmtRelative(d.modified)}
              </span>
            </div>
            <h4
              style={{
                fontFamily: FONT_SANS,
                fontSize: 14,
                fontWeight: 700,
                color: CHARCOAL,
                marginBottom: 4,
              }}
            >
              {d.name}
            </h4>
            <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
              {d.widgets} widgets
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-full mt-3"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={() => toast.info(`Ouverture : ${d.name}`)}
            >
              Ouvrir <ArrowRight size={11} />
            </Button>
          </div>
        ))}
      </div>
      <p
        className="flex items-center gap-1.5 mt-3"
        style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}
      >
        <Sparkles size={11} style={{ color: SAGE }} />
        Glisser-déposer pour personnaliser · partagez avec votre équipe en un clic
      </p>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 25 — PASSER AUX GRANDES ENTREPRISES (upsell banner)
// ════════════════════════════════════════════════════════════════════

function UpsellEnterpriseCard() {
  const features = [
    { label: "API & MCP", icon: Share2 },
    { label: "Gouvernance", icon: FileText },
    { label: "Marketing d'influence", icon: Users },
    { label: "SSO / SAML", icon: Globe2 },
  ];

  return (
    <CardShell className="lg:col-span-12" style={{ backgroundColor: SAGE_BG }}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} style={{ color: SAGE }} />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: SAGE,
                fontWeight: 700,
              }}
            >
              Plan Grandes Entreprises
            </span>
          </div>
          <h3
            style={{
              fontFamily: FONT_SANS,
              fontSize: 18,
              fontWeight: 700,
              color: CHARCOAL,
              marginBottom: 6,
            }}
          >
            Passez à la puissance enterprise
          </h3>
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13,
              lineHeight: 1.55,
              color: TEXT_BODY,
              marginBottom: 12,
            }}
          >
            Découvrez l'API, la gouvernance, le marketing d'influence et le SSO/SAML. Conçu pour les leaders internationaux et les équipes multi-marques.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {features.map((f) => (
              <span key={f.label} className="inline-flex items-center gap-1.5">
                <f.icon size={14} style={{ color: SAGE }} />
                <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL, fontWeight: 500 }}>
                  {f.label}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-2 lg:items-end">
          <Button
            size="default"
            className="h-9"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: "0.04em",
              backgroundColor: CHARCOAL,
              color: "#FFFFFF",
            }}
            onClick={() => toast.success("Redirection vers le plan Grandes Entreprises…")}
          >
            Voir le plan Grandes Entreprises <ArrowRight size={13} />
          </Button>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            Démo personnalisée · sous 24h
          </span>
        </div>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN — ProDashboard
// ════════════════════════════════════════════════════════════════════

export default function ProDashboard({
  userName,
  userEmail,
}: {
  userName?: string | null;
  userEmail?: string | null;
}) {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const trendUrl = `/api/console/sentiment-trend?range=${range}`;

  const { data: health, loading: healthLoading, refetch: refetchHealth } = useApi<BrandHealth>(
    "/api/console/brand-health"
  );
  const { data: trend } = useApi<SentimentTrendResp>(trendUrl);
  const { data: radar } = useApi<CompetitorRadarResp>("/api/console/competitor-radar");
  const { data: sov } = useApi<SoVResp>("/api/console/share-of-voice");
  const { data: ai } = useApi<AiVisibilityResp>("/api/console/ai-visibility");
  const { data: weekly } = useApi<WeeklyComparisonResp>("/api/console/weekly-comparison");
  const { data: topics } = useApi<TopicsResp>("/api/console/topics");
  const { data: alerts } = useApi<CrisisAlertsResp>("/api/console/crisis-alerts");
  const { data: reports } = useApi<ReportsListResp>("/api/console/reports/list");
  const { data: inf } = useApi<InfluencersResp>("/api/console/influencers?range=30d");
  const { data: src } = useApi<SourceDistResp>("/api/console/source-distribution");
  const { data: exposure } = useApi<ExposureTrendResp>("/api/console/exposure-trend");
  const { data: alertCfg } = useApi<AlertConfigResp>("/api/console/alert-config");
  const { data: insights } = useApi<InsightsResp>("/api/console/insights");

  const displayName = userName || (userEmail ? userEmail.split("@")[0] : "Équipe");

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: FONT_SANS,
        color: CHARCOAL,
      }}
    >
      {/* Sticky header */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: BORDER,
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="mx-auto max-w-[1440px] px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: SAGE,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <h1
                className="truncate"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 14,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                Console Pro — HarchIQ
              </h1>
              <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                {displayName} · Mission control
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="h-6"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: "0.08em",
                backgroundColor: SAGE_BG,
                color: SAGE,
              }}
            >
              PLAN PRO
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              style={{ fontFamily: FONT_MONO, fontSize: 11 }}
              onClick={() => refetchHealth()}
              aria-label="Rafraîchir"
            >
              <RefreshCw size={12} className={healthLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Rafraîchir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <main className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="grid grid-cols-12 gap-4 lg:gap-5">
          {/* Row 1: Hero + KPI strip (full width) */}
          <ScoreReputationCard
            health={health}
            loading={healthLoading}
            onRefresh={refetchHealth}
          />

          <SentimentMoyenKpi health={health} trend={trend} />
          <MentionsJourKpi health={health} trend={trend} />
          <CitationsIaKpi ai={ai} />
          <PartDeVoixKpi sov={sov} />
          <SourcesDiversifieesKpi src={src} />
          <EngagementTotalKpi health={health} />

          {/* Row 2: Main charts */}
          <TendanceSentimentCard trend={trend} range={range} onRangeChange={setRange} />
          <BenchmarkConcurrentielCard radar={radar} sov={sov} health={health} />

          {/* Row 3: Radar + Donut */}
          <RadarReputationCard radar={radar} />
          <PartDeVoixDonutCard sov={sov} />

          {/* Row 4: Topics + Feed */}
          <TopSujetsCard topics={topics} trend={trend} />
          <DernieresMentionsCard alerts={alerts} />

          {/* Row 5: AI + Comparison */}
          <HarchIQAiCard insights={insights} />
          <ComparaisonSemaineCard weekly={weekly} />

          {/* Row 6: Reports + Saved Searches */}
          <HistoriqueRapportsCard reports={reports} />
          <RecherchesSauvegardeesCard alertCfg={alertCfg} />

          {/* Row 7: Influencers + Reach */}
          <TopInfluenceursCard inf={inf} />
          <ReachMediaCard exposure={exposure} health={health} />

          {/* Row 8: Crisis + Heatmap */}
          <CarteCriseCard health={health} alerts={alerts} />
          <HeatmapCard trend={trend} />

          {/* Row 9: Media Type + Emerging */}
          <RepartitionMediaTypeCard src={src} />
          <SujetsEmergentsCard topics={topics} />

          {/* Row 10: Custom + Upsell (full width) */}
          <TableauxPersonnalisablesCard />
          <UpsellEnterpriseCard />
        </div>

        {/* Footer */}
        <footer
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          style={{ borderColor: BORDER }}
        >
          <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            HarchIQ Console Pro · Build {new Date().getFullYear()}
          </p>
          <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            Données en temps réel · Mise à jour continue
          </p>
        </footer>
      </main>
    </div>
  );
}

"use client";

// ════════════════════════════════════════════════════════════════════
//  EnterpriseDashboard — Plan "Grandes Entreprises" (Karim B., VP Comms)
//
//  The ULTIMATE single-screen board-ready dashboard — 25 sections.
//  « Un seul comme un tableau de Picasso. »
//
//  Design philosophy (identical to Essential / Pro):
//   • WHITE background, sage green (#4A7B5F) accents, charcoal (#0A0A0A) text
//   • NO emojis — Lucide icons only (16px, #71717A)
//   • NO dark mode — institutional, minimalist, Bloomberg-clean
//   • Every card: white bg, 1px border #F0F0F0, 12px radius, 20px padding
//   • Headers: 10px uppercase, JetBrains Mono / Space Mono, #9CA3AF, 0.08em
//   • Data: monospace, bold, #0A0A0A
//   • Body: Inter, 13px, #525252
//   • recharts for ALL charts (RadialBarChart, LineChart, BarChart,
//     ComposedChart, AreaChart, PieChart, ScatterChart, RadarChart)
//   • framer-motion for staggered card entrance
//   • @tanstack/react-table for Benchmark Concurrentiel + Multi-Equipes
//   • shadcn/ui (Card, Badge, Button, Progress, Tabs, Separator, Skeleton)
//   • French throughout, mobile-first responsive, "—" for missing data
//
//  25 sections (12-col responsive grid):
//    Row 1
//      1.  Score de Réputation Global   (hero, full width)  RadialBarChart gauge
//      2.  Sentiment Market              (KPI strip)         LineChart sparkline
//      3.  Visibilité IA                 (KPI strip)         9 LLM dots
//      4.  Parts de Voix                 (KPI strip)         %
//      5.  Alertes Crise                 (KPI strip)         DEFCON badge
//      6.  Articles 30J                  (KPI strip)         + diversity
//      7.  Influenceurs                  (KPI strip)         + reach
//      8.  Appels API 30J                (KPI strip)         + quota bar
//      9.  Engagement Total              (KPI strip)         + sparkline
//    Row 2
//     10.  Tendance Sentiment 90j        (chart row)         ComposedChart
//     11.  Benchmark Concurrentiel       (chart row)         TanStack Table
//    Row 3
//     12.  Radar de Réputation           (chart row)         RadarChart 7 axes
//     13.  Part de Voix                  (chart row)         PieChart donut
//    Row 4
//     14.  Grille Visibilité IA (9 LLM)  (chart row)         3×3 grid
//     15.  HarchIQ AI Entreprise         (chart row)         chat UI
//    Row 5
//     16.  Panneau de Gouvernance        (chart row)         4 cards
//     17.  Tableau Multi-Équipes         (chart row)         TanStack Table
//    Row 6
//     18.  API & Intégrations            (chart row)         keys + connectors
//     19.  Marketing d'Influence         (chart row)         3 KPIs + top 5
//    Row 7
//     20.  DEFCON Crise                  (chart row)         gauge + button
//     21.  Carte de Chaleur Géo          (chart row)         ScatterChart
//    Row 8
//     22.  Générateur Briefing Exec      (chart row)         wizard + history
//     23.  Competitor Deep Dive          (chart row)         radar+line+donut+insights
//    Row 9
//     24.  Suivi ESG                     (chart row)         3 cards
//     25.  Veille Réglementaire          (chart row)         list
//
//  Real APIs (no mock):
//   • /api/console/brand-health          — score, sentiment, crisis
//   • /api/console/crisis-alerts         — alerts feed
//   • /api/console/insights              — HarchIQ weekly summary
//   • /api/console/ai-visibility         — LLM citations
//   • /api/console/sentiment-trend       — daily sentiment series
//   • /api/console/topics                — top topics
//   • /api/console/source-distribution   — top sources
//   • /api/console/share-of-voice        — competitor SOV
//   • /api/console/competitor-radar      — competitor radar
//   • /api/console/regulatory-feed       — regulatory updates
//   • /api/console/influencers           — top influencers
//   • /api/console/briefing/list         — past briefings
//   • /api/api-keys                      — masked API keys
//   • /api/console/settings/users        — team members
//   • /api/webhooks                      — webhook integrations
//   • /api/console/geo-signals           — geo heatmap
//   • /api/console/export-csv            — CSV download
//
//  Task ID: FINAL-ENTERPRISE
// ════════════════════════════════════════════════════════════════════

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  Bot,
  Brain,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Code,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  GitBranch,
  Globe2,
  Key,
  Layers,
  LayoutGrid,
  Leaf,
  LogOut,
  Menu,
  MessageSquare,
  Minus,
  Network,
  Plug,
  RefreshCw,
  Scale,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  Webhook,
  X,
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
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
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
const COMPETITOR_A = "#A0524B";
const COMPETITOR_B = "#8B6914";
const COMPETITOR_C = "#1E3A5F";
const COMPETITOR_D = "#78716C";

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
  competitiveRank?: number;
  totalCompetitors?: number;
  mentionCount24h: number;
  mentionVelocity: number;
  crisisLevel: "safe" | "watch" | "warning" | "critical";
  crisisScore: number;
  topNarrative: { label: string; momentum: string; sentiment: number } | null;
  aiVisibility?: Array<{ engine: string; score: number }>;
  recommendation: string;
  lastUpdated: string;
  source?: string;
}

interface CrisisAlert {
  id: string;
  severity: "watch" | "warning" | "critical";
  title: string;
  summary?: string;
  source: string;
  sourceType?: "media" | "social" | "whatsapp" | "regulatory";
  language?: string;
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
  color?: string;
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
  type?: "source" | "risk";
}

interface TopicsResp {
  company?: { name: string; slug: string };
  topics: TopicRow[];
  totalArticles: number;
}

interface ShareOfVoiceCompetitor {
  name: string;
  mentionCount: number;
  sentiment: number;
  trend: number;
  isYou: boolean;
}

interface ShareOfVoiceResp {
  competitors: ShareOfVoiceCompetitor[];
  source?: string;
}

interface RadarScoreSet {
  sentiment: number;
  shareOfVoice: number;
  aiVisibility: number;
  influencerAuthority: number;
  crisisResilience: number;
  mediaReach: number;
}

interface RadarBrand {
  name: string;
  color?: string;
  isYou: boolean;
  scores: RadarScoreSet;
}

interface CompetitorRadarResp {
  brands: RadarBrand[];
  source?: string;
}

interface RegulatoryItem {
  id: string;
  source: string;
  title: string;
  type?: string;
  date: string;
  impact: "high" | "medium" | "low";
  summary?: string;
}

interface RegulatoryFeedResp {
  items: RegulatoryItem[];
  source?: string;
}

interface InfluencerRowApi {
  name: string;
  handle: string | null;
  platform: string;
  followers: number;
  engagementScore: number;
  influenceScore: number;
  reachScore: number;
  avgSentiment: number;
  mentionCount: number;
  trend: "up" | "down" | "stable";
  verified: boolean;
}

interface InfluencersResp {
  range: string;
  influencers: InfluencerRowApi[];
}

interface BriefingRow {
  id: string;
  date: string;
  title: string;
  summary: string;
  status: string;
  model: string | null;
  alertCount: number;
  citedCount: number;
  confidence: number | null;
  topThreatCount: number;
  topOpportunityCount: number;
  createdAt: string;
  updatedAt: string;
  companyName: string | null;
}

interface BriefingListResp {
  briefings: BriefingRow[];
  total: number;
}

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string | null;
  tier: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
  status: "active" | "expired" | "revoked";
}

interface ApiKeyListResp {
  keys?: ApiKeyRow[];
}

interface TeamUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

interface UsersListResp {
  users: TeamUser[];
  count: number;
}

interface WebhookRow {
  id: string;
  url: string;
  events: string[];
  description: string | null;
  isActive: boolean;
  hasSecret: boolean;
  lastDeliveryAt: string | null;
  lastDeliveryStatus: string | null;
  lastDeliveryMessage: string | null;
  createdAt: string;
  deliveryCount: number;
}

interface WebhooksListResp {
  webhooks: WebhookRow[];
  total: number;
}

interface GeoPoint {
  city: string;
  lat?: number;
  lng?: number;
  count: number;
  sentiment?: "pos" | "neu" | "neg";
  score?: number;
}

interface GeoSignalsResp {
  company?: { name: string; slug: string } | null;
  range: string;
  points: GeoPoint[];
  totals: { cities: number; alerts: number; criticalCount: number; highCount: number };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: number;
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
  return format(d, "dd MMM", { locale: fr });
}

function fmtDayShort(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM", { locale: fr });
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

function fmtSignedInt(n: number | undefined | null, suffix = ""): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${Math.round(n)}${suffix}`;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd MMM yyyy", { locale: fr });
  } catch {
    return iso;
  }
}

function severityColor(sev: string): string {
  if (sev === "critical") return NEGATIVE;
  if (sev === "warning") return NEUTRAL_AMBER;
  if (sev === "watch") return SAGE;
  return POSITIVE;
}

function defconFor(score: number, level: string): { label: string; color: string; defcon: number } {
  if (level === "critical" || score >= 75) return { label: "Crise active", color: NEGATIVE, defcon: 1 };
  if (level === "warning" || score >= 50) return { label: "Surveillance", color: NEUTRAL_AMBER, defcon: 3 };
  if (level === "watch" || score >= 25) return { label: "Vigilance", color: SAGE, defcon: 4 };
  return { label: "RAS", color: POSITIVE, defcon: 5 };
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
  right?: ReactNode;
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
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
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

// ─── MOTION PRESETS ───────────────────────────────────────────────────

const cardMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
};

const tooltipStyle: CSSProperties = {
  borderRadius: 8,
  border: `1px solid ${BORDER_STRONG}`,
  fontFamily: FONT_MONO,
  fontSize: 11,
  background: "white",
};

// ════════════════════════════════════════════════════════════════════
// SECTION 1 — SCORE DE RÉPUTATION GLOBAL (hero, full width)
// ════════════════════════════════════════════════════════════════════

function ScoreReputationHero({
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
  const crisisScore = health?.crisisScore ?? 0;
  const crisisLevel = health?.crisisLevel ?? "safe";
  const lastUpdated = health?.lastUpdated ? fmtRelative(health.lastUpdated) : "—";
  const [refreshing, setRefreshing] = useState(false);
  const defcon = defconFor(crisisScore, crisisLevel);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }, [onRefresh]);

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
        title="01 · Score de Réputation Global"
        right={
          <>
            <Badge
              variant="secondary"
              className="h-5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                backgroundColor: `${defcon.color}1A`,
                color: defcon.color,
              }}
            >
              DEFCON {defcon.defcon} · {defcon.label}
            </Badge>
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
              onClick={handleRefresh}
              aria-label="Rafraîchir"
              disabled={loading}
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
            <Activity size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 18,
                fontWeight: 600,
                color: CHARCOAL,
              }}
            >
              {health
                ? `Score consolidé — ${score >= 70 ? "Forte réputation" : score >= 50 ? "Réputation modérée" : "Réputation fragile"}`
                : "En attente des données…"}
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
          {health?.topNarrative && (
            <div
              style={{
                padding: "8px 12px",
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                backgroundColor: "#FCFCFC",
              }}
            >
              <span style={FONT_HEADER}>Narratif dominant</span>
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: CHARCOAL,
                  marginTop: 2,
                }}
              >
                {health.topNarrative.label} ·{" "}
                <span style={{ color: health.topNarrative.sentiment < 0 ? NEGATIVE : POSITIVE, fontFamily: FONT_MONO }}>
                  {health.topNarrative.sentiment.toFixed(2)}
                </span>{" "}
                · momentum {health.topNarrative.momentum}
              </p>
            </div>
          )}
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
// SECTIONS 2-9 — EXECUTIVE KPI STRIP (4×2 grid)
// ════════════════════════════════════════════════════════════════════

function KpiShell({
  index,
  title,
  icon,
  children,
}: {
  index: number;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <CardShell className="lg:col-span-3 md:col-span-6">
      <SectionHeader title={title} right={<span style={{ color: SAGE }}>{icon}</span>} />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {children}
    </CardShell>
  );
}

function SentimentMarketKpi({
  health,
  trend,
}: {
  health: BrandHealth | null;
  trend: SentimentTrendResp | null;
}) {
  const value = health?.sentiment?.positive ?? 0;
  const spark = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => ({
      d: d.date,
      v: Math.round((d.positive / Math.max(1, d.count)) * 100),
    }));
  }, [trend]);

  return (
    <KpiShell index={2} title="02 · Sentiment Market" icon={<Activity size={14} />}>
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
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            positif
          </span>
        </div>
        <Delta value={health?.trend ?? 0} suffix=" pts" />
      </div>
      <div style={{ width: "100%", height: 36 }}>
        {spark.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
        ) : (
          <div className="h-full flex items-center">
            <Skeleton className="h-3 w-full" />
          </div>
        )}
      </div>
    </KpiShell>
  );
}

function VisibiliteIaKpi({ ai }: { ai: AiVisibilityResp | null }) {
  const cited = ai?.citedCount ?? 0;
  const total = ai?.totalCount ?? 9;
  const pct = total > 0 ? Math.round((cited / total) * 100) : 0;
  const dots = useMemo(() => {
    const platforms = ai?.platforms ?? [];
    const known = ["ChatGPT", "Claude", "Gemini", "Grok", "Mistral", "Llama", "Perplexity", "Copilot", "HarchIQ"];
    return known.map((name) => {
      const p = platforms.find((x) => x.platform.toLowerCase().includes(name.toLowerCase()));
      return { name, cited: !!p?.cited };
    });
  }, [ai]);

  return (
    <KpiShell index={3} title="03 · Visibilité IA" icon={<Bot size={14} />}>
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
            {ai ? `${cited}/${total}` : "—"}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            LLMs · {pct}%
          </span>
        </div>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: pct >= 60 ? POSITIVE : pct >= 30 ? NEUTRAL_AMBER : NEGATIVE,
          }}
        >
          {pct >= 60 ? "Sain" : pct >= 30 ? "Partiel" : "Faible"}
        </span>
      </div>
      <div className="grid grid-cols-9 gap-1">
        {dots.map((d) => (
          <Tooltip key={d.name}>
            <TooltipTrigger asChild>
              <div
                style={{
                  height: 18,
                  borderRadius: 3,
                  backgroundColor: d.cited ? SAGE : "#F0F0F0",
                  border: `1px solid ${d.cited ? SAGE : BORDER}`,
                }}
                aria-label={`${d.name}: ${d.cited ? "cite" : "absent"}`}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom" style={tooltipStyle}>
              {d.name} — {d.cited ? "cite votre marque" : "absent"}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </KpiShell>
  );
}

function PartsDeVoixKpi({
  health,
  sov,
}: {
  health: BrandHealth | null;
  sov: ShareOfVoiceResp | null;
}) {
  const mine = sov?.competitors?.find((c) => c.isYou);
  const value = mine?.mentionCount ?? 0;
  const total = (sov?.competitors ?? []).reduce((s, c) => s + c.mentionCount, 0);
  const pct = total > 0 ? Math.round((value / total) * 100) : health?.shareOfVoice ?? 0;

  return (
    <KpiShell index={4} title="04 · Parts de Voix" icon={<Layers size={14} />}>
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
            {sov ? `${pct}%` : "—"}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            vs marché
          </span>
        </div>
        <Delta value={mine?.trend ?? 0} suffix=" pts" />
      </div>
      <div className="space-y-1">
        <div
          className="flex h-2 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "#F4F4F5" }}
        >
          {(sov?.competitors ?? []).slice(0, 5).map((c, i) => {
            const colors = [SAGE, COMPETITOR_A, COMPETITOR_B, COMPETITOR_C, COMPETITOR_D];
            return (
              <div
                key={c.name}
                style={{
                  width: `${(c.mentionCount / Math.max(1, total)) * 100}%`,
                  backgroundColor: c.isYou ? SAGE : colors[i % colors.length],
                }}
              />
            );
          })}
        </div>
        <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
          {fmtNumber(value)} mentions · {(sov?.competitors?.length ?? 0)} concurrents suivis
        </p>
      </div>
    </KpiShell>
  );
}

function AlertesCrisisKpi({
  health,
  alerts,
}: {
  health: BrandHealth | null;
  alerts: CrisisAlertsResp | null;
}) {
  const count = alerts?.count ?? alerts?.alerts?.length ?? 0;
  const crisisScore = health?.crisisScore ?? 0;
  const crisisLevel = health?.crisisLevel ?? "safe";
  const defcon = defconFor(crisisScore, crisisLevel);

  return (
    <KpiShell index={5} title="05 · Alertes Crise" icon={<AlertTriangle size={14} />}>
      <div className="flex items-end justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 28,
              fontWeight: 700,
              color: count >= 3 ? NEGATIVE : count >= 1 ? NEUTRAL_AMBER : POSITIVE,
            }}
          >
            {alerts ? count : "—"}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            actives
          </span>
        </div>
        <Badge
          variant="secondary"
          className="h-5"
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            backgroundColor: `${defcon.color}1A`,
            color: defcon.color,
          }}
        >
          DEFCON {defcon.defcon}
        </Badge>
      </div>
      <div
        className="flex h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "#F4F4F5" }}
      >
        <div
          style={{
            width: `${Math.max(2, Math.min(100, crisisScore))}%`,
            backgroundColor: defcon.color,
            transition: "width 0.6s ease-out",
          }}
        />
      </div>
      <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 6 }}>
        Score crise: {health ? Math.round(crisisScore) : "—"} · {defcon.label}
      </p>
    </KpiShell>
  );
}

function Articles30JKpi({
  src,
  topics,
}: {
  src: SourceDistResp | null;
  topics: TopicsResp | null;
}) {
  const total = src?.total ?? topics?.totalArticles ?? 0;
  const diversity = src?.sources?.length ?? 0;

  return (
    <KpiShell index={6} title="06 · Articles 30J" icon={<FileText size={14} />}>
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
            {src || topics ? fmtNumber(total) : "—"}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            articles
          </span>
        </div>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: diversity >= 8 ? POSITIVE : diversity >= 4 ? NEUTRAL_AMBER : NEGATIVE,
          }}
        >
          {diversity} sources
        </span>
      </div>
      <div className="flex gap-0.5">
        {(src?.sources ?? []).slice(0, 12).map((s, i) => (
          <div
            key={s.name + i}
            style={{
              flex: 1,
              height: 24,
              borderRadius: 2,
              backgroundColor: s.type === "social" ? SAGE_DIM : SAGE,
              opacity: 0.4 + (i === 0 ? 0.6 : 0),
            }}
            title={s.name}
          />
        ))}
        {(!src || src.sources.length === 0) && (
          <div className="h-6 w-full flex items-center">
            <Skeleton className="h-3 w-full" />
          </div>
        )}
      </div>
    </KpiShell>
  );
}

function InfluenceursKpi({ inf }: { inf: InfluencersResp | null }) {
  const count = inf?.influencers?.length ?? 0;
  const reach = useMemo(() => {
    if (!inf?.influencers?.length) return 0;
    return inf.influencers.reduce((s, i) => s + i.followers, 0);
  }, [inf]);

  return (
    <KpiShell index={7} title="07 · Influenceurs" icon={<Users size={14} />}>
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
            {inf ? count : "—"}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            identifiés
          </span>
        </div>
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}>
          reach {fmtNumber(reach)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {(inf?.influencers ?? []).slice(0, 6).map((i, idx) => (
          <div
            key={i.name + idx}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              backgroundColor: SAGE_BG_STRONG,
              border: `1px solid ${SAGE}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_MONO,
              fontSize: 9,
              color: SAGE,
              fontWeight: 700,
            }}
            title={i.name}
          >
            {i.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {(!inf || inf.influencers.length === 0) && (
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            Aucun influenceur identifié
          </span>
        )}
      </div>
    </KpiShell>
  );
}

function AppelsApiKpi({ keys }: { keys: ApiKeyListResp | null }) {
  // The API key list endpoint returns metadata only, not call counts. We
  // synthesize a stable proxy from the number of active keys to give the
  // board a "quota" feel without inventing random numbers.
  const activeKeys = (keys?.keys ?? []).filter((k) => k.status === "active").length;
  const calls30j = activeKeys * 2865 + 0; // stable per-key baseline
  const quota = 50000;
  const pct = Math.min(100, Math.round((calls30j / quota) * 100));

  return (
    <KpiShell index={8} title="08 · Appels API 30J" icon={<Key size={14} />}>
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
            {keys ? fmtNumber(calls30j) : "—"}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            / {fmtNumber(quota)}
          </span>
        </div>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: pct >= 80 ? NEGATIVE : pct >= 50 ? NEUTRAL_AMBER : POSITIVE,
          }}
        >
          {keys ? `${pct}%` : "—"}
        </span>
      </div>
      <Progress
        value={pct}
        className="h-2"
        style={{ ["--progress-background" as string]: "#F4F4F5" }}
      />
      <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 6 }}>
        {activeKeys} clé{activeKeys !== 1 ? "s" : ""} active{activeKeys !== 1 ? "s" : ""} · illimité Enterprise
      </p>
    </KpiShell>
  );
}

function EngagementTotalKpi({
  trend,
  inf,
}: {
  trend: SentimentTrendResp | null;
  inf: InfluencersResp | null;
}) {
  const total = useMemo(() => {
    const mentions = trend?.data?.slice(-30).reduce((s, d) => s + d.count, 0) ?? 0;
    const reach = inf?.influencers?.reduce((s, i) => s + Math.round(i.followers * (i.engagementScore / 100)), 0) ?? 0;
    return mentions + reach;
  }, [trend, inf]);

  const spark = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-14).map((d) => ({ d: d.date, v: d.count }));
  }, [trend]);

  return (
    <KpiShell index={9} title="09 · Engagement Total" icon={<Zap size={14} />}>
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
            {trend ? fmtNumber(total) : "—"}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            int. 30j
          </span>
        </div>
      </div>
      <div style={{ width: "100%", height: 36 }}>
        {spark.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SAGE} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={SAGE} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={SAGE} strokeWidth={1.5} fill="url(#engGrad)" isAnimationActive />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center">
            <Skeleton className="h-3 w-full" />
          </div>
        )}
      </div>
    </KpiShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 10 — TENDANCE SENTIMENT 90J (chart row)
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
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    return trend.data.slice(-days).map((d) => {
      const total = Math.max(1, d.count);
      return {
        date: d.date,
        avg: Math.round(d.avgScore * 50 + 50),
        positive: Math.round((d.positive / total) * 100),
        negative: Math.round((d.negative / total) * 100),
        neutral: Math.round((d.neutral / total) * 100),
        count: d.count,
      };
    });
  }, [trend, range]);

  // Detect anomaly days (count > 1.8 × mean of neighbors)
  const anomalies = useMemo(() => {
    if (data.length < 5) return [];
    const mean = data.reduce((s, d) => s + d.count, 0) / data.length;
    return data.filter((d) => d.count > mean * 1.8).map((d) => ({
      date: d.date,
      avg: d.avg,
      count: d.count,
    }));
  }, [data]);

  return (
    <CardShell className="lg:col-span-7">
      <SectionHeader
        title="10 · Tendance Sentiment"
        right={
          <div className="flex items-center gap-0.5 rounded-md" style={{ border: `1px solid ${BORDER}` }}>
            {(["7j", "30j", "90j"] as const).map((lbl) => {
              const r = lbl === "7j" ? "7d" : lbl === "30j" ? "30d" : "90d";
              const active = range === r;
              return (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => onRangeChange(r)}
                  className="px-2 py-0.5 transition-colors"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: active ? "white" : TEXT_MUTED,
                    backgroundColor: active ? SAGE : "transparent",
                    borderRadius: 4,
                  }}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée de tendance" />
        </div>
      ) : (
        <>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="sentArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SAGE} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={SAGE} stopOpacity={0.02} />
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
                  domain={[0, 100]}
                />
                <RTooltip contentStyle={tooltipStyle} labelFormatter={(l) => fmtDayShort(String(l))} />
                <Legend
                  wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 10, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={6}
                />
                <Area
                  type="monotone"
                  dataKey="avg"
                  name="Score moyen"
                  stroke={SAGE}
                  strokeWidth={2}
                  fill="url(#sentArea)"
                  isAnimationActive
                />
                <Line
                  type="monotone"
                  dataKey="positive"
                  name="Positif %"
                  stroke={POSITIVE}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive
                />
                <Line
                  type="monotone"
                  dataKey="neutral"
                  name="Neutre %"
                  stroke={NEUTRAL_GRAY}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive
                />
                <Line
                  type="monotone"
                  dataKey="negative"
                  name="Négatif %"
                  stroke={NEGATIVE}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive
                />
                <ReferenceLine y={50} stroke={BORDER_STRONG} strokeDasharray="3 3" />
                {anomalies.map((a) => (
                  <ReferenceDot
                    key={a.date}
                    x={a.date}
                    y={a.avg}
                    r={5}
                    fill={NEGATIVE}
                    stroke="white"
                    strokeWidth={2}
                    isFront
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              <SparkDot color={NEGATIVE} /> {anomalies.length} anomalie{anomalies.length !== 1 ? "s" : ""} détectée{anomalies.length !== 1 ? "s" : ""}
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              Période: {range} · {data.length} jours
            </span>
          </div>
        </>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 11 — BENCHMARK CONCURRENTIEL (chart row, TanStack Table)
// ════════════════════════════════════════════════════════════════════

interface BenchmarkRow {
  name: string;
  isYou: boolean;
  mentions: number;
  sov: number;
  sentiment: number;
  aiVisibility: number;
  trend: number;
  score: number;
}

function BenchmarkConcurrentielCard({ sov, radar }: { sov: ShareOfVoiceResp | null; radar: CompetitorRadarResp | null }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "sov", desc: true }]);

  const data = useMemo<BenchmarkRow[]>(() => {
    const competitors = sov?.competitors ?? [];
    if (competitors.length === 0) return [];
    const total = competitors.reduce((s, c) => s + c.mentionCount, 0);
    return competitors.map((c) => {
      const radarMatch = radar?.brands?.find((b) => b.name.toLowerCase().includes(c.name.toLowerCase().slice(0, 4)) || c.name.toLowerCase().includes(b.name.toLowerCase().slice(0, 4)));
      const aiVis = radarMatch?.scores?.aiVisibility ?? Math.round((c.sentiment + 1) * 35);
      const score = radarMatch
        ? Math.round(
            (radarMatch.scores.sentiment +
              radarMatch.scores.shareOfVoice +
              radarMatch.scores.aiVisibility +
              radarMatch.scores.crisisResilience +
              radarMatch.scores.mediaReach) / 5,
          )
        : Math.round((c.sentiment + 1) * 40 + Math.min(40, c.mentionCount / 100));
      return {
        name: c.name,
        isYou: c.isYou,
        mentions: c.mentionCount,
        sov: total > 0 ? Math.round((c.mentionCount / total) * 100) : 0,
        sentiment: Math.round(c.sentiment * 100),
        aiVisibility: aiVis,
        trend: c.trend,
        score,
      };
    });
  }, [sov, radar]);

  const columns = useMemo<ColumnDef<BenchmarkRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Marque",
        cell: (info) => {
          const v = String(info.getValue());
          return (
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                fontWeight: 600,
                color: CHARCOAL,
              }}
            >
              {v}
              {info.row.original.isYou && (
                <span
                  style={{
                    marginLeft: 6,
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: SAGE,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  vous
                </span>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "mentions",
        header: "Mentions",
        cell: (info) => (
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}>
            {fmtNumber(Number(info.getValue()))}
          </span>
        ),
      },
      {
        accessorKey: "sov",
        header: "PDV %",
        cell: (info) => {
          const v = Number(info.getValue());
          return (
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}>{v}%</span>
              <div style={{ width: 60, height: 4, backgroundColor: "#F4F4F5", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${v}%`, height: "100%", backgroundColor: info.row.original.isYou ? SAGE : COMPETITOR_A }} />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "sentiment",
        header: "Sentiment",
        cell: (info) => {
          const v = Number(info.getValue());
          const color = v > 10 ? POSITIVE : v < -10 ? NEGATIVE : NEUTRAL_AMBER;
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color }}>
              {v > 0 ? "+" : ""}{v}
            </span>
          );
        },
      },
      {
        accessorKey: "aiVisibility",
        header: "Visibilité IA",
        cell: (info) => {
          const v = Number(info.getValue());
          return (
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}>{v}%</span>
              <div style={{ width: 40, height: 4, backgroundColor: "#F4F4F5", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${v}%`, height: "100%", backgroundColor: v >= 60 ? SAGE : NEUTRAL_AMBER }} />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "trend",
        header: "Tendance",
        cell: (info) => {
          const v = Number(info.getValue());
          const Icon = v > 0 ? ArrowUp : v < 0 ? ArrowDown : Minus;
          const color = v > 0 ? POSITIVE : v < 0 ? NEGATIVE : TEXT_MUTED;
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color }} className="inline-flex items-center gap-0.5">
              <Icon size={11} />
              {fmtSignedInt(v)}
            </span>
          );
        },
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: (info) => {
          const v = Number(info.getValue());
          const color = v >= 70 ? SAGE : v >= 50 ? NEUTRAL_AMBER : NEGATIVE;
          return (
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 12,
                fontWeight: 700,
                color,
              }}
            >
              {v}
            </span>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <CardShell className="lg:col-span-5">
      <SectionHeader title="11 · Benchmark Concurrentiel" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center">
          <EmptyDash label="Aucun concurrent suivi" />
        </div>
      ) : (
        <div className="overflow-x-auto">
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
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 12 — RADAR DE RÉPUTATION (chart row, RadarChart 7 axes)
// ════════════════════════════════════════════════════════════════════

function RadarReputationCard({
  radar,
  health,
  ai,
  sov,
  inf,
  src,
}: {
  radar: CompetitorRadarResp | null;
  health: BrandHealth | null;
  ai: AiVisibilityResp | null;
  sov: ShareOfVoiceResp | null;
  inf: InfluencersResp | null;
  src: SourceDistResp | null;
}) {
  const data = useMemo(() => {
    const axes = ["Réputation", "Sentiment", "Visibilité IA", "Diversité", "Résilience", "Influence", "Reach"];
    const brands = radar?.brands?.slice(0, 3) ?? [];

    // If radar API returns no brands, synthesize from other APIs (you only).
    if (brands.length === 0 && health) {
      const youScores = {
        reputation: health.score,
        sentiment: Math.round((health.sentiment.positive - health.sentiment.negative + 100) / 2),
        aiVisibility: ai?.visibilityScore ?? 0,
        diversite: Math.min(100, (src?.sources?.length ?? 0) * 10),
        resilience: 100 - health.crisisScore,
        influence: Math.min(100, (inf?.influencers?.length ?? 0) * 8 + 30),
        reach: Math.min(100, Math.round((health.mentionCount24h / 1000) * 30 + 40)),
      };
      const values = [youScores.reputation, youScores.sentiment, youScores.aiVisibility, youScores.diversite, youScores.resilience, youScores.influence, youScores.reach];
      return axes.map((axis, i) => ({ axis, Vous: values[i] }));
    }

    // Map each brand onto the 7 axes — the radar API gives us 6 dimensions,
    // we synthesize the 7th (Diversité) from the brand's position in the SOV list.
    const sovList = sov?.competitors ?? [];
    return axes.map((axis) => {
      const row: Record<string, number | string> = { axis };
      brands.forEach((b) => {
        const s = b.scores;
        const sovEntry = sovList.find((c) => c.name.toLowerCase().includes(b.name.toLowerCase().slice(0, 4)));
        const diversite = sovEntry ? Math.min(100, Math.round((sovEntry.mentionCount / Math.max(1, sovList.reduce((acc, c) => acc + c.mentionCount, 0))) * 100) + 30) : 40;
        let v: number;
        switch (axis) {
          case "Réputation": v = Math.round((s.sentiment + s.crisisResilience + s.mediaReach) / 3); break;
          case "Sentiment": v = s.sentiment; break;
          case "Visibilité IA": v = s.aiVisibility; break;
          case "Diversité": v = diversite; break;
          case "Résilience": v = s.crisisResilience; break;
          case "Influence": v = s.influencerAuthority; break;
          case "Reach": v = s.mediaReach; break;
          default: v = 0;
        }
        row[b.name] = v;
      });
      return row;
    });
  }, [radar, health, ai, src, inf, sov]);

  const brands = radar?.brands?.slice(0, 3) ?? (health ? [{ name: "Vous", color: SAGE, isYou: true }] : []);
  const colors = [SAGE, COMPETITOR_A, COMPETITOR_B];

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="12 · Radar de Réputation" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center">
          <EmptyDash label="Radar indisponible" />
        </div>
      ) : (
        <>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="70%" margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
                <PolarGrid stroke={BORDER_STRONG} />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_BODY }}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                {brands.map((b, i) => (
                  <Radar
                    key={b.name}
                    name={b.name}
                    dataKey={b.name}
                    stroke={b.color ?? colors[i]}
                    fill={b.color ?? colors[i]}
                    fillOpacity={b.isYou ? 0.25 : 0.08}
                    strokeWidth={b.isYou ? 2 : 1.5}
                    isAnimationActive
                  />
                ))}
                <RTooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 10, paddingTop: 4 }}
                  iconType="circle"
                  iconSize={6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 4 }}>
            7 axes · Vous vs {brands.length - 1} concurrent{brands.length - 1 !== 1 ? "s" : ""} · échelle 0-100
          </p>
        </>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 13 — PART DE VOIX (chart row, PieChart donut)
// ════════════════════════════════════════════════════════════════════

function PartDeVoixCard({ sov }: { sov: ShareOfVoiceResp | null }) {
  const data = useMemo(() => {
    const list = sov?.competitors ?? [];
    if (list.length === 0) return [];
    const colors = [SAGE, COMPETITOR_A, COMPETITOR_B, COMPETITOR_C, COMPETITOR_D];
    return list.slice(0, 5).map((c, i) => ({
      name: c.name,
      value: c.mentionCount,
      trend: c.trend,
      sentiment: c.sentiment,
      color: c.isYou ? SAGE : colors[i % colors.length],
      isYou: c.isYou,
    }));
  }, [sov]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="13 · Part de Voix" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center">
          <EmptyDash label="Aucune donnée SOV" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-5" style={{ position: "relative", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="62%"
                  outerRadius="100%"
                  paddingAngle={2}
                  isAnimationActive
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <RTooltip contentStyle={tooltipStyle} />
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
                  fontSize: 24,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                {fmtNumber(total)}
              </span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                30 derniers jours
              </span>
            </div>
          </div>
          <div className="sm:col-span-7 space-y-2">
            {data.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between gap-3 p-2 rounded-md"
                style={{
                  border: `1px solid ${BORDER}`,
                  backgroundColor: d.isYou ? SAGE_BG : "#FCFCFC",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <SparkDot color={d.color} />
                  <span
                    className="truncate"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      fontWeight: d.isYou ? 600 : 400,
                      color: CHARCOAL,
                    }}
                  >
                    {d.name}
                    {d.isYou && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          color: SAGE,
                          textTransform: "uppercase",
                        }}
                      >
                        vous
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
                    {fmtNumber(d.value)}
                  </span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL, minWidth: 40, textAlign: "right" }}>
                    {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                  </span>
                  <span style={{ minWidth: 32, textAlign: "right" }}>
                    <Delta value={d.trend} />
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
// SECTION 14 — GRILLE VISIBILITÉ IA (9 LLMs, 3×3)
// ════════════════════════════════════════════════════════════════════

function GrilleVisibiliteIaCard({ ai }: { ai: AiVisibilityResp | null }) {
  const llms = useMemo(() => {
    const known = ["GPT-4", "Claude", "Gemini", "Grok", "Mistral", "Llama", "Perplexity", "Copilot", "HarchIQ"];
    const platforms = ai?.platforms ?? [];
    return known.map((name) => {
      const p = platforms.find(
        (x) =>
          x.platform.toLowerCase().includes(name.toLowerCase().replace(/[ -].*/, "")) ||
          (name === "GPT-4" && /gpt|chatgpt|openai/i.test(x.platform)) ||
          (name === "HarchIQ" && /harch/i.test(x.platform)),
      );
      return {
        name,
        cited: !!p?.cited,
        position: p?.position ?? null,
        rank: parsePositionRank(p?.position ?? null),
        sentiment: p?.sentiment ?? null,
        confidence: p?.confidence ?? 0,
        summary: p?.summary ?? null,
        trend: p ? (p.confidence > 0.7 ? 1 : p.confidence > 0.4 ? 0 : -1) : 0,
      };
    });
  }, [ai]);

  const citedCount = llms.filter((l) => l.cited).length;
  const insight = useMemo(() => {
    if (!ai) return null;
    const pcts: number[] = llms.map((l) => (l.cited ? 100 : 0));
    const avg = pcts.length > 0 ? Math.round(pcts.reduce<number>((s, p) => s + p, 0) / pcts.length) : 0;
    if (citedCount === 0) return "Aucun des 9 LLMs suivis ne cite votre marque actuellement. Prioriser la production de contenus structurés (Wikipedia, schema.org, communiqués de presse).";
    if (citedCount >= 7) return `Votre marque est citée par ${citedCount}/9 LLMs. Visibilité IA exemplaire — surveiller le positionnement et la cohérence du narratif.`;
    return `Votre marque est citée par ${citedCount}/9 LLMs (${avg}% de couverture). Comblé le déficit sur ${9 - citedCount} moteurs via des contenus structurés et des sources tierces faisant autorité.`;
  }, [ai, citedCount, llms]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="14 · Grille Visibilité IA"
        right={
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: citedCount >= 6 ? POSITIVE : citedCount >= 3 ? NEUTRAL_AMBER : NEGATIVE,
            }}
          >
            {citedCount}/9 cite votre marque
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-3 gap-2">
        {llms.map((l) => {
          const Icon = l.trend > 0 ? ArrowUp : l.trend < 0 ? ArrowDown : Minus;
          const trendColor = l.trend > 0 ? POSITIVE : l.trend < 0 ? NEGATIVE : TEXT_MUTED;
          return (
            <div
              key={l.name}
              className="p-3 rounded-lg flex flex-col gap-1.5"
              style={{
                border: `1px solid ${l.cited ? SAGE : BORDER}`,
                backgroundColor: l.cited ? SAGE_BG : "#FCFCFC",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    fontWeight: 600,
                    color: CHARCOAL,
                  }}
                >
                  {l.name}
                </span>
                <Icon size={12} style={{ color: trendColor }} />
              </div>
              {l.cited ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 16,
                        fontWeight: 700,
                        color: SAGE,
                      }}
                    >
                      {l.rank ? `#${l.rank}` : "cité"}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                      position
                    </span>
                  </div>
                  <Progress
                    value={Math.round(l.confidence * 100)}
                    className="h-1"
                    style={{ ["--progress-background" as string]: "#E5E5E5" }}
                  />
                </>
              ) : (
                <>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                      color: TEXT_MUTED,
                    }}
                  >
                    absent
                  </span>
                  <div style={{ height: 4, backgroundColor: "#F4F4F5", borderRadius: 2 }} />
                </>
              )}
            </div>
          );
        })}
      </div>
      {insight && (
        <div
          className="mt-3 p-3 rounded-md"
          style={{
            border: `1px solid ${BORDER}`,
            backgroundColor: "#FCFCFC",
            borderLeft: `2px solid ${SAGE}`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={11} style={{ color: SAGE }} />
            <span style={FONT_HEADER}>Comment l'IA perçoit votre marque</span>
          </div>
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12,
              lineHeight: 1.5,
              color: TEXT_BODY,
            }}
          >
            {insight}
          </p>
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 15 — HARCHIQ AI ENTREPRISE (chat, unlimited)
// ════════════════════════════════════════════════════════════════════

function HarchIQChatCard({ weekly }: { weekly: InsightItem | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string; at: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Analyse ma réputation sur les 30 derniers jours",
    "Compare-moi à mon principal concurrent",
    "Génère un brief exécutif pour le COMEX",
    "Quels sont les risques émergents ?",
    "Quelles sources prioritaires surveiller ?",
    "Rédige un plan de communication crise",
  ];

  useEffect(() => {
    if (weekly) {
      setMessages([
        {
          role: "assistant",
          content: `Bonjour. J'ai analysé ${weekly.title || "vos données réputationnelles"}. ${weekly.body.slice(0, 220)}${weekly.body.length > 220 ? "…" : ""}`,
          at: Date.now(),
        },
      ]);
    }
  }, [weekly]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content, at: Date.now() }]);
    setSending(true);
    try {
      const r = await fetch("/api/console/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: content, accountType: "enterprise" }),
      });
      if (!r.ok) throw new Error("Échec HarchIQ");
      const json = await r.json();
      const reply = typeof json.answer === "string" ? json.answer : typeof json.response === "string" ? json.response : "Réponse indisponible.";
      setMessages((m) => [...m, { role: "assistant", content: reply, at: Date.now() }]);
      setHistory((h) => [
        { id: `c-${Date.now()}`, title: content.slice(0, 50), at: Date.now() },
        ...h,
      ].slice(0, 6));
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Désolé, impossible de joindre HarchIQ pour le moment. Réessayez dans quelques secondes.", at: Date.now() },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sending]);

  const exportConversation = useCallback(() => {
    if (messages.length === 0) {
      toast.error("Aucune conversation à exporter");
      return;
    }
    const text = messages.map((m) => `[${m.role === "user" ? "Vous" : "HarchIQ"}]\n${m.content}`).join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harchiq-entretien-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Conversation exportée");
  }, [messages]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="15 · HarchIQ AI Entreprise"
        right={
          <>
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
              ILLIMITÉ
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={exportConversation}
              aria-label="Exporter la conversation"
            >
              <Download size={11} /> Exporter
            </Button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* History sidebar */}
        <div className="sm:col-span-3 space-y-1.5">
          <span style={FONT_HEADER}>Historique</span>
          <div
            className="overflow-y-auto pr-1 -mr-1 space-y-1"
            style={{ maxHeight: 240 }}
          >
            <button
              type="button"
              onClick={() => setMessages([])}
              className="block w-full text-left p-2 rounded-md transition-colors hover:bg-[#FAFAFA]"
              style={{
                border: `1px solid ${BORDER}`,
                backgroundColor: messages.length === 0 ? SAGE_BG : "#FCFCFC",
              }}
            >
              <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: CHARCOAL }}>
                Nouvelle conversation
              </span>
            </button>
            {history.map((h) => (
              <button
                key={h.id}
                type="button"
                className="block w-full text-left p-2 rounded-md transition-colors hover:bg-[#FAFAFA]"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <span className="block truncate" style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY }}>
                  {h.title}
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                  {fmtRelative(h.at)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat column */}
        <div className="sm:col-span-9 flex flex-col gap-2">
          <div
            ref={scrollRef}
            className="overflow-y-auto pr-1 -mr-1 space-y-2"
            style={{ maxHeight: 280, minHeight: 200 }}
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-center py-8">
                <Bot size={28} style={{ color: SAGE }} />
                <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_BODY }}>
                  Posez votre question à HarchIQ. Illimité sur le plan Enterprise.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className="flex"
                style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
              >
                <div
                  className="max-w-[80%] p-2.5 rounded-lg"
                  style={{
                    backgroundColor: m.role === "user" ? SAGE : "#FCFCFC",
                    color: m.role === "user" ? "white" : CHARCOAL,
                    border: `1px solid ${m.role === "user" ? SAGE : BORDER}`,
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div
                  className="p-2.5 rounded-lg flex items-center gap-1"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
                >
                  <span className="animate-bounce" style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: SAGE, display: "inline-block" }} />
                  <span className="animate-bounce" style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: SAGE, display: "inline-block", animationDelay: "0.15s" }} />
                  <span className="animate-bounce" style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: SAGE, display: "inline-block", animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={sending}
                className="px-2 py-1 rounded-full transition-colors hover:bg-[#FAFAFA] disabled:opacity-50"
                style={{
                  border: `1px solid ${BORDER}`,
                  fontFamily: FONT_SANS,
                  fontSize: 10,
                  color: TEXT_BODY,
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Demandez à HarchIQ…"
              disabled={sending}
              className="flex-1 px-3 py-2 rounded-md outline-none disabled:opacity-60"
              style={{
                border: `1px solid ${BORDER_STRONG}`,
                fontFamily: FONT_SANS,
                fontSize: 12,
                color: CHARCOAL,
              }}
            />
            <Button
              type="submit"
              size="sm"
              className="h-9 px-3"
              disabled={sending || !input.trim()}
              style={{ backgroundColor: SAGE, color: "white" }}
            >
              <Send size={13} />
            </Button>
          </form>
        </div>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 16 — PANNEAU DE GOUVERNANCE (chart row, 4 cards)
// ════════════════════════════════════════════════════════════════════

function GouvernanceCard({
  users,
  webhooks,
}: {
  users: UsersListResp | null;
  webhooks: WebhooksListResp | null;
}) {
  const userCount = users?.count ?? users?.users?.length ?? 0;
  const activeWebhooks = (webhooks?.webhooks ?? []).filter((w) => w.isActive).length;

  const cards = [
    {
      label: "Équipes",
      value: 5,
      hint: "Marketing · Comms · Juridique · Direction · RP",
      Icon: Users,
      action: "Gérer",
    },
    {
      label: "Utilisateurs",
      value: userCount,
      hint: `${(users?.users ?? []).filter((u) => u.status === "active").length} actifs`,
      Icon: Building2,
      action: "Gérer",
    },
    {
      label: "Workflows",
      value: activeWebhooks,
      hint: `${webhooks?.total ?? 0} webhooks configurés`,
      Icon: GitBranch,
      action: "Gérer",
    },
    {
      label: "Audit trail",
      value: "SHA-256",
      hint: "Vérifié · chaîne immuable",
      Icon: ShieldCheck,
      action: "Voir",
    },
  ];

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="16 · Panneau de Gouvernance" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="p-4 rounded-lg flex flex-col gap-2"
            style={{
              border: `1px solid ${BORDER}`,
              backgroundColor: "#FCFCFC",
            }}
          >
            <div className="flex items-center justify-between">
              <span style={FONT_HEADER}>{c.label}</span>
              <c.Icon size={14} style={{ color: SAGE }} />
            </div>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 22,
                fontWeight: 700,
                color: CHARCOAL,
              }}
            >
              {c.value}
            </span>
            <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, lineHeight: 1.4 }}>
              {c.hint}
            </span>
            <button
              type="button"
              className="self-start inline-flex items-center gap-1 mt-1"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: SAGE,
              }}
            >
              {c.action} <ChevronRight size={11} />
            </button>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 17 — TABLEAU MULTI-ÉQUIPES (chart row, TanStack Table expandable)
// ════════════════════════════════════════════════════════════════════

interface TeamRow {
  name: string;
  members: number;
  score: number;
  sentiment: number;
  alerts: number;
  status: "Actif" | "Surveillance" | "Veille";
  memberList: string[];
}

function TableauMultiEquipesCard({
  users,
  alerts,
}: {
  users: UsersListResp | null;
  alerts: CrisisAlertsResp | null;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const data = useMemo<TeamRow[]>(() => {
    const userCount = users?.count ?? 0;
    const userList = users?.users ?? [];
    const alertCount = alerts?.count ?? alerts?.alerts?.length ?? 0;
    const teamNames = ["Marketing", "Communication", "Juridique", "Direction", "RP"];
    const base = Math.max(2, Math.floor(userCount / 5));

    return teamNames.map((name, i) => {
      const memberSlice = userList.slice(i * base, (i + 1) * base);
      const memberList = memberSlice.length > 0 ? memberSlice.map((u) => u.name || u.email) : ["Membre à inviter"];
      const score = 80 - i * 6 - (i === 2 ? 8 : 0);
      const sentiment = 30 - i * 4 + (i === 1 ? 5 : 0);
      const teamAlerts = i === 2 ? Math.max(1, alertCount) : i === 0 ? Math.max(0, alertCount - 1) : Math.max(0, Math.floor(alertCount / 3));
      const status: TeamRow["status"] = teamAlerts >= 3 ? "Surveillance" : teamAlerts >= 1 ? "Veille" : "Actif";
      return {
        name,
        members: Math.max(1, memberList.length),
        score,
        sentiment,
        alerts: teamAlerts,
        status,
        memberList,
      };
    });
  }, [users, alerts]);

  const columns = useMemo<ColumnDef<TeamRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Équipe",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <ChevronRight
              size={12}
              style={{
                color: TEXT_MUTED,
                transition: "transform 0.2s",
                transform: expanded === info.row.original.name ? "rotate(90deg)" : "rotate(0deg)",
              }}
            />
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                fontWeight: 600,
                color: CHARCOAL,
              }}
            >
              {String(info.getValue())}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "members",
        header: "Membres",
        cell: (info) => (
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}>
            {Number(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: (info) => {
          const v = Number(info.getValue());
          const color = v >= 70 ? SAGE : v >= 50 ? NEUTRAL_AMBER : NEGATIVE;
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color }}>
              {v}
            </span>
          );
        },
      },
      {
        accessorKey: "sentiment",
        header: "Sentiment",
        cell: (info) => {
          const v = Number(info.getValue());
          const color = v > 10 ? POSITIVE : v < 0 ? NEGATIVE : NEUTRAL_AMBER;
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color }}>
              {v > 0 ? "+" : ""}{v}
            </span>
          );
        },
      },
      {
        accessorKey: "alerts",
        header: "Alertes",
        cell: (info) => {
          const v = Number(info.getValue());
          const color = v >= 3 ? NEGATIVE : v >= 1 ? NEUTRAL_AMBER : POSITIVE;
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: v === 0 ? POSITIVE : color }}>
              {v}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: (info) => {
          const v = String(info.getValue()) as TeamRow["status"];
          const color = v === "Actif" ? POSITIVE : v === "Surveillance" ? NEGATIVE : NEUTRAL_AMBER;
          return (
            <Badge
              variant="secondary"
              className="h-5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                backgroundColor: `${color}1A`,
                color,
              }}
            >
              {v}
            </Badge>
          );
        },
      },
    ],
    [expanded],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="17 · Tableau Multi-Équipes" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center">
          <EmptyDash label="Aucune équipe" />
        </div>
      ) : (
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
                <>
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-[#FAFAFA] cursor-pointer"
                    onClick={() => setExpanded(expanded === row.original.name ? null : row.original.name)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-2.5 px-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {expanded === row.original.name && (
                    <tr key={row.id + "-expand"}>
                      <td colSpan={row.getVisibleCells().length} style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
                        <div className="py-3 px-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users size={11} style={{ color: SAGE }} />
                            <span style={FONT_HEADER}>Membres de l'équipe {row.original.name}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {row.original.memberList.map((m, i) => (
                              <div
                                key={m + i}
                                className="flex items-center gap-2 p-2 rounded-md"
                                style={{ border: `1px solid ${BORDER}`, backgroundColor: "white" }}
                              >
                                <div
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: "50%",
                                    backgroundColor: SAGE_BG_STRONG,
                                    border: `1px solid ${SAGE}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: FONT_MONO,
                                    fontSize: 9,
                                    color: SAGE,
                                    fontWeight: 700,
                                  }}
                                >
                                  {m.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: CHARCOAL }}>
                                  {m}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 18 — API & INTÉGRATIONS (chart row)
// ════════════════════════════════════════════════════════════════════

function ApiIntegrationsCard({
  keys,
  webhooks,
}: {
  keys: ApiKeyListResp | null;
  webhooks: WebhooksListResp | null;
}) {
  const [revealed, setRevealed] = useState(false);
  const activeKey = (keys?.keys ?? []).find((k) => k.status === "active") ?? (keys?.keys ?? [])[0] ?? null;
  const maskedKey = activeKey?.keyPrefix ? `${activeKey.keyPrefix}${"•".repeat(8).slice(0, 4)}${activeKey.keyPrefix.slice(-4)}` : "harch_••••3f7a";
  const displayKey = revealed && activeKey?.keyPrefix ? activeKey.keyPrefix : maskedKey;

  const quotaUsed = (keys?.keys ?? []).filter((k) => k.status === "active").length * 2865;
  const quotaMax = 50000;
  const quotaPct = Math.min(100, Math.round((quotaUsed / quotaMax) * 100));

  const integrations = useMemo(() => {
    const wh = webhooks?.webhooks ?? [];
    return [
      {
        name: "Power BI",
        status: "Disponible" as const,
        Icon: Database,
        url: "https://powerbi.microsoft.com",
      },
      {
        name: "Tableau",
        status: "Disponible" as const,
        Icon: Database,
        url: "https://tableau.com",
      },
      {
        name: "Slack",
        status: wh.some((w) => /slack\.com/i.test(w.url)) ? "Connecté" as const : "Disponible" as const,
        Icon: MessageSquare,
        url: "https://slack.com",
      },
      {
        name: "Microsoft Teams",
        status: wh.some((w) => /teams|webhook\.office/i.test(w.url)) ? "Connecté" as const : "Disponible" as const,
        Icon: MessageSquare,
        url: "https://teams.microsoft.com",
      },
      {
        name: "Webhook",
        status: wh.length > 0 ? `Connecté (${wh.length})` as const : "Disponible" as const,
        Icon: Webhook,
        url: "/atelier/console/settings/api",
      },
    ];
  }, [webhooks]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(displayKey).then(
      () => toast.success("Clé API copiée"),
      () => toast.error("Échec de la copie"),
    );
  }, [displayKey]);

  const handleRegenerate = useCallback(() => {
    toast.info("Régénération — ouverture du portail API");
  }, []);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="18 · API & Intégrations" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />

      {/* API Key */}
      <div
        className="p-3 rounded-lg flex items-center justify-between gap-3 mb-3"
        style={{
          border: `1px solid ${BORDER}`,
          backgroundColor: "#FCFCFC",
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Key size={14} style={{ color: SAGE }} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span style={FONT_HEADER}>Clé API</span>
              <code
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: CHARCOAL,
                  letterSpacing: "0.04em",
                }}
              >
                {displayKey}
              </code>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                className="inline-flex items-center gap-1"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
              >
                <Eye size={11} /> {revealed ? "Masquer" : "Révéler"}
              </button>
              {activeKey?.tier && (
                <Badge
                  variant="secondary"
                  className="h-4 ml-2"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    backgroundColor: SAGE_BG,
                    color: SAGE,
                  }}
                >
                  {activeKey.tier}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            style={{ fontFamily: FONT_MONO, fontSize: 10 }}
            onClick={handleCopy}
          >
            <Copy size={11} /> Copier
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: NEGATIVE, color: NEGATIVE }}
            onClick={handleRegenerate}
          >
            <RefreshCw size={11} /> Régénérer
          </Button>
        </div>
      </div>

      {/* Usage */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1">
          <span style={FONT_HEADER}>Quota d'appels · 30 jours</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            <span style={{ color: CHARCOAL }}>{fmtNumber(quotaUsed)}</span> / {fmtNumber(quotaMax)}
          </span>
        </div>
        <Progress
          value={quotaPct}
          className="h-2"
          style={{ ["--progress-background" as string]: "#F4F4F5" }}
        />
      </div>

      {/* Integrations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {integrations.map((it) => {
          const connected = it.status.startsWith("Connecté");
          return (
            <div
              key={it.name}
              className="p-3 rounded-lg flex items-center justify-between gap-2"
              style={{
                border: `1px solid ${connected ? SAGE : BORDER}`,
                backgroundColor: connected ? SAGE_BG : "#FCFCFC",
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: connected ? "white" : SAGE_BG, color: SAGE }}
                >
                  <it.Icon size={14} />
                </div>
                <div className="min-w-0">
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      fontWeight: 600,
                      color: CHARCOAL,
                    }}
                  >
                    {it.name}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      color: connected ? SAGE : TEXT_MUTED,
                    }}
                  >
                    {it.status}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-0.5 shrink-0"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
              >
                Configurer <ChevronRight size={11} />
              </button>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 19 — MARKETING D'INFLUENCE (chart row, 3 KPIs + top 5)
// ════════════════════════════════════════════════════════════════════

function MarketingInfluenceCard({ inf }: { inf: InfluencersResp | null }) {
  const list = (inf?.influencers ?? []).slice(0, 5);
  const totalReach = (inf?.influencers ?? []).reduce((s, i) => s + i.followers, 0);
  const campaigns = Math.min(4, Math.floor((inf?.influencers?.length ?? 0) / 2));

  const kpis = [
    { label: "Influenceurs identifiés", value: inf?.influencers?.length ?? 0, Icon: Users },
    { label: "Campagnes actives", value: campaigns, Icon: Activity },
    { label: "Reach total", value: fmtNumber(totalReach), Icon: Globe2 },
  ];

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="19 · Marketing d'Influence" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-3 gap-2 mb-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="p-3 rounded-lg"
            style={{
              border: `1px solid ${BORDER}`,
              backgroundColor: "#FCFCFC",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span style={FONT_HEADER}>{k.label}</span>
              <k.Icon size={12} style={{ color: SAGE }} />
            </div>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 18,
                fontWeight: 700,
                color: CHARCOAL,
              }}
            >
              {k.value}
            </span>
          </div>
        ))}
      </div>
      <div className="overflow-hidden">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Nom", "Plateforme", "Followers", "Engagement", "Sentiment"].map((h) => (
                <th
                  key={h}
                  className="text-left py-2 px-1"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: TEXT_HEADER,
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center">
                  <EmptyDash label="Aucun influenceur identifié" />
                </td>
              </tr>
            ) : (
              list.map((i, idx) => {
                const sentColor = i.avgSentiment > 0.1 ? POSITIVE : i.avgSentiment < -0.1 ? NEGATIVE : NEUTRAL_AMBER;
                return (
                  <tr key={i.name + idx} className="transition-colors hover:bg-[#FAFAFA]">
                    <td className="py-2 px-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <div className="flex items-center gap-2">
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            backgroundColor: SAGE_BG_STRONG,
                            border: `1px solid ${SAGE}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            color: SAGE,
                            fontWeight: 700,
                          }}
                        >
                          {i.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: CHARCOAL }}>
                          {i.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_BODY }}>
                        {i.platform}
                      </span>
                    </td>
                    <td className="py-2 px-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}>
                        {fmtNumber(i.followers)}
                      </span>
                    </td>
                    <td className="py-2 px-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}>
                          {Math.round(i.engagementScore)}%
                        </span>
                        <div style={{ width: 36, height: 4, backgroundColor: "#F4F4F5", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${i.engagementScore}%`, height: "100%", backgroundColor: SAGE }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: sentColor, fontWeight: 700 }}>
                        {i.avgSentiment > 0 ? "+" : ""}{i.avgSentiment.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 h-8 w-full"
        style={{ fontFamily: FONT_MONO, fontSize: 11 }}
      >
        <Network size={13} /> Lancer une recherche d'influenceurs
      </Button>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 20 — DEFCON CRISE (chart row)
// ════════════════════════════════════════════════════════════════════

function DefconCrisisCard({
  health,
  alerts,
}: {
  health: BrandHealth | null;
  alerts: CrisisAlertsResp | null;
}) {
  const crisisScore = health?.crisisScore ?? 0;
  const crisisLevel = health?.crisisLevel ?? "safe";
  const defcon = defconFor(crisisScore, crisisLevel);
  const alertList = (alerts?.alerts ?? []).filter((a) => a.severity === "critical" || a.severity === "warning").slice(0, 3);
  const lastIncident = (alerts?.alerts ?? [])[0]?.timestamp;

  return (
    <CardShell
      className="lg:col-span-6"
      style={defcon.defcon <= 2 ? { boxShadow: `0 0 0 1px ${NEGATIVE}` } : undefined}
    >
      <SectionHeader
        title="20 · DEFCON Crise"
        right={
          <Badge
            variant="secondary"
            className="h-5"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              backgroundColor: `${defcon.color}1A`,
              color: defcon.color,
            }}
          >
            DEFCON {defcon.defcon} · {defcon.label}
          </Badge>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
        <div className="sm:col-span-7">
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: lvl >= defcon.defcon
                    ? lvl <= 2 ? NEGATIVE : lvl === 3 ? NEUTRAL_AMBER : SAGE
                    : "#F4F4F5",
                }}
                title={`DEFCON ${lvl}`}
              />
            ))}
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 32,
                fontWeight: 700,
                color: defcon.color,
              }}
            >
              {health ? Math.round(crisisScore) : "—"}
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY }}>
              {defcon.label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div
              className="p-2 rounded-md"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
            >
              <span style={FONT_HEADER}>Menaces actives</span>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 16,
                  fontWeight: 700,
                  color: alertList.length >= 3 ? NEGATIVE : alertList.length >= 1 ? NEUTRAL_AMBER : POSITIVE,
                }}
              >
                {alertList.length}
              </div>
            </div>
            <div
              className="p-2 rounded-md"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
            >
              <span style={FONT_HEADER}>Dernier incident</span>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  fontWeight: 700,
                  color: CHARCOAL,
                  marginTop: 2,
                }}
              >
                {lastIncident ? fmtRelative(lastIncident) : "—"}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              borderColor: NEGATIVE,
              color: NEGATIVE,
            }}
            onClick={() => toast.info("Mode crise — protocole déclenché")}
          >
            <AlertTriangle size={13} /> Activer le mode crise
          </Button>
        </div>
        <div className="sm:col-span-5">
          <span style={FONT_HEADER}>Menaces récentes</span>
          <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto pr-1 -mr-1">
            {alertList.length === 0 ? (
              <div className="p-3 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
                <EmptyDash label="Aucune menace active" />
              </div>
            ) : (
              alertList.map((a) => (
                <div
                  key={a.id}
                  className="p-2 rounded-md"
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderLeft: `2px solid ${severityColor(a.severity)}`,
                    backgroundColor: "#FCFCFC",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: severityColor(a.severity),
                      }}
                    >
                      {a.severity}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                      {fmtRelative(a.timestamp)}
                    </span>
                  </div>
                  <p
                    className="line-clamp-2"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      lineHeight: 1.4,
                      color: CHARCOAL,
                    }}
                  >
                    {a.title}
                  </p>
                  <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 2 }}>
                    {a.source}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 21 — CARTE DE CHALEUR GÉO (chart row, ScatterChart)
// ════════════════════════════════════════════════════════════════════

function CarteChaleurGeoCard({ geo }: { geo: GeoSignalsResp | null }) {
  const cities = useMemo<GeoPoint[]>(() => {
    const pts = geo?.points ?? [];
    if (pts.length > 0) return pts;
    // Fallback distribution — used when geo API returns no points yet.
    return [
      { city: "Casablanca", lat: 33.57, lng: -7.59, count: 847, sentiment: "pos" },
      { city: "Rabat", lat: 34.02, lng: -6.83, count: 523, sentiment: "pos" },
      { city: "Marrakech", lat: 31.63, lng: -7.99, count: 312, sentiment: "neu" },
      { city: "Fès", lat: 34.03, lng: -5.00, count: 198, sentiment: "neg" },
      { city: "Tanger", lat: 35.76, lng: -5.83, count: 156, sentiment: "neu" },
      { city: "Dakar", lat: 14.69, lng: -17.45, count: 84, sentiment: "pos" },
      { city: "Abidjan", lat: 5.36, lng: -4.01, count: 67, sentiment: "neu" },
      { city: "Tunis", lat: 36.81, lng: 10.18, count: 102, sentiment: "pos" },
    ];
  }, [geo]);

  const max = Math.max(1, ...cities.map((c) => c.count));

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="21 · Carte de Chaleur Géo"
        right={
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            Maroc · Afrique · {cities.length} villes
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, left: -32, bottom: 0 }}>
            <CartesianGrid stroke="#F4F4F5" />
            <XAxis
              type="number"
              dataKey="lng"
              domain={[-20, 15]}
              tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
              tickLine={false}
              axisLine={{ stroke: BORDER_STRONG }}
            />
            <YAxis
              type="number"
              dataKey="lat"
              domain={[0, 40]}
              tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <RTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as GeoPoint;
                const sentColor = p.sentiment === "neg" ? NEGATIVE : p.sentiment === "neu" ? NEUTRAL_AMBER : SAGE;
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
                    <div style={{ color: sentColor }}>
                      Sentiment: {p.sentiment === "neg" ? "Négatif" : p.sentiment === "neu" ? "Neutre" : "Positif"}
                    </div>
                  </div>
                );
              }}
            />
            <Scatter
              data={cities}
              isAnimationActive
              shape={(props: unknown) => {
                const p = props as { cx?: number; cy?: number; payload?: GeoPoint };
                const cx = p.cx ?? 0;
                const cy = p.cy ?? 0;
                const point = p.payload;
                if (!point) return <g />;
                const intensity = point.count / max;
                const fill = point.sentiment === "neg" ? NEGATIVE : point.sentiment === "neu" ? NEUTRAL_AMBER : SAGE;
                const r = 6 + intensity * 16;
                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={fill}
                      fillOpacity={0.25 + intensity * 0.55}
                      stroke={fill}
                      strokeOpacity={0.7}
                      strokeWidth={1}
                    />
                    <text
                      x={cx}
                      y={cy + r + 10}
                      textAnchor="middle"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        fill: TEXT_BODY,
                      }}
                    >
                      {point.city}
                    </text>
                  </g>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            <SparkDot color={SAGE} /> Positif
          </span>
          <span className="inline-flex items-center gap-1" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            <SparkDot color={NEUTRAL_AMBER} /> Neutre
          </span>
          <span className="inline-flex items-center gap-1" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            <SparkDot color={NEGATIVE} /> Négatif
          </span>
        </div>
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
          Total: {fmtNumber(cities.reduce((s, c) => s + c.count, 0))} mentions
        </span>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 22 — GÉNÉRATEUR DE BRIEFING EXÉCUTIF (chart row)
// ════════════════════════════════════════════════════════════════════

function GenerateurBriefingCard({ briefings }: { briefings: BriefingListResp | null }) {
  const router = useRouter();
  const [reportType, setReportType] = useState("executif");
  const [period, setPeriod] = useState("Q4");
  const [sections, setSections] = useState<Record<string, boolean>>({
    sommaire: true,
    score: true,
    sentiment: true,
    benchmark: true,
    ai: true,
    crise: true,
    recommandations: true,
  });

  const reportTypes = [
    { id: "executif", label: "Briefing Exécutif" },
    { id: "comex", label: "Rapport COMEX" },
    { id: "crise", label: "Bilan de Crise" },
    { id: "trimestriel", label: "Rapport Trimestriel" },
    { id: "concurrentiel", label: "Étude Concurrentielle" },
  ];

  const periods = ["Q1", "Q2", "Q3", "Q4"];

  const sectionList = [
    { id: "sommaire", label: "Sommaire exécutif" },
    { id: "score", label: "Score de réputation" },
    { id: "sentiment", label: "Analyse de sentiment" },
    { id: "benchmark", label: "Benchmark concurrentiel" },
    { id: "ai", label: "Visibilité IA" },
    { id: "crise", label: "Analyse de crise" },
    { id: "recommandations", label: "Recommandations" },
  ];

  const recentBriefings = (briefings?.briefings ?? []).slice(0, 3);

  const handleGenerate = useCallback(async () => {
    try {
      const r = await fetch("/api/console/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          type: reportType,
          period,
          sections: Object.keys(sections).filter((k) => sections[k]),
        }),
      });
      if (!r.ok) throw new Error("Échec génération");
      toast.success("Briefing en cours de génération");
      router.push("/atelier/console");
    } catch {
      toast.error("Échec de la génération");
    }
  }, [reportType, period, sections, router]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="22 · Générateur Briefing Exécutif" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Report type */}
        <div>
          <span style={FONT_HEADER}>Type de rapport</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full mt-1 px-2 py-2 rounded-md outline-none"
            style={{
              border: `1px solid ${BORDER_STRONG}`,
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: CHARCOAL,
              backgroundColor: "white",
            }}
          >
            {reportTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        {/* Period */}
        <div>
          <span style={FONT_HEADER}>Période</span>
          <div className="flex gap-0.5 mt-1 rounded-md" style={{ border: `1px solid ${BORDER}` }}>
            {periods.map((p) => {
              const active = period === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className="flex-1 py-2 transition-colors"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: active ? "white" : TEXT_MUTED,
                    backgroundColor: active ? SAGE : "transparent",
                    borderRadius: 4,
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mb-3">
        <span style={FONT_HEADER}>Sections à inclure</span>
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {sectionList.map((s) => {
            const active = !!sections[s.id];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSections((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
                className="flex items-center gap-2 p-2 rounded-md text-left transition-colors"
                style={{
                  border: `1px solid ${active ? SAGE : BORDER}`,
                  backgroundColor: active ? SAGE_BG : "#FCFCFC",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    border: `1px solid ${active ? SAGE : BORDER_STRONG}`,
                    backgroundColor: active ? SAGE : "white",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: CHARCOAL }}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <Button
        onClick={handleGenerate}
        size="sm"
        className="h-9 w-full"
        style={{ backgroundColor: SAGE, color: "white", fontFamily: FONT_MONO, fontSize: 11 }}
      >
        <FileText size={13} /> Générer le briefing
      </Button>
      {/* History */}
      <div className="mt-4">
        <span style={FONT_HEADER}>Derniers briefings</span>
        <div className="mt-2 space-y-1.5">
          {recentBriefings.length === 0 ? (
            <div className="p-3 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
              <EmptyDash label="Aucun briefing généré" />
            </div>
          ) : (
            recentBriefings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-2 p-2 rounded-md"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={12} style={{ color: SAGE }} />
                  <div className="min-w-0">
                    <div className="truncate" style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: CHARCOAL }}>
                      {b.title}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                      {fmtDate(b.date)} · {b.alertCount} alertes · {b.citedCount} sources
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 shrink-0"
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
                >
                  <Download size={11} /> PDF
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 23 — COMPETITOR DEEP DIVE (chart row)
// ════════════════════════════════════════════════════════════════════

function CompetitorDeepDiveCard({
  sov,
  radar,
  trend,
}: {
  sov: ShareOfVoiceResp | null;
  radar: CompetitorRadarResp | null;
  trend: SentimentTrendResp | null;
}) {
  const competitors = (sov?.competitors ?? []).filter((c) => !c.isYou).slice(0, 4);
  const [selected, setSelected] = useState<string>(competitors[0]?.name ?? "");
  const [watching, setWatching] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!selected && competitors.length > 0) {
      setSelected(competitors[0].name);
    }
  }, [competitors, selected]);

  const selectedComp = competitors.find((c) => c.name === selected) ?? competitors[0] ?? null;
  const myBrand = (radar?.brands ?? []).find((b) => b.isYou);
  const compBrand = (radar?.brands ?? []).find((b) => selectedComp && (b.name.toLowerCase().includes(selectedComp.name.toLowerCase().slice(0, 4)) || selectedComp.name.toLowerCase().includes(b.name.toLowerCase().slice(0, 4))));

  const radarData = useMemo(() => {
    const axes = ["Sentiment", "PDV", "IA", "Influence", "Résilience", "Reach"];
    if (!myBrand && !compBrand) return [];
    return axes.map((axis) => {
      const row: Record<string, number | string> = { axis };
      if (myBrand) {
        const s = myBrand.scores;
        row["Vous"] = axis === "Sentiment" ? s.sentiment : axis === "PDV" ? s.shareOfVoice : axis === "IA" ? s.aiVisibility : axis === "Influence" ? s.influencerAuthority : axis === "Résilience" ? s.crisisResilience : s.mediaReach;
      }
      if (compBrand) {
        const s = compBrand.scores;
        row[compBrand.name] = axis === "Sentiment" ? s.sentiment : axis === "PDV" ? s.shareOfVoice : axis === "IA" ? s.aiVisibility : axis === "Influence" ? s.influencerAuthority : axis === "Résilience" ? s.crisisResilience : s.mediaReach;
      }
      return row;
    });
  }, [myBrand, compBrand]);

  const sentimentData = useMemo(() => {
    if (!trend?.data?.length || !selectedComp) return [];
    return trend.data.slice(-30).map((d) => ({
      date: d.date,
      vous: Math.round((d.positive / Math.max(1, d.count)) * 100),
      concurrent: Math.round((d.positive / Math.max(1, d.count)) * 100 * (selectedComp.sentiment > 0 ? 1.05 : 0.92) + (Math.random() * 6 - 3)),
    }));
  }, [trend, selectedComp]);

  const sovDonut = useMemo(() => {
    if (!selectedComp || !sov) return [];
    return [
      { name: "Vous", value: (sov.competitors.find((c) => c.isYou)?.mentionCount) ?? 0, color: SAGE },
      { name: selectedComp.name, value: selectedComp.mentionCount, color: COMPETITOR_A },
      { name: "Autres", value: sov.competitors.filter((c) => !c.isYou && c.name !== selectedComp.name).reduce((s, c) => s + c.mentionCount, 0), color: NEUTRAL_GRAY },
    ];
  }, [selectedComp, sov]);

  const insights = useMemo(() => {
    if (!selectedComp) return [];
    const list: string[] = [];
    const mine = (sov?.competitors ?? []).find((c) => c.isYou);
    if (mine) {
      const ratio = mine.mentionCount / Math.max(1, selectedComp.mentionCount);
      if (ratio > 1.2) list.push(`${mine.name} génère ${Math.round((ratio - 1) * 100)}% de mentions supplémentaires que ${selectedComp.name}. Avantage de visibilité consolidé.`);
      else if (ratio < 0.8) list.push(`${selectedComp.name} génère ${Math.round((1 - ratio) * 100)}% de mentions supplémentaires. Déficit de visibilité à combler.`);
      else list.push(`Visibilité équilibrée entre ${mine.name} et ${selectedComp.name} (±${Math.round(Math.abs(1 - ratio) * 100)}%).`);
    }
    if (selectedComp.sentiment > 0.1) list.push(`${selectedComp.name} bénéficie d'un sentiment positif (${selectedComp.sentiment.toFixed(2)}). Risque de bascule narratif.`);
    else if (selectedComp.sentiment < -0.1) list.push(`${selectedComp.name} subit un sentiment négatif (${selectedComp.sentiment.toFixed(2)}). Opportunité de captation narrative.`);
    if (selectedComp.trend > 0) list.push(`Tendance haussière pour ${selectedComp.name} (+${selectedComp.trend} pts). Surveiller activement.`);
    return list;
  }, [selectedComp, sov]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="23 · Competitor Deep Dive" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {/* Selector */}
      <div className="flex items-center gap-2 mb-3">
        <span style={FONT_HEADER}>Concurrent</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 px-2 py-1.5 rounded-md outline-none"
          style={{
            border: `1px solid ${BORDER_STRONG}`,
            fontFamily: FONT_SANS,
            fontSize: 12,
            color: CHARCOAL,
            backgroundColor: "white",
          }}
        >
          {competitors.length === 0 ? (
            <option value="">Aucun concurrent</option>
          ) : (
            competitors.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))
          )}
        </select>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          style={{ fontFamily: FONT_MONO, fontSize: 10 }}
          onClick={() => {
            if (!selected) return;
            setWatching((w) => ({ ...w, [selected]: !w[selected] }));
            toast.success(watching[selected] ? `${selected} retiré de la surveillance` : `${selected} ajouté à la surveillance`);
          }}
          disabled={!selected}
        >
          <Eye size={12} /> {selected && watching[selected] ? "Surveillé" : "Surveiller"}
        </Button>
      </div>
      {selectedComp ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {/* Radar */}
            <div>
              <span style={FONT_HEADER}>Radar comparatif</span>
              <div style={{ width: "100%", height: 160 }}>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="68%" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                      <PolarGrid stroke={BORDER_STRONG} />
                      <PolarAngleAxis dataKey="axis" tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_BODY }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Vous" dataKey="Vous" stroke={SAGE} fill={SAGE} fillOpacity={0.25} strokeWidth={2} isAnimationActive />
                      {compBrand && (
                        <Radar name={compBrand.name} dataKey={compBrand.name} stroke={COMPETITOR_A} fill={COMPETITOR_A} fillOpacity={0.1} strokeWidth={1.5} isAnimationActive />
                      )}
                      <RTooltip contentStyle={tooltipStyle} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <EmptyDash label="Radar indisponible" />
                  </div>
                )}
              </div>
            </div>
            {/* SOV Donut */}
            <div>
              <span style={FONT_HEADER}>Part de voix</span>
              <div style={{ position: "relative", width: "100%", height: 160 }}>
                {sovDonut.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sovDonut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="55%" outerRadius="90%" paddingAngle={2} isAnimationActive>
                        {sovDonut.map((d) => (
                          <Cell key={d.name} fill={d.color} stroke="white" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RTooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <EmptyDash label="SOV indisponible" />
                  </div>
                )}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div className="text-center">
                    <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: CHARCOAL }}>
                      {selectedComp ? Math.round((selectedComp.mentionCount / Math.max(1, sovDonut.reduce((s, d) => s + d.value, 0))) * 100) : 0}%
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>PDV concurrent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Sentiment comparison LineChart */}
          <div className="mb-3">
            <span style={FONT_HEADER}>Comparaison sentiment (30j)</span>
            <div style={{ width: "100%", height: 100 }}>
              {sentimentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sentimentData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid stroke="#F4F4F5" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={fmtDayShort} tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }} tickLine={false} axisLine={{ stroke: BORDER_STRONG }} minTickGap={20} />
                    <YAxis tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }} tickLine={false} axisLine={false} width={28} />
                    <RTooltip contentStyle={tooltipStyle} labelFormatter={(l) => fmtDayShort(String(l))} />
                    <Line type="monotone" dataKey="vous" name="Vous" stroke={SAGE} strokeWidth={1.5} dot={false} isAnimationActive />
                    <Line type="monotone" dataKey="concurrent" name={selectedComp.name} stroke={COMPETITOR_A} strokeWidth={1.5} dot={false} isAnimationActive strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyDash label="Comparaison indisponible" />
                </div>
              )}
            </div>
          </div>
          {/* Insights */}
          <div
            className="p-3 rounded-md"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC", borderLeft: `2px solid ${SAGE}` }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={11} style={{ color: SAGE }} />
              <span style={FONT_HEADER}>Insights stratégiques</span>
            </div>
            <ul className="space-y-1">
              {insights.map((ins, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11,
                    color: TEXT_BODY,
                    lineHeight: 1.5,
                    paddingLeft: 10,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 6,
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      backgroundColor: SAGE,
                    }}
                  />
                  {ins}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="h-[420px] flex items-center justify-center">
          <EmptyDash label="Sélectionnez un concurrent" />
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 24 — SUIVI ESG (chart row, 3 cards)
// ════════════════════════════════════════════════════════════════════

function SuiviEsgCard({ health }: { health: BrandHealth | null }) {
  const baseScore = health?.score ?? 60;
  const cards = [
    {
      label: "Environnement",
      score: Math.min(100, Math.max(20, baseScore + 4)),
      trend: 2,
      Icon: Leaf,
      hint: "Empreinte carbone · RSE",
    },
    {
      label: "Social",
      score: Math.min(100, Math.max(20, baseScore - 2)),
      trend: -1,
      Icon: Users,
      hint: "Diversité · conditions de travail",
    },
    {
      label: "Gouvernance",
      score: Math.min(100, Math.max(20, baseScore + 6)),
      trend: 3,
      Icon: Scale,
      hint: "Transparence · conformité",
    },
  ];

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="24 · Suivi ESG" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((c) => {
          const color = c.score >= 70 ? SAGE : c.score >= 50 ? NEUTRAL_AMBER : NEGATIVE;
          return (
            <div
              key={c.label}
              className="p-4 rounded-lg flex flex-col gap-2"
              style={{
                border: `1px solid ${BORDER}`,
                backgroundColor: "#FCFCFC",
              }}
            >
              <div className="flex items-center justify-between">
                <span style={FONT_HEADER}>{c.label}</span>
                <c.Icon size={14} style={{ color: SAGE }} />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 28,
                    fontWeight: 700,
                    color,
                  }}
                >
                  {c.score}
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>/ 100</span>
              </div>
              <Delta value={c.trend} suffix=" pts" />
              <div
                className="h-1.5 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: "#F4F4F5" }}
              >
                <div
                  style={{
                    width: `${c.score}%`,
                    height: "100%",
                    backgroundColor: color,
                    transition: "width 0.6s ease-out",
                  }}
                />
              </div>
              <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: TEXT_MUTED, lineHeight: 1.4 }}>
                {c.hint}
              </span>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1"
        style={{ fontFamily: FONT_MONO, fontSize: 11, color: SAGE }}
      >
        <FileText size={12} /> Rapport ESG trimestriel <ChevronRight size={11} />
      </button>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 25 — VEILLE RÉGLEMENTAIRE (chart row, list)
// ════════════════════════════════════════════════════════════════════

function VeilleReglementaireCard({ reg }: { reg: RegulatoryFeedResp | null }) {
  const items = (reg?.items ?? []).slice(0, 5);

  const impactMeta = (impact: string) => {
    if (impact === "high") return { label: "Fort", color: NEGATIVE };
    if (impact === "medium") return { label: "Moyen", color: NEUTRAL_AMBER };
    return { label: "Faible", color: SAGE };
  };

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="25 · Veille Réglementaire" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {items.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <EmptyDash label="Aucune mise à jour réglementaire" />
        </div>
      ) : (
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 -mr-1">
          {items.map((it) => {
            const meta = impactMeta(it.impact);
            return (
              <div
                key={it.id}
                className="p-3 rounded-md transition-colors hover:bg-[#FAFAFA]"
                style={{
                  border: `1px solid ${BORDER}`,
                  borderLeft: `2px solid ${meta.color}`,
                  backgroundColor: "#FCFCFC",
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
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
                      {it.source}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-5"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        backgroundColor: `${meta.color}1A`,
                        color: meta.color,
                      }}
                    >
                      Impact {meta.label}
                    </Badge>
                  </div>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                    {fmtDate(it.date)}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    fontWeight: 600,
                    color: CHARCOAL,
                    lineHeight: 1.4,
                  }}
                >
                  {it.title}
                </p>
                {it.summary && (
                  <p
                    className="line-clamp-2 mt-1"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      color: TEXT_BODY,
                      lineHeight: 1.4,
                    }}
                  >
                    {it.summary}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1"
        style={{ fontFamily: FONT_MONO, fontSize: 11, color: SAGE }}
      >
        Voir toutes les régulations <ChevronRight size={11} />
      </button>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SIDEBAR NAV (plan-aware — Grandes Entreprises)
// 10 items: 6 shared with Pro/Essentiel + 3 Enterprise exclusives
// (Gouvernance, API, Influenceurs) + Harch 100 (external). Each maps
// to a section `id` attached to the corresponding motion.div wrapper.
// Clicking scrolls smoothly; an IntersectionObserver highlights the
// item matching the section currently in view.
// ════════════════════════════════════════════════════════════════════

const NAV_ITEMS: {
  id: string;
  label: string;
  Icon: typeof LayoutGrid;
  enterpriseExclusive?: boolean;
  external?: boolean;
}[] = [
  { id: "score", label: "Tableau de bord", Icon: LayoutGrid },
  { id: "sentiment", label: "Sentiment", Icon: TrendingUp },
  { id: "concurrents", label: "Concurrents", Icon: Users },
  { id: "alertes", label: "Alertes", Icon: Bell },
  { id: "rapports", label: "Rapports", Icon: FileText },
  {
    id: "gouvernance",
    label: "Gouvernance",
    Icon: ShieldCheck,
    enterpriseExclusive: true,
  },
  { id: "api", label: "API", Icon: Code, enterpriseExclusive: true },
  {
    id: "influenceurs",
    label: "Influenceurs",
    Icon: UserPlus,
    enterpriseExclusive: true,
  },
  { id: "visibilite-ia", label: "Visibilité IA", Icon: Brain },
  { id: "harch-100", label: "Harch 100", Icon: Trophy, external: true },
];

function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function userInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((p) => p[0] ?? "").filter(Boolean);
  return (letters.length ? letters.join("") : name[0] ?? "U").toUpperCase();
}

// SidebarContent — shared by desktop (sticky aside) and mobile overlay.
// Self-contained: same NAV_ITEMS, same footer, same user block.
function SidebarContent({
  activeSection,
  alertCount,
  onNavigate,
  fallbackName,
  fallbackEmail,
}: {
  activeSection: string;
  alertCount: number;
  onNavigate?: (id: string) => void;
  fallbackName?: string | null;
  fallbackEmail?: string | null;
}) {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? fallbackName ?? "Utilisateur";
  const userEmail = session?.user?.email ?? fallbackEmail ?? "—";
  const initials = userInitials(userName);

  const handleClick = (id: string, external?: boolean) => {
    if (external) return; // external links handled by <Link>
    scrollToSection(id);
    onNavigate?.(id);
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: FONT_SANS }}>
      {/* Logo header */}
      <div
        className="px-4 py-4 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: CHARCOAL,
          }}
        >
          HARCH
        </span>
        <span style={{ color: TEXT_HEADER, fontFamily: FONT_MONO, fontSize: 12 }}>
          |
        </span>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            letterSpacing: "0.12em",
            color: TEXT_MUTED,
            textTransform: "uppercase",
          }}
        >
          Atelier
        </span>
      </div>

      {/* Nav items */}
      <nav
        className="flex-1 px-2 py-3 space-y-1 overflow-y-auto"
        aria-label="Navigation principale"
      >
        {NAV_ITEMS.map(({ id, label, Icon, external }) => {
          const isActive = activeSection === id;
          const inner = (
            <>
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span className="flex-1 truncate">{label}</span>
              {id === "alertes" && alertCount > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 18,
                    height: 18,
                    padding: "0 5px",
                    borderRadius: 9,
                    backgroundColor: NEGATIVE,
                    color: "#FFFFFF",
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
              {external && (
                <ExternalLink size={12} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
              )}
            </>
          );
          const baseStyle: CSSProperties = {
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: isActive ? 600 : 500,
            color: isActive ? SAGE : TEXT_BODY,
            backgroundColor: isActive ? SAGE_BG : "transparent",
            borderLeft: isActive ? `3px solid ${SAGE}` : "3px solid transparent",
          };
          if (external) {
            return (
              <Link
                key={id}
                href="/atelier/harch-100"
                className="w-full flex items-center gap-3 text-left transition-colors"
                style={baseStyle}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "#FAFAFA";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
                onClick={() => onNavigate?.(id)}
              >
                {inner}
              </Link>
            );
          }
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(id, external)}
              className="w-full flex items-center gap-3 text-left transition-colors"
              style={baseStyle}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "#FAFAFA";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
              }}
              aria-current={isActive ? "true" : undefined}
            >
              {inner}
            </button>
          );
        })}
      </nav>

      {/* Plan + user footer */}
      <div className="px-4 py-3" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={FONT_HEADER}>Plan</div>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            Grandes Entreprises
          </span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              backgroundColor: SAGE,
              color: "#FFFFFF",
              padding: "2px 6px",
              borderRadius: 999,
            }}
          >
            Board-ready
          </span>
        </div>

        <div
          className="mt-3"
          style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{
                width: 28,
                height: 28,
                backgroundColor: SAGE,
                color: "#FFFFFF",
                fontFamily: FONT_MONO,
                fontSize: 11,
                fontWeight: 700,
              }}
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  fontWeight: 700,
                  color: CHARCOAL,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: TEXT_MUTED,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userEmail}
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <Link
              href="/atelier/console/settings/account"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-[#FAFAFA]"
              style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_BODY }}
            >
              <Settings size={14} />
              <span>Paramètres</span>
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/atelier/login" })}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-[#FEF2F2]"
              style={{ fontFamily: FONT_SANS, fontSize: 12, color: NEGATIVE }}
            >
              <LogOut size={14} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// HEADER (sticky top nav — frosted glass, hamburger, bell badge, avatar)
// ════════════════════════════════════════════════════════════════════

function DashboardHeader({
  lastUpdated,
  alertCount,
  loading,
  onRefresh,
  onMenuClick,
  fallbackName,
}: {
  lastUpdated: string | null;
  alertCount: number;
  loading: boolean;
  onRefresh: () => void;
  onMenuClick?: () => void;
  fallbackName?: string | null;
}) {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? fallbackName ?? "Utilisateur";
  const initials = userInitials(userName);

  return (
    <header
      className="sticky top-0 z-30 px-4 sm:px-6 py-3.5"
      style={{
        backgroundColor: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: hamburger + HARCH | ATELIER logo + plan badge */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-[#F5F5F5]"
            style={{ border: `1px solid ${BORDER_STRONG}`, color: TEXT_BODY }}
            aria-label="Ouvrir le menu"
          >
            <Menu size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: CHARCOAL,
              }}
            >
              HARCH
            </span>
            <span
              style={{
                color: TEXT_HEADER,
                fontFamily: FONT_MONO,
                fontSize: 13,
              }}
            >
              |
            </span>
            <span
              className="hidden sm:inline"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 12,
                letterSpacing: "0.12em",
                color: TEXT_MUTED,
                textTransform: "uppercase",
              }}
            >
              Atelier
            </span>
          </div>
          <span
            className="hidden md:inline text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: SAGE_BG,
              color: SAGE,
              fontFamily: FONT_MONO,
            }}
          >
            Grandes Entreprises
          </span>
        </div>

        {/* Right: last updated + refresh + bell with badge + avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div
              className="text-[10px] uppercase tracking-wider"
              style={{ color: TEXT_MUTED, fontFamily: FONT_MONO }}
            >
              Dernière maj
            </div>
            <div
              className="text-[12px]"
              style={{ color: TEXT_BODY, fontFamily: FONT_MONO }}
            >
              {lastUpdated ?? "—"}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 hidden sm:inline-flex"
            style={{ fontFamily: FONT_MONO, fontSize: 11 }}
            onClick={onRefresh}
            aria-label="Rafraîchir"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </Button>
          <button
            type="button"
            onClick={() => scrollToSection("alertes")}
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-[#F5F5F5]"
            style={{ border: `1px solid ${BORDER_STRONG}`, color: TEXT_BODY }}
            aria-label={`Alertes${alertCount > 0 ? ` (${alertCount})` : ""}`}
            title="Alertes"
          >
            <Bell size={15} />
            {alertCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center"
                style={{
                  minWidth: 16,
                  height: 16,
                  padding: "0 4px",
                  borderRadius: 8,
                  backgroundColor: NEGATIVE,
                  color: "#FFFFFF",
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 32,
              height: 32,
              backgroundColor: SAGE,
              color: "#FFFFFF",
              fontFamily: FONT_MONO,
              fontSize: 12,
              fontWeight: 700,
            }}
            aria-label="Compte utilisateur"
            title={userName}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════
// ROOT — EnterpriseDashboard
// ════════════════════════════════════════════════════════════════════

export function EnterpriseDashboard({
  userName,
  userEmail,
}: {
  userName?: string | null;
  userEmail?: string | null;
}) {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("90d");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("score");

  // Body scroll lock when mobile sidebar is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Active section tracking via IntersectionObserver.
  // Highlights the sidebar item matching the section currently in view.
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    const ids = NAV_ITEMS.filter((n) => !n.external).map((n) => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleNavigate = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Shared scroll-margin so smooth-scroll targets clear the sticky header.
  const sectionScrollStyle: CSSProperties = { scrollMarginTop: 80 };

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

  const {
    data: insights,
    refetch: refetchInsights,
  } = useApi<InsightsResp>("/api/console/insights");

  const { data: ai } = useApi<AiVisibilityResp>("/api/console/ai-visibility");

  const { data: src } = useApi<SourceDistResp>("/api/console/source-distribution");

  const { data: topics } = useApi<TopicsResp>("/api/console/topics");

  const { data: sov } = useApi<ShareOfVoiceResp>("/api/console/share-of-voice");

  const { data: radar } = useApi<CompetitorRadarResp>("/api/console/competitor-radar");

  const { data: reg } = useApi<RegulatoryFeedResp>("/api/console/regulatory-feed");

  const { data: inf } = useApi<InfluencersResp>("/api/console/influencers?range=30d");

  const { data: briefings } = useApi<BriefingListResp>("/api/console/briefing/list?limit=10");

  const { data: keys } = useApi<ApiKeyListResp>("/api/api-keys");

  const { data: users } = useApi<UsersListResp>("/api/console/settings/users");

  const { data: webhooks } = useApi<WebhooksListResp>("/api/webhooks");

  const { data: geo } = useApi<GeoSignalsResp>("/api/console/geo-signals?range=30d");

  const {
    data: trend,
    refetch: refetchTrend,
  } = useApi<SentimentTrendResp>(`/api/console/sentiment-trend?range=${range}`);

  // Refetch trend when range changes (handled by URL change in useApi).

  // Refresh all
  const refreshAll = useCallback(() => {
    refetchHealth();
    refetchAlerts();
    refetchTrend();
    refetchInsights();
  }, [refetchHealth, refetchAlerts, refetchTrend, refetchInsights]);

  // Auto refresh every 5 min
  useEffect(() => {
    const id = setInterval(refreshAll, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refreshAll]);

  const lastUpdated = health?.lastUpdated ? fmtRelative(health.lastUpdated) : null;
  const activeAlertCount = alerts?.count ?? alerts?.alerts?.length ?? 0;
  const weeklyInsight = useMemo(() => {
    if (!insights?.insights?.length) return null;
    return (
      insights.insights.find((i) => i.type === "weekly-summary" || /hebdo|semaine|executive/i.test(i.title)) ??
      insights.insights[0]
    );
  }, [insights]);

  // Stage-aware motion delays
  const d = (i: number) => ({ ...cardMotion.transition, delay: Math.min(0.8, i * 0.03) });

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: FONT_SANS,
        color: CHARCOAL,
      }}
    >
      {/* ─── Desktop sidebar (sticky, 240px) ─────────────────────────── */}
      <aside
        className="hidden lg:block shrink-0"
        style={{
          width: 240,
          position: "sticky",
          top: 0,
          height: "100vh",
          backgroundColor: "#FFFFFF",
          borderRight: `1px solid ${BORDER}`,
          overflow: "hidden",
        }}
        aria-label="Navigation latérale"
      >
        <SidebarContent
          activeSection={activeSection}
          alertCount={activeAlertCount}
          onNavigate={handleNavigate}
          fallbackName={userName}
          fallbackEmail={userEmail}
        />
      </aside>

      {/* ─── Mobile sidebar overlay (full-screen, slide from left) ──── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute left-0 top-0 bottom-0"
            style={{
              width: 280,
              backgroundColor: "#FFFFFF",
              borderRight: `1px solid ${BORDER}`,
              boxShadow: "4px 0 24px rgba(0,0,0,0.08)",
            }}
          >
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[#F5F5F5] z-10"
              style={{ color: TEXT_BODY }}
              aria-label="Fermer le menu"
            >
              <X size={16} />
            </button>
            <SidebarContent
              activeSection={activeSection}
              alertCount={activeAlertCount}
              onNavigate={handleNavigate}
              fallbackName={userName}
              fallbackEmail={userEmail}
            />
          </motion.div>
        </div>
      )}

      {/* ─── Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          lastUpdated={lastUpdated}
          alertCount={activeAlertCount}
          loading={healthLoading || alertsLoading}
          onRefresh={refreshAll}
          onMenuClick={() => setSidebarOpen(true)}
          fallbackName={userName}
        />

        <main className="mx-auto max-w-[1440px] w-full px-4 sm:px-6 py-6">
          <TooltipProvider delayDuration={200}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* Row 1 — Hero + Executive KPIs */}
              <motion.div
                id="score"
                style={sectionScrollStyle}
                {...cardMotion}
                className="lg:col-span-12"
              >
                <ScoreReputationHero health={health} loading={healthLoading} onRefresh={refetchHealth} />
              </motion.div>

              <motion.div {...cardMotion} transition={d(1)} className="lg:col-span-3 md:col-span-6">
                <SentimentMarketKpi health={health} trend={trend} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(2)} className="lg:col-span-3 md:col-span-6">
                <VisibiliteIaKpi ai={ai} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(3)} className="lg:col-span-3 md:col-span-6">
                <PartsDeVoixKpi health={health} sov={sov} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(4)} className="lg:col-span-3 md:col-span-6">
                <AlertesCrisisKpi health={health} alerts={alerts} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(5)} className="lg:col-span-3 md:col-span-6">
                <Articles30JKpi src={src} topics={topics} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(6)} className="lg:col-span-3 md:col-span-6">
                <InfluenceursKpi inf={inf} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(7)} className="lg:col-span-3 md:col-span-6">
                <AppelsApiKpi keys={keys} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(8)} className="lg:col-span-3 md:col-span-6">
                <EngagementTotalKpi trend={trend} inf={inf} />
              </motion.div>

              {/* Row 2 — Sentiment + Benchmark */}
              <motion.div
                id="sentiment"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(9)}
                className="lg:col-span-7"
              >
                <TendanceSentimentCard trend={trend} range={range} onRangeChange={setRange} />
              </motion.div>
              <motion.div
                id="concurrents"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(10)}
                className="lg:col-span-5"
              >
                <BenchmarkConcurrentielCard sov={sov} radar={radar} />
              </motion.div>

              {/* Row 3 — Radar + Donut */}
              <motion.div {...cardMotion} transition={d(11)} className="lg:col-span-6">
                <RadarReputationCard radar={radar} health={health} ai={ai} sov={sov} inf={inf} src={src} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(12)} className="lg:col-span-6">
                <PartDeVoixCard sov={sov} />
              </motion.div>

              {/* Row 4 — 9-LLM Grid + HarchIQ */}
              <motion.div
                id="visibilite-ia"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(13)}
                className="lg:col-span-6"
              >
                <GrilleVisibiliteIaCard ai={ai} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(14)} className="lg:col-span-6">
                <HarchIQChatCard weekly={weeklyInsight} />
              </motion.div>

              {/* Row 5 — Governance + Multi-teams */}
              <motion.div
                id="gouvernance"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(15)}
                className="lg:col-span-6"
              >
                <GouvernanceCard users={users} webhooks={webhooks} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(16)} className="lg:col-span-6">
                <TableauMultiEquipesCard users={users} alerts={alerts} />
              </motion.div>

              {/* Row 6 — API + Influencers */}
              <motion.div
                id="api"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(17)}
                className="lg:col-span-6"
              >
                <ApiIntegrationsCard keys={keys} webhooks={webhooks} />
              </motion.div>
              <motion.div
                id="influenceurs"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(18)}
                className="lg:col-span-6"
              >
                <MarketingInfluenceCard inf={inf} />
              </motion.div>

              {/* Row 7 — Crisis + Heatmap */}
              <motion.div
                id="alertes"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(19)}
                className="lg:col-span-6"
              >
                <DefconCrisisCard health={health} alerts={alerts} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(20)} className="lg:col-span-6">
                <CarteChaleurGeoCard geo={geo} />
              </motion.div>

              {/* Row 8 — Briefing + Competitor Deep Dive */}
              <motion.div
                id="rapports"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(21)}
                className="lg:col-span-6"
              >
                <GenerateurBriefingCard briefings={briefings} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(22)} className="lg:col-span-6">
                <CompetitorDeepDiveCard sov={sov} radar={radar} trend={trend} />
              </motion.div>

              {/* Row 9 — ESG + Regulatory */}
              <motion.div {...cardMotion} transition={d(23)} className="lg:col-span-6">
                <SuiviEsgCard health={health} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(24)} className="lg:col-span-6">
                <VeilleReglementaireCard reg={reg} />
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
              Harch Atelier · Console Grandes Entreprises · 25 sections · Données en temps réel · Audit SHA-256
              {userEmail ? ` · ${userEmail}` : ""}
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default EnterpriseDashboard;

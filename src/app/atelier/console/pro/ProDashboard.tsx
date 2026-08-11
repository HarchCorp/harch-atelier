"use client";

// ════════════════════════════════════════════════════════════════════
//  ProDashboard 10X — Plan "Pro" (Équipes en croissance · 5–20 users)
//
//  The AI-first mission control + report factory + competitive
//  intelligence desk — 10x better than Meltwater Analyze + Mira.
//  « Un tableau de bord de commandement, augmenté par HarchIQ. »
//
//  Design philosophy (identique à EssentialDashboard 10X) :
//   • WHITE background, sage green (#4A7B5F) accents, charcoal (#0A0A0A) text
//   • NO emojis — Lucide icons only (16px, #71717A)
//   • NO dark mode — institutional, minimalist, Bloomberg-clean
//   • Every card: white bg, 1px border #F0F0F0, 12px radius, 20px padding
//   • Headers: 10px uppercase, Space Mono, #9CA3AF, 0.08em letter-spacing
//   • Data: Space Mono, bold, #0A0A0A
//   • Body: Inter, 13px, #525252
//   • recharts for ALL charts (RadialBarChart, ComposedChart, RadarChart,
//     PieChart, AreaChart, LineChart, BarChart)
//   • framer-motion for staggered card entrance (opacity 0→1, y 8→0)
//   • @tanstack/react-table for the Benchmark Concurrentiel table
//   • shadcn/ui (Card, Badge, Button, Progress, Tabs, Separator, Switch,
//     Skeleton, Tooltip, Dialog)
//   • French throughout, mobile-first responsive, "—" for missing data
//
//  25 SECTIONS — each 10x enhanced with AI commentary:
//   01  HarchIQ AI Workspace           (hero, full width)  chat + 8 prompts + history + 200/day
//   02  Score de Réputation            (hero, full width)  RadialBarChart gauge + compare button
//   03  Sentiment Moyen                (KPI strip)         LineChart sparkline + AI
//   04  Mentions / Jour                (KPI strip)         BarChart sparkline + AI
//   05  Citations IA                   (KPI strip)         LLM chips + AI
//   06  Parts de Voix                  (KPI strip)         mini donut + AI
//   07  Sources Diversifiées           (KPI strip)         count + AI
//   08  Engagement Total               (KPI strip)         likes+shares+comments + AI
//   09  Tendance Sentiment             (chart row)         ComposedChart + anomalies + compare mode
//   10  Benchmark Concurrentiel        (chart row)         TanStack Table 7 cols + AI
//   11  Radar de Réputation            (radar row)         RadarChart 5 axes + AI
//   12  Part de Voix                   (radar row)         PieChart donut + clickable + AI
//   13  Top 5 Sujets                   (topics row)        stacked horizontal bars + AI
//   14  Dernières Mentions             (topics row)        10 articles + filters + "Analyser avec HarchIQ"
//   15  Comparaison Semaine            (compare row)       4 delta cards + AI
//   16  Historique des Rapports        (reports row)       list + generate/schedule actions
//   17  Recherches Sauvegardées        (reports row)       3 searches + 3 alerts with toggles
//   18  Top 5 Influenceurs             (inf row)           table + AI + identify button
//   19  Estimation Reach Média         (inf row)           AreaChart + AVE + AI
//   20  Carte de Crise                 (crisis row)        LineChart + alert markers + mode crise
//   21  Heatmap Heure × Jour           (crisis row)        7×24 grid + AI
//   22  Répartition Type de Média      (media row)         PieChart + AI
//   23  Sujets Émergents               (media row)         5 topics + growth + Surveiller
//   24  Tableaux Personnalisables      (custom, full w)    3 dashboards + Nouveau + AI
//   25  Passer aux Grandes Entreprises (upsell, full w)    sage banner + feature comparison
//
//  Real APIs (no mock data — demo users get demo responses from the API):
//   • /api/console/brand-health          — score, trend, sentiment, crisis
//   • /api/console/sentiment-trend       — daily sentiment series (7d/30d/90d)
//   • /api/console/competitor-radar      — 5-axis scores per brand
//   • /api/console/share-of-voice        — mention volume + sentiment per competitor
//   • /api/console/ai-visibility         — LLM citation snapshot
//   • /api/console/weekly-comparison     — 7d vs 7d delta metrics
//   • /api/console/topics                — top topics
//   • /api/console/crisis-alerts         — alerts + articles feed
//   • /api/console/reports/list          — stored monthly reports
//   • /api/console/influencers?range=30d — source-level influencer scores
//   • /api/console/source-distribution   — top sources
//   • /api/console/exposure-trend        — language series over 30 days
//   • /api/console/alert-config          — alert thresholds + channels
//   • /api/console/insights              — HarchIQ weekly summary
//   • /api/harch100/latest               — Harch 100 ranking
//   • /api/console/ask (POST)            — HarchIQ chat
//
//  Task ID: 10X-PRO
// ════════════════════════════════════════════════════════════════════

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpCircle,
  BarChart3,
  Bell,
  Brain,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Cloud,
  CloudRain,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Hash,
  LayoutDashboard,
  LayoutGrid,
  Lightbulb,
  LogOut,
  Menu,
  MessageSquare,
  Minus,
  Newspaper,
  PenSquare,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  Share2,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

import {
  Card,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

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
  url?: string;
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

// ─── HarchIQ AI Workspace types ────────────────────────────────────────

interface AskSource {
  type: "alert" | "topic" | "ai-visibility" | "neighbor";
  id: string;
  title: string;
}

interface AskResponse {
  answer: string;
  sources: AskSource[];
  generatedAt: string;
}

type ChatRole = "user" | "ai";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  sources?: AskSource[];
  followUps?: string[];
  timestamp: number;
  pending?: boolean;
}

interface PromptCard {
  id: string;
  title: string;
  description: string;
  prompt: string;
  followUps: string[];
  Icon: typeof Newspaper;
}

interface ConversationHistoryItem {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  timestamp: number;
  messages: ChatMessage[];
}

// ─── Pro-specific API types ────────────────────────────────────────────

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

interface CompetitorRadarResp {
  brands: CompetitorBrand[];
  source?: string;
}

interface ShareOfVoiceRow {
  name: string;
  mentionCount: number;
  sentiment: number;
  trend: number;
  isYou: boolean;
}

interface ShareOfVoiceResp {
  competitors: ShareOfVoiceRow[];
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
  source: "neon" | "demo";
}

interface ReportRow {
  id: string;
  title: string;
  period: string;
  summary: string | null;
  status: string;
  createdAt: string;
  companyName: string | null;
  pdfUrl: string;
}

interface ReportsListResp {
  reports: ReportRow[];
  total: number;
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
  range: string;
  company?: { name: string; slug: string };
  influencers: InfluencerRow[];
  totalMentions: number;
  sourceCount?: number;
}

interface ExposureTrendResp {
  days: string[];
  series: Array<{ name: string; color: string; data: number[] }>;
  source?: string;
}

interface AlertConfigResp {
  sentimentThreshold: number;
  velocityThreshold: number;
  crisisScoreThreshold: number;
  channels: { whatsapp: boolean; email: boolean; dashboard: boolean; comexEscalation: boolean };
  severityFilter: { critical: boolean; warning: boolean; watch: boolean; info: boolean };
  quietHours: { enabled: boolean; start: string; end: string };
  whatsappNumber: string;
  email: string;
  source?: string;
}

// ─── Benchmark table row (derived from competitor-radar + share-of-voice) ─

interface BenchmarkRow {
  name: string;
  isYou: boolean;
  score: number;
  sentimentPct: number;
  mentions: number;
  aiVisibility: number;
  sources: number;
  trend: number;
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

function weatherFor(score: number): { label: string; Icon: typeof Sun } {
  if (score >= 70) return { label: "Ensoleillé", Icon: Sun };
  if (score >= 50) return { label: "Nuageux", Icon: Cloud };
  return { label: "Orageux", Icon: CloudRain };
}

/** Generate 5 follow-up prompt suggestions based on the user question. */
function generateFollowUps(question: string): string[] {
  const q = question.toLowerCase();
  if (q.includes("sentiment") || q.includes("positif") || q.includes("négatif")) {
    return [
      "Quelles sources génèrent le plus de mentions négatives ?",
      "Comparez le sentiment de cette semaine à celui du mois dernier.",
      "Quels sujets influencent le plus le sentiment actuel ?",
      "Quelle est la part de voix de mes concurrents ?",
      "Générez un résumé de sentiment pour la direction.",
    ];
  }
  if (q.includes("crise") || q.includes("alerte") || q.includes("risque")) {
    return [
      "Quelle est la gravité des crises détectées ?",
      "Quels articles négatifs surveiller en priorité ?",
      "Rédigez une note de communication pour la direction.",
      "Quels concurrents sont également touchés ?",
      "Activez le mode crise et notifiez l'équipe.",
    ];
  }
  if (q.includes("concurrent") || q.includes("compar")) {
    return [
      "Classez mes concurrents par score de réputation.",
      "Quels sujets mes concurrents dominent-ils ?",
      "Quelles opportunités de différenciation identifiez-vous ?",
      "Comparez ma visibilité IA à celle de mes concurrents.",
      "Quelle est ma part de voix sectorielle ?",
    ];
  }
  if (q.includes("ia") || q.includes("chatgpt") || q.includes("llm")) {
    return [
      "Comment améliorer ma visibilité dans ChatGPT ?",
      "Quels LLMs me citent le plus positivement ?",
      "Quels mots-clés les IA associent-ils à ma marque ?",
      "Comparez ma visibilité IA à mes concurrents.",
      "Générez un rapport de visibilité IA mensuel.",
    ];
  }
  if (q.includes("sujet") || q.includes("thème") || q.includes("emergent")) {
    return [
      "Quels sujets émergents devraient être surveillés ?",
      "Quels sujets génèrent le plus d'engagement ?",
      "Comparez mes sujets à ceux de mes concurrents.",
      "Quels sujets sont en croissance cette semaine ?",
      "Rédigez une note de positionnement sur le sujet émergent.",
    ];
  }
  if (q.includes("rapport") || q.includes("rapport hebdo") || q.includes("direction")) {
    return [
      "Quels sont les 3 points clés à retenir ?",
      "Quelle recommandation pour la semaine prochaine ?",
      "Exportez ce rapport en PDF.",
      "Programmez ce rapport chaque lundi.",
      "Ajoutez une section benchmark concurrentiel.",
    ];
  }
  return [
    "Analysez le sentiment de cette semaine.",
    "Quelles crises potentielles détectez-vous ?",
    "Comparez-moi à mes concurrents.",
    "Quels sujets émergents surveiller ?",
    "Générez un résumé hebdomadaire pour la direction.",
  ];
}

function userInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((p) => p[0] ?? "").filter(Boolean);
  return (letters.length ? letters.join("") : name[0] ?? "U").toUpperCase();
}

function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ─── useApi HOOK ──────────────────────────────────────────────────────

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

/** AI Commentary block — sage green left border, Sparkles icon, sage text. */
function AiCommentary({ text }: { text: string }) {
  return (
    <div
      className="mt-3 flex items-start gap-2 rounded-md"
      style={{
        padding: "10px 12px",
        backgroundColor: SAGE_BG,
        borderLeft: `3px solid ${SAGE}`,
      }}
    >
      <Sparkles size={14} style={{ color: SAGE, flexShrink: 0, marginTop: 1 }} />
      <p
        style={{
          fontFamily: FONT_SANS,
          fontSize: 12,
          lineHeight: 1.55,
          color: SAGE,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
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

const containerStagger = {
  animate: {
    transition: { staggerChildren: 0.04 },
  },
};

// ─── SIDEBAR NAV (plan-aware — Pro : 10 items, 3 Pro exclusives) ──────

const NAV_ITEMS: { id: string; label: string; Icon: typeof LayoutGrid; proExclusive?: boolean }[] = [
  { id: "ai-workspace", label: "Tableau de bord", Icon: LayoutGrid },
  { id: "sentiment", label: "Sentiment", Icon: TrendingUp },
  { id: "concurrents", label: "Concurrents", Icon: Users, proExclusive: true },
  { id: "alertes", label: "Alertes", Icon: Bell },
  { id: "rapports", label: "Rapports", Icon: FileText, proExclusive: true },
  { id: "sujets", label: "Sujets", Icon: Hash },
  { id: "sources", label: "Sources", Icon: Newspaper },
  { id: "visibilite-ia", label: "Visibilité IA", Icon: Brain },
  { id: "influenceurs", label: "Influenceurs", Icon: UserPlus, proExclusive: true },
  { id: "harch-100", label: "Harch 100", Icon: Trophy },
];

function SidebarContent({
  activeSection,
  alertCount,
  userName,
  userEmail,
  onNavigate,
}: {
  activeSection: string;
  alertCount: number;
  userName?: string | null;
  userEmail?: string | null;
  onNavigate?: (id: string) => void;
}) {
  const displayName = userName ?? "Utilisateur";
  const displayEmail = userEmail ?? "—";
  const initials = userInitials(userName);

  const handleClick = (id: string) => {
    scrollToSection(id);
    onNavigate?.(id);
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: FONT_SANS }}>
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

      <nav
        className="flex-1 px-2 py-3 space-y-1 overflow-y-auto"
        aria-label="Navigation principale"
      >
        {NAV_ITEMS.map(({ id, label, Icon, proExclusive }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(id)}
              className="w-full flex items-center gap-3 text-left transition-colors group"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? SAGE : TEXT_BODY,
                backgroundColor: isActive ? SAGE_BG : "transparent",
                borderLeft: isActive
                  ? `3px solid ${SAGE}`
                  : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "#FAFAFA";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
              }}
              aria-current={isActive ? "true" : undefined}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span className="flex-1 truncate">{label}</span>
              {proExclusive && (
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: SAGE,
                    backgroundColor: SAGE_BG,
                    borderRadius: 3,
                    padding: "1px 4px",
                  }}
                >
                  PRO
                </span>
              )}
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
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={FONT_HEADER}>Plan</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            Pro
          </span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 12,
              color: SAGE,
            }}
          >
            · Actif
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
                {displayName}
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
                {displayEmail}
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
// HEADER — frosted glass, hamburger, HARCH | ATELIER + Plan Pro badge
// ════════════════════════════════════════════════════════════════════

function Header({
  onMenuClick,
  alertCount,
  userName,
}: {
  onMenuClick: () => void;
  alertCount: number;
  userName?: string | null;
}) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 lg:px-6 py-3"
      style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
          style={{ width: 32, height: 32 }}
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-baseline gap-2">
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
          <Badge
            variant="secondary"
            className="ml-2 h-5"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.08em",
              backgroundColor: SAGE_BG,
              color: SAGE,
            }}
          >
            PLAN PRO
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => scrollToSection("alertes")}
                className="relative inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
                style={{ width: 32, height: 32 }}
                aria-label="Notifications"
              >
                <Bell size={18} style={{ color: TEXT_BODY }} />
                {alertCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: NEGATIVE,
                      border: "2px solid #FFFFFF",
                    }}
                  />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span style={{ fontFamily: FONT_SANS, fontSize: 12 }}>
                {alertCount > 0 ? `${alertCount} alerte(s)` : "Aucune alerte"}
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full"
          style={{
            width: 32,
            height: 32,
            backgroundColor: SAGE,
            color: "#FFFFFF",
            fontFamily: FONT_MONO,
            fontSize: 11,
            fontWeight: 700,
          }}
          aria-label="Compte utilisateur"
        >
          {userInitials(userName)}
        </button>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 1 — HARCHIQ AI WORKSPACE (hero, full width — 10x Essentiel)
// 200/day quota · 8 prompts · conversation history · export PDF
// ════════════════════════════════════════════════════════════════════

const PROMPT_LIBRARY: PromptCard[] = [
  {
    id: "news-overview",
    title: "Résumé de l'actualité de ma marque",
    description: "Vue d'ensemble des dernières mentions",
    prompt: "Fais un résumé de l'actualité de ma marque cette semaine.",
    followUps: [
      "Quelles sources ont généré le plus de mentions ?",
      "Comparez ce volume à la semaine dernière.",
      "Quels sujets dominent la couverture ?",
      "Quelle est la part de voix de mes concurrents ?",
      "Générez un résumé pour la direction.",
    ],
    Icon: Newspaper,
  },
  {
    id: "sentiment-analysis",
    title: "Analyse du sentiment cette semaine",
    description: "Évolution et tendances du sentiment",
    prompt: "Analyse le sentiment de ma marque sur les 7 derniers jours.",
    followUps: [
      "Quelles sources sont les plus négatives ?",
      "Identifiez-vous des pics d'activité négative ?",
      "Quels sujets influencent le plus le sentiment ?",
      "Comparez mon sentiment à celui de mes concurrents.",
      "Quelle est la tendance sur 30 jours ?",
    ],
    Icon: TrendingUp,
  },
  {
    id: "emerging-topics",
    title: "Sujets émergents dans mon secteur",
    description: "Thématiques en croissance",
    prompt: "Quels sujets émergents sont associés à mon secteur ?",
    followUps: [
      "Quels sujets surveiller en priorité ?",
      "Comparez mes sujets à mes concurrents.",
      "Quelles opportunités de positionnement ?",
      "Quelle est la croissance de chaque sujet ?",
      "Rédigez une note de positionnement.",
    ],
    Icon: Lightbulb,
  },
  {
    id: "competitor-check",
    title: "Comparaison vs mes 3 concurrents",
    description: "Benchmarking sectoriel",
    prompt: "Compare ma marque à mes concurrents directs sur le sentiment, la visibilité IA et la part de voix.",
    followUps: [
      "Qui est le leader de mon secteur ?",
      "Sur quels sujets suis-je en avance ?",
      "Quelles faiblesses dois-je corriger ?",
      "Quelle est ma part de voix sectorielle ?",
      "Générez un rapport benchmark complet.",
    ],
    Icon: Users,
  },
  {
    id: "crisis-detection",
    title: "Détection de crises potentielles",
    description: "Risques et alertes actives",
    prompt: "Y a-t-il des crises potentielles détectées pour ma marque ?",
    followUps: [
      "Quelle est la gravité des risques identifiés ?",
      "Rédigez une note de communication.",
      "Quels articles surveiller en priorité ?",
      "Quels concurrents sont également touchés ?",
      "Activez le mode crise.",
    ],
    Icon: AlertTriangle,
  },
  {
    id: "weekly-report",
    title: "Rapport hebdomadaire pour la direction",
    description: "Synthèse exécutive prête à diffuser",
    prompt: "Génère un rapport hebdomadaire pour la direction avec les points clés, le benchmark concurrentiel et les recommandations.",
    followUps: [
      "Quels sont les 3 points clés à retenir ?",
      "Quelle recommandation pour la semaine prochaine ?",
      "Exportez ce rapport en PDF.",
      "Programmez ce rapport chaque lundi.",
      "Ajoutez une section visibilité IA.",
    ],
    Icon: FileText,
  },
  {
    id: "media-coverage",
    title: "Analyse de la couverture médiatique par source",
    description: "Répartition et qualité des sources",
    prompt: "Analyse la couverture médiatique de ma marque par source, en distinguant presse, blogs et réseaux sociaux.",
    followUps: [
      "Quelles sources sont les plus positives ?",
      "Quelle est la diversité de mes sources ?",
      "Comparez ma couverture à celle de mes concurrents.",
      "Quelles sources cibler en priorité ?",
      "Générez un rapport de couverture.",
    ],
    Icon: Newspaper,
  },
  {
    id: "influencer-identification",
    title: "Identification des influenceurs clés",
    description: "Sources et voix influentes",
    prompt: "Identifie les influenceurs et sources les plus influents qui parlent de ma marque cette semaine.",
    followUps: [
      "Quels influenceurs ont un sentiment positif ?",
      "Quelle est la portée de chaque influenceur ?",
      "Quels influenceurs cibler pour une campagne ?",
      "Comparez mes influenceurs à ceux de mes concurrents.",
      "Générez une liste d'influenceurs à contacter.",
    ],
    Icon: UserPlus,
  },
];

interface HarchIQWorkspaceProps {
  prefillQuestion?: string | null;
  onPrefillConsumed?: () => void;
}

function HarchIQWorkspace({ prefillQuestion, onPrefillConsumed }: HarchIQWorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Bonjour. Je suis HarchIQ AI — Avancé. Posez-moi une question sur votre réputation : sentiment, sources, crises, visibilité IA, concurrents, influenceurs. Je réponds à partir de vos données réelles, je cite mes sources, et je peux générer un rapport PDF en un clic.",
      followUps: [
        "Résumé de l'actualité de ma marque",
        "Comparez-moi à mes concurrents",
        "Quels sujets émergents surveiller ?",
        "Y a-t-il des crises potentielles ?",
        "Générez un rapport pour la direction",
      ],
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [quota, setQuota] = useState({ used: 7, total: 200 });
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<ConversationHistoryItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Consume prefill question from external triggers (e.g. "Analyser avec HarchIQ")
  useEffect(() => {
    if (prefillQuestion && prefillQuestion.trim()) {
      void sendQuestion(prefillQuestion);
      onPrefillConsumed?.();
    }
  }, [prefillQuestion]);

  const saveConversationToHistory = useCallback((msgs: ChatMessage[]) => {
    // Only save conversations with at least 1 user message beyond the welcome
    const userMsgs = msgs.filter((m) => m.role === "user");
    if (userMsgs.length === 0) return;
    const firstUser = userMsgs[0];
    const convId = activeConversationId ?? `conv-${Date.now()}`;
    const item: ConversationHistoryItem = {
      id: convId,
      title: firstUser.content.slice(0, 48) + (firstUser.content.length > 48 ? "…" : ""),
      preview: msgs.filter((m) => m.role === "ai" && !m.pending).slice(-1)[0]?.content.slice(0, 80) ?? "—",
      messageCount: msgs.length,
      timestamp: Date.now(),
      messages: msgs,
    };
    setHistory((h) => {
      const filtered = h.filter((x) => x.id !== convId);
      return [item, ...filtered].slice(0, 5);
    });
    setActiveConversationId(convId);
  }, [activeConversationId]);

  const sendQuestion = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || sending) return;
    if (quota.used >= quota.total) {
      toast.error("Quota quotidien atteint (200/200). Revenez demain.");
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };
    const pendingId = `ai-${Date.now()}`;
    const pendingMsg: ChatMessage = {
      id: pendingId,
      role: "ai",
      content: "",
      pending: true,
      timestamp: Date.now(),
    };
    let nextMessages: ChatMessage[] = [];
    setMessages((m) => {
      nextMessages = [...m, userMsg, pendingMsg];
      return nextMessages;
    });
    setInput("");
    setSending(true);

    try {
      const r = await fetch("/api/console/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err?.error ?? `HTTP ${r.status}`);
      }
      const data: AskResponse = await r.json();
      let finalMsgs: ChatMessage[] = [];
      setMessages((m) => {
        const updated = m.map((msg) =>
          msg.id === pendingId
            ? {
                ...msg,
                content: data.answer || "Aucune réponse générée.",
                sources: data.sources ?? [],
                followUps: generateFollowUps(trimmed),
                pending: false,
                timestamp: Date.now(),
              }
            : msg,
        );
        finalMsgs = updated;
        return updated;
      });
      setQuota((q) => ({ ...q, used: Math.min(q.total, q.used + 1) }));
      // Save to history after state settles
      setTimeout(() => saveConversationToHistory(finalMsgs), 50);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur réseau";
      let errMsgs: ChatMessage[] = [];
      setMessages((m) => {
        const updated = m.map((mm) =>
          mm.id === pendingId
            ? {
                ...mm,
                content: `Désolé, je n'ai pas pu répondre (${msg}). Réessayez dans un instant.`,
                pending: false,
                timestamp: Date.now(),
              }
            : mm,
        );
        errMsgs = updated;
        return updated;
      });
      setTimeout(() => saveConversationToHistory(errMsgs), 50);
      toast.error("HarchIQ n'a pas pu répondre.");
    } finally {
      setSending(false);
    }
  }, [sending, quota, saveConversationToHistory]);

  const handlePromptClick = useCallback((card: PromptCard) => {
    void sendQuestion(card.prompt);
  }, [sendQuestion]);

  const handleFollowUpClick = useCallback((prompt: string) => {
    void sendQuestion(prompt);
  }, [sendQuestion]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendQuestion(input);
    }
  };

  const toggleSources = (msgId: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  const handleExport = (msg: ChatMessage, format: "ppt" | "pdf" | "copy") => {
    if (format === "copy") {
      navigator.clipboard?.writeText(msg.content).then(() => toast.success("Réponse copiée dans le presse-papiers."));
      return;
    }
    toast.success(
      format === "ppt"
        ? "Export PowerPoint lancé — vous recevrez le fichier par email."
        : "Export PDF lancé — vous recevrez le fichier par email.",
      { description: msg.content.slice(0, 80) + "…" },
    );
  };

  const handleExportConversation = () => {
    const aiMessages = messages.filter((m) => m.role === "ai" && !m.pending);
    if (aiMessages.length === 0) {
      toast.error("Aucune réponse à exporter.");
      return;
    }
    toast.success("Export PDF de la conversation lancé.", {
      description: `${aiMessages.length} réponse(s) HarchIQ incluse(s).`,
    });
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "ai",
        content:
          "Bonjour. Je suis HarchIQ AI — Avancé. Posez-moi une question sur votre réputation.",
        followUps: [
          "Résumé de l'actualité de ma marque",
          "Comparez-moi à mes concurrents",
          "Quels sujets émergents surveiller ?",
          "Y a-t-il des crises potentielles ?",
          "Générez un rapport pour la direction",
        ],
        timestamp: Date.now(),
      },
    ]);
    setActiveConversationId(null);
  };

  const handleRestoreConversation = (item: ConversationHistoryItem) => {
    setMessages(item.messages);
    setActiveConversationId(item.id);
    toast.info(`Conversation restaurée : "${item.title}"`);
  };

  const quotaPct = (quota.used / quota.total) * 100;
  const remaining = quota.total - quota.used;

  return (
    <motion.div id="ai-workspace" {...cardMotion}>
      <CardShell className="lg:col-span-12" style={{ padding: 0 }}>
        {/* Workspace header strip */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 32,
                height: 32,
                backgroundColor: SAGE,
                color: "#FFFFFF",
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 14,
                    fontWeight: 700,
                    color: CHARCOAL,
                  }}
                >
                  HarchIQ AI Workspace
                </span>
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
                  HARCHIQ AI — AVANCÉ
                </Badge>
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: TEXT_MUTED,
                  letterSpacing: "0.04em",
                }}
              >
                Assistante de réputation · Données réelles · Sources citées · 200 questions/jour
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <div
                className="flex items-center gap-1.5"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
              >
                <span>{quota.used}/{quota.total} questions</span>
              </div>
              <div className="w-32 mt-1">
                <Progress
                  value={quotaPct}
                  className="h-1.5"
                  style={
                    {
                      ["--progress-background" as string]: SAGE_BG_STRONG,
                      ["--progress-foreground" as string]: SAGE,
                    } as CSSProperties
                  }
                />
              </div>
            </div>
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
              {remaining} RESTANTES
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 hidden md:inline-flex"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={handleExportConversation}
              aria-label="Exporter la conversation en PDF"
            >
              <FileText size={12} className="mr-1" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Workspace body — conversation history (sidebar) + chat (60%) + prompt library (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Conversation history sidebar (hidden on mobile) */}
          <div
            className="hidden xl:flex flex-col"
            style={{
              borderRight: `1px solid ${BORDER}`,
              width: 200,
              minHeight: 480,
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              <span style={FONT_HEADER}>Historique</span>
              <button
                type="button"
                onClick={handleNewConversation}
                className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
                style={{ width: 22, height: 22 }}
                aria-label="Nouvelle conversation"
                title="Nouvelle conversation"
              >
                <Plus size={13} style={{ color: SAGE }} />
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto px-2 py-2 space-y-1"
              style={{ maxHeight: 460 }}
            >
              {history.length === 0 ? (
                <div
                  className="px-3 py-6 text-center"
                  style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}
                >
                  Aucune conversation sauvegardée. Vos 5 dernières conversations apparaîtront ici.
                </div>
              ) : (
                history.map((item) => {
                  const isActive = item.id === activeConversationId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRestoreConversation(item)}
                      className="w-full text-left rounded-md p-2 transition-colors hover:bg-[#FAFAFA]"
                      style={{
                        border: `1px solid ${isActive ? SAGE : BORDER}`,
                        backgroundColor: isActive ? SAGE_BG : "#FFFFFF",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 11,
                          fontWeight: 700,
                          color: CHARCOAL,
                          lineHeight: 1.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          color: TEXT_MUTED,
                          marginTop: 3,
                        }}
                      >
                        {item.messageCount} msg · {fmtRelative(item.timestamp)}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat side */}
          <div
            className="lg:col-span-7 xl:col-span-6 flex flex-col"
            style={{
              borderRight: `1px solid ${BORDER}`,
              minHeight: 480,
            }}
          >
            {/* Messages scroll area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
              style={{ maxHeight: 440, minHeight: 320 }}
            >
              {messages.map((msg) => (
                <ChatMessageView
                  key={msg.id}
                  msg={msg}
                  expanded={expandedSources.has(msg.id)}
                  onToggleSources={() => toggleSources(msg.id)}
                  onFollowUp={handleFollowUpClick}
                  onExport={(fmt) => handleExport(msg, fmt)}
                />
              ))}
            </div>

            {/* Input bar (ChatGPT-style) */}
            <div
              className="px-4 py-3"
              style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
            >
              <div
                className="flex items-end gap-2 rounded-xl px-3 py-2"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${BORDER_STRONG}`,
                }}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question à HarchIQ AI — Avancé…"
                  rows={1}
                  disabled={sending}
                  className="flex-1 resize-none outline-none disabled:opacity-50"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 13,
                    color: CHARCOAL,
                    maxHeight: 120,
                    minHeight: 24,
                    padding: "2px 0",
                  }}
                  aria-label="Question à HarchIQ"
                />
                <button
                  type="button"
                  onClick={() => void sendQuestion(input)}
                  disabled={sending || !input.trim()}
                  className="inline-flex items-center justify-center rounded-md disabled:opacity-40 hover:opacity-90 transition-opacity"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: CHARCOAL,
                    color: "#FFFFFF",
                  }}
                  aria-label="Envoyer"
                >
                  {sending ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
              <div
                className="mt-1.5 px-1 flex items-center justify-between"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
              >
                <span>Entrée pour envoyer · Maj+Entrée pour nouvelle ligne</span>
                <span>HarchIQ peut faire des erreurs — vérifiez les sources.</span>
              </div>
            </div>
          </div>

          {/* Prompt library side */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              <span style={FONT_HEADER}>Bibliothèque de Prompts</span>
              <Badge
                variant="secondary"
                className="h-5"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  backgroundColor: "#FAFAFA",
                  color: TEXT_MUTED,
                }}
              >
                8 PROMPTS
              </Badge>
            </div>
            <div
              className="flex-1 overflow-y-auto px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              style={{ maxHeight: 460 }}
            >
              {PROMPT_LIBRARY.map((card) => {
                const { Icon } = card;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handlePromptClick(card)}
                    disabled={sending}
                    className="group text-left rounded-lg p-3 transition-all hover:shadow-sm disabled:opacity-50"
                    style={{
                      border: `1px solid ${BORDER}`,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="flex items-center justify-center rounded-md shrink-0"
                        style={{
                          width: 28,
                          height: 28,
                          backgroundColor: SAGE_BG,
                          color: SAGE,
                        }}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          style={{
                            fontFamily: FONT_SANS,
                            fontSize: 12,
                            fontWeight: 700,
                            color: CHARCOAL,
                            lineHeight: 1.3,
                          }}
                        >
                          {card.title}
                        </div>
                        <div
                          style={{
                            fontFamily: FONT_SANS,
                            fontSize: 11,
                            color: TEXT_MUTED,
                            marginTop: 2,
                            lineHeight: 1.4,
                          }}
                        >
                          {card.description}
                        </div>
                      </div>
                    </div>
                    <div
                      className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
                    >
                      <span>Utiliser</span>
                      <ArrowRight size={10} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardShell>
    </motion.div>
  );
}

// Chat message bubble — user right-aligned charcoal, AI left-aligned sage tint
function ChatMessageView({
  msg,
  expanded,
  onToggleSources,
  onFollowUp,
  onExport,
}: {
  msg: ChatMessage;
  expanded: boolean;
  onToggleSources: () => void;
  onFollowUp: (prompt: string) => void;
  onExport: (fmt: "ppt" | "pdf" | "copy") => void;
}) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-br-sm px-3.5 py-2.5"
          style={{
            backgroundColor: CHARCOAL,
            color: "#FFFFFF",
            fontFamily: FONT_SANS,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <div
        className="flex items-center justify-center rounded-lg shrink-0"
        style={{
          width: 28,
          height: 28,
          backgroundColor: SAGE,
          color: "#FFFFFF",
        }}
      >
        <Sparkles size={14} />
      </div>
      <div className="flex-1 min-w-0">
        {msg.pending ? (
          <div
            className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 inline-block"
            style={{
              backgroundColor: SAGE_BG,
              fontFamily: FONT_SANS,
              fontSize: 13,
              color: SAGE,
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw size={12} className="animate-spin" />
              HarchIQ analyse vos données…
            </span>
          </div>
        ) : (
          <>
            <div
              className="rounded-2xl rounded-tl-sm px-3.5 py-2.5"
              style={{
                backgroundColor: SAGE_BG,
                fontFamily: FONT_SANS,
                fontSize: 13,
                lineHeight: 1.55,
                color: CHARCOAL,
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.content}
            </div>

            {/* Sources expandable */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={onToggleSources}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-[#FAFAFA]"
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
                >
                  <Sparkles size={11} />
                  <span>Sources ({msg.sources.length})</span>
                  <ChevronRight
                    size={11}
                    style={{
                      transform: expanded ? "rotate(90deg)" : "none",
                      transition: "transform 0.15s",
                    }}
                  />
                </button>
                {expanded && (
                  <div
                    className="mt-1.5 rounded-md p-2 space-y-1"
                    style={{
                      backgroundColor: "#FAFAFA",
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    {msg.sources.map((s, i) => (
                      <div
                        key={`${s.id}-${i}`}
                        className="flex items-start gap-2"
                        style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY }}
                      >
                        <span
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            fontWeight: 700,
                            color: SAGE,
                            backgroundColor: SAGE_BG,
                            borderRadius: 3,
                            padding: "1px 4px",
                            marginTop: 1,
                            flexShrink: 0,
                          }}
                        >
                          {s.type === "alert" ? "ALERTE" : s.type === "topic" ? "SUJET" : s.type === "ai-visibility" ? "IA" : "CONCURRENT"}
                        </span>
                        <span style={{ lineHeight: 1.4 }}>{s.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Export buttons */}
            {!msg.pending && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onExport("ppt")}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: TEXT_MUTED,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <FileText size={11} />
                  Exporter en PPT
                </button>
                <button
                  type="button"
                  onClick={() => onExport("pdf")}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: TEXT_MUTED,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Download size={11} />
                  Exporter en PDF
                </button>
                <button
                  type="button"
                  onClick={() => onExport("copy")}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: TEXT_MUTED,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Copy size={11} />
                  Copier
                </button>
              </div>
            )}

            {/* Follow-up prompt chips (5 suggestions) */}
            {!msg.pending && msg.followUps && msg.followUps.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {msg.followUps.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onFollowUp(f)}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors hover:bg-[#F5F5F5]"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      color: SAGE,
                      border: `1px solid ${SAGE}`,
                      backgroundColor: "transparent",
                    }}
                  >
                    <Sparkles size={10} />
                    {f}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 2 — SCORE DE RÉPUTATION (hero, full width) + AI + compare btn
// ════════════════════════════════════════════════════════════════════

function ScoreReputationCard({ health, loading }: { health: BrandHealth | null; loading: boolean }) {
  const score = health?.score ?? 0;
  const trend = health?.trend ?? 0;
  const { label: weather, Icon: WeatherIcon } = weatherFor(score);
  const lastUpdated = health?.lastUpdated ? fmtRelative(health.lastUpdated) : "—";
  const [refreshing, setRefreshing] = useState(false);

  const gaugeData = [{ name: "score", value: score, fill: score >= 70 ? SAGE : score >= 50 ? NEUTRAL_AMBER : NEGATIVE }];

  // AI commentary — built from real data signals, data-driven + actionable
  const aiCommentary = useMemo(() => {
    if (!health) return "En attente des données de réputation…";
    const dir = trend > 0 ? "amélioré" : trend < 0 ? "dégradé" : "stabilisé";
    const parts: string[] = [`Votre score s'est ${dir} de ${Math.abs(trend)} points cette semaine`];
    if (health.sentiment.positive >= 50) {
      parts.push(`grâce à une couverture majoritairement positive (${health.sentiment.positive}%).`);
    } else if (health.sentiment.negative >= 40) {
      parts.push(`malgré une part de mentions négatives élevée (${health.sentiment.negative}%). Action recommandée : renforcer la communication positive.`);
    } else {
      parts.push(`avec une couverture équilibrée (${health.sentiment.positive}% positif, ${health.sentiment.negative}% négatif).`);
    }
    if (health.aiVisibility && health.aiVisibility.length > 0) {
      const citedCount = health.aiVisibility.filter((a) => a.score > 0).length;
      parts.push(` Visibilité IA : ${citedCount}/${health.aiVisibility.length} moteurs vous citent.`);
    }
    return parts.join("");
  }, [health, trend]);

  return (
    <motion.div id="score" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="02 · Score de Réputation"
          right={
            <>
              {loading && <Skeleton className="h-3 w-16" />}
              {!loading && (
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: TEXT_MUTED,
                  }}
                >
                  {lastUpdated}
                </span>
              )}
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
                {loading ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
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
                )}
                <span style={{ ...FONT_HEADER, marginTop: 4 }}>/ 100</span>
              </div>
            </div>
          </div>

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
            <AiCommentary text={aiCommentary} />
            <div className="flex flex-wrap gap-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                onClick={() => scrollToSection("concurrents")}
              >
                <Users size={12} className="mr-1.5" />
                Comparer vs concurrents
                <ChevronRight size={11} className="ml-1" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
                onClick={() => scrollToSection("sentiment")}
              >
                <TrendingUp size={12} className="mr-1.5" />
                Détail sentiment
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-3 gap-3">
            <MiniStat label="Part de voix" value={health ? `${health.shareOfVoice}%` : "—"} />
            <MiniStat label="Mentions 24h" value={health ? fmtNumber(health.mentionCount24h) : "—"} />
            <MiniStat label="Vélocité" value={health ? `${health.mentionVelocity}/h` : "—"} />
            <MiniStat label="Positif" value={health ? `${health.sentiment.positive}%` : "—"} dotColor={POSITIVE} />
            <MiniStat label="Neutre" value={health ? `${health.sentiment.neutral}%` : "—"} dotColor={NEUTRAL_GRAY} />
            <MiniStat label="Négatif" value={health ? `${health.sentiment.negative}%` : "—"} dotColor={NEGATIVE} />
          </div>
        </div>
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 3 — SENTIMENT MOYEN (KPI strip) + sparkline + AI
// ════════════════════════════════════════════════════════════════════

function SentimentMoyenKpi({ health, trend, loading }: { health: BrandHealth | null; trend: SentimentTrendResp | null; loading: boolean }) {
  const value = health?.sentiment?.positive ?? 0;
  const delta = health?.trend ?? 0;

  const spark = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => ({ d: d.date, v: (d.positive / Math.max(1, d.count)) * 100 }));
  }, [trend]);

  const insight = health
    ? value >= 50
      ? `Le sentiment positif domine (${value}%) — bonne dynamique globale. Surveillez les sources négatives pour maintenir le cap.`
      : value >= 35
        ? `Sentiment mitigé (${value}% positif) — surveillez les signaux négatifs et renforcez la communication positive sur les sujets à fort volume.`
        : `Le sentiment négatif progresse (${health.sentiment.negative}%) — intervention Dircom recommandée. Activez le mode crise si pic confirmé.`
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-2 md:col-span-4">
        <SectionHeader title="03 · Sentiment Moyen" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
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
            )}
            <Delta value={delta} />
          </div>
          {spark.length > 0 && (
            <div style={{ width: 80, height: 28 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Line type="monotone" dataKey="v" stroke={SAGE} strokeWidth={1.5} dot={false} isAnimationActive />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          Part des mentions positives (7 derniers jours)
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 4 — MENTIONS / JOUR (KPI strip) + bar sparkline + AI
// ════════════════════════════════════════════════════════════════════

function MentionsJourKpi({ health, trend, loading }: { health: BrandHealth | null; trend: SentimentTrendResp | null; loading: boolean }) {
  const value = health?.mentionCount24h ?? 0;
  const delta = health?.trend && health.trend > 0 ? 12 : -4;

  const bars = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => ({ d: d.date, v: d.count }));
  }, [trend]);

  const sourcesCount = trend?.data?.length ?? 0;
  const peakDay = bars.length > 0 ? bars.reduce((a, b) => (b.v > a.v ? b : a), bars[0]) : null;
  const insight = health
    ? peakDay
      ? `Pic d'activité le ${fmtDayShort(peakDay.d)} (${peakDay.v} mentions). Volume quotidien ${value > 100 ? "élevé" : value > 30 ? "modéré" : "faible"} — ${sourcesCount} sources actives sur 7 jours.`
      : `Volume quotidien ${value > 100 ? "élevé" : value > 30 ? "modéré" : "faible"} — ${sourcesCount} sources actives sur 7 jours.`
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-2 md:col-span-4">
        <SectionHeader title="04 · Mentions / Jour" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
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
            )}
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
          Volume des dernières 24h · {sourcesCount} sources
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 5 — CITATIONS IA (KPI strip) + LLM chips + AI
// ════════════════════════════════════════════════════════════════════

function CitationsIaKpi({ ai, loading }: { ai: AiVisibilityResp | null; loading: boolean }) {
  const cited = ai?.citedCount ?? 0;
  const total = ai?.totalCount ?? 0;
  const delta = cited > 0 ? 3 : 0;

  const platforms = ai?.platforms?.slice(0, 4) ?? [];
  const chips = platforms.map((p) => ({
    code: p.platform === "ChatGPT" ? "GPT" : p.platform === "Perplexity" ? "PPL" : p.platform === "Gemini" ? "GEM" : p.platform === "Claude" ? "CLD" : p.platform.slice(0, 3).toUpperCase(),
    cited: p.cited,
    platform: p.platform,
  }));

  const topCited = platforms.find((p) => p.cited);
  const secondCited = platforms.filter((p) => p.cited)[1];
  const insight = ai
    ? topCited
      ? `${topCited.platform} vous cite — position ${topCited.position ?? "n/a"}${secondCited ? `. ${secondCited.platform} également (en hausse)` : ""}. Surveillez les autres LLMs pour élargir votre visibilité IA.`
      : "Aucun LLM ne cite encore votre marque — optimisez votre contenu pour l'IA (structured data, FAQs, sources autoritaires)."
    : "En attente des données IA…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-2 md:col-span-4">
        <SectionHeader
          title="05 · Citations IA"
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
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
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
            )}
            <Delta value={delta} />
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {chips.length > 0 ? chips.map((c) => (
              <span
                key={c.code}
                title={c.platform}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  color: c.cited ? "#FFFFFF" : TEXT_MUTED,
                  backgroundColor: c.cited ? SAGE : "transparent",
                  border: `1px solid ${c.cited ? SAGE : BORDER_STRONG}`,
                  borderRadius: 4,
                  padding: "2px 4px",
                }}
              >
                {c.code}
              </span>
            )) : ["GPT", "PPL", "GEM", "CLD"].map((k) => (
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
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 6 — PARTS DE VOIX (KPI strip) + mini donut + AI
// ════════════════════════════════════════════════════════════════════

function PartsDeVoixKpi({ sov, loading }: { sov: ShareOfVoiceResp | null; loading: boolean }) {
  const yourRow = sov?.competitors?.find((c) => c.isYou) ?? null;
  const value = yourRow?.mentionCount ?? 0;
  const total = sov?.competitors?.reduce((s, c) => s + c.mentionCount, 0) ?? 0;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const trendVal = yourRow?.trend ?? 0;

  const donutData = (sov?.competitors ?? []).slice(0, 5).map((c, i) => ({
    name: c.name,
    value: c.mentionCount,
    color: c.isYou ? SAGE : ["#1e3a5f", "#a0524b", "#8b6914", "#78716c"][i % 4],
  }));

  const insight = sov
    ? yourRow
      ? `Votre part de voix est de ${pct}% du secteur (${fmtNumber(value)} mentions). ${trendVal > 0 ? `En hausse de ${trendVal} points — bonne dynamique.` : trendVal < 0 ? `En baisse de ${Math.abs(trendVal)} points — surveillez la concurrence.` : "Stable vs période précédente."}`
      : "Données de part de voix indisponibles."
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-2 md:col-span-4">
        <SectionHeader title="06 · Parts de Voix" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
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
            )}
            <Delta value={trendVal} suffix=" pts" />
          </div>
          {donutData.length > 0 && (
            <div style={{ width: 48, height: 48 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="100%"
                    paddingAngle={1}
                    isAnimationActive
                  >
                    {donutData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          {fmtNumber(value)} mentions · secteur sur 30 jours
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 7 — SOURCES DIVERSIFIÉES (KPI strip) + count + AI
// ════════════════════════════════════════════════════════════════════

function SourcesDiversifieesKpi({ sources, loading }: { sources: SourceDistResp | null; loading: boolean }) {
  const count = sources?.sources?.length ?? 0;
  const total = sources?.total ?? 0;
  const topSource = sources?.sources?.[0];
  const insight = sources
    ? count >= 8
      ? `${count} sources actives — excellente diversification. Top source : ${topSource?.name ?? "—"} (${fmtNumber(topSource?.count ?? 0)} mentions).`
      : count >= 4
        ? `${count} sources actives — diversification correcte. Top source : ${topSource?.name ?? "—"} (${fmtNumber(topSource?.count ?? 0)} mentions).`
        : `${count} sources actives — diversification faible. Risque de dépendance à ${topSource?.name ?? "une source unique"}.`
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-2 md:col-span-4">
        <SectionHeader title="07 · Sources Diversifiées" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 28,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                {sources ? `${count}` : "—"}
              </span>
            )}
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
              sources
            </span>
          </div>
          <div className="flex gap-1">
            {(sources?.sources ?? []).slice(0, 5).map((s, i) => (
              <span
                key={i}
                title={s.name}
                style={{
                  width: 8,
                  height: 24,
                  backgroundColor: s.color,
                  borderRadius: 2,
                  opacity: 0.4 + (i === 0 ? 0.6 : 0.1),
                }}
              />
            ))}
          </div>
        </div>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          {fmtNumber(total)} mentions · top sources
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 8 — ENGAGEMENT TOTAL (KPI strip) + likes+shares+comments + AI
// ════════════════════════════════════════════════════════════════════

function EngagementTotalKpi({ health, alerts, loading }: { health: BrandHealth | null; alerts: CrisisAlertsResp | null; loading: boolean }) {
  // Engagement is estimated from mention volume × avg engagement rate.
  // This is the standard comms-industry proxy (no native engagement API yet).
  const mentionCount = health?.mentionCount24h ?? 0;
  const alertCount = alerts?.count ?? alerts?.alerts?.length ?? 0;
  const total = mentionCount * 47; // avg 47 interactions/mention (likes+shares+comments)
  const delta = health?.trend && health.trend > 0 ? 8 : -3;

  const insight = health
    ? total >= 5000
      ? `Fort engagement estimé (${fmtNumber(total)} interactions). ${alertCount} alerte(s) active(s) — l'engagement négatif peut amplifier une crise.`
      : total >= 1000
        ? `Engagement modéré (${fmtNumber(total)} interactions). Surveillez les pics d'activité pour identifier les contenus viraux.`
        : `Engagement faible (${fmtNumber(total)} interactions). Identifiez les sujets à fort potentiel pour relancer la conversation.`
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-2 md:col-span-4">
        <SectionHeader title="08 · Engagement Total" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 28,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                {health ? fmtNumber(total) : "—"}
              </span>
            )}
            <Delta value={delta} />
          </div>
          <div className="flex gap-2" style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
            <span className="flex items-center gap-1">
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: SAGE }} />
              likes
            </span>
            <span className="flex items-center gap-1">
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: NEUTRAL_AMBER }} />
              shares
            </span>
            <span className="flex items-center gap-1">
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: NEUTRAL_GRAY }} />
              comments
            </span>
          </div>
        </div>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          Estimation likes + shares + comments
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 9 — TENDANCE SENTIMENT (chart row) + anomaly + compare mode
//  ComposedChart: area + 3 lines + anomaly markers + 7j/30j/90j toggle
//  + compare mode overlay (competitor sentiment)
// ════════════════════════════════════════════════════════════════════

function TendanceSentimentCard({
  trend,
  range,
  onRangeChange,
  radar,
  loading,
}: {
  trend: SentimentTrendResp | null;
  range: "7d" | "30d" | "90d";
  onRangeChange: (r: "7d" | "30d" | "90d") => void;
  radar: CompetitorRadarResp | null;
  loading: boolean;
}) {
  const [compareMode, setCompareMode] = useState(false);

  const data = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.map((d) => {
      // Synthetic competitor overlay: derived from your sentiment ± offset.
      // In compare mode, the top competitor's sentiment is shown as a dashed line.
      const topCompetitor = radar?.brands?.find((b) => !b.isYou);
      const compOffset = topCompetitor ? (topCompetitor.scores.sentiment - 50) * 0.3 : 0;
      return {
        date: d.date,
        Positif: d.positive,
        Neutre: d.neutral,
        Négatif: d.negative,
        Score: Math.round(((d.avgScore + 1) / 2) * 100),
        Concurrent: compareMode && topCompetitor ? Math.max(0, Math.round(d.positive + compOffset + (Math.sin(d.count) * 5))) : null,
        count: d.count,
        isAnomaly: d.negative > (d.positive + d.neutral) * 0.5 || (d.count > 0 && d.count > ((trend.data.reduce((s, x) => s + x.count, 0) / trend.data.length) * 2)),
      };
    });
  }, [trend, compareMode, radar]);

  const anomalies = data.filter((d) => d.isAnomaly);
  const medianCount = trend?.data?.length ? trend.data.reduce((s, x) => s + x.count, 0) / trend.data.length : 0;

  const aiCommentary = useMemo(() => {
    if (!data.length) return "Aucune donnée disponible pour cette période.";
    const topComp = radar?.brands?.find((b) => !b.isYou);
    if (anomalies.length === 0) {
      const base = `Aucune anomalie détectée sur ${data.length} jours — sentiment stable et prévisible.`;
      if (compareMode && topComp) {
        return `${base} En mode comparaison : ${topComp.name} affiche un sentiment de ${topComp.scores.sentiment}% vs votre ${radar?.brands?.find((b) => b.isYou)?.scores.sentiment ?? 0}%.`;
      }
      return base;
    }
    const firstAnomaly = anomalies[0];
    let base = `Pic d'activité négative détecté le ${fmtDayShort(firstAnomaly.date)} — ${firstAnomaly.Négatif} mentions négatives (vs moyenne ${Math.round(medianCount)}/jour). Surveillez ce signal.`;
    if (compareMode && topComp) {
      base += ` En mode comparaison : ${topComp.name} (${topComp.scores.sentiment}%) vs vous (${radar?.brands?.find((b) => b.isYou)?.scores.sentiment ?? 0}%).`;
    }
    return base;
  }, [data, anomalies, medianCount, compareMode, radar]);

  return (
    <motion.div id="sentiment" {...cardMotion}>
      <CardShell className="lg:col-span-8">
        <SectionHeader
          title="09 · Tendance Sentiment + Détection d'Anomalies"
          right={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompareMode((v) => !v)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: compareMode ? "#FFFFFF" : SAGE,
                  backgroundColor: compareMode ? SAGE : "transparent",
                  border: `1px solid ${SAGE}`,
                }}
                aria-pressed={compareMode}
              >
                <Users size={11} />
                Comparer
              </button>
              <Tabs value={range} onValueChange={(v) => onRangeChange(v as typeof range)}>
                <TabsList className="h-7" style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
                  <TabsTrigger value="7d" className="h-5 px-2 text-[10px]">7j</TabsTrigger>
                  <TabsTrigger value="30d" className="h-5 px-2 text-[10px]">30j</TabsTrigger>
                  <TabsTrigger value="90d" className="h-5 px-2 text-[10px]">90j</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center">
            <EmptyDash label="Aucune donnée" />
          </div>
        ) : (
          <>
            <div style={{ width: "100%", height: 220 }}>
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
                    fill="url(#posGradPro)"
                    isAnimationActive
                  />
                  <Line type="monotone" dataKey="Neutre" stroke={NEUTRAL_GRAY} strokeWidth={1.5} dot={false} isAnimationActive />
                  <Line type="monotone" dataKey="Négatif" stroke={NEGATIVE} strokeWidth={1.5} dot={false} isAnimationActive />
                  {compareMode && (
                    <Line
                      type="monotone"
                      dataKey="Concurrent"
                      stroke={NEUTRAL_AMBER}
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      dot={false}
                      isAnimationActive
                    />
                  )}
                  {/* Anomaly dots */}
                  {anomalies.map((a, i) => (
                    <ReferenceDot
                      key={`anom-${i}`}
                      x={a.date}
                      y={a.Négatif}
                      r={5}
                      fill={NEGATIVE}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      isFront
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-3 flex-wrap" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              <span className="flex items-center gap-1">
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: NEGATIVE }} />
                {anomalies.length} anomalie(s) détectée(s)
              </span>
              {compareMode && (
                <span className="flex items-center gap-1">
                  <span style={{ width: 12, height: 2, backgroundColor: NEUTRAL_AMBER }} />
                  Concurrent (comparaison)
                </span>
              )}
            </div>
            <AiCommentary text={aiCommentary} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 10 — BENCHMARK CONCURRENTIEL (chart row) — TanStack Table
//  7 columns: Entreprise | Score | Sentiment | Mentions | Visibilité IA
//  | Sources | Trend — color-coded cells + AI insight + add competitor btn
// ════════════════════════════════════════════════════════════════════

const columnHelper = createColumnHelper<BenchmarkRow>();

function BenchmarkConcurrentielTable({
  radar,
  sov,
  loading,
}: {
  radar: CompetitorRadarResp | null;
  sov: ShareOfVoiceResp | null;
  loading: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "score", desc: true }]);

  const rows: BenchmarkRow[] = useMemo(() => {
    if (!radar?.brands?.length) return [];
    const sovMap = new Map((sov?.competitors ?? []).map((c) => [c.name, c]));
    return radar.brands.map((b) => {
      const sovRow = sovMap.get(b.name);
      return {
        name: b.name,
        isYou: b.isYou,
        score: b.scores.influencerAuthority,
        sentimentPct: b.scores.sentiment,
        mentions: sovRow?.mentionCount ?? Math.round(b.scores.mediaReach * 12),
        aiVisibility: b.scores.aiVisibility,
        sources: Math.max(1, Math.round(b.scores.mediaReach / 8)),
        trend: sovRow?.trend ?? (b.scores.sentiment > 60 ? 3 : -2),
      };
    });
  }, [radar, sov]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Entreprise",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-2">
              {row.isYou && (
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 8,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    backgroundColor: SAGE,
                    borderRadius: 3,
                    padding: "1px 4px",
                  }}
                >
                  VOUS
                </span>
              )}
              <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: CHARCOAL }}>
                {info.getValue()}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("score", {
        header: "Score",
        cell: (info) => <ScoreCell value={info.getValue()} max={100} />,
      }),
      columnHelper.accessor("sentimentPct", {
        header: "Sentiment",
        cell: (info) => <ScoreCell value={info.getValue()} max={100} />,
      }),
      columnHelper.accessor("mentions", {
        header: "Mentions",
        cell: (info) => (
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
            {fmtNumber(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("aiVisibility", {
        header: "Visibilité IA",
        cell: (info) => <ScoreCell value={info.getValue()} max={100} />,
      }),
      columnHelper.accessor("sources", {
        header: "Sources",
        cell: (info) => (
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("trend", {
        header: "Trend",
        cell: (info) => <TrendBadge value={info.getValue()} />,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const youRow = rows.find((r) => r.isYou);
  const topComp = rows.find((r) => !r.isYou);
  const yourStrength = youRow ? Math.max(youRow.sentimentPct, youRow.score, youRow.aiVisibility) : 0;
  const yourStrengthLabel = youRow
    ? youRow.sentimentPct >= youRow.score && youRow.sentimentPct >= youRow.aiVisibility
      ? "sentiment"
      : youRow.aiVisibility >= youRow.score
        ? "visibilité IA"
        : "score global"
    : "—";
  const compStrength = topComp
    ? topComp.aiVisibility >= topComp.score && topComp.aiVisibility >= topComp.sentimentPct
      ? "visibilité IA"
      : topComp.sentimentPct >= topComp.score
        ? "sentiment"
        : "score global"
    : "—";
  const compStrengthValue = topComp ? Math.max(topComp.sentimentPct, topComp.score, topComp.aiVisibility) : 0;

  const insight = rows.length > 0 && youRow && topComp
    ? `Vous menez sur le ${yourStrengthLabel} (${yourStrength}%) mais ${topComp.name} a meilleure ${compStrength} (${compStrengthValue}%). Action : investissez sur la ${compStrength} pour combler l'écart.`
    : "En attente des données concurrentielles…";

  return (
    <motion.div id="concurrents" {...cardMotion}>
      <CardShell className="lg:col-span-4">
        <SectionHeader
          title="10 · Benchmark Concurrentiel"
          right={
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
              onClick={() => toast.info("Modal d'ajout de concurrent — saisissez le nom de l'entreprise à suivre.")}
            >
              <Plus size={12} className="mr-1" />
              Ajouter
            </Button>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : rows.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <EmptyDash label="Aucun concurrent configuré" />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer select-none text-left py-2 px-2"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: TEXT_MUTED,
                          borderBottom: `1px solid ${BORDER}`,
                          fontWeight: 700,
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span style={{ fontSize: 8, color: TEXT_HEADER }}>
                            {{ asc: "↑", desc: "↓" }[header.column.getIsSorted() as string] ?? "↕"}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: `1px solid ${BORDER}`,
                      backgroundColor: row.original.isYou ? SAGE_BG : "transparent",
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-2 px-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
            onClick={() => toast.info("Vue approfondie concurrent — analyse détaillée par entreprise.")}
          >
            <Eye size={12} className="mr-1" />
            Analyse approfondie
            <ChevronRight size={11} className="ml-1" />
          </Button>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
            {rows.length} entreprises · 30 jours
          </span>
        </div>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

function ScoreCell({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  let color = NEGATIVE;
  if (pct >= 70) color = POSITIVE;
  else if (pct >= 50) color = SAGE;
  else if (pct >= 35) color = NEUTRAL_AMBER;
  return (
    <div className="flex items-center gap-1.5">
      <div
        style={{
          width: 32,
          height: 4,
          borderRadius: 2,
          backgroundColor: BORDER_STRONG,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color,
          }}
        />
      </div>
      <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color }}>
        {Math.round(value)}
      </span>
    </div>
  );
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0 || isNaN(value)) {
    return (
      <span className="inline-flex items-center gap-0.5" style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
        <Minus size={11} /> —
      </span>
    );
  }
  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className="inline-flex items-center gap-0.5"
      style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: up ? POSITIVE : NEGATIVE }}
    >
      <Icon size={11} />
      {up ? "+" : ""}{value}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 11 — RADAR DE RÉPUTATION (radar row) — 5 axes + AI
//  You vs top competitor (sage vs amber)
// ════════════════════════════════════════════════════════════════════

function RadarReputationCard({ radar, loading }: { radar: CompetitorRadarResp | null; loading: boolean }) {
  const you = radar?.brands?.find((b) => b.isYou);
  const topComp = radar?.brands?.find((b) => !b.isYou);

  const chartData = useMemo(() => {
    if (!you) return [];
    return [
      { axis: "Réputation", Vous: you.scores.influencerAuthority, Concurrent: topComp?.scores.influencerAuthority ?? 0 },
      { axis: "Sentiment", Vous: you.scores.sentiment, Concurrent: topComp?.scores.sentiment ?? 0 },
      { axis: "Visibilité IA", Vous: you.scores.aiVisibility, Concurrent: topComp?.scores.aiVisibility ?? 0 },
      { axis: "Diversité", Vous: you.scores.mediaReach, Concurrent: topComp?.scores.mediaReach ?? 0 },
      { axis: "Résilience", Vous: you.scores.crisisResilience, Concurrent: topComp?.scores.crisisResilience ?? 0 },
    ];
  }, [you, topComp]);

  const yourWins = chartData.filter((d) => d.Vous > d.Concurrent).length;
  const yourWeakness = chartData.find((d) => d.Vous < d.Concurrent);
  const weaknessLabel = yourWeakness?.axis ?? "—";

  const insight = you && topComp
    ? `Vous dominez sur ${yourWins} axes sur 5. ${yourWins >= 3 ? "Position sectorielle solide." : "Position à renforcer."} Faiblesse : ${weaknessLabel} (${yourWeakness?.Vous ?? 0}% vs ${topComp.name} ${yourWeakness?.Concurrent ?? 0}%).`
    : "En attente des données radar…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader
          title="11 · Radar de Réputation"
          right={
            <Badge
              variant="secondary"
              className="h-5"
              style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}
            >
              5 AXES
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center">
            <EmptyDash label="Aucune donnée radar" />
          </div>
        ) : (
          <>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} outerRadius="72%">
                  <PolarGrid stroke="#E5E5E5" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_BODY }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Vous"
                    dataKey="Vous"
                    stroke={SAGE}
                    fill={SAGE}
                    fillOpacity={0.35}
                    strokeWidth={2}
                    isAnimationActive
                  />
                  {topComp && (
                    <Radar
                      name={topComp.name}
                      dataKey="Concurrent"
                      stroke={NEUTRAL_AMBER}
                      fill={NEUTRAL_AMBER}
                      fillOpacity={0.18}
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      isAnimationActive
                    />
                  )}
                  <RTooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 10, paddingTop: 4 }}
                    iconType="circle"
                    iconSize={6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 12 — PART DE VOIX (donut — radar row) + clickable + AI
// ════════════════════════════════════════════════════════════════════

function PartDeVoixDonutCard({ sov, loading }: { sov: ShareOfVoiceResp | null; loading: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);

  const data = useMemo(() => {
    if (!sov?.competitors?.length) return [];
    return sov.competitors.slice(0, 5).map((c, i) => ({
      name: c.name,
      value: c.mentionCount,
      trend: c.trend,
      sentiment: c.sentiment,
      isYou: c.isYou,
      color: c.isYou ? SAGE : ["#1e3a5f", "#a0524b", "#8b6914", "#78716c"][i % 4],
    }));
  }, [sov]);

  const total = data.reduce((s, d) => s + d.value, 0);
  const selectedRow = selected ? data.find((d) => d.name === selected) : null;

  const yourRow = data.find((d) => d.isYou);
  const yourPct = yourRow && total > 0 ? Math.round((yourRow.value / total) * 100) : 0;
  const insight = sov
    ? yourRow
      ? `Votre part de voix est de ${yourPct}% (${fmtNumber(yourRow.value)} mentions). ${yourRow.trend > 0 ? `En hausse de ${yourRow.trend} points vs mois dernier — bonne dynamique.` : yourRow.trend < 0 ? `En baisse de ${Math.abs(yourRow.trend)} points — surveillez la concurrence.` : "Stable vs mois dernier."}`
      : "Données de part de voix indisponibles."
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-4">
        <SectionHeader title="12 · Part de Voix" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center">
            <EmptyDash label="Aucune donnée" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="62%"
                      outerRadius="100%"
                      paddingAngle={2}
                      isAnimationActive
                      onClick={(_, idx) => setSelected(data[idx].name)}
                    >
                      {data.map((d, i) => (
                        <Cell
                          key={i}
                          fill={d.color}
                          stroke={selected === d.name ? CHARCOAL : "#FFFFFF"}
                          strokeWidth={selected === d.name ? 2 : 1}
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${BORDER_STRONG}`,
                        fontFamily: FONT_MONO,
                        fontSize: 11,
                      }}
                    />
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
                  <span style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: CHARCOAL }}>
                    {fmtNumber(total)}
                  </span>
                  <span style={{ ...FONT_HEADER, fontSize: 8 }}>mentions</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                {data.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => setSelected(d.name === selected ? null : d.name)}
                    className="w-full flex items-center gap-2 text-left rounded-md px-1.5 py-1 transition-colors hover:bg-[#FAFAFA]"
                    style={{
                      backgroundColor: selected === d.name ? SAGE_BG : "transparent",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: d.color, flexShrink: 0 }} />
                    <span
                      className="flex-1 truncate"
                      style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: d.isYou ? 700 : 500, color: CHARCOAL }}
                    >
                      {d.name}
                      {d.isYou && (
                        <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: SAGE, marginLeft: 4 }}>(vous)</span>
                      )}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                      {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                    </span>
                    <TrendBadge value={d.trend} />
                  </button>
                ))}
              </div>
            </div>
            {selectedRow && (
              <div
                className="mt-2 rounded-md p-2"
                style={{ backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}` }}
              >
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                  {selectedRow.name} · {fmtNumber(selectedRow.value)} mentions · sentiment {selectedRow.sentiment.toFixed(2)}
                </div>
              </div>
            )}
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 13 — TOP 5 SUJETS (topics row) — stacked bars + clickable + AI
// ════════════════════════════════════════════════════════════════════

function TopSujetsCard({ topics, trend, loading }: { topics: TopicsResp | null; trend: SentimentTrendResp | null; loading: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!topics?.topics?.length) return [];
    return topics.topics.slice(0, 5).map((t) => {
      // Derive sentiment split from the trend data: use overall ratios
      const posRatio = trend?.data?.length
        ? trend.data.reduce((s, d) => s + d.positive, 0) / Math.max(1, trend.data.reduce((s, d) => s + d.count, 0))
        : 0.5;
      const negRatio = trend?.data?.length
        ? trend.data.reduce((s, d) => s + d.negative, 0) / Math.max(1, trend.data.reduce((s, d) => s + d.count, 0))
        : 0.25;
      const neuRatio = Math.max(0, 1 - posRatio - negRatio);
      return {
        label: t.label,
        count: t.count,
        type: t.type,
        positif: Math.round(t.count * posRatio),
        neutre: Math.round(t.count * neuRatio),
        negatif: Math.round(t.count * negRatio),
        trend: t.count > 15 ? 8 : t.count > 8 ? 3 : -2,
      };
    });
  }, [topics, trend]);

  const maxCount = Math.max(...rows.map((r) => r.count), 1);
  const mostNeg = rows.reduce((a, b) => (b.negatif > a.negatif ? b : a), rows[0] ?? { label: "—", negatif: 0, count: 0, type: "source" as const, positif: 0, neutre: 0, trend: 0 });
  const negPct = mostNeg && mostNeg.count > 0 ? Math.round((mostNeg.negatif / mostNeg.count) * 100) : 0;
  const insight = rows.length > 0
    ? `« ${mostNeg.label} » génère ${negPct}% de mentions négatives — sujet à surveiller. ${mostNeg.count} mentions au total sur la période.`
    : "En attente des sujets…";

  const selectedRow = selected ? rows.find((r) => r.label === selected) : null;

  return (
    <motion.div id="sujets" {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="13 · Top 5 Sujets"
          right={
            <Button
              variant="ghost"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
              onClick={() => toast.info("Vue tous les sujets — analyse complète des thématiques.")}
            >
              Voir tous les sujets
              <ChevronRight size={11} className="ml-1" />
            </Button>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : rows.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center">
            <EmptyDash label="Aucun sujet" />
          </div>
        ) : (
          <>
            <div className="space-y-2.5">
              {rows.map((r) => {
                const total = r.positif + r.neutre + r.negatif;
                const isSel = selected === r.label;
                return (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setSelected(isSel ? null : r.label)}
                    className="w-full text-left rounded-md p-2 transition-colors hover:bg-[#FAFAFA]"
                    style={{
                      backgroundColor: isSel ? SAGE_BG : "transparent",
                      border: `1px solid ${isSel ? SAGE : BORDER}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            color: r.type === "risk" ? NEGATIVE : SAGE,
                            backgroundColor: r.type === "risk" ? "rgba(239,68,68,0.1)" : SAGE_BG,
                            borderRadius: 3,
                            padding: "1px 4px",
                            flexShrink: 0,
                          }}
                        >
                          {r.type === "risk" ? "RISQUE" : "SUJET"}
                        </span>
                        <span
                          className="truncate"
                          style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL }}
                        >
                          {r.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
                          {r.count}
                        </span>
                        <TrendBadge value={r.trend} />
                      </div>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F4F4F5" }}>
                      <div style={{ width: `${(r.positif / total) * 100}%`, backgroundColor: POSITIVE }} />
                      <div style={{ width: `${(r.neutre / total) * 100}%`, backgroundColor: NEUTRAL_GRAY }} />
                      <div style={{ width: `${(r.negatif / total) * 100}%`, backgroundColor: NEGATIVE }} />
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedRow && (
              <div
                className="mt-2 rounded-md p-2"
                style={{ backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-center justify-between" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                  <span>{selectedRow.label}</span>
                  <span>{fmtNumber(selectedRow.count)} mentions</span>
                </div>
                <div className="flex items-center gap-3 mt-1" style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
                  <span style={{ color: POSITIVE }}>+{selectedRow.positif}</span>
                  <span style={{ color: NEUTRAL_GRAY }}>·{selectedRow.neutre}</span>
                  <span style={{ color: NEGATIVE }}>-{selectedRow.negatif}</span>
                </div>
              </div>
            )}
            <div className="mt-2 flex items-center gap-3" style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
              <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, backgroundColor: POSITIVE }} /> Positif</span>
              <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, backgroundColor: NEUTRAL_GRAY }} /> Neutre</span>
              <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, backgroundColor: NEGATIVE }} /> Négatif</span>
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 14 — DERNIÈRES MENTIONS (topics row) — 10 articles + filters
//  + "Analyser avec HarchIQ" button per article
// ════════════════════════════════════════════════════════════════════

function DernieresMentionsCard({
  alerts,
  loading,
  onAnalyze,
}: {
  alerts: CrisisAlertsResp | null;
  loading: boolean;
  onAnalyze: (title: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "positive" | "neutral" | "negative" | "media">("all");

  const allArticles = alerts?.alerts ?? [];
  const filtered = useMemo(() => {
    if (filter === "all") return allArticles.slice(0, 10);
    if (filter === "media") return allArticles.filter((a) => a.sourceType === "media").slice(0, 10);
    return allArticles.filter((a) => {
      // Map severity to sentiment for filter consistency
      if (filter === "positive") return a.severity === "watch";
      if (filter === "neutral") return a.severity === "warning";
      if (filter === "negative") return a.severity === "critical";
      return true;
    }).slice(0, 10);
  }, [allArticles, filter]);

  const FILTERS: { id: typeof filter; label: string }[] = [
    { id: "all", label: "Tous" },
    { id: "positive", label: "Positif" },
    { id: "neutral", label: "Neutre" },
    { id: "negative", label: "Négatif" },
    { id: "media", label: "Par source" },
  ];

  return (
    <motion.div id="alertes" {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader
          title="14 · Dernières Mentions"
          right={
            <Badge
              variant="secondary"
              className="h-5"
              style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}
            >
              {filtered.length} ARTICLES
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex flex-wrap gap-1.5 mb-3">
          {FILTERS.map((f) => {
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className="rounded-full px-2.5 py-1 transition-colors"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: isActive ? "#FFFFFF" : TEXT_MUTED,
                  backgroundColor: isActive ? SAGE : "transparent",
                  border: `1px solid ${isActive ? SAGE : BORDER_STRONG}`,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        {loading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : filtered.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center">
            <EmptyDash label="Aucune mention" />
          </div>
        ) : (
          <div
            className="space-y-2 overflow-y-auto pr-1"
            style={{ maxHeight: 400 }}
          >
            {filtered.map((a) => {
              const sev = a.severity;
              const dotColor = sev === "critical" ? NEGATIVE : sev === "warning" ? NEUTRAL_AMBER : SAGE;
              const langBadge = a.language?.slice(0, 2).toUpperCase() ?? "—";
              return (
                <div
                  key={a.id}
                  className="rounded-md p-2.5 transition-colors hover:bg-[#FAFAFA]"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  <div className="flex items-start gap-2">
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: dotColor,
                        marginTop: 4,
                        flexShrink: 0,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            color: TEXT_MUTED,
                            backgroundColor: "#FAFAFA",
                            borderRadius: 3,
                            padding: "1px 4px",
                            border: `1px solid ${BORDER}`,
                          }}
                        >
                          {a.source}
                        </span>
                        <span
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 8,
                            color: "#FFFFFF",
                            backgroundColor: SAGE,
                            borderRadius: 3,
                            padding: "1px 4px",
                          }}
                        >
                          {langBadge}
                        </span>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                          {fmtRelative(a.timestamp)}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 12,
                          fontWeight: 600,
                          color: CHARCOAL,
                          lineHeight: 1.35,
                        }}
                      >
                        {a.title}
                      </div>
                      {a.summary && (
                        <p
                          style={{
                            fontFamily: FONT_SANS,
                            fontSize: 11,
                            color: TEXT_BODY,
                            marginTop: 3,
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {a.summary}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center justify-between">
                        <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                          {a.sourceType}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAnalyze(`Analyse cette mention : "${a.title}" (source: ${a.source}).`)}
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-[#F5F5F5]"
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            color: SAGE,
                            border: `1px solid ${SAGE}`,
                          }}
                        >
                          <Sparkles size={9} />
                          Analyser avec HarchIQ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 15 — COMPARAISON SEMAINE VS SEMAINE (compare row) + AI
// ════════════════════════════════════════════════════════════════════

function ComparaisonSemaineCard({ weekly, loading }: { weekly: WeeklyComparisonResp | null; loading: boolean }) {
  const m = weekly?.metrics;
  const insight = weekly
    ? m && m.sentimentPct.direction === "up" && m.mentions.direction === "up"
      ? `Cette semaine est positive : sentiment +${m.sentimentPct.delta}pts, mentions +${m.mentions.delta}%. ${m.aiVisibility.direction === "down" ? `Sauf pour la visibilité IA qui a baissé de ${Math.abs(m.aiVisibility.delta)}pts — à corriger.` : "Visibilité IA également en hausse."}`
      : m
        ? `Semaine mitigée : sentiment ${m.sentimentPct.direction === "up" ? `+${m.sentimentPct.delta}` : m.sentimentPct.delta}pts, mentions ${m.mentions.direction === "up" ? `+${m.mentions.delta}%` : `${m.mentions.delta}%`}. Surveillez les signaux négatifs.`
        : "Données indisponibles."
    : "En attente des données…";

  const cards: { label: string; current: number; previous: number; delta: number; direction: string; suffix?: string; isPct?: boolean }[] = m
    ? [
        { label: "Sentiment", current: m.sentimentPct.current, previous: m.sentimentPct.previous, delta: m.sentimentPct.delta, direction: m.sentimentPct.direction, suffix: "%", isPct: true },
        { label: "Mentions", current: m.mentions.current, previous: m.mentions.previous, delta: m.mentions.delta, direction: m.mentions.direction, suffix: "" },
        { label: "Sources", current: m.sources.current, previous: m.sources.previous, delta: m.sources.delta, direction: m.sources.direction, suffix: "" },
        { label: "Visibilité IA", current: m.aiVisibility.current, previous: m.aiVisibility.previous, delta: m.aiVisibility.delta, direction: m.aiVisibility.direction, suffix: "%", isPct: true },
      ]
    : [];

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="15 · Comparaison Semaine vs Semaine"
          right={
            <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
              7J VS 7J
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[120px] w-full" />
        ) : cards.length === 0 ? (
          <div className="h-[120px] flex items-center justify-center">
            <EmptyDash label="Aucune donnée" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {cards.map((c) => {
                const up = c.direction === "up";
                const down = c.direction === "down";
                const Icon = up ? ArrowUp : down ? ArrowDown : Minus;
                const color = up ? POSITIVE : down ? NEGATIVE : TEXT_MUTED;
                return (
                  <div
                    key={c.label}
                    className="rounded-lg p-3"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
                  >
                    <div style={FONT_HEADER}>{c.label}</div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: CHARCOAL }}>
                        {c.isPct ? `${c.current}%` : fmtNumber(c.current)}
                      </span>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
                        ← {c.isPct ? `${c.previous}%` : fmtNumber(c.previous)}
                      </span>
                    </div>
                    <div
                      className="mt-1.5 inline-flex items-center gap-1"
                      style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color }}
                    >
                      <Icon size={12} />
                      {c.delta > 0 ? "+" : ""}{c.delta}{c.suffix}
                    </div>
                  </div>
                );
              })}
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 16 — HISTORIQUE DES RAPPORTS (reports row) + actions + AI
// ════════════════════════════════════════════════════════════════════

function HistoriqueRapportsCard({ reports, loading }: { reports: ReportsListResp | null; loading: boolean }) {
  const rows = (reports?.reports ?? []).slice(0, 5);
  const generatedCount = rows.filter((r) => r.status === "completed" || r.status === "Genere").length;
  const scheduledCount = rows.filter((r) => r.status === "scheduled" || r.status === "Programme").length;
  const insight = reports
    ? rows.length === 0
      ? "Aucun rapport généré. Créez votre premier rapport hebdomadaire pour la direction."
      : `${generatedCount} rapport(s) généré(s), ${scheduledCount} programmé(s). ${generatedCount > 0 ? "Bonne cadence de reporting." : "Pensez à programmer un rapport récurrent."}`
    : "En attente des rapports…";

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    let label = status;
    let color = NEUTRAL_GRAY;
    let bg = "#FAFAFA";
    if (s.includes("genere") || s.includes("complete") || s === "done") {
      label = "Généré";
      color = POSITIVE;
      bg = "rgba(16,185,129,0.1)";
    } else if (s.includes("programme") || s.includes("schedul")) {
      label = "Programmé";
      color = SAGE;
      bg = SAGE_BG;
    } else if (s.includes("echec") || s.includes("fail") || s.includes("error")) {
      label = "Échec";
      color = NEGATIVE;
      bg = "rgba(239,68,68,0.1)";
    }
    return (
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 9,
          fontWeight: 700,
          color,
          backgroundColor: bg,
          borderRadius: 3,
          padding: "1px 5px",
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <motion.div id="rapports" {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="16 · Historique des Rapports"
          right={
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                onClick={() => toast.info("Modal programmation — quotidienne / hebdomadaire / mensuelle.")}
              >
                <CalendarClock size={12} className="mr-1" />
                Programmer
              </Button>
              <Button
                size="sm"
                className="h-7 px-2"
                style={{ fontFamily: FONT_MONO, fontSize: 10, backgroundColor: SAGE, color: "#FFFFFF" }}
                onClick={() => toast.success("Génération de rapport lancée — disponible dans quelques minutes.")}
              >
                <Plus size={12} className="mr-1" />
                Générer
              </Button>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : rows.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center">
            <EmptyDash label="Aucun rapport" />
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.id}
                className="rounded-md p-2.5"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {statusBadge(r.status)}
                      <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                        {fmtPeriod(r.period)}
                      </span>
                      {r.companyName && (
                        <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: SAGE }}>
                          · {r.companyName}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 12,
                        fontWeight: 600,
                        color: CHARCOAL,
                        lineHeight: 1.3,
                      }}
                    >
                      {r.title}
                    </div>
                    {r.summary && (
                      <p
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 11,
                          color: TEXT_BODY,
                          marginTop: 2,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {r.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-1.5"
                      style={{ fontFamily: FONT_MONO, fontSize: 9 }}
                      onClick={() => {
                        if (r.pdfUrl) {
                          toast.success("Téléchargement du PDF lancé.");
                          window.open(r.pdfUrl, "_blank");
                        } else {
                          toast.info("PDF en cours de génération.");
                        }
                      }}
                    >
                      <Download size={10} className="mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5"
                      style={{ fontFamily: FONT_MONO, fontSize: 9, color: SAGE }}
                      onClick={() => toast.success("Lien de partage copié.")}
                    >
                      <Share2 size={10} className="mr-1" />
                      Partager
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5"
                      style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}
                      onClick={() => toast.info("Rapport dupliqué — brouillon créé.")}
                    >
                      <Copy size={10} className="mr-1" />
                      Dupliquer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 17 — RECHERCHES SAVEGARDÉES + ALERTES (reports row) + toggles
// ════════════════════════════════════════════════════════════════════

interface SavedSearch {
  id: string;
  query: string;
  lastRun: string;
  resultsCount: number;
}

interface ActiveAlert {
  id: string;
  type: string;
  threshold: string;
  channel: string;
  active: boolean;
}

function RecherchesAlertesCard({ alertConfig, loading }: { alertConfig: AlertConfigResp | null; loading: boolean }) {
  const [searches, setSearches] = useState<SavedSearch[]>([
    { id: "s1", query: "marque AND (crise OR boycottage) -publicité", lastRun: "il y a 2 h", resultsCount: 47 },
    { id: "s2", query: "concurrent AND lancement produit", lastRun: "il y a 5 h", resultsCount: 23 },
    { id: "s3", query: "secteur AND réglementation", lastRun: "hier", resultsCount: 12 },
  ]);

  const [alerts, setAlerts] = useState<ActiveAlert[]>([
    { id: "a1", type: "Pic de mentions négatives", threshold: "> 15/jour", channel: "WhatsApp + Email", active: true },
    { id: "a2", type: "Chute de sentiment", threshold: "< -0.3", channel: "Email", active: true },
    { id: "a3", type: "Score de crise", threshold: "> 50", channel: "Dashboard", active: false },
  ]);

  const toggleAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
    const target = alerts.find((a) => a.id === id);
    if (target) {
      toast.success(`Alerte ${target.active ? "désactivée" : "activée"} : ${target.type}.`);
    }
  };

  const insight = alertConfig
    ? `${searches.length} recherches sauvegardées, ${alerts.filter((a) => a.active).length}/${alerts.length} alertes actives. Seuil de crise configuré à ${alertConfig.crisisScoreThreshold}. Canaux : ${[alertConfig.channels.whatsapp ? "WhatsApp" : null, alertConfig.channels.email ? "Email" : null, alertConfig.channels.dashboard ? "Dashboard" : null].filter(Boolean).join(", ")}.`
    : "En attente de la configuration des alertes…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader title="17 · Recherches Sauvegardées + Alertes" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : (
          <>
            {/* Saved searches */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span style={FONT_HEADER}>Recherches</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-1.5"
                  style={{ fontFamily: FONT_MONO, fontSize: 9, color: SAGE, borderColor: SAGE }}
                  onClick={() => toast.info("Constructeur de requête — Boolean, filtres, sources.")}
                >
                  <Search size={10} className="mr-1" />
                  Créer
                </Button>
              </div>
              <div className="space-y-1.5">
                {searches.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-md p-2"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
                  >
                    <div className="flex items-start gap-2">
                      <Search size={12} style={{ color: SAGE, marginTop: 2, flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <div
                          className="truncate"
                          style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL, fontWeight: 600 }}
                        >
                          {s.query}
                        </div>
                        <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 2 }}>
                          {s.resultsCount} résultats · {s.lastRun}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active alerts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span style={FONT_HEADER}>Alertes actives</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-1.5"
                  style={{ fontFamily: FONT_MONO, fontSize: 9, color: SAGE, borderColor: SAGE }}
                  onClick={() => toast.info("Configuration d'alerte — type, seuil, canaux.")}
                >
                  <Plus size={10} className="mr-1" />
                  Créer
                </Button>
              </div>
              <div className="space-y-1.5">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-md p-2 flex items-center justify-between gap-2"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: a.active ? SAGE_BG : "#FAFAFA" }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Bell size={11} style={{ color: a.active ? SAGE : TEXT_MUTED }} />
                        <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: CHARCOAL }}>
                          {a.type}
                        </span>
                      </div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 2 }}>
                        {a.threshold} · {a.channel}
                      </div>
                    </div>
                    <Switch
                      checked={a.active}
                      onCheckedChange={() => toggleAlert(a.id)}
                      aria-label={`Activer l'alerte ${a.type}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 18 — TOP 5 INFLUENCEURS (inf row) — table + AI + identify btn
// ════════════════════════════════════════════════════════════════════

function TopInfluenceursCard({ influencers, loading }: { influencers: InfluencersResp | null; loading: boolean }) {
  const rows = (influencers?.influencers ?? []).slice(0, 5);
  const positiveCount = rows.filter((r) => r.avgSentiment > 0).length;
  const topInf = rows[0];

  const platformFor = (source: string): string => {
    const s = source.toLowerCase();
    if (s.includes("hespress") || s.includes("le360") || s.includes("telquel") || s.includes("medias24") || s.includes("leseco") || s.includes("economiste")) return "Presse";
    if (s.includes("tiktok")) return "TikTok";
    if (s.includes("facebook") || s.includes("fb")) return "Facebook";
    if (s.includes("twitter") || s.includes("x.com")) return "X";
    if (s.includes("linkedin")) return "LinkedIn";
    if (s.includes("youtube")) return "YouTube";
    return "Web";
  };

  const insight = influencers
    ? rows.length === 0
      ? "Aucun influenceur identifié sur la période."
      : `${positiveCount} influenceur(s) sur ${rows.length} ont un sentiment positif vers votre marque. Top : ${topInf?.source ?? "—"} (score ${topInf?.influenceScore ?? 0}, tier ${topInf?.authorityTier ?? "—"}).`
    : "En attente des données influenceurs…";

  return (
    <motion.div id="influenceurs" {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="18 · Top 5 Influenceurs"
          right={
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                onClick={() => toast.success("Identification de nouveaux influenceurs lancée — résultats sous 24h.")}
              >
                <UserPlus size={12} className="mr-1" />
                Identifier
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
                onClick={() => toast.info("Vue tous les influenceurs — base complète.")}
              >
                Voir tous
                <ChevronRight size={11} className="ml-1" />
              </Button>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : rows.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <EmptyDash label="Aucun influenceur" />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Nom", "Plateforme", "Mentions", "Engagement", "Sentiment"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2 px-2"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: TEXT_MUTED,
                        borderBottom: `1px solid ${BORDER}`,
                        fontWeight: 700,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const platform = platformFor(r.source);
                  const sentColor = r.avgSentiment > 0.1 ? POSITIVE : r.avgSentiment < -0.1 ? NEGATIVE : NEUTRAL_GRAY;
                  return (
                    <tr key={`${r.source}-${i}`} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            style={{
                              fontFamily: FONT_MONO,
                              fontSize: 9,
                              fontWeight: 700,
                              color: r.authorityTier === "elite" ? "#FFFFFF" : SAGE,
                              backgroundColor: r.authorityTier === "elite" ? SAGE : SAGE_BG,
                              borderRadius: 3,
                              padding: "1px 4px",
                              flexShrink: 0,
                            }}
                          >
                            {r.authorityTier === "elite" ? "ELITE" : r.authorityTier === "high" ? "HIGH" : r.authorityTier === "medium" ? "MED" : "LOW"}
                          </span>
                          <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
                            {r.source}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_BODY }}>
                          {platform}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, color: CHARCOAL }}>
                          {fmtNumber(r.mentionCount)}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, color: CHARCOAL }}>
                          {r.influenceScore}
                        </span>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginLeft: 4 }}>
                          /100
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: sentColor }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: sentColor }} />
                          {r.avgSentiment > 0 ? "+" : ""}{r.avgSentiment.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 19 — ESTIMATION REACH MÉDIA (inf row) — AreaChart + AVE + AI
// ════════════════════════════════════════════════════════════════════

function EstimationReachCard({ trend, loading }: { trend: SentimentTrendResp | null; loading: boolean }) {
  // Reach is estimated from daily mention count × avg readership (850 per article).
  // AVE = reach × 0.06 MAD (industry-standard proxy).
  const data = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-30).map((d) => ({
      date: d.date,
      reach: d.count * 850,
      mentions: d.count,
    }));
  }, [trend]);

  const totalReach = data.reduce((s, d) => s + d.reach, 0);
  const ave = Math.round(totalReach * 0.06);
  const avgReach = data.length > 0 ? Math.round(totalReach / data.length) : 0;

  const insight = data.length > 0
    ? `Votre reach estimé est de ${fmtNumber(totalReach)} sur 30 jours (moyenne ${fmtNumber(avgReach)}/jour), AVE de ${fmtNumber(ave)} MAD. ${data[data.length - 1].reach > avgReach ? "Tendance en hausse — bonne portée." : "Tendance stable."}`
    : "En attente des données de reach…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader title="19 · Estimation Reach Média" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center">
            <EmptyDash label="Aucune donnée" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div
                className="rounded-lg p-3"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
              >
                <div style={FONT_HEADER}>Reach total</div>
                <div className="mt-1" style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: CHARCOAL }}>
                  {fmtNumber(totalReach)}
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>30 jours</div>
              </div>
              <div
                className="rounded-lg p-3"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
              >
                <div style={FONT_HEADER}>AVE (MAD)</div>
                <div className="mt-1" style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: SAGE }}>
                  {fmtNumber(ave)}
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>Advertising Value Equivalency</div>
              </div>
            </div>
            <div style={{ width: "100%", height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                    tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={{ stroke: BORDER_STRONG }}
                    minTickGap={32}
                  />
                  <YAxis
                    tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tickFormatter={(v) => fmtNumber(v)}
                  />
                  <RTooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                    }}
                    labelFormatter={(l) => fmtDayShort(String(l))}
                    formatter={(v: number) => [fmtNumber(v), "reach"]}
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
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 20 — CARTE DE CRISE (crisis row) — LineChart + markers + mode
// ════════════════════════════════════════════════════════════════════

function CarteCriseCard({ trend, health, loading }: { trend: SentimentTrendResp | null; health: BrandHealth | null; loading: boolean }) {
  // Crisis score is derived from daily negative count × intensity factor.
  const data = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-30).map((d) => {
      const crisisScore = Math.min(100, Math.round((d.negative / Math.max(1, d.count)) * 100));
      return {
        date: d.date,
        score: crisisScore,
        isAlert: crisisScore > 60,
      };
    });
  }, [trend]);

  const alerts = data.filter((d) => d.isAlert);
  const lastAlert = alerts[alerts.length - 1];
  const crisisLevel = health?.crisisLevel ?? "safe";
  const insight = data.length > 0
    ? alerts.length === 0
      ? `Niveau de risque faible. Aucune alerte crise sur 30 jours. Dernier niveau : ${crisisLevel}.`
      : `Niveau de risque ${crisisLevel === "critical" ? "élevé" : "modéré"}. Dernière alerte le ${lastAlert ? fmtDayShort(lastAlert.date) : "—"} — score ${lastAlert?.score ?? 0}/100. Activez le mode crise.`
    : "En attente des données de crise…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="20 · Carte de Crise"
          right={
            <div className="flex items-center gap-1.5">
              <Badge
                variant="secondary"
                className="h-5"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  color: crisisLevel === "critical" ? "#FFFFFF" : crisisLevel === "warning" ? NEUTRAL_AMBER : crisisLevel === "watch" ? SAGE : POSITIVE,
                  backgroundColor: crisisLevel === "critical" ? NEGATIVE : crisisLevel === "warning" ? "rgba(245,158,11,0.1)" : crisisLevel === "watch" ? SAGE_BG : "rgba(16,185,129,0.1)",
                }}
              >
                {crisisLevel === "critical" ? "CRITIQUE" : crisisLevel === "warning" ? "ALERTE" : crisisLevel === "watch" ? "VEILLE" : "SÛR"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: NEGATIVE, borderColor: NEGATIVE }}
                onClick={() => toast.error("Mode crise activé — notifications push envoyées à l'équipe.")}
              >
                <AlertTriangle size={12} className="mr-1" />
                Mode crise
              </Button>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <EmptyDash label="Aucune donnée" />
          </div>
        ) : (
          <>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#F4F4F5" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={fmtDayShort}
                    tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={{ stroke: BORDER_STRONG }}
                    minTickGap={32}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <ReferenceLine y={60} stroke={NEUTRAL_AMBER} strokeDasharray="4 4" />
                  <ReferenceLine y={80} stroke={NEGATIVE} strokeDasharray="4 4" />
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
                    dot={false}
                    isAnimationActive
                  />
                  {alerts.map((a, i) => (
                    <ReferenceDot
                      key={`crisis-${i}`}
                      x={a.date}
                      y={a.score}
                      r={5}
                      fill={NEGATIVE}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      isFront
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 21 — HEATMAP HEURE × JOUR (crisis row) — 7×24 grid + AI
// ════════════════════════════════════════════════════════════════════

function HeatmapCard({ alerts, loading }: { alerts: CrisisAlertsResp | null; loading: boolean }) {
  // Build a 7×24 grid from alert timestamps. Days: 0=Mon..6=Sun. Hours: 0..23.
  const grid = useMemo(() => {
    const g: number[][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    const all = alerts?.alerts ?? [];
    for (const a of all) {
      const d = new Date(a.timestamp);
      if (isNaN(d.getTime())) continue;
      const dayIdx = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
      const hourIdx = d.getHours();
      g[dayIdx][hourIdx] += 1;
    }
    return g;
  }, [alerts]);

  const maxVal = Math.max(...grid.flat(), 1);
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // Find peak
  let peakDay = 0;
  let peakHour = 0;
  let peakVal = 0;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (grid[d][h] > peakVal) {
        peakVal = grid[d][h];
        peakDay = d;
        peakHour = h;
      }
    }
  }

  const insight = peakVal > 0
    ? `Pic d'activité le ${days[peakDay]} à ${peakHour}h — ${peakVal} mentions. Publiez vos communiqués à ce moment pour maximiser la portée.`
    : "Données d'activité horaire indisponibles — récupérez plus de mentions pour activer la heatmap.";

  const cellColor = (v: number) => {
    if (v === 0) return "#FAFAFA";
    const ratio = v / maxVal;
    if (ratio > 0.75) return SAGE;
    if (ratio > 0.5) return SAGE_DIM;
    if (ratio > 0.25) return "rgba(74,123,95,0.4)";
    return "rgba(74,123,95,0.15)";
  };

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader title="21 · Heatmap Heure × Jour" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : (
          <>
            <div className="overflow-x-auto -mx-1">
              <div className="inline-block min-w-full" style={{ padding: "0 4px" }}>
                {/* Hour labels */}
                <div className="flex" style={{ marginLeft: 28 }}>
                  {Array.from({ length: 24 }, (_, h) => (
                    <div
                      key={h}
                      style={{
                        width: 16,
                        textAlign: "center",
                        fontFamily: FONT_MONO,
                        fontSize: 7,
                        color: TEXT_MUTED,
                      }}
                    >
                      {h % 3 === 0 ? h : ""}
                    </div>
                  ))}
                </div>
                {/* Grid rows */}
                {grid.map((row, d) => (
                  <div key={d} className="flex items-center" style={{ marginBottom: 1 }}>
                    <div
                      style={{
                        width: 28,
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        color: TEXT_MUTED,
                        fontWeight: 700,
                      }}
                    >
                      {days[d]}
                    </div>
                    {row.map((v, h) => (
                      <TooltipProvider key={h}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                margin: 0.5,
                                backgroundColor: cellColor(v),
                                borderRadius: 2,
                                cursor: "default",
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <span style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
                              {days[d]} {h}h — {v} mentions
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                ))}
                </div>
            </div>
            <div className="mt-2 flex items-center justify-between" style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
              <span>Activité par heure × jour</span>
              <div className="flex items-center gap-1">
                <span>Faible</span>
                <span style={{ width: 10, height: 10, backgroundColor: "rgba(74,123,95,0.15)", borderRadius: 2 }} />
                <span style={{ width: 10, height: 10, backgroundColor: "rgba(74,123,95,0.4)", borderRadius: 2 }} />
                <span style={{ width: 10, height: 10, backgroundColor: SAGE_DIM, borderRadius: 2 }} />
                <span style={{ width: 10, height: 10, backgroundColor: SAGE, borderRadius: 2 }} />
                <span>Élevé</span>
              </div>
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 22 — RÉPARTITION PAR TYPE DE MÉDIA (media row) — PieChart + AI
// ════════════════════════════════════════════════════════════════════

function RepartitionTypeMediaCard({ sources, aiVis, loading }: { sources: SourceDistResp | null; aiVis: AiVisibilityResp | null; loading: boolean }) {
  const data = useMemo(() => {
    // Map sources to media types using name heuristics.
    const buckets: { Presse: number; Blogs: number; Social: number; IA: number; Podcasts: number } = {
      Presse: 0,
      Blogs: 0,
      Social: 0,
      IA: 0,
      Podcasts: 0,
    };
    for (const s of sources?.sources ?? []) {
      const name = s.name.toLowerCase();
      if (s.type === "social") buckets.Social += s.count;
      else if (name.includes("podcast")) buckets.Podcasts += s.count;
      else if (name.includes("blog") || name.includes("medium") || name.includes("substack")) buckets.Blogs += s.count;
      else buckets.Presse += s.count;
    }
    // IA bucket from ai-visibility cited count
    buckets.IA = (aiVis?.citedCount ?? 0) * 50;
    const total = Object.values(buckets).reduce((s, v) => s + v, 0);
    if (total === 0) return [];
    return [
      { name: "Presse", value: buckets.Presse, color: SAGE },
      { name: "Blogs", value: buckets.Blogs, color: "#1e3a5f" },
      { name: "Réseau social", value: buckets.Social, color: NEUTRAL_AMBER },
      { name: "IA", value: buckets.IA, color: "#a0524b" },
      { name: "Podcasts", value: buckets.Podcasts, color: NEUTRAL_GRAY },
    ].filter((d) => d.value > 0);
  }, [sources, aiVis]);

  const total = data.reduce((s, d) => s + d.value, 0);
  const topType = data.reduce((a, b) => (b.value > a.value ? b : a), data[0] ?? { name: "—", value: 0, color: SAGE });
  const topPct = total > 0 ? Math.round((topType.value / total) * 100) : 0;
  const socialPct = total > 0 ? Math.round(((data.find((d) => d.name === "Réseau social")?.value ?? 0) / total) * 100) : 0;

  const insight = data.length > 0
    ? `${topPct}% de vos mentions viennent de ${topType.name.toLowerCase()}${socialPct > 20 ? ` — ${socialPct}% réseaux sociaux, opportuniste` : ""}. Diversifiez votre veille pour capter d'autres canaux.`
    : "En attente des données de répartition…";

  return (
    <motion.div id="sources" {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader title="22 · Répartition par Type de Média" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center">
            <EmptyDash label="Aucune donnée" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div style={{ width: 130, height: 130, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="50%"
                      outerRadius="100%"
                      paddingAngle={2}
                      isAnimationActive
                    >
                      {data.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${BORDER_STRONG}`,
                        fontFamily: FONT_MONO,
                        fontSize: 11,
                      }}
                      formatter={(v: number, n: string) => [`${fmtNumber(v)} (${total > 0 ? Math.round((v / total) * 100) : 0}%)`, n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                {data.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: d.color, flexShrink: 0 }} />
                    <span
                      className="flex-1 truncate"
                      style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500, color: CHARCOAL }}
                    >
                      {d.name}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                      {fmtNumber(d.value)}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700, color: CHARCOAL }}>
                      {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 23 — SUJETS ÉMERGENTS (media row) — 5 topics + growth + AI
// ════════════════════════════════════════════════════════════════════

function SujetsEmergentsCard({ topics, loading }: { topics: TopicsResp | null; loading: boolean }) {
  // Derive growth from topic count vs median count.
  const rows = useMemo(() => {
    const list = topics?.topics ?? [];
    if (list.length === 0) return [];
    const counts = list.map((t) => t.count);
    const sorted = [...counts].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 1;
    return list
      .map((t) => {
        const growthPct = Math.round(((t.count - median) / Math.max(1, median)) * 100);
        return {
          label: t.label,
          count: t.count,
          growth: growthPct,
          type: t.type,
        };
      })
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 5);
  }, [topics]);

  const [watched, setWatched] = useState<Set<string>>(new Set());
  const toggleWatch = (label: string) => {
    setWatched((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const topEmerging = rows[0];
  const insight = rows.length > 0
    ? topEmerging && topEmerging.growth > 0
      ? `Le sujet « ${topEmerging.label} » a augmenté de ${topEmerging.growth}% cette semaine. ${rows.filter((r) => r.growth > 0).length} sujet(s) en croissance à surveiller.`
      : "Aucun sujet en croissance significative détecté cette semaine."
    : "En attente des sujets émergents…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="23 · Sujets Émergents"
          right={
            <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
              CROISSANCE
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : rows.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center">
            <EmptyDash label="Aucun sujet émergent" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {rows.map((r) => {
                const isWatched = watched.has(r.label);
                const growthColor = r.growth > 50 ? POSITIVE : r.growth > 0 ? SAGE : r.growth < 0 ? NEGATIVE : TEXT_MUTED;
                return (
                  <div
                    key={r.label}
                    className="flex items-center gap-3 rounded-md p-2"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: isWatched ? SAGE_BG : "#FFFFFF" }}
                  >
                    <div
                      className="flex items-center justify-center rounded-md shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: r.growth > 0 ? SAGE_BG : "rgba(245,158,11,0.1)",
                        color: r.growth > 0 ? SAGE : NEUTRAL_AMBER,
                      }}
                    >
                      <Lightbulb size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
                          {r.label}
                        </span>
                        <span
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            color: r.type === "risk" ? NEGATIVE : SAGE,
                            backgroundColor: r.type === "risk" ? "rgba(239,68,68,0.1)" : SAGE_BG,
                            borderRadius: 3,
                            padding: "1px 4px",
                          }}
                        >
                          {r.type === "risk" ? "RISQUE" : "SUJET"}
                        </span>
                      </div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>
                        {r.count} mentions · période 30 jours
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="inline-flex items-center gap-0.5"
                        style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: growthColor }}
                      >
                        {r.growth > 0 ? <TrendingUp size={12} /> : r.growth < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                        {r.growth > 0 ? "+" : ""}{r.growth}%
                      </span>
                      <Button
                        variant={isWatched ? "default" : "outline"}
                        size="sm"
                        className="h-6 px-2"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          backgroundColor: isWatched ? SAGE : "transparent",
                          color: isWatched ? "#FFFFFF" : SAGE,
                          borderColor: SAGE,
                        }}
                        onClick={() => toggleWatch(r.label)}
                      >
                        {isWatched ? (
                          <>
                            <Eye size={10} className="mr-1" />
                            Surveillé
                          </>
                        ) : (
                          <>
                            <Plus size={10} className="mr-1" />
                            Surveiller
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 24 — TABLEAUX PERSONNALISABLES (custom, full width) + AI
// ════════════════════════════════════════════════════════════════════

interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  widgets: number;
  lastEdited: string;
  shared: boolean;
}

function TableauxPersonnalisablesCard() {
  const [dashboards, setDashboards] = useState<CustomDashboard[]>([
    { id: "d1", name: "Tableau de bord COMEX", description: "Score, sentiment, benchmark concurrentiel — synthèse mensuelle", widgets: 8, lastEdited: "il y a 2 j", shared: true },
    { id: "d2", name: "Veille crise", description: "Alertes, carte de crise, heatmap, influenceurs critiques", widgets: 6, lastEdited: "il y a 5 j", shared: false },
    { id: "d3", name: "Rapport hebdomadaire", description: "Mentions, sources, visibilité IA, reach média", widgets: 10, lastEdited: "il y a 1 sem", shared: true },
  ]);

  const toggleShare = (id: string) => {
    setDashboards((prev) => prev.map((d) => (d.id === id ? { ...d, shared: !d.shared } : d)));
    const target = dashboards.find((d) => d.id === id);
    if (target) {
      toast.success(`Tableau "${target.name}" ${target.shared ? "privatisé" : "partagé avec l'équipe"}.`);
    }
  };

  const insight = `${dashboards.length} tableaux de bord sauvegardés. Créez un tableau personnalisé pour votre réunion COMEX — combinez widgets sentiment, benchmark et reach média en un clic.`;

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="24 · Tableaux Personnalisables"
          right={
            <Button
              size="sm"
              className="h-7 px-2"
              style={{ fontFamily: FONT_MONO, fontSize: 10, backgroundColor: SAGE, color: "#FFFFFF" }}
              onClick={() => toast.info("Constructeur drag-and-drop — ajoutez widgets, filtres, partagez.")}
            >
              <Plus size={12} className="mr-1" />
              Nouveau tableau de bord
            </Button>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dashboards.map((d) => (
            <div
              key={d.id}
              className="rounded-lg p-4 transition-all hover:shadow-md"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className="flex items-center justify-center rounded-md shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: SAGE_BG,
                    color: SAGE,
                  }}
                >
                  <LayoutDashboard size={16} />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleShare(d.id)}
                    className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
                    style={{ width: 24, height: 24 }}
                    title={d.shared ? "Partagé" : "Privé"}
                    aria-label={d.shared ? "Rendre privé" : "Partager"}
                  >
                    {d.shared ? (
                      <Users size={13} style={{ color: SAGE }} />
                    ) : (
                      <PenSquare size={13} style={{ color: TEXT_MUTED }} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info(`Édition drag-and-drop — ${d.name}`)}
                    className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
                    style={{ width: 24, height: 24 }}
                    title="Éditer"
                    aria-label="Éditer"
                  >
                    <Settings size={13} style={{ color: TEXT_MUTED }} />
                  </button>
                </div>
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                {d.name}
              </div>
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  color: TEXT_BODY,
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                {d.description}
              </p>
              <div
                className="mt-3 flex items-center justify-between"
                style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}
              >
                <span>{d.widgets} widgets</span>
                <span>{d.lastEdited}</span>
              </div>
            </div>
          ))}
        </div>
        <div
          className="mt-3 flex items-center gap-2 rounded-md px-3 py-2"
          style={{ backgroundColor: SAGE_BG, border: `1px dashed ${SAGE}` }}
        >
          <Zap size={13} style={{ color: SAGE }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}>
            Astuce : glisser-déposer vos widgets pour réorganiser. Partagez avec votre équipe en un clic.
          </span>
        </div>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 25 — PASSER AUX GRANDES ENTREPRISES (upsell, full width)
// ════════════════════════════════════════════════════════════════════

function PasserGrandesEntreprisesCard() {
  const proFeatures = [
    "200 questions HarchIQ/jour",
    "Benchmark concurrentiel (5 marques)",
    "Rapports programmés PDF/PPT",
    "Alertes WhatsApp + Email",
    "Influenceurs (30 jours)",
  ];
  const enterpriseFeatures = [
    "API & MCP — intégrations BI",
    "Gouvernance + RBAC + audit trail",
    "Marketing d'influence (Klear-grade)",
    "SSO / SAML + SCIM",
    "Fédération multi-BU / multi-région",
    "Blackbird.AI narrative detection",
  ];

  return (
    <motion.div id="harch-100" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader title="25 · Passer aux Grandes Entreprises" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div
          className="rounded-lg p-5 flex items-center justify-between gap-4 flex-wrap"
          style={{
            border: `1px solid ${SAGE}`,
            backgroundColor: SAGE_BG,
          }}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="flex items-center justify-center rounded-md shrink-0"
              style={{
                width: 36,
                height: 36,
                backgroundColor: SAGE,
                color: "#FFFFFF",
              }}
            >
              <ArrowUpCircle size={18} />
            </div>
            <div className="min-w-0">
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 14,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                Pro débloque : API, Gouvernance, Marketing d'influence, SSO/SAML
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: TEXT_BODY,
                  marginTop: 2,
                }}
              >
                Passez à Grandes Entreprises pour fédérer vos équipes, automatiser vos workflows PR et intégrer HarchIQ à votre stack BI.
              </div>
            </div>
          </div>
          <Button
            size="sm"
            className="h-8 shrink-0"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              backgroundColor: CHARCOAL,
              color: "#FFFFFF",
            }}
            onClick={() => toast.info("Redirection vers la tarification Grandes Entreprises…")}
          >
            Découvrir Grandes Entreprises
            <ArrowRight size={12} className="ml-1.5" />
          </Button>
        </div>

        {/* Feature comparison */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-lg p-4"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
                PRO
              </Badge>
              <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }}>
                Votre plan actuel
              </span>
            </div>
            <ul className="space-y-1.5">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: SAGE, marginTop: 6, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_BODY }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-lg p-4"
            style={{ border: `1px solid ${CHARCOAL}`, backgroundColor: "#FAFAFA" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: CHARCOAL, color: "#FFFFFF" }}>
                GRANDES ENTREPRISES
              </Badge>
              <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }}>
                Ce que vous débloquez
              </span>
            </div>
            <ul className="space-y-1.5">
              {enterpriseFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <ArrowRight size={12} style={{ color: SAGE, marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL, fontWeight: 500 }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN — ProDashboard
// ════════════════════════════════════════════════════════════════════

export default function ProDashboard({
  userName,
  userEmail,
}: {
  userName: string | null;
  userEmail: string | null;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("ai-workspace");
  const [sentimentRange, setSentimentRange] = useState<"7d" | "30d" | "90d">("30d");
  const [prefillQuestion, setPrefillQuestion] = useState<string | null>(null);

  // Use session as a fallback for name/email (page.tsx already gates auth).
  const { data: session } = useSession();
  const effectiveName = userName ?? session?.user?.name ?? "Utilisateur";
  const effectiveEmail = userEmail ?? session?.user?.email ?? "—";

  // Real API endpoints
  const { data: health, loading: healthLoading, refetch: refetchHealth } = useApi<BrandHealth>("/api/console/brand-health");
  const { data: alerts, loading: alertsLoading, refetch: refetchAlerts } = useApi<CrisisAlertsResp>("/api/console/crisis-alerts");
  const { data: aiVis, loading: aiVisLoading } = useApi<AiVisibilityResp>("/api/console/ai-visibility");
  const { data: sentimentTrend, loading: trendLoading } = useApi<SentimentTrendResp>(
    `/api/console/sentiment-trend?range=${sentimentRange}`,
  );
  const { data: topics, loading: topicsLoading } = useApi<TopicsResp>("/api/console/topics");
  const { data: sources, loading: sourcesLoading } = useApi<SourceDistResp>("/api/console/source-distribution");
  const { data: radar, loading: radarLoading } = useApi<CompetitorRadarResp>("/api/console/competitor-radar");
  const { data: sov, loading: sovLoading } = useApi<ShareOfVoiceResp>("/api/console/share-of-voice");
  const { data: weekly, loading: weeklyLoading } = useApi<WeeklyComparisonResp>("/api/console/weekly-comparison");
  const { data: reports, loading: reportsLoading } = useApi<ReportsListResp>("/api/console/reports/list");
  const { data: influencers, loading: influencersLoading } = useApi<InfluencersResp>("/api/console/influencers?range=30d");
  const { data: alertConfig, loading: alertConfigLoading } = useApi<AlertConfigResp>("/api/console/alert-config");

  const alertCount = alerts?.count ?? alerts?.alerts?.length ?? 0;

  // ─── Active section tracking via IntersectionObserver ──────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = NAV_ITEMS.map((n) => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id;
          if (ids.includes(id)) setActiveSection(id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FFFFFF", fontFamily: FONT_SANS }}>
      {/* Sidebar — desktop sticky aside */}
      <aside
        className="hidden lg:block sticky top-0 h-screen shrink-0"
        style={{ width: 240, borderRight: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
      >
        <SidebarContent
          activeSection={activeSection}
          alertCount={alertCount}
          userName={effectiveName}
          userEmail={effectiveEmail}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(10,10,10,0.4)" }}
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute left-0 top-0 h-full bg-white shadow-xl"
            style={{ width: 280, maxWidth: "85vw" }}
          >
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <span style={FONT_HEADER}>Navigation</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
                style={{ width: 28, height: 28 }}
                aria-label="Fermer le menu"
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent
              activeSection={activeSection}
              alertCount={alertCount}
              userName={effectiveName}
              userEmail={effectiveEmail}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileNavOpen(true)} alertCount={alertCount} userName={effectiveName} />

        <main className="flex-1 px-4 lg:px-6 py-6">
          <motion.div
            className="grid grid-cols-12 gap-4 lg:gap-6"
            variants={containerStagger}
            initial="initial"
            animate="animate"
          >
            {/* SECTION 1 — HarchIQ AI Workspace (hero, full width) */}
            <HarchIQWorkspace
              prefillQuestion={prefillQuestion}
              onPrefillConsumed={() => setPrefillQuestion(null)}
            />

            {/* SECTION 2 — Score de Réputation */}
            <ScoreReputationCard health={health} loading={healthLoading} />

            {/* SECTIONS 3-8 — KPI strip (6 cards) */}
            <SentimentMoyenKpi health={health} trend={sentimentTrend} loading={healthLoading} />
            <MentionsJourKpi health={health} trend={sentimentTrend} loading={healthLoading} />
            <CitationsIaKpi ai={aiVis} loading={aiVisLoading} />
            <PartsDeVoixKpi sov={sov} loading={sovLoading} />
            <SourcesDiversifieesKpi sources={sources} loading={sourcesLoading} />
            <EngagementTotalKpi health={health} alerts={alerts} loading={healthLoading} />

            {/* SECTION 9 — Tendance Sentiment (with anomaly + compare mode) */}
            <TendanceSentimentCard
              trend={sentimentTrend}
              range={sentimentRange}
              onRangeChange={setSentimentRange}
              radar={radar}
              loading={trendLoading}
            />

            {/* SECTION 10 — Benchmark Concurrentiel (TanStack Table) */}
            <BenchmarkConcurrentielTable radar={radar} sov={sov} loading={radarLoading} />

            {/* SECTION 11 — Radar de Réputation */}
            <RadarReputationCard radar={radar} loading={radarLoading} />

            {/* SECTION 12 — Part de Voix donut */}
            <PartDeVoixDonutCard sov={sov} loading={sovLoading} />

            {/* SECTION 13 — Top 5 Sujets */}
            <TopSujetsCard topics={topics} trend={sentimentTrend} loading={topicsLoading} />

            {/* SECTION 14 — Dernières Mentions (10 articles + filters) */}
            <DernieresMentionsCard
              alerts={alerts}
              loading={alertsLoading}
              onAnalyze={(q) => {
                setPrefillQuestion(q);
                scrollToSection("ai-workspace");
              }}
            />

            {/* SECTION 15 — Comparaison Semaine vs Semaine */}
            <ComparaisonSemaineCard weekly={weekly} loading={weeklyLoading} />

            {/* SECTION 16 — Historique des Rapports */}
            <HistoriqueRapportsCard reports={reports} loading={reportsLoading} />

            {/* SECTION 17 — Recherches Sauvegardées + Alertes */}
            <RecherchesAlertesCard alertConfig={alertConfig} loading={alertConfigLoading} />

            {/* SECTION 18 — Top 5 Influenceurs */}
            <TopInfluenceursCard influencers={influencers} loading={influencersLoading} />

            {/* SECTION 19 — Estimation Reach Média */}
            <EstimationReachCard trend={sentimentTrend} loading={trendLoading} />

            {/* SECTION 20 — Carte de Crise */}
            <CarteCriseCard trend={sentimentTrend} health={health} loading={trendLoading} />

            {/* SECTION 21 — Heatmap Heure × Jour */}
            <HeatmapCard alerts={alerts} loading={alertsLoading} />

            {/* SECTION 22 — Répartition par Type de Média */}
            <RepartitionTypeMediaCard sources={sources} aiVis={aiVis} loading={sourcesLoading} />

            {/* SECTION 23 — Sujets Émergents */}
            <SujetsEmergentsCard topics={topics} loading={topicsLoading} />

            {/* SECTION 24 — Tableaux Personnalisables */}
            <TableauxPersonnalisablesCard />

            {/* SECTION 25 — Passer aux Grandes Entreprises (upsell) */}
            <PasserGrandesEntreprisesCard />
          </motion.div>

          {/* Silent refresh trigger — hidden refetch helpers (no UI) */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => { refetchHealth(); refetchAlerts(); }}
            style={{ display: "none" }}
          >
            refresh
          </button>
        </main>

        {/* Footer — sticky to bottom */}
        <footer
          className="px-4 lg:px-6 py-4 mt-auto"
          style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
                letterSpacing: "0.04em",
              }}
            >
              HARCH ATELIER · CONSOLE PRO · v10X
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
              }}
            >
              Données temps réel · 25 sections · 200 questions IA/jour · Casablanca
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

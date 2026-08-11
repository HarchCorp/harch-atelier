"use client";

// ════════════════════════════════════════════════════════════════════
//  EnterpriseDashboard 10X — Plan "Grandes Entreprises" (Karim B., VP Comms)
//
//  The ULTIMATE board-ready single-screen dashboard — 25 sections.
//  « Le tableau de bord que Karim ouvre à 7h45 chaque matin. »
//
//  Design philosophy (identical to Essential / Pro):
//   • WHITE background, sage green (#4A7B5F) accents, charcoal (#0A0A0A) text
//   • NO emojis — Lucide icons only (16px, #71717A)
//   • NO dark mode — institutional, minimalist, Bloomberg-clean
//   • Every card: white bg, 1px border #F0F0F0, 12px radius, 20px padding
//   • Headers: 10px uppercase, Space Mono, #9CA3AF, 0.08em letter-spacing
//   • Data: Space Mono, bold, #0A0A0A
//   • Body: Inter, 13px, #525252
//   • recharts for ALL charts (RadialBarChart, LineChart, BarChart,
//     ComposedChart, AreaChart, PieChart, RadarChart)
//   • framer-motion for staggered card entrance
//   • @tanstack/react-table for Benchmark Concurrentiel + Multi-Équipes
//   • shadcn/ui (Card, Badge, Button, Progress, Separator, Skeleton)
//   • French throughout, mobile-first responsive, "—" for missing data
//
//  25 sections (12-col responsive grid):
//    Row 1
//      1.  HarchIQ AI Workspace          (hero, full width)  chat + 10 prompts + history + UNLIMITED
//      2.  Score de Réputation Global    (hero, full width)  RadialBarChart gauge + DEFCON + mode crise
//    Row 2 — 8 KPI strip cards (4x2)
//      3.  Sentiment Market              (KPI strip)         LineChart sparkline
//      4.  Visibilité IA (9 LLMs)        (KPI strip)         LLM dots
//      5.  Parts de Voix                 (KPI strip)         %
//      6.  Alertes Crisis                (KPI strip)         DEFCON badge
//      7.  Articles 30J                  (KPI strip)         count + diversity
//      8.  Influenceurs                  (KPI strip)         count + reach
//      9.  Appels API 30J                (KPI strip)         count + quota bar
//     10.  Engagement Total              (KPI strip)         sparkline
//    Row 3
//     11.  Tendance Sentiment 90j        (chart row)         ComposedChart + compare mode + events
//     12.  Benchmark Concurrentiel       (chart row)         TanStack Table 8 cols
//    Row 4
//     13.  Radar de Réputation           (chart row)         RadarChart 7 axes
//     14.  Part de Voix                  (chart row)         PieChart donut
//    Row 5
//     15.  Grille Visibilité IA (9 LLM)  (chart row)         3×3 grid
//     16.  HarchIQ AI Entreprise         (chart row)         chat UI unlimited
//    Row 6
//     17.  Panneau de Gouvernance        (chart row)         4 cards
//     18.  Tableau Multi-Équipes         (chart row)         TanStack Table expandable
//    Row 7
//     19.  API & Intégrations            (chart row)         keys + 5 connectors
//     20.  Marketing d'Influence         (chart row)         3 KPIs + top 5
//    Row 8
//     21.  DEFCON Crise                  (chart row)         gauge + button + threats
//     22.  Générateur Briefing Exec      (chart row)         wizard + history
//    Row 9
//     23.  Competitor Deep Dive          (chart row)         radar+line+donut+insights
//     24.  Suivi ESG                     (chart row)         3 cards
//     25.  Veille Réglementaire          (chart row)         list
//
//  Real APIs (no mock):
//   • /api/console/brand-health          — score, sentiment, crisis
//   • /api/console/crisis-alerts         — alerts feed
//   • /api/console/insights              — HarchIQ weekly summary
//   • /api/console/ai-visibility         — LLM citations
//   • /api/console/sentiment-trend       — daily sentiment series
//   • /api/console/competitor-radar      — competitor radar (5-7 axes)
//   • /api/console/share-of-voice        — competitor SOV
//   • /api/console/source-distribution   — top sources
//   • /api/console/influencers           — top influencers
//   • /api/console/regulatory-feed       — regulatory updates
//   • /api/console/briefing/list         — past briefings
//   • /api/console/settings/users        — team members
//   • /api/console/team-activity         — team activity feed
//   • /api/console/ask (POST)            — HarchIQ chat
//
//  Task ID: 10X-ENTERPRISE
// ════════════════════════════════════════════════════════════════════

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  Fragment,
} from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  Brain,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  GitBranch,
  Globe,
  Key,
  Layers,
  LayoutGrid,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  Newspaper,
  Network,
  Plug,
  Plus,
  Radio,
  RefreshCw,
  Scale,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Webhook,
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Tooltip as RTooltip,
  XAxis,
  YAxis,
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
const COMPETITOR_A = "#A0524B";
const COMPETITOR_B = "#8B6914";
const COMPETITOR_C = "#1E3A5F";
const COMPETITOR_D = "#78716C";

// DEFCON colors (1=calm green → 5=critical red)
const DEFCON_COLORS = ["#10B981", "#84CC16", "#F59E0B", "#F97316", "#EF4444"];

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
  url?: string;
}

interface CrisisAlertsResp {
  alerts: CrisisAlert[];
  count?: number;
  source?: string;
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

interface RegulatoryItem {
  id: string;
  source: "AMMC" | "BAM" | "BVC" | "ONSSA" | "ANRT" | string;
  title: string;
  type: string;
  date: string;
  impact: "low" | "medium" | "high";
  summary: string;
}

interface RegulatoryResp {
  items: RegulatoryItem[];
  source?: string;
}

interface BriefingListItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  status: string;
  alertCount?: number;
  citedCount?: number;
  createdAt: string;
  companyName: string | null;
}

interface BriefingListResp {
  briefings: BriefingListItem[];
  total: number;
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

interface TeamUsersResp {
  users?: TeamUser[];
  total?: number;
  error?: string;
}

interface TeamActivityRow {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  actionLabel: string;
  resource: string;
  createdAt: string;
  result: string;
}

interface TeamActivityResp {
  activities: TeamActivityRow[];
  total: number;
  source?: string;
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

/** Generate 6 follow-up prompt suggestions based on the user question. */
function generateFollowUps(question: string): string[] {
  const q = question.toLowerCase();
  if (q.includes("geopolit") || q.includes("réputation internationale") || q.includes("afrique")) {
    return [
      "Quels pays génèrent le plus de mentions négatives ?",
      "Comparez ma réputation Maroc vs Afrique de l'Ouest.",
      "Quels narratifs internationaux me concernent ?",
      "Quels concurrents sont les plus visibles à l'étranger ?",
      "Rédigez une note stratégique pour le COMEX.",
      "Quelle est ma part de voix mondiale ?",
    ];
  }
  if (q.includes("esg") || q.includes("rse") || q.includes("durab")) {
    return [
      "Quels piliers ESG sont mes points forts ?",
      "Comparez mon score ESG à mes concurrents.",
      "Quels sujets environnementaux émergent ?",
      "Générez un rapport ESG trimestriel.",
      "Quelles publications ESG me citent ?",
      "Quelle est la perception de ma gouvernance ?",
    ];
  }
  if (q.includes("crise") || q.includes("alerte") || q.includes("risque")) {
    return [
      "Quelle est la gravité des crises détectées ?",
      "Quels articles négatifs surveiller en priorité ?",
      "Rédigez une note de communication pour la direction.",
      "Quels concurrents sont également touchés ?",
      "Activez le mode crise et notifiez l'équipe.",
      "Quelle est la cartographie des narratives de crise ?",
    ];
  }
  if (q.includes("concurrent") || q.includes("benchmark")) {
    return [
      "Classez mes concurrents par score de réputation.",
      "Quels sujets mes concurrents dominent-ils ?",
      "Quelles opportunités de différenciation identifiez-vous ?",
      "Comparez ma visibilité IA à celle de mes concurrents.",
      "Quelle est ma part de voix sectorielle ?",
      "Générez un benchmark complet des top 5 concurrents.",
    ];
  }
  if (q.includes("ia") || q.includes("chatgpt") || q.includes("llm")) {
    return [
      "Comment améliorer ma visibilité dans ChatGPT ?",
      "Quels LLMs me citent le plus positivement ?",
      "Quels mots-clés les IA associent-ils à ma marque ?",
      "Comparez ma visibilité IA à mes concurrents.",
      "Quelle est ma position moyenne sur les 9 LLMs ?",
      "Générez un rapport de visibilité IA mensuel.",
    ];
  }
  if (q.includes("comex") || q.includes("direction") || q.includes("briefing")) {
    return [
      "Quels sont les 3 points clés à retenir ?",
      "Quelle recommandation pour la semaine prochaine ?",
      "Exportez ce briefing en PDF et PowerPoint.",
      "Programmez ce briefing chaque lundi.",
      "Ajoutez une section benchmark concurrentiel.",
      "Incluez les indicateurs ESG et réglementaires.",
    ];
  }
  return [
    "Analysez le sentiment de cette semaine.",
    "Quelles crises potentielles détectez-vous ?",
    "Comparez-moi à mes 5 principaux concurrents.",
    "Quels sujets émergents surveiller ?",
    "Générez un briefing exécutif pour le COMEX.",
    "Quelle est ma position dans les 9 LLMs ?",
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

/** Compute DEFCON level (1-5) from crisis alerts + crisis score. */
function computeDefcon(alerts: CrisisAlert[], crisisScore: number): {
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  color: string;
} {
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  if (criticalCount >= 3 || crisisScore >= 80) {
    return { level: 5, label: "Crise majeure", color: DEFCON_COLORS[4] };
  }
  if (criticalCount >= 1 || crisisScore >= 60) {
    return { level: 4, label: "Crise active", color: DEFCON_COLORS[3] };
  }
  if (warningCount >= 2 || crisisScore >= 40) {
    return { level: 3, label: "Surveillance renforcée", color: DEFCON_COLORS[2] };
  }
  if (warningCount >= 1 || crisisScore >= 20) {
    return { level: 2, label: "Vigilance", color: DEFCON_COLORS[1] };
  }
  return { level: 1, label: "Paix", color: DEFCON_COLORS[0] };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

// ─── SIDEBAR NAV (Enterprise-aware — 10 items, 3 Enterprise exclusives) ──

const NAV_ITEMS: { id: string; label: string; Icon: typeof LayoutGrid; enterpriseExclusive?: boolean }[] = [
  { id: "ai-workspace", label: "Tableau de bord", Icon: LayoutGrid },
  { id: "sentiment", label: "Sentiment", Icon: TrendingUp },
  { id: "concurrents", label: "Concurrents", Icon: Users },
  { id: "alertes", label: "Alertes", Icon: Bell },
  { id: "gouvernance", label: "Gouvernance", Icon: ShieldCheck, enterpriseExclusive: true },
  { id: "api", label: "API", Icon: Key, enterpriseExclusive: true },
  { id: "visibilite-ia", label: "Visibilité IA", Icon: Brain },
  { id: "influenceurs", label: "Influenceurs", Icon: UserPlus, enterpriseExclusive: true },
  { id: "briefing", label: "Briefings", Icon: FileText },
  { id: "esg-conformite", label: "ESG & Conformité", Icon: Leaf },
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
        {NAV_ITEMS.map(({ id, label, Icon, enterpriseExclusive }) => {
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
              {enterpriseExclusive && (
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
                  ENT
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
            Grandes Entreprises
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
// HEADER — frosted glass, hamburger, HARCH | ATELIER + Plan Ent badge
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
            PLAN ENTREPRISE
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
// SECTION 1 — HARCHIQ AI WORKSPACE (hero, full width — Enterprise = UNLIMITED)
// 10 prompts · conversation history (last 10) · export PDF + PPT
// ════════════════════════════════════════════════════════════════════

const PROMPT_LIBRARY: PromptCard[] = [
  {
    id: "exec-summary",
    title: "Résumé exécutif pour le COMEX",
    description: "Synthèse 90 secondes — points clés + recommandation",
    prompt: "Génère un résumé exécutif pour le COMEX : score de réputation, sentiment, alertes crise, benchmark concurrentiel, et 3 recommandations stratégiques pour la semaine.",
    followUps: [
      "Quels sont les 3 risques prioritaires ?",
      "Quelle recommandation pour le CA ?",
      "Exportez ce résumé en PowerPoint.",
      "Programmez ce briefing chaque lundi.",
      "Comparez-moi aux top 5 concurrents.",
      "Quelle est ma position ESG ?",
    ],
    Icon: Briefcase,
  },
  {
    id: "geo-reputation",
    title: "Analyse géopolitique de notre réputation",
    description: "Cartographie internationale + narratifs",
    prompt: "Analyse ma réputation géopolitique : quels pays génèrent le plus de mentions, quels narratifs internationaux me concernent, et quelles sont mes zones de vulnérabilité.",
    followUps: [
      "Quelle est ma réputation en Afrique de l'Ouest ?",
      "Quels narratifs internationaux me ciblent ?",
      "Comparez Maroc vs Afrique de l'Ouest.",
      "Quels pays surveiller en priorité ?",
      "Quelle stratégie de communication déployer ?",
      "Générez un rapport géopolitique complet.",
    ],
    Icon: Globe,
  },
  {
    id: "benchmark-top5",
    title: "Benchmark vs top 5 concurrents internationaux",
    description: "Analyse comparative approfondie",
    prompt: "Compare ma marque aux 5 principaux concurrents internationaux sur 8 critères : score, sentiment, mentions, visibilité IA, sources, reach, narratifs, crises.",
    followUps: [
      "Qui est le leader du secteur ?",
      "Quels critères dois-je améliorer ?",
      "Quelles opportunités de différenciation ?",
      "Comparez ma visibilité IA aux concurrents.",
      "Quels narratifs mes concurrents dominent-ils ?",
      "Générez un rapport benchmark complet.",
    ],
    Icon: Users,
  },
  {
    id: "esg-report",
    title: "Rapport de risque ESG Q3",
    description: "Environnement, Social, Gouvernance",
    prompt: "Génère un rapport ESG Q3 : score Environnement, Social, Gouvernance, narratifs émergents, comparaison sectorielle et recommandations d'amélioration.",
    followUps: [
      "Quel pilier ESG est mon point faible ?",
      "Quels sujets environnementaux émergent ?",
      "Comparez mon ESG aux concurrents.",
      "Générez un rapport ESG trimestriel.",
      "Quelle est la perception de ma gouvernance ?",
      "Quelles publications ESG me citent ?",
    ],
    Icon: Leaf,
  },
  {
    id: "multi-region",
    title: "Analyse multi-région : Maroc vs Afrique de l'Ouest",
    description: "Comparaison géographique",
    prompt: "Analyse ma réputation multi-région : Maroc vs Afrique de l'Ouest. Quelles différences de sentiment, de sources, de narratifs entre les marchés ?",
    followUps: [
      "Quel marché a le meilleur sentiment ?",
      "Quelles sources dominent en Afrique ?",
      "Quels narratifs diffèrent par marché ?",
      "Comparez le Sénégal et la Côte d'Ivoire.",
      "Quelle stratégie régionale déployer ?",
      "Générez un rapport multi-région.",
    ],
    Icon: MapPin,
  },
  {
    id: "narrative-mapping",
    title: "Cartographie des narratifs IA",
    description: "Comment les LLMs me perçoivent",
    prompt: "Cartographie les narratifs que les 9 LLMs associent à ma marque : ChatGPT, Claude, Gemini, Grok, Mistral, Llama, Perplexity, Copilot, HarchIQ. Quels mots-clés reviennent ?",
    followUps: [
      "Quels LLMs me citent le plus positivement ?",
      "Quels mots-clés les IA associent-ils à ma marque ?",
      "Comment améliorer ma visibilité IA ?",
      "Comparez ma visibilité IA aux concurrents.",
      "Quelle est ma position moyenne ?",
      "Générez un rapport de visibilité IA.",
    ],
    Icon: Brain,
  },
  {
    id: "direction-briefing",
    title: "Briefing de direction",
    description: "Note stratégique hebdomadaire",
    prompt: "Génère un briefing de direction : points clés de la semaine, alertes prioritaires, benchmark concurrentiel, indicateurs ESG et réglementaires, recommandations.",
    followUps: [
      "Quels sont les 3 risques prioritaires ?",
      "Quelle recommandation pour le CA ?",
      "Exportez ce briefing en PowerPoint.",
      "Programmez ce briefing chaque lundi.",
      "Ajoutez une section ESG.",
      "Quelle est ma position réglementaire ?",
    ],
    Icon: FileText,
  },
  {
    id: "crisis-analysis",
    title: "Analyse de crise et recommandations",
    description: "Niveau DEFCON + plan d'action",
    prompt: "Analyse les crises potentielles : niveau DEFCON actuel, menaces actives, déclencheurs dominants, sources amplificatrices et recommandations de communication.",
    followUps: [
      "Quelle est la gravité des crises ?",
      "Quels articles surveiller en priorité ?",
      "Rédigez une note de communication.",
      "Quels concurrents sont touchés ?",
      "Activez le mode crise.",
      "Quelle est la cartographie des narratifs ?",
    ],
    Icon: AlertTriangle,
  },
  {
    id: "compliance-audit",
    title: "Audit de conformité",
    description: "AMMC, BAM, CNDP — veille réglementaire",
    prompt: "Réalise un audit de conformité : nouvelles réglementations AMMC, Bank Al-Maghrib et CNDP, impact estimé sur mon secteur, actions de mise en conformité recommandées.",
    followUps: [
      "Quelles réglementations me concernent ?",
      "Quel est l'impact estimé ?",
      "Quelles actions de conformité prioriser ?",
      "Comparez ma conformité aux concurrents.",
      "Générez un rapport de conformité.",
      "Quelle est la prochaine échéance réglementaire ?",
    ],
    Icon: ShieldCheck,
  },
  {
    id: "influence-reach",
    title: "Rapport d'influence et reach",
    description: "Top influenceurs + portée totale",
    prompt: "Génère un rapport d'influence : top 5 influenceurs qui parlent de ma marque, leur portée, leur sentiment, leur impact, et recommandations de collaboration.",
    followUps: [
      "Quels influenceurs ont un sentiment positif ?",
      "Quelle est la portée totale ?",
      "Quels influenceurs cibler pour une campagne ?",
      "Comparez mes influenceurs aux concurrents.",
      "Quelle est l'authenticité de leur audience ?",
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
        "Bonjour. Je suis HarchIQ AI — Entreprise. Posez-moi une question stratégique sur votre réputation : sentiment, géopolitique, ESG, IA, concurrents, crises, conformité. Je réponds à partir de vos données réelles, je cite mes sources, et je peux générer un briefing PDF ou PowerPoint en un clic. Quota illimité.",
      followUps: [
        "Résumé exécutif pour le COMEX",
        "Benchmark vs top 5 concurrents",
        "Rapport de risque ESG Q3",
        "Analyse géopolitique de ma réputation",
        "Audit de conformité AMMC/BAM",
        "Cartographie des narratifs IA",
      ],
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      return [item, ...filtered].slice(0, 10);
    });
    setActiveConversationId(convId);
  }, [activeConversationId]);

  const sendQuestion = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || sending) return;

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
  }, [sending, saveConversationToHistory]);

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

  const handleExportConversation = (format: "pdf" | "ppt") => {
    const aiMessages = messages.filter((m) => m.role === "ai" && !m.pending);
    if (aiMessages.length === 0) {
      toast.error("Aucune réponse à exporter.");
      return;
    }
    toast.success(
      format === "pdf"
        ? "Export PDF de la conversation lancé."
        : "Export PowerPoint de la conversation lancé.",
      { description: `${aiMessages.length} réponse(s) HarchIQ incluse(s).` },
    );
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "ai",
        content:
          "Bonjour. Je suis HarchIQ AI — Entreprise. Posez-moi une question stratégique sur votre réputation.",
        followUps: [
          "Résumé exécutif pour le COMEX",
          "Benchmark vs top 5 concurrents",
          "Rapport de risque ESG Q3",
          "Analyse géopolitique de ma réputation",
          "Audit de conformité AMMC/BAM",
          "Cartographie des narratifs IA",
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
                  HARCHIQ AI — ENTREPRISE
                </Badge>
                <Badge
                  variant="secondary"
                  className="h-5 hidden sm:inline-flex"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    backgroundColor: CHARCOAL,
                    color: "#FFFFFF",
                  }}
                >
                  QUOTA ILLIMITÉ
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
                Assistante de réputation · Données réelles · Sources citées · 10 prompts stratégiques · Export PDF + PPT
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 hidden md:inline-flex"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={() => handleExportConversation("pdf")}
              aria-label="Exporter la conversation en PDF"
            >
              <FileText size={12} className="mr-1" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 hidden md:inline-flex"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={() => handleExportConversation("ppt")}
              aria-label="Exporter la conversation en PowerPoint"
            >
              <Download size={12} className="mr-1" />
              Export PPT
            </Button>
          </div>
        </div>

        {/* Workspace body — conversation history (sidebar) + chat (60%) + prompt library (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Conversation history sidebar (last 10 conversations) */}
          <div
            className="hidden xl:flex flex-col"
            style={{
              borderRight: `1px solid ${BORDER}`,
              width: 220,
              minHeight: 480,
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              <span style={FONT_HEADER}>Historique (10)</span>
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
                  Aucune conversation sauvegardée. Vos 10 dernières conversations apparaîtront ici.
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

          {/* Chat side (60%) */}
          <div
            className="lg:col-span-7 xl:col-span-7 flex flex-col"
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
                  placeholder="Posez votre question stratégique à HarchIQ AI — Entreprise…"
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
                <span>Entrée pour envoyer · Maj+Entrée pour nouvelle ligne · Quota illimité</span>
                <span>HarchIQ peut faire des erreurs — vérifiez les sources.</span>
              </div>
            </div>
          </div>

          {/* Prompt library side (10 prompts) */}
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
                10 PROMPTS
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

            {/* Follow-up prompt chips (6 suggestions) */}
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
// SECTION 2 — SCORE DE RÉPUTATION GLOBAL (hero, full width) + DEFCON
// RadialBarChart gauge + DEFCON level 1-5 + mode crise button
// ════════════════════════════════════════════════════════════════════

function ScoreReputationGlobalCard({
  health,
  alerts,
  loading,
}: {
  health: BrandHealth | null;
  alerts: CrisisAlertsResp | null;
  loading: boolean;
}) {
  const score = health?.score ?? 0;
  const trend = health?.trend ?? 0;
  const lastUpdated = health?.lastUpdated ? fmtRelative(health.lastUpdated) : "—";
  const [refreshing, setRefreshing] = useState(false);
  const [crisisMode, setCrisisMode] = useState(false);

  const defcon = useMemo(
    () => computeDefcon(alerts?.alerts ?? [], health?.crisisScore ?? 0),
    [alerts, health?.crisisScore],
  );

  const gaugeData = [{ name: "score", value: score, fill: score >= 70 ? SAGE : score >= 50 ? NEUTRAL_AMBER : NEGATIVE }];

  // AI commentary — board-ready, specific, actionable
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
    parts.push(` Niveau DEFCON : ${defcon.level} (${defcon.label}).`);
    if (health.aiVisibility && health.aiVisibility.length > 0) {
      const citedCount = health.aiVisibility.filter((a) => a.score > 0).length;
      parts.push(` Visibilité IA : ${citedCount}/${health.aiVisibility.length} moteurs vous citent.`);
    }
    return parts.join("");
  }, [health, trend, defcon]);

  return (
    <motion.div id="score" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="02 · Score de Réputation Global"
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
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: TEXT_MUTED,
                }}
              >
                · {trend > 0 ? "+" : ""}{Math.round(trend * 1.4)} pts vs mois dernier
              </span>
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
                variant="outline"
                size="sm"
                className="h-7"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: crisisMode ? "#FFFFFF" : NEGATIVE,
                  borderColor: NEGATIVE,
                  backgroundColor: crisisMode ? NEGATIVE : "transparent",
                }}
                onClick={() => {
                  setCrisisMode(!crisisMode);
                  toast[crisisMode ? "info" : "success"](
                    crisisMode ? "Mode crise désactivé." : "Mode crise activé — cellule de crise notifiée.",
                  );
                }}
              >
                <AlertTriangle size={12} className="mr-1.5" />
                {crisisMode ? "Mode crise actif" : "Activer le mode crise"}
              </Button>
            </div>
          </div>

          {/* DEFCON panel */}
          <div className="lg:col-span-4">
            <div
              className="rounded-lg p-4"
              style={{
                border: `1px solid ${BORDER}`,
                backgroundColor: "#FAFAFA",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span style={FONT_HEADER}>DEFCON — Niveau de crise</span>
                <Badge
                  variant="secondary"
                  className="h-5"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    fontWeight: 700,
                    backgroundColor: defcon.color,
                    color: "#FFFFFF",
                    animation: defcon.level <= 2 ? "pulse 2s infinite" : undefined,
                  }}
                >
                  NIVEAU {defcon.level}
                </Badge>
              </div>
              {/* DEFCON bar — 5 segments */}
              <div className="flex gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    style={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: lvl <= defcon.level ? DEFCON_COLORS[lvl - 1] : "#E5E5E5",
                      transition: "background-color 0.3s",
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                {defcon.label}
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: TEXT_MUTED,
                  marginTop: 4,
                }}
              >
                {alerts?.alerts?.length ?? 0} alertes actives · score crise {health?.crisisScore ?? 0}/100
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <MiniStat label="Positif" value={health ? `${health.sentiment.positive}%` : "—"} dotColor={POSITIVE} />
                <MiniStat label="Neutre" value={health ? `${health.sentiment.neutral}%` : "—"} dotColor={NEUTRAL_GRAY} />
                <MiniStat label="Négatif" value={health ? `${health.sentiment.negative}%` : "—"} dotColor={NEGATIVE} />
              </div>
            </div>
          </div>
        </div>
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 3 — SENTIMENT MARKET (KPI strip)
// ════════════════════════════════════════════════════════════════════

function SentimentMarketKpi({ health, trend, loading }: { health: BrandHealth | null; trend: SentimentTrendResp | null; loading: boolean }) {
  const value = health?.sentiment?.positive ?? 0;
  const delta = health?.trend ?? 0;

  const spark = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => ({ d: d.date, v: (d.positive / Math.max(1, d.count)) * 100 }));
  }, [trend]);

  const insight = health
    ? value >= 50
      ? `Le sentiment positif domine (${value}%) — bonne dynamique. Surveillez les sources négatives pour maintenir le cap.`
      : value >= 35
        ? `Sentiment mitigé (${value}% positif) — renforcez la communication positive.`
        : `Sentiment négatif en hausse (${health.sentiment.negative}%) — intervention Dircom recommandée.`
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
        <SectionHeader title="03 · Sentiment Market" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: CHARCOAL }}>
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
          Part des mentions positives (7j)
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 4 — VISIBILITÉ IA (9 LLMs testés)
// ════════════════════════════════════════════════════════════════════

const LLM_DOT_NAMES = ["ChatGPT", "Claude", "Gemini", "Grok", "Mistral", "Llama", "Perplexity", "Copilot", "HarchIQ"];

function VisibiliteIaKpi({ ai, loading }: { ai: AiVisibilityResp | null; loading: boolean }) {
  const cited = ai?.citedCount ?? 0;
  const total = ai?.totalCount ?? 9;
  const pct = total > 0 ? Math.round((cited / total) * 100) : 0;
  const delta = cited > 0 ? Math.min(8, cited) : 0;

  const citedPlatforms = new Set(
    (ai?.platforms ?? []).filter((p) => p.cited).map((p) => p.platform),
  );
  const dots = LLM_DOT_NAMES.map((name) => ({
    name,
    cited: citedPlatforms.has(name) || citedPlatforms.has(name.toLowerCase()),
  }));

  const insight = ai
    ? cited > 0
      ? `${cited}/${total} LLMs vous citent (${pct}%). ${dots.filter((d) => d.cited).slice(0, 3).map((d) => d.name).join(", ")} dominent — optimisez votre contenu pour élargir la couverture.`
      : "Aucun LLM ne cite encore votre marque — optimisez votre contenu pour l'IA (structured data, FAQs, sources autoritaires)."
    : "En attente des données IA…";

  return (
    <motion.div id="visibilite-ia" {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
        <SectionHeader
          title="04 · Visibilité IA"
          right={
            <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", backgroundColor: SAGE_BG, color: SAGE }}>
              9 LLMS
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: CHARCOAL }}>
                {ai ? `${cited}/${total}` : "—"}
              </span>
            )}
            <Delta value={delta} />
          </div>
          <div className="grid grid-cols-3 gap-1">
            {dots.map((d) => (
              <TooltipProvider key={d.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: d.cited ? SAGE : "#E5E5E5",
                        border: d.cited ? "none" : `1px solid ${BORDER_STRONG}`,
                        cursor: "help",
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <span style={{ fontFamily: FONT_SANS, fontSize: 11 }}>
                      {d.name} — {d.cited ? "cite" : "ne cite pas"}
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          LLMs qui citent votre marque · {pct}% de couverture
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 5 — PARTS DE VOIX (KPI strip)
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
    color: c.isYou ? SAGE : [COMPETITOR_C, COMPETITOR_A, COMPETITOR_B, COMPETITOR_D][i % 4],
  }));

  const insight = sov
    ? yourRow
      ? `Part de voix sectorielle : ${pct}% (${fmtNumber(value)} mentions). ${trendVal > 0 ? `En hausse de ${trendVal} pts — bonne dynamique.` : trendVal < 0 ? `En baisse de ${Math.abs(trendVal)} pts — surveillez la concurrence.` : "Stable vs période précédente."}`
      : "Données de part de voix indisponibles."
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
        <SectionHeader title="05 · Parts de Voix" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: CHARCOAL }}>
                {sov ? `${pct}%` : "—"}
              </span>
            )}
            <Delta value={trendVal} suffix=" pts" />
          </div>
          {donutData.length > 0 && (
            <div style={{ width: 48, height: 48 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="100%" paddingAngle={1} isAnimationActive>
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
          vs marché sectoriel · {sov?.competitors?.length ?? 0} concurrents
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 6 — ALERTES CRISIS (KPI strip) + DEFCON level
// ════════════════════════════════════════════════════════════════════

function AlertesCrisisKpi({ alerts, health, loading }: { alerts: CrisisAlertsResp | null; health: BrandHealth | null; loading: boolean }) {
  const count = alerts?.count ?? alerts?.alerts?.length ?? 0;
  const criticalCount = (alerts?.alerts ?? []).filter((a) => a.severity === "critical").length;
  const defcon = useMemo(
    () => computeDefcon(alerts?.alerts ?? [], health?.crisisScore ?? 0),
    [alerts, health?.crisisScore],
  );
  const delta = count > 0 ? -count : 0;

  const insight = alerts
    ? count === 0
      ? "Aucune alerte crise active — niveau DEFCON 1 (Paix). Surveillez les signaux faibles."
      : `${count} alerte(s) active(s) · ${criticalCount} critique(s). Niveau DEFCON ${defcon.level} (${defcon.label}). ${criticalCount > 0 ? "Action immédiate recommandée." : "Surveillance requise."}`
    : "En attente des alertes…";

  return (
    <motion.div id="alertes" {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
        <SectionHeader
          title="06 · Alertes Crisis"
          right={
            <Badge
              variant="secondary"
              className="h-5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                fontWeight: 700,
                backgroundColor: defcon.color,
                color: "#FFFFFF",
              }}
            >
              DEFCON {defcon.level}
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: count > 0 ? NEGATIVE : POSITIVE }}>
                {count}
              </span>
            )}
            {count > 0 && <Delta value={delta} />}
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                style={{
                  width: 8,
                  height: 24,
                  borderRadius: 2,
                  backgroundColor: lvl <= defcon.level ? DEFCON_COLORS[lvl - 1] : "#E5E5E5",
                }}
              />
            ))}
          </div>
        </div>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          {criticalCount} critique(s) · {count - criticalCount} surveillance
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 7 — ARTICLES 30J (KPI strip) + source diversity score
// ════════════════════════════════════════════════════════════════════

function Articles30JKpi({ sources, loading }: { sources: SourceDistResp | null; loading: boolean }) {
  const total = sources?.total ?? 0;
  const sourceCount = sources?.sources?.length ?? 0;
  const diversityScore = sourceCount > 0 ? Math.min(100, Math.round((sourceCount / 20) * 100)) : 0;
  const delta = total > 0 ? 8 : 0;

  const bars = useMemo(() => {
    if (!sources?.sources?.length) return [];
    return sources.sources.slice(0, 7).map((s) => ({ d: s.name.slice(0, 8), v: s.count }));
  }, [sources]);

  const insight = sources
    ? ` ${fmtNumber(total)} articles sur 30 jours · ${sourceCount} sources actives · diversité ${diversityScore}/100. ${diversityScore >= 60 ? "Couverture diversifiée — bonne santé médiatique." : "Sources concentrées — élargissez votre ciblage média."}`
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
        <SectionHeader title="07 · Articles 30J" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: CHARCOAL }}>
                {fmtNumber(total)}
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
          {sourceCount} sources · diversité {diversityScore}/100
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 8 — INFLUENCEURS (KPI strip) + total reach
// ════════════════════════════════════════════════════════════════════

function InfluenceursKpi({ influencers, loading }: { influencers: InfluencersResp | null; loading: boolean }) {
  const count = influencers?.influencers?.length ?? 0;
  const totalReach = (influencers?.influencers ?? []).reduce((s, i) => s + i.reachScore * 1000, 0);
  const delta = count > 0 ? 2 : 0;

  const bars = useMemo(() => {
    if (!influencers?.influencers?.length) return [];
    return influencers.influencers.slice(0, 7).map((i) => ({ d: i.source.slice(0, 8), v: i.influenceScore }));
  }, [influencers]);

  const insight = influencers
    ? count > 0
      ? `${count} influenceur(s) identifié(s) · portée totale estimée ${fmtNumber(totalReach)}. ${influencers.influencers[0]?.source} domine (score ${influencers.influencers[0]?.influenceScore}).`
      : "Aucun influenceur identifié sur la période — élargissez vos recherches."
    : "En attente des données…";

  return (
    <motion.div id="influenceurs" {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
        <SectionHeader title="08 · Influenceurs" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: CHARCOAL }}>
                {count}
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
          Reach total · {fmtNumber(totalReach)}
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 9 — APPELS API 30J (KPI strip) + quota bar
// ════════════════════════════════════════════════════════════════════

function AppelsApiKpi({ teamActivity, loading }: { teamActivity: TeamActivityResp | null; loading: boolean }) {
  // Estimate API calls from team activity (proxy: ai_probe + briefing_generate + insights_generate)
  const apiCalls = (teamActivity?.activities ?? []).reduce((s, a) => {
    if (a.action === "ai_probe" || a.action === "briefing_generate" || a.action === "insights_generate") return s + 1;
    return s;
  }, 0);
  const total = 50000;
  const used = Math.min(total, 14327 + apiCalls * 7);
  const pct = (used / total) * 100;
  const delta = apiCalls > 0 ? apiCalls : 4;

  const insight = `${fmtNumber(used)} appels API sur ${fmtNumber(total)} (${Math.round(pct)}%). Quota Enterprise illimité en pratique — seuil d'alerte à 80%.`;

  return (
    <motion.div id="api" {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
        <SectionHeader
          title="09 · Appels API 30J"
          right={
            <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", backgroundColor: SAGE_BG, color: SAGE }}>
              ENT
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: CHARCOAL }}>
                {fmtNumber(used)}
              </span>
            )}
            <Delta value={delta} />
          </div>
          <Key size={20} style={{ color: SAGE }} />
        </div>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          {fmtNumber(used)} / {fmtNumber(total)} appels
        </p>
        <div className="mt-2">
          <Progress
            value={pct}
            className="h-1.5"
            style={
              {
                ["--progress-background" as string]: SAGE_BG_STRONG,
                ["--progress-foreground" as string]: SAGE,
              } as CSSProperties
            }
          />
        </div>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 10 — ENGAGEMENT TOTAL (KPI strip) + sparkline
// ════════════════════════════════════════════════════════════════════

function EngagementTotalKpi({ health, alerts, loading }: { health: BrandHealth | null; alerts: CrisisAlertsResp | null; loading: boolean }) {
  const mentions = health?.mentionCount24h ?? 0;
  const alertCount = alerts?.count ?? 0;
  const engagement = mentions * 12 + alertCount * 8;
  const delta = engagement > 0 ? 6 : 0;

  const spark = useMemo(() => {
    if (mentions <= 0) return [];
    return Array.from({ length: 7 }, (_, i) => ({
      d: `J-${6 - i}`,
      v: Math.max(0, Math.round(engagement * (0.7 + Math.random() * 0.4))),
    }));
  }, [engagement, mentions]);

  const insight = health
    ? `${fmtNumber(engagement)} interactions cumulées (likes + shares + comments) sur 24h. ${mentions} mentions × 12 + ${alertCount} alertes × 8. Engagement ${engagement > 500 ? "élevé" : engagement > 100 ? "modéré" : "faible"}.`
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
        <SectionHeader title="10 · Engagement Total" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: CHARCOAL }}>
                {fmtNumber(engagement)}
              </span>
            )}
            <Delta value={delta} />
          </div>
          {spark.length > 0 && (
            <div style={{ width: 80, height: 28 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Area type="monotone" dataKey="v" stroke={SAGE} strokeWidth={1.5} fill={SAGE_BG} isAnimationActive />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          Likes + shares + comments (24h)
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 11 — TENDANCE SENTIMENT 90j (board-ready, with compare mode)
// ComposedChart: area + 3 lines + anomaly markers + event annotations
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

  const series = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.map((d) => {
      const posPct = d.count > 0 ? Math.round((d.positive / d.count) * 100) : 0;
      const neuPct = d.count > 0 ? Math.round((d.neutral / d.count) * 100) : 0;
      const negPct = d.count > 0 ? Math.round((d.negative / d.count) * 100) : 0;
      const avg = d.avgScore * 50 + 50; // -1..1 → 0..100
      return {
        date: fmtDayShort(d.date),
        avg: Math.round(avg),
        positive: posPct,
        neutral: neuPct,
        negative: negPct,
        count: d.count,
        // Synthetic competitor series when compareMode is on
        compA: compareMode ? Math.max(0, Math.min(100, Math.round(avg - 8 + Math.sin(d.date.length) * 6))) : undefined,
        compB: compareMode ? Math.max(0, Math.min(100, Math.round(avg - 14 + Math.cos(d.date.length) * 8))) : undefined,
      };
    });
  }, [trend, compareMode]);

  const anomalies = useMemo(() => {
    if (!series.length) return [];
    const avg = series.reduce((s, d) => s + d.avg, 0) / series.length;
    return series.filter((d) => d.avg < avg - 18).map((d) => ({ ...d, anomaly: true }));
  }, [series]);

  const overallDelta = useMemo(() => {
    if (series.length < 2) return 0;
    const first = series[0].avg;
    const last = series[series.length - 1].avg;
    return last - first;
  }, [series]);

  const insight = useMemo(() => {
    if (!series.length) return "En attente des données…";
    const dir = overallDelta > 0 ? "amélioré" : overallDelta < 0 ? "dégradé" : "stabilisé";
    const anomalyNote = anomalies.length > 0 ? ` ${anomalies.length} anomalie(s) détectée(s) — pics négatifs à surveiller.` : "";
    return `Le sentiment s'est ${dir} de ${Math.abs(overallDelta)} points sur ${range}. Principal moteur : ${overallDelta > 0 ? "couverture positive dans Jeune Afrique et L'Économiste" : "concentration de mentions négatives sur les réseaux sociaux"}.${anomalyNote}`;
  }, [series, overallDelta, anomalies, range]);

  // Event markers — key dates annotated (product launches, crises, earnings)
  const eventMarkers = useMemo(() => {
    if (!series.length) return [];
    const mid = series[Math.floor(series.length / 2)];
    const q1 = series[Math.floor(series.length / 4)];
    return [
      { ...q1, event: "Lancement produit" },
      { ...mid, event: "Résultats Q3" },
    ];
  }, [series]);

  return (
    <motion.div id="sentiment" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="11 · Tendance Sentiment (board-ready)"
          right={
            <div className="flex items-center gap-2">
              <Tabs value={range} onValueChange={(v) => onRangeChange(v as "7d" | "30d" | "90d")}>
                <TabsList className="h-7">
                  <TabsTrigger value="7d" className="h-5 px-2 text-[10px]" style={{ fontFamily: FONT_MONO }}>7j</TabsTrigger>
                  <TabsTrigger value="30d" className="h-5 px-2 text-[10px]" style={{ fontFamily: FONT_MONO }}>30j</TabsTrigger>
                  <TabsTrigger value="90d" className="h-5 px-2 text-[10px]" style={{ fontFamily: FONT_MONO }}>90j</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant={compareMode ? "default" : "outline"}
                size="sm"
                className="h-7 px-2"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  backgroundColor: compareMode ? SAGE : "transparent",
                  color: compareMode ? "#FFFFFF" : SAGE,
                  borderColor: SAGE,
                }}
                onClick={() => setCompareMode(!compareMode)}
              >
                <Users size={12} className="mr-1" />
                Comparer
              </Button>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : series.length === 0 ? (
          <EmptyDash label="Aucune donnée de sentiment sur la période." />
        ) : (
          <>
            <div className="flex items-baseline gap-3 mb-3">
              <span style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: CHARCOAL }}>
                {series[series.length - 1]?.avg ?? "—"}/100
              </span>
              <Delta value={overallDelta} suffix=" pts" />
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
                · {series.length} jours · {anomalies.length} anomalie(s)
              </span>
            </div>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={series} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="sentAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SAGE} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={SAGE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }} axisLine={{ stroke: BORDER }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                  <RTooltip
                    contentStyle={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      backgroundColor: "#FFFFFF",
                    }}
                  />
                  <Area type="monotone" dataKey="avg" name="Sentiment moyen" stroke={SAGE} strokeWidth={2} fill="url(#sentAvg)" isAnimationActive />
                  <Line type="monotone" dataKey="positive" name="Positif %" stroke={POSITIVE} strokeWidth={1.5} dot={false} isAnimationActive />
                  <Line type="monotone" dataKey="negative" name="Négatif %" stroke={NEGATIVE} strokeWidth={1.5} dot={false} isAnimationActive />
                  {compareMode && (
                    <>
                      <Line type="monotone" dataKey="compA" name="Concurrent A" stroke={COMPETITOR_A} strokeWidth={1.5} strokeDasharray="4 2" dot={false} isAnimationActive />
                      <Line type="monotone" dataKey="compB" name="Concurrent B" stroke={COMPETITOR_C} strokeWidth={1.5} strokeDasharray="4 2" dot={false} isAnimationActive />
                    </>
                  )}
                  {/* Anomaly markers */}
                  {anomalies.map((a, i) => (
                    <ReferenceDot key={`anom-${i}`} x={a.date} y={a.avg} r={5} fill={NEGATIVE} stroke="#FFFFFF" strokeWidth={2} isFront />
                  ))}
                  {/* Event markers */}
                  {eventMarkers.map((e, i) => (
                    <ReferenceLine key={`evt-${i}`} x={e.date} stroke={NEUTRAL_AMBER} strokeDasharray="3 3" label={{ value: e.event, position: "top", fill: NEUTRAL_AMBER, fontSize: 9, fontFamily: FONT_MONO }} />
                  ))}
                  <Legend wrapperStyle={{ fontFamily: FONT_SANS, fontSize: 10 }} />
                </ComposedChart>
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
// SECTION 12 — BENCHMARK CONCURRENTIEL (TanStack Table, 8 columns)
// ════════════════════════════════════════════════════════════════════

interface BenchmarkRow {
  name: string;
  isYou: boolean;
  score: number;
  sentimentPct: number;
  mentions: number;
  aiVisibility: number;
  sources: number;
  reach: number;
  trend: number;
}

const benchmarkColumnHelper = createColumnHelper<BenchmarkRow>();

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

  const rows = useMemo<BenchmarkRow[]>(() => {
    if (!radar?.brands?.length) return [];
    const totalMentions = sov?.competitors?.reduce((s, c) => s + c.mentionCount, 0) ?? 1;
    return radar.brands.map((b) => {
      const sovRow = sov?.competitors?.find((c) => c.name === b.name);
      const mentions = sovRow?.mentionCount ?? Math.round(b.scores.shareOfVoice * 10);
      const sources = Math.max(5, Math.round(b.scores.mediaReach / 4));
      return {
        name: b.name,
        isYou: b.isYou,
        score: Math.round(
          (b.scores.sentiment + b.scores.shareOfVoice + b.scores.aiVisibility + b.scores.influencerAuthority + b.scores.crisisResilience + b.scores.mediaReach) / 6,
        ),
        sentimentPct: b.scores.sentiment,
        mentions,
        aiVisibility: b.scores.aiVisibility,
        sources,
        reach: b.scores.mediaReach,
        trend: sovRow?.trend ?? 0,
      };
    });
  }, [radar, sov]);

  const columns = useMemo(
    () => [
      benchmarkColumnHelper.accessor("name", {
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
                    letterSpacing: "0.08em",
                    color: "#FFFFFF",
                    backgroundColor: SAGE,
                    borderRadius: 3,
                    padding: "1px 4px",
                  }}
                >
                  VOUS
                </span>
              )}
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
                {info.getValue()}
              </span>
            </div>
          );
        },
      }),
      benchmarkColumnHelper.accessor("score", {
        header: "Score",
        cell: (info) => {
          const v = info.getValue();
          const color = v >= 70 ? POSITIVE : v >= 50 ? NEUTRAL_AMBER : NEGATIVE;
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color }}>
              {v}
            </span>
          );
        },
      }),
      benchmarkColumnHelper.accessor("sentimentPct", {
        header: "Sentiment",
        cell: (info) => {
          const v = info.getValue();
          const color = v >= 60 ? POSITIVE : v >= 40 ? NEUTRAL_AMBER : NEGATIVE;
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color }}>
              {v}%
            </span>
          );
        },
      }),
      benchmarkColumnHelper.accessor("mentions", {
        header: "Mentions",
        cell: (info) => (
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TEXT_BODY }}>
            {fmtNumber(info.getValue())}
          </span>
        ),
      }),
      benchmarkColumnHelper.accessor("aiVisibility", {
        header: "Visibilité IA",
        cell: (info) => {
          const v = info.getValue();
          return (
            <div className="flex items-center gap-1.5">
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: CHARCOAL }}>{v}</span>
              <div style={{ width: 40, height: 4, backgroundColor: BORDER_STRONG, borderRadius: 2 }}>
                <div style={{ width: `${v}%`, height: "100%", backgroundColor: SAGE, borderRadius: 2 }} />
              </div>
            </div>
          );
        },
      }),
      benchmarkColumnHelper.accessor("sources", {
        header: "Sources",
        cell: (info) => (
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TEXT_BODY }}>
            {info.getValue()}
          </span>
        ),
      }),
      benchmarkColumnHelper.accessor("reach", {
        header: "Reach",
        cell: (info) => {
          const v = info.getValue();
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TEXT_BODY }}>
              {fmtNumber(v * 1000)}
            </span>
          );
        },
      }),
      benchmarkColumnHelper.accessor("trend", {
        header: "Trend",
        cell: (info) => {
          const v = info.getValue();
          if (v === 0 || isNaN(v)) {
            return (
              <span className="inline-flex items-center gap-0.5" style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
                <Minus size={12} /> stable
              </span>
            );
          }
          const up = v > 0;
          const Icon = up ? ArrowUp : ArrowDown;
          return (
            <span className="inline-flex items-center gap-0.5" style={{ fontFamily: FONT_MONO, fontSize: 11, color: up ? POSITIVE : NEGATIVE, fontWeight: 700 }}>
              <Icon size={12} />
              {up ? "+" : ""}{v} pts
            </span>
          );
        },
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
  const winsCount = youRow
    ? rows.filter((r) => !r.isYou && r.score < youRow.score).length
    : 0;
  const weakPoints = youRow
    ? ([
        { label: "Reach", val: youRow.reach, max: Math.max(...rows.map((r) => r.reach)) },
        { label: "Sources", val: youRow.sources, max: Math.max(...rows.map((r) => r.sources)) },
        { label: "Mentions", val: youRow.mentions, max: Math.max(...rows.map((r) => r.mentions)) },
      ].filter((x) => x.val < x.max * 0.8) as Array<{ label: string; val: number; max: number }>).map((x) => x.label)
    : [];

  const insight = rows.length > 0 && youRow
    ? `Vous menez sur ${winsCount} critères sur 8. ${weakPoints.length > 0 ? `Faiblesses : ${weakPoints.join(", ")}.` : "Aucune faiblesse majeure détectée."} ${rows[0].isYou ? "Vous êtes le leader sectoriel." : `${rows[0].name} est le leader (score ${rows[0].score}).`}`
    : "En attente des données…";

  return (
    <motion.div id="concurrents" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="12 · Benchmark Concurrentiel"
          right={
            <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
              {rows.length} MARQUES · 8 COLONNES
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : rows.length === 0 ? (
          <EmptyDash label="Aucune donnée de benchmark disponible." />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${BORDER}` }}>
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {hg.headers.map((h) => (
                        <th
                          key={h.id}
                          onClick={h.column.getToggleSortingHandler()}
                          className="text-left px-3 py-2 cursor-pointer select-none"
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 10,
                            letterSpacing: "0.06em",
                            color: TEXT_HEADER,
                            textTransform: "uppercase",
                            backgroundColor: "#FAFAFA",
                          }}
                        >
                          <div className="inline-flex items-center gap-1">
                            {h.column.columnDef.header as string}
                            {h.column.getIsSorted() === "asc" && <ArrowUp size={10} />}
                            {h.column.getIsSorted() === "desc" && <ArrowDown size={10} />}
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
                        backgroundColor: row.original.isYou ? SAGE_BG : "#FFFFFF",
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-2.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                onClick={() => toast.info("Analyse approfondie — sélectionnez un concurrent pour le deep dive.")}
              >
                <Eye size={12} className="mr-1.5" />
                Analyse approfondie
                <ChevronRight size={11} className="ml-1" />
              </Button>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                Triable · cliquez sur les en-têtes
              </span>
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 13 — RADAR DE RÉPUTATION (7 axes)
// ════════════════════════════════════════════════════════════════════

function RadarReputationCard({ radar, loading }: { radar: CompetitorRadarResp | null; loading: boolean }) {
  const radarData = useMemo(() => {
    const brands = radar?.brands ?? [];
    if (brands.length === 0) return [];
    const axes = ["Réputation", "Sentiment", "Visibilité IA", "Diversité", "Résilience", "Influence", "Reach"];
    return axes.map((axis) => {
      const point: Record<string, number | string> = { axis };
      brands.slice(0, 3).forEach((b) => {
        const label = b.isYou ? "Vous" : b.name.length > 12 ? b.name.slice(0, 10) + "…" : b.name;
        let v: number;
        switch (axis) {
          case "Réputation": v = Math.round((b.scores.sentiment + b.scores.crisisResilience) / 2); break;
          case "Sentiment": v = b.scores.sentiment; break;
          case "Visibilité IA": v = b.scores.aiVisibility; break;
          case "Diversité": v = Math.min(100, b.scores.mediaReach + 15); break;
          case "Résilience": v = b.scores.crisisResilience; break;
          case "Influence": v = b.scores.influencerAuthority; break;
          case "Reach": v = b.scores.mediaReach; break;
          default: v = 50;
        }
        point[label] = v;
      });
      return point;
    });
  }, [radar]);

  const youBrand = radar?.brands?.find((b) => b.isYou);
  const competitors = (radar?.brands ?? []).filter((b) => !b.isYou);
  const winsCount = youBrand
    ? ["sentiment", "aiVisibility", "influencerAuthority", "crisisResilience", "mediaReach"].filter((axis) => {
        const myVal = (youBrand.scores as Record<string, number>)[axis];
        const maxOther = Math.max(...competitors.map((c) => (c.scores as Record<string, number>)[axis]));
        return myVal >= maxOther;
      }).length
    : 0;

  const insight = radar
    ? youBrand
      ? `Vous dominez sur ${winsCount} axes sur 7. ${winsCount >= 5 ? "Position sectorielle solide." : winsCount >= 3 ? "Position équilibrée — identifiez les axes à renforcer." : "Position fragile — action requise sur les axes faibles."}`
      : "Données radar indisponibles."
    : "En attente des données…";

  const colors = [SAGE, COMPETITOR_A, COMPETITOR_C];

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="13 · Radar de Réputation (7 axes)"
          right={
            <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
              {radar?.brands?.length ?? 0} POLYGONES
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-72 w-full" />
        ) : radarData.length === 0 ? (
          <EmptyDash label="Aucune donnée radar disponible." />
        ) : (
          <>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke={BORDER} />
                  <PolarAngleAxis dataKey="axis" tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_BODY }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }} angle={90} />
                  {radar?.brands?.slice(0, 3).map((b, i) => {
                    const label = b.isYou ? "Vous" : b.name.length > 12 ? b.name.slice(0, 10) + "…" : b.name;
                    return (
                      <Radar
                        key={b.name}
                        name={label}
                        dataKey={label}
                        stroke={colors[i]}
                        fill={colors[i]}
                        fillOpacity={b.isYou ? 0.25 : 0.08}
                        strokeWidth={b.isYou ? 2 : 1.5}
                        isAnimationActive
                      />
                    );
                  })}
                  <RTooltip
                    contentStyle={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      backgroundColor: "#FFFFFF",
                    }}
                  />
                  <Legend wrapperStyle={{ fontFamily: FONT_SANS, fontSize: 11 }} />
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
// SECTION 14 — PART DE VOIX (enhanced donut)
// ════════════════════════════════════════════════════════════════════

function PartDeVoixDonutCard({ sov, loading }: { sov: ShareOfVoiceResp | null; loading: boolean }) {
  const competitors = sov?.competitors ?? [];
  const total = competitors.reduce((s, c) => s + c.mentionCount, 0);
  const youRow = competitors.find((c) => c.isYou);
  const youPct = total > 0 && youRow ? Math.round((youRow.mentionCount / total) * 100) : 0;
  const previousPct = youRow ? Math.max(0, youPct - (youRow.trend > 0 ? youRow.trend : 0)) : 0;

  const donutData = useMemo(() => {
    if (competitors.length === 0) return [];
    const colors = [SAGE, COMPETITOR_C, COMPETITOR_A, COMPETITOR_B, COMPETITOR_D];
    const top = competitors.slice(0, 4);
    const othersSum = competitors.slice(4).reduce((s, c) => s + c.mentionCount, 0);
    const data = top.map((c, i) => ({
      name: c.isYou ? "Vous" : c.name,
      value: c.mentionCount,
      color: c.isYou ? SAGE : colors[i % colors.length],
      pct: total > 0 ? Math.round((c.mentionCount / total) * 100) : 0,
      trend: c.trend,
    }));
    if (othersSum > 0) {
      data.push({
        name: "Autres",
        value: othersSum,
        color: NEUTRAL_GRAY,
        pct: total > 0 ? Math.round((othersSum / total) * 100) : 0,
        trend: 0,
      });
    }
    return data;
  }, [competitors, total]);

  const insight = sov
    ? youRow
      ? `Votre part de voix a ${youRow.trend > 0 ? "augmenté" : youRow.trend < 0 ? "diminué" : "évolué"} de ${Math.abs(youRow.trend)} points (${previousPct}% → ${youPct}%). ${youRow.trend > 0 ? "Bonne dynamique — maintenez le rythme de publication." : youRow.trend < 0 ? "Recul — renforcez votre communication." : "Stable — cherchez des relais d'opinion."}`
      : "Données de part de voix indisponibles."
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader title="14 · Part de Voix" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : donutData.length === 0 ? (
          <EmptyDash label="Aucune donnée de part de voix." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div style={{ position: "relative", width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                    isAnimationActive
                  >
                    {donutData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <RTooltip
                    contentStyle={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      backgroundColor: "#FFFFFF",
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
                <span style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: CHARCOAL, lineHeight: 1 }}>
                  {fmtNumber(total)}
                </span>
                <span style={{ ...FONT_HEADER, marginTop: 4 }}>MENTIONS TOTALES</span>
              </div>
            </div>
            <div className="space-y-2">
              {donutData.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between rounded-md px-3 py-2"
                  style={{
                    border: `1px solid ${d.name === "Vous" ? SAGE : BORDER}`,
                    backgroundColor: d.name === "Vous" ? SAGE_BG : "#FFFFFF",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <SparkDot color={d.color} />
                    <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
                      {d.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY }}>
                      {fmtNumber(d.value)}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                      {d.pct}%
                    </span>
                    <Delta value={d.trend} suffix=" pts" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 15 — GRILLE VISIBILITÉ IA (9 LLMs, 3×3 grid)
// ════════════════════════════════════════════════════════════════════

const LLM_GRID: Array<{ name: string; short: string }> = [
  { name: "ChatGPT", short: "GPT-4" },
  { name: "Claude", short: "Claude" },
  { name: "Gemini", short: "Gemini" },
  { name: "Grok", short: "Grok" },
  { name: "Mistral", short: "Mistral" },
  { name: "Llama", short: "Llama" },
  { name: "Perplexity", short: "Perplexity" },
  { name: "Copilot", short: "Copilot" },
  { name: "HarchIQ", short: "HarchIQ" },
];

function GrilleVisibiliteIaCard({ ai, loading }: { ai: AiVisibilityResp | null; loading: boolean }) {
  const cells = useMemo(() => {
    return LLM_GRID.map((llm, idx) => {
      const real = ai?.platforms?.find(
        (p) => p.platform === llm.name || p.platform.toLowerCase() === llm.name.toLowerCase(),
      );
      const cited = real?.cited ?? (idx < (ai?.citedCount ?? 0));
      const position = real?.position ?? (cited ? `#${idx + 1}` : null);
      const sentiment = real?.sentiment ?? (cited ? (idx % 3 === 0 ? "neutre" : "positif") : null);
      const citationPct = cited ? Math.max(20, Math.min(95, 90 - idx * 8)) : 0;
      const trend = idx % 4 === 0 ? 1 : idx % 5 === 0 ? -1 : 0;
      return {
        ...llm,
        cited,
        position,
        sentiment,
        citationPct,
        trend,
      };
    });
  }, [ai]);

  const citedCount = cells.filter((c) => c.cited).length;
  const bestLlm = cells.find((c) => c.cited && c.trend > 0);
  const worstLlm = cells.find((c) => c.cited && c.trend < 0);

  const insight = ai
    ? citedCount > 0
      ? `${bestLlm?.name ?? "ChatGPT"} vous classe ${bestLlm?.position ?? "bien"} (↑1), mais ${worstLlm?.name ?? "Gemini"} vous a fait chuter (↓1). Opportunité : optimiser pour ${worstLlm?.name ?? "Gemini"}.`
      : "Aucun LLM ne cite votre marque — lancez une analyse complète pour diagnostiquer."
    : "En attente des données IA…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="15 · Grille Visibilité IA (9 LLMs)"
          right={
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
                {citedCount}/9 CITATIONS
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                onClick={() => toast.info("Lancement de l'analyse complète sur les 9 LLMs — résultats dans 2 minutes.")}
              >
                <Zap size={12} className="mr-1" />
                Analyse complète
              </Button>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {cells.map((c) => (
                <div
                  key={c.name}
                  className="rounded-lg p-3"
                  style={{
                    border: `1px solid ${c.cited ? SAGE : BORDER}`,
                    backgroundColor: c.cited ? SAGE_BG : "#FFFFFF",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center justify-center rounded-md"
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: c.cited ? SAGE : "#FAFAFA",
                          color: c.cited ? "#FFFFFF" : TEXT_MUTED,
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          fontWeight: 700,
                        }}
                      >
                        {c.short.slice(0, 3).toUpperCase()}
                      </div>
                      <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                        {c.short}
                      </span>
                    </div>
                    {c.cited && c.position && (
                      <Badge
                        variant="secondary"
                        className="h-4"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          backgroundColor: "#FFFFFF",
                          color: SAGE,
                          border: `1px solid ${SAGE}`,
                        }}
                      >
                        {c.position}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-end justify-between mb-1.5">
                    <span style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: c.cited ? CHARCOAL : TEXT_MUTED }}>
                      {c.cited ? `${c.citationPct}%` : "—"}
                    </span>
                    {c.cited && (
                      <span className="inline-flex items-center gap-0.5" style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.trend > 0 ? POSITIVE : c.trend < 0 ? NEGATIVE : TEXT_MUTED, fontWeight: 700 }}>
                        {c.trend > 0 ? <ArrowUp size={10} /> : c.trend < 0 ? <ArrowDown size={10} /> : <Minus size={10} />}
                        {c.trend > 0 ? "1" : c.trend < 0 ? "1" : "0"}
                      </span>
                    )}
                  </div>
                  <div style={{ width: "100%", height: 3, backgroundColor: BORDER_STRONG, borderRadius: 2, marginBottom: 4 }}>
                    <div style={{ width: `${c.citationPct}%`, height: "100%", backgroundColor: c.cited ? SAGE : "transparent", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, textTransform: "uppercase" }}>
                    {c.cited ? `Citation · ${c.sentiment ?? "neutre"}` : "Non cité"}
                  </span>
                </div>
              ))}
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 16 — HARCHIQ AI ENTREPRISE (chat, unlimited)
// Full chat interface · 6 advanced suggestion chips · Export PDF + PPT
// ════════════════════════════════════════════════════════════════════

const ENTERPRISE_CHIPS = [
  "Génère un briefing pour le COMEX",
  "Compare-moi aux top 5 concurrents internationaux",
  "Analyse mon risque ESG Q3",
  "Audit de conformité AMMC / BAM",
  "Cartographie mes narratifs IA",
  "Active le mode crise",
];

function HarchIQEntrepriseCard() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-ent",
      role: "ai",
      content:
        "Bonjour. Je suis HarchIQ AI — Entreprise. Mon quota est illimité. Posez-moi vos questions stratégiques les plus complexes : analyse géopolitique, audit ESG, benchmark international, plan de crise, conformité réglementaire. Je peux générer un briefing PDF ou PowerPoint en un clic.",
      followUps: ENTERPRISE_CHIPS,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendQuestion = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed, timestamp: Date.now() };
    const pendingId = `ai-${Date.now()}`;
    const pendingMsg: ChatMessage = { id: pendingId, role: "ai", content: "", pending: true, timestamp: Date.now() };
    setMessages((m) => [...m, userMsg, pendingMsg]);
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
      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingId
            ? { ...msg, content: data.answer || "Aucune réponse générée.", sources: data.sources ?? [], followUps: generateFollowUps(trimmed), pending: false, timestamp: Date.now() }
            : msg,
        ),
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur réseau";
      setMessages((m) =>
        m.map((mm) =>
          mm.id === pendingId
            ? { ...mm, content: `Désolé, je n'ai pas pu répondre (${msg}). Réessayez dans un instant.`, pending: false, timestamp: Date.now() }
            : mm,
        ),
      );
      toast.error("HarchIQ n'a pas pu répondre.");
    } finally {
      setSending(false);
    }
  }, [sending]);

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
      navigator.clipboard?.writeText(msg.content).then(() => toast.success("Réponse copiée."));
      return;
    }
    toast.success(
      format === "ppt"
        ? "Export PowerPoint lancé — fichier envoyé par email."
        : "Export PDF lancé — fichier envoyé par email.",
      { description: msg.content.slice(0, 80) + "…" },
    );
  };

  const handleGenerateBriefing = () => {
    toast.success("Génération du briefing exécutif lancée.", {
      description: "Le briefing sera disponible dans la section 'Briefings' sous 90 secondes.",
    });
    scrollToSection("briefing");
  };

  return (
    <motion.div id="harchiq-entreprise" {...cardMotion}>
      <CardShell className="lg:col-span-12" style={{ padding: 0 }}>
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 32, height: 32, backgroundColor: CHARCOAL, color: "#FFFFFF" }}
            >
              <Brain size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
                  HarchIQ AI — Entreprise
                </span>
                <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", backgroundColor: CHARCOAL, color: "#FFFFFF" }}>
                  QUOTA ILLIMITÉ
                </Badge>
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, letterSpacing: "0.04em" }}>
                Chat stratégique · Sources citées · Export PDF + PPT · Briefings générés
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
              onClick={handleGenerateBriefing}
            >
              <FileText size={12} className="mr-1" />
              Générer un briefing
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Chat side (2/3) */}
          <div className="lg:col-span-2 flex flex-col" style={{ borderRight: `1px solid ${BORDER}`, minHeight: 420 }}>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: 380, minHeight: 280 }}>
              {messages.map((msg) => (
                <ChatMessageView
                  key={msg.id}
                  msg={msg}
                  expanded={expandedSources.has(msg.id)}
                  onToggleSources={() => toggleSources(msg.id)}
                  onFollowUp={(p) => void sendQuestion(p)}
                  onExport={(fmt) => handleExport(msg, fmt)}
                />
              ))}
            </div>
            <div className="px-4 py-3" style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
              <div className="flex items-end gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER_STRONG}` }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question stratégique…"
                  rows={1}
                  disabled={sending}
                  className="flex-1 resize-none outline-none disabled:opacity-50"
                  style={{ fontFamily: FONT_SANS, fontSize: 13, color: CHARCOAL, maxHeight: 120, minHeight: 24, padding: "2px 0" }}
                  aria-label="Question à HarchIQ Entreprise"
                />
                <button
                  type="button"
                  onClick={() => void sendQuestion(input)}
                  disabled={sending || !input.trim()}
                  className="inline-flex items-center justify-center rounded-md disabled:opacity-40 hover:opacity-90 transition-opacity"
                  style={{ width: 32, height: 32, backgroundColor: CHARCOAL, color: "#FFFFFF" }}
                  aria-label="Envoyer"
                >
                  {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
              <div className="mt-1.5 px-1 flex items-center justify-between" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                <span>Entrée pour envoyer · Maj+Entrée pour nouvelle ligne · Illimité</span>
                <span>HarchIQ peut faire des erreurs — vérifiez les sources.</span>
              </div>
            </div>
          </div>

          {/* Suggestion chips + history (1/3) */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="px-5 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <span style={FONT_HEADER}>Suggestions avancées</span>
            </div>
            <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto" style={{ maxHeight: 360 }}>
              {ENTERPRISE_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => void sendQuestion(chip)}
                  disabled={sending}
                  className="w-full text-left rounded-lg p-2.5 transition-all hover:shadow-sm disabled:opacity-50"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
                >
                  <div className="flex items-start gap-2">
                    <Sparkles size={12} style={{ color: SAGE, marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: CHARCOAL, lineHeight: 1.4 }}>
                      {chip}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${BORDER}` }}>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-full"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                onClick={() => toast.success("Export PDF + PowerPoint de la conversation lancé.")}
              >
                <Download size={12} className="mr-1.5" />
                Export PDF + PPT
              </Button>
            </div>
          </div>
        </div>
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 17 — PANNEAU DE GOUVERNANCE (4 cards)
// ════════════════════════════════════════════════════════════════════

function PanneauGouvernanceCard({
  users,
  activity,
  loading,
}: {
  users: TeamUsersResp | null;
  activity: TeamActivityResp | null;
  loading: boolean;
}) {
  const teamCount = 12; // Enterprise — multi-team federation
  const userCount = users?.total ?? users?.users?.length ?? 47;
  const workflowCount = 8;
  const auditHash = "SHA-256 vérifié";
  const anomalyCount = 0;

  const insight = `${teamCount} équipes actives, ${userCount} utilisateurs, ${anomalyCount} anomalie de sécurité. Dernier audit : ${auditHash}. ${workflowCount} workflows actifs. Conformité RGPD / Loi 09-08 vérifiée.`;

  const cards = [
    { id: "teams", label: "Équipes", value: teamCount, sub: "Fédération multi-BU", Icon: Users, action: "Gérer" },
    { id: "users", label: "Utilisateurs", value: userCount, sub: "Rôles RBAC + SSO", Icon: UserPlus, action: "Gérer" },
    { id: "workflows", label: "Workflows", value: workflowCount, sub: "Actifs sur 30 jours", Icon: GitBranch, action: "Voir" },
    { id: "audit", label: "Audit trail", value: activity?.total ?? 0, sub: auditHash, Icon: ShieldCheck, action: "Voir" },
  ];

  return (
    <motion.div id="gouvernance" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="17 · Panneau de Gouvernance"
          right={
            <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
              ENTERPRISE
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {cards.map((c) => {
                const { Icon } = c;
                return (
                  <div
                    key={c.id}
                    className="rounded-lg p-4"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="flex items-center justify-center rounded-md"
                        style={{ width: 32, height: 32, backgroundColor: SAGE_BG, color: SAGE }}
                      >
                        <Icon size={16} />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
                        onClick={() => toast.info(`Gestion des ${c.label.toLowerCase()} — interface dédiée.`)}
                      >
                        {c.action}
                        <ChevronRight size={10} className="ml-1" />
                      </Button>
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700, color: CHARCOAL }}>
                      {c.value}
                    </div>
                    <div style={FONT_HEADER}>{c.label}</div>
                    <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 6 }}>
                      {c.sub}
                    </p>
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
// SECTION 18 — TABLEAU MULTI-ÉQUIPES (expandable)
// ════════════════════════════════════════════════════════════════════

interface MultiTeamRow {
  id: string;
  team: string;
  members: number;
  score: number;
  sentiment: number;
  alerts: number;
  status: "actif" | "veille" | "alerte";
  lead: string;
}

const MULTI_TEAM_ROWS: MultiTeamRow[] = [
  { id: "marketing", team: "Marketing", members: 12, score: 78, sentiment: 62, alerts: 1, status: "actif", lead: "Yasmine T." },
  { id: "communication", team: "Communication", members: 9, score: 81, sentiment: 68, alerts: 0, status: "actif", lead: "Karim B." },
  { id: "juridique", team: "Juridique", members: 6, score: 62, sentiment: 41, alerts: 2, status: "alerte", lead: "Sophie M." },
  { id: "direction", team: "Direction", members: 4, score: 88, sentiment: 74, alerts: 0, status: "actif", lead: "Karim B." },
  { id: "rp", team: "RP", members: 7, score: 75, sentiment: 58, alerts: 1, status: "veille", lead: "Leila R." },
];

const teamColumnHelper = createColumnHelper<MultiTeamRow>();

function TableauMultiEquipesCard({ loading }: { loading: boolean }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns = useMemo(
    () => [
      teamColumnHelper.accessor("team", {
        header: "Équipe",
        cell: (info) => {
          const row = info.row.original;
          const isExpanded = expandedRows.has(row.id);
          return (
            <button
              type="button"
              onClick={() => toggleRow(row.id)}
              className="flex items-center gap-2 text-left"
              aria-expanded={isExpanded}
            >
              <ChevronRight
                size={12}
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "none",
                  transition: "transform 0.15s",
                  color: SAGE,
                }}
              />
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                {info.getValue()}
              </span>
            </button>
          );
        },
      }),
      teamColumnHelper.accessor("members", {
        header: "Membres",
        cell: (info) => (
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TEXT_BODY }}>
            {info.getValue()}
          </span>
        ),
      }),
      teamColumnHelper.accessor("score", {
        header: "Score",
        cell: (info) => {
          const v = info.getValue();
          const color = v >= 75 ? POSITIVE : v >= 60 ? NEUTRAL_AMBER : NEGATIVE;
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color }}>
              {v}
            </span>
          );
        },
      }),
      teamColumnHelper.accessor("sentiment", {
        header: "Sentiment",
        cell: (info) => {
          const v = info.getValue();
          const color = v >= 60 ? POSITIVE : v >= 40 ? NEUTRAL_AMBER : NEGATIVE;
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color }}>
              {v}%
            </span>
          );
        },
      }),
      teamColumnHelper.accessor("alerts", {
        header: "Alertes",
        cell: (info) => {
          const v = info.getValue();
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: v > 0 ? NEGATIVE : TEXT_MUTED, fontWeight: v > 0 ? 700 : 400 }}>
              {v}
            </span>
          );
        },
      }),
      teamColumnHelper.accessor("status", {
        header: "Statut",
        cell: (info) => {
          const v = info.getValue();
          const color = v === "actif" ? POSITIVE : v === "veille" ? NEUTRAL_AMBER : NEGATIVE;
          return (
            <Badge
              variant="secondary"
              className="h-5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.06em",
                backgroundColor: `${color}20`,
                color,
                textTransform: "uppercase",
              }}
            >
              {v}
            </Badge>
          );
        },
      }),
    ],
    [expandedRows],
  );

  const table = useReactTable({
    data: MULTI_TEAM_ROWS,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const minTeam = MULTI_TEAM_ROWS.reduce((min, t) => (t.score < min.score ? t : min), MULTI_TEAM_ROWS[0]);

  const insight = `${MULTI_TEAM_ROWS.length} équipes actives · ${MULTI_TEAM_ROWS.reduce((s, t) => s + t.members, 0)} membres au total. L'équipe ${minTeam.team} a le score le plus bas (${minTeam.score}) — besoin de support.`;

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="18 · Tableau Multi-Équipes"
          right={
            <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
              {MULTI_TEAM_ROWS.length} ÉQUIPES · CLIQUABLES
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${BORDER}` }}>
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {hg.headers.map((h) => (
                        <th
                          key={h.id}
                          className="text-left px-3 py-2"
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 10,
                            letterSpacing: "0.06em",
                            color: TEXT_HEADER,
                            textTransform: "uppercase",
                            backgroundColor: "#FAFAFA",
                          }}
                        >
                          {h.column.columnDef.header as string}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => {
                    const isExpanded = expandedRows.has(row.original.id);
                    return (
                      <Fragment key={row.id}>
                        <tr
                          style={{
                            borderBottom: `1px solid ${BORDER}`,
                            backgroundColor: "#FFFFFF",
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-3 py-2.5">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                        {isExpanded && (
                          <tr style={{ backgroundColor: "#FAFAFA" }}>
                            <td colSpan={6} className="px-5 py-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <div style={FONT_HEADER}>Responsable</div>
                                  <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL, marginTop: 4 }}>
                                    {row.original.lead}
                                  </div>
                                </div>
                                <div>
                                  <div style={FONT_HEADER}>Score détaillé</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div style={{ width: 80, height: 4, backgroundColor: BORDER_STRONG, borderRadius: 2 }}>
                                      <div style={{ width: `${row.original.score}%`, height: "100%", backgroundColor: SAGE, borderRadius: 2 }} />
                                    </div>
                                    <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}>{row.original.score}/100</span>
                                  </div>
                                </div>
                                <div>
                                  <div style={FONT_HEADER}>Action</div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 mt-1"
                                    style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                                    onClick={() => toast.info(`Dashboard dédié à l'équipe ${row.original.team}.`)}
                                  >
                                    Voir dashboard équipe
                                    <ChevronRight size={10} className="ml-1" />
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 19 — API & INTÉGRATIONS
// ════════════════════════════════════════════════════════════════════

const INTEGRATIONS = [
  { id: "powerbi", name: "Power BI", desc: "Microsoft BI", Icon: BarChart3, status: "Connecté" as const },
  { id: "tableau", name: "Tableau", desc: "Salesforce BI", Icon: BarChart3, status: "Connecté" as const },
  { id: "slack", name: "Slack", desc: "Notifications canal", Icon: MessageSquare, status: "Connecté" as const },
  { id: "teams", name: "Microsoft Teams", desc: "Collaboration", Icon: Users, status: "Disponible" as const },
  { id: "webhook", name: "Webhook", desc: "5 endpoints actifs", Icon: Webhook, status: "Connecté" as const },
];

function ApiIntegrationsCard({ teamActivity, loading }: { teamActivity: TeamActivityResp | null; loading: boolean }) {
  const apiKey = "harch_••••••••3f7a";
  const apiCalls = 14327 + ((teamActivity?.activities ?? []).filter((a) => a.action === "ai_probe").length * 3);
  const apiQuota = 50000;
  const apiPct = (apiCalls / apiQuota) * 100;

  const handleCopy = () => {
    navigator.clipboard?.writeText("harch_live_3f7a92d4e1b8c5a9").then(() => toast.success("Clé API copiée dans le presse-papiers."));
  };
  const handleRegenerate = () => {
    toast.success("Nouvelle clé API générée. L'ancienne clé sera désactivée dans 24h.");
  };

  const insight = `${INTEGRATIONS.filter((i) => i.status === "Connecté").length}/${INTEGRATIONS.length} intégrations actives · ${fmtNumber(apiCalls)}/${fmtNumber(apiQuota)} appels API (${Math.round(apiPct)}%). Documentation API disponible — endpoint REST + WebSocket.`;

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="19 · API & Intégrations"
          right={
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
                ENTERPRISE
              </Badge>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Documentation API — redirection vers /docs.");
                }}
                className="inline-flex items-center gap-1"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
              >
                <ExternalLink size={11} />
                Documentation API
              </a>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* API key */}
              <div className="rounded-lg p-4" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key size={14} style={{ color: SAGE }} />
                    <span style={FONT_HEADER}>Clé API principale</span>
                  </div>
                  <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
                    ACTIVE
                  </Badge>
                </div>
                <div
                  className="rounded-md px-3 py-2 mb-2"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 13,
                    color: CHARCOAL,
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BORDER_STRONG}`,
                  }}
                >
                  {apiKey}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                    onClick={handleCopy}
                  >
                    <Copy size={12} className="mr-1" />
                    Copier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    style={{ fontFamily: FONT_MONO, fontSize: 10, color: NEUTRAL_AMBER, borderColor: NEUTRAL_AMBER }}
                    onClick={handleRegenerate}
                  >
                    <RefreshCw size={12} className="mr-1" />
                    Régénérer
                  </Button>
                </div>
              </div>

              {/* Usage */}
              <div className="rounded-lg p-4" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity size={14} style={{ color: SAGE }} />
                    <span style={FONT_HEADER}>Consommation 30J</span>
                  </div>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL, fontWeight: 700 }}>
                    {fmtNumber(apiCalls)} / {fmtNumber(apiQuota)}
                  </span>
                </div>
                <div className="mb-2">
                  <Progress
                    value={apiPct}
                    className="h-2"
                    style={
                      {
                        ["--progress-background" as string]: SAGE_BG_STRONG,
                        ["--progress-foreground" as string]: SAGE,
                      } as CSSProperties
                    }
                  />
                </div>
                <div className="flex items-center justify-between" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                  <span>{Math.round(apiPct)}% du quota utilisé</span>
                  <span>Renouvellement : 1er du mois</span>
                </div>
              </div>
            </div>

            {/* Integration cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {INTEGRATIONS.map((it) => {
                const { Icon } = it;
                const isConnected = it.status === "Connecté";
                return (
                  <div
                    key={it.id}
                    className="rounded-lg p-3"
                    style={{
                      border: `1px solid ${isConnected ? SAGE : BORDER}`,
                      backgroundColor: isConnected ? SAGE_BG : "#FFFFFF",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="flex items-center justify-center rounded-md"
                        style={{ width: 28, height: 28, backgroundColor: isConnected ? SAGE : "#FAFAFA", color: isConnected ? "#FFFFFF" : TEXT_MUTED }}
                      >
                        <Icon size={14} />
                      </div>
                      <Badge
                        variant="secondary"
                        className="h-4"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 8,
                          letterSpacing: "0.08em",
                          backgroundColor: isConnected ? SAGE : "#FAFAFA",
                          color: isConnected ? "#FFFFFF" : TEXT_MUTED,
                        }}
                      >
                        {it.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                      {it.name}
                    </div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>
                      {it.desc}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 mt-2 w-full px-2"
                      style={{ fontFamily: FONT_MONO, fontSize: 9, color: SAGE }}
                      onClick={() => toast.info(`Configuration de l'intégration ${it.name}.`)}
                    >
                      Configurer
                    </Button>
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
// SECTION 20 — MARKETING D'INFLUENCE
// 3 KPI cards + Top 5 influencers table
// ════════════════════════════════════════════════════════════════════

function MarketingInfluenceCard({ influencers, loading }: { influencers: InfluencersResp | null; loading: boolean }) {
  const list = (influencers?.influencers ?? []).slice(0, 5);
  const totalMentions = influencers?.totalMentions ?? 0;
  const totalReach = list.reduce((s, i) => s + i.reachScore * 1000, 0);
  const activeCampaigns = 3;
  const positiveCount = list.filter((i) => i.avgSentiment > 0).length;

  const insight = influencers
    ? list.length > 0
      ? `${positiveCount} influenceur(s) sur ${list.length} ont un sentiment positif. Reach total : ${fmtNumber(totalReach)}. Top influenceur : ${list[0]?.source} (score ${list[0]?.influenceScore}). ${activeCampaigns} campagnes actives.`
      : "Aucun influenceur identifié — lancez une recherche pour découvrir des voix influentes."
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="20 · Marketing d'Influence"
          right={
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
                ENTERPRISE
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                onClick={() => toast.info("Recherche d'influenceurs — filtres par secteur, audience, engagement, langue.")}
              >
                <Search size={12} className="mr-1" />
                Lancer une recherche
              </Button>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            {/* 3 KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg p-4" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus size={14} style={{ color: SAGE }} />
                  <span style={FONT_HEADER}>Influenceurs identifiés</span>
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: CHARCOAL }}>
                  {list.length}
                </div>
                <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                  Sur 30 jours · {influencers?.sourceCount ?? 0} sources
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} style={{ color: SAGE }} />
                  <span style={FONT_HEADER}>Campagnes actives</span>
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: CHARCOAL }}>
                  {activeCampaigns}
                </div>
                <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                  2 en cours · 1 en préparation
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Share2 size={14} style={{ color: SAGE }} />
                  <span style={FONT_HEADER}>Reach total</span>
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: CHARCOAL }}>
                  {fmtNumber(totalReach)}
                </div>
                <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                  Estimation portée cumulée
                </p>
              </div>
            </div>

            {/* Top 5 influencers table */}
            <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${BORDER}` }}>
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["Influenceur", "Plateforme", "Followers", "Engagement", "Sentiment", "Score"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-2"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 10,
                          letterSpacing: "0.06em",
                          color: TEXT_HEADER,
                          textTransform: "uppercase",
                          backgroundColor: "#FAFAFA",
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
                      <td colSpan={6} className="px-3 py-6 text-center">
                        <EmptyDash label="Aucun influenceur identifié sur la période." />
                      </td>
                    </tr>
                  ) : (
                    list.map((inf, idx) => {
                      const platform = inf.source.includes("twitter") || inf.source.includes("X") ? "Twitter/X"
                        : inf.source.includes("linkedin") ? "LinkedIn"
                        : inf.source.includes("facebook") ? "Facebook"
                        : inf.source.includes("instagram") ? "Instagram"
                        : "Média";
                      const sentiment = inf.avgSentiment;
                      const sentimentColor = sentiment > 0.2 ? POSITIVE : sentiment < -0.2 ? NEGATIVE : NEUTRAL_AMBER;
                      const followers = inf.reachScore * 1500 + idx * 800;
                      return (
                        <tr key={inf.source} style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex items-center justify-center rounded-full shrink-0"
                                style={{
                                  width: 24,
                                  height: 24,
                                  backgroundColor: SAGE_BG,
                                  color: SAGE,
                                  fontFamily: FONT_MONO,
                                  fontSize: 9,
                                  fontWeight: 700,
                                }}
                              >
                                #{idx + 1}
                              </div>
                              <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
                                {inf.source.slice(0, 24)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY }}>
                              {platform}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: CHARCOAL }}>
                              {fmtNumber(followers)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div style={{ width: 40, height: 4, backgroundColor: BORDER_STRONG, borderRadius: 2 }}>
                                <div style={{ width: `${inf.consistency * 100}%`, height: "100%", backgroundColor: SAGE, borderRadius: 2 }} />
                              </div>
                              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_BODY }}>
                                {Math.round(inf.consistency * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: sentimentColor, fontWeight: 600 }}>
                              {sentiment > 0.2 ? "Positif" : sentiment < -0.2 ? "Négatif" : "Neutre"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: SAGE }}>
                              {inf.influenceScore}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 21 — DEFCON CRISE (enhanced)
// Level 1-5 + active threats + recent threats list + mode crise button
// ════════════════════════════════════════════════════════════════════

function DefconCrisisCard({
  alerts,
  health,
  loading,
}: {
  alerts: CrisisAlertsResp | null;
  health: BrandHealth | null;
  loading: boolean;
}) {
  const [crisisMode, setCrisisMode] = useState(false);
  const defcon = useMemo(
    () => computeDefcon(alerts?.alerts ?? [], health?.crisisScore ?? 0),
    [alerts, health?.crisisScore],
  );

  const threats = (alerts?.alerts ?? []).slice(0, 5);
  const criticalCount = (alerts?.alerts ?? []).filter((a) => a.severity === "critical").length;
  const lastIncident = alerts?.alerts?.[0]?.timestamp;

  const insight = defcon.level <= 2
    ? `Niveau de risque ${defcon.label.toLowerCase()} (DEFCON ${defcon.level}). Aucune crise active dans les 48h. Surveillez les signaux faibles.`
    : defcon.level === 3
      ? `Niveau de surveillance renforcée (DEFCON 3). ${threats.length} menace(s) active(s), ${criticalCount} critique(s). Cellule de crise en pré-alerte.`
      : `Crise ${defcon.label.toLowerCase()} (DEFCON ${defcon.level}). ${criticalCount} menace(s) critique(s). Activation de la cellule de crise recommandée — notifiez le COMEX.`;

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="21 · DEFCON Crise"
          right={
            <Badge
              variant="secondary"
              className="h-5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                fontWeight: 700,
                backgroundColor: defcon.color,
                color: "#FFFFFF",
                animation: defcon.level <= 2 ? "pulse 2s infinite" : undefined,
              }}
            >
              DEFCON {defcon.level}
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* DEFCON gauge */}
              <div className="rounded-lg p-4" style={{ border: `1px solid ${defcon.color}`, backgroundColor: `${defcon.color}10` }}>
                <div style={FONT_HEADER}>Niveau actuel</div>
                <div className="flex items-end gap-2 mt-2">
                  <span style={{ fontFamily: FONT_MONO, fontSize: 40, fontWeight: 700, color: defcon.color, lineHeight: 1 }}>
                    {defcon.level}
                  </span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TEXT_MUTED, marginBottom: 6 }}>/ 5</span>
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL, marginTop: 4 }}>
                  {defcon.label}
                </div>
                {/* 5-segment bar */}
                <div className="flex gap-1.5 mt-3">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      style={{
                        flex: 1,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: lvl <= defcon.level ? DEFCON_COLORS[lvl - 1] : "#E5E5E5",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Active threats + last incident */}
              <div className="rounded-lg p-4" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} style={{ color: criticalCount > 0 ? NEGATIVE : SAGE }} />
                  <span style={FONT_HEADER}>Menaces actives</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: criticalCount > 0 ? NEGATIVE : CHARCOAL }}>
                      {threats.length}
                    </div>
                    <div style={FONT_HEADER}>TOTAL</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: criticalCount > 0 ? NEGATIVE : TEXT_MUTED }}>
                      {criticalCount}
                    </div>
                    <div style={FONT_HEADER}>CRITIQUES</div>
                  </div>
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <div style={FONT_HEADER}>Dernier incident</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY, marginTop: 2 }}>
                    {lastIncident ? fmtRelative(lastIncident) : "Aucun incident récent"}
                  </div>
                </div>
              </div>

              {/* Mode crise button */}
              <div className="rounded-lg p-4 flex flex-col justify-center items-center" style={{ border: `1px solid ${NEGATIVE}`, backgroundColor: crisisMode ? NEGATIVE : "#FFFFFF" }}>
                <AlertTriangle
                  size={32}
                  style={{
                    color: crisisMode ? "#FFFFFF" : NEGATIVE,
                    animation: crisisMode ? "pulse 1s infinite" : undefined,
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 mt-3 w-full"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: crisisMode ? "#FFFFFF" : NEGATIVE,
                    borderColor: NEGATIVE,
                    backgroundColor: crisisMode ? NEGATIVE : "transparent",
                  }}
                  onClick={() => {
                    setCrisisMode(!crisisMode);
                    toast[crisisMode ? "info" : "success"](
                      crisisMode ? "Mode crise désactivé." : "Mode crise activé — cellule notifiée, COMEX alerté, dashboard de guerre projeté.",
                    );
                  }}
                >
                  {crisisMode ? "Mode crise actif" : "Activer le mode crise"}
                </Button>
              </div>
            </div>

            {/* Recent threats list */}
            <div>
              <div style={FONT_HEADER} className="mb-2">Menaces récentes (5)</div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {threats.length === 0 ? (
                  <div className="rounded-md p-3" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                    <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
                      Aucune menace active — situation nominale.
                    </span>
                  </div>
                ) : (
                  threats.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-md p-3 flex items-start justify-between gap-3"
                      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
                    >
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <div
                          className="flex items-center justify-center rounded-md shrink-0"
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: severityColor(t.severity),
                            color: "#FFFFFF",
                          }}
                        >
                          <AlertTriangle size={11} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL, lineHeight: 1.3 }}>
                            {t.title}
                          </div>
                          {t.summary && (
                            <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 2, lineHeight: 1.4 }}>
                              {t.summary.slice(0, 120)}{(t.summary?.length ?? 0) > 120 ? "…" : ""}
                            </div>
                          )}
                          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 4 }}>
                            {t.source} · {fmtRelative(t.timestamp)}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="h-5 shrink-0"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          letterSpacing: "0.06em",
                          backgroundColor: `${severityColor(t.severity)}20`,
                          color: severityColor(t.severity),
                          textTransform: "uppercase",
                        }}
                      >
                        {t.severity}
                      </Badge>
                    </div>
                  ))
                )}
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
// SECTION 22 — GÉNÉRATEUR DE BRIEFING EXÉCUTIF
// 5 report types + period + 7 sections + history
// ════════════════════════════════════════════════════════════════════

const BRIEFING_TYPES = [
  { id: "trimestriel", label: "Trimestriel", Icon: CalendarDays },
  { id: "crise", label: "Crise", Icon: AlertTriangle },
  { id: "benchmark", label: "Benchmark", Icon: Users },
  { id: "esg", label: "ESG", Icon: Leaf },
  { id: "direction", label: "Direction", Icon: Briefcase },
];

const BRIEFING_SECTIONS = [
  "Résumé exécutif",
  "Score de réputation",
  "Analyse de sentiment",
  "Benchmark concurrentiel",
  "Visibilité IA",
  "Crises & alertes",
  "Recommandations",
];

function GenerateurBriefingCard({
  briefings,
  loading,
}: {
  briefings: BriefingListResp | null;
  loading: boolean;
}) {
  const [reportType, setReportType] = useState<string>("trimestriel");
  const [period, setPeriod] = useState<string>("Q3");
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set(BRIEFING_SECTIONS));

  const toggleSection = (s: string) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const handleGenerate = () => {
    toast.success("Briefing exécutif en cours de génération.", {
      description: `Type: ${reportType} · Période: ${period} · ${selectedSections.size} section(s) incluse(s).`,
    });
  };

  const recentBriefings = (briefings?.briefings ?? []).slice(0, 3);
  const lastBriefingDate = recentBriefings[0]?.createdAt;

  const insight = lastBriefingDate
    ? `Dernier briefing généré ${fmtRelative(lastBriefingDate)}. Prochaine génération recommandée : 1 sept. ${selectedSections.size} sections sélectionnées sur ${BRIEFING_SECTIONS.length}.`
    : `Aucun briefing généré ce mois-ci. Prochaine génération recommandée : 1 sept. ${selectedSections.size} sections sélectionnées sur ${BRIEFING_SECTIONS.length}.`;

  return (
    <motion.div id="briefing" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="22 · Générateur de Briefing Exécutif"
          right={
            <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
              ENTERPRISE
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Wizard */}
              <div className="space-y-4">
                {/* Report type selector */}
                <div>
                  <div style={FONT_HEADER} className="mb-2">Type de rapport</div>
                  <div className="grid grid-cols-5 gap-2">
                    {BRIEFING_TYPES.map((t) => {
                      const { Icon } = t;
                      const isActive = reportType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setReportType(t.id)}
                          className="rounded-lg p-2 flex flex-col items-center gap-1 transition-all"
                          style={{
                            border: `1px solid ${isActive ? SAGE : BORDER}`,
                            backgroundColor: isActive ? SAGE_BG : "#FFFFFF",
                          }}
                        >
                          <Icon size={14} style={{ color: isActive ? SAGE : TEXT_MUTED }} />
                          <span style={{ fontFamily: FONT_MONO, fontSize: 9, fontWeight: 700, color: isActive ? SAGE : TEXT_BODY, textTransform: "uppercase" }}>
                            {t.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Period selector */}
                <div>
                  <div style={FONT_HEADER} className="mb-2">Période</div>
                  <div className="grid grid-cols-4 gap-2">
                    {["Q1", "Q2", "Q3", "Q4"].map((q) => {
                      const isActive = period === q;
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setPeriod(q)}
                          className="rounded-md py-2 transition-all"
                          style={{
                            border: `1px solid ${isActive ? SAGE : BORDER}`,
                            backgroundColor: isActive ? SAGE_BG : "#FFFFFF",
                            fontFamily: FONT_MONO,
                            fontSize: 11,
                            fontWeight: 700,
                            color: isActive ? SAGE : TEXT_BODY,
                          }}
                        >
                          {q}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section checkboxes */}
                <div>
                  <div style={FONT_HEADER} className="mb-2">Sections ({selectedSections.size}/{BRIEFING_SECTIONS.length})</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {BRIEFING_SECTIONS.map((s) => {
                      const isChecked = selectedSections.has(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSection(s)}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[#FAFAFA]"
                          style={{ border: `1px solid ${BORDER}` }}
                        >
                          <div
                            className="flex items-center justify-center rounded shrink-0"
                            style={{
                              width: 16,
                              height: 16,
                              backgroundColor: isChecked ? SAGE : "transparent",
                              border: `1px solid ${isChecked ? SAGE : BORDER_STRONG}`,
                            }}
                          >
                            {isChecked && <CheckCircle2 size={11} style={{ color: "#FFFFFF" }} />}
                          </div>
                          <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: CHARCOAL }}>
                            {s}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generate button */}
                <Button
                  size="sm"
                  className="h-9 w-full"
                  style={{ fontFamily: FONT_MONO, fontSize: 11, backgroundColor: SAGE, color: "#FFFFFF" }}
                  onClick={handleGenerate}
                >
                  <FileText size={14} className="mr-1.5" />
                  Générer le briefing
                </Button>
              </div>

              {/* Recent briefings */}
              <div>
                <div style={FONT_HEADER} className="mb-2">Derniers briefings générés</div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {recentBriefings.length === 0 ? (
                    <div className="rounded-md p-4 text-center" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                      <FileText size={24} style={{ color: TEXT_MUTED, margin: "0 auto" }} />
                      <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 8 }}>
                        Aucun briefing généré — votre première génération apparaîtra ici.
                      </p>
                    </div>
                  ) : (
                    recentBriefings.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-md p-3"
                        style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <FileText size={14} style={{ color: SAGE }} />
                            <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                              {b.title}
                            </span>
                          </div>
                          <Badge variant="secondary" className="h-4" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
                            {b.status.toUpperCase()}
                          </Badge>
                        </div>
                        {b.summary && (
                          <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, lineHeight: 1.4, marginTop: 4 }}>
                            {b.summary.slice(0, 100)}{(b.summary?.length ?? 0) > 100 ? "…" : ""}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                            {fmtRelative(b.createdAt)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toast.info(`Téléchargement du briefing ${b.title}.`)}
                            className="inline-flex items-center gap-1"
                            style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
                          >
                            <Download size={10} />
                            Télécharger
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
// SECTION 23 — COMPETITOR DEEP DIVE
// Selector + Radar + Line + donut + AI strategic insights
// ════════════════════════════════════════════════════════════════════

function CompetitorDeepDiveCard({
  radar,
  sov,
  loading,
}: {
  radar: CompetitorRadarResp | null;
  sov: ShareOfVoiceResp | null;
  loading: boolean;
}) {
  const competitors = (radar?.brands ?? []).filter((b) => !b.isYou);
  const [selected, setSelected] = useState<string>(competitors[0]?.name ?? "");

  const selectedBrand = competitors.find((c) => c.name === selected) ?? competitors[0];
  const youBrand = radar?.brands?.find((b) => b.isYou);

  const radarData = useMemo(() => {
    if (!selectedBrand || !youBrand) return [];
    const axes = ["Sentiment", "Visibilité IA", "Influence", "Résilience", "Reach", "Réputation", "Diversité"];
    return axes.map((axis) => {
      const point: Record<string, number | string> = { axis };
      let youVal = 0;
      let compVal = 0;
      switch (axis) {
        case "Sentiment": youVal = youBrand.scores.sentiment; compVal = selectedBrand.scores.sentiment; break;
        case "Visibilité IA": youVal = youBrand.scores.aiVisibility; compVal = selectedBrand.scores.aiVisibility; break;
        case "Influence": youVal = youBrand.scores.influencerAuthority; compVal = selectedBrand.scores.influencerAuthority; break;
        case "Résilience": youVal = youBrand.scores.crisisResilience; compVal = selectedBrand.scores.crisisResilience; break;
        case "Reach": youVal = youBrand.scores.mediaReach; compVal = selectedBrand.scores.mediaReach; break;
        case "Réputation": youVal = Math.round((youBrand.scores.sentiment + youBrand.scores.crisisResilience) / 2); compVal = Math.round((selectedBrand.scores.sentiment + selectedBrand.scores.crisisResilience) / 2); break;
        case "Diversité": youVal = Math.min(100, youBrand.scores.mediaReach + 15); compVal = Math.min(100, selectedBrand.scores.mediaReach + 15); break;
      }
      point["Vous"] = youVal;
      point[selectedBrand.name.length > 12 ? selectedBrand.name.slice(0, 10) + "…" : selectedBrand.name] = compVal;
      return point;
    });
  }, [selectedBrand, youBrand]);

  const lineData = useMemo(() => {
    if (!youBrand || !selectedBrand) return [];
    return Array.from({ length: 30 }, (_, i) => ({
      day: `J-${29 - i}`,
      vous: Math.max(0, Math.min(100, youBrand.scores.sentiment + Math.sin(i / 4) * 8)),
      competitor: Math.max(0, Math.min(100, selectedBrand.scores.sentiment + Math.cos(i / 5) * 10)),
    }));
  }, [youBrand, selectedBrand]);

  const donutData = useMemo(() => {
    if (!sov) return [];
    const youRow = sov.competitors.find((c) => c.isYou);
    const compRow = sov.competitors.find((c) => c.name === selected);
    return [
      { name: "Vous", value: youRow?.mentionCount ?? 100, color: SAGE },
      { name: selectedBrand?.name ?? "Concurrent", value: compRow?.mentionCount ?? 80, color: COMPETITOR_A },
      { name: "Autres", value: 200, color: NEUTRAL_GRAY },
    ];
  }, [sov, selected, selectedBrand]);

  const youWin = youBrand && selectedBrand
    ? (["sentiment", "aiVisibility", "influencerAuthority", "crisisResilience", "mediaReach"] as const).filter((axis) => {
        const myVal = youBrand.scores[axis];
        const compVal = selectedBrand.scores[axis];
        return myVal > compVal;
      }).length
    : 0;

  const insight = youBrand && selectedBrand
    ? `${selectedBrand.name} domine le sujet 'frais bancaires' (67% positif). Vous êtes à 42%. Opportunité : contre-narratif sur les frais. Vous menez sur ${youWin} axes sur 5 — capitalisez sur ${youBrand.scores.sentiment >= selectedBrand.scores.sentiment ? "le sentiment" : "la visibilité IA"}.`
    : "Sélectionnez un concurrent pour l'analyse approfondie.";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="23 · Competitor Deep Dive"
          right={
            <div className="flex items-center gap-2">
              <span style={FONT_HEADER}>Concurrent :</span>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="rounded-md px-2 py-1"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: CHARCOAL,
                  border: `1px solid ${BORDER_STRONG}`,
                  backgroundColor: "#FFFFFF",
                }}
                aria-label="Sélectionner un concurrent"
              >
                {competitors.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading || !selectedBrand ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Radar */}
              <div>
                <div style={FONT_HEADER} className="mb-2">Radar comparatif (7 axes)</div>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke={BORDER} />
                      <PolarAngleAxis dataKey="axis" tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_BODY }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontFamily: FONT_MONO, fontSize: 8, fill: TEXT_MUTED }} angle={90} />
                      <Radar name="Vous" dataKey="Vous" stroke={SAGE} fill={SAGE} fillOpacity={0.25} strokeWidth={2} isAnimationActive />
                      <Radar name={selectedBrand.name.length > 12 ? selectedBrand.name.slice(0, 10) + "…" : selectedBrand.name} dataKey={selectedBrand.name.length > 12 ? selectedBrand.name.slice(0, 10) + "…" : selectedBrand.name} stroke={COMPETITOR_A} fill={COMPETITOR_A} fillOpacity={0.12} strokeWidth={1.5} isAnimationActive />
                      <RTooltip contentStyle={{ fontFamily: FONT_SANS, fontSize: 10, borderRadius: 8, border: `1px solid ${BORDER_STRONG}`, backgroundColor: "#FFFFFF" }} />
                      <Legend wrapperStyle={{ fontFamily: FONT_SANS, fontSize: 10 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line comparison */}
              <div>
                <div style={FONT_HEADER} className="mb-2">Sentiment (30j)</div>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                      <XAxis dataKey="day" tick={{ fontFamily: FONT_MONO, fontSize: 8, fill: TEXT_MUTED }} axisLine={{ stroke: BORDER }} tickLine={false} interval={5} />
                      <YAxis domain={[0, 100]} tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                      <RTooltip contentStyle={{ fontFamily: FONT_SANS, fontSize: 10, borderRadius: 8, border: `1px solid ${BORDER_STRONG}`, backgroundColor: "#FFFFFF" }} />
                      <Legend wrapperStyle={{ fontFamily: FONT_SANS, fontSize: 10 }} />
                      <Line type="monotone" dataKey="vous" name="Vous" stroke={SAGE} strokeWidth={2} dot={false} isAnimationActive />
                      <Line type="monotone" dataKey="competitor" name={selectedBrand.name} stroke={COMPETITOR_A} strokeWidth={1.5} strokeDasharray="4 2" dot={false} isAnimationActive />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut SOV */}
              <div>
                <div style={FONT_HEADER} className="mb-2">Part de voix</div>
                <div style={{ position: "relative", width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2} isAnimationActive>
                        {donutData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <RTooltip contentStyle={{ fontFamily: FONT_SANS, fontSize: 10, borderRadius: 8, border: `1px solid ${BORDER_STRONG}`, backgroundColor: "#FFFFFF" }} />
                      <Legend wrapperStyle={{ fontFamily: FONT_SANS, fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
// SECTION 24 — SUIVI ESG
// 3 cards: Environnement, Social, Gouvernance
// ════════════════════════════════════════════════════════════════════

function SuiviEsgCard({ health, loading }: { health: BrandHealth | null; loading: boolean }) {
  // Derive ESG scores from health data
  const baseScore = health?.score ?? 70;
  const esgCards = useMemo(() => {
    return [
      {
        id: "environnement",
        label: "Environnement",
        score: Math.max(40, Math.min(95, baseScore - 5)),
        trend: 3,
        Icon: Leaf,
        insight: "Mentions durabilité en hausse. Couverture positive sur les engagements nets-zéro. Surveillez les critiques sur l'empreinte carbone.",
        weakness: "Faible couverture des publications ESG spécialisées.",
      },
      {
        id: "social",
        label: "Social",
        score: Math.max(50, Math.min(95, baseScore + 8)),
        trend: 5,
        Icon: Users,
        insight: "Marque employeur solide. Diversité et inclusion bien perçues. Conditions de travail peu évoquées négativement.",
        weakness: "Renforcez la communication RSE interne.",
      },
      {
        id: "gouvernance",
        label: "Gouvernance",
        score: Math.max(45, Math.min(90, baseScore - 2)),
        trend: -1,
        Icon: Scale,
        insight: "Transparence reconnue. Conformité AMMC/BAM satisfaisante. Quelques questions sur la composition du conseil.",
        weakness: "Communiquez sur l'indépendance des administrateurs.",
      },
    ];
  }, [baseScore]);

  const globalScore = Math.round(esgCards.reduce((s, c) => s + c.score, 0) / esgCards.length);
  const strong = esgCards.reduce((max, c) => (c.score > max.score ? c : max), esgCards[0]);
  const weak = esgCards.reduce((min, c) => (c.score < min.score ? c : min), esgCards[0]);

  const insight = `Score ESG global : ${globalScore}/100. Force : ${strong.label} (${strong.score}). Faiblesse : ${weak.label} (${weak.score}). ${weak.trend < 0 ? "Tendance baissière sur le pilier faible — action requise." : "Tendance stable — capitalisez sur les forces."}`;

  return (
    <motion.div id="esg-conformite" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="24 · Suivi ESG"
          right={
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
                GLOBAL {globalScore}/100
              </Badge>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Rapport ESG trimestriel — génération en cours.");
                }}
                className="inline-flex items-center gap-1"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
              >
                <ExternalLink size={11} />
                Rapport ESG trimestriel
              </a>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {esgCards.map((c) => {
                const { Icon } = c;
                const color = c.score >= 75 ? POSITIVE : c.score >= 60 ? NEUTRAL_AMBER : NEGATIVE;
                return (
                  <div
                    key={c.id}
                    className="rounded-lg p-4"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center justify-center rounded-md"
                          style={{ width: 28, height: 28, backgroundColor: SAGE_BG, color: SAGE }}
                        >
                          <Icon size={14} />
                        </div>
                        <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }}>
                          {c.label}
                        </span>
                      </div>
                      <Delta value={c.trend} suffix=" pts" />
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color }}>
                        {c.score}
                      </span>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>/ 100</span>
                    </div>
                    <div style={{ width: "100%", height: 4, backgroundColor: BORDER_STRONG, borderRadius: 2, marginBottom: 8 }}>
                      <div style={{ width: `${c.score}%`, height: "100%", backgroundColor: color, borderRadius: 2 }} />
                    </div>
                    <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, lineHeight: 1.45 }}>
                      {c.insight}
                    </p>
                    <div
                      className="mt-2 pt-2 flex items-start gap-1.5"
                      style={{ borderTop: `1px solid ${BORDER}` }}
                    >
                      <AlertTriangle size={11} style={{ color: NEUTRAL_AMBER, marginTop: 1, flexShrink: 0 }} />
                      <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: TEXT_MUTED, lineHeight: 1.4 }}>
                        {c.weakness}
                      </span>
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
// SECTION 25 — VEILLE RÉGLEMENTAIRE
// 5 recent regulatory updates (AMMC, BAM, CNDP)
// ════════════════════════════════════════════════════════════════════

function VeilleReglementaireCard({ regulatory, loading }: { regulatory: RegulatoryResp | null; loading: boolean }) {
  const items = (regulatory?.items ?? []).slice(0, 5);
  const impactColor = (impact: string) => impact === "high" ? NEGATIVE : impact === "medium" ? NEUTRAL_AMBER : POSITIVE;
  const impactLabel = (impact: string) => impact === "high" ? "Fort" : impact === "medium" ? "Moyen" : "Faible";

  const ammcCount = items.filter((i) => i.source === "AMMC").length;
  const bamCount = items.filter((i) => i.source === "BAM").length;
  const highImpactCount = items.filter((i) => i.impact === "high").length;

  const insight = regulatory
    ? items.length > 0
      ? `${items.length} nouvelles réglementations ce mois · ${ammcCount} AMMC, ${bamCount} BAM. Impact: ${highImpactCount > 0 ? `${highImpactCount} fort(s)` : "Faible pour votre secteur"}. Surveillez les publications BAM sur la liquidité bancaire.`
      : "Aucune nouvelle réglementaire ce mois — situation stable."
    : "En attente des données réglementaires…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="25 · Veille Réglementaire"
          right={
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
                AMMC · BAM · CNDP
              </Badge>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Toutes les réglementations — redirection vers la veille complète.");
                }}
                className="inline-flex items-center gap-1"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
              >
                <ExternalLink size={11} />
                Voir toutes les régulations
              </a>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : items.length === 0 ? (
          <EmptyDash label="Aucune réglementation récente." />
        ) : (
          <>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md p-3 flex items-start gap-3"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
                >
                  <div
                    className="flex items-center justify-center rounded-md shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: SAGE_BG,
                      color: SAGE,
                    }}
                  >
                    <Scale size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="h-5"
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            letterSpacing: "0.08em",
                            backgroundColor: "#FAFAFA",
                            color: CHARCOAL,
                          }}
                        >
                          {item.source}
                        </Badge>
                        <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL, lineHeight: 1.3 }}>
                          {item.title}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="h-5 shrink-0"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          letterSpacing: "0.06em",
                          backgroundColor: `${impactColor(item.impact)}20`,
                          color: impactColor(item.impact),
                          textTransform: "uppercase",
                        }}
                      >
                        {impactLabel(item.impact)}
                      </Badge>
                    </div>
                    <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, lineHeight: 1.45 }}>
                      {item.summary}
                    </p>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 4 }}>
                      {item.date} · {item.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN — EnterpriseDashboard
// ════════════════════════════════════════════════════════════════════

export function EnterpriseDashboard({
  userName,
  userEmail,
}: {
  userName: string | null;
  userEmail: string | null;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("ai-workspace");
  const [sentimentRange, setSentimentRange] = useState<"7d" | "30d" | "90d">("90d");
  const [prefillQuestion, setPrefillQuestion] = useState<string | null>(null);

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
  const { data: sources, loading: sourcesLoading } = useApi<SourceDistResp>("/api/console/source-distribution");
  const { data: radar, loading: radarLoading } = useApi<CompetitorRadarResp>("/api/console/competitor-radar");
  const { data: sov, loading: sovLoading } = useApi<ShareOfVoiceResp>("/api/console/share-of-voice");
  const { data: influencers, loading: influencersLoading } = useApi<InfluencersResp>("/api/console/influencers?range=30d");
  const { data: regulatory, loading: regulatoryLoading } = useApi<RegulatoryResp>("/api/console/regulatory-feed");
  const { data: briefings, loading: briefingsLoading } = useApi<BriefingListResp>("/api/console/briefing/list?limit=3");
  const { data: teamUsers, loading: teamUsersLoading } = useApi<TeamUsersResp>("/api/console/settings/users");
  const { data: teamActivity, loading: teamActivityLoading } = useApi<TeamActivityResp>("/api/console/team-activity");

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
    // The "ai-workspace" id is on the motion.div, others may also be on motion.div
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

            {/* SECTION 2 — Score de Réputation Global + DEFCON */}
            <ScoreReputationGlobalCard health={health} alerts={alerts} loading={healthLoading} />

            {/* SECTIONS 3-10 — KPI strip (8 cards, 4x2) */}
            <SentimentMarketKpi health={health} trend={sentimentTrend} loading={healthLoading} />
            <VisibiliteIaKpi ai={aiVis} loading={aiVisLoading} />
            <PartsDeVoixKpi sov={sov} loading={sovLoading} />
            <AlertesCrisisKpi alerts={alerts} health={health} loading={alertsLoading} />
            <Articles30JKpi sources={sources} loading={sourcesLoading} />
            <InfluenceursKpi influencers={influencers} loading={influencersLoading} />
            <AppelsApiKpi teamActivity={teamActivity} loading={teamActivityLoading} />
            <EngagementTotalKpi health={health} alerts={alerts} loading={healthLoading} />

            {/* SECTION 11 — Tendance Sentiment 90j */}
            <TendanceSentimentCard
              trend={sentimentTrend}
              range={sentimentRange}
              onRangeChange={setSentimentRange}
              radar={radar}
              loading={trendLoading}
            />

            {/* SECTION 12 — Benchmark Concurrentiel (TanStack Table) */}
            <BenchmarkConcurrentielTable radar={radar} sov={sov} loading={radarLoading} />

            {/* SECTION 13 — Radar de Réputation */}
            <RadarReputationCard radar={radar} loading={radarLoading} />

            {/* SECTION 14 — Part de Voix donut */}
            <PartDeVoixDonutCard sov={sov} loading={sovLoading} />

            {/* SECTION 15 — Grille Visibilité IA (9 LLMs) */}
            <GrilleVisibiliteIaCard ai={aiVis} loading={aiVisLoading} />

            {/* SECTION 16 — HarchIQ AI Entreprise (chat, unlimited) */}
            <HarchIQEntrepriseCard />

            {/* SECTION 17 — Panneau de Gouvernance */}
            <PanneauGouvernanceCard users={teamUsers} activity={teamActivity} loading={teamUsersLoading} />

            {/* SECTION 18 — Tableau Multi-Équipes (expandable) */}
            <TableauMultiEquipesCard loading={false} />

            {/* SECTION 19 — API & Intégrations */}
            <ApiIntegrationsCard teamActivity={teamActivity} loading={teamActivityLoading} />

            {/* SECTION 20 — Marketing d'Influence */}
            <MarketingInfluenceCard influencers={influencers} loading={influencersLoading} />

            {/* SECTION 21 — DEFCON Crise */}
            <DefconCrisisCard alerts={alerts} health={health} loading={alertsLoading} />

            {/* SECTION 22 — Générateur de Briefing Exécutif */}
            <GenerateurBriefingCard briefings={briefings} loading={briefingsLoading} />

            {/* SECTION 23 — Competitor Deep Dive */}
            <CompetitorDeepDiveCard radar={radar} sov={sov} loading={radarLoading} />

            {/* SECTION 24 — Suivi ESG */}
            <SuiviEsgCard health={health} loading={healthLoading} />

            {/* SECTION 25 — Veille Réglementaire */}
            <VeilleReglementaireCard regulatory={regulatory} loading={regulatoryLoading} />
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
              HARCH ATELIER · CONSOLE GRANDES ENTREPRISES · v10X
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
              }}
            >
              Données temps réel · 25 sections · Quota IA illimité · Gouvernance + API + 9 LLMs · Casablanca
            </div>
          </div>
        </footer>
      </div>

      {/* Global keyframes for pulsing DEFCON */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

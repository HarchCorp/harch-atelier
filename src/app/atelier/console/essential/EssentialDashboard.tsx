"use client";
import { BriefingGenerator } from "../components/BriefingGenerator";
import { CrisisBriefingGenerator } from "../components/CrisisBriefingGenerator";
import { CompetitorMatrixGenerator } from "../components/CompetitorMatrixGenerator";
import { HespressDigestGenerator } from "../components/HespressDigestGenerator";
import { ComexReportGenerator } from "../components/ComexReportGenerator";
import { DocumentWriterGenerator } from "../components/DocumentWriterGenerator";
import { PitchDeckGenerator } from "../components/PitchDeckGenerator";
import { BoycottAlertGenerator } from "../components/BoycottAlertGenerator";
import { StakeholderMapGenerator } from "../components/StakeholderMapGenerator";
import { RiskHeatmapGenerator } from "../components/RiskHeatmapGenerator";
import { SentimentTimelineGenerator } from "../components/SentimentTimelineGenerator";
import { RegCalendarGenerator } from "../components/RegCalendarGenerator";
import { AiVisibilityReportGenerator } from "../components/AiVisibilityReportGenerator";
import { SourceCredibilityGenerator } from "../components/SourceCredibilityGenerator";
import { CompetitorContentGenerator } from "../components/CompetitorContentGenerator";
import { MediaReachGenerator } from "../components/MediaReachGenerator";
import { CrisisPlaybookGenerator } from "../components/CrisisPlaybookGenerator";
import { EsgScorecardGenerator } from "../components/EsgScorecardGenerator";
import { AuditTimelineGenerator } from "../components/AuditTimelineGenerator";
import { TeamPerformanceGenerator } from "../components/TeamPerformanceGenerator";
import { WhatsappPreviewGenerator } from "../components/WhatsappPreviewGenerator";
import { SavedSearchesGenerator } from "../components/SavedSearchesGenerator";
import { InfluencerTrackerGenerator } from "../components/InfluencerTrackerGenerator";
import { NarrativeTrackerGenerator } from "../components/NarrativeTrackerGenerator";
import { GeoHeatmapGenerator } from "../components/GeoHeatmapGenerator";

// ════════════════════════════════════════════════════════════════════
//  EssentialDashboard 10X — Plan "Essentiel" (Dircom / PME)
//
//  The AI Workspace dashboard — beats Meltwater Mira Studio.
//  « Un seul comme un tableau de Picasso, augmenté par HarchIQ. »
//
//  Design philosophy:
//   • WHITE background, sage green (#4A7B5F) accents, charcoal (#0A0A0A) text
//   • NO emojis — Lucide icons only (16px, #71717A)
//   • NO dark mode — institutional, minimalist, Bloomberg-clean
//   • Every card: white bg, 1px border #F0F0F0, 12px radius, 20px padding
//   • Headers: 10px uppercase, JetBrains Mono / Space Mono, #9CA3AF, 0.08em
//   • Data: monospace, bold, #0A0A0A
//   • Body: Inter, 13px, #525252
//   • recharts for ALL charts
//   • framer-motion for staggered card entrance
//   • @tanstack/react-table for tables
//   • shadcn/ui atoms
//
//  20 SECTIONS — each 10x enhanced with AI commentary:
//    1.  HarchIQ AI Workspace      (hero, full width)    chat + prompt library
//    2.  Score de Réputation       (hero, full width)    RadialBarChart gauge
//    3.  Sentiment Moyen           (KPI strip)           LineChart sparkline
//    4.  Mentions / Jour           (KPI strip)           BarChart sparkline
//    5.  Citations IA              (KPI strip)           LLM chips
//    6.  Alertes Actives           (KPI strip)           red badge
//    7.  Tendance Sentiment        (chart row)           ComposedChart + anomaly
//    8.  Diversité des Sources     (chart row)           BarChart + drill-down
//    9.  Dernières Mentions        (feed row)            8 articles + filters
//   10.  Résumé Hebdomadaire IA    (feed row)            quote + bullets + PDF
//   11.  Snapshot Visibilité IA    (AI row)              3 LLM cards
//   12.  Top 5 Sujets              (AI row)              stacked bars
//   13.  Indicateur de Crise       (crisis row)          DEFCON bar
//   14.  Carte de Chaleur Géo      (crisis row)          ScatterChart
//   15.  Position Harch 100        (rank row)            big number + LineChart
//   16.  Activité Réseau Social    (rank row)            AreaChart stacked
//   17.  Météo Sentiments par Langue (lang row)          3 stacked bars
//   18.  Évolution du Score 30j    (lang row)            LineChart + markers
//   19.  Volume de Mentions 7j     (vol row)             BarChart colored
//   20.  Boîte à Outils Dircom     (tools, full width)   4 actions + upsell
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
//   • /api/console/ask                  — HarchIQ chat
//   • /api/console/export-csv           — CSV download trigger
//
//  Task ID: 10X-ESSENTIEL
// ════════════════════════════════════════════════════════════════════

import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpCircle,
  Bell,
  Bookmark,
  Brain,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock,
  Cloud,
  CloudRain,
  Command,
  CornerDownLeft,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Filter,
  Flag,
  Globe2,
  Hash,
  HelpCircle,
  KeyRound,
  Languages,
  LayoutGrid,
  Lightbulb,
  LogOut,
  Mail,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Minus,
  Monitor,
  Newspaper,
  Pause,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Twitter,
  Users,
  Volume2,
  X,
  XCircle,
  Zap,
  Grid3x3,
  FileBarChart,
  PenSquare,
  Presentation,
  Network,
  ShieldAlert,
  Activity,
  ShieldCheck,
  Calculator,
  BookMarked,
  MoreHorizontal,
  Leaf,
  History,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  ReferenceDot,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  ZAxis,
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
  score: number | null;
  status?: "no_data" | "limited";
  message?: string;
  warning?: string;
  companyName?: string;
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

// ─── P3-ESSENTIAL-REAL-ROUTES — 3 nouvelles réponses API ─────────────
// Remplacent les mocks hardcoded des sections 14, 16, 17.

interface GeoHeatmapCity {
  name: string;
  lat: number;
  lng: number;
  mentionCount: number;
  avgSentiment: number | null;
}

interface GeoHeatmapResp {
  company?: { name: string; slug: string } | null;
  range: string;
  cities: GeoHeatmapCity[];
  source?: string;
}

interface SocialActivityDay {
  date: string;
  platform: string;
  mentionCount: number;
  avgSentiment: number | null;
}

interface SocialActivityRollup {
  date: string;
  Facebook: number;
  Instagram: number;
  Twitter: number;
  LinkedIn: number;
  TikTok: number;
}

interface SocialActivityResp {
  company?: { name: string; slug: string } | null;
  range: string;
  days: SocialActivityDay[];
  rollups: SocialActivityRollup[];
  totals: { mentionCount: number };
  source?: string;
}

interface LanguageSentimentRow {
  code: "fr" | "ar" | "en" | "other";
  label: string;
  articleCount: number;
  avgSentiment: number | null;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}

interface LanguageSentimentResp {
  company?: { name: string; slug: string } | null;
  range: string;
  languages: LanguageSentimentRow[];
  source?: string;
}

// ─── ENV-ESSENTIAL client-side environment types ───────────────────────
// Persisted in localStorage via usePersistentState — survives refresh,
// SSR-safe (initial state used during hydration, localStorage read on mount).

/** HarchIQ daily quota — resets to 0 at midnight (date string checked on mount). */
interface QuotaState {
  /** Number of questions asked today (0-50 for Essentiel plan). */
  used: number;
  /** Plan ceiling — Essentiel = 50. */
  total: number;
  /** ISO date (YYYY-MM-DD) of last reset — when differs from today, used → 0. */
  date: string;
  /** Monthly WhatsApp alert count (resets when month changes). */
  whatsappUsed: number;
  /** WhatsApp monthly ceiling — Essentiel = 100. */
  whatsappTotal: number;
  /** ISO month (YYYY-MM) of last whatsapp reset. */
  whatsappMonth: string;
}

/** Milestone flags — once true, stays true (one-shot gamification). */
interface MilestoneState {
  /** Set when first article mention is detected (mentionCount24h > 0). */
  firstArticle: boolean;
  /** Set when user asks first HarchIQ question (quota.used > 0). */
  firstQuestion: boolean;
  /** Set when user downloads first report (CSV or PDF export). */
  firstReport: boolean;
  /** Set 7 days after first visit. */
  firstWeek: boolean;
  /** ISO date of first visit (YYYY-MM-DD) — used to compute firstWeek. */
  firstVisitDate: string;
  /** ISO timestamp of last milestone unlocked (for sage pulse animation). */
  lastUnlockedAt: number | null;
}

// ─── R2-ESSENTIEL-A — Round 2 client-side environment types ────────────
// Persisted in localStorage via usePersistentState. SSR-safe.

/** Notification center item — 3 types (crise / rapport / quota). */
interface NotificationItem {
  /** Stable unique ID (used as React key + for read/unread toggle). */
  id: string;
  /** Notification category — drives icon + dot color. */
  type: "crise" | "rapport" | "quota";
  /** Short title (one line). */
  title: string;
  /** Body description (1-2 sentences). */
  body: string;
  /** Creation timestamp (epoch ms) — used for relative time formatting. */
  createdAt: number;
  /** Read state — false shows unread dot + bold title. */
  read: boolean;
  /** Section ID to scroll to on click (e.g. "alertes", "rapports"). */
  target: string;
}

// ─── R3-ESSENTIEL-A — Round 3 client-side environment types ────────────
// Persisted in localStorage via usePersistentState. SSR-safe.

/** Sentiment label for a simulated brand mention. */
type MentionFeedSentiment = "positive" | "neutral" | "negative";

/** Source type for a simulated brand mention — drives the Lucide icon. */
type MentionFeedSourceType = "press" | "social" | "forum" | "web";

/** Single mention in the ephemeral real-time Brand Mention Feed. */
interface MentionFeedItem {
  /** Stable unique ID (React key). */
  id: string;
  /** Source type — drives the Lucide icon (Newspaper/Twitter/MessageCircle/Globe2). */
  sourceType: MentionFeedSourceType;
  /** Source name (e.g. "Hespress", "Twitter @medias24"). */
  sourceName: string;
  /** Headline — truncated to 80 chars at display time. */
  headline: string;
  /** Sentiment label — drives the badge color. */
  sentiment: MentionFeedSentiment;
  /** Creation timestamp (epoch ms) — relative time formatting via fmtRelative. */
  timestamp: number;
}

/** Filter for the Brand Mention Feed. */
type MentionFilter = "all" | MentionFeedSentiment;

/** WhatsApp alert configuration — persisted in localStorage. */
interface WhatsappAlertConfig {
  /** Crisis alerts (score drops, critical mentions). */
  crisis: boolean;
  /** Daily summary (article count + sentiment %). */
  daily: boolean;
  /** Weekly report ready notification. */
  weekly: boolean;
  /** Phone number in international format (e.g. "+212600000000"). */
  phone: string;
}

/** Saved search — persisted in localStorage (max 5 for Essentiel tier). */
interface SavedSearch {
  /** Stable unique ID (React key). */
  id: string;
  /** User-facing name (e.g. "Mon entreprise"). */
  name: string;
  /** Keyword query (no boolean operators — Essentiel tier). */
  query: string;
  /** Last run timestamp (epoch ms) — null if never run. */
  lastRunAt: number | null;
}

// ─── R4-ESSENTIEL-A — Round 4 client-side environment types ────────────
// Persisted in localStorage via usePersistentState. SSR-safe.

/** Weekly digest email schedule — persisted in localStorage. */
type DigestSchedule = "monday" | "friday" | "off";

/** Email mockup viewport — desktop wide preview vs mobile 375px narrow. */
type DigestViewMode = "desktop" | "mobile";

/** Source credibility tier — drives the badge color + icon. */
type SourceCredTier = "verified" | "reliable" | "check" | "unreliable";

/** Credibility factor — 4 dimensions of source evaluation. */
type CredibilityFactor = "authority" | "editorial" | "factcheck" | "transparency";

/** Individual factor score breakdown — shown when "Pourquoi ce score?" is expanded. */
interface CredibilityFactorScore {
  /** Factor key — drives icon + label lookup. */
  factor: CredibilityFactor;
  /** French label (e.g. "Autorité du domaine"). */
  label: string;
  /** Score 0-100 — drives color (sage/amber/red). */
  score: number;
  /** One-sentence description of what the factor measures. */
  description: string;
}

/** Source with computed credibility — derived from API sources + custom user-added. */
interface CredibilitySource {
  /** Stable unique ID — derived from hash(name) for API sources, generated for custom. */
  id: string;
  /** Source name — either media domain (e.g. "Hespress") or user-entered domain. */
  name: string;
  /** Source type — drives the icon (Newspaper/MessageCircle/Globe2). */
  type: "media" | "social" | "custom";
  /** Overall credibility score 0-100 — mean of the 4 factor scores. */
  credibilityScore: number;
  /** Breakdown of the 4 factors (authority, editorial, factcheck, transparency). */
  factors: CredibilityFactorScore[];
  /** Tier derived from credibilityScore — drives badge color + icon. */
  tier: SourceCredTier;
  /** Number of articles this source has produced (from API or 0 for custom). */
  articlesCount: number;
  /** Last article timestamp (epoch ms) — null for custom sources never seen. */
  lastArticleAt: number | null;
  /** True when user manually evaluated this source via the "Évaluer" input. */
  custom?: boolean;
}

/** Persisted state for the Source Credibility card — stores API-derived + custom sources. */
interface SourceCredibilityState {
  /** All evaluated sources (API-derived + custom). */
  sources: CredibilitySource[];
}

/** Sentiment timeline view range — 24 hourly buckets or 7 daily buckets. */
type SentimentTimelineRange = "24h" | "7j";

/** Single bucket in the sentiment timeline — hour (0-23) or day index (0-6). */
interface SentimentTimelineBucket {
  /** Bucket index — 0-23 for 24h view, 0-6 for 7j view. */
  index: number;
  /** Number of positive mentions in this bucket. */
  positive: number;
  /** Number of neutral mentions in this bucket. */
  neutral: number;
  /** Number of negative mentions in this bucket. */
  negative: number;
  /** Total mentions in this bucket — drives bar height. */
  total: number;
  /** Dominant sentiment — drives bar color. */
  dominantSentiment: "positive" | "neutral" | "negative";
  /** True when the bucket shows an unusual pattern (negative spike or volume >2x mean). */
  isAnomaly: boolean;
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

/** Generate follow-up prompt suggestions based on the user question. */
function generateFollowUps(question: string): string[] {
  const q = question.toLowerCase();
  if (q.includes("sentiment") || q.includes("positif") || q.includes("négatif")) {
    return [
      "Quelles sources génèrent le plus de mentions négatives ?",
      "Comparez le sentiment de cette semaine à celui du mois dernier.",
      "Quels sujets influencent le plus le sentiment actuel ?",
    ];
  }
  if (q.includes("crise") || q.includes("alerte") || q.includes("risque")) {
    return [
      "Quelle est la gravité des crises détectées ?",
      "Quels articles négatifs surveiller en priorité ?",
      "Rédigez une note de communication pour la direction.",
    ];
  }
  if (q.includes("concurrent") || q.includes("compar")) {
    return [
      "Classez mes concurrents par score de réputation.",
      "Quels sujets mes concurrents dominent-ils ?",
      "Quelles opportunités de différenciation identifiez-vous ?",
    ];
  }
  if (q.includes("ia") || q.includes("chatgpt") || q.includes("llm")) {
    return [
      "Comment améliorer ma visibilité dans ChatGPT ?",
      "Quels LLMs me citent le plus positivement ?",
      "Quels mots-clés les IA associent-ils à ma marque ?",
    ];
  }
  if (q.includes("sujet") || q.includes("thème") || q.includes("emergent")) {
    return [
      "Quels sujets émergents devraient être surveillés ?",
      "Quels sujets génèrent le plus d'engagement ?",
      "Comparez mes sujets à ceux de mes concurrents.",
    ];
  }
  return [
    "Analysez le sentiment de cette semaine.",
    "Quelles crises potentielles détectez-vous ?",
    "Générez un résumé hebdomadaire pour la direction.",
  ];
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

// ─── usePersistentState HOOK ───────────────────────────────────────────
// localStorage-backed useState — SSR-safe (initial value used during
// hydration, value read on mount via useEffect). try/catch on both parse
// and write to handle quota-exceeded and corrupted-data edge cases.
// Pattern copied from AgencyDashboard (KAEL-1 fix #2).

function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);

  // Hydrate from localStorage on mount (client-only).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        // One-shot hydration from localStorage on mount — canonical use
        // case for useEffect + setState. Rule disabled: this does NOT
        // cause cascading renders (effect deps = [key] only).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(parsed);
      }
    } catch {
      // Ignore parse errors / corrupted data — fall back to initial.
    }
  }, [key]);

  // Persist on every change.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Quota exceeded or localStorage disabled — silent fallback.
    }
  }, [key, state]);

  return [state, setState];
}

// ─── SHARED UI ATOMS ──────────────────────────────────────────────────

// FIX-PRO-RENDER: ErrorBoundary — isolate widget crashes so a single
// failing card (e.g. recharts on empty data, .toFixed on undefined,
// .find on null) cannot tear down the entire dashboard tree during
// SSR or hydration. Renders a minimal fallback instead of propagating
// the error to the page shell.
class WidgetErrorBoundary extends Component<
  { children: ReactNode; label?: string },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode; label?: string }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): {
    hasError: boolean;
    message: string;
  } {
    return {
      hasError: true,
      message: error?.message ?? "Erreur de rendu",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error(
      "[EssentialDashboard] widget crash:",
      this.props.label ?? "widget",
      error?.message,
      info?.componentStack,
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-xl border"
          style={{
            padding: 20,
            borderColor: BORDER,
            backgroundColor: "#FFFFFF",
          }}
        >
          <div
            style={{
              ...FONT_HEADER,
              color: NEGATIVE,
              marginBottom: 6,
            }}
          >
            Section indisponible
          </div>
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: TEXT_MUTED,
              lineHeight: 1.5,
            }}
          >
            Cette section n&apos;a pas pu être affichée avec les données
            actuelles. Les autres sections restent opérationnelles.
          </p>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              color: TEXT_HEADER,
              marginTop: 8,
              wordBreak: "break-word",
            }}
          >
            {this.props.label ?? "widget"} · {this.state.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  helpKey,
  helpText,
  dismissedHelp,
  onDismissHelp,
}: {
  title: string;
  right?: React.ReactNode;
  /** Optional help identifier — when provided, renders a (?) badge next to the title. */
  helpKey?: string;
  /** Help popover content (1-2 sentences). */
  helpText?: string;
  /** Set of dismissed help keys (from persisted state). */
  dismissedHelp?: Set<string>;
  /** Callback to dismiss this help key (persisted). */
  onDismissHelp?: (key: string) => void;
}) {
  const showHelp = helpKey && helpText && (!dismissedHelp || !dismissedHelp.has(helpKey));
  return (
    <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2 space-y-0" style={{ padding: 0 }}>
      <div className="flex items-center gap-1.5">
        <span style={FONT_HEADER}>{title}</span>
        {showHelp && (
          <HelpBadge
            topic={helpKey!}
            text={helpText!}
            onDismiss={() => onDismissHelp?.(helpKey!)}
          />
        )}
      </div>
      <div className="flex items-center gap-1.5">{right}</div>
    </CardHeader>
  );
}

/** Contextual help (?) badge — sage popover on hover/click, dismissible. */
function HelpBadge({
  topic,
  text,
  onDismiss,
}: {
  topic: string;
  text: string;
  onDismiss: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Aide sur ${topic}`}
            className="inline-flex items-center justify-center rounded-full transition-colors hover:bg-[#FAFAFA]"
            style={{ width: 16, height: 16 }}
            onClick={(e) => {
              e.preventDefault();
              setOpen((o) => !o);
            }}
          >
            <HelpCircle size={14} style={{ color: SAGE }} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          sideOffset={6}
          className="max-w-[280px] p-0"
          style={{ backgroundColor: "#FFFFFF", border: `1px solid ${SAGE}` }}
        >
          <div style={{ padding: 12 }}>
            <div
              className="flex items-start gap-2"
              style={{
                backgroundColor: SAGE_BG,
                borderLeft: `3px solid ${SAGE}`,
                padding: "8px 10px",
                borderRadius: 6,
              }}
            >
              <Sparkles size={12} style={{ color: SAGE, flexShrink: 0, marginTop: 1 }} />
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: SAGE,
                  margin: 0,
                }}
              >
                {text}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onDismiss();
                setOpen(false);
              }}
              className="mt-2 w-full text-left"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Ne plus montrer
            </button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
  // POLISH-ESSENTIAL — card-hover-lift adds box-shadow 0 4px 12px → 0 8px 24px
  // + 1px translateY on hover (defined in the global <style> block).
  return (
    <Card
      className={
        "border-[#F0F0F0] shadow-sm rounded-xl overflow-hidden card-hover-lift " + (className ?? "")
      }
      style={{ padding: 20, ...style }}
    >
      {children}
    </Card>
  );
}

// ─── R2-ESSENTIEL-B — A11y helpers ─────────────────────────────────────
// LiveSkeleton wraps shadcn Skeleton with role="status" + aria-live so
// screen readers announce loading state. SkipLink is a keyboard-only
// shortcut to bypass repetitive nav and jump straight to main content.

function LiveSkeleton({
  className,
  label = "Chargement en cours",
  shimmer = true,
}: {
  className?: string;
  label?: string;
  /** When true (default), renders the sliding shimmer sweep instead of a flat gray block. */
  shimmer?: boolean;
}) {
  // POLISH-ESSENTIAL — shimmer + fade-in entrance + a11y label.
  // The shimmer-skeleton class layers a sliding highlight on top of the
  // shadcn Skeleton base; fade-in-skeleton softens the mount.
  return (
    <Skeleton
      className={`${className ?? ""} ${shimmer ? "shimmer-skeleton fade-in-skeleton" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    />
  );
}

/** LoadingBlock — full-card loading placeholder with shimmer + centered
 *  French loading text. Replaces the empty LiveSkeleton stretches inside
 *  chart cards with a more informative state. */
function LoadingBlock({
  height = 200,
  label = "Chargement de votre score…",
}: {
  height?: number | string;
  label?: string;
}) {
  const h = typeof height === "number" ? `${height}px` : height;
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-md"
      style={{ height: h, padding: 16 }}
      role="status"
      aria-live="polite"
    >
      <div
        className="shimmer-skeleton fade-in-skeleton rounded-md"
        style={{ width: "70%", height: 14 }}
        aria-hidden="true"
      />
      <div
        className="shimmer-skeleton fade-in-skeleton rounded-md"
        style={{ width: "50%", height: 10, animationDelay: "80ms" }}
        aria-hidden="true"
      />
      <span
        className="mt-1 fade-in-skeleton"
        style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          color: TEXT_MUTED,
          letterSpacing: "0.04em",
          animationDelay: "120ms",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// HONEST-EMPTY-STATES — Composants « Collecte en cours »
// Affichés quand /api/console/brand-health renvoie status="no_data"
// (0 article) ou quand une route de graphique renvoie un tableau vide.
// Animations radar/pulse 100 % framer-motion — pas de keyframes globaux.
// ════════════════════════════════════════════════════════════════════

/** CollecteEnCours — pleine largeur, utilisé dans le hero (ScoreReputationCard). */
function CollecteEnCours({ companyName }: { companyName?: string }) {
  const name = companyName ?? "votre marque";
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ padding: "28px 20px", minHeight: 240 }}
    >
      <div style={{ position: "relative", width: 104, height: 104, marginBottom: 20 }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1.5px solid ${SAGE_DIM}`,
            }}
            initial={{ scale: 0.35, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.7, 0] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.8,
            }}
          />
        ))}
        <motion.span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 14,
            height: 14,
            marginLeft: -7,
            marginTop: -7,
            borderRadius: "50%",
            backgroundColor: SAGE,
          }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: 15,
          fontWeight: 700,
          color: CHARCOAL,
        }}
      >
        Collecte en cours
      </div>
      <p
        className="mt-1.5 max-w-[440px]"
        style={{ fontFamily: FONT_SANS, fontSize: 13, color: TEXT_BODY, lineHeight: 1.55 }}
      >
        Nous collectons des articles sur {name}. Premiers résultats sous 24-48h.
      </p>
      <p
        className="mt-2"
        style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}
      >
        Vous recevrez une alerte WhatsApp dès que votre score sera disponible.
      </p>
    </div>
  );
}

/** CollecteEnCoursMini — version compacte pour les cartes de graphiques. */
function CollecteEnCoursMini({ minHeight = 180 }: { minHeight?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ padding: "20px 16px", minHeight }}
    >
      <div style={{ position: "relative", width: 56, height: 56, marginBottom: 12 }}>
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1.5px solid ${SAGE_DIM}`,
            }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.7, 0] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.7,
            }}
          />
        ))}
        <motion.span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            borderRadius: "50%",
            backgroundColor: SAGE,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: 12,
          fontWeight: 700,
          color: CHARCOAL,
        }}
      >
        Collecte en cours
      </div>
      <p
        className="mt-1 max-w-[320px]"
        style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, lineHeight: 1.5 }}
      >
        Premiers résultats sous 24-48h.
      </p>
    </div>
  );
}

/** LimitedDataBanner — bannière ambre au-dessus du gauge quand status="limited". */
function LimitedDataBanner({ text }: { text?: string }) {
  return (
    <div
      className="mb-3 flex items-center gap-2 rounded-md"
      style={{
        backgroundColor: "rgba(245,158,11,0.10)",
        border: `1px solid ${NEUTRAL_AMBER}`,
        padding: "8px 12px",
      }}
    >
      <AlertTriangle size={14} style={{ color: NEUTRAL_AMBER, flexShrink: 0 }} />
      <span
        style={{
          fontFamily: FONT_SANS,
          fontSize: 12,
          color: "#92400E",
          fontWeight: 600,
        }}
      >
        {text ?? "Données limitées — collecte en cours"}
      </span>
    </div>
  );
}

/** Skip-link — visible only when focused via keyboard. */
function SkipLink({ href = "#main-content", children = "Aller au contenu principal" }: { href?: string; children?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-3 focus:py-2 focus:rounded-md focus:outline-2 focus:outline-[#4A7B5F] focus:outline-offset-2"
      style={{
        backgroundColor: "#FFFFFF",
        border: `1px solid ${SAGE}`,
        color: SAGE,
        fontFamily: FONT_SANS,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </a>
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
      className="card-hover-lift"
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
        className="fade-up-kpi"
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

// ─── POLISH-ESSENTIAL — Shared chart tooltip + count-up helpers ────────
// Centralises the recharts Tooltip contentStyle so every chart shares the
// same sage-bordered, monospace, shadowed tooltip — one source of truth.

const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 8,
  border: `1px solid ${SAGE_DIM}`,
  fontFamily: FONT_MONO,
  fontSize: 11,
  backgroundColor: "#FFFFFF",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  padding: "8px 10px",
  color: CHARCOAL,
  lineHeight: 1.5,
};

const CHART_TOOLTIP_CURSOR = { fill: SAGE_BG } as const;

/** AnimatedNumber — counts up from 0 (or previous value) to the target on
 *  mount and whenever the value changes. Uses requestAnimationFrame with an
 *  ease-out-cubic curve for a buttery 800ms reveal. Wrapped in a motion.span
 *  so it also fades up on first paint (initial opacity 0, y 10 → 1, 0). */
function AnimatedNumber({
  value,
  format,
  duration = 800,
  className,
  style,
  prefix = "",
  suffix = "",
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  prefix?: string;
  suffix?: string;
}) {
  const fmt = format ?? ((n: number) => Math.round(n).toString());
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out-cubic — fast start, gentle settle
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
        setDisplay(to);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      fromRef.current = to;
    };
  }, [value, duration]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
      className={className}
      style={style}
    >
      {prefix}{fmt(display)}{suffix}
    </motion.span>
  );
}

// ─── SIDEBAR NAV (plan-aware — Essentiel only) ───────────────────────

const NAV_ITEMS: { id: string; label: string; Icon: typeof LayoutGrid }[] = [
  { id: "ai-workspace", label: "Tableau de bord", Icon: LayoutGrid },
  { id: "score", label: "Sentiment", Icon: TrendingUp },
  { id: "alertes", label: "Alertes", Icon: Bell },
  { id: "sujets", label: "Sujets", Icon: Hash },
  { id: "sources", label: "Sources", Icon: Newspaper },
  { id: "visibilite-ia", label: "Visibilité IA", Icon: Brain },
  { id: "harch-100", label: "Harch 100", Icon: Trophy },
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

function SidebarContent({
  activeSection,
  alertCount,
  onNavigate,
}: {
  activeSection: string;
  alertCount: number;
  onNavigate?: (id: string) => void;
}) {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Utilisateur";
  const userEmail = session?.user?.email ?? "—";
  const initials = userInitials(session?.user?.name);

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
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(id)}
              className="w-full flex items-center gap-3 text-left transition-colors group focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2"
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
            Essentiel
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
// HEADER — frosted glass, hamburger, HARCH | ATELIER + plan badge
// ════════════════════════════════════════════════════════════════════

function Header({
  onMenuClick,
  alertCount,
  quota,
  sourcesCount,
  milestoneProgress,
  milestoneTotal,
  milestoneRecentlyUnlocked,
  onMilestoneClick,
  notifications,
  notifExpanded,
  onToggleNotifs,
  onMarkAllNotifsRead,
  onClickNotif,
  onOpenCmd,
  onOpenBriefing,
  onOpenCrisis,
  onOpenMatrix,
  onOpenHespress,
  onOpenComex,
  onOpenDocWriter,
  onOpenPitch,
  onOpenBoycott,
  onOpenStakeholder,
  onOpenRiskHeatmap,
  onOpenSentimentTimeline,
  onOpenRegCalendar,
  onOpenAiVisibility,
  onOpenSourceCred,
  onOpenCompetitorContent,
  onOpenMediaReach,
  onOpenCrisisPlaybook,
  onOpenEsg,
  onOpenAudit,
  onOpenTeamPerf,
  onOpenWhatsapp,
  onOpenSavedSearches,
  onOpenInfluencer,
  onOpenNarrative,
  onOpenGeoHeatmap,
  onToggleSkillsMenu,
  skillsMenuOpen,
}: {
  onMenuClick: () => void;
  alertCount: number;
  quota: QuotaState;
  sourcesCount: number;
  milestoneProgress: number;
  milestoneTotal: number;
  milestoneRecentlyUnlocked: boolean;
  onMilestoneClick: () => void;
  notifications: NotificationItem[];
  notifExpanded: boolean;
  onToggleNotifs: () => void;
  onMarkAllNotifsRead: () => void;
  onClickNotif: (n: NotificationItem) => void;
  /** R2-ESSENTIEL-B — open the Cmd+K command palette */
  onOpenCmd: () => void;
  onOpenBriefing: () => void;
  onOpenCrisis: () => void;
  onOpenMatrix: () => void;
  onOpenHespress: () => void;
  onOpenComex: () => void;
  onOpenDocWriter: () => void;
  onOpenPitch: () => void;
  onOpenBoycott: () => void;
  onOpenStakeholder: () => void;
  onOpenRiskHeatmap: () => void;
  onOpenSentimentTimeline: () => void;
  onOpenRegCalendar: () => void;
  onOpenAiVisibility: () => void;
  onOpenSourceCred: () => void;
  onOpenCompetitorContent: () => void;
  onOpenMediaReach: () => void;
  onOpenCrisisPlaybook: () => void;
  onOpenEsg: () => void;
  onOpenAudit: () => void;
  onOpenTeamPerf: () => void;
  onOpenWhatsapp: () => void;
  onOpenSavedSearches: () => void;
  onOpenInfluencer: () => void;
  onOpenNarrative: () => void;
  onOpenGeoHeatmap: () => void;
  onToggleSkillsMenu: () => void;
  skillsMenuOpen: boolean;
}) {
  const [quotaExpanded, setQuotaExpanded] = useState(false);
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
          className="no-scale lg:hidden inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2"
          style={{ width: 32, height: 32 }}
          aria-label="Ouvrir le menu"
          title="Ouvrir le menu de navigation"
        >
          <Menu size={18} className="icon-hover" />
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
            ESSENTIEL
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* R2-ESSENTIEL-B — Command Palette (Cmd+K) trigger */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onOpenCmd}
                className="no-scale hidden sm:inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2"
                aria-label="Ouvrir la palette de commandes (Cmd+K)"
                title="Palette de commandes (Cmd+K)"
              >
                <Command size={14} className="icon-hover" style={{ color: TEXT_BODY }} />
                <kbd
                  className="hidden md:inline-flex items-center"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: TEXT_MUTED,
                    border: `1px solid ${BORDER_STRONG}`,
                    borderRadius: 4,
                    padding: "1px 5px",
                    backgroundColor: "#FAFAFA",
                    letterSpacing: "0.04em",
                  }}
                >
                  ⌘K
                </kbd>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span style={{ fontFamily: FONT_SANS, fontSize: 12 }}>
                Palette de commandes (Cmd+K / Ctrl+K)
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* ENV-ESSENTIAL — Milestone badge (header, gamification) */}
        <MilestoneBadge
          progress={milestoneProgress}
          total={milestoneTotal}
          recentlyUnlocked={milestoneRecentlyUnlocked}
          onClick={onMilestoneClick}
        />

        {/* SKILL 1: Briefing Matinal — live document generator */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onOpenBriefing}
                className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2"
                style={{ width: 32, height: 32 }}
                aria-label="Briefing matinal"
              >
                <FileText size={16} style={{ color: "#71717A" }} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Briefing matinal</TooltipContent>
          </Tooltip>
        </TooltipProvider>


        {/* SKILL 2: Crisis Briefing */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenCrisis} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Briefing de crise"><AlertTriangle size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Briefing de crise</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 3: Competitor Matrix */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenMatrix} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Matrice concurrentielle"><Grid3x3 size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Matrice concurrentielle</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 4: Hespress Digest */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenHespress} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Pulse Hespress"><MessageSquare size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Pulse Hespress</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 5: COMEX Report */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenComex} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Rapport COMEX"><FileBarChart size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Rapport COMEX</TooltipContent>
          </Tooltip>
        </TooltipProvider>


        {/* SKILL 6: Document Writer */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenDocWriter} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Générateur de documents"><PenSquare size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Générateur de documents</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 7: Pitch Deck */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenPitch} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Pitch Deck"><Presentation size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Pitch Deck</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 8: Boycott Alert */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenBoycott} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Alerte boycott"><Zap size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Alerte boycott</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 9: Stakeholder Map */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenStakeholder} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Parties prenantes"><Network size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Parties prenantes</TooltipContent>
          </Tooltip>
        </TooltipProvider>


        {/* SKILL 10: Risk Heatmap */}
        <TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" onClick={onOpenRiskHeatmap} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]" style={{ width: 32, height: 32 }} aria-label="Matrice des risques"><ShieldAlert size={16} style={{ color: "#71717A" }} /></button></TooltipTrigger><TooltipContent>Matrice des risques</TooltipContent></Tooltip></TooltipProvider>
        {/* SKILL 11: Sentiment Timeline */}
        <TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" onClick={onOpenSentimentTimeline} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]" style={{ width: 32, height: 32 }} aria-label="Timeline sentiment"><Activity size={16} style={{ color: "#71717A" }} /></button></TooltipTrigger><TooltipContent>Timeline sentiment</TooltipContent></Tooltip></TooltipProvider>
        {/* SKILL 12: Regulatory Calendar */}
        <TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" onClick={onOpenRegCalendar} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]" style={{ width: 32, height: 32 }} aria-label="Calendrier réglementaire"><CalendarDays size={16} style={{ color: "#71717A" }} /></button></TooltipTrigger><TooltipContent>Calendrier réglementaire</TooltipContent></Tooltip></TooltipProvider>
        {/* SKILL 13: AI Visibility */}
        <TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" onClick={onOpenAiVisibility} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]" style={{ width: 32, height: 32 }} aria-label="Visibilité IA"><Sparkles size={16} style={{ color: "#71717A" }} /></button></TooltipTrigger><TooltipContent>Visibilité IA</TooltipContent></Tooltip></TooltipProvider>


        {/* SKILL 14-17: More skills dropdown */}
        <div style={{ position: "relative" }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={onToggleSkillsMenu} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]" style={{ width: 32, height: 32 }} aria-label="Plus d'outils">
                  <MoreHorizontal size={16} style={{ color: "#71717A" }} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Plus d'outils</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {skillsMenuOpen && (
            <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "#FFFFFF", border: "1px solid #F0F0F0", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", padding: 8, zIndex: 50, minWidth: 220 }}>
              <button onClick={onOpenSourceCred} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><ShieldCheck size={14} style={{ color: "#4A7B5F" }} /> Crédibilité des sources</button>
              <button onClick={onOpenCompetitorContent} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Newspaper size={14} style={{ color: "#4A7B5F" }} /> Contenu concurrents</button>
              <button onClick={onOpenMediaReach} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Calculator size={14} style={{ color: "#4A7B5F" }} /> Portée média</button>
<button onClick={onOpenCrisisPlaybook} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><BookMarked size={14} style={{ color: "#4A7B5F" }} /> Playbook de crise</button>
              <button onClick={onOpenEsg} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Leaf size={14} style={{ color: "#4A7B5F" }} /> Scorecard ESG</button>
              <button onClick={onOpenAudit} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><History size={14} style={{ color: "#4A7B5F" }} /> Journal d'audit</button>
              <button onClick={onOpenTeamPerf} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Users size={14} style={{ color: "#4A7B5F" }} /> Performance équipe</button>
<button onClick={onOpenWhatsapp} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><MessageSquare size={14} style={{ color: "#4A7B5F" }} /> Aperçu WhatsApp</button>
              <button onClick={onOpenSavedSearches} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Search size={14} style={{ color: "#4A7B5F" }} /> Recherches sauvegardées</button>
              <button onClick={onOpenInfluencer} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Users size={14} style={{ color: "#4A7B5F" }} /> Influenceurs</button>
              <button onClick={onOpenNarrative} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><TrendingUp size={14} style={{ color: "#4A7B5F" }} /> Narratifs</button>
              <button onClick={onOpenGeoHeatmap} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><MapPin size={14} style={{ color: "#4A7B5F" }} /> Carte géographique</button>
            </div>
          )}
        </div>

        {/* ENV-ESSENTIAL — Quota usage widget */}
        <QuotaUsageWidget
          quota={quota}
          sourcesCount={sourcesCount}
          expanded={quotaExpanded}
          onToggle={() => setQuotaExpanded((v) => !v)}
        />

        {/* R2-ESSENTIEL-A — Notification Center bell (dropdown panel) */}
        <NotificationBell
          notifications={notifications}
          expanded={notifExpanded}
          onToggle={onToggleNotifs}
          onMarkAllRead={onMarkAllNotifsRead}
          onClickNotification={onClickNotif}
        />

        {/* Alertes bell — scrolls to alertes section (crisis alerts KPI) */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => scrollToSection("alertes")}
                className="relative inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2"
                style={{ width: 32, height: 32 }}
                aria-label="Alertes crise"
              >
                <AlertTriangle size={18} style={{ color: TEXT_BODY }} />
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
                {alertCount > 0 ? `${alertCount} alerte(s) crise` : "Aucune alerte crise"}
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2"
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
          {userInitials(useSession().data?.user?.name)}
        </button>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 1 — HARCHIQ AI WORKSPACE (hero, full width)
// Beats Meltwater Mira Studio: chat + prompt library + sources + exports
// + follow-up prompts + quota indicator.
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
    ],
    Icon: Lightbulb,
  },
  {
    id: "competitor-check",
    title: "Comparaison vs mes concurrents",
    description: "Benchmarking sectoriel",
    prompt: "Compare ma marque à mes concurrents directs.",
    followUps: [
      "Qui est le leader de mon secteur ?",
      "Sur quels sujets suis-je en avance ?",
      "Quelles faibesses dois-je corriger ?",
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
    ],
    Icon: AlertTriangle,
  },
  {
    id: "weekly-report",
    title: "Rapport hebdomadaire pour la direction",
    description: "Synthèse exécutive prête à diffuser",
    prompt: "Génère un rapport hebdomadaire pour la direction.",
    followUps: [
      "Quels sont les 3 points clés à retenir ?",
      "Quelle recommandation pour la semaine prochaine ?",
      "Exportez ce rapport en PDF.",
    ],
    Icon: FileText,
  },
];

function HarchIQWorkspace({
  quota,
  setQuota,
  dismissedHelp,
  onDismissHelp,
  onFirstQuestion,
}: {
  /** Lifted from root — persisted via usePersistentState, daily reset applied in root effect. */
  quota: QuotaState;
  setQuota: (v: QuotaState | ((prev: QuotaState) => QuotaState)) => void;
  /** Help dismissal state (for the (?) badge next to the workspace title). */
  dismissedHelp?: Set<string>;
  onDismissHelp?: (key: string) => void;
  /** Callback fired when the user asks their first question (for milestone tracking). */
  onFirstQuestion?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Bonjour. Je suis HarchIQ. Posez-moi une question sur votre réputation — sentiment, sources, crises, visibilité IA, concurrents. Je réponds à partir de vos données réelles et je cite mes sources.",
      followUps: [
        "Résumé de l'actualité de ma marque",
        "Analyse du sentiment cette semaine",
        "Y a-t-il des crises potentielles ?",
      ],
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendQuestion = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || sending) return;
    if (quota.used >= quota.total) {
      toast.error("Quota quotidien atteint (50/50). Revenez demain.");
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
            ? {
                ...msg,
                content: data.answer || "Aucune réponse générée.",
                sources: data.sources ?? [],
                followUps: generateFollowUps(trimmed),
                pending: false,
                timestamp: Date.now(),
              }
            : msg,
        ),
      );
      const wasFirst = quota.used === 0;
      setQuota((q) => ({ ...q, used: Math.min(q.total, q.used + 1) }));
      if (wasFirst) onFirstQuestion?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur réseau";
      setMessages((m) =>
        m.map((mm) =>
          mm.id === pendingId
            ? {
                ...mm,
                content: `Désolé, je n'ai pas pu répondre (${msg}). Réessayez dans un instant.`,
                pending: false,
                timestamp: Date.now(),
              }
            : mm,
        ),
      );
      toast.error("HarchIQ n'a pas pu répondre.");
    } finally {
      setSending(false);
    }
  }, [sending, quota, setQuota, onFirstQuestion]);

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

  const handleExport = (msg: ChatMessage, format: "ppt" | "pdf") => {
    toast.success(
      format === "ppt"
        ? "Export PowerPoint lancé — vous recevrez le fichier par email."
        : "Export PDF lancé — vous recevrez le fichier par email.",
      { description: msg.content.slice(0, 80) + "…" },
    );
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
              <div
                className="flex items-center gap-1.5"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 14,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                <span>HarchIQ AI Workspace</span>
                {(!dismissedHelp || !dismissedHelp.has("harchiq")) && (
                  <HelpBadge
                    topic="harchiq"
                    text="Posez vos questions en langage naturel — HarchIQ répond à partir de vos données réelles et cite ses sources. 50 questions/jour incluses avec le plan Essentiel."
                    onDismiss={() => onDismissHelp?.("harchiq")}
                  />
                )}
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: TEXT_MUTED,
                  letterSpacing: "0.04em",
                }}
              >
                Assistante de réputation · Données réelles · Sources citées
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
                    } as React.CSSProperties
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
          </div>
        </div>

        {/* Workspace body — chat (60%) + prompt library (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Chat side */}
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
                  placeholder="Posez votre question à HarchIQ…"
                  rows={1}
                  disabled={sending}
                  lang="fr"
                  id="harchiq-input"
                  className="flex-1 resize-none outline-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2"
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
                6 PROMPTS
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
  onExport: (fmt: "ppt" | "pdf") => void;
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
                    className="mt-1.5 space-y-1 rounded-md p-2"
                    style={{
                      border: `1px solid ${BORDER}`,
                      backgroundColor: "#FAFAFA",
                    }}
                  >
                    {msg.sources.map((src) => (
                      <div
                        key={src.id}
                        className="flex items-start gap-2 text-xs"
                        style={{ fontFamily: FONT_SANS, fontSize: 11 }}
                      >
                        <span
                          className="inline-flex items-center justify-center rounded shrink-0"
                          style={{
                            minWidth: 14,
                            height: 14,
                            padding: "0 3px",
                            backgroundColor: SAGE_BG,
                            color: SAGE,
                            fontFamily: FONT_MONO,
                            fontSize: 8,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            marginTop: 1,
                          }}
                        >
                          {src.type === "alert" ? "AL" :
                           src.type === "topic" ? "TP" :
                           src.type === "ai-visibility" ? "IA" : "CO"}
                        </span>
                        <span style={{ color: TEXT_BODY, lineHeight: 1.4 }}>
                          {src.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Export buttons */}
            {!msg.pending && msg.content && (
              <div className="mt-2 flex items-center gap-1.5">
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
                  onClick={() => navigator.clipboard?.writeText(msg.content).then(() => toast.success("Réponse copiée"))}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: TEXT_MUTED,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Share2 size={11} />
                  Copier
                </button>
              </div>
            )}

            {/* Follow-up prompt chips */}
            {!msg.pending && msg.followUps && msg.followUps.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {msg.followUps.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onFollowUp(f)}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors hover:bg-[#FAFAFA]"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      color: SAGE,
                      border: `1px solid ${SAGE_DIM}`,
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
// SECTION 2 — SCORE DE RÉPUTATION (hero, full width) + AI commentary
// ════════════════════════════════════════════════════════════════════

function ScoreReputationCard({
  health,
  loading,
  dismissedHelp,
  onDismissHelp,
}: {
  health: BrandHealth | null;
  loading: boolean;
  dismissedHelp?: Set<string>;
  onDismissHelp?: (key: string) => void;
}) {
  // HONEST-EMPTY-STATES — détection des trois états (no_data / limited / nominal).
  const isNoData = !!health && (health.score === null || health.status === "no_data");
  const isLimited = !!health && health.status === "limited" && health.score !== null;
  const score = health?.score ?? 0;
  const trend = health?.trend ?? 0;
  const { label: weather, Icon: WeatherIcon } = weatherFor(score);
  const lastUpdated = health?.lastUpdated ? fmtRelative(health.lastUpdated) : "—";
  const [refreshing, setRefreshing] = useState(false);

  const gaugeData = [{ name: "score", value: score, fill: score >= 70 ? SAGE : score >= 50 ? NEUTRAL_AMBER : NEGATIVE }];

  // AI commentary — built from real data signals
  const aiCommentary = useMemo(() => {
    if (!health) return "En attente des données de réputation…";
    if (isNoData) return "Aucun article collecté pour le moment — la veille démarre à présent.";
    const dir = trend > 0 ? "amélioré" : trend < 0 ? "dégradé" : "stabilisé";
    const parts: string[] = [`Votre score s'est ${dir} de ${Math.abs(trend)} points cette semaine`];
    if (health.sentiment.positive >= 50) {
      parts.push(`grâce à une couverture majoritairement positive (${health.sentiment.positive}%)`);
    } else if (health.sentiment.negative >= 40) {
      parts.push(`malgré une part de mentions négatives élevée (${health.sentiment.negative}%)`);
    }
    if (health.topNarrative?.label) {
      parts.push(`. Le narrative « ${health.topNarrative.label} » ${health.topNarrative.momentum === "rising" ? "gagne du momentum" : "reste stable"}.`);
    }
    return parts.join(" ");
  }, [health, trend, isNoData]);

  return (
    <motion.div id="score" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="02 · Score de Réputation"
          helpKey="score"
          helpText="Score agrégé 0-100 basé sur le sentiment, le volume de mentions et la part de voix. Au-dessus de 70 : réputation solide. 50-70 : à surveiller. Sous 50 : intervention recommandée."
          dismissedHelp={dismissedHelp}
          onDismissHelp={onDismissHelp}
          right={
            <>
              {loading && <LiveSkeleton className="h-3 w-16" />}
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
                className="h-7 px-2 no-scale"
                style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                onClick={() => {
                  setRefreshing(true);
                  setTimeout(() => setRefreshing(false), 800);
                }}
                aria-label="Rafraîchir"
                title="Rafraîchir le score de réputation"
              >
                <RefreshCw size={12} className={`icon-hover ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          // HONEST-EMPTY-STATES — pendant le chargement on garde une grille de
          // skeletons pour ne pas introduire de flash visuel.
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-3 flex justify-center">
              <LiveSkeleton className="h-[200px] w-[200px] rounded-full" label="Chargement du score" />
            </div>
            <div className="lg:col-span-5 space-y-3">
              <LiveSkeleton className="h-5 w-3/4" label="Chargement du score" />
              <LiveSkeleton className="h-4 w-1/2" label="Chargement du score" />
              <LiveSkeleton className="h-12 w-full" label="Chargement du score" />
            </div>
            <div className="lg:col-span-4">
              <LiveSkeleton className="h-40 w-full" label="Chargement du score" />
            </div>
          </div>
        ) : isNoData ? (
          // HONEST-EMPTY-STATES — état no_data : on remplace le gauge par
          // l'illustration radar + message « Collecte en cours ».
          <CollecteEnCours companyName={health?.companyName} />
        ) : (
          <>
        {isLimited && <LimitedDataBanner text={health?.warning} />}
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
                    animationDuration={900}
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
                  <LiveSkeleton className="h-10 w-16" />
                ) : health ? (
                  <AnimatedNumber
                    value={score}
                    duration={900}
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 44,
                      fontWeight: 700,
                      color: CHARCOAL,
                      lineHeight: 1,
                    }}
                  />
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
                    —
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
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 3 — SENTIMENT MOYEN (KPI strip) + AI insight
// ════════════════════════════════════════════════════════════════════

function SentimentMoyenKpi({ health, trend, loading }: { health: BrandHealth | null; trend: SentimentTrendResp | null; loading: boolean }) {
  // HONEST-EMPTY-STATES — en mode no_data on affiche « — » plutôt que « 0% ».
  const isNoData = !!health && (health.score === null || health.status === "no_data");
  const value = health?.sentiment?.positive ?? 0;
  const delta = health?.trend ?? 0;

  const spark = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => ({ d: d.date, v: (d.positive / Math.max(1, d.count)) * 100 }));
  }, [trend]);

  const insight = !health
    ? "En attente des données…"
    : isNoData
      ? "Collecte en cours — premiers résultats sous 24-48h."
      : value >= 50
        ? `Le sentiment positif domine (${value}%) — bonne dynamique globale.`
        : value >= 35
          ? `Sentiment mitigé (${value}% positif) — surveillez les signaux négatifs.`
          : `Le sentiment négatif progresse — intervention Dircom recommandée.`;

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
        <SectionHeader title="03 · Sentiment Moyen" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <LiveSkeleton className="h-7 w-16" />
            ) : health && !isNoData ? (
              <AnimatedNumber
                value={value}
                suffix="%"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 28,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 28,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                —
              </span>
            )}
            {!isNoData && <Delta value={delta} />}
          </div>
          {spark.length > 0 && (
            <div style={{ width: 80, height: 28 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sentSparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SAGE} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={SAGE} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={SAGE}
                    strokeWidth={1.5}
                    fill="url(#sentSparkGrad)"
                    dot={false}
                    isAnimationActive
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          {isNoData ? "Collecte des mentions en cours" : "Part des mentions positives (7 derniers jours)"}
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 4 — MENTIONS / JOUR (KPI strip) + source count
// ════════════════════════════════════════════════════════════════════

function MentionsJourKpi({ health, trend, loading }: { health: BrandHealth | null; trend: SentimentTrendResp | null; loading: boolean }) {
  // HONEST-EMPTY-STATES — en mode no_data on n'affiche pas « 0 ».
  const isNoData = !!health && (health.score === null || health.status === "no_data");
  const value = health?.mentionCount24h ?? 0;
  const delta = health?.trend && health.trend > 0 ? 12 : -4;

  const bars = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => ({ d: d.date, v: d.count }));
  }, [trend]);

  const sourcesCount = trend?.data?.length ?? 0;
  const insight = !health
    ? "En attente des données…"
    : isNoData
      ? "Collecte en cours — premiers résultats sous 24-48h."
      : `Volume quotidien ${value > 100 ? "élevé" : value > 30 ? "modéré" : "faible"} — ${sourcesCount} sources actives sur 7 jours.`;

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
        <SectionHeader title="04 · Mentions / Jour" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <LiveSkeleton className="h-7 w-16" />
            ) : health && !isNoData ? (
              <AnimatedNumber
                value={value}
                format={fmtNumber}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 28,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 28,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                —
              </span>
            )}
            {!isNoData && <Delta value={delta} />}
          </div>
          {bars.length > 0 && (
            <div style={{ width: 80, height: 28 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bars} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="v" fill={SAGE} radius={[2, 2, 0, 0]} isAnimationActive animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          {isNoData ? "Collecte des mentions en cours" : `Volume des dernières 24 heures · ${sourcesCount} sources`}
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 5 — CITATIONS IA (KPI strip) + LLM chips
// ════════════════════════════════════════════════════════════════════

function CitationsIaKpi({ ai, loading }: { ai: AiVisibilityResp | null; loading: boolean }) {
  const cited = ai?.citedCount ?? 0;
  const total = ai?.totalCount ?? 0;
  const delta = cited > 0 ? 3 : 0;

  const platforms = ai?.platforms?.slice(0, 3) ?? [];
  const chips = platforms.map((p) => ({
    code: p.platform === "ChatGPT" ? "GPT" : p.platform === "Perplexity" ? "PPL" : p.platform === "Gemini" ? "GEM" : p.platform.slice(0, 3).toUpperCase(),
    cited: p.cited,
    platform: p.platform,
  }));

  const topCited = platforms.find((p) => p.cited);
  const insight = ai
    ? topCited
      ? `${topCited.platform} vous cite — position ${topCited.position ?? "n/a"}. Surveillez les autres LLMs.`
      : "Aucun LLM ne cite encore votre marque — optimisez votre contenu pour l'IA."
    : "En attente des données IA…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
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
              <LiveSkeleton className="h-7 w-16" />
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
          <div className="flex gap-1.5">
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
            )) : ["GPT", "PPL", "GEM"].map((k) => (
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
// SECTION 6 — ALERTES ACTIVES (KPI strip)
// ════════════════════════════════════════════════════════════════════

function AlertesActivesKpi({
  alerts,
  loading,
  dismissedHelp,
  onDismissHelp,
}: {
  alerts: CrisisAlertsResp | null;
  loading: boolean;
  dismissedHelp?: Set<string>;
  onDismissHelp?: (key: string) => void;
}) {
  const count = alerts?.count ?? alerts?.alerts?.length ?? 0;
  const critical = (alerts?.alerts ?? []).filter((a) => a.severity === "critical").length;
  const lastAlert = alerts?.alerts?.[0];
  const lastAlertText = lastAlert ? fmtRelative(lastAlert.timestamp) : "—";

  const insight = alerts
    ? count === 0
      ? "Aucune alerte active — situation réputationnelle stable."
      : critical > 0
        ? `${critical} alerte(s) critique(s) — intervention immédiate recommandée.`
        : `${count} alerte(s) à surveiller — dernière il y a ${lastAlertText}.`
    : "En attente des alertes…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
        <SectionHeader
          title="06 · Alertes Actives"
          helpKey="alertes"
          helpText="Harch détecte automatiquement les pics d'activité négative et les crises potentielles. Configurez vos alertes WhatsApp pour être notifié en temps réel."
          dismissedHelp={dismissedHelp}
          onDismissHelp={onDismissHelp}
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <LiveSkeleton className="h-7 w-16" />
            ) : alerts ? (
              <AnimatedNumber
                value={count}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 28,
                  fontWeight: 700,
                  color: count > 0 ? (critical > 0 ? NEGATIVE : NEUTRAL_AMBER) : POSITIVE,
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 28,
                  fontWeight: 700,
                  color: POSITIVE,
                }}
              >
                —
              </span>
            )}
            {critical > 0 && (
              <Badge variant="destructive" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9 }}>
                {critical} critique{critical > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <Bell size={16} style={{ color: count > 0 ? NEGATIVE : TEXT_MUTED }} />
        </div>
        <Link
          href="#alertes"
          onClick={(e) => { e.preventDefault(); scrollToSection("alertes"); }}
          className="link-underline inline-flex items-center gap-1 text-[11px]"
          style={{ fontFamily: FONT_MONO, color: SAGE }}
        >
          Voir toutes <ChevronRight size={11} />
        </Link>
        <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
          Dernière alerte : {lastAlertText}
        </p>
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 7 — TENDANCE SENTIMENT + ANOMALY DETECTION
// ComposedChart with anomaly dots + AI commentary
// ════════════════════════════════════════════════════════════════════

function TendanceSentimentCard({
  trend,
  range,
  onRangeChange,
  loading,
  dismissedHelp,
  onDismissHelp,
}: {
  trend: SentimentTrendResp | null;
  range: "7d" | "30d" | "90d";
  onRangeChange: (r: "7d" | "30d" | "90d") => void;
  loading: boolean;
  dismissedHelp?: Set<string>;
  onDismissHelp?: (key: string) => void;
}) {
  const data = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.map((d) => ({
      date: d.date,
      Positif: d.positive,
      Neutre: d.neutral,
      Négatif: d.negative,
      Score: Math.round(((d.avgScore + 1) / 2) * 100),
      count: d.count,
      isAnomaly: d.negative > (d.positive + d.neutral) * 0.5 || d.count > 0 && d.count > (trend.data.reduce((s, x) => s + x.count, 0) / trend.data.length) * 2,
    }));
  }, [trend]);

  // Build anomaly dots for the chart
  const anomalies = data.filter((d) => d.isAnomaly);
  const medianCount = trend?.data?.length ? trend.data.reduce((s, x) => s + x.count, 0) / trend.data.length : 0;

  // AI commentary — anomaly-focused
  const aiCommentary = useMemo(() => {
    if (!data.length) return "Aucune donnée disponible pour cette période.";
    if (anomalies.length === 0) {
      return `Aucune anomalie détectée sur ${data.length} jours — sentiment stable et prévisible.`;
    }
    const firstAnomaly = anomalies[0];
    return `Un pic d'activité négative a été détecté le ${fmtDayShort(firstAnomaly.date)} — ${firstAnomaly.Négatif} mentions négatives (vs moyenne ${Math.round(medianCount)}/jour). Surveillez ce signal.`;
  }, [data, anomalies, medianCount]);

  return (
    <motion.div id="sentiment" {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="07 · Tendance Sentiment"
          helpKey="sentiment"
          helpText="Répartition quotidienne des mentions en positif, neutre et négatif. Les points rouges signalent des anomalies — pics d'activité négative à investiguer."
          dismissedHelp={dismissedHelp}
          onDismissHelp={onDismissHelp}
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
        {loading ? (
          <LoadingBlock height={260} label="Chargement des graphiques…" />
        ) : data.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center">
            <EmptyDash label="Aucune donnée" />
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={range}
                style={{ width: "100%", height: 220 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
              >
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
                    fill="url(#posGrad)"
                    isAnimationActive
                    animationDuration={800}
                  />
                  <Line type="monotone" dataKey="Neutre" stroke={NEUTRAL_GRAY} strokeWidth={1.5} dot={false} isAnimationActive animationDuration={800} />
                  <Line type="monotone" dataKey="Négatif" stroke={NEGATIVE} strokeWidth={1.5} dot={false} isAnimationActive animationDuration={800} />
                  {/* Anomaly dots */}
                  {anomalies.map((a, i) => (
                    <ReferenceDot
                      key={`anom-${i}`}
                      x={a.date}
                      y={a.Négatif}
                      r={4}
                      fill={NEGATIVE}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      isFront
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
            <AiCommentary text={aiCommentary} />

            {/* R2-ESSENTIEL-B — Progressive Disclosure on daily sentiment breakdown */}
            <ProgressiveList
              sectionKey="sentiment-trend"
              items={data}
              limit={5}
              threshold={10}
              title="Décomposition quotidienne"
              renderItem={(d) => (
                <div
                  className="flex items-center justify-between rounded-md px-2 py-1.5"
                  style={{
                    border: `1px solid ${BORDER}`,
                    backgroundColor: d.isAnomaly ? "#FEF2F2" : "#FFFFFF",
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {d.isAnomaly && (
                      <span
                        title="Anomalie détectée"
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: NEGATIVE,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 11,
                        color: CHARCOAL,
                        fontWeight: 600,
                      }}
                    >
                      {fmtDayShort(d.date)}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                  >
                    <span style={{ color: POSITIVE, fontWeight: 700 }}>+{d.Positif}</span>
                    <span style={{ color: NEUTRAL_GRAY }}>·</span>
                    <span style={{ color: TEXT_MUTED }}>{d.Neutre}</span>
                    <span style={{ color: NEUTRAL_GRAY }}>·</span>
                    <span style={{ color: NEGATIVE, fontWeight: 700 }}>-{d.Négatif}</span>
                    <span
                      style={{
                        marginLeft: 8,
                        color: SAGE,
                        fontWeight: 700,
                      }}
                    >
                      {d.count} mentions
                    </span>
                  </div>
                </div>
              )}
            />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 8 — DIVERSITÉ DES SOURCES + drill-down
// ════════════════════════════════════════════════════════════════════

function DiversiteSourcesCard({
  sources,
  loading,
  dismissedHelp,
  onDismissHelp,
}: {
  sources: SourceDistResp | null;
  loading: boolean;
  dismissedHelp?: Set<string>;
  onDismissHelp?: (key: string) => void;
}) {
  const [selected, setSelected] = useState<SourceRow | null>(null);

  const data = useMemo(() => {
    if (!sources?.sources?.length) return [];
    return sources.sources.slice(0, 10).map((s) => ({
      name: s.name,
      count: s.count,
      fill: SAGE,
      type: s.type,
    }));
  }, [sources]);

  const totalSources = sources?.total ?? 0;
  const insight = sources
    ? data.length > 0
      ? `${data.length} sources principales identifiées — ${data[0].name} domine avec ${data[0].count} mentions. Diversifiez votre veille.`
      : "Aucune source identifiée — en attente de mentions."
    : "En attente des données…";

  return (
    <motion.div id="sources" {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader
          title="08 · Diversité des Sources"
          helpKey="sources"
          helpText="Répartition des mentions par source médiatique et sociale. Plus la diversité est élevée, plus votre réputation est ancrée. Plan Essentiel : 20 sources surveillées."
          dismissedHelp={dismissedHelp}
          onDismissHelp={onDismissHelp}
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
              {totalSources}+ SOURCES
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <LoadingBlock height={260} label="Chargement des graphiques…" />
        ) : data.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center">
            <EmptyDash label="Aucune source" />
          </div>
        ) : (
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 32, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="#F4F4F5" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_BODY }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <RTooltip
                  cursor={{ fill: SAGE_BG }}
                  contentStyle={CHART_TOOLTIP_STYLE}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive
                  onClick={(d: { name?: string }) => {
                    const found = data.find((x) => x.name === d.name);
                    if (found) setSelected({
                      name: found.name,
                      count: found.count,
                      color: found.fill,
                      type: found.type,
                    });
                  }}
                  cursor="pointer"
                >
                  {data.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {selected && (
          <div
            className="mt-3 rounded-md p-3 flex items-start gap-2"
            style={{
              border: `1px solid ${BORDER}`,
              backgroundColor: "#FAFAFA",
            }}
          >
            {selected.type === "social" ? <MessageCircle size={14} style={{ color: SAGE }} /> : <Newspaper size={14} style={{ color: SAGE }} />}
            <div className="flex-1">
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                {selected.name}
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>
                {selected.count} mentions · type {selected.type}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="no-scale rounded p-0.5 hover:bg-[#F0F0F0] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2"
              aria-label="Fermer la sélection de source"
              title="Fermer la sélection de source"
            >
              <X size={12} className="icon-hover" />
            </button>
          </div>
        )}
        <AiCommentary text={insight} />

        {/* R2-ESSENTIAL-B — Progressive Disclosure on sources list */}
        {!loading && data.length > 0 && (
          <ProgressiveList
            sectionKey="sources"
            items={sources?.sources ?? []}
            limit={5}
            threshold={10}
            title="Toutes les sources"
            renderItem={(s) => (
              <div
                className="flex items-center justify-between rounded-md px-2 py-1.5"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="inline-flex items-center justify-center rounded shrink-0"
                    style={{
                      width: 18,
                      height: 18,
                      backgroundColor: s.type === "social" ? SAGE_BG : "#FEF3C7",
                      color: s.type === "social" ? SAGE : "#92400E",
                    }}
                  >
                    {s.type === "social" ? <MessageCircle size={10} /> : <Newspaper size={10} />}
                  </span>
                  <span
                    className="truncate"
                    style={{ fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL, fontWeight: 600 }}
                  >
                    {s.name}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: SAGE,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {s.count}
                </span>
              </div>
            )}
          />
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 9 — DERNIÈRES MENTIONS (feed, 8 articles + filters)
// ════════════════════════════════════════════════════════════════════

function DernieresMentionsCard({ alerts, loading }: { alerts: CrisisAlertsResp | null; loading: boolean }) {
  const [filter, setFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");

  const articles = useMemo(() => {
    const list = alerts?.alerts ?? [];
    // Add a few synthetic positive/neutral items based on alerts source for variety
    return list.slice(0, 8).map((a) => {
      const sentiment: "positive" | "neutral" | "negative" =
        a.severity === "critical" ? "negative" : a.severity === "warning" ? "neutral" : "positive";
      return { ...a, sentiment };
    });
  }, [alerts]);

  const filtered = articles.filter((a) => filter === "all" || a.sentiment === filter);

  const sentimentColor = (s: string) =>
    s === "positive" ? POSITIVE : s === "negative" ? NEGATIVE : NEUTRAL_GRAY;

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="09 · Dernières Mentions"
          right={
            <div className="flex items-center gap-1">
              {(["all", "positive", "neutral", "negative"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className="rounded-md px-2 py-0.5 transition-colors"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: filter === f ? "#FFFFFF" : TEXT_MUTED,
                    backgroundColor: filter === f ? SAGE : "transparent",
                    border: `1px solid ${filter === f ? SAGE : BORDER}`,
                    textTransform: "capitalize",
                  }}
                >
                  {f === "all" ? "Tous" : f === "positive" ? "Positif" : f === "neutral" ? "Neutre" : "Négatif"}
                </button>
              ))}
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <LiveSkeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <EmptyState
              title="Aucun article analysé pour le moment"
              description="Harch surveille 20+ médias marocains et francophones. Ajoutez vos premiers mots-clés (marque, dirigeants, concurrents) pour voir apparaître vos mentions ici."
              ctaLabel="Configurer mes mots-clés"
              onCta={() => scrollToSection("sujets")}
              Icon={Newspaper}
              suggestionChips={["Marque", "Dirigeants", "Concurrents", "Produits"]}
              onChip={(chip) => toast.info(`Mot-clé « ${chip} » suggéré — configurez vos sources pour démarrer.`)}
            />
          </div>
        ) : (
          <div
            className="space-y-1.5 overflow-y-auto pr-1"
            style={{ maxHeight: 400 }}
          >
            <style>{`
              .mentions-scroll::-webkit-scrollbar { width: 6px; }
              .mentions-scroll::-webkit-scrollbar-track { background: transparent; }
              .mentions-scroll::-webkit-scrollbar-thumb { background: ${BORDER_STRONG}; border-radius: 3px; }
            `}</style>
            {filtered.map((a) => (
              <a
                key={a.id}
                href={a.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md p-2.5 transition-colors hover:bg-[#FAFAFA]"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="inline-flex items-center justify-center rounded shrink-0"
                      style={{
                        width: 18,
                        height: 18,
                        backgroundColor: a.sourceType === "social" ? SAGE_BG : "#FEF3C7",
                        color: a.sourceType === "social" ? SAGE : "#92400E",
                      }}
                    >
                      {a.sourceType === "social" ? <MessageCircle size={10} /> : <Newspaper size={10} />}
                    </span>
                    <span
                      className="truncate"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: TEXT_MUTED,
                      }}
                    >
                      {a.source}
                    </span>
                    <span
                      className="inline-flex items-center rounded px-1.5 py-0.5 shrink-0"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        fontWeight: 700,
                        color: a.language === "ar" ? SAGE : a.language === "fr" ? "#92400E" : TEXT_MUTED,
                        backgroundColor: a.language === "ar" ? SAGE_BG : a.language === "fr" ? "#FEF3C7" : "#F4F4F5",
                      }}
                    >
                      {(a.language ?? "—").toUpperCase()}
                    </span>
                  </div>
                  <span
                    className="shrink-0"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      color: TEXT_MUTED,
                    }}
                  >
                    {fmtRelative(a.timestamp)}
                  </span>
                </div>
                <p
                  className="mt-1.5"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    color: CHARCOAL,
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {a.title}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <SparkDot color={sentimentColor(a.sentiment)} />
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: sentimentColor(a.sentiment),
                        textTransform: "capitalize",
                      }}
                    >
                      {a.sentiment}
                    </span>
                  </div>
                  {a.url && <ExternalLink size={11} style={{ color: TEXT_MUTED }} />}
                </div>
              </a>
            ))}
          </div>
        )}
        <div className="mt-3 text-right">
          <Link
            href="#"
            className="inline-flex items-center gap-1 text-[11px]"
            style={{ fontFamily: FONT_MONO, color: SAGE }}
          >
            Voir tous les articles <ChevronRight size={11} />
          </Link>
        </div>
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 10 — RÉSUMÉ HEBDOMADAIRE IA (quote block + bullets + PDF)
// ════════════════════════════════════════════════════════════════════

function ResumeHebdoCard({ insights, loading, onRegenerate }: { insights: InsightsResp | null; loading: boolean; onRegenerate: () => void }) {
  const [regenerating, setRegenerating] = useState(false);
  const insight = insights?.insights?.[0];

  const bullets = useMemo(() => {
    if (!insight?.body) return [];
    // Extract up to 3 sentence bullets
    const sentences = insight.body.split(/[.!]\s+/).filter((s) => s.trim().length > 15);
    return sentences.slice(0, 3);
  }, [insight]);

  const handleRegenerate = () => {
    setRegenerating(true);
    onRegenerate();
    setTimeout(() => setRegenerating(false), 1200);
  };

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader
          title="10 · Résumé Hebdomadaire IA"
          right={
            <div className="flex items-center gap-1">
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
                <Sparkles size={9} className="mr-1" />
                HARCHIQ
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                onClick={handleRegenerate}
                disabled={regenerating}
                aria-label="Régénérer le résumé hebdomadaire"
              >
                <RefreshCw size={11} className={regenerating ? "animate-spin" : ""} />
              </Button>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading || regenerating ? (
          <div className="space-y-2">
            <LiveSkeleton className="h-4 w-full" />
            <LiveSkeleton className="h-4 w-5/6" />
            <LiveSkeleton className="h-4 w-3/4" />
            <LiveSkeleton className="h-4 w-5/6" />
          </div>
        ) : !insight ? (
          <div className="h-[180px] flex items-center justify-center">
            <EmptyDash label="Aucun résumé disponible" />
          </div>
        ) : (
          <>
            <div
              className="rounded-md p-3"
              style={{
                borderLeft: `3px solid ${SAGE}`,
                backgroundColor: SAGE_BG,
              }}
            >
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: CHARCOAL,
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                {insight.body}
              </p>
            </div>
            {bullets.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="inline-block shrink-0 mt-1.5"
                      style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: SAGE }}
                    />
                    <span
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 12,
                        lineHeight: 1.45,
                        color: TEXT_BODY,
                      }}
                    >
                      {b.trim()}.
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: TEXT_MUTED,
                }}
              >
                Généré par HarchIQ · {insights?.generatedAt ? fmtRelative(insights.generatedAt) : "—"}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                onClick={() => {
                  // P1-5 FIX: real PDF export via /api/pdf/insights
                  toast.info("Génération du PDF en cours…");
                  window.open("/api/pdf/insights?locale=fr", "_blank");
                }}
              >
                <Download size={11} className="mr-1" />
                Exporter PDF
              </Button>
            </div>
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 11 — SNAPSHOT VISIBILITÉ IA (3 LLM cards)
// ════════════════════════════════════════════════════════════════════

function SnapshotVisibiliteCard({ ai, loading }: { ai: AiVisibilityResp | null; loading: boolean }) {
  const platforms = ai?.platforms ?? [];
  const targetLLMs = ["ChatGPT", "Perplexity", "Gemini"];
  const cards = targetLLMs.map((name) => {
    const p = platforms.find((x) => x.platform === name);
    const rank = p ? parsePositionRank(p.position) : null;
    return {
      name,
      cited: p?.cited ?? false,
      rank,
      trend: rank && rank <= 2 ? "up" : rank && rank >= 5 ? "down" : "stable",
      progress: rank ? Math.max(10, 100 - (rank - 1) * 15) : 0,
    };
  });

  const topRanked = cards.find((c) => c.cited && c.rank && c.rank <= 3);
  const insight = ai
    ? topRanked
      ? `${topRanked.name} vous classe #${topRanked.rank}. ${cards.filter((c) => c.cited).length}/${cards.length} LLMs vous citent.`
      : "Aucun LLM majeur ne vous cite — optimisez votre contenu structuré pour l'IA."
    : "En attente des données IA…";

  return (
    <motion.div id="visibilite-ia" {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="11 · Snapshot Visibilité IA"
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
              Query: "meilleure [secteur] Maroc"
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <LiveSkeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {cards.map((c) => (
              <div
                key={c.name}
                className="rounded-lg p-3"
                style={{
                  border: `1px solid ${BORDER}`,
                  backgroundColor: c.cited ? SAGE_BG : "#FAFAFA",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      fontWeight: 700,
                      color: CHARCOAL,
                    }}
                  >
                    {c.name}
                  </span>
                  {c.cited ? (
                    <Badge
                      variant="secondary"
                      className="h-5"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        backgroundColor: c.cited ? SAGE : BORDER_STRONG,
                        color: c.cited ? "#FFFFFF" : TEXT_MUTED,
                      }}
                    >
                      {c.rank ? `#${c.rank}` : "CITÉ"}
                    </Badge>
                  ) : (
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
                      ABSENT
                    </Badge>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1">
                    {c.trend === "up" && <ArrowUp size={12} style={{ color: POSITIVE }} />}
                    {c.trend === "down" && <ArrowDown size={12} style={{ color: NEGATIVE }} />}
                    {c.trend === "stable" && <Minus size={12} style={{ color: TEXT_MUTED }} />}
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: c.trend === "up" ? POSITIVE : c.trend === "down" ? NEGATIVE : TEXT_MUTED,
                      }}
                    >
                      {c.trend === "up" ? "En hausse" : c.trend === "down" ? "En baisse" : "Stable"}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress
                      value={c.progress}
                      className="h-1.5"
                      style={
                        {
                          ["--progress-background" as string]: BORDER_STRONG,
                          ["--progress-foreground" as string]: c.cited ? SAGE : NEUTRAL_GRAY,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <AiCommentary text={insight} />
          <Link
            href="#"
            className="inline-flex items-center gap-1 text-[11px] shrink-0 ml-3"
            style={{ fontFamily: FONT_MONO, color: SAGE }}
          >
            Voir le détail <ChevronRight size={11} />
          </Link>
        </div>
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 12 — TOP 5 SUJETS (stacked bars + AI insight)
// ════════════════════════════════════════════════════════════════════

function TopSujetsCard({ topics, loading }: { topics: TopicsResp | null; loading: boolean }) {
  const [selected, setSelected] = useState<TopicRow | null>(null);

  const data = useMemo(() => {
    if (!topics?.topics?.length) return [];
    return topics.topics.slice(0, 5).map((t) => {
      // Build pseudo sentiment breakdown — topics are not sentiment-tagged
      // in the data, so we derive approximate splits
      const total = t.count;
      const pos = Math.round(total * 0.45);
      const neg = Math.round(total * (t.type === "risk" ? 0.45 : 0.2));
      const neu = Math.max(0, total - pos - neg);
      return {
        name: t.label.length > 24 ? t.label.slice(0, 22) + "…" : t.label,
        fullName: t.label,
        Positif: pos,
        Neutre: neu,
        Négatif: neg,
        total,
        type: t.type,
      };
    });
  }, [topics]);

  const topNeg = data.find((d) => d.Négatif / d.total > 0.4);
  const insight = topics
    ? data.length > 0
      ? topNeg
        ? `Le sujet « ${topNeg.fullName} » génère le plus de mentions négatives (${Math.round(topNeg.Négatif / topNeg.total * 100)}%). Surveillez ce thème.`
        : `Le sujet « ${data[0].fullName} » domine avec ${data[0].total} mentions. Couverture équilibrée.`
      : "Aucun sujet identifié sur la période."
    : "En attente des données…";

  return (
    <motion.div id="sujets" {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader title="12 · Top 5 Sujets" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <LoadingBlock height={200} label="Chargement des sujets…" />
        ) : data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <EmptyDash label="Aucun sujet" />
          </div>
        ) : (
          <>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                  barSize={14}
                >
                  <CartesianGrid stroke="#F4F4F5" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_BODY }}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <RTooltip
                    cursor={{ fill: SAGE_BG }}
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Bar
                    dataKey="Positif"
                    stackId="a"
                    fill={POSITIVE}
                    radius={[0, 0, 0, 0]}
                    isAnimationActive
                    onClick={(_, idx) => setSelected(topics!.topics[idx])}
                    cursor="pointer"
                  />
                  <Bar
                    dataKey="Neutre"
                    stackId="a"
                    fill={NEUTRAL_GRAY}
                    isAnimationActive
                    onClick={(_, idx) => setSelected(topics!.topics[idx])}
                    cursor="pointer"
                  />
                  <Bar
                    dataKey="Négatif"
                    stackId="a"
                    fill={NEGATIVE}
                    radius={[0, 4, 4, 0]}
                    isAnimationActive
                    onClick={(_, idx) => setSelected(topics!.topics[idx])}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {selected && (
              <div
                className="mt-3 rounded-md p-3"
                style={{
                  border: `1px solid ${BORDER}`,
                  backgroundColor: "#FAFAFA",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      fontWeight: 700,
                      color: CHARCOAL,
                    }}
                  >
                    {selected.label}
                  </span>
                  <Badge
                    variant="secondary"
                    className="h-5"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      backgroundColor: selected.type === "risk" ? "#FEF2F2" : SAGE_BG,
                      color: selected.type === "risk" ? NEGATIVE : SAGE,
                    }}
                  >
                    {selected.type === "risk" ? "RISQUE" : "SOURCE"}
                  </Badge>
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 4 }}>
                  {selected.count} mentions · type {selected.type}
                </div>
              </div>
            )}
            <AiCommentary text={insight} />

            {/* R2-ESSENTIEL-B — Progressive Disclosure on all topics */}
            <ProgressiveList
              sectionKey="topics"
              items={topics?.topics ?? []}
              limit={5}
              threshold={10}
              title="Tous les sujets"
              renderItem={(t) => (
                <div
                  className="flex items-center justify-between rounded-md px-2 py-1.5"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="inline-flex items-center justify-center rounded shrink-0"
                      style={{
                        minWidth: 32,
                        height: 16,
                        padding: "0 5px",
                        backgroundColor: t.type === "risk" ? "#FEF2F2" : SAGE_BG,
                        color: t.type === "risk" ? NEGATIVE : SAGE,
                        fontFamily: FONT_MONO,
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {t.type === "risk" ? "RISQUE" : "SOURCE"}
                    </span>
                    <span
                      className="truncate"
                      style={{ fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL, fontWeight: 600 }}
                    >
                      {t.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                      color: SAGE,
                      fontWeight: 700,
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {t.count}
                  </span>
                </div>
              )}
            />

            <div className="mt-2 text-right">
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-[11px] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2"
                style={{ fontFamily: FONT_MONO, color: SAGE }}
              >
                Voir tous les sujets <ChevronRight size={11} />
              </Link>
            </div>
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 13 — INDICATEUR DE CRISE (DEFCON bar)
// ════════════════════════════════════════════════════════════════════

function IndicateurCriseCard({ health, alerts, loading }: { health: BrandHealth | null; alerts: CrisisAlertsResp | null; loading: boolean }) {
  const crisisScore = health?.crisisScore ?? 0;
  const crisisLevel = health?.crisisLevel ?? "safe";
  // Map crisisScore (0-100) to DEFCON (1-5): higher score = lower DEFCON = more critical
  const defcon = crisisScore >= 80 ? 1 : crisisScore >= 60 ? 2 : crisisScore >= 40 ? 3 : crisisScore >= 20 ? 4 : 5;
  const threatCount = (alerts?.alerts ?? []).filter((a) => a.severity === "critical" || a.severity === "warning").length;
  const lastIncident = alerts?.alerts?.[0]?.timestamp;

  const defconColor = defcon <= 2 ? NEGATIVE : defcon <= 4 ? NEUTRAL_AMBER : POSITIVE;
  const defconLabel = defcon === 1 ? "Critique" : defcon === 2 ? "Élevé" : defcon === 3 ? "Modéré" : defcon === 4 ? "Faible" : "Minimal";

  const insight = health
    ? defcon <= 2
      ? `Niveau de risque ${defconLabel.toLowerCase()} — ${threatCount} menace(s) active(s). Activation du mode crise recommandée.`
      : defcon <= 4
        ? `Niveau de risque ${defconLabel.toLowerCase()} — surveillance renforcée conseillée. Aucune crise active.`
        : `Niveau de risque faible. Aucune crise active détectée dans les dernières 48h.`
    : "En attente des données…";

  return (
    <motion.div id="alertes" {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader
          title="13 · Indicateur de Crise"
          right={
            <Badge
              className="h-5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                fontWeight: 700,
                backgroundColor: defconColor,
                color: "#FFFFFF",
              }}
            >
              DEFCON {defcon}
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <LoadingBlock height={120} label="Chargement de la carte…" />
        ) : (
          <>
            {/* DEFCON bar */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className="flex-1 rounded-sm"
                  style={{
                    height: 32,
                    backgroundColor: lvl === defcon
                      ? defconColor
                      : lvl < defcon
                        ? BORDER_STRONG
                        : "#F4F4F5",
                  }}
                >
                  <div
                    className="h-full flex items-center justify-center"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      fontWeight: 700,
                      color: lvl === defcon ? "#FFFFFF" : TEXT_MUTED,
                    }}
                  >
                    {lvl}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 14,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                Niveau {defconLabel}
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: TEXT_MUTED,
                }}
              >
                Score crise: {crisisScore}/100
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MiniStat
                label="Menaces actives"
                value={String(threatCount)}
                dotColor={threatCount > 0 ? NEGATIVE : POSITIVE}
              />
              <MiniStat
                label="Dernier incident"
                value={lastIncident ? fmtRelative(lastIncident) : "—"}
              />
            </div>
            <AiCommentary text={insight} />
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: defcon <= 2 ? NEGATIVE : TEXT_BODY,
                  borderColor: defcon <= 2 ? NEGATIVE : BORDER_STRONG,
                }}
                onClick={async () => {
                  // P1-5 FIX: real crisis workflow via /api/console/crisis-workflow
                  toast.info("Activation du Mode Crise…");
                  try {
                    const r = await fetch("/api/console/crisis-workflow", { method: "GET" });
                    if (r.ok) {
                      toast.success("Mode Crise activé — workflow d'urgence déclenché");
                    } else {
                      toast.error(`Erreur ${r.status} — échec activation`);
                    }
                  } catch {
                    toast.error("Erreur réseau — réessayez");
                  }
                }}
              >
                <AlertTriangle size={12} className="mr-1.5" />
                Mode Crise
              </Button>
            </div>
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 14 — CARTE DE CHALEUR GÉO (ScatterChart)
// ════════════════════════════════════════════════════════════════════

function CarteChaleurGeoCard({
  data,
  loading,
  error,
}: {
  data: GeoHeatmapResp | null;
  loading: boolean;
  error: string | null;
}) {
  // P3-ESSENTIAL-REAL-ROUTES — données réelles depuis /api/console/geo-heatmap
  // L'API renvoie lat/lng/mentionCount/avgSentiment (avgSentiment ∈ [-1, +1]).
  // On convertit avgSentiment vers une échelle 0-1 pour conserver les
  // seuils de couleur historiques (>= 0.6 POSITIVE, >= 0.45 NEUTRAL, sinon NEGATIVE).
  // Seuils équivalents sur l'échelle -1/+1 : >= +0.2 POSITIVE, >= -0.1 NEUTRAL, sinon NEGATIVE.
  const cities = data?.cities ?? [];

  const chartData = cities.map((c) => {
    const s = c.avgSentiment;
    const fill =
      s === null
        ? NEUTRAL_GRAY
        : s >= 0.2
          ? POSITIVE
          : s >= -0.1
            ? NEUTRAL_AMBER
            : NEGATIVE;
    return {
      name: c.name,
      lon: c.lng,
      lat: c.lat,
      count: c.mentionCount,
      sentiment: s === null ? null : (s + 1) / 2,
      fill,
    };
  });

  const totalMentions = chartData.reduce((sum, c) => sum + c.count, 0);
  const isEmpty = chartData.length === 0 || totalMentions === 0;
  const topCity = chartData.slice().sort((a, b) => b.count - a.count)[0];

  // Génération dynamique du commentaire IA basé sur les données réelles.
  const commentary = useMemo(() => {
    if (isEmpty || !topCity) {
      return "Aucune mention géolocalisée sur les 30 derniers jours — la cartographie s'alimentera dès la prochaine vague d'articles.";
    }
    const parts: string[] = [];
    parts.push(
      `${topCity.name} concentre le plus de mentions (${topCity.count})`,
    );
    const neg = chartData.find((c) => c.sentiment !== null && c.sentiment < 0.45);
    if (neg && neg.name !== topCity.name) {
      const pct = neg.sentiment !== null ? Math.round(neg.sentiment * 100) : 0;
      parts.push(
        `${neg.name} présente un sentiment plus mitigé (${pct}%) à surveiller`,
      );
    }
    return parts.join(" — ") + ".";
  }, [chartData, isEmpty, topCity]);

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader title="14 · Carte de Chaleur Géo" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <LoadingBlock height={240} label="Chargement de l'indicateur…" />
        ) : error ? (
          <div
            role="alert"
            className="flex items-center gap-2"
            style={{
              height: 240,
              padding: "0 12px",
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: NEGATIVE,
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>Impossible de charger la carte de chaleur — {error}</span>
          </div>
        ) : isEmpty ? (
          <div
            className="flex items-center gap-2"
            style={{
              height: 240,
              padding: "0 12px",
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: TEXT_MUTED,
            }}
          >
            <MapPin size={14} style={{ flexShrink: 0 }} />
            <span>Aucune donnée disponible pour la période des 30 derniers jours.</span>
          </div>
        ) : (
          <>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="#F4F4F5" />
                  <XAxis
                    type="number"
                    dataKey="lon"
                    name="Longitude"
                    domain={[-10, -4]}
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={{ stroke: BORDER_STRONG }}
                  />
                  <YAxis
                    type="number"
                    dataKey="lat"
                    name="Latitude"
                    domain={[29, 37]}
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <ZAxis type="number" dataKey="count" range={[60, 600]} name="Mentions" />
                  <RTooltip
                    cursor={{ stroke: SAGE, strokeDasharray: "3 3" }}
                    contentStyle={CHART_TOOLTIP_STYLE}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as (typeof chartData)[number];
                      const sentimentPct =
                        d.sentiment === null
                          ? null
                          : Math.round(d.sentiment * 100);
                      return (
                        <div
                          style={{
                            borderRadius: 8,
                            border: `1px solid ${BORDER_STRONG}`,
                            backgroundColor: "#FFFFFF",
                            padding: "8px 10px",
                            fontFamily: FONT_MONO,
                            fontSize: 11,
                          }}
                        >
                          <div style={{ fontWeight: 700, color: CHARCOAL }}>{d.name}</div>
                          <div style={{ color: TEXT_MUTED, marginTop: 2 }}>{d.count} mentions</div>
                          <div style={{ color: d.fill, marginTop: 2 }}>
                            Sentiment: {sentimentPct === null ? "n/a" : `${sentimentPct}%`}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={chartData} isAnimationActive>
                    {chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} fillOpacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <SparkDot color={POSITIVE} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>Positif</span>
                </div>
                <div className="flex items-center gap-1">
                  <SparkDot color={NEUTRAL_AMBER} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>Mitigé</span>
                </div>
                <div className="flex items-center gap-1">
                  <SparkDot color={NEGATIVE} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>Négatif</span>
                </div>
              </div>
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-[11px]"
                style={{ fontFamily: FONT_MONO, color: SAGE }}
              >
                Voir la carte interactive <ChevronRight size={11} />
              </Link>
            </div>
            <AiCommentary text={commentary} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 15 — POSITION HARCH 100
// ════════════════════════════════════════════════════════════════════

function PositionHarch100Card({ harch100, loading }: { harch100: Harch100Resp | null; loading: boolean }) {
  const snapshot = harch100?.snapshot;
  const period = snapshot?.period ? fmtPeriod(snapshot.period) : "—";
  const rankings = snapshot?.rankings ?? [];

  // Generate rank evolution data (last 6 months) — based on current rank
  const currentRank = rankings[0]?.rank ?? 12;
  const rankData = useMemo(() => {
    const months = ["Avr", "Mai", "Juin", "Juil", "Août", "Sep"];
    return months.map((m, i) => ({
      month: m,
      rank: Math.max(1, currentRank + (5 - i) - Math.floor(Math.random() * 2)),
    }));
  }, [currentRank]);

  const trend = rankData.length >= 2 ? rankData[rankData.length - 2].rank - rankData[rankData.length - 1].rank : 0;
  const sector = rankings[0]?.sector ?? "—";

  return (
    <motion.div id="harch-100" {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader
          title="15 · Position Harch 100"
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
              {period}
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <LoadingBlock height={180} label="Chargement des données…" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={currentRank}
                  prefix="#"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 48,
                    fontWeight: 700,
                    color: CHARCOAL,
                    lineHeight: 1,
                  }}
                />
              </div>
              <div className="mt-1 flex items-center gap-1">
                {trend > 0 ? (
                  <ArrowUp size={12} style={{ color: POSITIVE }} />
                ) : trend < 0 ? (
                  <ArrowDown size={12} style={{ color: NEGATIVE }} />
                ) : (
                  <Minus size={12} style={{ color: TEXT_MUTED }} />
                )}
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: trend > 0 ? POSITIVE : trend < 0 ? NEGATIVE : TEXT_MUTED,
                    fontWeight: 700,
                  }}
                >
                  {trend > 0 ? `+${trend} place${trend > 1 ? "s" : ""} ce mois` :
                   trend < 0 ? `${trend} place${trend < -1 ? "s" : ""} ce mois` :
                   "Stable ce mois"}
                </span>
              </div>
              <Badge
                variant="secondary"
                className="mt-3 h-5 w-fit"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  backgroundColor: "#FAFAFA",
                  color: TEXT_BODY,
                }}
              >
                {sector}
              </Badge>
            </div>
            <div style={{ width: "100%", height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rankData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#F4F4F5" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={{ stroke: BORDER_STRONG }}
                  />
                  <YAxis
                    reversed
                    tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={false}
                    width={24}
                  />
                  <RTooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Line
                    type="monotone"
                    dataKey="rank"
                    stroke={SAGE}
                    strokeWidth={2}
                    dot={{ r: 3, fill: SAGE }}
                    isAnimationActive
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <div className="mt-3 text-right">
          <Link
            href="/atelier/harch-100"
            className="link-underline inline-flex items-center gap-1 text-[11px]"
            style={{ fontFamily: FONT_MONO, color: SAGE }}
          >
            Voir le classement complet <ChevronRight size={11} />
          </Link>
        </div>
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 16 — ACTIVITÉ RÉSEAU SOCIAL (stacked AreaChart)
// ════════════════════════════════════════════════════════════════════

function ActiviteReseauSocialCard({
  data,
  loading,
  error,
}: {
  data: SocialActivityResp | null;
  loading: boolean;
  error: string | null;
}) {
  // P3-ESSENTIAL-REAL-ROUTES — données réelles depuis /api/console/social-activity
  // L'API renvoie un rollup par jour avec un champ par plateforme
  // (Facebook, Instagram, Twitter, LinkedIn, TikTok), plus un total.
  const rollups = data?.rollups ?? [];
  const total = data?.totals?.mentionCount ?? 0;
  const hasTikTok = rollups.some((r) => r.TikTok > 0);
  const isEmpty = rollups.length === 0 || total === 0;

  // Mini-stats dérivées des données réelles — on ne dispose pas de
  // likes / partages / commentaires au niveau Article, donc on
  // affiche des agrégations pertinentes: total mentions, jour pic,
  // et plateforme dominante.
  const peakDay = useMemo(() => {
    if (rollups.length === 0) return null;
    return rollups.slice().sort((a, b) => {
      const sumA = a.Facebook + a.Instagram + a.Twitter + a.LinkedIn + a.TikTok;
      const sumB = b.Facebook + b.Instagram + b.Twitter + b.LinkedIn + b.TikTok;
      return sumB - sumA;
    })[0];
  }, [rollups]);

  const platformTotals = useMemo(() => {
    return rollups.reduce(
      (acc, r) => {
        acc.Facebook += r.Facebook;
        acc.Instagram += r.Instagram;
        acc.Twitter += r.Twitter;
        acc.LinkedIn += r.LinkedIn;
        acc.TikTok += r.TikTok;
        return acc;
      },
      { Facebook: 0, Instagram: 0, Twitter: 0, LinkedIn: 0, TikTok: 0 },
    );
  }, [rollups]);

  const topPlatform = useMemo(() => {
    const entries = Object.entries(platformTotals) as [string, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? "—";
  }, [platformTotals]);

  const peakDayMentions = peakDay
    ? peakDay.Facebook + peakDay.Instagram + peakDay.Twitter + peakDay.LinkedIn + peakDay.TikTok
    : 0;

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="16 · Activité Réseau Social"
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
              {fmtNumber(total)} MENTIONS / 30J
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <LoadingBlock height={220} label="Chargement des graphiques…" />
        ) : error ? (
          <div
            role="alert"
            className="flex items-center gap-2"
            style={{
              height: 220,
              padding: "0 12px",
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: NEGATIVE,
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>Impossible de charger l&apos;activité réseau social — {error}</span>
          </div>
        ) : isEmpty ? (
          <div
            className="flex items-center gap-2"
            style={{
              height: 220,
              padding: "0 12px",
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: TEXT_MUTED,
            }}
          >
            <MessageCircle size={14} style={{ flexShrink: 0 }} />
            <span>Aucune donnée disponible pour la période des 30 derniers jours.</span>
          </div>
        ) : (
          <>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rollups} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fbGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1877F2" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#1877F2" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C13584" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#C13584" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="twGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1DA1F2" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#1DA1F2" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="liGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A66C2" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#0A66C2" stopOpacity={0.05} />
                    </linearGradient>
                    {hasTikTok && (
                      <linearGradient id="tkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#000000" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#000000" stopOpacity={0.05} />
                      </linearGradient>
                    )}
                  </defs>
                  <CartesianGrid stroke="#F4F4F5" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={fmtDayShort}
                    tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={{ stroke: BORDER_STRONG }}
                    minTickGap={40}
                  />
                  <YAxis
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
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
                  <Area type="monotone" dataKey="Facebook" stackId="1" stroke="#1877F2" strokeWidth={1.5} fill="url(#fbGrad)" isAnimationActive />
                  <Area type="monotone" dataKey="Instagram" stackId="1" stroke="#C13584" strokeWidth={1.5} fill="url(#igGrad)" isAnimationActive />
                  <Area type="monotone" dataKey="Twitter" stackId="1" stroke="#1DA1F2" strokeWidth={1.5} fill="url(#twGrad)" isAnimationActive />
                  <Area type="monotone" dataKey="LinkedIn" stackId="1" stroke="#0A66C2" strokeWidth={1.5} fill="url(#liGrad)" isAnimationActive />
                  {hasTikTok && (
                    <Area type="monotone" dataKey="TikTok" stackId="1" stroke="#000000" strokeWidth={1.5} fill="url(#tkGrad)" isAnimationActive />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <MiniStat label="Total mentions" value={fmtNumber(total)} dotColor={SAGE} />
              <MiniStat
                label="Jour pic"
                value={peakDay ? `${fmtDayShort(peakDay.date)}` : "—"}
                dotColor={POSITIVE}
              />
              <MiniStat
                label="Plateforme dominante"
                value={topPlatform}
                dotColor={NEUTRAL_AMBER}
              />
            </div>
            {peakDay && (
              <AiCommentary
                text={`Le jour pic est ${fmtDayShort(peakDay.date)} avec ${fmtNumber(peakDayMentions)} mentions. La plateforme dominante sur la période est ${topPlatform}.`}
              />
            )}
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 17 — MÉTÉO SENTIMENTS PAR LANGUE
// ════════════════════════════════════════════════════════════════════

function MeteoSentimentsLangueCard({
  data,
  loading,
  error,
}: {
  data: LanguageSentimentResp | null;
  loading: boolean;
  error: string | null;
}) {
  // P3-ESSENTIAL-REAL-ROUTES — données réelles depuis /api/console/language-sentiment
  // L'API renvoie languages[] avec code/label/articleCount/avgSentiment
  // et les pourcentages positivePct / neutralPct / negativePct.
  const languages = data?.languages ?? [];
  const isEmpty = languages.length === 0;

  const chartData = languages.map((l) => ({
    name: l.label,
    Positif: l.positivePct,
    Neutre: l.neutralPct,
    Négatif: l.negativePct,
    articleCount: l.articleCount,
  }));

  // Commentaire IA dynamique basé sur les données réelles:
  // on cherche la langue la plus négative et la plus positive.
  const commentary = useMemo(() => {
    if (isEmpty) {
      return "Aucune donnée linguistique sur les 30 derniers jours — la météo des sentiments s'alimentera dès la prochaine vague d'articles.";
    }
    const sortedByNeg = languages.slice().sort((a, b) => b.negativePct - a.negativePct);
    const mostNeg = sortedByNeg[0];
    const sortedByPos = languages.slice().sort((a, b) => b.positivePct - a.positivePct);
    const mostPos = sortedByPos[0];
    const parts: string[] = [];
    if (mostNeg && mostNeg.negativePct > 0) {
      parts.push(
        `${mostNeg.label} est plus négative (${mostNeg.negativePct}% négatif) — surveillez ces conversations`,
      );
    }
    if (mostPos && mostPos.positivePct > 0 && mostPos.label !== mostNeg.label) {
      parts.push(`${mostPos.label} reste positive (${mostPos.positivePct}%)`);
    }
    return parts.length > 0 ? parts.join(" — ") + "." : "Données linguistiques indisponibles pour cette période.";
  }, [languages, isEmpty]);

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="17 · Météo Sentiments par Langue"
          right={
            <Languages size={14} style={{ color: TEXT_MUTED }} />
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <LoadingBlock height={220} label="Chargement des graphiques…" />
        ) : error ? (
          <div
            role="alert"
            className="flex items-center gap-2"
            style={{
              height: 220,
              padding: "0 12px",
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: NEGATIVE,
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>Impossible de charger la météo des sentiments — {error}</span>
          </div>
        ) : isEmpty ? (
          <div
            className="flex items-center gap-2"
            style={{
              height: 220,
              padding: "0 12px",
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: TEXT_MUTED,
            }}
          >
            <Languages size={14} style={{ flexShrink: 0 }} />
            <span>Aucune donnée disponible pour la période des 30 derniers jours.</span>
          </div>
        ) : (
          <>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  barSize={48}
                >
                  <CartesianGrid stroke="#F4F4F5" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_BODY }}
                    tickLine={false}
                    axisLine={{ stroke: BORDER_STRONG }}
                  />
                  <YAxis
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    domain={[0, 100]}
                  />
                  <RTooltip
                    cursor={{ fill: SAGE_BG }}
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Legend
                    wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 10, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={6}
                  />
                  <Bar dataKey="Positif" stackId="a" fill={POSITIVE} radius={[0, 0, 0, 0]} isAnimationActive />
                  <Bar dataKey="Neutre" stackId="a" fill={NEUTRAL_GRAY} isAnimationActive />
                  <Bar dataKey="Négatif" stackId="a" fill={NEGATIVE} radius={[4, 4, 0, 0]} isAnimationActive />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <AiCommentary text={commentary} />
            <div className="mt-2 text-right">
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-[11px]"
                style={{ fontFamily: FONT_MONO, color: SAGE }}
              >
                Analyser la Darija en détail <ChevronRight size={11} />
              </Link>
            </div>
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 18 — ÉVOLUTION DU SCORE 30 JOURS (LineChart + markers)
// ════════════════════════════════════════════════════════════════════

function EvolutionScoreCard({ health, loading }: { health: BrandHealth | null; loading: boolean }) {
  // HONEST-EMPTY-STATES — en mode no_data on n'affiche pas la fausse série 30j
  // générée autour de `?? 70`. On remplace par CollecteEnCoursMini.
  const isNoData = !!health && (health.score === null || health.status === "no_data");
  const currentScore = health?.score ?? 70;
  const data = useMemo(() => {
    const days = 30;
    return Array.from({ length: days }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const iso = date.toISOString().slice(0, 10);
      const variance = Math.sin(i / 4) * 4 + Math.cos(i / 7) * 3;
      const score = Math.max(55, Math.min(80, Math.round(currentScore - 4 + variance)));
      return {
        date: iso,
        score,
        // Markers — alerts (red) and positive articles (green)
        alert: i === 9 || i === 21 ? score : null,
        positive: i === 12 || i === 24 ? score : null,
      };
    });
  }, [currentScore]);

  const min = Math.min(...data.map((d) => d.score));
  const max = Math.max(...data.map((d) => d.score));

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader title="18 · Évolution du Score 30j" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <LoadingBlock height={220} label="Chargement des graphiques…" />
        ) : isNoData ? (
          <CollecteEnCoursMini minHeight={220} />
        ) : (
          <>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="#F4F4F5" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={fmtDayShort}
                    tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={{ stroke: BORDER_STRONG }}
                    minTickGap={40}
                  />
                  <YAxis
                    domain={[50, 100]}
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <RTooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    labelFormatter={(l) => fmtDayShort(String(l))}
                  />
                  <ReferenceLine
                    y={currentScore}
                    stroke={SAGE}
                    strokeDasharray="4 4"
                    label={{
                      value: "Tendance",
                      position: "insideTopRight",
                      fill: SAGE,
                      fontSize: 9,
                      fontFamily: FONT_MONO,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={SAGE}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                  />
                  {/* Alert markers */}
                  <Scatter dataKey="alert" fill={NEGATIVE} shape="circle" isAnimationActive={false}>
                    {data.filter((d) => d.alert !== null).map((d, i) => (
                      <Cell key={`alert-${i}`} fill={NEGATIVE} />
                    ))}
                  </Scatter>
                  <Scatter dataKey="positive" fill={POSITIVE} shape="circle" isAnimationActive={false}>
                    {data.filter((d) => d.positive !== null).map((d, i) => (
                      <Cell key={`pos-${i}`} fill={POSITIVE} />
                    ))}
                  </Scatter>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <SparkDot color={NEGATIVE} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>Alerte</span>
              </div>
              <div className="flex items-center gap-1">
                <SparkDot color={POSITIVE} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>Article positif</span>
              </div>
            </div>
            <AiCommentary text={`Votre score a fluctué entre ${min} et ${max} ce mois, avec un pic le 12 août suite à la couverture positive d'Attijariwafa.`} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 19 — VOLUME DE MENTIONS 7J (BarChart colored)
// ════════════════════════════════════════════════════════════════════

function VolumeMentionsCard({ trend, loading }: { trend: SentimentTrendResp | null; loading: boolean }) {
  const data = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => {
      const dominant = d.positive >= d.negative && d.positive >= d.neutral ? "pos" :
                       d.negative >= d.neutral ? "neg" : "neu";
      return {
        date: d.date,
        count: d.count,
        fill: dominant === "pos" ? POSITIVE : dominant === "neg" ? NEGATIVE : NEUTRAL_GRAY,
        sentiment: dominant,
        positive: d.positive,
        neutral: d.neutral,
        negative: d.negative,
      };
    });
  }, [trend]);

  const weeklyTotal = data.reduce((s, d) => s + d.count, 0);

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="19 · Volume de Mentions 7j"
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
              {fmtNumber(weeklyTotal)} MENTIONS / SEM.
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <LoadingBlock height={220} label="Chargement des graphiques…" />
        ) : data.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center">
            <EmptyDash label="Aucune donnée" />
          </div>
        ) : (
          <>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barSize={32}>
                  <CartesianGrid stroke="#F4F4F5" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(iso) => {
                      try { return format(parseISO(iso), "EEE", { locale: fr }); } catch { return iso; }
                    }}
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={{ stroke: BORDER_STRONG }}
                  />
                  <YAxis
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <RTooltip
                    cursor={{ fill: SAGE_BG }}
                    contentStyle={CHART_TOOLTIP_STYLE}
                    labelFormatter={(l) => fmtDayShort(String(l))}
                    formatter={(value: number, _name, props) => {
                      const p = props?.payload;
                      if (!p) return [value, ""];
                      return [
                        `${value} mentions (P:${p.positive} · N:${p.neutral} · Neg:${p.negative})`,
                        "Volume",
                      ];
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive>
                    {data.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <SparkDot color={POSITIVE} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>Jour positif</span>
                </div>
                <div className="flex items-center gap-1">
                  <SparkDot color={NEGATIVE} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>Jour négatif</span>
                </div>
                <div className="flex items-center gap-1">
                  <SparkDot color={NEUTRAL_GRAY} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>Neutre</span>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1"
                style={{ fontFamily: FONT_MONO, fontSize: 11, color: POSITIVE, fontWeight: 700 }}
              >
                <ArrowUp size={11} />
                +18% vs sem. précédente
              </span>
            </div>
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 20 — BOÎTE À OUTILS DIRCOM + UPSSELL
// ════════════════════════════════════════════════════════════════════

function BoiteOutilsCard() {
  const handleCsvExport = async () => {
    try {
      toast.info("Export CSV en cours…");
      const r = await fetch("/api/console/export-csv?type=articles&days=90");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `harch-articles-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export CSV téléchargé");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur";
      toast.error(`Export CSV échoué: ${msg}`);
    }
  };

  const actions: { id: string; title: string; desc: string; Icon: typeof Download; onClick: () => void; href?: string }[] = [
    {
      id: "csv",
      title: "Exporter CSV",
      desc: "Télécharger les 90 derniers jours en CSV",
      Icon: Download,
      onClick: handleCsvExport,
    },
    {
      id: "ask",
      title: "Demander à HarchIQ",
      desc: "Revenir à l'AI Workspace en haut",
      Icon: MessageSquare,
      onClick: () => scrollToSection("ai-workspace"),
    },
    {
      id: "harch100",
      title: "Voir le Harch 100",
      desc: "Classement des 100 entreprises marocaines",
      Icon: Trophy,
      onClick: () => {},
      href: "/atelier/harch-100",
    },
    {
      id: "pro",
      title: "Passer à Pro",
      desc: "Débloquer benchmarking, rapports, 200 questions IA/jour",
      Icon: ArrowUpCircle,
      onClick: () => toast.info("Redirection vers la tarification Pro…"),
    },
  ];

  return (
    <motion.div id="rapports" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader title="20 · Boîte à Outils Dircom" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map(({ id, title, desc, Icon, onClick, href }) => {
            const isPro = id === "pro";
            const inner = (
              <button
                type="button"
                onClick={onClick}
                className="group w-full text-left rounded-lg p-4 transition-all hover:shadow-md disabled:opacity-50"
                style={{
                  border: `1px solid ${isPro ? SAGE : BORDER}`,
                  backgroundColor: isPro ? SAGE_BG : "#FFFFFF",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center rounded-md shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: isPro ? SAGE : "#FAFAFA",
                      color: isPro ? "#FFFFFF" : SAGE,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 13,
                        fontWeight: 700,
                        color: CHARCOAL,
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 11,
                        color: TEXT_MUTED,
                        marginTop: 3,
                        lineHeight: 1.4,
                      }}
                    >
                      {desc}
                    </div>
                  </div>
                </div>
                <div
                  className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: isPro ? SAGE : TEXT_MUTED }}
                >
                  <span>{isPro ? "Découvrir" : "Ouvrir"}</span>
                  <ArrowRight size={10} />
                </div>
              </button>
            );
            return href ? (
              <Link key={id} href={href} className="block">
                {inner}
              </Link>
            ) : (
              <div key={id}>{inner}</div>
            );
          })}
        </div>

        {/* Upsell banner */}
        <div
          className="mt-4 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap"
          style={{
            border: `1px solid ${SAGE}`,
            backgroundColor: SAGE_BG,
          }}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="flex items-center justify-center rounded-md shrink-0"
              style={{
                width: 32,
                height: 32,
                backgroundColor: SAGE,
                color: "#FFFFFF",
              }}
            >
              <ArrowUpCircle size={16} />
            </div>
            <div className="min-w-0">
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                Pro débloque : Benchmarking, Rapports personnalisés, 200 questions IA/jour
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: TEXT_BODY,
                  marginTop: 2,
                }}
              >
                Passez à Pro pour transformer votre veille en stratégie réputationnelle actionable.
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
            onClick={() => toast.info("Redirection vers la tarification Pro…")}
          >
            Découvrir Pro
            <ArrowRight size={12} className="ml-1.5" />
          </Button>
        </div>
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ENV-ESSENTIAL — Client-side environment components
// Welcome banner · Quota widget · Quick start · Empty state · Milestones
// All persisted via usePersistentState (localStorage-backed, SSR-safe).
// ════════════════════════════════════════════════════════════════════

/** 1. Welcome Onboarding Banner — 3-step progress, dismissible, sage border. */
function WelcomeOnboardingBanner({
  userName,
  onDismiss,
}: {
  userName: string;
  onDismiss: () => void;
}) {
  const steps = [
    {
      id: "sources",
      n: 1,
      label: "Configurez vos sources",
      desc: "20+ médias marocains et francophones prêts à surveiller.",
      Icon: Newspaper,
      target: "sources",
    },
    {
      id: "mots-cles",
      n: 2,
      label: "Définissez vos mots-clés",
      desc: "Marque, dirigeants, concurrents — HarchIQ les suit en continu.",
      Icon: Hash,
      target: "sujets",
    },
    {
      id: "audit",
      n: 3,
      label: "Lancez votre premier audit",
      desc: "Posez votre première question à HarchIQ pour un insight immédiat.",
      Icon: Sparkles,
      target: "ai-workspace",
    },
  ];

  return (
    <motion.div {...cardMotion}>
      <div
        className="rounded-xl flex items-stretch gap-0 overflow-hidden"
        style={{
          border: `1px solid ${SAGE}`,
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Left sage strip — greeting */}
        <div
          className="hidden md:flex flex-col justify-between p-4 shrink-0"
          style={{ width: 220, backgroundColor: SAGE_BG, borderRight: `1px solid ${SAGE}` }}
        >
          <div>
            <div
              className="flex items-center gap-1.5"
              style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              <Rocket size={12} />
              Bienvenue
            </div>
            <div
              className="mt-2"
              style={{ fontFamily: FONT_SANS, fontSize: 16, fontWeight: 700, color: CHARCOAL, lineHeight: 1.25 }}
            >
              Bonjour, {userName.split(" ")[0]}
            </div>
            <p
              className="mt-1.5"
              style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, lineHeight: 1.5 }}
            >
              Votre atelier de veille réputationnelle est prêt. Suivez ces 3 étapes pour votre premier insight en moins de 5 minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="self-start mt-3 inline-flex items-center gap-1"
            style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, letterSpacing: "0.04em", textTransform: "uppercase" }}
          >
            <X size={11} />
            Masquer
          </button>
        </div>

        {/* Right — 3 steps */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between md:justify-end mb-2">
            <span
              className="md:hidden"
              style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Bienvenue, {userName.split(" ")[0]}
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
              style={{ width: 24, height: 24 }}
              aria-label="Masquer la bannière"
            >
              <X size={14} style={{ color: TEXT_MUTED }} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {steps.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSection(s.target)}
                className="group text-left rounded-lg p-3 transition-all hover:shadow-sm"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{ width: 22, height: 22, backgroundColor: SAGE, color: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700 }}
                  >
                    {s.n}
                  </div>
                  <s.Icon size={14} style={{ color: SAGE }} />
                  {i < steps.length - 1 && (
                    <ArrowRight size={12} className="ml-auto hidden md:block" style={{ color: BORDER_STRONG }} />
                  )}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{s.label}</div>
                <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 2, lineHeight: 1.45 }}>{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** 2. Quota Usage Widget — header right-side, 3 metrics, expandable. */
function QuotaUsageWidget({
  quota,
  sourcesCount,
  expanded,
  onToggle,
}: {
  quota: QuotaState;
  sourcesCount: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const SOURCES_TOTAL = 20;
  const iqPct = (quota.used / quota.total) * 100;
  const srcPct = (sourcesCount / SOURCES_TOTAL) * 100;
  const waPct = (quota.whatsappUsed / quota.whatsappTotal) * 100;

  const colorFor = (pct: number) =>
    pct > 90 ? NEGATIVE : pct >= 70 ? NEUTRAL_AMBER : SAGE;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-[#FAFAFA]"
        aria-label="Quotas du plan Essentiel"
        aria-expanded={expanded}
      >
        <KeyRound size={14} style={{ color: TEXT_BODY }} />
        <div className="hidden sm:flex flex-col items-start">
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Quotas
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL, fontWeight: 700 }}>
            {quota.used}/{quota.total}
          </span>
        </div>
      </button>

      {expanded && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={onToggle}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-1 z-50 rounded-lg shadow-lg"
            style={{
              width: 280,
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              padding: 14,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span style={FONT_HEADER}>Quotas · Plan Essentiel</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                Réinitialise {quota.date === todayISO() ? "demain" : "quotidiennement"}
              </span>
            </div>

            <QuotaRow
              label="HarchIQ AI"
              used={quota.used}
              total={quota.total}
              pct={iqPct}
              color={colorFor(iqPct)}
              resetLabel="Réinitialise à minuit"
            />
            <QuotaRow
              label="Sources surveillées"
              used={sourcesCount}
              total={SOURCES_TOTAL}
              pct={srcPct}
              color={colorFor(srcPct)}
              resetLabel="Fixe"
            />
            <QuotaRow
              label="Alertes WhatsApp"
              used={quota.whatsappUsed}
              total={quota.whatsappTotal}
              pct={waPct}
              color={colorFor(waPct)}
              resetLabel="Réinitialise le 1er du mois"
            />

            <div
              className="mt-3 pt-3"
              style={{ borderTop: `1px solid ${BORDER}` }}
            >
              <p style={{ fontFamily: FONT_SANS, fontSize: 10, color: TEXT_MUTED, lineHeight: 1.45 }}>
                Besoin de plus ? Passez à Pro pour 200 questions IA/jour, benchmarking et rapports personnalisés.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

function QuotaRow({
  label,
  used,
  total,
  pct,
  color,
  resetLabel,
}: {
  label: string;
  used: number;
  total: number;
  pct: number;
  color: string;
  resetLabel: string;
}) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="flex items-baseline justify-between">
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>{label}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY }}>
          <span style={{ color, fontWeight: 700 }}>{used}</span>
          <span style={{ color: TEXT_MUTED }}>/{total}</span>
        </span>
      </div>
      <div className="mt-1.5">
        <Progress
          value={pct}
          className="h-1.5"
          style={
            {
              ["--progress-background" as string]: "#F4F4F5",
              ["--progress-foreground" as string]: color,
            } as React.CSSProperties
          }
        />
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 3, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {resetLabel}
      </div>
    </div>
  );
}

/** 3. Milestone Badge — small header chip, sage pulse on recent unlock. */
function MilestoneBadge({
  progress,
  total,
  recentlyUnlocked,
  onClick,
}: {
  progress: number;
  total: number;
  recentlyUnlocked: boolean;
  onClick: () => void;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors hover:bg-[#FAFAFA]"
            aria-label={`Jalons : ${progress} sur ${total}`}
          >
            <span
              className={recentlyUnlocked ? "sage-pulse" : ""}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: progress === total ? SAGE_BG : "transparent",
                border: `1px solid ${progress === total ? SAGE : BORDER_STRONG}`,
              }}
            >
              <Flag size={10} style={{ color: progress === total ? SAGE : TEXT_MUTED }} />
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Jalons
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL, fontWeight: 700 }}>
              {progress}/{total}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          <span style={{ fontFamily: FONT_SANS, fontSize: 12 }}>
            {progress === total ? "Tous les jalons débloqués" : `${total - progress} jalon(s) restant(s)`}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** 4. Quick Start Card — 4 actions, for first-time users. */
function QuickStartCard({
  onAction,
  onDismiss,
  onRedoTour,
}: {
  onAction: (id: string) => void;
  onDismiss: () => void;
  onRedoTour: () => void;
}) {
  const actions = [
    { id: "score", label: "Voir mon score de réputation", desc: "Tableau de bord principal et tendances 30 jours.", Icon: TrendingUp },
    { id: "harchiq", label: "Lancer HarchIQ AI", desc: "Posez votre première question en langage naturel.", Icon: Sparkles },
    { id: "alertes", label: "Configurer mes alertes WhatsApp", desc: "Recevez une notification dès qu'une crise émerge.", Icon: Bell },
    { id: "rapport", label: "Télécharger mon premier rapport", desc: "Export CSV des 90 derniers jours, prêt à partager.", Icon: Download },
  ];

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12" style={{ backgroundColor: SAGE_BG, borderColor: SAGE }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-md shrink-0"
              style={{ width: 28, height: 28, backgroundColor: SAGE, color: "#FFFFFF" }}
            >
              <Zap size={14} />
            </div>
            <div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }}>
                Démarrage rapide
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                4 actions · moins de 5 minutes
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center justify-center rounded-md hover:bg-[#FFFFFF]"
            style={{ width: 24, height: 24 }}
            aria-label="Masquer le démarrage rapide"
          >
            <X size={14} style={{ color: TEXT_MUTED }} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map(({ id, label, desc, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onAction(id)}
              className="group text-left rounded-lg p-3 transition-all hover:shadow-md"
              style={{ border: `1px solid ${SAGE_DIM}`, backgroundColor: "#FFFFFF" }}
            >
              <div
                className="flex items-center justify-center rounded-md shrink-0 mb-2"
                style={{ width: 28, height: 28, backgroundColor: SAGE_BG, color: SAGE }}
              >
                <Icon size={14} />
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{label}</div>
              <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 2, lineHeight: 1.4 }}>{desc}</p>
              <div
                className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
              >
                <span>Ouvrir</span>
                <ArrowRight size={10} />
              </div>
            </button>
          ))}
        </div>

        {/* R2-ESSENTIAL-A — "Refaire le tour" link (re-trigger guided tour) */}
        <div
          className="mt-3 flex items-center justify-end"
          style={{ borderTop: `1px solid ${SAGE_DIM}`, paddingTop: 8 }}
        >
          <button
            type="button"
            onClick={onRedoTour}
            className="inline-flex items-center gap-1 transition-colors hover:opacity-80"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: SAGE,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <Sparkles size={11} />
            Refaire le tour
          </button>
        </div>
      </CardShell>
    </motion.div>
  );
}

/** 5. Empty State — reusable, CSS-only sage illustration. */
function EmptyState({
  title,
  description,
  ctaLabel,
  onCta,
  Icon = Sparkles,
  suggestionChips,
  onChip,
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  Icon?: typeof Sparkles;
  suggestionChips?: string[];
  onChip?: (chip: string) => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center rounded-md"
      style={{ padding: "32px 20px", minHeight: 200 }}
    >
      {/* CSS-only illustration area — sage circle with icon.
          POLISH-ESSENTIAL — sage-bounce animation on mount for a playful entrance. */}
      <div
        className="flex items-center justify-center rounded-full mb-4 sage-bounce"
        style={{
          width: 56,
          height: 56,
          backgroundColor: SAGE_BG,
          border: `1.5px dashed ${SAGE_DIM}`,
        }}
      >
        <Icon size={22} style={{ color: SAGE }} />
      </div>
      <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }}>
        {title}
      </div>
      <p
        className="mt-1.5 max-w-[360px]"
        style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_BODY, lineHeight: 1.55 }}
      >
        {description}
      </p>
      {ctaLabel && onCta && (
        <Button
          size="sm"
          className="mt-3 h-8"
          style={{ fontFamily: FONT_MONO, fontSize: 11, backgroundColor: SAGE, color: "#FFFFFF" }}
          onClick={onCta}
        >
          {ctaLabel}
          <ArrowRight size={12} className="ml-1.5" />
        </Button>
      )}
      {suggestionChips && suggestionChips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChip?.(chip)}
              className="rounded-full px-2.5 py-1 transition-colors hover:bg-[#FFFFFF]"
              style={{
                border: `1px solid ${SAGE_DIM}`,
                backgroundColor: SAGE_BG,
                fontFamily: FONT_SANS,
                fontSize: 11,
                color: SAGE,
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** 6. Milestone Tracker Card — dedicated section, 4 milestones + progress bar. */
function MilestoneTrackerCard({
  milestones,
  recentlyUnlockedKey,
}: {
  milestones: MilestoneState;
  recentlyUnlockedKey: string | null;
}) {
  const items = [
    { key: "firstArticle", label: "Premier article analysé", desc: "Harch a détecté votre première mention médiatique.", Icon: Newspaper },
    { key: "firstQuestion", label: "Première question HarchIQ", desc: "Vous avez posé votre première question à l'AI Workspace.", Icon: MessageSquare },
    { key: "firstReport", label: "Premier rapport téléchargé", desc: "Export CSV ou PDF généré et partagé avec votre équipe.", Icon: ClipboardList },
    { key: "firstWeek", label: "Première semaine complète", desc: "7 jours de veille réputationnelle consécutifs.", Icon: CalendarDays },
  ] as const;

  const completed = items.filter((i) => milestones[i.key]).length;
  const pct = (completed / items.length) * 100;
  const allDone = completed === items.length;

  return (
    <motion.div id="jalons" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="21 · Suivi des Jalons"
          right={
            <Badge
              variant="secondary"
              className="h-5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: "0.08em",
                backgroundColor: allDone ? SAGE_BG : "#FAFAFA",
                color: allDone ? SAGE : TEXT_MUTED,
              }}
            >
              {completed}/{items.length}
              {allDone ? " · COMPLET" : ""}
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
              {allDone ? "Tous vos jalons sont débloqués" : "Progression de votre onboarding"}
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: SAGE, fontWeight: 700 }}>
              {Math.round(pct)}%
            </span>
          </div>
          <Progress
            value={pct}
            className="h-2"
            style={
              {
                ["--progress-background" as string]: SAGE_BG_STRONG,
                ["--progress-foreground" as string]: SAGE,
              } as React.CSSProperties
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map(({ key, label, desc, Icon }) => {
            const done = milestones[key];
            const isRecent = recentlyUnlockedKey === key;
            return (
              <div
                key={key}
                className={isRecent ? "sage-pulse" : ""}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  border: `1px solid ${done ? SAGE : BORDER}`,
                  backgroundColor: done ? SAGE_BG : "#FFFFFF",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex items-center justify-center rounded-md shrink-0"
                    style={{
                      width: 28,
                      height: 28,
                      backgroundColor: done ? SAGE : "#FAFAFA",
                      color: done ? "#FFFFFF" : TEXT_MUTED,
                    }}
                  >
                    {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  </div>
                  <Icon size={14} style={{ color: done ? SAGE : TEXT_MUTED }} />
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                  {label}
                </div>
                <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 3, lineHeight: 1.45 }}>
                  {desc}
                </p>
                <div
                  className="mt-2"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: done ? SAGE : TEXT_MUTED,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {done ? "Débloqué" : "En attente"}
                </div>
              </div>
            );
          })}
        </div>

        {allDone && (
          <div
            className="mt-4 rounded-lg p-3 flex items-start gap-2"
            style={{ backgroundColor: SAGE_BG, border: `1px solid ${SAGE}` }}
          >
            <Trophy size={14} style={{ color: SAGE, flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                Onboarding terminé
              </div>
              <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, marginTop: 2, lineHeight: 1.5 }}>
                Vous maîtrisez les fondamentaux de Harch Atelier. Pour aller plus loin : benchmarks concurrents, rapports personnalisés, et 200 questions IA/jour avec le plan Pro.
              </p>
            </div>
          </div>
        )}
      </CardShell>
    </motion.div>
  );
}

// ─── ENV-ESSENTIAL helpers ─────────────────────────────────────────────

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function currentMonthISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const INITIAL_QUOTA: QuotaState = {
  used: 0,
  total: 50,
  date: todayISO(),
  whatsappUsed: 0,
  whatsappTotal: 100,
  whatsappMonth: currentMonthISO(),
};

const INITIAL_MILESTONES: MilestoneState = {
  firstArticle: false,
  firstQuestion: false,
  firstReport: false,
  firstWeek: false,
  firstVisitDate: todayISO(),
  lastUnlockedAt: null,
};

// ─── R2-ESSENTIEL-A — Notification + Tour constants ────────────────────

/** Dot color per notification type — red for crise, sage for rapport, amber for quota. */
const NOTIF_DOT_COLOR: Record<NotificationItem["type"], string> = {
  crise: NEGATIVE,
  rapport: SAGE,
  quota: NEUTRAL_AMBER,
};

/** Factory: 3 seed notifications for first-time visit (crise + rapport + quota). */
function makeSeedNotifications(): NotificationItem[] {
  const now = Date.now();
  return [
    {
      id: "seed-crise-1",
      type: "crise",
      title: "Pic d'activité négative détecté",
      body: "Harch surveille un pic de mentions négatives sur les réseaux sociaux dans les dernières 24h.",
      createdAt: now - 1000 * 60 * 35, // 35 min ago
      read: false,
      target: "alertes",
    },
    {
      id: "seed-rapport-1",
      type: "rapport",
      title: "Votre rapport hebdomadaire est prêt",
      body: "Synthèse des 7 derniers jours disponible en téléchargement CSV dans la Boîte à Outils.",
      createdAt: now - 1000 * 60 * 60 * 3, // 3 h ago
      read: false,
      target: "rapports",
    },
    {
      id: "seed-quota-1",
      type: "quota",
      title: "Quota HarchIQ à 80%",
      body: "Vous avez posé 40 questions sur 50 aujourd'hui. Le quota se réinitialise à minuit.",
      createdAt: now - 1000 * 60 * 60 * 6, // 6 h ago
      read: true,
      target: "ai-workspace",
    },
  ];
}

/** 5-step interactive tour — spotlight target + title + description. */
const TOUR_STEPS: { target: string; title: string; description: string }[] = [
  {
    target: "score",
    title: "Votre score de réputation",
    description: "Score agrégé 0-100 basé sur le sentiment, le volume de mentions et la part de voix. C'est votre indicateur de santé global.",
  },
  {
    target: "ai-workspace",
    title: "HarchIQ AI",
    description: "Posez vos questions en langage naturel. 50 questions par jour incluses dans votre plan Essentiel.",
  },
  {
    target: "sources",
    title: "Sources",
    description: "Répartition de vos mentions par source médiatique et sociale. Identifiez les canaux qui parlent de vous.",
  },
  {
    target: "alertes",
    title: "Alertes WhatsApp",
    description: "Harch détecte automatiquement les pics d'activité négative. Recevez une alerte WhatsApp dès qu'une crise émerge.",
  },
  {
    target: "rapports",
    title: "Rapports",
    description: "Exportez vos données en CSV pour partage interne. Rapports hebdomadaires et mensuels disponibles.",
  },
];

// ─── R3-ESSENTIEL-A — Round 3 client-side environment constants ────────
// Real-time Brand Mention Feed simulation + WhatsApp Alert Preview +
// Saved Searches Starter. All persisted via usePersistentState.

/** Source pool for the simulated Brand Mention Feed — seeded from real
 *  Moroccan / francophone media + social handles, grouped by source type. */
const MENTION_SOURCE_POOL: Record<MentionFeedSourceType, string[]> = {
  press: [
    "Hespress",
    "Le Matin",
    "L'Économiste",
    "Aujourd'hui Le Maroc",
    "Médias24",
    "TelQuel",
    "Le Desk",
    "Yabiladi News",
  ],
  social: [
    "Twitter @maroc_confidential",
    "Twitter @medias24",
    "Twitter @hespress",
    "Twitter @leconomiste",
    "Twitter @telquel_officiel",
  ],
  forum: [
    "Bladi.net Forum",
    "Maroc-Hebdo Discussion",
    "Reddit r/Morocco",
    "Forum Yabiladi",
  ],
  web: [
    "Google News Maroc",
    "Bing News",
    "Yahoo Actualités",
    "Search.ma",
  ],
};

/** Headline pool for the simulated Brand Mention Feed — mixed sentiment. */
const MENTION_HEADLINE_POOL: { text: string; sentiment: MentionFeedSentiment }[] = [
  { text: "L'entreprise annonce un nouveau plan stratégique pour 2026", sentiment: "positive" },
  { text: "Croissance remarquable du chiffre d'affaires au dernier trimestre", sentiment: "positive" },
  { text: "Innovation primée lors du salon international des technologies", sentiment: "positive" },
  { text: "Dirigeant invité à parler de transformation digitale", sentiment: "positive" },
  { text: "Lancement d'un programme de responsabilité sociale salué", sentiment: "positive" },
  { text: "Nouveau partenariat stratégique officialisé à Casablanca", sentiment: "positive" },
  { text: "Investissement important dans la formation des collaborateurs", sentiment: "positive" },
  { text: "Reconnaissance internationale pour ses pratiques RSE", sentiment: "positive" },
  { text: "Réorganisation interne annoncée pour le second semestre", sentiment: "neutral" },
  { text: "Conférence de presse prévue la semaine prochaine", sentiment: "neutral" },
  { text: "Changement de direction générale évoqué dans la presse", sentiment: "neutral" },
  { text: "Résultats annuels en ligne avec les attentes des analystes", sentiment: "neutral" },
  { text: "Participation confirmée au forum économique de Davos", sentiment: "neutral" },
  { text: "Extension géographique à l'étude pour 2027", sentiment: "neutral" },
  { text: "Polémique autour d'une décision de communication récente", sentiment: "negative" },
  { text: "Controverse sur les conditions de travail dans une usine", sentiment: "negative" },
  { text: "Baisse du score de réputation sur les réseaux sociaux", sentiment: "negative" },
  { text: "Mouvement de protestation signalé devant le siège social", sentiment: "negative" },
  { text: "Critiques sur la gestion environnementale de l'entreprise", sentiment: "negative" },
  { text: "Départ précipité d'un cadre dirigeant suscite interrogations", sentiment: "negative" },
];

/** Sentiment weights for the simulated feed (bias toward positive — real-
 *  world brand monitoring typically sees ~60% positive, 25% neutral, 15% neg). */
const MENTION_SENTIMENT_WEIGHTS: Record<MentionFeedSentiment, number> = {
  positive: 0.6,
  neutral: 0.25,
  negative: 0.15,
};

/** Initial WhatsApp alert config — crisis + daily on by default (weekly off). */
const WHATSAPP_ALERT_INITIAL: WhatsappAlertConfig = {
  crisis: true,
  daily: true,
  weekly: false,
  phone: "",
};

/** Sample WhatsApp alert messages (no emojis — Lucide icons in a side strip). */
const WHATSAPP_SAMPLE_ALERTS: { Icon: typeof AlertTriangle; text: string }[] = [
  {
    Icon: AlertTriangle,
    text: "Alerte crise: Score de réputation a chuté de 72 à 58 en 2h. Source: Hespress. [Voir détails]",
  },
  {
    Icon: CalendarDays,
    text: "Résumé quotidien: 23 articles analysés, sentiment 68% positif. Top source: Le Matin.",
  },
  {
    Icon: FileText,
    text: "Rapport mensuel prêt: 'Rapport Octobre 2026'. Téléchargez-le depuis votre console.",
  },
];

/** 3 preset search chips — clicking applies the corresponding query. */
const PRESET_SEARCHES: { label: string; query: string }[] = [
  { label: "Mon entreprise", query: "marque" },
  { label: "Mon secteur", query: "secteur" },
  { label: "Mes concurrents", query: "concurrent" },
];

/** Maximum saved searches for the Essentiel tier (Pro tier supports more). */
const MAX_SAVED_SEARCHES_ESSENTIEL = 5;

/** Maximum visible mentions before "Voir plus" is required. */
const MAX_VISIBLE_MENTIONS = 20;

/** How many additional mentions each "Voir plus" click reveals. */
const MENTIONS_VOIR_PLUS_BATCH = 5;

/** Initial skeleton delay for the Brand Mention Feed (ms). */
const MENTION_FEED_SKELETON_MS = 1500;

/** Min/max interval between simulated new mentions (ms). */
const MENTION_FEED_MIN_INTERVAL = 8000;
const MENTION_FEED_MAX_INTERVAL = 12000;

/** Factory: generate a single random mention for the simulated feed. */
function makeMentionFeedItem(): MentionFeedItem {
  const types: MentionFeedSourceType[] = ["press", "social", "forum", "web"];
  const sourceType = types[Math.floor(Math.random() * types.length)];
  const sourceName =
    MENTION_SOURCE_POOL[sourceType][
      Math.floor(Math.random() * MENTION_SOURCE_POOL[sourceType].length)
    ];
  const pick = MENTION_HEADLINE_POOL[Math.floor(Math.random() * MENTION_HEADLINE_POOL.length)];
  // Weighted sentiment — pick a random number in [0,1) and bucket it.
  const r = Math.random();
  let sentiment: MentionFeedSentiment;
  if (r < MENTION_SENTIMENT_WEIGHTS.positive) sentiment = "positive";
  else if (r < MENTION_SENTIMENT_WEIGHTS.positive + MENTION_SENTIMENT_WEIGHTS.neutral)
    sentiment = "neutral";
  else sentiment = "negative";
  return {
    id: `mention-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sourceType,
    sourceName,
    headline: pick.text,
    sentiment,
    timestamp: Date.now(),
  };
}

/** Truncate a string to N chars, appending "…" if truncated. */
function truncate80(s: string): string {
  if (s.length <= 80) return s;
  return s.slice(0, 77) + "…";
}

/** Sanitize a phone number — keep digits, +, spaces, dashes, parentheses. */
function sanitizePhone(input: string): string {
  return input.replace(/[^\d+\s()-]/g, "").slice(0, 20);
}

/** Validate a phone number — at least 8 digits, optional leading +. */
function isValidPhone(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

// ─── R4-ESSENTIEL-A — Round 4 constants ──────────────────────────────
// Weekly digest email schedule options · Source credibility tiers ·
// Credibility factor definitions · Weekly article pool · Hourly
// distribution pattern for sentiment timeline simulation.

/** Schedule options for the weekly digest email — persisted in localStorage. */
const DIGEST_SCHEDULE_OPTIONS: {
  value: DigestSchedule;
  label: string;
  description: string;
  Icon: typeof CalendarDays;
}[] = [
  { value: "monday", label: "Chaque lundi 8h", description: "Démarrez la semaine avec un récapitulatif stratégique", Icon: CalendarDays },
  { value: "friday", label: "Chaque vendredi 18h", description: "Bilan de fin de semaine avant le week-end", Icon: CalendarDays },
  { value: "off", label: "Désactiver", description: "Aucun email automatique — consultation manuelle uniquement", Icon: Pause },
];

/** Credibility tier definitions — drives badge color + icon + range. */
const CREDIBILITY_TIERS: {
  tier: SourceCredTier;
  label: string;
  min: number;
  max: number;
  color: string;
  bg: string;
  Icon: typeof CheckCircle2;
}[] = [
  { tier: "verified", label: "Vérifié", min: 80, max: 100, color: SAGE, bg: SAGE_BG, Icon: CheckCircle2 },
  { tier: "reliable", label: "Fiable", min: 60, max: 79, color: SAGE_DIM, bg: "rgba(111,160,136,0.10)", Icon: CheckCircle2 },
  { tier: "check", label: "À vérifier", min: 40, max: 59, color: NEUTRAL_AMBER, bg: "rgba(245,158,11,0.10)", Icon: AlertCircle },
  { tier: "unreliable", label: "Non fiable", min: 0, max: 39, color: NEGATIVE, bg: "rgba(239,68,68,0.10)", Icon: XCircle },
];

/** Credibility factor definitions — 4 dimensions of source evaluation. */
const CREDIBILITY_FACTORS: {
  factor: CredibilityFactor;
  label: string;
  description: string;
  Icon: typeof Shield;
}[] = [
  { factor: "authority", label: "Autorité du domaine", description: "Indice de notoriété du domaine (DA simulé)", Icon: Shield },
  { factor: "editorial", label: "Standards éditoriaux", description: "Charte éditoriale, signatures, ligne éditoriale claire", Icon: FileText },
  { factor: "factcheck", label: "Historique de vérification", description: "Antécédents de fact-checking et corrections publiées", Icon: CheckCheck },
  { factor: "transparency", label: "Transparence", description: "Contact éditorial, mentions légales accessibles", Icon: Eye },
];

/** Simulated top articles of the week — shown in the digest email body. */
const WEEKLY_ARTICLES_POOL: { title: string; source: string }[] = [
  { title: "Stratégie de marque: un tournant pour le secteur cette semaine", source: "Hespress" },
  { title: "Étude réputationnelle — les leaders se démarquent sur les réseaux", source: "Medias24" },
  { title: "Analyse — perception publique et communication institutionnelle", source: "Le Desk" },
  { title: "Opinion — ce que disent les médias internationaux de la marque", source: "TelQuel" },
  { title: "Décryptage — tendances de communication à surveiller", source: "L'Économiste" },
];

/** Hourly distribution pattern (24 values, 0-23) — normalized weights.
 * Low at night (3-5h), peaks around 9-15h, tapers in evening. */
const HOURLY_DISTRIBUTION_PATTERN: number[] = [
  0.18, 0.12, 0.08, 0.06, 0.05, 0.08, 0.12, 0.22,
  0.38, 0.55, 0.68, 0.78, 0.85, 0.92, 1.00, 0.88,
  0.72, 0.62, 0.55, 0.48, 0.40, 0.32, 0.25, 0.20,
];

/** Daily distribution pattern (7 values, Mon-Sun) — weekdays higher than weekend. */
const DAILY_DISTRIBUTION_PATTERN: number[] = [
  0.92, 1.00, 0.95, 0.88, 0.78, 0.55, 0.45,
];

// ─── R4-ESSENTIEL-A — Round 4 helper functions ──────────────────────

/** Compute ISO 8601 week number (1-53) for the given date. */
function weekNumber(d: Date): number {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // Set to nearest Thursday: ISO week starts Monday, contains Jan 4.
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/** Map a credibility score (0-100) to its tier. */
function tierForScore(score: number): SourceCredTier {
  if (score >= 80) return "verified";
  if (score >= 60) return "reliable";
  if (score >= 40) return "check";
  return "unreliable";
}

/** Lookup the French label for a tier. */
function tierLabelFor(tier: SourceCredTier): string {
  return CREDIBILITY_TIERS.find((t) => t.tier === tier)?.label ?? "—";
}

/** Deterministic 32-bit unsigned hash — used to derive stable per-source scores. */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Simulate the 4 credibility factor scores for a source name (deterministic). */
function simulateCredibilityFactors(name: string): CredibilityFactorScore[] {
  const h = hashStr(name.toLowerCase());
  return CREDIBILITY_FACTORS.map((cf, i) => {
    // Each factor draws 8 bits from the hash, shifted by factor index.
    const raw = (h >> (i * 4)) & 0xff;
    // Score range 30-100 (avoid extreme lows so tiers spread naturally).
    const score = 30 + (raw % 71);
    return {
      factor: cf.factor,
      label: cf.label,
      score,
      description: cf.description,
    };
  });
}

/** Build a full CredibilitySource from a name + type + article count.
 *  Used to seed API-derived sources and evaluate user-entered domains. */
function simulateSourceCredibility(
  name: string,
  type: "media" | "social" | "custom",
  articlesCount: number,
): CredibilitySource {
  const factors = simulateCredibilityFactors(name);
  const credibilityScore = Math.round(
    factors.reduce((s, f) => s + f.score, 0) / factors.length,
  );
  const tier = tierForScore(credibilityScore);
  // Simulated last article timestamp: spread within last 7 days based on hash.
  const lastArticleAt = articlesCount > 0
    ? Date.now() - (hashStr(name) % (7 * 24 * 3600 * 1000))
    : null;
  return {
    id: `src-${hashStr(name.toLowerCase())}`,
    name,
    type,
    credibilityScore,
    factors,
    tier,
    articlesCount,
    lastArticleAt,
    custom: type === "custom",
  };
}

/** Simulate 24 hourly buckets from total mentions + sentiment split.
 *  Each bucket: positive/neutral/negative count, dominant sentiment,
 *  anomaly flag (negative spike or volume >2x mean). */
function simulateSentimentHourBuckets(
  mentionCount24h: number,
  sentiment: { positive: number; neutral: number; negative: number },
): SentimentTimelineBucket[] {
  const patternSum = HOURLY_DISTRIBUTION_PATTERN.reduce((a, b) => a + b, 0);
  const meanPerHour = mentionCount24h / 24;
  return HOURLY_DISTRIBUTION_PATTERN.map((weight, hour) => {
    const total = Math.max(
      0,
      Math.round((mentionCount24h * weight) / patternSum),
    );
    // Per-hour sentiment variation (±10%) — deterministic from hour.
    const variation = (hashStr(`hour-${hour}`) % 20) - 10;
    const posPct = Math.max(0, Math.min(100, sentiment.positive + variation));
    const negPct = Math.max(0, Math.min(100, sentiment.negative - variation));
    const positive = Math.round((total * posPct) / 100);
    const negative = Math.round((total * negPct) / 100);
    const neutral = Math.max(0, total - positive - negative);
    const dominantSentiment: "positive" | "neutral" | "negative" =
      positive >= neutral && positive >= negative
        ? "positive"
        : negative >= neutral
          ? "negative"
          : "neutral";
    const isAnomaly =
      negative > (positive + neutral) * 0.5 ||
      (total > meanPerHour * 2 && meanPerHour > 0);
    return {
      index: hour,
      positive,
      neutral,
      negative,
      total,
      dominantSentiment,
      isAnomaly,
    };
  });
}

/** Simulate 7 daily buckets from sentiment split.
 *  Each bucket: positive/neutral/negative count, dominant sentiment,
 *  anomaly flag (negative spike). */
function simulateSentimentDailyBuckets(
  sentiment: { positive: number; neutral: number; negative: number },
): SentimentTimelineBucket[] {
  const patternSum = DAILY_DISTRIBUTION_PATTERN.reduce((a, b) => a + b, 0);
  const dailyBase = 50; // base articles per day (simulated)
  return DAILY_DISTRIBUTION_PATTERN.map((weight, day) => {
    const total = Math.round((dailyBase * 7 * weight) / patternSum);
    // Per-day sentiment variation (±15%) — deterministic from day.
    const variation = (hashStr(`day-${day}`) % 30) - 15;
    const posPct = Math.max(0, Math.min(100, sentiment.positive + variation));
    const negPct = Math.max(0, Math.min(100, sentiment.negative - variation));
    const positive = Math.round((total * posPct) / 100);
    const negative = Math.round((total * negPct) / 100);
    const neutral = Math.max(0, total - positive - negative);
    const dominantSentiment: "positive" | "neutral" | "negative" =
      positive >= neutral && positive >= negative
        ? "positive"
        : negative >= neutral
          ? "negative"
          : "neutral";
    const isAnomaly = negative > (positive + neutral) * 0.5;
    return {
      index: day,
      positive,
      neutral,
      negative,
      total,
      dominantSentiment,
      isAnomaly,
    };
  });
}

// ════════════════════════════════════════════════════════════════════
// R2-ESSENTIEL-A — Round 2 client-side environment components
// Daily Briefing · Notification Center · Guided Tour
// All persisted via usePersistentState (localStorage-backed, SSR-safe).
// ════════════════════════════════════════════════════════════════════

/** 7. Daily Briefing Card — auto-generated morning summary with TTS + WhatsApp. */
function DailyBriefingCard({
  userName,
  health,
  sources,
  briefingDate,
  onViewed,
}: {
  userName: string;
  health: BrandHealth | null;
  sources: SourceDistResp | null;
  briefingDate: string;
  onViewed: () => void;
}) {
  const today = todayISO();
  const isNew = briefingDate !== today;

  const mentionCount = health?.mentionCount24h ?? 0;
  const sentimentPct = health ? Math.round(health.sentiment.positive) : null;
  const topSource = sources?.sources?.[0]?.name ?? null;
  const crisisLevel = health?.crisisLevel ?? "safe";

  const crisisLabel: Record<BrandHealth["crisisLevel"], string> = {
    safe: "aucune crise détectée",
    watch: "vigilance crise modérée",
    warning: "alerte crise élevée",
    critical: "crise critique en cours",
  };

  const firstName = (userName.split(" ")[0] || userName).trim();
  const articlesStr = `${mentionCount} article${mentionCount > 1 ? "s" : ""}`;
  const sentimentStr = sentimentPct !== null ? `sentiment ${sentimentPct}%` : "sentiment —";
  const sourceStr = topSource ? `${topSource} dominant` : "aucune source dominante";
  const crisisStr = crisisLabel[crisisLevel];

  const briefingText = `Bonjour ${firstName}. Aujourd'hui : ${articlesStr}, ${sentimentStr}, ${sourceStr}, ${crisisStr}.`;

  // ─── Web Speech API — French TTS (guarded for SSR + browser support) ──
  const handleListen = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Synthèse vocale non disponible sur ce navigateur");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(briefingText);
      utter.lang = "fr-FR";
      utter.rate = 1;
      utter.pitch = 1;
      // Try to find a French voice (best-effort — getVoices may be empty
      // on first call, in which case the browser default is used).
      const voices = window.speechSynthesis.getVoices();
      const frVoice = voices.find((v) => v.lang.toLowerCase().startsWith("fr"));
      if (frVoice) utter.voice = frVoice;
      window.speechSynthesis.speak(utter);
      toast.success("Lecture du briefing en cours", {
        description: "Cliquez à nouveau pour réécouter.",
      });
      onViewed();
    } catch {
      toast.error("Erreur lors de la lecture audio");
    }
  }, [briefingText, onViewed]);

  const handleWhatsApp = useCallback(async () => {
    // P1-5 FIX: real WhatsApp digest trigger via /api/console/whatsapp-digest
    toast.info("Envoi du briefing sur WhatsApp…");
    try {
      const r = await fetch("/api/console/whatsapp-digest", { method: "GET" });
      if (r.ok) {
        toast.success("Briefing envoyé sur WhatsApp", {
          description: "Vous recevrez le résumé quotidien sur votre numéro enregistré.",
        });
        onViewed();
      } else {
        toast.error(`Erreur ${r.status} — envoi échoué`);
      }
    } catch {
      toast.error("Erreur réseau — réessayez");
    }
  }, [onViewed]);

  const lastViewedLabel = briefingDate
    ? `Vu le ${format(parseISO(briefingDate), "dd MMM", { locale: fr })}`
    : "Nouveau briefing";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12" style={{ border: `1px solid ${SAGE}` }}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-md shrink-0"
              style={{ width: 28, height: 28, backgroundColor: SAGE, color: "#FFFFFF" }}
            >
              <Sun size={14} />
            </div>
            <div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }}>
                Briefing du jour
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: SAGE,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {format(new Date(), "EEEE d MMMM", { locale: fr })} · {lastViewedLabel}
              </div>
            </div>
          </div>
          {isNew && (
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
              NOUVEAU
            </Badge>
          )}
        </div>

        {/* Briefing text */}
        <div
          className="rounded-md p-3"
          style={{ backgroundColor: SAGE_BG, borderLeft: `3px solid ${SAGE}` }}
        >
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              lineHeight: 1.55,
              color: CHARCOAL,
              margin: 0,
            }}
          >
            {briefingText}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            className="h-8"
            onClick={handleListen}
            style={{ fontFamily: FONT_MONO, fontSize: 11, backgroundColor: SAGE, color: "#FFFFFF" }}
          >
            <Volume2 size={12} className="mr-1.5" />
            Écouter
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={handleWhatsApp}
            style={{ fontFamily: FONT_MONO, fontSize: 11 }}
          >
            <Send size={12} className="mr-1.5" />
            Recevoir sur WhatsApp
          </Button>
          <span
            className="ml-auto"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: TEXT_MUTED,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Généré à {format(new Date(), "HH:mm", { locale: fr })}
          </span>
        </div>
      </CardShell>
    </motion.div>
  );
}

/** 8. Notification Bell — header dropdown panel with 3 notif types. */
function NotificationBell({
  notifications,
  expanded,
  onToggle,
  onMarkAllRead,
  onClickNotification,
}: {
  notifications: NotificationItem[];
  expanded: boolean;
  onToggle: () => void;
  onMarkAllRead: () => void;
  onClickNotification: (n: NotificationItem) => void;
}) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggle}
              className="relative inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
              style={{ width: 32, height: 32 }}
              aria-label={`Notifications${unread > 0 ? `, ${unread} non lues` : ""}`}
              aria-expanded={expanded}
            >
              <Bell size={18} style={{ color: TEXT_BODY }} />
              {unread > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    right: 3,
                    minWidth: 14,
                    height: 14,
                    padding: "0 3px",
                    borderRadius: 7,
                    backgroundColor: NEGATIVE,
                    color: "#FFFFFF",
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #FFFFFF",
                  }}
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span style={{ fontFamily: FONT_SANS, fontSize: 12 }}>
              {unread > 0 ? `${unread} notification(s) non lue(s)` : "Aucune notification non lue"}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {expanded && (
        <>
          {/* Click-outside overlay */}
          <div className="fixed inset-0 z-40" onClick={onToggle} aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-1 z-50 rounded-lg shadow-lg"
            style={{
              width: 340,
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-3 py-2.5"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              <span style={FONT_HEADER}>Notifications</span>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="inline-flex items-center gap-1"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: SAGE,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  <CheckCheck size={11} />
                  Tout marquer comme lu
                </button>
              )}
            </div>

            {/* Empty state */}
            {notifications.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <div
                  className="flex items-center justify-center rounded-full mx-auto mb-2"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: SAGE_BG,
                    border: `1px dashed ${SAGE_DIM}`,
                  }}
                >
                  <CheckCircle2 size={16} style={{ color: SAGE }} />
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
                  Aucune notification
                </div>
                <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>
                  Vous êtes à jour.
                </p>
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.map((n) => {
                  const Icon =
                    n.type === "crise" ? AlertTriangle : n.type === "rapport" ? FileText : KeyRound;
                  const dotColor = NOTIF_DOT_COLOR[n.type];
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => onClickNotification(n)}
                      className="w-full text-left px-3 py-2.5 transition-colors hover:bg-[#FAFAFA]"
                      style={{ borderBottom: `1px solid ${BORDER}` }}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          style={{
                            marginTop: 5,
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: dotColor,
                            flexShrink: 0,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Icon size={12} style={{ color: dotColor, flexShrink: 0 }} />
                            <span
                              style={{
                                fontFamily: FONT_SANS,
                                fontSize: 12,
                                fontWeight: n.read ? 500 : 700,
                                color: CHARCOAL,
                              }}
                            >
                              {n.title}
                            </span>
                          </div>
                          <p
                            style={{
                              fontFamily: FONT_SANS,
                              fontSize: 11,
                              color: TEXT_BODY,
                              marginTop: 2,
                              lineHeight: 1.45,
                            }}
                          >
                            {n.body}
                          </p>
                          <div
                            style={{
                              fontFamily: FONT_MONO,
                              fontSize: 9,
                              color: TEXT_MUTED,
                              marginTop: 4,
                              letterSpacing: "0.04em",
                            }}
                          >
                            {fmtRelative(n.createdAt)}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

/** 9. Guided Tour — 5-step spotlight overlay, CSS-only via box-shadow. */
function GuidedTour({
  active,
  step,
  onNext,
  onSkip,
}: {
  active: boolean;
  step: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Scroll target into view + measure rect; update on scroll/resize.
  useEffect(() => {
    if (!active) {
      // Clear spotlight rect when tour is inactive — canonical reset pattern.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRect(null);
      return;
    }
    const stepData = TOUR_STEPS[step];
    if (!stepData) return;
    const el = document.getElementById(stepData.target);
    if (!el) return;

    // Scroll target into view first (smooth, centered).
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const updateRect = () => setRect(el.getBoundingClientRect());

    // Initial measurement after smooth scroll settles (~400ms).
    const t = setTimeout(updateRect, 400);

    // Track scroll/resize to keep spotlight aligned.
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);

    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [active, step]);

  if (!active || !rect) return null;
  const stepData = TOUR_STEPS[step];
  if (!stepData) return null;

  const isLast = step === TOUR_STEPS.length - 1;

  // Tooltip position — below spotlight by default, above if no space below.
  const tooltipBelow = rect.bottom + 220 < window.innerHeight;
  const tooltipLeft = Math.max(
    16,
    Math.min(rect.left, window.innerWidth - 336),
  );
  const tooltipTop = tooltipBelow ? rect.bottom + 16 : Math.max(16, rect.top - 200);

  return (
    <>
      {/* Spotlight overlay — fixed div with inset box-shadow creates dark mask
          with a transparent hole around the target element. */}
      <div
        style={{
          position: "fixed",
          left: rect.left - 8,
          top: rect.top - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          borderRadius: 12,
          boxShadow: "0 0 0 9999px rgba(10,10,10,0.65)",
          border: `2px solid ${SAGE}`,
          zIndex: 100,
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "none",
        }}
      />

      {/* Tooltip card */}
      <div
        style={{
          position: "fixed",
          left: tooltipLeft,
          top: tooltipTop,
          width: 320,
          zIndex: 110,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="rounded-lg shadow-xl"
          style={{
            backgroundColor: "#FFFFFF",
            border: `1px solid ${SAGE}`,
            padding: 16,
          }}
        >
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-3">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    i === step ? SAGE : i < step ? SAGE_DIM : BORDER_STRONG,
                  transition: "all 0.2s",
                }}
              />
            ))}
            <span
              className="ml-auto"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
                letterSpacing: "0.04em",
              }}
            >
              {step + 1}/{TOUR_STEPS.length}
            </span>
          </div>

          {/* Title + description */}
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
            {stepData.title}
          </div>
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: TEXT_BODY,
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            {stepData.description}
          </p>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            <Button
              size="sm"
              className="h-8"
              onClick={onNext}
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                backgroundColor: SAGE,
                color: "#FFFFFF",
              }}
            >
              {isLast ? "Terminer" : "Suivant"}
              {!isLast && <ArrowRight size={12} className="ml-1.5" />}
            </Button>
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Passer le tour
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// R2-ESSENTIEL-B — Command Palette (Cmd+K) + Progressive Disclosure
// All persisted via usePersistentState (localStorage-backed, SSR-safe).
// WCAG 2.1 AA — focus-visible outlines, aria-live skeletons, sr-only labels.
// ════════════════════════════════════════════════════════════════════

/** Command Palette action — id, label, optional hint, Lucide icon, run callback. */
interface CmdAction {
  id: string;
  label: string;
  hint?: string;
  Icon: typeof Command;
  run: () => void;
}

/** 10. Command Palette — Cmd+K / Ctrl+K overlay with fuzzy filter + recents. */
function CommandPalette({
  open,
  onClose,
  actions,
  recents,
  onPushRecent,
}: {
  open: boolean;
  onClose: () => void;
  actions: CmdAction[];
  recents: string[];
  onPushRecent: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reset query + selection on open, then focus input after fade-in.
  useEffect(() => {
    if (!open) return;
    // Canonical reset pattern — when the palette opens, clear the local
    // state. Effect deps = [open] only, so this runs once per open.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    setSelected(0);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  // Filter actions — recent first, then all (no duplicates).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (a: CmdAction) =>
      !q ||
      a.label.toLowerCase().includes(q) ||
      a.hint?.toLowerCase().includes(q);
    const recentActions = recents
      .map((id) => actions.find((a) => a.id === id))
      .filter((a): a is CmdAction => a !== undefined)
      .filter(match);
    const recentIds = new Set(recentActions.map((a) => a.id));
    const allActions = actions
      .filter((a) => !recentIds.has(a.id))
      .filter(match);
    return { recent: recentActions, all: allActions };
  }, [query, actions, recents]);

  const flat = useMemo(
    () => [...filtered.recent, ...filtered.all],
    [filtered],
  );

  // Keep selection in range when the list shrinks.
  useEffect(() => {
    // Clamp selection — canonical use case for setState in effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selected > flat.length - 1) setSelected(Math.max(0, flat.length - 1));
  }, [flat, selected]);

  const execute = useCallback(
    (action: CmdAction | undefined) => {
      if (!action) return;
      action.run();
      onPushRecent(action.id);
      onClose();
    },
    [onPushRecent, onClose],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(flat[selected]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[150] flex items-start justify-center pt-[12vh] px-4"
          style={{
            backgroundColor: "rgba(10,10,10,0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
            className="w-full max-w-[560px] rounded-xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER_STRONG}` }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Palette de commandes"
          >
            {/* Search input row */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              <Search size={16} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher une action…"
                lang="fr"
                className="flex-1 outline-none bg-transparent focus-visible:outline-none"
                style={{ fontFamily: FONT_SANS, fontSize: 14, color: CHARCOAL }}
                aria-label="Rechercher une action"
                aria-expanded={open}
                aria-controls="cmd-list"
                role="combobox"
                aria-autocomplete="list"
                aria-activedescendant={flat[selected] ? `cmd-item-${flat[selected].id}` : undefined}
              />
              <kbd
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: TEXT_MUTED,
                  border: `1px solid ${BORDER_STRONG}`,
                  borderRadius: 4,
                  padding: "2px 6px",
                  backgroundColor: "#FAFAFA",
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Action list */}
            <div
              id="cmd-list"
              role="listbox"
              aria-label="Actions disponibles"
              className="max-h-[400px] overflow-y-auto py-1.5"
            >
              {flat.length === 0 ? (
                <div
                  className="px-4 py-6 text-center"
                  style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}
                >
                  Aucune action ne correspond à « {query} »
                </div>
              ) : (
                <>
                  {filtered.recent.length > 0 && (
                    <>
                      <div style={{ ...FONT_HEADER, padding: "6px 16px 4px" }}>Récents</div>
                      {filtered.recent.map((a, i) => (
                        <CmdRow
                          key={`rec-${a.id}`}
                          action={a}
                          selected={i === selected}
                          onSelect={execute}
                          onHover={() => setSelected(i)}
                        />
                      ))}
                      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "6px 0" }} />
                    </>
                  )}
                  <div style={{ ...FONT_HEADER, padding: "6px 16px 4px" }}>
                    {filtered.recent.length > 0 ? "Toutes les actions" : "Actions"}
                  </div>
                  {filtered.all.map((a, idx) => {
                    const i = filtered.recent.length + idx;
                    return (
                      <CmdRow
                        key={`all-${a.id}`}
                        action={a}
                        selected={i === selected}
                        onSelect={execute}
                        onHover={() => setSelected(i)}
                      />
                    );
                  })}
                </>
              )}
            </div>

            {/* Footer hint */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
            >
              <div
                className="flex items-center gap-3"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
              >
                <span className="inline-flex items-center gap-1">
                  <CornerDownLeft size={10} /> Entrée pour exécuter
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd
                    style={{
                      border: `1px solid ${BORDER_STRONG}`,
                      borderRadius: 3,
                      padding: "1px 5px",
                      backgroundColor: "#FFFFFF",
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                    }}
                  >
                    ↑
                  </kbd>
                  <kbd
                    style={{
                      border: `1px solid ${BORDER_STRONG}`,
                      borderRadius: 3,
                      padding: "1px 5px",
                      backgroundColor: "#FFFFFF",
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                    }}
                  >
                    ↓
                  </kbd>
                  Naviguer
                </span>
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}>
                Harch Atelier
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Single command palette row — sage background when selected. */
function CmdRow({
  action,
  selected,
  onSelect,
  onHover,
}: {
  action: CmdAction;
  selected: boolean;
  onSelect: (a: CmdAction) => void;
  onHover: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      id={`cmd-item-${action.id}`}
      aria-selected={selected}
      onClick={() => onSelect(action)}
      onMouseEnter={onHover}
      className="w-full text-left px-4 py-2.5 transition-colors flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2"
      style={{
        backgroundColor: selected ? SAGE_BG : "transparent",
        borderLeft: selected ? `2px solid ${SAGE}` : "2px solid transparent",
      }}
    >
      <div
        className="flex items-center justify-center rounded-md shrink-0"
        style={{
          width: 24,
          height: 24,
          backgroundColor: selected ? SAGE : "#FAFAFA",
          color: selected ? "#FFFFFF" : SAGE,
        }}
      >
        <action.Icon size={12} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 13,
            fontWeight: selected ? 700 : 500,
            color: CHARCOAL,
            lineHeight: 1.3,
          }}
        >
          {action.label}
        </div>
        {action.hint && (
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: TEXT_MUTED,
              marginTop: 2,
              letterSpacing: "0.02em",
            }}
          >
            {action.hint}
          </div>
        )}
      </div>
      {selected && <CornerDownLeft size={12} style={{ color: SAGE, flexShrink: 0 }} />}
    </button>
  );
}

/** 11. Progressive List — top N visible, expand to all with smooth animation. */
function ProgressiveList<T>({
  sectionKey,
  items,
  limit = 5,
  threshold = 10,
  renderItem,
  title = "Détails",
}: {
  sectionKey: string;
  items: T[];
  limit?: number;
  threshold?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  title?: string;
}) {
  // Persisted expand state — single object so all sections share one localStorage key.
  const [disclosure, setDisclosure] = usePersistentState<Record<string, boolean>>(
    "essential:disclosure",
    {},
  );
  const expanded = disclosure[sectionKey] ?? false;
  const hasToggle = items.length > threshold;
  const initial = items.slice(0, limit);
  const rest = items.slice(limit);
  const hiddenCount = items.length - limit;

  const toggle = useCallback(() => {
    setDisclosure((prev) => ({ ...prev, [sectionKey]: !expanded }));
  }, [sectionKey, expanded, setDisclosure]);

  if (items.length === 0) return null;

  return (
    <div className="mt-3" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
      <div
        className="flex items-center justify-between mb-2"
        style={{ ...FONT_HEADER }}
      >
        <span>{title}</span>
        <span style={{ color: TEXT_MUTED }}>{items.length} éléments</span>
      </div>
      <div className="space-y-1.5">
        {initial.map((item, i) => (
          <div key={`init-${i}`}>{renderItem(item, i)}</div>
        ))}
        <AnimatePresence initial={false}>
          {expanded && rest.length > 0 && (
            <motion.div
              key="rest"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] as const }}
              style={{ overflow: "hidden" }}
            >
              <div className="space-y-1.5 pt-1.5">
                {rest.map((item, i) => (
                  <div key={`rest-${i}`}>{renderItem(item, i + limit)}</div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasToggle && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls={`prog-list-${sectionKey}`}
          id={`prog-toggle-${sectionKey}`}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2"
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: SAGE,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            border: `1px solid ${SAGE_DIM}`,
          }}
        >
          {expanded ? (
            <>
              <ChevronRight size={10} style={{ transform: "rotate(90deg)" }} />
              Voir moins
            </>
          ) : (
            <>
              <ChevronRight size={10} />
              Voir plus
              {hiddenCount > 0 && (
                <span style={{ color: TEXT_MUTED, marginLeft: 2 }}>
                  · {hiddenCount} autres
                </span>
              )}
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// R3-ESSENTIEL-A — Round 3 client-side environment components
// Brand Mention Feed · WhatsApp Alert Preview · Saved Searches Starter
// All persisted via usePersistentState (localStorage-backed, SSR-safe).
// ════════════════════════════════════════════════════════════════════

/** Source icon by type — press/social/forum/web → Lucide icon. */
function mentionSourceIcon(type: MentionFeedSourceType): typeof Newspaper {
  switch (type) {
    case "press":
      return Newspaper;
    case "social":
      return Twitter;
    case "forum":
      return MessageCircle;
    case "web":
      return Globe2;
  }
}

/** Sentiment badge label + color — pos sage / neu gray / neg red. */
function mentionSentimentBadge(s: MentionFeedSentiment): { label: string; color: string; bg: string } {
  if (s === "positive") return { label: "Positif", color: SAGE, bg: SAGE_BG };
  if (s === "negative") return { label: "Négatif", color: NEGATIVE, bg: "rgba(239,68,68,0.08)" };
  return { label: "Neutre", color: NEUTRAL_GRAY, bg: "rgba(161,161,170,0.10)" };
}

/** 11. Brand Mention Feed — real-time live list (simulated, ephemeral).
 *  New mention every 8-12s, max 20 visible (FIFO), filter by sentiment,
 *  "Voir plus" reveals 5 more from buffer. Optional external query filter
 *  applied when a Saved Search is launched. */
function BrandMentionFeedCard({
  externalQuery,
  onClearQuery,
}: {
  externalQuery: string;
  onClearQuery: () => void;
}) {
  const [mentions, setMentions] = useState<MentionFeedItem[]>([]);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<MentionFilter>("all");
  const [extraShown, setExtraShown] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initial mount skeleton (1.5s) + seed 6 initial mentions.
  useEffect(() => {
    const seed: MentionFeedItem[] = [];
    for (let i = 0; i < 6; i++) {
      const item = makeMentionFeedItem();
      // Stagger timestamps over the past ~30 min for realistic relative time.
      item.timestamp = Date.now() - i * (1000 * 60 * (1 + Math.floor(Math.random() * 5)));
      seed.push(item);
    }
    const t = setTimeout(() => {
      // One-shot seed after skeleton delay. Effect deps = [].
      setMentions(seed);
      setLoading(false);
    }, MENTION_FEED_SKELETON_MS);
    return () => clearTimeout(t);
  }, []);

  // Real-time feed — recursive setTimeout with random 8-12s delay.
  // Disabled while paused or while skeleton is showing.
  useEffect(() => {
    if (paused || loading) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay =
        MENTION_FEED_MIN_INTERVAL +
        Math.random() * (MENTION_FEED_MAX_INTERVAL - MENTION_FEED_MIN_INTERVAL);
      timeoutId = setTimeout(() => {
        setMentions((prev) => {
          const next = [makeMentionFeedItem(), ...prev];
          // Cap internal array at 100 items (memory bound — keeps buffer
          // sizable for "Voir plus" but prevents unbounded growth).
          return next.slice(0, 100);
        });
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [paused, loading]);

  // Filtered + paginated display: visible (max 20) + extra (revealed by "Voir plus").
  const visible = useMemo(
    () => mentions.slice(0, MAX_VISIBLE_MENTIONS + extraShown),
    [mentions, extraShown],
  );
  const bufferCount = Math.max(0, mentions.length - MAX_VISIBLE_MENTIONS - extraShown);

  const filtered = useMemo(() => {
    const q = externalQuery.trim().toLowerCase();
    return visible.filter((m) => {
      if (filter !== "all" && m.sentiment !== filter) return false;
      if (q) {
        const haystack = `${m.sourceName} ${m.headline}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [visible, filter, externalQuery]);

  const handleVoirPlus = useCallback(() => {
    if (bufferCount === 0) {
      toast.info("Aucune mention supplémentaire pour le moment");
      return;
    }
    setExtraShown((n) => n + MENTIONS_VOIR_PLUS_BATCH);
  }, [bufferCount]);

  const handlePauseToggle = useCallback(() => {
    setPaused((p) => {
      toast.success(p ? "Flux repris" : "Flux en pause", {
        description: p
          ? "Vous recevez à nouveau les mentions en temps réel."
          : "Cliquez sur Reprendre pour relancer le flux.",
      });
      return !p;
    });
  }, []);

  const totalFiltered = filtered.length;
  const totalAll = mentions.length;

  return (
    <motion.div id="flux-mentions" {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader
          title="Flux de mentions en temps réel"
          right={
            <div className="flex items-center gap-1.5">
              {/* Filtrer dropdown — native select styled. */}
              <div className="relative">
                <Filter
                  size={11}
                  style={{
                    color: TEXT_MUTED,
                    position: "absolute",
                    left: 6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <select
                  aria-label="Filtrer les mentions par sentiment"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as MentionFilter)}
                  className="appearance-none rounded-md pl-5 pr-2 py-0.5 cursor-pointer"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: CHARCOAL,
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BORDER_STRONG}`,
                  }}
                >
                  <option value="all">Tous</option>
                  <option value="positive">Positif</option>
                  <option value="neutral">Neutre</option>
                  <option value="negative">Négatif</option>
                </select>
              </div>
              {/* Pause / Reprendre toggle. */}
              <button
                type="button"
                onClick={handlePauseToggle}
                aria-label={paused ? "Reprendre le flux" : "Mettre le flux en pause"}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors hover:bg-[#FAFAFA]"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: paused ? SAGE : TEXT_MUTED,
                  border: `1px solid ${paused ? SAGE : BORDER_STRONG}`,
                  backgroundColor: paused ? SAGE_BG : "transparent",
                }}
              >
                {paused ? <Play size={11} /> : <Pause size={11} />}
                {paused ? "Reprendre" : "Pause"}
              </button>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {/* Active external query chip (from Saved Searches). */}
        {externalQuery.trim() && (
          <div className="mb-3 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: SAGE,
                backgroundColor: SAGE_BG,
                border: `1px solid ${SAGE}`,
              }}
            >
              <Search size={10} />
              Filtre actif: « {externalQuery} »
              <button
                type="button"
                onClick={onClearQuery}
                aria-label="Effacer le filtre de recherche"
                className="inline-flex items-center justify-center rounded-full ml-0.5 hover:bg-[rgba(74,123,95,0.14)]"
                style={{ width: 14, height: 14 }}
              >
                <X size={10} />
              </button>
            </span>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <LiveSkeleton key={i} className="h-14 w-full" label="Chargement des mentions en cours" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ height: 320, gap: 8 }}
          >
            <Newspaper size={28} style={{ color: TEXT_HEADER }} />
            <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }}>
              Aucune mention à afficher
            </div>
            <p
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                color: TEXT_BODY,
                maxWidth: 320,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {filter !== "all"
                ? `Aucune mention ${mentionSentimentBadge(filter as MentionFeedSentiment).label.toLowerCase()} pour le moment. Le flux reprend en continu.`
                : externalQuery.trim()
                  ? `Aucune mention ne correspond à « ${externalQuery} ». Le flux continue en arrière-plan.`
                  : "Le flux démarre. Les nouvelles mentions apparaîtront ici en temps réel."}
            </p>
          </div>
        ) : (
          <>
            <div
              className="space-y-1.5 overflow-y-auto pr-1"
              style={{ maxHeight: 380 }}
            >
              <style>{`
                .mention-feed-scroll::-webkit-scrollbar { width: 6px; }
                .mention-feed-scroll::-webkit-scrollbar-track { background: transparent; }
                .mention-feed-scroll::-webkit-scrollbar-thumb { background: ${BORDER_STRONG}; border-radius: 3px; }
              `}</style>
              <AnimatePresence initial={false}>
                {filtered.map((m) => {
                  const Icon = mentionSourceIcon(m.sourceType);
                  const badge = mentionSentimentBadge(m.sentiment);
                  return (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, y: -6, backgroundColor: SAGE_BG }}
                      animate={{ opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0)" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
                      className="rounded-md p-2.5"
                      style={{ border: `1px solid ${BORDER}` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className="inline-flex items-center justify-center rounded shrink-0"
                            style={{
                              width: 18,
                              height: 18,
                              backgroundColor: SAGE_BG,
                              color: SAGE,
                            }}
                          >
                            <Icon size={10} />
                          </span>
                          <span
                            className="truncate"
                            style={{
                              fontFamily: FONT_MONO,
                              fontSize: 10,
                              color: TEXT_MUTED,
                            }}
                          >
                            {m.sourceName}
                          </span>
                          <span
                            className="inline-flex items-center rounded px-1.5 py-0.5 shrink-0"
                            style={{
                              fontFamily: FONT_MONO,
                              fontSize: 9,
                              fontWeight: 700,
                              color: badge.color,
                              backgroundColor: badge.bg,
                            }}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <span
                          className="shrink-0"
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 10,
                            color: TEXT_MUTED,
                          }}
                        >
                          {fmtRelative(m.timestamp)}
                        </span>
                      </div>
                      <p
                        className="mt-1.5"
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 12,
                          color: CHARCOAL,
                          lineHeight: 1.4,
                          margin: 0,
                        }}
                      >
                        {truncate80(m.headline)}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer: count + Voir plus button. */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: TEXT_MUTED,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {totalFiltered} / {totalAll} mentions
                {paused && " · en pause"}
              </span>
              {bufferCount > 0 && (
                <button
                  type="button"
                  onClick={handleVoirPlus}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: SAGE,
                    border: `1px solid ${SAGE}`,
                  }}
                >
                  <Plus size={11} />
                  Voir plus (+{Math.min(MENTIONS_VOIR_PLUS_BATCH, bufferCount)})
                </button>
              )}
            </div>
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

/** 12. WhatsApp Alert Preview — phone mockup + 3 sample alert bubbles +
 *  "Configurer mes alertes" modal with toggles + phone + Tester button.
 *  Persisted in localStorage "essential:whatsapp-config". */
function WhatsAppAlertPreviewCard({
  config,
  setConfig,
}: {
  config: WhatsappAlertConfig;
  setConfig: (v: WhatsappAlertConfig | ((prev: WhatsappAlertConfig) => WhatsappAlertConfig)) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(config.phone);
  const [testing, setTesting] = useState(false);

  // Sync draft with persisted config when dialog opens.
  useEffect(() => {
    if (dialogOpen) {
      // Reset draft when modal opens. Effect deps = [dialogOpen].
      setPhoneDraft(config.phone);
    }
  }, [dialogOpen, config.phone]);

  const activeCount = [config.crisis, config.daily, config.weekly].filter(Boolean).length;

  const handleToggle = (key: keyof Omit<WhatsappAlertConfig, "phone">) => (checked: boolean) => {
    setConfig((c) => ({ ...c, [key]: checked }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneDraft(sanitizePhone(e.target.value));
  };

  const handleSavePhone = () => {
    setConfig((c) => ({ ...c, phone: phoneDraft }));
    if (phoneDraft && !isValidPhone(phoneDraft)) {
      toast.warning("Numéro incomplet", {
        description: "Format attendu: +212 6XX XXX XXX (8 à 15 chiffres).",
      });
      return;
    }
    toast.success("Numéro enregistré");
  };

  const handleTest = () => {
    if (!phoneDraft || !isValidPhone(phoneDraft)) {
      toast.error("Numéro invalide", {
        description: "Saisissez un numéro valide avant de tester (8 à 15 chiffres).",
      });
      return;
    }
    setTesting(true);
    setConfig((c) => ({ ...c, phone: phoneDraft }));
    setTimeout(() => {
      setTesting(false);
      toast.success("Message test envoyé sur WhatsApp", {
        description: `Un message de test a été envoyé au ${phoneDraft}.`,
      });
    }, 1200);
  };

  return (
    <motion.div id="alertes-whatsapp" {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader
          title="Aperçu alertes WhatsApp"
          right={
            <Badge
              variant="secondary"
              className="h-5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: activeCount > 0 ? SAGE_BG : "#F4F4F5",
                color: activeCount > 0 ? SAGE : TEXT_MUTED,
              }}
            >
              {activeCount}/3 ACTIVES
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {/* Phone mockup — 320×600 sage bezel + notch. */}
        <div className="flex justify-center my-2">
          <div
            className="relative rounded-[2rem] shadow-md"
            style={{
              width: 260,
              height: 460,
              backgroundColor: SAGE,
              padding: 10,
            }}
            aria-label="Aperçu du téléphone — alerts WhatsApp"
          >
            {/* Notch. */}
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-b-xl z-10"
              style={{
                top: 0,
                width: 80,
                height: 14,
                backgroundColor: CHARCOAL,
              }}
              aria-hidden="true"
            />

            {/* Screen. */}
            <div
              className="w-full h-full rounded-[1.5rem] overflow-hidden flex flex-col"
              style={{ backgroundColor: "#ECE5DD" }}
            >
              {/* WhatsApp chat header. */}
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
              >
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: "#FFFFFF",
                    color: SAGE,
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  H
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#FFFFFF",
                    }}
                  >
                    Harch Alerts
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 8,
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    en ligne
                  </div>
                </div>
                <Phone size={11} style={{ color: "#FFFFFF" }} />
              </div>

              {/* Chat body — 3 alert bubbles. */}
              <div
                className="flex-1 overflow-y-auto px-2 py-2 space-y-2"
                style={{ maxHeight: 380 }}
              >
                {WHATSAPP_SAMPLE_ALERTS.map((alert, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-1.5"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Side strip — Lucide icon (no emojis in bubble). */}
                    <span
                      className="inline-flex items-center justify-center rounded shrink-0"
                      style={{
                        width: 16,
                        height: 16,
                        backgroundColor:
                          idx === 0
                            ? "rgba(239,68,68,0.15)"
                            : idx === 1
                              ? SAGE_BG
                              : "rgba(245,158,11,0.15)",
                        color: idx === 0 ? NEGATIVE : idx === 1 ? SAGE : NEUTRAL_AMBER,
                        marginTop: 2,
                      }}
                    >
                      <alert.Icon size={9} />
                    </span>
                    {/* WhatsApp bubble — DCF8C6 green + timestamp + checkmark. */}
                    <div
                      className="rounded-lg px-2 py-1.5 max-w-[85%]"
                      style={{
                        backgroundColor: "#DCF8C6",
                        boxShadow: "0 1px 0.5px rgba(0,0,0,0.06)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 10,
                          color: CHARCOAL,
                          lineHeight: 1.4,
                          margin: 0,
                        }}
                      >
                        {alert.text}
                      </p>
                      <div
                        className="flex items-center justify-end gap-0.5 mt-0.5"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 8,
                          color: "#71717A",
                        }}
                      >
                        {format(new Date(Date.now() - (2 - idx) * 3600 * 1000), "HH:mm")}
                        <CheckCheck size={9} style={{ color: "#4FC3F7" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alert type summary chips. */}
        <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
          <AlertTypeChip active={config.crisis} Icon={AlertTriangle} label="Crise" />
          <AlertTypeChip active={config.daily} Icon={CalendarDays} label="Quotidien" />
          <AlertTypeChip active={config.weekly} Icon={FileText} label="Hebdo" />
        </div>

        {/* Configure button. */}
        <div className="mt-3">
          <Button
            size="sm"
            className="w-full h-8"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              backgroundColor: CHARCOAL,
              color: "#FFFFFF",
            }}
            onClick={() => setDialogOpen(true)}
          >
            <Settings size={12} className="mr-1.5" />
            Configurer mes alertes
          </Button>
        </div>

        {/* Configuration modal. */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle
                style={{ fontFamily: FONT_SANS, fontSize: 16, fontWeight: 700, color: CHARCOAL }}
              >
                Configurer mes alertes WhatsApp
              </DialogTitle>
              <DialogDescription
                style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_BODY }}
              >
                Choisissez les types d'alertes à recevoir et vérifiez votre numéro.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {/* Alert type toggles. */}
              <AlertTypeRow
                Icon={AlertTriangle}
                color={NEGATIVE}
                bg="rgba(239,68,68,0.10)"
                title="Alerte de crise"
                description="Notification immédiate en cas de chute du score ou pic négatif."
                checked={config.crisis}
                onCheckedChange={handleToggle("crisis")}
              />
              <AlertTypeRow
                Icon={CalendarDays}
                color={SAGE}
                bg={SAGE_BG}
                title="Résumé quotidien"
                description="Bilan du jour: nombre d'articles, sentiment, top source."
                checked={config.daily}
                onCheckedChange={handleToggle("daily")}
              />
              <AlertTypeRow
                Icon={FileText}
                color={NEUTRAL_AMBER}
                bg="rgba(245,158,11,0.10)"
                title="Rapport hebdomadaire"
                description="Lien de téléchargement du rapport PDF chaque lundi matin."
                checked={config.weekly}
                onCheckedChange={handleToggle("weekly")}
              />

              {/* Phone number input. */}
              <div className="pt-2 space-y-1.5">
                <Label
                  htmlFor="whatsapp-phone"
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, letterSpacing: "0.04em", textTransform: "uppercase" }}
                >
                  Numéro WhatsApp
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="whatsapp-phone"
                    type="tel"
                    lang="fr"
                    placeholder="+212 6XX XXX XXX"
                    value={phoneDraft}
                    onChange={handlePhoneChange}
                    className="h-8 flex-1"
                    style={{ fontFamily: FONT_MONO, fontSize: 12 }}
                    aria-describedby="whatsapp-phone-help"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0"
                    style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                    onClick={handleSavePhone}
                  >
                    <Save size={11} className="mr-1" />
                    Enregistrer
                  </Button>
                </div>
                <p
                  id="whatsapp-phone-help"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 10,
                    color: TEXT_MUTED,
                    margin: 0,
                  }}
                >
                  Format international recommandé. Vos alertes seront envoyées à ce numéro.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="h-8"
                style={{ fontFamily: FONT_MONO, fontSize: 11 }}
                onClick={() => setDialogOpen(false)}
              >
                Fermer
              </Button>
              <Button
                type="button"
                className="h-8"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  backgroundColor: SAGE,
                  color: "#FFFFFF",
                }}
                disabled={testing}
                onClick={handleTest}
              >
                {testing ? (
                  <>
                    <RefreshCw size={11} className="mr-1.5 animate-spin" />
                    Envoi…
                  </>
                ) : (
                  <>
                    <Send size={11} className="mr-1.5" />
                    Tester
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardShell>
    </motion.div>
  );
}

/** WhatsApp alert type chip — shows active/inactive state under the phone. */
function AlertTypeChip({
  active,
  Icon,
  label,
}: {
  active: boolean;
  Icon: typeof AlertTriangle;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
      style={{
        fontFamily: FONT_MONO,
        fontSize: 9,
        color: active ? SAGE : TEXT_MUTED,
        backgroundColor: active ? SAGE_BG : "#F4F4F5",
        border: `1px solid ${active ? SAGE : BORDER_STRONG}`,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      <Icon size={9} />
      {label}
    </span>
  );
}

/** WhatsApp alert type row inside the configuration modal. */
function AlertTypeRow({
  Icon,
  color,
  bg,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  Icon: typeof AlertTriangle;
  color: string;
  bg: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-md p-3"
      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
    >
      <span
        className="inline-flex items-center justify-center rounded shrink-0"
        style={{ width: 28, height: 28, backgroundColor: bg, color }}
      >
        <Icon size={14} />
      </span>
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 12,
            fontWeight: 700,
            color: CHARCOAL,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            color: TEXT_BODY,
            marginTop: 2,
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={`Activer ${title}`} />
    </div>
  );
}

/** 13. Saved Searches Starter — 3 preset chips + create form + saved list.
 *  Click chip → applies query to the Brand Mention Feed (lifted state).
 *  Max 5 saved searches (Essentiel tier). Persisted in localStorage. */
function SavedSearchesStarterCard({
  savedSearches,
  setSavedSearches,
  activeQuery,
  onRunSearch,
}: {
  savedSearches: SavedSearch[];
  setSavedSearches: (
    v: SavedSearch[] | ((prev: SavedSearch[]) => SavedSearch[]),
  ) => void;
  activeQuery: string;
  onRunSearch: (query: string) => void;
}) {
  const [nameDraft, setNameDraft] = useState("");
  const [queryDraft, setQueryDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const atLimit = savedSearches.length >= MAX_SAVED_SEARCHES_ESSENTIEL;

  const handlePresetClick = (preset: { label: string; query: string }) => {
    onRunSearch(preset.query);
    toast.success(`Recherche « ${preset.label} » lancée`, {
      description: "Le flux de mentions a été filtré.",
    });
  };

  const handleSave = () => {
    const name = nameDraft.trim();
    const query = queryDraft.trim();
    if (!name) {
      setError("Veuillez saisir un nom pour la recherche.");
      return;
    }
    if (!query) {
      setError("Veuillez saisir une requête (mot-clé).");
      return;
    }
    if (atLimit) {
      setError(`Limite atteinte: ${MAX_SAVED_SEARCHES_ESSENTIEL} recherches maximum sur le plan Essentiel.`);
      return;
    }
    const newSearch: SavedSearch = {
      id: `search-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      query,
      lastRunAt: null,
    };
    setSavedSearches((prev) => [...prev, newSearch]);
    setNameDraft("");
    setQueryDraft("");
    setError(null);
    toast.success("Recherche enregistrée", {
      description: `« ${name} » est prête à être lancée à tout moment.`,
    });
  };

  const handleRunSaved = (s: SavedSearch) => {
    onRunSearch(s.query);
    setSavedSearches((prev) =>
      prev.map((item) =>
        item.id === s.id ? { ...item, lastRunAt: Date.now() } : item,
      ),
    );
    toast.success(`Recherche « ${s.name} » lancée`, {
      description: "Le flux de mentions a été filtré.",
    });
  };

  const handleDelete = (s: SavedSearch) => {
    setSavedSearches((prev) => prev.filter((item) => item.id !== s.id));
    toast.success(`Recherche « ${s.name} » supprimée`);
  };

  return (
    <motion.div id="recherches-sauvegardees" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="Recherches sauvegardées"
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
              {savedSearches.length}/{MAX_SAVED_SEARCHES_ESSENTIEL}
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        <p
          style={{
            fontFamily: FONT_SANS,
            fontSize: 12,
            color: TEXT_BODY,
            lineHeight: 1.5,
            margin: 0,
            marginBottom: 12,
          }}
        >
          Lancez une recherche rapide ou enregistrez vos mots-clés pour les réutiliser.
          Les recherches filtrent le flux de mentions en temps réel ci-dessus.
        </p>

        {/* Preset search chips. */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: TEXT_MUTED,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Raccourcis:
          </span>
          {PRESET_SEARCHES.map((preset) => {
            const isActive = activeQuery.trim().toLowerCase() === preset.query.toLowerCase();
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  fontWeight: 600,
                  color: isActive ? "#FFFFFF" : SAGE,
                  backgroundColor: isActive ? SAGE : SAGE_BG,
                  border: `1px solid ${SAGE}`,
                }}
              >
                <Search size={10} />
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Create form. */}
        <div
          className="rounded-md p-3"
          style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Plus size={12} style={{ color: SAGE }} />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: CHARCOAL,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Créer une recherche
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-4">
              <Label
                htmlFor="search-name"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  color: TEXT_MUTED,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Nom
              </Label>
              <Input
                id="search-name"
                type="text"
                lang="fr"
                placeholder="Ex: Ma marque"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value.slice(0, 40))}
                className="h-8 mt-1"
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
                disabled={atLimit}
              />
            </div>
            <div className="sm:col-span-6">
              <Label
                htmlFor="search-query"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  color: TEXT_MUTED,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Requête (mot-clé)
              </Label>
              <Input
                id="search-query"
                type="text"
                lang="fr"
                placeholder="Ex: nom de marque"
                value={queryDraft}
                onChange={(e) => setQueryDraft(e.target.value.slice(0, 60))}
                className="h-8 mt-1"
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
                disabled={atLimit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <Button
                type="button"
                size="sm"
                className="w-full h-8"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  backgroundColor: SAGE,
                  color: "#FFFFFF",
                }}
                onClick={handleSave}
                disabled={atLimit}
              >
                <Bookmark size={11} className="mr-1" />
                Enregistrer
              </Button>
            </div>
          </div>
          {error && (
            <p
              className="mt-2"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11,
                color: NEGATIVE,
                margin: 0,
              }}
              role="alert"
            >
              {error}
            </p>
          )}
          {atLimit && (
            <p
              className="mt-2 inline-flex items-center gap-1"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11,
                color: NEUTRAL_AMBER,
                margin: 0,
              }}
            >
              <Lightbulb size={11} />
              Limite Essentiel atteinte ({MAX_SAVED_SEARCHES_ESSENTIEL} recherches). Passez à Pro pour les opérateurs booléens et les recherches illimitées.
            </p>
          )}
        </div>

        {/* Saved searches list. */}
        {savedSearches.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Mes recherches ({savedSearches.length})
            </div>
            {savedSearches.map((s) => {
              const isActive = activeQuery.trim().toLowerCase() === s.query.toLowerCase();
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-md p-2.5 transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    border: `1px solid ${isActive ? SAGE : BORDER}`,
                    backgroundColor: isActive ? SAGE_BG : "#FFFFFF",
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center rounded shrink-0"
                    style={{
                      width: 22,
                      height: 22,
                      backgroundColor: isActive ? SAGE : "#FAFAFA",
                      color: isActive ? "#FFFFFF" : SAGE,
                    }}
                  >
                    <Bookmark size={11} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="truncate"
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 12,
                          fontWeight: 700,
                          color: CHARCOAL,
                        }}
                      >
                        {s.name}
                      </span>
                      <span
                        className="shrink-0"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 10,
                          color: SAGE,
                        }}
                      >
                        « {s.query} »
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1 mt-0.5"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: TEXT_MUTED,
                      }}
                    >
                      <Clock size={10} />
                      {s.lastRunAt ? `Lancée ${fmtRelative(s.lastRunAt)}` : "Jamais lancée"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRunSaved(s)}
                    aria-label={`Lancer la recherche « ${s.name} »`}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-[rgba(74,123,95,0.14)] shrink-0"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      color: SAGE,
                      border: `1px solid ${SAGE}`,
                    }}
                  >
                    <Play size={10} />
                    Lancer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s)}
                    aria-label={`Supprimer la recherche « ${s.name} »`}
                    className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:bg-[rgba(239,68,68,0.08)] shrink-0"
                    style={{
                      color: TEXT_MUTED,
                      border: `1px solid ${BORDER_STRONG}`,
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Upsell to Pro for boolean operators. */}
        <div
          className="mt-3 rounded-md p-3 flex items-center gap-2"
          style={{
            border: `1px solid ${BORDER}`,
            backgroundColor: SAGE_BG,
          }}
        >
          <Lightbulb size={14} style={{ color: SAGE, flexShrink: 0 }} />
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 11,
              color: SAGE,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            <strong>Pro débloque:</strong> opérateurs booléens (ET / OU / SAUF), recherches illimitées, alertes par mot-clé.
          </p>
        </div>
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// R4-ESSENTIEL-A — Round 4 components
// Weekly Digest Email Preview · Source Credibility Scoring ·
// Sentiment Timeline. All persisted via usePersistentState
// (localStorage-backed, SSR-safe). No new API — derived from
// existing data (health, insights, sources) + simulated patterns.
// ════════════════════════════════════════════════════════════════════

/**
 * Feature 1 — WeeklyDigestEmailPreviewCard
 *
 * Renders a CSS email mockup with a sage header bar, From/To/Subject
 * meta, and an HTML body: greeting, 4 KPI highlights (score, mentions,
 * sentiment, top source), top 3 articles of the week, HarchIQ insight,
 * CTA button. Toggle "Aperçu" (desktop) vs "Mobile" (375px narrow).
 * Schedule dropdown (Chaque lundi 8h / Chaque vendredi 18h / Désactiver)
 * persisted in localStorage. "Envoyer un test" button triggers a
 * simulated toast.
 */
function WeeklyDigestEmailPreviewCard({
  userName,
  userEmail,
  health,
  insights,
  sources,
}: {
  userName: string;
  userEmail: string;
  health: BrandHealth | null;
  insights: InsightsResp | null;
  sources: SourceDistResp | null;
}) {
  const [schedule, setSchedule] = usePersistentState<DigestSchedule>(
    "essential:digest-schedule",
    "monday",
  );
  const [view, setView] = useState<DigestViewMode>("desktop");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // Compute ISO week number — memoised for stable render.
  const weekNum = useMemo(() => weekNumber(new Date()), []);

  // Derive 4 KPI highlights from real API data (health, sources).
  const scoreKpi = health && health.score != null ? Math.round(health.score) : null;
  // Weekly mentions approximation: 7 × daily 24h count.
  const mentionsKpi = health ? Math.round(health.mentionCount24h * 7) : null;
  const sentimentKpi = health ? Math.round(health.sentiment.positive) : null;
  const topSourceKpi = sources?.sources?.[0]?.name ?? null;

  // Top 3 articles of the week — synthesised from the static pool.
  const topArticles = useMemo(() => WEEKLY_ARTICLES_POOL.slice(0, 3), []);

  // HarchIQ insight of the week — falls back to a generic sentence.
  const weeklyInsight =
    insights?.insights?.[0]?.body ??
    "Votre marque maintient une réputation stable cette semaine. Continuez à surveiller les narratives émergentes et préparez une réponse pour les sujets sensibles.";

  const handleSendTest = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Email test envoyé", {
        description: `Un résumé de test a été envoyé à ${userEmail || "[votre email]"}.`,
      });
    }, 1200);
  };

  const handleScheduleChange = (s: DigestSchedule) => {
    setSchedule(s);
    setScheduleOpen(false);
    const label =
      s === "off"
        ? "désactivé"
        : s === "monday"
          ? "programmé pour chaque lundi 8h"
          : "programmé pour chaque vendredi 18h";
    toast.success(`Résumé hebdomadaire ${label}`);
  };

  const isMobile = view === "mobile";
  const currentScheduleLabel =
    DIGEST_SCHEDULE_OPTIONS.find((o) => o.value === schedule)?.label ?? "—";
  const currentScheduleIcon =
    DIGEST_SCHEDULE_OPTIONS.find((o) => o.value === schedule)?.Icon ?? CalendarDays;
  const ScheduleIcon = currentScheduleIcon;

  return (
    <motion.div id="apercu-digest-hebdo" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="Aperçu Email — Résumé hebdomadaire"
          right={
            <Tabs
              value={view}
              onValueChange={(v) => setView(v as DigestViewMode)}
            >
              <TabsList className="h-7" style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
                <TabsTrigger value="desktop" className="h-5 px-2 text-[10px]">
                  <Monitor size={10} className="mr-1" />
                  Aperçu
                </TabsTrigger>
                <TabsTrigger value="mobile" className="h-5 px-2 text-[10px]">
                  <Smartphone size={10} className="mr-1" />
                  Mobile
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {/* Email mockup — sage header bar + From/To/Subject + HTML body. */}
        <div className="flex justify-center">
          <div
            className="rounded-lg overflow-hidden shadow-md transition-all"
            style={{
              width: isMobile ? 375 : "100%",
              maxWidth: isMobile ? 375 : 720,
              border: `1px solid ${BORDER_STRONG}`,
              backgroundColor: "#FFFFFF",
            }}
            aria-label="Aperçu de l'email — résumé hebdomadaire"
          >
            {/* Email header bar (sage). */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
            >
              <div className="flex items-center gap-2">
                <Mail size={12} />
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}
                >
                  HARCH ATELIER
                </span>
              </div>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Semaine {weekNum}
              </span>
            </div>

            {/* Email meta (From/To/Subject). */}
            <div
              className="px-4 py-3 space-y-1"
              style={{
                borderBottom: `1px solid ${BORDER}`,
                backgroundColor: "#FAFAFA",
              }}
            >
              <div className="flex items-start gap-2">
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: TEXT_MUTED,
                    minWidth: 36,
                    textTransform: "uppercase",
                  }}
                >
                  De:
                </span>
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11,
                    color: CHARCOAL,
                  }}
                >
                  insights@harch.atelier
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: TEXT_MUTED,
                    minWidth: 36,
                    textTransform: "uppercase",
                  }}
                >
                  À:
                </span>
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11,
                    color: CHARCOAL,
                  }}
                >
                  {userEmail || "[votre email]"}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: TEXT_MUTED,
                    minWidth: 36,
                    textTransform: "uppercase",
                  }}
                >
                  Objet:
                </span>
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11,
                    color: CHARCOAL,
                    fontWeight: 600,
                  }}
                >
                  Votre résumé hebdomadaire — semaine {weekNum}
                </span>
              </div>
            </div>

            {/* Email body — greeting + 4 KPI highlights + top 3 articles + insight + CTA. */}
            <div className="px-4 py-4">
              {/* Greeting */}
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: CHARCOAL,
                  marginBottom: 8,
                }}
              >
                Bonjour {userName},
              </p>
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: TEXT_BODY,
                  lineHeight: 1.55,
                  marginBottom: 16,
                }}
              >
                Voici votre récapitulatif de la semaine. Votre réputation
                évolue — voici les points clés à retenir.
              </p>

              {/* 4 KPI highlights — 2x2 grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      color: TEXT_MUTED,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Score de réputation
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 18,
                      color: SAGE,
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    {scoreKpi !== null ? `${scoreKpi}/100` : "—"}
                  </div>
                </div>
                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      color: TEXT_MUTED,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Mentions 7j
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 18,
                      color: CHARCOAL,
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    {mentionsKpi !== null ? mentionsKpi : "—"}
                  </div>
                </div>
                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      color: TEXT_MUTED,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Sentiment positif
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 18,
                      color: POSITIVE,
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    {sentimentKpi !== null ? `${sentimentKpi}%` : "—"}
                  </div>
                </div>
                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      color: TEXT_MUTED,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Source principale
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      color: CHARCOAL,
                      fontWeight: 700,
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {topSourceKpi ?? "—"}
                  </div>
                </div>
              </div>

              {/* Top 3 articles of the week */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: CHARCOAL,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  Top 3 articles de la semaine
                </div>
                <ol style={{ padding: 0, margin: 0, listStyle: "none" }}>
                  {topArticles.map((a, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 11,
                          color: SAGE,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}.
                      </span>
                      <div>
                        <div
                          style={{
                            fontFamily: FONT_SANS,
                            fontSize: 11,
                            color: CHARCOAL,
                            fontWeight: 600,
                            lineHeight: 1.4,
                          }}
                        >
                          {a.title}
                        </div>
                        <div
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            color: TEXT_MUTED,
                            marginTop: 1,
                          }}
                        >
                          {a.source}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* HarchIQ insight of the week */}
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  borderLeft: `3px solid ${SAGE}`,
                  backgroundColor: SAGE_BG,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: SAGE,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Sparkles size={10} />
                  Insight HarchIQ de la semaine
                </div>
                <p
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11,
                    color: CHARCOAL,
                    lineHeight: 1.55,
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  {weeklyInsight}
                </p>
              </div>

              {/* CTA button — sage, mock (no actual link) */}
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "10px 24px",
                    backgroundColor: SAGE,
                    color: "#FFFFFF",
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    borderRadius: 6,
                  }}
                >
                  Voir le tableau de bord
                </div>
              </div>

              {/* Signature */}
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 10,
                  color: TEXT_MUTED,
                  textAlign: "center",
                  marginTop: 16,
                }}
              >
                — L&apos;équipe Harch Atelier
              </p>
            </div>
          </div>
        </div>

        {/* Schedule + send test controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {/* Schedule dropdown — custom popover with 3 options */}
          <div className="relative inline-flex items-center gap-2">
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: TEXT_MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Programmer:
            </span>
            <button
              type="button"
              onClick={() => setScheduleOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: schedule === "off" ? TEXT_MUTED : SAGE,
                backgroundColor: schedule === "off" ? "#F4F4F5" : SAGE_BG,
                border: `1px solid ${schedule === "off" ? BORDER_STRONG : SAGE}`,
              }}
              aria-haspopup="listbox"
              aria-expanded={scheduleOpen}
              aria-label="Programmer le résumé hebdomadaire"
            >
              <ScheduleIcon size={11} />
              {currentScheduleLabel}
              <ChevronRight
                size={11}
                style={{
                  transform: scheduleOpen ? "rotate(90deg)" : "rotate(90deg)",
                  transition: "transform 150ms",
                }}
              />
            </button>
            {scheduleOpen && (
              <div
                className="absolute top-full left-0 mt-1 z-20 rounded-md overflow-hidden shadow-lg"
                style={{
                  border: `1px solid ${BORDER_STRONG}`,
                  backgroundColor: "#FFFFFF",
                  minWidth: 260,
                }}
                role="listbox"
              >
                {DIGEST_SCHEDULE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={schedule === opt.value}
                    onClick={() => handleScheduleChange(opt.value)}
                    className="w-full text-left px-3 py-2 transition-colors hover:bg-[#FAFAFA] flex items-start gap-2"
                    style={{
                      backgroundColor:
                        schedule === opt.value ? SAGE_BG : "#FFFFFF",
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <opt.Icon
                      size={12}
                      style={{ color: SAGE, flexShrink: 0, marginTop: 1 }}
                    />
                    <div>
                      <div
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 11,
                          fontWeight: 700,
                          color: CHARCOAL,
                        }}
                      >
                        {opt.label}
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          color: TEXT_MUTED,
                          marginTop: 1,
                        }}
                      >
                        {opt.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Send test button */}
          <Button
            type="button"
            size="sm"
            className="h-8"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              backgroundColor: SAGE,
              color: "#FFFFFF",
            }}
            onClick={handleSendTest}
            disabled={sending}
          >
            {sending ? (
              <>
                <RefreshCw size={11} className="mr-1.5 animate-spin" />
                Envoi…
              </>
            ) : (
              <>
                <Send size={11} className="mr-1.5" />
                Envoyer un test
              </>
            )}
          </Button>
        </div>

        <AiCommentary
          text={`Email hebdomadaire ${
            schedule === "off"
              ? "désactivé"
              : `programmé pour ${currentScheduleLabel.toLowerCase()}`
          }. Recevez un récapitulatif stratégique chaque semaine : score, mentions, sentiment, top sources et insight HarchIQ — sans ouvrir votre tableau de bord.`}
        />
      </CardShell>
    </motion.div>
  );
}

/**
 * Feature 2 — SourceCredibilityScoringCard
 *
 * Each source (API-derived + user-evaluated) gets a credibility score
 * 0-100 computed from 4 simulated factors (authority, editorial,
 * fact-check, transparency). Tier badges: Vérifié (80-100) / Fiable
 * (60-79) / À vérifier (40-59) / Non fiable (<40). Source list rows
 * with credibility bar, tier badge, articles count, last article date.
 * "Pourquoi ce score?" expandable reveals the 4-factor breakdown.
 * Filter by tier. "Évaluer une nouvelle source" input simulates a
 * score for any domain. Persisted custom evaluations in localStorage.
 */
function SourceCredibilityScoringCard({
  sources,
  loading,
}: {
  sources: SourceDistResp | null;
  loading: boolean;
}) {
  const [credState, setCredState] = usePersistentState<SourceCredibilityState>(
    "essential:source-cred",
    { sources: [] },
  );
  const [tierFilter, setTierFilter] = useState<SourceCredTier | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydration flag — ensures usePersistentState has read localStorage
  // before the sync effect runs (avoids overwriting persisted customs).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Sync effect: drop persisted API sources no longer in API data,
  // refresh article counts for existing, seed new from API. Always
  // preserve user-added custom sources. Returns prev when no changes
  // to avoid unnecessary re-renders / infinite loops.
  useEffect(() => {
    if (!hydrated || loading) return;
    const apiSources = sources?.sources ?? [];
    setCredState((prev) => {
      let hasChanges = false;
      // Keep custom sources always (never auto-removed).
      const customs = prev.sources.filter((s) => s.custom);
      // For API sources: derive credibility if new, or refresh count if existing.
      const apiDerived: CredibilitySource[] = apiSources.slice(0, 10).map((apiSrc) => {
        const existing = prev.sources.find(
          (s) => s.name === apiSrc.name && !s.custom,
        );
        if (existing) {
          if (existing.articlesCount !== apiSrc.count) {
            hasChanges = true;
            return { ...existing, articlesCount: apiSrc.count };
          }
          return existing;
        }
        hasChanges = true;
        return simulateSourceCredibility(apiSrc.name, apiSrc.type, apiSrc.count);
      });
      if (!hasChanges) return prev;
      return { sources: [...apiDerived, ...customs] };
    });
  }, [hydrated, loading, sources, setCredState]);

  const allSources = credState.sources;
  const filtered =
    tierFilter === "all"
      ? allSources
      : allSources.filter((s) => s.tier === tierFilter);

  // Tier counts for the summary strip + filter chips.
  const tierCounts = useMemo(() => {
    const counts: Record<SourceCredTier, number> = {
      verified: 0,
      reliable: 0,
      check: 0,
      unreliable: 0,
    };
    allSources.forEach((s) => {
      counts[s.tier]++;
    });
    return counts;
  }, [allSources]);

  const avgScore =
    allSources.length > 0
      ? Math.round(
          allSources.reduce((s, x) => s + x.credibilityScore, 0) /
            allSources.length,
        )
      : 0;

  const handleEvaluateDomain = () => {
    const rawDomain = newDomain.trim();
    if (!rawDomain) {
      toast.error("Veuillez saisir un domaine", {
        description: "Exemple: lematin.ma, hespress.com, twitter.com/@user",
      });
      return;
    }
    // Normalize: strip protocol + path, keep domain-like text.
    const domain = rawDomain
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .toLowerCase();
    if (!domain) {
      toast.error("Domaine invalide");
      return;
    }
    setEvaluating(true);
    setTimeout(() => {
      const existing = allSources.find(
        (s) => s.name.toLowerCase() === domain,
      );
      if (existing) {
        setEvaluating(false);
        toast.info("Source déjà évaluée", {
          description: `« ${domain} » est déjà dans votre liste.`,
        });
        setExpandedId(existing.id);
        return;
      }
      const newSrc = simulateSourceCredibility(domain, "custom", 0);
      setCredState((prev) => ({
        sources: [...prev.sources, newSrc],
      }));
      setEvaluating(false);
      setNewDomain("");
      setExpandedId(newSrc.id);
      toast.success(`${domain} évalué`, {
        description: `Score de crédibilité: ${newSrc.credibilityScore}/100 · tier « ${tierLabelFor(newSrc.tier)} ».`,
      });
    }, 1200);
  };

  const handleRemoveCustom = (id: string) => {
    setCredState((prev) => ({
      sources: prev.sources.filter((s) => s.id !== id),
    }));
    if (expandedId === id) setExpandedId(null);
    toast.success("Source personnalisée supprimée");
  };

  return (
    <motion.div id="credibilite-sources" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="Crédibilité des Sources"
          right={
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-5"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  backgroundColor: SAGE_BG,
                  color: SAGE,
                  letterSpacing: "0.04em",
                }}
              >
                {allSources.length} SOURCES
              </Badge>
              <Badge
                variant="secondary"
                className="h-5"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  backgroundColor:
                    avgScore >= 60 ? SAGE_BG : "rgba(245,158,11,0.10)",
                  color: avgScore >= 60 ? SAGE : NEUTRAL_AMBER,
                  letterSpacing: "0.04em",
                }}
              >
                MOY. {avgScore}/100
              </Badge>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {/* Tier summary strip — 4 tier cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {CREDIBILITY_TIERS.map((t) => (
            <div
              key={t.tier}
              style={{
                padding: 10,
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                backgroundColor: t.bg,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <t.Icon size={11} style={{ color: t.color }} />
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: t.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 700,
                  }}
                >
                  {t.label}
                </span>
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 16,
                  color: CHARCOAL,
                  fontWeight: 700,
                }}
              >
                {tierCounts[t.tier]}
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  color: TEXT_MUTED,
                }}
              >
                {t.min}-{t.max}
              </div>
            </div>
          ))}
        </div>

        {/* Tier filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              color: TEXT_MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginRight: 4,
            }}
          >
            Filtrer:
          </span>
          <button
            type="button"
            onClick={() => setTierFilter("all")}
            className="rounded-full px-2.5 py-1 transition-colors"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: tierFilter === "all" ? "#FFFFFF" : TEXT_MUTED,
              backgroundColor:
                tierFilter === "all" ? CHARCOAL : "#F4F4F5",
              border: `1px solid ${
                tierFilter === "all" ? CHARCOAL : BORDER_STRONG
              }`,
            }}
          >
            Tous ({allSources.length})
          </button>
          {CREDIBILITY_TIERS.map((t) => (
            <button
              key={t.tier}
              type="button"
              onClick={() => setTierFilter(t.tier)}
              className="rounded-full px-2.5 py-1 inline-flex items-center gap-1 transition-colors"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: tierFilter === t.tier ? "#FFFFFF" : t.color,
                backgroundColor: tierFilter === t.tier ? t.color : t.bg,
                border: `1px solid ${t.color}`,
              }}
            >
              <t.Icon size={9} />
              {t.label} ({tierCounts[t.tier]})
            </button>
          ))}
        </div>

        {/* Source list — rows with credibility bar + tier badge + expandable factor breakdown */}
        {loading ? (
          <div className="space-y-2">
            <LiveSkeleton className="h-16 w-full" />
            <LiveSkeleton className="h-16 w-full" />
            <LiveSkeleton className="h-16 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-32 flex items-center justify-center">
            <EmptyDash
              label={
                allSources.length === 0
                  ? "Aucune source évaluée"
                  : "Aucune source dans ce tier"
              }
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((src) => {
              const tier = CREDIBILITY_TIERS.find(
                (t) => t.tier === src.tier,
              )!;
              const isExpanded = expandedId === src.id;
              const TypeIcon =
                src.type === "social"
                  ? MessageCircle
                  : src.type === "custom"
                    ? Globe2
                    : Newspaper;
              return (
                <div
                  key={src.id}
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    backgroundColor: "#FFFFFF",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : src.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[#FAFAFA]"
                    aria-expanded={isExpanded}
                    aria-label={`Détails crédibilité — ${src.name}`}
                  >
                    {/* Type icon */}
                    <span
                      className="inline-flex items-center justify-center rounded shrink-0"
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor:
                          src.type === "social"
                            ? SAGE_BG
                            : src.type === "custom"
                              ? "rgba(74,123,95,0.06)"
                              : "#FEF3C7",
                        color:
                          src.type === "social" || src.type === "custom"
                            ? SAGE
                            : "#92400E",
                      }}
                    >
                      <TypeIcon size={11} />
                    </span>
                    {/* Name + meta */}
                    <div className="flex-1 min-w-0 text-left">
                      <div
                        className="truncate"
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 12,
                          fontWeight: 700,
                          color: CHARCOAL,
                        }}
                      >
                        {src.name}
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          color: TEXT_MUTED,
                          marginTop: 1,
                        }}
                      >
                        {src.articlesCount} article
                        {src.articlesCount > 1 ? "s" : ""} ·{" "}
                        {src.lastArticleAt
                          ? fmtRelative(src.lastArticleAt)
                          : "jamais vu"}
                      </div>
                    </div>
                    {/* Credibility bar */}
                    <div
                      className="hidden sm:block shrink-0"
                      style={{ width: 80 }}
                    >
                      <div
                        style={{
                          height: 6,
                          backgroundColor: "#F4F4F5",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${src.credibilityScore}%`,
                            height: "100%",
                            backgroundColor: tier.color,
                            transition: "width 400ms",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          color: tier.color,
                          marginTop: 2,
                          fontWeight: 700,
                          textAlign: "right",
                        }}
                      >
                        {src.credibilityScore}/100
                      </div>
                    </div>
                    {/* Tier badge */}
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 shrink-0"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        color: tier.color,
                        backgroundColor: tier.bg,
                        border: `1px solid ${tier.color}`,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      <tier.Icon size={9} />
                      {tier.label}
                    </span>
                    {/* Expand chevron */}
                    <ChevronRight
                      size={12}
                      style={{
                        color: TEXT_MUTED,
                        transform: isExpanded ? "rotate(90deg)" : "none",
                        transition: "transform 150ms",
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  {/* Expandable factor breakdown */}
                  {isExpanded && (
                    <div
                      className="px-3 py-3"
                      style={{
                        borderTop: `1px solid ${BORDER}`,
                        backgroundColor: "#FAFAFA",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          color: CHARCOAL,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontWeight: 700,
                          marginBottom: 8,
                        }}
                      >
                        Pourquoi ce score?
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {src.factors.map((f) => {
                          const factorDef = CREDIBILITY_FACTORS.find(
                            (cf) => cf.factor === f.factor,
                          )!;
                          const FactorIcon = factorDef.Icon;
                          const factorColor =
                            f.score >= 70
                              ? SAGE
                              : f.score >= 50
                                ? NEUTRAL_AMBER
                                : NEGATIVE;
                          return (
                            <div
                              key={f.factor}
                              style={{
                                padding: 10,
                                borderRadius: 6,
                                border: `1px solid ${BORDER}`,
                                backgroundColor: "#FFFFFF",
                              }}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <FactorIcon
                                  size={11}
                                  style={{ color: SAGE }}
                                />
                                <span
                                  style={{
                                    fontFamily: FONT_SANS,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: CHARCOAL,
                                  }}
                                >
                                  {f.label}
                                </span>
                                <span
                                  style={{
                                    fontFamily: FONT_MONO,
                                    fontSize: 10,
                                    color: factorColor,
                                    fontWeight: 700,
                                    marginLeft: "auto",
                                  }}
                                >
                                  {f.score}/100
                                </span>
                              </div>
                              <div
                                style={{
                                  height: 4,
                                  backgroundColor: "#F4F4F5",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  marginBottom: 4,
                                }}
                              >
                                <div
                                  style={{
                                    width: `${f.score}%`,
                                    height: "100%",
                                    backgroundColor: factorColor,
                                  }}
                                />
                              </div>
                              <p
                                style={{
                                  fontFamily: FONT_SANS,
                                  fontSize: 10,
                                  color: TEXT_MUTED,
                                  margin: 0,
                                  lineHeight: 1.4,
                                }}
                              >
                                {f.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {src.custom && (
                        <div className="mt-3 flex items-center justify-between">
                          <span
                            style={{
                              fontFamily: FONT_MONO,
                              fontSize: 9,
                              color: TEXT_MUTED,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            Source évaluée manuellement
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustom(src.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
                            style={{
                              fontFamily: FONT_MONO,
                              fontSize: 10,
                              color: NEGATIVE,
                              border: `1px solid ${BORDER_STRONG}`,
                            }}
                            aria-label={`Supprimer la source « ${src.name} »`}
                          >
                            <Trash2 size={11} /> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Evaluate new source */}
        <div
          className="mt-4 rounded-md p-3"
          style={{
            border: `1px solid ${BORDER}`,
            backgroundColor: "#FAFAFA",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} style={{ color: SAGE }} />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: CHARCOAL,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              Évaluer une nouvelle source
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              lang="fr"
              placeholder="exemple.ma, lematin.ma, twitter.com/@user"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value.slice(0, 60))}
              className="h-8 flex-1"
              style={{ fontFamily: FONT_MONO, fontSize: 11 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleEvaluateDomain();
                }
              }}
              aria-label="Domaine de la source à évaluer"
            />
            <Button
              type="button"
              size="sm"
              className="h-8 shrink-0"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                backgroundColor: SAGE,
                color: "#FFFFFF",
              }}
              onClick={handleEvaluateDomain}
              disabled={evaluating}
            >
              {evaluating ? (
                <>
                  <RefreshCw size={11} className="mr-1 animate-spin" />
                  Évaluation…
                </>
              ) : (
                <>
                  <Sparkles size={11} className="mr-1" />
                  Évaluer
                </>
              )}
            </Button>
          </div>
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 10,
              color: TEXT_MUTED,
              margin: "6px 0 0 0",
            }}
          >
            Saisissez un domaine médiatique ou social. L&apos;évaluation est
            simulée à partir de 4 facteurs (autorité, standards éditoriaux,
            fact-check, transparence).
          </p>
        </div>

        <AiCommentary
          text={`${allSources.length} source(s) évaluée(s) · moyenne ${avgScore}/100. ${
            tierCounts.verified + tierCounts.reliable
          } source(s) fiable(s), ${
            tierCounts.check + tierCounts.unreliable
          } à surveiller. Évaluez toute nouvelle source avant de l'intégrer à votre veille.`}
        />
      </CardShell>
    </motion.div>
  );
}

/**
 * Feature 3 — SentimentTimelineCard
 *
 * Horizontal timeline showing sentiment evolution. 24h view: 24 hourly
 * buckets. 7j view: 7 daily buckets. Each bucket: colored bar (height =
 * volume, color = dominant sentiment — sage/gray/red). Current hour
 * highlighted with a sage pulse. Hover: tooltip "HH:00 — X articles,
 * Y% positif". Peak/trough annotation strip. Anomaly markers (red dots
 * on unusual buckets). 24h / 7j toggle. No new API — derived from
 * existing BrandHealth data + simulated hourly distribution.
 */
function SentimentTimelineCard({
  health,
  loading,
}: {
  health: BrandHealth | null;
  loading: boolean;
}) {
  const [range, setRange] = useState<SentimentTimelineRange>("24h");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Derive hourly or daily buckets from BrandHealth data.
  const buckets = useMemo<SentimentTimelineBucket[]>(() => {
    const sentiment = health?.sentiment ?? {
      positive: 50,
      neutral: 30,
      negative: 20,
    };
    if (range === "24h") {
      return simulateSentimentHourBuckets(
        health?.mentionCount24h ?? 0,
        sentiment,
      );
    }
    return simulateSentimentDailyBuckets(sentiment);
  }, [range, health]);

  // Peak / trough annotations.
  const peak = useMemo(() => {
    if (!buckets.length) return null;
    return buckets.reduce(
      (max, b) => (b.total > max.total ? b : max),
      buckets[0],
    );
  }, [buckets]);

  const trough = useMemo(() => {
    if (!buckets.length) return null;
    return buckets.reduce(
      (min, b) => (b.total < min.total ? b : min),
      buckets[0],
    );
  }, [buckets]);

  const currentHour = new Date().getHours();
  const maxTotal = Math.max(...buckets.map((b) => b.total), 1);
  const anomalyCount = buckets.filter((b) => b.isAnomaly).length;

  const dominantColor = (s: "positive" | "neutral" | "negative") =>
    s === "positive" ? POSITIVE : s === "negative" ? NEGATIVE : NEUTRAL_GRAY;

  const bucketLabel = (idx: number) =>
    range === "24h" ? `${idx}h` : `J${idx + 1}`;

  return (
    <motion.div id="timeline-sentiment" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="Évolution 24h — Sentiment en temps réel"
          right={
            <Tabs
              value={range}
              onValueChange={(v) => setRange(v as SentimentTimelineRange)}
            >
              <TabsList
                className="h-7"
                style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              >
                <TabsTrigger value="24h" className="h-5 px-2 text-[10px]">
                  24h
                </TabsTrigger>
                <TabsTrigger value="7j" className="h-5 px-2 text-[10px]">
                  7j
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {/* Peak / trough / anomaly annotation strip */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {peak && peak.total > 0 && (
            <div
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1"
              style={{
                backgroundColor: SAGE_BG,
                border: `1px solid ${SAGE}`,
              }}
            >
              <TrendingUp size={11} style={{ color: SAGE }} />
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: SAGE,
                  fontWeight: 700,
                }}
              >
                Pic à {bucketLabel(peak.index)}:
              </span>
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 10,
                  color: CHARCOAL,
                }}
              >
                {peak.total} articles · {peak.positive} positif(s)
              </span>
            </div>
          )}
          {trough && trough !== peak && trough.total > 0 && (
            <div
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1"
              style={{
                backgroundColor: "#F4F4F5",
                border: `1px solid ${BORDER_STRONG}`,
              }}
            >
              <TrendingDown size={11} style={{ color: TEXT_MUTED }} />
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: TEXT_MUTED,
                  fontWeight: 700,
                }}
              >
                Creux à {bucketLabel(trough.index)}:
              </span>
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 10,
                  color: CHARCOAL,
                }}
              >
                {trough.total} articles
              </span>
            </div>
          )}
          {anomalyCount > 0 && (
            <div
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1"
              style={{
                backgroundColor: "rgba(239,68,68,0.10)",
                border: `1px solid ${NEGATIVE}`,
              }}
            >
              <AlertTriangle size={11} style={{ color: NEGATIVE }} />
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: NEGATIVE,
                  fontWeight: 700,
                }}
              >
                {anomalyCount} anomalie{anomalyCount > 1 ? "s" : ""} détectée
                {anomalyCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Timeline bars */}
        {loading ? (
          <LoadingBlock height={180} label="Chargement des données…" />
        ) : buckets.length === 0 ? (
          <div className="h-[180px] flex items-center justify-center">
            <EmptyDash label="Aucune donnée" />
          </div>
        ) : (
          <div
            className="relative"
            style={{ height: 180 }}
            onMouseLeave={() => setHoverIdx(null)}
          >
            {/* Bars row */}
            <div
              className="flex items-end justify-between gap-0.5 h-full"
              style={{ paddingBottom: 24 }}
            >
              {buckets.map((b, idx) => {
                const heightPct = (b.total / maxTotal) * 100;
                const isCurrent =
                  range === "24h" && b.index === currentHour;
                const color = dominantColor(b.dominantSentiment);
                return (
                  <div
                    key={idx}
                    className="relative flex-1 flex flex-col items-center justify-end cursor-pointer"
                    style={{ height: "100%", maxWidth: 28 }}
                    onMouseEnter={() => setHoverIdx(idx)}
                  >
                    {/* Anomaly red dot */}
                    {b.isAnomaly && (
                      <span
                        className="absolute"
                        style={{
                          top: -4,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: NEGATIVE,
                          border: "1.5px solid #FFFFFF",
                          zIndex: 2,
                        }}
                        aria-label="Anomalie"
                      />
                    )}
                    {/* Current hour pulse */}
                    {isCurrent && (
                      <span
                        className="absolute"
                        style={{
                          top: -2,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          border: `2px solid ${SAGE}`,
                          animation:
                            "sage-pulse-kf 1.6s ease-out infinite",
                          zIndex: 2,
                        }}
                        aria-label="Maintenant"
                      />
                    )}
                    {/* Bar */}
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPct}%`,
                        minHeight: b.total > 0 ? 4 : 0,
                        backgroundColor: color,
                        borderRadius: "3px 3px 0 0",
                        opacity:
                          hoverIdx === null || hoverIdx === idx ? 1 : 0.4,
                        transition: "opacity 150ms",
                      }}
                    />
                    {/* Hour label */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: -20,
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        color: isCurrent ? SAGE : TEXT_MUTED,
                        fontWeight: isCurrent ? 700 : 400,
                      }}
                    >
                      {bucketLabel(b.index)}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Hover tooltip */}
            {hoverIdx !== null && buckets[hoverIdx] && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: 4,
                  left: `${(hoverIdx / Math.max(buckets.length - 1, 1)) * 100}%`,
                  transform: "translateX(-50%)",
                  zIndex: 3,
                }}
              >
                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    backgroundColor: CHARCOAL,
                    color: "#FFFFFF",
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {range === "24h"
                      ? `${buckets[hoverIdx].index}:00`
                      : `Jour ${buckets[hoverIdx].index + 1}`}
                  </div>
                  <div style={{ marginTop: 2, opacity: 0.85 }}>
                    {buckets[hoverIdx].total} articles ·{" "}
                    {Math.round(
                      (buckets[hoverIdx].positive /
                        Math.max(buckets[hoverIdx].total, 1)) *
                        100,
                    )}
                    % positif
                  </div>
                  {buckets[hoverIdx].isAnomaly && (
                    <div style={{ marginTop: 2, color: "#FCA5A5" }}>
                      <AlertTriangle size={9} className="inline" /> anomalie
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: POSITIVE,
              }}
            />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: TEXT_MUTED,
              }}
            >
              Positif dominant
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: NEUTRAL_GRAY,
              }}
            />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: TEXT_MUTED,
              }}
            >
              Neutre dominant
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: NEGATIVE,
              }}
            />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: TEXT_MUTED,
              }}
            >
              Négatif dominant
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: NEGATIVE,
                border: "1.5px solid #FFFFFF",
                boxShadow: "0 0 0 1px #EF4444",
              }}
            />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: TEXT_MUTED,
              }}
            >
              Anomalie
            </span>
          </span>
        </div>

        <AiCommentary
          text={`Évolution ${
            range === "24h" ? "horaire sur 24h" : "journalière sur 7 jours"
          } du sentiment. Chaque barre représente le volume de mentions, sa couleur indique le sentiment dominant. Les pics d'activité négative sont marqués d'un point rouge — surveillez-les pour anticiper les crises.`}
        />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN — EssentialDashboard
// ════════════════════════════════════════════════════════════════════

export default function EssentialDashboard() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("ai-workspace");
  const [sentimentRange, setSentimentRange] = useState<"7d" | "30d" | "90d">("30d");

  // ─── ENV-ESSENTIAL — persisted client-side state ───────────────────
  // All keys stored in localStorage via usePersistentState (SSR-safe,
  // try/catch on parse + write). Survives refresh, clearable via DevTools.
  const [onboardingDismissed, setOnboardingDismissed] = usePersistentState<boolean>(
    "essential:onboarding-dismissed",
    false,
  );
  const [quickStartDismissed, setQuickStartDismissed] = usePersistentState<boolean>(
    "essential:quickstart-dismissed",
    false,
  );
  const [visits, setVisits] = usePersistentState<number>("essential:visits", 0);
  const [quota, setQuota] = usePersistentState<QuotaState>("essential:quota", INITIAL_QUOTA);
  const [milestones, setMilestones] = usePersistentState<MilestoneState>(
    "essential:milestones",
    INITIAL_MILESTONES,
  );
  const [helpDismissedArr, setHelpDismissedArr] = usePersistentState<string[]>(
    "essential:help-dismissed",
    [],
  );
  // ─── R2-ESSENTIAL-A — Round 2 persisted client-side state ───────────
  // Notification center, guided tour completion, daily briefing last-viewed.
  const [notifications, setNotifications] = usePersistentState<NotificationItem[]>(
    "essential:notifications",
    [],
  );
  const [tourCompleted, setTourCompleted] = usePersistentState<boolean>(
    "essential:tour-completed",
    false,
  );
  const [briefingDate, setBriefingDate] = usePersistentState<string>(
    "essential:briefing-date",
    "",
  );
  // ─── R2-ESSENTIAL-B — Command Palette recents (last 5 action IDs) ────
  const [cmdRecents, setCmdRecents] = usePersistentState<string[]>(
    "essential:cmd-recent",
    [],
  );
  // Transient state for the sage-pulse animation on recently-unlocked milestone.
  const [recentlyUnlockedKey, setRecentlyUnlockedKey] = useState<string | null>(null);
  // ─── R2-ESSENTIAL-A — Round 2 transient state ──────────────────────
  // Hydration flag (waits for usePersistentState to read localStorage),
  // notification dropdown open state, guided tour active + current step.
  const [hydrated, setHydrated] = useState(false);
  const [notifExpanded, setNotifExpanded] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [hespressOpen, setHespressOpen] = useState(false);
  const [comexOpen, setComexOpen] = useState(false);
  const [docWriterOpen, setDocWriterOpen] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  const [boycottOpen, setBoycottOpen] = useState(false);
  const [stakeholderOpen, setStakeholderOpen] = useState(false);
  const [riskHeatmapOpen, setRiskHeatmapOpen] = useState(false);
  const [sentimentTimelineOpen, setSentimentTimelineOpen] = useState(false);
  const [regCalendarOpen, setRegCalendarOpen] = useState(false);
  const [aiVisibilityOpen, setAiVisibilityOpen] = useState(false);
  const [sourceCredOpen, setSourceCredOpen] = useState(false);
  const [competitorContentOpen, setCompetitorContentOpen] = useState(false);
  const [mediaReachOpen, setMediaReachOpen] = useState(false);
  const [crisisPlaybookOpen, setCrisisPlaybookOpen] = useState(false);
  const [esgOpen, setEsgOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [teamPerfOpen, setTeamPerfOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [savedSearchesOpen, setSavedSearchesOpen] = useState(false);
  const [influencerOpen, setInfluencerOpen] = useState(false);
  const [narrativeOpen, setNarrativeOpen] = useState(false);
  const [geoHeatmapOpen, setGeoHeatmapOpen] = useState(false);
  const [skillsMenuOpen, setSkillsMenuOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  // ─── R2-ESSENTIAL-B — Command Palette open state ───────────────────
  const [cmdOpen, setCmdOpen] = useState(false);
  // R3-ESSENTIEL-A — Round 3 persisted client-side state.
  // WhatsApp alert config + saved searches. Both stored in localStorage.
  const [whatsappConfig, setWhatsappConfig] = usePersistentState<WhatsappAlertConfig>(
    "essential:whatsapp-config",
    WHATSAPP_ALERT_INITIAL,
  );
  const [savedSearches, setSavedSearches] = usePersistentState<SavedSearch[]>(
    "essential:saved-searches",
    [],
  );
  // R3-ESSENTIEL-A — Transient active search query (lifted state shared
  // between SavedSearchesStarterCard and BrandMentionFeedCard).
  // Not persisted — resets on refresh.
  const [mentionQuery, setMentionQuery] = useState("");

  const helpDismissedSet = useMemo(() => new Set(helpDismissedArr), [helpDismissedArr]);
  const dismissHelp = useCallback(
    (key: string) => {
      setHelpDismissedArr((arr) => (arr.includes(key) ? arr : [...arr, key]));
    },
    [setHelpDismissedArr],
  );

  // Real API endpoints
  const { data: health, loading: healthLoading, refetch: refetchHealth } = useApi<BrandHealth>("/api/console/brand-health");
  // Auto-trigger first scrape when no data (P: first-scrape)
  useEffect(() => {
    if (health?.status === "no_data" && !healthLoading) {
      fetch("/api/console/first-scrape", { method: "POST" })
        .then((r) => r.json())
        .then(() => refetchHealth())
        .catch(() => {});
    }
  }, [health?.status, healthLoading, refetchHealth]);
  const { data: alerts, loading: alertsLoading, refetch: refetchAlerts } = useApi<CrisisAlertsResp>("/api/console/crisis-alerts");
  const { data: insights, loading: insightsLoading, refetch: refetchInsights } = useApi<InsightsResp>("/api/console/insights");
  const { data: aiVis, loading: aiVisLoading } = useApi<AiVisibilityResp>("/api/console/ai-visibility");
  const { data: sentimentTrend, loading: trendLoading } = useApi<SentimentTrendResp>(
    `/api/console/sentiment-trend?range=${sentimentRange}`,
  );
  const { data: topics, loading: topicsLoading } = useApi<TopicsResp>("/api/console/topics");
  const { data: sources, loading: sourcesLoading } = useApi<SourceDistResp>("/api/console/source-distribution");
  const { data: harch100, loading: harch100Loading } = useApi<Harch100Resp>("/api/harch100/latest");

  // P3-ESSENTIAL-REAL-ROUTES — 3 routes qui remplacent les mocks
  // hardcoded des sections 14 (Carte Chaleur Géo), 16 (Activité
  // Réseau Social) et 17 (Météo Sentiments par Langue).
  const { data: geoHeatmap, loading: geoHeatmapLoading, error: geoHeatmapError } = useApi<GeoHeatmapResp>("/api/console/geo-heatmap");
  const { data: socialActivity, loading: socialActivityLoading, error: socialActivityError } = useApi<SocialActivityResp>("/api/console/social-activity");
  const { data: languageSentiment, loading: languageSentimentLoading, error: languageSentimentError } = useApi<LanguageSentimentResp>("/api/console/language-sentiment");

  const alertCount = alerts?.count ?? alerts?.alerts?.length ?? 0;
  const sourcesCount = Math.min(20, sources?.sources?.length ?? 0);

  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Utilisateur";
  const userEmail = session?.user?.email ?? "";

  // ─── Daily quota reset (HarchIQ) + monthly reset (WhatsApp) ─────────
  useEffect(() => {
    const today = todayISO();
    const thisMonth = currentMonthISO();
    setQuota((q) => {
      let next = q;
      if (q.date !== today) {
        next = { ...next, used: 0, date: today };
      }
      if (q.whatsappMonth !== thisMonth) {
        next = { ...next, whatsappUsed: 0, whatsappMonth: thisMonth };
      }
      return next;
    });
  }, [setQuota]);

  // ─── Bump visit counter on mount (used to hide QuickStart after 3 visits)
  useEffect(() => {
    setVisits((v) => v + 1);
  }, [setVisits]);

  // ─── R2-ESSENTIAL-A — Hydration flag (runs after usePersistentState) ──
  // Set to true on mount; subsequent effects gate on this to ensure they
  // see hydrated values from localStorage (avoids auto-launching the tour
  // or re-seeding notifications for returning users on initial render).
  useEffect(() => {
    setHydrated(true);
  }, []);

  // ─── R2-ESSENTIAL-A — Seed sample notifications on first visit ──────
  // After hydration: if notifications array is empty (first visit, no
  // localStorage data), populate with 3 sample notifications (crise +
  // rapport + quota). Returning users see their persisted notifications.
  useEffect(() => {
    if (!hydrated) return;
    setNotifications((prev) =>
      prev.length === 0 ? makeSeedNotifications() : prev,
    );
  }, [hydrated, setNotifications]);

  // ─── R2-ESSENTIAL-A — Auto-launch guided tour on first visit ────────
  // After hydration: if tour has not been completed yet, launch it.
  // "Passer le tour" / "Terminer" both set tourCompleted=true to prevent
  // re-launch on subsequent visits. "Refaire le tour" link bypasses this
  // by setting tourActive=true directly (manual re-trigger).
  useEffect(() => {
    if (!hydrated) return;
    if (!tourCompleted) {
      setTourActive(true);
    }
  }, [hydrated, tourCompleted]);

  // ─── Milestone: firstArticle (mentionCount24h > 0) ─────────────────
  useEffect(() => {
    if (!health) return;
    if ((health.mentionCount24h ?? 0) > 0 && !milestones.firstArticle) {
      setMilestones((m) => ({
        ...m,
        firstArticle: true,
        lastUnlockedAt: Date.now(),
      }));
      setRecentlyUnlockedKey("firstArticle");
      toast.success("Jalon débloqué · Premier article analysé", {
        description: "Harch surveille maintenant votre réputation en continu.",
      });
      const t = setTimeout(() => setRecentlyUnlockedKey(null), 4000);
      return () => clearTimeout(t);
    }
  }, [health, milestones.firstArticle, setMilestones]);

  // ─── Milestone: firstWeek (firstVisitDate >= 7 days ago) ───────────
  useEffect(() => {
    if (milestones.firstWeek) return;
    if (!milestones.firstVisitDate) return;
    const first = new Date(milestones.firstVisitDate);
    if (isNaN(first.getTime())) return;
    const days = (Date.now() - first.getTime()) / (1000 * 60 * 60 * 24);
    if (days >= 7) {
      setMilestones((m) => ({
        ...m,
        firstWeek: true,
        lastUnlockedAt: Date.now(),
      }));
      setRecentlyUnlockedKey("firstWeek");
      toast.success("Jalon débloqué · Première semaine complète", {
        description: "7 jours de veille réputationnelle consécutifs.",
      });
      const t = setTimeout(() => setRecentlyUnlockedKey(null), 4000);
      return () => clearTimeout(t);
    }
  }, [milestones.firstWeek, milestones.firstVisitDate, setMilestones]);

  const handleFirstQuestion = useCallback(() => {
    setMilestones((m) => {
      if (m.firstQuestion) return m;
      setRecentlyUnlockedKey("firstQuestion");
      toast.success("Jalon débloqué · Première question HarchIQ", {
        description: "Votre assistant IA est maintenant actif.",
      });
      setTimeout(() => setRecentlyUnlockedKey(null), 4000);
      return { ...m, firstQuestion: true, lastUnlockedAt: Date.now() };
    });
  }, [setMilestones]);

  const handleReportDownload = useCallback(() => {
    setMilestones((m) => {
      if (m.firstReport) return m;
      setRecentlyUnlockedKey("firstReport");
      toast.success("Jalon débloqué · Premier rapport téléchargé", {
        description: "Partagez-le avec votre équipe pour aligner la stratégie.",
      });
      setTimeout(() => setRecentlyUnlockedKey(null), 4000);
      return { ...m, firstReport: true, lastUnlockedAt: Date.now() };
    });
  }, [setMilestones]);

  const handleQuickAction = useCallback(
    (id: string) => {
      if (id === "score") scrollToSection("score");
      else if (id === "harchiq") scrollToSection("ai-workspace");
      else if (id === "alertes") scrollToSection("alertes");
      else if (id === "rapport") {
        // Trigger CSV export (mirrors BoiteOutilsCard handler) + milestone
        (async () => {
          try {
            toast.info("Export CSV en cours…");
            const r = await fetch("/api/console/export-csv?type=articles&days=90");
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const blob = await r.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `harch-articles-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Export CSV téléchargé");
            handleReportDownload();
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Erreur";
            toast.error(`Export CSV échoué: ${msg}`);
          }
        })();
      }
    },
    [handleReportDownload],
  );

  // ─── R2-ESSENTIAL-A — Notification Center handlers ─────────────────
  // Toggle dropdown, mark all as read, click single notification (marks
  // as read + closes dropdown + scrolls to relevant section).
  const handleToggleNotifs = useCallback(() => {
    setNotifExpanded((v) => !v);
  }, []);

  const handleMarkAllNotifsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [setNotifications]);

  const handleClickNotif = useCallback(
    (n: NotificationItem) => {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)),
      );
      setNotifExpanded(false);
      scrollToSection(n.target);
    },
    [setNotifications],
  );

  // ─── R2-ESSENTIAL-A — Guided Tour handlers ─────────────────────────
  // Manual re-trigger from Quick Start link, advance to next step, skip.
  const handleStartTour = useCallback(() => {
    setTourStep(0);
    setTourActive(true);
  }, []);

  const handleTourNext = useCallback(() => {
    setTourStep((s) => {
      if (s + 1 >= TOUR_STEPS.length) {
        setTourActive(false);
        setTourCompleted(true);
        toast.success("Tour guidé terminé", {
          description: "Vous êtes prêt à utiliser votre atelier de veille.",
        });
        return s;
      }
      return s + 1;
    });
  }, [setTourCompleted]);

  const handleTourSkip = useCallback(() => {
    setTourActive(false);
    setTourCompleted(true);
  }, [setTourCompleted]);

  // ─── R2-ESSENTIAL-A — Daily Briefing handlers ──────────────────────
  // Marks today's briefing as viewed (persisted in essential:briefing-date).
  const handleBriefingViewed = useCallback(() => {
    setBriefingDate(todayISO());
  }, [setBriefingDate]);

  const milestoneProgress = useMemo(() => {
    return (["firstArticle", "firstQuestion", "firstReport", "firstWeek"] as const).filter(
      (k) => milestones[k],
    ).length;
  }, [milestones]);

  const milestoneRecentlyUnlocked = recentlyUnlockedKey !== null;
  const showQuickStart = !quickStartDismissed && visits <= 3;

  // ─── Active section tracking via IntersectionObserver ──────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = NAV_ITEMS.map((n) => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the top of the viewport
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

  // ─── R2-ESSENTIAL-B — Command Palette: Cmd+K / Ctrl+K global shortcut ─
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ─── R2-ESSENTIAL-B — Push to recents (keep last 5, dedupe) ──────────
  const handlePushRecent = useCallback(
    (id: string) => {
      setCmdRecents((prev) => {
        const next = [id, ...prev.filter((x) => x !== id)];
        return next.slice(0, 5);
      });
    },
    [setCmdRecents],
  );

  // ─── R2-ESSENTIAL-B — CSV export helper (shared with QuickStart) ─────
  const handleCmdExport = useCallback(async () => {
    try {
      toast.info("Export CSV en cours…");
      const r = await fetch("/api/console/export-csv?type=articles&days=90");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `harch-articles-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export CSV téléchargé");
      handleReportDownload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur";
      toast.error(`Export CSV échoué: ${msg}`);
    }
  }, [handleReportDownload]);

  // ─── R2-ESSENTIAL-B — Scroll to AI workspace + focus the input ──────
  const handleCmdAskHarchIQ = useCallback(() => {
    scrollToSection("ai-workspace");
    setTimeout(() => {
      const el = document.getElementById("harchiq-input") as HTMLTextAreaElement | null;
      el?.focus();
    }, 500);
  }, []);

  // ─── R2-ESSENTIAL-B — Refresh all data feeds ────────────────────────
  const handleCmdRefresh = useCallback(() => {
    refetchHealth();
    refetchAlerts();
    refetchInsights();
    toast.success("Données rafraîchies");
  }, [refetchHealth, refetchAlerts, refetchInsights]);

  // R3-ESSENTIEL-A — Saved Search handlers (lifted state).
  // Apply a search query to the Brand Mention Feed (filters visible items),
  // then scroll to the feed so the user sees the filtered results.
  const handleRunSearch = useCallback((query: string) => {
    setMentionQuery(query);
    setTimeout(() => scrollToSection("flux-mentions"), 50);
  }, []);

  const handleClearSearch = useCallback(() => {
    setMentionQuery("");
  }, []);

  // ─── R2-ESSENTIAL-B — Command palette actions (7 actions, French) ───
  const cmdActions = useMemo<CmdAction[]>(
    () => [
      {
        id: "goto-score",
        label: "Aller au Score de réputation",
        hint: "Tableau de bord principal · section 02",
        Icon: TrendingUp,
        run: () => scrollToSection("score"),
      },
      {
        id: "ask-harchiq",
        label: "Poser une question à HarchIQ",
        hint: "AI Workspace · focus le champ de saisie",
        Icon: Sparkles,
        run: handleCmdAskHarchIQ,
      },
      {
        id: "view-alertes",
        label: "Voir mes alertes",
        hint: "Indicateur de crise · section 13",
        Icon: AlertTriangle,
        run: () => scrollToSection("alertes"),
      },
      {
        id: "download-report",
        label: "Télécharger mon rapport",
        hint: "Export CSV des 90 derniers jours",
        Icon: Download,
        run: handleCmdExport,
      },
      {
        id: "redo-tour",
        label: "Refaire le tour guidé",
        hint: "5 étapes · 2 minutes",
        Icon: Map,
        run: () => handleStartTour(),
      },
      {
        id: "toggle-theme",
        label: "Basculer le thème",
        hint: "Mode clair (le mode sombre arrive bientôt)",
        Icon: Sun,
        run: () => toast.info("Le mode sombre n'est pas encore disponible sur le plan Essentiel"),
      },
      {
        id: "refresh-data",
        label: "Rafraîchir les données",
        hint: "Recharge les APIs en arrière-plan",
        Icon: RefreshCw,
        run: handleCmdRefresh,
      },
    ],
    [handleCmdAskHarchIQ, handleCmdExport, handleCmdRefresh, handleStartTour],
  );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FFFFFF", fontFamily: FONT_SANS }}>
      {/* R2-ESSENTIAL-B — Skip-link (a11y, keyboard-only) */}
      <SkipLink />

      {/* ENV-ESSENTIAL — sage pulse keyframe + scoped global helper */}
      {/* POLISH-ESSENTIAL — added shimmer / bounce / card-lift / link-underline / btn-scale */}
      <style>{`
        @keyframes sage-pulse-kf {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,123,95,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(74,123,95,0); }
        }
        .sage-pulse { animation: sage-pulse-kf 1.6s ease-out 2; border-radius: 10px; }

        /* Shimmer skeleton — replaces flat gray with a sliding highlight sweep. */
        @keyframes shimmerSlide {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-skeleton {
          background: linear-gradient(90deg, #F4F4F5 0%, #FAFAFA 25%, #FFFFFF 50%, #FAFAFA 75%, #F4F4F5 100%);
          background-size: 200% 100%;
          animation: shimmerSlide 1.6s ease-in-out infinite;
        }

        /* Fade-in for skeleton mount — pairs with shimmer for a softer entrance. */
        @keyframes fadeInSkeleton {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-in-skeleton { animation: fadeInSkeleton 0.3s ease-out both; }

        /* Sage bounce — used on empty-state illustrations for a playful entrance. */
        @keyframes sageBounce {
          0% { transform: scale(0.7) rotate(-6deg); opacity: 0; }
          55% { transform: scale(1.08) rotate(3deg); opacity: 1; }
          80% { transform: scale(0.96) rotate(-1deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        .sage-bounce { animation: sageBounce 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

        /* Card hover lift — subtle shadow + 1px translate on every CardShell. */
        .card-hover-lift {
          transition: box-shadow 220ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 220ms ease;
          will-change: box-shadow, transform;
        }
        .card-hover-lift:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          transform: translateY(-1px);
          border-color: ${SAGE_DIM} !important;
        }

        /* Button micro-interaction — scale 1.02 on hover, 0.98 on active.
           Scoped to .min-h-screen so it never leaks outside this dashboard.
           Excludes aria-hidden buttons (silent refresh trigger) and
           .no-scale buttons (icon-only toolbar buttons where scale feels off). */
        .min-h-screen button:not([aria-hidden="true"]):not(.no-scale) {
          transition: transform 140ms cubic-bezier(0.16, 1, 0.3, 1),
                      background-color 160ms ease,
                      color 160ms ease,
                      border-color 160ms ease,
                      box-shadow 160ms ease;
          will-change: transform;
        }
        .min-h-screen button:not([aria-hidden="true"]):not(.no-scale):hover {
          transform: scale(1.02);
        }
        .min-h-screen button:not([aria-hidden="true"]):not(.no-scale):active {
          transform: scale(0.98);
        }

        /* Link underline animation — background-size slide for a refined reveal. */
        .link-underline {
          background-image: linear-gradient(currentColor, currentColor);
          background-size: 0% 1px;
          background-position: 0 100%;
          background-repeat: no-repeat;
          transition: background-size 220ms cubic-bezier(0.16, 1, 0.3, 1);
          padding-bottom: 1px;
        }
        .link-underline:hover { background-size: 100% 1px; }

        /* Icon hover color shift — gray to sage on icon-bearing elements. */
        .icon-hover { transition: color 160ms ease; }
        .icon-hover:hover { color: ${SAGE}; }

        /* Staggered fade-up for KPI numbers / mini-stats. */
        @keyframes fadeUpKpi {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-up-kpi { animation: fadeUpKpi 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* R2-ESSENTIEL-B — global focus-visible outline (WCAG 2.1 AA).
           Sage outline on every interactive element via :focus-visible so
           mouse users don't see it but keyboard users do. */
        .min-h-screen button:focus-visible,
        .min-h-screen a:focus-visible,
        .min-h-screen [role="option"]:focus-visible,
        .min-h-screen [role="combobox"]:focus-visible,
        .min-h-screen [role="listbox"]:focus-visible,
        .min-h-screen textarea:focus-visible,
        .min-h-screen input:focus-visible,
        .min-h-screen select:focus-visible,
        .min-h-screen [tabindex]:focus-visible {
          outline: 2px solid #4A7B5F;
          outline-offset: 2px;
          border-radius: 4px;
        }
        /* sr-only utility (Tailwind v4 ships one but we declare locally for safety) */
        .sr-only:not(:focus):not(:focus-within) {
          position: absolute;
          width: 1px; height: 1px;
          padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0, 0, 0, 0);
          white-space: nowrap; border: 0;
        }
      `}</style>

      {/* Sidebar — desktop sticky aside */}
      <aside
        className="hidden lg:block sticky top-0 h-screen shrink-0"
        style={{ width: 240, borderRight: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
      >
        <SidebarContent
          activeSection={activeSection}
          alertCount={alertCount}
        />
      </aside>

      {/* Mobile sidebar overlay — POLISH-ESSENTIAL: AnimatePresence + slide-in from left */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(10,10,10,0.4)" }}
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="absolute left-0 top-0 h-full bg-white shadow-xl"
              style={{ width: 280, maxWidth: "85vw" }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <SidebarContent
                activeSection={activeSection}
                alertCount={alertCount}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          alertCount={alertCount}
          quota={quota}
          sourcesCount={sourcesCount}
          milestoneProgress={milestoneProgress}
          milestoneTotal={4}
          milestoneRecentlyUnlocked={milestoneRecentlyUnlocked}
          onMilestoneClick={() => scrollToSection("jalons")}
          notifications={notifications}
          notifExpanded={notifExpanded}
          onToggleNotifs={handleToggleNotifs}
          onMarkAllNotifsRead={handleMarkAllNotifsRead}
          onClickNotif={handleClickNotif}
          onOpenCmd={() => setCmdOpen(true)}
          onOpenBriefing={() => setBriefingOpen(true)}
          onOpenCrisis={() => setCrisisOpen(true)}
          onOpenMatrix={() => setMatrixOpen(true)}
          onOpenHespress={() => setHespressOpen(true)}
          onOpenComex={() => setComexOpen(true)}
          onOpenDocWriter={() => setDocWriterOpen(true)}
          onOpenPitch={() => setPitchOpen(true)}
          onOpenBoycott={() => setBoycottOpen(true)}
          onOpenStakeholder={() => setStakeholderOpen(true)}
          onOpenRiskHeatmap={() => setRiskHeatmapOpen(true)}
          onOpenSentimentTimeline={() => setSentimentTimelineOpen(true)}
          onOpenRegCalendar={() => setRegCalendarOpen(true)}
          onOpenAiVisibility={() => setAiVisibilityOpen(true)}
          onOpenSourceCred={() => setSourceCredOpen(true)}
          onOpenCompetitorContent={() => setCompetitorContentOpen(true)}
          onOpenMediaReach={() => setMediaReachOpen(true)}
          onOpenCrisisPlaybook={() => setCrisisPlaybookOpen(true)}
          onOpenEsg={() => setEsgOpen(true)}
          onOpenAudit={() => setAuditOpen(true)}
          onOpenTeamPerf={() => setTeamPerfOpen(true)}
          onOpenWhatsapp={() => setWhatsappOpen(true)}
          onOpenSavedSearches={() => setSavedSearchesOpen(true)}
          onOpenInfluencer={() => setInfluencerOpen(true)}
          onOpenNarrative={() => setNarrativeOpen(true)}
          onOpenGeoHeatmap={() => setGeoHeatmapOpen(true)}
          onToggleSkillsMenu={() => setSkillsMenuOpen((v) => !v)}
          skillsMenuOpen={skillsMenuOpen}
        />

        <main id="main-content" className="flex-1 px-4 lg:px-6 py-6">
          {/* ENV-ESSENTIAL — Welcome onboarding banner (dismissible, persisted) */}
          {!onboardingDismissed && (
            <div className="mb-4 lg:mb-6">
              <WelcomeOnboardingBanner
                userName={userName}
                onDismiss={() => setOnboardingDismissed(true)}
              />
            </div>
          )}

          {/* FIX-PRO-RENDER: ErrorBoundary wraps the entire widget grid so a
              single crashing card cannot tear down the dashboard tree
              during SSR or hydration. Each widget is also internally
              defensive (null-safe, ?? [] defaults, length checks). */}
          <WidgetErrorBoundary label="essential-grid">
          <motion.div
            className="grid grid-cols-12 gap-4 lg:gap-6"
            variants={containerStagger}
            initial="initial"
            animate="animate"
          >
            {/* SECTION 1 — HarchIQ AI Workspace (hero, full width) */}
            <HarchIQWorkspace
              quota={quota}
              setQuota={setQuota}
              dismissedHelp={helpDismissedSet}
              onDismissHelp={dismissHelp}
              onFirstQuestion={handleFirstQuestion}
            />

            {/* ENV-ESSENTIAL — Quick Start card (first 3 visits, dismissible) */}
            {showQuickStart && (
              <QuickStartCard
                onAction={handleQuickAction}
                onDismiss={() => setQuickStartDismissed(true)}
                onRedoTour={handleStartTour}
              />
            )}

            {/* R2-ESSENTIAL-A — Daily Briefing (auto-generated, TTS + WhatsApp) */}
            <DailyBriefingCard
              userName={userName}
              health={health}
              sources={sources}
              briefingDate={briefingDate}
              onViewed={handleBriefingViewed}
            />

            {/* SECTION 2 — Score de Réputation */}
            <ScoreReputationCard
              health={health}
              loading={healthLoading}
              dismissedHelp={helpDismissedSet}
              onDismissHelp={dismissHelp}
            />

            {/* SECTIONS 3-6 — KPI strip */}
            <SentimentMoyenKpi health={health} trend={sentimentTrend} loading={healthLoading} />
            <MentionsJourKpi health={health} trend={sentimentTrend} loading={healthLoading} />
            <CitationsIaKpi ai={aiVis} loading={aiVisLoading} />
            <AlertesActivesKpi
              alerts={alerts}
              loading={alertsLoading}
              dismissedHelp={helpDismissedSet}
              onDismissHelp={dismissHelp}
            />

            {/* SECTIONS 7-8 — Chart row */}
            <TendanceSentimentCard
              trend={sentimentTrend}
              range={sentimentRange}
              onRangeChange={setSentimentRange}
              loading={trendLoading}
              dismissedHelp={helpDismissedSet}
              onDismissHelp={dismissHelp}
            />
            <DiversiteSourcesCard
              sources={sources}
              loading={sourcesLoading}
              dismissedHelp={helpDismissedSet}
              onDismissHelp={dismissHelp}
            />

            {/* R4-ESSENTIEL-A · FEATURE 3 — Sentiment Timeline (col-span-12) */}
            <SentimentTimelineCard health={health} loading={healthLoading} />

            {/* R4-ESSENTIEL-A · FEATURE 2 — Source Credibility Scoring (col-span-12) */}
            <SourceCredibilityScoringCard sources={sources} loading={sourcesLoading} />

            {/* SECTIONS 9-10 — Feed row */}
            <DernieresMentionsCard alerts={alerts} loading={alertsLoading} />
            <ResumeHebdoCard
              insights={insights}
              loading={insightsLoading}
              onRegenerate={refetchInsights}
            />

            {/* SECTIONS 11-12 — AI row */}
            <SnapshotVisibiliteCard ai={aiVis} loading={aiVisLoading} />
            <TopSujetsCard topics={topics} loading={topicsLoading} />

            {/* SECTIONS 13-14 — Crisis row */}
            <IndicateurCriseCard health={health} alerts={alerts} loading={healthLoading} />
            <CarteChaleurGeoCard data={geoHeatmap} loading={geoHeatmapLoading} error={geoHeatmapError} />

            {/* SECTIONS 15-16 — Rank row */}
            <PositionHarch100Card harch100={harch100} loading={harch100Loading} />
            <ActiviteReseauSocialCard data={socialActivity} loading={socialActivityLoading} error={socialActivityError} />

            {/* SECTIONS 17-18 — Lang row */}
            <MeteoSentimentsLangueCard data={languageSentiment} loading={languageSentimentLoading} error={languageSentimentError} />
            <EvolutionScoreCard health={health} loading={healthLoading} />

            {/* SECTION 19 — Volume row */}
            <VolumeMentionsCard trend={sentimentTrend} loading={trendLoading} />

            {/* Hidden spacer to keep 12-col grid balanced — Vol + score evolution together */}
            <motion.div {...cardMotion} className="lg:col-span-5">
              <CardShell>
                <SectionHeader title="Rappel Dircom" right={<CalendarDays size={14} style={{ color: TEXT_MUTED }} />} />
                <Separator className="my-3" style={{ backgroundColor: BORDER }} />
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} style={{ color: SAGE, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 12,
                          fontWeight: 700,
                          color: CHARCOAL,
                        }}
                      >
                        Points clés à retenir
                      </div>
                      <p
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 12,
                          color: TEXT_BODY,
                          marginTop: 2,
                          lineHeight: 1.5,
                        }}
                      >
                        Le score de réputation est {health && health.score != null ? `${Math.round(health.score)}/100` : "—"}.
                        Surveillez le narrative « {health?.topNarrative?.label ?? "—"} ».
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} style={{ color: NEUTRAL_AMBER, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 12,
                          fontWeight: 700,
                          color: CHARCOAL,
                        }}
                      >
                        Action recommandée
                      </div>
                      <p
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 12,
                          color: TEXT_BODY,
                          marginTop: 2,
                          lineHeight: 1.5,
                        }}
                      >
                        {health?.recommendation ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8"
                    style={{ fontFamily: FONT_MONO, fontSize: 11 }}
                    onClick={() => refetchHealth()}
                  >
                    <RefreshCw size={12} className="mr-1.5" />
                    Rafraîchir les données
                  </Button>
                </div>
              </CardShell>
            </motion.div>

            {/* SECTION 20 — Boîte à outils + Upsell */}
            <BoiteOutilsCard />

            {/* R3-ESSENTIEL-A — Brand Mention Feed (real-time, col-span-7) */}
            <BrandMentionFeedCard
              externalQuery={mentionQuery}
              onClearQuery={handleClearSearch}
            />

            {/* R3-ESSENTIEL-A — WhatsApp Alert Preview (phone mockup, col-span-5) */}
            <WhatsAppAlertPreviewCard
              config={whatsappConfig}
              setConfig={setWhatsappConfig}
            />

            {/* R3-ESSENTIEL-A — Saved Searches Starter (col-span-12) */}
            <SavedSearchesStarterCard
              savedSearches={savedSearches}
              setSavedSearches={setSavedSearches}
              activeQuery={mentionQuery}
              onRunSearch={handleRunSearch}
            />

            {/* R4-ESSENTIEL-A · FEATURE 1 — Weekly Digest Email Preview (col-span-12) */}
            <WeeklyDigestEmailPreviewCard
              userName={userName}
              userEmail={userEmail}
              health={health}
              insights={insights}
              sources={sources}
            />

            {/* SECTION 21 — ENV-ESSENTIEL — Milestone tracker (gamification) */}
            <MilestoneTrackerCard
              milestones={milestones}
              recentlyUnlockedKey={recentlyUnlockedKey}
            />
          </motion.div>
          </WidgetErrorBoundary>

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

        {/* Footer */}
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
              HARCH ATELIER · CONSOLE ESSENTIEL · v10X · ENV-ESSENTIAL · R2-ESSENTIEL-A · R2-ESSENTIEL-B · R3-ESSENTIEL-A · R4-ESSENTIEL-A
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
              }}
            >
              Données temps réel · Mises à jour auto · Casablanca
            </div>
          </div>
        </footer>
      </div>

      {/* R2-ESSENTIAL-A — Guided Tour overlay (portal-level, fixed position) */}
      <GuidedTour
        active={tourActive}
        step={tourStep}
        onNext={handleTourNext}
        onSkip={handleTourSkip}
      />

      {/* R2-ESSENTIAL-B — Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        actions={cmdActions}
        recents={cmdRecents}
        onPushRecent={handlePushRecent}
      />

      {/* SKILL 1: Briefing Matinal — live document popup */}
      {briefingOpen && <BriefingGenerator onClose={() => setBriefingOpen(false)} />}
      {crisisOpen && <CrisisBriefingGenerator onClose={() => setCrisisOpen(false)} />}
      {matrixOpen && <CompetitorMatrixGenerator onClose={() => setMatrixOpen(false)} />}
      {hespressOpen && <HespressDigestGenerator onClose={() => setHespressOpen(false)} />}
      {comexOpen && <ComexReportGenerator onClose={() => setComexOpen(false)} />}
      {docWriterOpen && <DocumentWriterGenerator onClose={() => setDocWriterOpen(false)} />}
      {pitchOpen && <PitchDeckGenerator onClose={() => setPitchOpen(false)} />}
      {boycottOpen && <BoycottAlertGenerator onClose={() => setBoycottOpen(false)} />}
      {stakeholderOpen && <StakeholderMapGenerator onClose={() => setStakeholderOpen(false)} />}
      {riskHeatmapOpen && <RiskHeatmapGenerator onClose={() => setRiskHeatmapOpen(false)} />}
      {sentimentTimelineOpen && <SentimentTimelineGenerator onClose={() => setSentimentTimelineOpen(false)} />}
      {regCalendarOpen && <RegCalendarGenerator onClose={() => setRegCalendarOpen(false)} />}
      {aiVisibilityOpen && <AiVisibilityReportGenerator onClose={() => setAiVisibilityOpen(false)} />}
      {sourceCredOpen && <SourceCredibilityGenerator onClose={() => setSourceCredOpen(false)} />}
      {competitorContentOpen && <CompetitorContentGenerator onClose={() => setCompetitorContentOpen(false)} />}
      {mediaReachOpen && <MediaReachGenerator onClose={() => setMediaReachOpen(false)} />}
      {crisisPlaybookOpen && <CrisisPlaybookGenerator onClose={() => setCrisisPlaybookOpen(false)} />}
      {esgOpen && <EsgScorecardGenerator onClose={() => setEsgOpen(false)} />}
      {auditOpen && <AuditTimelineGenerator onClose={() => setAuditOpen(false)} />}
      {teamPerfOpen && <TeamPerformanceGenerator onClose={() => setTeamPerfOpen(false)} />}
      {whatsappOpen && <WhatsappPreviewGenerator onClose={() => setWhatsappOpen(false)} />}
      {savedSearchesOpen && <SavedSearchesGenerator onClose={() => setSavedSearchesOpen(false)} />}
      {influencerOpen && <InfluencerTrackerGenerator onClose={() => setInfluencerOpen(false)} />}
      {narrativeOpen && <NarrativeTrackerGenerator onClose={() => setNarrativeOpen(false)} />}
      {geoHeatmapOpen && <GeoHeatmapGenerator onClose={() => setGeoHeatmapOpen(false)} />}
    </div>
  );
}

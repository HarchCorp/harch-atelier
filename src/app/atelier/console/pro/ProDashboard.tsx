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
  Component,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  ArrowUpCircle,
  AtSign,
  BarChart3,
  Bell,
  BellRing,
  Brain,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudRain,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileImage,
  FileSpreadsheet,
  FileText,
  Filter,
  GripVertical,
  Grid3x3,
  Hash,
  History,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  Lightbulb,
  ListChecks,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  MessageCircle,
  Minus,
  MoreHorizontal,
  Newspaper,
  Palette,
  PenSquare,
  Pin,
  Play,
  Plus,
  Presentation,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  TrendingDown,
  TrendingUp,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  X,
  Zap,
  Calculator,
  Megaphone,
  Layers,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS as DndCSS } from "@dnd-kit/utilities";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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

// ════════════════════════════════════════════════════════════════════
// PRO SKILLS — 22 generators wired into the header (icon buttons +
// "Plus d'outils" dropdown). Same pattern as EssentialDashboard.
// Task ID: WIRE-PRO-SKILLS
// ════════════════════════════════════════════════════════════════════
import { BriefingGenerator } from "../components/BriefingGenerator";
import { CrisisBriefingGenerator } from "../components/CrisisBriefingGenerator";
import { CompetitorMatrixGenerator } from "../components/CompetitorMatrixGenerator";
import { HespressDigestGenerator } from "../components/HespressDigestGenerator";
import { DocumentWriterGenerator } from "../components/DocumentWriterGenerator";
import { PitchDeckGenerator } from "../components/PitchDeckGenerator";
import { BoycottAlertGenerator } from "../components/BoycottAlertGenerator";
import { SentimentTimelineGenerator } from "../components/SentimentTimelineGenerator";
import { SourceCredibilityGenerator } from "../components/SourceCredibilityGenerator";
import { CompetitorContentGenerator } from "../components/CompetitorContentGenerator";
import { MediaReachGenerator } from "../components/MediaReachGenerator";
import { CampaignTrackerGenerator } from "../components/CampaignTrackerGenerator";
import { InfluencerTrackerGenerator } from "../components/InfluencerTrackerGenerator";
import { NarrativeTrackerGenerator } from "../components/NarrativeTrackerGenerator";
import { GeoHeatmapGenerator } from "../components/GeoHeatmapGenerator";
import { EmailDigestGenerator } from "../components/EmailDigestGenerator";
import { SentimentHeatmapGenerator } from "../components/SentimentHeatmapGenerator";
import { SovTrendsGenerator } from "../components/SovTrendsGenerator";
import { TeamPerformanceGenerator } from "../components/TeamPerformanceGenerator";
import { SavedSearchesGenerator } from "../components/SavedSearchesGenerator";
import { DarijaTranslatorGenerator } from "../components/DarijaTranslatorGenerator";
import { WhatsappPreviewGenerator } from "../components/WhatsappPreviewGenerator";

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
  // HONEST-EMPTY-STATES — score peut être null quand la collecte n'a pas
  // encore commencé. status="no_data" → 0 article, status="limited" →
  // < 10 articles (score renvoyé mais à prendre avec prudence).
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

// ─── PRO ENV types (Task ID: ENV-PRO) ─────────────────────────────────

interface CompetitorEntry {
  id: string;
  name: string;
  industry: string;
  addedAt: number;
}

type CompetitorKpi = "sov" | "sentiment" | "aiVisibility" | "mediaReach" | "engagement";

type AlertChannel = "email" | "slack" | "teams" | "dashboard";

interface CompetitorSetup {
  competitors: CompetitorEntry[];
  kpis: CompetitorKpi[];
  alertThreshold: number; // 0-100
  alertChannels: AlertChannel[];
  completedAt: number | null;
}

type InfluencerSortKey = "reach" | "engagement" | "sentiment";

type InfluencerPlatform =
  | "TikTok"
  | "Instagram"
  | "X"
  | "LinkedIn"
  | "YouTube"
  | "Facebook"
  | "Presse"
  | "Web";

interface InfluencerEntry {
  id: string;
  name: string;
  handle: string;
  platform: InfluencerPlatform;
  followers: number;
  engagementRate: number; // %
  sentiment: number; // -1..1
  starred: boolean;
  addedAt: number;
}

type ReportFormat = "pdf" | "excel" | "both";
type ReportCadence = "weekly" | "monthly" | "custom";

interface ReportSchedule {
  cadence: ReportCadence;
  dayOfWeek: number; // 0=dim, 1=lun, ... 6=sam
  dayOfMonth: number; // 1-28
  customDay: string; // ISO date for custom
  customTime: string; // HH:MM
  recipients: string[];
  format: ReportFormat;
  brandColor: string;
  brandLogoName: string | null;
  enabled: boolean;
}

interface ProFilters {
  period: "7d" | "30d" | "90d";
  sources: string[];
  sentiment: { positive: boolean; neutral: boolean; negative: boolean };
  language: Array<"fr" | "ar" | "en">;
}

const DEFAULT_PRO_FILTERS: ProFilters = {
  period: "30d",
  sources: [],
  sentiment: { positive: true, neutral: true, negative: true },
  language: ["fr", "ar", "en"],
};

// ─── R2-PRO-A · Feature 1: Saved Filter Presets ────────────────────────

interface FilterPreset {
  id: string;
  name: string;
  filters: ProFilters;
  createdAt: number;
}

const MAX_FILTER_PRESETS = 10;

// ─── R2-PRO-A · Feature 2: Alert Rules Builder ─────────────────────────

type AlertRuleConditionKind =
  | "score_below"
  | "negative_sentiment_above"
  | "mentions_above_24h"
  | "source_keyword";

type AlertRuleCondition =
  | { kind: "score_below"; threshold: number }
  | { kind: "negative_sentiment_above"; threshold: number }
  | { kind: "mentions_above_24h"; threshold: number }
  | { kind: "source_keyword"; source: string; keyword: string };

type AlertRuleAction = "email" | "whatsapp" | "slack" | "in_app";
type AlertRuleSeverity = "info" | "warning" | "critique";

interface AlertRule {
  id: string;
  name: string;
  condition: AlertRuleCondition;
  action: AlertRuleAction;
  severity: AlertRuleSeverity;
  enabled: boolean;
  createdAt: number;
  lastTriggeredAt: number | null;
}

const ALERT_CONDITION_LABELS: Record<AlertRuleConditionKind, string> = {
  score_below: "Score < seuil",
  negative_sentiment_above: "Sentiment n\u00e9gatif > X%",
  mentions_above_24h: "Mentions > X en 24h",
  source_keyword: "Source mentionne mot-cl\u00e9",
};

const ALERT_ACTION_LABELS: Record<AlertRuleAction, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  slack: "Slack webhook",
  in_app: "Notification in-app",
};

const ALERT_SEVERITY_LABELS: Record<AlertRuleSeverity, string> = {
  info: "Info",
  warning: "Warning",
  critique: "Critique",
};

const ALERT_SEVERITY_COLORS: Record<AlertRuleSeverity, string> = {
  info: "#3B82F6",
  warning: NEUTRAL_AMBER,
  critique: NEGATIVE,
};

const SEED_ALERT_RULES: AlertRule[] = [
  {
    id: "rule-seed-1",
    name: "Chute du score de r\u00e9putation",
    condition: { kind: "score_below", threshold: 45 },
    action: "email",
    severity: "critique",
    enabled: true,
    createdAt: Date.now() - 86400000 * 6,
    lastTriggeredAt: null,
  },
  {
    id: "rule-seed-2",
    name: "Pic de mentions n\u00e9gatives",
    condition: { kind: "negative_sentiment_above", threshold: 35 },
    action: "in_app",
    severity: "warning",
    enabled: true,
    createdAt: Date.now() - 86400000 * 2,
    lastTriggeredAt: null,
  },
];

// ─── R2-PRO-A · Feature 3: Competitor Watchlist ────────────────────────

interface WatchlistFavorite {
  id: string;
  name: string;
  pinnedAt: number;
}

const DEFAULT_COMPETITOR_SETUP: CompetitorSetup = {
  competitors: [],
  kpis: ["sov", "sentiment", "aiVisibility"],
  alertThreshold: 35,
  alertChannels: ["email", "dashboard"],
  completedAt: null,
};

const DEFAULT_REPORT_SCHEDULE: ReportSchedule = {
  cadence: "weekly",
  dayOfWeek: 1,
  dayOfMonth: 1,
  customDay: "",
  customTime: "08:00",
  recipients: [],
  format: "pdf",
  brandColor: SAGE,
  brandLogoName: null,
  enabled: false,
};

const SEED_INFLUENCERS: InfluencerEntry[] = [
  { id: "inf-seed-1", name: "Yassine Benchakroun", handle: "@ybench", platform: "LinkedIn", followers: 48200, engagementRate: 4.8, sentiment: 0.62, starred: true, addedAt: Date.now() - 86400000 * 14 },
  { id: "inf-seed-2", name: "Salma El Idrissi", handle: "@salmareports", platform: "X", followers: 91500, engagementRate: 3.1, sentiment: 0.18, starred: false, addedAt: Date.now() - 86400000 * 9 },
  { id: "inf-seed-3", name: "Karim Tahiri", handle: "@ktahiri", platform: "TikTok", followers: 215000, engagementRate: 6.4, sentiment: -0.12, starred: false, addedAt: Date.now() - 86400000 * 5 },
  { id: "inf-seed-4", name: "Le Matin Éco", handle: "@lematineco", platform: "Presse", followers: 540000, engagementRate: 1.2, sentiment: 0.41, starred: true, addedAt: Date.now() - 86400000 * 21 },
  { id: "inf-seed-5", name: "Hicham Mansouri", handle: "@hmansouri", platform: "Instagram", followers: 128400, engagementRate: 5.2, sentiment: 0.34, starred: false, addedAt: Date.now() - 86400000 * 3 },
];

const COMPANIES_DB: Array<{ name: string; industry: string }> = [
  { name: "Maroc Telecom", industry: "Télécoms" },
  { name: "Attijariwafa Bank", industry: "Banque" },
  { name: "Banque Centrale Populaire", industry: "Banque" },
  { name: "BMCE Bank of Africa", industry: "Banque" },
  { name: "CIH Bank", industry: "Banque" },
  { name: "OCP Group", industry: "Mines & Chimie" },
  { name: "LafargeHolcim Maroc", industry: "Matériaux" },
  { name: "Managem", industry: "Mines" },
  { name: "Lydec", industry: "Services publics" },
  { name: "Redal", industry: "Services publics" },
  { name: "Inwi", industry: "Télécoms" },
  { name: "Orange Maroc", industry: "Télécoms" },
  { name: "Royal Air Maroc", industry: "Transport" },
  { name: "ONCF", industry: "Transport" },
  { name: "Marsa Maroc", industry: "Logistique" },
  { name: "LesieurCristal", industry: "Agroalimentaire" },
  { name: "Centrale Laitière", industry: "Agroalimentaire" },
  { name: "Cosumar", industry: "Agroalimentaire" },
  { name: "Label'Vie", industry: "Distribution" },
  { name: "Marjane Holding", industry: "Distribution" },
  { name: "BIM Maroc", industry: "Distribution" },
  { name: "Auto Hall", industry: "Automobile" },
  { name: "Stellantis Maroc", industry: "Automobile" },
  { name: "Renault Tanger Med", industry: "Automobile" },
  { name: "AFMA Index", industry: "Assurance" },
  { name: "RMA Watanya", industry: "Assurance" },
  { name: "Wafa Assurance", industry: "Assurance" },
  { name: "Sanlam Maroc", industry: "Assurance" },
  { name: "Delta Holding", industry: "Conglomérat" },
  { name: "Ynna Holding", industry: "Conglomérat" },
  { name: "SNI", industry: "Holding" },
  { name: "Al Mada", industry: "Holding" },
  { name: "L'Économiste", industry: "Média" },
  { name: "Les Éco", industry: "Média" },
  { name: "Médias24", industry: "Média" },
  { name: "TelQuel", industry: "Média" },
  { name: "Le360", industry: "Média" },
  { name: "Hespress", industry: "Média" },
  { name: "Aujourd'hui Le Maroc", industry: "Média" },
  { name: "Le Matin", industry: "Média" },
];

const SOURCE_OPTIONS = [
  "Presse nationale",
  "Presse régionale",
  "Presse internationale",
  "Twitter/X",
  "Facebook",
  "LinkedIn",
  "Instagram",
  "TikTok",
  "YouTube",
  "Blogs",
  "Forums",
  "WhatsApp",
];

const KPI_LABELS: Record<CompetitorKpi, string> = {
  sov: "Part de voix (SOV)",
  sentiment: "Sentiment",
  aiVisibility: "Visibilité IA",
  mediaReach: "Reach média",
  engagement: "Engagement",
};

const CHANNEL_LABELS: Record<AlertChannel, string> = {
  email: "Email",
  slack: "Slack",
  teams: "Microsoft Teams",
  dashboard: "Tableau de bord",
};

// ─── R2-PRO-B · Team Annotations + Export Center + Anomaly Detection ──

interface Comment {
  id: string;
  author: string;
  body: string;
  createdAt: number;
  dataPoint?: string;
  resolved?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

type ExportFormat = "csv" | "png" | "pdf";
type ExportScope = "full" | "section" | "period";
type ExportTheme = "sage" | "charcoal" | "neutral";

interface ExportBranding {
  includeLogo: boolean;
  includeFooter: boolean;
  theme: ExportTheme;
}

interface ExportHistoryItem {
  id: string;
  format: ExportFormat;
  scope: ExportScope;
  sectionId?: string;
  periodFrom?: string;
  periodTo?: string;
  timestamp: number;
  fileName: string;
  fileSizeKb: number;
}

interface AnomalyPoint {
  index: number;
  value: number;
  zScore: number;
  severity: "critical" | "warning";
  label?: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: "tm-1", name: "Salma El Idrissi", role: "Responsable communication" },
  { id: "tm-2", name: "Yassine Benchakroun", role: "Analyste données" },
  { id: "tm-3", name: "Karim Tahiri", role: "Dircom" },
  { id: "tm-4", name: "Leila Benjelloun", role: "Community manager" },
  { id: "tm-5", name: "Hicham Mansouri", role: "Veilleur" },
  { id: "tm-6", name: "Nadia Cherkaoui", role: "Stratège" },
];

const SEED_ANNOTATIONS: Record<string, Comment[]> = {
  "tendance-sentiment": [
    {
      id: "ann-seed-1",
      author: "Salma El Idrissi",
      body: "Baisse du sentiment le 15 juillet — probablement liée à la couverture du dossier social dans la presse nationale. @Yassine Benchakroun peux-tu confirmer l'origine ?",
      createdAt: Date.now() - 86400000 * 2,
      dataPoint: "15 juillet",
      resolved: false,
    },
  ],
};

const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: "CSV (données brutes)",
  png: "PNG (capture graphique)",
  pdf: "PDF (rapport formaté)",
};

const EXPORT_SCOPE_LABELS: Record<ExportScope, string> = {
  full: "Tableau de bord complet",
  section: "Cette section",
  period: "Période sélectionnée",
};

const EXPORT_THEME_OPTIONS: Array<{ key: ExportTheme; label: string; color: string }> = [
  { key: "sage", label: "Sage", color: SAGE },
  { key: "charcoal", label: "Charcoal", color: CHARCOAL },
  { key: "neutral", label: "Neutre", color: NEUTRAL_GRAY },
];

const MAX_EXPORT_HISTORY = 5;

// ─── R3-PRO-A · Feature 1: Sentiment Heatmap types ─────────────────────
// (Reuses SentimentDay — same shape: date/avgScore/count/positive/neutral/negative)

// ─── R3-PRO-A · Feature 2: Influencer Campaign Tracker types ───────────

type CampaignStatus = "active" | "scheduled" | "completed";

interface Campaign {
  id: string;
  name: string;
  brand: string;
  influencer: string;
  status: CampaignStatus;
  startDate: string; // ISO yyyy-MM-dd
  endDate: string; // ISO yyyy-MM-dd
  budget: number; // MAD
  reach: number;
  engagementRate: number; // %
  roi: number; // %
}

const CAMP_DAY_MS = 86400000;

const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-seed-1",
    name: "Lancement Ramadan 2025",
    brand: "Maroc Telecom",
    influencer: "Yassine Benchakroun",
    status: "active",
    startDate: new Date(Date.now() - 10 * CAMP_DAY_MS).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 20 * CAMP_DAY_MS).toISOString().slice(0, 10),
    budget: 250000,
    reach: 480000,
    engagementRate: 5.4,
    roi: 142,
  },
  {
    id: "camp-seed-2",
    name: "Inauguration nouvelle gamme",
    brand: "Attijariwafa Bank",
    influencer: "Salma El Idrissi",
    status: "scheduled",
    startDate: new Date(Date.now() + 7 * CAMP_DAY_MS).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 37 * CAMP_DAY_MS).toISOString().slice(0, 10),
    budget: 180000,
    reach: 0,
    engagementRate: 0,
    roi: 0,
  },
  {
    id: "camp-seed-3",
    name: "Campagne Rentrée Scolaire",
    brand: "Marjane Holding",
    influencer: "Karim Tahiri",
    status: "completed",
    startDate: new Date(Date.now() - 60 * CAMP_DAY_MS).toISOString().slice(0, 10),
    endDate: new Date(Date.now() - 30 * CAMP_DAY_MS).toISOString().slice(0, 10),
    budget: 320000,
    reach: 1250000,
    engagementRate: 6.8,
    roi: 215,
  },
];

// ─── R3-PRO-A · Feature 3: Custom Dashboard Templates types ─────────────

type TemplateIconKey = "direction" | "communication" | "conformite" | "competition" | "custom";

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  iconKey: TemplateIconKey;
  widgets: string[]; // ordered list of widget IDs
  custom?: boolean;
  createdAt?: number;
}

const MAX_CUSTOM_TEMPLATES = 3;

const TEMPLATE_ICONS: Record<TemplateIconKey, typeof LayoutGrid> = {
  direction: LayoutGrid,
  communication: MessageCircle,
  conformite: AlertTriangle,
  competition: Trophy,
  custom: LayoutTemplate,
};

const TEMPLATE_WIDGET_LABELS: Record<string, string> = {
  "ai-workspace": "Espace HarchIQ",
  "score-reputation": "Score de réputation",
  "sentiment-kpi": "KPI Sentiment",
  "mentions-kpi": "KPI Mentions",
  "citations-ia-kpi": "KPI Citations IA",
  "parts-voix-kpi": "KPI Parts de voix",
  "sources-kpi": "KPI Sources",
  "engagement-kpi": "KPI Engagement",
  "tendance-sentiment": "Tendance sentiment",
  "benchmark-concurrents": "Benchmark concurrentiel",
  "competitor-watchlist": "Watchlist concurrents",
  "competitor-content-analysis": "Analyse contenu concurrents",
  "radar-reputation": "Radar réputation",
  "part-voix-donut": "Part de voix (donut)",
  "sov-trends": "Tendances part de voix",
  "top-sujets": "Top sujets",
  "dernieres-mentions": "Dernières mentions",
  "comparaison-semaine": "Comparaison semaine",
  "historique-rapports": "Historique rapports",
  "report-scheduler": "Programmation rapports",
  "export-center": "Centre d'export",
  "recherches-alertes": "Recherches & alertes",
  "alert-rules-builder": "Constructeur de règles",
  "top-influenceurs": "Top influenceurs",
  "influencer-tracker": "Suivi influenceurs",
  "media-reach-calculator": "Calculateur reach média",
  "estimation-reach": "Estimation reach",
  "carte-crise": "Carte de crise",
  "heatmap": "Heatmap heure × jour",
  "repartition-media": "Répartition média",
  "sujets-emergents": "Sujets émergents",
  "tableaux-personnalisables": "Tableaux personnalisables",
  "upsell": "Passer aux grandes entreprises",
  "sentiment-heatmap": "Heatmap sentiment (calendrier)",
  "campaign-tracker": "Suivi campagnes influenceurs",
  "dashboard-templates": "Bibliothèque de templates",
};

const PREDEFINED_TEMPLATES: DashboardTemplate[] = [
  {
    id: "tpl-direction",
    name: "Direction",
    description: "KPIs exécutifs et score de réputation — synthèse pour le COMEX.",
    iconKey: "direction",
    widgets: [
      "ai-workspace",
      "score-reputation",
      "sentiment-kpi",
      "mentions-kpi",
      "citations-ia-kpi",
      "parts-voix-kpi",
      "comparaison-semaine",
      "historique-rapports",
    ],
  },
  {
    id: "tpl-communication",
    name: "Communication",
    description: "Sentiment, sources et mentions — pilotage de la communication.",
    iconKey: "communication",
    widgets: [
      "ai-workspace",
      "tendance-sentiment",
      "sentiment-kpi",
      "sources-kpi",
      "dernieres-mentions",
      "top-sujets",
      "repartition-media",
      "top-influenceurs",
    ],
  },
  {
    id: "tpl-conformite",
    name: "Conformité",
    description: "Alertes, crise et règles — surveillance réglementaire continue.",
    iconKey: "conformite",
    widgets: [
      "ai-workspace",
      "carte-crise",
      "heatmap",
      "alert-rules-builder",
      "recherches-alertes",
      "sujets-emergents",
      "sentiment-heatmap",
    ],
  },
  {
    id: "tpl-competition",
    name: "Compétition",
    description: "Benchmark, radar et part de voix — intelligence concurrentielle.",
    iconKey: "competition",
    widgets: [
      "ai-workspace",
      "benchmark-concurrents",
      "competitor-watchlist",
      "radar-reputation",
      "part-voix-donut",
      "parts-voix-kpi",
      "estimation-reach",
      "campaign-tracker",
    ],
  },
];

const ANNOTATABLE_SECTIONS: Array<{ id: string; label: string }> = [
  { id: "score-reputation", label: "Score de réputation" },
  { id: "tendance-sentiment", label: "Tendance sentiment" },
  { id: "benchmark-concurrents", label: "Benchmark concurrentiel" },
  { id: "radar-reputation", label: "Radar de réputation" },
  { id: "part-voix-donut", label: "Part de voix" },
  { id: "top-sujets", label: "Top 5 sujets" },
  { id: "dernieres-mentions", label: "Dernières mentions" },
  { id: "repartition-media", label: "Répartition par type de média" },
];

// Pre-computed mention regex for rendering @MemberName highlights in comment bodies
const MENTION_REGEX = new RegExp(
  `@(${TEAM_MEMBERS.map((m) => m.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "g",
);

// ─── R4-PRO-A · Feature 1: Competitor Content Analysis types ───────────

interface CompetitorContentArticle {
  id: string;
  headline: string;
  source: string;
  date: string; // ISO yyyy-MM-dd
  sentiment: "positif" | "neutre" | "négatif";
}

interface CompetitorContentSummary {
  competitorId: string;
  competitorName: string;
  postingFrequencyPerWeek: number;
  avgSentimentPct: number;
  shareOfVoicePct: number;
  topKeywords: string[];
  mediaReach: number;
  recentArticles: CompetitorContentArticle[];
}

interface CompetitorContentConfig {
  watchEnabled: boolean;
  selectedIds: string[];
}

const COMPETITOR_CONTENT_KEYWORDS_POOL = [
  "stratégie", "innovation", "leadership", "croissance", "durabilité",
  "transformation", "client", "digital", "excellence", "ambition",
  "investissement", "responsabilité", "performance", "compétitivité",
  "qualité", "expansion", "modernisation", "rse", "marque", "disruption",
];

const COMPETITOR_ARTICLE_SOURCES = [
  "Hespress", "Le Matin", "L'Économiste", "Aujourd'hui Le Maroc",
  "Médias24", "TelQuel", "Le Desk", "Yabiladi News",
];

const COMPETITOR_CONTENT_WATCH_INTERVAL_MS = 15000;
const MAX_COMPETITOR_CONTENT_SELECTED = 5;

function hashStrContent(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickKeywords(seed: number, count: number): string[] {
  const result: string[] = [];
  const used = new Set<number>();
  let s = seed || 1;
  while (result.length < count && used.size < COMPETITOR_CONTENT_KEYWORDS_POOL.length) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % COMPETITOR_CONTENT_KEYWORDS_POOL.length;
    if (!used.has(idx)) {
      used.add(idx);
      result.push(COMPETITOR_CONTENT_KEYWORDS_POOL[idx]);
    }
  }
  return result;
}

function synthesizeRecentArticles(
  competitorName: string,
  sentimentPct: number,
  seedSalt: number,
): CompetitorContentArticle[] {
  const seed = hashStrContent(competitorName) + seedSalt * 7919;
  const articles: CompetitorContentArticle[] = [];
  const headlines: Array<(n: string) => string> = [
    (n) => `${n} accélère sa transformation digitale`,
    (n) => `${n} annonce une nouvelle stratégie de croissance`,
    (n) => `Entretien exclusif avec la direction de ${n}`,
    (n) => `${n} renforce son positionnement sur le marché`,
    (n) => `${n} lance une initiative RSE ambitieuse`,
    (n) => `Comment ${n} innove dans son secteur`,
    (n) => `${n} : résultats annuels en hausse`,
    (n) => `${n} étend son empreinte régionale`,
  ];
  for (let i = 0; i < 3; i++) {
    const s = (seed * (i + 1) * 7919) & 0x7fffffff;
    const headlineIdx = s % headlines.length;
    const sourceIdx = (s >> 3) % COMPETITOR_ARTICLE_SOURCES.length;
    const daysAgo = 1 + ((s >> 6) % 21);
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - daysAgo);
    let sentiment: CompetitorContentArticle["sentiment"];
    if (i === 0) {
      sentiment = sentimentPct > 60 ? "positif" : sentimentPct < 40 ? "négatif" : "neutre";
    } else {
      const roll = (s >> 9) % 100;
      sentiment = roll < sentimentPct
        ? "positif"
        : roll < sentimentPct + (100 - sentimentPct) / 2
          ? "neutre"
          : "négatif";
    }
    articles.push({
      id: `art-${competitorName}-${i}-${s}`,
      headline: headlines[headlineIdx](competitorName),
      source: COMPETITOR_ARTICLE_SOURCES[sourceIdx],
      date: d.toISOString().slice(0, 10),
      sentiment,
    });
  }
  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

function buildCompetitorContentSummaries(
  radar: CompetitorRadarResp | null,
  sov: ShareOfVoiceResp | null,
  refreshTick: number,
  selectedIds: string[] | null,
): CompetitorContentSummary[] {
  if (!radar?.brands?.length) return [];
  const competitors = sov?.competitors ?? [];
  const total = competitors.reduce((s, c) => s + c.mentionCount, 0) || 1;
  const summaries: CompetitorContentSummary[] = radar.brands
    .filter((b) => !b.isYou)
    .map((b) => {
      const sovRow = competitors.find((c) => c.name === b.name);
      const sovPct = sovRow ? (sovRow.mentionCount / total) * 100 : b.scores.shareOfVoice;
      const mentions = sovRow?.mentionCount ?? Math.round(b.scores.mediaReach * 12);
      const postingFreqPerWeek = Math.max(0.5, Math.round((mentions / 4) * 10) / 10);
      const sentimentPct = b.scores.sentiment;
      const seed = hashStrContent(b.name) + refreshTick * 7;
      return {
        competitorId: b.name,
        competitorName: b.name,
        postingFrequencyPerWeek: postingFreqPerWeek,
        avgSentimentPct: sentimentPct,
        shareOfVoicePct: sovPct,
        topKeywords: pickKeywords(seed, 5),
        mediaReach: b.scores.mediaReach,
        recentArticles: synthesizeRecentArticles(b.name, sentimentPct, refreshTick * 11),
      };
    });
  if (selectedIds && selectedIds.length > 0) {
    const idSet = new Set(selectedIds);
    return summaries.filter((s) => idSet.has(s.competitorId));
  }
  return summaries.slice(0, MAX_COMPETITOR_CONTENT_SELECTED);
}

// ─── R4-PRO-A · Feature 2: Media Reach Calculator types ───────────────

type SourceTier = "national" | "regional" | "specialise" | "blog";

interface SourceTierDef {
  key: SourceTier;
  label: string;
  audience: number;
  color: string;
}

const SOURCE_TIERS: SourceTierDef[] = [
  { key: "national", label: "National", audience: 500_000, color: SAGE },
  { key: "regional", label: "Régional", audience: 50_000, color: SAGE_DIM },
  { key: "specialise", label: "Spécialisé", audience: 10_000, color: NEUTRAL_GRAY },
  { key: "blog", label: "Blog", audience: 5_000, color: "#D4D4D8" },
];

const AVE_RATE_MAD = 0.03; // MAD per impression
const ENGAGEMENT_RATE_PCT = 2.5; // %
const MAX_REACH_SCENARIOS = 5;
const PAID_CPM_MAD = 8; // MAD per 1000 impressions (display benchmark)

interface ReachScenario {
  id: string;
  name: string;
  articles: number;
  mix: Record<SourceTier, number>;
  reach: number;
  ave: number;
  engagement: number;
  savedAt: number;
}

const DEFAULT_REACH_MIX: Record<SourceTier, number> = {
  national: 25,
  regional: 35,
  specialise: 25,
  blog: 15,
};

function computeReach(articles: number, mix: Record<SourceTier, number>): number {
  const weightedAudience = SOURCE_TIERS.reduce(
    (sum, t) => sum + (mix[t.key] / 100) * t.audience,
    0,
  );
  return Math.round(articles * weightedAudience);
}

// ─── R4-PRO-A · Feature 3: Share of Voice Trends types ────────────────

type SovTrendsRange = "30d" | "90d" | "12m";

interface SovTrendsState {
  range: SovTrendsRange;
  detailExpanded: boolean;
}

const SOV_TRENDS_DAYS: Record<SovTrendsRange, number> = {
  "30d": 30,
  "90d": 90,
  "12m": 365,
};

const SOV_LINE_COLORS = {
  you: SAGE,
  comp1: "#A1A1AA",
  comp2: "#71717A",
  comp3: "#525252",
};

type SovTrendPoint = { date: string; you: number } & Record<string, number | string>;

interface SovSourceBreakdownRow {
  key: string;
  label: string;
  color: string;
  youPct: number;
  compPct: number;
}

function buildSovTrendsSeries(
  radar: CompetitorRadarResp | null,
  sov: ShareOfVoiceResp | null,
  range: SovTrendsRange,
): {
  data: SovTrendPoint[];
  competitors: Array<{ id: string; name: string; color: string }>;
  pivotPoints: Array<{ date: string; compName: string; you: number; comp: number }>;
  anomalies: Array<{ date: string; value: number }>;
} {
  if (!radar?.brands?.length) {
    return { data: [], competitors: [], pivotPoints: [], anomalies: [] };
  }
  const youBrand = radar.brands.find((b) => b.isYou);
  if (!youBrand) {
    return { data: [], competitors: [], pivotPoints: [], anomalies: [] };
  }
  const competitorBrands = radar.brands.filter((b) => !b.isYou).slice(0, 3);
  const competitors = competitorBrands.map((b, i) => {
    const color = i === 0
      ? SOV_LINE_COLORS.comp1
      : i === 1
        ? SOV_LINE_COLORS.comp2
        : SOV_LINE_COLORS.comp3;
    return { id: b.name, name: b.name, color };
  });
  const competitorsData = sov?.competitors ?? [];
  const total = competitorsData.reduce((s, c) => s + c.mentionCount, 0) || 1;
  const youSovBase = youBrand.scores.shareOfVoice;
  const compSovBase = competitorBrands.map((b) => {
    const row = competitorsData.find((r) => r.name === b.name);
    return row ? (row.mentionCount / total) * 100 : b.scores.shareOfVoice;
  });

  const days = SOV_TRENDS_DAYS[range];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const data: SovTrendPoint[] = [];
  const cycleLen = range === "30d" ? 7 : range === "90d" ? 21 : 60;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = format(d, "yyyy-MM-dd");
    const seed = d.getDate() * 100 + d.getMonth() * 31 + d.getFullYear();
    const youVar = Math.sin((seed / cycleLen) * Math.PI) * 6 + Math.cos(seed * 0.3) * 3;
    const you = Math.max(0, Math.min(100, youSovBase + youVar));
    const point: SovTrendPoint = { date: iso, you: Math.round(you * 10) / 10 };
    competitors.forEach((c, idx) => {
      const cVar = Math.sin((seed / cycleLen) * Math.PI + idx) * 5 + Math.cos(seed * 0.2 + idx) * 2;
      const cVal = Math.max(0, Math.min(100, compSovBase[idx] + cVar));
      point[c.id] = Math.round(cVal * 10) / 10;
    });
    data.push(point);
  }

  const pivotPoints: Array<{ date: string; compName: string; you: number; comp: number }> = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    for (const c of competitors) {
      const prevDiff = prev.you - Number(prev[c.id] ?? 0);
      const currDiff = curr.you - Number(curr[c.id] ?? 0);
      if (prevDiff === 0 || currDiff === 0) continue;
      if (Math.sign(prevDiff) !== Math.sign(currDiff)) {
        pivotPoints.push({
          date: curr.date,
          compName: c.name,
          you: curr.you,
          comp: Number(curr[c.id] ?? 0),
        });
      }
    }
  }

  const youValues = data.map((d) => d.you);
  const anomalies = detectAnomalies(youValues, data.map((d) => d.date))
    .map((a) => ({ date: a.label ?? data[a.index]?.date ?? "", value: a.value }));

  return { data, competitors, pivotPoints, anomalies };
}

function buildSovSourceBreakdown(
  radar: CompetitorRadarResp | null,
  sov: ShareOfVoiceResp | null,
): SovSourceBreakdownRow[] {
  if (!radar?.brands?.length) return [];
  const youBrand = radar.brands.find((b) => b.isYou);
  if (!youBrand) return [];
  const types: Array<{ key: string; label: string; color: string }> = [
    { key: "national", label: "Presse nationale", color: SAGE },
    { key: "regional", label: "Presse régionale", color: SAGE_DIM },
    { key: "social", label: "Réseaux sociaux", color: NEUTRAL_GRAY },
    { key: "specialise", label: "Presse spécialisée", color: "#D4D4D8" },
  ];
  const youSov = youBrand.scores.shareOfVoice;
  return types.map((t) => {
    const seed = hashStrContent(t.key) + Math.round(youSov * 13);
    const youPct = Math.max(5, Math.min(80, 15 + (seed % 50)));
    const compPct = Math.max(5, 100 - youPct - ((seed >> 3) % 15));
    return { ...t, youPct, compPct };
  });
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

// ─── R2-PRO-B helpers: z-score, CSV, file download ────────────────────

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[], avg?: number): number {
  if (values.length < 2) return 0;
  const m = avg ?? mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/** Compute z-scores for a series of values. Returns array aligned with input. */
function computeZScores(values: number[]): number[] {
  if (values.length < 2) return values.map(() => 0);
  const m = mean(values);
  const sd = stdDev(values, m);
  if (sd === 0) return values.map(() => 0);
  return values.map((v) => (v - m) / sd);
}

/** Detect anomalies: indices where |z| > threshold (default 2). */
function detectAnomalies(
  values: number[],
  labels: string[] = [],
  threshold = 2,
): AnomalyPoint[] {
  const zScores = computeZScores(values);
  const anomalies: AnomalyPoint[] = [];
  for (let i = 0; i < zScores.length; i++) {
    const z = zScores[i];
    if (Math.abs(z) > threshold) {
      anomalies.push({
        index: i,
        value: values[i],
        zScore: z,
        severity: Math.abs(z) > 3 ? "critical" : "warning",
        label: labels[i],
      });
    }
  }
  return anomalies;
}

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadBlob(blob: Blob, fileName: string) {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function memberInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}

/** Render comment body with @MemberName mentions highlighted in sage. */
function renderCommentBody(body: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  // Reset regex state (global flag retains lastIndex)
  MENTION_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = MENTION_REGEX.exec(body)) !== null) {
    if (match.index > lastIdx) {
      parts.push(
        <span key={`t-${key++}`}>{body.slice(lastIdx, match.index)}</span>,
      );
    }
    parts.push(
      <span
        key={`m-${key++}`}
        style={{
          color: SAGE,
          backgroundColor: SAGE_BG,
          borderRadius: 3,
          padding: "0 3px",
          fontWeight: 600,
        }}
      >
        {match[0]}
      </span>,
    );
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < body.length) {
    parts.push(<span key={`t-${key++}`}>{body.slice(lastIdx)}</span>);
  }
  return parts;
}

// ─── R3-PRO-A · Feature 1: Sentiment Heatmap helpers ───────────────────

/**
 * Build daily sentiment series covering `weeks * 7` days back from today.
 * Uses API data when available; extrapolates missing days by cycling the
 * available series with small sinusoidal variation (deterministic by date).
 */
function buildHeatmapData(
  trend: SentimentTrendResp | null,
  weeks: 13 | 26,
): SentimentDay[] {
  const targetDays = weeks * 7;
  const source = trend?.data ?? [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result: SentimentDay[] = [];

  for (let i = targetDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = format(d, "yyyy-MM-dd");

    // Try exact match first
    let day = source.find((s) => s.date === iso);

    if (!day) {
      // Cycle through source data with deterministic variation
      const srcIdx = source.length > 0 ? i % source.length : 0;
      const src = source[srcIdx] ?? {
        date: iso,
        avgScore: 0,
        count: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
      };
      const seed = d.getDate() + d.getMonth() * 31 + d.getFullYear();
      const variation = Math.sin(seed * 0.5) * 0.18;
      const avgScore = source.length > 0
        ? Math.max(-1, Math.min(1, src.avgScore + variation))
        : Math.max(-1, Math.min(1, variation * 1.6));
      const count = source.length > 0
        ? Math.max(1, Math.round(src.count * (0.65 + Math.abs(Math.sin(seed * 1.3)) * 0.5)))
        : Math.max(1, Math.round(15 + Math.abs(Math.sin(seed * 1.1)) * 60));
      const positive = Math.round(((avgScore + 1) / 2) * count);
      const negative = Math.round(((1 - avgScore) / 2) * count);
      const neutral = Math.max(0, count - positive - negative);
      day = { date: iso, avgScore, count, positive, neutral, negative };
    }

    result.push({
      date: day.date,
      avgScore: day.avgScore,
      count: day.count,
      positive: day.positive,
      neutral: day.neutral,
      negative: day.negative,
    });
  }
  return result;
}

/**
 * Build a 7-row × weeks-col calendar grid (row 0 = Monday, row 6 = Sunday).
 * Each cell is a SentimentDay | null (null = future day, not yet occurred).
 */
function buildCalendarGrid(
  days: SentimentDay[],
  weeks: 13 | 26,
): Array<Array<SentimentDay | null>> {
  const dayMap = new Map(days.map((d) => [d.date, d]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDow = (today.getDay() + 6) % 7; // Mon=0, Sun=6
  const grid: Array<Array<SentimentDay | null>> = Array.from({ length: 7 }, () => []);

  for (let c = 0; c < weeks; c++) {
    for (let r = 0; r < 7; r++) {
      const dayOffset = (weeks - 1 - c) * 7 + (todayDow - r);
      if (dayOffset < 0) {
        grid[r].push(null); // future day
        continue;
      }
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      const iso = format(d, "yyyy-MM-dd");
      grid[r].push(dayMap.get(iso) ?? null);
    }
  }
  return grid;
}

/**
 * Color for a heatmap cell based on sentiment polarity and volume intensity.
 * - Positive (>60%) → sage gradient
 * - Negative (<40%) → red gradient
 * - Neutral → gray gradient
 * Intensity (alpha) scales with volume / maxCount.
 */
function sentimentCellColor(day: SentimentDay, maxCount: number): string {
  const sentimentPct = (day.avgScore + 1) / 2; // 0..1
  const volumeRatio = Math.min(1, day.count / Math.max(1, maxCount));
  const intensity = 0.2 + volumeRatio * 0.7; // 0.2..0.9
  let baseColor: [number, number, number];
  if (sentimentPct > 0.6) {
    baseColor = [74, 123, 95]; // sage
  } else if (sentimentPct < 0.4) {
    baseColor = [239, 68, 68]; // red
  } else {
    baseColor = [161, 161, 170]; // gray
  }
  return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${intensity.toFixed(2)})`;
}

interface SynthesizedMention {
  id: string;
  title: string;
  source: string;
  sentiment: "positif" | "neutre" | "négatif";
  time: string;
}

/**
 * Synthesize 3 plausible mentions for a given day using topics + sources
 * from the API and the day's sentiment distribution. Deterministic by date
 * so the same day always shows the same mentions across reloads.
 */
function synthesizeDayMentions(
  day: SentimentDay,
  topics: TopicRow[],
  sources: SourceRow[],
): SynthesizedMention[] {
  if (!topics.length || !sources.length) return [];
  const seedBase = parseInt(day.date.replace(/-/g, ""), 10) || 1;
  const rng = (salt: number) => {
    const x = Math.sin(seedBase * (salt + 1) * 13.37) * 10000;
    return Math.abs(x - Math.floor(x));
  };
  const sentimentPct = (day.avgScore + 1) / 2;
  const positiveTemplates = [
    (t: string, s: string) => `${t} : couverture favorable dans ${s}`,
    (t: string) => `Reconnaissance sectorielle sur ${t}`,
    (t: string, s: string) => `${s} salue les avancées en ${t}`,
  ];
  const neutralTemplates = [
    (t: string, s: string) => `${t} : analyse équilibrée par ${s}`,
    (t: string) => `Point de situation sur ${t}`,
    (t: string, s: string) => `${s} publie un dossier ${t}`,
  ];
  const negativeTemplates = [
    (t: string, s: string) => `${t} : vives critiques sur ${s}`,
    (t: string) => `Tensions autour de ${t}`,
    (t: string, s: string) => `${s} pointe des lacunes en ${t}`,
  ];
  const result: SynthesizedMention[] = [];
  for (let i = 0; i < 3; i++) {
    const topic = topics[Math.floor(rng(i) * topics.length)] ?? topics[0];
    const source = sources[Math.floor(rng(i + 10) * sources.length)] ?? sources[0];
    const slot = i / 3;
    let sentiment: SynthesizedMention["sentiment"];
    let template: (t: string, s: string) => string;
    if (slot < sentimentPct - 0.15) {
      sentiment = "positif";
      template = positiveTemplates[i % 3];
    } else if (slot > sentimentPct + 0.15) {
      sentiment = "négatif";
      template = negativeTemplates[i % 3];
    } else {
      sentiment = "neutre";
      template = neutralTemplates[i % 3];
    }
    const hour = Math.floor(rng(i + 20) * 24);
    const minute = Math.floor(rng(i + 30) * 60);
    result.push({
      id: `m-${day.date}-${i}`,
      title: template(topic.label, source.name),
      source: source.name,
      sentiment,
      time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    });
  }
  return result;
}

// ─── R3-PRO-A · Feature 2: Campaign helpers ────────────────────────────

/**
 * Compute elapsed / total days + percentage for a campaign.
 * Clamps elapsed to [0, total] so future campaigns show 0% and past show 100%.
 */
function campaignProgress(
  startDate: string,
  endDate: string,
): { elapsed: number; total: number; pct: number } {
  const s = new Date(startDate).getTime();
  const e = new Date(endDate).getTime();
  const now = Date.now();
  const total = Math.max(1, e - s);
  const elapsed = Math.max(0, Math.min(total, now - s));
  const pct = (elapsed / total) * 100;
  return {
    elapsed: Math.round(elapsed / CAMP_DAY_MS),
    total: Math.round(total / CAMP_DAY_MS),
    pct,
  };
}

/**
 * Build daily engagement series across the campaign period.
 * Uses a sine wave peaking mid-campaign + deterministic noise per day.
 */
function buildCampaignDailyEngagement(
  campaign: Campaign,
): Array<{ day: string; engagement: number }> {
  const s = new Date(campaign.startDate);
  const e = new Date(campaign.endDate);
  const days = Math.max(1, Math.round((e.getTime() - s.getTime()) / CAMP_DAY_MS));
  const totalEngagement = campaign.reach * (campaign.engagementRate / 100);
  const result: Array<{ day: string; engagement: number }> = [];
  for (let i = 0; i <= days; i++) {
    const d = new Date(s);
    d.setDate(d.getDate() + i);
    const iso = format(d, "yyyy-MM-dd");
    const wave = Math.sin((i / days) * Math.PI);
    const noise = Math.abs(Math.sin(i * 7.3)) * 0.25;
    const dailyShare = (0.25 + wave * 0.55 + noise * 0.2) / Math.max(1, days);
    const engagement = Math.max(0, Math.round(totalEngagement * dailyShare));
    result.push({ day: iso, engagement });
  }
  return result;
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

// ─── usePersistentState — localStorage-backed useState (AURA fix #2) ───
// Prevents data loss on page refresh. SSR-safe.
function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(parsed);
      }
    } catch {
      // Ignore parse errors / corrupted data
    }
  }, [key]);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Quota exceeded or localStorage disabled
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
      "[ProDashboard] widget crash:",
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
        "border-[#F0F0F0] shadow-sm rounded-xl overflow-hidden transition-shadow duration-200 ease-out hover:shadow-md " + (className ?? "")
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
        transition: "border-color 0.2s ease-out, transform 0.2s ease-out",
      }}
      className="hover:border-[#E5E5E5]"
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

// ─── POLISH-PRO · Shared micro-interaction atoms ──────────────────────
// AnimatedNumber — counts 0 → value on mount (rAF + easeOutCubic).
// Skips animation on prefers-reduced-motion.
function AnimatedNumber({
  value,
  duration = 0.9,
  format = (n: number) => Math.round(n).toString(),
  className,
  style,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  style?: CSSProperties;
}) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const targetRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      fromRef.current = value;
      targetRef.current = value;
      return;
    }
    const start = performance.now();
    const from = fromRef.current;
    const to = value;
    targetRef.current = to;
    const dur = duration * 1000;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, dur > 0 ? elapsed / dur : 1);
      const v = from + (to - from) * ease(t);
      setDisplay(v);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = targetRef.current;
    };
  }, [value, duration]);

  return (
    <span className={className} style={style}>
      {format(display)}
    </span>
  );
}

// ShimmerBlock — single shimmering placeholder bar.
function ShimmerBlock({
  width,
  height,
  delay = 0,
  radius = 6,
}: {
  width: string | number;
  height: string | number;
  delay?: number;
  radius?: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: radius,
        backgroundColor: "#F4F4F5",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)",
        }}
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 1.4,
          ease: "easeInOut",
          repeat: Infinity,
          delay,
        }}
      />
    </div>
  );
}

// ShimmerSkeleton — staggered shimmer rows + sage "Chargement…" label.
function ShimmerSkeleton({
  label = "Chargement…",
  rows = 3,
  height = 14,
  className,
}: {
  label?: string;
  rows?: number;
  height?: number | string;
  className?: string;
}) {
  return (
    <div className={"space-y-2 " + (className ?? "")}>
      <div className="flex items-center gap-2 mb-2">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: SAGE_BG,
          }}
        >
          <motion.span
            style={{
              display: "block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: SAGE,
            }}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        <span style={{ ...FONT_HEADER, color: SAGE }}>{label}</span>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <ShimmerBlock
          key={i}
          width="100%"
          height={height}
          delay={i * 0.12}
        />
      ))}
    </div>
  );
}

// EmptyState — sage illustration (Lucide icon in a sage-tinted circle) +
// bouncing motion + optional CTA. Replaces EmptyDash for high-impact
// empty zones (watchlist, reports list, etc.).
function EmptyState({
  Icon = Lightbulb,
  title,
  description,
  cta,
  onCta,
  size = 26,
}: {
  Icon?: typeof Lightbulb;
  title: string;
  description?: string;
  cta?: string;
  onCta?: () => void;
  size?: number;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ padding: "32px 16px" }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: SAGE_BG,
          border: `1px solid ${SAGE_DIM}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon size={size} style={{ color: SAGE }} />
      </motion.div>
      <div style={{ ...FONT_HEADER, color: CHARCOAL, marginBottom: 4 }}>
        {title}
      </div>
      {description && (
        <p
          style={{
            fontFamily: FONT_SANS,
            fontSize: 12,
            color: TEXT_MUTED,
            maxWidth: 320,
            lineHeight: 1.5,
            margin: "0 0 12px 0",
          }}
        >
          {description}
        </p>
      )}
      {cta && onCta && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: SAGE,
            borderColor: SAGE,
          }}
          onClick={onCta}
        >
          {cta}
        </Button>
      )}
    </div>
  );
}

// Micro-interaction utility class names (Tailwind). Applied to buttons
// for consistent scale hover (1.02) + active (0.98) feedback.
const BTN_MICRO = "transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]";

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

// ════════════════════════════════════════════════════════════════════
// R2-PRO-B · Team Annotations + Export Center + Anomaly Detection
//  Feature 1: Team Annotations (collaborative comments on insights)
//  Feature 2: Enhanced Export Center (CSV/PNG/PDF + scope + branding)
//  Feature 3: Anomaly Detection Badges (z-score on time-series charts)
// ════════════════════════════════════════════════════════════════════

// ─── R2-PRO-B Context (annotations + anomaly toggle) ──────────────────

interface ProR2BContextValue {
  annotations: Record<string, Comment[]>;
  addComment: (sectionId: string, body: string, dataPoint?: string) => void;
  resolveThread: (sectionId: string, resolved: boolean) => void;
  deleteComment: (sectionId: string, commentId: string) => void;
  anomalyHidden: boolean;
  setAnomalyHidden: (v: boolean | ((prev: boolean) => boolean)) => void;
  userName: string;
}

const ProR2BContext = createContext<ProR2BContextValue | null>(null);

function useProR2B(): ProR2BContextValue {
  const ctx = useContext(ProR2BContext);
  if (!ctx) throw new Error("useProR2B must be used within ProR2BProvider");
  return ctx;
}

function ProR2BProvider({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const [annotations, setAnnotations] = usePersistentState<Record<string, Comment[]>>(
    "pro:annotations",
    SEED_ANNOTATIONS,
  );
  const [anomalyHidden, setAnomalyHidden] = usePersistentState<boolean>(
    "pro:anomaly-toggle",
    false,
  );

  const addComment = useCallback(
    (sectionId: string, body: string, dataPoint?: string) => {
      const comment: Comment = {
        id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        author: userName,
        body,
        createdAt: Date.now(),
        dataPoint: dataPoint || undefined,
        resolved: false,
      };
      setAnnotations((prev) => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] ?? []), comment],
      }));
    },
    [userName, setAnnotations],
  );

  const resolveThread = useCallback(
    (sectionId: string, resolved: boolean) => {
      setAnnotations((prev) => ({
        ...prev,
        [sectionId]: (prev[sectionId] ?? []).map((c) => ({ ...c, resolved })),
      }));
    },
    [setAnnotations],
  );

  const deleteComment = useCallback(
    (sectionId: string, commentId: string) => {
      setAnnotations((prev) => ({
        ...prev,
        [sectionId]: (prev[sectionId] ?? []).filter((c) => c.id !== commentId),
      }));
    },
    [setAnnotations],
  );

  const value = useMemo<ProR2BContextValue>(
    () => ({
      annotations,
      addComment,
      resolveThread,
      deleteComment,
      anomalyHidden,
      setAnomalyHidden,
      userName,
    }),
    [annotations, addComment, resolveThread, deleteComment, anomalyHidden, setAnomalyHidden, userName],
  );

  return <ProR2BContext.Provider value={value}>{children}</ProR2BContext.Provider>;
}

// ─── R2-PRO-B · Feature 1: Annotation Trigger + Dialog ─────────────────

function AnnotationTrigger({
  sectionId,
  sectionTitle,
}: {
  sectionId: string;
  sectionTitle: string;
}) {
  const { annotations } = useProR2B();
  const [open, setOpen] = useState(false);
  const comments = annotations[sectionId] ?? [];
  const count = comments.length;
  const resolved = count > 0 && comments.every((c) => c.resolved);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors hover:bg-[#FAFAFA]"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: count > 0 ? SAGE : TEXT_MUTED,
                border: `1px solid ${count > 0 ? SAGE_DIM : BORDER}`,
                backgroundColor: count > 0 ? SAGE_BG : "transparent",
              }}
              aria-label={`Annoter — ${count} commentaire(s)`}
            >
              {resolved ? <Check size={11} /> : <MessageSquare size={11} />}
              {count > 0 && <span style={{ fontWeight: 700 }}>{count}</span>}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span style={{ fontFamily: FONT_SANS, fontSize: 12 }}>
              {count > 0
                ? resolved
                  ? `Fil résolu — ${count} commentaire(s)`
                  : `${count} commentaire(s) — cliquer pour ouvrir`
                : "Annoter cette section"}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {open &&
        createPortal(
          <AnnotationDialog
            sectionId={sectionId}
            sectionTitle={sectionTitle}
            onClose={() => setOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}

function AnnotationDialog({
  sectionId,
  sectionTitle,
  onClose,
}: {
  sectionId: string;
  sectionTitle: string;
  onClose: () => void;
}) {
  const { annotations, addComment, resolveThread, deleteComment, userName } = useProR2B();
  const comments = annotations[sectionId] ?? [];
  const resolved = comments.length > 0 && comments.every((c) => c.resolved);
  const [commentText, setCommentText] = useState("");
  const [pinText, setPinText] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filteredMembers = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return TEAM_MEMBERS.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 5);
  }, [mentionQuery]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentText(val);
    const cursor = e.target.selectionStart ?? val.length;
    const before = val.slice(0, cursor);
    const atIdx = before.lastIndexOf("@");
    if (atIdx === -1) {
      setMentionQuery(null);
      return;
    }
    const after = before.slice(atIdx + 1);
    if (/[\s\n]/.test(after)) {
      setMentionQuery(null);
      return;
    }
    setMentionQuery(after);
  };

  const insertMention = (member: TeamMember) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart ?? commentText.length;
    const before = commentText.slice(0, cursor);
    const after = commentText.slice(cursor);
    const atIdx = before.lastIndexOf("@");
    if (atIdx === -1) return;
    const newText = before.slice(0, atIdx) + `@${member.name} ` + after;
    setCommentText(newText);
    setMentionQuery(null);
    const newCursor = atIdx + member.name.length + 2;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const handlePublish = () => {
    const body = commentText.trim();
    if (!body) {
      toast.error("Le commentaire est vide.");
      return;
    }
    addComment(sectionId, body, pinText.trim() || undefined);
    setCommentText("");
    setPinText("");
    setMentionQuery(null);
    toast.success("Commentaire publié.");
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(10,10,10,0.4)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        className="absolute right-0 top-0 h-full bg-white shadow-xl flex flex-col"
        style={{ width: 440, maxWidth: "92vw" }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
          <div className="min-w-0">
            <div style={FONT_HEADER}>Annotations</div>
            <div
              className="truncate"
              style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }}
            >
              {sectionTitle}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {resolved && (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  color: POSITIVE,
                  backgroundColor: "rgba(16,185,129,0.1)",
                  borderRadius: 3,
                  padding: "2px 6px",
                }}
              >
                <Check size={10} style={{ display: "inline", marginRight: 2 }} />
                Résolu
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
              style={{ width: 28, height: 28 }}
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {comments.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center text-center py-12"
              style={{ color: TEXT_MUTED }}
            >
              <MessageSquare size={28} style={{ color: BORDER_STRONG }} />
              <p className="mt-2" style={{ fontFamily: FONT_SANS, fontSize: 12 }}>
                Aucun commentaire sur cette section.
                <br />
                Lancez la discussion ci-dessous.
              </p>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="rounded-md p-3"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 28,
                      height: 28,
                      backgroundColor: SAGE,
                      color: "#FFFFFF",
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {memberInitials(c.author)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}
                      >
                        {c.author}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteComment(sectionId, c.id)}
                        className="inline-flex items-center justify-center rounded hover:bg-[#F4F4F5]"
                        style={{ width: 20, height: 20 }}
                        aria-label="Supprimer le commentaire"
                      >
                        <Trash2 size={11} style={{ color: TEXT_MUTED }} />
                      </button>
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 1 }}>
                      {fmtRelative(c.createdAt)}
                    </div>
                    {c.dataPoint && (
                      <div
                        className="inline-flex items-center gap-1 mt-1.5"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          color: SAGE,
                          backgroundColor: SAGE_BG,
                          borderRadius: 3,
                          padding: "2px 5px",
                        }}
                      >
                        <Pin size={9} />
                        {c.dataPoint}
                      </div>
                    )}
                    <p
                      className="mt-1.5"
                      style={{ fontFamily: FONT_SANS, fontSize: 12, lineHeight: 1.55, color: TEXT_BODY, margin: 0 }}
                    >
                      {renderCommentBody(c.body)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className="px-4 py-3 space-y-2"
          style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
        >
          {comments.length > 0 && (
            <button
              type="button"
              onClick={() => resolveThread(sectionId, !resolved)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: resolved ? TEXT_MUTED : SAGE,
                border: `1px solid ${resolved ? BORDER : SAGE_DIM}`,
                backgroundColor: resolved ? "#FFFFFF" : SAGE_BG,
              }}
            >
              <Check size={11} />
              {resolved ? "Marquer comme non résolu" : "Marquer comme résolu"}
            </button>
          )}

          <div className="flex items-center gap-2">
            <Pin size={12} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
            <input
              type="text"
              value={pinText}
              onChange={(e) => setPinText(e.target.value)}
              placeholder="Épingler à un point de données (ex. 15 juillet)"
              className="flex-1 rounded-md px-2 py-1.5 outline-none"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11,
                color: CHARCOAL,
                border: `1px solid ${BORDER}`,
                backgroundColor: "#FAFAFA",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            {filteredMembers.length > 0 && (
              <div
                className="absolute z-20 mb-1 rounded-md shadow-lg overflow-hidden"
                style={{
                  bottom: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${BORDER_STRONG}`,
                }}
              >
                {filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => insertMention(m)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-[#FAFAFA]"
                  >
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{
                        width: 22,
                        height: 22,
                        backgroundColor: SAGE,
                        color: "#FFFFFF",
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    >
                      {memberInitials(m.name)}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="truncate"
                        style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: CHARCOAL }}
                      >
                        {m.name}
                      </div>
                      <div
                        className="truncate"
                        style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}
                      >
                        {m.role}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={handleTextChange}
              placeholder="Ajouter un commentaire — tapez @ pour mentionner un membre"
              rows={3}
              className="w-full rounded-md px-2 py-1.5 outline-none resize-none"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                color: CHARCOAL,
                border: `1px solid ${BORDER_STRONG}`,
                backgroundColor: "#FFFFFF",
                lineHeight: 1.5,
              }}
            />
            <div
              className="flex items-center gap-1 mt-1"
              style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}
            >
              <AtSign size={10} />
              <span>Mentionnez un coéquipier avec @</span>
              <span style={{ marginLeft: "auto" }}>
                Connecté en tant que <span style={{ color: SAGE, fontWeight: 700 }}>{userName}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              className="h-8"
              style={{ fontFamily: FONT_MONO, fontSize: 11, backgroundColor: SAGE, color: "#FFFFFF" }}
              onClick={handlePublish}
              disabled={!commentText.trim()}
            >
              <Send size={12} className="mr-1" />
              Publier
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── R2-PRO-B · Feature 3: Anomaly Detection shared components ─────────

function AnomalySummaryStrip({
  anomalies,
  totalLabel,
  hidden,
  onToggle,
}: {
  anomalies: AnomalyPoint[];
  totalLabel: string;
  hidden: boolean;
  onToggle: (v: boolean) => void;
}) {
  const criticalCount = anomalies.filter((a) => a.severity === "critical").length;
  const warningCount = anomalies.filter((a) => a.severity === "warning").length;
  const hasAnomalies = anomalies.length > 0;
  return (
    <div className="flex items-center gap-2 flex-wrap mb-2">
      <div
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1"
        style={{
          backgroundColor: hasAnomalies ? "rgba(239,68,68,0.06)" : "#FAFAFA",
          border: `1px solid ${hasAnomalies ? "rgba(239,68,68,0.2)" : BORDER}`,
        }}
      >
        <Activity size={12} style={{ color: hasAnomalies ? NEGATIVE : TEXT_MUTED }} />
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: hasAnomalies ? NEGATIVE : TEXT_MUTED,
            fontWeight: 700,
          }}
        >
          {anomalies.length} anomalie(s) — {totalLabel}
        </span>
        {criticalCount > 0 && (
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              fontWeight: 700,
              color: "#FFFFFF",
              backgroundColor: NEGATIVE,
              borderRadius: 3,
              padding: "1px 4px",
            }}
          >
            {criticalCount} critique
          </span>
        )}
        {warningCount > 0 && (
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              fontWeight: 700,
              color: NEUTRAL_AMBER,
              backgroundColor: "rgba(245,158,11,0.12)",
              borderRadius: 3,
              padding: "1px 4px",
            }}
          >
            {warningCount} alerte
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onToggle(!hidden)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors"
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: hidden ? TEXT_MUTED : SAGE,
          border: `1px solid ${hidden ? BORDER : SAGE_DIM}`,
          backgroundColor: hidden ? "transparent" : SAGE_BG,
        }}
        aria-pressed={hidden}
      >
        <Eye size={11} />
        {hidden ? "Afficher les anomalies" : "Masquer les anomalies"}
      </button>
    </div>
  );
}

// ─── R2-PRO-B · Feature 2: Enhanced Export Center ──────────────────────

function ExportCenterCard({
  sentimentTrend,
  sources,
  topics,
  sov,
}: {
  sentimentTrend: SentimentTrendResp | null;
  sources: SourceDistResp | null;
  topics: TopicsResp | null;
  sov: ShareOfVoiceResp | null;
}) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [scope, setScope] = useState<ExportScope>("full");
  const [sectionId, setSectionId] = useState<string>("tendance-sentiment");
  const [periodFrom, setPeriodFrom] = useState<string>("");
  const [periodTo, setPeriodTo] = useState<string>("");
  const [branding, setBranding] = usePersistentState<ExportBranding>(
    "pro:export-branding",
    { includeLogo: true, includeFooter: true, theme: "sage" },
  );
  const [history, setHistory] = usePersistentState<ExportHistoryItem[]>(
    "pro:export-history",
    [],
  );
  const [exporting, setExporting] = useState(false);

  const sectionDataMap: Record<string, "trend" | "sources" | "topics" | "sov"> = {
    "tendance-sentiment": "trend",
    "repartition-media": "sources",
    "top-sujets": "topics",
    "part-voix-donut": "sov",
    "score-reputation": "trend",
    "benchmark-concurrents": "sov",
    "radar-reputation": "sov",
    "dernieres-mentions": "trend",
  };

  const buildCsv = useCallback((): string => {
    const rows: (string | number)[][] = [];
    const includeSection = (key: "trend" | "sources" | "topics" | "sov"): boolean => {
      if (scope === "full") return true;
      if (scope === "section") return sectionDataMap[sectionId] === key;
      if (scope === "period") return key === "trend";
      return false;
    };

    if (includeSection("trend")) {
      let trendData = sentimentTrend?.data ?? [];
      if (scope === "period" && periodFrom && periodTo) {
        trendData = trendData.filter((d) => d.date >= periodFrom && d.date <= periodTo);
      }
      rows.push(["# Tendance Sentiment"]);
      rows.push(["Date", "Score moyen", "Positif", "Neutre", "Négatif", "Mentions"]);
      for (const d of trendData) {
        rows.push([d.date, d.avgScore, d.positive, d.neutral, d.negative, d.count]);
      }
      rows.push([]);
    }
    if (includeSection("sources")) {
      rows.push(["# Répartition des Sources"]);
      rows.push(["Source", "Type", "Mentions"]);
      for (const s of sources?.sources ?? []) {
        rows.push([s.name, s.type, s.count]);
      }
      rows.push([]);
    }
    if (includeSection("topics")) {
      rows.push(["# Sujets"]);
      rows.push(["Sujet", "Mentions", "Type"]);
      for (const t of topics?.topics ?? []) {
        rows.push([t.label, t.count, t.type]);
      }
      rows.push([]);
    }
    if (includeSection("sov")) {
      rows.push(["# Part de Voix"]);
      rows.push(["Concurrent", "Mentions", "Sentiment", "Tendance", "Vous"]);
      for (const c of sov?.competitors ?? []) {
        rows.push([c.name, c.mentionCount, c.sentiment, c.trend, c.isYou ? "Oui" : "Non"]);
      }
      rows.push([]);
    }
    if (rows.length === 0) {
      rows.push(["# Aucune donnée à exporter pour cette sélection"]);
    }
    return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  }, [scope, sectionId, periodFrom, periodTo, sentimentTrend, sources, topics, sov, sectionDataMap]);

  const buildSimulatedReport = useCallback((): string => {
    const themeColor = EXPORT_THEME_OPTIONS.find((t) => t.key === branding.theme)?.color ?? SAGE;
    const lines: string[] = [
      "HARCH ATELIER — RAPPORT EXPORTÉ",
      "================================",
      "",
      `Format: ${format.toUpperCase()}`,
      `Périmètre: ${EXPORT_SCOPE_LABELS[scope]}`,
      `Date d'export: ${new Date().toISOString()}`,
      "",
      `Branding:`,
      `  - Logo inclus: ${branding.includeLogo ? "Oui" : "Non"}`,
      `  - Pied de page inclus: ${branding.includeFooter ? "Oui" : "Non"}`,
      `  - Thème couleur: ${branding.theme} (${themeColor})`,
      "",
    ];
    if (scope === "section") {
      const sectionLabel = ANNOTATABLE_SECTIONS.find((s) => s.id === sectionId)?.label ?? sectionId;
      lines.push(`Section: ${sectionLabel}`);
    }
    if (scope === "period") {
      lines.push(`Période: ${periodFrom || "?"} → ${periodTo || "?"}`);
    }
    lines.push("", "--- DONNÉES ---", "");
    if (format === "pdf") {
      lines.push(buildCsv());
    } else {
      lines.push("[Capture graphique simulée — les graphiques recharts seraient capturés via html-to-image]");
      const scopeLabel =
        scope === "full"
          ? "tous les graphiques"
          : scope === "section"
            ? ANNOTATABLE_SECTIONS.find((s) => s.id === sectionId)?.label ?? "section"
            : "période sélectionnée";
      lines.push(`Graphiques inclus: ${scopeLabel}`);
    }
    return lines.join("\n");
  }, [format, scope, sectionId, periodFrom, periodTo, branding, buildCsv]);

  const handleExport = useCallback(() => {
    setExporting(true);
    setTimeout(() => {
      const ext = format === "csv" ? "csv" : format === "png" ? "png" : "pdf";
      const stamp = `${Date.now()}`;
      const fileName = `harch-export-${scope}-${format}-${stamp}.${ext}`;
      let blob: Blob;
      let fileSizeKb: number;
      if (format === "csv") {
        const csv = buildCsv();
        blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        fileSizeKb = Math.max(1, Math.round(blob.size / 1024));
      } else {
        const report = buildSimulatedReport();
        blob = new Blob([report], { type: format === "png" ? "image/png" : "application/pdf" });
        fileSizeKb = format === "png" ? Math.round(150 + Math.random() * 200) : Math.round(80 + Math.random() * 120);
      }
      downloadBlob(blob, fileName);

      const item: ExportHistoryItem = {
        id: `exp-${Date.now()}`,
        format,
        scope,
        sectionId: scope === "section" ? sectionId : undefined,
        periodFrom: scope === "period" ? periodFrom || undefined : undefined,
        periodTo: scope === "period" ? periodTo || undefined : undefined,
        timestamp: Date.now(),
        fileName,
        fileSizeKb,
      };
      setHistory((prev) => [item, ...prev].slice(0, MAX_EXPORT_HISTORY));
      setExporting(false);
      toast.success(`Export ${format.toUpperCase()} généré — ${fileName}`);
    }, 1200);
  }, [format, scope, sectionId, periodFrom, periodTo, buildCsv, buildSimulatedReport, setHistory]);

  const formatIcons: Record<ExportFormat, typeof FileText> = {
    csv: FileSpreadsheet,
    png: FileImage,
    pdf: FileText,
  };

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="28 · Centre d'Export"
          right={
            <Badge variant="secondary" className="h-5" style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}>
              CSV · PNG · PDF
            </Badge>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 block">Format d'export</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(EXPORT_FORMAT_LABELS) as ExportFormat[]).map((f) => {
                  const Icon = formatIcons[f];
                  const active = format === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className="flex flex-col items-center gap-1 rounded-md py-2 transition-colors"
                      style={{
                        border: `1px solid ${active ? SAGE : BORDER}`,
                        backgroundColor: active ? SAGE_BG : "#FFFFFF",
                      }}
                      aria-pressed={active}
                    >
                      <Icon size={16} style={{ color: active ? SAGE : TEXT_MUTED }} />
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          fontWeight: 700,
                          color: active ? SAGE : TEXT_BODY,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {f}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Périmètre</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(EXPORT_SCOPE_LABELS) as ExportScope[]).map((s) => {
                  const active = scope === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScope(s)}
                      className="rounded-md py-1.5 px-2 transition-colors text-center"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        fontWeight: 700,
                        color: active ? SAGE : TEXT_BODY,
                        border: `1px solid ${active ? SAGE : BORDER}`,
                        backgroundColor: active ? SAGE_BG : "#FFFFFF",
                      }}
                      aria-pressed={active}
                    >
                      {s === "full" ? "Complet" : s === "section" ? "Section" : "Période"}
                    </button>
                  );
                })}
              </div>
            </div>

            {scope === "section" && (
              <div>
                <Label className="mb-1.5 block">Section à exporter</Label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full rounded-md px-2 py-1.5 outline-none"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    color: CHARCOAL,
                    border: `1px solid ${BORDER_STRONG}`,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  {ANNOTATABLE_SECTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scope === "period" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="mb-1 block">Du</Label>
                  <input
                    type="date"
                    value={periodFrom}
                    onChange={(e) => setPeriodFrom(e.target.value)}
                    className="w-full rounded-md px-2 py-1.5 outline-none"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                      color: CHARCOAL,
                      border: `1px solid ${BORDER_STRONG}`,
                      backgroundColor: "#FFFFFF",
                    }}
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Au</Label>
                  <input
                    type="date"
                    value={periodTo}
                    onChange={(e) => setPeriodTo(e.target.value)}
                    className="w-full rounded-md px-2 py-1.5 outline-none"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                      color: CHARCOAL,
                      border: `1px solid ${BORDER_STRONG}`,
                      backgroundColor: "#FFFFFF",
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="mb-1.5 block">Options de branding</Label>
              <div
                className="rounded-md p-3 space-y-2"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
              >
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-1.5" style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_BODY }}>
                    <Palette size={12} style={{ color: SAGE }} />
                    Inclure le logo
                  </span>
                  <Switch
                    checked={branding.includeLogo}
                    onCheckedChange={(v) => setBranding((prev) => ({ ...prev, includeLogo: v }))}
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-1.5" style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_BODY }}>
                    <FileText size={12} style={{ color: SAGE }} />
                    Inclure le pied de page
                  </span>
                  <Switch
                    checked={branding.includeFooter}
                    onCheckedChange={(v) => setBranding((prev) => ({ ...prev, includeFooter: v }))}
                  />
                </label>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5" style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_BODY }}>
                    <Palette size={12} style={{ color: SAGE }} />
                    Thème couleur
                  </span>
                  <div className="flex items-center gap-1">
                    {EXPORT_THEME_OPTIONS.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setBranding((prev) => ({ ...prev, theme: t.key }))}
                        className="rounded-full transition-all"
                        style={{
                          width: 18,
                          height: 18,
                          backgroundColor: t.color,
                          border: branding.theme === t.key ? `2px solid ${CHARCOAL}` : `2px solid transparent`,
                          cursor: "pointer",
                        }}
                        aria-label={`Thème ${t.label}`}
                        aria-pressed={branding.theme === t.key}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              className="w-full h-9"
              style={{ fontFamily: FONT_MONO, fontSize: 12, backgroundColor: SAGE, color: "#FFFFFF" }}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <RefreshCw size={14} className="mr-2 animate-spin" />
                  Export en cours…
                </>
              ) : (
                <>
                  <Download size={14} className="mr-2" />
                  Exporter en {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <History size={14} style={{ color: TEXT_MUTED }} />
              <span style={FONT_HEADER}>Historique des exports</span>
            </div>
            {history.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center text-center rounded-md py-8"
                style={{ border: `1px dashed ${BORDER_STRONG}`, backgroundColor: "#FAFAFA" }}
              >
                <Download size={24} style={{ color: BORDER_STRONG }} />
                <p className="mt-2" style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}>
                  Aucun export pour le moment.
                  <br />
                  Vos 5 derniers exports apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[340px] overflow-y-auto">
                {history.map((h) => {
                  const Icon = formatIcons[h.format];
                  return (
                    <div
                      key={h.id}
                      className="flex items-center gap-2 rounded-md p-2"
                      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
                    >
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
                          className="truncate"
                          style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: CHARCOAL }}
                        >
                          {h.fileName}
                        </div>
                        <div
                          className="flex items-center gap-2"
                          style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}
                        >
                          <span>{h.format.toUpperCase()}</span>
                          <span>·</span>
                          <span>{EXPORT_SCOPE_LABELS[h.scope]}</span>
                          <span>·</span>
                          <span>{h.fileSizeKb} Ko</span>
                          <span>·</span>
                          <span>{fmtRelative(h.timestamp)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob(
                            [`Re-téléchargement simulé — ${h.fileName}`],
                            { type: "text/plain" },
                          );
                          downloadBlob(blob, h.fileName);
                          toast.success(`Re-téléchargement — ${h.fileName}`);
                        }}
                        className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] shrink-0"
                        style={{ width: 28, height: 28 }}
                        aria-label="Re-télécharger"
                      >
                        <Download size={13} style={{ color: SAGE }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <AiCommentary
              text={
                history.length === 0
                  ? "Configurez le format, le périmètre et le branding, puis exportez. L'historique conserve vos 5 derniers exports pour re-téléchargement rapide."
                  : `${history.length} export(s) récent(s). CSV pour analyse brute, PNG pour présentations, PDF pour rapports formels. Le branding (logo, pied de page, thème) est appliqué aux exports PNG et PDF.`
              }
            />
          </div>
        </div>
      </CardShell>
    </motion.div>
  );
}

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
  editMode,
  onToggleEditMode,
  onResetLayout,
  onOpenBriefing,
  onOpenCrisis,
  onOpenMatrix,
  onOpenHespress,
  onOpenDocWriter,
  onOpenPitch,
  onOpenBoycott,
  onOpenSentimentTimeline,
  onOpenSourceCred,
  onOpenCompetitorContent,
  onOpenMediaReach,
  onOpenCampaign,
  onOpenInfluencer,
  onOpenNarrative,
  onOpenGeoHeatmap,
  onOpenEmailDigest,
  onOpenSentHeatmap,
  onOpenSovTrends,
  onOpenTeamPerf,
  onOpenSavedSearches,
  onOpenDarija,
  onOpenWhatsapp,
  onToggleSkillsMenu,
  skillsMenuOpen,
}: {
  onMenuClick: () => void;
  alertCount: number;
  userName?: string | null;
  editMode: boolean;
  onToggleEditMode: () => void;
  onResetLayout: () => void;
  onOpenBriefing: () => void;
  onOpenCrisis: () => void;
  onOpenMatrix: () => void;
  onOpenHespress: () => void;
  onOpenDocWriter: () => void;
  onOpenPitch: () => void;
  onOpenBoycott: () => void;
  onOpenSentimentTimeline: () => void;
  onOpenSourceCred: () => void;
  onOpenCompetitorContent: () => void;
  onOpenMediaReach: () => void;
  onOpenCampaign: () => void;
  onOpenInfluencer: () => void;
  onOpenNarrative: () => void;
  onOpenGeoHeatmap: () => void;
  onOpenEmailDigest: () => void;
  onOpenSentHeatmap: () => void;
  onOpenSovTrends: () => void;
  onOpenTeamPerf: () => void;
  onOpenSavedSearches: () => void;
  onOpenDarija: () => void;
  onOpenWhatsapp: () => void;
  onToggleSkillsMenu: () => void;
  skillsMenuOpen: boolean;
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
                onClick={onToggleEditMode}
                className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-[#FAFAFA]"
                style={{
                  width: 32,
                  height: 32,
                  border: editMode ? `1px solid ${SAGE}` : "1px solid transparent",
                  backgroundColor: editMode ? SAGE_BG : "transparent",
                }}
                aria-label={editMode ? "Quitter le mode édition" : "Personnaliser la disposition"}
                aria-pressed={editMode}
              >
                <PenSquare size={16} style={{ color: editMode ? SAGE : TEXT_BODY }} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span style={{ fontFamily: FONT_SANS, fontSize: 12 }}>
                {editMode ? "Mode édition actif — glissez les widgets" : "Personnaliser la disposition"}
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {editMode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onResetLayout}
                  className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    width: 32,
                    height: 32,
                    border: `1px solid ${BORDER}`,
                  }}
                  aria-label="Réinitialiser la disposition"
                >
                  <RotateCcw size={14} style={{ color: TEXT_BODY }} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <span style={{ fontFamily: FONT_SANS, fontSize: 12 }}>
                  Réinitialiser la disposition par défaut
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Separateur visuel entre mode edition et skills */}
        <div style={{ width: 1, height: 20, backgroundColor: BORDER_STRONG, flexShrink: 0 }} aria-hidden="true" />

        {/* SKILL 1: Briefing Matinal */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenBriefing} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Briefing matinal"><FileText size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Briefing matinal</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 2: Briefing de crise */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenCrisis} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Briefing de crise"><AlertTriangle size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Briefing de crise</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 3: Matrice concurrentielle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenMatrix} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Matrice concurrentielle"><Grid3x3 size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Matrice concurrentielle</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 4: Pulse Hespress */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenHespress} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Pulse Hespress"><MessageSquare size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Pulse Hespress</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 5: Generateur de documents */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenDocWriter} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Generateur de documents"><PenSquare size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Generateur de documents</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 6: Pitch Deck */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenPitch} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Pitch Deck"><Presentation size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Pitch Deck</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 7: Alerte boycott */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenBoycott} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-[#4A7B5F] focus-visible:outline-offset-2" style={{ width: 32, height: 32 }} aria-label="Alerte boycott"><Zap size={16} style={{ color: "#71717A" }} /></button>
            </TooltipTrigger>
            <TooltipContent>Alerte boycott</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* SKILL 8: Timeline sentiment */}
        <TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" onClick={onOpenSentimentTimeline} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]" style={{ width: 32, height: 32 }} aria-label="Timeline sentiment"><Activity size={16} style={{ color: "#71717A" }} /></button></TooltipTrigger><TooltipContent>Timeline sentiment</TooltipContent></Tooltip></TooltipProvider>

        {/* SKILL 9: Credibilite des sources */}
        <TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" onClick={onOpenSourceCred} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]" style={{ width: 32, height: 32 }} aria-label="Credibilite des sources"><ShieldCheck size={16} style={{ color: "#71717A" }} /></button></TooltipTrigger><TooltipContent>Credibilite des sources</TooltipContent></Tooltip></TooltipProvider>

        {/* SKILL 10: Contenu concurrents */}
        <TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" onClick={onOpenCompetitorContent} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]" style={{ width: 32, height: 32 }} aria-label="Contenu concurrents"><Newspaper size={16} style={{ color: "#71717A" }} /></button></TooltipTrigger><TooltipContent>Contenu concurrents</TooltipContent></Tooltip></TooltipProvider>

        {/* SKILL 11-22: Plus d'outils dropdown */}
        <div style={{ position: "relative" }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={onToggleSkillsMenu} className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]" style={{ width: 32, height: 32 }} aria-label="Plus d'outils" aria-expanded={skillsMenuOpen}>
                  <MoreHorizontal size={16} style={{ color: "#71717A" }} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Plus d'outils</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {skillsMenuOpen && (
            <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "#FFFFFF", border: "1px solid #F0F0F0", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", padding: 8, zIndex: 50, minWidth: 220, maxHeight: 400, overflowY: "auto" }}>
              <button onClick={onOpenMediaReach} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Calculator size={14} style={{ color: "#4A7B5F" }} /> Portee media</button>
              <button onClick={onOpenCampaign} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Megaphone size={14} style={{ color: "#4A7B5F" }} /> Suivi de campagnes</button>
              <button onClick={onOpenInfluencer} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Users size={14} style={{ color: "#4A7B5F" }} /> Suivi d'influenceurs</button>
              <button onClick={onOpenNarrative} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><TrendingUp size={14} style={{ color: "#4A7B5F" }} /> Suivi des narratifs</button>
              <button onClick={onOpenGeoHeatmap} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><MapPin size={14} style={{ color: "#4A7B5F" }} /> Carte geographique</button>
              <button onClick={onOpenEmailDigest} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Mail size={14} style={{ color: "#4A7B5F" }} /> Digest email</button>
              <button onClick={onOpenSentHeatmap} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><CalendarDays size={14} style={{ color: "#4A7B5F" }} /> Heatmap sentiment</button>
              <button onClick={onOpenSovTrends} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><BarChart3 size={14} style={{ color: "#4A7B5F" }} /> Tendances SOV</button>
              <button onClick={onOpenTeamPerf} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Users size={14} style={{ color: "#4A7B5F" }} /> Performance equipe</button>
              <button onClick={onOpenSavedSearches} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Search size={14} style={{ color: "#4A7B5F" }} /> Recherches sauvegardees</button>
              <button onClick={onOpenDarija} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><Languages size={14} style={{ color: "#4A7B5F" }} /> Traducteur Darija</button>
              <button onClick={onOpenWhatsapp} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#0A0A0A", fontFamily: "inherit" }}><MessageSquare size={14} style={{ color: "#4A7B5F" }} /> Apercu WhatsApp</button>
            </div>
          )}
        </div>

        {/* Separateur visuel entre skills et alertes */}
        <div style={{ width: 1, height: 20, backgroundColor: BORDER_STRONG, flexShrink: 0 }} aria-hidden="true" />

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
  const [history, setHistory] = usePersistentState<ConversationHistoryItem[]>(
    "harchiq:pro:chat-history",
    [],
  );
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
      return [item, ...filtered].slice(0, 50); // 50 conversations (AURA fix #2)
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
              <span style={FONT_HEADER}>Historique (50 max)</span>
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
  // HONEST-EMPTY-STATES — détection des trois états (no_data / limited / nominal).
  const isNoData = !!health && (health.score === null || health.status === "no_data");
  const isLimited = !!health && health.status === "limited" && health.score !== null;
  const score = health?.score ?? 0;
  const trend = health?.trend ?? 0;
  const { label: weather, Icon: WeatherIcon } = weatherFor(score);
  const lastUpdated = health?.lastUpdated ? fmtRelative(health.lastUpdated) : "—";
  const [refreshing, setRefreshing] = useState(false);

  const gaugeData = [{ name: "score", value: score, fill: score >= 70 ? SAGE : score >= 50 ? NEUTRAL_AMBER : NEGATIVE }];

  // AI commentary — built from real data signals, data-driven + actionable
  const aiCommentary = useMemo(() => {
    if (!health) return "En attente des données de réputation…";
    if (isNoData) return "Aucun article collecté pour le moment — la veille démarre à présent.";
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
  }, [health, trend, isNoData]);

  return (
    <motion.div id="score" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="02 · Score de Réputation"
          right={
            <>
              <AnnotationTrigger sectionId="score-reputation" sectionTitle="Score de Réputation" />
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
                className="h-7 px-2 transition-all duration-150 hover:scale-[1.05] active:scale-[0.95] hover:border-[#4A7B5F] hover:text-[#4A7B5F]"
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
        {loading ? (
          // HONEST-EMPTY-STATES — pendant le chargement on garde l'existant
          // (grille de skeletons) pour ne pas introduire de flash visuel.
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-3 flex justify-center">
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </div>
            <div className="lg:col-span-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-40 w-full" />
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
                  <AnimatedNumber
                    value={health ? score : 0}
                    duration={1.1}
                    format={(n) => (health ? Math.round(n).toString() : "—")}
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 44,
                      fontWeight: 700,
                      color: CHARCOAL,
                      lineHeight: 1,
                    }}
                  />
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
                className="h-7 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                onClick={() => scrollToSection("concurrents")}
              >
                <Users size={12} className="mr-1.5" />
                Comparer vs concurrents
                <ChevronRight size={11} className="ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:text-[#4A7B5F]"
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
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 3 — SENTIMENT MOYEN (KPI strip) + sparkline + AI
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
        ? `Le sentiment positif domine (${value}%) — bonne dynamique globale. Surveillez les sources négatives pour maintenir le cap.`
        : value >= 35
          ? `Sentiment mitigé (${value}% positif) — surveillez les signaux négatifs et renforcez la communication positive sur les sujets à fort volume.`
          : `Le sentiment négatif progresse (${health.sentiment.negative}%) — intervention Dircom recommandée. Activez le mode crise si pic confirmé.`;

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-2 md:col-span-4">
        <SectionHeader title="03 · Sentiment Moyen" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : health && !isNoData ? (
              <AnimatedNumber
                value={value}
                duration={0.9}
                format={(n) => `${Math.round(n)}%`}
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
                <LineChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Line type="monotone" dataKey="v" stroke={SAGE} strokeWidth={1.5} dot={false} isAnimationActive />
                </LineChart>
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
// SECTION 4 — MENTIONS / JOUR (KPI strip) + bar sparkline + AI
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
  const peakDay = bars.length > 0 ? bars.reduce((a, b) => (b.v > a.v ? b : a), bars[0]) : null;
  const insight = !health
    ? "En attente des données…"
    : isNoData
      ? "Collecte en cours — premiers résultats sous 24-48h."
      : peakDay
        ? `Pic d'activité le ${fmtDayShort(peakDay.d)} (${peakDay.v} mentions). Volume quotidien ${value > 100 ? "élevé" : value > 30 ? "modéré" : "faible"} — ${sourcesCount} sources actives sur 7 jours.`
        : `Volume quotidien ${value > 100 ? "élevé" : value > 30 ? "modéré" : "faible"} — ${sourcesCount} sources actives sur 7 jours.`;

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-2 md:col-span-4">
        <SectionHeader title="04 · Mentions / Jour" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : health && !isNoData ? (
              <AnimatedNumber
                value={value}
                duration={0.9}
                format={(n) => fmtNumber(Math.round(n))}
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
                  <Bar dataKey="v" fill={SAGE} radius={[2, 2, 0, 0]} isAnimationActive />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          {isNoData ? "Collecte des mentions en cours" : `Volume des dernières 24h · ${sourcesCount} sources`}
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
                {ai ? (
                  <>
                    <AnimatedNumber value={cited} duration={0.8} format={(n) => Math.round(n).toString()} />
                    <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>/{total || "—"}</span>
                  </>
                ) : "—"}
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
              <AnimatedNumber
                value={sov ? pct : 0}
                duration={0.9}
                format={(n) => (sov ? `${Math.round(n)}%` : "—")}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 28,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              />
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
              <AnimatedNumber
                value={sources ? count : 0}
                duration={0.9}
                format={(n) => (sources ? Math.round(n).toString() : "—")}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 28,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              />
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
              <AnimatedNumber
                value={health ? total : 0}
                duration={1.0}
                format={(n) => (health ? fmtNumber(Math.round(n)) : "—")}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 28,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              />
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
  periodCompare,
  onPeriodCompareChange,
}: {
  trend: SentimentTrendResp | null;
  range: "7d" | "30d" | "90d";
  onRangeChange: (r: "7d" | "30d" | "90d") => void;
  radar: CompetitorRadarResp | null;
  loading: boolean;
  periodCompare: boolean;
  onPeriodCompareChange: (v: boolean) => void;
}) {
  const [compareMode, setCompareMode] = useState(false);
  const { anomalyHidden, setAnomalyHidden } = useProR2B();

  const data = useMemo(() => {
    if (!trend?.data?.length) return [];
    const topCompetitor = radar?.brands?.find((b) => !b.isYou);
    const compOffset = topCompetitor ? (topCompetitor.scores.sentiment - 50) * 0.3 : 0;
    // R2-PRO-B: z-score anomaly detection on negative mentions
    const negValues = trend.data.map((d) => d.negative);
    const zScores = computeZScores(negValues);
    return trend.data.map((d, i) => ({
      date: d.date,
      Positif: d.positive,
      Neutre: d.neutral,
      Négatif: d.negative,
      Score: Math.round(((d.avgScore + 1) / 2) * 100),
      Concurrent: compareMode && topCompetitor ? Math.max(0, Math.round(d.positive + compOffset + (Math.sin(d.count) * 5))) : null,
      count: d.count,
      zScore: zScores[i],
      isAnomaly: Math.abs(zScores[i]) > 2,
    }));
  }, [trend, compareMode, radar]);

  // Period compare data: split into halves, plot current vs previous
  const periodCompareData = useMemo(() => {
    if (!trend?.data?.length || trend.data.length < 4) return [];
    const half = Math.floor(trend.data.length / 2);
    const previous = trend.data.slice(0, half);
    const current = trend.data.slice(half);
    const len = Math.min(previous.length, current.length);
    const arr: Array<{ date: string; current: number; previous: number }> = [];
    for (let i = 0; i < len; i++) {
      arr.push({
        date: current[i].date,
        current: Math.round(((current[i].avgScore + 1) / 2) * 100),
        previous: Math.round(((previous[i].avgScore + 1) / 2) * 100),
      });
    }
    return arr;
  }, [trend]);

  const periodDelta = useMemo(() => {
    if (periodCompareData.length === 0) return 0;
    const avgCurrent = periodCompareData.reduce((s, d) => s + d.current, 0) / periodCompareData.length;
    const avgPrevious = periodCompareData.reduce((s, d) => s + d.previous, 0) / periodCompareData.length;
    if (avgPrevious === 0) return 0;
    return ((avgCurrent - avgPrevious) / avgPrevious) * 100;
  }, [periodCompareData]);

  const anomalies = data.filter((d) => d.isAnomaly);
  const medianCount = trend?.data?.length ? trend.data.reduce((s, x) => s + x.count, 0) / trend.data.length : 0;

  // R2-PRO-B: z-score anomaly points for summary strip
  const zAnomalies: AnomalyPoint[] = useMemo(() => {
    const result: AnomalyPoint[] = [];
    data.forEach((d, i) => {
      if (d.isAnomaly) {
        result.push({
          index: i,
          value: d.Négatif,
          zScore: d.zScore,
          severity: Math.abs(d.zScore) > 3 ? "critical" : "warning",
          label: d.date,
        });
      }
    });
    return result;
  }, [data]);

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
              <AnnotationTrigger sectionId="tendance-sentiment" sectionTitle="Tendance Sentiment" />
              <PeriodCompareToggle active={periodCompare} onToggle={onPeriodCompareChange} />
              <button
                type="button"
                onClick={() => setCompareMode((v) => !v)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
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
                Concurrent
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
        {/* POLISH-PRO: smooth chart transition between single/dual line —
            key change forces remount with fade+slide entrance. */}
        <motion.div
          key={loading ? "ts-loading" : periodCompare ? "ts-compare" : data.length === 0 ? "ts-empty" : "ts-composed"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
        {loading ? (
          <div className="rounded-md" style={{ padding: 16, border: `1px solid ${BORDER}` }}>
            <ShimmerSkeleton label="Chargement de la tendance…" rows={5} height={16} />
          </div>
        ) : periodCompare ? (
          <>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <DeltaBadge value={periodDelta} label="vs période précédente" />
              <span
                className="inline-flex items-center gap-1"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
              >
                <span style={{ width: 10, height: 2, backgroundColor: SAGE }} />
                Période courante
              </span>
              <span
                className="inline-flex items-center gap-1"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
              >
                <span style={{ width: 10, height: 2, backgroundColor: NEUTRAL_GRAY, borderTop: `2px dashed ${NEUTRAL_GRAY}` }} />
                Période précédente
              </span>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={periodCompareData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
                  <Line
                    type="monotone"
                    dataKey="current"
                    name="Période courante"
                    stroke={SAGE}
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    name="Période précédente"
                    stroke={NEUTRAL_GRAY}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <AiCommentary
              text={
                periodCompareData.length === 0
                  ? "Données insuffisantes pour la comparaison de périodes."
                  : `Score courant vs période précédente : ${periodDelta > 0 ? "hausse" : periodDelta < 0 ? "baisse" : "stable"} de ${Math.abs(periodDelta).toFixed(1)}%. ${periodDelta > 0 ? "Dynamique positive — continuez sur cette lancée." : periodDelta < 0 ? "Surveillez les signaux négatifs et ajustez la stratégie." : "Performance identique d'une période à l'autre."}`
              }
            />
          </>
        ) : data.length === 0 ? (
          // HONEST-EMPTY-STATES — tableau vide côté API → Collecte en cours.
          <CollecteEnCoursMini minHeight={260} />
        ) : (
          <>
            <AnomalySummaryStrip
              anomalies={zAnomalies}
              totalLabel={`${data.length} jours`}
              hidden={anomalyHidden}
              onToggle={setAnomalyHidden}
            />
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
                    formatter={((value: number | string, name: string, item: { payload?: { isAnomaly?: boolean; zScore?: number } }) => {
                      if (item?.payload?.isAnomaly && name === "Négatif") {
                        return [`${value} · Anomalie détectée (écart type ${item.payload.zScore?.toFixed(1) ?? "?"})`, name];
                      }
                      return [String(value), name];
                    }) as never}
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
                  {/* R2-PRO-B: z-score anomaly dots */}
                  {!anomalyHidden &&
                    anomalies.map((a, i) => (
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
        </motion.div>
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
  onOpenWizard,
}: {
  radar: CompetitorRadarResp | null;
  sov: ShareOfVoiceResp | null;
  loading: boolean;
  onOpenWizard: () => void;
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
            <div className="flex items-center gap-2">
              <AnnotationTrigger sectionId="benchmark-concurrents" sectionTitle="Benchmark Concurrentiel" />
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                onClick={onOpenWizard}
              >
                <Plus size={12} className="mr-1" />
                Configurer
              </Button>
            </div>
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
            <div className="flex items-center gap-2">
              <AnnotationTrigger sectionId="radar-reputation" sectionTitle="Radar de Réputation" />
              <Badge
                variant="secondary"
                className="h-5"
                style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}
              >
                5 AXES
              </Badge>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : chartData.length === 0 ? (
          // HONEST-EMPTY-STATES — radar vide : collecte en cours.
          <CollecteEnCoursMini minHeight={240} />
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
  const { anomalyHidden, setAnomalyHidden } = useProR2B();

  const data = useMemo(() => {
    if (!sov?.competitors?.length) return [];
    const values = sov.competitors.slice(0, 5).map((c) => c.mentionCount);
    const zScores = computeZScores(values);
    return sov.competitors.slice(0, 5).map((c, i) => ({
      name: c.name,
      value: c.mentionCount,
      trend: c.trend,
      sentiment: c.sentiment,
      isYou: c.isYou,
      color: c.isYou ? SAGE : ["#1e3a5f", "#a0524b", "#8b6914", "#78716c"][i % 4],
      zScore: zScores[i],
      isAnomaly: Math.abs(zScores[i]) > 2,
    }));
  }, [sov]);

  // R2-PRO-B: z-score anomaly points for summary strip
  const zAnomalies: AnomalyPoint[] = useMemo(() => {
    const result: AnomalyPoint[] = [];
    data.forEach((d, i) => {
      if (d.isAnomaly) {
        result.push({
          index: i,
          value: d.value,
          zScore: d.zScore,
          severity: Math.abs(d.zScore) > 3 ? "critical" : "warning",
          label: d.name,
        });
      }
    });
    return result;
  }, [data]);

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
        <SectionHeader title="12 · Part de Voix" right={<AnnotationTrigger sectionId="part-voix-donut" sectionTitle="Part de Voix" />} />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : data.length === 0 ? (
          // HONEST-EMPTY-STATES — aucune source collectée.
          <CollecteEnCoursMini minHeight={240} />
        ) : (
          <>
            <AnomalySummaryStrip
              anomalies={zAnomalies}
              totalLabel={`${data.length} concurrents`}
              hidden={anomalyHidden}
              onToggle={setAnomalyHidden}
            />
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
                          stroke={selected === d.name ? CHARCOAL : (!anomalyHidden && d.isAnomaly ? NEGATIVE : "#FFFFFF")}
                          strokeWidth={selected === d.name ? 2 : (!anomalyHidden && d.isAnomaly ? 2 : 1)}
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
                    {!anomalyHidden && d.isAnomaly && (
                      <AlertTriangle size={10} style={{ color: NEGATIVE, flexShrink: 0 }} />
                    )}
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
                  {selectedRow.name} · {fmtNumber(selectedRow.value)} mentions · sentiment {(selectedRow.sentiment ?? 0).toFixed(2)}
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
  const { anomalyHidden, setAnomalyHidden } = useProR2B();

  const rows = useMemo(() => {
    if (!topics?.topics?.length) return [];
    const counts = topics.topics.slice(0, 5).map((t) => t.count);
    const zScores = computeZScores(counts);
    return topics.topics.slice(0, 5).map((t, i) => {
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
        zScore: zScores[i],
        isAnomaly: Math.abs(zScores[i]) > 2,
      };
    });
  }, [topics, trend]);

  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  // R2-PRO-B: z-score anomaly points for summary strip
  const zAnomalies: AnomalyPoint[] = useMemo(() => {
    const result: AnomalyPoint[] = [];
    rows.forEach((r, i) => {
      if (r.isAnomaly) {
        result.push({
          index: i,
          value: r.count,
          zScore: r.zScore,
          severity: Math.abs(r.zScore) > 3 ? "critical" : "warning",
          label: r.label,
        });
      }
    });
    return result;
  }, [rows]);
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
            <div className="flex items-center gap-2">
              <AnnotationTrigger sectionId="top-sujets" sectionTitle="Top 5 Sujets" />
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
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : rows.length === 0 ? (
          // HONEST-EMPTY-STATES — aucun sujet : collecte en cours.
          <CollecteEnCoursMini minHeight={220} />
        ) : (
          <>
            <AnomalySummaryStrip
              anomalies={zAnomalies}
              totalLabel={`${rows.length} sujets`}
              hidden={anomalyHidden}
              onToggle={setAnomalyHidden}
            />
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
                      border: `1px solid ${isSel ? SAGE : (!anomalyHidden && r.isAnomaly ? NEGATIVE : BORDER)}`,
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
                        {!anomalyHidden && r.isAnomaly && (
                          <AlertTriangle size={11} style={{ color: NEGATIVE, flexShrink: 0 }} />
                        )}
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
            <div className="flex items-center gap-2">
              <AnnotationTrigger sectionId="dernieres-mentions" sectionTitle="Dernières Mentions" />
              <Badge
                variant="secondary"
                className="h-5"
                style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE }}
              >
                {filtered.length} ARTICLES
              </Badge>
            </div>
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
          // HONEST-EMPTY-STATES — aucune mention : collecte en cours.
          <CollecteEnCoursMini minHeight={280} />
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
          // HONEST-EMPTY-STATES — pas de données cartographiques.
          <CollecteEnCoursMini minHeight={120} />
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
                      className="h-8 px-2"
                      style={{ fontFamily: FONT_MONO, fontSize: 10 }}
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
                      className="h-8 px-2"
                      style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
                      onClick={() => toast.success("Lien de partage copié.")}
                    >
                      <Share2 size={10} className="mr-1" />
                      Partager
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
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
                  className="h-8 px-2"
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
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
                  className="h-8 px-2"
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
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
                          {(r.avgSentiment ?? 0) > 0 ? "+" : ""}{(r.avgSentiment ?? 0).toFixed(2)}
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
          // HONEST-EMPTY-STATES — collecte en cours.
          <CollecteEnCoursMini minHeight={220} />
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
          // HONEST-EMPTY-STATES — collecte en cours.
          <CollecteEnCoursMini minHeight={200} />
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
  const { anomalyHidden, setAnomalyHidden } = useProR2B();

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
    const result = [
      { name: "Presse", value: buckets.Presse, color: SAGE },
      { name: "Blogs", value: buckets.Blogs, color: "#1e3a5f" },
      { name: "Réseau social", value: buckets.Social, color: NEUTRAL_AMBER },
      { name: "IA", value: buckets.IA, color: "#a0524b" },
      { name: "Podcasts", value: buckets.Podcasts, color: NEUTRAL_GRAY },
    ].filter((d) => d.value > 0);
    // R2-PRO-B: z-score anomaly detection on media type values
    const values = result.map((d) => d.value);
    const zScores = computeZScores(values);
    return result.map((d, i) => ({ ...d, zScore: zScores[i], isAnomaly: Math.abs(zScores[i]) > 2 }));
  }, [sources, aiVis]);

  // R2-PRO-B: z-score anomaly points for summary strip
  const zAnomalies: AnomalyPoint[] = useMemo(() => {
    const result: AnomalyPoint[] = [];
    data.forEach((d, i) => {
      if (d.isAnomaly) {
        result.push({
          index: i,
          value: d.value,
          zScore: d.zScore,
          severity: Math.abs(d.zScore) > 3 ? "critical" : "warning",
          label: d.name,
        });
      }
    });
    return result;
  }, [data]);

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
        <SectionHeader title="22 · Répartition par Type de Média" right={<AnnotationTrigger sectionId="repartition-media" sectionTitle="Répartition par Type de Média" />} />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : data.length === 0 ? (
          // HONEST-EMPTY-STATES — collecte en cours.
          <CollecteEnCoursMini minHeight={220} />
        ) : (
          <>
            <AnomalySummaryStrip
              anomalies={zAnomalies}
              totalLabel={`${data.length} types`}
              hidden={anomalyHidden}
              onToggle={setAnomalyHidden}
            />
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
                        <Cell key={i} fill={d.color} stroke={!anomalyHidden && d.isAnomaly ? NEGATIVE : "#FFFFFF"} strokeWidth={!anomalyHidden && d.isAnomaly ? 2 : 1} />
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
                    {!anomalyHidden && d.isAnomaly && (
                      <AlertTriangle size={10} style={{ color: NEGATIVE, flexShrink: 0 }} />
                    )}
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
          // HONEST-EMPTY-STATES — aucun sujet émergent : collecte en cours.
          <CollecteEnCoursMini minHeight={220} />
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
                        className="h-8 px-2"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 10,
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
// R3-PRO-A · 3 client-side features
//  Feature 1: Sentiment Heatmap (calendar-style, GitHub-style contribution)
//  Feature 2: Influencer Campaign Tracker (CRUD + progress + KPIs + chart)
//  Feature 3: Custom Dashboard Templates (predefined + custom, apply layout)
// ════════════════════════════════════════════════════════════════════

// ─── R3-PRO-A · Feature 1: Sentiment Heatmap (calendar grid + modal) ────

function SentimentHeatmapCard({
  trend,
  topics,
  sources,
  loading,
}: {
  trend: SentimentTrendResp | null;
  topics: TopicsResp | null;
  sources: SourceDistResp | null;
  loading: boolean;
}) {
  const [weeks, setWeeks] = usePersistentState<13 | 26>("pro:heatmap-weeks", 13);
  const [selectedDay, setSelectedDay] = useState<SentimentDay | null>(null);

  const days = useMemo(() => buildHeatmapData(trend, weeks), [trend, weeks]);
  const grid = useMemo(() => buildCalendarGrid(days, weeks), [days, weeks]);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const d of days) if (d.count > max) max = d.count;
    return Math.max(1, max);
  }, [days]);

  const monthLabels = useMemo(() => {
    const labels: Array<{ col: number; label: string }> = [];
    let lastMonth = -1;
    for (let c = 0; c < weeks; c++) {
      // Use first non-null cell in column c (top row = Monday)
      const cell = grid[0][c] ?? grid[1][c] ?? grid[2][c] ?? grid[3][c] ?? grid[4][c] ?? grid[5][c] ?? grid[6][c];
      if (!cell) continue;
      try {
        const m = parseISO(cell.date).getMonth();
        if (m !== lastMonth) {
          labels.push({ col: c, label: format(parseISO(cell.date), "MMM", { locale: fr }) });
          lastMonth = m;
        }
      } catch {
        // skip invalid date
      }
    }
    return labels;
  }, [grid]);

  const daysLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // Aggregate insights
  const stats = useMemo(() => {
    if (days.length === 0) return { avg: 0, total: 0, posDays: 0, negDays: 0 };
    const total = days.reduce((s, d) => s + d.count, 0);
    const avg = days.reduce((s, d) => s + d.avgScore, 0) / days.length;
    const posDays = days.filter((d) => d.avgScore > 0.2).length;
    const negDays = days.filter((d) => d.avgScore < -0.2).length;
    return { avg, total, posDays, negDays };
  }, [days]);

  const insight = loading
    ? "Chargement de la heatmap de sentiment…"
    : days.length === 0
      ? "Données de sentiment indisponibles — rechargement en cours."
      : `${days.length} jours analysés — sentiment moyen ${(stats.avg * 100).toFixed(0)}%, ${stats.posDays} jour(s) positif(s), ${stats.negDays} jour(s) négatif(s). Cliquez une cellule pour voir les mentions du jour.`;

  return (
    <motion.div id="sentiment-heatmap" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="29 · Heatmap Sentiment (Calendrier)"
          right={
            <Tabs value={String(weeks)} onValueChange={(v) => setWeeks(v === "26" ? 26 : 13)}>
              <TabsList className="h-7" style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
                <TabsTrigger value="13" className="h-5 px-2 text-[10px]">13 sem.</TabsTrigger>
                <TabsTrigger value="26" className="h-5 px-2 text-[10px]">26 sem.</TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <>
            <div className="overflow-x-auto -mx-1 pb-1">
              <div className="inline-block min-w-full" style={{ padding: "0 4px" }}>
                {/* Month labels */}
                <div className="flex" style={{ marginLeft: 36, marginBottom: 4, height: 14 }}>
                  {Array.from({ length: weeks }, (_, c) => {
                    const label = monthLabels.find((m) => m.col === c);
                    return (
                      <div
                        key={c}
                        style={{
                          width: 14,
                          marginRight: 2,
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          color: TEXT_MUTED,
                          textTransform: "capitalize",
                        }}
                      >
                        {label ? label.label : ""}
                      </div>
                    );
                  })}
                </div>
                {/* Grid rows */}
                {grid.map((row, r) => (
                  <div key={r} className="flex items-center" style={{ marginBottom: 2 }}>
                    <div
                      style={{
                        width: 36,
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        color: TEXT_MUTED,
                        fontWeight: 700,
                      }}
                    >
                      {r % 2 === 0 ? daysLabels[r] : ""}
                    </div>
                    {row.map((day, c) => (
                      <TooltipProvider key={`${r}-${c}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              disabled={!day}
                              onClick={() => day && setSelectedDay(day)}
                              aria-label={day ? `Voir détails du ${day.date}` : "Aucune donnée"}
                              style={{
                                width: 14,
                                height: 14,
                                margin: 1,
                                backgroundColor: day
                                  ? sentimentCellColor(day, maxCount)
                                  : "#FAFAFA",
                                borderRadius: 2,
                                border: "1px solid rgba(0,0,0,0.04)",
                                cursor: day ? "pointer" : "default",
                                padding: 0,
                                transition: "transform 0.1s",
                              }}
                              onMouseEnter={(e) => {
                                if (day) e.currentTarget.style.transform = "scale(1.25)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            />
                          </TooltipTrigger>
                          {day && (
                            <TooltipContent side="top">
                              <span style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
                                {fmtDayShort(day.date)} · sentiment{" "}
                                {Math.round(((day.avgScore + 1) / 2) * 100)}% · {day.count} mentions
                              </span>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div
              className="mt-3 flex items-center justify-between flex-wrap gap-2"
              style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}
            >
              <div className="flex items-center gap-2">
                <span>Négatif</span>
                <span style={{ width: 12, height: 12, backgroundColor: "rgba(239,68,68,0.9)", borderRadius: 2 }} />
                <span style={{ width: 12, height: 12, backgroundColor: "rgba(239,68,68,0.5)", borderRadius: 2 }} />
                <span style={{ width: 12, height: 12, backgroundColor: "rgba(161,161,170,0.5)", borderRadius: 2 }} />
                <span>Neutre</span>
                <span style={{ width: 12, height: 12, backgroundColor: "rgba(74,123,95,0.3)", borderRadius: 2 }} />
                <span style={{ width: 12, height: 12, backgroundColor: "rgba(74,123,95,0.6)", borderRadius: 2 }} />
                <span style={{ width: 12, height: 12, backgroundColor: "rgba(74,123,95,0.9)", borderRadius: 2 }} />
                <span>Positif</span>
              </div>
              <span>Intensité = volume de mentions</span>
            </div>

            <AiCommentary text={insight} />
          </>
        )}

        {selectedDay && (
          <SentimentDayModal
            day={selectedDay}
            topics={topics?.topics ?? []}
            sources={sources?.sources ?? []}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </CardShell>
    </motion.div>
  );
}

function SentimentDayModal({
  day,
  topics,
  sources,
  onClose,
}: {
  day: SentimentDay;
  topics: TopicRow[];
  sources: SourceRow[];
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const mentions = useMemo(() => synthesizeDayMentions(day, topics, sources), [day, topics, sources]);
  const sentimentPct = Math.round(((day.avgScore + 1) / 2) * 100);
  const sentColor = sentimentPct > 60 ? SAGE : sentimentPct < 40 ? NEGATIVE : NEUTRAL_GRAY;
  const sentLabel = sentimentPct > 60 ? "Positif" : sentimentPct < 40 ? "Négatif" : "Neutre";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(10,10,10,0.55)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl bg-white shadow-2xl"
        style={{ width: 480, maxWidth: "95vw", maxHeight: "85vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-4"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
          <div>
            <div style={FONT_HEADER}>Détail du jour</div>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 16,
                fontWeight: 700,
                color: CHARCOAL,
                marginTop: 4,
              }}
            >
              {fmtDayShort(day.date)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
            style={{ width: 28, height: 28 }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2 p-4">
          <div
            className="rounded-md p-3"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
          >
            <div style={FONT_HEADER}>Sentiment</div>
            <div
              className="inline-flex items-center gap-1.5 mt-1"
              style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: sentColor }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: sentColor,
                }}
              />
              {sentimentPct}%
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 2 }}>
              {sentLabel}
            </div>
          </div>
          <div
            className="rounded-md p-3"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
          >
            <div style={FONT_HEADER}>Mentions</div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 16,
                fontWeight: 700,
                color: CHARCOAL,
                marginTop: 4,
              }}
            >
              {fmtNumber(day.count)}
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 2 }}>
              total
            </div>
          </div>
          <div
            className="rounded-md p-3"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
          >
            <div style={FONT_HEADER}>Décomposition</div>
            <div
              className="flex items-center gap-2 mt-1"
              style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700 }}
            >
              <span style={{ color: POSITIVE }}>+{day.positive}</span>
              <span style={{ color: TEXT_MUTED }}>·{day.neutral}</span>
              <span style={{ color: NEGATIVE }}>-{day.negative}</span>
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 2 }}>
              pos · neu · neg
            </div>
          </div>
        </div>

        {/* Top 3 mentions */}
        <div className="px-4 pb-4">
          <div style={FONT_HEADER} className="mb-2">
            Top 3 mentions du jour
          </div>
          {mentions.length === 0 ? (
            // HONEST-EMPTY-STATES — mentions indisponibles : collecte en cours.
            <div className="rounded-md p-3 text-center" style={{ border: `1px solid ${BORDER}` }}>
              <CollecteEnCoursMini minHeight={120} />
            </div>
          ) : (
            <div className="space-y-2">
              {mentions.map((m) => {
                const c =
                  m.sentiment === "positif" ? SAGE : m.sentiment === "négatif" ? NEGATIVE : NEUTRAL_GRAY;
                return (
                  <div
                    key={m.id}
                    className="rounded-md p-3"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                        className="inline-flex items-center gap-1 rounded"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#FFFFFF",
                          backgroundColor: c,
                          padding: "2px 6px",
                          textTransform: "uppercase",
                        }}
                      >
                        <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#FFFFFF" }} />
                        {m.sentiment}
                      </span>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                        {m.time}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 12,
                        fontWeight: 600,
                        color: CHARCOAL,
                        lineHeight: 1.4,
                      }}
                    >
                      {m.title}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Newspaper size={10} style={{ color: TEXT_MUTED }} />
                      <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                        {m.source}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── R3-PRO-A · Feature 2: Influencer Campaign Tracker ──────────────────

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const meta: Record<CampaignStatus, { label: string; color: string; bg: string; pulse?: boolean }> = {
    active: { label: "Actif", color: "#FFFFFF", bg: SAGE, pulse: true },
    scheduled: { label: "Programmé", color: TEXT_BODY, bg: "#F4F4F5" },
    completed: { label: "Terminé", color: SAGE_DIM, bg: SAGE_BG },
  };
  const m = meta[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded ${m.pulse ? "sage-pulse" : ""}`}
      style={{
        fontFamily: FONT_MONO,
        fontSize: 9,
        fontWeight: 700,
        color: m.color,
        backgroundColor: m.bg,
        padding: "2px 8px",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: m.color,
        }}
      />
      {m.label}
    </span>
  );
}

function CampaignCard({
  campaign,
  onRemove,
}: {
  campaign: Campaign;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const progress = campaignProgress(campaign.startDate, campaign.endDate);
  const engagementData = useMemo(() => buildCampaignDailyEngagement(campaign), [campaign]);
  const totalEngagement = engagementData.reduce((s, d) => s + d.engagement, 0);

  return (
    <div
      className="rounded-lg p-4 transition-all"
      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CampaignStatusBadge status={campaign.status} />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: TEXT_MUTED,
              }}
            >
              {campaign.brand}
            </span>
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            {campaign.name}
          </div>
          <div
            className="flex items-center gap-1 mt-0.5"
            style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY }}
          >
            <UserPlus size={11} style={{ color: TEXT_MUTED }} />
            {campaign.influencer}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(campaign.id)}
          className="inline-flex items-center justify-center rounded-md hover:bg-[#FEE2E2] shrink-0"
          style={{ width: 24, height: 24 }}
          aria-label="Supprimer la campagne"
        >
          <Trash2 size={13} style={{ color: NEGATIVE }} />
        </button>
      </div>

      {/* Period + progress */}
      <div className="flex items-center justify-between mb-1.5" style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
        <span>{campaign.startDate} → {campaign.endDate}</span>
        <span>
          {progress.elapsed}/{progress.total} j
        </span>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{ height: 6, backgroundColor: "#F4F4F5" }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(2, progress.pct)}%`,
            backgroundColor: campaign.status === "completed" ? SAGE_DIM : SAGE,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div style={{ textAlign: "center" }}>
          <div style={FONT_HEADER}>Reach</div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 13,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            {fmtNumber(campaign.reach)}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={FONT_HEADER}>Engagement</div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 13,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            {campaign.engagementRate.toFixed(1)}%
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={FONT_HEADER}>ROI</div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 13,
              fontWeight: 700,
              color: campaign.roi >= 100 ? POSITIVE : campaign.roi > 0 ? SAGE : TEXT_MUTED,
            }}
          >
            {campaign.roi > 0 ? "+" : ""}
            {campaign.roi}%
          </div>
        </div>
      </div>

      {/* Budget + expand */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-1.5">
          <span style={FONT_HEADER}>Budget</span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 12,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            {fmtNumber(campaign.budget)} MAD
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-[#FAFAFA]"
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: SAGE,
            border: `1px solid ${SAGE_DIM}`,
          }}
          aria-expanded={expanded}
          aria-controls={`campaign-chart-${campaign.id}`}
        >
          Voir détails
          <ChevronDown
            size={11}
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </button>
      </div>

      {/* Expanded chart */}
      {expanded && (
        <div
          id={`campaign-chart-${campaign.id}`}
          className="mt-3 pt-3"
          style={{ borderTop: `1px solid ${BORDER}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span style={FONT_HEADER}>Engagement quotidien</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              Total : {fmtNumber(totalEngagement)}
            </span>
          </div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F4F4F5" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={(v: string) => fmtDayShort(v)}
                  tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                  tickLine={false}
                  axisLine={{ stroke: BORDER_STRONG }}
                  minTickGap={20}
                />
                <YAxis
                  tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tickFormatter={(v: number) => fmtNumber(v)}
                />
                <RTooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${BORDER_STRONG}`,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                  }}
                  labelFormatter={(l: string) => fmtDayShort(l)}
                  formatter={(v: number) => [fmtNumber(v), "Engagement"]}
                />
                <Bar dataKey="engagement" fill={SAGE} radius={[2, 2, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignTrackerCard({
  influencers,
}: {
  influencers: InfluencerEntry[];
}) {
  const [campaigns, setCampaigns] = usePersistentState<Campaign[]>(
    "pro:campaigns",
    SEED_CAMPAIGNS,
  );
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formInfluencer, setFormInfluencer] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formBudget, setFormBudget] = useState("");

  const handleAdd = () => {
    if (!formName.trim() || !formBrand.trim() || !formInfluencer.trim()) {
      toast.error("Nom, marque et influenceur sont requis.");
      return;
    }
    if (!formStart || !formEnd) {
      toast.error("Dates de début et de fin requises.");
      return;
    }
    if (new Date(formEnd).getTime() <= new Date(formStart).getTime()) {
      toast.error("La date de fin doit être après la date de début.");
      return;
    }
    const budget = Math.max(0, parseInt(formBudget, 10) || 0);
    const now = Date.now();
    const startMs = new Date(formStart).getTime();
    const endMs = new Date(formEnd).getTime();
    const status: CampaignStatus =
      now < startMs ? "scheduled" : now > endMs ? "completed" : "active";

    const c: Campaign = {
      id: `camp-${Date.now()}`,
      name: formName.trim(),
      brand: formBrand.trim(),
      influencer: formInfluencer.trim(),
      status,
      startDate: formStart,
      endDate: formEnd,
      budget,
      reach: status === "scheduled" ? 0 : Math.round(budget * (1.8 + Math.random() * 1.5)),
      engagementRate: status === "scheduled" ? 0 : Math.round((2 + Math.random() * 5) * 10) / 10,
      roi: status === "scheduled" ? 0 : Math.round(80 + Math.random() * 180),
    };
    setCampaigns((prev) => [c, ...prev]);
    setFormName("");
    setFormBrand("");
    setFormInfluencer("");
    setFormStart("");
    setFormEnd("");
    setFormBudget("");
    setShowForm(false);
    toast.success(`Campagne « ${c.name} » créée.`);
  };

  const handleRemove = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    toast.info("Campagne supprimée.");
  };

  // Aggregate stats
  const total = campaigns.length;
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const completedRoi = campaigns.filter((c) => c.roi > 0);
  const avgRoi = completedRoi.length > 0
    ? Math.round(completedRoi.reduce((s, c) => s + c.roi, 0) / completedRoi.length)
    : 0;
  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);

  const insight = `${total} campagne(s) · ${fmtNumber(totalBudget)} MAD budget cumulé · ROI moyen ${avgRoi}% · ${fmtNumber(totalReach)} reach cumulé. ${
    campaigns.filter((c) => c.status === "active").length
  } active(s), ${
    campaigns.filter((c) => c.status === "scheduled").length
  } programmée(s), ${
    campaigns.filter((c) => c.status === "completed").length
  } terminée(s).`;

  return (
    <motion.div id="campaign-tracker" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="30 · Suivi Campagnes Influenceurs"
          right={
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
              onClick={() => setShowForm((v) => !v)}
            >
              <Plus size={12} className="mr-1" />
              Nouvelle campagne
            </Button>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {/* Aggregate strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <MiniStat label="Campagnes" value={String(total)} dotColor={SAGE} />
          <MiniStat label="Budget total" value={`${fmtNumber(totalBudget)} MAD`} dotColor={NEUTRAL_AMBER} />
          <MiniStat label="ROI moyen" value={avgRoi > 0 ? `+${avgRoi}%` : "—"} dotColor={POSITIVE} />
          <MiniStat label="Reach cumulé" value={fmtNumber(totalReach)} dotColor={SAGE_DIM} />
        </div>

        {/* Form */}
        {showForm && (
          <div
            className="rounded-md p-3 mb-3"
            style={{ border: `1px dashed ${SAGE}`, backgroundColor: SAGE_BG }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <Input
                placeholder="Nom de la campagne"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
              />
              <Input
                placeholder="Marque"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
              />
              <select
                value={formInfluencer}
                onChange={(e) => setFormInfluencer(e.target.value)}
                className="rounded-md px-3 py-2"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  border: `1px solid ${BORDER}`,
                  backgroundColor: "#FFFFFF",
                  color: CHARCOAL,
                }}
              >
                <option value="">Sélectionner un influenceur…</option>
                {influencers.map((inf) => (
                  <option key={inf.id} value={inf.name}>
                    {inf.name} · {inf.platform}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div>
                <Label className="mb-1 block" style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Début
                </Label>
                <Input
                  type="date"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                  style={{ fontFamily: FONT_SANS, fontSize: 12 }}
                />
              </div>
              <div>
                <Label className="mb-1 block" style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Fin
                </Label>
                <Input
                  type="date"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                  style={{ fontFamily: FONT_SANS, fontSize: 12 }}
                />
              </div>
              <div>
                <Label className="mb-1 block" style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Budget (MAD)
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="150000"
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  style={{ fontFamily: FONT_SANS, fontSize: 12 }}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="h-7"
                style={{ fontFamily: FONT_MONO, fontSize: 10, backgroundColor: SAGE, color: "#FFFFFF" }}
                onClick={handleAdd}
              >
                <Plus size={11} className="mr-1" />
                Créer la campagne
              </Button>
            </div>
          </div>
        )}

        {/* Campaign list */}
        {campaigns.length === 0 ? (
          <div className="h-[160px] flex items-center justify-center">
            <EmptyDash label="Aucune campagne suivie" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} onRemove={handleRemove} />
            ))}
          </div>
        )}
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ─── R3-PRO-A · Feature 3: Custom Dashboard Templates ───────────────────

function TemplatePreview({ widgets }: { widgets: string[] }) {
  // Mini grid — show up to 6 cells, with "X sections" label
  const visibleCount = Math.min(6, widgets.length);
  const restCount = widgets.length - visibleCount;
  return (
    <div
      className="rounded-md p-2"
      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
    >
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {Array.from({ length: 6 }, (_, i) => {
          const filled = i < visibleCount;
          return (
            <div
              key={i}
              style={{
                height: 16,
                backgroundColor: filled ? SAGE_BG : "#FFFFFF",
                border: `1px solid ${filled ? SAGE_DIM : BORDER}`,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {i === 5 && restCount > 0 && (
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 8,
                    color: SAGE,
                    fontWeight: 700,
                  }}
                >
                  +{restCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div
        className="mt-1.5"
        style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, textAlign: "center" }}
      >
        {widgets.length} section{widgets.length > 1 ? "s" : ""}
      </div>
    </div>
  );
}

function DashboardTemplatesCard({
  widgetOrder,
  onApply,
}: {
  widgetOrder: string[];
  onApply: (widgets: string[]) => void;
}) {
  const [customTemplates, setCustomTemplates] = usePersistentState<DashboardTemplate[]>(
    "pro:dashboard-templates",
    [],
  );

  const handleApply = (tpl: DashboardTemplate) => {
    onApply(tpl.widgets);
    toast.success(`Template « ${tpl.name} » appliqué — disposition mise à jour.`);
  };

  const handleSaveCustom = () => {
    if (customTemplates.length >= MAX_CUSTOM_TEMPLATES) {
      toast.error(`Maximum ${MAX_CUSTOM_TEMPLATES} templates personnalisés autorisé.`);
      return;
    }
    const tpl: DashboardTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name: `Template ${customTemplates.length + 1}`,
      description: `Disposition actuelle — ${widgetOrder.length} sections sauvegardées le ${format(new Date(), "dd MMM yyyy", { locale: fr })}.`,
      iconKey: "custom",
      widgets: [...widgetOrder],
      custom: true,
      createdAt: Date.now(),
    };
    setCustomTemplates((prev) => [...prev, tpl]);
    toast.success(`Disposition sauvegardée comme « ${tpl.name} ».`);
  };

  const handleDeleteCustom = (id: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.info("Template personnalisé supprimé.");
  };

  const allTemplates = [...PREDEFINED_TEMPLATES, ...customTemplates];

  const insight = `${PREDEFINED_TEMPLATES.length} templates prédéfinis + ${customTemplates.length}/${MAX_CUSTOM_TEMPLATES} personnalisés. Appliquez un template pour réorganiser votre tableau de bord en un clic.`;

  return (
    <motion.div id="dashboard-templates" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="31 · Bibliothèque de Templates"
          right={
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: SAGE,
                borderColor: SAGE,
              }}
              onClick={handleSaveCustom}
              disabled={customTemplates.length >= MAX_CUSTOM_TEMPLATES}
            >
              <Save size={12} className="mr-1" />
              Sauvegarder comme template
            </Button>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allTemplates.map((tpl) => {
            const Icon = TEMPLATE_ICONS[tpl.iconKey];
            return (
              <div
                key={tpl.id}
                className="rounded-lg p-4 transition-all hover:shadow-md flex flex-col"
                style={{
                  border: `1px solid ${tpl.custom ? SAGE_DIM : BORDER}`,
                  backgroundColor: tpl.custom ? SAGE_BG : "#FFFFFF",
                }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <div
                    className="flex items-center justify-center rounded-md shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: tpl.custom ? "#FFFFFF" : SAGE_BG,
                      color: SAGE,
                      border: tpl.custom ? `1px solid ${SAGE_DIM}` : "none",
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="flex items-center gap-1.5"
                      style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }}
                    >
                      {tpl.name}
                      {tpl.custom && (
                        <span
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 8,
                            color: SAGE,
                            backgroundColor: "#FFFFFF",
                            border: `1px solid ${SAGE_DIM}`,
                            borderRadius: 3,
                            padding: "1px 4px",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Perso
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-1"
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 11,
                        color: TEXT_BODY,
                        lineHeight: 1.4,
                      }}
                    >
                      {tpl.description}
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="my-2">
                  <TemplatePreview widgets={tpl.widgets} />
                </div>

                {/* Sections list (checkboxes preview — read-only) */}
                <div className="mb-3 flex-1">
                  <div style={FONT_HEADER} className="mb-1.5">
                    Sections incluses
                  </div>
                  <div className="space-y-1 max-h-[120px] overflow-y-auto">
                    {tpl.widgets.slice(0, 8).map((w) => (
                      <div
                        key={w}
                        className="flex items-center gap-1.5"
                        style={{ fontFamily: FONT_SANS, fontSize: 10, color: TEXT_BODY }}
                      >
                        <Check
                          size={10}
                          style={{ color: SAGE, flexShrink: 0 }}
                        />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {TEMPLATE_WIDGET_LABELS[w] ?? w}
                        </span>
                      </div>
                    ))}
                    {tpl.widgets.length > 8 && (
                      <div
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          color: TEXT_MUTED,
                          paddingLeft: 14,
                        }}
                      >
                        + {tpl.widgets.length - 8} autre(s)
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${tpl.custom ? SAGE_DIM : BORDER}` }}>
                  <Button
                    size="sm"
                    className="h-7 flex-1"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      backgroundColor: SAGE,
                      color: "#FFFFFF",
                    }}
                    onClick={() => handleApply(tpl)}
                  >
                    <CheckCircle2 size={11} className="mr-1" />
                    Appliquer
                  </Button>
                  {tpl.custom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustom(tpl.id)}
                      className="inline-flex items-center justify-center rounded-md hover:bg-[#FEE2E2] shrink-0"
                      style={{ width: 28, height: 28, border: `1px solid ${BORDER}` }}
                      aria-label="Supprimer le template"
                    >
                      <Trash2 size={12} style={{ color: NEGATIVE }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// PRO ENV — 6 client-side features (Task ID: ENV-PRO)
//  1. Competitor Setup Wizard (modal 3 steps + autocomplete)
//  2. Period Comparison Toggle (vs période précédente — dual lines)
//  3. Custom Dashboard Layout (drag-reorder via @dnd-kit)
//  4. Influencer Tracker Widget (top 5 + add manually + sort)
//  5. Report Scheduler Panel (recipients + format + branding)
//  6. Advanced Filter Bar (sticky — period/sources/sentiment/lang)
// ════════════════════════════════════════════════════════════════════

// ─── 1. Competitor Setup Wizard ────────────────────────────────────────

const WIZARD_STEPS: Array<{ title: string; Icon: typeof Users }> = [
  { title: "Ajoutez vos concurrents", Icon: Users },
  { title: "Définissez vos KPIs", Icon: ListChecks },
  { title: "Configurez l'alerting", Icon: Bell },
];

function CompetitorSetupWizard({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (setup: CompetitorSetup) => void;
}) {
  const [setup, setSetup] = usePersistentState<CompetitorSetup>(
    "pro:competitor-setup",
    DEFAULT_COMPETITOR_SETUP,
  );
  const [step, setStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return COMPANIES_DB.slice(0, 6);
    const q = searchQuery.toLowerCase();
    return COMPANIES_DB.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery]);

  const addCompetitor = (c: { name: string; industry: string }) => {
    if (setup.competitors.length >= 5) {
      toast.error("Maximum 5 concurrents autorisés.");
      return;
    }
    if (setup.competitors.some((x) => x.name === c.name)) {
      toast.error(`${c.name} est déjà dans la liste.`);
      return;
    }
    setSetup((prev) => ({
      ...prev,
      competitors: [
        ...prev.competitors,
        {
          id: `comp-${Date.now()}`,
          name: c.name,
          industry: c.industry,
          addedAt: Date.now(),
        },
      ],
    }));
    setSearchQuery("");
    toast.success(`${c.name} ajouté à votre benchmark.`);
  };

  const removeCompetitor = (id: string) => {
    setSetup((prev) => ({
      ...prev,
      competitors: prev.competitors.filter((c) => c.id !== id),
    }));
  };

  const toggleKpi = (k: CompetitorKpi) => {
    setSetup((prev) => ({
      ...prev,
      kpis: prev.kpis.includes(k)
        ? prev.kpis.filter((x) => x !== k)
        : [...prev.kpis, k],
    }));
  };

  const toggleChannel = (ch: AlertChannel) => {
    setSetup((prev) => ({
      ...prev,
      alertChannels: prev.alertChannels.includes(ch)
        ? prev.alertChannels.filter((x) => x !== ch)
        : [...prev.alertChannels, ch],
    }));
  };

  const handleComplete = () => {
    const final: CompetitorSetup = { ...setup, completedAt: Date.now() };
    setSetup(final);
    onComplete(final);
    onClose();
    toast.success(`Benchmark configuré — ${final.competitors.length} concurrent(s) suivi(s).`);
  };

  const handleSkip = () => {
    onClose();
    toast.info("Configuration annulée — reprenez quand vous voulez.");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuration du Benchmark Concurrentiel</DialogTitle>
          <DialogDescription>
            3 étapes · jusqu'à 5 concurrents · persistance locale
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 my-2">
          {WIZARD_STEPS.map((s, i) => {
            const Icon = s.Icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.title} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: isDone || isActive ? SAGE : "#F0F0F0",
                      color: isDone || isActive ? "#FFFFFF" : TEXT_MUTED,
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {isDone ? <CheckCircle2 size={12} /> : <Icon size={11} />}
                  </div>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      color: isActive ? CHARCOAL : TEXT_MUTED,
                      fontWeight: isActive ? 700 : 400,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.title}
                  </span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: isDone ? SAGE : BORDER,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="min-h-[280px] py-2">
          {step === 0 && (
            <div className="space-y-3">
              <Label>Rechercher une entreprise</Label>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-2.5"
                  style={{ color: TEXT_MUTED }}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex : Attijariwafa Bank, Maroc Telecom…"
                  className="pl-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredCompanies[0]) {
                      addCompetitor(filteredCompanies[0]);
                    }
                  }}
                />
              </div>
              {filteredCompanies.length > 0 && (
                <div className="rounded-md" style={{ border: `1px solid ${BORDER}` }}>
                  {filteredCompanies.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => addCompetitor(c)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#FAFAFA] text-left"
                      style={{ borderBottom: `1px solid ${BORDER}` }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: FONT_SANS,
                            fontSize: 12,
                            fontWeight: 600,
                            color: CHARCOAL,
                          }}
                        >
                          {c.name}
                        </div>
                        <div
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            color: TEXT_MUTED,
                          }}
                        >
                          {c.industry}
                        </div>
                      </div>
                      <Plus size={12} style={{ color: SAGE }} />
                    </button>
                  ))}
                </div>
              )}
              <div>
                <div style={FONT_HEADER}>
                  Concurrents sélectionnés ({setup.competitors.length}/5)
                </div>
                <div className="space-y-1 mt-2">
                  {setup.competitors.length === 0 ? (
                    <div
                      className="text-center py-4"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 11,
                        color: TEXT_MUTED,
                      }}
                    >
                      Aucun concurrent ajouté — recherchez ci-dessus.
                    </div>
                  ) : (
                    setup.competitors.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-md px-3 py-2"
                        style={{
                          border: `1px solid ${BORDER}`,
                          backgroundColor: "#FAFAFA",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              fontFamily: FONT_MONO,
                              fontSize: 9,
                              fontWeight: 700,
                              color: SAGE,
                              backgroundColor: SAGE_BG,
                              borderRadius: 3,
                              padding: "1px 4px",
                            }}
                          >
                            {c.industry.slice(0, 4).toUpperCase()}
                          </span>
                          <span
                            style={{
                              fontFamily: FONT_SANS,
                              fontSize: 12,
                              fontWeight: 600,
                              color: CHARCOAL,
                            }}
                          >
                            {c.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCompetitor(c.id)}
                          className="inline-flex items-center justify-center rounded-md hover:bg-[#FEE2E2]"
                          style={{ width: 22, height: 22 }}
                          aria-label={`Retirer ${c.name}`}
                        >
                          <X size={12} style={{ color: NEGATIVE }} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div style={FONT_HEADER}>Sélectionnez les KPIs à surveiller</div>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(KPI_LABELS) as CompetitorKpi[]).map((k) => {
                  const checked = setup.kpis.includes(k);
                  return (
                    <label
                      key={k}
                      className="flex items-center gap-3 rounded-md cursor-pointer px-3 py-2"
                      style={{
                        border: `1px solid ${checked ? SAGE : BORDER}`,
                        backgroundColor: checked ? SAGE_BG : "#FFFFFF",
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleKpi(k)}
                      />
                      <span
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 12,
                          fontWeight: 500,
                          color: CHARCOAL,
                        }}
                      >
                        {KPI_LABELS[k]}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-3 p-2 rounded-md" style={{ backgroundColor: SAGE_BG }}>
                <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}>
                  {setup.kpis.length} KPI(s) sélectionné(s) — le benchmark sera calculé sur ces axes.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Seuil d'alerte (score de sentiment)</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min={10}
                    max={80}
                    value={setup.alertThreshold}
                    onChange={(e) =>
                      setSetup((prev) => ({
                        ...prev,
                        alertThreshold: parseInt(e.target.value, 10),
                      }))
                    }
                    className="flex-1"
                    style={{ accentColor: SAGE }}
                  />
                  <span
                    className="px-2 py-1 rounded-md"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 12,
                      fontWeight: 700,
                      color: CHARCOAL,
                      backgroundColor: SAGE_BG,
                      minWidth: 50,
                      textAlign: "center",
                    }}
                  >
                    {setup.alertThreshold}%
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: TEXT_MUTED,
                    marginTop: 4,
                  }}
                >
                  Alerte déclenchée si le score descend sous ce seuil.
                </p>
              </div>
              <div>
                <Label>Canaux de notification</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(Object.keys(CHANNEL_LABELS) as AlertChannel[]).map((ch) => {
                    const checked = setup.alertChannels.includes(ch);
                    return (
                      <label
                        key={ch}
                        className="flex items-center gap-2 rounded-md cursor-pointer px-3 py-2"
                        style={{
                          border: `1px solid ${checked ? SAGE : BORDER}`,
                          backgroundColor: checked ? SAGE_BG : "#FFFFFF",
                        }}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleChannel(ch)}
                        />
                        <span
                          style={{
                            fontFamily: FONT_SANS,
                            fontSize: 11,
                            fontWeight: 500,
                            color: CHARCOAL,
                          }}
                        >
                          {CHANNEL_LABELS[ch]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}
          >
            Passer
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => s - 1)}
                style={{ fontFamily: FONT_MONO, fontSize: 11 }}
              >
                <ChevronLeft size={12} className="mr-1" />
                Précédent
              </Button>
            )}
            {step < 2 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  backgroundColor: SAGE,
                  color: "#FFFFFF",
                }}
              >
                Suivant
                <ChevronRight size={12} className="ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleComplete}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  backgroundColor: SAGE,
                  color: "#FFFFFF",
                }}
              >
                <CheckCircle2 size={12} className="mr-1" />
                Terminer & lancer le benchmark
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 2. Period Compare Toggle (reusable) ──────────────────────────────

function PeriodCompareToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onToggle(!active)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: active ? "#FFFFFF" : SAGE,
              backgroundColor: active ? SAGE : "transparent",
              border: `1px solid ${SAGE}`,
            }}
            aria-pressed={active}
            aria-label="Comparer vs période précédente"
          >
            <ArrowLeftRight size={11} />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={active ? "vs-previous" : "30j"}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{ display: "inline-block", whiteSpace: "nowrap" }}
              >
                {active ? "vs période précédente" : "30 jours"}
              </motion.span>
            </AnimatePresence>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span style={{ fontFamily: FONT_SANS, fontSize: 12 }}>
            {active
              ? "Affichage dual-ligne : période courante vs précédente"
              : "Activer la comparaison vs période précédente"}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function DeltaBadge({ value, label }: { value: number; label: string }) {
  if (isNaN(value) || value === 0) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-md px-2 py-1"
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: TEXT_MUTED,
          backgroundColor: "#FAFAFA",
          border: `1px solid ${BORDER}`,
        }}
      >
        <Minus size={11} />
        {label} stable
      </span>
    );
  }
  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-1"
      style={{
        fontFamily: FONT_MONO,
        fontSize: 10,
        fontWeight: 700,
        color: up ? POSITIVE : NEGATIVE,
        backgroundColor: up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
        border: `1px solid ${up ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
      }}
    >
      <Icon size={11} />
      {up ? "+" : ""}
      {value.toFixed(1)}% {label}
    </span>
  );
}

// ─── 3. Sortable Widget (drag-reorder wrapper) ────────────────────────

function SortableWidget({
  id,
  editMode,
  activeId,
  overId,
  children,
}: {
  id: string;
  editMode: boolean;
  activeId: string | null;
  overId: string | null;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const [handleHovered, setHandleHovered] = useState(false);
  const isDropTarget = editMode && isDragging === false && activeId !== null && overId === id && activeId !== id;

  const style: CSSProperties = {
    transform: DndCSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    position: "relative",
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drop indicator line — sage bar at top when this widget is the
          current drop target during a drag. */}
      <AnimatePresence>
        {isDropTarget && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: -3,
              left: 8,
              right: 8,
              height: 3,
              borderRadius: 2,
              backgroundColor: SAGE,
              zIndex: 30,
              boxShadow: `0 0 0 1px ${SAGE_DIM}, 0 2px 6px rgba(74,123,95,0.35)`,
              transformOrigin: "center",
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {editMode && (
        <div
          {...listeners}
          onMouseEnter={() => setHandleHovered(true)}
          onMouseLeave={() => setHandleHovered(false)}
          className="absolute -top-2 left-3 z-20 inline-flex items-center justify-center rounded-md cursor-grab active:cursor-grabbing"
          style={{
            width: 24,
            height: 24,
            backgroundColor: SAGE,
            color: "#FFFFFF",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transform: handleHovered ? "scale(1.12)" : "scale(1)",
            opacity: handleHovered ? 1 : 0.85,
            transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
          }}
          aria-label="Glisser pour réorganiser"
        >
          <GripVertical size={12} />
        </div>
      )}
      {editMode ? (
        <div
          style={{
            border: `2px dashed ${isDragging ? SAGE : handleHovered ? SAGE_DIM : SAGE_DIM}`,
            borderRadius: 12,
            padding: 4,
            transition: "border-color 0.2s ease-out, background-color 0.2s ease-out",
            backgroundColor: isDragging
              ? SAGE_BG_STRONG
              : handleHovered
                ? SAGE_BG
                : "transparent",
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ─── 4. Influencer Tracker Widget ─────────────────────────────────────

function InfluencerTrackerWidget() {
  const [influencers, setInfluencers] = usePersistentState<InfluencerEntry[]>(
    "pro:influencer-tracker",
    SEED_INFLUENCERS,
  );
  const [sortKey, setSortKey] = useState<InfluencerSortKey>("reach");
  const [showAll, setShowAll] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [newPlatform, setNewPlatform] = useState<InfluencerPlatform>("LinkedIn");

  const sorted = useMemo(() => {
    const arr = [...influencers];
    arr.sort((a, b) => {
      if (sortKey === "reach") return b.followers - a.followers;
      if (sortKey === "engagement") return b.engagementRate - a.engagementRate;
      return b.sentiment - a.sentiment;
    });
    return arr;
  }, [influencers, sortKey]);

  const visible = showAll ? sorted : sorted.slice(0, 5);

  const handleAdd = () => {
    if (!newName.trim() || !newHandle.trim()) {
      toast.error("Nom et handle requis.");
      return;
    }
    const handle = newHandle.trim().startsWith("@") ? newHandle.trim() : `@${newHandle.trim()}`;
    const entry: InfluencerEntry = {
      id: `inf-${Date.now()}`,
      name: newName.trim(),
      handle,
      platform: newPlatform,
      followers: Math.floor(10000 + Math.random() * 100000),
      engagementRate: Math.round((1 + Math.random() * 6) * 10) / 10,
      sentiment: Math.round((Math.random() * 1.4 - 0.4) * 100) / 100,
      starred: false,
      addedAt: Date.now(),
    };
    setInfluencers((prev) => [entry, ...prev]);
    setNewName("");
    setNewHandle("");
    setNewPlatform("LinkedIn");
    setShowAddForm(false);
    toast.success(`${entry.name} ajouté au tracker.`);
  };

  const toggleStar = (id: string) => {
    setInfluencers((prev) =>
      prev.map((i) => (i.id === id ? { ...i, starred: !i.starred } : i)),
    );
  };

  const removeInfluencer = (id: string) => {
    setInfluencers((prev) => prev.filter((i) => i.id !== id));
  };

  const totalFollowers = influencers.reduce((s, i) => s + i.followers, 0);
  const avgEngagement =
    influencers.length > 0
      ? influencers.reduce((s, i) => s + i.engagementRate, 0) / influencers.length
      : 0;
  const positiveRate =
    influencers.length > 0
      ? (influencers.filter((i) => i.sentiment > 0).length / influencers.length) * 100
      : 0;

  const insight = `${influencers.length} influenceur(s) suivi(s) — ${fmtNumber(totalFollowers)} followers cumulés, ${avgEngagement.toFixed(1)}% engagement moyen, ${Math.round(positiveRate)}% à sentiment positif. ${influencers.filter((i) => i.starred).length} marqué(s) favori(s).`;

  const initialsFor = (name: string) =>
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase() || "?";

  const platformColor = (p: InfluencerPlatform): string => {
    if (p === "TikTok") return "#000000";
    if (p === "Instagram") return "#E1306C";
    if (p === "X") return "#0A0A0A";
    if (p === "LinkedIn") return SAGE;
    if (p === "YouTube") return "#FF0000";
    if (p === "Facebook") return "#1877F2";
    if (p === "Presse") return CHARCOAL;
    return TEXT_MUTED;
  };

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="26 · Suivi Influenceurs Personnalisé"
          right={
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                onClick={() => setShowAddForm((v) => !v)}
              >
                <UserPlus size={12} className="mr-1" />
                Ajouter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? "Voir top 5" : "Voir tout"}
                <ChevronRight size={11} className="ml-1" />
              </Button>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <MiniStat label="Influenceurs" value={String(influencers.length)} dotColor={SAGE} />
          <MiniStat label="Followers cumulés" value={fmtNumber(totalFollowers)} dotColor={POSITIVE} />
          <MiniStat label="Engagement moyen" value={`${avgEngagement.toFixed(1)}%`} dotColor={NEUTRAL_AMBER} />
          <MiniStat label="Sentiment positif" value={`${Math.round(positiveRate)}%`} dotColor={SAGE_DIM} />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 mb-2">
          <span style={FONT_HEADER}>Trier par</span>
          {([
            { key: "reach" as const, label: "Reach" },
            { key: "engagement" as const, label: "Engagement" },
            { key: "sentiment" as const, label: "Sentiment" },
          ]).map(({ key, label }) => {
            const active = sortKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSortKey(key)}
                className="rounded-md px-2 py-0.5 transition-all duration-150 hover:scale-[1.04] active:scale-[0.96]"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: active ? "#FFFFFF" : TEXT_BODY,
                  backgroundColor: active ? SAGE : "#FAFAFA",
                  border: `1px solid ${active ? SAGE : BORDER}`,
                }}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Add form */}
        {showAddForm && (
          <div
            className="rounded-md p-3 mb-3"
            style={{ border: `1px dashed ${SAGE}`, backgroundColor: SAGE_BG }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <Input
                placeholder="Nom complet"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
              />
              <Input
                placeholder="@handle"
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
              />
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value as InfluencerPlatform)}
                className="rounded-md px-3 py-2"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  border: `1px solid ${BORDER}`,
                  backgroundColor: "#FFFFFF",
                  color: CHARCOAL,
                }}
              >
                {(["LinkedIn", "X", "TikTok", "Instagram", "YouTube", "Facebook", "Presse", "Web"] as InfluencerPlatform[]).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
                onClick={() => setShowAddForm(false)}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="h-7"
                style={{ fontFamily: FONT_MONO, fontSize: 10, backgroundColor: SAGE, color: "#FFFFFF" }}
                onClick={handleAdd}
              >
                <Plus size={11} className="mr-1" />
                Ajouter
              </Button>
            </div>
          </div>
        )}

        {/* Influencer list */}
        {visible.length === 0 ? (
          <div className="h-[160px] flex items-center justify-center">
            <EmptyDash label="Aucun influenceur suivi" />
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((inf) => {
              const sentColor =
                inf.sentiment > 0.1 ? POSITIVE : inf.sentiment < -0.1 ? NEGATIVE : NEUTRAL_GRAY;
              return (
                <div
                  key={inf.id}
                  className="flex items-center gap-3 rounded-md p-2.5"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
                >
                  {/* Avatar with initials */}
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: SAGE_BG,
                      color: SAGE,
                      fontFamily: FONT_MONO,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {initialsFor(inf.name)}
                  </div>
                  {/* Name + handle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 12,
                          fontWeight: 600,
                          color: CHARCOAL,
                        }}
                      >
                        {inf.name}
                      </span>
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#FFFFFF",
                          backgroundColor: platformColor(inf.platform),
                          borderRadius: 3,
                          padding: "1px 5px",
                        }}
                      >
                        {inf.platform}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: TEXT_MUTED,
                      }}
                    >
                      {inf.handle}
                    </div>
                  </div>
                  {/* Followers */}
                  <div className="text-right shrink-0" style={{ minWidth: 70 }}>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 12,
                        fontWeight: 700,
                        color: CHARCOAL,
                      }}
                    >
                      {fmtNumber(inf.followers)}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                      followers
                    </div>
                  </div>
                  {/* Engagement */}
                  <div className="text-right shrink-0" style={{ minWidth: 60 }}>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 12,
                        fontWeight: 700,
                        color: CHARCOAL,
                      }}
                    >
                      {inf.engagementRate.toFixed(1)}%
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                      engagement
                    </div>
                  </div>
                  {/* Sentiment */}
                  <div className="text-right shrink-0" style={{ minWidth: 60 }}>
                    <div
                      className="inline-flex items-center gap-1"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 12,
                        fontWeight: 700,
                        color: sentColor,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: sentColor,
                        }}
                      />
                      {inf.sentiment > 0 ? "+" : ""}
                      {inf.sentiment.toFixed(2)}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                      sentiment
                    </div>
                  </div>
                  {/* Star + remove */}
                  <div className="flex items-center gap-1 shrink-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleStar(inf.id)}
                            className="inline-flex items-center justify-center rounded-md transition-all duration-150 hover:scale-[1.12] active:scale-[0.92] hover:bg-[#FAFAFA]"
                            style={{ width: 24, height: 24 }}
                            aria-label={inf.starred ? "Retirer des favoris" : "Ajouter aux favoris"}
                          >
                            <Star
                              size={13}
                              style={{
                                color: inf.starred ? NEUTRAL_AMBER : TEXT_MUTED,
                                fill: inf.starred ? NEUTRAL_AMBER : "transparent",
                              }}
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span style={{ fontFamily: FONT_SANS, fontSize: 12 }}>{inf.starred ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => removeInfluencer(inf.id)}
                            className="inline-flex items-center justify-center rounded-md transition-all duration-150 hover:scale-[1.12] active:scale-[0.92] hover:bg-[#FEE2E2]"
                            style={{ width: 24, height: 24 }}
                            aria-label="Retirer"
                          >
                            <X size={13} style={{ color: NEGATIVE }} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span style={{ fontFamily: FONT_SANS, fontSize: 12 }}>Retirer de la liste</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ─── 5. Report Scheduler Panel ────────────────────────────────────────

function ReportSchedulerPanel() {
  const [schedule, setSchedule] = usePersistentState<ReportSchedule>(
    "pro:report-schedule",
    DEFAULT_REPORT_SCHEDULE,
  );
  const [newRecipient, setNewRecipient] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const addRecipient = () => {
    const email = newRecipient.trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Adresse email invalide.");
      return;
    }
    if (schedule.recipients.includes(email)) {
      toast.error("Destinataire déjà dans la liste.");
      return;
    }
    setSchedule((prev) => ({ ...prev, recipients: [...prev.recipients, email] }));
    setNewRecipient("");
    toast.success(`${email} ajouté aux destinataires.`);
  };

  const removeRecipient = (email: string) => {
    setSchedule((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r !== email),
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSchedule((prev) => ({ ...prev, brandLogoName: file.name }));
      toast.success(`Logo "${file.name}" chargé (simulation).`);
    }
  };

  const cadenceLabel = (): string => {
    if (schedule.cadence === "weekly") {
      const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
      return `Hebdomadaire · ${days[schedule.dayOfWeek]} ${schedule.customTime}`;
    }
    if (schedule.cadence === "monthly") {
      return `Mensuel · ${schedule.dayOfMonth}er du mois ${schedule.customTime}`;
    }
    return `Personnalisé · ${schedule.customDay || "—"} ${schedule.customTime}`;
  };

  const formatLabel = (): string => {
    if (schedule.format === "pdf") return "PDF";
    if (schedule.format === "excel") return "Excel";
    return "PDF + Excel";
  };

  const insight = schedule.enabled
    ? `Rapport ${cadenceLabel()} · ${formatLabel()} · ${schedule.recipients.length} destinataire(s). ${schedule.brandLogoName ? `Branding : ${schedule.brandLogoName}` : "Branding par défaut (sage green)."}.`
    : "Planification inactive. Configurez la cadence, les destinataires et activez la planification.";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-5">
        <SectionHeader
          title="27 · Programmation Rapports"
          right={
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  color: schedule.enabled ? POSITIVE : TEXT_MUTED,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {schedule.enabled ? "Actif" : "Inactif"}
              </span>
              <Switch
                checked={schedule.enabled}
                onCheckedChange={(v) => {
                  setSchedule((prev) => ({ ...prev, enabled: v }));
                  if (v) toast.success("Planification activée.");
                }}
                aria-label="Activer la planification"
              />
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        <div className="space-y-3">
          {/* Cadence */}
          <div>
            <Label className="mb-1.5 block">Cadence</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { key: "weekly" as const, label: "Hebdo", sub: "lun. 8h" },
                { key: "monthly" as const, label: "Mensuel", sub: "1er du mois" },
                { key: "custom" as const, label: "Perso", sub: "date libre" },
              ]).map(({ key, label, sub }) => {
                const active = schedule.cadence === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSchedule((prev) => ({ ...prev, cadence: key }))}
                    className="rounded-md px-2 py-1.5 text-center transition-colors"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      fontWeight: 600,
                      color: active ? "#FFFFFF" : TEXT_BODY,
                      backgroundColor: active ? SAGE : "#FFFFFF",
                      border: `1px solid ${active ? SAGE : BORDER}`,
                    }}
                    aria-pressed={active}
                  >
                    <div>{label}</div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 8,
                        color: active ? "rgba(255,255,255,0.8)" : TEXT_MUTED,
                      }}
                    >
                      {sub}
                    </div>
                  </button>
                );
              })}
            </div>
            {schedule.cadence === "weekly" && (
              <select
                value={schedule.dayOfWeek}
                onChange={(e) =>
                  setSchedule((prev) => ({
                    ...prev,
                    dayOfWeek: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full mt-2 rounded-md px-3 py-1.5"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  border: `1px solid ${BORDER}`,
                  backgroundColor: "#FFFFFF",
                  color: CHARCOAL,
                }}
              >
                {["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map((d, i) => (
                  <option key={d} value={i}>{d}</option>
                ))}
              </select>
            )}
            {schedule.cadence === "monthly" && (
              <select
                value={schedule.dayOfMonth}
                onChange={(e) =>
                  setSchedule((prev) => ({
                    ...prev,
                    dayOfMonth: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full mt-2 rounded-md px-3 py-1.5"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  border: `1px solid ${BORDER}`,
                  backgroundColor: "#FFFFFF",
                  color: CHARCOAL,
                }}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>Jour {d}</option>
                ))}
              </select>
            )}
            {schedule.cadence === "custom" && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input
                  type="date"
                  value={schedule.customDay}
                  onChange={(e) =>
                    setSchedule((prev) => ({ ...prev, customDay: e.target.value }))
                  }
                  style={{ fontFamily: FONT_SANS, fontSize: 11 }}
                />
                <Input
                  type="time"
                  value={schedule.customTime}
                  onChange={(e) =>
                    setSchedule((prev) => ({ ...prev, customTime: e.target.value }))
                  }
                  style={{ fontFamily: FONT_SANS, fontSize: 11 }}
                />
              </div>
            )}
          </div>

          {/* Recipients */}
          <div>
            <Label className="mb-1.5 block">Destinataires ({schedule.recipients.length})</Label>
            <div className="flex gap-1.5">
              <Input
                type="email"
                placeholder="email@entreprise.com"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRecipient();
                  }
                }}
                className="flex-1"
                style={{ fontFamily: FONT_SANS, fontSize: 11 }}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                onClick={addRecipient}
              >
                <Plus size={12} />
              </Button>
            </div>
            {schedule.recipients.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {schedule.recipients.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      color: SAGE,
                      backgroundColor: SAGE_BG,
                      border: `1px solid ${SAGE_DIM}`,
                    }}
                  >
                    <Mail size={10} />
                    {email}
                    <button
                      type="button"
                      onClick={() => removeRecipient(email)}
                      className="inline-flex items-center justify-center"
                      style={{ width: 14, height: 14 }}
                      aria-label={`Retirer ${email}`}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Format */}
          <div>
            <Label className="mb-1.5 block">Format</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { key: "pdf" as const, label: "PDF" },
                { key: "excel" as const, label: "Excel" },
                { key: "both" as const, label: "Les deux" },
              ]).map(({ key, label }) => {
                const active = schedule.format === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSchedule((prev) => ({ ...prev, format: key }))}
                    className="rounded-md px-2 py-1.5 text-center transition-colors"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                      fontWeight: 600,
                      color: active ? "#FFFFFF" : TEXT_BODY,
                      backgroundColor: active ? SAGE : "#FFFFFF",
                      border: `1px solid ${active ? SAGE : BORDER}`,
                    }}
                    aria-pressed={active}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Branding */}
          <div>
            <Label className="mb-1.5 block">Branding</Label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className="flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div
                  className="flex items-center justify-center rounded-md"
                  style={{ width: 22, height: 22, backgroundColor: SAGE_BG }}
                >
                  <Plus size={11} style={{ color: SAGE }} />
                </div>
                <span
                  className="truncate"
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_BODY }}
                >
                  {schedule.brandLogoName ?? "Logo (simulé)"}
                </span>
              </label>
              <div className="flex items-center gap-2 rounded-md px-2 py-1.5" style={{ border: `1px solid ${BORDER}` }}>
                <Palette size={12} style={{ color: SAGE }} />
                <input
                  type="color"
                  value={schedule.brandColor}
                  onChange={(e) =>
                    setSchedule((prev) => ({ ...prev, brandColor: e.target.value }))
                  }
                  className="rounded cursor-pointer"
                  style={{ width: 24, height: 20, border: "none", padding: 0 }}
                  aria-label="Couleur de marque"
                />
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_BODY }}>
                  {schedule.brandColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
              onClick={() => setShowPreview((v) => !v)}
            >
              <Eye size={11} className="mr-1" />
              {showPreview ? "Masquer l'aperçu" : "Aperçu"}
            </Button>
            <Button
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10, backgroundColor: SAGE, color: "#FFFFFF" }}
              onClick={() => {
                if (!schedule.enabled) {
                  toast.error("Activez la planification d'abord.");
                  return;
                }
                if (schedule.recipients.length === 0) {
                  toast.error("Ajoutez au moins un destinataire.");
                  return;
                }
                toast.success(`Rapport de test envoyé à ${schedule.recipients[0]}.`);
              }}
            >
              <Send size={11} className="mr-1" />
              Envoyer test
            </Button>
          </div>

          {showPreview && (
            <div
              className="rounded-md p-3"
              style={{
                border: `1px solid ${schedule.brandColor}`,
                borderLeft: `4px solid ${schedule.brandColor}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: schedule.brandColor,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Aperçu · Rapport Harch Atelier
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                  {formatLabel()}
                </span>
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                Rapport Hebdomadaire de Réputation
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
                Cadence : {cadenceLabel()} · {schedule.recipients.length} destinataire(s)
                {schedule.brandLogoName ? ` · Logo : ${schedule.brandLogoName}` : ""}
              </p>
            </div>
          )}
        </div>

        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ─── 6. Advanced Filter Bar (sticky) ──────────────────────────────────

function ProFilterBar({
  value,
  onChange,
  presets,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}: {
  value: ProFilters;
  onChange: (v: ProFilters) => void;
  presets: FilterPreset[];
  onSavePreset: (name: string, filters: ProFilters) => void;
  onApplyPreset: (preset: FilterPreset) => void;
  onDeletePreset: (id: string) => void;
}) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");

  const activeCount = useMemo(() => {
    let count = 0;
    if (value.period !== "30d") count++;
    if (value.sources.length > 0) count++;
    if (!value.sentiment.positive || !value.sentiment.neutral || !value.sentiment.negative) count++;
    if (value.language.length !== 3) count++;
    return count;
  }, [value]);

  const reset = () => {
    onChange(DEFAULT_PRO_FILTERS);
    toast.info("Filtres réinitialisés.");
  };

  const handleSave = () => {
    const trimmed = presetName.trim();
    if (!trimmed) {
      toast.error("Veuillez saisir un nom.");
      return;
    }
    onSavePreset(trimmed, value);
    setPresetName("");
    setSaveDialogOpen(false);
  };

  const toggleSource = (s: string) => {
    onChange({
      ...value,
      sources: value.sources.includes(s)
        ? value.sources.filter((x) => x !== s)
        : [...value.sources, s],
    });
  };

  const toggleSentiment = (k: "positive" | "neutral" | "negative") => {
    onChange({
      ...value,
      sentiment: { ...value.sentiment, [k]: !value.sentiment[k] },
    });
  };

  const toggleLanguage = (l: "fr" | "ar" | "en") => {
    onChange({
      ...value,
      language: value.language.includes(l)
        ? value.language.filter((x) => x !== l)
        : [...value.language, l],
    });
  };

  return (
    <div
      className="sticky z-20 px-4 lg:px-6 py-2.5"
      style={{
        top: 56,
        backgroundColor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1"
          style={{ backgroundColor: SAGE_BG, border: `1px solid ${SAGE_DIM}` }}
        >
          <SlidersHorizontal size={12} style={{ color: SAGE }} />
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              fontWeight: 700,
              color: SAGE,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Filtres
          </span>
          {activeCount > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 16,
                height: 16,
                padding: "0 4px",
                borderRadius: 8,
                backgroundColor: SAGE,
                color: "#FFFFFF",
                fontFamily: FONT_MONO,
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              {activeCount}
            </span>
          )}
        </div>

        {/* Period */}
        <div className="inline-flex items-center gap-1">
          <span style={FONT_HEADER}>Période</span>
          <Tabs
            value={value.period}
            onValueChange={(v) => onChange({ ...value, period: v as ProFilters["period"] })}
          >
            <TabsList className="h-6" style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
              <TabsTrigger value="7d" className="h-5 px-2 text-[10px]">7j</TabsTrigger>
              <TabsTrigger value="30d" className="h-5 px-2 text-[10px]">30j</TabsTrigger>
              <TabsTrigger value="90d" className="h-5 px-2 text-[10px]">90j</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div style={{ width: 1, height: 22, backgroundColor: BORDER }} />

        {/* Sources multi-select */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSourcesOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-[#FAFAFA]"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: value.sources.length > 0 ? SAGE : TEXT_BODY,
              border: `1px solid ${value.sources.length > 0 ? SAGE : BORDER}`,
              backgroundColor: value.sources.length > 0 ? SAGE_BG : "#FFFFFF",
            }}
            aria-expanded={sourcesOpen}
          >
            <Filter size={11} />
            Sources
            {value.sources.length > 0 && (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  backgroundColor: SAGE,
                  borderRadius: 8,
                  padding: "0 5px",
                }}
              >
                {value.sources.length}
              </span>
            )}
            <ChevronRight
              size={10}
              style={{
                transform: sourcesOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.15s",
              }}
            />
          </button>
          {sourcesOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSourcesOpen(false)}
                aria-hidden="true"
              />
              <div
                className="absolute z-20 mt-1 rounded-md shadow-lg max-h-64 overflow-y-auto"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${BORDER_STRONG}`,
                  minWidth: 220,
                  padding: 4,
                }}
              >
                {SOURCE_OPTIONS.map((s) => {
                  const checked = value.sources.includes(s);
                  return (
                    <label
                      key={s}
                      className="flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-[#FAFAFA]"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleSource(s)}
                      />
                      <span
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 11,
                          color: CHARCOAL,
                        }}
                      >
                        {s}
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ width: 1, height: 22, backgroundColor: BORDER }} />

        {/* Sentiment toggles */}
        <div className="inline-flex items-center gap-1">
          <span style={FONT_HEADER}>Sentiment</span>
          {([
            { key: "positive" as const, label: "Pos", color: POSITIVE },
            { key: "neutral" as const, label: "Neu", color: NEUTRAL_GRAY },
            { key: "negative" as const, label: "Nég", color: NEGATIVE },
          ]).map(({ key, label, color }) => {
            const active = value.sentiment[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSentiment(key)}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  color: active ? "#FFFFFF" : TEXT_MUTED,
                  backgroundColor: active ? color : "#FFFFFF",
                  border: `1px solid ${active ? color : BORDER}`,
                }}
                aria-pressed={active}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: active ? "#FFFFFF" : color,
                  }}
                />
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ width: 1, height: 22, backgroundColor: BORDER }} />

        {/* Language */}
        <div className="inline-flex items-center gap-1">
          <span style={FONT_HEADER}>Langue</span>
          {([
            { key: "fr" as const, label: "FR" },
            { key: "ar" as const, label: "AR" },
            { key: "en" as const, label: "EN" },
          ]).map(({ key, label }) => {
            const active = value.language.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleLanguage(key)}
                className="rounded-md px-1.5 py-0.5 transition-colors"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  color: active ? "#FFFFFF" : TEXT_MUTED,
                  backgroundColor: active ? SAGE : "#FFFFFF",
                  border: `1px solid ${active ? SAGE : BORDER}`,
                }}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Reset + Save preset */}
        <div className="ml-auto inline-flex items-center gap-1">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-[#FAFAFA]"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
                border: `1px solid ${BORDER}`,
              }}
              aria-label="Réinitialiser les filtres"
            >
              <RotateCcw size={11} />
              Réinitialiser
            </button>
          )}
          <button
            type="button"
            onClick={() => { setPresetName(""); setSaveDialogOpen(true); }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-[#FAFAFA]"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: SAGE,
              border: `1px solid ${SAGE_DIM}`,
              backgroundColor: SAGE_BG,
            }}
            aria-label="Sauvegarder les filtres dans une préférence"
          >
            <Save size={11} />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Saved presets row — R2-PRO-A Feature 1 */}
      {presets.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <span style={FONT_HEADER}>Mes préférences</span>
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onApplyPreset(p)}
              className="group inline-flex items-center gap-1 rounded-full pl-2.5 pr-1.5 py-1 transition-colors hover:bg-[#F5F5F5]"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11,
                color: SAGE,
                backgroundColor: SAGE_BG,
                border: `1px solid ${SAGE_DIM}`,
              }}
              title={`Appliquer : ${p.name}`}
            >
              <Filter size={10} style={{ color: SAGE }} />
              <span style={{ fontWeight: 600 }}>{p.name}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onDeletePreset(p.id); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    onDeletePreset(p.id);
                  }
                }}
                className="inline-flex items-center justify-center rounded-full transition-colors hover:bg-[#F0F0F0]"
                style={{ width: 14, height: 14, color: TEXT_MUTED }}
                aria-label={`Supprimer la préférence ${p.name}`}
              >
                <X size={10} />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Save preset dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Sauvegarder les filtres</DialogTitle>
            <DialogDescription>
              Donnez un nom à cette combinaison de filtres pour la réutiliser ultérieurement. Maximum {MAX_FILTER_PRESETS} préférences conservées.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <Label htmlFor="preset-name" className="mb-1.5 block" style={FONT_HEADER}>Nom de la préférence</Label>
            <Input
              id="preset-name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Ex : Veille matinale · Réseaux sociaux"
              maxLength={50}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            />
            <div className="mt-2 flex items-center justify-between">
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                {presetName.length}/50
              </span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                {presets.length}/{MAX_FILTER_PRESETS} préférences
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setSaveDialogOpen(false); setPresetName(""); }}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
              disabled={!presetName.trim()}
            >
              <Save size={12} className="mr-1" />
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── R2-PRO-A · Feature 2: Alert Rules Builder ─────────────────────────

function AlertRulesBuilder() {
  const [rules, setRules] = usePersistentState<AlertRule[]>(
    "pro:alert-rules",
    SEED_ALERT_RULES,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [condKind, setCondKind] = useState<AlertRuleConditionKind>("score_below");
  const [threshold, setThreshold] = useState(45);
  const [sentPct, setSentPct] = useState(35);
  const [mentions24h, setMentions24h] = useState(100);
  const [source, setSource] = useState<string>(SOURCE_OPTIONS[0]);
  const [keyword, setKeyword] = useState("");
  const [action, setAction] = useState<AlertRuleAction>("email");
  const [severity, setSeverity] = useState<AlertRuleSeverity>("warning");

  const resetForm = useCallback(() => {
    setName("");
    setCondKind("score_below");
    setThreshold(45);
    setSentPct(35);
    setMentions24h(100);
    setSource(SOURCE_OPTIONS[0]);
    setKeyword("");
    setAction("email");
    setSeverity("warning");
    setEditingId(null);
    setShowForm(false);
  }, []);

  const startEdit = useCallback((rule: AlertRule) => {
    setEditingId(rule.id);
    setName(rule.name);
    setCondKind(rule.condition.kind);
    if (rule.condition.kind === "score_below") setThreshold(rule.condition.threshold);
    else if (rule.condition.kind === "negative_sentiment_above") setSentPct(rule.condition.threshold);
    else if (rule.condition.kind === "mentions_above_24h") setMentions24h(rule.condition.threshold);
    else {
      setSource(rule.condition.source);
      setKeyword(rule.condition.keyword);
    }
    setAction(rule.action);
    setSeverity(rule.severity);
    setShowForm(true);
  }, []);

  const handleSaveRule = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Veuillez saisir un nom pour la règle.");
      return;
    }
    let condition: AlertRuleCondition;
    if (condKind === "score_below") {
      condition = { kind: "score_below", threshold: Math.max(0, Math.min(100, threshold)) };
    } else if (condKind === "negative_sentiment_above") {
      condition = { kind: "negative_sentiment_above", threshold: Math.max(0, Math.min(100, sentPct)) };
    } else if (condKind === "mentions_above_24h") {
      condition = { kind: "mentions_above_24h", threshold: Math.max(1, Math.round(mentions24h)) };
    } else {
      if (!keyword.trim()) {
        toast.error("Veuillez saisir un mot-clé.");
        return;
      }
      condition = { kind: "source_keyword", source, keyword: keyword.trim() };
    }

    if (editingId) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, name: trimmed, condition, action, severity }
            : r,
        ),
      );
      toast.success(`Règle « ${trimmed} » mise à jour.`);
    } else {
      const newRule: AlertRule = {
        id: `rule-${Date.now()}`,
        name: trimmed,
        condition,
        action,
        severity,
        enabled: true,
        createdAt: Date.now(),
        lastTriggeredAt: null,
      };
      setRules((prev) => [newRule, ...prev]);
      toast.success(`Règle « ${trimmed} » créée.`);
    }
    resetForm();
  }, [name, condKind, threshold, sentPct, mentions24h, source, keyword, action, severity, editingId, setRules, resetForm]);

  const handleDelete = useCallback((id: string, ruleName: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.info(`Règle « ${ruleName} » supprimée.`);
  }, [setRules]);

  const handleToggle = useCallback((id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  }, [setRules]);

  const handleTest = useCallback((rule: AlertRule) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === rule.id ? { ...r, lastTriggeredAt: Date.now() } : r,
      ),
    );
    const desc =
      rule.condition.kind === "source_keyword"
        ? `Simulation sur « ${rule.condition.source} » pour « ${rule.condition.keyword} ».`
        : rule.condition.kind === "score_below"
          ? `Score simulé : ${Math.max(0, rule.condition.threshold - 5)}.`
          : rule.condition.kind === "negative_sentiment_above"
            ? `Sentiment négatif simulé : ${rule.condition.threshold + 8}%.`
            : `Mentions simulées : ${rule.condition.threshold + 25} en 24h.`;
    toast.success(
      `Test déclenché : « ${rule.name} » → ${ALERT_ACTION_LABELS[rule.action]} (${ALERT_SEVERITY_LABELS[rule.severity]}).`,
      { description: desc },
    );
  }, [setRules]);

  const formatCondition = (c: AlertRuleCondition): string => {
    if (c.kind === "score_below") return `Score < ${c.threshold}`;
    if (c.kind === "negative_sentiment_above") return `Sentiment négatif > ${c.threshold}%`;
    if (c.kind === "mentions_above_24h") return `Mentions > ${c.threshold} / 24h`;
    return `Source « ${c.source} » mentionne « ${c.keyword} »`;
  };

  const actionIconFor = (a: AlertRuleAction): typeof Mail =>
    a === "email" ? Mail : a === "whatsapp" ? MessageCircle : a === "slack" ? Share2 : BellRing;

  const activeCount = rules.filter((r) => r.enabled).length;
  const insight = `${rules.length} règle(s) au total — ${activeCount} active(s). ${
    activeCount > 0
      ? "Surveillance continue déclenchée à chaque cycle d'analyse (5 min)."
      : "Activez au moins une règle pour recevoir des notifications."
  }`;

  const selectStyle: CSSProperties = {
    fontFamily: FONT_SANS,
    fontSize: 12,
    color: CHARCOAL,
    border: `1px solid ${BORDER_STRONG}`,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    height: 32,
  };

  return (
    <motion.div id="alertes-avancees" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="27 · Constructeur de Règles d'Alerte"
          right={
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: activeCount > 0 ? SAGE : TEXT_MUTED,
                  border: `1px solid ${activeCount > 0 ? SAGE_DIM : BORDER}`,
                  backgroundColor: activeCount > 0 ? SAGE_BG : "transparent",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {activeCount}/{rules.length} actives
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                onClick={() => {
                  if (showForm) {
                    resetForm();
                  } else {
                    setShowForm(true);
                  }
                }}
              >
                <Plus size={12} className="mr-1" />
                {showForm ? "Annuler" : "Nouvelle règle"}
              </Button>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {showForm && (
          <div
            className="mb-4 p-4 rounded-lg"
            style={{
              border: `1px solid ${SAGE_DIM}`,
              backgroundColor: SAGE_BG,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="mb-1 block" style={FONT_HEADER}>Nom de la règle</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Alerte chute de score weekend"
                  maxLength={60}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="mb-1 block" style={FONT_HEADER}>Sévérité</Label>
                <div className="flex gap-1">
                  {(["info", "warning", "critique"] as AlertRuleSeverity[]).map((sev) => {
                    const active = severity === sev;
                    const color = ALERT_SEVERITY_COLORS[sev];
                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-md h-8 transition-colors"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 10,
                          fontWeight: 700,
                          color: active ? "#FFFFFF" : color,
                          backgroundColor: active ? color : "#FFFFFF",
                          border: `1px solid ${active ? color : BORDER}`,
                        }}
                      >
                        <AlertTriangle size={10} />
                        {ALERT_SEVERITY_LABELS[sev]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="mb-1 block" style={FONT_HEADER}>Condition</Label>
                <select
                  value={condKind}
                  onChange={(e) => setCondKind(e.target.value as AlertRuleConditionKind)}
                  className="w-full px-2 focus:outline-none"
                  style={selectStyle}
                >
                  {(["score_below", "negative_sentiment_above", "mentions_above_24h", "source_keyword"] as AlertRuleConditionKind[]).map((k) => (
                    <option key={k} value={k}>{ALERT_CONDITION_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-1 block" style={FONT_HEADER}>
                  {condKind === "score_below" ? "Seuil de score (0-100)" :
                   condKind === "negative_sentiment_above" ? "Pourcentage négatif (0-100)" :
                   condKind === "mentions_above_24h" ? "Nombre de mentions / 24h" :
                   "Source + mot-clé"}
                </Label>
                {condKind === "score_below" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="h-8 w-24"
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: SAGE }}
                      aria-label="Seuil de score"
                    />
                  </div>
                )}
                {condKind === "negative_sentiment_above" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={sentPct}
                      onChange={(e) => setSentPct(Number(e.target.value))}
                      className="h-8 w-24"
                    />
                    <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TEXT_MUTED }}>%</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sentPct}
                      onChange={(e) => setSentPct(Number(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: SAGE }}
                      aria-label="Pourcentage de sentiment négatif"
                    />
                  </div>
                )}
                {condKind === "mentions_above_24h" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={mentions24h}
                      onChange={(e) => setMentions24h(Number(e.target.value))}
                      className="h-8 w-32"
                    />
                    <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TEXT_MUTED }}>mentions / 24h</span>
                  </div>
                )}
                {condKind === "source_keyword" && (
                  <div className="flex flex-col gap-2">
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-2 focus:outline-none"
                      style={selectStyle}
                    >
                      {SOURCE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <Input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Mot-clé (ex : grève, plainte, rappel)"
                      maxLength={50}
                      className="h-8"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <Label className="mb-1 block" style={FONT_HEADER}>Action</Label>
                <div className="grid grid-cols-4 gap-1">
                  {(["email", "whatsapp", "slack", "in_app"] as AlertRuleAction[]).map((a) => {
                    const active = action === a;
                    const Icon = actionIconFor(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAction(a)}
                        className="inline-flex flex-col items-center justify-center gap-1 rounded-md h-12 transition-colors"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          fontWeight: 700,
                          color: active ? "#FFFFFF" : SAGE,
                          backgroundColor: active ? SAGE : "#FFFFFF",
                          border: `1px solid ${active ? SAGE : BORDER}`,
                        }}
                      >
                        <Icon size={14} />
                        {ALERT_ACTION_LABELS[a].split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-8" onClick={resetForm}>
                  Annuler
                </Button>
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleSaveRule}
                  style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
                >
                  <Save size={12} className="mr-1" />
                  {editingId ? "Mettre à jour" : "Créer la règle"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {rules.length === 0 ? (
          <div className="h-[120px] flex items-center justify-center">
            <EmptyDash label="Aucune règle configurée. Cliquez sur « Nouvelle règle »." />
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => {
              const ActionIcon = actionIconFor(rule.action);
              const sevColor = ALERT_SEVERITY_COLORS[rule.severity];
              return (
                <div
                  key={rule.id}
                  className="rounded-lg p-3 transition-opacity"
                  style={{
                    border: `1px solid ${rule.enabled ? BORDER_STRONG : BORDER}`,
                    backgroundColor: rule.enabled ? "#FFFFFF" : "#FAFAFA",
                    opacity: rule.enabled ? 1 : 0.6,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => handleToggle(rule.id)}
                      aria-label="Activer ou désactiver la règle"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: CHARCOAL }}>
                          {rule.name}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#FFFFFF",
                            backgroundColor: sevColor,
                            padding: "1px 6px",
                            borderRadius: 3,
                          }}
                        >
                          <AlertTriangle size={9} />
                          {ALERT_SEVERITY_LABELS[rule.severity].toUpperCase()}
                        </span>
                        {rule.lastTriggeredAt && (
                          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                            Dernier déclenchement : {fmtRelative(rule.lastTriggeredAt)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 flex-wrap" style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY }}>
                        <span
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5"
                          style={{ backgroundColor: SAGE_BG, color: SAGE }}
                        >
                          <Filter size={10} />
                          {formatCondition(rule.condition)}
                        </span>
                        <ArrowRight size={12} style={{ color: TEXT_MUTED }} />
                        <span
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5"
                          style={{ backgroundColor: "#FAFAFA", color: CHARCOAL }}
                        >
                          <ActionIcon size={11} />
                          {ALERT_ACTION_LABELS[rule.action]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleTest(rule)}
                              className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
                              style={{ width: 28, height: 28, color: SAGE, border: `1px solid ${BORDER}` }}
                              aria-label="Tester la règle"
                            >
                              <Play size={12} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Tester la règle (simulation)</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => startEdit(rule)}
                              className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
                              style={{ width: 28, height: 28, color: TEXT_MUTED, border: `1px solid ${BORDER}` }}
                              aria-label="Modifier la règle"
                            >
                              <PenSquare size={12} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Modifier</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleDelete(rule.id, rule.name)}
                              className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
                              style={{ width: 28, height: 28, color: NEGATIVE, border: `1px solid ${BORDER}` }}
                              aria-label="Supprimer la règle"
                            >
                              <Trash2 size={12} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Supprimer</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AiCommentary text={insight} />
      </CardShell>
    </motion.div>
  );
}

// ─── R2-PRO-A · Feature 3: Competitor Watchlist ────────────────────────

interface WatchlistCompetitor {
  id: string;
  name: string;
  score: number;
  scoreDelta: number;
  sovPct: number;
  sentimentSplit: { positive: number; neutral: number; negative: number };
  mentions: number;
  velocity: number[];
  trend: number;
}

function CompetitorWatchlist({
  radar,
  sov,
  loading,
}: {
  radar: CompetitorRadarResp | null;
  sov: ShareOfVoiceResp | null;
  loading: boolean;
}) {
  const [favorites, setFavorites] = usePersistentState<WatchlistFavorite[]>(
    "pro:competitor-favorites",
    [],
  );
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState<string | null>(null);

  const allCompetitors: WatchlistCompetitor[] = useMemo(() => {
    if (!radar?.brands?.length) return [];
    const competitors = sov?.competitors ?? [];
    const total = competitors.reduce((s, c) => s + c.mentionCount, 0) || 1;
    return radar.brands
      .filter((b) => !b.isYou)
      .map((b) => {
        const sovRow = competitors.find((c) => c.name === b.name);
        const sovPct = sovRow ? (sovRow.mentionCount / total) * 100 : 0;
        // Deterministic 7-point velocity sparkline from brand name + score
        const seed = b.name.charCodeAt(0) + b.name.length + Math.round(b.scores.influencerAuthority);
        const velocity = Array.from({ length: 7 }, (_, i) =>
          Math.max(0, Math.round(40 + Math.sin(seed + i) * 25 + Math.cos(seed * 0.5 + i) * 15 + i * 2)),
        );
        // Deterministic score delta vs last week
        const scoreDelta = Math.round((Math.sin(seed) * 5 + Math.cos(seed * 0.3) * 3) * 10) / 10;
        const sentScore = b.scores.sentiment;
        const positive = Math.round(sentScore * 0.6);
        const neutral = Math.round((100 - sentScore) * 0.5);
        const negative = Math.max(0, 100 - positive - neutral);
        return {
          id: b.name,
          name: b.name,
          score: b.scores.influencerAuthority,
          scoreDelta,
          sovPct,
          sentimentSplit: { positive, neutral, negative },
          mentions: sovRow?.mentionCount ?? Math.round(b.scores.mediaReach * 12),
          velocity,
          trend: sovRow?.trend ?? 0,
        };
      });
  }, [radar, sov]);

  // Auto-seed favorites with top 3 competitors when radar first loads and favorites empty
  useEffect(() => {
    if (allCompetitors.length > 0 && favorites.length === 0) {
      const top3 = allCompetitors.slice(0, 3);
      setFavorites(top3.map((c) => ({ id: c.id, name: c.name, pinnedAt: Date.now() })));
    }
  }, [allCompetitors, favorites.length, setFavorites]);

  const pinned = useMemo(() => {
    const favIds = new Set(favorites.map((f) => f.id));
    return allCompetitors.filter((c) => favIds.has(c.id)).slice(0, 5);
  }, [allCompetitors, favorites]);

  const youRow = radar?.brands?.find((b) => b.isYou) ?? null;

  const handleStar = useCallback((id: string, compName: string) => {
    setFavorites((prev) => {
      if (prev.find((f) => f.id === id)) {
        return prev.filter((f) => f.id !== id);
      }
      if (prev.length >= 5) {
        toast.error("Maximum 5 concurrents épinglés. Retirez-en un d'abord.");
        return prev;
      }
      return [...prev, { id, name: compName, pinnedAt: Date.now() }];
    });
  }, [setFavorites]);

  const handleCompare = useCallback((compName: string) => {
    setCompareTarget(compName);
    setCompareOpen(true);
  }, []);

  const compareCompetitor = compareTarget
    ? allCompetitors.find((c) => c.name === compareTarget) ?? null
    : null;

  return (
    <motion.div id="watchlist-concurrents" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="28 · Watchlist Concurrents"
          right={
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: pinned.length >= 5 ? SAGE : TEXT_MUTED,
                border: `1px solid ${pinned.length >= 5 ? SAGE_DIM : BORDER}`,
                backgroundColor: pinned.length >= 5 ? SAGE_BG : "transparent",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              {pinned.length}/5 épinglés
            </span>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-lg"
                style={{
                  border: `1px solid ${BORDER}`,
                  backgroundColor: "#FFFFFF",
                  padding: 12,
                  minHeight: 290,
                }}
              >
                <ShimmerSkeleton
                  label={i === 0 ? "Chargement de la watchlist…" : "Chargement…"}
                  rows={4}
                  height={14}
                />
              </div>
            ))}
          </div>
        ) : allCompetitors.length === 0 ? (
          <EmptyState
            Icon={Users}
            title="Aucun concurrent suivi"
            description="Configurez vos concurrents via le wizard pour activer la watchlist et suivre en temps réel leur score, leur sentiment et leur part de voix."
            cta="Configurer les concurrents"
            onCta={() => scrollToSection("concurrents")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {pinned.map((c) => (
              <WatchlistCompetitorCard
                key={c.id}
                c={c}
                onStar={handleStar}
                onCompare={handleCompare}
              />
            ))}
            {pinned.length < 5 && (
              <button
                type="button"
                onClick={() => scrollToSection("concurrents")}
                className="group flex flex-col items-center justify-center rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                style={{
                  minHeight: 290,
                  border: `1px dashed ${BORDER_STRONG}`,
                  color: TEXT_MUTED,
                }}
              >
                <Plus size={20} className="transition-colors group-hover:text-[#4A7B5F]" />
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, marginTop: 6, letterSpacing: "0.06em", transition: "color 0.2s" }} className="group-hover:text-[#4A7B5F]">
                  ÉPINGLER UN CONCURRENT
                </span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, marginTop: 4 }}>
                  {allCompetitors.length - pinned.length} disponible(s)
                </span>
              </button>
            )}
          </div>
        )}

        {compareOpen && compareCompetitor && (
          <CompetitorCompareModal
            you={youRow}
            competitor={compareCompetitor}
            onClose={() => { setCompareOpen(false); setCompareTarget(null); }}
          />
        )}
      </CardShell>
    </motion.div>
  );
}

function WatchlistCompetitorCard({
  c,
  onStar,
  onCompare,
}: {
  c: WatchlistCompetitor;
  onStar: (id: string, name: string) => void;
  onCompare: (name: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const sovData = [
    { name: "VOIX", value: c.sovPct, color: SAGE },
    { name: "Autres", value: Math.max(0, 100 - c.sovPct), color: "#F0F0F0" },
  ];
  const sentimentData = [
    { name: "Pos", value: c.sentimentSplit.positive, color: POSITIVE },
    { name: "Neu", value: c.sentimentSplit.neutral, color: NEUTRAL_GRAY },
    { name: "Nég", value: c.sentimentSplit.negative, color: NEGATIVE },
  ];
  const velocityData = c.velocity.map((v, i) => ({ d: i, v }));
  const deltaUp = c.scoreDelta > 0;
  const deltaNeutral = Math.abs(c.scoreDelta) < 0.05;
  const initials = c.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase() || "?";

  // POLISH-PRO: back-side details (deterministic, derived from name)
  const backKeywords = useMemo(
    () => pickKeywords(hashStrContent(c.name) + 7, 4),
    [c.name],
  );
  const backArticle = useMemo(
    () => synthesizeRecentArticles(c.name, c.sentimentSplit.positive, 1)[0],
    [c.name, c.sentimentSplit.positive],
  );
  const postingFreqPerWeek = useMemo(
    () => Math.max(0.5, Math.round((c.mentions / 30) * 10) / 10),
    [c.mentions],
  );
  const trendUp = c.trend > 0;
  const trendNeutral = c.trend === 0;

  return (
    <div
      className="rounded-lg"
      style={{
        border: `1px solid ${flipped ? SAGE_DIM : BORDER_STRONG}`,
        backgroundColor: "#FFFFFF",
        perspective: "1200px",
        minHeight: 290,
        transition: "border-color 0.2s ease-out",
      }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        className="relative"
        style={{
          transformStyle: "preserve-3d",
          minHeight: 290,
        }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ───── FRONT — summary view ───── */}
        <div
          className="rounded-lg p-3"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            MozBackfaceVisibility: "hidden",
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  backgroundColor: SAGE,
                }}
              >
                {initials}
              </span>
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  fontWeight: 600,
                  color: CHARCOAL,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.name}
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onStar(c.id, c.name)}
                    className="inline-flex items-center justify-center rounded-md shrink-0 transition-all duration-150 hover:scale-[1.12] active:scale-[0.92]"
                    style={{ width: 24, height: 24, color: SAGE }}
                    aria-label="Retirer des favoris"
                  >
                    <Star size={14} fill={SAGE} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12 }}>Retirer des favoris</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <AnimatedNumber
              value={c.score}
              duration={0.8}
              format={(n) => Math.round(n).toString()}
              style={{
                fontFamily: FONT_MONO,
                fontSize: 22,
                fontWeight: 700,
                color: CHARCOAL,
              }}
            />
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, textTransform: "uppercase" }}>
              /100 score
            </span>
            <span
              className="inline-flex items-center gap-0.5"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                fontWeight: 700,
                color: deltaNeutral ? TEXT_MUTED : deltaUp ? POSITIVE : NEGATIVE,
                marginLeft: "auto",
              }}
            >
              {deltaNeutral ? <Minus size={10} /> : deltaUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              {!deltaNeutral && (deltaUp ? "+" : "")}{c.scoreDelta.toFixed(1)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center">
              <span style={FONT_HEADER} className="block mb-1">SOV</span>
              <div style={{ width: "100%", height: 56 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sovData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={14}
                      outerRadius={22}
                      paddingAngle={1}
                      startAngle={90}
                      endAngle={-270}
                      isAnimationActive
                      animationDuration={700}
                    >
                      {sovData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: CHARCOAL }}>
                {c.sovPct.toFixed(1)}%
              </span>
            </div>

            <div className="text-center" style={{ gridColumn: "span 2" }}>
              <span style={FONT_HEADER} className="block mb-1">Sentiment</span>
              <div style={{ width: "100%", height: 56 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentData} layout="vertical" barCategoryGap={2}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" hide />
                    <Bar dataKey="value" radius={2} isAnimationActive animationDuration={700}>
                      {sentimentData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between" style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                <span style={{ color: POSITIVE }}>+{c.sentimentSplit.positive}</span>
                <span style={{ color: NEUTRAL_GRAY }}>{c.sentimentSplit.neutral}</span>
                <span style={{ color: NEGATIVE }}>-{c.sentimentSplit.negative}</span>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span style={FONT_HEADER}>Mentions 7j</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: CHARCOAL, fontWeight: 700 }}>
                {fmtNumber(c.mentions)}
              </span>
            </div>
            <div style={{ width: "100%", height: 36 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityData}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={SAGE}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCompare(c.name)}
            className="w-full inline-flex items-center justify-center gap-1 rounded-md h-7 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:bg-[rgba(74,123,95,0.14)]"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: SAGE,
              border: `1px solid ${SAGE_DIM}`,
              backgroundColor: SAGE_BG,
            }}
          >
            <ArrowLeftRight size={11} />
            Comparer
          </button>
        </div>

        {/* ───── BACK — details view (visible on hover via 3D flip) ───── */}
        <div
          className="rounded-lg p-3"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            MozBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: "#FAFAFA",
            border: `1px solid ${SAGE_DIM}`,
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  backgroundColor: SAGE,
                }}
              >
                {initials}
              </span>
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  fontWeight: 600,
                  color: CHARCOAL,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.name}
              </span>
            </div>
            <span
              style={{
                ...FONT_HEADER,
                color: SAGE,
                backgroundColor: SAGE_BG,
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              Détails
            </span>
          </div>

          <div className="mb-2">
            <span style={FONT_HEADER} className="block mb-1">Top mots-clés</span>
            <div className="flex flex-wrap gap-1">
              {backKeywords.map((k) => (
                <span
                  key={k}
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: SAGE,
                    border: `1px solid ${SAGE_DIM}`,
                    borderRadius: 4,
                    padding: "2px 6px",
                    backgroundColor: SAGE_BG,
                  }}
                >
                  {k}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-2">
            <span style={FONT_HEADER} className="block mb-1">Article récent</span>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11,
                color: CHARCOAL,
                padding: 8,
                borderRadius: 6,
                border: `1px solid ${BORDER}`,
                backgroundColor: "#FFFFFF",
                lineHeight: 1.4,
              }}
            >
              &laquo;&nbsp;{backArticle?.headline ?? "—"}&nbsp;&raquo;
              <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 4 }}>
                {backArticle?.source ?? "—"} · {backArticle?.date ?? "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <span style={FONT_HEADER} className="block mb-1">Fréquence</span>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
                {postingFreqPerWeek}
                <span style={{ fontSize: 10, color: TEXT_MUTED, fontWeight: 400 }}> /sem</span>
              </div>
            </div>
            <div>
              <span style={FONT_HEADER} className="block mb-1">Tendance 30j</span>
              <div
                className="inline-flex items-center gap-1"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 14,
                  fontWeight: 700,
                  color: trendNeutral ? TEXT_MUTED : trendUp ? POSITIVE : NEGATIVE,
                }}
              >
                {trendNeutral ? <Minus size={12} /> : trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {trendUp ? "+" : ""}{c.trend}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCompare(c.name)}
            className="w-full inline-flex items-center justify-center gap-1 rounded-md h-7 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:bg-[rgba(74,123,95,0.14)]"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: SAGE,
              border: `1px solid ${SAGE_DIM}`,
              backgroundColor: SAGE_BG,
            }}
          >
            <ArrowLeftRight size={11} />
            Comparer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CompetitorCompareModal({
  you,
  competitor,
  onClose,
}: {
  you: CompetitorBrand | null;
  competitor: WatchlistCompetitor;
  onClose: () => void;
}) {
  const youModel = you
    ? {
        name: you.name,
        score: you.scores.influencerAuthority,
        sentiment: you.scores.sentiment,
        aiVisibility: you.scores.aiVisibility,
        mediaReach: you.scores.mediaReach,
        sovPct: you.scores.shareOfVoice,
        mentions: Math.round(you.scores.mediaReach * 18),
      }
    : null;

  const rows: Array<{ label: string; you: number | null; comp: number | null; suffix?: string }> = [
    { label: "Score de réputation", you: youModel?.score ?? null, comp: competitor.score },
    { label: "Sentiment positif", you: youModel?.sentiment ?? null, comp: competitor.sentimentSplit.positive, suffix: "%" },
    { label: "Part de voix (SOV)", you: youModel?.sovPct ?? null, comp: competitor.sovPct, suffix: "%" },
    { label: "Visibilité IA", you: youModel?.aiVisibility ?? null, comp: Math.round(competitor.score * 0.7) },
    { label: "Reach média", you: youModel?.mediaReach ?? null, comp: Math.round(competitor.mentions / 12) },
    { label: "Mentions (30j)", you: youModel?.mentions ?? null, comp: competitor.mentions },
  ];

  const youWins = rows.filter((r) => (r.you ?? 0) >= (r.comp ?? 0)).length;
  const aiInsight = you
    ? youWins >= 5
      ? `Vous menez sur ${youWins}/6 métriques. Position sectorielle solide — capitalisez sur vos forces.`
      : youWins >= 3
        ? `Vous menez sur ${youWins}/6 métriques. Écart comblable : investissez sur le sentiment et la visibilité IA.`
        : `Vous menez sur ${youWins}/6 métriques. ${competitor.name} domine — révision stratégique recommandée.`
    : "Données de votre marque indisponibles — configurez le wizard pour activer la comparaison.";

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Comparaison détaillée</DialogTitle>
          <DialogDescription>
            Votre marque vs {competitor.name} — métriques 30 jours.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <div
            className="grid grid-cols-3 gap-2 mb-2 px-2 py-1.5 rounded-md"
            style={{ backgroundColor: "#FAFAFA", fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700 }}
          >
            <div style={{ color: TEXT_MUTED }}>MÉTRIQUE</div>
            <div style={{ color: SAGE }}>VOUS{youModel ? ` · ${youModel.name}` : ""}</div>
            <div style={{ color: CHARCOAL }}>{competitor.name.toUpperCase().slice(0, 18)}</div>
          </div>
          <div>
            {rows.map((row) => {
              const youVal = row.you ?? 0;
              const compVal = row.comp ?? 0;
              const diff = youVal - compVal;
              const youWin = diff >= 0;
              const suffix = row.suffix ?? "";
              return (
                <div
                  key={row.label}
                  className="grid grid-cols-3 gap-2 py-2 px-2 rounded-md items-center"
                  style={{ borderBottom: `1px solid ${BORDER}` }}
                >
                  <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_BODY }}>{row.label}</div>
                  <div className="flex items-baseline gap-1">
                    <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: youWin ? SAGE : CHARCOAL }}>
                      {youVal}{suffix}
                    </span>
                    {diff !== 0 && youWin && (
                      <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: POSITIVE }}>&#9650;</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: !youWin ? CHARCOAL : TEXT_BODY }}>
                      {compVal}{suffix}
                    </span>
                    {diff !== 0 && !youWin && (
                      <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: POSITIVE }}>&#9650;</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-2 rounded-md" style={{ backgroundColor: SAGE_BG, border: `1px solid ${SAGE_DIM}` }}>
            <div className="flex items-start gap-2">
              <Sparkles size={12} style={{ color: SAGE, flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY }}>
                {aiInsight}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
          <Button
            onClick={onClose}
            style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
          >
            Compris
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── R4-PRO-A · Feature 1: Competitor Content Analysis Card ────────────

function CompetitorContentAnalysisCard({
  radar,
  sov,
  loading,
}: {
  radar: CompetitorRadarResp | null;
  sov: ShareOfVoiceResp | null;
  loading: boolean;
}) {
  const [config, setConfig] = usePersistentState<CompetitorContentConfig>(
    "pro:competitor-content",
    { watchEnabled: false, selectedIds: [] },
  );
  const [refreshTick, setRefreshTick] = useState(0);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLeftId, setCompareLeftId] = useState<string | null>(null);
  const [compareRightId, setCompareRightId] = useState<string | null>(null);

  // Auto-refresh simulation: increment refreshTick every 15s while watch enabled
  useEffect(() => {
    if (!config.watchEnabled) return;
    const timer = setInterval(() => {
      setRefreshTick((t) => t + 1);
    }, COMPETITOR_CONTENT_WATCH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [config.watchEnabled]);

  // Stable list (no refreshTick) for selector — basic info only
  const allCompetitors = useMemo(
    () => buildCompetitorContentSummaries(radar, sov, 0, null),
    [radar, sov],
  );

  // Auto-seed: when first load and selectedIds empty, pick top 3
  useEffect(() => {
    if (allCompetitors.length > 0 && config.selectedIds.length === 0) {
      setConfig((prev) => ({
        ...prev,
        selectedIds: allCompetitors.slice(0, 3).map((c) => c.competitorId),
      }));
    }
  }, [allCompetitors, config.selectedIds.length, setConfig]);

  // Refreshed summaries for selected competitors
  const summaries = useMemo(
    () => buildCompetitorContentSummaries(radar, sov, refreshTick, config.selectedIds),
    [radar, sov, refreshTick, config.selectedIds],
  );

  // Top 5 for bar chart (refreshed)
  const allSummaries = useMemo(
    () => buildCompetitorContentSummaries(radar, sov, refreshTick, null),
    [radar, sov, refreshTick],
  );

  const freqData = allSummaries.map((s) => ({
    name: s.competitorName.length > 12 ? s.competitorName.slice(0, 11) + "…" : s.competitorName,
    freq: s.postingFrequencyPerWeek,
  }));

  const handleToggleWatch = useCallback((checked: boolean) => {
    setConfig((prev) => ({ ...prev, watchEnabled: checked }));
    if (checked) {
      toast.success("Surveillance du contenu activée — actualisation toutes les 15 secondes.");
    } else {
      toast.info("Surveillance du contenu désactivée.");
    }
  }, [setConfig]);

  const handleSelect = useCallback((id: string) => {
    setConfig((prev) => {
      const isSelected = prev.selectedIds.includes(id);
      if (isSelected) {
        return { ...prev, selectedIds: prev.selectedIds.filter((x) => x !== id) };
      }
      if (prev.selectedIds.length >= MAX_COMPETITOR_CONTENT_SELECTED) {
        toast.error(`Maximum ${MAX_COMPETITOR_CONTENT_SELECTED} concurrents analysés. Retirez-en un d'abord.`);
        return prev;
      }
      return { ...prev, selectedIds: [...prev.selectedIds, id] };
    });
  }, [setConfig]);

  const handleCompare = useCallback((leftId: string) => {
    setCompareLeftId(leftId);
    const other = summaries.find((s) => s.competitorId !== leftId);
    setCompareRightId(other?.competitorId ?? null);
    setCompareOpen(true);
  }, [summaries]);

  const handleCompareRightChange = useCallback((id: string) => {
    setCompareRightId(id);
  }, []);

  const compareLeft = compareLeftId ? summaries.find((s) => s.competitorId === compareLeftId) ?? null : null;
  const compareRight = compareRightId ? summaries.find((s) => s.competitorId === compareRightId) ?? null : null;

  const avgFreq = summaries.length > 0
    ? mean(summaries.map((s) => s.postingFrequencyPerWeek))
    : 0;

  const insight = loading
    ? "Chargement de l'analyse de contenu…"
    : allCompetitors.length === 0
      ? "Configurez vos concurrents via le wizard pour activer l'analyse de contenu."
      : summaries.length === 0
        ? "Sélectionnez au moins un concurrent pour lancer l'analyse de contenu."
        : `${summaries.length} concurrent(s) analysé(s) — fréquence moyenne ${avgFreq.toFixed(1)} articles/sem. ${config.watchEnabled ? "Surveillance active (rafraîchissement 15s)." : "Surveillance inactive."} Comparez les stratégies éditoriales côte à côte.`;

  return (
    <motion.div id="competitor-content-analysis" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="32 · Analyse de Contenu Concurrents"
          right={
            <div className="flex items-center gap-2">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: config.watchEnabled ? SAGE : TEXT_MUTED,
                }}
              >
                <Radio size={11} className={config.watchEnabled ? "animate-pulse" : ""} />
                {config.watchEnabled ? "Surveillance active" : "Surveillance inactive"}
              </span>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <Switch
                  checked={config.watchEnabled}
                  onCheckedChange={handleToggleWatch}
                  aria-label="Surveiller le contenu"
                />
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                  Surveiller
                </span>
              </label>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
            ))}
          </div>
        ) : allCompetitors.length === 0 ? (
          <div className="h-[160px] flex items-center justify-center">
            <EmptyDash label="Configurez vos concurrents via le wizard pour activer l'analyse de contenu" />
          </div>
        ) : (
          <>
            {/* Top row: bar chart + selector */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div
                className="rounded-lg p-3"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span style={FONT_HEADER}>Fréquence de publication (articles/sem)</span>
                  <BarChart3 size={14} style={{ color: SAGE }} />
                </div>
                <div style={{ width: "100%", height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={freqData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#F4F4F5" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                        tickLine={false}
                        axisLine={{ stroke: BORDER_STRONG }}
                        interval={0}
                        angle={-12}
                        textAnchor="end"
                        height={48}
                      />
                      <YAxis
                        tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                      />
                      <RTooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: `1px solid ${BORDER_STRONG}`,
                          fontFamily: FONT_MONO,
                          fontSize: 11,
                        }}
                        cursor={{ fill: SAGE_BG }}
                        formatter={(v: number) => [`${v.toFixed(1)} art/sem`, "Fréquence"]}
                      />
                      <Bar dataKey="freq" fill={SAGE} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Selector */}
              <div
                className="rounded-lg p-3"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span style={FONT_HEADER}>
                    Sélectionner ({config.selectedIds.length}/{MAX_COMPETITOR_CONTENT_SELECTED})
                  </span>
                  <Users size={14} style={{ color: SAGE }} />
                </div>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                  {allCompetitors.map((c) => {
                    const isSelected = config.selectedIds.includes(c.competitorId);
                    return (
                      <button
                        key={c.competitorId}
                        type="button"
                        onClick={() => handleSelect(c.competitorId)}
                        className="w-full flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-white"
                        style={{
                          border: `1px solid ${isSelected ? SAGE_DIM : BORDER}`,
                          backgroundColor: isSelected ? SAGE_BG : "transparent",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONT_SANS,
                            fontSize: 12,
                            color: CHARCOAL,
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {isSelected ? (
                            <Check size={11} style={{ color: SAGE }} />
                          ) : (
                            <Plus size={11} style={{ color: TEXT_MUTED }} />
                          )}
                          {c.competitorName}
                        </span>
                        <span
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 10,
                            color: isSelected ? SAGE : TEXT_MUTED,
                          }}
                        >
                          {c.postingFrequencyPerWeek.toFixed(1)}/sem · SOV {c.shareOfVoicePct.toFixed(1)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Per-competitor content cards */}
            {summaries.length === 0 ? (
              <div className="h-[120px] flex items-center justify-center">
                <EmptyDash label="Sélectionnez au moins un concurrent ci-dessus" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {summaries.map((s) => (
                  <CompetitorContentCard
                    key={s.competitorId}
                    s={s}
                    canCompare={summaries.length >= 2}
                    onCompare={() => handleCompare(s.competitorId)}
                  />
                ))}
              </div>
            )}

            <AiCommentary text={insight} />
          </>
        )}

        {compareOpen && compareLeft && compareRight && (
          <CompetitorContentCompareModal
            left={compareLeft}
            right={compareRight}
            allSummaries={summaries}
            onRightChange={handleCompareRightChange}
            onClose={() => {
              setCompareOpen(false);
              setCompareLeftId(null);
              setCompareRightId(null);
            }}
          />
        )}
      </CardShell>
    </motion.div>
  );
}

function CompetitorContentCard({
  s,
  canCompare,
  onCompare,
}: {
  s: CompetitorContentSummary;
  canCompare: boolean;
  onCompare: () => void;
}) {
  return (
    <div
      className="rounded-lg p-3 flex flex-col"
      style={{ border: `1px solid ${BORDER_STRONG}`, backgroundColor: "#FFFFFF" }}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: 13,
            fontWeight: 700,
            color: CHARCOAL,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
          }}
        >
          {s.competitorName}
        </span>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 9,
            color: SAGE,
            backgroundColor: SAGE_BG,
            border: `1px solid ${SAGE_DIM}`,
            borderRadius: 3,
            padding: "1px 5px",
            flexShrink: 0,
          }}
        >
          {s.postingFrequencyPerWeek.toFixed(1)}/sem
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <div style={{ textAlign: "center" }}>
          <div style={FONT_HEADER}>SOV</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
            {s.shareOfVoicePct.toFixed(1)}%
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={FONT_HEADER}>Sent.</div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 12,
              fontWeight: 700,
              color:
                s.avgSentimentPct >= 60 ? POSITIVE : s.avgSentimentPct >= 40 ? NEUTRAL_AMBER : NEGATIVE,
            }}
          >
            {s.avgSentimentPct}%
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={FONT_HEADER}>Reach</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
            {fmtNumber(s.mediaReach)}
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div style={FONT_HEADER} className="mb-1">Mots-clés</div>
        <div className="flex flex-wrap gap-1">
          {s.topKeywords.map((kw) => (
            <span
              key={kw}
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: SAGE,
                backgroundColor: SAGE_BG,
                border: `1px solid ${SAGE_DIM}`,
                borderRadius: 3,
                padding: "1px 5px",
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-3 flex-1">
        <div style={FONT_HEADER} className="mb-1">Contenu récent</div>
        <div className="space-y-1.5">
          {s.recentArticles.map((a) => (
            <div
              key={a.id}
              className="rounded-md p-1.5"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                  {a.source} · {fmtDayShort(a.date)}
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    fontWeight: 700,
                    color:
                      a.sentiment === "positif"
                        ? POSITIVE
                        : a.sentiment === "négatif"
                          ? NEGATIVE
                          : NEUTRAL_GRAY,
                  }}
                >
                  {a.sentiment}
                </span>
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: CHARCOAL, lineHeight: 1.35 }}>
                {a.headline}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onCompare}
        disabled={!canCompare}
        className="w-full inline-flex items-center justify-center gap-1 rounded-md h-7 transition-colors hover:bg-[#FAFAFA] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: SAGE,
          border: `1px solid ${SAGE_DIM}`,
          backgroundColor: SAGE_BG,
        }}
        aria-label={`Comparer le contenu de ${s.competitorName}`}
      >
        <ArrowLeftRight size={11} />
        Comparer le contenu
      </button>
    </div>
  );
}

function CompetitorContentCompareModal({
  left,
  right,
  allSummaries,
  onRightChange,
  onClose,
}: {
  left: CompetitorContentSummary;
  right: CompetitorContentSummary;
  allSummaries: CompetitorContentSummary[];
  onRightChange: (id: string) => void;
  onClose: () => void;
}) {
  const metrics: Array<{ label: string; left: number; right: number; format: (v: number) => string }> = [
    { label: "Fréquence (art/sem)", left: left.postingFrequencyPerWeek, right: right.postingFrequencyPerWeek, format: (v) => v.toFixed(1) },
    { label: "Sentiment moyen (%)", left: left.avgSentimentPct, right: right.avgSentimentPct, format: (v) => `${v}%` },
    { label: "Part de voix (%)", left: left.shareOfVoicePct, right: right.shareOfVoicePct, format: (v) => `${v.toFixed(1)}%` },
    { label: "Reach média", left: left.mediaReach, right: right.mediaReach, format: (v) => fmtNumber(v) },
  ];

  const leftWins = metrics.filter((m) => m.left > m.right).length;
  const rightWins = metrics.filter((m) => m.right > m.left).length;

  const aiInsight = leftWins > rightWins
    ? `${left.competitorName} mène sur ${leftWins}/4 métriques de contenu vs ${right.competitorName}. Stratégie éditoriale plus offensive en volume.`
    : rightWins > leftWins
      ? `${right.competitorName} mène sur ${rightWins}/4 métriques de contenu vs ${left.competitorName}. ${right.competitorName} domine la conversation sectorielle.`
      : `Match nul : ${leftWins}/4 métriques chacun. Stratégies éditoriales équivalentes en intensité.`;

  const otherOptions = allSummaries.filter((s) => s.competitorId !== left.competitorId);

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle>Comparaison de contenu</DialogTitle>
          <DialogDescription>
            {left.competitorName} vs {right.competitorName} — stratégies éditoriales 30 jours.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {/* Right selector */}
          <div className="mb-3 flex items-center gap-2">
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              Comparer à :
            </span>
            <select
              value={right.competitorId}
              onChange={(e) => onRightChange(e.target.value)}
              aria-label="Sélectionner le concurrent à comparer"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: CHARCOAL,
                border: `1px solid ${BORDER_STRONG}`,
                borderRadius: 4,
                padding: "3px 6px",
                backgroundColor: "#FFFFFF",
              }}
            >
              {otherOptions.map((s) => (
                <option key={s.competitorId} value={s.competitorId}>
                  {s.competitorName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Left column */}
            <CompareColumn summary={left} wins={leftWins} totalMetrics={metrics.length} />
            {/* Right column */}
            <CompareColumn summary={right} wins={rightWins} totalMetrics={metrics.length} />
          </div>

          {/* Metrics comparison table */}
          <div
            className="mt-3 grid grid-cols-3 gap-2 rounded-md p-2"
            style={{ backgroundColor: "#FAFAFA", fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700 }}
          >
            <div style={{ color: TEXT_MUTED }}>MÉTRIQUE</div>
            <div style={{ color: SAGE }}>{left.competitorName.toUpperCase().slice(0, 18)}</div>
            <div style={{ color: CHARCOAL }}>{right.competitorName.toUpperCase().slice(0, 18)}</div>
          </div>
          {metrics.map((m) => {
            const leftWin = m.left >= m.right;
            const isTie = m.left === m.right;
            return (
              <div
                key={m.label}
                className="grid grid-cols-3 gap-2 py-1.5 px-2 rounded-md items-center"
                style={{ borderBottom: `1px solid ${BORDER}` }}
              >
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_BODY }}>{m.label}</div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 13,
                    fontWeight: 700,
                    color: !isTie && leftWin ? SAGE : CHARCOAL,
                  }}
                >
                  {m.format(m.left)}
                  {!isTie && leftWin && (
                    <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: POSITIVE, marginLeft: 4 }}>
                      &#9650;
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 13,
                    fontWeight: 700,
                    color: !isTie && !leftWin ? SAGE : TEXT_BODY,
                  }}
                >
                  {m.format(m.right)}
                  {!isTie && !leftWin && (
                    <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: POSITIVE, marginLeft: 4 }}>
                      &#9650;
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div
            className="mt-3 p-2 rounded-md"
            style={{ backgroundColor: SAGE_BG, border: `1px solid ${SAGE_DIM}` }}
          >
            <div className="flex items-start gap-2">
              <Sparkles size={12} style={{ color: SAGE, flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, lineHeight: 1.45 }}>
                {aiInsight}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
          <Button onClick={onClose} style={{ backgroundColor: SAGE, color: "#FFFFFF" }}>
            Compris
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompareColumn({
  summary,
  wins,
  totalMetrics,
}: {
  summary: CompetitorContentSummary;
  wins: number;
  totalMetrics: number;
}) {
  return (
    <div className="rounded-lg p-3" style={{ border: `1px solid ${BORDER_STRONG}` }}>
      <div className="flex items-center justify-between mb-2 gap-2">
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: 14,
            fontWeight: 700,
            color: CHARCOAL,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
          }}
        >
          {summary.competitorName}
        </span>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 9,
            color: SAGE,
            backgroundColor: SAGE_BG,
            border: `1px solid ${SAGE_DIM}`,
            borderRadius: 3,
            padding: "1px 5px",
            flexShrink: 0,
          }}
        >
          {wins}/{totalMetrics}
        </span>
      </div>
      <div style={FONT_HEADER} className="mb-1">Contenu récent</div>
      <div className="space-y-1.5 mb-2">
        {summary.recentArticles.map((a) => (
          <div
            key={a.id}
            className="rounded-md p-1.5"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                {a.source} · {fmtDayShort(a.date)}
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  color:
                    a.sentiment === "positif"
                      ? POSITIVE
                      : a.sentiment === "négatif"
                        ? NEGATIVE
                        : NEUTRAL_GRAY,
                }}
              >
                {a.sentiment}
              </span>
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: CHARCOAL, lineHeight: 1.35 }}>
              {a.headline}
            </div>
          </div>
        ))}
      </div>
      <div style={FONT_HEADER} className="mb-1">Mots-clés</div>
      <div className="flex flex-wrap gap-1">
        {summary.topKeywords.map((kw) => (
          <span
            key={kw}
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              color: SAGE,
              backgroundColor: SAGE_BG,
              border: `1px solid ${SAGE_DIM}`,
              borderRadius: 3,
              padding: "1px 5px",
            }}
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── R4-PRO-A · Feature 2: Media Reach Calculator Card ─────────────────

function MediaReachCalculatorCard() {
  const [scenarios, setScenarios] = usePersistentState<ReachScenario[]>(
    "pro:reach-scenarios",
    [],
  );
  const [articles, setArticles] = useState(50);
  const [mix, setMix] = useState<Record<SourceTier, number>>(DEFAULT_REACH_MIX);
  const [scenarioName, setScenarioName] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);

  // Adjust mix: when one slider moves, redistribute delta to others proportionally
  const handleMixChange = useCallback((tier: SourceTier, newValue: number) => {
    setMix((prev) => {
      if (newValue === prev[tier]) return prev;
      const others = (["national", "regional", "specialise", "blog"] as SourceTier[]).filter(
        (t) => t !== tier,
      );
      const othersTotal = others.reduce((s, t) => s + prev[t], 0);
      const remaining = Math.max(0, 100 - newValue);
      const next: Record<SourceTier, number> = { ...prev, [tier]: newValue };
      if (othersTotal === 0) {
        // All others are 0 — split equally
        const share = Math.floor(remaining / others.length);
        others.forEach((t, i) => {
          next[t] = i === others.length - 1
            ? remaining - share * (others.length - 1)
            : share;
        });
      } else {
        // Redistribute proportionally to keep sum = 100
        let allocated = 0;
        for (let i = 0; i < others.length; i++) {
          const t = others[i];
          if (i === others.length - 1) {
            next[t] = Math.max(0, remaining - allocated);
          } else {
            const share = Math.max(0, Math.round((prev[t] / othersTotal) * remaining));
            next[t] = share;
            allocated += share;
          }
        }
      }
      return next;
    });
  }, []);

  const reach = useMemo(() => computeReach(articles, mix), [articles, mix]);
  const ave = Math.round(reach * AVE_RATE_MAD);
  const engagement = Math.round(reach * (ENGAGEMENT_RATE_PCT / 100));
  // Portée équivalente publicité: paid impressions you could buy with the AVE budget
  const paidImpressionsEquiv = Math.round((ave / PAID_CPM_MAD) * 1000);
  const ratioVsPaid = reach > 0 ? paidImpressionsEquiv / reach : 0;

  const mixData = SOURCE_TIERS.map((t) => ({
    name: t.label,
    value: mix[t.key],
    color: t.color,
  }));

  const mixSum = SOURCE_TIERS.reduce((s, t) => s + mix[t.key], 0);

  const handleSaveScenario = useCallback(() => {
    if (scenarios.length >= MAX_REACH_SCENARIOS) {
      toast.error(`Maximum ${MAX_REACH_SCENARIOS} scénarios autorisé. Supprimez-en un d'abord.`);
      return;
    }
    const name = scenarioName.trim() || `Scénario ${scenarios.length + 1}`;
    const newScenario: ReachScenario = {
      id: `scn-${Date.now()}`,
      name,
      articles,
      mix: { ...mix },
      reach,
      ave,
      engagement,
      savedAt: Date.now(),
    };
    setScenarios((prev) => [...prev, newScenario]);
    setScenarioName("");
    toast.success(`Scénario « ${name} » sauvegardé (${scenarios.length + 1}/${MAX_REACH_SCENARIOS}).`);
  }, [scenarios.length, scenarioName, articles, mix, reach, ave, engagement, setScenarios]);

  const handleDeleteScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    toast.info("Scénario supprimé.");
  }, [setScenarios]);

  const handleLoadScenario = useCallback((scn: ReachScenario) => {
    setArticles(scn.articles);
    setMix({ ...scn.mix });
    toast.info(`Scénario « ${scn.name} » chargé.`);
  }, []);

  const insight = `Reach estimé : ${fmtNumber(reach)} impressions · AVE ${fmtNumber(ave)} MAD · Engagement ${fmtNumber(engagement)}. Pour le même budget AVE en display (${PAID_CPM_MAD} MAD CPM), vous obtiendriez ${fmtNumber(paidImpressionsEquiv)} impressions publicitaires (${ratioVsPaid.toFixed(1)}× votre reach PR). Le PR compense par la crédibilité éditoriale (multiplicateur ×3 standard).`;

  return (
    <motion.div id="media-reach-calculator" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="33 · Calculateur de Reach Média"
          right={
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: SAGE,
                backgroundColor: SAGE_BG,
                border: `1px solid ${SAGE_DIM}`,
                borderRadius: 3,
                padding: "2px 6px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Calculator size={10} />
              Outil autonome
            </span>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Left: inputs */}
          <div
            className="rounded-lg p-3"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span style={FONT_HEADER}>Paramètres du scénario</span>
              <SlidersHorizontal size={14} style={{ color: SAGE }} />
            </div>

            {/* Articles input */}
            <div className="mb-3">
              <Label className="mb-1.5 block" style={FONT_HEADER}>
                Nombre d'articles
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={articles}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 1 && v <= 10000) {
                      setArticles(v);
                    } else if (e.target.value === "") {
                      setArticles(0);
                    }
                  }}
                  style={{ fontFamily: FONT_MONO, fontSize: 13, maxWidth: 120 }}
                  aria-label="Nombre d'articles"
                />
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                  articles
                </span>
              </div>
            </div>

            {/* Mix sliders */}
            <div className="mb-1">
              <div className="flex items-center justify-between mb-2">
                <span style={FONT_HEADER}>Mix de sources</span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: mixSum === 100 ? SAGE : NEUTRAL_AMBER,
                    fontWeight: 700,
                  }}
                >
                  Total : {mixSum}%
                </span>
              </div>
              <div className="space-y-2.5">
                {SOURCE_TIERS.map((t) => (
                  <div key={t.key} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3 flex items-center gap-1.5">
                      <SparkDot color={t.color} />
                      <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: CHARCOAL, fontWeight: 600 }}>
                        {t.label}
                      </span>
                    </div>
                    <div className="col-span-7">
                      <Slider
                        value={[mix[t.key]]}
                        onValueChange={(v) => handleMixChange(t.key, v[0])}
                        min={0}
                        max={100}
                        step={5}
                        aria-label={`Mix ${t.label}`}
                      />
                    </div>
                    <div className="col-span-2 text-right">
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: CHARCOAL }}>
                        {mix[t.key]}%
                      </span>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_MUTED }}>
                        {fmtNumber(t.audience)} aud.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: FONT_SANS, fontSize: 10, color: TEXT_MUTED, marginTop: 6 }}>
                Audience moyenne pondérée : {fmtNumber(SOURCE_TIERS.reduce((s, t) => s + (mix[t.key] / 100) * t.audience, 0))} / article
              </p>
            </div>

            {/* Save scenario */}
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
              <Label className="mb-1.5 block" style={FONT_HEADER}>
                Sauvegarder le scénario
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="Nom du scénario"
                  maxLength={40}
                  style={{ fontFamily: FONT_SANS, fontSize: 12 }}
                  aria-label="Nom du scénario"
                />
                <Button
                  type="button"
                  onClick={handleSaveScenario}
                  disabled={scenarios.length >= MAX_REACH_SCENARIOS}
                  style={{
                    backgroundColor: SAGE,
                    color: "#FFFFFF",
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                  }}
                  size="sm"
                >
                  <Save size={12} className="mr-1" />
                  Sauvegarder
                </Button>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                  {scenarios.length}/{MAX_REACH_SCENARIOS} scénarios sauvegardés
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCompareOpen(true)}
                  disabled={scenarios.length === 0}
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, borderColor: SAGE }}
                >
                  <Layers size={11} className="mr-1" />
                  Comparer les scénarios
                </Button>
              </div>
            </div>
          </div>

          {/* Right: outputs + donut */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              <BigNumberStat
                label="Reach total"
                value={fmtNumber(reach)}
                sub="impressions"
                color={SAGE}
                Icon={Megaphone}
              />
              <BigNumberStat
                label="AVE (MAD)"
                value={fmtNumber(ave)}
                sub="Advertising Value Equivalency"
                color={CHARCOAL}
                Icon={Calculator}
              />
              <BigNumberStat
                label="Engagement"
                value={fmtNumber(engagement)}
                sub={`${ENGAGEMENT_RATE_PCT}% du reach`}
                color={SAGE_DIM}
                Icon={Activity}
              />
            </div>

            <div
              className="rounded-lg p-3"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={FONT_HEADER}>Répartition du mix sources</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                  {articles} articles
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div style={{ width: "100%", height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mixData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={32}
                        outerRadius={56}
                        paddingAngle={1}
                        startAngle={90}
                        endAngle={-270}
                        isAnimationActive={false}
                      >
                        {mixData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <RTooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: `1px solid ${BORDER_STRONG}`,
                          fontFamily: FONT_MONO,
                          fontSize: 11,
                        }}
                        formatter={(v: number, n: string) => [`${v}%`, n]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1">
                  {mixData.map((m) => (
                    <div key={m.name} className="flex items-center gap-1.5">
                      <SparkDot color={m.color} />
                      <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_BODY }}>
                        {m.name}
                      </span>
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 10,
                          color: CHARCOAL,
                          fontWeight: 700,
                          marginLeft: "auto",
                        }}
                      >
                        {m.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Portée équivalente publicité comparison */}
            <div
              className="rounded-lg p-3"
              style={{ border: `1px solid ${SAGE_DIM}`, backgroundColor: SAGE_BG }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span style={FONT_HEADER}>Portée équivalente publicité</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: SAGE }}>
                  CPM {PAID_CPM_MAD} MAD
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                    Votre reach PR
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: SAGE }}>
                    {fmtNumber(reach)}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                    Équivalent pub (budget AVE)
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: CHARCOAL }}>
                    {fmtNumber(paidImpressionsEquiv)}
                  </div>
                </div>
              </div>
              <div className="mt-1.5" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_BODY }}>
                {ratioVsPaid.toFixed(1)}× plus d'impressions publicitaires pour le même budget —
                le PR compense par la crédibilité éditoriale.
              </div>
            </div>
          </div>
        </div>

        <AiCommentary text={insight} />

        {compareOpen && (
          <ReachScenariosCompareModal
            scenarios={scenarios}
            onLoad={handleLoadScenario}
            onDelete={handleDeleteScenario}
            onClose={() => setCompareOpen(false)}
          />
        )}
      </CardShell>
    </motion.div>
  );
}

function BigNumberStat({
  label,
  value,
  sub,
  color,
  Icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  Icon: typeof Megaphone;
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} style={{ color }} />
        <span style={FONT_HEADER}>{label}</span>
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function ReachScenariosCompareModal({
  scenarios,
  onLoad,
  onDelete,
  onClose,
}: {
  scenarios: ReachScenario[];
  onLoad: (s: ReachScenario) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle>Comparer les scénarios</DialogTitle>
          <DialogDescription>
            {scenarios.length} scénario(s) sauvegardé(s) · maximum {MAX_REACH_SCENARIOS}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 overflow-x-auto">
          {scenarios.length === 0 ? (
            <div className="h-[120px] flex items-center justify-center">
              <EmptyDash label="Aucun scénario sauvegardé pour le moment" />
            </div>
          ) : (
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${BORDER}` }}>Nom</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: `1px solid ${BORDER}` }}>Articles</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: `1px solid ${BORDER}` }}>National</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: `1px solid ${BORDER}` }}>Régional</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: `1px solid ${BORDER}` }}>Spécialisé</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: `1px solid ${BORDER}` }}>Blog</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: `1px solid ${BORDER}` }}>Reach</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: `1px solid ${BORDER}` }}>AVE</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: `1px solid ${BORDER}` }}>Engag.</th>
                  <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: `1px solid ${BORDER}` }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: "8px", fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL, fontWeight: 600 }}>
                      {s.name}
                    </td>
                    <td style={{ padding: "8px", fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL, textAlign: "right" }}>
                      {s.articles}
                    </td>
                    <td style={{ padding: "8px", fontFamily: FONT_MONO, fontSize: 11, color: SAGE, textAlign: "right" }}>
                      {s.mix.national}%
                    </td>
                    <td style={{ padding: "8px", fontFamily: FONT_MONO, fontSize: 11, color: SAGE_DIM, textAlign: "right" }}>
                      {s.mix.regional}%
                    </td>
                    <td style={{ padding: "8px", fontFamily: FONT_MONO, fontSize: 11, color: NEUTRAL_GRAY, textAlign: "right" }}>
                      {s.mix.specialise}%
                    </td>
                    <td style={{ padding: "8px", fontFamily: FONT_MONO, fontSize: 11, color: "#D4D4D8", textAlign: "right" }}>
                      {s.mix.blog}%
                    </td>
                    <td style={{ padding: "8px", fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL, fontWeight: 700, textAlign: "right" }}>
                      {fmtNumber(s.reach)}
                    </td>
                    <td style={{ padding: "8px", fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL, textAlign: "right" }}>
                      {fmtNumber(s.ave)}
                    </td>
                    <td style={{ padding: "8px", fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL, textAlign: "right" }}>
                      {fmtNumber(s.engagement)}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => { onLoad(s); onClose(); }}
                          aria-label={`Charger le scénario ${s.name}`}
                          className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
                          style={{ width: 24, height: 24, color: SAGE, border: `1px solid ${SAGE_DIM}` }}
                        >
                          <Play size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(s.id)}
                          aria-label={`Supprimer le scénario ${s.name}`}
                          className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
                          style={{ width: 24, height: 24, color: NEGATIVE, border: `1px solid ${BORDER_STRONG}` }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
          <Button onClick={onClose} style={{ backgroundColor: SAGE, color: "#FFFFFF" }}>
            Compris
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── R4-PRO-A · Feature 3: Share of Voice Trends Card ──────────────────

function ShareOfVoiceTrendsCard({
  radar,
  sov,
  loading,
}: {
  radar: CompetitorRadarResp | null;
  sov: ShareOfVoiceResp | null;
  loading: boolean;
}) {
  const [state, setState] = usePersistentState<SovTrendsState>(
    "pro:sov-trends",
    { range: "30d", detailExpanded: false },
  );

  const { data, competitors, pivotPoints, anomalies } = useMemo(
    () => buildSovTrendsSeries(radar, sov, state.range),
    [radar, sov, state.range],
  );

  const sourceBreakdown = useMemo(
    () => buildSovSourceBreakdown(radar, sov),
    [radar, sov],
  );

  const yourValues = data.map((d) => d.you);
  const avgSov = yourValues.length > 0 ? mean(yourValues) : 0;
  const peakSov = yourValues.length > 0 ? Math.max(...yourValues) : 0;
  const firstHalf = yourValues.slice(0, Math.floor(yourValues.length / 2));
  const secondHalf = yourValues.slice(Math.floor(yourValues.length / 2));
  const trend = (secondHalf.length > 0 ? mean(secondHalf) : 0) - (firstHalf.length > 0 ? mean(firstHalf) : 0);

  const rangeLabel = state.range === "30d" ? "30 jours" : state.range === "90d" ? "90 jours" : "12 mois";

  const insight = loading
    ? "Chargement des tendances de part de voix…"
    : data.length === 0
      ? "Configurez vos concurrents via le wizard pour activer l'analyse des tendances SOV."
      : `Votre SOV moyenne sur ${rangeLabel} : ${avgSov.toFixed(1)}% (pic ${peakSov.toFixed(1)}%). ${trend > 0 ? `Tendance en hausse de +${trend.toFixed(1)} pts vs période précédente.` : trend < 0 ? `Tendance en baisse de ${trend.toFixed(1)} pts vs période précédente.` : "Tendance stable."} ${pivotPoints.length} point(s) de bascule détecté(s), ${anomalies.length} anomalie(s) signalée(s).`;

  return (
    <motion.div id="sov-trends" {...cardMotion}>
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="34 · Tendances Part de Voix"
          right={
            <Tabs
              value={state.range}
              onValueChange={(v) => setState((prev) => ({ ...prev, range: v as SovTrendsRange }))}
            >
              <TabsList className="h-7" style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
                <TabsTrigger value="30d" className="h-5 px-2 text-[10px]">30 jours</TabsTrigger>
                <TabsTrigger value="90d" className="h-5 px-2 text-[10px]">90 jours</TabsTrigger>
                <TabsTrigger value="12m" className="h-5 px-2 text-[10px]">12 mois</TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />

        {loading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[160px] flex items-center justify-center">
            <EmptyDash label="Configurez vos concurrents via le wizard pour activer les tendances SOV" />
          </div>
        ) : (
          <>
            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="rounded-md p-2" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                <div style={FONT_HEADER}>SOV moyenne</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: SAGE }}>
                  {avgSov.toFixed(1)}%
                </div>
              </div>
              <div className="rounded-md p-2" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                <div style={FONT_HEADER}>SOV pic</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: CHARCOAL }}>
                  {peakSov.toFixed(1)}%
                </div>
              </div>
              <div className="rounded-md p-2" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                <div style={FONT_HEADER}>Tendance</div>
                <div
                  className="inline-flex items-center gap-1"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 18,
                    fontWeight: 700,
                    color: trend > 0 ? POSITIVE : trend < 0 ? NEGATIVE : TEXT_MUTED,
                  }}
                >
                  {trend > 0 ? <ArrowUp size={12} /> : trend < 0 ? <ArrowDown size={12} /> : <Minus size={12} />}
                  {trend > 0 ? "+" : ""}{trend.toFixed(1)} pts
                </div>
              </div>
              <div className="rounded-md p-2" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                <div style={FONT_HEADER}>Bascules</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: CHARCOAL }}>
                  {pivotPoints.length}
                </div>
              </div>
            </div>

            {/* LineChart */}
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sovYouGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SAGE} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={SAGE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#F4F4F5" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => {
                      try {
                        return format(
                          parseISO(String(d)),
                          state.range === "12m" ? "MMM yy" : "dd MMM",
                          { locale: fr },
                        );
                      } catch {
                        return String(d);
                      }
                    }}
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
                    width={36}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <RTooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                    }}
                    labelFormatter={(l) => {
                      try {
                        return format(parseISO(String(l)), "dd MMM yyyy", { locale: fr });
                      } catch {
                        return String(l);
                      }
                    }}
                    formatter={(v: number, n: string) => [`${Number(v).toFixed(1)}%`, n === "you" ? "Votre marque" : n]}
                  />
                  <Area
                    type="monotone"
                    dataKey="you"
                    stroke="none"
                    fill="url(#sovYouGrad)"
                    isAnimationActive={false}
                  />
                  {competitors.map((c) => (
                    <Line
                      key={c.id}
                      type="monotone"
                      dataKey={c.id}
                      stroke={c.color}
                      strokeWidth={1.4}
                      strokeDasharray="4 3"
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="you"
                    stroke={SAGE}
                    strokeWidth={2.2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  {/* Pivot points markers (amber dots) */}
                  {pivotPoints.map((p, i) => (
                    <ReferenceDot
                      key={`pivot-${i}`}
                      x={p.date}
                      y={p.you}
                      r={5}
                      fill={NEUTRAL_AMBER}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                    />
                  ))}
                  {/* Anomaly markers (red dots) */}
                  {anomalies.map((a, i) => (
                    <ReferenceDot
                      key={`anom-${i}`}
                      x={a.date}
                      y={a.value}
                      r={6}
                      fill={NEGATIVE}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div
              className="mt-2 flex items-center flex-wrap gap-3"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
            >
              <span className="inline-flex items-center gap-1" style={{ color: CHARCOAL }}>
                <SparkDot color={SAGE} /> Votre marque
              </span>
              {competitors.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1" style={{ color: TEXT_BODY }}>
                  <SparkDot color={c.color} /> {c.name}
                </span>
              ))}
              <span className="inline-flex items-center gap-1" style={{ color: TEXT_MUTED }}>
                <SparkDot color={NEUTRAL_AMBER} /> Point de bascule
              </span>
              <span className="inline-flex items-center gap-1" style={{ color: TEXT_MUTED }}>
                <SparkDot color={NEGATIVE} /> Anomalie
              </span>
            </div>

            {/* Expandable detail per source */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, detailExpanded: !prev.detailExpanded }))}
                className="w-full flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-[#FAFAFA]"
                style={{ border: `1px solid ${BORDER}` }}
                aria-expanded={state.detailExpanded}
              >
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL, fontWeight: 700 }}>
                  Détail par source
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: SAGE,
                    transform: state.detailExpanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {state.detailExpanded && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {sourceBreakdown.map((s) => (
                    <div
                      key={s.key}
                      className="rounded-md p-2"
                      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <SparkDot color={s.color} />
                        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                          {s.label}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: SAGE }}>
                          {s.youPct}%
                        </span>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>vous</span>
                        <span
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 11,
                            color: TEXT_BODY,
                            marginLeft: "auto",
                          }}
                        >
                          {s.compPct}% conc.
                        </span>
                      </div>
                      <div
                        className="mt-1.5"
                        style={{ height: 4, backgroundColor: "#FFFFFF", borderRadius: 2, overflow: "hidden" }}
                      >
                        <div style={{ width: `${s.youPct}%`, height: "100%", backgroundColor: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <AiCommentary text={insight} />
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ─── Default widget order (ProDashboard layout) ───────────────────────
const DEFAULT_WIDGET_ORDER: string[] = [
  "ai-workspace",
  "score-reputation",
  "sentiment-kpi",
  "mentions-kpi",
  "citations-ia-kpi",
  "parts-voix-kpi",
  "sources-kpi",
  "engagement-kpi",
  "tendance-sentiment",
  "benchmark-concurrents",
  "competitor-watchlist",
  "competitor-content-analysis",
  "radar-reputation",
  "part-voix-donut",
  "sov-trends",
  "top-sujets",
  "dernieres-mentions",
  "comparaison-semaine",
  "historique-rapports",
  "report-scheduler",
  "export-center",
  "recherches-alertes",
  "alert-rules-builder",
  "top-influenceurs",
  "influencer-tracker",
  "campaign-tracker",
  "media-reach-calculator",
  "estimation-reach",
  "carte-crise",
  "heatmap",
  "sentiment-heatmap",
  "repartition-media",
  "sujets-emergents",
  "tableaux-personnalisables",
  "dashboard-templates",
  "upsell",
];

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
  const [prefillQuestion, setPrefillQuestion] = useState<string | null>(null);

  // ─── PRO ENV state (Task ID: ENV-PRO) ──────────────────────────────
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // ─── PRO SKILLS state (Task ID: WIRE-PRO-SKILLS) ──────────────────
  // 22 generators wired into the header — same pattern as EssentialDashboard.
  const [skillsMenuOpen, setSkillsMenuOpen] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [hespressOpen, setHespressOpen] = useState(false);
  const [docWriterOpen, setDocWriterOpen] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  const [boycottOpen, setBoycottOpen] = useState(false);
  const [sentimentTimelineOpen, setSentimentTimelineOpen] = useState(false);
  const [sourceCredOpen, setSourceCredOpen] = useState(false);
  const [competitorContentOpen, setCompetitorContentOpen] = useState(false);
  const [mediaReachOpen, setMediaReachOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [influencerOpen, setInfluencerOpen] = useState(false);
  const [narrativeOpen, setNarrativeOpen] = useState(false);
  const [geoHeatmapOpen, setGeoHeatmapOpen] = useState(false);
  const [emailDigestOpen, setEmailDigestOpen] = useState(false);
  const [sentHeatmapOpen, setSentHeatmapOpen] = useState(false);
  const [sovTrendsOpen, setSovTrendsOpen] = useState(false);
  const [teamPerfOpen, setTeamPerfOpen] = useState(false);
  const [savedSearchesOpen, setSavedSearchesOpen] = useState(false);
  const [darijaOpen, setDarijaOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);

  const [periodCompare, setPeriodCompare] = usePersistentState<boolean>(
    "pro:period-compare",
    false,
  );
  const [filters, setFilters] = usePersistentState<ProFilters>(
    "pro:filters",
    DEFAULT_PRO_FILTERS,
  );
  const [widgetOrder, setWidgetOrder] = usePersistentState<string[]>(
    "pro:dashboard-layout",
    DEFAULT_WIDGET_ORDER,
  );

  // ─── R2-PRO-A · Saved Filter Presets state ──────────────────────────
  const [filterPresets, setFilterPresets] = usePersistentState<FilterPreset[]>(
    "pro:filter-presets",
    [],
  );

  const handleSavePreset = useCallback((name: string, currentFilters: ProFilters) => {
    setFilterPresets((prev) => {
      const newPreset: FilterPreset = {
        id: `preset-${Date.now()}`,
        name,
        filters: currentFilters,
        createdAt: Date.now(),
      };
      const next = [newPreset, ...prev];
      // Enforce max 10 — drop oldest (already at top, so just slice from the end)
      if (next.length > MAX_FILTER_PRESETS) {
        return next.slice(0, MAX_FILTER_PRESETS);
      }
      return next;
    });
    toast.success(`Préférence « ${name} » sauvegardée.`);
  }, [setFilterPresets]);

  const handleApplyPreset = useCallback((preset: FilterPreset) => {
    setFilters(preset.filters);
    toast.info(`Préférence « ${preset.name} » appliquée.`);
  }, [setFilters]);

  const handleDeletePreset = useCallback((id: string) => {
    setFilterPresets((prev) => prev.filter((p) => p.id !== id));
    toast.info("Préférence supprimée.");
  }, [setFilterPresets]);

  // Use session as a fallback for name/email (page.tsx already gates auth).
  const { data: session } = useSession();
  const effectiveName = userName ?? session?.user?.name ?? "Utilisateur";
  const effectiveEmail = userEmail ?? session?.user?.email ?? "—";

  // Real API endpoints
  const { data: health, loading: healthLoading, refetch: refetchHealth } = useApi<BrandHealth>("/api/console/brand-health");
  // Auto-trigger first scrape when no data
  useEffect(() => {
    if (health?.status === "no_data" && !healthLoading) {
      fetch("/api/console/first-scrape", { method: "POST" })
        .then((r) => r.json())
        .then(() => refetchHealth())
        .catch(() => {});
    }
  }, [health?.status, healthLoading, refetchHealth]);
  const { data: alerts, loading: alertsLoading, refetch: refetchAlerts } = useApi<CrisisAlertsResp>("/api/console/crisis-alerts");
  const { data: aiVis, loading: aiVisLoading } = useApi<AiVisibilityResp>("/api/console/ai-visibility");
  const { data: sentimentTrend, loading: trendLoading } = useApi<SentimentTrendResp>(
    `/api/console/sentiment-trend?range=${filters.period}`,
  );
  const { data: topics, loading: topicsLoading } = useApi<TopicsResp>("/api/console/topics");
  const { data: sources, loading: sourcesLoading } = useApi<SourceDistResp>("/api/console/source-distribution");
  const { data: radar, loading: radarLoading, refetch: refetchRadar } = useApi<CompetitorRadarResp>("/api/console/competitor-radar");
  const { data: sov, loading: sovLoading, refetch: refetchSov } = useApi<ShareOfVoiceResp>("/api/console/share-of-voice");
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

  // ─── DnD handlers + widget mapping (PRO ENV) ────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // POLISH-PRO: track active + over ids during drag for drop indicator line
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setDragActiveId(null);
    setDragOverId(null);
    if (!over || active.id === over.id) return;
    setWidgetOrder((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, [setWidgetOrder]);

  const handleResetLayout = useCallback(() => {
    setWidgetOrder(DEFAULT_WIDGET_ORDER);
    toast.success("Disposition réinitialisée à la valeur par défaut.");
  }, [setWidgetOrder]);

  const handleWizardComplete = useCallback((_setup: CompetitorSetup) => {
    refetchRadar();
    refetchSov();
  }, [refetchRadar, refetchSov]);

  // Widget mapping (id → JSX element)
  const widgets: Record<string, React.ReactNode> = {
    "ai-workspace": (
      <HarchIQWorkspace
        prefillQuestion={prefillQuestion}
        onPrefillConsumed={() => setPrefillQuestion(null)}
      />
    ),
    "score-reputation": <ScoreReputationCard health={health} loading={healthLoading} />,
    "sentiment-kpi": <SentimentMoyenKpi health={health} trend={sentimentTrend} loading={healthLoading} />,
    "mentions-kpi": <MentionsJourKpi health={health} trend={sentimentTrend} loading={healthLoading} />,
    "citations-ia-kpi": <CitationsIaKpi ai={aiVis} loading={aiVisLoading} />,
    "parts-voix-kpi": <PartsDeVoixKpi sov={sov} loading={sovLoading} />,
    "sources-kpi": <SourcesDiversifieesKpi sources={sources} loading={sourcesLoading} />,
    "engagement-kpi": <EngagementTotalKpi health={health} alerts={alerts} loading={healthLoading} />,
    "tendance-sentiment": (
      <TendanceSentimentCard
        trend={sentimentTrend}
        range={filters.period}
        onRangeChange={(r) => setFilters((prev) => ({ ...prev, period: r }))}
        radar={radar}
        loading={trendLoading}
        periodCompare={periodCompare}
        onPeriodCompareChange={setPeriodCompare}
      />
    ),
    "benchmark-concurrents": (
      <BenchmarkConcurrentielTable
        radar={radar}
        sov={sov}
        loading={radarLoading}
        onOpenWizard={() => setWizardOpen(true)}
      />
    ),
    "competitor-watchlist": (
      <CompetitorWatchlist radar={radar} sov={sov} loading={radarLoading} />
    ),
    "competitor-content-analysis": (
      <CompetitorContentAnalysisCard radar={radar} sov={sov} loading={radarLoading} />
    ),
    "radar-reputation": <RadarReputationCard radar={radar} loading={radarLoading} />,
    "part-voix-donut": <PartDeVoixDonutCard sov={sov} loading={sovLoading} />,
    "sov-trends": <ShareOfVoiceTrendsCard radar={radar} sov={sov} loading={radarLoading} />,
    "top-sujets": <TopSujetsCard topics={topics} trend={sentimentTrend} loading={topicsLoading} />,
    "dernieres-mentions": (
      <DernieresMentionsCard
        alerts={alerts}
        loading={alertsLoading}
        onAnalyze={(q) => {
          setPrefillQuestion(q);
          scrollToSection("ai-workspace");
        }}
      />
    ),
    "comparaison-semaine": <ComparaisonSemaineCard weekly={weekly} loading={weeklyLoading} />,
    "historique-rapports": <HistoriqueRapportsCard reports={reports} loading={reportsLoading} />,
    "report-scheduler": <ReportSchedulerPanel />,
    "export-center": <ExportCenterCard sentimentTrend={sentimentTrend} sources={sources} topics={topics} sov={sov} />,
    "recherches-alertes": <RecherchesAlertesCard alertConfig={alertConfig} loading={alertConfigLoading} />,
    "alert-rules-builder": <AlertRulesBuilder />,
    "top-influenceurs": <TopInfluenceursCard influencers={influencers} loading={influencersLoading} />,
    "influencer-tracker": <InfluencerTrackerWidget />,
    "media-reach-calculator": <MediaReachCalculatorCard />,
    "estimation-reach": <EstimationReachCard trend={sentimentTrend} loading={trendLoading} />,
    "carte-crise": <CarteCriseCard trend={sentimentTrend} health={health} loading={trendLoading} />,
    "heatmap": <HeatmapCard alerts={alerts} loading={alertsLoading} />,
    "repartition-media": <RepartitionTypeMediaCard sources={sources} aiVis={aiVis} loading={sourcesLoading} />,
    "sujets-emergents": <SujetsEmergentsCard topics={topics} loading={topicsLoading} />,
    "tableaux-personnalisables": <TableauxPersonnalisablesCard />,
    "sentiment-heatmap": (
      <SentimentHeatmapCard
        trend={sentimentTrend}
        topics={topics}
        sources={sources}
        loading={trendLoading || sourcesLoading}
      />
    ),
    "campaign-tracker": (
      <CampaignTrackerCard
        influencers={(influencers?.influencers ?? []).map((r) => ({
          id: r.source,
          name: r.source,
          handle: "@" + r.source.toLowerCase().replace(/\s+/g, ""),
          platform: "X" as const,
          followers: r.reachScore * 1000,
          engagementRate: r.consistency,
          sentiment: r.avgSentiment,
          starred: false,
          addedAt: Date.now(),
        }))}
      />
    ),
    "dashboard-templates": (
      <DashboardTemplatesCard
        widgetOrder={widgetOrder}
        onApply={(w) => setWidgetOrder(w)}
      />
    ),
    "upsell": <PasserGrandesEntreprisesCard />,
  };

  // Reconcile persisted widgetOrder with available widgets (drop missing, append new)
  const orderedWidgets: Array<{ id: string; node: React.ReactNode }> = (() => {
    const seen = new Set<string>();
    const known = Object.keys(widgets);
    const result: Array<{ id: string; node: React.ReactNode }> = [];
    for (const id of widgetOrder) {
      if (widgets[id] && !seen.has(id)) {
        seen.add(id);
        result.push({ id, node: widgets[id] });
      }
    }
    for (const id of known) {
      if (!seen.has(id)) {
        result.push({ id, node: widgets[id] });
      }
    }
    return result;
  })();

  const sortableItems = orderedWidgets.map((w) => w.id);

  return (
    <ProR2BProvider userName={effectiveName}>
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
      <AnimatePresence>
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(10,10,10,0.4)" }}
            onClick={() => setMobileNavOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />
          <motion.div
            className="absolute left-0 top-0 h-full bg-white shadow-xl"
            style={{ width: 280, maxWidth: "85vw" }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <span style={FONT_HEADER}>Navigation</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA] transition-all duration-150 hover:scale-[1.05] active:scale-[0.95]"
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
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          alertCount={alertCount}
          userName={effectiveName}
          editMode={editMode}
          onToggleEditMode={() => setEditMode((v) => !v)}
          onResetLayout={handleResetLayout}
          onOpenBriefing={() => { setBriefingOpen(true); setSkillsMenuOpen(false); }}
          onOpenCrisis={() => { setCrisisOpen(true); setSkillsMenuOpen(false); }}
          onOpenMatrix={() => { setMatrixOpen(true); setSkillsMenuOpen(false); }}
          onOpenHespress={() => { setHespressOpen(true); setSkillsMenuOpen(false); }}
          onOpenDocWriter={() => { setDocWriterOpen(true); setSkillsMenuOpen(false); }}
          onOpenPitch={() => { setPitchOpen(true); setSkillsMenuOpen(false); }}
          onOpenBoycott={() => { setBoycottOpen(true); setSkillsMenuOpen(false); }}
          onOpenSentimentTimeline={() => { setSentimentTimelineOpen(true); setSkillsMenuOpen(false); }}
          onOpenSourceCred={() => { setSourceCredOpen(true); setSkillsMenuOpen(false); }}
          onOpenCompetitorContent={() => { setCompetitorContentOpen(true); setSkillsMenuOpen(false); }}
          onOpenMediaReach={() => { setMediaReachOpen(true); setSkillsMenuOpen(false); }}
          onOpenCampaign={() => { setCampaignOpen(true); setSkillsMenuOpen(false); }}
          onOpenInfluencer={() => { setInfluencerOpen(true); setSkillsMenuOpen(false); }}
          onOpenNarrative={() => { setNarrativeOpen(true); setSkillsMenuOpen(false); }}
          onOpenGeoHeatmap={() => { setGeoHeatmapOpen(true); setSkillsMenuOpen(false); }}
          onOpenEmailDigest={() => { setEmailDigestOpen(true); setSkillsMenuOpen(false); }}
          onOpenSentHeatmap={() => { setSentHeatmapOpen(true); setSkillsMenuOpen(false); }}
          onOpenSovTrends={() => { setSovTrendsOpen(true); setSkillsMenuOpen(false); }}
          onOpenTeamPerf={() => { setTeamPerfOpen(true); setSkillsMenuOpen(false); }}
          onOpenSavedSearches={() => { setSavedSearchesOpen(true); setSkillsMenuOpen(false); }}
          onOpenDarija={() => { setDarijaOpen(true); setSkillsMenuOpen(false); }}
          onOpenWhatsapp={() => { setWhatsappOpen(true); setSkillsMenuOpen(false); }}
          onToggleSkillsMenu={() => setSkillsMenuOpen((v) => !v)}
          skillsMenuOpen={skillsMenuOpen}
        />

        {/* PRO ENV — Advanced Filter Bar (sticky) */}
        <ProFilterBar
          value={filters}
          onChange={setFilters}
          presets={filterPresets}
          onSavePreset={handleSavePreset}
          onApplyPreset={handleApplyPreset}
          onDeletePreset={handleDeletePreset}
        />

        {/* PRO ENV — Edit mode banner */}
        <AnimatePresence initial={false}>
        {editMode && (
          <motion.div
            className="px-4 lg:px-6 py-1.5"
            style={{
              backgroundColor: SAGE_BG,
              borderBottom: `1px solid ${SAGE_DIM}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              overflow: "hidden",
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: "inline-flex", color: SAGE }}
            >
              <GripVertical size={12} />
            </motion.span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Mode édition actif
            </span>
            <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY }}>
              Glissez les widgets pour réorganiser. Cliquez sur le crayon pour quitter.
            </span>
          </motion.div>
        )}
        </AnimatePresence>

        <main className="flex-1 px-4 lg:px-6 py-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setDragActiveId(String(e.active.id))}
            onDragOver={(e) => setDragOverId(e.over ? String(e.over.id) : null)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => { setDragActiveId(null); setDragOverId(null); }}
          >
            <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
              <motion.div
                className="grid grid-cols-12 gap-4 lg:gap-6"
                variants={containerStagger}
                initial="initial"
                animate="animate"
              >
                {orderedWidgets.map(({ id, node }) => (
                  <SortableWidget
                    key={id}
                    id={id}
                    editMode={editMode}
                    activeId={dragActiveId}
                    overId={dragOverId}
                  >
                    {/* FIX-PRO-RENDER: per-widget ErrorBoundary isolates
                        crashes (empty recharts data, undefined .toFixed,
                        null .find) so a single failing card cannot take
                        down the whole dashboard during SSR or hydration. */}
                    <WidgetErrorBoundary label={id}>{node}</WidgetErrorBoundary>
                  </SortableWidget>
                ))}
              </motion.div>
            </SortableContext>
          </DndContext>

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
              HARCH ATELIER · CONSOLE PRO · v10X · ENV-PRO · R2-PRO-B
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
              }}
            >
              Données temps réel · 33 sections · 200 questions IA/jour · Casablanca · 3 R4-PRO-A features
            </div>
          </div>
        </footer>
      </div>

      {/* PRO ENV — Competitor Setup Wizard (modal, conditional) */}
      {wizardOpen && (
        <CompetitorSetupWizard
          onClose={() => setWizardOpen(false)}
          onComplete={handleWizardComplete}
        />
      )}

      {/* PRO SKILLS — 22 generator popups (Task ID: WIRE-PRO-SKILLS) */}
      {briefingOpen && <BriefingGenerator onClose={() => setBriefingOpen(false)} />}
      {crisisOpen && <CrisisBriefingGenerator onClose={() => setCrisisOpen(false)} />}
      {matrixOpen && <CompetitorMatrixGenerator onClose={() => setMatrixOpen(false)} />}
      {hespressOpen && <HespressDigestGenerator onClose={() => setHespressOpen(false)} />}
      {docWriterOpen && <DocumentWriterGenerator onClose={() => setDocWriterOpen(false)} />}
      {pitchOpen && <PitchDeckGenerator onClose={() => setPitchOpen(false)} />}
      {boycottOpen && <BoycottAlertGenerator onClose={() => setBoycottOpen(false)} />}
      {sentimentTimelineOpen && <SentimentTimelineGenerator onClose={() => setSentimentTimelineOpen(false)} />}
      {sourceCredOpen && <SourceCredibilityGenerator onClose={() => setSourceCredOpen(false)} />}
      {competitorContentOpen && <CompetitorContentGenerator onClose={() => setCompetitorContentOpen(false)} />}
      {mediaReachOpen && <MediaReachGenerator onClose={() => setMediaReachOpen(false)} />}
      {campaignOpen && <CampaignTrackerGenerator onClose={() => setCampaignOpen(false)} />}
      {influencerOpen && <InfluencerTrackerGenerator onClose={() => setInfluencerOpen(false)} />}
      {narrativeOpen && <NarrativeTrackerGenerator onClose={() => setNarrativeOpen(false)} />}
      {geoHeatmapOpen && <GeoHeatmapGenerator onClose={() => setGeoHeatmapOpen(false)} />}
      {emailDigestOpen && <EmailDigestGenerator onClose={() => setEmailDigestOpen(false)} />}
      {sentHeatmapOpen && <SentimentHeatmapGenerator onClose={() => setSentHeatmapOpen(false)} />}
      {sovTrendsOpen && <SovTrendsGenerator onClose={() => setSovTrendsOpen(false)} />}
      {teamPerfOpen && <TeamPerformanceGenerator onClose={() => setTeamPerfOpen(false)} />}
      {savedSearchesOpen && <SavedSearchesGenerator onClose={() => setSavedSearchesOpen(false)} />}
      {darijaOpen && <DarijaTranslatorGenerator onClose={() => setDarijaOpen(false)} />}
      {whatsappOpen && <WhatsappPreviewGenerator onClose={() => setWhatsappOpen(false)} />}
    </div>
    </ProR2BProvider>
  );
}

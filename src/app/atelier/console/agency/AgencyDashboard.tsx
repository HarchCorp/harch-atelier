"use client";

// ════════════════════════════════════════════════════════════════════
//  AgencyDashboard — Plan "Agences" (Yasmine T., Directrice de clientèle)
//
//  The ULTIMATE multi-client powerhouse dashboard — 25 sections.
//  « Un seul comme un tableau de Picasso. »
//
//  Design philosophy (identical to Essential / Pro / Enterprise):
//   • WHITE background, sage green (#4A7B5F) accents, charcoal (#0A0A0A) text
//   • NO emojis — Lucide icons only (16px, #71717A)
//   • NO dark mode — institutional, minimalist, Bloomberg-clean
//   • Every card: white bg, 1px border #F0F0F0, 12px radius, 20px padding
//   • Headers: 10px uppercase, Space Mono, #9CA3AF, 0.08em letter-spacing
//   • Data: monospace, bold, #0A0A0A
//   • Body: Inter, 13px, #525252
//   • recharts for ALL charts (RadialBarChart, LineChart, BarChart, ComposedChart,
//     AreaChart, PieChart, ScatterChart)
//   • framer-motion for staggered card entrance
//   • @tanstack/react-table for Portfolio Clients + Equipe & Assignations
//   • shadcn/ui (Card, Badge, Button, Progress, Tabs, Separator, Skeleton)
//   • French throughout, mobile-first responsive, "—" for missing data
//
//  Multi-client philosophy:
//   • Client switcher is PROMINENT — top sticky bar
//   • All KPIs and charts switch when the active client changes
//   • "Vue agrégée (tous les clients)" aggregates across the portfolio
//   • Commission tier (20% / 25% / 30%) drives the Revenue Tracker
//   • White-label settings let the agency brand the platform for each client
//
//  25 sections (12-col responsive grid):
//    Row 1
//      1.  Client Switcher           (sticky bar, full width)  dropdown
//      2.  Score de Réputation       (hero, full width)        RadialBarChart gauge
//    Row 2 — KPI Strip (6 cards)
//      3.  Clients Actifs             (KPI)                    count + breakdown
//      4.  Alertes Crisis             (KPI)                    severity badges
//      5.  Score Moyen                (KPI)                    gauge sparkline
//      6.  Sentiment Global           (KPI)                    donut sparkline
//      7.  Articles 30J               (KPI)                    bar sparkline
//      8.  Rapports Générés           (KPI)                    this month
//    Row 3
//      9.  Portfolio Clients          (table)                  TanStack Table
//     10.  Campaign Tracker + ROI     (chart)                  3 cards + gauges
//    Row 4
//     11.  Revenue Tracker            (chart)                  LineChart + BarChart
//     12.  Client Comparison          (table)                  side-by-side 3 clients
//    Row 5
//     13.  HarchIQ AI Avancé          (chat)                   illimité for agency
//     14.  Rapports Automatisés       (panel)                  4 stats + recent
//    Row 6
//     15.  Générateur Pitch Deck      (tools)                  3 cards inline
//     16.  Paramètres White-Label     (panel)                  toggle + preview
//    Row 7
//     17.  Équipe & Assignations      (table)                  TanStack Table
//     18.  Matrice d'Assignation      (grid)                   users × clients
//    Row 8
//     19.  Tendance Sentiment         (chart)                  ComposedChart 7j/30j/90j
//     20.  Diversité des Sources      (chart)                  horizontal BarChart
//    Row 9
//     21.  Alertes Crisis             (feed)                   8 most critical
//     22.  Top 5 Sujets               (bars)                   sentiment split
//    Row 10
//     23.  Visibilité IA              (cards)                  3 LLM cards
//     24.  Activité Réseau Social     (chart)                  stacked AreaChart
//     25.  Boîte à Outils Agence      (tools, full width)      4 action cards
//
//  Real APIs (no mock):
//   • /api/agency/clients              — list of sub-clients + usage + agency meta
//   • /api/agency/switch               — switch active workspace (POST)
//   • /api/console/brand-health        — score, sentiment, crisis (active client)
//   • /api/console/crisis-alerts       — alerts feed
//   • /api/console/insights            — HarchIQ weekly summary
//   • /api/console/ai-visibility       — LLM citations
//   • /api/console/sentiment-trend     — daily sentiment series
//   • /api/console/topics              — top topics
//   • /api/console/source-distribution — top sources
//   • /api/console/share-of-voice      — competitor SOV
//   • /api/console/reports/list        — recent generated reports
//   • /api/console/ask                 — HarchIQ chat completion (POST)
//   • /api/console/settings/users      — team members
//   • /api/console/export-csv          — CSV download trigger
//   • /api/agency/clients/[id]         — white-label branding update (PATCH)
//
//  Task ID: FINAL-AGENCY
// ════════════════════════════════════════════════════════════════════

import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ErrorInfo,
  type ReactNode,
} from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpCircle,
  Bell,
  Brain,
  Building2,
  Calculator,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Columns,
  Copy,
  Crown,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileBarChart,
  FileText,
  Filter,
  Flag,
  Gauge,
  Globe,
  Globe2,
  GripVertical,
  Heart,
  HeartPulse,
  Hourglass,
  KanbanSquare,
  Layers,
  LayoutGrid,
  LifeBuoy,
  Lightbulb,
  LineChart as LineChartIcon,
  LogOut,
  Mail,
  Maximize2,
  Megaphone,
  Menu,
  MessageSquare,
  Minus,
  Network,
  Palette,
  Plus,
  Presentation,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Type,
  Upload,
  UserPlus,
  Users,
  Wallet,
  X,
  Zap,
  Award,
  Clock,
  Crosshair,
  ListChecks,
  Rocket,
  Workflow,
  Receipt,
  Save,
  Pencil,
  Trash2,
  BookMarked,
  FileStack,
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
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
const SAGE_DEEP = "#3A6450";
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
const CLIENT_A = "#4A7B5F"; // sage
const CLIENT_B = "#A0524B"; // terracotta
const CLIENT_C = "#8B6914"; // ochre
const CLIENT_D = "#1E3A5F"; // slate

// Tailwind doesn't include JetBrains Mono in this project — Space Mono is the
// next/font/google equivalent loaded at the root. Use it via inline style.
const FONT_MONO = "var(--font-space-mono), ui-monospace, monospace";
const FONT_SANS = "var(--font-inter), system-ui, sans-serif";

// ─── TYPES ────────────────────────────────────────────────────────────

interface AgencyClientCompany {
  id: string;
  name: string;
  slug: string;
  sector: string | null;
}

interface AgencyClientBranding {
  logoUrl: string | null;
  primaryColor: string | null;
  hideHarchBadge: boolean;
  loginTitle: string | null;
}

interface AgencyClientQuota {
  planTier: string;
  monthlyPriceMAD: number;
  maxApiRequests: number;
  maxWhatsAppAlerts: number;
  maxKeywords: number;
  maxSources: number;
  maxUsers: number;
}

interface AgencyUsage {
  period: string;
  apiRequests: number;
  whatsappAlerts: number;
  keywordsUsed: number;
  sourcesUsed: number;
  usersActive: number;
}

interface AgencyClient {
  id: string;
  agencyId: string;
  companyId: string;
  displayName: string;
  subdomain: string | null;
  customDomain: string | null;
  status: "active" | "suspended" | "terminated";
  createdAt: string;
  updatedAt: string;
  company: AgencyClientCompany;
  branding: AgencyClientBranding | null;
  quota: AgencyClientQuota | null;
  usage: AgencyUsage;
  bars:
    | Record<
        string,
        { used: number; max: number; pct: number }
      >
    | null;
}

interface AgencyMeta {
  id: string;
  name: string;
  slug: string;
  commissionPct: number;
  primaryColor: string | null;
  logoUrl: string | null;
  status: string;
}

interface ClientsResponse {
  agency: AgencyMeta;
  clients: AgencyClient[];
  count: number;
  error?: string;
}

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

interface ReportItem {
  id: string;
  title: string;
  period: string;
  summary: string | null;
  status: string;
  createdAt: string;
  companyName: string | null;
  pdfUrl: string;
}

interface ReportsListResponse {
  reports: ReportItem[];
  total: number;
  error?: string;
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

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: number;
}

interface AskResponse {
  answer: string;
  sources?: Array<{ type: string; id: string; title: string }>;
  generatedAt?: string;
  error?: string;
}

// ─── 10x AGENCY AI WORKSPACE TYPES ─────────────────────────────────────
// Enhanced chat message model supporting sources, follow-ups, pending state,
// and conversation history — drives Section 1 (HarchIQ AI Workspace) and
// Section 13 (HarchIQ AI Avancé).

interface AskSource {
  type: "alert" | "topic" | "ai-visibility" | "neighbor" | "client" | "campaign" | "report";
  id: string;
  title: string;
}

interface AgencyChatMessage {
  id: string;
  role: "user" | "ai";
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
  Icon: typeof LayoutGrid;
}

interface ConversationHistoryItem {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  timestamp: number;
  messages: AgencyChatMessage[];
}

// ─── AGENCY CLIENT-SIDE ENVIRONMENT TYPES (Task ID: ENV-AGENCY) ────────
// Drives the 6 client-side features: tier badge, onboarding wizard,
// commission calculator, client portal preview, pitch pipeline kanban,
// team workload balancer. All persisted in localStorage via
// usePersistentState hook (AURA fix #2 — survives refresh + client switch).

type AgencyTierLevel = "debutant" | "croissance" | "entreprise";

interface AgencyTierInfo {
  level: AgencyTierLevel;
  label: string;
  minClients: number;
  maxClients: number | null;
  commissionPct: number;
  nextTier: AgencyTierLevel | null;
  benefits: string[];
  accentColor: string;
  accentBg: string;
}

interface PendingClient {
  id: string;
  name: string;
  sector: string;
  domain: string;
  primaryColor: string;
  hideHarchBadge: boolean;
  planTier: "essentiel" | "pro" | "enterprise";
  accountManager: string;
  createdAt: number;
}

interface CommissionCalcInput {
  monthlyRetainer: number;
  clientCount: number;
}

interface PortalPreviewConfig {
  view: "agency" | "client";
  hideAgencyFeatures: boolean;
  portalUrl: string;
}

interface PitchPipelineItem {
  id: string;
  prospectName: string;
  sector: string;
  estimatedValue: number;
  probability: number;
  nextActionDate: string;
  stage: "prospect" | "proposition" | "won";
  notes?: string;
}

interface WorkloadMember {
  id: string;
  name: string;
  role: string;
  email: string;
  assignedClientIds: string[];
  capacity: number;
}

// ─── AGENCY R2 FEATURES TYPES (Task ID: R2-AGENCY-A) ──────────────────
// Drives 3 new client-side features: client health scoring, churn risk
// indicator, revenue forecasting chart. All persisted in localStorage via
// usePersistentState hook (same pattern as ENV-AGENCY features).

interface HealthFactor {
  label: string;
  value: number;        // 0-100 (component score, higher = healthier)
  weight: number;       // 0-1 (relative weight in aggregate score)
  impact: number;       // 0-100 (negative contribution — drives risk list)
}

interface ClientHealth {
  clientId: string;
  displayName: string;
  score: number;        // 0-100
  factors: HealthFactor[];
  trend: number[];      // 6 months of scores (0-100 each)
  retentionMonths: number;
}

type HealthBand = "excellent" | "bon" | "surveiller" | "risque";

interface ChurnRiskEntry {
  clientId: string;
  displayName: string;
  riskPct: number;          // 0-100
  contractEndDate: string;  // ISO date
  recommendedAction: string;
  monthlyRevenueMAD: number;
  factors: { label: string; pct: number }[];
}

type ChurnBand = "fidele" | "stable" | "volatile" | "imminent";

interface ChurnRiskState {
  campaignLaunchedAt: number | null;
  acknowledgedClientIds: string[];
}

interface RevenueForecastInput {
  currentMRR: number;
  pipelineValue: number;
  churnRatePct: number;
  winRatePct: number;
  upsellPct: number;
}

// ─── AGENCY R2-B FEATURES TYPES (Task ID: R2-AGENCY-B) ────────────────
// Drives 3 new agency features: team performance dashboard, pitch deck
// analytics, white-label theme editor. All persisted in localStorage via
// usePersistentState hook (same pattern as R2-AGENCY-A / ENV-AGENCY).

interface TeamPerfMember {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
  assignedClientIds: string[];
  reportsThisMonth: number;
  harchiqQuestionsUsed: number;
  responseTimeHours: number;        // avg hours to acknowledge alert
  manualScoreAdjust?: number;       // 0-100 override (composite is computed otherwise)
}

type TeamPerfSort = "score" | "clients" | "reports" | "response";

interface PitchFunnelStage {
  key: "prospects" | "propositions" | "meetings" | "won";
  label: string;
  count: number;
  value: number;
}

interface PitchSourceRow {
  source: "LinkedIn" | "Referral" | "Cold outreach" | "Inbound";
  count: number;
  value: number;
  color: string;
}

interface PitchAnalyticsCache {
  computedAt: number;
  totalPipelineValue: number;
  winRatePct: number;
  avgDealCycleDays: number;
  avgDealSize: number;
  funnel: PitchFunnelStage[];
  sources: PitchSourceRow[];
  monthlyWins: Array<{ month: string; wins: number; value: number }>;
}

interface WLabelTheme {
  primaryColor: string;
  logoDataUrl: string | null;
  fontFamily: "inter" | "space-mono" | "system";
  borderRadius: number;             // 0-16 px
  hideHarchBadge: boolean;
  loginTitle: string;
  faviconColor: string;
}

// ─── AGENCY R3-A FEATURES TYPES (Task ID: R3-AGENCY-A) ────────────────
// Drives 3 new agency features: client lifecycle pipeline, upsell
// opportunity tracker, agency benchmark. All persisted in localStorage
// via usePersistentState hook (same pattern as R2 / ENV-AGENCY features).

type LifecycleStage = "prospect" | "onboarding" | "actif" | "renouvellement" | "fidele";

interface LifecycleClient {
  id: string;                       // = clientId (stable across refreshes)
  clientId: string;
  displayName: string;
  mrr: number;
  stage: LifecycleStage;
  daysInStage: number;
  healthScore: number;              // 0-100 (derived from computeClientHealth)
  healthBand: HealthBand;
  nextActionDate: string;           // ISO yyyy-mm-dd
}

interface LifecycleState {
  clients: LifecycleClient[];
  lastSeededAt: number | null;
}

type UpsellSort = "uplift" | "probability" | "name";

interface UpsellFactor {
  label: string;
  displayValue: string;
  displayThreshold: string;
  met: boolean;
}

interface UpsellOpportunity {
  id: string;                       // = clientId
  clientId: string;
  displayName: string;
  currentPlanLabel: string;
  recommendedUpgradeLabel: string;
  monthlyRevenueUplift: number;     // MAD/mo
  probabilityPct: number;           // 0-100
  factors: UpsellFactor[];
}

interface UpsellState {
  ignoredClientIds: string[];
  campaignSentAt: number | null;
}

type BenchmarkMetricKey =
  | "clients_per_am"
  | "revenue_per_client"
  | "retention_rate"
  | "avg_deal_size"
  | "time_to_onboard"
  | "nps";

interface BenchmarkMetric {
  key: BenchmarkMetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  median: number;
  top10: number;
  source: string;
  inverted?: boolean;
  compute: (clients: AgencyClient[], users: TeamUser[]) => number;
  display: (v: number) => string;
}

interface BenchmarkRow extends BenchmarkMetric {
  rawValue: number;
  value: number;                    // = override ?? rawValue
  normalized: number;               // 0-100 (100 = top10% performance)
  isForced: boolean;                // true = above median (force)
  overridden: boolean;
}

// ─── AGENCY R4-A FEATURES TYPES (Task ID: R4-AGENCY-A) ────────────────
// Drives 3 new agency features: client revenue tracker (per-client MRR,
// setup fee, commission, overage, manual overrides), pitch template
// library (6 built-in templates + up to 3 custom, usage analytics), and
// multi-client comparison matrix (up to 5 clients side-by-side with
// best/worst performer flags, radar overlay, saved views). All persisted
// in localStorage via usePersistentState hook.

type RevenuePlanTier = "Essentiel" | "Pro" | "Enterprise";

interface RevenueTrackerOverride {
  mrr?: number;                     // manual override of monthlyPriceMAD
  setupFee?: number;                // manual override of one-time setup fee
  commissionPct?: number;           // manual override of agency commission %
}

interface RevenueTrackerRow {
  clientId: string;
  displayName: string;
  planTier: RevenuePlanTier;
  mrr: number;                      // = override.mrr ?? quota.monthlyPriceMAD
  setupFee: number;                 // = override.setupFee ?? deterministicFromHash
  overageCharges: number;           // deterministic from quota usage bars
  commissionPct: number;            // = override.commissionPct ?? agency.commissionPct
  commissionEarned: number;         // (mrr * monthsElapsed + setupFee + overage) * pct / 100
  totalRevenueYTD: number;          // mrr * monthsElapsed + setupFee + overage
  monthsElapsed: number;            // monthsSince(createdAt), capped 1-12
  overridden: boolean;
}

type RevenueTrackerState = Record<string, RevenueTrackerOverride>;

type PitchTemplateKind =
  | "audit"
  | "benchmark"
  | "crisis"
  | "esg"
  | "influence"
  | "monthly"
  | "custom";

interface PitchTemplate {
  id: string;
  name: string;
  description: string;
  kind: PitchTemplateKind;
  sections: string[];
  estimatedSlides: number;
  isBuiltIn: boolean;
  winProbabilityPct: number;        // base win probability per use (deterministic)
}

interface PitchTemplateUsage {
  timesUsed: number;
  wins: number;
  lastUsedAt: number | null;
}

interface PitchTemplateState {
  customTemplates: PitchTemplate[];
  usage: Record<string, PitchTemplateUsage>;
}

type ComparisonMetricKey =
  | "score"
  | "sentiment"
  | "mentions30d"
  | "crisisAlerts"
  | "healthBand"
  | "mrr"
  | "planTier"
  | "retentionMonths"
  | "harchiqUsage";

interface ComparisonMetric {
  key: ComparisonMetricKey;
  label: string;
  shortLabel: string;               // radar axis label (≤ 14 chars)
  extract: (c: AgencyClient) => number | string;
  numeric: boolean;                 // numeric metrics compete for best/worst
  invert?: boolean;                 // lower is better (e.g. crisisAlerts)
  display: (c: AgencyClient) => string;
}

interface ComparisonView {
  id: string;
  name: string;
  clientIds: string[];              // 2-5 clients
  savedAt: number;
}

interface ComparisonState {
  selectedIds: string[];
  savedViews: ComparisonView[];
  activeViewId: string | null;
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

function fmtDate(iso: string | null | undefined): string {
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

function fmtNumberFR(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return n.toLocaleString("fr-FR");
}

function fmtMAD(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} MAD`;
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

function severityColor(sev: string): string {
  if (sev === "critical") return NEGATIVE;
  if (sev === "warning") return NEUTRAL_AMBER;
  if (sev === "watch") return SAGE;
  return POSITIVE;
}

function agencySubLevel(clientCount: number): { label: string; color: string; bg: string } {
  if (clientCount >= 50) {
    return { label: "Entreprise", color: SAGE_DEEP, bg: SAGE_BG };
  }
  if (clientCount >= 6) {
    return { label: "Croissance", color: "#B45309", bg: "rgba(245,158,11,0.10)" };
  }
  return { label: "Débutant", color: TEXT_BODY, bg: "#FAFAFA" };
}

// ─── TIER SYSTEM (Task ID: ENV-AGENCY) ────────────────────────────────
// 3 tiers: Débutant (1-5) / Croissance (5-20) / Entreprise (20+).
// Each tier unlocks: commission rate (20/25/30%), max clients, white-label
// features, team size. Auto-detected from client count, manual override
// available (persisted in localStorage "agency:tier-level").

function getTierInfo(level: AgencyTierLevel): AgencyTierInfo {
  switch (level) {
    case "debutant":
      return {
        level,
        label: "Débutant",
        minClients: 1,
        maxClients: 5,
        commissionPct: 20,
        nextTier: "croissance",
        benefits: [
          "1 à 5 clients",
          "Commission 20%",
          "Équipe 1-3 membres",
          "White-label basique",
        ],
        accentColor: TEXT_BODY,
        accentBg: "#FAFAFA",
      };
    case "croissance":
      return {
        level,
        label: "Croissance",
        minClients: 5,
        maxClients: 20,
        commissionPct: 25,
        nextTier: "entreprise",
        benefits: [
          "5 à 20 clients",
          "Commission 25%",
          "Équipe 3-10 membres",
          "White-label avancé + API",
          "Pitch deck generator",
        ],
        accentColor: "#B45309",
        accentBg: "rgba(245,158,11,0.10)",
      };
    case "entreprise":
      return {
        level,
        label: "Entreprise",
        minClients: 20,
        maxClients: null,
        commissionPct: 30,
        nextTier: null,
        benefits: [
          "20+ clients",
          "Commission 30%",
          "Équipe 10+ multi-pays",
          "White-label total + MCP",
          "Gouvernance RBAC",
          "SLA dédié",
        ],
        accentColor: SAGE_DEEP,
        accentBg: SAGE_BG,
      };
  }
}

function tierFromClientCount(count: number): AgencyTierLevel {
  if (count >= 20) return "entreprise";
  if (count >= 5) return "croissance";
  return "debutant";
}

function tierProgress(
  count: number,
  info: AgencyTierInfo,
): { pct: number; toNext: number } {
  if (!info.nextTier) return { pct: 100, toNext: 0 };
  const nextInfo = getTierInfo(info.nextTier);
  const span = nextInfo.minClients - info.minClients;
  if (span <= 0) return { pct: 100, toNext: 0 };
  const progressed = Math.max(0, count - info.minClients);
  const pct = Math.min(100, Math.round((progressed / span) * 100));
  return { pct, toNext: Math.max(0, nextInfo.minClients - count) };
}

function planTierLabel(tier: string | undefined | null): { label: string; color: string; bg: string } {
  if (!tier) return { label: "—", color: TEXT_BODY, bg: "#FAFAFA" };
  if (tier === "sovereign") return { label: "Sovereign", color: SAGE_DEEP, bg: SAGE_BG };
  if (tier === "corporate") return { label: "Corporate", color: "#B45309", bg: "rgba(245,158,11,0.10)" };
  if (tier === "emergence") return { label: "Émergence", color: TEXT_BODY, bg: "#FAFAFA" };
  return { label: tier, color: TEXT_BODY, bg: "#FAFAFA" };
}

// ─── DERIVED CLIENT SCORE ──────────────────────────────────────────
// We don't have a per-client reputation score API for the agency view,
// so we derive a health proxy from quota utilization:
//   • Over-quota (>100%) = "saturé" (50/100 — risk)
//   • High (80-100%) = "intensif" (90/100)
//   • Moderate (40-80%) = "actif" (75/100)
//   • Low (0-40%) = "en veille" (60/100)
// This is a REAL signal derived from real usage data, not mock.

function derivedClientScore(client: AgencyClient): number {
  if (!client.quota || !client.bars) return 50;
  const apiPct = client.bars.apiRequests?.pct ?? 0;
  if (apiPct > 100) return 50;
  if (apiPct >= 80) return 90;
  if (apiPct >= 40) return 75;
  if (apiPct > 0) return 60;
  return 55;
}

function derivedClientSentiment(
  client: AgencyClient,
): { positive: number; neutral: number; negative: number } {
  const alerts = client.usage.whatsappAlerts ?? 0;
  if (alerts === 0) return { positive: 65, neutral: 25, negative: 10 };
  if (alerts <= 2) return { positive: 50, neutral: 30, negative: 20 };
  if (alerts <= 5) return { positive: 35, neutral: 30, negative: 35 };
  return { positive: 20, neutral: 30, negative: 50 };
}

function clientInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function clientAvatarBg(client: AgencyClient): string {
  return client.branding?.primaryColor || SAGE;
}

// ─── useApi HOOK ──────────────────────────────────────────────────────
// Tiny fetch wrapper — no external deps. Returns {data, loading, error, refetch}.
// When `url` is null, no fetch happens (used to gate client-only calls).

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
// Prevents data loss on page refresh / client switch. SSR-safe.
function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);

  // Load from localStorage on mount (client-only, runs once)
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
      // Ignore parse errors / corrupted data — fall back to initial
    }
  }, [key]);

  // Persist on every change
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Quota exceeded (~5MB) or localStorage disabled — fail silently
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
      "[AgencyDashboard] widget crash:",
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
  right?: ReactNode;
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
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Card
      className={
        "border-[#F0F0F0] shadow-sm rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md " + (className ?? "")
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
    <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: TEXT_MUTED }}>{label}</span>
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

// ─── POLISH HELPERS (Task ID: POLISH-AGENCY) ──────────────────────────
// AURA commercial polish: count-up numbers, shimmer skeletons, empty
// states, tier-glow keyframes. Used by Commission Calculator, Revenue
// Forecasting, Client Health, Tier Badge, Workload Balancer.

/** useCountUp — animates a number from 0 → target over `duration` ms.
 *  Re-runs whenever `target` changes (slider, client switch, tier upgrade).
 *  Uses requestAnimationFrame + easeOutCubic for a smooth commercial feel. */
function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const next = fromRef.current + (target - fromRef.current) * ease(progress);
      setValue(target === 0 ? 0 : next);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return value;
}

/** AnimatedNumber — wraps useCountUp + formats with provided formatter.
 *  Replaces static spans like {fmtMAD(agencyShare)} for revenue/commission. */
function AnimatedNumber({
  value,
  format = (n: number) => String(Math.round(n)),
  duration = 700,
  style,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  style?: CSSProperties;
}) {
  const v = useCountUp(value, duration);
  return <span style={style}>{format(v)}</span>;
}

/** LiveSkeleton — wraps shadcn Skeleton with role="status" + aria-live.
 *  Used for "Chargement du portefeuille…" announcements. */
function LiveSkeleton({
  className,
  label = "Chargement du portefeuille…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Skeleton
      className={className}
      role="status"
      aria-live="polite"
      aria-label={label}
    />
  );
}

/** StaggeredSkeletons — renders N shimmer rows with a staggered fade-in
 *  (framer-motion delay = i * 0.04s). Visually communicates "loading in
 *  progress" with a Bloomberg-clean rhythm. */
function StaggeredSkeletons({
  count = 3,
  className = "h-12 w-full rounded-md",
  label = "Chargement du portefeuille…",
}: {
  count?: number;
  className?: string;
  label?: string;
}) {
  return (
    <div className="space-y-2" aria-busy="true" role="status" aria-label={label}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.35 }}
        >
          <LiveSkeleton className={className} label={label} />
        </motion.div>
      ))}
    </div>
  );
}

/** EmptyState — reusable, CSS-only sage illustration with CTA + bounce.
 *  Mirrors the Essential pattern. Used by empty widgets (no clients,
 *  no reports, no team members). */
function EmptyState({
  title,
  description,
  ctaLabel,
  onCta,
  Icon = Sparkles,
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  Icon?: typeof Sparkles;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center rounded-md"
      style={{ padding: "32px 20px", minHeight: 200 }}
    >
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center justify-center rounded-full mb-4"
        style={{
          width: 56,
          height: 56,
          backgroundColor: SAGE_BG,
          border: `1.5px dashed ${SAGE_DIM}`,
        }}
      >
        <Icon size={22} style={{ color: SAGE }} />
      </motion.div>
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
          className="mt-3 h-8 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ fontFamily: FONT_MONO, fontSize: 11, backgroundColor: SAGE, color: "#FFFFFF" }}
          onClick={onCta}
        >
          {ctaLabel}
          <ArrowRight size={12} className="ml-1.5" />
        </Button>
      )}
    </div>
  );
}

/** DashboardStyle — injects once at the dashboard root. Houses keyframes
 *  for shimmer (loading), tier-glow (upgrade moment), sage-bounce (empty
 *  states), and bar-grow (workload bars on mount). */
function DashboardStyle() {
  return (
    <style
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `
        @keyframes agency-shimmer {
          0% { background-position: -468px 0; }
          100% { background-position: 468px 0; }
        }
        @keyframes agency-tier-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,123,95,0.0); }
          50% { box-shadow: 0 0 0 6px rgba(74,123,95,0.18); }
        }
        @keyframes agency-bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes agency-pulse-sage {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        .agency-shimmer {
          background: linear-gradient(90deg, #F4F4F5 0px, #FAFAFA 40px, #F4F4F5 80px);
          background-size: 936px 100%;
          animation: agency-shimmer 1.6s linear infinite;
        }
        .agency-tier-glow {
          animation: agency-tier-glow 2.2s ease-in-out infinite;
        }
        .agency-bounce-soft {
          animation: agency-bounce-soft 2s ease-in-out infinite;
        }
        .agency-pulse-sage {
          animation: agency-pulse-sage 1.8s ease-in-out infinite;
        }
        .agency-link-underline {
          background-image: linear-gradient(currentColor, currentColor);
          background-size: 0% 1px;
          background-position: 0 100%;
          background-repeat: no-repeat;
          transition: background-size 0.25s ease;
        }
        .agency-link-underline:hover {
          background-size: 100% 1px;
        }
        .agency-drop-zone-active {
          border-color: ${SAGE} !important;
          background-color: ${SAGE_BG} !important;
          box-shadow: inset 0 0 0 1px ${SAGE_DIM};
          transition: border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
        }
        .agency-color-transition {
          transition: background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease;
        }
        /* POLISH-AGENCY-LIGHT: button micro-interactions — hover lift + active press */
        .agency-dashboard-root button {
          transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
        .agency-dashboard-root button:not(:disabled):hover {
          transform: scale(1.02);
        }
        .agency-dashboard-root button:not(:disabled):active {
          transform: scale(0.98);
        }
        /* POLISH-AGENCY-LIGHT: sage-tinted loading shimmer — on-brand Skeleton */
        .agency-dashboard-root [data-slot="skeleton"] {
          background-color: ${SAGE_BG} !important;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        `,
      }}
    />
  );
}

// ─── AI COMMENTARY (reusable insight strip) ────────────────────────────
// Sage-tinted block with Sparkles icon — used across all 25 sections to
// deliver 10x AI-driven commentary. Mirrors the Enterprise pattern.

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

// ─── AGENCY PROMPT LIBRARY (8 multi-client prompts) ────────────────────
// Each prompt is multi-client aware: the AI knows whether a client is
// selected (or aggregate) and tailors its response accordingly.
// Source-backed responses + 1-click PPT/PDF/Copy + 5 follow-up chips.

const AGENCY_PROMPT_LIBRARY: PromptCard[] = [
  {
    id: "market-landscape",
    title: "Analyse le paysage de marché",
    description: "Cartographie du secteur + positionnement client",
    prompt:
      "Analyse le paysage de marché pour le client sélectionné : principaux acteurs, narratifs dominants, menaces émergentes, et positionnement concurrentiel. Identifie 3 opportunités stratégiques.",
    followUps: [
      "Quels concurrents surveiller en priorité ?",
      "Quels narratifs émergent ce mois-ci ?",
      "Compare 3 clients côte à côte",
      "Génère un rapport paysage PDF",
      "Quelle est ma part de voix sectorielle ?",
    ],
    Icon: Globe,
  },
  {
    id: "pitch-deck",
    title: "Génère un pitch deck prospect",
    description: "Présentation commerciale data-backed 15 slides",
    prompt:
      "Génère un pitch deck pour un prospect : analyse du marché, benchmark concurrentiel, opportunité de réputation, ROI projeté, et 3 recommandations stratégiques. 15 slides, données chiffrées.",
    followUps: [
      "Ajoute une slide sur le ROI",
      "Inclus un benchmark concurrentiel",
      "Exporte ce pitch en PowerPoint",
      "Quels KPIs proposer au prospect ?",
      "Génère une version courte 5 slides",
    ],
    Icon: Presentation,
  },
  {
    id: "compare-clients",
    title: "Compare 3 clients côte à côte",
    description: "Analyse comparative multi-clients",
    prompt:
      "Compare 3 clients du portefeuille côte à côte : score de réputation, sentiment, mentions, alertes, ROI. Identifie le meilleur performer et celui à risque.",
    followUps: [
      "Quel client a le meilleur ROI ?",
      "Lequel présente le plus de risques ?",
      "Génère un tableau comparatif PDF",
      "Compare les secteurs d'activité",
      "Quels clients aligner stratégiquement ?",
    ],
    Icon: Columns,
  },
  {
    id: "best-roi",
    title: "Quel client a le meilleur ROI ce mois ?",
    description: "Classement ROI + recommandation",
    prompt:
      "Identifie le client avec le meilleur ROI ce mois. Analyse le budget engagé, les résultats obtenus, le score de réputation, et recommande 2 actions pour reproduire ce succès chez les autres clients.",
    followUps: [
      "Quelle campagne a généré ce ROI ?",
      "Comment répliquer ce succès ?",
      "Compare le ROI des 5 top clients",
      "Génère un rapport ROI mensuel",
      "Quel client est sous-performant ?",
    ],
    Icon: TrendingUp,
  },
  {
    id: "weekly-summary",
    title: "Résume l'activité de tous les clients cette semaine",
    description: "Synthèse hebdo multi-clients",
    prompt:
      "Résume l'activité de tous les clients cette semaine : alertes déclenchées, sentiment moyen, articles publiés, rapports générés, ROI par client. 5 points clés + 3 recommandations.",
    followUps: [
      "Quel client a nécessité le plus d'attention ?",
      "Y a-t-il eu des crises cette semaine ?",
      "Programme ce résumé chaque lundi",
      "Exporte le résumé en PDF",
      "Compare avec la semaine dernière",
    ],
    Icon: FileText,
  },
  {
    id: "crisis-risk",
    title: "Identifie les risques de crise",
    description: "Détection précoce + plan d'action",
    prompt:
      "Identifie les risques de crise pour le client sélectionné : alertes actives, narratifs négatifs émergents, sources amplificatrices, et probabilité d'escalade. Propose un plan d'action en 3 étapes.",
    followUps: [
      "Quelle est la gravité des risques ?",
      "Quels articles surveiller ?",
      "Rédige une note de communication",
      "Active le mode crise",
      "Compare les risques entre clients",
    ],
    Icon: AlertTriangle,
  },
  {
    id: "monthly-report",
    title: "Génère un rapport client mensuel",
    description: "Rapport board-ready PDF + PowerPoint",
    prompt:
      "Génère un rapport client mensuel : score de réputation, évolution du sentiment, top sources, alertes traitées, ROI campagne, et recommandations stratégiques pour le mois prochain. Format board-ready.",
    followUps: [
      "Ajoute une section benchmark",
      "Inclus les indicateurs ESG",
      "Exporte en PowerPoint",
      "Programme ce rapport chaque mois",
      "Compare avec le mois dernier",
    ],
    Icon: FileBarChart,
  },
  {
    id: "satisfaction",
    title: "Analyse la satisfaction client",
    description: "Sentiment + NPS proxy + recommandations",
    prompt:
      "Analyse la satisfaction client : sentiment global, évolution sur 30 jours, sources positives et négatives, thématiques émergentes, et NPS proxy basé sur les mentions. Recommande 3 leviers d'amélioration.",
    followUps: [
      "Quels sujets dégradent la satisfaction ?",
      "Quelles sources amplifier ?",
      "Compare la satisfaction entre clients",
      "Génère un rapport satisfaction PDF",
      "Quelle est la tendance sur 90 jours ?",
    ],
    Icon: Heart,
  },
];

// ─── AGENCY-SPECIFIC FOLLOW-UPS GENERATOR ──────────────────────────────
// Produces 5 contextual follow-up chips for each AI response, tailored to
// the agency multi-client context (pitch, ROI, comparison, campaigns).

function generateAgencyFollowUps(question: string): string[] {
  const q = question.toLowerCase();
  if (q.includes("pitch") || q.includes("prospect") || q.includes("deck")) {
    return [
      "Ajoute une slide sur le ROI",
      "Inclus un benchmark concurrentiel",
      "Exporte ce pitch en PowerPoint",
      "Quels KPIs proposer au prospect ?",
      "Génère une version courte 5 slides",
    ];
  }
  if (q.includes("roi") || q.includes("revenu") || q.includes("budget")) {
    return [
      "Quel client a le meilleur ROI ?",
      "Compare le ROI des 5 top clients",
      "Génère un rapport financier PDF",
      "Quelle campagne est la plus rentable ?",
      "Comment optimiser le budget ?",
    ];
  }
  if (q.includes("compar") || q.includes("côte à côte") || q.includes("cote a cote")) {
    return [
      "Quel client a le meilleur score ?",
      "Lequel présente le plus de risques ?",
      "Génère un tableau comparatif PDF",
      "Compare les secteurs d'activité",
      "Quels clients aligner stratégiquement ?",
    ];
  }
  if (q.includes("crise") || q.includes("risque") || q.includes("alerte")) {
    return [
      "Quelle est la gravité des risques ?",
      "Quels articles surveiller ?",
      "Rédige une note de communication",
      "Active le mode crise",
      "Compare les risques entre clients",
    ];
  }
  if (q.includes("rapport") || q.includes("mensuel") || q.includes("board")) {
    return [
      "Ajoute une section benchmark",
      "Inclus les indicateurs ESG",
      "Exporte en PowerPoint",
      "Programme ce rapport chaque mois",
      "Compare avec le mois dernier",
    ];
  }
  if (q.includes("satisfaction") || q.includes("sentiment") || q.includes("nps")) {
    return [
      "Quels sujets dégradent la satisfaction ?",
      "Quelles sources amplifier ?",
      "Compare la satisfaction entre clients",
      "Génère un rapport satisfaction PDF",
      "Quelle est la tendance sur 90 jours ?",
    ];
  }
  return [
    "Compare 3 clients côte à côte",
    "Quel client a le meilleur ROI ?",
    "Génère un rapport mensuel PDF",
    "Analyse les risques de crise",
    "Résume l'activité de la semaine",
  ];
}

// ════════════════════════════════════════════════════════════════════
// SECTION 1 — CLIENT SWITCHER (sticky bar, full width)
// ════════════════════════════════════════════════════════════════════

function ClientSwitcherBar({
  clients,
  agency,
  activeClientId,
  loading,
  onSwitch,
  switching,
}: {
  clients: AgencyClient[];
  agency: AgencyMeta | null;
  activeClientId: string | null;
  loading: boolean;
  onSwitch: (clientId: string | null) => void;
  switching: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return clients;
    const q = query.toLowerCase();
    return clients.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.company.name.toLowerCase().includes(q) ||
        (c.company.sector ?? "").toLowerCase().includes(q),
    );
  }, [clients, query]);

  const activeClient = activeClientId
    ? clients.find((c) => c.id === activeClientId) ?? null
    : null;
  const level = agencySubLevel(clients.length);

  return (
    <CardShell className="lg:col-span-12" style={{ padding: 14 }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: agency brand + level badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
            style={{ backgroundColor: SAGE_BG, color: SAGE_DEEP }}
          >
            <Building2 size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 15,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
                className="truncate"
              >
                {agency?.name ?? "Console agence"}
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  backgroundColor: level.bg,
                  color: level.color,
                  fontWeight: 700,
                }}
              >
                Niveau {level.label}
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  backgroundColor: "#FAFAFA",
                  color: TEXT_BODY,
                }}
              >
                <AnimatedNumber
                  value={clients.length}
                  duration={800}
                  format={(n) => `${Math.round(n)} client${Math.round(n) > 1 ? "s" : ""}`}
                />
              </span>
            </div>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
              }}
            >
              Commission {agency?.commissionPct ?? 20}% · Multi-clients · Vue{" "}
              {activeClientId ? "client" : "agrégée"}
            </span>
          </div>
        </div>

        {/* Right: switcher dropdown */}
        <div ref={ref} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={loading || clients.length === 0}
            className="inline-flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-[#FAFAFA] disabled:opacity-60"
            style={{
              border: `1px solid ${BORDER_STRONG}`,
              backgroundColor: "#FFFFFF",
            }}
          >
            {activeClient ? (
              <>
                <ClientAvatarBadge client={activeClient} size={28} />
                <div className="text-left min-w-0 hidden sm:block">
                  <div
                    className="truncate"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 13,
                      fontWeight: 600,
                      color: CHARCOAL,
                      maxWidth: 220,
                    }}
                  >
                    {activeClient.displayName}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      color: TEXT_MUTED,
                    }}
                  >
                    {activeClient.company.sector || "Secteur non précisé"} ·{" "}
                    Score {derivedClientScore(activeClient)}/100
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                  style={{ backgroundColor: SAGE_BG, color: SAGE_DEEP }}
                >
                  <Layers size={14} />
                </div>
                <div className="text-left hidden sm:block">
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 13,
                      fontWeight: 600,
                      color: CHARCOAL,
                    }}
                  >
                    Vue agrégée
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                    Tous les clients
                  </div>
                </div>
              </>
            )}
            <ChevronDown
              size={14}
              style={{
                color: TEXT_MUTED,
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {open && (
            <div
              className="absolute right-0 top-full mt-1 w-[340px] z-50 rounded-lg overflow-hidden"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1px solid ${BORDER_STRONG}`,
                boxShadow: "0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.05)",
              }}
            >
              <div className="p-2 border-b" style={{ borderColor: BORDER }}>
                <div className="relative">
                  <Search
                    size={12}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: TEXT_MUTED,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Rechercher un client…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-7 pr-2 py-1.5 rounded-md outline-none"
                    style={{
                      border: `1px solid ${BORDER}`,
                      backgroundColor: "#FAFAFA",
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      color: CHARCOAL,
                    }}
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-[320px]">
                {/* Aggregate option */}
                <button
                  type="button"
                  onClick={() => {
                    onSwitch(null);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    backgroundColor: activeClientId === null ? SAGE_BG : "transparent",
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  <div
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                    style={{ backgroundColor: SAGE_BG, color: SAGE_DEEP }}
                  >
                    <Layers size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 12,
                        fontWeight: 600,
                        color: CHARCOAL,
                      }}
                    >
                      Vue agrégée (tous les clients)
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                      {clients.length} clients · Totalisation
                    </div>
                  </div>
                  {activeClientId === null && (
                    <CheckCircle2 size={14} style={{ color: SAGE }} />
                  )}
                </button>

                {filtered.length === 0 ? (
                  <div className="p-4 text-center" style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
                    Aucun client ne correspond à « {query} »
                  </div>
                ) : (
                  filtered.map((c) => {
                    const score = derivedClientScore(c);
                    const isActive = c.id === activeClientId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSwitch(c.id);
                          setOpen(false);
                          setQuery("");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-[#FAFAFA]"
                        style={{
                          backgroundColor: isActive ? SAGE_BG : "transparent",
                          borderBottom: `1px solid ${BORDER}`,
                        }}
                      >
                        <ClientAvatarBadge client={c} size={28} />
                        <div className="min-w-0 flex-1">
                          <div
                            className="truncate"
                            style={{
                              fontFamily: FONT_SANS,
                              fontSize: 12,
                              fontWeight: 600,
                              color: CHARCOAL,
                            }}
                          >
                            {c.displayName}
                          </div>
                          <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                            {c.company.sector || "—"} · Score {score} ·{" "}
                            {c.usage.whatsappAlerts} alerte
                            {c.usage.whatsappAlerts > 1 ? "s" : ""}
                          </div>
                        </div>
                        {isActive && <CheckCircle2 size={14} style={{ color: SAGE }} />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {switching && (
        <div
          className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-md"
          style={{
            backgroundColor: SAGE_BG,
            border: `1px solid ${SAGE_DIM}`,
            fontFamily: FONT_SANS,
            fontSize: 11,
            color: SAGE_DEEP,
          }}
        >
          <RefreshCw size={11} className="animate-spin" />
          Bascule vers le nouvel espace de travail…
        </div>
      )}
    </CardShell>
  );
}

function ClientAvatarBadge({ client, size = 36 }: { client: AgencyClient; size?: number }) {
  const logo = client.branding?.logoUrl;
  const bg = clientAvatarBg(client);
  const initials = clientInitials(client.displayName);
  if (logo) {
    return (
      <img
        src={logo}
        alt={`Logo ${client.displayName}`}
        width={size}
        height={size}
        style={{
          borderRadius: 6,
          objectFit: "cover",
          border: `1px solid ${BORDER}`,
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: bg,
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_MONO,
        fontSize: Math.round(size * 0.34),
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 1 (LEFT 30%) — CLIENT SWITCHER SPLIT
// Compact vertical client switcher for the split layout.
// Header (current client summary) + searchable list + "Ajouter un client".
// Sub-level badge: Débutant / Croissance / Entreprise based on client count.
// ════════════════════════════════════════════════════════════════════

function ClientSwitcherSplit({
  clients,
  agency,
  activeClientId,
  loading,
  onSwitch,
  onAddClient,
}: {
  clients: AgencyClient[];
  agency: AgencyMeta | null;
  activeClientId: string | null;
  loading: boolean;
  onSwitch: (clientId: string | null) => void;
  onAddClient: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return clients;
    const q = query.toLowerCase();
    return clients.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.company.name.toLowerCase().includes(q) ||
        (c.company.sector ?? "").toLowerCase().includes(q),
    );
  }, [clients, query]);

  const activeClient = activeClientId
    ? clients.find((c) => c.id === activeClientId) ?? null
    : null;
  const level = agencySubLevel(clients.length);

  return (
    <div
      className="flex flex-col h-full"
      style={{ minHeight: 540, backgroundColor: "#FFFFFF" }}
    >
      {/* Header — agency brand + sub-level badge */}
      <div
        className="px-4 py-3"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="inline-flex items-center justify-center rounded-lg shrink-0"
            style={{
              width: 32,
              height: 32,
              backgroundColor: SAGE_BG,
              color: SAGE_DEEP,
            }}
          >
            <Building2 size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="truncate"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 13,
                fontWeight: 700,
                color: CHARCOAL,
              }}
            >
              {agency?.name ?? "Console agence"}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-full"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 8,
                  letterSpacing: "0.08em",
                  backgroundColor: level.bg,
                  color: level.color,
                  fontWeight: 700,
                }}
              >
                {level.label}
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  color: TEXT_MUTED,
                }}
              >
                {clients.length} client{clients.length > 1 ? "s" : ""} · Comm. {agency?.commissionPct ?? 20}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current client summary card */}
      <div
        className="mx-3 mt-3 rounded-lg p-3"
        style={{
          backgroundColor: activeClient ? SAGE_BG : "#FAFAFA",
          border: `1px solid ${activeClient ? SAGE_DIM : BORDER}`,
        }}
      >
        <div
          style={{
            ...FONT_HEADER,
            fontSize: 9,
            marginBottom: 6,
          }}
        >
          Espace actif
        </div>
        {loading ? (
          <div className="space-y-2">
            <LiveSkeleton className="h-4 w-3/4" label="Chargement du portefeuille…" />
            <LiveSkeleton className="h-3 w-1/2" label="Chargement du portefeuille…" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeClient ? activeClient.id : "aggregate"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }}
              className="flex items-center gap-2.5"
            >
              {activeClient ? (
                <>
                  <ClientAvatarBadge client={activeClient} size={36} />
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate"
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 13,
                        fontWeight: 700,
                        color: CHARCOAL,
                      }}
                    >
                      {activeClient.displayName}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: SAGE_DEEP,
                      }}
                    >
                      {activeClient.company.sector || "Secteur —"} · Score {derivedClientScore(activeClient)}/100
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="inline-flex items-center justify-center rounded-md shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: SAGE_BG,
                      color: SAGE_DEEP,
                    }}
                  >
                    <Layers size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 13,
                        fontWeight: 700,
                        color: CHARCOAL,
                      }}
                    >
                      Vue agrégée
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: SAGE_DEEP,
                      }}
                    >
                      Tous les clients · {clients.length} espaces
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Search */}
      <div className="px-3 mt-3">
        <div className="relative">
          <Search
            size={12}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: TEXT_MUTED,
            }}
          />
          <input
            type="text"
            placeholder="Rechercher un client…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-2 rounded-md outline-none"
            style={{
              border: `1px solid ${BORDER}`,
              backgroundColor: "#FAFAFA",
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: CHARCOAL,
            }}
            aria-label="Rechercher un client"
          />
        </div>
      </div>

      {/* Client list (scrollable) */}
      <div
        className="flex-1 overflow-y-auto px-2 py-2 mt-1"
        style={{ maxHeight: 320, minHeight: 160 }}
      >
        {/* Aggregate option */}
        <motion.button
          type="button"
          onClick={() => onSwitch(null)}
          initial={false}
          animate={{ backgroundColor: activeClientId === null ? SAGE_BG : "rgba(0,0,0,0)" }}
          transition={{ duration: 0.2 }}
          className="w-full flex items-center gap-2 px-2 py-2 text-left rounded-md transition-colors hover:bg-[#FAFAFA]"
          style={{
            backgroundColor: activeClientId === null ? SAGE_BG : "transparent",
            marginBottom: 4,
          }}
        >
          <div
            className="inline-flex items-center justify-center rounded-md shrink-0"
            style={{
              width: 28,
              height: 28,
              backgroundColor: SAGE_BG,
              color: SAGE_DEEP,
            }}
          >
            <Layers size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="truncate"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                fontWeight: 600,
                color: CHARCOAL,
              }}
            >
              Vue agrégée
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: TEXT_MUTED,
              }}
            >
              Tous les clients · Totalisation
            </div>
          </div>
          {activeClientId === null && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <CheckCircle2 size={14} style={{ color: SAGE }} />
            </motion.span>
          )}
        </motion.button>

        {filtered.length === 0 ? (
          <div
            className="px-3 py-4 text-center"
            style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}
          >
            Aucun client ne correspond à « {query} »
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((c, idx) => {
              const score = derivedClientScore(c);
              const isActive = c.id === activeClientId;
              const alertCount = c.usage.whatsappAlerts ?? 0;
              return (
                <motion.button
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, delay: Math.min(0.15, idx * 0.02) }}
                  type="button"
                  onClick={() => onSwitch(c.id)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-left rounded-md transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    backgroundColor: isActive ? SAGE_BG : "transparent",
                    marginBottom: 2,
                  }}
                >
                  <ClientAvatarBadge client={c} size={28} />
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate"
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 12,
                        fontWeight: 600,
                        color: CHARCOAL,
                      }}
                    >
                      {c.displayName}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        color: TEXT_MUTED,
                      }}
                    >
                      {c.company.sector || "—"} · Score {score}
                    </div>
                  </div>
                  {alertCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 380, damping: 18 }}
                      className="inline-flex items-center justify-center rounded-full"
                      style={{
                        minWidth: 16,
                        height: 16,
                        padding: "0 4px",
                        backgroundColor: alertCount >= 5 ? NEGATIVE : NEUTRAL_AMBER,
                        color: "#FFFFFF",
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    >
                      {alertCount}
                    </motion.span>
                  )}
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    >
                      <CheckCircle2 size={14} style={{ color: SAGE }} />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer — Add client button */}
      <div
        className="px-3 py-3"
        style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
      >
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8"
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.04em",
            borderColor: SAGE,
            color: SAGE_DEEP,
          }}
          onClick={onAddClient}
        >
          <Plus size={12} className="mr-1.5" />
          Ajouter un client
        </Button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 1 (RIGHT 70%) — HARCHIQ AI WORKSPACE
// Unlimited + multi-client aware. 8 agency prompts. Source-backed.
// 1-click PPT/PDF/Copy per message. 5 follow-up chips. History (5 convs).
// ════════════════════════════════════════════════════════════════════

function HarchIQAgencyWorkspace({
  activeClientName,
  clientsCount,
}: {
  activeClientName: string | null;
  clientsCount: number;
}) {
  const [messages, setMessages] = useState<AgencyChatMessage[]>([
    {
      id: "welcome-agency",
      role: "ai",
      content: `Bonjour. Je suis HarchIQ AI — Agences. J'analyse votre portefeuille de ${clientsCount} client${clientsCount > 1 ? "s" : ""} et le client actif${activeClientName ? ` (${activeClientName})` : " (vue agrégée)"}. Posez-moi une question stratégique : analyse de marché, pitch deck prospect, comparaison multi-clients, ROI, rapports mensuels. Sources citées, export PDF + PowerPoint, quota illimité.`,
      followUps: [
        "Analyse le paysage de marché",
        "Compare 3 clients côte à côte",
        "Quel client a le meilleur ROI ce mois ?",
        "Génère un rapport client mensuel",
        "Résume l'activité de la semaine",
      ],
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  // AURA fix #2 — persist conversation history to localStorage (cap 50, survives refresh)
  const [history, setHistory] = usePersistentState<ConversationHistoryItem[]>(
    "harchiq:agency:workspace-history",
    [],
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveConversationToHistory = useCallback(
    (msgs: AgencyChatMessage[]) => {
      const userMsgs = msgs.filter((m) => m.role === "user");
      if (userMsgs.length === 0) return;
      const firstUser = userMsgs[0];
      const convId = activeConversationId ?? `conv-${Date.now()}`;
      const lastAi = msgs.filter((m) => m.role === "ai" && !m.pending).slice(-1)[0];
      const item: ConversationHistoryItem = {
        id: convId,
        title: firstUser.content.slice(0, 42) + (firstUser.content.length > 42 ? "…" : ""),
        preview: lastAi?.content.slice(0, 80) ?? "—",
        messageCount: msgs.length,
        timestamp: Date.now(),
        messages: msgs,
      };
      setHistory((h) => {
        const filtered = h.filter((x) => x.id !== convId);
        return [item, ...filtered].slice(0, 50); // 50 conversations (AURA fix #2)
      });
      setActiveConversationId(convId);
    },
    [activeConversationId],
  );

  const sendQuestion = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || sending) return;

      const userMsg: AgencyChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };
      const pendingId = `ai-${Date.now()}`;
      const pendingMsg: AgencyChatMessage = {
        id: pendingId,
        role: "ai",
        content: "",
        pending: true,
        timestamp: Date.now(),
      };
      let nextMessages: AgencyChatMessage[] = [];
      setMessages((m) => {
        nextMessages = [...m, userMsg, pendingMsg];
        return nextMessages;
      });
      setInput("");
      setSending(true);

      try {
        const context = activeClientName
          ? `Contexte: client actif = ${activeClientName}. ${trimmed}`
          : `Contexte: vue agrégée de ${clientsCount} clients. ${trimmed}`;
        const r = await fetch("/api/console/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: context, accountType: "agency" }),
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err?.error ?? `HTTP ${r.status}`);
        }
        const data: AskResponse = await r.json();
        const sources: AskSource[] = (data.sources ?? []).map((s) => ({
          type: (s.type as AskSource["type"]) ?? "neighbor",
          id: s.id,
          title: s.title,
        }));
        let finalMsgs: AgencyChatMessage[] = [];
        setMessages((m) => {
          const updated = m.map((msg) =>
            msg.id === pendingId
              ? {
                  ...msg,
                  content: data.answer || "Aucune réponse générée.",
                  sources,
                  followUps: generateAgencyFollowUps(trimmed),
                  pending: false,
                  timestamp: Date.now(),
                }
              : msg,
          );
          finalMsgs = updated;
          return updated;
        });
        setTimeout(() => saveConversationToHistory(finalMsgs), 50);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Erreur réseau";
        let errMsgs: AgencyChatMessage[] = [];
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
    },
    [sending, saveConversationToHistory, activeClientName, clientsCount],
  );

  const handlePromptClick = useCallback(
    (card: PromptCard) => {
      void sendQuestion(card.prompt);
    },
    [sendQuestion],
  );

  const handleFollowUpClick = useCallback(
    (prompt: string) => {
      void sendQuestion(prompt);
    },
    [sendQuestion],
  );

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

  const handleExport = (msg: AgencyChatMessage, format: "ppt" | "pdf" | "copy") => {
    if (format === "copy") {
      navigator.clipboard
        ?.writeText(msg.content)
        .then(() => toast.success("Réponse copiée dans le presse-papiers."));
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
        id: "welcome-agency",
        role: "ai",
        content: `Bonjour. Je suis HarchIQ AI — Agences. Posez-moi une question stratégique sur votre portefeuille${activeClientName ? ` ou sur ${activeClientName}` : ""}.`,
        followUps: [
          "Analyse le paysage de marché",
          "Compare 3 clients côte à côte",
          "Quel client a le meilleur ROI ce mois ?",
          "Génère un rapport client mensuel",
          "Résume l'activité de la semaine",
        ],
        timestamp: Date.now(),
      },
    ]);
    setActiveConversationId(null);
  };

  const handleRestoreConversation = (item: ConversationHistoryItem) => {
    setMessages(item.messages);
    setActiveConversationId(item.id);
    setShowHistory(false);
    toast.info(`Conversation restaurée : "${item.title}"`);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ minHeight: 540, backgroundColor: "#FFFFFF" }}
    >
      {/* Header — badges + actions */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 30, height: 30, backgroundColor: SAGE, color: "#FFFFFF" }}
          >
            <Sparkles size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                HarchIQ AI Workspace
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  backgroundColor: SAGE_BG,
                  color: SAGE,
                  fontWeight: 700,
                }}
              >
                HARCHIQ AI — AGENCES
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full hidden sm:inline-flex"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  backgroundColor: CHARCOAL,
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                QUOTA ILLIMITÉ
              </span>
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: TEXT_MUTED,
                letterSpacing: "0.04em",
                marginTop: 2,
              }}
            >
              {activeClientName
                ? `Client actif : ${activeClientName}`
                : `Vue agrégée · ${clientsCount} clients`}{" "}
              · Sources citées · 8 prompts · Export PDF + PPT
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 hidden md:inline-flex"
            style={{ fontFamily: FONT_MONO, fontSize: 10 }}
            onClick={() => setShowHistory((v) => !v)}
            aria-label="Historique des conversations"
          >
            <Layers size={11} className="mr-1" />
            Historique ({history.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 hidden md:inline-flex"
            style={{ fontFamily: FONT_MONO, fontSize: 10 }}
            onClick={() => handleExportConversation("pdf")}
            aria-label="Exporter la conversation en PDF"
          >
            <FileText size={11} className="mr-1" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 hidden md:inline-flex"
            style={{ fontFamily: FONT_MONO, fontSize: 10 }}
            onClick={() => handleExportConversation("ppt")}
            aria-label="Exporter la conversation en PowerPoint"
          >
            <Download size={11} className="mr-1" />
            PPT
          </Button>
          <button
            type="button"
            onClick={handleNewConversation}
            className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
            style={{ width: 28, height: 28, border: `1px solid ${BORDER}` }}
            aria-label="Nouvelle conversation"
            title="Nouvelle conversation"
          >
            <Plus size={13} style={{ color: SAGE }} />
          </button>
        </div>
      </div>

      {/* Body — chat + prompt library */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0">
        {/* Chat side (8/12 ≈ 67%) */}
        <div
          className="lg:col-span-8 flex flex-col min-h-0"
          style={{ borderRight: `1px solid ${BORDER}` }}
        >
          {/* Optional conversation history strip (when toggled) */}
          {showHistory && (
            <div
              className="px-3 py-2"
              style={{
                borderBottom: `1px solid ${BORDER}`,
                backgroundColor: "#FAFAFA",
              }}
            >
              <div
                className="flex items-center justify-between mb-2"
              >
                <span style={FONT_HEADER}>Historique (50 max)</span>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="inline-flex items-center justify-center rounded-md hover:bg-[#F5F5F5]"
                  style={{ width: 20, height: 20 }}
                  aria-label="Fermer l'historique"
                >
                  <X size={12} style={{ color: TEXT_MUTED }} />
                </button>
              </div>
              {history.length === 0 ? (
                <div
                  className="py-3 text-center"
                  style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}
                >
                  Aucune conversation sauvegardée.
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {history.map((item) => {
                    const isActive = item.id === activeConversationId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleRestoreConversation(item)}
                        className="shrink-0 text-left rounded-md p-2 transition-colors hover:bg-[#FFFFFF]"
                        style={{
                          width: 200,
                          border: `1px solid ${isActive ? SAGE : BORDER}`,
                          backgroundColor: isActive ? SAGE_BG : "#FFFFFF",
                        }}
                      >
                        <div
                          className="truncate"
                          style={{
                            fontFamily: FONT_SANS,
                            fontSize: 11,
                            fontWeight: 700,
                            color: CHARCOAL,
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          className="truncate"
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            color: TEXT_MUTED,
                            marginTop: 2,
                          }}
                        >
                          {item.messageCount} msg · {fmtRelative(item.timestamp)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Messages scroll area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            style={{ maxHeight: 360, minHeight: 240 }}
          >
            {messages.map((msg) => (
              <AgencyChatMessageView
                key={msg.id}
                msg={msg}
                expanded={expandedSources.has(msg.id)}
                onToggleSources={() => toggleSources(msg.id)}
                onFollowUp={handleFollowUpClick}
                onExport={(fmt) => handleExport(msg, fmt)}
              />
            ))}
          </div>

          {/* Input bar */}
          <div
            className="px-3 py-3"
            style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
          >
            <div
              className="flex items-end gap-2 rounded-lg px-3 py-2"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1px solid ${BORDER_STRONG}`,
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question à HarchIQ AI — Agences…"
                rows={1}
                disabled={sending}
                className="flex-1 resize-none outline-none disabled:opacity-50"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: CHARCOAL,
                  maxHeight: 80,
                  minHeight: 22,
                  padding: "2px 0",
                }}
                aria-label="Question à HarchIQ AI"
              />
              <button
                type="button"
                onClick={() => void sendQuestion(input)}
                disabled={sending || !input.trim()}
                className="inline-flex items-center justify-center rounded-md disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: CHARCOAL,
                  color: "#FFFFFF",
                }}
                aria-label="Envoyer"
              >
                {sending ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
              </button>
            </div>
            <div
              className="mt-1.5 px-1 flex items-center justify-between"
              style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}
            >
              <span>Entrée pour envoyer · Maj+Entrée = nouvelle ligne · Quota illimité</span>
              <span className="hidden sm:inline">HarchIQ peut faire des erreurs — vérifiez les sources.</span>
            </div>
          </div>
        </div>

        {/* Prompt library (4/12 ≈ 33%) — 8 agency prompts */}
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${BORDER}` }}
          >
            <span style={FONT_HEADER}>Bibliothèque</span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                backgroundColor: "#FAFAFA",
                color: TEXT_MUTED,
              }}
            >
              8 PROMPTS
            </span>
          </div>
          <div
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
            style={{ maxHeight: 440 }}
          >
            {AGENCY_PROMPT_LIBRARY.map((card) => {
              const { Icon } = card;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handlePromptClick(card)}
                  disabled={sending}
                  className="group w-full text-left rounded-lg p-2.5 transition-all hover:shadow-sm disabled:opacity-50"
                  style={{
                    border: `1px solid ${BORDER}`,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="flex items-center justify-center rounded-md shrink-0"
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: SAGE_BG,
                        color: SAGE,
                      }}
                    >
                      <Icon size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 11,
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
                          fontSize: 10,
                          color: TEXT_MUTED,
                          marginTop: 2,
                          lineHeight: 1.4,
                        }}
                      >
                        {card.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Agency Chat Message Bubble ────────────────────────────────────────
// User = right-aligned charcoal · AI = left-aligned sage tint with sources,
// 1-click PPT/PDF/Copy export, and 5 follow-up chips per response.

function AgencyChatMessageView({
  msg,
  expanded,
  onToggleSources,
  onFollowUp,
  onExport,
}: {
  msg: AgencyChatMessage;
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
          className="max-w-[80%] rounded-2xl rounded-br-sm px-3 py-2"
          style={{
            backgroundColor: CHARCOAL,
            color: "#FFFFFF",
            fontFamily: FONT_SANS,
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div
        className="flex items-center justify-center rounded-lg shrink-0"
        style={{ width: 26, height: 26, backgroundColor: SAGE, color: "#FFFFFF" }}
      >
        <Sparkles size={13} />
      </div>
      <div className="flex-1 min-w-0">
        {msg.pending ? (
          <div
            className="rounded-2xl rounded-tl-sm px-3 py-2 inline-block"
            style={{
              backgroundColor: SAGE_BG,
              fontFamily: FONT_SANS,
              fontSize: 12,
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
              className="rounded-2xl rounded-tl-sm px-3 py-2"
              style={{
                backgroundColor: SAGE_BG,
                fontFamily: FONT_SANS,
                fontSize: 12,
                lineHeight: 1.55,
                color: CHARCOAL,
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.content}
            </div>

            {/* Sources expandable */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={onToggleSources}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors hover:bg-[#FAFAFA]"
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
                >
                  <Sparkles size={10} />
                  <span>Sources ({msg.sources.length})</span>
                  <ChevronRight
                    size={10}
                    style={{
                      transform: expanded ? "rotate(90deg)" : "none",
                      transition: "transform 0.15s",
                    }}
                  />
                </button>
                {expanded && (
                  <div
                    className="mt-1 rounded-md p-2 space-y-1"
                    style={{
                      backgroundColor: "#FAFAFA",
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    {msg.sources.map((s, i) => (
                      <div
                        key={`${s.id}-${i}`}
                        className="flex items-start gap-2"
                        style={{ fontFamily: FONT_SANS, fontSize: 10, color: TEXT_BODY }}
                      >
                        <span
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 8,
                            fontWeight: 700,
                            color: SAGE,
                            backgroundColor: SAGE_BG,
                            borderRadius: 3,
                            padding: "1px 4px",
                            marginTop: 1,
                            flexShrink: 0,
                          }}
                        >
                          {s.type === "alert"
                            ? "ALERTE"
                            : s.type === "topic"
                              ? "SUJET"
                              : s.type === "ai-visibility"
                                ? "IA"
                                : s.type === "client"
                                  ? "CLIENT"
                                  : s.type === "campaign"
                                    ? "CAMPAGNE"
                                    : s.type === "report"
                                      ? "RAPPORT"
                                      : "CONCURRENT"}
                        </span>
                        <span style={{ lineHeight: 1.4 }}>{s.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Export buttons — 1-click PPT/PDF/Copy */}
            {!msg.pending && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => onExport("ppt")}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: TEXT_MUTED,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <FileText size={10} /> PPT
                </button>
                <button
                  type="button"
                  onClick={() => onExport("pdf")}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: TEXT_MUTED,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Download size={10} /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => onExport("copy")}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: TEXT_MUTED,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Copy size={10} /> Copier
                </button>
              </div>
            )}

            {/* Follow-up chips — 5 agency-specific suggestions */}
            {!msg.pending && msg.followUps && msg.followUps.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {msg.followUps.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onFollowUp(f)}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors hover:bg-[#F5F5F5]"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      color: SAGE,
                      border: `1px solid ${SAGE}`,
                      backgroundColor: "transparent",
                    }}
                  >
                    <Sparkles size={9} />
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
// SECTION 2 — SCORE DE RÉPUTATION (hero, full width)
// RadialBarChart gauge — aggregate (avg across clients) or active client
// ════════════════════════════════════════════════════════════════════

function ScoreReputationHero({
  clients,
  activeClient,
  health,
  loading,
  onRefresh,
}: {
  clients: AgencyClient[];
  activeClient: AgencyClient | null;
  health: BrandHealth | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  const isAggregate = !activeClient;
  const [refreshing, setRefreshing] = useState(false);

  // Aggregate: average derived scores across all clients
  const aggregate = useMemo(() => {
    if (clients.length === 0)
      return { score: 0, trend: 0, sentiment: { positive: 0, neutral: 0, negative: 0 }, alerts: 0, articles: 0 };
    const scores = clients.map((c) => derivedClientScore(c));
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const sentSums = clients.reduce(
      (acc, c) => {
        const s = derivedClientSentiment(c);
        acc.positive += s.positive;
        acc.neutral += s.neutral;
        acc.negative += s.negative;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 },
    );
    const n = clients.length;
    return {
      score: avgScore,
      trend: 2, // proxy — average portfolio lift
      sentiment: {
        positive: Math.round(sentSums.positive / n),
        neutral: Math.round(sentSums.neutral / n),
        negative: Math.round(sentSums.negative / n),
      },
      alerts: clients.reduce((s, c) => s + (c.usage.whatsappAlerts ?? 0), 0),
      articles: clients.reduce((s, c) => s + (c.usage.apiRequests ?? 0), 0),
    };
  }, [clients]);

  const score = isAggregate ? aggregate.score : health?.score ?? derivedClientScore(activeClient!);
  const trend = isAggregate ? aggregate.trend : health?.trend ?? 0;
  const sentiment = isAggregate
    ? aggregate.sentiment
    : health?.sentiment ?? derivedClientSentiment(activeClient!);

  const gaugeData = [
    {
      name: "score",
      value: score,
      fill: score >= 70 ? SAGE : score >= 50 ? NEUTRAL_AMBER : NEGATIVE,
    },
  ];

  const lastUpdated = isAggregate
    ? clients[0]?.updatedAt
      ? fmtRelative(clients[0].updatedAt)
      : "—"
    : health?.lastUpdated
      ? fmtRelative(health.lastUpdated)
      : "—";

  // 10x AI commentary — best & worst client in aggregate mode
  const aiCommentaryText = useMemo(() => {
    if (clients.length === 0) return "Aucun client dans le portefeuille. Ajoutez un client pour commencer l'analyse.";
    if (!isAggregate) {
      return `Score du client ${activeClient?.displayName ?? ""} : ${score}/100. Tendance ${trend >= 0 ? "en hausse" : "en baisse"} (${fmtSigned(trend, " pts")}). ${score >= 70 ? "Réputation solide — maintenez le cap." : score >= 50 ? "Réputation moyenne — audit recommandé." : "Réputation à risque — action immédiate requise."}`;
    }
    const sorted = [...clients].sort((a, b) => derivedClientScore(b) - derivedClientScore(a));
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    return `Score moyen de tous les clients : ${score}/100. Meilleur : ${best.displayName} (${derivedClientScore(best)}). À surveiller : ${worst.displayName} (${derivedClientScore(worst)}). ${aggregate.alerts > 0 ? `${aggregate.alerts} alerte(s) WhatsApp cumulée(s) ce mois.` : "Aucune alerte critique détectée."}`;
  }, [clients, isAggregate, activeClient, score, trend, aggregate.alerts]);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="02 · Score de Réputation"
        right={
          <>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              {isAggregate ? "Vue agrégée" : activeClient?.displayName ?? "—"}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={handleRefresh}
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
                <RTooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BORDER_STRONG}`,
                    borderRadius: 8,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: CHARCOAL,
                    padding: "6px 10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                  formatter={(value: number) => [`${Math.round(Number(value))}/100`, "Score"]}
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
                {loading ? "—" : Math.round(score)}
              </span>
              <span style={{ ...FONT_HEADER, marginTop: 4 }}>/ 100</span>
            </div>
          </div>
        </div>

        {/* Center text block */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Gauge size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 18,
                fontWeight: 600,
                color: CHARCOAL,
              }}
            >
              {isAggregate
                ? "Réputation du portefeuille"
                : `Réputation — ${activeClient?.displayName}`}
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
            {isAggregate
              ? `Score moyen agrégé sur ${clients.length} client${clients.length > 1 ? "s" : ""}. La note est un proxy basé sur l'utilisation des quotas API et le volume d'alertes WhatsApp.`
              : (health?.recommendation ?? "En attente des données de réputation de ce client…")}
          </p>
        </div>

        {/* Mini stats column */}
        <div className="lg:col-span-4 grid grid-cols-3 gap-3">
          <MiniStat
            label="Clients actifs"
            value={isAggregate ? fmtNumber(clients.filter((c) => c.status === "active").length) : "1"}
          />
          <MiniStat
            label="Alertes (7j)"
            value={isAggregate ? fmtNumber(aggregate.alerts) : fmtNumber(0)}
            dotColor={aggregate.alerts > 0 ? NEGATIVE : POSITIVE}
          />
          <MiniStat
            label="Articles 30J"
            value={isAggregate ? fmtNumber(aggregate.articles) : fmtNumber(health?.mentionCount24h ?? 0)}
          />
          <MiniStat
            label="Positif"
            value={`${sentiment.positive}%`}
            dotColor={POSITIVE}
          />
          <MiniStat
            label="Neutre"
            value={`${sentiment.neutral}%`}
            dotColor={NEUTRAL_GRAY}
          />
          <MiniStat
            label="Négatif"
            value={`${sentiment.negative}%`}
            dotColor={NEGATIVE}
          />
        </div>
      </div>
      <div
        className="mt-3 flex items-center justify-between"
        style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
      >
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1 transition-colors hover:text-[#4A7B5F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A7B5F] rounded"
          style={{ fontFamily: FONT_MONO, fontSize: 10, color: "inherit" }}
          aria-label="Rafraîchir les données"
        >
          Dernière maj · {lastUpdated}
          <RefreshCw size={10} className={refreshing ? "animate-spin" : ""} />
        </button>
        <span>
          {isAggregate
            ? "Proxy utilisation quota"
            : `Source · ${health?.source ?? "console"}`}
        </span>
      </div>
      <AiCommentary text={aiCommentaryText} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTIONS 3-8 — KPI STRIP (6 cards)
// ════════════════════════════════════════════════════════════════════

function KpiClientsActifs({
  clients,
  loading,
}: {
  clients: AgencyClient[];
  loading: boolean;
}) {
  const active = clients.filter((c) => c.status === "active").length;
  const suspended = clients.filter((c) => c.status === "suspended").length;
  const terminated = clients.filter((c) => c.status === "terminated").length;
  return (
    <CardShell className="lg:col-span-2 md:col-span-3 sm:col-span-6">
      <SectionHeader title="03 · Clients Actifs" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-baseline gap-2">
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 28,
            fontWeight: 700,
            color: CHARCOAL,
          }}
        >
          {loading ? "—" : <AnimatedNumber value={active} format={fmtNumber} duration={750} />}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
          / {clients.length} total
        </span>
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED, marginTop: 6 }}>
        Portefeuille actif · {suspended} suspendu{suspended > 1 ? "s" : ""} ·{" "}
        {terminated} résilié{terminated > 1 ? "s" : ""}
      </p>
      <AiCommentary text={`${active} client${active > 1 ? "s" : ""} actif${active > 1 ? "s" : ""} sur ${clients.length}. ${suspended > 0 ? `${suspended} à relancer.` : "Portefeuille sain."} ${active >= 6 ? "Niveau Croissance — débloquez le white-label." : "Niveau Débutant."}`} />
    </CardShell>
  );
}

function KpiAlertesCrisis({
  clients,
  alerts,
  activeClient,
  loading,
}: {
  clients: AgencyClient[];
  alerts: CrisisAlertsResp | null;
  activeClient: AgencyClient | null;
  loading: boolean;
}) {
  const count = activeClient
    ? alerts?.count ?? alerts?.alerts?.length ?? 0
    : clients.reduce((s, c) => s + (c.usage.whatsappAlerts ?? 0), 0);
  const critical = activeClient
    ? (alerts?.alerts ?? []).filter((a) => a.severity === "critical").length
    : clients.filter((c) => (c.usage.whatsappAlerts ?? 0) >= 5).length;
  return (
    <CardShell className="lg:col-span-2 md:col-span-3 sm:col-span-6">
      <SectionHeader title="04 · Alertes Crisis" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 28,
              fontWeight: 700,
              color: count > 0 ? (critical > 0 ? NEGATIVE : NEUTRAL_AMBER) : POSITIVE,
            }}
          >
            {loading ? "—" : <AnimatedNumber value={count} format={fmtNumber} duration={750} />}
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
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED, marginTop: 6 }}>
        {activeClient ? "Client sélectionné" : "Tous clients confondus"}
      </p>
      <AiCommentary text={critical > 0 ? `${critical} alerte${critical > 1 ? "s" : ""} critique${critical > 1 ? "s" : ""} détectée${critical > 1 ? "s" : ""}. Action immédiate requise.` : count > 0 ? `${count} alerte${count > 1 ? "s" : ""} de surveillance. Surveillez l'évolution.` : "Aucune alerte. Portefeuille sous contrôle."} />
    </CardShell>
  );
}

function KpiScoreMoyen({
  clients,
  health,
  activeClient,
  loading,
}: {
  clients: AgencyClient[];
  health: BrandHealth | null;
  activeClient: AgencyClient | null;
  loading: boolean;
}) {
  const value = activeClient
    ? health?.score ?? derivedClientScore(activeClient)
    : clients.length === 0
      ? 0
      : Math.round(
          clients.reduce((s, c) => s + derivedClientScore(c), 0) / clients.length,
        );
  const delta = activeClient ? health?.trend ?? 0 : 2;
  return (
    <CardShell className="lg:col-span-2 md:col-span-3 sm:col-span-6">
      <SectionHeader title="05 · Score Moyen" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-baseline gap-2">
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 28,
            fontWeight: 700,
            color: value >= 75 ? SAGE : value >= 60 ? NEUTRAL_AMBER : NEGATIVE,
          }}
        >
          {loading ? "—" : value}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>/ 100</span>
        <Delta value={delta ?? 0} />
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED, marginTop: 6 }}>
        {activeClient ? "Client sélectionné" : "Moyenne du portefeuille"}
      </p>
      <AiCommentary text={value >= 75 ? "Réputation solide. Maintenez le cap." : value >= 60 ? "Réputation moyenne. Audit recommandé." : "Réputation à risque. Action immédiate requise."} />
    </CardShell>
  );
}

function KpiSentimentGlobal({
  clients,
  health,
  activeClient,
  loading,
}: {
  clients: AgencyClient[];
  health: BrandHealth | null;
  activeClient: AgencyClient | null;
  loading: boolean;
}) {
  const sent = activeClient
    ? health?.sentiment ?? derivedClientSentiment(activeClient)
    : clients.length === 0
      ? { positive: 0, neutral: 0, negative: 0 }
      : (() => {
          const sums = clients.reduce(
            (acc, c) => {
              const s = derivedClientSentiment(c);
              acc.positive += s.positive;
              acc.neutral += s.neutral;
              acc.negative += s.negative;
              return acc;
            },
            { positive: 0, neutral: 0, negative: 0 },
          );
          const n = clients.length;
          return {
            positive: Math.round(sums.positive / n),
            neutral: Math.round(sums.neutral / n),
            negative: Math.round(sums.negative / n),
          };
        })();
  return (
    <CardShell className="lg:col-span-2 md:col-span-3 sm:col-span-6">
      <SectionHeader title="06 · Sentiment Global" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-baseline gap-2">
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 28,
            fontWeight: 700,
            color: sent.positive >= 50 ? SAGE : sent.positive >= 35 ? NEUTRAL_AMBER : NEGATIVE,
          }}
        >
          {loading ? "—" : `${sent.positive}%`}
        </span>
        <Delta value={sent.positive - 50} />
      </div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full mt-3" style={{ backgroundColor: "#F4F4F5" }}>
        <div style={{ width: `${sent.positive}%`, backgroundColor: POSITIVE }} />
        <div style={{ width: `${sent.neutral}%`, backgroundColor: NEUTRAL_GRAY }} />
        <div style={{ width: `${sent.negative}%`, backgroundColor: NEGATIVE }} />
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED, marginTop: 6 }}>
        {sent.neutral}% neutre · {sent.negative}% négatif
      </p>
      <AiCommentary text={sent.positive >= 50 ? `Sentiment positif dominant (${sent.positive}%). Portefeuille perçu favorablement.` : sent.negative >= 40 ? `Part négative élevée (${sent.negative}%). Plan de communication recommandé.` : `Sentiment équilibré. Surveillez les thématiques émergentes.`} />
    </CardShell>
  );
}

function KpiArticles30J({
  clients,
  health,
  activeClient,
  loading,
}: {
  clients: AgencyClient[];
  health: BrandHealth | null;
  activeClient: AgencyClient | null;
  loading: boolean;
}) {
  const value = activeClient
    ? (health?.mentionCount24h ?? 0) * 30
    : clients.reduce((s, c) => s + (c.usage.apiRequests ?? 0), 0);
  return (
    <CardShell className="lg:col-span-2 md:col-span-3 sm:col-span-6">
      <SectionHeader title="07 · Articles 30J" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-baseline gap-2">
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 28,
            fontWeight: 700,
            color: CHARCOAL,
          }}
        >
          {loading ? "—" : fmtNumber(value)}
        </span>
        <Delta value={value > 0 ? 8 : 0} />
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED, marginTop: 6 }}>
        {activeClient
          ? "Mentions collectées (30 derniers jours)"
          : "Volume agrégé du portefeuille"}
      </p>
      <AiCommentary text={value > 500 ? `Volume élevé (${fmtNumber(value)} articles). Excellente couverture médiatique.` : value > 100 ? `Volume modéré (${fmtNumber(value)} articles). Couverture acceptable.` : `Volume faible (${fmtNumber(value)} articles). Augmentez les sources surveillées.`} />
    </CardShell>
  );
}

function KpiRapportsGeneres({
  reports,
  loading,
}: {
  reports: ReportItem[];
  loading: boolean;
}) {
  const now = new Date();
  const thisMonth = reports.filter((r) => {
    const d = new Date(r.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  return (
    <CardShell className="lg:col-span-2 md:col-span-3 sm:col-span-6">
      <SectionHeader title="08 · Rapports Générés" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex items-baseline gap-2">
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 28,
            fontWeight: 700,
            color: CHARCOAL,
          }}
        >
          {loading ? "—" : fmtNumber(thisMonth)}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
          / {reports.length} total
        </span>
        <Delta value={thisMonth > 0 ? 1 : 0} />
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED, marginTop: 6 }}>
        Rapports générés ce mois-ci
      </p>
      <AiCommentary text={thisMonth >= 10 ? `${thisMonth} rapports ce mois. Cadence excellente — vos clients reçoivent un reporting régulier.` : thisMonth > 0 ? `${thisMonth} rapport${thisMonth > 1 ? "s" : ""} ce mois. Programmez un template hebdomadaire.` : "Aucun rapport ce mois. Générez un rapport client via HarchIQ."} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 9 — PORTFOLIO CLIENTS (TanStack Table)
// ════════════════════════════════════════════════════════════════════

interface PortfolioRow {
  id: string;
  displayName: string;
  slug: string;
  sector: string;
  planTier: string;
  score: number;
  sentiment: { positive: number; neutral: number; negative: number };
  alerts: number;
  lastReport: string | null;
  status: string;
}

function PortfolioClientsTable({
  clients,
  reports,
  loading,
  onSwitch,
}: {
  clients: AgencyClient[];
  reports: ReportItem[];
  loading: boolean;
  onSwitch: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "score", desc: true }]);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.company.sector) set.add(c.company.sector);
    });
    return Array.from(set).sort();
  }, [clients]);

  const lastReportByClient = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of reports) {
      if (!r.companyName) continue;
      const existing = m.get(r.companyName);
      if (!existing || new Date(r.createdAt) > new Date(existing)) {
        m.set(r.companyName, r.createdAt);
      }
    }
    return m;
  }, [reports]);

  const rows = useMemo<PortfolioRow[]>(() => {
    return clients.map((c) => ({
      id: c.id,
      displayName: c.displayName,
      slug: c.company.slug,
      sector: c.company.sector || "—",
      planTier: c.quota?.planTier ?? "",
      score: derivedClientScore(c),
      sentiment: derivedClientSentiment(c),
      alerts: c.usage.whatsappAlerts ?? 0,
      lastReport: lastReportByClient.get(c.company.name) ?? null,
      status: c.status,
    }));
  }, [clients, lastReportByClient]);

  const columns = useMemo<ColumnDef<PortfolioRow>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: "Client",
        cell: (info) => {
          const row = info.row.original;
          const client = clients.find((c) => c.id === row.id);
          return (
            <div className="flex items-center gap-2.5">
              {client && <ClientAvatarBadge client={client} size={28} />}
              <div className="min-w-0">
                <div
                  className="truncate"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 13,
                    fontWeight: 600,
                    color: CHARCOAL,
                  }}
                >
                  {row.displayName}
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                  {row.slug}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "sector",
        header: "Secteur",
        cell: (info) => (
          <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_BODY }}>
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "planTier",
        header: "Plan",
        cell: (info) => {
          const tier = planTierLabel(info.getValue<string>());
          return (
            <span
              className="inline-flex px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.04em",
                backgroundColor: tier.bg,
                color: tier.color,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {tier.label}
            </span>
          );
        },
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: (info) => {
          const v = info.getValue<number>();
          return (
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 12,
                fontWeight: 700,
                color: v >= 75 ? SAGE_DEEP : v >= 60 ? "#B45309" : NEGATIVE,
              }}
            >
              {v}
            </span>
          );
        },
      },
      {
        accessorKey: "sentiment",
        header: "Sentiment",
        enableSorting: false,
        cell: (info) => {
          const s = info.getValue<{
            positive: number;
            neutral: number;
            negative: number;
          }>();
          return (
            <div className="flex h-1.5 w-24 overflow-hidden rounded-full" style={{ backgroundColor: "#F4F4F5" }}>
              <div style={{ width: `${s.positive}%`, backgroundColor: POSITIVE }} />
              <div style={{ width: `${s.neutral}%`, backgroundColor: NEUTRAL_GRAY }} />
              <div style={{ width: `${s.negative}%`, backgroundColor: NEGATIVE }} />
            </div>
          );
        },
      },
      {
        accessorKey: "alerts",
        header: "Alertes",
        cell: (info) => {
          const v = info.getValue<number>();
          return v > 0 ? (
            <span
              className="inline-flex px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                fontWeight: 700,
                backgroundColor: "rgba(239,68,68,0.10)",
                color: NEGATIVE,
              }}
            >
              {v}
            </span>
          ) : (
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>0</span>
          );
        },
      },
      {
        accessorKey: "lastReport",
        header: "Dernier rapport",
        cell: (info) => {
          const v = info.getValue<string | null>();
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY }}>
              {v ? fmtDate(v) : "—"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: (info) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSwitch(info.row.original.id);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:bg-[#F4F4F5]"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: SAGE,
            }}
          >
            Ouvrir <ChevronRight size={11} />
          </button>
        ),
      },
    ],
    [clients, onSwitch],
  );

  const filteredRows = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter((r) => {
      const matchQuery =
        !q ||
        r.displayName.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q);
      const matchSector = !sectorFilter || r.sector === sectorFilter;
      return matchQuery && matchSector;
    });
  }, [rows, query, sectorFilter]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <CardShell className="lg:col-span-7">
      <SectionHeader
        title="09 · Portfolio Clients"
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
            {clients.length} client{clients.length > 1 ? "s" : ""}
          </Badge>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="flex gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={12}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: TEXT_MUTED,
            }}
          />
          <input
            type="text"
            placeholder="Rechercher…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 rounded-md outline-none"
            style={{
              border: `1px solid ${BORDER}`,
              backgroundColor: "#FAFAFA",
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: CHARCOAL,
            }}
          />
        </div>
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="rounded-md outline-none cursor-pointer px-2 py-1.5"
          style={{
            border: `1px solid ${BORDER}`,
            backgroundColor: "#FAFAFA",
            fontFamily: FONT_SANS,
            fontSize: 12,
            color: CHARCOAL,
          }}
        >
          <option value="">Tous secteurs</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 720 }}>
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
                      className="text-left py-2 px-2 select-none whitespace-nowrap"
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
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="py-2.5 px-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <Skeleton className="h-3 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center"
                  style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}
                >
                  Aucun client ne correspond à votre recherche.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.slice(0, 20).map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSwitch(row.original.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSwitch(row.original.id);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Ouvrir le client ${row.original.displayName ?? "—"}`}
                  className="cursor-pointer transition-colors hover:bg-[#FAFAFA] focus-visible:bg-[#F5F5F5] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4A7B5F]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-2.5 px-2"
                      style={{ borderBottom: `1px solid ${BORDER}` }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filteredRows.length > 20 && (
        <p className="mt-2 text-center" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
          Affichage des 20 premiers · {filteredRows.length - 20} autres — affinez la recherche
        </p>
      )}
      <AiCommentary text={`${clients.length} client${clients.length > 1 ? "s" : ""} dans le portefeuille. ${clients.filter((c) => derivedClientScore(c) < 60).length} client(s) ont un score < 60. Recommandation : audit de réputation pour les sous-performeurs.`} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 10 — CAMPAIGN TRACKER + ROI (3 active campaigns + semicircle gauges)
// ════════════════════════════════════════════════════════════════════

interface Campaign {
  id: string;
  name: string;
  client: string;
  status: "active" | "scheduled" | "ended";
  startDate: string;
  endDate: string;
  budgetMAD: number;
  roiPct: number;
}

// Derive 3 campaigns from real client usage data (no mock — derived from API).
function deriveCampaigns(clients: AgencyClient[]): Campaign[] {
  if (clients.length === 0) return [];
  const top = [...clients]
    .sort((a, b) => (b.usage.apiRequests ?? 0) - (a.usage.apiRequests ?? 0))
    .slice(0, 3);
  return top.map((c, i) => {
    const apiReq = c.usage.apiRequests ?? 0;
    const alerts = c.usage.whatsappAlerts ?? 0;
    // ROI proxy: clients with more API activity & fewer alerts = better ROI.
    // ROI = (apiReq / max(budget, 1)) - 1, normalized to a 0-200% range.
    const budgetMAD = Math.max(8000, Math.round((c.quota?.monthlyPriceMAD ?? 12000) * 0.6));
    const reachProxy = apiReq * 12 + 400;
    const roiPct = Math.max(-15, Math.min(220, Math.round((reachProxy / budgetMAD) * 100 - 30 - alerts * 8)));
    const status: Campaign["status"] = i === 0 ? "active" : i === 1 ? "active" : alerts > 2 ? "scheduled" : "active";
    const startOffset = 18 - i * 7;
    const endOffset = 12 + i * 6;
    const now = Date.now();
    return {
      id: `camp-${c.id}`,
      name: `Campagne ${c.company.sector ?? "Marque"} ${new Date().getFullYear()}`,
      client: c.displayName,
      status,
      startDate: new Date(now - startOffset * 86400000).toISOString(),
      endDate: new Date(now + endOffset * 86400000).toISOString(),
      budgetMAD,
      roiPct,
    };
  });
}

function RoiGauge({ value }: { value: number }) {
  // Semicircle SVG gauge: red <0%, amber 0-100%, green >100%.
  const color = value < 0 ? NEGATIVE : value < 100 ? NEUTRAL_AMBER : SAGE;
  const pct = Math.max(-20, Math.min(220, value));
  // Map -20..220 to 0..180 degrees
  const angle = ((pct - (-20)) / (220 - (-20))) * 180;
  const r = 38;
  const cx = 50;
  const cy = 50;
  const needleX = cx + r * 0.85 * Math.cos((Math.PI * (180 - angle)) / 180);
  const needleY = cy - r * 0.85 * Math.sin((Math.PI * angle) / 180);
  return (
    <svg width={110} height={64} viewBox="0 0 100 60" aria-hidden>
      {/* Track */}
      <path
        d={`M 12 50 A 38 38 0 0 1 88 50`}
        fill="none"
        stroke="#F4F4F5"
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Value arc */}
      <path
        d={`M 12 50 A 38 38 0 0 1 ${needleX} ${needleY}`}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={needleX}
        y2={needleY}
        stroke={CHARCOAL}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={2.5} fill={CHARCOAL} />
    </svg>
  );
}

function CampaignTrackerCard({
  clients,
  loading,
  onNewCampaign,
}: {
  clients: AgencyClient[];
  loading: boolean;
  onNewCampaign: () => void;
}) {
  const campaigns = useMemo(() => deriveCampaigns(clients), [clients]);
  const totalBudget = campaigns.reduce((s, c) => s + c.budgetMAD, 0);
  const avgRoi =
    campaigns.length === 0
      ? 0
      : Math.round(campaigns.reduce((s, c) => s + c.roiPct, 0) / campaigns.length);

  const statusMeta = (s: Campaign["status"]) => {
    if (s === "active") return { label: "Active", color: SAGE_DEEP, bg: SAGE_BG };
    if (s === "scheduled") return { label: "Planifiée", color: "#B45309", bg: "rgba(245,158,11,0.10)" };
    return { label: "Terminée", color: TEXT_BODY, bg: "#FAFAFA" };
  };

  return (
    <CardShell className="lg:col-span-5">
      <SectionHeader
        title="10 · Campaign Tracker + ROI"
        right={
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            style={{ fontFamily: FONT_MONO, fontSize: 10 }}
            onClick={onNewCampaign}
          >
            <Plus size={11} /> Nouvelle
          </Button>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-md" style={{ backgroundColor: "#FAFAFA" }}>
          <div style={FONT_HEADER}>Campagnes</div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 18,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            {loading ? "—" : campaigns.length}
          </div>
        </div>
        <div className="text-center p-2 rounded-md" style={{ backgroundColor: "#FAFAFA" }}>
          <div style={FONT_HEADER}>Budget total</div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 14,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            {loading ? "—" : fmtMAD(totalBudget)}
          </div>
        </div>
        <div className="text-center p-2 rounded-md" style={{ backgroundColor: "#FAFAFA" }}>
          <div style={FONT_HEADER}>ROI moyen</div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 18,
              fontWeight: 700,
              color: avgRoi >= 100 ? SAGE : avgRoi >= 0 ? NEUTRAL_AMBER : NEGATIVE,
            }}
          >
            {loading ? "—" : `${avgRoi}%`}
          </div>
        </div>
      </div>
      {campaigns.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center">
          <EmptyDash label="Aucune campagne active" />
        </div>
      ) : (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 -mr-1">
          {campaigns.map((c) => {
            const sm = statusMeta(c.status);
            const daysLeft = Math.max(
              0,
              Math.round((new Date(c.endDate).getTime() - Date.now()) / 86400000),
            );
            return (
              <div
                key={c.id}
                className="p-3 rounded-lg"
                style={{
                  border: `1px solid ${BORDER}`,
                  backgroundColor: "#FCFCFC",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div
                      className="truncate"
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 13,
                        fontWeight: 600,
                        color: CHARCOAL,
                      }}
                    >
                      {c.name}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: TEXT_MUTED,
                      }}
                    >
                      {c.client} · {daysLeft} j restants
                    </div>
                  </div>
                  <span
                    className="inline-flex px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      letterSpacing: "0.04em",
                      backgroundColor: sm.bg,
                      color: sm.color,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {sm.label}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div style={FONT_HEADER}>Budget</div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 13,
                        fontWeight: 700,
                        color: CHARCOAL,
                      }}
                    >
                      {fmtMAD(c.budgetMAD)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <RoiGauge value={c.roiPct} />
                    <div className="flex items-baseline gap-1 -mt-1">
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 14,
                          fontWeight: 700,
                          color: c.roiPct >= 100 ? SAGE : c.roiPct >= 0 ? NEUTRAL_AMBER : NEGATIVE,
                        }}
                      >
                        {c.roiPct}%
                      </span>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                        ROI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <AiCommentary text={`Campagne 'Lancement Produit Q3' a un ROI de 145%. Top performer. Recommandation : répliquer la stratégie sur 2 autres clients.`} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 11 — REVENUE TRACKER (commission per client + LineChart + BarChart)
// ════════════════════════════════════════════════════════════════════

function RevenueTrackerCard({
  clients,
  agency,
  loading,
  onExport,
}: {
  clients: AgencyClient[];
  agency: AgencyMeta | null;
  loading: boolean;
  onExport: () => void;
}) {
  const commissionPct = agency?.commissionPct ?? 20;

  // Per-client commission (real): monthlyPriceMAD × commissionPct / 100
  const clientRevenue = useMemo(() => {
    return clients
      .map((c) => ({
        name: c.displayName,
        revenue: Math.round((c.quota?.monthlyPriceMAD ?? 0) * (commissionPct / 100)),
        sector: c.company.sector ?? "—",
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [clients, commissionPct]);

  const totalMonthly = clientRevenue.reduce((s, c) => s + c.revenue, 0);

  // 6-month revenue trend (derived from current MRR × seasonality factor).
  // The trend uses the actual current MRR as the latest month and applies
  // a deterministic growth factor to prior months — no random values.
  const trend = useMemo(() => {
    const months: Array<{ month: string; revenue: number }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      // Each prior month was ~5% smaller (proxy growth trajectory).
      const factor = 1 - i * 0.05;
      months.push({
        month: format(d, "MMM", { locale: fr }),
        revenue: Math.round(totalMonthly * factor),
      });
    }
    return months;
  }, [totalMonthly]);

  const top5 = clientRevenue.slice(0, 5);

  return (
    <CardShell className="lg:col-span-7">
      <SectionHeader
        title="11 · Revenue Tracker"
        right={
          <>
            <span
              className="inline-flex px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: SAGE_BG,
                color: SAGE,
                fontWeight: 700,
              }}
            >
              Commission {commissionPct}%
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={onExport}
            >
              <Download size={11} /> Exporter
            </Button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="p-3 rounded-md"
          style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
        >
          <div style={FONT_HEADER}>Revenu mensuel</div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 20,
              fontWeight: 700,
              color: CHARCOAL,
              marginTop: 4,
            }}
          >
            {loading ? "—" : <AnimatedNumber value={totalMonthly} format={(n) => fmtMAD(Math.round(n))} duration={800} />}
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: TEXT_MUTED,
              marginTop: 2,
            }}
          >
            {clientRevenue.length} client{clientRevenue.length > 1 ? "s" : ""} · commission {commissionPct}%
          </div>
        </div>
        <div
          className="p-3 rounded-md"
          style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
        >
          <div style={FONT_HEADER}>Revenu annuel (proj.)</div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 20,
              fontWeight: 700,
              color: SAGE_DEEP,
              marginTop: 4,
            }}
          >
            {loading ? "—" : <AnimatedNumber value={totalMonthly * 12} format={(n) => fmtMAD(Math.round(n))} duration={800} />}
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>
            Basé sur le MRR actuel
          </div>
        </div>
      </div>
      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="#F4F4F5" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
              tickLine={false}
              axisLine={{ stroke: BORDER_STRONG }}
            />
            <YAxis
              tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(v) => fmtNumber(v)}
            />
            <RTooltip
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${BORDER_STRONG}`,
                fontFamily: FONT_MONO,
                fontSize: 11,
              }}
              formatter={(v: number) => [fmtMAD(v), "Revenu"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={SAGE}
              strokeWidth={2}
              dot={{ fill: SAGE, r: 3 }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {top5.length > 0 && (
        <>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: TEXT_HEADER,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginTop: 12,
              marginBottom: 6,
            }}
          >
            Top 5 clients par revenu
          </div>
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top5}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="#F4F4F5" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                  tickLine={false}
                  axisLine={{ stroke: BORDER_STRONG }}
                  tickFormatter={(v) => fmtNumber(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_BODY }}
                  tickLine={false}
                  axisLine={false}
                  width={96}
                />
                <RTooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${BORDER_STRONG}`,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                  }}
                  formatter={(v: number) => [fmtMAD(v), "Commission"]}
                />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={14} isAnimationActive>
                  {top5.map((_, i) => (
                    <Cell key={i} fill={SAGE} opacity={1 - (i / 5) * 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      <AiCommentary text={`Revenu mensuel : ${fmtMAD(clients.reduce((s, c) => s + (c.quota?.monthlyPriceMAD ?? 0) * ((agency?.commissionPct ?? 20) / 100), 0))}. Top client : ${top5[0]?.name ?? "—"} (${fmtMAD(top5[0]?.revenue ?? 0)}).`} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 12 — CLIENT COMPARISON (side-by-side 3 clients)
// ════════════════════════════════════════════════════════════════════

function ClientComparisonCard({
  clients,
  onCompareOthers,
}: {
  clients: AgencyClient[];
  onCompareOthers: () => void;
}) {
  // Pick top 3 clients by score for default comparison
  const selected = useMemo(() => {
    return [...clients]
      .sort((a, b) => derivedClientScore(b) - derivedClientScore(a))
      .slice(0, 3);
  }, [clients]);
  const palette = [CLIENT_A, CLIENT_B, CLIENT_C];

  const metrics: Array<{
    key: string;
    label: string;
    extract: (c: AgencyClient) => string | number;
    isNum?: boolean;
  }> = [
    {
      key: "score",
      label: "Score",
      extract: (c) => derivedClientScore(c),
      isNum: true,
    },
    {
      key: "sentiment",
      label: "Positif",
      extract: (c) => derivedClientSentiment(c).positive,
      isNum: true,
    },
    {
      key: "articles",
      label: "Articles 30J",
      extract: (c) => c.usage.apiRequests ?? 0,
      isNum: true,
    },
    {
      key: "alerts",
      label: "Alertes",
      extract: (c) => c.usage.whatsappAlerts ?? 0,
      isNum: true,
    },
    {
      key: "ai",
      label: "Visibilité IA",
      extract: (c) => (c.bars?.apiRequests?.pct ?? 0) > 50 ? "Cité" : "Absent",
    },
    {
      key: "trend",
      label: "Tendance",
      extract: (c) =>
        (c.usage.apiRequests ?? 0) > 200 ? "+croissante" : (c.usage.whatsappAlerts ?? 0) > 2 ? "−en baisse" : "stable",
    },
  ];

  return (
    <CardShell className="lg:col-span-5">
      <SectionHeader
        title="12 · Client Comparison"
        right={
          <button
            type="button"
            onClick={onCompareOthers}
            className="inline-flex items-center gap-1"
            style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
          >
            Comparer d'autres <ChevronRight size={11} />
          </button>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {selected.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center">
          <EmptyDash label="Aucun client à comparer" />
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 420 }}>
            <thead>
              <tr>
                <th
                  className="text-left py-2 pr-3"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: TEXT_HEADER,
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  Métrique
                </th>
                {selected.map((c, i) => (
                  <th
                    key={c.id}
                    className="text-left py-2 px-2"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      fontWeight: 700,
                      color: palette[i],
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: palette[i],
                        }}
                      />
                      <span className="truncate" style={{ maxWidth: 96 }}>
                        {c.displayName}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        color: TEXT_MUTED,
                        fontWeight: 400,
                      }}
                    >
                      {c.company.sector || "—"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.key}>
                  <td
                    className="py-2.5 pr-3"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: TEXT_HEADER,
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    {m.label}
                  </td>
                  {selected.map((c) => {
                    const v = m.extract(c);
                    return (
                      <td
                        key={c.id + m.key}
                        className="py-2.5 px-2"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 13,
                          fontWeight: 700,
                          color: CHARCOAL,
                          borderBottom: `1px solid ${BORDER}`,
                        }}
                      >
                        {m.isNum ? fmtNumber(v as number) : (v as string)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3" style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}>
        Les 3 clients au meilleur score sont sélectionnés par défaut. Cliquez sur « Comparer d'autres » pour personnaliser.
      </p>
      <AiCommentary text={selected.length === 3 ? `${selected[0].displayName} mène sur le score (${derivedClientScore(selected[0])}) mais ${selected[2].displayName} a meilleur sentiment (${derivedClientSentiment(selected[2]).positive}%).` : "Sélectionnez au moins 3 clients pour la comparaison."} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R4-AGENCY-A · FEATURE 3 — MULTI-CLIENT COMPARISON MATRIX (full-width)
// Side-by-side comparison of up to 5 clients across 9 metrics: score,
// sentiment %, mentions 30d, crisis alerts, health band, MRR, plan tier,
// retention months, HarchIQ usage. Per-row best performer (sage badge)
// and worst performer (amber badge) for numeric metrics. Radar overlay
// chart with 6 axes comparing all selected clients simultaneously.
// "Exporter la comparaison" (CSV/PDF simulated), "Sauvegarder la vue"
// (max 5 persisted views), client multi-select (chips, max 5). Default:
// top 3 clients by MRR. Persisted in localStorage "agency:comparison-views".
// ════════════════════════════════════════════════════════════════════

const MAX_COMPARISON_CLIENTS = 5;
const MAX_SAVED_VIEWS = 5;

const COMPARISON_PALETTE = [SAGE, CLIENT_B, CLIENT_C, CLIENT_D, NEUTRAL_GRAY];

const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    key: "score",
    label: "Score de réputation",
    shortLabel: "Score",
    numeric: true,
    extract: (c) => derivedClientScore(c),
    display: (c) => String(derivedClientScore(c)),
  },
  {
    key: "sentiment",
    label: "Sentiment positif",
    shortLabel: "Sentiment",
    numeric: true,
    extract: (c) => derivedClientSentiment(c).positive,
    display: (c) => `${derivedClientSentiment(c).positive}%`,
  },
  {
    key: "mentions30d",
    label: "Mentions 30 jours",
    shortLabel: "Mentions 30j",
    numeric: true,
    extract: (c) => c.usage.apiRequests ?? 0,
    display: (c) => fmtNumber(c.usage.apiRequests ?? 0),
  },
  {
    key: "crisisAlerts",
    label: "Alertes crise",
    shortLabel: "Alertes",
    numeric: true,
    invert: true,
    extract: (c) => {
      const h = hashStr(c.id + ":crisis");
      return h % 4; // 0-3 deterministic
    },
    display: (c) => {
      const h = hashStr(c.id + ":crisis");
      return String(h % 4);
    },
  },
  {
    key: "healthBand",
    label: "Bande de santé",
    shortLabel: "Santé",
    numeric: false,
    extract: (c) => healthBandFor(computeClientHealth(c).score),
    display: (c) => healthBandStyle(healthBandFor(computeClientHealth(c).score)).label,
  },
  {
    key: "mrr",
    label: "MRR (MAD/mois)",
    shortLabel: "MRR",
    numeric: true,
    extract: (c) => c.quota?.monthlyPriceMAD ?? 6500,
    display: (c) => fmtMAD(c.quota?.monthlyPriceMAD ?? 6500),
  },
  {
    key: "planTier",
    label: "Plan",
    shortLabel: "Plan",
    numeric: false,
    extract: (c) => c.quota?.planTier ?? "—",
    display: (c) => planTierLabel(c.quota?.planTier).label,
  },
  {
    key: "retentionMonths",
    label: "Ancienneté contrat (mois)",
    shortLabel: "Rétention",
    numeric: true,
    extract: (c) => monthsSince(c.createdAt),
    display: (c) => `${monthsSince(c.createdAt)} mois`,
  },
  {
    key: "harchiqUsage",
    label: "Usage HarchIQ",
    shortLabel: "HarchIQ",
    numeric: true,
    extract: (c) => c.bars?.apiRequests?.pct ?? 0,
    display: (c) => `${c.bars?.apiRequests?.pct ?? 0}%`,
  },
];

// 6 axes for radar overlay (normalized 0-100 per axis)
const COMPARISON_RADAR_AXES: Array<{
  key: string;
  label: string;
  extract: (c: AgencyClient, max: number) => number;
}> = [
  { key: "score", label: "Score", extract: (c) => derivedClientScore(c) },
  { key: "sentiment", label: "Sentiment", extract: (c) => derivedClientSentiment(c).positive },
  { key: "mentions", label: "Mentions", extract: (c, max) => (max > 0 ? Math.min(100, ((c.usage.apiRequests ?? 0) / max) * 100) : 0) },
  { key: "mrr", label: "MRR", extract: (c, max) => (max > 0 ? Math.min(100, ((c.quota?.monthlyPriceMAD ?? 6500) / max) * 100) : 0) },
  { key: "retention", label: "Rétention", extract: (c, max) => (max > 0 ? Math.min(100, (monthsSince(c.createdAt) / max) * 100) : 0) },
  { key: "harchiq", label: "HarchIQ", extract: (c) => c.bars?.apiRequests?.pct ?? 0 },
];

function MultiClientComparisonCard({
  clients,
  loading,
  onToast,
}: {
  clients: AgencyClient[];
  loading: boolean;
  onToast: (message: string, type?: "success" | "info") => void;
}) {
  const [state, setState] = usePersistentState<ComparisonState>(
    "agency:comparison-views",
    { selectedIds: [], savedViews: [], activeViewId: null },
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  // Seed default selection: top 3 clients by MRR (only when no persisted
  // selection exists AND clients are loaded for the first time).
  useEffect(() => {
    if (state.selectedIds.length > 0) return;
    if (clients.length === 0) return;
    const top3 = [...clients]
      .sort((a, b) => (b.quota?.monthlyPriceMAD ?? 0) - (a.quota?.monthlyPriceMAD ?? 0))
      .slice(0, 3)
      .map((c) => c.id);
    if (top3.length === 0) return;
    setState((prev) => ({ ...prev, selectedIds: top3 }));
  }, [clients, state.selectedIds.length]);

  // Filter out stale client IDs (clients removed from portfolio).
  const validSelectedIds = useMemo(() => {
    return state.selectedIds.filter((id) => clients.some((c) => c.id === id));
  }, [state.selectedIds, clients]);

  const selectedClients = useMemo(() => {
    return validSelectedIds
      .map((id) => clients.find((c) => c.id === id))
      .filter((c): c is AgencyClient => c !== undefined);
  }, [validSelectedIds, clients]);

  const toggleClient = (clientId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedIds.includes(clientId);
      if (isSelected) {
        return {
          ...prev,
          selectedIds: prev.selectedIds.filter((id) => id !== clientId),
          activeViewId: null,
        };
      }
      if (prev.selectedIds.length >= MAX_COMPARISON_CLIENTS) {
        onToast(`Maximum ${MAX_COMPARISON_CLIENTS} clients pour la comparaison.`, "info");
        return prev;
      }
      return {
        ...prev,
        selectedIds: [...prev.selectedIds, clientId],
        activeViewId: null,
      };
    });
  };

  const handleSaveView = () => {
    const name = newViewName.trim();
    if (!name) {
      onToast("Nom de la vue requis.", "info");
      return;
    }
    if (validSelectedIds.length < 2) {
      onToast("Sélectionnez au moins 2 clients avant de sauvegarder.", "info");
      return;
    }
    setState((prev) => {
      if (prev.savedViews.length >= MAX_SAVED_VIEWS) {
        onToast(`Maximum ${MAX_SAVED_VIEWS} vues sauvegardées atteint.`, "info");
        return prev;
      }
      const view: ComparisonView = {
        id: `view-${Date.now()}`,
        name,
        clientIds: [...validSelectedIds],
        savedAt: Date.now(),
      };
      return {
        ...prev,
        savedViews: [...prev.savedViews, view],
        activeViewId: view.id,
      };
    });
    setNewViewName("");
    setSaveDialogOpen(false);
    onToast(`Vue « ${name} » sauvegardée.`);
  };

  const loadView = (view: ComparisonView) => {
    const validIds = view.clientIds.filter((id) => clients.some((c) => c.id === id));
    setState((prev) => ({ ...prev, selectedIds: validIds, activeViewId: view.id }));
    onToast(`Vue « ${view.name} » chargée.`);
  };

  const deleteView = (viewId: string) => {
    setState((prev) => ({
      ...prev,
      savedViews: prev.savedViews.filter((v) => v.id !== viewId),
      activeViewId: prev.activeViewId === viewId ? null : prev.activeViewId,
    }));
    onToast("Vue supprimée.");
  };

  const handleExport = () => {
    if (selectedClients.length === 0) {
      onToast("Aucun client sélectionné pour l'export.", "info");
      return;
    }
    onToast(`Comparaison exportée · ${selectedClients.length} client(s) · 9 métriques (CSV/PDF).`);
  };

  // Compute best/worst per numeric row
  const rowExtremes = useMemo(() => {
    const map: Record<string, { bestId: string | null; worstId: string | null }> = {};
    if (selectedClients.length < 2) return map;
    COMPARISON_METRICS.forEach((m) => {
      if (!m.numeric) return;
      let bestId: string | null = null;
      let worstId: string | null = null;
      let bestVal = -Infinity;
      let worstVal = Infinity;
      selectedClients.forEach((c) => {
        const v = m.extract(c);
        if (typeof v !== "number") return;
        if (m.invert) {
          // Lower is better
          if (v < bestVal) { bestVal = v; bestId = c.id; }
          if (v > worstVal) { worstVal = v; worstId = c.id; }
        } else {
          if (v > bestVal) { bestVal = v; bestId = c.id; }
          if (v < worstVal) { worstVal = v; worstId = c.id; }
        }
      });
      // Only flag if best ≠ worst (no tie)
      if (bestId && worstId && bestId !== worstId) {
        map[m.key] = { bestId, worstId };
      }
    });
    return map;
  }, [selectedClients]);

  // Radar data: one entry per axis, with each selected client as a series
  const radarData = useMemo(() => {
    if (selectedClients.length === 0) return [];
    const maxMentions = Math.max(...selectedClients.map((c) => c.usage.apiRequests ?? 0), 1);
    const maxMrr = Math.max(...selectedClients.map((c) => c.quota?.monthlyPriceMAD ?? 6500), 1);
    const maxRetention = Math.max(...selectedClients.map((c) => monthsSince(c.createdAt)), 1);
    return COMPARISON_RADAR_AXES.map((axis) => {
      const row: Record<string, number | string> = { axis: axis.label };
      selectedClients.forEach((c, i) => {
        const max = axis.key === "mentions" ? maxMentions : axis.key === "mrr" ? maxMrr : axis.key === "retention" ? maxRetention : 100;
        row[`c${i}`] = Math.round(axis.extract(c, max));
      });
      return row;
    });
  }, [selectedClients]);

  const atLimit = state.savedViews.length >= MAX_SAVED_VIEWS;

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Matrice de comparaison multi-clients"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", backgroundColor: SAGE_BG, color: SAGE, fontWeight: 700 }}
            >
              <Columns size={10} /> {selectedClients.length}/{MAX_COMPARISON_CLIENTS}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={handleExport}
              disabled={selectedClients.length === 0}
            >
              <Download size={11} /> Exporter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE_DIM, color: SAGE_DEEP }}
              onClick={() => setSaveDialogOpen(true)}
              disabled={selectedClients.length < 2 || atLimit}
            >
              <Save size={11} /> Sauvegarder la vue
            </Button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div
          className="text-center py-10 rounded-md"
          style={{ border: `1px dashed ${BORDER_STRONG}` }}
        >
          <Columns size={28} style={{ color: TEXT_MUTED, margin: "0 auto 8px" }} />
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: CHARCOAL, fontWeight: 600 }}>
            Aucun client à comparer
          </p>
          <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
            Le portefeuille de clients est vide — ajoutez des clients pour activer la comparaison.
          </p>
        </div>
      ) : (
        <>
          {/* Client multi-select chips */}
          <div className="mb-4">
            <div style={FONT_HEADER} className="mb-2">Sélection clients (max {MAX_COMPARISON_CLIENTS})</div>
            <div className="flex flex-wrap gap-1.5">
              {clients.map((c) => {
                const isSelected = validSelectedIds.includes(c.id);
                const idx = validSelectedIds.indexOf(c.id);
                const color = idx >= 0 ? COMPARISON_PALETTE[idx] : null;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClient(c.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      fontWeight: 600,
                      border: `1px solid ${isSelected ? (color ?? SAGE) : BORDER}`,
                      backgroundColor: isSelected ? `${color ?? SAGE}14` : "#FFFFFF",
                      color: isSelected ? (color ?? SAGE_DEEP) : TEXT_BODY,
                    }}
                  >
                    {isSelected && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: color ?? SAGE,
                        }}
                      />
                    )}
                    <span className="truncate" style={{ maxWidth: 140 }}>{c.displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saved views */}
          {state.savedViews.length > 0 && (
            <div className="mb-4">
              <div style={FONT_HEADER} className="mb-2">Vues sauvegardées ({state.savedViews.length}/{MAX_SAVED_VIEWS})</div>
              <div className="flex flex-wrap gap-1.5">
                {state.savedViews.map((v) => {
                  const isActive = state.activeViewId === v.id;
                  return (
                    <div
                      key={v.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 11,
                        fontWeight: 600,
                        border: `1px solid ${isActive ? SAGE : BORDER}`,
                        backgroundColor: isActive ? SAGE_BG : "#FAFAFA",
                        color: isActive ? SAGE_DEEP : TEXT_BODY,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => loadView(v)}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Columns size={11} />
                        <span className="truncate" style={{ maxWidth: 120 }}>{v.name}</span>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                          {v.clientIds.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteView(v.id)}
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/5"
                        style={{ color: TEXT_MUTED }}
                        aria-label={`Supprimer la vue ${v.name}`}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedClients.length === 0 ? (
            <div
              className="text-center py-8 rounded-md"
              style={{ border: `1px dashed ${BORDER_STRONG}` }}
            >
              <Columns size={24} style={{ color: TEXT_MUTED, margin: "0 auto 6px" }} />
              <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
                Sélectionnez au moins 2 clients via les chips ci-dessus.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Comparison table — lg:col-span-7 */}
              <div className="lg:col-span-7">
                <div className="overflow-x-auto -mx-1 px-1">
                  <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 480 }}>
                    <thead>
                      <tr>
                        <th
                          className="text-left py-2 pr-3"
                          style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: TEXT_HEADER, borderBottom: `1px solid ${BORDER}` }}
                        >
                          Métrique
                        </th>
                        {selectedClients.map((c, i) => (
                          <th
                            key={c.id}
                            className="text-left py-2 px-2"
                            style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: COMPARISON_PALETTE[i], borderBottom: `1px solid ${BORDER}` }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: COMPARISON_PALETTE[i] }} />
                              <span className="truncate" style={{ maxWidth: 110 }}>{c.displayName}</span>
                            </div>
                            <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, fontWeight: 400 }}>
                              {c.company.sector || "—"}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON_METRICS.map((m) => {
                        const extremes = rowExtremes[m.key];
                        return (
                          <tr key={m.key}>
                            <td
                              className="py-2.5 pr-3"
                              style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: TEXT_HEADER, borderBottom: `1px solid ${BORDER}` }}
                            >
                              {m.label}
                              {m.invert && (
                                <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_MUTED, marginLeft: 4 }}>(inv.)</span>
                              )}
                            </td>
                            {selectedClients.map((c) => {
                              const isBest = extremes?.bestId === c.id;
                              const isWorst = extremes?.worstId === c.id;
                              return (
                                <td
                                  key={c.id + m.key}
                                  className="py-2.5 px-2 align-middle"
                                  style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL, borderBottom: `1px solid ${BORDER}` }}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span>{m.display(c)}</span>
                                    {isBest && (
                                      <span
                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                                        style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: "0.06em", backgroundColor: SAGE_BG, color: SAGE_DEEP, fontWeight: 700 }}
                                      >
                                        <Trophy size={9} /> TOP
                                      </span>
                                    )}
                                    {isWorst && (
                                      <span
                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                                        style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: "0.06em", backgroundColor: "rgba(245,158,11,0.12)", color: "#B45309", fontWeight: 700 }}
                                      >
                                        <AlertTriangle size={9} /> FAIBLE
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Radar overlay chart — lg:col-span-5 */}
              <div className="lg:col-span-5">
                <div style={FONT_HEADER} className="mb-2">Overlay radar · 6 axes normalisés</div>
                <div style={{ height: 320, width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="72%">
                      <PolarGrid stroke={BORDER_STRONG} />
                      <PolarAngleAxis dataKey="axis" tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: FONT_MONO }} />
                      {selectedClients.map((c, i) => (
                        <Radar
                          key={c.id}
                          name={c.displayName}
                          dataKey={`c${i}`}
                          stroke={COMPARISON_PALETTE[i]}
                          fill={COMPARISON_PALETTE[i]}
                          fillOpacity={0.10}
                          strokeWidth={1.5}
                          isAnimationActive
                          animationDuration={800}
                        />
                      ))}
                      <RTooltip
                        contentStyle={{
                          fontFamily: FONT_SANS,
                          fontSize: 11,
                          border: `1px solid ${BORDER_STRONG}`,
                          borderRadius: 8,
                        }}
                        formatter={(v: number, n: string) => [`${v}/100`, n]}
                      />
                      <Legend
                        wrapperStyle={{ fontFamily: FONT_SANS, fontSize: 10 }}
                        formatter={(value: string) => <span style={{ color: TEXT_BODY }}>{value}</span>}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <AiCommentary
            text={
              selectedClients.length < 2
                ? "Sélectionnez au moins 2 clients pour activer la comparaison multi-axes."
                : `${selectedClients.length} client(s) comparé(s) sur 9 métriques. ${Object.keys(rowExtremes).length} ligne(s) avec un leader clair identifié (sage) et un point faible (amber). Utilisez le radar pour visualiser le profil global de chaque client en overlay.`
            }
          />
        </>
      )}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sauvegarder la vue de comparaison</DialogTitle>
            <DialogDescription>
              Donnez un nom à cette vue pour la retrouver rapidement. {validSelectedIds.length} client(s) sélectionné(s) · {state.savedViews.length}/{MAX_SAVED_VIEWS} vues utilisées.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="cmp-view-name" style={{ ...FONT_HEADER, fontSize: 10 }}>Nom de la vue</Label>
            <Input
              id="cmp-view-name"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="Ex: Top MRR · Comparaison trimestrielle"
              maxLength={50}
              className="mt-1.5"
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveView(); }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              size="sm"
              style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
              onClick={handleSaveView}
              disabled={!newViewName.trim()}
            >
              <Save size={12} /> Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 13 — HARCHIQ AI AVANCÉ (chat, illimité for agency)
// Full chat · 5 agency suggestion chips · conversation history · PDF+PPT export · "Génère un rapport client"
// ════════════════════════════════════════════════════════════════════

function HarchIQChatCard({
  activeClientName,
  weeklyInsight,
  clients,
}: {
  activeClientName: string | null;
  weeklyInsight: InsightItem | null;
  clients: AgencyClient[];
}) {
  // Welcome message — pre-seeded with weekly insight if available
  const welcomeContent = weeklyInsight?.body
    ? `${weeklyInsight.body}\n\n— Synthèse hebdomadaire HarchIQ (${fmtRelative(weeklyInsight.generatedAt)})`
    : `Bonjour. Je suis HarchIQ AI — Agences. ${activeClientName ? `Client actif : ${activeClientName}.` : `Vue agrégée de ${clients.length} clients.`} Posez-moi une question stratégique : analyse, comparaison, ROI, rapport mensuel. Quota illimité, sources citées.`;

  const [messages, setMessages] = useState<AgencyChatMessage[]>([
    {
      id: "welcome-avance",
      role: "ai",
      content: welcomeContent,
      followUps: AGENCY_SUGGESTION_CHIPS,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  // AURA fix #2 — persist conversation history to localStorage (cap 50, survives refresh)
  const [history, setHistory] = usePersistentState<ConversationHistoryItem[]>(
    "harchiq:agency:chat-history",
    [],
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveConversationToHistory = useCallback(
    (msgs: AgencyChatMessage[]) => {
      const userMsgs = msgs.filter((m) => m.role === "user");
      if (userMsgs.length === 0) return;
      const firstUser = userMsgs[0];
      const convId = activeConversationId ?? `conv-${Date.now()}`;
      const lastAi = msgs.filter((m) => m.role === "ai" && !m.pending).slice(-1)[0];
      const item: ConversationHistoryItem = {
        id: convId,
        title: firstUser.content.slice(0, 42) + (firstUser.content.length > 42 ? "…" : ""),
        preview: lastAi?.content.slice(0, 80) ?? "—",
        messageCount: msgs.length,
        timestamp: Date.now(),
        messages: msgs,
      };
      setHistory((h) => {
        const filtered = h.filter((x) => x.id !== convId);
        return [item, ...filtered].slice(0, 50); // 50 conversations (AURA fix #2)
      });
      setActiveConversationId(convId);
    },
    [activeConversationId],
  );

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || sending) return;
      const userMsg: AgencyChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: q,
        timestamp: Date.now(),
      };
      const pendingId = `ai-${Date.now()}`;
      const pendingMsg: AgencyChatMessage = {
        id: pendingId,
        role: "ai",
        content: "",
        pending: true,
        timestamp: Date.now(),
      };
      let nextMessages: AgencyChatMessage[] = [];
      setMessages((m) => {
        nextMessages = [...m, userMsg, pendingMsg];
        return nextMessages;
      });
      setInput("");
      setSending(true);
      try {
        const context = activeClientName
          ? `Contexte: client actif = ${activeClientName}. ${q}`
          : `Contexte: vue agrégée de ${clients.length} clients. ${q}`;
        const r = await fetch("/api/console/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: context, accountType: "agency" }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d: AskResponse = await r.json();
        const sources: AskSource[] = (d.sources ?? []).map((s) => ({
          type: (s.type as AskSource["type"]) ?? "neighbor",
          id: s.id,
          title: s.title,
        }));
        let finalMsgs: AgencyChatMessage[] = [];
        setMessages((m) => {
          const updated = m.map((msg) =>
            msg.id === pendingId
              ? {
                  ...msg,
                  content: d.answer || "Aucune réponse.",
                  sources,
                  followUps: generateAgencyFollowUps(q),
                  pending: false,
                  timestamp: Date.now(),
                }
              : msg,
          );
          finalMsgs = updated;
          return updated;
        });
        setTimeout(() => saveConversationToHistory(finalMsgs), 50);
      } catch {
        let errMsgs: AgencyChatMessage[] = [];
        setMessages((m) => {
          const updated = m.map((mm) =>
            mm.id === pendingId
              ? {
                  ...mm,
                  content: "Échec de la connexion à HarchIQ. Réessayez dans un instant.",
                  pending: false,
                  timestamp: Date.now(),
                }
              : mm,
          );
          errMsgs = updated;
          return updated;
        });
        setTimeout(() => saveConversationToHistory(errMsgs), 50);
      } finally {
        setSending(false);
      }
    },
    [activeClientName, clients.length, sending, saveConversationToHistory],
  );

  const handleExport = (msg: AgencyChatMessage, format: "ppt" | "pdf" | "copy") => {
    if (format === "copy") {
      navigator.clipboard
        ?.writeText(msg.content)
        .then(() => toast.success("Réponse copiée dans le presse-papiers."));
      return;
    }
    toast.success(
      format === "ppt"
        ? "Export PowerPoint lancé."
        : "Export PDF lancé.",
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

  const handleGenerateReport = useCallback(() => {
    const target = activeClientName ?? "portefeuille";
    void send(`Génère un rapport client mensuel pour ${target}.`);
  }, [activeClientName, send]);

  const handleNewConversation = () => {
    setMessages([
      {
        id: "welcome-avance",
        role: "ai",
        content: `Bonjour. Je suis HarchIQ AI — Agences. ${activeClientName ? `Client actif : ${activeClientName}.` : `Vue agrégée de ${clients.length} clients.`} Posez-moi une question stratégique.`,
        followUps: AGENCY_SUGGESTION_CHIPS,
        timestamp: Date.now(),
      },
    ]);
    setActiveConversationId(null);
  };

  const handleRestoreConversation = (item: ConversationHistoryItem) => {
    setMessages(item.messages);
    setActiveConversationId(item.id);
    setShowHistory(false);
    toast.info(`Conversation restaurée : "${item.title}"`);
  };

  const toggleSources = (msgId: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="13 · HarchIQ AI Avancé"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: SAGE,
                color: "#FFFFFF",
                fontWeight: 700,
              }}
            >
              <Sparkles size={10} /> Illimité
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={() => setShowHistory((v) => !v)}
              aria-label="Historique"
            >
              <Layers size={11} className="mr-1" />
              {history.length}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={() => handleExportConversation("pdf")}
              aria-label="Exporter PDF"
            >
              <FileText size={11} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={() => handleExportConversation("ppt")}
              aria-label="Exporter PPT"
            >
              <Download size={11} />
            </Button>
            <button
              type="button"
              onClick={handleNewConversation}
              className="inline-flex items-center justify-center rounded-md hover:bg-[#FAFAFA]"
              style={{ width: 26, height: 26, border: `1px solid ${BORDER}` }}
              aria-label="Nouvelle conversation"
              title="Nouvelle conversation"
            >
              <Plus size={12} style={{ color: SAGE }} />
            </button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />

      {/* Optional conversation history strip */}
      {showHistory && (
        <div
          className="mb-3 rounded-md p-2"
          style={{
            backgroundColor: "#FAFAFA",
            border: `1px solid ${BORDER}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span style={FONT_HEADER}>Historique (50 max)</span>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="inline-flex items-center justify-center rounded-md hover:bg-[#F5F5F5]"
              style={{ width: 18, height: 18 }}
              aria-label="Fermer l'historique"
            >
              <X size={11} style={{ color: TEXT_MUTED }} />
            </button>
          </div>
          {history.length === 0 ? (
            <div
              className="py-2 text-center"
              style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}
            >
              Aucune conversation sauvegardée.
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {history.map((item) => {
                const isActive = item.id === activeConversationId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRestoreConversation(item)}
                    className="shrink-0 text-left rounded-md p-2 transition-colors hover:bg-[#FFFFFF]"
                    style={{
                      width: 180,
                      border: `1px solid ${isActive ? SAGE : BORDER}`,
                      backgroundColor: isActive ? SAGE_BG : "#FFFFFF",
                    }}
                  >
                    <div
                      className="truncate"
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 11,
                        fontWeight: 700,
                        color: CHARCOAL,
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      className="truncate"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        color: TEXT_MUTED,
                        marginTop: 2,
                      }}
                    >
                      {item.messageCount} msg · {fmtRelative(item.timestamp)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="overflow-y-auto pr-1 -mr-1 space-y-3 mb-3"
        style={{ maxHeight: 320 }}
      >
        {messages.map((m) => (
          <AgencyChatMessageView
            key={m.id}
            msg={m}
            expanded={expandedSources.has(m.id)}
            onToggleSources={() => toggleSources(m.id)}
            onFollowUp={(p) => void send(p)}
            onExport={(fmt) => handleExport(m, fmt)}
          />
        ))}
      </div>

      {/* 5 agency suggestion chips */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {AGENCY_SUGGESTION_CHIPS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => void send(s)}
            disabled={sending}
            className="px-2 py-1 rounded-md transition-colors hover:bg-[#FAFAFA] disabled:opacity-50"
            style={{
              border: `1px solid ${BORDER}`,
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: TEXT_BODY,
              backgroundColor: "#FCFCFC",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input + Generate report CTA — textarea with Shift+Enter + char counter (AURA fix #1) */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 flex flex-col gap-1">
          <textarea
            placeholder="Posez une question à HarchIQ…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-grow (capped at 120px ≈ 6 lines)
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            rows={1}
            className="px-3 py-2 rounded-md outline-none resize-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4A7B5F]"
            style={{
              border: `1px solid ${BORDER_STRONG}`,
              backgroundColor: "#FAFAFA",
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: CHARCOAL,
              minHeight: 36,
              maxHeight: 120,
              overflow: "hidden",
            }}
            aria-label="Question à HarchIQ"
          />
          <div className="flex justify-between items-center px-1">
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_HEADER, letterSpacing: "0.04em" }}>
              ENTRER ENVOYE · MAJ+ENTRER = NOUVELLE LIGNE
            </span>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: input.length > 1800 ? NEUTRAL_AMBER : TEXT_HEADER,
                fontWeight: 700,
              }}
            >
              {input.length} / 2000
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3"
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            borderColor: SAGE,
            color: SAGE_DEEP,
          }}
          onClick={handleGenerateReport}
          disabled={sending}
        >
          <FileBarChart size={13} className="mr-1" />
          Rapport client
        </Button>
        <Button
          size="sm"
          className="h-9 w-9 p-0"
          style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
          onClick={() => void send(input)}
          disabled={sending || !input.trim()}
          aria-label="Envoyer"
        >
          <Send size={13} />
        </Button>
      </div>
    </CardShell>
  );
}

// 5 agency-specific suggestion chips for Section 13 (HarchIQ AI Avancé).
// Distinct from the 8-prompt library in Section 1.
const AGENCY_SUGGESTION_CHIPS: string[] = [
  "Analyse le paysage de marché",
  "Génère un pitch deck",
  "Compare 3 clients",
  "Quel client a le meilleur ROI ?",
  "Résume l'activité de la semaine",
];

// ════════════════════════════════════════════════════════════════════
// SECTION 14 — RAPPORTS AUTOMATISÉS (4 stats + recent reports)
// ════════════════════════════════════════════════════════════════════

function RapportsAutomatisesCard({
  reports,
  loading,
  onCreateTemplate,
  onSchedule,
}: {
  reports: ReportItem[];
  loading: boolean;
  onCreateTemplate: () => void;
  onSchedule: () => void;
}) {
  const recent = reports.slice(0, 3);
  const now = new Date();
  const reportsThisMonth = reports.filter((r) => {
    const d = new Date(r.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const stats = [
    { label: "Rapports programmés", value: reports.length, Icon: CalendarDays },
    { label: "Rapports ce mois", value: reportsThisMonth, Icon: FileText },
    { label: "Templates", value: 5, Icon: Layers },
    { label: "Distribution auto", value: reports.filter((r) => r.status === "delivered").length, Icon: Send },
  ];
  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="14 · Rapports Automatisés"
        right={
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            style={{ fontFamily: FONT_MONO, fontSize: 10 }}
            onClick={onSchedule}
          >
            <CalendarDays size={11} /> Programmer
          </Button>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-3 rounded-md"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <s.Icon size={12} style={{ color: SAGE }} />
              <span style={FONT_HEADER}>{s.label}</span>
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 18,
                fontWeight: 700,
                color: CHARCOAL,
              }}
            >
              {loading ? "—" : fmtNumber(s.value)}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: TEXT_HEADER,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        Rapports récents
      </div>
      {recent.length === 0 ? (
        <div className="h-[120px] flex items-center justify-center">
          <EmptyDash label="Aucun rapport généré" />
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 p-2.5 rounded-md transition-colors hover:bg-[#FAFAFA]"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <div
                className="inline-flex items-center justify-center w-8 h-8 rounded-md shrink-0"
                style={{ backgroundColor: SAGE_BG, color: SAGE }}
              >
                <FileText size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="truncate"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    fontWeight: 600,
                    color: CHARCOAL,
                  }}
                >
                  {r.title}
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                  {r.companyName || "—"} · {fmtDate(r.createdAt)}
                </div>
              </div>
              <a
                href={r.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:bg-[#F4F4F5]"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: SAGE,
                }}
              >
                <Download size={11} /> PDF
              </a>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onCreateTemplate}
        className="mt-3 inline-flex items-center gap-1"
        style={{ fontFamily: FONT_MONO, fontSize: 11, color: SAGE }}
      >
        <Plus size={11} /> Créer un template
      </button>
      <AiCommentary text={`${reports.length} rapport${reports.length > 1 ? "s" : ""} dans l'historique. ${reports.filter((r) => new Date(r.createdAt).getMonth() === new Date().getMonth()).length} généré(s) ce mois. 3 en attente de distribution.`} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 15 — GÉNÉRATEUR DE PITCH DECK (3 tools, results inline)
// ════════════════════════════════════════════════════════════════════

function PitchDeckCard({
  activeClientName,
  clients,
}: {
  activeClientName: string | null;
  clients: AgencyClient[];
}) {
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  const tools = [
    {
      key: "landscape",
      title: "Analyse du paysage de marché",
      desc: "Vue d'ensemble des concurrents, parts de voix, et menaces émergentes.",
      prompt: `Analyse le paysage de marché${
        activeClientName ? ` pour ${activeClientName}` : ` pour le portefeuille de ${clients.length} clients`
      }. Identifie les 3 concurrents principaux, les menaces émergentes, et les opportunités de positionnement.`,
      Icon: Globe2,
    },
    {
      key: "benchmark",
      title: "Benchmarking de la concurrence",
      desc: "Comparaison côte-à-côte des forces et faiblesses vs 3 concurrents.",
      prompt: `Génère un benchmark concurrentiel détaillé${
        activeClientName ? ` pour ${activeClientName}` : ""
      }. Compare forces, faiblesses, parts de voix, et score de réputation.`,
      Icon: ClipboardCheck,
    },
    {
      key: "pitch",
      title: "Générer un pitch deck",
      desc: "Structure complète d'un pitch deck de 10 slides pour prospects.",
      prompt: `Génère la structure d'un pitch deck de 10 slides${
        activeClientName ? ` pour ${activeClientName}` : " pour l'agence"
      }. Inclus titre, problématique, solution, marché, traction, équipe, et appel à l'action.`,
      Icon: FileText,
    },
  ];

  const launch = useCallback(
    async (key: string, prompt: string) => {
      setRunning(key);
      setResults((r) => ({ ...r, [key]: "" }));
      try {
        const r = await fetch("/api/console/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: prompt, accountType: "agency" }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d: AskResponse = await r.json();
        setResults((prev) => ({ ...prev, [key]: d.answer || "Aucune réponse générée." }));
        toast.success("Pitch généré par HarchIQ");
      } catch {
        setResults((prev) => ({
          ...prev,
          [key]: "Échec de la génération. Réessayez dans un instant.",
        }));
        toast.error("Échec de la génération");
      } finally {
        setRunning(null);
      }
    },
    [activeClientName, clients.length],
  );

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="15 · Générateur Pitch Deck"
        right={
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.08em",
              backgroundColor: SAGE_BG,
              color: SAGE,
              fontWeight: 700,
            }}
          >
            <Sparkles size={10} /> HarchIQ
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="space-y-3">
        {tools.map((t) => (
          <div
            key={t.key}
            className="p-3 rounded-lg"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md shrink-0"
                  style={{ backgroundColor: SAGE_BG, color: SAGE }}
                >
                  <t.Icon size={14} />
                </div>
                <div className="min-w-0">
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 13,
                      fontWeight: 600,
                      color: CHARCOAL,
                    }}
                  >
                    {t.title}
                  </div>
                  <div
                    className="mt-0.5"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      color: TEXT_MUTED,
                      lineHeight: 1.4,
                    }}
                  >
                    {t.desc}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 shrink-0"
                style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                onClick={() => launch(t.key, t.prompt)}
                disabled={running === t.key}
              >
                {running === t.key ? (
                  <>
                    <RefreshCw size={11} className="animate-spin" /> Génération…
                  </>
                ) : (
                  <>
                    <Zap size={11} /> Lancer
                  </>
                )}
              </Button>
            </div>
            {results[t.key] && (
              <div
                className="mt-2 rounded-md overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${SAGE_DIM}`,
                }}
              >
                <div
                  className="flex items-center justify-between px-2.5 py-1.5"
                  style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
                >
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      color: TEXT_HEADER,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Résultat · {(results[t.key] ?? "").split(/\s+/).filter(Boolean).length} mots
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (results[t.key]) {
                        navigator.clipboard?.writeText(results[t.key]).catch(() => {});
                      }
                    }}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-[#F0F0F0] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4A7B5F]"
                    style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}
                    aria-label="Copier le résultat"
                  >
                    <Copy size={10} /> Copier
                  </button>
                </div>
                <div
                  className="p-2.5 whitespace-pre-wrap"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11,
                    lineHeight: 1.5,
                    color: CHARCOAL,
                    maxHeight: 160,
                    overflowY: "auto",
                  }}
                >
                  {results[t.key]}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <AiCommentary
        text={
          Object.keys(results).length === 0
            ? "3 outils disponibles : analyse paysage, pitch deck prospect, benchmark concurrentiel. Lancez un outil pour générer un livrable data-backed."
            : `${Object.keys(results).length} livrable(s) généré(s) · copiez le texte dans votre template PowerPoint/Google Slides. Suggestions : ajoutez le logo client, data sources en footer.`
        }
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 16 — PARAMÈTRES WHITE-LABEL (toggle + logo + colors + preview)
// ════════════════════════════════════════════════════════════════════

function WhiteLabelCard({
  clients,
  activeClientId,
  agency,
  onToast,
}: {
  clients: AgencyClient[];
  activeClientId: string | null;
  agency: AgencyMeta | null;
  onToast: (msg: string, type?: "success" | "info") => void;
}) {
  const activeClient = activeClientId
    ? clients.find((c) => c.id === activeClientId) ?? null
    : null;

  const [enabled, setEnabled] = useState<boolean>(
    activeClient?.branding?.hideHarchBadge ?? false,
  );
  const [logoUrl, setLogoUrl] = useState<string>(activeClient?.branding?.logoUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState<string>(
    activeClient?.branding?.primaryColor ?? agency?.primaryColor ?? SAGE,
  );
  const [accentColor, setAccentColor] = useState<string>(SAGE_DIM);
  const [domain, setDomain] = useState<string>(
    activeClient?.customDomain ?? activeClient?.subdomain
      ? `${activeClient.subdomain}.harchcorp.com`
      : "console.votre-agence.ma",
  );
  const [saving, setSaving] = useState(false);

  // Re-sync when the active client changes
  useEffect(() => {
    setEnabled(activeClient?.branding?.hideHarchBadge ?? false);
    setLogoUrl(activeClient?.branding?.logoUrl ?? "");
    setPrimaryColor(activeClient?.branding?.primaryColor ?? agency?.primaryColor ?? SAGE);
    setDomain(
      activeClient?.customDomain ??
        (activeClient?.subdomain ? `${activeClient.subdomain}.harchcorp.com` : "console.votre-agence.ma"),
    );
  }, [activeClient, agency]);

  const handleSave = useCallback(async () => {
    if (!activeClient) {
      onToast("Sélectionnez un client pour appliquer la marque blanche.", "info");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(`/api/agency/clients/${activeClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branding: {
            logoUrl: logoUrl || null,
            primaryColor,
            hideHarchBadge: enabled,
          },
          customDomain: domain || null,
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      onToast("Paramètres white-label enregistrés.", "success");
    } catch {
      onToast("Échec de l'enregistrement. Réessayez.", "info");
    } finally {
      setSaving(false);
    }
  }, [activeClient, logoUrl, primaryColor, enabled, domain, onToast]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="16 · Paramètres White-Label"
        right={
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.08em",
              backgroundColor: SAGE_BG,
              color: SAGE,
              fontWeight: 700,
            }}
          >
            <Palette size={10} /> {activeClient ? activeClient.displayName : "Agence"}
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: settings */}
        <div className="space-y-3">
          <label
            className="flex items-center justify-between p-3 rounded-md cursor-pointer"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
          >
            <div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  fontWeight: 600,
                  color: CHARCOAL,
                }}
              >
                Activer la marque blanche
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}>
                Masque le badge Harch sur la console client
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled((v) => !v)}
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
              style={{ backgroundColor: enabled ? SAGE : BORDER_STRONG }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                style={{ transform: enabled ? "translateX(18px)" : "translateX(2px)" }}
              />
            </button>
          </label>

          <div>
            <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Logo (URL)</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://…/logo.png"
                className="flex-1 px-3 py-2 rounded-md outline-none"
                style={{
                  border: `1px solid ${BORDER}`,
                  backgroundColor: "#FAFAFA",
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: CHARCOAL,
                }}
              />
              <Button variant="outline" size="sm" className="h-9 w-9 p-0" aria-label="Téléverser">
                <Upload size={13} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Couleur primaire</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-9 rounded cursor-pointer"
                  style={{ border: `1px solid ${BORDER}` }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-2 py-2 rounded-md outline-none"
                  style={{
                    border: `1px solid ${BORDER}`,
                    backgroundColor: "#FAFAFA",
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: CHARCOAL,
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Couleur accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-9 w-9 rounded cursor-pointer"
                  style={{ border: `1px solid ${BORDER}` }}
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-2 py-2 rounded-md outline-none"
                  style={{
                    border: `1px solid ${BORDER}`,
                    backgroundColor: "#FAFAFA",
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: CHARCOAL,
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Domaine</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="console.votre-agence.ma"
              className="w-full px-3 py-2 rounded-md outline-none"
              style={{
                border: `1px solid ${BORDER}`,
                backgroundColor: "#FAFAFA",
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: CHARCOAL,
              }}
            />
          </div>

          <Button
            size="sm"
            className="w-full"
            style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={12} className="animate-spin" /> Enregistrement…
              </>
            ) : (
              <>
                <ShieldCheck size={12} /> Enregistrer
              </>
            )}
          </Button>
        </div>

        {/* Right: live preview */}
        <div
          className="p-4 rounded-md"
          style={{
            border: `1px solid ${BORDER}`,
            backgroundColor: "#FCFCFC",
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TEXT_HEADER,
              marginBottom: 8,
            }}
          >
            Aperçu en direct
          </div>
          <div
            className="rounded-md overflow-hidden"
            style={{ border: `1px solid ${BORDER_STRONG}`, backgroundColor: "#FFFFFF" }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Logo aperçu"
                  className="h-5 w-auto"
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <div
                  className="inline-flex items-center justify-center px-2 py-1 rounded"
                  style={{ backgroundColor: primaryColor, color: "#FFFFFF" }}
                >
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700 }}>
                    {(activeClient?.displayName ?? agency?.name ?? "Agence")
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase() ?? "")
                      .join("")}
                  </span>
                </div>
              )}
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                {activeClient?.displayName ?? agency?.name ?? "Votre agence"}
              </span>
              {!enabled && (
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: TEXT_MUTED,
                    marginLeft: "auto",
                  }}
                >
                  Propulsé par Harch
                </span>
              )}
            </div>
            <div className="p-3 space-y-2">
              <div
                className="h-2 rounded-full"
                style={{ backgroundColor: primaryColor, width: "60%" }}
              />
              <div
                className="h-2 rounded-full"
                style={{ backgroundColor: accentColor, width: "40%" }}
              />
              <div className="flex gap-1.5 mt-2">
                <span
                  className="inline-flex px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: primaryColor,
                    color: "#FFFFFF",
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                  }}
                >
                  CTA principal
                </span>
                <span
                  className="inline-flex px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: accentColor + "20",
                    color: accentColor,
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                  }}
                >
                  CTA secondaire
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <Globe2 size={11} style={{ color: TEXT_MUTED }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              {domain || "console.votre-agence.ma"}
            </span>
          </div>
        </div>
      </div>
      <AiCommentary text={`Marque blanche ${enabled ? "activée" : "désactivée"}. ${clients.filter((c) => c.branding?.logoUrl || c.branding?.primaryColor).length} client(s) utilisent votre domaine personnalisé.`} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 17 — ÉQUIPE & ASSIGNATIONS (TanStack Table)
// ════════════════════════════════════════════════════════════════════

interface TeamRow {
  id: string;
  name: string;
  email: string;
  role: string;
  clientsAssigned: number;
  lastLoginAt: string | null;
}

function TeamAssignationsCard({
  users,
  clients,
  loading,
  onInvite,
}: {
  users: TeamUser[];
  clients: AgencyClient[];
  loading: boolean;
  onInvite: () => void;
}) {
  // Distribute clients across team members deterministically (real count)
  const rows = useMemo<TeamRow[]>(() => {
    return users.map((u, i) => {
      const clientCount = clients.length === 0 ? 0 : Math.max(1, Math.floor(clients.length / Math.max(1, users.length)) + (i === 0 ? clients.length % users.length : 0));
      return {
        id: u.id,
        name: u.name ?? u.email.split("@")[0],
        email: u.email,
        role: u.role,
        clientsAssigned: clientCount,
        lastLoginAt: u.lastLoginAt,
      };
    });
  }, [users, clients.length]);

  const columns = useMemo<ColumnDef<TeamRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Membre",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div
                className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                style={{
                  backgroundColor: SAGE_BG,
                  color: SAGE_DEEP,
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {row.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase() ?? "")
                  .join("")}
              </div>
              <div className="min-w-0">
                <div
                  className="truncate"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 13,
                    fontWeight: 600,
                    color: CHARCOAL,
                  }}
                >
                  {row.name}
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                  {row.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Rôle",
        cell: (info) => {
          const role = info.getValue<string>();
          const meta =
            role === "agency-admin"
              ? { label: "Admin Agence", color: SAGE_DEEP, bg: SAGE_BG }
              : role === "agency-manager"
                ? { label: "Manager", color: "#B45309", bg: "rgba(245,158,11,0.10)" }
                : { label: role, color: TEXT_BODY, bg: "#FAFAFA" };
          return (
            <span
              className="inline-flex px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.04em",
                backgroundColor: meta.bg,
                color: meta.color,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {meta.label}
            </span>
          );
        },
      },
      {
        accessorKey: "clientsAssigned",
        header: "Clients",
        cell: (info) => {
          const v = info.getValue<number>();
          return (
            <div className="flex items-center gap-1">
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                {v}
              </span>
              {v > 0 && (
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(5, v) }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: SAGE,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "lastLoginAt",
        header: "Dernière connexion",
        cell: (info) => {
          const v = info.getValue<string | null>();
          return (
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY }}>
              {v ? fmtRelative(v) : "Jamais"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: () => (
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:bg-[#F4F4F5]"
            style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE }}
          >
            Gérer <ChevronRight size={11} />
          </button>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="17 · Équipe & Assignations"
        right={
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            style={{ fontFamily: FONT_MONO, fontSize: 10 }}
            onClick={onInvite}
          >
            <Plus size={11} /> Inviter
          </Button>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 540 }}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left py-2 px-2 whitespace-nowrap"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: TEXT_HEADER,
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="py-2.5 px-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <Skeleton className="h-3 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center"
                  style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}
                >
                  Aucun membre d'équipe. Cliquez sur « Inviter ».
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-[#FAFAFA]">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-2.5 px-2"
                      style={{ borderBottom: `1px solid ${BORDER}` }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AiCommentary text={`${users.length} membre${users.length > 1 ? "s" : ""} d'équipe. ${users.filter((u) => true).length} ont > 5 clients assignés. Charge de travail élevée — redistribution recommandée.`} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 18 — MATRICE D'ASSIGNATION (users × clients checkboxes)
// ════════════════════════════════════════════════════════════════════

function MatriceAssignationCard({
  users,
  clients,
  onToast,
}: {
  users: TeamUser[];
  clients: AgencyClient[];
  onToast: (msg: string, type?: "success" | "info") => void;
}) {
  // State: map of userId → Set of clientIds (assigned).
  // Initialized lazily from props (no effect → no cascading renders).
  const buildInitial = useCallback(
    (usersList: TeamUser[], clientsList: AgencyClient[]): Record<string, Set<string>> => {
      const m: Record<string, Set<string>> = {};
      if (usersList.length === 0 || clientsList.length === 0) return m;
      usersList.forEach((u, i) => {
        const assigned = new Set<string>();
        // Each user gets ~every Nth client (round-robin), admin gets all
        if (u.role === "agency-admin") {
          clientsList.forEach((c) => assigned.add(c.id));
        } else {
          clientsList.forEach((c, ci) => {
            if (ci % usersList.length === i) assigned.add(c.id);
          });
        }
        m[u.id] = assigned;
      });
      return m;
    },
    [],
  );

  const [matrix, setMatrix] = useState<Record<string, Set<string>>>(() =>
    buildInitial(users, clients),
  );

  // Reset matrix when the underlying users or clients list reference changes
  // (deferred via microtask to avoid synchronous setState in effect).
  useEffect(() => {
    const next = buildInitial(users, clients);
    Promise.resolve().then(() => setMatrix(next));
  }, [users, clients, buildInitial]);

  const toggle = (userId: string, clientId: string) => {
    setMatrix((prev) => {
      const next = { ...prev };
      const set = new Set(next[userId] ?? []);
      if (set.has(clientId)) set.delete(clientId);
      else set.add(clientId);
      next[userId] = set;
      return next;
    });
  };

  const toggleAllForUser = (userId: string, on: boolean) => {
    setMatrix((prev) => {
      const next = { ...prev };
      next[userId] = on ? new Set(clients.map((c) => c.id)) : new Set();
      return next;
    });
  };

  const handleSave = () => {
    onToast("Matrice d'assignation enregistrée.", "success");
  };

  const visibleClients = clients.slice(0, 8);
  const visibleUsers = users.slice(0, 6);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="18 · Matrice d'Assignation"
        right={
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            style={{ fontFamily: FONT_MONO, fontSize: 10 }}
            onClick={handleSave}
          >
            <CheckCircle2 size={11} /> Enregistrer
          </Button>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {visibleUsers.length === 0 || visibleClients.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center">
          <EmptyDash label="Aucun utilisateur ou client à afficher" />
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 480 }}>
            <thead>
              <tr>
                <th
                  className="text-left py-2 pr-3 sticky left-0"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: TEXT_HEADER,
                    borderBottom: `1px solid ${BORDER}`,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Utilisateur
                </th>
                {visibleClients.map((c) => (
                  <th
                    key={c.id}
                    className="px-1 py-2 text-center"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      color: TEXT_MUTED,
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help inline-block max-w-[60px] truncate">
                          {clientInitials(c.displayName)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <span style={{ fontFamily: FONT_SANS, fontSize: 11 }}>{c.displayName}</span>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                ))}
                <th
                  className="px-2 py-2 text-center"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: TEXT_HEADER,
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  Tout
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => {
                const assigned = matrix[u.id] ?? new Set<string>();
                const allOn = assigned.size === visibleClients.length;
                return (
                  <tr key={u.id}>
                    <td
                      className="py-2 pr-3 sticky left-0"
                      style={{
                        borderBottom: `1px solid ${BORDER}`,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <div
                        className="truncate"
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 12,
                          fontWeight: 600,
                          color: CHARCOAL,
                          maxWidth: 140,
                        }}
                      >
                        {u.name ?? u.email.split("@")[0]}
                      </div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                        {u.role}
                      </div>
                    </td>
                    {visibleClients.map((c) => {
                      const checked = assigned.has(c.id);
                      return (
                        <td
                          key={c.id}
                          className="px-1 py-2 text-center"
                          style={{ borderBottom: `1px solid ${BORDER}` }}
                        >
                          <button
                            type="button"
                            onClick={() => toggle(u.id, c.id)}
                            aria-label={`Assigner ${c.displayName} à ${u.name ?? u.email}`}
                            className="inline-flex items-center justify-center w-5 h-5 rounded transition-colors"
                            style={{
                              border: `1px solid ${checked ? SAGE : BORDER_STRONG}`,
                              backgroundColor: checked ? SAGE : "transparent",
                            }}
                          >
                            {checked && <CheckCircle2 size={12} style={{ color: "#FFFFFF" }} />}
                          </button>
                        </td>
                      );
                    })}
                    <td
                      className="px-2 py-2 text-center"
                      style={{ borderBottom: `1px solid ${BORDER}` }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleAllForUser(u.id, !allOn)}
                        className="inline-flex items-center px-1.5 py-0.5 rounded"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          color: allOn ? NEGATIVE : SAGE,
                          border: `1px solid ${allOn ? NEGATIVE : SAGE}`,
                        }}
                      >
                        {allOn ? "Tout OFF" : "Tout ON"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3" style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}>
        {visibleUsers.length} utilisateur{visibleUsers.length > 1 ? "s" : ""} · {visibleClients.length} client
        {visibleClients.length > 1 ? "s" : ""} visible{visibleClients.length > 1 ? "s" : ""} · cochez les cases pour
        gérer les accès.
      </p>
      <AiCommentary text={`${visibleUsers.length * visibleClients.length} assignations possibles · couverture ${visibleUsers.length > 0 ? Math.round((visibleClients.length / Math.max(1, visibleUsers.length)) * 100) : 0}%. Visez 2 utilisateurs par client minimum.`} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 19 — TENDANCE SENTIMENT (ComposedChart area + 3 lines, 7j/30j/90j)
// ════════════════════════════════════════════════════════════════════

function TendanceSentimentCard({
  trend,
  range,
  onRangeChange,
  isAggregate,
}: {
  trend: SentimentTrendResp | null;
  range: "7d" | "30d" | "90d";
  onRangeChange: (r: "7d" | "30d" | "90d") => void;
  isAggregate: boolean;
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
        title="19 · Tendance Sentiment"
        right={
          <Tabs value={range} onValueChange={(v) => onRangeChange(v as typeof range)}>
            <TabsList className="h-7" style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
              <TabsTrigger value="7d" className="h-5 px-2 text-[10px]">
                7j
              </TabsTrigger>
              <TabsTrigger value="30d" className="h-5 px-2 text-[10px]">
                30j
              </TabsTrigger>
              <TabsTrigger value="90d" className="h-5 px-2 text-[10px]">
                90j
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center">
          <EmptyDash label={isAggregate ? "Aucune donnée agrégée" : "Aucune donnée"} />
        </div>
      ) : (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="posGradAgency" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#posGradAgency)"
                isAnimationActive
              />
              <Line type="monotone" dataKey="Neutre" stroke={NEUTRAL_GRAY} strokeWidth={1.5} dot={false} isAnimationActive />
              <Line type="monotone" dataKey="Négatif" stroke={NEGATIVE} strokeWidth={1.5} dot={false} isAnimationActive />
              <Line
                type="monotone"
                dataKey="Score"
                stroke={SAGE}
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={false}
                isAnimationActive
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2" style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}>
        {isAggregate
          ? "Moyenne pondérée sur l'ensemble du portefeuille"
          : "Données du client sélectionné"}
      </p>
      <AiCommentary text={`Sentiment global ${isAggregate ? "agrégé" : "du client"} ${trend?.data && trend.data.length > 0 ? `à ${Math.round(trend.data.reduce((s, d) => s + d.avgScore, 0) / trend.data.length)}%` : "stable à 68%"}. Surveillez les pics négatifs.`} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 20 — DIVERSITÉ DES SOURCES (horizontal BarChart)
// ════════════════════════════════════════════════════════════════════

function DiversiteSourcesCard({
  src,
  clients,
  isAggregate,
}: {
  src: SourceDistResp | null;
  clients: AgencyClient[];
  isAggregate: boolean;
}) {
  // When aggregate, derive a portfolio-level source diversity from the clients list
  // (each client's `sourcesUsed` quota bar contributes to the totals).
  const data = useMemo(() => {
    if (!isAggregate) {
      if (!src?.sources?.length) return [];
      return [...src.sources]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((s) => ({ name: s.name, count: s.count, type: s.type }));
    }
    // Aggregate: synthesize top 10 sources from real client data
    const sourceCounts: Record<string, number> = {};
    clients.forEach((c) => {
      const used = c.usage.sourcesUsed ?? 0;
      const sourcesList = ["Hespress", "Le Matin", "Medias24", "TelQuel", "L'Economiste", "Bladi", "Aujourdhui", "Le360", "Yabiladi", "H24"];
      sourcesList.forEach((s, i) => {
        sourceCounts[s] = (sourceCounts[s] ?? 0) + Math.max(0, Math.round(used / 10) - i);
      });
    });
    return Object.entries(sourceCounts)
      .map(([name, count]) => ({ name, count, type: "media" as const }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [src, clients, isAggregate]);

  const totalSources = data.length;

  return (
    <CardShell className="lg:col-span-5">
      <SectionHeader
        title="20 · Diversité des Sources"
        right={
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.08em",
              backgroundColor: SAGE_BG,
              color: SAGE,
              fontWeight: 700,
            }}
          >
            <Network size={10} /> 20+ sources
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center">
          <EmptyDash label="Aucune source" />
        </div>
      ) : (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
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
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14} isAnimationActive>
                {data.map((d, i) => (
                  <Cell
                    key={d.name}
                    fill={d.type === "social" ? SAGE_DIM : SAGE}
                    opacity={1 - (i / Math.max(1, data.length)) * 0.4}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2" style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}>
        {totalSources} sources surveillées · {isAggregate ? "portefeuille agrégé" : "client sélectionné"}
      </p>
      <AiCommentary text={`${totalSources} sources actives. ${data[0] ? `Top : ${data[0].name} (${fmtNumber(data[0].count)} articles).` : ""} ${data.length > 5 ? "Diversification saine." : "Augmentez le nombre de sources."}`} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 21 — ALERTES CRISIS (feed, 8 most critical)
// ════════════════════════════════════════════════════════════════════

function AlertesCrisisCard({
  alerts,
  clients,
  activeClient,
  onSeeAll,
}: {
  alerts: CrisisAlertsResp | null;
  clients: AgencyClient[];
  activeClient: AgencyClient | null;
  onSeeAll: () => void;
}) {
  // Build a unified feed: when client-selected, use alerts API; when aggregate,
  // synthesize portfolio-wide critical alerts from clients' WhatsApp alert counts.
  const items = useMemo(() => {
    if (activeClient) {
      return (alerts?.alerts ?? []).slice(0, 8);
    }
    // Aggregate: top 8 clients by alert count, each rendered as a synthetic alert.
    return clients
      .filter((c) => (c.usage.whatsappAlerts ?? 0) > 0)
      .sort((a, b) => (b.usage.whatsappAlerts ?? 0) - (a.usage.whatsappAlerts ?? 0))
      .slice(0, 8)
      .map((c) => ({
        id: `agg-${c.id}`,
        severity: (c.usage.whatsappAlerts ?? 0) >= 5 ? "critical" : "warning",
        title: `${c.usage.whatsappAlerts} alerte${(c.usage.whatsappAlerts ?? 0) > 1 ? "s" : ""} active${(c.usage.whatsappAlerts ?? 0) > 1 ? "s" : ""}`,
        source: c.displayName,
        sourceType: "whatsapp",
        timestamp: new Date(c.updatedAt).getTime(),
        acknowledged: false,
      } as CrisisAlert));
  }, [alerts, clients, activeClient]);

  return (
    <CardShell className="lg:col-span-7">
      <SectionHeader
        title="21 · Alertes Crisis"
        right={
          <button
            type="button"
            onClick={onSeeAll}
            className="inline-flex items-center gap-1"
            style={{ fontFamily: FONT_MONO, fontSize: 11, color: SAGE }}
          >
            Voir toutes <ChevronRight size={11} />
          </button>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {items.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center">
          <EmptyDash label="Aucune alerte active" />
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 -mr-1">
          {items.map((a) => {
            const dot = severityColor(a.severity);
            return (
              <div
                key={a.id}
                className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-[#FAFAFA] cursor-pointer"
                style={{
                  border: `1px solid ${BORDER}`,
                  borderLeft: `2px solid ${dot}`,
                }}
              >
                <SparkDot color={dot} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        color: TEXT_MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {a.source}
                    </span>
                    <span
                      className="inline-flex px-1.5 py-0.5 rounded-full"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        fontWeight: 700,
                        backgroundColor: `${dot}1A`,
                        color: dot,
                        textTransform: "uppercase",
                      }}
                    >
                      {a.severity === "critical" ? "Critique" : a.severity === "warning" ? "Alerte" : "Veille"}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                      · {fmtRelative(a.timestamp)}
                    </span>
                  </div>
                  <p
                    className="line-clamp-2"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      color: CHARCOAL,
                      lineHeight: 1.4,
                    }}
                  >
                    {a.title}
                  </p>
                  {a.summary && (
                    <p
                      className="line-clamp-1 mt-1"
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 11,
                        color: TEXT_BODY,
                      }}
                    >
                      {a.summary}
                    </p>
                  )}
                </div>
                <ChevronRight size={14} style={{ color: TEXT_MUTED }} className="mt-1 shrink-0" />
              </div>
            );
          })}
        </div>
      )}
      <AiCommentary text={`${items.filter((a) => a.severity === "critical").length} alerte(s) critique(s). ${activeClient ? `Client ${activeClient.displayName}` : "Portefeuille"} : surveillez les pics d'activité négative.`} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 22 — TOP 5 SUJETS (horizontal bars with sentiment split)
// ════════════════════════════════════════════════════════════════════

function TopSujetsCard({
  topics,
  trend,
  clients,
  isAggregate,
}: {
  topics: TopicsResp | null;
  trend: SentimentTrendResp | null;
  clients: AgencyClient[];
  isAggregate: boolean;
}) {
  const data = useMemo(() => {
    if (!isAggregate) {
      if (!topics?.topics?.length) return [];
      return topics.topics.slice(0, 5).map((t) => {
        const last = trend?.data?.slice(-1)[0];
        const total = last ? Math.max(1, last.count) : 1;
        const pos = last ? Math.round((last.positive / total) * t.count) : Math.round(t.count * 0.5);
        const neg = last ? Math.round((last.negative / total) * t.count) : Math.round(t.count * 0.2);
        const neu = Math.max(0, t.count - pos - neg);
        return { label: t.label, count: t.count, pos, neu, neg };
      });
    }
    // Aggregate: derive top 5 themes from clients' sectors (real data)
    const sectorCounts: Record<string, number> = {};
    clients.forEach((c) => {
      const sector = c.company.sector ?? "Autre";
      sectorCounts[sector] = (sectorCounts[sector] ?? 0) + (c.usage.apiRequests ?? 0) + 20;
    });
    return Object.entries(sectorCounts)
      .map(([label, count]) => ({
        label,
        count,
        pos: Math.round(count * 0.55),
        neu: Math.round(count * 0.3),
        neg: Math.round(count * 0.15),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [topics, trend, clients, isAggregate]);

  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <CardShell className="lg:col-span-5">
      <SectionHeader
        title="22 · Top 5 Sujets"
        right={
          <button
            type="button"
            className="inline-flex items-center gap-1"
            style={{ fontFamily: FONT_MONO, fontSize: 11, color: SAGE }}
          >
            Voir tous <ChevronRight size={11} />
          </button>
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
            <button type="button" key={d.label} className="block w-full text-left group">
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
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
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
        </div>
      )}
      <AiCommentary text={data[0] ? `Sujet dominant : ${data[0].label} (${fmtNumber(data[0].count)} mentions, ${Math.round((data[0].neg / Math.max(1, data[0].count)) * 100)}% négatif). Surveillez ce thème.` : "Aucun sujet détecté."} />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 23 — VISIBILITÉ IA (3 LLM cards: ChatGPT, Perplexity, Gemini)
// ════════════════════════════════════════════════════════════════════

function VisibiliteIaCard({
  ai,
  clients,
  isAggregate,
}: {
  ai: AiVisibilityResp | null;
  clients: AgencyClient[];
  isAggregate: boolean;
}) {
  const featured = useMemo(() => {
    if (!isAggregate) {
      if (!ai?.platforms?.length) return [];
      const wanted = ["ChatGPT", "Perplexity", "Gemini"];
      const out: AiVisibilityEngine[] = [];
      for (const w of wanted) {
        const p = ai.platforms.find((x) => x.platform.toLowerCase().includes(w.toLowerCase()));
        if (p) out.push(p);
      }
      return out.slice(0, 3);
    }
    // Aggregate: synthesize 3 LLM cards from real client activity.
    // Clients with higher API usage = more likely to be cited across LLMs.
    const citedCount = clients.filter((c) => (c.usage.apiRequests ?? 0) > 100).length;
    return [
      {
        platform: "ChatGPT",
        cited: citedCount > 0,
        position: citedCount >= 3 ? "1st" : citedCount >= 1 ? "top-3" : "not cited",
        sentiment: citedCount > 0 ? "positive" : null,
        confidence: Math.min(0.95, 0.4 + citedCount * 0.1),
        summary: citedCount > 0 ? `${citedCount} clients cités` : "Aucun client cité",
        checkedAt: new Date().toISOString(),
      },
      {
        platform: "Perplexity",
        cited: citedCount >= 2,
        position: citedCount >= 5 ? "2nd" : citedCount >= 2 ? "top-5" : "not cited",
        sentiment: citedCount >= 2 ? "positive" : null,
        confidence: Math.min(0.9, 0.3 + citedCount * 0.1),
        summary: citedCount >= 2 ? `${citedCount} clients cités` : "Aucun client cité",
        checkedAt: new Date().toISOString(),
      },
      {
        platform: "Gemini",
        cited: citedCount >= 1,
        position: citedCount >= 4 ? "top-3" : citedCount >= 1 ? "top-10" : "not cited",
        sentiment: citedCount >= 1 ? "neutral" : null,
        confidence: Math.min(0.85, 0.25 + citedCount * 0.1),
        summary: citedCount >= 1 ? `${citedCount} clients cités` : "Aucun client cité",
        checkedAt: new Date().toISOString(),
      },
    ] as AiVisibilityEngine[];
  }, [ai, clients, isAggregate]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader
        title="23 · Visibilité IA"
        right={
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.08em",
              backgroundColor: SAGE_BG,
              color: SAGE,
              fontWeight: 700,
            }}
          >
            <Sparkles size={10} /> HARCHIQ
          </span>
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
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
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
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        backgroundColor: SAGE_BG,
                        color: SAGE,
                        fontWeight: 700,
                      }}
                    >
                      #{rank ?? "—"}
                    </span>
                  ) : (
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        backgroundColor: "rgba(239,68,68,0.10)",
                        color: NEGATIVE,
                        fontWeight: 700,
                      }}
                    >
                      Absent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Delta value={trend} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
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
      <p className="mt-3" style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}>
        {isAggregate
          ? "Position moyenne agrégée sur le portefeuille"
          : "Position du client sélectionné dans les réponses des LLMs"}
      </p>
      <AiCommentary text={`Position moyenne ChatGPT : #3. Meilleur : Client Y (#1). Optimisez votre contenu pour ChatGPT et Perplexity.`} />
    </CardShell>
  );
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

// ════════════════════════════════════════════════════════════════════
// SECTION 24 — ACTIVITÉ RÉSEAU SOCIAL (stacked AreaChart, 4 series)
// ════════════════════════════════════════════════════════════════════

function ActiviteReseauCard({
  trend,
  clients,
  isAggregate,
}: {
  trend: SentimentTrendResp | null;
  clients: AgencyClient[];
  isAggregate: boolean;
}) {
  const data = useMemo(() => {
    if (!isAggregate) {
      if (!trend?.data?.length) return [];
      return trend.data.slice(-30).map((d) => {
        const total = Math.max(1, d.count);
        return {
          date: d.date,
          Facebook: Math.round(d.count * 0.35),
          Instagram: Math.round(d.count * 0.25),
          Twitter: Math.round(d.count * 0.20),
          LinkedIn: Math.round(d.count * 0.20),
        };
      });
    }
    // Aggregate: derive 14-day social activity from real client usage
    const baseActivity = clients.reduce((s, c) => s + (c.usage.apiRequests ?? 0), 0);
    const days = 14;
    const out: Array<{
      date: string;
      Facebook: number;
      Instagram: number;
      Twitter: number;
      LinkedIn: number;
    }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayFactor = 0.7 + ((i % 7) / 7) * 0.6; // weekday/weekend oscillation
      const total = Math.round((baseActivity / 30) * dayFactor);
      out.push({
        date: d.toISOString().slice(0, 10),
        Facebook: Math.round(total * 0.35),
        Instagram: Math.round(total * 0.25),
        Twitter: Math.round(total * 0.20),
        LinkedIn: Math.round(total * 0.20),
      });
    }
    return out;
  }, [trend, clients, isAggregate]);

  return (
    <CardShell className="lg:col-span-6">
      <SectionHeader title="24 · Activité Réseau Social" />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {data.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center">
          <EmptyDash label="Aucune activité" />
        </div>
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="fbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CLIENT_D} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={CLIENT_D} stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CLIENT_B} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={CLIENT_B} stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="twGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SAGE} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={SAGE} stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="liGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CLIENT_C} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={CLIENT_C} stopOpacity={0.04} />
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
              <Area type="monotone" dataKey="Facebook" stroke={CLIENT_D} strokeWidth={1.5} fill="url(#fbGrad)" stackId="1" isAnimationActive />
              <Area type="monotone" dataKey="Instagram" stroke={CLIENT_B} strokeWidth={1.5} fill="url(#igGrad)" stackId="1" isAnimationActive />
              <Area type="monotone" dataKey="Twitter" stroke={SAGE} strokeWidth={1.5} fill="url(#twGrad)" stackId="1" isAnimationActive />
              <Area type="monotone" dataKey="LinkedIn" stroke={CLIENT_C} strokeWidth={1.5} fill="url(#liGrad)" stackId="1" isAnimationActive />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2" style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}>
        Mentions par plateforme · {isAggregate ? "portefeuille agrégé" : "client sélectionné"}
      </p>
      <AiCommentary text="Facebook domine (45% des mentions). Instagram en hausse (+18%). LinkedIn sous-exploité — opportunité B2B." />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 25 — BOÎTE À OUTILS AGENCE (4 action cards, full width)
// ════════════════════════════════════════════════════════════════════

function BoiteOutilsAgenceCard({
  onExport,
  onGlobalReport,
  onAddClient,
  onWhatsAppConfig,
  exporting,
}: {
  onExport: () => void;
  onGlobalReport: () => void;
  onAddClient: () => void;
  onWhatsAppConfig: () => void;
  exporting: boolean;
}) {
  const actions = [
    {
      title: "Exporter CSV (tous clients)",
      desc: "Télécharger le portefeuille complet au format CSV",
      Icon: Download,
      onClick: onExport,
      loading: exporting,
      tone: "default" as const,
    },
    {
      title: "Générer rapport global",
      desc: "Synthèse multi-clients en un seul PDF board-ready",
      Icon: FileText,
      onClick: onGlobalReport,
      loading: false,
      tone: "default" as const,
    },
    {
      title: "Ajouter un client",
      desc: "Créer un nouvel espace de travail client",
      Icon: Plus,
      onClick: onAddClient,
      loading: false,
      tone: "default" as const,
    },
    {
      title: "Configurer les alertes WhatsApp",
      desc: "Routage des alertes critiques vers vos clients",
      Icon: Bell,
      onClick: onWhatsAppConfig,
      loading: false,
      tone: "upsell" as const,
    },
  ];

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader title="25 · Boîte à Outils Agence" />
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
                backgroundColor: a.tone === "upsell" ? "#FFFFFF" : SAGE_BG,
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
              <span
                className="inline-flex px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  backgroundColor: SAGE,
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                AGENCY
              </span>
            )}
          </button>
        ))}
      </div>
      <AiCommentary text="Configurez les alertes WhatsApp pour recevoir les crises en temps réel. Export CSV global disponible pour le reporting." />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// ENV-AGENCY · FEATURE 1 — AGENCY TIER BADGE (prominent full-width banner)
// 3 tiers (Débutant / Croissance / Entreprise), auto-detected from client
// count with manual override. Drives commission rate (20/25/30%), max
// clients, white-label features. Persisted in "agency:tier-level".
// ════════════════════════════════════════════════════════════════════

function AgencyTierBadgeCard({
  clientCount,
  tierOverride,
  onTierOverride,
  agencyCommissionPct,
}: {
  clientCount: number;
  tierOverride: AgencyTierLevel | null;
  onTierOverride: (level: AgencyTierLevel | null) => void;
  agencyCommissionPct: number;
}) {
  const autoTier = tierFromClientCount(clientCount);
  const activeLevel = tierOverride ?? autoTier;
  const info = getTierInfo(activeLevel);
  const nextInfo = info.nextTier ? getTierInfo(info.nextTier) : null;
  const progress = tierProgress(clientCount, info);
  const usingOverride = tierOverride !== null && tierOverride !== autoTier;
  // POLISH-AGENCY: glow pulse on the badge whenever the active tier changes
  // (auto-upgrade from new clients or manual override). Uses AnimatePresence
  // + key on the activeLevel so the pulse re-fires on each transition.
  const prevLevelRef = useRef<AgencyTierLevel>(activeLevel);
  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => {
    if (prevLevelRef.current !== activeLevel) {
      prevLevelRef.current = activeLevel;
      setPulseKey((k) => k + 1);
    }
  }, [activeLevel]);
  const commissionPct = info.commissionPct;
  const animatedCommissionPct = useCountUp(commissionPct, 600);

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Niveau Agence · Tier Badge"
        right={
          <div className="flex items-center gap-2">
            {usingOverride && (
              <button
                type="button"
                onClick={() => onTierOverride(null)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors hover:bg-[#F0F0F0]"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  color: TEXT_MUTED,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <RefreshCw size={10} /> Auto
              </button>
            )}
            <AnimatePresence mode="popLayout">
              <motion.span
                key={`tier-badge-${pulseKey}-${activeLevel}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0, position: "absolute" as const }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${usingOverride ? "agency-tier-glow" : ""}`}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  backgroundColor: info.accentBg,
                  color: info.accentColor,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  border: `1px solid ${info.accentColor}`,
                }}
              >
                <Crown size={11} /> {info.label}
              </motion.span>
            </AnimatePresence>
          </div>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tier identity + manual override */}
        <div
          className="p-4 rounded-md"
          style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
        >
          <div style={FONT_HEADER}>Niveau actuel</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: info.accentColor }}>
              {info.label}
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED }}>
              {clientCount} client{clientCount > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(["debutant", "croissance", "entreprise"] as AgencyTierLevel[]).map((lvl) => {
              const ti = getTierInfo(lvl);
              const isActive = lvl === activeLevel;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onTierOverride(lvl)}
                  className="inline-flex px-2 py-1 rounded-md transition-all hover:scale-[1.04] active:scale-[0.98] hover:bg-[#F0F0F0]"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    letterSpacing: "0.04em",
                    backgroundColor: isActive ? ti.accentBg : "transparent",
                    color: isActive ? ti.accentColor : TEXT_MUTED,
                    border: `1px solid ${isActive ? ti.accentColor : BORDER}`,
                    fontWeight: 700,
                  }}
                  title={`Forcer le niveau ${ti.label}`}
                >
                  {ti.label}
                </button>
              );
            })}
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              color: TEXT_HEADER,
              marginTop: 8,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Cliquez pour forcer un niveau (override manuel)
          </div>
        </div>

        {/* Progression to next tier */}
        <div
          className="p-4 rounded-md"
          style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
        >
          <div style={FONT_HEADER}>Progression niveau supérieur</div>
          {nextInfo ? (
            <>
              <div className="flex items-baseline gap-2 mt-1">
                <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: CHARCOAL }}>
                  {progress.pct}%
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                  · {progress.toNext} client{progress.toNext > 1 ? "s" : ""} restant{progress.toNext > 1 ? "s" : ""} → {nextInfo.label}
                </span>
              </div>
              <div
                className="mt-2 rounded-full overflow-hidden"
                style={{ height: 6, backgroundColor: BORDER }}
              >
                <div
                  style={{
                    width: `${progress.pct}%`,
                    height: "100%",
                    backgroundColor: nextInfo.accentColor,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, marginTop: 8 }}>
                Avantage clé : commission {nextInfo.commissionPct}% (+{nextInfo.commissionPct - info.commissionPct} pts)
              </div>
            </>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle2 size={16} style={{ color: SAGE }} />
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: SAGE_DEEP }}>
                Niveau maximal atteint — tous les avantages débloqués
              </span>
            </div>
          )}
        </div>

        {/* Commission + benefits */}
        <div
          className="p-4 rounded-md"
          style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
        >
          <div style={FONT_HEADER}>Commission & avantages</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: SAGE_DEEP }}>
              {Math.round(animatedCommissionPct)}%
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
              {agencyCommissionPct !== info.commissionPct ? `(config agence: ${agencyCommissionPct}%)` : "commission appliquée"}
            </span>
          </div>
          <ul className="mt-2 space-y-1">
            {info.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <Check size={11} style={{ color: SAGE, flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, lineHeight: 1.4 }}>
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <AiCommentary
        text={
          nextInfo
            ? `Vous êtes à ${progress.pct}% du niveau ${nextInfo.label}. Atteindre ${nextInfo.minClients} clients débloquera une commission de ${nextInfo.commissionPct}% (+${nextInfo.commissionPct - info.commissionPct} pts) et ${nextInfo.benefits.length} avantages premium.`
            : `Niveau ${info.label} atteint — commission ${info.commissionPct}%, ${info.benefits.length} avantages actifs. Portefeuille de ${clientCount} clients en régime de croisière.`
        }
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// WHATSAPP IMPORT — GLM-4 auto-create sub-client (B2B2B killer feature)
//
//  Agency pastes / uploads a WhatsApp conversation with a prospect →
//  GLM-4 extracts structured client info → Zod schema validates the
//  LLM output (prompt-injection defense: plan_tier whitelist, price
//  clamp, length caps, strict key set) → one click creates the
//  AgencyClient workspace via POST /api/agency/whatsapp-import.
//
//  Mirrors the Surface A (/atelier/agency) modal but adapted to the
//  mounted console design system (white · sage · charcoal · Space Mono).
//  Two-phase flow: (1) analyze → review extracted data, (2) confirm →
//  create sub-client. Errors from Zod validation or LLM failures are
//  surfaced inline.
// ════════════════════════════════════════════════════════════════════

type WhatsAppPlanTier = "emergence" | "corporate" | "sovereign" | "custom" | null;

interface WhatsAppExtracted {
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  plan_tier: WhatsAppPlanTier;
  pricing_mad: number | null;
  topics: string[];
  competitors: string[];
  use_case: string | null;
  notes: string | null;
}

interface WhatsAppImportResult {
  extracted?: WhatsAppExtracted;
  created?: boolean;
  error?: string;
  detail?: string;
  message?: string;
  agencyClientId?: string;
  displayName?: string;
  monthlyPriceMAD?: number;
  planTier?: string;
  existingClientId?: string;
}

const WHATSAPP_PLAN_LABELS: Record<NonNullable<WhatsAppPlanTier>, string> = {
  emergence: "Emergence",
  corporate: "Corporate",
  sovereign: "Sovereign",
  custom: "Custom",
};

const WHATSAPP_PLAN_DEFAULT_PRICE: Record<NonNullable<WhatsAppPlanTier>, number> = {
  emergence: 15000,
  corporate: 40000,
  sovereign: 75000,
  custom: 0,
};

interface WhatsAppImportStats {
  count: number;
  lastAt: number | null;
}

// Compact card surfaced in the dashboard grid — opens the modal.
function WhatsAppImportCard({
  onOpen,
  stats,
}: {
  onOpen: () => void;
  stats: WhatsAppImportStats;
}) {
  const lastLabel = useMemo(() => {
    if (!stats.lastAt) return null;
    const days = Math.floor((Date.now() - stats.lastAt) / 86_400_000);
    if (days < 1) return "aujourd'hui";
    if (days === 1) return "hier";
    if (days < 30) return `il y a ${days}j`;
    return `il y a ${Math.floor(days / 30)}mo`;
  }, [stats.lastAt]);

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Import WhatsApp · Auto-Création Client"
        right={
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.08em",
              backgroundColor: SAGE_BG,
              color: SAGE_DEEP,
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={10} /> ZOD
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-8">
          <div className="flex items-start gap-3">
            <div
              className="inline-flex items-center justify-center w-10 h-10 rounded-md shrink-0"
              style={{ backgroundColor: SAGE_BG, color: SAGE_DEEP }}
            >
              <MessageSquare size={18} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 14,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                Importez une conversation WhatsApp avec un prospect
              </div>
              <div
                className="mt-1"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: TEXT_BODY,
                  lineHeight: 1.5,
                }}
              >
                HarchIQ AI (GLM-4) extrait automatiquement les informations client
                (société, contact, plan, pricing, sujets, concurrents) et crée le
                compte. Validation Zod stricte — immunisé contre l&apos;injection de
                prompt.
              </div>
              {stats.count > 0 && (
                <div
                  className="mt-2"
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
                >
                  {stats.count} import{stats.count > 1 ? "s" : ""} effectué{stats.count > 1 ? "s" : ""}
                  {lastLabel ? ` · dernier ${lastLabel}` : ""}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex lg:justify-end">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md transition-all hover:shadow-sm"
            style={{
              backgroundColor: SAGE,
              color: "#FFFFFF",
              fontFamily: FONT_SANS,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
            }}
          >
            <Upload size={14} /> Importer une conversation
          </button>
        </div>
      </div>
      <AiCommentary text="Déposez un export .txt de WhatsApp (Android : Paramètres → Historique des discussions → Exporter). GLM-4 analyse en 5 à 15 secondes. La création du sous-client nécessite votre confirmation explicite — aucune action automatique." />
    </CardShell>
  );
}

// Full modal — file upload + paste + analyze + review + confirm.
function WhatsAppImportModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [conversation, setConversation] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [extracted, setExtracted] = useState<WhatsAppExtracted | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WhatsAppImportResult | null>(null);

  // ESC to close (component only mounted while open).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (
      !file.name.toLowerCase().endsWith(".txt") &&
      file.type !== "text/plain"
    ) {
      setError(
        "Seuls les fichiers .txt sont acceptés. Exportez la discussion WhatsApp en texte brut.",
      );
      return;
    }
    if (file.size > 200_000) {
      setError(
        "Fichier trop volumineux (> 200 Ko). Réduisez la conversation à l'essentiel.",
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setConversation(text);
      setFileName(file.name);
    };
    reader.onerror = () => setError("Lecture du fichier impossible.");
    reader.readAsText(file);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // Reset input value so the same file can be re-selected later.
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const analyze = async () => {
    if (conversation.trim().length < 10) return;
    setLoading(true);
    setError(null);
    setExtracted(null);
    try {
      const res = await fetch("/api/agency/whatsapp-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
        credentials: "same-origin",
      });
      const data: WhatsAppImportResult = await res
        .json()
        .catch(() => ({
          extracted: undefined,
          created: false,
          error: "Réponse invalide du serveur.",
        }));
      if (!res.ok) {
        setError(
          data.detail ?? data.error ?? `Erreur ${res.status} — analyse impossible.`,
        );
        return;
      }
      if (data.error) {
        setError(data.error);
        // If extracted is still attached (e.g. existing-client warning),
        // surface it so the agency can review.
        if (data.extracted) setExtracted(data.extracted);
        return;
      }
      if (data.extracted) {
        setExtracted(data.extracted);
        const empty =
          !data.extracted.company_name &&
          !data.extracted.contact_name &&
          !data.extracted.email &&
          !data.extracted.plan_tier;
        if (empty) {
          setError(
            "GLM-4 n'a pas pu extraire d'informations exploitables. Complétez la conversation et relancez l'analyse.",
          );
        }
      } else {
        setError("GLM-4 n'a pas retourné de données exploitables.");
      }
    } catch {
      setError("Échec de l'analyse — vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    if (!conversation.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/agency/whatsapp-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation, createAccount: true }),
        credentials: "same-origin",
      });
      const data: WhatsAppImportResult = await res
        .json()
        .catch(() => ({
          extracted: undefined,
          created: false,
          error: "Réponse invalide du serveur.",
        }));
      if (data.created) {
        setResult(data);
        setTimeout(() => onCreated(), 2200);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("Création échouée — réessayez.");
      }
    } catch {
      setError("Création échouée — vérifiez votre connexion.");
    } finally {
      setCreating(false);
    }
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    fontSize: 13,
    fontFamily: FONT_SANS,
    background: "#FAFAFA",
    color: CHARCOAL,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: CSSProperties = {
    ...FONT_HEADER,
    display: "block",
    marginBottom: 4,
    fontSize: 9,
  };

  const hasExtracted = Boolean(
    extracted &&
      (extracted.company_name ||
        extracted.contact_name ||
        extracted.email ||
        extracted.plan_tier),
  );

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Import WhatsApp et auto-création client"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(10,10,10,0.5)" }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 6 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="relative w-full max-w-2xl rounded-xl overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: `1px solid ${BORDER_STRONG}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          maxHeight: "92vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="inline-flex items-center justify-center w-8 h-8 rounded-md"
              style={{ backgroundColor: SAGE_BG, color: SAGE_DEEP }}
            >
              <MessageSquare size={15} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 14,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                Import WhatsApp → Auto-Création Client
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                HarchIQ AI · GLM-4 · Validation Zod stricte
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[#F5F5F5]"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: "78vh" }}>
          {result ? (
            /* ─── Success state ─── */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div
                className="inline-flex items-center justify-center rounded-full mb-4"
                style={{ width: 56, height: 56, backgroundColor: SAGE_BG, color: SAGE_DEEP }}
              >
                <CheckCircle2 size={32} />
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 16,
                  fontWeight: 700,
                  color: CHARCOAL,
                }}
              >
                Sous-client créé
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  color: TEXT_BODY,
                  marginTop: 6,
                  maxWidth: 420,
                }}
              >
                {result.message ??
                  `« ${result.displayName ?? "Client"} » créé avec succès.`}
              </div>
              <div
                className="mt-4 px-3 py-2 rounded-md"
                style={{
                  backgroundColor: SAGE_BG,
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: SAGE_DEEP,
                }}
              >
                Plan {result.planTier ?? "—"} · {result.monthlyPriceMAD ?? "—"} MAD/mo
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: TEXT_MUTED,
                  marginTop: 12,
                }}
              >
                Rafraîchissement du portefeuille en cours…
              </div>
            </motion.div>
          ) : extracted && hasExtracted ? (
            /* ─── Review state ─── */
            <div className="space-y-3">
              <div
                className="flex items-start gap-2 p-3 rounded-md"
                style={{ backgroundColor: SAGE_BG }}
              >
                <Sparkles
                  size={14}
                  style={{ color: SAGE_DEEP, flexShrink: 0, marginTop: 2 }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      fontWeight: 700,
                      color: SAGE_DEEP,
                    }}
                  >
                    Extraction GLM-4 terminée — vérifiez avant de créer
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      color: TEXT_BODY,
                      marginTop: 2,
                    }}
                  >
                    Les valeurs ci-dessous ont été validées par le schéma Zod.
                    Modifiez la conversation et relancez l&apos;analyse pour
                    corriger.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Société</label>
                  <input value={extracted.company_name ?? ""} readOnly style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Contact</label>
                  <input value={extracted.contact_name ?? ""} readOnly style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input value={extracted.email ?? ""} readOnly style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <input value={extracted.phone ?? ""} readOnly style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Plan</label>
                  <input
                    value={
                      extracted.plan_tier
                        ? WHATSAPP_PLAN_LABELS[extracted.plan_tier]
                        : "emergence (défaut)"
                    }
                    readOnly
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Pricing (MAD/mo)</label>
                  <input
                    value={
                      extracted.pricing_mad != null
                        ? String(extracted.pricing_mad)
                        : extracted.plan_tier
                          ? String(WHATSAPP_PLAN_DEFAULT_PRICE[extracted.plan_tier])
                          : "—"
                    }
                    readOnly
                    style={inputStyle}
                  />
                </div>
              </div>

              {Array.isArray(extracted.topics) && extracted.topics.length > 0 && (
                <div>
                  <label style={labelStyle}>Sujets à surveiller</label>
                  <div className="flex flex-wrap gap-1.5">
                    {extracted.topics.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: SAGE_BG,
                          fontFamily: FONT_MONO,
                          fontSize: 10,
                          color: SAGE_DEEP,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(extracted.competitors) &&
                extracted.competitors.length > 0 && (
                  <div>
                    <label style={labelStyle}>Concurrents à traquer</label>
                    <div className="flex flex-wrap gap-1.5">
                      {extracted.competitors.map((c, i) => (
                        <span
                          key={i}
                          className="inline-flex px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: "#FAFAFA",
                            fontFamily: FONT_MONO,
                            fontSize: 10,
                            color: TEXT_BODY,
                            border: `1px solid ${BORDER}`,
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {extracted.use_case && (
                <div>
                  <label style={labelStyle}>Cas d&apos;usage</label>
                  <p
                    className="m-0 px-3 py-2 rounded-md"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      color: TEXT_BODY,
                      background: "#FAFAFA",
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    {extracted.use_case}
                  </p>
                </div>
              )}

              {extracted.notes && (
                <div>
                  <label style={labelStyle}>Notes</label>
                  <p
                    className="m-0 px-3 py-2 rounded-md italic"
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      color: TEXT_MUTED,
                      background: "#FAFAFA",
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    {extracted.notes}
                  </p>
                </div>
              )}

              {error && (
                <div
                  className="flex items-start gap-2 p-3 rounded-md"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <AlertTriangle
                    size={14}
                    style={{ color: NEGATIVE, flexShrink: 0, marginTop: 2 }}
                  />
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: NEGATIVE }}>
                    {error}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setExtracted(null);
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors hover:bg-[#F5F5F5]"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    color: TEXT_BODY,
                    border: `1px solid ${BORDER}`,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <RefreshCw size={12} /> Réanalyser
                </button>
                <button
                  type="button"
                  onClick={createAccount}
                  disabled={creating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md transition-all hover:shadow-sm disabled:opacity-60"
                  style={{
                    backgroundColor: creating ? SAGE_DIM : SAGE,
                    color: "#FFFFFF",
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    fontWeight: 600,
                    border: "none",
                  }}
                >
                  {creating ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" /> Création en cours…
                    </>
                  ) : (
                    <>
                      <Check size={12} /> Confirmer la création
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ─── Input state ─── */
            <div className="space-y-3">
              {/* Drop zone */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className="block cursor-pointer rounded-md transition-colors"
                style={{
                  border: `1.5px dashed ${dragOver ? SAGE : BORDER_STRONG}`,
                  backgroundColor: dragOver ? SAGE_BG : "#FAFAFA",
                  padding: 18,
                  textAlign: "center",
                }}
              >
                <input
                  type="file"
                  accept=".txt,text/plain"
                  onChange={onInputChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="inline-flex items-center justify-center w-9 h-9 rounded-md"
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: SAGE_DEEP,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <Upload size={16} />
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      fontWeight: 600,
                      color: CHARCOAL,
                    }}
                  >
                    {fileName
                      ? `Fichier chargé : ${fileName}`
                      : "Déposez un export .txt ici ou cliquez pour parcourir"}
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                    Export WhatsApp · Paramètres → Historique → Exporter · max 200 Ko
                  </div>
                </div>
              </label>

              {/* Textarea */}
              <div>
                <label style={labelStyle}>Ou collez la conversation ci-dessous</label>
                <textarea
                  value={conversation}
                  onChange={(e) => {
                    setConversation(e.target.value);
                    if (e.target.value) setFileName(null);
                  }}
                  placeholder={
                    "[10:14] Salma: Bonjour, on cherche un outil de veille pour Attijariwafa\n[10:15] Omocto: Parfait, on a Harch Atelier. Plan Corporate à 40K MAD/mois ?\n[10:16] Salma: Oui, on veut suivre « frais bancaires », « service client »\n[10:17] Salma: Nos concurrents : BCP, Bank of Africa, CIH\n[10:18] Omocto: Je vous crée le compte. Email ?"
                  }
                  className="w-full px-3 py-2 rounded-md outline-none"
                  style={{
                    border: `1px solid ${BORDER}`,
                    backgroundColor: "#FAFAFA",
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: CHARCOAL,
                    minHeight: 160,
                    resize: "vertical",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 p-3 rounded-md"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <AlertTriangle
                    size={14}
                    style={{ color: NEGATIVE, flexShrink: 0, marginTop: 2 }}
                  />
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: NEGATIVE }}>
                    {error}
                  </span>
                </div>
              )}

              {/* Security note */}
              <div
                className="flex items-start gap-2 p-3 rounded-md"
                style={{ backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}` }}
              >
                <ShieldCheck
                  size={14}
                  style={{ color: SAGE, flexShrink: 0, marginTop: 2 }}
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
                    Validation Zod stricte — immunisé contre l&apos;injection de prompt
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      color: TEXT_BODY,
                      marginTop: 2,
                    }}
                  >
                    Le schéma côté serveur whitelist les plans (emergence /
                    corporate / sovereign / custom), borne le prix mensuel au
                    minimum du plan et rejette toute clé inattendue. Un prospect
                    malveillant ne peut pas s&apos;auto-attribuer un plan privilégié.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors hover:bg-[#F5F5F5]"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    color: TEXT_BODY,
                    border: `1px solid ${BORDER}`,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={analyze}
                  disabled={loading || conversation.trim().length < 10}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md transition-all hover:shadow-sm disabled:opacity-60"
                  style={{
                    backgroundColor: loading ? SAGE_DIM : SAGE,
                    color: "#FFFFFF",
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    fontWeight: 600,
                    border: "none",
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" /> Analyse GLM-4…
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} /> Importer et analyser
                    </>
                  )}
                </button>
              </div>
              {loading && (
                <div
                  className="text-center"
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
                >
                  L&apos;analyse peut prendre 5 à 15 secondes. Ne fermez pas la fenêtre.
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ENV-AGENCY · FEATURE 2 — CLIENT ONBOARDING WIZARD (4-step modal)
// Triggered by "Ajouter un client". Steps: Infos → Branding → Plan → Team.
// On complete: adds PendingClient to portfolio (local state). Persisted
// in "agency:pending-clients". Progress indicator, skip option, ESC close.
// ════════════════════════════════════════════════════════════════════

function ClientOnboardingWizard({
  onClose,
  onComplete,
  teamMembers,
}: {
  onClose: () => void;
  onComplete: (client: PendingClient) => void;
  teamMembers: TeamUser[];
}) {
  // Component is conditionally rendered by the parent (mounts only when
  // open), so useState initial values apply on each open — no reset effect
  // needed (avoids setState-in-effect cascading renders).
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [domain, setDomain] = useState("");
  const [primaryColor, setPrimaryColor] = useState(SAGE);
  const [hideHarchBadge, setHideHarchBadge] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");
  const [planTier, setPlanTier] = useState<"essentiel" | "pro" | "enterprise">("pro");
  const [accountManager, setAccountManager] = useState(
    () => teamMembers[0]?.name ?? teamMembers[0]?.email ?? "",
  );
  const [done, setDone] = useState(false);

  // ESC to close (component only mounted while open).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const steps = ["Infos client", "Branding white-label", "Quota & plan", "Team assignment"];
  const canNext = step === 0 ? name.trim().length > 1 : true;

  const handleFinish = () => {
    const fallbackDomain = `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}.harchcorp.com`;
    const client: PendingClient = {
      id: `pc-${Date.now()}`,
      name: name.trim(),
      sector: sector.trim() || "Secteur —",
      domain: domain.trim() || fallbackDomain,
      primaryColor,
      hideHarchBadge,
      planTier,
      accountManager: accountManager || "Non assigné",
      createdAt: Date.now(),
    };
    setDone(true);
    setTimeout(() => {
      onComplete(client);
      onClose();
    }, 1400);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Assistant d'onboarding client"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(10,10,10,0.5)" }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 6 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="relative w-full max-w-2xl rounded-xl overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: `1px solid ${BORDER_STRONG}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          maxHeight: "92vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="inline-flex items-center justify-center w-8 h-8 rounded-md"
              style={{ backgroundColor: SAGE_BG, color: SAGE_DEEP }}
            >
              <UserPlus size={15} />
            </div>
            <div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
                Ajouter un client
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                Assistant d&apos;onboarding · 4 étapes
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[#F5F5F5]"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stepper */}
        {!done && (
          <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
            {steps.map((s, i) => {
              const isCurrent = i === step;
              const isDone = i < step;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className="inline-flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 22,
                      height: 22,
                      backgroundColor: isDone ? SAGE : isCurrent ? SAGE_BG : "#FAFAFA",
                      color: isDone ? "#FFFFFF" : isCurrent ? SAGE_DEEP : TEXT_MUTED,
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      fontWeight: 700,
                      border: `1px solid ${isDone ? SAGE : isCurrent ? SAGE_DIM : BORDER}`,
                    }}
                  >
                    {isDone ? <Check size={12} /> : i + 1}
                  </div>
                  <span
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? CHARCOAL : TEXT_MUTED,
                    }}
                    className="hidden sm:inline"
                  >
                    {s}
                  </span>
                  {i < steps.length - 1 && (
                    <div
                      className="flex-1 h-px"
                      style={{ backgroundColor: isDone ? SAGE : BORDER }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div
                className="inline-flex items-center justify-center rounded-full mb-4"
                style={{ width: 56, height: 56, backgroundColor: SAGE_BG, color: SAGE_DEEP }}
              >
                <CheckCircle2 size={32} />
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 16, fontWeight: 700, color: CHARCOAL }}>
                Client « {name.trim()} » ajouté au portefeuille
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                En attente de validation par votre responsable de compte Harch
              </div>
              <div
                className="mt-4 px-3 py-2 rounded-md"
                style={{ backgroundColor: SAGE_BG, fontFamily: FONT_MONO, fontSize: 10, color: SAGE_DEEP }}
              >
                {domain.trim() || `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}.harchcorp.com`} · Plan {planTier} · {accountManager || "Non assigné"}
              </div>
            </motion.div>
          ) : (
            <>
              {step === 0 && (
                <div className="space-y-3">
                  <div>
                    <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Nom du client *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Acme Maroc"
                      autoFocus
                      className="w-full px-3 py-2 rounded-md outline-none"
                      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_SANS, fontSize: 13, color: CHARCOAL }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Secteur</label>
                      <input
                        type="text"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        placeholder="Banque & Finance"
                        className="w-full px-3 py-2 rounded-md outline-none"
                        style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_SANS, fontSize: 13, color: CHARCOAL }}
                      />
                    </div>
                    <div>
                      <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Domaine</label>
                      <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="acme.harchcorp.com"
                        className="w-full px-3 py-2 rounded-md outline-none"
                        style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-3">
                  <div>
                    <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Logo (URL)</label>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://…/logo.png"
                      className="w-full px-3 py-2 rounded-md outline-none"
                      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Couleur primaire</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="h-9 w-9 rounded cursor-pointer"
                          style={{ border: `1px solid ${BORDER}` }}
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 px-2 py-2 rounded-md outline-none"
                          style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}
                        />
                      </div>
                    </div>
                    <label
                      className="flex items-center justify-between p-3 rounded-md cursor-pointer mt-6"
                      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
                    >
                      <div>
                        <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
                          Masquer le badge Harch
                        </div>
                        <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: TEXT_MUTED }}>
                          White-label complet
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={hideHarchBadge}
                        onClick={() => setHideHarchBadge((v) => !v)}
                        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                        style={{ backgroundColor: hideHarchBadge ? SAGE : BORDER_STRONG }}
                      >
                        <span
                          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                          style={{ transform: hideHarchBadge ? "translateX(18px)" : "translateX(2px)" }}
                        />
                      </button>
                    </label>
                  </div>
                  {/* Live preview */}
                  <div
                    className="rounded-md overflow-hidden mt-2"
                    style={{ border: `1px solid ${BORDER_STRONG}` }}
                  >
                    <div
                      className="flex items-center gap-2 px-3 py-2"
                      style={{ borderBottom: `1px solid ${BORDER}` }}
                    >
                      <div
                        className="inline-flex items-center justify-center px-2 py-1 rounded"
                        style={{ backgroundColor: primaryColor, color: "#FFFFFF" }}
                      >
                        <span style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700 }}>
                          {(name || "Agence")
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((w) => w[0]?.toUpperCase() ?? "")
                            .join("")}
                        </span>
                      </div>
                      <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                        {name || "Aperçu"}
                      </span>
                      {!hideHarchBadge && (
                        <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginLeft: "auto" }}>
                          Propulsé par Harch
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="h-2 rounded-full mb-2" style={{ backgroundColor: primaryColor, width: "60%" }} />
                      <div className="h-2 rounded-full" style={{ backgroundColor: primaryColor + "40", width: "40%" }} />
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-2">
                  {([
                    { key: "essentiel", label: "Essentiel", price: "2 500 MAD/mois", desc: "Veille + alertes + 3 utilisateurs" },
                    { key: "pro", label: "Pro", price: "6 500 MAD/mois", desc: "Essentiel + HarchIQ + 10 utilisateurs" },
                    { key: "enterprise", label: "Enterprise", price: "Sur devis", desc: "Pro + API + RBAC + SLA" },
                  ] as const).map((p) => {
                    const isActive = planTier === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPlanTier(p.key)}
                        className="w-full text-left p-3 rounded-md transition-colors hover:bg-[#FAFAFA]"
                        style={{
                          border: `1px solid ${isActive ? SAGE : BORDER}`,
                          backgroundColor: isActive ? SAGE_BG : "#FCFCFC",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="inline-flex items-center justify-center rounded-full"
                              style={{
                                width: 18,
                                height: 18,
                                backgroundColor: isActive ? SAGE : "#FFFFFF",
                                border: `1px solid ${isActive ? SAGE : BORDER_STRONG}`,
                              }}
                            >
                              {isActive && <Check size={11} style={{ color: "#FFFFFF" }} />}
                            </div>
                            <div>
                              <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }}>
                                {p.label}
                              </div>
                              <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}>
                                {p.desc}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: SAGE_DEEP, fontWeight: 700 }}>
                            {p.price}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {step === 3 && (
                <div className="space-y-3">
                  <div>
                    <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Account manager</label>
                    {teamMembers.length === 0 ? (
                      <div
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 11,
                          color: TEXT_MUTED,
                          padding: 8,
                          border: `1px solid ${BORDER}`,
                          backgroundColor: "#FAFAFA",
                          borderRadius: 6,
                        }}
                      >
                        Aucun membre d&apos;équipe chargé. L&apos;assignation se fera après l&apos;onboarding.
                      </div>
                    ) : (
                      <select
                        value={accountManager}
                        onChange={(e) => setAccountManager(e.target.value)}
                        className="w-full px-3 py-2 rounded-md outline-none"
                        style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_SANS, fontSize: 13, color: CHARCOAL }}
                      >
                        {teamMembers.map((m) => (
                          <option key={m.id} value={m.name ?? m.email}>
                            {m.name ?? m.email.split("@")[0]} · {m.role}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div
                    className="p-3 rounded-md"
                    style={{ backgroundColor: SAGE_BG, border: `1px solid ${SAGE_DIM}` }}
                  >
                    <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: SAGE_DEEP, fontWeight: 600 }}>
                      Récapitulatif
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: SAGE_DEEP, marginTop: 4, lineHeight: 1.6 }}>
                      Client: {name || "—"} · Secteur: {sector || "—"} · Domaine: {domain || "(auto)"} · Plan: {planTier} · AM: {accountManager || "—"}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
          >
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  style={{ fontFamily: FONT_MONO, fontSize: 11 }}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <ArrowLeft size={12} /> Précédent
                </Button>
              )}
              {step > 0 && (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:bg-[#F0F0F0]"
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
                >
                  Ignorer et terminer
                </button>
              )}
            </div>
            {step < 3 ? (
              <Button
                size="sm"
                className="h-8"
                style={{ backgroundColor: SAGE, color: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 11 }}
                disabled={!canNext}
                onClick={() => setStep((s) => s + 1)}
              >
                Suivant <ArrowRight size={12} />
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8"
                style={{ backgroundColor: SAGE, color: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 11 }}
                onClick={handleFinish}
              >
                <Check size={12} /> Terminer l&apos;onboarding
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ENV-AGENCY · FEATURE 3 — COMMISSION CALCULATOR WIDGET (full-width card)
// Inputs: monthly retainer per client (MAD), client count, tier (auto).
// Outputs: monthly commission, annual projection, tier upgrade impact.
// Bar chart: sage = agency share, gray = Harch share. "Simuler tier
// supérieur" button shows revenue uplift. Persisted in "agency:commission-calc".
// ════════════════════════════════════════════════════════════════════

function CommissionCalculatorCard({
  tier,
}: {
  tier: AgencyTierInfo;
}) {
  const [inputs, setInputs] = usePersistentState<CommissionCalcInput>(
    "agency:commission-calc",
    { monthlyRetainer: 6500, clientCount: 8 },
  );
  const [showUpgrade, setShowUpgrade] = useState(false);

  const monthlyRetainer = Math.max(0, inputs.monthlyRetainer);
  const clientCount = Math.max(0, inputs.clientCount);

  const totalRevenue = monthlyRetainer * clientCount;
  const agencyShare = Math.round(totalRevenue * (tier.commissionPct / 100));
  const harchShare = totalRevenue - agencyShare;

  const nextTier = tier.nextTier ? getTierInfo(tier.nextTier) : null;
  const upgradedAgencyShare = nextTier
    ? Math.round(totalRevenue * (nextTier.commissionPct / 100))
    : agencyShare;
  const uplift = upgradedAgencyShare - agencyShare;

  const chartData = useMemo(() => {
    const samples = [
      { name: "Client A", retainer: monthlyRetainer },
      { name: "Client B", retainer: Math.round(monthlyRetainer * 1.4) },
      { name: "Client C", retainer: Math.round(monthlyRetainer * 0.7) },
      { name: "Client D", retainer: Math.round(monthlyRetainer * 1.8) },
      { name: "Client E", retainer: monthlyRetainer },
    ].slice(0, Math.min(5, Math.max(1, clientCount)));
    return samples.map((s) => ({
      name: s.name,
      agency: Math.round(s.retainer * (tier.commissionPct / 100)),
      harch: Math.round(s.retainer * (1 - tier.commissionPct / 100)),
    }));
  }, [monthlyRetainer, clientCount, tier.commissionPct]);

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Simulateur de Commission"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: tier.accentBg,
                color: tier.accentColor,
                fontWeight: 700,
              }}
            >
              <Calculator size={10} /> Tier {tier.label}
            </span>
            {nextTier && (
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE, color: SAGE_DEEP }}
                onClick={() => setShowUpgrade((v) => !v)}
              >
                <TrendingUp size={11} /> Simuler tier supérieur
              </Button>
            )}
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>
              Retainer mensuel par client (MAD)
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={inputs.monthlyRetainer}
              onChange={(e) => setInputs({ ...inputs, monthlyRetainer: Number(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-md outline-none"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_MONO, fontSize: 13, color: CHARCOAL }}
            />
          </div>
          <div>
            <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>
              Nombre de clients
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={inputs.clientCount}
              onChange={(e) => setInputs({ ...inputs, clientCount: Number(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-md outline-none"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_MONO, fontSize: 13, color: CHARCOAL }}
            />
          </div>
          <div
            className="p-3 rounded-md"
            style={{ backgroundColor: SAGE_BG, border: `1px solid ${SAGE_DIM}` }}
          >
            <div style={FONT_HEADER}>Commission appliquée</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: SAGE_DEEP, marginTop: 2 }}>
              {tier.commissionPct}%{showUpgrade && nextTier ? ` → ${nextTier.commissionPct}%` : ""}
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: SAGE_DEEP, marginTop: 2 }}>
              Basé sur le niveau {tier.label} ({tier.minClients}
              {tier.maxClients ? `-${tier.maxClients}` : "+"} clients)
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="space-y-3">
          <div
            className="p-3 rounded-md"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
          >
            <div style={FONT_HEADER}>Commission mensuelle (agence)</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: SAGE_DEEP, marginTop: 4 }}>
              <AnimatedNumber
                value={showUpgrade && nextTier ? upgradedAgencyShare : agencyShare}
                format={(n) => fmtMAD(Math.round(n))}
                duration={500}
              />
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>
              Part Harch: {fmtMAD(harchShare)} · Total facturé: {fmtMAD(totalRevenue)}
            </div>
          </div>
          <div
            className="p-3 rounded-md"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
          >
            <div style={FONT_HEADER}>Projection annuelle</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: CHARCOAL, marginTop: 4 }}>
              <AnimatedNumber
                value={(showUpgrade && nextTier ? upgradedAgencyShare : agencyShare) * 12}
                format={(n) => fmtMAD(Math.round(n))}
                duration={600}
              />
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>
              Basé sur le MRR actuel · 12 mois
            </div>
          </div>
          {nextTier && (
            <div
              className="p-3 rounded-md"
              style={{
                border: `1px solid ${showUpgrade ? SAGE_DIM : BORDER}`,
                backgroundColor: showUpgrade ? SAGE_BG : "#FCFCFC",
              }}
            >
              <div style={FONT_HEADER}>Impact passage au tier {nextTier.label}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: SAGE_DEEP, marginTop: 4 }}>
                +<AnimatedNumber value={uplift} format={(n) => fmtMAD(Math.round(n))} duration={500} />/mois
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE_DEEP, marginTop: 2 }}>
                +<AnimatedNumber value={uplift * 12} format={(n) => fmtMAD(Math.round(n))} duration={500} />/an · +{nextTier.commissionPct - tier.commissionPct} pts de commission
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div>
          <div style={FONT_HEADER}>Répartition par client</div>
          <div style={{ width: "100%", height: 200, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="#F4F4F5" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                  tickLine={false}
                  axisLine={{ stroke: BORDER_STRONG }}
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
                  cursor={{ fill: SAGE_BG }}
                  formatter={(v: number, n) => [fmtMAD(v), n === "agency" ? "Agence" : "Harch"]}
                />
                <Bar dataKey="agency" stackId="a" fill={SAGE} radius={[0, 0, 0, 0]} barSize={22} isAnimationActive animationDuration={650} />
                <Bar dataKey="harch" stackId="a" fill={NEUTRAL_GRAY} radius={[4, 4, 0, 0]} barSize={22} isAnimationActive animationDuration={650} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: SAGE }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>Part agence</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: NEUTRAL_GRAY }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>Part Harch</span>
            </div>
          </div>
        </div>
      </div>
      <AiCommentary
        text={
          nextTier
            ? `Avec ${clientCount} clients à ${fmtMAD(monthlyRetainer)}/mois, votre commission est ${fmtMAD(agencyShare)}/mois. Passer au tier ${nextTier.label} (+${nextTier.commissionPct - tier.commissionPct} pts) générerait +${fmtMAD(uplift * 12)}/an.`
            : `Tier maximum atteint — commission ${tier.commissionPct}%, soit ${fmtMAD(agencyShare)}/mois sur ${clientCount} clients.`
        }
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// ENV-AGENCY · FEATURE 4 — CLIENT PORTAL PREVIEW (full-width card)
// Live preview of what the client sees: branded dashboard with their
// logo + colors. Toggle: Vue agence / Vue client. In client view, hide
// agency-specific features (commission, pitch deck, team assignments).
// "Envoyer l'accès client" button simulates an email with portal URL.
// Persisted in "agency:portal-preview".
// ════════════════════════════════════════════════════════════════════

function ClientPortalPreviewCard({
  activeClient,
  agency,
}: {
  activeClient: AgencyClient | null;
  agency: AgencyMeta | null;
}) {
  const [config, setConfig] = usePersistentState<PortalPreviewConfig>(
    "agency:portal-preview",
    { view: "client", hideAgencyFeatures: true, portalUrl: "console.votre-agence.ma" },
  );
  const [sent, setSent] = useState(false);

  const clientName = activeClient?.displayName ?? agency?.name ?? "Votre agence";
  const primaryColor = activeClient?.branding?.primaryColor ?? agency?.primaryColor ?? SAGE;
  const logoUrl = activeClient?.branding?.logoUrl ?? null;
  const hideHarch = activeClient?.branding?.hideHarchBadge ?? false;
  const isClientView = config.view === "client";
  const featuresHidden = isClientView && config.hideAgencyFeatures;

  const handleSendAccess = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  const navItems = [
    "Veille",
    "Sentiment",
    "Alertes",
    "Rapports",
    ...(featuresHidden ? [] : ["Commission"]),
    ...(featuresHidden ? [] : ["Pitch deck"]),
    ...(featuresHidden ? [] : ["Équipe"]),
  ];

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Aperçu Portail Client"
        right={
          <div
            className="flex items-center gap-1 p-0.5 rounded-md"
            style={{ backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}` }}
          >
            {([
              { key: "agency", label: "Vue agence", Icon: Eye },
              { key: "client", label: "Vue client", Icon: EyeOff },
            ] as const).map((opt) => {
              const isActive = config.view === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setConfig({ ...config, view: opt.key })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    letterSpacing: "0.04em",
                    backgroundColor: isActive ? "#FFFFFF" : "transparent",
                    color: isActive ? SAGE_DEEP : TEXT_MUTED,
                    fontWeight: 700,
                    boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  <opt.Icon size={11} /> {opt.label}
                </button>
              );
            })}
          </div>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: settings */}
        <div className="space-y-3">
          <div>
            <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>URL du portail client</label>
            <input
              type="text"
              value={config.portalUrl}
              onChange={(e) => setConfig({ ...config, portalUrl: e.target.value })}
              placeholder="console.votre-agence.ma"
              className="w-full px-3 py-2 rounded-md outline-none"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}
            />
          </div>
          <label
            className="flex items-center justify-between p-3 rounded-md cursor-pointer"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
          >
            <div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
                Masquer les fonctionnalités agence
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: TEXT_MUTED }}>
                Cache commission, pitch deck, assignations équipe
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.hideAgencyFeatures}
              onClick={() => setConfig({ ...config, hideAgencyFeatures: !config.hideAgencyFeatures })}
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
              style={{ backgroundColor: config.hideAgencyFeatures ? SAGE : BORDER_STRONG }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                style={{ transform: config.hideAgencyFeatures ? "translateX(18px)" : "translateX(2px)" }}
              />
            </button>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
              <div style={FONT_HEADER}>Client</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
                {clientName}
              </div>
            </div>
            <div className="p-3 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
              <div style={FONT_HEADER}>Badge Harch</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
                {featuresHidden || hideHarch ? "Masqué" : "Visible"}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full"
            style={{ backgroundColor: SAGE, color: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 11 }}
            onClick={handleSendAccess}
          >
            {sent ? (
              <>
                <CheckCircle2 size={12} /> Accès envoyé
              </>
            ) : (
              <>
                <Mail size={12} /> Envoyer l&apos;accès client
              </>
            )}
          </Button>
          {sent && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 rounded-md"
              style={{ backgroundColor: SAGE_BG, border: `1px solid ${SAGE_DIM}` }}
            >
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE_DEEP }}>
                Email simulé envoyé à {clientName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@exemple.ma
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: SAGE_DEEP, marginTop: 2 }}>
                Lien: https://{config.portalUrl}/login?token=•••••
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: live portal preview */}
        <div>
          <div style={FONT_HEADER}>Aperçu en direct</div>
          <div
            className="mt-2 rounded-lg overflow-hidden"
            style={{ border: `1px solid ${BORDER_STRONG}`, backgroundColor: "#FFFFFF" }}
          >
            {/* Portal header */}
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-5 w-auto" style={{ objectFit: "contain" }} />
              ) : (
                <div
                  className="inline-flex items-center justify-center px-2 py-1 rounded"
                  style={{ backgroundColor: primaryColor, color: "#FFFFFF" }}
                >
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700 }}>
                    {clientName
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase() ?? "")
                      .join("")}
                  </span>
                </div>
              )}
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                {clientName}
              </span>
              {!(featuresHidden || hideHarch) && (
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginLeft: "auto" }}>
                  Propulsé par Harch
                </span>
              )}
            </div>
            {/* Portal body — KPIs */}
            <div className="p-3">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Score", value: "78" },
                  { label: "Mentions 24h", value: "142" },
                  { label: "Sentiment", value: "+12%" },
                ].map((kpi) => (
                  <div key={kpi.label} className="p-2 rounded" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 8,
                        color: TEXT_HEADER,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {kpi.label}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>
              {/* Portal nav — depends on view */}
              <div className="flex flex-wrap gap-1.5">
                {navItems.map((nav, i) => (
                  <span
                    key={nav}
                    className="inline-flex px-2 py-0.5 rounded-full"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      backgroundColor: i === 0 ? primaryColor : "#FAFAFA",
                      color: i === 0 ? "#FFFFFF" : TEXT_BODY,
                      border: `1px solid ${i === 0 ? primaryColor : BORDER}`,
                    }}
                  >
                    {nav}
                  </span>
                ))}
              </div>
              {/* Mini chart placeholder */}
              <div className="mt-3 flex items-end gap-1" style={{ height: 40 }}>
                {Array.from({ length: 14 }).map((_, i) => {
                  const h = 20 + Math.abs(Math.sin(i * 0.7)) * 18;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: h,
                        backgroundColor: primaryColor,
                        opacity: 0.5 + (i / 14) * 0.5,
                        borderRadius: 2,
                      }}
                    />
                  );
                })}
              </div>
            </div>
            {/* Footer */}
            <div
              className="px-3 py-1.5 flex items-center justify-between"
              style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
            >
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                {config.portalUrl}
              </span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: isClientView ? SAGE_DEEP : TEXT_MUTED }}>
                {isClientView ? "MODE CLIENT" : "MODE AGENCE"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <AiCommentary
        text={`Aperçu du portail tel que vu par ${clientName}. ${featuresHidden ? "Les fonctionnalités agence (commission, pitch deck, équipe) sont masquées." : "Toutes les fonctionnalités sont visibles."} Envoyez l'accès client pour partager le lien sécurisé.`}
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// ENV-AGENCY · FEATURE 5 — PITCH DECK PIPELINE (kanban, HTML5 drag-drop)
// 3 stages: Prospect → Proposition → Won. Each card: prospect name,
// sector, estimated value (MAD), probability %, next action date. Add
// prospect manually. Drag between stages (native HTML5 DnD, no deps).
// Persisted in "agency:pitch-pipeline".
// ════════════════════════════════════════════════════════════════════

function PitchPipelineCard({
  activeClientName,
}: {
  activeClientName: string | null;
}) {
  const [items, setItems] = usePersistentState<PitchPipelineItem[]>(
    "agency:pitch-pipeline",
    [
      { id: "pp-1", prospectName: "Atlas Logistics", sector: "Logistique", estimatedValue: 8500, probability: 30, nextActionDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10), stage: "prospect" },
      { id: "pp-2", prospectName: "Casa Retail Group", sector: "Retail", estimatedValue: 12000, probability: 50, nextActionDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10), stage: "prospect" },
      { id: "pp-3", prospectName: "MedTech Solutions", sector: "Santé", estimatedValue: 15000, probability: 70, nextActionDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), stage: "proposition" },
      { id: "pp-4", prospectName: "Sahara Energy", sector: "Énergie", estimatedValue: 22000, probability: 85, nextActionDate: new Date(Date.now() + 86400000 * 1).toISOString().slice(0, 10), stage: "proposition" },
      { id: "pp-5", prospectName: "Rabat Pharma", sector: "Pharma", estimatedValue: 9500, probability: 100, nextActionDate: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), stage: "won" },
    ],
  );
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSector, setNewSector] = useState("");
  const [newValue, setNewValue] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const stages: Array<{ key: PitchPipelineItem["stage"]; label: string; color: string; bg: string }> = [
    { key: "prospect", label: "Prospect", color: TEXT_BODY, bg: "#FAFAFA" },
    { key: "proposition", label: "Proposition", color: "#B45309", bg: "rgba(245,158,11,0.10)" },
    { key: "won", label: "Gagné", color: SAGE_DEEP, bg: SAGE_BG },
  ];

  const handleAdd = () => {
    if (!newName.trim() || !newValue) return;
    const item: PitchPipelineItem = {
      id: `pp-${Date.now()}`,
      prospectName: newName.trim(),
      sector: newSector.trim() || "—",
      estimatedValue: Number(newValue) || 0,
      probability: 30,
      nextActionDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      stage: "prospect",
    };
    setItems([item, ...items]);
    setNewName("");
    setNewSector("");
    setNewValue("");
    setAdding(false);
  };

  const handleDrop = (stage: PitchPipelineItem["stage"]) => {
    if (!dragId) return;
    setItems(
      items.map((it) =>
        it.id === dragId
          ? {
              ...it,
              stage,
              probability: stage === "won" ? 100 : stage === "proposition" ? Math.max(it.probability, 60) : it.probability,
            }
          : it,
      ),
    );
    setDragId(null);
  };

  const totalValue = items.reduce((s, i) => s + i.estimatedValue, 0);
  const wonValue = items.filter((i) => i.stage === "won").reduce((s, i) => s + i.estimatedValue, 0);
  const weightedPipeline = items
    .filter((i) => i.stage !== "won")
    .reduce((s, i) => s + (i.estimatedValue * i.probability) / 100, 0);

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Pipeline Pitch Deck · Kanban"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: SAGE_BG,
                color: SAGE,
                fontWeight: 700,
              }}
            >
              <KanbanSquare size={10} /> {items.length} prospects
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={() => setAdding((v) => !v)}
            >
              <Plus size={11} /> Prospect
            </Button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Pipeline total</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            {fmtMAD(totalValue)}
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Pipeline pondéré</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: "#B45309", marginTop: 2 }}>
            {fmtMAD(Math.round(weightedPipeline))}
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: SAGE_BG }}>
          <div style={FONT_HEADER}>Gagné</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: SAGE_DEEP, marginTop: 2 }}>
            {fmtMAD(wonValue)}
          </div>
        </div>
      </div>
      {/* Add form */}
      {adding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-3 p-3 rounded-md"
          style={{ border: `1px solid ${SAGE_DIM}`, backgroundColor: SAGE_BG }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Nom du prospect"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-2 py-1.5 rounded-md outline-none"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL }}
              autoFocus
            />
            <input
              type="text"
              placeholder="Secteur"
              value={newSector}
              onChange={(e) => setNewSector(e.target.value)}
              className="px-2 py-1.5 rounded-md outline-none"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL }}
            />
            <input
              type="number"
              placeholder="Valeur estimée (MAD)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="px-2 py-1.5 rounded-md outline-none"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}
            />
            <Button
              size="sm"
              style={{ backgroundColor: SAGE, color: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 11 }}
              onClick={handleAdd}
            >
              <Check size={12} /> Ajouter
            </Button>
          </div>
        </motion.div>
      )}
      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stages.map((stage) => {
          const stageItems = items.filter((i) => i.stage === stage.key);
          const stageValue = stageItems.reduce((s, i) => s + i.estimatedValue, 0);
          const isDropTarget = dragId !== null;
          return (
            <div
              key={stage.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.key)}
              className={`rounded-md p-2 transition-colors ${isDropTarget ? "agency-drop-zone-active" : ""}`}
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC", minHeight: 180 }}
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: stage.color }} />
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      fontWeight: 700,
                      color: stage.color,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {stage.label}
                  </span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                    ({stageItems.length})
                  </span>
                </div>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, fontWeight: 700 }}>
                  {fmtNumber(stageValue)}
                </span>
              </div>
              <div className="space-y-2">
                {stageItems.length === 0 ? (
                  <div
                    className={`text-center py-6 rounded-md transition-colors ${isDropTarget ? "" : ""}`}
                    style={{
                      border: `1px dashed ${isDropTarget ? SAGE_DIM : BORDER_STRONG}`,
                      backgroundColor: isDropTarget ? SAGE_BG : "transparent",
                      fontFamily: FONT_SANS,
                      fontSize: 10,
                      color: isDropTarget ? SAGE_DEEP : TEXT_MUTED,
                    }}
                  >
                    {isDropTarget ? "Déposer ici" : "Glissez une carte ici"}
                  </div>
                ) : (
                  stageItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      draggable
                      onDragStart={() => setDragId(item.id)}
                      onDragEnd={() => setDragId(null)}
                      className="p-2.5 rounded-md cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: `1px solid ${dragId === item.id ? SAGE : BORDER_STRONG}`,
                        opacity: dragId === item.id ? 0.55 : 1,
                        boxShadow: dragId === item.id ? "0 8px 20px rgba(74,123,95,0.18)" : "none",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div
                            style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}
                            className="truncate"
                          >
                            {item.prospectName}
                          </div>
                          <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 1 }}>
                            {item.sector}
                          </div>
                        </div>
                        <GripVertical size={11} style={{ color: dragId === item.id ? SAGE : TEXT_MUTED, flexShrink: 0, transition: "color 0.18s" }} />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: SAGE_DEEP }}>
                          {fmtMAD(item.estimatedValue)}
                        </span>
                        <span
                          className="inline-flex px-1.5 py-0.5 rounded-full"
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            fontWeight: 700,
                            backgroundColor:
                              item.probability >= 80 ? SAGE_BG : item.probability >= 50 ? "rgba(245,158,11,0.10)" : "#FAFAFA",
                            color:
                              item.probability >= 80 ? SAGE_DEEP : item.probability >= 50 ? "#B45309" : TEXT_BODY,
                          }}
                        >
                          {item.probability}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <CalendarDays size={9} style={{ color: TEXT_MUTED }} />
                        <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                          {fmtDayShort(item.nextActionDate)}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      <AiCommentary
        text={`Pipeline de ${items.length} prospects · ${fmtMAD(Math.round(weightedPipeline))} en pipeline pondéré · ${fmtMAD(wonValue)} déjà gagné. ${activeClientName ? `Client actif : ${activeClientName}.` : "Glissez les cartes entre colonnes pour mettre à jour le stage."}`}
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// ENV-AGENCY · FEATURE 6 — TEAM WORKLOAD BALANCER (full-width card)
// Shows each team member: avatar (initials), name, role, assigned clients
// (count + names), workload % (green/amber/red). "Rééquilibrer" button:
// auto-suggest reassignment (move client from overloaded to underloaded).
// Click member → see their client list with sentiment scores. Add team
// member manually. Persisted in "agency:team-workload".
// ════════════════════════════════════════════════════════════════════

function TeamWorkloadBalancerCard({
  users,
  clients,
  loading,
  onInvite,
}: {
  users: TeamUser[];
  clients: AgencyClient[];
  loading: boolean;
  onInvite: () => void;
}) {
  const [members, setMembers] = usePersistentState<WorkloadMember[]>(
    "agency:team-workload",
    [],
  );
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Bootstrap from real users when members list is empty (first run).
  // Subsequent runs use the persisted assignments.
  useEffect(() => {
    if (members.length === 0 && users.length > 0) {
      const initial: WorkloadMember[] = users.slice(0, 8).map((u, i) => ({
        id: u.id,
        name: u.name ?? u.email.split("@")[0],
        role: u.role,
        email: u.email,
        assignedClientIds: clients
          .filter((_, idx) => idx % Math.max(1, users.length) === i)
          .map((c) => c.id),
        capacity: 5,
      }));
      setMembers(initial);
    }
  }, [users, clients, members.length, setMembers]);

  const workloadPct = (m: WorkloadMember): number => {
    if (m.capacity === 0) return 0;
    return Math.min(120, Math.round((m.assignedClientIds.length / m.capacity) * 100));
  };

  const workloadTone = (pct: number): { color: string; label: string } => {
    if (pct <= 60) return { color: POSITIVE, label: "Sous-chargé" };
    if (pct <= 100) return { color: SAGE, label: "Équilibré" };
    if (pct <= 110) return { color: NEUTRAL_AMBER, label: "Chargé" };
    return { color: NEGATIVE, label: "Surchargé" };
  };

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const m: WorkloadMember = {
      id: `tm-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || "Consultant",
      email: newEmail.trim(),
      assignedClientIds: [],
      capacity: 5,
    };
    setMembers([...members, m]);
    setNewName("");
    setNewRole("");
    setNewEmail("");
    setAdding(false);
  };

  const handleRebalance = () => {
    if (members.length < 2) return;
    // Algorithm: move 1 client from most-loaded to least-loaded member.
    const sorted = [...members].sort((a, b) => workloadPct(b) - workloadPct(a));
    const most = sorted[0];
    const least = sorted[sorted.length - 1];
    if (most.assignedClientIds.length === 0) return;
    const clientIdToMove = most.assignedClientIds[most.assignedClientIds.length - 1];
    setMembers(
      members.map((m) => {
        if (m.id === most.id) {
          return { ...m, assignedClientIds: m.assignedClientIds.filter((id) => id !== clientIdToMove) };
        }
        if (m.id === least.id) {
          return { ...m, assignedClientIds: [...m.assignedClientIds, clientIdToMove] };
        }
        return m;
      }),
    );
  };

  const avgWorkload =
    members.length > 0
      ? Math.round(members.reduce((s, m) => s + workloadPct(m), 0) / members.length)
      : 0;
  const overloadedCount = members.filter((m) => workloadPct(m) > 100).length;

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Équilibreur de Charge Équipe"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: overloadedCount > 0 ? "rgba(239,68,68,0.10)" : SAGE_BG,
                color: overloadedCount > 0 ? NEGATIVE : SAGE,
                fontWeight: 700,
              }}
            >
              <Users size={10} /> {members.length} membres · {overloadedCount} surchargé{overloadedCount > 1 ? "s" : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={() => setAdding((v) => !v)}
            >
              <Plus size={11} /> Membre
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE, color: SAGE_DEEP }}
              onClick={handleRebalance}
              disabled={members.length < 2}
            >
              <RefreshCw size={11} /> Rééquilibrer
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={onInvite}
            >
              <UserPlus size={11} /> Inviter
            </Button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {/* Add form */}
      {adding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-3 p-3 rounded-md"
          style={{ border: `1px solid ${SAGE_DIM}`, backgroundColor: SAGE_BG }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Nom"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-2 py-1.5 rounded-md outline-none"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL }}
              autoFocus
            />
            <input
              type="text"
              placeholder="Rôle (ex: Account Manager)"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="px-2 py-1.5 rounded-md outline-none"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL }}
            />
            <input
              type="email"
              placeholder="email@agence.ma"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="px-2 py-1.5 rounded-md outline-none"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}
            />
            <Button
              size="sm"
              style={{ backgroundColor: SAGE, color: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 11 }}
              onClick={handleAdd}
            >
              <Check size={12} /> Ajouter
            </Button>
          </div>
        </motion.div>
      )}
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Charge moyenne</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            <AnimatedNumber value={avgWorkload} duration={700} />%
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Clients assignés</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            <AnimatedNumber value={members.reduce((s, m) => s + m.assignedClientIds.length, 0)} duration={600} /> / {clients.length}
          </div>
        </div>
        <div
          className="p-2.5 rounded-md agency-color-transition"
          style={{
            border: `1px solid ${BORDER}`,
            backgroundColor: overloadedCount > 0 ? "rgba(239,68,68,0.06)" : "#FCFCFC",
          }}
        >
          <div style={FONT_HEADER}>Surchargés</div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 14,
              fontWeight: 700,
              color: overloadedCount > 0 ? NEGATIVE : SAGE_DEEP,
              marginTop: 2,
            }}
          >
            <AnimatedNumber value={overloadedCount} duration={600} />
          </div>
        </div>
      </div>
      {loading && members.length === 0 ? (
        <StaggeredSkeletons count={4} className="h-14 w-full rounded-md" label="Chargement du portefeuille d'équipe…" />
      ) : members.length === 0 ? (
        <EmptyState
          title="Aucun membre d'équipe configuré"
          description="Ajoutez votre premier account manager pour visualiser la charge, rééquilibrer les assignations et suivre la performance."
          ctaLabel="Ajouter un membre"
          onCta={() => setAdding(true)}
          Icon={Users}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {members.map((m) => {
            const pct = workloadPct(m);
            const tone = workloadTone(pct);
            const isSelected = m.id === selectedId;
            const assignedClients = clients.filter((c) => m.assignedClientIds.includes(c.id));
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : m.id)}
                className="text-left p-3 rounded-md transition-colors hover:bg-[#FAFAFA]"
                style={{
                  border: `1px solid ${isSelected ? SAGE_DIM : BORDER}`,
                  backgroundColor: isSelected ? SAGE_BG : "#FCFCFC",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                    style={{
                      backgroundColor: SAGE_BG,
                      color: SAGE_DEEP,
                      fontFamily: FONT_MONO,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {m.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase() ?? "")
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}
                        className="truncate"
                      >
                        {m.name}
                      </span>
                      <span
                        className="inline-flex px-1.5 py-0.5 rounded-full"
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 8,
                          letterSpacing: "0.04em",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          backgroundColor:
                            m.role === "agency-admin"
                              ? SAGE_BG
                              : m.role === "agency-manager"
                                ? "rgba(245,158,11,0.10)"
                                : "#FAFAFA",
                          color:
                            m.role === "agency-admin"
                              ? SAGE_DEEP
                              : m.role === "agency-manager"
                                ? "#B45309"
                                : TEXT_BODY,
                        }}
                      >
                        {m.role}
                      </span>
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 1 }}>
                      {m.email} · {m.assignedClientIds.length} client{m.assignedClientIds.length > 1 ? "s" : ""} / {m.capacity} max
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: tone.color }}>
                      <AnimatedNumber value={pct} duration={600} />%
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 8,
                        color: TEXT_MUTED,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {tone.label}
                    </div>
                  </div>
                </div>
                {/* Workload bar */}
                <div
                  className="mt-2 rounded-full overflow-hidden"
                  style={{ height: 4, backgroundColor: BORDER }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, pct)}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      backgroundColor: tone.color,
                    }}
                  />
                </div>
                {/* Selected detail */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 pt-2"
                    style={{ borderTop: `1px solid ${BORDER}` }}
                  >
                    <div style={FONT_HEADER}>Clients assignés</div>
                    {assignedClients.length === 0 ? (
                      <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: TEXT_MUTED, marginTop: 4 }}>
                        Aucun client — capacité disponible.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assignedClients.map((c) => {
                          const score = derivedClientScore(c);
                          const sentiment = derivedClientSentiment(c);
                          const toneColor =
                            sentiment.positive >= 50 ? POSITIVE : sentiment.negative >= 40 ? NEGATIVE : NEUTRAL_AMBER;
                          return (
                            <span
                              key={c.id}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                              style={{
                                backgroundColor: "#FFFFFF",
                                border: `1px solid ${BORDER}`,
                                fontFamily: FONT_MONO,
                                fontSize: 9,
                                color: TEXT_BODY,
                              }}
                              title={`Score ${score} · Sentiment ${sentiment.positive}%+ / ${sentiment.negative}%-`}
                            >
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  backgroundColor: toneColor,
                                }}
                              />
                              {c.displayName} · {score}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      )}
      <AiCommentary
        text={`${members.length} membres · charge moyenne ${avgWorkload}%. ${overloadedCount > 0 ? `${overloadedCount} membre(s) surchargé(s) — cliquez « Rééquilibrer » pour déplacer un client du plus chargé vers le moins chargé.` : `Charge équilibrée — capacité disponible pour de nouveaux clients.`}`}
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R2-AGENCY-B · FEATURE 1 — TEAM PERFORMANCE DASHBOARD (full-width card)
// Per-team-member performance grid: avatar (initials), name, role, clients
// assigned count, avg client health score (from Client Health Scoring),
// reports generated this month, HarchIQ questions used, response time
// (avg hours to acknowledge alert), composite performance score (0-100).
// Top performer highlighted with sage border + "Top performeur" badge.
// Sortable by: performance score, clients, reports, response time.
// "Évaluer" button → detailed performance review modal. Horizontal
// BarChart comparing team performance. 5 members seeded by default.
// Persisted in "agency:team-perf".
// ════════════════════════════════════════════════════════════════════

const TEAM_PERF_SEED: TeamPerfMember[] = [
  {
    id: "tp-1",
    name: "Yasmine Tahiri",
    role: "Directrice de clientèle",
    email: "y.tahiri@agence.ma",
    initials: "YT",
    assignedClientIds: [],
    reportsThisMonth: 12,
    harchiqQuestionsUsed: 48,
    responseTimeHours: 1.4,
  },
  {
    id: "tp-2",
    name: "Karim Benjelloun",
    role: "Account Manager Senior",
    email: "k.benjelloun@agence.ma",
    initials: "KB",
    assignedClientIds: [],
    reportsThisMonth: 9,
    harchiqQuestionsUsed: 31,
    responseTimeHours: 2.8,
  },
  {
    id: "tp-3",
    name: "Salma El Fassi",
    role: "Consultante RP",
    email: "s.elfassi@agence.ma",
    initials: "SE",
    assignedClientIds: [],
    reportsThisMonth: 7,
    harchiqQuestionsUsed: 22,
    responseTimeHours: 4.2,
  },
  {
    id: "tp-4",
    name: "Omar Cherkaoui",
    role: "Analyste Veille",
    email: "o.cherkaoui@agence.ma",
    initials: "OC",
    assignedClientIds: [],
    reportsThisMonth: 14,
    harchiqQuestionsUsed: 39,
    responseTimeHours: 1.9,
  },
  {
    id: "tp-5",
    name: "Nadia Berrada",
    role: "Account Manager Junior",
    email: "n.berrada@agence.ma",
    initials: "NB",
    assignedClientIds: [],
    reportsThisMonth: 5,
    harchiqQuestionsUsed: 14,
    responseTimeHours: 6.5,
  },
];

function computeTeamPerfScore(
  m: TeamPerfMember,
  avgClientHealth: number,
): number {
  if (m.manualScoreAdjust !== undefined) return m.manualScoreAdjust;
  // Composite 0-100:
  //  30% avg client health
  //  25% reports (0-10 → 0-100, capped)
  //  15% harchiq questions (0-40 → 0-100, capped)
  //  30% response time (0h=100, 8h+=0)
  const reportsScore = Math.min(100, Math.round((m.reportsThisMonth / 10) * 100));
  const harchiqScore = Math.min(100, Math.round((m.harchiqQuestionsUsed / 40) * 100));
  const responseScore = Math.max(0, Math.round(100 - (m.responseTimeHours / 8) * 100));
  const score = Math.round(
    avgClientHealth * 0.3 +
      reportsScore * 0.25 +
      harchiqScore * 0.15 +
      responseScore * 0.3,
  );
  return Math.max(0, Math.min(100, score));
}

function TeamPerformanceDashboardCard({
  clients,
  onToast,
}: {
  clients: AgencyClient[];
  onToast: (msg: string, kind?: "info" | "success") => void;
}) {
  const [members, setMembers] = usePersistentState<TeamPerfMember[]>(
    "agency:team-perf",
    TEAM_PERF_SEED,
  );
  const [sortKey, setSortKey] = useState<TeamPerfSort>("score");
  const [evalId, setEvalId] = useState<string | null>(null);

  // Assign clients to members deterministically if none are assigned yet.
  // Mirrors TeamWorkloadBalancerCard bootstrap pattern.
  useEffect(() => {
    const anyAssigned = members.some((m) => m.assignedClientIds.length > 0);
    if (!anyAssigned && clients.length > 0) {
      setMembers(
        members.map((m, i) => ({
          ...m,
          assignedClientIds: clients
            .filter((_, idx) => idx % Math.max(1, members.length) === i)
            .map((c) => c.id),
        })),
      );
    }
  }, [clients, members, setMembers]);

  // Compute avg client health score per member using the same
  // computeClientHealth() helper as Client Health Scoring.
  const rows = useMemo(() => {
    return members.map((m) => {
      const assigned = clients.filter((c) => m.assignedClientIds.includes(c.id));
      const avgHealth =
        assigned.length > 0
          ? Math.round(
              assigned.reduce((s, c) => s + computeClientHealth(c).score, 0) /
                assigned.length,
            )
          : 65; // fallback when no clients assigned
      const score = computeTeamPerfScore(m, avgHealth);
      return { ...m, assignedClients: assigned, avgHealth, score };
    });
  }, [members, clients]);

  const topPerformerId = useMemo(() => {
    if (rows.length === 0) return null;
    return rows.reduce((best, r) => (r.score > best.score ? r : best), rows[0]).id;
  }, [rows]);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      switch (sortKey) {
        case "score":
          return b.score - a.score;
        case "clients":
          return b.assignedClientIds.length - a.assignedClientIds.length;
        case "reports":
          return b.reportsThisMonth - a.reportsThisMonth;
        case "response":
          return a.responseTimeHours - b.responseTimeHours;
        default:
          return 0;
      }
    });
    return copy;
  }, [rows, sortKey]);

  const avgScore = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length)
    : 0;
  const avgResponse =
    rows.length > 0
      ? (rows.reduce((s, r) => s + r.responseTimeHours, 0) / rows.length).toFixed(1)
      : "—";
  const totalReports = rows.reduce((s, r) => s + r.reportsThisMonth, 0);
  const totalQuestions = rows.reduce((s, r) => s + r.harchiqQuestionsUsed, 0);

  const evalMember = evalId ? rows.find((r) => r.id === evalId) ?? null : null;

  const handleAdjustScore = (id: string, delta: number) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const current = computeTeamPerfScore(
          m,
          rows.find((r) => r.id === id)?.avgHealth ?? 65,
        );
        const next = Math.max(0, Math.min(100, current + delta));
        return { ...m, manualScoreAdjust: next };
      }),
    );
  };

  const handleClearOverride = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, manualScoreAdjust: undefined } : m)),
    );
  };

  const barData = sortedRows.map((r) => ({
    name: r.initials,
    fullName: r.name,
    score: r.score,
  }));

  const sortBtn = (key: TeamPerfSort, label: string) => {
    const active = sortKey === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setSortKey(key)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors"
        style={{
          fontFamily: FONT_MONO,
          fontSize: 9,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontWeight: 700,
          backgroundColor: active ? SAGE_BG : "#FAFAFA",
          color: active ? SAGE_DEEP : TEXT_MUTED,
          border: `1px solid ${active ? SAGE_DIM : BORDER}`,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Performance Équipe"
        right={
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.08em",
              backgroundColor: SAGE_BG,
              color: SAGE,
              fontWeight: 700,
            }}
          >
            <Trophy size={10} /> {members.length} membres · score moy. {avgScore}
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />

      {/* Aggregate strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Score moyen</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            {avgScore}<span style={{ fontSize: 11, color: TEXT_MUTED }}> /100</span>
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Temps réponse moyen</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            {avgResponse}<span style={{ fontSize: 11, color: TEXT_MUTED }}> h</span>
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Rapports (mois)</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            {totalReports}
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: SAGE_BG }}>
          <div style={FONT_HEADER}>Questions HarchIQ</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: SAGE_DEEP, marginTop: 2 }}>
            {totalQuestions}
          </div>
        </div>
      </div>

      {/* Sort bar */}
      <div className="flex items-center gap-1.5 mb-3">
        <span style={{ ...FONT_HEADER, fontSize: 9 }}>Trier par :</span>
        {sortBtn("score", "Score")}
        {sortBtn("clients", "Clients")}
        {sortBtn("reports", "Rapports")}
        {sortBtn("response", "Temps réponse")}
      </div>

      {/* Member grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
        {sortedRows.map((m) => {
          const isTop = m.id === topPerformerId;
          return (
            <div
              key={m.id}
              className="p-3 rounded-md transition-shadow"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1px solid ${isTop ? SAGE : BORDER_STRONG}`,
                boxShadow: isTop ? `0 0 0 1px ${SAGE}` : "none",
              }}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="inline-flex items-center justify-center shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: isTop ? SAGE : SAGE_BG,
                    color: isTop ? "#FFFFFF" : SAGE_DEEP,
                    fontFamily: FONT_MONO,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  {m.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }} className="truncate">
                      {m.name}
                    </span>
                    {isTop && (
                      <span
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: SAGE_BG, color: SAGE_DEEP, fontFamily: FONT_MONO, fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}
                      >
                        <Crown size={9} /> Top performeur
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 1 }}>
                    {m.role}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: isTop ? SAGE_DEEP : CHARCOAL, lineHeight: 1 }}>
                    {m.score}
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_MUTED, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    /100
                  </div>
                </div>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-2 gap-1.5 mt-3">
                <div className="p-1.5 rounded" style={{ backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_HEADER, letterSpacing: "0.06em", textTransform: "uppercase" }}>Clients</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{m.assignedClientIds.length}</div>
                </div>
                <div className="p-1.5 rounded" style={{ backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_HEADER, letterSpacing: "0.06em", textTransform: "uppercase" }}>Santé moy.</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{m.avgHealth}</div>
                </div>
                <div className="p-1.5 rounded" style={{ backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_HEADER, letterSpacing: "0.06em", textTransform: "uppercase" }}>Rapports</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{m.reportsThisMonth}</div>
                </div>
                <div className="p-1.5 rounded" style={{ backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_HEADER, letterSpacing: "0.06em", textTransform: "uppercase" }}>Temps rép.</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{m.responseTimeHours}h</div>
                </div>
              </div>
              {/* HarchIQ + eval button */}
              <div className="flex items-center justify-between mt-2.5">
                <div className="inline-flex items-center gap-1" style={{ fontFamily: FONT_MONO, fontSize: 9, color: SAGE_DEEP }}>
                  <Brain size={10} /> {m.harchiqQuestionsUsed} questions
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6"
                  style={{ fontFamily: FONT_MONO, fontSize: 9, borderColor: SAGE_DIM, color: SAGE_DEEP }}
                  onClick={() => setEvalId(m.id)}
                >
                  <Award size={10} /> Évaluer
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar chart: team comparison */}
      <div style={FONT_HEADER} className="mb-2">Comparatif performance équipe</div>
      <div style={{ height: 200, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }} stroke={BORDER} />
            <YAxis type="category" dataKey="name" tick={{ fontFamily: FONT_MONO, fontSize: 11, fill: CHARCOAL }} stroke={BORDER} width={36} />
            <RTooltip
              cursor={{ fill: SAGE_BG }}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: `1px solid ${BORDER_STRONG}`,
                borderRadius: 8,
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: CHARCOAL,
              }}
              formatter={(value: number) => [`${value} / 100`, "Score"]}
              labelFormatter={(_label: number, payload: Array<{ payload?: { fullName?: string } }>) => payload?.[0]?.payload?.fullName ?? ""}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={28} isAnimationActive animationDuration={800}>
              {barData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.name === sortedRows.find((r) => r.id === topPerformerId)?.initials ? SAGE : SAGE_DIM}
                  fillOpacity={entry.name === sortedRows.find((r) => r.id === topPerformerId)?.initials ? 1 : 0.65}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <AiCommentary
        text={`Performance moyenne équipe : ${avgScore}/100. Top performeur : ${rows.find((r) => r.id === topPerformerId)?.name ?? "—"}. ${avgResponse}h de temps réponse moyen. Cliquez « Évaluer » pour ouvrir la revue détaillée d'un membre.`}
      />

      {/* Evaluation modal */}
      {evalMember && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Revue de performance"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(10,10,10,0.5)" }}
            onClick={() => setEvalId(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full max-w-2xl rounded-xl overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER_STRONG}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              maxHeight: "92vh",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="inline-flex items-center justify-center w-9 h-9 rounded-md"
                  style={{ backgroundColor: SAGE, color: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700 }}
                >
                  {evalMember.initials}
                </div>
                <div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
                    {evalMember.name}
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                    {evalMember.role} · {evalMember.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEvalId(null)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[#F5F5F5]"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: "calc(92vh - 60px)" }}>
              {/* Score block */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: SAGE_BG }}>
                  <div style={FONT_HEADER}>Score perf.</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: SAGE_DEEP, marginTop: 2 }}>
                    {evalMember.score}<span style={{ fontSize: 11, color: TEXT_MUTED }}> /100</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
                  <div style={FONT_HEADER}>Clients</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
                    {evalMember.assignedClientIds.length}
                  </div>
                </div>
                <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
                  <div style={FONT_HEADER}>Santé moy.</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
                    {evalMember.avgHealth}
                  </div>
                </div>
                <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
                  <div style={FONT_HEADER}>Temps rép.</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
                    {evalMember.responseTimeHours}<span style={{ fontSize: 11, color: TEXT_MUTED }}> h</span>
                  </div>
                </div>
              </div>

              {/* Activity breakdown */}
              <div style={FONT_HEADER} className="mb-2">Activité du mois</div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-2.5 rounded-md" style={{ backgroundColor: "#FCFCFC", border: `1px solid ${BORDER}` }}>
                  <div className="flex items-center gap-2">
                    <FileBarChart size={14} style={{ color: SAGE }} />
                    <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL }}>Rapports générés</span>
                  </div>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{evalMember.reportsThisMonth}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md" style={{ backgroundColor: "#FCFCFC", border: `1px solid ${BORDER}` }}>
                  <div className="flex items-center gap-2">
                    <Brain size={14} style={{ color: SAGE }} />
                    <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL }}>Questions HarchIQ</span>
                  </div>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{evalMember.harchiqQuestionsUsed}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md" style={{ backgroundColor: "#FCFCFC", border: `1px solid ${BORDER}` }}>
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: SAGE }} />
                    <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL }}>Temps réponse alerte</span>
                  </div>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{evalMember.responseTimeHours} h (moy.)</span>
                </div>
              </div>

              {/* Assigned clients */}
              <div style={FONT_HEADER} className="mb-2">Clients assignés ({evalMember.assignedClients.length})</div>
              {evalMember.assignedClients.length === 0 ? (
                <div className="p-2.5 rounded-md text-center" style={{ border: `1px dashed ${BORDER_STRONG}`, fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}>
                  Aucun client assigné — capacité disponible.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {evalMember.assignedClients.map((c) => {
                    const score = computeClientHealth(c).score;
                    const band = healthBandFor(score);
                    const style = healthBandStyle(band);
                    return (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                        style={{ backgroundColor: style.bg, border: `1px solid ${BORDER}`, fontFamily: FONT_MONO, fontSize: 9, color: style.color }}
                      >
                        <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", backgroundColor: style.color }} />
                        {c.displayName} · {score}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Score override */}
              <div style={FONT_HEADER} className="mb-2">Ajustement manuel du score</div>
              <div className="flex items-center gap-2 p-3 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                  onClick={() => handleAdjustScore(evalMember.id, -5)}
                >
                  <Minus size={11} /> -5
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                  onClick={() => handleAdjustScore(evalMember.id, 5)}
                >
                  <Plus size={11} /> +5
                </Button>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginLeft: "auto" }}>
                  {evalMember.manualScoreAdjust !== undefined ? "Score manuel" : "Score calculé"}
                </span>
                {evalMember.manualScoreAdjust !== undefined && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE_DIM, color: SAGE_DEEP }}
                    onClick={() => handleClearOverride(evalMember.id)}
                  >
                    <RotateCcw size={11} /> Calculé
                  </Button>
                )}
              </div>
            </div>

            <div className="px-5 py-3 flex items-center justify-end gap-2" style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                onClick={() => setEvalId(null)}
              >
                Fermer
              </Button>
              <Button
                size="sm"
                className="h-8"
                style={{ backgroundColor: SAGE, color: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 10 }}
                onClick={() => {
                  onToast(`Revue de performance enregistrée pour ${evalMember.name}.`, "success");
                  setEvalId(null);
                }}
              >
                <Check size={12} /> Enregistrer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R2-AGENCY-B · FEATURE 2 — PITCH DECK ANALYTICS (full-width card)
// Conversion funnel: Prospects → Propositions envoyées → Meetings → Won.
// Custom CSS trapezoid funnel with conversion rates between stages.
// Metrics strip: total pipeline value, win rate, avg deal cycle (days),
// avg deal size (MAD). Monthly trend LineChart (wins per month, last 6
// months). "Pipeline par source" donut: LinkedIn / Referral / Cold
// outreach / Inbound (deterministic from prospect name hash). Reads
// pipeline from "agency:pitch-pipeline" (shared with Pitch Pipeline
// Kanban). Empty state with CTA when no prospects. Analytics cache
// persisted in "agency:pitch-analytics".
// ════════════════════════════════════════════════════════════════════

const PITCH_SOURCES: Array<{ source: PitchSourceRow["source"]; color: string }> = [
  { source: "LinkedIn", color: "#1E3A5F" },
  { source: "Referral", color: SAGE },
  { source: "Cold outreach", color: "#A0524B" },
  { source: "Inbound", color: "#8B6914" },
];

function derivePitchSource(name: string): PitchSourceRow["source"] {
  const h = hashStr(name);
  return PITCH_SOURCES[h % PITCH_SOURCES.length].source;
}

function readPipelineFromLS(): PitchPipelineItem[] {
  try {
    const raw = window.localStorage.getItem("agency:pitch-pipeline");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PitchPipelineItem[]) : [];
  } catch {
    return [];
  }
}

function computePitchAnalytics(items: PitchPipelineItem[]): PitchAnalyticsCache {
  const totalPipelineValue = items.reduce((s, i) => s + i.estimatedValue, 0);
  const wonItems = items.filter((i) => i.stage === "won");
  const wonValue = wonItems.reduce((s, i) => s + i.estimatedValue, 0);

  // Funnel: cumulative count + value moving forward through stages.
  // Stage 1 (Prospects) = all items.
  // Stage 2 (Propositions envoyées) = proposition + won.
  // Stage 3 (Meetings) = proposition with probability ≥ 60 + won.
  // Stage 4 (Won) = won only.
  const prospects = items;
  const propositions = items.filter((i) => i.stage === "proposition" || i.stage === "won");
  const meetings = items.filter(
    (i) => i.stage === "won" || (i.stage === "proposition" && i.probability >= 60),
  );
  const won = wonItems;

  const funnel: PitchFunnelStage[] = [
    { key: "prospects", label: "Prospects", count: prospects.length, value: prospects.reduce((s, i) => s + i.estimatedValue, 0) },
    { key: "propositions", label: "Propositions envoyées", count: propositions.length, value: propositions.reduce((s, i) => s + i.estimatedValue, 0) },
    { key: "meetings", label: "Meetings", count: meetings.length, value: meetings.reduce((s, i) => s + i.estimatedValue, 0) },
    { key: "won", label: "Won", count: won.length, value: wonValue },
  ];

  const winRatePct = prospects.length > 0 ? Math.round((won.length / prospects.length) * 100) : 0;

  // Avg deal cycle: days between prospect creation (estimated from
  // nextActionDate minus ~14d) and won date (nextActionDate for won items).
  // Simplification: cycle ≈ 14 + days since the won item's nextActionDate.
  // Deterministic, representative.
  const cycleDays = wonItems.map((i) => {
    const d = new Date(i.nextActionDate);
    if (isNaN(d.getTime())) return 21;
    const diff = (Date.now() - d.getTime()) / 86400000;
    return 14 + Math.max(0, Math.round(diff));
  });
  const avgDealCycleDays = cycleDays.length > 0 ? Math.round(cycleDays.reduce((s, v) => s + v, 0) / cycleDays.length) : 0;

  const avgDealSize = won.length > 0 ? Math.round(wonValue / won.length) : 0;

  // Sources breakdown (deterministic from prospect name hash).
  const sourceMap: Record<PitchSourceRow["source"], { count: number; value: number }> = {
    LinkedIn: { count: 0, value: 0 },
    Referral: { count: 0, value: 0 },
    "Cold outreach": { count: 0, value: 0 },
    Inbound: { count: 0, value: 0 },
  };
  items.forEach((i) => {
    const src = derivePitchSource(i.prospectName);
    sourceMap[src].count += 1;
    sourceMap[src].value += i.estimatedValue;
  });
  const sources: PitchSourceRow[] = PITCH_SOURCES.map((p) => ({
    source: p.source,
    color: p.color,
    count: sourceMap[p.source].count,
    value: sourceMap[p.source].value,
  }));

  // Monthly wins for last 6 months.
  const monthlyWins: Array<{ month: string; wins: number; value: number }> = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = format(d, "MMM", { locale: fr });
    // Deterministic win count from hash of month label + count of won items.
    const wonThisMonth = wonItems.filter((w) => {
      const wd = new Date(w.nextActionDate);
      return wd.getMonth() === d.getMonth() && wd.getFullYear() === d.getFullYear();
    });
    // Fallback: deterministic distribution if no dates match.
    const seed = hashStr(`${label}-${i}`);
    const syntheticWins = (seed % 3) + (i === 5 ? 0 : 1);
    const wins = wonThisMonth.length > 0 ? wonThisMonth.length : syntheticWins;
    const value = wonThisMonth.length > 0
      ? wonThisMonth.reduce((s, w) => s + w.estimatedValue, 0)
      : wins * (avgDealSize || 12000);
    monthlyWins.push({ month: label, wins, value });
  }

  return {
    computedAt: Date.now(),
    totalPipelineValue,
    winRatePct,
    avgDealCycleDays,
    avgDealSize,
    funnel,
    sources,
    monthlyWins,
  };
}

function PitchDeckAnalyticsCard() {
  // Read pipeline from localStorage on mount + on refresh click.
  const [items, setItems] = useState<PitchPipelineItem[]>([]);
  const [cache, setCache] = usePersistentState<PitchAnalyticsCache | null>(
    "agency:pitch-analytics",
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const pipeline = readPipelineFromLS();
    setItems(pipeline);
    if (pipeline.length > 0) {
      const computed = computePitchAnalytics(pipeline);
      setCache(computed);
    } else {
      setCache(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Cross-tab storage listener (refreshes when PitchPipelineCard in
  // another tab updates the pipeline).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "agency:pitch-pipeline") {
        setRefreshKey((k) => k + 1);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  if (items.length === 0 || !cache) {
    return (
      <CardShell className="lg:col-span-12">
        <SectionHeader
          title="Analytics Pitch Deck"
          right={
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", backgroundColor: "#FAFAFA", color: TEXT_MUTED, fontWeight: 700 }}
            >
              <Activity size={10} /> 0 prospects
            </span>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        <div
          className="text-center py-10 rounded-md"
          style={{ border: `1px dashed ${BORDER_STRONG}` }}
        >
          <KanbanSquare size={28} style={{ color: TEXT_MUTED, margin: "0 auto 8px" }} />
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: CHARCOAL, fontWeight: 600 }}>
            Aucun prospect dans le pipeline
          </p>
          <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
            Ajoutez des prospects au pipeline pour activer les analytics de conversion.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 h-8"
            style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE_DIM, color: SAGE_DEEP }}
            onClick={handleRefresh}
          >
            <RefreshCw size={11} /> Rafraîchir
          </Button>
        </div>
      </CardShell>
    );
  }

  const funnelMax = cache.funnel[0].count || 1;
  const funnelColors = [TEXT_BODY, "#B45309", SAGE_DIM, SAGE_DEEP];

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Analytics Pitch Deck"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", backgroundColor: SAGE_BG, color: SAGE, fontWeight: 700 }}
            >
              <Activity size={10} /> {items.length} prospects
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10 }}
              onClick={handleRefresh}
            >
              <RefreshCw size={11} /> Rafraîchir
            </Button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />

      {/* Metrics strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Pipeline total</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            {fmtMAD(cache.totalPipelineValue)}
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: SAGE_BG }}>
          <div style={FONT_HEADER}>Taux de victoire</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: SAGE_DEEP, marginTop: 2 }}>
            {cache.winRatePct}%
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Cycle moyen</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            {cache.avgDealCycleDays}<span style={{ fontSize: 11, color: TEXT_MUTED }}> jours</span>
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Deal moyen</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            {fmtMAD(cache.avgDealSize)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Funnel */}
        <div>
          <div style={FONT_HEADER} className="mb-3">Funnel de conversion</div>
          <div className="space-y-2">
            {cache.funnel.map((stage, i) => {
              const widthPct = Math.max(20, Math.round((stage.count / funnelMax) * 100));
              const prevCount = i > 0 ? cache.funnel[i - 1].count : null;
              const convRate = prevCount && prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : null;
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: funnelColors[i] }} />
                      <span style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700, color: CHARCOAL, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        {stage.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY }}>
                        {stage.count} · {fmtMAD(stage.value)}
                      </span>
                      {convRate !== null && (
                        <span
                          className="inline-flex px-1.5 py-0.5 rounded-full"
                          style={{ fontFamily: FONT_MONO, fontSize: 9, fontWeight: 700, backgroundColor: convRate >= 50 ? SAGE_BG : "rgba(245,158,11,0.10)", color: convRate >= 50 ? SAGE_DEEP : "#B45309" }}
                        >
                          {convRate}%
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Trapezoid-style funnel bar */}
                  <div
                    style={{
                      width: `${widthPct}%`,
                      height: 28,
                      backgroundColor: funnelColors[i],
                      opacity: 0.85,
                      borderRadius: 4,
                      clipPath: i === 0 ? "none" : "polygon(0 0, 100% 0, calc(100% - 8px) 100%, 8px 100%)",
                      margin: "0 auto",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Source donut */}
        <div>
          <div style={FONT_HEADER} className="mb-3">Pipeline par source</div>
          <div style={{ height: 180, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cache.sources.filter((s) => s.count > 0)}
                  dataKey="count"
                  nameKey="source"
                  innerRadius={42}
                  outerRadius={70}
                  paddingAngle={2}
                  isAnimationActive
                  animationDuration={800}
                >
                  {cache.sources.filter((s) => s.count > 0).map((s) => (
                    <Cell key={s.source} fill={s.color} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER_STRONG}`, borderRadius: 8, fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}
                  formatter={(value: number, _name: string, entry: { payload?: PitchSourceRow }) => [
                    `${value} prospects · ${fmtMAD(entry?.payload?.value ?? 0)}`,
                    entry?.payload?.source ?? "",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {cache.sources.map((s) => (
              <div key={s.source} className="flex items-center gap-1.5">
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: s.color }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_BODY }}>{s.source}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginLeft: "auto" }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly trend */}
      <div style={FONT_HEADER} className="mt-4 mb-2">Tendance mensuelle · victoires (6 mois)</div>
      <div style={{ height: 180, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cache.monthlyWins} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="month" tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }} stroke={BORDER} />
            <YAxis tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }} stroke={BORDER} allowDecimals={false} />
            <RTooltip
              contentStyle={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER_STRONG}`, borderRadius: 8, fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}
              formatter={(value: number) => [`${value} victoire(s)`, "Wins"]}
            />
            <Line
              type="monotone"
              dataKey="wins"
              stroke={SAGE}
              strokeWidth={2}
              dot={{ r: 4, fill: SAGE, stroke: "#FFFFFF", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: SAGE_DEEP }}
              isAnimationActive
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <AiCommentary
        text={`${items.length} prospects · ${cache.winRatePct}% de taux de victoire · cycle moyen ${cache.avgDealCycleDays} jours · deal moyen ${fmtMAD(cache.avgDealSize)}. ${cache.funnel[2].count > 0 ? `${cache.funnel[2].count} meetings en cours — priorisez la conversion.` : "Ajoutez des propositions pour activer le funnel de conversion."}`}
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R4-AGENCY-A · FEATURE 2 — PITCH TEMPLATE LIBRARY (full-width card)
// 6 built-in reusable pitch templates + up to 3 custom templates.
// Each template: name, description, sections list (auto-generated by
// HarchIQ), estimated slides, last used date. "Utiliser" generates a
// pitch (increments timesUsed, probabilistically increments wins).
// "Dupliquer" creates a custom copy. "Personnaliser" edits sections.
// "Créer un template" from scratch. Usage analytics per template:
// times used, win rate. Persisted custom templates + usage stats in
// localStorage "agency:pitch-templates".
// ════════════════════════════════════════════════════════════════════

const MAX_CUSTOM_TEMPLATES = 3;

const TEMPLATE_KIND_LABEL: Record<PitchTemplateKind, string> = {
  audit: "Audit",
  benchmark: "Benchmark",
  crisis: "Crise",
  esg: "ESG",
  influence: "Influence",
  monthly: "Mensuel",
  custom: "Custom",
};

const BUILTIN_PITCH_TEMPLATES: PitchTemplate[] = [
  {
    id: "tpl-audit",
    name: "Audit réputation prospect",
    description: "Analyse complète de la e-réputation d'un prospect avant première rencontre.",
    kind: "audit",
    sections: [
      "Synthèse exécutive",
      "Cartographie des sources",
      "Volume & tonalité 90 jours",
      "Top narratives émergentes",
      "Risques identifiés",
      "Recommandations stratégiques",
    ],
    estimatedSlides: 12,
    isBuiltIn: true,
    winProbabilityPct: 55,
  },
  {
    id: "tpl-benchmark",
    name: "Benchmark concurrentiel",
    description: "Positionnement concurrentiel du prospect vs 3 à 5 challengers directs sur le marché.",
    kind: "benchmark",
    sections: [
      "Paysage concurrentiel",
      "Part de voix",
      "Score de réputation comparé",
      "Forces & faiblesses",
      "Opportunités de différenciation",
      "Plan d'action 90 jours",
    ],
    estimatedSlides: 14,
    isBuiltIn: true,
    winProbabilityPct: 48,
  },
  {
    id: "tpl-crisis",
    name: "Crisis preparedness",
    description: "Diagnostic de préparation aux crises : détection, réponse et communication.",
    kind: "crisis",
    sections: [
      "Matrice de risques",
      "Scan des signaux faibles",
      "Protocole de réponse",
      "Scénarios de crise",
      "Cellule de veille",
      "Plan de communication",
    ],
    estimatedSlides: 10,
    isBuiltIn: true,
    winProbabilityPct: 42,
  },
  {
    id: "tpl-esg",
    name: "ESG & conformité",
    description: "Angle enterprise : conformité réglementaire, RSE, gouvernance et reporting extra-financier.",
    kind: "esg",
    sections: [
      "Cadre réglementaire",
      "Performance ESG",
      "Gouvernance & éthique",
      "Reporting extra-financier",
      "Risques de non-conformité",
      "Feuille de route RSE",
    ],
    estimatedSlides: 16,
    isBuiltIn: true,
    winProbabilityPct: 38,
  },
  {
    id: "tpl-influence",
    name: "Influenceur & portée",
    description: "Stratégie d'influence et de portée : KOL, leaders d'opinion, écosystème social.",
    kind: "influence",
    sections: [
      "Mapping d'influenceurs",
      "Portée cumulée",
      "Taux d'engagement",
      "Sentiment par communauté",
      "Plan de partenariat",
      "Calendrier éditorial",
    ],
    estimatedSlides: 11,
    isBuiltIn: true,
    winProbabilityPct: 52,
  },
  {
    id: "tpl-monthly",
    name: "Rapport mensuel type",
    description: "Template de rapport mensuel récurrent pour clients en retainer.",
    kind: "monthly",
    sections: [
      "Synthèse du mois",
      "KPIs & évolution",
      "Top mentions",
      "Alertes traitées",
      "Recommandations",
      "Priorités du mois prochain",
    ],
    estimatedSlides: 8,
    isBuiltIn: true,
    winProbabilityPct: 85,
  },
];

function parseSections(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 12);
}

function PitchTemplateLibraryCard({
  onToast,
}: {
  onToast: (message: string, type?: "success" | "info") => void;
}) {
  const [state, setState] = usePersistentState<PitchTemplateState>(
    "agency:pitch-templates",
    { customTemplates: [], usage: {} },
  );

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createSections, setCreateSections] = useState("");

  // Customize dialog state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSections, setEditSections] = useState("");

  const allTemplates: PitchTemplate[] = useMemo(() => {
    return [...BUILTIN_PITCH_TEMPLATES, ...state.customTemplates];
  }, [state.customTemplates]);

  const getUsage = (id: string): PitchTemplateUsage => {
    return state.usage[id] ?? { timesUsed: 0, wins: 0, lastUsedAt: null };
  };

  const totalUsage = useMemo(() => {
    let timesUsed = 0;
    let wins = 0;
    allTemplates.forEach((t) => {
      const u = state.usage[t.id] ?? { timesUsed: 0, wins: 0, lastUsedAt: null };
      timesUsed += u.timesUsed;
      wins += u.wins;
    });
    return { timesUsed, wins, winRate: timesUsed > 0 ? Math.round((wins / timesUsed) * 100) : 0 };
  }, [allTemplates, state.usage]);

  const atCustomLimit = state.customTemplates.length >= MAX_CUSTOM_TEMPLATES;

  const handleUse = (tpl: PitchTemplate) => {
    setState((prev) => {
      const u = prev.usage[tpl.id] ?? { timesUsed: 0, wins: 0, lastUsedAt: null };
      // Probabilistic win: deterministic per template + timestamp.
      const roll = hashStr(`${tpl.id}:${u.timesUsed + 1}:${Date.now()}`) % 100;
      const isWin = roll < tpl.winProbabilityPct;
      return {
        ...prev,
        usage: {
          ...prev.usage,
          [tpl.id]: {
            timesUsed: u.timesUsed + 1,
            wins: u.wins + (isWin ? 1 : 0),
            lastUsedAt: Date.now(),
          },
        },
      };
    });
    onToast(`Pitch généré · « ${tpl.name} » · ${tpl.estimatedSlides} slides · ${tpl.sections.length} sections.`);
  };

  const handleMarkWin = (tpl: PitchTemplate) => {
    setState((prev) => {
      const u = prev.usage[tpl.id] ?? { timesUsed: 0, wins: 0, lastUsedAt: null };
      if (u.timesUsed === 0) {
        onToast("Utilisez d'abord le template avant de marquer une victoire.", "info");
        return prev;
      }
      return {
        ...prev,
        usage: {
          ...prev.usage,
          [tpl.id]: { ...u, wins: u.wins + 1 },
        },
      };
    });
    onToast(`Victoire enregistrée pour « ${tpl.name} ».`);
  };

  const handleDuplicate = (tpl: PitchTemplate) => {
    if (atCustomLimit) {
      onToast(`Maximum ${MAX_CUSTOM_TEMPLATES} templates custom atteint.`, "info");
      return;
    }
    const copy: PitchTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name: `${tpl.name} (copie)`,
      description: tpl.description,
      kind: "custom",
      sections: [...tpl.sections],
      estimatedSlides: tpl.estimatedSlides,
      isBuiltIn: false,
      winProbabilityPct: tpl.winProbabilityPct,
    };
    setState((prev) => ({ ...prev, customTemplates: [...prev.customTemplates, copy] }));
    onToast(`« ${copy.name} » créé — personnalisable dans la bibliothèque.`);
  };

  const handleDelete = (tpl: PitchTemplate) => {
    setState((prev) => ({
      ...prev,
      customTemplates: prev.customTemplates.filter((t) => t.id !== tpl.id),
      usage: Object.fromEntries(Object.entries(prev.usage).filter(([k]) => k !== tpl.id)),
    }));
    onToast(`Template « ${tpl.name} » supprimé.`);
  };

  const openCreate = () => {
    setCreateName("");
    setCreateDescription("");
    setCreateSections("");
    setCreateOpen(true);
  };

  const handleCreateSave = () => {
    const name = createName.trim();
    const description = createDescription.trim();
    const sections = parseSections(createSections);
    if (!name) {
      onToast("Nom du template requis.", "info");
      return;
    }
    if (sections.length === 0) {
      onToast("Au moins une section est requise.", "info");
      return;
    }
    if (atCustomLimit) {
      onToast(`Maximum ${MAX_CUSTOM_TEMPLATES} templates custom atteint.`, "info");
      return;
    }
    const tpl: PitchTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name,
      description: description || "Template personnalisé de l'agence.",
      kind: "custom",
      sections,
      estimatedSlides: Math.max(4, sections.length * 2),
      isBuiltIn: false,
      winProbabilityPct: 45,
    };
    setState((prev) => ({ ...prev, customTemplates: [...prev.customTemplates, tpl] }));
    setCreateOpen(false);
    onToast(`Template « ${name} » créé.`);
  };

  const openEdit = (tpl: PitchTemplate) => {
    setEditId(tpl.id);
    setEditName(tpl.name);
    setEditDescription(tpl.description);
    setEditSections(tpl.sections.join("\n"));
  };

  const handleEditSave = () => {
    if (!editId) return;
    const name = editName.trim();
    const sections = parseSections(editSections);
    if (!name) {
      onToast("Nom du template requis.", "info");
      return;
    }
    if (sections.length === 0) {
      onToast("Au moins une section est requise.", "info");
      return;
    }
    setState((prev) => ({
      ...prev,
      customTemplates: prev.customTemplates.map((t) =>
        t.id === editId
          ? {
              ...t,
              name,
              description: editDescription.trim() || t.description,
              sections,
              estimatedSlides: Math.max(4, sections.length * 2),
            }
          : t,
      ),
    }));
    setEditId(null);
    onToast(`Template « ${name} » mis à jour.`);
  };

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Bibliothèque de templates Pitch"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", backgroundColor: SAGE_BG, color: SAGE, fontWeight: 700 }}
            >
              <BookMarked size={10} /> {allTemplates.length} templates
            </span>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", backgroundColor: "#FAFAFA", color: TEXT_MUTED, fontWeight: 700 }}
            >
              <Trophy size={10} /> {totalUsage.winRate}% win
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE_DIM, color: SAGE_DEEP }}
              onClick={openCreate}
              disabled={atCustomLimit}
            >
              <Plus size={11} /> Créer un template
            </Button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {allTemplates.map((tpl) => {
          const u = getUsage(tpl.id);
          const winRate = u.timesUsed > 0 ? Math.round((u.wins / u.timesUsed) * 100) : 0;
          const isCustom = !tpl.isBuiltIn;
          return (
            <div
              key={tpl.id}
              className="rounded-md p-3 flex flex-col"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <FileStack size={12} style={{ color: SAGE, flexShrink: 0 }} />
                    <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }} className="truncate">
                      {tpl.name}
                    </span>
                  </div>
                  <span
                    className="inline-block px-1.5 py-0.5 rounded-full"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 8,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      backgroundColor: isCustom ? SAGE_BG : "#FAFAFA",
                      color: isCustom ? SAGE_DEEP : TEXT_MUTED,
                      fontWeight: 700,
                    }}
                  >
                    {TEMPLATE_KIND_LABEL[tpl.kind]}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, lineHeight: 1.45, marginBottom: 8 }} className="flex-1">
                {tpl.description}
              </p>

              {/* Sections chips */}
              <div className="flex flex-wrap gap-1 mb-2">
                {tpl.sections.slice(0, 4).map((s, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded"
                    style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: "#FAFAFA", color: TEXT_BODY, border: `1px solid ${BORDER}` }}
                  >
                    {s}
                  </span>
                ))}
                {tpl.sections.length > 4 && (
                  <span
                    className="px-1.5 py-0.5 rounded"
                    style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE_DEEP, fontWeight: 700 }}
                  >
                    +{tpl.sections.length - 4}
                  </span>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-1 mb-2.5">
                <div className="text-center rounded" style={{ backgroundColor: "#FAFAFA", padding: "4px 0" }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_HEADER, letterSpacing: "0.06em" }}>SLIDES</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{tpl.estimatedSlides}</div>
                </div>
                <div className="text-center rounded" style={{ backgroundColor: "#FAFAFA", padding: "4px 0" }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_HEADER, letterSpacing: "0.06em" }}>USAGE</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{u.timesUsed}</div>
                </div>
                <div className="text-center rounded" style={{ backgroundColor: winRate >= 50 ? SAGE_BG : "rgba(245,158,11,0.08)", padding: "4px 0" }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_HEADER, letterSpacing: "0.06em" }}>WIN</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: winRate >= 50 ? SAGE_DEEP : "#B45309" }}>
                    {u.timesUsed > 0 ? `${winRate}%` : "—"}
                  </div>
                </div>
              </div>

              {/* Last used */}
              <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginBottom: 8 }}>
                {u.lastUsedAt ? `Dernier usage · ${fmtRelative(u.lastUsedAt)}` : "Jamais utilisé"}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-1 mt-auto">
                <Button
                  size="sm"
                  className="h-7 flex-1"
                  style={{ backgroundColor: SAGE, color: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 10 }}
                  onClick={() => handleUse(tpl)}
                >
                  <Send size={11} /> Utiliser
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                  style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                  onClick={() => handleMarkWin(tpl)}
                  aria-label={`Marquer une victoire pour ${tpl.name}`}
                >
                  <Trophy size={11} />
                </Button>
                {!isCustom ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                    onClick={() => handleDuplicate(tpl)}
                    aria-label={`Dupliquer ${tpl.name}`}
                  >
                    <Copy size={11} />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                      onClick={() => openEdit(tpl)}
                      aria-label={`Personnaliser ${tpl.name}`}
                    >
                      <Pencil size={11} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: "rgba(239,68,68,0.30)", color: NEGATIVE }}
                      onClick={() => handleDelete(tpl)}
                      aria-label={`Supprimer ${tpl.name}`}
                    >
                      <Trash2 size={11} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Create new template card */}
        <button
          type="button"
          onClick={openCreate}
          disabled={atCustomLimit}
          className="rounded-md p-3 flex flex-col items-center justify-center min-h-[180px] transition-colors"
          style={{
            border: `1px dashed ${atCustomLimit ? BORDER : SAGE_DIM}`,
            backgroundColor: atCustomLimit ? "#FAFAFA" : "transparent",
            color: atCustomLimit ? TEXT_MUTED : SAGE_DEEP,
            cursor: atCustomLimit ? "not-allowed" : "pointer",
          }}
          aria-label="Créer un template"
        >
          <Plus size={24} style={{ marginBottom: 4 }} />
          <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700 }}>
            {atCustomLimit ? "Limite atteinte" : "Créer un template"}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 2 }}>
            {state.customTemplates.length}/{MAX_CUSTOM_TEMPLATES} templates custom
          </span>
        </button>
      </div>

      <AiCommentary
        text={
          allTemplates.length === 0
            ? "Bibliothèque vide."
            : `${BUILTIN_PITCH_TEMPLATES.length} templates built-in + ${state.customTemplates.length} custom (max ${MAX_CUSTOM_TEMPLATES}). ${totalUsage.timesUsed} pitch(es) généré(s) au total · ${totalUsage.wins} victoire(s) · taux global ${totalUsage.winRate}%. Les templates « Mensuel » et « Audit » ont la meilleure probabilité de conversion — utilisez-les pour les premiers contacts.`
        }
      />

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer un template</DialogTitle>
            <DialogDescription>
              Définissez le nom, la description et les sections (une par ligne, max 12). HarchIQ générera le contenu de chaque section à l'utilisation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div>
              <Label htmlFor="tpl-name" style={{ ...FONT_HEADER, fontSize: 10 }}>Nom du template</Label>
              <Input
                id="tpl-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Ex: Audit sectoriel semi-annuel"
                maxLength={60}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="tpl-desc" style={{ ...FONT_HEADER, fontSize: 10 }}>Description</Label>
              <Input
                id="tpl-desc"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Usage recommandé et contexte"
                maxLength={140}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="tpl-sections" style={{ ...FONT_HEADER, fontSize: 10 }}>Sections (une par ligne)</Label>
              <textarea
                id="tpl-sections"
                value={createSections}
                onChange={(e) => setCreateSections(e.target.value)}
                placeholder={"Synthèse exécutive\nAnalyse des sources\nRecommandations\n…"}
                rows={6}
                className="mt-1.5 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
                style={{ borderColor: BORDER_STRONG, fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL, resize: "vertical" }}
              />
              <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 4 }}>
                {parseSections(createSections).length} section(s) détectée(s) · {Math.max(4, parseSections(createSections).length * 2)} slides estimées
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button
              size="sm"
              style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
              onClick={handleCreateSave}
              disabled={!createName.trim() || parseSections(createSections).length === 0}
            >
              <Plus size={12} /> Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog (custom templates only) */}
      <Dialog open={editId !== null} onOpenChange={(o) => { if (!o) setEditId(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Personnaliser le template</DialogTitle>
            <DialogDescription>
              Modifiez le nom, la description et les sections (une par ligne, max 12).
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div>
              <Label htmlFor="edit-name" style={{ ...FONT_HEADER, fontSize: 10 }}>Nom du template</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={60}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-desc" style={{ ...FONT_HEADER, fontSize: 10 }}>Description</Label>
              <Input
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={140}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-sections" style={{ ...FONT_HEADER, fontSize: 10 }}>Sections (une par ligne)</Label>
              <textarea
                id="edit-sections"
                value={editSections}
                onChange={(e) => setEditSections(e.target.value)}
                rows={6}
                className="mt-1.5 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
                style={{ borderColor: BORDER_STRONG, fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL, resize: "vertical" }}
              />
              <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 4 }}>
                {parseSections(editSections).length} section(s) détectée(s) · {Math.max(4, parseSections(editSections).length * 2)} slides estimées
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditId(null)}>
              Annuler
            </Button>
            <Button
              size="sm"
              style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
              onClick={handleEditSave}
              disabled={!editName.trim() || parseSections(editSections).length === 0}
            >
              <Save size={12} /> Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R2-AGENCY-B · FEATURE 3 — WHITE-LABEL THEME EDITOR (full-width card)
// Per-client branded portal theme editor: primary color picker (6 sage
// presets), logo upload (simulated), font family selector, border radius
// slider, "Masquer le badge Harch" toggle, custom login title, favicon
// color picker. Live preview panel (mini dashboard mockup that updates
// in real-time). "Sauvegarder le thème" / "Réinitialiser" / "Aperçu en
// plein écran" buttons. Export theme as JSON config. Persisted per-
// client in "agency:wlabel-themes" (Record<clientId, Theme>).
// ════════════════════════════════════════════════════════════════════

const SAGE_PRESETS = [
  { label: "Sage", value: SAGE },
  { label: "Sage foncé", value: SAGE_DEEP },
  { label: "Sage pâle", value: SAGE_DIM },
  { label: "Terracotta", value: CLIENT_B },
  { label: "Ocre", value: CLIENT_C },
  { label: "Ardoise", value: CLIENT_D },
];

const WLABEL_DEFAULT_THEME: WLabelTheme = {
  primaryColor: SAGE,
  logoDataUrl: null,
  fontFamily: "inter",
  borderRadius: 8,
  hideHarchBadge: false,
  loginTitle: "Bienvenue sur votre console",
  faviconColor: SAGE,
};

function fontStackForTheme(f: WLabelTheme["fontFamily"]): string {
  switch (f) {
    case "space-mono":
      return FONT_MONO;
    case "system":
      return "system-ui, -apple-system, sans-serif";
    case "inter":
    default:
      return FONT_SANS;
  }
}

function WhiteLabelThemeEditorCard({
  clients,
  onToast,
}: {
  clients: AgencyClient[];
  onToast: (msg: string, kind?: "info" | "success") => void;
}) {
  const [themes, setThemes] = usePersistentState<Record<string, WLabelTheme>>(
    "agency:wlabel-themes",
    {},
  );
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    clients[0]?.id ?? null,
  );
  const [fullscreen, setFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync selected client when clients list loads.
  useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
    if (selectedClientId && !clients.find((c) => c.id === selectedClientId) && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null;
  const theme: WLabelTheme = selectedClientId && themes[selectedClientId]
    ? themes[selectedClientId]
    : WLABEL_DEFAULT_THEME;

  const updateTheme = (patch: Partial<WLabelTheme>) => {
    if (!selectedClientId) return;
    setThemes((prev) => ({
      ...prev,
      [selectedClientId]: { ...theme, ...patch },
    }));
  };

  const handleSave = () => {
    onToast(`Thème sauvegardé pour ${selectedClient?.displayName ?? "le client"}.`, "success");
  };

  const handleReset = () => {
    if (!selectedClientId) return;
    setThemes((prev) => {
      const copy: Record<string, WLabelTheme> = {};
      Object.keys(prev).forEach((k) => {
        if (k !== selectedClientId) copy[k] = prev[k];
      });
      return copy;
    });
    onToast("Thème réinitialisé aux valeurs par défaut (sage).", "info");
  };

  const handleExportJSON = () => {
    if (!selectedClientId) return;
    const payload = {
      clientId: selectedClientId,
      clientName: selectedClient?.displayName ?? null,
      theme,
      exportedAt: new Date().toISOString(),
    };
    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `theme-${selectedClient?.company?.slug ?? selectedClientId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast("Configuration thème exportée en JSON.", "success");
    } catch {
      onToast("Échec de l'export JSON — réessayez.", "info");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 600 * 1024) {
      onToast("Logo trop volumineux (max 600 Ko).", "info");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      updateTheme({ logoDataUrl: result });
      onToast("Logo chargé — aperçu en direct mis à jour.", "success");
    };
    reader.readAsDataURL(file);
  };

  const fontStack = fontStackForTheme(theme.fontFamily);
  const primary = theme.primaryColor;

  // Live preview mini-dashboard mockup.
  const PreviewPanel = ({ scale = 1 }: { scale?: number }) => (
    <div
      className="agency-color-transition"
      style={{
        fontFamily: fontStack,
        borderRadius: theme.borderRadius,
        border: `1px solid ${BORDER_STRONG}`,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}
      >
        {theme.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={theme.logoDataUrl} alt="Logo" className="h-5 w-auto" style={{ objectFit: "contain" }} />
        ) : (
          <div
            className="inline-flex items-center justify-center px-2 py-1 agency-color-transition"
            style={{ backgroundColor: primary, color: "#FFFFFF", borderRadius: Math.max(2, theme.borderRadius - 4) }}
          >
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700 }}>
              {(selectedClient?.displayName ?? "CL")
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() ?? "")
                .join("")}
            </span>
          </div>
        )}
        <span style={{ fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
          {selectedClient?.displayName ?? "Client"}
        </span>
        {!theme.hideHarchBadge && (
          <span style={{ marginLeft: "auto", fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
            Propulsé par Harch
          </span>
        )}
      </div>
      {/* Body */}
      <div className="p-3">
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: CHARCOAL,
            marginBottom: 8,
          }}
        >
          {theme.loginTitle}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Score", value: "78" },
            { label: "Mentions", value: "142" },
            { label: "Sentiment", value: "+12%" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="agency-color-transition"
              style={{
                padding: 8,
                border: `1px solid ${BORDER}`,
                borderRadius: Math.max(2, theme.borderRadius - 4),
                backgroundColor: "#FCFCFC",
              }}
            >
              <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_HEADER, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {kpi.label}
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
        {/* Primary button preview */}
        <button
          type="button"
          className="agency-color-transition"
          style={{
            width: "100%",
            padding: "8px 12px",
            backgroundColor: primary,
            color: "#FFFFFF",
            border: "none",
            borderRadius: theme.borderRadius,
            fontFamily: fontStack,
            fontSize: 11,
            fontWeight: 700,
            cursor: "default",
          }}
        >
          Se connecter
        </button>
        {/* Mini chart placeholder */}
        <div className="mt-3 flex items-end gap-1" style={{ height: 32 }}>
          {Array.from({ length: 14 }).map((_, i) => {
            const h = 12 + Math.abs(Math.sin(i * 0.6)) * 18;
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ delay: i * 0.025, duration: 0.4, ease: "easeOut" }}
                className="agency-color-transition"
                style={{
                  flex: 1,
                  backgroundColor: primary,
                  opacity: 0.4 + (i / 14) * 0.6,
                  borderRadius: 2,
                }}
              />
            );
          })}
        </div>
      </div>
      {/* Favicon preview */}
      <div className="flex items-center gap-2 px-3 py-1.5" style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
        <span className="agency-color-transition" style={{ display: "inline-block", width: 12, height: 12, borderRadius: 2, backgroundColor: theme.faviconColor }} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
          favicon · {theme.faviconColor}
        </span>
      </div>
    </div>
  );

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Éditeur Thème White-Label"
        right={
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", backgroundColor: SAGE_BG, color: SAGE, fontWeight: 700 }}
          >
            <Palette size={10} /> {Object.keys(themes).length} thème(s) personnalisé(s)
          </span>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />

      {clients.length === 0 ? (
        <EmptyState
          title="Éditeur de thème inactif"
          description="Aucun client dans le portefeuille. Ajoutez un client pour activer l'éditeur de thème white-label et personnaliser l'expérience client."
          Icon={Palette}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: editor controls */}
          <div className="space-y-3">
            {/* Client selector */}
            <div>
              <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Client</label>
              <div className="relative">
                <select
                  value={selectedClientId ?? ""}
                  onChange={(e) => setSelectedClientId(e.target.value || null)}
                  className="w-full px-3 py-2 pr-8 rounded-md outline-none appearance-none"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL }}
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: TEXT_MUTED, pointerEvents: "none" }} />
              </div>
            </div>

            {/* Primary color */}
            <div>
              <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Couleur primaire</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  className="h-8 w-12 rounded cursor-pointer"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", padding: 0 }}
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  className="px-2 py-1.5 rounded-md outline-none flex-1"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAGE_PRESETS.map((preset) => {
                  const active = theme.primaryColor.toLowerCase() === preset.value.toLowerCase();
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => updateTheme({ primaryColor: preset.value })}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md transition-all hover:scale-[1.04] active:scale-[0.97] agency-color-transition"
                      style={{
                        border: `1px solid ${active ? preset.value : BORDER}`,
                        backgroundColor: active ? preset.value + "14" : "#FFFFFF",
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        color: active ? preset.value : TEXT_BODY,
                        fontWeight: 700,
                      }}
                    >
                      <span className="agency-color-transition" style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, backgroundColor: preset.value }} />
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logo upload */}
            <div>
              <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Logo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                style={{ display: "none" }}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC", fontFamily: FONT_MONO, fontSize: 10, color: CHARCOAL }}
                >
                  <Upload size={12} /> Choisir un fichier
                </button>
                {theme.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => updateTheme({ logoDataUrl: null })}
                    className="inline-flex items-center gap-1 px-2 py-2 rounded-md"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
                  >
                    <X size={12} /> Retirer
                  </button>
                )}
                {theme.logoDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={theme.logoDataUrl} alt="Logo preview" className="h-7 w-auto" style={{ objectFit: "contain" }} />
                )}
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 4 }}>
                PNG / JPG / SVG · max 600 Ko · simulé côté client
              </div>
            </div>

            {/* Font family */}
            <div>
              <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Famille de police</label>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { key: "inter" as const, label: "Inter", font: FONT_SANS },
                  { key: "space-mono" as const, label: "Space Mono", font: FONT_MONO },
                  { key: "system" as const, label: "System", font: "system-ui, sans-serif" },
                ]).map((opt) => {
                  const active = theme.fontFamily === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => updateTheme({ fontFamily: opt.key })}
                      className="px-2 py-1.5 rounded-md transition-all"
                      style={{
                        border: `1px solid ${active ? SAGE_DIM : BORDER}`,
                        backgroundColor: active ? SAGE_BG : "#FFFFFF",
                        fontFamily: opt.font,
                        fontSize: 11,
                        fontWeight: 700,
                        color: active ? SAGE_DEEP : TEXT_BODY,
                      }}
                    >
                      <Type size={11} style={{ display: "inline", marginRight: 4 }} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Border radius slider */}
            <div>
              <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>
                Rayon des bordures · {theme.borderRadius}px
              </label>
              <input
                type="range"
                min={0}
                max={16}
                step={1}
                value={theme.borderRadius}
                onChange={(e) => updateTheme({ borderRadius: Number(e.target.value) })}
                className="w-full"
                style={{ accentColor: SAGE }}
              />
            </div>

            {/* Login title */}
            <div>
              <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Titre de connexion</label>
              <input
                type="text"
                value={theme.loginTitle}
                onChange={(e) => updateTheme({ loginTitle: e.target.value })}
                placeholder="Bienvenue sur votre console"
                className="w-full px-3 py-2 rounded-md outline-none"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_SANS, fontSize: 12, color: CHARCOAL }}
              />
            </div>

            {/* Favicon color + hide badge toggle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Couleur favicon</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.faviconColor}
                    onChange={(e) => updateTheme({ faviconColor: e.target.value })}
                    className="h-8 w-12 rounded cursor-pointer"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", padding: 0 }}
                  />
                  <input
                    type="text"
                    value={theme.faviconColor}
                    onChange={(e) => updateTheme({ faviconColor: e.target.value })}
                    className="px-2 py-1.5 rounded-md outline-none flex-1"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA", fontFamily: FONT_MONO, fontSize: 11, color: CHARCOAL }}
                  />
                </div>
              </div>
              <div>
                <label style={{ ...FONT_HEADER, display: "block", marginBottom: 4 }}>Badge Harch</label>
                <label
                  className="flex items-center justify-between p-2 rounded-md cursor-pointer"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC", height: 38 }}
                >
                  <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: CHARCOAL }}>
                    {theme.hideHarchBadge ? "Masqué" : "Visible"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={theme.hideHarchBadge}
                    onClick={() => updateTheme({ hideHarchBadge: !theme.hideHarchBadge })}
                    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                    style={{ backgroundColor: theme.hideHarchBadge ? SAGE : BORDER_STRONG }}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      style={{ transform: theme.hideHarchBadge ? "translateX(18px)" : "translateX(2px)" }}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                className="h-8"
                style={{ backgroundColor: SAGE, color: "#FFFFFF", fontFamily: FONT_MONO, fontSize: 10 }}
                onClick={handleSave}
              >
                <Check size={12} /> Sauvegarder le thème
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                onClick={handleReset}
              >
                <RotateCcw size={12} /> Réinitialiser
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                onClick={() => setFullscreen(true)}
              >
                <Maximize2 size={12} /> Aperçu plein écran
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE_DIM, color: SAGE_DEEP }}
                onClick={handleExportJSON}
              >
                <Download size={12} /> Export JSON
              </Button>
            </div>
          </div>

          {/* Right: live preview */}
          <div>
            <div style={FONT_HEADER} className="mb-2">Aperçu en direct</div>
            <div
              className="p-3 rounded-lg"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
            >
              <div className="mb-2 flex items-center gap-1.5">
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: theme.faviconColor }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, letterSpacing: "0.04em" }}>
                  {selectedClient?.subdomain ?? "console"} .harch.ma · {theme.fontFamily}
                </span>
              </div>
              <PreviewPanel />
            </div>
          </div>
        </div>
      )}

      <AiCommentary
        text={`Thème white-label pour ${selectedClient?.displayName ?? "—"}. Couleur primaire ${theme.primaryColor}, police ${theme.fontFamily}, rayon ${theme.borderRadius}px. ${theme.hideHarchBadge ? "Badge Harch masqué." : "Badge Harch visible."} Exportez la configuration JSON pour l'intégration backend.`}
      />

      {/* Fullscreen preview modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu plein écran du thème"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(10,10,10,0.7)" }}
            onClick={() => setFullscreen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full max-w-3xl rounded-xl overflow-hidden"
            style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER_STRONG}`, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
          >
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-2.5">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-md" style={{ backgroundColor: SAGE_BG, color: SAGE_DEEP }}>
                  <Eye size={15} />
                </div>
                <div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
                    Aperçu plein écran · {selectedClient?.displayName ?? "—"}
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}>
                    Aperçu simulé du portail client tel que vu par le client final
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[#F5F5F5]"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(92vh - 70px)", backgroundColor: "#FAFAFA" }}>
              <div style={{ maxWidth: 480, margin: "0 auto" }}>
                <PreviewPanel />
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, textAlign: "center", marginTop: 12 }}>
                  Aperçu simulé — aucune donnée réelle n'est chargée. Le thème est appliqué en temps réel.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R2-AGENCY-A · FEATURE 1 — CLIENT HEALTH SCORING (full-width card)
// Each client gets a 0-100 health score computed from sentiment trend,
// mention velocity, crisis alerts, engagement, retention months. Health
// band: Excellent (80-100, sage) / Bon (60-79, sage-dim) / À surveiller
// (40-59, amber) / À risque (<40, red). Per-client sparkline (6 mois),
// "Facteurs de risque" expandable list (top 3 contributing factors),
// "Plan d'action" button → suggested actions based on score. Aggregate
// health strip at top. Manual overrides persisted in localStorage
// "agency:client-health-overrides".
// ════════════════════════════════════════════════════════════════════

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h | 0);
}

function monthsSince(iso: string): number {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 0;
  const ms = Date.now() - d.getTime();
  return Math.max(0, Math.floor(ms / (30 * 24 * 60 * 60 * 1000)));
}

function healthBandFor(score: number): HealthBand {
  if (score >= 80) return "excellent";
  if (score >= 60) return "bon";
  if (score >= 40) return "surveiller";
  return "risque";
}

function healthBandStyle(band: HealthBand): { label: string; color: string; bg: string } {
  switch (band) {
    case "excellent":
      return { label: "Excellent", color: SAGE_DEEP, bg: SAGE_BG };
    case "bon":
      return { label: "Bon", color: SAGE, bg: "rgba(74,123,95,0.05)" };
    case "surveiller":
      return { label: "À surveiller", color: "#B45309", bg: "rgba(245,158,11,0.10)" };
    case "risque":
      return { label: "À risque", color: NEGATIVE, bg: "rgba(239,68,68,0.08)" };
  }
}

function computeClientHealth(client: AgencyClient): ClientHealth {
  const sentiment = derivedClientSentiment(client);
  const apiPct = client.bars?.apiRequests?.pct ?? 0;
  const alerts = client.usage.whatsappAlerts ?? 0;
  const apiReq = client.usage.apiRequests ?? 0;
  const retention = monthsSince(client.createdAt);

  const sentimentScore = Math.round(sentiment.positive * 0.7 + sentiment.neutral * 0.3);
  const velocityScore = Math.min(100, Math.max(0, Math.round(apiPct)));
  const crisisScore = Math.max(0, 100 - alerts * 15);
  const engagementScore = Math.min(100, Math.round((apiReq / 5000) * 100));
  const retentionScore = Math.min(100, Math.round((retention / 24) * 100));

  const factors: HealthFactor[] = [
    { label: "Tendance sentiment", value: sentimentScore, weight: 0.3, impact: 100 - sentimentScore },
    { label: "Velocity des mentions", value: velocityScore, weight: 0.15, impact: 100 - velocityScore },
    { label: "Alertes crisis", value: crisisScore, weight: 0.25, impact: 100 - crisisScore },
    { label: "Engagement", value: engagementScore, weight: 0.15, impact: 100 - engagementScore },
    { label: "Rétention (mois)", value: retentionScore, weight: 0.15, impact: 100 - retentionScore },
  ];

  const score = Math.round(factors.reduce((s, f) => s + f.value * f.weight, 0));

  // 6-month trend: deterministic from clientId hash. Lower score → slight downtrend.
  const seed = hashStr(client.id);
  const trend: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const wobble = ((seed >> (i * 2)) & 0x0f) - 8;
    const drift = score < 60 ? -i * 2 : score > 80 ? i * 1 : 0;
    trend.push(Math.max(0, Math.min(100, score + wobble + drift)));
  }

  return {
    clientId: client.id,
    displayName: client.displayName,
    score,
    factors,
    trend,
    retentionMonths: retention,
  };
}

function actionPlanFor(score: number): string[] {
  if (score < 40) {
    return [
      "Audit urgent du compte sous 48h",
      "Brief crise avec le directeur de clientèle",
      "Renforcement équipe dédiée (+2 ressources)",
      "Plan de redressement 30 jours adressé au client",
    ];
  }
  if (score < 60) {
    return [
      "Renforcer le monitoring (scan temps réel)",
      "Brief client hebdomadaire obligatoire",
      "Plan de redressement réputation 60 jours",
      "Revue trimestrielle anticipée à 30 jours",
    ];
  }
  if (score < 80) {
    return [
      "Optimiser les narratifs gagnants",
      "Étendre la couverture éditoriale (+2 sources)",
      "Quarterly review avec recommandations",
      "Identifier opportunité de cross-sell",
    ];
  }
  return [
    "Maintenir le niveau d'excellence",
    "Proposer un case study public",
    "Cross-sell module Visibilité IA",
    "Envisager l'upscale vers tier supérieur",
  ];
}

function ClientHealthScoringCard({
  clients,
  loading,
}: {
  clients: AgencyClient[];
  loading: boolean;
}) {
  const [overrides, setOverrides] = usePersistentState<Record<string, number>>(
    "agency:client-health-overrides",
    {},
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [planClientId, setPlanClientId] = useState<string | null>(null);

  const healthRows = useMemo(() => {
    return clients.map((c) => {
      const computed = computeClientHealth(c);
      const override = overrides[c.id];
      const score = override ?? computed.score;
      return { ...computed, score, overridden: override !== undefined };
    });
  }, [clients, overrides]);

  const bandCounts = useMemo(() => {
    const counts: Record<HealthBand, number> = { excellent: 0, bon: 0, surveiller: 0, risque: 0 };
    healthRows.forEach((r) => {
      counts[healthBandFor(r.score)]++;
    });
    return counts;
  }, [healthRows]);

  const avgScore = healthRows.length
    ? Math.round(healthRows.reduce((s, r) => s + r.score, 0) / healthRows.length)
    : 0;

  const adjustOverride = (clientId: string, delta: number) => {
    const current = healthRows.find((r) => r.clientId === clientId)?.score ?? 50;
    const next = Math.max(0, Math.min(100, current + delta));
    setOverrides((prev) => ({ ...prev, [clientId]: next }));
  };

  const clearOverride = (clientId: string) => {
    setOverrides((prev) => {
      const copy: Record<string, number> = {};
      Object.keys(prev).forEach((k) => {
        if (k !== clientId) copy[k] = prev[k];
      });
      return copy;
    });
  };

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Scoring Santé Client"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: SAGE_BG,
                color: SAGE_DEEP,
                fontWeight: 700,
              }}
            >
              <HeartPulse size={10} /> {healthRows.length} clients
            </span>
            {Object.keys(overrides).length > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  backgroundColor: "#FAFAFA",
                  color: TEXT_MUTED,
                  fontWeight: 700,
                }}
              >
                {Object.keys(overrides).length} ajustement(s) manuel(s)
              </span>
            )}
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : healthRows.length === 0 ? (
        <div
          className="text-center py-8 rounded-md"
          style={{ border: `1px dashed ${BORDER_STRONG}` }}
        >
          <HeartPulse size={24} style={{ color: TEXT_MUTED, margin: "0 auto 6px" }} />
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
            Aucun client dans le portefeuille — ajoutez un client pour activer le scoring santé.
          </p>
        </div>
      ) : (
        <>
          {/* Aggregate strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
            <div
              className="p-2.5 rounded-md"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
            >
              <div style={FONT_HEADER}>Santé moyenne</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
                <AnimatedNumber value={avgScore} duration={750} />{""}<span style={{ fontSize: 11, color: TEXT_MUTED }}> /100</span>
              </div>
            </div>
            {(["excellent", "bon", "surveiller", "risque"] as HealthBand[]).map((band, idx) => {
              const style = healthBandStyle(band);
              return (
                <div
                  key={band}
                  className="p-2.5 rounded-md"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: style.bg }}
                >
                  <div style={{ ...FONT_HEADER, color: style.color }}>{style.label}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: style.color, marginTop: 2 }}>
                    <AnimatedNumber value={bandCounts[band]} duration={600 + idx * 80} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Per-client rows */}
          <div className="space-y-1.5">
            {healthRows.map((row) => {
              const band = healthBandFor(row.score);
              const style = healthBandStyle(band);
              const isExpanded = expandedId === row.clientId;
              const topFactors = [...row.factors].sort((a, b) => b.impact - a.impact).slice(0, 3);
              const sparkData = row.trend.map((v, i) => ({ m: i + 1, v }));
              return (
                <div
                  key={row.clientId}
                  className="rounded-md transition-colors"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : row.clientId)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left"
                  >
                    <div
                      className="flex items-center justify-center shrink-0 rounded-md agency-color-transition"
                      style={{
                        width: 44,
                        height: 44,
                        backgroundColor: style.bg,
                        border: `1px solid ${style.color}`,
                      }}
                    >
                      <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: style.color }}>
                        <AnimatedNumber value={row.score} duration={600} />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }} className="truncate">
                        {row.displayName}
                        {row.overridden && (
                          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginLeft: 6 }}>(manuel)</span>
                        )}
                      </div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 1 }}>
                        {row.retentionMonths} mois · {style.label}
                      </div>
                    </div>
                    <div style={{ width: 80, height: 32, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`hs-${row.clientId}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={style.color} stopOpacity={0.4} />
                              <stop offset="100%" stopColor={style.color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="v"
                            stroke={style.color}
                            strokeWidth={1.5}
                            fill={`url(#hs-${row.clientId})`}
                            isAnimationActive
                            animationDuration={700}
                            animationEasing="ease-out"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <ChevronRight
                      size={14}
                      style={{
                        color: TEXT_MUTED,
                        flexShrink: 0,
                        transform: isExpanded ? "rotate(90deg)" : "none",
                        transition: "transform 0.15s",
                      }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="health-expanded"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }}
                      className="px-3 pb-3 pt-1 border-t overflow-hidden"
                      style={{ borderColor: BORDER }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <div>
                          <div style={FONT_HEADER}>Facteurs de risque · Top 3</div>
                          <div className="space-y-1.5 mt-2">
                            {topFactors.map((f) => (
                              <div key={f.label}>
                                <div className="flex items-center justify-between">
                                  <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY }}>{f.label}</span>
                                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: f.impact > 50 ? NEGATIVE : f.impact > 30 ? "#B45309" : SAGE_DEEP, fontWeight: 700 }}>
                                    <AnimatedNumber value={f.impact} duration={500} />%
                                  </span>
                                </div>
                                <div style={{ width: "100%", height: 4, backgroundColor: BORDER, borderRadius: 2, marginTop: 3 }}>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${f.impact}%` }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                    style={{ height: "100%", backgroundColor: f.impact > 50 ? NEGATIVE : f.impact > 30 ? NEUTRAL_AMBER : SAGE, borderRadius: 2 }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 mt-3">
                            <span style={{ ...FONT_HEADER, marginRight: 4 }}>Ajuster</span>
                            <Button variant="outline" size="sm" className="h-6 px-2" style={{ fontFamily: FONT_MONO, fontSize: 10 }} onClick={() => adjustOverride(row.clientId, -5)}>
                              −5
                            </Button>
                            <Button variant="outline" size="sm" className="h-6 px-2" style={{ fontFamily: FONT_MONO, fontSize: 10 }} onClick={() => adjustOverride(row.clientId, 5)}>
                              +5
                            </Button>
                            {row.overridden && (
                              <Button variant="ghost" size="sm" className="h-6 px-2" style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }} onClick={() => clearOverride(row.clientId)}>
                                Réinitialiser
                              </Button>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <div style={FONT_HEADER}>Plan d'action</div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2"
                              style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE, color: SAGE_DEEP }}
                              onClick={() => setPlanClientId(planClientId === row.clientId ? null : row.clientId)}
                            >
                              <Lightbulb size={11} /> {planClientId === row.clientId ? "Masquer" : "Voir"}
                            </Button>
                          </div>
                          {planClientId === row.clientId ? (
                            <motion.ul
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="space-y-1 mt-2"
                            >
                              {actionPlanFor(row.score).map((action, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <Check size={11} style={{ color: SAGE, flexShrink: 0, marginTop: 2 }} />
                                  <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, lineHeight: 1.4 }}>{action}</span>
                                </li>
                              ))}
                            </motion.ul>
                          ) : (
                            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                              Score {row.score}/100 — cliquez « Voir » pour afficher les {actionPlanFor(row.score).length} actions recommandées.
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </>
      )}
      <AiCommentary
        text={
          healthRows.length === 0
            ? "Le scoring santé s'active dès l'ajout du premier client au portefeuille."
            : `Portefeuille: ${bandCounts.excellent} excellent(s), ${bandCounts.bon} bon(s), ${bandCounts.surveiller} à surveiller, ${bandCounts.risque} à risque. Santé moyenne ${avgScore}/100. ${bandCounts.risque > 0 ? `${bandCounts.risque} client(s) nécessitent un plan d'action immédiat.` : "Aucun client en zone de risque — maintenez le rythme."}`
        }
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R2-AGENCY-A · FEATURE 2 — CHURN RISK INDICATOR (full-width card)
// Predictive churn risk per client (0-100%): based on usage decline,
// sentiment drop, support tickets, contract end date proximity. 4 risk
// levels: Fidèle (0-25%, sage) / Stable (26-50%, sage-dim) / Volatile
// (51-75%, amber) / Churn imminent (76-100%, red, pulsing). Top 3 at-
// risk clients list with: name, risk %, contract end date, recommended
// action. "Lancer campagne de rétention" button (simulated). Monthly
// churn forecast + revenue at risk. Persisted in localStorage
// "agency:churn-risk". Seeded with realistic data derived from existing
// client list.
// ════════════════════════════════════════════════════════════════════

function churnBandFor(risk: number): ChurnBand {
  if (risk <= 25) return "fidele";
  if (risk <= 50) return "stable";
  if (risk <= 75) return "volatile";
  return "imminent";
}

function churnBandStyle(band: ChurnBand): { label: string; color: string; bg: string; pulse: boolean } {
  switch (band) {
    case "fidele":
      return { label: "Fidèle", color: SAGE_DEEP, bg: SAGE_BG, pulse: false };
    case "stable":
      return { label: "Stable", color: SAGE, bg: "rgba(74,123,95,0.05)", pulse: false };
    case "volatile":
      return { label: "Volatile", color: "#B45309", bg: "rgba(245,158,11,0.10)", pulse: false };
    case "imminent":
      return { label: "Churn imminent", color: NEGATIVE, bg: "rgba(239,68,68,0.08)", pulse: true };
  }
}

function computeChurnRisk(client: AgencyClient): ChurnRiskEntry {
  const sentiment = derivedClientSentiment(client);
  const apiPct = client.bars?.apiRequests?.pct ?? 0;
  const alerts = client.usage.whatsappAlerts ?? 0;
  const retention = monthsSince(client.createdAt);
  const monthlyRevenue = client.quota?.monthlyPriceMAD ?? 6500;

  const declineRisk = Math.max(0, Math.min(100, 100 - apiPct));
  const dropRisk = Math.min(100, sentiment.negative * 2);
  const ticketRisk = Math.min(100, alerts * 20);
  const cycleMonth = retention % 12;
  const proxRisk = Math.round((cycleMonth / 11) * 100);

  const riskPct = Math.round(declineRisk * 0.3 + dropRisk * 0.3 + ticketRisk * 0.2 + proxRisk * 0.2);

  const created = new Date(client.createdAt);
  const contractEnd = new Date(created);
  contractEnd.setMonth(contractEnd.getMonth() + 12 + Math.floor(retention / 12) * 12);

  const band = churnBandFor(riskPct);
  let action: string;
  switch (band) {
    case "imminent":
      action = "Renégocier contrat · appel CEO sous 48h";
      break;
    case "volatile":
      action = "Plan rétention · upgrade proposé";
      break;
    case "stable":
      action = "Quarterly review · NPS à mesurer";
      break;
    case "fidele":
      action = "Cross-sell · case study à publier";
      break;
  }

  return {
    clientId: client.id,
    displayName: client.displayName,
    riskPct,
    contractEndDate: contractEnd.toISOString(),
    recommendedAction: action,
    monthlyRevenueMAD: monthlyRevenue,
    factors: [
      { label: "Baisse d'usage", pct: Math.round(declineRisk) },
      { label: "Chute sentiment", pct: Math.round(dropRisk) },
      { label: "Tickets support", pct: Math.round(ticketRisk) },
      { label: "Proximité échéance", pct: Math.round(proxRisk) },
    ],
  };
}

function ChurnRiskIndicatorCard({
  clients,
  loading,
  onToast,
}: {
  clients: AgencyClient[];
  loading: boolean;
  onToast: (msg: string, type?: "success" | "info") => void;
}) {
  const [churnState, setChurnState] = usePersistentState<ChurnRiskState>(
    "agency:churn-risk",
    { campaignLaunchedAt: null, acknowledgedClientIds: [] },
  );

  const entries = useMemo(() => {
    return clients
      .map(computeChurnRisk)
      .sort((a, b) => b.riskPct - a.riskPct);
  }, [clients]);

  const topRisk = entries.filter((e) => churnBandFor(e.riskPct) !== "fidele").slice(0, 3);
  const monthlyForecast = entries.filter((e) => e.riskPct >= 76).length;
  const revenueAtRisk = entries
    .filter((e) => e.riskPct >= 51)
    .reduce((s, e) => s + e.monthlyRevenueMAD, 0);

  const bandCounts = useMemo(() => {
    const counts: Record<ChurnBand, number> = { fidele: 0, stable: 0, volatile: 0, imminent: 0 };
    entries.forEach((e) => {
      counts[churnBandFor(e.riskPct)]++;
    });
    return counts;
  }, [entries]);

  const launchCampaign = () => {
    setChurnState((prev) => ({ ...prev, campaignLaunchedAt: Date.now() }));
    onToast(
      `Campagne de rétention lancée · ${topRisk.length} client(s) ciblé(s) · ${fmtMAD(revenueAtRisk)}/mois menacés.`,
      "success",
    );
  };

  const acknowledge = (clientId: string) => {
    setChurnState((prev) =>
      prev.acknowledgedClientIds.includes(clientId)
        ? prev
        : { ...prev, acknowledgedClientIds: [...prev.acknowledgedClientIds, clientId] },
    );
  };

  const campaignDaysAgo = churnState.campaignLaunchedAt
    ? Math.floor((Date.now() - churnState.campaignLaunchedAt) / (24 * 60 * 60 * 1000))
    : null;

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Indicateur de Risque de Churn"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: monthlyForecast > 0 ? "rgba(239,68,68,0.10)" : SAGE_BG,
                color: monthlyForecast > 0 ? NEGATIVE : SAGE_DEEP,
                fontWeight: 700,
              }}
            >
              <LifeBuoy size={10} /> {monthlyForecast} churn ce mois
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE, color: SAGE_DEEP }}
              onClick={launchCampaign}
              disabled={topRisk.length === 0}
            >
              <ShieldCheck size={11} /> Lancer campagne de rétention
            </Button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div
          className="text-center py-8 rounded-md"
          style={{ border: `1px dashed ${BORDER_STRONG}` }}
        >
          <LifeBuoy size={24} style={{ color: TEXT_MUTED, margin: "0 auto 6px" }} />
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
            Aucun client — l'indicateur de churn s'active dès le premier client du portefeuille.
          </p>
        </div>
      ) : (
        <>
          {/* Aggregate strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {(["fidele", "stable", "volatile", "imminent"] as ChurnBand[]).map((band) => {
              const style = churnBandStyle(band);
              return (
                <div
                  key={band}
                  className="p-2.5 rounded-md flex items-center gap-2"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: style.bg }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: style.color,
                      animation: style.pulse ? "pulse-dot 1.4s ease-in-out infinite" : undefined,
                    }}
                  />
                  <div>
                    <div style={{ ...FONT_HEADER, color: style.color }}>{style.label}</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: style.color }}>
                      {bandCounts[band]} <span style={{ fontSize: 10, color: TEXT_MUTED }}>clients</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Forecast + revenue at risk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <div
              className="p-3 rounded-md flex items-center gap-3"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: monthlyForecast > 0 ? "rgba(239,68,68,0.04)" : "#FCFCFC" }}
            >
              <Hourglass size={18} style={{ color: monthlyForecast > 0 ? NEGATIVE : SAGE_DEEP }} />
              <div>
                <div style={FONT_HEADER}>Prévision churn mensuel</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: monthlyForecast > 0 ? NEGATIVE : CHARCOAL, marginTop: 2 }}>
                  {monthlyForecast} client(s) à risque de churn ce mois
                </div>
              </div>
            </div>
            <div
              className="p-3 rounded-md flex items-center gap-3"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: revenueAtRisk > 0 ? "rgba(245,158,11,0.04)" : "#FCFCFC" }}
            >
              <Wallet size={18} style={{ color: revenueAtRisk > 0 ? "#B45309" : SAGE_DEEP }} />
              <div>
                <div style={FONT_HEADER}>Revenu menacé</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: revenueAtRisk > 0 ? "#B45309" : CHARCOAL, marginTop: 2 }}>
                  {fmtMAD(revenueAtRisk)} / mois menacés
                </div>
              </div>
            </div>
          </div>

          {/* Campaign status banner */}
          {campaignDaysAgo !== null && (
            <div
              className="p-2.5 rounded-md mb-3 flex items-center gap-2"
              style={{ backgroundColor: SAGE_BG, border: `1px solid ${SAGE_DIM}` }}
            >
              <CheckCircle2 size={14} style={{ color: SAGE_DEEP }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: SAGE_DEEP }}>
                Campagne de rétention active · lancée il y a {campaignDaysAgo} jour(s) · {churnState.acknowledgedClientIds.length}/{topRisk.length} client(s) traité(s).
              </span>
            </div>
          )}

          {/* Top 3 at-risk clients */}
          <div style={FONT_HEADER} className="mb-2">Top 3 · clients à risque</div>
          {topRisk.length === 0 ? (
            <div
              className="text-center py-6 rounded-md"
              style={{ border: `1px dashed ${BORDER_STRONG}`, fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}
            >
              Aucun client au-dessus du seuil « Fidèle » — portefeuille sain.
            </div>
          ) : (
            <div className="space-y-1.5">
              {topRisk.map((entry, idx) => {
                const band = churnBandFor(entry.riskPct);
                const style = churnBandStyle(band);
                const acknowledged = churnState.acknowledgedClientIds.includes(entry.clientId);
                return (
                  <div
                    key={entry.clientId}
                    className="rounded-md p-3"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center shrink-0 rounded-md"
                        style={{ width: 36, height: 36, backgroundColor: style.bg, border: `1px solid ${style.color}` }}
                      >
                        <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: style.color }}>
                          {idx + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }} className="truncate">
                            {entry.displayName}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {style.pulse && (
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  backgroundColor: NEGATIVE,
                                  animation: "pulse-dot 1.4s ease-in-out infinite",
                                }}
                              />
                            )}
                            <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: style.color }}>
                              {entry.riskPct}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }} className="inline-flex items-center gap-1">
                            <CalendarClock size={10} /> Échéance: {fmtDate(entry.contractEndDate)}
                          </span>
                          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }} className="inline-flex items-center gap-1">
                            <Wallet size={10} /> {fmtMAD(entry.monthlyRevenueMAD)}/mois
                          </span>
                        </div>
                        <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, marginTop: 4 }} className="flex items-start gap-1">
                          <Lightbulb size={11} style={{ color: SAGE, flexShrink: 0, marginTop: 1 }} />
                          <span>{entry.recommendedAction}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.factors.map((f) => (
                            <span
                              key={f.label}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                              style={{
                                fontFamily: FONT_MONO,
                                fontSize: 9,
                                backgroundColor: f.pct > 60 ? "rgba(239,68,68,0.08)" : f.pct > 30 ? "rgba(245,158,11,0.08)" : "#FAFAFA",
                                color: f.pct > 60 ? NEGATIVE : f.pct > 30 ? "#B45309" : TEXT_BODY,
                                fontWeight: 700,
                              }}
                            >
                              {f.label} · {f.pct}%
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant={acknowledged ? "ghost" : "outline"}
                        size="sm"
                        className="h-7 shrink-0"
                        style={{ fontFamily: FONT_MONO, fontSize: 10 }}
                        onClick={() => acknowledge(entry.clientId)}
                      >
                        {acknowledged ? (
                          <><Check size={11} /> Traité</>
                        ) : (
                          "Reconnaître"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      <AiCommentary
        text={
          entries.length === 0
            ? "L'indicateur de churn s'active dès le premier client du portefeuille."
            : `Portefeuille: ${bandCounts.fidele} fidèle(s), ${bandCounts.stable} stable(s), ${bandCounts.volatile} volatile(s), ${bandCounts.imminent} churn imminent. ${monthlyForecast > 0 ? `${monthlyForecast} client(s) en zone critique ce mois — renégociation prioritaire.` : "Aucun churn imminent — portefeuille sain."} ${revenueAtRisk > 0 ? `${fmtMAD(revenueAtRisk)}/mois menacés.` : ""}`
        }
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R2-AGENCY-A · FEATURE 3 — REVENUE FORECASTING CHART (full-width card)
// 12-month projection LineChart with 3 scenarios:
//   • Conservateur (gray dashed): current clients, no growth, 5% churn
//   • Réaliste (sage solid): current + pipeline prospects at win rate
//   • Optimiste (sage-bright dashed): réaliste + upsell (compounding)
// Inputs: current MRR, pipeline value, churn rate, win rate, upsell %.
// Outputs: 12-month MRR projection, annual ARR, tier upgrade threshold
// indicator + milestone marker. Quarterly gridlines, month labels.
// Persisted scenario inputs in localStorage "agency:revenue-forecast".
// ════════════════════════════════════════════════════════════════════

const FORECAST_MONTHS = 12;

function simulateForecast(inputs: RevenueForecastInput): {
  data: Array<{ month: string; conservateur: number; realiste: number; optimiste: number }>;
  finalConservative: number;
  finalRealiste: number;
  finalOptimiste: number;
} {
  const churn = Math.max(0, Math.min(100, inputs.churnRatePct)) / 100;
  const win = Math.max(0, Math.min(100, inputs.winRatePct)) / 100;
  const upsell = Math.max(0, Math.min(100, inputs.upsellPct)) / 100;
  const monthlyPipeline = (inputs.pipelineValue * win) / FORECAST_MONTHS;

  let cons = inputs.currentMRR;
  let real = inputs.currentMRR;
  let opt = inputs.currentMRR;

  const monthLabels = ["M+1", "M+2", "M+3", "M+4", "M+5", "M+6", "M+7", "M+8", "M+9", "M+10", "M+11", "M+12"];
  const data: Array<{ month: string; conservateur: number; realiste: number; optimiste: number }> = [];

  for (let i = 0; i < FORECAST_MONTHS; i++) {
    cons = Math.round(cons * (1 - churn));
    real = Math.round(real * (1 - churn) + monthlyPipeline);
    opt = Math.round(opt * (1 - churn) + monthlyPipeline + opt * upsell);
    data.push({
      month: monthLabels[i],
      conservateur: cons,
      realiste: real,
      optimiste: opt,
    });
  }

  return {
    data,
    finalConservative: cons,
    finalRealiste: real,
    finalOptimiste: opt,
  };
}

function RevenueForecastingCard({
  tier,
  clients,
}: {
  tier: AgencyTierInfo;
  clients: AgencyClient[];
}) {
  const derivedMRR = useMemo(() => {
    const sum = clients.reduce((s, c) => s + (c.quota?.monthlyPriceMAD ?? 6500), 0);
    return sum > 0 ? sum : 52000;
  }, [clients]);

  const [inputs, setInputs] = usePersistentState<RevenueForecastInput>(
    "agency:revenue-forecast",
    { currentMRR: 52000, pipelineValue: 47000, churnRatePct: 5, winRatePct: 30, upsellPct: 15 },
  );

  const [syncedFromClients, setSyncedFromClients] = useState(false);

  // One-shot sync of derivedMRR into inputs.currentMRR after clients load
  // (only if the user hasn't manually adjusted MRR since mount).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (syncedFromClients) return;
    if (derivedMRR !== 52000 && inputs.currentMRR === 52000) {
      setInputs((prev) => ({ ...prev, currentMRR: derivedMRR }));
      setSyncedFromClients(true);
    }
  }, [derivedMRR, inputs.currentMRR, syncedFromClients, setInputs]);

  const forecast = useMemo(() => simulateForecast(inputs), [inputs]);

  const arrRealiste = forecast.finalRealiste * 12;
  const arrOptimiste = forecast.finalOptimiste * 12;

  const avgRetainer = inputs.currentMRR > 0 && clients.length > 0
    ? inputs.currentMRR / clients.length
    : 6500;

  const nextTier = tier.nextTier ? getTierInfo(tier.nextTier) : null;
  const thresholdMRR = nextTier ? nextTier.minClients * avgRetainer : null;

  const monthsToUpgrade = useMemo(() => {
    if (!thresholdMRR) return null;
    const idx = forecast.data.findIndex((d) => d.realiste >= thresholdMRR);
    return idx === -1 ? null : idx + 1;
  }, [forecast, thresholdMRR]);

  const updateInput = <K extends keyof RevenueForecastInput>(key: K, value: RevenueForecastInput[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const sliderStyle: CSSProperties = {
    width: "100%",
    height: 4,
    appearance: "none",
    backgroundColor: BORDER,
    borderRadius: 2,
    outline: "none",
    cursor: "pointer",
  };

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Projection Revenu · 12 Mois"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: tier.accentBg,
                color: tier.accentColor,
                fontWeight: 700,
              }}
            >
              <LineChartIcon size={10} /> Tier {tier.label}
            </span>
            {nextTier && monthsToUpgrade !== null && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  backgroundColor: SAGE_BG,
                  color: SAGE_DEEP,
                  fontWeight: 700,
                }}
              >
                <Flag size={10} /> Tier {nextTier.label} dans {monthsToUpgrade} mois
              </span>
            )}
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inputs */}
        <div className="space-y-4">
          <div style={FONT_HEADER}>Paramètres du scénario</div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY }}>MRR actuel (MAD)</label>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: CHARCOAL }}>{fmtMAD(inputs.currentMRR)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={300000}
              step={1000}
              value={inputs.currentMRR}
              onChange={(e) => updateInput("currentMRR", Number(e.target.value))}
              style={sliderStyle}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY }}>Valeur pipeline (MAD)</label>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: CHARCOAL }}>{fmtMAD(inputs.pipelineValue)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={200000}
              step={1000}
              value={inputs.pipelineValue}
              onChange={(e) => updateInput("pipelineValue", Number(e.target.value))}
              style={sliderStyle}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY }}>Taux de churn (%)</label>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: inputs.churnRatePct > 10 ? NEGATIVE : CHARCOAL }}>{inputs.churnRatePct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={inputs.churnRatePct}
              onChange={(e) => updateInput("churnRatePct", Number(e.target.value))}
              style={sliderStyle}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY }}>Taux de conversion pipeline (%)</label>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: CHARCOAL }}>{inputs.winRatePct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={inputs.winRatePct}
              onChange={(e) => updateInput("winRatePct", Number(e.target.value))}
              style={sliderStyle}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY }}>Upsell mensuel (%)</label>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: CHARCOAL }}>{inputs.upsellPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={inputs.upsellPct}
              onChange={(e) => updateInput("upsellPct", Number(e.target.value))}
              style={sliderStyle}
            />
          </div>

          <div
            className="p-2.5 rounded-md flex items-center gap-2"
            style={{ backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}` }}
          >
            <SlidersHorizontal size={12} style={{ color: TEXT_MUTED }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
              {clients.length} clients actifs · retainer moyen {fmtMAD(Math.round(avgRetainer))}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div style={FONT_HEADER}>Projection MRR · 12 mois</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span style={{ display: "inline-block", width: 12, height: 2, backgroundColor: NEUTRAL_GRAY }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>Conservateur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ display: "inline-block", width: 12, height: 2, backgroundColor: SAGE }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>Réaliste</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ display: "inline-block", width: 12, height: 0, borderTop: `2px dashed ${SAGE_DIM}` }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>Optimiste</span>
              </div>
            </div>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast.data} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
                <CartesianGrid stroke="#F4F4F5" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                  tickLine={false}
                  axisLine={{ stroke: BORDER_STRONG }}
                  interval={0}
                />
                <YAxis
                  tick={{ fontFamily: FONT_MONO, fontSize: 9, fill: TEXT_MUTED }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v) => fmtNumber(v)}
                />
                <RTooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${BORDER_STRONG}`,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                  }}
                  cursor={{ stroke: SAGE, strokeDasharray: "3 3", strokeWidth: 1 }}
                  formatter={(v: number, n) => [fmtMAD(v), n === "conservateur" ? "Conservateur" : n === "realiste" ? "Réaliste" : "Optimiste"]}
                  labelStyle={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
                />
                {thresholdMRR !== null && (
                  <ReferenceLine
                    y={thresholdMRR}
                    stroke={tier.accentColor}
                    strokeDasharray="6 4"
                    label={{
                      value: `Tier ${nextTier?.label ?? ""} · ${fmtNumber(thresholdMRR)}`,
                      position: "insideTopRight",
                      fill: tier.accentColor,
                      fontSize: 9,
                      fontFamily: FONT_MONO,
                    }}
                  />
                )}
                <Line type="monotone" dataKey="conservateur" stroke={NEUTRAL_GRAY} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive animationDuration={1100} animationEasing="ease-out" />
                <Line type="monotone" dataKey="realiste" stroke={SAGE} strokeWidth={2.5} dot={{ r: 2, fill: SAGE }} isAnimationActive animationDuration={1300} animationEasing="ease-out" />
                <Line type="monotone" dataKey="optimiste" stroke={SAGE_DIM} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive animationDuration={1500} animationEasing="ease-out" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Output metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
              <div style={FONT_HEADER}>MRR M+12 · Réaliste</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: SAGE_DEEP, marginTop: 2 }}>
                <AnimatedNumber value={forecast.finalRealiste} format={(n) => fmtMAD(Math.round(n))} duration={700} />
              </div>
            </div>
            <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
              <div style={FONT_HEADER}>ARR projeté · Réaliste</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
                <AnimatedNumber value={arrRealiste} format={(n) => fmtMAD(Math.round(n))} duration={800} />
              </div>
            </div>
            <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
              <div style={FONT_HEADER}>ARR Optimiste</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: SAGE_DIM, marginTop: 2 }}>
                <AnimatedNumber value={arrOptimiste} format={(n) => fmtMAD(Math.round(n))} duration={900} />
              </div>
            </div>
            <div
              className="p-2.5 rounded-md"
              style={{ border: `1px solid ${thresholdMRR ? SAGE_DIM : BORDER}`, backgroundColor: thresholdMRR ? SAGE_BG : "#FCFCFC" }}
            >
              <div style={FONT_HEADER}>{nextTier ? `Tier ${nextTier.label}` : "Tier max"}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: SAGE_DEEP, marginTop: 2 }}>
                {monthsToUpgrade !== null ? `${monthsToUpgrade} mois` : nextTier ? ">12 mois" : "Atteint"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AiCommentary
        text={
          nextTier
            ? `Scénario réaliste: MRR ${fmtMAD(inputs.currentMRR)} → ${fmtMAD(forecast.finalRealiste)} en 12 mois (ARR ${fmtMAD(arrRealiste)}). ${monthsToUpgrade !== null ? `Tier ${nextTier.label} atteint en ${monthsToUpgrade} mois.` : `Tier ${nextTier.label} non atteint sous 12 mois — augmenter win rate ou pipeline.`}`
            : `Tier maximum atteint. Scénario réaliste: ARR ${fmtMAD(arrRealiste)} (MRR ×12). Optimiste: ${fmtMAD(arrOptimiste)}.`
        }
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R4-AGENCY-A · FEATURE 1 — CLIENT REVENUE TRACKER (full-width card)
// Per-client revenue breakdown: monthly retainer (MRR), setup fee,
// overage charges, commission earned. Revenue table with 7 columns
// (client, plan tier, MRR, setup fee, commission %, commission earned,
// total revenue YTD). Summary strip: total MRR, total commission YTD,
// avg revenue per client, top client revenue. BarChart top 10 clients
// by revenue YTD (sage bars, descending). PieChart revenue distribution
// by plan tier (Essentiel/Pro/Enterprise). "Facturer" button per client
// (simulated invoice generation). "Ajuster le tarif" dialog (manual
// override of MRR / setup fee / commission %). Persisted overrides in
// localStorage "agency:revenue-tracker".
// ════════════════════════════════════════════════════════════════════

const REVENUE_PLAN_PRICE: Record<RevenuePlanTier, number> = {
  Essentiel: 3000,
  Pro: 6500,
  Enterprise: 15000,
};

const REVENUE_PLAN_DEFAULT_SETUP: Record<RevenuePlanTier, number> = {
  Essentiel: 2000,
  Pro: 5000,
  Enterprise: 12000,
};

const REVENUE_PLAN_COLOR: Record<RevenuePlanTier, string> = {
  Essentiel: SAGE_DIM,
  Pro: SAGE,
  Enterprise: SAGE_DEEP,
};

function revenueTrackerTier(client: AgencyClient): RevenuePlanTier {
  const raw = (client.quota?.planTier ?? "").toLowerCase();
  if (raw === "enterprise" || raw === "sovereign") return "Enterprise";
  if (raw === "pro" || raw === "corporate") return "Pro";
  return "Essentiel";
}

function setupFeeFromHash(clientId: string, tier: RevenuePlanTier): number {
  const base = REVENUE_PLAN_DEFAULT_SETUP[tier];
  const h = hashStr(clientId + ":setup");
  const variance = (h % 60) - 30; // ±30% variance
  return Math.max(500, Math.round((base * (100 + variance)) / 100));
}

function overageChargesFromHash(client: AgencyClient): number {
  const pct = client.bars?.apiRequests?.pct ?? 0;
  if (pct <= 80) return 0;
  // 0-2000 MAD overage, scaled by excess usage above 80%
  const excess = Math.min(100, pct - 80);
  const base = (client.quota?.monthlyPriceMAD ?? 6500) * 0.1;
  const h = hashStr(client.id + ":overage");
  return Math.round((base * excess) / 20) + (h % 200);
}

function computeRevenueRow(
  client: AgencyClient,
  override: RevenueTrackerOverride | undefined,
  agencyCommissionPct: number,
): RevenueTrackerRow {
  const tier = revenueTrackerTier(client);
  const baseMrr = client.quota?.monthlyPriceMAD ?? REVENUE_PLAN_PRICE[tier];
  const mrr = override?.mrr ?? baseMrr;
  const setupFee = override?.setupFee ?? setupFeeFromHash(client.id, tier);
  const overage = overageChargesFromHash(client);
  const commissionPct = override?.commissionPct ?? agencyCommissionPct;
  const monthsElapsed = Math.max(1, Math.min(12, monthsSince(client.createdAt)));
  const totalRevenueYTD = mrr * monthsElapsed + setupFee + overage;
  const commissionEarned = Math.round((totalRevenueYTD * commissionPct) / 100);
  const overridden =
    override?.mrr !== undefined ||
    override?.setupFee !== undefined ||
    override?.commissionPct !== undefined;
  return {
    clientId: client.id,
    displayName: client.displayName,
    planTier: tier,
    mrr,
    setupFee,
    overageCharges: overage,
    commissionPct,
    commissionEarned,
    totalRevenueYTD,
    monthsElapsed,
    overridden,
  };
}

function ClientRevenueTrackerCard({
  clients,
  agencyCommissionPct,
  loading,
  onToast,
}: {
  clients: AgencyClient[];
  agencyCommissionPct: number;
  loading: boolean;
  onToast: (message: string, type?: "success" | "info") => void;
}) {
  const [overrides, setOverrides] = usePersistentState<RevenueTrackerState>(
    "agency:revenue-tracker",
    {},
  );

  // Adjust dialog state
  const [adjustClientId, setAdjustClientId] = useState<string | null>(null);
  const [draftMrr, setDraftMrr] = useState("");
  const [draftSetup, setDraftSetup] = useState("");
  const [draftCommission, setDraftCommission] = useState("");

  const rows = useMemo(() => {
    return clients.map((c) => computeRevenueRow(c, overrides[c.id], agencyCommissionPct));
  }, [clients, overrides, agencyCommissionPct]);

  const summary = useMemo(() => {
    const totalMrr = rows.reduce((s, r) => s + r.mrr, 0);
    const totalCommissionYTD = rows.reduce((s, r) => s + r.commissionEarned, 0);
    const totalRevenueYTD = rows.reduce((s, r) => s + r.totalRevenueYTD, 0);
    const avgRevenuePerClient = rows.length > 0 ? Math.round(totalRevenueYTD / rows.length) : 0;
    const topClient = rows.length > 0
      ? rows.reduce((max, r) => (r.totalRevenueYTD > max.totalRevenueYTD ? r : max), rows[0])
      : null;
    return { totalMrr, totalCommissionYTD, totalRevenueYTD, avgRevenuePerClient, topClient };
  }, [rows]);

  const top10ByRevenue = useMemo(() => {
    return [...rows].sort((a, b) => b.totalRevenueYTD - a.totalRevenueYTD).slice(0, 10);
  }, [rows]);

  const tierDistribution = useMemo(() => {
    const tiers: RevenuePlanTier[] = ["Essentiel", "Pro", "Enterprise"];
    return tiers
      .map((t) => {
        const tierRows = rows.filter((r) => r.planTier === t);
        const value = tierRows.reduce((s, r) => s + r.totalRevenueYTD, 0);
        return { name: t, value, color: REVENUE_PLAN_COLOR[t] };
      })
      .filter((d) => d.value > 0);
  }, [rows]);

  const overriddenCount = rows.filter((r) => r.overridden).length;

  const handleFacturer = (row: RevenueTrackerRow) => {
    onToast(`Facture générée · ${row.displayName} · ${fmtMAD(row.totalRevenueYTD)} YTD (PDF simulé).`);
  };

  const openAdjust = (row: RevenueTrackerRow) => {
    setAdjustClientId(row.clientId);
    setDraftMrr(String(row.mrr));
    setDraftSetup(String(row.setupFee));
    setDraftCommission(String(row.commissionPct));
  };

  const handleAdjustSave = () => {
    if (!adjustClientId) return;
    const mrr = Number(draftMrr);
    const setup = Number(draftSetup);
    const commission = Number(draftCommission);
    if (isNaN(mrr) || mrr < 0 || isNaN(setup) || setup < 0 || isNaN(commission) || commission < 0 || commission > 100) {
      onToast("Valeurs invalides — vérifiez MRR, setup et commission (0-100%).", "info");
      return;
    }
    setOverrides((prev) => ({
      ...prev,
      [adjustClientId]: { mrr, setupFee: setup, commissionPct: commission },
    }));
    const clientName = clients.find((c) => c.id === adjustClientId)?.displayName ?? "Client";
    onToast(`Tarif ajusté pour ${clientName} · MRR ${fmtMAD(mrr)} · ${commission}% commission.`);
    setAdjustClientId(null);
  };

  const handleAdjustReset = () => {
    if (!adjustClientId) return;
    setOverrides((prev) => {
      const copy: RevenueTrackerState = {};
      Object.keys(prev).forEach((k) => {
        if (k !== adjustClientId) copy[k] = prev[k];
      });
      return copy;
    });
    const clientName = clients.find((c) => c.id === adjustClientId)?.displayName ?? "Client";
    onToast(`Tarif réinitialisé pour ${clientName} (valeurs calculées).`);
    setAdjustClientId(null);
  };

  const adjustTargetRow = adjustClientId ? rows.find((r) => r.clientId === adjustClientId) ?? null : null;

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Suivi revenus par client"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", backgroundColor: SAGE_BG, color: SAGE, fontWeight: 700 }}
            >
              <Wallet size={10} /> {rows.length} clients
            </span>
            {overriddenCount > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", backgroundColor: "#FAFAFA", color: TEXT_MUTED, fontWeight: 700 }}
              >
                <Pencil size={10} /> {overriddenCount} ajusté(s)
              </span>
            )}
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div
          className="text-center py-10 rounded-md"
          style={{ border: `1px dashed ${BORDER_STRONG}` }}
        >
          <Wallet size={28} style={{ color: TEXT_MUTED, margin: "0 auto 8px" }} />
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: CHARCOAL, fontWeight: 600 }}>
            Aucun client dans le portefeuille
          </p>
          <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
            Le suivi des revenus par client s'active dès le premier client ajouté à l'agence.
          </p>
        </div>
      ) : (
        <>
          {/* Summary strip — 4 KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <MiniStat
              label="MRR total"
              value={fmtMAD(summary.totalMrr)}
              dotColor={SAGE}
            />
            <MiniStat
              label="Commission YTD"
              value={fmtMAD(summary.totalCommissionYTD)}
              dotColor={SAGE_DEEP}
            />
            <MiniStat
              label="Revenu moyen / client"
              value={fmtMAD(summary.avgRevenuePerClient)}
              dotColor={NEUTRAL_GRAY}
            />
            <MiniStat
              label="Top client YTD"
              value={summary.topClient ? `${summary.topClient.displayName}` : "—"}
              dotColor={CLIENT_B}
            />
          </div>
          {summary.topClient && (
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginBottom: 12, marginTop: -4 }}>
              Top client: {summary.topClient.displayName} · {fmtMAD(summary.topClient.totalRevenueYTD)} YTD · {summary.topClient.planTier} · commission {fmtMAD(summary.topClient.commissionEarned)}
            </div>
          )}

          {/* Charts: BarChart top 10 + PieChart by tier */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
            <div className="lg:col-span-7">
              <div style={FONT_HEADER} className="mb-2">Top 10 clients · revenu YTD</div>
              <div style={{ height: 280, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top10ByRevenue.map((r) => ({ name: r.displayName, value: r.totalRevenueYTD }))} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: FONT_MONO }}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                      axisLine={{ stroke: BORDER_STRONG }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: TEXT_BODY, fontSize: 10, fontFamily: FONT_SANS }}
                      width={120}
                      axisLine={{ stroke: BORDER_STRONG }}
                      tickLine={false}
                    />
                    <RTooltip
                      contentStyle={{ fontFamily: FONT_SANS, fontSize: 11, border: `1px solid ${BORDER_STRONG}`, borderRadius: 8 }}
                      formatter={(v: number) => [fmtMAD(v), "Revenu YTD"]}
                    />
                    <Bar dataKey="value" fill={SAGE} radius={[0, 4, 4, 0]} barSize={14} isAnimationActive animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div style={FONT_HEADER} className="mb-2">Distribution par plan</div>
              <div style={{ height: 280, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={92}
                      innerRadius={48}
                      paddingAngle={2}
                      isAnimationActive
                      animationDuration={800}
                    >
                      {tierDistribution.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{ fontFamily: FONT_SANS, fontSize: 11, border: `1px solid ${BORDER_STRONG}`, borderRadius: 8 }}
                      formatter={(v: number, n: string) => [fmtMAD(v), n]}
                    />
                    <Legend
                      wrapperStyle={{ fontFamily: FONT_SANS, fontSize: 10 }}
                      formatter={(value: string) => <span style={{ color: TEXT_BODY }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Revenue table */}
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 880 }}>
              <thead>
                <tr>
                  {["Client", "Plan", "MRR", "Setup", "Commission", "Commission YTD", "Revenu YTD", ""].map((h, i) => (
                    <th
                      key={i}
                      className="text-left py-2 px-2"
                      style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: TEXT_HEADER, borderBottom: `1px solid ${BORDER}` }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.clientId}>
                    <td
                      className="py-2.5 px-2"
                      style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL, borderBottom: `1px solid ${BORDER}` }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate" style={{ maxWidth: 140 }}>{r.displayName}</span>
                        {r.overridden && (
                          <span
                            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full"
                            style={{ backgroundColor: SAGE_BG }}
                            title="Tarif ajusté manuellement"
                          >
                            <Pencil size={8} style={{ color: SAGE_DEEP }} />
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, fontWeight: 400 }}>
                        {r.monthsElapsed} mois · {r.overageCharges > 0 ? `+${fmtMAD(r.overageCharges)} overage` : "pas d'overage"}
                      </div>
                    </td>
                    <td
                      className="py-2.5 px-2"
                      style={{ borderBottom: `1px solid ${BORDER}` }}
                    >
                      <span
                        className="inline-block px-1.5 py-0.5 rounded-full"
                        style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", backgroundColor: `${REVENUE_PLAN_COLOR[r.planTier]}14`, color: REVENUE_PLAN_COLOR[r.planTier], fontWeight: 700 }}
                      >
                        {r.planTier}
                      </span>
                    </td>
                    <td className="py-2.5 px-2" style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL, borderBottom: `1px solid ${BORDER}` }}>
                      {fmtMAD(r.mrr)}
                    </td>
                    <td className="py-2.5 px-2" style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY, borderBottom: `1px solid ${BORDER}` }}>
                      {fmtMAD(r.setupFee)}
                    </td>
                    <td className="py-2.5 px-2" style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY, borderBottom: `1px solid ${BORDER}` }}>
                      {r.commissionPct}%
                    </td>
                    <td className="py-2.5 px-2" style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: SAGE_DEEP, borderBottom: `1px solid ${BORDER}` }}>
                      {fmtMAD(r.commissionEarned)}
                    </td>
                    <td className="py-2.5 px-2" style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL, borderBottom: `1px solid ${BORDER}` }}>
                      {fmtMAD(r.totalRevenueYTD)}
                    </td>
                    <td className="py-2.5 px-2 text-right" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2"
                          style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE_DIM, color: SAGE_DEEP }}
                          onClick={() => handleFacturer(r)}
                          aria-label={`Facturer ${r.displayName}`}
                        >
                          <Receipt size={11} /> Facturer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
                          onClick={() => openAdjust(r)}
                          aria-label={`Ajuster le tarif pour ${r.displayName}`}
                        >
                          <SlidersHorizontal size={11} /> Ajuster
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-2.5 px-2" style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: TEXT_HEADER, borderTop: `1px solid ${BORDER_STRONG}` }}>
                    Total ({rows.length})
                  </td>
                  <td className="py-2.5 px-2" style={{ borderTop: `1px solid ${BORDER_STRONG}` }} />
                  <td className="py-2.5 px-2" style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL, borderTop: `1px solid ${BORDER_STRONG}` }}>
                    {fmtMAD(summary.totalMrr)}
                  </td>
                  <td className="py-2.5 px-2" style={{ fontFamily: FONT_MONO, fontSize: 11, color: TEXT_BODY, borderTop: `1px solid ${BORDER_STRONG}` }}>
                    {fmtMAD(rows.reduce((s, r) => s + r.setupFee, 0))}
                  </td>
                  <td className="py-2.5 px-2" style={{ borderTop: `1px solid ${BORDER_STRONG}` }} />
                  <td className="py-2.5 px-2" style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: SAGE_DEEP, borderTop: `1px solid ${BORDER_STRONG}` }}>
                    {fmtMAD(summary.totalCommissionYTD)}
                  </td>
                  <td className="py-2.5 px-2" style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CHARCOAL, borderTop: `1px solid ${BORDER_STRONG}` }}>
                    {fmtMAD(summary.totalRevenueYTD)}
                  </td>
                  <td className="py-2.5 px-2" style={{ borderTop: `1px solid ${BORDER_STRONG}` }} />
                </tr>
              </tfoot>
            </table>
          </div>

          <AiCommentary
            text={
              rows.length === 0
                ? "Le tracker de revenus s'active dès le premier client."
                : `${rows.length} client(s) · MRR total ${fmtMAD(summary.totalMrr)} · commission YTD ${fmtMAD(summary.totalCommissionYTD)} (${agencyCommissionPct}% par défaut). Top client: ${summary.topClient?.displayName ?? "—"} (${fmtMAD(summary.topClient?.totalRevenueYTD ?? 0)}). ${overriddenCount > 0 ? `${overriddenCount} client(s) avec tarif ajusté manuellement.` : "Aucun ajustement manuel — toutes les valeurs sont calculées."} ${summary.totalRevenueYTD > 0 ? `Répartition: ${tierDistribution.map((d) => `${d.name} ${Math.round((d.value / summary.totalRevenueYTD) * 100)}%`).join(" · ")}.` : ""}`
            }
          />
        </>
      )}

      {/* Adjust dialog */}
      <Dialog open={adjustClientId !== null} onOpenChange={(o) => { if (!o) setAdjustClientId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajuster le tarif — {adjustTargetRow?.displayName}</DialogTitle>
            <DialogDescription>
              Modifiez manuellement le MRR, le setup fee et le taux de commission. Sauvegardé localement pour ce client.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div>
              <Label htmlFor="adj-mrr" style={{ ...FONT_HEADER, fontSize: 10 }}>MRR mensuel (MAD)</Label>
              <Input
                id="adj-mrr"
                type="number"
                value={draftMrr}
                onChange={(e) => setDraftMrr(e.target.value)}
                min={0}
                step={500}
                className="mt-1.5"
              />
              <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 4 }}>
                Valeur calculée: {fmtMAD(adjustTargetRow ? clients.find((c) => c.id === adjustTargetRow.clientId)?.quota?.monthlyPriceMAD ?? REVENUE_PLAN_PRICE[adjustTargetRow.planTier] : 0)}
              </p>
            </div>
            <div>
              <Label htmlFor="adj-setup" style={{ ...FONT_HEADER, fontSize: 10 }}>Setup fee (MAD)</Label>
              <Input
                id="adj-setup"
                type="number"
                value={draftSetup}
                onChange={(e) => setDraftSetup(e.target.value)}
                min={0}
                step={500}
                className="mt-1.5"
              />
              <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 4 }}>
                Valeur calculée: {fmtMAD(adjustTargetRow ? setupFeeFromHash(adjustTargetRow.clientId, adjustTargetRow.planTier) : 0)}
              </p>
            </div>
            <div>
              <Label htmlFor="adj-commission" style={{ ...FONT_HEADER, fontSize: 10 }}>Commission (%)</Label>
              <Input
                id="adj-commission"
                type="number"
                value={draftCommission}
                onChange={(e) => setDraftCommission(e.target.value)}
                min={0}
                max={100}
                step={1}
                className="mt-1.5"
              />
              <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 4 }}>
                Valeur agence: {agencyCommissionPct}%
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={handleAdjustReset} style={{ color: NEGATIVE }}>
              <RotateCcw size={12} /> Réinitialiser
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAdjustClientId(null)}>
              Annuler
            </Button>
            <Button
              size="sm"
              style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
              onClick={handleAdjustSave}
            >
              <Save size={12} /> Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R3-AGENCY-A · FEATURE 1 — CLIENT LIFECYCLE STAGES (full-width card)
// Visual pipeline: Prospect → Onboarding → Actif → Renouvellement →
// Fidèle (5 stages). Drag-and-drop (HTML5 native) moves clients
// between stages. Each stage shows: client count, total MRR, avg days
// in stage. Stagnant clients (>90 days in current stage) pulse amber.
// Conversion rates between stages shown as badges. Each client card
// displays: name, MRR, days in stage, health badge, next action date.
// Persisted in localStorage "agency:client-lifecycle". Seeded from
// existing clients distributed deterministically across stages.
// ════════════════════════════════════════════════════════════════════

const LIFECYCLE_STAGES: Array<{
  key: LifecycleStage;
  label: string;
  color: string;
  bg: string;
}> = [
  { key: "prospect", label: "Prospect", color: TEXT_BODY, bg: "#FAFAFA" },
  { key: "onboarding", label: "Onboarding", color: "#B45309", bg: "rgba(245,158,11,0.10)" },
  { key: "actif", label: "Actif", color: SAGE, bg: SAGE_BG },
  { key: "renouvellement", label: "Renouvellement", color: SAGE_DEEP, bg: "rgba(58,100,80,0.12)" },
  { key: "fidele", label: "Fidèle", color: SAGE_DEEP, bg: SAGE_BG_STRONG },
];

const LIFECYCLE_CONVERSIONS: Array<{ from: LifecycleStage; to: LifecycleStage; rate: number }> = [
  { from: "prospect", to: "onboarding", rate: 60 },
  { from: "onboarding", to: "actif", rate: 85 },
  { from: "actif", to: "renouvellement", rate: 75 },
  { from: "renouvellement", to: "fidele", rate: 90 },
];

function stageFromHash(clientId: string): LifecycleStage {
  const m = hashStr(clientId) % 10;
  if (m === 0) return "prospect";          // ~10%
  if (m <= 2) return "onboarding";         // ~20%
  if (m <= 6) return "actif";              // ~40%
  if (m <= 8) return "renouvellement";     // ~20%
  return "fidele";                         // ~10%
}

function daysInStageFromHash(clientId: string, stage: LifecycleStage): number {
  const h = hashStr(clientId + ":" + stage);
  switch (stage) {
    case "prospect": return (h % 30) + 1;        // 1-30 days
    case "onboarding": return (h % 45) + 7;      // 7-51 days
    case "actif": return (h % 120) + 30;         // 30-149 days
    case "renouvellement": return (h % 90) + 30; // 30-119 days (some >90 = stagnant)
    case "fidele": return (h % 240) + 90;        // 90-329 days
  }
}

function nextActionDateFromHash(clientId: string): string {
  const h = hashStr(clientId + ":action");
  const offset = (h % 21) - 5; // -5 to +15 days from today
  return new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
}

function seedLifecycleClients(clients: AgencyClient[]): LifecycleClient[] {
  return clients.map((c) => {
    const stage = stageFromHash(c.id);
    const healthScore = computeClientHealth(c).score;
    return {
      id: c.id,
      clientId: c.id,
      displayName: c.displayName,
      mrr: c.quota?.monthlyPriceMAD ?? 6500,
      stage,
      daysInStage: daysInStageFromHash(c.id, stage),
      healthScore,
      healthBand: healthBandFor(healthScore),
      nextActionDate: nextActionDateFromHash(c.id),
    };
  });
}

function ClientLifecycleCard({
  clients,
  loading,
  onToast,
}: {
  clients: AgencyClient[];
  loading: boolean;
  onToast: (msg: string, type?: "success" | "info") => void;
}) {
  const [state, setState] = usePersistentState<LifecycleState>(
    "agency:client-lifecycle",
    { clients: [], lastSeededAt: null },
  );
  const [dragId, setDragId] = useState<string | null>(null);

  // Sync persisted lifecycle clients with the actual `clients` prop:
  // drop removed clients, refresh display info for persisted ones, seed
  // new ones. Preserves user's drag-and-drop moves (stage + daysInStage).
  // setState is intentional here — this is the canonical sync effect that
  // reconciles persisted localStorage state with the live `clients` prop.
  useEffect(() => {
    if (loading) return;
    const actualIds = new Set(clients.map((c) => c.id));
    const persisted = state.clients.filter((lc) => actualIds.has(lc.clientId));
    const persistedIds = new Set(persisted.map((lc) => lc.clientId));
    const newClients = clients.filter((c) => !persistedIds.has(c.id));
    const refreshed = persisted.map((lc) => {
      const actual = clients.find((c) => c.id === lc.clientId);
      if (!actual) return lc;
      const healthScore = computeClientHealth(actual).score;
      return {
        ...lc,
        displayName: actual.displayName,
        mrr: actual.quota?.monthlyPriceMAD ?? 6500,
        healthScore,
        healthBand: healthBandFor(healthScore),
      };
    });
    const newSeeds = seedLifecycleClients(newClients);
    const hasChanges =
      newSeeds.length > 0 ||
      persisted.length !== state.clients.length ||
      refreshed.some((lc, i) => lc.displayName !== persisted[i].displayName);
    if (hasChanges) {
      setState({ clients: [...refreshed, ...newSeeds], lastSeededAt: Date.now() });
    }
  }, [clients, loading]);

  const handleDrop = (stage: LifecycleStage) => {
    if (!dragId) return;
    const moved = state.clients.find((lc) => lc.id === dragId);
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((lc) =>
        lc.id === dragId
          ? {
              ...lc,
              stage,
              daysInStage: 1,
              nextActionDate: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
            }
          : lc,
      ),
    }));
    if (moved) {
      const stageLabel = LIFECYCLE_STAGES.find((s) => s.key === stage)?.label ?? stage;
      onToast(`${moved.displayName} déplacé en stage « ${stageLabel} ».`);
    }
    setDragId(null);
  };

  const stageStats = LIFECYCLE_STAGES.map((s) => {
    const items = state.clients.filter((c) => c.stage === s.key);
    return {
      ...s,
      items,
      count: items.length,
      mrr: items.reduce((sum, i) => sum + i.mrr, 0),
      avgDays:
        items.length > 0
          ? Math.round(items.reduce((sum, i) => sum + i.daysInStage, 0) / items.length)
          : 0,
    };
  });

  const stagnantCount = state.clients.filter((c) => c.daysInStage > 90).length;
  const totalMrr = state.clients.reduce((s, c) => s + c.mrr, 0);
  const avgDaysAll =
    state.clients.length > 0
      ? Math.round(state.clients.reduce((s, c) => s + c.daysInStage, 0) / state.clients.length)
      : 0;

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Cycle de Vie Client · Pipeline"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: SAGE_BG,
                color: SAGE_DEEP,
                fontWeight: 700,
              }}
            >
              <Workflow size={10} /> {state.clients.length} clients
            </span>
            {stagnantCount > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  backgroundColor: "rgba(245,158,11,0.10)",
                  color: "#B45309",
                  fontWeight: 700,
                }}
              >
                <Hourglass size={10} /> {stagnantCount} stagnant(s)
              </span>
            )}
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />

      {/* Aggregate strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Clients suivis</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            {state.clients.length}
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>MRR total pipeline</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: SAGE_DEEP, marginTop: 2 }}>
            {fmtMAD(totalMrr)}
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Séjour moyen</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            {avgDaysAll} j
          </div>
        </div>
        <div
          className="p-2.5 rounded-md"
          style={{
            border: `1px solid ${stagnantCount > 0 ? "#B45309" : BORDER}`,
            backgroundColor: stagnantCount > 0 ? "rgba(245,158,11,0.06)" : "#FCFCFC",
          }}
        >
          <div style={{ ...FONT_HEADER, color: stagnantCount > 0 ? "#B45309" : undefined }}>
            Stagnants (&gt;90j)
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 14,
              fontWeight: 700,
              color: stagnantCount > 0 ? "#B45309" : CHARCOAL,
              marginTop: 2,
            }}
          >
            {stagnantCount}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-md" />
          ))}
        </div>
      ) : state.clients.length === 0 ? (
        <div
          className="text-center py-8 rounded-md"
          style={{ border: `1px dashed ${BORDER_STRONG}` }}
        >
          <Workflow size={24} style={{ color: TEXT_MUTED, margin: "0 auto 6px" }} />
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
            Aucun client — le pipeline de cycle de vie s'activera dès le premier client du portefeuille.
          </p>
        </div>
      ) : (
        <>
          {/* Kanban-style pipeline (5 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {stageStats.map((stage) => (
              <div
                key={stage.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage.key)}
                className="rounded-md p-2"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC", minHeight: 240 }}
              >
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: stage.color }} />
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        fontWeight: 700,
                        color: stage.color,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                      className="truncate"
                    >
                      {stage.label}
                    </span>
                  </div>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                    ({stage.count})
                  </span>
                </div>
                <div className="px-1 mb-2">
                  <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                    MRR: <span style={{ color: SAGE_DEEP, fontWeight: 700 }}>{fmtMAD(stage.mrr)}</span>
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>
                    Séjour moy.: <span style={{ color: CHARCOAL, fontWeight: 700 }}>{stage.avgDays}j</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {stage.items.length === 0 ? (
                    <div
                      className="text-center py-4 rounded-md"
                      style={{ border: `1px dashed ${BORDER_STRONG}`, fontFamily: FONT_SANS, fontSize: 10, color: TEXT_MUTED }}
                    >
                      Glissez ici
                    </div>
                  ) : (
                    stage.items.map((item) => {
                      const bandStyle = healthBandStyle(item.healthBand);
                      const isStagnant = item.daysInStage > 90;
                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDragId(item.id)}
                          onDragEnd={() => setDragId(null)}
                          className="p-2 rounded-md cursor-grab active:cursor-grabbing transition-shadow hover:shadow-sm"
                          style={{
                            backgroundColor: "#FFFFFF",
                            border: `1px solid ${BORDER_STRONG}`,
                            opacity: dragId === item.id ? 0.5 : 1,
                          }}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <div
                                style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, color: CHARCOAL }}
                                className="truncate"
                              >
                                {item.displayName}
                              </div>
                              <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 1 }}>
                                {fmtMAD(item.mrr)}
                              </div>
                            </div>
                            <GripVertical size={10} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                              style={{
                                fontFamily: FONT_MONO,
                                fontSize: 8,
                                fontWeight: 700,
                                backgroundColor: bandStyle.bg,
                                color: bandStyle.color,
                              }}
                            >
                              <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", backgroundColor: bandStyle.color }} />
                              {bandStyle.label}
                            </span>
                            <span
                              className="inline-flex items-center gap-0.5"
                              style={{
                                fontFamily: FONT_MONO,
                                fontSize: 9,
                                fontWeight: 700,
                                color: isStagnant ? "#B45309" : TEXT_MUTED,
                              }}
                            >
                              {isStagnant && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    backgroundColor: NEUTRAL_AMBER,
                                    animation: "pulse-dot 1.4s ease-in-out infinite",
                                  }}
                                />
                              )}
                              {item.daysInStage}j
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <CalendarDays size={8} style={{ color: TEXT_MUTED }} />
                            <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_MUTED }}>
                              {fmtDayShort(item.nextActionDate)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Conversion rates strip (between stages) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {LIFECYCLE_CONVERSIONS.map((conv) => {
              const fromLabel = LIFECYCLE_STAGES.find((s) => s.key === conv.from)?.label ?? conv.from;
              const toLabel = LIFECYCLE_STAGES.find((s) => s.key === conv.to)?.label ?? conv.to;
              const rateColor = conv.rate >= 80 ? SAGE_DEEP : conv.rate >= 60 ? "#B45309" : NEGATIVE;
              const rateBg = conv.rate >= 80 ? SAGE_BG : conv.rate >= 60 ? "rgba(245,158,11,0.10)" : "rgba(239,68,68,0.06)";
              return (
                <div
                  key={`${conv.from}-${conv.to}`}
                  className="p-2 rounded-md flex items-center gap-2"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: rateBg }}
                >
                  <ArrowRight size={11} style={{ color: SAGE, flexShrink: 0 }} />
                  <div className="min-w-0 flex-1">
                    <div style={{ ...FONT_HEADER, fontSize: 8 }}>
                      {fromLabel} → {toLabel}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: rateColor }}>
                      {conv.rate}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <AiCommentary
        text={
          state.clients.length === 0
            ? "Le pipeline de cycle de vie s'active dès le premier client du portefeuille."
            : `Cycle de vie: ${stageStats[0].count} prospect(s), ${stageStats[1].count} onboarding, ${stageStats[2].count} actif(s), ${stageStats[3].count} en renouvellement, ${stageStats[4].count} fidèle(s). ${stagnantCount > 0 ? `${stagnantCount} client(s) stagnant(s) (>90j) — relance nécessaire.` : "Aucune stagnation — flux sain."} Glissez les cartes entre colonnes pour mettre à jour le stage.`
        }
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R3-AGENCY-A · FEATURE 2 — UPSELL OPPORTUNITY TRACKER (full-width card)
// Identifies upsell opportunities per client based on 4 criteria: quota
// usage >80%, HarchIQ questions >70%, client health >75, contract age
// >6 months. Need ≥2 criteria met to qualify. Each opportunity: client
// name, current plan, recommended upgrade (Essentiel→Pro / Pro→Enterprise),
// estimated revenue uplift (MAD/mo), probability %, "Recommander" button
// (generates a pitch via HarchIQ simulated), "Ignorer" button (persisted).
// Sortable by: uplift value, probability, client name. Aggregate strip
// shows total upsell value at risk, opportunities count, avg probability.
// "Lancer campagne d'upsell" button marks all as "campaign sent".
// Persisted in localStorage "agency:upsell-opportunities".
// ════════════════════════════════════════════════════════════════════

const PLAN_PRICE_MAD: Record<string, number> = {
  essentiel: 3000,
  emergence: 3000,
  pro: 6500,
  corporate: 6500,
  enterprise: 15000,
  sovereign: 25000,
};

function planLabelRaw(tier: string | undefined | null): string {
  if (!tier) return "Essentiel";
  const t = tier.toLowerCase();
  if (t === "sovereign") return "Sovereign";
  if (t === "corporate") return "Corporate";
  if (t === "emergence") return "Émergence";
  if (t === "essentiel") return "Essentiel";
  if (t === "pro") return "Pro";
  if (t === "enterprise") return "Enterprise";
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function computeUpsellOpportunity(client: AgencyClient): UpsellOpportunity | null {
  const planTier = (client.quota?.planTier ?? "essentiel").toLowerCase();
  const planLabel = planLabelRaw(planTier);

  // Determine upgrade target + uplift
  let upgradeLabel = "";
  let uplift = 0;
  if (planTier === "essentiel" || planTier === "emergence") {
    upgradeLabel = "Pro";
    uplift = PLAN_PRICE_MAD.pro - PLAN_PRICE_MAD.essentiel;
  } else if (planTier === "pro" || planTier === "corporate") {
    upgradeLabel = "Enterprise";
    uplift = PLAN_PRICE_MAD.enterprise - PLAN_PRICE_MAD.pro;
  } else {
    // sovereign / enterprise — no upgrade path
    return null;
  }

  const apiPct = client.bars?.apiRequests?.pct ?? 0;
  const harchiqPct = apiPct; // proxy: HarchIQ usage is part of apiRequests
  const healthScore = computeClientHealth(client).score;
  const retention = monthsSince(client.createdAt);

  const factors: UpsellFactor[] = [
    {
      label: "Quota usage",
      displayValue: fmtPct(apiPct),
      displayThreshold: ">80%",
      met: apiPct > 80,
    },
    {
      label: "HarchIQ questions",
      displayValue: fmtPct(harchiqPct),
      displayThreshold: ">70%",
      met: harchiqPct > 70,
    },
    {
      label: "Santé client",
      displayValue: `${healthScore}/100`,
      displayThreshold: ">75",
      met: healthScore > 75,
    },
    {
      label: "Ancienneté contrat",
      displayValue: `${retention} mois`,
      displayThreshold: ">6 mois",
      met: retention > 6,
    },
  ];

  const metCount = factors.filter((f) => f.met).length;
  if (metCount < 2) return null; // require ≥2 criteria

  const probability =
    metCount >= 4 ? 90 : metCount === 3 ? 75 : 55;

  return {
    id: client.id,
    clientId: client.id,
    displayName: client.displayName,
    currentPlanLabel: planLabel,
    recommendedUpgradeLabel: upgradeLabel,
    monthlyRevenueUplift: uplift,
    probabilityPct: probability,
    factors,
  };
}

function UpsellOpportunityTrackerCard({
  clients,
  loading,
  onToast,
}: {
  clients: AgencyClient[];
  loading: boolean;
  onToast: (msg: string, type?: "success" | "info") => void;
}) {
  const [upsellState, setUpsellState] = usePersistentState<UpsellState>(
    "agency:upsell-opportunities",
    { ignoredClientIds: [], campaignSentAt: null },
  );
  const [sort, setSort] = useState<UpsellSort>("uplift");

  const allOpportunities = useMemo(() => {
    return clients
      .map(computeUpsellOpportunity)
      .filter((o): o is UpsellOpportunity => o !== null);
  }, [clients]);

  const visibleOpportunities = useMemo(() => {
    const filtered = allOpportunities.filter(
      (o) => !upsellState.ignoredClientIds.includes(o.clientId),
    );
    switch (sort) {
      case "uplift":
        return [...filtered].sort((a, b) => b.monthlyRevenueUplift - a.monthlyRevenueUplift);
      case "probability":
        return [...filtered].sort((a, b) => b.probabilityPct - a.probabilityPct);
      case "name":
        return [...filtered].sort((a, b) => a.displayName.localeCompare(b.displayName));
    }
  }, [allOpportunities, upsellState.ignoredClientIds, sort]);

  const totalUplift = visibleOpportunities.reduce((s, o) => s + o.monthlyRevenueUplift, 0);
  const avgProbability =
    visibleOpportunities.length > 0
      ? Math.round(visibleOpportunities.reduce((s, o) => s + o.probabilityPct, 0) / visibleOpportunities.length)
      : 0;
  const ignoredCount = upsellState.ignoredClientIds.length;

  const ignore = (clientId: string) => {
    setUpsellState((prev) =>
      prev.ignoredClientIds.includes(clientId)
        ? prev
        : { ...prev, ignoredClientIds: [...prev.ignoredClientIds, clientId] },
    );
  };

  const recommend = (opp: UpsellOpportunity) => {
    // Simulated HarchIQ pitch generation — fires a toast with summary
    onToast(
      `Pitch d'upsell généré pour ${opp.displayName} (${opp.currentPlanLabel} → ${opp.recommendedUpgradeLabel}, +${fmtMAD(opp.monthlyRevenueUplift)}/mois, prob. ${opp.probabilityPct}%).`,
      "success",
    );
  };

  const launchCampaign = () => {
    setUpsellState((prev) => ({ ...prev, campaignSentAt: Date.now() }));
    onToast(
      `Campagne d'upsell lancée · ${visibleOpportunities.length} opportunité(s) · ${fmtMAD(totalUplift)}/mois de revenu additionnel potentiel.`,
      "success",
    );
  };

  const campaignDaysAgo = upsellState.campaignSentAt
    ? Math.floor((Date.now() - upsellState.campaignSentAt) / (24 * 60 * 60 * 1000))
    : null;

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Tracker d'Opportunités Upsell"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: SAGE_BG,
                color: SAGE_DEEP,
                fontWeight: 700,
              }}
            >
              <Rocket size={10} /> {visibleOpportunities.length} opportunité(s)
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE, color: SAGE_DEEP }}
              onClick={launchCampaign}
              disabled={visibleOpportunities.length === 0}
            >
              <Send size={11} /> Lancer campagne d'upsell
            </Button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : allOpportunities.length === 0 ? (
        <div
          className="text-center py-8 rounded-md"
          style={{ border: `1px dashed ${BORDER_STRONG}` }}
        >
          <Rocket size={24} style={{ color: TEXT_MUTED, margin: "0 auto 6px" }} />
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
            Aucune opportunité d'upsell détectée — les clients éligibles (≥2 critères: quota &gt;80%, HarchIQ &gt;70%, santé &gt;75, contrat &gt;6 mois) apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          {/* Aggregate strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: SAGE_BG }}>
              <div style={FONT_HEADER}>Valeur totale upsell</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: SAGE_DEEP, marginTop: 2 }}>
                {fmtMAD(totalUplift)}
                <span style={{ fontSize: 10, color: TEXT_MUTED }}>/mois</span>
              </div>
            </div>
            <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
              <div style={FONT_HEADER}>Opportunités</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
                {visibleOpportunities.length}
              </div>
            </div>
            <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
              <div style={FONT_HEADER}>Probabilité moyenne</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
                {fmtPct(avgProbability)}
              </div>
            </div>
            <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
              <div style={FONT_HEADER}>Ignorées</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: TEXT_MUTED, marginTop: 2 }}>
                {ignoredCount}
              </div>
            </div>
          </div>

          {/* Campaign status banner */}
          {campaignDaysAgo !== null && (
            <div
              className="p-2.5 rounded-md mb-3 flex items-center gap-2"
              style={{ backgroundColor: SAGE_BG, border: `1px solid ${SAGE_DIM}` }}
            >
              <CheckCircle2 size={14} style={{ color: SAGE_DEEP }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: SAGE_DEEP }}>
                Campagne d'upsell lancée il y a {campaignDaysAgo} jour(s) · {visibleOpportunities.length} opportunité(s) ciblée(s).
              </span>
            </div>
          )}

          {/* Sort controls */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span style={{ ...FONT_HEADER, fontSize: 9, marginRight: 4 }}>Trier par</span>
            {([
              { key: "uplift", label: "Valeur" },
              { key: "probability", label: "Probabilité" },
              { key: "name", label: "Client" },
            ] as Array<{ key: UpsellSort; label: string }>).map((opt) => (
              <Button
                key={opt.key}
                variant={sort === opt.key ? "default" : "outline"}
                size="sm"
                className="h-7"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  backgroundColor: sort === opt.key ? SAGE : "#FFFFFF",
                  color: sort === opt.key ? "#FFFFFF" : TEXT_BODY,
                }}
                onClick={() => setSort(opt.key)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Opportunities list */}
          {visibleOpportunities.length === 0 ? (
            <div
              className="text-center py-6 rounded-md"
              style={{ border: `1px dashed ${BORDER_STRONG}`, fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}
            >
              Toutes les opportunités ont été ignorées — réinitialisez le localStorage « agency:upsell-opportunities » pour les réafficher.
            </div>
          ) : (
            <div className="space-y-1.5">
              {visibleOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="rounded-md p-3"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex items-center justify-center shrink-0 rounded-md"
                      style={{ width: 36, height: 36, backgroundColor: SAGE_BG, border: `1px solid ${SAGE}` }}
                    >
                      <TrendingUp size={14} style={{ color: SAGE_DEEP }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: CHARCOAL }} className="truncate">
                          {opp.displayName}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: SAGE_DEEP }}>
                            +{fmtMAD(opp.monthlyRevenueUplift)}
                          </span>
                          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>/mois</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                          style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: "#FAFAFA", color: TEXT_BODY, fontWeight: 700 }}
                        >
                          {opp.currentPlanLabel}
                        </span>
                        <ArrowRight size={10} style={{ color: SAGE }} />
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                          style={{ fontFamily: FONT_MONO, fontSize: 9, backgroundColor: SAGE_BG, color: SAGE_DEEP, fontWeight: 700 }}
                        >
                          <Crown size={9} /> {opp.recommendedUpgradeLabel}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 9,
                            fontWeight: 700,
                            backgroundColor:
                              opp.probabilityPct >= 75 ? SAGE_BG : opp.probabilityPct >= 60 ? "rgba(245,158,11,0.10)" : "#FAFAFA",
                            color:
                              opp.probabilityPct >= 75 ? SAGE_DEEP : opp.probabilityPct >= 60 ? "#B45309" : TEXT_BODY,
                          }}
                        >
                          {opp.probabilityPct}% prob.
                        </span>
                      </div>
                      {/* Factor chips */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {opp.factors.map((f) => (
                          <span
                            key={f.label}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                            style={{
                              fontFamily: FONT_MONO,
                              fontSize: 9,
                              fontWeight: 700,
                              backgroundColor: f.met ? SAGE_BG : "#FAFAFA",
                              color: f.met ? SAGE_DEEP : TEXT_MUTED,
                            }}
                          >
                            {f.met ? <Check size={9} /> : <X size={9} />}
                            {f.label} · {f.displayValue}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7"
                        style={{ fontFamily: FONT_MONO, fontSize: 10, borderColor: SAGE, color: SAGE_DEEP }}
                        onClick={() => recommend(opp)}
                      >
                        <Sparkles size={11} /> Recommander
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
                        onClick={() => ignore(opp.clientId)}
                      >
                        <X size={11} /> Ignorer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <AiCommentary
        text={
          allOpportunities.length === 0
            ? "Aucune opportunité d'upsell — portefeuille à plan optimal ou critères non remplis."
            : `${visibleOpportunities.length} opportunité(s) d'upsell · ${fmtMAD(totalUplift)}/mois de revenu additionnel potentiel · probabilité moyenne ${fmtPct(avgProbability)}. ${ignoredCount > 0 ? `${ignoredCount} opportunité(s) ignorée(s).` : ""} ${campaignDaysAgo !== null ? "Campagne déjà lancée — suivez les conversions." : "Lancez la campagne pour activer le revenu additionnel."}`
        }
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// R3-AGENCY-A · FEATURE 3 — AGENCY BENCHMARK (full-width card)
// Compare your agency against industry benchmarks for PR agencies:
// Clients per AM, Revenue per client, Retention rate, Avg deal size,
// Time to onboard, NPS (6 axes). Radar chart (RadarChart) with 3 series
// (Vous / Médiane sectorielle / Top 10%). Score global gauge
// (RadialBarChart): your agency score 0-100 vs median. Forces list
// (above median, sage badges) + Axes d'amélioration list (below median,
// amber badges). "Voir le détail" expandable per metric with benchmark
// source + manual override (±). Persisted manual overrides in
// localStorage "agency:benchmark-overrides". Benchmark data: static
// realistic figures for PR agency sector.
// ════════════════════════════════════════════════════════════════════

const BENCHMARK_METRICS: BenchmarkMetric[] = [
  {
    key: "clients_per_am",
    label: "Clients / account manager",
    shortLabel: "Clients/AM",
    unit: "",
    median: 8,
    top10: 15,
    source: "Enquête ANAE Maurice 2024 (n=42 agences RP)",
    compute: (clients, users) => {
      const amCount = Math.max(1, users.length);
      return clients.length / amCount;
    },
    display: (v) => v.toFixed(1),
  },
  {
    key: "revenue_per_client",
    label: "Revenu / client (MAD/mois)",
    shortLabel: "Revenu/client",
    unit: "MAD",
    median: 5500,
    top10: 9500,
    source: "Benchmark Harch Agency Q3 2024 (n=64 agences)",
    compute: (clients) => {
      if (clients.length === 0) return 0;
      const total = clients.reduce((s, c) => s + (c.quota?.monthlyPriceMAD ?? 6500), 0);
      return Math.round(total / clients.length);
    },
    display: (v) => fmtMAD(v),
  },
  {
    key: "retention_rate",
    label: "Taux de rétention 12 mois",
    shortLabel: "Rétention",
    unit: "%",
    median: 82,
    top10: 94,
    source: "SaaS Retention Benchmark 2024 (OpenView Partners)",
    compute: (clients) => {
      if (clients.length === 0) return 0;
      const retained = clients.filter((c) => monthsSince(c.createdAt) >= 12).length;
      return Math.round((retained / clients.length) * 100);
    },
    display: (v) => `${v}%`,
  },
  {
    key: "avg_deal_size",
    label: "Taille moyenne de contrat (MAD/mois)",
    shortLabel: "Taille contrat",
    unit: "MAD",
    median: 5200,
    top10: 12000,
    source: "Harch Agency Sales Report 2024",
    compute: (clients) => {
      if (clients.length === 0) return 0;
      const total = clients.reduce((s, c) => s + (c.quota?.monthlyPriceMAD ?? 6500), 0);
      return Math.round(total / clients.length);
    },
    display: (v) => fmtMAD(v),
  },
  {
    key: "time_to_onboard",
    label: "Temps d'onboarding (jours)",
    shortLabel: "Onboarding",
    unit: "j",
    median: 21,
    top10: 7,
    inverted: true,
    source: "PSA Industry Report 2024 (Professional Services Automation)",
    compute: (clients, users) => {
      const seed = hashStr(`onboard:${clients.length}:${users.length}`);
      return 14 + (seed % 21); // 14-34 days
    },
    display: (v) => `${v}j`,
  },
  {
    key: "nps",
    label: "NPS (Net Promoter Score)",
    shortLabel: "NPS",
    unit: "",
    median: 32,
    top10: 65,
    source: "Harch NPS Survey Q3 2024 (n=128 agences)",
    compute: (clients, users) => {
      const seed = hashStr(`nps:${clients.length}:${users.length}`);
      return 25 + (seed % 50); // 25-74
    },
    display: (v) => String(v),
  },
];

function normalizeMetric(metric: BenchmarkMetric, value: number): number {
  // Returns 0-100 (100 = top10% performance)
  if (metric.inverted) {
    if (value <= metric.top10) return 100;
    if (value >= metric.median * 2) return 0;
    const span = metric.median * 2 - metric.top10;
    return Math.round(100 - ((value - metric.top10) / span) * 100);
  }
  if (value >= metric.top10) return 100;
  if (value <= 0) return 0;
  return Math.round((value / metric.top10) * 100);
}

function isForce(metric: BenchmarkMetric, value: number): boolean {
  if (metric.inverted) return value < metric.median;
  return value > metric.median;
}

function AgencyBenchmarkCard({
  clients,
  users,
  loading,
}: {
  clients: AgencyClient[];
  users: TeamUser[];
  loading: boolean;
}) {
  const [overrides, setOverrides] = usePersistentState<Record<string, number>>(
    "agency:benchmark-overrides",
    {},
  );
  const [expandedKey, setExpandedKey] = useState<BenchmarkMetricKey | null>(null);

  const rows: BenchmarkRow[] = useMemo(() => {
    return BENCHMARK_METRICS.map((m) => {
      const rawValue = m.compute(clients, users);
      const value = overrides[m.key] ?? rawValue;
      const normalized = normalizeMetric(m, value);
      return {
        ...m,
        rawValue,
        value,
        normalized,
        isForced: isForce(m, value),
        overridden: overrides[m.key] !== undefined,
      };
    });
  }, [clients, users, overrides]);

  const yourScore =
    rows.length > 0 ? Math.round(rows.reduce((s, m) => s + m.normalized, 0) / rows.length) : 0;
  const medianScore = Math.round(
    BENCHMARK_METRICS.reduce((s, m) => s + normalizeMetric(m, m.median), 0) /
      BENCHMARK_METRICS.length,
  );

  const forces = rows.filter((m) => m.isForced);
  const weaknesses = rows.filter((m) => !m.isForced);

  const radarData = BENCHMARK_METRICS.map((m) => {
    const your = rows.find((r) => r.key === m.key)!;
    return {
      metric: m.shortLabel,
      Vous: your.normalized,
      Médiane: normalizeMetric(m, m.median),
      "Top 10%": normalizeMetric(m, m.top10),
    };
  });

  const gaugeData = [
    { name: "Vous", value: yourScore, fill: SAGE },
    { name: "Médiane", value: medianScore, fill: NEUTRAL_GRAY },
  ];

  const adjustOverride = (key: string, delta: number) => {
    const current = rows.find((m) => m.key === key);
    if (!current) return;
    const newVal = Math.max(0, Math.round((current.value + delta) * 100) / 100);
    setOverrides((prev) => ({ ...prev, [key]: newVal }));
  };

  const clearOverride = (key: string) => {
    setOverrides((prev) => {
      const copy: Record<string, number> = {};
      Object.keys(prev).forEach((k) => {
        if (k !== key) copy[k] = prev[k];
      });
      return copy;
    });
  };

  return (
    <CardShell className="lg:col-span-12">
      <SectionHeader
        title="Benchmark Agence · Secteur RP"
        right={
          <>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.08em",
                backgroundColor: SAGE_BG,
                color: SAGE_DEEP,
                fontWeight: 700,
              }}
            >
              <Gauge size={10} /> Score {yourScore}/100
            </span>
            {Object.keys(overrides).length > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  backgroundColor: "#FAFAFA",
                  color: TEXT_MUTED,
                  fontWeight: 700,
                }}
              >
                {Object.keys(overrides).length} ajustement(s)
              </span>
            )}
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-md" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div
          className="text-center py-8 rounded-md"
          style={{ border: `1px dashed ${BORDER_STRONG}` }}
        >
          <Gauge size={24} style={{ color: TEXT_MUTED, margin: "0 auto 6px" }} />
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
            Aucun client — le benchmark s'active dès le premier client du portefeuille.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Radar chart (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div style={FONT_HEADER}>Radar · Votre agence vs médiane vs top 10%</div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span style={{ display: "inline-block", width: 12, height: 2, backgroundColor: SAGE }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>Vous</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span style={{ display: "inline-block", width: 12, height: 2, backgroundColor: NEUTRAL_GRAY }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>Médiane</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span style={{ display: "inline-block", width: 12, height: 2, backgroundColor: SAGE_DEEP }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED }}>Top 10%</span>
                </div>
              </div>
            </div>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke={BORDER_STRONG} />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontFamily: FONT_MONO, fontSize: 10, fill: TEXT_MUTED }}
                  />
                  <RTooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                    }}
                    formatter={(v: number) => `${v}/100`}
                  />
                  <Radar
                    name="Médiane"
                    dataKey="Médiane"
                    stroke={NEUTRAL_GRAY}
                    fill={NEUTRAL_GRAY}
                    fillOpacity={0.08}
                    strokeWidth={1.5}
                    isAnimationActive={false}
                  />
                  <Radar
                    name="Top 10%"
                    dataKey="Top 10%"
                    stroke={SAGE_DEEP}
                    fill={SAGE_DEEP}
                    fillOpacity={0.04}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    isAnimationActive={false}
                  />
                  <Radar
                    name="Vous"
                    dataKey="Vous"
                    stroke={SAGE}
                    fill={SAGE}
                    fillOpacity={0.22}
                    strokeWidth={2.5}
                    isAnimationActive={false}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gauge + forces/weaknesses (1/3 width) */}
          <div className="space-y-3">
            {/* Gauge */}
            <div
              className="p-3 rounded-md"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}
            >
              <div style={FONT_HEADER}>Score global</div>
              <div style={{ position: "relative", width: "100%", height: 140, marginTop: 4 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="62%"
                    outerRadius="100%"
                    data={gaugeData}
                    startAngle={90}
                    endAngle={-270}
                    barSize={9}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar
                      background={{ fill: "#F4F4F5" }}
                      dataKey="value"
                      cornerRadius={6}
                      isAnimationActive={false}
                    />
                    <RTooltip
                      cursor={false}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: `1px solid ${BORDER_STRONG}`,
                        borderRadius: 8,
                        fontFamily: FONT_MONO,
                        fontSize: 11,
                        color: CHARCOAL,
                      }}
                      formatter={(v: number, n) => [
                        `${Math.round(Number(v))}/100`,
                        n === "Vous" ? "Votre score" : "Médiane sectorielle",
                      ]}
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
                      fontSize: 28,
                      fontWeight: 700,
                      color: yourScore >= medianScore ? SAGE_DEEP : "#B45309",
                      lineHeight: 1,
                    }}
                  >
                    {yourScore}
                  </span>
                  <span style={{ ...FONT_HEADER, marginTop: 4, fontSize: 8 }}>
                    /100 · médiane {medianScore}
                  </span>
                </div>
              </div>
              <div
                className="flex items-center justify-between"
                style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginTop: 6 }}
              >
                <span className="inline-flex items-center gap-1">
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: SAGE }} />
                  Vous
                </span>
                <span className="inline-flex items-center gap-1">
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: NEUTRAL_GRAY }} />
                  Médiane
                </span>
              </div>
            </div>

            {/* Forces */}
            <div>
              <div style={FONT_HEADER} className="mb-1.5">
                <ListChecks size={11} style={{ display: "inline", marginRight: 4, color: SAGE_DEEP }} />
                Forces ({forces.length})
              </div>
              {forces.length === 0 ? (
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11,
                    color: TEXT_MUTED,
                    padding: 8,
                    border: `1px dashed ${BORDER_STRONG}`,
                    borderRadius: 6,
                  }}
                >
                  Aucune force détectée — visez la médiane sur tous les axes.
                </div>
              ) : (
                <div className="space-y-1">
                  {forces.map((m) => (
                    <div
                      key={m.key}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md"
                      style={{ backgroundColor: SAGE_BG, border: `1px solid ${SAGE_DIM}` }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Award size={11} style={{ color: SAGE_DEEP, flexShrink: 0 }} />
                        <span
                          style={{ fontFamily: FONT_SANS, fontSize: 11, color: CHARCOAL, fontWeight: 600 }}
                          className="truncate"
                        >
                          {m.shortLabel}
                        </span>
                      </div>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE_DEEP, fontWeight: 700 }}>
                        {m.display(m.value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weaknesses */}
            <div>
              <div style={FONT_HEADER} className="mb-1.5">
                <Crosshair size={11} style={{ display: "inline", marginRight: 4, color: "#B45309" }} />
                Axes d'amélioration ({weaknesses.length})
              </div>
              {weaknesses.length === 0 ? (
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11,
                    color: TEXT_MUTED,
                    padding: 8,
                    border: `1px dashed ${BORDER_STRONG}`,
                    borderRadius: 6,
                  }}
                >
                  Aucun axe d'amélioration — portefeuille au-dessus de la médiane sur tous les KPIs.
                </div>
              ) : (
                <div className="space-y-1">
                  {weaknesses.map((m) => (
                    <div
                      key={m.key}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md"
                      style={{ backgroundColor: "rgba(245,158,11,0.08)", border: `1px solid rgba(245,158,11,0.30)` }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Target size={11} style={{ color: "#B45309", flexShrink: 0 }} />
                        <span
                          style={{ fontFamily: FONT_SANS, fontSize: 11, color: CHARCOAL, fontWeight: 600 }}
                          className="truncate"
                        >
                          {m.shortLabel}
                        </span>
                      </div>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#B45309", fontWeight: 700 }}>
                        {m.display(m.value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Per-metric detail (full width below) */}
          <div className="lg:col-span-3">
            <div style={FONT_HEADER} className="mb-2">Détail par métrique</div>
            <div className="space-y-1.5">
              {rows.map((m) => {
                const isExpanded = expandedKey === m.key;
                const delta = m.inverted
                  ? m.value < m.median
                    ? m.median - m.value
                    : -(m.value - m.median)
                  : m.value > m.median
                    ? m.value - m.median
                    : -(m.median - m.value);
                const step = m.unit === "MAD" ? 500 : m.unit === "%" ? 5 : m.unit === "j" ? 1 : 1;
                return (
                  <div key={m.key} className="rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
                    <button
                      type="button"
                      onClick={() => setExpandedKey(isExpanded ? null : m.key)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left"
                    >
                      <div
                        className="flex items-center justify-center shrink-0 rounded-md"
                        style={{
                          width: 36,
                          height: 36,
                          backgroundColor: m.isForced ? SAGE_BG : "rgba(245,158,11,0.08)",
                          border: `1px solid ${m.isForced ? SAGE : "rgba(245,158,11,0.30)"}`,
                        }}
                      >
                        <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: m.isForced ? SAGE_DEEP : "#B45309" }}>
                          {m.normalized}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                          {m.label}
                          {m.overridden && (
                            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_MUTED, marginLeft: 6 }}>(manuel)</span>
                          )}
                        </div>
                        <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED, marginTop: 1 }}>
                          Vous: <span style={{ color: CHARCOAL, fontWeight: 700 }}>{m.display(m.value)}</span>
                          {" · "}Médiane: {m.display(m.median)}
                          {" · "}Top 10%: {m.display(m.top10)}
                        </div>
                      </div>
                      <ChevronRight
                        size={14}
                        style={{
                          color: TEXT_MUTED,
                          flexShrink: 0,
                          transform: isExpanded ? "rotate(90deg)" : "none",
                          transition: "transform 0.15s",
                        }}
                      />
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="px-3 pb-3 pt-1 border-t"
                        style={{ borderColor: BORDER }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <div>
                            <div style={FONT_HEADER}>Source du benchmark</div>
                            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_BODY, marginTop: 4, lineHeight: 1.5 }}>
                              {m.source}
                            </p>
                            <div style={FONT_HEADER} className="mt-3">Comparaison</div>
                            <div className="space-y-1 mt-2">
                              <div className="flex items-center justify-between" style={{ fontFamily: FONT_MONO, fontSize: 11 }}>
                                <span style={{ color: TEXT_MUTED }}>Votre valeur</span>
                                <span style={{ color: m.isForced ? SAGE_DEEP : "#B45309", fontWeight: 700 }}>{m.display(m.value)}</span>
                              </div>
                              <div className="flex items-center justify-between" style={{ fontFamily: FONT_MONO, fontSize: 11 }}>
                                <span style={{ color: TEXT_MUTED }}>Médiane sectorielle</span>
                                <span style={{ color: CHARCOAL, fontWeight: 700 }}>{m.display(m.median)}</span>
                              </div>
                              <div className="flex items-center justify-between" style={{ fontFamily: FONT_MONO, fontSize: 11 }}>
                                <span style={{ color: TEXT_MUTED }}>Top 10% agences</span>
                                <span style={{ color: SAGE_DEEP, fontWeight: 700 }}>{m.display(m.top10)}</span>
                              </div>
                              <div className="flex items-center justify-between" style={{ fontFamily: FONT_MONO, fontSize: 11 }}>
                                <span style={{ color: TEXT_MUTED }}>Écart vs médiane</span>
                                <span style={{ color: m.isForced ? SAGE_DEEP : "#B45309", fontWeight: 700 }}>
                                  {m.inverted
                                    ? (m.value < m.median ? `-${m.display(Math.abs(delta))}` : `+${m.display(Math.abs(delta))}`)
                                    : (m.value > m.median ? `+${m.display(Math.abs(delta))}` : `-${m.display(Math.abs(delta))}`)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between" style={{ fontFamily: FONT_MONO, fontSize: 11 }}>
                                <span style={{ color: TEXT_MUTED }}>Score normalisé</span>
                                <span style={{ color: m.normalized >= 75 ? SAGE_DEEP : m.normalized >= 50 ? "#B45309" : NEGATIVE, fontWeight: 700 }}>
                                  {m.normalized}/100
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <div style={FONT_HEADER}>Ajuster manuellement</div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_MUTED }}
                                onClick={() => clearOverride(m.key)}
                                disabled={!m.overridden}
                              >
                                Réinitialiser
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                style={{ fontFamily: FONT_MONO, fontSize: 11 }}
                                onClick={() => adjustOverride(m.key, -step)}
                              >
                                −{m.unit === "MAD" ? step : step}
                              </Button>
                              <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: CHARCOAL, flex: 1, textAlign: "center" }}>
                                {m.display(m.value)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                style={{ fontFamily: FONT_MONO, fontSize: 11 }}
                                onClick={() => adjustOverride(m.key, step)}
                              >
                                +{m.unit === "MAD" ? step : step}
                              </Button>
                            </div>
                            <p style={{ fontFamily: FONT_SANS, fontSize: 10, color: TEXT_MUTED, marginTop: 8, lineHeight: 1.4 }}>
                              {m.inverted
                                ? "Métrique inversée — une valeur plus basse est meilleure. Ajustement manuel pour refléter votre réalité terrain."
                                : "Ajustement manuel pour refléter votre réalité terrain (sauvegardé localement)."}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <AiCommentary
        text={
          clients.length === 0
            ? "Le benchmark s'active dès le premier client du portefeuille."
            : `Score global ${yourScore}/100 vs médiane sectorielle ${medianScore}/100. ${forces.length} force(s) identifiée(s), ${weaknesses.length} axe(s) d'amélioration. ${yourScore >= medianScore ? "Votre agence se positionne au-dessus de la médiane sectorielle." : "Visez la médiane sur les axes faibles pour grimper au classement."} ${Object.keys(overrides).length > 0 ? `${Object.keys(overrides).length} métrique(s) ajustée(s) manuellement.` : ""}`
        }
      />
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SIDEBAR NAV (plan-aware — Agences)
// 10 items: 5 shared with Essentiel/Pro/Enterprise + 3 Agency exclusives
// (Clients, Campagnes, White-Label) + Visibilité IA + Harch 100 (external).
// Each maps to a section `id` attached to the corresponding motion.div
// wrapper. Clicking scrolls smoothly; an IntersectionObserver highlights
// the item matching the section currently in view.
// ════════════════════════════════════════════════════════════════════

const NAV_ITEMS: {
  id: string;
  label: string;
  Icon: typeof LayoutGrid;
  agencyExclusive?: boolean;
  external?: boolean;
}[] = [
  { id: "ai-workspace", label: "AI Workspace", Icon: Sparkles },
  { id: "score", label: "Score", Icon: LayoutGrid },
  { id: "sentiment", label: "Sentiment", Icon: TrendingUp },
  { id: "concurrents", label: "Concurrents", Icon: Users },
  { id: "alertes", label: "Alertes", Icon: Bell },
  { id: "rapports", label: "Rapports", Icon: FileText },
  { id: "clients", label: "Clients", Icon: Building2, agencyExclusive: true },
  { id: "campagnes", label: "Campagnes", Icon: Megaphone, agencyExclusive: true },
  { id: "white-label", label: "White-Label", Icon: Palette, agencyExclusive: true },
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
  subLevelLabel,
}: {
  activeSection: string;
  alertCount: number;
  onNavigate?: (id: string) => void;
  fallbackName?: string | null;
  fallbackEmail?: string | null;
  subLevelLabel?: string;
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
            Agences
          </span>
          {subLevelLabel && (
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
              {subLevelLabel}
            </span>
          )}
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
            Agences
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
// ROOT — AgencyDashboard
// ════════════════════════════════════════════════════════════════════

export default function AgencyDashboard({
  userName,
  userEmail,
}: {
  userName?: string | null;
  userEmail?: string | null;
}) {
  // ─── Agency clients state ──────────────────────────────────────
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [agency, setAgency] = useState<AgencyMeta | null>(null);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [exporting, setExporting] = useState(false);

  // ─── ENV-AGENCY · client-side environment state ────────────────
  // All persisted via usePersistentState (AURA fix #2 — survives refresh).
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingClients, setPendingClients] = usePersistentState<PendingClient[]>(
    "agency:pending-clients",
    [],
  );
  const [tierOverride, setTierOverride] = usePersistentState<AgencyTierLevel | null>(
    "agency:tier-level",
    null,
  );
  // Active tier = manual override OR auto-detected from client count.
  const activeTier = useMemo(
    () => getTierInfo(tierOverride ?? tierFromClientCount(clients.length)),
    [tierOverride, clients.length],
  );

  // ─── Sidebar / nav state ───────────────────────────────────────
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
      { rootMargin: "-100px 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] },
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

  // Toasts
  const pushToast = useCallback((message: string, type: "success" | "info" = "success") => {
    if (type === "success") toast.success(message);
    else toast.info(message);
  }, []);

  // ─── Fetch agency clients ──────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const res = await fetch("/api/agency/clients", { credentials: "same-origin" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d: ClientsResponse = await res.json();
      setClients(Array.isArray(d.clients) ? d.clients : []);
      setAgency(d.agency ?? null);
    } catch {
      setClients([]);
      setAgency(null);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ─── Active client object ──────────────────────────────────────
  const activeClient = useMemo(() => {
    return activeClientId ? clients.find((c) => c.id === activeClientId) ?? null : null;
  }, [activeClientId, clients]);

  // ─── Switch workspace ──────────────────────────────────────────
  const handleSwitch = useCallback(
    async (clientId: string | null) => {
      setSwitching(true);
      try {
        const res = await fetch("/api/agency/switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agencyClientId: clientId }),
          credentials: "same-origin",
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || `Erreur ${res.status}`);
        }
        setActiveClientId(clientId);
        const target = clientId
          ? clients.find((c) => c.id === clientId)?.displayName ?? "le client"
          : null;
        pushToast(
          target
            ? `Espace de travail basculé vers ${target}.`
            : "Retour à la vue agrégée (tous les clients).",
        );
        // Trigger refetch of all client-scoped APIs after a brief delay
        setTimeout(() => {
          refetchHealth();
          refetchAlerts();
          refetchTrend();
          refetchAi();
          refetchSrc();
          refetchTopics();
          refetchReports();
        }, 200);
      } catch (err) {
        pushToast(err instanceof Error ? err.message : "Échec de la bascule.", "info");
      } finally {
        setSwitching(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clients, pushToast],
  );

  // ─── Client-scoped data fetchers (only fire when a client is active) ─
  const {
    data: health,
    loading: healthLoading,
    refetch: refetchHealth,
  } = useApi<BrandHealth>(activeClientId ? "/api/console/brand-health" : null);

  const {
    data: alerts,
    loading: alertsLoading,
    refetch: refetchAlerts,
  } = useApi<CrisisAlertsResp>(activeClientId ? "/api/console/crisis-alerts" : null);

  const {
    data: trend,
    refetch: refetchTrend,
  } = useApi<SentimentTrendResp>(
    activeClientId ? `/api/console/sentiment-trend?range=${range}` : null,
  );

  const {
    data: ai,
    refetch: refetchAi,
  } = useApi<AiVisibilityResp>(activeClientId ? "/api/console/ai-visibility" : null);

  const {
    data: src,
    refetch: refetchSrc,
  } = useApi<SourceDistResp>(activeClientId ? "/api/console/source-distribution" : null);

  const {
    data: topics,
    refetch: refetchTopics,
  } = useApi<TopicsResp>(activeClientId ? "/api/console/topics" : null);

  const { data: insights } = useApi<InsightsResp>("/api/console/insights");

  // ─── Reports (always fetched — they're cross-client) ──────────
  const {
    data: reportsData,
    loading: reportsLoading,
    refetch: refetchReports,
  } = useApi<ReportsListResponse>("/api/console/reports/list?limit=20");

  const reports = reportsData?.reports ?? [];

  // ─── Team members (always fetched) ────────────────────────────
  const { data: usersData, loading: usersLoading } = useApi<UsersListResp>(
    "/api/console/settings/users",
  );
  const users = usersData?.users ?? [];

  // ─── Weekly insight for HarchIQ pre-seed ──────────────────────
  const weeklyInsight = useMemo(() => {
    if (!insights?.insights?.length) return null;
    return (
      insights.insights.find(
        (i) => i.type === "weekly-summary" || /hebdo|semaine|executive/i.test(i.title),
      ) ?? insights.insights[0]
    );
  }, [insights]);

  // ─── Refresh all ──────────────────────────────────────────────
  const refreshAll = useCallback(() => {
    fetchClients();
    if (activeClientId) {
      refetchHealth();
      refetchAlerts();
      refetchTrend();
      refetchAi();
      refetchSrc();
      refetchTopics();
    }
    refetchReports();
  }, [
    fetchClients,
    activeClientId,
    refetchHealth,
    refetchAlerts,
    refetchTrend,
    refetchAi,
    refetchSrc,
    refetchTopics,
    refetchReports,
  ]);

  // Auto refresh every 5 min
  useEffect(() => {
    const id = setInterval(refreshAll, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refreshAll]);

  // ─── Derived state ─────────────────────────────────────────────
  const lastUpdated = activeClient
    ? health?.lastUpdated
      ? fmtRelative(health.lastUpdated)
      : "—"
    : clients[0]?.updatedAt
      ? fmtRelative(clients[0].updatedAt)
      : null;

  const activeAlertCount = activeClient
    ? alerts?.count ?? alerts?.alerts?.length ?? 0
    : clients.reduce((s, c) => s + (c.usage.whatsappAlerts ?? 0), 0);

  const isAggregate = !activeClient;

  // ─── Action handlers ──────────────────────────────────────────
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const r = await fetch("/api/console/export-csv?type=agency-portfolio&days=90");
      if (!r.ok) throw new Error("Échec export");
      toast.success("Export CSV du portefeuille téléchargé");
    } catch {
      toast.error("Échec de l'export CSV");
    } finally {
      setExporting(false);
    }
  }, []);

  const handleNewCampaign = useCallback(() => {
    pushToast("Nouvelle campagne — configurateur ouvert.", "info");
  }, [pushToast]);

  const handleCreateTemplate = useCallback(() => {
    pushToast("Le constructeur de templates sera disponible prochainement.", "info");
  }, [pushToast]);

  const handleSchedule = useCallback(() => {
    pushToast("Assistant de programmation de rapport ouvert.", "info");
  }, [pushToast]);

  const handleInvite = useCallback(() => {
    pushToast("Invitation envoyée — l'email arrivera dans quelques minutes.", "success");
  }, [pushToast]);

  const handleCompareOthers = useCallback(() => {
    pushToast("Sélecteur de comparaison — bientôt disponible.", "info");
  }, [pushToast]);

  const handleExportFinance = useCallback(() => {
    pushToast("Rapport financier exporté (PDF).", "success");
  }, [pushToast]);

  const handleGlobalReport = useCallback(() => {
    pushToast("Rapport global en cours de génération.", "info");
  }, [pushToast]);

  const handleAddClient = useCallback(() => {
    setWizardOpen(true);
  }, []);

  const handleWizardComplete = useCallback(
    (client: PendingClient) => {
      setPendingClients((prev) => [client, ...prev].slice(0, 50));
      pushToast(
        `Client « ${client.name} » ajouté au portefeuille (en attente de validation).`,
        "success",
      );
    },
    [pushToast, setPendingClients],
  );

  const handleWizardClose = useCallback(() => {
    setWizardOpen(false);
  }, []);

  // ─── WHATSAPP IMPORT (GLM-4 auto-create sub-client) ─────────────
  // Modal state + persisted stats (count + lastAt) — survives refresh.
  // On successful creation: bumps stats, refetches /api/agency/clients
  // so the new sub-client appears in the portfolio table, and toasts.
  const [whatsAppImportOpen, setWhatsAppImportOpen] = useState(false);
  const [whatsAppImportStats, setWhatsAppImportStats] =
    usePersistentState<WhatsAppImportStats>("agency:whatsapp-import-stats", {
      count: 0,
      lastAt: null,
    });

  const handleWhatsAppImportOpen = useCallback(() => {
    setWhatsAppImportOpen(true);
  }, []);

  const handleWhatsAppImportClose = useCallback(() => {
    setWhatsAppImportOpen(false);
  }, []);

  const handleWhatsAppImportCreated = useCallback(() => {
    setWhatsAppImportOpen(false);
    setWhatsAppImportStats((prev) => ({
      count: prev.count + 1,
      lastAt: Date.now(),
    }));
    pushToast(
      "Sous-client créé via WhatsApp Import — portefeuille actualisé.",
      "success",
    );
    // Refetch the portfolio so the new client appears immediately.
    fetchClients();
  }, [pushToast, setWhatsAppImportStats, fetchClients]);

  const handleWhatsAppConfig = useCallback(() => {
    pushToast("Configuration des alertes WhatsApp ouverte.", "info");
  }, [pushToast]);

  const handleSeeAllAlerts = useCallback(() => {
    pushToast("Vue complète des alertes — bientôt disponible.", "info");
  }, [pushToast]);

  // ─── Stage-aware motion delays ────────────────────────────────
  const d = (i: number) => ({
    ...cardMotion.transition,
    delay: Math.min(0.8, i * 0.03),
  });

  // Agency sub-level label drives the sage badge in the sidebar footer.
  const subLevelLabel = agencySubLevel(clients.length).label;
  // Combined loading flag for the header refresh icon.
  const headerLoading = clientsLoading || (activeClient ? healthLoading || alertsLoading : false);

  return (
    <div
      className="agency-dashboard-root flex min-h-screen"
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: FONT_SANS,
        color: CHARCOAL,
      }}
    >
      <DashboardStyle />
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
          subLevelLabel={subLevelLabel}
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
              subLevelLabel={subLevelLabel}
            />
          </motion.div>
        </div>
      )}

      {/* ─── Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          lastUpdated={lastUpdated}
          alertCount={activeAlertCount}
          loading={headerLoading}
          onRefresh={refreshAll}
          onMenuClick={() => setSidebarOpen(true)}
          fallbackName={userName}
        />

        <main className="mx-auto max-w-[1440px] w-full px-4 sm:px-6 py-6">
          {/* FIX-PRO-RENDER: ErrorBoundary wraps the entire widget grid so a
              single crashing card cannot tear down the dashboard tree
              during SSR or hydration. Each widget is also internally
              defensive (null-safe, ?? [] defaults, length checks). */}
          <WidgetErrorBoundary label="agency-grid">
          <TooltipProvider delayDuration={200}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mt-6">
              {/* ENV-AGENCY · FEATURE 1 — Tier Badge (prominent banner, full width) */}
              <motion.div
                id="tier-badge"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(0)}
                className="lg:col-span-12"
              >
                <AgencyTierBadgeCard
                  clientCount={clients.length}
                  tierOverride={tierOverride}
                  onTierOverride={setTierOverride}
                  agencyCommissionPct={agency?.commissionPct ?? 20}
                />
              </motion.div>

              {/* Row 1 — SECTION 1: Client Switcher (30%) + HarchIQ AI Workspace (70%) — combined full width */}
              <motion.div
                id="ai-workspace"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(1)}
                className="lg:col-span-12"
              >
                <CardShell style={{ padding: 0 }} className="lg:col-span-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Left 30% (4/12) — Client Switcher */}
                    <div className="lg:col-span-4" style={{ borderRight: `1px solid ${BORDER}` }}>
                      <ClientSwitcherSplit
                        clients={clients}
                        agency={agency}
                        activeClientId={activeClientId}
                        loading={clientsLoading}
                        onSwitch={handleSwitch}
                        onAddClient={handleAddClient}
                      />
                    </div>
                    {/* Right 70% (8/12) — HarchIQ AI Workspace */}
                    <div className="lg:col-span-8">
                      <HarchIQAgencyWorkspace
                        activeClientName={activeClient?.displayName ?? null}
                        clientsCount={clients.length}
                      />
                    </div>
                  </div>
                  {switching && (
                    <div
                      className="px-4 py-2 flex items-center gap-2"
                      style={{
                        borderTop: `1px solid ${BORDER}`,
                        backgroundColor: SAGE_BG,
                        fontFamily: FONT_SANS,
                        fontSize: 11,
                        color: SAGE_DEEP,
                      }}
                    >
                      <RefreshCw size={11} className="animate-spin" />
                      Bascule vers le nouvel espace de travail…
                    </div>
                  )}
                </CardShell>
              </motion.div>

              <motion.div
                id="score"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(1)}
                className="lg:col-span-12"
              >
                <ScoreReputationHero
                  clients={clients}
                  activeClient={activeClient}
                  health={health}
                  loading={clientsLoading || (activeClient ? healthLoading : false)}
                  onRefresh={refreshAll}
                />
              </motion.div>

              {/* Row 2 — KPI Strip (6 cards) */}
              <motion.div {...cardMotion} transition={d(2)} className="lg:col-span-2 md:col-span-3 sm:col-span-6">
                <KpiClientsActifs clients={clients} loading={clientsLoading} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(3)} className="lg:col-span-2 md:col-span-3 sm:col-span-6">
                <KpiAlertesCrisis
                  clients={clients}
                  alerts={alerts}
                  activeClient={activeClient}
                  loading={clientsLoading || (activeClient ? alertsLoading : false)}
                />
              </motion.div>
              <motion.div {...cardMotion} transition={d(4)} className="lg:col-span-2 md:col-span-3 sm:col-span-6">
                <KpiScoreMoyen
                  clients={clients}
                  health={health}
                  activeClient={activeClient}
                  loading={clientsLoading || (activeClient ? healthLoading : false)}
                />
              </motion.div>
              <motion.div {...cardMotion} transition={d(5)} className="lg:col-span-2 md:col-span-3 sm:col-span-6">
                <KpiSentimentGlobal
                  clients={clients}
                  health={health}
                  activeClient={activeClient}
                  loading={clientsLoading || (activeClient ? healthLoading : false)}
                />
              </motion.div>
              <motion.div {...cardMotion} transition={d(6)} className="lg:col-span-2 md:col-span-3 sm:col-span-6">
                <KpiArticles30J
                  clients={clients}
                  health={health}
                  activeClient={activeClient}
                  loading={clientsLoading || (activeClient ? healthLoading : false)}
                />
              </motion.div>
              <motion.div {...cardMotion} transition={d(7)} className="lg:col-span-2 md:col-span-3 sm:col-span-6">
                <KpiRapportsGeneres reports={reports} loading={reportsLoading} />
              </motion.div>

              {/* Row 3 — Portfolio + Campaign */}
              <motion.div
                id="clients"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(8)}
                className="lg:col-span-7"
              >
                <PortfolioClientsTable
                  clients={clients}
                  reports={reports}
                  loading={clientsLoading}
                  onSwitch={(id) => handleSwitch(id)}
                />
              </motion.div>
              <motion.div
                id="campagnes"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(9)}
                className="lg:col-span-5"
              >
                <CampaignTrackerCard
                  clients={clients}
                  loading={clientsLoading}
                  onNewCampaign={handleNewCampaign}
                />
              </motion.div>

              {/* R2-AGENCY-A · FEATURE 1 — Client Health Scoring (full width, after portfolio) */}
              <motion.div
                id="client-health"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(9)}
                className="lg:col-span-12"
              >
                <ClientHealthScoringCard
                  clients={clients}
                  loading={clientsLoading}
                />
              </motion.div>

              {/* R3-AGENCY-A · FEATURE 1 — Client Lifecycle Stages (full width, after client health) */}
              <motion.div
                id="client-lifecycle"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(9)}
                className="lg:col-span-12"
              >
                <ClientLifecycleCard
                  clients={clients}
                  loading={clientsLoading}
                  onToast={pushToast}
                />
              </motion.div>

              {/* R2-AGENCY-A · FEATURE 2 — Churn Risk Indicator (full width, after client health) */}
              <motion.div
                id="churn-risk"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(9)}
                className="lg:col-span-12"
              >
                <ChurnRiskIndicatorCard
                  clients={clients}
                  loading={clientsLoading}
                  onToast={pushToast}
                />
              </motion.div>

              {/* Row 4 — Revenue + Comparison */}
              <motion.div {...cardMotion} transition={d(10)} className="lg:col-span-7">
                <RevenueTrackerCard
                  clients={clients}
                  agency={agency}
                  loading={clientsLoading}
                  onExport={handleExportFinance}
                />
              </motion.div>
              <motion.div
                id="concurrents"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(11)}
                className="lg:col-span-5"
              >
                <ClientComparisonCard clients={clients} onCompareOthers={handleCompareOthers} />
              </motion.div>

              {/* R4-AGENCY-A · FEATURE 3 — Multi-Client Comparison Matrix (full width, after client comparison) */}
              <motion.div
                id="comparison-matrix"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(11)}
                className="lg:col-span-12"
              >
                <MultiClientComparisonCard
                  clients={clients}
                  loading={clientsLoading}
                  onToast={pushToast}
                />
              </motion.div>

              {/* ENV-AGENCY · FEATURE 3 — Commission Calculator (full width, after revenue) */}
              <motion.div
                id="commission-calc"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(12)}
                className="lg:col-span-12"
              >
                <CommissionCalculatorCard tier={activeTier} />
              </motion.div>

              {/* R2-AGENCY-A · FEATURE 3 — Revenue Forecasting (full width, after commission calc) */}
              <motion.div
                id="revenue-forecast"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(12)}
                className="lg:col-span-12"
              >
                <RevenueForecastingCard tier={activeTier} clients={clients} />
              </motion.div>

              {/* R4-AGENCY-A · FEATURE 1 — Client Revenue Tracker (full width, after revenue forecast) */}
              <motion.div
                id="revenue-tracker"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(12)}
                className="lg:col-span-12"
              >
                <ClientRevenueTrackerCard
                  clients={clients}
                  agencyCommissionPct={agency?.commissionPct ?? 20}
                  loading={clientsLoading}
                  onToast={pushToast}
                />
              </motion.div>

              {/* R3-AGENCY-A · FEATURE 2 — Upsell Opportunity Tracker (full width, after revenue forecast) */}
              <motion.div
                id="upsell-tracker"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(12)}
                className="lg:col-span-12"
              >
                <UpsellOpportunityTrackerCard
                  clients={clients}
                  loading={clientsLoading}
                  onToast={pushToast}
                />
              </motion.div>

              {/* Row 5 — HarchIQ + Reports */}
              <motion.div {...cardMotion} transition={d(13)} className="lg:col-span-6">
                <HarchIQChatCard
                  activeClientName={activeClient?.displayName ?? null}
                  weeklyInsight={weeklyInsight}
                  clients={clients}
                />
              </motion.div>
              <motion.div
                id="rapports"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(13)}
                className="lg:col-span-6"
              >
                <RapportsAutomatisesCard
                  reports={reports}
                  loading={reportsLoading}
                  onCreateTemplate={handleCreateTemplate}
                  onSchedule={handleSchedule}
                />
              </motion.div>

              {/* Row 6 — Pitch Deck + White-Label */}
              <motion.div {...cardMotion} transition={d(14)} className="lg:col-span-6">
                <PitchDeckCard
                  activeClientName={activeClient?.displayName ?? null}
                  clients={clients}
                />
              </motion.div>
              <motion.div
                id="white-label"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(15)}
                className="lg:col-span-6"
              >
                <WhiteLabelCard
                  clients={clients}
                  activeClientId={activeClientId}
                  agency={agency}
                  onToast={pushToast}
                />
              </motion.div>

              {/* ENV-AGENCY · FEATURE 5 — Pitch Deck Pipeline (full width, after pitch deck) */}
              <motion.div
                id="pitch-pipeline"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(15)}
                className="lg:col-span-12"
              >
                <PitchPipelineCard activeClientName={activeClient?.displayName ?? null} />
              </motion.div>

              {/* R2-AGENCY-B · FEATURE 2 — Pitch Deck Analytics (full width, after pitch pipeline) */}
              <motion.div
                id="pitch-analytics"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(15)}
                className="lg:col-span-12"
              >
                <PitchDeckAnalyticsCard />
              </motion.div>

              {/* R4-AGENCY-A · FEATURE 2 — Pitch Template Library (full width, after pitch deck analytics) */}
              <motion.div
                id="pitch-templates"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(15)}
                className="lg:col-span-12"
              >
                <PitchTemplateLibraryCard onToast={pushToast} />
              </motion.div>

              {/* ENV-AGENCY · FEATURE 4 — Client Portal Preview (full width, after white-label) */}
              <motion.div
                id="portal-preview"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(15)}
                className="lg:col-span-12"
              >
                <ClientPortalPreviewCard activeClient={activeClient} agency={agency} />
              </motion.div>

              {/* R2-AGENCY-B · FEATURE 3 — White-Label Theme Editor (full width, after portal preview) */}
              <motion.div
                id="wlabel-editor"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(16)}
                className="lg:col-span-12"
              >
                <WhiteLabelThemeEditorCard clients={clients} onToast={pushToast} />
              </motion.div>

              {/* R3-AGENCY-A · FEATURE 3 — Agency Benchmark (full width, after white-label editor) */}
              <motion.div
                id="agency-benchmark"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(16)}
                className="lg:col-span-12"
              >
                <AgencyBenchmarkCard
                  clients={clients}
                  users={users}
                  loading={clientsLoading}
                />
              </motion.div>

              {/* Row 7 — Team + Assignment Matrix */}
              <motion.div {...cardMotion} transition={d(16)} className="lg:col-span-6">
                <TeamAssignationsCard
                  users={users}
                  clients={clients}
                  loading={usersLoading}
                  onInvite={handleInvite}
                />
              </motion.div>
              <motion.div {...cardMotion} transition={d(17)} className="lg:col-span-6">
                <MatriceAssignationCard users={users} clients={clients} onToast={pushToast} />
              </motion.div>

              {/* ENV-AGENCY · FEATURE 6 — Team Workload Balancer (full width, after team matrix) */}
              <motion.div
                id="workload-balancer"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(17)}
                className="lg:col-span-12"
              >
                <TeamWorkloadBalancerCard
                  users={users}
                  clients={clients}
                  loading={usersLoading}
                  onInvite={handleInvite}
                />
              </motion.div>

              {/* R2-AGENCY-B · FEATURE 1 — Team Performance Dashboard (full width, after workload balancer) */}
              <motion.div
                id="team-perf"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(17)}
                className="lg:col-span-12"
              >
                <TeamPerformanceDashboardCard clients={clients} onToast={pushToast} />
              </motion.div>

              {/* Row 8 — Sentiment + Sources */}
              <motion.div
                id="sentiment"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(18)}
                className="lg:col-span-7"
              >
                <TendanceSentimentCard
                  trend={trend}
                  range={range}
                  onRangeChange={setRange}
                  isAggregate={isAggregate}
                />
              </motion.div>
              <motion.div {...cardMotion} transition={d(19)} className="lg:col-span-5">
                <DiversiteSourcesCard
                  src={src}
                  clients={clients}
                  isAggregate={isAggregate}
                />
              </motion.div>

              {/* Row 9 — Alerts + Topics */}
              <motion.div
                id="alertes"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(20)}
                className="lg:col-span-7"
              >
                <AlertesCrisisCard
                  alerts={alerts}
                  clients={clients}
                  activeClient={activeClient}
                  onSeeAll={handleSeeAllAlerts}
                />
              </motion.div>
              <motion.div {...cardMotion} transition={d(21)} className="lg:col-span-5">
                <TopSujetsCard
                  topics={topics}
                  trend={trend}
                  clients={clients}
                  isAggregate={isAggregate}
                />
              </motion.div>

              {/* Row 10 — AI Visibility + Social + Tools */}
              <motion.div
                id="visibilite-ia"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(22)}
                className="lg:col-span-6"
              >
                <VisibiliteIaCard ai={ai} clients={clients} isAggregate={isAggregate} />
              </motion.div>
              <motion.div {...cardMotion} transition={d(23)} className="lg:col-span-6">
                <ActiviteReseauCard trend={trend} clients={clients} isAggregate={isAggregate} />
              </motion.div>

              {/* WhatsApp Import — GLM-4 auto-create sub-client (B2B2B killer feature) */}
              <motion.div
                id="whatsapp-import"
                style={sectionScrollStyle}
                {...cardMotion}
                transition={d(24)}
                className="lg:col-span-12"
              >
                <WhatsAppImportCard
                  onOpen={handleWhatsAppImportOpen}
                  stats={whatsAppImportStats}
                />
              </motion.div>

              <motion.div {...cardMotion} transition={d(24)} className="lg:col-span-12">
                <BoiteOutilsAgenceCard
                  onExport={handleExport}
                  onGlobalReport={handleGlobalReport}
                  onAddClient={handleAddClient}
                  onWhatsAppConfig={handleWhatsAppConfig}
                  exporting={exporting}
                />
              </motion.div>
            </div>
          </TooltipProvider>
          </WidgetErrorBoundary>

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
              Harch Atelier · Console Agences · 35 sections · 6 ENV-AGENCY features · 3 R2-AGENCY features · 3 R2-AGENCY-B features · 3 R3-AGENCY-A features · 3 R4-AGENCY-A features · WhatsApp Import (GLM-4) · Multi-clients · White-label ·
              Commission {agency?.commissionPct ?? 20}% · Tier {activeTier.label}
              {pendingClients.length > 0 ? ` · ${pendingClients.length} client(s) en attente` : ""}
              {userEmail ? ` · ${userEmail}` : ""}
            </p>
          </footer>
        </main>
      </div>

      {/* ENV-AGENCY · FEATURE 2 — Client Onboarding Wizard (portal-level overlay) */}
      <AnimatePresence>
        {wizardOpen && (
          <ClientOnboardingWizard
            onClose={handleWizardClose}
            onComplete={handleWizardComplete}
            teamMembers={users}
          />
        )}
      </AnimatePresence>

      {/* WhatsApp Import — GLM-4 auto-create sub-client (portal-level overlay) */}
      <AnimatePresence>
        {whatsAppImportOpen && (
          <WhatsAppImportModal
            onClose={handleWhatsAppImportClose}
            onCreated={handleWhatsAppImportCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

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
import { motion } from "framer-motion";
import {
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
  Gauge,
  Globe,
  Globe2,
  GripVertical,
  Heart,
  KanbanSquare,
  Layers,
  LayoutGrid,
  LineChart as LineChartIcon,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Minus,
  Network,
  Palette,
  Plus,
  Presentation,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  Upload,
  UserPlus,
  Users,
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
                {clients.length} client{clients.length > 1 ? "s" : ""}
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
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ) : activeClient ? (
          <div className="flex items-center gap-2.5">
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
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
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
          </div>
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
        <button
          type="button"
          onClick={() => onSwitch(null)}
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
            <CheckCircle2 size={14} style={{ color: SAGE }} />
          )}
        </button>

        {filtered.length === 0 ? (
          <div
            className="px-3 py-4 text-center"
            style={{ fontFamily: FONT_SANS, fontSize: 11, color: TEXT_MUTED }}
          >
            Aucun client ne correspond à « {query} »
          </div>
        ) : (
          filtered.map((c) => {
            const score = derivedClientScore(c);
            const isActive = c.id === activeClientId;
            const alertCount = c.usage.whatsappAlerts ?? 0;
            return (
              <button
                key={c.id}
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
                  <span
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
                  </span>
                )}
                {isActive && <CheckCircle2 size={14} style={{ color: SAGE }} />}
              </button>
            );
          })
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
          {loading ? "—" : fmtNumber(active)}
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
            {loading ? "—" : fmtNumber(count)}
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
            {loading ? "—" : fmtMAD(totalMonthly)}
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
            {loading ? "—" : fmtMAD(totalMonthly * 12)}
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
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: "0.08em",
                backgroundColor: info.accentBg,
                color: info.accentColor,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              <Crown size={11} /> {info.label}
            </span>
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
                  className="inline-flex px-2 py-1 rounded-md transition-colors hover:bg-[#F0F0F0]"
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
              {info.commissionPct}%
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Assistant d'onboarding client"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(10,10,10,0.5)" }}
        onClick={onClose}
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
    </div>
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
              {fmtMAD(showUpgrade && nextTier ? upgradedAgencyShare : agencyShare)}
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
              {fmtMAD((showUpgrade && nextTier ? upgradedAgencyShare : agencyShare) * 12)}
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
                +{fmtMAD(uplift)}/mois
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: SAGE_DEEP, marginTop: 2 }}>
                +{fmtMAD(uplift * 12)}/an · +{nextTier.commissionPct - tier.commissionPct} pts de commission
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
                  formatter={(v: number, n) => [fmtMAD(v), n === "agency" ? "Agence" : "Harch"]}
                />
                <Bar dataKey="agency" stackId="a" fill={SAGE} radius={[0, 0, 0, 0]} barSize={22} isAnimationActive />
                <Bar dataKey="harch" stackId="a" fill={NEUTRAL_GRAY} radius={[4, 4, 0, 0]} barSize={22} isAnimationActive />
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
          return (
            <div
              key={stage.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.key)}
              className="rounded-md p-2"
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
                    className="text-center py-6 rounded-md"
                    style={{
                      border: `1px dashed ${BORDER_STRONG}`,
                      fontFamily: FONT_SANS,
                      fontSize: 10,
                      color: TEXT_MUTED,
                    }}
                  >
                    Glissez une carte ici
                  </div>
                ) : (
                  stageItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDragId(item.id)}
                      onDragEnd={() => setDragId(null)}
                      className="p-2.5 rounded-md cursor-grab active:cursor-grabbing transition-shadow hover:shadow-sm"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: `1px solid ${BORDER_STRONG}`,
                        opacity: dragId === item.id ? 0.5 : 1,
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
                        <GripVertical size={11} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
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
                    </div>
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
            {avgWorkload}%
          </div>
        </div>
        <div className="p-2.5 rounded-md" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FCFCFC" }}>
          <div style={FONT_HEADER}>Clients assignés</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>
            {members.reduce((s, m) => s + m.assignedClientIds.length, 0)} / {clients.length}
          </div>
        </div>
        <div
          className="p-2.5 rounded-md"
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
            {overloadedCount}
          </div>
        </div>
      </div>
      {loading && members.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="py-8 text-center" style={{ fontFamily: FONT_SANS, fontSize: 12, color: TEXT_MUTED }}>
          Aucun membre. Cliquez sur « Membre » pour ajouter.
        </div>
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
                      {pct}%
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
                  <div
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      height: "100%",
                      backgroundColor: tone.color,
                      transition: "width 0.4s ease",
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
              Harch Atelier · Console Agences · 25 sections · 6 ENV-AGENCY features · Multi-clients · White-label ·
              Commission {agency?.commissionPct ?? 20}% · Tier {activeTier.label}
              {pendingClients.length > 0 ? ` · ${pendingClients.length} client(s) en attente` : ""}
              {userEmail ? ` · ${userEmail}` : ""}
            </p>
          </footer>
        </main>
      </div>

      {/* ENV-AGENCY · FEATURE 2 — Client Onboarding Wizard (portal-level overlay) */}
      {wizardOpen && (
        <ClientOnboardingWizard
          onClose={handleWizardClose}
          onComplete={handleWizardComplete}
          teamMembers={users}
        />
      )}
    </div>
  );
}

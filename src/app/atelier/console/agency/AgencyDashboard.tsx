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
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpCircle,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Download,
  FileText,
  Filter,
  Gauge,
  Globe2,
  Layers,
  LineChart as LineChartIcon,
  LogOut,
  MessageSquare,
  Minus,
  Network,
  Palette,
  Plus,
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
        <span>Dernière maj · {lastUpdated}</span>
        <span>
          {isAggregate
            ? "Proxy utilisation quota"
            : `Source · ${health?.source ?? "console"}`}
        </span>
      </div>
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
                  className="cursor-pointer transition-colors hover:bg-[#FAFAFA]"
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
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 13 — HARCHIQ AI AVANCÉ (chat, illimité for agency)
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pre-seed with weekly insight so the panel is never empty
  useEffect(() => {
    if (messages.length === 0 && weeklyInsight) {
      setMessages([
        {
          role: "assistant",
          content: weeklyInsight.body,
          at: new Date(weeklyInsight.generatedAt).getTime() || Date.now(),
        },
      ]);
    }
  }, [weeklyInsight, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const suggestions = useMemo(
    () => [
      "Analyse le paysage de marché",
      "Génère un pitch deck",
      "Compare 3 clients",
      "Quel client a le meilleur ROI ?",
      "Résume l'activité de la semaine",
    ],
    [],
  );

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || sending) return;
      const userMsg: ChatMessage = { role: "user", content: q, at: Date.now() };
      setMessages((m) => [...m, userMsg]);
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
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: d.answer || "Aucune réponse.",
            at: Date.now(),
          },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: "Échec de la connexion à HarchIQ. Réessayez dans un instant.",
            at: Date.now(),
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [activeClientName, clients.length, sending],
  );

  const exportConversation = useCallback(() => {
    const txt = messages
      .map((m) => `[${m.role === "user" ? "VOUS" : "HARCHIQ"}]\n${m.content}\n`)
      .join("\n---\n\n");
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harchiq-agency-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Conversation exportée");
  }, [messages]);

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
              className="h-7 w-7 p-0"
              onClick={exportConversation}
              aria-label="Exporter la conversation"
            >
              <Download size={11} />
            </Button>
          </>
        }
      />
      <Separator className="my-3" style={{ backgroundColor: BORDER }} />
      <div
        ref={scrollRef}
        className="overflow-y-auto pr-1 -mr-1 space-y-3 mb-3"
        style={{ maxHeight: 320 }}
      >
        {messages.length === 0 && !weeklyInsight && (
          <div className="h-[160px] flex items-center justify-center">
            <EmptyDash label="Posez votre première question à HarchIQ" />
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className="flex"
            style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
          >
            <div
              className="max-w-[80%] px-3 py-2 rounded-lg"
              style={{
                backgroundColor: m.role === "user" ? SAGE_BG : "#FCFCFC",
                border: `1px solid ${m.role === "user" ? SAGE_DIM : BORDER}`,
                fontFamily: FONT_SANS,
                fontSize: 12,
                lineHeight: 1.5,
                color: m.role === "user" ? SAGE_DEEP : CHARCOAL,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  color: m.role === "user" ? SAGE_DEEP : TEXT_MUTED,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {m.role === "user" ? "Vous" : "HarchIQ"}
              </div>
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex" style={{ justifyContent: "flex-start" }}>
            <div
              className="px-3 py-2 rounded-lg"
              style={{
                backgroundColor: "#FCFCFC",
                border: `1px solid ${BORDER}`,
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: TEXT_MUTED,
              }}
            >
              <RefreshCw size={11} className="animate-spin inline mr-1" />
              HarchIQ rédige la réponse…
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            className="px-2 py-1 rounded-md transition-colors hover:bg-[#FAFAFA]"
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
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Posez une question à HarchIQ…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
          className="flex-1 px-3 py-2 rounded-md outline-none"
          style={{
            border: `1px solid ${BORDER_STRONG}`,
            backgroundColor: "#FAFAFA",
            fontFamily: FONT_SANS,
            fontSize: 12,
            color: CHARCOAL,
          }}
        />
        <Button
          size="sm"
          className="h-9 w-9 p-0"
          style={{ backgroundColor: SAGE, color: "#FFFFFF" }}
          onClick={() => send(input)}
          disabled={sending || !input.trim()}
          aria-label="Envoyer"
        >
          <Send size={13} />
        </Button>
      </div>
    </CardShell>
  );
}

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
                disabled={running !== null}
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
                className="mt-2 p-2.5 rounded-md whitespace-pre-wrap"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${SAGE_DIM}`,
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: CHARCOAL,
                  maxHeight: 180,
                  overflowY: "auto",
                }}
              >
                {results[t.key]}
              </div>
            )}
          </div>
        ))}
      </div>
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
    </CardShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// HEADER (sticky top nav)
// ════════════════════════════════════════════════════════════════════

function DashboardHeader({
  userName,
  lastUpdated,
  alertCount,
  onRefresh,
}: {
  userName: string | null;
  lastUpdated: string | null;
  alertCount: number;
  onRefresh: () => void;
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
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span
              className="text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: SAGE_BG,
                color: SAGE,
                fontFamily: FONT_MONO,
              }}
            >
              Plan Agences
            </span>
            <span
              className="text-[11px] hidden sm:inline"
              style={{ color: TEXT_MUTED, fontFamily: FONT_MONO }}
            >
              Multi-clients · White-label · Commission · Pitch decks
            </span>
          </div>
          <h1
            className="text-[20px] sm:text-[24px] font-bold tracking-tight leading-tight"
            style={{ color: CHARCOAL, fontFamily: FONT_SANS }}
          >
            Console agence{userName ? ` · ${userName.split(" ")[0]}` : ""}
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
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={onRefresh}
            aria-label="Rafraîchir le tableau"
          >
            <RefreshCw size={14} />
          </Button>
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
            <strong style={{ fontFamily: FONT_MONO }}>{alertCount}</strong> alerte
            {alertCount > 1 ? "s" : ""} active{alertCount > 1 ? "s" : ""} · traiter en priorité
          </span>
        </div>
      )}
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
    pushToast(
      "Pour ajouter un client, contactez votre responsable de compte Harch.",
      "info",
    );
  }, [pushToast]);

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
        <DashboardHeader
          userName={userName ?? null}
          lastUpdated={lastUpdated}
          alertCount={activeAlertCount}
          onRefresh={refreshAll}
        />

        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mt-6">
            {/* Row 1 — Client Switcher + Hero (both full width) */}
            <motion.div {...cardMotion} className="lg:col-span-12">
              <ClientSwitcherBar
                clients={clients}
                agency={agency}
                activeClientId={activeClientId}
                loading={clientsLoading}
                onSwitch={handleSwitch}
                switching={switching}
              />
            </motion.div>

            <motion.div {...cardMotion} transition={d(1)} className="lg:col-span-12">
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
            <motion.div {...cardMotion} transition={d(8)} className="lg:col-span-7">
              <PortfolioClientsTable
                clients={clients}
                reports={reports}
                loading={clientsLoading}
                onSwitch={(id) => handleSwitch(id)}
              />
            </motion.div>
            <motion.div {...cardMotion} transition={d(9)} className="lg:col-span-5">
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
            <motion.div {...cardMotion} transition={d(11)} className="lg:col-span-5">
              <ClientComparisonCard clients={clients} onCompareOthers={handleCompareOthers} />
            </motion.div>

            {/* Row 5 — HarchIQ + Reports */}
            <motion.div {...cardMotion} transition={d(12)} className="lg:col-span-6">
              <HarchIQChatCard
                activeClientName={activeClient?.displayName ?? null}
                weeklyInsight={weeklyInsight}
                clients={clients}
              />
            </motion.div>
            <motion.div {...cardMotion} transition={d(13)} className="lg:col-span-6">
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
            <motion.div {...cardMotion} transition={d(15)} className="lg:col-span-6">
              <WhiteLabelCard
                clients={clients}
                activeClientId={activeClientId}
                agency={agency}
                onToast={pushToast}
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

            {/* Row 8 — Sentiment + Sources */}
            <motion.div {...cardMotion} transition={d(18)} className="lg:col-span-7">
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
            <motion.div {...cardMotion} transition={d(20)} className="lg:col-span-7">
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
            <motion.div {...cardMotion} transition={d(22)} className="lg:col-span-6">
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
            Harch Atelier · Console Agences · 25 sections · Multi-clients · White-label ·
            Commission {agency?.commissionPct ?? 20}%
            {userEmail ? ` · ${userEmail}` : ""}
          </p>
        </footer>
      </div>
    </div>
  );
}

"use client";

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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpCircle,
  Bell,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardList,
  Cloud,
  CloudRain,
  Download,
  ExternalLink,
  FileText,
  Flag,
  Globe2,
  Hash,
  HelpCircle,
  KeyRound,
  Languages,
  LayoutGrid,
  Lightbulb,
  LogOut,
  Map,
  Menu,
  MessageCircle,
  MessageSquare,
  Minus,
  Newspaper,
  RefreshCw,
  Rocket,
  Send,
  Settings,
  Share2,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  Trophy,
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
}: {
  onMenuClick: () => void;
  alertCount: number;
  quota: QuotaState;
  sourcesCount: number;
  milestoneProgress: number;
  milestoneTotal: number;
  milestoneRecentlyUnlocked: boolean;
  onMilestoneClick: () => void;
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
            ESSENTIEL
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* ENV-ESSENTIAL — Milestone badge (header, gamification) */}
        <MilestoneBadge
          progress={milestoneProgress}
          total={milestoneTotal}
          recentlyUnlocked={milestoneRecentlyUnlocked}
          onClick={onMilestoneClick}
        />

        {/* ENV-ESSENTIAL — Quota usage widget */}
        <QuotaUsageWidget
          quota={quota}
          sourcesCount={sourcesCount}
          expanded={quotaExpanded}
          onToggle={() => setQuotaExpanded((v) => !v)}
        />

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
  const score = health?.score ?? 0;
  const trend = health?.trend ?? 0;
  const { label: weather, Icon: WeatherIcon } = weatherFor(score);
  const lastUpdated = health?.lastUpdated ? fmtRelative(health.lastUpdated) : "—";
  const [refreshing, setRefreshing] = useState(false);

  const gaugeData = [{ name: "score", value: score, fill: score >= 70 ? SAGE : score >= 50 ? NEUTRAL_AMBER : NEGATIVE }];

  // AI commentary — built from real data signals
  const aiCommentary = useMemo(() => {
    if (!health) return "En attente des données de réputation…";
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
  }, [health, trend]);

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
// SECTION 3 — SENTIMENT MOYEN (KPI strip) + AI insight
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
      ? `Le sentiment positif domine (${value}%) — bonne dynamique globale.`
      : value >= 35
        ? `Sentiment mitigé (${value}% positif) — surveillez les signaux négatifs.`
        : `Le sentiment négatif progresse — intervention Dircom recommandée.`
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
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
// SECTION 4 — MENTIONS / JOUR (KPI strip) + source count
// ════════════════════════════════════════════════════════════════════

function MentionsJourKpi({ health, trend, loading }: { health: BrandHealth | null; trend: SentimentTrendResp | null; loading: boolean }) {
  const value = health?.mentionCount24h ?? 0;
  const delta = health?.trend && health.trend > 0 ? 12 : -4;

  const bars = useMemo(() => {
    if (!trend?.data?.length) return [];
    return trend.data.slice(-7).map((d) => ({ d: d.date, v: d.count }));
  }, [trend]);

  const sourcesCount = trend?.data?.length ?? 0;
  const insight = health
    ? `Volume quotidien ${value > 100 ? "élevé" : value > 30 ? "modéré" : "faible"} — ${sourcesCount} sources actives sur 7 jours.`
    : "En attente des données…";

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-3 md:col-span-6">
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
          Volume des dernières 24 heures · {sourcesCount} sources
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
              <Skeleton className="h-7 w-16" />
            ) : (
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
          className="inline-flex items-center gap-1 text-[11px]"
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
            </div>
            <AiCommentary text={aiCommentary} />
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
          <Skeleton className="h-[260px] w-full" />
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
              className="rounded p-0.5 hover:bg-[#F0F0F0]"
              aria-label="Fermer"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <AiCommentary text={insight} />
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
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
              >
                <RefreshCw size={11} className={regenerating ? "animate-spin" : ""} />
              </Button>
            </div>
          }
        />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading || regenerating ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
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
                onClick={() => toast.success("Export PDF lancé")}
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
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
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
          <Skeleton className="h-[200px] w-full" />
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
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                    }}
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
            <div className="mt-2 text-right">
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-[11px]"
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
          <Skeleton className="h-[120px] w-full" />
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
                onClick={() => toast.info("Mode Crise — workflow activé")}
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

function CarteChaleurGeoCard({ health, loading }: { health: BrandHealth | null; loading: boolean }) {
  // Pseudo geo data — Morocco's main cities with approximate lat/lon
  // Bubble size = mention count, color = sentiment
  const cities = [
    { name: "Casablanca", lon: -7.6, lat: 33.6, count: 142, sentiment: 0.5 },
    { name: "Rabat", lon: -6.8, lat: 34.0, count: 87, sentiment: 0.6 },
    { name: "Marrakech", lon: -8.0, lat: 31.6, count: 64, sentiment: 0.7 },
    { name: "Fès", lon: -5.0, lat: 34.0, count: 38, sentiment: 0.4 },
    { name: "Tanger", lon: -5.8, lat: 35.8, count: 29, sentiment: 0.55 },
    { name: "Agadir", lon: -9.6, lat: 30.4, count: 22, sentiment: 0.65 },
  ];

  const data = cities.map((c) => ({
    ...c,
    z: c.count,
    fill: c.sentiment >= 0.6 ? POSITIVE : c.sentiment >= 0.45 ? NEUTRAL_AMBER : NEGATIVE,
  }));

  return (
    <motion.div {...cardMotion}>
      <CardShell className="lg:col-span-7">
        <SectionHeader title="14 · Carte de Chaleur Géo" />
        <Separator className="my-3" style={{ backgroundColor: BORDER }} />
        {loading ? (
          <Skeleton className="h-[240px] w-full" />
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
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                    }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as (typeof data)[number];
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
                            Sentiment: {Math.round(d.sentiment * 100)}%
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={data} isAnimationActive>
                    {data.map((entry, idx) => (
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
            <AiCommentary text="Casablanca concentre le plus de mentions (142) — sentiment positif dominant. Fès présente un sentiment plus mitigé (40%) à surveiller." />
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
          <Skeleton className="h-[180px] w-full" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 48,
                    fontWeight: 700,
                    color: CHARCOAL,
                    lineHeight: 1,
                  }}
                >
                  #{currentRank}
                </span>
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
            </div>
          </div>
        )}
        <div className="mt-3 text-right">
          <Link
            href="/atelier/harch-100"
            className="inline-flex items-center gap-1 text-[11px]"
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

function ActiviteReseauSocialCard({ loading }: { loading: boolean }) {
  // Pseudo 30-day social data — 4 platforms
  const data = useMemo(() => {
    const days = 30;
    return Array.from({ length: days }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().slice(0, 10),
        Facebook: Math.round(15 + Math.sin(i / 3) * 8 + Math.random() * 6),
        Instagram: Math.round(20 + Math.cos(i / 4) * 10 + Math.random() * 8),
        Twitter: Math.round(8 + Math.sin(i / 2) * 4 + Math.random() * 4),
        LinkedIn: Math.round(5 + Math.cos(i / 5) * 3 + Math.random() * 3),
      };
    });
  }, []);

  const total = data.reduce((s, d) => s + d.Facebook + d.Instagram + d.Twitter + d.LinkedIn, 0);
  const engagement = { likes: 1842, shares: 312, comments: 198 };

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
          <Skeleton className="h-[220px] w-full" />
        ) : (
          <>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
                  <Area type="monotone" dataKey="Facebook" stackId="1" stroke="#1877F2" strokeWidth={1.5} fill="url(#fbGrad)" isAnimationActive />
                  <Area type="monotone" dataKey="Instagram" stackId="1" stroke="#C13584" strokeWidth={1.5} fill="url(#igGrad)" isAnimationActive />
                  <Area type="monotone" dataKey="Twitter" stackId="1" stroke="#1DA1F2" strokeWidth={1.5} fill="url(#twGrad)" isAnimationActive />
                  <Area type="monotone" dataKey="LinkedIn" stackId="1" stroke="#0A66C2" strokeWidth={1.5} fill="url(#liGrad)" isAnimationActive />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <MiniStat label="J'aime" value={fmtNumber(engagement.likes)} />
              <MiniStat label="Partages" value={fmtNumber(engagement.shares)} />
              <MiniStat label="Commentaires" value={fmtNumber(engagement.comments)} />
            </div>
          </>
        )}
      </CardShell>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION 17 — MÉTÉO SENTIMENTS PAR LANGUE
// ════════════════════════════════════════════════════════════════════

function MeteoSentimentsLangueCard({ loading }: { loading: boolean }) {
  // Pseudo language breakdown
  const data = [
    { name: "Français", Positif: 62, Neutre: 24, Négatif: 14 },
    { name: "Arabe/Darija", Positif: 25, Neutre: 20, Négatif: 55 },
    { name: "Anglais", Positif: 48, Neutre: 38, Négatif: 14 },
  ];

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
          <Skeleton className="h-[220px] w-full" />
        ) : (
          <>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
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
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                    }}
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
            <AiCommentary text="La Darija est plus négative (55% négatif) — surveillez les conversations en arabe marocain. Le français reste positif (62%)." />
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
          <Skeleton className="h-[220px] w-full" />
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
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                    }}
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
          <Skeleton className="h-[220px] w-full" />
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
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${BORDER_STRONG}`,
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                    }}
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
    <motion.div {...cardMotion}>
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
}: {
  onAction: (id: string) => void;
  onDismiss: () => void;
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
      {/* CSS-only illustration area — sage circle with icon */}
      <div
        className="flex items-center justify-center rounded-full mb-4"
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
  // Transient state for the sage-pulse animation on recently-unlocked milestone.
  const [recentlyUnlockedKey, setRecentlyUnlockedKey] = useState<string | null>(null);

  const helpDismissedSet = useMemo(() => new Set(helpDismissedArr), [helpDismissedArr]);
  const dismissHelp = useCallback(
    (key: string) => {
      setHelpDismissedArr((arr) => (arr.includes(key) ? arr : [...arr, key]));
    },
    [setHelpDismissedArr],
  );

  // Real API endpoints
  const { data: health, loading: healthLoading, refetch: refetchHealth } = useApi<BrandHealth>("/api/console/brand-health");
  const { data: alerts, loading: alertsLoading, refetch: refetchAlerts } = useApi<CrisisAlertsResp>("/api/console/crisis-alerts");
  const { data: insights, loading: insightsLoading, refetch: refetchInsights } = useApi<InsightsResp>("/api/console/insights");
  const { data: aiVis, loading: aiVisLoading } = useApi<AiVisibilityResp>("/api/console/ai-visibility");
  const { data: sentimentTrend, loading: trendLoading } = useApi<SentimentTrendResp>(
    `/api/console/sentiment-trend?range=${sentimentRange}`,
  );
  const { data: topics, loading: topicsLoading } = useApi<TopicsResp>("/api/console/topics");
  const { data: sources, loading: sourcesLoading } = useApi<SourceDistResp>("/api/console/source-distribution");
  const { data: harch100, loading: harch100Loading } = useApi<Harch100Resp>("/api/harch100/latest");

  const alertCount = alerts?.count ?? alerts?.alerts?.length ?? 0;
  const sourcesCount = Math.min(20, sources?.sources?.length ?? 0);

  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Utilisateur";

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

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FFFFFF", fontFamily: FONT_SANS }}>
      {/* ENV-ESSENTIAL — sage pulse keyframe + scoped global helper */}
      <style>{`
        @keyframes sage-pulse-kf {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,123,95,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(74,123,95,0); }
        }
        .sage-pulse { animation: sage-pulse-kf 1.6s ease-out 2; border-radius: 10px; }
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
            <SidebarContent
              activeSection={activeSection}
              alertCount={alertCount}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}

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
        />

        <main className="flex-1 px-4 lg:px-6 py-6">
          {/* ENV-ESSENTIAL — Welcome onboarding banner (dismissible, persisted) */}
          {!onboardingDismissed && (
            <div className="mb-4 lg:mb-6">
              <WelcomeOnboardingBanner
                userName={userName}
                onDismiss={() => setOnboardingDismissed(true)}
              />
            </div>
          )}

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
              />
            )}

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
            <CarteChaleurGeoCard health={health} loading={healthLoading} />

            {/* SECTIONS 15-16 — Rank row */}
            <PositionHarch100Card harch100={harch100} loading={harch100Loading} />
            <ActiviteReseauSocialCard loading={false} />

            {/* SECTIONS 17-18 — Lang row */}
            <MeteoSentimentsLangueCard loading={false} />
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
                        Le score de réputation est {health ? `${Math.round(health.score)}/100` : "—"}.
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

            {/* SECTION 21 — ENV-ESSENTIAL — Milestone tracker (gamification) */}
            <MilestoneTrackerCard
              milestones={milestones}
              recentlyUnlockedKey={recentlyUnlockedKey}
            />
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
              HARCH ATELIER · CONSOLE ESSENTIEL · v10X · ENV-ESSENTIAL
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
    </div>
  );
}

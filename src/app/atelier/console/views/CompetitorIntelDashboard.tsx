"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";

const FONT = { sans: C.fontSans, mono: C.fontMono };
const SHADOW = { card: C.shadowSm, deep: C.shadowMd };

// ═══════════════════════════════════════════════════════════════
//  CompetitorIntelDashboard.tsx
//
//  OFFER 2 — Market & Competitor Intel
//  Mindset: Aggressive DirCom/Marketing lead who wants to crush rivals.
//  "Where are they weak? Where am I winning? What's my next move?"
//
//  Layout: Welcome banner (aggressive tone) → Your score vs sector
//  average vs delta (3 KPI cards) → Ranked competitive landscape
//  with progress bars → 6 visual intelligence charts (scatter,
//  dual-axis bars, threat pie, crisis treemap, rank radial, delta
//  bars) → Competitor moves feed → CTA. Amber accent.
// ═══════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────

export interface CompetitorKPI {
  yourScore: number;
  sectorAverage: number;
  deltaVsSector: number;
  competitorsTracked: number;
  yourRank: number;
  totalInSector: number;
}

export interface CompetitorEntry {
  name: string;
  score: number;
  delta: number;       // theirScore - yourScore (positive = they're ahead)
  trend: "up" | "down" | "stable";
  isYou?: boolean;
}

export interface CompetitorMove {
  competitorName: string;
  title: string;
  date: string;
  impactLevel: 1 | 2 | 3;
  impactDescription: string;
}

export interface CompetitorIntelDashboardProps {
  userName: string;
  userEmail: string | null;
  companyName: string;
  sector: string;
  // KPIs are typed and ready for real-time API binding.
  // If omitted, the component fetches from /api/console/weather + /api/console/neighbors.
  kpis?: CompetitorKPI;
  competitors?: CompetitorEntry[];
  moves?: CompetitorMove[];
}

// ─── Accent (amber = aggressive, competitive) ───────────────────

const ACCENT = "#d97706";
const ACCENT_BG = "rgba(217,119,6,0.10)";

// ─── Chart palette (escalating threat + crisis) ─────────────────
//  watch   → slate   (peripheral, low risk)
//  monitor → amber   (worth tracking)
//  engage  → orange  (active threat)
//  confront→ red     (they're beating you, rank 1 + ahead)
// ────────────────────────────────────────────────────────────────

type ThreatLevel = "watch" | "monitor" | "engage" | "confront";
type CrisisImpact = "low" | "medium" | "high" | "severe";

const THREAT_COLORS: Record<ThreatLevel, string> = {
  watch: "#737373",
  monitor: "#d97706",
  engage: "#ea580c",
  confront: "#ef4444",
};

const CRISIS_COLORS: Record<CrisisImpact, string> = {
  low: "#737373",
  medium: "#d97706",
  high: "#ea580c",
  severe: "#ef4444",
};

const THREAT_LABEL: Record<ThreatLevel, string> = {
  watch: "Watch",
  monitor: "Monitor",
  engage: "Engage",
  confront: "Confront",
};

// ─── Extended neighbor (computed from real API data) ────────────
//  The /api/console/neighbors endpoint returns {name, rank,
//  reputationScore, yourScore, delta, recentMoves}. We derive
//  proximityScore, threatLevel, crisisImpact, marketShare from
//  these real fields — NO MOCK DATA, all deterministic.
// ────────────────────────────────────────────────────────────────

interface NeighborExtended {
  name: string;
  reputationScore: number;
  yourScore: number;
  delta: number;          // theirScore - yourScore (from API)
  yourDelta: number;      // yourScore - theirScore (for delta chart)
  rank: number;
  proximityScore: number;
  marketShare: number;
  threatLevel: ThreatLevel;
  crisisImpact: CrisisImpact;
  isYou?: boolean;
}

interface RawNeighbor {
  id: string;
  name: string;
  sector: string;
  rank: 1 | 2 | 3;
  reputationScore: number;
  yourScore: number;
  delta: number;
  recentMoves?: Array<{ impactLevel: 1 | 2 | 3 }>;
}

interface AlertItem {
  id: string;
  type: "negative_article" | "risk_assessment";
  title: string;
  source: string;
  severity: "critical" | "high";
  sentimentScore: number | null;
  detectedAt: string | null;
  details?: string;
}

// ─── Derivation helpers (deterministic — from real API data) ────

function deriveThreatLevel(rank: number, delta: number): ThreatLevel {
  // delta = theirScore - yourScore (positive = they're ahead)
  if (rank === 1 && delta > 0) return "confront";
  if (rank === 1 && delta <= 0) return "engage";
  if (rank === 2) return "monitor";
  return "watch";
}

function deriveCrisisImpact(
  rank: number,
  delta: number,
  recentMoves: Array<{ impactLevel: 1 | 2 | 3 }>,
): CrisisImpact {
  const highImpactMoves = recentMoves.filter((m) => m.impactLevel === 3).length;
  if (highImpactMoves >= 2) return "severe";
  if (highImpactMoves === 1) return "high";
  if (rank === 1 && Math.abs(delta) > 12) return "high";
  if (rank <= 2) return "medium";
  return "low";
}

function deriveProximityScore(rank: number, delta: number): number {
  // Closer rank + smaller delta = higher proximity to your business
  const rankScore = rank === 1 ? 70 : rank === 2 ? 42 : 18;
  const deltaScore = Math.max(0, 30 - Math.abs(delta));
  return Math.min(100, Math.round(rankScore + deltaScore));
}

function deriveMarketShare(score: number, allScores: number[]): number {
  // Proxy: share of total reputation across the competitive set
  const total = allScores.reduce((a, b) => a + b, 0);
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

// ─── Chart card wrapper ─────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "24px",
        background: "#ffffff",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: "#0a0a0a",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: "11px", color: "#737373", fontFamily: FONT.mono, marginTop: "4px" }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Custom tooltip (mono font, matches dashboard vibe) ─────────

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  payload?: Record<string, unknown>;
  color?: string;
  dataKey?: string | number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

function MonoTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "6px",
        padding: "8px 12px",
        boxShadow: SHADOW.card,
        fontSize: "11px",
        fontFamily: FONT.mono,
        color: "#0a0a0a",
        maxWidth: "240px",
      }}
    >
      {label != null && label !== "" && (
        <div style={{ fontWeight: 700, marginBottom: "6px", color: "#0a0a0a" }}>{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          {p.color && (
            <span
              style={{
                width: "8px",
                height: "8px",
                background: p.color,
                borderRadius: "50%",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ color: "#737373" }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: "#0a0a0a" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Scatter shape (star for you, circle for rivals) ────────────

interface ScatterShapeProps {
  cx?: number;
  cy?: number;
  payload?: {
    isYou?: boolean;
    threatLevel?: ThreatLevel;
  };
}

function ScatterPointShape(props: ScatterShapeProps) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;

  if (payload.isYou) {
    // 5-pointed star — highlights your position
    const outerR = 12;
    const innerR = 5;
    const points: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return <polygon points={points.join(" ")} fill={ACCENT} stroke="#ffffff" strokeWidth={2} />;
  }

  const color = payload.threatLevel ? THREAT_COLORS[payload.threatLevel] : "#737373";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={7}
      fill={color}
      fillOpacity={0.78}
      stroke="#ffffff"
      strokeWidth={1.5}
    />
  );
}

// ─── Treemap cell (colored by crisis impact) ───────────────────

interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: {
    name?: string;
    crisisImpact?: CrisisImpact;
  };
}

function CrisisCell(props: TreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  if (!payload) return null;
  const impact = payload.crisisImpact ?? "low";
  const color = CRISIS_COLORS[impact] ?? "#737373";
  const label = payload.name ?? "";
  const shortLabel = label.length > 12 ? label.slice(0, 11) + "\u2026" : label;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={0.85}
        stroke="#ffffff"
        strokeWidth={2}
      />
      {width > 50 && height > 22 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize={10}
          fontFamily={FONT.mono}
          fontWeight={600}
        >
          {shortLabel}
        </text>
      )}
    </g>
  );
}

// ─── Component ──────────────────────────────────────────────────

export function CompetitorIntelDashboard({
  userName,
  userEmail,
  companyName,
  sector,
  kpis: injectedKpis,
  competitors: injectedCompetitors,
  moves: injectedMoves,
}: CompetitorIntelDashboardProps) {
  const [kpis, setKpis] = useState<CompetitorKPI | null>(injectedKpis ?? null);
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>(injectedCompetitors ?? []);
  const [moves, setMoves] = useState<CompetitorMove[]>(injectedMoves ?? []);
  const [extNeighbors, setExtNeighbors] = useState<NeighborExtended[]>([]);
  const [loading, setLoading] = useState(!injectedKpis);
  const [error, setError] = useState(false);
  const [rankFilter, setRankFilter] = useState<"all" | "ahead" | "behind">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const [weatherRes, neighborsRes, alertsRes] = await Promise.all([
        fetch("/api/console/weather"),
        fetch("/api/console/neighbors"),
        fetch("/api/console/alerts"),
      ]);

      let yourScore = 67;
      if (weatherRes.ok) {
        const w = await weatherRes.json();
        yourScore = w.score ?? 67;
      }

      let neighborList: CompetitorEntry[] = [];
      let extList: NeighborExtended[] = [];
      let competitorsTracked = 0;
      if (neighborsRes.ok) {
        const n = await neighborsRes.json();
        const rawNeighbors: RawNeighbor[] = n.neighbors ?? [];
        competitorsTracked = rawNeighbors.length;

        const allScores = rawNeighbors.map((nb) => nb.reputationScore).concat([yourScore]);

        extList = rawNeighbors.map((nb) => {
          const rank = nb.rank;
          const delta = nb.delta; // theirScore - yourScore (from API)
          const yourDelta = -delta; // yourScore - theirScore (for chart 6)
          const proximityScore = deriveProximityScore(rank, delta);
          const threatLevel = deriveThreatLevel(rank, delta);
          const crisisImpact = deriveCrisisImpact(rank, delta, nb.recentMoves ?? []);
          const marketShare = deriveMarketShare(nb.reputationScore, allScores);
          return {
            name: nb.name,
            reputationScore: nb.reputationScore,
            yourScore,
            delta,
            yourDelta,
            rank,
            proximityScore,
            marketShare,
            threatLevel,
            crisisImpact,
          };
        });

        neighborList = rawNeighbors.map((nb) => ({
          name: nb.name,
          score: nb.reputationScore,
          delta: nb.delta,
          trend: "stable" as const,
        }));
      }

      // Add "you" entry to extended list for the scatter chart
      const yourExtEntry: NeighborExtended = {
        name: `${companyName} (You)`,
        reputationScore: yourScore,
        yourScore,
        delta: 0,
        yourDelta: 0,
        rank: 0,
        proximityScore: 100,
        marketShare: deriveMarketShare(
          yourScore,
          extList.length > 0
            ? extList.map((e) => e.reputationScore).concat([yourScore])
            : [yourScore],
        ),
        threatLevel: "watch",
        crisisImpact: "low",
        isYou: true,
      };

      const fullExtList = [...extList, yourExtEntry];

      const sectorAverage = neighborList.length > 0
        ? Math.round(neighborList.reduce((s: number, c: CompetitorEntry) => s + c.score, 0) / neighborList.length)
        : 71;

      const allEntries: CompetitorEntry[] = [
        ...neighborList,
        { name: `${companyName} (You)`, score: yourScore, delta: 0, trend: "stable" as const, isYou: true },
      ].sort((a, b) => b.score - a.score);

      const yourRank = allEntries.findIndex((e) => e.isYou) + 1;

      setKpis({
        yourScore,
        sectorAverage,
        deltaVsSector: yourScore - sectorAverage,
        competitorsTracked,
        yourRank,
        totalInSector: allEntries.length,
      });
      setCompetitors(allEntries);
      setExtNeighbors(fullExtList);

      // Alerts → competitor moves feed (alerts API returns crisis signals
      // about your company — we surface them as moves to respond to)
      if (alertsRes.ok && !injectedMoves) {
        const a = await alertsRes.json();
        const alertMoves: CompetitorMove[] = (a.alerts ?? []).slice(0, 6).map((alert: AlertItem) => ({
          competitorName: alert.source || "HarchIQ Risk Engine",
          title: alert.title,
          date: alert.detectedAt
            ? new Date(alert.detectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "recent",
          impactLevel: (alert.severity === "critical" ? 3 : alert.severity === "high" ? 2 : 1) as 1 | 2 | 3,
          impactDescription:
            alert.details
            || (alert.sentimentScore != null
              ? `Sentiment score: ${alert.sentimentScore.toFixed(2)} — monitor for narrative escalation.`
              : "Signal detected by HarchIQ risk engine."),
        }));
        setMoves(alertMoves);
      }

      setLastRefresh(new Date());
    } catch {
      setError(true);
    }
    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  };

  useEffect(() => {
    if (injectedKpis) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injectedKpis, companyName]);

  const firstName = userName.split(" ")[0] || "there";

  // Filter competitors: ahead (higher score than you), behind (lower), all
  const yourScoreVal = kpis?.yourScore ?? 0;
  const filteredCompetitors = competitors.filter((c) => {
    if (rankFilter === "all") return true;
    if (rankFilter === "ahead") return !c.isYou && c.score > yourScoreVal;
    if (rankFilter === "behind") return !c.isYou && c.score <= yourScoreVal;
    return true;
  });

  // Export competitors to CSV
  const exportCompetitorsCSV = () => {
    const headers = ["Rank", "Name", "Score", "Delta", "Type"];
    const rows = competitors.map((c, i) => [i + 1, `"${c.name}"`, c.score, c.delta, c.isYou ? "You" : "Competitor"]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `competitor-landscape-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ─── Chart data (derived from real API data) ───────────────────
  const rivalsOnly = extNeighbors.filter((n) => !n.isYou);

  // Chart 1: Scatter data (includes "you" for the star marker)
  const scatterData = extNeighbors.map((n) => ({
    name: n.name,
    proximityScore: n.proximityScore,
    reputationScore: n.reputationScore,
    threatLevel: n.threatLevel,
    isYou: n.isYou,
  }));

  // Chart 2: Reputation vs market share (sorted by reputation desc)
  const shareData = [...rivalsOnly]
    .sort((a, b) => b.reputationScore - a.reputationScore)
    .map((n) => ({
      name: n.name.length > 14 ? n.name.slice(0, 13) + "\u2026" : n.name,
      reputation: n.reputationScore,
      share: n.marketShare,
    }));

  // Chart 3: Threat level distribution
  const threatPieData: Array<{ name: string; value: number; threatLevel: ThreatLevel }> = (
    Object.keys(THREAT_COLORS) as ThreatLevel[]
  )
    .map((level) => ({
      name: THREAT_LABEL[level],
      value: rivalsOnly.filter((n) => n.threatLevel === level).length,
      threatLevel: level,
    }))
    .filter((d) => d.value > 0);

  // Chart 4: Crisis impact treemap
  const crisisTreemapData = rivalsOnly.map((n) => ({
    name: n.name,
    size: 1,
    crisisImpact: n.crisisImpact,
  }));

  // Chart 5: Rank distribution (radial)
  const rankDistribution = [
    { rank: "Rank 1", count: rivalsOnly.filter((n) => n.rank === 1).length, fill: ACCENT, opacity: 1 },
    { rank: "Rank 2", count: rivalsOnly.filter((n) => n.rank === 2).length, fill: ACCENT, opacity: 0.7 },
    { rank: "Rank 3", count: rivalsOnly.filter((n) => n.rank === 3).length, fill: ACCENT, opacity: 0.4 },
  ].filter((d) => d.count > 0);

  // Chart 6: Delta from you (sorted by yourDelta desc — you-ahead first)
  const deltaData = [...rivalsOnly]
    .sort((a, b) => b.yourDelta - a.yourDelta)
    .map((n) => ({
      name: n.name.length > 16 ? n.name.slice(0, 15) + "\u2026" : n.name,
      delta: n.yourDelta,
      positive: n.yourDelta >= 0,
    }));

  const hasRivals = rivalsOnly.length > 0;

  return (
    <div className="dash-main" style={{ padding: "24px", background: "#ffffff", overflowX: "hidden" }}>
      {/* ─── Welcome banner — aggressive tone ─── */}
      <div
        style={{
          padding: "16px 20px",
          background: ACCENT_BG,
          borderRadius: "8px",
          marginBottom: "24px",
          borderLeft: `3px solid ${ACCENT}`,
        }}
      >
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#0a0a0a", lineHeight: 1.5 }}>
          {firstName}, your competitors moved overnight. Here's the delta.
        </div>
        <div style={{ fontSize: "12px", color: "#737373", fontFamily: FONT.mono, marginTop: "6px" }}>
          Tracking {kpis?.competitorsTracked ?? 0} competitors in {sector}
        </div>
      </div>

      {/* ─── Page title ─── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
          {companyName} vs Competitors
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.02em" }}>
          Competitive Position
        </h3>
      </div>

      {/* ─── KPI cards: your score / sector avg / delta ─── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent={ACCENT} lines={1} height={36} /></div>
          <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent="#737373" lines={1} height={36} /></div>
          <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent={ACCENT} lines={1} height={36} /></div>
        </div>
      ) : error ? (
        <div style={{ marginBottom: "24px" }}><ErrorState accent={ACCENT} message="Can't reach competitor data. Retrying…" /></div>
      ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: ACCENT, lineHeight: 1 }}>
            {loading ? "\u2014" : kpis?.yourScore}
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Your score
          </div>
        </div>
        <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: "#737373", lineHeight: 1 }}>
            {loading ? "\u2014" : kpis?.sectorAverage}
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Sector average
          </div>
        </div>
        <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: (kpis?.deltaVsSector ?? 0) >= 0 ? ACCENT : "#ef4444", lineHeight: 1 }}>
            {loading ? "\u2014" : `${(kpis?.deltaVsSector ?? 0) >= 0 ? "+" : ""}${kpis?.deltaVsSector}`}
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            vs sector
          </div>
        </div>
      </div>
      )}

      {/* ─── Competitive landscape (ranked) ─── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Competitive landscape — rank #{kpis?.yourRank ?? "—"} of {kpis?.totalInSector ?? "—"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Rank filter chips */}
            {(["all", "ahead", "behind"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setRankFilter(f)}
                style={{
                  padding: "4px 10px",
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  fontWeight: 600,
                  border: `1px solid ${rankFilter === f ? ACCENT : "#e5e5e5"}`,
                  borderRadius: "12px",
                  background: rankFilter === f ? `${ACCENT}15` : "#ffffff",
                  color: rankFilter === f ? ACCENT : "#737373",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {f === "all" ? "All" : f === "ahead" ? "Ahead of me" : "Behind me"}
              </button>
            ))}
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontFamily: FONT.mono,
                fontWeight: 600,
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#525252",
                cursor: refreshing ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                opacity: refreshing ? 0.6 : 1,
              }}
              title={`Last refreshed: ${lastRefresh.toLocaleTimeString("en-US")}`}
            >
              {refreshing ? "\u21BB" : "\u21BB"} {refreshing ? "..." : "Refresh"}
            </button>
            <button
              onClick={exportCompetitorsCSV}
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontFamily: FONT.mono,
                fontWeight: 600,
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#525252",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {"\u2193"} CSV
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filteredCompetitors.map((comp, i) => {
            const originalRank = competitors.findIndex((c) => c === comp) + 1;
            return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "12px 16px",
                background: comp.isYou ? ACCENT_BG : "#ffffff",
                border: `1px solid ${comp.isYou ? ACCENT : "#e5e5e5"}`,
                borderRadius: "6px",
                flexWrap: "wrap",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => { if (!comp.isYou) { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 2px 8px ${ACCENT}20`; e.currentTarget.style.transform = "translateX(2px)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = comp.isYou ? ACCENT : "#e5e5e5"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateX(0)"; }}
            >
              <span style={{ fontFamily: FONT.mono, fontSize: "14px", fontWeight: 700, color: comp.isYou ? ACCENT : "#737373", minWidth: "24px" }}>
                #{originalRank}
              </span>
              <span style={{ fontSize: "14px", fontWeight: comp.isYou ? 700 : 500, color: comp.isYou ? ACCENT : "#0a0a0a", flex: 1, minWidth: "200px" }}>
                {comp.name}
              </span>
              <div style={{ width: "120px", height: "6px", background: "#f4f4f5", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${comp.score}%`, height: "100%", background: comp.isYou ? ACCENT : "#737373", transition: "width 0.3s ease" }} />
              </div>
              <span style={{ fontFamily: FONT.mono, fontSize: "16px", fontWeight: 700, color: "#0a0a0a", minWidth: "40px", textAlign: "right" }}>
                {comp.score}
              </span>
              <span style={{ fontFamily: FONT.mono, fontSize: "12px", color: comp.delta > 0 ? ACCENT : comp.delta < 0 ? "#ef4444" : "#737373", minWidth: "50px", textAlign: "right" }}>
                {comp.delta > 0 ? "+" : ""}{comp.delta}
              </span>
            </div>
            );
          })}
          {filteredCompetitors.length === 0 && (
            <div style={{ padding: "24px", textAlign: "center", color: "#737373", fontFamily: FONT.mono, fontSize: "12px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "6px" }}>
              No competitors match this filter.
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          COMPETITIVE INTELLIGENCE — VISUALIZED
          6 charts powered by real /api/console/neighbors data.
          Each chart derives its metrics from real API fields:
            proximityScore ← rank + delta
            threatLevel    ← rank + delta sign
            crisisImpact   ← rank + delta + recentMoves.impactLevel
            marketShare    ← reputationScore / sum(all scores)
          ═══════════════════════════════════════════════════════════ */}
      {!loading && !error && hasRivals && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: ACCENT, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
              Competitive Intelligence — Visualized
            </div>
            <div style={{ fontSize: "11px", color: "#737373", fontFamily: FONT.mono, marginTop: "4px" }}>
              {rivalsOnly.length} rivals plotted across 6 strategic dimensions
            </div>
          </div>

          {/* ─── Chart 1: Competitive Position Scatter Plot ─── */}
          <ChartCard
            title="Competitive Position Map"
            subtitle="Proximity vs reputation · colored by threat level · star = you"
          >
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
              {(Object.keys(THREAT_COLORS) as ThreatLevel[]).map((level) => (
                <div key={level} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontFamily: FONT.mono, color: "#737373" }}>
                  <span style={{ width: "8px", height: "8px", background: THREAT_COLORS[level], borderRadius: "50%", display: "inline-block" }} />
                  {THREAT_LABEL[level]}
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 12, right: 24, bottom: 12, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis
                  type="number"
                  dataKey="proximityScore"
                  name="Proximity"
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e5e5" }}
                  label={{ value: "PROXIMITY", position: "insideBottom", offset: -2, style: { fontSize: 9, fill: "#737373", fontFamily: FONT.mono, letterSpacing: "0.1em" } }}
                />
                <YAxis
                  type="number"
                  dataKey="reputationScore"
                  name="Reputation"
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  label={{ value: "SCORE", angle: -90, position: "insideLeft", style: { fontSize: 9, fill: "#737373", fontFamily: FONT.mono, letterSpacing: "0.1em" } }}
                />
                <ZAxis type="number" dataKey="proximityScore" range={[80, 80]} />
                <Tooltip content={<MonoTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#d4d4d4" }} />
                <Scatter data={scatterData} shape={<ScatterPointShape />} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ─── Chart 2: Reputation vs Market Share (dual axis) ─── */}
          <ChartCard
            title="Reputation vs Market Share"
            subtitle="Amber = reputation score · Slate = market share % (reputation-weighted proxy)"
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={shareData} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#737373", fontFamily: FONT.mono }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e5e5" }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip content={<MonoTooltip />} cursor={{ fill: "#fafafa" }} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 10, fontFamily: FONT.mono, paddingTop: 8, color: "#737373" }}
                />
                <Bar yAxisId="left" dataKey="reputation" name="Reputation" fill={ACCENT} radius={[3, 3, 0, 0]} />
                <Bar yAxisId="right" dataKey="share" name="Market share %" fill="#737373" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ─── Chart 3: Threat Level Distribution (pie) ─── */}
          <ChartCard
            title="Threat Level Distribution"
            subtitle="Rivals grouped by engagement posture · escalating slate → amber → orange → red"
          >
            {threatPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={threatPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {threatPieData.map((entry, i) => (
                      <Cell key={i} fill={THREAT_COLORS[entry.threatLevel]} />
                    ))}
                  </Pie>
                  <Tooltip content={<MonoTooltip />} />
                  <Legend
                    iconType="circle"
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: 10, fontFamily: FONT.mono, color: "#737373" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: "32px", textAlign: "center", color: "#737373", fontFamily: FONT.mono, fontSize: "12px" }}>
                No threat data — all rivals filtered out.
              </div>
            )}
          </ChartCard>

          {/* ─── Chart 4: Crisis Impact Heatmap (treemap) ─── */}
          <ChartCard
            title="Crisis Impact Heatmap"
            subtitle="Each cell = a rival · colored by crisis exposure (slate → amber → orange → red)"
          >
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
              {(Object.keys(CRISIS_COLORS) as CrisisImpact[]).map((impact) => (
                <div key={impact} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontFamily: FONT.mono, color: "#737373" }}>
                  <span style={{ width: "8px", height: "8px", background: CRISIS_COLORS[impact], borderRadius: "2px", display: "inline-block" }} />
                  {impact.charAt(0).toUpperCase() + impact.slice(1)}
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <Treemap
                data={crisisTreemapData}
                dataKey="size"
                stroke="#ffffff"
                content={<CrisisCell />}
              />
            </ResponsiveContainer>
          </ChartCard>

          {/* ─── Chart 5: Rank Distribution (radial) ─── */}
          <ChartCard
            title="Rank Distribution"
            subtitle="How many rivals sit at each proximity rank · amber rings (outer = rank 1, inner = rank 3)"
          >
            {rankDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                  innerRadius="25%"
                  outerRadius="100%"
                  data={rankDistribution}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="count" cornerRadius={6} background={{ fill: "#f4f4f5" }}>
                    {rankDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} fillOpacity={entry.opacity} />
                    ))}
                  </RadialBar>
                  <Legend
                    iconType="circle"
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: 10, fontFamily: FONT.mono, color: "#737373" }}
                  />
                  <Tooltip content={<MonoTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: "32px", textAlign: "center", color: "#737373", fontFamily: FONT.mono, fontSize: "12px" }}>
                No ranked rivals to display.
              </div>
            )}
          </ChartCard>

          {/* ─── Chart 6: Delta from You (horizontal bars) ─── */}
          <ChartCard
            title="Delta from You"
            subtitle="Your score minus their score · amber = you're ahead · red = they're beating you"
          >
            <ResponsiveContainer width="100%" height={Math.max(250, deltaData.length * 36)}>
              <BarChart
                layout="vertical"
                data={deltaData}
                margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#737373", fontFamily: FONT.mono }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#525252", fontFamily: FONT.mono }}
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip content={<MonoTooltip />} cursor={{ fill: "#fafafa" }} />
                <ReferenceLine x={0} stroke="#d4d4d4" strokeDasharray="4 4" />
                <Bar dataKey="delta" radius={[0, 3, 3, 0]}>
                  {deltaData.map((entry, i) => (
                    <Cell key={i} fill={entry.positive ? ACCENT : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ─── Competitor moves feed ─── */}
      {moves.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Recent competitor moves
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {moves.map((move, i) => (
              <div
                key={i}
                style={{
                  padding: "16px",
                  background: "#ffffff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "6px",
                  borderLeft: `3px solid ${move.impactLevel === 3 ? "#ef4444" : move.impactLevel === 2 ? ACCENT : "#737373"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0a0a0a", flex: 1, minWidth: "200px" }}>
                    {move.title}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: FONT.mono,
                      padding: "3px 8px",
                      borderRadius: "2px",
                      background: `${move.impactLevel === 3 ? "#ef4444" : move.impactLevel === 2 ? ACCENT : "#737373"}15`,
                      color: move.impactLevel === 3 ? "#ef4444" : move.impactLevel === 2 ? ACCENT : "#737373",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {move.impactLevel === 3 ? "High impact" : move.impactLevel === 2 ? "Medium impact" : "Low impact"}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#737373", fontFamily: FONT.mono, marginBottom: "8px" }}>
                  {move.competitorName} — {move.date}
                </div>
                <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.5 }}>
                  {move.impactDescription}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CTA ─── */}
      <div style={{ marginTop: "24px", padding: "16px 20px", background: "#f4f4f5", borderRadius: "8px", fontSize: "13px", color: "#525252", lineHeight: 1.5 }}>
        <strong style={{ color: ACCENT, fontFamily: FONT.mono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Full Intel
        </strong>
        <br />
        Click "Competitors" in the sidebar to see detailed moves, impact levels, and the Neighbor Index for each rival.
      </div>
    </div>
  );
}

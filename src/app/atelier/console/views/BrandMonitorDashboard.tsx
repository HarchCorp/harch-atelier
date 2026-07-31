"use client";

import { useEffect, useMemo, useState } from "react";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const FONT = { sans: C.fontSans, mono: C.fontMono };
const SHADOW = { card: C.shadowSm, deep: C.shadowMd };

// ═══════════════════════════════════════════════════════════════
//  BrandMonitorDashboard.tsx
//
//  OFFER 1 — Brand Monitor
//  Mindset: Anxious CEO/Comms Director who wants reassurance.
//  "Am I being talked about? Is it bad? Can I sleep tonight?"
//
//  Layout: Welcome banner → Reputation score (big) → Sentiment
//  breakdown bar → Today's signals (real articles) → Sources table.
//  Calm emerald accent. Reassuring tone. Zero competitor data.
// ═══════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────

export interface BrandMonitorKPI {
  reputationScore: number;
  trend: "up" | "down" | "stable";
  trendValue: string;
  sky: string;
  skyDescription: string;
  breakdown: { positive: number; neutral: number; negative: number };
  articleCount: number;
  aiVisibilityScore: number | null;
}

export interface BrandMonitorSignal {
  time: string;
  source: string;
  title: string;
  weight: "strong" | "medium" | "low";
}

export interface BrandMonitorSource {
  name: string;
  articles: number;
  sentiment: string;
}

// Real alert shape returned by /api/console/alerts
export interface BrandMonitorAlert {
  id: string;
  type: "negative_article" | "risk_assessment";
  title: string;
  source: string;
  url: string | null;
  severity: "critical" | "high";
  sentimentScore: number | null;
  detectedAt: string | null;
  details?: string;
}

// Real AI visibility platform shape from /api/console/ai-visibility
export interface BrandMonitorAiPlatform {
  platform: string;
  cited: boolean;
  position: number | null;
  sentiment: string | null;
  confidence: number | null;
  summary: string | null;
  checkedAt: string | null;
}

// Real topic shape from /api/console/topics
export interface BrandMonitorTopic {
  label: string;
  count: number;
  type: "source" | "risk";
}

export interface BrandMonitorDashboardProps {
  userName: string;
  userEmail: string | null;
  companyName: string;
  // KPIs are typed and ready for real-time API binding.
  // If omitted, the component fetches from /api/console/weather.
  kpis?: BrandMonitorKPI;
  signals?: BrandMonitorSignal[];
  sources?: BrandMonitorSource[];
}

// ─── Accent (emerald = calm, reassuring) ────────────────────────

const ACCENT = "#059669";
const ACCENT_BG = "rgba(5,150,105,0.08)";

// ─── Component ──────────────────────────────────────────────────

export function BrandMonitorDashboard({
  userName,
  userEmail,
  companyName,
  kpis: injectedKpis,
  signals: injectedSignals,
  sources: injectedSources,
}: BrandMonitorDashboardProps) {
  const [kpis, setKpis] = useState<BrandMonitorKPI | null>(injectedKpis ?? null);
  const [signals, setSignals] = useState<BrandMonitorSignal[]>(injectedSignals ?? []);
  const [sources, setSources] = useState<BrandMonitorSource[]>(injectedSources ?? []);
  const [alerts, setAlerts] = useState<BrandMonitorAlert[]>([]);
  const [aiEngines, setAiEngines] = useState<BrandMonitorAiPlatform[]>([]);
  const [topics, setTopics] = useState<BrandMonitorTopic[]>([]);
  const [loading, setLoading] = useState(!injectedKpis);
  const [error, setError] = useState(false);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      // Parallel fetch: weather (main) + alerts + ai-visibility + topics (charts)
      const [weatherRes, alertsRes, aiRes, topicsRes] = await Promise.all([
        fetch(`/api/console/weather?range=${timeRange}`),
        fetch(`/api/console/alerts`),
        fetch(`/api/console/ai-visibility`),
        fetch(`/api/console/topics`),
      ]);
      if (!weatherRes.ok) throw new Error("fetch failed");
      const data = await weatherRes.json();
      setKpis({
        reputationScore: data.score ?? 67,
        trend: data.trend ?? "stable",
        trendValue: data.trendValue ?? "",
        sky: data.sky ?? "Partly cloudy",
        skyDescription: data.skyDescription ?? "",
        breakdown: data.breakdown ?? { positive: 58, neutral: 27, negative: 15 },
        articleCount: data.articleCount ?? 0,
        aiVisibilityScore: null,
      });
      setSignals(data.todaySignals ?? []);
      setSources(data.mainSources ?? []);
      // Chart data sources — fail soft so one bad endpoint doesn't break the page
      if (alertsRes.ok) {
        const aJson = await alertsRes.json();
        setAlerts((aJson.alerts ?? []) as BrandMonitorAlert[]);
      }
      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        setAiEngines((aiJson.platforms ?? []) as BrandMonitorAiPlatform[]);
      }
      if (topicsRes.ok) {
        const tJson = await topicsRes.json();
        setTopics((tJson.topics ?? []) as BrandMonitorTopic[]);
      }
      setLastRefresh(new Date());
    } catch {
      setError(true);
    }
    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  };

  // loadData is redefined each render, so we intentionally omit it from the dep
  // array to avoid an infinite loop; exhaustive-deps does not flag it in this config.
  useEffect(() => {
    if (injectedKpis) return;
    loadData();
  }, [injectedKpis, timeRange]);

  const firstName = userName.split(" ")[0] || "there";
  const score = kpis?.reputationScore ?? 67;
  const skyColor = score >= 70 ? ACCENT : score >= 50 ? "#f59e0b" : "#ef4444";

  // Filtered signals based on sentiment filter
  const filteredSignals = signals.filter((s) => {
    if (sentimentFilter === "all") return true;
    // Infer sentiment from weight: strong=positive, medium=neutral, low=negative (simplified)
    if (sentimentFilter === "positive") return s.weight === "strong";
    if (sentimentFilter === "neutral") return s.weight === "medium";
    if (sentimentFilter === "negative") return s.weight === "low";
    return true;
  });

  // Export signals to CSV
  const exportSignalsCSV = () => {
    const headers = ["Time", "Source", "Title", "Weight"];
    const rows = filteredSignals.map((s) => [s.time, s.source, `"${s.title.replace(/"/g, '""')}"`, s.weight]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `brand-monitor-signals-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export sources to CSV
  const exportSourcesCSV = () => {
    const headers = ["Source", "Articles", "Sentiment"];
    const rows = sources.map((s) => [s.name, s.articles, s.sentiment]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `brand-monitor-sources-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ─── Chart datasets (memoized from real API responses) ────────

  // 1. Sentiment trend — group alerts by day, average sentimentScore (-1..1)
  const sentimentTrendData = useMemo(() => {
    const byDay = new Map<string, { sum: number; count: number; ts: number }>();
    for (const a of alerts) {
      if (a.sentimentScore == null || !a.detectedAt) continue;
      const d = new Date(a.detectedAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const ts = d.getTime();
      const existing = byDay.get(key);
      if (existing) {
        existing.sum += a.sentimentScore;
        existing.count += 1;
      } else {
        byDay.set(key, { sum: a.sentimentScore, count: 1, ts });
      }
    }
    return Array.from(byDay.entries())
      .map(([date, { sum, count, ts }]) => ({
        date,
        score: count > 0 ? Number((sum / count).toFixed(3)) : 0,
        ts,
      }))
      .sort((a, b) => a.ts - b.ts)
      .map(({ date, score }) => ({ date, score }));
  }, [alerts]);

  // 2. Sentiment distribution (donut) — from weather breakdown
  const sentimentPieData = useMemo(() => {
    if (!kpis?.breakdown) return [];
    return [
      { name: "Positive", value: kpis.breakdown.positive, fill: ACCENT },
      { name: "Neutral", value: kpis.breakdown.neutral, fill: "#737373" },
      { name: "Negative", value: kpis.breakdown.negative, fill: "#ef4444" },
    ];
  }, [kpis]);

  // 3. Source distribution (bar) — from weather mainSources
  const sourceBarData = useMemo(
    () => sources.map((s) => ({ name: s.name, articles: s.articles })),
    [sources],
  );

  // 4. AI visibility by engine — bars colored by citation sentiment
  const aiVisibilityData = useMemo(
    () =>
      aiEngines.map((p) => ({
        engine: p.platform,
        confidence: Math.round((p.confidence ?? 0) * 100),
        cited: p.cited ? 1 : 0,
        sentiment: p.sentiment ?? "neutral",
        fill:
          p.sentiment === "positive"
            ? ACCENT
            : p.sentiment === "negative"
              ? "#ef4444"
              : "#737373",
      })),
    [aiEngines],
  );

  // 5. Topic volume (area) — from /api/console/topics
  const topicsData = useMemo(
    () => topics.map((t) => ({ label: t.label, volume: t.count })),
    [topics],
  );

  // 6. Severity breakdown (radial) — derive 4 buckets from sentimentScore
  const severityData = useMemo(() => {
    const buckets = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const a of alerts) {
      const s = a.sentimentScore;
      if (s == null) {
        // Risk-assessment alerts carry severity directly
        if (a.severity === "critical") buckets.critical += 1;
        else buckets.high += 1;
      } else if (s < -0.7) buckets.critical += 1;
      else if (s < -0.5) buckets.high += 1;
      else if (s < -0.3) buckets.medium += 1;
      else buckets.low += 1;
    }
    const total = buckets.critical + buckets.high + buckets.medium + buckets.low;
    return [
      { name: "Critical", value: total > 0 ? Math.round((buckets.critical / total) * 100) : 0, count: buckets.critical, fill: "#ef4444" },
      { name: "High", value: total > 0 ? Math.round((buckets.high / total) * 100) : 0, count: buckets.high, fill: "#f59e0b" },
      { name: "Medium", value: total > 0 ? Math.round((buckets.medium / total) * 100) : 0, count: buckets.medium, fill: "#737373" },
      { name: "Low", value: total > 0 ? Math.round((buckets.low / total) * 100) : 0, count: buckets.low, fill: ACCENT },
    ];
  }, [alerts]);

  // Chart card + title styles (per spec)
  const chartCardStyle: React.CSSProperties = {
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    padding: "20px",
    background: "#ffffff",
  };
  const chartTitleStyle: React.CSSProperties = {
    fontSize: "11px",
    fontFamily: FONT.mono,
    color: "#737373",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: "12px",
  };
  const emptyChartStyle: React.CSSProperties = {
    height: "250px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#a3a3a3",
    fontFamily: FONT.mono,
    fontSize: "12px",
    background: "#fafafa",
    borderRadius: "6px",
    border: "1px dashed #e5e5e5",
  };
  const tooltipStyle: React.CSSProperties = {
    fontSize: "12px",
    fontFamily: FONT.mono,
    borderRadius: "6px",
    border: "1px solid #e5e5e5",
    boxShadow: SHADOW.card,
  };
  const axisTick = { fontSize: 10, fontFamily: FONT.mono, fill: "#737373" };

  return (
    <div className="dash-main" style={{ padding: "24px", background: "#ffffff", overflowX: "hidden" }}>
      {/* ─── Welcome banner ─── */}
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
          Good morning, {firstName}. Here's what they're saying about {companyName} today.
        </div>
        <div style={{ fontSize: "12px", color: "#737373", fontFamily: FONT.mono, marginTop: "6px" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* ─── Page title ─── */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
            {companyName}
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.02em" }}>
            Reputation Weather
          </h3>
        </div>
        {/* Toolbar: time-range + refresh + export */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Time range selector */}
          <div style={{ display: "flex", border: "1px solid #e5e5e5", borderRadius: "6px", overflow: "hidden" }}>
            {(["24h", "7d", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontFamily: FONT.mono,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: timeRange === r ? ACCENT : "#ffffff",
                  color: timeRange === r ? "#ffffff" : "#737373",
                  transition: "all 0.15s ease",
                  letterSpacing: "0.05em",
                }}
              >
                {r}
              </button>
            ))}
          </div>
          {/* Refresh button */}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              padding: "6px 12px",
              fontSize: "11px",
              fontFamily: FONT.mono,
              fontWeight: 600,
              border: "1px solid #e5e5e5",
              borderRadius: "6px",
              background: "#ffffff",
              color: "#525252",
              cursor: refreshing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
              opacity: refreshing ? 0.6 : 1,
            }}
            title={`Last refreshed: ${lastRefresh.toLocaleTimeString("en-US")}`}
          >
            <span style={{ display: "inline-block", transform: refreshing ? "rotate(360deg)" : "rotate(0deg)", transition: "transform 0.6s ease" }}>
              {refreshing ? "\u21BB" : "\u21BB"}
            </span>
            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
          {/* Export button */}
          <button
            onClick={exportSourcesCSV}
            disabled={sources.length === 0}
            style={{
              padding: "6px 12px",
              fontSize: "11px",
              fontFamily: FONT.mono,
              fontWeight: 600,
              border: "1px solid #e5e5e5",
              borderRadius: "6px",
              background: "#ffffff",
              color: "#525252",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
              opacity: sources.length === 0 ? 0.5 : 1,
            }}
          >
            <span>{"\u2193"}</span>
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* ─── Score widget ─── */}
      {loading ? (
        <div style={{ padding: "32px 24px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", marginBottom: "24px" }}>
          <SkeletonLoader accent={ACCENT} lines={2} height={48} />
        </div>
      ) : error ? (
        <div style={{ marginBottom: "24px" }}>
          <ErrorState accent={ACCENT} message="Can't reach reputation sources. Retrying…" />
        </div>
      ) : (
      <div
        style={{
          padding: "32px 24px",
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          marginBottom: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "24px",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: "clamp(48px, 10vw, 72px)",
              fontWeight: 700,
              color: skyColor,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {loading ? "—" : score}
          </div>
          <div style={{ fontSize: "12px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            / 100
          </div>
        </div>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 600, color: "#0a0a0a", marginBottom: "8px", letterSpacing: "-0.01em" }}>
            {kpis?.sky ?? "Partly cloudy"}
          </div>
          <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.5, marginBottom: "12px" }}>
            {kpis?.skyDescription ?? "Overall positive sentiment, with a few areas of attention."}
          </div>
          <div style={{ fontSize: "12px", fontFamily: FONT.mono, color: kpis?.trend === "up" ? ACCENT : kpis?.trend === "down" ? "#ef4444" : "#737373" }}>
            {kpis?.trend === "up" ? "\u2191" : kpis?.trend === "down" ? "\u2193" : "\u2192"} {kpis?.trendValue}
          </div>
        </div>
      </div>
      )}

      {/* ─── Sentiment breakdown ─── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
          Sentiment breakdown
        </div>
        <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", background: "#f4f4f5", marginBottom: "12px" }}>
          <div style={{ width: `${kpis?.breakdown.positive ?? 58}%`, background: ACCENT }} />
          <div style={{ width: `${kpis?.breakdown.neutral ?? 27}%`, background: "#e5e5e5" }} />
          <div style={{ width: `${kpis?.breakdown.negative ?? 15}%`, background: "#ef4444" }} />
        </div>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "12px", fontFamily: FONT.mono }}>
          <span style={{ color: ACCENT }}>
            <span style={{ fontWeight: 700 }}>{kpis?.breakdown.positive ?? 58}%</span>
            <span style={{ color: "#737373", marginLeft: "6px" }}>positive</span>
          </span>
          <span style={{ color: "#525252" }}>
            <span style={{ fontWeight: 700 }}>{kpis?.breakdown.neutral ?? 27}%</span>
            <span style={{ color: "#737373", marginLeft: "6px" }}>neutral</span>
          </span>
          <span style={{ color: "#ef4444" }}>
            <span style={{ fontWeight: 700 }}>{kpis?.breakdown.negative ?? 15}%</span>
            <span style={{ color: "#737373", marginLeft: "6px" }}>negative</span>
          </span>
        </div>
      </div>

      {/* ─── Analytics charts (recharts · real API data) ─── */}
      {loading ? (
        <div style={{ ...chartCardStyle, marginBottom: "24px" }}>
          <div style={chartTitleStyle}>Analytics</div>
          <SkeletonLoader accent={ACCENT} lines={2} height={200} />
        </div>
      ) : error ? (
        <div style={{ marginBottom: "24px" }}>
          <ErrorState accent={ACCENT} message="Can't reach analytics sources. Retrying…" />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {/* 1. Sentiment trend over time (LineChart + area fill) */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>Sentiment trend over time</div>
            {sentimentTrendData.length === 0 ? (
              <div style={emptyChartStyle}>No alert data in range.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sentimentTrendData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sentTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} />
                  <YAxis domain={[-1, 1]} tick={axisTick} tickLine={false} axisLine={false} width={32} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#737373" }} cursor={{ stroke: ACCENT, strokeOpacity: 0.3 }} />
                  <Area type="monotone" dataKey="score" stroke="none" fill="url(#sentTrendFill)" />
                  <Line type="monotone" dataKey="score" stroke={ACCENT} strokeWidth={2} dot={{ r: 3, fill: ACCENT }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 2. Sentiment distribution (donut) */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>Sentiment distribution</div>
            {sentimentPieData.length === 0 || sentimentPieData.every((s) => s.value === 0) ? (
              <div style={emptyChartStyle}>No sentiment data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={sentimentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {sentimentPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373" }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 3. Source distribution (bar) */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>Source distribution</div>
            {sourceBarData.length === 0 ? (
              <div style={emptyChartStyle}>No source data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sourceBarData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: `${ACCENT}08` }} />
                  <Bar dataKey="articles" fill={ACCENT} radius={[3, 3, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 4. AI visibility by engine (bar, colored by sentiment) */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>AI visibility by engine</div>
            {aiVisibilityData.length === 0 ? (
              <div style={emptyChartStyle}>No AI engine data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={aiVisibilityData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="engine" tick={axisTick} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} width={32} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: `${ACCENT}08` }} />
                  <Bar dataKey="confidence" radius={[3, 3, 0, 0]} maxBarSize={48}>
                    {aiVisibilityData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 5. Topic volume trend (area) */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>Topic volume trend</div>
            {topicsData.length === 0 ? (
              <div style={emptyChartStyle}>No topic data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={topicsData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="topicVolumeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: ACCENT, strokeOpacity: 0.3 }} />
                  <Area type="monotone" dataKey="volume" stroke={ACCENT} strokeWidth={2} fill="url(#topicVolumeFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 6. Severity breakdown (radial) */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>Severity breakdown</div>
            {severityData.every((s) => s.count === 0) ? (
              <div style={emptyChartStyle}>No alerts to classify.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" data={severityData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "#f4f4f5" }} dataKey="value" cornerRadius={4} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373" }} iconType="circle" />
                </RadialBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ─── Today's signals ─── */}
      {signals.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Today's signals ({filteredSignals.length})
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Sentiment filter chips */}
              {(["all", "positive", "neutral", "negative"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setSentimentFilter(f)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontFamily: FONT.mono,
                    fontWeight: 600,
                    border: `1px solid ${sentimentFilter === f ? ACCENT : "#e5e5e5"}`,
                    borderRadius: "12px",
                    background: sentimentFilter === f ? `${ACCENT}15` : "#ffffff",
                    color: sentimentFilter === f ? ACCENT : "#737373",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {f}
                </button>
              ))}
              <button
                onClick={exportSignalsCSV}
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
                title="Export signals to CSV"
              >
                {"\u2193"} CSV
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredSignals.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#737373", fontFamily: FONT.mono, fontSize: "12px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "6px" }}>
                No signals match this filter.
              </div>
            ) : (
              filteredSignals.map((signal, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "12px 16px",
                    background: "#ffffff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "6px",
                    flexWrap: "wrap",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 2px 8px ${ACCENT}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <span style={{ fontFamily: FONT.mono, fontSize: "12px", color: "#737373", minWidth: "48px" }}>{signal.time}</span>
                  <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: ACCENT, minWidth: "80px" }}>{signal.source}</span>
                  <span style={{ fontSize: "14px", color: "#0a0a0a", flex: 1, minWidth: "200px" }}>{signal.title}</span>
                  <span style={{ fontSize: "10px", fontFamily: FONT.mono, padding: "2px 8px", borderRadius: "2px", background: signal.weight === "strong" ? `${ACCENT}15` : signal.weight === "medium" ? "#73737315" : "#ef444415", color: signal.weight === "strong" ? ACCENT : signal.weight === "medium" ? "#737373" : "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {signal.weight}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── Sources table ─── */}
      {sources.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Main sources
          </div>
          <div style={{ border: "1px solid #e5e5e5", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "400px" }}>
                <thead>
                  <tr style={{ background: "#f4f4f5" }}>
                    <th style={thStyle}>Source</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Articles</th>
                    <th style={thStyle}>Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((src, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #e5e5e5" }}>
                      <td style={{ padding: "10px 16px", color: "#0a0a0a", fontWeight: 500 }}>{src.name}</td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: FONT.mono, color: "#525252" }}>{src.articles}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: FONT.mono,
                            padding: "2px 8px",
                            borderRadius: "2px",
                            background: src.sentiment === "positive" ? `${ACCENT}15` : src.sentiment === "negative" ? "#ef444415" : "#73737315",
                            color: src.sentiment === "positive" ? ACCENT : src.sentiment === "negative" ? "#ef4444" : "#737373",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {src.sentiment}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "left",
  fontFamily: "'Space Mono', monospace",
  fontSize: "10px",
  color: "#737373",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontWeight: 600,
};
